// Group Admin Dashboard JavaScript

// Sample data for demonstration - declared at the top to avoid reference errors
const sampleMembers = [
    {
        id: 1,
        name: "Marie Mukamana",
        email: "marie.mukamana@email.com",
        phone: "+250 788 123 456",
        role: "treasurer",
        joinDate: "2024-01-15",
        totalSavings: "250,000 RWF",
        status: "active",
        memberNumber: "KSG001"
    },
    {
        id: 2,
        name: "Grace Uwimana",
        email: "grace.uwimana@email.com",
        phone: "+250 722 987 654",
        role: "secretary",
        joinDate: "2024-01-20",
        totalSavings: "180,000 RWF",
        status: "active",
        memberNumber: "KSG002"
    },
    {
        id: 3,
        name: "Alice Nyirahabimana",
        email: "alice.nyira@email.com",
        phone: "+250 788 555 123",
        role: "member",
        joinDate: "2024-02-01",
        totalSavings: "120,000 RWF",
        status: "active",
        memberNumber: "KSG003"
    },
    {
        id: 4,
        name: "Jean Baptiste Uwimana",
        email: "jean.baptiste@email.com",
        phone: "+250 722 444 789",
        role: "member",
        joinDate: "2024-02-15",
        totalSavings: "95,000 RWF",
        status: "suspended",
        memberNumber: "KSG004"
    }
];

const groupSettings = {
    groupName: "Kigali Savings Group",
    sharePrice: 5000,
    maxSharesPerMeeting: 5,
    meetingFrequency: "Weekly",
    meetingDay: "Saturday",
    meetingTime: "14:00",
    loanInterestRate: 5.0,
    loanInterestType: "Flat",
    maxLoanMultiplier: 3.0,
    socialFundContribution: 1000,
    registrationFee: 10000,
    lateArrivalFine: 500,
    absenceFine: 1000
};

// Additional sample data for loans and meetings
const sampleLoans = [
    {
        id: 1,
        memberId: 2,
        memberName: "Grace Uwimana",
        amount: 150000,
        purpose: "Small business expansion",
        term: 6,
        interestRate: 5.0,
        status: "pending",
        requestDate: "2024-12-10",
        guarantors: ["Marie Mukamana", "Alice Nyirahabimana"]
    },
    {
        id: 2,
        memberId: 3,
        memberName: "Alice Nyirahabimana",
        amount: 80000,
        purpose: "Education fees",
        term: 4,
        interestRate: 5.0,
        status: "active",
        requestDate: "2024-11-15",
        disbursedDate: "2024-11-20",
        guarantors: ["Marie Mukamana"]
    }
];

const sampleMeetings = [
    {
        id: 1,
        date: "2024-12-08",
        type: "Regular Meeting",
        attendance: 23,
        totalMembers: 25,
        contributions: 115000,
        loansApproved: 2,
        status: "completed"
    },
    {
        id: 2,
        date: "2024-12-15",
        type: "Weekly Meeting",
        attendance: null,
        totalMembers: 25,
        contributions: null,
        loansApproved: null,
        status: "scheduled"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing admin dashboard...');
    console.log('Sample members available:', sampleMembers ? sampleMembers.length : 0);

    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeMemberManagement();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing dashboard...');

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

        // Load initial data
        console.log('Loading initial member data...');
        loadMembersTable();

        console.log('Dashboard initialization complete');
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
    
    // Member Management
    function initializeMemberManagement() {
        // Member search functionality
        const memberSearch = document.getElementById('memberSearch');
        if (memberSearch) {
            memberSearch.addEventListener('input', function() {
                filterMembers(this.value);
            });
        }
        
        // Member filter functionality
        const memberFilter = document.getElementById('memberFilter');
        if (memberFilter) {
            memberFilter.addEventListener('change', function() {
                filterMembersByStatus(this.value);
            });
        }
        
        // Member approval/rejection
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('approve-member')) {
                const userId = e.target.getAttribute('data-user-id');
                approveMember(userId);
            }
            
            if (e.target.classList.contains('reject-member')) {
                const userId = e.target.getAttribute('data-user-id');
                rejectMember(userId);
            }
        });
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
        loadMembersTable();
    }
    
    // Members Table Functions
    function loadMembersTable() {
        const tableBody = document.querySelector('#membersTable tbody');
        if (!tableBody) {
            console.warn('Members table body not found');
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        // Check if sampleMembers is available
        if (!sampleMembers || sampleMembers.length === 0) {
            console.warn('No sample members data available');
            tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px; color: var(--gray-500);">No members found</td></tr>';
            return;
        }

        // Populate table with member data
        sampleMembers.forEach(member => {
            try {
                const row = createMemberTableRow(member);
                tableBody.appendChild(row);
            } catch (error) {
                console.error('Error creating member row:', error, member);
            }
        });

        console.log(`Loaded ${sampleMembers.length} members into table`);
    }
    
    function createMemberTableRow(member) {
        if (!member || !member.id) {
            console.error('Invalid member data:', member);
            return document.createElement('tr');
        }

        const row = document.createElement('tr');

        // Safely get member properties with fallbacks
        const memberName = member.name || 'Unknown';
        const memberEmail = member.email || 'No email';
        const memberRole = member.role || 'member';
        const memberStatus = member.status || 'active';
        const memberSavings = member.totalSavings || '0 RWF';
        const joinDate = member.joinDate || new Date().toISOString().split('T')[0];

        row.innerHTML = `
            <td>
                <div class="member-info">
                    <div class="member-avatar">
                        ${memberName.charAt(0).toUpperCase()}
                    </div>
                    <div class="member-details">
                        <h4>${memberName}</h4>
                        <p>${memberEmail}</p>
                    </div>
                </div>
            </td>
            <td>
                <span class="role-badge ${memberRole}">${memberRole.charAt(0).toUpperCase() + memberRole.slice(1)}</span>
            </td>
            <td>${formatDate(joinDate)}</td>
            <td>${memberSavings}</td>
            <td>
                <span class="status-badge ${memberStatus}">${memberStatus.charAt(0).toUpperCase() + memberStatus.slice(1)}</span>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewMember(${member.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit" onclick="editMember(${member.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${memberStatus === 'suspended' ?
                        `<button class="action-btn approve" onclick="reactivateMember(${member.id})">
                            <i class="fas fa-check"></i> Reactivate
                        </button>` :
                        `<button class="action-btn delete" onclick="suspendMember(${member.id})">
                            <i class="fas fa-ban"></i> Suspend
                        </button>`
                    }
                </div>
            </td>
        `;
        return row;
    }
    
    function filterMembers(searchTerm) {
        const rows = document.querySelectorAll('#membersTable tbody tr');
        
        rows.forEach(row => {
            const memberName = row.querySelector('.member-details h4').textContent.toLowerCase();
            const memberEmail = row.querySelector('.member-details p').textContent.toLowerCase();
            
            if (memberName.includes(searchTerm.toLowerCase()) || memberEmail.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    function filterMembersByStatus(status) {
        const rows = document.querySelectorAll('#membersTable tbody tr');
        
        rows.forEach(row => {
            const statusBadge = row.querySelector('.status-badge');
            const rowStatus = statusBadge.textContent.toLowerCase();
            
            if (status === 'all' || rowStatus === status) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    // Member Actions
    function approveMember(userId) {
        showNotification('Member approved successfully', 'success');
        
        // Remove the request item
        const requestItem = document.querySelector(`[data-user-id="${userId}"]`).closest('.request-item');
        if (requestItem) {
            requestItem.remove();
        }
        
        // Update badge count
        updateNotificationBadge();
        loadMembersTable();
    }
    
    function rejectMember(userId) {
        showNotification('Member request rejected', 'info');
        
        // Remove the request item
        const requestItem = document.querySelector(`[data-user-id="${userId}"]`).closest('.request-item');
        if (requestItem) {
            requestItem.remove();
        }
        
        // Update badge count
        updateNotificationBadge();
    }
    
    function updateNotificationBadge() {
        const badge = document.querySelector('.notification-count');
        if (badge) {
            const currentCount = parseInt(badge.textContent);
            badge.textContent = Math.max(0, currentCount - 1);
        }
    }
    
    // Section Data Loading
    function loadSectionData(section) {
        switch (section) {
            case 'members':
                loadMembersTable();
                break;
            case 'financial':
                loadFinancialSection();
                break;
            case 'meetings':
                loadMeetingsSection();
                break;
            case 'loans':
                loadLoansSection();
                break;
            case 'reports':
                loadReportsSection();
                break;
            case 'bylaws':
                loadBylawsSection();
                break;
            case 'settings':
                loadSettingsSection();
                break;
        }
    }
    
    // Placeholder functions for other sections
    function loadFinancialSection() {
        console.log('Loading financial section...');
    }
    
    function loadMeetingsSection() {
        console.log('Loading meetings section...');
    }
    
    function loadLoansSection() {
        console.log('Loading loans section...');
    }
    
    function loadReportsSection() {
        console.log('Loading reports section...');
    }
    
    function loadBylawsSection() {
        console.log('Loading bylaws section...');
    }
    
    function loadSettingsSection() {
        console.log('Loading settings section...');
    }
    
    // Utility Functions
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
    window.viewMember = function(memberId) {
        const member = sampleMembers.find(m => m.id === memberId);
        if (member) {
            showMemberModal(member, 'view');
        }
    };
    
    window.editMember = function(memberId) {
        const member = sampleMembers.find(m => m.id === memberId);
        if (member) {
            showMemberModal(member, 'edit');
        }
    };
    
    window.suspendMember = function(memberId) {
        showConfirmationModal('Suspend Member', 'Are you sure you want to suspend this member?', () => {
            const member = sampleMembers.find(m => m.id === memberId);
            if (member) {
                member.status = 'suspended';
                loadMembersTable();
                showNotification('Member suspended successfully', 'warning');
            }
        });
    };
    
    window.reactivateMember = function(memberId) {
        const member = sampleMembers.find(m => m.id === memberId);
        if (member) {
            member.status = 'active';
            loadMembersTable();
            showNotification('Member reactivated successfully', 'success');
        }
    };
    
    window.openModal = function(modalType) {
        switch (modalType) {
            case 'addMemberModal':
                showAddMemberModal();
                break;
            case 'recordContributionModal':
                showRecordContributionModal();
                break;
            case 'approveLoanModal':
                showApproveLoanModal();
                break;
            case 'scheduleMeetingModal':
                showScheduleMeetingModal();
                break;
        }
    };
    
    // Modal Functions
    function showMemberModal(member, mode) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>${mode === 'view' ? 'View' : 'Edit'} Member: ${member.name}</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-form-group">
                            <label>Full Name</label>
                            <input type="text" value="${member.name}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                        <div class="admin-form-group">
                            <label>Email Address</label>
                            <input type="email" value="${member.email}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                        <div class="admin-form-group">
                            <label>Phone Number</label>
                            <input type="tel" value="${member.phone}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                        <div class="admin-form-group">
                            <label>Role</label>
                            <select ${mode === 'view' ? 'disabled' : ''}>
                                <option value="member" ${member.role === 'member' ? 'selected' : ''}>Member</option>
                                <option value="treasurer" ${member.role === 'treasurer' ? 'selected' : ''}>Treasurer</option>
                                <option value="secretary" ${member.role === 'secretary' ? 'selected' : ''}>Secretary</option>
                                <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>Admin</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Member Number</label>
                            <input type="text" value="${member.memberNumber}" readonly>
                        </div>
                        <div class="admin-form-group">
                            <label>Total Savings</label>
                            <input type="text" value="${member.totalSavings}" readonly>
                        </div>
                    </div>
                    ${mode === 'edit' ? `
                        <div class="admin-modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveMember(${member.id})">Save Changes</button>
                        </div>
                    ` : `
                        <div class="admin-modal-footer">
                            <button class="btn-primary" onclick="closeModal()">Close</button>
                        </div>
                    `}
                </div>
            </div>
        `;
    }
    
    function showAddMemberModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Add New Member</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-form-group">
                            <label>Full Name *</label>
                            <input type="text" id="newMemberName" placeholder="Enter full name" required>
                        </div>
                        <div class="admin-form-group">
                            <label>Email Address *</label>
                            <input type="email" id="newMemberEmail" placeholder="Enter email address" required>
                        </div>
                        <div class="admin-form-group">
                            <label>Phone Number *</label>
                            <input type="tel" id="newMemberPhone" placeholder="+250 XXX XXX XXX" required>
                        </div>
                        <div class="admin-form-group">
                            <label>Role</label>
                            <select id="newMemberRole">
                                <option value="member" selected>Member</option>
                                <option value="treasurer">Treasurer</option>
                                <option value="secretary">Secretary</option>
                            </select>
                        </div>
                        <div class="admin-form-group">
                            <label>Initial Contribution (Optional)</label>
                            <input type="number" id="newMemberContribution" placeholder="0" min="0">
                            <small class="config-help">Initial contribution amount in RWF</small>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="addNewMember()">Add Member</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    function showConfirmationModal(title, message, onConfirm) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>${title}</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <p>${message}</p>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="confirmAction()">${title}</button>
                    </div>
                </div>
            </div>
        `;
        
        window.confirmAction = function() {
            onConfirm();
            closeModal();
        };
    }
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    window.saveMember = function(memberId) {
        // Update the member data (in a real app, this would be an API call)
        const member = sampleMembers.find(m => m.id === memberId);
        if (member) {
            // Here you would update the member with form data
            console.log('Saving member:', member.name);
        }

        showNotification('Member updated successfully', 'success');
        closeModal();
        loadMembersTable();
    };
    
    window.addNewMember = function() {
        const name = document.getElementById('newMemberName').value;
        const email = document.getElementById('newMemberEmail').value;
        const phone = document.getElementById('newMemberPhone').value;
        
        if (!name || !email || !phone) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        showNotification('Member added successfully', 'success');
        closeModal();
        loadMembersTable();
    };
    
    // Placeholder modal functions
    function showRecordContributionModal() {
        showNotification('Record Contribution modal would open here', 'info');
    }
    
    function showApproveLoanModal() {
        showNotification('Approve Loan modal would open here', 'info');
    }
    
    function showScheduleMeetingModal() {
        showNotification('Schedule Meeting modal would open here', 'info');
    }
    
    // Notification dropdown functions
    function toggleNotificationDropdown() {
        console.log('Toggle notification dropdown');
    }
    
    function toggleUserMenu() {
        console.log('Toggle user menu');
    }
    
    console.log('Group Admin Dashboard initialized successfully');
});
