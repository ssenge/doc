# 🚀 TRT Clinic Deployment Guide

## ✅ **Your Stable Production URL**
**https://trt-clinic-sebastian-senges-projects.vercel.app**

This URL will **NEVER change** - you only need to configure Supabase once!

## 🔧 **One-Time Supabase Setup**

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project** → **Authentication** → **URL Configuration**
3. **Set these URLs (ONCE ONLY)**:
   - **Site URL**: `https://trt-clinic-sebastian-senges-projects.vercel.app`
   - **Redirect URLs**: `https://trt-clinic-sebastian-senges-projects.vercel.app/auth-confirm.html`

## 🚀 **Easy Deployment**

### **Option 1: Use the Deploy Script (Recommended)**
```bash
./deploy.sh
```

### **Option 2: Manual Deployment**
```bash
git add .
git commit -m "Your changes"
git push
vercel --prod --force
vercel alias set [NEW_URL] trt-clinic-sebastian-senges-projects.vercel.app
```

## 🎯 **Why This Works**

- **Stable Domain**: `trt-clinic-sebastian-senges-projects.vercel.app` never changes
- **Automatic Aliasing**: Each deployment gets aliased to the stable domain
- **No More Supabase Updates**: Configure once, deploy forever!

## 📝 **Notes**

- The deployment script automatically handles the aliasing
- Your stable URL will always work, even after new deployments
- Supabase configuration is now **set-and-forget**

## 🔗 **Quick Links**

- **Live Site**: https://trt-clinic-sebastian-senges-projects.vercel.app
- **Vercel Dashboard**: https://vercel.com/sebastian-senges-projects/trt-clinic
- **GitHub Repo**: https://github.com/ssenge/doc 