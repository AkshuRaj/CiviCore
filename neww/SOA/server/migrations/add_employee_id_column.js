// Migration: Ensure employee_id column exists in complaints table
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
  
  console.log("Connected to database. Checking columns...");

  // Check if columns exist
  db.query(`SHOW COLUMNS FROM complaints LIKE 'employee_id'`, (err, result) => {
    if (!result || result.length === 0) {
      db.query(`ALTER TABLE complaints ADD COLUMN employee_id INT NULL`, (err) => {
        if (err) console.error("Error adding employee_id:", err);
        else console.log("✓ employee_id column added");
      });
    } else {
      console.log("✓ employee_id column already exists");
    }

    db.query(`SHOW COLUMNS FROM complaints LIKE 'staff_confirmation_sent'`, (err, result) => {
      if (!result || result.length === 0) {
        db.query(`ALTER TABLE complaints ADD COLUMN staff_confirmation_sent TINYINT(1) DEFAULT 0`, (err) => {
          if (err) console.error("Error adding staff_confirmation_sent:", err);
          else console.log("✓ staff_confirmation_sent column added");
        });
      } else {
        console.log("✓ staff_confirmation_sent column already exists");
      }

      db.query(`SHOW COLUMNS FROM complaints LIKE 'staff_confirmation_at'`, (err, result) => {
        if (!result || result.length === 0) {
          db.query(`ALTER TABLE complaints ADD COLUMN staff_confirmation_at TIMESTAMP NULL`, (err) => {
            if (err) console.error("Error adding staff_confirmation_at:", err);
            else console.log("✓ staff_confirmation_at column added");
            
            console.log("\n✓ Migration completed successfully");
            db.end();
          });
        } else {
          console.log("✓ staff_confirmation_at column already exists");
          console.log("\n✓ Migration completed successfully");
          db.end();
        }
      });
    });
  });
});
