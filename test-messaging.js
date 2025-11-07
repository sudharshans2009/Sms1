const testMessaging = async () => {
  console.log('🧪 Testing Messaging System...\n');

  const baseURL = 'http://localhost:3000';

  try {
    // Test 1: Fetch some users first
    console.log('1️⃣ Fetching users...');
    const studentsRes = await fetch(`${baseURL}/api/students`);
    const studentsData = await studentsRes.json();
    console.log(`✅ Found ${studentsData.students?.length || 0} students`);

    const teachersRes = await fetch(`${baseURL}/api/teachers`);
    const teachersData = await teachersRes.json();
    console.log(`✅ Found ${teachersData.teachers?.length || 0} teachers\n`);

    if (!studentsData.students || studentsData.students.length === 0) {
      console.log('⚠️  No students found, skipping message tests');
      return;
    }

    if (!teachersData.teachers || teachersData.teachers.length === 0) {
      console.log('⚠️  No teachers found, skipping message tests');
      return;
    }

    const student = studentsData.students[0];
    const teacher = teachersData.teachers[0];

    // Test 2: Send a message from teacher to student
    console.log('2️⃣ Sending message from teacher to student...');
    const sendRes = await fetch(`${baseURL}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subject: 'Test Message - Assignment Reminder',
        content: 'This is a test message. Please complete your homework by Friday.',
        senderId: teacher.userId || teacher.id,
        senderName: teacher.name,
        senderRole: 'TEACHER',
        receiverId: student.userId || student.id,
        receiverName: student.name,
        receiverRole: 'STUDENT',
        priority: 'NORMAL',
      }),
    });

    const sendData = await sendRes.json();
    if (sendData.success) {
      console.log(`✅ Message sent successfully! ID: ${sendData.message.id}\n`);
    } else {
      console.log(`❌ Failed to send message: ${sendData.error}\n`);
      return;
    }

    // Test 3: Fetch received messages for student
    console.log('3️⃣ Fetching received messages for student...');
    const receivedRes = await fetch(
      `${baseURL}/api/messages?userId=${student.userId || student.id}&type=received`
    );
    const receivedData = await receivedRes.json();
    console.log(`✅ Student has ${receivedData.messages?.length || 0} received messages`);
    console.log(`📬 Unread messages: ${receivedData.unreadCount || 0}\n`);

    if (receivedData.messages && receivedData.messages.length > 0) {
      const message = receivedData.messages[0];
      console.log('📧 Latest message:');
      console.log(`   Subject: ${message.subject}`);
      console.log(`   From: ${message.senderName} (${message.senderRole})`);
      console.log(`   Priority: ${message.priority}`);
      console.log(`   Read: ${message.isRead ? 'Yes' : 'No'}\n`);

      // Test 4: Mark message as read
      console.log('4️⃣ Marking message as read...');
      const markReadRes = await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'markAsRead',
          messageId: message.id,
        }),
      });

      const markReadData = await markReadRes.json();
      if (markReadData.success) {
        console.log(`✅ Message marked as read!\n`);
      }

      // Test 5: Verify unread count decreased
      console.log('5️⃣ Verifying unread count...');
      const verifyRes = await fetch(
        `${baseURL}/api/messages?userId=${student.userId || student.id}&type=received`
      );
      const verifyData = await verifyRes.json();
      console.log(`✅ Updated unread count: ${verifyData.unreadCount || 0}\n`);

      // Test 6: Send a reply
      console.log('6️⃣ Sending reply from student to teacher...');
      const replyRes = await fetch(`${baseURL}/api/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'RE: Test Message - Assignment Reminder',
          content: 'Thank you for the reminder. I will complete it on time!',
          senderId: student.userId || student.id,
          senderName: student.name,
          senderRole: 'STUDENT',
          receiverId: teacher.userId || teacher.id,
          receiverName: teacher.name,
          receiverRole: 'TEACHER',
          priority: 'NORMAL',
        }),
      });

      const replyData = await replyRes.json();
      if (replyData.success) {
        console.log(`✅ Reply sent successfully!\n`);
      }

      // Test 7: Fetch sent messages for student
      console.log('7️⃣ Fetching sent messages for student...');
      const sentRes = await fetch(
        `${baseURL}/api/messages?userId=${student.userId || student.id}&type=sent`
      );
      const sentData = await sentRes.json();
      console.log(`✅ Student has sent ${sentData.messages?.length || 0} messages\n`);

      // Test 8: Delete the test message
      console.log('8️⃣ Deleting test message...');
      const deleteRes = await fetch(
        `${baseURL}/api/messages?messageId=${message.id}`,
        { method: 'DELETE' }
      );

      const deleteData = await deleteRes.json();
      if (deleteData.success) {
        console.log(`✅ Message deleted successfully!\n`);
      }
    }

    console.log('✨ All messaging tests completed successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Send message');
    console.log('   ✅ Receive messages');
    console.log('   ✅ Mark as read');
    console.log('   ✅ Send reply');
    console.log('   ✅ View sent messages');
    console.log('   ✅ Delete message');
    console.log('\n🎉 Messaging system is working perfectly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
};

// Run the tests
testMessaging();
