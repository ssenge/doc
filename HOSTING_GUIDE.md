# TRT Clinic Website Hosting Guide

## 🚀 **Best Hosting Options for Your Static Website + Supabase**

Since Supabase is your backend (database + auth), you need a static website host for your frontend. Here are the best options:

---

## 🌟 **Option 1: Vercel (RECOMMENDED)**

### **Why Vercel?**
- ✅ **Free tier** with generous limits
- ✅ **Automatic HTTPS** and global CDN
- ✅ **GitHub integration** - auto-deploys on push
- ✅ **Custom domains** supported
- ✅ **Perfect performance** for static sites
- ✅ **Built-in analytics**

### **Setup Steps:**

1. **Push your code to GitHub** (if not already done)
2. **Go to**: https://vercel.com
3. **Sign up** with your GitHub account
4. **Import your repository**
5. **Deploy** - it's automatic!

### **Configuration for Vercel:**

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### **Update Supabase Configuration:**

After deployment, update your Supabase dashboard:

1. **Site URL**: `https://your-project.vercel.app`
2. **Redirect URLs**: Add `https://your-project.vercel.app/**`

---

## 🔥 **Option 2: Netlify**

### **Why Netlify?**
- ✅ **Free tier** with good limits
- ✅ **Drag & drop deployment**
- ✅ **GitHub integration**
- ✅ **Form handling** (useful for contact forms)
- ✅ **Edge functions** for advanced features

### **Setup Steps:**

1. **Go to**: https://netlify.com
2. **Sign up** and connect GitHub
3. **Deploy from GitHub** or drag & drop your files
4. **Configure custom domain** (optional)

### **Configuration for Netlify:**

Create `netlify.toml` in your project root:

```toml
[build]
  publish = "."

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"

[[redirects]]
  from = "/auth-confirm"
  to = "/auth-confirm.html"
  status = 200

[[redirects]]
  from = "/dashboard"
  to = "/dashboard.html"
  status = 200
```

---

## 📦 **Option 3: GitHub Pages (Free)**

### **Why GitHub Pages?**
- ✅ **Completely free**
- ✅ **Integrated with GitHub**
- ✅ **Custom domains** supported
- ✅ **Simple setup**

### **Setup Steps:**

1. **Push your code to GitHub**
2. **Go to**: Repository → Settings → Pages
3. **Select source**: Deploy from a branch (main)
4. **Your site will be**: `https://username.github.io/repository-name`

### **Configuration for GitHub Pages:**

Update your `assets/js/config.js`:

```javascript
// Update for production
app: {
    name: 'eDoc',
    displayName: 'TRT Clinic',
    version: '1.0.0',
    environment: 'production',  // Change to production
    debug: false,               // Disable debug in production
}
```

---

## ⚡ **Option 4: Firebase Hosting**

### **Why Firebase Hosting?**
- ✅ **Google's infrastructure**
- ✅ **Fast global CDN**
- ✅ **Free tier** available
- ✅ **Easy CLI deployment**

### **Setup Steps:**

1. **Install Firebase CLI**: `npm install -g firebase-tools`
2. **Login**: `firebase login`
3. **Initialize**: `firebase init hosting`
4. **Deploy**: `firebase deploy`

---

## 🏆 **Recommended Setup: Vercel + Supabase**

### **Complete Production Setup:**

1. **Deploy to Vercel** (or your preferred host)
2. **Get your production URL**: `https://your-project.vercel.app`
3. **Update Supabase Dashboard**:
   - Site URL: `https://your-project.vercel.app`
   - Redirect URLs: `https://your-project.vercel.app/**`
4. **Update your config.js**:

```javascript
// Production configuration
const EDOC_CONFIG = {
    supabase: {
        url: 'https://clsknohsqcqiymjgrrxc.supabase.co',
        anonKey: 'your-anon-key'
    },
    app: {
        name: 'eDoc',
        displayName: 'TRT Clinic',
        version: '1.0.0',
        environment: 'production',
        debug: false
    }
    // ... rest of config
};
```

---

## 🔧 **Pre-Deployment Checklist**

Before deploying to production:

- [ ] **Update config.js** environment to 'production'
- [ ] **Disable debug mode**
- [ ] **Test all authentication flows**
- [ ] **Verify email confirmation works**
- [ ] **Test payment integration**
- [ ] **Check all forms work**
- [ ] **Optimize images** (if any)
- [ ] **Remove test data**

---

## 🌐 **Custom Domain Setup**

### **For Vercel:**
1. **Add domain** in Vercel dashboard
2. **Update DNS** records as instructed
3. **Update Supabase** redirect URLs

### **For Netlify:**
1. **Add domain** in Netlify dashboard
2. **Update DNS** or use Netlify DNS
3. **Update Supabase** redirect URLs

### **For GitHub Pages:**
1. **Add CNAME file** with your domain
2. **Update DNS** A records to GitHub IPs
3. **Update Supabase** redirect URLs

---

## 🚨 **Important: Update Supabase After Deployment**

After deploying to any platform:

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/clsknohsqcqiymjgrrxc
2. **Authentication → URL Configuration**
3. **Update Site URL**: `https://your-production-domain.com`
4. **Add to Redirect URLs**: `https://your-production-domain.com/**`
5. **Test email confirmation** with production URLs

---

## 📊 **Hosting Comparison**

| Feature | Vercel | Netlify | GitHub Pages | Firebase |
|---------|--------|---------|--------------|----------|
| **Free Tier** | ✅ Generous | ✅ Good | ✅ Unlimited | ✅ Limited |
| **Custom Domain** | ✅ | ✅ | ✅ | ✅ |
| **HTTPS** | ✅ Auto | ✅ Auto | ✅ Auto | ✅ Auto |
| **GitHub Integration** | ✅ | ✅ | ✅ Built-in | ✅ |
| **Performance** | 🌟 Excellent | 🌟 Excellent | ⭐ Good | 🌟 Excellent |
| **Ease of Use** | 🌟 Very Easy | 🌟 Very Easy | ⭐ Easy | ⭐ Moderate |

**Winner**: **Vercel** for best overall experience with static sites + Supabase

---

## 🆘 **Need Help?**

If you run into issues:

1. **Check hosting platform docs**
2. **Verify Supabase redirect URLs**
3. **Test in incognito mode**
4. **Check browser console** for errors
5. **Verify all file paths** are correct

**Pro Tip**: Start with Vercel - it's the easiest and most reliable for this type of project! 