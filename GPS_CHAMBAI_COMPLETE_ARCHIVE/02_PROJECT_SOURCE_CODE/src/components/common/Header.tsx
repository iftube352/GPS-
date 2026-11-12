import React, { useEffect, useState } from 'react';
import { ArrowLeft, Smartphone, Tablet, Monitor, FolderOpen, Download, CheckCircle2 } from 'lucide-react';
import { ActiveScreen, AppCustomizationSettings, DeviceFrameMode } from '../../types';
import { StorageService } from '../../services/storage';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface HeaderProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  deviceMode: DeviceFrameMode;
  onChangeDeviceMode: (mode: DeviceFrameMode) => void;
  onOpenApkModal?: () => void;
  onOpenFolderModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeScreen,
  onNavigate,
  lang,
  deviceMode,
  onChangeDeviceMode,
  onOpenApkModal,
  onOpenFolderModal,
}) => {
  const [customization, setCustomization] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();

  useEffect(() => {
    const refresh = () => setCustomization(StorageService.getCustomization());
    window.addEventListener('gps-customization-updated', refresh);
    return () => window.removeEventListener('gps-customization-updated', refresh);
  }, []);

  const handleBack = () => {
    if (activeScreen.startsWith('other_') || activeScreen === 'classes') {
      onNavigate('other');
    } else {
      onNavigate('home');
    }
  };

  const handleInstallClick = async () => {
    if (isInstallable && !isInstalled) {
      const installed = await promptInstall();
      if (installed) return;
    }
    if (onOpenApkModal) {
      onOpenApkModal();
    } else {
      window.dispatchEvent(new CustomEvent('gps-open-apk-modal'));
    }
  };

  return (
    <header
      className="text-white px-2.5 py-1.5 shrink-0 shadow-md relative overflow-hidden z-30 transition-colors"
      style={{
        background: `linear-gradient(135deg, ${customization.headerBgColor || '#046C4E'} 0%, #057A55 100%)`,
      }}
    >
      {/* Top Green Navigation Bar — matching Requirement 4 & Image 014.png */}
      <div className="flex items-center justify-between gap-1.5 min-h-[36px]">
        {/* Left: Back button when inside a module, Folder Explorer shortcut, and Global Install App / APK Button */}
        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
          {activeScreen !== 'home' && (
            <button
              onClick={handleBack}
              className="w-8 h-8 rounded-xl bg-black/20 hover:bg-black/30 flex items-center justify-center transition-all active:scale-95 shrink-0 border border-white/15"
              aria-label="Go Back"
              title="Back"
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              if (onOpenFolderModal) {
                onOpenFolderModal();
              } else {
                window.dispatchEvent(new CustomEvent('gps-open-folder-modal'));
              }
            }}
            className="px-2 py-1.5 rounded-xl bg-black/20 hover:bg-black/30 border border-white/15 text-[10.5px] font-black flex items-center gap-1 text-emerald-100 hover:text-white transition-all active:scale-95 shrink-0"
            title="Open GPS Chambai Internal Storage Folder Explorer"
          >
            <FolderOpen size={13} className="text-amber-300 shrink-0" />
            <span className="truncate max-w-[105px] sm:max-w-none">GPS Chambai Folder</span>
          </button>

          {/* Global Install App / APK Button visible across all screens */}
          <button
            type="button"
            onClick={handleInstallClick}
            className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border border-amber-200/60 text-[10.5px] font-black flex items-center gap-1 shadow-sm transition-all active:scale-95 shrink-0"
            title="Install Native Kotlin Android App (APK) or Web App"
          >
            {isInstalled ? (
              <CheckCircle2 size={13} className="text-emerald-950 shrink-0" />
            ) : (
              <Download size={13} className="text-slate-950 shrink-0" />
            )}
            <span>
              {lang === 'ur'
                ? 'انسٹال ایپ (APK)'
                : isInstallable
                ? 'Install App'
                : 'Install APK'}
            </span>
          </button>
        </div>

        {/* Right / Center: Exact Image 014.png Responsive View Switcher (Mobile | Tablet | Laptop/Desktop) */}
        <div
          className="flex items-center bg-[#03543F]/90 rounded-2xl p-1 border border-white/15 shadow-inner gap-1 ml-auto"
          role="group"
          aria-label="Responsive View Mode Switcher"
        >
          <button
            type="button"
            onClick={() => onChangeDeviceMode('mobile')}
            className={`w-8 h-7 rounded-xl flex items-center justify-center transition-all ${
              deviceMode === 'mobile'
                ? 'bg-white text-[#046C4E] shadow-sm scale-105'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
            title="Mobile View"
            aria-label="Mobile View"
          >
            <Smartphone size={15} strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={() => onChangeDeviceMode('tablet')}
            className={`w-8 h-7 rounded-xl flex items-center justify-center transition-all ${
              deviceMode === 'tablet'
                ? 'bg-white text-[#046C4E] shadow-sm scale-105'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
            title="Tablet View"
            aria-label="Tablet View"
          >
            <Tablet size={15} strokeWidth={2.3} />
          </button>
          <button
            type="button"
            onClick={() => onChangeDeviceMode('full')}
            className={`w-8 h-7 rounded-xl flex items-center justify-center transition-all ${
              deviceMode === 'full'
                ? 'bg-white text-[#046C4E] shadow-sm scale-105'
                : 'text-white/85 hover:text-white hover:bg-white/10'
            }`}
            title="Laptop / Desktop View"
            aria-label="Laptop / Desktop View"
          >
            <Monitor size={15} strokeWidth={2.3} />
          </button>
        </div>
      </div>
    </header>
  );
};
