import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  ArrowLeft,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Printer,
  UserCheck,
  Search,
  Camera,
  CameraOff,
  RefreshCw,
  Volume2,
  VolumeX,
  ScanLine,
  Image as ImageIcon,
  LogIn,
  LogOut,
  MessageCircle,
} from 'lucide-react';
import { Student, AttendanceRecord } from '../../../types';
import { StorageService } from '../../../services/storage';
import { getClassMetaByIdOrName, getClassHexColor } from '../../../utils/classColors';
import { printHtmlDocument } from '../../../services/printAndFileService';
import { WhatsAppNotificationService } from '../../../services/whatsappNotificationService';

interface SubmoduleProps {
  onBack: () => void;
  lang: 'en' | 'ur';
}

export const QrScannerSubmodule: React.FC<SubmoduleProps> = ({ onBack, lang }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [scanInput, setScanInput] = useState('');
  const [scanDirection, setScanDirection] = useState<'IN' | 'OUT'>('IN');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [availableCameras, setAvailableCameras] = useState<{ id: string; label: string }[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scanResult, setScanResult] = useState<{
    type: 'success' | 'warning' | 'error';
    message: string;
    whatsAppStatus?: string;
    student?: Student;
    time?: string;
    direction?: 'IN' | 'OUT';
  } | null>(null);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedTimeRef = useRef<Record<string, number>>({});
  const fileCaptureInputRef = useRef<HTMLInputElement>(null);

  const today = new Date().toISOString().split('T')[0];

  const refresh = () => {
    setStudents(StorageService.getStudents());
    setAttendanceList(StorageService.getAttendance());
  };

  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && isScanningRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch {
      // ignore stop errors
    } finally {
      isScanningRef.current = false;
      setIsCameraActive(false);
    }
  };

  useEffect(() => {
    refresh();
    const timer = setTimeout(() => {
      requestCameraPermissionAndStart('environment');
    }, 300);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            try {
              html5QrCodeRef.current?.clear();
            } catch {
              // ignore
            }
          });
      }
    };
  }, []);

  const playBeep = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.16);
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(540, ctx.currentTime);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
      }
      gain.gain.setValueAtTime(0.22, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {
      // ignore audio context restrictions
    }
  };

  const markStudentPresentByQr = async (tokenOrAdmissionNo: string) => {
    const raw = tokenOrAdmissionNo.trim();
    if (!raw) return;

    const now = Date.now();
    if (lastScannedTimeRef.current[raw] && now - lastScannedTimeRef.current[raw] < 2500) {
      return;
    }
    lastScannedTimeRef.current[raw] = now;

    const query = raw.toLowerCase();
    const currentStudents = StorageService.getStudents();
    const matched = currentStudents.find(
      (s) =>
        s.admissionNo.toLowerCase() === query ||
        (s.qrToken || '').toLowerCase() === query ||
        `gpsc-qr-${s.admissionNo}`.toLowerCase() === query ||
        s.id.toLowerCase() === query ||
        s.name.toLowerCase() === query
    );

    const timeStr = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });

    if (!matched) {
      playBeep('error');
      setScanResult({
        type: 'error',
        message: `No student found matching Admission No / QR Code "${raw}".`,
        time: timeStr,
      });
      return;
    }

    const currentAtt = StorageService.getAttendance();
    const existingClassRecord = currentAtt.find(
      (a) => a.date === today && a.classId === matched.classId && a.records
    );

    const updatedRecord: AttendanceRecord = existingClassRecord
      ? {
          ...existingClassRecord,
          records: {
            ...existingClassRecord.records,
            [matched.id]: 'P',
          },
        }
      : {
          id: `att-${matched.classId}-${today}`,
          date: today,
          classId: matched.classId,
          studentId: matched.id,
          status: 'Present',
          records: {
            [matched.id]: 'P',
          },
        };

    StorageService.saveAttendance(updatedRecord);
    refresh();

    // Send automatic Student IN or Student OUT WhatsApp notification
    const waRes = await WhatsAppNotificationService.sendStudentInOutNotification({
      student: matched,
      eventType: scanDirection,
      openManualWhatsAppWindow: false,
    });

    playBeep('success');
    setScanResult({
      type: 'success',
      message:
        scanDirection === 'IN'
          ? `${matched.name} (${matched.admissionNo}) Marked ARRIVED (IN) at GPS Chambai!`
          : `${matched.name} (${matched.admissionNo}) Marked LEFT SCHOOL (OUT) from GPS Chambai!`,
      whatsAppStatus: waRes.reason,
      student: matched,
      time: timeStr,
      direction: scanDirection,
    });
    setScanInput('');
  };

  const requestCameraPermissionAndStart = async (
    modeOverride?: 'environment' | 'user',
    specificDeviceId?: string
  ) => {
    if (isStartingCamera) return;
    setIsStartingCamera(true);
    setCameraError(null);

    const targetMode = modeOverride || cameraFacingMode;

    try {
      if (html5QrCodeRef.current && isScanningRef.current) {
        await stopCamera();
      }

      const readerEl = document.getElementById('gps-chambai-qr-reader');
      if (!readerEl) {
        setIsStartingCamera(false);
        return;
      }

      const qrScanner = new Html5Qrcode('gps-chambai-qr-reader');
      html5QrCodeRef.current = qrScanner;

      const scanConfig = {
        fps: 12,
        qrbox: { width: 220, height: 220 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = (decodedText: string) => {
        markStudentPresentByQr(decodedText);
      };

      if (specificDeviceId) {
        await qrScanner.start(specificDeviceId, scanConfig, onScanSuccess, () => {});
        isScanningRef.current = true;
        setIsCameraActive(true);
        setIsStartingCamera(false);
        return;
      }

      try {
        const devices = await Html5Qrcode.getCameras();
        if (devices && devices.length > 0) {
          setAvailableCameras(devices);
          const preferred =
            devices.find((d) =>
              targetMode === 'environment'
                ? /back|rear|environment/i.test(d.label)
                : /front|user|face/i.test(d.label)
            ) || devices[devices.length - 1];

          setSelectedCameraId(preferred.id);
          await qrScanner.start(preferred.id, scanConfig, onScanSuccess, () => {});
          isScanningRef.current = true;
          setIsCameraActive(true);
          setIsStartingCamera(false);
          return;
        }
      } catch {
        // Fallback to facingMode constraints
      }

      try {
        await qrScanner.start({ facingMode: targetMode }, scanConfig, onScanSuccess, () => {});
        isScanningRef.current = true;
        setIsCameraActive(true);
        setIsStartingCamera(false);
        return;
      } catch {
        const fallbackMode = targetMode === 'environment' ? 'user' : 'environment';
        await qrScanner.start({ facingMode: fallbackMode }, scanConfig, onScanSuccess, () => {});
        setCameraFacingMode(fallbackMode);
        isScanningRef.current = true;
        setIsCameraActive(true);
        setIsStartingCamera(false);
        return;
      }
    } catch (err) {
      console.warn('Camera permission or initialization error:', err);
      isScanningRef.current = false;
      setIsCameraActive(false);
      setCameraError(
        lang === 'ur'
          ? 'لائیو کیمرہ آلاؤ نہیں ہو سکا۔ اوپر براؤزر کے ایڈریس بار میں Camera Allow کریں یا ساتھ والے "Capture Card Photo" بٹن سے کارڈ کی تصویر لے کر اسکین کریں۔'
          : 'Live camera permission was blocked or unavailable. Please click "Allow" on your browser camera prompt, or use the "Capture Card Photo" button next to it.'
      );
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleSwitchCamera = async () => {
    if (availableCameras.length > 1) {
      const idx = availableCameras.findIndex((c) => c.id === selectedCameraId);
      const nextCam = availableCameras[(idx + 1) % availableCameras.length];
      setSelectedCameraId(nextCam.id);
      await stopCamera();
      setTimeout(() => {
        requestCameraPermissionAndStart(undefined, nextCam.id);
      }, 200);
      return;
    }

    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      await stopCamera();
      setTimeout(() => {
        requestCameraPermissionAndStart(nextMode);
      }, 200);
    }
  };

  const handleScanFromCapturedImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setCameraError(null);
      if (isCameraActive) {
        await stopCamera();
      }
      const qrScanner = new Html5Qrcode('gps-chambai-qr-reader');
      const decodedText = await qrScanner.scanFile(file, true);
      markStudentPresentByQr(decodedText);
    } catch {
      playBeep('error');
      setScanResult({
        type: 'error',
        message:
          lang === 'ur'
            ? 'تصویر میں کوئی واضح QR کوڈ نہیں ملا۔ براہ کرم اسٹوڈنٹ کارڈ کے QR کوڈ کی صاف تصویر لیں۔'
            : 'Could not detect a clear QR code in the captured image. Please hold the Student ID Card steady and try again.',
      });
    } finally {
      if (fileCaptureInputRef.current) {
        fileCaptureInputRef.current.value = '';
      }
    }
  };

  const isStudentPresentToday = (st: Student) => {
    return attendanceList.some(
      (a) =>
        a.date === today &&
        ((a.classId === st.classId && a.records && a.records[st.id] === 'P') ||
          (a.studentId === st.id && a.status === 'Present'))
    );
  };

  const presentStudentsToday = students.filter((st) => isStudentPresentToday(st));

  const handlePrintTodayQrAttendance = () => {
    const rows = presentStudentsToday
      .map(
        (st, idx) => `
        <tr>
          <td>${idx + 1}</td>
          <td><strong>${st.admissionNo}</strong></td>
          <td>${st.rollNo || idx + 1}</td>
          <td><strong>${st.name}</strong></td>
          <td>${st.fatherName}</td>
          <td>${getClassMetaByIdOrName(st.classId).displayName}</td>
          <td><strong style="color:#059669;">PRESENT (QR Scanned)</strong></td>
        </tr>
      `
      )
      .join('');

    printHtmlDocument(
      `QR Attendance Daily Log (${today})`,
      `
        <p style="font-size:12px;margin-bottom:10px;">
          <strong>Date:</strong> ${today} &nbsp;|&nbsp;
          <strong>Total Present via Student Card QR:</strong> ${presentStudentsToday.length} / ${students.length}
        </p>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Admission No (QR Code)</th>
              <th>Roll No</th>
              <th>Student Name</th>
              <th>Father Name</th>
              <th>Class</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${
              rows ||
              '<tr><td colspan="7" style="text-align:center;">No students scanned today yet</td></tr>'
            }
          </tbody>
        </table>
      `
    );
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white rounded-3xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              stopCamera();
              onBack();
            }}
            className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              GPS Chambai Kohat • QR Scanner + Automatic WhatsApp Parent Alert
            </span>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'کیو آر حاضری اسکینر (IN / OUT)' : 'QR Attendance Scanner (IN / OUT)'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Scan Mode Toggle: Student IN vs Student OUT */}
          <div className="flex bg-black/25 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setScanDirection('IN')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition-all ${
                scanDirection === 'IN'
                  ? 'bg-emerald-400 text-slate-950 shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <LogIn size={12} />
              <span>Scan IN (Arrived)</span>
            </button>
            <button
              type="button"
              onClick={() => setScanDirection('OUT')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black flex items-center gap-1 transition-all ${
                scanDirection === 'OUT'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-white/90 hover:text-white'
              }`}
            >
              <LogOut size={12} />
              <span>Scan OUT (Left)</span>
            </button>
          </div>

          <button
            onClick={() => setSoundEnabled((prev) => !prev)}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white"
            title={soundEnabled ? 'Sound Beep ON' : 'Sound Muted'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={handlePrintTodayQrAttendance}
            className="px-3 py-2 rounded-xl bg-white text-emerald-900 text-xs font-black flex items-center gap-1.5 shadow-md"
          >
            <Printer size={14} />
            <span>Print ({presentStudentsToday.length})</span>
          </button>
        </div>
      </div>

      {/* Hidden Native Mobile Camera Capture Input */}
      <input
        ref={fileCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleScanFromCapturedImage}
        className="hidden"
      />

      {/* Live Camera QR Scanner Box */}
      <div className="bg-slate-950 text-white rounded-3xl p-4 shadow-xl border border-slate-800 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="text-xs font-black tracking-wide text-emerald-300">
              {isCameraActive
                ? `CAMERA LIVE (${scanDirection} MODE) — Hold Student ID Card QR in Frame`
                : `Allow Camera to Scan Student ID Card (${scanDirection} Notification)`}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {isCameraActive && (
              <button
                type="button"
                onClick={handleSwitchCamera}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-black flex items-center gap-1 border border-slate-700"
              >
                <RefreshCw size={12} />
                <span>Switch Cam</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                isCameraActive ? stopCamera() : requestCameraPermissionAndStart()
              }
              disabled={isStartingCamera}
              className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md ${
                isCameraActive
                  ? 'bg-rose-600 hover:bg-rose-500 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {isCameraActive ? <CameraOff size={14} /> : <Camera size={14} />}
              <span>
                {isStartingCamera
                  ? 'Starting...'
                  : isCameraActive
                  ? 'Stop Camera'
                  : 'Allow Camera & Scan'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => fileCaptureInputRef.current?.click()}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
            >
              <ImageIcon size={14} />
              <span>Capture Card Photo</span>
            </button>
          </div>
        </div>

        {/* Camera Viewport Container */}
        <div className="relative mx-auto w-full max-w-sm min-h-[260px] rounded-2xl border-2 border-emerald-500/60 bg-slate-900 flex flex-col items-center justify-center overflow-hidden shadow-[0_0_25px_rgba(16,185,129,0.2)]">
          <div id="gps-chambai-qr-reader" className="w-full" />

          {!isCameraActive && (
            <div className="p-6 text-center flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
                <ScanLine size={36} className="animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-white">
                  Student ID Card Camera QR Scanner ({scanDirection} Mode)
                </h3>
                <p className="text-[11px] text-slate-400 max-w-xs">
                  Scanning a Student ID Card automatically marks attendance and dispatches the{' '}
                  <strong>Student {scanDirection}</strong> WhatsApp notification to the parent.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => requestCameraPermissionAndStart()}
                  disabled={isStartingCamera}
                  className="px-4 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                  <Camera size={16} />
                  <span>
                    {isStartingCamera ? 'Opening Camera...' : 'Allow Camera & Start Live Scanning'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => fileCaptureInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                >
                  <ImageIcon size={15} />
                  <span>Scan via Camera Photo</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/50 text-amber-200 text-xs font-bold flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        {/* Manual / Hardware Barcode Gun Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            markStudentPresentByQr(scanInput);
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={scanInput}
              onChange={(e) => setScanInput(e.target.value)}
              placeholder="Or enter Student Admission No (e.g., GPS-2026-001)..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-emerald-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shrink-0"
          >
            Mark {scanDirection}
          </button>
        </form>
      </div>

      {/* Live Scan Toast Result Banner + Manual WhatsApp Trigger */}
      {scanResult && (
        <div
          className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 shadow-sm ${
            scanResult.type === 'success'
              ? 'bg-emerald-50 border-emerald-400 text-emerald-950'
              : scanResult.type === 'warning'
              ? 'bg-amber-50 border-amber-400 text-amber-950'
              : 'bg-rose-50 border-rose-300 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {scanResult.student ? (
              <img
                src={scanResult.student.photoUrl || scanResult.student.avatarUrl}
                alt={scanResult.student.name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-600 shrink-0 bg-white"
              />
            ) : scanResult.type === 'error' ? (
              <AlertTriangle size={22} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
            )}
            <div className="min-w-0">
              <div className="text-xs font-black">{scanResult.message}</div>
              {scanResult.student && (
                <div className="text-[11px] font-bold opacity-80 mt-0.5">
                  Father: {scanResult.student.fatherName} • Class:{' '}
                  {getClassMetaByIdOrName(scanResult.student.classId).displayName} • Time:{' '}
                  {scanResult.time}
                </div>
              )}
              {scanResult.whatsAppStatus && (
                <div className="text-[10px] font-black text-emerald-800 mt-1">
                  WhatsApp Alert: {scanResult.whatsAppStatus}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {scanResult.student && (
              <button
                onClick={() =>
                  WhatsAppNotificationService.sendStudentInOutNotification({
                    student: scanResult.student!,
                    eventType: scanResult.direction || scanDirection,
                    openManualWhatsAppWindow: true,
                  })
                }
                className="px-3 py-1.5 rounded-xl bg-green-600 hover:bg-green-500 text-white text-[11px] font-black flex items-center gap-1 shadow-xs"
              >
                <MessageCircle size={13} />
                <span>Send via WhatsApp (wa.me)</span>
              </button>
            )}
            <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-600 text-white">
              ✓ {scanResult.direction || 'PRESENT'}
            </span>
          </div>
        </div>
      )}

      {/* One-Tap Quick QR Student Card List */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Student Admission QR Roster ({presentStudentsToday.length} / {students.length} Present Today)
            </h3>
            <p className="text-[10px] font-semibold text-slate-500">
              Scan Student ID Card via Camera above or tap any student below to mark {scanDirection} &amp; notify parent
            </p>
          </div>
          <UserCheck size={18} className="text-emerald-600" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {students.map((st) => {
            const clsMeta = getClassMetaByIdOrName(st.classId);
            const clsHex = getClassHexColor(st.classId);
            const isPresentToday = isStudentPresentToday(st);

            return (
              <button
                key={st.id}
                onClick={() => markStudentPresentByQr(st.admissionNo)}
                className={`p-3 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-98 ${
                  isPresentToday
                    ? 'bg-emerald-50/70 border-emerald-400'
                    : 'bg-slate-50 border-slate-200 hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={st.photoUrl || st.avatarUrl}
                    alt={st.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-300 shrink-0 bg-white"
                  />
                  <div className="min-w-0">
                    <div className="text-xs font-black text-slate-900 truncate">
                      {st.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <QrCode size={10} className="text-emerald-700" />
                      <span className="font-mono">{st.admissionNo}</span> •{' '}
                      <span style={{ color: clsHex }}>{clsMeta.shortCode}</span>
                    </div>
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-black shrink-0 ${
                    isPresentToday
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isPresentToday ? `✓ ${scanDirection}` : `Scan ${scanDirection}`}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
