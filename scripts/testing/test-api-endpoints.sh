#!/bin/bash

echo "🚀 Testing messaging and student profile APIs..."

# Test messaging API
echo "📨 Testing messages API..."
response1=$(curl -s "http://localhost:3000/api/messages")
if echo "$response1" | grep -q "success\|messages\|id"; then
    echo "✅ Messages API working!"
    echo "Sample response: $(echo "$response1" | head -c 200)..."
else
    echo "❌ Messages API failed!"
    echo "Response: $response1"
fi

# Test student profile API  
echo -e "\n👤 Testing student profile API..."
response2=$(curl -s "http://localhost:3000/api/students/cmhmlx7qo00049yk07vb4tdto")
if echo "$response2" | grep -q "success\|student\|medical"; then
    echo "✅ Student profile API working!"
    echo "Sample response: $(echo "$response2" | head -c 200)..."
else
    echo "❌ Student profile API failed!"
    echo "Response: $response2"
fi

echo -e "\n🎉 API testing completed!"