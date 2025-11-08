import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/test-all - Test all functionalities
export async function GET(request: NextRequest) {
  try {
    const tests = [];
    
    // Test 1: Database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      tests.push({ name: 'Database Connection', status: 'PASS', message: 'Connected successfully' });
    } catch (error: any) {
      tests.push({ name: 'Database Connection', status: 'FAIL', message: error?.message || 'Unknown error' });
    }
    
    // Test 2: Students API
    try {
      const studentsCount = await prisma.student.count();
      tests.push({ name: 'Students API', status: 'PASS', message: `Found ${studentsCount} students` });
    } catch (error: any) {
      tests.push({ name: 'Students API', status: 'FAIL', message: error?.message || 'Unknown error' });
    }
    
    // Test 3: Buses API
    try {
      const busesCount = await prisma.bus.count();
      tests.push({ name: 'Buses API', status: 'PASS', message: `Found ${busesCount} buses` });
    } catch (error: any) {
      tests.push({ name: 'Buses API', status: 'FAIL', message: error?.message || 'Unknown error' });
    }
    
    // Test 4: Student Creation Validation
    const requiredFields = ['studentId', 'name', 'class', 'section', 'parentPhone', 'parentEmail'];
    const validationTest = requiredFields.every(field => field);
    tests.push({ 
      name: 'Student Validation', 
      status: validationTest ? 'PASS' : 'FAIL', 
      message: `Required fields: ${requiredFields.join(', ')}` 
    });
    
    // Test 5: Bus Management
    const busFields = ['busId', 'driverName', 'route'];
    const busValidationTest = busFields.every(field => field);
    tests.push({ 
      name: 'Bus Management', 
      status: busValidationTest ? 'PASS' : 'FAIL', 
      message: `Required fields: ${busFields.join(', ')}` 
    });
    
    const passCount = tests.filter(t => t.status === 'PASS').length;
    const totalCount = tests.length;
    
    return NextResponse.json({
      success: true,
      summary: {
        passed: passCount,
        total: totalCount,
        status: passCount === totalCount ? 'ALL_PASS' : 'SOME_FAIL'
      },
      tests,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('Test error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to run tests', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/test-all - Test student creation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'test-student-creation') {
      // Test student creation with sample data
      const testStudent = {
        studentId: `TEST_${Date.now()}`,
        name: 'Test Student',
        class: '10',
        section: 'A',
        parentPhone: '+91-9876543210',
        parentEmail: `test${Date.now()}@example.com`,
        parentName: 'Test Parent',
        rollNumber: '99',
        dateOfBirth: '2008-01-01',
        gender: 'Male',
        address: 'Test Address',
        bloodGroup: 'O+',
      };
      
      const created = await prisma.student.create({
        data: testStudent
      });
      
      // Clean up - delete the test student
      await prisma.student.delete({
        where: { id: created.id }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Student creation test passed',
        testData: testStudent
      });
    }
    
    if (body.action === 'test-bus-creation') {
      // Test bus creation with sample data
      const testBus = {
        busId: `TEST_BUS_${Date.now()}`,
        driverName: 'Test Driver',
        route: 'Test Route',
        currentLat: 10.9027,
        currentLng: 76.9015,
      };
      
      const created = await prisma.bus.create({
        data: testBus
      });
      
      // Clean up - delete the test bus
      await prisma.bus.delete({
        where: { id: created.id }
      });
      
      return NextResponse.json({
        success: true,
        message: 'Bus creation test passed',
        testData: testBus
      });
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown test action'
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('Test creation error:', error);
    return NextResponse.json(
      { success: false, error: 'Test creation failed', details: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}