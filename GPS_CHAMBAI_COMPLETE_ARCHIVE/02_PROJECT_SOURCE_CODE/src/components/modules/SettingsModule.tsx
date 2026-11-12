import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  Upload, 
  RefreshCw, 
  Smartphone, 
  Languages, 
  CheckCircle2, 
  AlertCircle,
  FileCode2,
  Building,
  Info
} from 'lucide-react';
import { Language, SchoolSettings } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';

interface SettingsModuleProps {
  onBack: () => void;
  currentLang: Language;
  onToggleLang: () => void;
  onDownloadProject: () => void;
  isDownloadingZip: boolean;
}

export const SettingsModule: React.FC<SettingsModuleProps> = ({
  onBack,
  currentLang,
  onToggleLang,
  onDownloadProject,
  isDownloadingZip
}) => {
  const t = translations[currentLang];
  const [settings, setSettings] = useState<SchoolSettings>(StorageService.getSettings());
  const [statusMessage, setStatusMessage] = useState<{ text: string; error?: boolean } | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(settings);
    setStatusMessage({ text: 'School settings updated successfully.' });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleExportJSON = () => {
    const jsonStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `GPS_Chambai_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setStatusMessage({ text: t.backupSuccess });
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importDatabaseJSON(content);
      if (success) {
        setStatusMessage({ text: t.restoreSuccess });
        setSettings(StorageService.getSettings());
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setStatusMessage({ text: 'Invalid backup file structure.', error: true });
      }
    };
    reader.readAsText(file);
  };

  const handleResetDefaults = () => {
    if (confirm('Reset all school records back to the default initial dataset?')) {
      StorageService.resetToDefaults();
      setSettings(StorageService.getSettings());
      setStatusMessage({ text: t.demoDataLoaded });
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900 leading-tight">
            {t.settingsTitle}
          </h2>
          <p className="text-xs text-slate-500">
            {t.appInfo}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-3.5 rounded-xl border flex items-center gap-2 text-xs font-semibold animate-in fade-in ${
          statusMessage.error
            ? 'bg-rose-50 border-rose-300 text-rose-800'
            : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          {statusMessage.error ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Android Studio Project Export Highlight Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/40 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-3 rounded-2xl bg-amber-500 text-slate-950 shadow-md shrink-0">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  Native Android Studio Project
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                  Ready to Build
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl leading-relaxed">
                Full native Gradle Kotlin Jetpack Compose Material 3 codebase with Room SQLite database, AndroidManifest, resources, and multilingual string catalogs.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <a
              href="/app-release.apk"
              download="app-release.apk"
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>{currentLang === 'ur' ? 'ڈاؤنلوڈ ریلیز APK' : 'Download Release APK'}</span>
            </a>

            <a
              href="/app-debug.apk"
              download="app-debug.apk"
              className="px-3.5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white text-xs font-semibold shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{currentLang === 'ur' ? 'ڈیبگ APK' : 'Debug APK'}</span>
            </a>

            <button
              onClick={onDownloadProject}
              disabled={isDownloadingZip}
              className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-all shrink-0 border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingZip ? 'Packaging...' : (currentLang === 'ur' ? 'سورس .ZIP' : 'Source .ZIP')}</span>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-700/80 pt-3 text-xs text-slate-400 grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div><span className="text-white font-semibold">Package:</span> pk.edu.gpschambai.schoolapp</div>
          <div><span className="text-white font-semibold">SDK Target:</span> Android 15 (API 35) / Min 24</div>
          <div><span className="text-white font-semibold">Build Tool:</span> Gradle 8.7 + Kotlin 2.0</div>
        </div>
      </div>

      {/* Language Setting */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">{t.languageSetting}</h3>
            <p className="text-xs text-slate-500">
              {currentLang === 'en' ? 'Currently using English (LTR)' : 'فی الحال اردو (دائیں سے بائیں) فعال ہے'}
            </p>
          </div>
        </div>

        <button
          onClick={onToggleLang}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all"
        >
          {currentLang === 'en' ? 'اردو میں تبدیل کریں' : 'Switch to English'}
        </button>
      </div>

      {/* Database Backup & Restore */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-emerald-600" />
          <span>Local Database Backup & Restore</span>
        </h3>
        <p className="text-xs text-slate-500">
          Export all student records, books, videos, attendance registers, lesson plans, and timetables as an offline JSON backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>{t.backupDatabase}</span>
          </button>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors border border-slate-300">
            <Upload className="w-4 h-4" />
            <span>{t.restoreDatabase}</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          <button
            onClick={handleResetDefaults}
            className="px-4 py-2 rounded-xl text-rose-700 bg-rose-50 hover:bg-rose-100 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* School Information Form */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Building className="w-4 h-4 text-emerald-600" />
          <span>School Metadata & Academic Profile</span>
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (English)</label>
              <input
                type="text"
                value={settings.schoolNameEn}
                onChange={(e) => setSettings({ ...settings, schoolNameEn: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">School Name (Urdu)</label>
              <input
                type="text"
                value={settings.schoolNameUr}
                onChange={(e) => setSettings({ ...settings, schoolNameUr: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 urdu-text text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.academicYear}</label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.headmaster}</label>
              <input
                type="text"
                value={settings.headmasterName}
                onChange={(e) => setSettings({ ...settings, headmasterName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">{t.contactNumber}</label>
              <input
                type="text"
                value={settings.contactPhone}
                onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
            >
              {t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
