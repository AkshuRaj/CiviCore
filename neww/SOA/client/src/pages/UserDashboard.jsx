import { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import UserSidebar from "../components/UserSidebar";
import "../styles/forms.css";
import { useLanguage } from "../context/LanguageContext";
import {
  categories,
  getCategoryTitle,
  getCategoryDescription,
  numberWords
} from "../utils/i18n";

export default function UserDashboard() {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [recognitionRef, setRecognitionRef] = useState(null);
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef(null);
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    setSpeechSupported(!!(window.SpeechRecognition || window.webkitSpeechRecognition));
  }, []);

  const speakText = useCallback((text) => {
    try {
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language || 'en-IN';
      utterance.rate = 0.95;
      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('TTS error', e);
    }
  }, [language]);

  const stopListening = useCallback(() => {
    try {
      if (recognitionRef) {
        recognitionRef.stop();
        setRecognitionRef(null);
      }
      if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
    } catch (e) {
      console.warn('Stop error', e);
    } finally {
      setIsListening(false);
      setStatus("Stopped");
    }
  }, [recognitionRef]);

  const startListening = useCallback(() => {
    if (!speechSupported) {
      alert('Speech recognition not supported in your browser');
      return;
    }
    stopListening();
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.lang = language || 'en-IN';
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setStatus("Listening…");
    };

    rec.onresult = (ev) => {
      const transcript = Array.from(ev.results).map(r => r[0].transcript).join(' ').trim();
      console.log('Heard:', transcript);
      setStatus(`Heard: ${transcript}`);
    };

    rec.onerror = (ev) => {
      console.error('Recognition error', ev);
      setStatus('Recognition error');
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus("Ready");
    };

    setRecognitionRef(rec);
    try {
      rec.start();
    } catch (e) {
      console.error('Start error', e);
      setStatus("Start error");
    }
  }, [speechSupported, stopListening, language]);

  const handleReadAndAsk = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      speakText("Welcome to the Complaint Portal. Please choose a category to lodge your complaint.");
      setTimeout(() => startListening(), 2000);
    }
  }, [isListening, speakText, startListening, stopListening]);

  return (
    <div style={{ display: "flex", minHeight: "80vh" }}>
      <UserSidebar />

      <main style={{ flex: 1, padding: 28 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <h2 style={{ marginTop: 0 }}>Choose a Complaint Category</h2>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <button onClick={startListening} style={{ background: "#095bb5", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>▶ Start</button>
            <button onClick={handleReadAndAsk} style={{ background: "#095bb5", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>📖 Read & Ask</button>
            <button onClick={stopListening} style={{ background: "#dc2626", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}>⏹ Stop</button>
            <div style={{ marginLeft: 12, color: "#6b7280", fontWeight: 600, fontSize: 14 }}>Status: <span style={{ color: "#095bb5" }}>{status}</span></div>
          </div>
        </div>

        <div style={{ margin: "12px 0 28px 0" }}>
          <select value={language} onChange={(e) => setLanguage(e.target.value)} style={{ padding: 8, borderRadius: 8, width: 220 }}>
            <option value="en-IN">English</option>
            <option value="ta-IN">Tamil</option>
            <option value="hi-IN">Hindi</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          {categories.map((c) => (
            <div key={c.id} style={{ background: "#fff", padding: 18, borderRadius: 10, boxShadow: "0 6px 18px rgba(2,6,23,0.06)" }}>
              <h4 style={{ margin: 0 }}>
                {numberWords[language] && numberWords[language][categories.indexOf(c)]
                  ? `${numberWords[language][categories.indexOf(c)]} - `
                  : ""}
                {getCategoryTitle(c.id, language)}
              </h4>
              <p style={{ color: "#6b7280", fontSize: 13 }}>{getCategoryDescription(c.id, language)}</p>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <Link to="/user/complaint" style={{ background: "#095bb5", color: "#fff", padding: "8px 12px", borderRadius: 8, textDecoration: "none", fontWeight: 700 }}>Apply Now</Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
