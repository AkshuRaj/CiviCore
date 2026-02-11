# Backend Database & API Integration Guide

## ✅ Current Setup

### Database Connection
- **Database**: `complaint_db` (MySQL)
- **User**: `root`
- **Password**: `my_root_aksh_04` (configured in `backend/db.js`)
- **Host**: `localhost`
- **Port**: `3306` (default MySQL)

### Tables Created
1. **users** - Stores user account information
   - email, firstName, lastName, password, phone, city, state, country
   
2. **complaints** - Stores complaint submissions
   - userId, category, title, description, priority, city, status
   
3. **attachments** - Stores proof documents/images
   - complaintId, fileName, filePath, fileType

## 🔗 Frontend-Backend Integration

### Authentication Endpoints
- `POST /api/auth/login/password` - Login with email & password
- `POST /api/auth/login/request-otp` - Request OTP for login
- `POST /api/auth/login/verify-otp` - Verify OTP and login
- `POST /api/auth/register/prepare` - Prepare registration (validate email)
- `POST /api/auth/register/verify` - Complete registration with OTP

### Complaint Endpoints
- `POST /api/complaints` - Submit a new complaint
- `GET /api/complaints` - Get all complaints or filter by userId
- `GET /api/complaints/stats` - Get stats (total, pending, resolved)

## 📋 How It Works

### 1. User Registration
```
Frontend → Signup Page → /api/auth/register/prepare (send OTP)
         → Verify OTP → /api/auth/register/verify (create user)
         → Users table gets new entry
```

### 2. User Login
```
Frontend → Login Page → /api/auth/login/password or request-otp
         → Verify credentials in users table
         → Return user data + token
```

### 3. Submit Complaint
```
Frontend → ComplaintForm → /api/complaints (POST)
         → Complaint saved to complaints table
         → Link to userId for tracking
```

### 4. View Complaints
```
Frontend → ViewStatus/MyComplaints → /api/complaints?userId=X
         → Query complaints table filtered by userId
         → Display list on dashboard
```

## 🚀 How to Run

### 1. Initialize Database (First Time Only)
```powershell
cd backend
npm install
node setup.js
```

### 2. Start Backend Server
```powershell
cd backend
npm run dev
```

### 3. Start Frontend (in another terminal)
```powershell
cd D:\my-project
npm run dev
```

## ✨ Features Connected

✅ **Authentication**
- Login/Register with email & password
- OTP verification for login/signup
- User data stored in MySQL

✅ **Complaint Management**
- Submit complaints with category, description, priority
- Track complaint status (Registered, In Progress, Resolved)
- View complaint stats (total, pending, closed)
- Filter complaints by user

✅ **User Dashboard**
- Shows user's complaint statistics
- Displays pending and resolved complaints count
- Real-time data from MySQL

## 🔧 Customization

### To Change Database Credentials
Edit `backend/db.js`:
```javascript
const pool = mysql.createPool({
  host: "localhost",
  user: "root",           // ← Change username
  password: "my_root_aksh_04", // ← Change password
  database: "complaint_db", // ← Change database name
  ...
});
```

### To Change Database Name
1. Edit `backend/db.js` - change `database` field
2. Edit `backend/setup.js` - change `CREATE DATABASE` line
3. Run `node setup.js` again

## 🐛 Troubleshooting

### "Cannot find module 'mysql2'"
```
cd backend
npm install mysql2
```

### "Access denied for user 'root'"
- Check MySQL is running
- Verify password in `backend/db.js`
- Make sure MySQL is on port 3306

### "Database 'complaint_db' doesn't exist"
```
cd backend
node setup.js
```

### Frontend can't reach backend
- Check backend is running on port 5000
- Check `vite.config.js` proxy settings
- Verify CORS is enabled (it is by default)

## 📊 Example API Calls

### Register User
```bash
POST http://localhost:5000/api/auth/register/verify
{
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "password": "pass123",
  "otp": "123456"
}
```

### Submit Complaint
```bash
POST http://localhost:5000/api/complaints
{
  "userId": 1,
  "category": "Electricity",
  "title": "Power outage",
  "description": "No electricity since morning",
  "priority": "High",
  "city": "Mumbai"
}
```

### Get User Stats
```bash
GET http://localhost:5000/api/complaints/stats?userId=1
```

## ✅ Verification Checklist

- [ ] MySQL is running locally
- [ ] Database credentials match in `backend/db.js`
- [ ] Ran `node setup.js` to create tables
- [ ] Backend started with `npm run dev`
- [ ] Frontend started with `npm run dev`
- [ ] Can access http://localhost:5000 (shows "Backend running 🚀")
- [ ] Frontend at http://localhost:5173 (or assigned port) loads
- [ ] Can see network requests in browser DevTools → Network tab

All set! Your project is now fully connected to MySQL database. 🎉
