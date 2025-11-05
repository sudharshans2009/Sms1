'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import axios from 'axios';

interface BusTrackingModuleProps {
  userRole: string;
  buses?: any[];
}

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);
const Circle = dynamic(
  () => import('react-leaflet').then((mod) => mod.Circle),
  { ssr: false }
);

export default function BusTrackingModule({ userRole, buses: initialBuses }: BusTrackingModuleProps) {
  const [buses, setBuses] = useState<any[]>(initialBuses || []);
  const [selectedBus, setSelectedBus] = useState<any>(null);
  const [loading, setLoading] = useState(!initialBuses);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!initialBuses) {
      loadBuses();
    } else if (buses.length > 0 && !selectedBus) {
      setSelectedBus(buses[0]);
    }
  }, [initialBuses]);

  useEffect(() => {
    if (buses.length > 0 && !selectedBus) {
      setSelectedBus(buses[0]);
    }
  }, [buses]);

  // Auto-refresh bus locations every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadBuses();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const loadBuses = async () => {
    try {
      const response = await axios.get('/api/buses');
      if (response.data.success) {
        setBuses(response.data.data);
        if (response.data.data.length > 0 && !selectedBus) {
          setSelectedBus(response.data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error loading buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocation = async () => {
    await loadBuses();
  };

  // Custom bus icon using Leaflet
  const createBusIcon = () => {
    if (typeof window === 'undefined') return null;
    const L = require('leaflet');
    
    return L.divIcon({
      html: `
        <div style="position: relative;">
          <div style="
            background: #FF6B35;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 6px rgba(0,0,0,0.3);
            border: 3px solid white;
            font-size: 20px;
          ">🚌</div>
          <div style="
            position: absolute;
            top: -5px;
            left: -5px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: rgba(255, 107, 53, 0.3);
            animation: pulse 2s infinite;
          "></div>
        </div>
      `,
      className: 'custom-bus-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading bus locations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Leaflet CSS */}
      {isClient && (
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
      )}
      
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🚌 Live Bus Tracking System
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Real-time location tracking with OpenStreetMap
          </p>
        </div>
        <button onClick={refreshLocation} className="btn-primary bg-amrita-orange hover:bg-orange-600">
          🔄 Refresh Locations
        </button>
      </div>

      {/* Bus Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {buses.map((bus) => (
          <div
            key={bus.id}
            onClick={() => setSelectedBus(bus)}
            className={`card cursor-pointer transition-all ${
              selectedBus?.id === bus.id
                ? 'ring-2 ring-amrita-orange border-amrita-orange bg-orange-50 dark:bg-orange-900/20'
                : 'hover:shadow-lg'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">🚌</div>
              <div>
                <h3 className="font-bold text-lg">{bus.id}</h3>
                <p className={`text-xs ${
                  bus.status === 'Active' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  ● {bus.status}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{bus.route}</p>
            <div className="mt-2 flex justify-between text-xs">
              <span>👥 {bus.students} students</span>
              <span className="font-semibold text-amrita-blue">⚡ {bus.speed} km/h</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Tracking View */}
      {selectedBus && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map View */}
          <div className="lg:col-span-2">
            <div className="card h-[550px]">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📍</span>
                Live Location - {selectedBus.id}
                <span className="ml-auto text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                  ● Live
                </span>
              </h3>
              <div className="rounded-lg h-[460px] overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                {isClient ? (
                  <MapContainer
                    center={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]}
                    zoom={14}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                  >
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Pulsing circle around bus */}
                    <Circle
                      center={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]}
                      radius={200}
                      pathOptions={{
                        fillColor: '#FF6B35',
                        fillOpacity: 0.15,
                        color: '#FF6B35',
                        weight: 2,
                      }}
                    />
                    
                    {/* Bus marker */}
                    <Marker
                      position={[selectedBus.currentLocation.lat, selectedBus.currentLocation.lng]}
                      icon={createBusIcon()}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-bold text-lg text-amrita-orange">{selectedBus.id}</h4>
                          <p className="text-sm mt-1">👨‍✈️ {selectedBus.driverName}</p>
                          <p className="text-sm">🗺️ {selectedBus.route}</p>
                          <p className="text-sm">👥 {selectedBus.students} students</p>
                          <p className="text-sm">⚡ {selectedBus.speed} km/h</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {selectedBus.currentLocation.lat.toFixed(6)}, {selectedBus.currentLocation.lng.toFixed(6)}
                          </p>
                        </div>
                      </Popup>
                    </Marker>

                    {/* Show all other buses on the map */}
                    {buses.filter(bus => bus.id !== selectedBus.id).map(bus => (
                      <Marker
                        key={bus.id}
                        position={[bus.currentLocation.lat, bus.currentLocation.lng]}
                        icon={createBusIcon()}
                        opacity={0.6}
                      >
                        <Popup>
                          <div className="p-2">
                            <h4 className="font-bold">{bus.id}</h4>
                            <p className="text-sm">{bus.route}</p>
                            <button
                              onClick={() => setSelectedBus(bus)}
                              className="text-xs bg-amrita-orange text-white px-2 py-1 rounded mt-2"
                            >
                              View Details
                            </button>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amrita-orange mx-auto"></div>
                      <p className="mt-4 text-gray-600 dark:text-gray-400">Loading map...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Map Legend */}
              <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amrita-orange rounded-full"></div>
                  <span>Selected Bus</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-amrita-orange rounded-full opacity-60"></div>
                  <span>Other Buses</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-green-600">●</span>
                  <span>Active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bus Details Panel */}
          <div className="card">
            <h3 className="text-xl font-bold mb-4 text-amrita-orange flex items-center gap-2">
              <span>🚌</span>
              Bus Details
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-amrita-orange to-amrita-blue text-white rounded-lg shadow-lg">
                <p className="text-2xl font-bold">{selectedBus.id}</p>
                <p className="text-sm opacity-90 mt-1">{selectedBus.route}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span>👨‍✈️</span> Driver
                  </span>
                  <span className="font-bold">{selectedBus.driverName}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span>📍</span> Status
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    selectedBus.status === 'Active' 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                      : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                  }`}>
                    ● {selectedBus.status}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span>👥</span> Students
                  </span>
                  <span className="font-bold text-amrita-blue text-lg">{selectedBus.students}</span>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <span>⚡</span> Speed
                  </span>
                  <span className="font-bold text-lg">{selectedBus.speed} km/h</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <span>🗺️</span> Route
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedBus.route}</span>
                </div>

                <div className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <span className="text-sm font-medium block mb-2 flex items-center gap-2">
                    <span>📍</span> GPS Coordinates
                  </span>
                  <div className="space-y-1">
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      Lat: {selectedBus.currentLocation.lat.toFixed(6)}
                    </p>
                    <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                      Lng: {selectedBus.currentLocation.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <span>🔄</span>
                    <span>Location updates every 30 seconds</span>
                  </p>
                </div>
              </div>

              {userRole === 'admin' && (
                <div className="space-y-2 pt-2">
                  <button className="w-full btn-primary bg-amrita-orange hover:bg-orange-600 flex items-center justify-center gap-2">
                    <span>💬</span>
                    Send Message to Driver
                  </button>
                  <button className="w-full btn-secondary flex items-center justify-center gap-2">
                    <span>📞</span>
                    Call Driver
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* All Buses Summary */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Fleet Overview</h3>
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded-full text-xs font-semibold">
              {buses.filter(b => b.status === 'Active').length} Active
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 rounded-full text-xs font-semibold">
              {buses.filter(b => b.status === 'Inactive').length} Inactive
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-amrita-orange to-amrita-blue text-white">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Bus ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Driver</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Route</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Students</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Speed</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {buses.map((bus) => (
                <tr 
                  key={bus.id} 
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                    selectedBus?.id === bus.id ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                  }`}
                  onClick={() => setSelectedBus(bus)}
                >
                  <td className="px-4 py-3 font-bold text-amrita-orange">{bus.id}</td>
                  <td className="px-4 py-3">{bus.driverName}</td>
                  <td className="px-4 py-3 text-sm">{bus.route}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded-full text-xs font-semibold">
                      {bus.students}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{bus.speed} km/h</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      bus.status === 'Active' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                    }`}>
                      ● {bus.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBus(bus);
                      }}
                      className="text-xs bg-amrita-orange text-white px-3 py-1 rounded hover:bg-orange-600 transition-colors"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.1;
            transform: scale(1.5);
          }
        }
        .custom-bus-icon {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
