# Supabase Email Confirmation Fix Guide

## 🚨 **Issue**: Email confirmation redirects to localhost with `otp_expired` error

### **Root Causes:**
1. Supabase redirect URLs not configured for localhost development
2. Email confirmation tokens expiring too quickly
3. Missing redirect URL configuration in Supabase dashboard

---

## ✅ **Solution 1: Configure Supabase Dashboard (REQUIRED)**

### **Step 1: Add Redirect URLs in Supabase Dashboard**

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/clsknohsqcqiymjgrrxc
2. Navigate to **Authentication** → **URL Configuration**
3. Add these URLs to **Redirect URLs**:

```
http://localhost:8000/**
http://localhost:8001/**
http://localhost:8002/**
http://localhost:8003/**
http://localhost:3000/**
https://your-github-pages-url.github.io/**
```

### **Step 2: Update Site URL**
- Set **Site URL** to: `http://localhost:8000` (for development)
- Or your production URL if deploying

### **Step 3: Configure Email Templates**
1. Go to **Authentication** → **Email Templates**
2. For each template (Confirm signup, Invite user, Magic Link, etc.), update the confirmation link:

**Replace:**
```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirm your email</a>
```

**With:**
```html
<a href="{{ .RedirectTo }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&redirect_to={{ .RedirectTo }}">Confirm your email</a>
```

---

## ✅ **Solution 2: Update Your Application Code**

### **Step 1: Add Email Confirmation Handler**

Create a new file: `auth-confirm.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Confirmation - TRT Clinic</title>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.2.1/flowbite.min.css" rel="stylesheet" />
</head>
<body class="bg-gray-50">
    <div class="min-h-screen flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-md p-6">
            <div id="loading" class="text-center">
                <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p class="text-gray-600">Confirming your email...</p>
            </div>
            
            <div id="success" class="text-center hidden">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Email Confirmed!</h2>
                <p class="text-gray-600 mb-4">Your email has been successfully confirmed.</p>
                <a href="dashboard.html" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Go to Dashboard
                </a>
            </div>
            
            <div id="error" class="text-center hidden">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
                <h2 class="text-xl font-semibold text-gray-900 mb-2">Confirmation Failed</h2>
                <p class="text-gray-600 mb-4" id="error-message">The confirmation link is invalid or has expired.</p>
                <a href="login.html" class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                    Back to Login
                </a>
            </div>
        </div>
    </div>

    <script src="assets/js/config.js"></script>
    <script src="assets/js/supabase-client.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', async function() {
            const urlParams = new URLSearchParams(window.location.search);
            const tokenHash = urlParams.get('token_hash');
            const type = urlParams.get('type');
            const redirectTo = urlParams.get('redirect_to');
            
            const loadingEl = document.getElementById('loading');
            const successEl = document.getElementById('success');
            const errorEl = document.getElementById('error');
            const errorMessageEl = document.getElementById('error-message');
            
            if (!tokenHash || !type) {
                showError('Missing confirmation parameters');
                return;
            }
            
            try {
                // Confirm the email using Supabase
                const { data, error } = await window.eDocAuth.supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type: type
                });
                
                if (error) {
                    throw error;
                }
                
                // Success!
                loadingEl.classList.add('hidden');
                successEl.classList.remove('hidden');
                
                // Redirect after 3 seconds
                setTimeout(() => {
                    window.location.href = redirectTo || 'dashboard.html';
                }, 3000);
                
            } catch (error) {
                console.error('Email confirmation error:', error);
                showError(error.message || 'Confirmation failed');
            }
            
            function showError(message) {
                loadingEl.classList.add('hidden');
                errorMessageEl.textContent = message;
                errorEl.classList.remove('hidden');
            }
        });
    </script>
</body>
</html>
```

### **Step 2: Update Registration Code**

Update your registration functions to include proper redirect URLs:

```javascript
// In your registration code
const { data, error } = await window.eDocAuth.signUp(email, password, {
    full_name: fullName,
    preferred_language: 'en'
}, {
    emailRedirectTo: `${window.location.origin}/auth-confirm.html`
});
```

---

## ✅ **Solution 3: Development Testing Setup**

### **Test Email Confirmation Locally:**

1. **Start your local server:**
   ```bash
   python3 -m http.server 8000
   ```

2. **Register a new user with a real email address** (not test@example.com)

3. **Check your email** for the confirmation link

4. **The link should now redirect properly** to your localhost

---

## ✅ **Solution 4: Quick Fix for Immediate Testing**

If you need to test immediately without waiting for email setup:

```javascript
// Add this to your success.html for testing
async function bypassEmailConfirmation() {
    try {
        // Get current user
        const user = await window.eDocAuth.getCurrentUser();
        if (user && !user.email_confirmed_at) {
            // Manually mark as confirmed (development only!)
            console.log('Bypassing email confirmation for development');
            // You can proceed with account creation
        }
    } catch (error) {
        console.error('Bypass error:', error);
    }
}
```

---

## 🔍 **Debugging Steps**

1. **Check Supabase Dashboard:**
   - Verify redirect URLs are added
   - Check email template configuration
   - Ensure Site URL is correct

2. **Test with Real Email:**
   - Use a real email address (Gmail, etc.)
   - Check spam folder
   - Verify email template is sending correct links

3. **Console Debugging:**
   - Open browser console
   - Check for JavaScript errors
   - Verify Supabase client initialization

4. **Network Tab:**
   - Check if API calls are successful
   - Verify correct endpoints are being called

---

## 📝 **Production Checklist**

Before deploying to production:

- [ ] Update Site URL to production domain
- [ ] Add production domain to redirect URLs
- [ ] Test email confirmation flow
- [ ] Verify all authentication flows work
- [ ] Remove development bypass code
- [ ] Test with real user accounts

---

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check Supabase project logs** in the dashboard
2. **Verify your Supabase project is active** and not paused
3. **Test with a fresh incognito browser window**
4. **Clear browser cache and localStorage**
5. **Try with a different email provider** (Gmail vs Outlook)

The most common issue is missing redirect URL configuration in the Supabase dashboard - make sure to add all your localhost URLs there first! 