import React, { useState } from 'react';
import { X, Printer, Download, ZoomIn, ZoomOut, FileText, ChevronLeft, ChevronRight, Award } from 'lucide-react';
import { saveFileToModuleFolder, printHtmlDocument } from '../../../services/printAndFileService';

interface EceOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ECE_ITEMS = [
  {
    id: 'ece-1',
    title: 'Office Order — DEO (Male) Kohat (Image 24)',
    shortTitle: '1. DEO Office Order',
    url: '/assets/aistudio/image_024_9c9c5dc0.jpg',
    description: 'Retention of ECE trained teachers at original schools by District Education Officer (Male) Kohat.',
  },
  {
    id: 'ece-2',
    title: 'Notification — Directorate of E&SE KP Peshawar (Image 25)',
    shortTitle: '2. Directorate Notification',
    url: '/assets/aistudio/image_025_84860f35.jpg',
    description: 'Notification of Early Childhood Education (ECE) Teachers & TORs across KP schools.',
  },
  {
    id: 'ece-3',
    title: 'Certificate of Participation — UNICEF & KP ESED (Image 26)',
    shortTitle: '3. UNICEF Certificate',
    url: '/assets/aistudio/image_026_cc60e266.jpg',
    description: '5 Days Teachers Training on Early Childhood Education (ECE) awarded to Muhammad Irfan PST.',
  },
];

export const EceOrderModal: React.FC<EceOrderModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(100);

  if (!isOpen) return null;

  const current = ECE_ITEMS[currentIndex];

  const handleDownload = () => {
    fetch(current.url)
      .then((res) => res.blob())
      .then((blob) => {
        saveFileToModuleFolder('ECE Order & Notification', `${current.shortTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`, blob, 'image/jpeg');
      })
      .catch(() => {
        const a = document.createElement('a');
        a.href = current.url;
        a.download = `${current.shortTitle}.jpg`;
        a.click();
      });
  };

  const handlePrint = () => {
    printHtmlDocument(
      current.title,
      `
      <div style="text-align:center;padding:10px;">
        <h2 style="font-size:18px;margin-bottom:8px;color:#065f46;">${current.title}</h2>
        <p style="font-size:12px;color:#64748b;margin-bottom:14px;">${current.description}</p>
        <img src="${current.url}" style="max-width:100%;height:auto;border:1px solid #cbd5e1;border-radius:12px;" />
      </div>
      `,
      'portrait',
      false
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col animate-fade-in text-white">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between p-3 sm:px-6 bg-slate-950 border-b border-slate-800 gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40">
            <Award size={18} />
          </div>
          <div>
            <h3 className="font-black text-sm text-white leading-tight">ECE Order &amp; Notification</h3>
            <p className="text-[10px] text-slate-400 truncate max-w-xs sm:max-w-md">
              {current.title}
            </p>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="flex items-center bg-slate-800 rounded-xl p-0.5 border border-slate-700">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom Out"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-[11px] font-bold px-2 text-slate-200">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(220, z + 15))}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-300"
              title="Zoom In"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={() => setZoom(100)}
              className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 text-[10px] font-black px-1.5"
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
            onClick={onClose}
            className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors ml-1"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Tabs Row for the 3 Images */}
      <div className="bg-slate-900 border-b border-slate-800 p-2 flex items-center justify-center gap-2 overflow-x-auto shrink-0">
        {ECE_ITEMS.map((item, index) => (
          <button
            key={item.id}
            onClick={() => {
              setCurrentIndex(index);
              setZoom(100);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 shrink-0 ${
              currentIndex === index
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FileText size={13} />
            <span>{item.shortTitle}</span>
          </button>
        ))}
      </div>

      {/* Image Viewer with Navigation */}
      <div className="flex-1 bg-slate-950 p-3 sm:p-6 overflow-auto flex items-center justify-center relative">
        {/* Prev / Next buttons */}
        <button
          onClick={() => {
            setCurrentIndex((i) => (i > 0 ? i - 1 : ECE_ITEMS.length - 1));
            setZoom(100);
          }}
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center shadow-xl border border-slate-700 z-10"
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={() => {
            setCurrentIndex((i) => (i < ECE_ITEMS.length - 1 ? i + 1 : 0));
            setZoom(100);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white flex items-center justify-center shadow-xl border border-slate-700 z-10"
        >
          <ChevronRight size={22} />
        </button>

        {/* Display Image */}
        <div
          className="transition-transform duration-200 shadow-2xl rounded-2xl overflow-hidden border border-slate-800 bg-white"
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'center center' }}
        >
          <img
            src={current.url}
            alt={current.title}
            className="max-h-[80vh] w-auto object-contain mx-auto"
          />
        </div>
      </div>

      {/* Description Footer */}
      <div className="bg-slate-950 p-2.5 text-center text-xs text-slate-300 border-t border-slate-800">
        <span className="text-amber-400 font-bold">{current.title}</span> — {current.description}
      </div>
    </div>
  );
};
