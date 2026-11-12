import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Printer,
  Trash2,
  Edit3,
  BookOpen,
  X,
  Calendar,
  User,
  CheckCircle2,
  Search,
  Eye,
  Sparkles,
  Layout,
  Clock,
  Target,
  Brain,
  Lightbulb,
  Download,
  FileText,
  Share2,
} from 'lucide-react';
import { LessonPlanItem, LessonPlanStep } from '../../../types';
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
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  shareDocumentOrFile,
} from '../../../services/printAndFileService';
import {
  LessonPlanImage007View,
  generateImage007PrintHtml,
} from './LessonPlanImage007View';
import { ViewModeToggle, useViewMode } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

export const LessonPlansSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [plans, setPlans] = useState<LessonPlanItem[]>([]);
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [listGridMode, setListGridMode] = useViewMode('lesson_plans', 'list');
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  // View mode: 'cards' or 'image007'
  const [viewMode, setViewMode] = useState<'cards' | 'image007'>('cards');
  const [activePlanFor007, setActivePlanFor007] = useState<LessonPlanItem | null>(null);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<LessonPlanItem | null>(null);
  const [formTab, setFormTab] = useState<'general' | 'objectives' | 'steps' | 'evaluation'>('general');

  // Form Fields matching Image 007
  const [classId, setClassId] = useState('c-5');
  const [subject, setSubject] = useState('General Science');
  const [teacherName, setTeacherName] = useState('Muhammad Ismail (PSHT)');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('40 Minutes');
  const [topic, setTopic] = useState('');

  // Section 2: Learning Objectives
  const [knowledge, setKnowledge] = useState('');
  const [skills, setSkills] = useState('');
  const [attitude, setAttitude] = useState('');

  // Section 3: Previous Knowledge
  const [previousKnowledge, setPreviousKnowledge] = useState('');

  // Section 4: Teaching Aids
  const [aidsBooks, setAidsBooks] = useState(true);
  const [aidsCharts, setAidsCharts] = useState(true);
  const [aidsWhiteboard, setAidsWhiteboard] = useState(true);
  const [aidsMultimedia, setAidsMultimedia] = useState(false);
  const [aidsOthers, setAidsOthers] = useState('');

  // Section 5: Introduction
  const [introduction, setIntroduction] = useState('');

  // Section 6: Steps 1 to 4
  const [step1Teacher, setStep1Teacher] = useState('Introduce topic on whiteboard, write SLOs and key terms.');
  const [step1Student, setStep1Student] = useState('Listen attentively and note down topic heading.');
  const [step1Time, setStep1Time] = useState('5 min');

  const [step2Teacher, setStep2Teacher] = useState('Explain main concepts with illustrative charts and textbook.');
  const [step2Student, setStep2Student] = useState('Observe diagrams and answer initial inquiry questions.');
  const [step2Time, setStep2Time] = useState('15 min');

  const [step3Teacher, setStep3Teacher] = useState('Conduct interactive board activity and pair exercises.');
  const [step3Student, setStep3Student] = useState('Solve questions in pairs and present on whiteboard.');
  const [step3Time, setStep3Time] = useState('12 min');

  const [step4Teacher, setStep4Teacher] = useState('Summarize key learning points, review, and assign homework.');
  const [step4Student, setStep4Student] = useState('Ask queries, repeat summary, and record homework.');
  const [step4Time, setStep4Time] = useState('8 min');

  // Section 7: Practice
  const [practiceActivity, setPracticeActivity] = useState('');

  // Section 8: Assessment
  const [assessment, setAssessment] = useState('');

  // Section 9: Conclusion
  const [conclusion, setConclusion] = useState('');

  // Section 10: Homework
  const [homework, setHomework] = useState('');

  // Section 11: Reflection
  const [reflection, setReflection] = useState('');

  const refresh = () => {
    const list = StorageService.getLessonPlans();
    setPlans(list);
    if (!activePlanFor007 && list.length > 0) {
      setActivePlanFor007(list[0]);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const openAddModal = () => {
    setEditingPlan(null);
    setClassId('c-5');
    setSubject('General Science');
    setTeacherName('Muhammad Ismail (PSHT)');
    setDate(new Date().toISOString().split('T')[0]);
    setDuration('40 Minutes');
    setTopic('');
    setKnowledge('Identify key definitions, solar system bodies, and functions.');
    setSkills('Draw diagrams in notebook, label parts, and compare properties.');
    setAttitude('Show curiosity, respect scientific inquiry, and active teamwork.');
    setPreviousKnowledge('Students observe sun, moon, stars daily and know basic day/night cycle.');
    setAidsBooks(true);
    setAidsCharts(true);
    setAidsWhiteboard(true);
    setAidsMultimedia(false);
    setAidsOthers('Notebooks, flashcards');
    setIntroduction('Ask warm-up questions about what appears in the sky; show chart illustration.');
    setStep1Teacher('Introduce topic on whiteboard, write SLOs and key terms.');
    setStep1Student('Listen attentively and note down topic heading.');
    setStep1Time('5 min');
    setStep2Teacher('Explain main concepts with illustrative charts and textbook.');
    setStep2Student('Observe diagrams and answer initial inquiry questions.');
    setStep2Time('15 min');
    setStep3Teacher('Conduct interactive board activity and pair exercises.');
    setStep3Student('Solve questions in pairs and present on whiteboard.');
    setStep3Time('12 min');
    setStep4Teacher('Summarize key learning points, review, and assign homework.');
    setStep4Student('Ask queries, repeat summary, and record homework.');
    setStep4Time('8 min');
    setPracticeActivity('Group work on textbook exercise questions and diagram drawing in notebooks.');
    setAssessment('Oral questions, board presentation, and notebook exercise evaluation.');
    setConclusion('Summarize key points, ask 2 quick check questions, link to next topic.');
    setHomework('Read textbook pages and answer questions 1 & 2 in homework notebook.');
    setReflection('Students participated actively; concept grasped well. Review diagrams tomorrow.');
    setFormTab('general');
    setShowModal(true);
  };

  const openEditModal = (plan: LessonPlanItem) => {
    setEditingPlan(plan);
    const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
    setClassId(clsMeta.id);
    setSubject(plan.subject);
    setTeacherName(plan.teacherName || 'Muhammad Ismail (PSHT)');
    setDate(plan.date || new Date().toISOString().split('T')[0]);
    setDuration(plan.duration || '40 Minutes');
    setTopic(plan.topic);

    setKnowledge(
      plan.knowledge ||
        (plan.learningObjectives ? plan.learningObjectives.split('.')[0] : '')
    );
    setSkills(
      plan.skills ||
        (plan.learningObjectives && plan.learningObjectives.split('.').length > 1
          ? plan.learningObjectives.split('.')[1]
          : '')
    );
    setAttitude(plan.attitude || 'Curiosity, inquiry, and classroom discipline.');
    setPreviousKnowledge(
      plan.previousKnowledge ||
        'Recalled from previous class through introductory verbal questioning.'
    );

    const aids = plan.teachingAidsList || {
      books: true,
      charts: true,
      whiteboard: true,
      multimedia: false,
      others: plan.teachingMaterials || '',
    };
    setAidsBooks(aids.books ?? true);
    setAidsCharts(aids.charts ?? true);
    setAidsWhiteboard(aids.whiteboard ?? true);
    setAidsMultimedia(aids.multimedia ?? false);
    setAidsOthers(aids.others || plan.teachingMaterials || '');

    setIntroduction(
      plan.introduction ||
        'Ask warm-up questions to hook interest and show visual chart.'
    );

    const s = plan.steps || [];
    setStep1Teacher(s[0]?.teacherActivity || 'Introduce topic on whiteboard, write SLOs.');
    setStep1Student(s[0]?.studentActivity || 'Listen attentively and note down topic.');
    setStep1Time(s[0]?.time || '5 min');

    setStep2Teacher(s[1]?.teacherActivity || 'Explain main concepts with illustrative charts.');
    setStep2Student(s[1]?.studentActivity || 'Observe diagrams and follow textbook.');
    setStep2Time(s[1]?.time || '15 min');

    setStep3Teacher(s[2]?.teacherActivity || 'Facilitate pair activity and board practice.');
    setStep3Student(s[2]?.studentActivity || 'Solve exercises in rough notebooks.');
    setStep3Time(s[2]?.time || '12 min');

    setStep4Teacher(s[3]?.teacherActivity || 'Recap lesson and assign homework.');
    setStep4Student(s[3]?.studentActivity || 'Note down homework assignment.');
    setStep4Time(s[3]?.time || '8 min');

    setPracticeActivity(plan.practiceActivity || plan.activities || '');
    setAssessment(plan.assessment || 'Oral questioning & notebook inspection');
    setConclusion(plan.conclusion || 'Summarize key points and assign homework');
    setHomework(plan.homework || '');
    setReflection(plan.reflection || plan.remarks || '');

    setFormTab('general');
    setShowModal(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    const clsMeta = getClassMetaByIdOrName(classId);

    const stepsList: LessonPlanStep[] = [
      { stepNumber: 1, teacherActivity: step1Teacher, studentActivity: step1Student, time: step1Time },
      { stepNumber: 2, teacherActivity: step2Teacher, studentActivity: step2Student, time: step2Time },
      { stepNumber: 3, teacherActivity: step3Teacher, studentActivity: step3Student, time: step3Time },
      { stepNumber: 4, teacherActivity: step4Teacher, studentActivity: step4Student, time: step4Time },
    ];

    const compositeObjectives = `${knowledge}. ${skills}. ${attitude}`.trim();
    const compositeMaterials = [
      aidsBooks ? 'Books' : '',
      aidsCharts ? 'Charts/Images' : '',
      aidsWhiteboard ? 'Whiteboard/Markers' : '',
      aidsMultimedia ? 'Multimedia' : '',
      aidsOthers ? aidsOthers : '',
    ]
      .filter(Boolean)
      .join(', ');

    const record: LessonPlanItem = {
      id: editingPlan ? editingPlan.id : `lp-${Date.now()}`,
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: subject.trim(),
      teacherName: teacherName.trim(),
      date,
      week: date,
      duration: duration.trim(),
      topic: topic.trim(),

      // Image 007 full sections
      knowledge: knowledge.trim(),
      skills: skills.trim(),
      attitude: attitude.trim(),
      learningObjectives: compositeObjectives,
      slo: compositeObjectives,

      previousKnowledge: previousKnowledge.trim(),

      teachingAidsList: {
        books: aidsBooks,
        charts: aidsCharts,
        whiteboard: aidsWhiteboard,
        multimedia: aidsMultimedia,
        others: aidsOthers.trim(),
      },
      teachingMaterials: compositeMaterials,

      introduction: introduction.trim(),
      introDuration: '5-10 min',

      steps: stepsList,

      practiceActivity: practiceActivity.trim(),
      activities: practiceActivity.trim(),

      assessment: assessment.trim(),
      assessmentMethods: {
        oral: true,
        worksheet: true,
        observation: true,
      },

      conclusion: conclusion.trim(),
      homework: homework.trim(),
      reflection: reflection.trim(),
      remarks: reflection.trim(),
    };

    StorageService.saveLessonPlan(record);
    setShowModal(false);
    setEditingPlan(null);
    refresh();

    // If currently viewing Image 007, update active plan
    setActivePlanFor007(record);
  };

  const handlePrintImage007 = (plan: LessonPlanItem) => {
    const html = generateImage007PrintHtml(plan);
    const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
    printHtmlDocument(
      `Teacher Lesson Plan (Image 007) — ${plan.topic} (${clsMeta.displayName})`,
      html,
      'portrait',
      false
    );
  };

  const handleDirectPrintPlan = (plan: LessonPlanItem) => {
    const html = generateImage007PrintHtml(plan);
    executeIframePrint(html);
  };

  const handleSavePlanPdf = async (plan: LessonPlanItem) => {
    const html = generateImage007PrintHtml(plan);
    const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
    await exportAndSaveRealPdf(
      `Teacher Lesson Plan — ${plan.topic} (${clsMeta.displayName})`,
      html,
      [],
      `Lesson_Plan_${plan.topic.replace(/\s+/g, '_')}.pdf`,
      'Lesson Plans/PDF Lesson Plans'
    );
    showToast('Saved Lesson Plan PDF to GPS Chambai/Lesson Plans/PDF Lesson Plans/');
  };

  const handleSavePlanDoc = async (plan: LessonPlanItem) => {
    const html = generateImage007PrintHtml(plan);
    const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
    await exportAndSaveWordDoc(
      `Teacher Lesson Plan — ${plan.topic} (${clsMeta.displayName})`,
      html,
      `Lesson_Plan_${plan.topic.replace(/\s+/g, '_')}.doc`,
      'Lesson Plans/Doc Lesson Plans'
    );
    showToast('Saved Lesson Plan Word Doc to GPS Chambai/Lesson Plans/Doc Lesson Plans/');
  };

  const handleSharePlan = async (plan: LessonPlanItem) => {
    const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
    await shareDocumentOrFile({
      title: `Lesson Plan: ${plan.topic}`,
      text: `GPS Chambai Lesson Plan — ${clsMeta.displayName} (${plan.subject}): ${plan.topic}\nObjectives: ${plan.learningObjectives || plan.knowledge}\nHomework: ${plan.homework}`,
    });
  };

  const handlePreviewPlan007 = (plan: LessonPlanItem) => {
    setActivePlanFor007(plan);
    setViewMode('image007');
  };

  const filteredPlans = plans.filter((p) => {
    const clsMeta = getClassMetaByIdOrName(p.classId || p.className);
    const matchesClass = selectedClassFilter === 'ALL' || clsMeta.id === selectedClassFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      p.topic.toLowerCase().includes(q) ||
      p.subject.toLowerCase().includes(q) ||
      (p.teacherName || '').toLowerCase().includes(q);
    return matchesClass && matchesSearch;
  });

  return (
    <div className="p-3.5 space-y-4 pb-12 animate-fade-in max-w-5xl mx-auto">
      {statusToast && (
        <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-xl border border-emerald-400/40">
          {statusToast}
        </div>
      )}
      {/* Top School Header with "GPS Chambai Kohat" */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-800 text-white rounded-3xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-amber-400 shrink-0 overflow-hidden hidden xs:flex items-center justify-center">
            <img
              src="/assets/aistudio/20260903_200547_79893d25.png"
              alt="GPS Chambai Kohat"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                GPS Chambai Kohat
              </span>
              <span className="text-[10px] font-bold text-emerald-200">EMIS: 16454</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight mt-1">
              {lang === 'ur'
                ? 'اسباق کی تفصیلی منصوبہ بندی (Lesson Plans)'
                : 'Teacher Lesson Plans'}
            </h2>
            <p className="text-[11px] text-emerald-100 font-semibold">
              Elementary & Secondary Education KP • Image 007 Page Layout
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-center flex-wrap">
          <ViewModeToggle mode={listGridMode} onChange={setListGridMode} dark />
          {/* Toggle between Card List and Image 007 Preview */}
          <div className="bg-white/15 p-1 rounded-2xl flex items-center gap-1 border border-white/20">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Layout size={13} />
              <span>Cards List</span>
            </button>
            <button
              onClick={() => {
                if (filteredPlans.length > 0 && !activePlanFor007) {
                  setActivePlanFor007(filteredPlans[0]);
                }
                setViewMode('image007');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 transition-all ${
                viewMode === 'image007'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Sparkles size={13} className="text-amber-300" />
              <span>Image 007 Layout</span>
            </button>
          </div>

          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* When in Image 007 Mode: Show Interactive Image 007 Page Layout */}
      {viewMode === 'image007' ? (
        <div className="space-y-4">
          {/* Quick Plan Selector Bar */}
          <div className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-xs flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider shrink-0 pl-1">
              Select Plan:
            </span>
            {filteredPlans.map((p) => {
              const isSelected = activePlanFor007?.id === p.id;
              const cls = getClassMetaByIdOrName(p.classId || p.className);
              return (
                <button
                  key={p.id}
                  onClick={() => setActivePlanFor007(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap shrink-0 transition-all ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cls.displayName}: {p.topic.slice(0, 24)}...
                </button>
              );
            })}
          </div>

          {activePlanFor007 ? (
            <LessonPlanImage007View
              plan={activePlanFor007}
              onBack={() => setViewMode('cards')}
              onEdit={openEditModal}
              lang={lang}
            />
          ) : (
            <div className="bg-white rounded-3xl p-12 text-center text-slate-500 border border-slate-200">
              <p className="font-bold text-sm">No lesson plan selected.</p>
            </div>
          )}
        </div>
      ) : (
        /* When in Cards Mode */
        <>
          {/* Search & Class Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lesson plan by topic, subject, or teacher name..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <button
                onClick={() => setSelectedClassFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                  selectedClassFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-700 border border-slate-200'
                }`}
              >
                All Classes ({plans.length})
              </button>
              {OFFICIAL_SIX_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.id)}
                  style={
                    selectedClassFilter === cls.id
                      ? { backgroundColor: cls.hex, color: '#FFFFFF' }
                      : undefined
                  }
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                    selectedClassFilter === cls.id
                      ? 'shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {cls.displayName}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Lesson Plan Cards */}
          <div className={listGridMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-3.5' : 'space-y-3.5'}>
            {filteredPlans.map((plan) => {
              const clsMeta = getClassMetaByIdOrName(plan.classId || plan.className);
              const clsColor = getClassHexColor(clsMeta.id);

              return (
                <div
                  key={plan.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
                >
                  {/* Card Top Strip with School Name & Class Badge */}
                  <div
                    className="px-4 py-3 text-white flex flex-wrap items-center justify-between gap-2"
                    style={{ backgroundColor: clsColor }}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-black uppercase tracking-wider bg-black/25 px-2 py-0.5 rounded-full">
                            GPS Chambai Kohat
                          </span>
                          <span className="text-xs font-black">{clsMeta.displayName}</span>
                          <span>•</span>
                          <span className="text-xs font-black">{plan.subject}</span>
                        </div>
                        <h3 className="text-base font-black tracking-tight mt-0.5">
                          Topic: {plan.topic}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Image 007 Preview Button */}
                      <button
                        onClick={() => handlePreviewPlan007(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                      >
                        <Sparkles size={13} />
                        <span>Preview 007</span>
                      </button>

                      <button
                        onClick={() => handlePrintImage007(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-white text-slate-900 text-[11px] font-black flex items-center gap-1 shadow-xs hover:bg-slate-100"
                        title="Print Preview in Image 007 Layout"
                      >
                        <Eye size={12} />
                        <span>Print Preview</span>
                      </button>

                      <button
                        onClick={() => handleDirectPrintPlan(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-900/70 hover:bg-slate-900 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
                        title="Direct Print in Image 007 Layout"
                      >
                        <Printer size={12} />
                        <span>Direct Print</span>
                      </button>

                      <button
                        onClick={() => handleSavePlanPdf(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-950 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
                        title="Save as PDF (Image 007 Layout)"
                      >
                        <Download size={12} />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => handleSavePlanDoc(plan)}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-950/60 hover:bg-sky-950 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
                        title="Export Word Doc (Image 007 Layout)"
                      >
                        <FileText size={12} />
                        <span>DOC</span>
                      </button>

                      <button
                        onClick={() => handleSharePlan(plan)}
                        className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white"
                        title="Share Lesson Plan"
                      >
                        <Share2 size={14} />
                      </button>

                      <button
                        onClick={() => openEditModal(plan)}
                        className="p-1.5 rounded-xl bg-black/20 hover:bg-black/30 text-white"
                        title="Edit Lesson Plan"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm('Delete this lesson plan?')) {
                            StorageService.deleteLessonPlan(plan.id);
                            refresh();
                          }
                        }}
                        className="p-1.5 rounded-xl bg-black/20 hover:bg-rose-600 text-white"
                        title="Delete Lesson Plan"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Meta Bar: Teacher Name & Date & Duration */}
                  <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <User size={13} className="text-emerald-700" />
                      <span>Teacher: {plan.teacherName || 'Muhammad Ismail (PSHT)'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-sky-700" />
                        <span>Duration: {plan.duration || '40 Minutes'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar size={13} className="text-emerald-700" />
                        <span>Date: {plan.date || plan.week}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed 6-Point Preview Grid */}
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-1">
                      <div className="font-black text-emerald-900 flex items-center justify-between">
                        <span>2. Learning Objectives (SLOs)</span>
                        <span className="text-[10px] text-emerald-700 font-bold">Image 007 Section 2</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {plan.knowledge
                          ? `Knowledge: ${plan.knowledge}`
                          : plan.learningObjectives || plan.slo || 'SLOs not specified'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-1">
                      <div className="font-black text-blue-900 flex items-center justify-between">
                        <span>4. Teaching Aids (Materials)</span>
                        <span className="text-[10px] text-blue-700 font-bold">Section 4</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {plan.teachingMaterials || 'Textbook, charts, whiteboard markers'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-1 sm:col-span-2">
                      <div className="font-black text-purple-900 flex items-center justify-between">
                        <span>6. Presentation / Teaching Steps (1-4)</span>
                        <span className="text-[10px] text-purple-700 font-bold">Section 6</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {plan.steps && plan.steps.length > 0
                          ? `Step 1 (${plan.steps[0].time}): ${plan.steps[0].teacherActivity} • Step 2: ${plan.steps[1]?.teacherActivity}`
                          : plan.activities || 'Interactive presentation & practice steps.'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1">
                      <div className="font-black text-amber-900 flex items-center justify-between">
                        <span>8. Assessment / Evaluation</span>
                        <span className="text-[10px] text-amber-700 font-bold">Section 8</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {plan.assessment || 'Oral questioning & notebook checking'}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-1">
                      <div className="font-black text-rose-900 flex items-center justify-between">
                        <span>10. Homework Assignment</span>
                        <span className="text-[10px] text-rose-700 font-bold">Section 10</span>
                      </div>
                      <p className="text-slate-700 font-medium leading-relaxed">
                        {plan.homework || 'Practice exercise in homework notebook'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add / Edit Lesson Plan Modal (Image 007 compliant) */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <form
            onSubmit={handleSave}
            className="bg-white w-full max-w-2xl rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                  GPS Chambai Kohat • Image 007 Layout Editor
                </span>
                <h3 className="text-base font-black text-slate-900">
                  {editingPlan ? 'Edit Lesson Plan (Image 007)' : 'Create New Lesson Plan (Image 007)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Section Tabs */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl">
              {[
                { id: 'general', label: '1. General Info & Aids' },
                { id: 'objectives', label: '2. Objectives & Intro' },
                { id: 'steps', label: '3. Steps 1-4' },
                { id: 'evaluation', label: '4. Evaluation & HW' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFormTab(tab.id as any)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-all ${
                    formTab === tab.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* TAB 1: General Info & Teaching Aids */}
            {formTab === 'general' && (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Class (جماعت)
                    </label>
                    <select
                      value={classId}
                      onChange={(e) => {
                        const nextClassId = e.target.value;
                        setClassId(nextClassId);
                        const cls = getClassMetaByIdOrName(nextClassId);
                        const subs = getSubjectsForClass(cls.kpSubjectDropdownLabel);
                        if (subs.length > 0) setSubject(subs[0].english);
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    >
                      {OFFICIAL_SIX_CLASSES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.displayName} ({c.urduName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Subject (مضمون)
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="col-span-1">
                    <label className="block font-black text-slate-700 mb-1">
                      Teacher Name
                    </label>
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Date
                    </label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-slate-700 mb-1">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Lesson Topic / Title (عنوان)
                  </label>
                  <input
                    type="text"
                    required
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Solar System & Planets / پھول اور پودے"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div className="border border-amber-200 rounded-2xl p-3 bg-amber-50/50 space-y-2">
                  <span className="font-black text-amber-900 block">
                    4. Teaching Aids / Materials (تدریسی معاونات)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-700">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aidsBooks}
                        onChange={(e) => setAidsBooks(e.target.checked)}
                        className="rounded"
                      />
                      <span>Books (Textbook)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aidsCharts}
                        onChange={(e) => setAidsCharts(e.target.checked)}
                        className="rounded"
                      />
                      <span>Charts / Images</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aidsWhiteboard}
                        onChange={(e) => setAidsWhiteboard(e.target.checked)}
                        className="rounded"
                      />
                      <span>Whiteboard / Markers</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aidsMultimedia}
                        onChange={(e) => setAidsMultimedia(e.target.checked)}
                        className="rounded"
                      />
                      <span>Multimedia / Models</span>
                    </label>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 mb-0.5 text-[11px]">
                      Others:
                    </label>
                    <input
                      type="text"
                      value={aidsOthers}
                      onChange={(e) => setAidsOthers(e.target.value)}
                      placeholder="e.g., flashcard cutouts, realia"
                      className="w-full px-2.5 py-1.5 rounded-lg border border-amber-300 bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: Objectives, Previous Knowledge & Introduction */}
            {formTab === 'objectives' && (
              <div className="space-y-3 text-xs">
                <div className="border border-green-200 rounded-2xl p-3 bg-green-50/40 space-y-2">
                  <span className="font-black text-green-900 block">
                    2. Learning Objectives (By the end of lesson, students will be able to:)
                  </span>
                  <div>
                    <label className="block font-bold text-green-800 mb-0.5">
                      • KNOWLEDGE (علمی مقاصد)
                    </label>
                    <input
                      type="text"
                      value={knowledge}
                      onChange={(e) => setKnowledge(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-green-300 bg-white"
                      placeholder="Identify, define, or name concepts..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-blue-800 mb-0.5">
                      • SKILLS (مہارتی مقاصد)
                    </label>
                    <input
                      type="text"
                      value={skills}
                      onChange={(e) => setSkills(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-blue-300 bg-white"
                      placeholder="Draw diagrams, solve exercises, or explain..."
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-pink-800 mb-0.5">
                      • ATTITUDE (رویاتی مقاصد)
                    </label>
                    <input
                      type="text"
                      value={attitude}
                      onChange={(e) => setAttitude(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-pink-300 bg-white"
                      placeholder="Curiosity, cleanliness, teamwork..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-purple-900 mb-1">
                    3. Previous Knowledge (سابقہ معلومات)
                  </label>
                  <textarea
                    rows={2}
                    value={previousKnowledge}
                    onChange={(e) => setPreviousKnowledge(e.target.value)}
                    placeholder="What students already know related to the topic..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-teal-900 mb-1">
                    5. Introduction / Set Induction (5-10 min) (تعارف و تمہید)
                  </label>
                  <textarea
                    rows={2}
                    value={introduction}
                    onChange={(e) => setIntroduction(e.target.value)}
                    placeholder="Ask questions to engage students, show picture, connect to real life..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: Steps 1 to 4 Table */}
            {formTab === 'steps' && (
              <div className="space-y-3 text-xs">
                <span className="font-black text-rose-900 block">
                  6. Presentation / Teaching Steps Table (4 Steps)
                </span>

                {[
                  {
                    step: 1,
                    tVal: step1Teacher,
                    setT: setStep1Teacher,
                    sVal: step1Student,
                    setS: setStep1Student,
                    timeVal: step1Time,
                    setTime: setStep1Time,
                  },
                  {
                    step: 2,
                    tVal: step2Teacher,
                    setT: setStep2Teacher,
                    sVal: step2Student,
                    setS: setStep2Student,
                    timeVal: step2Time,
                    setTime: setStep2Time,
                  },
                  {
                    step: 3,
                    tVal: step3Teacher,
                    setT: setStep3Teacher,
                    sVal: step3Student,
                    setS: setStep3Student,
                    timeVal: step3Time,
                    setTime: setStep3Time,
                  },
                  {
                    step: 4,
                    tVal: step4Teacher,
                    setT: setStep4Teacher,
                    sVal: step4Student,
                    setS: setStep4Student,
                    timeVal: step4Time,
                    setTime: setStep4Time,
                  },
                ].map((item) => (
                  <div
                    key={item.step}
                    className="p-2.5 rounded-2xl bg-rose-50/50 border border-rose-200 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-rose-800 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px]">
                          {item.step}
                        </span>
                        <span>Step {item.step}</span>
                      </span>
                      <input
                        type="text"
                        value={item.timeVal}
                        onChange={(e) => item.setTime(e.target.value)}
                        className="w-20 px-2 py-0.5 rounded-md border border-rose-300 text-center font-bold bg-white text-[11px]"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Teacher Activity
                        </label>
                        <textarea
                          rows={2}
                          value={item.tVal}
                          onChange={(e) => item.setT(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                          Student Activity
                        </label>
                        <textarea
                          rows={2}
                          value={item.sVal}
                          onChange={(e) => item.setS(e.target.value)}
                          className="w-full p-2 rounded-lg border border-slate-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* TAB 4: Evaluation, Practice, Homework & Reflection */}
            {formTab === 'evaluation' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-black text-blue-900 mb-1">
                    7. Practice / Activity (مشق و سرگرمی)
                  </label>
                  <textarea
                    rows={2}
                    value={practiceActivity}
                    onChange={(e) => setPracticeActivity(e.target.value)}
                    placeholder="Group work / Pair work, Worksheet / Exercise, Hands-on activity..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-green-900 mb-1">
                    8. Assessment / Evaluation (جائزہ)
                  </label>
                  <input
                    type="text"
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Oral Questions, Worksheet/Quiz, Observation..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-orange-900 mb-1">
                    9. Conclusion / Recap (خلاصہ سبق)
                  </label>
                  <input
                    type="text"
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="Summarize key points, Ask review questions, Connect to next lesson..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-purple-900 mb-1">
                    10. Homework / Assignment (ہوم ورک)
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={homework}
                    onChange={(e) => setHomework(e.target.value)}
                    placeholder="Textbook exercises, questions, drawing tasks..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>

                <div>
                  <label className="block font-black text-amber-900 mb-1">
                    11. Reflection / Teacher Notes (کیفیت و خود احتسابی)
                  </label>
                  <textarea
                    rows={2}
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Teacher reflection on lesson outcomes and improvements..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md transition-all"
              >
                Save Lesson Plan
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
