// Auditor Dashboard JavaScript

// Sample data for demonstration - declared at the top to avoid reference errors
const sampleAuditData = {
    balances: {
        cashOnHand: 450000,
        bankAccount: 2200000,
        mobileMoneyAccount: 0,
        saccoAccount: 0,
        totalAssets: 2650000
    },
    loans: {
        totalOutstanding: 1200000,
        activeLoans: 8,
        overdueLoans: 2,
        averageInterestRate: 5.0
    },
    savings: {
        memberSavings: 1300000,
        socialFund: 150000,
        totalSavings: 1450000
    },
    compliance: {
        score: 98,
        criticalIssues: 0,
        minorIssues: 2,
        lastAuditDate: "2024-12-08"
    },
    riskLevel: "Low",
    financialHealthScore: 94
};

const sampleTransactions = [
    {
        id: "TXN-2024-001234",
        date: "2024-12-10",
        type: "withdrawal",
        amount: 500000,
        member: "Grace Uwimana",
        description: "Large cash withdrawal",
        status: "flagged",
        flagReason: "Amount exceeds daily limit",
        verificationRequired: true
    },
    {
        id: "TXN-2024-001235",
        date: "2024-12-10",
        type: "contribution",
        amount: 15000,
        member: "Marie Mukamana",
        description: "Monthly contribution",
        status: "verified",
        flagReason: null,
        verificationRequired: false
    },
    {
        id: "TXN-2024-001236",
        date: "2024-12-09",
        type: "loan_disbursement",
        amount: 200000,
        member: "Paul Nkurunziza",
        description: "Business loan disbursement",
        status: "verified",
        flagReason: null,
        verificationRequired: false
    }
];

const sampleAuditAlerts = [
    {
        id: 1,
        type: "transaction_review",
        priority: "high",
        title: "Large Cash Withdrawal Detected",
        description: "Withdrawal of 500,000 RWF requires audit verification",
        timestamp: "2024-12-10T12:30:00Z",
        source: "Transaction ID: TXN-2024-001234",
        status: "pending"
    },
    {
        id: 2,
        type: "reconciliation",
        priority: "medium",
        title: "Monthly Reconciliation Due",
        description: "December reconciliation needs to be completed by Dec 31",
        timestamp: "2024-12-09T09:00:00Z",
        source: "System Reminder",
        status: "pending"
    },
    {
        id: 3,
        type: "audit_complete",
        priority: "low",
        title: "Weekly Audit Completed",
        description: "All weekly checks passed successfully",
        timestamp: "2024-12-07T16:00:00Z",
        source: "Automated Audit",
        status: "completed"
    }
];

const sampleComplianceChecks = [
    {
        id: 1,
        category: "Financial Policies",
        item: "Loan-to-Savings Ratio",
        status: "compliant",
        currentValue: "82.8%",
        threshold: "≤ 85%",
        lastChecked: "2024-12-10"
    },
    {
        id: 2,
        category: "Meeting Requirements",
        item: "Quorum Compliance",
        status: "compliant",
        currentValue: "92%",
        threshold: "≥ 75%",
        lastChecked: "2024-12-08"
    },
    {
        id: 3,
        category: "Documentation",
        item: "Meeting Minutes",
        status: "non-compliant",
        currentValue: "Missing 1 meeting",
        threshold: "All meetings documented",
        lastChecked: "2024-12-10"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing auditor dashboard...');
    console.log('Sample audit data available:', sampleAuditData ? 'Yes' : 'No');
    
    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing auditor dashboard...');
        
        // Refresh data functionality
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                refreshDashboardData();
            });
        }
        
        // Group selector functionality
        const groupSelector = document.getElementById('groupSelector');
        if (groupSelector) {
            groupSelector.addEventListener('change', function() {
                switchGroup(this.value);
            });
        }
        
        // Auto-refresh metrics every 60 seconds (longer for audit data)
        setInterval(updateDashboardMetrics, 60000);
        
        console.log('Auditor dashboard initialization complete');
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
            
            showNotification('Audit data refreshed successfully', 'success');
        }, 3000); // Longer refresh time for audit data
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
        
        // Update financial overview values
        const overviewValues = document.querySelectorAll('.overview-value');
        overviewValues.forEach((element) => {
            element.style.transform = 'scale(1.02)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 150);
        });
    }
    
    function switchGroup(groupId) {
        showNotification(`Switched to group: ${groupId} - Reloading audit data...`, 'info');
        // In a real application, this would load different group audit data
        setTimeout(() => {
            updateDashboardMetrics();
            showNotification('Audit data loaded for selected group', 'success');
        }, 2000);
    }
    
    // Section Data Loading
    function loadSectionData(section) {
        switch (section) {
            case 'financial-audit':
                loadFinancialAuditSection();
                break;
            case 'transactions':
                loadTransactionsSection();
                break;
            case 'compliance':
                loadComplianceSection();
                break;
            case 'reports':
                loadReportsSection();
                break;
            case 'risk-management':
                loadRiskManagementSection();
                break;
            case 'data-integrity':
                loadDataIntegritySection();
                break;
            case 'analytics':
                loadAnalyticsSection();
                break;
        }
    }
    
    // Placeholder functions for section loading
    function loadFinancialAuditSection() {
        console.log('Loading financial audit section...');
    }
    
    function loadTransactionsSection() {
        console.log('Loading transactions section...');
    }
    
    function loadComplianceSection() {
        console.log('Loading compliance section...');
    }
    
    function loadReportsSection() {
        console.log('Loading reports section...');
    }
    
    function loadRiskManagementSection() {
        console.log('Loading risk management section...');
    }
    
    function loadDataIntegritySection() {
        console.log('Loading data integrity section...');
    }
    
    function loadAnalyticsSection() {
        console.log('Loading analytics section...');
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
        
        // Remove after 4 seconds (longer for audit notifications)
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }
    
    // Global functions for button actions
    window.openModal = function(modalType) {
        switch (modalType) {
            case 'verifyBalancesModal':
                showVerifyBalancesModal();
                break;
            case 'reviewTransactionsModal':
                showReviewTransactionsModal();
                break;
            case 'complianceCheckModal':
                showComplianceCheckModal();
                break;
            case 'riskAssessmentModal':
                showRiskAssessmentModal();
                break;
            case 'generateAuditReportModal':
                showGenerateAuditReportModal();
                break;
            case 'dataIntegrityModal':
                showDataIntegrityModal();
                break;
        }
    };
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    // Modal Functions
    function showVerifyBalancesModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Balance Verification</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="verification-options">
                            <h4>Select Accounts to Verify</h4>
                            <div class="account-selection">
                                <label class="account-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Cash on Hand (450,000 RWF)</span>
                                </label>
                                <label class="account-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Bank Account (2,200,000 RWF)</span>
                                </label>
                                <label class="account-checkbox">
                                    <input type="checkbox">
                                    <span>Mobile Money Account (0 RWF)</span>
                                </label>
                                <label class="account-checkbox">
                                    <input type="checkbox">
                                    <span>SACCO Account (0 RWF)</span>
                                </label>
                            </div>
                        </div>

                        <div class="verification-method">
                            <h4>Verification Method</h4>
                            <div class="method-options">
                                <label class="method-option">
                                    <input type="radio" name="method" value="manual" checked>
                                    <span>Manual Verification</span>
                                </label>
                                <label class="method-option">
                                    <input type="radio" name="method" value="automated">
                                    <span>Automated Cross-Check</span>
                                </label>
                                <label class="method-option">
                                    <input type="radio" name="method" value="external">
                                    <span>External Source Verification</span>
                                </label>
                            </div>
                        </div>

                        <div class="verification-notes">
                            <h4>Verification Notes</h4>
                            <textarea rows="4" placeholder="Enter any observations or notes about the verification process..."></textarea>
                        </div>

                        <div class="verification-schedule">
                            <h4>Schedule Next Verification</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Next Verification Date</label>
                                    <input type="date" value="2024-12-17">
                                </div>
                                <div class="form-group">
                                    <label>Frequency</label>
                                    <select>
                                        <option value="daily">Daily</option>
                                        <option value="weekly" selected>Weekly</option>
                                        <option value="monthly">Monthly</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="scheduleVerification()">Schedule Only</button>
                        <button class="btn-primary" onclick="startVerification()">Start Verification</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showReviewTransactionsModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content large-modal">
                    <div class="admin-modal-header">
                        <h3>Advanced Transaction Review</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="search-filters">
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Date Range</label>
                                    <div class="date-range">
                                        <input type="date" value="2024-12-01">
                                        <span>to</span>
                                        <input type="date" value="2024-12-10">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Transaction Type</label>
                                    <select>
                                        <option value="all">All Types</option>
                                        <option value="contribution">Contributions</option>
                                        <option value="withdrawal">Withdrawals</option>
                                        <option value="loan">Loans</option>
                                        <option value="penalty">Penalties</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Amount Range (RWF)</label>
                                    <div class="amount-range">
                                        <input type="number" placeholder="Min amount">
                                        <span>to</span>
                                        <input type="number" placeholder="Max amount">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label>Member</label>
                                    <select>
                                        <option value="all">All Members</option>
                                        ${sampleMembers ? sampleMembers.map(member =>
                                            `<option value="${member.id}">${member.name}</option>`
                                        ).join('') : ''}
                                    </select>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Risk Level</label>
                                    <select>
                                        <option value="all">All Risk Levels</option>
                                        <option value="high">High Risk</option>
                                        <option value="medium">Medium Risk</option>
                                        <option value="low">Low Risk</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Status</label>
                                    <select>
                                        <option value="all">All Statuses</option>
                                        <option value="flagged">Flagged</option>
                                        <option value="verified">Verified</option>
                                        <option value="pending">Pending Review</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="advanced-options">
                            <h4>Advanced Search Options</h4>
                            <div class="option-checkboxes">
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Include transactions outside business hours</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Include duplicate amount patterns</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Include transactions with missing documentation</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Include transactions exceeding member limits</span>
                                </label>
                            </div>
                        </div>

                        <div class="search-results">
                            <h4>Search Results</h4>
                            <div class="results-summary">
                                <span>Found <strong>3</strong> transactions matching criteria</span>
                                <span>Total Amount: <strong>725,000 RWF</strong></span>
                                <span>Risk Score: <strong>Medium</strong></span>
                            </div>
                            <div class="results-table">
                                <table class="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Date</th>
                                            <th>Member</th>
                                            <th>Type</th>
                                            <th>Amount</th>
                                            <th>Risk</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>TXN-001234</td>
                                            <td>Dec 10</td>
                                            <td>Grace Uwimana</td>
                                            <td>Withdrawal</td>
                                            <td>500,000 RWF</td>
                                            <td><span class="risk-badge high">High</span></td>
                                            <td>
                                                <button class="action-btn view">Review</button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Close</button>
                        <button class="btn-outline" onclick="exportSearchResults()">Export Results</button>
                        <button class="btn-primary" onclick="flagSelectedTransactions()">Flag Selected</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showComplianceCheckModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Compliance Check</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="compliance-categories">
                            <h4>Select Compliance Areas to Check</h4>
                            <div class="category-selection">
                                <label class="category-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Financial Policies (Loan-to-Savings Ratio, Interest Rates)</span>
                                </label>
                                <label class="category-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Meeting Requirements (Quorum, Attendance, Minutes)</span>
                                </label>
                                <label class="category-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Documentation (Record Keeping, Audit Trails)</span>
                                </label>
                                <label class="category-checkbox">
                                    <input type="checkbox">
                                    <span>Member Eligibility (Contribution Status, Loan Eligibility)</span>
                                </label>
                                <label class="category-checkbox">
                                    <input type="checkbox">
                                    <span>Penalty Application (Consistency, Fairness)</span>
                                </label>
                                <label class="category-checkbox">
                                    <input type="checkbox">
                                    <span>Regulatory Requirements (External Compliance)</span>
                                </label>
                            </div>
                        </div>

                        <div class="check-period">
                            <h4>Compliance Check Period</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>From Date</label>
                                    <input type="date" value="2024-12-01">
                                </div>
                                <div class="form-group">
                                    <label>To Date</label>
                                    <input type="date" value="2024-12-10">
                                </div>
                            </div>
                        </div>

                        <div class="check-options">
                            <h4>Check Options</h4>
                            <div class="option-checkboxes">
                                <label class="option-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Generate detailed compliance report</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Send notifications for non-compliance issues</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Create action items for violations</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Schedule follow-up checks</span>
                                </label>
                            </div>
                        </div>

                        <div class="compliance-preview">
                            <h4>Quick Compliance Status</h4>
                            <div class="status-grid">
                                <div class="status-item compliant">
                                    <span class="status-icon">✓</span>
                                    <span class="status-text">Financial Policies: Compliant</span>
                                </div>
                                <div class="status-item compliant">
                                    <span class="status-icon">✓</span>
                                    <span class="status-text">Meeting Requirements: Compliant</span>
                                </div>
                                <div class="status-item non-compliant">
                                    <span class="status-icon">✗</span>
                                    <span class="status-text">Documentation: 1 Issue Found</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="scheduleComplianceCheck()">Schedule Check</button>
                        <button class="btn-primary" onclick="runComplianceCheck()">Run Check Now</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showRiskAssessmentModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Risk Assessment</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="assessment-type">
                            <h4>Assessment Type</h4>
                            <div class="type-options">
                                <label class="type-option">
                                    <input type="radio" name="assessmentType" value="comprehensive" checked>
                                    <span>Comprehensive Risk Assessment</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="assessmentType" value="financial">
                                    <span>Financial Risk Only</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="assessmentType" value="operational">
                                    <span>Operational Risk Only</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="assessmentType" value="compliance">
                                    <span>Compliance Risk Only</span>
                                </label>
                            </div>
                        </div>

                        <div class="risk-indicators">
                            <h4>Risk Indicators to Evaluate</h4>
                            <div class="indicator-selection">
                                <label class="indicator-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Loan Default Rate</span>
                                </label>
                                <label class="indicator-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Member Attendance Rate</span>
                                </label>
                                <label class="indicator-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Cash Flow Ratio</span>
                                </label>
                                <label class="indicator-checkbox">
                                    <input type="checkbox">
                                    <span>Contribution Consistency</span>
                                </label>
                                <label class="indicator-checkbox">
                                    <input type="checkbox">
                                    <span>Leadership Stability</span>
                                </label>
                                <label class="indicator-checkbox">
                                    <input type="checkbox">
                                    <span>External Economic Factors</span>
                                </label>
                            </div>
                        </div>

                        <div class="assessment-period">
                            <h4>Assessment Period</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Period Type</label>
                                    <select>
                                        <option value="current_month">Current Month</option>
                                        <option value="last_3_months" selected>Last 3 Months</option>
                                        <option value="last_6_months">Last 6 Months</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Comparison Baseline</label>
                                    <select>
                                        <option value="previous_period">Previous Period</option>
                                        <option value="group_average">Group Average</option>
                                        <option value="industry_standard">Industry Standard</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="current-risk-summary">
                            <h4>Current Risk Summary</h4>
                            <div class="risk-metrics">
                                <div class="metric-item">
                                    <span class="metric-label">Overall Risk Level:</span>
                                    <span class="metric-value low">Low</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">Financial Risk Score:</span>
                                    <span class="metric-value">2.1/10</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-label">Last Assessment:</span>
                                    <span class="metric-value">Dec 8, 2024</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="scheduleRiskAssessment()">Schedule Assessment</button>
                        <button class="btn-primary" onclick="runRiskAssessment()">Run Assessment</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showGenerateAuditReportModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Generate Audit Report</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="report-type">
                            <h4>Report Type</h4>
                            <div class="type-selection">
                                <label class="type-option">
                                    <input type="radio" name="reportType" value="financial" checked>
                                    <span>Financial Audit Report</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="reportType" value="compliance">
                                    <span>Compliance Report</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="reportType" value="risk">
                                    <span>Risk Assessment Report</span>
                                </label>
                                <label class="type-option">
                                    <input type="radio" name="reportType" value="comprehensive">
                                    <span>Comprehensive Audit Report</span>
                                </label>
                            </div>
                        </div>

                        <div class="report-period">
                            <h4>Report Period</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>From Date</label>
                                    <input type="date" value="2024-12-01">
                                </div>
                                <div class="form-group">
                                    <label>To Date</label>
                                    <input type="date" value="2024-12-10">
                                </div>
                            </div>
                        </div>

                        <div class="report-sections">
                            <h4>Include Sections</h4>
                            <div class="section-checkboxes">
                                <label class="section-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Executive Summary</span>
                                </label>
                                <label class="section-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Balance Verification</span>
                                </label>
                                <label class="section-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Transaction Analysis</span>
                                </label>
                                <label class="section-checkbox">
                                    <input type="checkbox">
                                    <span>Compliance Assessment</span>
                                </label>
                                <label class="section-checkbox">
                                    <input type="checkbox">
                                    <span>Risk Analysis</span>
                                </label>
                                <label class="section-checkbox">
                                    <input type="checkbox">
                                    <span>Recommendations</span>
                                </label>
                            </div>
                        </div>

                        <div class="report-format">
                            <h4>Report Format</h4>
                            <div class="format-options">
                                <label class="format-option">
                                    <input type="radio" name="format" value="pdf" checked>
                                    <span>PDF Document</span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="excel">
                                    <span>Excel Spreadsheet</span>
                                </label>
                                <label class="format-option">
                                    <input type="radio" name="format" value="word">
                                    <span>Word Document</span>
                                </label>
                            </div>
                        </div>

                        <div class="distribution">
                            <h4>Distribution</h4>
                            <div class="distribution-options">
                                <label class="distribution-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Group Admin</span>
                                </label>
                                <label class="distribution-checkbox">
                                    <input type="checkbox">
                                    <span>Treasurer</span>
                                </label>
                                <label class="distribution-checkbox">
                                    <input type="checkbox">
                                    <span>Secretary</span>
                                </label>
                                <label class="distribution-checkbox">
                                    <input type="checkbox">
                                    <span>All Members</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="previewReport()">Preview</button>
                        <button class="btn-primary" onclick="generateReport()">Generate Report</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showDataIntegrityModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Data Integrity Check</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="integrity-checks">
                            <h4>Data Integrity Checks</h4>
                            <div class="check-selection">
                                <label class="check-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Database Consistency Check</span>
                                </label>
                                <label class="check-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Transaction Sequence Validation</span>
                                </label>
                                <label class="check-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Balance Reconciliation</span>
                                </label>
                                <label class="check-checkbox">
                                    <input type="checkbox">
                                    <span>Backup Verification</span>
                                </label>
                                <label class="check-checkbox">
                                    <input type="checkbox">
                                    <span>Access Log Audit</span>
                                </label>
                                <label class="check-checkbox">
                                    <input type="checkbox">
                                    <span>Data Modification Tracking</span>
                                </label>
                            </div>
                        </div>

                        <div class="check-scope">
                            <h4>Check Scope</h4>
                            <div class="form-row">
                                <div class="form-group">
                                    <label>Data Range</label>
                                    <select>
                                        <option value="all">All Data</option>
                                        <option value="recent" selected>Last 30 Days</option>
                                        <option value="current_month">Current Month</option>
                                        <option value="custom">Custom Range</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label>Priority Level</label>
                                    <select>
                                        <option value="standard" selected>Standard Check</option>
                                        <option value="thorough">Thorough Check</option>
                                        <option value="deep">Deep Analysis</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div class="integrity-status">
                            <h4>Current Integrity Status</h4>
                            <div class="status-indicators">
                                <div class="status-indicator good">
                                    <span class="indicator-icon">✓</span>
                                    <span class="indicator-text">Database Consistency: Good</span>
                                </div>
                                <div class="status-indicator good">
                                    <span class="indicator-icon">✓</span>
                                    <span class="indicator-text">Transaction Integrity: Good</span>
                                </div>
                                <div class="status-indicator warning">
                                    <span class="indicator-icon">!</span>
                                    <span class="indicator-text">Last Backup: 2 days ago</span>
                                </div>
                            </div>
                        </div>

                        <div class="check-options">
                            <h4>Check Options</h4>
                            <div class="option-checkboxes">
                                <label class="option-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Generate detailed integrity report</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Auto-fix minor issues</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Send alerts for critical issues</span>
                                </label>
                                <label class="option-checkbox">
                                    <input type="checkbox">
                                    <span>Schedule regular integrity checks</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="scheduleIntegrityCheck()">Schedule Check</button>
                        <button class="btn-primary" onclick="runIntegrityCheck()">Run Check Now</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Action Functions
    window.startVerification = function() {
        showNotification('Balance verification started - this may take a few minutes', 'info');
        closeModal();

        // Simulate verification process
        setTimeout(() => {
            showNotification('Balance verification completed successfully', 'success');
            updateDashboardMetrics();
        }, 3000);
    };

    window.scheduleVerification = function() {
        showNotification('Balance verification scheduled successfully', 'success');
        closeModal();
    };

    window.exportSearchResults = function() {
        showNotification('Transaction search results exported to Excel', 'success');
    };

    window.flagSelectedTransactions = function() {
        showNotification('Selected transactions have been flagged for review', 'warning');
        closeModal();
    };

    window.runComplianceCheck = function() {
        showNotification('Compliance check initiated - analyzing group policies and procedures', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Compliance check completed - 2 minor issues found', 'warning');
            updateDashboardMetrics();
        }, 4000);
    };

    window.scheduleComplianceCheck = function() {
        showNotification('Compliance check scheduled for next week', 'success');
        closeModal();
    };

    window.runRiskAssessment = function() {
        showNotification('Risk assessment started - evaluating all risk indicators', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Risk assessment completed - Overall risk level remains LOW', 'success');
            updateDashboardMetrics();
        }, 5000);
    };

    window.scheduleRiskAssessment = function() {
        showNotification('Risk assessment scheduled for bi-weekly execution', 'success');
        closeModal();
    };

    window.generateReport = function() {
        const reportType = document.querySelector('input[name="reportType"]:checked').value;
        showNotification(`Generating ${reportType} audit report - this may take several minutes`, 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Audit report generated successfully and distributed to selected recipients', 'success');
            updateDashboardMetrics();
        }, 6000);
    };

    window.previewReport = function() {
        showNotification('Report preview will open in a new window', 'info');
    };

    window.runIntegrityCheck = function() {
        showNotification('Data integrity check started - validating all system data', 'info');
        closeModal();

        setTimeout(() => {
            showNotification('Data integrity check completed - All systems verified', 'success');
            updateDashboardMetrics();
        }, 4000);
    };

    window.scheduleIntegrityCheck = function() {
        showNotification('Data integrity check scheduled for daily execution', 'success');
        closeModal();
    };

    // Notification dropdown functions
    function toggleNotificationDropdown() {
        console.log('Toggle notification dropdown');
    }

    function toggleUserMenu() {
        console.log('Toggle user menu');
    }

    console.log('Auditor Dashboard initialized successfully');
});
