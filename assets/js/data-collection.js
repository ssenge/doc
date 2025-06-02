/**
 * TRT Clinic Data Collection & Zapier Integration
 * Collects assessment, treatment, and payment data and sends to Zapier
 */

// Zapier webhook URL
const ZAPIER_WEBHOOK_URL = 'https://hooks.zapier.com/hooks/catch/23165254/2vtaqev/';

// Generate unique session ID
function generateSessionId() {
    return 'trt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// Get or create session ID
function getSessionId() {
    let sessionId = localStorage.getItem('edoc-session-id');
    if (!sessionId) {
        sessionId = 'edoc-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('edoc-session-id', sessionId);
    }
    return sessionId;
}

// Save assessment data to localStorage
function saveAssessmentData(formData) {
    const assessmentData = {
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
        age: formData.age,
        height: formData.height,
        weight: formData.weight,
        symptoms: formData.symptoms || {},
        medicalHistory: formData.medicalHistory || {},
        lifestyle: formData.lifestyle || {},
        email: formData.email,
        phone: formData.phone
    };
    
    localStorage.setItem('edoc-assessment', JSON.stringify(assessmentData));
    console.log('Assessment data saved:', assessmentData);
    return assessmentData;
}

// Save treatment selection to localStorage
function saveTreatmentData(treatmentId, treatmentDetails) {
    const treatmentData = {
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
        treatmentId: treatmentId,
        treatmentName: treatmentDetails.name,
        price: treatmentDetails.price,
        interval: treatmentDetails.interval,
        description: treatmentDetails.description
    };
    
    localStorage.setItem('edoc-treatment', JSON.stringify(treatmentData));
    console.log('Treatment data saved:', treatmentData);
    return treatmentData;
}

// Save consultation data to localStorage
function saveConsultationData(consultationType, price) {
    const consultationData = {
        sessionId: getSessionId(),
        timestamp: new Date().toISOString(),
        type: consultationType,
        price: price
    };
    
    localStorage.setItem('edoc-consultation', JSON.stringify(consultationData));
    console.log('Consultation data saved:', consultationData);
    return consultationData;
}

// Get all collected data
function getAllCollectedData() {
    const assessmentData = JSON.parse(localStorage.getItem('edoc-assessment') || '{}');
    const treatmentData = JSON.parse(localStorage.getItem('edoc-treatment') || '{}');
    const consultationData = JSON.parse(localStorage.getItem('edoc-consultation') || '{}');
    
    return {
        session: {
            sessionId: getSessionId(),
            currentLanguage: window.eDocLanguage?.getCurrentLanguage() || 'en',
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer,
            url: window.location.href
        },
        assessment: assessmentData,
        treatment: treatmentData,
        consultation: consultationData
    };
}

// Extract payment data from URL parameters
function getPaymentDataFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    
    return {
        sessionId: urlParams.get('session_id'),
        amount: urlParams.get('amount'),
        product: urlParams.get('product'),
        treatment: urlParams.get('treatment'),
        email: urlParams.get('email'),
        status: urlParams.get('status') || 'completed',
        paymentMethod: urlParams.get('payment_method'),
        timestamp: new Date().toISOString()
    };
}

// Send data to Zapier
async function sendToZapier(additionalData = {}) {
    try {
        // Collect all data
        const collectedData = getAllCollectedData();
        const paymentData = getPaymentDataFromURL();
        
        // Prepare complete data package
        const completeData = {
            // Patient/User Information
            patient: {
                sessionId: collectedData.session.sessionId,
                email: paymentData.email || collectedData.assessment.email || '',
                language: collectedData.session.currentLanguage,
                timestamp: new Date().toISOString()
            },
            
            // Assessment Data
            assessment: {
                age: collectedData.assessment.age,
                height: collectedData.assessment.height,
                weight: collectedData.assessment.weight,
                symptoms: collectedData.assessment.symptoms || {},
                medicalHistory: collectedData.assessment.medicalHistory || {},
                lifestyle: collectedData.assessment.lifestyle || {},
                completedAt: collectedData.assessment.completedAt,
                sessionId: collectedData.session.sessionId
            },
            
            // Treatment Selection
            treatment: {
                type: collectedData.treatment.treatmentId || paymentData.treatment,
                name: collectedData.treatment.treatmentName || paymentData.product,
                price: collectedData.treatment.price || parseFloat(paymentData.amount),
                currency: collectedData.treatment.currency || 'EUR',
                description: collectedData.treatment.description,
                interval: collectedData.treatment.interval,
                selectedAt: collectedData.treatment.selectedAt
            },
            
            // Consultation Information
            consultation: {
                type: collectedData.consultation.type || 'none',
                price: collectedData.consultation.price || 0,
                selectedAt: collectedData.consultation.selectedAt
            },
            
            // Payment Information
            payment: {
                stripeSessionId: paymentData.sessionId,
                amount: parseFloat(paymentData.amount) || collectedData.treatment.price,
                currency: 'EUR',
                status: paymentData.status,
                paymentMethod: paymentData.paymentMethod,
                processedAt: paymentData.timestamp
            },
            
            // Technical Metadata
            metadata: {
                sessionId: collectedData.session.sessionId,
                userAgent: collectedData.session.userAgent,
                referrer: collectedData.session.referrer,
                browserLanguage: collectedData.session.language,
                currentUrl: collectedData.session.url,
                source: 'edoc-clinic-website',
                platform: 'web',
                version: '1.0',
                environment: window.isDevelopment?.() ? 'development' : 'production',
                timestamp: new Date().toISOString()
            },
            
            // Additional data passed to function
            ...additionalData
        };
        
        console.log('Sending data to Zapier:', completeData);
        
        // Send to Zapier webhook
        const response = await fetch(ZAPIER_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(completeData)
        });
        
        if (response.ok) {
            const result = await response.json();
            console.log('✅ Data sent to Zapier successfully:', result);
            
            // Mark as sent to avoid duplicates
            localStorage.setItem('edoc-data-sent', 'true');
            localStorage.setItem('edoc-data-sent-at', new Date().toISOString());
            
            // Clear any failed send data
            localStorage.removeItem('edoc-failed-send');
            localStorage.removeItem('edoc-retry-count');
            
            return { success: true, result };
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
    } catch (error) {
        console.error('❌ Error sending data to Zapier:', error);
        
        // Store failed attempt for retry
        const failedData = {
            payload: getAllCollectedData(),
            error: error.message,
            timestamp: new Date().toISOString(),
            retryCount: (parseInt(localStorage.getItem('edoc-retry-count')) || 0) + 1
        };
        
        localStorage.setItem('edoc-failed-send', JSON.stringify(failedData));
        localStorage.setItem('edoc-retry-count', failedData.retryCount.toString());
        
        return { success: false, error: error.message };
    }
}

// Retry failed sends
async function retryFailedSend() {
    const failedData = localStorage.getItem('edoc-failed-send');
    const retryCount = parseInt(localStorage.getItem('edoc-retry-count')) || 0;
    
    if (!failedData || retryCount >= 3) {
        console.log('No failed data to retry or max retries reached');
        return { success: false, error: 'No retry data or max retries reached' };
    }
    
    const { payload } = JSON.parse(failedData);
    return await sendToZapier(payload);
}

// Check if data has already been sent
function hasDataBeenSent() {
    return localStorage.getItem('edoc-data-sent') === 'true';
}

// Clear all stored data (for testing or after successful processing)
function clearStoredData() {
    const keysToRemove = [
        'edoc-assessment',
        'edoc-treatment', 
        'edoc-consultation',
        'edoc-session-id',
        'edoc-data-sent',
        'edoc-data-sent-at',
        'edoc-failed-send',
        'edoc-retry-count'
    ];
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('All TRT data cleared from localStorage');
}

// Export functions for use in other scripts (new naming)
window.eDocDataCollection = {
    saveAssessmentData,
    saveTreatmentData,
    saveConsultationData,
    getAllCollectedData,
    sendToZapier,
    retryFailedSend,
    hasDataBeenSent,
    clearStoredData,
    getPaymentDataFromURL,
    getSessionId
};

// Backward compatibility - keep old naming working
window.TRTDataCollection = window.eDocDataCollection; 