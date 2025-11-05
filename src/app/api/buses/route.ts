import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/database';

// Simulate real-time location updates (for demo purposes)
// In production, this would come from GPS devices on buses
function simulateLocationUpdate(bus: any) {
  // Small random movements to simulate bus movement
  const latChange = (Math.random() - 0.5) * 0.002; // ~200 meters
  const lngChange = (Math.random() - 0.5) * 0.002;
  
  return {
    ...bus,
    currentLocation: {
      lat: bus.currentLocation.lat + latChange,
      lng: bus.currentLocation.lng + lngChange,
    },
    speed: bus.status === 'Active' ? Math.floor(Math.random() * 30) + 20 : 0, // 20-50 km/h if active
    lastUpdate: new Date().toISOString(),
  };
}

// GET /api/buses
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const busId = searchParams.get('id');
    const realtime = searchParams.get('realtime') === 'true';

    const db = getDatabase();

    if (busId) {
      let bus = db.getBus(busId);
      if (!bus) {
        return NextResponse.json(
          { success: false, error: 'Bus not found' },
          { status: 404 }
        );
      }
      
      // Simulate location update for active buses
      if (realtime && bus.status === 'Active') {
        bus = simulateLocationUpdate(bus);
      }
      
      return NextResponse.json({ success: true, data: bus });
    }

    let buses = db.getAllBuses();
    
    // Simulate location updates for all active buses
    if (realtime) {
      buses = buses.map((bus: any) => 
        bus.status === 'Active' ? simulateLocationUpdate(bus) : bus
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: buses,
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
    const { id, currentLocation, speed, status } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const updateData: any = { lastUpdate: new Date().toISOString() };
    
    if (currentLocation) {
      // Validate coordinates
      if (typeof currentLocation.lat !== 'number' || 
          typeof currentLocation.lng !== 'number' ||
          currentLocation.lat < -90 || currentLocation.lat > 90 ||
          currentLocation.lng < -180 || currentLocation.lng > 180) {
        return NextResponse.json(
          { success: false, error: 'Invalid coordinates' },
          { status: 400 }
        );
      }
      updateData.currentLocation = currentLocation;
    }
    
    if (speed !== undefined) {
      updateData.speed = Math.max(0, Math.min(120, speed)); // Cap speed 0-120 km/h
    }
    
    if (status) {
      updateData.status = ['Active', 'Inactive'].includes(status) ? status : 'Inactive';
    }

    const bus = db.updateBus(id, updateData);

    if (!bus) {
      return NextResponse.json(
        { success: false, error: 'Bus not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      data: bus,
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
    const { id, driverName, route, students, currentLocation } = body;

    if (!id || !driverName || !route) {
      return NextResponse.json(
        { success: false, error: 'Bus ID, driver name, and route are required' },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    const newBus = {
      id,
      driverName,
      route,
      students: students || 0,
      currentLocation: currentLocation || { lat: 10.7905, lng: 78.7047 }, // Default to Tiruchirappalli
      speed: 0,
      status: 'Inactive',
      lastUpdate: new Date().toISOString(),
    };

    const bus = db.addBus(newBus);

    return NextResponse.json({ 
      success: true, 
      data: bus,
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

    const db = getDatabase();
    const success = db.deleteBus(busId);

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Bus not found' },
        { status: 404 }
      );
    }

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
