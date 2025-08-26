// Contact Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    const faqItems = document.querySelectorAll('.faq-item');
    
    // Form Validation
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateContactForm()) {
                submitContactForm();
            }
        });
        
        // Real-time validation
        const formInputs = contactForm.querySelectorAll('input, select, textarea');
        formInputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearError(this);
            });
        });
    }
    
    // FAQ Accordion
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
    
    // Map placeholder click
    const mapPlaceholder = document.querySelector('.map-placeholder');
    if (mapPlaceholder) {
        mapPlaceholder.addEventListener('click', function() {
            // In a real implementation, this would open a map
            alert('Map functionality would be implemented here. This could open Google Maps or integrate with a mapping service.');
        });
    }
    
    // Form Validation Functions
    function validateContactForm() {
        let isValid = true;
        
        const firstName = document.getElementById('firstName');
        const lastName = document.getElementById('lastName');
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        const messageType = document.getElementById('messageType');
        const message = document.getElementById('message');
        
        // Validate required fields
        if (!validateField(firstName)) isValid = false;
        if (!validateField(lastName)) isValid = false;
        if (!validateField(email)) isValid = false;
        if (!validateField(messageType)) isValid = false;
        if (!validateField(message)) isValid = false;
        
        // Validate phone if provided
        if (phone.value && !validateField(phone)) isValid = false;
        
        return isValid;
    }
    
    function validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';
        
        // Clear previous error
        clearError(field);
        
        // Required field validation
        if (field.hasAttribute('required') && !value) {
            errorMessage = 'This field is required';
            isValid = false;
        }
        
        // Specific field validations
        switch (fieldName) {
            case 'firstName':
            case 'lastName':
                if (value && (value.length < 2 || value.length > 50)) {
                    errorMessage = 'Name must be between 2 and 50 characters';
                    isValid = false;
                } else if (value && !/^[a-zA-Z\s'-]+$/.test(value)) {
                    errorMessage = 'Name can only contain letters, spaces, hyphens, and apostrophes';
                    isValid = false;
                }
                break;
                
            case 'email':
                if (value && !isValidEmail(value)) {
                    errorMessage = 'Please enter a valid email address';
                    isValid = false;
                }
                break;
                
            case 'phone':
                if (value && !isValidPhone(value)) {
                    errorMessage = 'Please enter a valid Rwandan phone number (+250 XXX XXX XXX)';
                    isValid = false;
                }
                break;
                
            case 'message':
                if (value && value.length < 10) {
                    errorMessage = 'Message must be at least 10 characters long';
                    isValid = false;
                } else if (value && value.length > 1000) {
                    errorMessage = 'Message must be less than 1000 characters';
                    isValid = false;
                }
                break;
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
    
    function isValidPhone(phone) {
        // Rwandan phone number format: +250 XXX XXX XXX or 0XXX XXX XXX
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
    
    function submitContactForm() {
        const submitButton = contactForm.querySelector('.form-submit');
        const originalText = submitButton.innerHTML;
        
        // Show loading state
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        submitButton.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            contactForm.reset();
            
        }, 2000);
    }
    
    function showSuccessMessage() {
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h4>Message Sent Successfully!</h4>
                <p>Thank you for contacting us. We'll get back to you within 24 hours.</p>
            </div>
        `;
        
        // Insert before form
        contactForm.parentNode.insertBefore(successMessage, contactForm);
        
        // Remove after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
        
        // Scroll to success message
        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            
            if (value.startsWith('250')) {
                value = '+' + value;
            } else if (value.startsWith('0')) {
                // Keep as is for local format
            } else if (value.length > 0) {
                value = '+250' + value;
            }
            
            // Format with spaces
            if (value.startsWith('+250')) {
                value = value.replace(/(\+250)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
            } else if (value.startsWith('0')) {
                value = value.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
            }
            
            e.target.value = value;
        });
    }
    
    // Character counter for message field
    const messageField = document.getElementById('message');
    if (messageField) {
        const maxLength = 1000;
        
        // Create character counter
        const counter = document.createElement('div');
        counter.className = 'character-counter';
        counter.innerHTML = `<span class="current">0</span>/${maxLength} characters`;
        messageField.parentNode.appendChild(counter);
        
        messageField.addEventListener('input', function() {
            const currentLength = this.value.length;
            const currentSpan = counter.querySelector('.current');
            currentSpan.textContent = currentLength;
            
            if (currentLength > maxLength * 0.9) {
                counter.classList.add('warning');
            } else {
                counter.classList.remove('warning');
            }
            
            if (currentLength > maxLength) {
                counter.classList.add('error');
            } else {
                counter.classList.remove('error');
            }
        });
    }
    
    console.log('Contact page initialized successfully');
});
