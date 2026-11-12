import React, { useState, useEffect, useMemo } from 'react';
import {
  FolderOpen,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Palette,
  Move,
  LayoutGrid,
  List,
} from 'lucide-react';
import {
  ActiveScreen,
  AppCustomizationSettings,
  DeviceFrameMode,
  HomeBottomButtonId,
} from '../../types';
import { StorageService, DEFAULT_CUSTOMIZATION } from '../../services/storage';
import {
  MonoAdmissionsIcon,
  MonoQrAttendanceIcon,
  MonoStaffDataIcon,
  MonoGalleryIcon,
  MonoVideosIcon,
  MonoPdfEbookIcon,
  MonoOthersIcon,
  MonoAiIcon,
  MonoSsrIcon,
  MonoPtcFundIcon,
  MonoOfficeDataIcon,
  MonoBackupIcon,
  RenderModuleIcon,
} from '../common/MonochromeIcons';
import { useViewMode } from '../common/ViewModeToggle';
import { OTHER_CORE_MODULES } from './OtherModule/OtherDashboard';
import {
  HomeCustomizationModal,
  CustomizableCardMeta,
} from './HomeCustomizationModal';

interface HomeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
  deviceMode?: DeviceFrameMode;
}

export interface HomeModuleCardDef {
  id: ActiveScreen;
  customKey: string;
  en: string;
  ur: string;
  desc: string;
  defaultGradientFrom: string;
  defaultGradientTo: string;
  shadowColor: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}

export const HOME_MODULES: HomeModuleCardDef[] = [
  {
    id: 'admission',
    customKey: 'admission',
    en: 'Admission',
    ur: 'داخلہ',
    desc: 'Student & Teacher Admission Records',
    defaultGradientFrom: '#A812FF',
    defaultGradientTo: '#7B09E8',
    shadowColor: 'rgba(139, 12, 238, 0.28)',
    Icon: MonoAdmissionsIcon,
  },
  {
    id: 'other_attendance',
    customKey: 'qr_scanner',
    en: 'QR Scanner',
    ur: 'کیو آر اسکینر',
    desc: 'QR Attendance & Student Verification',
    defaultGradientFrom: '#00D084',
    defaultGradientTo: '#00B87C',
    shadowColor: 'rgba(0, 196, 124, 0.28)',
    Icon: MonoQrAttendanceIcon,
  },
  {
    id: 'staff',
    customKey: 'staff',
    en: 'Staff Data',
    ur: 'اسٹاف ڈیٹا',
    desc: 'Teachers, Documents & Certificates',
    defaultGradientFrom: '#0A48FF',
    defaultGradientTo: '#0066FF',
    shadowColor: 'rgba(6, 82, 255, 0.28)',
    Icon: MonoStaffDataIcon,
  },
  {
    id: 'gallery',
    customKey: 'gallery',
    en: 'Gallery',
    ur: 'گیلری',
    desc: 'School Photos & Videos Media',
    defaultGradientFrom: '#FF8A00',
    defaultGradientTo: '#FF5E00',
    shadowColor: 'rgba(255, 115, 0, 0.28)',
    Icon: MonoGalleryIcon,
  },
  {
    id: 'videos',
    customKey: 'videos',
    en: 'Videos',
    ur: 'ویڈیوز',
    desc: 'Classroom & Event Videos',
    defaultGradientFrom: '#0072FF',
    defaultGradientTo: '#0099FF',
    shadowColor: 'rgba(0, 128, 255, 0.28)',
    Icon: MonoVideosIcon,
  },
  {
    id: 'books',
    customKey: 'books',
    en: 'Books',
    ur: 'کتابیں',
    desc: 'Curriculum & Textbooks Library',
    defaultGradientFrom: '#FF2A00',
    defaultGradientTo: '#FF0800',
    shadowColor: 'rgba(255, 30, 0, 0.28)',
    Icon: MonoPdfEbookIcon,
  },
  {
    id: 'guides',
    customKey: 'guides',
    en: 'Guides',
    ur: 'رہنما کتب',
    desc: 'Teacher Guides & Pedagogical Handbooks',
    defaultGradientFrom: '#059669',
    defaultGradientTo: '#047857',
    shadowColor: 'rgba(5, 150, 105, 0.28)',
    Icon: MonoPdfEbookIcon,
  },
  {
    id: 'other',
    customKey: 'other',
    en: 'Others',
    ur: 'دیگر ریکارڈ',
    desc: 'Class, PTC Fund, Results, Exams & Settings',
    defaultGradientFrom: '#475569',
    defaultGradientTo: '#334155',
    shadowColor: 'rgba(71, 85, 105, 0.28)',
    Icon: MonoOthersIcon,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigate,
  lang,
  deviceMode = 'mobile',
}) => {
  const [customization, setCustomization] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );
  const [viewMode, setViewMode] = useViewMode(
    'home_screen',
    customization.homeViewMode || 'grid'
  );
  const [isRearranging, setIsRearranging] = useState(false);
  const [isCustomizeModalOpen, setIsCustomizeModalOpen] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      const next = StorageService.getCustomization();
      setCustomization(next);
    };
    window.addEventListener('gps-customization-updated', refresh);
    return () => window.removeEventListener('gps-customization-updated', refresh);
  }, []);

  const allCustomizableCardsMeta: CustomizableCardMeta[] = useMemo(
    () => [
      ...HOME_MODULES.map((m) => ({
        id: m.id,
        key: m.customKey,
        group: 'Home Screen' as const,
        defaultEn: m.en,
        defaultUr: m.ur,
        defaultDesc: m.desc,
        defaultFrom: m.defaultGradientFrom,
        defaultTo: m.defaultGradientTo,
        DefaultIcon: m.Icon,
      })),
      ...OTHER_CORE_MODULES.map((m) => ({
        id: m.id,
        key: m.id,
        group: 'Other Module' as const,
        defaultEn: m.en,
        defaultUr: m.ur,
        defaultDesc: m.desc,
        defaultFrom: m.gradientFrom,
        defaultTo: m.gradientTo,
        DefaultIcon: m.Icon,
      })),
    ],
    []
  );

  const orderedModules = useMemo(() => {
    const order = customization.homeCardOrder;
    if (!order || order.length === 0) return HOME_MODULES;
    const map = new Map(HOME_MODULES.map((m) => [m.id, m]));
    const result: HomeModuleCardDef[] = [];
    order.forEach((id) => {
      const item = map.get(id as ActiveScreen);
      if (item) {
        result.push(item);
        map.delete(id as ActiveScreen);
      }
    });
    map.forEach((item) => result.push(item));
    return result;
  }, [customization.homeCardOrder]);

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
      homeCardOrder: nextOrder,
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
      homeCardOrder: nextOrder,
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const handleResetCardOrder = () => {
    const updated: AppCustomizationSettings = {
      ...customization,
      homeCardOrder: HOME_MODULES.map((m) => m.id),
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const handleToggleGridListView = () => {
    const nextMode = viewMode === 'grid' ? 'list' : 'grid';
    setViewMode(nextMode);
    const updated: AppCustomizationSettings = {
      ...customization,
      homeViewMode: nextMode,
    };
    setCustomization(updated);
    StorageService.saveCustomization(updated);
  };

  const cardHeightClass =
    customization.cardSize === 'compact'
      ? 'h-[68px]'
      : customization.cardSize === 'spacious'
      ? 'h-[88px]'
      : 'h-[76px]';

  const customCols = customization.dashboardColumns;
  const gridColsClass =
    viewMode === 'list'
      ? deviceMode === 'full'
        ? 'grid-cols-1 md:grid-cols-2'
        : 'grid-cols-1'
      : customCols === 1
      ? 'grid-cols-1'
      : customCols === 3
      ? 'grid-cols-2 sm:grid-cols-3'
      : customCols === 4
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : deviceMode === 'full'
      ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      : deviceMode === 'tablet'
      ? 'grid-cols-2 sm:grid-cols-3'
      : 'grid-cols-2';

  const isDarkTheme = customization.themeMode === 'dark';
  const wpConfig = customization.wallpaperConfig;
  const homeScreenWallpaperUrl =
    (wpConfig?.targetMode === 'home_screen' && wpConfig?.url) ||
    customization.homeWallpaperUrl ||
    '';

  const bottomButtonsOrder: HomeBottomButtonId[] =
    customization.homeBottomButtonsOrder &&
    customization.homeBottomButtonsOrder.length === 4
      ? customization.homeBottomButtonsOrder
      : DEFAULT_CUSTOMIZATION.homeBottomButtonsOrder!;

  return (
    <div
      className={`relative px-3 pt-2 pb-5 flex flex-col justify-between min-h-full select-none overflow-hidden ${
        isDarkTheme ? 'text-slate-100' : ''
      }`}
      style={{
        backgroundColor: isDarkTheme
          ? '#0f172a'
          : customization.homeBgColor || '#F8FAFC',
      }}
    >
      {/* Optional Home Screen Background Wallpaper Layer with Blur, Brightness & Overlay */}
      {homeScreenWallpaperUrl && (
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src={homeScreenWallpaperUrl}
            alt=""
            style={{
              objectFit: wpConfig?.fit || 'cover',
              filter: `blur(${wpConfig?.blur ?? 0}px) brightness(${wpConfig?.brightness ?? 100}%)`,
              opacity: (wpConfig?.opacity ?? 100) / 100,
            }}
            className="w-full h-full"
          />
          <div
            style={{
              backgroundColor: wpConfig?.overlayColor || '#0f172a',
              opacity: (wpConfig?.overlayOpacity ?? 20) / 100,
            }}
            className="absolute inset-0"
          />
        </div>
      )}

      <div className="relative z-10 flex flex-col gap-2.5">
        {/* School Building Illustration Banner */}
        <div className="relative w-full h-24 sm:h-28 rounded-2xl overflow-hidden border border-slate-300/80 shadow-sm bg-gradient-to-b from-sky-100 via-sky-50 to-amber-50/40 shrink-0">
          <svg
            viewBox="0 0 600 220"
            className="w-full h-full object-cover"
            preserveAspectRatio="xMidYMid slice"
          >
            {/* Sky & Soft Clouds */}
            <rect width="600" height="220" fill="#DDF2FD" />
            <ellipse cx="140" cy="36" rx="55" ry="14" fill="#FFFFFF" opacity="0.85" />
            <ellipse cx="340" cy="28" rx="70" ry="16" fill="#FFFFFF" opacity="0.85" />
            <ellipse cx="480" cy="38" rx="48" ry="12" fill="#FFFFFF" opacity="0.8" />

            {/* Background Green Trees */}
            <circle cx="95" cy="80" r="35" fill="#A3CFA0" opacity="0.65" />
            <circle cx="245" cy="70" r="38" fill="#9BC997" opacity="0.65" />
            <circle cx="385" cy="72" r="40" fill="#A3CFA0" opacity="0.65" />
            <circle cx="495" cy="65" r="36" fill="#95C491" opacity="0.65" />

            {/* Main School Building Roof Band */}
            <polygon points="85,82 470,82 470,104 85,104" fill="#D7B4B2" />
            <polygon points="470,82 595,40 595,72 470,104" fill="#C9A3A1" />

            {/* Main School Facade */}
            <rect x="85" y="104" width="385" height="68" fill="#FDF2E9" />
            <polygon points="470,104 595,72 595,180 470,172" fill="#F5E6DA" />

            {/* Pillars & Veranda Doors */}
            <rect x="98" y="120" width="16" height="52" fill="#C4C4C4" />
            <rect x="195" y="114" width="24" height="58" fill="#8E8E8E" />
            <rect x="242" y="114" width="26" height="58" fill="#8E8E8E" />
            <rect
              x="336"
              y="112"
              width="34"
              height="34"
              fill="#8E8E8E"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
            <line x1="353" y1="112" x2="353" y2="146" stroke="#FFFFFF" strokeWidth="2" />
            <line x1="336" y1="129" x2="370" y2="129" stroke="#FFFFFF" strokeWidth="2" />

            {/* Columns */}
            <rect x="168" y="84" width="8" height="88" fill="#EFE6DD" />
            <rect x="230" y="84" width="8" height="88" fill="#EFE6DD" />
            <rect x="310" y="84" width="8" height="88" fill="#EFE6DD" />
            <rect x="425" y="84" width="8" height="88" fill="#EFE6DD" />

            {/* Pakistan Flag on Roof */}
            <line x1="234" y1="30" x2="234" y2="155" stroke="#888" strokeWidth="2.5" />
            <path d="M234 32 L205 42 L205 60 L234 52 Z" fill="#3B7A57" />
            <rect x="227" y="32" width="7" height="20" fill="#FFFFFF" />
            <circle cx="216" cy="46" r="4.5" fill="#FFFFFF" />
            <circle cx="218" cy="45" r="3.8" fill="#3B7A57" />

            {/* Courtyard & CHAMBAI Plinth */}
            <polygon points="0,172 600,172 600,220 0,220" fill="#ECECEC" />
            <rect
              x="210"
              y="156"
              width="64"
              height="18"
              rx="2"
              fill="#FFF8F0"
              stroke="#DCD3C8"
            />
            <text
              x="242"
              y="168"
              textAnchor="middle"
              fill="#C9968B"
              fontSize="8.5"
              fontWeight="800"
              fontFamily="sans-serif"
            >
              CHAMBAI
            </text>

            {/* Courtyard Round Garden */}
            <ellipse
              cx="220"
              cy="190"
              rx="54"
              ry="11"
              fill="#D5DED3"
              stroke="#C2CBC0"
              strokeWidth="2"
            />
            <circle cx="218" cy="176" r="11" fill="#9CE0A6" />
          </svg>

          {/* School Logo on One Side & Official School Identity on the Other Side */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-emerald-950/95 via-emerald-900/80 to-transparent pt-3 pb-1.5 px-2.5 flex items-center justify-between gap-2">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-lg shrink-0 overflow-hidden flex items-center justify-center">
              <img
                src={
                  customization.customLogoDataUrl ||
                  customization.schoolLogoUrl ||
                  '/assets/aistudio/20260903_200547_79893d25.png'
                }
                alt="GPS Chambai Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <div className="text-right text-white min-w-0 flex-1 drop-shadow-sm">
              <h2 className="text-[11px] sm:text-xs font-black tracking-tight text-white leading-tight truncate">
                Govt. Primary School Chambai Kohat
              </h2>
              <p className="text-[9px] sm:text-[10px] font-extrabold text-amber-300 leading-tight">
                EMIS School Code: 16454 • Circle: Jarma
              </p>
              <p className="text-[8px] sm:text-[9px] font-bold text-emerald-100 leading-tight">
                Elementary &amp; Secondary Education Department, KP
              </p>
            </div>
          </div>
        </div>

        {/* Active Card Movement Banner when MOVE CARD mode is toggled */}
        {isRearranging && (
          <div className="bg-amber-400 text-slate-950 px-3 py-2 rounded-2xl text-xs font-black flex flex-wrap items-center justify-between gap-2 shadow-sm">
            <span>
              Card Move Mode Active: Drag any card or tap the Up / Down arrows to rearrange. Saved automatically!
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleResetCardOrder}
                className="px-2.5 py-1 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Default Order</span>
              </button>
              <button
                type="button"
                onClick={() => setIsRearranging(false)}
                className="px-2.5 py-1 rounded-xl bg-white text-slate-900 text-[10px] font-black"
              >
                Done
              </button>
            </div>
          </div>
        )}

        {/* Home Module Cards (Grid or List View) */}
        <div
          className={`grid ${gridColsClass}`}
          style={{ gap: `${customization.cardSpacing ?? 12}px` }}
        >
          {orderedModules.map((mod, idx) => {
            const adv = customization.cardAdvancedConfigs?.[mod.customKey] || {};
            const customName = customization.cardCustomNames?.[mod.customKey];
            const displayEn = customName?.en?.trim() || mod.en;
            const displayUr = customName?.ur?.trim() || mod.ur;
            const displayDesc = customName?.desc?.trim() || mod.desc;

            const fromCol =
              adv.gradientFrom ||
              customization.cardColors?.[mod.customKey] ||
              mod.defaultGradientFrom;
            const midCol = adv.gradientMid || '#10b981';
            const toCol =
              adv.gradientTo ||
              customization.cardGradientToColors?.[mod.customKey] ||
              mod.defaultGradientTo;
            const solidCol =
              adv.solidColor ||
              customization.cardColors?.[mod.customKey] ||
              mod.defaultGradientFrom;
            const angle = adv.gradientAngle ?? 135;
            const colorMode = adv.colorMode || 'gradient2';

            let backgroundValue = `linear-gradient(${angle}deg, ${fromCol} 0%, ${toCol} 100%)`;
            if (colorMode === 'solid') {
              backgroundValue = solidCol;
            } else if (colorMode === 'gradient3') {
              backgroundValue =
                adv.gradientType === 'radial'
                  ? `radial-gradient(circle, ${fromCol} 0%, ${midCol} 50%, ${toCol} 100%)`
                  : `linear-gradient(${angle}deg, ${fromCol} 0%, ${midCol} 50%, ${toCol} 100%)`;
            } else if (adv.gradientType === 'radial') {
              backgroundValue = `radial-gradient(circle, ${fromCol} 0%, ${toCol} 100%)`;
            }

            const customBorderColor =
              customization.cardBorderColors?.[mod.customKey] || 'rgba(255,255,255,0.28)';
            const customTextColor = customization.cardTextColors?.[mod.customKey] || '#FFFFFF';
            const borderWidth = customization.cardBorderWidth ?? 1;
            const shadowSetting = adv.shadow || customization.cardShadow || 'md';
            const boxShadowValue =
              shadowSetting === 'none'
                ? 'none'
                : shadowSetting === 'sm'
                ? `0 2px 6px -1px ${mod.shadowColor}`
                : shadowSetting === 'lg'
                ? `0 12px 24px -4px ${mod.shadowColor}, inset 0 1px 1px rgba(255,255,255,0.35)`
                : shadowSetting === 'xl'
                ? `0 16px 32px -4px ${mod.shadowColor}, inset 0 1px 2px rgba(255,255,255,0.45)`
                : `0 8px 18px -4px ${mod.shadowColor}, inset 0 1px 1px rgba(255,255,255,0.35)`;

            const radiusPx = adv.borderRadius ?? customization.cardBorderRadius ?? 16;
            const cardOpacity = (adv.cardOpacity ?? 100) / 100;

            const bgStyle: React.CSSProperties = {
              background: backgroundValue,
              boxShadow: boxShadowValue,
              borderRadius: `${radiusPx}px`,
              borderWidth: `${borderWidth}px`,
              borderStyle: 'solid',
              borderColor: customBorderColor,
              color: customTextColor,
              opacity: cardOpacity,
            };

            // Determine if this card has an individual picture OR a shared wallpaper
            const hasCardWallpaper =
              wpConfig?.url &&
              (wpConfig.targetMode === 'all_cards' ||
                (wpConfig.targetMode === 'selected_cards' &&
                  (wpConfig.selectedCardKeys || []).includes(mod.customKey)));
            const cardPictureSrc =
              adv.pictureUrl || (hasCardWallpaper ? wpConfig?.url : '');
            const cardPicFit = adv.pictureUrl
              ? adv.pictureFit || 'cover'
              : wpConfig?.fit || 'cover';
            const cardPicPos = adv.picturePosition || 'center';
            const cardPicOpacity = adv.pictureUrl
              ? (adv.pictureOpacity ?? 100) / 100
              : (wpConfig?.opacity ?? 100) / 100;
            const cardOverlayCol = adv.pictureUrl
              ? adv.overlayColor || '#000000'
              : wpConfig?.overlayColor || '#0f172a';
            const cardOverlayOp = adv.pictureUrl
              ? (adv.overlayOpacity ?? 35) / 100
              : (wpConfig?.overlayOpacity ?? 25) / 100;

            const iconSizePx =
              adv.customIconSize || Math.min(customization.iconSize || 20, 28);
            const iconBadgeBg = adv.iconBgColor || '#ffffff';
            const iconBadgeOp = (adv.iconBgOpacity ?? 95) / 100;
            const iconAlignment = adv.iconAlignment || 'left';

            const isBeingDragged = draggedId === mod.id;
            const isDragTarget = dragOverId === mod.id && draggedId !== mod.id;

            const renderCardPictureLayer = () =>
              cardPictureSrc ? (
                <>
                  <img
                    src={cardPictureSrc}
                    alt=""
                    style={{
                      objectFit: cardPicFit,
                      objectPosition: cardPicPos,
                      opacity: cardPicOpacity,
                      filter:
                        !adv.pictureUrl && hasCardWallpaper
                          ? `blur(${wpConfig?.blur ?? 0}px) brightness(${wpConfig?.brightness ?? 100}%)`
                          : undefined,
                    }}
                    className="absolute inset-0 w-full h-full pointer-events-none z-0"
                  />
                  <div
                    style={{
                      backgroundColor: cardOverlayCol,
                      opacity: cardOverlayOp,
                    }}
                    className="absolute inset-0 pointer-events-none z-0"
                  />
                </>
              ) : null;

            if (viewMode === 'list') {
              return (
                <div
                  key={mod.id}
                  draggable
                  onDragStart={() => setDraggedId(mod.id)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOverId(mod.id);
                  }}
                  onDragEnd={() => {
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedId) handleReorderModules(draggedId, mod.id);
                    setDraggedId(null);
                    setDragOverId(null);
                  }}
                  className={`relative transition-all ${
                    isBeingDragged ? 'opacity-60 scale-95' : ''
                  } ${isDragTarget ? 'ring-2 ring-amber-400 rounded-2xl' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (!isRearranging) onNavigate(mod.id);
                    }}
                    style={bgStyle}
                    className="group relative w-full h-[64px] overflow-hidden px-3 py-2 flex items-center justify-between gap-3 text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] focus:outline-none"
                  >
                    {renderCardPictureLayer()}
                    <div className="relative z-10 flex items-center gap-3 min-w-0">
                      <div
                        style={{
                          backgroundColor: iconBadgeBg,
                          opacity: iconBadgeOp,
                        }}
                        className="w-10 h-10 rounded-xl shadow-sm flex items-center justify-center border border-black/5 shrink-0"
                      >
                        <RenderModuleIcon
                          moduleKey={mod.customKey}
                          DefaultIcon={mod.Icon}
                          size={iconSizePx}
                          className="text-black"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm font-black tracking-tight truncate ${
                              lang === 'ur' ? 'font-urdu' : ''
                            }`}
                            style={{ color: customTextColor }}
                          >
                            {lang === 'ur' ? displayUr : displayEn}
                          </span>
                          <span
                            className="text-[11px] font-bold bg-black/20 px-2 py-0.5 rounded-full font-urdu"
                            style={{
                              color: customTextColor,
                              fontFamily:
                                "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            }}
                          >
                            {displayUr}
                          </span>
                        </div>
                        <p
                          className="text-[11px] font-semibold opacity-90 truncate"
                          style={{ color: customTextColor }}
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
                          className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-white"
                          title="Move Up"
                        >
                          <ArrowUp size={13} />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => handleMoveIndex(idx, 1)}
                          className="p-1.5 rounded-lg bg-black/35 hover:bg-black/55 text-white"
                          title="Move Down"
                        >
                          <ArrowDown size={13} />
                        </span>
                      </div>
                    ) : (
                      <ChevronRight size={18} className="opacity-85 shrink-0 relative z-10" />
                    )}
                  </button>
                </div>
              );
            }

            return (
              <div
                key={mod.id}
                draggable
                onDragStart={() => setDraggedId(mod.id)}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverId(mod.id);
                }}
                onDragEnd={() => {
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  if (draggedId) handleReorderModules(draggedId, mod.id);
                  setDraggedId(null);
                  setDragOverId(null);
                }}
                className={`relative transition-all ${
                  isBeingDragged ? 'opacity-60 scale-95' : ''
                } ${isDragTarget ? 'ring-2 ring-amber-400 rounded-2xl' : ''}`}
              >
                <button
                  type="button"
                  onClick={() => {
                    if (!isRearranging) onNavigate(mod.id);
                  }}
                  style={bgStyle}
                  className={`group relative w-full ${cardHeightClass} overflow-hidden px-2.5 py-2 flex flex-col justify-between text-left transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.96] focus:outline-none`}
                >
                  {renderCardPictureLayer()}

                  {!cardPictureSrc && (
                    <svg
                      viewBox="0 0 220 110"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M-10,75 C60,40 130,95 230,30 L230,120 L-10,120 Z"
                        fill="rgba(255,255,255,0.13)"
                      />
                      <path
                        d="M70,-10 C115,45 155,75 230,90 L230,-10 Z"
                        fill="rgba(255,255,255,0.10)"
                      />
                      <circle cx="152" cy="26" r="2" fill="rgba(255,255,255,0.85)" />
                      <circle cx="135" cy="40" r="1.6" fill="rgba(255,255,255,0.75)" />
                      <path
                        d="M172 18 L174 23 L179 25 L174 27 L172 32 L170 27 L165 25 L170 23 Z"
                        fill="rgba(255,255,255,0.85)"
                      />
                      <path
                        d="M24 72 L25.2 75 L28.2 76.2 L25.2 77.4 L24 80.4 L22.8 77.4 L19.8 76.2 L22.8 75 Z"
                        fill="rgba(255,255,255,0.8)"
                      />
                    </svg>
                  )}

                  {/* Top Row: Icon Badge + Urdu Title */}
                  <div
                    className={`relative z-10 flex items-center w-full ${
                      iconAlignment === 'center'
                        ? 'justify-center gap-2'
                        : iconAlignment === 'right'
                        ? 'flex-row-reverse justify-between'
                        : 'justify-between'
                    }`}
                  >
                    <div
                      style={{
                        backgroundColor: iconBadgeBg,
                        opacity: iconBadgeOp,
                      }}
                      className="w-8 h-8 rounded-lg shadow-sm flex items-center justify-center border border-black/5 group-hover:scale-105 transition-transform shrink-0"
                    >
                      <RenderModuleIcon
                        moduleKey={mod.customKey}
                        DefaultIcon={mod.Icon}
                        size={iconSizePx}
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
                          className="p-1 rounded-md bg-black/40 hover:bg-black/60 text-white"
                          title="Move Left / Up"
                        >
                          <ArrowUp size={11} />
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={() => handleMoveIndex(idx, 1)}
                          className="p-1 rounded-md bg-black/40 hover:bg-black/60 text-white"
                          title="Move Right / Down"
                        >
                          <ArrowDown size={11} />
                        </span>
                      </div>
                    ) : (
                      <span
                        className="text-[10px] font-bold bg-black/20 backdrop-blur-xs px-1.5 py-0.5 rounded-full truncate max-w-[95px] font-urdu"
                        style={{
                          color: customTextColor,
                          fontFamily:
                            "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                        }}
                      >
                        {displayUr}
                      </span>
                    )}
                  </div>

                  {/* Bottom Row: Module Name inside card */}
                  <div
                    className={`relative z-10 w-full ${
                      iconAlignment === 'center'
                        ? 'text-center'
                        : iconAlignment === 'right'
                        ? 'text-right'
                        : 'text-left'
                    }`}
                  >
                    <span
                      className={`block text-xs sm:text-[13px] font-black tracking-tight leading-tight truncate drop-shadow-xs ${
                        lang === 'ur' ? 'font-urdu' : ''
                      }`}
                      style={{
                        color: customTextColor,
                        fontFamily:
                          lang === 'ur'
                            ? "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif"
                            : undefined,
                      }}
                    >
                      {lang === 'ur' ? displayUr : displayEn}
                    </span>
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= PART 2 — HOME SCREEN BOTTOM CONTROL BAR ================= */}
      <div className="relative z-10 mt-3 pt-2.5 border-t border-slate-200/80">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl p-1.5 border border-slate-200 shadow-md grid grid-cols-4 gap-1.5">
          {bottomButtonsOrder.map((btnId) => {
            const cfg =
              customization.homeBottomButtonsConfig?.[btnId] ||
              DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig![btnId];
            const isMoveActive = btnId === 'move_card' && isRearranging;
            const bgVal = isMoveActive
              ? '#f59e0b'
              : cfg.useGradient
              ? `linear-gradient(135deg, ${cfg.bgColor} 0%, ${cfg.gradientTo || cfg.bgColor} 100%)`
              : cfg.bgColor;
            const txtCol = isMoveActive ? '#0f172a' : cfg.textColor || '#ffffff';
            const radius = cfg.borderRadius ?? 14;
            const pyClass =
              cfg.size === 'compact'
                ? 'py-1.5 px-1.5'
                : cfg.size === 'large'
                ? 'py-2.5 px-2'
                : 'py-2 px-1.5';

            const renderBtnIcon = () => {
              if (cfg.customIconUrl) {
                return (
                  <img
                    src={cfg.customIconUrl}
                    alt=""
                    className="w-4 h-4 object-contain shrink-0"
                  />
                );
              }
              switch (btnId) {
                case 'storage':
                  return <FolderOpen size={14} className="shrink-0" />;
                case 'move_card':
                  return <Move size={14} className="shrink-0" />;
                case 'view_mode':
                  return viewMode === 'grid' ? (
                    <List size={14} className="shrink-0" />
                  ) : (
                    <LayoutGrid size={14} className="shrink-0" />
                  );
                case 'customize':
                  return <Palette size={14} className="shrink-0" />;
              }
            };

            const handleButtonClick = () => {
              if (btnId === 'storage') {
                window.dispatchEvent(new CustomEvent('gps-open-folder-modal'));
              } else if (btnId === 'move_card') {
                setIsRearranging((prev) => !prev);
              } else if (btnId === 'view_mode') {
                handleToggleGridListView();
              } else if (btnId === 'customize') {
                setIsCustomizeModalOpen(true);
              }
            };

            const dynamicLabel =
              btnId === 'view_mode'
                ? lang === 'ur'
                  ? viewMode === 'grid'
                    ? 'لسٹ ویو'
                    : 'گرڈ ویو'
                  : viewMode === 'grid'
                  ? 'LIST VIEW'
                  : 'GRID VIEW'
                : btnId === 'move_card' && isRearranging
                ? lang === 'ur'
                  ? 'مکمل'
                  : 'DONE MOVE'
                : lang === 'ur'
                ? cfg.labelUr || cfg.labelEn
                : cfg.labelEn;

            return (
              <button
                key={btnId}
                type="button"
                onClick={handleButtonClick}
                style={{
                  background: bgVal,
                  color: txtCol,
                  borderRadius: `${radius}px`,
                }}
                className={`${pyClass} flex flex-col sm:flex-row items-center justify-center gap-1 font-black text-[9.5px] sm:text-[11px] leading-tight text-center shadow-xs hover:opacity-95 active:scale-95 transition-all overflow-hidden`}
              >
                {renderBtnIcon()}
                {cfg.showLabel !== false && (
                  <span className="truncate max-w-full">{dynamicLabel}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= PART 3 — COMPLETE HOME SCREEN CUSTOMIZATION MODAL ================= */}
      <HomeCustomizationModal
        isOpen={isCustomizeModalOpen}
        onClose={() => setIsCustomizeModalOpen(false)}
        lang={lang}
        cardsMeta={allCustomizableCardsMeta}
        onCustomizationApplied={(updated) => setCustomization(updated)}
      />
    </div>
  );
};
