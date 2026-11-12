import React, { useState, useRef } from 'react';
import {
  Palette,
  Save,
  RotateCcw,
  X,
  Upload,
  FolderOpen,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  GripVertical,
  Image as ImageIcon,
  Type as TypeIcon,
  LayoutGrid,
  Sparkles,
  Sliders,
  FileCode,
  CheckCircle2,
  Trash2,
  Search,
  AlertTriangle,
  Move,
  Eye,
} from 'lucide-react';
import {
  AppCustomizationSettings,
  CustomCardAdvancedConfig,
  HomeBottomButtonId,
  HomeBottomButtonConfig,
  SupportedFileFormatKey,
  Language,
} from '../../types';
import { StorageService, DEFAULT_CUSTOMIZATION } from '../../services/storage';
import { BUILT_IN_ICON_LIBRARY, RenderModuleIcon } from '../common/MonochromeIcons';
import {
  ALL_SUPPORTED_FILE_FORMATS,
  FileFormatIcon,
} from '../common/FileFormatIcon';
import { pickImageFromAndroidOrWeb } from '../../utils/androidPhotoPicker';
import { StorageFolderService } from '../../services/storageFolderService';
import { GpsChambaiFolderModal } from '../common/GpsChambaiFolderModal';

export interface CustomizableCardMeta {
  id: string;
  key: string;
  group: 'Home Screen' | 'Other Module';
  defaultEn: string;
  defaultUr: string;
  defaultDesc: string;
  defaultFrom: string;
  defaultTo: string;
  DefaultIcon: React.FC<{ size?: number; className?: string }>;
}

interface HomeCustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  cardsMeta: CustomizableCardMeta[];
  onCustomizationApplied: (next: AppCustomizationSettings) => void;
}

type CustomizeTabId =
  | 'movement'
  | 'colors'
  | 'renaming'
  | 'pictures'
  | 'wallpaper'
  | 'buttons'
  | 'card_icons'
  | 'file_icons';

export const HomeCustomizationModal: React.FC<HomeCustomizationModalProps> = ({
  isOpen,
  onClose,
  lang,
  cardsMeta,
  onCustomizationApplied,
}) => {
  const [draft, setDraft] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );
  const [activeTab, setActiveTab] = useState<CustomizeTabId>('colors');
  const [selectedCardKey, setSelectedCardKey] = useState<string>(
    cardsMeta[0]?.key || 'admission'
  );
  const [selectedButtonId, setSelectedButtonId] = useState<HomeBottomButtonId>('storage');
  const [selectedFormatKey, setSelectedFormatKey] = useState<SupportedFileFormatKey>('PDF');
  const [iconSearch, setIconSearch] = useState('');
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [confirmResetAll, setConfirmResetAll] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Storage Picker Modal State
  const [storagePickerOpen, setStoragePickerOpen] = useState(false);
  const [storagePickerCallback, setStoragePickerCallback] = useState<
    ((dataUrl: string) => void) | null
  >(null);

  const fallbackFileInputRef = useRef<HTMLInputElement>(null);
  const pendingFallbackCallbackRef = useRef<((dataUrl: string) => void) | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  const openStorageImagePicker = (cb: (dataUrl: string) => void) => {
    setStoragePickerCallback(() => cb);
    setStoragePickerOpen(true);
  };

  const pickGalleryImage = async (
    cb: (dataUrl: string) => void,
    options?: { maxWidth?: number; maxHeight?: number }
  ) => {
    pendingFallbackCallbackRef.current = cb;
    const res = await pickImageFromAndroidOrWeb({
      maxWidth: options?.maxWidth || 1000,
      maxHeight: options?.maxHeight || 1000,
      quality: 0.88,
      fallbackInputRef: fallbackFileInputRef,
    });
    if (res?.dataUrl) {
      cb(res.dataUrl);
      await StorageFolderService.saveDataUrlFile(
        'GPS Chambai/Gallery',
        `Custom_Asset_${Date.now()}.jpg`,
        res.dataUrl,
        'image/jpeg',
        'Home Customization'
      );
    }
  };

  const handleFallbackInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string' && pendingFallbackCallbackRef.current) {
        pendingFallbackCallbackRef.current(reader.result);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const activeCardMeta =
    cardsMeta.find((c) => c.key === selectedCardKey) || cardsMeta[0];

  const getCardAdv = (key: string): CustomCardAdvancedConfig => {
    return draft.cardAdvancedConfigs?.[key] || {};
  };

  const updateCardAdv = (key: string, patch: Partial<CustomCardAdvancedConfig>) => {
    setDraft((prev) => ({
      ...prev,
      cardAdvancedConfigs: {
        ...(prev.cardAdvancedConfigs || {}),
        [key]: {
          ...(prev.cardAdvancedConfigs?.[key] || {}),
          ...patch,
        },
      },
    }));
  };

  // Reset single card to default
  const handleResetIndividualCard = (key: string) => {
    const meta = cardsMeta.find((c) => c.key === key);
    if (!meta) return;
    const nextColors = { ...draft.cardColors, [key]: meta.defaultFrom };
    const nextGradTo = { ...(draft.cardGradientToColors || {}) };
    delete nextGradTo[key];
    const nextBorders = { ...(draft.cardBorderColors || {}) };
    delete nextBorders[key];
    const nextText = { ...(draft.cardTextColors || {}) };
    delete nextText[key];
    const nextIconColor = { ...(draft.cardIconColors || {}) };
    delete nextIconColor[key];
    const nextBuiltIn = { ...(draft.cardBuiltInIcons || {}) };
    delete nextBuiltIn[key];
    const nextCustomIcons = { ...(draft.customIcons || {}) };
    delete nextCustomIcons[key];
    const nextNames = { ...(draft.cardCustomNames || {}) };
    delete nextNames[key];
    const nextAdv = { ...(draft.cardAdvancedConfigs || {}) };
    delete nextAdv[key];

    setDraft({
      ...draft,
      cardColors: nextColors,
      cardGradientToColors: nextGradTo,
      cardBorderColors: nextBorders,
      cardTextColors: nextText,
      cardIconColors: nextIconColor,
      cardBuiltInIcons: nextBuiltIn,
      customIcons: nextCustomIcons,
      cardCustomNames: nextNames,
      cardAdvancedConfigs: nextAdv,
    });
    showToast(`Reset "${meta.defaultEn}" card to default settings!`);
  };

  const handleConfirmResetAll = () => {
    const resetState = StorageService.resetCustomization();
    setDraft(resetState);
    onCustomizationApplied(resetState);
    setConfirmResetAll(false);
    showToast('All Home Screen customizations restored to factory defaults!');
  };

  const handleApplyAndSave = () => {
    StorageService.saveCustomization(draft);
    onCustomizationApplied(draft);
    showToast('All Home Screen customizations saved permanently!');
    setTimeout(() => {
      onClose();
    }, 450);
  };

  // Compute live preview style for selected card
  const renderLiveCardPreview = () => {
    if (!activeCardMeta) return null;
    const adv = getCardAdv(activeCardMeta.key);
    const customName = draft.cardCustomNames?.[activeCardMeta.key];
    const titleEn = customName?.en || activeCardMeta.defaultEn;
    const titleUr = customName?.ur || activeCardMeta.defaultUr;
    const desc = customName?.desc || activeCardMeta.defaultDesc;

    const fromColor =
      adv.gradientFrom || draft.cardColors?.[activeCardMeta.key] || activeCardMeta.defaultFrom;
    const midColor = adv.gradientMid || '#059669';
    const toColor =
      adv.gradientTo ||
      draft.cardGradientToColors?.[activeCardMeta.key] ||
      activeCardMeta.defaultTo;
    const solidColor =
      adv.solidColor || draft.cardColors?.[activeCardMeta.key] || activeCardMeta.defaultFrom;
    const angle = adv.gradientAngle ?? 135;
    const mode = adv.colorMode || 'gradient2';

    let backgroundStyle = `linear-gradient(${angle}deg, ${fromColor} 0%, ${toColor} 100%)`;
    if (mode === 'solid') {
      backgroundStyle = solidColor;
    } else if (mode === 'gradient3') {
      backgroundStyle =
        adv.gradientType === 'radial'
          ? `radial-gradient(circle, ${fromColor} 0%, ${midColor} 50%, ${toColor} 100%)`
          : `linear-gradient(${angle}deg, ${fromColor} 0%, ${midColor} 50%, ${toColor} 100%)`;
    } else if (adv.gradientType === 'radial') {
      backgroundStyle = `radial-gradient(circle, ${fromColor} 0%, ${toColor} 100%)`;
    }

    const borderColor =
      draft.cardBorderColors?.[activeCardMeta.key] || 'rgba(255,255,255,0.38)';
    const textColor = draft.cardTextColors?.[activeCardMeta.key] || '#FFFFFF';
    const iconColor = draft.cardIconColors?.[activeCardMeta.key] || '#000000';
    const radius = adv.borderRadius ?? draft.cardBorderRadius ?? 16;
    const opacity = (adv.cardOpacity ?? 100) / 100;
    const iconSize = adv.customIconSize ?? draft.iconSize ?? 22;

    return (
      <div
        style={{
          background: backgroundStyle,
          borderRadius: `${radius}px`,
          borderWidth: `${draft.cardBorderWidth ?? 1}px`,
          borderStyle: 'solid',
          borderColor,
          color: textColor,
          opacity,
        }}
        className="relative overflow-hidden px-4 py-3 flex items-center gap-3 shadow-lg min-w-[250px] max-w-sm transition-all"
      >
        {/* Optional Picture Background */}
        {adv.pictureUrl && (
          <>
            <img
              src={adv.pictureUrl}
              alt=""
              style={{
                objectFit: adv.pictureFit || 'cover',
                objectPosition: adv.picturePosition || 'center',
                opacity: (adv.pictureOpacity ?? 100) / 100,
              }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            />
            <div
              style={{
                backgroundColor: adv.overlayColor || '#000000',
                opacity: (adv.overlayOpacity ?? 35) / 100,
              }}
              className="absolute inset-0 pointer-events-none"
            />
          </>
        )}

        <div
          style={{
            backgroundColor: adv.iconBgColor || '#ffffff',
            opacity: (adv.iconBgOpacity ?? 95) / 100,
            color: iconColor,
          }}
          className="relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
        >
          <RenderModuleIcon
            moduleKey={activeCardMeta.key}
            DefaultIcon={activeCardMeta.DefaultIcon}
            size={iconSize}
          />
        </div>

        <div className="relative z-10 min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-black truncate">{titleEn}</span>
            <span
              className="text-xs font-bold font-urdu truncate"
              style={{ fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif" }}
            >
              {titleUr}
            </span>
          </div>
          <div className="text-[10px] opacity-85 truncate font-semibold">{desc}</div>
        </div>
      </div>
    );
  };

  const homeCardsList = (() => {
    const onlyHome = cardsMeta.filter((c) => c.group === 'Home Screen');
    const order =
      draft.homeCardOrder && draft.homeCardOrder.length > 0
        ? draft.homeCardOrder
        : onlyHome.map((c) => c.id);
    const map = new Map(onlyHome.map((c) => [c.id, c]));
    const ordered = order.map((id) => map.get(id)).filter(Boolean) as CustomizableCardMeta[];
    onlyHome.forEach((c) => {
      if (!ordered.some((x) => x.id === c.id)) ordered.push(c);
    });
    return ordered;
  })();

  const moveHomeCardByIndex = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= homeCardsList.length || fromIdx === toIdx) return;
    const ids = homeCardsList.map((c) => c.id);
    const [moved] = ids.splice(fromIdx, 1);
    ids.splice(toIdx, 0, moved);
    setDraft({ ...draft, homeCardOrder: ids });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <input
        ref={fallbackFileInputRef}
        type="file"
        accept=".png,.jpg,.jpeg,.webp,.svg,image/*"
        onChange={handleFallbackInputChange}
        className="hidden"
      />

      {/* GPS Chambai Storage Picker Modal */}
      <GpsChambaiFolderModal
        isOpen={storagePickerOpen}
        onClose={() => setStoragePickerOpen(false)}
        selectFilterMimePrefix="image/"
        onSelectFile={(_entry, dataUrl) => {
          storagePickerCallback?.(dataUrl);
          setStoragePickerOpen(false);
        }}
      />

      <div className="bg-slate-50 w-full max-w-5xl rounded-3xl shadow-2xl border-2 border-emerald-600 overflow-hidden flex flex-col max-h-[94vh]">
        {/* TOP HEADER & LIVE PREVIEW BAR */}
        <div className="bg-slate-900 text-white p-3.5 sm:p-4 border-b border-slate-800 space-y-3 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5">
                <Palette size={15} className="text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  GPS Chambai • Complete Home Screen Customization Studio
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight mt-0.5">
                Cards, Gradients, Pictures, Wallpaper, Bottom Buttons &amp; File Format Icons
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleApplyAndSave}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} />
                <span>Apply &amp; Save</span>
              </button>
              <button
                type="button"
                onClick={() => handleResetIndividualCard(selectedCardKey)}
                className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1"
                title="Reset currently selected card"
              >
                <RotateCcw size={13} />
                <span>Reset Card</span>
              </button>
              <button
                type="button"
                onClick={() => setConfirmResetAll(true)}
                className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1"
              >
                <RotateCcw size={13} />
                <span>Reset All</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1"
              >
                <X size={14} />
                <span>Cancel</span>
              </button>
            </div>
          </div>

          {toast && (
            <div className="bg-emerald-800/90 border border-emerald-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={14} className="text-amber-300 shrink-0" />
              <span>{toast}</span>
            </div>
          )}

          {/* LIVE PREVIEW STRIP + TARGET CARD SELECTOR */}
          <div className="bg-slate-800/90 rounded-2xl p-2.5 border border-slate-700 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                <Eye size={13} />
                <span>Select Target Card:</span>
              </span>
              <select
                value={selectedCardKey}
                onChange={(e) => setSelectedCardKey(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-600 text-white text-xs font-black"
              >
                {cardsMeta.map((c) => (
                  <option key={c.key} value={c.key}>
                    [{c.group}] {draft.cardCustomNames?.[c.key]?.en || c.defaultEn} (
                    {draft.cardCustomNames?.[c.key]?.ur || c.defaultUr})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">
                Live Card Preview:
              </span>
              {renderLiveCardPreview()}
            </div>
          </div>

          {/* 8 CATEGORY TABS (A through I) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 pt-0.5">
            {[
              { id: 'movement', label: 'A. Move & Grid', icon: Move },
              { id: 'colors', label: 'B. Colors & Grad', icon: Palette },
              { id: 'renaming', label: 'C. Rename Cards', icon: TypeIcon },
              { id: 'pictures', label: 'D. Card Pictures', icon: ImageIcon },
              { id: 'wallpaper', label: 'E. Wallpaper', icon: Sparkles },
              { id: 'buttons', label: 'F. Bottom Bar', icon: Sliders },
              { id: 'card_icons', label: 'G/I. Card Icons', icon: LayoutGrid },
              { id: 'file_icons', label: 'H. File Icons', icon: FileCode },
            ].map((t) => {
              const Icon = t.icon;
              const active = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as CustomizeTabId)}
                  className={`py-2 px-2 rounded-xl text-[11px] font-black flex items-center justify-center gap-1 transition-all ${
                    active
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon size={13} className="shrink-0" />
                  <span className="truncate">{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* ================= SECTION A: CARD MOVEMENT & POSITION ================= */}
          {activeTab === 'movement' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      A1. Grid Columns, Card Size, Spacing &amp; View Mode
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      Adjust how cards are sized and arranged across Grid View and List View.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({
                        ...draft,
                        homeCardOrder: DEFAULT_CUSTOMIZATION.homeCardOrder,
                        otherCardOrder: DEFAULT_CUSTOMIZATION.otherCardOrder,
                        dashboardColumns: 2,
                        cardSize: 'compact',
                        cardSpacing: 12,
                      });
                      showToast('Restored default card arrangement & grid dimensions!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Restore Default Arrangement</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Number of Columns
                    </label>
                    <select
                      value={draft.dashboardColumns || 2}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          dashboardColumns: Number(e.target.value) as 1 | 2 | 3 | 4,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value={1}>1 Column (List / Wide)</option>
                      <option value={2}>2 Columns (Standard Mobile)</option>
                      <option value={3}>3 Columns (Compact Grid)</option>
                      <option value={4}>4 Columns (Dense Grid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Card Size / Height
                    </label>
                    <select
                      value={draft.cardSize || 'compact'}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          cardSize: e.target.value as AppCustomizationSettings['cardSize'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="compact">Compact (68px)</option>
                      <option value="normal">Standard (78px)</option>
                      <option value="spacious">Spacious (90px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Card Spacing / Gap ({draft.cardSpacing ?? 12}px)
                    </label>
                    <input
                      type="range"
                      min={6}
                      max={24}
                      value={draft.cardSpacing ?? 12}
                      onChange={(e) =>
                        setDraft({ ...draft, cardSpacing: Number(e.target.value) })
                      }
                      className="w-full accent-emerald-600 mt-2"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Default View Mode
                    </label>
                    <select
                      value={draft.homeViewMode || 'grid'}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          homeViewMode: e.target.value as 'grid' | 'list',
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      <option value="grid">Grid View</option>
                      <option value="list">List View</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-black text-slate-900">
                  A2. Drag-and-Drop or Arrow Reordering (Home Screen Cards)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {homeCardsList.map((card, idx) => (
                    <div
                      key={card.id}
                      draggable
                      onDragStart={() => setDraggedCardId(card.id)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (!draggedCardId) return;
                        const fromIdx = homeCardsList.findIndex((c) => c.id === draggedCardId);
                        if (fromIdx >= 0) moveHomeCardByIndex(fromIdx, idx);
                        setDraggedCardId(null);
                      }}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 hover:border-emerald-500 cursor-grab active:cursor-grabbing"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical size={15} className="text-slate-400 shrink-0" />
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 truncate">
                            {draft.cardCustomNames?.[card.key]?.en || card.defaultEn}
                          </div>
                          <div
                            className="text-[11px] font-bold text-slate-500 font-urdu truncate"
                            style={{
                              fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            }}
                          >
                            {draft.cardCustomNames?.[card.key]?.ur || card.defaultUr}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveHomeCardByIndex(idx, idx - 1)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                          title="Move Up / Left"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === homeCardsList.length - 1}
                          onClick={() => moveHomeCardByIndex(idx, idx + 1)}
                          className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                          title="Move Down / Right"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================= SECTION B: CARD COLORS & GRADIENTS ================= */}
          {activeTab === 'colors' && activeCardMeta && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    B. Solid Color, 2-Color / 3-Color Gradients, Angle, Opacity &amp; Shadow
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Customizing:{' '}
                    <span className="text-emerald-700 font-black">
                      {draft.cardCustomNames?.[activeCardMeta.key]?.en || activeCardMeta.defaultEn}
                    </span>
                  </p>
                </div>
              </div>

              {(() => {
                const adv = getCardAdv(activeCardMeta.key);
                const mode = adv.colorMode || 'gradient2';
                const fromCol =
                  adv.gradientFrom ||
                  draft.cardColors?.[activeCardMeta.key] ||
                  activeCardMeta.defaultFrom;
                const midCol = adv.gradientMid || '#10b981';
                const toCol =
                  adv.gradientTo ||
                  draft.cardGradientToColors?.[activeCardMeta.key] ||
                  activeCardMeta.defaultTo;

                return (
                  <div className="space-y-4">
                    {/* Color Mode Selector */}
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'solid', label: 'Solid Color' },
                        { id: 'gradient2', label: '2-Color Gradient' },
                        { id: 'gradient3', label: '3-Color Gradient' },
                      ].map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            updateCardAdv(activeCardMeta.key, {
                              colorMode: m.id as CustomCardAdvancedConfig['colorMode'],
                            })
                          }
                          className={`py-2.5 px-3 rounded-xl font-black border text-xs ${
                            mode === m.id
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-slate-50 text-slate-700 border-slate-200'
                          }`}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Color Pickers */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {mode === 'solid' ? (
                        <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                          <span className="font-black text-slate-700">Solid Background</span>
                          <input
                            type="color"
                            value={adv.solidColor || fromCol}
                            onChange={(e) => {
                              updateCardAdv(activeCardMeta.key, { solidColor: e.target.value });
                              setDraft((prev) => ({
                                ...prev,
                                cardColors: {
                                  ...prev.cardColors,
                                  [activeCardMeta.key]: e.target.value,
                                },
                              }));
                            }}
                            className="w-9 h-9 rounded-lg cursor-pointer border-0"
                          />
                        </label>
                      ) : (
                        <>
                          <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                            <span className="font-black text-slate-700">Gradient Start</span>
                            <input
                              type="color"
                              value={fromCol}
                              onChange={(e) => {
                                updateCardAdv(activeCardMeta.key, {
                                  gradientFrom: e.target.value,
                                });
                                setDraft((prev) => ({
                                  ...prev,
                                  cardColors: {
                                    ...prev.cardColors,
                                    [activeCardMeta.key]: e.target.value,
                                  },
                                }));
                              }}
                              className="w-9 h-9 rounded-lg cursor-pointer border-0"
                            />
                          </label>
                          {mode === 'gradient3' && (
                            <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                              <span className="font-black text-slate-700">Gradient Middle</span>
                              <input
                                type="color"
                                value={midCol}
                                onChange={(e) =>
                                  updateCardAdv(activeCardMeta.key, {
                                    gradientMid: e.target.value,
                                  })
                                }
                                className="w-9 h-9 rounded-lg cursor-pointer border-0"
                              />
                            </label>
                          )}
                          <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                            <span className="font-black text-slate-700">Gradient End</span>
                            <input
                              type="color"
                              value={toCol}
                              onChange={(e) => {
                                updateCardAdv(activeCardMeta.key, { gradientTo: e.target.value });
                                setDraft((prev) => ({
                                  ...prev,
                                  cardGradientToColors: {
                                    ...(prev.cardGradientToColors || {}),
                                    [activeCardMeta.key]: e.target.value,
                                  },
                                }));
                              }}
                              className="w-9 h-9 rounded-lg cursor-pointer border-0"
                            />
                          </label>
                        </>
                      )}

                      <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                        <span className="font-black text-slate-700">Text Color</span>
                        <input
                          type="color"
                          value={draft.cardTextColors?.[activeCardMeta.key] || '#ffffff'}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              cardTextColors: {
                                ...(draft.cardTextColors || {}),
                                [activeCardMeta.key]: e.target.value,
                              },
                            })
                          }
                          className="w-9 h-9 rounded-lg cursor-pointer border-0"
                        />
                      </label>

                      <label className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                        <span className="font-black text-slate-700">Border Color</span>
                        <input
                          type="color"
                          value={draft.cardBorderColors?.[activeCardMeta.key] || '#ffffff'}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              cardBorderColors: {
                                ...(draft.cardBorderColors || {}),
                                [activeCardMeta.key]: e.target.value,
                              },
                            })
                          }
                          className="w-9 h-9 rounded-lg cursor-pointer border-0"
                        />
                      </label>
                    </div>

                    {/* Gradient Type, Angle, Opacity, Border Radius & Shadow */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      {mode !== 'solid' && (
                        <>
                          <div>
                            <label className="block text-[10px] font-black text-slate-600 mb-1">
                              Gradient Style (Linear / Radial)
                            </label>
                            <select
                              value={adv.gradientType || 'linear'}
                              onChange={(e) =>
                                updateCardAdv(activeCardMeta.key, {
                                  gradientType: e.target.value as 'linear' | 'radial',
                                })
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                            >
                              <option value="linear">Linear Gradient</option>
                              <option value="radial">Radial Gradient</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-slate-600 mb-1">
                              Gradient Direction Angle ({adv.gradientAngle ?? 135}°)
                            </label>
                            <input
                              type="range"
                              min={0}
                              max={360}
                              step={15}
                              value={adv.gradientAngle ?? 135}
                              onChange={(e) =>
                                updateCardAdv(activeCardMeta.key, {
                                  gradientAngle: Number(e.target.value),
                                })
                              }
                              className="w-full accent-emerald-600 mt-2"
                            />
                          </div>
                        </>
                      )}

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Card Opacity / Transparency ({adv.cardOpacity ?? 100}%)
                        </label>
                        <input
                          type="range"
                          min={25}
                          max={100}
                          value={adv.cardOpacity ?? 100}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              cardOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Corner Border Radius ({adv.borderRadius ?? draft.cardBorderRadius ?? 16}px)
                        </label>
                        <input
                          type="range"
                          min={6}
                          max={32}
                          value={adv.borderRadius ?? draft.cardBorderRadius ?? 16}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              borderRadius: Number(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Shadow Intensity
                        </label>
                        <select
                          value={adv.shadow || draft.cardShadow || 'md'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              shadow: e.target.value as CustomCardAdvancedConfig['shadow'],
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="none">No Shadow (Flat)</option>
                          <option value="sm">Soft Subtle Shadow</option>
                          <option value="md">Medium Elevated Shadow</option>
                          <option value="lg">Deep 3D Shadow</option>
                          <option value="xl">Maximum Floating Glow</option>
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SECTION C: CARD RENAMING ================= */}
          {activeTab === 'renaming' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    C. Rename Any Card (English, Urdu Nastaleeq &amp; Subtitle)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Renaming a card updates its label while keeping its original module navigation intact.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, cardCustomNames: {} });
                    showToast('All card names restored to defaults!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset All Names</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {cardsMeta.map((card) => {
                  const current = draft.cardCustomNames?.[card.key] || {};
                  return (
                    <div
                      key={card.key}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-800">
                          [{card.group}] {card.defaultEn}
                        </span>
                        {(current.en || current.ur || current.desc) && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = { ...(draft.cardCustomNames || {}) };
                              delete next[card.key];
                              setDraft({ ...draft, cardCustomNames: next });
                            }}
                            className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                            English Name
                          </label>
                          <input
                            type="text"
                            value={current.en ?? card.defaultEn}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                cardCustomNames: {
                                  ...(draft.cardCustomNames || {}),
                                  [card.key]: { ...current, en: e.target.value },
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                            Urdu Name (جمیل نوری نستعلیق)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={current.ur ?? card.defaultUr}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                cardCustomNames: {
                                  ...(draft.cardCustomNames || {}),
                                  [card.key]: { ...current, ur: e.target.value },
                                },
                              })
                            }
                            style={{
                              fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white font-urdu"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 mb-0.5">
                          Subtitle / Description
                        </label>
                        <input
                          type="text"
                          value={current.desc ?? card.defaultDesc}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              cardCustomNames: {
                                ...(draft.cardCustomNames || {}),
                                [card.key]: { ...current, desc: e.target.value },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-semibold bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= SECTION D: CHANGE CARD INTO PICTURES ================= */}
          {activeTab === 'pictures' && activeCardMeta && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    D. Change Card Into Picture (Phone Gallery or GPS Chambai Storage)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Replace the selected card background with a custom photo while keeping text readable.
                  </p>
                </div>
                {getCardAdv(activeCardMeta.key).pictureUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      updateCardAdv(activeCardMeta.key, { pictureUrl: '' });
                      showToast('Removed picture from card!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center gap-1"
                  >
                    <Trash2 size={13} />
                    <span>Remove Picture &amp; Restore Default</span>
                  </button>
                )}
              </div>

              {(() => {
                const adv = getCardAdv(activeCardMeta.key);
                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          void pickGalleryImage((dataUrl) => {
                            updateCardAdv(activeCardMeta.key, { pictureUrl: dataUrl });
                            showToast('Card picture applied from Gallery!');
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black flex items-center gap-2 shadow-xs"
                      >
                        <Upload size={14} />
                        <span>Select Picture from Phone Gallery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openStorageImagePicker((dataUrl) => {
                            updateCardAdv(activeCardMeta.key, { pictureUrl: dataUrl });
                            showToast('Card picture applied from GPS Chambai Storage!');
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2 shadow-xs"
                      >
                        <FolderOpen size={14} />
                        <span>Pick from GPS Chambai Storage</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Image Fit Mode
                        </label>
                        <select
                          value={adv.pictureFit || 'cover'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              pictureFit: e.target.value as 'cover' | 'contain' | 'fill',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="cover">Cover (Fill Card Evenly)</option>
                          <option value="contain">Contain (Show Entire Image)</option>
                          <option value="fill">Stretch to Fill</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Image Alignment / Position
                        </label>
                        <select
                          value={adv.picturePosition || 'center'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              picturePosition: e.target.value as CustomCardAdvancedConfig['picturePosition'],
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="center">Center</option>
                          <option value="top">Top</option>
                          <option value="bottom">Bottom</option>
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Picture Opacity ({adv.pictureOpacity ?? 100}%)
                        </label>
                        <input
                          type="range"
                          min={15}
                          max={100}
                          value={adv.pictureOpacity ?? 100}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              pictureOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <label className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <span className="font-black text-slate-700">Readability Overlay Color</span>
                        <input
                          type="color"
                          value={adv.overlayColor || '#000000'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, { overlayColor: e.target.value })
                          }
                          className="w-8 h-8 rounded-lg border-0 cursor-pointer"
                        />
                      </label>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Overlay Contrast Opacity ({adv.overlayOpacity ?? 35}%)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={85}
                          value={adv.overlayOpacity ?? 35}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              overlayOpacity: Number(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SECTION E: CARD BACKGROUND WALLPAPER FROM GALLERY ================= */}
          {activeTab === 'wallpaper' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    E. Background Wallpaper from Gallery (Home Screen or Cards)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Apply a Gallery image to the entire Home Screen, all cards, or a selected group of cards.
                  </p>
                </div>
                {(draft.wallpaperConfig?.url || draft.homeWallpaperUrl) && (
                  <button
                    type="button"
                    onClick={() => {
                      setDraft({
                        ...draft,
                        homeWallpaperUrl: '',
                        wallpaperConfig: DEFAULT_CUSTOMIZATION.wallpaperConfig,
                      });
                      showToast('Reset wallpaper to default!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-black flex items-center gap-1"
                  >
                    <RotateCcw size={13} />
                    <span>Reset Wallpaper</span>
                  </button>
                )}
              </div>

              {(() => {
                const wp = draft.wallpaperConfig || DEFAULT_CUSTOMIZATION.wallpaperConfig!;
                const updateWp = (patch: Partial<typeof wp>) => {
                  const next = { ...wp, ...patch };
                  setDraft({
                    ...draft,
                    homeWallpaperUrl:
                      next.targetMode === 'home_screen' ? next.url || '' : draft.homeWallpaperUrl,
                    wallpaperConfig: next,
                  });
                };

                return (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          void pickGalleryImage(
                            (dataUrl) => {
                              updateWp({ url: dataUrl });
                              showToast('Wallpaper loaded from Phone Gallery!');
                            },
                            { maxWidth: 1400, maxHeight: 1400 }
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black flex items-center gap-2"
                      >
                        <Upload size={14} />
                        <span>Upload Wallpaper from Gallery</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openStorageImagePicker((dataUrl) => {
                            updateWp({ url: dataUrl });
                            showToast('Wallpaper loaded from GPS Chambai Storage!');
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2"
                      >
                        <FolderOpen size={14} />
                        <span>Pick from GPS Chambai Storage</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Apply Wallpaper To
                        </label>
                        <select
                          value={wp.targetMode || 'home_screen'}
                          onChange={(e) =>
                            updateWp({
                              targetMode: e.target.value as
                                | 'home_screen'
                                | 'all_cards'
                                | 'selected_cards',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="home_screen">Entire Home Screen Background</option>
                          <option value="all_cards">All Home Screen Cards</option>
                          <option value="selected_cards">Selected Group of Cards</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Wallpaper Blur ({wp.blur ?? 0}px)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={20}
                          value={wp.blur ?? 0}
                          onChange={(e) => updateWp({ blur: Number(e.target.value) })}
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Brightness ({wp.brightness ?? 100}%)
                        </label>
                        <input
                          type="range"
                          min={50}
                          max={150}
                          value={wp.brightness ?? 100}
                          onChange={(e) => updateWp({ brightness: Number(e.target.value) })}
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Wallpaper Opacity ({wp.opacity ?? 100}%)
                        </label>
                        <input
                          type="range"
                          min={15}
                          max={100}
                          value={wp.opacity ?? 100}
                          onChange={(e) => updateWp({ opacity: Number(e.target.value) })}
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Dark / Light Overlay ({wp.overlayOpacity ?? 20}%)
                        </label>
                        <input
                          type="range"
                          min={0}
                          max={80}
                          value={wp.overlayOpacity ?? 20}
                          onChange={(e) => updateWp({ overlayOpacity: Number(e.target.value) })}
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Image Fit
                        </label>
                        <select
                          value={wp.fit || 'cover'}
                          onChange={(e) =>
                            updateWp({ fit: e.target.value as 'cover' | 'contain' })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="cover">Cover</option>
                          <option value="contain">Contain</option>
                        </select>
                      </div>
                    </div>

                    {wp.targetMode === 'selected_cards' && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="text-[11px] font-black text-slate-700">
                          Select Cards for Group Wallpaper:
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {cardsMeta
                            .filter((c) => c.group === 'Home Screen')
                            .map((c) => {
                              const checked = (wp.selectedCardKeys || []).includes(c.key);
                              return (
                                <label
                                  key={c.key}
                                  className="flex items-center gap-2 p-2 rounded-lg bg-white border border-slate-200 cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => {
                                      const cur = new Set(wp.selectedCardKeys || []);
                                      if (e.target.checked) cur.add(c.key);
                                      else cur.delete(c.key);
                                      updateWp({ selectedCardKeys: Array.from(cur) });
                                    }}
                                    className="accent-emerald-600"
                                  />
                                  <span className="font-bold text-slate-800 truncate">
                                    {c.defaultEn}
                                  </span>
                                </label>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SECTION F: BUTTON COLOR, NAME & POSITION CUSTOMIZATION ================= */}
          {activeTab === 'buttons' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    F. Home Screen Bottom Toolbar Buttons (Name, Color, Order, Size &amp; Radius)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Customize GPS CHAMBAI STORAGE, MOVE CARD, GRID / LIST VIEW, and CUSTOMIZE buttons.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({
                      ...draft,
                      homeBottomButtonsOrder: DEFAULT_CUSTOMIZATION.homeBottomButtonsOrder,
                      homeBottomButtonsConfig: DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig,
                    });
                    showToast('Restored default bottom toolbar buttons!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset Buttons</span>
                </button>
              </div>

              {/* Reorder Bottom Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  draft.homeBottomButtonsOrder ||
                  DEFAULT_CUSTOMIZATION.homeBottomButtonsOrder!
                ).map((btnId, idx, arr) => {
                  const cfg =
                    draft.homeBottomButtonsConfig?.[btnId] ||
                    DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig![btnId];
                  const isSel = selectedButtonId === btnId;
                  return (
                    <div
                      key={btnId}
                      onClick={() => setSelectedButtonId(btnId)}
                      className={`p-2.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSel
                          ? 'border-emerald-600 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-500">
                          Pos #{idx + 1}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextOrder = [...arr];
                              const [m] = nextOrder.splice(idx, 1);
                              nextOrder.splice(idx - 1, 0, m);
                              setDraft({ ...draft, homeBottomButtonsOrder: nextOrder });
                            }}
                            className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40"
                          >
                            <ArrowLeft size={11} />
                          </button>
                          <button
                            type="button"
                            disabled={idx === arr.length - 1}
                            onClick={(e) => {
                              e.stopPropagation();
                              const nextOrder = [...arr];
                              const [m] = nextOrder.splice(idx, 1);
                              nextOrder.splice(idx + 1, 0, m);
                              setDraft({ ...draft, homeBottomButtonsOrder: nextOrder });
                            }}
                            className="p-1 rounded bg-white border border-slate-200 disabled:opacity-40"
                          >
                            <ArrowRight size={11} />
                          </button>
                        </div>
                      </div>
                      <div
                        style={{
                          background: cfg.useGradient
                            ? `linear-gradient(135deg, ${cfg.bgColor}, ${cfg.gradientTo || cfg.bgColor})`
                            : cfg.bgColor,
                          color: cfg.textColor,
                          borderRadius: `${cfg.borderRadius ?? 14}px`,
                        }}
                        className="py-2 px-2 text-center font-black text-[10px] truncate shadow-xs"
                      >
                        {cfg.showLabel !== false ? cfg.labelEn : 'Icon Only'}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Button Editor */}
              {(() => {
                const cfg =
                  draft.homeBottomButtonsConfig?.[selectedButtonId] ||
                  DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig![selectedButtonId];
                const updateBtn = (patch: Partial<HomeBottomButtonConfig>) => {
                  setDraft({
                    ...draft,
                    homeBottomButtonsConfig: {
                      ...(draft.homeBottomButtonsConfig ||
                        DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig!),
                      [selectedButtonId]: { ...cfg, ...patch },
                    },
                  });
                };

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1">
                        Button English Label
                      </label>
                      <input
                        type="text"
                        value={cfg.labelEn}
                        onChange={(e) => updateBtn({ labelEn: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1">
                        Button Urdu Label
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={cfg.labelUr}
                        onChange={(e) => updateBtn({ labelUr: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white font-urdu"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1">
                        Button Size
                      </label>
                      <select
                        value={cfg.size || 'normal'}
                        onChange={(e) =>
                          updateBtn({ size: e.target.value as 'compact' | 'normal' | 'large' })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="large">Large</option>
                      </select>
                    </div>

                    <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Primary Color</span>
                      <input
                        type="color"
                        value={cfg.bgColor}
                        onChange={(e) => updateBtn({ bgColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Gradient End Color</span>
                      <input
                        type="color"
                        value={cfg.gradientTo || cfg.bgColor}
                        onChange={(e) =>
                          updateBtn({ gradientTo: e.target.value, useGradient: true })
                        }
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                    </label>

                    <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                      <span className="font-bold text-slate-700">Text &amp; Icon Color</span>
                      <input
                        type="color"
                        value={cfg.textColor}
                        onChange={(e) => updateBtn({ textColor: e.target.value })}
                        className="w-8 h-8 rounded cursor-pointer border-0"
                      />
                    </label>

                    <div>
                      <label className="block text-[10px] font-black text-slate-600 mb-1">
                        Corner Radius ({cfg.borderRadius ?? 14}px)
                      </label>
                      <input
                        type="range"
                        min={6}
                        max={26}
                        value={cfg.borderRadius ?? 14}
                        onChange={(e) => updateBtn({ borderRadius: Number(e.target.value) })}
                        className="w-full accent-emerald-600 mt-2"
                      />
                    </div>

                    <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer">
                      <span className="font-bold text-slate-700">Show Text Label</span>
                      <input
                        type="checkbox"
                        checked={cfg.showLabel !== false}
                        onChange={(e) => updateBtn({ showLabel: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600"
                      />
                    </label>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          void pickGalleryImage(
                            (dataUrl) => {
                              updateBtn({ customIconUrl: dataUrl });
                              showToast('Uploaded custom button icon!');
                            },
                            { maxWidth: 256, maxHeight: 256 }
                          )
                        }
                        className="flex-1 py-2 px-2.5 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center gap-1"
                      >
                        <Upload size={13} />
                        <span>Custom Icon</span>
                      </button>
                      {cfg.customIconUrl && (
                        <button
                          type="button"
                          onClick={() => updateBtn({ customIconUrl: '' })}
                          className="p-2 rounded-xl bg-rose-100 text-rose-700 font-black"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SECTION G & I: CUSTOM ICON SYSTEM & ALL CARD ICON CUSTOMIZATION ================= */}
          {activeTab === 'card_icons' && activeCardMeta && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    G &amp; I. Built-in Icons &amp; Custom Icon Import from Phone / Storage
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Import PNG, JPG, WEBP, or SVG icons from Phone Gallery or GPS Chambai Storage, or choose from built-in icons.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({
                      ...draft,
                      customIcons: {},
                      cardBuiltInIcons: {},
                      cardIconColors: {},
                    });
                    showToast('Restored all default card icons!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore All Default Icons</span>
                </button>
              </div>

              {(() => {
                const adv = getCardAdv(activeCardMeta.key);
                return (
                  <div className="space-y-4">
                    {/* Upload Custom Icon Buttons */}
                    <div className="flex flex-wrap gap-2.5">
                      <button
                        type="button"
                        onClick={() =>
                          void pickGalleryImage(
                            (dataUrl) => {
                              setDraft((prev) => ({
                                ...prev,
                                customIcons: {
                                  ...(prev.customIcons || {}),
                                  [activeCardMeta.key]: dataUrl,
                                },
                              }));
                              showToast('Custom icon imported from Phone Gallery!');
                            },
                            { maxWidth: 256, maxHeight: 256 }
                          )
                        }
                        className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black flex items-center gap-2"
                      >
                        <Upload size={14} />
                        <span>Import Icon from Phone Gallery (PNG/JPG/WEBP/SVG)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openStorageImagePicker((dataUrl) => {
                            setDraft((prev) => ({
                              ...prev,
                              customIcons: {
                                ...(prev.customIcons || {}),
                                [activeCardMeta.key]: dataUrl,
                              },
                            }));
                            showToast('Custom icon imported from GPS Chambai Storage!');
                          })
                        }
                        className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black flex items-center gap-2"
                      >
                        <FolderOpen size={14} />
                        <span>Pick Icon from GPS Chambai Storage</span>
                      </button>
                    </div>

                    {/* Icon Size, Color, Background, Transparency & Alignment */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Card Icon Size ({adv.customIconSize ?? draft.iconSize ?? 22}px)
                        </label>
                        <input
                          type="range"
                          min={16}
                          max={38}
                          value={adv.customIconSize ?? draft.iconSize ?? 22}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              customIconSize: Number(e.target.value),
                            })
                          }
                          className="w-full accent-emerald-600 mt-2"
                        />
                      </div>

                      <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Icon Tint Color</span>
                        <input
                          type="color"
                          value={draft.cardIconColors?.[activeCardMeta.key] || '#000000'}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              cardIconColors: {
                                ...(draft.cardIconColors || {}),
                                [activeCardMeta.key]: e.target.value,
                              },
                            })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                      </label>

                      <label className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                        <span className="font-bold text-slate-700">Icon Badge Background</span>
                        <input
                          type="color"
                          value={adv.iconBgColor || '#ffffff'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, { iconBgColor: e.target.value })
                          }
                          className="w-8 h-8 rounded cursor-pointer border-0"
                        />
                      </label>

                      <div>
                        <label className="block text-[10px] font-black text-slate-600 mb-1">
                          Icon Alignment
                        </label>
                        <select
                          value={adv.iconAlignment || 'left'}
                          onChange={(e) =>
                            updateCardAdv(activeCardMeta.key, {
                              iconAlignment: e.target.value as 'left' | 'center' | 'right',
                            })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                        >
                          <option value="left">Left Aligned</option>
                          <option value="center">Centered</option>
                          <option value="right">Right Aligned</option>
                        </select>
                      </div>
                    </div>

                    {/* Built-in Icon Search & Grid */}
                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                      <Search size={14} className="text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search built-in school & administrative icons..."
                        value={iconSearch}
                        onChange={(e) => setIconSearch(e.target.value)}
                        className="w-full bg-transparent font-bold focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 max-h-64 overflow-y-auto p-1">
                      {BUILT_IN_ICON_LIBRARY.filter(
                        (item) =>
                          !iconSearch.trim() ||
                          item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
                          item.category.toLowerCase().includes(iconSearch.toLowerCase())
                      ).map((item) => {
                        const IconComp = item.Icon;
                        const isSelected =
                          draft.cardBuiltInIcons?.[activeCardMeta.key] === item.id &&
                          !draft.customIcons?.[activeCardMeta.key];
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              const nextCustom = { ...(draft.customIcons || {}) };
                              delete nextCustom[activeCardMeta.key];
                              setDraft({
                                ...draft,
                                customIcons: nextCustom,
                                cardBuiltInIcons: {
                                  ...(draft.cardBuiltInIcons || {}),
                                  [activeCardMeta.key]: item.id,
                                },
                              });
                              showToast(`Assigned "${item.label}" icon!`);
                            }}
                            className={`p-2 rounded-2xl border-2 flex flex-col items-center gap-1 text-center ${
                              isSelected
                                ? 'border-emerald-600 bg-emerald-50'
                                : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                            }`}
                          >
                            <IconComp size={22} className="text-slate-900" />
                            <span className="text-[10px] font-black text-slate-800 line-clamp-1">
                              {item.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* ================= SECTION H: FILE FORMAT ICON REPLACEMENT ================= */}
          {activeTab === 'file_icons' && (
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    H. File Format Icon Replacement (PDF, DOC, DOCX, XLS, PPT, JPG, PNG, MP4, ZIP...)
                  </h3>
                  <p className="text-[11px] text-slate-500 font-semibold">
                    Upload custom visual icons for any of the 16 file formats. Changes only the visual badge without altering actual files.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ ...draft, fileFormatIcons: {} });
                    showToast('Restored default icons for all 16 file formats!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore Default File Icons</span>
                </button>
              </div>

              {/* Active File Format Uploader Bar */}
              <div className="p-3.5 rounded-2xl bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {draft.fileFormatIcons?.[selectedFormatKey] ? (
                    <img
                      src={draft.fileFormatIcons[selectedFormatKey]}
                      alt={selectedFormatKey}
                      className="w-11 h-11 rounded-xl bg-white p-1 object-contain"
                    />
                  ) : (
                    <FileFormatIcon formatOrFileName={selectedFormatKey} size={44} />
                  )}
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-wider text-emerald-400">
                      Selected File Type
                    </div>
                    <div className="text-sm font-black">
                      {
                        ALL_SUPPORTED_FILE_FORMATS.find((f) => f.key === selectedFormatKey)
                          ?.label
                      }
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void pickGalleryImage(
                        (dataUrl) => {
                          setDraft((prev) => ({
                            ...prev,
                            fileFormatIcons: {
                              ...(prev.fileFormatIcons || {}),
                              [selectedFormatKey]: dataUrl,
                            },
                          }));
                          showToast(`Custom icon set for .${selectedFormatKey} files!`);
                        },
                        { maxWidth: 256, maxHeight: 256 }
                      )
                    }
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>Upload Custom {selectedFormatKey} Icon</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      openStorageImagePicker((dataUrl) => {
                        setDraft((prev) => ({
                          ...prev,
                          fileFormatIcons: {
                            ...(prev.fileFormatIcons || {}),
                            [selectedFormatKey]: dataUrl,
                          },
                        }));
                        showToast(`Custom icon set for .${selectedFormatKey} files!`);
                      })
                    }
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center gap-1.5"
                  >
                    <FolderOpen size={14} />
                    <span>From Storage</span>
                  </button>

                  {draft.fileFormatIcons?.[selectedFormatKey] && (
                    <button
                      type="button"
                      onClick={() => {
                        const next = { ...(draft.fileFormatIcons || {}) };
                        delete next[selectedFormatKey];
                        setDraft({ ...draft, fileFormatIcons: next });
                        showToast(`Restored default ${selectedFormatKey} icon!`);
                      }}
                      className="px-3 py-2 rounded-xl bg-rose-600 text-white font-black"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Grid of all 16 File Formats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                {ALL_SUPPORTED_FILE_FORMATS.map((fmt) => {
                  const customUrl = draft.fileFormatIcons?.[fmt.key];
                  const isSel = selectedFormatKey === fmt.key;
                  return (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setSelectedFormatKey(fmt.key)}
                      className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                        isSel
                          ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                          : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {customUrl ? (
                        <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center">
                          <img
                            src={customUrl}
                            alt={fmt.key}
                            className="w-full h-full object-contain"
                          />
                        </div>
                      ) : (
                        <FileFormatIcon formatOrFileName={fmt.key} size={44} />
                      )}
                      <div className="text-center">
                        <div className="font-black text-slate-900 text-xs">.{fmt.key}</div>
                        <div className="text-[9px] font-bold text-emerald-700">
                          {customUrl ? 'Custom Icon' : 'Default'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* CONFIRM RESET ALL DIALOG */}
        {confirmResetAll && (
          <div className="fixed inset-0 z-60 bg-slate-950/75 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-5 border-2 border-rose-600 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-700">
                <AlertTriangle size={24} className="shrink-0" />
                <h4 className="text-sm font-black">
                  Reset All Home Screen Customizations?
                </h4>
              </div>
              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                This will restore all card positions, colors, gradients, card names, background pictures, bottom buttons, and file format icons to factory defaults. Your student, staff, and CV records will NOT be affected.
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmResetAll(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResetAll}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black"
                >
                  Yes, Reset All Customizations
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
