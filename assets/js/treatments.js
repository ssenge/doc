// Treatment data with pricing and details
const TREATMENTS = {
    'testo-gel': {
        name: 'Testosterone Gel',
        price: 8900, // Price in cents (€89.00)
        currency: 'eur',
        description: 'Daily topical application with steady hormone levels throughout the day. Perfect for those who prefer non-invasive treatment.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_14AaEZfrQePmedTfVq0Jq02'
    },
    'injections': {
        name: 'Testosterone Injections',
        price: 12900, // Price in cents (€129.00)
        currency: 'eur',
        description: 'Weekly intramuscular injections. Most effective method with peak hormone optimization. Includes all supplies and detailed instructions.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_eVqeVfbbAePm3zfaB60Jq03'
    },
    'patches': {
        name: 'Testosterone Patches',
        price: 10900, // Price in cents (€109.00)
        currency: 'eur',
        description: 'Daily transdermal patches. Convenient and discreet with consistent hormone delivery. Simply apply and forget.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_8x2eVfa7w5eM3zfbFa0Jq04'
    },
    'pellets': {
        name: 'Testosterone Pellets',
        price: 29900, // Price in cents (€299.00)
        currency: 'eur',
        description: 'Long-lasting subcutaneous pellets. Inserted once every 3-4 months for ultimate convenience. No daily routine required.',
        interval: '3-month',
        paymentLink: 'https://buy.stripe.com/test_6oUdRbgvU5eMd9PgZu0Jq05'
    },
    'nasal-gel': {
        name: 'Testosterone Nasal Gel',
        price: 14900, // Price in cents (€149.00)
        currency: 'eur',
        description: 'Innovative nasal application. Fast absorption with no skin transfer risk. Perfect for those with sensitive skin or active lifestyles.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_cNiaEZ3J8gXu6Lr38E0Jq06'
    },
    'custom': {
        name: 'Custom Compound',
        price: 18900, // Price in cents (€189.00)
        currency: 'eur',
        description: 'Personalized testosterone formulation. Tailored to your specific needs and preferences based on your assessment and lab results.',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_bJe6oJ7ZofTq5HngZu0Jq07'
    }
};

// Stripe configuration
const STRIPE_PUBLIC_KEY = 'pk_test_51RUrRKQr7jYlppyzyYiZWo3UiOSddHlj7UsHNkHmK0yzIjRhS3iS5FK0C3E2DF8ASg7eOsY2NGx5l9AvXdw7Ovbc00YUP2wQYq';
const stripe = Stripe(STRIPE_PUBLIC_KEY);

// DOM elements
let loadingOverlay;
let treatmentCards;
let selectButtons;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeTreatments();
});

function initializeTreatments() {
    // Get DOM elements
    loadingOverlay = document.getElementById('loadingOverlay');
    treatmentCards = document.querySelectorAll('.treatment-card');
    selectButtons = document.querySelectorAll('.select-treatment-btn');

    // Add event listeners to all select buttons
    selectButtons.forEach(button => {
        button.addEventListener('click', handleTreatmentSelection);
    });

    console.log('Treatments page initialized');
}

async function handleTreatmentSelection(event) {
    event.preventDefault();
    
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

    // Show loading state
    showLoading();
    
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
    console.log('Redirecting to payment link for:', treatment);

    // Get the payment link for this treatment
    const baseUrl = treatment.paymentLink;
    
    if (!baseUrl) {
        throw new Error('Payment link not configured for this treatment');
    }

    // Add success and cancel URLs as parameters
    const successUrl = encodeURIComponent(`${window.location.origin}/success.html?treatment=${treatmentId}&amount=${(treatment.price / 100).toFixed(2)}&product=${encodeURIComponent(treatment.name)}`);
    const cancelUrl = encodeURIComponent(`${window.location.origin}/treatments.html`);
    
    // Create the full URL with parameters
    const urlWithParams = `${baseUrl}?success_url=${successUrl}&cancel_url=${cancelUrl}`;
    
    console.log('Redirecting to:', urlWithParams);
    
    // Redirect to Stripe Payment Link
    window.location.href = urlWithParams;
}

function showLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.remove('hidden');
    }
    
    // Disable all select buttons
    selectButtons.forEach(button => {
        button.disabled = true;
        button.classList.add('opacity-50', 'cursor-not-allowed');
    });
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
    
    // Re-enable all select buttons
    selectButtons.forEach(button => {
        button.disabled = false;
        button.classList.remove('opacity-50', 'cursor-not-allowed');
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