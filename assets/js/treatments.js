// Treatment data with pricing and details
const TREATMENTS = {
    'testo-gel': {
        name: 'Testosterone Gel',
        price: 8900, // Price in cents (€89.00)
        currency: 'eur',
        description: 'Daily topical application with steady hormone levels',
        interval: 'month'
    },
    'injections': {
        name: 'Testosterone Injections',
        price: 12900, // Price in cents (€129.00)
        currency: 'eur',
        description: 'Weekly intramuscular injections for peak effectiveness',
        interval: 'month'
    },
    'patches': {
        name: 'Testosterone Patches',
        price: 10900, // Price in cents (€109.00)
        currency: 'eur',
        description: 'Daily transdermal patches for consistent delivery',
        interval: 'month'
    },
    'pellets': {
        name: 'Testosterone Pellets',
        price: 29900, // Price in cents (€299.00)
        currency: 'eur',
        description: 'Long-lasting subcutaneous pellets inserted every 3-4 months',
        interval: '3-month'
    },
    'nasal-gel': {
        name: 'Testosterone Nasal Gel',
        price: 14900, // Price in cents (€149.00)
        currency: 'eur',
        description: 'Innovative nasal application with fast absorption',
        interval: 'month'
    },
    'custom': {
        name: 'Custom Compound',
        price: 18900, // Price in cents (€189.00)
        currency: 'eur',
        description: 'Personalized testosterone formulation tailored to your needs',
        interval: 'month'
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
        // Create Stripe Checkout Session
        await createStripeCheckout(treatment, treatmentId);
    } catch (error) {
        console.error('Error creating checkout:', error);
        hideLoading();
        alert('There was an error processing your request. Please try again.');
    }
}

async function createStripeCheckout(treatment, treatmentId) {
    console.log('Creating Stripe checkout for:', treatment);

    // Prepare line items for Stripe
    const lineItems = [{
        price_data: {
            currency: treatment.currency,
            product_data: {
                name: treatment.name,
                description: treatment.description,
                metadata: {
                    treatment_id: treatmentId,
                    interval: treatment.interval
                }
            },
            unit_amount: treatment.price,
        },
        quantity: 1,
    }];

    // Create checkout session data
    const sessionData = {
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}&treatment=${treatmentId}`,
        cancel_url: `${window.location.origin}/treatments.html`,
        metadata: {
            treatment_id: treatmentId,
            source: 'treatments_page'
        },
        billing_address_collection: 'required',
        shipping_address_collection: {
            allowed_countries: ['DE', 'AT', 'CH', 'NL', 'BE', 'LU', 'FR', 'IT', 'ES', 'PT']
        }
    };

    console.log('Session data:', sessionData);

    try {
        // Create checkout session using Stripe's client-side API
        const { error } = await stripe.redirectToCheckout({
            lineItems: sessionData.line_items,
            mode: sessionData.mode,
            successUrl: sessionData.success_url,
            cancelUrl: sessionData.cancel_url,
            billingAddressCollection: sessionData.billing_address_collection,
            shippingAddressCollection: sessionData.shipping_address_collection
        });

        if (error) {
            console.error('Stripe checkout error:', error);
            throw error;
        }

        // If we reach here, there was an error (redirect should have happened)
        console.error('Checkout did not redirect as expected');
        throw new Error('Checkout failed to redirect');

    } catch (error) {
        console.error('Error in createStripeCheckout:', error);
        hideLoading();
        
        // Show user-friendly error message
        let errorMessage = 'There was an error processing your payment. Please try again.';
        
        if (error.message && error.message.includes('network')) {
            errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message && error.message.includes('card')) {
            errorMessage = 'There was an issue with your payment method. Please try a different card.';
        }
        
        alert(errorMessage);
        throw error;
    }
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