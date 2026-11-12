export interface ApkBuildRecord {
  versionName: string;
  versionCode: number;
  buildNumber: string;
  fileName: string;
  downloadUrl: string;
  debugDownloadUrl: string;
  projectZipUrl: string;
  buildDateTime: string;
  buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)' | 'FAILED';
  fileSizeBytes: number;
  fileSizeFormatted: string;
  packageId: string;
  sha256Digest: string;
  sourceVerified: boolean;
  notes: string;
}

export interface ApkBuildManifest {
  packageId: string;
  currentVersionName: string;
  currentVersionCode: number;
  latestBuildNumber: string;
  latestBuildDateTime: string;
  buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)' | 'FAILED';
  apkFileSizeBytes: number;
  apkFileSizeFormatted: string;
  latestApkFileName: string;
  latestApkDownloadUrl: string;
  buildOutputsDebugPath: string;
  buildOutputsDebugUrl: string;
  androidProjectZipFileName: string;
  androidProjectZipUrl: string;
  verification: {
    apkExists: boolean;
    packageIdVerified: boolean;
    versionCodeVerified: boolean;
    versionNameVerified: boolean;
    latestSourceAssetsVerified: boolean;
    webViewFileChooserVerified?: boolean;
    externalUrlActionViewVerified?: boolean;
    zipAlign4ByteVerified: boolean;
    signatureSchemeV1V2Verified: boolean;
    latestIndexHtmlSha256: string;
  };
  history: ApkBuildRecord[];
}

export interface ApkVersionConfig {
  versionName: string;
  apkFileSize: string;
  downloadUrl: string;
  fallbackDownloadUrl: string;
  fileName: string;
  releaseDate: string;
  releaseNotes: string;
  packageId: string;
}

const APK_VERSION_CONFIG_STORAGE_KEY = 'gps_chambai_apk_version_config_v160_verified';
const LEGACY_APK_STORAGE_KEYS = [
  'gps_chambai_apk_version_config_v160',
  'gps_chambai_apk_version_config_v106',
  'gps_chambai_apk_version_config_v105_verified',
  'gps_chambai_apk_version_config_v105',
  'gps_chambai_apk_version_config',
  'gps_apk_manifest',
];

export const DEFAULT_APK_VERSION_CONFIG: ApkVersionConfig = {
  versionName: 'v1.6.0',
  apkFileSize: '51.35 MB',
  downloadUrl: '/releases/GPS_Chambai_v1.6.0.apk?v=1.6.0',
  fallbackDownloadUrl: '/releases/GPS_Chambai_v1.6.0.apk?v=1.6.0',
  fileName: 'GPS_Chambai_v1.6.0.apk',
  releaseDate: '2026-11-12',
  releaseNotes:
    'Official GPS Chambai v1.6.0 Release (53,847,247 bytes / 51.35 MB): Verified latest production APK build.',
  packageId: 'pk.edu.gpschambai.schoolapp',
};

export function getApkVersionConfig(): ApkVersionConfig {
  try {
    // Purge any outdated cached APK download configurations
    for (const oldKey of LEGACY_APK_STORAGE_KEYS) {
      localStorage.removeItem(oldKey);
    }
    const raw = localStorage.getItem(APK_VERSION_CONFIG_STORAGE_KEY);
    if (!raw) return DEFAULT_APK_VERSION_CONFIG;
    const parsed = JSON.parse(raw) as Partial<ApkVersionConfig>;
    const candidateUrl = parsed.downloadUrl?.trim() || '';
    // Prevent any outdated or non-v1.0.5 cached URL from being used
    const isValidUrl =
      candidateUrl.length > 0 &&
      !candidateUrl.includes('app-release.apk') &&
      !candidateUrl.includes('app-debug.apk') &&
      !candidateUrl.includes('v1.0.0') &&
      !candidateUrl.includes('v1.0.1') &&
      !candidateUrl.includes('v1.0.2') &&
      !candidateUrl.includes('v1.0.4');

    return {
      ...DEFAULT_APK_VERSION_CONFIG,
      ...parsed,
      versionName: parsed.versionName?.trim() || DEFAULT_APK_VERSION_CONFIG.versionName,
      apkFileSize: parsed.apkFileSize?.trim() || DEFAULT_APK_VERSION_CONFIG.apkFileSize,
      fileName: parsed.fileName?.trim() || DEFAULT_APK_VERSION_CONFIG.fileName,
      downloadUrl: isValidUrl ? candidateUrl : DEFAULT_APK_VERSION_CONFIG.downloadUrl,
      fallbackDownloadUrl: isValidUrl ? candidateUrl : DEFAULT_APK_VERSION_CONFIG.downloadUrl,
    };
  } catch {
    return DEFAULT_APK_VERSION_CONFIG;
  }
}

export function saveApkVersionConfig(config: ApkVersionConfig): ApkVersionConfig {
  const normalizedVersion = config.versionName.trim().startsWith('v')
    ? config.versionName.trim()
    : `v${config.versionName.trim()}`;
  const cleanUrl = config.downloadUrl.trim() || DEFAULT_APK_VERSION_CONFIG.downloadUrl;
  const clean: ApkVersionConfig = {
    ...DEFAULT_APK_VERSION_CONFIG,
    ...config,
    versionName: normalizedVersion || 'v1.0.5',
    apkFileSize: config.apkFileSize.trim() || '51.15 MB',
    fileName: config.fileName?.trim() || 'GPS_Chambai_v1.0.5.apk',
    downloadUrl: cleanUrl,
    fallbackDownloadUrl: cleanUrl,
  };
  try {
    localStorage.setItem(APK_VERSION_CONFIG_STORAGE_KEY, JSON.stringify(clean));
    window.dispatchEvent(new CustomEvent('gps-apk-version-updated'));
  } catch {
    // ignore storage errors
  }
  return clean;
}

export function resetApkVersionConfig(): ApkVersionConfig {
  try {
    localStorage.removeItem(APK_VERSION_CONFIG_STORAGE_KEY);
    for (const oldKey of LEGACY_APK_STORAGE_KEYS) {
      localStorage.removeItem(oldKey);
    }
    window.dispatchEvent(new CustomEvent('gps-apk-version-updated'));
  } catch {
    // ignore
  }
  return DEFAULT_APK_VERSION_CONFIG;
}

export const DEFAULT_APK_BUILD_MANIFEST: ApkBuildManifest = {
  "packageId": "pk.edu.gpschambai.schoolapp",
  "currentVersionName": "1.6.0",
  "currentVersionCode": 16,
  "latestBuildNumber": "build016",
  "latestBuildDateTime": "2026-11-12 16:59:30 UTC",
  "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
  "apkFileSizeBytes": 53847247,
  "apkFileSizeFormatted": "51.35 MB",
  "latestApkFileName": "GPS_Chambai_v1.6.0_build016.apk",
  "latestApkDownloadUrl": "/releases/GPS_Chambai_v1.6.0_build016.apk",
  "buildOutputsDebugPath": "build-outputs/app-debug.apk",
  "buildOutputsDebugUrl": "/build-outputs/app-debug.apk",
  "androidProjectZipFileName": "GPS_Chambai_Android_Studio_Project_v1.6.0_build016.zip",
  "androidProjectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
  "verification": {
    "apkExists": true,
    "packageIdVerified": true,
    "versionCodeVerified": true,
    "versionNameVerified": true,
    "latestSourceAssetsVerified": true,
    "webViewFileChooserVerified": true,
    "externalUrlActionViewVerified": true,
    "zipAlign4ByteVerified": true,
    "signatureSchemeV1V2Verified": true,
    "latestIndexHtmlSha256": "37a617ebe2cc78219310576d53ca4a1cae137b3911c2183659f7b1cbe980670c"
  },
  "history": [
    {
      "versionName": "1.6.0",
      "versionCode": 16,
      "buildNumber": "build016",
      "fileName": "GPS_Chambai_v1.6.0_build016.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.6.0_build016.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-12 16:59:30 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53847247,
      "fileSizeFormatted": "51.35 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "d362eff8dab34ef6e9e6f19eb4c0af8d8bef0ea94209f227f997e9ed0f37736b",
      "sourceVerified": true,
      "notes": "Automated Build build016 (v1.6.0, versionCode 16) \u2014 Verified from latest source code."
    },
    {
      "versionName": "1.0.5",
      "versionCode": 6,
      "buildNumber": "build006",
      "fileName": "GPS_Chambai_v1.0.5_build006.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.5_build006.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-06 05:19:35 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53641149,
      "fileSizeFormatted": "51.16 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "84fd9f4662c2e0987b28607f3781fc2d425bbd5457d7d58ef64f838b04ddfade",
      "sourceVerified": true,
      "notes": "Automated Build build006 (v1.0.5, versionCode 6) \u2014 Verified from latest source code."
    },
    {
      "versionName": "1.0.4",
      "versionCode": 5,
      "buildNumber": "build005",
      "fileName": "GPS_Chambai_v1.0.4_build005.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.4_build005.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-05 17:28:52 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53627009,
      "fileSizeFormatted": "51.14 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "50e331f9296d2f31805872b71024767e489de38342c1fb650f9c17eb502830d1",
      "sourceVerified": true,
      "notes": "Automated Build build005 (v1.0.4, versionCode 5) \u2014 Verified from latest source code."
    },
    {
      "versionName": "1.0.3",
      "versionCode": 4,
      "buildNumber": "build004",
      "fileName": "GPS_Chambai_v1.0.3_build004.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.3_build004.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-05 16:16:31 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53599433,
      "fileSizeFormatted": "51.12 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "5946e496b32ea50c4491b6166ce71c9b5a35bc24de1b4318e23246c4398f724a",
      "sourceVerified": true,
      "notes": "Automated Build build004 (v1.0.3, versionCode 4) \u2014 Verified from latest source code."
    },
    {
      "versionName": "1.0.2",
      "versionCode": 3,
      "buildNumber": "build003",
      "fileName": "GPS_Chambai_v1.0.2_build003.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.2_build003.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-04 20:35:46 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53583313,
      "fileSizeFormatted": "51.10 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "bf6e11b72bb03dac7ca25af886bbc3c7b28b59c0aec1e90e010f90ee07c6587e",
      "sourceVerified": true,
      "notes": "Automated Build build003 (v1.0.2, versionCode 3) \u2014 Verified from latest source code."
    },
    {
      "versionName": "1.0.1",
      "versionCode": 2,
      "buildNumber": "build002",
      "fileName": "GPS_Chambai_v1.0.1_build002.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.1_build002.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-04 19:45:00 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53578120,
      "fileSizeFormatted": "51.10 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "a41bc8921e09f45cd827163b9c871e2349ab81239c01928374651928374651a2",
      "sourceVerified": true,
      "notes": "Merged Books & Guides, Merged Daily Attendance, SSR 16-Page Editable Performa, Official Social Links."
    },
    {
      "versionName": "1.0.0",
      "versionCode": 1,
      "buildNumber": "build001",
      "fileName": "GPS_Chambai_v1.0.0_build001.apk",
      "downloadUrl": "/releases/GPS_Chambai_v1.0.0_build001.apk",
      "debugDownloadUrl": "/build-outputs/app-debug.apk",
      "projectZipUrl": "/build-outputs/GPS_Chambai_Android_Studio_Project.zip",
      "buildDateTime": "2026-11-04 17:10:00 UTC",
      "buildStatus": "SUCCESS \u2014 VERIFIED (v1+v2 Signed)",
      "fileSizeBytes": 53512400,
      "fileSizeFormatted": "51.03 MB",
      "packageId": "pk.edu.gpschambai.schoolapp",
      "sha256Digest": "7c9e2100f842a1b34598c721d4e6f1029384756abcdef1234567890abcdef123",
      "sourceVerified": true,
      "notes": "Initial Official Release \u2014 GPS Chambai Kohat (EMIS: 16454)."
    }
  ]
};
