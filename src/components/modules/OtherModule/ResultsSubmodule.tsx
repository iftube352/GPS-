import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Printer,
  Image as ImageIcon,
  Award,
  Trash2,
  X,
  Download,
  CheckCircle2,
  Share2,
  FileText,
  FileSpreadsheet,
  Eye,
  Table,
} from 'lucide-react';
import { ExamResult, Student } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  getClassHexColor,
  getClassMetaByIdOrName,
  getSubjectsForClass,
} from '../../../utils/classColors';
import {
  printHtmlDocument,
  executeIframePrint,
  buildOfficialPrintHtml,
  buildSecondDmcReportCardHtml,
  buildFirstReportCardHtml,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  generateReportCardJpgDataUrl,
  generateSecondDmcReportCardJpgDataUrl,
  generatePdfBlobFromImageDataUrl,
  saveFileToGpsChambaiFolder,
  shareDocumentOrFile,
  numberToWordsEn,
} from '../../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';
import { AwardListImage032View } from './AwardListImage032View';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface SecondDmcEditableState {
  studentName: string;
  fatherName: string;
  className: string;
  session: string;
  termLabel: string;
  rollNo: string;
  remarksText: string;
  subjects: {
    subject: string;
    total: number;
    obtained: number;
  }[];
}

const DEFAULT_NINE_DMC_SUBJECTS = [
  { subject: 'English', total: 100, obtained: 88 },
  { subject: 'Urdu', total: 100, obtained: 91 },
  { subject: 'Mathematics', total: 100, obtained: 94 },
  { subject: 'General Science', total: 100, obtained: 86 },
  { subject: 'Social Studies', total: 100, obtained: 89 },
  { subject: 'Islamiat', total: 100, obtained: 95 },
  { subject: 'Pashto', total: 100, obtained: 90 },
  { subject: 'Nazira Quran / Qirat', total: 100, obtained: 98 },
  { subject: 'Drawing', total: 100, obtained: 92 },
];

export const ResultsSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [activeCardTab, setActiveCardTab] = useState<'first_card' | 'second_dmc' | 'award_list'>('second_dmc');
  const [viewMode, setViewMode] = useViewMode('results_module', 'grid');

  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);
  const [jpgPreviewDataUrl, setJpgPreviewDataUrl] = useState<string | null>(null);
  const [jpgPreviewTitle, setJpgPreviewTitle] = useState<string>('Report Card');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Second Report Card (DMC - Image 017.jpg) Editable State
  const [dmcState, setDmcState] = useState<SecondDmcEditableState>({
    studentName: 'Muhammad Bilal',
    fatherName: 'Abdul Karim',
    className: '5th',
    session: '2025 - 2026',
    termLabel: 'Annual Exam',
    rollNo: '101',
    remarksText: 'Excellent Performance. Promoted to Next Higher Class.',
    subjects: DEFAULT_NINE_DMC_SUBJECTS,
  });

  // Add Result Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [examTerm, setExamTerm] = useState<ExamResult['examTerm']>('Annual');
  const [subjectMarks, setSubjectMarks] = useState<
    { subject: string; total: number; obtained: number }[]
  >([]);

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4500);
  };

  const refresh = () => {
    const res = StorageService.getResults();
    const sts = StorageService.getStudents();
    setResults(res);
    setStudents(sts);
    if (sts.length > 0 && !selectedStudentId) {
      setSelectedStudentId(sts[0].id);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;
    const clsMeta = getClassMetaByIdOrName(st.classId);
    const officialSubjects = getSubjectsForClass(clsMeta.kpSubjectDropdownLabel);
    setSubjectMarks(
      officialSubjects.map((sub) => ({
        subject: sub.english,
        total: 100,
        obtained: 85,
      }))
    );
  }, [selectedStudentId, students]);

  const filteredResults = results.filter(
    (r) => classFilter === 'ALL' || r.classId === classFilter
  );

  // Load any student or result into the Second Report Card (DMC - Image 017)
  const loadResultIntoSecondDmc = (res: ExamResult) => {
    const clsMeta = getClassMetaByIdOrName(res.classId);
    const mergedSubjects = DEFAULT_NINE_DMC_SUBJECTS.map((defSub, idx) => {
      const match =
        res.subjects.find(
          (s) => s.subject.toLowerCase() === defSub.subject.toLowerCase()
        ) || res.subjects[idx];
      return {
        subject: defSub.subject,
        total: match ? Number(match.total || 100) : 100,
        obtained: match ? Number(match.obtained || 85) : 85,
      };
    });

    setDmcState({
      studentName: res.studentName,
      fatherName: res.fatherName,
      className: clsMeta.shortCode,
      session: res.academicYear || '2025 - 2026',
      termLabel: `${res.examTerm} Exam`,
      rollNo: res.rollNo || '1',
      remarksText: `Grade ${res.grade} (${res.percentage}%) — Promoted`,
      subjects: mergedSubjects,
    });
    setActiveCardTab('second_dmc');
  };

  // First Report Card Handlers (Consistent across Print Preview, Direct Print, Save PDF, Save DOC, Save JPG)
  const getFirstReportCardHtmlForResult = (res: ExamResult) => {
    const clsMeta = getClassMetaByIdOrName(res.classId);
    return buildFirstReportCardHtml({
      studentName: res.studentName,
      fatherName: res.fatherName,
      rollNo: res.rollNo,
      className: clsMeta.displayName,
      classHex: clsMeta.hex,
      examTerm: res.examTerm,
      academicYear: res.academicYear,
      subjects: res.subjects,
      totalMarks: res.totalMarks,
      obtainedMarks: res.obtainedMarks,
      percentage: res.percentage,
      grade: res.grade,
      positionInClass: res.positionInClass,
    });
  };

  const handlePrintFirstReportCard = (res: ExamResult) => {
    printHtmlDocument(
      `First Report Card - ${res.studentName} (${res.examTerm})`,
      getFirstReportCardHtmlForResult(res),
      'portrait',
      false,
      'GPS Chambai/Certificates/PDF Result'
    );
  };

  const handleDirectPrintFirstReportCard = (res: ExamResult) => {
    const fullHtml = buildOfficialPrintHtml(
      `First Report Card - ${res.studentName} (${res.examTerm})`,
      getFirstReportCardHtmlForResult(res),
      'portrait',
      false
    );
    executeIframePrint(fullHtml, `First_Report_Card_${res.studentName}`);
  };

  const handleSaveFirstReportCardDoc = (res: ExamResult) => {
    const saved = exportAndSaveWordDoc(
      `First_ReportCard_${res.studentName}_${res.examTerm}`,
      getFirstReportCardHtmlForResult(res),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF Result',
        moduleSource: 'Results Module',
      }
    );
    showToast(`Saved First Report Card DOC (${saved.filename}) to ${saved.folderPath}`);
  };

  const handleSaveFirstReportCardJpg = (res: ExamResult) => {
    const clsMeta = getClassMetaByIdOrName(res.classId);
    const dataUrl = generateReportCardJpgDataUrl({
      studentName: res.studentName,
      fatherName: res.fatherName,
      rollNo: res.rollNo,
      className: clsMeta.displayName,
      classHex: clsMeta.hex,
      examTerm: res.examTerm,
      academicYear: res.academicYear,
      subjects: res.subjects,
      totalMarks: res.totalMarks,
      obtainedMarks: res.obtainedMarks,
      percentage: res.percentage,
      grade: res.grade,
      positionInClass: res.positionInClass,
    });

    setSelectedResult(res);
    setJpgPreviewTitle(`First Report Card — ${res.studentName}`);
    setJpgPreviewDataUrl(dataUrl);

    const safeFile = `First_ReportCard_${res.studentName.replace(/[^a-zA-Z0-9]/g, '_')}_${res.examTerm}.jpg`;
    const saved = saveFileToGpsChambaiFolder(safeFile, dataUrl, 'image/jpeg', {
      folderSubPath: 'Certificates/PDF Result',
      moduleSource: 'Results Module',
    });
    showToast(`Saved First Report Card JPG to ${saved.folderPath}`);
  };

  const handleSaveFirstReportCardPdf = (res: ExamResult) => {
    const saved = exportAndSaveRealPdf(
      `First_ReportCard_${res.studentName}_${res.examTerm}`,
      getFirstReportCardHtmlForResult(res),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF Result',
        moduleSource: 'Results Module',
      }
    );
    showToast(`Saved First Report Card PDF (${saved.filename}) to ${saved.folderPath}`);
  };

  // Second Report Card (DMC - Image 017.jpg with Image 031 Crest Logo) Handlers
  const getSecondDmcInputPayload = () => {
    const totMax = dmcState.subjects.reduce((acc, s) => acc + Number(s.total || 0), 0);
    const totObt = dmcState.subjects.reduce((acc, s) => acc + Number(s.obtained || 0), 0);
    const pct = totMax > 0 ? Math.round((totObt / totMax) * 100) : 0;
    return {
      studentName: dmcState.studentName,
      fatherName: dmcState.fatherName,
      className: dmcState.className,
      academicYear: dmcState.session,
      session: dmcState.session,
      examTerm: dmcState.termLabel,
      termLabel: dmcState.termLabel,
      rollNo: dmcState.rollNo,
      remarks: dmcState.remarksText,
      remarksText: dmcState.remarksText,
      subjects: dmcState.subjects,
      totalMarks: totMax,
      obtainedMarks: totObt,
      percentage: pct,
    };
  };

  const generateCurrentSecondDmcJpg = () => {
    return generateSecondDmcReportCardJpgDataUrl(getSecondDmcInputPayload());
  };

  const handleSaveSecondDmcJpg = () => {
    const dataUrl = generateCurrentSecondDmcJpg();
    setJpgPreviewTitle(`Second Report Card (DMC) — ${dmcState.studentName}`);
    setJpgPreviewDataUrl(dataUrl);
    const safeFile = `Second_DMC_${dmcState.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
    const saved = saveFileToGpsChambaiFolder(safeFile, dataUrl, 'image/jpeg', {
      folderSubPath: 'Certificates/PDF Result',
      moduleSource: 'Results Module (DMC)',
    });
    showToast(`Saved Second Report Card (DMC) JPG to ${saved.folderPath}`);
  };

  const handleSaveSecondDmcPdf = () => {
    const saved = exportAndSaveRealPdf(
      `Second_DMC_${dmcState.studentName}`,
      buildSecondDmcReportCardHtml(getSecondDmcInputPayload()),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF Result',
        moduleSource: 'Results Module (DMC)',
      }
    );
    showToast(`Saved Second Report Card (DMC) PDF (${saved.filename}) to ${saved.folderPath}`);
  };

  const handleSaveSecondDmcDoc = () => {
    const saved = exportAndSaveWordDoc(
      `Second_DMC_${dmcState.studentName}`,
      buildSecondDmcReportCardHtml(getSecondDmcInputPayload()),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF Result',
        moduleSource: 'Results Module (DMC)',
      }
    );
    showToast(`Saved Second Report Card (DMC) DOC (${saved.filename}) to ${saved.folderPath}`);
  };

  const handlePrintSecondDmc = () => {
    printHtmlDocument(
      `Detailed_Marks_Certificate_${dmcState.studentName}`,
      buildSecondDmcReportCardHtml(getSecondDmcInputPayload()),
      'portrait',
      false,
      'GPS Chambai/Certificates/PDF Result'
    );
  };

  const handleDirectPrintSecondDmc = () => {
    const fullHtml = buildOfficialPrintHtml(
      `Detailed_Marks_Certificate_${dmcState.studentName}`,
      buildSecondDmcReportCardHtml(getSecondDmcInputPayload()),
      'portrait',
      false
    );
    executeIframePrint(fullHtml, `Second_DMC_${dmcState.studentName}`);
  };

  const handleShareSecondDmc = async () => {
    const dataUrl = generateCurrentSecondDmcJpg();
    const pdfBlob = generatePdfBlobFromImageDataUrl(dataUrl, false);
    const safeFile = `Second_DMC_${dmcState.studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    await shareDocumentOrFile({
      title: `Detailed Marks Certificate (DMC) — ${dmcState.studentName}`,
      text: `DMC Report Card for ${dmcState.studentName} S/O ${dmcState.fatherName} (${dmcState.className}) — GPS Chambai Kohat (EMIS: 16454)`,
      fileBlob: pdfBlob,
      filename: safeFile,
      mimeType: 'application/pdf',
    });
    showToast('Shared DMC Report Card!');
  };

  const handleCreateResult = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const totalMarks = subjectMarks.reduce((acc, s) => acc + Number(s.total || 100), 0);
    const obtainedMarks = subjectMarks.reduce((acc, s) => acc + Number(s.obtained || 0), 0);
    const percentage = totalMarks > 0 ? Number(((obtainedMarks / totalMarks) * 100).toFixed(1)) : 0;
    const grade: ExamResult['grade'] =
      percentage >= 85
        ? 'A+'
        : percentage >= 75
        ? 'A'
        : percentage >= 65
        ? 'B'
        : percentage >= 50
        ? 'C'
        : 'F';

    const newResult: ExamResult = {
      id: `res-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      fatherName: st.fatherName,
      rollNo: st.rollNo || st.admissionNo,
      classId: st.classId,
      examTerm,
      academicYear: '2025-26',
      subjects: subjectMarks,
      totalMarks,
      obtainedMarks,
      percentage,
      grade,
      positionInClass: 1,
    };

    StorageService.addResult(newResult);
    refresh();
    setShowAddModal(false);
    showToast(`Added Exam Result for ${st.name}!`);
  };

  const dmcGrandTotal = dmcState.subjects.reduce((acc, s) => acc + Number(s.total || 0), 0);
  const dmcGrandObtained = dmcState.subjects.reduce((acc, s) => acc + Number(s.obtained || 0), 0);

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-orange-700 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'نتائج اور رپورٹ کارڈز' : 'Results & DMC Report Cards'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 rounded-xl bg-white text-amber-800 text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Plus size={15} />
            <span>Add Result</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Switcher between Second Report Card (DMC - Image 017), First Report Card List & Award List (Image 032) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 bg-slate-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveCardTab('second_dmc')}
          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
            activeCardTab === 'second_dmc'
              ? 'bg-emerald-800 text-white shadow-xs'
              : 'text-slate-700'
          }`}
        >
          1. Second Report Card (DMC)
        </button>
        <button
          onClick={() => setActiveCardTab('first_card')}
          className={`py-2.5 rounded-xl text-xs font-black transition-all ${
            activeCardTab === 'first_card'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-700'
          }`}
        >
          2. First Report Card &amp; Results ({results.length})
        </button>
        <button
          onClick={() => setActiveCardTab('award_list')}
          className={`py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            activeCardTab === 'award_list'
              ? 'bg-fuchsia-700 text-white shadow-xs'
              : 'text-slate-700'
          }`}
        >
          <Table size={14} />
          <span>3. Award List Result (Image 032)</span>
        </button>
      </div>

      {/* TAB C: EDITABLE AWARD LIST RESULT (IMAGE 032) */}
      {activeCardTab === 'award_list' && (
        <AwardListImage032View students={students} onSaved={showToast} />
      )}

      {/* TAB A: SECOND REPORT CARD (DMC - EXACT IMAGE 017.JPG DESIGNER & LIVE EXPORT) */}
      {activeCardTab === 'second_dmc' && (
        <div className="space-y-4">
          {/* Student Quick Loader & Export Actions */}
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Load Student Into DMC (Or Edit Any Field Directly Below):
              </label>
              <select
                onChange={(e) => {
                  const st = students.find((s) => s.id === e.target.value);
                  if (st) {
                    const existingRes = results.find((r) => r.studentId === st.id);
                    if (existingRes) {
                      loadResultIntoSecondDmc(existingRes);
                    } else {
                      setDmcState((prev) => ({
                        ...prev,
                        studentName: st.name,
                        fatherName: st.fatherName,
                        className: st.classId,
                        rollNo: st.rollNo || st.admissionNo,
                      }));
                    }
                  }
                }}
                defaultValue=""
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
              >
                <option value="" disabled>
                  -- Select Student to Auto-Fill DMC --
                </option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} S/O {s.fatherName} ({s.classId} • Adm #{s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrintSecondDmc}
                className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <Eye size={14} />
                <span>Print Preview</span>
              </button>
              <button
                type="button"
                onClick={handleDirectPrintSecondDmc}
                className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <Printer size={14} />
                <span>Direct Print</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSecondDmcPdf}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <FileText size={14} />
                <span>Save PDF</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSecondDmcDoc}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <FileSpreadsheet size={14} />
                <span>Save DOC</span>
              </button>
              <button
                type="button"
                onClick={handleSaveSecondDmcJpg}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <ImageIcon size={14} />
                <span>Save JPG</span>
              </button>
              <button
                type="button"
                onClick={handleShareSecondDmc}
                className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <Share2 size={14} />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* EXACT INTERACTIVE IMAGE 017.JPG DETAILED MARKS CERTIFICATE (DMC) WITH IMAGE 031 CREST LOGO */}
          <div className="bg-[#FAF8F2] p-3 sm:p-5 rounded-3xl shadow-xl border-4 border-emerald-800 overflow-x-auto">
            <div className="border-2 border-emerald-900 p-4 sm:p-6 min-w-[700px] space-y-4 font-serif text-slate-900">
              {/* Top Official Header Banner matching Image 017.jpg with Uploaded Image 031 Crest Logo */}
              <div className="flex items-center justify-between gap-4 border-b-2 border-emerald-800 pb-4">
                {/* Main Left Uploaded Image 031 Crest Logo */}
                <div className="w-24 h-24 bg-white rounded-2xl p-1 border-2 border-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                  <img
                    src="/assets/aistudio/image_031.svg"
                    alt="GPS Chambai Crest (Image 031)"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Titles */}
                <div className="text-center flex-1 space-y-1 pr-2 sm:pr-6">
                  <h3 className="text-base sm:text-lg font-black text-emerald-950 uppercase tracking-tight">
                    ELEMENTARY &amp; SECONDARY EDUCATION DEPARTMENT KHYBER PAKHTUNKHWA
                  </h3>
                  <div className="inline-block bg-emerald-800 text-white px-5 py-1 rounded-md text-xs font-black uppercase tracking-wider">
                    GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT
                  </div>
                  <div className="pt-1">
                    <span className="inline-block bg-gradient-to-r from-amber-500 to-yellow-600 text-white px-6 py-1 rounded-full text-sm font-black uppercase shadow-xs">
                      DETAILED MARKS CERTIFICATE
                    </span>
                  </div>
                </div>
              </div>

              {/* Editable Student Info Fields matching Image 017.jpg */}
              <div className="grid grid-cols-12 gap-3 text-xs sm:text-sm font-bold pt-1">
                <div className="col-span-5 flex items-center gap-1.5">
                  <span className="shrink-0 font-black">Name:</span>
                  <input
                    type="text"
                    value={dmcState.studentName}
                    onChange={(e) => setDmcState({ ...dmcState, studentName: e.target.value })}
                    className="w-full border-b-2 border-slate-800 bg-white/70 px-2 py-0.5 font-black text-slate-950 focus:outline-none"
                  />
                </div>
                <div className="col-span-5 flex items-center gap-1.5">
                  <span className="shrink-0 font-black">Father&apos;s Name:</span>
                  <input
                    type="text"
                    value={dmcState.fatherName}
                    onChange={(e) => setDmcState({ ...dmcState, fatherName: e.target.value })}
                    className="w-full border-b-2 border-slate-800 bg-white/70 px-2 py-0.5 font-black text-slate-950 focus:outline-none"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-1.5">
                  <span className="shrink-0 font-black">Class:</span>
                  <input
                    type="text"
                    value={dmcState.className}
                    onChange={(e) => setDmcState({ ...dmcState, className: e.target.value })}
                    className="w-full border-b-2 border-slate-800 bg-white/70 px-2 py-0.5 font-black text-slate-950 text-center focus:outline-none"
                  />
                </div>

                <div className="col-span-4 flex items-center gap-1.5">
                  <span className="shrink-0 font-black">Session:</span>
                  <input
                    type="text"
                    value={dmcState.session}
                    onChange={(e) => setDmcState({ ...dmcState, session: e.target.value })}
                    className="w-full border-b-2 border-slate-800 bg-white/70 px-2 py-0.5 font-black text-slate-950 focus:outline-none"
                  />
                </div>
                <div className="col-span-5 flex items-center justify-center gap-2">
                  {['1st Term', '2nd Term', 'Annual Exam'].map((termOpt) => (
                    <button
                      key={termOpt}
                      type="button"
                      onClick={() => setDmcState({ ...dmcState, termLabel: termOpt })}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${
                        dmcState.termLabel === termOpt
                          ? 'bg-emerald-800 text-white border-emerald-900'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {termOpt}
                    </button>
                  ))}
                </div>
                <div className="col-span-3 flex items-center gap-1.5">
                  <span className="shrink-0 font-black">Roll No.</span>
                  <input
                    type="text"
                    value={dmcState.rollNo}
                    onChange={(e) => setDmcState({ ...dmcState, rollNo: e.target.value })}
                    className="w-full border-2 border-slate-900 rounded-md bg-white px-2 py-0.5 font-black text-center text-slate-950 focus:outline-none"
                  />
                </div>
              </div>

              {/* 9-Subject Marks Table matching Image 017.jpg */}
              <table className="w-full border-collapse border-2 border-slate-900 text-xs sm:text-sm bg-white">
                <thead>
                  <tr className="bg-amber-100/80 text-slate-950 font-black">
                    <th className="border-2 border-slate-900 py-2 px-2 text-center w-14">S.No</th>
                    <th className="border-2 border-slate-900 py-2 px-3 text-left">SUBJECTS</th>
                    <th className="border-2 border-slate-900 py-2 px-2 text-center w-28">
                      TOTAL MARKS
                    </th>
                    <th className="border-2 border-slate-900 py-2 px-2 text-center w-32">
                      MARKS OBTAINED
                    </th>
                    <th className="border-2 border-slate-900 py-2 px-3 text-left">IN WORDS</th>
                  </tr>
                </thead>
                <tbody>
                  {dmcState.subjects.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-amber-50/40">
                      <td className="border border-slate-800 py-1.5 px-2 text-center font-black">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="border border-slate-800 py-1 px-2">
                        <input
                          type="text"
                          value={sub.subject}
                          onChange={(e) => {
                            const next = [...dmcState.subjects];
                            next[idx] = { ...next[idx], subject: e.target.value };
                            setDmcState({ ...dmcState, subjects: next });
                          }}
                          className="w-full font-black text-slate-900 bg-transparent focus:outline-none"
                        />
                      </td>
                      <td className="border border-slate-800 py-1 px-2 text-center">
                        <input
                          type="number"
                          value={sub.total}
                          onChange={(e) => {
                            const next = [...dmcState.subjects];
                            next[idx] = { ...next[idx], total: Number(e.target.value) || 0 };
                            setDmcState({ ...dmcState, subjects: next });
                          }}
                          className="w-20 text-center font-black text-slate-900 bg-slate-50 rounded border border-slate-300 py-0.5"
                        />
                      </td>
                      <td className="border border-slate-800 py-1 px-2 text-center">
                        <input
                          type="number"
                          value={sub.obtained}
                          onChange={(e) => {
                            const next = [...dmcState.subjects];
                            next[idx] = { ...next[idx], obtained: Number(e.target.value) || 0 };
                            setDmcState({ ...dmcState, subjects: next });
                          }}
                          className="w-20 text-center font-black text-emerald-900 bg-emerald-50 rounded border border-emerald-300 py-0.5"
                        />
                      </td>
                      <td className="border border-slate-800 py-1.5 px-3 font-bold text-slate-700">
                        {numberToWordsEn(sub.obtained)}
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="bg-amber-100/90 font-black text-slate-950">
                    <td colSpan={2} className="border-2 border-slate-900 py-2 px-3 text-center">
                      TOTAL
                    </td>
                    <td className="border-2 border-slate-900 py-2 px-2 text-center">
                      {dmcGrandTotal}
                    </td>
                    <td className="border-2 border-slate-900 py-2 px-2 text-center text-emerald-900">
                      {dmcGrandObtained}
                    </td>
                    <td className="border-2 border-slate-900 py-2 px-3">
                      {numberToWordsEn(dmcGrandObtained)} (
                      {dmcGrandTotal > 0
                        ? ((dmcGrandObtained / dmcGrandTotal) * 100).toFixed(1)
                        : '0'}
                      %)
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Remarks & Signatures matching Image 017.jpg */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm font-black">
                  <span>Remarks :</span>
                  <input
                    type="text"
                    value={dmcState.remarksText}
                    onChange={(e) => setDmcState({ ...dmcState, remarksText: e.target.value })}
                    className="flex-1 border-b-2 border-slate-900 bg-white/70 px-2 py-0.5 font-black text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="flex items-end justify-between pt-6 text-sm font-black text-slate-900">
                  <div className="text-center">
                    <div className="border-b-2 border-slate-900 w-52 pb-1 text-slate-800">
                      Muhammad Irfan (PST)
                    </div>
                    <div className="mt-1">Controller of Exam Signature</div>
                  </div>
                  <div className="text-center">
                    <div className="border-b-2 border-slate-900 w-52 pb-1 text-slate-800">
                      Zar Khan Afridi (PSHT)
                    </div>
                    <div className="mt-1">Head Teacher Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: FIRST REPORT CARD & SAVED RESULTS LIST */}
      {activeCardTab === 'first_card' && (
        <div className="space-y-3">
          {/* Class Filter */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setClassFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                classFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              All Classes ({results.length})
            </button>
            {OFFICIAL_SIX_CLASSES.map((cls) => (
              <button
                key={cls.id}
                onClick={() => setClassFilter(cls.id)}
                style={
                  classFilter === cls.id
                    ? { backgroundColor: cls.hex, color: '#FFFFFF' }
                    : undefined
                }
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                  classFilter === cls.id
                    ? 'shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                {cls.shortCode}
              </button>
            ))}
          </div>

          {/* Results Cards */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 gap-3' : 'space-y-3'}>
            {filteredResults.map((res) => {
              const clsMeta = getClassMetaByIdOrName(res.classId);
              const clsColor = getClassHexColor(res.classId);
              return (
                <div
                  key={res.id}
                  className="bg-white rounded-3xl p-4 border-2 border-emerald-800 shadow-xs space-y-3"
                >
                  {/* Official First Result Card Top Header with School Logo & Centered Yellow Header Bar */}
                  <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 text-white rounded-2xl p-4 text-center space-y-2 shadow-xs">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 rounded-full bg-white p-1.5 border-2 border-amber-400 shadow-sm flex items-center justify-center">
                        <img
                          src="/assets/aistudio/image_031.svg"
                          alt="GPS Chambai Official School Logo"
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                    <div className="text-sm sm:text-base font-black tracking-wide uppercase">
                      GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT
                    </div>
                    <div className="text-[11px] text-emerald-200 font-bold">
                      Elementary &amp; Secondary Education Department, Khyber Pakhtunkhwa • EMIS: 16454
                    </div>
                    <div className="w-full bg-amber-400 text-slate-950 font-black text-xs sm:text-sm py-2 px-4 rounded-xl flex items-center justify-center text-center tracking-wider uppercase shadow-xs">
                      <span className="w-full text-center">
                        OFFICIAL RESULT REPORT CARD ({res.academicYear || '2025-26'})
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl text-white flex flex-col items-center justify-center font-black shrink-0"
                        style={{ backgroundColor: clsColor }}
                      >
                        <Award size={18} />
                        <span className="text-[9px]">{res.grade}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: clsColor }}
                          >
                            {clsMeta.displayName}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            Roll #{res.rollNo} • {res.examTerm} ({res.academicYear || '2025-26'})
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900 mt-0.5">
                          {res.studentName}{' '}
                          <span className="text-xs font-semibold text-slate-500">
                            S/O {res.fatherName}
                          </span>
                        </h3>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        StorageService.deleteResult(res.id);
                        refresh();
                      }}
                      className="p-2 rounded-xl bg-rose-50 text-rose-600"
                      title="Delete Result"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Subject Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {res.subjects.map((sub, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <span className="font-bold text-slate-700 truncate">{sub.subject}</span>
                        <span className="font-black text-slate-900">
                          {sub.obtained}/{sub.total}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals + First & Second Report Card Actions */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs font-black text-slate-800">
                      Total: <span style={{ color: clsColor }}>{res.obtainedMarks}</span> /{' '}
                      {res.totalMarks} ({res.percentage}%) • Pos #{res.positionInClass}
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => handlePrintFirstReportCard(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <Eye size={13} />
                        <span>Print Preview</span>
                      </button>

                      <button
                        onClick={() => handleDirectPrintFirstReportCard(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <Printer size={13} />
                        <span>Direct Print</span>
                      </button>

                      <button
                        onClick={() => handleSaveFirstReportCardPdf(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <Download size={13} />
                        <span>Save PDF</span>
                      </button>

                      <button
                        onClick={() => handleSaveFirstReportCardDoc(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <FileSpreadsheet size={13} />
                        <span>Save DOC</span>
                      </button>

                      <button
                        onClick={() => handleSaveFirstReportCardJpg(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-black flex items-center gap-1"
                      >
                        <ImageIcon size={13} />
                        <span>Save JPG</span>
                      </button>

                      <button
                        onClick={() => loadResultIntoSecondDmc(res)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1"
                      >
                        <Award size={13} />
                        <span>Open 2nd DMC Card</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* JPG Preview Modal */}
      {jpgPreviewDataUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[92vh]">
            <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{jpgPreviewTitle}</h4>
                <p className="text-[10px] text-emerald-300 font-semibold">
                  Saved inside GPS Chambai/Certificates/PDF Result
                </p>
              </div>
              <button
                onClick={() => {
                  setJpgPreviewDataUrl(null);
                  setSelectedResult(null);
                }}
                className="p-1.5 rounded-xl bg-white/10 text-white"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto bg-slate-100 flex-1 flex items-center justify-center">
              <img
                src={jpgPreviewDataUrl}
                alt="Report Card JPG"
                className="max-w-full h-auto rounded-xl shadow-lg border border-slate-300"
              />
            </div>

            <div className="p-3 bg-white border-t border-slate-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={15} />
                <span>High-Res Report Card Ready</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const pdfBlob = generatePdfBlobFromImageDataUrl(jpgPreviewDataUrl, false);
                    saveFileToGpsChambaiFolder(
                      `${jpgPreviewTitle.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
                      pdfBlob,
                      'application/pdf',
                      { folderSubPath: 'Certificates/PDF Result' }
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 text-white text-xs font-black flex items-center gap-1"
                >
                  <FileText size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => {
                    saveFileToGpsChambaiFolder(
                      `${jpgPreviewTitle.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`,
                      jpgPreviewDataUrl,
                      'image/jpeg',
                      { folderSubPath: 'Certificates/PDF Result' }
                    );
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
                >
                  <Download size={14} />
                  <span>Download JPG</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Result Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateResult}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Student Exam Result</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Select Student
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({getClassMetaByIdOrName(s.classId).displayName})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Exam Term
              </label>
              <select
                value={examTerm}
                onChange={(e) => setExamTerm(e.target.value as ExamResult['examTerm'])}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                <option value="1st Term">1st Semester / Term</option>
                <option value="2nd Term">2nd Semester / Term</option>
                <option value="Annual">Annual Examination</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="text-[11px] font-black text-slate-700">
                Subject Marks (Obtained out of 100)
              </div>
              {subjectMarks.map((sm, idx) => (
                <div key={idx} className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-700 flex-1">{sm.subject}</span>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={sm.obtained}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setSubjectMarks((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, obtained: val } : item))
                      );
                    }}
                    className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-black text-center"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black"
              >
                Save Result
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
