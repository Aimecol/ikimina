// Authentication Pages JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Password toggle functionality
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordField = targetId ? 
                document.getElementById(targetId) : 
                this.parentNode.querySelector('input[type="password"], input[type="text"]');
            
            if (passwordField) {
                const isPassword = passwordField.type === 'password';
                passwordField.type = isPassword ? 'text' : 'password';
                
                const icon = this.querySelector('i');
                icon.className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
            }
        });
    });
    
    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateLoginForm()) {
                submitLoginForm();
            }
        });
        
        // Real-time validation
        const loginInputs = loginForm.querySelectorAll('input');
        loginInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateLoginField(this);
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        });
    }
    
    // Social login buttons
    const socialButtons = document.querySelectorAll('.btn-social');
    socialButtons.forEach(button => {
        button.addEventListener('click', function() {
            const provider = this.classList.contains('google') ? 'Google' : 'Microsoft';
            alert(`${provider} authentication would be implemented here. This would redirect to ${provider}'s OAuth flow.`);
        });
    });
    
    // Login Form Validation
    function validateLoginForm() {
        let isValid = true;
        
        const email = document.getElementById('loginEmail');
        const password = document.getElementById('loginPassword');
        
        if (!validateLoginField(email)) isValid = false;
        if (!validateLoginField(password)) isValid = false;
        
        return isValid;
    }
    
    function validateLoginField(field) {
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
                case 'loginEmail':
                    if (!isValidEmailOrPhone(value)) {
                        errorMessage = 'Please enter a valid email address or phone number';
                        isValid = false;
                    }
                    break;
                    
                case 'loginPassword':
                    if (value.length < 6) {
                        errorMessage = 'Password must be at least 6 characters';
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
    
    function isValidEmailOrPhone(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^(\+250|0)[0-9]{9}$/;
        const cleanValue = value.replace(/\s/g, '');
        
        return emailRegex.test(value) || phoneRegex.test(cleanValue);
    }
    
    function submitLoginForm() {
        const submitButton = loginForm.querySelector('.auth-submit');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        submitButton.disabled = true;
        
        // Simulate login (replace with actual API call)
        setTimeout(() => {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Simulate successful login
            alert('Login successful! In a real application, this would redirect to the dashboard.');
            
        }, 2000);
    }
    
    // Forgot password handling
    const forgotLink = document.querySelector('.forgot-link');
    if (forgotLink) {
        forgotLink.addEventListener('click', function(e) {
            e.preventDefault();
            showForgotPasswordModal();
        });
    }
    
    function showForgotPasswordModal() {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Reset Password</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Enter your email address and we'll send you a link to reset your password.</p>
                    <form id="forgotPasswordForm">
                        <div class="form-group">
                            <label for="resetEmail">Email Address</label>
                            <input type="email" id="resetEmail" name="resetEmail" required>
                            <span class="error-message"></span>
                        </div>
                        <button type="submit" class="btn-primary">Send Reset Link</button>
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
        const forgotForm = modal.querySelector('#forgotPasswordForm');
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('resetEmail');
            if (email.value && isValidEmail(email.value)) {
                alert('Password reset link sent! Check your email.');
                modal.remove();
            } else {
                showError(email, 'Please enter a valid email address');
            }
        });
    }
    
    // Utility functions
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        const phoneRegex = /^(\+250|0)[0-9]{9}$/;
        const cleanPhone = phone.replace(/\s/g, '');
        return phoneRegex.test(cleanPhone);
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
    
    // Remember me functionality
    const rememberCheckbox = document.getElementById('rememberMe');
    if (rememberCheckbox) {
        // Load saved email if remember me was checked
        const savedEmail = localStorage.getItem('rememberedEmail');
        if (savedEmail) {
            const emailField = document.getElementById('loginEmail');
            if (emailField) {
                emailField.value = savedEmail;
                rememberCheckbox.checked = true;
            }
        }
        
        // Save email when form is submitted
        if (loginForm) {
            loginForm.addEventListener('submit', function() {
                const emailField = document.getElementById('loginEmail');
                if (rememberCheckbox.checked && emailField.value) {
                    localStorage.setItem('rememberedEmail', emailField.value);
                } else {
                    localStorage.removeItem('rememberedEmail');
                }
            });
        }
    }
    
    // Auto-focus first input
    const firstInput = document.querySelector('.auth-form input:first-of-type');
    if (firstInput) {
        firstInput.focus();
    }
    
    // Keyboard navigation improvements
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'INPUT') {
                const form = activeElement.closest('form');
                if (form) {
                    const submitButton = form.querySelector('button[type="submit"]');
                    if (submitButton && !submitButton.disabled) {
                        submitButton.click();
                    }
                }
            }
        }
    });
    
    console.log('Authentication page initialized successfully');
});
