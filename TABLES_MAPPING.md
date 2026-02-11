# MySQL Tables Mapping

## Overview
Your backend is now configured to use your existing MySQL tables in the complaint_db database.

## Tables Being Used

### 1. **CitizenSignup** (User Registration)
Stores all citizen user information during registration and login.

**Columns:**
- `id` - Primary Key (Auto-increment)
- `email` - Unique email address
- `firstName` - User's first name
- `lastName` - User's last name
- `password` - Encrypted password
- `phone` - Phone number
- `city` - City
- `state` - State
- `country` - Country
- `createdAt` - Registration timestamp
- `updatedAt` - Last update timestamp

**Used In:**
- POST `/api/auth/login/password` - Login with email/password
- POST `/api/auth/register/prepare` - Check if email exists
- POST `/api/auth/register/verify` - Create new user after OTP verification

---

### 2. **citizen_otps** (Signup OTP)
Stores One-Time Passwords for new user registration.

**Columns:**
- `id` - Primary Key
- `email` - User's email (Unique)
- `otp` - 6-digit OTP code
- `createdAt` - OTP generation timestamp

**Used In:**
- POST `/api/auth/register/prepare` - Insert OTP for signup
- POST `/api/auth/register/verify` - Verify OTP before creating account
- Auto-deleted after successful registration

**Demo OTP:** `123456`

---

### 3. **login_otps** (Login OTP)
Stores One-Time Passwords for existing user login.

**Columns:**
- `id` - Primary Key
- `email` - User's email (Unique)
- `otp` - 6-digit OTP code
- `createdAt` - OTP generation timestamp

**Used In:**
- POST `/api/auth/login/request-otp` - Request OTP for login
- POST `/api/auth/login/verify-otp` - Verify login OTP

**Demo OTP:** `123456`

---

### 4. **complaints** (Complaint Management)
Stores all citizen complaints and their status.

**Columns:**
- `id` - Primary Key
- `userId` - Foreign Key to CitizenSignup(id)
- `category` - Complaint category
- `title` - Complaint title
- `description` - Detailed description
- `priority` - Priority level (Low/Medium/High)
- `city` - Location of complaint
- `status` - Current status (Pending/In Progress/Resolved)
- `createdAt` - Submission timestamp
- `updatedAt` - Last update timestamp

**Used In:**
- POST `/api/complaints` - Create new complaint
- GET `/api/complaints/:userId` - Get user's complaints
- GET `/api/complaints/stats/:userId` - Get complaint statistics
- GET `/api/admin/complaints` - Get all complaints (admin)
- PUT `/api/admin/complaints/:complaintId` - Update complaint status

---

### 5. **attachments** (Proof Documents)
Stores file attachments for complaints.

**Columns:**
- `id` - Primary Key
- `complaintId` - Foreign Key to complaints(id)
- `fileName` - Original filename
- `filePath` - Storage path
- `fileType` - MIME type
- `uploadedAt` - Upload timestamp

**Used In:**
- File uploads with complaint creation (Future implementation)

---

## API Endpoints Overview

### Authentication
| Method | Endpoint | Table |
|--------|----------|-------|
| POST | `/api/auth/login/password` | CitizenSignup |
| POST | `/api/auth/login/request-otp` | login_otps |
| POST | `/api/auth/login/verify-otp` | login_otps |
| POST | `/api/auth/register/prepare` | CitizenSignup, citizen_otps |
| POST | `/api/auth/register/verify` | CitizenSignup, citizen_otps |

### Complaints
| Method | Endpoint | Table |
|--------|----------|-------|
| POST | `/api/complaints` | complaints |
| GET | `/api/complaints/:userId` | complaints |
| GET | `/api/complaints/stats/:userId` | complaints |
| GET | `/api/admin/complaints` | complaints, CitizenSignup |
| PUT | `/api/admin/complaints/:complaintId` | complaints |

---

## Database Connection Details

**Database Name:** `complaint_db`
**Host:** localhost
**Port:** 3306
**User:** root
**Password:** my_root_aksh_04

**Connection Pool:** 10 concurrent connections (mysql2/promise)

---

## Testing the Backend

### 1. Test Connection
```
GET http://localhost:5000/api/hello
```

### 2. Register New User
```
POST http://localhost:5000/api/auth/register/prepare
Body: { "email": "user@example.com" }
Response: { "demo_otp": "123456" }

POST http://localhost:5000/api/auth/register/verify
Body: {
  "email": "user@example.com",
  "otp": "123456",
  "firstName": "John",
  "lastName": "Doe",
  "password": "securepass",
  "city": "Chennai"
}
```

### 3. Login with Password
```
POST http://localhost:5000/api/auth/login/password
Body: {
  "email": "user@example.com",
  "password": "securepass"
}
```

### 4. Request Login OTP
```
POST http://localhost:5000/api/auth/login/request-otp
Body: { "email": "user@example.com" }
Response: { "demo_otp": "123456" }
```

### 5. Verify Login OTP
```
POST http://localhost:5000/api/auth/login/verify-otp
Body: {
  "email": "user@example.com",
  "otp": "123456"
}
```

### 6. Create Complaint
```
POST http://localhost:5000/api/complaints
Body: {
  "userId": 1,
  "category": "Road Damage",
  "title": "Pothole in Street",
  "description": "Large pothole on Main Street",
  "priority": "High",
  "city": "Chennai"
}
```

---

## Important Notes

✅ **Backend is now fully integrated with your existing tables**
✅ **All API endpoints are using CitizenSignup, citizen_otps, login_otps, and complaints tables**
✅ **Database connection tested and working**
✅ **Frontend API calls proxy to backend at http://localhost:5000**

**Next Steps:**
1. Install frontend dependencies: `npm install` (in project root)
2. Start frontend: `npm run dev` (in project root, new terminal)
3. Test the login/signup flow
4. Create complaints and verify data is stored in MySQL
