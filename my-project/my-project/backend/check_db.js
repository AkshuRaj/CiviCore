const mysql = require('mysql2');

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "my_root_aksh_04",
  database: "complaintt_system",
});

db.connect((err) => {
  if (err) {
    console.error("Connection error:", err);
    process.exit(1);
  }
  
  db.query("DESCRIBE login_otps", (err, rows) => {
    if (err) {
      console.error("Describe error:", err);
    } else {
      console.log("Table Schema:", JSON.stringify(rows, null, 2));
    }
    db.end();
  });
});
