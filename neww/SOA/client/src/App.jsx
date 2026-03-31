import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from './components/Home';
import CitizenSignup from './components/Signup/CitizenSignup.jsx';
import CitizenLogin from './components/Login/CitizenLogin.jsx';
import AboutUs from './components/About/AboutUs.jsx';
import ContactUs from './components/ContactUs/ContactUs.jsx';
import UserDashboard from './user/UserDashboard';
import UserLayout from './user/UserLayout';
import MyComplaints from './user/MyComplaints';
import ViewStatus from './user/ViewStatus';
import ComplaintForm from "./user/ComplaintForm";
import CategoryPage from "./complaint/CategoryPage";


import UserMyComplaints from "./pages/UserMyComplaints";
import UserViewStatus from "./pages/UserViewStatus";
import UserEditProfile from "./pages/UserEditProfile";
import UserDeleteAccount from "./pages/UserDeleteAccount";

import HeadDashboard from "./head/HeadDashboard";
import Incoming from "./head/Incoming";
import AssignStaff from "./head/AssignStaff";
import HeadStaffReports from "./head/HeadStaffReports";
import Profile from "./components/profile/Profile.jsx";

import StaffDashboard from "./staff/StaffDashboard";
import MyComplaintsStaff from "./staff/MyComplaints";
import StaffAssignEmployee from "./staff/StaffAssignEmployee";
import HeadAssigned from "./head/AssignedComplaints";

import StaffRegister from "./auth/StaffRegister";
import HeadRegister from "./auth/HeadRegister";
import HeadLogin from "./head/HeadLogin";
import StaffLogin from "./staff/StaffLogin";
import AdminLogin from "./PrimaryAdmin/AdminLogin";
import AdminDashboard from "./PrimaryAdmin/AdminDashboard";
import AdminDepartments from "./PrimaryAdmin/AdminDepartments";
import AdminServiceTypes from "./PrimaryAdmin/AdminServiceTypes";
import AdminSkills from "./PrimaryAdmin/AdminSkills";
import AdminPriorities from "./PrimaryAdmin/AdminPriorities";
import AdminComplaintCategories from "./PrimaryAdmin/AdminComplaintCategories";
import AdminComplaintGallery from "./PrimaryAdmin/AdminComplaintGallery";
import SecondaryAdminApproval from "./PrimaryAdmin/SecondaryAdminApproval";
import PrivateRoute from "./PrimaryAdmin/PrivateRoute";
import AdminSignup from "./PrimaryAdmin/AdminSignup";

import CitizenDashboard from "./pages/CitizenDashboard";
import DailySummary from "./staff/DailySummary";
import EmployeeDashboard from "./employee/EmployeeDashboard";
import EmployeeLogin from "./employee/EmployeeLogin";
import EmployeeRegister from "./employee/EmployeeRegister";
import EmployeeUpdateComplaint from "./employee/EmployeeUpdateComplaint";

import SplashScreen from "./components/SplashScreen";
import { useAuth } from "./context/AuthContext";
import "./App.css";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Loading...</div>;
  if (!user) return <Navigate to="/citizen_login" replace />;
  return children;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const { loading } = useAuth();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0f172a', color: 'white' }}>Checking session...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* HEAD ROUTES */}
        <Route path="/head" element={<HeadDashboard />} />
        <Route path="/head/incoming" element={<Incoming />} />
        <Route path="/head/assign" element={<AssignStaff />} />
        <Route path="/head/assigned" element={<HeadAssigned />} />
        <Route path="/head/staff-reports" element={<HeadStaffReports />} />

        <Route path="/citizen_signup" element={<CitizenSignup />} />
        <Route path="/citizen_login" element={<CitizenLogin />} />
        <Route path="/about_us" element={<AboutUs />} />
        <Route path="/contact_us" element={<ContactUs />} />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Protected USER (Citizen) ROUTES */}
        <Route
          path="/user"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<UserDashboard />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="complaint/new" element={<ComplaintForm />} />
          <Route path="complaints" element={<MyComplaints />} />
          <Route path="status" element={<ViewStatus />} />
          <Route path="my-complaints" element={<UserMyComplaints />} />
          <Route path="view-status" element={<UserViewStatus />} />
          <Route path="edit-profile" element={<UserEditProfile />} />
          <Route path="delete-account" element={<UserDeleteAccount />} />
        </Route>

        <Route path="/head/register" element={<HeadRegister />} />
        <Route path="/head/register-staff" element={<StaffRegister />} />
        <Route path="/head/login" element={<HeadLogin />} />

        {/* STAFF ROUTES */}
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/my" element={<MyComplaintsStaff />} />
        <Route path="/staff/assign-employee" element={<StaffAssignEmployee />} />

        {/* EMPLOYEE ROUTES */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/update/:id" element={<EmployeeUpdateComplaint />} />
        <Route path="/employee/login" element={<EmployeeLogin />} />
        <Route path="/employee/register" element={<EmployeeRegister />} />

        <Route path="/citizen" element={<CitizenDashboard />} />

        <Route path="/staff/summary" element={<DailySummary />} />
        <Route path="/staff/login" element={<StaffLogin />} />

        <Route path="*" element={<Navigate to="/" replace />} />


        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/adminsignup" element={<AdminSignup />} />
        <Route path="/admin/dashboard" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
        <Route path="/admindepartments" element={<PrivateRoute><AdminDepartments /></PrivateRoute>} />
        <Route path="/adminservice-type" element={<PrivateRoute><AdminServiceTypes /></PrivateRoute>} />
        <Route path="/adminskills" element={<PrivateRoute><AdminSkills /></PrivateRoute>} />
        <Route path="/adminpriority" element={<PrivateRoute><AdminPriorities /></PrivateRoute>} />
        <Route path="/admincomplaint-categories" element={<PrivateRoute><AdminComplaintCategories /></PrivateRoute>} />
        <Route path="/admincategory-gallery" element={<PrivateRoute><AdminComplaintGallery /></PrivateRoute>} />
        <Route path="/secondary-admin-approvals" element={<PrivateRoute><SecondaryAdminApproval /></PrivateRoute>} />

      </Routes>
    </BrowserRouter>
  );
}
