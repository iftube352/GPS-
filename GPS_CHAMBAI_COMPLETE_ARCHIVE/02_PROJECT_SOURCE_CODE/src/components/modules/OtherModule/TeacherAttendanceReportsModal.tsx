import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Calendar,
  Eye,
  FileSpreadsheet,
  CheckCircle2,
} from 'lucide-react';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  saveFileToGpsChambaiFolder,
  buildOfficialPrintHtml,
  executeIframePrint,
} from '../../../services/printAndFileService';
import { TeacherAttendanceRecord } from '../../../types';

interface TeacherAttendanceReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const TeacherAttendanceReportsModal: React.FC<TeacherAttendanceReportsModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [reportType, setReportType] = useState<'daily' | 'monthly'>('daily');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-11');
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const staffList = StorageService.getOfficialTeachers();
  const allRecords = StorageService.getTeacherAttendance();

  // Generate Daily HTML Document
  const buildDailyReportHtml = (dateStr: string) => {
    const rec = StorageService.getTeacherAttendanceByDate(dateStr);
    const dateObj = new Date(dateStr);
    const formattedDate = isNaN(dateObj.getTime())
      ? dateStr
      : dateObj.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let dutyCount = 0;
    let lateCount = 0;

    const rows = staffList
      .map((s, idx) => {
        const st = rec.statusMap?.[s.id] || 'Present';
        if (st === 'Present') presentCount++;
        else if (st === 'Absent') absentCount++;
        else if (st === 'Leave') leaveCount++;
        else if (st === 'On-Duty') dutyCount++;
        else if (st === 'Late') lateCount++;

        const note = rec.notes?.[s.id] || '';
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
          <td>${note || '—'}</td>
          <td style="width:110px;border-bottom:1px dotted #94a3b8;"></td>
        </tr>
      `;
      })
      .join('');

    const bodyHtml = `
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:10px 14px;margin-bottom:14px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;">OFFICIAL DAILY TEACHER REGISTER</span>
          <h2 style="font-size:16px;margin:2px 0 0 0;font-weight:800;color:#0f172a;">${formattedDate}</h2>
        </div>
        <div style="text-align:right;font-size:12px;">
          <span style="color:#166534;font-weight:700;">🟢 Present: ${presentCount}</span> &nbsp;|&nbsp;
          <span style="color:#991B1B;font-weight:700;">🔴 Absent: ${absentCount}</span> &nbsp;|&nbsp;
          <span style="color:#9A3412;font-weight:700;">🟠 Leave: ${leaveCount}</span> &nbsp;|&nbsp;
          <span style="color:#1E40AF;font-weight:700;">🔵 On-Duty: ${dutyCount}</span> &nbsp;|&nbsp;
          <span style="color:#6B21A8;font-weight:700;">🟣 Late: ${lateCount}</span>
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
          Attendance Incharge / SPST
        </div>
        <div style="border-top:1.5px solid #334155;padding-top:6px;width:220px;text-align:center;">
          Head Teacher Stamp &amp; Signature<br/>
          <span style="font-size:10px;font-weight:400;color:#64748b;">GPS Chambai Kohat • EMIS 16454</span>
        </div>
      </div>
    `;

    return {
      title: `Daily Teacher Attendance - ${formattedDate}`,
      bodyHtml,
    };
  };

  // Generate Monthly Attendance Matrix HTML
  const buildMonthlyReportHtml = (yearMonth: string) => {
    const [yearStr, monthStr] = yearMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10); // 1-indexed
    const daysInMonth = new Date(year, month, 0).getDate();

    const monthName = new Date(year, month - 1, 1).toLocaleString('en-US', {
      month: 'long',
      year: 'numeric',
    });

    const headerDays = Array.from({ length: daysInMonth }, (_, i) => i + 1)
      .map((d) => `<th style="padding:4px 2px;font-size:10px;text-align:center;min-width:20px;">${d}</th>`)
      .join('');

    const rows = staffList
      .map((s, idx) => {
        let pCount = 0;
        let aCount = 0;
        let lCount = 0;
        let odCount = 0;
        let ltCount = 0;

        const dayCells = Array.from({ length: daysInMonth }, (_, i) => {
          const dayNum = i + 1;
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const rec = allRecords.find((r) => r.date === dateStr);
          const dayOfWeek = new Date(year, month - 1, dayNum).getDay();
          const isSunday = dayOfWeek === 0;

          if (isSunday) {
            return `<td style="background:#fee2e2;color:#991b1b;font-size:9px;text-align:center;font-weight:bold;padding:4px 1px;">S</td>`;
          }

          if (!rec) {
            return `<td style="background:#f1f5f9;color:#94a3b8;font-size:9px;text-align:center;padding:4px 1px;">—</td>`;
          }

          const st = rec.statusMap?.[s.id] || 'Present';
          if (st === 'Present') pCount++;
          else if (st === 'Absent') aCount++;
          else if (st === 'Leave') lCount++;
          else if (st === 'On-Duty') odCount++;
          else if (st === 'Late') ltCount++;

          const letter =
            st === 'Present'
              ? 'P'
              : st === 'Absent'
              ? 'A'
              : st === 'Leave'
              ? 'L'
              : st === 'On-Duty'
              ? 'OD'
              : 'Lt';
          const bg =
            st === 'Present'
              ? '#dcfce7'
              : st === 'Absent'
              ? '#fee2e2'
              : st === 'Leave'
              ? '#ffedd5'
              : st === 'On-Duty'
              ? '#dbeafe'
              : '#f3e8ff';
          const color =
            st === 'Present'
              ? '#166534'
              : st === 'Absent'
              ? '#991b1b'
              : st === 'Leave'
              ? '#9a3412'
              : st === 'On-Duty'
              ? '#1e40af'
              : '#6b21a8';

          return `<td style="background:${bg};color:${color};font-size:9px;font-weight:bold;text-align:center;padding:4px 1px;">${letter}</td>`;
        }).join('');

        const totalWorkingDays = daysInMonth - Math.floor(daysInMonth / 7);
        const percent = Math.round(((pCount + odCount) / Math.max(1, totalWorkingDays)) * 100);

        return `
        <tr>
          <td style="text-align:center;font-size:10px;">${idx + 1}</td>
          <td style="white-space:nowrap;font-size:11px;"><strong>${s.name}</strong><br/><span style="font-size:9px;color:#64748b;">${s.designation}</span></td>
          ${dayCells}
          <td style="text-align:center;font-weight:bold;background:#ecfdf5;color:#065f46;font-size:10px;">${pCount}</td>
          <td style="text-align:center;font-weight:bold;background:#fef2f2;color:#991b1b;font-size:10px;">${aCount}</td>
          <td style="text-align:center;font-weight:bold;background:#fff7ed;color:#9a3412;font-size:10px;">${lCount}</td>
          <td style="text-align:center;font-weight:bold;background:#eff6ff;color:#1e40af;font-size:10px;">${odCount}</td>
          <td style="text-align:center;font-weight:bold;font-size:10px;">${percent}%</td>
        </tr>
      `;
      })
      .join('');

    const bodyHtml = `
      <div style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <span style="font-size:11px;font-weight:700;color:#065f46;text-transform:uppercase;">MONTHLY TEACHER ATTENDANCE REGISTER</span>
          <h2 style="font-size:16px;margin:2px 0 0 0;font-weight:800;color:#0f172a;">Month: ${monthName}</h2>
        </div>
        <div style="font-size:11px;color:#475569;">
          <strong>Legend:</strong> 
          <span style="color:#166534;font-weight:bold;">P = Present</span> | 
          <span style="color:#991b1b;font-weight:bold;">A = Absent</span> | 
          <span style="color:#9a3412;font-weight:bold;">L = Leave</span> | 
          <span style="color:#1e40af;font-weight:bold;">OD = On-Duty</span> | 
          <span style="color:#991b1b;font-weight:bold;">S = Sunday</span>
        </div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:10px;">
        <thead>
          <tr>
            <th style="width:24px;text-align:center;">#</th>
            <th style="text-align:left;min-width:130px;">Teacher Name</th>
            ${headerDays}
            <th style="text-align:center;background:#ecfdf5;color:#065f46;min-width:24px;">P</th>
            <th style="text-align:center;background:#fef2f2;color:#991b1b;min-width:24px;">A</th>
            <th style="text-align:center;background:#fff7ed;color:#9a3412;min-width:24px;">L</th>
            <th style="text-align:center;background:#eff6ff;color:#1e40af;min-width:24px;">OD</th>
            <th style="text-align:center;min-width:32px;">%</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div style="margin-top:35px;display:flex;justify-content:space-between;font-size:12px;font-weight:700;">
        <div style="border-top:1.5px solid #334155;padding-top:6px;width:200px;text-align:center;">
          Attendance Incharge Signature
        </div>
        <div style="border-top:1.5px solid #334155;padding-top:6px;width:250px;text-align:center;">
          Head Teacher Stamp &amp; Signature<br/>
          <span style="font-size:10px;font-weight:400;color:#64748b;">Govt. Primary School Chambai Kohat</span>
        </div>
      </div>
    `;

    return {
      title: `Monthly Teacher Attendance Register - ${monthName}`,
      bodyHtml,
    };
  };

  const handleDirectPrint = () => {
    const isDaily = reportType === 'daily';
    const { title, bodyHtml } = isDaily
      ? buildDailyReportHtml(selectedDate)
      : buildMonthlyReportHtml(selectedMonth);
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, isDaily ? 'portrait' : 'landscape', true);
    
    // 1. Native print execution
    executeIframePrint(fullHtml);

    // 2. Also dispatch preview in case user prefers viewing
    printHtmlDocument(title, bodyHtml, isDaily ? 'portrait' : 'landscape', true);
    setStatusNotice('Print dialog triggered!');
    setTimeout(() => setStatusNotice(null), 3000);
  };

  const handleDirectSavePdf = () => {
    const isDaily = reportType === 'daily';
    const { title, bodyHtml } = isDaily
      ? buildDailyReportHtml(selectedDate)
      : buildMonthlyReportHtml(selectedMonth);
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, isDaily ? 'portrait' : 'landscape', true);

    const safeName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${isDaily ? selectedDate : selectedMonth}.html`;
    const res = saveFileToGpsChambaiFolder(safeName, fullHtml, 'text/html;charset=utf-8');

    // Also trigger iframe print so browser offers "Save as PDF" option
    executeIframePrint(fullHtml);

    setStatusNotice(`Saved to ${res.fileName} and opened PDF print!`);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  const handleOpenPrintPreview = () => {
    const isDaily = reportType === 'daily';
    const { title, bodyHtml } = isDaily
      ? buildDailyReportHtml(selectedDate)
      : buildMonthlyReportHtml(selectedMonth);
    printHtmlDocument(title, bodyHtml, isDaily ? 'portrait' : 'landscape', true);
    onClose(); // Close this modal so user sees full preview modal
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {lang === 'ur' ? 'حاضری رپورٹس اور رجسٹر' : 'Attendance Reports & Register'}
              </h3>
              <p className="text-[11px] font-bold text-slate-500">
                Print, Print Preview &amp; PDF Save (KP E&amp;SE Format)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
          >
            <X size={16} />
          </button>
        </div>

        {statusNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{statusNotice}</span>
          </div>
        )}

        {/* Report Type Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setReportType('daily')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
              reportType === 'daily'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Daily Roll Call Sheet
          </button>
          <button
            onClick={() => setReportType('monthly')}
            className={`py-2 px-3 rounded-xl text-xs font-black transition-all ${
              reportType === 'monthly'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Monthly Register (Matrix)
          </button>
        </div>

        {/* Date Selection */}
        {reportType === 'daily' ? (
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              Select Attendance Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
            />
          </div>
        ) : (
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              Select Month &amp; Year
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 text-xs font-bold text-slate-900 outline-none focus:border-emerald-600"
            />
          </div>
        )}

        {/* Features Info Box */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3 text-xs space-y-1.5 text-emerald-950">
          <div className="font-bold flex items-center gap-1.5 text-emerald-900">
            <CheckCircle2 size={14} className="text-emerald-700" />
            <span>Govt. Primary School Chambai Kohat (EMIS: 16454)</span>
          </div>
          <p className="text-[11px] text-emerald-800 leading-relaxed">
            Generates standardized KP Elementary &amp; Secondary Education Department register with staff BPS, CNIC numbers, verified attendance totals, and Headmaster signature block.
          </p>
        </div>

        {/* Action Buttons: Print, Print Preview, Save PDF */}
        <div className="pt-2 flex flex-wrap items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>

          <button
            onClick={handleOpenPrintPreview}
            className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black flex items-center gap-1.5 hover:bg-slate-800 shadow-xs"
            title="Open in-app preview"
          >
            <Eye size={15} />
            <span>Print Preview</span>
          </button>

          <button
            onClick={handleDirectSavePdf}
            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
            title="Download PDF or HTML File"
          >
            <Download size={15} />
            <span>Save PDF / HTML</span>
          </button>

          <button
            onClick={handleDirectPrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 hover:bg-emerald-700 shadow-md"
            title="Trigger Print"
          >
            <Printer size={15} />
            <span>Print Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
