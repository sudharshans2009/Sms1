const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn', 'info'],
});

async function testDatabaseConnection() {
  console.log('🔍 Testing database connection...');
  console.log('Database URL:', process.env.DATABASE_URL);
  
  try {
    // Test basic connection
    console.log('\n1. Testing Prisma connection...');
    await prisma.$connect();
    console.log('✅ Prisma client connected successfully');
    
    // Test a simple query
    console.log('\n2. Testing simple query...');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in database`);
    
    // Test Academic Calendar data
    console.log('\n3. Testing Academic Calendar data...');
    const academicYears = await prisma.academicYear.count();
    console.log(`✅ Found ${academicYears} academic years`);
    
    const events = await prisma.academicEvent.count();
    console.log(`✅ Found ${events} academic events`);
    
    // Test other core tables
    console.log('\n4. Testing core tables...');
    const students = await prisma.student.count();
    const teachers = await prisma.teacher.count();
    const buses = await prisma.bus.count();
    
    console.log(`✅ Students: ${students}`);
    console.log(`✅ Teachers: ${teachers}`);
    console.log(`✅ Buses: ${buses}`);
    
    // Test a complex query
    console.log('\n5. Testing complex query...');
    const recentEvents = await prisma.academicEvent.findMany({
      take: 3,
      include: {
        academicYear: true,
        term: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${recentEvents.length} recent events with relations`);
    
    console.log('\n🎉 All database tests passed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Database test failed:', error);
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      meta: error.meta
    });
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

async function repairDatabase() {
  console.log('\n🔧 Attempting database repair...');
  
  try {
    // Generate Prisma client
    console.log('1. Regenerating Prisma client...');
    const { exec } = require('child_process');
    const util = require('util');
    const execAsync = util.promisify(exec);
    
    await execAsync('npx prisma generate');
    console.log('✅ Prisma client regenerated');
    
    // Push schema to ensure database is up to date
    console.log('2. Pushing schema to database...');
    await execAsync('npx prisma db push --force-reset');
    console.log('✅ Database schema updated');
    
    // Seed the database
    console.log('3. Seeding database with sample data...');
    await execAsync('npx prisma db seed');
    console.log('✅ Database seeded successfully');
    
    // Seed Academic Calendar data
    console.log('4. Seeding Academic Calendar data...');
    await execAsync('node scripts/database/seed-calendar.js');
    console.log('✅ Academic Calendar data seeded');
    
    return true;
  } catch (error) {
    console.error('❌ Database repair failed:', error);
    return false;
  }
}

async function main() {
  console.log('🏥 Database Diagnostic and Repair Tool');
  console.log('=====================================');
  
  const testResult = await testDatabaseConnection();
  
  if (!testResult) {
    console.log('\n🔧 Database issues detected. Attempting repair...');
    const repairResult = await repairDatabase();
    
    if (repairResult) {
      console.log('\n🔄 Re-testing database connection...');
      await testDatabaseConnection();
    }
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testDatabaseConnection, repairDatabase };