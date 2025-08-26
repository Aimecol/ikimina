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

    console.log('Ikimina Platform initialized successfully');
});
