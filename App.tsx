
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AdvisorySystem } from './components/AdvisorySystem';
import { ChatInterface } from './components/ChatInterface';
import { MarketView } from './components/MarketView';
import { Login } from './components/Login';
import { AppView, UserProfile } from './types';
import { LayoutDashboard, Sprout, MessageSquare, BarChart3, WifiOff } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Check network status
    const handleStatusChange = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // Check auth status
    const savedUser = localStorage.getItem('krishi_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
    setAuthChecked(true);

    return () => {
        window.removeEventListener('online', handleStatusChange);
        window.removeEventListener('offline', handleStatusChange);
    };
  }, []);

  const handleLoginSuccess = (userData: any) => {
    // Vendor returns: user_country_code, user_phone_number, user_first_name, user_last_name
    const profile: UserProfile = {
      countryCode: userData.user_country_code,
      phoneNumber: userData.user_phone_number,
      firstName: userData.user_first_name,
      lastName: userData.user_last_name
    };
    setUser(profile);
    localStorage.setItem('krishi_user', JSON.stringify(profile));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('krishi_user');
    setCurrentView(AppView.DASHBOARD);
  };

  if (!authChecked) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={(view) => setCurrentView(view as AppView)} />;
      case AppView.ADVISORY:
        return <AdvisorySystem />;
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.MARKET:
        return <MarketView />;
      default:
        return <Dashboard onNavigate={(view) => setCurrentView(view as AppView)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20 md:pb-0">
      <Header user={user} onLogout={handleLogout} />
      
      {isOffline && (
        <div className="bg-gray-800 text-white px-4 py-2 flex items-center justify-center gap-2 text-sm sticky top-0 z-40 animate-pulse">
          <WifiOff className="w-4 h-4" />
          <span>You are currently offline. App is running in limited mode. Data will sync when online.</span>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6">
        {renderView()}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
        <div className="flex justify-around p-3">
          <button 
            onClick={() => setCurrentView(AppView.DASHBOARD)}
            className={`flex flex-col items-center gap-1 text-xs ${currentView === AppView.DASHBOARD ? 'text-leaf-600 font-bold' : 'text-gray-500'}`}
          >
            <LayoutDashboard className="w-6 h-6" />
            Home
          </button>
          <button 
            onClick={() => setCurrentView(AppView.ADVISORY)}
            className={`flex flex-col items-center gap-1 text-xs ${currentView === AppView.ADVISORY ? 'text-leaf-600 font-bold' : 'text-gray-500'}`}
          >
            <Sprout className="w-6 h-6" />
            Advisory
          </button>
          <button 
             onClick={() => setCurrentView(AppView.MARKET)}
             className={`flex flex-col items-center gap-1 text-xs ${currentView === AppView.MARKET ? 'text-leaf-600 font-bold' : 'text-gray-500'}`}
          >
            <BarChart3 className="w-6 h-6" />
            Mandi
          </button>
          <button 
            onClick={() => setCurrentView(AppView.CHAT)}
            className={`flex flex-col items-center gap-1 text-xs ${currentView === AppView.CHAT ? 'text-leaf-600 font-bold' : 'text-gray-500'}`}
          >
            <MessageSquare className="w-6 h-6" />
            Assistant
          </button>
        </div>
      </nav>
    </div>
  );
};

export default App;
