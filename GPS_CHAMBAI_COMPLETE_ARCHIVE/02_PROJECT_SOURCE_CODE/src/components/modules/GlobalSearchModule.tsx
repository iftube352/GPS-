import React, { useState, useMemo } from 'react';
import {
  Search,
  Users,
  BookOpen,
  Award,
  Wallet,
  Calendar,
  ArrowRight,
  Image as ImageIcon,
  Video,
  UserCheck,
  FileText,
  X,
  Sparkles,
  BookMarked,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building,
  Bell,
  Cpu,
} from 'lucide-react';
import { ActiveScreen } from '../../types';
import { StorageService } from '../../services/storage';
import { OFFICIAL_SIX_CLASSES, getClassMetaByIdOrName } from '../../utils/classColors';

interface GlobalSearchModuleProps {
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
}

export interface SearchHit {
  id: string;
  category: string;
  categoryUr: string;
  title: string;
  subtitle: string;
  badge: string;
  color: string;
  targetScreen: ActiveScreen;
  searchKeywords?: string;
}

const CATEGORY_FILTERS = [
  { id: 'ALL', labelEn: 'All App Data', labelUr: 'تمام ڈیٹا' },
  { id: 'Students', labelEn: 'Students', labelUr: 'طلباء' },
  { id: 'Daily Diary', labelEn: 'Daily Diary', labelUr: 'ڈائری' },
  { id: 'Lesson Plans', labelEn: 'Lesson Plans', labelUr: 'اسباق' },
  { id: 'Office Data', labelEn: 'Office & Orders', labelUr: 'آرڈر بک' },
  { id: 'Staff', labelEn: 'Staff', labelUr: 'اساتذہ' },
  { id: 'PTC Fund', labelEn: 'PTC & Grants', labelUr: 'پی ٹی سی فنڈ' },
  { id: 'Books Demand', labelEn: 'Books Demand', labelUr: 'ڈیمانڈ کتب' },
  { id: 'Books & Guides', labelEn: 'Books & Guides', labelUr: 'درسی کتب' },
  { id: 'Results', labelEn: 'Exams & Results', labelUr: 'امتحان و نتائج' },
  { id: 'Certificates', labelEn: 'Certificates & Struck', labelUr: 'سرٹیفکیٹ' },
  { id: 'Attendance', labelEn: 'Attendance', labelUr: 'حاضری' },
  { id: 'Timetable', labelEn: 'Timetable', labelUr: 'ٹائم ٹیبل' },
  { id: 'Media', labelEn: 'Gallery & Videos', labelUr: 'میڈیا' },
  { id: 'Notifications', labelEn: 'Alerts', labelUr: 'اعلانات' },
  { id: 'AI Suite', labelEn: 'AI Models', labelUr: 'مصنوعی ذہانت' },
  { id: 'SSR', labelEn: 'School Self Reporting (SSR)', labelUr: 'سکول سیلف رپورٹنگ' },
];

export const GlobalSearchModule: React.FC<GlobalSearchModuleProps> = ({
  onNavigate,
  lang,
}) => {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Build the universal search index safely across all modules
  const allHits = useMemo<SearchHit[]>(() => {
    const hits: SearchHit[] = [];

    // 1. Classes (6 Official Classes)
    try {
      OFFICIAL_SIX_CLASSES.forEach((cls) => {
        hits.push({
          id: `cls-${cls.id}`,
          category: 'Classes',
          categoryUr: 'کلاسز',
          title: `${cls.displayName} (${cls.urduName})`,
          subtitle: `Official KP Grade Level ${cls.gradeLevel} • Badge #${cls.badgeNumber}`,
          badge: 'Class',
          color: cls.hex,
          targetScreen: 'classes',
          searchKeywords: `${cls.name} ${cls.displayName} ${cls.urduName} ${cls.shortCode} class kachi awal doem soem chaharom panjom`,
        });
      });
    } catch {}

    // 2. Students & Admissions (D/G/P/F Categories)
    try {
      StorageService.getStudents().forEach((st) => {
        const cls = getClassMetaByIdOrName(st.classId);
        hits.push({
          id: `st-${st.id}`,
          category: 'Students',
          categoryUr: 'طلباء',
          title: `${st.name} S/O ${st.fatherName || '—'}`,
          subtitle: `Adm: ${st.admissionNo || '—'} • Roll #${st.rollNo || '1'} • ${cls.displayName} • Cat: ${st.admissionCategory || 'F'} • B-Form: ${st.bFormNo || ''}`,
          badge: cls.shortCode || 'Student',
          color: cls.hex,
          targetScreen: 'admission',
          searchKeywords: `${st.name} ${st.fatherName} ${st.admissionNo} ${st.rollNo} ${st.bFormNo} ${st.mobileNo} ${cls.displayName}`,
        });
      });
    } catch {}

    // 3. Student Daily Diaries (روزمرہ ڈائری)
    try {
      StorageService.getDailyDiaries().forEach((dd) => {
        const cls = getClassMetaByIdOrName(dd.classId);
        hits.push({
          id: `dd-${dd.id}`,
          category: 'Daily Diary',
          categoryUr: 'ڈائری',
          title: `[Daily Diary] ${cls.displayName} — ${dd.subject}`,
          subtitle: `Date: ${dd.date} • Classwork: ${dd.classworkActivity.slice(0, 50)}... • HW: ${dd.homeworkTask.slice(0, 40)}...`,
          badge: dd.urgentNotice ? 'Urgent HW' : 'Diary',
          color: '#8B5CF6',
          targetScreen: 'other_daily_diary',
          searchKeywords: `${dd.subject} ${dd.classworkActivity} ${dd.homeworkTask} ${dd.teacherName} ${dd.date} ${cls.displayName} diary homework`,
        });
      });
    } catch {}

    // 4. Detailed Lesson Plans (اسباق کی منصوبہ بندی)
    try {
      StorageService.getLessonPlans().forEach((lp) => {
        const cls = getClassMetaByIdOrName(lp.classId || lp.className);
        hits.push({
          id: `lp-${lp.id}`,
          category: 'Lesson Plans',
          categoryUr: 'اسباق',
          title: `[Lesson Plan] ${lp.topic} (${lp.subject})`,
          subtitle: `${cls.displayName} • Teacher: ${lp.teacherName || 'Muhammad Ismail'} • SLOs: ${(lp.learningObjectives || lp.slo || '').slice(0, 55)}...`,
          badge: 'Lesson Plan',
          color: '#0891B2',
          targetScreen: 'other_lesson_plans',
          searchKeywords: `${lp.topic} ${lp.subject} ${lp.teacherName} ${lp.learningObjectives} ${lp.slo} ${lp.homework} ${cls.displayName} lesson plan`,
        });
      });
    } catch {}

    // 5. Staff Directory & Designations (اساتذہ و ملازمین)
    try {
      StorageService.getStaff().forEach((sf) => {
        hits.push({
          id: `sf-${sf.id}`,
          category: 'Staff',
          categoryUr: 'اساتذہ',
          title: `${sf.name} (${sf.designation})`,
          subtitle: `BPS-${sf.bps || 14} • P.No: ${sf.personalNo || '—'} • ${sf.department || ''} • Phone: ${sf.contactNo || sf.phone || ''}`,
          badge: sf.designation || 'Staff',
          color: '#2563EB',
          targetScreen: 'staff',
          searchKeywords: `${sf.name} ${sf.urduName || ''} ${sf.designation} ${sf.personalNo} ${sf.cnic} ${sf.qualification} ${sf.contactNo}`,
        });
      });
    } catch {}

    // 6. PTC Fund & 3 Grants (پی ٹی سی فنڈ، کونسل و گرانٹس)
    try {
      StorageService.getFinances().forEach((f) => {
        const amt = typeof f.amount === 'number' ? f.amount.toLocaleString() : String(f.amount || 0);
        hits.push({
          id: `fin-${f.id}`,
          category: 'PTC Fund',
          categoryUr: 'پی ٹی سی فنڈ',
          title: `[PTC Fund] ${f.title || f.productName || 'PTC Transaction'}`,
          subtitle: `Voucher #${f.voucherNo || f.receiptNo || '-'} • PKR ${amt} • Date: ${f.date || ''} • Grant: ${f.fundType || f.category || ''}`,
          badge: f.type === 'Grant_Received' || f.type === 'Received' ? 'Grant In' : 'Expense',
          color: f.type === 'Grant_Received' || f.type === 'Received' ? '#16A34A' : '#DC2626',
          targetScreen: 'ptc_fund',
          searchKeywords: `${f.title || ''} ${f.productName || ''} ${f.voucherNo || ''} ${f.fundType || ''} ${f.category || ''} ${f.amount} ptc capitation consumable repair fund grant`,
        });
      });

      // PTC Members
      StorageService.getPtcMembers().forEach((m) => {
        hits.push({
          id: `ptcm-${m.id}`,
          category: 'PTC Fund',
          categoryUr: 'پی ٹی سی فنڈ',
          title: `PTC Member: ${m.name} (${m.role || m.designation || 'Member'})`,
          subtitle: `Contact: ${m.contactNo || m.mobileNo || '—'} • CNIC: ${m.cnic} • Role: ${m.role || m.designation || 'Member'}`,
          badge: 'PTC Member',
          color: '#1D4ED8',
          targetScreen: 'ptc_fund',
          searchKeywords: `${m.name} ${m.role || ''} ${m.designation || ''} ${m.cnic} ${m.contactNo || ''} ptc member`,
        });
      });
    } catch {}

    // 7. Books Demand & Stock (کتابوں کی ڈیمانڈ و وصولی)
    try {
      StorageService.getBooksDemand().forEach((bd) => {
        hits.push({
          id: `bd-${bd.id}`,
          category: 'Books Demand',
          categoryUr: 'ڈیمانڈ کتب',
          title: `[Book Demand] ${bd.className} — ${bd.subject}`,
          subtitle: `Demanded: ${bd.demandedQty ?? bd.demanded ?? 0} • Received: ${bd.receivedQty ?? bd.received ?? 0} • Type: ${bd.bookType || 'New'} Stock`,
          badge: 'Book Demand',
          color: '#EA580C',
          targetScreen: 'other_books_demand',
          searchKeywords: `${bd.subject} ${bd.className} book demand received stock kachi textbook`,
        });
      });
    } catch {}

    // 8. Office Data, Circulars & Orders (دفتری ریکارڈ و احکامات)
    try {
      StorageService.getOfficeDocs().forEach((od) => {
        hits.push({
          id: `od-${od.id}`,
          category: 'Office Data',
          categoryUr: 'آرڈر بک',
          title: `[Office Order] ${od.title}`,
          subtitle: `Ref #${od.referenceNo || od.refNo || '-'} • Date: ${od.date} • Issued by: ${od.issuingAuthority || 'Head Teacher'}`,
          badge: od.category || 'Order',
          color: '#4F46E5',
          targetScreen: 'other_office_data',
          searchKeywords: `${od.title} ${od.urduTitle || ''} ${od.referenceNo} ${od.refNo} ${od.description} order book circular`,
        });
      });
    } catch {}

    // 9. Notifications & School Alerts (اطلاعات و اعلانات)
    try {
      StorageService.getNotifications().forEach((notif) => {
        hits.push({
          id: `notif-${notif.id}`,
          category: 'Notifications',
          categoryUr: 'اعلانات',
          title: `[Notice] ${notif.title}`,
          subtitle: `Date: ${notif.date} • Category: ${notif.category} • ${notif.message.slice(0, 60)}...`,
          badge: notif.category,
          color: '#EC4899',
          targetScreen: notif.targetScreen || 'notifications',
          searchKeywords: `${notif.title} ${notif.message} ${notif.category} notice circular order ptc meeting`,
        });
      });
    } catch {}

    // 10. Books & Teaching Guides (درسی کتب و رہنما کتب)
    try {
      StorageService.getBooks().forEach((bk) => {
        hits.push({
          id: `bk-${bk.id}`,
          category: 'Books & Guides',
          categoryUr: 'درسی کتب',
          title: bk.title,
          subtitle: `${bk.className || ''} • Subject: ${bk.subject} • ${bk.pages || 96} pages • KP Textbook Board`,
          badge: (bk.type || 'Book').toUpperCase(),
          color: '#DC2626',
          targetScreen: bk.type === 'guide' ? 'guides' : 'books',
          searchKeywords: `${bk.title} ${bk.subject} ${bk.className} ${bk.author || ''} textbook guide book`,
        });
      });
    } catch {}

    // 11. Results & Semester Exam Papers (امتحانات و نتائج)
    try {
      StorageService.getResults().forEach((r) => {
        const obt = r.obtainedMarks ?? r.totalObtainedMarks ?? 0;
        const tot = r.totalMarks ?? r.totalMaxMarks ?? 500;
        hits.push({
          id: `res-${r.id}`,
          category: 'Results',
          categoryUr: 'امتحان و نتائج',
          title: `[Result] ${r.studentName} — ${r.examTerm || '1st Semester'}`,
          subtitle: `Roll #${r.rollNo} • Obtained: ${obt}/${tot} • Grade: ${r.grade || 'A'} • Position: ${r.positionInClass || '-'}`,
          badge: `Grade ${r.grade || 'A'}`,
          color: '#D97706',
          targetScreen: 'other_results',
          searchKeywords: `${r.studentName} ${r.fatherName} ${r.rollNo} ${r.examTerm} result mark sheet exam`,
        });
      });

      StorageService.getExamPapers().forEach((ep) => {
        hits.push({
          id: `ep-${ep.id}`,
          category: 'Results',
          categoryUr: 'امتحان و نتائج',
          title: `[Exam Paper] ${ep.className} — ${ep.subject} (${ep.semester})`,
          subtitle: `Date: ${ep.examDate} • Total Marks: ${ep.totalMarks} • ${ep.questions?.length || 0} questions`,
          badge: 'Exam Paper',
          color: '#0D9488',
          targetScreen: ep.semester.includes('2nd') ? 'other_exam_2' : 'other_exam_1',
          searchKeywords: `${ep.className} ${ep.subject} ${ep.semester} exam paper test questions`,
        });
      });
    } catch {}

    // 12. Certificates & Struck Off Records (سرٹیفکیٹ و خارج شدہ طلباء)
    try {
      StorageService.getCertificates().forEach((c) => {
        hits.push({
          id: `cert-${c.id}`,
          category: 'Certificates',
          categoryUr: 'سرٹیفکیٹ',
          title: `[SLC] ${c.studentName} (${c.certificateType} SLC)`,
          subtitle: `Adm #${c.admissionNo} • Status: ${c.classStatus} • Issue Date: ${c.issueDate}`,
          badge: 'SLC',
          color: '#7C3AED',
          targetScreen: 'other_certificate',
          searchKeywords: `${c.studentName} ${c.fatherName} ${c.admissionNo} certificate slc school leaving`,
        });
      });

      StorageService.getStruckOffRecords().forEach((so) => {
        hits.push({
          id: `so-${so.id}`,
          category: 'Certificates',
          categoryUr: 'سرٹیفکیٹ',
          title: `[Struck Off] ${so.studentName} S/O ${so.fatherName}`,
          subtitle: `Adm #${so.admissionNo} • Date: ${so.struckOffDate} • Reason: ${so.remarks}`,
          badge: 'Struck Off',
          color: '#E11D48',
          targetScreen: 'other_struck_off',
          searchKeywords: `${so.studentName} ${so.fatherName} ${so.admissionNo} struck off kharij`,
        });
      });
    } catch {}

    // 13. Attendance & Timetable (حاضری و ٹائم ٹیبل)
    try {
      StorageService.getAttendance().forEach((att) => {
        const studentCount = att.records ? Object.keys(att.records).length : 0;
        hits.push({
          id: `att-${att.id}`,
          category: 'Attendance',
          categoryUr: 'حاضری',
          title: `[Attendance] Daily Class Register — ${att.date}`,
          subtitle: `Class ID: ${att.classId} • ${studentCount} students marked present/absent`,
          badge: 'Attendance',
          color: '#059669',
          targetScreen: 'other_attendance',
          searchKeywords: `attendance hazri register ${att.date} ${att.classId}`,
        });
      });

      // Teacher Daily Attendance Records (Image 008, 009, 010)
      StorageService.getTeacherAttendance().forEach((tatt) => {
        hits.push({
          id: `tatt-${tatt.id}`,
          category: 'Teacher Attendance',
          categoryUr: 'اساتذہ حاضری',
          title: `[Teacher Attendance] ${tatt.dayName}, ${tatt.date}`,
          subtitle: `EMIS 16454 GPS Chambai • Synced: ${tatt.isSynced ? 'Yes' : 'Pending'} • 7 Staff Members`,
          badge: 'Teacher Attendance',
          color: '#065F46',
          targetScreen: 'other_attendance',
          searchKeywords: `teacher attendance staff hazri ${tatt.date} ${tatt.dayName} emis 16454 chambai`,
        });
      });

      // Official Teachers (Anar Khan, Zar Khan Afridi, Mubashir Ahmad, etc.)
      StorageService.getOfficialTeachers().forEach((tch) => {
        hits.push({
          id: `tch-${tch.id}`,
          category: 'Staff',
          categoryUr: 'اساتذہ',
          title: `${tch.name} (${tch.designation})`,
          subtitle: `CNIC: ${tch.cnic} • BPS-${tch.bps || 14} • GPS Chambai Kohat • EMIS 16454`,
          badge: tch.designation,
          color: '#166534',
          targetScreen: 'other_attendance',
          searchKeywords: `${tch.name} ${tch.urduName || ''} ${tch.designation} ${tch.cnic} ${tch.personalNo} teacher staff`,
        });
      });

      StorageService.getTimetableGrid('c-5').forEach((row) => {
        hits.push({
          id: `tt-${row.day}`,
          category: 'Timetable',
          categoryUr: 'ٹائم ٹیبل',
          title: `[Timetable] ${row.day} (${row.dayUr || ''}) 7-Period Matrix`,
          subtitle: `P1: ${row.period1} • P2: ${row.period2} • P3: ${row.period3} • P4: ${row.period4}`,
          badge: 'Timetable',
          color: '#0284C7',
          targetScreen: 'other_timetable',
          searchKeywords: `${row.day} ${row.dayUr} timetable periods schedule matrix`,
        });
      });
    } catch {}

    // 14. Media: Gallery & Videos (تصاویر و ویڈیوز)
    try {
      StorageService.getGallery().forEach((g) => {
        hits.push({
          id: `gal-${g.id}`,
          category: 'Media',
          categoryUr: 'میڈیا',
          title: `[Photo] ${g.title}`,
          subtitle: `${g.category} • Date: ${g.date} • ${g.description?.slice(0, 50) || ''}`,
          badge: 'Gallery',
          color: '#EA580C',
          targetScreen: 'gallery',
          searchKeywords: `${g.title} ${g.urduTitle || ''} ${g.category} ${g.description} photo gallery`,
        });
      });

      StorageService.getVideos().forEach((v) => {
        hits.push({
          id: `vid-${v.id}`,
          category: 'Media',
          categoryUr: 'میڈیا',
          title: `[Video] ${v.title}`,
          subtitle: `${v.className || ''} • Subject: ${v.subject || ''} • ${v.description?.slice(0, 45) || ''}`,
          badge: 'Video',
          color: '#0284C7',
          targetScreen: 'videos',
          searchKeywords: `${v.title} ${v.subject} ${v.className} video lecture`,
        });
      });
    } catch {}

    // 15. AI Teaching Suite
    hits.push({
      id: 'ai-suite-1',
      category: 'AI Suite',
      categoryUr: 'مصنوعی ذہانت',
      title: 'AI Teaching Suite (All 6 AI Models Portal)',
      subtitle: 'ChatGPT, DeepSeek, Google Gemini, Meta AI, Copilot & Claude for lesson plans & exams',
      badge: 'AI Suite',
      color: '#7C3AED',
      targetScreen: 'other_ai',
      searchKeywords: 'ai chatgpt deepseek gemini meta ai copilot claude artificial intelligence lesson plan prompt generator',
    });

    // 16. SSR (School Self Reporting) 2026-27
    hits.push({
      id: 'ssr-performa-1',
      category: 'SSR',
      categoryUr: 'سکول سیلف رپورٹنگ',
      title: 'School Self Reporting (SSR) 2026-27 Performa',
      subtitle: 'Official 16-Page ESED Performa • GPS Chambai Kohat (EMIS: 16454) • Editable & Printable',
      badge: 'SSR 2026-27',
      color: '#0D9488',
      targetScreen: 'ssr',
      searchKeywords: 'ssr school self reporting 2026-27 emis 16454 performa building facilities hr staff enrollment commodities assets export pdf docx xlsx jpg',
    });

    return hits;
  }, []);

  // Filter hits based on category and search query
  const filteredHits = useMemo(() => {
    const q = query.trim().toLowerCase();

    return allHits.filter((hit) => {
      // Category filter check
      const matchesCategory =
        categoryFilter === 'ALL' ||
        hit.category === categoryFilter ||
        (categoryFilter === 'Media' && (hit.category === 'Gallery' || hit.category === 'Videos'));

      if (!matchesCategory) return false;
      if (!q) return true;

      // Search across all text fields
      const inTitle = hit.title.toLowerCase().includes(q);
      const inSubtitle = hit.subtitle.toLowerCase().includes(q);
      const inBadge = hit.badge.toLowerCase().includes(q);
      const inCategory = hit.category.toLowerCase().includes(q);
      const inKeywords = (hit.searchKeywords || '').toLowerCase().includes(q);

      return inTitle || inSubtitle || inBadge || inCategory || inKeywords;
    });
  }, [allHits, query, categoryFilter]);

  const quickSearchTags = [
    'Muhammad Bilal',
    'General Science',
    'Class 5',
    'PTC Grant',
    'Order Book',
    'Lesson Plan',
    'Daily Diary',
    'ChatGPT',
    'Nazra Quran',
    'Admission',
  ];

  return (
    <div className="p-3.5 space-y-3.5 pb-12 animate-fade-in max-w-5xl mx-auto">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-violet-700 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/25 px-2.5 py-0.5 rounded-full">
              Universal School Database Search
            </span>
            <span className="text-[10px] font-bold text-sky-200">
              GPS Chambai Kohat • EMIS: 16454
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight mt-1 flex items-center gap-2">
            <Search size={22} className="text-amber-300" />
            <span>{lang === 'ur' ? 'مکمل سکول ریکارڈ تلاش کریں' : 'Search All School Records'}</span>
          </h2>
          <p className="text-xs text-sky-100 font-medium">
            Search across Students, Daily Diaries, Lesson Plans, Staff, PTC Grants, Office Orders, Books, Exams, Results & AI Models
          </p>
        </div>

        {/* Search Input Box */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              lang === 'ur'
                ? 'طالب علم کا نام، داخلہ نمبر، رول نمبر، ہوم ورک، لیسن پلان، آرڈر بک، گرانٹ، کتاب...'
                : 'Search student, admission no, diary, homework, lesson plan, order book, grant, staff...'
            }
            className="w-full pl-10 pr-10 py-3 bg-white text-slate-900 rounded-2xl text-xs font-bold shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Quick Suggestion Tags */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1">
          <span className="text-[10px] font-bold text-sky-200 shrink-0">Quick:</span>
          {quickSearchTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 text-white text-[10px] font-bold whitespace-nowrap transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {CATEGORY_FILTERS.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap transition-all shrink-0 ${
              categoryFilter === cat.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {lang === 'ur' ? cat.labelUr : cat.labelEn}
          </button>
        ))}
      </div>

      {/* Search Results Summary & List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-[11px] font-black text-slate-500 px-1">
          <span>
            {query.trim()
              ? `Found ${filteredHits.length} matching records for "${query}"`
              : `Showing all ${filteredHits.length} records in ${categoryFilter === 'ALL' ? 'Entire App' : categoryFilter}`}
          </span>
          <span className="text-slate-400 font-bold">Tap any item to open</span>
        </div>

        {filteredHits.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search size={24} />
            </div>
            <h3 className="text-sm font-black text-slate-800">
              No matching records found for "{query}"
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try searching by student name, roll number, subject, or choose "All App Data" filter above.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setCategoryFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs"
            >
              Reset Search & View All
            </button>
          </div>
        ) : (
          filteredHits.map((hit) => (
            <button
              key={hit.id}
              onClick={() => onNavigate(hit.targetScreen)}
              className="w-full bg-white hover:bg-slate-50 rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between gap-3 text-left transition-all active:scale-[0.99] group hover:border-slate-300"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div
                  className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0 shadow-xs"
                  style={{ backgroundColor: hit.color }}
                >
                  <Search size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span
                      className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: hit.color }}
                    >
                      {hit.badge}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">
                      {lang === 'ur' ? hit.categoryUr : hit.category}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-black text-slate-900 truncate mt-0.5">
                    {hit.title}
                  </h4>
                  <p className="text-[11px] text-slate-600 font-medium truncate mt-0.5">
                    {hit.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-600 shrink-0">
                <span className="text-[10px] font-bold hidden sm:inline">Open</span>
                <ArrowRight size={16} />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
