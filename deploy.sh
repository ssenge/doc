#!/bin/bash

# TRT Clinic Deployment Script
# This script ensures we always use the stable production domain

echo "🚀 Deploying TRT Clinic to production..."

# Deploy to Vercel and capture output
VERCEL_OUTPUT=$(vercel --prod --force 2>&1)
echo "$VERCEL_OUTPUT"

# Extract the production URL and clean it
DEPLOYMENT_URL=$(echo "$VERCEL_OUTPUT" | grep -E "Production:" | sed 's/.*Production: //' | sed 's/\[.*$//' | xargs)

if [ -n "$DEPLOYMENT_URL" ]; then
    echo ""
    echo "✅ Deployment successful: $DEPLOYMENT_URL"
    
    # Set alias to stable domain
    echo "🔗 Setting up stable domain alias..."
    vercel alias set "$DEPLOYMENT_URL" trt-clinic-sebastian-senges-projects.vercel.app
    
    echo ""
    echo "🎉 Deployment complete!"
    echo "🌐 Your stable URL: https://trt-clinic-sebastian-senges-projects.vercel.app"
    echo ""
    echo "📋 Supabase Configuration (ONE-TIME SETUP):"
    echo "   Site URL: https://trt-clinic-sebastian-senges-projects.vercel.app"
    echo "   Redirect URLs: https://trt-clinic-sebastian-senges-projects.vercel.app/auth-confirm.html"
    echo ""
    echo "✨ You never need to update Supabase URLs again!"
else
    echo "❌ Could not extract deployment URL"
    echo "Debug: Vercel output was:"
    echo "$VERCEL_OUTPUT"
    exit 1
fi 