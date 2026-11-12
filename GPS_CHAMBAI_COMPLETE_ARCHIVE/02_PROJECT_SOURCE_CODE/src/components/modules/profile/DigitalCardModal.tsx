import React from 'react';
import { X, Printer, Download, Phone, Mail, MapPin, Share2, Award, QrCode } from 'lucide-react';
import { printHtmlDocument, saveFileToModuleFolder } from '../../../services/printAndFileService';

interface DigitalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoUrl: string;
}

export const DigitalCardModal: React.FC<DigitalCardModalProps> = ({ isOpen, onClose, photoUrl }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    printHtmlDocument(
      'Digital Profile Card — Muhammad Irfan',
      `
      <div style="max-width:420px;margin:20px auto;border:3px solid #0f172a;border-radius:24px;overflow:hidden;font-family:'Segoe UI',sans-serif;box-shadow:0 10px 25px rgba(0,0,0,0.15);">
        <div style="background:linear-gradient(135deg,#0a0a0a 0%,#b91c1c 100%);color:#fff;padding:28px 20px;text-align:center;">
          <img src="${photoUrl}" style="width:110px;height:110px;border-radius:50%;border:4px solid #ef4444;object-fit:cover;margin-bottom:12px;" />
          <h2 style="margin:0;font-size:24px;font-weight:900;">Muhammad Irfan</h2>
          <div style="font-size:14px;color:#fecaca;font-weight:700;margin-top:4px;">Senior PST (BPS - 14) / PST</div>
          <div style="font-size:12px;color:#cbd5e1;margin-top:2px;">Govt. Primary School Chambai Kohat (EMIS: 16454)</div>
        </div>
        <div style="padding:22px;background:#ffffff;line-height:2.2;font-size:14px;color:#1e293b;">
          <div><strong>Personal No:</strong> 00800702</div>
          <div><strong>CNIC:</strong> 14301-9843438-1</div>
          <div><strong>Father's Name:</strong> Said Wazir Khan</div>
          <div><strong>Mobile:</strong> 0336 9053 352 / +92 336 9053 352</div>
          <div><strong>Email:</strong> m.irfan.25389@gmail.com</div>
          <div><strong>Address:</strong> Village Chambai Tehsil & District Kohat</div>
          <div><strong>Department:</strong> Elementary & Secondary Education Dept. KP</div>
        </div>
      </div>
      `
    );
  };

  const handleDownload = () => {
    const cardText = `GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT
DIGITAL PROFILE CARD
Name: Muhammad Irfan
Designation: Senior PST (BPS-14) / PST (BPS-12)
School: Govt. Primary School Chambai Kohat
EMIS Code: 16454
District: Kohat, Khyber Pakhtunkhwa
Phone: 0336 9053 352
WhatsApp: +92 336 9053 352
Email: m.irfan.25389@gmail.com
Google Maps: https://maps.app.goo.gl/jtnBTQZVrFqfp9j8A
`;
    saveFileToModuleFolder('My Digital Card', 'Muhammad_Irfan_Digital_Card.txt', cardText, 'text/plain');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fade-in overflow-y-auto">
      <div className="bg-slate-950 text-white rounded-[32px] w-full max-w-lg border-2 border-slate-700 shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-slate-800 bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <h3 className="font-black text-sm tracking-wide">My Digital Profile Card</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 transition-colors"
              title="Print Card"
            >
              <Printer size={16} />
            </button>
            <button
              onClick={handleDownload}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors"
              title="Download to GPS Chambai/My Digital Card"
            >
              <Download size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-red-700 text-slate-900">
            {/* Top Red & Black Diagonal Banner */}
            <div className="relative h-44 bg-gradient-to-br from-neutral-950 via-neutral-900 to-red-800 flex flex-col items-center justify-end pb-3 overflow-hidden">
              <div
                className="absolute -bottom-8 -left-8 w-60 h-28 bg-red-600 rotate-12 opacity-85"
                style={{ clipPath: 'polygon(0 0, 100% 40%, 100% 100%, 0% 100%)' }}
              />
              <div
                className="absolute -bottom-10 -right-8 w-60 h-28 bg-red-700 -rotate-12 opacity-85"
                style={{ clipPath: 'polygon(0 40%, 100% 0, 100% 100%, 0% 100%)' }}
              />

              <div className="relative z-10 w-28 h-28 rounded-full border-4 border-red-600 bg-slate-900 shadow-2xl overflow-hidden flex items-center justify-center">
                <img
                  src={photoUrl || '/assets/aistudio/Microsoft_Profile_78e13ce1.png'}
                  alt="Muhammad Irfan"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-5 text-center space-y-3">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Muhammad Irfan</h2>
                <div className="inline-block bg-red-100 text-red-800 font-extrabold text-xs px-3 py-1 rounded-full mt-1">
                  Senior PST (BPS - 14) / PST
                </div>
                <p className="text-xs font-bold text-slate-500 mt-1">
                  Govt. Primary School Chambai Kohat • EMIS 16454
                </p>
              </div>

              {/* Contact list with Red Circles */}
              <div className="space-y-2 pt-2 text-left max-w-sm mx-auto text-xs font-bold">
                <a
                  href="tel:03369053352"
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-red-50 border border-slate-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Official Phone</div>
                    <div className="text-sm font-black text-slate-900">0336 90 53 352</div>
                  </div>
                </a>

                <a
                  href="https://wa.me/923369053352"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Phone size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">WhatsApp Connected</div>
                    <div className="text-sm font-black text-slate-900">+92 336 9053 352</div>
                  </div>
                </a>

                <a
                  href="mailto:m.irfan.25389@gmail.com"
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <Mail size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] text-slate-400 uppercase font-black">Email Address</div>
                    <div className="text-xs font-black text-slate-900 truncate">m.irfan.25389@gmail.com</div>
                  </div>
                </a>

                <a
                  href="https://maps.app.goo.gl/jtnBTQZVrFqfp9j8A"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-50 hover:bg-red-50 border border-slate-200 transition-colors"
                >
                  <div className="w-9 h-9 rounded-full bg-red-700 text-white flex items-center justify-center shrink-0 shadow-md">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black">Location (Google Maps)</div>
                    <div className="text-xs font-black text-slate-900">Chambai Kohat, Khyber Pakhtunkhwa</div>
                  </div>
                </a>
              </div>

              {/* QR and Verified Badge */}
              <div className="pt-2 flex items-center justify-center gap-3 text-slate-400 text-[10px] font-bold">
                <QrCode size={20} className="text-red-700" />
                <span>Verified Official Digital Profile Card · E&amp;SED KP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black"
          >
            Close Full Screen
          </button>
        </div>
      </div>
    </div>
  );
};
