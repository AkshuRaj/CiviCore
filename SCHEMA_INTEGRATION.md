# Backend Integration - MySQL Workbench Schema ✅

## Status: UPDATED ✅

Your backend is now fully configured to use your exact MySQL Workbench table schemas.

---

## Table Structures (Exact from MySQL Workbench)

### 1. **CitizenSignup**
Complete user profile with all registration details.

```sql
CREATE TABLE CitizenSignup (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(50),
  last_name VARCHAR(50),
  dob DATE,
  gender VARCHAR(10),
  mobile VARCHAR(15),
  email VARCHAR(100) UNIQUE,
  password VARCHAR(255),
  country VARCHAR(50),
  state VARCHAR(50),
  district VARCHAR(50),
  city VARCHAR(50),
  pincode VARCHAR(6),
  address_line1 VARCHAR(255),
  address_line2 VARCHAR(255),
  gov_id_type VARCHAR(20),
  gov_id_last4 VARCHAR(4),
  alt_phone VARCHAR(15),
  language VARCHAR(20),
  notify_sms BOOLEAN,
  notify_email BOOLEAN,
  notify_whatsapp BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Key Fields:**
- `email` - Unique identifier for login
- `password` - User authentication
- `mobile` - Primary contact number
- `gov_id_type` - Government ID type (Aadhar, PAN, etc.)
- `gov_id_last4` - Last 4 digits of gov ID
- `language` - Preferred language (en, ta, hi, etc.)
- `notify_*` - Notification preferences

---

### 2. **citizen_otps**
Temporary storage for signup OTP and form data.

```sql
CREATE TABLE citizen_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  form_data LONGTEXT NOT NULL,
  expires_at DATETIME
);
```

**Key Fields:**
- `email` - Primary key (matches signup attempt)
- `otp` - 6-digit OTP code
- `form_data` - Complete signup form stored as JSON during verification
- `expires_at` - OTP expiration time (10 minutes)

**Usage Flow:**
1. User fills signup form → POST `/api/auth/register/prepare`
2. `form_data` stored in citizen_otps (JSON stringified)
3. User enters OTP → POST `/api/auth/register/verify`
4. Form data retrieved from citizen_otps
5. CitizenSignup record created with all fields
6. citizen_otps record deleted after verification

---

### 3. **login_otps**
Temporary storage for login OTP.

```sql
CREATE TABLE login_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  purpose ENUM('login','forgot'),
  expires_at DATETIME
);
```

**Key Fields:**
- `email` - Primary key
- `otp` - 6-digit OTP code
- `purpose` - Either 'login' or 'forgot' password
- `expires_at` - OTP expiration time (10 minutes)

**Usage Flow:**
1. User requests login OTP → POST `/api/auth/login/request-otp`
2. OTP inserted with purpose='login'
3. User enters OTP → POST `/api/auth/login/verify-otp`
4. OTP verified against database

---

### 4. **complaints**
All citizen complaints tracked and managed.

```sql
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50),
  city VARCHAR(100),
  status VARCHAR(50) DEFAULT 'Pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES CitizenSignup(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
);
```

**Key Fields:**
- `user_id` - Foreign key to CitizenSignup
- `category` - Complaint type (Road Damage, Water Supply, Corruption, etc.)
- `title` - Short complaint title
- `description` - Detailed description
- `priority` - Low/Medium/High
- `status` - Pending/In Progress/Resolved/Closed
- `created_at` - Submission timestamp
- `updated_at` - Last modification timestamp

---

### 5. **attachments**
File attachments/proofs for complaints.

```sql
CREATE TABLE attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  complaint_id INT NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500),
  file_type VARCHAR(50),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
  INDEX idx_complaint_id (complaint_id)
);
```

**Key Fields:**
- `complaint_id` - Foreign key to complaints
- `file_name` - Original filename
- `file_path` - Storage path on server
- `file_type` - MIME type (image/jpeg, image/png, application/pdf, etc.)
- `uploaded_at` - Upload timestamp

---

## API Endpoints Configuration

### Authentication Endpoints

#### 1. Register Prepare
```
POST /api/auth/register/prepare
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "formData": {
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-01-15",
    "gender": "Male",
    "mobile": "9876543210",
    "password": "SecurePass123",
    "country": "India",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600001",
    "address_line1": "123 Main St",
    "address_line2": "Apt 4B",
    "gov_id_type": "Aadhar",
    "gov_id_last4": "1234",
    "alt_phone": "9876543211",
    "language": "en",
    "notify_sms": true,
    "notify_email": true,
    "notify_whatsapp": false
  }
}

Response (Success):
{
  "success": true,
  "message": "OTP sent to email",
  "demo_otp": "123456"
}
```

**What Happens:**
- Checks if email already exists in CitizenSignup
- Stores complete form_data in citizen_otps as JSON
- Generates OTP valid for 10 minutes

---

#### 2. Register Verify
```
POST /api/auth/register/verify
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "message": "Registration successful",
  "userId": 1
}
```

**What Happens:**
- Verifies OTP against citizen_otps
- Retrieves form_data from citizen_otps
- Creates CitizenSignup record with all fields
- Deletes citizen_otps record

---

#### 3. Login with Password
```
POST /api/auth/login/password
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (Success):
{
  "success": true,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  },
  "token": "token_1"
}
```

**What Happens:**
- Queries CitizenSignup with email and password
- Returns user info if credentials match

---

#### 4. Login Request OTP
```
POST /api/auth/login/request-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com"
}

Response (Success):
{
  "success": true,
  "message": "OTP sent to your email",
  "demo_otp": "123456"
}
```

**What Happens:**
- Checks if user exists in CitizenSignup
- Inserts OTP into login_otps with purpose='login'
- OTP valid for 10 minutes

---

#### 5. Login Verify OTP
```
POST /api/auth/login/verify-otp
Content-Type: application/json

Request:
{
  "email": "user@example.com",
  "otp": "123456"
}

Response (Success):
{
  "success": true,
  "message": "OTP verified"
}
```

**What Happens:**
- Verifies OTP in login_otps
- Checks expiration time
- Returns success if valid

---

### Complaint Endpoints

#### 1. Create Complaint
```
POST /api/complaints
Content-Type: application/json

Request:
{
  "userId": 1,
  "category": "Road Damage",
  "title": "Large pothole on Main Street",
  "description": "There is a large pothole that is causing traffic hazards",
  "priority": "High",
  "city": "Chennai"
}

Response (Success):
{
  "success": true,
  "message": "Complaint created",
  "complaintId": 5
}
```

**What Happens:**
- Creates record in complaints table
- status defaults to 'Pending'
- created_at set to current timestamp

---

#### 2. Get User Complaints
```
GET /api/complaints/:userId
Example: GET /api/complaints/1

Response (Success):
{
  "success": true,
  "complaints": [
    {
      "id": 1,
      "user_id": 1,
      "category": "Road Damage",
      "title": "Pothole",
      "description": "...",
      "priority": "High",
      "city": "Chennai",
      "status": "In Progress",
      "created_at": "2026-02-03T10:30:00.000Z",
      "updated_at": "2026-02-03T11:45:00.000Z"
    }
  ]
}
```

---

#### 3. Get Complaint Stats
```
GET /api/complaints/stats/:userId
Example: GET /api/complaints/stats/1

Response (Success):
{
  "success": true,
  "stats": [
    { "status": "Pending", "count": 2 },
    { "status": "In Progress", "count": 1 },
    { "status": "Resolved", "count": 3 }
  ]
}
```

---

#### 4. Get All Complaints (Admin)
```
GET /api/admin/complaints

Response (Success):
{
  "success": true,
  "complaints": [
    {
      "id": 1,
      "user_id": 1,
      "category": "Road Damage",
      "title": "Pothole",
      "description": "...",
      "priority": "High",
      "city": "Chennai",
      "status": "In Progress",
      "created_at": "2026-02-03T10:30:00.000Z",
      "updated_at": "2026-02-03T11:45:00.000Z",
      "email": "user@example.com",
      "first_name": "John",
      "last_name": "Doe"
    }
  ]
}
```

---

#### 5. Update Complaint Status (Admin)
```
PUT /api/admin/complaints/:complaintId
Example: PUT /api/admin/complaints/5

Request:
{
  "status": "In Progress"
}

Response (Success):
{
  "success": true,
  "message": "Complaint status updated"
}
```

---

## Demo Credentials

```
Email: demo@example.com
Password: password123
OTP (for testing): 123456
```

---

## Backend Configuration

**Database:** complaint_db
**Host:** localhost
**Port:** 3306
**User:** root
**Password:** my_root_aksh_04
**Pool Size:** 10 connections

---

## Running the Backend

```powershell
# Terminal 1: Backend
cd D:\my-project\backend
npm run dev

# Terminal 2: Frontend
cd D:\my-project
npm run dev
```

**Backend Output Should Show:**
```
✅ Backend running on port 5000
Database connection pool created
✅ MySQL Database connected successfully!
```

---

## Data Flow

### User Registration:
```
Frontend Form → POST /api/auth/register/prepare
              → Generates OTP → citizen_otps table
              
User enters OTP → POST /api/auth/register/verify
              → Reads form_data from citizen_otps
              → Creates CitizenSignup record
              → Deletes citizen_otps record
              → Returns userId
```

### User Login (OTP):
```
Email entered → POST /api/auth/login/request-otp
             → Verifies user exists in CitizenSignup
             → Inserts OTP → login_otps table
             
OTP entered → POST /api/auth/login/verify-otp
           → Verifies OTP in login_otps
           → Returns success
```

### User Login (Password):
```
Email + Password → POST /api/auth/login/password
               → Queries CitizenSignup
               → Returns user info if match
```

### Complaint Creation:
```
Complaint Form → POST /api/complaints
              → Creates record → complaints table
              → Returns complaintId
```

---

## Important Notes

✅ All queries use snake_case column names (first_name, user_id, created_at, etc.)
✅ CitizenSignup stores complete user profile (22 columns)
✅ citizen_otps stores full form_data as LONGTEXT JSON
✅ login_otps has purpose field to distinguish login vs forgot password
✅ OTP expiration set to 10 minutes from creation
✅ All timestamps use TIMESTAMP DEFAULT CURRENT_TIMESTAMP
✅ Foreign keys properly cascade on delete

---

## Testing Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] Can request signup OTP
- [ ] Can verify signup OTP and create user
- [ ] Can login with password
- [ ] Can request login OTP
- [ ] Can verify login OTP
- [ ] Can create complaint
- [ ] Complaint appears in database
- [ ] Can view complaint status
- [ ] Admin can view all complaints
- [ ] Admin can update complaint status

---

## Success!

Your backend is now fully integrated with your MySQL Workbench schema. All API endpoints are configured to use the exact tables and columns you defined.
