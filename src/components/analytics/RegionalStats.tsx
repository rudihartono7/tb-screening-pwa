'use client';

import { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  MapPin, 
  Users, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface RegionalStatsProps {
  data: RegionalData[];
}

interface GroupedData {
  [province: string]: {
    [city: string]: RegionalData[];
  };
}

export function RegionalStats({ data }: RegionalStatsProps) {
  const [expandedProvinces, setExpandedProvinces] = useState<Set<string>>(new Set());
  const [expandedCities, setExpandedCities] = useState<Set<string>>(new Set());

  // Group data by province and city
  const groupedData: GroupedData = data.reduce((acc, item) => {
    if (!acc[item.province]) {
      acc[item.province] = {};
    }
    if (!acc[item.province][item.city]) {
      acc[item.province][item.city] = [];
    }
    acc[item.province][item.city].push(item);
    return acc;
  }, {} as GroupedData);

  const toggleProvince = (province: string) => {
    const newExpanded = new Set(expandedProvinces);
    if (newExpanded.has(province)) {
      newExpanded.delete(province);
    } else {
      newExpanded.add(province);
    }
    setExpandedProvinces(newExpanded);
  };

  const toggleCity = (cityKey: string) => {
    const newExpanded = new Set(expandedCities);
    if (newExpanded.has(cityKey)) {
      newExpanded.delete(cityKey);
    } else {
      newExpanded.add(cityKey);
    }
    setExpandedCities(newExpanded);
  };

  const getProvinceStats = (provinceData: { [city: string]: RegionalData[] }) => {
    const allDistricts = Object.values(provinceData).flat();
    return {
      totalFamilies: allDistricts.reduce((sum, d) => sum + d.totalFamilies, 0),
      positiveCases: allDistricts.reduce((sum, d) => sum + d.positiveCases, 0),
      negativeCases: allDistricts.reduce((sum, d) => sum + d.negativeCases, 0),
      pendingCases: allDistricts.reduce((sum, d) => sum + d.pendingCases, 0),
      population: allDistricts.reduce((sum, d) => sum + d.population, 0),
      districts: allDistricts.length
    };
  };

  const getCityStats = (cityData: RegionalData[]) => {
    return {
      totalFamilies: cityData.reduce((sum, d) => sum + d.totalFamilies, 0),
      positiveCases: cityData.reduce((sum, d) => sum + d.positiveCases, 0),
      negativeCases: cityData.reduce((sum, d) => sum + d.negativeCases, 0),
      pendingCases: cityData.reduce((sum, d) => sum + d.pendingCases, 0),
      population: cityData.reduce((sum, d) => sum + d.population, 0),
      districts: cityData.length
    };
  };

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

  const getTrendIcon = (rate: number) => {
    if (rate > 10) return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (rate > 5) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-green-500" />;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Regional Statistics Breakdown
        </h3>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {Object.keys(groupedData).length} provinces, {' '}
          {Object.values(groupedData).reduce((sum, cities) => sum + Object.keys(cities).length, 0)} cities, {' '}
          {data.length} districts
        </div>
      </div>

      <div className="space-y-4">
        {Object.entries(groupedData).map(([province, cities]) => {
          const provinceStats = getProvinceStats(cities);
          const isProvinceExpanded = expandedProvinces.has(province);
          const positivityRate = parseFloat(getPositivityRate(provinceStats.positiveCases, provinceStats.totalFamilies));

          return (
            <div key={province} className="border border-gray-200 dark:border-gray-600 rounded-lg">
              {/* Province Header */}
              <button
                onClick={() => toggleProvince(province)}
                className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {isProvinceExpanded ? (
                      <ChevronDown className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {province}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {provinceStats.districts} districts, {provinceStats.population.toLocaleString()} population
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {provinceStats.positiveCases} positive
                        </span>
                        {getTrendIcon(positivityRate)}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {getPositivityRate(provinceStats.positiveCases, provinceStats.totalFamilies)}% rate
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {provinceStats.totalFamilies} families
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {provinceStats.pendingCases} pending
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {/* Cities */}
              {isProvinceExpanded && (
                <div className="border-t border-gray-200 dark:border-gray-600">
                  {Object.entries(cities).map(([city, districts]) => {
                    const cityStats = getCityStats(districts);
                    const cityKey = `${province}-${city}`;
                    const isCityExpanded = expandedCities.has(cityKey);
                    const cityPositivityRate = parseFloat(getPositivityRate(cityStats.positiveCases, cityStats.totalFamilies));

                    return (
                      <div key={cityKey} className="border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                        {/* City Header */}
                        <button
                          onClick={() => toggleCity(cityKey)}
                          className="w-full p-4 pl-12 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isCityExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                              )}
                              <div>
                                <h5 className="font-medium text-gray-900 dark:text-white">
                                  {city}
                                </h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {cityStats.districts} districts
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                                    {cityStats.positiveCases} positive
                                  </span>
                                  {getTrendIcon(cityPositivityRate)}
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {getPositivityRate(cityStats.positiveCases, cityStats.totalFamilies)}% rate
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {cityStats.totalFamilies} families
                                </div>
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                  {cityStats.pendingCases} pending
                                </div>
                              </div>
                            </div>
                          </div>
                        </button>

                        {/* Districts */}
                        {isCityExpanded && (
                          <div className="bg-gray-50 dark:bg-gray-700">
                            {districts.map((district, index) => {
                              const districtPositivityRate = parseFloat(getPositivityRate(district.positiveCases, district.totalFamilies));
                              
                              return (
                                <div key={index} className="p-4 pl-20 border-b border-gray-200 dark:border-gray-600 last:border-b-0">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Users className="h-4 w-4 text-gray-500" />
                                      <div>
                                        <h6 className="font-medium text-gray-900 dark:text-white">
                                          {district.district}
                                        </h6>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                          Population: {district.population.toLocaleString()}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                      {getRiskBadge(district.riskLevel)}
                                      <div className="text-right">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                            {district.positiveCases}
                                          </span>
                                          <span className="text-sm text-gray-500">/</span>
                                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                            {district.negativeCases}
                                          </span>
                                          <span className="text-sm text-gray-500">/</span>
                                          <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                                            {district.pendingCases}
                                          </span>
                                          {getTrendIcon(districtPositivityRate)}
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          {getPositivityRate(district.positiveCases, district.totalFamilies)}% positivity
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                          {district.totalFamilies} families
                                        </div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                          Total screened
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
              Risk Assessment Legend
            </h4>
            <div className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <p><strong>Low Risk:</strong> &lt;5% positivity rate</p>
              <p><strong>Medium Risk:</strong> 5-10% positivity rate</p>
              <p><strong>High Risk:</strong> 10-15% positivity rate</p>
              <p><strong>Critical Risk:</strong> &gt;15% positivity rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}