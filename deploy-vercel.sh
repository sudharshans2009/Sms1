#!/bin/bash

# Vercel Deployment Script for Amrita Vidyalayam SMS
# This script helps deploy the application to Vercel

echo "🚀 Amrita Vidyalayam SMS - Vercel Deployment"
echo "=============================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI is not installed."
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is ready"
echo ""

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Prisma generation failed!"
    exit 1
fi

echo "✅ Prisma Client generated"
echo ""

# Build locally to check for errors
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful"
echo ""

# Ask for confirmation
echo "📋 Pre-deployment Checklist:"
echo "  ✓ Prisma Client generated"
echo "  ✓ Application built successfully"
echo ""
echo "⚠️  Before deploying, make sure you have:"
echo "  1. Set all environment variables in Vercel Dashboard"
echo "  2. Verified database connection string"
echo "  3. Checked .env.vercel file for reference"
echo ""

read -p "Continue with deployment? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "🚀 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Deployment successful!"
        echo ""
        echo "📝 Next Steps:"
        echo "  1. Visit your Vercel deployment URL"
        echo "  2. Test database: /api/test-db"
        echo "  3. Test login with credentials from seed data"
        echo ""
    else
        echo ""
        echo "❌ Deployment failed!"
        echo "Check Vercel dashboard for logs."
    fi
else
    echo "Deployment cancelled."
    exit 0
fi
