// Check existing student profile data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkExistingData() {
  try {
    console.log('🔍 Checking existing data...');
    
    // Check existing medical records
    const medicalCount = await prisma.studentMedical.count();
    console.log(`📋 Existing medical records: ${medicalCount}`);
    
    // Check existing academic records
    const academicCount = await prisma.studentAcademic.count();
    console.log(`📚 Existing academic records: ${academicCount}`);
    
    // Check existing fee payments
    const feeCount = await prisma.feePayment.count();
    console.log(`💰 Existing fee payments: ${feeCount}`);
    
    // Check existing attendance
    const attendanceCount = await prisma.attendance.count();
    console.log(`✅ Existing attendance records: ${attendanceCount}`);
    
    // Check existing marks
    const marksCount = await prisma.marks.count();
    console.log(`📊 Existing marks records: ${marksCount}`);
    
    // List students with existing medical records
    const studentsWithMedical = await prisma.studentMedical.findMany({
      include: {
        student: { select: { name: true } }
      }
    });
    
    console.log('\n👥 Students with medical records:');
    studentsWithMedical.forEach(medical => {
      console.log(`  - ${medical.student.name} (Blood Group: ${medical.bloodGroup})`);
    });
    
  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExistingData();