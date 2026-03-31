---
description: How the complaint workflow operates from citizen registration to resolution
---

# Complaint Workflow: Citizen → Head → Staff → Employee

## Overview
This is a 4-tier hierarchical complaint management system where complaints flow through multiple authority levels for resolution.

## Workflow Steps

### 1. Citizen Submits Complaint
- **Form:** `client/src/user/ComplaintForm.jsx` (authenticated) or `client/src/complaint/ComplaintForm.jsx` (public)
- **Location Selection:** Country → State → City → Area (cascading dropdowns)
- **Backend Endpoint:** `POST /api/complaints` (authenticated) or `POST /complaints` (public)
- **What happens:**
  1. Citizen fills out complaint form with location details (Country, State, City, Area)
  2. Backend finds a Head matching the complaint's location + department/category
  3. Backend also tries to find an AVAILABLE Staff in the same location + department
  4. Complaint is created with status `ASSIGNED_TO_HEAD`
  5. If staff was found, they're noted as `auto_assigned_staff` (suggestion only)

### 2. Head Reviews & Assigns to Staff
- **UI:** `client/src/head/Incoming.jsx`
- **Head has two options:**
  - **Confirm Auto-Assignment:** `PUT /head/confirm-assign/:complaintId`
    - Status changes to `ASSIGNED_TO_STAFF`
    - Staff marked as `BUSY`
    - Email sent to Staff and Citizen
  - **Reassign to Different Staff:** `PUT /head/reassign/:complaintId`
    - Old staff freed (marked `AVAILABLE`)
    - New staff marked as `BUSY`
    - Status changes to `ASSIGNED_TO_STAFF`
    - Email notifications sent

### 3. Staff Assigns Employee
- **UI:** `client/src/staff/StaffAssignEmployee.jsx`
- **Endpoints:**
  - `GET /staff/employees/:complaintId` — fetches available employees in same location
  - `PUT /staff/assign-employee/:complaintId` — assigns employee
- Status changes to `ASSIGNED_TO_EMPLOYEE`
- Email notification sent to Employee

### 4. Employee Resolves Complaint
- **UI:** `client/src/employee/EmployeeDashboard.jsx` + `EmployeeUpdateComplaint.jsx`
- **Endpoint:** `PUT /employee/update/:complaintId`
- Employee can:
  - Update status to `IN_PROGRESS` or `RESOLVED`
  - Add remarks and internal notes
  - Upload proof (photos, documents)
- When `RESOLVED`:
  - Staff marked as `AVAILABLE` again
  - All stakeholders notified (Citizen, Staff, Head)

### 5. Head Reviews Resolution
- **UI:** `client/src/head/HeadStaffReports.jsx`
- **Endpoint:** `PUT /head/mark-completion/:complaintId`
- Head marks complaint as `COMPLETED` or `INCOMPLETE`
- Final notifications sent

## Location-Based Routing

### How Location Matching Works
The system uses a 4-level location hierarchy: **Country → State → City → Area**

- **`city`** in `complaints` table maps to **`city`** or **`district`** in `heads`/`staff` tables
- **`location`** in `complaints` table maps to **`location`** in `heads`/`staff` tables (this is the Area/locality)
- **Head Query:** `WHERE country=? AND state=? AND (city=? OR location=?) AND department=?`
- **Staff Query:** `WHERE department=? AND country=? AND state=? AND (district=? OR location=?) AND status='AVAILABLE'`

### Location Data
Both complaint forms use the same cascading location data (defined in the component files):
- Countries → States → Cities → Areas
- Example: India → Tamil Nadu → Chennai → [Teynampet, Velachery, Adyar, ...]

## Database Tables
- **`complaints`** — Central tracking (status, location, assignment chain)
- **`heads`** — Department heads (location, department, verification status)  
- **`staff`** — Staff members (location, department)
- **`staff_availability`** — Real-time availability (AVAILABLE/BUSY)
- **`employees`** — Field workers (location, department)

## Status Flow
```
ASSIGNED_TO_HEAD → ASSIGNED_TO_STAFF → ASSIGNED_TO_EMPLOYEE → IN_PROGRESS → RESOLVED → COMPLETED
```

## Key Files
| File | Purpose |
|------|---------|
| `client/src/user/ComplaintForm.jsx` | Authenticated complaint form (logged-in citizens) |
| `client/src/complaint/ComplaintForm.jsx` | Public complaint form (unauthenticated) |
| `client/src/head/Incoming.jsx` | Head reviews & assigns staff |
| `client/src/head/HeadStaffReports.jsx` | Head reviews resolved complaints |
| `client/src/staff/StaffAssignEmployee.jsx` | Staff assigns employee |
| `client/src/employee/EmployeeDashboard.jsx` | Employee views assigned complaints |
| `client/src/employee/EmployeeUpdateComplaint.jsx` | Employee updates complaint status |
| `server/server.js` | All backend API endpoints |
