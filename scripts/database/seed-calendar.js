const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedAcademicCalendar() {
  console.log('🌱 Seeding Academic Calendar data...');

  try {
    // Create Academic Year 2024-2025
    const academicYear2024 = await prisma.academicYear.upsert({
      where: { year: '2024-2025' },
      update: {},
      create: {
        year: '2024-2025',
        description: 'Academic Year 2024-2025',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        isActive: true,
      },
    });

    console.log('✅ Created Academic Year:', academicYear2024.year);

    // Create Terms
    const term1 = await prisma.academicTerm.upsert({
      where: { 
        id: 'term1-2024'
      },
      update: {},
      create: {
        id: 'term1-2024',
        name: 'First Term',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-09-30'),
        academicYearId: academicYear2024.id,
        isActive: true,
      },
    });

    const term2 = await prisma.academicTerm.upsert({
      where: { 
        id: 'term2-2024'
      },
      update: {},
      create: {
        id: 'term2-2024',
        name: 'Second Term',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-03-31'),
        academicYearId: academicYear2024.id,
        isActive: false,
      },
    });

    console.log('✅ Created Terms:', term1.name, 'and', term2.name);

    // Create Holidays
    const holidays = [
      {
        id: 'independence-day-2024',
        name: 'Independence Day',
        description: 'National Holiday - India Independence Day',
        date: new Date('2024-08-15'),
        type: 'NATIONAL',
        academicYearId: academicYear2024.id,
      },
      {
        id: 'gandhi-jayanti-2024',
        name: 'Gandhi Jayanti',
        description: 'National Holiday - Mahatma Gandhi Birthday',
        date: new Date('2024-10-02'),
        type: 'NATIONAL',
        academicYearId: academicYear2024.id,
      },
      {
        id: 'diwali-2024',
        name: 'Diwali',
        description: 'Festival of Lights',
        date: new Date('2024-11-01'),
        type: 'RELIGIOUS',
        academicYearId: academicYear2024.id,
      },
      {
        id: 'christmas-2024',
        name: 'Christmas',
        description: 'Christmas Day',
        date: new Date('2024-12-25'),
        type: 'NATIONAL',
        academicYearId: academicYear2024.id,
      },
      {
        id: 'summer-vacation-2024',
        name: 'Summer Vacation',
        description: 'Summer Vacation Period',
        date: new Date('2024-05-15'),
        type: 'SCHOOL',
        academicYearId: academicYear2024.id,
      },
    ];

    for (const holiday of holidays) {
      await prisma.holiday.upsert({
        where: { id: holiday.id },
        update: {},
        create: holiday,
      });
    }

    console.log('✅ Created', holidays.length, 'holidays');

    // Create Academic Events
    const events = [
      {
        id: 'school-reopening-2024',
        title: 'School Reopening',
        description: 'School reopens for the new academic year',
        eventType: 'GRADUATION',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2024-04-01'),
        priority: 'HIGH',
        isPublic: true,
        createdBy: 'admin',
        createdByName: 'School Admin',
        createdByRole: 'ADMIN',
        termId: term1.id,
        academicYearId: academicYear2024.id,
      },
      {
        id: 'ptm-q1-2024',
        title: 'Parent-Teacher Meeting',
        description: 'First quarter parent-teacher meeting',
        eventType: 'PARENT_TEACHER',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-16'),
        priority: 'HIGH',
        isPublic: true,
        createdBy: 'admin',
        createdByName: 'School Admin',
        createdByRole: 'ADMIN',
        termId: term1.id,
        academicYearId: academicYear2024.id,
      },
      {
        id: 'sports-day-2024',
        title: 'Annual Sports Day',
        description: 'School annual sports competition',
        eventType: 'SPORTS',
        startDate: new Date('2024-12-10'),
        endDate: new Date('2024-12-12'),
        priority: 'NORMAL',
        isPublic: true,
        createdBy: 'admin',
        createdByName: 'School Admin',
        createdByRole: 'ADMIN',
        termId: term2.id,
        academicYearId: academicYear2024.id,
      },
      {
        id: 'cultural-fest-2024',
        title: 'Cultural Festival',
        description: 'Annual cultural festival and performances',
        eventType: 'CULTURAL',
        startDate: new Date('2024-11-20'),
        endDate: new Date('2024-11-22'),
        priority: 'NORMAL',
        isPublic: true,
        createdBy: 'admin',
        createdByName: 'School Admin',
        createdByRole: 'ADMIN',
        termId: term2.id,
        academicYearId: academicYear2024.id,
      },
    ];

    for (const event of events) {
      await prisma.academicEvent.upsert({
        where: { id: event.id },
        update: {},
        create: event,
      });
    }

    console.log('✅ Created', events.length, 'academic events');

    // Create Exams
    const exams = [
      {
        id: 'term1-mid-exam-2024',
        name: 'First Term Mid Exam',
        description: 'Mid-term examinations for first term',
        examType: 'MID_TERM',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2024-07-25'),
        class: '10',
        section: 'A',
        maxMarks: 100,
        passingMarks: 35,
        duration: 180,
        termId: term1.id,
      },
      {
        id: 'term1-final-exam-2024',
        name: 'First Term Final Exam',
        description: 'Final examinations for first term',
        examType: 'FINAL_TERM',
        startDate: new Date('2024-09-15'),
        endDate: new Date('2024-09-25'),
        class: '10',
        section: 'A',
        maxMarks: 100,
        passingMarks: 35,
        duration: 180,
        termId: term1.id,
      },
      {
        id: 'term2-mid-exam-2024',
        name: 'Second Term Mid Exam',
        description: 'Mid-term examinations for second term',
        examType: 'MID_TERM',
        startDate: new Date('2024-12-15'),
        endDate: new Date('2024-12-25'),
        class: '10',
        section: 'A',
        maxMarks: 100,
        passingMarks: 35,
        duration: 180,
        termId: term2.id,
      },
    ];

    for (const exam of exams) {
      await prisma.exam.upsert({
        where: { id: exam.id },
        update: {},
        create: exam,
      });
    }

    console.log('✅ Created', exams.length, 'exams');

    console.log('🎉 Academic Calendar seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding academic calendar:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedAcademicCalendar();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = { seedAcademicCalendar };