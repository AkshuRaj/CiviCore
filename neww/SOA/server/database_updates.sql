-- Add missing columns for complete workflow

-- Complaints table enhancements
ALTER TABLE complaints
ADD COLUMN IF NOT EXISTS head_remarks TEXT,
ADD COLUMN IF NOT EXISTS head_reviewed_at TIMESTAMP NULL;

-- Employees table enhancement (district matches staff table naming)
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS district VARCHAR(50) NOT NULL DEFAULT '';

-- If district is already there, we can skip it
-- These columns enable the full workflow tracking
