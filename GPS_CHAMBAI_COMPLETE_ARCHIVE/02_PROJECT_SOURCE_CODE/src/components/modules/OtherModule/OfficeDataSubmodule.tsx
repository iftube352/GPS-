import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Printer,
  Trash2,
  Upload,
  FileText,
  X,
  Download,
  Share2,
  Eye,
  Edit3,
  FolderOpen,
} from 'lucide-react';
import { OfficeDocument } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  readFileAsDataUrl,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  shareDocumentOrFile,
  triggerDirectDownload,
} from '../../../services/printAndFileService';
import { StorageFolderService } from '../../../services/storageFolderService';
import { ViewModeToggle, useViewMode } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface ExtendedOfficeDoc extends OfficeDocument {
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
  mimeType?: string;
  storageFileId?: string;
}

export const OfficeDataSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [docs, setDocs] = useState<ExtendedOfficeDoc[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<ExtendedOfficeDoc | null>(null);
  const [renamingDoc, setRenamingDoc] = useState<ExtendedOfficeDoc | null>(null);
  const [renameText, setRenameText] = useState('');
  const [viewMode, setViewMode] = useViewMode('office_data', 'list');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [refNo, setRefNo] = useState('GPSC/2026/101');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<OfficeDocument['category']>('Circular');
  const [remarks, setRemarks] = useState('');
  const [uploadedFileMeta, setUploadedFileMeta] = useState<{
    fileName: string;
    sizeLabel: string;
    dataUrl: string;
    mimeType: string;
    fileId?: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  const refresh = () => {
    setDocs(StorageService.getOfficeDocs() as ExtendedOfficeDoc[]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const getFolderForCategory = (cat: OfficeDocument['category']) => {
    if (cat === 'Order') return 'Office Data/Order';
    if (cat === 'Circular') return 'Office Data/Notifications';
    return 'Office Data/Performa';
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const targetFolder = getFolderForCategory(category);
      const res = await readFileAsDataUrl(file, targetFolder);
      setUploadedFileMeta({
        fileName: res.fileName,
        sizeLabel: res.sizeLabel,
        dataUrl: res.dataUrl,
        mimeType: res.mimeType,
        fileId: res.fileId,
      });
      if (!title) setTitle(res.fileName);
      showToast(`Loaded "${res.fileName}" (${res.sizeLabel}) into GPS Chambai/${targetFolder}`);
    } catch {
      showToast('Failed to read file');
    }
    e.target.value = '';
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const newRecord: ExtendedOfficeDoc = {
      id: `od-${Date.now()}`,
      title: title.trim(),
      refNo: refNo.trim(),
      date,
      category,
      remarks: uploadedFileMeta
        ? `${remarks} [File: ${uploadedFileMeta.fileName} (${uploadedFileMeta.sizeLabel})]`.trim()
        : remarks,
      fileDataUrl: uploadedFileMeta?.dataUrl,
      fileName: uploadedFileMeta?.fileName,
      fileSize: uploadedFileMeta?.sizeLabel,
      mimeType: uploadedFileMeta?.mimeType,
      storageFileId: uploadedFileMeta?.fileId,
    };
    StorageService.addOfficeDoc(newRecord);
    setTitle('');
    setRemarks('');
    setUploadedFileMeta(null);
    setShowAddModal(false);
    refresh();
    showToast('Saved Office Document record');
  };

  const handleRenameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingDoc || !renameText.trim()) return;
    const updated = docs.map((d) =>
      d.id === renamingDoc.id ? { ...d, title: renameText.trim() } : d
    );
    localStorage.setItem('gpsc_office_docs_v1', JSON.stringify(updated));
    if (renamingDoc.storageFileId) {
      StorageFolderService.renameFile(renamingDoc.storageFileId, renameText.trim());
    }
    setRenamingDoc(null);
    refresh();
    showToast('Renamed Office Document');
  };

  const buildRegisterHtml = () => {
    const rows = docs
      .map(
        (d, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${d.refNo}</strong></td>
          <td>${d.date}</td>
          <td><strong>${d.title}</strong></td>
          <td>${d.category}</td>
          <td>${d.remarks}</td>
        </tr>
      `
      )
      .join('');

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Reference No</th>
            <th>Date</th>
            <th>Document Title</th>
            <th>Category</th>
            <th>Remarks / Attached File</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const handlePrintOfficeRegister = () => {
    printHtmlDocument(
      'Official School Dispatch & Office Record Register — GPS Chambai Kohat',
      buildRegisterHtml()
    );
  };

  const handleSaveRegisterPdf = async () => {
    await exportAndSaveRealPdf(
      'Official School Dispatch & Office Record Register — GPS Chambai Kohat',
      ['#', 'Ref No', 'Date', 'Document Title', 'Category', 'Remarks'],
      docs.map((d, i) => [
        String(i + 1),
        d.refNo,
        d.date,
        d.title,
        d.category,
        d.remarks,
      ]),
      'GPS_Chambai_Office_Dispatch_Register.pdf',
      'Office Data/Notifications'
    );
    showToast('Saved PDF to GPS Chambai/Office Data/Notifications/');
  };

  const handleSaveRegisterDoc = async () => {
    await exportAndSaveWordDoc(
      'Official School Dispatch & Office Record Register — GPS Chambai Kohat',
      buildRegisterHtml(),
      'GPS_Chambai_Office_Dispatch_Register.doc',
      'Office Data/Notifications'
    );
    showToast('Saved Word Doc to GPS Chambai/Office Data/Notifications/');
  };

  const handleDownloadSingleDoc = async (doc: ExtendedOfficeDoc) => {
    if (doc.fileDataUrl) {
      triggerDirectDownload(doc.fileName || `${doc.title}.pdf`, doc.fileDataUrl);
      showToast(`Downloaded ${doc.fileName || doc.title}`);
      return;
    }
    await exportAndSaveRealPdf(
      `Office Document — ${doc.title}`,
      ['Field', 'Detail'],
      [
        ['Document Title', doc.title],
        ['Reference Number', doc.refNo],
        ['Date', doc.date],
        ['Category', doc.category],
        ['Remarks', doc.remarks],
      ],
      `${doc.title.replace(/\s+/g, '_')}.pdf`,
      getFolderForCategory(doc.category)
    );
    showToast(`Saved PDF for ${doc.title}`);
  };

  const handleShareSingleDoc = async (doc: ExtendedOfficeDoc) => {
    await shareDocumentOrFile({
      title: doc.title,
      text: `GPS Chambai Office Document: ${doc.title} (Ref: ${doc.refNo}, Date: ${doc.date}) — ${doc.remarks}`,
      fileName: doc.fileName,
      dataUrl: doc.fileDataUrl,
      mimeType: doc.mimeType,
    });
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {statusToast && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-xl border border-indigo-400/40">
          {statusToast}
        </div>
      )}

      <div className="bg-gradient-to-r from-indigo-700 to-slate-900 text-white rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'دفتری ریکارڈ' : 'Office Data'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} dark />
          <button
            onClick={handlePrintOfficeRegister}
            className="px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1"
            title="Print Office Register"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={handleSaveRegisterPdf}
            className="px-2.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleSaveRegisterDoc}
            className="px-2.5 py-2 rounded-xl bg-sky-100 text-sky-950 text-xs font-black flex items-center gap-1"
          >
            <FileText size={14} />
            <span>DOC</span>
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-indigo-800 text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Plus size={15} />
            <span>Upload / Add Record</span>
          </button>
        </div>
      </div>

      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-2.5'}>
        {docs.map((doc) => (
          <div
            key={doc.id}
            className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                    {doc.category}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {doc.refNo} • {doc.date}
                  </span>
                </div>
                <h4 className="text-sm font-black text-slate-900 mt-1 break-words">{doc.title}</h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5 break-words">{doc.remarks}</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-1.5 flex-wrap pt-2 border-t border-slate-100">
              <button
                onClick={() => setPreviewDoc(doc)}
                className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-black flex items-center gap-1"
              >
                <Eye size={12} />
                <span>Preview / Open</span>
              </button>
              <button
                onClick={() => handleDownloadSingleDoc(doc)}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-black flex items-center gap-1"
              >
                <Download size={12} />
                <span>Download / PDF</span>
              </button>
              <button
                onClick={() => {
                  setRenamingDoc(doc);
                  setRenameText(doc.title);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-black flex items-center gap-1"
              >
                <Edit3 size={12} />
                <span>Rename</span>
              </button>
              <button
                onClick={() => handleShareSingleDoc(doc)}
                className="px-2.5 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-700 text-[11px] font-black flex items-center gap-1"
              >
                <Share2 size={12} />
                <span>Share</span>
              </button>
              <button
                onClick={() => {
                  StorageService.deleteOfficeDoc(doc.id);
                  if (doc.storageFileId) {
                    StorageFolderService.deleteFile(doc.storageFileId);
                  }
                  refresh();
                  showToast('Deleted Office Document');
                }}
                className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 shrink-0"
                title="Delete"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-700">
                  {previewDoc.category} • {previewDoc.refNo} • {previewDoc.date}
                </span>
                <h3 className="text-base font-black text-slate-900">{previewDoc.title}</h3>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs font-semibold text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {previewDoc.remarks}
            </p>

            {previewDoc.fileDataUrl && (
              <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100 p-2 text-center">
                {previewDoc.fileDataUrl.startsWith('data:image/') ? (
                  <img
                    src={previewDoc.fileDataUrl}
                    alt={previewDoc.title}
                    className="max-h-96 mx-auto rounded-xl object-contain"
                  />
                ) : previewDoc.fileDataUrl.startsWith('data:application/pdf') ? (
                  <iframe
                    src={previewDoc.fileDataUrl}
                    title={previewDoc.title}
                    className="w-full h-96 rounded-xl"
                  />
                ) : (
                  <div className="p-6 text-xs font-bold text-slate-600">
                    Attached File: {previewDoc.fileName} ({previewDoc.fileSize})
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() =>
                  printHtmlDocument(
                    `Office Document — ${previewDoc.title}`,
                    `<p><strong>Ref No:</strong> ${previewDoc.refNo} | <strong>Date:</strong> ${previewDoc.date} | <strong>Category:</strong> ${previewDoc.category}</p><p>${previewDoc.remarks}</p>`
                  )
                }
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1"
              >
                <Printer size={14} />
                <span>Print Document</span>
              </button>
              <button
                onClick={() => handleDownloadSingleDoc(previewDoc)}
                className="px-3.5 py-2 rounded-xl bg-indigo-700 text-white text-xs font-black flex items-center gap-1"
              >
                <Download size={14} />
                <span>Download / Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {renamingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleRenameSubmit}
            className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <h3 className="text-sm font-black text-slate-900">Rename Office Document</h3>
            <input
              type="text"
              required
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRenamingDoc(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl bg-indigo-700 text-white text-xs font-black"
              >
                Save Name
              </button>
            </div>
          </form>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add / Upload Office Document</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Upload File (PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG, TXT)
              </label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-indigo-300 bg-indigo-50/40 text-xs font-bold text-indigo-900 flex items-center justify-center gap-2"
              >
                <Upload size={15} />
                <span>
                  {uploadedFileMeta
                    ? `${uploadedFileMeta.fileName} (${uploadedFileMeta.sizeLabel})`
                    : 'Choose Office File from Device'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Document Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Reference No
                </label>
                <input
                  type="text"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as OfficeDocument['category'])
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="Circular">Circular (Notifications)</option>
                  <option value="Order">Order</option>
                  <option value="Inspection">Inspection (Performa)</option>
                  <option value="Monthly Return">Monthly Return (Performa)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-indigo-700 text-white text-xs font-black"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
