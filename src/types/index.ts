export type Language = 'en' | 'ur';

export type DeviceFrameMode = 'mobile' | 'tablet' | 'desktop' | 'full';

export interface SchoolClass {
  id: string;
  name: string;
  urduName?: string;
  gradeLevel?: number;
  section?: string;
  roomNumber?: string;
  hexColor?: string;
  createdAt?: string;
}

export interface Book {
  id: string;
  title: string;
  classId?: string;
  className?: string;
  subject: string;
  description?: string;
  author?: string;
  pages?: number;
  coverColor?: string;
  pdfFileName?: string;
  pdfDataUrl?: string; // base64 or blob url
  fileUrl?: string;
  fileSize?: string;
  dateAdded?: string;
  uploadedAt?: string;
  type?: 'book' | 'guide';
  category?: 'Book' | 'Guide' | string;
  bookCondition?: 'New' | 'Old';
  quantity?: number;
}

export type BookguideItem = Book;

export interface OldBookStockItem {
  id: string;
  classId?: string;
  className: string;
  subject: string;
  availableQty?: number;
  quantity?: number;
  condition?: 'Good' | 'Fair' | 'Usable';
  conditionNote?: string;
  remarks?: string;
  academicYear?: string;
  updatedAt?: string;
}

export interface KpOfficialSubjectRecord {
  id: string;
  classId?: string;
  className?: string;
  classLabel?: string;
  subject?: string;
  subjectLabel?: string;
  urduLabel?: string;
  bookTitle?: string;
  addedAt?: string;
  addedDate?: string;
}

export interface VideoItem {
  id: string;
  title: string;
  youtubeUrl?: string;
  youtubeId: string;
  thumbnailUrl: string;
  videoDataUrl?: string; // support uploaded local video files
  videoUrl?: string;
  classId?: string;
  className?: string;
  subject: string;
  duration?: string;
  description?: string;
  dateAdded?: string;
}

export type Gender = 'Male' | 'Female' | 'Other';

export type AdmissionCategory = 'D' | 'G' | 'P' | 'F';
export type AdmissionCategoryCode = AdmissionCategory;

export interface Student {
  id: string;
  admissionNo: string;
  rollNo?: string;
  admissionDate: string;
  admissionCategory?: AdmissionCategory; // D = Dropout, G = Government, P = Private, F = Fresh
  name: string;
  fatherName: string;
  fatherCnic?: string;
  dob: string;
  gender?: Gender;
  mobileNo?: string;
  contactNo?: string;
  bFormNo: string;
  classId: string;
  className?: string;
  section?: string;
  address?: string;
  avatarUrl?: string;
  photoUrl?: string;
  qrToken?: string;
  status?: 'Active' | 'StruckOff' | 'Struck_Off' | 'CertificateIssued' | string;
  struckOffDate?: string;
  struckOffReason?: string;
  reAdmissionDate?: string;
  reAdmissionRemarks?: string;
  parentWhatsApp?: string;
  remarks?: string;
  createdAt?: string;
}

export type StudentRecord = Student;

export type AttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'Late';

export interface AttendanceRecord {
  id: string;
  studentId?: string;
  classId: string;
  date: string; // YYYY-MM-DD
  status?: AttendanceStatus;
  records?: Record<string, any>;
  notes?: string;
}

export interface ExamSubjectMark {
  subject?: string;
  subjectName?: string;
  maxMarks?: number;
  totalMarks?: number;
  total?: number;
  obtainedMarks?: number;
  obtained?: number;
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName?: string;
  fatherName?: string;
  rollNo?: string;
  classId: string;
  className?: string;
  examName?: string; // e.g., '1st Semester 2026', '2nd Semester 2026'
  examTerm?: string;
  academicYear?: string;
  examDate?: string;
  subjectMarks?: ExamSubjectMark[];
  subjects?: any[];
  totalMaxMarks?: number;
  totalMarks?: number;
  totalObtainedMarks?: number;
  obtainedMarks?: number;
  percentage: number;
  grade: string;
  positionInClass?: string | number;
  isPassed?: boolean;
  remarks?: string;
}

export interface LessonPlanStep {
  step?: number; // 1, 2, 3, 4
  stepNumber?: number;
  teacherActivity: string;
  studentActivity: string;
  time: string;
}

export interface LessonPlan {
  id: string;
  classId?: string;
  className?: string;
  subject: string;
  teacherName: string;
  date?: string;
  duration?: string; // e.g. "40 Minutes"
  week?: string;
  topic: string;
  slo?: string;
  learningObjectives?: string;
  // Specific Learning Objective Pills from Image 007:
  objectiveKnowledge?: string;
  knowledge?: string;
  objectiveSkills?: string;
  skills?: string;
  objectiveAttitude?: string;
  attitude?: string;
  // Previous knowledge from Image 007:
  previousKnowledge?: string;
  // Teaching aids / materials:
  teachingMaterials?: string;
  teachingAids?: {
    books?: boolean;
    charts?: boolean;
    whiteboard?: boolean;
    multimedia?: boolean;
    others?: string;
  };
  teachingAidsList?: {
    books?: boolean;
    charts?: boolean;
    whiteboard?: boolean;
    multimedia?: boolean;
    others?: string;
  };
  // Introduction / set induction (5-10 min):
  introduction?: string;
  introDuration?: string;
  // Presentation / Teaching Steps (table with 4 rows):
  steps?: LessonPlanStep[];
  // Practice / Activity:
  practiceActivity?: string;
  activities: string;
  // Assessment / Evaluation:
  assessment?: string;
  assessmentMethods?: {
    oral?: boolean;
    worksheet?: boolean;
    observation?: boolean;
  };
  // Conclusion / Recap:
  conclusion?: string;
  // Homework / Assignment:
  homework: string;
  // Reflection (Teacher Notes):
  reflection?: string;
  remarks?: string;
}

export type LessonPlanItem = LessonPlan;

export type DayOfWeekName =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

export type TimetableDayName = DayOfWeekName;

export interface TimetableSlot {
  id: string;
  classId: string;
  dayOfWeek: DayOfWeekName;
  periodNumber: number; // 1 to 7
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "08:45"
  subject: string;
  teacherName: string;
  room?: string;
  notes?: string;
}

// Editable 7-period x 7-day Timetable Matrix
export interface TimetableGridRow {
  day: DayOfWeekName;
  dayUr?: string;
  time?: string;
  period1: string;
  period2: string;
  period3: string;
  period4: string;
  period5: string;
  period6?: string;
  period7?: string;
  periods?: any;
}

export interface SchoolSettings {
  schoolNameEn: string;
  schoolNameUr: string;
  subtitleEn: string;
  subtitleUr: string;
  district: string;
  province: string;
  passingPercentage: number;
  academicYear: string;
  contactPhone: string;
  headmasterName: string;
}

export type StaffDepartment =
  | 'Administration'
  | 'Primary Teaching'
  | 'Religious & Arabic'
  | 'Physical Education'
  | 'Support & Security';

export type StaffCategoryOption =
  | 'Head Teacher'
  | 'Focal Person'
  | 'Other'
  | 'Chowkidar'
  | 'PSHT'
  | 'SPST'
  | 'PST'
  | string;

export type StaffDesignationOption = StaffCategoryOption;

export interface StaffMember {
  id: string;
  name: string;
  urduName?: string;
  fatherName?: string;
  designation: string; // e.g. PSHT, SPST, PST, Chowkidar
  bps?: number;
  department?: StaffDepartment;
  staffCategory?: StaffCategoryOption;
  roleDescription?: string;
  qualification: string;
  personalNo: string;
  cnic: string;
  phone?: string;
  contactNo?: string;
  email?: string;
  classTeacherOf?: string;
  assignedClasses?: string[];
  assignedSubjects?: string[];
  joiningDate: string;
  gender?: 'Male' | 'Female';
  status: 'Active' | 'On Leave' | 'Transferred' | 'Present' | string;
  photoUrl?: string;
  address?: string;
  emergencyContact?: string;
}

export type Staff = StaffMember;

export type GalleryCategory =
  | 'Events & Celebrations'
  | 'Classrooms & Learning'
  | 'Sports & Activities'
  | 'School Infrastructure'
  | 'Achievements & Awards'
  | 'Events'
  | 'Classrooms'
  | 'Sports'
  | 'Infrastructure'
  | 'Achievements'
  | 'General'
  | string;

export interface GalleryItem {
  id: string;
  title: string;
  urduTitle?: string;
  category: GalleryCategory;
  date: string;
  year?: string;
  imageUrl: string;
  mediaType?: 'photo' | 'video';
  videoUrl?: string;
  description: string;
  achievementHighlight?: string;
  photographerOrSource?: string;
  tags?: string[];
}

// PTC (Parent-Teacher Council) Types
export type PtcFundType =
  | 'Capitation Grant'
  | 'Petty Repair Grant'
  | 'Classroom Consumable Grant';

export type PtcTransactionType = 'Received' | 'Expense' | 'Grant_Received' | 'Withdrawal';

export interface PtcTransaction {
  id: string;
  fundType?: PtcFundType;
  type: PtcTransactionType;
  amount: number;
  date: string;
  productName?: string;
  title?: string;
  receiptNo?: string;
  voucherNo?: string;
  category?: string;
  approvedBy?: string;
  remarks?: string;
  createdAt?: string;
}

export type FinancialTransaction = PtcTransaction;

export interface PtcBankDetails {
  accountNo: string;
  branchCode: string;
  branchName: string;
  ibanNo: string;
}

export interface PtcMember {
  id: string;
  name: string;
  designation?: string;
  role?: string;
  cnic: string;
  mobileNo?: string;
  contactNo?: string;
  isChairperson?: boolean;
  address?: string;
  status?: 'Active' | 'Not Active';
}

export interface PtcCouncilInfo {
  isEstablished: boolean;
  dateOfEstablished: string;
  bankDetails: PtcBankDetails;
  registrationAuthority?: string;
}

// Office Documents (Notification, Order, Performas)
export type OfficeDocCategory = 'Notification' | 'Order' | 'Performa' | 'Circular' | string;
export type OfficeFileFormat = 'PDF' | 'Excel' | 'Word' | 'Image' | 'Text';

export interface OfficeDocument {
  id: string;
  title: string;
  urduTitle?: string;
  category: OfficeDocCategory;
  referenceNo?: string;
  refNo?: string;
  date: string; // YYYY-MM-DD
  issuingAuthority?: string;
  fileFormat?: OfficeFileFormat;
  fileName?: string;
  fileSize?: string;
  fileDataUrl?: string;
  description?: string;
  remarks?: string;
  uploadedAt?: string;
  status?: 'Active' | 'Archived';
}

// Books Demand & Received
export type KPTextbookSubject =
  | 'Urdu'
  | 'English'
  | 'Mathematics'
  | 'Islamiat'
  | 'Islamiyat'
  | 'General Science'
  | 'General Knowledge'
  | 'Social Studies'
  | 'Pashto'
  | 'Nazra Quran'
  | 'Nazra'
  | 'Drawing'
  | 'Pak Study';

export interface BooksDemandItem {
  id: string;
  classId: string;
  className: string;
  subject: string;
  bookType?: 'New' | 'Old';
  bookCategory?: 'New' | 'Old';
  demanded?: number;
  received?: number;
  demandedQty?: number;
  receivedQty?: number;
  distributedQty?: number;
  academicYear?: string;
  date?: string;
  demandDate?: string;
  receivingDate?: string;
  challanNo?: string;
  remarks?: string;
}

export type BookDemandItem = BooksDemandItem;

// Basic Facilities
export interface BasicFacilities {
  roomsCount: number;
  toiletsCount: number;
  hasWater: boolean;
  hasElectricity: boolean;
  hasSolarPlant: boolean;
  notes?: string;
  lastUpdated: string;
}

// Enrolment
export interface DailyEnrolmentEntry {
  id: string;
  date: string; // YYYY-MM-DD
  classId: string;
  className: string;
  dropoutCount: number;     // D
  govtSchoolCount: number;  // G
  privateSchoolCount: number; // P
  freshCount: number;       // F
  totalEnrolment: number;
  remarks?: string;
  createdAt: string;
}

// 13-row Monthly Enrolment Register
export interface MonthlyEnrolmentRow {
  monthIndex: number; // 0 to 12 (0 = April ... 11 = March, 12 = Annual Total)
  monthNameEn: string;
  monthNameUr: string;
  totalEnrolment: number;
  struckUp: number;     // خارج شدہ
  certificateIssued: number; // سکول چھوڑنے کا سرٹیفکیٹ
  newAdmitted: number;  // نئے داخل شدہ
  remarks?: string;
}

// Classwise Enrolment Breakdown (D, G, P, F)
export interface ClassEnrolmentBreakdown {
  classId: string;
  className: string;
  urduName: string;
  fresh: number;        // F
  govtSchool: number;   // G
  privateSchool: number;// P
  dropout: number;      // D
  totalEnrolment: number;
}

// PART 12: Certificate Issue Record
export interface CertificateIssueRecord {
  id: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  admissionNo: string;
  rollNo: string;
  classId: string;
  className: string;
  dob?: string;
  admissionDate?: string;
  certificateIssue?: 'Yes' | 'No';
  certificateIssued?: 'Yes' | 'No';
  certificateType: 'Original' | 'Duplicate';
  classStatus: 'Promoted' | 'Fail' | 'Migration' | 'Death';
  withdrawalDate: string;
  issueDate: string;
  remarks: string;
  createdAt?: string;
}

// PART 13: Struck Off Record
export interface StruckOffRecord {
  id: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  admissionNo: string;
  rollNo: string;
  classId: string;
  className: string;
  struckOffDate: string;
  remarks: string;
  isRestored?: boolean;
  createdAt?: string;
}

// PART 17: Semester Examination Paper Generator
export type ExamQuestionCategory =
  | 'Short Questions'
  | 'Detailed Questions'
  | 'Words and Meanings'
  | 'Singular and Plural'
  | 'Antonyms'
  | 'Masculine and Feminine'
  | 'Story Writing'
  | 'Application Writing'
  | 'Essay Writing';

export interface ExamQuestionItem {
  id: string;
  questionNumber?: number;
  category: ExamQuestionCategory;
  text?: string;
  questionText?: string;
  urduText?: string;
  marks: number;
  subItems?: string[]; // e.g., words for meanings/antonyms/singular-plural
}

export interface SemesterExamPaper {
  id: string;
  semester: '1st Semester' | '2nd Semester' | '1st Semester Exam' | '2nd Semester Exam' | string;
  classId: string;
  className: string;
  subject: string;
  studentNamePlaceholder?: string;
  studentNameField?: string;
  examDate: string;
  timeAllowed?: string;
  instructions?: string;
  languageMode?: 'en' | 'ur' | 'bilingual';
  isUrduRtl?: boolean;
  questions: ExamQuestionItem[];
  totalMarks: number;
  updatedAt?: string;
  createdAt?: string;
}

// PART 20: Profile & Complete Customization
export interface CustomCardNameConfig {
  en?: string;
  ur?: string;
  desc?: string;
}

export interface CustomThemePreset {
  id: string;
  name: string;
  headerBgColor: string;
  homeBgColor: string;
  appBgColor: string;
  navBgColor?: string;
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  cardColors?: Record<string, string>;
}

export interface CustomCardAdvancedConfig {
  colorMode?: 'solid' | 'gradient2' | 'gradient3';
  solidColor?: string;
  gradientFrom?: string;
  gradientMid?: string;
  gradientTo?: string;
  gradientType?: 'linear' | 'radial';
  gradientAngle?: number; // 0 to 360 deg
  cardOpacity?: number; // 20 to 100 (%)
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  // Card Picture / Image Background (Part 3D)
  pictureUrl?: string;
  pictureFit?: 'cover' | 'contain' | 'fill';
  picturePosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
  pictureOpacity?: number; // 10 to 100 (%)
  overlayColor?: string;
  overlayOpacity?: number; // 0 to 90 (%)
  // Card Icon Advanced Styling (Part 3I)
  iconBgColor?: string;
  iconBgOpacity?: number; // 0 to 100 (%)
  iconAlignment?: 'left' | 'center' | 'right';
  customIconSize?: number; // 14 to 42 px
}

export interface HomeWallpaperConfig {
  url?: string;
  targetMode?: 'home_screen' | 'all_cards' | 'selected_cards';
  selectedCardKeys?: string[];
  blur?: number; // 0 to 20 px
  brightness?: number; // 50 to 150 (%)
  opacity?: number; // 10 to 100 (%)
  fit?: 'cover' | 'contain';
  overlayColor?: string;
  overlayOpacity?: number; // 0 to 85 (%)
}

export type HomeBottomButtonId = 'storage' | 'move_card' | 'view_mode' | 'customize';

export interface HomeBottomButtonConfig {
  id: HomeBottomButtonId;
  labelEn: string;
  labelUr: string;
  bgColor: string;
  gradientTo?: string;
  useGradient?: boolean;
  textColor: string;
  iconName?: string;
  customIconUrl?: string;
  size?: 'compact' | 'normal' | 'large';
  borderRadius?: number;
  showLabel?: boolean;
}

export type SupportedFileFormatKey =
  | 'PDF'
  | 'DOC'
  | 'DOCX'
  | 'XLS'
  | 'XLSX'
  | 'PPT'
  | 'PPTX'
  | 'JPG'
  | 'JPEG'
  | 'PNG'
  | 'WEBP'
  | 'TXT'
  | 'MP4'
  | 'MP3'
  | 'ZIP'
  | 'RAR';

export interface AppCustomizationSettings {
  appName: string;
  appSubtitle: string;
  schoolLogoUrl?: string;
  customLogoDataUrl?: string;
  teacherProfilePhotoUrl?: string;
  headerBgColor: string;
  headerCompact: boolean;
  homeWallpaperUrl?: string;
  homeBgColor: string;
  appWallpaperUrl?: string;
  appBgColor: string;
  cardBorderRadius: number; // e.g. 16 (px)
  cardSize: 'compact' | 'standard' | 'normal' | 'spacious';
  cardSpacing?: number; // gap in px (6 to 24)
  homeViewMode?: 'grid' | 'list';
  iconSize: number; // e.g. 22 (px)
  themeMode?: 'light' | 'dark' | 'emerald' | 'royal' | 'custom';
  navBgColor?: string;
  primaryAccentColor?: string;
  secondaryAccentColor?: string;
  globalTextColor?: string;
  buttonBgColor?: string;
  cardBorderWidth?: number; // 0 to 4 px
  cardShadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  dashboardColumns?: 1 | 2 | 3 | 4;
  homeCardOrder?: string[];
  otherCardOrder?: string[];
  cardCustomNames?: Record<string, CustomCardNameConfig>;
  cardGradientToColors?: Record<string, string>;
  cardBorderColors?: Record<string, string>;
  cardTextColors?: Record<string, string>;
  cardIconColors?: Record<string, string>;
  cardBuiltInIcons?: Record<string, string>;
  cardAdvancedConfigs?: Record<string, CustomCardAdvancedConfig>;
  wallpaperConfig?: HomeWallpaperConfig;
  homeBottomButtonsOrder?: HomeBottomButtonId[];
  homeBottomButtonsConfig?: Record<HomeBottomButtonId, HomeBottomButtonConfig>;
  fileFormatIcons?: Partial<Record<SupportedFileFormatKey, string>>;
  customThemes?: CustomThemePreset[];
  cardColors: {
    admission: string;
    qr_scanner: string;
    staff: string;
    gallery: string;
    videos: string;
    books: string;
    guides: string;
    other: string;
    [key: string]: string;
  };
  customIcons: {
    [key: string]: string; // key -> dataUrl of custom uploaded icon
  };
  aboutPdfDataUrl?: string;
  aboutPdfUrl?: string;
  aboutSocialLinks: {
    facebook: string;
    youtube: string;
    whatsapp: string;
    twitter: string;
    website: string;
    email: string;
  };
}

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  category:
    | 'admission'
    | 'attendance'
    | 'books'
    | 'finance'
    | 'exam'
    | 'system'
    | 'Academic'
    | 'Administrative'
    | 'PTC & Finance'
    | 'General'
    | string;
  date: string;
  isRead?: boolean;
  read?: boolean;
  targetScreen?: ActiveScreen;
}

export type ActiveScreen =
  | 'home'
  | 'search'
  | 'notifications'
  | 'profile'
  | 'classes'
  | 'books'
  | 'guides'
  | 'videos'
  | 'other'
  | 'other_timetable'
  | 'other_results'
  | 'other_lessonplans'
  | 'other_lesson_plans'
  | 'other_attendance'
  | 'other_qr_scanner'
  | 'other_certificate'
  | 'other_struck_off'
  | 'other_exam_1'
  | 'other_exam_2'
  | 'other_books_demand'
  | 'other_office_data'
  | 'other_backup'
  | 'other_daily_diary'
  | 'other_ai'
  | 'ssr'
  | 'admission'
  | 'staff'
  | 'gallery'
  | 'ptc_fund'
  | 'office'
  | 'books_demand'
  | 'backup_restore'
  | 'settings';

export interface StudentDailyDiaryItem {
  id: string;
  classId: string;
  className: string;
  date: string; // YYYY-MM-DD
  subject: string;
  classworkActivity: string; // تدریسی سرگرمی / کلاس ورک
  homeworkTask: string; // ہوم ورک / دیا گیا کام
  dueDate?: string;
  teacherName?: string;
  specialInstructions?: string; // والدین کے لیے ہدایات
  urgentNotice?: boolean;
  parentNotified?: boolean;
  createdAt?: string;
}

export type TeacherAttendanceStatus = 'Present' | 'Absent' | 'Leave' | 'On-Duty' | 'Late';

export interface TeacherAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  dayName: string; // e.g., 'Tuesday'
  monthLabel?: string;
  dayNumber?: number;
  isSynced?: boolean;
  statusMap: Record<string, TeacherAttendanceStatus>;
  notes?: Record<string, string>;
  timeIn?: Record<string, string>;
  updatedAt?: string;
}

// PART 1: HIRS CV Data Structure (Reference Image 029)
export interface HirsCvEducationRow {
  id: string;
  collegeUniversity: string;
  academic: string;
  totalMarks: number;
  obtainedMarks: number;
  percentage: string;
  regularPrivate: 'REGULAR' | 'PRIVATE';
  sessionYear: string;
}

export interface HirsCvPostingRow {
  id: string;
  officeSchool: string;
  designation: string;
  fromDate: string;
  toDate: string;
  status: string;
  placementType: string;
  postingType: string;
  notification: string;
}

export interface HirsCvBpsRow {
  id: string;
  bps: string;
  fromDate: string;
  toDate: string;
  status: string;
  remarks: string;
  notification: string;
  jobType: string;
}

export interface HirsCvData {
  // Calligraphy Title & Portrait
  calligraphyTitle: string;
  fullName: string;
  designation: string;
  bps: string;
  portraitUrl: string;

  // Left Column: Profile
  fatherName: string;
  cnic: string;
  personalNo: string;
  gender: string;
  domicile: string;
  station: string;
  designationLong: string;
  lastPostDate: string;
  covidVaccination: string;

  // Left Column: Contact & Social
  mobile1: string;
  mobile2: string;
  email: string;
  socialHandle: string;

  // Right Column: Basic Info
  dob: string;
  dateOfEntry: string;
  mobileBasic: string;
  maritalStatus: string;
  bloodGroup: string;
  motherTongue: string;
  passportNo: string;
  unionCouncil: string;
  religion: string;
  domicileBasic: string;
  initialRecruitment: string;
  permanentAddress: string;

  // Tables
  educationQualifications: HirsCvEducationRow[];
  postingTransfers: HirsCvPostingRow[];
  bpsJobTypes: HirsCvBpsRow[];

  // Cadre Group
  cadreTeaching: string;
  cadreDesignation: string;
  cadreBps: string;
  cadreFromDate: string;
  cadreToDate: string;
  cadreStates: string;
  cadreSeniorityNo: string;

  // Bank Detail
  accountTitle: string;
  bankName: string;
  bankCode: string;
  accountNo: string;
  iban: string;
  bankAddress: string;
  bankStatus: string;
}

// PART 1.5: School About (Reference Image 022 + Full Editable School About Me)
export interface SchoolAboutData {
  schoolFullTitle?: string;
  schoolName: string;
  emisCode: string;
  approvalStatus: string;
  ddoCode: string;
  schoolLevel: string;
  circleName: string;
  na: string;
  pk: string;
  xPoint: string;
  yPoint: string;
  updatedBy: string;
  dateTime: string;

  department: string;
  directorate: string;
  subOffice: string;
  type: string;
  officeSchoolGender: string;
  ownership: string;
  country: string;
  province: string;
  division: string;
  district: string;
  tehsil: string;
  unionCouncil: string;
  instructionMedium: string;
  urbanRural: string;
  weatherZone: string;
  phoneNo: string;
  sosNo: string;
  faxNo: string;
  email: string;
  villageName: string;
  mohallaName: string;
  postOffice: string;

  // Extended Narrative & Contact Fields (Part 3)
  schoolAddress?: string;
  contactInformation?: string;
  schoolIntroduction?: string;
  schoolHistory?: string;
  schoolVision?: string;
  schoolMission?: string;
  schoolFacilities?: string;
  educationalActivities?: string;
  schoolAchievements?: string;

  // 4 Official Remaining Social Media / Portal Links (Instagram, LinkedIn, Twitter/X removed)
  facebookUrl: string;
  facebookLabel?: string;
  youtubeUrl: string;
  youtubeLabel?: string;
  whatsappUrl: string;
  whatsappLabel?: string;
  iemisUrl: string;
  iemisLabel?: string;
}

// PART 1.7: Official Signatures & Stamp
export interface OfficialSignaturesAndStamp {
  signature1Url: string;
  signature2Url: string;
  officialStampUrl: string;
  lastUpdated?: string;
}

// PART 2 & 3: WhatsApp Settings & Notifications
export interface WhatsAppParentEntry {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  parentName: string;
  phone: string;
}

export interface WhatsAppNotificationLog {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  type: 'IN' | 'OUT' | 'GENERAL' | 'NOTICE';
  timestamp: string;
  date: string;
  time: string;
  status: 'Sent' | 'Delivered' | 'Queued' | 'Failed';
  phone: string;
  message: string;
  channel: 'WhatsApp' | 'SMS';
}

export interface WhatsAppSettings {
  autoNotifyOnIn: boolean;
  autoNotifyOnOut: boolean;
  enableSmsFallback: boolean;
  parents: WhatsAppParentEntry[];
  templates: {
    studentIn: string;
    studentOut: string;
    general: string;
  };
  logs: WhatsAppNotificationLog[];
}

// PART 3: Mobile Storage Folder System
export type GpsModuleFolder =
  | 'Admission'
  | 'PTC Fund'
  | 'Staff Data'
  | 'Gallery'
  | 'Videos'
  | 'Books & Guides'
  | 'AI Teaching Suite'
  | 'SSR'
  | 'Other Data'
  | 'Daily Attendance'
  | 'Office Data'
  | 'Class'
  | 'Examination'
  | 'Certificate Issue'
  | 'Lesson Plans'
  | 'Backup & Restore'
  | 'My Digital Card'
  | 'My HIRS CV'
  | 'My Service Book'
  | 'ECE Order & Notification'
  | 'Official Signatures & Stamp';

// PART 12: PTC Categorized Financial System
export interface PtcGrantCategory {
  allocated: number;
  spent: number;
  balance: number;
}

export interface PtcFundTransaction {
  id: string;
  category: 'capitation' | 'consumable' | 'repair';
  type: 'expense' | 'receipt';
  date: string;
  description: string;
  amount: number;
  billAttachmentUrl?: string;
  billAttachmentName?: string;
  createdAt: string;
}

export interface PtcCategorizedFundData {
  allFund: {
    totalReceived: number;
    financialYear: string;
    receiptDate: string;
    description: string;
  };
  categories: {
    capitation: PtcGrantCategory;
    consumable: PtcGrantCategory;
    repair: PtcGrantCategory;
  };
  transactions: PtcFundTransaction[];
}

// PART 18: Student Attendance Monthly Statistics & Register
export interface StudentMonthlyAttendanceStats {
  studentsBeginningMonth: number;
  studentsEndMonth: number;
  totalAttendanceDuringMonth: number;
  dailyAverageAttendance: number;
  schoolTimingDuringMonth: string;
  totalSchoolTimingsStartSession: string;
}


