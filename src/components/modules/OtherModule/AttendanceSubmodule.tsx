import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Save,
  Printer,
  CheckCircle2,
  Users,
  GraduationCap,
  FileText,
  Download,
  Eye,
  QrCode,
  Calendar,
  MessageCircle,
  LogIn,
  LogOut,
} from 'lucide-react';
import { Student, AttendanceRecord } from '../../../types';
import { StorageService } from '../../../services/storage';
import { OFFICIAL_SIX_CLASSES, getClassMetaByIdOrName } from '../../../utils/classColors';
import {
  printHtmlDocument,
  executeIframePrint,
  buildOfficialPrintHtml,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../../services/printAndFileService';
import { WhatsAppNotificationService } from '../../../services/whatsappNotificationService';
import { ViewModeToggle, useViewMode } from '../../common/ViewModeToggle';

// QR Scanner submodule integrated for unified Daily Attendance
import { QrScannerSubmodule } from './QrScannerSubmodule';

// Teacher Attendance Components (Images 008, 009, 010, 011)
import { TeacherAttendanceHomeView } from './TeacherAttendanceHomeView';
import { TeacherStaffDirectoryView } from './TeacherStaffDirectoryView';
import { TeacherAttendanceMarkView } from './TeacherAttendanceMarkView';
import { TeacherSideDrawer } from './TeacherSideDrawer';
import { TeacherAttendanceReportsModal } from './TeacherAttendanceReportsModal';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

type AttendanceActiveTab = 'teachers' | 'students' | 'qr_scanner';
type TeacherScreen = 'home' | 'staff' | 'mark';
type StudentViewSubmode = 'daily' | 'monthly_register';

interface MonthlyStudentSummaryMeta {
  studentsBeginningOfMonth: string;
  studentsEndOfMonth: string;
  totalAttendanceThisMonth: string;
  dailyAverageAttendance: string;
  schoolTimingThisMonth: string;
  totalSchoolTimingsSession: string;
  previousMonthTotals: Record<string, number>;
}

const MONTHLY_META_STORAGE_KEY = 'gps_chambai_student_monthly_meta_v1';

export const AttendanceSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [activeTab, setActiveTab] = useState<AttendanceActiveTab>('teachers');
  const [viewMode, setViewMode] = useViewMode('daily_attendance');

  // Teacher Attendance Sub-views
  const [teacherScreen, setTeacherScreen] = useState<TeacherScreen>('home');
  const [selectedMarkDate, setSelectedMarkDate] = useState<string>('2026-11-03');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);

  // Student Attendance State
  const [studentSubmode, setStudentSubmode] = useState<StudentViewSubmode>('daily');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('c-kachi');
  const [selectedDate, setSelectedDate] = useState<string>(
    () => new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(() =>
    new Date().toISOString().slice(0, 7)
  );
  const [recordsMap, setRecordsMap] = useState<Record<string, 'P' | 'A' | 'L'>>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Monthly Register 6 Required Fields + Previous Month Totals
  const [monthlyMetaMap, setMonthlyMetaMap] = useState<
    Record<string, MonthlyStudentSummaryMeta>
  >(() => {
    try {
      const raw = localStorage.getItem(MONTHLY_META_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {};
  });

  useEffect(() => {
    setStudents(StorageService.getStudents());
  }, []);

  const classStudents = students.filter((s) => s.classId === selectedClassId);
  const clsMeta = getClassMetaByIdOrName(selectedClassId);
  const monthKey = `${selectedClassId}_${selectedMonth}`;

  useEffect(() => {
    const all = StorageService.getAttendance();
    const existing = all.find(
      (a) => a.date === selectedDate && a.classId === selectedClassId
    );
    const nextMap: Record<string, 'P' | 'A' | 'L'> = {};
    students
      .filter((s) => s.classId === selectedClassId)
      .forEach((st) => {
        nextMap[st.id] = existing?.records?.[st.id] || 'P';
      });
    setRecordsMap(nextMap);
  }, [selectedClassId, selectedDate, students]);

  // Compute monthly attendance matrix for selectedClassId + selectedMonth
  const allAttendanceRecords = StorageService.getAttendance();
  const daysInMonthCount = (() => {
    const [yr, mo] = selectedMonth.split('-').map(Number);
    if (!yr || !mo) return 30;
    return new Date(yr, mo, 0).getDate();
  })();
  const dayNumbers = Array.from({ length: daysInMonthCount }, (_, i) => i + 1);

  const getStudentDayStatus = (studentId: string, dayNum: number): 'P' | 'A' | 'L' | '' => {
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const rec = allAttendanceRecords.find(
      (a) => a.date === dateStr && a.classId === selectedClassId
    );
    if (!rec || !rec.records) return '';
    return rec.records[studentId] || '';
  };

  const toggleStudentDayStatus = (studentId: string, dayNum: number) => {
    const dateStr = `${selectedMonth}-${String(dayNum).padStart(2, '0')}`;
    const all = StorageService.getAttendance();
    const existing = all.find(
      (a) => a.date === dateStr && a.classId === selectedClassId
    );
    const currentStatus = existing?.records?.[studentId] || 'P';
    const nextStatus: 'P' | 'A' | 'L' =
      currentStatus === 'P' ? 'A' : currentStatus === 'A' ? 'L' : 'P';

    const baseRecords: Record<string, 'P' | 'A' | 'L'> = {};
    classStudents.forEach((st) => {
      baseRecords[st.id] = existing?.records?.[st.id] || 'P';
    });
    baseRecords[studentId] = nextStatus;

    const updatedRecord: AttendanceRecord = {
      id: `att-${selectedClassId}-${dateStr}`,
      date: dateStr,
      classId: selectedClassId,
      records: baseRecords,
    };
    StorageService.saveAttendance(updatedRecord);
    if (dateStr === selectedDate) {
      setRecordsMap(baseRecords);
    } else {
      setStudents([...StorageService.getStudents()]);
    }
  };

  // Auto-calculated metrics for the selected month
  const markedDaysInMonth = allAttendanceRecords.filter(
    (a) => a.classId === selectedClassId && a.date.startsWith(selectedMonth)
  );
  const autoTotalPresentThisMonth = classStudents.reduce((acc, st) => {
    const countP = dayNumbers.filter((d) => getStudentDayStatus(st.id, d) === 'P').length;
    return acc + countP;
  }, 0);
  const workingDaysCount = Math.max(1, markedDaysInMonth.length || 24);
  const autoDailyAverage = (autoTotalPresentThisMonth / workingDaysCount).toFixed(1);

  const currentMonthMeta: MonthlyStudentSummaryMeta = monthlyMetaMap[monthKey] || {
    studentsBeginningOfMonth: String(classStudents.length),
    studentsEndOfMonth: String(classStudents.length),
    totalAttendanceThisMonth: String(autoTotalPresentThisMonth || classStudents.length * 22),
    dailyAverageAttendance: String(autoDailyAverage),
    schoolTimingThisMonth: '8:00 AM to 1:30 PM (24 Working Days)',
    totalSchoolTimingsSession: '168 Working Days (From April Session Start)',
    previousMonthTotals: {},
  };

  const updateMonthlyMetaField = (
    field: keyof Omit<MonthlyStudentSummaryMeta, 'previousMonthTotals'>,
    value: string
  ) => {
    const next = {
      ...monthlyMetaMap,
      [monthKey]: {
        ...currentMonthMeta,
        [field]: value,
      },
    };
    setMonthlyMetaMap(next);
    try {
      localStorage.setItem(MONTHLY_META_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const updateStudentPreviousMonthTotal = (studentId: string, val: number) => {
    const next = {
      ...monthlyMetaMap,
      [monthKey]: {
        ...currentMonthMeta,
        previousMonthTotals: {
          ...(currentMonthMeta.previousMonthTotals || {}),
          [studentId]: val,
        },
      },
    };
    setMonthlyMetaMap(next);
    try {
      localStorage.setItem(MONTHLY_META_STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const handleSaveStudentAttendance = () => {
    const record: AttendanceRecord = {
      id: `att-${selectedClassId}-${selectedDate}`,
      date: selectedDate,
      classId: selectedClassId,
      records: recordsMap,
    };
    StorageService.saveAttendance(record);
    showToast(`Attendance saved permanently for ${clsMeta.displayName} (${selectedDate})!`);
  };

  const handleTriggerStudentWhatsApp = async (
    st: Student,
    eventType: 'IN' | 'OUT',
    openManualWa = false
  ) => {
    const res = await WhatsAppNotificationService.sendStudentInOutNotification({
      student: st,
      eventType,
      openManualWhatsAppWindow: openManualWa,
    });
    showToast(res.reason);
  };

  const buildStudentAttendanceHtml = () => {
    if (studentSubmode === 'monthly_register') {
      const dayHeaders = dayNumbers
        .map((d) => `<th style="font-size:9px;padding:3px 2px;text-align:center;">${d}</th>`)
        .join('');
      const rows = classStudents
        .map((st, idx) => {
          let currentMonthP = 0;
          const dayCells = dayNumbers
            .map((d) => {
              const code = getStudentDayStatus(st.id, d) || 'P';
              if (code === 'P') currentMonthP++;
              const color =
                code === 'P' ? '#047857' : code === 'A' ? '#dc2626' : '#d97706';
              return `<td style="font-size:9px;padding:3px 2px;text-align:center;font-weight:700;color:${color};">${code}</td>`;
            })
            .join('');
          const prevMonthP =
            currentMonthMeta.previousMonthTotals?.[st.id] ?? 118;
          const grandTotalP = currentMonthP + prevMonthP;

          return `
            <tr>
              <td style="text-align:center;">${st.rollNo || idx + 1}</td>
              <td><strong>${st.admissionNo}</strong></td>
              <td><strong>${st.name}</strong></td>
              <td>${st.fatherName}</td>
              ${dayCells}
              <td style="text-align:center;font-weight:800;background:#ecfdf5;">${currentMonthP}</td>
              <td style="text-align:center;font-weight:700;background:#f8fafc;">${prevMonthP}</td>
              <td style="text-align:center;font-weight:900;background:#fef3c7;">${grandTotalP}</td>
            </tr>
          `;
        })
        .join('');

      return `
        <div style="border:2px solid #065f46;border-radius:10px;padding:10px;margin-bottom:12px;background:#f8fafc;font-size:11px;">
          <div style="font-weight:900;color:#065f46;margin-bottom:6px;text-transform:uppercase;">
            Monthly Student Attendance Register Summary — ${clsMeta.displayName} (${selectedMonth})
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:10.5px;">
            <tr>
              <td><strong>1. No. of Students at Beginning of Month:</strong> ${currentMonthMeta.studentsBeginningOfMonth}</td>
              <td><strong>2. No. of Students at End of Month:</strong> ${currentMonthMeta.studentsEndOfMonth}</td>
              <td><strong>3. Total Attendance During This Month:</strong> ${currentMonthMeta.totalAttendanceThisMonth}</td>
            </tr>
            <tr>
              <td><strong>4. Daily Average Attendance:</strong> ${currentMonthMeta.dailyAverageAttendance}</td>
              <td><strong>5. School Timing During This Month:</strong> ${currentMonthMeta.schoolTimingThisMonth}</td>
              <td><strong>6. Total School Timings From Start of Session:</strong> ${currentMonthMeta.totalSchoolTimingsSession}</td>
            </tr>
          </table>
        </div>
        <table>
          <thead>
            <tr>
              <th rowspan="2">Roll</th>
              <th rowspan="2">Adm No</th>
              <th rowspan="2">Student Name</th>
              <th rowspan="2">Father Name</th>
              <th colspan="${daysInMonthCount}" style="text-align:center;">Daily Attendance (${selectedMonth})</th>
              <th colspan="3" style="text-align:center;background:#065f46;color:#fff;">Attendance Summary</th>
            </tr>
            <tr>
              ${dayHeaders}
              <th style="background:#047857;color:#fff;text-align:center;">Current Month</th>
              <th style="background:#0f766e;color:#fff;text-align:center;">Previous Month</th>
              <th style="background:#b45309;color:#fff;text-align:center;">Total</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
    }

    const rows = classStudents
      .map((st, idx) => {
        const status = recordsMap[st.id] || 'P';
        const label =
          status === 'P' ? 'Present' : status === 'A' ? 'Absent' : 'Leave';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${st.rollNo || idx + 1}</strong></td>
            <td>${st.admissionNo}</td>
            <td><strong>${st.name}</strong></td>
            <td>${st.fatherName}</td>
            <td><strong>${label} (${status})</strong></td>
          </tr>
        `;
      })
      .join('');

    return `
      <div style="border:1.5px solid #cbd5e1;border-radius:8px;padding:8px 12px;margin-bottom:10px;font-size:11px;">
        <strong>Class:</strong> ${clsMeta.displayName} &nbsp;|&nbsp;
        <strong>Date:</strong> ${selectedDate} &nbsp;|&nbsp;
        <strong>Students Beginning of Month:</strong> ${currentMonthMeta.studentsBeginningOfMonth} &nbsp;|&nbsp;
        <strong>Students End of Month:</strong> ${currentMonthMeta.studentsEndOfMonth} &nbsp;|&nbsp;
        <strong>Daily Avg Attendance:</strong> ${currentMonthMeta.dailyAverageAttendance}
      </div>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Roll No</th>
            <th>Admission No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Attendance Status</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const handlePrintStudentAttendanceSheet = () => {
    const title =
      studentSubmode === 'monthly_register'
        ? `Monthly Attendance Register - ${clsMeta.displayName} (${selectedMonth})`
        : `Daily Attendance Sheet - ${clsMeta.displayName} (${selectedDate})`;
    printHtmlDocument(
      title,
      buildStudentAttendanceHtml(),
      studentSubmode === 'monthly_register' ? 'landscape' : 'portrait',
      true,
      'Student Attendance/Monthly Reports'
    );
  };

  const handleSaveStudentPdf = async () => {
    const title =
      studentSubmode === 'monthly_register'
        ? `Monthly Attendance Register - ${clsMeta.displayName} (${selectedMonth})`
        : `Daily Attendance Sheet - ${clsMeta.displayName} (${selectedDate})`;
    const fileName =
      studentSubmode === 'monthly_register'
        ? `Student_Attendance_Register_${clsMeta.shortCode}_${selectedMonth}.pdf`
        : `Student_Attendance_${clsMeta.shortCode}_${selectedDate}.pdf`;
    await exportAndSaveRealPdf(
      title,
      buildStudentAttendanceHtml(),
      fileName,
      studentSubmode === 'monthly_register' ? 'landscape' : 'portrait',
      'Student Attendance/Monthly Reports'
    );
    showToast(`Saved PDF to GPS Chambai/Student Attendance/Monthly Reports/${fileName}`);
  };

  const handleSaveStudentWord = async () => {
    const title =
      studentSubmode === 'monthly_register'
        ? `Monthly Attendance Register - ${clsMeta.displayName} (${selectedMonth})`
        : `Daily Attendance Sheet - ${clsMeta.displayName} (${selectedDate})`;
    const fileName =
      studentSubmode === 'monthly_register'
        ? `Student_Attendance_Register_${clsMeta.shortCode}_${selectedMonth}.doc`
        : `Student_Attendance_${clsMeta.shortCode}_${selectedDate}.doc`;
    await exportAndSaveWordDoc(
      title,
      buildStudentAttendanceHtml(),
      fileName,
      'Student Attendance/Monthly Reports'
    );
    showToast(`Saved Word Doc to GPS Chambai/Student Attendance/Monthly Reports/${fileName}`);
  };

  // Handle drawer item navigation
  const handleDrawerNavigate = (
    item: 'home' | 'staff' | 'reports' | 'profile' | 'sync' | 'credits' | 'signout'
  ) => {
    if (item === 'home') {
      setTeacherScreen('home');
    } else if (item === 'staff') {
      setTeacherScreen('staff');
    } else if (item === 'reports') {
      setIsReportsOpen(true);
    } else if (item === 'signout') {
      onBack();
    }
  };

  return (
    <div className="relative min-h-full flex flex-col bg-[#f4f7f5] text-slate-900">
      {/* Top Main Mode Switcher Tab Bar */}
      <div className="bg-white px-4 py-2 border-b border-slate-200/80 shrink-0 flex flex-wrap items-center justify-between gap-2 shadow-2xs">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700"
            title="Back to Dashboard"
          >
            <ArrowLeft size={18} />
          </button>

          {/* Teacher vs Student vs QR Scanner Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'teachers'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users size={14} />
              <span>{lang === 'ur' ? 'اساتذہ حاضری' : 'Teacher Attendance'}</span>
            </button>

            <button
              onClick={() => setActiveTab('students')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'students'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap size={14} />
              <span>{lang === 'ur' ? 'طلباء حاضری' : 'Student Attendance'}</span>
            </button>

            <button
              onClick={() => setActiveTab('qr_scanner')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'qr_scanner'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <QrCode size={14} />
              <span>{lang === 'ur' ? 'کیو آر اسکینر' : 'QR Scanner'}</span>
            </button>
          </div>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />

          <button
            onClick={() => {
              if (activeTab === 'teachers') {
                const staffList = StorageService.getOfficialTeachers();
                const allRecs = StorageService.getTeacherAttendance();
                const todayRec = allRecs[0] || StorageService.getTeacherAttendanceByDate('2026-11-03');
                const rows = staffList.map((s, idx) => {
                  const st = todayRec.statusMap?.[s.id] || 'Present';
                  return `<tr><td style="text-align:center;">${idx + 1}</td><td><strong>${s.name}</strong></td><td>${s.designation}</td><td>${s.cnic}</td><td><strong>${st}</strong></td><td style="width:100px;border-bottom:1px dotted #94a3b8;"></td></tr>`;
                }).join('');
                const bodyHtml = `<table><thead><tr><th>#</th><th>Staff Name</th><th>Designation</th><th>CNIC</th><th>Status</th><th>Sign</th></tr></thead><tbody>${rows}</tbody></table>`;
                const title = `Teacher Attendance - ${todayRec.date}`;
                const fullHtml = buildOfficialPrintHtml(title, bodyHtml, 'portrait', true);
                executeIframePrint(fullHtml);
                printHtmlDocument(title, bodyHtml, 'portrait', true, 'Staff Attendance/Monthly Reports');
              } else {
                handlePrintStudentAttendanceSheet();
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-1 shadow-2xs"
            title="Print Attendance Sheet"
          >
            <Printer size={14} className="text-emerald-700" />
            <span className="hidden sm:inline">Print</span>
          </button>

          <button
            onClick={async () => {
              if (activeTab === 'teachers') {
                const staffList = StorageService.getOfficialTeachers();
                const allRecs = StorageService.getTeacherAttendance();
                const todayRec = allRecs[0] || StorageService.getTeacherAttendanceByDate('2026-11-03');
                const rows = staffList.map((s, idx) => {
                  const st = todayRec.statusMap?.[s.id] || 'Present';
                  return `<tr><td style="text-align:center;">${idx + 1}</td><td><strong>${s.name}</strong></td><td>${s.designation}</td><td>${s.cnic}</td><td><strong>${st}</strong></td><td style="width:100px;border-bottom:1px dotted #94a3b8;"></td></tr>`;
                }).join('');
                const bodyHtml = `<table><thead><tr><th>#</th><th>Staff Name</th><th>Designation</th><th>CNIC</th><th>Status</th><th>Sign</th></tr></thead><tbody>${rows}</tbody></table>`;
                const title = `Teacher Attendance Register (${todayRec.date})`;
                await exportAndSaveRealPdf(
                  title,
                  bodyHtml,
                  `Teacher_Attendance_${todayRec.date}.pdf`,
                  'portrait',
                  'Staff Attendance/Monthly Reports'
                );
              } else {
                await handleSaveStudentPdf();
              }
            }}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-1 shadow-2xs"
            title="Save as Real PDF"
          >
            <Download size={14} className="text-blue-600" />
            <span className="hidden sm:inline">Save PDF</span>
          </button>

          <button
            onClick={() => setIsReportsOpen(true)}
            className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black flex items-center gap-1 shadow-2xs"
            title="Reports & Matrix Register"
          >
            <Eye size={14} className="text-purple-600" />
            <span className="hidden sm:inline">Reports</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'teachers' && (
          <>
            {/* View 1: Home (Image 008) */}
            {teacherScreen === 'home' && (
              <TeacherAttendanceHomeView
                onOpenDrawer={() => setIsDrawerOpen(true)}
                onNavigateToStaff={() => setTeacherScreen('staff')}
                onNavigateToMark={(targetDate) => {
                  setSelectedMarkDate(targetDate);
                  setTeacherScreen('mark');
                }}
                onOpenReports={() => setIsReportsOpen(true)}
                onSwitchToStudentAttendance={() => setActiveTab('students')}
                lang={lang}
              />
            )}

            {/* View 2: Staff Directory (Image 009) */}
            {teacherScreen === 'staff' && (
              <TeacherStaffDirectoryView
                onBack={() => setTeacherScreen('home')}
                lang={lang}
              />
            )}

            {/* View 3: Mark / Review Attendance (Image 010) */}
            {teacherScreen === 'mark' && (
              <TeacherAttendanceMarkView
                date={selectedMarkDate}
                onBack={() => setTeacherScreen('home')}
                lang={lang}
              />
            )}

            {/* Side Drawer (Image 011) */}
            <TeacherSideDrawer
              isOpen={isDrawerOpen}
              onClose={() => setIsDrawerOpen(false)}
              activeItem={teacherScreen === 'staff' ? 'staff' : 'home'}
              onNavigate={handleDrawerNavigate}
              lang={lang}
            />

            {/* Reports & PDF Save Modal */}
            <TeacherAttendanceReportsModal
              isOpen={isReportsOpen}
              onClose={() => setIsReportsOpen(false)}
              lang={lang}
            />
          </>
        )}

        {activeTab === 'students' && (
          /* Student Attendance Mode */
          <div className="p-3.5 space-y-4 pb-12 animate-fade-in">
            <div
              className="rounded-3xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-2"
              style={{ backgroundColor: clsMeta.hex }}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setActiveTab('teachers')}
                  className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/30 flex items-center justify-center text-white"
                  title="Switch to Teacher Attendance"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full">
                    GPS Chambai • Student Attendance &amp; Monthly Register
                  </span>
                  <h2 className="text-lg font-black tracking-tight mt-0.5">
                    {lang === 'ur' ? 'طلباء روزانہ اور ماہانہ حاضری' : `${clsMeta.displayName} Attendance`}
                  </h2>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* Sub-mode switcher: Daily Roll Call vs Monthly Register (Image 018.jpg) */}
                <div className="flex bg-black/25 p-1 rounded-xl">
                  <button
                    onClick={() => setStudentSubmode('daily')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all ${
                      studentSubmode === 'daily'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    Daily Roll Call
                  </button>
                  <button
                    onClick={() => setStudentSubmode('monthly_register')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all flex items-center gap-1 ${
                      studentSubmode === 'monthly_register'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    <Calendar size={12} />
                    <span>Monthly Register</span>
                  </button>
                </div>

                <button
                  onClick={handlePrintStudentAttendanceSheet}
                  className="px-2.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-black flex items-center gap-1"
                  title="Print / Preview"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  onClick={handleSaveStudentPdf}
                  className="px-2.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-black flex items-center gap-1"
                  title="Save PDF"
                >
                  <Download size={14} />
                  <span>PDF</span>
                </button>
                <button
                  onClick={handleSaveStudentWord}
                  className="px-2.5 py-2 rounded-xl bg-black/20 hover:bg-black/30 text-white text-xs font-black flex items-center gap-1"
                  title="Export Word Doc"
                >
                  <FileText size={14} />
                  <span>Doc</span>
                </button>
                <button
                  onClick={handleSaveStudentAttendance}
                  className="px-3.5 py-2 rounded-xl bg-white text-slate-900 text-xs font-black flex items-center gap-1 shadow-md hover:bg-slate-100"
                >
                  <Save size={15} />
                  <span>Save</span>
                </button>
              </div>
            </div>

            {savedNotice && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black shadow-xs">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{savedNotice}</span>
              </div>
            )}

            {/* Class, Date & Month Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Select Class
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                >
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName} ({c.urduName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Attendance Date (Daily)
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value.length >= 7) {
                      setSelectedMonth(e.target.value.slice(0, 7));
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Attendance Month (Register)
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* 6 Required Monthly Student Attendance Summary Fields (Editable + Auto-Calculated) */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-700/20 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-emerald-900">
                    Monthly Attendance Register Header Fields ({clsMeta.displayName} • {selectedMonth})
                  </h3>
                  <p className="text-[10px] font-semibold text-slate-500">
                    All 6 official monthly register metrics are auto-calculated and 100% editable
                  </p>
                </div>
                <span className="text-[10px] font-black bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200">
                  Auto-Sync &amp; Editable
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    1. No. of Students at Beginning of Month
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.studentsBeginningOfMonth}
                    onChange={(e) =>
                      updateMonthlyMetaField('studentsBeginningOfMonth', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    2. No. of Students at End of Month
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.studentsEndOfMonth}
                    onChange={(e) =>
                      updateMonthlyMetaField('studentsEndOfMonth', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    3. Total Attendance During This Month
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.totalAttendanceThisMonth}
                    onChange={(e) =>
                      updateMonthlyMetaField('totalAttendanceThisMonth', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-800 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    4. Daily Average Attendance
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.dailyAverageAttendance}
                    onChange={(e) =>
                      updateMonthlyMetaField('dailyAverageAttendance', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-emerald-800 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    5. School Timing During This Month
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.schoolTimingThisMonth}
                    onChange={(e) =>
                      updateMonthlyMetaField('schoolTimingThisMonth', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    6. Total School Timings From Start of Session
                  </label>
                  <input
                    type="text"
                    value={currentMonthMeta.totalSchoolTimingsSession}
                    onChange={(e) =>
                      updateMonthlyMetaField('totalSchoolTimingsSession', e.target.value)
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900 focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {studentSubmode === 'daily' ? (
              /* Daily Roll Call List / Grid with WhatsApp IN & OUT Notification Triggers */
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 md:grid-cols-2 gap-3'
                    : 'space-y-2.5'
                }
              >
                {classStudents.map((st, idx) => {
                  const status = recordsMap[st.id] || 'P';
                  return (
                    <div
                      key={st.id}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 hover:border-emerald-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className="w-8 h-8 rounded-xl text-white text-xs font-black flex items-center justify-center shrink-0"
                          style={{ backgroundColor: clsMeta.hex }}
                        >
                          {st.rollNo || idx + 1}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-black text-slate-900 truncate">
                            {st.name}
                          </div>
                          <div className="text-[11px] font-semibold text-slate-500 truncate">
                            S/O {st.fatherName} • {st.admissionNo} •{' '}
                            {st.contactNo || st.parentWhatsApp || '0336-9053352'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                        {/* Student IN / OUT WhatsApp Parent Alert Buttons */}
                        <button
                          type="button"
                          onClick={() => handleTriggerStudentWhatsApp(st, 'IN', false)}
                          className="px-2 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black flex items-center gap-1"
                          title="Send Student IN (Arrival) WhatsApp Alert to Parent"
                        >
                          <LogIn size={12} />
                          <span>IN Alert</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerStudentWhatsApp(st, 'OUT', false)}
                          className="px-2 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-black flex items-center gap-1"
                          title="Send Student OUT (Departure) WhatsApp Alert to Parent"
                        >
                          <LogOut size={12} />
                          <span>OUT Alert</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleTriggerStudentWhatsApp(st, 'IN', true)}
                          className="p-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white"
                          title="Open WhatsApp (wa.me) Directly"
                        >
                          <MessageCircle size={13} />
                        </button>

                        {/* P / A / L Status Buttons */}
                        {(['P', 'A', 'L'] as const).map((code) => (
                          <button
                            key={code}
                            onClick={() => {
                              setRecordsMap((prev) => ({ ...prev, [st.id]: code }));
                              if (code === 'P') {
                                WhatsAppNotificationService.sendStudentInOutNotification({
                                  student: st,
                                  eventType: 'IN',
                                  openManualWhatsAppWindow: false,
                                });
                              }
                            }}
                            className={`w-9 h-9 rounded-xl text-xs font-black transition-all ${
                              status === code
                                ? code === 'P'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : code === 'A'
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'bg-amber-500 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {code}
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Monthly Attendance Register View matching Image 018.jpg */
              <div className="bg-white rounded-3xl p-4 border-2 border-emerald-800/30 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      Official Monthly Student Attendance Register (Image 018 Layout)
                    </h3>
                    <p className="text-[11px] font-semibold text-slate-500">
                      Click any day cell (1–{daysInMonthCount}) to toggle P / A / L. Right-side columns show Current Month, Previous Month (editable), and Total.
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-300 rounded-2xl">
                  <table className="w-full text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-emerald-900 text-white font-black">
                        <th rowSpan={2} className="p-2 border border-emerald-800 text-center">
                          Roll
                        </th>
                        <th rowSpan={2} className="p-2 border border-emerald-800 text-left min-w-[130px]">
                          Student Name
                        </th>
                        <th rowSpan={2} className="p-2 border border-emerald-800 text-left min-w-[120px]">
                          Father Name
                        </th>
                        <th
                          colSpan={daysInMonthCount}
                          className="p-1.5 border border-emerald-800 text-center bg-emerald-800"
                        >
                          Days of Month ({selectedMonth})
                        </th>
                        <th
                          colSpan={3}
                          className="p-1.5 border border-emerald-800 text-center bg-amber-600 text-slate-950"
                        >
                          Attendance Summary (Image 018)
                        </th>
                      </tr>
                      <tr className="bg-slate-100 text-slate-800 font-black">
                        {dayNumbers.map((d) => (
                          <th
                            key={d}
                            className="p-1 border border-slate-300 text-center min-w-[24px] text-[10px]"
                          >
                            {d}
                          </th>
                        ))}
                        <th className="p-1.5 border border-slate-300 text-center bg-emerald-100 text-emerald-950 min-w-[68px]">
                          Current Month
                        </th>
                        <th className="p-1.5 border border-slate-300 text-center bg-sky-100 text-sky-950 min-w-[68px]">
                          Previous Month
                        </th>
                        <th className="p-1.5 border border-slate-300 text-center bg-amber-100 text-amber-950 min-w-[60px]">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {classStudents.map((st, idx) => {
                        let currentMonthP = 0;
                        dayNumbers.forEach((d) => {
                          const code = getStudentDayStatus(st.id, d) || 'P';
                          if (code === 'P') currentMonthP++;
                        });
                        const prevMonthVal =
                          currentMonthMeta.previousMonthTotals?.[st.id] ?? 118;
                        const totalVal = currentMonthP + prevMonthVal;

                        return (
                          <tr key={st.id} className="hover:bg-slate-50">
                            <td className="p-1.5 border border-slate-200 text-center font-black">
                              {st.rollNo || idx + 1}
                            </td>
                            <td className="p-1.5 border border-slate-200 font-black text-slate-900">
                              {st.name}
                            </td>
                            <td className="p-1.5 border border-slate-200 text-slate-600 font-semibold">
                              {st.fatherName}
                            </td>
                            {dayNumbers.map((d) => {
                              const code = getStudentDayStatus(st.id, d) || 'P';
                              return (
                                <td
                                  key={d}
                                  onClick={() => toggleStudentDayStatus(st.id, d)}
                                  className={`p-1 border border-slate-200 text-center font-black cursor-pointer select-none transition-colors ${
                                    code === 'P'
                                      ? 'text-emerald-700 hover:bg-emerald-50'
                                      : code === 'A'
                                      ? 'bg-rose-50 text-rose-700'
                                      : 'bg-amber-50 text-amber-700'
                                  }`}
                                  title={`Day ${d}: Click to toggle P / A / L`}
                                >
                                  {code}
                                </td>
                              );
                            })}
                            <td className="p-1.5 border border-slate-300 text-center font-black bg-emerald-50 text-emerald-900">
                              {currentMonthP}
                            </td>
                            <td className="p-1 border border-slate-300 text-center bg-sky-50">
                              <input
                                type="number"
                                value={prevMonthVal}
                                onChange={(e) =>
                                  updateStudentPreviousMonthTotal(
                                    st.id,
                                    Number(e.target.value) || 0
                                  )
                                }
                                className="w-14 px-1 py-0.5 text-center font-black bg-white border border-sky-300 rounded text-sky-950"
                              />
                            </td>
                            <td className="p-1.5 border border-slate-300 text-center font-black bg-amber-50 text-amber-950">
                              {totalVal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* QR Scanner Mode */}
        {activeTab === 'qr_scanner' && (
          <div className="flex-1 overflow-y-auto">
            <QrScannerSubmodule onBack={() => setActiveTab('teachers')} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
};
