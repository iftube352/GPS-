import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video,
  Download,
  Trash2,
  Edit3,
  Share2,
  Eye,
  X,
  Search,
  ChevronRight,
  HardDrive,
  CheckCircle2,
  Check,
} from 'lucide-react';
import {
  StorageFolderService,
  StoredFileEntry,
  OFFICIAL_GPS_CHAMBAI_FOLDERS,
} from '../../services/storageFolderService';
import { FileFormatIcon } from './FileFormatIcon';

interface GpsChambaiFolderModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  initialFolder?: string;
  onSelectFile?: (entry: StoredFileEntry, dataUrl: string) => void;
  selectFilterMimePrefix?: string;
}

export const GpsChambaiFolderModal: React.FC<GpsChambaiFolderModalProps> = ({
  isOpen: propIsOpen,
  onClose: propOnClose,
  initialFolder = 'GPS Chambai',
  onSelectFile,
  selectFilterMimePrefix,
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = propIsOpen !== undefined ? propIsOpen : internalOpen;
  const onClose = () => {
    setInternalOpen(false);
    propOnClose?.();
  };

  useEffect(() => {
    const onOpenEvent = (e: Event) => {
      const custom = e as CustomEvent<{ folderPath?: string }>;
      if (custom.detail?.folderPath) {
        setSelectedFolder(custom.detail.folderPath);
      }
      setInternalOpen(true);
    };
    window.addEventListener('gps-open-folder-modal', onOpenEvent);
    return () => window.removeEventListener('gps-open-folder-modal', onOpenEvent);
  }, []);

  const [folders, setFolders] = useState<string[]>(OFFICIAL_GPS_CHAMBAI_FOLDERS);
  const [selectedFolder, setSelectedFolder] = useState<string>(initialFolder);
  const [files, setFiles] = useState<StoredFileEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewFile, setPreviewFile] = useState<{
    entry: StoredFileEntry;
    dataUrl: string;
  } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameText, setRenameText] = useState('');
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = () => {
    setFolders(StorageFolderService.getFolders());
    setFiles(StorageFolderService.getFilesMetadata());
  };

  useEffect(() => {
    if (isOpen) {
      refresh();
      if (initialFolder) setSelectedFolder(initialFolder);
    }
  }, [isOpen, initialFolder]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('gps-folder-files-updated', onUpdate);
    return () => window.removeEventListener('gps-folder-files-updated', onUpdate);
  }, []);

  if (!isOpen) return null;

  const childFolders = folders.filter((f) => {
    if (f === selectedFolder) return false;
    if (!f.startsWith(selectedFolder + '/')) return false;
    const remainder = f.slice(selectedFolder.length + 1);
    return !remainder.includes('/');
  });

  const currentFolderFiles = files.filter((file) => {
    const matchesSearch = searchQuery.trim()
      ? file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.folderPath.toLowerCase().includes(searchQuery.toLowerCase()) ||
        file.moduleName.toLowerCase().includes(searchQuery.toLowerCase())
      : file.folderPath === selectedFolder || file.folderPath.startsWith(selectedFolder + '/');
    return matchesSearch;
  });

  const breadcrumbs = selectedFolder.split('/');

  const handleOpenPreview = async (entry: StoredFileEntry) => {
    const dataUrl = await StorageFolderService.getFileDataUrl(entry.id);
    if (dataUrl) {
      setPreviewFile({ entry, dataUrl });
    } else {
      setNotice('File metadata available; binary payload not cached.');
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleDownloadFile = async (entry: StoredFileEntry) => {
    const dataUrl = await StorageFolderService.getFileDataUrl(entry.id);
    if (!dataUrl) return;
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = entry.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setNotice(`Downloaded ${entry.fileName} to device storage`);
    setTimeout(() => setNotice(null), 3000);
  };

  const handleShareFile = async (entry: StoredFileEntry) => {
    const dataUrl = await StorageFolderService.getFileDataUrl(entry.id);
    if (navigator.share) {
      try {
        if (dataUrl) {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const fileObj = new File([blob], entry.fileName, { type: entry.mimeType });
          if (navigator.canShare && navigator.canShare({ files: [fileObj] })) {
            await navigator.share({
              title: entry.fileName,
              text: `${entry.fileName} from ${entry.folderPath}`,
              files: [fileObj],
            });
            return;
          }
        }
        await navigator.share({
          title: entry.fileName,
          text: `GPS Chambai File: ${entry.fileName} (${entry.folderPath})`,
        });
        return;
      } catch {
        // Fallback to WhatsApp share
      }
    }
    const waText = encodeURIComponent(
      `*GPS Chambai Kohat Official File*\nFile: ${entry.fileName}\nFolder: ${entry.folderPath}\nSize: ${entry.sizeFormatted}`
    );
    window.open(`https://wa.me/?text=${waText}`, '_blank', 'noopener,noreferrer');
  };

  const handleDeleteFile = async (id: string) => {
    await StorageFolderService.deleteFile(id);
    refresh();
    setNotice('File removed from GPS Chambai folder');
    setTimeout(() => setNotice(null), 2500);
  };

  const handleConfirmRename = (id: string) => {
    if (!renameText.trim()) return;
    StorageFolderService.renameFile(id, renameText);
    setRenamingId(null);
    refresh();
  };

  return (
    <div className="fixed inset-0 z-[220] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-4xl h-[90vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-950 text-white px-4 py-3 flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-amber-300 shrink-0">
              <HardDrive size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black tracking-tight truncate">
                GPS Chambai Internal Storage Folder Explorer
              </h3>
              <p className="text-[10px] text-emerald-200 font-semibold truncate">
                {folders.length} Initialized Folders • {files.length} Stored Files
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {notice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center gap-2 text-emerald-900 text-xs font-bold">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
        )}

        {/* Breadcrumb & Search */}
        <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1 flex-wrap text-xs font-black text-slate-700">
            {breadcrumbs.map((crumb, idx) => {
              const pathUpToHere = breadcrumbs.slice(0, idx + 1).join('/');
              return (
                <React.Fragment key={pathUpToHere}>
                  {idx > 0 && <ChevronRight size={13} className="text-slate-400" />}
                  <button
                    onClick={() => setSelectedFolder(pathUpToHere)}
                    className={`px-2 py-1 rounded-lg transition-colors ${
                      idx === breadcrumbs.length - 1
                        ? 'bg-emerald-700 text-white'
                        : 'hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {crumb}
                  </button>
                </React.Fragment>
              );
            })}
          </div>

          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files across GPS Chambai..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Explorer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Subfolders Grid */}
          {!searchQuery.trim() && childFolders.length > 0 && (
            <div>
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
                Subfolders in {selectedFolder} ({childFolders.length})
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                {childFolders.map((sub) => {
                  const shortName = sub.split('/').pop() || sub;
                  const countInSub = files.filter(
                    (f) => f.folderPath === sub || f.folderPath.startsWith(sub + '/')
                  ).length;
                  return (
                    <button
                      key={sub}
                      onClick={() => setSelectedFolder(sub)}
                      className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50/70 hover:bg-amber-100/80 border border-amber-200/80 text-left transition-all active:scale-98"
                    >
                      <Folder className="text-amber-500 fill-amber-400 shrink-0" size={24} />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-black text-slate-900 truncate">{shortName}</div>
                        <div className="text-[10px] font-bold text-slate-500">
                          {countInSub} {countInSub === 1 ? 'file' : 'files'}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Files List */}
          <div>
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 mb-2">
              Files ({currentFolderFiles.length})
            </h4>
            {currentFolderFiles.length === 0 ? (
              <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                <FolderOpen size={32} className="mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold text-slate-600">
                  Folder initialized and ready. All uploaded photos, PDFs, Word/Excel documents, and backups in this section are automatically saved here.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentFolderFiles
                  .filter((f) =>
                    selectFilterMimePrefix ? f.mimeType.startsWith(selectFilterMimePrefix) : true
                  )
                  .map((file) => {
                  return (
                    <div
                      key={file.id}
                      className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-2 hover:border-emerald-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileFormatIcon formatOrFileName={file.fileName} size={40} />
                        <div className="min-w-0 flex-1">
                          {renamingId === file.id ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="text"
                                value={renameText}
                                onChange={(e) => setRenameText(e.target.value)}
                                className="px-2 py-1 border border-emerald-500 rounded-lg text-xs font-bold"
                              />
                              <button
                                onClick={() => handleConfirmRename(file.id)}
                                className="px-2 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setRenamingId(null)}
                                className="px-2 py-1 bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs font-black text-slate-900 truncate">
                              {file.fileName}
                            </div>
                          )}
                          <div className="text-[10px] font-semibold text-slate-500 truncate">
                            {file.folderPath} • {file.sizeFormatted} •{' '}
                            {new Date(file.updatedAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {onSelectFile && (
                          <button
                            onClick={async () => {
                              const dataUrl = await StorageFolderService.getFileDataUrl(file.id);
                              if (dataUrl) {
                                onSelectFile(file, dataUrl);
                                onClose();
                              }
                            }}
                            className="px-2.5 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 text-[10px] font-black flex items-center gap-1 shadow-2xs"
                          >
                            <Check size={12} />
                            <span>Select</span>
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenPreview(file)}
                          className="p-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-black flex items-center gap-1"
                          title="Preview File"
                        >
                          <Eye size={13} />
                          <span className="hidden sm:inline">Preview</span>
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="p-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-[10px] font-black flex items-center gap-1"
                          title="Download File"
                        >
                          <Download size={13} />
                        </button>
                        <button
                          onClick={() => {
                            setRenamingId(file.id);
                            setRenameText(file.fileName);
                          }}
                          className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200"
                          title="Rename File"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          onClick={() => handleShareFile(file)}
                          className="p-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100"
                          title="Share File"
                        >
                          <Share2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100"
                          title="Delete File"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* File Preview Overlay */}
        {previewFile && (
          <div className="fixed inset-0 z-[240] bg-black/85 flex flex-col items-center justify-center p-4">
            <div className="bg-white w-full max-w-3xl h-[82vh] rounded-3xl overflow-hidden flex flex-col">
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-xs font-black truncate">{previewFile.entry.fileName}</div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {previewFile.entry.folderPath}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDownloadFile(previewFile.entry)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
                  >
                    <Download size={13} /> Download
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1.5 rounded-xl bg-white/10 hover:bg-rose-600 text-white"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>
              <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4">
                {previewFile.entry.mimeType.startsWith('image/') ? (
                  <img
                    src={previewFile.dataUrl}
                    alt={previewFile.entry.fileName}
                    className="max-w-full max-h-full object-contain rounded-xl shadow-md"
                  />
                ) : previewFile.entry.mimeType.startsWith('video/') ? (
                  <video
                    src={previewFile.dataUrl}
                    controls
                    autoPlay
                    className="max-w-full max-h-full rounded-xl shadow-md"
                  />
                ) : (
                  <iframe
                    src={previewFile.dataUrl}
                    title={previewFile.entry.fileName}
                    className="w-full h-full bg-white rounded-xl border border-slate-200"
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
