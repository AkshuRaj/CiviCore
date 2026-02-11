# MySQL Tables - Exact SQL

These are the exact table definitions your backend is configured to use. You can verify these match what you have in MySQL Workbench.

---

## 1. CitizenSignup Table

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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);
```

**Fields (22 total):**
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT PRIMARY KEY | User ID |
| first_name | VARCHAR(50) | User's first name |
| last_name | VARCHAR(50) | User's last name |
| dob | DATE | Date of birth |
| gender | VARCHAR(10) | Male/Female/Other |
| mobile | VARCHAR(15) | Primary contact |
| email | VARCHAR(100) UNIQUE | Login email |
| password | VARCHAR(255) | Hashed password |
| country | VARCHAR(50) | Country of residence |
| state | VARCHAR(50) | State/Province |
| district | VARCHAR(50) | District |
| city | VARCHAR(50) | City |
| pincode | VARCHAR(6) | Postal code |
| address_line1 | VARCHAR(255) | Address line 1 |
| address_line2 | VARCHAR(255) | Address line 2 (optional) |
| gov_id_type | VARCHAR(20) | Aadhar/PAN/DL/Passport |
| gov_id_last4 | VARCHAR(4) | Last 4 digits of ID |
| alt_phone | VARCHAR(15) | Alternate phone |
| language | VARCHAR(20) | Preferred language (en/ta/hi) |
| notify_sms | BOOLEAN | SMS notification preference |
| notify_email | BOOLEAN | Email notification preference |
| notify_whatsapp | BOOLEAN | WhatsApp notification preference |
| created_at | TIMESTAMP | Account creation time |

---

## 2. citizen_otps Table

```sql
CREATE TABLE citizen_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  form_data LONGTEXT NOT NULL,
  expires_at DATETIME
);
```

**Fields (4 total):**
| Field | Type | Notes |
|-------|------|-------|
| email | VARCHAR(100) PRIMARY KEY | Signup email (unique) |
| otp | VARCHAR(6) | 6-digit OTP code |
| form_data | LONGTEXT | Complete signup form as JSON |
| expires_at | DATETIME | OTP expiration time (10 min) |

**Purpose:**
- Stores temporary signup data during registration process
- `form_data` contains full signup form as JSON string
- Deleted after successful registration
- OTP expires in 10 minutes

---

## 3. login_otps Table

```sql
CREATE TABLE login_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  purpose ENUM('login','forgot'),
  expires_at DATETIME
);
```

**Fields (4 total):**
| Field | Type | Notes |
|-------|------|-------|
| email | VARCHAR(100) PRIMARY KEY | User's email |
| otp | VARCHAR(6) | 6-digit OTP code |
| purpose | ENUM('login','forgot') | 'login' or 'forgot_password' |
| expires_at | DATETIME | OTP expiration time (10 min) |

**Purpose:**
- Stores temporary login/forgot password OTP
- `purpose` field distinguishes between login and password reset
- Deleted after successful verification
- OTP expires in 10 minutes

---

## 4. complaints Table

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

**Fields (10 total):**
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Complaint ID |
| user_id | INT NOT NULL | Foreign key to CitizenSignup |
| category | VARCHAR(100) | Complaint type |
| title | VARCHAR(255) | Short title |
| description | TEXT | Detailed description |
| priority | VARCHAR(50) | Low/Medium/High |
| city | VARCHAR(100) | Location |
| status | VARCHAR(50) | Pending/In Progress/Resolved |
| created_at | TIMESTAMP | Submission time |
| updated_at | TIMESTAMP | Last update time |

**Indexes:**
- Foreign Key: user_id → CitizenSignup.id (CASCADE DELETE)
- Index: idx_user_id (for fast lookups by user)
- Index: idx_status (for status-based filtering)

---

## 5. attachments Table

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

**Fields (6 total):**
| Field | Type | Notes |
|-------|------|-------|
| id | INT AUTO_INCREMENT PRIMARY KEY | Attachment ID |
| complaint_id | INT NOT NULL | Foreign key to complaints |
| file_name | VARCHAR(255) | Original filename |
| file_path | VARCHAR(500) | Storage path |
| file_type | VARCHAR(50) | MIME type |
| uploaded_at | TIMESTAMP | Upload time |

**Indexes:**
- Foreign Key: complaint_id → complaints.id (CASCADE DELETE)
- Index: idx_complaint_id (for fast lookups by complaint)

---

## Quick Verification SQL

Run these queries to verify your tables are set up correctly:

```sql
-- Check CitizenSignup table
DESCRIBE CitizenSignup;
SHOW INDEX FROM CitizenSignup;

-- Check citizen_otps table
DESCRIBE citizen_otps;

-- Check login_otps table
DESCRIBE login_otps;

-- Check complaints table
DESCRIBE complaints;
SHOW INDEX FROM complaints;
SHOW CREATE TABLE complaints\G

-- Check attachments table
DESCRIBE attachments;
SHOW INDEX FROM attachments;

-- Count records
SELECT COUNT(*) FROM CitizenSignup;
SELECT COUNT(*) FROM citizen_otps;
SELECT COUNT(*) FROM login_otps;
SELECT COUNT(*) FROM complaints;
SELECT COUNT(*) FROM attachments;
```

---

## Sample Data Query

```sql
-- View sample user
SELECT * FROM CitizenSignup WHERE email = 'demo@example.com';

-- View user's complaints
SELECT c.* FROM complaints c
JOIN CitizenSignup u ON c.user_id = u.id
WHERE u.email = 'demo@example.com'
ORDER BY c.created_at DESC;

-- View complaint with attachments
SELECT c.*, a.file_name, a.file_type
FROM complaints c
LEFT JOIN attachments a ON c.id = a.complaint_id
WHERE c.id = 1;

-- View all pending complaints with user info
SELECT 
  c.id,
  c.title,
  c.category,
  c.priority,
  u.email,
  u.first_name,
  u.last_name,
  c.created_at
FROM complaints c
JOIN CitizenSignup u ON c.user_id = u.id
WHERE c.status = 'Pending'
ORDER BY c.created_at DESC;
```

---

## Data Flow Example

### User Signup Flow
```
1. User submits form via Frontend
   ↓
2. POST /api/auth/register/prepare
   → Checks if email exists in CitizenSignup
   → Generates OTP
   → Stores entire form as JSON in citizen_otps.form_data
   → Returns OTP (demo: 123456)
   ↓
3. User enters OTP
   ↓
4. POST /api/auth/register/verify
   → Retrieves form_data from citizen_otps
   → Parses JSON back to object
   → Inserts all fields into CitizenSignup
   → Deletes citizen_otps record
   → Returns userId
```

### Stored Data After Registration
**citizen_otps:** (deleted)
```
Empty - record removed after verification
```

**CitizenSignup:** (new record created)
```
id: 1
first_name: John
last_name: Doe
dob: 1990-05-15
gender: Male
mobile: 9876543210
email: john@example.com
password: SecurePass@123
country: India
state: Tamil Nadu
district: Chennai
city: Chennai
pincode: 600001
address_line1: 123 Main St
address_line2: Apt 4B
gov_id_type: Aadhar
gov_id_last4: 1234
alt_phone: 9876543211
language: en
notify_sms: 1
notify_email: 1
notify_whatsapp: 0
created_at: 2026-02-03 10:30:45
```

---

## Backend Configuration

The backend in `backend/db.js` connects using:
```javascript
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'my_root_aksh_04',
  database: 'complaint_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

**To change credentials:** Edit `backend/db.js` lines 3-4

---

## Validation Rules

### CitizenSignup
- email: UNIQUE, required for login
- password: Required, stored as plain text (should be hashed in production)
- mobile: Required, 10 digits for India

### citizen_otps
- OTP expires in 10 minutes
- Automatically deletes after successful registration

### login_otps
- OTP expires in 10 minutes
- Can be reused for multiple failed attempts

### complaints
- user_id: Must exist in CitizenSignup
- status: One of Pending, In Progress, Resolved, Closed
- Cascading delete: Deleting user deletes all their complaints

### attachments
- complaint_id: Must exist in complaints
- Cascading delete: Deleting complaint deletes all attachments

---

## Performance Considerations

**Indexes present:**
- CitizenSignup.email (UNIQUE for fast lookups)
- complaints.user_id (for filtering by user)
- complaints.status (for status-based queries)
- attachments.complaint_id (for fast lookups)

**Recommended indexes for production:**
```sql
-- Speed up email searches in both OTP tables
ALTER TABLE citizen_otps ADD INDEX idx_email (email);
ALTER TABLE login_otps ADD INDEX idx_email (email);

-- Speed up date range queries
ALTER TABLE complaints ADD INDEX idx_created_at (created_at);

-- Combined index for common queries
ALTER TABLE complaints ADD INDEX idx_user_status (user_id, status);
```

---

## Backup & Recovery

### Backup tables
```bash
# Backup entire database
mysqldump -u root -p complaint_db > backup.sql

# Restore
mysql -u root -p complaint_db < backup.sql
```

### Export user data
```sql
SELECT * FROM CitizenSignup
INTO OUTFILE '/tmp/citizens.csv'
FIELDS TERMINATED BY ','
LINES TERMINATED BY '\n';
```

---

## All Set!

Your MySQL tables are correctly configured and your backend is using them. The database is ready for:
- ✅ User registration (signup with OTP)
- ✅ User login (password or OTP)
- ✅ Complaint creation and tracking
- ✅ File attachments
- ✅ Admin complaint management
