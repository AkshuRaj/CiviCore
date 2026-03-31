import { useState } from "react";
import axios from "axios";

/* =========================================
   COUNTRY → STATE → CITY → AREA DATA
========================================= */
const locationData = {
  India: {
    "Tamil Nadu": {
      Chennai: [
        "Teynampet",
        "Velachery",
        "Adyar",
        "Anna Nagar",
        "Perambur",
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
      Salem: ["Hasthampatti", "Fairlands", "Gugai"],
      Tiruppur: ["Avinashi Road", "PN Road", "Velampalayam"]
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
      Mysuru: ["Vijayanagar", "Hebbal", "Gokulam"],
      Mangaluru: ["Surathkal", "Kadri", "Bendoor"]
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
    "Andhra Pradesh": { "Select City": ["Select Area"] },
    "Arunachal Pradesh": { "Select City": ["Select Area"] },
    Assam: { "Select City": ["Select Area"] },
    Bihar: { "Select City": ["Select Area"] },
    Chhattisgarh: { "Select City": ["Select Area"] },
    Goa: { "Select City": ["Select Area"] },
    Gujarat: { "Select City": ["Select Area"] },
    Haryana: { "Select City": ["Select Area"] },
    "Himachal Pradesh": { "Select City": ["Select Area"] },
    Jharkhand: { "Select City": ["Select Area"] },
    "Madhya Pradesh": { "Select City": ["Select Area"] },
    Maharashtra: { "Select City": ["Select Area"] },
    Manipur: { "Select City": ["Select Area"] },
    Meghalaya: { "Select City": ["Select Area"] },
    Mizoram: { "Select City": ["Select Area"] },
    Nagaland: { "Select City": ["Select Area"] },
    Odisha: { "Select City": ["Select Area"] },
    Punjab: { "Select City": ["Select Area"] },
    Rajasthan: { "Select City": ["Select Area"] },
    Sikkim: { "Select City": ["Select Area"] },
    Telangana: { "Select City": ["Select Area"] },
    Tripura: { "Select City": ["Select Area"] },
    "Uttar Pradesh": { "Select City": ["Select Area"] },
    Uttarakhand: { "Select City": ["Select Area"] },
    "West Bengal": { "Select City": ["Select Area"] },

    /* ---------- UNION TERRITORIES ---------- */
    Delhi: { "New Delhi": ["Central Delhi", "South Delhi", "Dwarka"] },
    Chandigarh: { Chandigarh: ["Sector 17", "Sector 22"] },
    Puducherry: { Puducherry: ["White Town", "Ariyankuppam"] },
    "Jammu & Kashmir": { Srinagar: ["Lal Chowk"] },
    Ladakh: { Leh: ["Leh Market"] },
    Lakshadweep: { Kavaratti: ["Kavaratti Island"] },
    "Andaman and Nicobar Islands": {
      PortBlair: ["Aberdeen Bazaar"]
    },
    "Dadra & Nagar Haveli and Daman & Diu": {
      Daman: ["Nani Daman"]
    }
  }
};

export default function StaffRegister() {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    aadhaar: "",
    pan: "",
    voterId: "",
    phone: "",
    address: "",
    country: "",
    state: "",
    city: "",
    location: "",
    department: "Electricity",
    status: "ACTIVE"
  });

  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");

  const inputStyle = {
    width: "100%",
    padding: "14px",
    margin: "6px 0 12px",
    fontSize: "16px"
  };

  const labelStyle = { fontWeight: "600", color: "#ffffff", display: "block", marginBottom: "4px" };
  const star = <span style={{ color: "#ff4d4d" }}> *</span>;

  const submit = async (e) => {
    e.preventDefault();

    if (data.password !== data.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/staff/register",
        data
      );
      alert(res.data.message);
    } catch (err) {
      alert("Staff Registration Failed");
    }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#010409", minHeight: "100vh", color: "#ffffff" }}>
      <h2 style={{ textAlign: "center", color: "#ffffff", marginBottom: "30px" }}>Staff Registration</h2>

      <form style={{ maxWidth: "900px", margin: "auto" }} onSubmit={submit}>
        {/* ===== PERSONAL INFORMATION ===== */}
        <h3 style={{ marginTop: "20px", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#ffffff" }}>
          Personal Information
        </h3>

        <label style={labelStyle}>Staff Name{star}</label>
        <input
          style={inputStyle}
          value={data.name}
          onChange={e => setData({ ...data, name: e.target.value })}
          required
        />

        <label style={labelStyle}>Email{star}</label>
        <input
          type="email"
          style={inputStyle}
          value={data.email}
          onChange={e => setData({ ...data, email: e.target.value })}
          required
        />

        <label style={labelStyle}>Password{star}</label>
        <input
          type="password"
          style={inputStyle}
          value={data.password}
          onChange={e => setData({ ...data, password: e.target.value })}
          required
        />

        <label style={labelStyle}>Confirm Password{star}</label>
        <input
          type="password"
          style={inputStyle}
          value={data.confirmPassword}
          onChange={e => setData({ ...data, confirmPassword: e.target.value })}
          required
        />
        {/* ===== IDENTITY DETAILS ===== */}
        <h3 style={{ marginTop: "30px", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#ffffff" }}>
          Identity Verification
        </h3>

        <label style={labelStyle}>Aadhaar Number{star}</label>
        <input
          style={inputStyle}
          maxLength="12"
          value={data.aadhaar}
          onChange={e => setData({ ...data, aadhaar: e.target.value })}
          required
        />

        <label style={labelStyle}>PAN Number{star}</label>
        <input
          style={inputStyle}
          maxLength="10"
          value={data.pan}
          onChange={e => {
            const v = e.target.value.toUpperCase();
            if (/^[A-Z0-9]*$/.test(v)) setData({ ...data, pan: v });
          }}
          pattern="[A-Z]{5}[0-9]{4}[A-Z]"
          required
        />

        <label style={labelStyle}>Voter ID</label>
        <input
          style={inputStyle}
          maxLength="10"
          value={data.voterId}
          onChange={e =>
            setData({ ...data, voterId: e.target.value.toUpperCase() })
          }
          required
        />

        <label style={labelStyle}>Phone Number{star}</label>
        <input
          style={inputStyle}
          maxLength="10"
          value={data.phone}
          onChange={e => setData({ ...data, phone: e.target.value })}
          required
        />
        {/* ===== ADDRESS & LOCATION ===== */}
        <h3 style={{ marginTop: "30px", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#ffffff" }}>
          Office Address & Location
        </h3>

        <label style={labelStyle}>Address{star}</label>
        <textarea
          style={{ ...inputStyle, minHeight: "90px" }}
          value={data.address}
          onChange={e => setData({ ...data, address: e.target.value })}
          required
        />

        <label style={labelStyle}>Country{star}</label>
        <select
          style={inputStyle}
          value={country}
          required
          onChange={e => {
            setCountry(e.target.value);
            setState("");
            setCity("");
            setData({
              ...data,
              country: e.target.value,
              state: "",
              city: "",
              location: ""
            });
          }}
        >
          <option value="">Select Country</option>
          {Object.keys(locationData).map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <label style={labelStyle}>State{star}</label>
        <select
          style={inputStyle}
          value={state}
          disabled={!country}
          required
          onChange={e => {
            setState(e.target.value);
            setCity("");
            setData({
              ...data,
              state: e.target.value,
              city: "",
              location: ""
            });
          }}
        >
          <option value="">Select State</option>
          {country &&
            Object.keys(locationData[country]).map(s => (
              <option key={s}>{s}</option>
            ))}
        </select>

        <label style={labelStyle}>City{star}</label>
        <select
          style={inputStyle}
          value={city}
          disabled={!state}
          required
          onChange={e => {
            setCity(e.target.value);
            setData({ ...data, city: e.target.value, location: "" });
          }}
        >
          <option value="">Select City</option>
          {country &&
            state &&
            Object.keys(locationData[country][state]).map(c => (
              <option key={c}>{c}</option>
            ))}
        </select>

        <label style={labelStyle}>Area{star}</label>
        <select
          style={inputStyle}
          value={data.location}
          disabled={!city}
          required
          onChange={e => setData({ ...data, location: e.target.value })}
        >
          <option value="">Select Area</option>
          {country &&
            state &&
            city &&
            locationData[country][state][city].map(a => (
              <option key={a}>{a}</option>
            ))}
        </select>
        {/* ===== DEPARTMENT DETAILS ===== */}
        <h3 style={{ marginTop: "30px", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#ffffff" }}>
          Department Details
        </h3>

        <label style={labelStyle}>Department{star}</label>
        <select
          style={inputStyle}
          value={data.department}
          onChange={e =>
            setData({ ...data, department: e.target.value })
          }
        >
          <option>Electricity</option>
          <option>Water</option>
          <option>Roads</option>
          <option>Sanitation</option>
        </select>

        <button style={{
          ...inputStyle,
          fontWeight: "bold",
          backgroundColor: "#3b82f6",
          color: "white",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          cursor: "pointer"
        }}>
          Register Staff
        </button>
      </form>
    </div>
  );
}
