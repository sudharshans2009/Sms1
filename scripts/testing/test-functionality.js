// Test announcement deletion and message sending functionality
const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testFunctionality() {
  console.log('🧪 Testing announcement deletion and message sending...\n');

  try {
    // Test 1: Create a test announcement
    console.log('1️⃣ Creating test announcement...');
    const createResponse = await axios.post(`${BASE_URL}/api/announcements`, {
      title: 'Test Announcement',
      content: 'This is a test announcement for deletion testing',
      priority: 'NORMAL',
      target: 'ALL'
    });

    if (createResponse.data.success) {
      console.log(`✅ Announcement created with ID: ${createResponse.data.data.id}`);
      
      // Test 2: Delete the announcement
      console.log('\n2️⃣ Testing announcement deletion...');
      const deleteResponse = await axios.delete(`${BASE_URL}/api/announcements?id=${createResponse.data.data.id}`);
      
      if (deleteResponse.data.success) {
        console.log('✅ Announcement deleted successfully!');
      } else {
        console.log('❌ Announcement deletion failed:', deleteResponse.data.error);
      }
    } else {
      console.log('❌ Failed to create test announcement:', createResponse.data.error);
    }

    // Test 3: Test message sending
    console.log('\n3️⃣ Testing message sending...');
    
    // First, get available users
    const usersResponse = await axios.get(`${BASE_URL}/api/students`);
    console.log(`📊 Students API response status: ${usersResponse.status}`);
    
    if (usersResponse.data) {
      let students = [];
      if (usersResponse.data.success && usersResponse.data.students) {
        students = usersResponse.data.students;
      } else if (Array.isArray(usersResponse.data)) {
        students = usersResponse.data;
      }
      
      if (students.length >= 2) {
        console.log(`👥 Found ${students.length} students for testing`);
        
        // Send a test message
        const messageResponse = await axios.post(`${BASE_URL}/api/messages`, {
          subject: 'Test Message',
          content: 'This is a test message to verify sending functionality',
          senderId: students[0].id || students[0].userId || 'test-sender',
          senderName: students[0].name || 'Test Sender',
          senderRole: 'STUDENT',
          receiverId: students[1].id || students[1].userId || 'test-receiver', 
          receiverName: students[1].name || 'Test Receiver',
          receiverRole: 'STUDENT',
          priority: 'NORMAL',
          category: 'GENERAL',
          isDraft: false
        });
        
        if (messageResponse.data.success) {
          console.log('✅ Message sent successfully!');
          console.log(`📨 Message ID: ${messageResponse.data.message.id}`);
        } else {
          console.log('❌ Message sending failed:', messageResponse.data.error);
        }
      } else {
        console.log('⚠️ Not enough students found for message testing');
      }
    }

    // Test 4: Test draft message saving
    console.log('\n4️⃣ Testing draft message saving...');
    const draftResponse = await axios.post(`${BASE_URL}/api/messages`, {
      subject: 'Draft Message',
      content: 'This is a draft message for testing',
      senderId: 'test-sender-id',
      senderName: 'Test User',
      senderRole: 'ADMIN',
      isDraft: true
    });
    
    if (draftResponse.data.success) {
      console.log('✅ Draft message saved successfully!');
      console.log(`📝 Draft ID: ${draftResponse.data.message.id}`);
    } else {
      console.log('❌ Draft saving failed:', draftResponse.data.error);
    }

    console.log('\n🎉 Testing completed!');

  } catch (error) {
    console.error('❌ Testing error:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data:`, error.response.data);
    }
  }
}

// Run tests
testFunctionality();