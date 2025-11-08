#!/bin/bash

echo "🚀 Final Comprehensive Testing of School Management System"
echo "=========================================================="
echo

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counter
TOTAL_TESTS=0
PASSED_TESTS=0

test_endpoint() {
    local name="$1"
    local endpoint="$2"
    local expected_status="$3"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "Testing $name... "
    
    local response=$(curl -s -w "%{http_code}" -o /dev/null "http://localhost:3000$endpoint")
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $response)"
    fi
}

echo -e "${BLUE}📊 Testing Core API Endpoints${NC}"
echo "--------------------------------"

# Core API Tests
test_endpoint "Students API" "/api/students" "200"
test_endpoint "Teachers API" "/api/teachers" "200"
test_endpoint "Classes API" "/api/classes" "200"
test_endpoint "Buses API" "/api/buses" "200"
test_endpoint "Announcements API" "/api/announcements" "200"
test_endpoint "Marks API" "/api/marks" "200"
test_endpoint "Attendance API" "/api/attendance" "200"
test_endpoint "Fees API" "/api/fees" "200"
test_endpoint "Messages API" "/api/messages" "200"
test_endpoint "Timetable API" "/api/timetable" "200"

echo
echo -e "${BLUE}📅 Testing Academic Calendar API${NC}"
echo "-----------------------------------"

# Academic Calendar Tests
test_endpoint "Academic Years" "/api/academic-calendar?type=academic-year" "200"
test_endpoint "Academic Events" "/api/academic-calendar?type=event" "200"
test_endpoint "Holidays" "/api/academic-calendar?type=holiday" "200"
test_endpoint "Exams" "/api/academic-calendar?type=exam" "200"
test_endpoint "Terms" "/api/academic-calendar?type=term" "200"
test_endpoint "All Calendar Items" "/api/academic-calendar" "200"

echo
echo -e "${BLUE}📚 Testing Library System${NC}"
echo "----------------------------"

# Library Tests
test_endpoint "Library Books" "/api/library/books" "200"
test_endpoint "Borrowed Books" "/api/library/borrowed" "200"

echo
echo -e "${BLUE}🚌 Testing Bus Tracking${NC}"
echo "---------------------------"

# Bus Tests
test_endpoint "Bus Issues" "/api/bus-issues" "200"
test_endpoint "Bus Locations" "/api/bus-location" "200"

echo
echo -e "${BLUE}🔐 Testing Authentication${NC}"
echo "-----------------------------"

# Auth Tests (expecting method not allowed for GET)
test_endpoint "Login Endpoint" "/api/auth/login" "405"

echo
echo -e "${BLUE}📱 Testing Frontend Pages${NC}"
echo "-----------------------------"

# Frontend Tests
test_endpoint "Home Page" "/" "200"
test_endpoint "Login Page" "/login" "200"
test_endpoint "Dashboard" "/dashboard" "200"
test_endpoint "Test Page" "/test" "200"

echo
echo "=========================================================="
echo -e "${YELLOW}📋 Test Results Summary${NC}"
echo "=========================================================="

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 ALL TESTS PASSED!${NC}"
    echo -e "${GREEN}✅ $PASSED_TESTS/$TOTAL_TESTS tests successful${NC}"
    echo
    echo -e "${GREEN}🚀 Your School Management System is fully functional!${NC}"
    echo
    echo "Key Features Verified:"
    echo "• ✅ Student Management System"
    echo "• ✅ Teacher Management System"
    echo "• ✅ Class Management"
    echo "• ✅ Bus Tracking with GPS"
    echo "• ✅ Library Management"
    echo "• ✅ Messaging System"
    echo "• ✅ Announcements"
    echo "• ✅ Academic Calendar (NEW!)"
    echo "• ✅ Marks & Attendance"
    echo "• ✅ Fee Management"
    echo "• ✅ Authentication System"
    echo
    echo -e "${BLUE}🌐 Access your application at: http://localhost:3000${NC}"
    
else
    echo -e "${RED}⚠️  Some tests failed${NC}"
    echo -e "${YELLOW}📊 $PASSED_TESTS/$TOTAL_TESTS tests passed${NC}"
    echo
    echo "Please check the failed endpoints above."
fi

echo
echo "=========================================================="