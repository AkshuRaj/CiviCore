const express = require("express");
const router = express.Router();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("../mailer");
const { sendSms } = require("../smsService");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// ─────────────────────────────────────────────
// DB CONNECTION (same credentials as server.js)
// ─────────────────────────────────────────────
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "my_root_aksh_04",
  database: "complaintt_system",
});

db.connect((err) => {
  if (err) {
    console.error("Staff Registration DB connection failed:", err);
  } else {
    console.log("Staff Registration DB connected");
    ensureTables();
  }
});

// ─────────────────────────────────────────────
// ENSURE TABLES EXIST ON STARTUP
// ─────────────────────────────────────────────
function ensureTables() {
  const staffRegTable = `
    CREATE TABLE IF NOT EXISTS staff_registrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(15) NOT NULL,
      role ENUM('SECONDARY_ADMIN','HEAD','STAFF','EMPLOYEE') NOT NULL,
      department VARCHAR(100),
      country VARCHAR(100) NOT NULL,
      state VARCHAR(100) NOT NULL,
      district VARCHAR(100),
      city VARCHAR(100),
      aadhaar VARCHAR(12) UNIQUE NOT NULL,
      pan VARCHAR(20),
      voter_id VARCHAR(20),
      address TEXT NOT NULL,
      qualification VARCHAR(100),
      years_of_experience VARCHAR(50),
      designation VARCHAR(100),
      status ENUM('PENDING','APPROVED','REJECTED') DEFAULT 'PENDING',
      approved_by INT DEFAULT NULL,
      approved_at TIMESTAMP NULL,
      rejection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `;

  const otpTable = `
    CREATE TABLE IF NOT EXISTS staff_registration_otps (
      email VARCHAR(100) PRIMARY KEY,
      otp VARCHAR(6) NOT NULL,
      form_data LONGTEXT NOT NULL,
      expires_at DATETIME NOT NULL
    )
  `;

  db.query(staffRegTable, (err) => {
    if (err) console.error("Failed to create staff_registrations table:", err.message);
    else console.log("✅ staff_registrations table ready");
  });
  db.query(otpTable, (err) => {
    if (err) console.error("Failed to create staff_registration_otps table:", err.message);
    else console.log("✅ staff_registration_otps table ready");
  });
}

// ─────────────────────────────────────────────
// AUTH MIDDLEWARE for staff JWT
// ─────────────────────────────────────────────
function verifyStaffToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired token" });
    req.staffId = decoded.id;
    req.staffRole = decoded.role;
    req.staffState = decoded.state;
    req.staffDistrict = decoded.district;
    req.staffCity = decoded.city;
    req.isAdmin = decoded.isAdmin || false;
    next();
  });
}

// ─────────────────────────────────────────────
// HELPER: Determine which role this approver can approve
// ─────────────────────────────────────────────
function canApproveRole(approverRole, isAdmin) {
  if (isAdmin) return "SECONDARY_ADMIN";
  if (approverRole === "SECONDARY_ADMIN") return "HEAD";
  if (approverRole === "HEAD") return "STAFF";
  if (approverRole === "STAFF") return "EMPLOYEE";
  return null;
}

// ─────────────────────────────────────────────
// QUEUE concept: get pending applications in FIFO order
// the approver can see, scoped by their location
// ─────────────────────────────────────────────
function buildPendingQuery(req) {
  const targetRole = canApproveRole(req.staffRole, req.isAdmin);
  if (!targetRole) return null;

  let conditions = ["sr.status = 'PENDING'", "sr.role = ?"];
  let params = [targetRole];

  if (req.isAdmin) {
    // Admin can see all SECONDARY_ADMIN applicants (no location filter)
  } else if (req.staffRole === "SECONDARY_ADMIN") {
    // Secondary admin scoped to their state
    conditions.push("sr.state = ?");
    params.push(req.staffState);
  } else if (req.staffRole === "HEAD") {
    // Head scoped to their district
    conditions.push("sr.state = ?", "sr.district = ?");
    params.push(req.staffState, req.staffDistrict);
  } else if (req.staffRole === "STAFF") {
    // Staff scoped to their city
    conditions.push("sr.state = ?", "sr.district = ?", "sr.city = ?");
    params.push(req.staffState, req.staffDistrict, req.staffCity);
  }

  const whereClause = conditions.join(" AND ");
  const sql = `
    SELECT sr.id, sr.name, sr.email, sr.phone, sr.role, sr.department,
           sr.country, sr.state, sr.district, sr.city,
           sr.qualification, sr.years_of_experience, sr.designation,
           sr.status, sr.created_at
    FROM staff_registrations sr
    WHERE ${whereClause}
    ORDER BY sr.created_at ASC
  `;
  return { sql, params };
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 1: POST /api/staff-register/request-otp
// Send OTP before staff registration
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/request-otp", async (req, res) => {
  const form = req.body;

  if (!form.email || !form.password || !form.name || !form.role || !form.aadhaar) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["SECONDARY_ADMIN", "HEAD", "STAFF", "EMPLOYEE"].includes(form.role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  if (form.password !== form.confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }

  // Check if email already registered
  db.query(
    "SELECT id, status FROM staff_registrations WHERE email = ?",
    [form.email],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length > 0) {
        const existing = rows[0];
        if (existing.status === "PENDING") {
          return res.status(400).json({ message: "Application already submitted and pending approval." });
        }
        if (existing.status === "APPROVED") {
          return res.status(400).json({ message: "Email already registered and approved." });
        }
        // If REJECTED, allow re-application by deleting old record
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        "REPLACE INTO staff_registration_otps (email, otp, form_data, expires_at) VALUES (?, ?, ?, ?)",
        [form.email, otp, JSON.stringify(form), expiresAt],
        async (otpErr) => {
          if (otpErr) return res.status(500).json({ message: "OTP storage failed" });
          try {
            await sendOtpEmail(form.email, otp);
            if (form.phone) await sendSms(form.phone, `Your OCMS Staff Verification OTP is: ${otp}`);
            res.json({ message: "OTP sent to your email and SMS successfully" });
          } catch (mailErr) {
            console.error("Mail Error:", mailErr);
            res.status(500).json({ message: "Failed to send OTP message" });
          }
        }
      );
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 2: POST /api/staff-register/verify-otp
// Verify OTP, insert into staff_registrations as PENDING
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ message: "Email and OTP required" });

  db.query(
    "SELECT * FROM staff_registration_otps WHERE email = ? AND otp = ? AND expires_at > NOW()",
    [email, otp],
    async (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0) return res.status(400).json({ message: "Invalid or expired OTP" });

      let form;
      try {
        form = JSON.parse(rows[0].form_data);
      } catch (e) {
        return res.status(500).json({ message: "Corrupted form data" });
      }

      try {
        const hashedPassword = await bcrypt.hash(form.password, 10);

        // If previously REJECTED, delete that record
        db.query("DELETE FROM staff_registrations WHERE email = ? AND status = 'REJECTED'", [email]);

        const insertSQL = `
          INSERT INTO staff_registrations
            (name, email, password, phone, role, department,
             country, state, district, city,
             aadhaar, pan, voter_id, address,
             qualification, years_of_experience, designation, status)
          VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,'PENDING')
        `;
        const values = [
          form.name, form.email, hashedPassword, form.phone, form.role,
          form.department || null,
          form.country, form.state,
          form.district || null, form.city || null,
          form.aadhaar, form.pan || null, form.voterId || null,
          form.address,
          form.qualification || null,
          form.yearsOfExperience || null,
          form.designation || null,
        ];

        db.query(insertSQL, values, (insertErr) => {
          if (insertErr) {
            console.error("Staff registration insert error:", insertErr);
            if (insertErr.code === "ER_DUP_ENTRY") {
              return res.status(400).json({ message: "Email or Aadhaar already registered" });
            }
            return res.status(500).json({ message: "Registration failed" });
          }

          db.query("DELETE FROM staff_registration_otps WHERE email = ?", [email]);
          res.json({
            message: "Application submitted successfully! Your application is pending approval.",
            role: form.role,
          });
        });
      } catch (hashErr) {
        console.error("Hash error:", hashErr);
        res.status(500).json({ message: "Password hashing failed" });
      }
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 3: POST /api/staff-register/login
// Login for approved staff (all roles) and admins
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  // First check admins table
  db.query(
    "SELECT admin_id, admin_name, admin_email, admin_password, role, status FROM admins WHERE admin_email = ?",
    [email],
    async (err, adminRows) => {
      if (err) return res.status(500).json({ message: "DB error" });

      if (adminRows.length > 0) {
        const admin = adminRows[0];
        if (admin.status !== "ACTIVE") {
          return res.status(403).json({ message: "Admin account is inactive" });
        }
        const match = await bcrypt.compare(password, admin.admin_password);
        if (!match) return res.status(401).json({ message: "Invalid email or password" });

        const token = jwt.sign(
          { id: admin.admin_id, email: admin.admin_email, role: admin.role, isAdmin: true },
          JWT_SECRET,
          { expiresIn: "7d" }
        );
        return res.json({
          message: "Admin login successful",
          token,
          user: {
            id: admin.admin_id,
            name: admin.admin_name,
            email: admin.admin_email,
            role: admin.role,
            isAdmin: true,
          },
        });
      }

      // Check staff_registrations
      db.query(
        "SELECT id, name, email, password, role, status, state, district, city FROM staff_registrations WHERE email = ?",
        [email],
        async (err2, staffRows) => {
          if (err2) return res.status(500).json({ message: "DB error" });
          if (staffRows.length === 0) return res.status(401).json({ message: "Invalid email or password" });

          const staff = staffRows[0];

          if (staff.status === "PENDING") {
            return res.status(403).json({
              message: "Your application is pending approval. Please wait for approval.",
              status: "PENDING",
            });
          }
          if (staff.status === "REJECTED") {
            return res.status(403).json({
              message: "Your application was rejected. Please contact support.",
              status: "REJECTED",
            });
          }

          const match = await bcrypt.compare(password, staff.password);
          if (!match) return res.status(401).json({ message: "Invalid email or password" });

          const token = jwt.sign(
            {
              id: staff.id,
              email: staff.email,
              role: staff.role,
              isAdmin: false,
              state: staff.state,
              district: staff.district,
              city: staff.city,
            },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({
            message: "Login successful",
            token,
            user: {
              id: staff.id,
              name: staff.name,
              email: staff.email,
              role: staff.role,
              isAdmin: false,
              state: staff.state,
              district: staff.district,
              city: staff.city,
            },
          });
        }
      );
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 4: GET /api/staff-register/pending
// List pending applications the logged-in user can approve (QUEUE - FIFO)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/pending", verifyStaffToken, (req, res) => {
  const query = buildPendingQuery(req);
  if (!query) {
    return res.status(403).json({ message: "You do not have permission to approve applicants" });
  }

  db.query(query.sql, query.params, (err, rows) => {
    if (err) {
      console.error("Pending query error:", err);
      return res.status(500).json({ message: "Failed to fetch pending applications" });
    }
    res.json({ applications: rows, targetRole: canApproveRole(req.staffRole, req.isAdmin) });
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 5: PUT /api/staff-register/:id/approve
// Approve a pending staff application (role + location check)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put("/:id/approve", verifyStaffToken, (req, res) => {
  const { id } = req.params;
  const targetRole = canApproveRole(req.staffRole, req.isAdmin);
  if (!targetRole) {
    return res.status(403).json({ message: "You do not have permission to approve applicants" });
  }

  // Fetch the application first to validate role + location scope
  db.query(
    "SELECT id, role, state, district, city, status FROM staff_registrations WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0) return res.status(404).json({ message: "Application not found" });

      const app = rows[0];
      if (app.status !== "PENDING") {
        return res.status(400).json({ message: "Application is not in PENDING state" });
      }
      if (app.role !== targetRole) {
        return res.status(403).json({ message: `You can only approve ${targetRole} applications` });
      }

      // Location scope validation (STACK concept - each level can only approve within their scope)
      if (!req.isAdmin) {
        if (req.staffRole === "SECONDARY_ADMIN" && app.state !== req.staffState) {
          return res.status(403).json({ message: "Application is outside your state jurisdiction" });
        }
        if (req.staffRole === "HEAD") {
          if (app.state !== req.staffState || app.district !== req.staffDistrict) {
            return res.status(403).json({ message: "Application is outside your district jurisdiction" });
          }
        }
        if (req.staffRole === "STAFF") {
          if (app.state !== req.staffState || app.district !== req.staffDistrict || app.city !== req.staffCity) {
            return res.status(403).json({ message: "Application is outside your city jurisdiction" });
          }
        }
      }

      db.query(
        "UPDATE staff_registrations SET status = 'APPROVED', approved_by = ?, approved_at = NOW() WHERE id = ?",
        [req.staffId, id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ message: "Failed to approve application" });
          res.json({ message: "Application approved successfully" });
        }
      );
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 6: PUT /api/staff-register/:id/reject
// Reject a pending staff application
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.put("/:id/reject", verifyStaffToken, (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const targetRole = canApproveRole(req.staffRole, req.isAdmin);
  if (!targetRole) {
    return res.status(403).json({ message: "You do not have permission to reject applicants" });
  }

  db.query(
    "SELECT id, role, state, district, city, status FROM staff_registrations WHERE id = ?",
    [id],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0) return res.status(404).json({ message: "Application not found" });

      const app = rows[0];
      if (app.status !== "PENDING") {
        return res.status(400).json({ message: "Application is not in PENDING state" });
      }
      if (app.role !== targetRole) {
        return res.status(403).json({ message: `You can only reject ${targetRole} applications` });
      }

      db.query(
        "UPDATE staff_registrations SET status = 'REJECTED', rejection_reason = ?, approved_by = ?, approved_at = NOW() WHERE id = ?",
        [reason || null, req.staffId, id],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ message: "Failed to reject application" });
          res.json({ message: "Application rejected successfully" });
        }
      );
    }
  );
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 7: GET /api/staff-register/profile
// Get current logged-in staff's profile
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/profile", verifyStaffToken, (req, res) => {
  if (req.isAdmin) {
    db.query(
      "SELECT admin_id as id, admin_name as name, admin_email as email, role FROM admins WHERE admin_id = ?",
      [req.staffId],
      (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ message: "Admin not found" });
        res.json({ profile: { ...rows[0], isAdmin: true } });
      }
    );
  } else {
    db.query(
      "SELECT id, name, email, phone, role, department, country, state, district, city, designation, status FROM staff_registrations WHERE id = ?",
      [req.staffId],
      (err, rows) => {
        if (err || rows.length === 0) return res.status(404).json({ message: "Profile not found" });
        res.json({ profile: rows[0] });
      }
    );
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ROUTE 8: GET /api/staff-register/check-status
// Public: check application status by email
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get("/check-status", (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ message: "Email required" });

  db.query(
    "SELECT name, role, status, rejection_reason, created_at FROM staff_registrations WHERE email = ?",
    [email],
    (err, rows) => {
      if (err) return res.status(500).json({ message: "DB error" });
      if (rows.length === 0) return res.status(404).json({ message: "No application found for this email" });
      res.json({ application: rows[0] });
    }
  );
});

module.exports = router;
