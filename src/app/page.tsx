'use client';

import { Users, FileText, BarChart3, AlertTriangle, Bell, Search } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { StatsChart } from '@/components/dashboard/StatsChart';
import { GeospatialMap } from '@/components/dashboard/GeospatialMap';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Sidebar } from '@/components/ui/Sidebar';

export default function Dashboard() {
  // Mock data - replace with real API calls
  const stats = {
    totalFamilies: 1247,
    totalPatients: 4892,
    totalSamples: 3456,
    analysisResults: 3201,
  };

  const chartData = [
    { label: 'Jan', positive: 12, negative: 145, pending: 8 },
    { label: 'Feb', positive: 8, negative: 167, pending: 12 },
    { label: 'Mar', positive: 15, negative: 189, pending: 6 },
    { label: 'Apr', positive: 22, negative: 201, pending: 15 },
    { label: 'May', positive: 18, negative: 234, pending: 9 },
    { label: 'Jun', positive: 25, negative: 267, pending: 18 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="ml-16 lg:ml-0">
                <h1 className="text-2xl font-bold text-gray-900">TB Screening Dashboard</h1>
                <p className="text-sm text-gray-600">Monitor tuberculosis screening activities</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <button className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="h-6 w-6" />
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <DashboardCard
              title="Total Families"
              value={stats.totalFamilies}
              icon={Users}
              color="blue"
              change={{ value: 12, type: 'increase' }}
            />
            <DashboardCard
              title="Total Patients"
              value={stats.totalPatients}
              icon={Users}
              color="green"
              change={{ value: 8, type: 'increase' }}
            />
            <DashboardCard
              title="Samples Collected"
              value={stats.totalSamples}
              icon={FileText}
              color="purple"
              change={{ value: 15, type: 'increase' }}
            />
            <DashboardCard
              title="Analysis Results"
              value={stats.analysisResults}
              icon={AlertTriangle}
              color="yellow"
              change={{ value: 3, type: 'decrease' }}
            />
          </div>

          {/* Charts and Maps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Trends</h3>
              <StatsChart data={chartData} />
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
              <GeospatialMap />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <RecentActivity />
          </div>
        </main>
      </div>
    </div>
  );
}
