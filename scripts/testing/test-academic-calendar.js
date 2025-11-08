const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAcademicCalendarAPI() {
  console.log('🧪 Testing Academic Calendar API endpoints...\n');

  try {
    // Test 1: Get all academic years
    console.log('1. Testing GET /api/academic-calendar?type=academic-year');
    const academicYearsResponse = await axios.get(`${BASE_URL}/api/academic-calendar?type=academic-year`);
    console.log('✅ Academic Years:', academicYearsResponse.data.data?.length || 0, 'found');
    
    const academicYearId = academicYearsResponse.data.data?.[0]?.id;
    if (!academicYearId) {
      throw new Error('No academic years found');
    }

    // Test 2: Get all events
    console.log('\n2. Testing GET /api/academic-calendar?type=event');
    const eventsResponse = await axios.get(`${BASE_URL}/api/academic-calendar?type=event&academicYearId=${academicYearId}`);
    console.log('✅ Events:', eventsResponse.data.data?.length || 0, 'found');

    // Test 3: Get all holidays
    console.log('\n3. Testing GET /api/academic-calendar?type=holiday');
    const holidaysResponse = await axios.get(`${BASE_URL}/api/academic-calendar?type=holiday&academicYearId=${academicYearId}`);
    console.log('✅ Holidays:', holidaysResponse.data.data?.length || 0, 'found');

    // Test 4: Get all exams
    console.log('\n4. Testing GET /api/academic-calendar?type=exam');
    const examsResponse = await axios.get(`${BASE_URL}/api/academic-calendar?type=exam`);
    console.log('✅ Exams:', examsResponse.data.data?.length || 0, 'found');

    // Test 5: Get all terms
    console.log('\n5. Testing GET /api/academic-calendar?type=term');
    const termsResponse = await axios.get(`${BASE_URL}/api/academic-calendar?type=term&academicYearId=${academicYearId}`);
    console.log('✅ Terms:', termsResponse.data.data?.length || 0, 'found');

    // Test 6: Get all calendar items
    console.log('\n6. Testing GET /api/academic-calendar (all items)');
    const allItemsResponse = await axios.get(`${BASE_URL}/api/academic-calendar?academicYearId=${academicYearId}&month=12`);
    console.log('✅ All items for December:', allItemsResponse.data.data?.length || 0, 'found');

    // Test 7: Create a new event
    console.log('\n7. Testing POST /api/academic-calendar (create event)');
    const newEventData = {
      type: 'event',
      title: 'Test Event',
      description: 'Test event for API validation',
      eventType: 'MEETING',
      startDate: '2024-06-20',
      endDate: '2024-06-20',
      priority: 'MEDIUM',
      isPublic: true,
      createdBy: 'api-test',
      createdByName: 'API Test',
      createdByRole: 'ADMIN',
      academicYearId: academicYearId,
    };

    const createResponse = await axios.post(`${BASE_URL}/api/academic-calendar`, newEventData);
    console.log('✅ Created test event:', createResponse.data.data.title);
    const newEventId = createResponse.data.data.id;

    // Test 8: Get specific event
    console.log('\n8. Testing GET /api/academic-calendar/[id]');
    const eventResponse = await axios.get(`${BASE_URL}/api/academic-calendar/${newEventId}?type=event`);
    console.log('✅ Retrieved event:', eventResponse.data.data.title);

    // Test 9: Update the event
    console.log('\n9. Testing PUT /api/academic-calendar/[id]');
    const updateData = {
      type: 'event',
      title: 'Updated Test Event',
      description: 'Updated test event for API validation',
      priority: 'HIGH',
    };

    const updateResponse = await axios.put(`${BASE_URL}/api/academic-calendar/${newEventId}`, updateData);
    console.log('✅ Updated event:', updateResponse.data.data.title);

    // Test 10: Delete the event
    console.log('\n10. Testing DELETE /api/academic-calendar/[id]');
    const deleteResponse = await axios.delete(`${BASE_URL}/api/academic-calendar/${newEventId}?type=event`);
    console.log('✅ Deleted event successfully');

    console.log('\n🎉 All Academic Calendar API tests passed!');
    
    return {
      success: true,
      results: {
        academicYears: academicYearsResponse.data.data?.length || 0,
        events: eventsResponse.data.data?.length || 0,
        holidays: holidaysResponse.data.data?.length || 0,
        exams: examsResponse.data.data?.length || 0,
        terms: termsResponse.data.data?.length || 0,
        allItems: allItemsResponse.data.data?.length || 0,
      }
    };

  } catch (error) {
    console.error('❌ API Test failed:', error.response?.data || error.message);
    return { success: false, error: error.message };
  }
}

// Test other key API endpoints
async function testOtherAPIs() {
  console.log('\n🧪 Testing other critical API endpoints...\n');

  const endpoints = [
    { name: 'Students API', url: '/api/students' },
    { name: 'Teachers API', url: '/api/teachers' },
    { name: 'Classes API', url: '/api/classes' },
    { name: 'Announcements API', url: '/api/announcements' },
    { name: 'Buses API', url: '/api/buses' },
    { name: 'Library Books API', url: '/api/library/books' },
    { name: 'Messages API', url: '/api/messages' },
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await axios.get(`${BASE_URL}${endpoint.url}`);
      console.log(`✅ ${endpoint.name}: ${response.data.data?.length || 'OK'} items`);
    } catch (error) {
      console.log(`❌ ${endpoint.name}: ${error.response?.status || 'Error'} - ${error.response?.statusText || error.message}`);
    }
  }
}

async function runAllTests() {
  console.log('🚀 Starting comprehensive API testing...\n');
  
  const calendarTest = await testAcademicCalendarAPI();
  await testOtherAPIs();
  
  console.log('\n📊 Test Summary:');
  console.log('Academic Calendar API:', calendarTest.success ? 'PASSED' : 'FAILED');
  if (calendarTest.success && calendarTest.results) {
    console.log('- Academic Years:', calendarTest.results.academicYears);
    console.log('- Events:', calendarTest.results.events);
    console.log('- Holidays:', calendarTest.results.holidays);
    console.log('- Exams:', calendarTest.results.exams);
    console.log('- Terms:', calendarTest.results.terms);
  }
  
  console.log('\n✨ Testing completed!');
}

if (require.main === module) {
  runAllTests();
}

module.exports = { testAcademicCalendarAPI, testOtherAPIs };