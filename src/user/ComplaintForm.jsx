import { useState, useEffect, useRef, useCallback } from "react";
import "./complaintForm.css";

import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { getCategoryTitle, formLabels } from '../utils/i18n';
import { fetchWithAuth } from '../utils/apiClient';
import UserSidebar from './UserSidebar';

function ComplaintForm({ initialCategory = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const routedCategory = location?.state?.category;
  const { language } = useLanguage();

  const [formData, setFormData] = useState({
    title: "",
    name: "",
    city: "",
    street: "",
    address: "",
    landmark: "",
    category: routedCategory || initialCategory || "",
    description: "",
    priority: "Normal",
    contact_time: "Morning",
    proof: null,
  });

  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const maxWords = 300;

  // --- Voice recognition state & helpers ---
  const recognitionRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);
  const [lastTranscript, setLastTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  // Function to speak prompt using text-to-speech
  const speakPrompt = useCallback((fieldName, onPromptEnd) => {
    try {
      // Cancel any existing speech
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }

      const labels = formLabels[language] || formLabels['en-IN'];
      const prompt = labels.voicePrompts?.[fieldName] || `Please provide input for ${fieldName}`;

      const utterance = new SpeechSynthesisUtterance(prompt);
      
      // For Tamil and Hindi, try language-specific voices first, fall back to English
      if (language === 'ta-IN' || language === 'hi-IN') {
        utterance.lang = language;
        // Get available voices and try to find one for the language
        const voices = window.speechSynthesis.getVoices();
        const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
        if (langVoice) {
          utterance.voice = langVoice;
        }
      } else {
        utterance.lang = 'en-IN';
      }
      
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 1;

      // Handle when prompt finishes speaking
      utterance.onend = () => {
        if (onPromptEnd) {
          onPromptEnd();
        }
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis error for language:', language, e);
        // Still try to listen even if speech fails
        if (onPromptEnd) {
          onPromptEnd();
        }
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Text-to-speech error:', e);
      // Still callback even if error
      if (onPromptEnd) {
        onPromptEnd();
      }
    }
  }, [language]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { /* ignore */ }
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current = null;
      }
    } catch (e) {
      console.warn('Stop listening failed', e);
    } finally {
      setListeningField(null);
    }
  }, []);

  const handleTranscript = useCallback((name, text) => {
    if (!text) return;
    const cleaned = text.trim();
    const normalize = (s) => s.toLowerCase();

    if (name === 'city') {
      const options = ['City A', 'City B', 'Zone 1'];
      const found = options.find(opt => normalize(opt).includes(normalize(cleaned)) || normalize(cleaned).includes(normalize(opt)));
      setFormData(prev => ({ ...prev, city: found || cleaned }));
      return;
    }

    if (name === 'priority') {
      const map = { normal: 'Normal', high: 'High', emergency: 'Emergency' };
      const key = Object.keys(map).find(k => normalize(cleaned).includes(k) || k.includes(normalize(cleaned)));
      setFormData(prev => ({ ...prev, priority: map[key] ?? cleaned }));
      return;
    }

    if (name === 'contact_time') {
      const map = { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' };
      const key = Object.keys(map).find(k => normalize(cleaned).includes(k) || k.includes(normalize(cleaned)));
      setFormData(prev => ({ ...prev, contact_time: map[key] ?? cleaned }));
      return;
    }

    if (name === 'description') {
      setFormData(prev => ({ ...prev, description: (prev.description ? prev.description + ' ' : '') + cleaned }));
      return;
    }

    // default: replace the field
    setFormData(prev => ({ ...prev, [name]: cleaned }));
  }, []);

  const createRecognition = useCallback((fieldName) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return null;
    const rec = new SpeechRecognition();
    rec.lang = language || 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results).map(r => r[0].transcript).join(' ').trim();
      setLastTranscript(transcript);
      handleTranscript(fieldName, transcript);
    };

    rec.onerror = (ev) => {
      console.error('Speech recognition error', ev);
      alert('Speech recognition error. Please try again.');
      stopListening();
    };

    rec.onend = () => {
      setListeningField(null);
    };

    return rec;
  }, [language, handleTranscript, stopListening]);

  const startListening = useCallback((fieldName) => {
    if (!speechSupported) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }
    stopListening();
    const rec = createRecognition(fieldName);
    if (!rec) {
      alert('Speech recognition is not available.');
      return;
    }
    recognitionRef.current = rec;
    setLastTranscript('');
    setListeningField(fieldName);
    
    // Speak the prompt first, then start listening after the speech ends
    try {
      let timeoutId;
      
      const startRec = () => {
        // Clear any pending timeout
        if (timeoutId) clearTimeout(timeoutId);
        
        try {
          rec.start();
          console.log('Speech recognition started for field:', fieldName);
        } catch (e) {
          console.error('Error starting recognition:', e);
          alert('Unable to start speech recognition. Please try again.');
          setListeningField(null);
          recognitionRef.current = null;
        }
      };

      // Call speakPrompt with callback
      speakPrompt(fieldName, startRec);
      
      // Fallback timeout - start listening after 4 seconds if speech hasn't ended
      timeoutId = setTimeout(startRec, 4000);
      
    } catch (e) {
      console.error('start error', e);
      alert('Unable to start speech recognition.');
      setListeningField(null);
      recognitionRef.current = null;
    }
  }, [speechSupported, createRecognition, stopListening, speakPrompt]);

  const labels = formLabels[language] || formLabels['en-IN'];

  useEffect(() => {
    if (initialCategory) setFormData((s) => ({ ...s, category: initialCategory }));
  }, [initialCategory]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const countWords = (text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(Boolean).length;
  };

  const validate = () => {
    const errs = {};
    if (!formData.city) errs.city = labels.errors.city;
    if (!formData.street) errs.street = labels.errors.street;
    if (!formData.address) errs.address = labels.errors.address;
    if (!formData.title) errs.title = labels.errors.title;
    if (!formData.description) errs.description = labels.errors.description;
    if (countWords(formData.description) > maxWords) errs.description = labels.errors.descriptionTooLong(maxWords);
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    if (!token) {
      alert('Authentication required. Please log in again.');
      return;
    }

    console.log('Submitting complaint with token');
    setSubmitting(true);
    try {
      let res;

      if (formData.proof) {
        const fd = new FormData();
        fd.append("proof", formData.proof);
        fd.append("title", formData.title);
        fd.append("name", formData.name);
        fd.append("city", formData.city);
        fd.append("street", formData.street);
        fd.append("address", formData.address);
        fd.append("landmark", formData.landmark);
        fd.append("category", formData.category);
        fd.append("description", formData.description);
        fd.append("priority", formData.priority);
        fd.append("contact_time", formData.contact_time);

        console.log('Sending FormData complaint');
        res = await fetchWithAuth('http://localhost:5000/api/complaints', { 
          method: "POST", 
          body: fd 
        });
      } else {
        const payload = { 
          title: formData.title,
          name: formData.name,
          city: formData.city,
          street: formData.street,
          address: formData.address,
          landmark: formData.landmark,
          category: formData.category,
          description: formData.description,
          priority: formData.priority,
          contact_time: formData.contact_time,
        };
        console.log('Sending JSON complaint with payload:', payload);
        res = await fetchWithAuth('http://localhost:5000/api/complaints', {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const text = await res.text();
      let body = {};
      try {
        body = text ? JSON.parse(text) : {};
      } catch (parseErr) {
        console.warn('Response not JSON:', text, parseErr);
      }

      if (!res.ok) {
        const errMsg = body.error || body.message || res.statusText || 'Failed to submit';
        throw new Error(errMsg);
      }

      alert(body.message || labels.success.registered(body?.id));

      // Notify other pages to refresh their server-backed data
      try {
        window.dispatchEvent(new Event('mycomplaints:updated'));
        // Trigger stats refresh on dashboard
        console.log('Dispatching stats:updated event');
        window.dispatchEvent(new Event('stats:updated'));
      } catch (e) {
        console.warn('Failed to dispatch update events', e);
      }

      // reset minimal fields
      setFormData({
        title: "",
        name: "",
        city: "",
        street: "",
        address: "",
        landmark: "",
        category: initialCategory || "",
        description: "",
        priority: "Normal",
        contact_time: "Morning",
        proof: null,
      });
      setErrors({});

      // navigate to dashboard and show My Complaints
      try {
        navigate('/', { state: { show: 'complaints' } });
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Failed to submit complaint. Please try again.';
      alert(msg);
      setErrors((prev) => ({ ...prev, global: msg }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    // Prefer going back in history when possible, otherwise go to categories
    try {
      if (window.history && window.history.length > 1) {
        navigate(-1);
      } else {
        navigate('/categories');
      }
    } catch (e) {
      navigate('/categories');
    }
  };

  const displayedCategory = formData.category;

  const formContent = (
    <div className="complaint-form-page">
      <div className="form-header">
        <button className="small-back-btn" onClick={handleBack} aria-label="Back">←</button>
        <div className="form-title-area">
          <h2 className="form-heading">{labels.heading}</h2>
          {displayedCategory && (
            <div className="category-pill">{getCategoryTitle(displayedCategory, language)}</div>
          )}
        </div>
      </div>

      <form className="complaint-form" onSubmit={handleSubmit}>


        {/* Section 1: Location Information */}
        <div className="form-card">
          <h3>{labels.locationHeading}</h3>

          <div className="two-col">
            <div>
              <label>{labels.cityLabel} <span className="required">*</span></label>
              <div className="input-with-voice">
                <select name="city" value={formData.city} onChange={handleChange}>
                  <option value="">{labels.selectCityOption}</option>
                  <option value="City A">City A</option>
                  <option value="City B">City B</option>
                  <option value="Zone 1">Zone 1</option>
                </select>
                <button type="button" className={`voice-btn ${listeningField === 'city' ? 'listening' : ''}`} onClick={() => listeningField === 'city' ? stopListening() : startListening('city')} aria-pressed={listeningField === 'city'} aria-label={listeningField === 'city' ? 'Stop listening' : 'Record city via voice'}>
                  {listeningField === 'city' ? 'Listening…' : '🎤'}
                </button>
              </div>
              {errors.city && <div className="field-error">{errors.city}</div>}
            </div>

            <div>
              <label>{labels.streetLabel} <span className="required">*</span></label>
              <div className="input-with-voice">
                <input name="street" type="text" value={formData.street} onChange={handleChange} />
                <button type="button" className={`voice-btn ${listeningField === 'street' ? 'listening' : ''}`} onClick={() => listeningField === 'street' ? stopListening() : startListening('street')} aria-pressed={listeningField === 'street'} aria-label={listeningField === 'street' ? 'Stop listening' : 'Record street via voice'}>
                  {listeningField === 'street' ? 'Listening…' : '🎤'}
                </button>
              </div>
              {errors.street && <div className="field-error">{errors.street}</div>}
            </div>
          </div>

          <label>{labels.addressLabel} <span className="required">*</span></label>
          <div className="input-with-voice">
            <input name="address" type="text" value={formData.address} onChange={handleChange} />
            <button type="button" className={`voice-btn ${listeningField === 'address' ? 'listening' : ''}`} onClick={() => listeningField === 'address' ? stopListening() : startListening('address')} aria-pressed={listeningField === 'address'} aria-label={listeningField === 'address' ? 'Stop listening' : 'Record address via voice'}>
              {listeningField === 'address' ? 'Listening…' : '🎤'}
            </button>
          </div>
          {errors.address && <div className="field-error">{errors.address}</div>} 

          <label>{labels.landmarkLabel}</label>
          <div className="input-with-voice">
            <input name="landmark" type="text" value={formData.landmark} onChange={handleChange} />
            <button type="button" className={`voice-btn ${listeningField === 'landmark' ? 'listening' : ''}`} onClick={() => listeningField === 'landmark' ? stopListening() : startListening('landmark')} aria-pressed={listeningField === 'landmark'} aria-label={listeningField === 'landmark' ? 'Stop listening' : 'Record landmark via voice'}>
              {listeningField === 'landmark' ? 'Listening…' : '🎤'}
            </button>
          </div>
        </div>

        {/* Section 2: Complaint Information */}
        <div className="form-card">
          <h3>{labels.complaintHeading}</h3>

          <label>{labels.complaintTitle} <span className="required">*</span></label>
          <div className="input-with-voice">
            <input name="title" type="text" value={formData.title} onChange={handleChange} />
            <button type="button" className={`voice-btn ${listeningField === 'title' ? 'listening' : ''}`} onClick={() => listeningField === 'title' ? stopListening() : startListening('title')} aria-pressed={listeningField === 'title'} aria-label={listeningField === 'title' ? 'Stop listening' : 'Record title via voice'}>
              {listeningField === 'title' ? 'Listening…' : '🎤'}
            </button>
          </div>
          {errors.title && <div className="field-error">{errors.title}</div>} 

          <label>{labels.complaintDescription} <span className="required">*</span></label>
          <div className="input-with-voice" style={{ alignItems: 'flex-start' }}>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={6} />
            <button type="button" className={`voice-btn ${listeningField === 'description' ? 'listening' : ''}`} onClick={() => listeningField === 'description' ? stopListening() : startListening('description')} aria-pressed={listeningField === 'description'} aria-label={listeningField === 'description' ? 'Stop listening' : 'Record description via voice'}>
              {listeningField === 'description' ? 'Listening…' : '🎤'}
            </button>
          </div>
          <div className="help">{labels.helpWords(countWords(formData.description), maxWords)}</div>
          {lastTranscript && <div className="voice-feedback" aria-live="polite">Heard: {lastTranscript}</div>}
          {errors.description && <div className="field-error">{errors.description}</div>} 

          <label>{labels.uploadProof}</label>
          <input name="proof" type="file" accept="image/*,video/*,audio/*" onChange={handleChange} />
        </div>

        {/* Section 3: Additional Details */}
        <div className="form-card">
          <h3>{labels.additionalHeading}</h3>

          <div className="two-col">
            <div>
              <label>{labels.priorityLabel}</label>
              <div className="input-with-voice">
                <select name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Normal">{labels.priorityOptions.Normal}</option>
                  <option value="High">{labels.priorityOptions.High}</option>
                  <option value="Emergency">{labels.priorityOptions.Emergency}</option>
                </select>
                <button type="button" className={`voice-btn ${listeningField === 'priority' ? 'listening' : ''}`} onClick={() => listeningField === 'priority' ? stopListening() : startListening('priority')} aria-pressed={listeningField === 'priority'} aria-label={listeningField === 'priority' ? 'Stop listening' : 'Record priority via voice'}>
                  {listeningField === 'priority' ? 'Listening…' : '🎤'}
                </button>
              </div>
            </div>

            <div>
              <label>{labels.contactTimeLabel}</label>
              <div className="input-with-voice">
                <select name="contact_time" value={formData.contact_time} onChange={handleChange}>
                  <option value="Morning">{labels.contactOptions.Morning}</option>
                  <option value="Afternoon">{labels.contactOptions.Afternoon}</option>
                  <option value="Evening">{labels.contactOptions.Evening}</option>
                </select>
                <button type="button" className={`voice-btn ${listeningField === 'contact_time' ? 'listening' : ''}`} onClick={() => listeningField === 'contact_time' ? stopListening() : startListening('contact_time')} aria-pressed={listeningField === 'contact_time'} aria-label={listeningField === 'contact_time' ? 'Stop listening' : 'Record preferred contact time via voice'}>
                  {listeningField === 'contact_time' ? 'Listening…' : '🎤'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action */}
        <div className="form-actions">
          <button type="submit" className="submit-btn" disabled={submitting}>
            {submitting ? labels.submittingButton : labels.submitButton}
          </button>
        </div>
      </form>
    </div>
  );

  // Check if rendered standalone (directly via router, not through UserDashboard)
  // If no location.state and no initialCategory prop, assume it's standalone
  const isStandalone = !location.state?.fromDashboard && !location.state?.fromProtectedRoute && !initialCategory;

  if (isStandalone) {
    return (
      <div className="user-dashboard-wrapper">
        <UserSidebar onNavigate={(page) => {
          if (page === 'form') return;
          navigate('/');
        }} />
        <div className="dashboard-container">
          {formContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      {formContent}
    </div>
  );
}

export default ComplaintForm;
