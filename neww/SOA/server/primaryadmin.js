const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key_change_in_production";

module.exports = function (db) {
    const router = express.Router();

    // Middleware to verify Admin Token
    const verifyAdminToken = (req, res, next) => {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Invalid or expired token" });
            }
            // Check if user is actually an admin in the database
            db.query("SELECT * FROM admins WHERE admin_id = ?", [decoded.id], (dbErr, rows) => {
                if (dbErr || rows.length === 0) {
                    return res.status(403).json({ message: "Admin access denied" });
                }
                req.adminId = decoded.id;
                next();
            });
        });
    };

    // Admin Signup
    router.post("/api/admin/signup", async (req, res) => {
        const { name, email, password, role } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const sql = "INSERT INTO admins (admin_name, admin_email, admin_password, role) VALUES (?, ?, ?, ?)";
            db.query(sql, [name, email, hashedPassword, role || 'ADMIN'], (err, result) => {
                if (err) {
                    console.error("Signup Error:", err);
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Email already exists" });
                    }
                    return res.status(500).json({ message: "Signup failed" });
                }
                res.json({ message: "Admin registered successfully", id: result.insertId });
            });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    });

    // Admin Login
    router.post("/api/admin/login", async (req, res) => {
        const { email, password } = req.body;
        db.query("SELECT * FROM admins WHERE admin_email = ?", [email], async (err, rows) => {
            if (err || rows.length === 0) {
                return res.status(400).json({ message: "Invalid email or password" });
            }
            const admin = rows[0];

            let match = false;
            // Support both bcrypt and plain hex hashes (like SHA2 from SQL)
            if (admin.admin_password.startsWith("$2")) {
                match = await bcrypt.compare(password, admin.admin_password);
            } else {
                // If the stored password looks like a hex string (SHA2), hash input with SHA256 and compare
                const crypto = require("crypto");
                const hash = crypto.createHash("sha256").update(password).digest("hex");
                match = hash === admin.admin_password;
            }

            if (!match) {
                return res.status(400).json({ message: "Invalid email or password" });
            }

            const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
            res.json({
                token,
                admin_id: admin.admin_id,
                admin_name: admin.admin_name
            });
        });
    });

    // Admin Me
    router.get("/api/admin/me", verifyAdminToken, (req, res) => {
        db.query("SELECT admin_id, admin_name, admin_email as email FROM admins WHERE admin_id = ?", [req.adminId], (err, rows) => {
            if (err || rows.length === 0) return res.status(404).json({ message: "Admin not found" });
            res.json(rows[0]);
        });
    });

    // ==========================================
    // DEPARTMENTS CRUD (Robust)
    // ==========================================

    // Get Departments with Search, Sort, and Pagination
    router.get("/api/departments", (req, res) => {
        let { page = 1, limit = 10, sortBy = "department_name", order = "asc", search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const countSql = "SELECT COUNT(*) as total FROM departments WHERE department_name LIKE ? OR department_description LIKE ?";
        const dataSql = `SELECT * FROM departments 
                         WHERE department_name LIKE ? OR department_description LIKE ? 
                         ORDER BY ${db.escapeId(sortBy)} ${order === 'desc' ? 'DESC' : 'ASC'} 
                         LIMIT ? OFFSET ?`;

        const searchTerm = `%${search}%`;

        db.query(countSql, [searchTerm, searchTerm], (err, countResult) => {
            if (err) return res.status(500).json(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [searchTerm, searchTerm, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json(err2);
                res.json({
                    data: rows,
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page,
                        limit
                    }
                });
            });
        });
    });

    // Add Department
    router.post("/api/departments", (req, res) => {
        const { department_name, department_description } = req.body;
        const sql = "INSERT INTO departments (department_name, department_description, status) VALUES (?, ?, 'ACTIVE')";
        db.query(sql, [department_name, department_description], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Department added", id: result.insertId });
        });
    });

    // Update Department
    router.put("/api/departments/:id", (req, res) => {
        const { department_name, department_description } = req.body;
        const sql = "UPDATE departments SET department_name = ?, department_description = ? WHERE department_id = ?";
        db.query(sql, [department_name, department_description, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Department updated" });
        });
    });

    // Toggle Department Status
    router.put("/api/departments/:id/status", (req, res) => {
        const { status } = req.body;
        const sql = "UPDATE departments SET status = ? WHERE department_id = ?";
        db.query(sql, [status, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Status updated" });
        });
    });

    // ==========================================
    // SERVICE TYPES CRUD (Robust)
    // ==========================================

    // Get Service Types with Search, Sort, and Pagination
    router.get("/api/service-types", (req, res) => {
        let { page = 1, limit = 10, sortBy = "service_type_name", order = "asc", search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const countSql = "SELECT COUNT(*) as total FROM service_types WHERE service_type_name LIKE ? OR service_type_description LIKE ?";
        const dataSql = `SELECT * FROM service_types 
                         WHERE service_type_name LIKE ? OR service_type_description LIKE ? 
                         ORDER BY ${db.escapeId(sortBy)} ${order === 'desc' ? 'DESC' : 'ASC'} 
                         LIMIT ? OFFSET ?`;

        const searchTerm = `%${search}%`;

        db.query(countSql, [searchTerm, searchTerm], (err, countResult) => {
            if (err) return res.status(500).json(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [searchTerm, searchTerm, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json(err2);
                res.json({
                    data: rows,
                    pagination: {
                        total,
                        totalPages,
                        currentPage: page,
                        limit
                    }
                });
            });
        });
    });

    // Add Service Type
    router.post("/api/service-types", (req, res) => {
        const { service_type_name, service_type_description } = req.body;
        const sql = "INSERT INTO service_types (service_type_name, service_type_description, status) VALUES (?, ?, 'ACTIVE')";
        db.query(sql, [service_type_name, service_type_description], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Service type added", id: result.insertId });
        });
    });

    // Update Service Type
    router.put("/api/service-types/:id", (req, res) => {
        const { service_type_name, service_type_description } = req.body;
        const sql = "UPDATE service_types SET service_type_name = ?, service_type_description = ? WHERE service_type_id = ?";
        db.query(sql, [service_type_name, service_type_description, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Service type updated" });
        });
    });

    // Toggle Service Type Status
    router.put("/api/service-types/:id/status", (req, res) => {
        const { status } = req.body;
        const sql = "UPDATE service_types SET status = ? WHERE service_type_id = ?";
        db.query(sql, [status, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Status updated" });
        });
    });

    // ==========================================
    // SKILLS CRUD (Robust)
    // ==========================================

    router.get("/api/skills", (req, res) => {
        let { page = 1, limit = 10, sortBy = "skill_name", order = "asc", search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const countSql = "SELECT COUNT(*) as total FROM skills WHERE skill_name LIKE ? OR skill_description LIKE ?";
        const dataSql = `SELECT * FROM skills 
                         WHERE skill_name LIKE ? OR skill_description LIKE ? 
                         ORDER BY ${db.escapeId(sortBy)} ${order === 'desc' ? 'DESC' : 'ASC'} 
                         LIMIT ? OFFSET ?`;

        const searchTerm = `%${search}%`;

        db.query(countSql, [searchTerm, searchTerm], (err, countResult) => {
            if (err) return res.status(500).json(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [searchTerm, searchTerm, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json(err2);
                res.json({
                    data: rows,
                    pagination: { total, totalPages, currentPage: page, limit }
                });
            });
        });
    });

    router.post("/api/skills", (req, res) => {
        const { skill_name, skill_description } = req.body;
        const sql = "INSERT INTO skills (skill_name, skill_description, status) VALUES (?, ?, 'ACTIVE')";
        db.query(sql, [skill_name, skill_description], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Skill added", id: result.insertId });
        });
    });

    router.put("/api/skills/:id", (req, res) => {
        const { skill_name, skill_description } = req.body;
        const sql = "UPDATE skills SET skill_name = ?, skill_description = ? WHERE skill_id = ?";
        db.query(sql, [skill_name, skill_description, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Skill updated" });
        });
    });

    router.put("/api/skills/:id/status", (req, res) => {
        const { status } = req.body;
        const sql = "UPDATE skills SET status = ? WHERE skill_id = ?";
        db.query(sql, [status, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Status updated" });
        });
    });

    // ==========================================
    // PRIORITIES CRUD (Robust)
    // ==========================================

    router.get("/api/priorities", (req, res) => {
        let { page = 1, limit = 10, sortBy = "priority_name", order = "asc", search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const countSql = "SELECT COUNT(*) as total FROM priorities WHERE priority_name LIKE ? OR priority_description LIKE ?";
        const dataSql = `SELECT * FROM priorities 
                         WHERE priority_name LIKE ? OR priority_description LIKE ? 
                         ORDER BY ${db.escapeId(sortBy)} ${order === 'desc' ? 'DESC' : 'ASC'} 
                         LIMIT ? OFFSET ?`;

        const searchTerm = `%${search}%`;

        db.query(countSql, [searchTerm, searchTerm], (err, countResult) => {
            if (err) return res.status(500).json(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [searchTerm, searchTerm, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json(err2);
                res.json({
                    data: rows,
                    pagination: { total, totalPages, currentPage: page, limit }
                });
            });
        });
    });

    router.post("/api/priorities", (req, res) => {
        const { priority_name, priority_description } = req.body;
        const sql = "INSERT INTO priorities (priority_name, priority_description, status) VALUES (?, ?, 'ACTIVE')";
        db.query(sql, [priority_name, priority_description], (err, result) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Priority added", id: result.insertId });
        });
    });

    router.put("/api/priorities/:id", (req, res) => {
        const { priority_name, priority_description } = req.body;
        const sql = "UPDATE priorities SET priority_name = ?, priority_description = ? WHERE priority_id = ?";
        db.query(sql, [priority_name, priority_description, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Priority updated" });
        });
    });

    router.put("/api/priorities/:id/status", (req, res) => {
        const { status } = req.body;
        const sql = "UPDATE priorities SET status = ? WHERE priority_id = ?";
        db.query(sql, [status, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Status updated" });
        });
    });

    // ==========================================
    // COMPLAINT CATEGORIES CRUD (Robust)
    // ==========================================

    router.get("/api/complaint-categories", (req, res) => {
        let { page = 1, limit = 10, sortBy = "category_name", order = "asc", search = "" } = req.query;
        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        const countSql = "SELECT COUNT(*) as total FROM complaint_categories WHERE category_name LIKE ? OR category_code LIKE ?";
        const dataSql = `
            SELECT c.*, 
                   d.department_name, s.service_type_name, 
                   sk.skill_name, p.priority_name
            FROM complaint_categories c
            LEFT JOIN departments d ON c.department_id = d.department_id
            LEFT JOIN service_types s ON c.service_type_id = s.service_type_id
            LEFT JOIN skills sk ON c.skill_id = sk.skill_id
            LEFT JOIN priorities p ON c.priority_id = p.priority_id
            WHERE c.category_name LIKE ? OR c.category_code LIKE ?
            ORDER BY c.${db.escapeId(sortBy)} ${order === 'desc' ? 'DESC' : 'ASC'}
            LIMIT ? OFFSET ?
        `;

        const searchTerm = `%${search}%`;

        db.query(countSql, [searchTerm, searchTerm], (err, countResult) => {
            if (err) return res.status(500).json(err);
            const total = countResult[0].total;
            const totalPages = Math.ceil(total / limit);

            db.query(dataSql, [searchTerm, searchTerm, limit, offset], (err2, rows) => {
                if (err2) return res.status(500).json(err2);
                res.json({
                    data: rows,
                    pagination: { total, totalPages, currentPage: page, limit }
                });
            });
        });
    });

    router.post("/api/complaint-categories", (req, res) => {
        const {
            category_code, category_name, category_description,
            department_id, service_type_id, skill_id, priority_id,
            expected_resolution_days, is_public
        } = req.body;

        const sql = `
            INSERT INTO complaint_categories 
            (category_code, category_name, category_description, 
             department_id, service_type_id, skill_id, priority_id, 
             expected_resolution_days, is_public, status) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE')
        `;

        db.query(
            sql,
            [category_code, category_name, category_description,
                department_id, service_type_id, skill_id, priority_id,
                expected_resolution_days, is_public ? 1 : 0],
            (err, result) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Category added", id: result.insertId });
            }
        );
    });

    router.put("/api/complaint-categories/:id", (req, res) => {
        const {
            category_code, category_name, category_description,
            department_id, service_type_id, skill_id, priority_id,
            expected_resolution_days, is_public
        } = req.body;

        const sql = `
            UPDATE complaint_categories 
            SET category_code = ?, category_name = ?, category_description = ?, 
                department_id = ?, service_type_id = ?, skill_id = ?, priority_id = ?, 
                expected_resolution_days = ?, is_public = ? 
            WHERE category_id = ?
        `;

        db.query(
            sql,
            [category_code, category_name, category_description,
                department_id, service_type_id, skill_id, priority_id,
                expected_resolution_days, is_public ? 1 : 0, req.params.id],
            (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Category updated" });
            }
        );
    });

    router.put("/api/complaint-categories/:id/status", (req, res) => {
        const { status } = req.body;
        const sql = "UPDATE complaint_categories SET status = ? WHERE category_id = ?";
        db.query(sql, [status, req.params.id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Status updated" });
        });
    });

    // ==========================================
    // GALLERY CRUD
    // ==========================================

    const multer = require("multer");
    const path = require("path");
    const fs = require("fs");

    const galleryStorage = multer.diskStorage({
        destination: (req, file, cb) => {
            const dir = "uploads/gallery/";
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    });
    const uploadGallery = multer({ storage: galleryStorage });

    // Fetch categories by department (for gallery dropdown)
    router.get("/api/gallery/categories/:departmentId", (req, res) => {
        db.query("SELECT * FROM complaint_categories WHERE department_id = ?", [req.params.departmentId], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        });
    });

    // Fetch common images for a department
    router.get("/api/gallery/common/:departmentId", (req, res) => {
        db.query("SELECT * FROM complaint_gallery WHERE department_id = ? AND is_common = 1", [req.params.departmentId], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        });
    });

    // Fetch images for a category
    router.get("/api/gallery/category/:categoryId", (req, res) => {
        db.query("SELECT * FROM complaint_gallery WHERE category_id = ?", [req.params.categoryId], (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        });
    });

    // Upload gallery image
    router.post("/api/gallery/upload", uploadGallery.single("image"), (req, res) => {
        const { department_id, category_id, image_description, is_common } = req.body;
        const image_path = req.file ? req.file.filename : null;

        if (!image_path) return res.status(400).json({ message: "No image uploaded" });

        const sql = `INSERT INTO complaint_gallery (department_id, category_id, image_path, image_description, is_common) 
                     VALUES (?, ?, ?, ?, ?)`;
        db.query(sql, [department_id, category_id || null, image_path, image_description, is_common === "true" ? 1 : 0], (err, result) => {
            if (err) {
                console.error("Gallery Upload Error:", err);
                return res.status(500).json(err);
            }
            res.json({ message: "Image uploaded", id: result.insertId });
        });
    });

    // Delete gallery image
    router.delete("/api/gallery/:id", (req, res) => {
        db.query("SELECT image_path FROM complaint_gallery WHERE image_id = ?", [req.params.id], (err, rows) => {
            if (err || rows.length === 0) return res.status(404).json({ message: "Image not found" });

            const filePath = path.join("uploads/gallery/", rows[0].image_path);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

            db.query("DELETE FROM complaint_gallery WHERE image_id = ?", [req.params.id], (err) => {
                if (err) return res.status(500).json(err);
                res.json({ message: "Image deleted" });
            });
        });
    });

    // Secondary Admin Applications (for approvals)
    router.get("/api/secondary-admin/applications", (req, res) => {
        db.query("SELECT * FROM secondary_admin_applications ORDER BY created_at DESC", (err, rows) => {
            if (err) return res.status(500).json(err);
            res.json(rows);
        });
    });

    // Approve Application
    router.post("/api/secondary-admin/approve/:id", (req, res) => {
        const id = req.params.id;
        db.query("UPDATE secondary_admin_applications SET application_status = 'APPROVED' WHERE application_id = ?", [id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Application approved" });
        });
    });

    // Reject Application
    router.post("/api/secondary-admin/reject/:id", (req, res) => {
        const id = req.params.id;
        db.query("UPDATE secondary_admin_applications SET application_status = 'REJECTED' WHERE application_id = ?", [id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Application rejected" });
        });
    });

    // Remove Application
    router.post("/api/secondary-admin/remove/:id", (req, res) => {
        const id = req.params.id;
        db.query("DELETE FROM secondary_admin_applications WHERE application_id = ?", [id], (err) => {
            if (err) return res.status(500).json(err);
            res.json({ message: "Application removed" });
        });
    });

    return router;
};
