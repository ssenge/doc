// Stripe Integration for TRT Clinic
// ✅ TEST MODE - No real money will be charged
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51RUrRKQr7jYlppyzyYiZWo3UiOSddHlj7UsHNkHmK0yzIjRhS3iS5FK0C3E2DF8ASg7eOsY2NGx5l9AvXdw7Ovbc00YUP2wQYq';

let stripe;
let isStripeInitialized = false;

// Stripe Payment Links (created in Stripe Dashboard)
const PAYMENT_LINKS = {
    'none': 'https://book.stripe.com/test_28E7sN3J836EfhXgZu0Jq00',
    'video': 'https://book.stripe.com/test_28E7sN3J836EfhXgZu0Jq00', 
    'phone': 'https://book.stripe.com/test_28E7sN3J836EfhXgZu0Jq00',
    'premium': 'https://book.stripe.com/test_28E7sN3J836EfhXgZu0Jq00'
};

// Initialize Stripe when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // For Payment Links, we don't need Stripe.js initialization
    // Just show the payment info
    showPaymentInfo();
});

function showStripeSetupError() {
    const paymentElement = document.getElementById('payment-element');
    if (paymentElement) {
        paymentElement.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 class="text-red-800 font-medium mb-2">⚠️ Stripe Setup Required</h4>
                <p class="text-red-700 text-sm">
                    Please update the STRIPE_PUBLISHABLE_KEY in assets/js/stripe-integration.js
                    with your actual Stripe publishable key.
                </p>
            </div>
        `;
    }
}

function initializeStripe() {
    try {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
        isStripeInitialized = true;
        
        // Show payment info
        showPaymentInfo();
        
    } catch (error) {
        console.error('Stripe initialization error:', error);
        showStripeError('Failed to initialize payment system. Please refresh the page.');
    }
}

function showPaymentInfo() {
    const paymentElement = document.getElementById('payment-element');
    if (paymentElement) {
        paymentElement.innerHTML = `
            <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 class="text-blue-800 font-medium mb-2">💳 Secure Payment with Stripe</h4>
                <p class="text-blue-700 text-sm mb-3">
                    Click "Complete Booking" below to proceed to Stripe's secure checkout page.
                </p>
                <div class="text-xs text-blue-600">
                    ✅ All major credit cards<br>
                    ✅ SEPA Direct Debit (cheapest option)<br>
                    ✅ Apple Pay & Google Pay<br>
                    ✅ Secure 256-bit encryption
                </div>
            </div>
        `;
    }
}

function getSelectedPackageAmount() {
    if (selectedPackage && selectedPackage.price) {
        return selectedPackage.price * 100;
    }
    return 2900;
}

function showStripeError(message) {
    const errorElement = document.getElementById('payment-errors');
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function updateStripeAmount() {
    showPaymentInfo();
}

// Handle form submission with Stripe Checkout
async function handleStripePayment(event) {
    event.preventDefault();
    
    const submitButton = event.target.querySelector('button[type="submit"]');
    const errorElement = document.getElementById('payment-errors');
    
    // Show loading state
    submitButton.disabled = true;
    submitButton.textContent = 'Redirecting to Stripe...';
    errorElement.textContent = '';
    
    try {
        // Get the checkout URL (Stripe will collect customer details)
        const amount = getSelectedPackageAmount();
        const productName = getProductName();
        const checkoutUrl = createCheckoutUrl(amount, productName, null);
        
        // Redirect to checkout
        window.location.href = checkoutUrl;
        
        return true;
        
    } catch (err) {
        console.error('Payment error:', err);
        showStripeError('Payment setup failed. Please try again.');
        submitButton.disabled = false;
        submitButton.textContent = window.TRTLanguage?.t('Proceed to Secure Checkout') || 'Proceed to Secure Checkout';
        return false;
    }
}

function createCheckoutUrl(amount, productName, customerEmail) {
    // Get the package type from the global selectedPackage variable
    const packageType = window.selectedPackage?.type || 'none';
    const paymentLink = PAYMENT_LINKS[packageType];
    
    console.log('Creating checkout URL for package:', packageType);
    console.log('Payment link:', paymentLink);
    
    // Check if we have a real payment link configured
    if (!paymentLink || paymentLink.includes('YOUR_LINK_FOR')) {
        console.error('Payment link not configured for:', packageType);
        // Fall back to demo mode for unconfigured links
        return `success.html?amount=${amount/100}&product=${encodeURIComponent(productName)}&email=${encodeURIComponent(customerEmail)}&demo=true`;
    }
    
    // Use the real Stripe Payment Link
    console.log('Using real Stripe Payment Link:', paymentLink);
    return paymentLink;
}

// Helper functions
function getCustomerName() {
    const firstName = document.getElementById('firstName')?.value || '';
    const lastName = document.getElementById('lastName')?.value || '';
    return `${firstName} ${lastName}`.trim();
}

function getCustomerEmail() {
    return document.getElementById('email')?.value || '';
}

function getCustomerAddress() {
    return {
        line1: document.getElementById('address')?.value || '',
        city: document.getElementById('city')?.value || '',
        postal_code: document.getElementById('postalCode')?.value || '',
        country: document.getElementById('country')?.value || 'DE'
    };
}

function getProductName() {
    if (!selectedPackage) return 'TRT Assessment';
    
    const names = {
        'none': 'TRT Assessment',
        'video': 'Video Consultation',
        'phone': 'Phone Consultation', 
        'premium': 'Premium TRT Package'
    };
    
    return names[selectedPackage.type] || 'TRT Service';
}

function getProductDescription() {
    if (!selectedPackage) return 'Testosterone Replacement Therapy Assessment';
    
    const descriptions = {
        'none': 'Complete health assessment with doctor review and recommendations',
        'video': '45-minute video consultation with TRT specialist',
        'phone': '30-minute phone consultation with TRT specialist',
        'premium': 'Complete TRT program with ongoing support and medication delivery'
    };
    
    return descriptions[selectedPackage.type] || 'TRT Service';
}

// Export functions for use in consultation.js
window.StripeIntegration = {
    updateAmount: updateStripeAmount,
    handlePayment: handleStripePayment,
    isInitialized: () => true // Payment Links don't require initialization
}; 