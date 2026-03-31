import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import "./category.css";
import { useLanguage } from '../../context/LanguageContext';
import i18n, { numberWords, categories as i18nCategories, numberToCategoryId, getCategoryTitle, getCategoryDescription } from '../../utils/i18n';


const languagePrompts = {
  'en-IN': { label: 'English', prompt: 'Please say the category number from one to eight.' },
  'ta-IN': { label: 'Tamil', prompt: 'தயவு செய்து ஒரு முதல் எட்டு வரை பிரிவு எண் சொல்லுங்கள்.' },
  'hi-IN': { label: 'Hindi', prompt: 'कृपया एक से आठ के बीच श्रेणी संख्या बोलें।' },
};

// build token map dynamically from numberWords to be resilient
const tokenToNumber = (() => {
  const map = {};
  // digits
  for (let i = 1; i <= 8; i++) map[String(i)] = i;

  Object.entries(numberWords).forEach(([lang, arr]) => {
    arr.forEach((word, idx) => {
      if (!word) return;
      map[word.toString().toLowerCase()] = idx + 1;
    });
  });

  // include a few extra tokens
  map['one'] = 1; map['two'] = 2; map['three'] = 3; map['four'] = 4; map['five'] = 5; map['six'] = 6; map['seven'] = 7; map['eight'] = 8;
  map['एक'] = 1; map['दो'] = 2; map['तीन'] = 3; map['चार'] = 4; map['पांच'] = 5; map['छह'] = 6; map['सात'] = 7; map['आठ'] = 8;

  return map;
})();

function extractNumberFromText(text) {
  if (!text) return null;
  const normalized = text.toLowerCase().trim();

  // try extract digits first
  const digitMatch = normalized.match(/\d+/);
  if (digitMatch) return Number(digitMatch[0]);

  // split into tokens (works for scripts too)
  const tokens = normalized.replace(/[,.?]/g, ' ').split(/\s+/).filter(Boolean);
  for (const t of tokens) {
    if (tokenToNumber[t] && typeof tokenToNumber[t] === 'number') return tokenToNumber[t];
  }

  // fallback: exact match
  if (tokenToNumber[normalized] && typeof tokenToNumber[normalized] === 'number') return tokenToNumber[normalized];

  return null;
}

function localizedTitle(cat, idx, lang) {
  if (!cat) return `Category ${idx + 1}`;
  // If title is object with translations
  if (cat.title && typeof cat.title === 'object') {
    return cat.title[lang] || cat.title['en-IN'] || Object.values(cat.title)[0] || cat.id;
  }
  // Prefer i18n lookup by id when available to ensure translation
  if (cat.id) {
    const t = getCategoryTitle(cat.id, lang);
    if (t) return t;
  }
  // fallback to string title
  if (cat.title && typeof cat.title === 'string') return cat.title;
  return `Category ${idx + 1}`;
}

function localizedDesc(cat, lang) {
  if (!cat) return '';
  if (cat.description && typeof cat.description === 'object') {
    return cat.description[lang] || cat.description['en-IN'] || Object.values(cat.description)[0] || '';
  }
  if (cat.id) {
    const d = getCategoryDescription(cat.id, lang);
    if (d) return d;
  }
  if (cat.description && typeof cat.description === 'string') return cat.description;
  return '';
}

function CategoryPage({ onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Voice recognition state
  const { language, setLanguage } = useLanguage();
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('');
  const [recognizedText, setRecognizedText] = useState('');
  const [pendingNumber, setPendingNumber] = useState(null);
  const [pendingCategory, setPendingCategory] = useState(null);
  const [readList, setReadList] = useState(true);

  const recognitionRef = useRef(null);

  useEffect(() => {
    // Try fetching categories from backend; fall back to built-in list
    fetch("/api/categories")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        // Expecting array of { id, title, description } from backend. If shape differs, fall back to built-in i18n categories
        if (Array.isArray(data) && data.length && data[0].id) {
          setCategories(data);
        } else {
          setCategories(i18nCategories);
        }
      })
      .catch(() => {
        // fallback to built-in i18n categories
        setCategories(i18nCategories);
        setError(null);
      })
      .finally(() => setLoading(false));

    return () => {
      // cleanup recognition if unmounted
      if (recognitionRef.current) {
        try { recognitionRef.current.onresult = null; recognitionRef.current.onend = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const handleApply = (cat) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
      return;
    }
    navigate('/user/complaint/new', { state: { category: cat, fromProtectedRoute: true } });
  };

  const startRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition not supported. Please use Chrome or an equivalent browser.');
      return;
    }

    try {
      // stop any existing instance safely
      if (recognitionRef.current) {
        try { recognitionRef.current.onresult = null; recognitionRef.current.onend = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch (e) {}
        recognitionRef.current = null;
      }

      const rec = new SpeechRecognition();
      recognitionRef.current = rec;
      rec.lang = language;
      rec.interimResults = true; // show interim results for better UX
      rec.continuous = false;
      rec.maxAlternatives = 3;

      rec.onstart = () => {
        setListening(true);
        setStatus('Listening... 🎧');
        setRecognizedText('');
        setPendingNumber(null);
        setPendingCategory(null);
      };

      rec.onaudiostart = () => {
        // audio stream started
      };

      rec.onspeechstart = () => {
        setStatus('Speaking detected...');
      };

      rec.onresult = (event) => {
        // combine interim and final results
        let interim = '';
        let final = '';
        for (let i = 0; i < event.results.length; i++) {
          const r = event.results[i];
          const t = r[0]?.transcript || '';
          if (r.isFinal) final += t + ' ';
          else interim += t + ' ';
        }
        const display = (final + interim).trim();
        setRecognizedText(display);

        if (final.trim()) {
          setStatus('Captured ✅');
          const num = extractNumberFromText(final.trim());
          if (num && num >= 1 && num <= 8) {
            const catId = numberToCategoryId[num];
            setPendingNumber(num);
            setPendingCategory(catId);

            // localized confirmation phrase
            const catTitle = getCategoryTitle(catId, language);
            const confirmPhrases = {
              'en-IN': `You selected ${catTitle}. Please confirm by clicking Confirm.`,
              'ta-IN': `${catTitle} தேர்ந்தெடுக்கப்பட்டது. உறுதிசெய்வதற்காக Confirm அழுத்தவும்.`,
              'hi-IN': `${catTitle} चुना गया है। पुष्टि करने के लिए Confirm पर क्लिक करें।`,
            };

            const confirmUtter = new SpeechSynthesisUtterance(confirmPhrases[language] || confirmPhrases['en-IN']);
            
            // For Tamil and Hindi, try language-specific voices first
            if (language === 'ta-IN' || language === 'hi-IN') {
              confirmUtter.lang = language;
              // Get available voices and try to find one for the language
              const voices = window.speechSynthesis.getVoices();
              const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
              if (langVoice) {
                confirmUtter.voice = langVoice;
              }
            } else {
              confirmUtter.lang = 'en-IN';
            }
            
            window.speechSynthesis.speak(confirmUtter);
          } else {
            setStatus('Could not map to a category. Try again.');
          }
        }
      };

      rec.onerror = (e) => {
        console.error('recognition error', e);
        if (e && e.error === 'not-allowed') setStatus('Microphone permission denied. Allow microphone and try again.');
        else setStatus('Error during recognition. Speak clearly and try again.');
      };

      rec.onend = () => {
        // recognition ended (either by silence or explicit stop)
        setListening(false);
      };

      rec.start();
    } catch (e) {
      console.error('Failed to start recognition', e);
      setStatus('Failed to start recognition');
      setListening(false);
    }
  };

  const startListening = () => {
    // Cancel any ongoing speech synthesis and then start recognition
    try {
      window.speechSynthesis.cancel();
    } catch (e) {}

    const prompt = languagePrompts[language].prompt;
    const utter = new SpeechSynthesisUtterance(prompt);
    
    // For Tamil and Hindi, try language-specific voices first
    if (language === 'ta-IN' || language === 'hi-IN') {
      utter.lang = language;
      // Get available voices and try to find one for the language
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (langVoice) {
        utter.voice = langVoice;
      }
    } else {
      utter.lang = 'en-IN';
    }
    
    utter.onend = () => startRecognition();
    utter.onerror = (e) => {
      console.warn('Speech synthesis error for language:', language, e);
      startRecognition();
    };

    try {
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error('Speech synthesis failed', e);
      startRecognition();
    }
  };

  const readAndAsk = () => {
    // speak the numbered list in selected language, then start recognition
    const words = numberWords[language] || numberWords['en-IN'];
    const parts = [];
    i18nCategories.forEach((cat, idx) => {
      const numWord = words[idx] || String(idx + 1);
      const title = localizedTitle(cat, idx, language);
      parts.push(`${numWord}. ${title}`);
    });
    parts.push(languagePrompts[language].prompt);

    const utter = new SpeechSynthesisUtterance(parts.join('. '));
    
    // For Tamil and Hindi, try language-specific voices first
    if (language === 'ta-IN' || language === 'hi-IN') {
      utter.lang = language;
      // Get available voices and try to find one for the language
      const voices = window.speechSynthesis.getVoices();
      const langVoice = voices.find(v => v.lang.startsWith(language.split('-')[0]));
      if (langVoice) {
        utter.voice = langVoice;
      }
    } else {
      utter.lang = 'en-IN';
    }
    
    utter.onend = () => startRecognition();
    utter.onerror = (e) => {
      console.warn('Speech synthesis error for language:', language, e);
      startRecognition();
    };

    try {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    } catch (e) {
      console.error('Speech synthesis failed', e);
      startRecognition();
    }
  };


  const stopListening = () => {
    try {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.stop();
      }
    } catch (e) {
      console.warn('stopListening error', e);
    } finally {
      recognitionRef.current = null;
      try { window.speechSynthesis.cancel(); } catch (e) {}
      setListening(false);
      setStatus('Stopped');
    }
  };

  const confirmSelection = () => {
    if (!pendingCategory || !pendingNumber) return;
    handleApply(pendingCategory);
  };

  const cancelSelection = () => {
    setPendingNumber(null);
    setPendingCategory(null);
    setRecognizedText('');
    setStatus('Selection canceled');
  };



  const categoryContent = (
    <div className="category-page">
      <h2 className="category-title">Choose a Complaint Category</h2>

      <div className="voice-controls" style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: 8 }}>
          {Object.entries(languagePrompts).map(([code, meta]) => (
            <option key={code} value={code}>{meta.label}</option>
          ))}
        </select>

        <button onClick={startListening} className="apply-btn">🎙 Start</button>
        <button onClick={readAndAsk} className="apply-btn">🔈 Read & Ask</button>
        <button onClick={stopListening} className="apply-btn" disabled={!listening}>⏹ Stop</button>

        <div className="voice-status" style={{ marginLeft: 12 }}>
          <strong>Status:</strong> {status}
        </div>
      </div>

      {recognizedText && (
        <div className="recognized-text" style={{ marginBottom: 12 }}>
          <strong>Recognized:</strong> {recognizedText}
        </div>
      )}

      {pendingCategory && (
        <div className="confirmation" style={{ border: '1px solid #ddd', padding: 12, marginBottom: 12, borderRadius: 8 }}>
          <div>Detected category: <strong>{getCategoryTitle(pendingCategory, language)}</strong> ({numberWords[language] ? numberWords[language][pendingNumber - 1] : `#${pendingNumber}`})</div>
          <div style={{ marginTop: 8 }}>
            <button className="apply-btn" onClick={confirmSelection}>Confirm</button>
            <button className="apply-btn" onClick={cancelSelection} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}

      {loading && <p className="muted">Loading categories…</p>}
      {error && <p className="error">{error}</p>}

      <div className="category-grid">
        {categories.map((cat, idx) => (
          <div key={cat.id} className="category-card">
            <div className="category-card-body">
              <h3>{(numberWords[language] ? numberWords[language][idx] + ' - ' : (idx + 1) + ' - ') + localizedTitle(cat, idx, language)}</h3>
              <p className="category-desc">{localizedDesc(cat, language)}</p>
            </div>
            <div className="category-card-footer">
              <button className="apply-btn" onClick={() => handleApply(cat.id)}>
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );



  return categoryContent;
}

export default CategoryPage;
