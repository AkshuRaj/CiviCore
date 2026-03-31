# Online Complaint Management System (OCMS)

A comprehensive, production-ready web-based platform for registering, tracking, and resolving citizen complaints through intelligent multi-level hierarchy with real-time notifications and efficient workflow automation.

---

## Table of Contents

- [Project Overview](#-project-overview)
- [Available Versions](#-available-versions)
- [Quick Start](#-quick-start)
- [Architecture](#-architecture)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [User Roles & Workflow](#-user-roles--workflow)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)

---

## Project Overview

The **Online Complaint Management System (OCMS)** is a scalable solution designed to streamline civic complaint handling by:

- **Automated Routing**: Complaints automatically assigned through hierarchy (Head → Staff → Employee)
- **Multi-role Support**: Citizens, Heads, Staff, Employees, and Admins with distinct permissions
- **Real-time Tracking**: Live complaint status updates and analytics
- **Notification System**: Email & SMS alerts at each workflow stage
- **Admin Dashboard**: Comprehensive management of users, departments, categories, and more

---

## Available Versions

### **Version 1: Basic System** (`my-project/my-project`)
**Status:** Functional | **Best For:** Small-scale implementations

**Features:**
- Citizen registration & login (OTP-based)
- Complaint submission with attachments
- Basic workflow: Citizen → Head → Processing
- Staff management and registration
- Simple category-based complaint routing

**Location:** `d:\projj\my-project\my-project`

---

### **Version 2: Advanced System** (`neww/SOA`) ⭐ RECOMMENDED
**Status:** Production-ready | **Best For:** Enterprise-scale deployment

**Features:**
- All Version 1 features +
- **Advanced 4-level hierarchy**: Heads → Staff → Employees with auto-assignment
- **Department Management**: 16+ pre-configured departments
- **Service Types**: 10+ service categories (Repair, Maintenance, Installation, etc.)
- **Skills Mapping**: Match employees to complaint types
- **Priority Levels**: Urgent, High, Medium, Low with SLA tracking
- **Regional Heads**: Multi-location support
- **Admin Dashboard**: Full system configuration and monitoring
- **Location-based Routing**: Smart complaint assignment by area
- **Availability Tracking**: Real-time staff availability management
- **Secondary Admin System**: Hierarchical admin roles

**Location:** `d:\projj\neww\SOA`

---

## Quick Start

### For Version 1 (Basic)
```bash
cd d:\projj\my-project\my-project
npm install
cd backend
npm install
npm start
# In another terminal:
npm run dev
```

### For Version 2 (Advanced) ⭐ RECOMMENDED
```bash
cd d:\projj\neww\SOA
cd client
npm install
npm run dev
# In another terminal:
cd ..\server
npm install
npm start
```

**Access:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CITIZEN PORTAL                          │
│         (Submit Complaints & Track Status)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              COMPLAINT ROUTING ENGINE                       │
│  (Auto-assign → Head → Staff → Employee based on          │
│   location, department, and availability)                  │
└──────────┬──────────────────┬──────────────────┬────────────┘
           │                  │                  │
     ┌─────▼──┐         ┌─────▼──┐         ┌─────▼──┐
     │  HEAD   │         │ STAFF  │         │EMPLOYEE│
     │ REVIEW  │         │ASSIGN  │         │ RESOLVE │
     │ & ROUTE │         │ TASKS  │         │ ISSUE  │
     └────┬────┘         └────┬───┘         └────┬───┘
          │                   │                  │
          └───────────┬───────┴──────────────────┘
                      │
          ┌───────────▼─────────────┐
          │  NOTIFICATION ENGINE    │
          │  (Email/SMS/WhatsApp)   │
          └───────────┬─────────────┘
                      │
          ┌───────────▼─────────────┐
          │    COMPLAINT RESOLVED   │
          │    (Citizen Satisfied)  │
          └─────────────────────────┘
```

---

## Key Features

### For Citizens
- ✅ Self-registration with email/OTP verification
- ✅ Submit complaints with:
  - Category (16 departments)
  - Priority level
  - Detailed description
  - Photo/document attachments
  - Location pinpoint
- ✅ Real-time status tracking
- ✅ Complaint history and statistics
- ✅ Status notifications (Email, SMS, WhatsApp)
- ✅ View staff remarks and resolution details

### 🔗 For Heads (Department Authority)
- ✅ Dashboard with incoming complaints
- ✅ Review and categorize complaints
- ✅ Assign tasks to staff members
- ✅ Add remarks and guidance
- ✅ View staff workload and performance
- ✅ Generate reports by category/location

### 👷 For Staff (Middle Management)
- ✅ View assigned complaints
- ✅ Evaluate feasibility and priority
- ✅ Assign to specific field employees
- ✅ Track employee progress
- ✅ Communicate with field teams
- ✅ Update complaint status

### 🔧 For Employees (Field Workers)
- ✅ View assigned tasks
- ✅ Update complaint status (In Progress, Resolved)
- ✅ Add work notes and attachments
- ✅ Report completion with photos
- ✅ Receive real-time assignments
- ✅ View work schedule and availability

### 👨‍💼 For Admins
- ✅ Dashboard with system analytics
- ✅ User management (approve/reject registrations)
- ✅ Manage departments (add/edit/activate)
- ✅ Configure service types
- ✅ Set up skills and priorities
- ✅ Create complaint categories
- ✅ View system-wide reports
- ✅ Monitor all complaints across hierarchy

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19.2.0 | UI Framework |
| **Vite** | 7.2.5 | Build Tool (Lightning fast) |
| **React Router** | 7.10.1 | Client-side Routing |
| **Axios** | 1.13.2 | HTTP Client |
| **React Icons** | 5.6.0 | Icon Library |
| **React DatePicker** | 9.1.0 | Date Selection |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| **Express** | 5.2.1 | Web Framework |
| **MySQL** | 3.16.0 | Database Driver |
| **JWT** | 9.0.3 | Authentication |
| **bcryptjs** | 3.0.3 | Password Hashing |
| **Multer** | 2.0.2 | File Upload |
| **Nodemailer** | 7.0.12 | Email Service |
| **CORS** | 2.8.5 | Cross-Origin Support |

### Database
| Component | Details |
|-----------|---------|
| **DBMS** | MySQL 5.7+ |
| **Tables** | 11 interconnected tables |
| **Connection** | Connection Pool (10 max) |
| **Schema** | Fully normalized |

---

## 📋 Prerequisites

### System Requirements
```
OS:       Windows / Linux / macOS
RAM:      2GB minimum (4GB recommended)
Storage:  1GB for project files
Network:  Active internet (for notifications)
```

### Software Requirements
- **Node.js** v16+ and **npm** v8+
- **MySQL** 5.7+ (must be running)
- **Git** (optional, for cloning)
- **Git Bash** or PowerShell (Windows)

### Check Installation
```bash
# Verify Node.js
node --version    # Should be v16+
npm --version     # Should be v8+

# Verify MySQL
mysql --version   # Should be 5.7+
```

---

## 🔧 Installation & Setup

### Step 1: Clone Repository
```bash
# Navigate to desired location
cd d:\
git clone <repository-url> projj
cd projj
```

### Step 2: MySQL Database Setup

#### Create Database & User
```sql
-- Login to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE IF NOT EXISTS complaintt_system;

-- Create user (if needed)
CREATE USER 'root'@'localhost' IDENTIFIED BY 'my_root_aksh_04';
GRANT ALL PRIVILEGES ON complaintt_system.* TO 'root'@'localhost';
FLUSH PRIVILEGES;

-- Verify
USE complaintt_system;
SHOW TABLES;
```

#### Import Schema (Optional - Backend auto-creates)
```bash
cd neww\SOA\server
mysql -u root -p complaintt_system < database_updates.sql
```

### Step 3: Backend Setup

#### Version 1 (Basic)
```bash
cd my-project\my-project\backend
npm install
```

#### Version 2 (Advanced) ⭐
```bash
cd neww\SOA\server
npm install
```

### Step 4: Frontend Setup

#### Version 1 (Basic)
```bash
cd d:\projj\my-project\my-project
npm install
```

#### Version 2 (Advanced) ⭐
```bash
cd d:\projj\neww\SOA\client
npm install
```

### Step 5: Configure Environment

Create `.env` file in backend directory:

**For Version 1 (my-project\my-project)**
```env
# Already configured in backend/db.js
# Host: localhost
# User: root
# Password: my_root_aksh_04
# Database: complaintt_system
```

**For Version 2 (neww\SOA\server)**
```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=my_root_aksh_04
DB_NAME=complaint_db
JWT_SECRET=asbkceifehhw34wqjgfklrgtjdivjseewf

# Email Service (optional)
EMAIL_API_URL=http://10.109.34.189:5000/api/external/send
EMAIL_API_KEY=your_api_key

# SMS Service (optional)
VITE_SMS_API_URL=http://10.227.178.189:5000/api/send-sms
SMS_SENDER_ID=0000000000
```

---

## ▶️ Running the Project

### Option A: Version 1 (Basic System)

**Terminal 1 - Backend:**
```bash
cd d:\projj\my-project\my-project\backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd d:\projj\my-project\my-project
npm run dev
```

**Expected Output:**
```
✅ MySQL connected
Server running on port 5000

VITE v7.2.5 ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### Option B: Version 2 (Advanced System) ⭐ RECOMMENDED

**Terminal 1 - Backend:**
```bash
cd d:\projj\neww\SOA\server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd d:\projj\neww\SOA\client
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MySQL Database connected successfully!

VITE v7.2.4 ready in 234 ms
➜  Local:   http://localhost:5173/
```

---

## 📁 Project Structure

```
d:\projj\
│
├── my-project\                          # Version 1 (Basic)
│   └── my-project\
│       ├── backend\
│       │   ├── server.js                # Express server
│       │   ├── db.js                    # MySQL connection
│       │   ├── mailer.js                # Email service
│       │   ├── routes\
│       │   │   ├── staffRegistration.js
│       │   │   ├── complaints.js
│       │   │   └── categories.js
│       │   ├── uploads\                 # File attachments
│       │   └── package.json
│       │
│       ├── src\
│       │   ├── components\              # React components
│       │   ├── user\                    # Citizen pages
│       │   ├── staff\                   # Staff pages
│       │   ├── styles\                  # CSS files
│       │   └── utils\
│       │
│       ├── public\                      # Static assets
│       ├── .env                         # Environment config
│       ├── package.json
│       └── vite.config.js
│
├── neww\SOA\                            # Version 2 (Advanced) ⭐
│   ├── server\
│   │   ├── server.js                    # Main backend
│   │   ├── db.js                        # Database connection
│   │   ├── primaryadmin.js              # Admin routes
│   │   ├── utils\
│   │   │   └── mailer.js                # Email service
│   │   ├── migrations\                  # Database migrations
│   │   ├── uploads\
│   │   └── package.json
│   │
│   ├── client\
│   │   ├── src\
│   │   │   ├── components\              # Shared components
│   │   │   ├── head\                    # Head authority pages
│   │   │   ├── staff\                   # Staff pages
│   │   │   ├── employee\                # Employee pages
│   │   │   ├── PrimaryAdmin\            # Admin dashboard
│   │   │   ├── context\                 # React context (Auth)
│   │   │   └── styles\                  # Global styles
│   │   │
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── .env
│   ├── README.md
│   └── DOCUMENTATION_INDEX.md
│
└── README.md                            # This file (Master Documentation)
```

---

## 👥 User Roles & Workflow

### Registration & Access Levels

```
Level 0: CITIZEN (Public)
├── Self-register with email/OTP
├── Submit complaints anytime
└── Track status in real-time

Level 1: HEAD (Department Authority)
├── Approve/Reject registrations
├── Receive incoming complaints
├── Review and categorize
└── Assign to Staff

Level 2: STAFF (Middle Management)
├── Receive assignments from Head
├── Evaluate complaint feasibility
├── Assess priority and urgency
└── Assign to Field Employees

Level 3: EMPLOYEE (Field Worker)
├── Receive job assignments
├── Execute on-ground work
├── Update status with photos
└── Mark as resolved

Level 4: ADMIN (System Manager)
├── Manage all users
├── Configure system parameters
├── Approve higher-level registrations
└── Monitor analytics
```

### Complaint Lifecycle

```
1. SUBMITTED
   └─ Citizen registers complaint
      
2. ASSIGNED_TO_HEAD
   └─ Auto-assigned based on location + department
      
3. REVIEWED_BY_HEAD
   └─ Head reviews and validates
      
4. ASSIGNED_TO_STAFF
   └─ Head delegates to Staff member
      
5. ASSIGNED_TO_EMPLOYEE
   └─ Staff assigns to specific Employee
      
6. IN_PROGRESS
   └─ Employee executes work
      
7. RESOLVED
   └─ Marked as complete with remarks
      └─ Citizen receives notification
```

### Role Permissions Matrix

| Action | Citizen | Head | Staff | Employee | Admin |
|--------|:-------:|:----:|:-----:|:--------:|:-----:|
| Submit Complaint | ✅ | - | - | - | - |
| View Own Complaints | ✅ | - | - | - | - |
| Register | ✅ | ✅ | ✅ | ✅ | ✅ |
| View Queue | - | ✅ | ✅ | ✅ | ✅ |
| Review Complaint | - | ✅ | ✅ | ✅ | ✅ |
| Assign Task | - | ✅ | ✅ | - | ✅ |
| Update Status | - | - | - | ✅ | ✅ |
| Approve Registration | - | - | - | - | ✅ |
| Manage System | - | - | - | - | ✅ |

---

## 🔌 API Endpoints

### Authentication Endpoints
```
POST   /api/auth/register/prepare       → Request OTP for signup
POST   /api/auth/register/verify        → Verify OTP & create account
POST   /api/auth/login/password         → Direct login (email+password)
POST   /api/auth/login/request-otp      → Request OTP for login
POST   /api/auth/login/verify-otp       → Verify login OTP
```

### Complaint Management
```
POST   /api/complaints                  → Create new complaint
GET    /api/complaints/:userId          → Get user's complaints
GET    /api/complaints/stats/:userId    → Get statistics
GET    /api/admin/complaints            → Get all (admin only)
PUT    /api/admin/complaints/:id        → Update status
```

### User Registration (Authority)
```
POST   /staff/register                  → Register staff member
POST   /head/register                   → Register department head
POST   /employee/register               → Register field employee
```

### System Configuration (Admin)
```
GET    /api/departments                 → List departments
POST   /api/admin/departments           → Create department
GET    /api/categories                  → List complaint categories
GET    /api/admin/service-types         → List service types
GET    /api/admin/skills                → List available skills
GET    /api/admin/priorities            → List priority levels
```

---

## 🗄️ Database Schema

### Core Tables

**CitizenSignup (22 columns)**
```sql
id, first_name, last_name, email, password, mobile, dob, gender
address_line1, address_line2, city, district, state, country, pincode
gov_id_type, gov_id_last4, alt_phone, language
notify_sms, notify_email, notify_whatsapp
created_at
```

**complaints (Main Tracking)**
```sql
id, user_id (FK→CitizenSignup), category_id (FK→categories)
head_id (FK→heads), staff_id (FK→staff), employee_id (FK→employees)
title, description, priority, status
country, state, city, location, address
created_at, updated_at, resolved_at
```

**Authority Hierarchy**
```
heads          → Department-level authority
staff          → Middle management
employees      → Field workers
staff_availability → Real-time tracking
```

**Configuration Tables**
```
departments         → 16 pre-configured departments
service_types       → 10 service categories
skills              → Job skills mapping
priorities          → Priority levels (Urgent→Low)
categories          → Complaint categories
```

**OTP & Authentication**
```
citizen_otps        → Signup verification
login_otps          → Login verification
staff_otps          → Staff authentication
head_otps           → Head authentication
```

---

## ⚙️ Configuration

### Database Connection
**File:** `backend/db.js` or `server/db.js`

```javascript
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "my_root_aksh_04",
  database: "complaintt_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

### Environment Variables
**File:** `.env` in server directory

```env
# Server
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=my_root_aksh_04
DB_NAME=complaint_db

# JWT Authentication
JWT_SECRET=your_secret_key_here

# Email Service (optional)
EMAIL_API_URL=http://10.109.34.189:5000/api/external/send
EMAIL_API_KEY=your_api_key

# SMS Service (optional)
VITE_SMS_API_URL=http://10.227.178.189:5000/api/send-sms
SMS_SENDER_ID=your_sender_id
```

### Email Configuration
**File:** `backend/mailer.js`

Supports:
- Custom email templates
- OTP delivery
- Status notifications
- Bulk messaging

### File Upload Configuration
**File:** `backend/multer.config` or `server.js`

```javascript
Destination: ./uploads/
Max File Size: 10MB
Allowed Types: .jpg, .png, .pdf, .doc, .docx
```

---

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `Access denied for user 'root'@'localhost'`
```bash
# Solution 1: Verify MySQL is running
mysql -u root -p

# Solution 2: Check credentials in db.js
# User: root
# Password: my_root_aksh_04
# Database: complaintt_system
```

**Error:** `Database 'complaintt_system' doesn't exist`
```sql
-- Create database
CREATE DATABASE complaintt_system;
USE complaintt_system;
SHOW TABLES;
```

---

### Backend Won't Start

**Error:** `Cannot find module 'express'`
```bash
cd backend  # or server
npm install
npm start
```

**Error:** `Address already in use :::5000`
```bash
# Kill process on port 5000
# Windows:
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :5000
kill -9 <PID>
```

---

### Frontend Issues

**Error:** `Failed to connect to backend`
```
1. Verify backend is running (http://localhost:5000)
2. Check CORS settings in backend
3. Verify firewall allows port 5000
4. Check browser console for exact error
```

**Error:** `Module not found`
```bash
cd client  # or frontend directory
npm install
npm run dev
```

---

### Email/SMS Not Sending

**Solution:**
1. Verify API endpoints in `.env`
2. Test APIs manually with curl
3. Check internet connection
4. Verify API credentials are correct
5. Check backend logs for errors

---

## 📊 Performance Metrics

### Expected Performance
- **Page Load Time:** < 2 seconds
- **API Response:** < 500ms
- **Database Queries:** < 100ms
- **Concurrent Users:** 100+ (with proper scaling)

### Optimization Tips
- Enable query caching
- Use connection pooling (already configured)
- Implement pagination for large datasets
- Add database indexes for frequently queried columns

---

## 🔐 Security Features

### Implemented
- ✅ Password hashing (bcryptjs)
- ✅ JWT token authentication
- ✅ OTP verification (6-digit, 10min expiry)
- ✅ CORS protection
- ✅ SQL injection prevention
- ✅ File upload validation

### Recommendations for Production
- [ ] Use HTTPS/SSL certificates
- [ ] Implement rate limiting
- [ ] Add API request signing
- [ ] Enable database backups
- [ ] Use environment-specific secrets
- [ ] Implement audit logging
- [ ] Add two-factor authentication

---

## 🚀 Deployment

### Recommended Stack
- **Frontend:** Vercel, Netlify, or AWS S3 + CloudFront
- **Backend:** AWS EC2, Heroku, or DigitalOcean
- **Database:** AWS RDS, Google Cloud SQL, or managed MySQL
- **File Storage:** AWS S3 or Google Cloud Storage

### Pre-deployment Checklist
- [ ] Update environment variables
- [ ] Enable HTTPS/SSL
- [ ] Configure database backups
- [ ] Set up monitoring & logging
- [ ] Run performance tests
- [ ] Security audit complete
- [ ] User documentation ready
- [ ] Support team trained

---

## 📞 Support & Documentation

### Additional Resources
- [Version 1 Docs](./my-project/my-project/README.md)
- [Version 2 Docs](./neww/SOA/README.md)
- [API Documentation](./neww/SOA/QUICK_REFERENCE_GUIDE.md)
- [Database Schema](./neww/SOA/DATABASE_SCHEMA_DETAILED.md)

### Common Issues & Solutions
See **Troubleshooting** section above

### Contact Support
For issues or questions:
1. Check error logs in terminal
2. Review API response in browser DevTools
3. Check database connectivity
4. Test with curl or Postman

---

## 📝 License & Credits

**Project:** Online Complaint Management System (OCMS)
**Version:** 2.0 (SOA Architecture)
**Status:** ✅ Production Ready
**License:** Educational & Demonstration
**Author:** Development Team

---

## 🎯 Quick Reference

### Start Quick (Version 2 - Advanced) ⭐
```bash
# Terminal 1 - Backend
cd d:\projj\neww\SOA\server
npm install && npm start

# Terminal 2 - Frontend
cd d:\projj\neww\SOA\client
npm install && npm run dev

# Access: http://localhost:5173
```

### Database
```
Host: localhost
User: root
Pass: my_root_aksh_04
DB: complaintt_system
Port: 3306
```

### Ports
```
Frontend: 5173
Backend: 5000
MySQL: 3306
```

### Test Accounts
```
Admin:  admin@complaint.com (password: admin123)
Head:   head@example.com (register first)
Staff:  staff@example.com (register first)
Citizen: Any email (self-register)
```

---

**🎉 Happy Coding! Get started with Version 2 (Advanced System) for the best experience.**

