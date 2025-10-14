'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { LatLngExpression } from 'leaflet';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import('react-leaflet').then((mod) => mod.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import('react-leaflet').then((mod) => mod.Popup),
  { ssr: false }
);

interface RegionalData {
  province: string;
  city: string;
  district: string;
  totalFamilies: number;
  positiveCases: number;
  negativeCases: number;
  pendingCases: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  latitude: number;
  longitude: number;
  population: number;
}

interface TBSpreadMapProps {
  data: RegionalData[];
}

const getRiskColor = (riskLevel: string) => {
  switch (riskLevel) {
    case 'low': return '#10b981';
    case 'medium': return '#f59e0b';
    case 'high': return '#ef4444';
    case 'critical': return '#dc2626';
    default: return '#6b7280';
  }
};

const getRiskRadius = (positiveCases: number, totalFamilies: number) => {
  const rate = positiveCases / totalFamilies;
  return Math.max(8, Math.min(30, rate * 200 + 10));
};

export function TBSpreadMap({ data }: TBSpreadMapProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
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

  if (!isClient) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            TB Spread Geospatial Map
          </h3>
        </div>
        <div className="h-96 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
          <div className="text-gray-500 dark:text-gray-400">Loading map...</div>
        </div>
      </div>
    );
  }
  const center: LatLngExpression = [-6.2088, 106.8456]; // Jakarta center

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          TB Cases Geographic Distribution
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Low Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Medium Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-gray-600 dark:text-gray-400">High Risk</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-700"></div>
            <span className="text-gray-600 dark:text-gray-400">Critical</span>
          </div>
        </div>
      </div>
      
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={center}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {data.map((region, index) => (
            <CircleMarker
              key={index}
              center={[region.latitude, region.longitude]}
              radius={getRiskRadius(region.positiveCases, region.totalFamilies)}
              fillColor={getRiskColor(region.riskLevel)}
              color={getRiskColor(region.riskLevel)}
              weight={2}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="p-2 min-w-64">
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {region.district}, {region.city}
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Province:</span>
                      <span className="font-medium">{region.province}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Families:</span>
                      <span className="font-medium">{region.totalFamilies}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Positive Cases:</span>
                      <span className="font-medium text-red-600">{region.positiveCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Negative Cases:</span>
                      <span className="font-medium text-green-600">{region.negativeCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Pending Cases:</span>
                      <span className="font-medium text-yellow-600">{region.pendingCases}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Risk Level:</span>
                      <span className={`font-medium capitalize ${
                        region.riskLevel === 'low' ? 'text-green-600' :
                        region.riskLevel === 'medium' ? 'text-yellow-600' :
                        region.riskLevel === 'high' ? 'text-red-600' :
                        'text-red-700'
                      }`}>
                        {region.riskLevel}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Population:</span>
                      <span className="font-medium">{region.population.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t">
                      <span className="text-gray-600">Positivity Rate:</span>
                      <span className="font-medium">
                        {((region.positiveCases / region.totalFamilies) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
      
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Circle size represents the concentration of TB cases relative to family count.
          Click on circles for detailed information about each region.
        </p>
      </div>
    </div>
  );
}