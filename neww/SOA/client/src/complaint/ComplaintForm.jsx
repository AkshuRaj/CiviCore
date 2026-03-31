
import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/forms.css";
import "./complaintForm.css";
import { useLanguage } from "../context/LanguageContext";

/* =========================================
   COUNTRY → STATE → CITY → AREA
========================================= */
const locationData = {
  India: {
    "Tamil Nadu": {
      Chennai: [
        "Teynampet",
        "Velachery",
        "Adyar",
        "Anna Nagar",
        "Perambur",+  
        
        "Kodambakkam",
        "Sholinganallur",
        "Tondiarpet"
      ],
      Coimbatore: [
        "Gandhipuram",
        "RS Puram",
        "Peelamedu",
        "Saibaba Colony",
        "Town Hall",
        "Race Course"
      ],
      Madurai: ["Anna Nagar", "KK Nagar", "Tallakulam"],
      Salem: ["Hasthampatti", "Fairlands"],
      Tiruchirappalli: ["Srirangam", "Thillai Nagar"]
    },

    Karnataka: {
      "Bengaluru Urban": [
        "Whitefield",
        "Koramangala",
        "Indiranagar",
        "Jayanagar",
        "HSR Layout",
        "Yelahanka",
        "Malleshwaram"
      ],
      Mysuru: ["Vijayanagar", "Hebbal"],
      Mangaluru: ["Surathkal", "Kadri"]
    },

    Kerala: {
      Ernakulam: [
        "Kochi",
        "Kaloor",
        "Edappally",
        "Fort Kochi",
        "Mattancherry"
      ],
      Thiruvananthapuram: ["Kazhakkoottam", "Pattom", "Kowdiar"],
      Kozhikode: ["Kallayi", "Mavoor Road", "Nadakkavu"]
    },

    /* ===== OTHER INDIAN STATES (SAFE PLACEHOLDERS) ===== */
    "Andhra Pradesh": {
      Vijayawada: ["Auto Nagar"],
      Visakhapatnam: ["MVP Colony"]
    },
    Telangana: {
      Hyderabad: ["Banjara Hills", "Madhapur"]
    },
    Maharashtra: {
      Mumbai: ["Andheri", "Dadar"],
      Pune: ["Hinjewadi"]
    },
    Gujarat: {
      Ahmedabad: ["Navrangpura"]
    },
    Rajasthan: {
      Jaipur: ["Malviya Nagar"]
    },
    Delhi: {
      Delhi: ["Karol Bagh", "Dwarka"]
    },
    "Uttar Pradesh": {
      Lucknow: ["Alambagh"]
    },
    "West Bengal": {
      Kolkata: ["Salt Lake"]
    },
    Odisha: {
      Bhubaneswar: ["Patia"]
    },
    Punjab: {
      Chandigarh: ["Sector 17"]
    },
    Haryana: {
      Gurugram: ["DLF Phase 3"]
    },
    Bihar: {
      Patna: ["Kankarbagh"]
    },
    Goa: {
      Panaji: ["Miramar"]
    },
    "Madhya Pradesh": {
      Bhopal: ["Arera Colony"]
    },
    Uttarakhand: {
      Dehradun: ["Rajpur Road"]
    },
    Assam: {
      Guwahati: ["Dispur"]
    },
    Jharkhand: {
      Ranchi: ["Lalpur"]
    },
    Chhattisgarh: {
      Raipur: ["Pandri"]
    },
    Sikkim: {
      Gangtok: ["MG Road"]
    },
    Manipur: {
      Imphal: ["Singjamei"]
    },
    Meghalaya: {
      Shillong: ["Laitumkhrah"]
    },
    Mizoram: {
      Aizawl: ["Zarkawt"]
    },
    Nagaland: {
      Kohima: ["PR Hill"]
    },
    Tripura: {
      Agartala: ["Banamalipur"]
    },
    "Arunachal Pradesh": {
      Itanagar: ["Naharlagun"]
    },
    "Himachal Pradesh": {
      Shimla: ["Mall Road"]
    },
    "Jammu & Kashmir": {
      Srinagar: ["Lal Chowk"]
    },
    Ladakh: {
      Leh: ["Main Market"]
    },
    Puducherry: {
      Puducherry: ["White Town"]
    },
    Chandigarh: {
      Chandigarh: ["Sector 22"]
    },
    Lakshadweep: {
      Kavaratti: ["Beach Road"]
    },
    "Andaman and Nicobar Islands": {
      PortBlair: ["Aberdeen Bazaar"]
    },
    "Dadra & Nagar Haveli and Daman & Diu": {
      Daman: ["Devka Beach"]
    }
  }
};

export default function ComplaintForm() {
  const navigate = useNavigate();
  const [data, setData] = useState({
    name: "",
    email: "",
    phone: "",
    category: "Electricity",
    description: "",
    country: "",
    state: "",
    city: "",
    location: ""
  });

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const [msg, setMsg] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);

  // Voice recognition + TTS
  const recognitionRef = useRef(null);
  const utteranceRef = useRef(null);
  const [listeningField, setListeningField] = useState(null);
  const [lastTranscript, setLastTranscript] = useState("");
  const [speechSupported, setSpeechSupported] = useState(true);
  const { language } = useLanguage();
  const maxWords = 300;

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const speakPrompt = useCallback((fieldName, onPromptEnd) => {
    try {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      const prompt = {
        description: "Please describe the problem in your own words.",
        name: "Please say your full name.",
        city: "Please say your city name.",
        location: "Please say the area or locality",
        email: "Please say your email address",
        phone: "Please say your 10 digit phone number"
      }[fieldName] || `Please provide input for ${fieldName}`;

      const u = new SpeechSynthesisUtterance(prompt);
      u.lang = language || 'en-IN';
      u.rate = 0.95;
      u.onend = () => { if (onPromptEnd) onPromptEnd(); };
      u.onerror = () => { if (onPromptEnd) onPromptEnd(); };
      utteranceRef.current = u;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS error', e);
      if (onPromptEnd) onPromptEnd();
    }
  }, []);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) { }
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current = null;
      }
    } catch (e) {
      console.warn('stopListening error', e);
    } finally {
      setListeningField(null);
    }
  }, []);

  const handleTranscript = useCallback((name, text) => {
    if (!text) return;
    const cleaned = text.trim();
    const normalize = s => s.toLowerCase();

    if (name === 'city') {
      // small fuzzy-match behavior
      const options = ['Chennai','Coimbatore','Madurai','Mumbai','Pune'];
      const found = options.find(opt => normalize(opt).includes(normalize(cleaned)) || normalize(cleaned).includes(normalize(opt)));
      setData(prev => ({ ...prev, city: found || cleaned }));
      return;
    }

    if (name === 'description') {
      setData(prev => ({ ...prev, description: (prev.description ? prev.description + ' ' : '') + cleaned }));
      return;
    }

    setData(prev => ({ ...prev, [name]: cleaned }));
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
    rec.onend = () => { setListeningField(null); };
    return rec;
  }, [handleTranscript, stopListening]);

  const startListening = useCallback((fieldName) => {
    if (!speechSupported) { alert('Speech recognition not supported'); return; }
    stopListening();
    const rec = createRecognition(fieldName);
    if (!rec) { alert('Speech recognition not available'); return; }
    recognitionRef.current = rec;
    setLastTranscript('');
    setListeningField(fieldName);

    try {
      const startRec = () => {
        try { rec.start(); } catch (e) { console.error('start error', e); setListeningField(null); recognitionRef.current = null; }
      };
      speakPrompt(fieldName, startRec);
      // fallback
      setTimeout(startRec, 3500);
    } catch (e) { console.error('startListening err', e); setListeningField(null); }
  }, [speechSupported, createRecognition, stopListening, speakPrompt]);

  const submit = async (e) => {
    e.preventDefault();

      try {
        const res = await axios.post("http://localhost:5000/complaints", data);
        const message = res.data?.message || "Complaint Submitted Successfully";
        setMsg(message);
        setModalSuccess(true);
        setModalOpen(true);
        // Clear the form so user can submit another complaint if needed
        setData({
          name: "",
          email: "",
          phone: "",
          category: "Electricity",
          description: "",
          country: "",
          state: "",
          city: "",
          location: ""
        });
        setCountry("");
        setState("");
        setCity("");
      } catch (err) {
        console.error('Complaint submission error:', err);
        const errorMsg = err.response?.data?.message || "Submission Failed";
        setMsg(errorMsg);
        setModalSuccess(false);
        setModalOpen(true);
      }
  };

  const countWords = (text) => { if (!text) return 0; return text.trim().split(/\s+/).filter(Boolean).length; };

  return (
    <div style={{ padding: "40px" }}>
      <h2>Complaint Registration</h2>
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ width: 420, background: '#fff', borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', padding: 20 }}>
            <h3 style={{ marginTop: 0 }}>{modalSuccess ? 'Success' : 'Error'}</h3>
            <p style={{ margin: '12px 0', color: modalSuccess ? '#155724' : '#721c24' }}>{msg}</p>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button onClick={() => setModalOpen(false)} style={{ padding: '8px 14px', background: modalSuccess ? '#28a745' : '#dc3545', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>OK</button>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="complaint-form" style={{ maxWidth: "880px" }}>
        <div className="form-card">
          <h3>Reporter</h3>
          <label>Name *</label>
          <div className="input-with-voice">
            <input required value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} />
            <button type="button" className={`voice-btn ${listeningField === 'name' ? 'listening' : ''}`} onClick={() => listeningField === 'name' ? stopListening() : startListening('name')}>{listeningField === 'name' ? 'Listening…' : '🎤'}</button>
          </div>

          <label>Email *</label>
          <div className="input-with-voice">
            <input type="email" required value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} />
            <button type="button" className={`voice-btn ${listeningField === 'email' ? 'listening' : ''}`} onClick={() => listeningField === 'email' ? stopListening() : startListening('email')}>{listeningField === 'email' ? 'Listening…' : '🎤'}</button>
          </div>

          <label>Phone *</label>
          <div className="input-with-voice">
            <input maxLength="10" required value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} />
            <button type="button" className={`voice-btn ${listeningField === 'phone' ? 'listening' : ''}`} onClick={() => listeningField === 'phone' ? stopListening() : startListening('phone')}>{listeningField === 'phone' ? 'Listening…' : '🎤'}</button>
          </div>
        </div>

        <div className="form-card">
          <h3>Location</h3>
          <label>Country *</label>
          <select required value={country} onChange={(e) => { setCountry(e.target.value); setState(""); setCity(""); setData({ ...data, country: e.target.value, state: "", city: "", location: "" }); }}>
            <option value="">Select Country</option>
            {Object.keys(locationData).map(c => <option key={c}>{c}</option>)}
          </select>

          <label>State *</label>
          <select required disabled={!country} value={state} onChange={(e) => { setState(e.target.value); setCity(""); setData({ ...data, state: e.target.value, city: "", location: "" }); }}>
            <option value="">Select State</option>
            {country && Object.keys(locationData[country]).map(s => <option key={s}>{s}</option>)}
          </select>

          <label>City *</label>
          <div className="input-with-voice">
            <select required disabled={!state} value={city} onChange={(e) => { setCity(e.target.value); setData({ ...data, city: e.target.value, location: "" }); }}>
              <option value="">Select City</option>
              {country && state && Object.keys(locationData[country][state]).map(c => <option key={c}>{c}</option>)}
            </select>
            <button type="button" className={`voice-btn ${listeningField === 'city' ? 'listening' : ''}`} onClick={() => listeningField === 'city' ? stopListening() : startListening('city')}>{listeningField === 'city' ? 'Listening…' : '🎤'}</button>
          </div>

          <label>Area *</label>
          <div className="input-with-voice">
            <select required disabled={!city} value={data.location} onChange={(e) => setData({ ...data, location: e.target.value })}>
              <option value="">Select Area</option>
              {country && state && city && locationData[country][state][city].map(a => (<option key={a} value={a}>{a}</option>))}
            </select>
            <button type="button" className={`voice-btn ${listeningField === 'location' ? 'listening' : ''}`} onClick={() => listeningField === 'location' ? stopListening() : startListening('location')}>{listeningField === 'location' ? 'Listening…' : '🎤'}</button>
          </div>
        </div>

        <div className="form-card">
          <h3>Complaint</h3>
          <label>Category *</label>
          <select value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>
            <option>Electricity</option>
            <option>Water</option>
            <option>Roads</option>
            <option>Sanitation</option>
          </select>

          <label>Description *</label>
          <div className="input-with-voice" style={{ alignItems: 'flex-start' }}>
            <textarea required value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} rows={6} />
            <button type="button" className={`voice-btn ${listeningField === 'description' ? 'listening' : ''}`} onClick={() => listeningField === 'description' ? stopListening() : startListening('description')}>{listeningField === 'description' ? 'Listening…' : '🎤'}</button>
          </div>
          <div className="help">{countWords(data.description)} / {maxWords} words</div>
          {lastTranscript && <div className="voice-feedback" aria-live="polite">Heard: {lastTranscript}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">Submit Complaint</button>
        </div>
      </form>
    </div>
  );
}









