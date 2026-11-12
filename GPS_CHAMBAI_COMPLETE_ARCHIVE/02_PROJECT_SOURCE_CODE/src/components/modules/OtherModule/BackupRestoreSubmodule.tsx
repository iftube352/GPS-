import React, { useState, useRef } from 'react';
import JSZip from 'jszip';
import {
  ArrowLeft,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Database,
  ShieldCheck,
  FolderCheck,
  Archive,
  Clock,
  RotateCcw,
  FileArchive,
  CheckSquare,
  Square,
} from 'lucide-react';
import { StorageService } from '../../../services/storage';
import { SsrStorageService } from '../../../services/ssrStorageService';
import { WhatsAppNotificationService } from '../../../services/whatsappNotificationService';
import {
  StorageFolderService,
  formatFileSize,
} from '../../../services/storageFolderService';
import { MonoBackupIcon, MonoRestoreIcon } from '../../common/MonochromeIcons';
import { ViewModeToggle, useViewMode } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface BackupLogEntry {
  id: string;
  scope: string;
  fileName: string;
  folderPath: string;
  sizeBytes: number;
  createdAt: string;
  storedFileId?: string;
}

const BACKUP_HISTORY_KEY = 'gps_chambai_backup_history_log_v1';

export const BackupRestoreSubmodule: React.FC<SubmoduleProps> = ({ onBack }) => {
  const [viewMode, setViewMode] = useViewMode('backup_restore');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );
  const [isCreatingZip, setIsCreatingZip] = useState(false);
  const [backupHistory, setBackupHistory] = useState<BackupLogEntry[]>(() => {
    try {
      const raw = localStorage.getItem(BACKUP_HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return [];
  });

  const [pendingRestoreData, setPendingRestoreData] = useState<{
    rawJson: string;
    ssrJson?: string;
    fileName: string;
    summary: Record<string, number>;
  } | null>(null);

  const [selectiveModules, setSelectiveModules] = useState<Record<string, boolean>>({
    students: true,
    staff: true,
    books: true,
    finances: true,
    attendance: true,
    results: true,
    certificates: true,
    ssr: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const studentsCount = StorageService.getStudents().length;
  const staffCount = StorageService.getStaff().length;
  const booksCount = StorageService.getBooks().length;
  const financeCount = StorageService.getFinances().length;
  const resultsCount = StorageService.getResults().length;
  const certCount = StorageService.getCertificates().length;
  const struckOffCount = StorageService.getStruckOffRecords().length;

  const appendBackupLog = (entry: BackupLogEntry) => {
    const next = [entry, ...backupHistory].slice(0, 50);
    setBackupHistory(next);
    try {
      localStorage.setItem(BACKUP_HISTORY_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const getTimestampSuffix = () => {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0];
    const timePart = now.toTimeString().slice(0, 5).replace(':', '-');
    return `${datePart}_${timePart}`;
  };

  // Full Application ZIP Backup
  const handleCreateFullZipBackup = async () => {
    setIsCreatingZip(true);
    try {
      const zip = new JSZip();
      const dbJson = StorageService.exportDatabaseJSON();
      const ssrData = JSON.stringify(SsrStorageService.getSsrData(), null, 2);
      const waLogs = JSON.stringify(WhatsAppNotificationService.getLogs(), null, 2);
      const fileIndex = JSON.stringify(StorageFolderService.getFileIndex(), null, 2);

      zip.file('database.json', dbJson);
      zip.file('ssr_2026_27.json', ssrData);
      zip.file('whatsapp_notifications.json', waLogs);
      zip.file('gps_chambai_file_index.json', fileIndex);

      // Module-level folders inside ZIP
      zip.file('modules/students.json', JSON.stringify(StorageService.getStudents(), null, 2));
      zip.file('modules/staff.json', JSON.stringify(StorageService.getStaff(), null, 2));
      zip.file(
        'modules/official_teachers.json',
        JSON.stringify(StorageService.getOfficialTeachers(), null, 2)
      );
      zip.file('modules/books_and_guides.json', JSON.stringify(StorageService.getBooks(), null, 2));
      zip.file('modules/ptc_fund.json', JSON.stringify(StorageService.getFinances(), null, 2));
      zip.file(
        'modules/student_attendance.json',
        JSON.stringify(StorageService.getAttendance(), null, 2)
      );
      zip.file(
        'modules/teacher_attendance.json',
        JSON.stringify(StorageService.getTeacherAttendance(), null, 2)
      );

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const fileName = `GPS_Chambai_Full_Backup_${getTimestampSuffix()}.zip`;

      const stored = await StorageFolderService.saveFileToFolder({
        folderPath: 'Backup & Restore/Backup',
        fileName,
        mimeType: 'application/zip',
        data: zipBlob,
        sourceModule: 'Backup & Restore',
      });

      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      appendBackupLog({
        id: `bk-${Date.now()}`,
        scope: 'Full Application ZIP Backup',
        fileName,
        folderPath: 'GPS Chambai/Backup & Restore/Backup',
        sizeBytes: zipBlob.size,
        createdAt: new Date().toISOString(),
        storedFileId: stored.id,
      });

      setStatusMsg({
        type: 'success',
        text: `Full Application ZIP Backup saved to GPS Chambai/Backup & Restore/Backup/${fileName}`,
      });
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Failed to create Full Application ZIP Backup.',
      });
    } finally {
      setIsCreatingZip(false);
    }
  };

  // Module-Specific Backup
  const handleCreateModuleBackup = async (moduleKey: string, moduleLabel: string) => {
    try {
      let payload: unknown = {};
      if (moduleKey === 'database') {
        payload = JSON.parse(StorageService.exportDatabaseJSON());
      } else if (moduleKey === 'students') {
        payload = { students: StorageService.getStudents() };
      } else if (moduleKey === 'staff') {
        payload = {
          staff: StorageService.getStaff(),
          officialTeachers: StorageService.getOfficialTeachers(),
        };
      } else if (moduleKey === 'photos') {
        payload = {
          photosIndex: StorageFolderService.getFileIndex().filter((f) =>
            f.mimeType.startsWith('image/')
          ),
          galleryPhotos: StorageService.getGallery().filter((g) => g.mediaType !== 'video'),
        };
      } else if (moduleKey === 'videos') {
        payload = {
          videosIndex: StorageFolderService.getFileIndex().filter((f) =>
            f.mimeType.startsWith('video/')
          ),
          galleryVideos: StorageService.getGallery().filter((g) => g.mediaType === 'video'),
        };
      } else if (moduleKey === 'documents') {
        payload = {
          documentsIndex: StorageFolderService.getFileIndex().filter(
            (f) => !f.mimeType.startsWith('image/') && !f.mimeType.startsWith('video/')
          ),
        };
      } else if (moduleKey === 'books') {
        payload = {
          booksAndGuides: StorageService.getBooks(),
          bookDemands: StorageService.getBookDemands(),
        };
      } else if (moduleKey === 'ptc') {
        payload = { ptcFinances: StorageService.getFinances() };
      } else if (moduleKey === 'attendance') {
        payload = {
          studentAttendance: StorageService.getAttendance(),
          teacherAttendance: StorageService.getTeacherAttendance(),
        };
      } else if (moduleKey === 'ssr') {
        payload = { ssrData: SsrStorageService.getSsrData() };
      }

      const jsonStr = JSON.stringify(payload, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const safeName = moduleLabel.replace(/[^a-zA-Z0-9_-]/g, '_');
      const fileName = `GPS_Chambai_${safeName}_${getTimestampSuffix()}.json`;

      const stored = await StorageFolderService.saveFileToFolder({
        folderPath: 'Backup & Restore/Backup',
        fileName,
        mimeType: 'application/json',
        data: blob,
        sourceModule: 'Backup & Restore',
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      appendBackupLog({
        id: `bk-${Date.now()}`,
        scope: `${moduleLabel} Backup`,
        fileName,
        folderPath: 'GPS Chambai/Backup & Restore/Backup',
        sizeBytes: blob.size,
        createdAt: new Date().toISOString(),
        storedFileId: stored.id,
      });

      setStatusMsg({
        type: 'success',
        text: `${moduleLabel} backup saved to GPS Chambai/Backup & Restore/Backup/${fileName}`,
      });
    } catch {
      setStatusMsg({
        type: 'error',
        text: `Failed to export ${moduleLabel} backup.`,
      });
    }
  };

  // Restore from ZIP or JSON file
  const handleSelectBackupFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Also save uploaded backup into GPS Chambai/Backup & Restore/Restore
    await StorageFolderService.saveFileToFolder({
      folderPath: 'Backup & Restore/Restore',
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      data: file,
      sourceModule: 'Backup & Restore',
    });

    if (file.name.toLowerCase().endsWith('.zip')) {
      try {
        const zip = await JSZip.loadAsync(file);
        const dbFile = zip.file('database.json');
        const ssrFile = zip.file('ssr_2026_27.json');
        if (!dbFile) {
          setStatusMsg({
            type: 'error',
            text: 'The selected ZIP archive does not contain a valid GPS Chambai database.json.',
          });
          return;
        }
        const dbJson = await dbFile.async('string');
        const ssrJson = ssrFile ? await ssrFile.async('string') : undefined;
        const validation = StorageService.validateBackupJSON(dbJson);
        if (!validation.valid) {
          setStatusMsg({ type: 'error', text: validation.message });
          return;
        }
        setPendingRestoreData({
          rawJson: dbJson,
          ssrJson,
          fileName: file.name,
          summary: validation.summary || {},
        });
      } catch {
        setStatusMsg({
          type: 'error',
          text: 'Could not read or extract the selected ZIP backup archive.',
        });
      }
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const validation = StorageService.validateBackupJSON(content);
      if (!validation.valid) {
        // Check if it's a single module backup (e.g. ssrData)
        try {
          const parsed = JSON.parse(content);
          if (parsed && parsed.ssrData) {
            SsrStorageService.saveSsrData(parsed.ssrData);
            setStatusMsg({
              type: 'success',
              text: `SSR module backup (${file.name}) restored successfully!`,
            });
            return;
          }
        } catch {
          // ignore
        }
        setStatusMsg({
          type: 'error',
          text: validation.message,
        });
        setPendingRestoreData(null);
      } else {
        setStatusMsg(null);
        setPendingRestoreData({
          rawJson: content,
          fileName: file.name,
          summary: validation.summary || {},
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmRestore = () => {
    if (!pendingRestoreData) return;

    try {
      const parsed = JSON.parse(pendingRestoreData.rawJson);
      const currentDb = JSON.parse(StorageService.exportDatabaseJSON());

      const mergedPayload = {
        ...currentDb,
        students: selectiveModules.students ? parsed.students ?? currentDb.students : currentDb.students,
        staff: selectiveModules.staff ? parsed.staff ?? currentDb.staff : currentDb.staff,
        books: selectiveModules.books ? parsed.books ?? currentDb.books : currentDb.books,
        finances: selectiveModules.finances ? parsed.finances ?? currentDb.finances : currentDb.finances,
        attendance: selectiveModules.attendance
          ? parsed.attendance ?? currentDb.attendance
          : currentDb.attendance,
        results: selectiveModules.results ? parsed.results ?? currentDb.results : currentDb.results,
        certificates: selectiveModules.certificates
          ? parsed.certificates ?? currentDb.certificates
          : currentDb.certificates,
      };

      const ok = StorageService.importDatabaseJSON(JSON.stringify(mergedPayload));
      if (selectiveModules.ssr && pendingRestoreData.ssrJson) {
        try {
          SsrStorageService.saveSsrData(JSON.parse(pendingRestoreData.ssrJson));
        } catch {
          // ignore
        }
      }

      if (ok) {
        setPendingRestoreData(null);
        setStatusMsg({
          type: 'success',
          text: 'Backup restored successfully! All selected modules have been updated.',
        });
      } else {
        setStatusMsg({
          type: 'error',
          text: 'Restore failed due to invalid backup structure.',
        });
      }
    } catch {
      setStatusMsg({
        type: 'error',
        text: 'Restore failed while merging backup data.',
      });
    }
  };

  const moduleBackupList = [
    { key: 'database', label: '1. Full Database (JSON)' },
    { key: 'students', label: '2. Student Records' },
    { key: 'staff', label: '3. Staff Records' },
    { key: 'photos', label: '4. Photos Index' },
    { key: 'videos', label: '5. Videos Index' },
    { key: 'documents', label: '6. Documents Index' },
    { key: 'books', label: '7. Books & Guides' },
    { key: 'ptc', label: '8. PTC Fund Ledger' },
    { key: 'attendance', label: '9. Attendance Records' },
    { key: 'ssr', label: '10. SSR 16-Page Data' },
  ];

  return (
    <div className="p-3.5 space-y-4 pb-12 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all active:scale-95"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              Backup &amp; Restore System
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} className="bg-white/95" />
          <ShieldCheck size={26} className="text-emerald-400 shrink-0" />
        </div>
      </div>

      {/* Status Alert */}
      {statusMsg && (
        <div
          className={`p-3.5 rounded-2xl border flex items-center gap-2.5 text-xs font-bold ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {statusMsg.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}

      {/* Current Database Record Summary */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-emerald-700" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
              Active GPS Chambai Database Records
            </h3>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
            Protected
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{studentsCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Students</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{staffCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Staff</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{booksCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Books/Guides</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{financeCount}</div>
            <div className="text-[10px] font-bold text-slate-500">PTC Ledger</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{resultsCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Exam Results</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{certCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Certificates</div>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-base font-black text-slate-900">{struckOffCount}</div>
            <div className="text-[10px] font-bold text-slate-500">Struck Off</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <div className="text-xs font-black text-emerald-800">GPS Chambai</div>
            <div className="text-[10px] font-bold text-emerald-600">Backup Folder</div>
          </div>
        </div>
      </div>

      {/* 1. Full Application Backup (ZIP Archive) */}
      <div className="bg-white rounded-3xl p-5 border-2 border-emerald-600/30 shadow-sm space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
            <MonoBackupIcon size={28} />
          </div>
          <div className="space-y-1 flex-1">
            <h3 className="text-sm font-black text-slate-900">
              1. Full Application Backup (.ZIP &amp; .JSON)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Creates a complete compressed <strong>.ZIP archive</strong> containing the entire school database, student &amp; staff records, books, PTC ledger, attendance, 16-page SSR data, WhatsApp logs, and file index inside <strong>GPS Chambai/Backup &amp; Restore/Backup/</strong>.
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <FolderCheck size={13} />
              <span>GPS Chambai/Backup &amp; Restore/Backup/</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleCreateFullZipBackup}
            disabled={isCreatingZip}
            className="w-full py-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <FileArchive size={16} />
            <span>
              {isCreatingZip ? 'Building ZIP Archive...' : 'Create Full ZIP Backup (.zip)'}
            </span>
          </button>

          <button
            onClick={() => handleCreateModuleBackup('database', 'Full_Database')}
            className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
          >
            <Download size={16} />
            <span>Export Full JSON Backup (.json)</span>
          </button>
        </div>
      </div>

      {/* 2. Module-Specific Backups (10 Modules) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div>
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Archive size={16} className="text-emerald-700" />
            <span>2. Module-Specific Backups (10 Modules)</span>
          </h3>
          <p className="text-xs text-slate-500 font-semibold">
            Click any module below to save a standalone backup in GPS Chambai/Backup &amp; Restore/Backup/
          </p>
        </div>

        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2'
              : 'space-y-2'
          }
        >
          {moduleBackupList.map((m) => (
            <button
              key={m.key}
              onClick={() => handleCreateModuleBackup(m.key, m.label)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-left flex items-center justify-between gap-2 transition-all active:scale-98"
            >
              <span className="text-xs font-black text-slate-800">{m.label}</span>
              <Download size={14} className="text-emerald-700 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* 3. Restore System (.ZIP or .JSON with Selective / Complete Restore) */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
            <MonoRestoreIcon size={28} />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-black text-slate-900">
              3. Restore Backup (.ZIP or .JSON — Selective or Complete)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Select a backup file (<code>.zip</code> or <code>.json</code>) from{' '}
              <strong>GPS Chambai/Backup &amp; Restore/</strong> or device storage. Preview contents and choose Complete or Selective Restore before confirming.
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.json,application/zip,application/json"
          onChange={handleSelectBackupFile}
          className="hidden"
        />

        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-2 shadow-md transition-all active:scale-98"
        >
          <Upload size={16} />
          <span>Select .ZIP or .JSON Backup File to Restore</span>
        </button>
      </div>

      {/* 4. Backup History Log */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
            <Clock size={16} className="text-emerald-700" />
            <span>4. Backup History Log ({backupHistory.length})</span>
          </h3>
          <span className="text-[10px] font-bold text-slate-500">
            GPS Chambai/Backup &amp; Restore/Backup/
          </span>
        </div>

        {backupHistory.length === 0 ? (
          <div className="p-6 text-center text-xs font-bold text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
            No backups recorded in this session yet. Create a Full ZIP or Module Backup above.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-xs">
              <thead className="bg-slate-100 text-slate-700 font-black border-b border-slate-200">
                <tr>
                  <th className="p-2.5 text-left">Backup Scope</th>
                  <th className="p-2.5 text-left">File Name</th>
                  <th className="p-2.5 text-left">Date &amp; Time</th>
                  <th className="p-2.5 text-left">Size</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {backupHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-black text-emerald-900">{item.scope}</td>
                    <td className="p-2.5 font-mono text-[11px] text-slate-700">{item.fileName}</td>
                    <td className="p-2.5 text-slate-500">
                      {new Date(item.createdAt).toLocaleString()}
                    </td>
                    <td className="p-2.5 text-slate-600">{formatFileSize(item.sizeBytes)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation & Selective Restore Modal */}
      {pendingRestoreData && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <AlertTriangle size={22} />
              </div>
              <div className="min-w-0">
                <h4 className="text-base font-black text-slate-900">
                  Preview &amp; Confirm Restore
                </h4>
                <p className="text-xs text-slate-500 font-semibold truncate">
                  File: {pendingRestoreData.fileName}
                </p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 space-y-2 text-xs">
              <div className="font-black text-slate-700">
                Select Modules to Restore (Complete or Selective):
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'students', label: `Students (${pendingRestoreData.summary.students ?? 0})` },
                  { key: 'staff', label: `Staff (${pendingRestoreData.summary.staff ?? 0})` },
                  { key: 'books', label: `Books (${pendingRestoreData.summary.books ?? 0})` },
                  { key: 'finances', label: `PTC Fund (${pendingRestoreData.summary.finances ?? 0})` },
                  { key: 'attendance', label: 'Attendance' },
                  { key: 'results', label: `Results (${pendingRestoreData.summary.results ?? 0})` },
                  {
                    key: 'certificates',
                    label: `Certificates (${pendingRestoreData.summary.certificates ?? 0})`,
                  },
                  { key: 'ssr', label: 'SSR 16-Page Data' },
                ].map((mod) => {
                  const checked = selectiveModules[mod.key] ?? true;
                  return (
                    <button
                      key={mod.key}
                      type="button"
                      onClick={() =>
                        setSelectiveModules((prev) => ({ ...prev, [mod.key]: !checked }))
                      }
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 font-bold text-[11px] ${
                        checked
                          ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
                          : 'bg-white border-slate-200 text-slate-500'
                      }`}
                    >
                      {checked ? (
                        <CheckSquare size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <Square size={14} className="text-slate-400 shrink-0" />
                      )}
                      <span className="truncate">{mod.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium">
              Are you sure you want to restore the checked modules into GPS Chambai?
            </p>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                onClick={() => setPendingRestoreData(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRestore}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>Confirm &amp; Restore</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
