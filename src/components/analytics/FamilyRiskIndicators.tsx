'use client';

import { useState } from 'react';
import { 
  AlertTriangle, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Bell,
  Filter,
  Search,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FamilyRiskData {
  id: string;
  familyName: string;
  headOfFamily: string;
  address: string;
  district: string;
  city: string;
  province: string;
  phone: string;
  totalMembers: number;
  screenedMembers: number;
  positiveCases: number;
  pendingTests: number;
  lastScreening: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  warningType: 'overdue_screening' | 'high_risk_contact' | 'positive_case' | 'multiple_symptoms' | 'none';
  latitude: number;
  longitude: number;
}

interface FamilyRiskIndicatorsProps {
  data: FamilyRiskData[];
}

export function FamilyRiskIndicators({ data }: FamilyRiskIndicatorsProps) {
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('all');
  const [selectedWarningType, setSelectedWarningType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data based on selections
  const filteredData = data.filter(family => {
    const matchesRisk = selectedRiskLevel === 'all' || family.riskLevel === selectedRiskLevel;
    const matchesWarning = selectedWarningType === 'all' || family.warningType === selectedWarningType;
    const matchesSearch = searchTerm === '' || 
      family.familyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.headOfFamily.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.district.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.city.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRisk && matchesWarning && matchesSearch;
  });

  // Calculate statistics
  const stats = {
    total: data.length,
    critical: data.filter(f => f.riskLevel === 'critical').length,
    high: data.filter(f => f.riskLevel === 'high').length,
    medium: data.filter(f => f.riskLevel === 'medium').length,
    low: data.filter(f => f.riskLevel === 'low').length,
    needsWarning: data.filter(f => f.warningType !== 'none').length,
    overdueScreening: data.filter(f => f.warningType === 'overdue_screening').length,
    highRiskContact: data.filter(f => f.warningType === 'high_risk_contact').length,
    positiveCases: data.filter(f => f.warningType === 'positive_case').length,
    multipleSymptoms: data.filter(f => f.warningType === 'multiple_symptoms').length
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

  const getWarningBadge = (warningType: string) => {
    const config = {
      overdue_screening: { 
        label: 'Overdue Screening', 
        color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
        icon: Clock
      },
      high_risk_contact: { 
        label: 'High Risk Contact', 
        color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
        icon: AlertTriangle
      },
      positive_case: { 
        label: 'Positive Case', 
        color: 'bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100',
        icon: XCircle
      },
      multiple_symptoms: { 
        label: 'Multiple Symptoms', 
        color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
        icon: AlertTriangle
      },
      none: { 
        label: 'No Warning', 
        color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
        icon: CheckCircle
      }
    };

    const warning = config[warningType as keyof typeof config] || config.none;
    const IconComponent = warning.icon;

    return (
      <span className={cn(
        'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
        warning.color
      )}>
        <IconComponent className="h-3 w-3" />
        {warning.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysAgo = (dateString: string) => {
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Family Risk Indicators & Warnings
        </h3>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-red-500" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">
            {stats.needsWarning} families need attention
          </span>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 dark:text-red-400">Critical Risk</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 dark:text-orange-400">High Risk</p>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{stats.high}</p>
            </div>
            <Users className="h-8 w-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 dark:text-yellow-400">Medium Risk</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">{stats.medium}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 dark:text-green-400">Low Risk</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">{stats.low}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Warning Type Breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{stats.overdueScreening}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Overdue Screening</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-red-600 dark:text-red-400">{stats.highRiskContact}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">High Risk Contact</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-red-700 dark:text-red-300">{stats.positiveCases}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Positive Cases</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-center">
          <p className="text-lg font-bold text-yellow-600 dark:text-yellow-400">{stats.multipleSymptoms}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400">Multiple Symptoms</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search families, head of family, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <select
          value={selectedRiskLevel}
          onChange={(e) => setSelectedRiskLevel(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Risk Levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        
        <select
          value={selectedWarningType}
          onChange={(e) => setSelectedWarningType(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Warning Types</option>
          <option value="overdue_screening">Overdue Screening</option>
          <option value="high_risk_contact">High Risk Contact</option>
          <option value="positive_case">Positive Case</option>
          <option value="multiple_symptoms">Multiple Symptoms</option>
          <option value="none">No Warning</option>
        </select>
      </div>

      {/* Family List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No families match the current filters.
          </div>
        ) : (
          filteredData.map((family) => (
            <div
              key={family.id}
              className={cn(
                'p-4 rounded-lg border-l-4 bg-gray-50 dark:bg-gray-700',
                family.riskLevel === 'critical' && 'border-l-red-500 bg-red-50 dark:bg-red-900/20',
                family.riskLevel === 'high' && 'border-l-orange-500 bg-orange-50 dark:bg-orange-900/20',
                family.riskLevel === 'medium' && 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
                family.riskLevel === 'low' && 'border-l-green-500 bg-green-50 dark:bg-green-900/20'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      {family.familyName}
                    </h4>
                    {getRiskBadge(family.riskLevel)}
                    {getWarningBadge(family.warningType)}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Head: {family.headOfFamily}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{family.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{family.district}, {family.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Last screening: {formatDate(family.lastScreening)} ({getDaysAgo(family.lastScreening)} days ago)</span>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm">
                    <span className="text-gray-700 dark:text-gray-300">
                      Members: {family.screenedMembers}/{family.totalMembers} screened
                    </span>
                    {family.positiveCases > 0 && (
                      <span className="ml-4 text-red-600 dark:text-red-400 font-medium">
                        {family.positiveCases} positive case(s)
                      </span>
                    )}
                    {family.pendingTests > 0 && (
                      <span className="ml-4 text-yellow-600 dark:text-yellow-400 font-medium">
                        {family.pendingTests} pending test(s)
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  {family.warningType !== 'none' && (
                    <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors">
                      Send Alert
                    </button>
                  )}
                  <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded-lg hover:bg-gray-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium text-blue-900 dark:text-blue-100">
              Showing {filteredData.length} of {data.length} families
            </h4>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              {stats.needsWarning} families require immediate attention
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
}