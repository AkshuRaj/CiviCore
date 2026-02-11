const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure uploads dir
const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Create table if not exists and insert complaint (supports optional file upload)
router.post('/', upload.single('proof'), (req, res) => {
  const data = req.body || {};
  const file = req.file;

  const title = data.title || '';
  const name = data.name || '';
  const city = data.city || '';
  const street = data.street || '';
  const address = data.address || '';
  const landmark = data.landmark || '';
  const category = data.category || '';
  const description = data.description || '';
  const priority = data.priority || 'NORMAL';
  const contact_time = data.contact_time || '';
  const userId = data.userId ? parseInt(data.userId) : null; // Get user_id from frontend
  const proof = file ? file.filename : (data.proof || null);

  // Helpful debug log: shows which fields arrived (does not log full descriptions)
  console.log('Create complaint request:', {
    title, name, city, street, address, landmark, category, priority, contact_time, userId, hasProof: !!file
  });

  if (!title || !description || !city || !street || !address || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const createTableSql = `CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    title VARCHAR(255),
    name VARCHAR(255),
    city VARCHAR(255),
    street VARCHAR(255),
    address TEXT,
    landmark VARCHAR(255),
    category VARCHAR(100),
    category_id INT NULL,
    location_id INT NULL,
    description TEXT,
    priority VARCHAR(20) DEFAULT 'Normal',
    contact_time VARCHAR(20) DEFAULT 'Morning',
    proof VARCHAR(255),
    status ENUM('REGISTERED','ASSIGNED_TO_HEAD','ASSIGNED_TO_STAFF','IN_PROGRESS','RESOLVED') DEFAULT 'REGISTERED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=INNODB;`;

  db.query(createTableSql, (err) => {
    if (err) {
      console.error('Failed to ensure complaints table:', err);
      return res.status(500).json({ error: 'DB error creating table' });
    }

    // ensure columns we will use exist (category_id, location_id)
    db.query('DESCRIBE complaints', (descErr, cols) => {
      if (descErr) {
        console.error('Failed to describe complaints table:', descErr);
        return res.status(500).json({ error: 'DB describe error', detail: descErr && descErr.message ? descErr.message : String(descErr) });
      }

      const existing = Array.isArray(cols) ? cols.map((r) => r.Field) : [];
      const alters = [];
      if (!existing.includes('category_id')) alters.push('ADD COLUMN category_id INT NULL');
      if (!existing.includes('location_id')) alters.push('ADD COLUMN location_id INT NULL');
      if (!existing.includes('user_id')) alters.push('ADD COLUMN user_id INT NULL');
      if (!existing.includes('title')) alters.push("ADD COLUMN title VARCHAR(255) NULL");
      if (!existing.includes('name')) alters.push("ADD COLUMN name VARCHAR(255) NULL");
      if (!existing.includes('city')) alters.push("ADD COLUMN city VARCHAR(255) NULL");
      if (!existing.includes('street')) alters.push("ADD COLUMN street VARCHAR(255) NULL");
      if (!existing.includes('address')) alters.push("ADD COLUMN address TEXT NULL");
      if (!existing.includes('landmark')) alters.push("ADD COLUMN landmark VARCHAR(255) NULL");
      if (!existing.includes('category')) alters.push("ADD COLUMN category VARCHAR(100) NULL");
      if (!existing.includes('priority')) alters.push("ADD COLUMN priority VARCHAR(20) DEFAULT 'NORMAL'");
      if (!existing.includes('contact_time')) alters.push("ADD COLUMN contact_time VARCHAR(20) DEFAULT 'Morning'");
      if (!existing.includes('proof')) alters.push("ADD COLUMN proof VARCHAR(255) NULL");
      if (!existing.includes('updated_at')) alters.push("ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP");

      const runContinued = () => {
        // ensure status column exists for older installs
        db.query("SHOW COLUMNS FROM complaints LIKE 'status'", (colErr, cols2) => {
          if (colErr) {
            console.error('Failed to check complaints columns:', colErr);
            // continue - non-fatal
          } else if (Array.isArray(cols2) && cols2.length === 0) {
            db.query("ALTER TABLE complaints ADD COLUMN status ENUM('REGISTERED','ASSIGNED_TO_HEAD','ASSIGNED_TO_STAFF','IN_PROGRESS','RESOLVED') DEFAULT 'REGISTERED'", (alterErr) => {
              if (alterErr) console.error('Failed to add status column:', alterErr);
            });
          }

          // ensure categories and locations tables exist (simple migration)
          db.query("CREATE TABLE IF NOT EXISTS categories (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE)", (cErr) => {
            if (cErr) console.error('Failed to ensure categories table:', cErr);

            db.query("CREATE TABLE IF NOT EXISTS locations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) UNIQUE)", (lErr) => {
              if (lErr) console.error('Failed to ensure locations table:', lErr);

              // helper to get or create category
              const getOrCreateCategory = (nameStr, cb) => {
                if (!nameStr) return cb(null, null);
                db.query('SELECT id FROM categories WHERE name = ?', [nameStr], (sErr, rows) => {
                  if (sErr) return cb(sErr);
                  if (Array.isArray(rows) && rows.length) return cb(null, rows[0].id);
                  db.query('INSERT INTO categories (name) VALUES (?)', [nameStr], (iErr, r) => {
                    if (iErr) return cb(iErr);
                    cb(null, r.insertId);
                  });
                });
              };

              // helper to get or create location
              const getOrCreateLocation = (nameStr, cb) => {
                if (!nameStr) return cb(null, null);
                db.query('SELECT id FROM locations WHERE name = ?', [nameStr], (sErr, rows) => {
                  if (sErr) return cb(sErr);
                  if (Array.isArray(rows) && rows.length) return cb(null, rows[0].id);
                  db.query('INSERT INTO locations (name) VALUES (?)', [nameStr], (iErr, r) => {
                    if (iErr) return cb(iErr);
                    cb(null, r.insertId);
                  });
                });
              };

              // map category/location to IDs then insert
              getOrCreateCategory(category, (catErr, categoryId) => {
                if (catErr) {
                  console.error('Category lookup/insert failed:', catErr);
                  return res.status(500).json({ error: 'Category lookup error', detail: catErr && catErr.message ? catErr.message : String(catErr) });
                }

                getOrCreateLocation(city, (locErr, locationId) => {
                  if (locErr) {
                    console.error('Location lookup/insert failed:', locErr);
                    return res.status(500).json({ error: 'Location lookup error', detail: locErr && locErr.message ? locErr.message : String(locErr) });
                  }

                  // normalize priority to match enum values (some schemas use uppercase enums)
                  let p = (priority || 'NORMAL').toString().toUpperCase();
                  if (!['NORMAL','HIGH','EMERGENCY'].includes(p)) p = 'NORMAL';

                  const insertSql = `INSERT INTO complaints (user_id, title, name, city, street, address, landmark, category, category_id, location_id, description, priority, contact_time, proof, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                  const params = [userId, title, name, city, street, address, landmark, category, categoryId, locationId, description, p, contact_time, proof, 'REGISTERED'];

                  db.query(insertSql, params, (insertErr, result) => {
                    if (insertErr) {
                      console.error('Failed to insert complaint:', insertErr);
                      console.error('Insert SQL:', insertSql);
                      console.error('Insert params:', params);
                      return res.status(500).json({ error: 'DB insert error', detail: insertErr && insertErr.message ? insertErr.message : String(insertErr) });
                    }

                    // Respond to client - DB insert succeeded
                    res.json({ success: true, id: result.insertId, message: 'registered a complaint successfully' });

                    // Fire-and-forget: send notification asynchronously using async/await (will not block response)
                    (async () => {
                      try {
                        const { sendNewComplaintNotification } = require('../utils/email');
                        const info = await sendNewComplaintNotification(db, { locationId, complaintTitle: title, address, priority, dummyUser: 'Guest User' });
                        if (info) {
                          console.log(`Notification email attempt succeeded (messageId: ${info.messageId || 'unknown'}) for complaint id ${result.insertId}`);
                        } else {
                          console.log(`Notification email attempt finished with no result for complaint id ${result.insertId}`);
                        }
                      } catch (err) {
                        console.error('Error in notification flow:', err && (err.message || err));
                      }
                    })();
                  });
                });
              });
            });
          });
        });
      };

      if (alters.length) {
        console.log('Attempting to add complaints columns:', alters);
        // run alters sequentially so we get precise error logs per operation
        const runAlter = (i) => {
          if (i >= alters.length) return runContinued();
          const sql = 'ALTER TABLE complaints ' + alters[i];
          console.log('Running SQL:', sql);
          db.query(sql, (aErr) => {
            if (aErr) console.error('Failed to run alter:', sql, aErr && (aErr.message || aErr));
            runAlter(i + 1);
          });
        };
        runAlter(0);
      } else {
        runContinued();
      }
    });
  });
});

// GET /api/complaints/debug - Debug endpoint to check raw complaints data
router.get('/debug', (req, res) => {
  const sql = 'SELECT id, user_id, title, status, created_at FROM complaints ORDER BY created_at DESC LIMIT 10';
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Failed to fetch complaints debug data:', err);
      return res.status(500).json({ error: 'DB fetch error', detail: err && err.message ? err.message : String(err) });
    }
    console.log('Debug complaints data:', rows);
    res.json({ success: true, complaints: rows });
  });
});

// GET /api/complaints/schema - returns table description for diagnostics
router.get('/schema', (req, res) => {
  db.query('DESCRIBE complaints', (err, rows) => {
    if (err) {
      console.error('Failed to describe complaints table:', err);
      return res.status(500).json({ error: 'DB describe error', detail: err && err.message ? err.message : String(err) });
    }
    res.json({ success: true, schema: rows });
  });
});

// GET /api/complaints/stats - Get statistics for authenticated user
router.get('/stats', (req, res) => {
  // Get user_id from query param (passed by frontend with user context)
  const userId = req.query.userId;

  console.log('Stats request for userId:', userId);

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }

  const totalSql = 'SELECT COUNT(*) as total FROM complaints WHERE user_id = ?';
  const pendingSql = `SELECT COUNT(*) as pending FROM complaints WHERE user_id = ? AND status IN ('REGISTERED', 'ASSIGNED_TO_HEAD', 'ASSIGNED_TO_STAFF', 'IN_PROGRESS')`;
  const closedSql = "SELECT COUNT(*) as closed FROM complaints WHERE user_id = ? AND status = 'RESOLVED'";

  let stats = {};
  let completed = 0;

  db.query(totalSql, [userId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch total complaints:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    stats.total = rows[0]?.total || 0;
    console.log('Total complaints query result:', stats.total);
    completed++;
    if (completed === 3) sendResponse();
  });

  db.query(pendingSql, [userId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch pending complaints:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    stats.pending = rows[0]?.pending || 0;
    console.log('Pending complaints query result:', stats.pending);
    completed++;
    if (completed === 3) sendResponse();
  });

  db.query(closedSql, [userId], (err, rows) => {
    if (err) {
      console.error('Failed to fetch closed complaints:', err);
      return res.status(500).json({ error: 'DB error' });
    }
    stats.closed = rows[0]?.closed || 0;
    console.log('Closed complaints query result:', stats.closed);
    completed++;
    if (completed === 3) sendResponse();
  });

  const sendResponse = () => {
    console.log('Sending stats response:', stats);
    res.json({ success: true, stats });
  };
});

// GET /api/complaints - list all complaints
router.get('/', (req, res) => {
  const sql = `SELECT c.id, c.title, c.name AS complainant, COALESCE(cat.name, c.category) AS category, COALESCE(loc.name, c.city) AS city, c.street, c.address, c.landmark, c.description, c.priority, c.contact_time, c.proof, c.status, c.created_at FROM complaints c LEFT JOIN categories cat ON c.category_id = cat.id LEFT JOIN locations loc ON c.location_id = loc.id ORDER BY c.created_at DESC`;
  db.query(sql, (err, rows) => {
    if (err) {
      console.error('Failed to fetch complaints:', err);
      return res.status(500).json({ error: 'DB fetch error', detail: err && err.message ? err.message : String(err) });
    }
    res.json({ success: true, complaints: rows });
  });
});

module.exports = router;
