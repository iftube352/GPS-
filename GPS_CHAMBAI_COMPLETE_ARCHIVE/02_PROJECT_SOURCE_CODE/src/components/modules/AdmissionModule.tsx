import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Eye,
  Upload,
  X,
  QrCode,
  Phone,
  Calendar,
  MapPin,
  CreditCard,
  Download,
} from 'lucide-react';
import { Student, AdmissionCategoryCode } from '../../types';
import { StorageService } from '../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  getClassHexColor,
  getClassMetaByIdOrName,
  ADMISSION_CATEGORY_META,
} from '../../utils/classColors';
import {
  printHtmlDocument,
  readFileAsDataUrl,
  exportAndSaveRealPdf,
} from '../../services/printAndFileService';
import { mapClassIdToFolderName } from '../../services/storageFolderService';
import { StudentIdCard } from '../common/StudentIdCard';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface AdmissionModuleProps {
  lang: 'en' | 'ur';
}

export const AdmissionModule: React.FC<AdmissionModuleProps> = ({ lang }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [viewMode, setViewMode] = useViewMode('admission_module');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Add / Edit Modal State
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [dob, setDob] = useState('2017-03-15');
  const [classId, setClassId] = useState('c-kachi');
  const [admissionCategory, setAdmissionCategory] = useState<AdmissionCategoryCode>('F');
  const [bFormNo, setBFormNo] = useState('14301-0000000-1');
  const [fatherCnic, setFatherCnic] = useState('14301-1111111-1');
  const [contactNo, setContactNo] = useState('0333-0000000');
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [address, setAddress] = useState('Village Chambai, District Kohat');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
  );
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Full Profile Modal, ID Card Modal & Delete Confirmation
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);
  const [idCardStudent, setIdCardStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [cardDisplayMode, setCardDisplayMode] = useState<'classic_qr' | 'color_wave'>('classic_qr');

  const refreshStudents = () => {
    setStudents(StorageService.getStudents());
  };

  useEffect(() => {
    refreshStudents();
  }, []);

  const filteredStudents = students.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      st.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (st.rollNo || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = classFilter === 'ALL' || st.classId === classFilter;
    const matchesCat =
      categoryFilter === 'ALL' || (st.admissionCategory || 'F') === categoryFilter;

    return matchesSearch && matchesClass && matchesCat;
  });

  const openAddModal = () => {
    setEditingStudent(null);
    const nextNum = 2401 + students.length;
    setAdmissionNo(`GPSC-${nextNum}`);
    setRollNo(String(students.filter((s) => s.classId === 'c-kachi').length + 1));
    setName('');
    setFatherName('');
    setDob('2018-04-10');
    setClassId('c-kachi');
    setAdmissionCategory('F');
    setBFormNo('14301-');
    setFatherCnic('14301-');
    setContactNo('0333-');
    setAdmissionDate(new Date().toISOString().split('T')[0]);
    setAddress('Village Chambai, Kohat');
    setPhotoUrl(
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80'
    );
    setPhotoFileName('');
    setPhotoStatusMsg(null);
    setShowFormModal(true);
  };

  const openEditModal = (st: Student) => {
    setEditingStudent(st);
    setAdmissionNo(st.admissionNo);
    setRollNo(st.rollNo || '1');
    setName(st.name);
    setFatherName(st.fatherName);
    setDob(st.dob);
    setClassId(st.classId || 'c-kachi');
    setAdmissionCategory(st.admissionCategory || 'F');
    setBFormNo(st.bFormNo);
    setFatherCnic(st.fatherCnic);
    setContactNo(st.contactNo);
    setAdmissionDate(st.admissionDate);
    setAddress(st.address);
    setPhotoUrl(st.photoUrl);
    setPhotoFileName('');
    setPhotoStatusMsg(null);
    setShowFormModal(true);
  };

  const [photoFileName, setPhotoFileName] = useState<string>('');
  const [photoStatusMsg, setPhotoStatusMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const DEFAULT_STUDENT_PLACEHOLDER =
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80';

  const compressImageToPersistentDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('Failed to read selected image file.'));
      reader.onload = () => {
        const rawDataUrl = reader.result as string;
        if (!rawDataUrl || !rawDataUrl.startsWith('data:image/')) {
          reject(new Error('Selected file is not a valid image.'));
          return;
        }
        const img = new Image();
        img.onerror = () => resolve(rawDataUrl);
        img.onload = () => {
          try {
            const maxDim = 480;
            let w = img.width || 300;
            let h = img.height || 300;
            if (w > maxDim || h > maxDim) {
              if (w > h) {
                h = Math.round((h * maxDim) / w);
                w = maxDim;
              } else {
                w = Math.round((w * maxDim) / h);
                h = maxDim;
              }
            }
            const canvas = document.createElement('canvas');
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              resolve(rawDataUrl);
              return;
            }
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.86);
            resolve(compressed);
          } catch {
            resolve(rawDataUrl);
          }
        };
        img.src = rawDataUrl;
      };
      reader.readAsDataURL(file);
    });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPhotoStatusMsg({
        type: 'info',
        text: 'Photo selection cancelled.',
      });
      return;
    }

    // Validate image format (JPG, JPEG, PNG, WEBP)
    const validMime = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
    const validExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!validMime && !validExt) {
      setPhotoStatusMsg({
        type: 'error',
        text: 'Invalid image format. Please select a JPG, JPEG, PNG, or WEBP photo.',
      });
      e.target.value = '';
      return;
    }

    // Validate file size (max 15 MB)
    const maxBytes = 15 * 1024 * 1024;
    if (file.size > maxBytes) {
      setPhotoStatusMsg({
        type: 'error',
        text: 'Image file is too large (max 15 MB). Please choose a smaller photo.',
      });
      e.target.value = '';
      return;
    }

    try {
      const clsFolder = mapClassIdToFolderName(classId);
      const compressedDataUrl = await compressImageToPersistentDataUrl(file);
      // Also archive inside virtual GPS Chambai/Admission/Students Photos folder
      try {
        await readFileAsDataUrl(
          file,
          `Admission/Students Photos/${clsFolder}`,
          'Admission'
        );
      } catch {
        // ignore virtual folder archive failure
      }

      setPhotoUrl(compressedDataUrl);
      setPhotoFileName(
        `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`
      );
      setPhotoStatusMsg({
        type: 'success',
        text: `Photo "${file.name}" loaded and ready to save.`,
      });
    } catch {
      setPhotoStatusMsg({
        type: 'error',
        text: 'Failed to process or store the selected photo. Please try another image.',
      });
    } finally {
      e.target.value = '';
    }
  };

  const handleRemoveSelectedPhoto = () => {
    setPhotoUrl('');
    setPhotoFileName('');
    setPhotoStatusMsg({
      type: 'info',
      text: 'Student photo removed.',
    });
    if (photoInputRef.current) photoInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !fatherName.trim()) return;

    const finalPhoto = photoUrl.trim() || DEFAULT_STUDENT_PLACEHOLDER;
    const studentUniqueId = editingStudent ? editingStudent.id : `st-${Date.now()}`;

    const record: Student = {
      id: studentUniqueId,
      admissionNo: admissionNo.trim(),
      rollNo: rollNo.trim() || '1',
      name: name.trim(),
      fatherName: fatherName.trim(),
      dob,
      classId,
      section: 'A',
      admissionCategory,
      bFormNo,
      fatherCnic,
      contactNo,
      admissionDate,
      address,
      photoUrl: finalPhoto,
      avatarUrl: finalPhoto,
      status: editingStudent?.status || 'Active',
      qrToken: admissionNo.trim(),
    };

    try {
      if (editingStudent) {
        StorageService.updateStudent(record);
      } else {
        StorageService.addStudent(record);
      }
      refreshStudents();
      setShowFormModal(false);
    } catch {
      setPhotoStatusMsg({
        type: 'error',
        text: 'Storage error: Could not save student record. Please try again.',
      });
    }
  };

  const handleConfirmDelete = () => {
    if (!deletingStudent) return;
    StorageService.deleteStudent(deletingStudent.id);
    setDeletingStudent(null);
    refreshStudents();
  };

  const handlePrintAdmissionRegister = () => {
    const rows = filteredStudents
      .map((st, idx) => {
        const cls = getClassMetaByIdOrName(st.classId);
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${st.admissionNo}</strong></td>
            <td>${st.rollNo || idx + 1}</td>
            <td><strong>${st.name}</strong></td>
            <td>${st.fatherName}</td>
            <td><span style="color:${cls.hex};font-weight:800;">${cls.displayName}</span></td>
            <td><strong>${st.admissionCategory || 'F'}</strong> (${ADMISSION_CATEGORY_META[st.admissionCategory || 'F']?.meaning || 'Fresh'})</td>
            <td>${st.admissionDate}</td>
            <td>${st.contactNo}</td>
          </tr>
        `;
      })
      .join('');

    printHtmlDocument(
      'Official Admission & Withdrawal Register — GPS Chambai Kohat',
      `
        <p style="font-size:12px;margin-bottom:10px;">
          <strong>Total Filtered Students:</strong> ${filteredStudents.length} &nbsp;|&nbsp;
          <strong>Categories:</strong> D = Dropout, G = Government, P = Private, F = Fresh
        </p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Admission No</th>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Father Name</th>
              <th>Class</th>
              <th>Category</th>
              <th>Admission Date</th>
              <th>Contact</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `,
      true
    );
  };

  const handlePrintSingleStudentCard = (st: Student) => {
    const cls = getClassMetaByIdOrName(st.classId);
    const cat = ADMISSION_CATEGORY_META[st.admissionCategory || 'F'];
    printHtmlDocument(
      `Student Admission Card - ${st.name}`,
      `
        <div style="border:3px solid ${cls.hex};border-radius:18px;padding:20px;max-width:520px;margin:0 auto;">
          <div style="background:${cls.hex};color:#fff;padding:12px 16px;border-radius:12px;display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
            <div>
              <div style="font-size:16px;font-weight:900;">STUDENT IDENTITY & ADMISSION CARD</div>
              <div style="font-size:11px;">GPS Chambai Kohat • EMIS Code: 23150</div>
            </div>
            <div style="font-size:20px;font-weight:900;">#${st.rollNo || '1'}</div>
          </div>
          <table>
            <tbody>
              <tr><th>Student Name</th><td><strong>${st.name}</strong></td></tr>
              <tr><th>Father Name</th><td>${st.fatherName}</td></tr>
              <tr><th>Class</th><td><strong style="color:${cls.hex};">${cls.displayName} (${cls.urduName})</strong></td></tr>
              <tr><th>Admission Number</th><td><strong>${st.admissionNo}</strong></td></tr>
              <tr><th>Roll Number</th><td><strong>${st.rollNo || '1'}</strong></td></tr>
              <tr><th>Admission Category</th><td><strong>${cat.fullLabel}</strong> (${cat.urdu})</td></tr>
              <tr><th>Admission Date</th><td>${st.admissionDate}</td></tr>
              <tr><th>Date of Birth</th><td>${st.dob}</td></tr>
              <tr><th>Student B-Form</th><td>${st.bFormNo}</td></tr>
              <tr><th>Father CNIC</th><td>${st.fatherCnic}</td></tr>
              <tr><th>Contact Number</th><td>${st.contactNo}</td></tr>
              <tr><th>Address</th><td>${st.address}</td></tr>
              <tr><th>QR Attendance ID</th><td><code>${st.qrToken}</code></td></tr>
            </tbody>
          </table>
        </div>
      `
    );
  };

  return (
    <div className="p-3.5 space-y-3.5 pb-8 animate-fade-in">
      {/* Top Action Header */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-700 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black tracking-tight">
            {lang === 'ur' ? 'داخلہ اور طلباء کا ریکارڈ' : 'Admissions & Student Cards'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} className="bg-white/95" />
          <button
            onClick={handlePrintAdmissionRegister}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Print Admission Register"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => {
              const rows = filteredStudents
                .map((st, idx) => {
                  const cls = getClassMetaByIdOrName(st.classId);
                  return `<tr><td>${idx + 1}</td><td><strong>${st.admissionNo}</strong></td><td>${st.rollNo || idx + 1}</td><td><strong>${st.name}</strong></td><td>${st.fatherName}</td><td>${cls.displayName}</td><td>${st.admissionCategory || 'F'}</td><td>${st.admissionDate}</td><td>${st.contactNo}</td></tr>`;
                })
                .join('');
              exportAndSaveRealPdf(
                'Official Admission Register — GPS Chambai Kohat',
                `<table><thead><tr><th>#</th><th>Adm No</th><th>Roll</th><th>Name</th><th>Father Name</th><th>Class</th><th>Cat</th><th>Date</th><th>Contact</th></tr></thead><tbody>${rows}</tbody></table>`,
                'landscape',
                'Admission/Admission Documents/PDF Records',
                'Admission'
              );
            }}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Save Admission Register as PDF"
          >
            <Download size={16} />
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-white text-purple-800 text-xs font-black flex items-center gap-1 shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>New Admission</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search student by name, father name, admission no, or roll no..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Filter Row 1: Class Filter with Exact Image 004 Colors */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setClassFilter('ALL')}
          className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
            classFilter === 'ALL'
              ? 'bg-slate-900 text-white'
              : 'bg-white text-slate-700 border border-slate-200'
          }`}
        >
          All Classes ({students.length})
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
            {cls.shortCode} ({students.filter((s) => s.classId === cls.id).length})
          </button>
        ))}
      </div>

      {/* Filter Row 2: Admission Category Filter (D, G, P, F) */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => setCategoryFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
            categoryFilter === 'ALL'
              ? 'bg-purple-700 text-white'
              : 'bg-white text-slate-600 border border-slate-200'
          }`}
        >
          All Categories
        </button>
        {(['F', 'G', 'P', 'D'] as AdmissionCategoryCode[]).map((code) => (
          <button
            key={code}
            onClick={() => setCategoryFilter(code)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black whitespace-nowrap ${
              categoryFilter === code
                ? 'bg-purple-700 text-white'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            {ADMISSION_CATEGORY_META[code].fullLabel}
          </button>
        ))}
      </div>

      {/* View Mode Switcher: Classic QR Student ID Cards (Default) vs Colorful Class Cards */}
      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-2xl border border-slate-200 shadow-2xs">
        <span className="text-[11px] font-black text-slate-700 flex items-center gap-1.5">
          <QrCode size={14} className="text-emerald-700" />
          <span>Student Card Design (QR on Admission No)</span>
        </span>
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setCardDisplayMode('classic_qr')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
              cardDisplayMode === 'classic_qr'
                ? 'bg-emerald-700 text-white shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            QR Student ID Card
          </button>
          <button
            type="button"
            onClick={() => setCardDisplayMode('color_wave')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
              cardDisplayMode === 'color_wave'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'text-slate-600'
            }`}
          >
            Class Color Card
          </button>
        </div>
      </div>

      {/* Classic Student ID Cards with Admission Number QR Code (Default) */}
      {cardDisplayMode === 'classic_qr' ? (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 gap-4'
              : 'space-y-3'
          }
        >
          {filteredStudents.map((st) => {
            const clsMeta = getClassMetaByIdOrName(st.classId);
            return (
              <StudentIdCard
                key={st.id}
                student={st}
                schoolClass={{
                  id: clsMeta.id,
                  name: clsMeta.displayName,
                  urduName: clsMeta.urduName,
                  section: st.section || 'A',
                }}
                currentLang={lang}
                onPhotoUpdated={() => refreshStudents()}
                onViewProfile={(s) => setViewingStudent(s)}
                onEdit={(s) => openEditModal(s)}
                onDelete={(s) => setDeletingStudent(s)}
              />
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map((st, idx) => {
            const clsMeta = getClassMetaByIdOrName(st.classId);
            const cardHex = getClassHexColor(st.classId);
            const catMeta = ADMISSION_CATEGORY_META[st.admissionCategory || 'F'];
            const isDarkTextNeeded = cardHex === '#FFC000';

            return (
              <div
                key={st.id}
                style={{
                  backgroundColor: cardHex,
                  boxShadow: `0 10px 22px -6px ${cardHex}66`,
                }}
                className={`relative rounded-[26px] p-4 ${
                  isDarkTextNeeded ? 'text-slate-950' : 'text-white'
                } overflow-hidden transition-transform hover:-translate-y-0.5`}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 w-28 sm:w-32 pointer-events-none"
                  style={{
                    background: isDarkTextNeeded
                      ? 'rgba(0,0,0,0.08)'
                      : 'rgba(0,0,0,0.16)',
                    borderTopLeftRadius: '110px',
                    borderBottomLeftRadius: '110px',
                  }}
                />

                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0 flex-1">
                    <button
                      onClick={() => setIdCardStudent(st)}
                      className="relative shrink-0 group focus:outline-none"
                    >
                      <img
                        src={st.photoUrl}
                        alt={st.name}
                        className="w-16 h-16 rounded-full object-cover border-[3px] border-white/90 shadow-md bg-white"
                      />
                      <span className="absolute -bottom-1 right-0 px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[9px] font-black shadow-xs">
                        {st.admissionCategory || 'F'}
                      </span>
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight truncate">
                        {st.name}
                      </h3>
                      <p className="text-xs font-bold opacity-95 truncate mt-0.5">
                        Father: {st.fatherName} • {catMeta.fullLabel}
                      </p>

                      <div className="grid grid-cols-3 gap-2 mt-2.5 max-w-xs">
                        <div>
                          <div className="text-xs sm:text-sm font-black leading-none truncate">
                            {st.admissionNo}
                          </div>
                          <div className="text-[9px] font-bold opacity-80 mt-0.5">
                            Admission No
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black leading-none">
                            {st.rollNo || idx + 1}
                          </div>
                          <div className="text-[9px] font-bold opacity-80 mt-0.5">
                            Roll No
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-sm font-black leading-none truncate">
                            {st.admissionDate}
                          </div>
                          <div className="text-[9px] font-bold opacity-80 mt-0.5">
                            Adm Date
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="relative z-10 flex flex-col items-center justify-between w-28 shrink-0 text-center">
                    <div className="flex items-center gap-1 mb-1">
                      <button
                        onClick={() => setIdCardStudent(st)}
                        className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 transition-colors"
                        title="Open QR Student ID Card"
                      >
                        <QrCode size={13} />
                      </button>
                      <button
                        onClick={() => setViewingStudent(st)}
                        className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 transition-colors"
                        title="View Full Student Profile"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={() => openEditModal(st)}
                        className="p-1.5 rounded-lg bg-black/15 hover:bg-black/25 transition-colors"
                        title="Edit Student"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setDeletingStudent(st)}
                        className="p-1.5 rounded-lg bg-black/15 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div className="text-2xl font-black leading-none tracking-tight">
                      {st.rollNo || idx + 1}
                    </div>
                    <div className="text-[10px] font-extrabold opacity-95 mt-1 truncate max-w-full">
                      {clsMeta.displayName}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStudent}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingStudent ? 'Edit Student Admission Record' : 'New Student Admission'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Student Photo Upload (Android APK WebView & Photo Picker Ready) */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border-2 border-purple-200 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-600 bg-white shrink-0 flex items-center justify-center shadow-xs">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Student Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 text-center px-1">
                      NO PHOTO
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="text-xs font-black text-slate-900">
                    Student Passport Photo (JPG / PNG / WEBP)
                  </div>

                  {/* Hidden Native File Inputs for Android WebView onShowFileChooser */}
                  <input
                    id="student-gallery-photo-input"
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                  <input
                    id="student-camera-photo-input"
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />

                  <div className="flex flex-wrap items-center gap-1.5">
                    <label
                      htmlFor="student-gallery-photo-input"
                      onClick={() => setPhotoStatusMsg(null)}
                      className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-95 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <Upload size={13} />
                      <span>{photoUrl ? 'Change Photo (Gallery)' : 'Select from Gallery'}</span>
                    </label>

                    <label
                      htmlFor="student-camera-photo-input"
                      onClick={() => setPhotoStatusMsg(null)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-all"
                    >
                      <span>Take Photo (Camera)</span>
                    </label>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveSelectedPhoto}
                        className="px-2.5 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 text-xs font-black inline-flex items-center gap-1 transition-all"
                      >
                        <Trash2 size={12} />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  {photoFileName ? (
                    <p className="text-[11px] text-emerald-800 font-black truncate">
                      Selected: {photoFileName}
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500 font-semibold">
                      Tap &quot;Select from Gallery&quot; or &quot;Take Photo&quot; to attach student photo
                    </p>
                  )}
                </div>
              </div>

              {photoStatusMsg && (
                <div
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between ${
                    photoStatusMsg.type === 'error'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : photoStatusMsg.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-amber-50 text-amber-900 border border-amber-200'
                  }`}
                >
                  <span>{photoStatusMsg.text}</span>
                  <button
                    type="button"
                    onClick={() => setPhotoStatusMsg(null)}
                    className="ml-2 opacity-75 hover:opacity-100"
                  >
                    <X size={13} />
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Admission No
                </label>
                <input
                  type="text"
                  required
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Roll Number
                </label>
                <input
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Student Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Student Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Father Name
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father Name"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            {/* Class & Admission Category (D, G, P, F) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Class (Image 004 Color Assigned)
                </label>
                <select
                  value={classId}
                  onChange={(e) => setClassId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName} ({c.urduName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Admission Category (D / G / P / F)
                </label>
                <select
                  value={admissionCategory}
                  onChange={(e) =>
                    setAdmissionCategory(e.target.value as AdmissionCategoryCode)
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="F">F — Fresh (فریش داخلہ)</option>
                  <option value="G">G — Government (سرکاری سکول سے)</option>
                  <option value="P">P — Private (پرائیویٹ سکول سے)</option>
                  <option value="D">D — Dropout (ڈراپ آؤٹ دوبارہ داخلہ)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Student B-Form
                </label>
                <input
                  type="text"
                  value={bFormNo}
                  onChange={(e) => setBFormNo(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Father CNIC
                </label>
                <input
                  type="text"
                  value={fatherCnic}
                  onChange={(e) => setFatherCnic(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Contact No
                </label>
                <input
                  type="text"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Home Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-purple-700 text-white text-xs font-black shadow-md"
              >
                Save Student Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Full Student Profile Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div
              className="p-5 text-white flex items-center justify-between"
              style={{ backgroundColor: getClassHexColor(viewingStudent.classId) }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={viewingStudent.photoUrl}
                  alt={viewingStudent.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white bg-white"
                />
                <div>
                  <span className="text-[10px] font-black uppercase bg-black/20 px-2 py-0.5 rounded-full">
                    Roll #{viewingStudent.rollNo || '1'} • {viewingStudent.admissionNo}
                  </span>
                  <h3 className="text-lg font-black mt-0.5">{viewingStudent.name}</h3>
                  <p className="text-xs font-bold opacity-95">
                    S/O: {viewingStudent.fatherName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 rounded-xl bg-black/20 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400">Class</div>
                  <div className="font-black text-slate-900">
                    {getClassMetaByIdOrName(viewingStudent.classId).displayName}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="text-[10px] font-bold text-slate-400">Admission Category</div>
                  <div className="font-black text-slate-900">
                    {
                      ADMISSION_CATEGORY_META[viewingStudent.admissionCategory || 'F']
                        .fullLabel
                    }
                  </div>
                </div>
              </div>

              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-slate-400" />
                  <span>
                    <strong>Admission Date:</strong> {viewingStudent.admissionDate} &nbsp;|&nbsp;{' '}
                    <strong>DOB:</strong> {viewingStudent.dob}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard size={14} className="text-slate-400" />
                  <span>
                    <strong>B-Form:</strong> {viewingStudent.bFormNo} &nbsp;|&nbsp;{' '}
                    <strong>Father CNIC:</strong> {viewingStudent.fatherCnic}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-400" />
                  <span>
                    <strong>Contact:</strong> {viewingStudent.contactNo}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-slate-400" />
                  <span>
                    <strong>Address:</strong> {viewingStudent.address}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <QrCode size={14} className="text-slate-400" />
                  <span>
                    <strong>QR Token:</strong> <code>{viewingStudent.qrToken}</code>
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    setIdCardStudent(st);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-700 text-white font-black flex items-center justify-center gap-1.5"
                >
                  <QrCode size={14} />
                  <span>Open QR Student Card</span>
                </button>
                <button
                  onClick={() => handlePrintSingleStudentCard(viewingStudent)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center gap-1.5"
                >
                  <Printer size={14} />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => {
                    const st = viewingStudent;
                    setViewingStudent(null);
                    openEditModal(st);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-800 font-black"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Classic Student ID Card Modal */}
      {idCardStudent && (
        <StudentIdCard
          student={idCardStudent}
          schoolClass={{
            id: getClassMetaByIdOrName(idCardStudent.classId).id,
            name: getClassMetaByIdOrName(idCardStudent.classId).displayName,
            urduName: getClassMetaByIdOrName(idCardStudent.classId).urduName,
            section: idCardStudent.section || 'A',
          }}
          currentLang={lang}
          showModalControls={true}
          onClose={() => setIdCardStudent(null)}
          onPhotoUpdated={(updated) => {
            setIdCardStudent(updated);
            refreshStudents();
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Confirm Student Deletion</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to delete <strong>{deletingStudent.name}</strong> (Admission No:{' '}
              {deletingStudent.admissionNo})?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingStudent(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
