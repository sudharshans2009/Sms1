// Test file to verify Prisma types are correctly generated
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function test() {
  // Test FeeStructure
  const fee = await prisma.feeStructure.findMany();
  
  // Test FeePayment
  const payment = await prisma.feePayment.findMany();
  
  // Test BusIssue
  const issue = await prisma.busIssue.findMany();
  
  // Test BusLocation
  const location = await prisma.busLocation.findMany();
  
  // Test Message with new fields
  const message = await prisma.message.findFirst({
    where: {
      isDraft: false,
      isStarred: true,
      isArchived: false,
      category: 'GENERAL'
    }
  });
  
  console.log('All Prisma types work correctly!');
}

test();
