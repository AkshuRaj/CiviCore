# 🎯 Online Complaint Management System

A comprehensive web-based platform for registering, tracking, and resolving citizen complaints through a structured multi-level hierarchy with real-time notifications and efficient workflow automation.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Running the Project](#-running-the-project)
- [Project Structure](#-project-structure)
- [User Roles & Workflow](#-user-roles--workflow)
- [API Endpoints](#-api-endpoints)
- [Database Schema](#-database-schema)
- [Configuration](#-configuration)
- [Troubleshooting](#-troubleshooting)

---

## 📌 Overview

The **Online Complaint Management System (OCMS)** streamlines civic complaint handling through:

- **Citizen Portal**: Submit and track complaints with attachments
- **Multi-level Approval**: Head → Staff → Employee hierarchy
- **Smart Auto-assignment**: Location and department-based routing
- **Real-time Notifications**: Email & SMS updates at each stage
- **Admin Dashboard**: Manage users, departments, categories, and service types

---

## ✨ Key Features

### Citizen Features
- ✅ User registration with OTP verification
- ✅ Submit complaints with title, description, category, and attachments
- ✅ Real-time complaint status tracking
- ✅ View complaint history and statistics
- ✅ Receive status updates via email/SMS/WhatsApp

### Authority Features
- ✅ **Head**: Receive incoming complaints, review, assign to staff
- ✅ **Staff**: Evaluate complaints, assign to field employees
- ✅ **Employee**: Update complaint status, add remarks, mark as resolved

### Admin Features
- ✅ Manage departments and service categories
- ✅ Configure skills and priority levels
- ✅ Approve head and staff registrations
- ✅ View system-wide analytics and reports
- ✅ User and role management

---

## 🛠 Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **Vite 7.2.5** - Build tool (fast dev server)
- **React Router 7.10** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **React Icons 5.6.0** - Icon library

### Backend
- **Node.js** - Runtime
- **Express.js 5.2.1** - Web framework
- **MySQL 3.16.0** - Database
- **JWT 9.0.3** - Authentication
- **bcryptjs 3.0.3** - Password hashing
- **Multer 2.0.2** - File uploads
- **Nodemailer 7.0.12** - Email service

### Database
- **MySQL** - Relational database
- **Unified Schema**: 11 interconnected tables

---

## 📦 Prerequisites

### Required
- **Node.js** v16+ and npm v8+
- **MySQL** 5.7+
- **Git** (optional, for version control)

### System Requirements
- **RAM**: 2GB minimum
- **Storage**: 1GB for project files
- **Network**: Active internet (for email/SMS services)

---

## 🚀 Installation

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd my-project
```

### Step 2: Install Backend Dependencies
```bash
cd backend
npm install
```

### Step 3: Install Frontend Dependencies
```bash
cd ..
npm install
```

### Step 4: Configure Environment Variables
Create `.env` file in project root:
```env
# Backend
VITE_LOCATION_API_BASE=http://127.0.0.1:8000/api/v1
EMAIL_API_URL=http://10.109.34.189:5000/api/external/send
EMAIL_API_KEY=sk_24aa5a3203bdca35795a41dd0ab11a98
VITE_SMS_API_URL=http://10.227.178.189:5000/api/send-sms
SMS_SENDER_ID=0000000000
JWT_SECRET=asbkceifehhw34wqjgfklrgtjdivjseewf
```

### Step 5: Verify Database Setup
Ensure MySQL is running and contains `complaintt_system` database with proper credentials:
```
Host: localhost
User: root
Password: my_root_aksh_04
Database: complaintt_system
```

---

## 🏃 Running the Project

### Start Backend Server (Terminal 1)
```bash
cd backend
npm start
```
**Expected Output:**
```
✅ MySQL Database connected successfully!
Server running on port 5000
```

### Start Frontend Development Server (Terminal 2)
```bash
npm run dev
```
**Expected Output:**
```
  VITE v7.2.5  ready in xxx ms
  ➜  Local:   http://localhost:5173/
```

### Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Admin Panel**: http://localhost:5173/adminlogin

---

## 📁 Project Structure

```
my-project/
├── backend/
│   ├── server.js              # Main backend entry point
│   ├── db.js                  # Database connection pool
│   ├── mailer.js              # Email service
│   ├── smsService.js          # SMS service
│   ├── routes/
│   │   ├── staffRegistration.js
│   │   ├── complaints.js
│   │   └── categories.js
│   ├── uploads/               # File storage for attachments
│   └── package.json
│
├── src/
│   ├── App.jsx                # Main app component
│   ├── main.jsx               # React entry point
│   ├── components/            # Reusable components
│   │   ├── Home.jsx
│   │   ├── Login/
│   │   ├── Signup/
│   │   └── profile/
│   ├── context/               # React context
│   │   ├── AuthContext.jsx
│   │   └── LanguageContext.jsx
│   ├── user/                  # Citizen pages
│   ├── head/                  # Head authority pages
│   ├── staff/                 # Staff pages
│   ├── employee/              # Employee pages
│   ├── PrimaryAdmin/          # Admin pages
│   ├── styles/                # CSS files
│   └── utils/
│       ├── apiClient.js
│       ├── constants.js
│       └── i18n.js
│
├── public/                    # Static assets
├── .env                       # Environment variables
├── package.json               # Frontend dependencies
├── vite.config.js            # Vite configuration
└── README.md                 # This file
```

---

## 👥 User Roles & Workflow

### Registration Hierarchy
```
Citizen (Self-register) → Head (Approve) → Staff (Assign) → Employee (Execute)
```

### Complaint Lifecycle
```
1. SUBMITTED (Citizen submits)
    ↓
2. ASSIGNED_TO_HEAD (Auto-assigned)
    ↓
3. REVIEWED_BY_HEAD (Head reviews)
    ↓
4. ASSIGNED_TO_STAFF (Head assigns)
    ↓
5. ASSIGNED_TO_EMPLOYEE (Staff assigns)
    ↓
6. IN_PROGRESS (Employee working)
    ↓
7. RESOLVED (Completed)
```

### Role Permissions
| Action | Citizen | Head | Staff | Employee | Admin |
|--------|---------|------|-------|----------|-------|
| Submit Complaint | ✅ | - | - | - | - |
| View Complaints | ✅ | ✅ | ✅ | ✅ | ✅ |
| Review Complaint | - | ✅ | ✅ | ✅ | ✅ |
| Assign Task | - | ✅ | ✅ | - | ✅ |
| Update Status | - | - | - | ✅ | ✅ |
| Manage Users | - | - | - | - | ✅ |

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register/prepare      - Request signup OTP
POST   /api/auth/register/verify       - Verify OTP & create account
POST   /api/auth/login/password        - Login with email/password
POST   /api/auth/login/request-otp     - Request login OTP
POST   /api/auth/login/verify-otp      - Verify login OTP
```

### Complaints
```
POST   /api/complaints                 - Create new complaint
GET    /api/complaints/:userId         - Get user's complaints
GET    /api/complaints/stats/:userId   - Get complaint statistics
GET    /api/admin/complaints           - Get all complaints (admin)
PUT    /api/admin/complaints/:id       - Update complaint status
```

### Staff Management
```
POST   /staff/register                 - Register staff member
POST   /head/register                  - Register head authority
POST   /employee/register              - Register field employee
GET    /api/departments                - Get all departments
GET    /api/categories                 - Get complaint categories
```

---

## 🗄️ Database Schema

### Core Tables

**CitizenSignup** (Users)
```sql
- id (PK)
- first_name, last_name, email, password
- mobile, dob, gender, country, state, city
- address_line1, address_line2, pincode
- gov_id_type, gov_id_last4, alt_phone
- language, notify_sms, notify_email, notify_whatsapp
- created_at
```

**complaints** (Main tracking table)
```sql
- id (PK)
- user_id (FK) → CitizenSignup
- head_id (FK) → heads
- staff_id (FK) → staff
- employee_id (FK) → employees
- category, title, description, priority, status
- country, state, city, location, address
- created_at, updated_at, resolved_at
```

**heads, staff, employees** (Authority hierarchy)
```sql
- Stores user info: name, email, password, phone, department
- department, location, address
- status (ACTIVE, INACTIVE, ON_LEAVE)
```

**OTP Tables** (Authentication)
```sql
- citizen_otps: email (PK), otp, form_data, expires_at
- login_otps: email (PK), otp, purpose, expires_at
- staff_otps, head_otps: Similar structure
```

---

## ⚙️ Configuration

### Environment Variables (.env)
```env
# Database (no .env needed - hardcoded for now)
# User: root
# Password: my_root_aksh_04
# Database: complaintt_system

# Email Service
EMAIL_API_URL=http://10.109.34.189:5000/api/external/send
EMAIL_API_KEY=your_api_key_here

# SMS Service  
VITE_SMS_API_URL=http://10.227.178.189:5000/api/send-sms
SMS_SENDER_ID=your_sender_id

# JWT
JWT_SECRET=your_secret_key_here
```

### Database Connection
Backend: `db.js`
```javascript
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "my_root_aksh_04",
  database: "complaintt_system",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
```

---

## 🐛 Troubleshooting

### Issue: Database Connection Failed
```
Error: Access denied for user 'root'@'localhost'
```
**Solution:**
- Verify MySQL is running: `mysql -u root -p`
- Check credentials in `backend/db.js`
- Ensure `complaintt_system` database exists

### Issue: Backend won't start
```
Error: Cannot find module 'express'
```
**Solution:**
```bash
cd backend
npm install
npm start
```

### Issue: Frontend can't reach backend
```
Network Error: Failed to fetch from http://localhost:5000
```
**Solution:**
- Ensure backend is running on port 5000
- Check firewall settings
- Verify API URL in frontend config

### Issue: Emails/SMS not sending
**Solution:**
- Test API endpoints in `.env` file
- Verify credentials with third-party service
- Check internet connection

---

## 📝 License

This project is for educational and demonstration purposes.

---

## 👨‍💻 Support

For issues or questions:
1. Check error logs in terminal
2. Review `backend/server.js` for API errors
3. Inspect browser console for frontend errors

---

**Happy coding! 🚀**
