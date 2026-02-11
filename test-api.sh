#!/bin/bash

# MongoDB Integration Test Suite
# Tests all API endpoints and services

echo "🧪 MONGODB INTEGRATION TEST SUITE"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Base URL
BASE_URL="http://localhost:3000/api"

# Helper function to test endpoint
test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected_status=$4
  local description=$5

  echo -n "Testing $description... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi

  status=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n-1)

  if [ "$status" = "$expected_status" ]; then
    echo -e "${GREEN}✓ PASS${NC} (Status: $status)"
    ((TESTS_PASSED++))
  else
    echo -e "${RED}✗ FAIL${NC} (Expected: $expected_status, Got: $status)"
    ((TESTS_FAILED++))
  fi
}

echo "📋 API ENDPOINT TESTS"
echo "-------------------"
echo ""

# Users endpoints
echo "Users Endpoints:"
test_endpoint "GET" "/users" "" "401" "GET /api/users (should require auth)"
test_endpoint "POST" "/users" '{"name":"Test","email":"test@test.com"}' "401" "POST /api/users (should require auth)"

echo ""
echo "Facilities Endpoints:"
test_endpoint "GET" "/facilities" "" "401" "GET /api/facilities (should require auth)"
test_endpoint "POST" "/facilities" '{"name":"Test Facility"}' "401" "POST /api/facilities (should require auth)"

echo ""
echo "Patients Endpoints:"
test_endpoint "GET" "/patients" "" "401" "GET /api/patients (should require auth)"
test_endpoint "POST" "/patients" '{"firstName":"John","lastName":"Doe"}' "401" "POST /api/patients (should require auth)"

echo ""
echo "Cases Endpoints:"
test_endpoint "GET" "/cases" "" "401" "GET /api/cases (should require auth)"
test_endpoint "POST" "/cases" '{"diseaseCode":"MEASLES"}' "401" "POST /api/cases (should require auth)"

echo ""
echo "Alerts Endpoints:"
test_endpoint "GET" "/alerts" "" "401" "GET /api/alerts (should require auth)"
test_endpoint "POST" "/alerts" '{"diseaseCode":"MEASLES"}' "401" "POST /api/alerts (should require auth)"

echo ""
echo "=================================="
echo "📊 TEST RESULTS"
echo "=================================="
echo -e "Passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Failed: ${RED}$TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
  echo -e "${GREEN}✓ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}✗ Some tests failed${NC}"
  exit 1
fi
