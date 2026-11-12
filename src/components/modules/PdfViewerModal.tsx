import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { BookguideItem } from '../../types';
import { printHtmlDocument, saveFileToGpsChambaiFolder } from '../../services/printAndFileService';

interface PdfViewerModalProps {
  item: BookguideItem;
  onClose: () => void;
}

export const PdfViewerModal: React.FC<PdfViewerModalProps> = ({ item, onClose }) => {
  const [zoom, setZoom] = useState(100);
  const [page, setPage] = useState(1);

  const isCustomFile = Boolean(item.fileUrl && item.fileUrl.length > 5);
  const totalPages = item.pages || 24;

  const handlePrintPdfBook = () => {
    if (isCustomFile && item.fileUrl?.startsWith('data:application/pdf')) {
      // Open print preview with embedded PDF and summary header
      printHtmlDocument(
        `${item.title} - ${item.className}`,
        `
          <div class="badge">${item.type === 'book' ? 'OFFICIAL TEXTBOOK' : 'TEACHER GUIDE'} • ${item.className}</div>
          <h2 style="font-size:18px;font-weight:900;margin:8px 0;">${item.title}</h2>
          <p style="font-size:12px;margin-bottom:14px;">
            <strong>Subject:</strong> ${item.subject} &nbsp;|&nbsp;
            <strong>Class:</strong> ${item.className} &nbsp;|&nbsp;
            <strong>Pages:</strong> ${totalPages} &nbsp;|&nbsp;
            <strong>Size:</strong> ${item.fileSize}
          </p>
          <div style="border:2px solid #065f46;border-radius:12px;padding:16px;background:#f8fafc;">
            <p style="font-size:13px;line-height:1.7;">
              ${item.description || 'Official Khyber Pakhtunkhwa Textbook Board curriculum document for Government Primary School Chambai Kohat.'}
            </p>
          </div>
        `
      );
      return;
    }

    printHtmlDocument(
      `${item.title} (${item.className})`,
      `
        <div class="badge">${item.type === 'book' ? 'KP TEXTBOOK BOARD PESHAWAR' : 'TEACHER LESSON GUIDE'}</div>
        <h2 style="font-size:20px;font-weight:900;margin:6px 0;">${item.title}</h2>
        <table>
          <tbody>
            <tr><th>Book / Guide Title</th><td><strong>${item.title}</strong></td></tr>
            <tr><th>Class</th><td>${item.className}</td></tr>
            <tr><th>Subject</th><td>${item.subject}</td></tr>
            <tr><th>Total Pages</th><td>${totalPages} Pages (Currently viewing Page ${page})</td></tr>
            <tr><th>File Size</th><td>${item.fileSize}</td></tr>
          </tbody>
        </table>
        <div style="border:1px solid #cbd5e1;border-radius:10px;padding:18px;margin-top:12px;">
          <h3 style="font-size:15px;font-weight:800;margin-bottom:8px;">Chapter ${page}: Curriculum Lesson & Exercises</h3>
          <p style="font-size:13px;line-height:1.7;">
            ${item.description || `Core learning competencies and classroom exercises for ${item.subject} (${item.className}) prescribed by Directorate of Curriculum & Teacher Education (DCTE) Abbottabad and KP Textbook Board Peshawar.`}
          </p>
        </div>
      `
    );
  };

  const handleDownloadBook = () => {
    const safeName = `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    if (isCustomFile && item.fileUrl) {
      saveFileToGpsChambaiFolder(safeName, item.fileUrl);
    } else {
      // Save printable summary into GPS Chambai folder
      saveFileToGpsChambaiFolder(
        `${item.title.replace(/[^a-zA-Z0-9_-]/g, '_')}_Summary.txt`,
        `GPS CHAMBAI KOHAT - OFFICIAL BOOK RECORD\nTitle: ${item.title}\nClass: ${item.className}\nSubject: ${item.subject}\nPages: ${totalPages}\nDescription: ${item.description || 'Official KP Curriculum Book'}`,
        'text/plain;charset=utf-8'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/95 backdrop-blur-md animate-fade-in text-white">
      {/* Top Action Bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0"
            style={{ backgroundColor: item.coverColor || '#059669' }}
          >
            PDF
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm truncate leading-tight">{item.title}</h3>
            <p className="text-[10px] text-slate-400">
              {item.className} • {item.subject} • {item.fileSize}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrintPdfBook}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-xs font-black flex items-center gap-1 transition-colors"
            title="Print Book / PDF"
          >
            <Printer size={14} />
            <span className="hidden xs:inline">Print</span>
          </button>
          <button
            onClick={handleDownloadBook}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-200 transition-colors"
            title="Save to GPS Chambai folder"
          >
            <Download size={16} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Controls Sub-bar */}
      {!isCustomFile && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-semibold text-slate-300">
              Page <strong className="text-white">{page}</strong> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 disabled:opacity-40 hover:bg-slate-700"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setZoom((z) => Math.max(60, z - 20))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <ZoomOut size={14} />
            </button>
            <span className="font-mono w-11 text-center text-[11px]">{zoom}%</span>
            <button
              onClick={() => setZoom((z) => Math.min(180, z + 20))}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
            >
              <ZoomIn size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 overflow-auto p-4 flex items-start justify-center">
        {isCustomFile ? (
          <iframe
            src={item.fileUrl}
            title={item.title}
            className="w-full h-full bg-white rounded-2xl shadow-2xl border border-slate-700"
          />
        ) : (
          <div
            style={{ width: `${Math.min(100, zoom)}%`, transformOrigin: 'top center' }}
            className="bg-white text-slate-800 rounded-2xl shadow-2xl p-6 max-w-xl w-full transition-all duration-200 border border-slate-200 space-y-5"
          >
            {/* Simulated Textbook Page Header */}
            <div className="border-b-2 border-emerald-700 pb-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  KP Textbook Board Peshawar
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">{item.title}</h2>
                <p className="text-xs text-slate-500 font-medium">
                  {item.className} • Subject: {item.subject}
                </p>
              </div>
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
                style={{ backgroundColor: item.coverColor || '#059669' }}
              >
                <BookOpen size={24} />
              </div>
            </div>

            {/* Simulated Chapter Content */}
            <div className="space-y-3 text-xs leading-relaxed text-slate-600">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
                <h4 className="font-bold text-slate-800 text-sm mb-1">
                  Chapter {page}: Core Learning Objectives
                </h4>
                <p>
                  {item.description ||
                    'Official curriculum module designed for Government Primary Schools in Khyber Pakhtunkhwa.'}
                </p>
              </div>

              <p>
                <strong>1. Overview & Key Concepts (صفحہ نمبر {page}):</strong> Students in{' '}
                <span className="font-semibold text-slate-800">{item.className}</span> will explore
                foundational skills in{' '}
                <span className="font-semibold text-slate-800">{item.subject}</span> through
                structured classroom activities, reading exercises, and formative assessments.
              </p>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200/60">
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 block">
                    Teacher Activity
                  </span>
                  <p className="text-[11px] text-emerald-950 mt-0.5">
                    Interactive board demonstration & group reading session (20 mins).
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/60">
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 block">
                    Student Assessment
                  </span>
                  <p className="text-[11px] text-amber-950 mt-0.5">
                    Oral questioning & notebook writing practice (15 mins).
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
              <span>Govt. Primary School Chambai Kohat</span>
              <span>
                Page {page} of {totalPages}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
