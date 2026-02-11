// src/App.jsx
import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import UserLayout from './user/UserLayout';
import Profile from "./components/profile/Profile.jsx";

// public components (use consistent lowercase folder names)
import SplashScreen from './components/SplashScreen';
import Home from './components/Home';
import CitizenSignup from './components/Signup/CitizenSignup.jsx';
import CitizenLogin from './components/Login/CitizenLogin.jsx';
import AboutUs from './components/About/AboutUs.jsx';
import ContactUs from './components/ContactUs/ContactUs.jsx';
import UserDashboard from './user/UserDashboard';
import CategoryPage from './modules/complaint/category';
import ComplaintForm from './user/ComplaintForm';
import MyComplaints from './user/MyComplaints';
import ViewStatus from './user/ViewStatus';



function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  if (!user) return <Navigate to="/citizen_login" replace />;
  return children;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { user, loading } = useAuth();


  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) return <SplashScreen />;
  
  // Wait for auth context to load before routing
  if (loading) {
    return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <div className="page-root">
        <Routes>

          {/* root - show dashboard if logged in, otherwise public home */}
          <Route path="/user/profile" element={<Profile />} />


          {/* public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/citizen_signup" element={<CitizenSignup />} />
          <Route path="/citizen_login" element={<CitizenLogin />} />
          <Route path="/about_us" element={<AboutUs />} />
          <Route path="/contact_us" element={<ContactUs />} />

          {/* Protected user dashboard and related pages - keep dashboard wrapper */}
          <Route
            path="/user"
            element={
              <ProtectedRoute>
                <UserLayout />
              </ProtectedRoute>
            }
          >
            <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
            <Route path="dashboard" element={<UserDashboard />} />
            <Route path="categories" element={<CategoryPage />} />
            <Route path="complaint/new" element={<ComplaintForm />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="status" element={<ViewStatus />} />
          </Route>
          
         
          {/* fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}