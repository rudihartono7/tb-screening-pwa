'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map components to avoid SSR issues
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

interface GeospatialData {
  id: string;
  familyName: string;
  latitude: number;
  longitude: number;
  patientCount: number;
  positiveCount: number;
  negativeCount: number;
}

export function GeospatialMap() {
  const [isClient, setIsClient] = useState(false);
  const [L, setL] = useState<any>(null);

  // Mock data - replace with real API data
  const mockData: GeospatialData[] = [
    {
      id: '1',
      familyName: 'Family A',
      latitude: -6.2088,
      longitude: 106.8456,
      patientCount: 4,
      positiveCount: 1,
      negativeCount: 3,
    },
    {
      id: '2',
      familyName: 'Family B',
      latitude: -6.1944,
      longitude: 106.8229,
      patientCount: 3,
      positiveCount: 0,
      negativeCount: 3,
    },
    {
      id: '3',
      familyName: 'Family C',
      latitude: -6.2297,
      longitude: 106.8467,
      patientCount: 5,
      positiveCount: 2,
      negativeCount: 3,
    },
  ];

  useEffect(() => {
    setIsClient(true);
    // Dynamically import Leaflet
    import('leaflet').then((leaflet) => {
      setL(leaflet.default);
      // ensure default marker icons and CSS are available
      try {
        // Try to import leaflet css (so markers show correctly)
        import('leaflet/dist/leaflet.css');
      } catch (err) {
        // ignore - some build setups include CSS elsewhere
      }

      // Fix for default markers
      delete (leaflet.default.Icon.Default.prototype as any)._getIconUrl;
      leaflet.default.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  // Force map resize after component mounts
  useEffect(() => {
    if (isClient) {
      const timer = setTimeout(() => {
        // Trigger a window resize event to help Leaflet recalculate
        window.dispatchEvent(new Event('resize'));
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isClient]);

  const createCustomIcon = (positiveCount: number) => {
    if (!L) return null;
    
    const color = positiveCount > 0 ? '#ef4444' : '#10b981';
    const iconHtml = `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      ">
        ${positiveCount}
      </div>
    `;

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  // Wait until we're on the client and Leaflet is loaded before rendering the map
  if (!isClient || !L) {
    return (
      <div className="h-80 bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-gray-500">Loading map...</div>
      </div>
    );
  }

  return (
    <div className="h-80 rounded-lg overflow-hidden">
      <MapContainer
        center={[-6.2088, 106.8456]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        {mockData.map((location) => {
          const icon = createCustomIcon(location.positiveCount);
          return (
            <Marker
              key={location.id}
              position={[location.latitude, location.longitude]}
              icon={icon || undefined}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-semibold text-gray-900">{location.familyName}</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Total Patients:</span>
                      <span className="font-medium">{location.patientCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Positive:</span>
                      <span className="font-medium text-red-600">{location.positiveCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Negative:</span>
                      <span className="font-medium text-green-600">{location.negativeCount}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}