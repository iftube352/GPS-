import React, { useEffect, useState } from 'react';
import { ActiveScreen } from '../../types';
import { StorageService } from '../../services/storage';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
}

/**
 * PART 5: BOTTOM NAVIGATION BAR
 * Follows Image 002 in exact order:
 * 1. Home
 * 2. Search
 * 3. Others
 * 4. Notifications
 * 5. Profile
 */
export const BottomNav: React.FC<BottomNavProps> = ({ activeScreen, onNavigate, lang }) => {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  useEffect(() => {
    const updateNotifications = () => {
      const list = StorageService.getNotifications();
      setUnreadCount(list.filter((n) => !n.read).length);
    };
    updateNotifications();
    window.addEventListener('gps-notifications-updated', updateNotifications);
    return () => window.removeEventListener('gps-notifications-updated', updateNotifications);
  }, []);

  const isOthersActive =
    activeScreen === 'other' ||
    activeScreen === 'classes' ||
    activeScreen === 'ptc_fund' ||
    activeScreen.startsWith('other_');

  const navItems: {
    id: ActiveScreen;
    labelEn: string;
    labelUr: string;
    color: string;
    activeIndicatorColor: string;
    isActive: boolean;
    renderIcon: (active: boolean) => React.ReactNode;
  }[] = [
    {
      id: 'home',
      labelEn: 'Home',
      labelUr: 'ہوم',
      color: '#16A34A',
      activeIndicatorColor: '#16A34A',
      isActive: activeScreen === 'home',
      renderIcon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11L12 4L20 11V20H4V11Z" />
        </svg>
      ),
    },
    {
      id: 'search',
      labelEn: 'Search',
      labelUr: 'تلاش',
      color: '#0284C7',
      activeIndicatorColor: '#0284C7',
      isActive: activeScreen === 'search',
      renderIcon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#0284C7" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <line x1="20" y1="20" x2="16.2" y2="16.2" />
        </svg>
      ),
    },
    {
      id: 'other',
      labelEn: 'Others',
      labelUr: 'دیگر',
      color: '#F59E0B',
      activeIndicatorColor: '#F59E0B',
      isActive: isOthersActive,
      renderIcon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20.5C12 20.5 4 15 4 9.2C4 6.4 6.2 4.2 9 4.2C10.7 4.2 12 5.2 12 5.2C12 5.2 13.3 4.2 15 4.2C17.8 4.2 20 6.4 20 9.2C20 15 12 20.5 12 20.5Z" />
        </svg>
      ),
    },
    {
      id: 'notifications',
      labelEn: 'Notifications',
      labelUr: 'اطلاعات',
      color: '#EC4899',
      activeIndicatorColor: '#EC4899',
      isActive: activeScreen === 'notifications',
      renderIcon: () => (
        <div className="relative">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#EC4899" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </div>
      ),
    },
    {
      id: 'profile',
      labelEn: 'Profile',
      labelUr: 'پروفائل',
      color: '#9333EA',
      activeIndicatorColor: '#9333EA',
      isActive: activeScreen === 'profile',
      renderIcon: () => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9333EA" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M5 20c0-3.8 3.1-6.5 7-6.5s7 2.7 7 6.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="w-full px-2.5 pb-1.5 pt-1 bg-transparent shrink-0 z-40">
      <nav
        aria-label="Primary Bottom Navigation"
        className="relative w-full rounded-[20px] border border-slate-300/90 shadow-md px-1.5 py-1 flex items-center justify-around"
        style={{
          background:
            'linear-gradient(90deg, #F6E3DF 0%, #FDD9F5 24%, #CBE3FB 48%, #CCF7E5 74%, #FBF0D9 100%)',
        }}
      >
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="relative flex flex-col items-center justify-center py-0.5 px-2 rounded-xl transition-all duration-200 active:scale-90 focus:outline-none min-w-[54px]"
          >
            {/* Active Floating Dot Indicator matching Image 002 */}
            {item.isActive && (
              <span
                className=" -top-3 w-3.5 h-3.5 rounded-full border-2 border-white shadow-md transition-all"
                style={{ backgroundColor: item.activeIndicatorColor, position: 'absolute' }}
              />
            )}

            <div className={`transition-transform duration-200 ${item.isActive ? 'scale-110 -translate-y-0.5' : ''}`}>
              {item.renderIcon(item.isActive)}
            </div>

            <span
              className="text-[10px] font-extrabold mt-0.5 tracking-tight leading-tight"
              style={{ color: item.color }}
            >
              {lang === 'ur' ? item.labelUr : item.labelEn}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
};
