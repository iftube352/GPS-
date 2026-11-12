import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'qrcode';
import {
  User,
  QrCode as QrCodeIcon,
  Printer,
  X,
  Camera,
  Trash2,
  Edit3,
  Eye,
} from 'lucide-react';
import { Student, SchoolClass, Language } from '../../types';
import { StorageService } from '../../services/storage';
import { printHtmlDocument } from '../../services/printAndFileService';
import { getClassMetaByIdOrName } from '../../utils/classColors';

interface StudentIdCardProps {
  student: Student;
  schoolClass?: SchoolClass;
  currentLang: Language;
  onClose?: () => void;
  showModalControls?: boolean;
  onPhotoUpdated?: (updatedStudent: Student) => void;
  onEdit?: (student: Student) => void;
  onDelete?: (student: Student) => void;
  onViewProfile?: (student: Student) => void;
}

export const StudentIdCard: React.FC<StudentIdCardProps> = ({
  student,
  schoolClass,
  currentLang,
  onClose,
  showModalControls = false,
  onPhotoUpdated,
  onEdit,
  onDelete,
  onViewProfile,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [imgError, setImgError] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState<string | undefined>(
    student.photoUrl || student.avatarUrl
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setCurrentAvatar(student.photoUrl || student.avatarUrl);
    setImgError(false);
  }, [student.photoUrl, student.avatarUrl, student.id]);

  // Generate QR Code directly from the Student's Admission Number (e.g., GPS-2026-001)
  useEffect(() => {
    if (student.admissionNo) {
      QRCode.toDataURL(student.admissionNo.trim(), {
        width: 220,
        margin: 1,
        color: {
          dark: '#064E3B',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [student.admissionNo]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validMime = /^image\/(jpeg|jpg|png|webp)$/i.test(file.type);
    const validExt = /\.(jpe?g|png|webp)$/i.test(file.name);
    if (!validMime && !validExt) {
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const rawDataUrl = event.target?.result as string;
      if (!rawDataUrl) return;

      const img = new Image();
      img.onerror = () => {
        setCurrentAvatar(rawDataUrl);
        setImgError(false);
        const updatedStudent: Student = {
          ...student,
          photoUrl: rawDataUrl,
          avatarUrl: rawDataUrl,
        };
        StorageService.saveStudent(updatedStudent);
        onPhotoUpdated?.(updatedStudent);
      };
      img.onload = () => {
        let finalDataUrl = rawDataUrl;
        try {
          const maxDim = 480;
          let w = img.width || 300;
          let h = img.height || 300;
          if (w > maxDim || h > maxDim) {
            if (w > h) {
              h = Math.round((h * maxDim) / w);
              w = maxDim;
            } else {
              w = Math.round((w * maxDim) / h);
              h = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, w, h);
            ctx.drawImage(img, 0, 0, w, h);
            finalDataUrl = canvas.toDataURL('image/jpeg', 0.86);
          }
        } catch {
          finalDataUrl = rawDataUrl;
        }
        setCurrentAvatar(finalDataUrl);
        setImgError(false);
        const updatedStudent: Student = {
          ...student,
          photoUrl: finalDataUrl,
          avatarUrl: finalDataUrl,
        };
        StorageService.saveStudent(updatedStudent);
        onPhotoUpdated?.(updatedStudent);
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentAvatar(undefined);
    setImgError(false);
    const updatedStudent: Student = {
      ...student,
      photoUrl: '',
      avatarUrl: undefined,
    };
    StorageService.saveStudent(updatedStudent);
    if (onPhotoUpdated) {
      onPhotoUpdated(updatedStudent);
    }
  };

  const clsMeta = getClassMetaByIdOrName(schoolClass?.id || student.classId);

  const handlePrintIdCard = () => {
    printHtmlDocument(
      `Student Identity Card — ${student.name} (${student.admissionNo})`,
      `
        <div style="width:360px;margin:16px auto;border:2px solid #065f46;border-radius:16px;overflow:hidden;font-family:'Plus Jakarta Sans',sans-serif;background:#ffffff;">
          <div style="background:linear-gradient(90deg,#022c22,#065f46);color:#ffffff;padding:10px 14px;display:flex;align-items:center;gap:10px;border-bottom:3px solid #fbbf24;">
            <img src="/assets/aistudio/20260903_200547_79893d25.png" style="width:42px;height:42px;border-radius:50%;border:2px solid #fbbf24;background:#fff;object-fit:cover;" onerror="this.style.display='none'" />
            <div style="text-align:center;flex:1;">
              <div style="font-size:9px;color:#fcd34d;font-weight:800;text-transform:uppercase;">Elementary &amp; Secondary Education Dept KP</div>
              <div style="font-size:13px;font-weight:900;color:#ffffff;">GOVT. PRIMARY SCHOOL CHAMBAI KOHAT</div>
              <div style="font-size:10px;color:#a7f3d0;font-weight:700;">EMIS School Code: 16454</div>
            </div>
          </div>
          <div style="background:#fbbf24;color:#0f172a;text-align:center;padding:3px 0;font-size:10px;font-weight:900;letter-spacing:0.04em;">
            STUDENT IDENTITY CARD • طالب علم شناختی کارڈ
          </div>
          <div style="padding:14px;">
            <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:12px;">
              <div style="width:82px;height:98px;border:2px solid #065f46;border-radius:10px;overflow:hidden;background:#ecfdf5;display:flex;align-items:center;justify-content:center;flex-shrink:0;">
                ${
                  currentAvatar
                    ? `<img src="${currentAvatar}" style="width:100%;height:100%;object-fit:cover;" />`
                    : `<span style="font-size:11px;font-weight:800;color:#065f46;">PHOTO</span>`
                }
              </div>
              <div style="flex:1;font-size:11px;line-height:1.45;">
                <div style="color:#64748b;font-size:9px;font-weight:800;">STUDENT NAME:</div>
                <div style="font-size:14px;font-weight:900;color:#0f172a;margin-bottom:4px;">${student.name}</div>
                <div style="color:#64748b;font-size:9px;font-weight:800;">FATHER'S NAME:</div>
                <div style="font-size:12px;font-weight:700;color:#1e293b;margin-bottom:6px;">${student.fatherName}</div>
                <div style="display:flex;justify-content:space-between;">
                  <div>
                    <span style="color:#64748b;font-size:9px;font-weight:800;display:block;">CLASS:</span>
                    <strong style="color:#065f46;font-size:12px;">${schoolClass?.name || clsMeta.displayName}</strong>
                  </div>
                  <div>
                    <span style="color:#64748b;font-size:9px;font-weight:800;display:block;">ROLL NO:</span>
                    <strong style="color:#0f172a;font-size:12px;">${student.rollNo || '01'}</strong>
                  </div>
                </div>
              </div>
            </div>
            <div style="background:#ecfdf5;border:1.5px solid #6ee7b7;border-radius:12px;padding:10px;display:flex;align-items:center;justify-content:space-between;gap:10px;">
              <div>
                <div style="font-size:9px;font-weight:800;color:#065f46;">ADMISSION NUMBER (QR ID):</div>
                <div style="font-family:monospace;font-size:15px;font-weight:900;color:#064e3b;background:#ffffff;padding:2px 8px;border-radius:6px;border:1px solid #6ee7b7;display:inline-block;margin:3px 0;">
                  ${student.admissionNo}
                </div>
                <div style="font-size:10px;color:#475569;font-weight:600;">B-Form: ${student.bFormNo || 'N/A'}</div>
                <div style="font-size:9px;color:#047857;font-weight:800;margin-top:2px;">Scan with QR Attendance Camera</div>
              </div>
              <div style="width:78px;height:78px;background:#ffffff;padding:4px;border-radius:8px;border:1px solid #059669;flex-shrink:0;">
                ${
                  qrCodeDataUrl
                    ? `<img src="${qrCodeDataUrl}" style="width:100%;height:100%;object-fit:contain;" />`
                    : ''
                }
              </div>
            </div>
          </div>
        </div>
      `
    );
  };

  const cardContent = (
    <div className="w-full max-w-[380px] mx-auto bg-gradient-to-b from-white to-slate-50 border-2 border-emerald-800 rounded-2xl shadow-lg overflow-hidden print-break-inside-avoid relative text-slate-900 select-none">
      {/* Top Header with authentic GPS Chambai Emblem */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-800 to-teal-900 text-white p-3 flex items-center gap-2.5 border-b-2 border-amber-400">
        <div className="w-11 h-11 rounded-full p-0.5 bg-amber-400 shadow-md ring-1 ring-amber-300 overflow-hidden flex items-center justify-center bg-white shrink-0">
          <img
            src="/assets/aistudio/20260903_200547_79893d25.png"
            alt="GPS Chambai"
            className="w-full h-full object-cover rounded-full"
          />
        </div>
        <div className="flex-1 text-center min-w-0">
          <span className="text-[9px] uppercase tracking-wider text-amber-300 font-bold block truncate">
            Elementary &amp; Secondary Education Dept KP
          </span>
          <h4 className="text-xs sm:text-sm font-extrabold text-white leading-tight truncate">
            GOVT. PRIMARY SCHOOL CHAMBAI KOHAT
          </h4>
          <span className="text-[10px] text-emerald-200 font-bold block">
            EMIS School Code: 16454
          </span>
        </div>
      </div>

      {/* Card Tag Banner */}
      <div className="bg-amber-400 text-slate-950 text-center py-0.5 px-2 text-[10px] font-black uppercase tracking-wider flex items-center justify-between shadow-xs">
        <span>STUDENT IDENTITY CARD · طالب علم شناختی کارڈ</span>
        <span className="font-mono">Roll #{student.rollNo || '01'}</span>
      </div>

      {/* Main Card Body */}
      <div className="p-3.5 space-y-3">
        <div className="flex items-start gap-3">
          {/* Student Photo Badge with Passport Border & Photo Upload Action */}
          <div className="relative group w-22 h-26 rounded-xl border-2 border-emerald-800 bg-emerald-50/90 shadow-xs flex flex-col items-center justify-center text-emerald-800 shrink-0 p-1 overflow-hidden">
            {currentAvatar && !imgError ? (
              <img
                src={currentAvatar}
                alt={student.name}
                className="w-full h-full object-cover rounded-lg"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-emerald-800">
                <div className="w-10 h-10 rounded-full bg-emerald-200 flex items-center justify-center mb-1">
                  <User className="w-6 h-6 text-emerald-800" />
                </div>
                <span className="text-[9px] font-bold text-center leading-tight">
                  {student.gender === 'Female' ? 'طالبہ' : 'طالب علم'}
                </span>
              </div>
            )}

            {/* Passport Photo Stamp Tag */}
            <div className="absolute bottom-0 inset-x-0 bg-emerald-950/80 text-emerald-100 text-[8px] font-bold text-center py-0.5 tracking-tight no-print">
              PHOTO
            </div>

            {/* Hover overlay to change student photo */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-emerald-900/70 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer p-1 text-center no-print"
              title="Click to upload/change student photo"
            >
              <Camera className="w-5 h-5 mb-0.5 text-amber-300" />
              <span className="text-[9px] font-bold leading-none text-white">
                {currentAvatar ? 'Change' : 'Upload'}
              </span>
            </div>

            {currentAvatar && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-1 right-1 p-0.5 bg-rose-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-xs no-print"
                title="Remove photo"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Student Information Fields */}
          <div className="flex-1 space-y-1 text-xs min-w-0">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block">NAME:</span>
              <span className="font-extrabold text-slate-900 text-sm leading-tight block truncate">
                {student.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-slate-500 font-bold block">
                FATHER&apos;S NAME:
              </span>
              <span className="font-semibold text-slate-800 leading-tight block truncate">
                {student.fatherName}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-0.5">
              <div>
                <span className="text-[9px] text-slate-500 font-bold block">CLASS:</span>
                <span
                  className="font-black text-xs px-1.5 py-0.5 rounded text-white inline-block"
                  style={{ backgroundColor: clsMeta.hex }}
                >
                  {schoolClass ? schoolClass.name : clsMeta.displayName}
                </span>
              </div>
              <div>
                <span className="text-[9px] text-slate-500 font-bold block">CATEGORY:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {student.admissionCategory || 'F'} (Sec {schoolClass?.section || 'A'})
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Admission Number & Generated QR Code Box */}
        <div className="bg-emerald-50/90 rounded-xl p-2.5 border border-emerald-300 flex items-center justify-between gap-2">
          <div className="space-y-1 min-w-0">
            <span className="text-[9px] font-black text-emerald-950 uppercase block">
              ADMISSION NUMBER (QR CODE):
            </span>
            <span className="font-mono text-sm font-black text-emerald-950 bg-white px-2.5 py-0.5 rounded-lg border border-emerald-400 inline-block shadow-2xs">
              {student.admissionNo}
            </span>
            <div className="text-[10px] text-slate-600 font-mono truncate">
              B-Form: {student.bFormNo || 'N/A'}
            </div>
            <div className="text-[9px] text-emerald-800 font-bold flex items-center gap-1">
              <QrCodeIcon className="w-3 h-3 shrink-0 text-emerald-700" />
              <span>Scan in QR Attendance Scanner</span>
            </div>
          </div>

          {/* Real Generated QR Code on Admission Number */}
          <div className="w-20 h-20 bg-white p-1 rounded-xl border-2 border-emerald-600 shadow-xs flex items-center justify-center shrink-0">
            {qrCodeDataUrl ? (
              <img
                src={qrCodeDataUrl}
                alt={`QR Code for ${student.admissionNo}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-[10px]">
                QR...
              </div>
            )}
          </div>
        </div>

        {/* Footer Meta & Action Buttons */}
        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-600">
          <div>
            <span className="block font-bold text-slate-700">
              Adm Date: {student.admissionDate}
            </span>
            <span>Contact: {student.contactNo || student.mobileNo || '+92 922 510000'}</span>
          </div>

          {!showModalControls && (onEdit || onDelete || onViewProfile) ? (
            <div className="flex items-center gap-1 no-print">
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="px-2 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-black text-[10px] flex items-center gap-1 shadow-2xs"
                title="Print Student ID Card"
              >
                <Printer size={12} />
                <span>Print</span>
              </button>
              {onViewProfile && (
                <button
                  type="button"
                  onClick={() => onViewProfile(student)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="View Full Profile"
                >
                  <Eye size={13} />
                </button>
              )}
              {onEdit && (
                <button
                  type="button"
                  onClick={() => onEdit(student)}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Edit Student"
                >
                  <Edit3 size={13} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(student)}
                  className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600"
                  title="Delete Student"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ) : (
            <div className="text-center w-28 border-t border-slate-400 pt-0.5">
              <span className="font-bold text-slate-800 block">Headmaster</span>
              <span className="text-[8px] text-slate-500">GPS Chambai Kohat</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!showModalControls) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-5 border border-slate-200 flex flex-col items-center max-h-[92vh] overflow-y-auto w-full max-w-md">
        <div className="w-full flex items-center justify-between pb-3 mb-3 border-b no-print">
          <span className="font-black text-slate-900 text-sm flex items-center gap-1.5">
            <QrCodeIcon className="w-4 h-4 text-emerald-700" />
            <span>
              {currentLang === 'ur' ? 'طالب علم شناختی کارڈ' : 'Student Identity Card (QR)'}
            </span>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-700" />
              <span>Photo</span>
            </button>
            <button
              type="button"
              onClick={handlePrintIdCard}
              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs flex items-center gap-1 shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Card</span>
            </button>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {cardContent}
      </div>
    </div>
  );
};
