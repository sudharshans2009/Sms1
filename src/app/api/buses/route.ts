import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Simulate real-time location updates (for demo purposes)
// In production, this would come from GPS devices on buses
function simulateLocationUpdate(bus: any) {
  // Small random movements to simulate bus movement
  const latChange = (Math.random() - 0.5) * 0.002; // ~200 meters
  const lngChange = (Math.random() - 0.5) * 0.002;
  
  return {
    ...bus,
    currentLat: bus.currentLat + latChange,
    currentLng: bus.currentLng + lngChange,
    speed: bus.status === 'ACTIVE' ? Math.floor(Math.random() * 30) + 20 : 0, // 20-50 km/h if active
    lastUpdate: new Date(),
  };
}

// Helper to adapt Prisma Bus -> frontend shape expected by components
function adaptBusForClient(bus: any) {
  if (!bus) return null;

  const currentLat = bus.currentLat ?? bus.currentLocation?.lat ?? 10.9027;
  const currentLng = bus.currentLng ?? bus.currentLocation?.lng ?? 76.9015;

  return {
    // Frontend expects `id` to be the human-readable bus id (e.g., AV01)
    id: bus.busId || bus.id,
    internalId: bus.id,
    busId: bus.busId || bus.id,
    driverName: bus.driverName,
    route: bus.route,
    currentLocation: { lat: currentLat, lng: currentLng },
    speed: bus.speed ?? 0,
    // If students relation was included, return count; otherwise 0
    students: Array.isArray(bus.students) ? bus.students.length : 0,
    // Normalize status to a human friendly string
    status: (bus.status === 'ACTIVE') ? 'Active' : 'Inactive',
    lastUpdate: bus.lastUpdate,
    driver: bus.driver || null,
  };
}

// GET /api/buses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get('id');
    const realtime = searchParams.get('realtime') === 'true';

    if (busId) {
      let bus = await prisma.bus.findUnique({
        where: { busId: busId },
        include: { driver: true, students: true },
      });
      
      if (!bus) {
        return NextResponse.json(
          { success: false, error: 'Bus not found' },
          { status: 404 }
        );
      }
      
      // Simulate location update for active buses
      if (realtime && bus.status === 'ACTIVE') {
        bus = simulateLocationUpdate(bus as any) as any;
      }
      
      return NextResponse.json({ success: true, data: adaptBusForClient(bus) });
    }

    let buses = await prisma.bus.findMany({
      include: { driver: true, students: true },
      orderBy: { busId: 'asc' },
    });
    
    // Simulate location updates for all active buses
    if (realtime) {
      buses = buses.map((bus: any) => 
        bus.status === 'ACTIVE' ? simulateLocationUpdate(bus) : bus
      );
    }

    const adapted = buses.map((b: any) => adaptBusForClient(b));
    
    return NextResponse.json({ 
      success: true, 
      data: adapted,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching buses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch buses' },
      { status: 500 }
    );
  }
}

// PUT /api/buses - Update bus location and status
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, currentLat, currentLng, speed, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = { lastUpdate: new Date() };
    
    if (currentLat !== undefined && currentLng !== undefined) {
      // Validate coordinates
      if (currentLat < -90 || currentLat > 90 || currentLng < -180 || currentLng > 180) {
        return NextResponse.json(
          { success: false, error: 'Invalid coordinates' },
          { status: 400 }
        );
      }
      updateData.currentLat = currentLat;
      updateData.currentLng = currentLng;
    }
    
    if (speed !== undefined) {
      updateData.speed = Math.max(0, Math.min(120, speed)); // Cap speed 0-120 km/h
    }
    
    if (status) {
      updateData.status = ['ACTIVE', 'INACTIVE', 'MAINTENANCE'].includes(status) ? status : 'INACTIVE';
    }

    const bus = await prisma.bus.update({
      where: { busId: id },
      data: updateData,
      include: { driver: true, students: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: adaptBusForClient(bus),
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

// POST /api/buses - Add new bus
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { busId, driverName, route, driverId, currentLat, currentLng } = body;

    if (!busId || !driverName || !route) {
      return NextResponse.json(
        { success: false, error: 'Bus ID, driver name, and route are required' },
        { status: 400 }
      );
    }

    // Check if bus already exists
    const existing = await prisma.bus.findUnique({
      where: { busId },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Bus ID already exists' },
        { status: 400 }
      );
    }

    const newBus = await prisma.bus.create({
      data: {
        busId,
        driverName,
        route,
        driverId: driverId || null,
        currentLat: currentLat || 10.9027,
        currentLng: currentLng || 76.9015,
        speed: 0,
        status: 'INACTIVE',
        lastUpdate: new Date(),
      },
      include: { driver: true, students: true },
    });

    return NextResponse.json({ 
      success: true, 
      data: adaptBusForClient(newBus),
      message: 'Bus added successfully',
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding bus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add bus' },
      { status: 500 }
    );
  }
}

// DELETE /api/buses - Remove bus
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get('id');

    if (!busId) {
      return NextResponse.json(
        { success: false, error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    await prisma.bus.delete({
      where: { busId: busId },
    });
    return NextResponse.json({ 
      success: true, 
      message: 'Bus deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting bus:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete bus' },
      { status: 500 }
    );
  }
}
