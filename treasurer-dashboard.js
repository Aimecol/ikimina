// Treasurer Dashboard JavaScript

// Sample data for demonstration - declared at the top to avoid reference errors
const sampleMembers = [
    {
        id: 1,
        name: "Grace Uwimana",
        email: "grace.uwimana@email.com",
        phone: "+250 722 987 654",
        memberNumber: "KSG002",
        totalSavings: 180000,
        totalShares: 36,
        status: "active",
        joinDate: "2024-01-20"
    },
    {
        id: 2,
        name: "Alice Nyirahabimana",
        email: "alice.nyira@email.com",
        phone: "+250 788 555 123",
        memberNumber: "KSG003",
        totalSavings: 120000,
        totalShares: 24,
        status: "active",
        joinDate: "2024-02-01"
    },
    {
        id: 3,
        name: "Paul Nkurunziza",
        email: "paul.nkurunziza@email.com",
        phone: "+250 788 123 789",
        memberNumber: "KSG004",
        totalSavings: 95000,
        totalShares: 19,
        status: "active",
        joinDate: "2024-02-15"
    },
    {
        id: 4,
        name: "Jean Baptiste Uwimana",
        email: "jean.baptiste@email.com",
        phone: "+250 722 444 789",
        memberNumber: "KSG005",
        totalSavings: 75000,
        totalShares: 15,
        status: "active",
        joinDate: "2024-03-01"
    }
];

const sampleTransactions = [
    {
        id: 1,
        memberId: 1,
        memberName: "Grace Uwimana",
        type: "contribution",
        amount: 15000,
        paymentMethod: "mobile_money",
        reference: "MTN-123456789",
        timestamp: "2024-12-10T14:30:00Z",
        status: "completed",
        description: "Monthly contribution - 3 shares"
    },
    {
        id: 2,
        memberId: 2,
        memberName: "Alice Nyirahabimana",
        type: "loan_disbursement",
        amount: -150000,
        paymentMethod: "cash",
        reference: "LOAN-001",
        timestamp: "2024-12-10T10:15:00Z",
        status: "completed",
        description: "Business loan disbursement"
    },
    {
        id: 3,
        memberId: 3,
        memberName: "Paul Nkurunziza",
        type: "penalty",
        amount: 500,
        paymentMethod: "cash",
        reference: "FINE-001",
        timestamp: "2024-12-09T16:00:00Z",
        status: "completed",
        description: "Late arrival fine"
    }
];

const sampleLoanRequests = [
    {
        id: 1,
        memberId: 1,
        memberName: "Grace Uwimana",
        requestedAmount: 200000,
        purpose: "Small business expansion",
        term: 6,
        guarantors: ["Alice Nyirahabimana", "Paul Nkurunziza"],
        status: "pending",
        requestDate: "2024-12-08",
        eligibilityRatio: 1.11, // 200k / 180k savings
        maxEligible: 540000 // 3x savings
    },
    {
        id: 2,
        memberId: 4,
        memberName: "Jean Baptiste Uwimana",
        requestedAmount: 100000,
        purpose: "Education fees",
        term: 4,
        guarantors: ["Grace Uwimana"],
        status: "pending",
        requestDate: "2024-12-09",
        eligibilityRatio: 1.33, // 100k / 75k savings
        maxEligible: 225000 // 3x savings
    }
];

const groupSettings = {
    sharePrice: 5000,
    maxSharesPerMeeting: 5,
    loanInterestRate: 5.0,
    maxLoanMultiplier: 3.0,
    socialFundContribution: 1000,
    lateArrivalFine: 500,
    absenceFine: 1000,
    currency: "RWF"
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing treasurer dashboard...');
    console.log('Sample members available:', sampleMembers ? sampleMembers.length : 0);
    
    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing treasurer dashboard...');
        
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
        
        // Auto-refresh metrics every 30 seconds
        setInterval(updateDashboardMetrics, 30000);
        
        console.log('Treasurer dashboard initialization complete');
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
    
    function switchGroup(groupId) {
        showNotification(`Switched to group: ${groupId}`, 'info');
        // In a real application, this would load different group data
        updateDashboardMetrics();
    }
    
    // Section Data Loading
    function loadSectionData(section) {
        switch (section) {
            case 'contributions':
                loadContributionsSection();
                break;
            case 'loans':
                loadLoansSection();
                break;
            case 'penalties':
                loadPenaltiesSection();
                break;
            case 'social-fund':
                loadSocialFundSection();
                break;
            case 'transactions':
                loadTransactionsSection();
                break;
            case 'reports':
                loadReportsSection();
                break;
            case 'reconciliation':
                loadReconciliationSection();
                break;
        }
    }
    
    // Placeholder functions for section loading
    function loadContributionsSection() {
        console.log('Loading contributions section...');
    }
    
    function loadLoansSection() {
        console.log('Loading loans section...');
    }
    
    function loadPenaltiesSection() {
        console.log('Loading penalties section...');
    }
    
    function loadSocialFundSection() {
        console.log('Loading social fund section...');
    }
    
    function loadTransactionsSection() {
        console.log('Loading transactions section...');
    }
    
    function loadReportsSection() {
        console.log('Loading reports section...');
    }
    
    function loadReconciliationSection() {
        console.log('Loading reconciliation section...');
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
            case 'recordContributionModal':
                showRecordContributionModal();
                break;
            case 'processLoanModal':
                showProcessLoanModal();
                break;
            case 'recordPenaltyModal':
                showRecordPenaltyModal();
                break;
            case 'socialFundModal':
                showSocialFundModal();
                break;
            case 'generateReceiptModal':
                showGenerateReceiptModal();
                break;
            case 'reconcileModal':
                showReconcileModal();
                break;
        }
    };
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    // Modal Functions
    function showRecordContributionModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Record Member Contribution</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="contribution-form">
                            <div class="form-group">
                                <label>Select Member *</label>
                                <select id="contributionMember" required>
                                    <option value="">Choose a member...</option>
                                    ${sampleMembers.map(member =>
                                        `<option value="${member.id}">${member.name} (${member.memberNumber})</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Number of Shares *</label>
                                    <input type="number" id="contributionShares" min="1" max="${groupSettings.maxSharesPerMeeting}" value="1" required>
                                    <small class="form-help">Max ${groupSettings.maxSharesPerMeeting} shares per meeting</small>
                                </div>
                                <div class="form-group">
                                    <label>Share Price</label>
                                    <input type="number" id="contributionSharePrice" value="${groupSettings.sharePrice}" readonly>
                                    <small class="form-help">Current share price</small>
                                </div>
                            </div>

                            <div class="amount-calculator">
                                <h4>Contribution Calculation</h4>
                                <div class="calculator-row">
                                    <span>Shares:</span>
                                    <span id="calcShares">1</span>
                                </div>
                                <div class="calculator-row">
                                    <span>Share Price:</span>
                                    <span id="calcSharePrice">${formatCurrency(groupSettings.sharePrice)}</span>
                                </div>
                                <div class="calculator-row">
                                    <span>Social Fund:</span>
                                    <span id="calcSocialFund">${formatCurrency(groupSettings.socialFundContribution)}</span>
                                </div>
                                <div class="calculator-row total">
                                    <span>Total Amount:</span>
                                    <span id="calcTotal">${formatCurrency(groupSettings.sharePrice + groupSettings.socialFundContribution)}</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Payment Method *</label>
                                <div class="payment-methods">
                                    <div class="payment-method selected" data-method="cash">
                                        <i class="fas fa-money-bill"></i>
                                        <span>Cash</span>
                                    </div>
                                    <div class="payment-method" data-method="mobile_money">
                                        <i class="fas fa-mobile-alt"></i>
                                        <span>Mobile Money</span>
                                    </div>
                                    <div class="payment-method" data-method="bank_transfer">
                                        <i class="fas fa-university"></i>
                                        <span>Bank Transfer</span>
                                    </div>
                                    <div class="payment-method" data-method="sacco">
                                        <i class="fas fa-building"></i>
                                        <span>SACCO</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-group" id="referenceGroup" style="display: none;">
                                <label>Transaction Reference</label>
                                <input type="text" id="contributionReference" placeholder="Enter transaction reference">
                                <small class="form-help">Mobile money transaction ID or bank reference</small>
                            </div>

                            <div class="form-group">
                                <label>Notes (Optional)</label>
                                <textarea id="contributionNotes" rows="3" placeholder="Additional notes about this contribution"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="recordContribution()">Record Contribution</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for the modal
        setupContributionModalListeners();
    }

    function setupContributionModalListeners() {
        // Shares input change
        const sharesInput = document.getElementById('contributionShares');
        if (sharesInput) {
            sharesInput.addEventListener('input', updateContributionCalculation);
        }

        // Payment method selection
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', function() {
                paymentMethods.forEach(m => m.classList.remove('selected'));
                this.classList.add('selected');

                const methodType = this.getAttribute('data-method');
                const referenceGroup = document.getElementById('referenceGroup');

                if (methodType === 'mobile_money' || methodType === 'bank_transfer') {
                    referenceGroup.style.display = 'block';
                } else {
                    referenceGroup.style.display = 'none';
                }
            });
        });
    }

    function updateContributionCalculation() {
        const shares = parseInt(document.getElementById('contributionShares').value) || 1;
        const sharePrice = groupSettings.sharePrice;
        const socialFund = groupSettings.socialFundContribution;
        const total = (shares * sharePrice) + socialFund;

        document.getElementById('calcShares').textContent = shares;
        document.getElementById('calcSharePrice').textContent = formatCurrency(sharePrice);
        document.getElementById('calcSocialFund').textContent = formatCurrency(socialFund);
        document.getElementById('calcTotal').textContent = formatCurrency(total);
    }

    function showProcessLoanModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Process Loan Request</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Select Loan Request *</label>
                            <select id="loanRequest" required>
                                <option value="">Choose a loan request...</option>
                                ${sampleLoanRequests.map(loan =>
                                    `<option value="${loan.id}">${loan.memberName} - ${formatCurrency(loan.requestedAmount)}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div id="loanDetails" style="display: none;">
                            <div class="loan-eligibility-check">
                                <h4>Eligibility Check</h4>
                                <div class="eligibility-grid">
                                    <div class="eligibility-item">
                                        <span>Member Savings:</span>
                                        <span id="memberSavings">-</span>
                                    </div>
                                    <div class="eligibility-item">
                                        <span>Requested Amount:</span>
                                        <span id="requestedAmount">-</span>
                                    </div>
                                    <div class="eligibility-item">
                                        <span>Max Eligible:</span>
                                        <span id="maxEligible">-</span>
                                    </div>
                                    <div class="eligibility-item">
                                        <span>Status:</span>
                                        <span id="eligibilityStatus">-</span>
                                    </div>
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Approved Amount *</label>
                                    <input type="number" id="approvedAmount" min="0" required>
                                </div>
                                <div class="form-group">
                                    <label>Interest Rate (%)</label>
                                    <input type="number" id="interestRate" value="${groupSettings.loanInterestRate}" step="0.1" min="0">
                                </div>
                            </div>

                            <div class="form-row">
                                <div class="form-group">
                                    <label>Loan Term (months) *</label>
                                    <input type="number" id="loanTerm" min="1" max="24" required>
                                </div>
                                <div class="form-group">
                                    <label>Disbursement Method *</label>
                                    <select id="disbursementMethod" required>
                                        <option value="cash">Cash</option>
                                        <option value="mobile_money">Mobile Money</option>
                                        <option value="bank_transfer">Bank Transfer</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Loan Purpose</label>
                                <textarea id="loanPurpose" rows="2" readonly></textarea>
                            </div>

                            <div class="form-group">
                                <label>Guarantors</label>
                                <textarea id="loanGuarantors" rows="2" readonly></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-danger" onclick="rejectLoan()">Reject</button>
                        <button class="btn-primary" onclick="approveLoan()">Approve & Disburse</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for loan request selection
        const loanSelect = document.getElementById('loanRequest');
        if (loanSelect) {
            loanSelect.addEventListener('change', function() {
                const loanId = parseInt(this.value);
                if (loanId) {
                    populateLoanDetails(loanId);
                    document.getElementById('loanDetails').style.display = 'block';
                } else {
                    document.getElementById('loanDetails').style.display = 'none';
                }
            });
        }
    }

    function populateLoanDetails(loanId) {
        const loan = sampleLoanRequests.find(l => l.id === loanId);
        const member = sampleMembers.find(m => m.id === loan.memberId);

        if (loan && member) {
            document.getElementById('memberSavings').textContent = formatCurrency(member.totalSavings);
            document.getElementById('requestedAmount').textContent = formatCurrency(loan.requestedAmount);
            document.getElementById('maxEligible').textContent = formatCurrency(loan.maxEligible);
            document.getElementById('approvedAmount').value = loan.requestedAmount;
            document.getElementById('loanTerm').value = loan.term;
            document.getElementById('loanPurpose').value = loan.purpose;
            document.getElementById('loanGuarantors').value = loan.guarantors.join(', ');

            const isEligible = loan.requestedAmount <= loan.maxEligible;
            const statusElement = document.getElementById('eligibilityStatus');
            statusElement.textContent = isEligible ? '✓ Eligible' : '✗ Not Eligible';
            statusElement.className = isEligible ? 'eligible' : 'not-eligible';
        }
    }

    function showRecordPenaltyModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Record Penalty/Fine</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Select Member *</label>
                            <select id="penaltyMember" required>
                                <option value="">Choose a member...</option>
                                ${sampleMembers.map(member =>
                                    `<option value="${member.id}">${member.name} (${member.memberNumber})</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Penalty Type *</label>
                            <select id="penaltyType" required>
                                <option value="">Select penalty type...</option>
                                <option value="late_arrival" data-amount="${groupSettings.lateArrivalFine}">Late Arrival (${formatCurrency(groupSettings.lateArrivalFine)})</option>
                                <option value="absence" data-amount="${groupSettings.absenceFine}">Meeting Absence (${formatCurrency(groupSettings.absenceFine)})</option>
                                <option value="late_payment">Late Loan Payment</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Amount (RWF) *</label>
                                <input type="number" id="penaltyAmount" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="penaltyDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Reason/Description *</label>
                            <textarea id="penaltyReason" rows="3" placeholder="Describe the reason for this penalty" required></textarea>
                        </div>

                        <div class="form-group">
                            <label>Payment Status</label>
                            <select id="penaltyPaymentStatus">
                                <option value="unpaid">Unpaid</option>
                                <option value="paid">Paid</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="recordPenalty()">Record Penalty</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listener for penalty type selection
        const penaltyTypeSelect = document.getElementById('penaltyType');
        if (penaltyTypeSelect) {
            penaltyTypeSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const amount = selectedOption.getAttribute('data-amount');
                if (amount) {
                    document.getElementById('penaltyAmount').value = amount;
                }
            });
        }
    }

    function showSocialFundModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Social Fund Request</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Select Member *</label>
                            <select id="socialFundMember" required>
                                <option value="">Choose a member...</option>
                                ${sampleMembers.map(member =>
                                    `<option value="${member.id}">${member.name} (${member.memberNumber})</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Request Type *</label>
                            <select id="socialFundType" required>
                                <option value="">Select request type...</option>
                                <option value="emergency">Medical Emergency</option>
                                <option value="bereavement">Bereavement</option>
                                <option value="celebration">Celebration (Wedding, Birth)</option>
                                <option value="education">Education Support</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Requested Amount (RWF) *</label>
                                <input type="number" id="socialFundAmount" min="0" max="50000" required>
                                <small class="form-help">Maximum 50,000 RWF per request</small>
                            </div>
                            <div class="form-group">
                                <label>Request Date *</label>
                                <input type="date" id="socialFundDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Reason/Description *</label>
                            <textarea id="socialFundReason" rows="4" placeholder="Provide detailed reason for this request" required></textarea>
                        </div>

                        <div class="form-group">
                            <label>Supporting Documents</label>
                            <input type="file" id="socialFundDocuments" multiple accept=".pdf,.jpg,.jpeg,.png">
                            <small class="form-help">Upload receipts, medical reports, or other supporting documents</small>
                        </div>

                        <div class="social-fund-balance-check">
                            <h4>Fund Balance Check</h4>
                            <div class="balance-info">
                                <span>Current Balance: 150,000 RWF</span>
                                <span>Available for Disbursement: 150,000 RWF</span>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="processSocialFundRequest()">Submit Request</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showGenerateReceiptModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Generate Receipt</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Receipt Type *</label>
                            <select id="receiptType" required>
                                <option value="">Select receipt type...</option>
                                <option value="contribution">Contribution Receipt</option>
                                <option value="loan_disbursement">Loan Disbursement Receipt</option>
                                <option value="penalty">Penalty Payment Receipt</option>
                                <option value="social_fund">Social Fund Disbursement Receipt</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Select Member *</label>
                            <select id="receiptMember" required>
                                <option value="">Choose a member...</option>
                                ${sampleMembers.map(member =>
                                    `<option value="${member.id}">${member.name} (${member.memberNumber})</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Amount (RWF) *</label>
                                <input type="number" id="receiptAmount" min="0" required>
                            </div>
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="receiptDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Description *</label>
                            <textarea id="receiptDescription" rows="3" placeholder="Description of the transaction" required></textarea>
                        </div>

                        <div class="form-group">
                            <label>Payment Method</label>
                            <select id="receiptPaymentMethod">
                                <option value="cash">Cash</option>
                                <option value="mobile_money">Mobile Money</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="sacco">SACCO</option>
                            </select>
                        </div>

                        <div class="receipt-preview">
                            <h4>Receipt Preview</h4>
                            <div class="preview-content">
                                <div class="receipt-header">
                                    <h5>Kigali Savings Group</h5>
                                    <p>Official Receipt</p>
                                </div>
                                <div class="receipt-details">
                                    <p><strong>Receipt No:</strong> RCP-${Date.now()}</p>
                                    <p><strong>Date:</strong> <span id="previewDate">${new Date().toLocaleDateString()}</span></p>
                                    <p><strong>Member:</strong> <span id="previewMember">-</span></p>
                                    <p><strong>Amount:</strong> <span id="previewAmount">-</span></p>
                                    <p><strong>For:</strong> <span id="previewDescription">-</span></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="previewReceipt()">Preview</button>
                        <button class="btn-primary" onclick="generateReceipt()">Generate & Print</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showReconcileModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Account Reconciliation</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="reconciliation-form">
                            <div class="form-group">
                                <label>Reconciliation Date *</label>
                                <input type="date" id="reconciliationDate" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>

                            <div class="reconciliation-accounts">
                                <h4>Account Balances</h4>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Physical Cash Count (RWF) *</label>
                                        <input type="number" id="physicalCash" min="0" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Bank Account Balance (RWF) *</label>
                                        <input type="number" id="bankBalance" min="0" required>
                                    </div>
                                </div>

                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Mobile Money Balance (RWF)</label>
                                        <input type="number" id="mobileMoneyBalance" min="0" value="0">
                                    </div>
                                    <div class="form-group">
                                        <label>SACCO Account Balance (RWF)</label>
                                        <input type="number" id="saccoBalance" min="0" value="0">
                                    </div>
                                </div>
                            </div>

                            <div class="reconciliation-summary">
                                <h4>Reconciliation Summary</h4>
                                <div class="summary-row">
                                    <span>Total Physical + Electronic:</span>
                                    <span id="totalActual">0 RWF</span>
                                </div>
                                <div class="summary-row">
                                    <span>Expected Balance (Records):</span>
                                    <span id="expectedBalance">2,650,000 RWF</span>
                                </div>
                                <div class="summary-row difference">
                                    <span>Difference:</span>
                                    <span id="balanceDifference">0 RWF</span>
                                </div>
                            </div>

                            <div class="form-group">
                                <label>Reconciliation Notes</label>
                                <textarea id="reconciliationNotes" rows="4" placeholder="Any discrepancies, explanations, or notes about the reconciliation"></textarea>
                            </div>

                            <div class="reconciliation-checklist">
                                <h4>Reconciliation Checklist</h4>
                                <label class="checklist-item">
                                    <input type="checkbox" id="checkCashCount">
                                    <span>Physical cash count completed and verified</span>
                                </label>
                                <label class="checklist-item">
                                    <input type="checkbox" id="checkBankStatement">
                                    <span>Bank statement reviewed and reconciled</span>
                                </label>
                                <label class="checklist-item">
                                    <input type="checkbox" id="checkTransactions">
                                    <span>All transactions recorded and verified</span>
                                </label>
                                <label class="checklist-item">
                                    <input type="checkbox" id="checkDocuments">
                                    <span>Supporting documents filed and organized</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="completeReconciliation()">Complete Reconciliation</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for balance calculations
        const balanceInputs = ['physicalCash', 'bankBalance', 'mobileMoneyBalance', 'saccoBalance'];
        balanceInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', updateReconciliationSummary);
            }
        });
    }

    function updateReconciliationSummary() {
        const physicalCash = parseFloat(document.getElementById('physicalCash').value) || 0;
        const bankBalance = parseFloat(document.getElementById('bankBalance').value) || 0;
        const mobileMoneyBalance = parseFloat(document.getElementById('mobileMoneyBalance').value) || 0;
        const saccoBalance = parseFloat(document.getElementById('saccoBalance').value) || 0;

        const totalActual = physicalCash + bankBalance + mobileMoneyBalance + saccoBalance;
        const expectedBalance = 2650000; // This would come from the system records
        const difference = totalActual - expectedBalance;

        document.getElementById('totalActual').textContent = formatCurrency(totalActual);
        document.getElementById('balanceDifference').textContent = formatCurrency(Math.abs(difference));

        const differenceElement = document.getElementById('balanceDifference');
        const summaryRow = differenceElement.closest('.summary-row');

        if (difference === 0) {
            summaryRow.className = 'summary-row balanced';
            differenceElement.textContent = '0 RWF (Balanced)';
        } else if (difference > 0) {
            summaryRow.className = 'summary-row surplus';
            differenceElement.textContent = `+${formatCurrency(difference)} (Surplus)`;
        } else {
            summaryRow.className = 'summary-row deficit';
            differenceElement.textContent = `-${formatCurrency(Math.abs(difference))} (Deficit)`;
        }
    }
    
    // Notification dropdown functions
    function toggleNotificationDropdown() {
        console.log('Toggle notification dropdown');
    }
    
    function toggleUserMenu() {
        console.log('Toggle user menu');
    }
    
    // Action Functions
    window.recordContribution = function() {
        const memberId = document.getElementById('contributionMember').value;
        const shares = document.getElementById('contributionShares').value;
        const paymentMethod = document.querySelector('.payment-method.selected').getAttribute('data-method');
        const reference = document.getElementById('contributionReference').value;
        const notes = document.getElementById('contributionNotes').value;

        if (!memberId || !shares) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // In a real application, this would make an API call
        const member = sampleMembers.find(m => m.id == memberId);
        const amount = (parseInt(shares) * groupSettings.sharePrice) + groupSettings.socialFundContribution;

        showNotification(`Contribution recorded: ${member.name} - ${formatCurrency(amount)}`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.approveLoan = function() {
        const loanId = document.getElementById('loanRequest').value;
        const approvedAmount = document.getElementById('approvedAmount').value;
        const interestRate = document.getElementById('interestRate').value;
        const term = document.getElementById('loanTerm').value;
        const disbursementMethod = document.getElementById('disbursementMethod').value;

        if (!loanId || !approvedAmount || !term || !disbursementMethod) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const loan = sampleLoanRequests.find(l => l.id == loanId);
        showNotification(`Loan approved: ${loan.memberName} - ${formatCurrency(approvedAmount)}`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.rejectLoan = function() {
        const loanId = document.getElementById('loanRequest').value;
        if (!loanId) {
            showNotification('Please select a loan request', 'error');
            return;
        }

        const loan = sampleLoanRequests.find(l => l.id == loanId);
        showNotification(`Loan rejected: ${loan.memberName}`, 'warning');
        closeModal();
    };

    window.recordPenalty = function() {
        const memberId = document.getElementById('penaltyMember').value;
        const penaltyType = document.getElementById('penaltyType').value;
        const amount = document.getElementById('penaltyAmount').value;
        const reason = document.getElementById('penaltyReason').value;

        if (!memberId || !penaltyType || !amount || !reason) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const member = sampleMembers.find(m => m.id == memberId);
        showNotification(`Penalty recorded: ${member.name} - ${formatCurrency(amount)}`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.processSocialFundRequest = function() {
        const memberId = document.getElementById('socialFundMember').value;
        const requestType = document.getElementById('socialFundType').value;
        const amount = document.getElementById('socialFundAmount').value;
        const reason = document.getElementById('socialFundReason').value;

        if (!memberId || !requestType || !amount || !reason) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const member = sampleMembers.find(m => m.id == memberId);
        showNotification(`Social fund request submitted: ${member.name} - ${formatCurrency(amount)}`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.generateReceipt = function() {
        const receiptType = document.getElementById('receiptType').value;
        const memberId = document.getElementById('receiptMember').value;
        const amount = document.getElementById('receiptAmount').value;

        if (!receiptType || !memberId || !amount) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        const member = sampleMembers.find(m => m.id == memberId);
        showNotification(`Receipt generated for ${member.name} - ${formatCurrency(amount)}`, 'success');
        closeModal();

        // In a real application, this would open a print dialog or download PDF
        setTimeout(() => {
            showNotification('Receipt sent to printer', 'info');
        }, 1000);
    };

    window.previewReceipt = function() {
        const memberId = document.getElementById('receiptMember').value;
        const amount = document.getElementById('receiptAmount').value;
        const description = document.getElementById('receiptDescription').value;
        const date = document.getElementById('receiptDate').value;

        if (memberId) {
            const member = sampleMembers.find(m => m.id == memberId);
            document.getElementById('previewMember').textContent = member.name;
        }

        if (amount) {
            document.getElementById('previewAmount').textContent = formatCurrency(amount);
        }

        if (description) {
            document.getElementById('previewDescription').textContent = description;
        }

        if (date) {
            document.getElementById('previewDate').textContent = new Date(date).toLocaleDateString();
        }
    };

    window.completeReconciliation = function() {
        const physicalCash = document.getElementById('physicalCash').value;
        const bankBalance = document.getElementById('bankBalance').value;
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');

        if (!physicalCash || !bankBalance) {
            showNotification('Please enter all required balance amounts', 'error');
            return;
        }

        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        if (!allChecked) {
            showNotification('Please complete all reconciliation checklist items', 'error');
            return;
        }

        showNotification('Account reconciliation completed successfully', 'success');
        closeModal();
        updateDashboardMetrics();

        // In a real application, this would generate a reconciliation report
        setTimeout(() => {
            showNotification('Reconciliation report generated', 'info');
        }, 1000);
    };

    console.log('Treasurer Dashboard initialized successfully');
});
