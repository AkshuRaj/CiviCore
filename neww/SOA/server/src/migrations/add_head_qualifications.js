/**
 * Database Migration - Add Qualification Fields to Heads Table
 * Run this SQL in your MySQL database
 */

const migrationSQL = `
-- Add new qualification-related columns to heads table
  ALTER TABLE heads ADD COLUMN qualification VARCHAR(100) DEFAULT NULL;
  ALTER TABLE heads ADD COLUMN years_of_experience VARCHAR(50) DEFAULT NULL;
  ALTER TABLE heads ADD COLUMN certifications LONGTEXT DEFAULT NULL;
  ALTER TABLE heads ADD COLUMN department_experience VARCHAR(50) DEFAULT NULL;
  ALTER TABLE heads ADD COLUMN approval_code VARCHAR(50) NOT NULL;
  ALTER TABLE heads ADD COLUMN designation VARCHAR(100) DEFAULT NULL;

-- Update status field to allow PENDING status
-- (If your status field doesn't support PENDING already)
-- ALTER TABLE heads MODIFY COLUMN status ENUM('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- Add indexes for better query performance
CREATE INDEX idx_approval_code ON heads(approval_code);
CREATE INDEX idx_qualification ON heads(qualification);
CREATE INDEX idx_status ON heads(status);
`;

console.log("Migration SQL Script:");
console.log(migrationSQL);

/**
 * To run this migration programmatically:
 */
/*
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "chithu",
  database: "complaintt_system"
});

db.connect((err) => {
  if (err) {
    console.error("Connection failed:", err);
    return;
  }

  const statements = migrationSQL.split(';').filter(s => s.trim());
  let completed = 0;

  statements.forEach((stmt, index) => {
    if (stmt.trim()) {
      db.query(stmt, (err) => {
        if (err) {
          console.error(`Error in statement ${index + 1}:`, err);
        } else {
          console.log(`✓ Statement ${index + 1} executed successfully`);
        }
        completed++;
        if (completed === statements.length) {
          console.log("✓ All migrations completed");
          db.end();
        }
      });
    }
  });
});
*/

module.exports = migrationSQL;
