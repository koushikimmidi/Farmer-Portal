import React, { useState, useEffect } from 'react';
import { CROPS, IRRIGATION_TYPES, SOIL_TYPES } from '../constants';
import { AdvisoryInput, AdvisoryResponse } from '../types';
import { getFarmingAdvisory } from '../services/geminiService';
import { Leaf, Droplets, Bug, Sprout, Loader2, Save, WifiOff, Clock, Languages } from 'lucide-react';

const LANGUAGES = [
  "English", "Hindi (हिंदी)", "Punjabi (ਪੰਜਾਬੀ)", "Tamil (தமிழ்)", "Telugu (తెలుగు)", "Marathi (मराठी)"
];

export const AdvisorySystem: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [language, setLanguage] = useState('English');
  const [formData, setFormData] = useState<AdvisoryInput>({
    crop: CROPS[0],
    soilType: SOIL_TYPES[0],
    sowingDate: new Date().toISOString().split('T')[0],
    landArea: "1",
    irrigationType: IRRIGATION_TYPES[0]
  });

  // Load cached advisory on mount
  useEffect(() => {
    const savedAdvisory = localStorage.getItem('krishi_advisory_last');
    if (savedAdvisory) {
      try {
        setResult(JSON.parse(savedAdvisory));
      } catch (e) {
        console.error("Failed to parse cached advisory");
      }
    }
    
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOffline) {
      setError("You are offline. Cannot generate new advisory. Showing cached data if available.");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Pass language to service
      const data = await getFarmingAdvisory(formData, language);
      // Add timestamp to data before saving
      const dataWithTimestamp = { ...data, timestamp: new Date().toISOString() };
      setResult(dataWithTimestamp);
      localStorage.setItem('krishi_advisory_last', JSON.stringify(dataWithTimestamp));
    } catch (err) {
      setError("Failed to fetch advisory. Please ensure API Key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Form */}
      <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Leaf className="text-leaf-600" /> New Advisory
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Languages className="w-4 h-4" /> Language
             </label>
             <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none bg-blue-50"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>

          <div className="border-t border-gray-100 my-4"></div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Crop</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none"
              value={formData.crop}
              onChange={(e) => setFormData({...formData, crop: e.target.value})}
            >
              {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Soil Type</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none"
              value={formData.soilType}
              onChange={(e) => setFormData({...formData, soilType: e.target.value})}
            >
              {SOIL_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Irrigation Method</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none"
              value={formData.irrigationType}
              onChange={(e) => setFormData({...formData, irrigationType: e.target.value})}
            >
              {IRRIGATION_TYPES.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Area (Acres)</label>
              <input 
                type="number" 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none"
                value={formData.landArea}
                onChange={(e) => setFormData({...formData, landArea: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sowing Date</label>
              <input 
                type="date" 
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-leaf-500 outline-none"
                value={formData.sowingDate}
                onChange={(e) => setFormData({...formData, sowingDate: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || isOffline}
            className={`w-full py-2.5 rounded-lg font-bold transition flex justify-center items-center gap-2 shadow-md ${
              isOffline 
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
              : 'bg-leaf-600 text-white hover:bg-leaf-700'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : isOffline ? 'Offline Mode' : 'Generate Plan'}
          </button>
          {isOffline && <p className="text-xs text-center text-red-500">Connect to internet to generate new plans.</p>}
        </form>
      </div>

      {/* Output Display */}
      <div className="lg:col-span-2">
        {error && (
           <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 mb-4">
             {error}
           </div>
        )}

        {!result && !loading && !error && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl p-10">
            <Sprout className="w-16 h-16 mb-4 opacity-50" />
            <p>Enter your farm details to generate a personalized AI advisory plan.</p>
          </div>
        )}

        {result && (
          <div className="space-y-6 animate-fade-in">
            
            {/* Summary Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-leaf-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-leaf-500"></div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-gray-800">AI Summary</h3>
                {result.timestamp && (
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {new Date(result.timestamp).toLocaleDateString()}
                  </span>
                )}
              </div>
              <p className="text-gray-600 leading-relaxed">{result.summary}</p>
            </div>

            {/* Sustainability Alert */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200 flex items-start gap-3">
              <Leaf className="text-green-600 shrink-0" />
              <div>
                <h4 className="font-bold text-green-800">Sustainability Tip</h4>
                <p className="text-sm text-green-700">{result.sustainabilityTip}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fertilizer */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-soil-500 rounded-full"></div> Fertilizer Schedule
                </h3>
                <div className="space-y-3">
                  {result.fertilizerSchedule.map((item, idx) => (
                    <div key={idx} className="text-sm border-b border-gray-50 pb-2 last:border-0">
                      <span className="font-semibold text-gray-800 block">{item.stage}</span>
                      <span className="text-gray-600">{item.recommendation}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Irrigation */}
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                 <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-3">
                  <Droplets className="w-4 h-4 text-blue-500" /> Irrigation Plan
                </h3>
                <p className="text-sm text-gray-600">{result.irrigationPlan}</p>
                <div className="mt-4 bg-blue-50 p-3 rounded text-xs text-blue-700">
                  Tip: Monitor soil moisture to avoid over-watering.
                </div>
              </div>
            </div>

            {/* Pest Management */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
               <h3 className="font-bold text-gray-700 flex items-center gap-2 mb-4">
                  <Bug className="w-4 h-4 text-red-500" /> Pest & Disease Management
                </h3>
                <div className="grid gap-4">
                  {result.pestManagement.map((pest, idx) => (
                    <div key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className={`w-3 h-3 rounded-full mt-1.5 shrink-0 ${
                        pest.alertLevel === 'Red' ? 'bg-red-500' : 
                        pest.alertLevel === 'Yellow' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}></div>
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">{pest.pestName}</h4>
                        <p className="text-sm text-gray-600 mt-1">{pest.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
            </div>
            
            {isOffline && (
               <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-4">
                 <WifiOff className="w-4 h-4" /> You are viewing cached data
               </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};