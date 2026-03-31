-- Remove old databases to prevent confusion

-- Create the master database
CREATE DATABASE complaintt_system;
USE complaintt_system;


-- -----------------------------------------------------
-- 1. CITIZEN SIGNUP
-- -----------------------------------------------------
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
select * from CitizenSignup;
-- -----------------------------------------------------
-- 2. HEADS
-- -----------------------------------------------------
CREATE TABLE heads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  department VARCHAR(50) NOT NULL,

  country VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,
  location VARCHAR(50) NOT NULL, 

  aadhaar VARCHAR(12) UNIQUE NOT NULL,
  pan VARCHAR(20) NOT NULL,
  voter_id VARCHAR(20) NULL, -- Updated: Set to NULL as per your request

  phone VARCHAR(15) NOT NULL,
  address TEXT NOT NULL,
  
  qualification VARCHAR(100) DEFAULT NULL,
  years_of_experience VARCHAR(50) DEFAULT NULL,
  department_experience VARCHAR(50) DEFAULT NULL,
  designation VARCHAR(100) DEFAULT NULL,

  status ENUM('PENDING','ACTIVE','REJECTED','INACTIVE') DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 3. STAFF & AVAILABILITY
-- -----------------------------------------------------
CREATE TABLE staff (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255),
  department VARCHAR(50),
  
  country VARCHAR(50),
  state VARCHAR(50),
  district VARCHAR(50), 
  location VARCHAR(100), 
 
  status ENUM('ACTIVE','ON_LEAVE','INACTIVE'),

  aadhaar VARCHAR(12) UNIQUE NOT NULL,
  pan VARCHAR(20),
  voter_id VARCHAR(20),

  phone VARCHAR(15),
  address TEXT
);
CREATE TABLE staff_availability (
  staff_id INT PRIMARY KEY,
  status ENUM('AVAILABLE','BUSY') DEFAULT 'AVAILABLE',
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE CASCADE
);

-- -----------------------------------------------------
-- 4. EMPLOYEES
-- -----------------------------------------------------
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(255) NOT NULL,
  phone VARCHAR(15),
  department VARCHAR(100),
  
  country VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  district VARCHAR(50),  -- Updated: Added district column as per your request
  city VARCHAR(100),
  location VARCHAR(100),
  address TEXT NOT NULL,

  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE'
);

-- -----------------------------------------------------
-- 5. COMPLAINTS (Main unified table for the system)
-- (This correctly includes all ALTER TABLE columns previously requested)
-- -----------------------------------------------------
CREATE TABLE complaints (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  
  country VARCHAR(50) NOT NULL,
  state VARCHAR(50) NOT NULL,
  city VARCHAR(50) NOT NULL,      
  location VARCHAR(50) NOT NULL,  
  street VARCHAR(255),
  address TEXT,
  landmark VARCHAR(255),
  
  title VARCHAR(255),
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  
  status VARCHAR(50) DEFAULT 'ASSIGNED_TO_HEAD',
  priority VARCHAR(20),
  contact_time VARCHAR(20),
  
  staff_message TEXT,
  internal_note TEXT,
  remarks TEXT,
  proof VARCHAR(255),
  
  head_id INT,
  head_remarks TEXT,
  head_reviewed_at TIMESTAMP NULL,
  
  staff_id INT,
  employee_id INT,
  employee_assigned_date DATETIME,
  
  auto_assigned_staff_id INT,
  auto_assigned_staff VARCHAR(100),
  auto_assigned_employee_id INT,
  auto_assigned_employee VARCHAR(255),
  auto_assigned_confirmed INT DEFAULT 0,
  
  resolved_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (head_id) REFERENCES heads(id) ON DELETE SET NULL,
  FOREIGN KEY (staff_id) REFERENCES staff(id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- -----------------------------------------------------
-- 6. ONE-TIME PASSWORDS (OTPs)
-- -----------------------------------------------------
CREATE TABLE citizen_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  form_data LONGTEXT NOT NULL,
  expires_at DATETIME
);

CREATE TABLE login_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  purpose ENUM('login','forgot'),
  expires_at DATETIME
);

CREATE TABLE staff_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6),
  form_data LONGTEXT NOT NULL,
  expires_at DATETIME
);

CREATE TABLE head_otps (
  email VARCHAR(100) PRIMARY KEY,
  otp VARCHAR(6) NOT NULL,
  form_data LONGTEXT NOT NULL,
  expires_at DATETIME NOT NULL
);

-- -----------------------------------------------------
-- 7. MISC CONFIGURATION / SYSTEM TABLES
-- -----------------------------------------------------
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);
INSERT INTO locations (name) VALUES ('City A'), ('City B'), ('Zone 1');

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL
);
INSERT INTO categories (name) VALUES ('Electricity'), ('Water'), ('Sanitation'), ('Road Damage'), ('Street Light'), ('Public Safety'), ('Drainage'), ('Others');
CREATE TABLE departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(150) NOT NULL UNIQUE,
    department_description LONGTEXT,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
select * from departments;

CREATE TABLE service_types (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    service_type_name VARCHAR(100) NOT NULL UNIQUE,
    service_type_description LONGTEXT,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

drop table service_types;
CREATE TABLE skills (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(150) NOT NULL UNIQUE,
    skill_description LONGTEXT,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
CREATE TABLE priorities (
    priority_id INT AUTO_INCREMENT PRIMARY KEY,
    priority_name VARCHAR(50) NOT NULL UNIQUE,
    priority_description LONGTEXT,
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE complaint_categories (
  category_id INT AUTO_INCREMENT PRIMARY KEY,
  category_code VARCHAR(50) NOT NULL UNIQUE,
  category_name VARCHAR(150) NOT NULL,
  category_description LONGTEXT,
  department_id INT NOT NULL,
  service_type_id INT NOT NULL,
  skill_id INT NOT NULL,
  priority_id INT NOT NULL,
  expected_resolution_days INT DEFAULT 7,
  status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE category_gallery (
    image_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    image_path VARCHAR(255) NOT NULL,
    image_description VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE regional_heads (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  location VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255),
    role ENUM('USER','HEAD','STAFF','ADMIN') NOT NULL,
    location_id INT NULL,
    category_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (location_id) REFERENCES locations(id),
    FOREIGN KEY (category_id) REFERENCES categories(id)
);
INSERT INTO users (name, email, role) VALUES ('System Admin', 'admin@complaint.com', 'ADMIN');

select * from admins;


INSERT INTO departments 
(department_id, department_name, department_description, status, created_at, updated_at) 
VALUES
(1, 'Electricity Department', 'Responsible for generation, distribution, and maintenance of electrical power and street lighting.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(2, 'Water Supply Department', 'Manages water distribution, pipelines, storage tanks, and drinking water supply.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(3, 'Public Works Department', 'Responsible for construction and maintenance of roads, bridges, and public infrastructure.', 'ACTIVE', '2026-01-31 00:43:44', '2026-02-03 11:46:40'),
(4, 'Municipal Sanitation Department', 'Handles waste collection, sewage systems, drainage cleaning, and public hygiene.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(5, 'Telecommunications Department', 'Responsible for telephone, broadband, fiber, and communication services.', 'ACTIVE', '2026-01-31 00:43:44', '2026-02-03 11:46:26'),
(6, 'Gas Supply Department', 'Manages gas pipeline networks, leakage control, and safety inspections.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(7, 'Fire and Emergency Services', 'Handles fire hazards, rescue operations, and emergency safety services.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(8, 'Environmental Protection Department', 'Responsible for pollution control, noise regulation, and environmental complaints.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(9, 'Urban Development Authority', 'Manages urban planning, housing, and infrastructure development projects.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(10, 'Transport Department', 'Responsible for public transport systems, traffic signals, and road safety issues.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(11, 'Health & Sanitation Department', 'Handles public health-related complaints, water quality issues, and sanitation facilities.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(12, 'IT & Digital Services Department', 'Responsible for online portals, smart city services, and digital infrastructure.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(13, 'Housing Board', 'Handles government housing schemes, building repairs, and residential infrastructure.', 'ACTIVE', '2026-01-31 00:43:44', '2026-01-31 00:43:44'),
(14, 'Consumer Affairs Department', 'Handles service quality issues, consumer complaints, and grievance redressal.', 'ACTIVE', '2026-01-31 00:43:44', '2026-02-14 10:46:24'),
(15, 'Disaster Management Department', 'Responsible for flood control, storm damage response, and disaster recovery operations.', 'ACTIVE', '2026-01-31 00:43:44', '2026-02-03 11:47:03'),
(16, 'Textile Department', 'good', 'INACTIVE', '2026-02-03 21:21:54', '2026-02-03 22:44:46');

INSERT INTO service_types
(service_type_id, service_type_name, service_type_description, status, created_at, updated_at)
VALUES
(1, 'Repair', 'Used when something is broken or not working properly and needs to be fixed.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(2, 'Maintenance', 'Used for regular upkeep and servicing to prevent future problems.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(3, 'Installation', 'Used when new infrastructure or equipment needs to be installed.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(4, 'Replacement', 'Used when an item is damaged beyond repair and must be replaced.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(5, 'Inspection', 'Used when the problem needs to be checked or verified before taking action.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(6, 'Cleaning', 'Used for complaints related to cleanliness and waste removal.', 'ACTIVE', '2026-01-31 00:42:28', '2026-02-02 01:16:34'),
(7, 'Emergency Response', 'Used for urgent situations requiring immediate on-site action.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(8, 'Technical Support', 'Used for system-related or digital service issues.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(9, 'Customer Service', 'Used for complaints related to service behavior or information requests.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28'),
(10, 'Monitoring', 'Used for ongoing observation and follow-up of reported issues.', 'ACTIVE', '2026-01-31 00:42:28', '2026-01-31 00:42:28');
drop database complaintt_system;

show tables;


CREATE TABLE admin_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(100), -- e.g., 'head_approved', 'complaint_viewed'
  details JSON,
  admin_id INT, -- Links to admin user
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

--  Admin database codes
CREATE TABLE admins (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_name VARCHAR(150) NOT NULL,
    admin_email VARCHAR(150) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'PRIMARY_ADMIN',
    status ENUM('ACTIVE','INACTIVE') DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
INSERT INTO admins (admin_name, admin_email, admin_password, role)
VALUES ('raj', 'raj@gmail.com', SHA2('raj123', 256), 'PRIMARY_ADMIN');
SELECT id FROM locations WHERE name = 'City B';
SELECT * FROM admins;