import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Eye,
  Trash2,
  Edit3,
  Upload,
  X,
  Printer,
  BookOpen,
  Package,
  Archive,
  CheckCircle2,
  Download,
} from 'lucide-react';
import {
  BookguideItem,
  BookDemandItem,
  OldBookStockItem,
  KpOfficialSubjectRecord,
} from '../../types';
import { StorageService } from '../../services/storage';
import { PdfViewerModal } from './PdfViewerModal';
import {
  OFFICIAL_SIX_CLASSES,
  getClassHexColor,
  getSubjectsForClass,
  KP_TEN_OFFICIAL_BOOKS,
} from '../../utils/classColors';
import {
  printHtmlDocument,
  readFileAsDataUrl,
  exportAndSaveRealPdf,
  SUPPORTED_UPLOAD_ACCEPT,
} from '../../services/printAndFileService';
import { mapClassIdToFolderName } from '../../services/storageFolderService';
import { AnnualBooksReceivedTable } from '../common/AnnualBooksReceivedTable';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface BooksAndGuidesModuleProps {
  mode?: 'book' | 'guide' | 'all';
  lang: 'en' | 'ur';
}

type BooksSubTab =
  | 'pdf_library'
  | 'demanded_qty'
  | 'received_qty'
  | 'old_books'
  | 'kp_official_subjects';

export const BooksAndGuidesModule: React.FC<BooksAndGuidesModuleProps> = ({ mode = 'all', lang }) => {
  const [activeSubTab, setActiveSubTab] = useState<BooksSubTab>('pdf_library');
  const [viewMode, setViewMode] = useViewMode('books_and_guides');
  const [items, setItems] = useState<BookguideItem[]>([]);
  const [demands, setDemands] = useState<BookDemandItem[]>([]);
  const [oldBooks, setOldBooks] = useState<OldBookStockItem[]>([]);
  const [kpSubjects, setKpSubjects] = useState<KpOfficialSubjectRecord[]>([]);

  const [selectedItemType, setSelectedItemType] = useState<'all' | 'book' | 'guide'>(
    mode === 'guide' ? 'guide' : mode === 'book' ? 'book' : 'all'
  );
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingPdf, setViewingPdf] = useState<BookguideItem | null>(null);

  // PDF Add/Edit Modal State
  const [showAddPdfModal, setShowAddPdfModal] = useState(false);
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [classId, setClassId] = useState('c-kachi');
  const [subject, setSubject] = useState('');
  const [pages, setPages] = useState('48');
  const [description, setDescription] = useState('');
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileSize, setUploadedFileSize] = useState('2.4 MB');
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'pdf' | 'demand' | 'old_book' | 'kp_subject';
    id: string;
    label: string;
  } | null>(null);

  // Demanded / Received Add & Edit State
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [editingDemand, setEditingDemand] = useState<BookDemandItem | null>(null);
  const [demandClassName, setDemandClassName] = useState('KG / Kachi (ECE)');
  const [demandSubject, setDemandSubject] = useState('Urdu — اردو');
  const [demandBookCategory, setDemandBookCategory] = useState<'New' | 'Old'>('New');
  const [demandedQtyInput, setDemandedQtyInput] = useState('40');
  const [receivedQtyInput, setReceivedQtyInput] = useState('38');
  const [demandDateInput, setDemandDateInput] = useState(() => new Date().toISOString().split('T')[0]);

  // Old Books Add/Edit State
  const [showOldBookModal, setShowOldBookModal] = useState(false);
  const [editingOldBook, setEditingOldBook] = useState<OldBookStockItem | null>(null);
  const [oldBookClass, setOldBookClass] = useState('Class 1');
  const [oldBookSubject, setOldBookSubject] = useState('Urdu — اردو');
  const [oldBookQty, setOldBookQty] = useState('15');
  const [oldBookCondition, setOldBookCondition] = useState<'Good' | 'Fair' | 'Usable'>('Good');
  const [oldBookRemarks, setOldBookRemarks] = useState('Reusable session stock');

  // Section D: KP Official Subjects State
  const [kpClassOption, setKpClassOption] = useState<string>('Kachi — ECE');
  const [kpBookOption, setKpBookOption] = useState<string>('Urdu — اردو');
  const [editingKpId, setEditingKpId] = useState<string | null>(null);
  const [statusToast, setStatusToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3500);
  };

  const refreshAll = () => {
    setItems(StorageService.getBooks());
    setDemands(StorageService.getBookDemands());
    setOldBooks(StorageService.getOldBooks());
    setKpSubjects(StorageService.getKpOfficialSubjects());
  };

  useEffect(() => {
    refreshAll();
  }, []);

  // Automatically keep kpBookOption valid when kpClassOption changes
  useEffect(() => {
    const validSubjects = getSubjectsForClass(kpClassOption);
    if (validSubjects.length > 0 && !validSubjects.some((s) => s.fullLabel === kpBookOption)) {
      setKpBookOption(validSubjects[0].fullLabel);
    }
  }, [kpClassOption, kpBookOption]);

  const filteredPdfItems = items.filter((item) => {
    const matchesMode = selectedItemType === 'all' || item.type === selectedItemType;
    const matchesClass = selectedClassFilter === 'ALL' || item.classId === selectedClassFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMode && matchesClass && matchesSearch;
  });

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const clsFolder = mapClassIdToFolderName(classId);
      const subDir =
        selectedItemType === 'guide'
          ? `Books & Guides/Guides/${clsFolder}`
          : `Books & Guides/Books/${clsFolder}`;
      const result = await readFileAsDataUrl(file, subDir, 'Books & Guides');
      setUploadedFileUrl(result.dataUrl);
      setUploadedFileSize(`${result.fileTypeBadge} • ${result.sizeLabel}`);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      // ignore
    }
  };

  const openNewPdfModal = () => {
    setEditingPdfId(null);
    setTitle('');
    setClassId('c-kachi');
    setSubject('');
    setPages('48');
    setDescription('');
    setUploadedFileUrl('');
    setUploadedFileSize('2.4 MB');
    setShowAddPdfModal(true);
  };

  const openEditPdfModal = (item: BookguideItem) => {
    setEditingPdfId(item.id);
    setTitle(item.title);
    setClassId(item.classId || 'c-kachi');
    setSubject(item.subject);
    setPages(String(item.pages || 48));
    setDescription(item.description || '');
    setUploadedFileUrl(item.fileUrl || '');
    setUploadedFileSize(item.fileSize || '2.4 MB');
    setShowAddPdfModal(true);
  };

  const handleSavePdfItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subject.trim()) return;

    const clsMeta =
      OFFICIAL_SIX_CLASSES.find((c) => c.id === classId) || OFFICIAL_SIX_CLASSES[0];

    const record: BookguideItem = {
      id: editingPdfId || `bg-${Date.now()}`,
      title: title.trim(),
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: subject.trim(),
      type: selectedItemType === 'guide' ? 'guide' : 'book',
      pages: parseInt(pages, 10) || 36,
      fileSize: uploadedFileSize,
      coverColor: clsMeta.hex,
      fileUrl: uploadedFileUrl || undefined,
      description:
        description.trim() || `Official ${clsMeta.displayName} ${subject}.`,
    };

    if (editingPdfId) {
      StorageService.updateBook(record);
    } else {
      StorageService.addBook(record);
    }
    refreshAll();
    setShowAddPdfModal(false);
  };

  const handleSaveDemandRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const clsMeta =
      OFFICIAL_SIX_CLASSES.find(
        (c) =>
          c.displayName === demandClassName ||
          c.kpSubjectDropdownLabel === demandClassName
      ) || OFFICIAL_SIX_CLASSES[0];

    const record: BookDemandItem = {
      id: editingDemand ? editingDemand.id : `bd-${Date.now()}`,
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: demandSubject,
      bookCategory: demandBookCategory,
      demandedQty: Math.max(0, parseInt(demandedQtyInput, 10) || 0),
      receivedQty: Math.max(0, parseInt(receivedQtyInput, 10) || 0),
      distributedQty: Math.max(0, parseInt(receivedQtyInput, 10) || 0),
      date: demandDateInput || new Date().toISOString().split('T')[0],
      demandDate: demandDateInput || new Date().toISOString().split('T')[0],
      receivingDate: demandDateInput || new Date().toISOString().split('T')[0],
      academicYear: '2025-26',
    };

    if (editingDemand) {
      StorageService.updateBookDemand(record);
      showToast('Updated record successfully!');
    } else {
      StorageService.addBookDemand(record);
      showToast('Added new record successfully!');
    }
    refreshAll();
    setShowDemandModal(false);
    setEditingDemand(null);
  };

  const handleQuickAdjustDemand = (
    item: BookDemandItem,
    field: 'demandedQty' | 'receivedQty',
    delta: number
  ) => {
    const updated: BookDemandItem = {
      ...item,
      [field]: Math.max(0, (item[field] || 0) + delta),
    };
    StorageService.updateBookDemand(updated);
    refreshAll();
  };

  const handleSaveOldBook = (e: React.FormEvent) => {
    e.preventDefault();
    const clsMeta =
      OFFICIAL_SIX_CLASSES.find((c) => c.displayName === oldBookClass) ||
      OFFICIAL_SIX_CLASSES[0];

    const record: OldBookStockItem = {
      id: editingOldBook ? editingOldBook.id : `ob-${Date.now()}`,
      classId: clsMeta.id,
      className: clsMeta.displayName,
      subject: oldBookSubject,
      availableQty: Math.max(0, parseInt(oldBookQty, 10) || 0),
      condition: oldBookCondition,
      academicYear: '2025-26',
      remarks: oldBookRemarks,
    };

    if (editingOldBook) {
      StorageService.updateOldBook(record);
    } else {
      StorageService.addOldBook(record);
    }
    refreshAll();
    setShowOldBookModal(false);
    setEditingOldBook(null);
  };

  const handleAddKpOfficialSubject = () => {
    const clsMeta =
      OFFICIAL_SIX_CLASSES.find(
        (c) => c.kpSubjectDropdownLabel === kpClassOption || c.displayName === kpClassOption
      ) || OFFICIAL_SIX_CLASSES[0];
    const bookMeta =
      KP_TEN_OFFICIAL_BOOKS.find((b) => b.fullLabel === kpBookOption) ||
      { fullLabel: kpBookOption, urdu: kpBookOption };

    if (editingKpId) {
      const all = StorageService.getKpOfficialSubjects().map((item) =>
        item.id === editingKpId
          ? {
              ...item,
              classId: clsMeta.id,
              classLabel: kpClassOption,
              subjectLabel: kpBookOption,
              urduLabel: bookMeta.urdu,
            }
          : item
      );
      localStorage.setItem('gps_chambai_kp_official_subjects_v1', JSON.stringify(all));
      setEditingKpId(null);
      showToast('Updated KP Official Subject record!');
    } else {
      const record: KpOfficialSubjectRecord = {
        id: `kps-${Date.now()}`,
        classId: clsMeta.id,
        classLabel: kpClassOption,
        subjectLabel: kpBookOption,
        urduLabel: bookMeta.urdu,
        addedDate: new Date().toISOString().split('T')[0],
      };
      StorageService.addKpOfficialSubject(record);
      showToast('Added KP Official Subject record!');
    }
    refreshAll();
  };

  const handleExecuteDelete = () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'pdf') {
      StorageService.deleteBook(deleteConfirm.id);
    } else if (deleteConfirm.type === 'demand') {
      StorageService.deleteBookDemand(deleteConfirm.id);
    } else if (deleteConfirm.type === 'old_book') {
      StorageService.deleteOldBook(deleteConfirm.id);
    } else if (deleteConfirm.type === 'kp_subject') {
      StorageService.deleteKpOfficialSubject(deleteConfirm.id);
    }
    setDeleteConfirm(null);
    refreshAll();
  };

  const handlePrintBookSection = () => {
    if (activeSubTab === 'demanded_qty' || activeSubTab === 'received_qty') {
      const rows = demands
        .map(
          (d, i) => `
          <tr>
            <td>${i + 1}</td>
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
        'Official Free Textbooks Demand & Received Register',
        `
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Category</th>
                <th>Demanded Qty</th>
                <th>Received Qty</th>
                <th>Shortfall</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `
      );
      return;
    }

    const rows = filteredPdfItems
      .map(
        (b, i) => `
        <tr>
          <td>${i + 1}</td>
          <td><strong>${b.title}</strong></td>
          <td>${b.className}</td>
          <td>${b.subject}</td>
          <td>${b.pages}</td>
          <td>${b.fileSize}</td>
        </tr>
      `
      )
      .join('');
    printHtmlDocument(
      `${mode === 'book' ? 'KP Textbooks' : 'Teacher Guides'} Catalog`,
      `
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Pages</th>
              <th>File Size</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `
    );
  };

  return (
    <div className="p-3.5 space-y-3.5 pb-8 animate-fade-in">
      {statusToast && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2">
          <CheckCircle2 size={15} />
          <span>{statusToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-4 text-white shadow-lg flex items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-black tracking-tight">
            {lang === 'ur'
              ? 'درسی کتب و اساتذہ رہنمائی (Books & Guides)'
              : 'Books & Guides'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 shrink-0">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} className="bg-white/95" />
          <button
            onClick={handlePrintBookSection}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Print Current Section"
          >
            <Printer size={16} />
          </button>
          <button
            onClick={() => {
              const rows = filteredPdfItems
                .map(
                  (b, i) =>
                    `<tr><td>${i + 1}</td><td><strong>${b.title}</strong></td><td>${b.className}</td><td>${b.subject}</td><td>${b.pages}</td><td>${b.fileSize}</td></tr>`
                )
                .join('');
              exportAndSaveRealPdf(
                'Books & Guides Catalog — GPS Chambai Kohat',
                `<table><thead><tr><th>#</th><th>Title</th><th>Class</th><th>Subject</th><th>Pages</th><th>File Size</th></tr></thead><tbody>${rows}</tbody></table>`,
                'portrait',
                'Books & Guides/Books/KG',
                'Books & Guides'
              );
            }}
            className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all active:scale-95"
            title="Save Catalog as PDF"
          >
            <Download size={16} />
          </button>
          <button
            onClick={openNewPdfModal}
            className="px-3 py-2 rounded-xl bg-white text-red-700 text-xs font-black flex items-center gap-1 shadow-md active:scale-95"
          >
            <Plus size={15} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs (PDF Library + 4 Functional Options: A. Demanded, B. Received, C. Available Old Books, D. KP Official Subject) */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'pdf_library', label: 'PDF Library (Books & Guides)' },
          { id: 'demanded_qty', label: 'A. Demanded' },
          { id: 'received_qty', label: 'B. Received' },
          { id: 'old_books', label: 'C. Available Old Books' },
          { id: 'kp_official_subjects', label: 'D. KP Official Subject' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as BooksSubTab)}
            className={`px-3 py-2 rounded-xl text-[11px] font-black whitespace-nowrap transition-all ${
              activeSubTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* SUB-TAB 1: PDF LIBRARY (Works for both Books and Guides) */}
      {activeSubTab === 'pdf_library' && (
        <div className="space-y-3">
          {/* Search, Type Filter (All/Books/Guides) & Class Filter */}
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search books & guides by title or subject..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Type Switcher Pills */}
              <div className="flex bg-slate-200 p-1 rounded-xl shrink-0 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSelectedItemType('all')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    selectedItemType === 'all'
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  All ({items.length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItemType('book')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    selectedItemType === 'book'
                      ? 'bg-red-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Books ({items.filter((i) => i.type === 'book').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItemType('guide')}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all ${
                    selectedItemType === 'guide'
                      ? 'bg-blue-600 text-white shadow-2xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  Guides ({items.filter((i) => i.type === 'guide').length})
                </button>
              </div>
            </div>

            <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
              <button
                onClick={() => setSelectedClassFilter('ALL')}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                  selectedClassFilter === 'ALL'
                    ? 'bg-slate-900 text-white'
                    : 'bg-white text-slate-600 border border-slate-200'
                }`}
              >
                All Classes
              </button>
              {OFFICIAL_SIX_CLASSES.map((cls) => (
                <button
                  key={cls.id}
                  onClick={() => setSelectedClassFilter(cls.id)}
                  style={
                    selectedClassFilter === cls.id
                      ? { backgroundColor: cls.hex, color: '#FFFFFF' }
                      : undefined
                  }
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black whitespace-nowrap ${
                    selectedClassFilter === cls.id
                      ? 'shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200'
                  }`}
                >
                  {cls.shortCode}
                </button>
              ))}
            </div>
          </div>

          {/* PDF Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredPdfItems.map((item) => {
              const clsColor = getClassHexColor(item.classId || item.className);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col justify-between gap-3"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="w-12 h-14 rounded-xl flex flex-col items-center justify-center text-white font-black shadow-sm shrink-0"
                      style={{ backgroundColor: clsColor }}
                    >
                      <BookOpen size={18} />
                      <span className="text-[8px] mt-0.5">PDF</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="text-[9px] font-black px-2 py-0.5 rounded-full text-white"
                          style={{ backgroundColor: clsColor }}
                        >
                          {item.className}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {item.pages} Pages • {item.fileSize}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 mt-1 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-500 truncate">
                        Subject: {item.subject}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => setViewingPdf(item)}
                      className="flex-1 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                    >
                      <Eye size={14} />
                      <span>Read & Print PDF</span>
                    </button>
                    <button
                      onClick={() => openEditPdfModal(item)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Edit Book Details"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({ type: 'pdf', id: item.id, label: item.title })
                      }
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Book"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION A & B: DEMANDED / RECEIVED (Fields: Class, Qty, Date) */}
      {(activeSubTab === 'demanded_qty' || activeSubTab === 'received_qty') && (
        <div className="space-y-4">
          {activeSubTab === 'received_qty' && <AnnualBooksReceivedTable />}
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {activeSubTab === 'demanded_qty'
                  ? 'A. Demanded Books (Class • Qty • Date)'
                  : 'B. Received Books (Class • Qty • Date)'}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                All fields (Class, Qty, Date, Subject) are directly editable. Add, edit, update, or delete records.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingDemand(null);
                setDemandClassName('KG / Kachi (ECE)');
                setDemandSubject('Urdu — اردو');
                setDemandBookCategory('New');
                setDemandedQtyInput('40');
                setReceivedQtyInput('40');
                setDemandDateInput(new Date().toISOString().split('T')[0]);
                setShowDemandModal(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
            >
              <Plus size={14} />
              <span>Add {activeSubTab === 'demanded_qty' ? 'Demanded' : 'Received'} Record</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {demands.map((d) => {
              const clsColor = getClassHexColor(d.classId || d.className);
              const isDemandView = activeSubTab === 'demanded_qty';
              const recordDate =
                (isDemandView ? d.demandDate || d.date : d.receivingDate || d.date) ||
                new Date().toISOString().split('T')[0];

              return (
                <div
                  key={d.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className="w-3 h-12 rounded-full shrink-0"
                      style={{ backgroundColor: clsColor }}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      {/* Editable Class Field */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Class
                        </label>
                        <select
                          value={d.className}
                          onChange={(e) => {
                            const nextCls =
                              OFFICIAL_SIX_CLASSES.find((c) => c.displayName === e.target.value) ||
                              OFFICIAL_SIX_CLASSES[0];
                            StorageService.updateBookDemand({
                              ...d,
                              classId: nextCls.id,
                              className: nextCls.displayName,
                            });
                            refreshAll();
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                        >
                          {OFFICIAL_SIX_CLASSES.map((c) => (
                            <option key={c.id} value={c.displayName}>
                              {c.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Editable Qty Field */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          {isDemandView ? 'Demanded Qty' : 'Received Qty'}
                        </label>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min={0}
                            value={isDemandView ? d.demandedQty ?? 0 : d.receivedQty ?? 0}
                            onChange={(e) => {
                              const val = Math.max(0, parseInt(e.target.value, 10) || 0);
                              StorageService.updateBookDemand({
                                ...d,
                                [isDemandView ? 'demandedQty' : 'receivedQty']: val,
                              });
                              refreshAll();
                            }}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                          />
                        </div>
                      </div>

                      {/* Editable Date Field */}
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Date
                        </label>
                        <input
                          type="date"
                          value={recordDate}
                          onChange={(e) => {
                            StorageService.updateBookDemand({
                              ...d,
                              date: e.target.value,
                              [isDemandView ? 'demandDate' : 'receivingDate']: e.target.value,
                            });
                            refreshAll();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <span className="text-xs font-black text-slate-700 px-2">
                      {d.subject}
                    </span>
                    <button
                      onClick={() => {
                        setEditingDemand(d);
                        setDemandClassName(d.className);
                        setDemandSubject(d.subject);
                        setDemandBookCategory(d.bookCategory || 'New');
                        setDemandedQtyInput(String(d.demandedQty ?? 0));
                        setReceivedQtyInput(String(d.receivedQty ?? 0));
                        setDemandDateInput(recordDate);
                        setShowDemandModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Edit Record"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'demand',
                          id: d.id,
                          label: `${d.className} - ${d.subject}`,
                        })
                      }
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION C: AVAILABLE OLD BOOKS (Fields: Class, Qty) */}
      {activeSubTab === 'old_books' && (
        <div className="space-y-3">
          <div className="bg-white rounded-2xl p-3.5 border border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900">
                C. Available Old Books (Class • Qty)
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Edit Class and Qty directly, or add, update, and delete old book records
              </p>
            </div>
            <button
              onClick={() => {
                setEditingOldBook(null);
                setOldBookClass('Class 1');
                setOldBookSubject('Urdu — اردو');
                setOldBookQty('15');
                setOldBookCondition('Good');
                setOldBookRemarks('Reusable session stock');
                setShowOldBookModal(true);
              }}
              className="px-3 py-2 rounded-xl bg-amber-600 text-white text-xs font-black flex items-center gap-1"
            >
              <Plus size={14} />
              <span>Add Old Book</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {oldBooks.map((ob) => {
              const clsColor = getClassHexColor(ob.classId || ob.className);
              return (
                <div
                  key={ob.id}
                  className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl text-white flex items-center justify-center shrink-0"
                      style={{ backgroundColor: clsColor }}
                    >
                      <Archive size={18} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Class
                        </label>
                        <select
                          value={ob.className}
                          onChange={(e) => {
                            const nextCls =
                              OFFICIAL_SIX_CLASSES.find((c) => c.displayName === e.target.value) ||
                              OFFICIAL_SIX_CLASSES[0];
                            StorageService.updateOldBook({
                              ...ob,
                              classId: nextCls.id,
                              className: nextCls.displayName,
                            });
                            refreshAll();
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                        >
                          {OFFICIAL_SIX_CLASSES.map((c) => (
                            <option key={c.id} value={c.displayName}>
                              {c.displayName}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Qty (Available)
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={ob.availableQty ?? 0}
                          onChange={(e) => {
                            StorageService.updateOldBook({
                              ...ob,
                              availableQty: Math.max(0, parseInt(e.target.value, 10) || 0),
                            });
                            refreshAll();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="block text-[9px] font-black uppercase text-slate-400">
                          Subject
                        </label>
                        <input
                          type="text"
                          value={ob.subject}
                          onChange={(e) => {
                            StorageService.updateOldBook({
                              ...ob,
                              subject: e.target.value,
                            });
                            refreshAll();
                          }}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => {
                        setEditingOldBook(ob);
                        setOldBookClass(ob.className);
                        setOldBookSubject(ob.subject);
                        setOldBookQty(String(ob.availableQty ?? 0));
                        setOldBookCondition(ob.condition || 'Good');
                        setOldBookRemarks(ob.remarks || '');
                        setShowOldBookModal(true);
                      }}
                      className="p-2 rounded-xl bg-slate-100 text-slate-700"
                      title="Edit Old Book"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'old_book',
                          id: ob.id,
                          label: `${ob.className} - ${ob.subject}`,
                        })
                      }
                      className="p-2 rounded-xl bg-rose-50 text-rose-600"
                      title="Delete Old Book"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION D: KP OFFICIAL SUBJECT (Fields: Class, Subjects) */}
      {activeSubTab === 'kp_official_subjects' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
            <h3 className="text-sm font-black text-slate-900">
              D. KP Official Subject (Class • Subjects)
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Add, edit, update, or delete Class and Subjects in the KP Official Subject register.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* 1. Class Field */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Class
                </label>
                <select
                  value={kpClassOption}
                  onChange={(e) => setKpClassOption(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-900"
                >
                  {OFFICIAL_SIX_CLASSES.map((c) => (
                    <option key={c.id} value={c.kpSubjectDropdownLabel}>
                      {c.kpSubjectDropdownLabel}
                    </option>
                  ))}
                </select>
              </div>

              {/* 2. Subjects Field (Editable Input + Quick Select) */}
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Subjects
                </label>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={kpBookOption}
                    onChange={(e) => setKpBookOption(e.target.value)}
                    placeholder="Enter or select subject..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900"
                  />
                  <select
                    value={
                      getSubjectsForClass(kpClassOption).some((b) => b.fullLabel === kpBookOption)
                        ? kpBookOption
                        : ''
                    }
                    onChange={(e) => {
                      if (e.target.value) setKpBookOption(e.target.value);
                    }}
                    className="w-36 px-2 py-2.5 rounded-xl border border-slate-300 bg-slate-50 text-xs font-bold text-slate-700"
                  >
                    <option value="">Preset Subjects</option>
                    {getSubjectsForClass(kpClassOption).map((b) => (
                      <option key={b.id} value={b.fullLabel}>
                        {b.fullLabel}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleAddKpOfficialSubject}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Plus size={15} />
                <span>
                  {editingKpId
                    ? 'Update KP Official Subject'
                    : 'Add to KP Official Subjects Register'}
                </span>
              </button>
              {editingKpId && (
                <button
                  type="button"
                  onClick={() => setEditingKpId(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 text-slate-800 text-xs font-black"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Saved KP Official Subjects List (Editable inline + Edit/Delete) */}
          <div className="space-y-2">
            {kpSubjects.map((rec, idx) => {
              const clsColor = getClassHexColor(rec.classId);
              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl p-3 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span
                      className="w-7 h-7 rounded-lg text-white text-xs font-black flex items-center justify-center shrink-0"
                      style={{ backgroundColor: clsColor }}
                    >
                      {idx + 1}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <select
                        value={rec.classLabel || 'Kachi — ECE'}
                        onChange={(e) => {
                          const nextCls =
                            OFFICIAL_SIX_CLASSES.find(
                              (c) => c.kpSubjectDropdownLabel === e.target.value
                            ) || OFFICIAL_SIX_CLASSES[0];
                          const updated = kpSubjects.map((item) =>
                            item.id === rec.id
                              ? {
                                  ...item,
                                  classId: nextCls.id,
                                  classLabel: e.target.value,
                                }
                              : item
                          );
                          localStorage.setItem(
                            'gps_chambai_kp_official_subjects_v1',
                            JSON.stringify(updated)
                          );
                          refreshAll();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                      >
                        {OFFICIAL_SIX_CLASSES.map((c) => (
                          <option key={c.id} value={c.kpSubjectDropdownLabel}>
                            {c.kpSubjectDropdownLabel}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        value={rec.subjectLabel || ''}
                        onChange={(e) => {
                          const updated = kpSubjects.map((item) =>
                            item.id === rec.id
                              ? {
                                  ...item,
                                  subjectLabel: e.target.value,
                                }
                              : item
                          );
                          localStorage.setItem(
                            'gps_chambai_kp_official_subjects_v1',
                            JSON.stringify(updated)
                          );
                          refreshAll();
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-black text-slate-900"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => {
                        setEditingKpId(rec.id);
                        setKpClassOption(rec.classLabel || 'Kachi — ECE');
                        setKpBookOption(rec.subjectLabel || 'Urdu — اردو');
                      }}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700"
                      title="Edit Subject"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() =>
                        setDeleteConfirm({
                          type: 'kp_subject',
                          id: rec.id,
                          label: `${rec.classLabel} - ${rec.subjectLabel}`,
                        })
                      }
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600"
                      title="Delete Subject"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {viewingPdf && <PdfViewerModal item={viewingPdf} onClose={() => setViewingPdf(null)} />}

      {/* Add/Edit PDF Modal */}
      {showAddPdfModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePdfItem}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                {editingPdfId ? 'Edit' : 'Add'} {mode === 'book' ? 'PDF Book' : 'Teacher Guide'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPdfModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Select Class
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
                Book / Guide Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Urdu Book Class 3"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Urdu / Maths"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">Pages</label>
                <input
                  type="number"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Upload PDF or Document File (Optional)
              </label>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                onChange={handlePdfFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="w-full py-2.5 px-3 rounded-xl border-2 border-dashed border-slate-300 hover:border-emerald-500 text-xs font-bold text-slate-600 flex items-center justify-center gap-2"
              >
                <Upload size={15} />
                <span>
                  {uploadedFileUrl
                    ? `Uploaded (${uploadedFileSize})`
                    : 'Choose PDF / Document from Device'}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Curriculum Description / Notes
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPdfModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black shadow-md"
              >
                Save Permanently
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Demand Modal */}
      {showDemandModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveDemandRecord}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <h3 className="text-base font-black text-slate-900">
              {editingDemand ? 'Edit Book Demand / Received' : 'Add Book Demand / Received'}
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDemandBookCategory('New')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  demandBookCategory === 'New'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                New Book Entry
              </button>
              <button
                type="button"
                onClick={() => setDemandBookCategory('Old')}
                className={`py-2 rounded-xl text-xs font-black border ${
                  demandBookCategory === 'Old'
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                Old Book Entry
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">Class</label>
              <select
                value={demandClassName}
                onChange={(e) => setDemandClassName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {OFFICIAL_SIX_CLASSES.map((c) => (
                  <option key={c.id} value={c.displayName}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">Subject</label>
              <select
                value={demandSubject}
                onChange={(e) => setDemandSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {getSubjectsForClass(demandClassName).map((b) => (
                  <option key={b.id} value={b.fullLabel}>
                    {b.fullLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Demanded Qty
                </label>
                <input
                  type="number"
                  value={demandedQtyInput}
                  onChange={(e) => setDemandedQtyInput(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Received Qty
                </label>
                <input
                  type="number"
                  value={receivedQtyInput}
                  onChange={(e) => setReceivedQtyInput(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={demandDateInput}
                  onChange={(e) => setDemandDateInput(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDemandModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-black"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add/Edit Old Book Modal */}
      {showOldBookModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveOldBook}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3"
          >
            <h3 className="text-base font-black text-slate-900">
              {editingOldBook ? 'Edit Old Book Stock' : 'Add Available Old Books'}
            </h3>
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">Class</label>
              <select
                value={oldBookClass}
                onChange={(e) => setOldBookClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {OFFICIAL_SIX_CLASSES.map((c) => (
                  <option key={c.id} value={c.displayName}>
                    {c.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">Subject</label>
              <select
                value={oldBookSubject}
                onChange={(e) => setOldBookSubject(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                {KP_TEN_OFFICIAL_BOOKS.map((b) => (
                  <option key={b.id} value={b.fullLabel}>
                    {b.fullLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Available Quantity
                </label>
                <input
                  type="number"
                  value={oldBookQty}
                  onChange={(e) => setOldBookQty(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Book Condition
                </label>
                <select
                  value={oldBookCondition}
                  onChange={(e) =>
                    setOldBookCondition(e.target.value as 'Good' | 'Fair' | 'Usable')
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Usable">Usable</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowOldBookModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-black"
              >
                Save Old Stock
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Confirm Deletion</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to delete <strong>{deleteConfirm.label}</strong>?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
