const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "my_root_aksh_04",
    database: "complaintt_system"
});

db.connect((err) => {
    if (err) {
        console.error("Connection error:", err);
        process.exit(1);
    }

    db.query("ALTER TABLE complaints ADD COLUMN auto_assigned_employee_id INT", (err) => {
        if (err && err.code !== 'ER_DUP_COLUMN_NAMES') {
            console.error("Error adding employee_id:", err.message);
        } else {
            console.log("Column auto_assigned_employee_id ready");
        }

        db.query("ALTER TABLE complaints ADD COLUMN auto_assigned_employee VARCHAR(255)", (err2) => {
            if (err2 && err2.code !== 'ER_DUP_COLUMN_NAMES') {
                console.error("Error adding employee name:", err2.message);
            } else {
                console.log("Column auto_assigned_employee ready");
            }
            db.end();
        });
    });
});
