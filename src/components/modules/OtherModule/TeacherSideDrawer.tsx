import React from 'react';
import {
  X,
  Home,
  Users,
  BarChart2,
  GraduationCap,
  RefreshCw,
  Info,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface TeacherSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeItem: 'home' | 'staff' | 'reports';
  onNavigate: (item: 'home' | 'staff' | 'reports' | 'profile' | 'sync' | 'credits' | 'signout') => void;
  lang: 'en' | 'ur';
}

export const TeacherSideDrawer: React.FC<TeacherSideDrawerProps> = ({
  isOpen,
  onClose,
  activeItem,
  onNavigate,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body - Image 011 Layout */}
      <div className="relative w-[300px] max-w-[85vw] h-full bg-[#f4f7f5] text-slate-900 shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto">
        <div className="space-y-4">
          {/* Top School Card (Image 011) */}
          <div
            onClick={() => {
              onNavigate('profile');
              onClose();
            }}
            className="bg-[#c8e6c9]/70 hover:bg-[#c8e6c9] border border-[#a5d6a7] p-3 rounded-3xl flex items-center justify-between cursor-pointer transition-all shadow-xs"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-2xl p-1 flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                <img
                  src="/assets/aistudio/20260903_200547_79893d25.png"
                  alt="School Logo"
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>
              <div className="min-w-0">
                <h3 className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                  GPS CHAMBAI
                </h3>
                <p className="text-[11px] font-bold text-slate-700 tracking-wide">
                  EMIS 16454
                </p>
              </div>
            </div>
            <ChevronRight size={18} className="text-slate-700 shrink-0" />
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5 pt-1">
            {/* Home */}
            <button
              onClick={() => {
                onNavigate('home');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                activeItem === 'home'
                  ? 'bg-[#dcfce7] text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Home size={19} className="text-slate-900" />
              <span>{lang === 'ur' ? 'مرکزی صفحہ (ہوم)' : 'Home'}</span>
            </button>

            {/* Staff */}
            <button
              onClick={() => {
                onNavigate('staff');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                activeItem === 'staff'
                  ? 'bg-[#dcfce7] text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <Users size={19} className="text-slate-800" />
              <span>{lang === 'ur' ? 'اساتذہ و عملہ' : 'Staff'}</span>
            </button>

            {/* Reports */}
            <button
              onClick={() => {
                onNavigate('reports');
                onClose();
              }}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black transition-all ${
                activeItem === 'reports'
                  ? 'bg-[#dcfce7] text-slate-900 shadow-xs'
                  : 'text-slate-700 hover:bg-slate-200/60'
              }`}
            >
              <BarChart2 size={19} className="text-slate-800" />
              <span>{lang === 'ur' ? 'رپورٹس اور رجسٹر' : 'Reports'}</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-300/70 my-3" />

            {/* School profile */}
            <button
              onClick={() => {
                onNavigate('profile');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition-all"
            >
              <GraduationCap size={19} className="text-slate-800" />
              <span>{lang === 'ur' ? 'سکول پروفائل' : 'School profile'}</span>
            </button>

            {/* Sync staff */}
            <button
              onClick={() => {
                onNavigate('sync');
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition-all"
            >
              <RefreshCw size={19} className="text-slate-800" />
              <span>{lang === 'ur' ? 'عملہ ہم آہنگ کریں' : 'Sync staff'}</span>
            </button>

            {/* Credits */}
            <button
              onClick={() => {
                onNavigate('credits');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-bold text-slate-700 hover:bg-slate-200/60 transition-all"
            >
              <Info size={19} className="text-slate-800" />
              <span>{lang === 'ur' ? 'کریڈٹس' : 'Credits'}</span>
            </button>

            {/* Divider */}
            <div className="border-t border-slate-300/70 my-3" />

            {/* Sign out */}
            <button
              onClick={() => {
                onNavigate('signout');
                onClose();
              }}
              className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-xs font-black text-rose-600 hover:bg-rose-50 transition-all"
            >
              <LogOut size={19} className="text-rose-600" />
              <span>{lang === 'ur' ? 'باہر نکلیں' : 'Sign out'}</span>
            </button>
          </div>
        </div>

        {/* Footer (Image 011) */}
        <div className="pt-6 border-t border-slate-300/70">
          <p className="text-[11px] font-bold text-slate-500 text-center leading-relaxed">
            Powered by AI &amp; DI Unit • E&amp;SE Department
          </p>
        </div>
      </div>
    </div>
  );
};
