const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname),
});

const upload = multer({ storage });

const {
  sendAssignmentMail,
  sendCitizenConfirmationMail,
  sendCitizenResolvedMail,
  sendHeadResolvedMail,
  sendCitizenEmployeeUpdateMail,
  sendHeadEmployeeUpdateMail,
  sendStaffEmployeeUpdateMail,
  sendEmployeeAssignmentMail,
  sendStaffToCitizenUpdateMail,
  sendStaffToHeadUpdateMail
} = require("./utils/mailer");

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

const otpStore = new Map();

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}


/* =========================
   DATABASE
========================= */
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "chithu",
  database: "complaintt_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* =========================
   STAFF REGISTER  CLEAN
========================= */
app.post("/staff/register", async (req, res) => {
  const {
    name,
    email,
    password,
    department,
    location,
    status,
    aadhaar,
    pan,
    voterId,
    phone,
    address,
    country,
    state,
    city
  } = req.body; 2

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = `
      INSERT INTO staff
      (name, email, password, department, location, status,
       aadhaar, pan, voter_id, phone, address, country, state, district)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `;

    db.query(
      sql,
      [
        name,
        email,
        hashedPassword,
        department,
        location,
        status || "ACTIVE",
        aadhaar,
        pan,
        voterId,
        phone,
        address,
        country,
        state,
        city
      ],
      (err, result) => {
        if (err) {
          console.error("Staff Registration Error:", err);
          return res.status(500).json({ message: "Staff Registration Failed" });
        }

        db.query(
          "INSERT INTO staff_availability (staff_id, status) VALUES (?, 'AVAILABLE')",
          [result.insertId],
          () => res.json({ message: "Staff Registered Successfully" })
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});


/* =========================
   HEAD REGISTER   FIXED
========================= */
app.post("/head/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      department,
      country,
      state,
      city,
      location,
      aadhaar,
      pan,
      voterId,
      phone,
      address,
      qualification,
      yearsOfExperience,
      departmentExperience,
      designation
    } = req.body;

    //  Required field validation
    if (
      !name || !email || !password ||
      !aadhaar || !pan || !phone || !address ||
      !qualification || !yearsOfExperience ||
      !departmentExperience || !designation
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    //  Aadhaar validation
    if (!/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({ message: "Invalid Aadhaar" });
    }

    //  PAN validation
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(pan)) {
      return res.status(400).json({ message: "Invalid PAN" });
    }

    //  Phone validation
    if (!/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Invalid phone number" });
    }

    // Check duplicate email
    db.query(
      "SELECT id FROM heads WHERE email=?",
      [email],
      async (err, rows) => {
        if (rows.length) {
          return res.status(400).json({ message: "Email already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = `
INSERT INTO heads (
  name, email, password, department,
  country, state, city, location,
  aadhaar, pan, voter_id,
  phone, address,
  qualification, years_of_experience,
  department_experience, designation,
  status
)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')
`;

        db.query(
          sql,
          [
            name,
            email,
            hashedPassword,
            department,
            country,
            state,
            city,
            location,
            aadhaar,
            pan,
            voterId || null,   //  SAFE
            phone,
            address,
            qualification,
            yearsOfExperience,
            departmentExperience,
            designation
          ],
          (err) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ message: "Database error" });
            }

            res.json({ message: "Head registered successfully" });
          }
        );
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});


/* =========================
   HEAD VERIFICATION (ADMIN ONLY)
========================= */
// Get all pending head registrations
app.get("/admin/heads/pending", (req, res) => {
  const sql = `
    SELECT id, name, email, department, designation,
           qualification, years_of_experience, department_experience,
           approval_code, created_at, status
    FROM heads
    WHERE status = 'PENDING'
    ORDER BY created_at DESC
  `;

  db.query(sql, (err, heads) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching pending heads", error: err.message });
    }

    res.json({
      count: heads.length,
      heads
    });
  });
});

// Approve head registration
app.put("/admin/heads/:id/approve", (req, res) => {
  const headId = req.params.id;
  const { approvedBy } = req.body; // Admin ID who is approving

  const sql = `
    UPDATE heads
    SET status = 'ACTIVE', verified_at = NOW(), verified_by = ?
    WHERE id = ?
  `;

  db.query(sql, [approvedBy || "ADMIN", headId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error approving head", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Head not found" });
    }

    res.json({ message: "Head approved successfully and is now ACTIVE" });
  });
});

// Reject head registration
app.put("/admin/heads/:id/reject", (req, res) => {
  const headId = req.params.id;
  const { reason, rejectedBy } = req.body;

  const sql = `
    UPDATE heads
    SET status = 'REJECTED', rejection_reason = ?, verified_at = NOW(), verified_by = ?
    WHERE id = ?
  `;

  db.query(sql, [reason || "Not qualified", rejectedBy || "ADMIN", headId], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error rejecting head", error: err.message });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Head not found" });
    }

    res.json({ message: "Head registration rejected" });
  });
});

// Get head details for verification review
app.get("/admin/heads/:id", (req, res) => {
  const headId = req.params.id;

  const sql = `
    SELECT * FROM heads WHERE id = ?
  `;

  db.query(sql, [headId], (err, heads) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching head details", error: err.message });
    }

    if (heads.length === 0) {
      return res.status(404).json({ message: "Head not found" });
    }

    res.json(heads[0]);
  });
});

/* =========================
   REGISTER COMPLAINT (AUTO ASSIGN)
========================= */
app.post("/complaints", (req, res) => {
  const { name, email, phone, country, state, city, location, category, description } = req.body;

  // Validate all required fields
  if (!name || !email || !phone || !country || !state || !city || !location || !category || !description) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Find Head
  db.query(
    `SELECT id FROM heads
     WHERE country=? AND state=? AND city=? AND location=? AND department=?
     LIMIT 1`,
    [country, state, city, location, category],
    (err, head) => {
      if (err) {
        console.error("Complaint query error:", err);
        return res.status(500).json({ message: "Server error" });
      }
      if (!head.length)
        return res.status(404).json({ message: "No Head available" });

      const headId = head[0].id;

      //  Find AVAILABLE Staff
      db.query(
        `SELECT s.id, s.email, s.name
         FROM staff s
         JOIN staff_availability a ON s.id = a.staff_id
         WHERE s.department=? AND s.country=? AND s.state=? AND s.district=? 
         AND s.location=? AND a.status='AVAILABLE'
         LIMIT 1`,
        [category, country, state, city, location],
        (err2, staff) => {
          let staffId = null;
          let autoAssignedStaffId = null;
          let autoAssignedStaffName = null;
          let status = "ASSIGNED_TO_HEAD";

          // If staff found, set as auto-assigned but keep status as ASSIGNED_TO_HEAD for head confirmation
          if (staff.length) {
            autoAssignedStaffId = staff[0].id;
            autoAssignedStaffName = staff[0].name;
            staffId = null; // Don't assign yet, head needs to confirm
          }

          //  Insert Complaint with auto-assigned staff info
          db.query(
            `INSERT INTO complaints
             (name,email,phone,country,state,city,location,category,description,status,head_id,staff_id,auto_assigned_staff_id,auto_assigned_staff)
             VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            [
              name, email, phone,
              country, state, city, location,
              category, description,
              status, headId, staffId, autoAssignedStaffId, autoAssignedStaffName
            ],
            (err3, result) => {
              if (err3) {
                console.error("Complaint insert error:", err3);
                return res.status(500).json({ message: "Error creating complaint" });
              }

              // Always return a simple success message to the client
              res.json({
                message: "Complaint registered successfully"
              });
            }
          );
        }
      );
    }
  );
});

/* =========================
   USER PROFILE (for complaint form location)
========================= */
app.get("/api/user/profile", verifyToken, (req, res) => {
  const userId = req.userId;
  db.query("SELECT * FROM CitizenSignup WHERE id=?", [userId], (err, users) => {
    if (err || !users.length) {
      return res.status(404).json({ message: "User profile not found" });
    }
    const user = users[0];
    res.json({
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        mobile: user.mobile,
        country: user.country,
        state: user.state,
        district: user.district,
        city: user.city,
        pincode: user.pincode,
        addressLine1: user.addressLine1,
        addressLine2: user.addressLine2
      }
    });
  });
});

/* =========================
   PROTECTED COMPLAINT REGISTRATION
========================= */
app.post("/api/complaints", verifyToken, upload.single('proof'), (req, res) => {
  const {
    title, category, street, address, landmark,
    description, priority, contact_time
  } = req.body;
  const userId = req.userId;
  const proofFile = req.file ? req.file.filename : null;

  // 1. Get user details AND location from signup profile
  db.query("SELECT * FROM CitizenSignup WHERE id=?", [userId], (err, users) => {
    if (err || !users.length) {
      return res.status(404).json({ message: "User profile not found" });
    }
    const user = users[0];
    const name = `${user.first_name} ${user.last_name}`.trim();
    const email = user.email;
    const phone = user.mobile;

    // Location comes from citizen signup profile (not from complaint form)
    // Signup stores: country, state, district, city
    // For routing: district → heads.city / staff.district, city → heads.location / staff.location
    const complaintCountry = user.country;
    const complaintState = user.state;
    const complaintDistrict = user.district;  // maps to 'city' column in complaints
    const complaintCity = user.city;          // maps to 'location' column in complaints

    console.log("Routing complaint with profile location:", {
      country: complaintCountry,
      state: complaintState,
      district: complaintDistrict,
      city: complaintCity,
      category
    });

    // 2. Find Head (match on country, state, district→city, city→location, department)
    db.query(
      `SELECT id FROM heads
       WHERE country=? AND state=? AND city=? AND location=? AND department=?
       LIMIT 1`,
      [complaintCountry, complaintState, complaintDistrict, complaintCity, category],
      (err, head) => {
        if (err) {
          console.error("Head lookup error:", err);
          return res.status(500).json({ message: "Server error during routing" });
        }

        if (!head.length) {
          console.error("No head found for location:", { complaintCountry, complaintState, complaintDistrict, complaintCity, category });
          return res.status(404).json({ message: `No Department Head found for ${complaintDistrict}, ${complaintCity}. Please check location details.` });
        }

        const headId = head[0].id;

        // 3. Auto-find AVAILABLE Staff in same location
        db.query(
          `SELECT s.id, s.email, s.name
           FROM staff s
           JOIN staff_availability a ON s.id = a.staff_id
           WHERE s.department=? AND s.country=? AND s.state=? AND s.district=? AND s.location=?
           AND a.status='AVAILABLE'
           LIMIT 1`,
          [category, complaintCountry, complaintState, complaintDistrict, complaintCity],
          (err2, staff) => {
            let staffId = null;
            let autoAssignedStaffId = null;
            let autoAssignedStaffName = null;

            if (staff && staff.length) {
              autoAssignedStaffId = staff[0].id;
              autoAssignedStaffName = staff[0].name;
            } else {
              console.warn("No available staff found for this location");
            }

            // 4. Also check for available Employee (similarly for staff and employee also)
            db.query(
              `SELECT id, name FROM employees 
               WHERE department=? AND country=? AND state=? AND city=? AND location=? 
               AND status='ACTIVE' 
               LIMIT 1`,
              [category, complaintCountry, complaintState, complaintDistrict, complaintCity],
              (errEmp, employee) => {
                let autoAssignedEmployeeId = null;
                let autoAssignedEmployeeName = null;

                if (employee && employee.length) {
                  autoAssignedEmployeeId = employee[0].id;
                  autoAssignedEmployeeName = employee[0].name;
                }

                const status = "ASSIGNED_TO_HEAD";

                // 5. Insert Complaint — district→city column, city→location column
                const sql = `INSERT INTO complaints
                  (user_id, name, email, phone, country, state, city, location, 
                   street, address, landmark, title, category, description, 
                   priority, contact_time, status, head_id, staff_id, 
                   auto_assigned_staff_id, auto_assigned_staff, 
                   auto_assigned_employee_id, auto_assigned_employee, proof)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

                const values = [
                  userId, name, email, phone,
                  complaintCountry, complaintState, complaintDistrict, complaintCity,
                  street, address, landmark, title, category, description,
                  priority, contact_time, status, headId, staffId,
                  autoAssignedStaffId, autoAssignedStaffName,
                  autoAssignedEmployeeId, autoAssignedEmployeeName, proofFile
                ];

                db.query(sql, values, (err3, result) => {
                  if (err3) {
                    console.error("Complaint insert error:", err3);
                    return res.status(500).json({ message: "Error registering complaint" });
                  }

                  let responseMsg = `Complaint registered. Routed to Head (${complaintDistrict}).`;
                  if (autoAssignedStaffId) responseMsg += ` Predicted Staff: ${autoAssignedStaffName}.`;
                  if (autoAssignedEmployeeId) responseMsg += ` Predicted Employee: ${autoAssignedEmployeeName}.`;

                  res.json({
                    message: responseMsg,
                    id: result.insertId,
                    autoAssignedStaff: !!autoAssignedStaffId,
                    autoAssignedEmployee: !!autoAssignedEmployeeId
                  });
                });
              }
            );
          }
        );
      }
    );
  });
});


/* =========================
   HEAD DASHBOARD
========================= */
app.get("/head/dashboard/:headId", (req, res) => {
  db.query(
    `SELECT COUNT(*) AS total,
            SUM(status='ASSIGNED_TO_STAFF') AS assigned,
            SUM(status IN ('RESOLVED', 'COMPLETED')) AS resolved
     FROM complaints WHERE head_id=?`,
    [req.params.headId],
    (err, r) => res.json(r[0])
  );
});

app.get("/head/incoming/:headId", (req, res) => {
  const headId = req.params.headId;
  console.log("GET /head/incoming called for headId:", headId);
  db.query(
    "SELECT * FROM complaints WHERE head_id=? AND status='ASSIGNED_TO_HEAD'",
    [headId],
    (err, r) => {
      if (err) {
        console.error("DB error fetching incoming complaints:", err);
        return res.status(500).json({ message: "DB error fetching incoming complaints" });
      }
      console.log("Incoming complaints result:", r);
      res.json(r);
    }
  );
});

/* =========================
   AVAILABLE STAFF (REASSIGN)
========================= */
app.get("/head/staff/:complaintId", (req, res) => {
  const complaintId = req.params.complaintId;

  db.query(
    `SELECT category, country, state, city, location
     FROM complaints WHERE id=?`,
    [complaintId],
    (err, c) => {
      if (err || !c.length) return res.status(404).json({ message: "Complaint not found" });

      const { category, country, state, city, location } = c[0];

      db.query(
        `SELECT s.id, s.name, s.email
         FROM staff s
         JOIN staff_availability a ON s.id=a.staff_id
         WHERE s.department=? AND s.country=? AND s.state=? 
         AND s.district=? AND s.location=? 
         AND s.status='ACTIVE' AND a.status='AVAILABLE'`,
        [category, country, state, city, location],
        (err2, r) => {
          if (err2) return res.status(500).json(err2);
          res.json(r);
        }
      );
    }
  );
});


/* =========================
   ASSIGN STAFF
========================= */
app.put("/head/assign/:id", (req, res) => {
  const { staffId, priority } = req.body;
  const complaintId = req.params.id;

  db.query(
    "UPDATE complaints SET staff_id=?, priority=?, status='ASSIGNED_TO_STAFF' WHERE id=?",
    [staffId, priority, complaintId],
    () => {
      db.query("UPDATE staff_availability SET status='BUSY' WHERE staff_id=?", [staffId]);

      db.query("SELECT email FROM staff WHERE id=?", [staffId], (err, staff) => {
        if (!staff.length) return res.json({ message: "Assigned but email missing" });

        db.query("SELECT * FROM complaints WHERE id=?", [complaintId], async (_, c) => {
          await sendAssignmentMail(staff[0].email, c[0]);
          res.json({ message: "Staff Assigned & Email Sent" });
        });
      });
    }
  );
});

/* =========================
   CONFIRM AUTO-ASSIGNED STAFF (HEAD CONFIRMS)
========================= */
app.put("/head/confirm-assign/:complaintId", (req, res) => {
  const complaintId = req.params.complaintId;

  // Get the auto-assigned staff info
  db.query(
    "SELECT auto_assigned_staff_id, auto_assigned_staff FROM complaints WHERE id=?",
    [complaintId],
    (err, c) => {
      if (err || !c.length) return res.status(404).json({ message: "Complaint not found" });

      const staffId = c[0].auto_assigned_staff_id;
      if (!staffId) return res.status(400).json({ message: "No auto-assigned staff" });

      //  Update complaint status to ASSIGNED_TO_STAFF and set staff_id
      db.query(
        "UPDATE complaints SET staff_id=?, status='ASSIGNED_TO_STAFF', auto_assigned_confirmed=1 WHERE id=?",
        [staffId, complaintId],
        () => {
          //  Mark staff as BUSY
          db.query(
            "UPDATE staff_availability SET status='BUSY' WHERE staff_id=?",
            [staffId]
          );

          //  Send email to staff
          db.query("SELECT email FROM staff WHERE id=?", [staffId], (err, staff) => {
            if (staff && staff.length) {
              db.query("SELECT * FROM complaints WHERE id=?", [complaintId], async (_, complaint) => {
                if (complaint && complaint.length) {
                  await sendAssignmentMail(staff[0].email, complaint[0]);
                }
              });
            }
          });

          // Send confirmation email to citizen
          db.query("SELECT * FROM complaints WHERE id=?", [complaintId], async (_, complaint) => {
            if (complaint && complaint.length) {
              const citizenEmail = complaint[0].email;
              const info = await sendCitizenConfirmationMail(citizenEmail, complaint[0]);
              res.json({ message: "Assignment confirmed & emails sent", info });
            } else {
              res.json({ message: "Assignment confirmed" });
            }
          });
        }
      );
    }
  );
});

/* =========================
   REASSIGN STAFF (HEAD)
========================= */
app.put("/head/reassign/:complaintId", (req, res) => {
  const { newStaffId } = req.body;
  const complaintId = req.params.complaintId;

  //  Get old staff
  db.query(
    "SELECT staff_id FROM complaints WHERE id=?",
    [complaintId],
    (err, c) => {
      if (err || !c.length) return res.status(404).json({ message: "Complaint not found" });

      const oldStaffId = c[0].staff_id;

      // 2 Update complaint
      db.query(
        "UPDATE complaints SET staff_id=?, status='ASSIGNED_TO_STAFF', auto_assigned_confirmed=1 WHERE id=?",
        [newStaffId, complaintId],
        () => {

          //  Free old staff
          if (oldStaffId) {
            db.query(
              "UPDATE staff_availability SET status='AVAILABLE' WHERE staff_id=?",
              [oldStaffId]
            );
          }

          //  Busy new staff
          db.query(
            "UPDATE staff_availability SET status='BUSY' WHERE staff_id=?",
            [newStaffId]
          );

          //  Send Email to staff
          db.query(
            "SELECT email FROM staff WHERE id=?",
            [newStaffId],
            (e, s) => {
              if (s.length) {
                db.query(
                  "SELECT * FROM complaints WHERE id=?",
                  [complaintId],
                  async (_, comp) => {
                    await sendAssignmentMail(s[0].email, comp[0]);

                    //  Send confirmation email to citizen
                    await sendCitizenConfirmationMail(comp[0].email, comp[0]);

                    res.json({ message: "Staff reassigned & emails sent" });
                  }
                );
              } else {
                res.json({ message: "Staff reassigned" });
              }
            }
          );
        }
      );
    }
  );
});



/* =========================
   STAFF DASHBOARD
========================= */
app.get("/staff/:staffId", (req, res) => {
  db.query("SELECT * FROM complaints WHERE staff_id=?", [req.params.staffId], (_, r) => res.json(r));
});

/* =========================
   UPDATE STATUS - DEPRECATED (ONLY EMPLOYEES CAN UPDATE)
   This endpoint has been removed. Only employees can update complaints.
========================= */
// app.put("/staff/update/:id", ...) - REMOVED
// Staff can only view and assign employees. Updates are done by employees.

/* =========================
   EMPLOYEE LOGIN
========================= */
app.post("/employee/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM employees WHERE email=?",
    [email],
    async (err, employees) => {
      if (err) {
        console.error("Employee login DB error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (employees.length === 0) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      const employee = employees[0];

      // Check if account is active
      if (employee.status !== "ACTIVE") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      const isMatch = await bcrypt.compare(password, employee.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      res.json({
        message: "Login Successful",
        employeeId: employee.id,
        name: employee.name,
        email: employee.email,
        department: employee.department,
      });
    }
  );
});

/* =========================
   STAFF LOGIN
========================= */
app.post("/staff/login", (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM staff WHERE email=?",
    [email],
    async (err, staff) => {
      if (err) {
        console.error("Staff login DB error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (staff.length === 0)
        return res.status(401).json({ message: "Invalid email or password" });

      const staffRecord = staff[0];

      // Check if account is active
      if (staffRecord.status !== "ACTIVE") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      const isMatch = await bcrypt.compare(password, staffRecord.password);
      if (!isMatch)
        return res.status(401).json({ message: "Invalid email or password" });

      res.json({
        message: "Login Successful",
        staffId: staffRecord.id,
        name: staffRecord.name,
        department: staffRecord.department
      });
    }
  );
});

/* =========================
   EMPLOYEE OTP LOGIN
========================= */
app.post("/employee/login/request-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM employees WHERE LOWER(email)=?",
    [normalizedEmail],
    async (err, r) => {
      if (err) {
        console.error("Employee lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!r.length) {
        return res.status(404).json({ message: "Email not registered" });
      }

      const employee = r[0];

      // Check if account is active
      if (employee.status !== "ACTIVE") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      const otp = generateOtp();
      otpStore.set(normalizedEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

      // TODO: send email here
      console.log("EMPLOYEE LOGIN OTP:", otp);

      res.json({ message: "OTP sent to email" });
    }
  );
});

app.post("/employee/login/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log("Employee verify-otp request:", { email, otp, receivedOtp: String(otp) });

  if (!email || !otp) {
    console.log("Missing email or otp");
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  console.log("Stored OTP record:", { normalizedEmail, storedOtp: record?.otp, recordExists: !!record, isExpired: record ? Date.now() > record.expires : null });

  if (!record) {
    console.log("No OTP found for email:", normalizedEmail);
    return res.status(400).json({ message: "OTP not requested. Please request OTP first." });
  }

  if (record.otp !== String(otp)) {
    console.log("OTP mismatch:", { expected: record.otp, received: String(otp) });
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > record.expires) {
    console.log("OTP expired");
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
  }

  db.query(
    "SELECT * FROM employees WHERE LOWER(email)=?",
    [normalizedEmail],
    (err, r) => {
      if (err) {
        console.error("Employee lookup error:", err);
        otpStore.delete(normalizedEmail);
        return res.status(500).json({ message: "Server error" });
      }

      if (!r.length) {
        otpStore.delete(normalizedEmail);
        return res.status(401).json({ message: "Employee not found" });
      }

      otpStore.delete(normalizedEmail);
      res.json({
        employeeId: r[0].id,
        name: r[0].name,
        email: r[0].email,
        department: r[0].department
      });
    }
  );
});

app.post("/head/login", async (req, res) => {
  const { email, password } = req.body;

  //  Basic validation
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  db.query(
    "SELECT * FROM heads WHERE email = ?",
    [email],
    async (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
      }

      //  Email check
      if (!result.length) {
        return res.status(401).json({ message: "Email not registered" });
      }

      const head = result[0];

      // 3️Status check
      if (head.status !== "ACTIVE") {
        return res.status(403).json({ message: "Account inactive" });
      }

      // 4️ Password check
      const isMatch = await bcrypt.compare(password, head.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Incorrect password" });
      }

      // 5️ Success
      res.json({
        success: true,
        headId: head.id,
        name: head.name,
        email: head.email
      });
    }
  );
});
app.post("/head/login/request-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM heads WHERE LOWER(email)=?",
    [normalizedEmail],
    async (err, r) => {
      if (err) {
        console.error("Head lookup error:", err);
        return res.status(500).json({ message: "Server error" });
      }

      if (!r.length) {
        return res.status(404).json({ message: "Email not registered" });
      }

      const head = r[0];

      // Check if account is active
      if (head.status !== "ACTIVE") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      const otp = generateOtp();
      otpStore.set(normalizedEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

      // TODO: send email here
      console.log("LOGIN OTP:", otp);

      res.json({ message: "OTP sent to email" });
    }
  );
});


app.post("/head/login/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log("Head verify-otp request:", { email, otp, receivedOtp: String(otp) });

  if (!email || !otp) {
    console.log("Missing email or otp");
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  console.log("Stored OTP record:", { normalizedEmail, storedOtp: record?.otp, recordExists: !!record, isExpired: record ? Date.now() > record.expires : null });

  if (!record) {
    console.log("No OTP found for email:", normalizedEmail);
    return res.status(400).json({ message: "OTP not requested. Please request OTP first." });
  }

  if (record.otp !== String(otp)) {
    console.log("OTP mismatch:", { expected: record.otp, received: String(otp) });
    return res.status(400).json({ message: "Invalid OTP" });
  }

  if (Date.now() > record.expires) {
    console.log("OTP expired");
    otpStore.delete(normalizedEmail);
    return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
  }

  db.query(
    "SELECT * FROM heads WHERE LOWER(email)=?",
    [normalizedEmail],
    (err, r) => {
      if (err) {
        console.error("Head lookup error:", err);
        otpStore.delete(normalizedEmail);
        return res.status(500).json({ message: "Server error" });
      }

      if (!r.length) {
        otpStore.delete(normalizedEmail);
        return res.status(401).json({ message: "Head not found" });
      }

      otpStore.delete(normalizedEmail);
      res.json({
        headId: r[0].id,
        name: r[0].name,
        email: r[0].email
      });
    }
  );
});


app.post("/head/forgot/request-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query("SELECT * FROM heads WHERE LOWER(email)=?", [normalizedEmail], (err, r) => {
    if (err) {
      console.error("Head lookup error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!r.length) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOtp();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log("FORGOT OTP:", otp);
    res.json({ message: "OTP sent" });
  });
});

app.post("/head/forgot/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record || record.otp !== String(otp) || Date.now() > record.expires) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  db.query(
    "UPDATE heads SET password=? WHERE LOWER(email)=?",
    [hash, normalizedEmail],
    (err) => {
      if (err) {
        console.error("Password update error:", err);
        otpStore.delete(normalizedEmail);
        return res.status(500).json({ message: "Error updating password" });
      }
      otpStore.delete(normalizedEmail);
      res.json({ message: "Password updated successfully" });
    }
  );
});/* =========================
   STAFF LOGIN OTP
========================= */

// Request OTP
app.post("/staff/login/request-otp", (req, res) => {
  const { email, formData } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM staff WHERE LOWER(email)=?",
    [normalizedEmail],
    (err, staff) => {
      if (err) {
        console.error("Staff lookup error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!staff.length) {
        return res.status(404).json({ message: "Staff not found" });
      }

      const staffRecord = staff[0];

      // Check if account is active
      if (staffRecord.status !== "ACTIVE") {
        return res.status(401).json({ message: "Account is inactive" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

      const sql = `
        REPLACE INTO staff_otps (email, otp, form_data, expires_at)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        sql,
        [normalizedEmail, otp, JSON.stringify(formData || {}), expiresAt],
        (err) => {
          if (err) {
            console.error("OTP save error:", err);
            return res.status(500).json({ message: "OTP save failed" });
          }

          console.log("STAFF OTP:", otp); // demo

          res.json({ message: "OTP sent successfully" });
        }
      );
    }
  );
});


app.post("/staff/login/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  console.log("Staff verify-otp request:", { email, otp, receivedOtp: String(otp) });

  if (!email || !otp) {
    console.log("Missing email or otp");
    return res.status(400).json({ message: "Email and OTP required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query(
    "SELECT * FROM staff_otps WHERE LOWER(email)=?",
    [normalizedEmail],
    (err, rows) => {
      if (err) {
        console.error("OTP lookup error:", err);
        return res.status(500).json({ message: "DB error" });
      }

      if (!rows.length) {
        console.log("OTP not requested for:", normalizedEmail);
        return res.status(400).json({ message: "OTP not requested. Please request OTP first." });
      }

      const record = rows[0];

      console.log("Staff OTP check:", { storedOtp: record.otp, receivedOtp: String(otp), expiresAt: record.expires_at });

      if (record.otp !== String(otp)) {
        console.log("OTP mismatch");
        return res.status(400).json({ message: "Invalid OTP" });
      }
      if (new Date(record.expires_at) < new Date()) {
        console.log("OTP expired");
        return res.status(400).json({ message: "OTP expired. Please request a new OTP." });
      }

      db.query(
        "DELETE FROM staff_otps WHERE LOWER(email)=?",
        [normalizedEmail],
        (err) => {
          if (err) {
            console.error("OTP delete error:", err);
          }
        }
      );

      // Get staff details to return staffId
      db.query(
        "SELECT * FROM staff WHERE LOWER(email)=?",
        [normalizedEmail],
        (err, staffData) => {
          if (err || !staffData.length) {
            return res.status(500).json({ message: "Error retrieving staff data" });
          }

          res.json({
            message: "Login successful",
            staffId: staffData[0].id,
            name: staffData[0].name,
            email: staffData[0].email,
            department: staffData[0].department
          });
        }
      );
    }
  );
});
app.post("/staff/forgot/request-otp", (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: "Email required" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  db.query("SELECT * FROM staff WHERE LOWER(email)=?", [normalizedEmail], (err, staff) => {
    if (err) {
      console.error("Staff lookup error:", err);
      return res.status(500).json({ message: "Server error" });
    }

    if (!staff.length) {
      return res.status(404).json({ message: "Email not registered" });
    }

    const otp = generateOtp();
    otpStore.set(normalizedEmail, { otp, expires: Date.now() + 5 * 60 * 1000 });

    console.log("STAFF FORGOT OTP:", otp);

    res.json({ message: "OTP sent" });
  });
});

app.post("/staff/forgot/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "Email, OTP, and new password required" });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const record = otpStore.get(normalizedEmail);

  if (!record || record.otp !== String(otp) || Date.now() > record.expires) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  const hash = await bcrypt.hash(newPassword, 10);

  db.query(
    "UPDATE staff SET password=? WHERE LOWER(email)=?",
    [hash, normalizedEmail],
    (err) => {
      if (err) {
        console.error("Password update error:", err);
        otpStore.delete(normalizedEmail);
        return res.status(500).json({ message: "Error updating password" });
      }
      otpStore.delete(normalizedEmail);
      res.json({ message: "Password updated successfully" });
    }
  );
});
/* =========================
   EMPLOYEE REGISTRATION
========================= */
app.post("/employee/register", async (req, res) => {
  const {
    name, email, password, department, location, country, state, city,
    phone, address, aadhaar, pan, voterId
  } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `
      INSERT INTO employees
      (name, email, password, department, location, country, state, city,
       phone, address, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?,'ACTIVE')
    `;

    db.query(sql, [
      name, email, hashedPassword, department, location, country, state, city,
      phone, address
    ], (err, result) => {
      if (err) {
        console.error("Employee Registration Error:", err);
        return res.status(500).json({ message: "Employee Registration Failed" });
      }
      res.json({ message: "Employee Registered Successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});
/* =========================
   GET AVAILABLE EMPLOYEES (BY STAFF ID & COMPLAINT LOCATION)
========================= */
app.get("/staff/employees/:complaintId", (req, res) => {
  const complaintId = req.params.complaintId;

  // Get complaint location details
  db.query(
    `SELECT country, state, city, location FROM complaints WHERE id=?`,
    [complaintId],
    (err, complaints) => {
      if (err || !complaints.length) {
        return res.status(404).json({ message: "Complaint not found" });
      }

      const { country, state, city, location } = complaints[0];

      // Get available employees in same location (city = district in complaints table)
      db.query(
        `SELECT id, name, email, phone, location, department, status, city
         FROM employees
         WHERE country=? AND state=? AND city=? AND location=?
         AND status='ACTIVE'
         ORDER BY name`,
        [country, state, city, location],
        (err2, employees) => {
          if (err2) return res.status(500).json(err2);
          res.json(employees);
        }
      );
    }
  );
});
/* =========================
   ASSIGN EMPLOYEE TO COMPLAINT (STAFF ASSIGNS)
========================= */
app.put("/staff/assign-employee/:complaintId", (req, res) => {
  const { employeeId } = req.body;
  const complaintId = req.params.complaintId;

  // Update complaint with employee assignment
  db.query(
    `UPDATE complaints
     SET employee_id=?, status='ASSIGNED_TO_EMPLOYEE'
     WHERE id=?`,
    [employeeId, complaintId],
    (err, result) => {
      if (err) {
        console.error("Assignment Error:", err);
        return res.status(500).json({ message: "Assignment Failed" });
      }

      // Get employee email and complaint details
      db.query(
        `SELECT e.email, e.name, c.* FROM employees e
         JOIN complaints c ON c.id=?
         WHERE e.id=?`,
        [complaintId, employeeId],
        async (err2, data) => {
          if (data && data.length) {
            const emp = data[0];
            try {
              // Send email to employee about new assignment
              await sendEmployeeAssignmentMail(emp.email, emp);
              console.log(`Employee ${emp.name} assigned to complaint ${complaintId} - Email sent`);
            } catch (emailErr) {
              console.error("Email sending failed:", emailErr);
            }
          }
          res.json({ message: "Employee assigned successfully" });
        }
      );
    }
  );
});

/* =========================
   EMPLOYEE DASHBOARD - GET ASSIGNED COMPLAINTS
========================= */
app.get("/employee/complaints/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;
  console.log(`/employee/complaints called for employeeId=${employeeId}`);

  const sql = `SELECT * FROM complaints WHERE employee_id=?
      AND status IN ('ASSIGNED_TO_EMPLOYEE', 'IN_PROGRESS', 'RESOLVED')
      ORDER BY id DESC`;

  db.query(sql, [employeeId], (err, complaints) => {
    if (err) {
      console.error("DB error fetching employee complaints:", err && err.message ? err.message : err);
      return res.status(500).json({ message: "DB error fetching employee complaints", error: err && err.message ? err.message : err });
    }

    res.json(complaints);
  });
});

/* =========================
   EMPLOYEE DASHBOARD SUMMARY
   Returns counts for dashboard badges (total, in_progress, resolved)
========================= */
app.get("/employee/dashboard/:employeeId", (req, res) => {
  const employeeId = req.params.employeeId;
  db.query(
    `SELECT COUNT(*) AS total,
            SUM(status='IN_PROGRESS') AS in_progress,
            SUM(status IN ('RESOLVED', 'COMPLETED')) AS resolved
        
     FROM complaints WHERE employee_id = ?`,
    [employeeId],
    (err, r) => {
      if (err) return res.status(500).json(err);
      res.json(r[0]);
    }
  );
});
/* =========================
   EMPLOYEE UPDATE COMPLAINT STATUS (WITH PROOF)
========================= */
app.put("/employee/update/:complaintId", upload.single("proof"), (req, res) => {
  const { status, remarks, internalNote } = req.body;
  const complaintId = req.params.complaintId;
  const proofFile = req.file ? req.file.filename : null;

  if (!status || !remarks) {
    return res.status(400).json({ message: "Status and remarks required" });
  }

  // Update complaint with status and proof
  db.query(
    `UPDATE complaints
     SET status=?, remarks=?, internal_note=?, proof=?
     WHERE id=?`,
    [status, remarks, internalNote, proofFile, complaintId],
    (err) => {
      if (err) {
        console.error("Update Error:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      // Get complaint details to notify citizen, staff, and head
      db.query(
        `SELECT c.*, e.email AS employeeEmail, e.name AS employeeName,
                s.email AS staffEmail, s.name AS staffName,
                h.email AS headEmail
         FROM complaints c
         LEFT JOIN employees e ON c.employee_id = e.id
         LEFT JOIN staff s ON c.staff_id = s.id
         LEFT JOIN heads h ON c.head_id = h.id
         WHERE c.id = ?`,
        [complaintId],
        async (err2, complaints) => {
          if (err2 || !complaints.length) {
            return res.json({ message: "Updated but notifications failed" });
          }

          const complaint = complaints[0];

          // If complaint resolved by employee, mark staff as AVAILABLE
          if (status === 'RESOLVED') {
            if (complaint.staff_id) {
              db.query("UPDATE staff_availability SET status='AVAILABLE' WHERE staff_id=?", [complaint.staff_id]);
            }
            // set resolved timestamp
            db.query("UPDATE complaints SET resolved_at=NOW() WHERE id=?", [complaintId]);
          }

          // Send email to citizen (user) about status update
          if (complaint.email) {
            await sendCitizenEmployeeUpdateMail(complaint.email, complaint);
          }

          // Send email to staff (supervisor)
          if (complaint.staffEmail) {
            await sendStaffEmployeeUpdateMail(complaint.staffEmail, complaint);
          }

          // Send email to head (approver)
          if (complaint.headEmail) {
            await sendHeadEmployeeUpdateMail(complaint.headEmail, complaint);
          }

          res.json({
            message: "Complaint updated & notifications sent to citizen, staff, and head",
            status: status
          });
        }
      );
    }
  );
});

/* =========================
   STAFF SENDS CONFIRMATION TO CITIZEN & HEAD (AFTER EMPLOYEE UPDATE)
========================= */
app.post("/staff/send-confirmation/:complaintId", (req, res) => {
  const complaintId = req.params.complaintId;
  const { staffId } = req.body;

  if (!staffId) {
    return res.status(400).json({ message: "Staff ID required" });
  }

  // Get complaint and staff details
  db.query(
    `SELECT c.*, s.email AS staffEmail, s.name AS staffName,
            h.email AS headEmail
     FROM complaints c
     LEFT JOIN staff s ON c.staff_id = s.id
     LEFT JOIN heads h ON c.head_id = h.id
     WHERE c.id = ? AND c.staff_id = ?`,
    [complaintId, staffId],
    async (err, complaints) => {
      if (err || !complaints.length) {
        return res.status(404).json({ message: "Complaint not found or not assigned to this staff" });
      }

      const complaint = complaints[0];

      try {
        // Send confirmation to citizen
        if (complaint.email) {
          await sendStaffToCitizenUpdateMail(complaint.email, complaint, complaint.staffName);
          console.log(`Confirmation sent to citizen: ${complaint.email}`);
        }

        // Send confirmation to head
        if (complaint.headEmail) {
          await sendStaffToHeadUpdateMail(complaint.headEmail, complaint, complaint.staffName);
          console.log(`Confirmation sent to head: ${complaint.headEmail}`);
        }

        // Update complaint to mark that staff has sent confirmation
        db.query(
          `UPDATE complaints SET staff_confirmation_sent=1, staff_confirmation_at=NOW() WHERE id=?`,
          [complaintId],
          (err) => {
            if (err) console.error("Error updating confirmation flag:", err);
          }
        );

        res.json({
          message: "Confirmation sent to citizen and head successfully",
          citizenNotified: complaint.email ? true : false,
          headNotified: complaint.headEmail ? true : false
        });
      } catch (error) {
        console.error("Error sending confirmations:", error);
        res.status(500).json({ message: "Error sending confirmations" });
      }
    }
  );
});

/* =========================
   STAFF REPORTS - VIEW COMPLAINTS ASSIGNED BY STAFF
========================= */
app.get("/staff/reports/:staffId", (req, res) => {
  db.query(
    `SELECT c.*, e.name AS employeeName, e.email AS employeeEmail
     FROM complaints c
     LEFT JOIN employees e ON c.employee_id = e.id
    WHERE c.staff_id=?
    ORDER BY c.id DESC`,
    [req.params.staffId],
    (err, complaints) => {
      if (err) return res.status(500).json(err);
      res.json(complaints);
    }
  );
});
/* =========================
   HEAD REVIEWS STAFF REPORTS & MARKS COMPLETION
========================= */
app.get("/head/staff-reports/:headId", (req, res) => {
  db.query(
    `SELECT c.*, s.name AS staffName, s.email AS staffEmail, 
            e.name AS employeeName, e.email AS employeeEmail
     FROM complaints c
     JOIN staff s ON c.staff_id = s.id
     LEFT JOIN employees e ON c.employee_id = e.id
    WHERE c.head_id=? AND c.status IN ('ASSIGNED_TO_EMPLOYEE', 'IN_PROGRESS', 'RESOLVED')
    ORDER BY c.id DESC`,
    [req.params.headId],
    (err, complaints) => {
      if (err) return res.status(500).json(err);
      res.json(complaints);
    }
  );
});

/* =========================
   HEAD MARKS COMPLAINT AS COMPLETED OR NOT COMPLETED
========================= */
app.put("/head/mark-completion/:complaintId", (req, res) => {
  const { isCompleted, headRemarks } = req.body;
  const complaintId = req.params.complaintId;
  const finalStatus = isCompleted ? "COMPLETED" : "INCOMPLETE";

  db.query(
    `UPDATE complaints
     SET status=?, head_remarks=?, head_reviewed_at=NOW()
     WHERE id=?`,
    [finalStatus, headRemarks, complaintId],
    (err) => {
      if (err) {
        console.error("Completion Error:", err);
        return res.status(500).json({ message: "Update failed" });
      }

      // Get complaint details to send notifications
      db.query(
        `SELECT c.*, s.email AS staffEmail, s.name AS staffName,
                e.email AS employeeEmail, e.name AS employeeName
         FROM complaints c
         LEFT JOIN staff s ON c.staff_id = s.id
         LEFT JOIN employees e ON c.employee_id = e.id
         WHERE c.id = ?`,
        [complaintId],
        async (err2, complaints) => {
          if (err2 || !complaints.length) {
            return res.json({ message: `Marked as ${finalStatus}` });
          }

          const complaint = complaints[0];

          // Send email to staff about completion status
          if (complaint.staffEmail) {
            console.log(`Staff notified: Complaint marked ${finalStatus}`);
          }

          // Send email to employee about completion status
          if (complaint.employeeEmail) {
            console.log(`Employee notified: Complaint marked ${finalStatus}`);
          }

          res.json({
            message: `Complaint marked as ${finalStatus} & notifications sent`,
            status: finalStatus
          });
        }
      );
    }
  );
});

/* =========================
   CITIZEN / USER AUTHENTICATION
========================= */

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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    db.query(
      `REPLACE INTO citizen_otps (email, otp, form_data, expires_at) VALUES (?, ?, ?, ?)`,
      [form.email, otp, JSON.stringify(form), expiresAt],
      async (err) => {
        if (err) {
          console.error("DB Error:", err);
          return res.status(500).json({ message: "OTP storage failed" });
        }

        console.log("CITIZEN SIGNUP OTP:", otp);
        res.json({ message: "OTP sent to email successfully" });
      }
    );
  } catch (err) {
    console.error("Server Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ---------------- VERIFY OTP & REGISTER ----------------
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
              name: `${form.firstName} ${form.lastName}`.trim()
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

// ---------------- LOGIN WITH PASSWORD ----------------
app.post("/login/password", (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT id, email, password, first_name, last_name FROM CitizenSignup WHERE email=?",
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
          name: `${user.first_name} ${user.last_name}`.trim()
        }
      });
    }
  );
});

// ---------------- LOGIN OTP REQUEST ----------------
app.post("/login/request-otp", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM CitizenSignup WHERE email=?",
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Email not registered" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      db.query(
        `REPLACE INTO login_otps (email, otp, purpose, expires_at) VALUES (?, ?, 'login', ?)`,
        [email, otp, expiresAt],
        async (err) => {
          if (err) return res.status(500).json({ message: "OTP failed" });
          console.log("LOGIN OTP:", otp);
          res.json({ message: "OTP sent for login" });
        }
      );
    }
  );
});

// ---------------- LOGIN OTP VERIFY ----------------
app.post("/login/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  db.query(
    `SELECT * FROM login_otps WHERE email=? AND otp=? AND purpose='login' AND expires_at > NOW()`,
    [email, otp],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      db.query(
        "SELECT id, email, first_name, last_name FROM CitizenSignup WHERE email=?",
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
            message: "Login successful",
            token,
            user: {
              id: user.id,
              email: user.email,
              name: `${user.first_name} ${user.last_name}`.trim()
            }
          });
        }
      );
    }
  );
});

// ---------------- FORGOT PASSWORD REQUEST ----------------
app.post("/forgot/request-otp", (req, res) => {
  const { email } = req.body;

  db.query(
    "SELECT id FROM CitizenSignup WHERE email=?",
    [email],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Email not registered" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      db.query(
        `REPLACE INTO login_otps (email, otp, purpose, expires_at) VALUES (?, ?, 'forgot', ?)`,
        [email, otp, expiresAt],
        async (err) => {
          if (err) return res.status(500).json({ message: "OTP failed" });
          console.log("FORGOT PASSWORD OTP:", otp);
          res.json({ message: "Password reset OTP sent" });
        }
      );
    }
  );
});

// ---------------- FORGOT PASSWORD VERIFY ----------------
app.post("/forgot/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;

  db.query(
    `SELECT * FROM login_otps WHERE email=? AND otp=? AND purpose='forgot' AND expires_at > NOW()`,
    [email, otp],
    async (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      db.query(
        "UPDATE CitizenSignup SET password=? WHERE email=?",
        [hashed, email],
        (updateErr) => {
          if (updateErr) return res.status(500).json({ message: "Failed to update password" });
          db.query("DELETE FROM login_otps WHERE email=?", [email]);
          res.json({ message: "Password updated successfully" });
        }
      );
    }
  );
});

/* =========================
   PROTECTED USER / CITIZEN API
========================= */

// Get user profile
app.get("/api/user-profile", verifyToken, (req, res) => {
  db.query(
    "SELECT id, email, first_name, last_name, mobile, dob, gender, country, state, district, city FROM CitizenSignup WHERE id=?",
    [req.userId],
    (err, rows) => {
      if (err || rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
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
      SUM(CASE WHEN status IN ('ASSIGNED_TO_HEAD', 'ASSIGNED_TO_STAFF', 'ASSIGNED_TO_EMPLOYEE', 'IN_PROGRESS') THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN status IN ('RESOLVED', 'COMPLETED') THEN 1 ELSE 0 END) as closed
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
  db.query(
    `SELECT id, category, city, location, description, status, priority, created_at, resolved_at, head_remarks
     FROM complaints 
     WHERE user_id = ? 
     ORDER BY id DESC`,
    [req.userId],
    (err, rows) => {
      if (err) {
        console.error('Failed to fetch user complaints', err);
        return res.status(500).json({ message: 'Failed to fetch complaints' });
      }

      const complaints = (rows || []).map(r => ({
        id: r.id,
        category: r.category,
        city: r.city,
        location: r.location,
        description: r.description,
        status: r.status,
        priority: r.priority,
        created_at: r.created_at,
        resolved_at: r.resolved_at,
        head_remarks: r.head_remarks
      }));

      res.json({ complaints });
    }
  );
});

const primaryAdminRoutes = require("./primaryadmin")(db);
app.use(primaryAdminRoutes);
/* =========================
   SERVER
========================= */
app.listen(5000, () => console.log("Server running on http://localhost:5000"));


