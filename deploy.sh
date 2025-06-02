#!/bin/bash

# TRT Clinic Deployment Script
# This script ensures we always use the stable production domain

echo "🚀 Deploying TRT Clinic to production..."

# Deploy to Vercel
DEPLOYMENT_URL=$(vercel --prod --force | grep "Production:" | awk '{print $2}')

if [ -n "$DEPLOYMENT_URL" ]; then
    echo "✅ Deployment successful: $DEPLOYMENT_URL"
    
    # Set alias to stable domain
    echo "🔗 Setting up stable domain alias..."
    vercel alias set "$DEPLOYMENT_URL" trt-clinic-sebastian-senges-projects.vercel.app
    
    echo "🎉 Deployment complete!"
    echo "🌐 Your stable URL: https://trt-clinic-sebastian-senges-projects.vercel.app"
    echo ""
    echo "📋 Supabase Configuration:"
    echo "   Site URL: https://trt-clinic-sebastian-senges-projects.vercel.app"
    echo "   Redirect URLs: https://trt-clinic-sebastian-senges-projects.vercel.app/auth-confirm.html"
else
    echo "❌ Deployment failed"
    exit 1
fi 