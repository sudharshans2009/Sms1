const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
  console.log('Checking database...');
  
  const students = await prisma.student.findMany();
  const teachers = await prisma.teacher.findMany();
  const users = await prisma.user.findMany();
  
  console.log('Users:', users.length);
  console.log('Students:', students.length);
  console.log('Teachers:', teachers.length);
  
  if (students.length > 0) {
    console.log('\nFirst student:', students[0]);
  }
  
  if (teachers.length > 0) {
    console.log('\nFirst teacher:', teachers[0]);
  }
  
  await prisma.$disconnect();
}

test().catch(console.error);
