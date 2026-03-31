// Migration: Add staff confirmation tracking
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chithu",
  database: "complaintt_system"
});

db.connect(err => {
  if (err) {
    console.error("DB Connection Error:", err);
    process.exit(1);
  }
  
  console.log("Connected to database. Adding staff confirmation columns...");

  // Add columns to track staff confirmation
  const sql = `
    ALTER TABLE complaints
    ADD COLUMN IF NOT EXISTS staff_confirmation_sent TINYINT(1) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS staff_confirmation_at TIMESTAMP NULL;
  `;

  db.query(sql, (err, result) => {
    if (err) {
      console.error("Migration Error:", err);
      process.exit(1);
    }
    
    console.log("✓ Staff confirmation columns added successfully");
    console.log("Columns added:");
    console.log("  - staff_confirmation_sent (TINYINT): Track if staff sent confirmation");
    console.log("  - staff_confirmation_at (TIMESTAMP): When staff sent confirmation");
    
    db.end();
  });
});
