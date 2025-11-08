import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Helper to adapt Prisma Bus -> frontend shape expected by components
function adaptBusForClient(bus: any) {
  if (!bus) return null;

  const currentLat = bus.currentLat ?? 10.9027;
  const currentLng = bus.currentLng ?? 76.9015;

  return {
    id: bus.busId || bus.id,
    internalId: bus.id,
    busId: bus.busId || bus.id,
    driverName: bus.driverName,
    driverPhone: bus.driver?.phone || 'N/A',
    driverLicense: bus.driver?.license || 'N/A',
    route: bus.route,
    currentLocation: { lat: currentLat, lng: currentLng },
    speed: bus.speed ?? 0,
    students: Array.isArray(bus.students) ? bus.students.length : 0,
    status: (bus.status === 'ACTIVE') ? 'Active' : 'Inactive',
    lastUpdate: bus.lastUpdate,
    driver: bus.driver || null,
    driverId: bus.driverId,
  };
}

// GET /api/buses/[id] - Get specific bus
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const bus = await prisma.bus.findUnique({
      where: { busId: id },
      include: { driver: true, students: true },
    });
    
    if (!bus) {
      return NextResponse.json(
        { success: false, error: 'Bus not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: adaptBusForClient(bus) 
    });
  } catch (error) {
    console.error('Error fetching bus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bus' },
      { status: 500 }
    );
  }
}

// PUT /api/buses/[id] - Update specific bus
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Check if bus exists
    const existing = await prisma.bus.findUnique({ where: { busId: id } });
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Bus not found' },
        { status: 404 }
      );
    }

    const updateData: any = { lastUpdate: new Date() };
    const updatableFields = [
      'driverName', 'route', 'driverId', 'currentLat', 'currentLng', 'speed', 'status'
    ];

    updatableFields.forEach((field) => {
      if (body[field] !== undefined) {
        if (field === 'currentLat' || field === 'currentLng') {
          // Validate coordinates
          const value = parseFloat(body[field]);
          if ((field === 'currentLat' && (value < -90 || value > 90)) ||
              (field === 'currentLng' && (value < -180 || value > 180))) {
            throw new Error('Invalid coordinates');
          }
          updateData[field] = value;
        } else if (field === 'speed') {
          updateData[field] = Math.max(0, Math.min(120, parseInt(body[field]) || 0));
        } else if (field === 'status') {
          updateData[field] = ['ACTIVE', 'INACTIVE'].includes(body[field]) ? body[field] : 'INACTIVE';
        } else {
          updateData[field] = body[field];
        }
      }
    });

    const updated = await prisma.bus.update({
      where: { busId: id },
      data: updateData,
      include: { driver: true, students: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: adaptBusForClient(updated),
      message: 'Bus updated successfully',
    });
  } catch (error) {
    console.error('Error updating bus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update bus' },
      { status: 500 }
    );
  }
}

// DELETE /api/buses/[id] - Delete specific bus
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if bus exists
    const bus = await prisma.bus.findUnique({
      where: { busId: id },
      include: { students: true },
    });

    if (!bus) {
      return NextResponse.json(
        { success: false, error: 'Bus not found' },
        { status: 404 }
      );
    }

    // Check if bus has assigned students
    if (bus.students && bus.students.length > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete bus. ${bus.students.length} students are assigned to this bus. Please reassign them first.` },
        { status: 400 }
      );
    }

    // Delete bus
    await prisma.bus.delete({
      where: { busId: id },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Bus deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bus' },
      { status: 500 }
    );
  }
}