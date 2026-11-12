import {
  SchoolClass,
  Book,
  OldBookStockItem,
  KpOfficialSubjectRecord,
  VideoItem,
  Student,
  AttendanceRecord,
  ExamResult,
  LessonPlan,
  TimetableSlot,
  TimetableGridRow,
  DayOfWeekName,
  SchoolSettings,
  StaffMember,
  GalleryItem,
  PtcFundType,
  PtcTransaction,
  PtcBankDetails,
  PtcMember,
  PtcCouncilInfo,
  OfficeDocument,
  BooksDemandItem,
  KPTextbookSubject,
  BasicFacilities,
  DailyEnrolmentEntry,
  MonthlyEnrolmentRow,
  ClassEnrolmentBreakdown,
  CertificateIssueRecord,
  StruckOffRecord,
  SemesterExamPaper,
  AppCustomizationSettings,
  AppNotificationItem,
  StudentDailyDiaryItem,
  TeacherAttendanceRecord,
  TeacherAttendanceStatus,
  HirsCvData,
  SchoolAboutData,
  OfficialSignaturesAndStamp,
  WhatsAppSettings,
  PtcCategorizedFundData,
  StudentMonthlyAttendanceStats,
} from '../types';
import { CLASS_SUBJECT_MAPPING, OFFICIAL_SIX_CLASSES } from '../utils/classColors';

const STORAGE_KEYS = {
  CLASSES: 'gps_chambai_classes',
  BOOKS: 'gps_chambai_books',
  OLD_BOOKS: 'gps_chambai_old_books',
  KP_SUBJECTS: 'gps_chambai_kp_subjects',
  VIDEOS: 'gps_chambai_videos',
  STUDENTS: 'gps_chambai_students',
  ATTENDANCE: 'gps_chambai_attendance',
  RESULTS: 'gps_chambai_results',
  DAILY_DIARIES: 'gps_chambai_daily_diaries',
  LESSON_PLANS: 'gps_chambai_lesson_plans',
  TIMETABLE: 'gps_chambai_timetable',
  TIMETABLE_GRID: 'gps_chambai_timetable_grid',
  SETTINGS: 'gps_chambai_settings',
  LANGUAGE: 'gps_chambai_language',
  STAFF: 'gps_chambai_staff',
  GALLERY: 'gps_chambai_gallery',
  PTC_INFO: 'gps_chambai_ptc_info',
  PTC_MEMBERS: 'gps_chambai_ptc_members',
  PTC_TRANSACTIONS: 'gps_chambai_ptc_transactions',
  OFFICE_DOCS: 'gps_chambai_office_docs',
  BOOKS_DEMAND: 'gps_chambai_books_demand',
  BASIC_FACILITIES: 'gps_chambai_basic_facilities',
  DAILY_ENROLMENT: 'gps_chambai_daily_enrolment',
  MONTHLY_ENROLMENT: 'gps_chambai_monthly_enrolment',
  CLASS_ENROLMENT: 'gps_chambai_class_enrolment',
  CERTIFICATES: 'gps_chambai_certificates',
  STRUCK_OFF: 'gps_chambai_struck_off',
  EXAM_PAPERS: 'gps_chambai_exam_papers',
  CUSTOMIZATION: 'gps_chambai_customization',
  NOTIFICATIONS: 'gps_chambai_notifications',
  TEACHER_ATTENDANCE: 'gps_chambai_teacher_attendance',
  OFFICIAL_TEACHERS: 'gps_chambai_official_teachers',
  HIRS_CV: 'gps_chambai_hirs_cv',
  SCHOOL_ABOUT: 'gps_chambai_school_about',
  SIGNATURES_STAMP: 'gps_chambai_signatures_stamp',
  WHATSAPP_SETTINGS: 'gps_chambai_whatsapp_settings',
  PTC_CATEGORIZED_FUND: 'gps_chambai_ptc_categorized_fund',
  ATTENDANCE_MONTHLY_STATS: 'gps_chambai_attendance_monthly_stats',
};

export const DEFAULT_SETTINGS: SchoolSettings = {
  schoolNameEn: 'Govt. Primary School Chambai Kohat',
  schoolNameUr: 'گورنمنٹ پرائمری سکول چمبئی کوہاٹ',
  subtitleEn: 'Elementary & Secondary Education Department, KP',
  subtitleUr: 'محکمہ ابتدائی و ثانوی تعلیم، خیبر پختونخوا',
  district: 'Kohat',
  province: 'Khyber Pakhtunkhwa',
  passingPercentage: 40,
  academicYear: '2026-2027',
  contactPhone: '+92 922 510000',
  headmasterName: 'Muhammad Ismail (Headmaster)',
};

export const DEFAULT_CUSTOMIZATION: AppCustomizationSettings = {
  appName: 'GPS Chambai',
  appSubtitle: 'Govt. Primary School Chambai Kohat · EMIS: 16454',
  schoolLogoUrl: '/assets/aistudio/20260903_200547_79893d25.png',
  teacherProfilePhotoUrl: '/assets/aistudio/Microsoft_Profile_78e13ce1.png',
  headerBgColor: '#065f46',
  headerCompact: true,
  homeWallpaperUrl: '',
  homeBgColor: '#f8fafc',
  appWallpaperUrl: '',
  appBgColor: '#f1f5f9',
  cardBorderRadius: 16,
  cardSize: 'compact',
  cardSpacing: 12,
  homeViewMode: 'grid',
  iconSize: 22,
  themeMode: 'emerald',
  navBgColor: '#0f172a',
  primaryAccentColor: '#059669',
  secondaryAccentColor: '#d97706',
  globalTextColor: '#0f172a',
  buttonBgColor: '#059669',
  cardBorderWidth: 1,
  cardShadow: 'md',
  dashboardColumns: 2,
  homeCardOrder: [
    'admission',
    'other_attendance',
    'staff',
    'ptc_fund',
    'books',
    'gallery',
    'videos',
    'other_office_data',
    'other_backup',
    'other_ai',
    'ssr',
    'other',
  ],
  otherCardOrder: [
    'classes',
    'other_certificate',
    'other_struck_off',
    'other_timetable',
    'other_results',
    'other_exam_1',
    'other_lesson_plans',
    'other_daily_diary',
  ],
  cardCustomNames: {},
  cardGradientToColors: {},
  cardBorderColors: {},
  cardTextColors: {},
  cardIconColors: {},
  cardBuiltInIcons: {},
  cardAdvancedConfigs: {},
  wallpaperConfig: {
    url: '',
    targetMode: 'home_screen',
    selectedCardKeys: [],
    blur: 0,
    brightness: 100,
    opacity: 100,
    fit: 'cover',
    overlayColor: '#0f172a',
    overlayOpacity: 20,
  },
  homeBottomButtonsOrder: ['storage', 'move_card', 'view_mode', 'customize'],
  homeBottomButtonsConfig: {
    storage: {
      id: 'storage',
      labelEn: 'GPS CHAMBAI STORAGE',
      labelUr: 'سٹوریج فولڈر',
      bgColor: '#047857',
      gradientTo: '#065f46',
      useGradient: true,
      textColor: '#ffffff',
      iconName: 'FolderOpen',
      size: 'normal',
      borderRadius: 14,
      showLabel: true,
    },
    move_card: {
      id: 'move_card',
      labelEn: 'MOVE CARD',
      labelUr: 'کارڈ منتقل کریں',
      bgColor: '#0f172a',
      gradientTo: '#1e293b',
      useGradient: true,
      textColor: '#ffffff',
      iconName: 'Move',
      size: 'normal',
      borderRadius: 14,
      showLabel: true,
    },
    view_mode: {
      id: 'view_mode',
      labelEn: 'GRID / LIST VIEW',
      labelUr: 'گرڈ / لسٹ ویو',
      bgColor: '#1d4ed8',
      gradientTo: '#1e40af',
      useGradient: true,
      textColor: '#ffffff',
      iconName: 'LayoutGrid',
      size: 'normal',
      borderRadius: 14,
      showLabel: true,
    },
    customize: {
      id: 'customize',
      labelEn: 'CUSTOMIZE',
      labelUr: 'کسٹمائز کریں',
      bgColor: '#7c3aed',
      gradientTo: '#5b21b6',
      useGradient: true,
      textColor: '#ffffff',
      iconName: 'Palette',
      size: 'normal',
      borderRadius: 14,
      showLabel: true,
    },
  },
  fileFormatIcons: {},
  customThemes: [],
  cardColors: {
    admission: '#9333EA',
    qr_scanner: '#00C896',
    staff: '#1D4ED8',
    ptc_fund: '#2563EB',
    books: '#EF4444',
    gallery: '#F59E0B',
    videos: '#0284C7',
    other_office_data: '#4F46E5',
    other_backup: '#1E293B',
    other_ai: '#7C3AED',
    ssr: '#0D9488',
    guides: '#00B0F0',
    other: '#F43F5E',
    classes: '#00B050',
    other_certificate: '#7C3AED',
    other_struck_off: '#E11D48',
    other_timetable: '#0284C7',
    other_results: '#D97706',
    other_exam_1: '#0D9488',
    other_lesson_plans: '#0891B2',
    other_daily_diary: '#8B5CF6',
  },
  customIcons: {},
  aboutSocialLinks: {
    facebook: 'https://web.facebook.com/gpschambaikohat/',
    youtube: 'https://www.youtube.com/@GPSChambaiKohat',
    whatsapp: 'https://wa.me/923369053352',
    twitter: 'https://twitter.com/mirfan25389',
    website: 'https://iemis.kpese.gov.pk/ords/r/emis/human-resource-management-information-system-hrmis/login',
    email: 'm.irfan.25389@gmail.com',
  },
};

export const INITIAL_CLASSES: SchoolClass[] = [
  { id: 'c-kachi', name: 'KG / Kachi (ECE)', urduName: 'کچی (ابتدائی بچپن)', gradeLevel: 0, section: 'A', roomNumber: 'Room 1', hexColor: '#00B050', createdAt: '2026-01-10' },
  { id: 'c-1', name: 'Class 1', urduName: 'اول اعلی (جماعت اول)', gradeLevel: 1, section: 'A', roomNumber: 'Room 2', hexColor: '#00B0F0', createdAt: '2026-01-10' },
  { id: 'c-2', name: 'Class 2', urduName: 'جماعت دوئم', gradeLevel: 2, section: 'A', roomNumber: 'Room 3', hexColor: '#FFC000', createdAt: '2026-01-10' },
  { id: 'c-3', name: 'Class 3', urduName: 'جماعت سوئم', gradeLevel: 3, section: 'A', roomNumber: 'Room 4', hexColor: '#FF3399', createdAt: '2026-01-10' },
  { id: 'c-4', name: 'Class 4', urduName: 'جماعت چہارم', gradeLevel: 4, section: 'A', roomNumber: 'Room 5', hexColor: '#CC00CC', createdAt: '2026-01-10' },
  { id: 'c-5', name: 'Class 5', urduName: 'جماعت پنجم', gradeLevel: 5, section: 'A', roomNumber: 'Room 6', hexColor: '#FF0000', createdAt: '2026-01-10' },
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'b-1',
    title: 'Urdu for Class 5 (اردو جماعت پنجم)',
    classId: 'c-5',
    subject: 'Urdu',
    description: 'National Curriculum Textbook published by Khyber Pakhtunkhwa Textbook Board Peshawar.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_Textbook_Urdu_Class_5.pdf',
    fileSize: '4.2 MB',
    dateAdded: '2026-02-15',
    type: 'book',
    bookCondition: 'New',
    quantity: 33,
  },
  {
    id: 'b-2',
    title: 'Mathematics Class 5 (ریاضی جماعت پنجم)',
    classId: 'c-5',
    subject: 'Mathematics',
    description: 'Numbers, fractions, geometry, and real-life mathematical reasoning for primary school learners.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_Textbook_Math_Class_5.pdf',
    fileSize: '5.8 MB',
    dateAdded: '2026-02-18',
    type: 'book',
    bookCondition: 'New',
    quantity: 33,
  },
  {
    id: 'b-3',
    title: 'General Science Class 4 (جنرل سائنس)',
    classId: 'c-4',
    subject: 'General Science',
    description: 'Living things, plants, environment, matter, and forces textbook in Urdu & English medium.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_Science_Class_4.pdf',
    fileSize: '6.1 MB',
    dateAdded: '2026-02-20',
    type: 'book',
    bookCondition: 'New',
    quantity: 34,
  },
  {
    id: 'b-4',
    title: 'English Class 3 (Easy English Reader)',
    classId: 'c-3',
    subject: 'English',
    description: 'Phonics, vocabulary, short dialogue reading, and fundamental primary sentence structures.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_English_Class_3.pdf',
    fileSize: '3.9 MB',
    dateAdded: '2026-02-22',
    type: 'book',
    bookCondition: 'New',
    quantity: 32,
  },
  {
    id: 'b-5',
    title: 'Islamiat Class 2 (اسلامیات جماعت دوم)',
    classId: 'c-2',
    subject: 'Islamiat',
    description: 'Basic Islamic beliefs, pillars, prayers, good morals, and respect for elders.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_Islamiat_Class_2.pdf',
    fileSize: '3.1 MB',
    dateAdded: '2026-02-25',
    type: 'book',
    bookCondition: 'New',
    quantity: 30,
  },
  {
    id: 'b-6',
    title: 'Pashto Class 1 (پشتو جماعت اول)',
    classId: 'c-1',
    subject: 'Pashto',
    description: 'Regional language alphabet, basic words, and reading exercises approved by KP Textbook Board.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_Pashto_Class_1.pdf',
    fileSize: '3.4 MB',
    dateAdded: '2026-02-26',
    type: 'book',
    bookCondition: 'New',
    quantity: 35,
  },
  {
    id: 'b-7',
    title: 'Kachi ECE English & Drawing Activity Book',
    classId: 'c-kachi',
    subject: 'English',
    description: 'Early Childhood Education colorful phonics and tracing textbook.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'KPK_ECE_English_Kachi.pdf',
    fileSize: '4.5 MB',
    dateAdded: '2026-02-27',
    type: 'book',
    bookCondition: 'New',
    quantity: 42,
  },
  {
    id: 'g-1',
    title: 'Teachers Guide for Primary Science (اساتذہ رہنما کتاب سائنس)',
    classId: 'c-5',
    subject: 'General Science',
    description: 'Single National Curriculum pedagogical teacher training guide with sample lesson activities and SLO matrix.',
    author: 'Directorate of Curriculum & Teacher Education (DCTE) Abbottabad',
    pdfFileName: 'Teacher_Guide_Science_KP.pdf',
    fileSize: '7.4 MB',
    dateAdded: '2026-01-28',
    type: 'guide',
  },
  {
    id: 'g-2',
    title: 'Early Childhood Education (ECE) Activity Guide',
    classId: 'c-kachi',
    subject: 'English',
    description: 'Montessori and play-based learning manual for ECE and Kachi class instructors in KP government schools.',
    author: 'Elementary & Secondary Education KP',
    pdfFileName: 'ECE_Activity_Handbook_KPK.pdf',
    fileSize: '5.2 MB',
    dateAdded: '2026-02-05',
    type: 'guide',
  },
  {
    id: 'g-3',
    title: 'Primary Urdu Grammar & Composition Guide',
    classId: 'c-4',
    subject: 'Urdu',
    description: 'Key guide for primary school teachers on teaching Urdu script, sentences, and vocabulary building.',
    author: 'KP Textbook Board Peshawar',
    pdfFileName: 'Urdu_Teacher_Resource_Class4.pdf',
    fileSize: '4.8 MB',
    dateAdded: '2026-02-12',
    type: 'guide',
  },
];

export const INITIAL_OLD_BOOKS: OldBookStockItem[] = [
  { id: 'ob-1', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'Urdu', availableQty: 18, conditionNote: 'Good reusable condition from previous session', updatedAt: '2026-04-01' },
  { id: 'ob-2', classId: 'c-1', className: 'Class 1', subject: 'English', availableQty: 15, conditionNote: 'Collected from promoted Class 1 students', updatedAt: '2026-04-01' },
  { id: 'ob-3', classId: 'c-2', className: 'Class 2', subject: 'Mathematics', availableQty: 14, conditionNote: 'Bound & repaired copies in school library', updatedAt: '2026-04-02' },
  { id: 'ob-4', classId: 'c-3', className: 'Class 3', subject: 'Islamiat', availableQty: 20, conditionNote: 'Clean old stock available for distribution', updatedAt: '2026-04-02' },
  { id: 'ob-5', classId: 'c-4', className: 'Class 4', subject: 'General Science', availableQty: 16, conditionNote: 'Available in Book Bank cabinet', updatedAt: '2026-04-03' },
  { id: 'ob-6', classId: 'c-5', className: 'Class 5', subject: 'Urdu', availableQty: 22, conditionNote: 'Returned by outgoing 5th class batch', updatedAt: '2026-04-03' },
];

export function generateInitialKpOfficialSubjects(): KpOfficialSubjectRecord[] {
  const list: KpOfficialSubjectRecord[] = [];
  OFFICIAL_SIX_CLASSES.forEach((cls) => {
    const subjects = CLASS_SUBJECT_MAPPING[cls.id] || [];
    subjects.forEach((sub, idx) => {
      list.push({
        id: `kps-${cls.id}-${idx + 1}`,
        classId: cls.id,
        className: cls.dropdownLabel,
        subject: sub,
        bookTitle: `${sub} — ${cls.dropdownLabel}`,
        addedAt: '2026-01-15',
      });
    });
  });
  return list;
}

export const INITIAL_VIDEOS: VideoItem[] = [
  {
    id: 'v-1',
    title: 'Class 5 Mathematics: Fractions & Decimals (کسور اور اعشاریہ)',
    youtubeUrl: 'https://www.youtube.com/watch?v=kYF_y_0Qc_A',
    youtubeId: 'kYF_y_0Qc_A',
    thumbnailUrl: 'https://img.youtube.com/vi/kYF_y_0Qc_A/hqdefault.jpg',
    classId: 'c-5',
    subject: 'Mathematics',
    description: 'Detailed explanation of proper and improper fractions with step-by-step visual examples for KP students.',
    dateAdded: '2026-02-01',
  },
  {
    id: 'v-2',
    title: 'Class 4 General Science: The Solar System & Planets',
    youtubeUrl: 'https://www.youtube.com/watch?v=libKVRa01L8',
    youtubeId: 'libKVRa01L8',
    thumbnailUrl: 'https://img.youtube.com/vi/libKVRa01L8/hqdefault.jpg',
    classId: 'c-4',
    subject: 'General Science',
    description: 'Animated primary school explanation of the sun, earth, moon, and our solar system planets.',
    dateAdded: '2026-02-04',
  },
  {
    id: 'v-3',
    title: 'Class 3 English: Phonics & Reading Short Sentences',
    youtubeUrl: 'https://www.youtube.com/watch?v=BELlZKpi1Zs',
    youtubeId: 'BELlZKpi1Zs',
    thumbnailUrl: 'https://img.youtube.com/vi/BELlZKpi1Zs/hqdefault.jpg',
    classId: 'c-3',
    subject: 'English',
    description: 'Interactive phonics sounds for primary grade children to develop accurate pronunciation.',
    dateAdded: '2026-02-08',
  },
  {
    id: 'v-4',
    title: 'Kachi & ECE: Urdu Haroof-e-Tahajji (حروفِ تہجی گیت)',
    youtubeUrl: 'https://www.youtube.com/watch?v=9_C8lYqFkCQ',
    youtubeId: '9_C8lYqFkCQ',
    thumbnailUrl: 'https://img.youtube.com/vi/9_C8lYqFkCQ/hqdefault.jpg',
    classId: 'c-kachi',
    subject: 'Urdu',
    description: 'Catchy and engaging animated Urdu alphabet song for early childhood learners.',
    dateAdded: '2026-02-11',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 's-101',
    admissionNo: 'GPS-2026-001',
    rollNo: '01',
    admissionCategory: 'F',
    admissionDate: '2026-01-15',
    name: 'Muhammad Bilal Khan',
    fatherName: 'Tariq Khan',
    dob: '2016-04-12',
    gender: 'Male',
    mobileNo: '0301-8923412',
    bFormNo: '14301-2948291-3',
    classId: 'c-5',
    address: 'Village Chambai, Post Office Jangalkhel, Tehsil & District Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-15',
  },
  {
    id: 's-102',
    admissionNo: 'GPS-2026-002',
    rollNo: '02',
    admissionCategory: 'G',
    admissionDate: '2026-01-16',
    name: 'Fatima Bibi',
    fatherName: 'Gul Nawaz',
    dob: '2016-08-25',
    gender: 'Female',
    mobileNo: '0333-9128472',
    bFormNo: '14301-4829103-2',
    classId: 'c-5',
    address: 'Main Bazar Chambai, Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-16',
  },
  {
    id: 's-103',
    admissionNo: 'GPS-2026-003',
    rollNo: '01',
    admissionCategory: 'F',
    admissionDate: '2026-01-18',
    name: 'Hamza Afridi',
    fatherName: 'Niaz Muhammad',
    dob: '2017-02-14',
    gender: 'Male',
    mobileNo: '0345-9821345',
    bFormNo: '14301-7654321-1',
    classId: 'c-4',
    address: 'Chambai Bala, Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-18',
  },
  {
    id: 's-104',
    admissionNo: 'GPS-2026-004',
    rollNo: '01',
    admissionCategory: 'P',
    admissionDate: '2026-01-20',
    name: 'Ayesha Noor',
    fatherName: 'Farhad Ali',
    dob: '2018-05-19',
    gender: 'Female',
    mobileNo: '0312-7654321',
    bFormNo: '14301-1122334-4',
    classId: 'c-3',
    address: 'Near Jamia Masjid, Chambai, Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-20',
  },
  {
    id: 's-105',
    admissionNo: 'GPS-2026-005',
    rollNo: '01',
    admissionCategory: 'F',
    admissionDate: '2026-01-22',
    name: 'Zubair Ahmad',
    fatherName: 'Sher Alam',
    dob: '2019-11-03',
    gender: 'Male',
    mobileNo: '0300-5544332',
    bFormNo: '14301-9988776-5',
    classId: 'c-2',
    address: 'Chambai Payan, Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-22',
  },
  {
    id: 's-106',
    admissionNo: 'GPS-2026-006',
    rollNo: '01',
    admissionCategory: 'D',
    admissionDate: '2026-01-25',
    name: 'Usman Ali',
    fatherName: 'Asad Ullah',
    dob: '2020-03-10',
    gender: 'Male',
    mobileNo: '0321-4455667',
    bFormNo: '14301-5566778-9',
    classId: 'c-1',
    address: 'Dhok Chambai, Kohat',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-01-25',
  },
  {
    id: 's-107',
    admissionNo: 'GPS-2026-007',
    rollNo: '01',
    admissionCategory: 'F',
    admissionDate: '2026-02-01',
    name: 'Sana Gul',
    fatherName: 'Noor Rehman',
    dob: '2021-07-15',
    gender: 'Female',
    mobileNo: '0334-1122998',
    bFormNo: '14301-3344556-8',
    classId: 'c-kachi',
    address: 'Chambai Morr, Kohat Road',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    status: 'Active',
    createdAt: '2026-02-01',
  },
];

export const INITIAL_RESULTS: ExamResult[] = [
  {
    id: 'res-1',
    studentId: 's-101',
    classId: 'c-5',
    examName: '1st Semester Examination 2026',
    examDate: '2026-02-28',
    subjectMarks: [
      { subject: 'Urdu', maxMarks: 100, obtainedMarks: 86 },
      { subject: 'English', maxMarks: 100, obtainedMarks: 78 },
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 94 },
      { subject: 'General Science', maxMarks: 100, obtainedMarks: 88 },
      { subject: 'Islamiat', maxMarks: 100, obtainedMarks: 92 },
      { subject: 'Pashto', maxMarks: 100, obtainedMarks: 82 },
    ],
    totalMaxMarks: 600,
    totalObtainedMarks: 520,
    percentage: 86.67,
    grade: 'A+',
    isPassed: true,
    remarks: 'Outstanding academic performance. Excellent grasp of mathematics and science.',
  },
  {
    id: 'res-2',
    studentId: 's-102',
    classId: 'c-5',
    examName: '1st Semester Examination 2026',
    examDate: '2026-02-28',
    subjectMarks: [
      { subject: 'Urdu', maxMarks: 100, obtainedMarks: 90 },
      { subject: 'English', maxMarks: 100, obtainedMarks: 84 },
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 80 },
      { subject: 'General Science', maxMarks: 100, obtainedMarks: 85 },
      { subject: 'Islamiat', maxMarks: 100, obtainedMarks: 95 },
      { subject: 'Pashto', maxMarks: 100, obtainedMarks: 89 },
    ],
    totalMaxMarks: 600,
    totalObtainedMarks: 523,
    percentage: 87.17,
    grade: 'A+',
    isPassed: true,
    remarks: 'First position in class. Highly disciplined student.',
  },
  {
    id: 'res-3',
    studentId: 's-103',
    classId: 'c-4',
    examName: '1st Semester Examination 2026',
    examDate: '2026-02-28',
    subjectMarks: [
      { subject: 'Urdu', maxMarks: 100, obtainedMarks: 74 },
      { subject: 'English', maxMarks: 100, obtainedMarks: 68 },
      { subject: 'Mathematics', maxMarks: 100, obtainedMarks: 72 },
      { subject: 'General Science', maxMarks: 100, obtainedMarks: 80 },
      { subject: 'Islamiat', maxMarks: 100, obtainedMarks: 85 },
    ],
    totalMaxMarks: 500,
    totalObtainedMarks: 379,
    percentage: 75.8,
    grade: 'A',
    isPassed: true,
    remarks: 'Good progress. Advised to focus more on English reading comprehension.',
  },
];

export const INITIAL_LESSON_PLANS: LessonPlan[] = [
  {
    id: 'lp-1',
    classId: 'c-5',
    subject: 'General Science',
    teacherName: 'Sir Rashid Khan',
    date: '2026-10-25',
    topic: 'Photosynthesis & Plant Structure',
    learningObjectives: 'Students will be able to identify key parts of a green leaf and summarize how sunlight, water, and carbon dioxide create food.',
    teachingMaterials: 'Real green plant leaves, chart with leaf cross-section, whiteboard markers, hand magnifying glass.',
    activities: '1. Warm-up questioning on why leaves are green (5 min). 2. Hands-on inspection of stomata with magnifier (15 min). 3. Board diagram synthesis and group explanation (15 min).',
    assessment: 'Short 3-question oral quiz and student diagram labeling on notebook.',
    homework: 'Collect 2 different leaves from home surroundings and sketch their veins in the notebook.',
    remarks: 'Students engaged actively with real leaf specimens. Good conceptual grasp.',
  },
  {
    id: 'lp-2',
    classId: 'c-4',
    subject: 'Mathematics',
    teacherName: 'Sir Tariq Mehmood',
    date: '2026-10-26',
    topic: 'Introduction to Common Fractions (کسور)',
    learningObjectives: 'Differentiate numerator from denominator; shade fractions (1/2, 1/4, 3/4) on geometric circular shapes.',
    teachingMaterials: 'Cardboard fraction circles, colored chalk, fraction strip foldables.',
    activities: 'Divide paper chapati into equal halves and quarters; students take turns coloring their fractions on the board.',
    assessment: 'Students solve 4 textbook practice problems individually.',
    homework: 'Exercise 3.1 Questions 1 to 5 from KP Textbook.',
    remarks: 'Visual paper folding helped slower learners grasp the fraction concept easily.',
  },
];

export const INITIAL_TIMETABLE: TimetableSlot[] = [
  { id: 'tt-1', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 1, startTime: '08:00', endTime: '08:40', subject: 'Urdu', teacherName: 'Muhammad Ismail', room: 'Room 6' },
  { id: 'tt-2', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 2, startTime: '08:40', endTime: '09:20', subject: 'Mathematics', teacherName: 'Rashid Khan', room: 'Room 6' },
  { id: 'tt-3', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 3, startTime: '09:20', endTime: '10:00', subject: 'General Science', teacherName: 'Rashid Khan', room: 'Room 6' },
  { id: 'tt-4', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 4, startTime: '10:00', endTime: '10:40', subject: 'English', teacherName: 'Tariq Mehmood', room: 'Room 6' },
  { id: 'tt-5', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 5, startTime: '11:00', endTime: '11:40', subject: 'Islamiat', teacherName: 'Qari Abdul Quddus', room: 'Room 6' },
  { id: 'tt-6', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 6, startTime: '11:40', endTime: '12:20', subject: 'Pashto', teacherName: 'Zahid Ullah', room: 'Room 6' },
  { id: 'tt-7', classId: 'c-5', dayOfWeek: 'Monday', periodNumber: 7, startTime: '12:20', endTime: '13:00', subject: 'Drawing / Nazra', teacherName: 'Qari Abdul Quddus', room: 'Room 6' },
];

const DAYS_WITH_URDU: { day: DayOfWeekName; dayUr: string }[] = [
  { day: 'Monday', dayUr: 'پیر' },
  { day: 'Tuesday', dayUr: 'منگل' },
  { day: 'Wednesday', dayUr: 'بدھ' },
  { day: 'Thursday', dayUr: 'جمعرات' },
  { day: 'Friday', dayUr: 'جمعہ' },
  { day: 'Saturday', dayUr: 'ہفتہ' },
  { day: 'Sunday', dayUr: 'اتوار' },
];

export function generateDefaultTimetableGridForClass(classId: string): TimetableGridRow[] {
  const subjects = CLASS_SUBJECT_MAPPING[classId] || ['English', 'Mathematics', 'Urdu', 'Pashto', 'Islamiat', 'General Science', 'Drawing'];
  return DAYS_WITH_URDU.map(({ day, dayUr }) => {
    if (day === 'Sunday') {
      const h = 'Weekly Holiday / اتوار تعطیل';
      return {
        day,
        dayUr,
        period1: h,
        period2: h,
        period3: h,
        period4: h,
        period5: h,
        period6: h,
        period7: h,
        periods: { 1: h, 2: h, 3: h, 4: h, 5: h, 6: h, 7: h },
      };
    }
    const p1 = `${subjects[0] || 'English'} (08:00-08:40)`;
    const p2 = `${subjects[1] || 'Mathematics'} (08:40-09:20)`;
    const p3 = `${subjects[2] || 'Urdu'} (09:20-10:00)`;
    const p4 = `${subjects[3] || 'Pashto'} (10:00-10:40)`;
    const p5 = `${subjects[4] || 'Islamiat'} (11:00-11:40)`;
    const p6 = `${subjects[5] || 'Drawing'} (11:40-12:20)`;
    const p7 = day === 'Friday' ? 'Jummah Prayer / جمعہ (12:20)' : `${subjects[6] || 'Nazra Quran'} (12:20-13:00)`;
    return {
      day,
      dayUr,
      period1: p1,
      period2: p2,
      period3: p3,
      period4: p4,
      period5: p5,
      period6: p6,
      period7: p7,
      periods: { 1: p1, 2: p2, 3: p3, 4: p4, 5: p5, 6: p6, 7: p7 },
    };
  });
}

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', studentId: 's-101', classId: 'c-5', date: '2026-10-28', status: 'Present' },
  { id: 'att-2', studentId: 's-102', classId: 'c-5', date: '2026-10-28', status: 'Present' },
  { id: 'att-3', studentId: 's-103', classId: 'c-4', date: '2026-10-28', status: 'Present' },
  { id: 'att-4', studentId: 's-104', classId: 'c-3', date: '2026-10-28', status: 'Late' },
  { id: 'att-5', studentId: 's-105', classId: 'c-2', date: '2026-10-28', status: 'Leave' },
  { id: 'att-6', studentId: 's-106', classId: 'c-1', date: '2026-10-28', status: 'Present' },
  { id: 'att-7', studentId: 's-107', classId: 'c-kachi', date: '2026-10-28', status: 'Present' },
];

export const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'staff-1',
    name: 'Muhammad Ismail',
    urduName: 'محمد اسماعیل',
    designation: 'PSHT',
    department: 'Administration',
    staffCategory: 'Head Teacher',
    roleDescription: 'Overall school leadership, academic inspection, teacher supervision, and department coordination.',
    qualification: 'M.A Political Science, M.Ed (Gold Medalist)',
    personalNo: 'KP-104829',
    cnic: '14301-2849182-3',
    phone: '+92 333 9612345',
    email: 'm.ismail@gpschambai.edu.pk',
    assignedClasses: ['Class 5'],
    assignedSubjects: [],
    joiningDate: '2015-08-14',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
    address: 'Chambai Bala, Kohat',
    emergencyContact: '+92 300 9812734',
  },
  {
    id: 'staff-2',
    name: 'Rashid Khan',
    urduName: 'راشد خان',
    designation: 'SPST',
    department: 'Primary Teaching',
    staffCategory: 'Focal Person',
    roleDescription: 'Class 4 Incharge, EMIS & IT Focal Person, and examination records controller.',
    qualification: 'B.Sc Physics & Mathematics, B.Ed',
    personalNo: 'KP-189204',
    cnic: '14301-4920193-1',
    phone: '+92 345 9876543',
    email: 'rashid.pst@gpschambai.edu.pk',
    assignedClasses: ['Class 4'],
    assignedSubjects: [],
    joiningDate: '2018-03-20',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    address: 'Near Old Bazar, Kohat',
    emergencyContact: '+92 332 5410982',
  },
  {
    id: 'staff-3',
    name: 'Tariq Mehmood',
    urduName: 'طارق محمود',
    designation: 'PST',
    department: 'Primary Teaching',
    staffCategory: 'Other',
    roleDescription: 'Class 3 Incharge, English & Urdu literacy coordinator, and co-curricular debate incharge.',
    qualification: 'M.A English Literature, B.Ed',
    personalNo: 'KP-201948',
    cnic: '14301-6102948-7',
    phone: '+92 300 5849201',
    email: 'tariq.m@gpschambai.edu.pk',
    assignedClasses: ['Class 3'],
    assignedSubjects: [],
    joiningDate: '2019-09-01',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
    address: 'Chambai Payan, Kohat',
    emergencyContact: '+92 344 9128374',
  },
  {
    id: 'staff-4',
    name: 'Qari Abdul Quddus',
    urduName: 'قاری عبد القدوس',
    designation: 'PST',
    department: 'Religious & Arabic',
    staffCategory: 'Other',
    roleDescription: 'Class 2 Incharge, Nazra Quran with Tajweed, Islamiat curriculum, and morning assembly prayers.',
    qualification: 'Shahadat-ul-Almiya, M.A Islamiat',
    personalNo: 'KP-156382',
    cnic: '14301-3829104-5',
    phone: '+92 312 9402847',
    email: 'qari.quddus@gpschambai.edu.pk',
    assignedClasses: ['Class 2'],
    assignedSubjects: [],
    joiningDate: '2016-04-10',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=400',
    address: 'Mohallah Masjid Bilal, Chambai, Kohat',
    emergencyContact: '+92 301 8293019',
  },
  {
    id: 'staff-5',
    name: 'Zahid Ullah',
    urduName: 'زاہد اللہ',
    designation: 'PST',
    department: 'Physical Education',
    staffCategory: 'Other',
    roleDescription: 'Class 1 Incharge, Physical fitness, morning drill exercises, annual sports gala, and Boy Scouts.',
    qualification: 'B.P.Ed (Physical Education), B.Ed',
    personalNo: 'KP-228491',
    cnic: '14301-7294012-9',
    phone: '+92 334 8192039',
    email: 'zahid.pet@gpschambai.edu.pk',
    assignedClasses: ['Class 1'],
    assignedSubjects: [],
    joiningDate: '2021-02-15',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=400',
    address: 'KDA Sector 4, Kohat',
    emergencyContact: '+92 313 7482910',
  },
  {
    id: 'staff-6',
    name: 'Fazal Rabi',
    urduName: 'فضل ربی',
    designation: 'PST',
    department: 'Primary Teaching',
    staffCategory: 'Other',
    roleDescription: 'KG / Kachi (ECE) Incharge, early childhood Montessori activities, and admission records.',
    qualification: 'B.A, Diploma in ECE & Information Technology',
    personalNo: 'KP-294018',
    cnic: '14301-8392014-3',
    phone: '+92 321 9582910',
    email: 'fazal.rabi@gpschambai.edu.pk',
    assignedClasses: ['KG / Kachi (ECE)'],
    assignedSubjects: [],
    joiningDate: '2020-06-01',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400',
    address: 'Bannu Road, Kohat',
    emergencyContact: '+92 346 8392019',
  },
  {
    id: 'staff-8',
    name: 'Akhtar Gul',
    urduName: 'اختر گل',
    designation: 'Chowkidar',
    department: 'Support & Security',
    staffCategory: 'Chowkidar',
    roleDescription: 'Main entrance security, student safety during morning arrival and departure, and campus perimeter watch.',
    qualification: 'Ex-Serviceman / Middle School Certificate',
    personalNo: 'KP-382910',
    cnic: '14301-0294821-5',
    phone: '+92 336 9482019',
    assignedClasses: [],
    assignedSubjects: [],
    joiningDate: '2016-01-05',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    address: 'Village Chambai, Kohat',
    emergencyContact: '+92 302 9182736',
  },
];

export const GPS_CHAMBAI_OFFICIAL_TEACHERS: StaffMember[] = [
  {
    id: 'staff-anar',
    name: 'Anar Khan',
    urduName: 'انار خان',
    designation: 'SENIOR PST • BPS-14',
    bps: 14,
    staffCategory: 'SPST',
    department: 'Primary Teaching',
    qualification: 'M.A, B.Ed',
    personalNo: 'KP-140116',
    cnic: '14301-0116094-3',
    phone: '0333-9123456',
    contactNo: '0333-9123456',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2016-03-15',
    address: 'Chambai Bala, Kohat',
  },
  {
    id: 'staff-jamil',
    name: 'Jamil Raza',
    urduName: 'جمیل رضا',
    designation: 'CHOWKIDAR • BPS-3',
    bps: 3,
    staffCategory: 'Chowkidar',
    department: 'Support & Security',
    qualification: 'Matric',
    personalNo: 'KP-143829',
    cnic: '14301-3829102-1',
    phone: '0334-8765432',
    contactNo: '0334-8765432',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2014-01-10',
    address: 'Chambai, Kohat',
  },
  {
    id: 'staff-mubashir',
    name: 'Mubashir Ahmad',
    urduName: 'مبشر احمد',
    designation: 'PST • BPS-12',
    bps: 12,
    staffCategory: 'PST',
    department: 'Primary Teaching',
    qualification: 'B.Sc, B.Ed',
    personalNo: 'KP-145296',
    cnic: '14301-5296199-9',
    phone: '0300-5849201',
    contactNo: '0300-5849201',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2019-09-01',
    address: 'Kohat City',
  },
  {
    id: 'staff-irfan',
    name: 'Muhammad Irfan',
    urduName: 'محمد عرفان',
    designation: 'SENIOR PST • BPS-14',
    bps: 14,
    staffCategory: 'SPST',
    department: 'Primary Teaching',
    qualification: 'M.Sc, M.Ed',
    personalNo: 'KP-149843',
    cnic: '14301-9843438-1',
    phone: '0345-9876543',
    contactNo: '0345-9876543',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2017-04-12',
    address: 'Chambai Payan, Kohat',
  },
  {
    id: 'staff-sadaqat',
    name: 'Sadaqat Khan',
    urduName: 'صداقت خان',
    designation: 'PST • BPS-12',
    bps: 12,
    staffCategory: 'PST',
    department: 'Primary Teaching',
    qualification: 'B.A, B.Ed',
    personalNo: 'KP-147649',
    cnic: '14301-7649201-5',
    phone: '0312-9402847',
    contactNo: '0312-9402847',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2020-02-18',
    address: 'KDA Kohat',
  },
  {
    id: 'staff-shemood',
    name: 'Shemood Ur Rehman',
    urduName: 'شمود الرحمن',
    designation: 'SENIOR PST • BPS-14',
    bps: 14,
    staffCategory: 'SPST',
    department: 'Primary Teaching',
    qualification: 'M.A English, B.Ed',
    personalNo: 'KP-148706',
    cnic: '14301-8706242-1',
    phone: '0336-9482019',
    contactNo: '0336-9482019',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2016-08-20',
    address: 'Kohat Cantonment',
  },
  {
    id: 'staff-zar',
    name: 'Zar Khan Afridi',
    urduName: 'زر خان آفریدی',
    designation: 'PSHT • BPS-15',
    bps: 15,
    staffCategory: 'Head Teacher',
    department: 'Administration',
    qualification: 'M.A, M.Ed',
    personalNo: 'KP-141950',
    cnic: '14301-1950634-9',
    phone: '0333-9612345',
    contactNo: '0333-9612345',
    gender: 'Male',
    status: 'Active',
    photoUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&q=80&w=300',
    joiningDate: '2012-05-01',
    address: 'Chambai Bala, Kohat',
  },
];

export const INITIAL_TEACHER_ATTENDANCE: TeacherAttendanceRecord[] = [
  {
    id: 't-att-2026-11-03',
    date: '2026-11-03',
    dayName: 'Tuesday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'On-Duty',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
    notes: {
      'staff-shemood': 'Official meeting at DEO Male Office Kohat',
    },
  },
  {
    id: 't-att-2026-11-02',
    date: '2026-11-02',
    dayName: 'Monday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'On-Duty',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
    notes: {
      'staff-shemood': 'DEO Office Training Duty',
    },
  },
  {
    id: 't-att-2026-10-31',
    date: '2026-10-31',
    dayName: 'Saturday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
  {
    id: 't-att-2026-10-30',
    date: '2026-10-30',
    dayName: 'Friday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Leave',
    },
    notes: {
      'staff-jamil': 'Casual leave approved',
    },
  },
  {
    id: 't-att-2026-10-29',
    date: '2026-10-29',
    dayName: 'Thursday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Late',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
    notes: {
      'staff-mubashir': 'Late arrival 8:15 AM due to vehicle breakdown',
    },
  },
  {
    id: 't-att-2026-10-28',
    date: '2026-10-28',
    dayName: 'Wednesday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
  {
    id: 't-att-2026-10-27',
    date: '2026-10-27',
    dayName: 'Tuesday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'On-Duty',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
    notes: {
      'staff-irfan': 'EMIS data verification seminar',
    },
  },
  {
    id: 't-att-2026-10-26',
    date: '2026-10-26',
    dayName: 'Monday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
  {
    id: 't-att-2026-10-24',
    date: '2026-10-24',
    dayName: 'Saturday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Absent',
      'staff-jamil': 'Present',
    },
    notes: {
      'staff-sadaqat': 'Uninformed absence',
    },
  },
  {
    id: 't-att-2026-10-23',
    date: '2026-10-23',
    dayName: 'Friday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
  {
    id: 't-att-2026-10-22',
    date: '2026-10-22',
    dayName: 'Thursday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
  {
    id: 't-att-2026-10-21',
    date: '2026-10-21',
    dayName: 'Wednesday',
    isSynced: true,
    statusMap: {
      'staff-anar': 'Present',
      'staff-irfan': 'Present',
      'staff-shemood': 'Present',
      'staff-zar': 'Present',
      'staff-mubashir': 'Present',
      'staff-sadaqat': 'Present',
      'staff-jamil': 'Present',
    },
  },
];

export const INITIAL_GALLERY: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Annual Prize Distribution Ceremony 2026',
    urduTitle: 'سالانہ تقریب تقسیم انعامات ۲۰۲۶',
    category: 'Achievements & Awards',
    date: '2026-03-24',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'photo',
    description: 'High-achieving students awarded shields, merit certificates, and stationery gifts by DEO Male Kohat for outstanding board & annual exam results.',
    achievementHighlight: 'District Kohat Best Primary School Trophy 2026',
    photographerOrSource: 'School Media & Records Committee',
    tags: ['Annual Awards', 'Trophy', 'Merit Certificates', 'DEO Kohat'],
  },
  {
    id: 'gal-2',
    title: 'Pakistan Independence Day & Flag Hoisting Ceremony',
    urduTitle: 'جشنِ آزادی پاکستان و پرچم کشائی تقریب',
    category: 'Events & Celebrations',
    date: '2026-08-14',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'photo',
    description: 'Solemn national flag hoisting, recitation of national anthem, patriotic tableau, and speeches highlighting Allama Iqbal and Quaid-e-Azam.',
    achievementHighlight: '1st Prize in Circle Kohat Primary Speech Competition',
    photographerOrSource: 'Sir Tariq Mehmood',
    tags: ['14 August', 'Flag Hoisting', 'National Day', 'Speech Contest'],
  },
  {
    id: 'gal-3',
    title: 'Model ECE Classroom & Activity Learning Center',
    urduTitle: 'ای سی ای ماڈل کلاس روم و ایکٹیویٹی سنٹر',
    category: 'Classrooms & Learning',
    date: '2026-01-18',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'photo',
    description: 'Newly inaugurated Early Childhood Education (ECE) room equipped with colorful alphabet charts, phonics books, building blocks, and learning mats.',
    achievementHighlight: 'Certified Model ECE Center by KP Education Directorate',
    photographerOrSource: 'ECE Coordinator',
    tags: ['ECE', 'Kachi', 'Smart Learning', 'Montessori'],
  },
  {
    id: 'gal-4',
    title: 'District Kohat Primary Inter-School Sports Gala',
    urduTitle: 'ڈسٹرکٹ کوہاٹ پرائمری اسپورٹس مقابلہ جات',
    category: 'Sports & Activities',
    date: '2025-11-15',
    year: '2025',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'photo',
    description: 'Students from GPS Chambai won gold in 100-meter sprint and tug-of-war championship among 14 primary schools across Kohat circle.',
    achievementHighlight: 'Gold Medal in 100m Sprint & Tug of War',
    photographerOrSource: 'Sir Zahid Ullah (PET)',
    tags: ['Sports Gala', 'Athletics', 'Gold Medal', 'Cricket'],
  },
  {
    id: 'gal-5',
    title: 'Green Chambai: Tree Plantation Campaign',
    urduTitle: 'سرسبز چمبئی: شجرکاری مہم و پودے لگانا',
    category: 'School Infrastructure',
    date: '2026-02-28',
    year: '2026',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80',
    mediaType: 'photo',
    description: 'Students and teachers planted 150 olive and pine saplings around the boundary wall to foster climate awareness and green surroundings.',
    achievementHighlight: '150 Trees Planted across School Campus',
    photographerOrSource: 'School Environment Club',
    tags: ['Tree Plantation', 'Green Kohat', 'Clean Campus', 'Environment'],
  },
];

export const INITIAL_PTC_INFO: PtcCouncilInfo = {
  isEstablished: true,
  dateOfEstablished: '2021-08-15',
  registrationAuthority: 'District Education Officer (Male), Kohat (Govt of KP)',
  bankDetails: {
    accountNo: '03410041289567',
    branchCode: '0341',
    branchName: 'National Bank of Pakistan (NBP), Kohat Main Branch',
    ibanNo: 'PK64NBPA0341004128956701',
  },
};

export const INITIAL_PTC_MEMBERS: PtcMember[] = [
  { id: 'ptc-m-1', name: 'Malik Noor Muhammad Khan', designation: 'Chairperson PTC / Village Elder', cnic: '14301-2894156-3', mobileNo: '0333-9614280', isChairperson: true, address: 'Village Chambai, Post Office Chambai, Tehsil & District Kohat', status: 'Active' },
  { id: 'ptc-m-2', name: 'Muhammad Ismail', designation: 'Headmaster / Member Secretary', cnic: '14301-4921045-1', mobileNo: '0345-9871234', isChairperson: false, address: 'Staff Quarters GPS Chambai, District Kohat', status: 'Active' },
  { id: 'ptc-m-3', name: 'Haji Gulzar Ahmad', designation: 'Parent Member (Father of Class 4 Student)', cnic: '14301-7104928-5', mobileNo: '0300-5821943', isChairperson: false, address: 'Main Mohallah, Village Chambai Kohat', status: 'Active' },
  { id: 'ptc-m-4', name: 'Sher Zaman Khattak', designation: 'Parent Member (Father of Class 2 Student)', cnic: '14301-1934857-7', mobileNo: '0312-9045123', isChairperson: false, address: 'Khattak Khel Mohallah, Village Chambai Kohat', status: 'Active' },
  { id: 'ptc-m-5', name: 'Farooq Shah', designation: 'Parent Member (Father of Class 5 Student)', cnic: '14301-6284019-9', mobileNo: '0334-8712095', isChairperson: false, address: 'Sadat Colony, Village Chambai Kohat', status: 'Active' },
  { id: 'ptc-m-6', name: 'Abdur Rehman', designation: 'Teacher Member (Senior Primary Teacher)', cnic: '14301-5182904-1', mobileNo: '0346-7788990', isChairperson: false, address: 'Civil Lines, Kohat City', status: 'Active' },
];

export const INITIAL_PTC_TRANSACTIONS: PtcTransaction[] = [
  { id: 'ptc-tx-1', fundType: 'Capitation Grant', type: 'Received', amount: 75000, date: '2026-01-15', productName: 'Annual Capitation Grant Installment (1st Quarter)', receiptNo: 'SAN-KP-2026-081', remarks: 'Official grant received from E&SE Department KP via NBP' },
  { id: 'ptc-tx-2', fundType: 'Capitation Grant', type: 'Expense', amount: 14200, date: '2026-02-05', productName: 'Student Notebooks, Pencils, Erasers & Free Stationery Distribution', receiptNo: 'REC-0412-CH', remarks: 'Purchased for needy students enrolled in GPS Chambai' },
  { id: 'ptc-tx-3', fundType: 'Capitation Grant', type: 'Expense', amount: 9500, date: '2026-02-28', productName: 'Printing of Mid-Term Examination Papers & Answer Sheets', receiptNo: 'REC-0488-CH', remarks: 'Mid-term assessment examination material for all classes' },
  { id: 'ptc-tx-4', fundType: 'Petty Repair Grant', type: 'Received', amount: 50000, date: '2026-01-20', productName: 'Annual Petty Repair Conditional Grant 2026', receiptNo: 'SAN-KP-2026-114', remarks: 'Disbursed by DEO Male Kohat for school infrastructure maintenance' },
  { id: 'ptc-tx-5', fundType: 'Petty Repair Grant', type: 'Expense', amount: 18500, date: '2026-02-10', productName: 'Repair of Class 2 & 4 Windows, Glass Panes & Door Latches', receiptNo: 'REC-0511-CH', remarks: 'Carpentry and glass repair work verified by PTC Committee' },
  { id: 'ptc-tx-6', fundType: 'Petty Repair Grant', type: 'Expense', amount: 8200, date: '2026-03-02', productName: 'Plumbing & Water Filter Tap Replacement in Veranda', receiptNo: 'REC-0567-CH', remarks: 'Sanitary fittings and pipe repairs for safe drinking water' },
  { id: 'ptc-tx-7', fundType: 'Classroom Consumable Grant', type: 'Received', amount: 35000, date: '2026-01-22', productName: 'Classroom Consumable & Teaching Learning Materials (TLM)', receiptNo: 'SAN-KP-2026-209', remarks: 'Allocated for daily classroom consumable teaching aids' },
  { id: 'ptc-tx-8', fundType: 'Classroom Consumable Grant', type: 'Expense', amount: 7800, date: '2026-02-14', productName: 'Whiteboard Markers, Chalk Boxes, Dustless Erasers & Chart Papers', receiptNo: 'REC-0622-CH', remarks: 'Stationery and writing supplies for teacher use in classrooms' },
  { id: 'ptc-tx-9', fundType: 'Classroom Consumable Grant', type: 'Expense', amount: 4300, date: '2026-03-05', productName: 'Hand Wash, Disinfectant, Dustbins & Classroom Cleaning Materials', receiptNo: 'REC-0679-CH', remarks: 'Hygiene and cleanliness materials for school health standards' },
];

export const INITIAL_OFFICE_DOCS: OfficeDocument[] = [
  { id: 'off-doc-1', title: 'KPK Free Textbook Distribution & Receiving Schedule 2026-27', urduTitle: 'خیبر پختونخوا مفت درسی کتب کی فراہمی و تقسیم شیڈول 2026-27', category: 'Notification', referenceNo: 'DEO/KHT/TXT/2026/894', date: '2026-03-20', issuingAuthority: 'Directorate of E&SE Khyber Pakhtunkhwa', fileFormat: 'PDF', fileName: 'Notification_Free_Textbooks_Distribution_KP_2026.pdf', fileSize: '1.4 MB', description: 'Official schedule and instructions for receiving free textbooks from Tehsil Kohat textbook depot.', uploadedAt: '2026-03-21T09:30:00Z', status: 'Active' },
  { id: 'off-doc-4', title: 'Office Order: Primary Annual Examination Duty Roster & Committees', urduTitle: 'دفتری حکم نامہ: سالانہ امتحانات نگرانی ڈیوٹی اور تصحیح کمیٹیاں', category: 'Order', referenceNo: 'GPS-CHB/ORD/2026/04', date: '2026-03-01', issuingAuthority: 'Headmaster GPS Chambai Kohat', fileFormat: 'Word', fileName: 'Exam_Supervision_Duty_Order_GPS_Chambai.docx', fileSize: '340 KB', description: 'Detailed allocation of examination rooms, paper invigilation, and marking committees for primary staff.', uploadedAt: '2026-03-02T08:00:00Z', status: 'Active' },
  { id: 'off-doc-7', title: 'Annual Primary School Census & Basic Facilities Performa (EMIS KP)', urduTitle: 'سالانہ پرائمری اسکول مردم شماری و بنیادی سہولیات پرفارما (ای ایم آئی ایس)', category: 'Performa', referenceNo: 'EMIS-KP/CENSUS/2026-P', date: '2026-01-15', issuingAuthority: 'Education Management Information System (EMIS) KP', fileFormat: 'Excel', fileName: 'Annual_Primary_School_Census_EMIS_GPS_Chambai.xlsx', fileSize: '520 KB', description: 'Comprehensive annual statistical performa covering enrollment, classrooms, drinking water, electricity, and teacher profiles.', uploadedAt: '2026-01-16T14:30:00Z', status: 'Active' },
];

export const INITIAL_BASIC_FACILITIES: BasicFacilities = {
  roomsCount: 6,
  toiletsCount: 3,
  hasWater: true,
  hasElectricity: true,
  hasSolarPlant: true,
  notes: '6 Classrooms with dual desks & fans; 3 Toilets with running tap water; 3.2 KW Hybrid Solar system with backup; Boundary wall intact.',
  lastUpdated: '2026-04-10',
};

export const KP_PRIMARY_SUBJECTS: KPTextbookSubject[] = [
  'Urdu',
  'English',
  'Mathematics',
  'Islamiat',
  'General Science',
  'General Knowledge',
  'Social Studies',
  'Pashto',
  'Nazra Quran',
  'Drawing',
];

export const INITIAL_BOOKS_DEMAND: BooksDemandItem[] = [
  // KG / Kachi
  { id: 'bd-kg-1', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'English', bookType: 'New', demanded: 42, received: 40, receivingDate: '2026-03-25', challanNo: 'KP-KHT-081', remarks: 'Shortage 2 copies' },
  { id: 'bd-kg-2', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'Mathematics', bookType: 'New', demanded: 42, received: 42, receivingDate: '2026-03-25', challanNo: 'KP-KHT-081', remarks: 'Complete' },
  { id: 'bd-kg-3', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'Urdu', bookType: 'New', demanded: 42, received: 42, receivingDate: '2026-03-25', challanNo: 'KP-KHT-081', remarks: 'Complete' },
  { id: 'bd-kg-4', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'Pashto', bookType: 'New', demanded: 42, received: 42, receivingDate: '2026-03-25', challanNo: 'KP-KHT-081', remarks: 'Complete' },
  { id: 'bd-kg-5', classId: 'c-kachi', className: 'KG / Kachi (ECE)', subject: 'Drawing', bookType: 'New', demanded: 42, received: 38, receivingDate: '2026-03-25', challanNo: 'KP-KHT-081', remarks: 'Shortage 4 copies' },

  // Class 1
  { id: 'bd-1-1', classId: 'c-1', className: 'Class 1', subject: 'English', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-2', classId: 'c-1', className: 'Class 1', subject: 'Mathematics', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-3', classId: 'c-1', className: 'Class 1', subject: 'Urdu', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-4', classId: 'c-1', className: 'Class 1', subject: 'Pashto', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-5', classId: 'c-1', className: 'Class 1', subject: 'General Knowledge', bookType: 'New', demanded: 35, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Shortage 2 copies' },
  { id: 'bd-1-6', classId: 'c-1', className: 'Class 1', subject: 'Islamiat', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-7', classId: 'c-1', className: 'Class 1', subject: 'Drawing', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Complete' },
  { id: 'bd-1-8', classId: 'c-1', className: 'Class 1', subject: 'Nazra Quran', bookType: 'New', demanded: 35, received: 35, receivingDate: '2026-03-25', challanNo: 'KP-KHT-082', remarks: 'Qaida supplied' },

  // Class 2
  { id: 'bd-2-1', classId: 'c-2', className: 'Class 2', subject: 'English', bookType: 'New', demanded: 30, received: 28, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Shortage 2 copies' },
  { id: 'bd-2-2', classId: 'c-2', className: 'Class 2', subject: 'Mathematics', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-3', classId: 'c-2', className: 'Class 2', subject: 'Urdu', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-4', classId: 'c-2', className: 'Class 2', subject: 'Pashto', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-5', classId: 'c-2', className: 'Class 2', subject: 'General Knowledge', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-6', classId: 'c-2', className: 'Class 2', subject: 'Islamiat', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-7', classId: 'c-2', className: 'Class 2', subject: 'Drawing', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Complete' },
  { id: 'bd-2-8', classId: 'c-2', className: 'Class 2', subject: 'Nazra Quran', bookType: 'New', demanded: 30, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-083', remarks: 'Amma Sipara' },

  // Class 3
  { id: 'bd-3-1', classId: 'c-3', className: 'Class 3', subject: 'English', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-2', classId: 'c-3', className: 'Class 3', subject: 'Mathematics', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-3', classId: 'c-3', className: 'Class 3', subject: 'Urdu', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-4', classId: 'c-3', className: 'Class 3', subject: 'Pashto', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-5', classId: 'c-3', className: 'Class 3', subject: 'General Knowledge', bookType: 'New', demanded: 32, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Shortage 2 copies' },
  { id: 'bd-3-6', classId: 'c-3', className: 'Class 3', subject: 'Islamiat', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-7', classId: 'c-3', className: 'Class 3', subject: 'Drawing', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },
  { id: 'bd-3-8', classId: 'c-3', className: 'Class 3', subject: 'Nazra Quran', bookType: 'New', demanded: 32, received: 32, receivingDate: '2026-03-25', challanNo: 'KP-KHT-084', remarks: 'Complete' },

  // Class 4
  { id: 'bd-4-1', classId: 'c-4', className: 'Class 4', subject: 'English', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-2', classId: 'c-4', className: 'Class 4', subject: 'Mathematics', bookType: 'New', demanded: 34, received: 31, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Shortage 3 copies' },
  { id: 'bd-4-3', classId: 'c-4', className: 'Class 4', subject: 'Urdu', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-4', classId: 'c-4', className: 'Class 4', subject: 'Pashto', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-5', classId: 'c-4', className: 'Class 4', subject: 'General Science', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-6', classId: 'c-4', className: 'Class 4', subject: 'Islamiat', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-7', classId: 'c-4', className: 'Class 4', subject: 'Drawing', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },
  { id: 'bd-4-8', classId: 'c-4', className: 'Class 4', subject: 'Nazra Quran', bookType: 'New', demanded: 34, received: 34, receivingDate: '2026-03-25', challanNo: 'KP-KHT-085', remarks: 'Complete' },

  // Class 5
  { id: 'bd-5-1', classId: 'c-5', className: 'Class 5', subject: 'English', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-2', classId: 'c-5', className: 'Class 5', subject: 'Mathematics', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-3', classId: 'c-5', className: 'Class 5', subject: 'Urdu', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-4', classId: 'c-5', className: 'Class 5', subject: 'Pashto', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-5', classId: 'c-5', className: 'Class 5', subject: 'General Science', bookType: 'New', demanded: 33, received: 30, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Shortage 3 copies' },
  { id: 'bd-5-6', classId: 'c-5', className: 'Class 5', subject: 'Islamiat', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-7', classId: 'c-5', className: 'Class 5', subject: 'Drawing', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
  { id: 'bd-5-8', classId: 'c-5', className: 'Class 5', subject: 'Nazra Quran', bookType: 'New', demanded: 33, received: 33, receivingDate: '2026-03-25', challanNo: 'KP-KHT-086', remarks: 'Complete' },
];

export const INITIAL_MONTHLY_ENROLMENT: MonthlyEnrolmentRow[] = [
  { monthIndex: 0, monthNameEn: 'April', monthNameUr: 'اپریل', totalEnrolment: 165, struckUp: 2, certificateIssued: 1, newAdmitted: 28, remarks: 'Spring enrollment campaign start' },
  { monthIndex: 1, monthNameEn: 'May', monthNameUr: 'مئی', totalEnrolment: 190, struckUp: 1, certificateIssued: 0, newAdmitted: 6, remarks: 'Admissions continued' },
  { monthIndex: 2, monthNameEn: 'June', monthNameUr: 'جون', totalEnrolment: 195, struckUp: 0, certificateIssued: 0, newAdmitted: 2, remarks: 'Summer break commencement' },
  { monthIndex: 3, monthNameEn: 'July', monthNameUr: 'جولائی', totalEnrolment: 197, struckUp: 0, certificateIssued: 0, newAdmitted: 0, remarks: 'Summer holidays' },
  { monthIndex: 4, monthNameEn: 'August', monthNameUr: 'اگست', totalEnrolment: 197, struckUp: 3, certificateIssued: 2, newAdmitted: 8, remarks: 'School reopening drive' },
  { monthIndex: 5, monthNameEn: 'September', monthNameUr: 'ستمبر', totalEnrolment: 200, struckUp: 2, certificateIssued: 1, newAdmitted: 5, remarks: 'Regular classes' },
  { monthIndex: 6, monthNameEn: 'October', monthNameUr: 'اکتوبر', totalEnrolment: 202, struckUp: 1, certificateIssued: 0, newAdmitted: 3, remarks: 'Mid-term preparation' },
  { monthIndex: 7, monthNameEn: 'November', monthNameUr: 'نومبر', totalEnrolment: 204, struckUp: 2, certificateIssued: 1, newAdmitted: 2, remarks: 'Winter uniforms distribution' },
  { monthIndex: 8, monthNameEn: 'December', monthNameUr: 'دسمبر', totalEnrolment: 203, struckUp: 0, certificateIssued: 0, newAdmitted: 1, remarks: 'Winter recess' },
  { monthIndex: 9, monthNameEn: 'January', monthNameUr: 'جنوری', totalEnrolment: 204, struckUp: 1, certificateIssued: 1, newAdmitted: 3, remarks: 'School reopening' },
  { monthIndex: 10, monthNameEn: 'February', monthNameUr: 'فروری', totalEnrolment: 205, struckUp: 0, certificateIssued: 0, newAdmitted: 2, remarks: 'Pre-exam assessment' },
  { monthIndex: 11, monthNameEn: 'March', monthNameUr: 'مارچ', totalEnrolment: 207, struckUp: 2, certificateIssued: 4, newAdmitted: 0, remarks: 'Final exams & 5th grade SLC' },
  { monthIndex: 12, monthNameEn: 'Annual Total', monthNameUr: 'سالانہ کل میزان', totalEnrolment: 207, struckUp: 14, certificateIssued: 10, newAdmitted: 60, remarks: '13-Row Official Register Summary' },
];

export const INITIAL_CLASS_ENROLMENT: ClassEnrolmentBreakdown[] = [
  { classId: 'c-kachi', className: 'KG / Kachi (ECE)', urduName: 'کچی', fresh: 38, govtSchool: 0, privateSchool: 4, dropout: 2, totalEnrolment: 40 },
  { classId: 'c-1', className: 'Class 1', urduName: 'اول', fresh: 22, govtSchool: 5, privateSchool: 8, dropout: 1, totalEnrolment: 34 },
  { classId: 'c-2', className: 'Class 2', urduName: 'دوم', fresh: 18, govtSchool: 6, privateSchool: 5, dropout: 2, totalEnrolment: 27 },
  { classId: 'c-3', className: 'Class 3', urduName: 'سوم', fresh: 20, govtSchool: 4, privateSchool: 6, dropout: 1, totalEnrolment: 29 },
  { classId: 'c-4', className: 'Class 4', urduName: 'چہارم', fresh: 21, govtSchool: 5, privateSchool: 7, dropout: 3, totalEnrolment: 30 },
  { classId: 'c-5', className: 'Class 5', urduName: 'پنجم', fresh: 25, govtSchool: 4, privateSchool: 4, dropout: 2, totalEnrolment: 31 },
];

export const INITIAL_DAILY_ENROLMENT: DailyEnrolmentEntry[] = [
  { id: 'den-1', date: '2026-04-12', classId: 'c-kachi', className: 'KG / Kachi (ECE)', dropoutCount: 0, govtSchoolCount: 0, privateSchoolCount: 1, freshCount: 5, totalEnrolment: 40, remarks: 'ECE Welcome day admissions', createdAt: '2026-04-12T10:00:00Z' },
  { id: 'den-2', date: '2026-04-14', classId: 'c-1', className: 'Class 1', dropoutCount: 0, govtSchoolCount: 2, privateSchoolCount: 1, freshCount: 3, totalEnrolment: 34, remarks: 'Transfers from neighboring village', createdAt: '2026-04-14T11:30:00Z' },
  { id: 'den-3', date: '2026-04-15', classId: 'c-4', className: 'Class 4', dropoutCount: 1, govtSchoolCount: 1, privateSchoolCount: 0, freshCount: 0, totalEnrolment: 30, remarks: 'One family migrated to Kohat Cantt', createdAt: '2026-04-15T09:15:00Z' },
];

export const INITIAL_CERTIFICATES: CertificateIssueRecord[] = [
  {
    id: 'cert-1',
    studentId: 's-101',
    studentName: 'Muhammad Bilal Khan',
    fatherName: 'Tariq Khan',
    admissionNo: 'GPS-2026-001',
    rollNo: '01',
    classId: 'c-5',
    className: 'Class 5',
    dob: '2016-04-12',
    admissionDate: '2026-01-15',
    certificateIssue: 'Yes',
    certificateType: 'Original',
    classStatus: 'Promoted',
    withdrawalDate: '2026-03-31',
    issueDate: '2026-04-02',
    remarks: 'Completed Primary Education with Grade A+. Exemplary moral character.',
    createdAt: '2026-04-02',
  },
];

export const INITIAL_STRUCK_OFF: StruckOffRecord[] = [
  {
    id: 'so-1',
    studentId: 's-106',
    studentName: 'Usman Ali',
    fatherName: 'Asad Ullah',
    admissionNo: 'GPS-2026-006',
    rollNo: '01',
    classId: 'c-1',
    className: 'Class 1',
    struckOffDate: '2026-09-15',
    remarks: 'Continuous unexcused absence for 15 days due to temporary family relocation.',
    isRestored: false,
    createdAt: '2026-09-15',
  },
];

export const INITIAL_EXAM_PAPERS: SemesterExamPaper[] = [
  {
    id: 'exam-1st-c5-eng',
    semester: '1st Semester',
    classId: 'c-5',
    className: 'Class 5',
    subject: 'English',
    studentNamePlaceholder: '',
    examDate: '2026-11-10',
    timeAllowed: '2 Hours',
    instructions: 'Attempt all questions neatly. Marks are indicated against each question.',
    languageMode: 'en',
    totalMarks: 50,
    updatedAt: '2026-11-01',
    questions: [
      { id: 'q1', questionNumber: 1, category: 'Words and Meanings', text: 'Write meanings of the following words in Urdu: (1) Honest (2) Homeland (3) Courage (4) Environment (5) Respect', marks: 10 },
      { id: 'q2', questionNumber: 2, category: 'Singular and Plural', text: 'Write the plural forms of: Tooth, Child, Leaf, City, Box', marks: 5 },
      { id: 'q3', questionNumber: 3, category: 'Antonyms', text: 'Write opposites (antonyms) of: Bright, Early, Brave, Clean, Heavy', marks: 5 },
      { id: 'q4', questionNumber: 4, category: 'Short Questions', text: 'Answer the following short questions:\n(a) Why do we celebrate Independence Day on 14th August?\n(b) How do trees help keep our village air clean?', marks: 10 },
      { id: 'q5', questionNumber: 5, category: 'Application Writing', text: 'Write an application to the Headmaster of GPS Chambai Kohat for two days sick leave.', marks: 10 },
      { id: 'q6', questionNumber: 6, category: 'Essay Writing', text: 'Write a short paragraph of 8 lines on "My Best Teacher" or "My School GPS Chambai".', marks: 10 },
    ],
  },
  {
    id: 'exam-2nd-c5-urdu',
    semester: '2nd Semester',
    classId: 'c-5',
    className: 'Class 5',
    subject: 'Urdu',
    studentNamePlaceholder: '',
    examDate: '2027-03-15',
    timeAllowed: '2 Hours',
    instructions: 'تمام سوالات حل کریں۔ خوشخطی کے خاص نمبر دیے جائیں گے۔',
    languageMode: 'ur',
    totalMarks: 50,
    updatedAt: '2026-11-01',
    questions: [
      { id: 'q2-1', questionNumber: 1, category: 'Words and Meanings', text: 'درج ذیل الفاظ کے معنی لکھیں: محنت، وطن، ایثار، ماحول، ادب', marks: 10 },
      { id: 'q2-2', questionNumber: 2, category: 'Singular and Plural', text: 'واحد کے جمع لکھیں: کتاب، مسجد، طالب علم، درخت، پھول', marks: 5 },
      { id: 'q2-3', questionNumber: 3, category: 'Masculine and Feminine', text: 'مذکر کے مونث لکھیں: استاد، والد، بادشاہ، شیر، بھائی', marks: 5 },
      { id: 'q2-4', questionNumber: 4, category: 'Short Questions', text: 'مختصر جوابات تحریر کریں: (الف) حمد کسے کہتے ہیں؟ (ب) صفائی نصف ایمان کیوں ہے؟', marks: 10 },
      { id: 'q2-5', questionNumber: 5, category: 'Story Writing', text: 'کہانی لکھیں: "اتفاق میں برکت ہے" یا "پیاسا کوا"', marks: 10 },
      { id: 'q2-6', questionNumber: 6, category: 'Essay Writing', text: 'مضمون لکھیں: "میرا پیارا وطن پاکستان"', marks: 10 },
    ],
  },
];

export const INITIAL_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif-1',
    title: 'QR Attendance Scanner Ready',
    message: 'Students can be marked Present instantly using the QR Scanner on the Home Screen.',
    category: 'attendance',
    date: '2026-11-02',
    isRead: false,
    targetScreen: 'other_qr_scanner',
  },
  {
    id: 'notif-2',
    title: 'KP Textbook Shortage Alert',
    message: '8 textbook copies are pending in consignment KP-KHT-081 to KP-KHT-086.',
    category: 'books',
    date: '2026-11-02',
    isRead: false,
    targetScreen: 'books',
  },
  {
    id: 'notif-3',
    title: 'PTC Available Balance Updated',
    message: 'Current PTC Available Balance is Rs. 97,500 across Capitation, Petty Repair, and Consumable grants.',
    category: 'finance',
    date: '2026-11-01',
    isRead: false,
    targetScreen: 'ptc_fund',
  },
  {
    id: 'notif-4',
    title: '1st & 2nd Semester Exam Generator',
    message: 'Exam papers for all 6 classes are ready for PDF, DOCX, and JPG export.',
    category: 'exam',
    date: '2026-11-01',
    isRead: true,
    targetScreen: 'other_exam_1',
  },
  {
    id: 'notif-5',
    title: 'Order Book: Annual School Inspection & Tree Plantation',
    message: 'All teaching staff to ensure updated daily diaries, attendance registers, and textbook records for District Education Officer inspection.',
    category: 'Order Book',
    date: '2026-11-03',
    isRead: false,
    targetScreen: 'notifications',
  },
  {
    id: 'notif-6',
    title: 'PTC Council Meeting Notice: Capitation & Repair Grants',
    message: 'General PTC council meeting on Saturday 10:00 AM at Staff Room. Discussion on Capitation Grant and petty school repairs.',
    category: 'PTC Meeting',
    date: '2026-11-03',
    isRead: false,
    targetScreen: 'ptc_fund',
  },
];

export const INITIAL_DAILY_DIARIES: StudentDailyDiaryItem[] = [
  {
    id: 'diary-1',
    classId: 'c-5',
    className: 'Class 5',
    date: '2026-11-03',
    subject: 'Mathematics',
    classworkActivity: 'تدریس باب نمبر 3: کسر کا بنیادی تصور اور ہم مخرج کسور کو جمع کرنا۔ بورڈ پر عملی مشق۔',
    homeworkTask: 'مشق نمبر 3.1 کے سوال نمبر 1 تا 6 کاپی پر حل کریں اور جدول یاد کریں۔',
    dueDate: '2026-11-04',
    teacherName: 'Muhammad Irfan',
    specialInstructions: 'والدین سے گزارش ہے کہ بچے کا ریاضی کا کام چیک فرما کر دستخط کریں۔',
    urgentNotice: false,
    parentNotified: true,
    createdAt: '2026-11-03T08:30:00.000Z',
  },
  {
    id: 'diary-2',
    classId: 'c-5',
    className: 'Class 5',
    date: '2026-11-03',
    subject: 'English',
    classworkActivity: 'Unit 4: Reading and comprehension of "Our Environment". Vocabulary explanation.',
    homeworkTask: 'Learn meanings of 5 new words and write 3 sentences using them in English notebook.',
    dueDate: '2026-11-04',
    teacherName: 'Sir Tariq Mehmood',
    specialInstructions: 'Bring Oxford Dictionary or KP Textbook tomorrow.',
    urgentNotice: false,
    parentNotified: true,
    createdAt: '2026-11-03T09:15:00.000Z',
  },
  {
    id: 'diary-3',
    classId: 'c-4',
    className: 'Class 4',
    date: '2026-11-03',
    subject: 'Urdu',
    classworkActivity: 'سبق نمبر 6 "ہمدردی": بلند خوانی اور اشعار کا مفہوم سمجھایا گیا۔ املاء کے مشکل الفاظ۔',
    homeworkTask: 'صفحہ 28 پر دیے گئے سوالات کے جوابات کاپی پر خوشخط لکھیں۔',
    dueDate: '2026-11-04',
    teacherName: 'Sir Rashid Khan',
    specialInstructions: 'اردو خوشخطی پر خصوصی توجہ دی جائے۔',
    urgentNotice: false,
    parentNotified: false,
    createdAt: '2026-11-03T10:00:00.000Z',
  },
  {
    id: 'diary-4',
    classId: 'c-3',
    className: 'Class 3',
    date: '2026-11-03',
    subject: 'General Knowledge',
    classworkActivity: 'باب نمبر 2: پودے اور ان کے حصے (جڑ، تنے، پتے، پھول)۔ چارٹ کے ذریعے وضاحت۔',
    homeworkTask: 'کاپی پر پودے کی تصویر بنائیں اور اہم حصوں کے نام تحریر کریں۔',
    dueDate: '2026-11-04',
    teacherName: 'Muhammad Irfan',
    specialInstructions: 'کل تمام طلبہ ڈرائنگ کے رنگ ہمراہ لائیں۔',
    urgentNotice: false,
    parentNotified: true,
    createdAt: '2026-11-03T10:45:00.000Z',
  },
  {
    id: 'diary-5',
    classId: 'c-1',
    className: 'Class 1',
    date: '2026-11-03',
    subject: 'Mathematics',
    classworkActivity: 'گنتی 1 تا 50 زبانی دہرائی اور تختہ تحریر پر عدد کی پہچان۔',
    homeworkTask: 'ہندسوں میں گنتی 20 تا 40 ایک صفحہ کاپی پر لکھیں۔',
    dueDate: '2026-11-04',
    teacherName: 'Sir Qari Abdul Quddus',
    specialInstructions: 'بچے کو روزانہ زبانی گنتی ضرور سنیں۔',
    urgentNotice: false,
    parentNotified: false,
    createdAt: '2026-11-03T11:30:00.000Z',
  },
];


// Helper functions for reading and writing to LocalStorage
export function getStoredData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.warn(`Error reading localStorage key ${key}:`, error);
    return defaultValue;
  }
}

export function setStoredData<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving localStorage key ${key}:`, error);
  }
}

export const StorageService = {
  // Safe non-destructive initialization & migration
  initStorage() {
    // 1. Classes migration: ensure the 6 official classes with exact Image 004 HEX colors exist
    const existingClasses = getStoredData<SchoolClass[] | null>(STORAGE_KEYS.CLASSES, null);
    if (!existingClasses) {
      setStoredData(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    } else {
      // Remove legacy c-nursery if empty, and ensure all 6 official classes have exact hex colors & names
      const updatedClasses = INITIAL_CLASSES.map((initCls) => {
        const match = existingClasses.find((c) => c.id === initCls.id);
        return match
          ? { ...match, name: initCls.name, hexColor: initCls.hexColor, urduName: match.urduName || initCls.urduName }
          : initCls;
      });
      setStoredData(STORAGE_KEYS.CLASSES, updatedClasses);
    }

    if (!localStorage.getItem(STORAGE_KEYS.BOOKS)) {
      setStoredData(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.OLD_BOOKS)) {
      setStoredData(STORAGE_KEYS.OLD_BOOKS, INITIAL_OLD_BOOKS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.KP_SUBJECTS)) {
      setStoredData(STORAGE_KEYS.KP_SUBJECTS, generateInitialKpOfficialSubjects());
    }
    if (!localStorage.getItem(STORAGE_KEYS.VIDEOS)) {
      setStoredData(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    }

    // Migrate students safely to add rollNo and admissionCategory if missing
    const existingStudents = getStoredData<Student[] | null>(STORAGE_KEYS.STUDENTS, null);
    if (!existingStudents) {
      setStoredData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    } else {
      const migratedStudents = existingStudents.map((st, idx) => ({
        ...st,
        classId: st.classId === 'c-nursery' ? 'c-kachi' : st.classId,
        rollNo: st.rollNo || String(idx + 1).padStart(2, '0'),
        admissionCategory: st.admissionCategory || 'F',
        status: st.status || 'Active',
      }));
      setStoredData(STORAGE_KEYS.STUDENTS, migratedStudents);
    }

    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      setStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RESULTS)) {
      setStoredData(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LESSON_PLANS)) {
      setStoredData(STORAGE_KEYS.LESSON_PLANS, INITIAL_LESSON_PLANS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIMETABLE)) {
      setStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIMETABLE_GRID)) {
      const initialGrids: Record<string, TimetableGridRow[]> = {};
      OFFICIAL_SIX_CLASSES.forEach((c) => {
        initialGrids[c.id] = generateDefaultTimetableGridForClass(c.id);
      });
      setStoredData(STORAGE_KEYS.TIMETABLE_GRID, initialGrids);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      setStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.LANGUAGE)) {
      setStoredData(STORAGE_KEYS.LANGUAGE, 'en');
    }

    // Migrate staff safely to ensure staffCategory exists
    const existingStaff = getStoredData<StaffMember[] | null>(STORAGE_KEYS.STAFF, null);
    if (!existingStaff) {
      setStoredData(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    } else {
      const migratedStaff = existingStaff.map((member) => {
        let cat = member.staffCategory;
        if (!cat) {
          const des = member.designation.toLowerCase();
          if (des.includes('head') || des.includes('psht') || des.includes('principal')) cat = 'Head Teacher';
          else if (des.includes('chowkidar') || des.includes('guard') || des.includes('security')) cat = 'Chowkidar';
          else if (des.includes('focal') || des.includes('spst')) cat = 'Focal Person';
          else cat = 'Other';
        }
        return { ...member, staffCategory: cat };
      });
      setStoredData(STORAGE_KEYS.STAFF, migratedStaff);
    }

    if (!localStorage.getItem(STORAGE_KEYS.GALLERY)) {
      setStoredData(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PTC_INFO)) {
      setStoredData(STORAGE_KEYS.PTC_INFO, INITIAL_PTC_INFO);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PTC_MEMBERS)) {
      setStoredData(STORAGE_KEYS.PTC_MEMBERS, INITIAL_PTC_MEMBERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PTC_TRANSACTIONS)) {
      setStoredData(STORAGE_KEYS.PTC_TRANSACTIONS, INITIAL_PTC_TRANSACTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.OFFICE_DOCS)) {
      setStoredData(STORAGE_KEYS.OFFICE_DOCS, INITIAL_OFFICE_DOCS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BOOKS_DEMAND)) {
      setStoredData(STORAGE_KEYS.BOOKS_DEMAND, INITIAL_BOOKS_DEMAND);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BASIC_FACILITIES)) {
      setStoredData(STORAGE_KEYS.BASIC_FACILITIES, INITIAL_BASIC_FACILITIES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DAILY_ENROLMENT)) {
      setStoredData(STORAGE_KEYS.DAILY_ENROLMENT, INITIAL_DAILY_ENROLMENT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MONTHLY_ENROLMENT)) {
      setStoredData(STORAGE_KEYS.MONTHLY_ENROLMENT, INITIAL_MONTHLY_ENROLMENT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CLASS_ENROLMENT)) {
      setStoredData(STORAGE_KEYS.CLASS_ENROLMENT, INITIAL_CLASS_ENROLMENT);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CERTIFICATES)) {
      setStoredData(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STRUCK_OFF)) {
      setStoredData(STORAGE_KEYS.STRUCK_OFF, INITIAL_STRUCK_OFF);
    }
    if (!localStorage.getItem(STORAGE_KEYS.EXAM_PAPERS)) {
      setStoredData(STORAGE_KEYS.EXAM_PAPERS, INITIAL_EXAM_PAPERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOMIZATION)) {
      setStoredData(STORAGE_KEYS.CUSTOMIZATION, DEFAULT_CUSTOMIZATION);
    }
    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      setStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    }
  },

  // Classes CRUD
  getClasses(): SchoolClass[] {
    const raw = getStoredData(STORAGE_KEYS.CLASSES, INITIAL_CLASSES);
    return raw.filter((c) => c.id !== 'c-nursery');
  },
  saveClass(schoolClass: SchoolClass): void {
    const list = this.getClasses();
    const index = list.findIndex((c) => c.id === schoolClass.id);
    if (index >= 0) {
      list[index] = schoolClass;
    } else {
      list.push(schoolClass);
    }
    setStoredData(STORAGE_KEYS.CLASSES, list);
  },
  deleteClass(id: string): void {
    const list = this.getClasses().filter((c) => c.id !== id);
    setStoredData(STORAGE_KEYS.CLASSES, list);
  },

  // Books & Guides CRUD
  getBooks(): Book[] {
    const raw = getStoredData(STORAGE_KEYS.BOOKS, INITIAL_BOOKS);
    return raw.map((b) => ({
      ...b,
      className: b.className || b.classId,
      pages: b.pages || 96,
      fileUrl: b.fileUrl || b.pdfDataUrl || '',
    }));
  },
  saveBook(book: Book): void {
    const list = this.getBooks();
    const index = list.findIndex((b) => b.id === book.id);
    if (index >= 0) {
      list[index] = book;
    } else {
      list.unshift(book);
    }
    setStoredData(STORAGE_KEYS.BOOKS, list);
  },
  deleteBook(id: string): void {
    const list = this.getBooks().filter((b) => b.id !== id);
    setStoredData(STORAGE_KEYS.BOOKS, list);
  },

  // Available Old Books CRUD
  getOldBooks(): OldBookStockItem[] {
    const raw = getStoredData(STORAGE_KEYS.OLD_BOOKS, INITIAL_OLD_BOOKS);
    return raw.map((b) => ({
      ...b,
      condition: (b.condition === 'Fair' || b.condition === 'Usable' ? b.condition : 'Good') as 'Good' | 'Fair' | 'Usable',
      conditionNote: b.conditionNote || b.condition || 'Good',
      remarks: b.remarks || b.conditionNote || 'Reusable stock',
      quantity: b.quantity ?? b.availableQty ?? 0,
      availableQty: b.availableQty ?? b.quantity ?? 0,
    }));
  },
  saveOldBook(item: OldBookStockItem): void {
    const list = this.getOldBooks();
    const index = list.findIndex((b) => b.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    setStoredData(STORAGE_KEYS.OLD_BOOKS, list);
  },
  deleteOldBook(id: string): void {
    const list = this.getOldBooks().filter((b) => b.id !== id);
    setStoredData(STORAGE_KEYS.OLD_BOOKS, list);
  },

  // KP Official Subjects CRUD
  getKpOfficialSubjects(): KpOfficialSubjectRecord[] {
    const raw = getStoredData(STORAGE_KEYS.KP_SUBJECTS, generateInitialKpOfficialSubjects());
    return raw.map((r) => ({
      ...r,
      classLabel: r.classLabel || r.className || 'Class 1',
      subjectLabel: r.subjectLabel || r.subject || 'Urdu',
      className: r.className || r.classLabel || 'Class 1',
      subject: r.subject || r.subjectLabel || 'Urdu',
    }));
  },
  saveKpOfficialSubject(record: KpOfficialSubjectRecord): void {
    const list = this.getKpOfficialSubjects();
    const index = list.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    setStoredData(STORAGE_KEYS.KP_SUBJECTS, list);
  },
  deleteKpOfficialSubject(id: string): void {
    const list = this.getKpOfficialSubjects().filter((r) => r.id !== id);
    setStoredData(STORAGE_KEYS.KP_SUBJECTS, list);
  },

  // Videos CRUD
  getVideos(): VideoItem[] {
    const raw = getStoredData(STORAGE_KEYS.VIDEOS, INITIAL_VIDEOS);
    return raw.map((v) => ({
      ...v,
      className: v.className || v.classId || 'Primary',
      duration: v.duration || '12:45',
      videoUrl: v.videoUrl || v.videoDataUrl || v.youtubeUrl || '',
    }));
  },
  saveVideo(video: VideoItem): void {
    const list = this.getVideos();
    const index = list.findIndex((v) => v.id === video.id);
    if (index >= 0) {
      list[index] = video;
    } else {
      list.unshift(video);
    }
    setStoredData(STORAGE_KEYS.VIDEOS, list);
  },
  deleteVideo(id: string): void {
    const list = this.getVideos().filter((v) => v.id !== id);
    setStoredData(STORAGE_KEYS.VIDEOS, list);
  },

  // Students & Admission CRUD
  getStudents(): Student[] {
    const raw = getStoredData(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    return raw.map((st, idx) => ({
      ...st,
      rollNo: st.rollNo || String(idx + 1).padStart(2, '0'),
      admissionCategory: st.admissionCategory || 'F',
      fatherCnic: st.fatherCnic || st.bFormNo || '14301-0000000-1',
      contactNo: st.contactNo || st.mobileNo || '0333-0000000',
      mobileNo: st.mobileNo || st.contactNo || '0333-0000000',
      address: st.address || 'Village Chambai, Tehsil & District Kohat',
      photoUrl: st.photoUrl || st.avatarUrl || '',
      avatarUrl: st.avatarUrl || st.photoUrl || '',
      qrToken: st.qrToken || `GPS-CHAMBAI|${st.id}|${st.admissionNo}|${st.name}`,
    }));
  },
  saveStudent(student: Student): void {
    const list = this.getStudents();
    const index = list.findIndex((s) => s.id === student.id);
    if (index >= 0) {
      list[index] = student;
    } else {
      list.unshift(student);
    }
    setStoredData(STORAGE_KEYS.STUDENTS, list);
  },
  saveStudents(students: Student[]): void {
    setStoredData(STORAGE_KEYS.STUDENTS, students);
  },
  deleteStudent(id: string): void {
    const list = this.getStudents().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.STUDENTS, list);
  },
  generateNextAdmissionNo(): string {
    const list = this.getStudents();
    const year = new Date().getFullYear();
    const count = list.length + 1;
    const padded = String(count).padStart(3, '0');
    return `GPS-${year}-${padded}`;
  },
  generateNextRollNo(classId: string): string {
    const classStudents = this.getStudents().filter((s) => s.classId === classId);
    return String(classStudents.length + 1).padStart(2, '0');
  },

  // Attendance CRUD
  getAttendance(): AttendanceRecord[] {
    const raw = getStoredData(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
    return raw.map((a) => ({
      ...a,
      records:
        a.records ||
        (a.studentId
          ? { [a.studentId]: a.status === 'Present' ? 'P' : a.status === 'Leave' ? 'L' : 'A' }
          : {}),
    }));
  },
  saveAttendanceRecord(record: AttendanceRecord): void {
    const list = this.getAttendance();
    const index = list.findIndex(
      (a) =>
        (record.studentId && a.studentId === record.studentId && a.date === record.date) ||
        (!record.studentId && a.classId === record.classId && a.date === record.date && !!a.records)
    );
    if (index >= 0) {
      list[index] = record;
    } else {
      list.push(record);
    }
    setStoredData(STORAGE_KEYS.ATTENDANCE, list);
  },
  saveBatchAttendance(records: AttendanceRecord[]): void {
    const list = this.getAttendance();
    records.forEach((newRec) => {
      const idx = list.findIndex((a) => a.studentId === newRec.studentId && a.date === newRec.date);
      if (idx >= 0) {
        list[idx] = newRec;
      } else {
        list.push(newRec);
      }
    });
    setStoredData(STORAGE_KEYS.ATTENDANCE, list);
  },

  // Exam Results CRUD
  getResults(): ExamResult[] {
    const raw = getStoredData(STORAGE_KEYS.RESULTS, INITIAL_RESULTS);
    const students = this.getStudents();
    return raw.map((r, idx) => {
      const st = students.find((s) => s.id === r.studentId);
      const rawSubs = r.subjects && r.subjects.length > 0 ? r.subjects : r.subjectMarks || [];
      const subjects = rawSubs.map((sm: any) => {
        const name = sm.subjectName || sm.subject || 'Subject';
        const tot = Number(sm.totalMarks ?? sm.maxMarks ?? sm.total ?? 100);
        const obt = Number(sm.obtainedMarks ?? sm.obtained ?? 0);
        return {
          subjectName: name,
          subject: name,
          totalMarks: tot,
          total: tot,
          obtainedMarks: obt,
          obtained: obt,
        };
      });
      const subjectMarks = subjects.map((s) => ({
        subject: s.subjectName,
        subjectName: s.subjectName,
        maxMarks: s.totalMarks,
        totalMarks: s.totalMarks,
        obtainedMarks: s.obtainedMarks,
      }));
      return {
        ...r,
        studentName: r.studentName || st?.name || 'Registered Student',
        fatherName: r.fatherName || st?.fatherName || '—',
        rollNo: r.rollNo || st?.rollNo || String(idx + 1).padStart(2, '0'),
        examTerm: r.examTerm || r.examName || '1st Semester',
        examName: r.examName || r.examTerm || '1st Semester',
        academicYear: r.academicYear || '2025-26',
        subjects,
        subjectMarks,
        totalMarks: r.totalMarks ?? r.totalMaxMarks ?? 500,
        totalMaxMarks: r.totalMaxMarks ?? r.totalMarks ?? 500,
        obtainedMarks: r.obtainedMarks ?? r.totalObtainedMarks ?? 0,
        totalObtainedMarks: r.totalObtainedMarks ?? r.obtainedMarks ?? 0,
        positionInClass: String(r.positionInClass || `${idx + 1}st`),
      };
    });
  },
  saveResult(result: ExamResult): void {
    const list = this.getResults();
    const index = list.findIndex((r) => r.id === result.id);
    if (index >= 0) {
      list[index] = result;
    } else {
      list.unshift(result);
    }
    setStoredData(STORAGE_KEYS.RESULTS, list);
  },
  deleteResult(id: string): void {
    const list = this.getResults().filter((r) => r.id !== id);
    setStoredData(STORAGE_KEYS.RESULTS, list);
  },

  // Lesson Plans CRUD
  getLessonPlans(): LessonPlan[] {
    const raw = getStoredData(STORAGE_KEYS.LESSON_PLANS, INITIAL_LESSON_PLANS);
    return raw.map((p, idx) => ({
      ...p,
      className: p.className || p.classId || 'Class 3',
      week: p.week || `Week ${idx + 1}`,
      slo: p.slo || p.learningObjectives || '',
      learningObjectives: p.learningObjectives || p.slo || '',
    }));
  },
  saveLessonPlan(plan: LessonPlan): void {
    const list = this.getLessonPlans();
    const index = list.findIndex((p) => p.id === plan.id);
    if (index >= 0) {
      list[index] = plan;
    } else {
      list.unshift(plan);
    }
    setStoredData(STORAGE_KEYS.LESSON_PLANS, list);
  },
  deleteLessonPlan(id: string): void {
    const list = this.getLessonPlans().filter((p) => p.id !== id);
    setStoredData(STORAGE_KEYS.LESSON_PLANS, list);
  },

  // Timetable Slots & 7-Period Matrix Grid CRUD
  getTimetable(): TimetableSlot[] {
    return getStoredData(STORAGE_KEYS.TIMETABLE, INITIAL_TIMETABLE);
  },
  saveTimetableSlot(slot: TimetableSlot): void {
    const list = this.getTimetable();
    const index = list.findIndex((s) => s.id === slot.id);
    if (index >= 0) {
      list[index] = slot;
    } else {
      list.push(slot);
    }
    setStoredData(STORAGE_KEYS.TIMETABLE, list);
  },
  deleteTimetableSlot(id: string): void {
    const list = this.getTimetable().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.TIMETABLE, list);
  },
  getTimetableGridForClass(classId: string): TimetableGridRow[] {
    const allGrids = getStoredData<Record<string, TimetableGridRow[]>>(STORAGE_KEYS.TIMETABLE_GRID, {});
    if (!allGrids[classId] || !Array.isArray(allGrids[classId]) || allGrids[classId].length < 7) {
      allGrids[classId] = generateDefaultTimetableGridForClass(classId);
      setStoredData(STORAGE_KEYS.TIMETABLE_GRID, allGrids);
    }
    return allGrids[classId].map((row) => {
      const p1 = row.period1 ?? row.periods?.[1] ?? 'Urdu';
      const p2 = row.period2 ?? row.periods?.[2] ?? 'English';
      const p3 = row.period3 ?? row.periods?.[3] ?? 'Mathematics';
      const p4 = row.period4 ?? row.periods?.[4] ?? 'General Science';
      const p5 = row.period5 ?? row.periods?.[5] ?? 'Islamiat';
      const p6 = row.period6 ?? row.periods?.[6] ?? 'Pashto';
      const p7 = row.period7 ?? row.periods?.[7] ?? 'Nazra Quran';
      return {
        ...row,
        period1: p1,
        period2: p2,
        period3: p3,
        period4: p4,
        period5: p5,
        period6: p6,
        period7: p7,
        periods: { 1: p1, 2: p2, 3: p3, 4: p4, 5: p5, 6: p6, 7: p7 },
      };
    });
  },
  saveTimetableGridForClass(classId: string, rows: TimetableGridRow[]): void {
    const allGrids = getStoredData<Record<string, TimetableGridRow[]>>(STORAGE_KEYS.TIMETABLE_GRID, {});
    allGrids[classId] = rows;
    setStoredData(STORAGE_KEYS.TIMETABLE_GRID, allGrids);
  },

  // Settings
  getSettings(): SchoolSettings {
    return getStoredData(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: SchoolSettings): void {
    setStoredData(STORAGE_KEYS.SETTINGS, settings);
  },

  // Staff Directory CRUD
  getStaff(): StaffMember[] {
    const raw = getStoredData(STORAGE_KEYS.STAFF, INITIAL_STAFF);
    return raw.map((s) => ({
      ...s,
      fatherName: s.fatherName || 'Haji Abdul Kareem',
      bps: Number(s.bps) || (s.designation === 'PSHT' ? 16 : s.designation === 'SPST' ? 15 : s.designation === 'Chowkidar' ? 3 : 14),
      classTeacherOf: s.classTeacherOf || s.assignedClasses?.[0] || 'Class 5',
      contactNo: s.contactNo || s.phone || '0333-0000000',
      phone: s.phone || s.contactNo || '0333-0000000',
      photoUrl: s.photoUrl || '',
    }));
  },
  saveStaff(member: StaffMember): void {
    const list = this.getStaff();
    const index = list.findIndex((s) => s.id === member.id);
    if (index >= 0) {
      list[index] = member;
    } else {
      list.unshift(member);
    }
    setStoredData(STORAGE_KEYS.STAFF, list);
  },
  deleteStaff(id: string): void {
    const list = this.getStaff().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.STAFF, list);
  },

  // Gallery CRUD
  getGallery(): GalleryItem[] {
    return getStoredData(STORAGE_KEYS.GALLERY, INITIAL_GALLERY);
  },
  saveGalleryItem(item: GalleryItem): void {
    const list = this.getGallery();
    const index = list.findIndex((g) => g.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    setStoredData(STORAGE_KEYS.GALLERY, list);
  },
  deleteGalleryItem(id: string): void {
    const list = this.getGallery().filter((g) => g.id !== id);
    setStoredData(STORAGE_KEYS.GALLERY, list);
  },

  // PTC Council & Fund
  getPtcInfo(): PtcCouncilInfo {
    return getStoredData(STORAGE_KEYS.PTC_INFO, INITIAL_PTC_INFO);
  },
  savePtcInfo(info: PtcCouncilInfo): void {
    setStoredData(STORAGE_KEYS.PTC_INFO, info);
  },
  savePtcBankDetails(bankDetails: PtcBankDetails): void {
    const current = this.getPtcInfo();
    current.bankDetails = bankDetails;
    this.savePtcInfo(current);
  },
  togglePtcEstablished(isEstablished?: boolean): boolean {
    const current = this.getPtcInfo();
    current.isEstablished = isEstablished !== undefined ? isEstablished : !current.isEstablished;
    this.savePtcInfo(current);
    return current.isEstablished;
  },

  // PTC Members
  getPtcMembers(): PtcMember[] {
    const raw = getStoredData(STORAGE_KEYS.PTC_MEMBERS, INITIAL_PTC_MEMBERS);
    return raw.map((m) => ({
      ...m,
      role: m.role || m.designation || 'Member',
      designation: m.designation || m.role || 'Member',
      contactNo: m.contactNo || m.mobileNo || '0333-0000000',
      mobileNo: m.mobileNo || m.contactNo || '0333-0000000',
    }));
  },
  savePtcMember(member: PtcMember): void {
    const list = this.getPtcMembers();
    const index = list.findIndex((m) => m.id === member.id);
    if (index >= 0) {
      list[index] = member;
    } else {
      list.push(member);
    }
    setStoredData(STORAGE_KEYS.PTC_MEMBERS, list);
  },
  saveAllPtcMembers(members: PtcMember[]): void {
    setStoredData(STORAGE_KEYS.PTC_MEMBERS, members);
  },
  deletePtcMember(id: string): void {
    const list = this.getPtcMembers().filter((m) => m.id !== id);
    setStoredData(STORAGE_KEYS.PTC_MEMBERS, list);
  },
  resetPtcMembersToDefault(): void {
    setStoredData(STORAGE_KEYS.PTC_MEMBERS, INITIAL_PTC_MEMBERS);
  },

  // PTC Fund Transactions
  getPtcTransactions(): PtcTransaction[] {
    const raw = getStoredData(STORAGE_KEYS.PTC_TRANSACTIONS, INITIAL_PTC_TRANSACTIONS);
    return raw.map((tx) => ({
      ...tx,
      title: tx.title || tx.productName || tx.fundType || 'School Grant / Expense',
      productName: tx.productName || tx.title || tx.fundType || 'School Grant / Expense',
      voucherNo: tx.voucherNo || tx.receiptNo || 'V-01',
      receiptNo: tx.receiptNo || tx.voucherNo || 'V-01',
      category: tx.category || tx.fundType || 'Capitation Grant',
      approvedBy: tx.approvedBy || 'PTC Chairperson & Head Teacher',
    }));
  },
  savePtcTransaction(tx: PtcTransaction): void {
    const list = this.getPtcTransactions();
    const index = list.findIndex((item) => item.id === tx.id);
    if (index >= 0) {
      list[index] = tx;
    } else {
      list.unshift(tx);
    }
    setStoredData(STORAGE_KEYS.PTC_TRANSACTIONS, list);
  },
  deletePtcTransaction(id: string): void {
    const list = this.getPtcTransactions().filter((item) => item.id !== id);
    setStoredData(STORAGE_KEYS.PTC_TRANSACTIONS, list);
  },
  getPtcBalances() {
    const txs = this.getPtcTransactions();
    let totalReceived = 0;
    let totalWithdrawn = 0;

    const breakdown: Record<PtcFundType, { received: number; withdrawn: number; available: number }> = {
      'Capitation Grant': { received: 0, withdrawn: 0, available: 0 },
      'Petty Repair Grant': { received: 0, withdrawn: 0, available: 0 },
      'Classroom Consumable Grant': { received: 0, withdrawn: 0, available: 0 },
    };

    txs.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      const ft = (tx.fundType || 'Capitation Grant') as PtcFundType;
      if (tx.type === 'Received' || tx.type === 'Grant_Received') {
        totalReceived += amt;
        if (breakdown[ft]) {
          breakdown[ft].received += amt;
        }
      } else {
        totalWithdrawn += amt;
        if (breakdown[ft]) {
          breakdown[ft].withdrawn += amt;
        }
      }
    });

    (Object.keys(breakdown) as PtcFundType[]).forEach((fund) => {
      breakdown[fund].available = breakdown[fund].received - breakdown[fund].withdrawn;
    });

    const available = totalReceived - totalWithdrawn;

    return {
      available,
      withdrawn: totalWithdrawn,
      totalReceived,
      grantBreakdown: breakdown,
    };
  },

  // Office Documents CRUD
  getOfficeDocs(): OfficeDocument[] {
    const raw = getStoredData(STORAGE_KEYS.OFFICE_DOCS, INITIAL_OFFICE_DOCS);
    return raw.map((d) => ({
      ...d,
      refNo: d.refNo || d.referenceNo || 'GPSC/2026/01',
      referenceNo: d.referenceNo || d.refNo || 'GPSC/2026/01',
      remarks: d.remarks || d.description || 'Official Dispatch Record',
      description: d.description || d.remarks || 'Official Dispatch Record',
    }));
  },
  saveOfficeDoc(doc: OfficeDocument): void {
    const list = this.getOfficeDocs();
    const index = list.findIndex((d) => d.id === doc.id);
    if (index >= 0) {
      list[index] = doc;
    } else {
      list.unshift(doc);
    }
    setStoredData(STORAGE_KEYS.OFFICE_DOCS, list);
  },
  deleteOfficeDoc(id: string): void {
    const list = this.getOfficeDocs().filter((d) => d.id !== id);
    setStoredData(STORAGE_KEYS.OFFICE_DOCS, list);
  },

  // Books Demand & Received CRUD
  getBooksDemand(): BooksDemandItem[] {
    const raw = getStoredData(STORAGE_KEYS.BOOKS_DEMAND, INITIAL_BOOKS_DEMAND);
    const cleaned = raw.filter((b) => {
      const isKachi =
        b.classId === 'c-kachi' ||
        (b.className || '').toLowerCase().includes('kachi') ||
        (b.className || '').toLowerCase().includes('kg');
      const subLower = (b.subject || '').toLowerCase();
      if (
        isKachi &&
        (subLower.includes('qaida') ||
          subLower.includes('nazra') ||
          subLower.includes('قاعدہ') ||
          subLower.includes('ناظرہ'))
      ) {
        return false;
      }
      return true;
    });

    return cleaned.map((b) => {
      const demandedQty = Number(b.demandedQty ?? b.demanded ?? 0);
      const receivedQty = Number(b.receivedQty ?? b.received ?? 0);
      const distributedQty = Number(b.distributedQty ?? receivedQty);
      const bookCategory: 'New' | 'Old' =
        b.bookCategory === 'Old' || b.bookType === 'Old' ? 'Old' : 'New';
      const normalizedSubject =
        b.subject === 'Drawing / Tajweed — ڈرائنگ / ناظرہ' ? 'Drawing — ڈرائنگ' : b.subject;
      return {
        ...b,
        subject: normalizedSubject,
        bookCategory,
        bookType: bookCategory,
        demanded: demandedQty,
        received: receivedQty,
        demandedQty,
        receivedQty,
        distributedQty,
        academicYear: b.academicYear || '2025-26',
      };
    });
  },
  saveBooksDemandItem(item: BooksDemandItem): void {
    const list = this.getBooksDemand();
    const index = list.findIndex((b) => b.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    setStoredData(STORAGE_KEYS.BOOKS_DEMAND, list);
  },
  deleteBooksDemandItem(id: string): void {
    const list = this.getBooksDemand().filter((b) => b.id !== id);
    setStoredData(STORAGE_KEYS.BOOKS_DEMAND, list);
  },
  batchSaveBooksDemand(items: BooksDemandItem[]): void {
    setStoredData(STORAGE_KEYS.BOOKS_DEMAND, items);
  },

  // Basic Facilities
  getBasicFacilities(): BasicFacilities {
    return getStoredData(STORAGE_KEYS.BASIC_FACILITIES, INITIAL_BASIC_FACILITIES);
  },
  saveBasicFacilities(facilities: BasicFacilities): void {
    setStoredData(STORAGE_KEYS.BASIC_FACILITIES, {
      ...facilities,
      lastUpdated: new Date().toISOString().split('T')[0],
    });
  },

  // Daily Enrolment Entries
  getDailyEnrolment(): DailyEnrolmentEntry[] {
    return getStoredData(STORAGE_KEYS.DAILY_ENROLMENT, INITIAL_DAILY_ENROLMENT);
  },
  saveDailyEnrolmentEntry(entry: DailyEnrolmentEntry): void {
    const list = this.getDailyEnrolment();
    const index = list.findIndex((e) => e.id === entry.id);
    if (index >= 0) {
      list[index] = entry;
    } else {
      list.unshift(entry);
    }
    setStoredData(STORAGE_KEYS.DAILY_ENROLMENT, list);
  },
  deleteDailyEnrolmentEntry(id: string): void {
    const list = this.getDailyEnrolment().filter((e) => e.id !== id);
    setStoredData(STORAGE_KEYS.DAILY_ENROLMENT, list);
  },

  // 13-row Monthly Enrolment Register
  getMonthlyEnrolment(): MonthlyEnrolmentRow[] {
    return getStoredData(STORAGE_KEYS.MONTHLY_ENROLMENT, INITIAL_MONTHLY_ENROLMENT);
  },
  saveMonthlyEnrolment(rows: MonthlyEnrolmentRow[]): void {
    setStoredData(STORAGE_KEYS.MONTHLY_ENROLMENT, rows);
  },

  // Classwise Enrolment Breakdown
  getClassEnrolment(): ClassEnrolmentBreakdown[] {
    return getStoredData(STORAGE_KEYS.CLASS_ENROLMENT, INITIAL_CLASS_ENROLMENT);
  },
  saveClassEnrolment(list: ClassEnrolmentBreakdown[]): void {
    setStoredData(STORAGE_KEYS.CLASS_ENROLMENT, list);
  },

  // PART 12: Certificate Issue CRUD
  getCertificates(): CertificateIssueRecord[] {
    const raw = getStoredData(STORAGE_KEYS.CERTIFICATES, INITIAL_CERTIFICATES);
    return raw.map((c) => ({
      ...c,
      certificateIssued: c.certificateIssued || c.certificateIssue || 'Yes',
      certificateIssue: c.certificateIssue || c.certificateIssued || 'Yes',
    }));
  },
  saveCertificate(cert: CertificateIssueRecord): void {
    const list = this.getCertificates();
    const index = list.findIndex((c) => c.id === cert.id);
    if (index >= 0) {
      list[index] = cert;
    } else {
      list.unshift(cert);
    }
    setStoredData(STORAGE_KEYS.CERTIFICATES, list);

    // Also update student status if certificateIssued === 'Yes'
    if (cert.studentId) {
      const students = this.getStudents();
      const sIdx = students.findIndex((s) => s.id === cert.studentId);
      const issued = (cert.certificateIssued || cert.certificateIssue) === 'Yes';
      if (sIdx >= 0) {
        students[sIdx] = {
          ...students[sIdx],
          status: issued ? 'CertificateIssued' : 'Active',
        };
        setStoredData(STORAGE_KEYS.STUDENTS, students);
      }
    }
  },
  deleteCertificate(id: string): void {
    const list = this.getCertificates().filter((c) => c.id !== id);
    setStoredData(STORAGE_KEYS.CERTIFICATES, list);
  },

  // PART 13: Struck Off CRUD (Maintains historical student records without deleting student)
  getStruckOffRecords(): StruckOffRecord[] {
    return getStoredData(STORAGE_KEYS.STRUCK_OFF, INITIAL_STRUCK_OFF);
  },
  saveStruckOffRecord(record: StruckOffRecord): void {
    const list = this.getStruckOffRecords();
    const index = list.findIndex((r) => r.id === record.id);
    if (index >= 0) {
      list[index] = record;
    } else {
      list.unshift(record);
    }
    setStoredData(STORAGE_KEYS.STRUCK_OFF, list);

    // Update student status non-destructively
    if (record.studentId) {
      const students = this.getStudents();
      const sIdx = students.findIndex((s) => s.id === record.studentId);
      if (sIdx >= 0) {
        students[sIdx] = {
          ...students[sIdx],
          status: record.isRestored ? 'Active' : 'StruckOff',
        };
        setStoredData(STORAGE_KEYS.STUDENTS, students);
      }
    }
  },
  deleteStruckOffRecord(id: string): void {
    const rec = this.getStruckOffRecords().find((r) => r.id === id);
    const list = this.getStruckOffRecords().filter((r) => r.id !== id);
    setStoredData(STORAGE_KEYS.STRUCK_OFF, list);
    if (rec?.studentId) {
      const students = this.getStudents();
      const sIdx = students.findIndex((s) => s.id === rec.studentId);
      if (sIdx >= 0) {
        students[sIdx] = { ...students[sIdx], status: 'Active' };
        setStoredData(STORAGE_KEYS.STUDENTS, students);
      }
    }
  },

  // PART 17: Semester Exam Papers CRUD
  getExamPapers(): SemesterExamPaper[] {
    const raw = getStoredData(STORAGE_KEYS.EXAM_PAPERS, INITIAL_EXAM_PAPERS);
    return raw.map((p) => ({
      ...p,
      studentNameField: p.studentNameField || p.studentNamePlaceholder || '',
      studentNamePlaceholder: p.studentNamePlaceholder || p.studentNameField || '',
      isUrduRtl:
        p.isUrduRtl ??
        (p.languageMode === 'ur' ||
          p.subject.toLowerCase().includes('urdu') ||
          p.subject.toLowerCase().includes('islamiat') ||
          p.subject.toLowerCase().includes('pashto')),
      questions: (p.questions || []).map((q, idx) => ({
        ...q,
        questionNumber: q.questionNumber ?? idx + 1,
        questionText: q.questionText || q.text || '',
        text: q.text || q.questionText || '',
      })),
    }));
  },
  saveExamPaper(paper: SemesterExamPaper): void {
    const list = this.getExamPapers();
    const index = list.findIndex((p) => p.id === paper.id);
    if (index >= 0) {
      list[index] = paper;
    } else {
      list.unshift(paper);
    }
    setStoredData(STORAGE_KEYS.EXAM_PAPERS, list);
  },
  deleteExamPaper(id: string): void {
    const list = this.getExamPapers().filter((p) => p.id !== id);
    setStoredData(STORAGE_KEYS.EXAM_PAPERS, list);
  },

  // PART 20: Full Customization CRUD
  getCustomization(): AppCustomizationSettings {
    const stored = getStoredData<AppCustomizationSettings>(STORAGE_KEYS.CUSTOMIZATION, DEFAULT_CUSTOMIZATION);
    return {
      ...DEFAULT_CUSTOMIZATION,
      ...stored,
      teacherProfilePhotoUrl: stored?.teacherProfilePhotoUrl || DEFAULT_CUSTOMIZATION.teacherProfilePhotoUrl || '/assets/aistudio/Microsoft_Profile_78e13ce1.png',
      cardSize: stored?.cardSize || 'compact',
      cardSpacing: stored?.cardSpacing ?? DEFAULT_CUSTOMIZATION.cardSpacing ?? 12,
      homeViewMode: stored?.homeViewMode || 'grid',
      iconSize: stored?.iconSize === 34 ? 22 : stored?.iconSize || 22,
      aboutPdfUrl: stored?.aboutPdfUrl || stored?.aboutPdfDataUrl || '',
      aboutPdfDataUrl: stored?.aboutPdfDataUrl || stored?.aboutPdfUrl || '',
      cardColors: {
        ...DEFAULT_CUSTOMIZATION.cardColors,
        ...(stored?.cardColors || {}),
      },
      customIcons: {
        ...(stored?.customIcons || {}),
      },
      cardAdvancedConfigs: {
        ...(stored?.cardAdvancedConfigs || {}),
      },
      wallpaperConfig: {
        ...DEFAULT_CUSTOMIZATION.wallpaperConfig,
        ...(stored?.wallpaperConfig || {}),
      },
      homeBottomButtonsOrder:
        stored?.homeBottomButtonsOrder && stored.homeBottomButtonsOrder.length === 4
          ? stored.homeBottomButtonsOrder
          : DEFAULT_CUSTOMIZATION.homeBottomButtonsOrder,
      homeBottomButtonsConfig: {
        ...DEFAULT_CUSTOMIZATION.homeBottomButtonsConfig!,
        ...(stored?.homeBottomButtonsConfig || {}),
      },
      fileFormatIcons: {
        ...(stored?.fileFormatIcons || {}),
      },
      aboutSocialLinks: {
        ...DEFAULT_CUSTOMIZATION.aboutSocialLinks,
        ...(stored?.aboutSocialLinks || {}),
      },
    };
  },
  saveCustomization(settings: AppCustomizationSettings): void {
    setStoredData(STORAGE_KEYS.CUSTOMIZATION, settings);
    window.dispatchEvent(new Event('gps-customization-updated'));
  },
  resetCustomization(): AppCustomizationSettings {
    setStoredData(STORAGE_KEYS.CUSTOMIZATION, DEFAULT_CUSTOMIZATION);
    window.dispatchEvent(new Event('gps-customization-updated'));
    return DEFAULT_CUSTOMIZATION;
  },

  // Notifications CRUD
  getNotifications(): AppNotificationItem[] {
    const raw = getStoredData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
    return raw.map((n) => ({
      ...n,
      read: n.read ?? n.isRead ?? false,
      isRead: n.isRead ?? n.read ?? false,
    }));
  },
  saveNotification(item: AppNotificationItem): void {
    const list = this.getNotifications();
    const index = list.findIndex((n) => n.id === item.id);
    if (index >= 0) {
      list[index] = item;
    } else {
      list.unshift(item);
    }
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, list);
    window.dispatchEvent(new Event('gps-notifications-updated'));
  },
  markAllNotificationsRead(): void {
    const list = this.getNotifications().map((n) => ({ ...n, isRead: true, read: true }));
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, list);
    window.dispatchEvent(new Event('gps-notifications-updated'));
  },
  deleteNotification(id: string): void {
    const list = this.getNotifications().filter((n) => n.id !== id);
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, list);
    window.dispatchEvent(new Event('gps-notifications-updated'));
  },
  deleteAllNotifications(): void {
    setStoredData(STORAGE_KEYS.NOTIFICATIONS, []);
    window.dispatchEvent(new Event('gps-notifications-updated'));
  },

  // Student Daily Diary CRUD (روزمرہ ڈائری)
  getDailyDiaries(): StudentDailyDiaryItem[] {
    return getStoredData(STORAGE_KEYS.DAILY_DIARIES, INITIAL_DAILY_DIARIES);
  },
  saveDailyDiary(diary: StudentDailyDiaryItem): void {
    const list = this.getDailyDiaries();
    const index = list.findIndex((d) => d.id === diary.id);
    if (index >= 0) {
      list[index] = diary;
    } else {
      list.unshift(diary);
    }
    setStoredData(STORAGE_KEYS.DAILY_DIARIES, list);
    window.dispatchEvent(new Event('gps-daily-diaries-updated'));
  },
  deleteDailyDiary(id: string): void {
    const list = this.getDailyDiaries().filter((d) => d.id !== id);
    setStoredData(STORAGE_KEYS.DAILY_DIARIES, list);
    window.dispatchEvent(new Event('gps-daily-diaries-updated'));
  },

  // Database Stats
  getDatabaseStats() {
    const classes = this.getClasses();
    const books = this.getBooks();
    const oldBooks = this.getOldBooks();
    const kpSubjects = this.getKpOfficialSubjects();
    const videos = this.getVideos();
    const students = this.getStudents();
    const attendance = this.getAttendance();
    const results = this.getResults();
    const lessonPlans = this.getLessonPlans();
    const timetable = this.getTimetable();
    const staff = this.getStaff();
    const gallery = this.getGallery();
    const ptcMembers = this.getPtcMembers();
    const ptcTransactions = this.getPtcTransactions();
    const officeDocs = this.getOfficeDocs();
    const booksDemand = this.getBooksDemand();
    const dailyEnrolment = this.getDailyEnrolment();
    const certificates = this.getCertificates();
    const struckOff = this.getStruckOffRecords();
    const examPapers = this.getExamPapers();

    const counts = {
      classes: classes.length,
      books: books.length,
      oldBooks: oldBooks.length,
      kpSubjects: kpSubjects.length,
      videos: videos.length,
      students: students.length,
      attendance: attendance.length,
      results: results.length,
      lessonPlans: lessonPlans.length,
      timetable: timetable.length,
      staff: staff.length,
      gallery: gallery.length,
      ptcMembers: ptcMembers.length,
      ptcTransactions: ptcTransactions.length,
      officeDocs: officeDocs.length,
      booksDemand: booksDemand.length,
      dailyEnrolment: dailyEnrolment.length,
      certificates: certificates.length,
      struckOff: struckOff.length,
      examPapers: examPapers.length,
    };

    const totalRecords = Object.values(counts).reduce((a, b) => a + b, 0);

    let storageSizeBytes = 0;
    try {
      for (const key of Object.values(STORAGE_KEYS)) {
        const item = localStorage.getItem(key);
        if (item) {
          storageSizeBytes += item.length * 2;
        }
      }
    } catch {
      storageSizeBytes = 102400;
    }

    return {
      totalRecords,
      storageSizeBytes,
      storageSizeKb: Math.max(1, Math.round(storageSizeBytes / 1024)),
      counts,
    };
  },

  // PART 4: Backup & Restore (Full Database Export & Validated Restore)
  exportDatabaseJSON(): string {
    const exportObject = {
      app: 'GPS Chambai',
      version: '2.0.0',
      exportDate: new Date().toISOString(),
      folderTarget: 'GPS Chambai',
      classes: this.getClasses(),
      books: this.getBooks(),
      oldBooks: this.getOldBooks(),
      kpSubjects: this.getKpOfficialSubjects(),
      videos: this.getVideos(),
      students: this.getStudents(),
      attendance: this.getAttendance(),
      results: this.getResults(),
      lessonPlans: this.getLessonPlans(),
      timetable: this.getTimetable(),
      timetableGrid: getStoredData(STORAGE_KEYS.TIMETABLE_GRID, {}),
      staff: this.getStaff(),
      gallery: this.getGallery(),
      ptcInfo: this.getPtcInfo(),
      ptcMembers: this.getPtcMembers(),
      ptcTransactions: this.getPtcTransactions(),
      officeDocs: this.getOfficeDocs(),
      booksDemand: this.getBooksDemand(),
      basicFacilities: this.getBasicFacilities(),
      dailyEnrolment: this.getDailyEnrolment(),
      monthlyEnrolment: this.getMonthlyEnrolment(),
      classEnrolment: this.getClassEnrolment(),
      certificates: this.getCertificates(),
      struckOff: this.getStruckOffRecords(),
      examPapers: this.getExamPapers(),
      customization: this.getCustomization(),
      settings: this.getSettings(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  validateBackupJSON(jsonString: string): {
    valid: boolean;
    message: string;
    error?: string;
    summary?: Record<string, number>;
  } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { valid: false, message: 'Invalid JSON file format.', error: 'Invalid JSON file format.' };
      }
      const hasKnownCollection =
        Array.isArray(data.students) ||
        Array.isArray(data.staff) ||
        Array.isArray(data.books) ||
        Array.isArray(data.classes) ||
        Array.isArray(data.ptcTransactions);

      if (!hasKnownCollection) {
        const msg = 'Backup file does not contain recognized GPS Chambai school database tables.';
        return { valid: false, message: msg, error: msg };
      }

      const studentsCount = Array.isArray(data.students) ? data.students.length : 0;
      const staffCount = Array.isArray(data.staff) ? data.staff.length : 0;
      const booksCount = Array.isArray(data.books) ? data.books.length : 0;
      const transactionsCount = Array.isArray(data.ptcTransactions) ? data.ptcTransactions.length : 0;
      const resultsCount = Array.isArray(data.results) ? data.results.length : 0;
      const attendanceCount = Array.isArray(data.attendance) ? data.attendance.length : 0;
      const galleryCount = Array.isArray(data.gallery) ? data.gallery.length : 0;

      const totalRecords =
        studentsCount +
        staffCount +
        booksCount +
        transactionsCount +
        resultsCount +
        attendanceCount +
        galleryCount;

      return {
        valid: true,
        message: 'Backup file validated successfully.',
        summary: {
          Students: studentsCount,
          Staff: staffCount,
          Books: booksCount,
          Transactions: transactionsCount,
          Results: resultsCount,
          Attendance: attendanceCount,
          Total: totalRecords,
        },
      };
    } catch {
      const msg = 'Selected file is not a valid JSON backup.';
      return { valid: false, message: msg, error: msg };
    }
  },

  importDatabaseJSON(jsonString: string): boolean {
    try {
      const validation = this.validateBackupJSON(jsonString);
      if (!validation.valid) return false;

      const data = JSON.parse(jsonString);
      if (data.classes && Array.isArray(data.classes)) setStoredData(STORAGE_KEYS.CLASSES, data.classes);
      if (data.books && Array.isArray(data.books)) setStoredData(STORAGE_KEYS.BOOKS, data.books);
      if (data.oldBooks && Array.isArray(data.oldBooks)) setStoredData(STORAGE_KEYS.OLD_BOOKS, data.oldBooks);
      if (data.kpSubjects && Array.isArray(data.kpSubjects)) setStoredData(STORAGE_KEYS.KP_SUBJECTS, data.kpSubjects);
      if (data.videos && Array.isArray(data.videos)) setStoredData(STORAGE_KEYS.VIDEOS, data.videos);
      if (data.students && Array.isArray(data.students)) setStoredData(STORAGE_KEYS.STUDENTS, data.students);
      if (data.attendance && Array.isArray(data.attendance)) setStoredData(STORAGE_KEYS.ATTENDANCE, data.attendance);
      if (data.results && Array.isArray(data.results)) setStoredData(STORAGE_KEYS.RESULTS, data.results);
      if (data.lessonPlans && Array.isArray(data.lessonPlans)) setStoredData(STORAGE_KEYS.LESSON_PLANS, data.lessonPlans);
      if (data.timetable && Array.isArray(data.timetable)) setStoredData(STORAGE_KEYS.TIMETABLE, data.timetable);
      if (data.timetableGrid && typeof data.timetableGrid === 'object') setStoredData(STORAGE_KEYS.TIMETABLE_GRID, data.timetableGrid);
      if (data.staff && Array.isArray(data.staff)) setStoredData(STORAGE_KEYS.STAFF, data.staff);
      if (data.gallery && Array.isArray(data.gallery)) setStoredData(STORAGE_KEYS.GALLERY, data.gallery);
      if (data.ptcInfo) setStoredData(STORAGE_KEYS.PTC_INFO, data.ptcInfo);
      if (data.ptcMembers && Array.isArray(data.ptcMembers)) setStoredData(STORAGE_KEYS.PTC_MEMBERS, data.ptcMembers);
      if (data.ptcTransactions && Array.isArray(data.ptcTransactions)) setStoredData(STORAGE_KEYS.PTC_TRANSACTIONS, data.ptcTransactions);
      if (data.officeDocs && Array.isArray(data.officeDocs)) setStoredData(STORAGE_KEYS.OFFICE_DOCS, data.officeDocs);
      if (data.booksDemand && Array.isArray(data.booksDemand)) setStoredData(STORAGE_KEYS.BOOKS_DEMAND, data.booksDemand);
      if (data.basicFacilities) setStoredData(STORAGE_KEYS.BASIC_FACILITIES, data.basicFacilities);
      if (data.dailyEnrolment && Array.isArray(data.dailyEnrolment)) setStoredData(STORAGE_KEYS.DAILY_ENROLMENT, data.dailyEnrolment);
      if (data.monthlyEnrolment && Array.isArray(data.monthlyEnrolment)) setStoredData(STORAGE_KEYS.MONTHLY_ENROLMENT, data.monthlyEnrolment);
      if (data.classEnrolment && Array.isArray(data.classEnrolment)) setStoredData(STORAGE_KEYS.CLASS_ENROLMENT, data.classEnrolment);
      if (data.certificates && Array.isArray(data.certificates)) setStoredData(STORAGE_KEYS.CERTIFICATES, data.certificates);
      if (data.struckOff && Array.isArray(data.struckOff)) setStoredData(STORAGE_KEYS.STRUCK_OFF, data.struckOff);
      if (data.examPapers && Array.isArray(data.examPapers)) setStoredData(STORAGE_KEYS.EXAM_PAPERS, data.examPapers);
      if (data.customization) setStoredData(STORAGE_KEYS.CUSTOMIZATION, data.customization);
      if (data.settings) setStoredData(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse database backup JSON:', e);
      return false;
    }
  },

  // Convenience & compatibility method aliases used across modules
  init(): void {
    this.initStorage();
  },
  resetCustomizationToDefault(): AppCustomizationSettings {
    return this.resetCustomization();
  },
  addStudent(student: Student): void {
    this.saveStudent(student);
  },
  updateStudent(student: Student): void {
    this.saveStudent(student);
  },
  addStaff(member: StaffMember): void {
    this.saveStaff(member);
  },
  updateStaff(member: StaffMember): void {
    this.saveStaff(member);
  },
  addBook(book: Book): void {
    this.saveBook(book);
  },
  updateBook(book: Book): void {
    this.saveBook(book);
  },
  addOldBook(item: OldBookStockItem): void {
    this.saveOldBook(item);
  },
  updateOldBook(item: OldBookStockItem): void {
    this.saveOldBook(item);
  },
  addKpOfficialSubject(record: KpOfficialSubjectRecord): void {
    this.saveKpOfficialSubject(record);
  },
  addGalleryItem(item: GalleryItem): void {
    this.saveGalleryItem(item);
  },
  addVideo(video: VideoItem): void {
    this.saveVideo(video);
  },
  getFinances(): PtcTransaction[] {
    return this.getPtcTransactions();
  },
  addFinance(tx: PtcTransaction): void {
    this.savePtcTransaction(tx);
  },
  deleteFinance(id: string): void {
    this.deletePtcTransaction(id);
  },
  addPtcMember(member: PtcMember): void {
    this.savePtcMember(member);
  },
  getBookDemands(): BooksDemandItem[] {
    return this.getBooksDemand();
  },
  addBookDemand(item: BooksDemandItem): void {
    this.saveBooksDemandItem(item);
  },
  updateBookDemand(item: BooksDemandItem): void {
    this.saveBooksDemandItem(item);
  },
  deleteBookDemand(id: string): void {
    this.deleteBooksDemandItem(id);
  },
  addCertificate(cert: CertificateIssueRecord): void {
    this.saveCertificate(cert);
  },
  updateCertificate(cert: CertificateIssueRecord): void {
    this.saveCertificate(cert);
  },
  addStruckOffRecord(record: StruckOffRecord): void {
    this.saveStruckOffRecord(record);
  },
  updateStruckOffRecord(record: StruckOffRecord): void {
    this.saveStruckOffRecord(record);
  },
  getTimetableGrid(classId = 'c-5'): TimetableGridRow[] {
    return this.getTimetableGridForClass(classId);
  },
  saveTimetableGrid(rows: TimetableGridRow[], classId = 'c-5'): void {
    this.saveTimetableGridForClass(classId, rows);
  },
  addResult(result: ExamResult): void {
    this.saveResult(result);
  },
  updateResult(result: ExamResult): void {
    this.saveResult(result);
  },
  addExamPaper(paper: SemesterExamPaper): void {
    this.saveExamPaper(paper);
  },
  updateExamPaper(paper: SemesterExamPaper): void {
    this.saveExamPaper(paper);
  },
  saveAttendance(record: AttendanceRecord): void {
    this.saveAttendanceRecord(record);
  },
  markAttendance(record: AttendanceRecord): void {
    this.saveAttendanceRecord(record);
  },
  saveAttendanceBatch(records: AttendanceRecord[]): void {
    this.saveBatchAttendance(records);
  },
  addLessonPlan(plan: LessonPlan): void {
    this.saveLessonPlan(plan);
  },
  updateLessonPlan(plan: LessonPlan): void {
    this.saveLessonPlan(plan);
  },
  addOfficeDoc(doc: OfficeDocument): void {
    this.saveOfficeDoc(doc);
  },
  addNotification(item: AppNotificationItem): void {
    this.saveNotification(item);
  },
  addDailyDiary(diary: StudentDailyDiaryItem): void {
    this.saveDailyDiary(diary);
  },
  updateDailyDiary(diary: StudentDailyDiaryItem): void {
    this.saveDailyDiary(diary);
  },
  exportDatabase(): string {
    return this.exportDatabaseJSON();
  },
  importDatabase(jsonString: string): boolean {
    return this.importDatabaseJSON(jsonString);
  },
  resetToDefaults(): void {
    this.initStorage();
  },

  // Teacher Daily Attendance (GPS Chambai - EMIS 16454)
  getOfficialTeachers(): StaffMember[] {
    return getStoredData(STORAGE_KEYS.OFFICIAL_TEACHERS, GPS_CHAMBAI_OFFICIAL_TEACHERS);
  },
  saveOfficialTeacher(member: StaffMember): void {
    const list = this.getOfficialTeachers();
    const idx = list.findIndex((s) => s.id === member.id);
    if (idx >= 0) {
      list[idx] = member;
    } else {
      list.push(member);
    }
    setStoredData(STORAGE_KEYS.OFFICIAL_TEACHERS, list);
  },
  deleteOfficialTeacher(id: string): void {
    const list = this.getOfficialTeachers().filter((s) => s.id !== id);
    setStoredData(STORAGE_KEYS.OFFICIAL_TEACHERS, list);
  },
  getTeacherAttendance(): TeacherAttendanceRecord[] {
    return getStoredData(STORAGE_KEYS.TEACHER_ATTENDANCE, INITIAL_TEACHER_ATTENDANCE);
  },
  getTeacherAttendanceByDate(date: string): TeacherAttendanceRecord {
    const list = this.getTeacherAttendance();
    const existing = list.find((r) => r.date === date);
    if (existing) return existing;

    const d = new Date(date);
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = isNaN(d.getTime()) ? 'Monday' : dayNames[d.getDay()];
    const defaultMap: Record<string, TeacherAttendanceStatus> = {};
    GPS_CHAMBAI_OFFICIAL_TEACHERS.forEach((t) => {
      defaultMap[t.id] = 'Present';
    });
    return {
      id: `t-att-${date}`,
      date,
      dayName,
      isSynced: true,
      statusMap: defaultMap,
      notes: {},
    };
  },
  saveTeacherAttendance(record: TeacherAttendanceRecord): void {
    const list = this.getTeacherAttendance();
    const idx = list.findIndex((r) => r.date === record.date);
    const updated = { ...record, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      list[idx] = updated;
    } else {
      list.unshift(updated);
    }
    setStoredData(STORAGE_KEYS.TEACHER_ATTENDANCE, list);
  },

  // PART 1: HIRS CV
  getHirsCv(): HirsCvData {
    return getStoredData(STORAGE_KEYS.HIRS_CV, DEFAULT_HIRS_CV);
  },
  saveHirsCv(data: HirsCvData): void {
    setStoredData(STORAGE_KEYS.HIRS_CV, data);
  },

  // PART 1.5: School About
  getSchoolAbout(): SchoolAboutData {
    const stored = getStoredData<Partial<SchoolAboutData>>(STORAGE_KEYS.SCHOOL_ABOUT, {});
    const merged: SchoolAboutData = {
      ...DEFAULT_SCHOOL_ABOUT,
      ...stored,
    };
    // Fix legacy desktop-only web.facebook.com or incomplete iEMIS URLs so mobile links open properly
    if (
      !merged.facebookUrl ||
      merged.facebookUrl === 'https://web.facebook.com/gpschambaikohat' ||
      merged.facebookUrl === 'https://web.facebook.com/gpschambaikohat/'
    ) {
      merged.facebookUrl = DEFAULT_SCHOOL_ABOUT.facebookUrl;
    }
    if (
      !merged.iemisUrl ||
      merged.iemisUrl.includes('human-resource-management-system-hrmis')
    ) {
      merged.iemisUrl = DEFAULT_SCHOOL_ABOUT.iemisUrl;
    }
    return merged;
  },
  saveSchoolAbout(data: SchoolAboutData): void {
    setStoredData(STORAGE_KEYS.SCHOOL_ABOUT, data);
  },

  // PART 1.7: Official Signatures & Stamp
  getSignaturesAndStamp(): OfficialSignaturesAndStamp {
    return getStoredData(STORAGE_KEYS.SIGNATURES_STAMP, DEFAULT_OFFICIAL_SIGNATURES);
  },
  saveSignaturesAndStamp(data: OfficialSignaturesAndStamp): void {
    setStoredData(STORAGE_KEYS.SIGNATURES_STAMP, { ...data, lastUpdated: new Date().toISOString() });
  },

  // PART 2 & 3: WhatsApp Settings & Notifications
  getWhatsAppSettings(): WhatsAppSettings {
    return getStoredData(STORAGE_KEYS.WHATSAPP_SETTINGS, DEFAULT_WHATSAPP_SETTINGS);
  },
  saveWhatsAppSettings(data: WhatsAppSettings): void {
    setStoredData(STORAGE_KEYS.WHATSAPP_SETTINGS, data);
  },
  logWhatsAppNotification(log: Omit<import('../types').WhatsAppNotificationLog, 'id' | 'timestamp'>): void {
    const settings = this.getWhatsAppSettings();
    const newEntry: import('../types').WhatsAppNotificationLog = {
      ...log,
      id: `wlog-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    settings.logs.unshift(newEntry);
    if (settings.logs.length > 200) settings.logs = settings.logs.slice(0, 200);
    this.saveWhatsAppSettings(settings);
  },

  // PART 12: PTC Categorized Financial System
  getPtcCategorizedFund(): PtcCategorizedFundData {
    return getStoredData(STORAGE_KEYS.PTC_CATEGORIZED_FUND, DEFAULT_PTC_CATEGORIZED_FUND);
  },
  savePtcCategorizedFund(data: PtcCategorizedFundData): void {
    setStoredData(STORAGE_KEYS.PTC_CATEGORIZED_FUND, data);
  },

  // PART 18: Student Monthly Attendance Stats
  getAttendanceMonthlyStats(): StudentMonthlyAttendanceStats {
    return getStoredData(STORAGE_KEYS.ATTENDANCE_MONTHLY_STATS, DEFAULT_STUDENT_ATTENDANCE_MONTHLY_STATS);
  },
  saveAttendanceMonthlyStats(data: StudentMonthlyAttendanceStats): void {
    setStoredData(STORAGE_KEYS.ATTENDANCE_MONTHLY_STATS, data);
  },
};

export const DEFAULT_HIRS_CV: HirsCvData = {
  calligraphyTitle: 'Hello , I am..',
  fullName: 'MUHAMMAD IRFAN',
  designation: 'SPST (BPS - 14)',
  bps: '14',
  portraitUrl: '/assets/aistudio/Microsoft_Profile_78e13ce1.png',
  fatherName: 'SAID WAZIR KHAN',
  cnic: '14301-9843438-1',
  personalNo: '00800702',
  gender: 'MALE',
  domicile: 'KOHAT',
  station: 'GPS CHAMBAI KOHAT',
  designationLong: 'SPST ( BPS - 14 )',
  lastPostDate: '17 - MAR - 2022',
  covidVaccination: 'YES',
  mobile1: '0336 9053 352',
  mobile2: '+92 336 9053 352',
  email: 'm.irfan.25389@gmail.com',
  socialHandle: '@mirfan25389',
  dob: '25 MAR 1989',
  dateOfEntry: '21 MAR 2016',
  mobileBasic: '0336-9053352',
  maritalStatus: 'MARRIED',
  bloodGroup: 'A+',
  motherTongue: 'PASHTO',
  passportNo: 'FE1984382',
  unionCouncil: 'SUR GUL',
  religion: 'ISLAM',
  domicileBasic: 'KOHAT',
  initialRecruitment: '19 MAR 2016',
  permanentAddress: 'Village Chambai Tehsil and District Kohat',
  educationQualifications: [
    { id: 'edu-1', collegeUniversity: 'BISE KOHAT', academic: 'SSC (Sci)', totalMarks: 900, obtainedMarks: 579, percentage: '64.33%', regularPrivate: 'REGULAR', sessionYear: '2008' },
    { id: 'edu-2', collegeUniversity: 'BISE KOHAT', academic: 'HSSC (FA)', totalMarks: 1100, obtainedMarks: 537, percentage: '48.82%', regularPrivate: 'REGULAR', sessionYear: '2010' },
    { id: 'edu-3', collegeUniversity: 'KUST KOHAT', academic: 'B.A', totalMarks: 550, obtainedMarks: 267, percentage: '48.55%', regularPrivate: 'REGULAR', sessionYear: '2012' },
    { id: 'edu-4', collegeUniversity: 'AIOU ISLAMABAD', academic: 'MSc Pak Study', totalMarks: 2000, obtainedMarks: 1226, percentage: '61.33', regularPrivate: 'PRIVATE', sessionYear: '2020' },
    { id: 'edu-5', collegeUniversity: 'AIOU ISLAMABAD', academic: 'PTC', totalMarks: 900, obtainedMarks: 600, percentage: '66.67', regularPrivate: 'PRIVATE', sessionYear: '2012' },
    { id: 'edu-6', collegeUniversity: 'AIOU ISLAMABAD', academic: 'B.Ed', totalMarks: 900, obtainedMarks: 605, percentage: '67.22', regularPrivate: 'PRIVATE', sessionYear: '2014' },
  ],
  postingTransfers: [
    { id: 'post-1', officeSchool: 'GPS CHAMBAI (16454)', designation: 'SPST (BPS-14)', fromDate: '17-MAR-2022', toDate: '', status: 'WORKING', placementType: 'PROMOTION', postingType: 'Internal', notification: 'Endst No. 2111-17' },
    { id: 'post-2', officeSchool: 'GPS CHAMBAI (16454)', designation: 'PST (BPS-12)', fromDate: '07-JUL-2021', toDate: '16-MAR-2022', status: 'INACTIVE', placementType: 'TRANSFER', postingType: 'Internal', notification: 'Endst No. 3474-8' },
  ],
  bpsJobTypes: [
    { id: 'bps-1', bps: 'BPS 14', fromDate: '17-MAR-2022', toDate: '', status: 'WORKING', remarks: 'Well', notification: '2111-17', jobType: 'Regular' },
    { id: 'bps-2', bps: 'Regular', fromDate: '21-MAR-2016', toDate: '09-MAR 2018', status: 'INACTIVE', remarks: 'Appointment PST', notification: 'Endst No, 2069-2226', jobType: 'Regular' },
  ],
  cadreTeaching: 'Teaching',
  cadreDesignation: 'SPST',
  cadreBps: 'BPS-14',
  cadreFromDate: '17-MAR 2022',
  cadreToDate: '',
  cadreStates: 'WORKING',
  cadreSeniorityNo: '721',
  accountTitle: 'Current Account',
  bankName: 'MEEZAN BANK LIMITED.',
  bankCode: '2701',
  accountNo: '0102095164',
  iban: 'PK56 MEZN 0027 0101 0209 5164',
  bankAddress: 'Jinnah Plaza Kohat',
  bankStatus: 'ACTIVE',
};

export const DEFAULT_SCHOOL_ABOUT: SchoolAboutData = {
  schoolFullTitle: 'GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT',
  schoolName: 'GPS CHAMBAI',
  emisCode: '16454',
  approvalStatus: 'Approved',
  ddoCode: 'KT6088',
  schoolLevel: 'PRIMARY',
  circleName: '1 JARMA / 2 JARMA',
  na: '35',
  pk: '91',
  xPoint: '33.5139',
  yPoint: '71.4165',
  updatedBy: '16454',
  dateTime: '06 AUG 2026 10:46 AM',
  department: 'Elementary and Secondary Education Department (E&SED) Khyber Pakhtunkhwa',
  directorate: 'Directorate of Elementary & Secondary Education Khyber Pakhtunkhwa',
  subOffice: 'District Education Office (Male)',
  type: 'SCHOOL',
  officeSchoolGender: 'MALE',
  ownership: 'Government Mutated',
  country: 'PAKISTAN',
  province: 'KHYBER PAKHTUNKHWA',
  division: 'KOHAT',
  district: 'KOHAT',
  tehsil: 'KOHAT',
  unionCouncil: 'SUR GUL',
  instructionMedium: 'ENGLISH',
  urbanRural: 'RURAL',
  weatherZone: 'SUMMER',
  phoneNo: '03369053352',
  sosNo: '03339654575',
  faxNo: '-',
  email: 'gpschambaikohat@gmail.com',
  villageName: 'Village Chambai Kohat',
  mohallaName: 'Village Chambai Bannu Road Kohat',
  postOffice: 'BISE Kohat',
  schoolAddress: 'Village Chambai, Bannu Road, Union Council Sur Gul, Tehsil & District Kohat',
  contactInformation:
    'Office of the Head Teacher (PSHT), Government Primary School Chambai Kohat (EMIS: 16454 • DDO Code: KT6088), Circle Jarma, District Kohat.',
  schoolIntroduction:
    'Government Primary School (GPS) Chambai Kohat (EMIS Code: 16454, DDO Code: KT6088) is an officially approved public-sector primary institution operating under the Elementary & Secondary Education Department (E&SED), Government of Khyber Pakhtunkhwa. Located in Village Chambai along Bannu Road in Union Council Sur Gul (Circle 1 Jarma / 2 Jarma), the school provides quality English-medium primary education from Kachi / KG (ECE) through Class 5th.',
  schoolHistory:
    'Established to serve the educational needs of children in Village Chambai and surrounding rural communities of Tehsil & District Kohat, GPS Chambai has grown into a model primary institution in Jarma Circle. Under dedicated leadership and qualified teaching faculty (PSHT, SPST, and PST cadres), the school continuously modernizes both classroom instruction and digital school record management.',
  schoolVision:
    'To nurture every child of Chambai Kohat into a confident, morally upright, and academically capable learner through accessible, inclusive, and high-standard primary education.',
  schoolMission:
    'To deliver conceptual English, Urdu, Mathematics, General Science, and Islamic Studies instruction in a safe, child-friendly environment while partnering closely with parents through the Parent-Teacher Council (PTC) and modern digital communication.',
  schoolFacilities:
    '• Well-ventilated classrooms for KG (ECE) to Class 5th\n• Early Childhood Education (ECE) learning corner & teaching aids\n• Solar power backup and electricity facility\n• Clean drinking water & student washroom facilities\n• Secure boundary wall and open courtyard for morning assembly & physical activities\n• Complete digital school management, attendance, and examination system',
  educationalActivities:
    '• Daily Morning Assembly with Quranic Recitation, Naat, National Anthem & Moral Talks\n• Structured Lesson Planning aligned with KP E&SED SLOs (Student Learning Outcomes)\n• Weekly Bazm-e-Adab, Urdu/English Handwriting, Reading & Mental Math Drills\n• Bi-Annual 1st & 2nd Semester Examinations and Annual Award Lists\n• Active Parent-Teacher Council (PTC) meetings and real-time parent attendance alerts',
  schoolAchievements:
    '• Consistent 90%+ to 100% pass ratio in annual & cluster primary examinations\n• Full compliance with KP E&SED iEMIS / HRMIS reporting and SSR quality standards\n• Successful implementation of Digital Student Admission, DMC Report Cards, and Automated Attendance Tracking\n• High community trust and sustained annual student enrollment growth across KG to 5th classes',
  facebookUrl: 'https://www.facebook.com/gpschambaikohat/',
  facebookLabel: 'GPS Chambai Kohat Official Facebook',
  youtubeUrl: 'https://www.youtube.com/@GPSChambaiKohat',
  youtubeLabel: 'GPS Chambai Kohat YouTube Channel',
  whatsappUrl: 'https://wa.me/923369053352',
  whatsappLabel: 'WhatsApp Contact (+92 336 9053352)',
  iemisUrl:
    'https://iemis.kpese.gov.pk/ords/r/emis/human-resource-management-information-system-hrmis/login',
  iemisLabel: 'iEMIS KP E&SE Department HRMIS Portal',
};

export const DEFAULT_OFFICIAL_SIGNATURES: OfficialSignaturesAndStamp = {
  signature1Url: '/assets/aistudio/image_019_11ad539e.png',
  signature2Url: '/assets/aistudio/image_020_a379be76.png',
  officialStampUrl: '/assets/aistudio/image_021_491fb5ac.png',
};

export const DEFAULT_WHATSAPP_SETTINGS: WhatsAppSettings = {
  autoNotifyOnIn: true,
  autoNotifyOnOut: true,
  enableSmsFallback: true,
  parents: [
    { id: 'wp-1', studentId: 's-1', studentName: 'Muhammad Rehan', className: 'Class 5', parentName: 'Said Wazir Khan', phone: '03369053352' },
    { id: 'wp-2', studentId: 's-2', studentName: 'Amir Khan', className: 'Class 4', parentName: 'Anar Khan', phone: '03339654575' },
    { id: 'wp-3', studentId: 's-3', studentName: 'Fahad Aziz', className: 'Class 3', parentName: 'Aziz-ur-Rehman', phone: '03329876543' },
  ],
  templates: {
    studentIn: 'Assalam-o-Alaikum! Your child {studentName} ({className}) safely ARRIVED at Govt. Primary School Chambai Kohat on {date} at {time}. [Status: IN]',
    studentOut: 'Assalam-o-Alaikum! Your child {studentName} ({className}) has DEPARTED from Govt. Primary School Chambai Kohat on {date} at {time}. [Status: OUT]',
    general: 'Official Notice from GPS Chambai Kohat: Dear Parent of {studentName}, please be informed that school will observe regular timings tomorrow.',
  },
  logs: [
    {
      id: 'log-1',
      studentId: 's-1',
      studentName: 'Muhammad Rehan',
      className: 'Class 5',
      type: 'IN',
      timestamp: new Date().toISOString(),
      date: new Date().toISOString().split('T')[0],
      time: '07:55 AM',
      status: 'Delivered',
      phone: '03369053352',
      message: 'Assalam-o-Alaikum! Your child Muhammad Rehan (Class 5) safely ARRIVED at GPS Chambai Kohat. [Status: IN]',
      channel: 'WhatsApp',
    },
  ],
};

export const DEFAULT_PTC_CATEGORIZED_FUND: PtcCategorizedFundData = {
  allFund: {
    totalReceived: 250000,
    financialYear: '2026-2027',
    receiptDate: '2026-07-15',
    description: 'Government Annual PTC Council Grant received via District Education Office Kohat',
  },
  categories: {
    capitation: { allocated: 100000, spent: 34500, balance: 65500 },
    consumable: { allocated: 75000, spent: 21800, balance: 53200 },
    repair: { allocated: 75000, spent: 39500, balance: 35500 },
  },
  transactions: [
    {
      id: 'tx-1',
      category: 'capitation',
      type: 'expense',
      date: '2026-08-10',
      description: 'Procurement of Student Learning Materials & Notebooks',
      amount: 14500,
      createdAt: '2026-08-10T10:00:00Z',
    },
    {
      id: 'tx-2',
      category: 'consumable',
      type: 'expense',
      date: '2026-08-18',
      description: 'Classroom Whiteboard Markers, Dusting Cloth & Office Stationery',
      amount: 6800,
      createdAt: '2026-08-18T11:30:00Z',
    },
    {
      id: 'tx-3',
      category: 'repair',
      type: 'expense',
      date: '2026-09-05',
      description: 'Minor Repair of Classroom Desks, Door Locks & Electric Switchboards',
      amount: 18500,
      createdAt: '2026-09-05T09:15:00Z',
    },
  ],
};

export const DEFAULT_STUDENT_ATTENDANCE_MONTHLY_STATS: StudentMonthlyAttendanceStats = {
  studentsBeginningMonth: 185,
  studentsEndMonth: 188,
  totalAttendanceDuringMonth: 3820,
  dailyAverageAttendance: 173,
  schoolTimingDuringMonth: '08:00 AM - 01:30 PM',
  totalSchoolTimingsStartSession: '1240 Hours',
};

