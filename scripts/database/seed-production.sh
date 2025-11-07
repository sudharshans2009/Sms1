#!/bin/bash

echo "🌱 Seeding Production Database on Vercel..."

# Use the production environment variables
export POSTGRES_PRISMA_URL="postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?connect_timeout=15&sslmode=require"
export DATABASE_URL="postgresql://neondb_owner:npg_ZLQXp7dK9Asc@ep-solitary-star-a1omvioc-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo "📊 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npx prisma db seed

echo "✅ Production database seeded successfully!"
echo ""
echo "🔑 Login credentials:"
echo "   Admin: admin@amrita.edu / admin123"
echo "   Teacher: teacher@amrita.edu / teacher123"
echo "   Student: student@amrita.edu / student123"
echo "   Driver: driver@amrita.edu / driver123"
