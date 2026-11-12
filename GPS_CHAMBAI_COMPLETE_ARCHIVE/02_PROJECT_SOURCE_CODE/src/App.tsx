import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActiveScreen, AppCustomizationSettings, DeviceFrameMode } from './types';
import { StorageService } from './services/storage';
import { StorageFolderService } from './services/storageFolderService';
import { Header } from './components/common/Header';
import { BottomNav } from './components/common/BottomNav';
import { PrintPreviewModal } from './components/common/PrintPreviewModal';
import { GpsChambaiFolderModal } from './components/common/GpsChambaiFolderModal';
import { HomeScreen } from './components/modules/HomeScreen';
import { ClassModule } from './components/modules/ClassModule';
import { AdmissionModule } from './components/modules/AdmissionModule';
import { StaffDirectoryModule } from './components/modules/StaffDirectoryModule';
import { BooksAndGuidesModule } from './components/modules/BooksAndGuidesModule';
import { GalleryModule } from './components/modules/GalleryModule';
import { VideosModule } from './components/modules/VideosModule';
import { PtcFundModule } from './components/modules/PtcFundModule';
import { OtherDashboard } from './components/modules/OtherModule/OtherDashboard';
import { QrScannerSubmodule } from './components/modules/OtherModule/QrScannerSubmodule';
import { AttendanceSubmodule } from './components/modules/OtherModule/AttendanceSubmodule';
import { TimetableSubmodule } from './components/modules/OtherModule/TimetableSubmodule';
import { ResultsSubmodule } from './components/modules/OtherModule/ResultsSubmodule';
import { BooksDemandSubmodule } from './components/modules/OtherModule/BooksDemandSubmodule';
import { LessonPlansSubmodule } from './components/modules/OtherModule/LessonPlansSubmodule';
import { DailyDiarySubmodule } from './components/modules/OtherModule/DailyDiarySubmodule';
import { AiPortalSubmodule } from './components/modules/OtherModule/AiPortalSubmodule';
import { OfficeDataSubmodule } from './components/modules/OtherModule/OfficeDataSubmodule';
import { BackupRestoreSubmodule } from './components/modules/OtherModule/BackupRestoreSubmodule';
import { CertificateIssueSubmodule } from './components/modules/OtherModule/CertificateIssueSubmodule';
import { StruckOffSubmodule } from './components/modules/OtherModule/StruckOffSubmodule';
import { SemesterExamSubmodule } from './components/modules/OtherModule/SemesterExamSubmodule';
import { GlobalSearchModule } from './components/modules/GlobalSearchModule';
import { NotificationsModule } from './components/modules/NotificationsModule';
import { ProfileCustomizationModule } from './components/modules/ProfileCustomizationModule';
import { AndroidApkModal } from './components/common/AndroidApkModal';
import { SsrModule } from './components/modules/SsrModule';

export function App() {
  const [activeScreen, setActiveScreenState] = useState<ActiveScreen>('home');
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const [deviceMode, setDeviceMode] = useState<DeviceFrameMode>('mobile');
  const [showApkModal, setShowApkModal] = useState<boolean>(false);
  const [customization, setCustomization] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );

  // Navigation history stack so Android Back Button / Back Gesture goes to previous menu instead of closing the app
  const historyStackRef = useRef<ActiveScreen[]>(['home']);
  const isHandlingPopStateRef = useRef(false);

  useEffect(() => {
    const handleOpenApk = () => setShowApkModal(true);
    window.addEventListener('gps-open-apk-modal', handleOpenApk);
    return () => window.removeEventListener('gps-open-apk-modal', handleOpenApk);
  }, []);

  const navigateTo = useCallback((nextScreen: ActiveScreen) => {
    setActiveScreenState((prevScreen) => {
      if (prevScreen === nextScreen) return prevScreen;
      if (!isHandlingPopStateRef.current) {
        if (nextScreen === 'home') {
          historyStackRef.current = ['home'];
        } else {
          historyStackRef.current.push(nextScreen);
        }
        try {
          window.history.pushState({ gpsScreen: nextScreen }, '', window.location.pathname);
        } catch {
          // ignore iframe history errors
        }
      }
      return nextScreen;
    });
  }, []);

  const handleGoBack = useCallback(() => {
    if (historyStackRef.current.length > 1) {
      historyStackRef.current.pop();
      const previousScreen =
        historyStackRef.current[historyStackRef.current.length - 1] || 'home';
      setActiveScreenState(previousScreen);
      return;
    }

    setActiveScreenState((current) => {
      const otherSubScreens: ActiveScreen[] = [
        'classes',
        'other_certificate',
        'other_struck_off',
        'other_timetable',
        'other_results',
        'other_exam_1',
        'other_exam_2',
        'other_lesson_plans',
        'other_daily_diary',
      ];
      if (otherSubScreens.includes(current)) {
        historyStackRef.current = ['home', 'other'];
        return 'other';
      }
      historyStackRef.current = ['home'];
      return 'home';
    });
  }, []);

  useEffect(() => {
    StorageService.init();
    // Requirement 2: Automatically initialize GPS Chambai internal storage folder hierarchy on launch
    StorageFolderService.initFolders();

    const refreshCustomization = () => {
      setCustomization(StorageService.getCustomization());
    };
    window.addEventListener('gps-customization-updated', refreshCustomization);

    try {
      window.history.replaceState({ gpsScreen: 'home', rootGuard: true }, '', window.location.pathname);
      window.history.pushState({ gpsScreen: 'home' }, '', window.location.pathname);
    } catch {
      // ignore
    }

    const onPopState = () => {
      isHandlingPopStateRef.current = true;
      if (historyStackRef.current.length > 1) {
        historyStackRef.current.pop();
        const prev = historyStackRef.current[historyStackRef.current.length - 1] || 'home';
        setActiveScreenState(prev);
      } else {
        setActiveScreenState('home');
        historyStackRef.current = ['home'];
      }
      try {
        window.history.pushState(
          { gpsScreen: historyStackRef.current[historyStackRef.current.length - 1] || 'home' },
          '',
          window.location.pathname
        );
      } catch {
        // ignore
      }
      setTimeout(() => {
        isHandlingPopStateRef.current = false;
      }, 50);
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('gps-customization-updated', refreshCustomization);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

  const toggleLanguage = useCallback(() => {
    setLang((l) => (l === 'en' ? 'ur' : 'en'));
  }, []);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'home':
        return <HomeScreen onNavigate={navigateTo} lang={lang} deviceMode={deviceMode} />;
      case 'classes':
        return <ClassModule lang={lang} onNavigate={navigateTo} />;
      case 'admission':
        return <AdmissionModule lang={lang} />;
      case 'staff':
        return <StaffDirectoryModule lang={lang} />;
      case 'books':
      case 'guides':
        return <BooksAndGuidesModule mode="all" lang={lang} />;
      case 'gallery':
        return <GalleryModule lang={lang} />;
      case 'videos':
        return <VideosModule lang={lang} />;
      case 'ptc_fund':
        return <PtcFundModule lang={lang} />;
      case 'search':
        return <GlobalSearchModule onNavigate={navigateTo} lang={lang} />;
      case 'notifications':
        return <NotificationsModule onNavigate={navigateTo} lang={lang} />;
      case 'profile':
        return <ProfileCustomizationModule lang={lang} onToggleLang={toggleLanguage} />;
      case 'other':
        return <OtherDashboard onNavigate={navigateTo} lang={lang} />;
      case 'other_certificate':
        return <CertificateIssueSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_struck_off':
        return <StruckOffSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_exam_1':
        return (
          <SemesterExamSubmodule
            semester="1st Semester Exam"
            onBack={handleGoBack}
            lang={lang}
          />
        );
      case 'other_exam_2':
        return (
          <SemesterExamSubmodule
            semester="2nd Semester Exam"
            onBack={handleGoBack}
            lang={lang}
          />
        );
      case 'other_qr_scanner':
        return <QrScannerSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_attendance':
        return <AttendanceSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_timetable':
        return <TimetableSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_results':
        return <ResultsSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_books_demand':
        return <BooksDemandSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_lesson_plans':
        return <LessonPlansSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_daily_diary':
        return <DailyDiarySubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_ai':
        return <AiPortalSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_office_data':
        return <OfficeDataSubmodule onBack={handleGoBack} lang={lang} />;
      case 'other_backup':
        return <BackupRestoreSubmodule onBack={handleGoBack} lang={lang} />;
      case 'ssr':
        return <SsrModule onBack={handleGoBack} lang={lang} />;
      default:
        return <HomeScreen onNavigate={navigateTo} lang={lang} deviceMode={deviceMode} />;
    }
  };

  const containerWidthClass =
    deviceMode === 'mobile'
      ? 'max-w-[420px] h-[100dvh] md:h-[min(92dvh,740px)] md:my-2 md:rounded-[30px] md:border-[5px] md:border-slate-800 md:shadow-2xl'
      : deviceMode === 'tablet'
      ? 'max-w-[820px] h-[100dvh] md:h-[min(92dvh,780px)] md:my-2 md:rounded-[28px] md:border-[5px] md:border-slate-800 md:shadow-2xl'
      : 'max-w-7xl h-[100dvh]';

  return (
    <div className="min-h-[100dvh] bg-slate-900 flex flex-col items-center justify-center">
      {/* Global Print Preview & PDF/Word Export Modal */}
      <PrintPreviewModal />

      {/* Global GPS Chambai Internal Storage Folder Explorer Modal */}
      <GpsChambaiFolderModal />

      {/* Mobile / Tablet / Full App Container */}
      <div
        className={`w-full ${containerWidthClass} bg-slate-50 flex flex-col overflow-hidden relative transition-all duration-300`}
        style={{
          backgroundImage: customization.appWallpaperUrl
            ? `url(${customization.appWallpaperUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Top Green Navigation Bar (Requirement 4 & Image 014.png) */}
        <Header
          activeScreen={activeScreen}
          onNavigate={navigateTo}
          lang={lang}
          onToggleLang={toggleLanguage}
          deviceMode={deviceMode}
          onChangeDeviceMode={setDeviceMode}
          onOpenApkModal={() => setShowApkModal(true)}
          onOpenFolderModal={() => window.dispatchEvent(new CustomEvent('gps-open-folder-modal'))}
        />

        {/* Global Android APK Download Modal */}
        <AndroidApkModal
          isOpen={showApkModal}
          onClose={() => setShowApkModal(false)}
          lang={lang}
        />

        {/* Quick Back Navigation Bar whenever inside any Menu/Submodule */}
        {activeScreen !== 'home' && (
          <div className="bg-emerald-950/95 text-white px-3.5 py-1.5 flex items-center justify-between border-b border-emerald-800/60 shrink-0">
            <button
              type="button"
              onClick={handleGoBack}
              className="flex items-center gap-1.5 text-xs font-black text-emerald-100 hover:text-white active:scale-95 transition-all"
            >
              <ArrowLeft size={15} className="text-amber-400" />
              <span>{lang === 'ur' ? 'واپس پچھلے مینیو میں (Back)' : 'Back to Previous Menu'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="text-[10px] font-bold text-amber-300 hover:underline"
            >
              {lang === 'ur' ? 'ہوم اسکرین' : 'Home Screen'}
            </button>
          </div>
        )}

        {/* Scrollable Screen Viewport */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {renderScreen()}
        </main>

        {/* Bottom 5-Item Navigation Bar */}
        <BottomNav
          activeScreen={activeScreen}
          onNavigate={navigateTo}
          lang={lang}
        />
      </div>
    </div>
  );
}

export default App;
