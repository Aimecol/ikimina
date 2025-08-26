// Member Dashboard JavaScript

// Sample data for demonstration
const memberData = {
    profile: {
        id: "KSG002",
        name: "Grace Uwimana",
        email: "grace.uwimana@email.com",
        phone: "+250 722 987 654",
        joinDate: "2024-01-20",
        membershipTier: "Regular",
        status: "Active"
    },
    financial: {
        totalSavings: 125000,
        activeLoanBalance: 75000,
        nextContributionDue: 15000,
        nextContributionDate: "2024-12-15",
        nextLoanPayment: 8750,
        nextLoanPaymentDate: "2024-12-15"
    },
    group: {
        name: "Kigali Savings Group",
        totalMembers: 25,
        groupFund: 2650000,
        meetingSchedule: "Every Sunday 2:00 PM",
        nextMeeting: "2024-12-15T14:00:00Z"
    },
    attendance: {
        rate: 92,
        meetingsAttended: 11,
        totalMeetings: 12,
        perfectAttendanceBonus: true
    }
};

const sampleTransactions = [
    {
        id: "TXN-2024-001245",
        date: "2024-12-08",
        type: "contribution",
        amount: 15000,
        description: "Monthly contribution",
        status: "completed",
        balance: 125000
    },
    {
        id: "TXN-2024-001198",
        date: "2024-11-15",
        type: "loan_payment",
        amount: -8750,
        description: "Loan payment",
        status: "completed",
        balance: 110000
    },
    {
        id: "TXN-2024-001156",
        date: "2024-11-08",
        type: "contribution",
        amount: 15000,
        description: "Monthly contribution",
        status: "completed",
        balance: 118750
    }
];

const sampleNotifications = [
    {
        id: 1,
        type: "payment_reminder",
        title: "Contribution Payment Due",
        message: "Your monthly contribution of 15,000 RWF is due on December 15th",
        timestamp: "2024-12-10T09:00:00Z",
        priority: "high",
        read: false
    },
    {
        id: 2,
        type: "meeting_reminder",
        title: "Weekly Meeting Tomorrow",
        message: "Don't forget about tomorrow's meeting at 2:00 PM",
        timestamp: "2024-12-14T18:00:00Z",
        priority: "medium",
        read: false
    },
    {
        id: 3,
        type: "loan_reminder",
        title: "Loan Payment Due",
        message: "Your loan payment of 8,750 RWF is due on December 15th",
        timestamp: "2024-12-10T09:00:00Z",
        priority: "high",
        read: false
    },
    {
        id: 4,
        type: "announcement",
        title: "Year-End Meeting Scheduled",
        message: "Annual meeting scheduled for December 31st at 2:00 PM",
        timestamp: "2024-12-09T10:00:00Z",
        priority: "low",
        read: true
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing member dashboard...');
    
    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing member dashboard...');
        
        // Refresh data functionality
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                refreshDashboardData();
            });
        }
        
        // Auto-refresh metrics every 30 seconds
        setInterval(updateDashboardMetrics, 30000);
        
        console.log('Member dashboard initialization complete');
    }
    
    // Navigation Management
    function initializeNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('.admin-section');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                
                const targetSection = this.getAttribute('data-section');
                
                // Update active nav link
                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');
                
                // Show target section
                sections.forEach(section => {
                    section.classList.remove('active');
                });
                
                const targetElement = document.getElementById(targetSection + '-section');
                if (targetElement) {
                    targetElement.classList.add('active');
                    
                    // Load section-specific data
                    loadSectionData(targetSection);
                }
            });
        });
        
        // Mobile sidebar toggle
        const sidebarToggle = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('adminSidebar');
        
        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', function() {
                sidebar.classList.toggle('open');
            });
            
            // Close sidebar when clicking outside on mobile
            document.addEventListener('click', function(e) {
                if (window.innerWidth <= 768 && 
                    !sidebar.contains(e.target) && 
                    !sidebarToggle.contains(e.target) && 
                    sidebar.classList.contains('open')) {
                    sidebar.classList.remove('open');
                }
            });
        }
    }
    
    // Notifications Management
    function initializeNotifications() {
        const notificationBtn = document.getElementById('notificationBtn');
        const userMenuBtn = document.getElementById('userMenuBtn');
        
        if (notificationBtn) {
            notificationBtn.addEventListener('click', function() {
                toggleNotificationDropdown();
            });
        }
        
        if (userMenuBtn) {
            userMenuBtn.addEventListener('click', function() {
                toggleUserMenu();
            });
        }
        
        // Update notification count
        updateNotificationCount();
    }
    
    // Modal Management
    function initializeModals() {
        // Close modals when clicking outside or on close button
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('admin-modal')) {
                closeModal();
            }
            if (e.target.classList.contains('admin-modal-close')) {
                closeModal();
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }
    
    // Dashboard Data Functions
    function refreshDashboardData() {
        const refreshBtn = document.getElementById('refreshData');
        const originalText = refreshBtn.innerHTML;
        
        refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
        refreshBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            updateDashboardMetrics();
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            showNotification('Dashboard data refreshed successfully', 'success');
        }, 2000);
    }
    
    function updateDashboardMetrics() {
        // Simulate real-time metric updates
        const summaryValues = document.querySelectorAll('.summary-value');
        summaryValues.forEach((element) => {
            // Add subtle animation
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    function updateNotificationCount() {
        const unreadCount = sampleNotifications.filter(n => !n.read).length;
        const notificationCount = document.querySelector('.notification-count');
        if (notificationCount) {
            notificationCount.textContent = unreadCount;
            notificationCount.style.display = unreadCount > 0 ? 'block' : 'none';
        }
        
        // Update nav badge
        const navBadge = document.querySelector('.nav-link[data-section="notifications"] .nav-badge');
        if (navBadge) {
            navBadge.textContent = unreadCount;
            navBadge.style.display = unreadCount > 0 ? 'inline' : 'none';
        }
    }
    
    // Section Data Loading
    function loadSectionData(section) {
        switch (section) {
            case 'savings':
                loadSavingsSection();
                break;
            case 'loans':
                loadLoansSection();
                break;
            case 'contributions':
                loadContributionsSection();
                break;
            case 'meetings':
                loadMeetingsSection();
                break;
            case 'transactions':
                loadTransactionsSection();
                break;
            case 'notifications':
                loadNotificationsSection();
                break;
            case 'profile':
                loadProfileSection();
                break;
        }
    }
    
    // Placeholder functions for section loading
    function loadSavingsSection() {
        console.log('Loading savings section...');
    }
    
    function loadLoansSection() {
        console.log('Loading loans section...');
    }
    
    function loadContributionsSection() {
        console.log('Loading contributions section...');
    }
    
    function loadMeetingsSection() {
        console.log('Loading meetings section...');
    }
    
    function loadTransactionsSection() {
        console.log('Loading transactions section...');
    }
    
    function loadNotificationsSection() {
        console.log('Loading notifications section...');

        // Initialize notification search
        const searchInput = document.getElementById('notificationSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                filterNotifications();
            });
        }

        // Initialize notification filters
        const notificationFilter = document.getElementById('notificationFilter');
        const priorityFilter = document.getElementById('priorityFilter');

        if (notificationFilter) {
            notificationFilter.addEventListener('change', function() {
                filterNotifications();
            });
        }

        if (priorityFilter) {
            priorityFilter.addEventListener('change', function() {
                filterNotifications();
            });
        }

        // Update notification counts
        updateNotificationCounts();
    }

    function loadProfileSection() {
        console.log('Loading profile section...');

        // Initialize profile editing functionality
        initializeProfileEditing();

        // Load profile data
        loadProfileData();
    }
    
    // Utility Functions
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-RW', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount) + ' RWF';
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    // Global functions for button actions
    window.openModal = function(modalType) {
        switch (modalType) {
            case 'makeContributionModal':
                showMakeContributionModal();
                break;
            case 'applyLoanModal':
                showApplyLoanModal();
                break;
            case 'loanPaymentModal':
                showLoanPaymentModal();
                break;
            case 'viewStatementsModal':
                showViewStatementsModal();
                break;
            case 'contactGroupModal':
                showContactGroupModal();
                break;
            case 'updateProfileModal':
                showUpdateProfileModal();
                break;
            case 'notificationSettingsModal':
                showNotificationSettingsModal();
                break;
            case 'changePasswordModal':
                showChangePasswordModal();
                break;
            case 'uploadPhotoModal':
                showUploadPhotoModal();
                break;
            case 'privacySettingsModal':
                showPrivacySettingsModal();
                break;
            case 'dataSharingModal':
                showDataSharingModal();
                break;
        }
    };
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    // Modal Functions
    function showMakeContributionModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Make Contribution</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="contribution-details">
                            <h4>Contribution Details</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Contribution Type</label>
                                    <select id="contributionType">
                                        <option value="regular">Regular Monthly Contribution</option>
                                        <option value="additional">Additional Contribution</option>
                                        <option value="penalty">Penalty Payment</option>
                                        <option value="social">Social Fund Contribution</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Amount (RWF)</label>
                                    <input type="number" id="contributionAmount" value="15000" min="1000">
                                </div>
                            </div>
                        </div>

                        <div class="payment-method-selection">
                            <h4>Payment Method</h4>
                            <div class="payment-methods">
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="mobile_money" checked>
                                    <div class="method-card">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Mobile Money</span>
                                        <small>MTN MoMo, Airtel Money</small>
                                    </div>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="bank_transfer">
                                    <div class="method-card">
                                        <i class="fas fa-university"></i>
                                        <span>Bank Transfer</span>
                                        <small>Direct bank transfer</small>
                                    </div>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="paymentMethod" value="cash">
                                    <div class="method-card">
                                        <i class="fas fa-money-bill-wave"></i>
                                        <span>Cash Payment</span>
                                        <small>Pay at meeting</small>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="payment-summary">
                            <h4>Payment Summary</h4>
                            <div class="summary-items">
                                <div class="summary-item">
                                    <span>Contribution Amount:</span>
                                    <span>15,000 RWF</span>
                                </div>
                                <div class="summary-item">
                                    <span>Processing Fee:</span>
                                    <span>0 RWF</span>
                                </div>
                                <div class="summary-item total">
                                    <span>Total Amount:</span>
                                    <span>15,000 RWF</span>
                                </div>
                            </div>
                        </div>

                        <div class="payment-confirmation">
                            <label class="confirmation-checkbox">
                                <input type="checkbox" id="confirmPayment">
                                <span>I confirm that the payment details are correct and authorize this transaction</span>
                            </label>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="saveDraftContribution()">Save as Draft</button>
                        <button class="btn-primary" onclick="processContribution()">Process Payment</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showApplyLoanModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content large-modal">
                    <div class="admin-modal-header">
                        <h3>Apply for Loan</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="loan-eligibility-check">
                            <h4>Eligibility Check</h4>
                            <div class="eligibility-status">
                                <div class="status-item eligible">
                                    <i class="fas fa-check-circle"></i>
                                    <span>You are eligible for a loan up to 100,000 RWF</span>
                                </div>
                                <div class="eligibility-details">
                                    <span>Based on your savings balance: 125,000 RWF</span>
                                    <span>Maximum loan ratio: 80%</span>
                                </div>
                            </div>
                        </div>

                        <div class="loan-application-form">
                            <h4>Loan Application Details</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Loan Amount (RWF)</label>
                                    <input type="number" id="loanAmount" max="100000" min="10000" placeholder="Enter amount">
                                </div>
                                <div class="form-group">
                                    <label>Loan Purpose</label>
                                    <select id="loanPurpose">
                                        <option value="">Select purpose</option>
                                        <option value="business">Business Investment</option>
                                        <option value="education">Education</option>
                                        <option value="medical">Medical Emergency</option>
                                        <option value="agriculture">Agriculture</option>
                                        <option value="housing">Housing Improvement</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Repayment Period (Months)</label>
                                    <select id="repaymentPeriod">
                                        <option value="3">3 Months</option>
                                        <option value="6">6 Months</option>
                                        <option value="9">9 Months</option>
                                        <option value="12">12 Months</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Interest Rate</label>
                                    <input type="text" value="5% per month" readonly>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Loan Purpose Description</label>
                                <textarea id="loanDescription" rows="3" placeholder="Provide detailed description of how you plan to use the loan..."></textarea>
                            </div>

                            <div class="form-group">
                                <label>Guarantors</label>
                                <div class="guarantor-selection">
                                    <select id="guarantor1">
                                        <option value="">Select first guarantor</option>
                                        <option value="member1">John Mukamana</option>
                                        <option value="member2">Marie Uwimana</option>
                                        <option value="member3">Paul Nkurunziza</option>
                                    </select>
                                    <select id="guarantor2">
                                        <option value="">Select second guarantor</option>
                                        <option value="member1">John Mukamana</option>
                                        <option value="member2">Marie Uwimana</option>
                                        <option value="member3">Paul Nkurunziza</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="loan-calculator">
                            <h4>Loan Calculator</h4>
                            <div class="calculator-results">
                                <div class="calc-item">
                                    <span>Monthly Payment:</span>
                                    <span id="monthlyPayment">-</span>
                                </div>
                                <div class="calc-item">
                                    <span>Total Interest:</span>
                                    <span id="totalInterest">-</span>
                                </div>
                                <div class="calc-item">
                                    <span>Total Repayment:</span>
                                    <span id="totalRepayment">-</span>
                                </div>
                            </div>
                        </div>

                        <div class="loan-terms">
                            <h4>Terms and Conditions</h4>
                            <div class="terms-content">
                                <ul>
                                    <li>Loan must be repaid according to the agreed schedule</li>
                                    <li>Late payments will incur additional penalties</li>
                                    <li>Guarantors are responsible if borrower defaults</li>
                                    <li>Loan approval is subject to group committee decision</li>
                                </ul>
                            </div>
                            <label class="terms-checkbox">
                                <input type="checkbox" id="acceptTerms">
                                <span>I have read and accept the terms and conditions</span>
                            </label>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="saveDraftLoan()">Save as Draft</button>
                        <button class="btn-primary" onclick="submitLoanApplication()">Submit Application</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showLoanPaymentModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Make Loan Payment</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="loan-details">
                            <h4>Loan Details</h4>
                            <div class="loan-info">
                                <div class="info-item">
                                    <span>Loan ID:</span>
                                    <span>LN-2024-0156</span>
                                </div>
                                <div class="info-item">
                                    <span>Outstanding Balance:</span>
                                    <span>75,000 RWF</span>
                                </div>
                                <div class="info-item">
                                    <span>Next Payment Due:</span>
                                    <span>Dec 15, 2024</span>
                                </div>
                                <div class="info-item">
                                    <span>Monthly Payment:</span>
                                    <span>8,750 RWF</span>
                                </div>
                            </div>
                        </div>

                        <div class="payment-options">
                            <h4>Payment Options</h4>
                            <div class="payment-types">
                                <label class="payment-type">
                                    <input type="radio" name="paymentType" value="regular" checked>
                                    <span>Regular Payment (8,750 RWF)</span>
                                </label>
                                <label class="payment-type">
                                    <input type="radio" name="paymentType" value="partial">
                                    <span>Partial Payment</span>
                                </label>
                                <label class="payment-type">
                                    <input type="radio" name="paymentType" value="full">
                                    <span>Full Payment (75,000 RWF)</span>
                                </label>
                                <label class="payment-type">
                                    <input type="radio" name="paymentType" value="custom">
                                    <span>Custom Amount</span>
                                </label>
                            </div>

                            <div class="custom-amount" style="display: none;">
                                <label>Custom Payment Amount (RWF)</label>
                                <input type="number" id="customPaymentAmount" min="1000" max="75000">
                            </div>
                        </div>

                        <div class="payment-method-selection">
                            <h4>Payment Method</h4>
                            <div class="payment-methods">
                                <label class="payment-method">
                                    <input type="radio" name="loanPaymentMethod" value="mobile_money" checked>
                                    <div class="method-card">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Mobile Money</span>
                                        <small>Instant payment</small>
                                    </div>
                                </label>
                                <label class="payment-method">
                                    <input type="radio" name="loanPaymentMethod" value="bank_transfer">
                                    <div class="method-card">
                                        <i class="fas fa-university"></i>
                                        <span>Bank Transfer</span>
                                        <small>1-2 business days</small>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div class="payment-summary">
                            <h4>Payment Summary</h4>
                            <div class="summary-items">
                                <div class="summary-item">
                                    <span>Payment Amount:</span>
                                    <span id="paymentAmount">8,750 RWF</span>
                                </div>
                                <div class="summary-item">
                                    <span>Processing Fee:</span>
                                    <span>0 RWF</span>
                                </div>
                                <div class="summary-item">
                                    <span>Remaining Balance:</span>
                                    <span id="remainingBalance">66,250 RWF</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="scheduleLoanPayment()">Schedule Payment</button>
                        <button class="btn-primary" onclick="processLoanPayment()">Process Payment</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showViewStatementsModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>View Statements</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="statement-options">
                            <h4>Statement Type</h4>
                            <div class="statement-types">
                                <label class="statement-type">
                                    <input type="radio" name="statementType" value="savings" checked>
                                    <span>Savings Statement</span>
                                </label>
                                <label class="statement-type">
                                    <input type="radio" name="statementType" value="loans">
                                    <span>Loan Statement</span>
                                </label>
                                <label class="statement-type">
                                    <input type="radio" name="statementType" value="transactions">
                                    <span>Transaction History</span>
                                </label>
                                <label class="statement-type">
                                    <input type="radio" name="statementType" value="comprehensive">
                                    <span>Comprehensive Statement</span>
                                </label>
                            </div>
                        </div>

                        <div class="date-range">
                            <h4>Date Range</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>From Date</label>
                                    <input type="date" id="statementFromDate" value="2024-01-01">
                                </div>
                                <div class="form-group">
                                    <label>To Date</label>
                                    <input type="date" id="statementToDate" value="2024-12-10">
                                </div>
                            </div>
                        </div>

                        <div class="format-options">
                            <h4>Format</h4>
                            <div class="format-types">
                                <label class="format-type">
                                    <input type="radio" name="formatType" value="pdf" checked>
                                    <span>PDF Document</span>
                                </label>
                                <label class="format-type">
                                    <input type="radio" name="formatType" value="excel">
                                    <span>Excel Spreadsheet</span>
                                </label>
                                <label class="format-type">
                                    <input type="radio" name="formatType" value="email">
                                    <span>Email Summary</span>
                                </label>
                            </div>
                        </div>

                        <div class="delivery-options">
                            <h4>Delivery Method</h4>
                            <div class="delivery-methods">
                                <label class="delivery-method">
                                    <input type="checkbox" checked>
                                    <span>Download immediately</span>
                                </label>
                                <label class="delivery-method">
                                    <input type="checkbox">
                                    <span>Send to email: grace.uwimana@email.com</span>
                                </label>
                                <label class="delivery-method">
                                    <input type="checkbox">
                                    <span>Send via SMS link</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="previewStatement()">Preview</button>
                        <button class="btn-primary" onclick="generateStatement()">Generate Statement</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showContactGroupModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Contact Group</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="contact-options">
                            <h4>Who would you like to contact?</h4>
                            <div class="contact-types">
                                <label class="contact-type">
                                    <input type="radio" name="contactType" value="treasurer" checked>
                                    <span>Treasurer</span>
                                </label>
                                <label class="contact-type">
                                    <input type="radio" name="contactType" value="secretary">
                                    <span>Secretary</span>
                                </label>
                                <label class="contact-type">
                                    <input type="radio" name="contactType" value="admin">
                                    <span>Group Admin</span>
                                </label>
                                <label class="contact-type">
                                    <input type="radio" name="contactType" value="all_officers">
                                    <span>All Officers</span>
                                </label>
                                <label class="contact-type">
                                    <input type="radio" name="contactType" value="all_members">
                                    <span>All Members</span>
                                </label>
                            </div>
                        </div>

                        <div class="message-type">
                            <h4>Message Type</h4>
                            <div class="message-categories">
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="inquiry" checked>
                                    <span>General Inquiry</span>
                                </label>
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="payment_issue">
                                    <span>Payment Issue</span>
                                </label>
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="loan_inquiry">
                                    <span>Loan Inquiry</span>
                                </label>
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="meeting_issue">
                                    <span>Meeting Issue</span>
                                </label>
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="complaint">
                                    <span>Complaint</span>
                                </label>
                                <label class="message-category">
                                    <input type="radio" name="messageCategory" value="suggestion">
                                    <span>Suggestion</span>
                                </label>
                            </div>
                        </div>

                        <div class="message-content">
                            <h4>Message</h4>
                            <div class="form-group">
                                <label>Subject</label>
                                <input type="text" id="messageSubject" placeholder="Enter message subject">
                            </div>
                            <div class="form-group">
                                <label>Message</label>
                                <textarea id="messageContent" rows="5" placeholder="Type your message here..."></textarea>
                            </div>
                        </div>

                        <div class="contact-preferences">
                            <h4>Contact Method</h4>
                            <div class="contact-methods">
                                <label class="contact-method">
                                    <input type="checkbox" checked>
                                    <span>In-app message</span>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox">
                                    <span>SMS notification</span>
                                </label>
                                <label class="contact-method">
                                    <input type="checkbox">
                                    <span>Email notification</span>
                                </label>
                            </div>
                        </div>

                        <div class="urgency-level">
                            <h4>Urgency Level</h4>
                            <select id="urgencyLevel">
                                <option value="low">Low - Response within 3 days</option>
                                <option value="normal" selected>Normal - Response within 1 day</option>
                                <option value="high">High - Response within 4 hours</option>
                                <option value="urgent">Urgent - Immediate response needed</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="saveDraftMessage()">Save as Draft</button>
                        <button class="btn-primary" onclick="sendMessage()">Send Message</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showUpdateProfileModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Update Profile</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="profile-sections">
                            <div class="profile-section">
                                <h4>Personal Information</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Full Name</label>
                                        <input type="text" id="fullName" value="Grace Uwimana">
                                    </div>
                                    <div class="form-group">
                                        <label>Email Address</label>
                                        <input type="email" id="emailAddress" value="grace.uwimana@email.com">
                                    </div>
                                </div>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Phone Number</label>
                                        <input type="tel" id="phoneNumber" value="+250 722 987 654">
                                    </div>
                                    <div class="form-group">
                                        <label>Date of Birth</label>
                                        <input type="date" id="dateOfBirth" value="1990-05-15">
                                    </div>
                                </div>
                            </div>

                            <div class="profile-section">
                                <h4>Address Information</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Province</label>
                                        <select id="province">
                                            <option value="kigali" selected>Kigali City</option>
                                            <option value="northern">Northern Province</option>
                                            <option value="southern">Southern Province</option>
                                            <option value="eastern">Eastern Province</option>
                                            <option value="western">Western Province</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>District</label>
                                        <select id="district">
                                            <option value="gasabo" selected>Gasabo</option>
                                            <option value="kicukiro">Kicukiro</option>
                                            <option value="nyarugenge">Nyarugenge</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Sector</label>
                                    <input type="text" id="sector" value="Kimironko">
                                </div>
                                <div class="form-group">
                                    <label>Cell</label>
                                    <input type="text" id="cell" value="Biryogo">
                                </div>
                            </div>

                            <div class="profile-section">
                                <h4>Emergency Contact</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Emergency Contact Name</label>
                                        <input type="text" id="emergencyName" value="John Uwimana">
                                    </div>
                                    <div class="form-group">
                                        <label>Relationship</label>
                                        <select id="emergencyRelationship">
                                            <option value="spouse" selected>Spouse</option>
                                            <option value="parent">Parent</option>
                                            <option value="sibling">Sibling</option>
                                            <option value="child">Child</option>
                                            <option value="friend">Friend</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Emergency Contact Phone</label>
                                    <input type="tel" id="emergencyPhone" value="+250 788 123 456">
                                </div>
                            </div>

                            <div class="profile-section">
                                <h4>Notification Preferences</h4>
                                <div class="notification-preferences">
                                    <label class="notification-pref">
                                        <input type="checkbox" checked>
                                        <span>Meeting reminders</span>
                                    </label>
                                    <label class="notification-pref">
                                        <input type="checkbox" checked>
                                        <span>Payment due notifications</span>
                                    </label>
                                    <label class="notification-pref">
                                        <input type="checkbox" checked>
                                        <span>Loan status updates</span>
                                    </label>
                                    <label class="notification-pref">
                                        <input type="checkbox">
                                        <span>Group announcements</span>
                                    </label>
                                    <label class="notification-pref">
                                        <input type="checkbox">
                                        <span>Monthly statements</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="resetProfile()">Reset Changes</button>
                        <button class="btn-primary" onclick="saveProfile()">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Action Functions
    window.processContribution = function() {
        const amount = document.getElementById('contributionAmount').value;
        const method = document.querySelector('input[name="paymentMethod"]:checked').value;
        const confirmed = document.getElementById('confirmPayment').checked;

        if (!confirmed) {
            showNotification('Please confirm the payment details before proceeding', 'warning');
            return;
        }

        showNotification(`Processing contribution of ${formatCurrency(amount)} via ${method}...`, 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Contribution processed successfully!', 'success');
            updateDashboardMetrics();
        }, 3000);
    };

    window.saveDraftContribution = function() {
        showNotification('Contribution saved as draft', 'success');
        closeModal();
    };

    window.submitLoanApplication = function() {
        const amount = document.getElementById('loanAmount').value;
        const purpose = document.getElementById('loanPurpose').value;
        const terms = document.getElementById('acceptTerms').checked;

        if (!amount || !purpose) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }

        if (!terms) {
            showNotification('Please accept the terms and conditions', 'warning');
            return;
        }

        showNotification(`Submitting loan application for ${formatCurrency(amount)}...`, 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Loan application submitted successfully! You will be notified of the decision.', 'success');
            updateDashboardMetrics();
        }, 2000);
    };

    window.saveDraftLoan = function() {
        showNotification('Loan application saved as draft', 'success');
        closeModal();
    };

    window.processLoanPayment = function() {
        const paymentType = document.querySelector('input[name="paymentType"]:checked').value;
        const method = document.querySelector('input[name="loanPaymentMethod"]:checked').value;

        showNotification(`Processing loan payment via ${method}...`, 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Loan payment processed successfully!', 'success');
            updateDashboardMetrics();
        }, 3000);
    };

    window.scheduleLoanPayment = function() {
        showNotification('Loan payment scheduled successfully', 'success');
        closeModal();
    };

    window.generateStatement = function() {
        const type = document.querySelector('input[name="statementType"]:checked').value;
        const format = document.querySelector('input[name="formatType"]:checked').value;

        showNotification(`Generating ${type} statement in ${format} format...`, 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Statement generated successfully!', 'success');
        }, 2000);
    };

    window.previewStatement = function() {
        showNotification('Statement preview will open in a new window', 'info');
    };

    window.sendMessage = function() {
        const subject = document.getElementById('messageSubject').value;
        const content = document.getElementById('messageContent').value;

        if (!subject || !content) {
            showNotification('Please fill in subject and message', 'warning');
            return;
        }

        showNotification('Sending message...', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Message sent successfully!', 'success');
        }, 1500);
    };

    window.saveDraftMessage = function() {
        showNotification('Message saved as draft', 'success');
        closeModal();
    };

    window.saveProfile = function() {
        showNotification('Saving profile changes...', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Profile updated successfully!', 'success');
        }, 1500);
    };

    window.resetProfile = function() {
        showNotification('Profile changes reset', 'info');
    };

    // Notification Functions
    window.markAllAsRead = function() {
        const unreadNotifications = document.querySelectorAll('.notification-item.unread');
        unreadNotifications.forEach(notification => {
            notification.classList.remove('unread');
            notification.classList.add('read');
            const statusIndicator = notification.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.classList.remove('unread');
                statusIndicator.classList.add('read');
            }
        });

        updateNotificationCount();
        showNotification('All notifications marked as read', 'success');
    };

    window.selectAllNotifications = function() {
        const checkboxes = document.querySelectorAll('.notification-select');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);

        checkboxes.forEach(checkbox => {
            checkbox.checked = !allChecked;
        });

        const button = event.target;
        button.innerHTML = allChecked ?
            '<i class="fas fa-check-square"></i> Select All' :
            '<i class="fas fa-square"></i> Deselect All';
    };

    window.markSelectedAsRead = function() {
        const selectedCheckboxes = document.querySelectorAll('.notification-select:checked');
        let count = 0;

        selectedCheckboxes.forEach(checkbox => {
            const notificationItem = checkbox.closest('.notification-item');
            if (notificationItem && notificationItem.classList.contains('unread')) {
                notificationItem.classList.remove('unread');
                notificationItem.classList.add('read');
                const statusIndicator = notificationItem.querySelector('.status-indicator');
                if (statusIndicator) {
                    statusIndicator.classList.remove('unread');
                    statusIndicator.classList.add('read');
                }
                count++;
            }
        });

        if (count > 0) {
            updateNotificationCount();
            showNotification(`${count} notifications marked as read`, 'success');
        } else {
            showNotification('No unread notifications selected', 'info');
        }
    };

    window.deleteSelectedNotifications = function() {
        const selectedCheckboxes = document.querySelectorAll('.notification-select:checked');

        if (selectedCheckboxes.length === 0) {
            showNotification('No notifications selected', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete ${selectedCheckboxes.length} notifications?`)) {
            selectedCheckboxes.forEach(checkbox => {
                const notificationItem = checkbox.closest('.notification-item');
                if (notificationItem) {
                    notificationItem.remove();
                }
            });

            updateNotificationCount();
            showNotification(`${selectedCheckboxes.length} notifications deleted`, 'success');
        }
    };

    window.markAsRead = function(notificationId) {
        const notificationItem = document.querySelector(`[data-id="${notificationId}"]`);
        if (notificationItem) {
            notificationItem.classList.remove('unread');
            notificationItem.classList.add('read');
            const statusIndicator = notificationItem.querySelector('.status-indicator');
            if (statusIndicator) {
                statusIndicator.classList.remove('unread');
                statusIndicator.classList.add('read');
            }
            updateNotificationCount();
            showNotification('Notification marked as read', 'success');
        }
    };

    function filterNotifications() {
        const searchTerm = document.getElementById('notificationSearch')?.value.toLowerCase() || '';
        const typeFilter = document.getElementById('notificationFilter')?.value || 'all';
        const priorityFilter = document.getElementById('priorityFilter')?.value || 'all';

        const notifications = document.querySelectorAll('.notification-item');

        notifications.forEach(notification => {
            const title = notification.querySelector('h4')?.textContent.toLowerCase() || '';
            const content = notification.querySelector('p')?.textContent.toLowerCase() || '';
            const notificationIcon = notification.querySelector('.notification-icon');
            const priority = notification.querySelector('.notification-priority')?.textContent.toLowerCase() || '';

            let typeMatch = true;
            if (typeFilter !== 'all') {
                if (typeFilter === 'unread') {
                    typeMatch = notification.classList.contains('unread');
                } else if (typeFilter === 'read') {
                    typeMatch = notification.classList.contains('read');
                } else {
                    typeMatch = notificationIcon?.classList.contains(typeFilter.replace('_', '-')) || false;
                }
            }

            let priorityMatch = true;
            if (priorityFilter !== 'all') {
                priorityMatch = priority.includes(priorityFilter);
            }

            const searchMatch = searchTerm === '' ||
                title.includes(searchTerm) ||
                content.includes(searchTerm);

            if (typeMatch && priorityMatch && searchMatch) {
                notification.style.display = 'flex';
            } else {
                notification.style.display = 'none';
            }
        });
    }

    function updateNotificationCounts() {
        const totalNotifications = document.querySelectorAll('.notification-item').length;
        const unreadNotifications = document.querySelectorAll('.notification-item.unread').length;
        const highPriorityNotifications = document.querySelectorAll('.notification-item.high-priority').length;
        const recentNotifications = 3; // Simulated

        // Update summary cards
        const totalCard = document.querySelector('.total-notifications .summary-value');
        const unreadCard = document.querySelector('.unread-notifications .summary-value');
        const highPriorityCard = document.querySelector('.high-priority .summary-value');
        const recentCard = document.querySelector('.recent-activity .summary-value');

        if (totalCard) totalCard.textContent = totalNotifications;
        if (unreadCard) unreadCard.textContent = unreadNotifications;
        if (highPriorityCard) highPriorityCard.textContent = highPriorityNotifications;
        if (recentCard) recentCard.textContent = recentNotifications;

        // Update category counts
        const paymentCount = document.querySelector('.payment-reminders .category-count');
        const meetingCount = document.querySelector('.meeting-alerts .category-count');
        const loanCount = document.querySelector('.loan-updates .category-count');
        const announcementCount = document.querySelector('.announcements .category-count');

        if (paymentCount) paymentCount.textContent = '2 unread';
        if (meetingCount) meetingCount.textContent = '1 unread';
        if (loanCount) loanCount.textContent = '1 unread';
        if (announcementCount) announcementCount.textContent = 'All read';
    }

    // Profile Functions
    window.exportProfileData = function() {
        showNotification('Preparing profile data export...', 'info');

        setTimeout(() => {
            showNotification('Profile data exported successfully', 'success');
        }, 2000);
    };

    window.editSection = function(sectionType) {
        switch (sectionType) {
            case 'personal':
                openModal('editPersonalInfoModal');
                break;
            case 'contact':
                openModal('editContactInfoModal');
                break;
            case 'address':
                openModal('editAddressInfoModal');
                break;
            case 'emergency':
                openModal('editEmergencyContactModal');
                break;
            case 'notifications':
                openModal('editNotificationPreferencesModal');
                break;
            default:
                showNotification(`Edit ${sectionType} section`, 'info');
        }
    };

    window.viewMembershipHistory = function() {
        showNotification('Membership history will be displayed', 'info');
    };

    window.setup2FA = function() {
        showNotification('Two-factor authentication setup will begin', 'info');
    };

    window.viewLoginActivity = function() {
        showNotification('Login activity will be displayed', 'info');
    };

    function initializeProfileEditing() {
        // Initialize profile photo upload
        const photoUploadBtn = document.querySelector('.photo-upload-btn');
        if (photoUploadBtn) {
            photoUploadBtn.addEventListener('click', function() {
                showNotification('Photo upload functionality would be implemented here', 'info');
            });
        }
    }

    function loadProfileData() {
        // Simulate loading profile data
        console.log('Loading profile data...');

        // Update profile statistics
        updateProfileStats();
    }

    function updateProfileStats() {
        // Update membership statistics with current data
        const membershipDuration = document.querySelector('.stat-card .stat-content .stat-value');
        if (membershipDuration && membershipDuration.textContent === '11 months') {
            // Statistics are already up to date
            console.log('Profile statistics updated');
        }
    }

    // Additional Modal Functions
    function showNotificationSettingsModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Notification Settings</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="notification-settings">
                            <div class="settings-section">
                                <h4>Delivery Methods</h4>
                                <div class="delivery-methods">
                                    <label class="delivery-method">
                                        <input type="checkbox" checked>
                                        <span>In-app notifications</span>
                                    </label>
                                    <label class="delivery-method">
                                        <input type="checkbox" checked>
                                        <span>SMS notifications</span>
                                    </label>
                                    <label class="delivery-method">
                                        <input type="checkbox">
                                        <span>Email notifications</span>
                                    </label>
                                    <label class="delivery-method">
                                        <input type="checkbox">
                                        <span>WhatsApp notifications</span>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-section">
                                <h4>Notification Frequency</h4>
                                <div class="frequency-options">
                                    <label class="frequency-option">
                                        <input type="radio" name="frequency" value="immediate" checked>
                                        <span>Immediate</span>
                                    </label>
                                    <label class="frequency-option">
                                        <input type="radio" name="frequency" value="daily">
                                        <span>Daily digest</span>
                                    </label>
                                    <label class="frequency-option">
                                        <input type="radio" name="frequency" value="weekly">
                                        <span>Weekly summary</span>
                                    </label>
                                </div>
                            </div>

                            <div class="settings-section">
                                <h4>Quiet Hours</h4>
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Start Time</label>
                                        <input type="time" value="22:00">
                                    </div>
                                    <div class="form-group">
                                        <label>End Time</label>
                                        <input type="time" value="07:00">
                                    </div>
                                </div>
                                <label class="quiet-hours-option">
                                    <input type="checkbox" checked>
                                    <span>Enable quiet hours (no notifications during this time)</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="resetNotificationSettings()">Reset to Default</button>
                        <button class="btn-primary" onclick="saveNotificationSettings()">Save Settings</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showChangePasswordModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Change Password</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="password-form">
                            <div class="form-group">
                                <label>Current Password</label>
                                <input type="password" id="currentPassword" placeholder="Enter current password">
                            </div>

                            <div class="form-group">
                                <label>New Password</label>
                                <input type="password" id="newPassword" placeholder="Enter new password">
                                <div class="password-requirements">
                                    <p>Password must contain:</p>
                                    <ul>
                                        <li>At least 8 characters</li>
                                        <li>One uppercase letter</li>
                                        <li>One lowercase letter</li>
                                        <li>One number</li>
                                        <li>One special character</li>
                                    </ul>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Confirm New Password</label>
                                <input type="password" id="confirmPassword" placeholder="Confirm new password">
                            </div>

                            <div class="security-options">
                                <label class="security-option">
                                    <input type="checkbox">
                                    <span>Log out of all other devices after password change</span>
                                </label>
                                <label class="security-option">
                                    <input type="checkbox" checked>
                                    <span>Send email confirmation of password change</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="changePassword()">Change Password</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showUploadPhotoModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Upload Profile Photo</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="photo-upload">
                            <div class="upload-area">
                                <div class="upload-placeholder">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag and drop your photo here or click to browse</p>
                                    <input type="file" id="photoFile" accept="image/*" style="display: none;">
                                    <button class="btn-outline" onclick="document.getElementById('photoFile').click()">
                                        Choose File
                                    </button>
                                </div>
                            </div>

                            <div class="upload-requirements">
                                <h4>Photo Requirements</h4>
                                <ul>
                                    <li>Maximum file size: 5MB</li>
                                    <li>Supported formats: JPG, PNG, GIF</li>
                                    <li>Recommended size: 400x400 pixels</li>
                                    <li>Square photos work best</li>
                                </ul>
                            </div>

                            <div class="photo-preview" style="display: none;">
                                <h4>Preview</h4>
                                <div class="preview-container">
                                    <img id="photoPreview" src="" alt="Photo preview">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="removePhoto()">Remove Current Photo</button>
                        <button class="btn-primary" onclick="uploadPhoto()">Upload Photo</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showPrivacySettingsModal() {
        showNotification('Privacy settings modal would open here', 'info');
    }

    function showDataSharingModal() {
        showNotification('Data sharing settings modal would open here', 'info');
    }

    // Additional Action Functions
    window.saveNotificationSettings = function() {
        showNotification('Notification settings saved successfully', 'success');
        closeModal();
    };

    window.resetNotificationSettings = function() {
        showNotification('Notification settings reset to default', 'info');
    };

    window.changePassword = function() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all password fields', 'warning');
            return;
        }

        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'warning');
            return;
        }

        showNotification('Changing password...', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Password changed successfully', 'success');
        }, 2000);
    };

    window.uploadPhoto = function() {
        showNotification('Photo upload functionality would be implemented here', 'info');
        closeModal();
    };

    window.removePhoto = function() {
        if (confirm('Are you sure you want to remove your current profile photo?')) {
            showNotification('Profile photo removed', 'success');
            closeModal();
        }
    };

    // Notification dropdown functions
    function toggleNotificationDropdown() {
        console.log('Toggle notification dropdown');
    }

    function toggleUserMenu() {
        console.log('Toggle user menu');
    }

    console.log('Member Dashboard initialized successfully');
});
