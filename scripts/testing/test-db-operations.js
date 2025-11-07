// Create test announcements and check database functionality
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAnnouncementsAndMessages() {
  try {
    console.log('🧪 Testing announcements and messages database operations...\n');

    // Test 1: Create test announcements
    console.log('1️⃣ Creating test announcements...');
    const announcement1 = await prisma.announcement.create({
      data: {
        title: 'Database Test Announcement 1',
        content: 'This is a test announcement created directly via Prisma',
        priority: 'NORMAL',
        target: 'ALL',
      },
    });
    console.log(`✅ Created announcement 1: ${announcement1.id}`);

    const announcement2 = await prisma.announcement.create({
      data: {
        title: 'Database Test Announcement 2',
        content: 'This is another test announcement for deletion testing',
        priority: 'IMPORTANT', 
        target: 'STUDENTS',
      },
    });
    console.log(`✅ Created announcement 2: ${announcement2.id}`);

    // Test 2: List all announcements
    console.log('\n2️⃣ Listing all announcements...');
    const allAnnouncements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' },
    });
    console.log(`📋 Found ${allAnnouncements.length} announcements:`);
    allAnnouncements.forEach((ann, index) => {
      console.log(`   ${index + 1}. ${ann.title} (${ann.priority}) - ${ann.id}`);
    });

    // Test 3: Delete one announcement
    console.log('\n3️⃣ Testing announcement deletion...');
    try {
      await prisma.announcement.delete({
        where: { id: announcement2.id },
      });
      console.log(`✅ Successfully deleted announcement: ${announcement2.id}`);
    } catch (deleteError) {
      console.log(`❌ Failed to delete announcement: ${deleteError.message}`);
    }

    // Test 4: Test message creation
    console.log('\n4️⃣ Testing message creation...');
    
    // Get a student for testing
    const students = await prisma.student.findMany({ take: 2 });
    
    if (students.length >= 2) {
      console.log(`👥 Found ${students.length} students for message testing`);
      
      const testMessage = await prisma.message.create({
        data: {
          subject: 'Database Test Message',
          content: 'This is a test message created directly via Prisma',
          senderId: students[0].id,
          senderName: students[0].name,
          senderRole: 'STUDENT',
          receiverId: students[1].id,
          receiverName: students[1].name,
          receiverRole: 'STUDENT',
          priority: 'NORMAL',
          category: 'GENERAL',
          isDraft: false,
        },
      });
      console.log(`✅ Created message: ${testMessage.id}`);
      
      // Test draft message
      const draftMessage = await prisma.message.create({
        data: {
          subject: 'Draft Test Message',
          content: 'This is a draft message for testing',
          senderId: students[0].id,
          senderName: students[0].name,
          senderRole: 'STUDENT',
          receiverId: '',
          receiverName: '',
          receiverRole: 'STUDENT',
          priority: 'NORMAL',
          category: 'GENERAL',
          isDraft: true,
        },
      });
      console.log(`✅ Created draft message: ${draftMessage.id}`);
      
    } else {
      console.log('⚠️ Not enough students for message testing');
    }

    // Test 5: Count messages
    console.log('\n5️⃣ Counting messages...');
    const messageCount = await prisma.message.count();
    const draftCount = await prisma.message.count({ where: { isDraft: true } });
    const sentCount = await prisma.message.count({ where: { isDraft: false } });
    
    console.log(`📨 Total messages: ${messageCount}`);
    console.log(`📝 Draft messages: ${draftCount}`);
    console.log(`📤 Sent messages: ${sentCount}`);

    console.log('\n🎉 Database testing completed successfully!');

  } catch (error) {
    console.error('❌ Database testing error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAnnouncementsAndMessages();