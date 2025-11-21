import { WeatherData, CropPrice } from './types';

export const MOCK_WEATHER: WeatherData = {
  temp: 28,
  condition: 'Partly Cloudy',
  humidity: 65,
  windSpeed: 12,
  location: 'Ludhiana, Punjab'
};

export const PRICE_TRENDS: CropPrice[] = [
  { month: 'Jan', price: 2100 },
  { month: 'Feb', price: 2150 },
  { month: 'Mar', price: 2200 },
  { month: 'Apr', price: 2180 },
  { month: 'May', price: 2250 },
  { month: 'Jun', price: 2300 },
];

export const CROPS = [
  "Wheat", "Rice (Paddy)", "Cotton", "Sugarcane", "Maize", "Mustard", "Soybean", "Tomato", "Potato"
];

export const SOIL_TYPES = [
  "Alluvial Soil", "Black Soil", "Red Soil", "Laterite Soil", "Sandy Loam", "Clay"
];

export const IRRIGATION_TYPES = [
  "Flood Irrigation", "Drip Irrigation", "Sprinkler", "Rainfed"
];