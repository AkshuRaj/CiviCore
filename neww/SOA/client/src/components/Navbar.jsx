import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./navbar.css";

export default function Navbar() {
    const [navOpen, setNavOpen] = useState(false);
    const navigate = useNavigate();
    const { user, logout, loading } = useAuth();

    const closeMobileMenuOnNavigate = () => {
        setNavOpen(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleLinkClick = (path, action) => {
        closeMobileMenuOnNavigate();
        if (action) {
            action();
        } else if (path) {
            navigate(path);
        }
    };

    return (

        <header className="ocms-nav">
            <div className="ocms-nav-inner">
                <div className="ocms-nav-left" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>
                    <img
                        src="/assets/ocms-logo.png"
                        alt="OCMS Logo"
                        className="ocms-nav-logo-image"
                    />
                    <div className="ocms-nav-title-block">
                        <span className="ocms-nav-title">OCMS</span>
                        <span className="ocms-nav-subtitle">
                            Online Complaint Management System
                        </span>
                    </div>
                </div>

                <nav className={`ocms-nav-links ${navOpen ? "ocms-nav-links--open" : ""}`}>
                    <button className="ocms-nav-link" onClick={() => handleLinkClick("/")}>Home</button>
                    <button
                        className="ocms-nav-link"
                        onClick={() => {
                            if (user) {
                                handleLinkClick("/user/dashboard", () => navigate("/user/dashboard", { state: { show: "complaints" } }));
                            } else {
                                handleLinkClick("/citizen_login");
                            }
                        }}
                    >
                        Complaints
                    </button>
                    <button className="ocms-nav-link" onClick={() => handleLinkClick("/about_us")}>About Us</button>
                    <button className="ocms-nav-link" onClick={() => handleLinkClick("/")}>Help</button>
                    <button className="ocms-nav-link" onClick={() => handleLinkClick("/contact_us")}>Contact Us</button>
                    <button className="ocms-nav-link" onClick={() => handleLinkClick("/")}>Site Map</button>
                    {user && (
                        <>
                            <button className="ocms-nav-link" onClick={() => handleLinkClick("/profile")}>Profile</button>
                            <button className="ocms-nav-link" onClick={() => handleLinkClick("/", logout)}>Logout</button>
                        </>
                    )}
                </nav>

                <div className="ocms-nav-right">
                    {!loading && !user && (
                        <>
                            <button
                                className="ocms-auth-btn ocms-auth-btn--login"
                                onClick={() => navigate("/citizen_login")}
                            >
                                Login
                            </button>
                            <button
                                className="ocms-auth-btn ocms-auth-btn--signup"
                                onClick={() => navigate("/citizen_signup")}
                            >
                                New Registration
                            </button>
                        </>
                    )}

                    <button
                        className={`ocms-nav-burger ${navOpen ? "ocms-nav-burger--open" : ""}`}
                        onClick={() => setNavOpen((o) => !o)}
                        aria-label="Toggle navigation"
                    >
                        <span />
                        <span />
                        <span />
                    </button>
                </div>
            </div>
        </header>
    );
}
