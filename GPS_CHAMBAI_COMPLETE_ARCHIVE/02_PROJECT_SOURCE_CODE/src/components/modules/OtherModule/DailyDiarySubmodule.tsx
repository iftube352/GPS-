import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Calendar,
  Share2,
  Printer,
  Trash2,
  Edit3,
  CheckCircle2,
  Clock,
  User,
  MessageCircle,
  AlertCircle,
  X,
  Send,
  Sparkles,
} from 'lucide-react';
import { StudentDailyDiaryItem, ActiveScreen } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  getClassHexColor,
  getSubjectsForClass,
} from '../../../utils/classColors';
import { printHtmlDocument } from '../../../services/printAndFileService';

interface DailyDiarySubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
  onNavigate?: (screen: ActiveScreen) => void;
}

export const DailyDiarySubmodule: React.FC<DailyDiarySubmoduleProps> = ({
  onBack,
  lang,
}) => {
  const [diaries, setDiaries] = useState<StudentDailyDiaryItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingDiary, setEditingDiary] = useState<StudentDailyDiaryItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [classId, setClassId] = useState<string>('c-5');
  const [subject, setSubject] = useState<string>('Mathematics');
  const [classwork, setClasswork] = useState<string>('');
  const [homework, setHomework] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [teacherName, setTeacherName] = useState<string>('Muhammad Irfan');
  const [instructions, setInstructions] = useState<string>('');
  const [urgent, setUrgent] = useState<boolean>(false);
  const [autoNotify, setAutoNotify] = useState<boolean>(true);

  const refreshDiaries = () => {
    setDiaries(StorageService.getDailyDiaries());
  };

  useEffect(() => {
    refreshDiaries();
    window.addEventListener('gps-daily-diaries-updated', refreshDiaries);
    return () => window.removeEventListener('gps-daily-diaries-updated', refreshDiaries);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Pre-fill subject based on selected class in modal
  useEffect(() => {
    const classMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === classId);
    if (classMeta) {
      const subjects = getSubjectsForClass(classMeta.kpSubjectDropdownLabel);
      if (subjects.length > 0 && !editingDiary) {
        setSubject(subjects[0].english);
      }
    }
  }, [classId, editingDiary]);

  const handleOpenAddModal = (presetClassId?: string) => {
    setEditingDiary(null);
    const targetClass = presetClassId || (selectedClassId !== 'all' ? selectedClassId : 'c-5');
    setClassId(targetClass);
    const classMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === targetClass);
    const subjects = classMeta ? getSubjectsForClass(classMeta.kpSubjectDropdownLabel) : [];
    setSubject(subjects.length > 0 ? subjects[0].english : 'Mathematics');
    setClasswork('');
    setHomework('');
    setDueDate(selectedDate);
    setTeacherName('Muhammad Irfan');
    setInstructions('والدین بچے کا ہوم ورک چیک فرما کر دستخط کریں۔');
    setUrgent(false);
    setAutoNotify(true);
    setShowModal(true);
  };

  const handleOpenEditModal = (diary: StudentDailyDiaryItem) => {
    setEditingDiary(diary);
    setClassId(diary.classId);
    setSubject(diary.subject);
    setClasswork(diary.classworkActivity);
    setHomework(diary.homeworkTask);
    setDueDate(diary.dueDate || diary.date);
    setTeacherName(diary.teacherName || 'Muhammad Irfan');
    setInstructions(diary.specialInstructions || '');
    setUrgent(diary.urgentNotice || false);
    setAutoNotify(false);
    setShowModal(true);
  };

  const handleSaveDiary = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classwork.trim() && !homework.trim()) {
      showToast('Please enter classwork activity or homework task.');
      return;
    }

    const classMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === classId) || OFFICIAL_SIX_CLASSES[0];

    const diaryItem: StudentDailyDiaryItem = {
      id: editingDiary ? editingDiary.id : `diary-${Date.now()}`,
      classId,
      className: classMeta.displayName,
      date: selectedDate,
      subject,
      classworkActivity: classwork.trim(),
      homeworkTask: homework.trim(),
      dueDate: dueDate || selectedDate,
      teacherName: teacherName.trim() || 'Teacher',
      specialInstructions: instructions.trim(),
      urgentNotice: urgent,
      parentNotified: editingDiary ? editingDiary.parentNotified : autoNotify,
      createdAt: editingDiary?.createdAt || new Date().toISOString(),
    };

    StorageService.saveDailyDiary(diaryItem);

    if (autoNotify && !editingDiary) {
      StorageService.saveNotification({
        id: `notif-diary-${Date.now()}`,
        title: `Daily Diary: ${classMeta.displayName} - ${subject}`,
        message: `Homework assigned: ${homework.trim() || 'Review classroom activities'}. Due Date: ${dueDate || selectedDate}.`,
        category: 'Academic',
        date: selectedDate,
        read: false,
        targetScreen: 'other_daily_diary',
      });
    }

    setShowModal(false);
    setEditingDiary(null);
    showToast(editingDiary ? 'Daily diary entry updated!' : 'Daily diary entry recorded & saved!');
  };

  const handleDeleteDiary = (id: string, subjectTitle: string) => {
    if (window.confirm(`Delete daily diary entry for ${subjectTitle}?`)) {
      StorageService.deleteDailyDiary(id);
      showToast('Diary entry deleted.');
    }
  };

  const handleNotifyParentsWhatsApp = (diary: StudentDailyDiaryItem) => {
    const text = `*گورنمنٹ پرائمری سکول چمبئی کوہاٹ*
*طلبہ کی روزمرہ ڈائری (Student Daily Diary)*
------------------------------------
📅 *تاریخ:* ${diary.date}
🏫 *کلاس:* ${diary.className}
📖 *مضمون:* ${diary.subject}
✏️ *کلاس ورک (Classwork):*
${diary.classworkActivity || 'تدریسی سرگرمی مکمل کروائی گئی۔'}

🏠 *ہوم ورک (Homework):*
${diary.homeworkTask || 'کوئی مخصوص ہوم ورک نہیں۔'}

🗓️ *مکمل کرنے کی تاریخ:* ${diary.dueDate || diary.date}
👨‍🏫 *معلم / نگران:* ${diary.teacherName || 'GPS Chambai'}
${diary.specialInstructions ? `📢 *والدین کے لیے خصوصی ہدایت:*\n${diary.specialInstructions}` : ''}
------------------------------------
_Govt Primary School Chambai Kohat (EMIS: 16454)_`;

    const encoded = encodeURIComponent(text);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(whatsappUrl, '_blank');

    const updated = { ...diary, parentNotified: true };
    StorageService.saveDailyDiary(updated);
    showToast('WhatsApp Diary notification link opened!');
  };

  const handlePrintDailyDiary = () => {
    const classMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === selectedClassId);
    const filterTitle = classMeta ? classMeta.displayName : 'All Grades / Classes';

    const filteredRows = diaries.filter(
      (d) => d.date === selectedDate && (selectedClassId === 'all' || d.classId === selectedClassId)
    );

    const rowsHtml = filteredRows
      .map(
        (d, idx) => `
        <tr>
          <td style="text-align:center;font-weight:bold;">${idx + 1}</td>
          <td style="font-weight:bold;color:#065f46;">${d.className}</td>
          <td style="font-weight:bold;">${d.subject}</td>
          <td>${d.classworkActivity || '—'}</td>
          <td style="font-weight:bold;color:#1e3a8a;">${d.homeworkTask || '—'}</td>
          <td style="text-align:center;">${d.dueDate || d.date}</td>
          <td>${d.teacherName || '—'}</td>
          <td style="font-size:11px;">${d.specialInstructions || '—'}</td>
        </tr>
      `
      )
      .join('');

    printHtmlDocument(
      `Daily Diary Sheet - ${filterTitle} (${selectedDate})`,
      `
        <div style="margin-bottom:12px;font-size:13px;">
          <strong>Date:</strong> ${selectedDate} &nbsp;|&nbsp;
          <strong>Grade/Class:</strong> ${filterTitle} &nbsp;|&nbsp;
          <strong>Total Subjects/Tasks:</strong> ${filteredRows.length}
        </div>
        <table>
          <thead>
            <tr>
              <th style="width:30px;">#</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Classroom Activities (کلاس ورک)</th>
              <th>Homework Task (ہوم ورک)</th>
              <th>Due Date</th>
              <th>Teacher</th>
              <th>Instructions for Parents</th>
            </tr>
          </thead>
          <tbody>
            ${
              rowsHtml ||
              '<tr><td colspan="8" style="text-align:center;padding:20px;font-weight:bold;">No diary entries recorded for this date.</td></tr>'
            }
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;margin-top:35px;padding:0 20px;">
          <div style="text-align:center;border-top:1px solid #333;width:180px;padding-top:4px;">
            <strong>Class Teacher Signature</strong>
          </div>
          <div style="text-align:center;border-top:1px solid #333;width:180px;padding-top:4px;">
            <strong>Headmaster Signature</strong>
          </div>
        </div>
      `
    );
  };

  const filteredDiaries = diaries.filter(
    (d) => d.date === selectedDate && (selectedClassId === 'all' || d.classId === selectedClassId)
  );

  return (
    <div className="p-3.5 space-y-4 pb-12 animate-fade-in select-none">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-all active:scale-95 shrink-0"
            aria-label="Go Back"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-widest bg-emerald-500/25 text-emerald-200 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                Teacher &amp; Student Daily Log
              </span>
              <span className="text-[10px] font-bold text-amber-300 font-urdu">
                طلبہ کی روزمرہ ڈائری
              </span>
            </div>
            <h2 className="text-lg font-black tracking-tight mt-0.5">
              {lang === 'ur' ? 'طلبہ کی روزمرہ ڈائری اور ہوم ورک' : 'Student Daily Diary'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={handlePrintDailyDiary}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 shadow-sm active:scale-95"
            title="Print Class Daily Diary"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">Print Diary</span>
          </button>
          <button
            onClick={() => handleOpenAddModal()}
            className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Plus size={16} />
            <span>Add Daily Diary</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 px-3.5 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-bold shadow-sm">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Date Selector & Class Filters */}
      <div className="bg-white rounded-3xl p-3 sm:p-4 border border-slate-200 shadow-xs space-y-3">
        {/* Date Controls */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <Calendar size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Diary Date (تاریخ)
              </span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-xs font-black text-slate-900 border border-slate-300 rounded-lg px-2 py-1 bg-slate-50 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() - 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black"
            >
              &larr; Prev Day
            </button>
            <button
              onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 hover:bg-emerald-200 text-xs font-black"
            >
              Today (آج)
            </button>
            <button
              onClick={() => {
                const d = new Date(selectedDate);
                d.setDate(d.getDate() + 1);
                setSelectedDate(d.toISOString().split('T')[0]);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black"
            >
              Next Day &rarr;
            </button>
          </div>
        </div>

        {/* Class Filter Badges */}
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 mb-1.5 block">
            Filter by Grade / Class (تمام کلاسز):
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <button
              onClick={() => setSelectedClassId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 ${
                selectedClassId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Classes ({diaries.filter((d) => d.date === selectedDate).length})
            </button>
            {OFFICIAL_SIX_CLASSES.map((cls) => {
              const count = diaries.filter(
                (d) => d.date === selectedDate && d.classId === cls.id
              ).length;
              const isSelected = selectedClassId === cls.id;
              const hex = getClassHexColor(cls.id);
              return (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassId(cls.id)}
                  style={{
                    backgroundColor: isSelected ? hex : undefined,
                    color: isSelected ? '#FFFFFF' : undefined,
                    borderColor: hex,
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all shrink-0 flex items-center gap-1 ${
                    isSelected ? 'shadow-xs' : 'bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{cls.displayName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected ? 'bg-black/25 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Diary Entries List */}
      <div className="space-y-3">
        {filteredDiaries.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
              <BookOpen size={28} />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                No Diary Recorded for {selectedDate}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-0.5">
                Record classroom activities and daily homework tasks for your students. Parents can be notified immediately via WhatsApp or app alerts.
              </p>
            </div>
            <button
              onClick={() => handleOpenAddModal()}
              className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-black inline-flex items-center gap-1.5 shadow-sm hover:bg-emerald-600"
            >
              <Plus size={15} />
              <span>Record First Diary Entry</span>
            </button>
          </div>
        ) : (
          filteredDiaries.map((diary) => {
            const classHex = getClassHexColor(diary.classId);
            return (
              <div
                key={diary.id}
                className={`bg-white rounded-3xl p-4 border shadow-xs transition-all space-y-3 ${
                  diary.urgentNotice
                    ? 'border-rose-300 ring-2 ring-rose-200'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Top Badge & Controls */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      style={{ backgroundColor: classHex }}
                      className="text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-2xs"
                    >
                      {diary.className}
                    </span>
                    <span className="text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full">
                      {diary.subject}
                    </span>
                    {diary.urgentNotice && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertCircle size={11} />
                        <span>Urgent / اہم</span>
                      </span>
                    )}
                    {diary.parentNotified && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={11} />
                        <span>Parents Notified</span>
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleNotifyParentsWhatsApp(diary)}
                      className="px-2.5 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1 shadow-2xs"
                      title="Share to Parents via WhatsApp"
                    >
                      <Share2 size={12} />
                      <span className="hidden xs:inline">WhatsApp</span>
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(diary)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Edit"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDiary(diary.id, diary.subject)}
                      className="p-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content Grid: Classwork & Homework */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                  {/* Classroom Activity */}
                  <div className="bg-sky-50/70 border border-sky-200/80 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-sky-900 font-black text-xs">
                      <Sparkles size={13} className="text-sky-600" />
                      <span>Classroom Activities (کلاس ورک / تدریسی سرگرمیاں)</span>
                    </div>
                    <p className="text-xs text-slate-800 leading-relaxed font-semibold whitespace-pre-wrap">
                      {diary.classworkActivity || '—'}
                    </p>
                  </div>

                  {/* Homework Task */}
                  <div className="bg-amber-50/80 border border-amber-200/80 rounded-2xl p-3 space-y-1">
                    <div className="flex items-center gap-1.5 text-amber-900 font-black text-xs">
                      <BookOpen size={13} className="text-amber-600" />
                      <span>Homework Task (ہوم ورک / دیا گیا کام)</span>
                    </div>
                    <p className="text-xs text-slate-900 leading-relaxed font-black whitespace-pre-wrap">
                      {diary.homeworkTask || '—'}
                    </p>
                  </div>
                </div>

                {/* Footer Info: Teacher, Due Date, Special Instructions */}
                <div className="bg-slate-50 rounded-2xl p-2.5 border border-slate-200/70 text-[11px] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 text-slate-600 font-semibold">
                      <User size={13} className="text-emerald-700" />
                      <span>Teacher: <strong className="text-slate-900">{diary.teacherName || 'GPS Chambai'}</strong></span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-600 font-semibold">
                      <Clock size={13} className="text-blue-700" />
                      <span>Due Date: <strong className="text-slate-900">{diary.dueDate || diary.date}</strong></span>
                    </div>
                  </div>

                  {diary.specialInstructions && (
                    <div className="text-rose-900 font-bold bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-lg flex items-center gap-1">
                      <MessageCircle size={12} className="text-rose-600" />
                      <span>ہدایت: {diary.specialInstructions}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Daily Diary Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3.5 overflow-y-auto">
          <form
            onSubmit={handleSaveDiary}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5 my-6 animate-scale-up"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    {editingDiary ? 'Edit Student Daily Diary' : 'Record Student Daily Diary'}
                  </h3>
                  <span className="text-[10px] font-bold text-slate-500 font-urdu">
                    روزمرہ تدریسی سرگرمیاں اور ہوم ورک
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Class & Subject */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Class / Grade (کلاس)
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black bg-slate-50 focus:outline-none focus:border-emerald-600"
                >
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Subject (مضمون)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mathematics / اردو"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-black bg-slate-50 focus:outline-none focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Date & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Diary Date (تاریخ)
                </label>
                <input
                  type="date"
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Due Date (ہوم ورک مکمل کرنے کی تاریخ)
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                />
              </div>
            </div>

            {/* Classroom Activity */}
            <div>
              <label className="block text-[11px] font-black text-sky-900 mb-1">
                Classroom Activities (کلاس ورک / تدریسی سرگرمیاں)
              </label>
              <textarea
                rows={2}
                required
                placeholder="What was taught in class today? e.g. باب نمبر 3: کسر کا تعارف اور بورڈ پر مشق..."
                value={classwork}
                onChange={(e) => setClasswork(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-sky-300 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-sky-500 bg-sky-50/40"
              />
            </div>

            {/* Homework Task */}
            <div>
              <label className="block text-[11px] font-black text-amber-900 mb-1">
                Homework Task Assigned (ہوم ورک / دیا گیا کام)
              </label>
              <textarea
                rows={2}
                required
                placeholder="What should students complete at home? e.g. مشق نمبر 3.1 کے سوال 1 تا 5 کاپی پر حل کریں..."
                value={homework}
                onChange={(e) => setHomework(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-amber-300 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-amber-500 bg-amber-50/50"
              />
            </div>

            {/* Teacher Name & Special Instructions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Teacher Name (معلم)
                </label>
                <input
                  type="text"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Instructions for Parents (والدین کے لیے ہدایت)
                </label>
                <input
                  type="text"
                  placeholder="e.g. بچے کا ہوم ورک دیکھ کر دستخط کریں"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50"
                />
              </div>
            </div>

            {/* Options Checkboxes */}
            <div className="pt-1 space-y-1.5 bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  type="checkbox"
                  checked={autoNotify}
                  onChange={(e) => setAutoNotify(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                />
                <span>Notify parents via App Notification bulletin</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-rose-800">
                <input
                  type="checkbox"
                  checked={urgent}
                  onChange={(e) => setUrgent(e.target.checked)}
                  className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 accent-rose-600"
                />
                <span>Mark as Urgent Notice / ٹیسٹ یا اہم اعلان</span>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md"
              >
                <Send size={14} />
                <span>{editingDiary ? 'Update Diary' : 'Save & Publish Diary'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
