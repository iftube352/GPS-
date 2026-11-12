import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Printer,
  Eye,
  Download,
  RotateCcw,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Image as ImageIcon,
  Save,
  School,
  X,
  FolderOpen,
  Plus,
  Trash2,
} from 'lucide-react';
import { SsrDataState, SsrStorageService } from '../../services/ssrStorageService';
import { SsrExportService } from '../../services/ssrExportService';
import { StorageFolderService, StoredFileRecord } from '../../services/storageFolderService';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface SsrModuleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

export const SsrModule: React.FC<SsrModuleProps> = ({ onBack, lang }) => {
  const [data, setData] = useState<SsrDataState>(() => SsrStorageService.getSsrData());
  const [viewMode, setViewMode] = useViewMode('ssr_module');
  const [activePage, setActivePage] = useState<number>(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [showSavedRecordsModal, setShowSavedRecordsModal] = useState<boolean>(false);
  const [savedSsrFiles, setSavedSsrFiles] = useState<StoredFileRecord[]>([]);

  useEffect(() => {
    const handleUpdate = () => setData(SsrStorageService.getSsrData());
    window.addEventListener('gps-ssr-updated', handleUpdate);
    return () => window.removeEventListener('gps-ssr-updated', handleUpdate);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const updateField = (field: keyof SsrDataState, value: any) => {
    const updated = { ...data, [field]: value };
    setData(updated);
    SsrStorageService.saveSsrData(updated);
  };

  const handleSaveToInternalStorage = async () => {
    SsrStorageService.saveSsrData(data);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const jsonFileName = `SSR_Record_EMIS_${data.emisCode}_${stamp}.json`;
    await StorageFolderService.saveFileToFolder({
      folderPath: 'SSR/SSR Documents',
      fileName: jsonFileName,
      mimeType: 'application/json',
      data: JSON.stringify(data, null, 2),
      sourceModule: 'SSR',
    });
    showToast(`Saved SSR Record to GPS Chambai/SSR/SSR Documents/${jsonFileName}`);
  };

  const handleOpenSavedRecordsModal = () => {
    const files = StorageFolderService.getFilesInFolder('SSR/SSR Documents').filter((f) =>
      f.fileName.endsWith('.json')
    );
    setSavedSsrFiles(files);
    setShowSavedRecordsModal(true);
  };

  const handleReopenSavedSsrFile = async (fileRec: StoredFileRecord) => {
    try {
      const dataUrl = await StorageFolderService.getFileDataUrl(fileRec.id);
      if (!dataUrl) {
        showToast('Could not read saved SSR file.');
        return;
      }
      const res = await fetch(dataUrl);
      const parsed = (await res.json()) as SsrDataState;
      if (parsed && parsed.emisCode) {
        setData(parsed);
        SsrStorageService.saveSsrData(parsed);
        setShowSavedRecordsModal(false);
        showToast(`Reopened saved SSR record: ${fileRec.fileName}`);
      }
    } catch {
      showToast('Failed to parse saved SSR JSON record.');
    }
  };

  const handleResetDefaults = () => {
    if (
      confirm(
        lang === 'ur'
          ? 'کیا آپ تمام فیلڈز کو ڈیفالٹ پر ری سیٹ کرنا چاہتے ہیں؟'
          : 'Reset all 16 pages to GPS Chambai official defaults?'
      )
    ) {
      const reset = SsrStorageService.resetSsrData();
      setData(reset);
      showToast(
        lang === 'ur' ? 'ریکارڈ ڈیفالٹ پر بحال ہو گیا' : 'Reset to official GPS Chambai data!'
      );
    }
  };

  const handlePrint = () => {
    SsrExportService.printSsr(data);
    showToast('Printing all 16 pages of SSR Performa...');
  };

  const handleSavePdf = async () => {
    const res = await SsrExportService.savePdf(data);
    showToast(`Saved ${res.fileName} to GPS Chambai/SSR/PDF Reports`);
    setShowExportMenu(false);
  };

  const handleSaveDocx = async () => {
    const res = await SsrExportService.saveDocx(data);
    showToast(`Saved Word Doc (${res.fileName}) to GPS Chambai/SSR/SSR Documents`);
    setShowExportMenu(false);
  };

  const handleSaveXlsx = () => {
    const res = SsrExportService.saveXlsx(data);
    showToast(`Saved Excel spreadsheet (${res.fileName}) to GPS Chambai/SSR/SSR Documents`);
    setShowExportMenu(false);
  };

  const handleSaveJpg = async () => {
    const res = await SsrExportService.saveJpg(data);
    showToast(`Saved high-resolution image (${res.fileName}) to GPS Chambai/SSR/PDF Reports`);
    setShowExportMenu(false);
  };

  const pageNames = [
    '(01) Basic Info',
    '(02) Building',
    '(03) Facilities',
    'Toilets & Sports',
    '(04) Enrollment',
    'Age Groups (Boys)',
    'Age Groups (Girls)',
    'Difficulties',
    'Learning Assessment',
    'Scholarships',
    '(05) Staff / HR',
    'Double Shift Staff',
    'PTC / UNICEF Staff',
    '(06) PTC & (07) ECE',
    '(08) ICT & Labs',
    '(09) Commodities',
  ];

  // Helper to render editable scalar string fields for any page
  const renderEditableGrid = (
    fields: Array<{ label: string; key: keyof SsrDataState; type?: string }>
  ) => (
    <div
      className={
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
          : 'space-y-2.5'
      }
    >
      {fields.map((f) => (
        <div
          key={String(f.key)}
          className={
            viewMode === 'list'
              ? 'flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-xl border border-slate-200'
              : ''
          }
        >
          <label className="block text-[11px] font-black text-slate-700 mb-1">
            {f.label}
          </label>
          <input
            type={f.type || 'text'}
            value={String(data[f.key] ?? '')}
            onChange={(e) => updateField(f.key, e.target.value)}
            className={`${
              viewMode === 'list' ? 'sm:w-2/3' : 'w-full'
            } px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:border-emerald-600 outline-none bg-white`}
          />
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-3 sm:p-4 space-y-4 pb-20 animate-fade-in max-w-6xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-teal-900 via-emerald-800 to-slate-900 text-white rounded-3xl p-4 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center shrink-0 transition-all active:scale-95"
            title="Go Back"
          >
            <ArrowLeft size={19} />
          </button>
          <div>
            <h2 className="text-xl font-black tracking-tight">
              {lang === 'ur'
                ? 'سکول سیلف رپورٹنگ (SSR)'
                : 'School Self Reporting (SSR)'}
            </h2>
          </div>
        </div>

        {/* Action Buttons: View Mode, Save to Internal Storage, Reopen Saved, Preview, Print, Save As */}
        <div className="flex items-center gap-1.5 flex-wrap self-end md:self-center relative">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} className="bg-white/95" />

          <button
            onClick={handleSaveToInternalStorage}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Save SSR Record to Internal Storage (GPS Chambai/SSR)"
          >
            <Save size={15} />
            <span>Save to Storage</span>
          </button>

          <button
            onClick={handleOpenSavedRecordsModal}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 border border-white/20 transition-all active:scale-95"
            title="Reopen Saved SSR Records"
          >
            <FolderOpen size={15} />
            <span>Reopen Saved</span>
          </button>

          <button
            onClick={() => setShowPreviewModal(true)}
            className="px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-black flex items-center gap-1.5 border border-white/20 transition-all active:scale-95"
            title="Print Preview All 16 Pages"
          >
            <Eye size={15} />
            <span>Preview</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3 py-2 rounded-xl bg-white text-emerald-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            title="Print All 16 Pages"
          >
            <Printer size={15} />
            <span>Print All 16</span>
          </button>

          {/* Export Dropdown (PDF, DOCX, XLSX, JPG) */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Download size={15} />
              <span>Export...</span>
            </button>

            {showExportMenu && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-2xl border border-slate-200 p-1.5 z-50 text-slate-900 space-y-1 animate-fade-in">
                <button
                  onClick={handleSavePdf}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <FileText size={16} className="text-rose-600" />
                  <span>Export as PDF (.pdf)</span>
                </button>
                <button
                  onClick={handleSaveDocx}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <FileText size={16} className="text-blue-600" />
                  <span>Export as Word (.doc)</span>
                </button>
                <button
                  onClick={handleSaveXlsx}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <FileSpreadsheet size={16} className="text-emerald-600" />
                  <span>Export as Excel (.xlsx)</span>
                </button>
                <button
                  onClick={handleSaveJpg}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 flex items-center gap-2 text-xs font-bold transition-colors"
                >
                  <ImageIcon size={16} className="text-amber-600" />
                  <span>Export as Image (.jpg)</span>
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleResetDefaults}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-all"
            title="Reset to Defaults"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 16-Page Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {pageNames.map((name, idx) => {
          const pageNum = idx + 1;
          const isActive = activePage === pageNum;
          return (
            <button
              key={pageNum}
              onClick={() => setActivePage(pageNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>
                {pageNum}. {name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Current Page Form Body */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm min-h-[500px] space-y-4">
        {/* Page Title Header */}
        <div className="border-b border-slate-200 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-xs">
              {activePage}
            </span>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Page {activePage} of 16 — {pageNames[activePage - 1]}
              </h3>
              <p className="text-[11px] text-slate-500 font-semibold">
                Every field on this page is 100% editable and auto-saved
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={activePage === 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
            >
              <ChevronLeft size={14} />
              <span>Prev Page</span>
            </button>
            <button
              disabled={activePage === 16}
              onClick={() => setActivePage((p) => Math.min(16, p + 1))}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 disabled:opacity-40 text-xs font-bold flex items-center gap-1"
            >
              <span>Next Page</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* PAGE 1: SCHOOL BASIC INFORMATION */}
        {activePage === 1 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (01) School Basic Information (Including Editable Head Teacher Mobile Number)
            </h4>
            {renderEditableGrid([
              { label: '1. EMIS Code', key: 'emisCode' },
              { label: '2. School Name', key: 'schoolName' },
              { label: '3. School Gender (M/F)', key: 'gender' },
              { label: '4. DDO Code', key: 'ddoCode' },
              { label: '5. School Level', key: 'schoolLevel' },
              { label: '6. Type for Primary Schools', key: 'primaryType' },
              { label: '7. Double Shift (Yes/No)', key: 'doubleShift' },
              { label: '8. Double Shift Level', key: 'doubleShiftLevel' },
              { label: '9. DSS Funded By', key: 'dssFundedBy' },
              { label: '10. District', key: 'district' },
              { label: '11. Tehsil', key: 'tehsil' },
              { label: '12. Union Council', key: 'unionCouncil' },
              { label: '13. NC / VC Name', key: 'ncVcName' },
              { label: '14. Cantonment Ward', key: 'cantonmentWard' },
              { label: '15. Village / City Name', key: 'villageCity' },
              { label: '16. Mohalla Name', key: 'mohalla' },
              { label: '17. Street Name / No', key: 'streetName' },
              { label: '18. Location (Urban/Rural)', key: 'location' },
              { label: '19. Terrain (Plain/Hilly)', key: 'terrain' },
              { label: '20. Seasonal School (Yes/No)', key: 'seasonalSchool' },
              { label: '21. Zone (Summer/Winter)', key: 'zone' },
              { label: '22. National Constituency (NA)', key: 'nationalConstituency' },
              { label: '23. Provincial Constituency (PK)', key: 'provincialConstituency' },
              { label: '24a. X Coordinate (Latitude)', key: 'xCoordinate' },
              { label: '24b. Y Coordinate (Longitude)', key: 'yCoordinate' },
              { label: '25a. School Telephone Number', key: 'telephoneNo' },
              { label: '25b. Head Teacher Mobile Number (Editable)', key: 'headMobileNo' },
              { label: '25c. Head Teacher WhatsApp Number (Editable)', key: 'headWhatsAppNo' },
              { label: '26. Official Email', key: 'officialEmail' },
              { label: '27. Circle (ASDEO) Office', key: 'asdeoOffice' },
              { label: '28. SDEO Office', key: 'sdeoOffice' },
              { label: '29. Cluster School Name/EMIS', key: 'clusterSchool' },
              { label: '30. Distance from Cluster', key: 'distanceFromCluster' },
              { label: '31. Upgradation Type', key: 'upgradationType' },
              { label: '32. Year of Establishment', key: 'yearOfEstablishment' },
              { label: '33. Year of Construction', key: 'yearOfConstruction' },
              { label: '36a. Total Trees on Ground', key: 'totalTrees' },
              { label: '36b. Trees Planted This Year', key: 'treesPlantedThisYear' },
              { label: '37. Teacher Guide Available', key: 'teacherGuideAvailable' },
            ])}

            <div className="pt-2">
              <h5 className="text-xs font-black text-slate-800 mb-2">
                38. Utility Bills (during financial year) — Fully Editable
              </h5>
              <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                <table className="w-full text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5 text-left">Utility Name</th>
                      <th className="p-2.5 text-left">Reference #</th>
                      <th className="p-2.5 text-left">Total Bill (Rs.)</th>
                      <th className="p-2.5 text-left">Total Paid (Rs.)</th>
                      <th className="p-2.5 text-left">Outstanding (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {data.utilityBills.map((u, i) => (
                      <tr key={i}>
                        <td className="p-2">
                          <input
                            type="text"
                            value={u.name}
                            onChange={(e) => {
                              const copy = [...data.utilityBills];
                              copy[i].name = e.target.value;
                              updateField('utilityBills', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={u.refNo}
                            onChange={(e) => {
                              const copy = [...data.utilityBills];
                              copy[i].refNo = e.target.value;
                              updateField('utilityBills', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={u.totalBill}
                            onChange={(e) => {
                              const copy = [...data.utilityBills];
                              copy[i].totalBill = e.target.value;
                              updateField('utilityBills', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={u.paid}
                            onChange={(e) => {
                              const copy = [...data.utilityBills];
                              copy[i].paid = e.target.value;
                              updateField('utilityBills', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={u.outstanding}
                            onChange={(e) => {
                              const copy = [...data.utilityBills];
                              copy[i].outstanding = e.target.value;
                              updateField('utilityBills', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* PAGE 2: BUILDING INFORMATION */}
        {activePage === 2 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (02) School Building Information — All Fields Editable
            </h4>
            {renderEditableGrid([
              { label: '39.1 Total Land of School (Marlas)', key: 'totalLandMarlas' },
              { label: '39.2 Land Mutated to ESED (Yes/No)', key: 'landMutated' },
              { label: '39.3 Total Covered Area (Marlas)', key: 'coveredAreaMarlas' },
              { label: '39.4 Uncovered Area Available (Yes/No)', key: 'uncoveredAreaAvailable' },
              { label: 'Uncovered Total Area (Marlas)', key: 'uncoveredAreaTotal' },
              { label: 'Uncovered Within Premises (Marlas)', key: 'uncoveredWithinPremises' },
              { label: 'Uncovered Adjacent (Marlas)', key: 'uncoveredAdjacent' },
              { label: 'Uncovered Remarks', key: 'uncoveredRemarks' },
              { label: '40. Ownership of Building', key: 'buildingOwnership' },
              { label: 'Adjusted School EMIS', key: 'adjustedSchoolEmis' },
              { label: 'Monthly Rent (Rs.)', key: 'monthlyRent' },
              { label: '41.1 Pakka Classrooms', key: 'pakkaClassRooms' },
              { label: '41.2 Pakka Other Rooms', key: 'pakkaOtherRooms' },
              { label: '41.3 Kacha Classrooms', key: 'kachaClassRooms' },
              { label: 'Kacha Other Rooms', key: 'kachaOtherRooms' },
              { label: 'Fabricated Classrooms', key: 'fabricatedClassRooms' },
              { label: '42. Rooms on Ground Floor', key: 'roomsGround' },
              { label: 'Rooms in Basement', key: 'roomsBasement' },
              { label: 'Rooms on 1st Floor', key: 'roomsFirst' },
              { label: '43. Previously Reconstructed', key: 'previouslyReconstructed' },
              { label: 'Whole Building Needs Reconstruction', key: 'wholeBuildingNeedsReconstruction' },
              { label: 'Classrooms Requiring Major Repair', key: 'classroomsRequiringMajorRepair' },
              { label: 'Other Rooms Requiring Major Repair', key: 'otherRoomsRequiringMajorRepair' },
              { label: '44. Most Recent Additional Construction', key: 'mostRecentAdditionalConstruction' },
              { label: 'Additional Classrooms Built', key: 'additionalClassRooms' },
              { label: 'Additional Other Rooms Built', key: 'additionalOtherRooms' },
              { label: 'Additional Toilets Built', key: 'additionalToilets' },
              { label: 'Boundary Wall Built', key: 'boundaryWallBuilt' },
            ])}
          </div>
        )}

        {/* PAGE 3: FACILITIES */}
        {activePage === 3 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (03) School Facilities (Offices, Power, Water, Boundary Wall, Staff Toilets)
            </h4>
            {renderEditableGrid([
              { label: 'Additional Classrooms Required', key: 'additionalClassroomsRequired' },
              { label: 'Under Construction Classrooms', key: 'underConstructionClassrooms' },
              { label: 'Principal / Head Office Exists', key: 'principalOfficeExist' },
              { label: 'Head Teacher Office In Use', key: 'headTeacherOfficeInUse' },
              { label: 'Clerk Office Exists', key: 'clerkOfficeExist' },
              { label: 'Clerk Room In Use', key: 'clerkRoomInUse' },
              { label: 'Staff Room In Use', key: 'staffRoomInUse' },
              { label: 'Stores Exist', key: 'storesExist' },
              { label: 'Library Available', key: 'libraryAvailable' },
              { label: 'Library Books Available', key: 'libraryBooksAvailable' },
              { label: 'Library Functional', key: 'libraryFunctional' },
              { label: 'Electricity Available', key: 'electricityAvailable' },
              { label: 'WAPDA Available', key: 'wapdaAvailable' },
              { label: 'WAPDA Functional', key: 'wapdaFunctional' },
              { label: 'Solar Available', key: 'solarAvailable' },
              { label: 'Solar Functional', key: 'solarFunctional' },
              { label: 'UPS Available', key: 'upsAvailable' },
              { label: 'Other Power Source Details', key: 'otherPowerSource' },
              { label: 'Boundary Wall Available', key: 'boundaryWallAvailable' },
              { label: 'Boundary Wall Status', key: 'boundaryWallStatus' },
              { label: 'Boundary Wall Height', key: 'boundaryWallHeight' },
              { label: 'Drinking Water Available', key: 'drinkingWaterAvailable' },
              { label: 'Water Bore Available', key: 'waterBore' },
              { label: 'Water Pipe Connection', key: 'waterPipeConnection' },
              { label: 'Staff Toilets Available', key: 'staffToiletsAvailable' },
              { label: 'Total Staff Toilets', key: 'numberOfToiletsStaff' },
              { label: 'Functional Staff Toilets', key: 'numberOfFunctionalToiletsStaff' },
            ])}
          </div>
        )}

        {/* PAGE 4: STUDENT TOILETS, DRM, SPORTS, SECURITY */}
        {activePage === 4 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 4 — Student Toilets, Ramp Access, DRM, Sports &amp; Security
            </h4>
            {renderEditableGrid([
              { label: 'Students Toilets Available', key: 'studentsToiletsAvailable' },
              { label: 'Total Students Toilets', key: 'numberOfToiletsStudents' },
              { label: 'Functional Students Toilets', key: 'numberOfFunctionalToiletsStudents' },
              { label: 'Ramp Access Available', key: 'rampAccessAvailable' },
              { label: 'Ramp at Entrance', key: 'rampAtEntrance' },
              { label: 'Ramp Inside Building', key: 'rampInsideBuilding' },
              { label: 'Ramp in Toilets', key: 'rampInToilets' },
              { label: 'DRM Plan Available', key: 'drmAvailable' },
              { label: 'First Aid Kit Available', key: 'firstAidKit' },
              { label: 'Teachers Trained in DRM', key: 'teachersTrainedDrm' },
              { label: 'Play Area Available', key: 'playAreaAvailable' },
              { label: 'Playground Available', key: 'playgroundAvailable' },
              { label: 'Playground Area (Marlas)', key: 'playgroundAreaMarlas' },
              { label: 'Cricket Equipment', key: 'cricketEquipment' },
              { label: 'Football Equipment', key: 'footballEquipment' },
              { label: 'Badminton Equipment', key: 'badmintonEquipment' },
              { label: 'Volleyball Equipment', key: 'volleyballEquipment' },
              { label: 'Other Games', key: 'anyOtherGame' },
              { label: 'CCTV Available', key: 'cctvAvailable' },
              { label: 'Total CCTV Cameras', key: 'cctvTotal' },
              { label: 'Functional CCTV Cameras', key: 'cctvFunctional' },
              { label: 'Metal Detectors Count', key: 'metalDetectors' },
              { label: 'Barbed Wire Installed', key: 'barbedWire' },
              { label: 'Glass Spikes Installed', key: 'glassSpikes' },
              { label: 'School Gates Count', key: 'schoolGatesCount' },
              { label: 'SOS Registered Mobile Number', key: 'sosMobileNumber' },
            ])}
          </div>
        )}

        {/* PAGE 5: ENROLLMENT BY GROUP & SECTION */}
        {activePage === 5 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (04) Enrollment by Group &amp; Section (Morning / Evening Shift)
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5 text-left">Class Name</th>
                    <th className="p-2.5 text-left">Group</th>
                    <th className="p-2.5 text-left">Morning Enrollment</th>
                    <th className="p-2.5 text-left">Morning Sections</th>
                    <th className="p-2.5 text-left">Evening Enrollment</th>
                    <th className="p-2.5 text-left">Evening Sections</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.enrollmentRows.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.className}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].className = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.group}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].group = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.morningEnrollment}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].morningEnrollment = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold text-emerald-800"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.morningSections}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].morningSections = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.eveningEnrollment}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].eveningEnrollment = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.eveningSections}
                          onChange={(e) => {
                            const copy = [...data.enrollmentRows];
                            copy[i].eveningSections = e.target.value;
                            updateField('enrollmentRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 6 & 7: BOYS & GIRLS AGE GROUPS */}
        {(activePage === 6 || activePage === 7) && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page {activePage} — Enrollment by Age Group (
              {activePage === 6 ? 'Boys' : 'Girls'}) — Fully Editable
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Class</th>
                    <th className="p-1.5">3Y</th>
                    <th className="p-1.5">4Y</th>
                    <th className="p-1.5">5Y</th>
                    <th className="p-1.5">6Y</th>
                    <th className="p-1.5">7Y</th>
                    <th className="p-1.5">8Y</th>
                    <th className="p-1.5">9Y</th>
                    <th className="p-1.5">10Y</th>
                    <th className="p-1.5">11Y</th>
                    <th className="p-1.5">Repeat</th>
                    <th className="p-1.5">Hafiz</th>
                    <th className="p-1.5">Orphan</th>
                    <th className="p-1.5">Afghan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(activePage === 6 ? data.boysAgeRows : data.girlsAgeRows).map((r, i) => {
                    const targetKey = activePage === 6 ? 'boysAgeRows' : 'girlsAgeRows';
                    const cols = [
                      'a3',
                      'a4',
                      'a5',
                      'a6',
                      'a7',
                      'a8',
                      'a9',
                      'a10',
                      'a11',
                      'repeaters',
                      'hafizQuran',
                      'orphan',
                      'afghanRefugees',
                    ] as const;
                    return (
                      <tr key={i}>
                        <td className="p-1.5 font-black text-slate-900">{r.className}</td>
                        {cols.map((colKey) => (
                          <td key={colKey} className="p-1">
                            <input
                              type="text"
                              value={r[colKey]}
                              onChange={(e) => {
                                const copy = [...data[targetKey]];
                                copy[i] = { ...copy[i], [colKey]: e.target.value };
                                updateField(targetKey, copy);
                              }}
                              className="w-11 px-1 py-1 text-center rounded border border-slate-300 font-bold"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 8: FUNCTIONAL DIFFICULTIES */}
        {activePage === 8 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 8 — Children with Functional Difficulties — All Cells Editable
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-[11px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Class</th>
                    <th className="p-1.5">Seeing (Some)</th>
                    <th className="p-1.5">Seeing (Cannot)</th>
                    <th className="p-1.5">Hearing (Some)</th>
                    <th className="p-1.5">Hearing (Cannot)</th>
                    <th className="p-1.5">Walking (Some)</th>
                    <th className="p-1.5">Walking (Cannot)</th>
                    <th className="p-1.5">Memory (Some)</th>
                    <th className="p-1.5">SelfCare (Some)</th>
                    <th className="p-1.5">Comm (Some)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.functionalDifficultyRows.map((r, i) => {
                    const cols = [
                      'seeingSome',
                      'seeingCannot',
                      'hearingSome',
                      'hearingCannot',
                      'walkingSome',
                      'walkingCannot',
                      'rememberingSome',
                      'adlSome',
                      'communicatingSome',
                    ] as const;
                    return (
                      <tr key={i}>
                        <td className="p-1.5 font-black">{r.className}</td>
                        {cols.map((colKey) => (
                          <td key={colKey} className="p-1">
                            <input
                              type="text"
                              value={r[colKey]}
                              onChange={(e) => {
                                const copy = [...data.functionalDifficultyRows];
                                copy[i] = { ...copy[i], [colKey]: e.target.value };
                                updateField('functionalDifficultyRows', copy);
                              }}
                              className="w-12 px-1 py-1 text-center rounded border border-slate-300 font-bold"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 9: LEARNING DIFFICULTIES ASSESSMENT */}
        {activePage === 9 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 9 — Learning Difficulties Assessment — Editable
            </h4>
            {renderEditableGrid([
              { label: 'Teacher Assessor Name', key: 'teacherAssessorName' },
              { label: 'Teacher Assessor Contact', key: 'teacherAssessorContact' },
              { label: 'Skilled to Identify (Yes/No)', key: 'skilledToIdentify' },
              { label: 'Children Identified Count', key: 'childrenIdentifiedCount' },
              { label: 'Guided Other Teachers (Yes/No)', key: 'guidedOtherTeachers' },
              { label: 'Guided Teachers Count', key: 'guidedTeachersCount' },
              { label: 'Provided Interventions (Yes/No)', key: 'providedInterventions' },
              { label: 'Students Receiving Intervention', key: 'studentsReceivingIntervention' },
              { label: 'Remedial Learning Comments', key: 'learningComments' },
            ])}

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Class</th>
                    <th className="p-2">Morning Reading</th>
                    <th className="p-2">Morning Writing</th>
                    <th className="p-2">Morning Math</th>
                    <th className="p-2">Evening Reading</th>
                    <th className="p-2">Evening Writing</th>
                    <th className="p-2">Evening Math</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.learningDifficultyRows.map((r, i) => {
                    const cols = [
                      'mReading',
                      'mWriting',
                      'mMath',
                      'eReading',
                      'eWriting',
                      'eMath',
                    ] as const;
                    return (
                      <tr key={i}>
                        <td className="p-2 font-black">{r.className}</td>
                        {cols.map((colKey) => (
                          <td key={colKey} className="p-1.5">
                            <input
                              type="text"
                              value={r[colKey]}
                              onChange={(e) => {
                                const copy = [...data.learningDifficultyRows];
                                copy[i] = { ...copy[i], [colKey]: e.target.value };
                                updateField('learningDifficultyRows', copy);
                              }}
                              className="w-16 px-2 py-1 rounded border border-slate-300 font-bold"
                            />
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 10: SCHOLARSHIPS */}
        {activePage === 10 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 10 — Scholarships &amp; Miscellaneous — Editable
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Class</th>
                    <th className="p-2">Scholarship Name</th>
                    <th className="p-2">Morning Boys</th>
                    <th className="p-2">Morning Girls</th>
                    <th className="p-2">Evening Boys</th>
                    <th className="p-2">Evening Girls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.scholarshipRows.map((r, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.className}
                          onChange={(e) => {
                            const copy = [...data.scholarshipRows];
                            copy[i].className = e.target.value;
                            updateField('scholarshipRows', copy);
                          }}
                          className="w-24 px-2 py-1 rounded border border-slate-300 font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={r.scholarshipName}
                          onChange={(e) => {
                            const copy = [...data.scholarshipRows];
                            copy[i].scholarshipName = e.target.value;
                            updateField('scholarshipRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                        />
                      </td>
                      {(['mBoys', 'mGirls', 'eBoys', 'eGirls'] as const).map((ck) => (
                        <td key={ck} className="p-2">
                          <input
                            type="text"
                            value={r[ck]}
                            onChange={(e) => {
                              const copy = [...data.scholarshipRows];
                              copy[i] = { ...copy[i], [ck]: e.target.value };
                              updateField('scholarshipRows', copy);
                            }}
                            className="w-16 px-2 py-1 rounded border border-slate-300 font-bold"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {renderEditableGrid([
              { label: 'Polio Affected Children Count', key: 'polioAffectedCount' },
              { label: 'Corporal Punishment Cases Count', key: 'corporalPunishmentCount' },
              { label: 'GBV Cases Count', key: 'gbvCasesCount' },
            ])}
          </div>
        )}

        {/* PAGE 11: STAFF / HR INFORMATION */}
        {activePage === 11 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (05) Staff / HR Information — Sanctioned Posts &amp; Teachers Details
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left">Designation</th>
                    <th className="p-2 text-left">BPS</th>
                    <th className="p-2 text-left">Total Posts</th>
                    <th className="p-2 text-left">Filled Posts</th>
                    <th className="p-2 text-left">Vacant</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.sanctionedPostsRows.map((sp, i) => (
                    <tr key={i}>
                      {(['designation', 'bps', 'totalPosts', 'filledPosts', 'vacant'] as const).map(
                        (ck) => (
                          <td key={ck} className="p-2">
                            <input
                              type="text"
                              value={sp[ck]}
                              onChange={(e) => {
                                const copy = [...data.sanctionedPostsRows];
                                copy[i] = { ...copy[i], [ck]: e.target.value };
                                updateField('sanctionedPostsRows', copy);
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left">Employee Name</th>
                    <th className="p-2 text-left">Father Name</th>
                    <th className="p-2 text-left">CNIC #</th>
                    <th className="p-2 text-left">Designation</th>
                    <th className="p-2 text-left">Status</th>
                    <th className="p-2 text-left">Appt. Date</th>
                    <th className="p-2 text-left">Role / Focal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.hrStaffRows.map((hr, i) => (
                    <tr key={i}>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.name}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].name = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.fatherName}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].fatherName = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.cnic}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].cnic = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.designation}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].designation = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.staffStatus}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].staffStatus = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="date"
                          value={hr.appointmentDate}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].appointmentDate = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={hr.focalPerson}
                          onChange={(e) => {
                            const copy = [...data.hrStaffRows];
                            copy[i].focalPerson = e.target.value;
                            updateField('hrStaffRows', copy);
                          }}
                          className="w-full px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 12: DOUBLE SHIFT TEACHERS */}
        {activePage === 12 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                Page 12 — Temporary Hired Teachers (Double Shift)
              </h4>
              <button
                onClick={() =>
                  updateField('doubleShiftTeachersRows', [
                    ...data.doubleShiftTeachersRows,
                    { name: '', fatherName: '', cnic: '', designation: 'PST', contactNo: '' },
                  ])
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Row</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Teacher Name</th>
                    <th className="p-2">Father Name</th>
                    <th className="p-2">CNIC #</th>
                    <th className="p-2">Designation</th>
                    <th className="p-2">Contact No</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.doubleShiftTeachersRows.map((row, i) => (
                    <tr key={i}>
                      {(['name', 'fatherName', 'cnic', 'designation', 'contactNo'] as const).map(
                        (ck) => (
                          <td key={ck} className="p-2">
                            <input
                              type="text"
                              value={row[ck]}
                              onChange={(e) => {
                                const copy = [...data.doubleShiftTeachersRows];
                                copy[i] = { ...copy[i], [ck]: e.target.value };
                                updateField('doubleShiftTeachersRows', copy);
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                            />
                          </td>
                        )
                      )}
                      <td className="p-2">
                        <button
                          onClick={() =>
                            updateField(
                              'doubleShiftTeachersRows',
                              data.doubleShiftTeachersRows.filter((_, idx) => idx !== i)
                            )
                          }
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.doubleShiftTeachersRows.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-500 font-bold">
                        No Double Shift Teachers added. Click "+ Add Row" above to add an entry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 13: PTC / UNICEF HIRED TEACHERS */}
        {activePage === 13 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
                Page 13 — Temporary Hired Teachers (PTC / UNICEF)
              </h4>
              <button
                onClick={() =>
                  updateField('ptcTeachersRows', [
                    ...data.ptcTeachersRows,
                    {
                      name: '',
                      fatherName: '',
                      cnic: '',
                      designation: 'PTC Teacher',
                      contactNo: '',
                      fundingBody: 'PTC',
                    },
                  ])
                }
                className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-xs font-black flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Row</span>
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Teacher Name</th>
                    <th className="p-2">Father Name</th>
                    <th className="p-2">CNIC #</th>
                    <th className="p-2">Designation</th>
                    <th className="p-2">Contact No</th>
                    <th className="p-2">Funding Body</th>
                    <th className="p-2">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.ptcTeachersRows.map((row, i) => (
                    <tr key={i}>
                      {(
                        [
                          'name',
                          'fatherName',
                          'cnic',
                          'designation',
                          'contactNo',
                          'fundingBody',
                        ] as const
                      ).map((ck) => (
                        <td key={ck} className="p-2">
                          <input
                            type="text"
                            value={row[ck]}
                            onChange={(e) => {
                              const copy = [...data.ptcTeachersRows];
                              copy[i] = { ...copy[i], [ck]: e.target.value };
                              updateField('ptcTeachersRows', copy);
                            }}
                            className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                          />
                        </td>
                      ))}
                      <td className="p-2">
                        <button
                          onClick={() =>
                            updateField(
                              'ptcTeachersRows',
                              data.ptcTeachersRows.filter((_, idx) => idx !== i)
                            )
                          }
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.ptcTeachersRows.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-4 text-center text-slate-500 font-bold">
                        No PTC / UNICEF Hired Teachers added. Click "+ Add Row" above to add an entry.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 14: PTC & ECE INFORMATION */}
        {activePage === 14 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 14 — (06) PTC Information &amp; (07) ECE Information — Editable
            </h4>
            {renderEditableGrid([
              { label: 'PTC Established (Yes/No)', key: 'ptcEstablished' },
              { label: 'PTC Establishment Date', key: 'ptcEstablishmentDate' },
              { label: 'PTC Members Trained (Yes/No)', key: 'ptcMembersTrained' },
              { label: 'PTC Chairperson Name', key: 'ptcChairpersonName' },
              { label: 'PTC Chairperson Contact', key: 'ptcChairpersonContact' },
              { label: 'PTC Bank Name', key: 'ptcBankName' },
              { label: 'PTC Branch Name', key: 'ptcBranchName' },
              { label: 'PTC Branch Code', key: 'ptcBranchCode' },
              { label: 'PTC Account IBAN', key: 'ptcIban' },
              { label: 'PTC Last Election Date', key: 'ptcLastElectionDate' },
              { label: 'PTC Balance June 2026 (Rs.)', key: 'ptcBalanceJune2026' },
              { label: 'PTC Balance Oct 2026 (Rs.)', key: 'ptcBalanceOct2026' },
              { label: 'PTC Amount From Govt (Rs.)', key: 'ptcAmountFromGovt' },
              { label: 'PTC Expenditure (Rs.)', key: 'ptcExpenditure' },
              { label: 'PTC Meetings Held', key: 'ptcMeetingsHeld' },
              { label: 'ECE Room Available', key: 'eceRoomAvailable' },
              { label: 'ECE Equipment Available', key: 'eceEquipmentAvailable' },
              { label: 'ECE Chairs Count', key: 'eceChairsCount' },
              { label: 'ECE Tables Count', key: 'eceTablesCount' },
              { label: 'ECE Teacher Name', key: 'eceTeacherName' },
              { label: 'ECE Teacher CNIC', key: 'eceTeacherCnic' },
            ])}

            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">Member Name</th>
                    <th className="p-2">CNIC #</th>
                    <th className="p-2">Contact</th>
                    <th className="p-2">Chairperson / Role</th>
                    <th className="p-2">Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.ptcMembersRows.map((m, i) => (
                    <tr key={i}>
                      {(['name', 'cnic', 'contact', 'chairperson', 'address'] as const).map(
                        (ck) => (
                          <td key={ck} className="p-2">
                            <input
                              type="text"
                              value={m[ck]}
                              onChange={(e) => {
                                const copy = [...data.ptcMembersRows];
                                copy[i] = { ...copy[i], [ck]: e.target.value };
                                updateField('ptcMembersRows', copy);
                              }}
                              className="w-full px-2 py-1 rounded border border-slate-300 font-bold"
                            />
                          </td>
                        )
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGE 15: ICT & LABS */}
        {activePage === 15 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              Page 15 — (08) ICT &amp; Computer Lab Information — Editable
            </h4>
            {renderEditableGrid([
              { label: 'Internet Available (Yes/No)', key: 'internetAvailable' },
              { label: 'Landline Internet (Yes/No)', key: 'internetLandline' },
              { label: 'Internet Speed', key: 'internetSpeed' },
              { label: 'Wireless Jazz 4G', key: 'internetWirelessJazz' },
              { label: 'Wireless Zong 4G', key: 'internetWirelessZong' },
              { label: 'Other Wireless Details', key: 'internetOtherWireless' },
              { label: 'IT Lab Available (Yes/No)', key: 'itLabAvailable' },
              { label: 'IT Lab Establishment Year', key: 'itLabEstYear' },
              { label: 'IT Lab Functional', key: 'itLabFunctional' },
              { label: 'Total Computers in IT Lab', key: 'itLabTotalComputers' },
              { label: 'Functional Computers in IT Lab', key: 'itLabFunctionalComputers' },
              { label: 'IT Lab Printer Available', key: 'itLabPrinter' },
              { label: 'IT Lab Scanner Available', key: 'itLabScanner' },
              { label: 'IT Lab Projector Available', key: 'itLabProjector' },
              { label: 'Interactive Whiteboard (IWB)', key: 'iwbAvailable' },
              { label: 'IWB Alternate Power', key: 'iwbAlternatePower' },
              { label: 'Mobile Tablets Count', key: 'mobileTabletsCount' },
              { label: 'Functional Tablets Count', key: 'mobileTabletsFunctional' },
              { label: 'Office Computers Count', key: 'officeComputersCount' },
              { label: 'Office Printers Count', key: 'officePrintersCount' },
              { label: 'Biometric Device Available', key: 'biometricAvailable' },
              { label: 'Biometric Device Functional', key: 'biometricFunctional' },
            ])}
          </div>
        )}

        {/* PAGE 16: COMMODITIES */}
        {activePage === 16 && (
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-50 p-2 rounded-xl border border-emerald-200">
              (09) Commodities Information (21 Items Register) — All Columns Editable
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl max-h-[500px]">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0 z-10">
                  <tr>
                    <th className="p-2 text-center">S#</th>
                    <th className="p-2 text-left">Item Name</th>
                    <th className="p-2 text-left">Available</th>
                    <th className="p-2 text-left">Useable</th>
                    <th className="p-2 text-left">Un-useable</th>
                    <th className="p-2 text-left">Required</th>
                    <th className="p-2 text-left">Repaired</th>
                    <th className="p-2 text-left">New Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {data.commoditiesRows.map((c, i) => (
                    <tr key={c.sNo}>
                      <td className="p-2 text-center font-bold text-slate-500">{c.sNo}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={c.itemName}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].itemName = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-full min-w-[180px] px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.available}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].available = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-bold"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.useable}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].useable = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-bold text-emerald-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.unuseable}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].unuseable = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs text-amber-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.required}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].required = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs text-rose-700"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.repaired}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].repaired = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          type="number"
                          value={c.newReceived}
                          onChange={(e) => {
                            const copy = [...data.commoditiesRows];
                            copy[i].newReceived = e.target.value;
                            updateField('commoditiesRows', copy);
                          }}
                          className="w-16 px-2 py-1 rounded border border-slate-300 text-xs font-bold text-blue-700"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Saved SSR Records Modal (Reopen Saved SSR Records) */}
      {showSavedRecordsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Saved SSR Records (GPS Chambai/SSR/SSR Documents)
                </h3>
                <p className="text-xs text-slate-500">
                  Select any saved SSR snapshot to reopen and edit
                </p>
              </div>
              <button
                onClick={() => setShowSavedRecordsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="max-h-72 overflow-y-auto space-y-2">
              {savedSsrFiles.length === 0 ? (
                <div className="p-6 text-center text-xs font-bold text-slate-500 bg-slate-50 rounded-2xl border border-slate-200">
                  No saved SSR JSON snapshots yet. Click "Save to Storage" on the header to save a snapshot.
                </div>
              ) : (
                savedSsrFiles.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {f.fileName}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        Saved: {new Date(f.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <button
                      onClick={() => handleReopenSavedSsrFile(f)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black shrink-0"
                    >
                      Reopen Record
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* In-App Print Preview Modal (All 16 Pages) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-emerald-900 text-white p-3.5 px-5 flex flex-wrap items-center justify-between gap-2 border-b border-emerald-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <School size={20} className="text-amber-300" />
                <div>
                  <h3 className="text-sm font-black">
                    Official SSR 2026-27 Document Preview (All 16 Pages)
                  </h3>
                  <p className="text-[10px] text-emerald-200">
                    GPS Chambai Kohat • EMIS {data.emisCode} • Head Mobile: {data.headMobileNo}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSavePdf}
                  className="px-3 py-1.5 rounded-xl bg-white text-emerald-950 text-xs font-black flex items-center gap-1 shadow-xs"
                >
                  <Download size={14} />
                  <span>Save PDF</span>
                </button>
                <button
                  onClick={handleSaveDocx}
                  className="px-3 py-1.5 rounded-xl bg-sky-500 text-white text-xs font-black flex items-center gap-1 shadow-xs"
                >
                  <FileText size={14} />
                  <span>Export Doc</span>
                </button>
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1 shadow-xs"
                >
                  <Printer size={14} />
                  <span>Print All 16 Pages</span>
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Preview Body */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-100">
              <div
                className="bg-white shadow-md p-6 max-w-3xl mx-auto rounded-xl border border-slate-200"
                dangerouslySetInnerHTML={{ __html: SsrExportService.generateSsrHtml(data) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
