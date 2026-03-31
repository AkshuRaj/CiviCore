// src/components/StaffSignup/StaffSignup.jsx
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE_URL } from "../../config";
import "./StaffSignup.css";

const LOCATION_API_BASE = import.meta.env.VITE_LOCATION_API_BASE || "";
const LOCATION_API_KEY  = import.meta.env.VITE_LOCATION_API_KEY  || "";

const ROLE_INFO = {
  SECONDARY_ADMIN: {
    label: "Secondary Admin",
    desc: "State-level administrator. Manages heads across your assigned state.",
    locationFields: ["country", "state"],
    color: "#6c2eb9",
  },
  HEAD: {
    label: "Head",
    desc: "District-level head. Manages staff teams within your assigned district.",
    locationFields: ["country", "state", "district"],
    color: "#1565c0",
  },
  STAFF: {
    label: "Staff",
    desc: "City-level staff member. Manages employees in your assigned city.",
    locationFields: ["country", "state", "district", "city"],
    color: "#00695c",
  },
  EMPLOYEE: {
    label: "Employee",
    desc: "Field employee. Works under staff to resolve complaints in your city.",
    locationFields: ["country", "state", "district", "city"],
    color: "#e65100",
  },
};

const initialForm = {
  role: "",
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  department: "",
  country: "India",
  state: "",
  district: "",
  city: "",
  aadhaar: "",
  pan: "",
  voterId: "",
  address: "",
  qualification: "",
  yearsOfExperience: "",
  designation: "",
};

export default function StaffSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=role, 2=location, 3=personal, 4=otp, 5=done
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  // Location data from API
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);

  const roleFields = form.role ? ROLE_INFO[form.role].locationFields : [];
  const needsDistrict = roleFields.includes("district");
  const needsCity     = roleFields.includes("city");

  // ── Fetch states on mount ──
  useEffect(() => {
    if (!LOCATION_API_BASE) return;
    setLocationLoading(true);
    fetch(`${LOCATION_API_BASE}/states?country=India`, {
      headers: { "x-api-key": LOCATION_API_KEY },
    })
      .then((r) => r.json())
      .then((data) => setStates(data.states || data || []))
      .catch(() => setStates([]))
      .finally(() => setLocationLoading(false));
  }, []);

  // ── Fetch districts when state changes ──
  useEffect(() => {
    if (!form.state || !needsDistrict || !LOCATION_API_BASE) {
      setDistricts([]);
      return;
    }
    setLocationLoading(true);
    fetch(`${LOCATION_API_BASE}/districts?state=${encodeURIComponent(form.state)}`, {
      headers: { "x-api-key": LOCATION_API_KEY },
    })
      .then((r) => r.json())
      .then((data) => setDistricts(data.districts || data || []))
      .catch(() => setDistricts([]))
      .finally(() => setLocationLoading(false));
  }, [form.state, needsDistrict]);

  // ── Fetch cities when district changes ──
  useEffect(() => {
    if (!form.district || !needsCity || !LOCATION_API_BASE) {
      setCities([]);
      return;
    }
    setLocationLoading(true);
    fetch(`${LOCATION_API_BASE}/cities?district=${encodeURIComponent(form.district)}`, {
      headers: { "x-api-key": LOCATION_API_KEY },
    })
      .then((r) => r.json())
      .then((data) => setCities(data.cities || data || []))
      .catch(() => setCities([]))
      .finally(() => setLocationLoading(false));
  }, [form.district, needsCity]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Reset downstream location fields on change
      if (name === "state")    { updated.district = ""; updated.city = ""; }
      if (name === "district") { updated.city = ""; }
      return updated;
    });
  };

  const showMsg = (text, type = "error") => setMessage({ text, type });
  const clearMsg = () => setMessage({ text: "", type: "" });

  // ── Step navigation validators ──
  const goToStep2 = () => {
    if (!form.role) return showMsg("Please select a role to continue.");
    clearMsg();
    setStep(2);
  };

  const goToStep3 = () => {
    if (!form.state) return showMsg("Please select your state.");
    if (needsDistrict && !form.district) return showMsg("Please select your district.");
    if (needsCity && !form.city) return showMsg("Please select your city.");
    clearMsg();
    setStep(3);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    clearMsg();
    if (!form.name || !form.email || !form.password || !form.phone || !form.aadhaar || !form.address) {
      return showMsg("Please fill all required fields.");
    }
    if (form.aadhaar.length !== 12) return showMsg("Aadhaar must be 12 digits.");
    if (form.password !== form.confirmPassword) return showMsg("Passwords do not match.");
    if (form.password.length < 8) return showMsg("Password must be at least 8 characters.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) return showMsg(data.message || "Failed to send OTP.");
      showMsg("OTP sent to your email. Please check your inbox.", "success");
      setStep(4);
    } catch {
      showMsg("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    clearMsg();
    if (!otp) return showMsg("Please enter the OTP.");
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/staff-register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) return showMsg(data.message || "Invalid or expired OTP.");
      setStep(5);
    } catch {
      showMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ── Progress bar ──
  const stepLabels = ["Role", "Location", "Details", "Verify OTP", "Done"];

  return (
    <div className="ss-root">
      {/* Header */}
      <div className="ss-header">
        <button className="ss-back-btn" onClick={() => navigate("/")}>← Home</button>
        <div className="ss-header-text">
          <h1>Online Complaint Management System</h1>
          <p>Staff / Official Registration Portal</p>
        </div>
      </div>

      <div className="ss-content">
        {/* Progress Steps */}
        <div className="ss-progress">
          {stepLabels.map((label, idx) => (
            <div
              key={idx}
              className={`ss-progress-step ${step > idx + 1 ? "done" : ""} ${step === idx + 1 ? "active" : ""}`}
            >
              <div className="ss-step-circle">{step > idx + 1 ? "✓" : idx + 1}</div>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* Message */}
        {message.text && (
          <div className={`ss-message ss-message--${message.type}`}>{message.text}</div>
        )}

        <div className="ss-card">
          {/* ── STEP 1: ROLE SELECTION ── */}
          {step === 1 && (
            <div className="ss-step ss-step--role">
              <h2>Choose Your Role</h2>
              <p className="ss-subtitle">Select the role you are applying for. Each role has different location scope and approval requirements.</p>
              <div className="ss-role-grid">
                {Object.entries(ROLE_INFO).map(([roleKey, info]) => (
                  <div
                    key={roleKey}
                    className={`ss-role-card ${form.role === roleKey ? "selected" : ""}`}
                    onClick={() => setForm((p) => ({ ...p, role: roleKey }))}
                    style={{ "--role-color": info.color }}
                  >
                    <div className="ss-role-badge">{info.label}</div>
                    <p>{info.desc}</p>
                    <div className="ss-role-scope">
                      Scope: {info.locationFields.join(" → ")}
                    </div>
                    {form.role === roleKey && <div className="ss-role-check">✓ Selected</div>}
                  </div>
                ))}
              </div>

              {/* Approval chain info */}
              <div className="ss-chain-info">
                <h3>📋 Approval Chain</h3>
                <div className="ss-chain">
                  <span className="chain-node admin">Primary Admin</span>
                  <span className="chain-arrow">→</span>
                  <span className="chain-node sec-admin">Secondary Admin</span>
                  <span className="chain-arrow">→</span>
                  <span className="chain-node head">Head</span>
                  <span className="chain-arrow">→</span>
                  <span className="chain-node staff">Staff</span>
                  <span className="chain-arrow">→</span>
                  <span className="chain-node employee">Employee</span>
                </div>
                <p className="chain-desc">Each level approves the next. Your application will be reviewed by the appropriate authority for your location.</p>
              </div>

              <button className="ss-btn ss-btn--primary" onClick={goToStep2}>
                Continue with {form.role ? ROLE_INFO[form.role].label : "selected role"} →
              </button>
              <p className="ss-login-link">
                Already registered? <Link to="/staff_login">Login here</Link>
              </p>
              <p className="ss-login-link">
                Check application status? <Link to="/staff_login?tab=status">Check status</Link>
              </p>
            </div>
          )}

          {/* ── STEP 2: LOCATION ── */}
          {step === 2 && (
            <div className="ss-step">
              <h2>Select Your Location</h2>
              <p className="ss-subtitle">
                As a <strong>{form.role ? ROLE_INFO[form.role].label : ""}</strong>, you will be responsible for the
                location(s) you select below.
              </p>

              <div className="ss-form-grid">
                {/* Country (always India, disabled) */}
                <div className="ss-field">
                  <label>Country *</label>
                  <input value="India" disabled />
                </div>

                {/* State */}
                <div className="ss-field">
                  <label>State *</label>
                  {locationLoading && states.length === 0 ? (
                    <select disabled><option>Loading states...</option></select>
                  ) : (
                    <select name="state" value={form.state} onChange={handleChange} required>
                      <option value="">Select State</option>
                      {states.length > 0
                        ? states.map((s, i) => (
                            <option key={i} value={typeof s === "string" ? s : s.name}>
                              {typeof s === "string" ? s : s.name}
                            </option>
                          ))
                        : FALLBACK_STATES.map((s, i) => <option key={i} value={s}>{s}</option>)
                      }
                    </select>
                  )}
                </div>

                {/* District */}
                {needsDistrict && (
                  <div className="ss-field">
                    <label>District *</label>
                    <select name="district" value={form.district} onChange={handleChange} required disabled={!form.state}>
                      <option value="">Select District</option>
                      {districts.map((d, i) => (
                        <option key={i} value={typeof d === "string" ? d : d.name}>
                          {typeof d === "string" ? d : d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* City */}
                {needsCity && (
                  <div className="ss-field">
                    <label>City / Town *</label>
                    <select name="city" value={form.city} onChange={handleChange} required disabled={!form.district}>
                      <option value="">Select City</option>
                      {cities.map((c, i) => (
                        <option key={i} value={typeof c === "string" ? c : c.name}>
                          {typeof c === "string" ? c : c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="ss-btn-row">
                <button className="ss-btn ss-btn--secondary" onClick={() => setStep(1)}>← Back</button>
                <button className="ss-btn ss-btn--primary" onClick={goToStep3}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── STEP 3: PERSONAL DETAILS ── */}
          {step === 3 && (
            <form className="ss-step" onSubmit={handleRequestOtp}>
              <h2>Personal & Professional Details</h2>
              <p className="ss-subtitle">Please fill all required fields accurately. Your details will be verified during approval.</p>

              <div className="ss-form-grid">
                <div className="ss-field">
                  <label>Full Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="As per government ID" />
                </div>
                <div className="ss-field">
                  <label>Email Address *</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="ss-field">
                  <label>Mobile Number *</label>
                  <input
                    type="tel" name="phone" value={form.phone} placeholder="+91 XXXXXXXXXX"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 10);
                      handleChange({ target: { name: "phone", value: v } });
                    }}
                    required
                  />
                </div>
                <div className="ss-field">
                  <label>Department</label>
                  <input name="department" value={form.department} onChange={handleChange} placeholder="e.g. Water Supply Department" />
                </div>
                <div className="ss-field">
                  <label>Designation</label>
                  <input name="designation" value={form.designation} onChange={handleChange} placeholder="e.g. District Officer" />
                </div>
                <div className="ss-field">
                  <label>Years of Experience</label>
                  <select name="yearsOfExperience" value={form.yearsOfExperience} onChange={handleChange}>
                    <option value="">Select</option>
                    <option>0–1 years</option>
                    <option>1–3 years</option>
                    <option>3–5 years</option>
                    <option>5–10 years</option>
                    <option>10+ years</option>
                  </select>
                </div>
                <div className="ss-field">
                  <label>Highest Qualification</label>
                  <input name="qualification" value={form.qualification} onChange={handleChange} placeholder="e.g. B.Tech, MBA" />
                </div>

                <div className="ss-field ss-field--divider">
                  <h3>Identity Documents</h3>
                </div>

                <div className="ss-field">
                  <label>Aadhaar Number * (12 digits)</label>
                  <input
                    name="aadhaar" value={form.aadhaar} required placeholder="XXXXXXXXXXXX"
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 12);
                      handleChange({ target: { name: "aadhaar", value: v } });
                    }}
                  />
                </div>
                <div className="ss-field">
                  <label>PAN Number</label>
                  <input
                    name="pan" value={form.pan} placeholder="ABCDE1234F"
                    onChange={(e) => handleChange({ target: { name: "pan", value: e.target.value.toUpperCase().slice(0, 10) } })}
                  />
                </div>
                <div className="ss-field">
                  <label>Voter ID</label>
                  <input name="voterId" value={form.voterId} onChange={handleChange} />
                </div>

                <div className="ss-field ss-field--full">
                  <label>Residential Address *</label>
                  <textarea name="address" value={form.address} onChange={handleChange} required rows={3} placeholder="Door No, Street, Area" />
                </div>

                <div className="ss-field ss-field--divider">
                  <h3>Set Password</h3>
                </div>

                <div className="ss-field">
                  <label>Password * (min 8 characters)</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required minLength={8} />
                </div>
                <div className="ss-field">
                  <label>Confirm Password *</label>
                  <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} required minLength={8} />
                  {form.confirmPassword && (
                    <span className={`ss-pwd-match ${form.password === form.confirmPassword ? "ok" : "bad"}`}>
                      {form.password === form.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                    </span>
                  )}
                </div>
              </div>

              <div className="ss-btn-row">
                <button type="button" className="ss-btn ss-btn--secondary" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="ss-btn ss-btn--primary" disabled={loading}>
                  {loading ? "Sending OTP..." : "Send OTP & Continue →"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 4: OTP VERIFICATION ── */}
          {step === 4 && (
            <form className="ss-step ss-step--otp" onSubmit={handleVerifyOtp}>
              <div className="ss-otp-icon">📧</div>
              <h2>Verify Your Email</h2>
              <p>An OTP has been sent to <strong>{form.email}</strong>. Enter it below to submit your application.</p>

              <div className="ss-otp-field">
                <label>Enter OTP</label>
                <input
                  className="ss-otp-input"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  maxLength={6}
                  placeholder="______"
                  required
                />
              </div>

              <div className="ss-btn-row">
                <button type="button" className="ss-btn ss-btn--secondary" onClick={() => setStep(3)}>← Back</button>
                <button type="submit" className="ss-btn ss-btn--primary" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Submit Application"}
                </button>
              </div>
            </form>
          )}

          {/* ── STEP 5: SUCCESS ── */}
          {step === 5 && (
            <div className="ss-step ss-step--done">
              <div className="ss-done-icon">🎉</div>
              <h2>Application Submitted!</h2>
              <p>Your <strong>{form.role ? ROLE_INFO[form.role].label : "staff"}</strong> application has been submitted successfully.</p>

              <div className="ss-approval-path">
                <h3>What happens next?</h3>
                {form.role === "SECONDARY_ADMIN" && (
                  <p>The <strong>Primary Admin</strong> will review and approve your application. You will be able to log in once approved.</p>
                )}
                {form.role === "HEAD" && (
                  <p>The <strong>Secondary Admin</strong> for <em>{form.state}</em> will review your application.</p>
                )}
                {form.role === "STAFF" && (
                  <p>The <strong>Head</strong> for <em>{form.district}</em> district will review your application.</p>
                )}
                {form.role === "EMPLOYEE" && (
                  <p>The <strong>Staff</strong> at <em>{form.city}</em> will review your application.</p>
                )}
                <p className="ss-pending-note">📌 Your application is currently <strong>PENDING</strong>. You can check your status anytime.</p>
              </div>

              <div className="ss-done-actions">
                <Link to="/staff_login" className="ss-btn ss-btn--primary">Go to Login</Link>
                <Link to="/" className="ss-btn ss-btn--secondary">Back to Home</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Fallback state list if API is unavailable
const FALLBACK_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh",
  "Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka",
  "Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram",
  "Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh",
  "Dadra & Nagar Haveli and Daman & Diu","Delhi",
  "Jammu & Kashmir","Ladakh","Lakshadweep","Puducherry",
];
