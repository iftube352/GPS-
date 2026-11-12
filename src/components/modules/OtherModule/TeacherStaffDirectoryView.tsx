import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Search,
  ChevronRight,
  X,
  Printer,
  Download,
  Plus,
  Edit2,
  Trash2,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Eye,
  FileText,
  Calendar,
} from 'lucide-react';
import { StaffMember } from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  printHtmlDocument,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  readFileAsDataUrl,
} from '../../../services/printAndFileService';
import { ViewModeToggle, useViewMode } from '../../common/ViewModeToggle';

interface TeacherStaffDirectoryViewProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

const DEFAULT_STAFF_AVATAR =
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300';

export const TeacherStaffDirectoryView: React.FC<TeacherStaffDirectoryViewProps> = ({
  onBack,
  lang,
}) => {
  const [staffList, setStaffList] = useState<StaffMember[]>(() =>
    StorageService.getOfficialTeachers()
  );
  const [viewMode, setViewMode] = useViewMode('staff_attendance_directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember>>({});
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshList = () => {
    setStaffList(StorageService.getOfficialTeachers());
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredStaff = staffList.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      (s.urduName && s.urduName.includes(q)) ||
      s.cnic.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q)
    );
  });

  // Sort alphabetically by name
  const sortedStaff = [...filteredStaff].sort((a, b) => a.name.localeCompare(b.name));

  // Group by first letter (Image 009)
  const grouped: Record<string, StaffMember[]> = {};
  sortedStaff.forEach((s) => {
    const letter = s.name.charAt(0).toUpperCase() || '#';
    if (!grouped[letter]) grouped[letter] = [];
    grouped[letter].push(s);
  });

  const letterKeys = Object.keys(grouped).sort();

  const handleOpenAddModal = () => {
    setEditingStaff({
      id: `staff-${Date.now()}`,
      name: '',
      urduName: '',
      designation: 'PST • BPS-12',
      bps: 12,
      cnic: '',
      personalNo: '',
      qualification: '',
      joiningDate: new Date().toISOString().split('T')[0],
      phone: '',
      gender: 'Male',
      status: 'Active',
      photoUrl: DEFAULT_STAFF_AVATAR,
    });
    setIsEditModalOpen(true);
  };

  const handleOpenEditModal = (staff: StaffMember) => {
    setEditingStaff({ ...staff });
    setIsEditModalOpen(true);
    setSelectedStaff(null);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await readFileAsDataUrl(
        file,
        'Staff Data/Staff Photos',
        'Staff Attendance'
      );
      setEditingStaff((prev) => ({ ...prev, photoUrl: res.dataUrl }));
      showToast('Staff photo uploaded & saved to GPS Chambai/Staff Data/Staff Photos!');
    } catch {
      showToast('Could not read selected image file.');
    } finally {
      e.target.value = '';
    }
  };

  const handleDownloadStaffPhoto = (photoUrl: string, staffName: string) => {
    const a = document.createElement('a');
    a.href = photoUrl;
    a.download = `${staffName.replace(/\s+/g, '_')}_Photo.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast(`Downloaded photo for ${staffName}`);
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff.name?.trim()) {
      showToast('Please enter staff name.');
      return;
    }

    const newStaff: StaffMember = {
      id: editingStaff.id || `staff-${Date.now()}`,
      name: editingStaff.name.trim(),
      urduName: editingStaff.urduName?.trim() || '',
      designation: editingStaff.designation?.trim() || 'PST • BPS-12',
      bps: Number(editingStaff.bps) || 12,
      cnic: editingStaff.cnic?.trim() || '14301-0000000-0',
      personalNo: editingStaff.personalNo?.trim() || '',
      qualification: editingStaff.qualification?.trim() || '',
      joiningDate: editingStaff.joiningDate || new Date().toISOString().split('T')[0],
      phone: editingStaff.phone?.trim() || '',
      contactNo: editingStaff.phone?.trim() || '',
      gender: editingStaff.gender || 'Male',
      status: editingStaff.status || 'Active',
      photoUrl: editingStaff.photoUrl || DEFAULT_STAFF_AVATAR,
      address: editingStaff.address || 'Kohat',
      department: editingStaff.department || 'Primary Teaching',
      staffCategory: editingStaff.staffCategory || 'PST',
    };

    StorageService.saveOfficialTeacher(newStaff);
    refreshList();
    setIsEditModalOpen(false);
    showToast(`Staff member "${newStaff.name}" saved successfully!`);
  };

  const handleDeleteStaff = (id: string) => {
    const target = staffList.find((s) => s.id === id);
    StorageService.deleteOfficialTeacher(id);
    refreshList();
    setIsDeletingId(null);
    setSelectedStaff(null);
    showToast(`Staff member "${target?.name || ''}" removed successfully.`);
  };

  const buildDirectoryHtml = () => {
    const rows = sortedStaff
      .map(
        (s, idx) => `
        <tr>
          <td style="text-align:center;">${idx + 1}</td>
          <td><strong>${s.name}</strong><br/><span style="font-size:11px;color:#64748b;">${s.urduName || ''}</span></td>
          <td><strong>${s.designation}</strong></td>
          <td style="text-align:center;">BPS-${s.bps || 14}</td>
          <td><code>${s.cnic}</code></td>
          <td>${s.personalNo || '—'}</td>
          <td>${s.qualification || '—'}</td>
          <td>${s.phone || s.contactNo || '—'}</td>
        </tr>
      `
      )
      .join('');

    return `
      <div style="font-size:12px;margin-bottom:12px;border-bottom:1px solid #cbd5e1;padding-bottom:8px;">
        <strong>Total Staff Members:</strong> ${sortedStaff.length} &nbsp;|&nbsp;
        <strong>School EMIS:</strong> 16454 &nbsp;|&nbsp;
        <strong>Govt. Primary School Chambai Kohat</strong> &nbsp;|&nbsp;
        <strong>KP E&amp;SE Department</strong>
      </div>
      <table>
        <thead>
          <tr>
            <th style="width:30px;text-align:center;">#</th>
            <th>Staff Name</th>
            <th>Designation</th>
            <th style="text-align:center;">Scale</th>
            <th>CNIC</th>
            <th>Personal No</th>
            <th>Qualification</th>
            <th>Contact Phone</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
    `;
  };

  const handlePrintStaffDirectory = () => {
    const bodyHtml = buildDirectoryHtml();
    printHtmlDocument(
      'Staff Directory (اساتذہ و ملازمین فہرست) — GPS Chambai Kohat',
      bodyHtml,
      'portrait',
      true,
      'Staff Data/PDF Records'
    );
  };

  const handleSavePdfDirectory = async () => {
    const bodyHtml = buildDirectoryHtml();
    await exportAndSaveRealPdf(
      'Staff Directory — GPS Chambai Kohat (EMIS 16454)',
      bodyHtml,
      'Staff_Directory_GPS_Chambai.pdf',
      'portrait',
      'Staff Data/PDF Records'
    );
    showToast('Staff Directory saved as real PDF in GPS Chambai/Staff Data/PDF Records!');
  };

  const handleSaveWordDirectory = async () => {
    const bodyHtml = buildDirectoryHtml();
    await exportAndSaveWordDoc(
      'Staff Directory — GPS Chambai Kohat (EMIS 16454)',
      bodyHtml,
      'Staff_Directory_GPS_Chambai.doc',
      'Staff Data/Staff Documents'
    );
    showToast('Staff Directory exported as Word Doc!');
  };

  const teacherAttendanceHistory = StorageService.getTeacherAttendance();

  return (
    <div className="min-h-full bg-[#f4f7f5] text-slate-900 p-4 space-y-4 animate-fade-in pb-16">
      {/* Top Header Bar (Image 009) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full bg-white hover:bg-slate-100 flex items-center justify-center shadow-xs border border-slate-200 transition-all"
            aria-label="Back"
          >
            <ArrowLeft size={19} className="text-slate-800" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
              {lang === 'ur' ? 'اساتذہ و عملہ' : 'Staff'}
            </h1>
            <span className="text-[10px] font-bold text-slate-500">
              EMIS 16454 GPS Chambai • Staff Photo &amp; Attendance Directory
            </span>
          </div>
        </div>

        {/* Action Buttons: View Toggle, Add Staff, Print, PDF, Word */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs active:scale-95 transition-all"
            title="Add New Staff Member"
          >
            <Plus size={15} />
            <span>Add Staff</span>
          </button>

          <button
            onClick={handlePrintStaffDirectory}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-slate-100"
            title="Print Staff Directory"
          >
            <Printer size={16} />
          </button>

          <button
            onClick={handleSavePdfDirectory}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-slate-100"
            title="Download PDF"
          >
            <Download size={16} />
          </button>

          <button
            onClick={handleSaveWordDirectory}
            className="p-2 rounded-xl bg-white border border-slate-200 shadow-xs text-slate-700 hover:bg-slate-100"
            title="Export Word Doc"
          >
            <FileText size={16} />
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Search Bar (Image 009) */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
          <Search size={17} />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'ur'
              ? 'نام، شناختی کارڈ یا عہدہ سے تلاش کریں'
              : 'Search name, CNIC or designation'
          }
          className="w-full pl-10 pr-4 py-3 bg-[#e8ece9] hover:bg-[#dfe4e0] focus:bg-white text-xs font-bold text-slate-900 rounded-3xl outline-none border border-transparent focus:border-emerald-500 transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-700"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Alphabetical Staff List (Image 009) */}
      <div className="space-y-4">
        {letterKeys.map((letter) => (
          <div key={letter} className="space-y-2">
            <div className="px-1">
              <span className="text-emerald-700 font-black text-sm tracking-wide">
                {letter}
              </span>
            </div>

            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 gap-2.5'
                  : 'space-y-2.5'
              }
            >
              {grouped[letter].map((staff) => (
                <div
                  key={staff.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 hover:shadow-sm transition-all"
                >
                  <div
                    onClick={() => setSelectedStaff(staff)}
                    className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                  >
                    <img
                      src={staff.photoUrl}
                      alt={staff.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/20 shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_STAFF_AVATAR;
                      }}
                    />
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-slate-900 truncate">
                        {staff.name}
                      </h4>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight truncate">
                        {staff.designation}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {staff.cnic}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Preview Photo, Edit, Delete, Chevron */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setPreviewPhotoUrl(staff.photoUrl || DEFAULT_STAFF_AVATAR)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-blue-600 transition-colors"
                      title="Preview Staff Photo"
                    >
                      <Eye size={15} />
                    </button>
                    <button
                      onClick={() => handleOpenEditModal(staff)}
                      className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-500 hover:text-emerald-700 transition-colors"
                      title="Edit Staff Member & Photo"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => setIsDeletingId(staff.id)}
                      className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete Staff Member"
                    >
                      <Trash2 size={15} />
                    </button>
                    <button
                      onClick={() => setSelectedStaff(staff)}
                      className="p-1 text-slate-400 hover:text-slate-700"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Count (Image 009) */}
      <div className="pt-2 pb-4 text-center">
        <span className="text-xs font-bold text-slate-500">
          {filteredStaff.length} staff
        </span>
      </div>

      {/* Staff Detail + Attendance History Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800">
                Staff Profile &amp; Attendance History (EMIS 16454)
              </span>
              <button
                onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={selectedStaff.photoUrl}
                alt={selectedStaff.name}
                onClick={() => setPreviewPhotoUrl(selectedStaff.photoUrl || DEFAULT_STAFF_AVATAR)}
                className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm cursor-pointer"
                title="Click to Preview Full Photo"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-black text-slate-900 leading-tight">
                  {selectedStaff.name}
                </h3>
                <p className="text-xs font-bold text-emerald-700">
                  {selectedStaff.designation}
                </p>
                <p className="text-xs font-mono text-slate-500 mt-0.5">
                  CNIC: {selectedStaff.cnic}
                </p>
                <div className="flex items-center gap-1.5 mt-2">
                  <button
                    onClick={() =>
                      setPreviewPhotoUrl(selectedStaff.photoUrl || DEFAULT_STAFF_AVATAR)
                    }
                    className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-black text-slate-700 flex items-center gap-1"
                  >
                    <Eye size={11} />
                    <span>Preview Photo</span>
                  </button>
                  <button
                    onClick={() =>
                      handleDownloadStaffPhoto(
                        selectedStaff.photoUrl || DEFAULT_STAFF_AVATAR,
                        selectedStaff.name
                      )
                    }
                    className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[10px] font-black text-emerald-800 flex items-center gap-1"
                  >
                    <Download size={11} />
                    <span>Download Photo</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400">Scale (BPS)</span>
                <span className="font-bold text-slate-800">BPS-{selectedStaff.bps || 14}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400">Personal No</span>
                <span className="font-bold text-slate-800">{selectedStaff.personalNo || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400">Qualification</span>
                <span className="font-bold text-slate-800">{selectedStaff.qualification || '—'}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400">Joining Date</span>
                <span className="font-bold text-slate-800">{selectedStaff.joiningDate || '—'}</span>
              </div>
              <div className="col-span-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="block text-[10px] font-bold text-slate-400">Contact / Phone</span>
                <span className="font-bold text-slate-800">{selectedStaff.phone || selectedStaff.contactNo || '—'}</span>
              </div>
            </div>

            {/* Staff Attendance History Log */}
            <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Calendar size={13} className="text-emerald-700" />
                  <span>Staff Attendance History</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500">
                  {teacherAttendanceHistory.length} Days Logged
                </span>
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {teacherAttendanceHistory.slice(0, 12).map((dayRec) => {
                  const stStatus = dayRec.statusMap?.[selectedStaff.id] || 'Present';
                  return (
                    <div
                      key={dayRec.date}
                      className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 text-[11px]"
                    >
                      <span className="font-bold text-slate-700">
                        {dayRec.dayName}, {dayRec.monthLabel} {dayRec.dayNumber} ({dayRec.date})
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          stStatus === 'Present'
                            ? 'bg-emerald-100 text-emerald-800'
                            : stStatus === 'Absent'
                            ? 'bg-rose-100 text-rose-800'
                            : stStatus === 'On-Duty'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {stStatus}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEditModal(selectedStaff)}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1.5"
                >
                  <Edit2 size={13} />
                  <span>Edit &amp; Replace Photo</span>
                </button>
                <button
                  onClick={() => setIsDeletingId(selectedStaff.id)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-black flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Photo Preview Lightbox */}
      {previewPhotoUrl && (
        <div
          onClick={() => setPreviewPhotoUrl(null)}
          className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl p-4 max-w-sm w-full space-y-3 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800">
                Staff Photo Preview
              </span>
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X size={15} />
              </button>
            </div>
            <img
              src={previewPhotoUrl}
              alt="Staff Full Preview"
              className="w-full h-72 object-cover rounded-2xl border border-slate-200"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDownloadStaffPhoto(previewPhotoUrl, 'Staff')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Download Photo</span>
              </button>
              <button
                onClick={() => setPreviewPhotoUrl(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Staff Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-3xl p-5 shadow-2xl border border-slate-200 overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">
                {editingStaff.id && staffList.some((s) => s.id === editingStaff.id)
                  ? 'Edit Staff Member & Photo'
                  : 'Add New Teacher / Staff'}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3.5 text-xs">
              {/* Photo Upload Section with Preview, Replace, Remove, Download */}
              <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={editingStaff.photoUrl || DEFAULT_STAFF_AVATAR}
                  alt="Avatar Preview"
                  onClick={() =>
                    setPreviewPhotoUrl(editingStaff.photoUrl || DEFAULT_STAFF_AVATAR)
                  }
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-xs shrink-0 cursor-pointer"
                />
                <div className="space-y-1.5 flex-1">
                  <div className="font-bold text-slate-800">
                    Staff Photo (Saved in GPS Chambai/Staff Data/Staff Photos)
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".jpg,.jpeg,.png,.webp,image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-black flex items-center gap-1.5 hover:bg-emerald-700 shadow-2xs"
                    >
                      <Camera size={13} />
                      <span>Upload / Replace Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewPhotoUrl(editingStaff.photoUrl || DEFAULT_STAFF_AVATAR)
                      }
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadStaffPhoto(
                          editingStaff.photoUrl || DEFAULT_STAFF_AVATAR,
                          editingStaff.name || 'Staff'
                        )
                      }
                      className="px-2.5 py-1.5 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-100 flex items-center gap-1"
                    >
                      <Download size={12} />
                      <span>Download</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingStaff((prev) => ({
                          ...prev,
                          photoUrl: DEFAULT_STAFF_AVATAR,
                        }))
                      }
                      className="px-2.5 py-1.5 rounded-xl border border-rose-200 text-rose-600 font-bold hover:bg-rose-50"
                    >
                      Remove Photo
                    </button>
                  </div>
                </div>
              </div>

              {/* Name & Urdu Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingStaff.name || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Anar Khan"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    نام (اردو)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.urduName || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, urduName: e.target.value }))
                    }
                    placeholder="مثلاً: انار خان"
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Designation & Scale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Designation (عہدہ)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.designation || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, designation: e.target.value }))
                    }
                    placeholder="e.g. SENIOR PST • BPS-14 or PSHT • BPS-15"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Basic Pay Scale (BPS)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="22"
                    value={editingStaff.bps || 14}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, bps: Number(e.target.value) }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* CNIC & Personal No */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    CNIC (شناختی کارڈ)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.cnic || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, cnic: e.target.value }))
                    }
                    placeholder="14301-0116094-3"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Personal No (پرسنل نمبر)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.personalNo || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, personalNo: e.target.value }))
                    }
                    placeholder="e.g. KP-140116"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Qualification & Joining Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Qualification (تعلیمی قابلیت)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.qualification || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, qualification: e.target.value }))
                    }
                    placeholder="e.g. M.A, B.Ed"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Joining Date (تاریخ تقرری)
                  </label>
                  <input
                    type="date"
                    value={editingStaff.joiningDate || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, joiningDate: e.target.value }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Phone & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Contact Phone (رابطہ نمبر)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.phone || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="0333-9123456"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Residential Address (رہائش)
                  </label>
                  <input
                    type="text"
                    value={editingStaff.address || ''}
                    onChange={(e) =>
                      setEditingStaff((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="Chambai, Kohat"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black shadow-md"
                >
                  Save Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeletingId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle size={24} />
            </div>
            <h3 className="text-base font-black text-slate-900">
              Confirm Staff Deletion
            </h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to remove this staff member from GPS Chambai record?
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setIsDeletingId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStaff(isDeletingId)}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white text-xs font-black shadow-xs hover:bg-rose-700"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
