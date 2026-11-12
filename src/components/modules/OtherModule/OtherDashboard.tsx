import React, { useState, useEffect } from 'react';
import {
  ChevronRight,
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Download,
  Smartphone,
  FolderArchive,
} from 'lucide-react';
import { ActiveScreen, AppCustomizationSettings } from '../../../types';
import { StorageService } from '../../../services/storage';
import { usePWAInstall } from '../../../hooks/usePWAInstall';
import { DEFAULT_APK_BUILD_MANIFEST } from '../../../data/apkBuildManifest';
import {
  MonoStudentsIcon,
  MonoCertificateIcon,
  MonoStruckOffIcon,
  MonoTimetableIcon,
  MonoStudentCardIcon,
  MonoExamIcon,
  MonoBooksDemandsIcon,
  MonoLessonPlansIcon,
  RenderModuleIcon,
} from '../../common/MonochromeIcons';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';

interface OtherDashboardProps {
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
}

export interface OtherCardItem {
  id: ActiveScreen;
  en: string;
  ur: string;
  desc: string;
  gradientFrom: string;
  gradientTo: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}

export const OTHER_CORE_MODULES: OtherCardItem[] = [
  {
    id: 'classes',
    en: 'Class',
    ur: 'کلاسز',
    desc: 'KG/Kachi to Class 5 Records, Photos & PDF',
    gradientFrom: '#00B050',
    gradientTo: '#059669',
    Icon: MonoStudentsIcon,
  },
  {
    id: 'ptc_fund',
    en: 'PTC Fund & Council',
    ur: 'پی ٹی سی فنڈ اور کونسل',
    desc: 'Capitation, Consumable & Financial Balance',
    gradientFrom: '#2563EB',
    gradientTo: '#1D4ED8',
    Icon: MonoCertificateIcon,
  },
  {
    id: 'other_certificate',
    en: 'Certificate Issue',
    ur: 'سرٹیفکیٹ اجراء',
    desc: 'Official School Leaving Certificate (EMIS 16454)',
    gradientFrom: '#7C3AED',
    gradientTo: '#6D28D9',
    Icon: MonoCertificateIcon,
  },
  {
    id: 'other_struck_off',
    en: 'Struck Off',
    ur: 'خارج شدہ طلباء',
    desc: 'Active Re-Admission & Deactive Register',
    gradientFrom: '#E11D48',
    gradientTo: '#BE123C',
    Icon: MonoStruckOffIcon,
  },
  {
    id: 'other_timetable',
    en: 'Time Table',
    ur: 'ٹائم ٹیبل',
    desc: 'Day | 7 Periods | Teacher & Subject',
    gradientFrom: '#0284C7',
    gradientTo: '#0369A1',
    Icon: MonoTimetableIcon,
  },
  {
    id: 'other_results',
    en: 'Result',
    ur: 'نتائج اور ڈی ایم سی',
    desc: '1st & 2nd Report Card (DMC) JPG/Print',
    gradientFrom: '#D97706',
    gradientTo: '#B45309',
    Icon: MonoStudentCardIcon,
  },
  {
    id: 'other_exam_1',
    en: '1st Semester Exam',
    ur: 'فرسٹ سمسٹر امتحانات',
    desc: '1st Semester Examination Paper Generator',
    gradientFrom: '#0D9488',
    gradientTo: '#0F766E',
    Icon: MonoExamIcon,
  },
  {
    id: 'other_exam_2',
    en: '2nd Semester Exam',
    ur: 'سیکنڈ سمسٹر امتحانات',
    desc: '2nd Semester Examination Paper Generator',
    gradientFrom: '#059669',
    gradientTo: '#047857',
    Icon: MonoExamIcon,
  },
  {
    id: 'other_lesson_plans',
    en: 'Lesson Plans',
    ur: 'اسباق کی منصوبہ بندی',
    desc: 'DCTE Teacher Lesson Plans (Print/PDF/Doc)',
    gradientFrom: '#0891B2',
    gradientTo: '#0E7490',
    Icon: MonoLessonPlansIcon,
  },
  {
    id: 'other_daily_diary',
    en: 'Student Daily Diary',
    ur: 'طلبہ کی روزمرہ ڈائری',
    desc: 'Daily Classwork, Homework & Parent Alert',
    gradientFrom: '#8B5CF6',
    gradientTo: '#7C3AED',
    Icon: MonoBooksDemandsIcon,
  },
  {
    id: 'other_backup',
    en: 'Backup & Restore',
    ur: 'بیک اپ اور بحالی',
    desc: 'Full JSON Database Export & Restore',
    gradientFrom: '#1E293B',
    gradientTo: '#0F172A',
    Icon: MonoBooksDemandsIcon,
  },
];

export const OtherDashboard: React.FC<OtherDashboardProps> = ({ onNavigate, lang }) => {
  const [viewMode, setViewMode] = useViewMode('other_dashboard', 'grid');
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [customization, setCustomization] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );
  const [isRearranging, setIsRearranging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => setCustomization(StorageService.getCustomization());
    window.addEventListener('gps-customization-updated', refresh);
    return () => {
      window.removeEventListener('gps-customization-updated', refresh);
    };
  }, []);

  const orderedModules = React.useMemo(() => {
    const order = customization.otherCardOrder;
    if (!order || order.length === 0) return OTHER_CORE_MODULES;
    const map = new Map(OTHER_CORE_MODULES.map((m) => [m.id, m]));
    const result: OtherCardItem[] = [];
    order.forEach((id) => {
      const item = map.get(id as ActiveScreen);
      if (item) {
        result.push(item);
        map.delete(id as ActiveScreen);
      }
    });
    map.forEach((item) => result.push(item));
    return result;
  }, [customization.otherCardOrder]);

  const handleReorderModules = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const currentOrder = orderedModules.map((m) => m.id);
    const fromIdx = currentOrder.indexOf(fromId as ActiveScreen);
    const toIdx = currentOrder.indexOf(toId as ActiveScreen);
    if (fromIdx < 0 || toIdx < 0) return;
    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(fromIdx, 1);
    nextOrder.splice(toIdx, 0, moved);
    const updated: AppCustomizationSettings = {
      ...customization,
      otherCardOrder: nextOrder,
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const handleMoveIndex = (idx: number, direction: -1 | 1) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= orderedModules.length) return;
    const currentOrder = orderedModules.map((m) => m.id);
    const nextOrder = [...currentOrder];
    const [moved] = nextOrder.splice(idx, 1);
    nextOrder.splice(targetIdx, 0, moved);
    const updated: AppCustomizationSettings = {
      ...customization,
      otherCardOrder: nextOrder,
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const handleResetOrder = () => {
    const updated: AppCustomizationSettings = {
      ...customization,
      otherCardOrder: OTHER_CORE_MODULES.map((m) => m.id),
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const customCols = customization.dashboardColumns;
  const gridColsClass =
    viewMode === 'list'
      ? 'grid-cols-1'
      : customCols === 1
      ? 'grid-cols-1'
      : customCols === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : customCols === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-2';

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in select-none">
      {/* Header with Title "Other Data" & View Mode Toggle */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
            GPS Chambai Management Suite
          </span>
          <h2 className="text-xl font-black tracking-tight mt-0.5">
            {lang === 'ur' ? 'دیگر ڈیٹا (Other Data)' : 'Other Data'}
          </h2>
          <p className="text-xs text-slate-300 font-semibold">
            Class, Certificate Issue, Struck Off, Time Table, Result DMC, Examination &amp; Lesson Plans
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsRearranging((prev) => !prev)}
            className={`px-2.5 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all ${
              isRearranging
                ? 'bg-amber-400 text-slate-950'
                : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
            }`}
          >
            <GripVertical size={13} />
            <span>{isRearranging ? 'Done Moving' : lang === 'ur' ? 'کارڈ ترتیب' : 'Move Cards'}</span>
          </button>
          {isRearranging && (
            <button
              type="button"
              onClick={handleResetOrder}
              className="px-2 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black flex items-center gap-1"
            >
              <RotateCcw size={12} />
              <span>Reset</span>
            </button>
          )}
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
        </div>
      </div>

      {/* Native Kotlin Android APK & Install App Card */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-900 text-white rounded-3xl p-4 shadow-lg border border-amber-400/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 shadow-md">
            <Smartphone size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-widest bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-400/30">
                Kotlin Android APK • v{DEFAULT_APK_BUILD_MANIFEST.currentVersionName} ({DEFAULT_APK_BUILD_MANIFEST.apkFileSizeFormatted})
              </span>
              <span className="text-[10px] font-bold text-emerald-300 font-mono">
                /app-release.apk • /GPS_Chambai_v{DEFAULT_APK_BUILD_MANIFEST.currentVersionName}.apk
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-black mt-1">
              {lang === 'ur'
                ? 'اینڈرائیڈ ایپ انسٹال اور اے پی کے ڈاؤن لوڈ (Kotlin Native + APK)'
                : 'Native Kotlin Android App Install & APK Download'}
            </h3>
            <p className="text-[11px] text-emerald-100/90 font-semibold">
              {lang === 'ur'
                ? 'فائل ایکسپلورر (Code Section) اور ڈائریکٹ بٹن سے فوری APK انسٹال کریں'
                : 'Available directly in Code File Explorer (/app-release.apk, /build-outputs/app-debug.apk) & 1-Click Install'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {isInstallable && !isInstalled && (
            <button
              type="button"
              onClick={() => promptInstall()}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Smartphone size={14} className="text-emerald-700" />
              <span>{lang === 'ur' ? 'فوری انسٹال (Install)' : 'Install App Now'}</span>
            </button>
          )}
          <a
            href={DEFAULT_APK_BUILD_MANIFEST.latestApkDownloadUrl}
            download={DEFAULT_APK_BUILD_MANIFEST.latestApkFileName}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>
              {lang === 'ur'
                ? `ڈاؤن لوڈ APK (v${DEFAULT_APK_BUILD_MANIFEST.currentVersionName})`
                : `Download APK (v${DEFAULT_APK_BUILD_MANIFEST.currentVersionName})`}
            </span>
          </a>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('gps-open-apk-modal'))}
            className="px-3 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-black text-xs flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <FolderArchive size={14} className="text-amber-300" />
            <span>{lang === 'ur' ? 'تمام بلڈز اور کوڈ' : 'APK & Kotlin ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Module Cards in Grid or List Mode */}
      <div className={`grid ${gridColsClass} gap-3.5`}>
        {orderedModules.map((card, idx) => {
          const customName = customization.cardCustomNames?.[card.id];
          const displayEn = customName?.en?.trim() || card.en;
          const displayUr = customName?.ur?.trim() || card.ur;
          const displayDesc = customName?.desc?.trim() || card.desc;

          const customFrom = customization.cardColors?.[card.id] || card.gradientFrom;
          const customTo = customization.cardGradientToColors?.[card.id] || card.gradientTo;
          const customBorder =
            customization.cardBorderColors?.[card.id] || 'rgba(255,255,255,0.2)';
          const customText = customization.cardTextColors?.[card.id] || '#FFFFFF';

          const cardStyle: React.CSSProperties = {
            background: `linear-gradient(135deg, ${customFrom} 0%, ${customTo} 100%)`,
            borderRadius: `${customization.cardBorderRadius ?? 16}px`,
            borderWidth: `${customization.cardBorderWidth ?? 1}px`,
            borderStyle: 'solid',
            borderColor: customBorder,
            color: customText,
          };

          if (viewMode === 'list') {
            return (
              <div
                key={card.id}
                draggable
                onDragStart={() => setDraggedId(card.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(card.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) handleReorderModules(draggedId, card.id);
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={dragOverId === card.id ? 'ring-2 ring-amber-400 rounded-2xl' : ''}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isRearranging) onNavigate(card.id);
                  }}
                  style={cardStyle}
                  className="group relative w-full p-3.5 text-left shadow-md hover:-translate-y-0.5 active:scale-[0.98] transition-all overflow-hidden flex items-center justify-between gap-3"
                >
                  <div className="relative z-10 flex items-center gap-3 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                      <RenderModuleIcon
                        moduleKey={card.id}
                        DefaultIcon={card.Icon}
                        size={customization.iconSize || 24}
                        className="text-black"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className={`text-sm font-black leading-tight truncate ${
                            lang === 'ur' ? 'font-urdu' : ''
                          }`}
                          style={{
                            color: customText,
                            fontFamily:
                              lang === 'ur'
                                ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif"
                                : undefined,
                          }}
                        >
                          {lang === 'ur' ? displayUr : displayEn}
                        </h3>
                        <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded-full">
                          0{idx + 1}
                        </span>
                      </div>
                      <p
                        className="text-xs font-semibold opacity-90 truncate mt-0.5"
                        style={{ color: customText }}
                      >
                        {displayDesc}
                      </p>
                    </div>
                  </div>
                  {isRearranging ? (
                    <div
                      className="relative z-20 flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMoveIndex(idx, -1)}
                        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white"
                      >
                        <ArrowUp size={13} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMoveIndex(idx, 1)}
                        className="p-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-white"
                      >
                        <ArrowDown size={13} />
                      </span>
                    </div>
                  ) : (
                    <ChevronRight size={18} className="opacity-90 shrink-0 relative z-10" />
                  )}
                </button>
              </div>
            );
          }

          return (
            <div
              key={card.id}
              draggable
              onDragStart={() => setDraggedId(card.id)}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOverId(card.id);
              }}
              onDragEnd={() => {
                setDraggedId(null);
                setDragOverId(null);
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedId) handleReorderModules(draggedId, card.id);
                setDraggedId(null);
                setDragOverId(null);
              }}
              className={dragOverId === card.id ? 'ring-2 ring-amber-400 rounded-2xl' : ''}
            >
              <button
                type="button"
                onClick={() => {
                  if (!isRearranging) onNavigate(card.id);
                }}
                style={cardStyle}
                className="group relative w-full p-3.5 text-left shadow-md hover:-translate-y-0.5 active:scale-95 transition-all overflow-hidden flex flex-col justify-between min-h-[104px]"
              >
                {/* Decorative Wave */}
                <svg
                  viewBox="0 0 200 100"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M-10,70 C60,35 130,90 210,25 L210,110 L-10,110 Z"
                    fill="rgba(255,255,255,0.12)"
                  />
                </svg>

                <div className="relative z-10 flex items-center justify-between w-full">
                  <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0">
                    <RenderModuleIcon
                      moduleKey={card.id}
                      DefaultIcon={card.Icon}
                      size={customization.iconSize || 23}
                      className="text-black"
                    />
                  </div>
                  {isRearranging ? (
                    <div
                      className="flex items-center gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMoveIndex(idx, -1)}
                        className="p-1 rounded-md bg-black/35 text-white"
                      >
                        <ArrowUp size={11} />
                      </span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => handleMoveIndex(idx, 1)}
                        className="p-1 rounded-md bg-black/35 text-white"
                      >
                        <ArrowDown size={11} />
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black bg-black/20 px-2 py-0.5 rounded-full">
                      0{idx + 1}
                    </span>
                  )}
                </div>

                <div className="relative z-10 mt-2">
                  <h3
                    className={`text-sm font-black leading-tight truncate ${
                      lang === 'ur' ? 'font-urdu' : ''
                    }`}
                    style={{
                      color: customText,
                      fontFamily:
                        lang === 'ur'
                          ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif"
                          : undefined,
                    }}
                  >
                    {lang === 'ur' ? displayUr : displayEn}
                  </h3>
                  <p
                    className="text-[10px] font-semibold opacity-85 truncate mt-0.5"
                    style={{ color: customText }}
                  >
                    {displayDesc}
                  </p>
                </div>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

