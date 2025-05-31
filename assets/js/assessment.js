// Assessment form functionality
let currentStep = 1;
const totalSteps = 4;
let formData = {};

// Initialize assessment form
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    setupEventListeners();
    loadSavedData();
});

function initializeForm() {
    showStep(1);
    updateStepIndicators();
    updateNavigationButtons();
}

function setupEventListeners() {
    // Navigation buttons
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    if (nextBtn) {
        nextBtn.addEventListener('click', handleNext);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', handlePrevious);
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('click', handleSubmit);
    }
    
    // Form validation on input
    const form = document.getElementById('assessmentForm');
    if (form) {
        form.addEventListener('input', handleInputChange);
        form.addEventListener('change', handleInputChange);
    }
    
    // Auto-save functionality
    setInterval(saveFormData, 30000); // Save every 30 seconds
}

function showStep(step) {
    // Hide all steps
    for (let i = 1; i <= totalSteps; i++) {
        const stepElement = document.getElementById(`step${i}`);
        if (stepElement) {
            stepElement.classList.add('hidden');
        }
    }
    
    // Show current step
    const currentStepElement = document.getElementById(`step${step}`);
    if (currentStepElement) {
        currentStepElement.classList.remove('hidden');
    }
    
    currentStep = step;
    updateStepIndicators();
    updateNavigationButtons();
}

function updateStepIndicators() {
    for (let i = 1; i <= totalSteps; i++) {
        const indicator = document.getElementById(`step${i}-indicator`);
        if (indicator) {
            const span = indicator.querySelector('span');
            
            if (i < currentStep) {
                // Completed step
                indicator.className = 'flex items-center justify-center w-10 h-10 bg-green-500 rounded-full lg:h-12 lg:w-12 shrink-0';
                span.className = 'text-white font-bold';
                span.innerHTML = '✓';
            } else if (i === currentStep) {
                // Current step
                indicator.className = 'flex items-center justify-center w-10 h-10 bg-blue-600 rounded-full lg:h-12 lg:w-12 shrink-0';
                span.className = 'text-white font-bold';
                span.textContent = i;
            } else {
                // Future step
                indicator.className = 'flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full lg:h-12 lg:w-12 shrink-0';
                span.className = 'text-gray-500 font-bold';
                span.textContent = i;
            }
        }
    }
}

function updateNavigationButtons() {
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    const submitBtn = document.getElementById('submitBtn');
    
    // Previous button
    if (prevBtn) {
        if (currentStep === 1) {
            prevBtn.classList.add('hidden');
        } else {
            prevBtn.classList.remove('hidden');
        }
    }
    
    // Next/Submit buttons
    if (currentStep === totalSteps) {
        if (nextBtn) nextBtn.classList.add('hidden');
        if (submitBtn) submitBtn.classList.remove('hidden');
    } else {
        if (nextBtn) nextBtn.classList.remove('hidden');
        if (submitBtn) submitBtn.classList.add('hidden');
    }
}

function handleNext() {
    if (validateCurrentStep()) {
        saveFormData();
        if (currentStep < totalSteps) {
            showStep(currentStep + 1);
        }
    }
}

function handlePrevious() {
    if (currentStep > 1) {
        saveFormData();
        showStep(currentStep - 1);
    }
}

function validateCurrentStep() {
    const currentStepElement = document.getElementById(`step${currentStep}`);
    if (!currentStepElement) return false;
    
    const requiredFields = currentStepElement.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Additional validation for specific steps
    if (currentStep === 1) {
        isValid = validateStep1() && isValid;
    } else if (currentStep === 2) {
        isValid = validateStep2() && isValid;
    }
    
    return isValid;
}

function validateStep1() {
    const age = document.getElementById('age');
    const height = document.getElementById('height');
    const weight = document.getElementById('weight');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    
    let isValid = true;
    
    // Age validation
    if (age && (age.value < 18 || age.value > 80)) {
        showFieldError(age, window.TRTLanguage.getValidationMessage('age'));
        isValid = false;
    } else if (age) {
        clearFieldError(age);
    }
    
    // Height validation
    if (height && (height.value < 150 || height.value > 220)) {
        showFieldError(height, window.TRTLanguage.getValidationMessage('height'));
        isValid = false;
    } else if (height) {
        clearFieldError(height);
    }
    
    // Weight validation
    if (weight && (weight.value < 50 || weight.value > 200)) {
        showFieldError(weight, window.TRTLanguage.getValidationMessage('weight'));
        isValid = false;
    } else if (weight) {
        clearFieldError(weight);
    }
    
    // Email validation
    if (email && !isValidEmail(email.value)) {
        showFieldError(email, window.TRTLanguage.getValidationMessage('email'));
        isValid = false;
    } else if (email) {
        clearFieldError(email);
    }
    
    // Phone validation
    if (phone && !isValidPhone(phone.value)) {
        showFieldError(phone, window.TRTLanguage.getValidationMessage('phone'));
        isValid = false;
    } else if (phone) {
        clearFieldError(phone);
    }
    
    return isValid;
}

function validateStep2() {
    // Check if at least one symptom is rated
    const symptoms = ['energy', 'libido', 'muscle', 'mood'];
    let hasRating = false;
    
    symptoms.forEach(symptom => {
        const radios = document.querySelectorAll(`input[name="${symptom}"]`);
        radios.forEach(radio => {
            if (radio.checked) {
                hasRating = true;
            }
        });
    });
    
    if (!hasRating) {
        showAlert(window.TRTLanguage.t('Please rate at least one symptom'), 'error');
        return false;
    }
    
    return true;
}

function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        const fieldName = field.previousElementSibling?.textContent || field.name;
        showFieldError(field, window.TRTLanguage.getValidationMessage('required', fieldName));
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    field.classList.add('form-error');
    
    // Remove existing error message
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Add new error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('form-error');
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');
    
    // Allow various phone number formats:
    // - International: +49123456789, +1234567890
    // - National: 0123456789, 123456789
    // - With country code: 49123456789
    // Length should be between 7 and 15 digits (excluding +)
    
    const phoneRegex = /^(\+?[\d]{1,3})?[\d]{6,14}$/;
    
    // Additional check: if it starts with +, ensure it has at least 10 total digits
    if (cleaned.startsWith('+')) {
        return phoneRegex.test(cleaned) && cleaned.length >= 10;
    }
    
    // For numbers without +, allow 7-15 digits
    return phoneRegex.test(cleaned) && cleaned.length >= 7 && cleaned.length <= 15;
}

function handleInputChange(event) {
    const field = event.target;
    
    // Real-time validation
    if (field.hasAttribute('required') || field.value.trim()) {
        validateField(field);
    }
    
    // Auto-save on significant changes
    if (field.type !== 'radio' && field.type !== 'checkbox') {
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(saveFormData, 2000);
    }
}

function saveFormData() {
    const form = document.getElementById('assessmentForm');
    if (!form) return;
    
    const data = new FormData(form);
    const formObject = {};
    
    // Convert FormData to object
    for (let [key, value] of data.entries()) {
        if (formObject[key]) {
            // Handle multiple values (checkboxes)
            if (Array.isArray(formObject[key])) {
                formObject[key].push(value);
            } else {
                formObject[key] = [formObject[key], value];
            }
        } else {
            formObject[key] = value;
        }
    }
    
    // Save to localStorage
    localStorage.setItem('trt-assessment-data', JSON.stringify(formObject));
    formData = formObject;
}

function loadSavedData() {
    const savedData = localStorage.getItem('trt-assessment-data');
    if (savedData) {
        try {
            formData = JSON.parse(savedData);
            populateForm(formData);
        } catch (error) {
            console.error('Error loading saved data:', error);
        }
    }
}

function populateForm(data) {
    Object.keys(data).forEach(key => {
        const field = document.querySelector(`[name="${key}"]`);
        if (field) {
            if (field.type === 'radio') {
                const radio = document.querySelector(`[name="${key}"][value="${data[key]}"]`);
                if (radio) radio.checked = true;
            } else if (field.type === 'checkbox') {
                if (Array.isArray(data[key])) {
                    data[key].forEach(value => {
                        const checkbox = document.querySelector(`[name="${key}"][value="${value}"]`);
                        if (checkbox) checkbox.checked = true;
                    });
                } else {
                    field.checked = true;
                }
            } else {
                field.value = data[key];
            }
        }
    });
}

function calculateAssessmentScore() {
    const symptoms = ['energy', 'libido', 'muscle', 'mood'];
    let totalScore = 0;
    let ratedSymptoms = 0;
    
    symptoms.forEach(symptom => {
        const value = formData[symptom];
        if (value) {
            totalScore += parseInt(value);
            ratedSymptoms++;
        }
    });
    
    return ratedSymptoms > 0 ? totalScore / ratedSymptoms : 0;
}

function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateCurrentStep()) {
        return;
    }
    
    saveFormData();
    
    // Calculate assessment score
    const score = calculateAssessmentScore();
    formData.assessmentScore = score;
    formData.timestamp = new Date().toISOString();
    
    // Show loading state
    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
    }
    
    // Send to Zapier (simulated)
    sendToZapier(formData)
        .then(response => {
            // Clear saved data
            localStorage.removeItem('trt-assessment-data');
            
            // Redirect to consultation page
            window.location.href = 'consultation.html';
        })
        .catch(error => {
            console.error('Submission error:', error);
            showAlert(window.TRTLanguage.t('error'), 'error');
            
            // Remove loading state
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
            }
        });
}

function sendToZapier(data) {
    // Simulated Zapier webhook call
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('Assessment data:', data);
            
            // Simulate success/failure
            if (Math.random() > 0.1) { // 90% success rate
                resolve({ success: true });
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
    
    // Real implementation would be:
    /*
    return fetch('YOUR_ZAPIER_WEBHOOK_URL', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    });
    */
}

function showAlert(message, type = 'info') {
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
        type === 'error' ? 'bg-red-100 text-red-700 border border-red-400' :
        type === 'success' ? 'bg-green-100 text-green-700 border border-green-400' :
        'bg-blue-100 text-blue-700 border border-blue-400'
    }`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.parentNode.removeChild(alert);
        }
    }, 5000);
} 