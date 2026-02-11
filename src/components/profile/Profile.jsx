import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import "./profile.css";

export default function Profile() {
  const { user } = useAuth();

  if (!user) return <p>Please login to view profile</p>;

  return (
    <div className="profile-page">
      <h2>My Profile</h2>

      <div className="profile-card">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Mobile:</strong> {user.mobile}</p>

        <button className="edit-btn">Edit Profile</button>
      </div>
    </div>
  );
}
