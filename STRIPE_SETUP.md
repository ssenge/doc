# Stripe Checkout Setup Guide

## Current Status ✅
Your TRT clinic website is now configured with **Stripe Checkout** using a demo/test mode. When users click "Complete Booking", they'll be redirected to a success page showing their payment details.

## For Testing (Current Setup)
- Uses test Stripe key: `pk_test_51RUrRKQr7jYlppyzyYiZWo3UiOSddHlj7UsHNkHmK0yzIjRhS3iS5FK0C3E2DF8ASg7eOsY2NGx5l9AvXdw7Ovbc00YUP2wQYq`
- No real money is charged
- Redirects to success page with simulated payment confirmation

## To Go Live with Real Payments

### Step 1: Create Stripe Payment Links
1. Log into your [Stripe Dashboard](https://dashboard.stripe.com)
2. Go to **Products** → **Payment Links**
3. Create 4 payment links for your services:

   **TRT Assessment (No Consultation)**
   - Price: €29.00
   - Name: "TRT Assessment"
   - Success URL: `https://yourdomain.com/success.html`
   - Cancel URL: `https://yourdomain.com/consultation.html`

   **Phone Consultation**
   - Price: €149.00
   - Name: "Phone Consultation"
   - Success URL: `https://yourdomain.com/success.html`
   - Cancel URL: `https://yourdomain.com/consultation.html`

   **Video Consultation**
   - Price: €199.00
   - Name: "Video Consultation"
   - Success URL: `https://yourdomain.com/success.html`
   - Cancel URL: `https://yourdomain.com/consultation.html`

   **Premium TRT Package**
   - Price: €299.00
   - Name: "Premium TRT Package"
   - Success URL: `https://yourdomain.com/success.html`
   - Cancel URL: `https://yourdomain.com/consultation.html`

### Step 2: Update Payment Links in Code
Edit `assets/js/stripe-integration.js` and replace the placeholder URLs:

```javascript
const PAYMENT_LINKS = {
    'none': 'https://buy.stripe.com/YOUR_ACTUAL_LINK_FOR_29EUR',
    'video': 'https://buy.stripe.com/YOUR_ACTUAL_LINK_FOR_199EUR', 
    'phone': 'https://buy.stripe.com/YOUR_ACTUAL_LINK_FOR_149EUR',
    'premium': 'https://buy.stripe.com/YOUR_ACTUAL_LINK_FOR_299EUR'
};
```

### Step 3: Update the Checkout Function
Replace the `createCheckoutUrl` function in `assets/js/stripe-integration.js`:

```javascript
function createCheckoutUrl(amount, productName, customerEmail) {
    const packageType = selectedPackage?.type || 'none';
    const paymentLink = PAYMENT_LINKS[packageType];
    
    if (!paymentLink || paymentLink.includes('YOUR_ACTUAL_LINK')) {
        console.error('Payment link not configured for:', packageType);
        return 'consultation.html?error=payment_not_configured';
    }
    
    // Add customer email as URL parameter if supported by your payment link
    return `${paymentLink}?prefilled_email=${encodeURIComponent(customerEmail)}`;
}
```

### Step 4: Configure Webhooks (Optional)
For advanced features like sending confirmation emails or updating your database:

1. In Stripe Dashboard, go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/webhook/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.succeeded`
4. This requires backend server setup

## Payment Methods Available
With Stripe Checkout, your customers can pay with:
- ✅ Credit/Debit Cards (Visa, Mastercard, Amex)
- ✅ SEPA Direct Debit (cheapest - only 0.8% fee)
- ✅ Apple Pay & Google Pay
- ✅ Bank transfers
- ✅ Klarna (Buy now, pay later)

## Cost Analysis for €29 Transaction
- **SEPA Direct Debit**: €0.23 (0.8%) - Cheapest option
- **Credit Cards**: €0.66 (1.4% + €0.25)
- **PayPal**: €1.05 (3.49% + €0.39)

## Security Features
- ✅ PCI DSS Level 1 compliant
- ✅ 3D Secure authentication
- ✅ Fraud detection
- ✅ 256-bit SSL encryption
- ✅ No sensitive data stored on your website

## Testing
Before going live, test with Stripe's test card numbers:
- **Success**: 4242 4242 4242 4242
- **Declined**: 4000 0000 0000 0002
- **3D Secure**: 4000 0025 0000 3155

## Support
- Stripe Documentation: https://stripe.com/docs
- Payment Links Guide: https://stripe.com/docs/payment-links
- Test Cards: https://stripe.com/docs/testing#cards 