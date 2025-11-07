// Create missing student profile data (fees, attendance, marks)
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createMissingData() {
  try {
    console.log('🔄 Creating missing student profile data...');

    // Get students
    const students = await prisma.student.findMany({
      take: 4,
    });

    if (students.length === 0) {
      console.log('❌ No students found. Run seed first.');
      return;
    }

    console.log(`Found ${students.length} students`);

    // Create fee payment records (none exist)
    const feeStructures = await prisma.feeStructure.findMany();
    if (feeStructures.length > 0) {
      for (let i = 0; i < Math.min(students.length, 2); i++) {
        const student = students[i];
        const feeStructure = feeStructures[i % feeStructures.length];
        
        await prisma.feePayment.create({
          data: {
            studentId: student.id,
            feeStructureId: feeStructure.id,
            academicYear: '2024-25',
            term: 'Term1',
            amountDue: feeStructure.totalFee,
            amountPaid: i === 0 ? feeStructure.totalFee : feeStructure.totalFee / 2,
            amountPending: i === 0 ? 0 : feeStructure.totalFee / 2,
            status: i === 0 ? 'PAID' : 'PARTIAL',
            dueDate: new Date('2024-12-31'),
            paidDate: i === 0 ? new Date() : null,
            paymentMethod: i === 0 ? 'UPI' : 'CASH',
            receiptNumber: `RCP${1000 + i}`,
            remarks: i === 0 ? 'Full payment completed' : 'Partial payment received',
          },
        });
      }
      console.log('✅ Created fee payment records');
    }

    // Create more attendance records (only 2 exist)
    const today = new Date();
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Create attendance for last 10 days
      for (let day = 0; day < 10; day++) {
        const attendanceDate = new Date(today);
        attendanceDate.setDate(today.getDate() - day);
        
        // Skip weekends
        if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;
        
        // Check if attendance already exists for this date
        const existing = await prisma.attendance.findFirst({
          where: {
            studentId: student.id,
            date: attendanceDate,
          }
        });
        
        if (!existing) {
          await prisma.attendance.create({
            data: {
              studentId: student.id,
              date: attendanceDate,
              status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT', // 90% attendance
              class: student.class,
              section: student.section,
            },
          });
        }
      }
    }
    console.log('✅ Created attendance records');

    // Create marks records (only 1 exists)
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      for (const subject of subjects) {
        // Check if marks already exist
        const existing = await prisma.marks.findFirst({
          where: {
            studentId: student.id,
            subject: subject,
            examType: 'UNIT_TEST',
          }
        });
        
        if (!existing) {
          await prisma.marks.create({
            data: {
              studentId: student.id,
              subject: subject,
              examType: 'UNIT_TEST',
              totalMarks: 100,
              marksObtained: 70 + Math.floor(Math.random() * 25), // 70-95 marks
              grade: 'A',
              examDate: new Date(),
            },
          });
        }
      }
    }
    console.log('✅ Created marks records');

    console.log('🎉 Missing data creation completed!');

  } catch (error) {
    console.error('❌ Error creating missing data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMissingData();