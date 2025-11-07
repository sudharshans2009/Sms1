// Test messaging system and student profile APIs
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testAPIs() {
  try {
    console.log('🧪 Testing messaging and student profile APIs...');

    // Test 1: Get students for messaging
    const students = await prisma.student.findMany({
      take: 3,
      select: {
        id: true,
        name: true,
        studentId: true,
        class: true,
        section: true,
      }
    });
    console.log(`✅ Found ${students.length} students:`, students.map(s => s.name));

    // Test 2: Test messaging API data
    const messages = await prisma.message.findMany({
      select: {
        id: true,
        subject: true,
        senderName: true,
        receiverName: true,
        isRead: true,
        createdAt: true,
      },
      take: 5,
    });
    console.log(`✅ Found ${messages.length} messages`);

    // Test 3: Test student profile API data  
    if (students.length > 0) {
      const studentId = students[0].id;
      console.log(`\n🔍 Testing student profile for: ${students[0].name}`);
      
      // Medical records
      const medical = await prisma.studentMedical.findUnique({
        where: { studentId: studentId }
      });
      console.log(`📋 Medical record: ${medical ? 'Found' : 'Missing'}`);
      if (medical) {
        console.log(`   - Blood Group: ${medical.bloodGroup}`);
        console.log(`   - Height: ${medical.height}cm, Weight: ${medical.weight}kg`);
      }

      // Academic records
      const academic = await prisma.studentAcademic.findFirst({
        where: { studentId: studentId }
      });
      console.log(`📚 Academic record: ${academic ? 'Found' : 'Missing'}`);
      if (academic) {
        console.log(`   - Grade: ${academic.grade}, Percentage: ${academic.percentage}%`);
      }

      // Attendance records
      const attendanceCount = await prisma.attendance.count({
        where: { studentId: studentId }
      });
      console.log(`✅ Attendance records: ${attendanceCount}`);

      // Marks records
      const marksCount = await prisma.marks.count({
        where: { studentId: studentId }
      });
      console.log(`📊 Marks records: ${marksCount}`);

      // Fee payments
      const feeCount = await prisma.feePayment.count({
        where: { studentId: studentId }
      });
      console.log(`💰 Fee payment records: ${feeCount}`);
    }

    console.log('\n🎉 API data test completed!');

  } catch (error) {
    console.error('❌ Error testing APIs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAPIs();