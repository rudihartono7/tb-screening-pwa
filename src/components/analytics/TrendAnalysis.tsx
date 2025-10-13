'use client';

import { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  BarChart3, 
  LineChart, 
  PieChart,
  Download,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendData {
  date: string;
  newCases: number;
  totalScreenings: number;
  positiveCases: number;
  negativeCases: number;
  pendingCases: number;
  positivityRate: number;
  province: string;
  city: string;
}

interface TrendAnalysisProps {
  data: TrendData[];
}

export function TrendAnalysis({ data }: TrendAnalysisProps) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [selectedMetric, setSelectedMetric] = useState<'cases' | 'screenings' | 'positivity'>('cases');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Filter data based on time range
  const getFilteredData = () => {
    const now = new Date();
    const daysBack = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];

    const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
    
    return data
      .filter(item => new Date(item.date) >= cutoffDate)
      .filter(item => selectedLocation === 'all' || item.province === selectedLocation)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const filteredData = getFilteredData();

  // Calculate statistics
  const calculateStats = () => {
    if (filteredData.length === 0) return null;

    const totalNewCases = filteredData.reduce((sum, item) => sum + item.newCases, 0);
    const totalScreenings = filteredData.reduce((sum, item) => sum + item.totalScreenings, 0);
    const totalPositive = filteredData.reduce((sum, item) => sum + item.positiveCases, 0);
    const avgPositivityRate = filteredData.reduce((sum, item) => sum + item.positivityRate, 0) / filteredData.length;

    // Calculate trends (comparing first half vs second half of period)
    const midPoint = Math.floor(filteredData.length / 2);
    const firstHalf = filteredData.slice(0, midPoint);
    const secondHalf = filteredData.slice(midPoint);

    const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.newCases, 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.newCases, 0) / secondHalf.length;
    const caseTrend = ((secondHalfAvg - firstHalfAvg) / firstHalfAvg) * 100;

    const firstHalfPositivity = firstHalf.reduce((sum, item) => sum + item.positivityRate, 0) / firstHalf.length;
    const secondHalfPositivity = secondHalf.reduce((sum, item) => sum + item.positivityRate, 0) / secondHalf.length;
    const positivityTrend = ((secondHalfPositivity - firstHalfPositivity) / firstHalfPositivity) * 100;

    return {
      totalNewCases,
      totalScreenings,
      totalPositive,
      avgPositivityRate,
      caseTrend,
      positivityTrend,
      dailyAverage: totalNewCases / filteredData.length
    };
  };

  const stats = calculateStats();

  // Get unique locations for filter
  const locations = Array.from(new Set(data.map(item => item.province))).sort();

  // Simple chart data preparation
  const getChartData = () => {
    return filteredData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: selectedMetric === 'cases' ? item.newCases : 
             selectedMetric === 'screenings' ? item.totalScreenings : 
             item.positivityRate
    }));
  };

  const chartData = getChartData();
  const maxValue = Math.max(...chartData.map(item => item.value));

  const formatTrend = (trend: number) => {
    const isPositive = trend > 0;
    const color = isPositive ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    const Icon = isPositive ? TrendingUp : TrendingDown;
    
    return (
      <div className={cn('flex items-center gap-1', color)}>
        <Icon className="h-4 w-4" />
        <span className="font-medium">{Math.abs(trend).toFixed(1)}%</span>
      </div>
    );
  };

  const getMetricLabel = () => {
    switch (selectedMetric) {
      case 'cases': return 'New Cases';
      case 'screenings': return 'Total Screenings';
      case 'positivity': return 'Positivity Rate (%)';
      default: return 'New Cases';
    }
  };

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No data available for the selected time range.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          TB Trend Analysis
        </h3>
        <div className="flex items-center gap-2">
          <Download className="h-5 w-5 text-gray-500" />
          <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
            Export Data
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex gap-2">
          {(['7d', '30d', '90d', '1y'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={cn(
                'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              )}
            >
              {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : range === '90d' ? '90 Days' : '1 Year'}
            </button>
          ))}
        </div>

        <select
          value={selectedMetric}
          onChange={(e) => setSelectedMetric(e.target.value as any)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="cases">New Cases</option>
          <option value="screenings">Total Screenings</option>
          <option value="positivity">Positivity Rate</option>
        </select>

        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Provinces</option>
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 dark:text-blue-400">Total New Cases</p>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.totalNewCases}</p>
              <div className="mt-1">
                {formatTrend(stats.caseTrend)}
              </div>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Total Screenings</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.totalScreenings}</p>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                {(stats.totalScreenings / filteredData.length).toFixed(0)}/day avg
              </p>
            </div>
            <LineChart className="h-8 w-8 text-green-500" />
          </div>
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Positivity Rate</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.avgPositivityRate.toFixed(1)}%
              </p>
              <div className="mt-1">
                {formatTrend(stats.positivityTrend)}
              </div>
            </div>
            <PieChart className="h-8 w-8 text-yellow-500" />
          </div>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 dark:text-purple-400">Daily Average</p>
              <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                {stats.dailyAverage.toFixed(1)}
              </p>
              <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                cases per day
              </p>
            </div>
            <Calendar className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Simple Chart */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {getMetricLabel()} Trend
          </h4>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Last {timeRange === '7d' ? '7 days' : timeRange === '30d' ? '30 days' : timeRange === '90d' ? '90 days' : 'year'}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <div className="flex items-end justify-between h-40 gap-1">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div
                  className="bg-blue-500 dark:bg-blue-400 rounded-t w-full min-h-[4px] transition-all duration-300 hover:bg-blue-600 dark:hover:bg-blue-300"
                  style={{
                    height: `${(item.value / maxValue) * 120 + 4}px`
                  }}
                  title={`${item.date}: ${item.value}${selectedMetric === 'positivity' ? '%' : ''}`}
                />
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-2 transform -rotate-45 origin-left">
                  {item.date}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Key Insights
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Peak day:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {chartData.reduce((max, item) => item.value > max.value ? item : max, chartData[0])?.date || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Lowest day:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {chartData.reduce((min, item) => item.value < min.value ? item : min, chartData[0])?.date || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">Trend direction:</span>
              <span className="font-medium">
                {stats.caseTrend > 5 ? (
                  <span className="text-red-600 dark:text-red-400">Increasing</span>
                ) : stats.caseTrend < -5 ? (
                  <span className="text-green-600 dark:text-green-400">Decreasing</span>
                ) : (
                  <span className="text-yellow-600 dark:text-yellow-400">Stable</span>
                )}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Recommendations
          </h4>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            {stats.caseTrend > 10 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>Cases increasing rapidly. Consider enhanced screening protocols.</span>
              </div>
            )}
            {stats.positivityTrend > 5 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>Positivity rate rising. Focus on high-risk areas.</span>
              </div>
            )}
            {stats.avgPositivityRate > 15 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>High positivity rate detected. Immediate intervention needed.</span>
              </div>
            )}
            {stats.caseTrend < -5 && (
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                <span>Positive trend. Continue current prevention strategies.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}