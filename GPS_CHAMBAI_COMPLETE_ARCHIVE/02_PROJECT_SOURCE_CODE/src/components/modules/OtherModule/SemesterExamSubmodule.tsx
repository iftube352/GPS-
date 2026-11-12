import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Printer,
  FileText,
  Image as ImageIcon,
  Save,
  CheckCircle2,
  Edit3,
  Share2,
  Download,
  Eye,
  FileSpreadsheet,
} from 'lucide-react';
import {
  SemesterExamPaper,
  ExamQuestionItem,
  ExamQuestionCategory,
} from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  getSubjectsForClass,
  getClassHexColor,
} from '../../../utils/classColors';
import {
  printHtmlDocument,
  executeIframePrint,
  buildOfficialPrintHtml,
  containsUrduText,
  generateExamPaperJpgDataUrl,
  saveFileToGpsChambaiFolder,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  shareDocumentOrFile,
  generateRealPdfBlobFromHtml,
} from '../../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';

interface SemesterExamSubmoduleProps {
  semester?: '1st Semester Exam' | '2nd Semester Exam';
  onBack: () => void;
  lang: 'en' | 'ur';
}

const NINE_QUESTION_CATEGORIES: {
  category: ExamQuestionCategory;
  urdu: string;
}[] = [
  { category: 'Short Questions', urdu: 'مختصر سوالات' },
  { category: 'Detailed Questions', urdu: 'تفصیلی سوالات' },
  { category: 'Words and Meanings', urdu: 'الفاظ معنی' },
  { category: 'Singular and Plural', urdu: 'واحد جمع' },
  { category: 'Antonyms', urdu: 'الفاظ متضاد' },
  { category: 'Masculine and Feminine', urdu: 'مذکر مؤنث' },
  { category: 'Story Writing', urdu: 'کہانی نویسی' },
  { category: 'Application Writing', urdu: 'درخواست نویسی' },
  { category: 'Essay Writing', urdu: 'مضمون نویسی' },
];

/**
 * REQUIREMENT 10.G: UNIFIED EXAMINATION MODULE
 * - Merged 1st Semester and 2nd Semester into one module named EXAMINATION
 * - Two tabs:
 *   1. 1st Semester
 *   2. 2nd Semester
 * - 6 Required Paper Creation Buttons in both tabs:
 *   1. Create Button for Generate Paper
 *   2. Edit Button
 *   3. Delete Button
 *   4. Export PDF, Doc Button
 *   5. Print / Print Preview
 *   6. Share Button
 */
export const SemesterExamSubmodule: React.FC<SemesterExamSubmoduleProps> = ({
  semester: initialSemester = '1st Semester Exam',
  onBack,
  lang,
}) => {
  const [activeSemesterTab, setActiveSemesterTab] = useState<
    '1st Semester Exam' | '2nd Semester Exam'
  >(initialSemester);
  const [savedPapers, setSavedPapers] = useState<SemesterExamPaper[]>([]);
  const [selectedClassLabel, setSelectedClassLabel] = useState<string>('Class 5 — پنجم');
  const [selectedSubjectLabel, setSelectedSubjectLabel] = useState<string>('Urdu — اردو');
  const [studentNameField, setStudentNameField] = useState<string>('');
  const [examDate, setExamDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [isUrduRtl, setIsUrduRtl] = useState<boolean>(true);
  const [viewMode, setViewMode] = useViewMode('examination_module', 'grid');

  const [questions, setQuestions] = useState<ExamQuestionItem[]>([
    {
      id: 'q-1',
      category: 'Short Questions',
      questionText: 'درج ذیل میں سے کسی پانچ مختصر سوالات کے جوابات تحریر کریں۔',
      marks: 15,
    },
    {
      id: 'q-2',
      category: 'Words and Meanings',
      questionText: 'درج ذیل الفاظ کے معنی لکھیں اور جملوں میں استعمال کریں۔',
      marks: 10,
    },
    {
      id: 'q-3',
      category: 'Singular and Plural',
      questionText: 'درج ذیل واحد الفاظ کے جمع لکھیں۔',
      marks: 15,
    },
    {
      id: 'q-4',
      category: 'Application Writing',
      questionText: 'ہیڈ ماسٹر صاحب کے نام بیماری کی درخواست تحریر کریں۔',
      marks: 10,
    },
  ]);

  const [newCategory, setNewCategory] = useState<ExamQuestionCategory>('Short Questions');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newQuestionMarks, setNewQuestionMarks] = useState<string>('10');
  const [statusBanner, setStatusBanner] = useState<string | null>(null);
  const editorSectionRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setStatusBanner(msg);
    setTimeout(() => setStatusBanner(null), 4000);
  };

  useEffect(() => {
    const all = StorageService.getExamPapers().filter(
      (p) => p.semester === activeSemesterTab
    );
    setSavedPapers(all);
    if (all.length > 0) {
      const first = all[0];
      const clsMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === first.classId);
      if (clsMeta) setSelectedClassLabel(clsMeta.kpSubjectDropdownLabel);
      setSelectedSubjectLabel(first.subject);
      setExamDate(first.examDate);
      setIsUrduRtl(first.isUrduRtl);
      setQuestions(first.questions);
    }
  }, [activeSemesterTab]);

  useEffect(() => {
    const mapped = getSubjectsForClass(selectedClassLabel);
    if (mapped.length > 0 && !mapped.some((b) => b.fullLabel === selectedSubjectLabel)) {
      setSelectedSubjectLabel(mapped[0].fullLabel);
    }
  }, [selectedClassLabel, selectedSubjectLabel]);

  useEffect(() => {
    const subLower = selectedSubjectLabel.toLowerCase();
    if (
      subLower.includes('urdu') ||
      subLower.includes('islamiat') ||
      subLower.includes('pashto') ||
      subLower.includes('nazra')
    ) {
      setIsUrduRtl(true);
    }
  }, [selectedSubjectLabel]);

  const totalMarks = questions.reduce((sum, q) => sum + Number(q.marks || 0), 0);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;
    const item: ExamQuestionItem = {
      id: `q-${Date.now()}`,
      category: newCategory,
      questionText: newQuestionText.trim(),
      marks: Math.max(1, parseInt(newQuestionMarks, 10) || 5),
    };
    setQuestions((prev) => [...prev, item]);
    setNewQuestionText('');
    showToast('Added question to paper!');
  };

  const handleUpdateQuestionText = (id: string, text: string) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, questionText: text } : q))
    );
  };

  const handleUpdateQuestionMarks = (id: string, marks: number) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, marks: Math.max(0, marks) } : q))
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleMoveQuestion = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= questions.length) return;
    setQuestions((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[target];
      copy[target] = temp;
      return copy;
    });
  };

  const buildCurrentPaperObject = (): SemesterExamPaper => {
    const clsMeta =
      OFFICIAL_SIX_CLASSES.find(
        (c) => c.kpSubjectDropdownLabel === selectedClassLabel
      ) || OFFICIAL_SIX_CLASSES[0];

    return {
      id: `ep-${activeSemesterTab.replace(/\s+/g, '')}-${clsMeta.id}-${Date.now()}`,
      semester: activeSemesterTab,
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: selectedSubjectLabel,
      studentNameField,
      examDate,
      totalMarks,
      isUrduRtl,
      questions,
      createdAt: new Date().toISOString().split('T')[0],
    };
  };

  const buildPaperHtml = (paper: SemesterExamPaper) => {
    const subLower = (paper.subject || '').toLowerCase();
    const isPaperUrdu =
      paper.isUrduRtl ||
      subLower.includes('urdu') ||
      subLower.includes('islamiat') ||
      subLower.includes('pashto') ||
      paper.questions.some((q) => containsUrduText(q.questionText || ''));

    const questionsHtml = paper.questions
      .map((q, i) => {
        const qIsUrdu = isPaperUrdu || containsUrduText(q.questionText || '');
        const dirAttr = qIsUrdu ? 'rtl' : 'ltr';
        const alignStyle = qIsUrdu ? 'text-align:right;' : 'text-align:left;';
        const catMeta = NINE_QUESTION_CATEGORIES.find((c) => c.category === q.category);
        const categoryDisplay = qIsUrdu && catMeta ? `${catMeta.urdu} (${q.category})` : q.category;
        const qLabel = qIsUrdu ? `سوال نمبر ${i + 1}: ${categoryDisplay}` : `Q${i + 1}: ${categoryDisplay}`;
        const marksLabel = qIsUrdu ? `[${q.marks} نمبر]` : `[${q.marks} Marks]`;

        return `
        <div dir="${dirAttr}" class="${qIsUrdu ? 'urdu-text' : ''}" style="margin-bottom:14px;padding:12px 16px;border:1.5px solid #94a3b8;border-radius:10px;background:#ffffff;${alignStyle}font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu','Plus Jakarta Sans',serif;">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px dashed #cbd5e1;padding-bottom:6px;margin-bottom:8px;direction:${dirAttr};">
            <strong style="font-size:${qIsUrdu ? '16px' : '13.5px'};color:#065f46;font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu','Plus Jakarta Sans',serif;">${qLabel}</strong>
            <strong style="font-size:13px;background:#f1f5f9;padding:2px 10px;border-radius:6px;color:#0f172a;font-family:'Jameel Noori Nastaleeq','Plus Jakarta Sans',sans-serif;">${marksLabel}</strong>
          </div>
          <div class="${qIsUrdu ? 'urdu-text' : ''}" style="font-size:${qIsUrdu ? '18px' : '14px'};line-height:${qIsUrdu ? '2.2' : '1.75'};font-weight:700;letter-spacing:0px;white-space:pre-line;direction:${dirAttr};${alignStyle}font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu','Plus Jakarta Sans',serif;">${q.questionText}</div>
        </div>
      `;
      })
      .join('');

    return `
      <div style="font-family:'Plus Jakarta Sans','Jameel Noori Nastaleeq','Noto Nastaliq Urdu',sans-serif;">
        <div style="border:2px solid #0f172a;border-radius:12px;padding:12px 16px;margin-bottom:16px;background:#f8fafc;">
          <table style="margin:0;width:100%;border-collapse:collapse;font-family:'Plus Jakarta Sans','Jameel Noori Nastaleeq',sans-serif;">
            <tbody>
              <tr>
                <th style="width:18%;">Student Name:</th>
                <td style="width:32%;font-weight:700;">${paper.studentNameField || '__________________________'}</td>
                <th style="width:18%;">Class:</th>
                <td style="width:32%;font-family:'Jameel Noori Nastaleeq','Plus Jakarta Sans',sans-serif;"><strong>${paper.className}</strong></td>
              </tr>
              <tr>
                <th>Paper / Subject:</th>
                <td style="font-family:'Jameel Noori Nastaleeq','Plus Jakarta Sans',sans-serif;font-size:14px;"><strong>${paper.subject}</strong></td>
                <th>Date:</th>
                <td><strong>${paper.examDate}</strong></td>
              </tr>
              <tr>
                <th>Semester:</th>
                <td><strong>${paper.semester}</strong></td>
                <th>Total Marks:</th>
                <td><strong>${paper.totalMarks} Marks</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        ${
          isPaperUrdu
            ? `<div dir="rtl" class="urdu-text" style="background:#ecfdf5;border:1.5px solid #059669;border-radius:8px;padding:6px 14px;margin-bottom:14px;text-align:right;font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu',serif;font-size:16px;font-weight:700;color:#064e3b;">ہدایات: تمام سوالات حل کریں۔ ہر سوال کے نمبر سامنے درج ہیں۔ خوشخطی کا خاص خیال رکھیں۔</div>`
            : `<div style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:6px 12px;margin-bottom:14px;font-size:12px;font-weight:700;color:#334155;">Instructions: Attempt all questions neatly. Marks are indicated against each question.</div>`
        }
        ${questionsHtml}
      </div>
    `;
  };

  // Button 1: Create / Generate Paper
  const handleCreateGeneratePaper = () => {
    const isUrSubject =
      selectedSubjectLabel.toLowerCase().includes('urdu') ||
      selectedSubjectLabel.toLowerCase().includes('islamiat') ||
      selectedSubjectLabel.toLowerCase().includes('pashto');
    setIsUrduRtl(isUrSubject);
    const defaultQuestions: ExamQuestionItem[] = isUrSubject
      ? [
          {
            id: `q-${Date.now()}-1`,
            category: 'Short Questions',
            questionText: 'درج ذیل میں سے کسی پانچ مختصر سوالات کے جوابات تحریر کریں۔',
            marks: 20,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Words and Meanings',
            questionText: 'درج ذیل الفاظ کے معنی لکھیں اور جملوں میں استعمال کریں۔',
            marks: 15,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Singular and Plural',
            questionText: 'درج ذیل واحد الفاظ کے جمع لکھیں۔',
            marks: 10,
          },
          {
            id: `q-${Date.now()}-4`,
            category: 'Application Writing',
            questionText: 'ہیڈ ماسٹر صاحب کے نام بیماری کی درخواست تحریر کریں۔',
            marks: 15,
          },
        ]
      : [
          {
            id: `q-${Date.now()}-1`,
            category: 'Short Questions',
            questionText: `Answer any five short questions from ${selectedSubjectLabel} (${selectedClassLabel}).`,
            marks: 20,
          },
          {
            id: `q-${Date.now()}-2`,
            category: 'Words and Meanings',
            questionText: 'Write meanings of any five words and use them in sentences.',
            marks: 15,
          },
          {
            id: `q-${Date.now()}-3`,
            category: 'Detailed Questions',
            questionText: 'Write a comprehensive answer to the following long question.',
            marks: 15,
          },
          {
            id: `q-${Date.now()}-4`,
            category: 'Application Writing',
            questionText: 'Write an application to the Head Teacher for urgent piece of work.',
            marks: 10,
          },
        ];

    setQuestions(defaultQuestions);
    const paper = {
      ...buildCurrentPaperObject(),
      isUrduRtl: isUrSubject,
      questions: defaultQuestions,
      totalMarks: defaultQuestions.reduce((acc, q) => acc + q.marks, 0),
    };
    StorageService.addExamPaper(paper);
    setSavedPapers(
      StorageService.getExamPapers().filter((p) => p.semester === activeSemesterTab)
    );
    showToast(`Generated & saved new ${activeSemesterTab} paper for ${selectedSubjectLabel}!`);
  };

  // Button 2: Edit Paper
  const handleFocusEditPaper = () => {
    editorSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    showToast('Edit mode active: modify any question, marks, or header field below.');
  };

  // Button 3: Delete Current / Clear Paper
  const handleDeleteCurrentPaper = () => {
    setQuestions([]);
    showToast('Cleared current paper questions. Click "1. Create Paper" to generate a new template.');
  };

  // Button 4: Export PDF & Doc (Consistent with Print Preview & Jameel Noori Nastaleeq)
  const handleExportPdfAndDoc = () => {
    const paper = buildCurrentPaperObject();
    const html = buildPaperHtml(paper);
    const title = `${paper.semester}_${paper.className}_${paper.subject.split(' ')[0]}`;

    const pdfRes = exportAndSaveRealPdf(title, html, {
      folderSubPath: 'PDF & Print Records/Export PDF',
      moduleSource: 'EXAMINATION Module',
    });

    const docRes = exportAndSaveWordDoc(title, html, {
      folderSubPath: 'PDF & Print Records/Export PDF',
      moduleSource: 'EXAMINATION Module',
    });

    showToast(`Saved PDF (${pdfRes.filename}) and Word DOC (${docRes.filename}) matching Print Preview!`);
  };

  const handleSavePdfOnly = () => {
    const paper = buildCurrentPaperObject();
    const html = buildPaperHtml(paper);
    const title = `${paper.semester}_${paper.className}_${paper.subject.split(' ')[0]}`;
    const pdfRes = exportAndSaveRealPdf(title, html, {
      folderSubPath: 'PDF & Print Records/Export PDF',
      moduleSource: 'EXAMINATION Module',
    });
    showToast(`Saved Examination Paper PDF (${pdfRes.filename}) to ${pdfRes.folderPath}`);
  };

  const handleSaveDocOnly = () => {
    const paper = buildCurrentPaperObject();
    const html = buildPaperHtml(paper);
    const title = `${paper.semester}_${paper.className}_${paper.subject.split(' ')[0]}`;
    const docRes = exportAndSaveWordDoc(title, html, {
      folderSubPath: 'PDF & Print Records/Export PDF',
      moduleSource: 'EXAMINATION Module',
    });
    showToast(`Saved Examination Paper DOC (${docRes.filename}) to ${docRes.folderPath}`);
  };

  // Button 5: Print / Print Preview
  const handlePrintPreview = () => {
    const paper = buildCurrentPaperObject();
    printHtmlDocument(
      `${paper.semester} - ${paper.className} - ${paper.subject}`,
      buildPaperHtml(paper)
    );
  };

  const handleDirectPrintPaper = () => {
    const paper = buildCurrentPaperObject();
    const fullHtml = buildOfficialPrintHtml(
      `${paper.semester} - ${paper.className} - ${paper.subject}`,
      buildPaperHtml(paper),
      'portrait',
      true
    );
    executeIframePrint(fullHtml, `${paper.semester}_${paper.subject}`);
  };

  // Button 6: Share Paper
  const handleSharePaper = async () => {
    const paper = buildCurrentPaperObject();
    const html = buildPaperHtml(paper);
    const title = `${paper.semester} - ${paper.className} - ${paper.subject}`;
    const pdfBlob = generateRealPdfBlobFromHtml(title, html, false);
    const safeName = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
    await shareDocumentOrFile({
      title,
      text: `${title} (${paper.totalMarks} Marks) — GPS Chambai Kohat (EMIS: 16454)`,
      fileBlob: pdfBlob,
      filename: safeName,
      mimeType: 'application/pdf',
    });
    showToast('Shared Examination Paper!');
  };

  const handleSavePaperToDb = () => {
    const paper = buildCurrentPaperObject();
    StorageService.addExamPaper(paper);
    setSavedPapers(
      StorageService.getExamPapers().filter((p) => p.semester === activeSemesterTab)
    );
    showToast('Examination paper saved to database!');
  };

  const handleExportJpg = () => {
    const paper = buildCurrentPaperObject();
    const dataUrl = generateExamPaperJpgDataUrl({
      semester: paper.semester,
      className: paper.className,
      subject: paper.subject,
      examDate: paper.examDate,
      studentNameField: paper.studentNameField,
      totalMarks: paper.totalMarks,
      isUrduRtl: paper.isUrduRtl,
      questions: paper.questions,
    });
    const safeName = `${paper.semester.replace(/\s+/g, '_')}_${paper.className.replace(
      /[^a-zA-Z0-9]/g,
      '_'
    )}_${paper.subject.split(' ')[0]}.jpg`;
    const saved = saveFileToGpsChambaiFolder(safeName, dataUrl);
    showToast(`High-Res Exam Paper JPG saved to ${saved.folderPath}`);
  };

  const clsMeta =
    OFFICIAL_SIX_CLASSES.find((c) => c.kpSubjectDropdownLabel === selectedClassLabel) ||
    OFFICIAL_SIX_CLASSES[0];

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Top Bar: Unified EXAMINATION Module */}
      <div
        className="rounded-3xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-2"
        style={{
          background:
            activeSemesterTab === '1st Semester Exam'
              ? 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)'
              : 'linear-gradient(135deg, #9333EA 0%, #6B21A8 100%)',
        }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full">
              Unified Examination Suite • 1st &amp; 2nd Semester
            </span>
            <h2 className="text-lg font-black tracking-tight mt-0.5">
              {lang === 'ur' ? 'امتحانات (EXAMINATION)' : 'EXAMINATION'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={handlePrintPreview}
            className="px-2.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <Eye size={14} />
            <span>Print Preview</span>
          </button>
          <button
            onClick={handleDirectPrintPaper}
            className="px-2.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <Printer size={14} />
            <span>Direct Print</span>
          </button>
          <button
            onClick={handleSavePdfOnly}
            className="px-2.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <Download size={14} />
            <span>Save PDF</span>
          </button>
          <button
            onClick={handleSaveDocOnly}
            className="px-2.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <FileSpreadsheet size={14} />
            <span>Save DOC</span>
          </button>
          <button
            onClick={handleSavePaperToDb}
            className="px-2.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center gap-1"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
          <button
            onClick={handleExportJpg}
            className="px-2.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center gap-1 shadow-sm"
          >
            <ImageIcon size={14} />
            <span>JPG</span>
          </button>
        </div>
      </div>

      {/* REQUIREMENT 10.G: TWO TABS INSIDE EXAMINATION (1. 1st Semester | 2. 2nd Semester) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-200 p-1.5 rounded-2xl">
        <button
          type="button"
          onClick={() => setActiveSemesterTab('1st Semester Exam')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSemesterTab === '1st Semester Exam'
              ? 'bg-teal-700 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          1. 1st Semester (پہلا سمسٹر)
        </button>
        <button
          type="button"
          onClick={() => setActiveSemesterTab('2nd Semester Exam')}
          className={`py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all ${
            activeSemesterTab === '2nd Semester Exam'
              ? 'bg-purple-700 text-white shadow-md'
              : 'text-slate-700 hover:bg-white/60'
          }`}
        >
          2. 2nd Semester (دوسرا سمسٹر)
        </button>
      </div>

      {/* REQUIREMENT 10.G: 6 REQUIRED PAPER CREATION ACTION BUTTONS */}
      <div className="bg-white rounded-3xl p-3.5 border-2 border-slate-900 shadow-sm space-y-2">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 px-1">
          {activeSemesterTab} • Paper Creation &amp; Export Controls
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {/* 1. Create Button for Generate Paper */}
          <button
            type="button"
            onClick={handleCreateGeneratePaper}
            className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Plus size={14} />
            <span>1. Create Paper</span>
          </button>

          {/* 2. Edit Button */}
          <button
            type="button"
            onClick={handleFocusEditPaper}
            className="p-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Edit3 size={14} />
            <span>2. Edit Paper</span>
          </button>

          {/* 3. Delete Button */}
          <button
            type="button"
            onClick={handleDeleteCurrentPaper}
            className="p-2.5 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Trash2 size={14} />
            <span>3. Delete</span>
          </button>

          {/* 4. Export PDF, Doc Button */}
          <button
            type="button"
            onClick={handleExportPdfAndDoc}
            className="p-2.5 rounded-2xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Download size={14} />
            <span>4. Export PDF, Doc</span>
          </button>

          {/* 5. Print / Print Preview */}
          <button
            type="button"
            onClick={handlePrintPreview}
            className="p-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Printer size={14} />
            <span>5. Print / Preview</span>
          </button>

          {/* 6. Share Button */}
          <button
            type="button"
            onClick={handleSharePaper}
            className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <Share2 size={14} />
            <span>6. Share</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{statusBanner}</span>
        </div>
      )}

      {/* Exam Paper Header Fields */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Official Paper Header Configuration ({activeSemesterTab})
            </h3>
            <p className="text-sm font-black text-emerald-800">
              GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT (EMIS: 16454)
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsUrduRtl((v) => !v)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-colors ${
              isUrduRtl
                ? 'bg-emerald-700 text-white border-emerald-700'
                : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}
          >
            {isUrduRtl ? 'Direction: Urdu RTL (اردو دائیں سے بائیں)' : 'Direction: English LTR'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              1. Select Class (All 6 Official Classes)
            </label>
            <select
              value={selectedClassLabel}
              onChange={(e) => setSelectedClassLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            >
              {OFFICIAL_SIX_CLASSES.map((c) => (
                <option key={c.id} value={c.kpSubjectDropdownLabel}>
                  {c.kpSubjectDropdownLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              2. Paper / Subject (Mapped KP Official Subjects)
            </label>
            <select
              value={selectedSubjectLabel}
              onChange={(e) => setSelectedSubjectLabel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            >
              {getSubjectsForClass(selectedClassLabel).map((b) => (
                <option key={b.id} value={b.fullLabel}>
                  {b.fullLabel}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              3. Student Name (Leave blank for printable line or type name)
            </label>
            <input
              type="text"
              value={studentNameField}
              onChange={(e) => setStudentNameField(e.target.value)}
              placeholder="Blank for _____________________ on printed paper"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              4. Examination Date
            </label>
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>
        </div>
      </div>

      {/* Add Question Builder */}
      <form
        onSubmit={handleAddQuestion}
        className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Add Question to Paper (9 Official Categories)
          </h3>
          <span
            className="text-xs font-black px-2.5 py-0.5 rounded-full text-white"
            style={{ backgroundColor: getClassHexColor(clsMeta.id) }}
          >
            Total Marks: {totalMarks}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              Question Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as ExamQuestionCategory)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            >
              {NINE_QUESTION_CATEGORIES.map((cat) => (
                <option key={cat.category} value={cat.category}>
                  {cat.category} — ({cat.urdu})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-black text-slate-700 mb-1">
              Marks for Question
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={newQuestionMarks}
              onChange={(e) => setNewQuestionMarks(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            Question Text (Supports English LTR &amp; Urdu RTL / اردو)
          </label>
          <textarea
            rows={2}
            dir={isUrduRtl ? 'rtl' : 'auto'}
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            placeholder={
              isUrduRtl
                ? 'یہاں سوال درج کریں (مثلاً: درج ذیل الفاظ کے معنی لکھیں)...'
                : 'Type question prompt here...'
            }
            className={`w-full px-3 py-2 rounded-xl border border-slate-300 font-bold ${
              isUrduRtl ? 'font-urdu text-base leading-loose text-right' : 'text-xs'
            }`}
          />
        </div>

        <button
          type="submit"
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5"
        >
          <Plus size={15} />
          <span>Add Question to Examination Paper</span>
        </button>
      </form>

      {/* Live Printable Examination Paper Preview & Editor */}
      <div
        ref={editorSectionRef}
        className="bg-white rounded-3xl p-5 border-2 border-slate-900 shadow-md space-y-4"
      >
        <div className="text-center border-b-2 border-slate-900 pb-3 space-y-1">
          <div className="text-base sm:text-lg font-black text-slate-950 tracking-tight">
            GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT
          </div>
          <div className="text-xs font-extrabold text-emerald-800 uppercase">
            {activeSemesterTab} • Academic Session 2025-26
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-[11px] text-left bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <div>
              <strong>Student:</strong> {studentNameField || '_________________'}
            </div>
            <div>
              <strong>Class:</strong> {clsMeta.displayName}
            </div>
            <div>
              <strong>Paper:</strong> {selectedSubjectLabel}
            </div>
            <div>
              <strong>Date:</strong> {examDate} | <strong>Marks: {totalMarks}</strong>
            </div>
          </div>
        </div>

        <div className="space-y-3" dir={isUrduRtl ? 'rtl' : 'ltr'}>
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black text-emerald-800">
                  Q{index + 1}: {q.category}
                </span>

                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-black">
                    <span>Marks:</span>
                    <input
                      type="number"
                      value={q.marks}
                      onChange={(e) =>
                        handleUpdateQuestionMarks(q.id, Number(e.target.value))
                      }
                      className="w-12 text-center font-black text-slate-900 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(index, -1)}
                    disabled={index === 0}
                    className="p-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                    title="Move Up"
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveQuestion(index, 1)}
                    disabled={index === questions.length - 1}
                    className="p-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40"
                    title="Move Down"
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteQuestion(q.id)}
                    className="p-1 rounded-lg bg-rose-50 text-rose-600"
                    title="Delete Question"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <textarea
                rows={2}
                dir={isUrduRtl || containsUrduText(q.questionText) ? 'rtl' : 'auto'}
                value={q.questionText}
                onChange={(e) => handleUpdateQuestionText(q.id, e.target.value)}
                className={`w-full p-2.5 rounded-xl bg-white border border-slate-200 font-bold text-slate-900 ${
                  isUrduRtl || containsUrduText(q.questionText)
                    ? 'font-urdu text-base leading-loose text-right'
                    : 'text-xs leading-relaxed'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Saved Papers for Current Semester Tab */}
      {savedPapers.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
            Saved {activeSemesterTab} Papers ({savedPapers.length})
          </h4>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5' : 'space-y-2'}>
            {savedPapers.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-2"
              >
                <div>
                  <div className="text-xs font-black text-slate-900">
                    {p.className} — {p.subject}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-500">
                    {p.questions.length} Questions • Total Marks: {p.totalMarks} • Date: {p.examDate}
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      const cls = OFFICIAL_SIX_CLASSES.find((c) => c.id === p.classId);
                      if (cls) setSelectedClassLabel(cls.kpSubjectDropdownLabel);
                      setSelectedSubjectLabel(p.subject);
                      setExamDate(p.examDate);
                      setIsUrduRtl(p.isUrduRtl);
                      setQuestions(p.questions);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-black flex items-center gap-1"
                  >
                    <FileText size={12} />
                    <span>Load</span>
                  </button>
                  <button
                    onClick={() => {
                      StorageService.deleteExamPaper(p.id);
                      setSavedPapers(
                        StorageService.getExamPapers().filter(
                          (x) => x.semester === activeSemesterTab
                        )
                      );
                    }}
                    className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
