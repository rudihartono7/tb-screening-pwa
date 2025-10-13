'use client';

import { useState } from 'react';
import { 
  Thermometer, 
  MapPin, 
  Filter, 
  Eye, 
  EyeOff,
  Info,
  Download,
  Maximize2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeatmapData {
  id: string;
  province: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  positiveCases: number;
  totalFamilies: number;
  population: number;
  lastUpdated: string;
}

interface RiskHeatmapProps {
  data: HeatmapData[];
}

export function RiskHeatmap({ data }: RiskHeatmapProps) {
  const [selectedRiskLevels, setSelectedRiskLevels] = useState<Set<string>>(
    new Set(['low', 'medium', 'high', 'critical'])
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Filter data based on selections
  const filteredData = data.filter(item => {
    const matchesRisk = selectedRiskLevels.has(item.riskLevel);
    const matchesProvince = selectedProvince === 'all' || item.province === selectedProvince;
    return matchesRisk && matchesProvince;
  });

  // Get unique provinces
  const provinces = Array.from(new Set(data.map(item => item.province))).sort();

  // Group data by province for grid view
  const groupedData = filteredData.reduce((acc, item) => {
    if (!acc[item.province]) {
      acc[item.province] = {};
    }
    if (!acc[item.province][item.city]) {
      acc[item.province][item.city] = [];
    }
    acc[item.province][item.city].push(item);
    return acc;
  }, {} as { [province: string]: { [city: string]: HeatmapData[] } });

  const toggleRiskLevel = (level: string) => {
    const newSelected = new Set(selectedRiskLevels);
    if (newSelected.has(level)) {
      newSelected.delete(level);
    } else {
      newSelected.add(level);
    }
    setSelectedRiskLevels(newSelected);
  };

  const getRiskColor = (riskLevel: string, riskScore: number) => {
    const baseColors = {
      low: 'bg-green-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      critical: 'bg-red-500'
    };

    const intensityColors = {
      low: [
        'bg-green-200 dark:bg-green-800',
        'bg-green-300 dark:bg-green-700',
        'bg-green-400 dark:bg-green-600',
        'bg-green-500 dark:bg-green-500'
      ],
      medium: [
        'bg-yellow-200 dark:bg-yellow-800',
        'bg-yellow-300 dark:bg-yellow-700',
        'bg-yellow-400 dark:bg-yellow-600',
        'bg-yellow-500 dark:bg-yellow-500'
      ],
      high: [
        'bg-orange-200 dark:bg-orange-800',
        'bg-orange-300 dark:bg-orange-700',
        'bg-orange-400 dark:bg-orange-600',
        'bg-orange-500 dark:bg-orange-500'
      ],
      critical: [
        'bg-red-200 dark:bg-red-800',
        'bg-red-300 dark:bg-red-700',
        'bg-red-400 dark:bg-red-600',
        'bg-red-500 dark:bg-red-500'
      ]
    };

    // Determine intensity based on risk score within the level
    let intensity = 0;
    if (riskLevel === 'low') intensity = Math.floor((riskScore / 25) * 3);
    else if (riskLevel === 'medium') intensity = Math.floor(((riskScore - 25) / 25) * 3);
    else if (riskLevel === 'high') intensity = Math.floor(((riskScore - 50) / 25) * 3);
    else if (riskLevel === 'critical') intensity = Math.floor(((riskScore - 75) / 25) * 3);

    intensity = Math.min(3, Math.max(0, intensity));
    
    return intensityColors[riskLevel as keyof typeof intensityColors][intensity];
  };

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    };
    
    return (
      <span className={cn(
        'px-2 py-1 rounded-full text-xs font-medium capitalize',
        colors[riskLevel as keyof typeof colors] || colors.medium
      )}>
        {riskLevel}
      </span>
    );
  };

  const getPositivityRate = (positive: number, total: number) => {
    return total > 0 ? ((positive / total) * 100).toFixed(1) : '0.0';
  };

  // Calculate statistics
  const stats = {
    total: filteredData.length,
    critical: filteredData.filter(item => item.riskLevel === 'critical').length,
    high: filteredData.filter(item => item.riskLevel === 'high').length,
    medium: filteredData.filter(item => item.riskLevel === 'medium').length,
    low: filteredData.filter(item => item.riskLevel === 'low').length,
    avgRiskScore: filteredData.reduce((sum, item) => sum + item.riskScore, 0) / filteredData.length || 0,
    totalCases: filteredData.reduce((sum, item) => sum + item.positiveCases, 0),
    totalFamilies: filteredData.reduce((sum, item) => sum + item.totalFamilies, 0)
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Thermometer className="h-6 w-6 text-red-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            TB Risk Heatmap
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Download className="h-4 w-4" />
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-gray-900 dark:text-white">{stats.total}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Areas</div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-red-600 dark:text-red-400">{stats.critical}</div>
          <div className="text-xs text-red-600 dark:text-red-400">Critical</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.high}</div>
          <div className="text-xs text-orange-600 dark:text-orange-400">High</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.medium}</div>
          <div className="text-xs text-yellow-600 dark:text-yellow-400">Medium</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg text-center">
          <div className="text-lg font-bold text-green-600 dark:text-green-400">{stats.low}</div>
          <div className="text-xs text-green-600 dark:text-green-400">Low</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Risk Level Filters */}
        <div className="flex flex-wrap gap-2">
          {(['low', 'medium', 'high', 'critical'] as const).map((level) => (
            <button
              key={level}
              onClick={() => toggleRiskLevel(level)}
              className={cn(
                'flex items-center gap-2 px-3 py-1 rounded-lg text-sm font-medium transition-colors capitalize',
                selectedRiskLevels.has(level)
                  ? level === 'low' ? 'bg-green-600 text-white' :
                    level === 'medium' ? 'bg-yellow-600 text-white' :
                    level === 'high' ? 'bg-orange-600 text-white' :
                    'bg-red-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {selectedRiskLevels.has(level) ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
              {level}
            </button>
          ))}
        </div>

        {/* Province Filter */}
        <select
          value={selectedProvince}
          onChange={(e) => setSelectedProvince(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Provinces</option>
          {provinces.map(province => (
            <option key={province} value={province}>{province}</option>
          ))}
        </select>

        {/* View Mode Toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              viewMode === 'grid'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'px-3 py-1 rounded text-sm font-medium transition-colors',
              viewMode === 'list'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            List
          </button>
        </div>
      </div>

      {/* Heatmap Visualization */}
      {viewMode === 'grid' ? (
        <div className="space-y-6">
          {Object.entries(groupedData).map(([province, cities]) => (
            <div key={province} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {province}
              </h4>
              
              {Object.entries(cities).map(([city, districts]) => (
                <div key={city} className="mb-4 last:mb-0">
                  <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {city}
                  </h5>
                  <div className="grid grid-cols-4 md:grid-cols-8 lg:grid-cols-12 gap-2">
                    {districts.map((district) => (
                      <div
                        key={district.id}
                        className={cn(
                          'aspect-square rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg',
                          getRiskColor(district.riskLevel, district.riskScore),
                          hoveredItem === district.id && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800'
                        )}
                        onMouseEnter={() => setHoveredItem(district.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                        title={`${district.district}: ${district.riskScore}/100 risk score, ${district.positiveCases} cases`}
                      >
                        <div className="w-full h-full flex items-center justify-center p-1">
                          <div className="text-center">
                            <div className="text-xs font-bold text-gray-900 dark:text-white">
                              {district.riskScore}
                            </div>
                            <div className="text-[10px] text-gray-700 dark:text-gray-200 leading-tight">
                              {district.district.substring(0, 6)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredData
            .sort((a, b) => b.riskScore - a.riskScore)
            .map((item) => (
              <div
                key={item.id}
                className={cn(
                  'p-4 rounded-lg border-l-4 transition-colors',
                  item.riskLevel === 'critical' && 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
                  item.riskLevel === 'high' && 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
                  item.riskLevel === 'medium' && 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                  item.riskLevel === 'low' && 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {item.district}
                      </h4>
                      {getRiskBadge(item.riskLevel)}
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Risk Score: {item.riskScore}/100
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      <span>{item.city}, {item.province}</span>
                      <span className="mx-2">•</span>
                      <span>{item.positiveCases} cases of {item.totalFamilies} families</span>
                      <span className="mx-2">•</span>
                      <span>{getPositivityRate(item.positiveCases, item.totalFamilies)}% positivity</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {item.riskScore}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        Risk Score
                      </div>
                    </div>
                    <div
                      className={cn(
                        'w-4 h-16 rounded-full',
                        getRiskColor(item.riskLevel, item.riskScore)
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {filteredData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No areas match the current filters.
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
              Risk Score Legend
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Low (0-25)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Medium (26-50)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">High (51-75)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-700 dark:text-gray-300">Critical (76-100)</span>
              </div>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
              Risk scores are calculated based on positivity rate, population density, and recent case trends.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}