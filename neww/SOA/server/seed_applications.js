const mysql = require('mysql2');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'chithu',
    database: 'complaintt_system'
});

const sql = `
INSERT INTO secondary_admin_applications (full_name, email, mobile_number, application_status, country_name, state_name)
VALUES ('John Doe', 'john.doe@example.com', '1234567890', 'PENDING', 'India', 'Tamil Nadu')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);
`;

db.query(sql, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log("Dummy record inserted into secondary_admin_applications");
    process.exit();
});
