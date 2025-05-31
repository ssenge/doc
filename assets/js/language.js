// Language switching functionality
let currentLanguage = 'en';

// Language translations object
const translations = {
    en: {
        // Navigation
        'home': 'Home',
        'how_it_works': 'How it Works',
        'testimonials': 'Testimonials',
        'faq': 'FAQ',
        'start_assessment': 'Start Assessment',
        
        // Common
        'next': 'Next',
        'previous': 'Previous',
        'submit': 'Submit',
        'loading': 'Loading...',
        'error': 'Error',
        'success': 'Success',
        
        // Form validation
        'required_field': 'This field is required',
        'invalid_email': 'Please enter a valid email address',
        'invalid_phone': 'Please enter a valid phone number',
        'age_range': 'Age must be between 18 and 80',
        'height_range': 'Height must be between 150 and 220 cm',
        'weight_range': 'Weight must be between 50 and 200 kg',
        
        // No consultation messages
        'No assessment data found. Please complete the assessment first.': 'No assessment data found. Please complete the assessment first.',
        'Processing your assessment...': 'Processing your assessment...',
        'Error processing assessment. Please try again.': 'Error processing assessment. Please try again.',
        'Error loading assessment data.': 'Error loading assessment data.',
        'Please rate at least one symptom': 'Please rate at least one symptom',
        
        // Payment and success page
        'Payment Successful!': 'Payment Successful!',
        'Your payment has been processed successfully. Our doctor will now review your health data and we\'ll keep you posted with personalized recommendations.': 'Your payment has been processed successfully. Our doctor will now review your health data and we\'ll keep you posted with personalized recommendations.',
        'Payment Confirmation': 'Payment Confirmation',
        'Service:': 'Service:',
        'Amount:': 'Amount:',
        'Email:': 'Email:',
        'Status:': 'Status:',
        '✅ Paid': '✅ Paid',
        'Transaction ID:': 'Transaction ID:',
        'Complete Booking': 'Complete Booking',
        'Address and billing details will be collected securely by Stripe during checkout.': 'Address and billing details will be collected securely by Stripe during checkout.',
        'Secure Checkout Process': 'Secure Checkout Process',
        'Your personal details, billing address, and payment information will be collected securely by Stripe during the next step. No sensitive information is stored on our servers.': 'Your personal details, billing address, and payment information will be collected securely by Stripe during the next step. No sensitive information is stored on our servers.',
        'Proceed to Secure Checkout': 'Proceed to Secure Checkout'
    },
    de: {
        // Navigation
        'home': 'Startseite',
        'how_it_works': 'So funktioniert\'s',
        'testimonials': 'Erfahrungen',
        'faq': 'FAQ',
        'start_assessment': 'Assessment starten',
        
        // Common
        'next': 'Weiter',
        'previous': 'Zurück',
        'submit': 'Absenden',
        'loading': 'Lädt...',
        'error': 'Fehler',
        'success': 'Erfolg',
        
        // Form validation
        'required_field': 'Dieses Feld ist erforderlich',
        'invalid_email': 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        'invalid_phone': 'Bitte geben Sie eine gültige Telefonnummer ein',
        'age_range': 'Das Alter muss zwischen 18 und 80 Jahren liegen',
        'height_range': 'Die Größe muss zwischen 150 und 220 cm liegen',
        'weight_range': 'Das Gewicht muss zwischen 50 und 200 kg liegen',
        
        // No consultation messages
        'No assessment data found. Please complete the assessment first.': 'Keine Assessment-Daten gefunden. Bitte füllen Sie zuerst das Assessment aus.',
        'Processing your assessment...': 'Ihr Assessment wird verarbeitet...',
        'Error processing assessment. Please try again.': 'Fehler beim Verarbeiten des Assessments. Bitte versuchen Sie es erneut.',
        'Error loading assessment data.': 'Fehler beim Laden der Assessment-Daten.',
        'Please rate at least one symptom': 'Bitte bewerten Sie mindestens ein Symptom',
        
        // Payment and success page
        'Payment Successful!': 'Zahlung erfolgreich!',
        'Your payment has been processed successfully. Our doctor will now review your health data and we\'ll keep you posted with personalized recommendations.': 'Ihre Zahlung wurde erfolgreich verarbeitet. Unser Arzt wird nun Ihre Gesundheitsdaten überprüfen und Sie mit persönlichen Empfehlungen auf dem Laufenden halten.',
        'Payment Confirmation': 'Zahlungsbestätigung',
        'Service:': 'Dienst:',
        'Amount:': 'Betrag:',
        'Email:': 'E-Mail:',
        'Status:': 'Status:',
        '✅ Paid': '✅ Bezahlt',
        'Transaction ID:': 'Transaktions-ID:',
        'Complete Booking': 'Buchung abschließen',
        'Address and billing details will be collected securely by Stripe during checkout.': 'Adresse und Rechnungsdetails werden sicher von Stripe während des Checkouts erfasst.',
        'Secure Checkout Process': 'Sicherer Checkout-Prozess',
        'Your personal details, billing address, and payment information will be collected securely by Stripe during the next step. No sensitive information is stored on our servers.': 'Ihre persönlichen Daten, Rechnungsadresse und Zahlungsinformationen werden sicher von Stripe während des nächsten Schritts erfasst. Keine sensiblen Informationen werden auf unseren Servern gespeichert.',
        'Proceed to Secure Checkout': 'Zur sicheren Bezahlung fortfahren'
    }
};

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('trt-language');
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'de')) {
        currentLanguage = savedLanguage;
    } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang.startsWith('de')) {
            currentLanguage = 'de';
        }
    }
    
    // Apply the language
    switchLanguage(currentLanguage);
    updateLanguageIndicator();
});

// Switch language function
function switchLanguage(lang) {
    if (lang !== 'en' && lang !== 'de') {
        console.error('Unsupported language:', lang);
        return;
    }
    
    currentLanguage = lang;
    
    // Save language preference
    localStorage.setItem('trt-language', lang);
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
    
    // Update all elements with data attributes
    const elements = document.querySelectorAll('[data-en][data-de]');
    elements.forEach(element => {
        const text = element.getAttribute(`data-${lang}`);
        if (text) {
            if (element.tagName === 'INPUT' && element.type === 'submit') {
                element.value = text;
            } else if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                element.placeholder = text;
            } else if (element.tagName === 'TITLE') {
                element.textContent = text;
                document.title = text;
            } else {
                element.textContent = text;
            }
        }
    });
    
    // Update placeholder attributes specifically
    const placeholderElements = document.querySelectorAll(`[data-${lang}-placeholder]`);
    placeholderElements.forEach(element => {
        const placeholderText = element.getAttribute(`data-${lang}-placeholder`);
        if (placeholderText) {
            element.placeholder = placeholderText;
        }
    });
    
    // Update select options
    const selectOptions = document.querySelectorAll('option[data-en][data-de]');
    selectOptions.forEach(option => {
        const text = option.getAttribute(`data-${lang}`);
        if (text) {
            option.textContent = text;
        }
    });
    
    // Update language indicator
    updateLanguageIndicator();
    
    // Trigger custom event for other scripts
    document.dispatchEvent(new CustomEvent('languageChanged', { 
        detail: { language: lang } 
    }));
}

// Update language indicator in dropdown
function updateLanguageIndicator() {
    const indicator = document.getElementById('currentLanguage');
    const flagIndicator = document.getElementById('currentFlag');
    
    if (indicator) {
        indicator.textContent = currentLanguage.toUpperCase();
    }
    
    if (flagIndicator) {
        const flags = {
            'en': '🇺🇸',
            'de': '🇩🇪'
        };
        flagIndicator.textContent = flags[currentLanguage] || '🇺🇸';
    }
}

// Get translation function
function t(key) {
    return translations[currentLanguage][key] || translations['en'][key] || key;
}

// Format currency based on language
function formatCurrency(amount) {
    if (currentLanguage === 'de') {
        return new Intl.NumberFormat('de-DE', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    } else {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    }
}

// Format date based on language
function formatDate(date) {
    if (currentLanguage === 'de') {
        return new Intl.DateTimeFormat('de-DE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    } else {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    }
}

// Validation messages in current language
function getValidationMessage(type, field) {
    const messages = {
        en: {
            required: `${field} is required`,
            email: 'Please enter a valid email address',
            phone: 'Please enter a valid phone number',
            age: 'Age must be between 18 and 80',
            height: 'Height must be between 150 and 220 cm',
            weight: 'Weight must be between 50 and 200 kg',
            cardNumber: 'Please enter a valid card number',
            cvv: 'Please enter a valid CVV',
            expiry: 'Please select a valid expiry date'
        },
        de: {
            required: `${field} ist erforderlich`,
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
            phone: 'Bitte geben Sie eine gültige Telefonnummer ein',
            age: 'Das Alter muss zwischen 18 und 80 Jahren liegen',
            height: 'Die Größe muss zwischen 150 und 220 cm liegen',
            weight: 'Das Gewicht muss zwischen 50 und 200 kg liegen',
            cardNumber: 'Bitte geben Sie eine gültige Kartennummer ein',
            cvv: 'Bitte geben Sie eine gültige CVV ein',
            expiry: 'Bitte wählen Sie ein gültiges Ablaufdatum'
        }
    };
    
    return messages[currentLanguage][type] || messages['en'][type] || 'Invalid input';
}

// Export functions for use in other scripts
window.TRTLanguage = {
    switchLanguage,
    getCurrentLanguage: () => currentLanguage,
    t,
    formatCurrency,
    formatDate,
    getValidationMessage,
    updatePageContent: () => switchLanguage(currentLanguage)
}; 