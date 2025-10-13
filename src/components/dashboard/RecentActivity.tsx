'use client';

import { Clock, User, FileText, AlertCircle } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { useState, useEffect } from 'react';

interface Activity {
  id: string;
  type: 'sample_uploaded' | 'analysis_completed' | 'patient_registered' | 'alert_generated';
  title: string;
  description: string;
  timestamp: Date;
  user?: string;
}

const activityIcons = {
  sample_uploaded: FileText,
  analysis_completed: AlertCircle,
  patient_registered: User,
  alert_generated: AlertCircle,
};

const activityColors = {
  sample_uploaded: 'text-blue-600',
  analysis_completed: 'text-green-600',
  patient_registered: 'text-purple-600',
  alert_generated: 'text-red-600',
};

export function RecentActivity() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Mock data - replace with real API data
  const activities: Activity[] = [
    {
      id: '1',
      type: 'sample_uploaded',
      title: 'New Sample Uploaded',
      description: 'Chest X-ray sample uploaded for Patient ID: P001',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      user: 'Dr. Smith',
    },
    {
      id: '2',
      type: 'analysis_completed',
      title: 'Analysis Completed',
      description: 'TB screening analysis completed - Negative result',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'AI System',
    },
    {
      id: '3',
      type: 'patient_registered',
      title: 'New Patient Registered',
      description: 'John Doe registered in Family F001',
      timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
      user: 'Nurse Johnson',
    },
    {
      id: '4',
      type: 'alert_generated',
      title: 'High Risk Alert',
      description: 'Positive TB case detected in high-density area',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'AI System',
    },
    {
      id: '5',
      type: 'sample_uploaded',
      title: 'Batch Upload Completed',
      description: '5 samples uploaded for Family F002',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      user: 'Dr. Wilson',
    },
  ];

  if (!mounted) {
    return (
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
              <div className={`p-2 rounded-full bg-gray-100 ${colorClass}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    Loading...
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const Icon = activityIcons[activity.type];
        const colorClass = activityColors[activity.type];
        
        return (
          <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <div className={`p-2 rounded-full bg-gray-100 ${colorClass}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <div className="flex items-center text-xs text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDateTime(activity.timestamp)}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
              {activity.user && (
                <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
              )}
            </div>
          </div>
        );
      })}
      
      <div className="text-center pt-4">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View all activities
        </button>
      </div>
    </div>
  );
}