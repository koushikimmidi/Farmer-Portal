import React from 'react';
import { MOCK_WEATHER } from '../constants';
import { CloudSun, Droplets, Wind, ThermometerSun, TrendingUp, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const HEALTH_DATA = [
  { name: 'Nitrogen', value: 70, color: '#ef4444' }, // Low
  { name: 'Phosphorus', value: 90, color: '#22c55e' }, // Good
  { name: 'Potassium', value: 85, color: '#22c55e' }, // Good
  { name: 'pH Level', value: 60, color: '#eab308' }, // Neutral/Warning
];

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-leaf-800 to-leaf-600 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Namaste, Farmer! 🙏</h2>
        <p className="opacity-90">Your farm activity looks good today. 2 alerts require attention.</p>
        <div className="mt-4 flex gap-3">
          <button 
            onClick={() => onNavigate('ADVISORY')}
            className="bg-white text-leaf-800 px-4 py-2 rounded-lg font-semibold hover:bg-leaf-50 transition shadow-sm"
          >
            Get New Advisory
          </button>
          <button 
            onClick={() => onNavigate('CHAT')}
            className="bg-leaf-700 text-white border border-white/30 px-4 py-2 rounded-lg font-semibold hover:bg-leaf-600 transition"
          >
            Ask Assistant
          </button>
        </div>
      </div>

      {/* Weather Widget */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <CloudSun className="text-orange-500" /> Live Weather
            </h3>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Updated 10m ago</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-4xl font-bold text-gray-800">{MOCK_WEATHER.temp}°C</div>
              <div className="text-gray-500">{MOCK_WEATHER.condition}</div>
              <div className="text-sm text-gray-400 mt-1">{MOCK_WEATHER.location}</div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Droplets className="w-4 h-4 text-blue-500" /> {MOCK_WEATHER.humidity}% Humidity
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Wind className="w-4 h-4 text-gray-500" /> {MOCK_WEATHER.windSpeed} km/h Wind
              </div>
            </div>
          </div>
        </div>

        {/* Soil Health Card (Simulated IoT/Card Data) */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-gray-700 flex items-center gap-2">
              <TrendingUp className="text-soil-500" /> Soil Health Card
            </h3>
          </div>
          <div className="h-32 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HEALTH_DATA} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={15}>
                  {HEALTH_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-right text-red-500 font-medium mt-1">Nitrogen levels low. Consider Urea application.</p>
        </div>
      </div>

      {/* Alerts Section */}
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
        <div className="flex items-start">
          <AlertTriangle className="text-red-500 w-5 h-5 mr-2 mt-0.5" />
          <div>
            <h4 className="text-red-800 font-bold">Pest Alert: Stem Borer</h4>
            <p className="text-red-700 text-sm">High probability of Stem Borer attack in Wheat crops in your region due to high humidity.</p>
          </div>
        </div>
      </div>
    </div>
  );
};