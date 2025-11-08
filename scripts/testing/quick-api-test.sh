#!/bin/bash

echo "🧪 Testing Academic Calendar API endpoints..."
echo

# Test basic API endpoints
echo "1. Testing Academic Calendar API..."
curl -s http://localhost:3000/api/academic-calendar?type=academic-year | head -n 5

echo -e "\n2. Testing Students API..."
curl -s http://localhost:3000/api/students | head -n 5

echo -e "\n3. Testing Teachers API..."
curl -s http://localhost:3000/api/teachers | head -n 5

echo -e "\n4. Testing Buses API..."
curl -s http://localhost:3000/api/buses | head -n 5

echo -e "\n5. Testing Library API..."
curl -s http://localhost:3000/api/library/books | head -n 5

echo -e "\n✅ Basic API connectivity test completed!"