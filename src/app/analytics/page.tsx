'use client';

import { useState, useEffect } from 'react';
import { 
  MapPin, 
  TrendingUp, 
  AlertTriangle, 
  Users, 
  Activity,
  Filter,
  Download,
  Calendar,
  BarChart3,
  Globe,
  Home
} from 'lucide-react';
import { Sidebar } from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { TBSpreadMap, RegionalStats, FamilyRiskIndicators, TrendAnalysis, GeographicBreakdown, RiskHeatmap } from '@/components/analytics';
import { cn } from '@/lib/utils';

interface AnalyticsData {
  totalCases: number;
  positiveCases: number;
  familiesAtRisk: number;
  highRiskAreas: number;
  regionalData: RegionalData[];
  trendData: TrendData[];
  familyRiskData: FamilyRiskData[];
}

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

interface TrendData {
  date: string;
  positive: number;
  negative: number;
  pending: number;
  newFamilies: number;
}

interface FamilyRiskData {
  familyId: string;
  familyName: string;
  address: string;
  memberCount: number;
  positiveCases: number;
  riskScore: number;
  lastScreening: string;
  district: string;
  city: string;
  province: string;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [viewMode, setViewMode] = useState<'overview' | 'regional' | 'families' | 'trends'>('overview');

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedTimeRange, selectedRegion]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      const mockData: AnalyticsData = {
        totalCases: 1247,
        positiveCases: 89,
        familiesAtRisk: 156,
        highRiskAreas: 12,
        regionalData: [
          {
            province: 'Jakarta',
            city: 'Jakarta Pusat',
            district: 'Menteng',
            totalFamilies: 245,
            positiveCases: 12,
            negativeCases: 198,
            pendingCases: 35,
            riskLevel: 'medium',
            latitude: -6.2088,
            longitude: 106.8456,
            population: 45000
          },
          {
            province: 'Jakarta',
            city: 'Jakarta Selatan',
            district: 'Kebayoran Baru',
            totalFamilies: 189,
            positiveCases: 8,
            negativeCases: 156,
            pendingCases: 25,
            riskLevel: 'low',
            latitude: -6.2297,
            longitude: 106.7997,
            population: 38000
          },
          {
            province: 'Jakarta',
            city: 'Jakarta Timur',
            district: 'Cakung',
            totalFamilies: 312,
            positiveCases: 28,
            negativeCases: 234,
            pendingCases: 50,
            riskLevel: 'high',
            latitude: -6.1744,
            longitude: 106.9497,
            population: 62000
          },
          {
            province: 'Jawa Barat',
            city: 'Bandung',
            district: 'Bandung Wetan',
            totalFamilies: 278,
            positiveCases: 22,
            negativeCases: 201,
            pendingCases: 55,
            riskLevel: 'high',
            latitude: -6.9175,
            longitude: 107.6191,
            population: 55000
          },
          {
            province: 'Jawa Tengah',
            city: 'Semarang',
            district: 'Semarang Tengah',
            totalFamilies: 223,
            positiveCases: 19,
            negativeCases: 178,
            pendingCases: 26,
            riskLevel: 'medium',
            latitude: -6.9667,
            longitude: 110.4167,
            population: 48000
          }
        ],
        trendData: [
          { date: '2024-01-01', positive: 5, negative: 45, pending: 8, newFamilies: 12 },
          { date: '2024-01-08', positive: 8, negative: 52, pending: 12, newFamilies: 15 },
          { date: '2024-01-15', positive: 12, negative: 48, pending: 9, newFamilies: 18 },
          { date: '2024-01-22', positive: 15, negative: 55, pending: 14, newFamilies: 22 },
          { date: '2024-01-29', positive: 18, negative: 62, pending: 11, newFamilies: 19 },
          { date: '2024-02-05', positive: 22, negative: 58, pending: 16, newFamilies: 25 }
        ],
        familyRiskData: [
          {
            familyId: '1',
            familyName: 'Keluarga Sari',
            address: 'Jl. Menteng Raya No. 45, Jakarta Pusat',
            memberCount: 6,
            positiveCases: 2,
            riskScore: 85,
            lastScreening: '2024-01-15',
            district: 'Menteng',
            city: 'Jakarta Pusat',
            province: 'Jakarta'
          },
          {
            familyId: '2',
            familyName: 'Keluarga Budi',
            address: 'Jl. Cakung Timur No. 123, Jakarta Timur',
            memberCount: 8,
            positiveCases: 3,
            riskScore: 92,
            lastScreening: '2024-01-10',
            district: 'Cakung',
            city: 'Jakarta Timur',
            province: 'Jakarta'
          },
          {
            familyId: '3',
            familyName: 'Keluarga Indah',
            address: 'Jl. Bandung Wetan No. 67, Bandung',
            memberCount: 5,
            positiveCases: 2,
            riskScore: 78,
            lastScreening: '2024-01-20',
            district: 'Bandung Wetan',
            city: 'Bandung',
            province: 'Jawa Barat'
          }
        ]
      };
      
      setAnalyticsData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    // Implementation for data export
    console.log('Exporting analytics data...');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 ml-64 flex items-center justify-center">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Failed to Load Analytics Data
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please try refreshing the page or contact support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 ml-0 sm:ml-64">
        <div className="p-4 sm:p-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                  TB Spread Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
                  Comprehensive analysis of tuberculosis spread patterns and risk indicators
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={exportData}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <Download className="h-4 w-4" />
                  <span className="sm:inline">Export Data</span>
                </Button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-6">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedTimeRange}
                  onChange={(e) => setSelectedTimeRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                  <option value="1y">Last year</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-gray-500" />
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                >
                  <option value="all">All Regions</option>
                  <option value="jakarta">Jakarta</option>
                  <option value="jawa-barat">Jawa Barat</option>
                  <option value="jawa-tengah">Jawa Tengah</option>
                </select>
              </div>

              <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 overflow-x-auto">
                {[
                  { key: 'overview', label: 'Overview', icon: BarChart3 },
                  { key: 'regional', label: 'Regional', icon: MapPin },
                  { key: 'families', label: 'Families', icon: Users },
                  { key: 'trends', label: 'Trends', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setViewMode(key as any)}
                    className={cn(
                      "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap",
                      viewMode === key
                        ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                    )}
                  >
                    <Icon className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Total Cases</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {analyticsData.totalCases.toLocaleString()}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                <span className="text-green-600 dark:text-green-400">+12%</span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">vs last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Positive Cases</p>
                  <p className="text-xl sm:text-2xl font-bold text-red-600 dark:text-red-400">
                    {analyticsData.positiveCases}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-red-100 dark:bg-red-900 rounded-full">
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
                <span className="text-red-600 dark:text-red-400">
                  {((analyticsData.positiveCases / analyticsData.totalCases) * 100).toFixed(1)}%
                </span>
                <span className="text-gray-600 dark:text-gray-400 ml-1">positivity rate</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Families at Risk</p>
                  <p className="text-xl sm:text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {analyticsData.familiesAtRisk}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
                <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500 mr-1" />
                <span className="text-orange-600 dark:text-orange-400">High priority</span>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">High Risk Areas</p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {analyticsData.highRiskAreas}
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm">
                <Home className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500 mr-1" />
                <span className="text-purple-600 dark:text-purple-400">Districts monitored</span>
              </div>
            </div>
          </div>

          {/* Main Content Based on View Mode */}
          {viewMode === 'overview' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              <TBSpreadMap data={analyticsData.regionalData} />
              <RiskHeatmap 
            data={analyticsData.regionalData.map(item => ({
              id: `${item.province}-${item.city}-${item.district}`,
              province: item.province,
              city: item.city,
              district: item.district,
              latitude: item.latitude,
              longitude: item.longitude,
              riskScore: item.riskLevel === 'critical' ? 90 : 
                        item.riskLevel === 'high' ? 70 : 
                        item.riskLevel === 'medium' ? 50 : 30,
              riskLevel: item.riskLevel,
              positiveCases: item.positiveCases,
              totalFamilies: item.totalFamilies,
              population: item.population,
              lastUpdated: new Date().toISOString()
            }))} 
          />
            </div>
          )}

          {viewMode === 'regional' && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 sm:gap-8">
              <RegionalStats data={analyticsData.regionalData} />
              <GeographicBreakdown 
                data={analyticsData.regionalData.map(item => ({
                  province: item.province,
                  city: item.city,
                  district: item.district,
                  totalFamilies: item.totalFamilies,
                  positiveCases: item.positiveCases,
                  negativeCases: item.negativeCases,
                  pendingCases: item.pendingCases,
                  population: item.population,
                  area: Math.floor(Math.random() * 100) + 50, // Mock area data
                  density: (item.positiveCases / item.population) * 1000,
                  riskLevel: item.riskLevel,
                  lastUpdated: new Date().toISOString()
                }))} 
              />
            </div>
          )}

          {viewMode === 'families' && (
            <FamilyRiskIndicators 
              data={analyticsData.familyRiskData.map(item => ({
                id: item.familyId,
                familyName: item.familyName,
                headOfFamily: `Head of ${item.familyName}`,
                address: item.address,
                district: item.district,
                city: item.city,
                province: item.province,
                phone: '+62-XXX-XXXX-XXXX',
                totalMembers: item.memberCount,
                screenedMembers: item.memberCount - 1,
                positiveCases: item.positiveCases,
                pendingTests: Math.floor(Math.random() * 3),
                lastScreening: item.lastScreening,
                riskLevel: item.riskScore > 70 ? 'high' : item.riskScore > 40 ? 'medium' : 'low',
                warningType: item.positiveCases > 0 ? 'positive_case' : 'none',
                latitude: -6.2 + Math.random() * 0.4,
                longitude: 106.8 + Math.random() * 0.4
              }))} 
            />
          )}

          {viewMode === 'trends' && (
            <TrendAnalysis 
              data={analyticsData.trendData.map(item => ({
                date: item.date,
                newCases: item.positive,
                totalScreenings: item.positive + item.negative + item.pending,
                positiveCases: item.positive,
                negativeCases: item.negative,
                pendingCases: item.pending,
                positivityRate: (item.positive / (item.positive + item.negative + item.pending)) * 100,
                province: 'Jakarta',
                city: 'Jakarta Pusat'
              }))} 
            />
          )}
        </div>
      </div>
    </div>
  );
}