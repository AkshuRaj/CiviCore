import React, { useState } from "react";

const languageConfig = {
  "en-US": { label: "English", question: "What is your name?" },
  "ta-IN": { label: "Tamil", question: "உங்கள் பெயர் என்ன?" },
  "hi-IN": { label: "Hindi", question: "आपका नाम क्या है?" },
};

const VoiceNameForm = () => {
  const [language, setLanguage] = useState("en-US");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const askAndListen = () => {
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported. Use Google Chrome.");
      return;
    }

    // 1️⃣ Speak the question
    const utterance = new SpeechSynthesisUtterance(
      languageConfig[language].question
    );
    utterance.lang = language;

    utterance.onend = () => {
      // 2️⃣ Start listening ONLY after speaking ends
      const recognition = new SpeechRecognition();
      recognition.lang = language;
      recognition.interimResults = false;
      recognition.continuous = false;

      setStatus("Listening... 🎧");

      recognition.start();

      recognition.onresult = (event) => {
        const spokenText = event.results[0][0].transcript;
        setName(spokenText);
        setStatus("Captured ✅");
      };

      recognition.onerror = (e) => {
        setStatus("Error ❌ Speak clearly");
        console.error(e);
      };
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <div style={styles.container}>
      <h2>🎤 Voice Name Input</h2>

      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        style={styles.select}
      >
        {Object.entries(languageConfig).map(([code, data]) => (
          <option key={code} value={code}>
            {data.label}
          </option>
        ))}
      </select>

      <input
        type="text"
        placeholder="Your name will appear here"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />

      <button onClick={askAndListen} style={styles.button}>
        🎙 Ask & Speak
      </button>

      <p>{status}</p>
    </div>
  );
};

const styles = {
  container: {
    width: "380px",
    margin: "40px auto",
    padding: "25px",
    borderRadius: "12px",
    backgroundColor: "#f7f7f7",
    boxShadow: "0 0 12px rgba(0,0,0,0.15)",
    textAlign: "center",
  },
  select: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
  },
  input: {
    width: "100%",
    padding: "10px",
    marginBottom: "15px",
  },
  button: {
    padding: "10px 20px",
    backgroundColor: "#673ab7",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default VoiceNameForm;
