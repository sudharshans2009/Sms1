const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL,
    },
  },
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const users = await prisma.user.findMany();
    console.log(`\nFound ${users.length} users:`);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role})`);
    });
    
    if (users.length === 0) {
      console.log('\n⚠️  No users found! Running seed...');
      const bcrypt = require('bcryptjs');
      
      // Create admin user
      const adminUser = await prisma.user.create({
        data: {
          email: 'admin@amrita.edu',
          password: await bcrypt.hash('admin123', 10),
          role: 'ADMIN',
        },
      });
      console.log('✅ Created admin user');
      
      // Create teacher user
      const teacherUser = await prisma.user.create({
        data: {
          email: 'teacher@amrita.edu',
          password: await bcrypt.hash('teacher123', 10),
          role: 'TEACHER',
        },
      });
      console.log('✅ Created teacher user');
      
      // Create student user
      const studentUser = await prisma.user.create({
        data: {
          email: 'student@amrita.edu',
          password: await bcrypt.hash('student123', 10),
          role: 'STUDENT',
        },
      });
      console.log('✅ Created student user');
      
      console.log('\n✅ Database seeded successfully!');
    } else {
      console.log('\n✅ Database already seeded!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();
