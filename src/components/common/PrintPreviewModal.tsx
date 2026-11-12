import React, { useEffect, useState, useRef } from 'react';
import {
  Printer,
  Download,
  X,
  FileText,
  CheckCircle2,
  Share2,
  FolderOpen,
  FileSpreadsheet,
  Image as ImageIcon,
  Table,
} from 'lucide-react';
import {
  executeIframePrint,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  exportAndSaveExcelXls,
  exportVisualHtmlToPdf,
  exportVisualHtmlToJpg,
  canvasToPdfBlob,
  renderHtmlOrElementToVisualCanvas,
  shareDocumentOrFile,
} from '../../services/printAndFileService';

interface PrintPreviewPayload {
  title: string;
  htmlContent: string;
  landscape?: boolean;
  includeHeader?: boolean;
  fullDocumentHtml: string;
  folderSubPath?: string;
}

export const PrintPreviewModal: React.FC = () => {
  const [payload, setPayload] = useState<PrintPreviewPayload | null>(null);
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<PrintPreviewPayload>;
      if (customEvent.detail) {
        setPayload(customEvent.detail);
        setSavedNotice(null);
      }
    };
    window.addEventListener('gps-open-print-preview', handler);
    return () => window.removeEventListener('gps-open-print-preview', handler);
  }, []);

  if (!payload) return null;

  const orientation: 'portrait' | 'landscape' = payload.landscape ? 'landscape' : 'portrait';
  const subFolder = `GPS Chambai/${payload.folderSubPath || 'PDF & Print Records/Export PDF'}`;

  const handleSystemPrint = () => {
    if (iframeRef.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.focus();
        iframeRef.current.contentWindow.print();
        return;
      } catch {
        // Fallback to hidden iframe print
      }
    }
    executeIframePrint(payload.fullDocumentHtml, payload.title);
  };

  const handleSaveRealPdf = async () => {
    setIsExporting(true);
    try {
      const iframeBody = iframeRef.current?.contentDocument?.body;
      const res = await exportVisualHtmlToPdf(
        payload.title,
        iframeBody || payload.fullDocumentHtml,
        {
          orientation,
          includeHeader: false,
          subFolder,
          moduleName: 'Universal Print & PDF Engine',
        }
      );
      setSavedNotice(`Saved PDF (${res.filename}) to ${res.folderPath}`);
    } catch {
      const res = exportAndSaveRealPdf(payload.title, payload.fullDocumentHtml, {
        landscape: payload.landscape,
        includeHeader: false,
        folderSubPath: payload.folderSubPath || 'PDF & Print Records/Export PDF',
        moduleSource: 'Universal Print & PDF Engine',
      });
      setSavedNotice(`Saved PDF (${res.filename}) to ${res.folderPath}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setSavedNotice(null), 5000);
    }
  };

  const handleSaveWordDoc = () => {
    const res = exportAndSaveWordDoc(payload.title, payload.fullDocumentHtml, {
      landscape: payload.landscape,
      includeHeader: false,
      folderSubPath: payload.folderSubPath || 'PDF & Print Records/Export PDF',
      moduleSource: 'Universal Print & PDF Engine',
    });
    setSavedNotice(`Saved Word DOC (${res.filename}) to ${res.folderPath}`);
    setTimeout(() => setSavedNotice(null), 5000);
  };

  const handleSaveExcelXls = () => {
    const res = exportAndSaveExcelXls(
      payload.title,
      payload.htmlContent || payload.fullDocumentHtml,
      subFolder,
      'Universal Print & PDF Engine'
    );
    setSavedNotice(`Saved Excel XLS (${res.filename}) to ${res.folderPath}`);
    setTimeout(() => setSavedNotice(null), 5000);
  };

  const handleSaveJpgImage = async () => {
    setIsExporting(true);
    try {
      const iframeBody = iframeRef.current?.contentDocument?.body;
      const res = await exportVisualHtmlToJpg(
        payload.title,
        iframeBody || payload.fullDocumentHtml,
        {
          orientation,
          includeHeader: false,
          subFolder,
          moduleName: 'Universal Print & PDF Engine',
        }
      );
      setSavedNotice(`Saved High-Res JPG (${res.filename}) to ${res.folderPath}`);
    } finally {
      setIsExporting(false);
      setTimeout(() => setSavedNotice(null), 5000);
    }
  };

  const handleSharePdf = async () => {
    setIsExporting(true);
    try {
      const iframeBody = iframeRef.current?.contentDocument?.body;
      const canvas = await renderHtmlOrElementToVisualCanvas(
        iframeBody || payload.fullDocumentHtml,
        orientation
      );
      const pdfBlob = canvasToPdfBlob(canvas, orientation);
      const safeName = `${payload.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      await shareDocumentOrFile({
        title: payload.title,
        text: `${payload.title} — Govt. Primary School Chambai Kohat (EMIS: 16454)`,
        fileBlob: pdfBlob,
        filename: safeName,
        mimeType: 'application/pdf',
      });
      setSavedNotice('Shared PDF via system share / WhatsApp');
    } finally {
      setIsExporting(false);
      setTimeout(() => setSavedNotice(null), 4000);
    }
  };

  const handleOpenGpsFolder = () => {
    window.dispatchEvent(
      new CustomEvent('gps-open-folder-modal', {
        detail: { folderPath: subFolder },
      })
    );
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white w-full max-w-5xl h-[93vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <FileText size={18} />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black tracking-tight truncate">{payload.title}</h3>
              <p className="text-[10px] text-slate-400 font-semibold">
                Official Print &amp; Export Engine • Jameel Noori Nastaleeq • GPS Chambai Kohat (EMIS: 16454)
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={handleSystemPrint}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition-all active:scale-95"
              title="Direct Print (A4 Page Setup)"
            >
              <Printer size={15} />
              <span>Direct Print</span>
            </button>
            <button
              onClick={handleSaveRealPdf}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Save exact Print Preview layout as .PDF file"
            >
              <Download size={14} />
              <span>{isExporting ? 'Saving...' : 'Save PDF'}</span>
            </button>
            <button
              onClick={handleSaveWordDoc}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              title="Save editable Word (.doc) file"
            >
              <FileSpreadsheet size={14} />
              <span>Save DOC</span>
            </button>
            <button
              onClick={handleSaveExcelXls}
              className="px-2.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all active:scale-95"
              title="Save Excel (.xls) file"
            >
              <Table size={14} />
              <span>Save XLS</span>
            </button>
            <button
              onClick={handleSaveJpgImage}
              disabled={isExporting}
              className="px-2.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1 shadow-sm transition-all active:scale-95"
              title="Save High-Resolution .JPG image"
            >
              <ImageIcon size={14} />
              <span>Save JPG</span>
            </button>
            <button
              onClick={handleSharePdf}
              disabled={isExporting}
              className="px-2.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1 transition-all active:scale-95"
              title="Share PDF via WhatsApp or System Share"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>
            <button
              onClick={handleOpenGpsFolder}
              className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1 border border-slate-700 transition-all active:scale-95"
              title="Open Saved Files in GPS Chambai Folder"
            >
              <FolderOpen size={14} />
              <span className="hidden md:inline">Folder</span>
            </button>
            <button
              onClick={() => setPayload(null)}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-rose-600 text-white flex items-center justify-center transition-colors ml-1"
              aria-label="Close Print Preview"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between gap-2 text-emerald-800 text-xs font-bold">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
              <span>{savedNotice}</span>
            </div>
            <button
              onClick={handleOpenGpsFolder}
              className="px-2.5 py-1 rounded-lg bg-emerald-700 text-white text-[11px] font-black hover:bg-emerald-800"
            >
              Open GPS Chambai Folder
            </button>
          </div>
        )}

        {/* Document Preview Area */}
        <div className="flex-1 bg-slate-100 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          <div className="bg-white w-full h-full rounded-2xl shadow-inner border border-slate-200 overflow-hidden">
            <iframe
              ref={iframeRef}
              title={payload.title}
              srcDoc={payload.fullDocumentHtml}
              className="w-full h-full border-0"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

