-- ====================================
-- IKIMINA DIGITAL PLATFORM DATABASE SCHEMA
-- Professional MySQL Database Design
-- ====================================

-- Create database
CREATE DATABASE ikimina_platform CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ikimina_platform;

-- ====================================
-- 1. USER MANAGEMENT TABLES
-- ====================================

-- Users table (system-wide users)
CREATE TABLE users (
    user_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    national_id VARCHAR(20) UNIQUE,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    profile_picture_url VARCHAR(500),
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    last_login_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_national_id (national_id)
);

-- User addresses
CREATE TABLE user_addresses (
    address_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    address_type ENUM('Home', 'Work', 'Other') DEFAULT 'Home',
    province VARCHAR(100),
    district VARCHAR(100),
    sector VARCHAR(100),
    cell VARCHAR(100),
    village VARCHAR(100),
    street_address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- ====================================
-- 2. GROUP MANAGEMENT TABLES
-- ====================================

-- Ikimina groups
CREATE TABLE ikimina_groups (
    group_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_name VARCHAR(200) NOT NULL,
    group_code VARCHAR(20) NOT NULL UNIQUE,
    description TEXT,
    share_price DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    max_shares_per_meeting INT NOT NULL DEFAULT 1,
    meeting_frequency ENUM('Weekly', 'Bi-weekly', 'Monthly') DEFAULT 'Weekly',
    meeting_day ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    meeting_time TIME,
    registration_fee DECIMAL(10,2) DEFAULT 0.00,
    late_arrival_fine DECIMAL(10,2) DEFAULT 0.00,
    absence_fine DECIMAL(10,2) DEFAULT 0.00,
    loan_interest_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0500, -- 5% default
    loan_interest_type ENUM('Flat', 'Reducing_Balance') DEFAULT 'Flat',
    max_loan_multiplier DECIMAL(5,2) DEFAULT 3.00, -- Max loan = 3x member savings
    loan_repayment_period_months INT DEFAULT 12,
    social_fund_contribution DECIMAL(10,2) DEFAULT 0.00,
    cycle_duration_months INT DEFAULT 12,
    current_cycle_number INT DEFAULT 1,
    cycle_start_date DATE,
    cycle_end_date DATE,
    group_status ENUM('Active', 'Inactive', 'Suspended', 'Closed') DEFAULT 'Active',
    bylaws TEXT,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_group_code (group_code),
    INDEX idx_group_status (group_status),
    INDEX idx_created_by (created_by)
);

-- Group member roles
CREATE TABLE group_roles (
    role_id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    role_description TEXT,
    permissions JSON, -- Store permissions as JSON array
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO group_roles (role_name, role_description, permissions) VALUES
('Admin', 'Full administrative access', '["create_group", "manage_members", "manage_roles", "view_all_reports", "manage_settings"]'),
('Treasurer', 'Financial management', '["collect_contributions", "approve_loans", "record_transactions", "view_financial_reports"]'),
('Secretary', 'Record keeping and communication', '["record_attendance", "upload_minutes", "send_announcements", "view_member_reports"]'),
('Auditor', 'Audit and supervision', '["view_all_reports", "audit_transactions", "verify_balances"]'),
('Member', 'Basic member access', '["view_own_data", "request_loans", "view_announcements"]');

-- Group memberships
CREATE TABLE group_memberships (
    membership_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role_id INT NOT NULL DEFAULT 5, -- Default to Member role
    member_number VARCHAR(20),
    join_date DATE NOT NULL,
    approval_status ENUM('Pending', 'Approved', 'Rejected', 'Suspended') DEFAULT 'Pending',
    approved_by BIGINT,
    approved_at TIMESTAMP NULL,
    total_shares_purchased INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    exit_date DATE NULL,
    exit_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES group_roles(role_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    UNIQUE KEY unique_group_user (group_id, user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_approval_status (approval_status)
);

-- ====================================
-- 3. MEETINGS & ATTENDANCE
-- ====================================

-- Group meetings
CREATE TABLE group_meetings (
    meeting_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    meeting_date DATE NOT NULL,
    meeting_number INT NOT NULL,
    cycle_number INT NOT NULL,
    meeting_type ENUM('Regular', 'Emergency', 'Share-out') DEFAULT 'Regular',
    venue VARCHAR(200),
    agenda TEXT,
    minutes TEXT,
    recorded_by BIGINT,
    meeting_status ENUM('Scheduled', 'In_Progress', 'Completed', 'Cancelled') DEFAULT 'Scheduled',
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    total_attendance INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id),
    UNIQUE KEY unique_group_meeting_date (group_id, meeting_date),
    INDEX idx_group_id (group_id),
    INDEX idx_meeting_date (meeting_date),
    INDEX idx_meeting_status (meeting_status)
);

-- Meeting attendance
CREATE TABLE meeting_attendance (
    attendance_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    meeting_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    attendance_status ENUM('Present', 'Absent', 'Late', 'Excused') DEFAULT 'Absent',
    arrival_time TIMESTAMP NULL,
    late_fine_applied DECIMAL(10,2) DEFAULT 0.00,
    absence_fine_applied DECIMAL(10,2) DEFAULT 0.00,
    notes TEXT,
    recorded_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (meeting_id) REFERENCES group_meetings(meeting_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id),
    UNIQUE KEY unique_meeting_user (meeting_id, user_id),
    INDEX idx_meeting_id (meeting_id),
    INDEX idx_user_id (user_id)
);

-- ====================================
-- 4. FINANCIAL TRANSACTIONS
-- ====================================

-- Chart of accounts for better financial tracking
CREATE TABLE chart_of_accounts (
    account_id INT PRIMARY KEY AUTO_INCREMENT,
    account_code VARCHAR(20) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,
    account_type ENUM('Asset', 'Liability', 'Equity', 'Revenue', 'Expense') NOT NULL,
    parent_account_id INT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (parent_account_id) REFERENCES chart_of_accounts(account_id),
    INDEX idx_account_code (account_code)
);

-- Insert basic chart of accounts
INSERT INTO chart_of_accounts (account_code, account_name, account_type) VALUES
('1000', 'Assets', 'Asset'),
('1100', 'Cash and Bank', 'Asset'),
('1200', 'Loans Receivable', 'Asset'),
('2000', 'Liabilities', 'Liability'),
('2100', 'Member Savings', 'Liability'),
('3000', 'Equity', 'Equity'),
('3100', 'Share Capital', 'Equity'),
('4000', 'Revenue', 'Revenue'),
('4100', 'Interest Income', 'Revenue'),
('4200', 'Fines and Penalties', 'Revenue'),
('5000', 'Expenses', 'Expense'),
('5100', 'Administrative Expenses', 'Expense');

-- Main transactions table
CREATE TABLE transactions (
    transaction_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    meeting_id BIGINT NULL,
    transaction_type ENUM('Contribution', 'Loan_Disbursement', 'Loan_Repayment', 'Fine', 'Social_Fund', 'Share_Out', 'Interest', 'Fee') NOT NULL,
    transaction_category ENUM('Savings', 'Loan', 'Fine', 'Social_Fund', 'Administrative') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    transaction_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Mobile_Money', 'Bank_Transfer', 'SACCO') DEFAULT 'Cash',
    reference_number VARCHAR(100),
    description TEXT,
    recorded_by BIGINT NOT NULL,
    approved_by BIGINT,
    approval_status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Approved',
    is_reversed BOOLEAN DEFAULT FALSE,
    reversed_by BIGINT NULL,
    reversal_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES group_meetings(meeting_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id),
    FOREIGN KEY (approved_by) REFERENCES users(user_id),
    FOREIGN KEY (reversed_by) REFERENCES users(user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_date (transaction_date),
    INDEX idx_transaction_type (transaction_type)
);

-- Member savings/contributions tracking
CREATE TABLE member_savings (
    savings_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    cycle_number INT NOT NULL,
    meeting_id BIGINT NOT NULL,
    shares_purchased INT NOT NULL DEFAULT 0,
    share_value DECIMAL(10,2) NOT NULL,
    total_contribution DECIMAL(15,2) NOT NULL,
    payment_method ENUM('Cash', 'Mobile_Money', 'Bank_Transfer', 'SACCO') DEFAULT 'Cash',
    transaction_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES group_meetings(meeting_id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    INDEX idx_group_user_cycle (group_id, user_id, cycle_number),
    INDEX idx_meeting_id (meeting_id)
);

-- ====================================
-- 5. LOANS MANAGEMENT
-- ====================================

-- Loan applications
CREATE TABLE loan_applications (
    application_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    applicant_id BIGINT NOT NULL,
    loan_amount DECIMAL(15,2) NOT NULL,
    loan_purpose TEXT NOT NULL,
    requested_term_months INT NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL,
    interest_type ENUM('Flat', 'Reducing_Balance') NOT NULL,
    application_date DATE NOT NULL,
    application_status ENUM('Pending', 'Under_Review', 'Approved', 'Rejected', 'Cancelled') DEFAULT 'Pending',
    reviewed_by BIGINT,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    guarantor_required BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (applicant_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_applicant_id (applicant_id),
    INDEX idx_application_status (application_status)
);

-- Loan guarantors
CREATE TABLE loan_guarantors (
    guarantor_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id BIGINT NOT NULL,
    guarantor_user_id BIGINT NOT NULL,
    guarantee_amount DECIMAL(15,2) NOT NULL,
    guarantor_status ENUM('Pending', 'Accepted', 'Rejected') DEFAULT 'Pending',
    response_date TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES loan_applications(application_id) ON DELETE CASCADE,
    FOREIGN KEY (guarantor_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    UNIQUE KEY unique_application_guarantor (application_id, guarantor_user_id),
    INDEX idx_application_id (application_id),
    INDEX idx_guarantor_user_id (guarantor_user_id)
);

-- Active loans
CREATE TABLE loans (
    loan_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    application_id BIGINT NOT NULL,
    group_id BIGINT NOT NULL,
    borrower_id BIGINT NOT NULL,
    loan_number VARCHAR(50) NOT NULL UNIQUE,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_rate DECIMAL(5,4) NOT NULL,
    interest_type ENUM('Flat', 'Reducing_Balance') NOT NULL,
    total_interest DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL, -- Principal + Interest
    term_months INT NOT NULL,
    monthly_payment DECIMAL(15,2) NOT NULL,
    disbursement_date DATE NOT NULL,
    first_payment_date DATE NOT NULL,
    final_payment_date DATE NOT NULL,
    loan_status ENUM('Active', 'Fully_Paid', 'Defaulted', 'Written_Off') DEFAULT 'Active',
    balance_principal DECIMAL(15,2) NOT NULL,
    balance_interest DECIMAL(15,2) NOT NULL,
    total_paid DECIMAL(15,2) DEFAULT 0.00,
    penalty_balance DECIMAL(15,2) DEFAULT 0.00,
    days_overdue INT DEFAULT 0,
    disbursed_by BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (application_id) REFERENCES loan_applications(application_id),
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (borrower_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (disbursed_by) REFERENCES users(user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_borrower_id (borrower_id),
    INDEX idx_loan_status (loan_status),
    INDEX idx_loan_number (loan_number)
);

-- Loan repayment schedule
CREATE TABLE loan_repayment_schedule (
    schedule_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    loan_id BIGINT NOT NULL,
    installment_number INT NOT NULL,
    due_date DATE NOT NULL,
    principal_amount DECIMAL(15,2) NOT NULL,
    interest_amount DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    amount_paid DECIMAL(15,2) DEFAULT 0.00,
    penalty_amount DECIMAL(15,2) DEFAULT 0.00,
    payment_status ENUM('Pending', 'Partial', 'Paid', 'Overdue') DEFAULT 'Pending',
    paid_date DATE NULL,
    days_overdue INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
    UNIQUE KEY unique_loan_installment (loan_id, installment_number),
    INDEX idx_loan_id (loan_id),
    INDEX idx_due_date (due_date),
    INDEX idx_payment_status (payment_status)
);

-- Loan repayments
CREATE TABLE loan_repayments (
    repayment_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    loan_id BIGINT NOT NULL,
    schedule_id BIGINT NULL,
    amount_paid DECIMAL(15,2) NOT NULL,
    principal_paid DECIMAL(15,2) NOT NULL,
    interest_paid DECIMAL(15,2) NOT NULL,
    penalty_paid DECIMAL(15,2) DEFAULT 0.00,
    payment_date DATE NOT NULL,
    payment_method ENUM('Cash', 'Mobile_Money', 'Bank_Transfer', 'SACCO') DEFAULT 'Cash',
    reference_number VARCHAR(100),
    transaction_id BIGINT NOT NULL,
    recorded_by BIGINT NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id) ON DELETE CASCADE,
    FOREIGN KEY (schedule_id) REFERENCES loan_repayment_schedule(schedule_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    FOREIGN KEY (recorded_by) REFERENCES users(user_id),
    INDEX idx_loan_id (loan_id),
    INDEX idx_payment_date (payment_date),
    INDEX idx_transaction_id (transaction_id)
);

-- ====================================
-- 6. FINES AND PENALTIES
-- ====================================

-- Member fines
CREATE TABLE member_fines (
    fine_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    fine_type ENUM('Late_Arrival', 'Absence', 'Late_Payment', 'Disciplinary', 'Other') NOT NULL,
    fine_amount DECIMAL(10,2) NOT NULL,
    fine_date DATE NOT NULL,
    reason TEXT NOT NULL,
    meeting_id BIGINT NULL,
    loan_id BIGINT NULL, -- For late payment fines
    fine_status ENUM('Pending', 'Paid', 'Waived', 'Written_Off') DEFAULT 'Pending',
    amount_paid DECIMAL(10,2) DEFAULT 0.00,
    payment_date DATE NULL,
    waived_by BIGINT NULL,
    waived_reason TEXT,
    imposed_by BIGINT NOT NULL,
    transaction_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (meeting_id) REFERENCES group_meetings(meeting_id),
    FOREIGN KEY (loan_id) REFERENCES loans(loan_id),
    FOREIGN KEY (waived_by) REFERENCES users(user_id),
    FOREIGN KEY (imposed_by) REFERENCES users(user_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    INDEX idx_group_user (group_id, user_id),
    INDEX idx_fine_status (fine_status),
    INDEX idx_fine_date (fine_date)
);

-- ====================================
-- 7. SOCIAL FUND
-- ====================================

-- Social fund requests
CREATE TABLE social_fund_requests (
    request_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    requester_id BIGINT NOT NULL,
    request_type ENUM('Emergency', 'Medical', 'Education', 'Funeral', 'Other') NOT NULL,
    requested_amount DECIMAL(15,2) NOT NULL,
    reason TEXT NOT NULL,
    supporting_documents TEXT, -- JSON array of document URLs
    request_date DATE NOT NULL,
    request_status ENUM('Pending', 'Under_Review', 'Approved', 'Rejected', 'Disbursed') DEFAULT 'Pending',
    approved_amount DECIMAL(15,2) NULL,
    reviewed_by BIGINT NULL,
    reviewed_at TIMESTAMP NULL,
    review_notes TEXT,
    disbursement_date DATE NULL,
    repayment_required BOOLEAN DEFAULT FALSE,
    repayment_period_months INT NULL,
    transaction_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (requester_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(user_id),
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    INDEX idx_group_id (group_id),
    INDEX idx_requester_id (requester_id),
    INDEX idx_request_status (request_status)
);

-- ====================================
-- 8. CYCLE MANAGEMENT & SHARE-OUT
-- ====================================

-- Cycle summary
CREATE TABLE group_cycles (
    cycle_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    cycle_number INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    cycle_status ENUM('Active', 'Completed', 'Cancelled') DEFAULT 'Active',
    total_savings DECIMAL(15,2) DEFAULT 0.00,
    total_interest_earned DECIMAL(15,2) DEFAULT 0.00,
    total_fines_collected DECIMAL(15,2) DEFAULT 0.00,
    total_expenses DECIMAL(15,2) DEFAULT 0.00,
    net_profit DECIMAL(15,2) DEFAULT 0.00,
    total_members INT DEFAULT 0,
    share_out_date DATE NULL,
    share_out_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_cycle (group_id, cycle_number),
    INDEX idx_group_id (group_id),
    INDEX idx_cycle_status (cycle_status)
);

-- Share-out calculations
CREATE TABLE share_out_calculations (
    share_out_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    cycle_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    total_savings DECIMAL(15,2) NOT NULL,
    profit_share DECIMAL(15,2) NOT NULL,
    fines_deducted DECIMAL(15,2) DEFAULT 0.00,
    loan_balance_deducted DECIMAL(15,2) DEFAULT 0.00,
    net_payout DECIMAL(15,2) NOT NULL,
    payout_status ENUM('Pending', 'Paid', 'Carried_Forward') DEFAULT 'Pending',
    payout_date DATE NULL,
    payout_method ENUM('Cash', 'Mobile_Money', 'Bank_Transfer') NULL,
    transaction_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (cycle_id) REFERENCES group_cycles(cycle_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (transaction_id) REFERENCES transactions(transaction_id),
    UNIQUE KEY unique_cycle_user (cycle_id, user_id),
    INDEX idx_cycle_id (cycle_id),
    INDEX idx_user_id (user_id)
);

-- ====================================
-- 9. NOTIFICATIONS & COMMUNICATIONS
-- ====================================

-- Notification templates
CREATE TABLE notification_templates (
    template_id INT PRIMARY KEY AUTO_INCREMENT,
    template_name VARCHAR(100) NOT NULL UNIQUE,
    template_type ENUM('SMS', 'Email', 'WhatsApp', 'Push') NOT NULL,
    subject VARCHAR(200),
    message_template TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- User notifications
CREATE TABLE user_notifications (
    notification_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    group_id BIGINT NULL,
    notification_type ENUM('Contribution_Reminder', 'Meeting_Reminder', 'Loan_Due', 'Fine_Notice', 'Announcement', 'Loan_Approval', 'System') NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    delivery_method ENUM('SMS', 'Email', 'WhatsApp', 'Push', 'All') DEFAULT 'All',
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    scheduled_for TIMESTAMP NULL,
    sent_at TIMESTAMP NULL,
    delivery_status ENUM('Pending', 'Sent', 'Failed', 'Cancelled') DEFAULT 'Pending',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_notification_type (notification_type),
    INDEX idx_delivery_status (delivery_status)
);

-- Group announcements
CREATE TABLE group_announcements (
    announcement_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    announcement_type ENUM('General', 'Meeting', 'Financial', 'Policy', 'Emergency') DEFAULT 'General',
    priority ENUM('Low', 'Medium', 'High', 'Critical') DEFAULT 'Medium',
    target_audience ENUM('All_Members', 'Specific_Roles', 'Specific_Members') DEFAULT 'All_Members',
    target_roles JSON NULL, -- Array of role IDs if target_audience = 'Specific_Roles'
    target_users JSON NULL, -- Array of user IDs if target_audience = 'Specific_Members'
    created_by BIGINT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_announcement_type (announcement_type),
    INDEX idx_is_active (is_active)
);

-- ====================================
-- 10. AUDIT & SYSTEM LOGS
-- ====================================

-- System audit log
CREATE TABLE audit_logs (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NULL,
    group_id BIGINT NULL,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id BIGINT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    session_id VARCHAR(100),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (group_id) REFERENCES ikimina_groups(group_id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_group_id (group_id),
    INDEX idx_action (action)
);

-- System settings
CREATE TABLE system_settings (
    setting_id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type ENUM('String', 'Number', 'Boolean', 'JSON') DEFAULT 'String',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (updated_by) REFERENCES users(user_id),
    INDEX idx_setting_key (setting_key)
);

-- ====================================
-- 11. FINANCIAL REPORTING VIEWS
-- ====================================

-- Member financial summary view
CREATE VIEW v_member_financial_summary AS
SELECT 
    gm.group_id,
    gm.user_id,
    u.first_name,
    u.last_name,
    u.email,
    gm.member_number,
    -- Savings
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Contribution' THEN t.amount ELSE 0 END), 0) AS total_savings,
    -- Active loans
    COALESCE(l.active_loan_balance, 0) AS active_loan_balance,
    COALESCE(l.total_loan_payments, 0) AS total_loan_payments,
    -- Fines
    COALESCE(f.total_fines, 0) AS total_fines,
    COALESCE(f.fines_paid, 0) AS fines_paid,
    COALESCE(f.fines_outstanding, 0) AS fines_outstanding,
    -- Net position
    (COALESCE(SUM(CASE WHEN t.transaction_type = 'Contribution' THEN t.amount ELSE 0 END), 0) 
     - COALESCE(l.active_loan_balance, 0) 
     - COALESCE(f.fines_outstanding, 0)) AS net_position
FROM group_memberships gm
JOIN users u ON gm.user_id = u.user_id
LEFT JOIN transactions t ON gm.group_id = t.group_id AND gm.user_id = t.user_id AND t.is_reversed = FALSE
LEFT JOIN (
    SELECT 
        borrower_id,
        group_id,
        SUM(balance_principal + balance_interest) AS active_loan_balance,
        SUM(total_paid) AS total_loan_payments
    FROM loans 
    WHERE loan_status = 'Active'
    GROUP BY borrower_id, group_id
) l ON gm.user_id = l.borrower_id AND gm.group_id = l.group_id
LEFT JOIN (
    SELECT 
        user_id,
        group_id,
        SUM(fine_amount) AS total_fines,
        SUM(amount_paid) AS fines_paid,
        SUM(fine_amount - amount_paid) AS fines_outstanding
    FROM member_fines
    GROUP BY user_id, group_id
) f ON gm.user_id = f.user_id AND gm.group_id = f.group_id
WHERE gm.approval_status = 'Approved' AND gm.is_active = TRUE
GROUP BY gm.group_id, gm.user_id, u.first_name, u.last_name, u.email, gm.member_number;

-- Group financial summary view
CREATE VIEW v_group_financial_summary AS
SELECT 
    g.group_id,
    g.group_name,
    g.current_cycle_number,
    -- Member statistics
    COUNT(DISTINCT gm.user_id) AS total_members,
    COUNT(DISTINCT CASE WHEN gm.approval_status = 'Approved' THEN gm.user_id END) AS active_members,
    -- Savings
    COALESCE(SUM(CASE WHEN t.transaction_type = 'Contribution' THEN t.amount ELSE 0 END), 0) AS total_savings,
    -- Loans
    COALESCE(l.total_loans_disbursed, 0) AS total_loans_disbursed,
    COALESCE(l.active_loans_count, 0) AS active_loans_count,
    COALESCE(l.active_loan_balance, 0) AS active_loan_balance,
    COALESCE(l.total_interest_earned, 0) AS total_interest_earned,
    -- Fines
    COALESCE(f.total_fines_imposed, 0) AS total_fines_imposed,
    COALESCE(f.total_fines_collected, 0) AS total_fines_collected,
    -- Social Fund
    COALESCE(sf.total_social_contributions, 0) AS total_social_contributions,
    COALESCE(sf.total_social_disbursements, 0) AS total_social_disbursements,
    -- Fund balance
    (COALESCE(SUM(CASE WHEN t.transaction_type = 'Contribution' THEN t.amount ELSE 0 END), 0) 
     + COALESCE(l.total_interest_earned, 0) 
     + COALESCE(f.total_fines_collected, 0) 
     - COALESCE(l.active_loan_balance, 0)
     - COALESCE(sf.total_social_disbursements, 0)) AS available_fund_balance
FROM ikimina_groups g
LEFT JOIN group_memberships gm ON g.group_id = gm.group_id
LEFT JOIN transactions t ON g.group_id = t.group_id AND t.is_reversed = FALSE
LEFT JOIN (
    SELECT 
        group_id,
        COUNT(*) AS total_loans_disbursed,
        COUNT(CASE WHEN loan_status = 'Active' THEN 1 END) AS active_loans_count,
        SUM(CASE WHEN loan_status = 'Active' THEN balance_principal + balance_interest ELSE 0 END) AS active_loan_balance,
        SUM(total_interest) - SUM(balance_interest) AS total_interest_earned
    FROM loans
    GROUP BY group_id
) l ON g.group_id = l.group_id
LEFT JOIN (
    SELECT 
        group_id,
        SUM(fine_amount) AS total_fines_imposed,
        SUM(amount_paid) AS total_fines_collected
    FROM member_fines
    GROUP BY group_id
) f ON g.group_id = f.group_id
LEFT JOIN (
    SELECT 
        group_id,
        SUM(CASE WHEN transaction_type = 'Social_Fund' AND amount > 0 THEN amount ELSE 0 END) AS total_social_contributions,
        SUM(CASE WHEN transaction_type = 'Social_Fund' AND amount < 0 THEN ABS(amount) ELSE 0 END) AS total_social_disbursements
    FROM transactions
    WHERE transaction_category = 'Social_Fund'
    GROUP BY group_id
) sf ON g.group_id = sf.group_id
WHERE g.group_status = 'Active'
GROUP BY g.group_id;

-- Loan portfolio analysis view
CREATE VIEW v_loan_portfolio_analysis AS
SELECT 
    l.group_id,
    g.group_name,
    -- Portfolio metrics
    COUNT(*) AS total_loans,
    SUM(principal_amount) AS total_principal_disbursed,
    SUM(balance_principal + balance_interest) AS outstanding_balance,
    SUM(total_paid) AS total_repayments,
    AVG(principal_amount) AS average_loan_size,
    -- Performance metrics
    COUNT(CASE WHEN loan_status = 'Active' THEN 1 END) AS active_loans,
    COUNT(CASE WHEN loan_status = 'Fully_Paid' THEN 1 END) AS fully_paid_loans,
    COUNT(CASE WHEN loan_status = 'Defaulted' THEN 1 END) AS defaulted_loans,
    COUNT(CASE WHEN days_overdue > 0 THEN 1 END) AS overdue_loans,
    COUNT(CASE WHEN days_overdue > 30 THEN 1 END) AS loans_over_30_days,
    COUNT(CASE WHEN days_overdue > 90 THEN 1 END) AS loans_over_90_days,
    -- Risk metrics
    (COUNT(CASE WHEN loan_status = 'Defaulted' THEN 1 END) * 100.0 / COUNT(*)) AS default_rate,
    (COUNT(CASE WHEN days_overdue > 30 THEN 1 END) * 100.0 / COUNT(CASE WHEN loan_status = 'Active' THEN 1 END)) AS par_30_rate,
    SUM(penalty_balance) AS total_penalties
FROM loans l
JOIN ikimina_groups g ON l.group_id = g.group_id
GROUP BY l.group_id, g.group_name;

-- ====================================
-- 12. STORED PROCEDURES
-- ====================================

DELIMITER //

-- Calculate loan repayment schedule
CREATE PROCEDURE CalculateLoanSchedule(
    IN p_loan_id BIGINT,
    IN p_principal DECIMAL(15,2),
    IN p_interest_rate DECIMAL(5,4),
    IN p_term_months INT,
    IN p_interest_type ENUM('Flat', 'Reducing_Balance'),
    IN p_start_date DATE
)
BEGIN
    DECLARE v_monthly_payment DECIMAL(15,2);
    DECLARE v_monthly_principal DECIMAL(15,2);
    DECLARE v_monthly_interest DECIMAL(15,2);
    DECLARE v_remaining_principal DECIMAL(15,2);
    DECLARE v_installment INT DEFAULT 1;
    DECLARE v_due_date DATE;
    
    -- Clear existing schedule
    DELETE FROM loan_repayment_schedule WHERE loan_id = p_loan_id;
    
    SET v_remaining_principal = p_principal;
    
    IF p_interest_type = 'Flat' THEN
        -- Flat interest calculation
        SET v_monthly_interest = (p_principal * p_interest_rate) / 12;
        SET v_monthly_principal = p_principal / p_term_months;
        SET v_monthly_payment = v_monthly_principal + v_monthly_interest;
        
        WHILE v_installment <= p_term_months DO
            SET v_due_date = DATE_ADD(p_start_date, INTERVAL v_installment MONTH);
            
            INSERT INTO loan_repayment_schedule (
                loan_id, installment_number, due_date, 
                principal_amount, interest_amount, total_amount
            ) VALUES (
                p_loan_id, v_installment, v_due_date,
                v_monthly_principal, v_monthly_interest, v_monthly_payment
            );
            
            SET v_installment = v_installment + 1;
        END WHILE;
        
    ELSE
        -- Reducing balance calculation
        SET v_monthly_payment = (p_principal * p_interest_rate/12 * POWER(1 + p_interest_rate/12, p_term_months)) / 
                               (POWER(1 + p_interest_rate/12, p_term_months) - 1);
        
        WHILE v_installment <= p_term_months DO
            SET v_due_date = DATE_ADD(p_start_date, INTERVAL v_installment MONTH);
            SET v_monthly_interest = v_remaining_principal * (p_interest_rate / 12);
            SET v_monthly_principal = v_monthly_payment - v_monthly_interest;
            
            INSERT INTO loan_repayment_schedule (
                loan_id, installment_number, due_date,
                principal_amount, interest_amount, total_amount
            ) VALUES (
                p_loan_id, v_installment, v_due_date,
                v_monthly_principal, v_monthly_interest, v_monthly_payment
            );
            
            SET v_remaining_principal = v_remaining_principal - v_monthly_principal;
            SET v_installment = v_installment + 1;
        END WHILE;
    END IF;
END//

-- Process loan repayment
CREATE PROCEDURE ProcessLoanRepayment(
    IN p_loan_id BIGINT,
    IN p_payment_amount DECIMAL(15,2),
    IN p_payment_date DATE,
    IN p_payment_method VARCHAR(20),
    IN p_recorded_by BIGINT,
    OUT p_transaction_id BIGINT,
    OUT p_result VARCHAR(100)
)
BEGIN
    DECLARE v_loan_exists INT DEFAULT 0;
    DECLARE v_group_id BIGINT;
    DECLARE v_borrower_id BIGINT;
    DECLARE v_principal_paid DECIMAL(15,2) DEFAULT 0;
    DECLARE v_interest_paid DECIMAL(15,2) DEFAULT 0;
    DECLARE v_penalty_paid DECIMAL(15,2) DEFAULT 0;
    DECLARE v_remaining_amount DECIMAL(15,2);
    DECLARE v_current_penalty DECIMAL(15,2);
    DECLARE v_current_interest DECIMAL(15,2);
    DECLARE v_current_principal DECIMAL(15,2);
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        SET p_result = 'Error: Transaction failed';
    END;
    
    START TRANSACTION;
    
    -- Validate loan exists and is active
    SELECT COUNT(*), group_id, borrower_id, penalty_balance, balance_interest, balance_principal
    INTO v_loan_exists, v_group_id, v_borrower_id, v_current_penalty, v_current_interest, v_current_principal
    FROM loans 
    WHERE loan_id = p_loan_id AND loan_status = 'Active';
    
    IF v_loan_exists = 0 THEN
        SET p_result = 'Error: Loan not found or not active';
        ROLLBACK;
    ELSE
        SET v_remaining_amount = p_payment_amount;
        
        -- Apply payment hierarchy: Penalties -> Interest -> Principal
        
        -- 1. Pay penalties first
        IF v_current_penalty > 0 AND v_remaining_amount > 0 THEN
            SET v_penalty_paid = LEAST(v_current_penalty, v_remaining_amount);
            SET v_remaining_amount = v_remaining_amount - v_penalty_paid;
        END IF;
        
        -- 2. Pay interest
        IF v_current_interest > 0 AND v_remaining_amount > 0 THEN
            SET v_interest_paid = LEAST(v_current_interest, v_remaining_amount);
            SET v_remaining_amount = v_remaining_amount - v_interest_paid;
        END IF;
        
        -- 3. Pay principal
        IF v_current_principal > 0 AND v_remaining_amount > 0 THEN
            SET v_principal_paid = LEAST(v_current_principal, v_remaining_amount);
        END IF;
        
        -- Create transaction record
        INSERT INTO transactions (
            group_id, user_id, transaction_type, transaction_category,
            amount, transaction_date, payment_method, description, recorded_by
        ) VALUES (
            v_group_id, v_borrower_id, 'Loan_Repayment', 'Loan',
            p_payment_amount, p_payment_date, p_payment_method,
            CONCAT('Loan repayment - Principal: ', v_principal_paid, ', Interest: ', v_interest_paid, ', Penalty: ', v_penalty_paid),
            p_recorded_by
        );
        
        SET p_transaction_id = LAST_INSERT_ID();
        
        -- Record repayment
        INSERT INTO loan_repayments (
            loan_id, amount_paid, principal_paid, interest_paid, penalty_paid,
            payment_date, payment_method, transaction_id, recorded_by
        ) VALUES (
            p_loan_id, p_payment_amount, v_principal_paid, v_interest_paid, v_penalty_paid,
            p_payment_date, p_payment_method, p_transaction_id, p_recorded_by
        );
        
        -- Update loan balances
        UPDATE loans 
        SET 
            balance_principal = balance_principal - v_principal_paid,
            balance_interest = balance_interest - v_interest_paid,
            penalty_balance = penalty_balance - v_penalty_paid,
            total_paid = total_paid + p_payment_amount,
            loan_status = CASE 
                WHEN (balance_principal - v_principal_paid) <= 0 AND (balance_interest - v_interest_paid) <= 0 
                THEN 'Fully_Paid' 
                ELSE 'Active' 
            END,
            updated_at = CURRENT_TIMESTAMP
        WHERE loan_id = p_loan_id;
        
        -- Update repayment schedule
        CALL UpdateRepaymentSchedule(p_loan_id);
        
        SET p_result = 'Success: Payment processed';
        COMMIT;
    END IF;
END//

-- Update repayment schedule status
CREATE PROCEDURE UpdateRepaymentSchedule(IN p_loan_id BIGINT)
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_schedule_id BIGINT;
    DECLARE v_total_amount DECIMAL(15,2);
    DECLARE v_amount_paid DECIMAL(15,2);
    
    DECLARE schedule_cursor CURSOR FOR 
        SELECT schedule_id, total_amount, 
               COALESCE((SELECT SUM(principal_paid + interest_paid) 
                        FROM loan_repayments lr 
                        WHERE lr.schedule_id = lrs.schedule_id), 0) as paid
        FROM loan_repayment_schedule lrs
        WHERE loan_id = p_loan_id
        ORDER BY installment_number;
        
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
    
    OPEN schedule_cursor;
    
    read_loop: LOOP
        FETCH schedule_cursor INTO v_schedule_id, v_total_amount, v_amount_paid;
        IF done THEN
            LEAVE read_loop;
        END IF;
        
        UPDATE loan_repayment_schedule
        SET 
            amount_paid = v_amount_paid,
            payment_status = CASE 
                WHEN v_amount_paid >= v_total_amount THEN 'Paid'
                WHEN v_amount_paid > 0 THEN 'Partial'
                WHEN due_date < CURDATE() THEN 'Overdue'
                ELSE 'Pending'
            END,
            paid_date = CASE WHEN v_amount_paid >= v_total_amount THEN CURDATE() ELSE NULL END,
            days_overdue = CASE 
                WHEN due_date < CURDATE() AND v_amount_paid < v_total_amount 
                THEN DATEDIFF(CURDATE(), due_date)
                ELSE 0 
            END
        WHERE schedule_id = v_schedule_id;
    END LOOP;
    
    CLOSE schedule_cursor;
END//

-- Calculate share-out for a cycle
CREATE PROCEDURE CalculateShareOut(
    IN p_group_id BIGINT,
    IN p_cycle_number INT
)
BEGIN
    DECLARE v_total_savings DECIMAL(15,2) DEFAULT 0;
    DECLARE v_total_interest DECIMAL(15,2) DEFAULT 0;
    DECLARE v_total_fines DECIMAL(15,2) DEFAULT 0;
    DECLARE v_total_expenses DECIMAL(15,2) DEFAULT 0;
    DECLARE v_net_profit DECIMAL(15,2);
    DECLARE v_total_shares INT DEFAULT 0;
    DECLARE v_profit_per_share DECIMAL(15,4);
    
    -- Calculate cycle totals
    SELECT 
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Contribution' THEN t.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.transaction_type = 'Interest' THEN t.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.transaction_category = 'Fine' THEN t.amount ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN t.transaction_category = 'Administrative' THEN t.amount ELSE 0 END), 0)
    INTO v_total_savings, v_total_interest, v_total_fines, v_total_expenses
    FROM transactions t
    JOIN group_meetings gm ON t.meeting_id = gm.meeting_id
    WHERE t.group_id = p_group_id 
    AND gm.cycle_number = p_cycle_number
    AND t.is_reversed = FALSE;
    
    SET v_net_profit = v_total_interest + v_total_fines - v_total_expenses;
    
    -- Get total shares for the cycle
    SELECT COALESCE(SUM(shares_purchased), 0)
    INTO v_total_shares
    FROM member_savings ms
    JOIN group_meetings gm ON ms.meeting_id = gm.meeting_id
    WHERE ms.group_id = p_group_id 
    AND gm.cycle_number = p_cycle_number;
    
    -- Calculate profit per share
    SET v_profit_per_share = CASE WHEN v_total_shares > 0 THEN v_net_profit / v_total_shares ELSE 0 END;
    
    -- Clear existing calculations
    DELETE FROM share_out_calculations 
    WHERE cycle_id = (SELECT cycle_id FROM group_cycles WHERE group_id = p_group_id AND cycle_number = p_cycle_number);
    
    -- Calculate individual share-outs
    INSERT INTO share_out_calculations (cycle_id, user_id, total_savings, profit_share, fines_deducted, loan_balance_deducted, net_payout)
    SELECT 
        gc.cycle_id,
        member_totals.user_id,
        member_totals.member_savings,
        member_totals.member_shares * v_profit_per_share as profit_share,
        COALESCE(member_fines.total_fines, 0) as fines_deducted,
        COALESCE(loan_balances.outstanding_balance, 0) as loan_balance_deducted,
        (member_totals.member_savings + (member_totals.member_shares * v_profit_per_share) 
         - COALESCE(member_fines.total_fines, 0) - COALESCE(loan_balances.outstanding_balance, 0)) as net_payout
    FROM group_cycles gc
    JOIN (
        SELECT 
            ms.user_id,
            SUM(ms.total_contribution) as member_savings,
            SUM(ms.shares_purchased) as member_shares
        FROM member_savings ms
        JOIN group_meetings gm ON ms.meeting_id = gm.meeting_id
        WHERE ms.group_id = p_group_id AND gm.cycle_number = p_cycle_number
        GROUP BY ms.user_id
    ) member_totals ON 1=1
    LEFT JOIN (
        SELECT 
            mf.user_id,
            SUM(mf.fine_amount - mf.amount_paid) as total_fines
        FROM member_fines mf
        WHERE mf.group_id = p_group_id 
        AND mf.fine_status IN ('Pending', 'Partial')
        GROUP BY mf.user_id
    ) member_fines ON member_totals.user_id = member_fines.user_id
    LEFT JOIN (
        SELECT 
            l.borrower_id as user_id,
            SUM(l.balance_principal + l.balance_interest) as outstanding_balance
        FROM loans l
        WHERE l.group_id = p_group_id AND l.loan_status = 'Active'
        GROUP BY l.borrower_id
    ) loan_balances ON member_totals.user_id = loan_balances.user_id
    WHERE gc.group_id = p_group_id AND gc.cycle_number = p_cycle_number;
    
    -- Update cycle summary
    UPDATE group_cycles
    SET 
        total_savings = v_total_savings,
        total_interest_earned = v_total_interest,
        total_fines_collected = v_total_fines,
        total_expenses = v_total_expenses,
        net_profit = v_net_profit,
        total_members = (SELECT COUNT(DISTINCT user_id) FROM share_out_calculations 
                        WHERE cycle_id = (SELECT cycle_id FROM group_cycles 
                                        WHERE group_id = p_group_id AND cycle_number = p_cycle_number)),
        updated_at = CURRENT_TIMESTAMP
    WHERE group_id = p_group_id AND cycle_number = p_cycle_number;
END//

DELIMITER ;

-- ====================================
-- 13. INDEXES FOR PERFORMANCE
-- ====================================

-- Additional composite indexes for better query performance
CREATE INDEX idx_transactions_group_date ON transactions(group_id, transaction_date);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, transaction_type);
CREATE INDEX idx_loans_group_status ON loans(group_id, loan_status);
CREATE INDEX idx_member_savings_group_cycle ON member_savings(group_id, cycle_number);
CREATE INDEX idx_attendance_meeting_status ON meeting_attendance(meeting_id, attendance_status);
CREATE INDEX idx_fines_group_status ON member_fines(group_id, fine_status);
CREATE INDEX idx_notifications_user_type ON user_notifications(user_id, notification_type, is_read);

-- ====================================
-- 14. TRIGGERS FOR AUDIT LOGGING
-- ====================================

DELIMITER //

-- Audit trigger for transactions
CREATE TRIGGER tr_transactions_audit_insert 
AFTER INSERT ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, new_values)
    VALUES (NEW.recorded_by, NEW.group_id, 'INSERT', 'transactions', NEW.transaction_id, 
            JSON_OBJECT('transaction_type', NEW.transaction_type, 'amount', NEW.amount, 
                       'transaction_date', NEW.transaction_date));
END//

CREATE TRIGGER tr_transactions_audit_update 
AFTER UPDATE ON transactions
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.recorded_by, NEW.group_id, 'UPDATE', 'transactions', NEW.transaction_id,
            JSON_OBJECT('amount', OLD.amount, 'is_reversed', OLD.is_reversed),
            JSON_OBJECT('amount', NEW.amount, 'is_reversed', NEW.is_reversed));
END//

-- Audit trigger for loans
CREATE TRIGGER tr_loans_audit_update 
AFTER UPDATE ON loans
FOR EACH ROW
BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, old_values, new_values)
    VALUES (OLD.borrower_id, OLD.group_id, 'UPDATE', 'loans', OLD.loan_id,
            JSON_OBJECT('balance_principal', OLD.balance_principal, 'balance_interest', OLD.balance_interest, 'loan_status', OLD.loan_status),
            JSON_OBJECT('balance_principal', NEW.balance_principal, 'balance_interest', NEW.balance_interest, 'loan_status', NEW.loan_status));
END//

DELIMITER ;

-- ====================================
-- 15. SAMPLE DATA INSERTION
-- ====================================

-- Insert sample system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('default_interest_rate', '0.05', 'Number', 'Default loan interest rate (5%)', TRUE),
('max_loan_term_months', '24', 'Number', 'Maximum loan term in months', TRUE),
('late_payment_penalty_rate', '0.02', 'Number', 'Late payment penalty rate (2%)', TRUE),
('notification_sms_enabled', 'true', 'Boolean', 'Enable SMS notifications', FALSE),
('notification_email_enabled', 'true', 'Boolean', 'Enable email notifications', FALSE),
('system_timezone', 'Africa/Kigali', 'String', 'System timezone', TRUE);

-- Insert notification templates
INSERT INTO notification_templates (template_name, template_type, subject, message_template) VALUES
('contribution_reminder', 'SMS', NULL, 'Dear {{first_name}}, reminder: {{group_name}} meeting tomorrow at {{meeting_time}}. Please bring your contribution of {{amount}} RWF.'),
('loan_due_reminder', 'SMS', NULL, 'Dear {{first_name}}, your loan payment of {{amount}} RWF is due on {{due_date}}. Please ensure timely payment to avoid penalties.'),
('meeting_reminder', 'Email', '{{group_name}} - Meeting Reminder', 'Dear {{first_name}}, this is a reminder about tomorrow''s {{group_name}} meeting at {{meeting_time}}. Agenda: {{agenda}}'),
('loan_approved', 'SMS', NULL, 'Congratulations {{first_name}}! Your loan of {{amount}} RWF has been approved. Disbursement will be processed shortly.'),
('fine_notice', 'SMS', NULL, 'Dear {{first_name}}, you have been fined {{amount}} RWF for {{reason}}. Please settle during the next meeting.');

-- ====================================
-- PERFORMANCE OPTIMIZATION NOTES
-- ====================================

/*
PERFORMANCE RECOMMENDATIONS:

1. PARTITIONING:
   - Consider partitioning large tables like transactions, audit_logs by date
   - Partition loan_repayment_schedule by loan_id ranges for very large groups

2. ARCHIVAL STRATEGY:
   - Archive completed cycles data to separate tables
   - Move old audit logs to archive tables after 2+ years

3. CACHING STRATEGY:
   - Cache frequently accessed data like group settings, member summaries
   - Implement Redis for session management and notifications queue

4. QUERY OPTIMIZATION:
   - Use covering indexes for complex reporting queries
   - Implement materialized views for heavy financial reports
   - Consider query result caching for dashboard data

5. SCALING CONSIDERATIONS:
   - Implement read replicas for reporting queries
   - Consider database sharding by group_id for very large deployments
   - Use connection pooling and optimize connection settings

6. MONITORING:
   - Monitor slow query log regularly
   - Track index usage and optimize unused indexes
   - Monitor transaction deadlocks and optimize locking

7. BACKUP STRATEGY:
   - Implement point-in-time recovery
   - Regular backup testing and restoration procedures
   - Consider cross-region backup replication for disaster recovery
*/ 