// Super Admin Dashboard JavaScript

// Sample data for demonstration - declared at the top to avoid reference errors
const sampleGroups = [
    {
        id: 1,
        name: "Kigali Savings Group",
        creator: "Jean Uwimana",
        members: 25,
        status: "active",
        created: "2024-01-15",
        totalSavings: "2,500,000 RWF"
    },
    {
        id: 2,
        name: "Ubwiyunge Cooperative",
        creator: "Marie Mukamana",
        members: 18,
        status: "pending",
        created: "2024-08-20",
        totalSavings: "0 RWF"
    },
    {
        id: 3,
        name: "Gasabo Women Group",
        creator: "Alice Nyirahabimana",
        members: 32,
        status: "active",
        created: "2023-11-08",
        totalSavings: "4,200,000 RWF"
    },
    {
        id: 4,
        name: "Youth Entrepreneurs",
        creator: "Paul Nkurunziza",
        members: 15,
        status: "suspended",
        created: "2024-03-12",
        totalSavings: "1,800,000 RWF"
    },
    {
        id: 5,
        name: "Nyamirambo Traders",
        creator: "Grace Uwimana",
        members: 28,
        status: "active",
        created: "2023-09-22",
        totalSavings: "3,600,000 RWF"
    }
];

// Additional sample data for other sections
const sampleUsers = [
    {
        id: 1,
        name: "Jean Baptiste Uwimana",
        email: "jean.uwimana@email.com",
        role: "Group Creator",
        status: "pending",
        submittedDate: "2024-12-10",
        documents: ["National ID", "Business License"]
    },
    {
        id: 2,
        name: "Marie Mukamana",
        email: "marie.mukamana@email.com",
        role: "Group Creator",
        status: "approved",
        submittedDate: "2024-12-08",
        documents: ["National ID", "Tax Certificate"]
    }
];

const sampleTransactions = [
    {
        id: 1,
        groupName: "Kigali Savings Group",
        amount: 5000000,
        type: "withdrawal",
        member: "Jean Uwimana",
        timestamp: "2024-12-10T10:15:00Z",
        status: "flagged"
    },
    {
        id: 2,
        groupName: "Gasabo Women Group",
        amount: 150000,
        type: "loan",
        member: "Alice Nyirahabimana",
        timestamp: "2024-12-10T14:30:00Z",
        status: "normal"
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing super admin dashboard...');
    console.log('Sample groups available:', sampleGroups ? sampleGroups.length : 0);

    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeDataTables();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing super admin dashboard...');

        // Refresh data functionality
        const refreshBtn = document.getElementById('refreshData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', function() {
                refreshDashboardData();
            });
        }

        // Export functionality
        const exportBtn = document.querySelector('.export-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                exportDashboardReport();
            });
        }

        // Chart period selector
        const chartPeriod = document.querySelector('.chart-period');
        if (chartPeriod) {
            chartPeriod.addEventListener('change', function() {
                updateChartData(this.value);
            });
        }

        // Auto-refresh metrics every 30 seconds
        setInterval(updateMetrics, 30000);

        console.log('Super admin dashboard initialization complete');
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
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.admin-notifications')) {
                closeNotificationDropdown();
            }
            if (!e.target.closest('.admin-user')) {
                closeUserMenu();
            }
        });
    }
    
    // Data Tables Management
    function initializeDataTables() {
        console.log('Initializing data tables...');

        // Group search functionality
        const groupSearch = document.getElementById('groupSearch');
        if (groupSearch) {
            groupSearch.addEventListener('input', function() {
                filterGroups(this.value);
            });
        }

        // Group filter functionality
        const groupFilter = document.getElementById('groupFilter');
        if (groupFilter) {
            groupFilter.addEventListener('change', function() {
                filterGroupsByStatus(this.value);
            });
        }

        // Select all functionality
        const selectAllGroups = document.getElementById('selectAllGroups');
        if (selectAllGroups) {
            selectAllGroups.addEventListener('change', function() {
                toggleAllGroupSelection(this.checked);
            });
        }

        // Load initial group data
        console.log('Loading initial group data...');
        loadGroupsTable();

        console.log('Data tables initialization complete');
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
            updateMetrics();
            refreshBtn.innerHTML = originalText;
            refreshBtn.disabled = false;
            
            showNotification('Dashboard data refreshed successfully', 'success');
        }, 2000);
    }
    
    function updateMetrics() {
        // Simulate real-time metric updates
        // Add small random variations to simulate real-time updates
        const metricElements = document.querySelectorAll('.metric-value');
        metricElements.forEach((element) => {
            // Add subtle animation
            element.style.transform = 'scale(1.05)';
            setTimeout(() => {
                element.style.transform = 'scale(1)';
            }, 200);
        });
    }
    
    function updateChartData(period) {
        const chartPlaceholder = document.querySelector('.chart-placeholder');
        if (chartPlaceholder) {
            chartPlaceholder.innerHTML = `
                <i class="fas fa-spinner fa-spin"></i>
                <p>Loading ${period} data...</p>
            `;
            
            setTimeout(() => {
                chartPlaceholder.innerHTML = `
                    <i class="fas fa-chart-line"></i>
                    <p>Growth Trends Chart (${period})</p>
                    <small>Interactive chart would be rendered here</small>
                `;
            }, 1000);
        }
    }
    
    function exportDashboardReport() {
        showNotification('Generating dashboard report...', 'info');
        
        setTimeout(() => {
            // Simulate file download
            const link = document.createElement('a');
            link.href = 'data:text/plain;charset=utf-8,Dashboard Report - ' + new Date().toISOString();
            link.download = 'ikimina-dashboard-report-' + new Date().toISOString().split('T')[0] + '.csv';
            link.click();
            
            showNotification('Dashboard report exported successfully', 'success');
        }, 2000);
    }
    
    // Groups Table Functions
    function loadGroupsTable() {
        const tableBody = document.querySelector('#groupsTable tbody');
        if (!tableBody) {
            console.warn('Groups table body not found');
            return;
        }

        // Clear existing content
        tableBody.innerHTML = '';

        // Check if sampleGroups is available
        if (!sampleGroups || sampleGroups.length === 0) {
            console.warn('No sample groups data available');
            tableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px; color: var(--gray-500);">No groups found</td></tr>';
            return;
        }

        // Populate table with group data
        sampleGroups.forEach(group => {
            try {
                const row = createGroupTableRow(group);
                tableBody.appendChild(row);
            } catch (error) {
                console.error('Error creating group row:', error, group);
            }
        });

        console.log(`Loaded ${sampleGroups.length} groups into table`);
    }
    
    function createGroupTableRow(group) {
        if (!group || !group.id) {
            console.error('Invalid group data:', group);
            return document.createElement('tr');
        }

        const row = document.createElement('tr');

        // Safely get group properties with fallbacks
        const groupName = group.name || 'Unknown Group';
        const groupCreator = group.creator || 'Unknown';
        const groupMembers = group.members || 0;
        const groupStatus = group.status || 'active';
        const groupSavings = group.totalSavings || '0 RWF';
        const createdDate = group.created || new Date().toISOString().split('T')[0];

        row.innerHTML = `
            <td>
                <input type="checkbox" class="group-checkbox" data-group-id="${group.id}">
            </td>
            <td>
                <div class="group-name">
                    <strong>${groupName}</strong>
                    <div class="group-meta">${groupSavings}</div>
                </div>
            </td>
            <td>${groupCreator}</td>
            <td>${groupMembers}</td>
            <td>
                <span class="status-badge ${groupStatus}">${groupStatus.charAt(0).toUpperCase() + groupStatus.slice(1)}</span>
            </td>
            <td>${formatDate(createdDate)}</td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewGroup(${group.id})">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="action-btn edit" onclick="editGroup(${group.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    ${groupStatus === 'pending' ?
                        `<button class="action-btn approve" onclick="approveGroup(${group.id})">
                            <i class="fas fa-check"></i> Approve
                        </button>` : ''
                    }
                </div>
            </td>
        `;
        return row;
    }
    
    function filterGroups(searchTerm) {
        const rows = document.querySelectorAll('#groupsTable tbody tr');
        
        rows.forEach(row => {
            const groupName = row.querySelector('.group-name strong').textContent.toLowerCase();
            const creator = row.cells[2].textContent.toLowerCase();
            
            if (groupName.includes(searchTerm.toLowerCase()) || creator.includes(searchTerm.toLowerCase())) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    }
    
    function filterGroupsByStatus(status) {
        const rows = document.querySelectorAll('#groupsTable tbody tr');
        
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
    
    function toggleAllGroupSelection(checked) {
        const checkboxes = document.querySelectorAll('.group-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
        });
    }
    
    // Section Data Loading
    function loadSectionData(section) {
        switch (section) {
            case 'groups':
                loadGroupsTable();
                break;
            case 'verification':
                loadVerificationQueue();
                break;
            case 'financial':
                loadFinancialData();
                break;
            case 'compliance':
                loadComplianceData();
                break;
            case 'security':
                loadSecurityData();
                break;
            case 'settings':
                loadSettingsData();
                break;
        }
    }
    
    // Placeholder functions for other sections
    function loadVerificationQueue() {
        console.log('Loading verification queue...');
    }
    
    function loadFinancialData() {
        console.log('Loading financial data...');
    }
    
    function loadComplianceData() {
        console.log('Loading compliance data...');
    }
    
    function loadSecurityData() {
        console.log('Loading security data...');
    }
    
    function loadSettingsData() {
        console.log('Loading settings data...');
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
    window.viewGroup = function(groupId) {
        const group = sampleGroups.find(g => g.id === groupId);
        if (group) {
            showGroupModal(group, 'view');
        }
    };
    
    window.editGroup = function(groupId) {
        const group = sampleGroups.find(g => g.id === groupId);
        if (group) {
            showGroupModal(group, 'edit');
        }
    };
    
    window.approveGroup = function(groupId) {
        showApprovalModal(groupId);
    };
    
    // Modal Functions
    function showGroupModal(group, mode) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>${mode === 'view' ? 'View' : 'Edit'} Group: ${group.name}</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="admin-form-group">
                            <label>Group Name</label>
                            <input type="text" value="${group.name}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                        <div class="admin-form-group">
                            <label>Creator</label>
                            <input type="text" value="${group.creator}" readonly>
                        </div>
                        <div class="admin-form-group">
                            <label>Members</label>
                            <input type="number" value="${group.members}" ${mode === 'view' ? 'readonly' : ''}>
                        </div>
                        <div class="admin-form-group">
                            <label>Status</label>
                            <select ${mode === 'view' ? 'disabled' : ''}>
                                <option value="active" ${group.status === 'active' ? 'selected' : ''}>Active</option>
                                <option value="pending" ${group.status === 'pending' ? 'selected' : ''}>Pending</option>
                                <option value="suspended" ${group.status === 'suspended' ? 'selected' : ''}>Suspended</option>
                                <option value="closed" ${group.status === 'closed' ? 'selected' : ''}>Closed</option>
                            </select>
                        </div>
                    </div>
                    ${mode === 'edit' ? `
                        <div class="admin-modal-footer">
                            <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button class="btn-primary" onclick="saveGroup(${group.id})">Save Changes</button>
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
    
    function showApprovalModal(groupId) {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Approve Group</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <p>Are you sure you want to approve this group? This action will activate the group and allow members to start their savings activities.</p>
                        <div class="admin-form-group">
                            <label>Approval Notes (Optional)</label>
                            <textarea placeholder="Add any notes about this approval..."></textarea>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="confirmApproval(${groupId})">Approve Group</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    window.saveGroup = function(groupId) {
        showNotification('Group updated successfully', 'success');
        closeModal();
        loadGroupsTable();
    };
    
    window.confirmApproval = function(groupId) {
        // Update group status
        const group = sampleGroups.find(g => g.id === groupId);
        if (group) {
            group.status = 'active';
        }
        
        showNotification('Group approved successfully', 'success');
        closeModal();
        loadGroupsTable();
    };
    
    // Notification dropdown functions
    function toggleNotificationDropdown() {
        // Implementation for notification dropdown
        console.log('Toggle notification dropdown');
    }
    
    function closeNotificationDropdown() {
        // Implementation for closing notification dropdown
    }
    
    function toggleUserMenu() {
        // Implementation for user menu
        console.log('Toggle user menu');
    }
    
    function closeUserMenu() {
        // Implementation for closing user menu
    }
    
    console.log('Super Admin Dashboard initialized successfully');
});
