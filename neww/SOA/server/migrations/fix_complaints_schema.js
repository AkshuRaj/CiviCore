const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'chithu',
  database: 'complaintt_system'
});

db.connect(err => {
  if (err) {
    console.error('Connection error:', err);
    process.exit(1);
  }

  // Add created_at column if it doesn't exist
  const sql = `
    ALTER TABLE complaints 
    ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Migration error:', err);
      db.end();
      process.exit(1);
    }
    console.log('✓ Migration completed: created_at column added to complaints table');
    
    // Verify the column exists
    db.query('DESCRIBE complaints', (err, columns) => {
      if (err) {
        console.error('Verification error:', err);
        db.end();
        process.exit(1);
      }
      const hasCreatedAt = columns.some(col => col.Field === 'created_at');
      console.log('✓ Verified: created_at column exists:', hasCreatedAt);
      
      db.end();
      process.exit(0);
    });
  });
});
