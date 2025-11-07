// Test script to create sample student medical and academic records
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createStudentProfileData() {
  try {
    console.log('🔄 Creating student profile data...');

    // Get students
    const students = await prisma.student.findMany({
      take: 4,
    });

    if (students.length === 0) {
      console.log('❌ No students found. Run seed first.');
      return;
    }

    console.log(`Found ${students.length} students`);

    // Create medical records for each student
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Create medical record
      await prisma.studentMedical.create({
        data: {
          studentId: student.id,
          bloodGroup: ['A+', 'B+', 'O+', 'AB+'][i % 4],
          height: 140 + (i * 5),
          weight: 35 + (i * 3),
          allergies: i === 0 ? ['Peanuts', 'Dust'] : i === 1 ? ['Milk'] : [],
          chronicIllness: i === 0 ? ['Asthma'] : [],
          disabilities: i === 2 ? 'Visual impairment - glasses required' : null,
          currentMedications: i === 0 ? ['Inhaler for asthma'] : [],
          pastSurgeries: [],
          emergencyContact: `Parent ${i + 1}`,
          emergencyPhone: `987654321${i}`,
          emergencyRelation: 'Father',
          vaccinations: ['BCG', 'Polio', 'MMR', 'DPT'],
          lastCheckup: new Date(),
          notes: i === 0 ? 'Mild asthma, requires inhaler during physical activities' : 
                 i === 1 ? 'No significant health issues' : 
                 'Requires glasses for clear vision',
        },
      });

      // Create academic records
      await prisma.studentAcademic.create({
        data: {
          studentId: student.id,
          academicYear: '2024-25',
          term: 'Term1',
          subjects: {
            'Mathematics': 85 + (i * 2),
            'Science': 78 + (i * 3),
            'English': 82 + (i * 1),
            'Social Studies': 75 + (i * 4),
            'Computer Science': 90 + (i * 1),
          },
          totalMarks: 410 + (i * 10),
          maxMarks: 500,
          percentage: 82.0 + (i * 2),
          grade: i < 2 ? 'A' : 'B+',
          rank: i + 1,
          totalDays: 100,
          presentDays: 92 + (i * 2),
          absentDays: 8 - (i * 2),
          attendancePercentage: 92.0 + (i * 2),
          studyStatus: i === 0 ? 'PROMOTED' : 'REGULAR',
          promoted: i === 0,
          teacherRemarks: `Student ${i + 1} is ${i === 0 ? 'outstanding' : i === 1 ? 'very good' : 'doing well'} in academics.`,
        },
      });

      console.log(`✅ Created profile data for student: ${student.name}`);
    }

    // Create fee payment records
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
            amountDue: feeStructure.totalAmount,
            amountPaid: i === 0 ? feeStructure.totalAmount : feeStructure.totalAmount / 2,
            amountPending: i === 0 ? 0 : feeStructure.totalAmount / 2,
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

    // Create attendance records
    const today = new Date();
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      // Create attendance for last 10 days
      for (let day = 0; day < 10; day++) {
        const attendanceDate = new Date(today);
        attendanceDate.setDate(today.getDate() - day);
        
        // Skip weekends
        if (attendanceDate.getDay() === 0 || attendanceDate.getDay() === 6) continue;
        
        await prisma.attendance.create({
          data: {
            studentId: student.id,
            date: attendanceDate,
            status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT', // 90% attendance
            remarks: Math.random() > 0.8 ? 'Late arrival' : '',
          },
        });
      }
    }
    console.log('✅ Created attendance records');

    // Create marks records
    const subjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
    for (let i = 0; i < students.length; i++) {
      const student = students[i];
      
      for (const subject of subjects) {
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
    console.log('✅ Created marks records');

    console.log('🎉 Student profile data creation completed!');

  } catch (error) {
    console.error('❌ Error creating student profile data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createStudentProfileData();