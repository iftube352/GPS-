import React, { useState, useRef } from 'react';
import {
  Palette,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  FileText,
  ExternalLink,
  Printer,
  Image as ImageIcon,
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Camera,
  Globe,
  MessageSquare,
  Send,
  LogIn,
  LogOut,
  Trash2,
  FolderOpen,
  ShieldCheck,
  Smartphone,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Undo2,
  XCircle,
  Sparkles,
  LayoutGrid,
  Type as TypeIcon,
  Sun,
  Moon,
  Search,
  Plus,
} from 'lucide-react';
import { AppCustomizationSettings, CustomThemePreset, StudentRecord } from '../../types';
import { StorageService, DEFAULT_CUSTOMIZATION } from '../../services/storage';
import { readFileAsDataUrl, printHtmlDocument, exportAndSaveRealPdf } from '../../services/printAndFileService';
import {
  WhatsAppNotificationService,
  WhatsAppCloudApiSettings,
  WhatsAppNotificationLogItem,
} from '../../services/whatsappNotificationService';
import { BUILT_IN_ICON_LIBRARY, RenderModuleIcon } from '../common/MonochromeIcons';
import { HOME_MODULES } from './HomeScreen';
import { OTHER_CORE_MODULES } from './OtherModule/OtherDashboard';
import { ProfileCvA4View } from './ProfileCvA4View';
import { SchoolAboutSection } from './SchoolAboutSection';

interface ProfileCustomizationModuleProps {
  lang: 'en' | 'ur';
  onToggleLang?: () => void;
}

const ALL_CUSTOMIZABLE_CARDS = [
  ...HOME_MODULES.map((m, idx) => ({
    id: m.id,
    key: m.customKey,
    group: 'Home Screen' as const,
    label: `${idx + 1}. ${m.en}`,
    defaultEn: m.en,
    defaultUr: m.ur,
    defaultDesc: m.desc,
    defaultFrom: m.defaultGradientFrom,
    defaultTo: m.defaultGradientTo,
    DefaultIcon: m.Icon,
  })),
  ...OTHER_CORE_MODULES.map((m, idx) => ({
    id: m.id,
    key: m.id,
    group: 'Other Data' as const,
    label: `Other ${idx + 1}. ${m.en}`,
    defaultEn: m.en,
    defaultUr: m.ur,
    defaultDesc: m.desc,
    defaultFrom: m.gradientFrom,
    defaultTo: m.gradientTo,
    DefaultIcon: m.Icon,
  })),
];

export const ProfileCustomizationModule: React.FC<ProfileCustomizationModuleProps> = ({
  lang,
  onToggleLang,
}) => {
  const [activeTab, setActiveTab] = useState<
    'teacher_profile' | 'whatsapp' | 'customize' | 'about'
  >('teacher_profile');
  const [customizeSection, setCustomizeSection] = useState<
    'themes' | 'colors' | 'names' | 'icons' | 'layout'
  >('themes');
  const [settings, setSettings] = useState<AppCustomizationSettings>(() =>
    StorageService.getCustomization()
  );
  const [historyStack, setHistoryStack] = useState<AppCustomizationSettings[]>([]);
  const [selectedIconCardKey, setSelectedIconCardKey] = useState<string>('admission');
  const [iconSearchQuery, setIconSearchQuery] = useState<string>('');
  const [newThemeName, setNewThemeName] = useState<string>('');
  const [draggedCardKey, setDraggedCardKey] = useState<string | null>(null);

  const [waSettings, setWaSettings] = useState<WhatsAppCloudApiSettings>(() =>
    WhatsAppNotificationService.getSettings()
  );
  const [waLogs, setWaLogs] = useState<WhatsAppNotificationLogItem[]>(() =>
    WhatsAppNotificationService.getLogs()
  );
  const [students, setStudents] = useState<StudentRecord[]>(() =>
    StorageService.getStudents().filter((s) => s.status === 'Active')
  );
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    () => StorageService.getStudents().find((s) => s.status === 'Active')?.id || ''
  );
  const [customWaMessage, setCustomWaMessage] = useState<string>('');
  const [waSearchQuery, setWaSearchQuery] = useState<string>('');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const homeWallInputRef = useRef<HTMLInputElement>(null);
  const appWallInputRef = useRef<HTMLInputElement>(null);
  const aboutPdfInputRef = useRef<HTMLInputElement>(null);
  const teacherPhotoInputRef = useRef<HTMLInputElement>(null);
  const [activeIconUploadKey, setActiveIconUploadKey] = useState<string>('admission');
  const moduleIconInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const updateSettingsWithHistory = (
    updater: AppCustomizationSettings | ((prev: AppCustomizationSettings) => AppCustomizationSettings),
    autoSave: boolean = true
  ) => {
    setSettings((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      setHistoryStack((h) => [...h.slice(-19), prev]);
      if (autoSave) {
        StorageService.saveCustomization(next);
      }
      return next;
    });
  };

  const handleUndoCustomization = () => {
    if (historyStack.length === 0) return;
    const previous = historyStack[historyStack.length - 1];
    setHistoryStack((h) => h.slice(0, -1));
    setSettings(previous);
    StorageService.saveCustomization(previous);
    showToast('Undid last customization change!');
  };

  const handleCancelChanges = () => {
    const saved = StorageService.getCustomization();
    setSettings(saved);
    showToast('Reloaded saved customization settings.');
  };

  const handleSaveSettings = () => {
    StorageService.saveCustomization(settings);
    WhatsAppNotificationService.saveSettings(waSettings);
    showToast('All profile, WhatsApp & customization settings saved permanently!');
  };

  const handleRestoreDefaults = () => {
    setHistoryStack((h) => [...h.slice(-19), settings]);
    const def = StorageService.resetCustomizationToDefault();
    setSettings(def);
    showToast('Restored default GPS Chambai theme, card names, colors, layout & icons!');
  };

  const handleUploadImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field:
      | 'schoolLogoUrl'
      | 'homeWallpaperUrl'
      | 'appWallpaperUrl'
      | 'aboutPdfUrl'
      | 'teacherProfilePhotoUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readFileAsDataUrl(file, 'Staff Data/Staff Photos', 'Profile Module');
      const updated = { ...settings, [field]: res.dataUrl };
      updateSettingsWithHistory(updated, true);
      showToast('Uploaded and saved to GPS Chambai storage!');
    } catch {
      // ignore
    }
  };

  const handleUploadModuleCustomIcon = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readFileAsDataUrl(file, 'Other', 'Custom Module Icon');
      const updated: AppCustomizationSettings = {
        ...settings,
        customIcons: {
          ...settings.customIcons,
          [activeIconUploadKey]: res.dataUrl,
        },
      };
      updateSettingsWithHistory(updated, true);
      showToast('Custom module icon uploaded & saved!');
    } catch {
      // ignore
    }
  };

  const handleUpdateStudentPhone = (studentId: string, newPhone: string) => {
    const allStudents = StorageService.getStudents();
    const updatedAll = allStudents.map((s) =>
      s.id === studentId ? { ...s, contactNo: newPhone } : s
    );
    StorageService.saveStudents(updatedAll);
    setStudents(updatedAll.filter((s) => s.status === 'Active'));
  };

  const handleTriggerStudentInOut = async (
    student: StudentRecord,
    direction: 'IN' | 'OUT' | 'ABSENT' | 'CUSTOM',
    openWaWindow: boolean = true
  ) => {
    const res = await WhatsAppNotificationService.sendStudentInOutNotification({
      student,
      direction,
      customMessage: direction === 'CUSTOM' ? customWaMessage : undefined,
      openWhatsAppWindowIfManual: openWaWindow,
    });
    setWaLogs(WhatsAppNotificationService.getLogs());
    if (res.duplicateSkipped) {
      showToast(
        `Duplicate prevented: ${student.name} already received a "${direction}" notification today.`
      );
    } else {
      showToast(
        `Student ${direction} notification logged & sent for ${student.name} (${res.logItem.status}).`
      );
    }
  };

  const handlePrintWhatsAppHistory = () => {
    const rowsHtml = waLogs
      .map(
        (item, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td>${item.date} ${item.time}</td>
          <td><strong>${item.studentName}</strong><br/><span style="font-size:10px;color:#555;">F/Name: ${item.fatherName} (${item.className})</span></td>
          <td>${item.parentPhone}</td>
          <td><strong>${item.direction}</strong></td>
          <td>${item.messageText}</td>
          <td>${item.deliveryMethod}<br/><strong>${item.status}</strong></td>
        </tr>
      `
      )
      .join('');

    const html = `
      <h3 style="margin-bottom:8px;color:#065f46;">WhatsApp Student IN / OUT & Parent Notification Log</h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date & Time</th>
            <th>Student Name</th>
            <th>Parent Phone</th>
            <th>Type</th>
            <th>Message Content</th>
            <th>Delivery Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="7" class="text-center">No notifications logged yet.</td></tr>'}
        </tbody>
      </table>
    `;
    printHtmlDocument('WhatsApp_Parent_Notification_History', html, true);
  };

  const handlePrintTeacherProfile = () => {
    printHtmlDocument(
      'Digital Business Card — Muhammad Irfan',
      `
        <div style="max-width:680px;margin:0 auto;border:2px solid #0f172a;border-radius:18px;overflow:hidden;font-family:Arial,sans-serif;">
          <div style="background:linear-gradient(135deg,#0a0a0a 0%,#991b1b 100%);color:#fff;padding:20px;text-align:center;">
            <div style="font-size:24px;font-weight:900;">MUHAMMAD IRFAN</div>
            <div style="font-size:13px;color:#fecaca;font-weight:700;margin-top:4px;">Govt. Primary School Chambai Kohat (EMIS: 16454)</div>
          </div>
          <div style="padding:18px;font-size:13px;line-height:1.8;">
            <div><strong>Phone:</strong> 0336 90 53 352 • <strong>Email:</strong> m.irfan.25389@gmail.com</div>
            <div><strong>Address:</strong> Chambai Kohat</div>
            <div><strong>School:</strong> Govt. Primary School Chambai Kohat (EMIS: 16454 • DDO Code: KT6088)</div>
          </div>
        </div>
      `
    );
  };

  const handlePrintAboutDocument = () => {
    printHtmlDocument(
      'About GPS Chambai Kohat — Official EMIS 16454 School Profile',
      `
        <div style="border:3px solid #065f46;border-radius:16px;padding:18px;">
          <h2 style="font-size:18px;font-weight:900;color:#065f46;margin-bottom:4px;">GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT (EMIS: 16454 - APPROVED)</h2>
          <p style="font-size:12px;margin-bottom:12px;">Department: Elementary and Secondary Education Department (E&SED) Khyber Pakhtunkhwa</p>
          <table>
            <tbody>
              <tr><th>School Name</th><td>GPS CHAMBAI</td><th>EMIS Code</th><td>16454 (Approved)</td></tr>
              <tr><th>DDO Code</th><td>KT6088</td><th>School Level</th><td>PRIMARY (MALE)</td></tr>
              <tr><th>Circle Name</th><td>1 JARMA / 2 JARMA</td><th>Union Council</th><td>SUR GUL</td></tr>
              <tr><th>Tehsil & District</th><td>KOHAT</td><th>Division</th><td>KOHAT</td></tr>
              <tr><th>NA / PK</th><td>NA-35 / PK-91</td><th>Coordinates</th><td>X: 33.5139, Y: 71.4165</td></tr>
              <tr><th>Instruction Medium</th><td>ENGLISH</td><th>Urban / Rural</th><td>RURAL (SUMMER ZONE)</td></tr>
              <tr><th>Phone #</th><td>03369053352</td><th>SOS #</th><td>03339654575</td></tr>
              <tr><th>Email</th><td>gpschambaikohat@gmail.com</td><th>Post Office</th><td>BISE Kohat</td></tr>
              <tr><th>Village / Mohalla</th><td colspan="3">Village Chambai Bannu Road Kohat</td></tr>
            </tbody>
          </table>
        </div>
      `
    );
  };

  const filteredStudents = students.filter(
    (s) =>
      !waSearchQuery.trim() ||
      s.name.toLowerCase().includes(waSearchQuery.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(waSearchQuery.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(waSearchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header with Language Selection Button & Current App Version Display */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 rounded-3xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2.5 py-0.5 rounded-full">
              Official Profile, WhatsApp Alerts &amp; Settings
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight mt-1">
            {lang === 'ur' ? 'پروفائل اور ایپ کی ترتیبات' : 'Profile & App Settings'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {/* Language Selection Button moved to Profile Page (Requirement 4) */}
          {onToggleLang && (
            <button
              type="button"
              onClick={onToggleLang}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
              title="Switch Application Language (English / اردو)"
            >
              <Globe size={14} />
              <span>{lang === 'en' ? 'Language: اردو' : 'Language: English'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={handlePrintTeacherProfile}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
            title="Print Official Profile & HRIS CV"
          >
            <Printer size={14} />
            <span className="hidden xs:inline">Print Profile</span>
          </button>
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-3 py-2 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* 3 Tabs: 1. Profile CV (A4) | 2. WhatsApp Alerts | 3. School About */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('teacher_profile')}
          className={`py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 ${
            activeTab === 'teacher_profile'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700'
          }`}
        >
          <UserCheck size={14} />
          <span>1. Profile CV (A4)</span>
        </button>
        <button
          onClick={() => setActiveTab('whatsapp')}
          className={`py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 ${
            activeTab === 'whatsapp'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-700'
          }`}
        >
          <MessageSquare size={14} />
          <span>2. WhatsApp Alerts</span>
        </button>
        <button
          onClick={() => setActiveTab('about')}
          className={`py-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 ${
            activeTab === 'about' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700'
          }`}
        >
          <FileText size={14} />
          <span>3. School About</span>
        </button>
      </div>

      {/* Hidden Photo Input for Teacher Portrait */}
      <input
        ref={teacherPhotoInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={(e) => handleUploadImage(e, 'teacherProfilePhotoUrl')}
        className="hidden"
      />

      {/* TAB 1: ORIGINAL REFERENCE 029 A4 PROFILE CV + DIGITAL BUSINESS CARD */}
      {activeTab === 'teacher_profile' && (
        <div className="space-y-6">
          {/* PART 1: ORIGINAL CV DESIGN IN A4 PAGE FORMAT (IMAGE 029) WITH EDIT, SAVE & EXPORT */}
          <ProfileCvA4View
            onPhotoUpdated={(newUrl) =>
              setSettings((prev) => ({ ...prev, teacherProfilePhotoUrl: newUrl }))
            }
          />

          {/* CARD 1: MY DIGITAL BUSINESS CARD */}
          <div className="max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-slate-900">
            <div className="relative h-44 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-700 flex flex-col items-center justify-end pb-4 overflow-hidden">
              <div
                className="absolute -bottom-10 -left-10 w-64 h-28 bg-red-600 rotate-12 opacity-90"
                style={{ clipPath: 'polygon(0 0, 100% 40%, 100% 100%, 0% 100%)' }}
              />
              <div
                className="absolute -bottom-12 -right-10 w-64 h-28 bg-red-700 -rotate-12 opacity-90"
                style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)' }}
              />

              {/* Circular Portrait with Red Ring */}
              <div className="relative z-10 w-28 h-28 rounded-full border-4 border-red-600 bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center group">
                <img
                  src={settings.teacherProfilePhotoUrl || '/assets/aistudio/Microsoft_Profile_78e13ce1.png'}
                  alt="Muhammad Irfan"
                  className="w-full h-full object-cover object-top"
                />
                <button
                  type="button"
                  onClick={() => teacherPhotoInputRef.current?.click()}
                  className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-black"
                  title="Upload Portrait Photo"
                >
                  <Camera size={16} />
                  <span>Photo</span>
                </button>
              </div>
            </div>

            <div className="pt-3 pb-5 px-6 text-center space-y-1">
              <div className="flex justify-center mb-1">
                <button
                  type="button"
                  onClick={() => teacherPhotoInputRef.current?.click()}
                  className="text-[10px] font-black text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1"
                >
                  <Camera size={11} />
                  <span>Change Profile Photo</span>
                </button>
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Muhammad Irfan
              </h3>
              <p className="text-sm font-extrabold text-slate-600">
                PST (BPS - 12) • Personal No: 10829368
              </p>

              <div className="pt-4 space-y-3 text-left max-w-xs mx-auto">
                <a
                  href="tel:03369053352"
                  className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone size={18} />
                  </div>
                  <span className="text-base font-black text-slate-900 tracking-wide">
                    0336 90 53 352
                  </span>
                </a>

                <a
                  href="mailto:m.irfan.25389@gmail.com"
                  className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-slate-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Mail size={18} />
                  </div>
                  <span className="text-sm font-black text-slate-900 break-all">
                    m.irfan.25389@gmail.com
                  </span>
                </a>

                <a
                  href="https://maps.app.goo.gl/jtnBTQZVrFqfp9j8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 p-2 rounded-2xl hover:bg-red-50/60 transition-colors group cursor-pointer"
                  title="Open Chambai Kohat on Google Maps"
                >
                  <div className="w-10 h-10 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md group-hover:bg-red-600 transition-colors">
                    <MapPin size={18} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-black text-slate-900 group-hover:text-red-700 underline decoration-dotted underline-offset-4 transition-colors">
                      Chambai Kohat
                    </span>
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-red-600" />
                  </div>
                </a>
              </div>

              <div className="pt-5 flex items-center justify-center gap-2.5 flex-wrap">
                {[
                  {
                    label: 'Facebook',
                    iconSrc: '/assets/aistudio/facebook_b4556ed7.png',
                    href: 'https://web.facebook.com/gpschambaikohat/',
                  },
                  {
                    label: 'Instagram',
                    iconSrc: '/assets/aistudio/instagram_be056fee.png',
                    href: 'https://www.instagram.com/mirfan25389',
                  },
                  {
                    label: 'Twitter / X',
                    iconSrc: '/assets/aistudio/twitter_4c1342d0.png',
                    href: 'https://twitter.com/mirfan25389',
                  },
                  {
                    label: 'LinkedIn',
                    iconSrc: '/assets/aistudio/linkdin_91d33015.png',
                    href: 'https://www.linkedin.com',
                  },
                  {
                    label: 'WhatsApp',
                    iconSrc: '/assets/aistudio/whatsapp_236996ca.png',
                    href: 'https://wa.me/923369053352',
                  },
                  {
                    label: 'YouTube',
                    iconSrc: '/assets/aistudio/yputube_d9e9a0fb.png',
                    href: 'https://www.youtube.com/@GPSChambaiKohat',
                  },
                ].map((soc) => (
                  <a
                    key={soc.label}
                    href={soc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={soc.label}
                    className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-md p-1.5 flex items-center justify-center hover:scale-110 active:scale-95 transition-transform"
                  >
                    <img
                      src={soc.iconSrc}
                      alt={soc.label}
                      className="w-full h-full object-contain"
                    />
                  </a>
                ))}
              </div>
            </div>

            <div className="h-3 bg-gradient-to-r from-red-800 via-red-600 to-neutral-900" />
          </div>
        </div>
      )}

      {/* TAB 2: WHATSAPP MESSAGING & PARENT NOTIFICATION SYSTEM (REQUIREMENT 1) */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-4">
          {/* Top Overview & Mode Selector */}
          <div className="bg-white rounded-3xl p-4 border-2 border-emerald-600 shadow-md space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                  Requirement 1 • Automatic &amp; Manual Parent Alert System
                </span>
                <h3 className="text-base font-black text-slate-900 mt-1">
                  WhatsApp Messaging &amp; Student IN / OUT Notification System
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Supports Official WhatsApp Business Cloud API (Background Auto-Send) &amp; Manual WhatsApp (wa.me)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    window.dispatchEvent(
                      new CustomEvent('gps-open-folder-modal', {
                        detail: { folderPath: 'GPS Chambai/WhatsApp' },
                      })
                    )
                  }
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1"
                >
                  <FolderOpen size={13} />
                  <span>WhatsApp Folder</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    WhatsAppNotificationService.saveSettings(waSettings);
                    showToast('WhatsApp Notification Settings saved!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1"
                >
                  <Save size={13} />
                  <span>Save Config</span>
                </button>
              </div>
            </div>

            {/* Admin Enable / Disable Toggles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <label className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-black text-emerald-950">Master Alert System</div>
                  <div className="text-[10px] font-semibold text-emerald-700">
                    Enable / Disable all WhatsApp notifications
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={waSettings.enabled}
                  onChange={(e) => {
                    const next = { ...waSettings, enabled: e.target.checked };
                    setWaSettings(next);
                    WhatsAppNotificationService.saveSettings(next);
                  }}
                  className="w-5 h-5 accent-emerald-600"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-black text-slate-900">Auto Student IN Alert</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    Trigger when marked Present / QR IN
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={waSettings.autoStudentInAlert}
                  onChange={(e) => {
                    const next = { ...waSettings, autoStudentInAlert: e.target.checked };
                    setWaSettings(next);
                    WhatsAppNotificationService.saveSettings(next);
                  }}
                  className="w-5 h-5 accent-emerald-600"
                />
              </label>

              <label className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-xs font-black text-slate-900">Auto Student OUT Alert</div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    Trigger on School Departure / QR OUT
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={waSettings.autoStudentOutAlert}
                  onChange={(e) => {
                    const next = { ...waSettings, autoStudentOutAlert: e.target.checked };
                    setWaSettings(next);
                    WhatsAppNotificationService.saveSettings(next);
                  }}
                  className="w-5 h-5 accent-emerald-600"
                />
              </label>
            </div>

            {/* Delivery Mode Switcher: Cloud API vs Manual WhatsApp */}
            <div className="space-y-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-emerald-600" />
                  Select WhatsApp Delivery Mode:
                </span>
                <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      const next: WhatsAppCloudApiSettings = { ...waSettings, mode: 'cloud_api' };
                      setWaSettings(next);
                      WhatsAppNotificationService.saveSettings(next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                      waSettings.mode === 'cloud_api'
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    1. WhatsApp Business Cloud API (Auto)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const next: WhatsAppCloudApiSettings = { ...waSettings, mode: 'manual_wa' };
                      setWaSettings(next);
                      WhatsAppNotificationService.saveSettings(next);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-black transition-all ${
                      waSettings.mode === 'manual_wa'
                        ? 'bg-emerald-700 text-white'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    2. Manual WhatsApp Option (wa.me)
                  </button>
                </div>
              </div>

              {waSettings.mode === 'cloud_api' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      WhatsApp Phone Number ID
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 109283746512345"
                      value={waSettings.phoneNumberId}
                      onChange={(e) =>
                        setWaSettings({ ...waSettings, phoneNumberId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Business Account ID (WABA)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 987654321012345"
                      value={waSettings.businessAccountId}
                      onChange={(e) =>
                        setWaSettings({ ...waSettings, businessAccountId: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-600 mb-1">
                      Cloud API Permanent Access Token
                    </label>
                    <input
                      type="password"
                      placeholder="EAA..."
                      value={waSettings.accessToken}
                      onChange={(e) =>
                        setWaSettings({ ...waSettings, accessToken: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[11px] font-semibold text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                  <strong>Manual WhatsApp Mode Active:</strong> Clicking IN, OUT, or Send opens the official WhatsApp app with the parent&apos;s phone number and pre-filled message ready to send, while automatically logging the notification in <code className="text-emerald-700 font-bold">GPS Chambai/WhatsApp</code>.
                </div>
              )}
            </div>

            {/* Editable Student IN & Student OUT Message Templates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-emerald-800 mb-1">
                  Student IN Notification Template (Arrival)
                </label>
                <textarea
                  rows={2}
                  value={waSettings.studentInTemplate}
                  onChange={(e) =>
                    setWaSettings({ ...waSettings, studentInTemplate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-amber-800 mb-1">
                  Student OUT Notification Template (Departure)
                </label>
                <textarea
                  rows={2}
                  value={waSettings.studentOutTemplate}
                  onChange={(e) =>
                    setWaSettings({ ...waSettings, studentOutTemplate: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold"
                />
              </div>
            </div>
          </div>

          {/* Quick Parent Message & Predefined Templates Box */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Send Instant Parent Notification &amp; Predefined School Templates
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Select Student
                </label>
                <select
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} S/O {st.fatherName} ({st.classId} • {st.contactNo})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Load Predefined Template
                </label>
                <select
                  onChange={(e) => {
                    const tpl = waSettings.customTemplates.find((t) => t.id === e.target.value);
                    if (tpl) setCustomWaMessage(tpl.message);
                  }}
                  defaultValue=""
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="" disabled>
                    -- Choose Template --
                  </option>
                  {waSettings.customTemplates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      [{tpl.category}] {tpl.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Message Text (Placeholders: [Student Name], [Class], [Time], [Date])
              </label>
              <textarea
                rows={2}
                value={customWaMessage}
                onChange={(e) => setCustomWaMessage(e.target.value)}
                placeholder="Type custom message or select a predefined template above..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  const st = students.find((s) => s.id === selectedStudentId);
                  if (st) void handleTriggerStudentInOut(st, 'IN', true);
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <LogIn size={14} />
                <span>Send Student IN Alert</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const st = students.find((s) => s.id === selectedStudentId);
                  if (st) void handleTriggerStudentInOut(st, 'OUT', true);
                }}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <LogOut size={14} />
                <span>Send Student OUT Alert</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const st = students.find((s) => s.id === selectedStudentId);
                  if (st) void handleTriggerStudentInOut(st, 'CUSTOM', true);
                }}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <Send size={14} />
                <span>Send Custom WhatsApp Message</span>
              </button>
            </div>
          </div>

          {/* Student Parent Contact Numbers & One-Tap IN / OUT Table */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Parent Contact Numbers &amp; Quick IN / OUT Triggers ({filteredStudents.length} Students)
              </h4>
              <input
                type="text"
                placeholder="Search student or father name..."
                value={waSearchQuery}
                onChange={(e) => setWaSearchQuery(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="max-h-64 overflow-y-auto border border-slate-200 rounded-2xl divide-y divide-slate-100">
              {filteredStudents.slice(0, 40).map((st) => (
                <div
                  key={st.id}
                  className="p-2.5 flex flex-wrap items-center justify-between gap-2 hover:bg-slate-50"
                >
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {st.name}{' '}
                      <span className="text-slate-500 font-semibold">S/O {st.fatherName}</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-700">
                      Class: {st.classId} • Adm #{st.admissionNo}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={st.contactNo}
                      onChange={(e) => handleUpdateStudentPhone(st.id, e.target.value)}
                      placeholder="Parent WhatsApp #"
                      className="w-32 px-2.5 py-1 rounded-lg border border-slate-300 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => void handleTriggerStudentInOut(st, 'IN', true)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black"
                      title="Send Student Arrived (IN) Notification"
                    >
                      IN
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleTriggerStudentInOut(st, 'OUT', true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black"
                      title="Send Student Left (OUT) Notification"
                    >
                      OUT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* IN / OUT Notification History Log */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Student IN / OUT Notification History ({waLogs.length} Records)
                </h4>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Automatically backed up in GPS Chambai/WhatsApp/WhatsApp_Notifications_Log.json
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrintWhatsAppHistory}
                  className="px-2.5 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1"
                >
                  <Printer size={12} />
                  <span>Print / Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportAndSaveRealPdf(
                      'WhatsApp_IN_OUT_History',
                      `<h3>WhatsApp IN/OUT Parent Notification History</h3><p>Total Logs: ${waLogs.length}</p>`,
                      { folderSubPath: 'WhatsApp', moduleSource: 'WhatsApp System' }
                    );
                    showToast('Saved PDF to GPS Chambai/WhatsApp!');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-black"
                >
                  Save PDF
                </button>
                {waLogs.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      WhatsAppNotificationService.clearLogs();
                      setWaLogs([]);
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-700 text-[11px] font-black"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {waLogs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400 font-bold">
                No IN/OUT WhatsApp notifications sent yet. Use the IN / OUT buttons above or mark Daily Attendance.
              </div>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-2">
                {waLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                            log.direction === 'IN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : log.direction === 'OUT'
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {log.direction}
                        </span>
                        <span className="font-black text-slate-900">{log.studentName}</span>
                        <span className="text-[10px] font-bold text-slate-500">
                          ({log.className}) • {log.parentPhone}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {log.date} at {log.time}
                        </span>
                      </div>
                      <p className="text-slate-700 font-semibold leading-snug">{log.messageText}</p>
                      <div className="text-[10px] font-bold text-emerald-700">
                        {log.deliveryMethod} • Status: {log.status}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setWaLogs(WhatsAppNotificationService.deleteLog(log.id))}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Log Entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETE CUSTOMIZATION SETTINGS */}
      {activeTab === 'customize' && (
        <div className="space-y-4">
          {/* Hidden File Inputs */}
          <input
            ref={logoInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => handleUploadImage(e, 'schoolLogoUrl')}
            className="hidden"
          />
          <input
            ref={homeWallInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => handleUploadImage(e, 'homeWallpaperUrl')}
            className="hidden"
          />
          <input
            ref={appWallInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            onChange={(e) => handleUploadImage(e, 'appWallpaperUrl')}
            className="hidden"
          />
          <input
            ref={moduleIconInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,.svg,.webp"
            onChange={handleUploadModuleCustomIcon}
            className="hidden"
          />

          {/* Top Control Bar: Live Preview + Apply & Save + Undo + Cancel + Restore Default */}
          <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-md space-y-3 border border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Complete App Customization Studio
                </span>
                <h3 className="text-base font-black tracking-tight">
                  Theme, Card Colors, Bilingual Names, Icon Library &amp; Drag-and-Drop Layout
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleSaveSettings}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                >
                  <Save size={13} />
                  <span>Apply &amp; Save</span>
                </button>
                <button
                  type="button"
                  onClick={handleUndoCustomization}
                  disabled={historyStack.length === 0}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 ${
                    historyStack.length > 0
                      ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Undo2 size={13} />
                  <span>Undo ({historyStack.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelChanges}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1"
                >
                  <XCircle size={13} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  onClick={handleRestoreDefaults}
                  className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1"
                >
                  <RotateCcw size={13} />
                  <span>Restore Defaults</span>
                </button>
              </div>
            </div>

            {/* Interactive Live Preview Strip */}
            <div
              className="rounded-2xl p-3 border border-white/15 flex flex-wrap items-center justify-between gap-3"
              style={{
                backgroundColor: settings.homeBgColor || DEFAULT_CUSTOMIZATION.homeBgColor,
              }}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-10 h-10 rounded-full p-0.5 border-2 border-amber-400 shadow-sm shrink-0 overflow-hidden bg-white"
                  style={{ backgroundColor: settings.headerBgColor }}
                >
                  <img
                    src={
                      settings.customLogoDataUrl ||
                      settings.schoolLogoUrl ||
                      '/assets/aistudio/20260903_200547_79893d25.png'
                    }
                    alt="Logo Preview"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    Live Preview • Theme: {(settings.themeMode || 'emerald').toUpperCase()}
                  </div>
                  <div className="text-xs font-black text-slate-900 truncate">
                    {settings.appName} — {settings.appSubtitle}
                  </div>
                </div>
              </div>

              {/* Sample Live Card Preview */}
              {(() => {
                const sampleCard =
                  ALL_CUSTOMIZABLE_CARDS.find((c) => c.key === selectedIconCardKey) ||
                  ALL_CUSTOMIZABLE_CARDS[0];
                const cName = settings.cardCustomNames?.[sampleCard.key];
                const cFrom = settings.cardColors?.[sampleCard.key] || sampleCard.defaultFrom;
                const cTo =
                  settings.cardGradientToColors?.[sampleCard.key] || sampleCard.defaultTo;
                const cBorder =
                  settings.cardBorderColors?.[sampleCard.key] || 'rgba(255,255,255,0.35)';
                const cText = settings.cardTextColors?.[sampleCard.key] || '#FFFFFF';

                return (
                  <div
                    className="px-3.5 py-2 flex items-center gap-3 shadow-md min-w-[210px]"
                    style={{
                      background: `linear-gradient(135deg, ${cFrom} 0%, ${cTo} 100%)`,
                      borderRadius: `${settings.cardBorderRadius ?? 16}px`,
                      borderWidth: `${settings.cardBorderWidth ?? 1}px`,
                      borderStyle: 'solid',
                      borderColor: cBorder,
                      color: cText,
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/95 flex items-center justify-center shrink-0">
                      <RenderModuleIcon
                        moduleKey={sampleCard.key}
                        DefaultIcon={sampleCard.DefaultIcon}
                        size={Math.min(settings.iconSize || 22, 26)}
                        className="text-black"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-black truncate">
                        {cName?.en?.trim() || sampleCard.defaultEn}
                      </div>
                      <div
                        className="text-[11px] font-bold font-urdu truncate"
                        style={{
                          fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                        }}
                      >
                        {cName?.ur?.trim() || sampleCard.defaultUr}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* 5 Customization Sub-Navigation Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
              {[
                { id: 'themes' as const, label: '1. Themes & Header', Icon: Sparkles },
                { id: 'colors' as const, label: '2. Card Colors', Icon: Palette },
                { id: 'names' as const, label: '3. Card Names (EN/UR)', Icon: TypeIcon },
                { id: 'icons' as const, label: '4. Card Icons', Icon: ImageIcon },
                { id: 'layout' as const, label: '5. Move & Layout', Icon: LayoutGrid },
              ].map((sub) => {
                const SubIcon = sub.Icon;
                return (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => setCustomizeSection(sub.id)}
                    className={`py-2 px-2.5 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 transition-all ${
                      customizeSection === sub.id
                        ? 'bg-emerald-500 text-slate-950 shadow-xs'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <SubIcon size={13} />
                    <span>{sub.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 1: COMPLETE THEME CUSTOMIZATION */}
          {customizeSection === 'themes' && (
            <div className="space-y-4">
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  1. Built-In &amp; Custom Application Themes (Light, Dark &amp; Official Presets)
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    {
                      mode: 'emerald' as const,
                      title: 'Official Emerald (Default)',
                      desc: 'KP E&SED Green & Crisp Slate',
                      headerBg: DEFAULT_CUSTOMIZATION.headerBgColor,
                      homeBg: DEFAULT_CUSTOMIZATION.homeBgColor,
                      appBg: DEFAULT_CUSTOMIZATION.appBgColor,
                      Icon: Sparkles,
                    },
                    {
                      mode: 'light' as const,
                      title: 'Clean Light Mode',
                      desc: 'Bright Sky & Pure Daylight',
                      headerBg: '#0284c7',
                      homeBg: '#ffffff',
                      appBg: '#f8fafc',
                      Icon: Sun,
                    },
                    {
                      mode: 'dark' as const,
                      title: 'Executive Dark Mode',
                      desc: 'Deep Slate Night Interface',
                      headerBg: '#090d16',
                      homeBg: '#0f172a',
                      appBg: '#1e293b',
                      Icon: Moon,
                    },
                    {
                      mode: 'royal' as const,
                      title: 'Royal Academic Theme',
                      desc: 'Regal Indigo & Warm Ivory',
                      headerBg: '#312e81',
                      homeBg: '#f5f3ff',
                      appBg: '#ede9fe',
                      Icon: Palette,
                    },
                  ].map((preset) => {
                    const PIcon = preset.Icon;
                    const active = (settings.themeMode || 'emerald') === preset.mode;
                    return (
                      <button
                        key={preset.mode}
                        type="button"
                        onClick={() =>
                          updateSettingsWithHistory({
                            ...settings,
                            themeMode: preset.mode,
                            headerBgColor: preset.headerBg,
                            homeBgColor: preset.homeBg,
                            appBgColor: preset.appBg,
                          })
                        }
                        className={`p-3 rounded-2xl border-2 text-left transition-all ${
                          active
                            ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <PIcon size={16} className="text-emerald-700" />
                          {active && (
                            <span className="text-[9px] font-black uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-xs font-black text-slate-900">{preset.title}</div>
                        <div className="text-[10px] font-semibold text-slate-500 mt-0.5">
                          {preset.desc}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Global Theme Color Pickers (No Raw Hex Codes Displayed) */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  {[
                    {
                      label: 'Header Color',
                      value: settings.headerBgColor || DEFAULT_CUSTOMIZATION.headerBgColor,
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          headerBgColor: val,
                        }),
                    },
                    {
                      label: 'Home Background',
                      value: settings.homeBgColor || DEFAULT_CUSTOMIZATION.homeBgColor,
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          homeBgColor: val,
                        }),
                    },
                    {
                      label: 'App Background',
                      value: settings.appBgColor || DEFAULT_CUSTOMIZATION.appBgColor,
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          appBgColor: val,
                        }),
                    },
                    {
                      label: 'Navigation Bar Color',
                      value: settings.navBgColor || DEFAULT_CUSTOMIZATION.navBgColor || '#0f172a',
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          navBgColor: val,
                        }),
                    },
                    {
                      label: 'Primary Theme Color',
                      value:
                        settings.primaryAccentColor ||
                        DEFAULT_CUSTOMIZATION.primaryAccentColor ||
                        '#059669',
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          primaryAccentColor: val,
                        }),
                    },
                    {
                      label: 'Secondary Theme Color',
                      value:
                        settings.secondaryAccentColor ||
                        DEFAULT_CUSTOMIZATION.secondaryAccentColor ||
                        '#d97706',
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          secondaryAccentColor: val,
                        }),
                    },
                    {
                      label: 'Button Color',
                      value:
                        settings.buttonBgColor || DEFAULT_CUSTOMIZATION.buttonBgColor || '#059669',
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          buttonBgColor: val,
                        }),
                    },
                    {
                      label: 'Global Text Color',
                      value:
                        settings.globalTextColor ||
                        DEFAULT_CUSTOMIZATION.globalTextColor ||
                        '#0f172a',
                      onChange: (val: string) =>
                        updateSettingsWithHistory({
                          ...settings,
                          themeMode: 'custom',
                          globalTextColor: val,
                        }),
                    },
                  ].map((picker) => (
                    <label
                      key={picker.label}
                      className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 cursor-pointer hover:bg-slate-100"
                    >
                      <span className="text-[11px] font-black text-slate-800">{picker.label}</span>
                      <input
                        type="color"
                        value={picker.value}
                        onChange={(e) => picker.onChange(e.target.value)}
                        className="w-9 h-8 rounded-lg cursor-pointer border border-slate-300 shrink-0"
                      />
                    </label>
                  ))}
                </div>

                {/* Save Custom Theme Preset */}
                <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="text"
                      placeholder="Enter custom theme name (e.g. Spring Gala Theme)..."
                      value={newThemeName}
                      onChange={(e) => setNewThemeName(e.target.value)}
                      className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border border-emerald-300 text-xs font-bold bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newThemeName.trim()) return;
                        const preset: CustomThemePreset = {
                          id: `theme-${Date.now()}`,
                          name: newThemeName.trim(),
                          headerBgColor: settings.headerBgColor,
                          homeBgColor: settings.homeBgColor,
                          appBgColor: settings.appBgColor,
                          navBgColor: settings.navBgColor,
                          primaryColor: settings.primaryAccentColor,
                          secondaryColor: settings.secondaryAccentColor,
                          textColor: settings.globalTextColor,
                          cardColors: { ...settings.cardColors },
                        };
                        updateSettingsWithHistory({
                          ...settings,
                          customThemes: [...(settings.customThemes || []), preset],
                        });
                        setNewThemeName('');
                        showToast(`Saved custom theme "${preset.name}"!`);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
                    >
                      <Plus size={14} />
                      <span>Save Custom Theme</span>
                    </button>
                  </div>

                  {(settings.customThemes || []).length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {(settings.customThemes || []).map((th) => (
                        <div
                          key={th.id}
                          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 flex items-center gap-2 text-xs font-black text-slate-800"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              updateSettingsWithHistory({
                                ...settings,
                                themeMode: 'custom',
                                headerBgColor: th.headerBgColor,
                                homeBgColor: th.homeBgColor,
                                appBgColor: th.appBgColor,
                                navBgColor: th.navBgColor,
                                primaryAccentColor: th.primaryColor,
                                secondaryAccentColor: th.secondaryColor,
                                globalTextColor: th.textColor,
                                cardColors: th.cardColors
                                  ? { ...settings.cardColors, ...th.cardColors }
                                  : settings.cardColors,
                              });
                              showToast(`Applied custom theme "${th.name}"!`);
                            }}
                            className="hover:text-emerald-700"
                          >
                            Apply: {th.name}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              updateSettingsWithHistory({
                                ...settings,
                                customThemes: (settings.customThemes || []).filter(
                                  (x) => x.id !== th.id
                                ),
                              })
                            }
                            className="text-rose-600 hover:text-rose-800"
                            title="Delete Custom Theme"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Application Identity, Logo & Wallpapers */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Application Title, School Logo &amp; Wallpapers
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Application Name
                    </label>
                    <input
                      type="text"
                      value={settings.appName}
                      onChange={(e) =>
                        updateSettingsWithHistory({ ...settings, appName: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      School Subtitle / EMIS Identity
                    </label>
                    <input
                      type="text"
                      value={settings.appSubtitle}
                      onChange={(e) =>
                        updateSettingsWithHistory({ ...settings, appSubtitle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5"
                  >
                    <Upload size={14} />
                    <span>Upload School Logo</span>
                  </button>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => homeWallInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      <span>Home Wallpaper</span>
                    </button>
                    {settings.homeWallpaperUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSettingsWithHistory({ ...settings, homeWallpaperUrl: undefined })
                        }
                        className="px-2.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-black"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => appWallInputRef.current?.click()}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <ImageIcon size={14} />
                      <span>App Wallpaper</span>
                    </button>
                    {settings.appWallpaperUrl && (
                      <button
                        type="button"
                        onClick={() =>
                          updateSettingsWithHistory({ ...settings, appWallpaperUrl: undefined })
                        }
                        className="px-2.5 rounded-xl bg-rose-100 text-rose-700 text-xs font-black"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: INDIVIDUAL CARD COLOR CUSTOMIZATION */}
          {customizeSection === 'colors' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    2. Individual Card Color Pickers (Background, Gradient, Border, Text &amp; Icon)
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Customize every Home &amp; Other module card using visual color pickers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettingsWithHistory({
                      ...settings,
                      cardColors: { ...DEFAULT_CUSTOMIZATION.cardColors },
                      cardGradientToColors: {},
                      cardBorderColors: {},
                      cardTextColors: {},
                      cardIconColors: {},
                    });
                    showToast('Restored default colors for all cards!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Reset All Card Colors</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_CUSTOMIZABLE_CARDS.map((card) => {
                  const bgFrom = settings.cardColors?.[card.key] || card.defaultFrom;
                  const bgTo = settings.cardGradientToColors?.[card.key] || card.defaultTo;
                  const borderCol = settings.cardBorderColors?.[card.key] || card.defaultFrom;
                  const textCol = settings.cardTextColors?.[card.key] || card.defaultTo;
                  const iconCol = settings.cardIconColors?.[card.key] || card.defaultFrom;

                  return (
                    <div
                      key={card.key}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="w-7 h-7 rounded-lg shrink-0 shadow-xs border border-black/10"
                            style={{
                              background: `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
                            }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] font-black uppercase text-emerald-700 block leading-none">
                              {card.group}
                            </span>
                            <span className="text-xs font-black text-slate-900 truncate block">
                              {settings.cardCustomNames?.[card.key]?.en || card.defaultEn}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            const nextColors = {
                              ...settings.cardColors,
                              [card.key]: card.defaultFrom,
                            };
                            const nextGradTo = { ...(settings.cardGradientToColors || {}) };
                            const nextBorders = { ...(settings.cardBorderColors || {}) };
                            const nextTexts = { ...(settings.cardTextColors || {}) };
                            const nextIcons = { ...(settings.cardIconColors || {}) };
                            delete nextGradTo[card.key];
                            delete nextBorders[card.key];
                            delete nextTexts[card.key];
                            delete nextIcons[card.key];
                            updateSettingsWithHistory({
                              ...settings,
                              cardColors: nextColors,
                              cardGradientToColors: nextGradTo,
                              cardBorderColors: nextBorders,
                              cardTextColors: nextTexts,
                              cardIconColors: nextIcons,
                            });
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-[10px] font-black"
                        >
                          Default
                        </button>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 text-center">
                        <label className="p-1.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 cursor-pointer">
                          <span className="text-[9px] font-black text-slate-600">Primary</span>
                          <input
                            type="color"
                            value={bgFrom}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardColors: {
                                  ...settings.cardColors,
                                  [card.key]: e.target.value,
                                },
                              })
                            }
                            className="w-7 h-6 rounded cursor-pointer border-0"
                          />
                        </label>

                        <label className="p-1.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 cursor-pointer">
                          <span className="text-[9px] font-black text-slate-600">Gradient</span>
                          <input
                            type="color"
                            value={bgTo}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardGradientToColors: {
                                  ...(settings.cardGradientToColors || {}),
                                  [card.key]: e.target.value,
                                },
                              })
                            }
                            className="w-7 h-6 rounded cursor-pointer border-0"
                          />
                        </label>

                        <label className="p-1.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 cursor-pointer">
                          <span className="text-[9px] font-black text-slate-600">Border</span>
                          <input
                            type="color"
                            value={borderCol}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardBorderColors: {
                                  ...(settings.cardBorderColors || {}),
                                  [card.key]: e.target.value,
                                },
                              })
                            }
                            className="w-7 h-6 rounded cursor-pointer border-0"
                          />
                        </label>

                        <label className="p-1.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 cursor-pointer">
                          <span className="text-[9px] font-black text-slate-600">Text</span>
                          <input
                            type="color"
                            value={textCol}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardTextColors: {
                                  ...(settings.cardTextColors || {}),
                                  [card.key]: e.target.value,
                                },
                              })
                            }
                            className="w-7 h-6 rounded cursor-pointer border-0"
                          />
                        </label>

                        <label className="p-1.5 rounded-xl bg-white border border-slate-200 flex flex-col items-center gap-1 cursor-pointer">
                          <span className="text-[9px] font-black text-slate-600">Icon</span>
                          <input
                            type="color"
                            value={iconCol}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardIconColors: {
                                  ...(settings.cardIconColors || {}),
                                  [card.key]: e.target.value,
                                },
                              })
                            }
                            className="w-7 h-6 rounded cursor-pointer border-0"
                          />
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: CARD NAME & BILINGUAL TITLE CHANGING */}
          {customizeSection === 'names' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    3. Rename Cards &amp; Modules (English + Urdu Jameel Noori Nastaleeq + Subtitle)
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Changes update immediately on the Home Screen and Other Data Dashboard.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettingsWithHistory({
                      ...settings,
                      cardCustomNames: {},
                    });
                    showToast('Restored default English & Urdu names for all cards!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore Default Names</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ALL_CUSTOMIZABLE_CARDS.map((card) => {
                  const currentCustom = settings.cardCustomNames?.[card.key] || {};
                  return (
                    <div
                      key={card.key}
                      className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-slate-900">
                          {card.label} ({card.group})
                        </span>
                        {(currentCustom.en || currentCustom.ur || currentCustom.desc) && (
                          <button
                            type="button"
                            onClick={() => {
                              const nextMap = { ...(settings.cardCustomNames || {}) };
                              delete nextMap[card.key];
                              updateSettingsWithHistory({
                                ...settings,
                                cardCustomNames: nextMap,
                              });
                            }}
                            className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-700 text-[10px] font-black"
                          >
                            Reset Name
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            English Title
                          </label>
                          <input
                            type="text"
                            value={currentCustom.en ?? card.defaultEn}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardCustomNames: {
                                  ...(settings.cardCustomNames || {}),
                                  [card.key]: {
                                    ...currentCustom,
                                    en: e.target.value,
                                  },
                                },
                              })
                            }
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                            Urdu Title (جمیل نوری نستعلیق)
                          </label>
                          <input
                            type="text"
                            dir="rtl"
                            value={currentCustom.ur ?? card.defaultUr}
                            onChange={(e) =>
                              updateSettingsWithHistory({
                                ...settings,
                                cardCustomNames: {
                                  ...(settings.cardCustomNames || {}),
                                  [card.key]: {
                                    ...currentCustom,
                                    ur: e.target.value,
                                  },
                                },
                              })
                            }
                            style={{
                              fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                            }}
                            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white font-urdu"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Card Subtitle / Description
                        </label>
                        <input
                          type="text"
                          value={currentCustom.desc ?? card.defaultDesc}
                          onChange={(e) =>
                            updateSettingsWithHistory({
                              ...settings,
                              cardCustomNames: {
                                ...(settings.cardCustomNames || {}),
                                [card.key]: {
                                  ...currentCustom,
                                  desc: e.target.value,
                                },
                              },
                            })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 4: CARD ICON CUSTOMIZATION & BUILT-IN ICON LIBRARY */}
          {customizeSection === 'icons' && (
            <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                    4. Built-In School Icon Library &amp; Custom Icon Uploader
                  </h3>
                  <p className="text-[11px] font-semibold text-slate-500">
                    Choose a target card below, then click any built-in icon or upload a custom PNG / JPG / SVG icon.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    updateSettingsWithHistory({
                      ...settings,
                      customIcons: {},
                      cardBuiltInIcons: {},
                      cardIconColors: {},
                    });
                    showToast('Restored default icons for all cards!');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1"
                >
                  <RotateCcw size={12} />
                  <span>Restore All Default Icons</span>
                </button>
              </div>

              {/* Target Card Selector + Custom Upload + Icon Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    1. Select Card to Customize Icon
                  </label>
                  <select
                    value={selectedIconCardKey}
                    onChange={(e) => setSelectedIconCardKey(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black bg-white"
                  >
                    {ALL_CUSTOMIZABLE_CARDS.map((c) => (
                      <option key={c.key} value={c.key}>
                        [{c.group}] {settings.cardCustomNames?.[c.key]?.en || c.defaultEn}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    2. Global Icon Size ({settings.iconSize}px)
                  </label>
                  <input
                    type="range"
                    min={16}
                    max={34}
                    value={settings.iconSize}
                    onChange={(e) =>
                      updateSettingsWithHistory({
                        ...settings,
                        iconSize: Number(e.target.value),
                      })
                    }
                    className="w-full accent-emerald-700 mt-1.5"
                  />
                </div>

                <div className="flex flex-col justify-end gap-1.5">
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveIconUploadKey(selectedIconCardKey);
                        moduleIconInputRef.current?.click();
                      }}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5"
                    >
                      <Upload size={13} />
                      <span>Upload PNG/SVG Icon</span>
                    </button>
                    {(settings.customIcons?.[selectedIconCardKey] ||
                      settings.cardBuiltInIcons?.[selectedIconCardKey]) && (
                      <button
                        type="button"
                        onClick={() => {
                          const nextCustom = { ...settings.customIcons };
                          const nextBuiltIn = { ...(settings.cardBuiltInIcons || {}) };
                          delete nextCustom[selectedIconCardKey];
                          delete nextBuiltIn[selectedIconCardKey];
                          updateSettingsWithHistory({
                            ...settings,
                            customIcons: nextCustom,
                            cardBuiltInIcons: nextBuiltIn,
                          });
                          showToast('Restored default icon for selected card!');
                        }}
                        className="px-2.5 py-2 rounded-xl bg-rose-100 text-rose-700 text-xs font-black"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Search Built-in Icons */}
              <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                <Search size={14} className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search built-in school & administrative icons..."
                  value={iconSearchQuery}
                  onChange={(e) => setIconSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold focus:outline-none"
                />
              </div>

              {/* Icon Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                {BUILT_IN_ICON_LIBRARY.filter(
                  (item) =>
                    !iconSearchQuery.trim() ||
                    item.label.toLowerCase().includes(iconSearchQuery.toLowerCase()) ||
                    item.category.toLowerCase().includes(iconSearchQuery.toLowerCase())
                ).map((item) => {
                  const IconComp = item.Icon;
                  const isSelected =
                    settings.cardBuiltInIcons?.[selectedIconCardKey] === item.id &&
                    !settings.customIcons?.[selectedIconCardKey];

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        const nextCustom = { ...settings.customIcons };
                        delete nextCustom[selectedIconCardKey];
                        updateSettingsWithHistory({
                          ...settings,
                          customIcons: nextCustom,
                          cardBuiltInIcons: {
                            ...(settings.cardBuiltInIcons || {}),
                            [selectedIconCardKey]: item.id,
                          },
                        });
                        showToast(`Assigned "${item.label}" icon!`);
                      }}
                      className={`p-2.5 rounded-2xl border-2 flex flex-col items-center justify-center gap-1.5 text-center transition-all ${
                        isSelected
                          ? 'border-emerald-600 bg-emerald-50 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-white shadow-2xs flex items-center justify-center border border-slate-100">
                        <IconComp size={24} className="text-slate-900" />
                      </div>
                      <span className="text-[10px] font-black text-slate-800 leading-tight line-clamp-2">
                        {item.label}
                      </span>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-full">
                        {item.category}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 5: DRAG & DROP CARD MOVEMENT, REORDERING & LAYOUT CUSTOMIZATION */}
          {customizeSection === 'layout' && (
            <div className="space-y-4">
              {/* Layout Dimensions, Columns, Border & Shadow */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  5A. Dashboard Grid Columns, Card Size, Border &amp; Shadow Style
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Dashboard Columns Per Row
                    </label>
                    <select
                      value={settings.dashboardColumns || 2}
                      onChange={(e) =>
                        updateSettingsWithHistory({
                          ...settings,
                          dashboardColumns: Number(e.target.value) as 1 | 2 | 3 | 4,
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value={1}>1 Column (Full Width Cards)</option>
                      <option value={2}>2 Columns (Standard Mobile Grid)</option>
                      <option value={3}>3 Columns (Compact Tablet Grid)</option>
                      <option value={4}>4 Columns (Wide Desktop Grid)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Home Module Card Height
                    </label>
                    <select
                      value={settings.cardSize}
                      onChange={(e) =>
                        updateSettingsWithHistory({
                          ...settings,
                          cardSize: e.target.value as AppCustomizationSettings['cardSize'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="compact">Compact (68px)</option>
                      <option value="normal">Normal (76px)</option>
                      <option value="spacious">Spacious (86px)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Card Shadow Depth
                    </label>
                    <select
                      value={settings.cardShadow || 'md'}
                      onChange={(e) =>
                        updateSettingsWithHistory({
                          ...settings,
                          cardShadow: e.target.value as AppCustomizationSettings['cardShadow'],
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                    >
                      <option value="none">Flat (No Shadow)</option>
                      <option value="sm">Soft Subtle Shadow</option>
                      <option value="md">Standard 3D Glow</option>
                      <option value="lg">Deep Elevated Shadow</option>
                      <option value="xl">Maximum Floating Shadow</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Card Corner Border Radius ({settings.cardBorderRadius}px)
                    </label>
                    <input
                      type="range"
                      min={6}
                      max={32}
                      value={settings.cardBorderRadius}
                      onChange={(e) =>
                        updateSettingsWithHistory({
                          ...settings,
                          cardBorderRadius: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      Card Border Thickness ({settings.cardBorderWidth ?? 1}px)
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      value={settings.cardBorderWidth ?? 1}
                      onChange={(e) =>
                        updateSettingsWithHistory({
                          ...settings,
                          cardBorderWidth: Number(e.target.value),
                        })
                      }
                      className="w-full accent-emerald-700"
                    />
                  </div>
                </div>
              </div>

              {/* Drag and Drop Reordering for Home Screen Cards */}
              <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
                      5B. Drag &amp; Drop Home Screen Card Arrangement
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Drag any card or tap the Up / Down arrows to move cards to your preferred position.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      updateSettingsWithHistory({
                        ...settings,
                        homeCardOrder: HOME_MODULES.map((m) => m.id),
                        otherCardOrder: OTHER_CORE_MODULES.map((m) => m.id),
                      });
                      showToast('Restored default Home & Other card arrangement!');
                    }}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1"
                  >
                    <RotateCcw size={12} />
                    <span>Restore Default Layout</span>
                  </button>
                </div>

                {(() => {
                  const order =
                    settings.homeCardOrder && settings.homeCardOrder.length > 0
                      ? settings.homeCardOrder
                      : HOME_MODULES.map((m) => m.id);
                  const map = new Map(HOME_MODULES.map((m) => [m.id, m]));
                  const orderedHome = order
                    .map((id) => map.get(id as any))
                    .filter(Boolean) as typeof HOME_MODULES;
                  HOME_MODULES.forEach((m) => {
                    if (!orderedHome.some((x) => x.id === m.id)) orderedHome.push(m);
                  });

                  const moveHomeCard = (fromIdx: number, toIdx: number) => {
                    if (toIdx < 0 || toIdx >= orderedHome.length || fromIdx === toIdx) return;
                    const nextIds = orderedHome.map((m) => m.id);
                    const [moved] = nextIds.splice(fromIdx, 1);
                    nextIds.splice(toIdx, 0, moved);
                    updateSettingsWithHistory({
                      ...settings,
                      homeCardOrder: nextIds,
                    });
                  };

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orderedHome.map((mod, idx) => (
                        <div
                          key={mod.id}
                          draggable
                          onDragStart={() => setDraggedCardKey(mod.id)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (!draggedCardKey) return;
                            const fromIdx = orderedHome.findIndex((m) => m.id === draggedCardKey);
                            if (fromIdx >= 0) moveHomeCard(fromIdx, idx);
                            setDraggedCardKey(null);
                          }}
                          className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2 cursor-grab active:cursor-grabbing hover:border-emerald-400"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <GripVertical size={15} className="text-slate-400 shrink-0" />
                            <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <div className="min-w-0">
                              <div className="text-xs font-black text-slate-900 truncate">
                                {settings.cardCustomNames?.[mod.customKey]?.en || mod.en}
                              </div>
                              <div
                                className="text-[11px] font-bold text-slate-600 font-urdu truncate"
                                style={{
                                  fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
                                }}
                              >
                                {settings.cardCustomNames?.[mod.customKey]?.ur || mod.ur}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => moveHomeCard(idx, idx - 1)}
                              disabled={idx === 0}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                              title="Move Up"
                            >
                              <ArrowUp size={13} />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveHomeCard(idx, idx + 1)}
                              disabled={idx === orderedHome.length - 1}
                              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 disabled:opacity-40"
                              title="Move Down"
                            >
                              <ArrowDown size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SCHOOL ABOUT ME — EDITABLE OFFICIAL EMIS 16454 DATA, 4 WORKING LINKS & A4 EXPORT */}
      {activeTab === 'about' && (
        <SchoolAboutSection
          aboutPdfUrl={settings.aboutPdfUrl}
          onUploadAboutPdf={(e) => handleUploadImage(e, 'aboutPdfUrl')}
          onShowToast={showToast}
        />
      )}
    </div>
  );
};
