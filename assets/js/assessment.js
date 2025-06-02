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
    
    // Validate age
    if (!age || age < 18 || age > 100) {
        showFieldError(age, window.eDocLanguage.getValidationMessage('age'));
        isValid = false;
    }
    
    // Validate height
    if (!height || height < 100 || height > 250) {
        showFieldError(height, window.eDocLanguage.getValidationMessage('height'));
        isValid = false;
    }
    
    // Validate weight
    if (!weight || weight < 30 || weight > 300) {
        showFieldError(weight, window.eDocLanguage.getValidationMessage('weight'));
        isValid = false;
    }
    
    // Validate email
    if (!email || !isValidEmail(email.value)) {
        showFieldError(email, window.eDocLanguage.getValidationMessage('email'));
        isValid = false;
    }
    
    // Validate phone
    if (!phone || phone.length < 8) {
        showFieldError(phone, window.eDocLanguage.getValidationMessage('phone'));
        isValid = false;
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
        showAlert(window.eDocLanguage.t('Please rate at least one symptom'), 'error');
        return false;
    }
    
    return true;
}

function validateField(field) {
    if (field.hasAttribute('required') && !field.value.trim()) {
        const fieldName = field.previousElementSibling?.textContent || field.name;
        showFieldError(field, window.eDocLanguage.getValidationMessage('required', fieldName));
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
    localStorage.setItem('edoc-assessment-data', JSON.stringify(formObject));
    formData = formObject;
    
    // Also save to the main data collection system
    const savedData = localStorage.getItem('edoc-assessment-data');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Assessment data saved to localStorage:', parsedData);
    }
}

function loadSavedData() {
    const savedData = localStorage.getItem('edoc-assessment-data');
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
    
    // Save to data collection system
    if (window.eDocDataCollection) {
        console.log('Saving assessment data to collection system...');
        
        // Process and save the data
        const processedData = processAssessmentData(formData);
        window.eDocDataCollection.saveAssessmentData(processedData);
        
        console.log('✅ Assessment data saved successfully');
        
        // Show success message
        showAlert('Assessment completed successfully!', 'success');
        
        // Clear old saved data
        localStorage.removeItem('edoc-assessment-data');
        
        // Redirect to consultation page
        setTimeout(() => {
            window.location.href = 'consultation.html';
        }, 1500);
        
    } else {
        console.error('eDocDataCollection not available');
        showAlert('System error. Please try again.', 'error');
    }
}

function processAssessmentData(rawData) {
    // Convert form data to the expected structure
    const processedData = {
        // Basic info
        age: parseInt(rawData.age) || null,
        height: parseInt(rawData.height) || null,
        weight: parseInt(rawData.weight) || null,
        email: rawData.email || '',
        phone: rawData.phone || '',
        
        // Symptoms (convert to boolean flags)
        symptoms: {
            lowEnergy: rawData.energy ? parseInt(rawData.energy) >= 3 : false,
            reducedLibido: rawData.libido ? parseInt(rawData.libido) >= 3 : false,
            moodChanges: rawData.mood ? parseInt(rawData.mood) >= 3 : false,
            sleepIssues: rawData.sleep ? parseInt(rawData.sleep) >= 3 : false,
            muscleWeakness: rawData.muscle ? parseInt(rawData.muscle) >= 3 : false,
            weightGain: rawData.weight_gain === 'yes',
            fatigue: rawData.fatigue === 'yes',
            concentration: rawData.concentration === 'yes'
        },
        
        // Medical history
        medicalHistory: {
            diabetes: rawData.diabetes === 'yes',
            heartDisease: rawData.heart_disease === 'yes',
            highBloodPressure: rawData.blood_pressure === 'yes',
            thyroidIssues: rawData.thyroid === 'yes',
            previousTRT: rawData.previous_trt === 'yes',
            medications: rawData.medications || '',
            allergies: rawData.allergies || '',
            surgeries: rawData.surgeries || ''
        },
        
        // Lifestyle
        lifestyle: {
            exerciseFrequency: rawData.exercise || '',
            smokingStatus: rawData.smoking || '',
            alcoholConsumption: rawData.alcohol || '',
            stressLevel: rawData.stress || '',
            sleepHours: rawData.sleep_hours || '',
            diet: rawData.diet || ''
        },
        
        // Assessment metadata
        assessmentScore: rawData.assessmentScore || 0,
        completedAt: rawData.timestamp || new Date().toISOString()
    };
    
    return processedData;
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