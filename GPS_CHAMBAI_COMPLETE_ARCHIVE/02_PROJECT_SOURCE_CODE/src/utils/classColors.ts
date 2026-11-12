/**
 * Exact Class HEX Colors extracted from Image 004:
 * KG  -> #00B050
 * 1st -> #00B0F0
 * 2nd -> #FFC000
 * 3rd -> #FF3399
 * 4th -> #CC00CC
 * 5th -> #FF0000
 */

export const CLASS_HEX_COLORS: Record<string, string> = {
  'c-kachi': '#00B050',
  'c-nursery': '#00B050',
  'c-1': '#00B0F0',
  'c-2': '#FFC000',
  'c-3': '#FF3399',
  'c-4': '#CC00CC',
  'c-5': '#FF0000',
};

export interface OfficialClassMeta {
  id: string;
  badgeNumber: string;
  numberBadge: string;
  displayName: string;
  name: string;
  shortCode: string;
  kpSubjectDropdownLabel: string;
  dropdownLabel: string;
  urduName: string;
  gradeLevel: number;
  hex: string;
  hexColor: string;
  secondaryHex: string;
  textColorOnBg: string;
}

export type OfficialClassConfig = OfficialClassMeta;

export const OFFICIAL_SIX_CLASSES: OfficialClassMeta[] = [
  {
    id: 'c-kachi',
    badgeNumber: '01',
    numberBadge: '01',
    displayName: 'KG / Kachi (ECE)',
    name: 'KG / Kachi (ECE)',
    shortCode: 'KG / Kachi',
    kpSubjectDropdownLabel: 'Kachi — ECE',
    dropdownLabel: 'Kachi — ECE',
    urduName: 'کچی — ای سی ای',
    gradeLevel: 0,
    hex: '#00B050',
    hexColor: '#00B050',
    secondaryHex: '#008A3E',
    textColorOnBg: '#FFFFFF',
  },
  {
    id: 'c-1',
    badgeNumber: '02',
    numberBadge: '02',
    displayName: 'Class 1',
    name: 'Class 1',
    shortCode: 'Class 1',
    kpSubjectDropdownLabel: 'Awal Aala (اول اعلی)',
    dropdownLabel: 'Awal Aala (اول اعلی)',
    urduName: 'اول اعلی',
    gradeLevel: 1,
    hex: '#00B0F0',
    hexColor: '#00B0F0',
    secondaryHex: '#0088BD',
    textColorOnBg: '#FFFFFF',
  },
  {
    id: 'c-2',
    badgeNumber: '03',
    numberBadge: '03',
    displayName: 'Class 2',
    name: 'Class 2',
    shortCode: 'Class 2',
    kpSubjectDropdownLabel: 'Class 2 — دوئم',
    dropdownLabel: 'Class 2 — دوئم',
    urduName: 'جماعت دوئم',
    gradeLevel: 2,
    hex: '#FFC000',
    hexColor: '#FFC000',
    secondaryHex: '#D99B00',
    textColorOnBg: '#FFFFFF',
  },
  {
    id: 'c-3',
    badgeNumber: '04',
    numberBadge: '04',
    displayName: 'Class 3',
    name: 'Class 3',
    shortCode: 'Class 3',
    kpSubjectDropdownLabel: 'Class 3 — سوئم',
    dropdownLabel: 'Class 3 — سوئم',
    urduName: 'جماعت سوئم',
    gradeLevel: 3,
    hex: '#FF3399',
    hexColor: '#FF3399',
    secondaryHex: '#D61C78',
    textColorOnBg: '#FFFFFF',
  },
  {
    id: 'c-4',
    badgeNumber: '05',
    numberBadge: '05',
    displayName: 'Class 4',
    name: 'Class 4',
    shortCode: 'Class 4',
    kpSubjectDropdownLabel: 'Class 4 — چہارم',
    dropdownLabel: 'Class 4 — چہارم',
    urduName: 'جماعت چہارم',
    gradeLevel: 4,
    hex: '#CC00CC',
    hexColor: '#CC00CC',
    secondaryHex: '#9E009E',
    textColorOnBg: '#FFFFFF',
  },
  {
    id: 'c-5',
    badgeNumber: '06',
    numberBadge: '06',
    displayName: 'Class 5',
    name: 'Class 5',
    shortCode: 'Class 5',
    kpSubjectDropdownLabel: 'Class 5 — پنجم',
    dropdownLabel: 'Class 5 — پنجم',
    urduName: 'جماعت پنجم',
    gradeLevel: 5,
    hex: '#FF0000',
    hexColor: '#FF0000',
    secondaryHex: '#C80000',
    textColorOnBg: '#FFFFFF',
  },
];

/**
 * Resolves any classId or className string to the exact HEX color from Image 004.
 * Returns neutral slate (#475569) when no class is assigned.
 */
export function getClassHexColor(classIdOrName?: string): string {
  if (!classIdOrName) return '#475569';
  const norm = classIdOrName.toLowerCase().trim();
  if (CLASS_HEX_COLORS[norm]) return CLASS_HEX_COLORS[norm];

  if (
    norm.includes('kachi') ||
    norm.includes('kg') ||
    norm.includes('ece') ||
    norm.includes('nursery')
  ) {
    return '#00B050';
  }
  if (
    norm.includes('1') ||
    norm.includes('awal') ||
    norm.includes('first') ||
    norm.includes('1st') ||
    norm.includes('اول')
  ) {
    return '#00B0F0';
  }
  if (
    norm.includes('2') ||
    norm.includes('2nd') ||
    norm.includes('second') ||
    norm.includes('دوئم')
  ) {
    return '#FFC000';
  }
  if (
    norm.includes('3') ||
    norm.includes('3rd') ||
    norm.includes('third') ||
    norm.includes('سوئم')
  ) {
    return '#FF3399';
  }
  if (
    norm.includes('4') ||
    norm.includes('4th') ||
    norm.includes('fourth') ||
    norm.includes('چہارم')
  ) {
    return '#CC00CC';
  }
  if (
    norm.includes('5') ||
    norm.includes('5th') ||
    norm.includes('fifth') ||
    norm.includes('پنجم')
  ) {
    return '#FF0000';
  }
  return '#475569';
}

export function getClassMetaByIdOrName(classIdOrName?: string): OfficialClassMeta {
  const hex = getClassHexColor(classIdOrName);
  return OFFICIAL_SIX_CLASSES.find((c) => c.hex === hex) || OFFICIAL_SIX_CLASSES[0];
}

export const getOfficialClassConfig = getClassMetaByIdOrName;

export interface KpOfficialBookMeta {
  id: string;
  english: string;
  urdu: string;
  fullLabel: string;
}

/**
 * All 10 Official Book Dropdown Options (Part 10.2.D)
 */
export const KP_TEN_OFFICIAL_BOOKS: KpOfficialBookMeta[] = [
  { id: 'bk-urdu', english: 'Urdu', urdu: 'اردو', fullLabel: 'Urdu — اردو' },
  { id: 'bk-english', english: 'English', urdu: 'انگلش', fullLabel: 'English — انگلش' },
  { id: 'bk-maths', english: 'Mathematics', urdu: 'ریاضی', fullLabel: 'Mathematics — ریاضی' },
  {
    id: 'bk-gk',
    english: 'General Knowledge',
    urdu: 'واقفیت عامہ',
    fullLabel: 'General Knowledge — واقفیت عامہ',
  },
  { id: 'bk-islamiat', english: 'Islamiat', urdu: 'اسلامیات', fullLabel: 'Islamiat — اسلامیات' },
  { id: 'bk-pashto', english: 'Pashto', urdu: 'پشتو', fullLabel: 'Pashto — پشتو' },
  {
    id: 'bk-science',
    english: 'General Science',
    urdu: 'جنرل سائنس',
    fullLabel: 'General Science — جنرل سائنس',
  },
  {
    id: 'bk-sst',
    english: 'Social Studies',
    urdu: 'معاشرتی علوم',
    fullLabel: 'Social Studies — معاشرتی علوم',
  },
  {
    id: 'bk-nazra',
    english: 'Nazra Quran',
    urdu: 'ناظرہ قرآن',
    fullLabel: 'Nazra Quran — ناظرہ قرآن',
  },
  {
    id: 'bk-drawing',
    english: 'Drawing',
    urdu: 'ڈرائنگ',
    fullLabel: 'Drawing — ڈرائنگ',
  },
];

/**
 * Exact Class-Based Book Filtering Mapping:
 * - Kachi (ECE): No Qaida and No Nazra (Urdu, English, Mathematics, Pashto, Drawing)
 * - Class 1 to 5: Separate Nazra Quran and separate Drawing books included
 */
export const CLASS_SUBJECT_IDS_MAPPING: Record<string, string[]> = {
  'c-kachi': ['bk-urdu', 'bk-english', 'bk-maths', 'bk-pashto', 'bk-drawing'],
  'c-1': [
    'bk-urdu',
    'bk-english',
    'bk-maths',
    'bk-gk',
    'bk-islamiat',
    'bk-pashto',
    'bk-nazra',
    'bk-drawing',
  ],
  'c-2': [
    'bk-urdu',
    'bk-english',
    'bk-maths',
    'bk-gk',
    'bk-islamiat',
    'bk-pashto',
    'bk-nazra',
    'bk-drawing',
  ],
  'c-3': [
    'bk-urdu',
    'bk-english',
    'bk-maths',
    'bk-gk',
    'bk-islamiat',
    'bk-pashto',
    'bk-nazra',
    'bk-drawing',
  ],
  'c-4': [
    'bk-urdu',
    'bk-english',
    'bk-maths',
    'bk-science',
    'bk-sst',
    'bk-islamiat',
    'bk-pashto',
    'bk-nazra',
    'bk-drawing',
  ],
  'c-5': [
    'bk-urdu',
    'bk-english',
    'bk-maths',
    'bk-science',
    'bk-sst',
    'bk-islamiat',
    'bk-pashto',
    'bk-nazra',
    'bk-drawing',
  ],
};

export const CLASS_SUBJECT_MAPPING: Record<string, string[]> = {
  'c-kachi': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'Pashto — پشتو', 'Drawing — ڈرائنگ'],
  'c-1': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'General Knowledge — واقفیت عامہ', 'Islamiat — اسلامیات', 'Pashto — پشتو', 'Nazra Quran — ناظرہ قرآن', 'Drawing — ڈرائنگ'],
  'c-2': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'General Knowledge — واقفیت عامہ', 'Islamiat — اسلامیات', 'Pashto — پشتو', 'Nazra Quran — ناظرہ قرآن', 'Drawing — ڈرائنگ'],
  'c-3': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'General Knowledge — واقفیت عامہ', 'Islamiat — اسلامیات', 'Pashto — پشتو', 'Nazra Quran — ناظرہ قرآن', 'Drawing — ڈرائنگ'],
  'c-4': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'General Science — جنرل سائنس', 'Social Studies — معاشرتی علوم', 'Islamiat — اسلامیات', 'Pashto — پشتو', 'Nazra Quran — ناظرہ قرآن', 'Drawing — ڈرائنگ'],
  'c-5': ['Urdu — اردو', 'English — انگلش', 'Mathematics — ریاضی', 'General Science — جنرل سائنس', 'Social Studies — معاشرتی علوم', 'Islamiat — اسلامیات', 'Pashto — پشتو', 'Nazra Quran — ناظرہ قرآن', 'Drawing — ڈرائنگ'],
};

export function getSubjectsForClass(classIdOrDropdownLabel: string): KpOfficialBookMeta[] {
  const clsMeta = getClassMetaByIdOrName(classIdOrDropdownLabel);
  const allowedIds = CLASS_SUBJECT_IDS_MAPPING[clsMeta.id] || [];
  const filtered = KP_TEN_OFFICIAL_BOOKS.filter((b) => allowedIds.includes(b.id));
  return filtered.length > 0 ? filtered : KP_TEN_OFFICIAL_BOOKS;
}

export const ADMISSION_CATEGORY_META: Record<
  'D' | 'G' | 'P' | 'F',
  {
    code: 'D' | 'G' | 'P' | 'F';
    meaning: string;
    fullLabel: string;
    label: string;
    fullMeaning: string;
    urdu: string;
    urduMeaning: string;
  }
> = {
  D: {
    code: 'D',
    meaning: 'Dropout',
    fullLabel: 'D — Dropout',
    label: 'D — Dropout',
    fullMeaning: 'D — Dropout (Out-of-School / Returning Student)',
    urdu: 'ڈراپ آؤٹ دوبارہ داخلہ',
    urduMeaning: 'D — ڈراپ آؤٹ (تعلیم ادھوری چھوڑنے والا)',
  },
  G: {
    code: 'G',
    meaning: 'Government',
    fullLabel: 'G — Government',
    label: 'G — Government',
    fullMeaning: 'G — Government (Transferred from Govt School)',
    urdu: 'سرکاری سکول سے منتقل شدہ',
    urduMeaning: 'G — سرکاری سکول سے منتقل شدہ',
  },
  P: {
    code: 'P',
    meaning: 'Private',
    fullLabel: 'P — Private',
    label: 'P — Private',
    fullMeaning: 'P — Private (Transferred from Private School)',
    urdu: 'پرائیویٹ سکول سے منتقل شدہ',
    urduMeaning: 'P — پرائیویٹ سکول سے منتقل شدہ',
  },
  F: {
    code: 'F',
    meaning: 'Fresh',
    fullLabel: 'F — Fresh',
    label: 'F — Fresh',
    fullMeaning: 'F — Fresh (First-Time New Admission)',
    urdu: 'نیا داخلہ (فریش طالب علم)',
    urduMeaning: 'F — نیا داخلہ (فریش طالب علم)',
  },
};
