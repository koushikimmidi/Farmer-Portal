
export interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  location: string;
}

export interface CropPrice {
  month: string;
  price: number;
}

export interface AdvisoryInput {
  crop: string;
  soilType: string;
  sowingDate: string;
  landArea: string; // in acres
  irrigationType: string;
}

export interface AdvisoryResponse {
  summary: string;
  sowingAdvice: string;
  fertilizerSchedule: {
    stage: string;
    recommendation: string;
  }[];
  irrigationPlan: string;
  pestManagement: {
    alertLevel: 'Green' | 'Yellow' | 'Red';
    pestName: string;
    action: string;
  }[];
  sustainabilityTip: string;
  timestamp?: string; // Added to track when advisory was generated
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string; // Changed to string for easier JSON persistence
  isError?: boolean;
  pending?: boolean; // For offline sync
}

export interface UserProfile {
  countryCode: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
}

export enum AppView {
  DASHBOARD = 'DASHBOARD',
  ADVISORY = 'ADVISORY',
  CHAT = 'CHAT',
  MARKET = 'MARKET',
}
