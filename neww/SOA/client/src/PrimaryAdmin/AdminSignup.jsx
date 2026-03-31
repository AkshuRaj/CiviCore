import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function AdminSignup() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("ADMIN");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
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
            width: "400px",
            background: "#ffffff",
            padding: "30px",
            borderRadius: "12px",
            boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            animation: "fadeIn 0.5s ease-in-out",
            boxSizing: "border-box",
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

        success: {
            background: "#e6fffa",
            color: "#2c7a7b",
            padding: "10px",
            borderRadius: "6px",
            fontSize: "14px",
            marginBottom: "15px",
            textAlign: "center",
        },

        inputGroup: {
            marginBottom: "15px",
            position: "relative",
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
            padding: "12px",
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
            top: "40px",
            right: "12px",
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
            fontSize: "14px",
            color: "#666",
        },

        link: {
            color: "#11998e",
            textDecoration: "none",
            fontWeight: "bold"
        }
    };

    const [focusedField, setFocusedField] = useState("");

    const handleSignup = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);

        try {
            await axios.post("http://localhost:5000/api/admin/signup", {
                name,
                email,
                password,
                role
            });

            setSuccess("Account created successfully! Redirecting to login...");
            setTimeout(() => {
                navigate("/adminlogin");
            }, 2000);
        } catch (err) {
            console.error("SIGNUP ERROR:", err);
            setError(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.page}>
            <form style={styles.card} onSubmit={handleSignup}>
                <h2 style={styles.title}>Admin Registration</h2>
                <p style={styles.subtitle}>Create an administrative account</p>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                            ...styles.input,
                            ...(focusedField === "name" ? styles.inputFocus : {}),
                        }}
                        required
                        onFocus={() => setFocusedField("name")}
                        onBlur={() => setFocusedField("")}
                    />
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Email Address</label>
                    <input
                        type="email"
                        placeholder="admin@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{
                            ...styles.input,
                            ...(focusedField === "email" ? styles.inputFocus : {}),
                        }}
                        required
                        onFocus={() => setFocusedField("email")}
                        onBlur={() => setFocusedField("")}
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
                            ...(focusedField === "password" ? styles.inputFocus : {}),
                            paddingRight: "45px"
                        }}
                        required
                        onFocus={() => setFocusedField("password")}
                        onBlur={() => setFocusedField("")}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={styles.toggleButton}
                    >
                        {showPassword ? "🙈" : "👁️"}
                    </button>
                </div>

                <div style={styles.inputGroup}>
                    <label style={styles.label}>Admin Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        style={{
                            ...styles.input,
                            ...(focusedField === "role" ? styles.inputFocus : {}),
                        }}
                        onFocus={() => setFocusedField("role")}
                        onBlur={() => setFocusedField("")}
                    >
                        <option value="ADMIN">Administrative Officer</option>
                        <option value="PRIMARY_ADMIN">Primary Administrator</option>
                    </select>
                </div>

                <button
                    type="submit"
                    style={{
                        ...styles.button,
                        opacity: loading ? 0.7 : 1,
                    }}
                    disabled={loading}
                >
                    {loading ? "Registering..." : "Create Account"}
                </button>

                <p style={styles.footer}>
                    Already have an account? <Link to="/adminlogin" style={styles.link}>Login here</Link>
                </p>
            </form>
        </div>
    );
}

export default AdminSignup;
