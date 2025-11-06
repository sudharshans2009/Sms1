const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL
    }
  }
});

async function updatePasswords() {
  console.log('🔐 Updating passwords with bcrypt hashes...');

  try {
    // Hash passwords
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const hashedTeacherPassword = await bcrypt.hash('teacher123', 10);
    const hashedStudentPassword = await bcrypt.hash('student123', 10);
    const hashedDriverPassword = await bcrypt.hash('driver123', 10);

    // Update admin
    await prisma.user.update({
      where: { email: 'admin@amrita.edu' },
      data: { password: hashedAdminPassword }
    });
    console.log('✅ Admin password updated');

    // Update teacher
    await prisma.user.update({
      where: { email: 'teacher@amrita.edu' },
      data: { password: hashedTeacherPassword }
    });
    console.log('✅ Teacher password updated');

    // Update student
    await prisma.user.update({
      where: { email: 'student@amrita.edu' },
      data: { password: hashedStudentPassword }
    });
    console.log('✅ Student password updated');

    // Update driver
    await prisma.user.update({
      where: { email: 'driver@amrita.edu' },
      data: { password: hashedDriverPassword }
    });
    console.log('✅ Driver password updated');

    console.log('\n🎉 All passwords updated successfully!');
    console.log('\n🔑 Login credentials:');
    console.log('   Admin: admin@amrita.edu / admin123');
    console.log('   Teacher: teacher@amrita.edu / teacher123');
    console.log('   Student: student@amrita.edu / student123');
    console.log('   Driver: driver@amrita.edu / driver123');
  } catch (error) {
    console.error('❌ Error updating passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updatePasswords();
