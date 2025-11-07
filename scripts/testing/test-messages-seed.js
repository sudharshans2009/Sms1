// Test script to create sample messages for testing
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleMessages() {
  try {
    console.log('🔄 Creating sample messages...');

    // Get some users to send messages
    const users = await prisma.user.findMany({
      take: 4,
    });

    if (users.length < 2) {
      console.log('❌ Not enough users found. Run seed first.');
      return;
    }

    const admin = users.find(u => u.role === 'ADMIN') || users[0];
    const teacher = users.find(u => u.role === 'TEACHER') || users[1];
    const student = users.find(u => u.role === 'STUDENT') || users[2];

    console.log(`Found users: ${users.map(u => `${u.name} (${u.role})`).join(', ')}`);

    // Create sample messages
    const messages = [
      {
        subject: 'Welcome to School Management System',
        content: 'Dear students and teachers, welcome to our new digital platform. Please explore all the features available.',
        senderId: admin.id,
        senderName: admin.name,
        senderRole: admin.role,
        receiverId: teacher.id,
        receiverName: teacher.name,
        receiverRole: teacher.role,
        priority: 'IMPORTANT',
        category: 'ADMINISTRATIVE',
      },
      {
        subject: 'Homework Assignment - Mathematics',
        content: 'Please complete Chapter 5 exercises 1-10. Due date: Next Monday. Contact me if you have any questions.',
        senderId: teacher.id,
        senderName: teacher.name,
        senderRole: teacher.role,
        receiverId: student.id,
        receiverName: student.name,
        receiverRole: student.role,
        priority: 'NORMAL',
        category: 'ACADEMIC',
      },
      {
        subject: 'Parent-Teacher Meeting Scheduled',
        content: 'Dear parents, we have scheduled a parent-teacher meeting for next week. Please confirm your attendance.',
        senderId: admin.id,
        senderName: admin.name,
        senderRole: admin.role,
        receiverId: student.id,
        receiverName: student.name,
        receiverRole: student.role,
        priority: 'HIGH',
        category: 'EVENT',
      },
      {
        subject: 'Bus Route Change Notice',
        content: 'Due to road construction, Bus AV01 route will be temporarily modified. New pickup time: 7:30 AM.',
        senderId: admin.id,
        senderName: admin.name,
        senderRole: admin.role,
        receiverId: student.id,
        receiverName: student.name,
        receiverRole: student.role,
        priority: 'URGENT',
        category: 'EMERGENCY',
      },
      {
        subject: 'Library Book Return Reminder',
        content: 'This is a friendly reminder that your borrowed book "Advanced Mathematics" is due for return tomorrow.',
        senderId: admin.id,
        senderName: admin.name,
        senderRole: admin.role,
        receiverId: student.id,
        receiverName: student.name,
        receiverRole: student.role,
        priority: 'LOW',
        category: 'GENERAL',
      }
    ];

    // Create the messages
    for (const messageData of messages) {
      await prisma.message.create({
        data: messageData,
      });
    }

    console.log(`✅ Created ${messages.length} sample messages`);

    // Create a draft message
    await prisma.message.create({
      data: {
        subject: 'Draft: Upcoming School Event',
        content: 'We are planning a school sports day event...',
        senderId: admin.id,
        senderName: admin.name,
        senderRole: admin.role,
        receiverId: '',
        receiverName: '',
        receiverRole: 'STUDENT',
        priority: 'NORMAL',
        category: 'EVENT',
        isDraft: true,
      },
    });

    console.log('✅ Created 1 draft message');

    // Star some messages and mark some as read
    const allMessages = await prisma.message.findMany({
      where: { isDraft: false },
    });

    if (allMessages.length > 0) {
      // Star the first message
      await prisma.message.update({
        where: { id: allMessages[0].id },
        data: { isStarred: true },
      });

      // Mark some as read
      if (allMessages.length > 1) {
        await prisma.message.update({
          where: { id: allMessages[1].id },
          data: { 
            isRead: true,
            readAt: new Date(),
          },
        });
      }
    }

    console.log('✅ Updated message read/star status');

    const messageCount = await prisma.message.count();
    console.log(`🎉 Total messages in database: ${messageCount}`);

  } catch (error) {
    console.error('❌ Error creating sample messages:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createSampleMessages();