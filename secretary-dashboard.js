// Secretary Dashboard JavaScript

// Sample data for demonstration - declared at the top to avoid reference errors
const sampleMembers = [
    {
        id: 1,
        name: "Grace Uwimana",
        email: "grace.uwimana@email.com",
        phone: "+250 722 987 654",
        memberNumber: "KSG002",
        role: "Treasurer",
        status: "active",
        joinDate: "2024-01-20",
        address: "Kigali, Gasabo District",
        emergencyContact: "+250 788 111 222"
    },
    {
        id: 2,
        name: "Marie Mukamana",
        email: "marie.mukamana@email.com",
        phone: "+250 788 123 456",
        memberNumber: "KSG001",
        role: "Member",
        status: "active",
        joinDate: "2024-01-15",
        address: "Kigali, Nyarugenge District",
        emergencyContact: "+250 722 333 444"
    },
    {
        id: 3,
        name: "Paul Nkurunziza",
        email: "paul.nkurunziza@email.com",
        phone: "+250 788 555 123",
        memberNumber: "KSG004",
        role: "Member",
        status: "active",
        joinDate: "2024-02-15",
        address: "Kigali, Kicukiro District",
        emergencyContact: "+250 788 555 666"
    },
    {
        id: 4,
        name: "Jean Baptiste Uwimana",
        email: "jean.baptiste@email.com",
        phone: "+250 722 444 789",
        memberNumber: "KSG005",
        role: "Member",
        status: "active",
        joinDate: "2024-03-01",
        address: "Kigali, Gasabo District",
        emergencyContact: "+250 722 777 888"
    }
];

const sampleMeetings = [
    {
        id: 1,
        title: "Weekly Meeting #48",
        date: "2024-12-15",
        time: "14:00",
        duration: 120,
        location: "Community Center",
        type: "regular",
        status: "scheduled",
        agenda: [
            "Opening and attendance",
            "Review of previous minutes",
            "Treasurer's report",
            "New loan applications",
            "Any other business"
        ],
        invitedMembers: 25,
        attendanceRecorded: false
    },
    {
        id: 2,
        title: "Year-End Meeting",
        date: "2024-12-31",
        time: "10:00",
        duration: 240,
        location: "Group Hall",
        type: "special",
        status: "scheduled",
        agenda: [
            "Annual review presentation",
            "Financial audit results",
            "Share-out calculations",
            "Next year planning",
            "Election of new officials"
        ],
        invitedMembers: 25,
        attendanceRecorded: false
    },
    {
        id: 3,
        title: "Weekly Meeting #47",
        date: "2024-12-08",
        time: "14:00",
        duration: 120,
        location: "Community Center",
        type: "regular",
        status: "completed",
        agenda: [
            "Opening and attendance",
            "Review of previous minutes",
            "Treasurer's report",
            "Loan repayment updates",
            "Social fund requests"
        ],
        invitedMembers: 25,
        attendanceRecorded: true,
        attendanceCount: 23
    }
];

const sampleDocuments = [
    {
        id: 1,
        name: "Group Bylaws 2024",
        type: "policy",
        category: "governance",
        uploadDate: "2024-01-15",
        size: "2.3 MB",
        format: "PDF",
        uploadedBy: "Alice Nyirahabimana",
        description: "Updated group bylaws and regulations"
    },
    {
        id: 2,
        name: "Meeting Minutes - Dec 8, 2024",
        type: "minutes",
        category: "meetings",
        uploadDate: "2024-12-09",
        size: "1.1 MB",
        format: "PDF",
        uploadedBy: "Alice Nyirahabimana",
        description: "Minutes from weekly meeting #47"
    },
    {
        id: 3,
        name: "Member Registration Forms",
        type: "forms",
        category: "membership",
        uploadDate: "2024-02-01",
        size: "5.7 MB",
        format: "ZIP",
        uploadedBy: "Alice Nyirahabimana",
        description: "Collection of member registration documents"
    }
];

const sampleCommunications = [
    {
        id: 1,
        title: "Year-End Meeting Announcement",
        type: "announcement",
        content: "Dear members, we will hold our annual year-end meeting on December 31st at 10:00 AM...",
        recipients: "all_members",
        sentDate: "2024-12-09",
        deliveryStatus: "sent",
        readCount: 22,
        totalRecipients: 25
    },
    {
        id: 2,
        title: "Meeting Reminder - Dec 15",
        type: "reminder",
        content: "This is a reminder about our weekly meeting scheduled for tomorrow...",
        recipients: "all_members",
        sentDate: "2024-12-14",
        deliveryStatus: "pending",
        readCount: 0,
        totalRecipients: 25
    }
];

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing secretary dashboard...');
    console.log('Sample members available:', sampleMembers ? sampleMembers.length : 0);
    
    // Initialize dashboard
    initializeDashboard();
    initializeNavigation();
    initializeNotifications();
    initializeModals();
    
    // Dashboard Initialization
    function initializeDashboard() {
        console.log('Initializing secretary dashboard...');
        
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
        
        console.log('Secretary dashboard initialization complete');
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
            case 'meetings':
                loadMeetingsSection();
                break;
            case 'attendance':
                loadAttendanceSection();
                break;
            case 'minutes':
                loadMinutesSection();
                break;
            case 'communications':
                loadCommunicationsSection();
                break;
            case 'members':
                loadMembersSection();
                break;
            case 'documents':
                loadDocumentsSection();
                break;
            case 'reports':
                loadReportsSection();
                break;
        }
    }
    
    // Placeholder functions for section loading
    function loadMeetingsSection() {
        console.log('Loading meetings section...');
    }
    
    function loadAttendanceSection() {
        console.log('Loading attendance section...');
    }
    
    function loadMinutesSection() {
        console.log('Loading minutes section...');
    }
    
    function loadCommunicationsSection() {
        console.log('Loading communications section...');
    }
    
    function loadMembersSection() {
        console.log('Loading members section...');
    }
    
    function loadDocumentsSection() {
        console.log('Loading documents section...');
    }
    
    function loadReportsSection() {
        console.log('Loading reports section...');
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
    
    function formatTime(timeString) {
        const [hours, minutes] = timeString.split(':');
        const date = new Date();
        date.setHours(parseInt(hours), parseInt(minutes));
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
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
            case 'scheduleMeetingModal':
                showScheduleMeetingModal();
                break;
            case 'recordAttendanceModal':
                showRecordAttendanceModal();
                break;
            case 'createMinutesModal':
                showCreateMinutesModal();
                break;
            case 'sendAnnouncementModal':
                showSendAnnouncementModal();
                break;
            case 'uploadDocumentModal':
                showUploadDocumentModal();
                break;
            case 'memberDirectoryModal':
                showMemberDirectoryModal();
                break;
        }
    };
    
    window.closeModal = function() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = '';
    };
    
    // Modal Functions
    function showScheduleMeetingModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Schedule New Meeting</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Meeting Title *</label>
                            <input type="text" id="meetingTitle" placeholder="Enter meeting title" required>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Date *</label>
                                <input type="date" id="meetingDate" required>
                            </div>
                            <div class="form-group">
                                <label>Time *</label>
                                <input type="time" id="meetingTime" required>
                            </div>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Duration (hours)</label>
                                <input type="number" id="meetingDuration" min="0.5" max="8" step="0.5" value="2">
                            </div>
                            <div class="form-group">
                                <label>Meeting Type</label>
                                <select id="meetingType">
                                    <option value="regular">Regular Meeting</option>
                                    <option value="special">Special Meeting</option>
                                    <option value="emergency">Emergency Meeting</option>
                                    <option value="annual">Annual Meeting</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Location *</label>
                            <input type="text" id="meetingLocation" placeholder="Meeting venue" required>
                        </div>

                        <div class="form-group">
                            <label>Meeting Agenda</label>
                            <textarea id="meetingAgenda" rows="6" placeholder="Enter agenda items (one per line)">Opening and attendance
Review of previous minutes
Treasurer's report
New business
Any other business
Closing</textarea>
                        </div>

                        <div class="form-group">
                            <label>Invite Members</label>
                            <div class="member-selection">
                                <label class="member-checkbox">
                                    <input type="checkbox" id="inviteAll" checked>
                                    <span>Invite all active members (${sampleMembers.length})</span>
                                </label>
                                <div id="memberList" style="display: none;">
                                    ${sampleMembers.map(member => `
                                        <label class="member-checkbox">
                                            <input type="checkbox" value="${member.id}" checked>
                                            <span>${member.name} (${member.memberNumber})</span>
                                        </label>
                                    `).join('')}
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Send Invitations</label>
                            <div class="notification-options">
                                <label class="notification-checkbox">
                                    <input type="checkbox" checked>
                                    <span>SMS Notifications</span>
                                </label>
                                <label class="notification-checkbox">
                                    <input type="checkbox" checked>
                                    <span>Email Notifications</span>
                                </label>
                                <label class="notification-checkbox">
                                    <input type="checkbox">
                                    <span>WhatsApp Messages</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="saveDraftMeeting()">Save as Draft</button>
                        <button class="btn-primary" onclick="scheduleMeeting()">Schedule & Send Invites</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners
        const inviteAllCheckbox = document.getElementById('inviteAll');
        const memberList = document.getElementById('memberList');

        if (inviteAllCheckbox) {
            inviteAllCheckbox.addEventListener('change', function() {
                if (this.checked) {
                    memberList.style.display = 'none';
                } else {
                    memberList.style.display = 'block';
                }
            });
        }
    }

    function showRecordAttendanceModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Record Meeting Attendance</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Select Meeting *</label>
                            <select id="attendanceMeeting" required>
                                <option value="">Choose a meeting...</option>
                                ${sampleMeetings.filter(m => m.status === 'scheduled' || m.status === 'in_progress').map(meeting =>
                                    `<option value="${meeting.id}">${meeting.title} - ${formatDate(meeting.date)}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div class="attendance-controls">
                            <div class="control-buttons">
                                <button class="btn-outline" onclick="markAllPresent()">Mark All Present</button>
                                <button class="btn-outline" onclick="markAllAbsent()">Mark All Absent</button>
                                <button class="btn-outline" onclick="resetAttendance()">Reset</button>
                            </div>
                        </div>

                        <div class="attendance-list">
                            <h4>Member Attendance</h4>
                            <div class="attendance-members">
                                ${sampleMembers.map(member => `
                                    <div class="attendance-member">
                                        <div class="member-info">
                                            <div class="member-avatar">${member.name.charAt(0)}</div>
                                            <div class="member-details">
                                                <h5>${member.name}</h5>
                                                <p>${member.memberNumber}</p>
                                            </div>
                                        </div>
                                        <div class="attendance-options">
                                            <label class="attendance-option">
                                                <input type="radio" name="attendance_${member.id}" value="present">
                                                <span class="option-label present">Present</span>
                                            </label>
                                            <label class="attendance-option">
                                                <input type="radio" name="attendance_${member.id}" value="late">
                                                <span class="option-label late">Late</span>
                                            </label>
                                            <label class="attendance-option">
                                                <input type="radio" name="attendance_${member.id}" value="absent">
                                                <span class="option-label absent">Absent</span>
                                            </label>
                                            <label class="attendance-option">
                                                <input type="radio" name="attendance_${member.id}" value="excused">
                                                <span class="option-label excused">Excused</span>
                                            </label>
                                        </div>
                                        <div class="time-inputs">
                                            <input type="time" placeholder="Check-in" class="time-input">
                                            <input type="time" placeholder="Check-out" class="time-input">
                                        </div>
                                        <div class="notes-input">
                                            <input type="text" placeholder="Notes (optional)" class="notes-field">
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>

                        <div class="attendance-summary">
                            <h4>Attendance Summary</h4>
                            <div class="summary-stats">
                                <span>Present: <span id="presentCount">0</span></span>
                                <span>Late: <span id="lateCount">0</span></span>
                                <span>Absent: <span id="absentCount">0</span></span>
                                <span>Excused: <span id="excusedCount">0</span></span>
                            </div>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="saveAttendance()">Save Attendance</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for attendance tracking
        setupAttendanceListeners();
    }

    function setupAttendanceListeners() {
        const attendanceInputs = document.querySelectorAll('input[type="radio"][name^="attendance_"]');
        attendanceInputs.forEach(input => {
            input.addEventListener('change', updateAttendanceSummary);
        });

        updateAttendanceSummary();
    }

    function updateAttendanceSummary() {
        const counts = { present: 0, late: 0, absent: 0, excused: 0 };

        sampleMembers.forEach(member => {
            const selectedOption = document.querySelector(`input[name="attendance_${member.id}"]:checked`);
            if (selectedOption) {
                counts[selectedOption.value]++;
            }
        });

        document.getElementById('presentCount').textContent = counts.present;
        document.getElementById('lateCount').textContent = counts.late;
        document.getElementById('absentCount').textContent = counts.absent;
        document.getElementById('excusedCount').textContent = counts.excused;
    }

    function showCreateMinutesModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content large-modal">
                    <div class="admin-modal-header">
                        <h3>Create Meeting Minutes</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Select Meeting *</label>
                            <select id="minutesMeeting" required>
                                <option value="">Choose a meeting...</option>
                                ${sampleMeetings.filter(m => m.status === 'completed' || m.status === 'in_progress').map(meeting =>
                                    `<option value="${meeting.id}">${meeting.title} - ${formatDate(meeting.date)}</option>`
                                ).join('')}
                            </select>
                        </div>

                        <div class="form-row">
                            <div class="form-group">
                                <label>Meeting Date</label>
                                <input type="date" id="minutesDate" readonly>
                            </div>
                            <div class="form-group">
                                <label>Meeting Time</label>
                                <input type="time" id="minutesTime" readonly>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Attendees</label>
                            <textarea id="minutesAttendees" rows="3" placeholder="List of attendees will be populated from attendance records"></textarea>
                        </div>

                        <div class="minutes-editor">
                            <div class="editor-toolbar">
                                <button type="button" class="editor-btn" onclick="formatText('bold')"><i class="fas fa-bold"></i></button>
                                <button type="button" class="editor-btn" onclick="formatText('italic')"><i class="fas fa-italic"></i></button>
                                <button type="button" class="editor-btn" onclick="formatText('underline')"><i class="fas fa-underline"></i></button>
                                <button type="button" class="editor-btn" onclick="insertList()"><i class="fas fa-list-ul"></i></button>
                                <button type="button" class="editor-btn" onclick="insertNumberedList()"><i class="fas fa-list-ol"></i></button>
                            </div>
                            <div class="form-group">
                                <label>Meeting Minutes Content *</label>
                                <div id="minutesEditor" contenteditable="true" class="minutes-content">
                                    <h4>1. Opening and Call to Order</h4>
                                    <p>The meeting was called to order at [TIME] by [CHAIRPERSON].</p>

                                    <h4>2. Attendance</h4>
                                    <p>Present: [LIST OF ATTENDEES]</p>
                                    <p>Absent: [LIST OF ABSENTEES]</p>

                                    <h4>3. Approval of Previous Minutes</h4>
                                    <p>[DETAILS ABOUT PREVIOUS MINUTES APPROVAL]</p>

                                    <h4>4. Treasurer's Report</h4>
                                    <p>[FINANCIAL REPORT DETAILS]</p>

                                    <h4>5. Old Business</h4>
                                    <p>[DISCUSSION OF ONGOING MATTERS]</p>

                                    <h4>6. New Business</h4>
                                    <p>[NEW TOPICS AND DECISIONS]</p>

                                    <h4>7. Action Items</h4>
                                    <ul>
                                        <li>[ACTION ITEM 1] - Assigned to: [NAME] - Due: [DATE]</li>
                                        <li>[ACTION ITEM 2] - Assigned to: [NAME] - Due: [DATE]</li>
                                    </ul>

                                    <h4>8. Next Meeting</h4>
                                    <p>Next meeting scheduled for [DATE] at [TIME] at [LOCATION].</p>

                                    <h4>9. Adjournment</h4>
                                    <p>Meeting adjourned at [TIME].</p>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Meeting Decisions & Resolutions</label>
                            <textarea id="minutesDecisions" rows="4" placeholder="List key decisions and resolutions made during the meeting"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Action Items</label>
                            <div id="actionItems">
                                <div class="action-item">
                                    <input type="text" placeholder="Action item description" class="action-description">
                                    <select class="action-assignee">
                                        <option value="">Assign to...</option>
                                        ${sampleMembers.map(member =>
                                            `<option value="${member.id}">${member.name}</option>`
                                        ).join('')}
                                    </select>
                                    <input type="date" class="action-due-date">
                                    <button type="button" class="btn-outline remove-action">Remove</button>
                                </div>
                            </div>
                            <button type="button" class="btn-outline" onclick="addActionItem()">Add Action Item</button>
                        </div>

                        <div class="form-group">
                            <label>Attach Files</label>
                            <input type="file" id="minutesAttachments" multiple accept=".pdf,.doc,.docx,.jpg,.jpeg,.png">
                            <small class="form-help">Attach supporting documents, photos, or presentations</small>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="saveDraftMinutes()">Save as Draft</button>
                        <button class="btn-primary" onclick="saveAndDistributeMinutes()">Save & Distribute</button>
                    </div>
                </div>
            </div>
        `;
    }

    function showSendAnnouncementModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Send Announcement</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Announcement Type *</label>
                            <select id="announcementType" required>
                                <option value="general">General Announcement</option>
                                <option value="meeting">Meeting Announcement</option>
                                <option value="reminder">Reminder</option>
                                <option value="urgent">Urgent Notice</option>
                                <option value="celebration">Celebration/Event</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Subject/Title *</label>
                            <input type="text" id="announcementSubject" placeholder="Enter announcement title" required>
                        </div>

                        <div class="form-group">
                            <label>Message Content *</label>
                            <textarea id="announcementContent" rows="8" placeholder="Enter your announcement message here..." required></textarea>
                            <small class="form-help">Keep messages clear and concise. Include all important details.</small>
                        </div>

                        <div class="form-group">
                            <label>Recipients *</label>
                            <div class="recipient-options">
                                <label class="recipient-option">
                                    <input type="radio" name="recipients" value="all" checked>
                                    <span>All Members (${sampleMembers.length})</span>
                                </label>
                                <label class="recipient-option">
                                    <input type="radio" name="recipients" value="officers">
                                    <span>Officers Only</span>
                                </label>
                                <label class="recipient-option">
                                    <input type="radio" name="recipients" value="custom">
                                    <span>Select Specific Members</span>
                                </label>
                            </div>
                            <div id="customRecipients" style="display: none;">
                                ${sampleMembers.map(member => `
                                    <label class="member-checkbox">
                                        <input type="checkbox" value="${member.id}">
                                        <span>${member.name} (${member.memberNumber})</span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Delivery Methods</label>
                            <div class="delivery-methods">
                                <label class="delivery-method">
                                    <input type="checkbox" checked>
                                    <span>SMS</span>
                                </label>
                                <label class="delivery-method">
                                    <input type="checkbox" checked>
                                    <span>Email</span>
                                </label>
                                <label class="delivery-method">
                                    <input type="checkbox">
                                    <span>WhatsApp</span>
                                </label>
                                <label class="delivery-method">
                                    <input type="checkbox">
                                    <span>In-App Notification</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Schedule Delivery</label>
                            <div class="schedule-options">
                                <label class="schedule-option">
                                    <input type="radio" name="schedule" value="now" checked>
                                    <span>Send Now</span>
                                </label>
                                <label class="schedule-option">
                                    <input type="radio" name="schedule" value="later">
                                    <span>Schedule for Later</span>
                                </label>
                            </div>
                            <div id="scheduleDateTime" style="display: none;">
                                <div class="form-row">
                                    <div class="form-group">
                                        <label>Date</label>
                                        <input type="date" id="scheduleDate">
                                    </div>
                                    <div class="form-group">
                                        <label>Time</label>
                                        <input type="time" id="scheduleTime">
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Priority Level</label>
                            <select id="announcementPriority">
                                <option value="normal">Normal</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-outline" onclick="previewAnnouncement()">Preview</button>
                        <button class="btn-primary" onclick="sendAnnouncement()">Send Announcement</button>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners for recipient and schedule options
        setupAnnouncementListeners();
    }

    function setupAnnouncementListeners() {
        const recipientRadios = document.querySelectorAll('input[name="recipients"]');
        const customRecipients = document.getElementById('customRecipients');

        recipientRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'custom') {
                    customRecipients.style.display = 'block';
                } else {
                    customRecipients.style.display = 'none';
                }
            });
        });

        const scheduleRadios = document.querySelectorAll('input[name="schedule"]');
        const scheduleDateTime = document.getElementById('scheduleDateTime');

        scheduleRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'later') {
                    scheduleDateTime.style.display = 'block';
                } else {
                    scheduleDateTime.style.display = 'none';
                }
            });
        });
    }

    function showUploadDocumentModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h3>Upload Document</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="form-group">
                            <label>Document Title *</label>
                            <input type="text" id="documentTitle" placeholder="Enter document title" required>
                        </div>

                        <div class="form-group">
                            <label>Document Category *</label>
                            <select id="documentCategory" required>
                                <option value="">Select category...</option>
                                <option value="minutes">Meeting Minutes</option>
                                <option value="policies">Policies & Bylaws</option>
                                <option value="forms">Forms & Templates</option>
                                <option value="reports">Reports</option>
                                <option value="correspondence">Correspondence</option>
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Description</label>
                            <textarea id="documentDescription" rows="3" placeholder="Brief description of the document"></textarea>
                        </div>

                        <div class="form-group">
                            <label>Upload File *</label>
                            <div class="file-upload-area" id="fileUploadArea">
                                <div class="upload-placeholder">
                                    <i class="fas fa-cloud-upload-alt"></i>
                                    <p>Drag and drop files here or click to browse</p>
                                    <small>Supported formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (Max 10MB)</small>
                                </div>
                                <input type="file" id="documentFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" required>
                            </div>
                            <div id="filePreview" style="display: none;">
                                <div class="file-info">
                                    <i class="fas fa-file"></i>
                                    <span class="file-name"></span>
                                    <span class="file-size"></span>
                                    <button type="button" class="remove-file" onclick="removeFile()">
                                        <i class="fas fa-times"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Access Permissions</label>
                            <div class="permission-options">
                                <label class="permission-option">
                                    <input type="radio" name="permissions" value="all" checked>
                                    <span>All Members</span>
                                </label>
                                <label class="permission-option">
                                    <input type="radio" name="permissions" value="officers">
                                    <span>Officers Only</span>
                                </label>
                                <label class="permission-option">
                                    <input type="radio" name="permissions" value="admin">
                                    <span>Admin Only</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label>Tags (Optional)</label>
                            <input type="text" id="documentTags" placeholder="Enter tags separated by commas">
                            <small class="form-help">Tags help organize and search documents</small>
                        </div>

                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="notifyMembers">
                                <span>Notify members about this document</span>
                            </label>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-secondary" onclick="closeModal()">Cancel</button>
                        <button class="btn-primary" onclick="uploadDocument()">Upload Document</button>
                    </div>
                </div>
            </div>
        `;

        // Setup file upload functionality
        setupFileUpload();
    }

    function setupFileUpload() {
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('documentFile');
        const filePreview = document.getElementById('filePreview');

        // Click to upload
        fileUploadArea.addEventListener('click', () => fileInput.click());

        // Drag and drop
        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    function handleFileSelection(file) {
        const filePreview = document.getElementById('filePreview');
        const fileName = filePreview.querySelector('.file-name');
        const fileSize = filePreview.querySelector('.file-size');

        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        filePreview.style.display = 'block';
        document.getElementById('fileUploadArea').style.display = 'none';
    }

    function removeFile() {
        const filePreview = document.getElementById('filePreview');
        const fileUploadArea = document.getElementById('fileUploadArea');
        const fileInput = document.getElementById('documentFile');

        filePreview.style.display = 'none';
        fileUploadArea.style.display = 'block';
        fileInput.value = '';
    }

    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function showMemberDirectoryModal() {
        const modalContainer = document.getElementById('modalContainer');
        modalContainer.innerHTML = `
            <div class="admin-modal">
                <div class="admin-modal-content large-modal">
                    <div class="admin-modal-header">
                        <h3>Member Directory</h3>
                        <button class="admin-modal-close">&times;</button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="directory-controls">
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" placeholder="Search members..." id="directorySearch">
                            </div>
                            <div class="directory-actions">
                                <button class="btn-outline">
                                    <i class="fas fa-download"></i> Export PDF
                                </button>
                                <button class="btn-outline">
                                    <i class="fas fa-file-excel"></i> Export Excel
                                </button>
                                <button class="btn-primary">
                                    <i class="fas fa-print"></i> Print Directory
                                </button>
                            </div>
                        </div>

                        <div class="directory-grid">
                            ${sampleMembers.map(member => `
                                <div class="directory-card">
                                    <div class="member-avatar large">${member.name.charAt(0)}</div>
                                    <div class="member-info">
                                        <h4>${member.name}</h4>
                                        <p class="member-number">${member.memberNumber}</p>
                                        <p class="member-role">${member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                                    </div>
                                    <div class="contact-details">
                                        <div class="contact-item">
                                            <i class="fas fa-phone"></i>
                                            <span>${member.phone}</span>
                                        </div>
                                        <div class="contact-item">
                                            <i class="fas fa-envelope"></i>
                                            <span>${member.email}</span>
                                        </div>
                                        <div class="contact-item">
                                            <i class="fas fa-map-marker-alt"></i>
                                            <span>${member.address || 'Address not provided'}</span>
                                        </div>
                                        <div class="contact-item">
                                            <i class="fas fa-user-friends"></i>
                                            <span>${member.emergencyContact || 'Emergency contact not provided'}</span>
                                        </div>
                                    </div>
                                    <div class="member-actions">
                                        <button class="btn-outline">
                                            <i class="fas fa-phone"></i> Call
                                        </button>
                                        <button class="btn-outline">
                                            <i class="fas fa-envelope"></i> Email
                                        </button>
                                        <button class="btn-outline">
                                            <i class="fas fa-edit"></i> Edit
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button class="btn-primary" onclick="closeModal()">Close</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Notification dropdown functions
    function toggleNotificationDropdown() {
        console.log('Toggle notification dropdown');
    }
    
    function toggleUserMenu() {
        console.log('Toggle user menu');
    }
    
    // Action Functions
    window.scheduleMeeting = function() {
        const title = document.getElementById('meetingTitle').value;
        const date = document.getElementById('meetingDate').value;
        const time = document.getElementById('meetingTime').value;
        const location = document.getElementById('meetingLocation').value;

        if (!title || !date || !time || !location) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        showNotification(`Meeting scheduled: ${title} on ${formatDate(date)} at ${formatTime(time)}`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.saveDraftMeeting = function() {
        showNotification('Meeting saved as draft', 'info');
        closeModal();
    };

    window.saveAttendance = function() {
        const meetingId = document.getElementById('attendanceMeeting').value;
        if (!meetingId) {
            showNotification('Please select a meeting', 'error');
            return;
        }

        const attendanceData = [];
        sampleMembers.forEach(member => {
            const selectedOption = document.querySelector(`input[name="attendance_${member.id}"]:checked`);
            if (selectedOption) {
                attendanceData.push({
                    memberId: member.id,
                    memberName: member.name,
                    status: selectedOption.value
                });
            }
        });

        showNotification(`Attendance recorded for ${attendanceData.length} members`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.markAllPresent = function() {
        sampleMembers.forEach(member => {
            const presentRadio = document.querySelector(`input[name="attendance_${member.id}"][value="present"]`);
            if (presentRadio) {
                presentRadio.checked = true;
            }
        });
        updateAttendanceSummary();
    };

    window.markAllAbsent = function() {
        sampleMembers.forEach(member => {
            const absentRadio = document.querySelector(`input[name="attendance_${member.id}"][value="absent"]`);
            if (absentRadio) {
                absentRadio.checked = true;
            }
        });
        updateAttendanceSummary();
    };

    window.resetAttendance = function() {
        sampleMembers.forEach(member => {
            const radios = document.querySelectorAll(`input[name="attendance_${member.id}"]`);
            radios.forEach(radio => radio.checked = false);
        });
        updateAttendanceSummary();
    };

    window.saveAndDistributeMinutes = function() {
        const meetingId = document.getElementById('minutesMeeting').value;
        const content = document.getElementById('minutesEditor').innerHTML;

        if (!meetingId) {
            showNotification('Please select a meeting', 'error');
            return;
        }

        if (!content.trim()) {
            showNotification('Please enter meeting minutes content', 'error');
            return;
        }

        showNotification('Meeting minutes saved and distributed to all members', 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.saveDraftMinutes = function() {
        showNotification('Meeting minutes saved as draft', 'info');
        closeModal();
    };

    window.addActionItem = function() {
        const actionItems = document.getElementById('actionItems');
        const newItem = document.createElement('div');
        newItem.className = 'action-item';
        newItem.innerHTML = `
            <input type="text" placeholder="Action item description" class="action-description">
            <select class="action-assignee">
                <option value="">Assign to...</option>
                ${sampleMembers.map(member =>
                    `<option value="${member.id}">${member.name}</option>`
                ).join('')}
            </select>
            <input type="date" class="action-due-date">
            <button type="button" class="btn-outline remove-action" onclick="removeActionItem(this)">Remove</button>
        `;
        actionItems.appendChild(newItem);
    };

    window.removeActionItem = function(button) {
        button.closest('.action-item').remove();
    };

    window.formatText = function(command) {
        document.execCommand(command, false, null);
    };

    window.insertList = function() {
        document.execCommand('insertUnorderedList', false, null);
    };

    window.insertNumberedList = function() {
        document.execCommand('insertOrderedList', false, null);
    };

    window.sendAnnouncement = function() {
        const type = document.getElementById('announcementType').value;
        const subject = document.getElementById('announcementSubject').value;
        const content = document.getElementById('announcementContent').value;

        if (!subject || !content) {
            showNotification('Please fill in subject and content', 'error');
            return;
        }

        const selectedRecipients = document.querySelector('input[name="recipients"]:checked').value;
        let recipientCount = 0;

        if (selectedRecipients === 'all') {
            recipientCount = sampleMembers.length;
        } else if (selectedRecipients === 'officers') {
            recipientCount = sampleMembers.filter(m => m.role !== 'member').length;
        } else {
            const checkedBoxes = document.querySelectorAll('#customRecipients input[type="checkbox"]:checked');
            recipientCount = checkedBoxes.length;
        }

        showNotification(`Announcement sent to ${recipientCount} members`, 'success');
        closeModal();
        updateDashboardMetrics();
    };

    window.previewAnnouncement = function() {
        const subject = document.getElementById('announcementSubject').value;
        const content = document.getElementById('announcementContent').value;

        if (!subject || !content) {
            showNotification('Please fill in subject and content to preview', 'error');
            return;
        }

        // Create preview modal
        const previewModal = document.createElement('div');
        previewModal.className = 'admin-modal';
        previewModal.innerHTML = `
            <div class="admin-modal-content">
                <div class="admin-modal-header">
                    <h3>Announcement Preview</h3>
                    <button class="admin-modal-close" onclick="this.closest('.admin-modal').remove()">&times;</button>
                </div>
                <div class="admin-modal-body">
                    <div class="announcement-preview">
                        <h4>${subject}</h4>
                        <div class="preview-content">${content.replace(/\n/g, '<br>')}</div>
                        <div class="preview-footer">
                            <small>Sent by: Alice Nyirahabimana, Group Secretary</small>
                            <small>Date: ${new Date().toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>
                <div class="admin-modal-footer">
                    <button class="btn-primary" onclick="this.closest('.admin-modal').remove()">Close Preview</button>
                </div>
            </div>
        `;

        document.body.appendChild(previewModal);
    };

    window.uploadDocument = function() {
        const title = document.getElementById('documentTitle').value;
        const category = document.getElementById('documentCategory').value;
        const file = document.getElementById('documentFile').files[0];

        if (!title || !category || !file) {
            showNotification('Please fill in all required fields and select a file', 'error');
            return;
        }

        // Simulate file upload
        showNotification('Document uploaded successfully', 'success');
        closeModal();
        updateDashboardMetrics();
    };

    console.log('Secretary Dashboard initialized successfully');
});
