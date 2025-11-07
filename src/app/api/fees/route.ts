import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch fee structures or payments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'structure'; // structure, payments, student
    const class_param = searchParams.get('class');
    const studentId = searchParams.get('studentId');
    const academicYear = searchParams.get('academicYear') || '2024-2025';

    if (type === 'structure') {
      // Fetch fee structures
      const where: any = { academicYear, isActive: true };
      if (class_param) where.class = class_param;

      const structures = await prisma.feeStructure.findMany({
        where,
        orderBy: [
          { class: 'asc' },
          { section: 'asc' },
        ],
      });

      return NextResponse.json({
        success: true,
        structures,
      });
    }

    if (type === 'student' && studentId) {
      // Fetch student's fee payments
      const payments = await prisma.feePayment.findMany({
        where: {
          studentId,
          academicYear,
        },
        include: {
          feeStructure: true,
          student: {
            select: {
              studentId: true,
              name: true,
              class: true,
              section: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
      });

      // Calculate totals
      const totalDue = payments.reduce((sum: number, p: any) => sum + p.amountDue, 0);
      const totalPaid = payments.reduce((sum: number, p: any) => sum + p.amountPaid, 0);
      const totalPending = payments.reduce((sum: number, p: any) => sum + p.amountPending, 0);
      const totalFine = payments.reduce((sum: number, p: any) => sum + p.fine, 0);

      return NextResponse.json({
        success: true,
        payments,
        summary: {
          totalDue,
          totalPaid,
          totalPending,
          totalFine,
          paymentsMade: payments.filter((p: any) => p.status === 'PAID').length,
          pendingPayments: payments.filter((p: any) => p.status === 'PENDING' || p.status === 'PARTIAL').length,
        },
      });
    }

    if (type === 'payments') {
      // Fetch all payments with filters
      const where: any = { academicYear };
      if (studentId) where.studentId = studentId;
      if (class_param) {
        where.student = { class: class_param };
      }

      const payments = await prisma.feePayment.findMany({
        where,
        include: {
          student: {
            select: {
              studentId: true,
              name: true,
              class: true,
              section: true,
            },
          },
          feeStructure: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return NextResponse.json({
        success: true,
        payments,
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error fetching fees:', error);
    return NextResponse.json(
      { error: 'Failed to fetch fees', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create fee structure or record payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'createStructure') {
      // Create fee structure
      const {
        class: class_param,
        section,
        academicYear,
        tuitionFee = 0,
        admissionFee = 0,
        examFee = 0,
        libraryFee = 0,
        sportsFee = 0,
        labFee = 0,
        busFee = 0,
        uniformFee = 0,
        otherFee = 0,
        installments = 3,
      } = body;

      const totalFee =
        tuitionFee +
        admissionFee +
        examFee +
        libraryFee +
        sportsFee +
        labFee +
        busFee +
        uniformFee +
        otherFee;

      const structure = await prisma.feeStructure.create({
        data: {
          class: class_param,
          section: section || null,
          academicYear,
          tuitionFee,
          admissionFee,
          examFee,
          libraryFee,
          sportsFee,
          labFee,
          busFee,
          uniformFee,
          otherFee,
          totalFee,
          installments,
        },
      });

      return NextResponse.json({
        success: true,
        structure,
      });
    }

    if (action === 'recordPayment') {
      // Record a fee payment
      const {
        paymentId,
        amountPaid,
        paymentMethod,
        transactionId,
        paidBy,
        remarks,
      } = body;

      // Get existing payment
      const payment = await prisma.feePayment.findUnique({
        where: { id: paymentId },
      });

      if (!payment) {
        return NextResponse.json(
          { error: 'Payment record not found' },
          { status: 404 }
        );
      }

      const newAmountPaid = payment.amountPaid + amountPaid;
      const newAmountPending = payment.amountDue - newAmountPaid;
      const status =
        newAmountPending <= 0 ? 'PAID' : newAmountPaid > 0 ? 'PARTIAL' : 'PENDING';

      const updated = await prisma.feePayment.update({
        where: { id: paymentId },
        data: {
          amountPaid: newAmountPaid,
          amountPending: newAmountPending,
          status,
          paymentMethod,
          transactionId,
          paidBy,
          paidDate: status === 'PAID' ? new Date() : payment.paidDate,
          remarks: remarks || payment.remarks,
          receiptNumber: status === 'PAID' && !payment.receiptNumber
            ? `REC${Date.now()}`
            : payment.receiptNumber,
        },
      });

      return NextResponse.json({
        success: true,
        payment: updated,
      });
    }

    if (action === 'generatePayments') {
      // Generate fee payments for all students in a class
      const { class: class_param, section, academicYear } = body;

      // Get fee structure
      const structure = await prisma.feeStructure.findFirst({
        where: {
          class: class_param,
          section: section || null,
          academicYear,
          isActive: true,
        },
      });

      if (!structure) {
        return NextResponse.json(
          { error: 'Fee structure not found for this class' },
          { status: 404 }
        );
      }

      // Get all students in this class
      const students = await prisma.student.findMany({
        where: {
          class: class_param,
          ...(section && { section }),
        },
      });

      // Generate payments for each student
      const terms = ['Term1', 'Term2', 'Term3'];
      const amountPerTerm = structure.totalFee / structure.installments;
      const payments = [];

      for (const student of students) {
        for (let i = 0; i < structure.installments; i++) {
          const term = terms[i] || `Term${i + 1}`;
          const dueDate = new Date(2024, 3 + (i * 3), 15); // Apr, Jul, Oct

          payments.push({
            studentId: student.id,
            feeStructureId: structure.id,
            academicYear,
            term,
            amountDue: amountPerTerm,
            amountPaid: 0,
            amountPending: amountPerTerm,
            status: 'PENDING' as const,
            dueDate,
          });
        }
      }

      const created = await prisma.feePayment.createMany({
        data: payments,
        skipDuplicates: true,
      });

      return NextResponse.json({
        success: true,
        created: created.count,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing fee:', error);
    return NextResponse.json(
      { error: 'Failed to process fee', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update fee structure
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { structureId, ...updateData } = body;

    if (!structureId) {
      return NextResponse.json(
        { error: 'Structure ID is required' },
        { status: 400 }
      );
    }

    // Recalculate total if fees are updated
    if (Object.keys(updateData).some(key => key.includes('Fee'))) {
      const structure = await prisma.feeStructure.findUnique({
        where: { id: structureId },
      });

      if (structure) {
        updateData.totalFee =
          (updateData.tuitionFee ?? structure.tuitionFee) +
          (updateData.admissionFee ?? structure.admissionFee) +
          (updateData.examFee ?? structure.examFee) +
          (updateData.libraryFee ?? structure.libraryFee) +
          (updateData.sportsFee ?? structure.sportsFee) +
          (updateData.labFee ?? structure.labFee) +
          (updateData.busFee ?? structure.busFee) +
          (updateData.uniformFee ?? structure.uniformFee) +
          (updateData.otherFee ?? structure.otherFee);
      }
    }

    const updated = await prisma.feeStructure.update({
      where: { id: structureId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      structure: updated,
    });
  } catch (error: any) {
    console.error('Error updating fee structure:', error);
    return NextResponse.json(
      { error: 'Failed to update fee structure', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete fee structure
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const structureId = searchParams.get('structureId');

    if (!structureId) {
      return NextResponse.json(
        { error: 'Structure ID is required' },
        { status: 400 }
      );
    }

    await prisma.feeStructure.delete({
      where: { id: structureId },
    });

    return NextResponse.json({
      success: true,
      message: 'Fee structure deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting fee structure:', error);
    return NextResponse.json(
      { error: 'Failed to delete fee structure', details: error.message },
      { status: 500 }
    );
  }
}
