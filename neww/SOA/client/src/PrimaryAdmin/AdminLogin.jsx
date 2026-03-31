import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); // Added state for toggle
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const styles = {
    page: {
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
      fontFamily: "Segoe UI, sans-serif",
    },

    card: {
      width: "380px",
      background: "#ffffff",
      padding: "30px",
      borderRadius: "12px",
      boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
      animation: "fadeIn 0.5s ease-in-out",
      boxSizing: "border-box", // Ensure padding included in width
    },

    title: {
      textAlign: "center",
      marginBottom: "5px",
      color: "#2c5364",
    },

    subtitle: {
      textAlign: "center",
      marginBottom: "20px",
      color: "#777",
      fontSize: "14px",
    },

    error: {
      background: "#ffe5e5",
      color: "#d8000c",
      padding: "10px",
      borderRadius: "6px",
      fontSize: "14px",
      marginBottom: "15px",
      textAlign: "center",
    },

    inputGroup: {
      marginBottom: "20px",
      position: "relative", // For password toggle button positioning
    },

    label: {
      display: "block",
      marginBottom: "6px",
      fontSize: "14px",
      color: "#333",
      fontWeight: "600",
    },

    input: {
      width: "100%",
      padding: "12px 40px 12px 12px",
      borderWidth: "1.5px",
      borderStyle: "solid",
      borderColor: "#ccc",
      borderRadius: "8px",
      outline: "none",
      fontSize: "16px",
      transition: "border-color 0.3s, box-shadow 0.3s",
      boxSizing: "border-box",
    },

    inputFocus: {
      borderColor: "#11998e",
      boxShadow: "0 0 6px rgba(17, 153, 142, 0.5)",
    },

    toggleButton: {
      position: "absolute",
      top: "50%",
      right: "12px",
      transform: "translateY(-50%)",
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "18px",
      color: "#777",
      userSelect: "none",
      padding: 0,
    },

    button: {
      width: "100%",
      padding: "12px",
      borderRadius: "8px",
      border: "none",
      background: "linear-gradient(135deg, #11998e, #38ef7d)",
      color: "#fff",
      fontSize: "16px",
      cursor: "pointer",
      marginTop: "10px",
      transition: "transform 0.2s ease",
    },

    footer: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "12px",
      color: "#aaa",
    },
  };

  // Optional: handle input focus styling for nicer UX
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/admin/login", {
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", res.data); // 👈 ADD THIS

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("admin_id", res.data.admin_id); // 👈 ADD THIS

      navigate("/admin/dashboard", {
        state: { admin_name: res.data.admin_name },
      });
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <form style={styles.card} onSubmit={handleLogin}>
        <h2 style={styles.title}>Admin Portal</h2>
        <p style={styles.subtitle}>Sign in to continue</p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.inputGroup}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            placeholder="admin@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              ...styles.input,
              ...(emailFocused ? styles.inputFocus : {}),
            }}
            required
            onFocus={() => setEmailFocused(true)}
            onBlur={() => setEmailFocused(false)}
          />
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Password</label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(passwordFocused ? styles.inputFocus : {}),
            }}
            required
            onFocus={() => setPasswordFocused(true)}
            onBlur={() => setPasswordFocused(false)}
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            style={styles.toggleButton}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button
          type="submit"
          style={{
            ...styles.button,
            opacity: loading ? 0.7 : 1,
          }}
          disabled={loading}
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        <p style={styles.footer}>© 2026 Admin System</p>
      </form>
    </div>
  );
}

export default AdminLogin;
