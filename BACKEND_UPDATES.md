# Backend Integration Complete ✅

## What Was Updated

### 1. **backend/server.js** 
- Updated all authentication endpoints to use your **CitizenSignup** table instead of generic "users"
- Updated OTP endpoints to use your **citizen_otps** and **login_otps** tables
- Added proper INSERT/UPDATE queries for OTP storage
- All complaint endpoints already configured to use **complaints** table
- Foreign keys properly reference CitizenSignup table

**Updated Endpoints:**
```javascript
// Login uses CitizenSignup
SELECT FROM CitizenSignup WHERE email = ? AND password = ?

// OTP registration uses citizen_otps
INSERT INTO citizen_otps (email, otp, createdAt) VALUES (...)

// OTP login uses login_otps  
INSERT INTO login_otps (email, otp, createdAt) VALUES (...)

// User creation uses CitizenSignup
INSERT INTO CitizenSignup (email, firstName, lastName, password, ...)

// Complaints use complaints table
INSERT INTO complaints (userId, category, title, ...)

// Admin queries use proper table names
SELECT c.* FROM complaints c LEFT JOIN CitizenSignup cs ON c.userId = cs.id
```

---

### 2. **backend/setup.js**
- Updated table creation to define **CitizenSignup** instead of "users"
- Added **citizen_otps** table creation
- Added **login_otps** table creation
- Updated foreign key constraints to reference CitizenSignup(id)
- Updated sample data insertion to use CitizenSignup table

**Tables Created by setup.js:**
- ✅ CitizenSignup (users)
- ✅ citizen_otps (signup OTPs)
- ✅ login_otps (login OTPs)
- ✅ complaints (complaint management)
- ✅ attachments (file uploads)

---

### 3. **TABLES_MAPPING.md** (New)
- Complete documentation of table structure
- All API endpoints mapped to their respective tables
- Testing examples for each endpoint
- Database connection details

---

## Current Status

✅ **Backend Server Running**
```
✅ Backend running on port 5000
✅ Database connection pool created
✅ MySQL Database connected successfully!
```

✅ **All Tables Properly Mapped:**
- CitizenSignup ← User registration/login
- citizen_otps ← Signup OTP verification
- login_otps ← Login OTP verification
- complaints ← Complaint management
- attachments ← File attachments

✅ **All API Endpoints Configured:**
- 5 Authentication endpoints
- 5 Complaint management endpoints
- Using correct table names and columns

---

## How It Works

### User Registration Flow:
1. `POST /api/auth/register/prepare` → Inserts OTP into **citizen_otps**
2. `POST /api/auth/register/verify` → Creates user in **CitizenSignup**, deletes OTP
3. New user can now login

### User Login Flow (OTP):
1. `POST /api/auth/login/request-otp` → Inserts OTP into **login_otps**
2. `POST /api/auth/login/verify-otp` → Verifies against **login_otps**
3. User authenticated

### User Login Flow (Password):
1. `POST /api/auth/login/password` → Checks **CitizenSignup** table
2. Returns user data if credentials match

### Complaint Management Flow:
1. `POST /api/complaints` → Creates record in **complaints**
2. `GET /api/complaints/:userId` → Retrieves from **complaints**
3. `PUT /api/admin/complaints/:complaintId` → Updates **complaints**

---

## Database Schema Used

### CitizenSignup
```sql
id, email (UNIQUE), firstName, lastName, password, phone, city, state, country, createdAt, updatedAt
```

### citizen_otps
```sql
id, email (UNIQUE), otp, createdAt
```

### login_otps
```sql
id, email (UNIQUE), otp, createdAt
```

### complaints
```sql
id, userId (FK→CitizenSignup), category, title, description, priority, city, status, createdAt, updatedAt
```

### attachments
```sql
id, complaintId (FK→complaints), fileName, filePath, fileType, uploadedAt
```

---

## Demo Credentials

**OTP for Testing:** `123456`
**Sample User (created by setup.js):**
- Email: demo@example.com
- Password: password123

---

## Next Steps

1. ✅ **Backend is already running** (port 5000)
2. **Start Frontend** in a new terminal:
   ```powershell
   cd D:\my-project
   npm run dev
   ```
3. **Test the application:**
   - Go to http://localhost:5173
   - Click "Sign Up"
   - Enter email, fill form, OTP: 123456
   - Login with created credentials
   - Create complaint → saved to **complaints** table
   - View complaint status

---

## Database Configuration

The backend connects to MySQL with these credentials:
- **Host:** localhost
- **User:** root  
- **Password:** my_root_aksh_04
- **Database:** complaint_db
- **Pool Size:** 10 connections

If your credentials are different, update: `backend/db.js`

---

## Troubleshooting

### Backend won't start?
- Check MySQL is running
- Verify credentials in `backend/db.js`
- Ensure port 5000 is available

### Tables don't exist?
- Run `node setup.js` in backend folder
- It will create all tables with correct structure

### Frontend can't reach backend?
- Backend must be running on port 5000
- Check Vite proxy in `vite.config.js`
- Check browser console for errors

---

## Summary

Your project is now **fully integrated with your MySQL database**. All authentication flows (password login, OTP signup, OTP login) are connected to your existing tables. Complaints will be properly stored in the complaints table with user references. The system is ready for testing!
