import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { TimetableGridRow, TimetableDayName } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface StructuredTimetableRow {
  id: string;
  day: string;
  time: string;
  period: string;
  teacherName: string;
  subject: string;
}

const STRUCTURED_TT_KEY = 'gps_chambai_structured_timetable_v1';

const DEFAULT_STRUCTURED_ROWS: StructuredTimetableRow[] = [
  {
    id: 'tt-1',
    day: 'Monday (پیر)',
    time: '08:00 AM - 08:40 AM',
    period: 'Period 1',
    teacherName: 'Zar Khan Afridi (PSHT)',
    subject: 'Holy Quran / Islamiat (اسلامیات)',
  },
  {
    id: 'tt-2',
    day: 'Monday (پیر)',
    time: '08:40 AM - 09:20 AM',
    period: 'Period 2',
    teacherName: 'Muhammad Irfan (PST)',
    subject: 'Mathematics (ریاضی) — Class 5',
  },
  {
    id: 'tt-3',
    day: 'Tuesday (منگل)',
    time: '09:20 AM - 10:00 AM',
    period: 'Period 3',
    teacherName: 'Anar Khan (SPST)',
    subject: 'English (انگریزی) — Class 4 & 5',
  },
  {
    id: 'tt-4',
    day: 'Wednesday (بدھ)',
    time: '10:00 AM - 10:40 AM',
    period: 'Period 4',
    teacherName: 'Mubashir Ahmad (PST)',
    subject: 'General Science (جنرل سائنس)',
  },
  {
    id: 'tt-5',
    day: 'Thursday (جمعرات)',
    time: '11:00 AM - 11:40 AM',
    period: 'Period 5',
    teacherName: 'Sadaqat Khan (PST)',
    subject: 'Urdu (اردو) — Class 3 & 4',
  },
  {
    id: 'tt-6',
    day: 'Friday (جمعہ)',
    time: '11:40 AM - 12:20 PM',
    period: 'Period 6',
    teacherName: 'Shemood Ur Rehman (SPST)',
    subject: 'Pashto / Social Studies (پشتو / معاشرتی علوم)',
  },
  {
    id: 'tt-7',
    day: 'Saturday (ہفتہ)',
    time: '12:20 PM - 01:00 PM',
    period: 'Period 7',
    teacherName: 'Muhammad Irfan (PST)',
    subject: 'Drawing / Physical Education (ڈرائنگ)',
  },
];

const PERIOD_KEYS: (keyof Omit<TimetableGridRow, 'day'>)[] = [
  'period1',
  'period2',
  'period3',
  'period4',
  'period5',
  'period6',
  'period7',
];

const DAY_URDU_LABELS: Record<TimetableDayName, string> = {
  Monday: 'پیر',
  Tuesday: 'منگل',
  Wednesday: 'بدھ',
  Thursday: 'جمعرات',
  Friday: 'جمعہ',
  Saturday: 'ہفتہ',
  Sunday: 'اتوار',
};

export const TimetableSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [structuredRows, setStructuredRows] = useState<StructuredTimetableRow[]>(() => {
    try {
      const raw = localStorage.getItem(STRUCTURED_TT_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return DEFAULT_STRUCTURED_ROWS;
  });
  const [grid, setGrid] = useState<TimetableGridRow[]>([]);
  const [activeTableMode, setActiveTableMode] = useState<'structured' | 'matrix'>('structured');
  const [viewMode, setViewMode] = useViewMode('timetable_module', 'list');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    setGrid(StorageService.getTimetableGrid());
  }, []);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSavePermanently = () => {
    localStorage.setItem(STRUCTURED_TT_KEY, JSON.stringify(structuredRows));
    StorageService.saveTimetableGrid(grid);
    showToast('Timetable saved permanently to GPS Chambai database!');
  };

  const handleStructuredRowChange = (
    index: number,
    field: keyof StructuredTimetableRow,
    val: string
  ) => {
    setStructuredRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
  };

  const handleAddStructuredRow = () => {
    setStructuredRows((prev) => [
      ...prev,
      {
        id: `tt-${Date.now()}`,
        day: 'Monday (پیر)',
        time: '08:00 AM - 08:40 AM',
        period: `Period ${prev.length + 1}`,
        teacherName: 'Muhammad Irfan (PST)',
        subject: 'English / Mathematics',
      },
    ]);
  };

  const handleDeleteStructuredRow = (id: string) => {
    setStructuredRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleCellChange = (
    dayIndex: number,
    periodKey: keyof Omit<TimetableGridRow, 'day'>,
    value: string
  ) => {
    setGrid((prev) => {
      const updated = [...prev];
      updated[dayIndex] = {
        ...updated[dayIndex],
        [periodKey]: value,
      };
      return updated;
    });
  };

  const buildPrintableHtml = () => {
    const structuredHtml = structuredRows
      .map(
        (r, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td style="font-weight:800;">${r.day}</td>
          <td style="font-weight:800;color:#0369a1;">${r.time}</td>
          <td>${r.period}</td>
          <td style="font-weight:800;">${r.teacherName}</td>
          <td><strong>${r.subject}</strong></td>
        </tr>
      `
      )
      .join('');

    return `
      <h3 style="font-size:15px;font-weight:900;color:#0f172a;margin-bottom:8px;">
        Official School Timetable (Day | Time | Teacher Name | Subject) — GPS Chambai Kohat (EMIS: 16454)
      </h3>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Day</th>
            <th>Time</th>
            <th>Period</th>
            <th>Teacher Name</th>
            <th>Subject</th>
          </tr>
        </thead>
        <tbody>${structuredHtml}</tbody>
      </table>
    `;
  };

  const handlePrintTimetable = () => {
    handleSavePermanently();
    printHtmlDocument(
      'Official School Timetable (Day | Time | Teacher Name | Subject)',
      buildPrintableHtml(),
      true
    );
  };

  const handleSavePdf = () => {
    handleSavePermanently();
    const res = exportAndSaveRealPdf('GPS_Chambai_Timetable', buildPrintableHtml(), {
      landscape: true,
      folderSubPath: 'Timetable/PDF Timetable',
      moduleSource: 'Timetable Module',
    });
    showToast(`Saved ${res.filename} to ${res.folderPath}`);
  };

  const handleExportWord = () => {
    handleSavePermanently();
    const res = exportAndSaveWordDoc('GPS_Chambai_Timetable', buildPrintableHtml(), {
      folderSubPath: 'Timetable/PDF Timetable',
      moduleSource: 'Timetable Module',
    });
    showToast(`Exported ${res.filename} to ${res.folderPath}`);
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-700 to-blue-800 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'سکول ٹائم ٹیبل' : 'Master School Time Table'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={handlePrintTimetable}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1"
          >
            <Printer size={14} />
            <span>Print Preview</span>
          </button>
          <button
            onClick={handleSavePdf}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleExportWord}
            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1"
          >
            <FileSpreadsheet size={14} />
            <span>Export Doc</span>
          </button>
          <button
            onClick={handleSavePermanently}
            className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md active:scale-95"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Switch between Requirement 10.E Table (Day | Time | Teacher Name | Subject) & Weekly 7-Period Matrix */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 bg-slate-200 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTableMode('structured')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTableMode === 'structured'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700'
            }`}
          >
            1. Day | Time | Teacher Name | Subject
          </button>
          <button
            onClick={() => setActiveTableMode('matrix')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all ${
              activeTableMode === 'matrix'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-700'
            }`}
          >
            2. Weekly 7-Period Matrix
          </button>
        </div>

        {activeTableMode === 'structured' && (
          <button
            type="button"
            onClick={handleAddStructuredRow}
            className="px-3.5 py-2 rounded-xl bg-sky-700 hover:bg-sky-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
          >
            <Plus size={14} />
            <span>Add Timetable Row</span>
          </button>
        )}
      </div>

      {/* PRIMARY VIEW: REQUIREMENT 10.E TABLE (Day | Time | Period | Teacher Name | Subject) */}
      {activeTableMode === 'structured' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[740px]">
              <thead>
                <tr className="bg-slate-900 text-white text-xs font-black uppercase tracking-wider">
                  <th className="py-3 px-3 text-left border-r border-slate-800 w-40">
                    1. Day (دن)
                  </th>
                  <th className="py-3 px-3 text-left border-r border-slate-800 w-44">
                    2. Time (وقت)
                  </th>
                  <th className="py-3 px-3 text-left border-r border-slate-800 w-28">
                    Period
                  </th>
                  <th className="py-3 px-3 text-left border-r border-slate-800 w-56">
                    3. Teacher Name (استاد کا نام)
                  </th>
                  <th className="py-3 px-3 text-left border-r border-slate-800">
                    4. Subject (مضمون)
                  </th>
                  <th className="py-3 px-2 text-center w-14">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {structuredRows.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-sky-50/40">
                    <td className="p-2 border-r border-slate-200 bg-slate-50/70">
                      <input
                        type="text"
                        value={row.day}
                        onChange={(e) => handleStructuredRowChange(idx, 'day', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-black text-slate-900 bg-white"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200 bg-sky-50/30">
                      <input
                        type="text"
                        value={row.time}
                        onChange={(e) => handleStructuredRowChange(idx, 'time', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-sky-300 font-black text-sky-900 bg-white"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.period}
                        onChange={(e) => handleStructuredRowChange(idx, 'period', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 font-bold text-slate-700 bg-white"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="text"
                        value={row.teacherName}
                        onChange={(e) =>
                          handleStructuredRowChange(idx, 'teacherName', e.target.value)
                        }
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-black text-emerald-900 bg-white"
                      />
                    </td>
                    <td className="p-2 border-r border-slate-200">
                      <input
                        type="text"
                        dir="auto"
                        value={row.subject}
                        onChange={(e) => handleStructuredRowChange(idx, 'subject', e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 font-bold text-slate-900 bg-white"
                      />
                    </td>
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleDeleteStructuredRow(row.id)}
                        className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                        title="Delete Row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECONDARY VIEW: WEEKLY 7-PERIOD MATRIX (WITHOUT REPEATED TIME IN CELLS) */}
      {activeTableMode === 'matrix' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[860px]">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-wider">
                  <th className="py-3 px-3 text-left border-r border-slate-700 w-28 sticky left-0 bg-slate-900 z-10">
                    Day / دن
                  </th>
                  {PERIOD_KEYS.map((pk, idx) => (
                    <th key={pk} className="py-3 px-2.5 text-left border-r border-slate-800">
                      <div>Period {idx + 1}</div>
                      <div className="text-[9px] text-emerald-300 font-semibold normal-case">
                        Teacher &amp; Subject
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {grid.map((row, rowIdx) => {
                  const isSunday = row.day === 'Sunday';
                  return (
                    <tr
                      key={row.day}
                      className={isSunday ? 'bg-rose-50/40' : 'hover:bg-slate-50/80'}
                    >
                      <td className="p-2.5 font-black text-slate-900 border-r border-slate-200 sticky left-0 bg-slate-100 z-10">
                        <div>{row.day}</div>
                        <div className="text-[11px] font-urdu text-slate-600">
                          {DAY_URDU_LABELS[row.day]}
                        </div>
                      </td>
                      {PERIOD_KEYS.map((pk) => (
                        <td key={pk} className="p-1.5 border-r border-slate-100 align-top">
                          <textarea
                            rows={2}
                            dir="auto"
                            value={row[pk]}
                            onChange={(e) => handleCellChange(rowIdx, pk, e.target.value)}
                            placeholder="Teacher Name - Subject"
                            className="w-full p-2 rounded-xl border border-slate-200 focus:border-sky-600 focus:outline-none text-[11px] font-bold text-slate-800 bg-white resize-none leading-snug"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
