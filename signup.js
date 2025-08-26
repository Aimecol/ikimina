// Signup Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    let currentStep = 1;
    const totalSteps = 3;
    
    // Multi-step form navigation
    const nextButtons = document.querySelectorAll('.step-next');
    const prevButtons = document.querySelectorAll('.step-prev');
    const signupForm = document.getElementById('signupForm');
    
    // Step navigation
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            if (validateCurrentStep()) {
                nextStep();
            }
        });
    });
    
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            prevStep();
        });
    });
    
    // Form submission
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateCurrentStep()) {
                submitSignupForm();
            }
        });
    }
    
    // Password strength checker
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('input', function() {
            checkPasswordStrength(this.value);
        });
    }
    
    // Confirm password validation
    const confirmPasswordField = document.getElementById('confirmPassword');
    if (confirmPasswordField) {
        confirmPasswordField.addEventListener('input', function() {
            validatePasswordMatch();
        });
    }
    
    // Group action radio buttons
    const groupActionRadios = document.querySelectorAll('input[name="groupAction"]');
    groupActionRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            toggleGroupFields(this.value);
        });
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            formatPhoneNumber(e.target);
        });
    }
    
    // Real-time validation for all inputs
    const allInputs = signupForm.querySelectorAll('input, select, textarea');
    allInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearError(this);
        });
    });
    
    // Step Navigation Functions
    function nextStep() {
        if (currentStep < totalSteps) {
            hideStep(currentStep);
            currentStep++;
            showStep(currentStep);
            updateProgressIndicator();
        }
    }
    
    function prevStep() {
        if (currentStep > 1) {
            hideStep(currentStep);
            currentStep--;
            showStep(currentStep);
            updateProgressIndicator();
        }
    }
    
    function showStep(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.add('active');
            
            // Focus first input in the step
            const firstInput = stepElement.querySelector('input, select, textarea');
            if (firstInput) {
                setTimeout(() => firstInput.focus(), 100);
            }
        }
    }
    
    function hideStep(step) {
        const stepElement = document.querySelector(`.form-step[data-step="${step}"]`);
        if (stepElement) {
            stepElement.classList.remove('active');
        }
    }
    
    function updateProgressIndicator() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach((step, index) => {
            if (index + 1 <= currentStep) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Validation Functions
    function validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            if (!validateField(input)) {
                isValid = false;
            }
        });
        
        // Additional step-specific validations
        if (currentStep === 2) {
            if (!validatePasswordMatch()) {
                isValid = false;
            }
        }
        
        if (currentStep === 3) {
            if (!validateGroupSelection()) {
                isValid = false;
            }
            
            if (!validateTermsAcceptance()) {
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        clearError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }
        
        // Specific field validations
        if (value) {
            switch (fieldName) {
                case 'firstName':
                case 'lastName':
                    if (value.length < 2 || value.length > 50) {
                        errorMessage = 'Name must be between 2 and 50 characters';
                        isValid = false;
                    } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                        errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                        isValid = false;
                    }
                    break;
                    
                case 'email':
                    if (!isValidEmail(value)) {
                        errorMessage = 'Please enter a valid email address';
                        isValid = false;
                    }
                    break;
                    
                case 'phone':
                    if (!isValidPhone(value)) {
                        errorMessage = 'Please enter a valid Rwandan phone number';
                        isValid = false;
                    }
                    break;
                    
                case 'nationalId':
                    if (value && (value.length !== 16 || !/^\d+$/.test(value))) {
                        errorMessage = 'National ID must be 16 digits';
                        isValid = false;
                    }
                    break;
                    
                case 'password':
                    if (value.length < 8) {
                        errorMessage = 'Password must be at least 8 characters long';
                        isValid = false;
                    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                        errorMessage = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
                        isValid = false;
                    }
                    break;
                    
                case 'groupCode':
                    const joinGroupRadio = document.getElementById('joinGroup');
                    if (joinGroupRadio && joinGroupRadio.checked) {
                        if (value.length !== 6 || !/^[A-Z0-9]+$/.test(value)) {
                            errorMessage = 'Group code must be 6 characters (letters and numbers)';
                            isValid = false;
                        }
                    }
                    break;
                    
                case 'groupName':
                    const createGroupRadio = document.getElementById('createGroup');
                    if (createGroupRadio && createGroupRadio.checked) {
                        if (value.length < 3 || value.length > 100) {
                            errorMessage = 'Group name must be between 3 and 100 characters';
                            isValid = false;
                        }
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
        const password = document.getElementById('password');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (password.value && confirmPassword.value && password.value !== confirmPassword.value) {
            showError(confirmPassword, 'Passwords do not match');
            return false;
        }
        
        return true;
    }
    
    function validateGroupSelection() {
        const joinGroupRadio = document.getElementById('joinGroup');
        const createGroupRadio = document.getElementById('createGroup');
        const groupCode = document.getElementById('groupCode');
        const groupName = document.getElementById('groupName');
        
        if (joinGroupRadio.checked) {
            return validateField(groupCode);
        } else if (createGroupRadio.checked) {
            return validateField(groupName);
        }
        
        return true;
    }
    
    function validateTermsAcceptance() {
        const agreeTerms = document.getElementById('agreeTerms');
        
        if (!agreeTerms.checked) {
            showError(agreeTerms, 'You must agree to the Terms of Service and Privacy Policy');
            return false;
        }
        
        return true;
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
    
    // Group Fields Toggle
    function toggleGroupFields(action) {
        const joinFields = document.querySelector('.join-group-fields');
        const createFields = document.querySelector('.create-group-fields');
        
        if (action === 'join') {
            joinFields.style.display = 'block';
            createFields.style.display = 'none';
            
            // Make group code required
            document.getElementById('groupCode').setAttribute('required', '');
            document.getElementById('groupName').removeAttribute('required');
        } else {
            joinFields.style.display = 'none';
            createFields.style.display = 'block';
            
            // Make group name required
            document.getElementById('groupName').setAttribute('required', '');
            document.getElementById('groupCode').removeAttribute('required');
        }
    }
    
    // Phone Number Formatting
    function formatPhoneNumber(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.startsWith('250')) {
            value = '+' + value;
        } else if (value.startsWith('0')) {
            // Keep as is for local format
        } else if (value.length > 0 && !value.startsWith('0')) {
            value = '+250' + value;
        }
        
        // Format with spaces
        if (value.startsWith('+250')) {
            value = value.replace(/(\+250)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
        } else if (value.startsWith('0')) {
            value = value.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        }
        
        input.value = value;
    }
    
    // Form Submission
    function submitSignupForm() {
        const submitButton = signupForm.querySelector('.auth-submit');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
        submitButton.disabled = true;
        
        // Simulate account creation (replace with actual API call)
        setTimeout(() => {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            showSuccessMessage();
            
        }, 3000);
    }
    
    function showSuccessMessage() {
        alert('Account created successfully! In a real application, this would redirect to email verification or the dashboard.');
    }
    
    // Utility Functions
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
        const errorElement = field.closest('.form-group').querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }
    
    function clearError(field) {
        field.classList.remove('error');
        const errorElement = field.closest('.form-group').querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
    }
    
    // Initialize
    updateProgressIndicator();
    toggleGroupFields('join'); // Default to join group
    
    console.log('Signup page initialized successfully');
});
