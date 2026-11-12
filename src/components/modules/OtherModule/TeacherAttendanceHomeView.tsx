import React, { useState } from 'react';
import {
  Menu,
  ChevronRight,
  Users,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Printer,
  Download,
  Eye,
  Calendar,
  Building2,
  X,
  GraduationCap,
} from 'lucide-react';
import { TeacherAttendanceRecord, TeacherAttendanceStatus } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  saveFileToGpsChambaiFolder,
  buildOfficialPrintHtml,
  executeIframePrint,
} from '../../../services/printAndFileService';

interface TeacherAttendanceHomeViewProps {
  onOpenDrawer: () => void;
  onNavigateToStaff: () => void;
  onNavigateToMark: (date: string) => void;
  onOpenReports: () => void;
  onSwitchToStudentAttendance: () => void;
  lang: 'en' | 'ur';
}

export const TeacherAttendanceHomeView: React.FC<TeacherAttendanceHomeViewProps> = ({
  onOpenDrawer,
  onNavigateToStaff,
  onNavigateToMark,
  onOpenReports,
  onSwitchToStudentAttendance,
  lang,
}) => {
  const [showSchoolProfile, setShowSchoolProfile] = useState(false);
  const [syncToast, setSyncToast] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const staffList = StorageService.getOfficialTeachers();
  const allRecords = StorageService.getTeacherAttendance();

  // Get Today's record (Nov 3, 2026 or latest record)
  const todayDateStr = allRecords[0]?.date || '2026-11-03';
  const todayRecord = StorageService.getTeacherAttendanceByDate(todayDateStr);

  const totalStaffCount = staffList.length;

  let presentCount = 0;
  staffList.forEach((s) => {
    if ((todayRecord.statusMap?.[s.id] || 'Present') === 'Present') {
      presentCount++;
    }
  });

  const presentPercent = Math.round((presentCount / Math.max(1, totalStaffCount)) * 100);

  // Format header date (Image 008: "Tuesday, 3 November 2026")
  const dateObj = new Date(todayDateStr);
  const headerDateString = isNaN(dateObj.getTime())
    ? 'Tuesday, 3 November 2026'
    : dateObj.toLocaleDateString('en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const buildTodayHtml = () => {
    const rows = staffList
      .map((s, idx) => {
        const st = todayRecord.statusMap?.[s.id] || 'Present';
        const remarks = todayRecord.notes?.[s.id] || '';
        const color =
          st === 'Present'
            ? '#166534'
            : st === 'Absent'
            ? '#991B1B'
            : st === 'Leave'
            ? '#9A3412'
            : st === 'On-Duty'
            ? '#1E40AF'
            : '#6B21A8';
        return `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${s.name}</strong><br/><span style="font-size:10px;color:#64748b;">${s.urduName || ''}</span></td>
          <td><strong>${s.designation}</strong></td>
          <td><code>${s.cnic}</code></td>
          <td>${s.personalNo || '—'}</td>
          <td><strong style="color:${color};background:#f8fafc;padding:3px 8px;border-radius:6px;border:1px solid #cbd5e1;">${st}</strong></td>
          <td>${remarks || '—'}</td>
          <td style="width:110px;border-bottom:1px dotted #94a3b8;"></td>
        </tr>
      `;
      })
      .join('');

    return `
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;">GPS CHAMBAI KOHAT (EMIS: 16454)</span>
          <h2 style="font-size:16px;margin:2px 0 0 0;font-weight:800;color:#0f172a;">${headerDateString}</h2>
        </div>
        <div style="text-align:right;font-size:12px;">
          <span style="color:#166534;font-weight:700;">🟢 Present: ${presentCount}/${totalStaffCount} (${presentPercent}%)</span>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:36px;text-align:center;">#</th>
            <th>Teacher Name</th>
            <th>Designation &amp; BPS</th>
            <th>CNIC</th>
            <th>Personal No</th>
            <th>Status</th>
            <th>Remarks / Special Duty</th>
            <th>Sign</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div style="margin-top:35px;display:flex;justify-content:space-between;font-size:12px;font-weight:700;">
        <div style="border-top:1.5px solid #334155;padding-top:6px;width:180px;text-align:center;">
          Attendance Incharge
        </div>
        <div style="border-top:1.5px solid #334155;padding-top:6px;width:220px;text-align:center;">
          Head Teacher Stamp &amp; Signature<br/>
          <span style="font-size:10px;font-weight:400;color:#64748b;">GPS Chambai Kohat</span>
        </div>
      </div>
    `;
  };

  const handlePrintToday = () => {
    const bodyHtml = buildTodayHtml();
    const title = `Teacher Attendance - ${headerDateString}`;
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, 'portrait', true);
    executeIframePrint(fullHtml);
    printHtmlDocument(title, bodyHtml, 'portrait', true);
    setNoticeMessage('Print triggered for today attendance sheet!');
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  const handleSaveTodayPdf = () => {
    const bodyHtml = buildTodayHtml();
    const title = `Teacher_Attendance_${todayDateStr}`;
    const fullHtml = buildOfficialPrintHtml(`Teacher Attendance (${headerDateString})`, bodyHtml, 'portrait', true);
    const res = saveFileToGpsChambaiFolder(`${title}.html`, fullHtml, 'text/html;charset=utf-8');
    executeIframePrint(fullHtml);
    setNoticeMessage(`Saved to ${res.fileName} and opened print dialog!`);
    setTimeout(() => setNoticeMessage(null), 3500);
  };

  const handleSyncNow = () => {
    setSyncToast(true);
    setTimeout(() => setSyncToast(false), 3000);
  };

  return (
    <div className="min-h-full bg-[#f4f7f5] text-slate-900 p-4 space-y-4 animate-fade-in pb-16">
      {/* Top Bar (Image 008) */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          onClick={onOpenDrawer}
          className="w-10 h-10 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-xs border border-slate-200 transition-all text-slate-800"
          aria-label="Open menu"
        >
          <Menu size={22} />
        </button>

        {/* Action Buttons: Print, PDF, Reports, Student Mode */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handlePrintToday}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-xs"
            title="Print Today Attendance Sheet"
          >
            <Printer size={15} className="text-emerald-700" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={handleSaveTodayPdf}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-xs"
            title="Save PDF / Document"
          >
            <Download size={15} className="text-blue-600" />
            <span className="hidden sm:inline">Save PDF</span>
          </button>

          <button
            onClick={onOpenReports}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-black text-slate-700 hover:bg-slate-100 shadow-xs"
            title="Reports, Print & PDF"
          >
            <Eye size={14} className="text-purple-600" />
            <span className="hidden sm:inline">Reports</span>
          </button>

          <button
            onClick={onSwitchToStudentAttendance}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-100 border border-emerald-200 text-xs font-black text-emerald-900 hover:bg-emerald-200 shadow-xs"
            title="Switch to Student Daily Attendance"
          >
            <GraduationCap size={15} />
            <span>Students</span>
          </button>
        </div>
      </div>

      {noticeMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{noticeMessage}</span>
        </div>
      )}

      {/* Title & Date Subtitle (Image 008) */}
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
          Home
        </h1>
        <p className="text-xs font-bold text-slate-600 mt-0.5">
          {headerDateString}
        </p>
      </div>

      {syncToast && (
        <div className="bg-emerald-500 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>Staff and attendance records synchronized successfully!</span>
        </div>
      )}

      {/* Green School Badge Card (Image 008) */}
      <div
        onClick={() => setShowSchoolProfile(true)}
        className="bg-[#065f46] hover:bg-[#07563f] text-white p-4 rounded-3xl shadow-md flex items-center justify-between cursor-pointer transition-all"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-13 h-13 bg-white rounded-2xl p-1.5 flex items-center justify-center shadow-xs shrink-0">
            <img
              src="/assets/aistudio/20260903_200547_79893d25.png"
              alt="School Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-200 block">
              EMIS 16454
            </span>
            <h2 className="text-lg font-black tracking-wide leading-tight mt-0.5">
              GPS CHAMBAI
            </h2>
            <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-100 mt-0.5">
              <span>📍 KOHAT</span>
            </div>
          </div>
        </div>
        <ChevronRight size={20} className="text-emerald-200 shrink-0" />
      </div>

      {/* Today Section (Image 008) */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-black text-slate-700 tracking-wide">
          Today
        </h3>

        {/* 2 Stats Cards */}
        <div className="grid grid-cols-2 gap-3">
          {/* Total Staff Card (Image 008 Left) */}
          <div
            onClick={onNavigateToStaff}
            className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Users size={18} />
              </div>
              <ArrowRight size={17} className="text-slate-600" />
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 leading-none">
                {totalStaffCount}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Total staff
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                Tap to view
              </div>
            </div>
          </div>

          {/* Present Today Card (Image 008 Right) */}
          <div
            onClick={() => onNavigateToMark(todayDateStr)}
            className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <UserCheck size={18} />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-3xl font-black text-slate-900 leading-none">
                {presentCount}
              </div>
              <div className="text-xs font-bold text-slate-800 mt-1">
                Present today
              </div>
              <div className="text-[11px] font-bold text-slate-400 mt-0.5">
                {presentPercent}% of staff
              </div>

              {/* Progress Bar (Image 008) */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-2">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                  style={{ width: `${presentPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Today's Attendance Marked Card (Image 008) */}
        <div
          onClick={() => onNavigateToMark(todayDateStr)}
          className="bg-white rounded-3xl p-4 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 size={22} className="text-emerald-700" />
            </div>
            <div>
              <h4 className="text-sm font-black text-slate-900 leading-tight">
                Today's attendance is marked
              </h4>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">
                Tap to review today's record
              </p>
            </div>
          </div>
          <ChevronRight size={19} className="text-slate-400 shrink-0" />
        </div>
      </div>

      {/* Recent Attendance Section (Image 008) */}
      <div className="space-y-2.5 pt-1">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-black text-slate-700 tracking-wide">
            Recent attendance
          </h3>
          <span className="text-xs font-bold text-slate-500">
            {allRecords.length} days
          </span>
        </div>

        {/* History Cards */}
        <div className="space-y-2.5">
          {allRecords.map((rec) => {
            const d = new Date(rec.date);
            const dayOfWeek = isNaN(d.getTime())
              ? rec.dayName || 'Day'
              : d.toLocaleDateString('en-US', { weekday: 'long' });
            const monthShort = isNaN(d.getTime())
              ? 'NOV'
              : d.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
            const dayNumber = isNaN(d.getTime()) ? '1' : String(d.getDate());

            // Calculate status breakdown for this date
            let p = 0;
            let a = 0;
            let l = 0;
            let od = 0;
            let lt = 0;

            staffList.forEach((s) => {
              const st = rec.statusMap?.[s.id] || 'Present';
              if (st === 'Present') p++;
              else if (st === 'Absent') a++;
              else if (st === 'Leave') l++;
              else if (st === 'On-Duty') od++;
              else if (st === 'Late') lt++;
            });

            const pWidth = (p / 7) * 100;
            const odWidth = (od / 7) * 100;
            const aWidth = (a / 7) * 100;
            const lWidth = (l / 7) * 100;
            const ltWidth = (lt / 7) * 100;

            return (
              <div
                key={rec.id || rec.date}
                onClick={() => onNavigateToMark(rec.date)}
                className="bg-white rounded-3xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 cursor-pointer hover:border-emerald-300 hover:shadow-sm transition-all"
              >
                {/* Date Pill (Image 008 Left) */}
                <div className="bg-[#D1FAE5] text-emerald-900 rounded-2xl px-2.5 py-1.5 text-center min-w-[50px] shrink-0">
                  <div className="text-[10px] font-black tracking-wider uppercase leading-none">
                    {monthShort}
                  </div>
                  <div className="text-xl font-black leading-none mt-1">
                    {dayNumber}
                  </div>
                </div>

                {/* Center Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-black text-slate-900 truncate">
                      {dayOfWeek}
                    </h4>
                    <span className="text-xs font-bold text-slate-500">
                      {p} of {totalStaffCount} present
                    </span>
                  </div>

                  {/* Segmented Progress Bar (Image 008) */}
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex my-1.5">
                    {pWidth > 0 && (
                      <div
                        className="h-full bg-emerald-600"
                        style={{ width: `${pWidth}%` }}
                      />
                    )}
                    {odWidth > 0 && (
                      <div
                        className="h-full bg-blue-600"
                        style={{ width: `${odWidth}%` }}
                      />
                    )}
                    {aWidth > 0 && (
                      <div
                        className="h-full bg-rose-600"
                        style={{ width: `${aWidth}%` }}
                      />
                    )}
                    {lWidth > 0 && (
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${lWidth}%` }}
                      />
                    )}
                    {ltWidth > 0 && (
                      <div
                        className="h-full bg-purple-600"
                        style={{ width: `${ltWidth}%` }}
                      />
                    )}
                  </div>

                  {/* Status Legend Dots (Image 008) */}
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[10px] font-bold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
                      {p} Present
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-600 inline-block" />
                      {a} Absent
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                      {l} Leave
                    </span>
                    {od > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                        {od} On-Duty
                      </span>
                    )}
                    {lt > 0 && (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                        {lt} Late
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Chevron */}
                <ChevronRight size={18} className="text-slate-400 shrink-0" />
              </div>
            );
          })}
        </div>
      </div>

      {/* School Profile Modal */}
      {showSchoolProfile && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  School Profile
                </span>
              </div>
              <button
                onClick={() => setShowSchoolProfile(false)}
                className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X size={15} />
              </button>
            </div>

            <div className="text-center space-y-1">
              <img
                src="/assets/aistudio/20260903_200547_79893d25.png"
                alt="Logo"
                className="w-16 h-16 object-contain mx-auto"
              />
              <h3 className="text-base font-black text-slate-900">
                Govt. Primary School Chambai Kohat
              </h3>
              <p className="text-xs font-bold text-emerald-700">
                EMIS Code: 16454
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">District:</span>
                <span className="font-bold text-slate-800">Kohat</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Sub-Division / Circle:</span>
                <span className="font-bold text-slate-800">Kohat Circle</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Total Sanctioned Staff:</span>
                <span className="font-bold text-slate-800">7 Members</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Head Teacher:</span>
                <span className="font-bold text-slate-800">Zar Khan Afridi (PSHT)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-bold">Department:</span>
                <span className="font-bold text-slate-800">E&amp;SE Khyber Pakhtunkhwa</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={() => setShowSchoolProfile(false)}
                className="w-full py-2.5 rounded-2xl bg-emerald-700 text-white text-xs font-black shadow-xs hover:bg-emerald-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
