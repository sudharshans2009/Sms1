#!/bin/bash

echo "🧪 Testing School Management System APIs"
echo "========================================"
echo

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

test_api() {
    local name="$1"
    local endpoint="$2"
    
    echo -n "Testing $name... "
    
    # Test API endpoint and check if it returns valid JSON
    response=$(curl -s "$BASE_URL$endpoint")
    
    if echo "$response" | jq . > /dev/null 2>&1; then
        # Valid JSON - check if it has success field
        if echo "$response" | jq -r '.success' 2>/dev/null | grep -q "true"; then
            data_count=$(echo "$response" | jq -r '.data | length' 2>/dev/null)
            if [ "$data_count" = "null" ]; then
                data_count="N/A"
            fi
            echo -e "${GREEN}✅ SUCCESS${NC} (${data_count} items)"
        else
            error_msg=$(echo "$response" | jq -r '.error // "Unknown error"' 2>/dev/null)
            echo -e "${RED}❌ ERROR:${NC} $error_msg"
        fi
    else
        # Not JSON or no response
        if [ -z "$response" ]; then
            echo -e "${RED}❌ NO RESPONSE${NC}"
        else
            echo -e "${RED}❌ INVALID RESPONSE${NC}"
        fi
    fi
}

# Core API Tests
echo -e "${BLUE}📊 Core APIs${NC}"
echo "-------------"
test_api "Students" "/api/students"
test_api "Teachers" "/api/teachers"
test_api "Classes" "/api/classes"
test_api "Buses" "/api/buses"
test_api "Announcements" "/api/announcements"

echo
echo -e "${BLUE}📚 Academic APIs${NC}"
echo "----------------"
test_api "Marks" "/api/marks"
test_api "Attendance" "/api/attendance"
test_api "Fees" "/api/fees"
test_api "Timetable" "/api/timetable"

echo
echo -e "${BLUE}📅 Academic Calendar APIs${NC}"
echo "-------------------------"
test_api "Academic Years" "/api/academic-calendar?type=academic-year"
test_api "Academic Events" "/api/academic-calendar?type=event"
test_api "Holidays" "/api/academic-calendar?type=holiday"
test_api "Exams" "/api/academic-calendar?type=exam"
test_api "Terms" "/api/academic-calendar?type=term"

echo
echo -e "${BLUE}📚 Library APIs${NC}"
echo "---------------"
test_api "Library Books" "/api/library/books"
test_api "Borrowed Books" "/api/library/borrowed"

echo
echo -e "${BLUE}💬 Communication APIs${NC}"
echo "---------------------"
test_api "Messages" "/api/messages"

echo
echo -e "${BLUE}🔧 System APIs${NC}"
echo "---------------"
test_api "Database Test" "/api/test-connection"

echo
echo "========================================"
echo -e "${BLUE}🎉 API Testing Complete!${NC}"
echo "========================================"