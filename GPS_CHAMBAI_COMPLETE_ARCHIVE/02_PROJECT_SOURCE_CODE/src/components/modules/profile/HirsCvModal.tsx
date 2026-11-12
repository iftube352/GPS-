import React, { useState } from 'react';
import {
  X,
  Printer,
  Download,
  Edit3,
  Save,
  RotateCcw,
  CheckCircle2,
  Phone,
  Mail,
  User,
  Plus,
  Trash2,
} from 'lucide-react';
import { HirsCvData, HirsCvEducationRow, HirsCvPostingRow, HirsCvBpsRow } from '../../../types';
import { StorageService, DEFAULT_HIRS_CV } from '../../../services/storage';
import { printHtmlDocument, saveFileToModuleFolder } from '../../../services/printAndFileService';

interface HirsCvModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HirsCvModal: React.FC<HirsCvModalProps> = ({ isOpen, onClose }) => {
  const [data, setData] = useState<HirsCvData>(() => StorageService.getHirsCv());
  const [isEditing, setIsEditing] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    StorageService.saveHirsCv(data);
    setIsEditing(false);
    showToast('My HIRS CV updated and saved permanently!');
  };

  const handleReset = () => {
    setData(DEFAULT_HIRS_CV);
    StorageService.saveHirsCv(DEFAULT_HIRS_CV);
    showToast('Reset to original official HIRS CV data!');
  };

  const handlePrint = () => {
    const htmlContent = document.getElementById('gps-hirs-cv-sheet')?.innerHTML || '';
    printHtmlDocument('My HIRS CV — Muhammad Irfan SPST (BPS-14)', htmlContent, 'portrait', false);
  };

  const handleDownloadPdf = () => {
    const htmlContent = document.getElementById('gps-hirs-cv-sheet')?.innerHTML || '';
    saveFileToModuleFolder('My HIRS CV', 'My_HIRS_CV_Muhammad_Irfan.html', htmlContent, 'text/html');
    showToast('Exported HIRS CV to GPS Chambai/My HIRS CV/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-slate-900 rounded-3xl w-full max-w-5xl border-2 border-slate-700 shadow-2xl flex flex-col my-auto max-h-[96vh] overflow-hidden text-slate-900">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between p-3 sm:px-6 bg-slate-950 border-b border-slate-800 text-white gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="font-black text-sm tracking-wide">My HIRS CV — Official Document (Image 029)</h3>
            {isEditing && (
              <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md">
                Editing Mode Active
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md transition-all ${
                isEditing
                  ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                  : 'bg-slate-800 text-amber-300 hover:bg-slate-700'
              }`}
            >
              <Edit3 size={14} />
              <span>{isEditing ? 'Preview Mode' : 'Edit HIRS CV'}</span>
            </button>

            {isEditing && (
              <>
                <button
                  onClick={handleSave}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1 shadow-md"
                >
                  <Save size={14} />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleReset}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  title="Reset to Original Values"
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
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-600 text-white text-xs font-black flex items-center gap-1"
            >
              <Download size={14} />
              <span className="hidden sm:inline">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="bg-emerald-500 text-slate-950 text-xs font-black px-4 py-2 flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Scrollable CV Document matching Image 029 */}
        <div className="p-3 sm:p-6 overflow-y-auto bg-slate-200/90 flex justify-center">
          <div
            id="gps-hirs-cv-sheet"
            className="w-full max-w-[850px] bg-white shadow-2xl border border-slate-300 rounded-lg overflow-hidden text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', Arial, sans-serif" }}
          >
            {/* Top Calligraphy Banner */}
            <div className="bg-slate-900 text-white p-3 text-center border-b-4 border-emerald-600">
              <div
                className="text-2xl sm:text-3xl font-bold tracking-widest text-emerald-300"
                style={{ fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif" }}
              >
                {data.calligraphyTitle || 'محمد عرفان'}
              </div>
            </div>

            {/* Main 2-Column Body Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 min-h-[900px]">
              {/* LEFT COLUMN: Black Theme (approx 4.5 cols = 38%) */}
              <div className="md:col-span-5 bg-[#0a1420] text-white p-4 sm:p-5 flex flex-col justify-between space-y-4">
                {/* Portrait + Hello Greeting */}
                <div className="text-center space-y-2 pt-2">
                  <div className="relative w-28 h-28 mx-auto rounded-full border-4 border-white overflow-hidden shadow-xl bg-slate-800">
                    <img
                      src={data.portraitUrl || '/assets/aistudio/Microsoft_Profile_78e13ce1.png'}
                      alt="Muhammad Irfan"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-white shadow-md">
                      ✓
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-300 italic">Hello , I am..</p>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.fullName}
                        onChange={(e) => setData({ ...data, fullName: e.target.value })}
                        className="w-full text-center bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-white"
                      />
                    ) : (
                      data.fullName
                    )}
                  </h1>
                  <div className="text-xs font-black tracking-wide text-cyan-400">
                    {isEditing ? (
                      <input
                        type="text"
                        value={data.designation}
                        onChange={(e) => setData({ ...data, designation: e.target.value })}
                        className="w-full text-center bg-slate-800 border border-slate-600 rounded px-2 py-0.5 text-cyan-300 text-xs"
                      />
                    ) : (
                      data.designation
                    )}
                  </div>
                </div>

                {/* PROFILE Section Box */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 font-black text-xs tracking-wider uppercase text-white">
                    <User size={14} className="text-cyan-400" />
                    <span>PROFILE</span>
                  </div>

                  <div className="text-[11px] leading-relaxed space-y-1 px-1 font-semibold text-slate-200">
                    {[
                      { label: 'Father Name.', key: 'fatherName' },
                      { label: 'CNIC No.', key: 'cnic' },
                      { label: 'Personal No.', key: 'personalNo' },
                      { label: 'Gender.', key: 'gender' },
                      { label: 'Domicile.', key: 'domicile' },
                      { label: 'Station.', key: 'station' },
                      { label: 'Designation.', key: 'designationLong' },
                      { label: 'Last Post.', key: 'lastPostDate' },
                    ].map(({ label, key }) => (
                      <div key={key} className="flex justify-between items-baseline gap-1">
                        <span className="text-slate-400 shrink-0 font-bold">{label}</span>
                        {isEditing ? (
                          <input
                            type="text"
                            value={(data as any)[key]}
                            onChange={(e) => setData({ ...data, [key]: e.target.value })}
                            className="bg-slate-800 border border-slate-600 rounded px-1 text-white text-[10px] w-40 text-right"
                          />
                        ) : (
                          <span className="font-extrabold text-white text-right">{(data as any)[key]}</span>
                        )}
                      </div>
                    ))}
                    <div className="flex justify-between items-baseline gap-1 pt-0.5">
                      <span className="text-slate-400 shrink-0 font-bold">Covid 19 Vaccination.</span>
                      <span className="font-black text-amber-400">{data.covidVaccination}</span>
                    </div>
                  </div>
                </div>

                {/* CONTACT Section Box */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 font-black text-xs tracking-wider uppercase text-white">
                    <Phone size={14} className="text-emerald-400" />
                    <span>CONTACT</span>
                  </div>

                  <div className="space-y-2 text-[11px] px-1 font-bold">
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-emerald-400 shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.mobile1}
                          onChange={(e) => setData({ ...data, mobile1: e.target.value })}
                          className="bg-slate-800 border border-slate-600 rounded px-1 text-white text-[11px] w-full"
                        />
                      ) : (
                        <span>{data.mobile1}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-emerald-400 shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.mobile2}
                          onChange={(e) => setData({ ...data, mobile2: e.target.value })}
                          className="bg-slate-800 border border-slate-600 rounded px-1 text-white text-[11px] w-full"
                        />
                      ) : (
                        <span>{data.mobile2}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-amber-400 shrink-0" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.email}
                          onChange={(e) => setData({ ...data, email: e.target.value })}
                          className="bg-slate-800 border border-slate-600 rounded px-1 text-white text-[10px] w-full"
                        />
                      ) : (
                        <span className="text-[10px] truncate">{data.email}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* SOCIAL MEDIA Section Box */}
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <div className="bg-black/80 px-3 py-1.5 rounded-lg flex items-center gap-2 font-black text-xs tracking-wider uppercase text-white">
                    <span>😊 SOCIAL MEDIA</span>
                  </div>

                  {/* Uploaded Social Icons Row */}
                  <div className="flex items-center justify-between gap-1 py-1 px-1">
                    {[
                      { src: '/assets/aistudio/yputube_d9e9a0fb.png', alt: 'YouTube' },
                      { src: '/assets/aistudio/facebook_b4556ed7.png', alt: 'Facebook' },
                      { src: '/assets/aistudio/instagram_be056fee.png', alt: 'Instagram' },
                      { src: '/assets/aistudio/linkdin_91d33015.png', alt: 'LinkedIn' },
                      { src: '/assets/aistudio/twitter_4c1342d0.png', alt: 'Twitter' },
                      { src: '/assets/aistudio/whatsapp_236996ca.png', alt: 'WhatsApp' },
                    ].map((icon, i) => (
                      <div key={i} className="w-6 h-6 rounded-md bg-white/10 p-0.5 flex items-center justify-center">
                        <img src={icon.src} alt={icon.alt} className="w-full h-full object-contain" />
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-1">
                    <span className="text-base font-black tracking-wide text-white">
                      {data.socialHandle}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: White Theme with Colorful Vertical Tabs (approx 7 cols = 62%) */}
              <div className="md:col-span-7 bg-white p-3 sm:p-4 space-y-4 text-[11px] leading-tight">
                {/* 1. Basic Information (Orange Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#ff7900] text-white font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center writing-mode-vertical py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    Basic Information
                  </div>
                  <div className="flex-1 bg-amber-50/50 p-2 rounded border border-amber-200/60 grid grid-cols-2 gap-x-2 gap-y-1 font-bold text-slate-800 text-[10.5px]">
                    <div>
                      <span className="text-amber-700 font-extrabold">Date of Birth: </span>
                      {isEditing ? (
                        <input
                          type="text"
                          value={data.dob}
                          onChange={(e) => setData({ ...data, dob: e.target.value })}
                          className="border border-slate-300 rounded px-1 w-24 text-[10px]"
                        />
                      ) : (
                        <span>{data.dob}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Govt. Service Entry: </span>
                      <span>{data.dateOfEntry}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Mobile #: </span>
                      <span>{data.mobileBasic}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Marital Status: </span>
                      <span>{data.maritalStatus}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Blood Group: </span>
                      <span>{data.bloodGroup}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Mother Tongue: </span>
                      <span>{data.motherTongue}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Passport #: </span>
                      <span>{data.passportNo}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Union Council: </span>
                      <span>{data.unionCouncil}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Religion: </span>
                      <span>{data.religion}</span>
                    </div>
                    <div>
                      <span className="text-amber-700 font-extrabold">Domicile: </span>
                      <span>{data.domicileBasic}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-700 font-extrabold">Initial recruitment in ESED: </span>
                      <span>{data.initialRecruitment}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-amber-700 font-extrabold">Permanent Address: </span>
                      <span>{data.permanentAddress}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Education Qualification (Lime Green Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#84cc16] text-slate-950 font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    Education Qualification
                  </div>
                  <div className="flex-1 overflow-x-auto border border-lime-300 rounded">
                    <table className="w-full text-[9.5px] border-collapse text-left">
                      <thead>
                        <tr className="bg-lime-100 text-slate-900 font-black border-b border-lime-300">
                          <th className="p-1 border-r border-lime-200">College/University</th>
                          <th className="p-1 border-r border-lime-200">Academic</th>
                          <th className="p-1 border-r border-lime-200">Total</th>
                          <th className="p-1 border-r border-lime-200">Obt</th>
                          <th className="p-1 border-r border-lime-200">%age</th>
                          <th className="p-1 border-r border-lime-200">Reg/Pvt</th>
                          <th className="p-1">Year</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-lime-100 font-bold text-slate-800">
                        {data.educationQualifications.map((row, idx) => (
                          <tr key={row.id || idx} className="hover:bg-lime-50/50">
                            <td className="p-1 border-r border-lime-200 font-extrabold">{row.collegeUniversity}</td>
                            <td className="p-1 border-r border-lime-200">{row.academic}</td>
                            <td className="p-1 border-r border-lime-200">{row.totalMarks}</td>
                            <td className="p-1 border-r border-lime-200">{row.obtainedMarks}</td>
                            <td className="p-1 border-r border-lime-200 font-black text-emerald-700">{row.percentage}</td>
                            <td className="p-1 border-r border-lime-200">{row.regularPrivate}</td>
                            <td className="p-1">{row.sessionYear}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 3. Posting / Transfer (Crimson Red Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#e11d48] text-white font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    Posting / Transfer
                  </div>
                  <div className="flex-1 overflow-x-auto border border-rose-300 rounded">
                    <table className="w-full text-[9.5px] border-collapse text-left">
                      <thead>
                        <tr className="bg-rose-100 text-rose-950 font-black border-b border-rose-300">
                          <th className="p-1 border-r border-rose-200">Office/School</th>
                          <th className="p-1 border-r border-rose-200">Designation</th>
                          <th className="p-1 border-r border-rose-200">From</th>
                          <th className="p-1 border-r border-rose-200">Status</th>
                          <th className="p-1 border-r border-rose-200">Placement</th>
                          <th className="p-1">Notification</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-rose-100 font-bold text-slate-800">
                        {data.postingTransfers.map((p, idx) => (
                          <tr key={p.id || idx} className="hover:bg-rose-50/50">
                            <td className="p-1 border-r border-rose-200 font-extrabold">{p.officeSchool}</td>
                            <td className="p-1 border-r border-rose-200">{p.designation}</td>
                            <td className="p-1 border-r border-rose-200">{p.fromDate}</td>
                            <td className="p-1 border-r border-rose-200 font-black text-rose-700">{p.status}</td>
                            <td className="p-1 border-r border-rose-200">{p.placementType}</td>
                            <td className="p-1 text-[8.5px]">{p.notification}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 4. BPS - Job Type (Purple Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#9333ea] text-white font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    BPS - Job Type
                  </div>
                  <div className="flex-1 bg-purple-50/50 p-2 rounded border border-purple-200/60 grid grid-cols-2 gap-2 font-bold text-[10px]">
                    {data.bpsJobTypes.map((b, idx) => (
                      <div key={b.id || idx} className="bg-white p-2 rounded border border-purple-200 space-y-0.5">
                        <div className="font-black text-purple-900">{b.bps} ({b.jobType})</div>
                        <div>From: {b.fromDate} | Status: <span className="text-emerald-700 font-black">{b.status}</span></div>
                        <div className="text-[9px] text-slate-500">Notif: {b.notification}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. Cadre Group (Cyan Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#06b6d4] text-white font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    Cadre Group
                  </div>
                  <div className="flex-1 bg-cyan-50/50 p-2 rounded border border-cyan-200/60 flex items-center justify-between text-[10px] font-bold">
                    <div className="space-y-0.5">
                      <div>Cadre Group: <span className="font-black text-cyan-900">{data.cadreTeaching}</span></div>
                      <div>Designation: {data.cadreDesignation} ({data.cadreBps})</div>
                      <div>From Date: {data.cadreFromDate} | States: <span className="text-emerald-700 font-black">{data.cadreStates}</span></div>
                      <div>Seniority Number: <span className="font-black text-purple-800">{data.cadreSeniorityNo}</span></div>
                    </div>
                    <div className="w-16 h-14 bg-cyan-100 rounded-lg flex items-center justify-center text-cyan-700 font-black text-xs shrink-0 border border-cyan-300">
                      👨‍🏫 SPST
                    </div>
                  </div>
                </div>

                {/* 6. Bank Detail (Dark Blue Bar) */}
                <div className="flex gap-2">
                  <div className="w-7 bg-[#1e40af] text-white font-black text-[9px] uppercase tracking-wider rounded flex items-center justify-center py-2 text-center select-none shrink-0" style={{ writingMode: 'vertical-rl' }}>
                    Bank Detail
                  </div>
                  <div className="flex-1 bg-blue-50/50 p-2.5 rounded border border-blue-200 flex items-center justify-between text-[10px] font-bold">
                    <div className="space-y-0.5">
                      <div>Title: <span className="font-black text-slate-900">{data.accountTitle}</span></div>
                      <div className="font-black text-blue-900">{data.bankName} (Code: {data.bankCode})</div>
                      <div>A/C #: <span className="font-mono font-black">{data.accountNo}</span></div>
                      <div>IBAN: <span className="font-mono text-[9px] font-bold">{data.iban}</span></div>
                      <div>Address: {data.bankAddress} | Status: <span className="text-emerald-700 font-black">{data.bankStatus}</span></div>
                    </div>
                    <div className="w-20 text-center shrink-0">
                      <div className="w-12 h-12 mx-auto rounded-full bg-white border-2 border-emerald-600 flex items-center justify-center text-emerald-800 font-black text-[10px] shadow-sm">
                        MEEZAN
                      </div>
                      <span className="text-[8px] font-extrabold text-blue-900">Meezan Bank</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>HIRS CV Version · Govt. Primary School Chambai Kohat</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black"
          >
            Close Full Screen
          </button>
        </div>
      </div>
    </div>
  );
};
