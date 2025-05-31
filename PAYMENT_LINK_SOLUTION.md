# Payment Link Redirect Solution

## Issue ❌
- Stripe Payment Links don't support `success_url`/`cancel_url` as URL parameters
- Current Payment Link redirects to Stripe's default success page
- Need to redirect to your custom success page: `https://ssenge.github.io/doc/success.html`

## Solution ✅

### Method 1: Create New Payment Link via Stripe Dashboard (Easiest)

1. **Go to** [Stripe Dashboard](https://dashboard.stripe.com) → **Products** → **Payment Links**
2. **Click "Create payment link"**
3. **Fill in product details:**
   - Name: "TRT Assessment"
   - Price: €29.00
   - Currency: EUR
4. **In "After payment" section:**
   - Select **"Redirect to your website"** (instead of "Show confirmation page")
   - Success URL: `https://ssenge.github.io/doc/success.html`
5. **Click "Create link"**
6. **Copy the new Payment Link URL**

### Method 2: Create via API

```bash
curl https://api.stripe.com/v1/payment_links \
  -u "YOUR_STRIPE_SECRET_KEY:" \
  -d "line_items[0][price_data][currency]"=eur \
  -d "line_items[0][price_data][product_data][name]"="TRT Assessment" \
  -d "line_items[0][price_data][unit_amount]"=2900 \
  -d "line_items[0][quantity]"=1 \
  -d "after_completion[type]"=redirect \
  -d "after_completion[redirect][url]"="https://ssenge.github.io/doc/success.html"
```

## Update Your Code

Replace the Payment Link URL in `assets/js/stripe-integration.js`:

```javascript
const PAYMENT_LINKS = {
    'none': 'NEW_PAYMENT_LINK_URL_HERE',
    'video': 'NEW_PAYMENT_LINK_URL_HERE', 
    'phone': 'NEW_PAYMENT_LINK_URL_HERE',
    'premium': 'NEW_PAYMENT_LINK_URL_HERE'
};
```

## Result 🎉

After payment completion:
- ✅ Customer redirected to YOUR success page
- ✅ No Stripe default success page
- ✅ Complete control over post-payment experience
- ✅ Professional user experience

## Key Points

- Payment Link redirect URLs are configured when **creating** the Payment Link
- Existing Payment Links **cannot** be modified to add redirect URLs
- URL parameters like `?success_url=...` **do not work** with Payment Links
- You must create a new Payment Link with proper redirect configuration 