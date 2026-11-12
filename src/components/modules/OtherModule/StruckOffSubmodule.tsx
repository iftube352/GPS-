import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Search,
  Printer,
  Edit3,
  Trash2,
  UserMinus,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  Download,
  FileSpreadsheet,
} from 'lucide-react';
import { Student, StruckOffRecord } from '../../../types';
import { StorageService } from '../../../services/storage';
import { getClassMetaByIdOrName, getClassHexColor } from '../../../utils/classColors';
import {
  printHtmlDocument,
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
} from '../../../services/printAndFileService';
import { useViewMode, ViewModeToggle } from '../../common/ViewModeToggle';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

interface ExtendedStruckOffMeta {
  recordState: 'DEACTIVE' | 'ACTIVE – RE-ADMISSION';
  reAdmissionDate?: string;
  reAdmissionRemarks?: string;
}

const META_STORAGE_KEY = 'gps_chambai_struck_off_meta_v1';

export const StruckOffSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<StruckOffRecord[]>([]);
  const [metaMap, setMetaMap] = useState<Record<string, ExtendedStruckOffMeta>>(() => {
    try {
      const raw = localStorage.getItem(META_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    return {};
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useViewMode('struck_off_module', 'grid');
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<StruckOffRecord | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [struckOffDate, setStruckOffDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('Continuous absence for 6 consecutive weeks');
  const [deletingRecord, setDeletingRecord] = useState<StruckOffRecord | null>(null);

  // Re-Admission Modal
  const [reAdmittingRecord, setReAdmittingRecord] = useState<StruckOffRecord | null>(null);
  const [reAdmissionDate, setReAdmissionDate] = useState(
    () => new Date().toISOString().split('T')[0]
  );
  const [reAdmissionRemarks, setReAdmissionRemarks] = useState(
    'Re-admitted to active class upon parent application; previous attendance & exam records preserved.'
  );

  const showToast = (msg: string) => {
    setSavedNotice(msg);
    setTimeout(() => setSavedNotice(null), 4000);
  };

  const saveMetaMap = (next: Record<string, ExtendedStruckOffMeta>) => {
    setMetaMap(next);
    localStorage.setItem(META_STORAGE_KEY, JSON.stringify(next));
  };

  const refresh = () => {
    const sts = StorageService.getStudents();
    setStudents(sts);
    setRecords(StorageService.getStruckOffRecords());
    if (sts.length > 0 && !selectedStudentId) {
      setSelectedStudentId(sts[0].id);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const filteredRecords = records.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.admissionNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.remarks.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setEditingRecord(null);
    if (students.length > 0) setSelectedStudentId(students[0].id);
    setStruckOffDate(new Date().toISOString().split('T')[0]);
    setRemarks('Continuous absence / Family relocated to another district');
    setShowModal(true);
  };

  const openEditModal = (rec: StruckOffRecord) => {
    setEditingRecord(rec);
    setSelectedStudentId(rec.studentId);
    setStruckOffDate(rec.struckOffDate);
    setRemarks(rec.remarks);
    setShowModal(true);
  };

  const handleSaveStruckOff = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find((s) => s.id === selectedStudentId);
    if (!st) return;

    const clsMeta = getClassMetaByIdOrName(st.classId);

    const record: StruckOffRecord = {
      id: editingRecord ? editingRecord.id : `so-${Date.now()}`,
      studentId: st.id,
      studentName: st.name,
      fatherName: st.fatherName,
      admissionNo: st.admissionNo,
      rollNo: st.rollNo || '1',
      classId: clsMeta.id,
      className: clsMeta.displayName,
      struckOffDate,
      remarks: remarks.trim(),
    };

    if (editingRecord) {
      StorageService.updateStruckOffRecord(record);
    } else {
      StorageService.addStruckOffRecord(record);
    }
    saveMetaMap({
      ...metaMap,
      [record.id]: {
        recordState: 'DEACTIVE',
      },
    });
    refresh();
    setShowModal(false);
    showToast(`Marked ${st.name} as DEACTIVE in Struck Off Register.`);
  };

  // Requirement 10.D: ACTIVE – RE-ADMISSION Handler
  const handleConfirmReAdmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reAdmittingRecord) return;

    // 1. Restore student status to 'Active' in the Student Database without creating duplicates, preserving attendance & exam history
    const allStudents = StorageService.getStudents();
    const existingIdx = allStudents.findIndex(
      (s) =>
        s.id === reAdmittingRecord.studentId ||
        s.admissionNo === reAdmittingRecord.admissionNo
    );

    if (existingIdx >= 0) {
      allStudents[existingIdx] = {
        ...allStudents[existingIdx],
        status: 'Active',
        struckOffDate: undefined,
        remarks: `Re-Admitted on ${reAdmissionDate}: ${reAdmissionRemarks}`,
      };
      StorageService.saveStudents(allStudents);
    }

    // 2. Update Struck Off record remarks & meta
    const updatedRec: StruckOffRecord = {
      ...reAdmittingRecord,
      remarks: `${reAdmittingRecord.remarks} | [ACTIVE – RE-ADMISSION on ${reAdmissionDate}: ${reAdmissionRemarks}]`,
    };
    StorageService.updateStruckOffRecord(updatedRec);

    saveMetaMap({
      ...metaMap,
      [reAdmittingRecord.id]: {
        recordState: 'ACTIVE – RE-ADMISSION',
        reAdmissionDate,
        reAdmissionRemarks,
      },
    });

    setReAdmittingRecord(null);
    refresh();
    showToast(
      `ACTIVE – RE-ADMISSION completed for ${reAdmittingRecord.studentName}! Restored to Active Class (${reAdmittingRecord.className}) with full attendance & exam history preserved.`
    );
  };

  // Requirement 10.D: DEACTIVE Handler
  const handleMarkDeactive = (rec: StruckOffRecord) => {
    const allStudents = StorageService.getStudents();
    const updatedStudents = allStudents.map((s) =>
      s.id === rec.studentId || s.admissionNo === rec.admissionNo
        ? {
            ...s,
            status: 'Struck_Off' as const,
            struckOffDate: rec.struckOffDate,
            struckOffReason: rec.remarks,
          }
        : s
    );
    StorageService.saveStudents(updatedStudents);

    saveMetaMap({
      ...metaMap,
      [rec.id]: {
        ...metaMap[rec.id],
        recordState: 'DEACTIVE',
      },
    });

    refresh();
    showToast(
      `${rec.studentName} marked DEACTIVE in Struck Off Register (all historical data preserved).`
    );
  };

  const buildReportHtml = () => {
    const rows = filteredRecords
      .map((r, idx) => {
        const m = metaMap[r.id];
        const statusLabel = m?.recordState || 'DEACTIVE';
        return `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${r.admissionNo}</strong></td>
          <td>${r.rollNo}</td>
          <td><strong>${r.studentName}</strong></td>
          <td>${r.fatherName}</td>
          <td>${r.className}</td>
          <td><strong>${r.struckOffDate}</strong></td>
          <td><strong>${statusLabel}</strong>${
          m?.reAdmissionDate ? `<br/><span style="font-size:10px;">Re-Adm: ${m.reAdmissionDate}</span>` : ''
        }</td>
          <td>${r.remarks}</td>
        </tr>
      `;
      })
      .join('');

    return `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Admission No</th>
            <th>Roll No</th>
            <th>Student Name</th>
            <th>Father Name</th>
            <th>Class</th>
            <th>Struck Off Date</th>
            <th>Current Status</th>
            <th>Struck Off & Re-Admission Remarks</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  };

  const handlePrintStruckOffList = () => {
    printHtmlDocument(
      'Official Struck Off & Re-Admission Register — GPS Chambai Kohat',
      buildReportHtml(),
      true
    );
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-700 to-red-800 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-200">
              Active Re-Admission &amp; Deactive Register • EMIS 16454
            </span>
            <h2 className="text-lg font-black tracking-tight">Struck Off Register</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} lang={lang} />
          <button
            onClick={handlePrintStruckOffList}
            className="px-2.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1"
            title="Print Struck Off Register"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>
          <button
            onClick={() => {
              const res = exportAndSaveRealPdf('Struck_Off_Register', buildReportHtml(), {
                landscape: true,
                folderSubPath: 'Other',
                moduleSource: 'Struck Off Module',
              });
              showToast(`Saved ${res.filename} to ${res.folderPath}`);
            }}
            className="px-2.5 py-2 rounded-xl bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1"
          >
            <Download size={14} />
            <span>PDF</span>
          </button>
          <button
            onClick={() => {
              const res = exportAndSaveWordDoc('Struck_Off_Register', buildReportHtml(), {
                folderSubPath: 'Other',
                moduleSource: 'Struck Off Module',
              });
              showToast(`Exported ${res.filename}`);
            }}
            className="px-2.5 py-2 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center gap-1"
          >
            <FileSpreadsheet size={14} />
            <span>Doc</span>
          </button>
          <button
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-white text-rose-700 text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Plus size={15} />
            <span>Add Struck Off</span>
          </button>
        </div>
      </div>

      {savedNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search struck-off records by student name, admission no, class, or remarks..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      {/* Records List */}
      <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
        {filteredRecords.map((rec) => {
          const clsColor = getClassHexColor(rec.classId || rec.className);
          const stRecord = students.find(
            (s) => s.id === rec.studentId || s.admissionNo === rec.admissionNo
          );
          const meta = metaMap[rec.id];
          const isReAdmitted =
            meta?.recordState === 'ACTIVE – RE-ADMISSION' || stRecord?.status === 'Active';

          return (
            <div
              key={rec.id}
              className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                      isReAdmitted
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isReAdmitted ? <UserCheck size={20} /> : <UserMinus size={20} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: clsColor }}
                      >
                        {rec.className}
                      </span>
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isReAdmitted
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {isReAdmitted ? 'ACTIVE – RE-ADMISSION' : 'DEACTIVE'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        Adm No: {rec.admissionNo} • Roll #{rec.rollNo}
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 mt-1">
                      {rec.studentName}{' '}
                      <span className="text-xs font-semibold text-slate-500">
                        S/O {rec.fatherName}
                      </span>
                    </h4>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(rec)}
                    className="p-1.5 rounded-xl bg-slate-100 text-slate-700"
                    title="Edit Record"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    onClick={() => setDeletingRecord(rec)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600"
                    title="Delete Entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 text-xs space-y-1">
                <div>
                  <strong className="text-rose-900">Struck Off Date:</strong>{' '}
                  <span className="font-bold text-slate-800">{rec.struckOffDate}</span>
                </div>
                {meta?.reAdmissionDate && (
                  <div>
                    <strong className="text-emerald-800">Re-Admission Date:</strong>{' '}
                    <span className="font-bold text-emerald-900">{meta.reAdmissionDate}</span>
                  </div>
                )}
                <div>
                  <strong className="text-slate-700">Remarks:</strong>{' '}
                  <span className="text-slate-700 font-medium">{rec.remarks}</span>
                </div>
              </div>

              {/* REQUIREMENT 10.D: TWO REQUIRED BUTTONS: "ACTIVE – RE-ADMISSION" & "DEACTIVE" */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setReAdmittingRecord(rec);
                    setReAdmissionDate(new Date().toISOString().split('T')[0]);
                    setReAdmissionRemarks(
                      'Re-admitted to active class upon parent application; previous attendance & exam records preserved.'
                    );
                  }}
                  className={`py-2 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                    isReAdmitted
                      ? 'bg-emerald-700 text-white ring-2 ring-emerald-300'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  }`}
                >
                  <UserCheck size={14} />
                  <span>ACTIVE – RE-ADMISSION</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleMarkDeactive(rec)}
                  className={`py-2 px-3 rounded-xl text-[11px] font-black flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95 ${
                    !isReAdmitted
                      ? 'bg-rose-700 text-white ring-2 ring-rose-300'
                      : 'bg-slate-200 hover:bg-rose-600 hover:text-white text-slate-800'
                  }`}
                >
                  <UserX size={14} />
                  <span>DEACTIVE</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Re-Admission Modal */}
      {reAdmittingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReAdmission}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700">
                  Restore Active Student Status
                </span>
                <h3 className="text-base font-black text-slate-900">
                  ACTIVE – RE-ADMISSION ({reAdmittingRecord.studentName})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReAdmittingRecord(null)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold">
              Re-admitting <strong>{reAdmittingRecord.studentName}</strong> (Adm #
              {reAdmittingRecord.admissionNo}, Class {reAdmittingRecord.className}) will restore
              their active class status while preserving all historical attendance and exam records
              without creating duplicate records.
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                1. Re-Admission Date
              </label>
              <input
                type="date"
                required
                value={reAdmissionDate}
                onChange={(e) => setReAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                2. Re-Admission Remarks
              </label>
              <textarea
                rows={3}
                required
                value={reAdmissionRemarks}
                onChange={(e) => setReAdmissionRemarks(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReAdmittingRecord(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                Confirm ACTIVE – RE-ADMISSION
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveStruckOff}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingRecord ? 'Edit Struck Off Entry' : 'Record Struck Off Student'}
              </h3>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Select Student from Database
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} S/O {s.fatherName} ({s.admissionNo})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                1. Struck Off Date
              </label>
              <input
                type="date"
                required
                value={struckOffDate}
                onChange={(e) => setStruckOffDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                2. Struck Off Remarks
              </label>
              <textarea
                rows={3}
                required
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Reason for striking off name from attendance register..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Save Struck Off Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Delete Struck Off Record</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Remove struck-off entry for <strong>{deletingRecord.studentName}</strong>? (Historical
              student record remains preserved).
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeletingRecord(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  StorageService.deleteStruckOffRecord(deletingRecord.id);
                  setDeletingRecord(null);
                  refresh();
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
