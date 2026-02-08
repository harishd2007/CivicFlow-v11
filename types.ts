
export type IssueCategory = 'Pothole' | 'Streetlight' | 'Illegal Dumping' | 'Water Leak' | 'Other';

export type IssueStatus = 'Reported' | 'In Progress' | 'Resolved' | 'Closed';

export type SupportedLanguage = 'English' | 'Tamil' | 'Hindi' | 'Malayalam' | 'Telugu' | 'Bengali' | 'Punjabi';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface Report {
  id: string;
  category: IssueCategory;
  description: string;
  location: Location;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  resolutionTimeDays?: number;
  imageUrl?: string;
}

export interface CityStats {
  totalReports: number;
  resolvedCount: number;
  medianResolutionTime: number; // in days
  categoryDistribution: { name: string; value: number }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface UserAlert {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'status' | 'system' | 'award';
}
