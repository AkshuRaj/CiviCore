import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import locationData from "../utils/locationData";

export default function EmployeeRegister() {
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
  const [stateVal, setStateVal] = useState("");
  const [city, setCity] = useState("");
  const navigate = useNavigate();

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
      const res = await axios.post("http://localhost:5000/employee/register", data);
      alert(res.data.message || "Employee registered");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Employee Registration Failed");
    }
  };

  return (
    <div style={{ padding: "40px", backgroundColor: "#010409", minHeight: "100vh", color: "#ffffff" }}>
      <h2 style={{ textAlign: "center", color: "#ffffff", marginBottom: "30px" }}>Employee Registration</h2>

      <form style={{ maxWidth: "900px", margin: "auto" }} onSubmit={submit}>
        {/* ===== PERSONAL INFORMATION ===== */}
        <h3 style={{ marginTop: "20px", borderBottom: "2px solid #3b82f6", paddingBottom: "10px", color: "#ffffff" }}>
          Personal Information
        </h3>

        <label style={labelStyle}>Employee Name{star}</label>
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
          onChange={e => setData({ ...data, voterId: e.target.value.toUpperCase() })}
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
            setStateVal("");
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
          value={stateVal}
          disabled={!country}
          required
          onChange={e => {
            setStateVal(e.target.value);
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
          disabled={!stateVal}
          required
          onChange={e => {
            setCity(e.target.value);
            setData({ ...data, city: e.target.value, location: "" });
          }}
        >
          <option value="">Select City</option>
          {country &&
            stateVal &&
            Object.keys(locationData[country][stateVal]).map(c => (
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
            stateVal &&
            city &&
            locationData[country][stateVal][city].map(a => (
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
          Register Employee
        </button>
      </form>
    </div>
  );
}
