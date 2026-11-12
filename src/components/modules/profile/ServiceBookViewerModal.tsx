import React, { useState } from 'react';
import { X, Printer, Download, Share2, ZoomIn, ZoomOut, RotateCw, BookOpen } from 'lucide-react';
import { saveFileToModuleFolder } from '../../../services/printAndFileService';

interface ServiceBookViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceBookViewerModal: React.FC<ServiceBookViewerModalProps> = ({ isOpen, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const pdfUrl = '/assets/aistudio/pdf_23_95f6e1ac.pdf';

  if (!isOpen) return null;

  const handleDownload = () => {
    fetch(pdfUrl)
      .then((res) => res.blob())
      .then((blob) => {
        saveFileToModuleFolder('My Service Book', 'Muhammad_Irfan_Service_Book.pdf', blob, 'application/pdf');
      })
      .catch(() => {
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = 'Muhammad_Irfan_Service_Book.pdf';
        a.click();
      });
  };

  const handlePrint = () => {
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.focus();
    } else {
      window.print();
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Official Service Book — Muhammad Irfan',
          text: 'Official Service Book Document of Muhammad Irfan SPST (BPS-14), GPS Chambai Kohat',
          url: pdfUrl,
        });
      } catch {
        // User cancelled or unsupported
      }
    } else {
      navigator.clipboard?.writeText(window.location.origin + pdfUrl);
      alert('Service Book link copied to clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in text-white">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 sm:px-6 bg-slate-950 border-b border-slate-800 gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/30 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm text-white leading-tight">My Service Book (PDF 23)</h3>
            <p className="text-[10px] text-slate-400">
              Muhammad Irfan · Govt. Primary School Chambai Kohat (EMIS: 16454)
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(50, z - 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-bold px-2 text-slate-200">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(200, z + 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 text-[10px] font-black px-1.5"
              title="Reset Zoom"
            >
              100%
            </button>
          </div>

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Printer size={14} />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Download size={14} />
            <span className="hidden sm:inline">Download</span>
          </button>

          <button
            onClick={handleShare}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-black flex items-center gap-1"
          >
            <Share2 size={14} />
            <span className="hidden sm:inline">Share</span>
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* PDF Viewport */}
      <div className="flex-1 bg-slate-900 p-2 sm:p-4 overflow-auto flex justify-center items-start">
        <div
          className="w-full max-w-4xl h-full min-h-[600px] bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 transition-transform duration-200"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
        >
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            title="My Service Book PDF"
            className="w-full h-full border-0 min-h-[750px]"
          />
        </div>
      </div>

      {/* Bottom Footer Notification */}
      <div className="bg-slate-950 p-2 text-center text-[11px] text-slate-400 border-t border-slate-800">
        Saved in: <span className="text-emerald-400 font-mono">Internal Storage / GPS Chambai / My Service Book /</span>
      </div>
    </div>
  );
};
