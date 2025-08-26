// Reset Password Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const tokenStatus = document.getElementById('tokenStatus');
    const resetComplete = document.getElementById('resetComplete');
    const resetError = document.getElementById('resetError');
    const newPasswordField = document.getElementById('newPassword');
    const confirmPasswordField = document.getElementById('confirmNewPassword');
    
    let isTokenValid = false;
    
    // Initialize page
    validateResetToken();
    
    // Form submission handling
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateResetForm()) {
                submitPasswordReset();
            }
        });
        
        // Real-time validation
        const formInputs = resetPasswordForm.querySelectorAll('input');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearError(this);
                
                if (this.id === 'newPassword') {
                    checkPasswordStrength(this.value);
                    updatePasswordRequirements(this.value);
                }
                
                if (this.id === 'confirmNewPassword') {
                    validatePasswordMatch();
                }
            });
        });
    }
    
    // Token Validation
    function validateResetToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const email = urlParams.get('email');
        
        if (!token || !email) {
            showTokenError('Missing reset token or email parameter');
            return;
        }
        
        // Simulate token validation API call
        setTimeout(() => {
            // For demo purposes, validate based on token format
            if (isValidTokenFormat(token) && isValidEmail(email)) {
                showTokenSuccess();
            } else {
                showTokenError('Invalid or expired reset token');
            }
        }, 1500);
    }
    
    function isValidTokenFormat(token) {
        // Simulate token validation - in real app, this would be an API call
        // For demo, accept tokens that are 32+ characters and alphanumeric
        return token && token.length >= 32 && /^[a-zA-Z0-9]+$/.test(token);
    }
    
    function showTokenSuccess() {
        isTokenValid = true;
        tokenStatus.innerHTML = `
            <div class="token-valid">
                <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                <span style="color: var(--success-color);">Reset link verified successfully</span>
            </div>
        `;
        
        // Show the form
        setTimeout(() => {
            resetPasswordForm.style.display = 'block';
            newPasswordField.focus();
        }, 500);
    }
    
    function showTokenError(message) {
        isTokenValid = false;
        tokenStatus.style.display = 'none';
        resetError.style.display = 'block';
        
        const errorMessageElement = document.getElementById('errorMessage');
        if (errorMessageElement) {
            errorMessageElement.textContent = message;
        }
    }
    
    // Form Validation
    function validateResetForm() {
        let isValid = true;
        
        if (!validateField(newPasswordField)) isValid = false;
        if (!validateField(confirmPasswordField)) isValid = false;
        if (!validatePasswordMatch()) isValid = false;
        
        return isValid && isTokenValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        clearError(field);
        
        if (!value) {
            errorMessage = 'This field is required';
            isValid = false;
        } else {
            switch (fieldName) {
                case 'newPassword':
                    if (value.length < 8) {
                        errorMessage = 'Password must be at least 8 characters long';
                        isValid = false;
                    } else if (!isStrongPassword(value)) {
                        errorMessage = 'Password must meet all requirements below';
                        isValid = false;
                    }
                    break;
                    
                case 'confirmNewPassword':
                    const newPassword = newPasswordField.value;
                    if (value !== newPassword) {
                        errorMessage = 'Passwords do not match';
                        isValid = false;
                    }
                    break;
            }
        }
        
        if (!isValid) {
            showError(field, errorMessage);
        }
        
        return isValid;
    }
    
    function validatePasswordMatch() {
        const newPassword = newPasswordField.value;
        const confirmPassword = confirmPasswordField.value;
        
        if (newPassword && confirmPassword && newPassword !== confirmPassword) {
            showError(confirmPasswordField, 'Passwords do not match');
            return false;
        }
        
        return true;
    }
    
    function isStrongPassword(password) {
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[^a-zA-Z\d]/.test(password)
        };
        
        return Object.values(requirements).every(req => req);
    }
    
    // Password Strength Checker
    function checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        
        if (!strengthBar || !strengthText) return;
        
        let strength = 0;
        let strengthLabel = '';
        
        // Length check
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        
        // Character variety checks
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        
        // Determine strength level
        if (strength <= 2) {
            strengthLabel = 'Weak';
            strengthBar.className = 'strength-bar weak';
        } else if (strength <= 3) {
            strengthLabel = 'Fair';
            strengthBar.className = 'strength-bar fair';
        } else if (strength <= 4) {
            strengthLabel = 'Good';
            strengthBar.className = 'strength-bar good';
        } else {
            strengthLabel = 'Strong';
            strengthBar.className = 'strength-bar strong';
        }
        
        strengthText.textContent = `Password strength: ${strengthLabel}`;
    }
    
    // Password Requirements Checker
    function updatePasswordRequirements(password) {
        const requirements = {
            'req-length': password.length >= 8,
            'req-uppercase': /[A-Z]/.test(password),
            'req-lowercase': /[a-z]/.test(password),
            'req-number': /\d/.test(password),
            'req-special': /[^a-zA-Z\d]/.test(password)
        };
        
        Object.entries(requirements).forEach(([id, met]) => {
            const element = document.getElementById(id);
            if (element) {
                if (met) {
                    element.classList.add('valid');
                    element.querySelector('i').className = 'fas fa-check';
                } else {
                    element.classList.remove('valid');
                    element.querySelector('i').className = 'fas fa-times';
                }
            }
        });
    }
    
    // Form Submission
    function submitPasswordReset() {
        const submitButton = resetPasswordForm.querySelector('.auth-submit');
        const originalText = submitButton.innerHTML;
        const newPassword = newPasswordField.value;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating Password...';
        submitButton.disabled = true;
        
        // Simulate password reset API call
        setTimeout(() => {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Simulate successful password reset
            showResetSuccess();
            
        }, 2500);
    }
    
    function showResetSuccess() {
        // Hide the form
        resetPasswordForm.style.display = 'none';
        
        // Show success message
        resetComplete.style.display = 'block';
        
        // Scroll to success message
        resetComplete.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Auto-redirect to login after 5 seconds
        setTimeout(() => {
            const signInButton = resetComplete.querySelector('.btn-primary');
            if (signInButton) {
                signInButton.click();
            }
        }, 5000);
    }
    
    // Utility Functions
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
    
    // Keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const form = activeElement.closest('form');
                if (form && form.id === 'resetPasswordForm') {
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton && !submitButton.disabled) {
                        submitButton.click();
                    }
                }
            }
        }
    });
    
    // Generate demo reset link for testing
    if (window.location.search === '') {
        // If no parameters, add demo parameters for testing
        const demoToken = 'demo123456789012345678901234567890';
        const demoEmail = 'user@example.com';
        const newUrl = `${window.location.pathname}?token=${demoToken}&email=${demoEmail}`;
        window.history.replaceState({}, '', newUrl);
        validateResetToken();
    }
    
    console.log('Reset password page initialized successfully');
});
