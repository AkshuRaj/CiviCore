// src/pages/ContactUs.jsx
import { useState } from "react";
import React from "react";
import "./ContactUs.css";

export default function ContactUs({ onBack }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    category: "portal",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState({ type: "", text: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus({ type: "", text: "" });

    if (!form.name || !form.email || !form.subject || !form.message) {
      setStatus({ type: "error", text: "Please fill all required fields." });
      return;
    }

    // Here you can POST to your backend /api/contact
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStatus({
        type: "success",
        text: "Thank you for reaching out. Our team will contact you soon.",
      });
      setForm({
        name: "",
        email: "",
        phone: "",
        category: "portal",
        subject: "",
        message: "",
      });
    }, 800);
  };

  return (
    <div className="contact-page">
      <header className="contact-topbar">
        <button
          className="contact-back-btn"
          onClick={onBack || (() => window.history.back())}
        >
          ← Back
        </button>
        <div className="contact-brand">
          <span className="contact-logo-circle">OC</span>
          <div>
            <p className="contact-brand-title">
              Online Complaint Management System
            </p>
            <p className="contact-brand-sub">
              Help desk for citizens and partners
            </p>
          </div>
        </div>
      </header>

      <section className="contact-hero">
        <div className="contact-hero-text">
          <p className="contact-hero-kicker">Contact OCMS Support</p>
          <h1>Need help with your complaints or account?</h1>
          <p className="contact-hero-body">
            Reach out to the OCMS support team for portal issues, registration
            problems, feedback, or partnership enquiries. Complaint registration
            itself should be done through the &quot;File Complaint&quot; flows.
          </p>
          <div className="contact-response-banner">
            <span className="contact-response-label">Response time</span>
            <span className="contact-response-text">
              We reply to most messages within 24–48 hours, 7 days a week.
            </span>
          </div>
          <div className="contact-highlight-pills">
            <span className="contact-pill">Account & login</span>
            <span className="contact-pill">Portal technical issues</span>
            <span className="contact-pill">General feedback</span>
            <span className="contact-pill">Media & partnerships</span>
          </div>
        </div>

        <div className="contact-hero-illustration">
          <div className="contact-support-orbit">
            <div className="contact-support-node contact-support-node--center">
              <span>OCMS</span>
            </div>
            <div className="contact-support-node contact-support-node--top">
              <span>citizen</span>
            </div>
            <div className="contact-support-node contact-support-node--left">
              <span>support</span>
            </div>
            <div className="contact-support-node contact-support-node--right">
              <span>departments</span>
            </div>
          </div>
        </div>
      </section>

      <main className="contact-main">
        <section className="contact-info-card">
          <h2>Contact information</h2>
          <p className="contact-info-text">
            Choose the channel that works best for you. For sensitive case
            details, use your registered account inside OCMS instead of email.
          </p>

          <div className="contact-info-grid">
            <div className="contact-info-item">
              <div className="contact-info-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>support@ocms.in</p>
                <p className="contact-info-note">
                  For account issues, portal bugs, feedback.
                </p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">📞</div>
              <div>
                <h3>Helpdesk</h3>
                <p>+91‑00000‑00000</p>
                <p className="contact-info-note">
                  Monday to Saturday, 9:00 AM – 7:00 PM.
                </p>
              </div>
            </div>
            <div className="contact-info-item">
              <div className="contact-info-icon">📍</div>
              <div>
                <h3>Office</h3>
                <p>
                  OCMS HQ, New Delhi,
                  <br />
                  India.
                </p>
                <p className="contact-info-note">
                  For official visits by prior appointment only.
                </p>
              </div>
            </div>
          </div>

          <div className="contact-help-links">
            <p>
              Looking for quick answers? Visit our{" "}
              <span className="contact-link">Help & FAQs</span> or{" "}
              <span className="contact-link">About OCMS</span> pages.
            </p>
          </div>
        </section>

        <section className="contact-form-card">
          <h2>Send us a message</h2>
          <p className="contact-form-text">
            Fill out the form and our team will route your message to the right
            support specialist.
          </p>

          {status.text && (
            <div
              className={`contact-status contact-status--${
                status.type || "info"
              }`}
            >
              {status.text}
            </div>
          )}

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="contact-form-grid">
              <div className="contact-field">
                <label htmlFor="name">
                  Full name <span>*</span>
                </label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="email">
                  Email address <span>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="contact-field">
                <label htmlFor="phone">Phone number</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>

              <div className="contact-field">
                <label htmlFor="category">Topic</label>
                <select
                  id="category"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="portal">Portal / technical issue</option>
                  <option value="account">Account / login problem</option>
                  <option value="feedback">Feedback / suggestion</option>
                  <option value="media">Media / partnership</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="contact-field contact-field--full">
                <label htmlFor="subject">
                  Subject <span>*</span>
                </label>
                <input
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="contact-field contact-field--full">
                <label htmlFor="message">
                  Your message <span>*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <p className="contact-form-hint">
              Do not include passwords, OTPs or highly sensitive personal
              information in this form. Use your secure OCMS account for
              complaint details.
            </p>

            <button className="contact-submit" type="submit" disabled={loading}>
              {loading ? "Sending..." : "Send message"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
