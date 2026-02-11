// src/pages/CitizenSignup.jsx
import { useState } from "react";
import "./CitizenSignup.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAuth } from "../../context/AuthContext";

const initialForm = {
  firstName: "",
  lastName: "",
  dob: "",
  gender: "",
  mobile: "",
  email: "",
  password: "",
  confirmPassword: "",
  country: "India",
  state: "",
  district: "",
  city: "",
  pincode: "",
  addressLine1: "",
  addressLine2: "",
  govIdType: "",
  govIdLast4: "",
  altPhone: "",
  language: "English",
  notifySms: true,
  notifyEmail: true,
  notifyWhatsApp: false,
  acceptTerms: false,
  acceptPrivacy: false,
};

export default function CitizenSignup() {
  const [form, setForm] = useState(initialForm);
  const [otp, setOtp] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [step, setStep] = useState("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();
  // put this ABOVE return (inside your component)
  const eighteenYearsAgo = new Date();
  eighteenYearsAgo.setFullYear(eighteenYearsAgo.getFullYear() - 18);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => {
      const updated = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "password" || name === "confirmPassword") {
        if (updated.confirmPassword.length > 0) {
          setPasswordMatch(updated.password === updated.confirmPassword);
        } else {
          setPasswordMatch(null);
        }
      }

      return updated;
    });
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!form.acceptTerms || !form.acceptPrivacy) {
      setMessage("Please accept Terms and Privacy Policy.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/get_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Failed to send OTP.");
      } else {
        setMessage("OTP sent to your email. Please check your inbox.");
        setStep("otp");
      }
    } catch (err) {
      setMessage("Network error while sending OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!otp) {
      setMessage("Enter the OTP you received.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/verify_otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.message || "Invalid or expired OTP.");
      } else {
        setMessage("Registration successful.");
        // Auto-login after successful signup
        if (data.token && data.user) {
          login(data.user, data.token);
          setTimeout(() => navigate("/user_dashboard"), 500);
        } else {
          setStep("done");
        }
      }
    } catch (err) {
      setMessage("Network error while verifying OTP.");
    } finally {
      setLoading(false);
    }
  };

  const STATES_AND_UTS = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal",

    "Andaman and Nicobar Islands",
    "Chandigarh",
    "Dadra & Nagar Haveli and Daman & Diu",
    "Delhi",
    "Jammu & Kashmir",
    "Ladakh",
    "Lakshadweep",
    "Puducherry",
  ];

  const DISTRICTS = {
    "Tamil Nadu": [
      "Ariyalur",
      "Chengalpattu",
      "Chennai",
      "Coimbatore",
      "Cuddalore",
      "Dharmapuri",
      "Dindigul",
      "Erode",
      "Kallakurichi",
      "Kanchipuram",
      "Kanyakumari",
      "Karur",
      "Krishnagiri",
      "Madurai",
      "Nagapattinam",
      "Namakkal",
      "Nilgiris",
      "Perambalur",
      "Pudukkottai",
      "Ramanathapuram",
      "Ranipet",
      "Salem",
      "Sivaganga",
      "Tenkasi",
      "Thanjavur",
      "Theni",
      "Thoothukudi",
      "Tiruchirappalli",
      "Tirunelveli",
      "Tirupathur",
      "Tiruppur",
      "Tiruvallur",
      "Tiruvannamalai",
      "Tiruvarur",
      "Vellore",
      "Viluppuram",
      "Virudhunagar",
    ],

    Karnataka: [
      "Bagalkot",
      "Ballari",
      "Belagavi",
      "Bengaluru Rural",
      "Bengaluru Urban",
      "Bidar",
      "Chamarajanagar",
      "Chikkaballapur",
      "Chikkamagaluru",
      "Chitradurga",
      "Dakshina Kannada",
      "Davangere",
      "Dharwad",
      "Gadag",
      "Hassan",
      "Haveri",
      "Kalaburagi",
      "Kodagu",
      "Kolar",
      "Koppal",
      "Mandya",
      "Mysuru",
      "Raichur",
      "Ramanagara",
      "Shivamogga",
      "Tumakuru",
      "Udupi",
      "Uttara Kannada",
      "Vijayapura",
      "Yadgir",
    ],

    Kerala: [
      "Alappuzha",
      "Ernakulam",
      "Idukki",
      "Kannur",
      "Kasaragod",
      "Kollam",
      "Kottayam",
      "Kozhikode",
      "Malappuram",
      "Palakkad",
      "Pathanamthitta",
      "Thiruvananthapuram",
      "Thrissur",
      "Wayanad",
    ],
  };

  const CITIES = {
    Chennai: [
      "Teynampet",
      "Velachery",
      "Adyar",
      "Anna Nagar",
      "Perambur",
      "Kodambakkam",
      "Sholinganallur",
      "Tondiarpet",
    ],

    Coimbatore: [
      "Gandhipuram",
      "RS Puram",
      "Peelamedu",
      "Saibaba Colony",
      "Town Hall",
      "Race Course",
    ],

    "Bengaluru Urban": [
      "Whitefield",
      "Koramangala",
      "Indiranagar",
      "Jayanagar",
      "HSR Layout",
      "Yelahanka",
      "Malleshwaram",
    ],

    Ernakulam: ["Kochi", "Kaloor", "Edappally", "Fort Kochi", "Mattancherry"],
  };

  return (
    <>
      <div
        style={{
          minHeight: "29px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1e3c72, #2a5298)",
          color: "#ffffff",
          fontFamily: "Segoe UI, sans-serif",
          textAlign: "center",
          padding: "20px",
        }}
      >
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          style={{
            position: "absolute",
            top: "30px",
            left: "30px",
            padding: "12px 20px",
            backgroundColor: "#ffffff",
            color: "#1e3c72",
            border: "none",
            borderRadius: "8px",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            transition: "transform 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          ← Back to Home
        </button>

        {/* Title */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: "700",
            marginBottom: "10px",
            letterSpacing: "1px",
          }}
        >
          ONLINE COMPLAINT MANAGEMENT SYSTEM
        </h1>
        <h3
          style={{
            fontSize: "20px",
            fontWeight: "400",
            marginTop: "0",
            opacity: "0.9",
          }}
        >
          REGISTRATION FORM
        </h3>
      </div>

      <div className="signup-page">
        <div className="signup-card">
          <header className="signup-header">
            <h1>Citizen Registration</h1>
            <p>
              Create your OCMS citizen account to file and track complaints
              online.
            </p>
          </header>

          {message && <div className="signup-message">{message}</div>}

          {/* Step 1: Registration Form */}
          {step === "form" && (
            <form className="signup-form" onSubmit={handleRequestOtp}>
              <section className="signup-section">
                <h2>Account details</h2>
                <div className="signup-grid">
                  <div className="field">
                    <label>First name *</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Last name *</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Date of birth *</label>
                    <DatePicker
                      selected={form.dob ? new Date(form.dob) : null}
                      onChange={(date) =>
                        handleChange({
                          target: {
                            name: "dob",
                            value: date ? date.toISOString().split("T")[0] : "",
                          },
                        })
                      }
                      dateFormat="dd/MM/yyyy"
                      maxDate={eighteenYearsAgo}
                      showYearDropdown
                      showMonthDropdown
                      dropdownMode="select"
                      placeholderText="Select your date of birth"
                      className="date-input"
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Gender</label>
                    <select
                      name="gender"
                      value={form.gender}
                      onChange={handleChange}
                    >
                      <option value="">-- Select --</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>Mobile number * (+91)</label>
                    <input
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10)
                          handleChange({ target: { name: "mobile", value } });
                      }}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Email address *</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Password *</label>
                    <div className="password-wrapper">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                  <div className="field">
                    <label>Confirm password *</label>
                    <div className="password-wrapper">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </button>
                    </div>
                  </div>
                </div>
                {passwordMatch === false && (
                  <p className="error-text">❌ Passwords do not match</p>
                )}
                {passwordMatch === true && (
                  <p className="success-text">✅ Passwords match</p>
                )}
              </section>

              <section className="signup-section">
                <h2>Address & location</h2>
                <div className="signup-grid">
                  <div className="field">
                    <label>Country *</label>
                    <input
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      disabled
                      required
                    />
                  </div>
                  <div className="field">
                    <label>State *</label>
                    <select
                      name="state"
                      value={form.state}
                      onChange={handleChange}
                      required
                      className="ocms-select"
                    >
                      <option value="">Select State / Union Territory</option>
                      {STATES_AND_UTS.map((state, i) => (
                        <option key={i} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>District *</label>
                    <select
                      name="district"
                      value={form.district}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select District</option>
                      {form.state &&
                        DISTRICTS[form.state]?.map((dist, i) => (
                          <option key={i} value={dist}>
                            {dist}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>City / Town *</label>
                    <select
                      name="city"
                      value={form.city}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select City / Town</option>
                      {form.district &&
                        CITIES[form.district]?.map((city, i) => (
                          <option key={i} value={city}>
                            {city}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Pincode *</label>
                    <input
                      type="text"
                      name="pincode"
                      value={form.pincode}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 6)
                          handleChange({ target: { name: "pincode", value } });
                      }}
                      placeholder="Enter 6-digit PIN code"
                      required
                    />
                  </div>
                  <div className="field field--full">
                    <label>Address line 1 *</label>
                    <input
                      name="addressLine1"
                      value={form.addressLine1}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="field field--full">
                    <label>Address line 2</label>
                    <input
                      name="addressLine2"
                      value={form.addressLine2}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </section>

              <section className="signup-section">
                <h2>Identity</h2>
                <div className="signup-grid">
                  <div className="field">
                    <label>Government ID type *</label>
                    <select
                      name="govIdType"
                      value={form.govIdType}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select ID Type --</option>
                      <option value="aadhaar">Aadhaar</option>
                      <option value="pan">PAN</option>
                      <option value="voter">Voter ID</option>
                      <option value="dl">Driving Licence</option>
                    </select>
                  </div>
                  <div className="field">
                    <label>ID last 4 digits *</label>
                    <input
                      name="govIdLast4"
                      value={form.govIdLast4}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 4)
                          handleChange({
                            target: { name: "govIdLast4", value },
                          });
                      }}
                      maxLength={4}
                      required
                    />
                  </div>
                  <div className="field">
                    <label>Alternate phone</label>
                    <input
                      type="tel"
                      name="altPhone"
                      value={form.altPhone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        if (value.length <= 10)
                          handleChange({ target: { name: "altPhone", value } });
                      }}
                    />
                  </div>
                </div>
              </section>

              <section className="signup-section">
                <h2>Preferences & consent</h2>
                <div className="signup-grid">
                  <div className="field">
                    <label>Preferred language</label>
                    <select
                      name="language"
                      value={form.language}
                      onChange={handleChange}
                    >
                      <option value="English">English</option>
                      <option value="Hindi">ಕನ್ನಡ</option>
                      <option value="Tamil">தமிழ்</option>
                      <option value="Other">Malayalam</option>
                    </select>
                  </div>
                  <div className="field field--checkboxes">
                    <label>Notifications</label>
                    <div className="checkbox-row">
                      <label>
                        <input
                          type="checkbox"
                          name="notifySms"
                          checked={form.notifySms}
                          onChange={handleChange}
                        />
                        SMS
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="notifyEmail"
                          checked={form.notifyEmail}
                          onChange={handleChange}
                        />
                        Email
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="notifyWhatsApp"
                          checked={form.notifyWhatsApp}
                          onChange={handleChange}
                        />
                        WhatsApp
                      </label>
                    </div>
                  </div>
                </div>
                <div className="consent-box">
                  <label>
                    <input
                      type="checkbox"
                      name="acceptTerms"
                      checked={form.acceptTerms}
                      onChange={handleChange}
                      required
                    />
                    I agree to the Terms of Use and Citizen Charter.
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      name="acceptPrivacy"
                      checked={form.acceptPrivacy}
                      onChange={handleChange}
                      required
                    />
                    I have read the Privacy Policy and consent to processing of
                    my data for grievance redressal.
                  </label>
                  <p className="consent-warning">
                    Submitting false or misleading complaints may attract legal
                    action under applicable laws.
                  </p>
                </div>
              </section>

              <button
                className="signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending OTP..." : "Generate OTP & Continue"}
              </button>
            </form>
          )}

          {/* Step 2: OTP Verification */}
          {step === "otp" && (
            <form className="signup-otp-form" onSubmit={handleVerifyOtp}>
              <h2>Email verification</h2>
              <p>
                An OTP has been sent to <strong>{form.email}</strong>. Enter it
                below to complete your registration.
              </p>
              <div className="field">
                <label>OTP</label>
                <input
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  maxLength={6}
                  required
                />
              </div>
              <button
                className="signup-submit"
                type="submit"
                disabled={loading}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </button>
            </form>
          )}

          {/* Step 3: Success */}
          {step === "done" && (
            <div className="signup-complete">
              <h2>Registration successful</h2>
              <p>You can now login with your email and password.</p>
              <br />
              <Link
                to="/citizen_login"
                className="signup-submit"
                style={{
                  width: "150px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                Let's Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}