import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Award,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { Student, CertificateIssueRecord } from '../../../types';
import { StorageService } from '../../../services/storage';
import { getClassMetaByIdOrName, getClassHexColor } from '../../../utils/classColors';
import {
  printHtmlDocument,
  executeIframePrint,
  buildOfficialPrintHtml,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface ExtendedSlcFields {
  fileNo: string;
  admissionNo: string;
  studentName: string;
  fatherName: string;
  residentOf: string;
  dobDigits: string[]; // 8 boxes D D M M Y Y Y Y
  dobInWords: string;
  classAdmitted: string;
  attendanceFrom: string;
  attendanceTo: string;
  studyingInClass: string;
  promotedToClass: string;
  characterConduct: string;
  dateOfWithdrawal: string;
  preparedBy: string;
  issueDate: string;
  headTeacherName: string;
  certificateType: 'Original' | 'Duplicate';
  classStatus: 'Promoted' | 'Fail' | 'Migration' | 'Death';
}

function dateIsoTo8Digits(isoDate: string): string[] {
  // YYYY-MM-DD -> D D M M Y Y Y Y
  const parts = (isoDate || '2018-03-15').split('-');
  if (parts.length === 3) {
    const [yyyy, mm, dd] = parts;
    const str = `${dd.padStart(2, '0')}${mm.padStart(2, '0')}${yyyy.padStart(4, '0')}`;
    return str.split('').slice(0, 8);
  }
  return ['1', '5', '0', '3', '2', '0', '1', '8'];
}

function dateIsoToWords(isoDate: string): string {
  const d = new Date(isoDate || '2018-03-15');
  if (Number.isNaN(d.getTime())) return 'Fifteenth March Two Thousand Eighteen';
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export const CertificateIssueSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [certificates, setCertificates] = useState<CertificateIssueRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useViewMode('certificate_issue', 'grid');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);
  const [activeSubView, setActiveSubView] = useState<'designer' | 'history'>('designer');

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [editingCert, setEditingCert] = useState<CertificateIssueRecord | null>(null);
  const [deletingCert, setDeletingCert] = useState<CertificateIssueRecord | null>(null);

  const [slc, setSlc] = useState<ExtendedSlcFields>({
    fileNo: 'GPS-16454/2026/01',
    admissionNo: '101',
    studentName: 'Muhammad Bilal',
    fatherName: 'Abdul Karim',
    residentOf: 'Chambai Kohat',
    dobDigits: ['1', '5', '0', '3', '2', '0', '1', '6'],
    dobInWords: '15 March 2016 (Fifteenth March Two Thousand Sixteen)',
    classAdmitted: 'Kachi / KG',
    attendanceFrom: '01-04-2021',
    attendanceTo: new Date().toISOString().split('T')[0],
    studyingInClass: '5th',
    promotedToClass: '6th (Passed Primary)',
    characterConduct: 'Good & Satisfactory',
    dateOfWithdrawal: new Date().toISOString().split('T')[0],
    preparedBy: 'Muhammad Irfan (PST)',
    issueDate: new Date().toISOString().split('T')[0],
    headTeacherName: 'Zar Khan Afridi (PSHT)',
    certificateType: 'Original',
    classStatus: 'Promoted',
  });

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const refresh = () => {
    const sts = StorageService.getStudents();
    setStudents(sts);
    setCertificates(StorageService.getCertificates());
    if (sts.length > 0 && !selectedStudentId) {
      loadStudentIntoSlc(sts[0]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const loadStudentIntoSlc = (st: Student) => {
    setSelectedStudentId(st.id);
    const clsMeta = getClassMetaByIdOrName(st.classId);
    const digits = dateIsoTo8Digits(st.dob || '2016-03-15');
    setSlc((prev) => ({
      ...prev,
      admissionNo: st.admissionNo || '101',
      studentName: st.name,
      fatherName: st.fatherName,
      residentOf: st.address || 'Chambai Kohat',
      dobDigits: digits,
      dobInWords: dateIsoToWords(st.dob || '2016-03-15'),
      classAdmitted: 'Kachi / KG',
      attendanceFrom: st.admissionDate || '2022-04-01',
      attendanceTo: new Date().toISOString().split('T')[0],
      studyingInClass: clsMeta.displayName,
      promotedToClass:
        clsMeta.id === '5th' ? '6th Class (Middle)' : 'Next Higher Class',
      dateOfWithdrawal: new Date().toISOString().split('T')[0],
      issueDate: new Date().toISOString().split('T')[0],
    }));
  };

  const buildImage015CertificateHtml = (fields: ExtendedSlcFields) => {
    const boxesHtml = fields.dobDigits
      .map(
        (d) =>
          `<span style="display:inline-block;width:24px;height:26px;line-height:24px;border:2px solid #14532d;text-align:center;font-weight:900;font-size:13px;margin-right:3px;background:#f0fdf4;color:#064e3b;">${
            d || '&nbsp;'
          }</span>`
      )
      .join('');

    return `
      <div data-standalone-doc="true" style="border:6px solid #15803d;padding:6px;background:#ffffff;max-width:780px;margin:0 auto;font-family:'Times New Roman','Jameel Noori Nastaleeq',Georgia,serif;color:#064e3b;">
        <div style="border:2px solid #14532d;padding:18px 22px;position:relative;">
          <!-- Dark Green Official Header Banner matching Image 015.jpg -->
          <div style="background:linear-gradient(180deg,#166534 0%,#14532d 100%);color:#ffffff;border-radius:10px;padding:14px 18px;display:flex;align-items:center;justify-content:space-between;border:2px solid #052e16;">
            <div style="width:68px;height:68px;background:#ffffff;border-radius:10px;padding:4px;display:flex;align-items:center;justify-content:center;border:2px solid #facc15;">
              <img src="/assets/aistudio/20260903_200547_79893d25.png" alt="KPESED" style="max-width:100%;max-height:100%;object-fit:contain;" />
            </div>
            <div style="text-align:center;flex:1;padding:0 10px;">
              <div style="font-size:24px;font-weight:900;letter-spacing:0.4px;text-shadow:0 1px 2px rgba(0,0,0,0.4);">
                Govt Primary School Chambai Kohat
              </div>
              <div style="font-size:18px;font-weight:900;color:#fef08a;margin-top:2px;">
                EMIS Code. 16454
              </div>
              <div style="font-size:16px;font-weight:800;color:#dcfce7;margin-top:2px;">
                Circle . ( Jerma )
              </div>
            </div>
            <div style="width:68px;height:68px;background:#ffffff;border-radius:50%;padding:3px;display:flex;align-items:center;justify-content:center;border:3px solid #facc15;">
              <img src="/assets/aistudio/20260903_200547_79893d25.png" alt="GPS Chambai Crest" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
            </div>
          </div>

          <!-- File No & Admission No Row -->
          <div style="display:flex;justify-content:space-between;align-items:center;margin-top:16px;font-size:15px;font-weight:800;color:#14532d;">
            <div>
              File No. <span style="display:inline-block;min-width:150px;border-bottom:2px solid #15803d;padding:0 6px;color:#0f172a;">${fields.fileNo}</span>
            </div>
            <div>
              Admission No. <span style="display:inline-block;min-width:150px;border-bottom:2px solid #15803d;padding:0 6px;color:#0f172a;">${fields.admissionNo}</span>
            </div>
          </div>

          <!-- Centered School Leaving Certificate Pill -->
          <div style="text-align:center;margin:16px 0 20px;">
            <span style="display:inline-block;background:#14532d;color:#ffffff;font-size:19px;font-weight:900;padding:7px 28px;border-radius:10px;border:2px solid #052e16;letter-spacing:0.5px;">
              School Leaving Certificate (${fields.certificateType})
            </span>
          </div>

          <!-- Certificate Body Lines matching Image 015.jpg -->
          <div style="font-size:15px;line-height:2.35;color:#14532d;font-weight:700;">
            <div>
              Certified that :
              <span style="display:inline-block;min-width:520px;border-bottom:2px solid #15803d;padding:0 10px;font-weight:900;color:#0f172a;">
                ${fields.studentName}
              </span>
            </div>

            <div>
              Son / Daughter of :
              <span style="display:inline-block;min-width:250px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.fatherName}
              </span>
              &nbsp;&nbsp;Resident of
              <span style="display:inline-block;min-width:210px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.residentOf}
              </span>
            </div>

            <div style="margin-top:4px;">
              Date of birth (in figures) &nbsp;&nbsp; ${boxesHtml}
            </div>

            <div>
              In words
              <span style="display:inline-block;min-width:560px;border-bottom:2px solid #15803d;padding:0 10px;font-weight:900;color:#0f172a;">
                ${fields.dobInWords}
              </span>
            </div>

            <div>
              Class in which admitted
              <span style="display:inline-block;min-width:110px;border-bottom:2px solid #15803d;padding:0 6px;font-weight:900;color:#0f172a;">
                ${fields.classAdmitted}
              </span>
              &nbsp;Period of attendance from
              <span style="display:inline-block;min-width:115px;border-bottom:2px solid #15803d;padding:0 6px;font-weight:900;color:#0f172a;">
                ${fields.attendanceFrom}
              </span>
              &nbsp;To
              <span style="display:inline-block;min-width:115px;border-bottom:2px solid #15803d;padding:0 6px;font-weight:900;color:#0f172a;">
                ${fields.attendanceTo}
              </span>
            </div>

            <div>
              Now He / She is studying in class
              <span style="display:inline-block;min-width:150px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.studyingInClass}
              </span>
              &nbsp;promoted to class
              <span style="display:inline-block;min-width:170px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.promotedToClass}
              </span>
            </div>

            <div>
              During His / Her stay in this school His / Her Character &amp; Conduct remained
              <span style="display:inline-block;min-width:165px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.characterConduct}
              </span>
            </div>

            <div>
              Date of withdrawal
              <span style="display:inline-block;min-width:240px;border-bottom:2px solid #15803d;padding:0 8px;font-weight:900;color:#0f172a;">
                ${fields.dateOfWithdrawal}
              </span>
            </div>
          </div>

          <!-- Footer Signatures matching Image 015.jpg -->
          <div style="display:flex;justify-content:space-between;align-items:flex-end;margin-top:42px;padding-top:12px;font-size:15px;font-weight:900;color:#14532d;">
            <div style="text-align:center;">
              <div style="border-bottom:2px solid #15803d;min-width:180px;padding-bottom:4px;color:#0f172a;">
                ${fields.preparedBy}
              </div>
              <div style="margin-top:4px;">Prepared by</div>
            </div>

            <div style="text-align:center;">
              <div style="border-bottom:2px solid #15803d;min-width:140px;padding-bottom:4px;color:#0f172a;">
                ${fields.issueDate}
              </div>
              <div style="margin-top:4px;">Date</div>
            </div>

            <div style="text-align:center;">
              <div style="border-bottom:2px solid #15803d;min-width:200px;padding-bottom:4px;color:#0f172a;">
                ${fields.headTeacherName}
              </div>
              <div style="margin-top:4px;">Head Teacher</div>
            </div>
          </div>
        </div>
      </div>
    `;
  };

  const handleSaveCertificate = () => {
    const st = students.find((s) => s.id === selectedStudentId);
    const clsMeta = getClassMetaByIdOrName(st?.classId || slc.studyingInClass || '5th');

    const record: CertificateIssueRecord = {
      id: editingCert ? editingCert.id : `cert-${Date.now()}`,
      studentId: st?.id || `st-${Date.now()}`,
      studentName: slc.studentName,
      fatherName: slc.fatherName,
      admissionNo: slc.admissionNo,
      rollNo: st?.rollNo || '1',
      classId: clsMeta.id,
      className: slc.studyingInClass || clsMeta.displayName,
      certificateIssued: 'Yes',
      certificateType: slc.certificateType,
      classStatus: slc.classStatus,
      withdrawalDate: slc.dateOfWithdrawal,
      issueDate: slc.issueDate,
      remarks: `Promoted to: ${slc.promotedToClass} | Conduct: ${slc.characterConduct} | File No: ${slc.fileNo}`,
    };

    if (editingCert) {
      StorageService.updateCertificate(record);
    } else {
      StorageService.addCertificate(record);
    }
    refresh();
    setEditingCert(null);
    showToast(`Saved School Leaving Certificate for ${slc.studentName}!`);
  };

  const handlePrintPreviewSlc = () => {
    printHtmlDocument(
      `School_Leaving_Certificate_${slc.studentName}`,
      buildImage015CertificateHtml(slc),
      'portrait',
      false,
      'GPS Chambai/Certificates/PDF certificate'
    );
  };

  const handleDirectPrintSlc = () => {
    const fullHtml = buildOfficialPrintHtml(
      `School_Leaving_Certificate_${slc.studentName}`,
      buildImage015CertificateHtml(slc),
      'portrait',
      false
    );
    executeIframePrint(fullHtml, `SLC_${slc.studentName}`);
  };

  const handleSavePdfSlc = () => {
    const res = exportAndSaveRealPdf(
      `SLC_${slc.studentName}_${slc.admissionNo}`,
      buildImage015CertificateHtml(slc),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF certificate',
        moduleSource: 'Certificate Issue Module',
      }
    );
    showToast(`Saved PDF (${res.filename}) to ${res.folderPath}`);
  };

  const handleExportWordSlc = () => {
    const res = exportAndSaveWordDoc(
      `SLC_${slc.studentName}_${slc.admissionNo}`,
      buildImage015CertificateHtml(slc),
      {
        includeHeader: false,
        folderSubPath: 'Certificates/PDF certificate',
        moduleSource: 'Certificate Issue Module',
      }
    );
    showToast(`Saved Word DOC (${res.filename}) to ${res.folderPath}`);
  };

  const filteredCertificates = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-900 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'سکول چھوڑنے کا سرٹیفکیٹ (SLC)' : 'School Leaving Certificate Issue'}
            </h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={handlePrintPreviewSlc}
            className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Eye size={14} />
            <span>Print Preview</span>
          </button>
          <button
            onClick={handleDirectPrintSlc}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Printer size={14} />
            <span>Direct Print</span>
          </button>
          <button
            onClick={handleSavePdfSlc}
            className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleExportWordSlc}
            className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <FileSpreadsheet size={14} />
            <span>Save DOC</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Mode Switcher: Live Editable Certificate (Image 015) vs Issued Certificate History */}
      <div className="grid grid-cols-2 gap-1.5 bg-slate-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSubView('designer')}
          className={`py-2 rounded-xl text-xs font-black ${
            activeSubView === 'designer' ? 'bg-emerald-800 text-white' : 'text-slate-700'
          }`}
        >
          1. Editable Certificate (Image 015 Layout)
        </button>
        <button
          onClick={() => setActiveSubView('history')}
          className={`py-2 rounded-xl text-xs font-black ${
            activeSubView === 'history' ? 'bg-emerald-800 text-white' : 'text-slate-700'
          }`}
        >
          2. Issued Certificate Register ({certificates.length})
        </button>
      </div>

      {activeSubView === 'designer' && (
        <div className="space-y-4">
          {/* Student Auto-Fill Bar */}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
            <div className="flex-1 min-w-[220px]">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-1">
                Auto-Fill From Student Database (Or Edit Any Field Directly On Certificate Below):
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  const st = students.find((s) => s.id === e.target.value);
                  if (st) loadStudentIntoSlc(st);
                }}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} S/O {s.fatherName} (Adm #{s.admissionNo} • Class {s.classId})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={slc.certificateType}
                onChange={(e) =>
                  setSlc({ ...slc, certificateType: e.target.value as 'Original' | 'Duplicate' })
                }
                className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-black bg-white"
              >
                <option value="Original">Original Certificate</option>
                <option value="Duplicate">Duplicate Certificate</option>
              </select>
              <button
                type="button"
                onClick={handleSaveCertificate}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
              >
                <Plus size={14} />
                <span>Save to SLC Register</span>
              </button>
            </div>
          </div>

          {/* EXACT INTERACTIVE IMAGE 015.JPG SCHOOL LEAVING CERTIFICATE */}
          <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-xl border-4 border-emerald-700 overflow-x-auto">
            <div className="border-2 border-emerald-900 p-3 sm:p-6 min-w-[660px] space-y-4 font-serif text-emerald-950">
              {/* Top Dark Green Header Banner matching Image 015.jpg */}
              <div className="bg-gradient-to-b from-emerald-800 to-emerald-950 text-white rounded-xl p-3.5 border-2 border-emerald-950 flex items-center justify-between gap-4 shadow-md">
                {/* Left KPESED Logo */}
                <div className="w-16 h-16 bg-white rounded-xl p-1 border-2 border-amber-400 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/20260903_200547_79893d25.png"
                    alt="KPESED"
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Official Title */}
                <div className="text-center flex-1">
                  <h3 className="text-xl sm:text-2xl font-black tracking-wide text-white drop-shadow-xs">
                    Govt Primary School Chambai Kohat
                  </h3>
                  <p className="text-base sm:text-lg font-black text-amber-300 leading-tight mt-0.5">
                    EMIS Code. 16454
                  </p>
                  <p className="text-sm sm:text-base font-extrabold text-emerald-100 leading-tight">
                    Circle . ( Jerma )
                  </p>
                </div>

                {/* Right Circular School Crest */}
                <div className="w-16 h-16 bg-white rounded-full p-0.5 border-2 border-amber-400 flex items-center justify-center shrink-0 overflow-hidden">
                  <img
                    src="/assets/aistudio/20260903_200547_79893d25.png"
                    alt="GPS Chambai Crest"
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>

              {/* File No. & Admission No. Row */}
              <div className="flex items-center justify-between gap-4 pt-1 text-sm font-black text-emerald-900">
                <div className="flex items-center gap-2">
                  <span>File No.</span>
                  <input
                    type="text"
                    value={slc.fileNo}
                    onChange={(e) => setSlc({ ...slc, fileNo: e.target.value })}
                    className="border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/40 focus:outline-none w-44"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span>Admission No.</span>
                  <input
                    type="text"
                    value={slc.admissionNo}
                    onChange={(e) => setSlc({ ...slc, admissionNo: e.target.value })}
                    className="border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/40 focus:outline-none w-40"
                  />
                </div>
              </div>

              {/* Centered School Leaving Certificate Badge */}
              <div className="text-center py-1">
                <span className="inline-block bg-emerald-900 text-white text-base sm:text-lg font-black px-7 py-1.5 rounded-xl border-2 border-emerald-950 shadow-sm">
                  School Leaving Certificate
                </span>
              </div>

              {/* Editable Lines matching Image 015.jpg */}
              <div className="space-y-3 text-sm font-bold text-emerald-900">
                <div className="flex items-center gap-2">
                  <span className="shrink-0">Certified that :</span>
                  <input
                    type="text"
                    value={slc.studentName}
                    onChange={(e) => setSlc({ ...slc, studentName: e.target.value })}
                    className="flex-1 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">Son / Daughter of :</span>
                  <input
                    type="text"
                    value={slc.fatherName}
                    onChange={(e) => setSlc({ ...slc, fatherName: e.target.value })}
                    className="flex-1 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                  <span className="shrink-0">Resident of</span>
                  <input
                    type="text"
                    value={slc.residentOf}
                    onChange={(e) => setSlc({ ...slc, residentOf: e.target.value })}
                    className="w-52 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                {/* 8 Digit Boxes for Date of Birth (in figures) */}
                <div className="flex items-center gap-2 pt-1">
                  <span className="shrink-0">Date of birth (in figures)</span>
                  <div className="flex items-center gap-1">
                    {slc.dobDigits.map((digit, i) => (
                      <input
                        key={i}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => {
                          const next = [...slc.dobDigits];
                          next[i] = e.target.value;
                          setSlc({ ...slc, dobDigits: next });
                        }}
                        className="w-7 h-8 border-2 border-emerald-800 bg-emerald-50/50 text-center font-black text-slate-900 rounded-xs focus:outline-none"
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-700 font-sans">(DD-MM-YYYY)</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">In words</span>
                  <input
                    type="text"
                    value={slc.dobInWords}
                    onChange={(e) => setSlc({ ...slc, dobInWords: e.target.value })}
                    className="flex-1 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">Class in which admitted</span>
                  <input
                    type="text"
                    value={slc.classAdmitted}
                    onChange={(e) => setSlc({ ...slc, classAdmitted: e.target.value })}
                    className="w-28 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                  <span className="shrink-0">Period of attendance from</span>
                  <input
                    type="text"
                    value={slc.attendanceFrom}
                    onChange={(e) => setSlc({ ...slc, attendanceFrom: e.target.value })}
                    className="w-28 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                  <span className="shrink-0">To</span>
                  <input
                    type="text"
                    value={slc.attendanceTo}
                    onChange={(e) => setSlc({ ...slc, attendanceTo: e.target.value })}
                    className="w-28 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">Now He / She is studying in class</span>
                  <input
                    type="text"
                    value={slc.studyingInClass}
                    onChange={(e) => setSlc({ ...slc, studyingInClass: e.target.value })}
                    className="w-36 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                  <span className="shrink-0">promoted to class</span>
                  <input
                    type="text"
                    value={slc.promotedToClass}
                    onChange={(e) => setSlc({ ...slc, promotedToClass: e.target.value })}
                    className="flex-1 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">
                    During His / Her stay in this school His / Her Character &amp; Conduct remained
                  </span>
                  <input
                    type="text"
                    value={slc.characterConduct}
                    onChange={(e) => setSlc({ ...slc, characterConduct: e.target.value })}
                    className="flex-1 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="shrink-0">Date of withdrawal</span>
                  <input
                    type="date"
                    value={slc.dateOfWithdrawal}
                    onChange={(e) => setSlc({ ...slc, dateOfWithdrawal: e.target.value })}
                    className="w-44 border-b-2 border-emerald-700 px-2 py-0.5 font-black text-slate-900 bg-emerald-50/30 focus:outline-none"
                  />
                </div>
              </div>

              {/* Bottom Signature Bar: Prepared by | Date | Head Teacher */}
              <div className="grid grid-cols-3 gap-6 pt-8 items-end text-center text-sm font-black text-emerald-950">
                <div>
                  <input
                    type="text"
                    value={slc.preparedBy}
                    onChange={(e) => setSlc({ ...slc, preparedBy: e.target.value })}
                    className="w-full border-b-2 border-emerald-800 text-center font-black text-slate-900 pb-1 bg-transparent focus:outline-none"
                  />
                  <div className="mt-1">Prepared by</div>
                </div>
                <div>
                  <input
                    type="date"
                    value={slc.issueDate}
                    onChange={(e) => setSlc({ ...slc, issueDate: e.target.value })}
                    className="w-full border-b-2 border-emerald-800 text-center font-black text-slate-900 pb-1 bg-transparent focus:outline-none"
                  />
                  <div className="mt-1">Date</div>
                </div>
                <div>
                  <input
                    type="text"
                    value={slc.headTeacherName}
                    onChange={(e) => setSlc({ ...slc, headTeacherName: e.target.value })}
                    className="w-full border-b-2 border-emerald-800 text-center font-black text-slate-900 pb-1 bg-transparent focus:outline-none"
                  />
                  <div className="mt-1">Head Teacher</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubView === 'history' && (
        <div className="space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search issued certificates by student name, admission no, or class..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none"
            />
          </div>

          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
            {filteredCertificates.map((cert) => {
              const clsColor = getClassHexColor(cert.classId || cert.className);
              return (
                <div
                  key={cert.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl text-white flex items-center justify-center shrink-0"
                        style={{ backgroundColor: clsColor }}
                      >
                        <Award size={20} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                            style={{ backgroundColor: clsColor }}
                          >
                            {cert.className}
                          </span>
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {cert.certificateType}
                          </span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 mt-1">
                          {cert.studentName}{' '}
                          <span className="text-xs font-semibold text-slate-500">
                            S/O {cert.fatherName}
                          </span>
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          const st = students.find((s) => s.id === cert.studentId);
                          if (st) loadStudentIntoSlc(st);
                          setSlc((prev) => ({
                            ...prev,
                            studentName: cert.studentName,
                            fatherName: cert.fatherName,
                            admissionNo: cert.admissionNo,
                            studyingInClass: cert.className,
                            dateOfWithdrawal: cert.withdrawalDate,
                            issueDate: cert.issueDate,
                            certificateType: cert.certificateType,
                          }));
                          setEditingCert(cert);
                          setActiveSubView('designer');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-black flex items-center gap-1"
                        title="Open in Certificate Designer"
                      >
                        <Eye size={12} />
                        <span>View / Print</span>
                      </button>
                      <button
                        onClick={() => {
                          setEditingCert(cert);
                          setActiveSubView('designer');
                        }}
                        className="p-1.5 rounded-xl bg-slate-100 text-slate-700"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={() => setDeletingCert(cert)}
                        className="p-1.5 rounded-xl bg-rose-50 text-rose-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 rounded-xl p-2.5 border border-slate-100">
                    <div>
                      <span className="text-slate-400 font-bold block">Adm No</span>
                      <span className="font-black text-slate-800">{cert.admissionNo}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Withdrawal</span>
                      <span className="font-black text-slate-800">{cert.withdrawalDate}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-bold block">Issue Date</span>
                      <span className="font-black text-slate-800">{cert.issueDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingCert && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Delete Certificate Record</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to delete the certificate record for{' '}
              <strong>{deletingCert.studentName}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingCert(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  StorageService.deleteCertificate(deletingCert.id);
                  setDeletingCert(null);
                  refresh();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
