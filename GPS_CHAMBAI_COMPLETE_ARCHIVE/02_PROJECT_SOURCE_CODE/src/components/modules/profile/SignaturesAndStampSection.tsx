import React, { useState } from 'react';
import {
  Stamp,
  Download,
  Copy,
  CheckCircle2,
  Eye,
  FileCheck,
  ShieldAlert,
  ZoomIn,
  X,
  FileText,
} from 'lucide-react';
import { OfficialSignaturesAndStamp } from '../../../types';
import { StorageService } from '../../../services/storage';
import { saveFileToModuleFolder } from '../../../services/printAndFileService';

export const SignaturesAndStampSection: React.FC = () => {
  const [data, setData] = useState<OfficialSignaturesAndStamp>(() =>
    StorageService.getSignaturesAndStamp()
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ title: string; url: string } | null>(null);
  const [docSelectorItem, setDocSelectorItem] = useState<{ title: string; url: string; key: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleCopy = (key: string, url: string, name: string) => {
    navigator.clipboard?.writeText(window.location.origin + url);
    setCopiedKey(key);
    showToast(`${name} reference copied!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownload = (name: string, url: string) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        saveFileToModuleFolder('Official Signatures & Stamp', `${name.replace(/\s+/g, '_')}.png`, blob, 'image/png');
        showToast(`Saved to GPS Chambai/Official Signatures & Stamp/`);
      })
      .catch(() => {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${name}.png`;
        a.click();
      });
  };

  const ITEMS = [
    {
      key: 'sig1',
      title: 'Signature 1 (Official Signature)',
      subTitle: 'image 019 · Authorized Official Sign',
      url: data.signature1Url || '/assets/aistudio/image_019_11ad539e.png',
      badge: 'Primary Signature',
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      key: 'sig2',
      title: 'Signature 2 (Teacher Signature)',
      subTitle: 'image 020 · Attesting / Teacher Signature',
      url: data.signature2Url || '/assets/aistudio/image_020_a379be76.png',
      badge: 'Secondary Signature',
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      key: 'stamp',
      title: 'Official School Stamp',
      subTitle: 'image 021 · Head Teacher G.P.S Chambai Kohat',
      url: data.officialStampUrl || '/assets/aistudio/image_021_491fb5ac.png',
      badge: 'Institutional Stamp',
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  ];

  return (
    <div className="space-y-4 animate-fade-in text-slate-900">
      {/* Title & Security Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center font-black">
            <Stamp size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              My Official Signatures &amp; Stamp
            </h3>
            <p className="text-xs text-slate-500 font-semibold">
              Authorized digital assets for GPS Chambai Kohat official documents
            </p>
          </div>
        </div>

        {/* Security Warning as per Master Prompt */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-black uppercase tracking-wider text-[10px] text-amber-800 block">
              Security &amp; Authorization Policy
            </span>
            <p className="font-semibold text-[11px] leading-relaxed">
              Signatures and stamps are securely preserved and <strong>will only be inserted into documents when explicitly selected by an authorized user</strong>. Automatic unauthorized insertion is strictly prevented.
            </p>
          </div>
        </div>

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* 3 Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {ITEMS.map((item) => (
            <div
              key={item.key}
              className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">PNG Format</span>
                </div>

                <h4 className="font-black text-sm text-slate-900">{item.title}</h4>
                <p className="text-[11px] text-slate-500 font-semibold">{item.subTitle}</p>
              </div>

              {/* High-Resolution Preview Area */}
              <div
                onClick={() => setPreviewImage({ title: item.title, url: item.url })}
                className="w-full h-36 bg-white rounded-xl border border-dashed border-slate-300 p-2 flex items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors group relative overflow-hidden"
                title="Click for full-screen preview"
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="max-h-full max-w-full object-contain filter contrast-125"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-black gap-1 transition-opacity">
                  <Eye size={16} />
                  <span>View Full</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setDocSelectorItem({ title: item.title, url: item.url, key: item.key })}
                  className="flex-1 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center justify-center gap-1 shadow-sm active:scale-95 transition-all"
                >
                  <FileCheck size={13} />
                  <span>Insert</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(item.key, item.url, item.title)}
                  className="p-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 transition-colors"
                  title="Copy Reference"
                >
                  {copiedKey === item.key ? <CheckCircle2 size={15} className="text-emerald-600" /> : <Copy size={15} />}
                </button>

                <button
                  type="button"
                  onClick={() => handleDownload(item.title, item.url)}
                  className="p-2 rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors"
                  title="Download File"
                >
                  <Download size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full-Screen Zoom Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="font-black text-sm text-slate-900">{previewImage.title}</h4>
              <button
                onClick={() => setPreviewImage(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>
            <div className="h-64 bg-slate-50 rounded-2xl p-4 flex items-center justify-center border border-slate-200">
              <img
                src={previewImage.url}
                alt={previewImage.title}
                className="max-h-full max-w-full object-contain filter contrast-125"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => handleDownload(previewImage.title, previewImage.url)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-black flex items-center gap-1.5"
              >
                <Download size={14} />
                <span>Save to Folder</span>
              </button>
              <button
                onClick={() => setPreviewImage(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Inserter Modal */}
      {docSelectorItem && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="text-emerald-600" size={18} />
                <h4 className="font-black text-sm text-slate-900">Authorize &amp; Insert Asset</h4>
              </div>
              <button
                onClick={() => setDocSelectorItem(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-semibold">
              Select which document you authorize inserting <strong>{docSelectorItem.title}</strong> into:
            </p>

            <div className="space-y-2">
              {[
                { name: 'Student Report Cards & DMC', desc: 'Detailed Marks Certificate (Image 017)' },
                { name: 'School Leaving Certificate', desc: 'Official Student Certificate (Image 015)' },
                { name: 'Semester Award List', desc: 'Class Examination Award List (Image 027)' },
                { name: 'Official Letters & Notifications', desc: 'School Office Administrative Dispatches' },
              ].map((doc) => (
                <button
                  key={doc.name}
                  onClick={() => {
                    localStorage.setItem(`gps_authorized_${docSelectorItem.key}`, docSelectorItem.url);
                    showToast(`Authorized for ${doc.name}!`);
                    setDocSelectorItem(null);
                  }}
                  className="w-full p-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-left transition-all flex items-center justify-between group"
                >
                  <div>
                    <div className="text-xs font-black text-slate-900 group-hover:text-emerald-800">
                      {doc.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-semibold">{doc.desc}</div>
                  </div>
                  <FileText size={16} className="text-slate-400 group-hover:text-emerald-600 shrink-0" />
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 text-center font-bold">
              Stored securely for insertion during document generation
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
