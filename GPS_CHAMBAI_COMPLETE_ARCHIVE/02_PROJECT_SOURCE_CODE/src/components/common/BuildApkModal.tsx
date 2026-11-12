import React, { useState } from 'react';
import { 
  Download, 
  Terminal, 
  Check, 
  Copy, 
  Smartphone, 
  FolderArchive, 
  ExternalLink, 
  X,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import { Language } from '../../types';

interface BuildApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadProject: () => void;
  isDownloadingZip: boolean;
  currentLang: Language;
}

export const BuildApkModal: React.FC<BuildApkModalProps> = ({
  isOpen,
  onClose,
  onDownloadProject,
  isDownloadingZip,
  currentLang
}) => {
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState<'release' | 'debug' | null>(null);
  const isUrdu = currentLang === 'ur';

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const handleDownloadApk = async (
    e: React.MouseEvent<HTMLAnchorElement>,
    variant: 'release' | 'debug'
  ) => {
    e.preventDefault();
    if (downloadingApk) return;
    setDownloadingApk(variant);
    const url =
      variant === 'release'
        ? '/app-release.apk'
        : '/app-debug.apk';
    const fileName =
      variant === 'release'
        ? 'GPS_Chambai_Kohat_v1.0.0_release.apk'
        : 'GPS_Chambai_Kohat_v1.0.0_debug.apk';
    try {
      const response = await fetch(url, { cache: 'no-store' });
      const buffer = await response.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      // Verify ZIP/APK magic header (PK\x03\x04)
      if (bytes.length > 4 && bytes[0] === 0x50 && bytes[1] === 0x4b) {
        const blob = new Blob([buffer], {
          type: 'application/vnd.android.package-archive',
        });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        window.location.href = url;
      }
    } catch {
      window.location.href = url;
    } finally {
      setDownloadingApk(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 shadow-md">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {isUrdu ? 'اینڈرائیڈ اے پی کے (APK) بنائیں' : 'Build & Generate Android APK'}
              </h3>
              <p className="text-xs text-emerald-200">
                GPS Chambai · pk.edu.gpschambai.schoolapp
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-slate-700">
          {/* Direct APK Download Banners - Release & Debug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Release APK Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-teal-950 text-white border-2 border-amber-400 shadow-xl flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[10px] font-bold">
                  <span>✓ {isUrdu ? 'پروڈکشن ریلیز (V1+V2+V3 Signed)' : 'Signed Release (V1+V2+V3)'}</span>
                  <span>·</span>
                  <span>v1.0.0</span>
                </div>
                <h4 className="font-extrabold text-white text-base">
                  app-release.apk
                </h4>
                <p className="text-[11px] text-emerald-200 leading-relaxed">
                  {isUrdu 
                    ? 'اینڈرائیڈ 5.0 سے 15+ تک تمام فونز پر فوری انسٹال ہونے والا تصدیق شدہ APK'
                    : 'aapt2 + d8 compiled, zipaligned & apksigner V1/V2/V3 signed APK (Android 5.0–15+).'}
                </p>
                <code className="text-[10px] text-amber-300 font-mono block pt-1 break-all">
                  /apk/app-release.apk · /app-release.apk (2.91 MB)
                </code>
              </div>

              <a
                href="/app-release.apk"
                download="GPS_Chambai_Kohat_v1.0.0_release.apk"
                type="application/vnd.android.package-archive"
                onClick={(e) => handleDownloadApk(e, 'release')}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:from-amber-500 text-slate-950 text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>
                  {downloadingApk === 'release'
                    ? (isUrdu ? 'ڈاؤنلوڈ ہو رہا ہے...' : 'Downloading APK...')
                    : (isUrdu ? 'ڈاؤنلوڈ app-release.apk' : 'Download app-release.apk')}
                </span>
              </a>
            </div>

            {/* Debug APK Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white border border-slate-700 shadow-lg flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                  <span>🛠 {isUrdu ? 'ٹیسٹنگ بلڈ' : 'Debug / Testing'}</span>
                  <span>·</span>
                  <span>v1.0.0</span>
                </div>
                <h4 className="font-extrabold text-white text-base">
                  app-debug.apk
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  {isUrdu 
                    ? 'ڈیبگ لاگز اور فوری انسٹالیشن اور ٹیسٹنگ کے لیے تیار فائل'
                    : 'Debug-signed APK binary for testing and sideloading.'}
                </p>
                <code className="text-[10px] text-blue-300 font-mono block pt-1 break-all">
                  /apk/app-debug.apk · /app-debug.apk (2.91 MB)
                </code>
              </div>

              <a
                href="/app-debug.apk"
                download="GPS_Chambai_Kohat_v1.0.0_debug.apk"
                type="application/vnd.android.package-archive"
                onClick={(e) => handleDownloadApk(e, 'debug')}
                className="w-full py-3 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white text-xs font-bold shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>
                  {downloadingApk === 'debug'
                    ? (isUrdu ? 'ڈاؤنلوڈ ہو رہا ہے...' : 'Downloading APK...')
                    : (isUrdu ? 'ڈاؤنلوڈ app-debug.apk' : 'Download app-debug.apk')}
                </span>
              </a>
            </div>
          </div>

          {/* Android Studio Source Project Download */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                <FolderArchive className="w-4 h-4 text-emerald-700" />
                <span>{isUrdu ? 'مکمل اینڈرائیڈ اسٹوڈیو سورس کوڈ (.ZIP)' : 'Full Android Studio Source Project (.ZIP)'}</span>
              </h5>
              <p className="text-[11px] text-slate-500">
                {isUrdu
                  ? 'گریڈل اسکرپٹس، جیٹ پیک کمپوز، اور روم ڈیٹابیس فائلز پر مشتمل پراجیکٹ'
                  : 'Includes all Kotlin source files, Room SQLite database, Gradle scripts, icons, and AndroidManifest.'}
              </p>
            </div>

            <button
              onClick={onDownloadProject}
              disabled={isDownloadingZip}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloadingZip ? 'Preparing ZIP...' : (isUrdu ? 'سورس زپ ڈاؤنلوڈ کریں' : 'Download Source .ZIP')}</span>
            </button>
          </div>

          {/* 3 Step Visual Guide */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isUrdu ? 'اے پی کے بنانے کے ۳ آسان مراحل:' : '3 Simple Steps to Build Your APK:'}</span>
            </h4>

            {/* Step 1 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isUrdu ? 'پراجیکٹ زپ کھولیں (Extract ZIP)' : 'Extract the Project ZIP'}
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isUrdu
                    ? 'ڈاؤنلوڈ کردہ GPS_Chambai_Android_Studio_Project.zip کو اپنے کمپیوٹر یا لیپ ٹاپ پر ان زپ کریں۔'
                    : 'Unzip the downloaded file on your computer or laptop.'}
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div className="flex-1 space-y-2">
                <div>
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {isUrdu ? 'اینڈرائیڈ اسٹوڈیو یا ٹرمینل میں کھولیں' : 'Open in Android Studio or Terminal'}
                  </h5>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {isUrdu
                      ? 'Android Studio میں File > Open کر کے پراجیکٹ فولڈر سلیکٹ کریں، یا سیدھا ٹرمینل میں کمانڈ چلائیں:'
                      : 'In Android Studio select File > Open..., or run the Gradle command directly in terminal:'}
                  </p>
                </div>

                {/* Command box */}
                <div className="space-y-1.5">
                  <div className="bg-slate-900 text-emerald-400 p-2.5 rounded-lg font-mono text-xs flex items-center justify-between border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[10px] block"># Release build (recommended):</span>
                      <span>./gradlew assembleRelease</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('./gradlew assembleRelease')}
                      className="p-1.5 hover:text-white rounded bg-slate-800 text-slate-300 text-[11px] flex items-center gap-1 shrink-0"
                    >
                      {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-900 text-blue-400 p-2 rounded-lg font-mono text-[11px] flex items-center justify-between border border-slate-800">
                    <div>
                      <span className="text-slate-400 text-[9px] block"># Debug build:</span>
                      <span>./gradlew assembleDebug</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard('./gradlew assembleDebug')}
                      className="p-1 hover:text-white rounded bg-slate-800 text-slate-300 text-[10px] flex items-center gap-1 shrink-0"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <h5 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isUrdu ? 'اے پی کے فائل حاصل کریں (Ready APK)' : 'Get Your Ready APK'}
                </h5>
                <p className="text-xs text-slate-600 mt-0.5">
                  {isUrdu
                    ? 'آپ کا انسٹال کے لیے تیار APK اس پاتھ پر موجود ہوگا:'
                    : 'Your installable APK will be generated at this exact path:'}
                </p>
                <code className="mt-1 block font-mono text-[11px] bg-slate-200/80 text-slate-800 px-2 py-1 rounded">
                  app/build/outputs/apk/debug/app-debug.apk
                </code>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1">
                  ✓ {isUrdu ? 'اس فائل کو کسی بھی اینڈرائیڈ فون پر واٹس ایپ یا یو ایس بی کے ذریعے ٹرانسفر کریں اور انسٹال دبائیں!' : 'Transfer this file to any Android phone via USB/WhatsApp and tap Install!'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Govt. Primary School Chambai Kohat
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            {isUrdu ? 'بند کریں' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
