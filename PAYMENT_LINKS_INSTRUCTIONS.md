# 🚀 Create Payment Links for TRT Treatments

## Quick Setup (Python Version)

### 1. Get Your Stripe Secret Key
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy your **Secret key** (starts with `sk_test_...`)
   - ⚠️ **NOT** the Publishable key (starts with `pk_test_...`)

### 2. Update the Script
Edit `create_payment_links.py` line 10:
```python
STRIPE_SECRET_KEY = 'sk_test_YOUR_ACTUAL_SECRET_KEY_HERE'
```

### 3. Run the Script
```bash
python3 create_payment_links.py
```

## 📤 What You'll Get

The script will:
1. ✅ Create 6 Stripe Products
2. ✅ Create 6 Stripe Prices  
3. ✅ Create 6 Payment Links
4. ✅ Output JavaScript code to copy
5. ✅ Save code to `payment_links_output.txt`

## 🔄 Next Steps

1. **Copy the generated JavaScript code**
2. **Replace the TREATMENTS object** in `assets/js/treatments.js`
3. **Test the payment links**
4. **Deploy to GitHub Pages**

## 💡 Example Output

```javascript
const TREATMENTS = {
    'testo-gel': {
        name: 'Testosterone Gel',
        price: 8900,
        currency: 'eur',
        description: '...',
        interval: 'month',
        paymentLink: 'https://buy.stripe.com/test_...'
    },
    // ... 5 more treatments
};
```

## 🔒 Security Note

- Never commit your secret key to git!
- The script only runs locally
- Payment Links are safe to share publicly 