// Comprehensive API testing script
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 Starting comprehensive API testing...\n');
  
  try {
    // Test 1: Messages API
    console.log('📨 Testing Messages API...');
    try {
      const messagesResponse = await axios.get(`${BASE_URL}/api/messages`);
      console.log(`✅ Messages API Status: ${messagesResponse.status}`);
      console.log(`📊 Response data type: ${typeof messagesResponse.data}`);
      if (messagesResponse.data) {
        console.log(`📋 Sample response keys: ${Object.keys(messagesResponse.data)}`);
      }
    } catch (error) {
      console.log(`❌ Messages API Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
    }

    // Test 2: Students API  
    console.log('\n👥 Testing Students API...');
    try {
      const studentsResponse = await axios.get(`${BASE_URL}/api/students`);
      console.log(`✅ Students API Status: ${studentsResponse.status}`);
      console.log(`📊 Response data type: ${typeof studentsResponse.data}`);
      if (studentsResponse.data) {
        console.log(`📋 Sample response keys: ${Object.keys(studentsResponse.data)}`);
      }
    } catch (error) {
      console.log(`❌ Students API Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
    }

    // Test 3: Student Profile API
    console.log('\n👤 Testing Student Profile API...');
    try {
      // Get a student ID first
      const studentsResponse = await axios.get(`${BASE_URL}/api/students`);
      let studentId = null;
      
      if (studentsResponse.data && studentsResponse.data.students && studentsResponse.data.students.length > 0) {
        studentId = studentsResponse.data.students[0].id;
      } else if (studentsResponse.data && Array.isArray(studentsResponse.data) && studentsResponse.data.length > 0) {
        studentId = studentsResponse.data[0].id;
      }
      
      if (studentId) {
        console.log(`🔍 Testing with student ID: ${studentId}`);
        const profileResponse = await axios.get(`${BASE_URL}/api/students/${studentId}`);
        console.log(`✅ Student Profile API Status: ${profileResponse.status}`);
        console.log(`📊 Response data type: ${typeof profileResponse.data}`);
        if (profileResponse.data) {
          console.log(`📋 Sample response keys: ${Object.keys(profileResponse.data)}`);
        }
      } else {
        console.log('⚠️ No student ID found to test profile API');
      }
    } catch (error) {
      console.log(`❌ Student Profile API Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
    }

    // Test 4: Database connectivity
    console.log('\n🗄️ Testing Database API...');
    try {
      const dbResponse = await axios.get(`${BASE_URL}/api/test-db`);
      console.log(`✅ Database API Status: ${dbResponse.status}`);
      console.log(`📊 Response data type: ${typeof dbResponse.data}`);
      if (dbResponse.data) {
        console.log(`📋 Sample response keys: ${Object.keys(dbResponse.data)}`);
      }
    } catch (error) {
      console.log(`❌ Database API Error: ${error.message}`);
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Data: ${JSON.stringify(error.response.data).substring(0, 200)}`);
      }
    }

    console.log('\n🎉 API testing completed!');

  } catch (globalError) {
    console.error('❌ Global testing error:', globalError.message);
  }
}

// Run tests
testAPIs();