import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL } from "../../config";
import { fetchWithAuth } from "../../utils/apiClient";
import "./profile.css";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!user) return;

    fetchWithAuth(`${API_BASE_URL}/api/user-profile`)
      .then(res => res.json())
      .then(data => {
        setProfile(data.user);
      })
      .catch(err => console.error(err));
  }, [user]);

  if (!user) {
    return (
      <div className="profile-page">
        <h3>Please login to view profile</h3>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-page">
        <h3>Loading profile...</h3>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Email:</strong> {profile.email}</p>
        <p><strong>Mobile:</strong> {profile.mobile}</p>
        

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}
