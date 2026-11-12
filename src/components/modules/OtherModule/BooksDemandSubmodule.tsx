import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  Printer,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';
import {
  BookDemandItem,
  OldBookStockItem,
  KpOfficialSubjectRecord,
} from '../../../types';
import { StorageService } from '../../../services/storage';
import {
  OFFICIAL_SIX_CLASSES,
  KP_TEN_OFFICIAL_BOOKS,
  getSubjectsForClass,
  getClassHexColor,
} from '../../../utils/classColors';
import { printHtmlDocument } from '../../../services/printAndFileService';
import { AnnualBooksReceivedTable } from '../../common/AnnualBooksReceivedTable';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

/**
 * PART 10: BOOK DEMAND & RECEIVED SUBMODULE
 * - Add button, Delete button, New Book entry, Old Book entry, Edit existing records, Update quantities, Save permanently
 * - KP Official Subjects Dropdown Configuration (6 classes + 10 subjects auto-mapped)
 */
export const BooksDemandSubmodule: React.FC<SubmoduleProps> = ({ onBack }) => {
  const [demands, setDemands] = useState<BookDemandItem[]>([]);
  const [oldBooks, setOldBooks] = useState<OldBookStockItem[]>([]);
  const [kpSubjects, setKpSubjects] = useState<KpOfficialSubjectRecord[]>([]);
  const [activeTab, setActiveTab] = useState<
    'received_sheet' | 'demand_received' | 'old_books' | 'kp_subjects'
  >('received_sheet');

  // Add/Edit Demand Modal
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<BookDemandItem | null>(null);
  const [selectedClassLabel, setSelectedClassLabel] = useState<string>('Kachi — ECE');
  const [selectedBookLabel, setSelectedBookLabel] = useState<string>('Urdu — اردو');
  const [bookCategory, setBookCategory] = useState<'New' | 'Old'>('New');
  const [demandedQty, setDemandedQty] = useState('45');
  const [receivedQty, setReceivedQty] = useState('45');

  const refresh = () => {
    setDemands(StorageService.getBookDemands());
    setOldBooks(StorageService.getOldBooks());
    setKpSubjects(StorageService.getKpOfficialSubjects());
  };

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    const valid = getSubjectsForClass(selectedClassLabel);
    if (valid.length > 0 && !valid.some((b) => b.fullLabel === selectedBookLabel)) {
      setSelectedBookLabel(valid[0].fullLabel);
    }
  }, [selectedClassLabel, selectedBookLabel]);

  const handleSaveRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const clsMeta =
      OFFICIAL_SIX_CLASSES.find(
        (c) =>
          c.kpSubjectDropdownLabel === selectedClassLabel ||
          c.displayName === selectedClassLabel
      ) || OFFICIAL_SIX_CLASSES[0];

    const record: BookDemandItem = {
      id: editingItem ? editingItem.id : `bd-${Date.now()}`,
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: selectedBookLabel,
      bookCategory,
      demandedQty: Math.max(0, parseInt(demandedQty, 10) || 0),
      receivedQty: Math.max(0, parseInt(receivedQty, 10) || 0),
      distributedQty: Math.max(0, parseInt(receivedQty, 10) || 0),
      academicYear: '2025-26',
    };

    if (editingItem) {
      StorageService.updateBookDemand(record);
    } else {
      StorageService.addBookDemand(record);
    }

    if (bookCategory === 'Old') {
      StorageService.addOldBook({
        id: `ob-${Date.now()}`,
        classId: clsMeta.id,
        className: clsMeta.displayName,
        subject: selectedBookLabel,
        availableQty: record.receivedQty,
        condition: 'Good',
        academicYear: '2025-26',
        remarks: 'Added via Book Demand & Received (Old Book Entry)',
      });
    }

    refresh();
    setShowModal(false);
    setEditingItem(null);
  };

  const handleAdjustQuantity = (
    item: BookDemandItem,
    field: 'demandedQty' | 'receivedQty',
    delta: number
  ) => {
    const updated: BookDemandItem = {
      ...item,
      [field]: Math.max(0, (item[field] || 0) + delta),
    };
    StorageService.updateBookDemand(updated);
    refresh();
  };

  const handleDeleteDemand = (id: string) => {
    StorageService.deleteBookDemand(id);
    refresh();
  };

  const handlePrintChallan = () => {
    const rows = demands
      .map(
        (d, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${d.className}</strong></td>
          <td>${d.subject}</td>
          <td>${d.bookCategory || 'New'}</td>
          <td>${d.demandedQty}</td>
          <td>${d.receivedQty}</td>
          <td>${Math.max(0, d.demandedQty - d.receivedQty)}</td>
        </tr>
      `
      )
      .join('');

    printHtmlDocument(
      'Official Free Textbooks Demand & Supply Challan (2025-26)',
      `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Class</th>
              <th>Official KP Subject</th>
              <th>Book Type</th>
              <th>Demanded</th>
              <th>Received</th>
              <th>Shortage / Balance</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `
    );
  };

  const totalDemanded = demands.reduce((acc, d) => acc + d.demandedQty, 0);
  const totalReceived = demands.reduce((acc, d) => acc + d.receivedQty, 0);
  const totalOldStock = oldBooks.reduce((acc, o) => acc + o.availableQty, 0);

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-lg flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
              KP Free Textbooks Supply • EMIS 16454
            </span>
            <h2 className="text-lg font-black tracking-tight">Book Demand &amp; Received</h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrintChallan}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            title="Print Official Supply Challan"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setSelectedClassLabel('Kachi — ECE');
              setSelectedBookLabel('Urdu — اردو');
              setBookCategory('New');
              setDemandedQty('40');
              setReceivedQty('40');
              setShowModal(true);
            }}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
          >
            <Plus size={15} />
            <span>Add Entry</span>
          </button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="bg-blue-600 text-white rounded-2xl p-3 shadow-xs">
          <div className="text-lg font-black">{totalDemanded}</div>
          <div className="text-[10px] font-bold opacity-90">Demanded Qty</div>
        </div>
        <div className="bg-emerald-600 text-white rounded-2xl p-3 shadow-xs">
          <div className="text-lg font-black">{totalReceived}</div>
          <div className="text-[10px] font-bold opacity-90">Received Qty</div>
        </div>
        <div className="bg-amber-600 text-white rounded-2xl p-3 shadow-xs">
          <div className="text-lg font-black">{totalOldStock}</div>
          <div className="text-[10px] font-bold opacity-90">Available Old Books</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-200 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('received_sheet')}
          className={`py-2 rounded-xl text-[11px] font-black ${
            activeTab === 'received_sheet' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-700'
          }`}
        >
          Received Table (سالانہ کتب ریکارڈ)
        </button>
        <button
          onClick={() => setActiveTab('demand_received')}
          className={`py-2 rounded-xl text-[11px] font-black ${
            activeTab === 'demand_received' ? 'bg-slate-900 text-white' : 'text-slate-700'
          }`}
        >
          Demand &amp; Received List
        </button>
        <button
          onClick={() => setActiveTab('old_books')}
          className={`py-2 rounded-xl text-[11px] font-black ${
            activeTab === 'old_books' ? 'bg-slate-900 text-white' : 'text-slate-700'
          }`}
        >
          Old Books ({oldBooks.length})
        </button>
        <button
          onClick={() => setActiveTab('kp_subjects')}
          className={`py-2 rounded-xl text-[11px] font-black ${
            activeTab === 'kp_subjects' ? 'bg-slate-900 text-white' : 'text-slate-700'
          }`}
        >
          KP Official Subjects
        </button>
      </div>

      {activeTab === 'received_sheet' && <AnnualBooksReceivedTable />}

      {activeTab === 'demand_received' && (
        <div className="space-y-4">
          <AnnualBooksReceivedTable />
          <div className="space-y-2.5">
          {demands.map((item) => {
            const clsColor = getClassHexColor(item.classId || item.className);
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="text-[10px] font-black px-2.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: clsColor }}
                    >
                      {item.className}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        item.bookCategory === 'Old'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.bookCategory || 'New'} Book
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        const clsMeta = OFFICIAL_SIX_CLASSES.find((c) => c.id === item.classId);
                        setSelectedClassLabel(
                          clsMeta?.kpSubjectDropdownLabel || 'Kachi — ECE'
                        );
                        setSelectedBookLabel(item.subject);
                        setBookCategory(item.bookCategory || 'New');
                        setDemandedQty(String(item.demandedQty));
                        setReceivedQty(String(item.receivedQty));
                        setShowModal(true);
                      }}
                      className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteDemand(item.id)}
                      className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="text-sm font-black text-slate-900">{item.subject}</div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  {(
                    [
                      { key: 'demandedQty', label: 'Demanded' },
                      { key: 'receivedQty', label: 'Received' },
                    ] as const
                  ).map((col) => (
                    <div
                      key={col.key}
                      className="bg-slate-50 rounded-xl p-2 border border-slate-200 flex items-center justify-between"
                    >
                      <button
                        onClick={() => handleAdjustQuantity(item, col.key, -1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-black text-xs"
                      >
                        -
                      </button>
                      <div className="text-center">
                        <div className="text-xs font-black text-slate-900">{item[col.key]}</div>
                        <div className="text-[9px] font-bold text-slate-500">{col.label}</div>
                      </div>
                      <button
                        onClick={() => handleAdjustQuantity(item, col.key, 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-black text-xs"
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          </div>
        </div>
      )}

      {activeTab === 'old_books' && (
        <div className="space-y-2.5">
          {oldBooks.map((ob) => (
            <div
              key={ob.id}
              className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between"
            >
              <div>
                <span
                  className="text-[10px] font-black px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: getClassHexColor(ob.classId) }}
                >
                  {ob.className}
                </span>
                <h4 className="text-sm font-black text-slate-900 mt-1">{ob.subject}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">
                  Condition: {ob.condition} • {ob.remarks}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
                  <div className="text-sm font-black text-amber-900">{ob.availableQty}</div>
                  <div className="text-[9px] font-bold text-amber-700">Old Stock</div>
                </div>
                <button
                  onClick={() => {
                    StorageService.deleteOldBook(ob.id);
                    refresh();
                  }}
                  className="p-2 rounded-xl bg-rose-50 text-rose-600"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'kp_subjects' && (
        <div className="space-y-3">
          {OFFICIAL_SIX_CLASSES.map((cls) => {
            const mapped = getSubjectsForClass(cls.kpSubjectDropdownLabel);
            return (
              <div
                key={cls.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-black px-2.5 py-1 rounded-full text-white"
                    style={{ backgroundColor: cls.hex }}
                  >
                    {cls.kpSubjectDropdownLabel}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500">
                    {mapped.length} Official Books
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {mapped.map((sub) => (
                    <div
                      key={sub.id}
                      className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-bold text-slate-800"
                    >
                      <span>{sub.english}</span>
                      <span className="font-urdu text-slate-600">{sub.urdu}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Adding/Editing New or Old Book Demand & Received */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveRecord}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5"
          >
            <h3 className="text-base font-black text-slate-900">
              {editingItem ? 'Edit Book Demand / Received' : 'New / Old Book Demand Entry'}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setBookCategory('New')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  bookCategory === 'New'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                New Book Entry
              </button>
              <button
                type="button"
                onClick={() => setBookCategory('Old')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  bookCategory === 'Old'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Old Book Entry
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                1. Class Dropdown (6 Official KP Classes)
              </label>
              <select
                value={selectedClassLabel}
                onChange={(e) => setSelectedClassLabel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {OFFICIAL_SIX_CLASSES.map((c) => (
                  <option key={c.id} value={c.kpSubjectDropdownLabel}>
                    {c.kpSubjectDropdownLabel}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                2. Book Dropdown (Mapped Official KP Subjects)
              </label>
              <select
                value={selectedBookLabel}
                onChange={(e) => setSelectedBookLabel(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {getSubjectsForClass(selectedClassLabel).map((b) => (
                  <option key={b.id} value={b.fullLabel}>
                    {b.fullLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Demanded Qty
                </label>
                <input
                  type="number"
                  value={demandedQty}
                  onChange={(e) => setDemandedQty(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Received Qty
                </label>
                <input
                  type="number"
                  value={receivedQty}
                  onChange={(e) => setReceivedQty(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
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
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                Save Permanently
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
