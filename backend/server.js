const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendOtpEmail = require("./mailer");

const app = express();
const fs = require('fs');
const multer = require('multer');
app.use(cors());
app.use(express.json());

// ensure uploads directory exists
const UPLOAD_DIR = __dirname + '/uploads';
try {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
} catch (e) {
  console.warn('Could not create upload dir', e);
}

// multer storage for handling proof uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const safeName = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safeName);
  }
});
const upload = multer({ storage });

// JWT Secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }
    req.userId = decoded.id;
    req.userEmail = decoded.email;
    next();
  });
}

// ---------------- DB CONNECTION ----------------
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "my_root_aksh_04",
  database: "complaint_db",
});

db.connect((err) => {
  if (err) {
    console.error("MySQL connection failed:", err);
    process.exit(1);
  }
  console.log("MySQL connected");
});

// ---------------- GENERATE OTP ----------------
app.post("/get_otp", async (req, res) => {
  try {
    const form = req.body;

    if (!form.acceptTerms || !form.acceptPrivacy) {
      return res.status(400).json({ message: "Consent required" });
    }

    if (form.password !== form.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    db.query(
      `REPLACE INTO citizen_otps (email, otp, form_data, expires_at) VALUES (?, ?, ?, ?)`,
      [form.email, otp, JSON.stringify(form), expiresAt],
      async (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "OTP storage failed" });
        }

        try {
          await sendOtpEmail(form.email, otp);
          res.json({ message: "OTP sent to email successfully" });
        } catch (mailErr) {
          console.error("Mail Error:", mailErr);
          res.status(500).json({ message: "OTP email failed" });
        }
      }
    );
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- VERIFY OTP ----------------
app.post("/verify_otp", async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: "Email and OTP required" });
  }

  db.query(
    `SELECT * FROM citizen_otps WHERE email=? AND otp=? AND expires_at > NOW()`,
    [email, otp],
    async (err, rows) => {
      if (err) {
        console.error("OTP Select Error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      let form;
      try {
        form = JSON.parse(rows[0].form_data);
      } catch (parseErr) {
        console.error("JSON Parse Error:", parseErr);
        return res.status(500).json({ message: "Corrupted registration data" });
      }

      try {
        const hashedPassword = await bcrypt.hash(form.password, 10);

        const insertQuery = `INSERT INTO CitizenSignup (
          first_name, last_name, dob, gender, mobile, email, password,
          country, state, district, city, pincode,
          address_line1, address_line2,
          gov_id_type, gov_id_last4, alt_phone,
          language, notify_sms, notify_email, notify_whatsapp
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const values = [
          form.firstName,
          form.lastName,
          form.dob,
          form.gender,
          form.mobile,
          form.email,
          hashedPassword,
          form.country,
          form.state,
          form.district,
          form.city,
          form.pincode,
          form.addressLine1,
          form.addressLine2,
          form.govIdType,
          form.govIdLast4,
          form.altPhone,
          form.language,
          form.notifySms ? 1 : 0,
          form.notifyEmail ? 1 : 0,
          form.notifyWhatsApp ? 1 : 0,
        ];

        db.query(insertQuery, values, (insertErr, result) => {
          if (insertErr) {
            console.error("DB Insert Error:", insertErr);
            return res.status(500).json({ message: "User creation failed" });
          }

          db.query("DELETE FROM citizen_otps WHERE email=?", [email]);
          
          // Generate token for new user
          const token = jwt.sign(
            { id: result.insertId, email: form.email },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({
            message: "Registration successful",
            token,
            user: {
              id: result.insertId,
              email: form.email,
              name: `${form.firstName} ${form.lastName}`.trim(),
              mobile: form.mobile
            }
          });
        });
      } catch (hashErr) {
        console.error("Hash Error:", hashErr);
        res.status(500).json({ message: "Password hashing failed" });
      }
    }
  );
});

app.post("/login/password", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT id, email, password, first_name, last_name, mobile FROM citizensignup WHERE email=?",
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const match = await bcrypt.compare(password, rows[0].password);
      if (!match) {
        return res.status(400).json({ message: "Invalid email or password" });
      }

      const user = rows[0];
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      res.json({
        message: "Login successful",
        token,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim(),
          mobile: user.mobile
        }
      });
    }
  );
});

app.post("/login/request-otp", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM citizensignup WHERE email=?",
    [email],
    async (err, rows) => {
      if (rows.length === 0) {
        return res.status(400).json({ message: "Email not registered" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        `REPLACE INTO login_otps (email, otp, purpose, expires_at)
         VALUES (?, ?, 'login', ?)`,
        [email, otp, expiresAt],
        async (err) => {
          if (err) return res.status(500).json({ message: "OTP failed" });

          await sendOtpEmail(email, otp);
          res.json({ message: "OTP sent for login" });
        }
      );
    }
  );
});

app.post("/login/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    `SELECT * FROM login_otps
     WHERE email=? AND otp=? AND purpose='login' AND expires_at > NOW()`,
    [email, otp],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // Fetch user data from CitizenSignup table
      db.query(
        "SELECT id, email, first_name, last_name, mobile FROM citizensignup WHERE email=?",
        [email],
        (userErr, userRows) => {
          db.query("DELETE FROM login_otps WHERE email=?", [email]);
          
          if (userErr || userRows.length === 0) {
            return res.status(400).json({ message: "User not found" });
          }

          const user = userRows[0];
          const token = jwt.sign(
            { id: user.id, email: user.email },
            JWT_SECRET,
            { expiresIn: "7d" }
          );

          res.json({
            message: "Login successful via OTP",
            token,
            user: {
              id: user.id,
              email: user.email,
              name: `${user.first_name} ${user.last_name}`.trim(),
              mobile: user.mobile
            }
          });
        }
      );
    }
  );
});


app.post("/forgot/request-otp", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM citizensignup WHERE email=?",
    [email],
    async (err, rows) => {
      if (rows.length === 0) {
        return res.status(400).json({ message: "Email not registered" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      db.query(
        `REPLACE INTO login_otps (email, otp, purpose, expires_at)
         VALUES (?, ?, 'forgot', ?)`,
        [email, otp, expiresAt],
        async () => {
          await sendOtpEmail(email, otp);
          res.json({ message: "Password reset OTP sent" });
        }
      );
    }
  );
});


app.post("/forgot/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  db.query(
    `SELECT * FROM login_otps
     WHERE email=? AND otp=? AND purpose='forgot' AND expires_at > NOW()`,
    [email, otp],
    async (err, rows) => {
      if (rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE citizens SET password=? WHERE email=?",
        [hashed, email],
        () => {
          db.query("DELETE FROM login_otps WHERE email=?", [email]);
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

// ============================================
// ======== PROTECTED USER ENDPOINTS ========
// ============================================

// Get user profile
app.get("/api/user-profile", verifyToken, (req, res) => {
  db.query(
    "SELECT id, email, first_name, last_name, mobile, dob, gender, country, state, district, city FROM citizensignup WHERE id=?",
    [req.userId],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = rows[0];
      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: `${user.first_name} ${user.last_name}`.trim(),
          mobile: user.mobile,
          dob: user.dob,
          gender: user.gender,
          country: user.country,
          state: user.state,
          district: user.district,
          city: user.city
        }
      });
    }
  );
});

// Get user complaints stats
app.get("/api/complaints/stats", verifyToken, (req, res) => {
  db.query(
    `SELECT 
      COUNT(*) as total,
      0 as pending,
      0 as closed
     FROM complaints WHERE user_id = ?`,
    [req.userId],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ message: "Failed to fetch stats" });
      }

      const stats = rows[0] || { total: 0, pending: 0, closed: 0 };
      res.json({ stats });
    }
  );
});

// Get user's complaints
app.get('/api/user-complaints', verifyToken, (req, res) => {
  // Join complaints with category and location names
  db.query(
    `SELECT c.id, c.title, c.description, c.status, c.priority, c.created_at, \
            cat.name AS category, loc.name AS city, c.address, c.landmark \
     FROM complaints c \
     LEFT JOIN categories cat ON c.category_id = cat.id \
     LEFT JOIN locations loc ON c.location_id = loc.id \
     WHERE c.user_id = ? \
     ORDER BY c.id DESC`,
    [req.userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to fetch user complaints', err);
        return res.status(500).json({ message: 'Failed to fetch complaints' });
      }
      // Normalize timestamps to consistent keys expected by frontend
      const complaints = (rows || []).map(r => ({
        id: r.id,
        title: r.title,
        description: r.description,
        status: r.status || 'REGISTERED',
        priority: r.priority,
        created_at: r.created_at || null,
        registeredAt: r.created_at || null,
        category: r.category || '',
        city: r.city || '',
        address: r.address || '',
        landmark: r.landmark || ''
      }));

      res.json({ complaints });
    }
  );
});

// Create new complaint (JSON or multipart)
app.post("/api/complaints", verifyToken, upload.single('proof'), (req, res) => {
  const {
    title,
    category,   // "Water"
    city,       // "City A"
    address,
    landmark,
    description,
    priority
  } = req.body;

  if (!title || !category || !city || !address) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // 1️⃣ Get category_id from category name
  db.query(
    "SELECT id FROM categories WHERE name = ?",
    [category],
    (catErr, catRows) => {

      if (catErr || catRows.length === 0) {
        return res.status(400).json({ message: "Invalid category" });
      }

      const categoryId = catRows[0].id;

      // 2️⃣ Get location_id from city name
      db.query(
        "SELECT id FROM locations WHERE name = ?",
        [city],
        (locErr, locRows) => {

          if (locErr || locRows.length === 0) {
            return res.status(400).json({ message: "Invalid location" });
          }

          const locationId = locRows[0].id;

          // 3️⃣ Insert complaint correctly (matches your DB schema)

          db.query(
            `INSERT INTO complaints 
            (user_id, title, description, category_id, location_id, address, landmark, priority)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              req.userId,
              title,
              description,
              categoryId,
              locationId,
              address,
              landmark || null,
              (priority || "NORMAL").toUpperCase()
            ],
            (err, result) => {

              if (err) {
                console.error("DB Insert Error:", err);
                return res.status(500).json({ message: "Failed to register complaint" });
              }

              res.json({
                message: "Complaint registered successfully",
                id: result.insertId
              });
            }
          );
        }
      );
    }
  );
});


// ============================================
// =========== SERVER START ==================
// ============================================
app.listen(5000, () => {
  console.log("Server running on port 5000");
});