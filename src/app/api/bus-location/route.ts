import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get bus location
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get('busId');

    if (!busId) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    const location = await prisma.busLocation.findUnique({
      where: { busId },
      include: {
        bus: {
          select: {
            busId: true,
            driverName: true,
            route: true,
            status: true,
          },
        },
      },
    });

    if (!location) {
      return NextResponse.json(
        { error: 'Location not found for this bus' },
        { status: 404 }
      );
    }

    // Check if location is stale (more than 5 minutes old)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const isStale = location.lastUpdated < fiveMinutesAgo;

    return NextResponse.json({
      success: true,
      location,
      isStale,
    });
  } catch (error: any) {
    console.error('Error fetching bus location:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bus location', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Update bus location or toggle sharing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, busId, latitude, longitude, speed, heading, accuracy, driverId, driverName } = body;

    if (!busId) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    if (action === 'toggleSharing') {
      // Toggle location sharing
      const existing = await prisma.busLocation.findUnique({
        where: { busId },
      });

      if (!existing) {
        return NextResponse.json(
          { error: 'Location record not found' },
          { status: 404 }
        );
      }

      const updated = await prisma.busLocation.update({
        where: { busId },
        data: {
          isSharing: !existing.isSharing,
        },
      });

      return NextResponse.json({
        success: true,
        location: updated,
        message: updated.isSharing ? 'Location sharing started' : 'Location sharing stopped',
      });
    }

    // Update location (default action)
    if (latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    const location = await prisma.busLocation.upsert({
      where: { busId },
      update: {
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || null,
        accuracy: accuracy || null,
        lastUpdated: new Date(),
        ...(driverId && { driverId }),
        ...(driverName && { driverName }),
      },
      create: {
        busId,
        latitude,
        longitude,
        speed: speed || 0,
        heading: heading || null,
        accuracy: accuracy || null,
        isSharing: true,
        driverId: driverId || 'unknown',
        driverName: driverName || 'Unknown Driver',
      },
    });

    // Also update bus table with current location
    await prisma.bus.update({
      where: { id: busId },
      data: {
        currentLat: latitude,
        currentLng: longitude,
        speed: Math.round(speed || 0),
        lastUpdate: new Date(),
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      location,
    });
  } catch (error: any) {
    console.error('Error updating bus location:', error);
    return NextResponse.json(
      { error: 'Failed to update bus location', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Stop sharing location
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busId = searchParams.get('busId');

    if (!busId) {
      return NextResponse.json(
        { error: 'Bus ID is required' },
        { status: 400 }
      );
    }

    const location = await prisma.busLocation.update({
      where: { busId },
      data: {
        isSharing: false,
      },
    });

    // Update bus status to INACTIVE
    await prisma.bus.update({
      where: { id: busId },
      data: {
        status: 'INACTIVE',
      },
    });

    return NextResponse.json({
      success: true,
      location,
      message: 'Location sharing stopped',
    });
  } catch (error: any) {
    console.error('Error stopping location sharing:', error);
    return NextResponse.json(
      { error: 'Failed to stop location sharing', details: error.message },
      { status: 500 }
    );
  }
}
