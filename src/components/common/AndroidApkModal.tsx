import React from 'react';
import { Smartphone, X } from 'lucide-react';
import { ApkBuildDownloadPanel } from './ApkBuildDownloadPanel';
import { DEFAULT_APK_BUILD_MANIFEST } from '../../data/apkBuildManifest';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3.5 animate-fade-in">
      <div className="bg-slate-50 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center shrink-0">
              <Smartphone size={22} className="text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-0.5 rounded-full text-amber-300">
                v{DEFAULT_APK_BUILD_MANIFEST.currentVersionName} •{' '}
                {DEFAULT_APK_BUILD_MANIFEST.latestBuildNumber} • V1+V2 Signed APK
              </span>
              <h3 className="text-base font-black tracking-tight mt-0.5">
                {lang === 'ur'
                  ? 'اے پی کے بلڈ، ورژن کنٹرول اور ڈاؤن لوڈ سسٹم'
                  : 'APK Build, Version Control & Download System'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white"
          >
            <X size={17} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto">
          <ApkBuildDownloadPanel lang={lang} />
        </div>
      </div>
    </div>
  );
};
