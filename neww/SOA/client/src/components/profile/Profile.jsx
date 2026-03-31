import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { fetchWithAuth } from "../../utils/apiClient";
import Navbar from "../Navbar";
import "./profile.css";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchWithAuth("http://localhost:5000/api/user-profile")
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
      })
      .catch(err => console.error(err));
  }, [user]);

  if (!user) {
    return (
      <div className="ocms-page">
        <Navbar />
        <div className="profile-page">
          <h3>Please login to view profile</h3>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="ocms-page">
        <Navbar />
        <div className="profile-page">
          <h3>Loading profile...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="ocms-page">
      <Navbar />
      <div className="profile-page">
        <h2>My Profile</h2>

        <div className="profile-card">
          <p><strong>Name:</strong> <span>{profile.name}</span></p>
          <p><strong>Email:</strong> <span>{profile.email}</span></p>
          <p><strong>Mobile:</strong> <span>{profile.mobile}</span></p>


          <button className="edit-btn">Edit Profile</button>
        </div>
      </div>
    </div>
  );
}
