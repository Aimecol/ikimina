-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Aug 26, 2025 at 01:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ikimina_platform`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateLoanSchedule` (IN `p_loan_id` BIGINT, IN `p_principal` DECIMAL(15,2), IN `p_interest_rate` DECIMAL(5,4), IN `p_term_months` INT, IN `p_interest_type` ENUM('Flat','Reducing_Balance'), IN `p_start_date` DATE)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `CalculateShareOut` (IN `p_group_id` BIGINT, IN `p_cycle_number` INT)   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `ProcessLoanRepayment` (IN `p_loan_id` BIGINT, IN `p_payment_amount` DECIMAL(15,2), IN `p_payment_date` DATE, IN `p_payment_method` VARCHAR(20), IN `p_recorded_by` BIGINT, OUT `p_transaction_id` BIGINT, OUT `p_result` VARCHAR(100))   BEGIN
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
END$$

CREATE DEFINER=`root`@`localhost` PROCEDURE `UpdateRepaymentSchedule` (IN `p_loan_id` BIGINT)   BEGIN
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
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `log_id` bigint(20) NOT NULL,
  `user_id` bigint(20) DEFAULT NULL,
  `group_id` bigint(20) DEFAULT NULL,
  `action` varchar(100) NOT NULL,
  `table_name` varchar(100) NOT NULL,
  `record_id` bigint(20) DEFAULT NULL,
  `old_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`old_values`)),
  `new_values` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`new_values`)),
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `session_id` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `chart_of_accounts`
--

CREATE TABLE `chart_of_accounts` (
  `account_id` int(11) NOT NULL,
  `account_code` varchar(20) NOT NULL,
  `account_name` varchar(100) NOT NULL,
  `account_type` enum('Asset','Liability','Equity','Revenue','Expense') NOT NULL,
  `parent_account_id` int(11) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `chart_of_accounts`
--

INSERT INTO `chart_of_accounts` (`account_id`, `account_code`, `account_name`, `account_type`, `parent_account_id`, `is_active`, `created_at`) VALUES
(1, '1000', 'Assets', 'Asset', NULL, 1, '2025-08-25 23:15:48'),
(2, '1100', 'Cash and Bank', 'Asset', NULL, 1, '2025-08-25 23:15:48'),
(3, '1200', 'Loans Receivable', 'Asset', NULL, 1, '2025-08-25 23:15:48'),
(4, '2000', 'Liabilities', 'Liability', NULL, 1, '2025-08-25 23:15:48'),
(5, '2100', 'Member Savings', 'Liability', NULL, 1, '2025-08-25 23:15:48'),
(6, '3000', 'Equity', 'Equity', NULL, 1, '2025-08-25 23:15:48'),
(7, '3100', 'Share Capital', 'Equity', NULL, 1, '2025-08-25 23:15:48'),
(8, '4000', 'Revenue', 'Revenue', NULL, 1, '2025-08-25 23:15:48'),
(9, '4100', 'Interest Income', 'Revenue', NULL, 1, '2025-08-25 23:15:48'),
(10, '4200', 'Fines and Penalties', 'Revenue', NULL, 1, '2025-08-25 23:15:48'),
(11, '5000', 'Expenses', 'Expense', NULL, 1, '2025-08-25 23:15:48'),
(12, '5100', 'Administrative Expenses', 'Expense', NULL, 1, '2025-08-25 23:15:48');

-- --------------------------------------------------------

--
-- Table structure for table `group_announcements`
--

CREATE TABLE `group_announcements` (
  `announcement_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `announcement_type` enum('General','Meeting','Financial','Policy','Emergency') DEFAULT 'General',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `target_audience` enum('All_Members','Specific_Roles','Specific_Members') DEFAULT 'All_Members',
  `target_roles` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_roles`)),
  `target_users` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`target_users`)),
  `created_by` bigint(20) NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_cycles`
--

CREATE TABLE `group_cycles` (
  `cycle_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `cycle_number` int(11) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `cycle_status` enum('Active','Completed','Cancelled') DEFAULT 'Active',
  `total_savings` decimal(15,2) DEFAULT 0.00,
  `total_interest_earned` decimal(15,2) DEFAULT 0.00,
  `total_fines_collected` decimal(15,2) DEFAULT 0.00,
  `total_expenses` decimal(15,2) DEFAULT 0.00,
  `net_profit` decimal(15,2) DEFAULT 0.00,
  `total_members` int(11) DEFAULT 0,
  `share_out_date` date DEFAULT NULL,
  `share_out_completed` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_meetings`
--

CREATE TABLE `group_meetings` (
  `meeting_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `meeting_date` date NOT NULL,
  `meeting_number` int(11) NOT NULL,
  `cycle_number` int(11) NOT NULL,
  `meeting_type` enum('Regular','Emergency','Share-out') DEFAULT 'Regular',
  `venue` varchar(200) DEFAULT NULL,
  `agenda` text DEFAULT NULL,
  `minutes` text DEFAULT NULL,
  `recorded_by` bigint(20) DEFAULT NULL,
  `meeting_status` enum('Scheduled','In_Progress','Completed','Cancelled') DEFAULT 'Scheduled',
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `total_attendance` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_memberships`
--

CREATE TABLE `group_memberships` (
  `membership_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `role_id` int(11) NOT NULL DEFAULT 5,
  `member_number` varchar(20) DEFAULT NULL,
  `join_date` date NOT NULL,
  `approval_status` enum('Pending','Approved','Rejected','Suspended') DEFAULT 'Pending',
  `approved_by` bigint(20) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `total_shares_purchased` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `exit_date` date DEFAULT NULL,
  `exit_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `group_roles`
--

CREATE TABLE `group_roles` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL,
  `role_description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`permissions`)),
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `group_roles`
--

INSERT INTO `group_roles` (`role_id`, `role_name`, `role_description`, `permissions`, `is_active`, `created_at`) VALUES
(1, 'Admin', 'Full administrative access', '[\"create_group\", \"manage_members\", \"manage_roles\", \"view_all_reports\", \"manage_settings\"]', 1, '2025-08-25 23:15:48'),
(2, 'Treasurer', 'Financial management', '[\"collect_contributions\", \"approve_loans\", \"record_transactions\", \"view_financial_reports\"]', 1, '2025-08-25 23:15:48'),
(3, 'Secretary', 'Record keeping and communication', '[\"record_attendance\", \"upload_minutes\", \"send_announcements\", \"view_member_reports\"]', 1, '2025-08-25 23:15:48'),
(4, 'Auditor', 'Audit and supervision', '[\"view_all_reports\", \"audit_transactions\", \"verify_balances\"]', 1, '2025-08-25 23:15:48'),
(5, 'Member', 'Basic member access', '[\"view_own_data\", \"request_loans\", \"view_announcements\"]', 1, '2025-08-25 23:15:48');

-- --------------------------------------------------------

--
-- Table structure for table `ikimina_groups`
--

CREATE TABLE `ikimina_groups` (
  `group_id` bigint(20) NOT NULL,
  `group_name` varchar(200) NOT NULL,
  `group_code` varchar(20) NOT NULL,
  `description` text DEFAULT NULL,
  `share_price` decimal(15,2) NOT NULL DEFAULT 0.00,
  `max_shares_per_meeting` int(11) NOT NULL DEFAULT 1,
  `meeting_frequency` enum('Weekly','Bi-weekly','Monthly') DEFAULT 'Weekly',
  `meeting_day` enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') DEFAULT NULL,
  `meeting_time` time DEFAULT NULL,
  `registration_fee` decimal(10,2) DEFAULT 0.00,
  `late_arrival_fine` decimal(10,2) DEFAULT 0.00,
  `absence_fine` decimal(10,2) DEFAULT 0.00,
  `loan_interest_rate` decimal(5,4) NOT NULL DEFAULT 0.0500,
  `loan_interest_type` enum('Flat','Reducing_Balance') DEFAULT 'Flat',
  `max_loan_multiplier` decimal(5,2) DEFAULT 3.00,
  `loan_repayment_period_months` int(11) DEFAULT 12,
  `social_fund_contribution` decimal(10,2) DEFAULT 0.00,
  `cycle_duration_months` int(11) DEFAULT 12,
  `current_cycle_number` int(11) DEFAULT 1,
  `cycle_start_date` date DEFAULT NULL,
  `cycle_end_date` date DEFAULT NULL,
  `group_status` enum('Active','Inactive','Suspended','Closed') DEFAULT 'Active',
  `bylaws` text DEFAULT NULL,
  `created_by` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loans`
--

CREATE TABLE `loans` (
  `loan_id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `borrower_id` bigint(20) NOT NULL,
  `loan_number` varchar(50) NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_rate` decimal(5,4) NOT NULL,
  `interest_type` enum('Flat','Reducing_Balance') NOT NULL,
  `total_interest` decimal(15,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `term_months` int(11) NOT NULL,
  `monthly_payment` decimal(15,2) NOT NULL,
  `disbursement_date` date NOT NULL,
  `first_payment_date` date NOT NULL,
  `final_payment_date` date NOT NULL,
  `loan_status` enum('Active','Fully_Paid','Defaulted','Written_Off') DEFAULT 'Active',
  `balance_principal` decimal(15,2) NOT NULL,
  `balance_interest` decimal(15,2) NOT NULL,
  `total_paid` decimal(15,2) DEFAULT 0.00,
  `penalty_balance` decimal(15,2) DEFAULT 0.00,
  `days_overdue` int(11) DEFAULT 0,
  `disbursed_by` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `loans`
--
DELIMITER $$
CREATE TRIGGER `tr_loans_audit_update` AFTER UPDATE ON `loans` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, old_values, new_values)
    VALUES (OLD.borrower_id, OLD.group_id, 'UPDATE', 'loans', OLD.loan_id,
            JSON_OBJECT('balance_principal', OLD.balance_principal, 'balance_interest', OLD.balance_interest, 'loan_status', OLD.loan_status),
            JSON_OBJECT('balance_principal', NEW.balance_principal, 'balance_interest', NEW.balance_interest, 'loan_status', NEW.loan_status));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `loan_applications`
--

CREATE TABLE `loan_applications` (
  `application_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `applicant_id` bigint(20) NOT NULL,
  `loan_amount` decimal(15,2) NOT NULL,
  `loan_purpose` text NOT NULL,
  `requested_term_months` int(11) NOT NULL,
  `interest_rate` decimal(5,4) NOT NULL,
  `interest_type` enum('Flat','Reducing_Balance') NOT NULL,
  `application_date` date NOT NULL,
  `application_status` enum('Pending','Under_Review','Approved','Rejected','Cancelled') DEFAULT 'Pending',
  `reviewed_by` bigint(20) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `guarantor_required` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_guarantors`
--

CREATE TABLE `loan_guarantors` (
  `guarantor_id` bigint(20) NOT NULL,
  `application_id` bigint(20) NOT NULL,
  `guarantor_user_id` bigint(20) NOT NULL,
  `guarantee_amount` decimal(15,2) NOT NULL,
  `guarantor_status` enum('Pending','Accepted','Rejected') DEFAULT 'Pending',
  `response_date` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayments`
--

CREATE TABLE `loan_repayments` (
  `repayment_id` bigint(20) NOT NULL,
  `loan_id` bigint(20) NOT NULL,
  `schedule_id` bigint(20) DEFAULT NULL,
  `amount_paid` decimal(15,2) NOT NULL,
  `principal_paid` decimal(15,2) NOT NULL,
  `interest_paid` decimal(15,2) NOT NULL,
  `penalty_paid` decimal(15,2) DEFAULT 0.00,
  `payment_date` date NOT NULL,
  `payment_method` enum('Cash','Mobile_Money','Bank_Transfer','SACCO') DEFAULT 'Cash',
  `reference_number` varchar(100) DEFAULT NULL,
  `transaction_id` bigint(20) NOT NULL,
  `recorded_by` bigint(20) NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `loan_repayment_schedule`
--

CREATE TABLE `loan_repayment_schedule` (
  `schedule_id` bigint(20) NOT NULL,
  `loan_id` bigint(20) NOT NULL,
  `installment_number` int(11) NOT NULL,
  `due_date` date NOT NULL,
  `principal_amount` decimal(15,2) NOT NULL,
  `interest_amount` decimal(15,2) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `amount_paid` decimal(15,2) DEFAULT 0.00,
  `penalty_amount` decimal(15,2) DEFAULT 0.00,
  `payment_status` enum('Pending','Partial','Paid','Overdue') DEFAULT 'Pending',
  `paid_date` date DEFAULT NULL,
  `days_overdue` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `meeting_attendance`
--

CREATE TABLE `meeting_attendance` (
  `attendance_id` bigint(20) NOT NULL,
  `meeting_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `attendance_status` enum('Present','Absent','Late','Excused') DEFAULT 'Absent',
  `arrival_time` timestamp NULL DEFAULT NULL,
  `late_fine_applied` decimal(10,2) DEFAULT 0.00,
  `absence_fine_applied` decimal(10,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `recorded_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_fines`
--

CREATE TABLE `member_fines` (
  `fine_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `fine_type` enum('Late_Arrival','Absence','Late_Payment','Disciplinary','Other') NOT NULL,
  `fine_amount` decimal(10,2) NOT NULL,
  `fine_date` date NOT NULL,
  `reason` text NOT NULL,
  `meeting_id` bigint(20) DEFAULT NULL,
  `loan_id` bigint(20) DEFAULT NULL,
  `fine_status` enum('Pending','Paid','Waived','Written_Off') DEFAULT 'Pending',
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_date` date DEFAULT NULL,
  `waived_by` bigint(20) DEFAULT NULL,
  `waived_reason` text DEFAULT NULL,
  `imposed_by` bigint(20) NOT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `member_savings`
--

CREATE TABLE `member_savings` (
  `savings_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `cycle_number` int(11) NOT NULL,
  `meeting_id` bigint(20) NOT NULL,
  `shares_purchased` int(11) NOT NULL DEFAULT 0,
  `share_value` decimal(10,2) NOT NULL,
  `total_contribution` decimal(15,2) NOT NULL,
  `payment_method` enum('Cash','Mobile_Money','Bank_Transfer','SACCO') DEFAULT 'Cash',
  `transaction_id` bigint(20) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notification_templates`
--

CREATE TABLE `notification_templates` (
  `template_id` int(11) NOT NULL,
  `template_name` varchar(100) NOT NULL,
  `template_type` enum('SMS','Email','WhatsApp','Push') NOT NULL,
  `subject` varchar(200) DEFAULT NULL,
  `message_template` text NOT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notification_templates`
--

INSERT INTO `notification_templates` (`template_id`, `template_name`, `template_type`, `subject`, `message_template`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'contribution_reminder', 'SMS', NULL, 'Dear {{first_name}}, reminder: {{group_name}} meeting tomorrow at {{meeting_time}}. Please bring your contribution of {{amount}} RWF.', 1, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(2, 'loan_due_reminder', 'SMS', NULL, 'Dear {{first_name}}, your loan payment of {{amount}} RWF is due on {{due_date}}. Please ensure timely payment to avoid penalties.', 1, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(3, 'meeting_reminder', 'Email', '{{group_name}} - Meeting Reminder', 'Dear {{first_name}}, this is a reminder about tomorrow\'s {{group_name}} meeting at {{meeting_time}}. Agenda: {{agenda}}', 1, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(4, 'loan_approved', 'SMS', NULL, 'Congratulations {{first_name}}! Your loan of {{amount}} RWF has been approved. Disbursement will be processed shortly.', 1, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(5, 'fine_notice', 'SMS', NULL, 'Dear {{first_name}}, you have been fined {{amount}} RWF for {{reason}}. Please settle during the next meeting.', 1, '2025-08-25 23:15:51', '2025-08-25 23:15:51');

-- --------------------------------------------------------

--
-- Table structure for table `share_out_calculations`
--

CREATE TABLE `share_out_calculations` (
  `share_out_id` bigint(20) NOT NULL,
  `cycle_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `total_savings` decimal(15,2) NOT NULL,
  `profit_share` decimal(15,2) NOT NULL,
  `fines_deducted` decimal(15,2) DEFAULT 0.00,
  `loan_balance_deducted` decimal(15,2) DEFAULT 0.00,
  `net_payout` decimal(15,2) NOT NULL,
  `payout_status` enum('Pending','Paid','Carried_Forward') DEFAULT 'Pending',
  `payout_date` date DEFAULT NULL,
  `payout_method` enum('Cash','Mobile_Money','Bank_Transfer') DEFAULT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `social_fund_requests`
--

CREATE TABLE `social_fund_requests` (
  `request_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `requester_id` bigint(20) NOT NULL,
  `request_type` enum('Emergency','Medical','Education','Funeral','Other') NOT NULL,
  `requested_amount` decimal(15,2) NOT NULL,
  `reason` text NOT NULL,
  `supporting_documents` text DEFAULT NULL,
  `request_date` date NOT NULL,
  `request_status` enum('Pending','Under_Review','Approved','Rejected','Disbursed') DEFAULT 'Pending',
  `approved_amount` decimal(15,2) DEFAULT NULL,
  `reviewed_by` bigint(20) DEFAULT NULL,
  `reviewed_at` timestamp NULL DEFAULT NULL,
  `review_notes` text DEFAULT NULL,
  `disbursement_date` date DEFAULT NULL,
  `repayment_required` tinyint(1) DEFAULT 0,
  `repayment_period_months` int(11) DEFAULT NULL,
  `transaction_id` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `system_settings`
--

CREATE TABLE `system_settings` (
  `setting_id` int(11) NOT NULL,
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text NOT NULL,
  `setting_type` enum('String','Number','Boolean','JSON') DEFAULT 'String',
  `description` text DEFAULT NULL,
  `is_public` tinyint(1) DEFAULT 0,
  `updated_by` bigint(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `system_settings`
--

INSERT INTO `system_settings` (`setting_id`, `setting_key`, `setting_value`, `setting_type`, `description`, `is_public`, `updated_by`, `created_at`, `updated_at`) VALUES
(1, 'default_interest_rate', '0.05', 'Number', 'Default loan interest rate (5%)', 1, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(2, 'max_loan_term_months', '24', 'Number', 'Maximum loan term in months', 1, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(3, 'late_payment_penalty_rate', '0.02', 'Number', 'Late payment penalty rate (2%)', 1, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(4, 'notification_sms_enabled', 'true', 'Boolean', 'Enable SMS notifications', 0, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(5, 'notification_email_enabled', 'true', 'Boolean', 'Enable email notifications', 0, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51'),
(6, 'system_timezone', 'Africa/Kigali', 'String', 'System timezone', 1, NULL, '2025-08-25 23:15:51', '2025-08-25 23:15:51');

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `transaction_id` bigint(20) NOT NULL,
  `group_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `meeting_id` bigint(20) DEFAULT NULL,
  `transaction_type` enum('Contribution','Loan_Disbursement','Loan_Repayment','Fine','Social_Fund','Share_Out','Interest','Fee') NOT NULL,
  `transaction_category` enum('Savings','Loan','Fine','Social_Fund','Administrative') NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `transaction_date` date NOT NULL,
  `payment_method` enum('Cash','Mobile_Money','Bank_Transfer','SACCO') DEFAULT 'Cash',
  `reference_number` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `recorded_by` bigint(20) NOT NULL,
  `approved_by` bigint(20) DEFAULT NULL,
  `approval_status` enum('Pending','Approved','Rejected') DEFAULT 'Approved',
  `is_reversed` tinyint(1) DEFAULT 0,
  `reversed_by` bigint(20) DEFAULT NULL,
  `reversal_reason` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Triggers `transactions`
--
DELIMITER $$
CREATE TRIGGER `tr_transactions_audit_insert` AFTER INSERT ON `transactions` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, new_values)
    VALUES (NEW.recorded_by, NEW.group_id, 'INSERT', 'transactions', NEW.transaction_id, 
            JSON_OBJECT('transaction_type', NEW.transaction_type, 'amount', NEW.amount, 
                       'transaction_date', NEW.transaction_date));
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tr_transactions_audit_update` AFTER UPDATE ON `transactions` FOR EACH ROW BEGIN
    INSERT INTO audit_logs (user_id, group_id, action, table_name, record_id, old_values, new_values)
    VALUES (NEW.recorded_by, NEW.group_id, 'UPDATE', 'transactions', NEW.transaction_id,
            JSON_OBJECT('amount', OLD.amount, 'is_reversed', OLD.is_reversed),
            JSON_OBJECT('amount', NEW.amount, 'is_reversed', NEW.is_reversed));
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` bigint(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `national_id` varchar(20) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `profile_picture_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `email_verified` tinyint(1) DEFAULT 0,
  `phone_verified` tinyint(1) DEFAULT 0,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_addresses`
--

CREATE TABLE `user_addresses` (
  `address_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `address_type` enum('Home','Work','Other') DEFAULT 'Home',
  `province` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `sector` varchar(100) DEFAULT NULL,
  `cell` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `street_address` text DEFAULT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `user_notifications`
--

CREATE TABLE `user_notifications` (
  `notification_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `group_id` bigint(20) DEFAULT NULL,
  `notification_type` enum('Contribution_Reminder','Meeting_Reminder','Loan_Due','Fine_Notice','Announcement','Loan_Approval','System') NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `delivery_method` enum('SMS','Email','WhatsApp','Push','All') DEFAULT 'All',
  `is_read` tinyint(1) DEFAULT 0,
  `read_at` timestamp NULL DEFAULT NULL,
  `scheduled_for` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `delivery_status` enum('Pending','Sent','Failed','Cancelled') DEFAULT 'Pending',
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_group_financial_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_group_financial_summary` (
`group_id` bigint(20)
,`group_name` varchar(200)
,`current_cycle_number` int(11)
,`total_members` bigint(21)
,`active_members` bigint(21)
,`total_savings` decimal(37,2)
,`total_loans_disbursed` bigint(21)
,`active_loans_count` bigint(21)
,`active_loan_balance` decimal(38,2)
,`total_interest_earned` decimal(38,2)
,`total_fines_imposed` decimal(32,2)
,`total_fines_collected` decimal(32,2)
,`total_social_contributions` decimal(37,2)
,`total_social_disbursements` decimal(37,2)
,`available_fund_balance` decimal(42,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_loan_portfolio_analysis`
-- (See below for the actual view)
--
CREATE TABLE `v_loan_portfolio_analysis` (
`group_id` bigint(20)
,`group_name` varchar(200)
,`total_loans` bigint(21)
,`total_principal_disbursed` decimal(37,2)
,`outstanding_balance` decimal(38,2)
,`total_repayments` decimal(37,2)
,`average_loan_size` decimal(19,6)
,`active_loans` bigint(21)
,`fully_paid_loans` bigint(21)
,`defaulted_loans` bigint(21)
,`overdue_loans` bigint(21)
,`loans_over_30_days` bigint(21)
,`loans_over_90_days` bigint(21)
,`default_rate` decimal(28,5)
,`par_30_rate` decimal(28,5)
,`total_penalties` decimal(37,2)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_member_financial_summary`
-- (See below for the actual view)
--
CREATE TABLE `v_member_financial_summary` (
`group_id` bigint(20)
,`user_id` bigint(20)
,`first_name` varchar(100)
,`last_name` varchar(100)
,`email` varchar(255)
,`member_number` varchar(20)
,`total_savings` decimal(37,2)
,`active_loan_balance` decimal(38,2)
,`total_loan_payments` decimal(37,2)
,`total_fines` decimal(32,2)
,`fines_paid` decimal(32,2)
,`fines_outstanding` decimal(33,2)
,`net_position` decimal(40,2)
);

-- --------------------------------------------------------

--
-- Structure for view `v_group_financial_summary`
--
DROP TABLE IF EXISTS `v_group_financial_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_group_financial_summary`  AS SELECT `g`.`group_id` AS `group_id`, `g`.`group_name` AS `group_name`, `g`.`current_cycle_number` AS `current_cycle_number`, count(distinct `gm`.`user_id`) AS `total_members`, count(distinct case when `gm`.`approval_status` = 'Approved' then `gm`.`user_id` end) AS `active_members`, coalesce(sum(case when `t`.`transaction_type` = 'Contribution' then `t`.`amount` else 0 end),0) AS `total_savings`, coalesce(`l`.`total_loans_disbursed`,0) AS `total_loans_disbursed`, coalesce(`l`.`active_loans_count`,0) AS `active_loans_count`, coalesce(`l`.`active_loan_balance`,0) AS `active_loan_balance`, coalesce(`l`.`total_interest_earned`,0) AS `total_interest_earned`, coalesce(`f`.`total_fines_imposed`,0) AS `total_fines_imposed`, coalesce(`f`.`total_fines_collected`,0) AS `total_fines_collected`, coalesce(`sf`.`total_social_contributions`,0) AS `total_social_contributions`, coalesce(`sf`.`total_social_disbursements`,0) AS `total_social_disbursements`, coalesce(sum(case when `t`.`transaction_type` = 'Contribution' then `t`.`amount` else 0 end),0) + coalesce(`l`.`total_interest_earned`,0) + coalesce(`f`.`total_fines_collected`,0) - coalesce(`l`.`active_loan_balance`,0) - coalesce(`sf`.`total_social_disbursements`,0) AS `available_fund_balance` FROM (((((`ikimina_groups` `g` left join `group_memberships` `gm` on(`g`.`group_id` = `gm`.`group_id`)) left join `transactions` `t` on(`g`.`group_id` = `t`.`group_id` and `t`.`is_reversed` = 0)) left join (select `loans`.`group_id` AS `group_id`,count(0) AS `total_loans_disbursed`,count(case when `loans`.`loan_status` = 'Active' then 1 end) AS `active_loans_count`,sum(case when `loans`.`loan_status` = 'Active' then `loans`.`balance_principal` + `loans`.`balance_interest` else 0 end) AS `active_loan_balance`,sum(`loans`.`total_interest`) - sum(`loans`.`balance_interest`) AS `total_interest_earned` from `loans` group by `loans`.`group_id`) `l` on(`g`.`group_id` = `l`.`group_id`)) left join (select `member_fines`.`group_id` AS `group_id`,sum(`member_fines`.`fine_amount`) AS `total_fines_imposed`,sum(`member_fines`.`amount_paid`) AS `total_fines_collected` from `member_fines` group by `member_fines`.`group_id`) `f` on(`g`.`group_id` = `f`.`group_id`)) left join (select `transactions`.`group_id` AS `group_id`,sum(case when `transactions`.`transaction_type` = 'Social_Fund' and `transactions`.`amount` > 0 then `transactions`.`amount` else 0 end) AS `total_social_contributions`,sum(case when `transactions`.`transaction_type` = 'Social_Fund' and `transactions`.`amount` < 0 then abs(`transactions`.`amount`) else 0 end) AS `total_social_disbursements` from `transactions` where `transactions`.`transaction_category` = 'Social_Fund' group by `transactions`.`group_id`) `sf` on(`g`.`group_id` = `sf`.`group_id`)) WHERE `g`.`group_status` = 'Active' GROUP BY `g`.`group_id` ;

-- --------------------------------------------------------

--
-- Structure for view `v_loan_portfolio_analysis`
--
DROP TABLE IF EXISTS `v_loan_portfolio_analysis`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_loan_portfolio_analysis`  AS SELECT `l`.`group_id` AS `group_id`, `g`.`group_name` AS `group_name`, count(0) AS `total_loans`, sum(`l`.`principal_amount`) AS `total_principal_disbursed`, sum(`l`.`balance_principal` + `l`.`balance_interest`) AS `outstanding_balance`, sum(`l`.`total_paid`) AS `total_repayments`, avg(`l`.`principal_amount`) AS `average_loan_size`, count(case when `l`.`loan_status` = 'Active' then 1 end) AS `active_loans`, count(case when `l`.`loan_status` = 'Fully_Paid' then 1 end) AS `fully_paid_loans`, count(case when `l`.`loan_status` = 'Defaulted' then 1 end) AS `defaulted_loans`, count(case when `l`.`days_overdue` > 0 then 1 end) AS `overdue_loans`, count(case when `l`.`days_overdue` > 30 then 1 end) AS `loans_over_30_days`, count(case when `l`.`days_overdue` > 90 then 1 end) AS `loans_over_90_days`, count(case when `l`.`loan_status` = 'Defaulted' then 1 end) * 100.0 / count(0) AS `default_rate`, count(case when `l`.`days_overdue` > 30 then 1 end) * 100.0 / count(case when `l`.`loan_status` = 'Active' then 1 end) AS `par_30_rate`, sum(`l`.`penalty_balance`) AS `total_penalties` FROM (`loans` `l` join `ikimina_groups` `g` on(`l`.`group_id` = `g`.`group_id`)) GROUP BY `l`.`group_id`, `g`.`group_name` ;

-- --------------------------------------------------------

--
-- Structure for view `v_member_financial_summary`
--
DROP TABLE IF EXISTS `v_member_financial_summary`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `v_member_financial_summary`  AS SELECT `gm`.`group_id` AS `group_id`, `gm`.`user_id` AS `user_id`, `u`.`first_name` AS `first_name`, `u`.`last_name` AS `last_name`, `u`.`email` AS `email`, `gm`.`member_number` AS `member_number`, coalesce(sum(case when `t`.`transaction_type` = 'Contribution' then `t`.`amount` else 0 end),0) AS `total_savings`, coalesce(`l`.`active_loan_balance`,0) AS `active_loan_balance`, coalesce(`l`.`total_loan_payments`,0) AS `total_loan_payments`, coalesce(`f`.`total_fines`,0) AS `total_fines`, coalesce(`f`.`fines_paid`,0) AS `fines_paid`, coalesce(`f`.`fines_outstanding`,0) AS `fines_outstanding`, coalesce(sum(case when `t`.`transaction_type` = 'Contribution' then `t`.`amount` else 0 end),0) - coalesce(`l`.`active_loan_balance`,0) - coalesce(`f`.`fines_outstanding`,0) AS `net_position` FROM ((((`group_memberships` `gm` join `users` `u` on(`gm`.`user_id` = `u`.`user_id`)) left join `transactions` `t` on(`gm`.`group_id` = `t`.`group_id` and `gm`.`user_id` = `t`.`user_id` and `t`.`is_reversed` = 0)) left join (select `loans`.`borrower_id` AS `borrower_id`,`loans`.`group_id` AS `group_id`,sum(`loans`.`balance_principal` + `loans`.`balance_interest`) AS `active_loan_balance`,sum(`loans`.`total_paid`) AS `total_loan_payments` from `loans` where `loans`.`loan_status` = 'Active' group by `loans`.`borrower_id`,`loans`.`group_id`) `l` on(`gm`.`user_id` = `l`.`borrower_id` and `gm`.`group_id` = `l`.`group_id`)) left join (select `member_fines`.`user_id` AS `user_id`,`member_fines`.`group_id` AS `group_id`,sum(`member_fines`.`fine_amount`) AS `total_fines`,sum(`member_fines`.`amount_paid`) AS `fines_paid`,sum(`member_fines`.`fine_amount` - `member_fines`.`amount_paid`) AS `fines_outstanding` from `member_fines` group by `member_fines`.`user_id`,`member_fines`.`group_id`) `f` on(`gm`.`user_id` = `f`.`user_id` and `gm`.`group_id` = `f`.`group_id`)) WHERE `gm`.`approval_status` = 'Approved' AND `gm`.`is_active` = 1 GROUP BY `gm`.`group_id`, `gm`.`user_id`, `u`.`first_name`, `u`.`last_name`, `u`.`email`, `gm`.`member_number` ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`log_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_action` (`action`);

--
-- Indexes for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD PRIMARY KEY (`account_id`),
  ADD UNIQUE KEY `account_code` (`account_code`),
  ADD KEY `parent_account_id` (`parent_account_id`),
  ADD KEY `idx_account_code` (`account_code`);

--
-- Indexes for table `group_announcements`
--
ALTER TABLE `group_announcements`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_announcement_type` (`announcement_type`),
  ADD KEY `idx_is_active` (`is_active`);

--
-- Indexes for table `group_cycles`
--
ALTER TABLE `group_cycles`
  ADD PRIMARY KEY (`cycle_id`),
  ADD UNIQUE KEY `unique_group_cycle` (`group_id`,`cycle_number`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_cycle_status` (`cycle_status`);

--
-- Indexes for table `group_meetings`
--
ALTER TABLE `group_meetings`
  ADD PRIMARY KEY (`meeting_id`),
  ADD UNIQUE KEY `unique_group_meeting_date` (`group_id`,`meeting_date`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_meeting_date` (`meeting_date`),
  ADD KEY `idx_meeting_status` (`meeting_status`);

--
-- Indexes for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD PRIMARY KEY (`membership_id`),
  ADD UNIQUE KEY `unique_group_user` (`group_id`,`user_id`),
  ADD KEY `role_id` (`role_id`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_approval_status` (`approval_status`);

--
-- Indexes for table `group_roles`
--
ALTER TABLE `group_roles`
  ADD PRIMARY KEY (`role_id`),
  ADD UNIQUE KEY `role_name` (`role_name`);

--
-- Indexes for table `ikimina_groups`
--
ALTER TABLE `ikimina_groups`
  ADD PRIMARY KEY (`group_id`),
  ADD UNIQUE KEY `group_code` (`group_code`),
  ADD KEY `idx_group_code` (`group_code`),
  ADD KEY `idx_group_status` (`group_status`),
  ADD KEY `idx_created_by` (`created_by`);

--
-- Indexes for table `loans`
--
ALTER TABLE `loans`
  ADD PRIMARY KEY (`loan_id`),
  ADD UNIQUE KEY `loan_number` (`loan_number`),
  ADD KEY `application_id` (`application_id`),
  ADD KEY `disbursed_by` (`disbursed_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_borrower_id` (`borrower_id`),
  ADD KEY `idx_loan_status` (`loan_status`),
  ADD KEY `idx_loan_number` (`loan_number`),
  ADD KEY `idx_loans_group_status` (`group_id`,`loan_status`);

--
-- Indexes for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD PRIMARY KEY (`application_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_applicant_id` (`applicant_id`),
  ADD KEY `idx_application_status` (`application_status`);

--
-- Indexes for table `loan_guarantors`
--
ALTER TABLE `loan_guarantors`
  ADD PRIMARY KEY (`guarantor_id`),
  ADD UNIQUE KEY `unique_application_guarantor` (`application_id`,`guarantor_user_id`),
  ADD KEY `idx_application_id` (`application_id`),
  ADD KEY `idx_guarantor_user_id` (`guarantor_user_id`);

--
-- Indexes for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD PRIMARY KEY (`repayment_id`),
  ADD KEY `schedule_id` (`schedule_id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_payment_date` (`payment_date`),
  ADD KEY `idx_transaction_id` (`transaction_id`);

--
-- Indexes for table `loan_repayment_schedule`
--
ALTER TABLE `loan_repayment_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `unique_loan_installment` (`loan_id`,`installment_number`),
  ADD KEY `idx_loan_id` (`loan_id`),
  ADD KEY `idx_due_date` (`due_date`),
  ADD KEY `idx_payment_status` (`payment_status`);

--
-- Indexes for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD UNIQUE KEY `unique_meeting_user` (`meeting_id`,`user_id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_attendance_meeting_status` (`meeting_id`,`attendance_status`);

--
-- Indexes for table `member_fines`
--
ALTER TABLE `member_fines`
  ADD PRIMARY KEY (`fine_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `meeting_id` (`meeting_id`),
  ADD KEY `loan_id` (`loan_id`),
  ADD KEY `waived_by` (`waived_by`),
  ADD KEY `imposed_by` (`imposed_by`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_group_user` (`group_id`,`user_id`),
  ADD KEY `idx_fine_status` (`fine_status`),
  ADD KEY `idx_fine_date` (`fine_date`),
  ADD KEY `idx_fines_group_status` (`group_id`,`fine_status`);

--
-- Indexes for table `member_savings`
--
ALTER TABLE `member_savings`
  ADD PRIMARY KEY (`savings_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_group_user_cycle` (`group_id`,`user_id`,`cycle_number`),
  ADD KEY `idx_meeting_id` (`meeting_id`),
  ADD KEY `idx_member_savings_group_cycle` (`group_id`,`cycle_number`);

--
-- Indexes for table `notification_templates`
--
ALTER TABLE `notification_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD UNIQUE KEY `template_name` (`template_name`);

--
-- Indexes for table `share_out_calculations`
--
ALTER TABLE `share_out_calculations`
  ADD PRIMARY KEY (`share_out_id`),
  ADD UNIQUE KEY `unique_cycle_user` (`cycle_id`,`user_id`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_cycle_id` (`cycle_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `social_fund_requests`
--
ALTER TABLE `social_fund_requests`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `reviewed_by` (`reviewed_by`),
  ADD KEY `transaction_id` (`transaction_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_requester_id` (`requester_id`),
  ADD KEY `idx_request_status` (`request_status`);

--
-- Indexes for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD PRIMARY KEY (`setting_id`),
  ADD UNIQUE KEY `setting_key` (`setting_key`),
  ADD KEY `updated_by` (`updated_by`),
  ADD KEY `idx_setting_key` (`setting_key`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`transaction_id`),
  ADD KEY `meeting_id` (`meeting_id`),
  ADD KEY `recorded_by` (`recorded_by`),
  ADD KEY `approved_by` (`approved_by`),
  ADD KEY `reversed_by` (`reversed_by`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_transaction_date` (`transaction_date`),
  ADD KEY `idx_transaction_type` (`transaction_type`),
  ADD KEY `idx_transactions_group_date` (`group_id`,`transaction_date`),
  ADD KEY `idx_transactions_user_type` (`user_id`,`transaction_type`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `phone` (`phone`),
  ADD UNIQUE KEY `national_id` (`national_id`),
  ADD KEY `idx_email` (`email`),
  ADD KEY `idx_phone` (`phone`),
  ADD KEY `idx_national_id` (`national_id`);

--
-- Indexes for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD PRIMARY KEY (`notification_id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_group_id` (`group_id`),
  ADD KEY `idx_notification_type` (`notification_type`),
  ADD KEY `idx_delivery_status` (`delivery_status`),
  ADD KEY `idx_notifications_user_type` (`user_id`,`notification_type`,`is_read`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `log_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `group_announcements`
--
ALTER TABLE `group_announcements`
  MODIFY `announcement_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_cycles`
--
ALTER TABLE `group_cycles`
  MODIFY `cycle_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_meetings`
--
ALTER TABLE `group_meetings`
  MODIFY `meeting_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_memberships`
--
ALTER TABLE `group_memberships`
  MODIFY `membership_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `group_roles`
--
ALTER TABLE `group_roles`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `ikimina_groups`
--
ALTER TABLE `ikimina_groups`
  MODIFY `group_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loans`
--
ALTER TABLE `loans`
  MODIFY `loan_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_applications`
--
ALTER TABLE `loan_applications`
  MODIFY `application_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_guarantors`
--
ALTER TABLE `loan_guarantors`
  MODIFY `guarantor_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  MODIFY `repayment_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `loan_repayment_schedule`
--
ALTER TABLE `loan_repayment_schedule`
  MODIFY `schedule_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  MODIFY `attendance_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_fines`
--
ALTER TABLE `member_fines`
  MODIFY `fine_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `member_savings`
--
ALTER TABLE `member_savings`
  MODIFY `savings_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification_templates`
--
ALTER TABLE `notification_templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `share_out_calculations`
--
ALTER TABLE `share_out_calculations`
  MODIFY `share_out_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `social_fund_requests`
--
ALTER TABLE `social_fund_requests`
  MODIFY `request_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_settings`
--
ALTER TABLE `system_settings`
  MODIFY `setting_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `transaction_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_addresses`
--
ALTER TABLE `user_addresses`
  MODIFY `address_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `user_notifications`
--
ALTER TABLE `user_notifications`
  MODIFY `notification_id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `audit_logs_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE SET NULL;

--
-- Constraints for table `chart_of_accounts`
--
ALTER TABLE `chart_of_accounts`
  ADD CONSTRAINT `chart_of_accounts_ibfk_1` FOREIGN KEY (`parent_account_id`) REFERENCES `chart_of_accounts` (`account_id`);

--
-- Constraints for table `group_announcements`
--
ALTER TABLE `group_announcements`
  ADD CONSTRAINT `group_announcements_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_announcements_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `group_cycles`
--
ALTER TABLE `group_cycles`
  ADD CONSTRAINT `group_cycles_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE;

--
-- Constraints for table `group_meetings`
--
ALTER TABLE `group_meetings`
  ADD CONSTRAINT `group_meetings_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_meetings_ibfk_2` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `group_memberships`
--
ALTER TABLE `group_memberships`
  ADD CONSTRAINT `group_memberships_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_memberships_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `group_memberships_ibfk_3` FOREIGN KEY (`role_id`) REFERENCES `group_roles` (`role_id`),
  ADD CONSTRAINT `group_memberships_ibfk_4` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `ikimina_groups`
--
ALTER TABLE `ikimina_groups`
  ADD CONSTRAINT `ikimina_groups_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loans`
--
ALTER TABLE `loans`
  ADD CONSTRAINT `loans_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `loan_applications` (`application_id`),
  ADD CONSTRAINT `loans_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_3` FOREIGN KEY (`borrower_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loans_ibfk_4` FOREIGN KEY (`disbursed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loan_applications`
--
ALTER TABLE `loan_applications`
  ADD CONSTRAINT `loan_applications_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_applications_ibfk_2` FOREIGN KEY (`applicant_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_applications_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loan_guarantors`
--
ALTER TABLE `loan_guarantors`
  ADD CONSTRAINT `loan_guarantors_ibfk_1` FOREIGN KEY (`application_id`) REFERENCES `loan_applications` (`application_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_guarantors_ibfk_2` FOREIGN KEY (`guarantor_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `loan_repayments`
--
ALTER TABLE `loan_repayments`
  ADD CONSTRAINT `loan_repayments_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `loan_repayments_ibfk_2` FOREIGN KEY (`schedule_id`) REFERENCES `loan_repayment_schedule` (`schedule_id`),
  ADD CONSTRAINT `loan_repayments_ibfk_3` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`),
  ADD CONSTRAINT `loan_repayments_ibfk_4` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `loan_repayment_schedule`
--
ALTER TABLE `loan_repayment_schedule`
  ADD CONSTRAINT `loan_repayment_schedule_ibfk_1` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`) ON DELETE CASCADE;

--
-- Constraints for table `meeting_attendance`
--
ALTER TABLE `meeting_attendance`
  ADD CONSTRAINT `meeting_attendance_ibfk_1` FOREIGN KEY (`meeting_id`) REFERENCES `group_meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_attendance_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `meeting_attendance_ibfk_3` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `member_fines`
--
ALTER TABLE `member_fines`
  ADD CONSTRAINT `member_fines_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `member_fines_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `member_fines_ibfk_3` FOREIGN KEY (`meeting_id`) REFERENCES `group_meetings` (`meeting_id`),
  ADD CONSTRAINT `member_fines_ibfk_4` FOREIGN KEY (`loan_id`) REFERENCES `loans` (`loan_id`),
  ADD CONSTRAINT `member_fines_ibfk_5` FOREIGN KEY (`waived_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `member_fines_ibfk_6` FOREIGN KEY (`imposed_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `member_fines_ibfk_7` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`);

--
-- Constraints for table `member_savings`
--
ALTER TABLE `member_savings`
  ADD CONSTRAINT `member_savings_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `member_savings_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `member_savings_ibfk_3` FOREIGN KEY (`meeting_id`) REFERENCES `group_meetings` (`meeting_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `member_savings_ibfk_4` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`);

--
-- Constraints for table `share_out_calculations`
--
ALTER TABLE `share_out_calculations`
  ADD CONSTRAINT `share_out_calculations_ibfk_1` FOREIGN KEY (`cycle_id`) REFERENCES `group_cycles` (`cycle_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_out_calculations_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `share_out_calculations_ibfk_3` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`);

--
-- Constraints for table `social_fund_requests`
--
ALTER TABLE `social_fund_requests`
  ADD CONSTRAINT `social_fund_requests_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_fund_requests_ibfk_2` FOREIGN KEY (`requester_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_fund_requests_ibfk_3` FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `social_fund_requests_ibfk_4` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`);

--
-- Constraints for table `system_settings`
--
ALTER TABLE `system_settings`
  ADD CONSTRAINT `system_settings_ibfk_1` FOREIGN KEY (`updated_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`meeting_id`) REFERENCES `group_meetings` (`meeting_id`),
  ADD CONSTRAINT `transactions_ibfk_4` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `transactions_ibfk_5` FOREIGN KEY (`approved_by`) REFERENCES `users` (`user_id`),
  ADD CONSTRAINT `transactions_ibfk_6` FOREIGN KEY (`reversed_by`) REFERENCES `users` (`user_id`);

--
-- Constraints for table `user_addresses`
--
ALTER TABLE `user_addresses`
  ADD CONSTRAINT `user_addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE;

--
-- Constraints for table `user_notifications`
--
ALTER TABLE `user_notifications`
  ADD CONSTRAINT `user_notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_notifications_ibfk_2` FOREIGN KEY (`group_id`) REFERENCES `ikimina_groups` (`group_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
