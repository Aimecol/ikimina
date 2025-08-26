// Forgot Password Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetSuccess = document.getElementById('resetSuccess');
    const resendButton = document.getElementById('resendLink');
    let resendCooldown = 0;
    let resendTimer = null;
    
    // Form submission handling
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForgotPasswordForm()) {
                submitForgotPasswordForm();
            }
        });
        
        // Real-time validation
        const emailInput = document.getElementById('resetEmail');
        if (emailInput) {
            emailInput.addEventListener('blur', function() {
                validateField(this);
            });
            
            emailInput.addEventListener('input', function() {
                clearError(this);
            });
        }
    }
    
    // Resend link functionality
    if (resendButton) {
        resendButton.addEventListener('click', function() {
            if (resendCooldown === 0) {
                resendResetLink();
            }
        });
    }
    
    // Form Validation
    function validateForgotPasswordForm() {
        const emailInput = document.getElementById('resetEmail');
        return validateField(emailInput);
    }
    
    function validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';
        
        clearError(field);
        
        if (!value) {
            errorMessage = 'Email address is required';
            isValid = false;
        } else if (!isValidEmail(value)) {
            errorMessage = 'Please enter a valid email address';
            isValid = false;
        }
        
        if (!isValid) {
            showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function showError(field, message) {
        field.classList.add('error');
        const errorElement = field.parentNode.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    // Form Submission
    function submitForgotPasswordForm() {
        const submitButton = forgotPasswordForm.querySelector('.auth-submit');
        const originalText = submitButton.innerHTML;
        const emailInput = document.getElementById('resetEmail');
        const email = emailInput.value.trim();
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Simulate API call to send reset email
        setTimeout(() => {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Check if email exists in system (simulation)
            if (isEmailRegistered(email)) {
                showSuccessMessage(email);
            } else {
                // For security, we still show success even if email doesn't exist
                // This prevents email enumeration attacks
                showSuccessMessage(email);
            }
            
        }, 2000);
    }
    
    // Simulate email registration check
    function isEmailRegistered(email) {
        // In a real application, this would be an API call
        // For demo purposes, we'll consider some emails as "registered"
        const registeredEmails = [
            'user@example.com',
            'admin@ikimina.rw',
            'test@test.com',
            'demo@ikimina.rw'
        ];
        
        return registeredEmails.includes(email.toLowerCase());
    }
    
    function showSuccessMessage(email) {
        // Hide the form
        forgotPasswordForm.style.display = 'none';
        
        // Show success message
        resetSuccess.style.display = 'block';
        
        // Update the email in the success message
        const sentEmailElement = document.getElementById('sentEmail');
        if (sentEmailElement) {
            sentEmailElement.textContent = email;
        }
        
        // Start resend cooldown
        startResendCooldown();
        
        // Scroll to success message
        resetSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Resend Link Functionality
    function resendResetLink() {
        const emailInput = document.getElementById('resetEmail');
        const email = emailInput ? emailInput.value.trim() : '';
        
        if (!email) {
            alert('Please enter your email address first.');
            return;
        }
        
        const originalText = resendButton.innerHTML;
        
        // Show loading state
        resendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        resendButton.disabled = true;
        
        // Simulate resend API call
        setTimeout(() => {
            // Reset button text
            resendButton.innerHTML = originalText;
            
            // Show success notification
            showResendNotification();
            
            // Start cooldown again
            startResendCooldown();
            
        }, 1500);
    }
    
    function showResendNotification() {
        // Create temporary notification
        const notification = document.createElement('div');
        notification.className = 'resend-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-check-circle"></i>
                <span>Reset link sent again!</span>
            </div>
        `;
        
        // Insert notification
        resetSuccess.insertBefore(notification, resetSuccess.firstChild);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
    
    function startResendCooldown() {
        resendCooldown = 60; // 60 seconds cooldown
        resendButton.disabled = true;
        resendButton.classList.add('countdown');
        
        resendTimer = setInterval(() => {
            resendCooldown--;
            resendButton.setAttribute('data-countdown', `(${resendCooldown}s)`);
            
            if (resendCooldown <= 0) {
                clearInterval(resendTimer);
                resendButton.disabled = false;
                resendButton.classList.remove('countdown');
                resendButton.removeAttribute('data-countdown');
            }
        }, 1000);
    }
    
    // Auto-focus email input
    const emailInput = document.getElementById('resetEmail');
    if (emailInput) {
        emailInput.focus();
    }
    
    // Handle back navigation
    window.addEventListener('popstate', function() {
        // If user navigates back, reset the form
        if (resetSuccess.style.display === 'block') {
            resetSuccess.style.display = 'none';
            forgotPasswordForm.style.display = 'block';
            forgotPasswordForm.reset();
            
            if (resendTimer) {
                clearInterval(resendTimer);
                resendCooldown = 0;
                resendButton.disabled = false;
                resendButton.classList.remove('countdown');
                resendButton.removeAttribute('data-countdown');
            }
        }
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const form = activeElement.closest('form');
                if (form && form.id === 'forgotPasswordForm') {
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton && !submitButton.disabled) {
                        submitButton.click();
                    }
                }
            }
        }
    });
    
    // Email input formatting
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            // Convert to lowercase for consistency
            this.value = this.value.toLowerCase();
        });
    }
    
    // Check for URL parameters (if coming from login page with email)
    const urlParams = new URLSearchParams(window.location.search);
    const prefilledEmail = urlParams.get('email');
    if (prefilledEmail && emailInput) {
        emailInput.value = prefilledEmail;
    }
    
    console.log('Forgot password page initialized successfully');
});
