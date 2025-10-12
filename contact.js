// Contact form functionality
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formStatus = document.getElementById('formStatus');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');

    // Form validation patterns
    const validationRules = {
        name: {
            required: true,
            minLength: 2,
            pattern: /^[a-zA-Z\s\-'\.]+$/,
            message: 'Please enter a valid name (letters, spaces, hyphens, apostrophes only)'
        },
        email: {
            required: true,
            pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Please enter a valid email address'
        },
        subject: {
            required: true,
            message: 'Please select a subject'
        },
        message: {
            required: true,
            minLength: 10,
            maxLength: 1000,
            message: 'Message must be between 10 and 1000 characters'
        }
    };

    // Clear error message
    function clearError(fieldName) {
        const errorElement = document.getElementById(fieldName + 'Error');
        const field = document.getElementById(fieldName);
        if (errorElement) {
            errorElement.textContent = '';
            errorElement.style.display = 'none';
        }
        if (field) {
            field.classList.remove('error');
        }
    }

    // Show error message
    function showError(fieldName, message) {
        const errorElement = document.getElementById(fieldName + 'Error');
        const field = document.getElementById(fieldName);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
        if (field) {
            field.classList.add('error');
        }
    }

    // Validate individual field
    function validateField(fieldName, value) {
        const rules = validationRules[fieldName];
        if (!rules) return true;

        clearError(fieldName);

        // Required check
        if (rules.required && (!value || value.trim().length === 0)) {
            showError(fieldName, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`);
            return false;
        }

        // Skip other validations if field is empty and not required
        if (!value || value.trim().length === 0) return true;

        // Length checks
        if (rules.minLength && value.trim().length < rules.minLength) {
            showError(fieldName, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${rules.minLength} characters`);
            return false;
        }

        if (rules.maxLength && value.trim().length > rules.maxLength) {
            showError(fieldName, `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${rules.maxLength} characters`);
            return false;
        }

        // Pattern check
        if (rules.pattern && !rules.pattern.test(value.trim())) {
            showError(fieldName, rules.message);
            return false;
        }

        return true;
    }

    // Real-time validation
    Object.keys(validationRules).forEach(fieldName => {
        const field = document.getElementById(fieldName);
        if (field) {
            field.addEventListener('blur', function() {
                validateField(fieldName, this.value);
            });

            field.addEventListener('input', function() {
                // Clear error on input if field was previously invalid
                if (field.classList.contains('error')) {
                    clearError(fieldName);
                }
            });
        }
    });

    // Show form status message
    function showStatus(message, type = 'info') {
        formStatus.textContent = message;
        formStatus.className = `form-status ${type}`;
        formStatus.style.display = 'block';
        
        // Auto-hide success messages after 5 seconds
        if (type === 'success') {
            setTimeout(() => {
                formStatus.style.display = 'none';
            }, 5000);
        }
    }

    // Set loading state
    function setLoading(isLoading) {
        submitBtn.disabled = isLoading;
        if (isLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.classList.add('loading');
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            submitBtn.classList.remove('loading');
        }
    }

    // Simulate form submission (replace with actual endpoint)
    async function submitForm(formData) {
        // In a real implementation, you would send this to your backend
        // For now, we'll simulate a successful submission
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log('Form submission data:', Object.fromEntries(formData));
                resolve({ success: true, message: 'Message sent successfully!' });
            }, 2000);
        });
    }

    // Handle form submission
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Clear previous status
        formStatus.style.display = 'none';
        
        // Validate all fields
        let isValid = true;
        const formData = new FormData(contactForm);
        
        Object.keys(validationRules).forEach(fieldName => {
            const value = formData.get(fieldName) || '';
            if (!validateField(fieldName, value)) {
                isValid = false;
            }
        });

        if (!isValid) {
            showStatus('Please correct the errors above and try again.', 'error');
            return;
        }

        // Set loading state
        setLoading(true);

        try {
            // Submit form (simulated)
            const result = await submitForm(formData);
            
            if (result.success) {
                showStatus(result.message, 'success');
                contactForm.reset(); // Clear form on success
            } else {
                showStatus(result.message || 'Something went wrong. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showStatus('Unable to send message. Please try again later or contact us directly via email.', 'error');
        } finally {
            setLoading(false);
        }
    });

    // Add smooth scrolling for anchor links (if any)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});