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
        'Proceed to Secure Checkout': 'Proceed to Secure Checkout',
        
        // Treatments page
        'treatments.title': 'Choose Your TRT Treatment',
        'treatments.subtitle': 'Select the testosterone replacement therapy option that best fits your lifestyle and preferences. All treatments are physician-prescribed and delivered discreetly to your door.',
        'treatments.perMonth': '/month',
        'treatments.per3Months': '/3 months',
        'treatments.selectButton': 'Select Treatment',
        'treatments.processing': 'Processing your order...',
        'treatments.backToAssessment': 'Back to Assessment',
        
        // Treatment types
        'treatments.gel.name': 'Testosterone Gel',
        'treatments.gel.description': 'Daily topical application. Easy to use, steady hormone levels throughout the day. Perfect for those who prefer non-invasive treatment.',
        'treatments.gel.feature1': 'Daily application',
        'treatments.gel.feature2': 'Steady hormone levels',
        'treatments.gel.feature3': 'Non-invasive',
        'treatments.gel.feature4': '30-day supply',
        
        'treatments.injections.name': 'Testosterone Injections',
        'treatments.injections.description': 'Weekly intramuscular injections. Most effective method with peak hormone optimization. Includes all supplies and detailed instructions.',
        'treatments.injections.feature1': 'Weekly injections',
        'treatments.injections.feature2': 'Peak effectiveness',
        'treatments.injections.feature3': 'Complete kit included',
        'treatments.injections.feature4': '4-week supply',
        
        'treatments.patches.name': 'Testosterone Patches',
        'treatments.patches.description': 'Daily transdermal patches. Convenient and discreet with consistent hormone delivery. Simply apply and forget.',
        'treatments.patches.feature1': 'Daily patches',
        'treatments.patches.feature2': 'Discreet application',
        'treatments.patches.feature3': 'Consistent delivery',
        'treatments.patches.feature4': '30-day supply',
        
        'treatments.pellets.name': 'Testosterone Pellets',
        'treatments.pellets.description': 'Long-lasting subcutaneous pellets. Inserted once every 3-4 months for ultimate convenience. No daily routine required.',
        'treatments.pellets.feature1': '3-4 month duration',
        'treatments.pellets.feature2': 'No daily routine',
        'treatments.pellets.feature3': 'Professional insertion',
        'treatments.pellets.feature4': 'Steady hormone levels',
        
        'treatments.nasal.name': 'Testosterone Nasal Gel',
        'treatments.nasal.description': 'Innovative nasal application. Fast absorption with no skin transfer risk. Perfect for those with sensitive skin or active lifestyles.',
        'treatments.nasal.feature1': '3x daily application',
        'treatments.nasal.feature2': 'Fast absorption',
        'treatments.nasal.feature3': 'No skin transfer',
        'treatments.nasal.feature4': '30-day supply',
        
        'treatments.custom.name': 'Custom Compound',
        'treatments.custom.description': 'Personalized testosterone formulation. Tailored to your specific needs and preferences based on your assessment and lab results.',
        'treatments.custom.feature1': 'Personalized formula',
        'treatments.custom.feature2': 'Lab-based dosing',
        'treatments.custom.feature3': 'Multiple delivery options',
        'treatments.custom.feature4': 'Ongoing optimization',
        
        // What's included section
        'treatments.info.title': 'What\'s Included with Every Treatment',
        'treatments.info.item1': 'Physician consultation and prescription',
        'treatments.info.item2': 'Regular blood work monitoring',
        'treatments.info.item3': '24/7 medical support',
        'treatments.info.item4': 'Discreet home delivery',
        'treatments.info.item5': 'Detailed usage instructions',
        'treatments.info.item6': 'Cancel or modify anytime',
        
        // Treatment success page
        'Treatment Order Confirmed!': 'Treatment Order Confirmed!',
        'Your treatment order has been confirmed! We will prepare your medication and ship it discreetly to your address. You will receive tracking information via email.': 'Your treatment order has been confirmed! We will prepare your medication and ship it discreetly to your address. You will receive tracking information via email.',
        'Order Confirmation': 'Order Confirmation',
        'Treatment:': 'Treatment:',
        'Order ID:': 'Order ID:',
        'Your medication will be prepared within 24 hours': 'Your medication will be prepared within 24 hours',
        'Discreet shipping within 2-3 business days': 'Discreet shipping within 2-3 business days',
        '24/7 medical support available anytime': '24/7 medical support available anytime'
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
        'Proceed to Secure Checkout': 'Zur sicheren Bezahlung fortfahren',
        
        // Treatments page
        'treatments.title': 'Wählen Sie Ihre TRT-Behandlung',
        'treatments.subtitle': 'Wählen Sie die Testosteronersatztherapie-Option, die am besten zu Ihrem Lebensstil und Ihren Vorlieben passt. Alle Behandlungen sind ärztlich verschrieben und werden diskret zu Ihnen nach Hause geliefert.',
        'treatments.perMonth': '/Monat',
        'treatments.per3Months': '/3 Monate',
        'treatments.selectButton': 'Behandlung auswählen',
        'treatments.processing': 'Ihre Bestellung wird verarbeitet...',
        'treatments.backToAssessment': 'Zurück zum Assessment',
        
        // Treatment types
        'treatments.gel.name': 'Testosteron-Gel',
        'treatments.gel.description': 'Tägliche topische Anwendung. Einfach zu verwenden, gleichmäßige Hormonspiegel den ganzen Tag. Perfekt für diejenigen, die eine nicht-invasive Behandlung bevorzugen.',
        'treatments.gel.feature1': 'Tägliche Anwendung',
        'treatments.gel.feature2': 'Gleichmäßige Hormonspiegel',
        'treatments.gel.feature3': 'Nicht-invasiv',
        'treatments.gel.feature4': '30-Tage-Vorrat',
        
        'treatments.injections.name': 'Testosteron-Injektionen',
        'treatments.injections.description': 'Wöchentliche intramuskuläre Injektionen. Effektivste Methode mit optimaler Hormonoptimierung. Enthält alle Materialien und detaillierte Anweisungen.',
        'treatments.injections.feature1': 'Wöchentliche Injektionen',
        'treatments.injections.feature2': 'Höchste Wirksamkeit',
        'treatments.injections.feature3': 'Komplettes Set enthalten',
        'treatments.injections.feature4': '4-Wochen-Vorrat',
        
        'treatments.patches.name': 'Testosteron-Pflaster',
        'treatments.patches.description': 'Tägliche transdermale Pflaster. Bequem und diskret mit konstanter Hormonabgabe. Einfach auftragen und vergessen.',
        'treatments.patches.feature1': 'Tägliche Pflaster',
        'treatments.patches.feature2': 'Diskrete Anwendung',
        'treatments.patches.feature3': 'Konstante Abgabe',
        'treatments.patches.feature4': '30-Tage-Vorrat',
        
        'treatments.pellets.name': 'Testosteron-Pellets',
        'treatments.pellets.description': 'Langanhaltende subkutane Pellets. Einmal alle 3-4 Monate eingesetzt für ultimative Bequemlichkeit. Keine tägliche Routine erforderlich.',
        'treatments.pellets.feature1': '3-4 Monate Wirkdauer',
        'treatments.pellets.feature2': 'Keine tägliche Routine',
        'treatments.pellets.feature3': 'Professionelle Einlage',
        'treatments.pellets.feature4': 'Gleichmäßige Hormonspiegel',
        
        'treatments.nasal.name': 'Testosteron-Nasal-Gel',
        'treatments.nasal.description': 'Innovative nasale Anwendung. Schnelle Absorption ohne Hautübertragungsrisiko. Perfekt für Menschen mit empfindlicher Haut oder aktivem Lebensstil.',
        'treatments.nasal.feature1': '3x tägliche Anwendung',
        'treatments.nasal.feature2': 'Schnelle Absorption',
        'treatments.nasal.feature3': 'Keine Hautübertragung',
        'treatments.nasal.feature4': '30-Tage-Vorrat',
        
        'treatments.custom.name': 'Individuelle Zusammensetzung',
        'treatments.custom.description': 'Personalisierte Testosteronformulierung. Maßgeschneidert auf Ihre spezifischen Bedürfnisse und Vorlieben basierend auf Ihrem Assessment und Laborergebnissen.',
        'treatments.custom.feature1': 'Personalisierte Formel',
        'treatments.custom.feature2': 'Laborbasierte Dosierung',
        'treatments.custom.feature3': 'Mehrere Verabreichungsoptionen',
        'treatments.custom.feature4': 'Laufende Optimierung',
        
        // What's included section
        'treatments.info.title': 'Was bei jeder Behandlung enthalten ist',
        'treatments.info.item1': 'Ärztliche Beratung und Verschreibung',
        'treatments.info.item2': 'Regelmäßige Blutuntersuchungen',
        'treatments.info.item3': '24/7 medizinische Unterstützung',
        'treatments.info.item4': 'Diskrete Lieferung nach Hause',
        'treatments.info.item5': 'Detaillierte Anwendungshinweise',
        'treatments.info.item6': 'Jederzeit kündbar oder änderbar',
        
        // Treatment success page
        'Treatment Order Confirmed!': 'Behandlungsbestaetigung',
        'Your treatment order has been confirmed! We will prepare your medication and ship it discreetly to your address. You will receive tracking information via email.': 'Ihre Bestellung wurde bestätigt! Wir werden Ihre Medikation vorbereiten und sie diskret zu Ihrer Adresse liefern. Sie erhalten Tracking-Informationen per E-Mail.',
        'Order Confirmation': 'Bestellbestätigung',
        'Treatment:': 'Behandlung:',
        'Order ID:': 'Bestell-ID:',
        'Your medication will be prepared within 24 hours': 'Ihre Medikation wird innerhalb von 24 Stunden vorbereitet',
        'Discreet shipping within 2-3 business days': 'Versand innerhalb von 2-3 Geschäftstagen',
        '24/7 medical support available anytime': '24/7 medizinische Unterstützung jederzeit verfügbar'
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