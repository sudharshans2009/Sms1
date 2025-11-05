#!/bin/bash

# Database Setup Script for Amrita Vidyalayam SMS
echo "🚀 Setting up Neon PostgreSQL database..."

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Push schema to database
echo "📤 Pushing schema to Neon database..."
npx prisma db push

# Seed database with sample data (optional)
echo "🌱 Seeding database with sample data..."
npx prisma db seed 2>/dev/null || echo "⚠️  No seed script found. Skipping..."

echo "✅ Database setup complete!"
echo ""
echo "🎯 Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Access http://localhost:3000"
echo "3. Login with admin@123 / admin"
echo "4. Navigate to Library Management to see the new features"
