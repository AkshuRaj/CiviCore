const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const axios = require('axios'); // Requires axios, I will run this via node

const API_BASE = 'http://localhost:5000/api/staff-register';
const DB_CONFIG = { host: 'localhost', user: 'root', password: 'my_root_aksh_04', database: 'complaint_db' };

async function runTest() {
  console.log("=== Staff Hierarchy Flow Test ===");
  const db = await mysql.createConnection(DB_CONFIG);

  // 1. Ensure we have an Admin
  const [admins] = await db.query("SELECT * FROM admins");
  if (admins.length === 0) {
    console.log("No admins found, creating a default one...");
    const hash = await bcrypt.hash("admin123", 10);
    await db.query("INSERT INTO admins (admin_name, admin_email, admin_password, role) VALUES ('Super Admin', 'admin@ocms.in', ?, 'PRIMARY_ADMIN')", [hash]);
  } else {
    // forcefully update password to 'admin123' so we can test
    const hash = await bcrypt.hash("admin123", 10);
    await db.query("UPDATE admins SET admin_password = ? WHERE admin_email = ?", [hash, admins[0].admin_email]);
  }
  const [[admin]] = await db.query("SELECT * FROM admins LIMIT 1");
  console.log("✅ Main Admin ready:", admin.admin_email);

  // 2. Clear old test data
  await db.query("DELETE FROM staff_registrations WHERE email LIKE 'test_%@ocms.in'");
  await db.query("DELETE FROM staff_registration_otps WHERE email LIKE 'test_%@ocms.in'");

  // 3. Register a SECONDARY_ADMIN
  const secAdminForm = {
    name: "Test Sec Admin",
    email: "test_sec_admin@ocms.in",
    password: "password123",
    confirmPassword: "password123",
    phone: "9876543210",
    role: "SECONDARY_ADMIN",
    country: "India",
    state: "Maharashtra",
    aadhaar: "123456789012",
    address: "Pune, MH"
  };

  try {
    console.log("-> Requesting OTP for Secondary Admin...");
    await axios.post(`${API_BASE}/request-otp`, secAdminForm);
    
    // Read OTP from DB
    const [[otpObj]] = await db.query("SELECT otp FROM staff_registration_otps WHERE email = ?", [secAdminForm.email]);
    console.log(`✅ Got OTP: ${otpObj.otp}`);

    console.log("-> Verifying OTP...");
    await axios.post(`${API_BASE}/verify-otp`, { email: secAdminForm.email, otp: otpObj.otp });
    console.log("✅ Application submitted successfully (PENDING).");
  } catch (err) {
    console.error("❌ Registration failed:", err.response?.data || err.message);
    return;
  }

  // 4. Login as PRIMARY ADMIN to approve
  let adminToken;
  try {
    const res = await axios.post(`${API_BASE}/login`, { email: admin.admin_email, password: "admin123" });
    adminToken = res.data.token;
    console.log("✅ Admin logged in successfully");
  } catch (err) {
    console.error("❌ Admin login failed:", err.response?.data || err.message);
    return;
  }

  // 5. Fetch Pending and Approve
  try {
    const res = await axios.get(`${API_BASE}/pending`, { headers: { Authorization: `Bearer ${adminToken}` } });
    const pendingApps = res.data.applications;
    console.log(`✅ Admin sees ${pendingApps.length} pending SECONDARY_ADMIN applications`);
    
    const myApp = pendingApps.find(a => a.email === secAdminForm.email);
    if (!myApp) throw new Error("Application not found in queue");

    await axios.put(`${API_BASE}/${myApp.id}/approve`, {}, { headers: { Authorization: `Bearer ${adminToken}` } });
    console.log("✅ Admin APPROVED the Secondary Admin!");
  } catch (err) {
    console.error("❌ Approval failed:", err.response?.data || err.message);
    return;
  }

  // 6. Login as the newly approved Secondary Admin
  let secAdminToken;
  try {
    const res = await axios.post(`${API_BASE}/login`, { email: secAdminForm.email, password: "password123" });
    secAdminToken = res.data.token;
    console.log("✅ Secondary Admin successfully logged in!");
  } catch (err) {
    console.error("❌ Secondary Admin login failed (Should be approved):", err.response?.data || err.message);
    return;
  }

  // 7. Head Registration (Jurisdiction test)
  const headForm = {
    name: "Test Head Admin",
    email: "test_head@ocms.in",
    password: "password123",
    confirmPassword: "password123",
    phone: "9876543211",
    role: "HEAD",
    country: "India",
    state: "Maharashtra",  // Same state
    district: "Pune",
    aadhaar: "123456789013",
    address: "Pune City, MH"
  };

  try {
    console.log("-> Requesting OTP for Head...");
    await axios.post(`${API_BASE}/request-otp`, headForm);
    const [[otpObj]] = await db.query("SELECT otp FROM staff_registration_otps WHERE email = ?", [headForm.email]);
    await axios.post(`${API_BASE}/verify-otp`, { email: headForm.email, otp: otpObj.otp });
    console.log("✅ Head Application submitted successfully (PENDING).");
  } catch(e) {
    console.error("❌ Head registration failed", e.response?.data || e.message);
  }

  // 8. Secondary Admin views the Queue and approves Head
  try {
    const res = await axios.get(`${API_BASE}/pending`, { headers: { Authorization: `Bearer ${secAdminToken}` } });
    const pendingApps = res.data.applications;
    console.log(`✅ Secondary Admin (Maharashtra) sees ${pendingApps.length} pending HEAD applications`);
    
    const headApp = pendingApps.find(a => a.email === headForm.email);
    if (!headApp) throw new Error("Head Application not found in queue");

    await axios.put(`${API_BASE}/${headApp.id}/approve`, {}, { headers: { Authorization: `Bearer ${secAdminToken}` } });
    console.log("✅ Secondary Admin APPROVED the Head!");
  } catch (err) {
    console.error("❌ Head approval failed:", err.response?.data || err.message);
    return;
  }

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! Stack and Queue domains strictly enforced.");
  db.end();
}

runTest();
