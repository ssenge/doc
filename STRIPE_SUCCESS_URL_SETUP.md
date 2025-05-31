# Configure Stripe Payment Link Success URL

## Current Issue ❌
- Stripe Payment Link redirects to Stripe's default success page
- You want customers redirected to your custom success page

## Solution ✅

### Step 1: Edit Your Payment Link
1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Payment Links**
3. Find your €29 TRT Assessment payment link
4. Click the **⋯** menu → **Edit**

### Step 2: Configure Success URL
In the **After payment** section:

**Success URL**: 
```
https://yourdomain.com/success.html
```
Replace `yourdomain.com` with your actual domain.

**Cancel URL**:
```
https://yourdomain.com/consultation.html
```

### Step 3: For Local Testing
If testing locally, you can use:
```
http://localhost:8000/success.html
```

### Step 4: Save Changes
Click **Save** to update your Payment Link.

## Result 🎉
After payment completion:
- ✅ Customer redirected to YOUR success page
- ✅ Shows your custom "Payment Successful" message
- ✅ Displays payment confirmation details
- ✅ Maintains your branding and user experience

## Note
The success page will automatically detect if it's a real Stripe payment (vs demo) and show appropriate confirmation details. 