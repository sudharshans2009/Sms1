import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch bus issues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get('busId');
    const driverId = searchParams.get('driverId');
    const status = searchParams.get('status');
    const visibility = searchParams.get('visibility');

    const where: any = {};
    if (busId) where.busId = busId;
    if (driverId) where.reportedBy = driverId;
    if (status) where.status = status;
    if (visibility) where.visibleTo = visibility;

    const issues = await prisma.busIssue.findMany({
      where,
      include: {
        bus: {
          select: {
            busId: true,
            route: true,
            driverName: true,
          },
        },
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Group by status
    const summary = {
      total: issues.length,
      reported: issues.filter((i: any) => i.status === 'REPORTED').length,
      inProgress: issues.filter((i: any) => i.status === 'IN_PROGRESS').length,
      resolved: issues.filter((i: any) => i.status === 'RESOLVED').length,
      critical: issues.filter((i: any) => i.severity === 'CRITICAL').length,
    };

    return NextResponse.json({
      success: true,
      issues,
      summary,
    });
  } catch (error: any) {
    console.error('Error fetching bus issues:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus issues', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Report new bus issue or update status
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'report' || !action) {
      // Report new issue
      const {
        busId,
        reportedBy,
        reportedByName,
        issueType,
        severity = 'MEDIUM',
        title,
        description,
        location,
        visibleTo = 'ADMIN_ONLY',
        photos = [],
      } = body;

      if (!busId || !reportedBy || !reportedByName || !issueType || !title || !description) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const issue = await prisma.busIssue.create({
        data: {
          busId,
          reportedBy,
          reportedByName,
          issueType,
          severity,
          title,
          description,
          location,
          visibleTo,
          photos,
        },
        include: {
          bus: true,
        },
      });

      return NextResponse.json({
        success: true,
        issue,
      });
    }

    if (action === 'updateStatus') {
      // Update issue status
      const { issueId, status, resolvedBy, resolution } = body;

      if (!issueId || !status) {
        return NextResponse.json(
          { error: 'Issue ID and status are required' },
          { status: 400 }
        );
      }

      const updateData: any = { status };

      if (status === 'RESOLVED' || status === 'CLOSED') {
        updateData.resolvedAt = new Date();
        if (resolvedBy) updateData.resolvedBy = resolvedBy;
        if (resolution) updateData.resolution = resolution;
      }

      const issue = await prisma.busIssue.update({
        where: { id: issueId },
        data: updateData,
        include: {
          bus: true,
        },
      });

      return NextResponse.json({
        success: true,
        issue,
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Error processing bus issue:', error);
    return NextResponse.json(
      { error: 'Failed to process bus issue', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update bus issue
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, ...updateData } = body;

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    const issue = await prisma.busIssue.update({
      where: { id: issueId },
      data: updateData,
      include: {
        bus: true,
      },
    });

    return NextResponse.json({
      success: true,
      issue,
    });
  } catch (error: any) {
    console.error('Error updating bus issue:', error);
    return NextResponse.json(
      { error: 'Failed to update bus issue', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete bus issue
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issueId = searchParams.get('issueId');

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
        { status: 400 }
      );
    }

    await prisma.busIssue.delete({
      where: { id: issueId },
    });

    return NextResponse.json({
      success: true,
      message: 'Bus issue deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting bus issue:', error);
    return NextResponse.json(
      { error: 'Failed to delete bus issue', details: error.message },
      { status: 500 }
    );
  }
}
