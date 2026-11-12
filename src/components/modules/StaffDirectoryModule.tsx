import React, { useState, useEffect, useRef } from 'react';
import {
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  Upload,
  X,
  Phone,
  Eye,
  Download,
  FileText,
} from 'lucide-react';
import { Staff, StaffCategoryOption, StaffDesignationOption } from '../../types';
import { StorageService } from '../../services/storage';
import { OFFICIAL_SIX_CLASSES, getClassHexColor, getClassMetaByIdOrName } from '../../utils/classColors';
import {
  printHtmlDocument,
  readFileAsDataUrl,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../services/printAndFileService';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface StaffDirectoryModuleProps {
  lang: 'en' | 'ur';
}

const FOUR_STAFF_CATEGORIES: StaffCategoryOption[] = [
  'Head Teacher',
  'Focal Person',
  'Other',
  'Chowkidar',
];

const DESIGNATION_OPTIONS: StaffDesignationOption[] = [
  'PSHT',
  'SPST',
  'PST',
  'Chowkidar',
];

/**
 * PART 8: DEPARTMENT & STAFF DATA MODULE
 * - Removes "Assigned Subject" field completely
 * - Replaces faculty/category options with: Head Teacher, Focal Person, Other, Chowkidar
 * - Redesigns Staff Cards following Image 005:
 *   Circular staff photo at top, Full Name, Designation immediately below name (PSHT, SPST, PST, Chowkidar),
 *   remaining details below, and bottom solid bar using the assigned class HEX color from Image 004
 *   (or neutral #475569 for unassigned staff).
 */
export const StaffDirectoryModule: React.FC<StaffDirectoryModuleProps> = ({ lang }) => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [viewMode, setViewMode] = useViewMode('staff_directory', 'grid');

  // Add / Edit Form State (No Assigned Subject field)
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [personalNo, setPersonalNo] = useState('');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [designation, setDesignation] = useState<string>('PST');
  const [bps, setBps] = useState<number>(14);
  const [staffCategory, setStaffCategory] = useState<StaffCategoryOption>('Other');
  const [qualification, setQualification] = useState('M.A / B.Ed');
  const [cnic, setCnic] = useState('14301-0000000-1');
  const [contactNo, setContactNo] = useState('0333-0000000');
  const [joiningDate, setJoiningDate] = useState('2018-09-01');
  const [classTeacherOf, setClassTeacherOf] = useState<string>('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
  );
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [viewingStaff, setViewingStaff] = useState<Staff | null>(null);
  const [deletingStaff, setDeletingStaff] = useState<Staff | null>(null);

  const refresh = () => {
    setStaffList(StorageService.getStaff());
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredStaff = staffList.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.personalNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.staffCategory || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat =
      categoryFilter === 'ALL' || (s.staffCategory || 'Other') === categoryFilter;

    return matchesSearch && matchesCat;
  });

  const openAddModal = () => {
    setEditingStaff(null);
    setPersonalNo(`1049${Math.floor(1000 + Math.random() * 8999)}`);
    setName('');
    setFatherName('');
    setDesignation('PST');
    setBps(14);
    setStaffCategory('Other');
    setQualification('M.A / B.Ed');
    setCnic('14301-');
    setContactNo('0333-');
    setJoiningDate(new Date().toISOString().split('T')[0]);
    setClassTeacherOf('c-1');
    setPhotoUrl(
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
    );
    setShowFormModal(true);
  };

  const openEditModal = (st: Staff) => {
    setEditingStaff(st);
    setPersonalNo(st.personalNo);
    setName(st.name);
    setFatherName(st.fatherName);
    setDesignation(st.designation);
    setBps(st.bps);
    setStaffCategory(st.staffCategory || 'Other');
    setQualification(st.qualification);
    setCnic(st.cnic);
    setContactNo(st.contactNo);
    setJoiningDate(st.joiningDate);
    setClassTeacherOf(st.classTeacherOf || '');
    setPhotoUrl(st.photoUrl);
    setShowFormModal(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readFileAsDataUrl(file, 'Staff Data/Staff Photos', 'Staff Data');
      setPhotoUrl(res.dataUrl);
    } catch {
      // ignore
    }
  };

  const handleSaveStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const record: Staff = {
      id: editingStaff ? editingStaff.id : `sf-${Date.now()}`,
      personalNo: personalNo.trim(),
      name: name.trim(),
      fatherName: fatherName.trim(),
      designation: designation.trim(),
      bps: Number(bps) || 14,
      staffCategory,
      qualification: qualification.trim(),
      cnic: cnic.trim(),
      contactNo: contactNo.trim(),
      joiningDate,
      classTeacherOf: classTeacherOf || undefined,
      photoUrl,
      status: editingStaff?.status || 'Present',
    };

    if (editingStaff) {
      StorageService.updateStaff(record);
    } else {
      StorageService.addStaff(record);
    }
    refresh();
    setShowFormModal(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingStaff) return;
    StorageService.deleteStaff(deletingStaff.id);
    setDeletingStaff(null);
    refresh();
  };

  const buildStaffRegisterTableHtml = () => {
    const rows = filteredStaff
      .map((s, idx) => {
        const clsName = s.classTeacherOf
          ? getClassMetaByIdOrName(s.classTeacherOf).displayName
          : 'Unassigned';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td>${s.personalNo}</td>
            <td><strong>${s.name}</strong></td>
            <td>${s.fatherName}</td>
            <td><strong>${s.designation}</strong> (BPS-${s.bps})</td>
            <td>${s.staffCategory}</td>
            <td>${s.qualification}</td>
            <td><strong>${clsName}</strong></td>
            <td>${s.contactNo}</td>
          </tr>
        `;
      })
      .join('');

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Personal No</th>
            <th>Full Name</th>
            <th>Father Name</th>
            <th>Designation</th>
            <th>Role / Category</th>
            <th>Qualification</th>
            <th>Assigned Class</th>
            <th>Contact</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const handlePrintStaffRegister = () => {
    printHtmlDocument(
      'Official Department & Staff Directory Register — GPS Chambai Kohat',
      buildStaffRegisterTableHtml(),
      true,
      true,
      'Staff Data/PDF Records'
    );
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-4 text-white shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full">
            KP E&SED HRIS • {staffList.length} Staff Members
          </span>
          <h2 className="text-lg font-black tracking-tight mt-1">
            {lang === 'ur' ? 'اسٹاف ڈیٹا اور اساتذہ' : 'Department & Staff Data'}
          </h2>
          <p className="text-[11px] text-white/90 font-semibold">
            Head Teacher • Focal Person • Other • Chowkidar
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} className="bg-white/95" />
          <button
            onClick={handlePrintStaffRegister}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Print Official Staff Register"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() =>
              exportAndSaveRealPdf(
                'Official Department & Staff Directory — GPS Chambai Kohat',
                buildStaffRegisterTableHtml(),
                'landscape',
                'Staff Data/PDF Records',
                'Staff Data'
              )
            }
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Save Staff Register as PDF"
          >
            <Download size={16} />
          </button>
          <button
            onClick={() =>
              exportAndSaveWordDoc(
                'Official Department & Staff Directory — GPS Chambai Kohat',
                buildStaffRegisterTableHtml(),
                'landscape',
                'Staff Data/Staff Documents',
                'Staff Data'
              )
            }
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Export Staff Register as Word (.doc)"
          >
            <FileText size={16} />
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-white text-blue-800 text-xs font-black flex items-center gap-1 shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, designation (PSHT/SPST/PST/Chowkidar), or P.No..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
              categoryFilter === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 border border-slate-200'
            }`}
          >
            All Staff ({staffList.length})
          </button>
          {FOUR_STAFF_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-700 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PART 8.2 & 8.3: STAFF CARDS FOLLOWING IMAGE 005 & IMAGE 004 CLASS HEX COLOR BAR */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-12 pt-8'
            : 'space-y-12 pt-8'
        }
      >
        {filteredStaff.map((member) => {
          const hasAssignedClass = Boolean(member.classTeacherOf);
          const bottomBarHex = hasAssignedClass
            ? getClassHexColor(member.classTeacherOf)
            : '#475569';
          const assignedClassLabel = hasAssignedClass
            ? getClassMetaByIdOrName(member.classTeacherOf).displayName
            : 'Unassigned / General Duty';

          return (
            <div
              key={member.id}
              className="relative bg-white rounded-[24px] pt-14 pb-0 shadow-lg border border-slate-200/90 flex flex-col justify-between text-center transition-transform hover:-translate-y-0.5"
            >
              {/* Protruding Circular Staff Photo at Top (Image 005) */}
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-24 h-24 rounded-full bg-white p-1.5 shadow-xl border border-slate-200">
                <img
                  src={member.photoUrl}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Action Buttons Top Right */}
              <div className="absolute top-3 right-3 flex items-center gap-1">
                <button
                  onClick={() => setViewingStaff(member)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="View Details"
                >
                  <Eye size={13} />
                </button>
                <button
                  onClick={() => openEditModal(member)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600"
                  title="Edit Staff"
                >
                  <Edit3 size={13} />
                </button>
                <button
                  onClick={() => setDeletingStaff(member)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                  title="Delete Staff"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Card Body (Image 005) */}
              <div className="px-5 pb-4 pt-2 space-y-2.5">
                <div>
                  {/* 1. Full Name */}
                  <h3 className="text-base font-black text-slate-950 uppercase tracking-tight">
                    {member.name}
                  </h3>
                  {/* 2. Designation immediately below name (PSHT, SPST, PST, Chowkidar) */}
                  <p
                    className="text-xs font-extrabold uppercase tracking-wider mt-0.5"
                    style={{ color: bottomBarHex }}
                  >
                    {member.designation} (BPS-{member.bps}) • {member.staffCategory}
                  </p>
                </div>

                {/* 3. Remaining staff details below */}
                <div className="text-[11px] text-slate-600 font-semibold leading-relaxed text-left bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-1">
                  <div>
                    <strong className="text-slate-800">Personal No:</strong> {member.personalNo}
                  </div>
                  <div>
                    <strong className="text-slate-800">Qualification:</strong>{' '}
                    {member.qualification}
                  </div>
                  <div>
                    <strong className="text-slate-800">Assigned Class:</strong>{' '}
                    <span className="font-black" style={{ color: bottomBarHex }}>
                      {assignedClassLabel}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone size={11} className="text-slate-400" />
                    <span>{member.contactNo}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Solid Color Bar matching Assigned Class HEX Color from Image 004 (Image 005) */}
              <div
                className="h-9 w-full rounded-b-[23px] flex items-center justify-between px-4 text-[10px] font-black uppercase tracking-wider"
                style={{
                  backgroundColor: bottomBarHex,
                  color: bottomBarHex === '#FFC000' ? '#0F172A' : '#FFFFFF',
                }}
              >
                <span>{assignedClassLabel}</span>
                <span>{bottomBarHex}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal (No Assigned Subject field) */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStaff}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3 max-h-[92vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingStaff ? 'Edit Staff Member' : 'Add Staff Member'}
              </h3>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            {/* Staff Photo Upload */}
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <img
                src={photoUrl}
                alt="Staff"
                className="w-14 h-14 rounded-full object-cover border-2 border-blue-600 shrink-0"
              />
              <div>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => photoInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-xl bg-blue-700 text-white text-xs font-black flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>Upload Staff Photo</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Designation
                </label>
                <select
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  {DESIGNATION_OPTIONS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Category (Part 8.1)
                </label>
                <select
                  value={staffCategory}
                  onChange={(e) =>
                    setStaffCategory(e.target.value as StaffCategoryOption)
                  }
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  {FOUR_STAFF_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  BPS Scale
                </label>
                <input
                  type="number"
                  value={bps}
                  onChange={(e) => setBps(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Assigned Class (Controls Bottom Color Bar)
                </label>
                <select
                  value={classTeacherOf}
                  onChange={(e) => setClassTeacherOf(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="">Unassigned</option>
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.displayName} ({c.urduName})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Personal Number
                </label>
                <input
                  type="text"
                  value={personalNo}
                  onChange={(e) => setPersonalNo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Qualification
                </label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  CNIC Number
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
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
                className="flex-1 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-black shadow-md"
              >
                Save Staff Member
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Staff Details Modal */}
      {viewingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-200">
            <div
              className="p-5 text-white flex items-center justify-between"
              style={{
                backgroundColor: viewingStaff.classTeacherOf
                  ? getClassHexColor(viewingStaff.classTeacherOf)
                  : '#475569',
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src={viewingStaff.photoUrl}
                  alt={viewingStaff.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white bg-white"
                />
                <div>
                  <h3 className="text-lg font-black">{viewingStaff.name}</h3>
                  <p className="text-xs font-bold opacity-95">
                    {viewingStaff.designation} (BPS-{viewingStaff.bps}) •{' '}
                    {viewingStaff.staffCategory}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewingStaff(null)}
                className="p-1.5 rounded-xl bg-black/20 text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-4 space-y-2 text-xs">
              <div>
                <strong>Father Name:</strong> {viewingStaff.fatherName}
              </div>
              <div>
                <strong>Personal Number:</strong> {viewingStaff.personalNo}
              </div>
              <div>
                <strong>Qualification:</strong> {viewingStaff.qualification}
              </div>
              <div>
                <strong>CNIC:</strong> {viewingStaff.cnic}
              </div>
              <div>
                <strong>Contact:</strong> {viewingStaff.contactNo}
              </div>
              <div>
                <strong>Joining Date:</strong> {viewingStaff.joiningDate}
              </div>
              <div>
                <strong>Assigned Class:</strong>{' '}
                {viewingStaff.classTeacherOf
                  ? getClassMetaByIdOrName(viewingStaff.classTeacherOf).displayName
                  : 'Unassigned'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingStaff && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Confirm Staff Deletion</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to delete <strong>{deletingStaff.name}</strong> (
              {deletingStaff.designation})?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingStaff(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
