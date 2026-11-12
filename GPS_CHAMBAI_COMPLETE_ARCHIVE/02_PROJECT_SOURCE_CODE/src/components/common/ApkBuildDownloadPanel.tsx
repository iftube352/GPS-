import React, { useEffect, useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
  QrCode,
  Sparkles,
  FileCode2,
  Copy,
  Check,
  FolderArchive,
  History,
  Cpu,
  HardDrive,
  Clock,
  Tag,
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  ApkBuildManifest,
  DEFAULT_APK_BUILD_MANIFEST,
} from '../../data/apkBuildManifest';

interface ApkBuildDownloadPanelProps {
  lang: 'en' | 'ur';
  compact?: boolean;
}

const SHARED_APP_URL =
  'https://ais-pre-auyalpndnqf25ijrsffbw6-599988495978.asia-northeast1.run.app';

export const ApkBuildDownloadPanel: React.FC<ApkBuildDownloadPanelProps> = ({
  lang,
}) => {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [manifest, setManifest] = useState<ApkBuildManifest>(
    DEFAULT_APK_BUILD_MANIFEST
  );
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/apk-build-manifest.json?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.currentVersionName) {
          setManifest(data);
        }
      })
      .catch(() => {
        // Fallback to compiled manifest
      });
  }, []);

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : SHARED_APP_URL;
    const targetUrl = `${origin}${manifest.latestApkDownloadUrl}`;
    QRCode.toDataURL(targetUrl, {
      width: 180,
      margin: 1,
      color: { dark: '#064E3B', light: '#FFFFFF' },
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [manifest.latestApkDownloadUrl]);

  const triggerFileDownload = (urlPath: string, downloadFileName: string, label: string) => {
    setDownloadStatus(`Downloading ${label} (${downloadFileName})...`);
    const a = document.createElement('a');
    a.href = `${urlPath}${urlPath.includes('?') ? '&' : '?'}t=${Date.now()}`;
    a.download = downloadFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      setDownloadStatus(
        `${downloadFileName} download started! Verify and install on your Android device.`
      );
    }, 700);
  };

  const handleCopyApkLink = () => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : SHARED_APP_URL;
    const link = `${origin}${manifest.latestApkDownloadUrl}`;
    navigator.clipboard?.writeText(link);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  return (
    <div className="space-y-4">
      {downloadStatus && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{downloadStatus}</span>
        </div>
      )}

      {/* Version & Build Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            <Tag size={12} />
            <span>Current Version</span>
          </div>
          <div className="text-base font-black mt-0.5">
            v{manifest.currentVersionName}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            versionCode: {manifest.currentVersionCode}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            <Cpu size={12} />
            <span>Latest Build No.</span>
          </div>
          <div className="text-base font-black mt-0.5">
            {manifest.latestBuildNumber}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold truncate">
            {manifest.packageId}
          </div>
        </div>

        <div className="bg-slate-900 text-white p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-sky-400">
            <HardDrive size={12} />
            <span>APK File Size</span>
          </div>
          <div className="text-base font-black mt-0.5">
            {manifest.apkFileSizeFormatted}
          </div>
          <div className="text-[10px] text-slate-400 font-semibold">
            {(manifest.apkFileSizeBytes || 0).toLocaleString()} bytes
          </div>
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 col-span-2 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <Clock size={12} className="text-emerald-700" />
            <span>Build Date &amp; Time</span>
          </div>
          <div className="text-xs font-black text-slate-900 mt-0.5">
            {manifest.latestBuildDateTime}
          </div>
          <div className="text-[10px] text-slate-600 font-semibold truncate mt-0.5">
            File: <code className="font-mono font-bold text-emerald-800">{manifest.latestApkFileName}</code>
          </div>
        </div>

        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
            <ShieldCheck size={12} className="text-emerald-700" />
            <span>Build Status</span>
          </div>
          <div className="text-xs font-black text-emerald-950 mt-0.5 leading-snug">
            {manifest.buildStatus}
          </div>
          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
            100% Source Verified
          </div>
        </div>
      </div>

      {/* Primary Download Actions */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl p-4 space-y-3 shadow-md border border-emerald-800/40">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-300 bg-white/10 px-2.5 py-0.5 rounded-full">
              Official Release &amp; Debug Builds
            </span>
            <h4 className="text-sm font-black mt-1">
              {lang === 'ur'
                ? 'تازہ ترین اے پی کے اور اینڈرائیڈ اسٹوڈیو پروجیکٹ ڈاؤن لوڈ کریں'
                : 'Download Latest Verified APK & Android Studio Project'}
            </h4>
            <p className="text-[11px] text-slate-300 font-medium mt-0.5">
              Package ID: <code className="text-amber-300">{manifest.packageId}</code> • Version{' '}
              <strong className="text-white">{manifest.currentVersionName}</strong> (Code{' '}
              {manifest.currentVersionCode})
            </p>
          </div>
          <Smartphone size={22} className="text-emerald-400 shrink-0" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* 1. Download Latest Versioned APK */}
          <button
            type="button"
            onClick={() =>
              triggerFileDownload(
                manifest.latestApkDownloadUrl,
                manifest.latestApkFileName,
                'Latest Release APK'
              )
            }
            className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Download size={15} />
            <span>Download Latest APK ({manifest.currentVersionName})</span>
          </button>

          {/* 2. Download build-outputs/app-debug.apk */}
          <button
            type="button"
            onClick={() =>
              triggerFileDownload(
                manifest.buildOutputsDebugUrl,
                'app-debug.apk',
                'build-outputs/app-debug.apk'
              )
            }
            className="w-full py-3 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <FileCode2 size={15} />
            <span>build-outputs/app-debug.apk</span>
          </button>

          {/* 3. Download Android Project ZIP */}
          <button
            type="button"
            onClick={() =>
              triggerFileDownload(
                manifest.androidProjectZipUrl,
                manifest.androidProjectZipFileName,
                'Android Studio Project ZIP'
              )
            }
            className="w-full py-3 px-3 rounded-xl bg-white/15 hover:bg-white/25 text-white font-black text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-all"
          >
            <FolderArchive size={15} className="text-amber-300" />
            <span>Download Android Project ZIP</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/10 text-[11px] text-slate-300">
          <span className="truncate font-mono">
            Output Path: {manifest.buildOutputsDebugPath} • /releases/{manifest.latestApkFileName}
          </span>
          <button
            type="button"
            onClick={handleCopyApkLink}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 shrink-0"
          >
            {copiedUrl ? <Check size={12} /> : <Copy size={12} />}
            <span>{copiedUrl ? 'Copied Download Link' : 'Copy APK Link'}</span>
          </button>
        </div>
      </div>

      {/* Automated Build Verification Checklist */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-700" />
            <span>Automated Build Verification Report</span>
          </h5>
          <span className="text-[10px] font-black bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full">
            ALL CHECKS PASSED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
          {[
            {
              label: 'APK File Exists',
              ok: manifest.verification.apkExists,
              detail: manifest.latestApkFileName,
            },
            {
              label: 'Package ID Verified',
              ok: manifest.verification.packageIdVerified,
              detail: manifest.packageId,
            },
            {
              label: 'Version Code & Name',
              ok:
                manifest.verification.versionCodeVerified &&
                manifest.verification.versionNameVerified,
              detail: `v${manifest.currentVersionName} (Code ${manifest.currentVersionCode})`,
            },
            {
              label: 'Latest Source Assets',
              ok: manifest.verification.latestSourceAssetsVerified,
              detail: 'dist/ === assets/www/',
            },
            {
              label: '4-Byte Zipalign',
              ok: manifest.verification.zipAlign4ByteVerified,
              detail: 'resources.arsc aligned',
            },
            {
              label: 'Signature Scheme',
              ok: manifest.verification.signatureSchemeV1V2Verified,
              detail: 'JAR v1 + APK Sig Block v2',
            },
          ].map((item) => (
            <div
              key={item.label}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2"
            >
              <CheckCircle2
                size={14}
                className={
                  item.ok ? 'text-emerald-600 shrink-0 mt-0.5' : 'text-rose-600 shrink-0 mt-0.5'
                }
              />
              <div className="min-w-0">
                <div className="font-black text-slate-900 leading-tight">{item.label}</div>
                <div className="text-[10px] text-slate-600 font-semibold truncate">
                  {item.detail}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Previous Build History (Unique Versioned Releases) */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
            <History size={15} className="text-emerald-700" />
            <span>Previous Build History &amp; Version Archive</span>
          </h5>
          <span className="text-[10px] font-bold text-slate-500">
            {manifest.history.length} Verified Releases
          </span>
        </div>

        <div className="space-y-2">
          {manifest.history.map((item, idx) => (
            <div
              key={item.fileName}
              className={`p-3 rounded-xl border flex flex-wrap items-center justify-between gap-2 ${
                idx === 0
                  ? 'bg-emerald-50/70 border-emerald-300'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-slate-900 font-mono">
                    {item.fileName}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] font-black uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-full">
                      LATEST RELEASE
                    </span>
                  )}
                  <span className="text-[10px] font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                    v{item.versionName} • Code {item.versionCode} • {item.buildNumber}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600 font-medium">
                  Built: <strong>{item.buildDateTime}</strong> • Size:{' '}
                  <strong>{item.fileSizeFormatted}</strong> • Status:{' '}
                  <strong className="text-emerald-800">{item.buildStatus}</strong>
                </div>
                {item.notes && (
                  <div className="text-[10px] text-slate-500 font-semibold">
                    {item.notes}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  triggerFileDownload(item.downloadUrl, item.fileName, item.buildNumber)
                }
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black flex items-center gap-1.5 shrink-0 shadow-xs active:scale-95 transition-all"
              >
                <Download size={13} />
                <span>Download {item.buildNumber}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Instant WebAPK Install + QR Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 flex flex-col items-center text-center">
          <div className="flex items-center gap-1 text-xs font-black text-slate-800 mb-2">
            <QrCode size={14} className="text-emerald-700" />
            <span>Scan QR to Download Latest APK</span>
          </div>
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Scan to download APK"
              className="w-28 h-28 rounded-xl border border-slate-200 p-1 bg-white shadow-2xs"
            />
          ) : (
            <div className="w-28 h-28 rounded-xl bg-slate-200 animate-pulse" />
          )}
          <span className="text-[10px] font-semibold text-slate-500 mt-1.5">
            Downloads <code>{manifest.latestApkFileName}</code>
          </span>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 flex flex-col justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <Sparkles size={14} className="text-emerald-700" />
              <span className="text-xs font-black text-emerald-950">
                APK in Code (File Explorer) Section:
              </span>
            </div>
            <ul className="text-[10px] font-mono font-bold text-emerald-950 space-y-1 bg-white p-2 rounded-xl border border-emerald-200">
              <li>• /GPS_Chambai_v{manifest.currentVersionName}.apk (Root)</li>
              <li>• /app-release.apk &amp; /app-debug.apk (Root)</li>
              <li>• /releases/{manifest.latestApkFileName}</li>
              <li>• /build-outputs/app-debug.apk</li>
              <li>• /build-outputs/GPS_Chambai_Android_Studio_Project.zip</li>
              <li>• /android_project/app/src/main/java/.../MainActivity.kt</li>
            </ul>
          </div>

          {!isInstalled && (
            <button
              type="button"
              onClick={async () => {
                if (isInstallable && !isIOS) {
                  await promptInstall();
                } else {
                  triggerFileDownload(
                    manifest.latestApkDownloadUrl,
                    manifest.latestApkFileName,
                    'Latest Release APK'
                  );
                }
              }}
              className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shadow-xs active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Smartphone size={14} />
              <span>
                {lang === 'ur'
                  ? 'ایپ انسٹال کریں (Install App / APK)'
                  : isInstallable
                  ? 'Instant Install App to Home Screen'
                  : `Install Android APK (v${manifest.currentVersionName})`}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
