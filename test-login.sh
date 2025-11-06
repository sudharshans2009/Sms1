#!/bin/bash

echo "Testing login API..."
echo ""

# Wait for server to be ready
sleep 3

# Test admin login
echo "Testing admin login..."
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@amrita.edu","password":"admin123","role":"admin"}')

echo "Response: $response"
echo ""

# Test teacher login
echo "Testing teacher login..."
response=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@amrita.edu","password":"teacher123","role":"teacher"}')

echo "Response: $response"
echo ""

echo "Login tests complete!"
