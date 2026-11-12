import React, { useState, useEffect, useRef } from 'react';
import {
  Printer,
  Download,
  FileSpreadsheet,
  Table,
  Image as ImageIcon,
  Eye,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Palette,
  Users,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { Student } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  executeIframePrint,
  buildOfficialPrintHtml,
  exportVisualHtmlToPdf,
  exportVisualHtmlToJpg,
  exportAndSaveWordDoc,
  exportAndSaveExcelXls,
} from '../../../services/printAndFileService';

export interface AwardListStudentRow {
  id: string;
  rollNo: number;
  nameUrdu: string;
  eng: string;
  math: string;
  urdu: string;
  el: string;
  ml: string;
  ul: string;
  maxMarks: number;
  obtainedOverride?: string;
  obtainedMarks?: number;
  percentage?: string;
  statusUrdu?: string;
}

export interface AwardListSheetData {
  schoolBannerTitle: string;
  subtitle: string;
  teacherLabel: string;
  teacherName: string;
  className: string;
  totalStudentsLabel: string;
  examinationSession: string;
  termLabel: string;
  totalMaxMarks: number;
  passMarks: number;
  subjectEngLabel: string;
  subjectMathLabel: string;
  subjectUrduLabel: string;
  subjectElLabel: string;
  subjectMlLabel: string;
  subjectUlLabel: string;
  emblemAcronym: string;
  emblemSloganUrdu: string;
  emblemSchoolLine: string;
  inchargeLabelUrdu: string;
  inchargeNameUrdu: string;
  headTeacherTitle: string;
  headTeacherName: string;
  signSealLabel: string;
  designationLabel: string;
  bannerColor: string;
  headerGreenColor: string;
  tableHeaderColor: string;
  accentBlueColor: string;
  rows: AwardListStudentRow[];
}

// Exact 38 Student Rows matching attached Image 032.jpg
const INITIAL_IMAGE_032_ROWS: AwardListStudentRow[] = [
  { id: 'r1', rollNo: 1, nameUrdu: 'انور حیات', eng: '91', math: '55', urdu: '77', el: '24', ml: '30', ul: '35', maxMarks: 414 },
  { id: 'r2', rollNo: 2, nameUrdu: 'معاویہ', eng: '18', math: '50', urdu: '65', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r3', rollNo: 3, nameUrdu: 'محمد موسیٰ', eng: '86', math: '84', urdu: '65', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r4', rollNo: 4, nameUrdu: 'محمد انس', eng: '0', math: '25', urdu: '0', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r5', rollNo: 5, nameUrdu: 'محمد ریحان', eng: '100', math: '100', urdu: '100', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r6', rollNo: 6, nameUrdu: 'محمد مدثر', eng: '96', math: '90', urdu: '98', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r7', rollNo: 7, nameUrdu: 'شان محمد', eng: '50', math: '35', urdu: '68', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r8', rollNo: 8, nameUrdu: 'عبداللہ', eng: '51', math: '28', urdu: '40', el: '26', ml: '39', ul: '12', maxMarks: 414 },
  { id: 'r9', rollNo: 9, nameUrdu: 'محمد سپند', eng: '98', math: '88', urdu: '79', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r10', rollNo: 10, nameUrdu: 'محیب اللہ', eng: '18', math: '20', urdu: '0', el: '22', ml: '50', ul: '31', maxMarks: 414 },
  { id: 'r11', rollNo: 11, nameUrdu: 'محمد حذیفہ', eng: '74', math: '57', urdu: '56', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r12', rollNo: 12, nameUrdu: 'طاہر شاہ', eng: '6', math: '2', urdu: '20', el: '14', ml: '10', ul: '5', maxMarks: 414 },
  { id: 'r13', rollNo: 13, nameUrdu: 'حضرت بلال', eng: '20', math: '5', urdu: '5', el: '9', ml: '10', ul: '4', maxMarks: 414 },
  { id: 'r14', rollNo: 14, nameUrdu: 'محمد اسد (1)', eng: '34', math: '28', urdu: '30', el: '22', ml: '30', ul: '15', maxMarks: 414 },
  { id: 'r15', rollNo: 15, nameUrdu: 'ابوبکر', eng: '96', math: '90', urdu: '90', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r16', rollNo: 16, nameUrdu: 'عبدالرحمٰن', eng: '86', math: '93', urdu: '58', el: '26', ml: '50', ul: '37', maxMarks: 414 },
  { id: 'r17', rollNo: 17, nameUrdu: 'محمد ابراہیم (1)', eng: '66', math: '36', urdu: '20', el: '21', ml: '29', ul: '29', maxMarks: 414 },
  { id: 'r18', rollNo: 18, nameUrdu: 'محمد شعبان', eng: '0', math: '0', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r19', rollNo: 19, nameUrdu: 'محمد عثمان', eng: '100', math: '100', urdu: '100', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r20', rollNo: 20, nameUrdu: 'محمد ادریس', eng: '0', math: '0', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r21', rollNo: 21, nameUrdu: 'امیر خان', eng: '98', math: '100', urdu: '100', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r22', rollNo: 22, nameUrdu: 'فہد', eng: '96', math: '99', urdu: '98', el: '26', ml: '50', ul: '36', maxMarks: 414 },
  { id: 'r23', rollNo: 23, nameUrdu: 'یاسر', eng: '46', math: '0', urdu: '50', el: '15', ml: '20', ul: '12', maxMarks: 414 },
  { id: 'r24', rollNo: 24, nameUrdu: 'مدثر', eng: '33', math: '34', urdu: '36', el: '19', ml: '35', ul: '24', maxMarks: 414 },
  { id: 'r25', rollNo: 25, nameUrdu: 'ابراہیم (2)', eng: '32', math: '64', urdu: '50', el: '4', ml: '10', ul: '5', maxMarks: 414 },
  { id: 'r26', rollNo: 26, nameUrdu: 'عزیز الرحمٰن', eng: '100', math: '92', urdu: '100', el: '26', ml: '49', ul: '38', maxMarks: 414 },
  { id: 'r27', rollNo: 27, nameUrdu: 'ذکریا', eng: '100', math: '91', urdu: '78', el: '26', ml: '30', ul: '36', maxMarks: 414 },
  { id: 'r28', rollNo: 28, nameUrdu: 'محمد عرفان', eng: '6', math: '15', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r29', rollNo: 29, nameUrdu: 'عادل نواز', eng: '0', math: '0', urdu: '10', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r30', rollNo: 30, nameUrdu: 'محمد ارشد', eng: '62', math: '40', urdu: '80', el: '26', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r31', rollNo: 31, nameUrdu: 'عاطف اللہ', eng: '30', math: '17', urdu: '55', el: '12', ml: '8', ul: '10', maxMarks: 414 },
  { id: 'r32', rollNo: 32, nameUrdu: 'آصف اللہ', eng: '61', math: '54', urdu: '59', el: '9', ml: '50', ul: '38', maxMarks: 414 },
  { id: 'r33', rollNo: 33, nameUrdu: 'عبدالقیوم', eng: '30', math: '2', urdu: '25', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r34', rollNo: 34, nameUrdu: 'محمد مزمل', eng: '22', math: '22', urdu: '30', el: '10', ml: '29', ul: '37', maxMarks: 414 },
  { id: 'r35', rollNo: 35, nameUrdu: 'محمد اسد (2)', eng: '0', math: '0', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r36', rollNo: 36, nameUrdu: 'محمد حذیفہ (2)', eng: '0', math: '0', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r37', rollNo: 37, nameUrdu: 'محمد حماد', eng: '0', math: '0', urdu: '0', el: '0', ml: '0', ul: '0', maxMarks: 414 },
  { id: 'r38', rollNo: 38, nameUrdu: 'مجید اللہ', eng: '44', math: '35', urdu: '56', el: '20', ml: '34', ul: '23', maxMarks: 414 },
];

const DEFAULT_AWARD_LIST_DATA: AwardListSheetData = {
  schoolBannerTitle: 'G.P.S MIR BANDA JARMA KOHAT',
  subtitle: '( Award List )',
  teacherLabel: 'Name',
  teacherName: 'MUHAMMAD IRFAN',
  className: 'KG (ECE)',
  totalStudentsLabel: '38',
  examinationSession: '2022-23',
  termLabel: 'Final Term',
  totalMaxMarks: 414,
  passMarks: 130,
  subjectEngLabel: 'انگریزی',
  subjectMathLabel: 'ریاضی',
  subjectUrduLabel: 'اردو',
  subjectElLabel: 'EL',
  subjectMlLabel: 'ML',
  subjectUlLabel: 'UL',
  emblemAcronym: 'GPSCK',
  emblemSloganUrdu: 'معیاری تعلیم۔۔۔ سب کیلئے!',
  emblemSchoolLine: 'Government Primary School Chambai Kohat 16454',
  inchargeLabelUrdu: 'کلاس انچارج : محمد عرفان',
  inchargeNameUrdu: 'محمد عرفان',
  headTeacherTitle: 'Head Teacher G.P.S Chambai Kohat',
  headTeacherName: 'Zar Khan Afridi',
  signSealLabel: 'Sign and Seal',
  designationLabel: 'PSHT',
  bannerColor: '#e6005c',
  headerGreenColor: '#15803d',
  tableHeaderColor: '#1e3a8a',
  accentBlueColor: '#0284c7',
  rows: INITIAL_IMAGE_032_ROWS,
};

const STORAGE_KEY_AWARD_LIST = 'gps_chambai_award_list_image032_v2';

const COLOR_THEME_PRESETS = [
  {
    name: 'Official Image 032 Theme (Magenta & Green)',
    bannerColor: '#e6005c',
    headerGreenColor: '#15803d',
    tableHeaderColor: '#1e3a8a',
    accentBlueColor: '#0284c7',
  },
  {
    name: 'Emerald Royal Theme',
    bannerColor: '#047857',
    headerGreenColor: '#065f46',
    tableHeaderColor: '#0f172a',
    accentBlueColor: '#059669',
  },
  {
    name: 'Royal Blue & Gold Theme',
    bannerColor: '#1d4ed8',
    headerGreenColor: '#1e40af',
    tableHeaderColor: '#1e3a8a',
    accentBlueColor: '#2563eb',
  },
  {
    name: 'Crimson & Slate Official Theme',
    bannerColor: '#be123c',
    headerGreenColor: '#0f766e',
    tableHeaderColor: '#334155',
    accentBlueColor: '#e11d48',
  },
];

function computeGradeFromPct(pct: number, isPass: boolean): string {
  if (!isPass) return 'F';
  if (pct >= 80) return 'A+';
  if (pct >= 70) return 'A';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  return 'D';
}

function formatOrdinalPosition(rank: number): string {
  const mod10 = rank % 10;
  const mod100 = rank % 100;
  if (mod10 === 1 && mod100 !== 11) return `${rank}st`;
  if (mod10 === 2 && mod100 !== 12) return `${rank}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${rank}rd`;
  return `${rank}th`;
}

function computeRowStats(row: AwardListStudentRow, defaultMax: number, passMarks: number) {
  const vals = [row.eng, row.math, row.urdu, row.el, row.ml, row.ul];
  const allAbsent = vals.every((v) => !v || v.trim().toUpperCase() === 'A' || v.trim() === '-');
  const calculatedSum = vals.reduce((acc, v) => {
    const n = Number(v);
    return acc + (Number.isFinite(n) ? n : 0);
  }, 0);

  const hasManualOverride =
    row.obtainedOverride !== undefined &&
    row.obtainedOverride.trim() !== '' &&
    Number.isFinite(Number(row.obtainedOverride));

  const sum = hasManualOverride ? Number(row.obtainedOverride) : allAbsent ? 0 : calculatedSum;
  const max = row.maxMarks || defaultMax || 414;
  const pct = max > 0 ? (sum / max) * 100 : 0;
  const isPass = sum >= passMarks && (!allAbsent || hasManualOverride);
  const grade = computeGradeFromPct(pct, isPass);
  const pctFormatted =
    pct === 100
      ? '100'
      : pct >= 10
        ? pct.toFixed(1)
        : pct > 0
          ? pct.toFixed(2)
          : '0';

  return {
    obtained: sum,
    obtainedDisplay: String(sum),
    pct,
    pctDisplay: pctFormatted,
    isPass,
    grade,
    statusUrdu: isPass ? 'پاس' : 'فیل',
  };
}

interface AwardListImage032ViewProps {
  students?: Student[];
  onSaved?: (msg: string) => void;
}

export const AwardListImage032View: React.FC<AwardListImage032ViewProps> = ({
  students = [],
  onSaved,
}) => {
  const [sheet, setSheet] = useState<AwardListSheetData>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AWARD_LIST);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.rows) && parsed.rows.length > 0) {
          return { ...DEFAULT_AWARD_LIST_DATA, ...parsed };
        }
      }
    } catch {
      // fallback
    }
    return DEFAULT_AWARD_LIST_DATA;
  });

  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  const notify = (msg: string) => {
    setToastMsg(msg);
    onSaved?.(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AWARD_LIST, JSON.stringify(sheet));
    } catch {
      // ignore storage quota errors
    }
  }, [sheet]);

  const updateField = <K extends keyof AwardListSheetData>(key: K, val: AwardListSheetData[K]) => {
    setSheet((prev) => ({ ...prev, [key]: val }));
  };

  const updateRowField = (
    rowId: string,
    field: keyof AwardListStudentRow,
    value: string | number | undefined
  ) => {
    setSheet((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => {
        if (r.id !== rowId) return r;
        const updated = { ...r, [field]: value };
        // If user edits any subject mark, clear manual obtainedOverride so sum auto-recalculates immediately
        if (['eng', 'math', 'urdu', 'el', 'ml', 'ul'].includes(field as string)) {
          delete updated.obtainedOverride;
        }
        return updated;
      }),
    }));
  };

  const handleAddRow = () => {
    const nextRoll = sheet.rows.length + 1;
    const newRow: AwardListStudentRow = {
      id: `r-${Date.now()}`,
      rollNo: nextRoll,
      nameUrdu: `طالب علم ${nextRoll}`,
      eng: '65',
      math: '70',
      urdu: '68',
      el: '22',
      ml: '42',
      ul: '27',
      maxMarks: sheet.totalMaxMarks,
    };
    setSheet((prev) => ({
      ...prev,
      totalStudentsLabel: String(prev.rows.length + 1),
      rows: [...prev.rows, newRow],
    }));
  };

  const handleDeleteRow = (rowId: string) => {
    setSheet((prev) => {
      const next = prev.rows
        .filter((r) => r.id !== rowId)
        .map((r, idx) => ({ ...r, rollNo: idx + 1 }));
      return {
        ...prev,
        totalStudentsLabel: String(next.length),
        rows: next,
      };
    });
  };

  const handleLoadFromSchoolStudents = () => {
    const allSts = students.length > 0 ? students : StorageService.getStudents();
    const filtered = selectedClassFilter
      ? allSts.filter((s) => s.classId === selectedClassFilter)
      : allSts;
    if (filtered.length === 0) {
      notify('No students found in the selected class.');
      return;
    }
    const mapped: AwardListStudentRow[] = filtered.map((s, idx) => ({
      id: `st-${s.id}-${idx}`,
      rollNo: Number(s.rollNo) || idx + 1,
      nameUrdu: s.name,
      eng: '65',
      math: '70',
      urdu: '68',
      el: '22',
      ml: '42',
      ul: '27',
      maxMarks: sheet.totalMaxMarks,
    }));
    setSheet((prev) => ({
      ...prev,
      className: selectedClassFilter || prev.className,
      totalStudentsLabel: String(mapped.length),
      rows: mapped,
    }));
    notify(`Loaded ${mapped.length} students into Award List!`);
  };

  const handleResetToImage032 = () => {
    setSheet(DEFAULT_AWARD_LIST_DATA);
    notify('Restored default Image 032 Award List layout & data!');
  };

  // 1. Compute base row stats
  const baseComputedRows = sheet.rows.map((r) => ({
    ...r,
    stats: computeRowStats(r, sheet.totalMaxMarks, sheet.passMarks),
  }));

  // 2. Automatic Position Holders Calculation (Dense tie-ranking by obtained marks among passing students)
  const distinctPassingScores = Array.from(
    new Set(
      baseComputedRows
        .filter((r) => r.stats.isPass && r.stats.obtained > 0)
        .map((r) => r.stats.obtained)
    )
  ).sort((a, b) => b - a);

  const scoreToRankMap = new Map<number, number>();
  distinctPassingScores.forEach((score, index) => {
    scoreToRankMap.set(score, index + 1);
  });

  const computedRows = baseComputedRows.map((r) => {
    const rank =
      r.stats.isPass && r.stats.obtained > 0
        ? scoreToRankMap.get(r.stats.obtained) ?? null
        : null;
    const positionLabel = rank ? formatOrdinalPosition(rank) : null;
    // Match Image 032: top 3 ranks display "1st", "2nd", "3rd" in the Pass/Fail column, while all ranks are tracked
    const statusOrTopPosition =
      rank && rank <= 3 ? positionLabel! : r.stats.statusUrdu;
    return {
      ...r,
      stats: {
        ...r.stats,
        rank,
        positionLabel,
        statusOrTopPosition,
      },
    };
  });

  const passedCount = computedRows.filter((r) => r.stats.isPass).length;
  const failedCount = computedRows.length - passedCount;
  const avgPct =
    computedRows.length > 0
      ? ((passedCount / Math.max(1, passedCount + (failedCount > 0 ? 3 : 0))) * 100).toFixed(2)
      : '0.00';
  // Calculate actual class pass percentage or average marks percentage
  const passRatePct =
    computedRows.length > 0
      ? (
          computedRows
            .filter((r) => r.stats.isPass)
            .reduce((acc, r) => acc + r.stats.pct, 0) / Math.max(1, passedCount)
        ).toFixed(2)
      : avgPct;

  // Group Position Holders for 1st, 2nd, and 3rd (supporting ties just like Image 032: "محمد ریحان / محمد عثمان")
  const positionHolderGroups = [1, 2, 3].map((rankNum) => {
    const holders = computedRows.filter((r) => r.stats.rank === rankNum);
    const label = formatOrdinalPosition(rankNum);
    const combinedNames = holders.map((h) => h.nameUrdu).join(' / ');
    const combinedRolls = holders.map((h) => h.rollNo).join(', ');
    const marks = holders.length > 0 ? holders[0].stats.obtainedDisplay : '—';
    const pct = holders.length > 0 ? `${holders[0].stats.pctDisplay}%` : '—';
    const grade = holders.length > 0 ? holders[0].stats.grade : '—';
    return {
      rankNum,
      label,
      holders,
      combinedNames: holders.length > 0 ? combinedNames : '—',
      combinedRolls: holders.length > 0 ? combinedRolls : '—',
      marks,
      pct,
      grade,
    };
  });

  const rightColumnRows = computedRows.slice(0, 30);
  const leftOverflowRows = computedRows.slice(30);

  const getRowHighlightStyle = (rank: number | null, isPass: boolean) => {
    if (!isPass) {
      return {
        rowBg: '#ffff00',
        statusBg: '#ffff00',
        statusColor: '#000000',
      };
    }
    if (rank === 1) {
      return {
        rowBg: '#00b050',
        statusBg: '#00b050',
        statusColor: '#ffffff',
      };
    }
    if (rank === 2) {
      return {
        rowBg: '#00b0f0',
        statusBg: '#00b0f0',
        statusColor: '#ffffff',
      };
    }
    if (rank === 3) {
      return {
        rowBg: '#e6005c',
        statusBg: '#e6005c',
        statusColor: '#ffffff',
      };
    }
    return {
      rowBg: '#ffffff',
      statusBg: '#ffffff',
      statusColor: '#0f172a',
    };
  };

  /**
   * Builds standalone HTML for Print Preview, Direct Print, Save PDF, Save DOC, and Save XLS
   * so all outputs match Image 032 100%.
   */
  const buildAwardListStandaloneHtml = (): string => {
    const renderTableRowsHtml = (list: typeof computedRows) =>
      list
        .map((r) => {
          const hl = getRowHighlightStyle(r.stats.rank, r.stats.isPass);
          const isTop3 = r.stats.rank !== null && r.stats.rank <= 3;
          const textColor = isTop3 ? '#ffffff' : '#0f172a';
          return `
        <tr style="background:${hl.rowBg};color:${textColor};">
          <td style="border:1.5px solid #1e293b;padding:3px 5px;text-align:center;font-weight:900;background:${isTop3 ? hl.rowBg : r.stats.isPass ? '#ffffff' : '#ffff00'};color:${textColor};">${r.stats.obtainedDisplay}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 5px;text-align:center;font-weight:800;background:#e6005c;color:#ffffff;">${r.maxMarks || sheet.totalMaxMarks}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 5px;text-align:center;font-weight:900;background:${hl.statusBg};color:${hl.statusColor};font-family:'Jameel Noori Nastaleeq',sans-serif;">${r.stats.statusOrTopPosition}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:800;color:${textColor};">${r.stats.pctDisplay}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:800;color:${textColor};">${r.stats.grade}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.ul}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.ml}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.el}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.urdu}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.math}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 4px;text-align:center;font-weight:700;color:${textColor};">${r.eng}</td>
          <td class="urdu-text" style="border:1.5px solid #1e293b;padding:3px 8px;text-align:right;font-weight:800;font-family:'Jameel Noori Nastaleeq',serif;font-size:13px;direction:rtl;color:${textColor};">${r.nameUrdu}</td>
          <td style="border:1.5px solid #1e293b;padding:3px 5px;text-align:center;font-weight:900;color:${textColor};">${r.rollNo}</td>
        </tr>`;
        })
        .join('');

    const tableHeaderHtml = `
      <thead>
        <tr style="background:${sheet.tableHeaderColor};color:#ffffff;font-size:11px;">
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">ٹوٹل نمبر</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">ٹوٹل نمبر</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">پاس/فیل</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#00b050;">%</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#0284c7;">Grade</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#00b050;">${sheet.subjectUlLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;">${sheet.subjectMlLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#0284c7;">${sheet.subjectElLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#00b050;font-family:'Jameel Noori Nastaleeq',serif;">${sheet.subjectUrduLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">${sheet.subjectMathLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#0284c7;font-family:'Jameel Noori Nastaleeq',serif;">${sheet.subjectEngLabel}</th>
          <th style="border:1.5px solid #0f172a;padding:5px 8px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">نام</th>
          <th style="border:1.5px solid #0f172a;padding:5px 4px;text-align:center;color:#ffffff;background:#e6005c;font-family:'Jameel Noori Nastaleeq',serif;">رول نمبر</th>
        </tr>
      </thead>`;

    const posRowColors = ['#00b050', '#00b0f0', '#e6005c'];
    const posRowsHtml = positionHolderGroups
      .map((grp, i) => {
        const bg = posRowColors[i] || '#16a34a';
        return `
        <tr>
          <td style="border:1.5px solid #1e293b;padding:6px 8px;font-weight:900;background:#ffffff;color:${bg};text-align:center;font-size:15px;">${grp.label}</td>
          <td class="urdu-text" style="border:1.5px solid #1e293b;padding:6px 10px;text-align:center;font-weight:800;background:${bg};color:#ffffff;font-family:'Jameel Noori Nastaleeq',serif;font-size:16px;direction:rtl;">${grp.combinedNames}</td>
          <td style="border:1.5px solid #1e293b;padding:6px 8px;text-align:center;font-weight:900;background:${bg};color:#ffffff;font-size:15px;">${grp.marks}</td>
        </tr>`;
      })
      .join('');

    return `<div data-standalone-doc="true" style="max-width:1080px;margin:0 auto;border:3px solid #0f172a;padding:12px;background:#ffffff;font-family:'Plus Jakarta Sans','Jameel Noori Nastaleeq',sans-serif;color:#0f172a;">
      <!-- Top Banner Header matching Image 032 -->
      <table style="width:100%;border:none;border-collapse:collapse;margin-bottom:8px;">
        <tr style="background:transparent;">
          <td style="width:120px;border:none;text-align:center;vertical-align:middle;">
            <img src="/assets/aistudio/image_031.svg" alt="GPS Chambai Crest" style="width:105px;height:105px;object-fit:contain;" />
          </td>
          <td style="border:none;text-align:center;vertical-align:middle;padding:0 8px;">
            <div style="display:inline-block;background:${sheet.bannerColor};color:#ffffff;font-size:22px;font-weight:900;padding:5px 26px;border-radius:6px;letter-spacing:0.03em;">
              ${sheet.schoolBannerTitle}
            </div>
            <div style="font-size:16px;font-weight:900;color:${sheet.bannerColor};margin:4px 0;">
              ${sheet.subtitle}
            </div>
            <div style="font-size:18px;font-weight:900;color:${sheet.bannerColor};margin-bottom:6px;">
              <span style="color:#0f172a;font-size:14px;margin-right:10px;">${sheet.teacherLabel}</span>
              <span>${sheet.teacherName}</span>
            </div>
            <table style="width:100%;border-collapse:collapse;border:2px solid #0f172a;font-size:12px;">
              <tr style="background:${sheet.headerGreenColor};color:#ffffff;">
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:800;color:#ffffff;">Class: <strong>${sheet.className}</strong></td>
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:800;color:#ffffff;">Students: <strong>${sheet.totalStudentsLabel}</strong></td>
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:800;color:#ffffff;">Examination: <strong>${sheet.examinationSession}</strong></td>
              </tr>
              <tr style="background:#dcfce7;color:#064e3b;">
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:900;text-align:center;">${sheet.termLabel}</td>
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:900;text-align:center;">Total Marks: ${sheet.totalMaxMarks}</td>
                <td style="border:1.5px solid #0f172a;padding:4px 8px;font-weight:900;text-align:center;">Pass Marks: ${sheet.passMarks}</td>
              </tr>
            </table>
          </td>
          <td style="width:120px;border:none;text-align:center;vertical-align:middle;">
            <img src="/assets/aistudio/20260903_200547_79893d25.png" alt="KPESED Logo" style="width:98px;height:98px;object-fit:contain;border-radius:12px;border:2px solid ${sheet.headerGreenColor};padding:2px;" />
          </td>
        </tr>
      </table>

      <!-- Two-Column Split Layout matching Image 032 -->
      <table style="width:100%;border:none;border-collapse:collapse;">
        <tr style="background:transparent;">
          <!-- Left Column: Overflow Rows (31-38) + Crest Emblem + Summary + Position Holders + Sign & Seal -->
          <td style="width:48%;vertical-align:top;border:none;padding-right:8px;">
            ${
              leftOverflowRows.length > 0
                ? `<table style="width:100%;border-collapse:collapse;font-size:11px;margin-bottom:10px;">
                    ${tableHeaderHtml}
                    <tbody>${renderTableRowsHtml(leftOverflowRows)}</tbody>
                  </table>`
                : ''
            }

            <!-- Center-Left School Emblem Box matching Image 032 -->
            <div style="border:2px solid #0f172a;padding:10px;text-align:center;background:#ffffff;margin-bottom:10px;">
              <div style="background:${sheet.bannerColor};padding:10px;border-radius:4px;">
                <img src="/assets/aistudio/image_031.svg" alt="GPSCK Emblem" style="width:150px;height:150px;object-fit:contain;display:block;margin:0 auto;background:#ffffff;border-radius:50%;padding:6px;" />
              </div>
              <div style="font-size:32px;font-weight:900;color:#0f172a;letter-spacing:0.12em;margin-top:4px;">${sheet.emblemAcronym}</div>
              <div class="urdu-text" style="color:${sheet.bannerColor};font-family:'Jameel Noori Nastaleeq',serif;font-size:18px;font-weight:700;direction:rtl;margin:2px 0;">
                ${sheet.emblemSloganUrdu}
              </div>
              <div style="font-size:13px;font-weight:800;color:#0f172a;margin-top:2px;">
                ${sheet.emblemSchoolLine}
              </div>
            </div>

            <!-- Urdu Summary Stats Box matching Image 032 -->
            <table style="width:100%;border-collapse:collapse;border:2px solid #0f172a;margin-bottom:10px;font-family:'Jameel Noori Nastaleeq',serif;direction:rtl;font-size:14px;">
              <tr style="background:#f8fafc;">
                <td style="border:1.5px solid #0f172a;padding:5px 10px;font-weight:800;text-align:right;color:#15803d;">اوسط : <strong>${passRatePct}%</strong></td>
                <td style="border:1.5px solid #0f172a;padding:5px 10px;font-weight:800;text-align:right;">${sheet.inchargeLabelUrdu}</td>
              </tr>
              <tr style="background:#ffffff;">
                <td style="border:1.5px solid #0f172a;padding:5px 10px;font-weight:800;text-align:right;color:#dc2626;">فیل طلباء : <strong>${failedCount}</strong></td>
                <td style="border:1.5px solid #0f172a;padding:5px 10px;font-weight:800;text-align:right;color:#15803d;">پاس طلباء : <strong>${passedCount}</strong></td>
              </tr>
            </table>

            <!-- Position Holder Students Table matching Image 032 -->
            <div style="border:2px solid #0f172a;margin-bottom:10px;">
              <div style="background:${sheet.bannerColor};color:#ffffff;text-align:center;font-weight:900;font-size:14px;padding:5px;">
                Position Holder Students
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:12px;margin:0;">
                <thead>
                  <tr style="background:#f8fafc;color:#0f172a;">
                    <th style="border:1px solid #0f172a;padding:4px;text-align:center;">Position</th>
                    <th style="border:1px solid #0f172a;padding:4px;text-align:center;">Student Name</th>
                    <th style="border:1px solid #0f172a;padding:4px;text-align:center;">Marks</th>
                  </tr>
                </thead>
                <tbody>
                  ${posRowsHtml}
                </tbody>
              </table>
            </div>

            <!-- Head Teacher Sign and Seal Box matching Image 032 -->
            <div style="border:2px solid #0f172a;padding:8px 12px;background:#ffffff;text-align:center;">
              <div style="font-size:13px;font-weight:900;color:#0f172a;">${sheet.headTeacherTitle}</div>
              <div style="font-size:13.5px;font-weight:900;color:#1d4ed8;">${sheet.headTeacherName}</div>
              <div style="display:flex;align-items:center;justify-content:space-around;margin-top:6px;">
                <img src="/assets/aistudio/image_020_a379be76.png" alt="Official Stamp" style="height:48px;object-fit:contain;" />
                <div>
                  <img src="/assets/aistudio/image_021_491fb5ac.png" alt="Headmaster Sign" style="height:40px;object-fit:contain;display:block;margin:0 auto;" />
                  <div style="font-size:11px;font-weight:800;color:${sheet.bannerColor};">${sheet.signSealLabel} • ${sheet.designationLabel}</div>
                </div>
              </div>
            </div>
          </td>

          <!-- Right Column: Main Rows (Roll #1 to #30) -->
          <td style="width:52%;vertical-align:top;border:none;">
            <table style="width:100%;border-collapse:collapse;font-size:11px;margin:0;">
              ${tableHeaderHtml}
              <tbody>
                ${renderTableRowsHtml(rightColumnRows)}
              </tbody>
            </table>
          </td>
        </tr>
      </table>
    </div>`;
  };

  const handlePrintPreview = () => {
    printHtmlDocument(
      `Award_List_${sheet.className}_${sheet.examinationSession}`,
      buildAwardListStandaloneHtml(),
      'portrait',
      false,
      'GPS Chambai/Results/Award List'
    );
  };

  const handleDirectPrint = () => {
    const fullHtml = buildOfficialPrintHtml(
      `Award_List_${sheet.className}_${sheet.examinationSession}`,
      buildAwardListStandaloneHtml(),
      'portrait',
      false
    );
    executeIframePrint(fullHtml, `Award_List_${sheet.className}`);
  };

  const handleSavePdf = async () => {
    setIsExporting(true);
    try {
      const res = await exportVisualHtmlToPdf(
        `Award_List_${sheet.className}_${sheet.examinationSession}`,
        buildAwardListStandaloneHtml(),
        {
          orientation: 'portrait',
          includeHeader: false,
          subFolder: 'GPS Chambai/Results/Award List',
          moduleName: 'Results & DMC Module',
        }
      );
      notify(`Saved Award List PDF (${res.filename}) to ${res.folderPath}`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSaveDoc = () => {
    const res = exportAndSaveWordDoc(
      `Award_List_${sheet.className}_${sheet.examinationSession}`,
      buildAwardListStandaloneHtml(),
      {
        includeHeader: false,
        folderSubPath: 'Results/Award List',
        moduleSource: 'Results & DMC Module',
      }
    );
    notify(`Saved Award List DOC (${res.filename}) to ${res.folderPath}`);
  };

  const handleSaveXls = () => {
    const res = exportAndSaveExcelXls(
      `Award_List_${sheet.className}_${sheet.examinationSession}`,
      buildAwardListStandaloneHtml(),
      'GPS Chambai/Results/Award List',
      'Results & DMC Module'
    );
    notify(`Saved Award List XLS (${res.filename}) to ${res.folderPath}`);
  };

  const handleSaveJpg = async () => {
    setIsExporting(true);
    try {
      const res = await exportVisualHtmlToJpg(
        `Award_List_${sheet.className}_${sheet.examinationSession}`,
        buildAwardListStandaloneHtml(),
        {
          orientation: 'portrait',
          includeHeader: false,
          subFolder: 'GPS Chambai/Results/Award List',
          moduleName: 'Results & DMC Module',
        }
      );
      notify(`Saved High-Res Award List JPG (${res.filename}) to ${res.folderPath}`);
    } finally {
      setIsExporting(false);
    }
  };

  const renderEditableTableSection = (rowsSlice: typeof computedRows) => (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse border-2 border-slate-900 text-[11px]">
        <thead>
          <tr
            style={{ backgroundColor: sheet.tableHeaderColor }}
            className="text-white font-black text-center"
          >
            <th className="border border-slate-900 px-1 py-1.5 font-urdu bg-pink-600">
              ٹوٹل نمبر
            </th>
            <th className="border border-slate-900 px-1 py-1.5 font-urdu bg-pink-600">
              ٹوٹل نمبر
            </th>
            <th className="border border-slate-900 px-1 py-1.5 font-urdu bg-pink-600">
              پاس/فیل
            </th>
            <th className="border border-slate-900 px-1 py-1.5 bg-emerald-600">%</th>
            <th className="border border-slate-900 px-1 py-1.5 bg-sky-600">Grade</th>
            <th className="border border-slate-900 p-0.5 bg-emerald-600">
              <input
                type="text"
                value={sheet.subjectUlLabel}
                onChange={(e) => updateField('subjectUlLabel', e.target.value)}
                className="w-9 text-center font-black text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 p-0.5 bg-pink-600">
              <input
                type="text"
                value={sheet.subjectMlLabel}
                onChange={(e) => updateField('subjectMlLabel', e.target.value)}
                className="w-9 text-center font-black text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 p-0.5 bg-sky-600">
              <input
                type="text"
                value={sheet.subjectElLabel}
                onChange={(e) => updateField('subjectElLabel', e.target.value)}
                className="w-9 text-center font-black text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 p-0.5 font-urdu bg-emerald-600">
              <input
                type="text"
                dir="rtl"
                value={sheet.subjectUrduLabel}
                onChange={(e) => updateField('subjectUrduLabel', e.target.value)}
                className="w-10 text-center font-urdu font-bold text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 p-0.5 font-urdu bg-pink-600">
              <input
                type="text"
                dir="rtl"
                value={sheet.subjectMathLabel}
                onChange={(e) => updateField('subjectMathLabel', e.target.value)}
                className="w-10 text-center font-urdu font-bold text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 p-0.5 font-urdu bg-sky-600">
              <input
                type="text"
                dir="rtl"
                value={sheet.subjectEngLabel}
                onChange={(e) => updateField('subjectEngLabel', e.target.value)}
                className="w-11 text-center font-urdu font-bold text-white bg-transparent outline-none focus:bg-white/20 rounded"
                title="Edit Subject Heading"
              />
            </th>
            <th className="border border-slate-900 px-2 py-1.5 text-center font-urdu bg-pink-600 min-w-[105px]">
              نام
            </th>
            <th className="border border-slate-900 px-1 py-1.5 font-urdu bg-pink-600">
              رول نمبر
            </th>
            <th className="border border-slate-900 px-1 py-1.5 no-print">×</th>
          </tr>
        </thead>
        <tbody>
          {rowsSlice.map((row, idx) => {
            const isTop1 = row.stats.rank === 1;
            const isTop2 = row.stats.rank === 2;
            const isTop3 = row.stats.rank === 3;
            const isFail = !row.stats.isPass;

            const rowBgClass = isTop1
              ? 'bg-emerald-600 text-white'
              : isTop2
                ? 'bg-sky-500 text-white'
                : isTop3
                  ? 'bg-pink-600 text-white'
                  : isFail
                    ? 'bg-yellow-300 text-slate-950'
                    : idx % 2 === 0
                      ? 'bg-white text-slate-900'
                      : 'bg-slate-50 text-slate-900';

            return (
              <tr key={row.id} className={rowBgClass}>
                {/* Editable or Auto-Calculated Obtained Marks */}
                <td className="border border-slate-800 p-0.5 text-center font-black">
                  <input
                    type="number"
                    value={row.stats.obtained}
                    onChange={(e) =>
                      updateRowField(row.id, 'obtainedOverride', e.target.value)
                    }
                    title="Auto-calculated from subjects (or click to override)"
                    className="w-10 text-center font-black bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                {/* Editable Total Max Marks */}
                <td className="border border-slate-800 px-1 py-0.5 text-center bg-pink-600 text-white">
                  <input
                    type="number"
                    value={row.maxMarks || sheet.totalMaxMarks}
                    onChange={(e) =>
                      updateRowField(row.id, 'maxMarks', Number(e.target.value) || 414)
                    }
                    className="w-10 text-center font-bold bg-transparent text-white focus:bg-white focus:text-slate-950 outline-none rounded"
                  />
                </td>
                {/* Automatic Pass/Fail or Top Position (1st, 2nd, 3rd) */}
                <td
                  className="border border-slate-800 px-1 py-0.5 text-center font-black font-urdu"
                  title={
                    row.stats.positionLabel
                      ? `Class Position: ${row.stats.positionLabel} (${row.stats.statusUrdu})`
                      : row.stats.statusUrdu
                  }
                >
                  {row.stats.statusOrTopPosition}
                </td>
                {/* Automatic Percentage */}
                <td className="border border-slate-800 px-1 py-0.5 text-center font-black">
                  {row.stats.pctDisplay}
                </td>
                {/* Automatic Grade */}
                <td className="border border-slate-800 px-1 py-0.5 text-center font-black">
                  {row.stats.grade}
                </td>
                {/* Editable Subject Marks */}
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.ul}
                    onChange={(e) => updateRowField(row.id, 'ul', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.ml}
                    onChange={(e) => updateRowField(row.id, 'ml', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.el}
                    onChange={(e) => updateRowField(row.id, 'el', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.urdu}
                    onChange={(e) => updateRowField(row.id, 'urdu', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.math}
                    onChange={(e) => updateRowField(row.id, 'math', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center">
                  <input
                    type="text"
                    value={row.eng}
                    onChange={(e) => updateRowField(row.id, 'eng', e.target.value)}
                    className="w-8 text-center font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 px-1.5 py-0.5 text-right" dir="rtl">
                  <input
                    type="text"
                    dir="rtl"
                    value={row.nameUrdu}
                    onChange={(e) => updateRowField(row.id, 'nameUrdu', e.target.value)}
                    className="w-full text-right font-urdu text-sm font-bold bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center font-black">
                  <input
                    type="number"
                    value={row.rollNo}
                    onChange={(e) =>
                      updateRowField(row.id, 'rollNo', Number(e.target.value) || 1)
                    }
                    className="w-7 text-center font-black bg-transparent focus:bg-amber-100 focus:text-slate-950 outline-none rounded"
                  />
                </td>
                <td className="border border-slate-800 p-0.5 text-center no-print">
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(row.id)}
                    className="text-rose-500 hover:text-rose-700 bg-white/90 rounded p-0.5"
                    title="Delete Student Row"
                  >
                    <Trash2 size={12} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Top Action & Export Bar */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <Award size={18} className="text-amber-400" />
              <span>3rd Result Card — Fully Editable Award List &amp; Auto Position Holders (Image 032)</span>
            </h3>
            <p className="text-xs text-emerald-300 font-semibold">
              All student details, subject names, and marks are editable. Total marks, %, Grade, Pass/Fail &amp; 1st/2nd/3rd Position Holders calculate automatically!
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrintPreview}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Eye size={14} />
              <span>Print Preview</span>
            </button>
            <button
              type="button"
              onClick={handleDirectPrint}
              className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Printer size={14} />
              <span>Direct Print</span>
            </button>
            <button
              type="button"
              onClick={handleSavePdf}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Download size={14} />
              <span>Save PDF</span>
            </button>
            <button
              type="button"
              onClick={handleSaveXls}
              className="px-3 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <Table size={14} />
              <span>Save XLS</span>
            </button>
            <button
              type="button"
              onClick={handleSaveDoc}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet size={14} />
              <span>Save DOC</span>
            </button>
            <button
              type="button"
              onClick={handleSaveJpg}
              disabled={isExporting}
              className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
            >
              <ImageIcon size={14} />
              <span>Save JPG</span>
            </button>
          </div>
        </div>

        {/* Color-Changing Pickers (No raw hex codes displayed!) & Row Management Controls */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-black text-amber-300 flex items-center gap-1">
              <Palette size={14} />
              <span>Color Theme:</span>
            </span>
            <select
              onChange={(e) => {
                const preset = COLOR_THEME_PRESETS[Number(e.target.value)];
                if (preset) {
                  setSheet((prev) => ({
                    ...prev,
                    bannerColor: preset.bannerColor,
                    headerGreenColor: preset.headerGreenColor,
                    tableHeaderColor: preset.tableHeaderColor,
                    accentBlueColor: preset.accentBlueColor,
                  }));
                }
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold border border-slate-700 text-xs"
            >
              {COLOR_THEME_PRESETS.map((p, i) => (
                <option key={p.name} value={i}>
                  {p.name}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer">
              <span className="font-bold text-slate-200">Banner Color</span>
              <input
                type="color"
                value={sheet.bannerColor}
                onChange={(e) => updateField('bannerColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
            </label>

            <label className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer">
              <span className="font-bold text-slate-200">Header Color</span>
              <input
                type="color"
                value={sheet.headerGreenColor}
                onChange={(e) => updateField('headerGreenColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
            </label>

            <label className="flex items-center gap-1.5 bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-700 cursor-pointer">
              <span className="font-bold text-slate-200">Table Color</span>
              <input
                type="color"
                value={sheet.tableHeaderColor}
                onChange={(e) => updateField('tableHeaderColor', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
              />
            </label>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-white font-bold border border-slate-700 text-xs"
            >
              <option value="">All School Classes</option>
              <option value="KG">KG (ECE)</option>
              <option value="1st">Class 1st</option>
              <option value="2nd">Class 2nd</option>
              <option value="3rd">Class 3rd</option>
              <option value="4th">Class 4th</option>
              <option value="5th">Class 5th</option>
            </select>
            <button
              type="button"
              onClick={handleLoadFromSchoolStudents}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black flex items-center gap-1"
            >
              <Users size={13} />
              <span>Load Class Students</span>
            </button>
            <button
              type="button"
              onClick={handleAddRow}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center gap-1"
            >
              <Plus size={13} />
              <span>Add Student Row</span>
            </button>
            <button
              type="button"
              onClick={() => {
                localStorage.setItem(STORAGE_KEY_AWARD_LIST, JSON.stringify(sheet));
                notify('Award List & Position Holders saved successfully!');
              }}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black flex items-center gap-1"
            >
              <Save size={13} />
              <span>Save</span>
            </button>
            <button
              type="button"
              onClick={handleResetToImage032}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 border border-slate-700"
            >
              <RotateCcw size={13} />
              <span>Reset Default</span>
            </button>
          </div>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Interactive Editable Award List Sheet (Exact Image 032 Layout) */}
      <div
        ref={sheetRef}
        className="bg-white border-4 border-slate-900 rounded-2xl p-3 sm:p-5 shadow-xl space-y-4 overflow-x-auto"
      >
        {/* Top Header Row: Left Image 031 Crest + Center Magenta Banner & Green Meta Table + Right KPESED Logo */}
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-3 border-b-2 border-slate-900 pb-3">
          {/* Left Crest Logo (Image 031) */}
          <div className="lg:col-span-2 flex justify-center">
            <img
              src="/assets/aistudio/image_031.svg"
              alt="GPS Chambai Crest"
              className="w-28 h-28 object-contain"
            />
          </div>

          {/* Center Editable Banner & Class Info Table */}
          <div className="lg:col-span-8 text-center space-y-2">
            <div className="flex justify-center">
              <input
                type="text"
                value={sheet.schoolBannerTitle}
                onChange={(e) => updateField('schoolBannerTitle', e.target.value)}
                style={{ backgroundColor: sheet.bannerColor }}
                className="text-white text-lg sm:text-2xl font-black text-center px-6 py-1.5 rounded-xl border-2 border-slate-900 shadow-sm w-full max-w-xl outline-none"
              />
            </div>

            <div className="flex justify-center">
              <input
                type="text"
                value={sheet.subtitle}
                onChange={(e) => updateField('subtitle', e.target.value)}
                style={{ color: sheet.bannerColor }}
                className="text-base sm:text-lg font-black text-center bg-transparent outline-none focus:bg-amber-50 rounded px-3"
              />
            </div>

            <div className="inline-flex items-center border-2 border-slate-900 rounded-xl overflow-hidden">
              <input
                type="text"
                value={sheet.teacherLabel}
                onChange={(e) => updateField('teacherLabel', e.target.value)}
                style={{ backgroundColor: sheet.headerGreenColor }}
                className="text-white font-black text-xs sm:text-sm px-3 py-1 w-24 text-center outline-none"
              />
              <input
                type="text"
                value={sheet.teacherName}
                onChange={(e) => updateField('teacherName', e.target.value)}
                style={{ color: sheet.bannerColor }}
                className="bg-white font-black text-xs sm:text-sm px-4 py-1 w-52 text-center outline-none focus:bg-amber-50"
              />
            </div>

            {/* Editable 2-Row Green Class Info Table */}
            <table className="w-full border-collapse border-2 border-slate-900 text-xs">
              <tbody>
                <tr
                  style={{ backgroundColor: sheet.headerGreenColor }}
                  className="text-white font-black"
                >
                  <td className="border border-slate-900 px-2 py-1.5">
                    <span>Class: </span>
                    <input
                      type="text"
                      value={sheet.className}
                      onChange={(e) => updateField('className', e.target.value)}
                      className="bg-white/20 text-white font-black px-2 py-0.5 rounded w-24 text-center outline-none"
                    />
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5">
                    <span>Students: </span>
                    <input
                      type="text"
                      value={sheet.totalStudentsLabel}
                      onChange={(e) => updateField('totalStudentsLabel', e.target.value)}
                      className="bg-white/20 text-white font-black px-2 py-0.5 rounded w-16 text-center outline-none"
                    />
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5">
                    <span>Examination: </span>
                    <input
                      type="text"
                      value={sheet.examinationSession}
                      onChange={(e) => updateField('examinationSession', e.target.value)}
                      className="bg-white/20 text-white font-black px-2 py-0.5 rounded w-24 text-center outline-none"
                    />
                  </td>
                </tr>
                <tr className="bg-emerald-100 text-emerald-950 font-black">
                  <td className="border border-slate-900 px-2 py-1.5 text-center">
                    <input
                      type="text"
                      value={sheet.termLabel}
                      onChange={(e) => updateField('termLabel', e.target.value)}
                      className="bg-transparent font-black text-center w-28 outline-none focus:bg-white rounded"
                    />
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center">
                    <span>Total Marks: </span>
                    <input
                      type="number"
                      value={sheet.totalMaxMarks}
                      onChange={(e) =>
                        updateField('totalMaxMarks', Number(e.target.value) || 414)
                      }
                      className="bg-transparent font-black text-center w-16 outline-none focus:bg-white rounded"
                    />
                  </td>
                  <td className="border border-slate-900 px-2 py-1.5 text-center">
                    <span>Pass Marks: </span>
                    <input
                      type="number"
                      value={sheet.passMarks}
                      onChange={(e) =>
                        updateField('passMarks', Number(e.target.value) || 130)
                      }
                      className="bg-transparent font-black text-center w-16 outline-none focus:bg-white rounded"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right KPESED Official Logo */}
          <div className="lg:col-span-2 flex justify-center">
            <img
              src="/assets/aistudio/20260903_200547_79893d25.png"
              alt="KPESED Logo"
              className="w-24 h-24 object-contain rounded-2xl border-2 border-emerald-700 p-1"
            />
          </div>
        </div>

        {/* Main Split Grid: Left (Overflow Roll 31-38 + Crest + Urdu Summary + Position Holders + Sign/Seal) | Right (Roll 1-30) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          {/* Left Column (6 cols on lg) */}
          <div className="lg:col-span-6 space-y-3">
            {leftOverflowRows.length > 0 && renderEditableTableSection(leftOverflowRows)}

            {/* Center-Left Emblem Panel matching Image 032 */}
            <div className="border-2 border-slate-900 rounded-2xl p-4 text-center bg-white space-y-1.5 shadow-xs">
              <div
                style={{ backgroundColor: sheet.bannerColor }}
                className="p-3 rounded-xl flex justify-center"
              >
                <img
                  src="/assets/aistudio/image_031.svg"
                  alt="GPS Chambai Crest"
                  className="w-36 h-36 object-contain bg-white rounded-full p-2 shadow-sm"
                />
              </div>
              <input
                type="text"
                value={sheet.emblemAcronym}
                onChange={(e) => updateField('emblemAcronym', e.target.value)}
                className="text-3xl font-black text-slate-950 tracking-widest text-center w-full bg-transparent outline-none focus:bg-amber-50 rounded"
              />
              <div className="flex justify-center">
                <input
                  type="text"
                  dir="rtl"
                  value={sheet.emblemSloganUrdu}
                  onChange={(e) => updateField('emblemSloganUrdu', e.target.value)}
                  style={{ color: sheet.bannerColor }}
                  className="font-urdu text-lg font-bold px-6 py-0.5 text-center outline-none w-full max-w-xs bg-transparent focus:bg-amber-50 rounded"
                />
              </div>
              <input
                type="text"
                value={sheet.emblemSchoolLine}
                onChange={(e) => updateField('emblemSchoolLine', e.target.value)}
                className="text-xs sm:text-sm font-black text-slate-900 text-center w-full bg-transparent outline-none focus:bg-amber-50 rounded"
              />
            </div>

            {/* Editable Urdu Summary Table matching Image 032 */}
            <table
              dir="rtl"
              className="w-full border-collapse border-2 border-slate-900 font-urdu text-base"
            >
              <tbody>
                <tr className="bg-slate-50">
                  <td className="border border-slate-900 px-3 py-1.5 font-bold">
                    <input
                      type="text"
                      dir="rtl"
                      value={sheet.inchargeLabelUrdu}
                      onChange={(e) => updateField('inchargeLabelUrdu', e.target.value)}
                      className="w-full bg-transparent font-urdu font-bold text-right outline-none focus:bg-amber-50"
                    />
                  </td>
                  <td className="border border-slate-900 px-3 py-1.5 font-bold text-right text-emerald-700">
                    اوسط : <span className="font-sans font-black">{passRatePct}%</span>
                  </td>
                </tr>
                <tr className="bg-white">
                  <td className="border border-slate-900 px-3 py-1.5 font-bold text-emerald-700 text-right">
                    پاس طلباء : <span className="font-sans font-black">{passedCount}</span>
                  </td>
                  <td className="border border-slate-900 px-3 py-1.5 font-bold text-rose-600 text-right">
                    فیل طلباء : <span className="font-sans font-black">{failedCount}</span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Automatic Position Holder Students Table matching Image 032 */}
            <div className="border-2 border-slate-900 rounded-xl overflow-hidden">
              <div
                style={{ backgroundColor: sheet.bannerColor }}
                className="text-white text-center font-black text-xs sm:text-sm py-1.5"
              >
                Position Holder Students
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-black">
                    <th className="border border-slate-900 px-2 py-1 text-center">Position</th>
                    <th className="border border-slate-900 px-2 py-1 text-center">Student Name</th>
                    <th className="border border-slate-900 px-2 py-1 text-center">Marks</th>
                    <th className="border border-slate-900 px-2 py-1 text-center">% / Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {positionHolderGroups.map((grp, i) => {
                    const rowColorClass =
                      i === 0
                        ? 'bg-emerald-600 text-white'
                        : i === 1
                          ? 'bg-sky-500 text-white'
                          : 'bg-pink-600 text-white';
                    const posTextColorClass =
                      i === 0
                        ? 'text-emerald-700'
                        : i === 1
                          ? 'text-sky-600'
                          : 'text-pink-600';
                    return (
                      <tr key={grp.label} className={rowColorClass}>
                        <td
                          className={`border border-slate-900 px-2 py-1.5 text-center font-black text-sm bg-white ${posTextColorClass}`}
                        >
                          {grp.label}
                        </td>
                        <td
                          dir="rtl"
                          className="border border-slate-900 px-3 py-1.5 text-center font-urdu font-bold text-base"
                        >
                          {grp.combinedNames}
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-black text-sm">
                          {grp.marks}
                        </td>
                        <td className="border border-slate-900 px-2 py-1.5 text-center font-black text-xs">
                          {grp.pct} ({grp.grade})
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Editable Head Teacher Sign & Seal Box matching Image 032 */}
            <div className="border-2 border-slate-900 rounded-xl p-3 bg-white text-center space-y-1">
              <input
                type="text"
                value={sheet.headTeacherTitle}
                onChange={(e) => updateField('headTeacherTitle', e.target.value)}
                className="w-full text-center font-black text-xs sm:text-sm text-slate-900 bg-transparent outline-none focus:bg-amber-50 rounded"
              />
              <input
                type="text"
                value={sheet.headTeacherName}
                onChange={(e) => updateField('headTeacherName', e.target.value)}
                className="w-full text-center font-black text-sm text-blue-700 bg-transparent outline-none focus:bg-amber-50 rounded"
              />
              <div className="flex items-center justify-around pt-2">
                <img
                  src="/assets/aistudio/image_020_a379be76.png"
                  alt="Official Stamp"
                  className="h-12 object-contain"
                />
                <div className="text-center">
                  <img
                    src="/assets/aistudio/image_021_491fb5ac.png"
                    alt="Headmaster Signature"
                    className="h-10 object-contain mx-auto"
                  />
                  <div className="flex items-center justify-center gap-1">
                    <input
                      type="text"
                      value={sheet.signSealLabel}
                      onChange={(e) => updateField('signSealLabel', e.target.value)}
                      style={{ color: sheet.bannerColor }}
                      className="w-24 text-center text-[11px] font-bold bg-transparent outline-none"
                    />
                    <input
                      type="text"
                      value={sheet.designationLabel}
                      onChange={(e) => updateField('designationLabel', e.target.value)}
                      style={{ color: sheet.bannerColor }}
                      className="w-14 text-center text-[11px] font-black bg-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Roll #1 to #30 (6 cols on lg) */}
          <div className="lg:col-span-6">
            {renderEditableTableSection(rightColumnRows)}
          </div>
        </div>
      </div>
    </div>
  );
};
