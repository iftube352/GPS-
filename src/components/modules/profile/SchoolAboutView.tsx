import React, { useState } from 'react';
import {
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  Printer,
  Download,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { SchoolAboutData } from '../../../types';
import { StorageService, DEFAULT_SCHOOL_ABOUT } from '../../../services/storage';
import { printHtmlDocument, saveFileToModuleFolder } from '../../../services/printAndFileService';

export const SchoolAboutView: React.FC = () => {
  const [data, setData] = useState<SchoolAboutData>(() => StorageService.getSchoolAbout());
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    StorageService.saveSchoolAbout(data);
    setIsEditing(false);
    showToast('School About information updated and saved permanently!');
  };

  const handleReset = () => {
    setData(DEFAULT_SCHOOL_ABOUT);
    StorageService.saveSchoolAbout(DEFAULT_SCHOOL_ABOUT);
    showToast('Reset to original GPS Chambai official records!');
  };

  const handlePrint = () => {
    const htmlContent = document.getElementById('gps-school-about-sheet')?.innerHTML || '';
    printHtmlDocument('School About — Govt Primary School Chambai Kohat', htmlContent, 'portrait', true);
  };

  const handleDownload = () => {
    const htmlContent = document.getElementById('gps-school-about-sheet')?.innerHTML || '';
    saveFileToModuleFolder('Other Data', 'School_About_GPS_Chambai.html', htmlContent, 'text/html');
    showToast('Exported School About to GPS Chambai/Other Data/');
  };

  return (
    <div className="space-y-4 animate-fade-in text-slate-900">
      {/* Action Header */}
      <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            Official E&amp;SED School Registry (Image 022)
          </span>
          <h3 className="text-base font-black text-slate-900 mt-0.5">School About — GPS Chambai Kohat</h3>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 shadow-sm transition-all ${
              isEditing ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
            }`}
          >
            <Edit3 size={14} />
            <span>{isEditing ? 'View Mode' : 'Edit Information'}</span>
          </button>

          {isEditing && (
            <>
              <button
                onClick={handleSave}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-sm"
              >
                <Save size={14} />
                <span>Save</span>
              </button>
              <button
                onClick={handleReset}
                className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
                title="Reset to Official Records"
              >
                <RotateCcw size={14} />
              </button>
            </>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
          >
            <Printer size={14} />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black flex items-center gap-1"
          >
            <Download size={14} />
            <span>Download</span>
          </button>
        </div>
      </div>

      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Main Container Formatted Exactly as Image 022 */}
      <div
        id="gps-school-about-sheet"
        className="bg-white rounded-2xl border-2 border-slate-300 shadow-md p-3 sm:p-5 text-xs font-sans space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* Left Column (Logo, Map/Update, Key Identity Table) */}
          <div className="md:col-span-5 space-y-3">
            {/* Top Badge & Logo */}
            <div className="text-center space-y-2 p-3 bg-emerald-50/40 rounded-2xl border border-emerald-100">
              <div className="text-emerald-800 font-extrabold text-xs">
                EMIS Code is {data.emisCode}
              </div>
              <div className="text-emerald-600 font-black text-sm tracking-wide">
                {data.approvalStatus}
              </div>

              {/* Circular Logo Roundel matching Image 022 */}
              <div className="w-28 h-28 mx-auto rounded-full bg-white p-1 border-2 border-emerald-700 shadow-md flex items-center justify-center overflow-hidden">
                <img
                  src="/assets/aistudio/20260903_200547_79893d25.png"
                  alt="Govt Primary School Chambai Kohat Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              {/* Action Buttons matching Image 022 */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <a
                  href="https://maps.app.goo.gl/jtnBTQZVrFqfp9j8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-red-700 hover:bg-red-800 text-white font-black text-xs flex items-center gap-1 shadow-sm"
                >
                  <MapPin size={13} />
                  <span>Map 📍</span>
                </a>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center gap-1 shadow-sm"
                >
                  <span>Update 📝</span>
                </button>
              </div>
            </div>

            {/* Left Column Table */}
            <div className="border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-200 text-[11px]">
              {[
                { label: 'Name :', key: 'schoolName' },
                { label: 'EMIS Code :', key: 'emisCode' },
                { label: 'DDO Code :', key: 'ddoCode' },
                { label: 'School Level :', key: 'schoolLevel' },
                { label: 'Circle Name :', key: 'circleName' },
                { label: 'NA :', key: 'na' },
                { label: 'PK :', key: 'pk' },
                { label: 'X Point :', key: 'xPoint' },
                { label: 'Y Point :', key: 'yPoint' },
                { label: 'Updated By :', key: 'updatedBy' },
                { label: 'Date Time :', key: 'dateTime' },
              ].map(({ label, key }) => (
                <div key={key} className="flex justify-between items-center p-2 hover:bg-slate-50">
                  <span className="font-extrabold text-slate-600 shrink-0">{label}</span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={(data as any)[key]}
                      onChange={(e) => setData({ ...data, [key]: e.target.value })}
                      className="border border-slate-300 rounded px-1.5 py-0.5 text-right font-black text-slate-900 w-44 text-[11px]"
                    />
                  ) : (
                    <span className="font-black text-slate-900 text-right whitespace-pre-line">
                      {(data as any)[key]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Column (Complete Department & Geographic Details Table) */}
          <div className="md:col-span-7 border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-200 text-[11px]">
            {[
              { label: 'Department :', key: 'department' },
              { label: 'Directorate :', key: 'directorate' },
              { label: 'Sub Office :', key: 'subOffice' },
              { label: 'Type :', key: 'type' },
              { label: 'Office/School Gender :', key: 'officeSchoolGender' },
              { label: 'Ownership :', key: 'ownership' },
              { label: 'Country :', key: 'country' },
              { label: 'Province :', key: 'province' },
              { label: 'Division :', key: 'division' },
              { label: 'District :', key: 'district' },
              { label: 'Tehsil :', key: 'tehsil' },
              { label: 'Union Council :', key: 'unionCouncil' },
              { label: 'Instruction Medium :', key: 'instructionMedium' },
              { label: 'Urban/Rural :', key: 'urbanRural' },
              { label: 'Weather Zone :', key: 'weatherZone' },
              { label: 'Phone # :', key: 'phoneNo' },
              { label: 'SOS # :', key: 'sosNo' },
              { label: 'Fax # :', key: 'faxNo' },
              { label: 'Email :', key: 'email' },
              { label: 'Village Name :', key: 'villageName' },
              { label: 'Mohalla Name :', key: 'mohallaName' },
              { label: 'Post Office :', key: 'postOffice' },
            ].map(({ label, key }) => (
              <div key={key} className="flex justify-between items-center p-2 hover:bg-slate-50">
                <span className="font-extrabold text-slate-600 shrink-0 w-36 sm:w-44">{label}</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={(data as any)[key]}
                    onChange={(e) => setData({ ...data, [key]: e.target.value })}
                    className="border border-slate-300 rounded px-1.5 py-0.5 text-right font-black text-slate-900 flex-1 text-[11px]"
                  />
                ) : (
                  <span className="font-black text-slate-900 text-right truncate pl-2">
                    {(data as any)[key]}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 4 Official Links (PART 1.5 requirement: ONLY THESE FOUR) */}
        <div className="pt-3 border-t border-slate-200 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
            Official Clickable Department &amp; Social Links
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              {
                name: 'Facebook',
                label: 'Official GPS Chambai Kohat Facebook Page',
                url: data.facebookUrl,
                icon: '/assets/aistudio/facebook_b4556ed7.png',
                bg: 'bg-[#1877F2]',
              },
              {
                name: 'YouTube',
                label: 'Official GPS Chambai Kohat YouTube Channel',
                url: data.youtubeUrl,
                icon: '/assets/aistudio/yputube_d9e9a0fb.png',
                bg: 'bg-[#FF0000]',
              },
              {
                name: 'WhatsApp',
                label: 'Official WhatsApp Contact (+92 336 9053352)',
                url: data.whatsappUrl,
                icon: '/assets/aistudio/whatsapp_236996ca.png',
                bg: 'bg-[#16A34A]',
              },
              {
                name: 'iEMIS',
                label: 'iEMIS KP E&SE Department HRMIS Login Portal',
                url: data.iemisUrl,
                icon: '/assets/aistudio/20260903_200547_79893d25.png',
                bg: 'bg-[#065F46]',
              },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 rounded-2xl ${link.bg} text-white flex items-center justify-between shadow-sm hover:opacity-95 active:scale-95 transition-all`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                    <img src={link.icon} alt={link.name} className="w-full h-full object-contain" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] uppercase tracking-wider text-white/80 font-bold">
                      {link.name}
                    </div>
                    <div className="truncate font-black text-xs">{link.label}</div>
                  </div>
                </div>
                <ExternalLink size={16} className="shrink-0 ml-2 text-white/90" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
