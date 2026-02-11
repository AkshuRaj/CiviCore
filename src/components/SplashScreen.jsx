import "../styles/animation.css";
export default function SplashScreen() {
  return (
    <div className="splash-overlay">
      <div className="splash-card">
        <div className="splash-logo">
          <span className="splash-badge">OCMS</span>
          <h1 className="splash-title">Online Complaint Management</h1>
          <p className="splash-subtitle">Loading your dashboard…</p>
        </div>

        {/* rotating gradient ring */}
        <div className="splash-ring" />

        {/* bouncing dots */}
        <div className="splash-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}