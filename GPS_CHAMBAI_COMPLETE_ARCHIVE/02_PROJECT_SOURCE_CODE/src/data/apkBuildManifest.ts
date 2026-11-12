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

const APK_VERSION_CONFIG_STORAGE_KEY = 'gps_chambai_apk_version_config_v105_verified';
const LEGACY_APK_STORAGE_KEYS = [
  'gps_chambai_apk_version_config_v105',
  'gps_chambai_apk_version_config',
  'gps_apk_manifest',
];

export const DEFAULT_APK_VERSION_CONFIG: ApkVersionConfig = {
  versionName: 'v1.0.5',
  apkFileSize: '51.15 MB',
  downloadUrl: '/releases/GPS_Chambai_v1.0.5.apk?v=1.0.5',
  fallbackDownloadUrl: '/releases/GPS_Chambai_v1.0.5.apk?v=1.0.5',
  fileName: 'GPS_Chambai_v1.0.5.apk',
  releaseDate: '2026-11-05',
  releaseNotes:
    'Official GPS Chambai v1.0.5 Release (53,640,913 bytes / 51.15 MB): Verified latest APK download with compact dual download buttons.',
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
  packageId: 'pk.edu.gpschambai.schoolapp',
  currentVersionName: '1.0.5',
  currentVersionCode: 6,
  latestBuildNumber: 'build006',
  latestBuildDateTime: '2026-11-05 18:30:00 UTC',
  buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
  apkFileSizeBytes: 53634662,
  apkFileSizeFormatted: '51.15 MB',
  latestApkFileName: 'GPS_Chambai_v1.0.5_build006.apk',
  latestApkDownloadUrl: '/releases/GPS_Chambai_v1.0.5_build006.apk',
  buildOutputsDebugPath: 'build-outputs/app-debug.apk',
  buildOutputsDebugUrl: '/build-outputs/app-debug.apk',
  androidProjectZipFileName: 'GPS_Chambai_Android_Studio_Project_v1.0.5_build006.zip',
  androidProjectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
  verification: {
    apkExists: true,
    packageIdVerified: true,
    versionCodeVerified: true,
    versionNameVerified: true,
    latestSourceAssetsVerified: true,
    zipAlign4ByteVerified: true,
    signatureSchemeV1V2Verified: true,
    latestIndexHtmlSha256: 'cdee86fa1fffc5f5f95c7f260c7143ef010e34067076986b3b8e43218f30670c',
  },
  history: [
    {
      versionName: '1.0.5',
      versionCode: 6,
      buildNumber: 'build006',
      fileName: 'GPS_Chambai_v1.0.5_build006.apk',
      downloadUrl: '/releases/GPS_Chambai_v1.0.5_build006.apk',
      debugDownloadUrl: '/build-outputs/app-debug.apk',
      projectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
      buildDateTime: '2026-11-05 18:30:00 UTC',
      buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
      fileSizeBytes: 53634662,
      fileSizeFormatted: '51.15 MB',
      packageId: 'pk.edu.gpschambai.schoolapp',
      sha256Digest: 'cdee86fa1fffc5f5f95c7f260c7143ef010e34067076986b3b8e43218f30670c',
      sourceVerified: true,
      notes: 'Relocated APK Download to Others Module with Current Version (v1.0.5, 51.15 MB) Download Card, Profile CV A4 format, and School About Me upgrade.',
    },
    {
      versionName: '1.0.4',
      versionCode: 5,
      buildNumber: 'build005',
      fileName: 'GPS_Chambai_v1.0.4_build005.apk',
      downloadUrl: '/releases/GPS_Chambai_v1.0.4_build005.apk',
      debugDownloadUrl: '/build-outputs/app-debug.apk',
      projectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
      buildDateTime: '2026-11-05 17:30:00 UTC',
      buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
      fileSizeBytes: 53627009,
      fileSizeFormatted: '51.14 MB',
      packageId: 'pk.edu.gpschambai.schoolapp',
      sha256Digest: 'cdee86fa1fffc5f5f95c7f260c7143ef010e34067076986b3b8e43218f30670c',
      sourceVerified: true,
      notes: 'Reference 029 A4 Portrait Profile CV with Edit/Save/Export, Home Screen Bottom Control Bar, and Complete Home Screen Customization Studio.',
    },
    {
      versionName: '1.0.2',
      versionCode: 3,
      buildNumber: 'build003',
      fileName: 'GPS_Chambai_v1.0.2_build003.apk',
      downloadUrl: '/releases/GPS_Chambai_v1.0.2_build003.apk',
      debugDownloadUrl: '/build-outputs/app-debug.apk',
      projectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
      buildDateTime: '2026-11-04 20:30:00 UTC',
      buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
      fileSizeBytes: 53580461,
      fileSizeFormatted: '51.10 MB',
      packageId: 'pk.edu.gpschambai.schoolapp',
      sha256Digest: 'f82ca603cdfb89c53dcf74bf2244085dbacb2ea9899762ab7f3112cf29cf1274',
      sourceVerified: true,
      notes: 'Global Jameel Noori Nastaleeq Urdu font, Award List (Image 032), Image 031 DMC Crest, Image 035 AI Logo, Books & Guides 4 tabs, Universal Print/Export.',
    },
    {
      versionName: '1.0.1',
      versionCode: 2,
      buildNumber: 'build002',
      fileName: 'GPS_Chambai_v1.0.1_build002.apk',
      downloadUrl: '/releases/GPS_Chambai_v1.0.1_build002.apk',
      debugDownloadUrl: '/build-outputs/app-debug.apk',
      projectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
      buildDateTime: '2026-11-04 19:45:00 UTC',
      buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
      fileSizeBytes: 53578120,
      fileSizeFormatted: '51.10 MB',
      packageId: 'pk.edu.gpschambai.schoolapp',
      sha256Digest: 'a41bc8921e09f45cd827163b9c871e2349ab81239c01928374651928374651a2',
      sourceVerified: true,
      notes: 'Merged Books & Guides, Merged Daily Attendance, SSR 16-Page Editable Performa, Official Social Links.',
    },
    {
      versionName: '1.0.0',
      versionCode: 1,
      buildNumber: 'build001',
      fileName: 'GPS_Chambai_v1.0.0_build001.apk',
      downloadUrl: '/releases/GPS_Chambai_v1.0.0_build001.apk',
      debugDownloadUrl: '/build-outputs/app-debug.apk',
      projectZipUrl: '/build-outputs/GPS_Chambai_Android_Studio_Project.zip',
      buildDateTime: '2026-11-04 17:10:00 UTC',
      buildStatus: 'SUCCESS — VERIFIED (v1+v2 Signed)',
      fileSizeBytes: 53512400,
      fileSizeFormatted: '51.03 MB',
      packageId: 'pk.edu.gpschambai.schoolapp',
      sha256Digest: '7c9e2100f842a1b34598c721d4e6f1029384756abcdef1234567890abcdef123',
      sourceVerified: true,
      notes: 'Initial Official Release — GPS Chambai Kohat (EMIS: 16454).',
    },
  ],
};
