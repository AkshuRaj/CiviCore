// src/Home.jsx
import { useEffect, useState } from "react";
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import "../styles/home.css";
import book1 from "../assets/book1.png";
import book2 from "../assets/book2.png";
import book3 from "../assets/book3.png";
import book4 from "../assets/book4.png";

import slide1 from "../assets/slider1.jpg";
import slide2 from "../assets/slider2.jpg";
import slide3 from "../assets/slider3.png";
import slide4 from "../assets/slider4.jpg";

const SLIDES = [
  {
    id: 1,
    title: "File any complaint from a single portal",
    text: "Electricity, water, roads, sanitation, safety and more — every problem can be registered online.",
    image: slide3,
    side: "left",
  },
  {
    id: 2,
    title: "Track the status of your complaints in real time",
    text: "Get transparent updates as your complaint moves from registered to in progress and resolved.",
    image: slide1,
    side: "right",
  },
  {
    id: 3,
    title: "Premium ERP dashboards for authorities",
    text: "Task managers and admins see structured queues, SLA timelines and performance analytics.",
    image: slide4,
    side: "left",
  },
  {
    id: 4,
    title: "Attach photos and documents as proof",
    text: "Upload evidence so departments can validate issues faster and take accurate actions.",
    image: slide2,
    side: "right",
  },
  {
    id: 5,
    title: "Designed for every citizen across India",
    text: "A unified complaint platform that connects citizens, departments and organizations nationwide.",
    image: slide1,
    side: "left",
  },
];

const BOOKS = [
  {
    id: "electricity",
    title: "Electricity Complaints",
    image: book1,
    pages: [
      {
        left: "Overview",
        right:
          "Report power failures, frequent power cuts and transformer outages affecting your area.",
      },
      {
        left: "Safety Issues",
        right:
          "Raise issues for voltage fluctuation, damaged poles, loose wires and unsafe connections.",
      },
      {
        left: "Billing & Meter",
        right:
          "Share meter reading disputes, billing errors and suspected electricity theft cases.",
      },
      {
        left: "What to mention",
        right:
          "Provide consumer number, address, contact details and approximate time the issue started.",
      },
      {
        left: "END",
        right: "You can now file your complaint with all required details.",
      },
    ],
  },
  {
    id: "water",
    title: "Water & Sanitation Complaints",
    image: book2,
    pages: [
      {
        left: "Supply Issues",
        right:
          "Complain about irregular water supply, low pressure or complete supply cut‑off.",
      },
      {
        left: "Quality Issues",
        right:
          "Report contaminated water, foul smell, color changes or unsafe drinking conditions.",
      },
      {
        left: "Sanitation",
        right:
          "Escalate sewage overflow, blocked drains and unscheduled tanker operations.",
      },
      {
        left: "What to mention",
        right:
          "Specify street name, timing of supply, connection type and any old complaint IDs.",
      },
      {
        left: "END",
        right: "You are ready to raise a detailed water/sanitation complaint.",
      },
    ],
  },
  {
    id: "roads",
    title: "Roads & Street Light Complaints",
    image: book3,
    pages: [
      {
        left: "Road Damage",
        right:
          "Report potholes, damaged roads and dangerous speed breakers in your locality.",
      },
      {
        left: "Footpaths & Manholes",
        right:
          "Raise issues about broken footpaths, open manholes and unsafe crossings.",
      },
      {
        left: "Street Lights",
        right:
          "Complain about non‑working street lights, flickering bulbs and dark stretches.",
      },
      {
        left: "What to mention",
        right:
          "Provide exact location, nearest landmark and time when the problem is most visible.",
      },
      {
        left: "END",
        right:
          "Attach photos of the road or pole when you submit the complaint.",
      },
    ],
  },
  {
    id: "public",
    title: "Public Safety & Other Complaints",
    image: book4,
    pages: [
      {
        left: "Public Safety",
        right:
          "Register issues related to harassment, eve‑teasing, nuisance and unsafe zones.",
      },
      {
        left: "Civic Nuisance",
        right:
          "Complain about garbage dumping, noise pollution and illegal encroachments.",
      },
      {
        left: "Other Issues",
        right:
          "Submit property tax, transport, local governance or other civic concerns.",
      },
      {
        left: "What to mention",
        right:
          "Mention date/time, location, people involved (if known) and any prior complaint IDs.",
      },
      {
        left: "END",
        right:
          "Use respectful language and attach supporting documents if needed.",
      },
    ],
  },
];

export default function Home() {
  const [navOpen, setNavOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [slideIndex, setSlideIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const [activeBookId, setActiveBookId] = useState(null);
  const [pageIndex, setPageIndex] = useState(0);
  const [turnDirection, setTurnDirection] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setSlideIndex((prev) => (prev + 1) % SLIDES.length);
        setIsFading(false);
      }, 200);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const activeSlide = SLIDES[slideIndex];

  const handleSelectBook = (id) => {
    if (activeBookId === id) return;
    setActiveBookId(id);
    setPageIndex(0);
    setTurnDirection(null);
  };

  const currentBook = BOOKS.find((b) => b.id === activeBookId) || null;
  const totalPages = currentBook ? currentBook.pages.length : 0;
  const currentSpread = currentBook ? currentBook.pages[pageIndex] : null;

  const turnPage = (dir) => {
    if (!currentBook) return;
    if (dir === "right" && pageIndex < totalPages - 1) {
      setTurnDirection("right");
      setTimeout(() => {
        setPageIndex((p) => p + 1);
        setTurnDirection(null);
      }, 400);
    } else if (dir === "left" && pageIndex > 0) {
      setTurnDirection("left");
      setTimeout(() => {
        setPageIndex((p) => p - 1);
        setTurnDirection(null);
      }, 400);
    }
  };

  const closeMobileMenuOnNavigate = () => {
    setNavOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="ocms-page">
      {/* NAVBAR */}
      <header className="ocms-nav">
        <div className="ocms-nav-inner">
          <div className="ocms-nav-left">
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

          <nav
            className={`ocms-nav-links ${
              navOpen ? "ocms-nav-links--open" : ""
            }`}
          >
            <button
              className="ocms-nav-link"
              onClick={closeMobileMenuOnNavigate}
            >
              Home
            </button>
            <button
              className="ocms-nav-link"
              onClick={() => {
                closeMobileMenuOnNavigate();
                // If logged in, open user dashboard and show complaints, else go to public complaints starter
                if (user) {
                  navigate('/user_dashboard', { state: { show: 'complaints' } });
                } else {
                  navigate('/start_complaints');
                }
              }}
            >
              Complaints
            </button>
            <button
              className="ocms-nav-link"
              onClick={() => {
                closeMobileMenuOnNavigate();
                navigate("/about_us");
              }}
            >
              About Us
            </button>
            <button
              className="ocms-nav-link"
              onClick={closeMobileMenuOnNavigate}
            >
              Help
            </button>
            <button
              className="ocms-nav-link"
              onClick={() => {
                closeMobileMenuOnNavigate();
                navigate("/contact_us");
              }}
            >
              Contact Us
            </button>
            <button
              className="ocms-nav-link"
              onClick={closeMobileMenuOnNavigate}
            >
              Site Map
            </button>
          </nav>

          <div className="ocms-nav-right">
  {!user ? (
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
  ) : (
    <>
      <button
        className="ocms-nav-link"
        onClick={() => navigate("/profile")}
      >
        Profile
      </button>

      <button
        className="ocms-auth-btn ocms-auth-btn--logout"
        onClick={() => {
          localStorage.clear();
          navigate("/");
        }}
      >
        Logout
      </button>
    </>
  )}

  <button
    className={`ocms-nav-burger ${navOpen ? "ocms-nav-burger--open" : ""}`}
    onClick={() => setNavOpen(o => !o)}
    aria-label="Toggle navigation"
  >
    <span />
    <span />
    <span />
  </button>
</div>
        </div>
      </header>
      <br />
      <br />

      {/* HERO + SLIDER */}
      <section className="ocms-hero">
        <div className="ocms-hero-inner">
          <div className="ocms-hero-text-block">
            <p className="ocms-hero-kicker">Citizen Entry Portal</p>
            <h1 className="ocms-hero-title">
              Register and track your complaints online.
            </h1>
            <p className="ocms-hero-subtitle">
              Login or create a new account to submit your electricity, water,
              road, sanitation and public safety complaints through the OCMS
              website.
            </p>

            <div className="ocms-hero-cta-row">
              <button
                className="ocms-hero-btn ocms-hero-btn--primary"
                onClick={() => {
                  alert("Go to Login");
                  navigate("/citizen_login");
                }}
              >
                Login &amp; File Complaint
              </button>
              <button
                className="ocms-hero-btn ocms-hero-btn--secondary"
                onClick={() => {
                  alert("Go to New Registration");
                  navigate("/citizen_signup");
                }}
              >
                New User Registration
              </button>
            </div>

            <div className="ocms-hero-role-tags">
              <span>User (Citizen)</span>
              <span>Task Manager</span>
              <span>Admin</span>
            </div>
          </div>

          <div className="ocms-hero-slider-wrapper">
            <div
              className={`ocms-hero-slide ocms-hero-slide--${
                activeSlide.side === "left" ? "image-left" : "image-right"
              } ${isFading ? "ocms-hero-slide--hidden" : ""}`}
            >
              <div className="ocms-hero-slide-media">
                <img
                  src={activeSlide.image}
                  alt={activeSlide.title}
                  className="ocms-hero-slide-image"
                />
              </div>
              <div className="ocms-hero-slide-text">
                <h3>{activeSlide.title}</h3>
                <p>{activeSlide.text}</p>
              </div>
            </div>

            <div className="ocms-hero-slider-controls">
              <div className="ocms-hero-slider-arrows">
                <button
                  onClick={() => {
                    setIsFading(true);
                    setTimeout(() => {
                      setSlideIndex(
                        (prev) => (prev - 1 + SLIDES.length) % SLIDES.length
                      );
                      setIsFading(false);
                    }, 200);
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => {
                    setIsFading(true);
                    setTimeout(() => {
                      setSlideIndex((prev) => (prev + 1) % SLIDES.length);
                      setIsFading(false);
                    }, 200);
                  }}
                >
                  ›
                </button>
              </div>
              <div className="ocms-hero-slider-dots">
                {SLIDES.map((s, i) => (
                  <button
                    key={s.id}
                    className={`ocms-hero-slider-dot ${
                      i === slideIndex ? "ocms-hero-slider-dot--active" : ""
                    }`}
                    onClick={() => {
                      setIsFading(true);
                      setTimeout(() => {
                        setSlideIndex(i);
                        setIsFading(false);
                      }, 200);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BIG BOOK SECTION */}
      <section className="ocms-bigbook-section">
        <div className="ocms-bigbook-inner">
          <header className="ocms-bigbook-header">
            <h2>Complaint Domain Reading Room</h2>
            <p>
              Choose a complaint domain, open the book and flip through the
              pages to understand real issues and what to mention when you file
              your complaint.
            </p>
          </header>

          <div className="ocms-bigbook-tabs">
            {BOOKS.map((book) => (
              <button
                key={book.id}
                className={`ocms-bigbook-tab ${
                  activeBookId === book.id ? "ocms-bigbook-tab--active" : ""
                }`}
                onClick={() => handleSelectBook(book.id)}
              >
                {book.title}
              </button>
            ))}
          </div>

          <div className="ocms-bigbook-layout">
            <div className="ocms-bigbook-illustration">
              {currentBook ? (
                <img
                  src={currentBook.image}
                  alt={currentBook.title}
                  className="ocms-bigbook-illustration-img"
                />
              ) : (
                <div className="ocms-bigbook-illustration-placeholder">
                  <span>Select a book to begin reading</span>
                </div>
              )}
            </div>

            <div className="ocms-bigbook-container">
              {!currentBook && (
                <div className="ocms-bigbook-closed">
                  <div className="ocms-bigbook-closed-cover">
                    <span>Complaint Guide Book</span>
                    <p>Pick a domain from above to open the book.</p>
                  </div>
                </div>
              )}

              {currentBook && currentSpread && (
                <div
                  className={`ocms-bigbook-3d ${
                    turnDirection === "right"
                      ? "ocms-bigbook-3d--turn-right"
                      : ""
                  } ${
                    turnDirection === "left" ? "ocms-bigbook-3d--turn-left" : ""
                  }`}
                >
                  <div className="ocms-bigbook-pages">
                    <div className="ocms-bigbook-page ocms-bigbook-page--left">
                      <h3>{currentSpread.left}</h3>
                      <p>{currentSpread.right}</p>
                    </div>
                    <div className="ocms-bigbook-page ocms-bigbook-page--right">
                      <div className="ocms-bigbook-page-content">
                        <p className="ocms-bigbook-page-label">
                          Page {pageIndex + 1} of {totalPages}
                        </p>
                        <div className="ocms-bigbook-page-controls">
                          <button
                            disabled={pageIndex === 0}
                            onClick={() => turnPage("left")}
                          >
                            ← Previous
                          </button>
                          <button
                            disabled={pageIndex === totalPages - 1}
                            onClick={() => turnPage("right")}
                          >
                            Next →
                          </button>
                        </div>
                        <button
                          className="ocms-bigbook-complain-btn"
                          onClick={() =>
                            alert(
                              `Start complaint registration for: ${currentBook.title}`
                            )
                          }
                        >
                          File {currentBook.title} Complaint
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="ocms-footer">
        <div className="ocms-footer-top-border" />
        <div className="ocms-footer-inner">
          <div className="ocms-footer-col">
            <h4>Online Complaint Management System (OCMS)</h4>
            <p>
              A premium ERP‑style platform to register, route and resolve
              citizen complaints across multiple departments and organizations.
            </p>
          </div>
          <div className="ocms-footer-col">
            <h5>Quick Links</h5>
            <ul>
              <li>Home</li>
              <li>Complaints</li>
              <li>About Us</li>
              <li>Help</li>
              <li>Site Map</li>
            </ul>
          </div>
          <div className="ocms-footer-col">
            <h5>Contact</h5>
            <p>Email: support@ocms.in</p>
            <p>Phone: +91-7657658873</p>
            <p>Address: New Delhi, India</p>
          </div>
        </div>
        <div className="ocms-footer-bottom">
          © 2026 Online Complaint Management – All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}