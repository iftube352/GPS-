import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  BookOpen,
  Award,
  Calendar,
  ArrowLeft,
  Printer,
  Search,
  UserCheck,
  FileText,
  Download,
  Camera,
  FolderOpen,
  Share2,
} from 'lucide-react';
import {
  Student,
  Staff,
  BookguideItem,
  ExamResult,
  AttendanceRecord,
  ActiveScreen,
} from '../../types';
import { StorageService } from '../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  OfficialClassMeta,
  getSubjectsForClass,
  ADMISSION_CATEGORY_META,
} from '../../utils/classColors';
import {
  printHtmlDocument,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  readFileAsDataUrl,
  shareDocumentOrFile,
} from '../../services/printAndFileService';
import { StorageFolderService, StoredFileRecord } from '../../services/storageFolderService';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface ClassModuleProps {
  lang: 'en' | 'ur';
  onNavigate?: (screen: ActiveScreen) => void;
}

export const ClassModule: React.FC<ClassModuleProps> = ({ lang, onNavigate }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [books, setBooks] = useState<BookguideItem[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedClass, setSelectedClass] = useState<OfficialClassMeta | null>(null);
  const [activeTab, setActiveTab] = useState<'students' | 'books' | 'results' | 'info'>('students');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useViewMode('class_module', 'grid');
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [classFiles, setClassFiles] = useState<StoredFileRecord[]>([]);
  const classPhotoInputRef = useRef<HTMLInputElement>(null);
  const [studentPhotoTargetId, setStudentPhotoTargetId] = useState<string | null>(null);
  const studentPhotoInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  const refreshData = () => {
    setStudents(StorageService.getStudents());
    setStaff(StorageService.getStaff());
    setBooks(StorageService.getBooks());
    setResults(StorageService.getResults());
    setAttendance(StorageService.getAttendance());
  };

  useEffect(() => {
    refreshData();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      const folderName = StorageFolderService.mapClassIdToFolderName(selectedClass.id);
      setClassFiles(StorageFolderService.getFilesInFolder(`Class/${folderName}`));
    }
  }, [selectedClass]);

  const getClassStudents = (cls: OfficialClassMeta) => {
    return students.filter((s) => {
      const c = (s.classId || '').toLowerCase();
      if (cls.id === 'c-kachi') return c.includes('kachi') || c.includes('kg') || c.includes('ece');
      if (cls.id === 'c-1') return c === 'c-1' || c.includes('1st') || c.includes('class 1');
      if (cls.id === 'c-2') return c === 'c-2' || c.includes('2nd') || c.includes('class 2');
      if (cls.id === 'c-3') return c === 'c-3' || c.includes('3rd') || c.includes('class 3');
      if (cls.id === 'c-4') return c === 'c-4' || c.includes('4th') || c.includes('class 4');
      if (cls.id === 'c-5') return c === 'c-5' || c.includes('5th') || c.includes('class 5');
      return s.classId === cls.id;
    });
  };

  const getClassTeacher = (cls: OfficialClassMeta) => {
    return staff.find((st) => st.classTeacherOf === cls.id);
  };

  const buildClassRegisterHtml = (cls: OfficialClassMeta) => {
    const clsStudents = getClassStudents(cls);
    const teacher = getClassTeacher(cls);
    const officialSubjects = getSubjectsForClass(cls.kpSubjectDropdownLabel);

    const rowsHtml = clsStudents
      .map(
        (s, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${s.rollNo || idx + 1}</strong></td>
          <td>${s.admissionNo}</td>
          <td><strong>${s.name}</strong></td>
          <td>${s.fatherName}</td>
          <td>${s.admissionCategory || 'F'}</td>
          <td>${s.admissionDate || '-'}</td>
          <td>${s.contactNo || '-'}</td>
        </tr>
      `
      )
      .join('');

    return `
      <div class="badge" style="background:${cls.hex};color:#fff;border:none;padding:6px 12px;border-radius:8px;display:inline-block;margin-bottom:8px;font-weight:bold;">
        ${cls.badgeNumber} • ${cls.displayName} (${cls.urduName}) — GPS Chambai Kohat (EMIS: 16454)
      </div>
      <p style="margin-bottom:10px;font-size:12px;">
        <strong>Class Teacher:</strong> ${teacher ? `${teacher.name} (${teacher.designation})` : 'Not Assigned'} &nbsp;|&nbsp;
        <strong>Total Enrolled Students:</strong> ${clsStudents.length} &nbsp;|&nbsp;
        <strong>Official Subjects:</strong> ${officialSubjects.map((b) => b.english).join(', ')}
      </p>
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Roll No</th>
            <th>Adm No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Cat (D/G/P/F)</th>
            <th>Admission Date</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml || '<tr><td colspan="8" style="text-align:center;">No students enrolled in this class</td></tr>'}
        </tbody>
      </table>
    `;
  };

  const handlePrintClassSummary = (cls: OfficialClassMeta) => {
    printHtmlDocument(`${cls.displayName} - Class Register`, buildClassRegisterHtml(cls));
  };

  const handleExportClassPdf = async (cls: OfficialClassMeta) => {
    const clsStudents = getClassStudents(cls);
    const folderName = StorageFolderService.mapClassIdToFolderName(cls.id);
    await exportAndSaveRealPdf(
      `${cls.displayName} - Class Student Register`,
      ['#', 'Roll No', 'Adm No', 'Student Name', 'Father Name', 'Category', 'Adm Date', 'Contact'],
      clsStudents.map((s, idx) => [
        String(idx + 1),
        String(s.rollNo || idx + 1),
        s.admissionNo,
        s.name,
        s.fatherName,
        s.admissionCategory || 'F',
        s.admissionDate || '-',
        s.contactNo || '-',
      ]),
      `${cls.displayName.replace(/\s+/g, '_')}_Register.pdf`,
      `Class/${folderName}`
    );
    setClassFiles(StorageFolderService.getFilesInFolder(`Class/${folderName}`));
    showToast(`Saved PDF to GPS Chambai/Class/${folderName}/`);
  };

  const handleExportClassDoc = async (cls: OfficialClassMeta) => {
    const folderName = StorageFolderService.mapClassIdToFolderName(cls.id);
    await exportAndSaveWordDoc(
      `${cls.displayName} - Class Student Register`,
      buildClassRegisterHtml(cls),
      `${cls.displayName.replace(/\s+/g, '_')}_Register.doc`,
      `Class/${folderName}`
    );
    setClassFiles(StorageFolderService.getFilesInFolder(`Class/${folderName}`));
    showToast(`Saved Word Doc to GPS Chambai/Class/${folderName}/`);
  };

  const handleUploadClassPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedClass) return;
    const folderName = StorageFolderService.mapClassIdToFolderName(selectedClass.id);
    await readFileAsDataUrl(file, `Class/${folderName}`);
    setClassFiles(StorageFolderService.getFilesInFolder(`Class/${folderName}`));
    showToast(`Uploaded "${file.name}" to GPS Chambai/Class/${folderName}/`);
    e.target.value = '';
  };

  const handleUpdateStudentPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !studentPhotoTargetId || !selectedClass) return;
    const folderName = StorageFolderService.mapClassIdToFolderName(selectedClass.id);
    const res = await readFileAsDataUrl(file, `Admission/Students Photos/${folderName}`);
    const targetStudent = students.find((s) => s.id === studentPhotoTargetId);
    if (targetStudent) {
      StorageService.updateStudent({ ...targetStudent, photoUrl: res.dataUrl });
      refreshData();
      showToast(`Updated photo for ${targetStudent.name}`);
    }
    setStudentPhotoTargetId(null);
    e.target.value = '';
  };

  // Class Detail Screen when a class card is selected
  if (selectedClass) {
    const classStudents = getClassStudents(selectedClass).filter(
      (s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase())
    );
    const classBooks = books.filter(
      (b) => b.classId === selectedClass.id || b.className.toLowerCase().includes(selectedClass.shortCode.toLowerCase())
    );
    const officialSubjects = getSubjectsForClass(selectedClass.kpSubjectDropdownLabel);
    const classResults = results.filter((r) => r.classId === selectedClass.id);
    const teacher = getClassTeacher(selectedClass);
    const folderName = StorageFolderService.mapClassIdToFolderName(selectedClass.id);

    return (
      <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
        {statusToast && (
          <div className="fixed bottom-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-xl border border-emerald-500/40">
            {statusToast}
          </div>
        )}

        <input
          ref={classPhotoInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.doc,.docx"
          onChange={handleUploadClassPhoto}
          className="hidden"
        />
        <input
          ref={studentPhotoInputRef}
          type="file"
          accept=".jpg,.jpeg,.png,.webp"
          onChange={handleUpdateStudentPhoto}
          className="hidden"
        />

        {/* Colored Class Banner */}
        <div
          className="rounded-3xl p-4 text-white shadow-lg relative overflow-hidden"
          style={{ backgroundColor: selectedClass.hex }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedClass(null)}
                className="w-9 h-9 rounded-xl bg-black/20 hover:bg-black/30 flex items-center justify-center text-white transition-all active:scale-95"
              >
                <ArrowLeft size={18} />
              </button>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-full">
                  Class {selectedClass.badgeNumber} • GPS Chambai/{folderName}
                </span>
                <h2 className="text-xl font-black tracking-tight mt-0.5">
                  {selectedClass.displayName} ({selectedClass.urduName})
                </h2>
                <p className="text-xs font-semibold opacity-95">
                  Teacher: {teacher ? `${teacher.name} (${teacher.designation})` : 'Unassigned'} •{' '}
                  {getClassStudents(selectedClass).length} Students
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <ViewModeToggle mode={viewMode} onChange={setViewMode} dark />
              <button
                onClick={() => classPhotoInputRef.current?.click()}
                className="px-2.5 py-2 rounded-xl bg-black/25 hover:bg-black/35 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
              >
                <Camera size={13} />
                <span>Upload Class Photo</span>
              </button>
              <button
                onClick={() => handlePrintClassSummary(selectedClass)}
                className="px-2.5 py-2 rounded-xl bg-white text-slate-900 text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95"
              >
                <Printer size={13} />
                <span>Print</span>
              </button>
              <button
                onClick={() => handleExportClassPdf(selectedClass)}
                className="px-2.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95"
              >
                <Download size={13} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => handleExportClassDoc(selectedClass)}
                className="px-2.5 py-2 rounded-xl bg-sky-100 text-sky-950 text-[11px] font-black flex items-center gap-1 shadow-md active:scale-95"
              >
                <FileText size={13} />
                <span>DOC</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sub-navigation Tabs: Students, Books, Results, Related Info */}
        <div className="grid grid-cols-4 gap-1.5 bg-slate-200/80 p-1.5 rounded-2xl">
          {[
            { id: 'students', label: `Students (${getClassStudents(selectedClass).length})`, icon: Users },
            { id: 'books', label: `Books (${officialSubjects.length})`, icon: BookOpen },
            { id: 'results', label: `Results (${classResults.length})`, icon: Award },
            { id: 'info', label: `Files (${classFiles.length}) & Info`, icon: FolderOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                style={active ? { backgroundColor: selectedClass.hex, color: '#FFFFFF' } : undefined}
                className={`py-2 px-2 rounded-xl text-[11px] font-black flex flex-col sm:flex-row items-center justify-center gap-1 transition-all ${
                  active ? 'shadow-sm' : 'text-slate-700 hover:bg-white/60'
                }`}
              >
                <Icon size={14} />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: STUDENTS */}
        {activeTab === 'students' && (
          <div className="space-y-3">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search student in this class by name, roll no, or admission no..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {classStudents.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-500">No students found in {selectedClass.displayName}.</p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('admission')}
                    className="mt-3 px-4 py-2 rounded-xl text-white text-xs font-black"
                    style={{ backgroundColor: selectedClass.hex }}
                  >
                    Go to Admission Module
                  </button>
                )}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
                {classStudents.map((st, idx) => (
                  <div
                    key={st.id}
                    className="relative rounded-[24px] p-4 text-white shadow-md overflow-hidden flex items-center justify-between gap-3"
                    style={{ backgroundColor: selectedClass.hex }}
                  >
                    <div
                      className="absolute right-0 top-0 bottom-0 w-28 pointer-events-none"
                      style={{
                        background: 'rgba(0,0,0,0.14)',
                        borderTopLeftRadius: '90px',
                        borderBottomLeftRadius: '90px',
                      }}
                    />

                    <div className="flex items-center gap-3.5 min-w-0 z-10">
                      <div className="relative shrink-0">
                        <img
                          src={st.photoUrl}
                          alt={st.name}
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setStudentPhotoTargetId(st.id);
                            studentPhotoInputRef.current?.click();
                          }}
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border border-white shadow-xs"
                          title="Change Student Photo"
                        >
                          <Camera size={11} />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-base font-black leading-tight truncate">{st.name}</h4>
                        <p className="text-xs font-semibold opacity-95 truncate">
                          S/O: {st.fatherName} •{' '}
                          {st.admissionCategory ? ADMISSION_CATEGORY_META[st.admissionCategory]?.fullLabel : 'F — Fresh'}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-[11px]">
                          <div>
                            <div className="font-black">{st.admissionNo}</div>
                            <div className="text-[9px] opacity-85">Adm No</div>
                          </div>
                          <div>
                            <div className="font-black">{st.rollNo || idx + 1}</div>
                            <div className="text-[9px] opacity-85">Roll No</div>
                          </div>
                          <div>
                            <div className="font-black">{st.admissionDate}</div>
                            <div className="text-[9px] opacity-85">Adm Date</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 text-center shrink-0 w-20">
                      <div className="text-xl font-black leading-none">{st.rollNo || idx + 1}</div>
                      <div className="text-[10px] font-bold opacity-90 mt-1">{selectedClass.shortCode}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BOOKS & KP OFFICIAL SUBJECTS */}
        {activeTab === 'books' && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                Official KP Textbook Board Subjects for {selectedClass.kpSubjectDropdownLabel}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {officialSubjects.map((sub, i) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50"
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-7 h-7 rounded-lg text-white text-xs font-black flex items-center justify-center"
                        style={{ backgroundColor: selectedClass.hex }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <div className="text-xs font-black text-slate-800">{sub.english}</div>
                        <div className="text-[11px] font-urdu text-slate-600">{sub.urdu}</div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      KP Official
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5">
                Uploaded PDF Books & Guides ({classBooks.length})
              </h4>
              {classBooks.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold">
                  No custom PDF books uploaded for this class yet. Open the Books & Guides module to upload files.
                </p>
              ) : (
                <div className="space-y-2">
                  {classBooks.map((bk) => (
                    <div
                      key={bk.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-2.5">
                        <FileText size={18} style={{ color: selectedClass.hex }} />
                        <div>
                          <div className="text-xs font-black text-slate-800">{bk.title}</div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {bk.subject} • {bk.fileSize} • {bk.pages} pages
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: RESULTS */}
        {activeTab === 'results' && (
          <div className="space-y-3">
            {classResults.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
                <p className="text-xs font-bold text-slate-500">No exam result records saved for this class yet.</p>
                {onNavigate && (
                  <button
                    onClick={() => onNavigate('other_results')}
                    className="mt-3 px-4 py-2 rounded-xl text-white text-xs font-black"
                    style={{ backgroundColor: selectedClass.hex }}
                  >
                    Open Result Module
                  </button>
                )}
              </div>
            ) : (
              classResults.map((res) => (
                <div
                  key={res.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-black text-slate-900">{res.studentName}</div>
                    <div className="text-xs text-slate-500 font-semibold">
                      Roll No: {res.rollNo} • {res.examTerm} ({res.academicYear})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black" style={{ color: selectedClass.hex }}>
                      {res.obtainedMarks} / {res.totalMarks} ({res.percentage}%)
                    </div>
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
                      Grade {res.grade} • Pos #{res.positionInClass}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 4: RELATED INFORMATION & UPLOADED CLASS FILES */}
        {activeTab === 'info' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <UserCheck size={20} style={{ color: selectedClass.hex }} />
              <div>
                <div className="text-[11px] font-bold text-slate-500">Assigned Class Teacher</div>
                <div className="text-sm font-black text-slate-900">
                  {teacher ? `${teacher.name} (${teacher.designation})` : 'No Teacher Assigned'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-black" style={{ color: selectedClass.hex }}>
                  {getClassStudents(selectedClass).length}
                </div>
                <div className="text-[11px] font-bold text-slate-500">Enrolled Students</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-lg font-black" style={{ color: selectedClass.hex }}>
                  {attendance.filter((a) => a.classId === selectedClass.id).length}
                </div>
                <div className="text-[11px] font-bold text-slate-500">Attendance Logs</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-black text-slate-700">
                  Saved Class Photos & Documents (GPS Chambai/Class/{folderName})
                </h4>
                <button
                  onClick={() => classPhotoInputRef.current?.click()}
                  className="text-[11px] font-black text-emerald-700 hover:underline"
                >
                  + Upload Photo / PDF
                </button>
              </div>
              {classFiles.length === 0 ? (
                <p className="text-xs text-slate-500 font-semibold">
                  No class files saved in GPS Chambai/Class/{folderName} yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {classFiles.map((cf) => (
                    <div
                      key={cf.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="truncate pr-2">
                        <div className="font-black text-slate-800 truncate">{cf.fileName}</div>
                        <div className="text-[10px] text-slate-500 font-semibold">
                          {StorageFolderService.formatFileSize(cf.fileSize)} • {cf.createdAt.split('T')[0]}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          const dataUrl = await StorageFolderService.getFileDataUrl(cf.id);
                          if (dataUrl) {
                            await shareDocumentOrFile({
                              title: cf.fileName,
                              text: `${selectedClass.displayName} File`,
                              fileName: cf.fileName,
                              dataUrl,
                              mimeType: cf.mimeType,
                            });
                          }
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 text-white text-[10px] font-black flex items-center gap-1 shrink-0"
                      >
                        <Share2 size={11} />
                        <span>Share</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // MAIN 6-CLASS GRID OR LIST FOLLOWING IMAGE 003 AND IMAGE 004 EXACT HEX COLORS
  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h2 className="text-base font-black text-slate-900 tracking-tight">
            {lang === 'ur' ? 'کلاسز اور شعبہ جات' : 'School Classes (KG to Class 5)'}
          </h2>
          <p className="text-[11px] text-slate-500 font-semibold">
            Tap any class card to inspect its Students, Books, Results, and Class Teacher
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-900 text-white">
            6 Official Classes
          </span>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="space-y-2.5">
          {OFFICIAL_SIX_CLASSES.map((cls) => {
            const clsStudents = getClassStudents(cls);
            const teacher = getClassTeacher(cls);
            const subjectsCount = getSubjectsForClass(cls.kpSubjectDropdownLabel).length;

            return (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  setActiveTab('students');
                }}
                className="w-full bg-[#252530] rounded-2xl p-4 text-left shadow-md hover:shadow-lg transition-all flex items-center justify-between gap-3 border border-slate-800"
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center font-black text-slate-900 shrink-0"
                    style={{ border: `4px solid ${cls.hex}` }}
                  >
                    {cls.badgeNumber}
                  </div>
                  <div>
                    <h3 className="text-base font-black" style={{ color: cls.hex }}>
                      {cls.displayName} ({cls.urduName})
                    </h3>
                    <p className="text-xs text-slate-300 font-semibold">
                      {clsStudents.length} Students • {subjectsCount} Subjects •{' '}
                      {teacher ? teacher.name : 'Unassigned'}
                    </p>
                  </div>
                </div>
                <span
                  className="px-3 py-1 rounded-full text-[10px] font-black text-white shrink-0"
                  style={{ backgroundColor: cls.hex }}
                >
                  Open Class
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-3.5 gap-y-7 pt-4">
          {OFFICIAL_SIX_CLASSES.map((cls) => {
            const clsStudents = getClassStudents(cls);
            const teacher = getClassTeacher(cls);
            const subjectsCount = getSubjectsForClass(cls.kpSubjectDropdownLabel).length;

            return (
              <button
                key={cls.id}
                onClick={() => {
                  setSelectedClass(cls);
                  setActiveTab('students');
                }}
                className="group relative bg-[#252530] rounded-[22px] pt-12 pb-4 px-3.5 text-center shadow-xl hover:-translate-y-1 active:scale-95 transition-all duration-200 flex flex-col items-center justify-between min-h-[210px] border border-slate-800"
              >
                <div className="absolute top-0 left-0 right-0 h-14 overflow-hidden rounded-t-[22px] pointer-events-none">
                  <svg viewBox="0 0 200 70" className="w-full h-full" preserveAspectRatio="none">
                    <path
                      d="M0,0 L200,0 L200,45 Q150,28 100,52 Q50,28 0,45 Z"
                      fill={cls.hex}
                    />
                  </svg>
                </div>

                <div
                  className="absolute -top-4 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg z-10 group-hover:scale-105 transition-transform"
                  style={{
                    border: `5px solid ${cls.hex}`,
                  }}
                >
                  <span className="text-lg font-black text-slate-900 tracking-tight">
                    {cls.badgeNumber}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2" style={{ color: cls.hex }}>
                  <span className="w-2.5 h-[1.5px] opacity-70" style={{ backgroundColor: cls.hex }} />
                  <Users size={22} strokeWidth={2.2} />
                  <span className="w-2.5 h-[1.5px] opacity-70" style={{ backgroundColor: cls.hex }} />
                </div>

                <div className="mt-2 space-y-1 w-full">
                  <h3
                    className="text-sm sm:text-base font-black tracking-tight leading-tight truncate"
                    style={{ color: cls.hex }}
                  >
                    {cls.displayName}
                  </h3>
                  <div className="text-xs font-urdu text-slate-300">{cls.urduName}</div>
                  <p className="text-[10px] text-slate-300/90 leading-relaxed line-clamp-2 pt-1">
                    {clsStudents.length} Students • {subjectsCount} Subjects
                    <br />
                    {teacher ? teacher.name : 'View Class Records'}
                  </p>
                </div>

                <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[9px] font-bold text-white/90">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cls.hex }} />
                  <span>{cls.shortCode}</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
