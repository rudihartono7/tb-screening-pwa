'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Users, 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Filter,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeographicData {
  province: string;
  city: string;
  district: string;
  totalFamilies: number;
  positiveCases: number;
  negativeCases: number;
  pendingCases: number;
  population: number;
  area: number; // in km²
  density: number; // cases per 1000 people
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
}

interface GeographicBreakdownProps {
  data: GeographicData[];
}

interface AggregatedData {
  [key: string]: {
    totalFamilies: number;
    positiveCases: number;
    negativeCases: number;
    pendingCases: number;
    population: number;
    area: number;
    districts: number;
    density: number;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    children?: AggregatedData;
  };
}

export function GeographicBreakdown({ data }: GeographicBreakdownProps) {
  const [viewLevel, setViewLevel] = useState<'province' | 'city' | 'district'>('province');
  const [sortBy, setSortBy] = useState<'name' | 'cases' | 'density' | 'population'>('cases');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Aggregate data by level
  const aggregateData = (): AggregatedData => {
    const result: AggregatedData = {};

    data.forEach(item => {
      // Province level
      if (!result[item.province]) {
        result[item.province] = {
          totalFamilies: 0,
          positiveCases: 0,
          negativeCases: 0,
          pendingCases: 0,
          population: 0,
          area: 0,
          districts: 0,
          density: 0,
          riskLevel: 'low',
          children: {}
        };
      }

      const province = result[item.province];
      province.totalFamilies += item.totalFamilies;
      province.positiveCases += item.positiveCases;
      province.negativeCases += item.negativeCases;
      province.pendingCases += item.pendingCases;
      province.population += item.population;
      province.area += item.area;
      province.districts += 1;

      // City level
      if (!province.children![item.city]) {
        province.children![item.city] = {
          totalFamilies: 0,
          positiveCases: 0,
          negativeCases: 0,
          pendingCases: 0,
          population: 0,
          area: 0,
          districts: 0,
          density: 0,
          riskLevel: 'low',
          children: {}
        };
      }

      const city = province.children![item.city];
      city.totalFamilies += item.totalFamilies;
      city.positiveCases += item.positiveCases;
      city.negativeCases += item.negativeCases;
      city.pendingCases += item.pendingCases;
      city.population += item.population;
      city.area += item.area;
      city.districts += 1;

      // District level
      city.children![item.district] = {
        totalFamilies: item.totalFamilies,
        positiveCases: item.positiveCases,
        negativeCases: item.negativeCases,
        pendingCases: item.pendingCases,
        population: item.population,
        area: item.area,
        districts: 1,
        density: item.density,
        riskLevel: item.riskLevel
      };
    });

    // Calculate densities and risk levels for aggregated data
    Object.values(result).forEach(province => {
      province.density = province.population > 0 ? (province.positiveCases / province.population) * 1000 : 0;
      province.riskLevel = getRiskLevel(province.positiveCases, province.totalFamilies);

      Object.values(province.children!).forEach(city => {
        city.density = city.population > 0 ? (city.positiveCases / city.population) * 1000 : 0;
        city.riskLevel = getRiskLevel(city.positiveCases, city.totalFamilies);
      });
    });

    return result;
  };

  const getRiskLevel = (positive: number, total: number): 'low' | 'medium' | 'high' | 'critical' => {
    const rate = total > 0 ? (positive / total) * 100 : 0;
    if (rate > 15) return 'critical';
    if (rate > 10) return 'high';
    if (rate > 5) return 'medium';
    return 'low';
  };

  const aggregatedData = aggregateData();

  // Get data for current view level
  const getCurrentLevelData = () => {
    switch (viewLevel) {
      case 'province':
        return Object.entries(aggregatedData).map(([name, data]) => ({ name, ...data }));
      case 'city':
        return Object.entries(aggregatedData).flatMap(([provinceName, province]) =>
          Object.entries(province.children!).map(([cityName, city]) => ({
            name: `${cityName}, ${provinceName}`,
            ...city
          }))
        );
      case 'district':
        return data.map(item => ({
          name: `${item.district}, ${item.city}, ${item.province}`,
          totalFamilies: item.totalFamilies,
          positiveCases: item.positiveCases,
          negativeCases: item.negativeCases,
          pendingCases: item.pendingCases,
          population: item.population,
          area: item.area,
          districts: 1,
          density: item.density,
          riskLevel: item.riskLevel
        }));
      default:
        return [];
    }
  };

  // Sort data
  const sortData = (data: any[]) => {
    return [...data].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortBy) {
        case 'name':
          aVal = a.name;
          bVal = b.name;
          break;
        case 'cases':
          aVal = a.positiveCases;
          bVal = b.positiveCases;
          break;
        case 'density':
          aVal = a.density;
          bVal = b.density;
          break;
        case 'population':
          aVal = a.population;
          bVal = b.population;
          break;
        default:
          aVal = a.positiveCases;
          bVal = b.positiveCases;
      }

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
    });
  };

  const currentData = sortData(getCurrentLevelData());

  const getRiskBadge = (riskLevel: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      critical: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100'
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

  const toggleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getSortIcon = (field: typeof sortBy) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />;
  };

  // Calculate summary statistics
  const totalStats = {
    totalFamilies: currentData.reduce((sum, item) => sum + item.totalFamilies, 0),
    positiveCases: currentData.reduce((sum, item) => sum + item.positiveCases, 0),
    population: currentData.reduce((sum, item) => sum + item.population, 0),
    avgDensity: currentData.reduce((sum, item) => sum + item.density, 0) / currentData.length,
    highRiskAreas: currentData.filter(item => item.riskLevel === 'high' || item.riskLevel === 'critical').length
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Geographic Breakdown
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {currentData.length} {viewLevel}(s) • {totalStats.highRiskAreas} high-risk areas
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total Families</p>
              <p className="text-xl font-bold text-blue-700 dark:text-blue-300">
                {totalStats.totalFamilies.toLocaleString()}
              </p>
            </div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
        </div>

        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Positive Cases</p>
              <p className="text-xl font-bold text-red-700 dark:text-red-300">
                {totalStats.positiveCases.toLocaleString()}
              </p>
            </div>
            <AlertTriangle className="h-6 w-6 text-red-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Population</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                {totalStats.population.toLocaleString()}
              </p>
            </div>
            <MapPin className="h-6 w-6 text-green-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Avg Density</p>
              <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                {totalStats.avgDensity.toFixed(1)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400">per 1K people</p>
            </div>
            <BarChart3 className="h-6 w-6 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(['province', 'city', 'district'] as const).map((level) => (
            <button
              key={level}
              onClick={() => setViewLevel(level)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                viewLevel === level
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {level}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-600">
              <th className="text-left py-3 px-4">
                <button
                  onClick={() => toggleSort('name')}
                  className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
                >
                  Location
                  {getSortIcon('name')}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => toggleSort('cases')}
                  className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
                >
                  Positive Cases
                  {getSortIcon('cases')}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => toggleSort('population')}
                  className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
                >
                  Population
                  {getSortIcon('population')}
                </button>
              </th>
              <th className="text-right py-3 px-4">
                <button
                  onClick={() => toggleSort('density')}
                  className="flex items-center gap-2 font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 ml-auto"
                >
                  Density
                  {getSortIcon('density')}
                </button>
              </th>
              <th className="text-center py-3 px-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  Positivity Rate
                </span>
              </th>
              <th className="text-center py-3 px-4">
                <span className="font-medium text-gray-900 dark:text-white">
                  Risk Level
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </div>
                      {viewLevel !== 'district' && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {item.districts} district{item.districts !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-medium text-red-600 dark:text-red-400">
                    {item.positiveCases.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    of {item.totalFamilies.toLocaleString()} families
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.population.toLocaleString()}
                  </div>
                </td>
                <td className="py-3 px-4 text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {item.density.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    per 1K people
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {getPositivityRate(item.positiveCases, item.totalFamilies)}%
                  </div>
                </td>
                <td className="py-3 px-4 text-center">
                  {getRiskBadge(item.riskLevel)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {currentData.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available for the selected view.
        </div>
      )}

      {/* Footer Summary */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600 dark:text-gray-400">
            Showing {currentData.length} {viewLevel}(s) • 
            Overall positivity rate: {getPositivityRate(totalStats.positiveCases, totalStats.totalFamilies)}%
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-600 dark:text-green-400">
                {currentData.filter(item => item.riskLevel === 'low').length} Low Risk
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-600 dark:text-red-400">
                {totalStats.highRiskAreas} High Risk
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}