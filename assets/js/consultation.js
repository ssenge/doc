// Consultation booking functionality
let selectedPackage = null;
let bookingData = {};

// Make selectedPackage globally accessible
window.selectedPackage = selectedPackage;

// Initialize consultation page
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    loadAssessmentData();
});

function setupEventListeners() {
    // Form submission
    const consultationForm = document.getElementById('consultationForm');
    if (consultationForm) {
        consultationForm.addEventListener('submit', handleBookingSubmit);
    }
    
    // Form validation on input
    if (consultationForm) {
        consultationForm.addEventListener('input', handleInputChange);
        consultationForm.addEventListener('change', handleInputChange);
    }
    
    // Card number formatting
    const cardNumberField = document.getElementById('cardNumber');
    if (cardNumberField) {
        cardNumberField.addEventListener('input', formatCardNumber);
    }
    
    // CVV validation
    const cvvField = document.getElementById('cvv');
    if (cvvField) {
        cvvField.addEventListener('input', formatCVV);
    }
}

function loadAssessmentData() {
    // Load assessment data from localStorage
    const assessmentData = localStorage.getItem('trt-assessment-data');
    if (assessmentData) {
        try {
            const data = JSON.parse(assessmentData);
            bookingData.assessmentData = data;
            
            // Pre-fill form with assessment data
            prefillPersonalInfo(data);
        } catch (error) {
            console.error('Error loading assessment data:', error);
        }
    }
}

function prefillPersonalInfo(data) {
    // Pre-fill first name and last name if available from email
    if (data.email) {
        const emailParts = data.email.split('@')[0].split('.');
        if (emailParts.length >= 2) {
            const firstNameField = document.getElementById('firstName');
            const lastNameField = document.getElementById('lastName');
            
            if (firstNameField && !firstNameField.value) {
                firstNameField.value = capitalizeFirst(emailParts[0]);
            }
            if (lastNameField && !lastNameField.value) {
                lastNameField.value = capitalizeFirst(emailParts[1]);
            }
        }
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

function selectConsultation(type, price) {
    selectedPackage = { type, price };
    
    // Make it globally accessible
    window.selectedPackage = selectedPackage;
    
    // Update package display
    updateSelectedPackageDisplay();
    
    // Update Stripe amount if initialized
    if (window.StripeIntegration && window.StripeIntegration.isInitialized()) {
        window.StripeIntegration.updateAmount();
    }
    
    // Show booking form for all consultation types including 'none'
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.classList.remove('hidden');
        bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Store selection
    bookingData.selectedPackage = selectedPackage;
}

function handleNoConsultation() {
    // Simply redirect to the success page
    window.location.href = 'success.html';
}

function updateSelectedPackageDisplay() {
    if (!selectedPackage) return;
    
    const packageNameElement = document.getElementById('packageName');
    const packagePriceElement = document.getElementById('packagePrice');
    
    if (packageNameElement && packagePriceElement) {
        // Get package name based on type and current language
        const packageNames = {
            en: {
                video: 'Video Consultation',
                phone: 'Phone Consultation',
                premium: 'Premium Package',
                none: 'No Consultation'
            },
            de: {
                video: 'Video-Beratung',
                phone: 'Telefon-Beratung',
                premium: 'Premium-Paket',
                none: 'Keine Beratung'
            }
        };
        
        const currentLang = window.TRTLanguage?.getCurrentLanguage() || 'en';
        const packageName = packageNames[currentLang][selectedPackage.type] || selectedPackage.type;
        
        packageNameElement.textContent = packageName;
        
        // Special handling for "No Consultation" option which should show €29
        if (selectedPackage.type === 'none') {
            packagePriceElement.textContent = '€29';
            packagePriceElement.className = 'text-2xl font-bold text-blue-900';
        } else if (selectedPackage.price === 0) {
            packagePriceElement.textContent = window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'KOSTENLOS' : 'FREE';
            packagePriceElement.className = 'text-2xl font-bold text-green-600';
        } else {
            packagePriceElement.textContent = window.TRTLanguage?.formatCurrency(selectedPackage.price) || `€${selectedPackage.price}`;
            packagePriceElement.className = 'text-2xl font-bold text-blue-900';
        }
    }
}

function handleInputChange(event) {
    const field = event.target;
    
    // Real-time validation
    validateField(field);
    
    // Auto-save booking data
    saveBookingData();
}

function validateField(field) {
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !field.value.trim()) {
        const fieldName = field.previousElementSibling?.textContent || field.name;
        message = window.TRTLanguage?.getValidationMessage('required', fieldName) || `${fieldName} is required`;
        isValid = false;
    }
    
    // Specific field validations
    if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
        message = window.TRTLanguage?.getValidationMessage('email') || 'Please enter a valid email address';
        isValid = false;
    }
    
    if (field.id === 'cardNumber' && field.value && !isValidCardNumber(field.value)) {
        message = window.TRTLanguage?.getValidationMessage('cardNumber') || 'Please enter a valid card number';
        isValid = false;
    }
    
    if (field.id === 'cvv' && field.value && !isValidCVV(field.value)) {
        message = window.TRTLanguage?.getValidationMessage('cvv') || 'Please enter a valid CVV';
        isValid = false;
    }
    
    if ((field.id === 'expiryMonth' || field.id === 'expiryYear') && field.value) {
        const month = document.getElementById('expiryMonth')?.value;
        const year = document.getElementById('expiryYear')?.value;
        if (month && year && !isValidExpiryDate(month, year)) {
            message = window.TRTLanguage?.getValidationMessage('expiry') || 'Please select a valid expiry date';
            isValid = false;
        }
    }
    
    // Show/hide error
    if (isValid) {
        clearFieldError(field);
    } else {
        showFieldError(field, message);
    }
    
    return isValid;
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
    errorDiv.className = 'error-message text-red-500 text-sm mt-1';
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

function isValidCardNumber(cardNumber) {
    // Remove spaces and check if it's 13-19 digits
    const cleaned = cardNumber.replace(/\s/g, '');
    return /^\d{13,19}$/.test(cleaned) && luhnCheck(cleaned);
}

function luhnCheck(cardNumber) {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i));
        
        if (isEven) {
            digit *= 2;
            if (digit > 9) {
                digit -= 9;
            }
        }
        
        sum += digit;
        isEven = !isEven;
    }
    
    return sum % 10 === 0;
}

function isValidCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
}

function isValidExpiryDate(month, year) {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    const expYear = parseInt(year);
    const expMonth = parseInt(month);
    
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
}

function formatCardNumber(event) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    
    if (formattedValue.length > 23) { // 19 digits + 4 spaces
        formattedValue = formattedValue.substring(0, 23);
    }
    
    event.target.value = formattedValue;
}

function formatCVV(event) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 4) {
        value = value.substring(0, 4);
    }
    event.target.value = value;
}

function saveBookingData() {
    const form = document.getElementById('consultationForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const formObject = {};
    
    for (let [key, value] of formData.entries()) {
        formObject[key] = value;
    }
    
    bookingData.personalInfo = formObject;
    bookingData.timestamp = new Date().toISOString();
    
    // Save to localStorage (excluding sensitive payment info)
    const safeData = { ...bookingData };
    if (safeData.personalInfo) {
        delete safeData.personalInfo.cardNumber;
        delete safeData.personalInfo.cvv;
    }
    
    localStorage.setItem('trt-booking-data', JSON.stringify(safeData));
}

function validateForm() {
    const form = document.getElementById('consultationForm');
    if (!form) return false;
    
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    // Check if package is selected
    if (!selectedPackage) {
        showAlert(window.TRTLanguage?.t('Please select a consultation package') || 'Please select a consultation package', 'error');
        isValid = false;
    }
    
    // Validate terms acceptance
    const termsCheckbox = document.getElementById('terms');
    if (termsCheckbox && !termsCheckbox.checked) {
        showAlert(window.TRTLanguage?.t('Please accept the terms and conditions') || 'Please accept the terms and conditions', 'error');
        isValid = false;
    }
    
    return isValid;
}

function handleBookingSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    // Check if Stripe is available and initialized
    if (window.StripeIntegration && window.StripeIntegration.isInitialized()) {
        // Use Stripe payment processing
        return window.StripeIntegration.handlePayment(event);
    } else {
        // Fallback to old system if Stripe not available
        console.warn('Stripe not initialized, falling back to old payment system');
        handleLegacyPayment(event);
    }
}

// Legacy payment handling (keep as fallback)
function handleLegacyPayment(event) {
    saveBookingData();
    
    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;
        submitBtn.textContent = window.TRTLanguage?.t('loading') || 'Processing...';
    }
    
    // Save consultation data to TRT Data Collection system
    if (window.TRTDataCollection && selectedPackage) {
        try {
            window.TRTDataCollection.saveConsultationData(selectedPackage.type, selectedPackage.price);
            console.log('Consultation data saved to TRT Data Collection system');
            
            // Clear saved data
            localStorage.removeItem('trt-booking-data');
            
            // Redirect based on consultation type
            if (selectedPackage.type === 'none') {
                window.location.href = 'treatments.html';
            } else {
                window.location.href = 'treatments.html';
            }
        } catch (error) {
            console.error('Error saving consultation data:', error);
            showAlert(window.TRTLanguage?.t('error') || 'Booking failed. Please try again.', 'error');
            
            // Remove loading state
            if (submitBtn) {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                submitBtn.textContent = window.TRTLanguage?.t('Complete Booking') || 'Complete Booking';
            }
        }
    } else {
        console.error('TRTDataCollection not available or no package selected');
        showAlert('System error. Please try again.', 'error');
        
        // Remove loading state
        if (submitBtn) {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.textContent = window.TRTLanguage?.t('Complete Booking') || 'Complete Booking';
        }
    }
}

function showSuccessPage(bookingData) {
    // For "No Consultation" option, redirect to the dedicated success page
    if (selectedPackage && selectedPackage.type === 'none') {
        window.location.href = 'success.html';
        return;
    }
    
    // For other consultation types, show the booking success message
    document.body.innerHTML = `
        <div class="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-md w-full space-y-8 text-center">
                <div>
                    <div class="mx-auto h-12 w-12 text-green-600">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 48 48">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
                        ${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Buchung erfolgreich!' : 'Booking Successful!'}
                    </h2>
                    <p class="mt-2 text-sm text-gray-600">
                        ${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Ihre Beratung wurde erfolgreich gebucht.' : 'Your consultation has been successfully booked.'}
                    </p>
                </div>
                <div class="bg-white p-6 rounded-lg shadow">
                    <h3 class="text-lg font-medium text-gray-900 mb-4">
                        ${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Buchungsdetails' : 'Booking Details'}
                    </h3>
                    <div class="space-y-2 text-sm text-gray-600">
                        <p><strong>${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Buchungs-ID:' : 'Booking ID:'}</strong> ${bookingData.bookingId}</p>
                        <p><strong>${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Paket:' : 'Package:'}</strong> ${selectedPackage.type}</p>
                        <p><strong>${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Preis:' : 'Price:'}</strong> €${selectedPackage.price}</p>
                    </div>
                </div>
                <div class="text-sm text-gray-600">
                    <p>${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Sie erhalten in Kürze eine Bestätigungs-E-Mail mit weiteren Informationen.' : 'You will receive a confirmation email shortly with further details.'}</p>
                </div>
                <div>
                    <a href="index.html" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        ${window.TRTLanguage?.getCurrentLanguage() === 'de' ? 'Zur Startseite' : 'Back to Home'}
                    </a>
                </div>
            </div>
        </div>
    `;
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

// Update package display when language changes
document.addEventListener('languageChanged', function() {
    updateSelectedPackageDisplay();
}); 