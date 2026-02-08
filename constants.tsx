
import React from 'react';
import { 
  AlertCircle, 
  Lightbulb, 
  Trash2, 
  Droplets, 
  HelpCircle
} from 'lucide-react';
import { IssueCategory, Report, SupportedLanguage, UserAlert } from './types';

export const CATEGORIES: { value: IssueCategory; icon: React.ReactNode; color: string }[] = [
  { value: 'Pothole', icon: <AlertCircle className="w-5 h-5" />, color: 'bg-orange-500' },
  { value: 'Streetlight', icon: <Lightbulb className="w-5 h-5" />, color: 'bg-yellow-500' },
  { value: 'Illegal Dumping', icon: <Trash2 className="w-5 h-5" />, color: 'bg-red-500' },
  { value: 'Water Leak', icon: <Droplets className="w-5 h-5" />, color: 'bg-blue-500' },
  { value: 'Other', icon: <HelpCircle className="w-5 h-5" />, color: 'bg-purple-500' },
];

export const LANGUAGES: { name: SupportedLanguage; label: string; native: string }[] = [
  { name: 'English', label: 'English', native: 'English' },
  { name: 'Hindi', label: 'Hindi', native: 'हिन्दी' },
  { name: 'Tamil', label: 'Tamil', native: 'தமிழ்' },
  { name: 'Malayalam', label: 'Malayalam', native: 'മലയാളം' },
  { name: 'Telugu', label: 'Telugu', native: 'తెలుగు' },
  { name: 'Bengali', label: 'Bengali', native: 'বাংলা' },
  { name: 'Punjabi', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

export const MOCK_ALERTS: UserAlert[] = [
  {
    id: 'a1',
    title: 'Report Resolved!',
    message: 'Your report #1245 (Pothole on Main St) has been fixed. Thank you!',
    time: '2 hours ago',
    read: false,
    type: 'status'
  },
  {
    id: 'a2',
    title: 'Civic Hero Badge',
    message: 'You just earned the "Eagle Eye" badge for your 5th report!',
    time: 'Yesterday',
    read: true,
    type: 'award'
  },
  {
    id: 'a3',
    title: 'Maintenance Alert',
    message: 'Scheduled street cleaning in your area tomorrow from 8 AM.',
    time: '2 days ago',
    read: true,
    type: 'system'
  }
];

export const MOCK_REPORTS: Report[] = [
  {
    id: '1',
    category: 'Pothole',
    description: 'Large pothole on Main St. causing traffic slow down.',
    location: { lat: 40.7128, lng: -74.0060, address: '123 Main St, Tech City' },
    status: 'Resolved',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    resolutionTimeDays: 5,
    imageUrl: 'https://picsum.photos/seed/pothole/400/300'
  },
  {
    id: '2',
    category: 'Streetlight',
    description: 'Light flickering near the park entrance.',
    location: { lat: 40.7200, lng: -74.0100, address: 'Park Avenue, Tech City' },
    status: 'In Progress',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: 'https://picsum.photos/seed/light/400/300'
  }
];

export const STATUS_STYLES = {
  Reported: 'bg-slate-700 text-slate-200 border-slate-500',
  'In Progress': 'bg-blue-900/50 text-blue-300 border-blue-500',
  Resolved: 'bg-emerald-900/50 text-emerald-300 border-emerald-500',
  Closed: 'bg-purple-900/50 text-purple-300 border-purple-500',
};
