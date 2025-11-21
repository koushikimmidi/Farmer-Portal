import React from 'react';
import { Sprout, Menu, LogOut, User } from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  user?: UserProfile | null;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  return (
    <header className="bg-leaf-600 text-white p-4 shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-full">
            <Sprout className="text-leaf-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-wide">KrishiUday</h1>
            <p className="text-xs text-leaf-100">Empowering Farmers</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex gap-4 text-sm font-medium items-center">
            <span>📞 1800-180-1551 (Kisan Call Center)</span>
          </div>

          {user && (
            <div className="flex items-center gap-3 pl-4 md:border-l md:border-leaf-500">
              <div className="hidden md:block text-right">
                 <p className="text-sm font-bold">{user.firstName || 'Farmer'}</p>
                 <p className="text-xs text-leaf-200">{user.countryCode} {user.phoneNumber}</p>
              </div>
              {onLogout && (
                <button 
                  onClick={onLogout}
                  className="bg-leaf-700 p-2 rounded-lg hover:bg-leaf-800 transition text-white flex items-center gap-1 text-xs"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden md:inline">Logout</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
