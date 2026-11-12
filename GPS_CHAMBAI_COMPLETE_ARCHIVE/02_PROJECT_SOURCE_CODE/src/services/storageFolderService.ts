/**
 * GPS Chambai Automatic Internal Storage Folder System (Requirement 2)
 * Initializes and manages the official "GPS Chambai" directory hierarchy
 * using IndexedDB (for large photos, videos, PDFs, Word/Excel documents, and ZIPs)
 * + LocalStorage metadata index + Android WebView Bridge / File System Access API.
 */

export interface StoredFileEntry {
  id: string;
  folderPath: string; // e.g. "GPS Chambai/Admission/Students Photos/KG"
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  fileSize?: number;
  sizeFormatted: string;
  createdAt: string;
  updatedAt: string;
  moduleName: string;
  recordId?: string;
  dataUrl?: string; // Stored in IndexedDB or inline for instant preview/download
}

export const OFFICIAL_GPS_CHAMBAI_FOLDERS: string[] = [
  'GPS Chambai',
  'GPS Chambai/WhatsApp',

  // Admission
  'GPS Chambai/Admission',
  'GPS Chambai/Admission/Students Photos',
  'GPS Chambai/Admission/Students Photos/KG',
  'GPS Chambai/Admission/Students Photos/1st',
  'GPS Chambai/Admission/Students Photos/2nd',
  'GPS Chambai/Admission/Students Photos/3rd',
  'GPS Chambai/Admission/Students Photos/4th',
  'GPS Chambai/Admission/Students Photos/5th',
  'GPS Chambai/Admission/Teachers Photos',
  'GPS Chambai/Admission/Admission Documents',
  'GPS Chambai/Admission/Admission Documents/PDF Records',

  // PTC Fund
  'GPS Chambai/PTC Fund',
  'GPS Chambai/PTC Fund/Capitation Grant',
  'GPS Chambai/PTC Fund/Consumable Grant',
  'GPS Chambai/PTC Fund/Pretty Repair',
  'GPS Chambai/PTC Fund/Receipts',
  'GPS Chambai/PTC Fund/Expenses',

  // Staff Data
  'GPS Chambai/Staff Data',
  'GPS Chambai/Staff Data/Staff Photos',
  'GPS Chambai/Staff Data/Staff Documents',
  'GPS Chambai/Staff Data/PDF Records',

  // Gallery
  'GPS Chambai/Gallery',
  'GPS Chambai/Gallery/Photos',
  'GPS Chambai/Gallery/Photos/KG',
  'GPS Chambai/Gallery/Photos/1st',
  'GPS Chambai/Gallery/Photos/2nd',
  'GPS Chambai/Gallery/Photos/3rd',
  'GPS Chambai/Gallery/Photos/4th',
  'GPS Chambai/Gallery/Photos/5th',

  // Videos
  'GPS Chambai/Videos',
  'GPS Chambai/Videos/KG',
  'GPS Chambai/Videos/1st',
  'GPS Chambai/Videos/2nd',
  'GPS Chambai/Videos/3rd',
  'GPS Chambai/Videos/4th',
  'GPS Chambai/Videos/5th',

  // Books & Guides
  'GPS Chambai/Books & Guides',
  'GPS Chambai/Books & Guides/Books',
  'GPS Chambai/Books & Guides/Books/KG',
  'GPS Chambai/Books & Guides/Books/1st',
  'GPS Chambai/Books & Guides/Books/2nd',
  'GPS Chambai/Books & Guides/Books/3rd',
  'GPS Chambai/Books & Guides/Books/4th',
  'GPS Chambai/Books & Guides/Books/5th',
  'GPS Chambai/Books & Guides/Guides',
  'GPS Chambai/Books & Guides/Guides/KG',
  'GPS Chambai/Books & Guides/Guides/1st',
  'GPS Chambai/Books & Guides/Guides/2nd',
  'GPS Chambai/Books & Guides/Guides/3rd',
  'GPS Chambai/Books & Guides/Guides/4th',
  'GPS Chambai/Books & Guides/Guides/5th',

  // Documents & AI & SSR & Other
  'GPS Chambai/Documents',
  'GPS Chambai/AI Teaching Suite',
  'GPS Chambai/SSR',
  'GPS Chambai/SSR/SSR Documents',
  'GPS Chambai/SSR/PDF Reports',
  'GPS Chambai/Other',

  // Class
  'GPS Chambai/Class',
  'GPS Chambai/Class/KG',
  'GPS Chambai/Class/1st',
  'GPS Chambai/Class/2nd',
  'GPS Chambai/Class/3rd',
  'GPS Chambai/Class/4th',
  'GPS Chambai/Class/5th',

  // Attendance
  'GPS Chambai/Attendance',
  'GPS Chambai/Attendance/KG',
  'GPS Chambai/Attendance/1st',
  'GPS Chambai/Attendance/2nd',
  'GPS Chambai/Attendance/3rd',
  'GPS Chambai/Attendance/4th',
  'GPS Chambai/Attendance/5th',

  // Certificates
  'GPS Chambai/Certificates',
  'GPS Chambai/Certificates/PDF certificate',
  'GPS Chambai/Certificates/PDF Result',

  // Timetable
  'GPS Chambai/Timetable',
  'GPS Chambai/Timetable/PDF Timetable',

  // Lesson Plans
  'GPS Chambai/Lesson Plans',
  'GPS Chambai/Lesson Plans/PDF Lesson Plans',
  'GPS Chambai/Lesson Plans/Doc Lesson Plans',

  // Daily / Staff / Student Attendance Reports
  'GPS Chambai/Daily Attendance',
  'GPS Chambai/Daily Attendance/Monthly Reports',
  'GPS Chambai/Staff Attendance',
  'GPS Chambai/Staff Attendance/Monthly Reports',
  'GPS Chambai/Student Attendance',
  'GPS Chambai/Student Attendance/Monthly Reports',

  // Office Data
  'GPS Chambai/Office Data',
  'GPS Chambai/Office Data/Notifications',
  'GPS Chambai/Office Data/Order',
  'GPS Chambai/Office Data/Performa',

  // Backup & Restore
  'GPS Chambai/Backup & Restore',
  'GPS Chambai/Backup & Restore/Backup',
  'GPS Chambai/Backup & Restore/Restore',

  // PDF & Print Records
  'GPS Chambai/PDF & Print Records',
  'GPS Chambai/PDF & Print Records/Export PDF',
];

const FOLDERS_STORAGE_KEY = 'gps_chambai_initialized_folders_v2';
const FILES_METADATA_KEY = 'gps_chambai_files_metadata_v2';
const IDB_NAME = 'GpsChambaiFileSystemDB';
const IDB_STORE = 'files_blob_store';

function openFileSystemDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const req = indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE, { keyPath: 'id' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function mapClassIdToFolderName(classIdOrName?: string): 'KG' | '1st' | '2nd' | '3rd' | '4th' | '5th' {
  const c = (classIdOrName || '').toLowerCase();
  if (c.includes('kachi') || c.includes('kg') || c.includes('ece') || c === '0') return 'KG';
  if (c.includes('1') || c.includes('first') || c.includes('اول')) return '1st';
  if (c.includes('2') || c.includes('second') || c.includes('دوئم')) return '2nd';
  if (c.includes('3') || c.includes('third') || c.includes('سوئم')) return '3rd';
  if (c.includes('4') || c.includes('fourth') || c.includes('چہارم')) return '4th';
  if (c.includes('5') || c.includes('fifth') || c.includes('پنجم')) return '5th';
  return 'KG';
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '1 KB';
  const kb = bytes / 1024;
  if (kb >= 1024) {
    return `${(kb / 1024).toFixed(2)} MB`;
  }
  return `${Math.max(1, Math.round(kb))} KB`;
}

export type StoredFileRecord = StoredFileEntry;
export const formatFileSize = formatBytes;

export const StorageFolderService = {
  /**
   * Automatically initializes all missing folders on app launch without overwriting existing files
   */
  initFolders(): string[] {
    try {
      const existingRaw = localStorage.getItem(FOLDERS_STORAGE_KEY);
      const existing: string[] = existingRaw ? JSON.parse(existingRaw) : [];
      const mergedSet = new Set<string>([...existing, ...OFFICIAL_GPS_CHAMBAI_FOLDERS]);
      const merged = Array.from(mergedSet);
      localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(merged));

      const win = window as any;
      if (win.AndroidBridge?.initFolders) {
        try {
          win.AndroidBridge.initFolders(JSON.stringify(merged));
        } catch {
          // ignore
        }
      }
      return merged;
    } catch (e) {
      console.warn('Folder initialization fallback:', e);
      return OFFICIAL_GPS_CHAMBAI_FOLDERS;
    }
  },

  getFolders(): string[] {
    try {
      const raw = localStorage.getItem(FOLDERS_STORAGE_KEY);
      if (!raw) return this.initFolders();
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length >= OFFICIAL_GPS_CHAMBAI_FOLDERS.length
        ? parsed
        : this.initFolders();
    } catch {
      return OFFICIAL_GPS_CHAMBAI_FOLDERS;
    }
  },

  getFilesMetadata(): StoredFileEntry[] {
    try {
      const raw = localStorage.getItem(FILES_METADATA_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  },

  getFileIndex(): StoredFileEntry[] {
    return this.getFilesMetadata();
  },

  getFilesInFolder(folderPath: string): StoredFileEntry[] {
    const clean = folderPath.startsWith('GPS Chambai')
      ? folderPath
      : `GPS Chambai/${folderPath.replace(/^\/+/, '')}`;
    return this.getFilesMetadata().filter(
      (f) => f.folderPath === clean || f.folderPath.startsWith(`${clean}/`)
    );
  },

  /**
   * Saves a file into a specific GPS Chambai subfolder, preserving existing files unless explicitly updated
   */
  async saveFileToFolder(params: {
    folderPath: string;
    fileName: string;
    dataUrlOrContent?: string | Blob;
    data?: string | Blob;
    dataUrl?: string;
    mimeType?: string;
    sizeBytes?: number;
    moduleName?: string;
    sourceModule?: string;
    moduleSource?: string;
    description?: string;
    recordId?: string;
    overwriteExisting?: boolean;
  }): Promise<StoredFileEntry> {
    this.initFolders();

    const cleanFolder = params.folderPath.startsWith('GPS Chambai')
      ? params.folderPath
      : `GPS Chambai/${params.folderPath.replace(/^\/+/, '')}`;

    const folders = this.getFolders();
    if (!folders.includes(cleanFolder)) {
      folders.push(cleanFolder);
      try {
        localStorage.setItem(FOLDERS_STORAGE_KEY, JSON.stringify(folders));
      } catch {
        // ignore
      }
    }

    const contentPayload = params.dataUrlOrContent ?? params.data ?? '';
    const resolvedModuleName = params.moduleName || params.sourceModule || 'General';
    let dataUrl = '';
    let sizeBytes = 0;
    let resolvedMime = params.mimeType || 'application/octet-stream';

    if (typeof contentPayload === 'string') {
      if (contentPayload.startsWith('data:')) {
        dataUrl = contentPayload;
        const commaIdx = dataUrl.indexOf(',');
        const b64 = commaIdx !== -1 ? dataUrl.slice(commaIdx + 1) : '';
        sizeBytes = Math.round((b64.length * 3) / 4);
        const mimeMatch = dataUrl.match(/^data:([^;]+);/);
        if (mimeMatch) resolvedMime = mimeMatch[1];
      } else {
        sizeBytes = new Blob([contentPayload]).size;
        const b64 = btoa(unescape(encodeURIComponent(contentPayload)));
        dataUrl = `data:${resolvedMime};base64,${b64}`;
      }
    } else if (contentPayload instanceof Blob) {
      sizeBytes = contentPayload.size;
      resolvedMime = contentPayload.type || resolvedMime;
      dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string) || '');
        reader.onerror = () => resolve('');
        reader.readAsDataURL(contentPayload as Blob);
      });
    }

    const now = new Date().toISOString();
    const allMeta = this.getFilesMetadata();
    let finalFileName = params.fileName.replace(/[/\\?%*:|"<>]/g, '_');

    // Do not overwrite existing files unless overwriteExisting is true
    const existingIndex = allMeta.findIndex(
      (f) => f.folderPath === cleanFolder && f.fileName === finalFileName
    );

    if (existingIndex !== -1 && !params.overwriteExisting) {
      const dotIdx = finalFileName.lastIndexOf('.');
      const stamp = Date.now().toString().slice(-4);
      if (dotIdx !== -1) {
        finalFileName = `${finalFileName.slice(0, dotIdx)}_${stamp}${finalFileName.slice(dotIdx)}`;
      } else {
        finalFileName = `${finalFileName}_${stamp}`;
      }
    }

    const id =
      existingIndex !== -1 && params.overwriteExisting
        ? allMeta[existingIndex].id
        : `file-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

    const entry: StoredFileEntry = {
      id,
      folderPath: cleanFolder,
      fileName: finalFileName,
      mimeType: resolvedMime,
      sizeBytes,
      sizeFormatted: formatBytes(sizeBytes),
      createdAt:
        existingIndex !== -1 && params.overwriteExisting
          ? allMeta[existingIndex].createdAt
          : now,
      updatedAt: now,
      moduleName: resolvedModuleName,
      recordId: params.recordId,
    };

    // Store payload in IndexedDB
    try {
      const db = await openFileSystemDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).put({ id, dataUrl });
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch {
      // Fallback: keep small dataUrls in metadata if IndexedDB is unavailable
      if (dataUrl.length < 150000) {
        entry.dataUrl = dataUrl;
      }
    }

    if (existingIndex !== -1 && params.overwriteExisting) {
      allMeta[existingIndex] = entry;
    } else {
      allMeta.unshift(entry);
    }

    try {
      localStorage.setItem(FILES_METADATA_KEY, JSON.stringify(allMeta));
    } catch (e) {
      console.warn('Metadata storage quota warning:', e);
    }

    window.dispatchEvent(new CustomEvent('gps-folder-files-updated'));
    return { ...entry, dataUrl };
  },

  async getFileDataUrl(id: string): Promise<string | null> {
    try {
      const db = await openFileSystemDB();
      const record = await new Promise<{ id: string; dataUrl: string } | undefined>(
        (resolve, reject) => {
          const tx = db.transaction(IDB_STORE, 'readonly');
          const req = tx.objectStore(IDB_STORE).get(id);
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        }
      );
      if (record?.dataUrl) return record.dataUrl;
    } catch {
      // ignore
    }
    const meta = this.getFilesMetadata().find((m) => m.id === id);
    return meta?.dataUrl || null;
  },

  async deleteFile(id: string): Promise<void> {
    try {
      const db = await openFileSystemDB();
      await new Promise<void>((resolve) => {
        const tx = db.transaction(IDB_STORE, 'readwrite');
        tx.objectStore(IDB_STORE).delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
    } catch {
      // ignore
    }
    const filtered = this.getFilesMetadata().filter((m) => m.id !== id);
    localStorage.setItem(FILES_METADATA_KEY, JSON.stringify(filtered));
    window.dispatchEvent(new CustomEvent('gps-folder-files-updated'));
  },

  renameFile(id: string, newFileName: string): void {
    const clean = newFileName.trim().replace(/[/\\?%*:|"<>]/g, '_');
    if (!clean) return;
    const all = this.getFilesMetadata().map((f) =>
      f.id === id ? { ...f, fileName: clean, updatedAt: new Date().toISOString() } : f
    );
    localStorage.setItem(FILES_METADATA_KEY, JSON.stringify(all));
    window.dispatchEvent(new CustomEvent('gps-folder-files-updated'));
  },

  mapClassIdToFolderName(classIdOrName?: string): 'KG' | '1st' | '2nd' | '3rd' | '4th' | '5th' {
    return mapClassIdToFolderName(classIdOrName);
  },

  formatFileSize(bytes?: number): string {
    return formatFileSize(bytes || 0);
  },

  async saveDataUrlFile(
    folderPath: string,
    fileName: string,
    dataUrl: string,
    mimeType: string = 'image/jpeg',
    moduleName: string = 'General'
  ): Promise<StoredFileEntry> {
    return this.saveFileToFolder({
      folderPath,
      fileName,
      dataUrlOrContent: dataUrl,
      mimeType,
      moduleName,
    });
  },
};

