// Treatment data with pricing and details
const TREATMENTS = {
    'testo-gel': {
        name: 'Testosterone Gel',
        price: 8900, // Price in cents (€89.00)
        currency: 'eur',
        description: 'Daily topical application with steady hormone levels throughout the day. Perfect for those who prefer non-invasive treatment.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_3cI5kF7ZobDad9PaB60Jq0k'
    },
    'injections': {
        name: 'Testosterone Injections',
        price: 12900, // Price in cents (€129.00)
        currency: 'eur',
        description: 'Weekly intramuscular injections. Most effective method with peak hormone optimization. Includes all supplies and detailed instructions.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_4gMfZj5Rgaz6b1H38E0Jq0l'
    },
    'patches': {
        name: 'Testosterone Patches',
        price: 10900, // Price in cents (€109.00)
        currency: 'eur',
        description: 'Convenient daily patches for consistent hormone delivery. Discreet and easy to use with minimal skin irritation.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_9B67sN7Zo7mU7PvdNi0Jq0m'
    },
    'pellets': {
        name: 'Testosterone Pellets',
        price: 29900, // Price in cents (€299.00)
        currency: 'eur',
        description: 'Long-lasting pellet implants providing 3-6 months of treatment. Minimal maintenance required after insertion.',
        interval: 'quarter',
        paymentLink: 'https://buy.stripe.com/test_eVq8wR6VkbDad9PgZu0Jq0n'
    },
    'nasal-gel': {
        name: 'Testosterone Nasal Gel',
        price: 14900, // Price in cents (€149.00)
        currency: 'eur',
        description: 'Innovative nasal application for rapid absorption. Quick-acting with excellent bioavailability.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_14A9AVa7wdLiedTbFa0Jq0o'
    },
    'cream': {
        name: 'Testosterone Cream',
        price: 9900, // Price in cents (€99.00)
        currency: 'eur',
        description: 'Customizable compounded cream for personalized dosing. Ideal for patients requiring specific concentrations.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_28E9AVcfEePmfhX8sY0Jq0p'
    }
};

// DOM elements
let loadingOverlay;
let treatmentCards;
let selectButtons;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTreatments();
});

function initializeTreatments() {
    console.log('Initializing treatments page...');
    
    // Get DOM elements
    loadingOverlay = document.getElementById('loadingOverlay');
    treatmentCards = document.querySelectorAll('.treatment-card');
    selectButtons = document.querySelectorAll('.select-treatment-btn');

    console.log('Found', selectButtons.length, 'treatment buttons');

    // Add event listeners to all select buttons
    selectButtons.forEach((button, index) => {
        console.log('Adding listener to button', index);
        button.addEventListener('click', handleTreatmentSelection);
    });

    console.log('Treatments page initialized successfully');
}

function handleTreatmentSelection(event) {
    event.preventDefault();
    console.log('Button clicked!');
    
    const button = event.target;
    const treatmentCard = button.closest('.treatment-card');
    const treatmentId = treatmentCard.getAttribute('data-treatment');
    
    console.log('Treatment selected:', treatmentId);
    
    // Get treatment data
    const treatment = TREATMENTS[treatmentId];
    if (!treatment) {
        console.error('Treatment not found:', treatmentId);
        alert('Treatment not found. Please try again.');
        return;
    }

    // Save treatment selection to data collection system
    if (window.eDocDataCollection) {
        window.eDocDataCollection.saveTreatmentData(treatmentId, treatment);
        console.log('Treatment data saved to localStorage');
    }

    // Show loading state
    showLoading(button);
    
    try {
        // Redirect to Payment Link
        redirectToPaymentLink(treatment, treatmentId);
    } catch (error) {
        console.error('Error redirecting to payment:', error);
        hideLoading();
        alert('There was an error processing your request. Please try again.');
    }
}

function redirectToPaymentLink(treatment, treatmentId) {
    console.log('Redirecting to payment link for:', treatment.name);

    // Get the payment link for this treatment
    const baseUrl = treatment.paymentLink;
    
    if (!baseUrl) {
        throw new Error('Payment link not configured for this treatment');
    }

    // Create success and cancel URLs
    const currentOrigin = window.location.origin;
    const successUrl = `${currentOrigin}/success.html?treatment=${treatmentId}&amount=${(treatment.price / 100).toFixed(2)}&product=${encodeURIComponent(treatment.name)}`;
    const cancelUrl = `${currentOrigin}/treatments.html`;
    
    console.log('Success URL:', successUrl);
    console.log('Cancel URL:', cancelUrl);
    console.log('Payment Link:', baseUrl);
    
    // Redirect to Stripe Payment Link
    // Note: Payment Links don't support URL parameters for success/cancel URLs
    // These need to be configured when creating the Payment Link
    window.location.href = baseUrl;
}

function showLoading(button) {
    if (button) {
        button.disabled = true;
        button.textContent = 'Processing...';
        button.classList.add('opacity-50', 'cursor-not-allowed');
    }
    
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
    
    // Re-enable all select buttons
    selectButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
        // Reset button text based on language
        const buttonText = button.getAttribute('data-translate');
        if (buttonText === 'treatments.selectButton') {
            button.textContent = 'Select Treatment'; // Default English
        }
    });
}

// Utility function to format price for display
function formatPrice(priceInCents, currency = 'EUR') {
    return new Intl.NumberFormat('de-DE', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(priceInCents / 100);
}

// Export for potential use in other scripts
window.TreatmentsPage = {
    TREATMENTS,
    handleTreatmentSelection,
    formatPrice
}; 