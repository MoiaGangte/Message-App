import React from 'react';
import {
  MessageSquare,
  ShoppingBag,
  Handshake,
  Bell,
  User,
  Settings,
  Moon,
  Sun,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { UserProfile } from '../types/chat';

export type RailTab = 'chats' | 'listings' | 'deals' | 'notifications' | 'profile' | 'settings';

interface NavigationRailProps {
  activeTab: RailTab;
  onTabChange: (tab: RailTab) => void;
  currentUser: UserProfile;
  unreadTotal: number;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const NavigationRail: React.FC<NavigationRailProps> = ({
  activeTab,
  onTabChange,
  currentUser,
  unreadTotal,
  darkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
}) => {
  const navItems: { id: RailTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'chats',
      label: 'Messages',
      icon: <MessageSquare className="w-5 h-5" />,
      badge: unreadTotal,
    },
    {
      id: 'listings',
      label: 'Listings',
      icon: <ShoppingBag className="w-5 h-5" />,
    },
    {
      id: 'deals',
      label: 'Deals & Offers',
      icon: <Handshake className="w-5 h-5" />,
    },
    {
      id: 'notifications',
      label: 'Activity',
      icon: <Bell className="w-5 h-5" />,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: <User className="w-5 h-5" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-16 lg:w-18 h-full bg-[#0B1F3A] flex flex-col items-center justify-between py-4 border-r border-[#132C4F] select-none flex-shrink-0 z-30">
      {/* Top: Logo Mark */}
      <div className="flex flex-col items-center gap-6">
        <button
          onClick={() => onTabChange('chats')}
          className="group relative flex items-center justify-center cursor-pointer"
          title="NicheTrade"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1976F2] to-[#1259BA] text-white flex items-center justify-center font-extrabold text-xl shadow-md transition-transform group-hover:scale-105 active:scale-95">
            N
          </div>
        </button>

        {/* Nav Items */}
        <nav className="flex flex-col items-center gap-1.5 w-full px-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`relative w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer group ${
                  isActive
                    ? 'bg-[#1976F2] text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/10'
                }`}
                title={item.label}
              >
                {item.icon}

                {/* Badge */}
                {Boolean(item.badge && item.badge > 0) && (
                  <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-[#0B1F3A]">
                    {item.badge! > 9 ? '9+' : item.badge}
                  </span>
                )}

                {/* Floating Tooltip */}
                <span className="absolute left-14 px-2.5 py-1 rounded-md bg-slate-900 text-white text-xs font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg border border-slate-700 hidden sm:inline-block">
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Controls */}
      <div className="flex flex-col items-center gap-2 pt-2 border-t border-[#132C4F] w-full px-2">
        {/* Sound toggle */}
        <button
          onClick={onToggleSound}
          className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          title={soundEnabled ? 'Mute notification sounds' : 'Enable sounds'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-[#1976F2]" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Theme toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 flex items-center justify-center transition-colors cursor-pointer"
          title={darkMode ? 'Light Theme' : 'Dark Theme'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar trigger */}
        <button
          onClick={() => onTabChange('profile')}
          className="relative mt-1 cursor-pointer group"
          title={`${currentUser.displayName} (View Profile)`}
        >
          <img
            src={currentUser.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUser.uid}`}
            alt={currentUser.displayName}
            className="w-9 h-9 rounded-xl object-cover border-2 border-white/20 group-hover:border-[#1976F2] transition-colors"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-[#0B1F3A] rounded-full" />
        </button>
      </div>
    </aside>
  );
};
