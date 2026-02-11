// src/pages/AboutUs.jsx
import "./About.css";

export default function AboutUs({ onBack }) {
  return (
    <div className="about-page">
      {/* Top nav / back strip */}
      <header className="about-topbar">
        <button
          className="about-back-btn"
          onClick={onBack || (() => window.history.back())}
        >
          ← Back
        </button>
        <div className="about-brand">
          <span className="about-logo-circle">OC</span>
          <div>
            <p className="about-brand-title">
              Online Complaint Management System
            </p>
            <p className="about-brand-sub">
              Listening to every citizen, every day
            </p>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="about-hero">
        <div className="about-hero-text">
          <p className="about-hero-kicker">About OCMS</p>
          <h1>Built to make every genuine complaint count.</h1>
          <p className="about-hero-body">
            OCMS is a unified platform that helps citizens raise issues,
            authorities act faster, and everyone see transparent progress in one
            place.
          </p>
          <div className="about-hero-stats">
            <div className="about-stat-card">
              <span className="about-stat-label">Resolution target</span>
              <span className="about-stat-value">Within 7 days</span>
              <span className="about-stat-note">
                Working & non‑working days*
              </span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-label">Available</span>
              <span className="about-stat-value">24 × 7</span>
              <span className="about-stat-note">Log complaints anytime</span>
            </div>
            <div className="about-stat-card">
              <span className="about-stat-label">Domains</span>
              <span className="about-stat-value">Civic to Cyber</span>
              <span className="about-stat-note">Multi‑department routing</span>
            </div>
          </div>
        </div>
        <div className="about-hero-illustration">
          <div className="about-hero-orbit">
            <div className="about-hero-circle about-hero-circle--main">
              <span>citizen</span>
            </div>
            <div className="about-hero-circle about-hero-circle--small about-hero-circle--top">
              <span>local body</span>
            </div>
            <div className="about-hero-circle about-hero-circle--small about-hero-circle--right">
              <span>police</span>
            </div>
            <div className="about-hero-circle about-hero-circle--small about-hero-circle--bottom">
              <span>regulators</span>
            </div>
          </div>
        </div>
      </section>

      {/* History & mission */}
      <section className="about-section about-history">
        <div className="about-section-header">
          <h2>Our story</h2>
          <p>
            OCMS was created to replace scattered complaint boxes, emails and
            offline visits with one integrated, trackable complaint experience.
          </p>
        </div>
        <div className="about-timeline">
          <div className="about-timeline-item">
            <div className="about-timeline-dot" />
            <div className="about-timeline-content">
              <h3>Frustration with fragmented complaints</h3>
              <p>
                Citizens had to run between offices, file repeated complaints
                and rarely got clear updates. Authorities received issues in
                different formats and struggled to prioritise.
              </p>
            </div>
          </div>
          <div className="about-timeline-item">
            <div className="about-timeline-dot" />
            <div className="about-timeline-content">
              <h3>Designing a unified platform</h3>
              <p>
                OCMS was designed like an ERP for grievances – a single system
                where complaints are logged, classified, routed, tracked and
                closed with auditable history.
              </p>
            </div>
          </div>
          <div className="about-timeline-item">
            <div className="about-timeline-dot" />
            <div className="about-timeline-content">
              <h3>Today: transparent, data‑driven resolution</h3>
              <p>
                Citizens can see real‑time status; departments get dashboards,
                SLAs and analytics; administrators see the full picture across
                cities, districts and agencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="about-section about-pillars">
        <div className="about-section-header">
          <h2>What makes OCMS different</h2>
          <p>
            Three principles drive how we design every screen and every
            workflow.
          </p>
        </div>
        <div className="about-pillars-grid">
          <div className="about-pillars-card">
            <div className="about-pillars-icon">🧭</div>
            <h3>Transparent</h3>
            <p>
              Every complaint gets a unique ID, clear status updates and a
              timestamped trail from registration to closure.
            </p>
          </div>
          <div className="about-pillars-card">
            <div className="about-pillars-icon">⚡</div>
            <h3>Responsive</h3>
            <p>
              Our 7‑day action target ensures each complaint receives attention,
              whether raised on a weekday or holiday.
            </p>
          </div>
          <div className="about-pillars-card">
            <div className="about-pillars-icon">⚖️</div>
            <h3>Accountable</h3>
            <p>
              Escalation paths and audit logs ensure departments stay answerable
              for delays, misuse or negligence.
            </p>
          </div>
        </div>
      </section>

      {/* Policies & rules */}
      <section className="about-section about-policies">
        <div className="about-section-header">
          <h2>Policy, rules & citizen responsibilities</h2>
          <p>
            OCMS protects honest citizens and authorities by setting clear
            expectations on how to use the platform.
          </p>
        </div>
        <div className="about-policies-grid">
          <div className="about-policy-card">
            <h3>How to use OCMS</h3>
            <ul>
              <li>
                Share factual details, dates, locations and supporting proof.
              </li>
              <li>Use respectful, non‑abusive language in all descriptions.</li>
              <li>
                Avoid sharing highly sensitive personal data unless required for
                investigation.
              </li>
            </ul>
          </div>
          <div className="about-policy-card">
            <h3>False news & misuse risks</h3>
            <ul>
              <li>
                Filing knowingly false complaints or fake evidence may be
                reported to the competent authorities.
              </li>
              <li>
                Impersonating others or misusing OCMS to harass individuals or
                institutions can lead to legal action.
              </li>
              <li>
                Repeated misuse may result in account suspension as per policy.
              </li>
            </ul>
          </div>
          <div className="about-policy-card">
            <h3>Privacy & data handling</h3>
            <ul>
              <li>
                Citizen data is collected only for registration and complaint
                processing.
              </li>
              <li>
                Information is shared only with departments that need it to
                resolve the complaint.
              </li>
              <li>
                We follow strict access control and logging for all sensitive
                actions.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 7-day commitment band */}
      <section className="about-commitment">
        <div className="about-commitment-inner">
          <div>
            <h2>Our 7‑day action commitment</h2>
            <p>
              Every valid complaint registered on OCMS is targeted to receive
              action or a reasoned response within 7 days – including weekends
              and public holidays.
            </p>
          </div>
          <div className="about-commitment-points">
            <div className="about-commitment-pill">
              <span>Instant acknowledgement</span>
            </div>
            <div className="about-commitment-pill">
              <span>Live status tracking</span>
            </div>
            <div className="about-commitment-pill">
              <span>Escalation if delayed</span>
            </div>
          </div>
        </div>
        <p className="about-commitment-footnote">
          *Some complex criminal, inter‑departmental or court‑linked matters may
          require longer timelines, but status and reasons are always visible.
        </p>
      </section>

      {/* FAQ / help */}
      <section className="about-section about-faq">
        <div className="about-section-header">
          <h2>Still have questions?</h2>
          <p>
            Here are a few quick answers before you start using the Online
            Complaint Management System.
          </p>
        </div>
        <div className="about-faq-grid">
          <div className="about-faq-item">
            <h3>Is OCMS available 24×7?</h3>
            <p>
              Yes. You can file complaints at any time. Departments act
              according to office hours, but you can submit and track 24×7.
            </p>
          </div>
          <div className="about-faq-item">
            <h3>Can I track my complaint online?</h3>
            <p>
              Every complaint comes with a unique ID and a timeline view so you
              can see progress, actions and closure remarks.
            </p>
          </div>
          <div className="about-faq-item">
            <h3>What if my complaint is ignored?</h3>
            <p>
              If no action is recorded within the 7‑day window, OCMS flags the
              case for escalation to higher authorities.
            </p>
          </div>
          <div className="about-faq-item">
            <h3>What happens if I submit false information?</h3>
            <p>
              Deliberate false complaints or fake evidence can be shared with
              authorities for appropriate legal action.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
