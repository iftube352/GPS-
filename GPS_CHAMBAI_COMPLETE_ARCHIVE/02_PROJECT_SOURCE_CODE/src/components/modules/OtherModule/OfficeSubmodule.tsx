import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  FileText, 
  FileSpreadsheet, 
  FileCheck, 
  Download, 
  Eye, 
  Trash2, 
  Edit2, 
  Filter, 
  Calendar, 
  Building2, 
  Tag, 
  Upload, 
  CheckCircle2,
  Printer
} from 'lucide-react';
import { OfficeDocument, OfficeDocCategory, OfficeFileFormat, Language } from '../../../types';
import { translations } from '../../../i18n/translations';
import { StorageService } from '../../../services/storage';
import { Modal } from '../../common/Modal';
import { ConfirmDialog } from '../../common/ConfirmDialog';

interface OfficeSubmoduleProps {
  onBack: () => void;
  currentLang: Language;
}

export const OfficeSubmodule: React.FC<OfficeSubmoduleProps> = ({
  onBack,
  currentLang
}) => {
  const t = translations[currentLang];
  const [documents, setDocuments] = useState<OfficeDocument[]>(StorageService.getOfficeDocs());
  const [selectedTab, setSelectedTab] = useState<'all' | OfficeDocCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | OfficeFileFormat>('all');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<OfficeDocument | null>(null);
  const [viewingDoc, setViewingDoc] = useState<OfficeDocument | null>(null);
  const [docToDelete, setDocToDelete] = useState<OfficeDocument | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    urduTitle: '',
    category: 'Notification' as OfficeDocCategory,
    referenceNo: '',
    date: new Date().toISOString().split('T')[0],
    issuingAuthority: 'District Education Officer (M) Kohat',
    fileFormat: 'PDF' as OfficeFileFormat,
    fileName: '',
    fileSize: '1.2 MB',
    fileDataUrl: '',
    description: ''
  });

  const refreshDocs = () => {
    setDocuments(StorageService.getOfficeDocs());
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFormData({
      title: '',
      urduTitle: '',
      category: 'Notification',
      referenceNo: `DEO/KHT/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString().split('T')[0],
      issuingAuthority: 'District Education Officer (M) Kohat',
      fileFormat: 'PDF',
      fileName: 'Office_Document.pdf',
      fileSize: '1.1 MB',
      fileDataUrl: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (doc: OfficeDocument) => {
    setEditingDoc(doc);
    setFormData({
      title: doc.title,
      urduTitle: doc.urduTitle || '',
      category: doc.category,
      referenceNo: doc.referenceNo,
      date: doc.date,
      issuingAuthority: doc.issuingAuthority,
      fileFormat: doc.fileFormat,
      fileName: doc.fileName,
      fileSize: doc.fileSize,
      fileDataUrl: doc.fileDataUrl || '',
      description: doc.description || ''
    });
    setIsAddModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Detect format
    let format: OfficeFileFormat = 'PDF';
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      format = 'Excel';
    } else if (ext === 'doc' || ext === 'docx') {
      format = 'Word';
    } else {
      format = 'PDF';
    }

    const sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileName: file.name,
        fileFormat: format,
        fileSize: sizeStr,
        fileDataUrl: dataUrl
      }));
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const newDoc: OfficeDocument = {
      id: editingDoc ? editingDoc.id : `off-${Date.now()}`,
      title: formData.title.trim(),
      urduTitle: formData.urduTitle.trim() || undefined,
      category: formData.category,
      referenceNo: formData.referenceNo.trim(),
      date: formData.date,
      issuingAuthority: formData.issuingAuthority.trim(),
      fileFormat: formData.fileFormat,
      fileName: formData.fileName.trim() || `Document_${Date.now()}.${formData.fileFormat === 'Excel' ? 'xlsx' : formData.fileFormat === 'Word' ? 'docx' : 'pdf'}`,
      fileSize: formData.fileSize || '1.0 MB',
      fileDataUrl: formData.fileDataUrl || undefined,
      description: formData.description.trim() || undefined,
      uploadedAt: editingDoc ? editingDoc.uploadedAt : new Date().toISOString(),
      status: 'Active'
    };

    StorageService.saveOfficeDoc(newDoc);
    setIsAddModalOpen(false);
    refreshDocs();
  };

  const handleDeleteDoc = () => {
    if (!docToDelete) return;
    StorageService.deleteOfficeDoc(docToDelete.id);
    setDocToDelete(null);
    refreshDocs();
  };

  const handleDownloadFile = (doc: OfficeDocument) => {
    if (doc.fileDataUrl) {
      const link = document.createElement('a');
      link.href = doc.fileDataUrl;
      link.download = doc.fileName;
      link.click();
      return;
    }

    // Generate fallback text or document content
    const content = `GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT\nElementary & Secondary Education Department KP\n\nTitle: ${doc.title}\nReference No: ${doc.referenceNo}\nDate: ${doc.date}\nIssuing Authority: ${doc.issuingAuthority}\nCategory: ${doc.category}\nFormat: ${doc.fileFormat}\n\nDescription:\n${doc.description || 'Official departmental record archived in GPS Chambai electronic database.'}\n\nVerified by: Headmaster GPS Chambai Kohat`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.fileName || `${doc.title.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredDocs = documents.filter(doc => {
    const matchesTab = selectedTab === 'all' || doc.category === selectedTab;
    const matchesFormat = formatFilter === 'all' || doc.fileFormat === formatFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      doc.title.toLowerCase().includes(query) ||
      (doc.urduTitle && doc.urduTitle.toLowerCase().includes(query)) ||
      doc.referenceNo.toLowerCase().includes(query) ||
      doc.issuingAuthority.toLowerCase().includes(query) ||
      (doc.description && doc.description.toLowerCase().includes(query));

    return matchesTab && matchesFormat && matchesSearch;
  });

  const getFormatBadge = (format: OfficeFileFormat) => {
    switch (format) {
      case 'PDF':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200',
          icon: FileText,
          label: 'PDF'
        };
      case 'Excel':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          icon: FileSpreadsheet,
          label: 'Excel'
        };
      case 'Word':
        return {
          bg: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: FileCheck,
          label: 'Word'
        };
    }
  };

  const getCategoryBadge = (cat: OfficeDocCategory) => {
    switch (cat) {
      case 'Notification':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Order':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Performa':
        return 'bg-teal-50 text-teal-800 border-teal-200';
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {t.moduleOffice}
            </h2>
            <p className="text-xs text-slate-500">
              {t.moduleOfficeDesc} ({documents.length} {currentLang === 'ur' ? 'دستاویزات' : 'Records'})
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addDocument}</span>
        </button>
      </div>

      {/* Tabs: All, Notifications, Orders, Performas */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200 text-xs">
        {[
          { id: 'all', label: t.officeTabAll, count: documents.length },
          { id: 'Notification', label: t.officeTabNotifications, count: documents.filter(d => d.category === 'Notification').length },
          { id: 'Order', label: t.officeTabOrders, count: documents.filter(d => d.category === 'Order').length },
          { id: 'Performa', label: t.officeTabPerformas, count: documents.filter(d => d.category === 'Performa').length }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedTab(tab.id as 'all' | OfficeDocCategory)}
            className={`flex-1 min-w-[120px] py-2 px-3 rounded-xl font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
              selectedTab === tab.id
                ? 'bg-white text-emerald-800 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
              selectedTab === tab.id ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search & Format Filter */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={currentLang === 'ur' ? 'عنوان، ڈسپیچ نمبر یا اتھارٹی تلاش کریں...' : 'Search title, reference number, or issuing authority...'}
            className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as 'all' | OfficeFileFormat)}
            className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">{currentLang === 'ur' ? 'تمام فارمیٹس (All Formats)' : 'All Formats (PDF, Excel, Word)'}</option>
            <option value="PDF">PDF (.pdf)</option>
            <option value="Excel">Excel (.xlsx)</option>
            <option value="Word">Word (.docx)</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700">{t.emptyStateTitle}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t.emptyStateSubtitle}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc) => {
            const fmt = getFormatBadge(doc.fileFormat);
            const FmtIcon = fmt.icon;
            const catBadge = getCategoryBadge(doc.category);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold border ${catBadge}`}>
                      {doc.category}
                    </span>

                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${fmt.bg}`}>
                      <FmtIcon className="w-3 h-3" />
                      <span>{fmt.label}</span>
                    </span>
                  </div>

                  {/* Title & Ref */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {doc.title}
                    </h3>
                    {doc.urduTitle && (
                      <p className="text-xs text-slate-500 font-urdu mt-0.5 line-clamp-1">
                        {doc.urduTitle}
                      </p>
                    )}
                  </div>

                  {/* Meta Details */}
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{t.referenceNo}:</span>
                      <span className="font-mono font-semibold text-slate-800">{doc.referenceNo}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{t.date}:</span>
                      <span className="font-mono text-slate-800">{doc.date}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">{t.issuingAuthority}:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[160px]" title={doc.issuingAuthority}>
                        {doc.issuingAuthority}
                      </span>
                    </div>
                  </div>

                  {doc.description && (
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {doc.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewingDoc(doc)}
                      className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      title={t.viewDocument}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownloadFile(doc)}
                      className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t.downloadDocument}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(doc)}
                      className="p-1.5 text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                      title={t.edit}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => setDocToDelete(doc)}
                    className="p-1.5 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Document Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingDoc ? t.editDocument : t.addDocument}
      >
        <form onSubmit={handleSaveDoc} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.docTitle} *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. KPK Free Textbook Receiving Schedule 2026-27"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              عنوان اردو (اختیاری)
            </label>
            <input
              type="text"
              value={formData.urduTitle}
              onChange={(e) => setFormData(prev => ({ ...prev, urduTitle: e.target.value }))}
              placeholder="مثال: مفت درسی کتب کی فراہمی و تقسیم شیڈول"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-urdu"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.docCategory} *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as OfficeDocCategory }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="Notification">Notification (نوٹیفکیشن)</option>
                <option value="Order">Order (حکم نامہ)</option>
                <option value="Performa">Performa (پرفارما)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.fileFormat} *
              </label>
              <select
                value={formData.fileFormat}
                onChange={(e) => setFormData(prev => ({ ...prev, fileFormat: e.target.value as OfficeFileFormat }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="PDF">PDF (.pdf)</option>
                <option value="Excel">Excel (.xlsx)</option>
                <option value="Word">Word (.docx)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.referenceNo} *
              </label>
              <input
                type="text"
                required
                value={formData.referenceNo}
                onChange={(e) => setFormData(prev => ({ ...prev, referenceNo: e.target.value }))}
                placeholder="e.g. DEO/KHT/2026/894"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {t.date} *
              </label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.issuingAuthority} *
            </label>
            <input
              type="text"
              required
              value={formData.issuingAuthority}
              onChange={(e) => setFormData(prev => ({ ...prev, issuingAuthority: e.target.value }))}
              placeholder="e.g. District Education Officer (M) Kohat"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Upload File Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.uploadDocumentFile}
            </label>
            <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-xl p-3 text-center transition-colors">
              <input
                type="file"
                accept=".pdf,.xlsx,.xls,.docx,.doc,.csv"
                onChange={handleFileUpload}
                className="hidden"
                id="office-doc-upload"
              />
              <label htmlFor="office-doc-upload" className="cursor-pointer block">
                <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-emerald-800">
                  {formData.fileName ? formData.fileName : (currentLang === 'ur' ? 'پی ڈی ایف، ایکسل یا ورڈ فائل منتخب کریں' : 'Choose PDF, Excel, or Word file')}
                </span>
                <p className="text-[10px] text-slate-400 mt-0.5">Supports .pdf, .xlsx, .docx (Max 15MB)</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {t.description}
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief details or departmental directives..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Document Preview Modal */}
      {viewingDoc && (
        <Modal
          isOpen={!!viewingDoc}
          onClose={() => setViewingDoc(null)}
          title={`${viewingDoc.category}: ${viewingDoc.referenceNo}`}
        >
          <div className="space-y-4">
            {/* Official Letterhead Header */}
            <div className="bg-emerald-950 text-white p-4 rounded-xl text-center space-y-1">
              <div className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">
                Government of Khyber Pakhtunkhwa
              </div>
              <div className="text-sm font-bold text-white">
                {viewingDoc.issuingAuthority}
              </div>
              <div className="text-[11px] text-emerald-200 font-urdu">
                محکمہ ابتدائی و ثانوی تعلیم، خیبر پختونخوا
              </div>
            </div>

            {/* Document Content View */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 font-serif">
              <div className="flex justify-between items-center text-xs border-b border-slate-200 pb-2">
                <span className="font-mono font-bold text-slate-700">Ref: {viewingDoc.referenceNo}</span>
                <span className="font-mono text-slate-700">Date: {viewingDoc.date}</span>
              </div>

              <div className="text-center py-2">
                <h3 className="font-bold text-sm text-slate-900 uppercase underline tracking-wide">
                  {viewingDoc.title}
                </h3>
                {viewingDoc.urduTitle && (
                  <p className="text-xs text-slate-600 font-urdu mt-1">
                    {viewingDoc.urduTitle}
                  </p>
                )}
              </div>

              <p className="text-xs text-slate-700 leading-relaxed indent-4">
                {viewingDoc.description || 'This official document is duly registered and verified in the Government Primary School Chambai Kohat office repository under the Elementary and Secondary Education Department Khyber Pakhtunkhwa directives.'}
              </p>

              {/* Verified Stamp */}
              <div className="pt-4 flex justify-between items-end text-xs">
                <div className="border border-emerald-600/40 rounded-lg p-2 text-[10px] text-emerald-800 bg-emerald-50 inline-block font-sans">
                  <div className="font-bold">ELECTRONIC ARCHIVE VERIFIED</div>
                  <div>GPS CHAMBAI KOHAT</div>
                  <div>Format: {viewingDoc.fileFormat} · {viewingDoc.fileSize}</div>
                </div>

                <div className="text-right">
                  <div className="font-bold text-slate-900">Headmaster / SDEO</div>
                  <div className="text-[10px] text-slate-500">Authorized Signatory</div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-between items-center pt-2 border-t border-slate-100">
              <button
                onClick={() => handleDownloadFile(viewingDoc)}
                className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>{t.downloadDocument} ({viewingDoc.fileFormat})</span>
              </button>

              <button
                onClick={() => setViewingDoc(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                {t.close}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!docToDelete}
        title={t.delete}
        message={t.deleteDocConfirm}
        confirmLabel={t.delete}
        cancelLabel={t.cancel}
        danger={true}
        onConfirm={handleDeleteDoc}
        onClose={() => setDocToDelete(null)}
        currentLang={currentLang}
      />
    </div>
  );
};
