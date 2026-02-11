# Quick Reference: Column Name Changes

## Updated Backend to Match Your Schema

### Column Name Mappings

| Field | Old (Generic) | New (Your Schema) | Type |
|-------|---------------|-------------------|------|
| User First Name | firstName | first_name | VARCHAR(50) |
| User Last Name | lastName | last_name | VARCHAR(50) |
| User Mobile | phone | mobile | VARCHAR(15) |
| Birth Date | - | dob | DATE |
| Gender | - | gender | VARCHAR(10) |
| Password Hash | password | password | VARCHAR(255) |
| Address Fields | - | address_line1, address_line2 | VARCHAR(255) |
| ID Type | - | gov_id_type | VARCHAR(20) |
| ID Last 4 | - | gov_id_last4 | VARCHAR(4) |
| Alt Phone | - | alt_phone | VARCHAR(15) |
| Language Pref | - | language | VARCHAR(20) |
| SMS Notify | - | notify_sms | BOOLEAN |
| Email Notify | - | notify_email | BOOLEAN |
| WhatsApp Notify | - | notify_whatsapp | BOOLEAN |
| Complaint User ID | userId | user_id | INT (FK) |
| Complaint File | - | complaint_id | INT (FK) |
| File Name | fileName | file_name | VARCHAR(255) |
| File Path | filePath | file_path | VARCHAR(500) |
| File Type | fileType | file_type | VARCHAR(50) |
| Timestamps | createdAt, updatedAt | created_at, updated_at | TIMESTAMP |

---

## Files Updated

### 1. **backend/server.js**
- Updated login endpoint to query CitizenSignup with `first_name`, `last_name`
- Updated registration to store form_data in citizen_otps as LONGTEXT JSON
- Updated register verify to extract form_data and insert all 21 fields into CitizenSignup
- Updated complaint queries to use `user_id`, `created_at`, `updated_at`
- Added expires_at validation for OTP checks
- Added purpose field handling for login_otps

### 2. **backend/setup.js**
- Created exact CitizenSignup table with all 22 columns (id + 21 fields)
- Created citizen_otps with form_data LONGTEXT and expires_at
- Created login_otps with purpose ENUM
- Updated complaints with user_id FK and proper timestamp columns
- Updated attachments with complaint_id FK
- All table structures match your MySQL Workbench schema

---

## Key Changes in API Behavior

### Register Prepare
**Before:** Just checked if email exists
**After:** Checks if email exists + stores complete form_data in citizen_otps

```javascript
// New approach
INSERT INTO citizen_otps (email, otp, form_data, expires_at) 
VALUES (?, ?, JSON.stringify(formData), dateAdd10Min)
```

### Register Verify
**Before:** Created user with just basic fields
**After:** Retrieves form_data from citizen_otps and creates user with all 21 fields

```javascript
// Now extracts all fields from stored form_data
const formData = JSON.parse(citizen_otps.form_data);
INSERT INTO CitizenSignup (
  first_name, last_name, dob, gender, mobile, email, password,
  country, state, district, city, pincode, address_line1, address_line2,
  gov_id_type, gov_id_last4, alt_phone, language,
  notify_sms, notify_email, notify_whatsapp
) VALUES (?, ?, ?, ...)
```

### OTP Expiration
**Before:** Not validated
**After:** All OTPs expire in 10 minutes

```javascript
// OTP validation now includes time check
WHERE email = ? AND otp = ? AND expires_at > NOW()
```

---

## Sample Request Bodies

### Register Prepare Request
```json
{
  "email": "john@example.com",
  "formData": {
    "first_name": "John",
    "last_name": "Doe",
    "dob": "1990-05-15",
    "gender": "Male",
    "mobile": "9876543210",
    "password": "SecurePass@123",
    "country": "India",
    "state": "Tamil Nadu",
    "district": "Chennai",
    "city": "Chennai",
    "pincode": "600001",
    "address_line1": "123 Main Street",
    "address_line2": "Apt 4B",
    "gov_id_type": "Aadhar",
    "gov_id_last4": "5678",
    "alt_phone": "9876543211",
    "language": "en",
    "notify_sms": true,
    "notify_email": true,
    "notify_whatsapp": false
  }
}
```

### Login Request OTP
```json
{
  "email": "john@example.com"
}
```

### Login Verify OTP
```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

### Create Complaint
```json
{
  "userId": 1,
  "category": "Road Damage",
  "title": "Large pothole on Main Street",
  "description": "Pothole is causing traffic hazards",
  "priority": "High",
  "city": "Chennai"
}
```

---

## Frontend Integration Notes

When updating your frontend forms to match the new schema:

1. **SignUp Form** needs these fields:
   - first_name, last_name, dob, gender, mobile
   - email, password
   - country, state, district, city, pincode
   - address_line1, address_line2
   - gov_id_type, gov_id_last4, alt_phone
   - language (select), notify_sms, notify_email, notify_whatsapp

2. **API Calls** should send all form data in the `formData` object:
   ```javascript
   const response = await fetch('/api/auth/register/prepare', {
     method: 'POST',
     body: JSON.stringify({ 
       email: formValues.email,
       formData: formValues  // All other fields
     })
   });
   ```

3. **Login Flow** can be simple:
   ```javascript
   // Option 1: Password login
   const response = await fetch('/api/auth/login/password', {
     method: 'POST',
     body: JSON.stringify({ 
       email: userEmail,
       password: userPassword 
     })
   });
   
   // Option 2: OTP login
   const response = await fetch('/api/auth/login/request-otp', {
     method: 'POST',
     body: JSON.stringify({ email: userEmail })
   });
   ```

---

## Testing the Updated Backend

### 1. Test Registration
```bash
# Step 1: Request OTP
curl -X POST http://localhost:5000/api/auth/register/prepare \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "formData": {
      "first_name": "Test",
      "last_name": "User",
      "mobile": "9876543210",
      "password": "Test@123",
      "city": "Chennai",
      "state": "Tamil Nadu",
      "country": "India"
    }
  }'

# Step 2: Verify OTP
curl -X POST http://localhost:5000/api/auth/register/verify \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 2. Test Login
```bash
# Password Login
curl -X POST http://localhost:5000/api/auth/login/password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123"
  }'

# OTP Login - Request
curl -X POST http://localhost:5000/api/auth/login/request-otp \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# OTP Login - Verify
curl -X POST http://localhost:5000/api/auth/login/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "123456"
  }'
```

### 3. Test Complaints
```bash
# Create Complaint
curl -X POST http://localhost:5000/api/complaints \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 1,
    "category": "Road Damage",
    "title": "Pothole",
    "description": "Large pothole on Main Street",
    "priority": "High",
    "city": "Chennai"
  }'

# Get User Complaints
curl http://localhost:5000/api/complaints/1

# Get User Stats
curl http://localhost:5000/api/complaints/stats/1
```

---

## Database Ready!

✅ Backend updated to your schema
✅ All column names corrected  
✅ All endpoints configured
✅ OTP expiration handled
✅ Form data storage working
✅ Ready for frontend integration
