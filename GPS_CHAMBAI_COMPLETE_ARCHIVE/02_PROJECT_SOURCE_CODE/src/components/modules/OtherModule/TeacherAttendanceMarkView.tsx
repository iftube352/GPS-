import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Search,
  CloudCheck,
  Check,
  X,
  Printer,
  Download,
  CheckCircle2,
  Clock,
  Sparkles,
  Filter,
} from 'lucide-react';
import { StaffMember, TeacherAttendanceRecord, TeacherAttendanceStatus } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  saveFileToGpsChambaiFolder,
  buildOfficialPrintHtml,
  executeIframePrint,
} from '../../../services/printAndFileService';

interface TeacherAttendanceMarkViewProps {
  date: string; // YYYY-MM-DD
  onBack: () => void;
  lang: 'en' | 'ur';
}

const STATUS_CONFIG: Record<
  TeacherAttendanceStatus,
  {
    label: string;
    labelUr: string;
    bg: string;
    text: string;
    border: string;
    dotColor: string;
  }
> = {
  Present: {
    label: 'Present',
    labelUr: 'حاضر',
    bg: 'bg-[#E8F8EE]',
    text: 'text-[#166534]',
    border: 'border-[#A7F3D0]',
    dotColor: '#166534',
  },
  Absent: {
    label: 'Absent',
    labelUr: 'غیر حاضر',
    bg: 'bg-[#FEE8E8]',
    text: 'text-[#991B1B]',
    border: 'border-[#FECACA]',
    dotColor: '#991B1B',
  },
  Leave: {
    label: 'Leave',
    labelUr: 'رخصت',
    bg: 'bg-[#FEF0E6]',
    text: 'text-[#9A3412]',
    border: 'border-[#FED7AA]',
    dotColor: '#9A3412',
  },
  'On-Duty': {
    label: 'On-Duty',
    labelUr: 'ڈیوٹی پر',
    bg: 'bg-[#E8F2FE]',
    text: 'text-[#1E40AF]',
    border: 'border-[#BFDBFE]',
    dotColor: '#1E40AF',
  },
  Late: {
    label: 'Late',
    labelUr: 'تاخیر',
    bg: 'bg-[#F3E8FF]',
    text: 'text-[#6B21A8]',
    border: 'border-[#E9D5FF]',
    dotColor: '#6B21A8',
  },
};

export const TeacherAttendanceMarkView: React.FC<TeacherAttendanceMarkViewProps> = ({
  date,
  onBack,
  lang,
}) => {
  const [record, setRecord] = useState<TeacherAttendanceRecord>(() =>
    StorageService.getTeacherAttendanceByDate(date)
  );
  const [statusMap, setStatusMap] = useState<Record<string, TeacherAttendanceStatus>>(
    record.statusMap || {}
  );
  const [notesMap, setNotesMap] = useState<Record<string, string>>(record.notes || {});
  const [activeFilter, setActiveFilter] = useState<TeacherAttendanceStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusPickerStaffId, setActiveStatusPickerStaffId] = useState<string | null>(null);
  const [remarksModalStaff, setRemarksModalStaff] = useState<StaffMember | null>(null);
  const [remarksText, setRemarksText] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const staffList: StaffMember[] = StorageService.getOfficialTeachers();

  useEffect(() => {
    const rec = StorageService.getTeacherAttendanceByDate(date);
    setRecord(rec);
    setStatusMap(rec.statusMap || {});
    setNotesMap(rec.notes || {});
  }, [date]);

  // Save changes to storage whenever statusMap or notesMap updates
  const saveCurrentRecord = (
    newStatusMap: Record<string, TeacherAttendanceStatus>,
    newNotesMap: Record<string, string>
  ) => {
    const updated: TeacherAttendanceRecord = {
      ...record,
      date,
      statusMap: newStatusMap,
      notes: newNotesMap,
      isSynced: true,
    };
    StorageService.saveTeacherAttendance(updated);
    setRecord(updated);
  };

  const handleUpdateStatus = (staffId: string, status: TeacherAttendanceStatus) => {
    const nextMap = { ...statusMap, [staffId]: status };
    setStatusMap(nextMap);
    saveCurrentRecord(nextMap, notesMap);
    setActiveStatusPickerStaffId(null);
  };

  const handleMarkAllPresent = () => {
    const nextMap: Record<string, TeacherAttendanceStatus> = {};
    staffList.forEach((s) => {
      nextMap[s.id] = 'Present';
    });
    setStatusMap(nextMap);
    saveCurrentRecord(nextMap, notesMap);
    setToastMessage('All staff members marked Present!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenRemarks = (staff: StaffMember) => {
    setRemarksModalStaff(staff);
    setRemarksText(notesMap[staff.id] || '');
  };

  const handleSaveRemarks = () => {
    if (!remarksModalStaff) return;
    const nextNotes = { ...notesMap, [remarksModalStaff.id]: remarksText.trim() };
    setNotesMap(nextNotes);
    saveCurrentRecord(statusMap, nextNotes);
    setRemarksModalStaff(null);
  };

  // Counts calculation
  const counts: Record<TeacherAttendanceStatus, number> = {
    Present: 0,
    Absent: 0,
    Leave: 0,
    'On-Duty': 0,
    Late: 0,
  };
  staffList.forEach((s) => {
    const st = statusMap[s.id] || 'Present';
    counts[st] = (counts[st] || 0) + 1;
  });

  // Filter staff list
  const filteredStaff = staffList.filter((s) => {
    const currentStatus = statusMap[s.id] || 'Present';
    if (activeFilter !== 'ALL' && currentStatus !== activeFilter) {
      return false;
    }
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.urduName && s.urduName.includes(q)) ||
      s.cnic.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)
    );
  });

  // Format header title (e.g. "Tue, 3 Nov")
  const dateObj = new Date(date);
  const shortDateString = isNaN(dateObj.getTime())
    ? date
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

  const fullDateString = isNaN(dateObj.getTime())
    ? date
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  // Print roll call
  const handlePrintTodayRollCall = () => {
    const rows = staffList
      .map((s, idx) => {
        const st = statusMap[s.id] || 'Present';
        const remarks = notesMap[s.id] || '';
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.name}</strong><br/><span style="font-size:11px;color:#64748b;">${s.urduName || ''}</span></td>
          <td><strong>${s.designation}</strong></td>
          <td><code>${s.cnic}</code></td>
          <td>${s.personalNo || '—'}</td>
          <td><strong style="color:${STATUS_CONFIG[st].dotColor};">${st}</strong></td>
          <td>${remarks || '—'}</td>
          <td style="width:120px;border-bottom:1px dotted #94a3b8;"></td>
        </tr>
      `;
      })
      .join('');

    const bodyHtml = `
      <div style="font-size:12px;margin-bottom:12px;display:flex;justify-content:space-between;border-bottom:1px solid #cbd5e1;padding-bottom:8px;">
        <div>
          <strong>School:</strong> Govt Primary School Chambai Kohat (EMIS: 16454)<br/>
          <strong>Date:</strong> ${fullDateString}
        </div>
        <div style="text-align:right;">
          <strong>Present:</strong> ${counts.Present} &nbsp;|&nbsp;
          <strong>Absent:</strong> ${counts.Absent} &nbsp;|&nbsp;
          <strong>Leave:</strong> ${counts.Leave} &nbsp;|&nbsp;
          <strong>On-Duty:</strong> ${counts['On-Duty']} &nbsp;|&nbsp;
          <strong>Late:</strong> ${counts.Late}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Teacher Name</th>
            <th>Designation</th>
            <th>CNIC</th>
            <th>Personal No</th>
            <th>Status</th>
            <th>Remarks / Duty Details</th>
            <th>Teacher Signature</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    const title = `Teacher Attendance Register - ${fullDateString}`;
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, 'portrait', true);
    executeIframePrint(fullHtml);
    printHtmlDocument(title, bodyHtml, 'portrait', true);
    setToastMessage('Print sheet sent to printer!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSavePdf = () => {
    const rows = staffList
      .map((s, idx) => {
        const st = statusMap[s.id] || 'Present';
        const remarks = notesMap[s.id] || '';
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.name}</strong><br/><span style="font-size:11px;color:#64748b;">${s.urduName || ''}</span></td>
          <td><strong>${s.designation}</strong></td>
          <td><code>${s.cnic}</code></td>
          <td>${s.personalNo || '—'}</td>
          <td><strong style="color:${STATUS_CONFIG[st].dotColor};">${st}</strong></td>
          <td>${remarks || '—'}</td>
          <td style="width:120px;border-bottom:1px dotted #94a3b8;"></td>
        </tr>
      `;
      })
      .join('');

    const bodyHtml = `
      <div style="font-size:12px;margin-bottom:12px;display:flex;justify-content:space-between;border-bottom:1px solid #cbd5e1;padding-bottom:8px;">
        <div>
          <strong>School:</strong> Govt Primary School Chambai Kohat (EMIS: 16454)<br/>
          <strong>Date:</strong> ${fullDateString}
        </div>
        <div style="text-align:right;">
          <strong>Present:</strong> ${counts.Present} &nbsp;|&nbsp;
          <strong>Absent:</strong> ${counts.Absent} &nbsp;|&nbsp;
          <strong>Leave:</strong> ${counts.Leave} &nbsp;|&nbsp;
          <strong>On-Duty:</strong> ${counts['On-Duty']} &nbsp;|&nbsp;
          <strong>Late:</strong> ${counts.Late}
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Teacher Name</th>
            <th>Designation</th>
            <th>CNIC</th>
            <th>Personal No</th>
            <th>Status</th>
            <th>Remarks / Duty Details</th>
            <th>Teacher Signature</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;

    const title = `Teacher_Attendance_${date}`;
    const fullHtml = buildOfficialPrintHtml(`Teacher Attendance Register (${fullDateString})`, bodyHtml, 'portrait', true);
    const res = saveFileToGpsChambaiFolder(`${title}.html`, fullHtml, 'text/html;charset=utf-8');
    executeIframePrint(fullHtml);
    setToastMessage(`Saved to ${res.fileName} and opened print dialog!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-full bg-[#f4f7f5] text-slate-900 p-4 space-y-4 animate-fade-in pb-16">
      {/* Top Header Bar (Image 010) */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-xs border border-slate-200 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={19} className="text-slate-800" />
          </button>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {shortDateString}
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleMarkAllPresent}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-xs font-black flex items-center gap-1 shadow-xs"
            title="Mark All Present"
          >
            <Check size={14} />
            <span className="hidden sm:inline">All Present</span>
          </button>
          <button
            onClick={handlePrintTodayRollCall}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs"
            title="Print Attendance Sheet"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={handleSavePdf}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs"
            title="Download PDF/HTML"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Status Summary & Filter Card (Image 010) */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs space-y-3.5">
        {/* Date & Synced Cloud Row */}
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900">
            {fullDateString}
          </h2>
          <div className="flex items-center gap-1 bg-[#E8F8EE] text-[#166534] px-2.5 py-1 rounded-full text-xs font-black shadow-2xs">
            <Check size={13} className="stroke-[3]" />
            <span>Synced</span>
          </div>
        </div>

        {/* 5 Status Filter Pills (Image 010) */}
        <div className="grid grid-cols-5 gap-1.5">
          {(['Present', 'Absent', 'Leave', 'On-Duty', 'Late'] as TeacherAttendanceStatus[]).map(
            (statusKey) => {
              const cfg = STATUS_CONFIG[statusKey];
              const count = counts[statusKey] || 0;
              const isSelected = activeFilter === statusKey;
              return (
                <button
                  key={statusKey}
                  onClick={() =>
                    setActiveFilter((prev) => (prev === statusKey ? 'ALL' : statusKey))
                  }
                  className={`${cfg.bg} ${cfg.text} ${cfg.border} border rounded-2xl py-2 px-1 text-center transition-all ${
                    isSelected
                      ? 'ring-2 ring-slate-900 shadow-xs scale-[1.03]'
                      : 'hover:brightness-95'
                  }`}
                >
                  <div className="text-base font-black leading-tight">{count}</div>
                  <div className="text-[10px] font-bold truncate mt-0.5">{cfg.label}</div>
                </button>
              );
            }
          )}
        </div>

        {/* Hint text & Active filter reset */}
        <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 pt-0.5">
          <span>Tap a total to filter the list.</span>
          {activeFilter !== 'ALL' && (
            <button
              onClick={() => setActiveFilter('ALL')}
              className="text-emerald-700 underline hover:text-emerald-900 font-black"
            >
              Show all ({staffList.length})
            </button>
          )}
        </div>
      </div>

      {/* Search Bar (Image 010) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search size={17} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'ur'
              ? 'نام، شناختی کارڈ یا عہدہ سے تلاش کریں'
              : 'Search name, CNIC or designation'
          }
          className="w-full pl-10 pr-4 py-3 bg-[#e8ece9] hover:bg-[#dfe4e0] focus:bg-white text-xs font-bold text-slate-900 rounded-3xl outline-none border border-transparent focus:border-emerald-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Count Indicator */}
      <div className="px-1 text-xs font-bold text-slate-600">
        <span>{filteredStaff.length} staff</span>
      </div>

      {/* Staff Attendance Cards List (Image 010) */}
      <div className="space-y-2.5">
        {filteredStaff.map((staff) => {
          const currentStatus = statusMap[staff.id] || 'Present';
          const cfg = STATUS_CONFIG[currentStatus];
          const hasRemarks = Boolean(notesMap[staff.id]);

          return (
            <div
              key={staff.id}
              className="relative bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
            >
              {/* Left Info: Avatar + Details */}
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={staff.photoUrl}
                  alt={staff.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20 shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200';
                  }}
                />
                <div className="min-w-0">
                  <h4 className="text-sm font-black text-slate-900 truncate">
                    {staff.name}
                  </h4>
                  <p className="text-[11px] font-bold text-slate-600 uppercase tracking-tight truncate">
                    {staff.designation}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 truncate">
                    {staff.cnic}
                  </p>
                  {hasRemarks && (
                    <div className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md mt-1 truncate inline-block">
                      Note: {notesMap[staff.id]}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Status Pill (Image 010) */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() =>
                    setActiveStatusPickerStaffId((prev) =>
                      prev === staff.id ? null : staff.id
                    )
                  }
                  className={`${cfg.bg} ${cfg.text} ${cfg.border} border px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs hover:brightness-95 transition-all flex items-center gap-1`}
                >
                  <span>{cfg.label}</span>
                </button>

                {/* Edit remarks button */}
                <button
                  onClick={() => handleOpenRemarks(staff)}
                  className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  title="Add remarks / duty details"
                >
                  <Clock size={15} />
                </button>
              </div>

              {/* Status Picker Popover */}
              {activeStatusPickerStaffId === staff.id && (
                <div className="absolute right-3.5 top-14 z-20 bg-white border border-slate-300 rounded-2xl shadow-xl p-2 flex flex-col gap-1 min-w-[140px] animate-fade-in">
                  {(['Present', 'Absent', 'Leave', 'On-Duty', 'Late'] as TeacherAttendanceStatus[]).map(
                    (st) => {
                      const c = STATUS_CONFIG[st];
                      return (
                        <button
                          key={st}
                          onClick={() => handleUpdateStatus(staff.id, st)}
                          className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between ${
                            currentStatus === st
                              ? `${c.bg} ${c.text}`
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <span>{c.label}</span>
                          {currentStatus === st && <Check size={13} />}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Remarks Modal */}
      {remarksModalStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-slate-900">
                Duty / Leave Remarks: {remarksModalStaff.name}
              </h3>
              <button
                onClick={() => setRemarksModalStaff(null)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Enter Reason, Meeting Details, or Time In:
              </label>
              <textarea
                value={remarksText}
                onChange={(e) => setRemarksText(e.target.value)}
                placeholder="e.g. Official Meeting at DEO Office, Medical Leave, etc."
                className="w-full h-24 p-3 rounded-2xl border border-slate-300 text-xs font-medium outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setRemarksModalStaff(null)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveRemarks}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-xs hover:bg-emerald-700"
              >
                Save Remarks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
