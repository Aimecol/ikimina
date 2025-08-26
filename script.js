// Ikimina Platform - Main JavaScript File

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation Toggle
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }

    // Smooth Scrolling for Navigation Links
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
                
                // Close mobile menu if open
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                }
            }
        });
    });

    // Navbar Background on Scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Animate Statistics on Scroll
    const stats = document.querySelectorAll('.stat-number');
    const animateStats = () => {
        stats.forEach(stat => {
            const rect = stat.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                const finalValue = stat.textContent;
                const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
                const suffix = finalValue.replace(/[\d.]/g, '');
                
                if (!stat.classList.contains('animated')) {
                    stat.classList.add('animated');
                    animateNumber(stat, 0, numericValue, suffix, 2000);
                }
            }
        });
    };

    // Number Animation Function
    function animateNumber(element, start, end, suffix, duration) {
        const startTime = performance.now();
        
        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const current = Math.floor(start + (end - start) * easeOutQuart);
            
            element.textContent = formatNumber(current) + suffix;
            
            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            }
        }
        
        requestAnimationFrame(updateNumber);
    }

    // Format Number with Appropriate Suffixes
    function formatNumber(num) {
        if (num >= 1000000000) {
            return (num / 1000000000).toFixed(1) + 'B';
        } else if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    // Scroll event listener for stats animation
    window.addEventListener('scroll', animateStats);
    
    // Initial check for stats animation
    animateStats();

    // Feature Cards Hover Effect
    const featureCards = document.querySelectorAll('.feature-card');
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Pricing Cards Interaction
    const pricingCards = document.querySelectorAll('.pricing-card');
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 10px 10px -5px rgb(0 0 0 / 0.04)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('featured')) {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            }
        });
    });

    // Form Validation (for future forms)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function validatePhone(phone) {
        const re = /^(\+250|0)[0-9]{9}$/;
        return re.test(phone);
    }

    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animateElements = document.querySelectorAll('.feature-card, .step, .pricing-card');
    animateElements.forEach(el => {
        observer.observe(el);
    });

    // Button Click Handlers
    const ctaButtons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-outline');
    ctaButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            // Handle different button actions
            if (href === '#signup') {
                e.preventDefault();
                window.location.href = 'signup.html';
            } else if (href === '#login') {
                e.preventDefault();
                window.location.href = 'login.html';
            } else if (href === '#demo') {
                e.preventDefault();
                showDemoModal();
            } else if (href === '#contact') {
                e.preventDefault();
                window.location.href = 'contact.html';
            }
        });
    });

    // Demo Modal Function
    function showDemoModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Schedule a Demo</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Get a personalized demo of the Ikimina platform and see how it can transform your group's operations.</p>
                    <form id="demoForm">
                        <div class="form-group">
                            <label for="demoName">Full Name</label>
                            <input type="text" id="demoName" name="demoName" required>
                        </div>
                        <div class="form-group">
                            <label for="demoEmail">Email Address</label>
                            <input type="email" id="demoEmail" name="demoEmail" required>
                        </div>
                        <div class="form-group">
                            <label for="demoPhone">Phone Number</label>
                            <input type="tel" id="demoPhone" name="demoPhone" placeholder="+250 XXX XXX XXX">
                        </div>
                        <div class="form-group">
                            <label for="demoGroupSize">Group Size</label>
                            <select id="demoGroupSize" name="demoGroupSize" required>
                                <option value="">Select group size</option>
                                <option value="5-15">5-15 members</option>
                                <option value="16-30">16-30 members</option>
                                <option value="31-50">31-50 members</option>
                                <option value="50+">50+ members</option>
                            </select>
                        </div>
                        <button type="submit" class="btn-primary">Schedule Demo</button>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Handle modal close
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => modal.remove());

        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.remove();
            }
        });

        // Handle form submission
        const demoForm = modal.querySelector('#demoForm');
        demoForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;

            submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Scheduling...';
            submitButton.disabled = true;

            setTimeout(() => {
                alert('Demo scheduled successfully! We will contact you within 24 hours to confirm the time.');
                modal.remove();
            }, 2000);
        });

        // Focus first input
        setTimeout(() => {
            const firstInput = modal.querySelector('input');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    // Utility Functions
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Optimized scroll handler
    const optimizedScrollHandler = debounce(() => {
        animateStats();
    }, 100);

    window.addEventListener('scroll', optimizedScrollHandler);

    // Loading Animation (if needed)
    function showLoading() {
        document.body.classList.add('loading');
    }

    function hideLoading() {
        document.body.classList.remove('loading');
    }

    // Error Handling
    window.addEventListener('error', function(e) {
        console.error('JavaScript Error:', e.error);
        // Could implement error reporting here
    });

    // Performance Monitoring
    if ('performance' in window) {
        window.addEventListener('load', function() {
            setTimeout(() => {
                const perfData = performance.getEntriesByType('navigation')[0];
                console.log('Page Load Time:', perfData.loadEventEnd - perfData.loadEventStart, 'ms');
            }, 0);
        });
    }

    // Accessibility Improvements
    document.addEventListener('keydown', function(e) {
        // Escape key to close modals
        if (e.key === 'Escape') {
            // Close any open modals
            const openModals = document.querySelectorAll('.modal.active');
            openModals.forEach(modal => {
                modal.classList.remove('active');
            });
        }
        
        // Tab navigation improvements
        if (e.key === 'Tab') {
            document.body.classList.add('keyboard-navigation');
        }
    });

    document.addEventListener('mousedown', function() {
        document.body.classList.remove('keyboard-navigation');
    });

    // Initialize tooltips (if using a tooltip library)
    function initializeTooltips() {
        const tooltipElements = document.querySelectorAll('[data-tooltip]');
        tooltipElements.forEach(element => {
            element.addEventListener('mouseenter', showTooltip);
            element.addEventListener('mouseleave', hideTooltip);
        });
    }

    function showTooltip(e) {
        const tooltip = e.target.getAttribute('data-tooltip');
        if (tooltip) {
            // Tooltip implementation would go here
            console.log('Show tooltip:', tooltip);
        }
    }

    function hideTooltip(e) {
        // Hide tooltip implementation would go here
        console.log('Hide tooltip');
    }

    // Initialize all components
    initializeTooltips();
    initializeUserDropdown();

    console.log('Ikimina Platform initialized successfully');
});

// User Dropdown Menu Functionality
function initializeUserDropdown() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');

    if (!userMenuBtn || !userDropdown) {
        return; // Exit if elements don't exist
    }

    // Toggle dropdown on button click
    userMenuBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        toggleUserDropdown();
    });

    // Handle dropdown item clicks
    const dropdownItems = userDropdown.querySelectorAll('.dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            handleDropdownAction(action);
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!userDropdown.contains(e.target) && !userMenuBtn.contains(e.target)) {
            closeUserDropdown();
        }
    });

    // Close dropdown on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeUserDropdown();
        }
    });
}

function toggleUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');

    if (!userDropdown || !userMenuBtn) return;

    const isOpen = userDropdown.classList.contains('show');

    if (isOpen) {
        closeUserDropdown();
    } else {
        openUserDropdown();
    }
}

function openUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');

    if (!userDropdown || !userMenuBtn) return;

    userDropdown.classList.add('show');
    userMenuBtn.classList.add('active');

    // Add ARIA attributes for accessibility
    userMenuBtn.setAttribute('aria-expanded', 'true');
    userDropdown.setAttribute('aria-hidden', 'false');
}

function closeUserDropdown() {
    const userDropdown = document.getElementById('userDropdown');
    const userMenuBtn = document.getElementById('userMenuBtn');

    if (!userDropdown || !userMenuBtn) return;

    userDropdown.classList.remove('show');
    userMenuBtn.classList.remove('active');

    // Update ARIA attributes for accessibility
    userMenuBtn.setAttribute('aria-expanded', 'false');
    userDropdown.setAttribute('aria-hidden', 'true');
}

function handleDropdownAction(action) {
    closeUserDropdown();

    switch (action) {
        case 'notifications':
            handleNotificationsAction();
            break;
        case 'profile':
            handleProfileAction();
            break;
        case 'logout':
            handleLogoutAction();
            break;
        default:
            console.log('Unknown dropdown action:', action);
    }
}

function handleNotificationsAction() {
    // Check if we're on a dashboard with section navigation
    const notificationsSection = document.getElementById('notifications-section');
    const notificationsNavLink = document.querySelector('[data-section="notifications"]');

    if (notificationsSection && notificationsNavLink) {
        // We're on a dashboard with notifications section
        notificationsNavLink.click();
    } else {
        // Navigate to notifications page or show modal
        showNotificationMessage('Navigating to notifications...', 'info');
        // You can implement navigation logic here
        // window.location.href = 'notifications.html';
    }
}

function handleProfileAction() {
    // Check if we're on a dashboard with section navigation
    const profileSection = document.getElementById('profile-section');
    const profileNavLink = document.querySelector('[data-section="profile"]');

    if (profileSection && profileNavLink) {
        // We're on a dashboard with profile section
        profileNavLink.click();
    } else {
        // Navigate to profile page or show modal
        showNotificationMessage('Navigating to profile...', 'info');
        // You can implement navigation logic here
        // window.location.href = 'profile.html';
    }
}

function handleLogoutAction() {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');

    if (confirmLogout) {
        showNotificationMessage('Logging out...', 'info');

        // Simulate logout process
        setTimeout(() => {
            // Clear any stored authentication data
            localStorage.removeItem('userToken');
            sessionStorage.clear();

            // Redirect to login page
            window.location.href = 'login.html';
        }, 1000);
    }
}

// Notification utility function for dropdown actions
function showNotificationMessage(message, type = 'info') {
    // Check if there's an existing notification function
    if (typeof showNotification === 'function') {
        showNotification(message, type);
        return;
    }

    // Create notification element if it doesn't exist
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 300px;
        `;
        document.body.appendChild(notificationContainer);
    }

    // Create notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        background-color: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        margin-bottom: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        font-size: 14px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    notification.textContent = message;

    notificationContainer.appendChild(notification);

    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
