import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  ArrowLeft, 
  Camera, 
  CameraOff, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  QrCode, 
  RefreshCw, 
  Volume2, 
  VolumeX, 
  User, 
  Building, 
  Clock, 
  Sparkles, 
  Users, 
  Check, 
  Search,
  ScanLine,
  HelpCircle
} from 'lucide-react';
import { Student, SchoolClass, Language, AttendanceRecord } from '../../../types';
import { translations } from '../../../i18n/translations';
import { StorageService } from '../../../services/storage';

interface QrAttendanceScannerSubmoduleProps {
  onBack: () => void;
  currentLang: Language;
}

interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error';
  title: string;
  subtitle: string;
  student?: Student;
  schoolClass?: SchoolClass;
  timestamp: string;
}

export const QrAttendanceScannerSubmodule: React.FC<QrAttendanceScannerSubmoduleProps> = ({
  onBack,
  currentLang
}) => {
  const t = translations[currentLang];
  const classes = StorageService.getClasses();
  const students = StorageService.getStudents();

  // State
  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [manualAdmissionNo, setManualAdmissionNo] = useState<string>('');
  const [recentToast, setRecentToast] = useState<ToastNotification | null>(null);
  const [todayScannedList, setTodayScannedList] = useState<Array<{
    student: Student;
    schoolClass?: SchoolClass;
    timestamp: string;
    alreadyMarked: boolean;
  }>>([]);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef<boolean>(false);
  const lastScannedTimeRef = useRef<{ [key: string]: number }>({});
  const toastTimeoutRef = useRef<any>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Load existing records for today
  useEffect(() => {
    const todayAttendance = StorageService.getAttendance().filter(a => a.date === todayStr && a.status === 'Present');
    const scanned: Array<{
      student: Student;
      schoolClass?: SchoolClass;
      timestamp: string;
      alreadyMarked: boolean;
    }> = [];

    todayAttendance.forEach(a => {
      const st = students.find(s => s.id === a.studentId);
      if (st) {
        const cls = classes.find(c => c.id === st.classId);
        scanned.push({
          student: st,
          schoolClass: cls,
          timestamp: 'Today',
          alreadyMarked: true
        });
      }
    });

    setTodayScannedList(scanned);
  }, []);

  // Play audio chime
  const playSoundChime = (type: 'success' | 'warning' | 'error') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      } else if (type === 'warning') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.2); // A4
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.25);
      }

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch {
      // Audio autoplay restrictions
    }
  };

  // Show Toast
  const triggerToast = (toast: ToastNotification) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setRecentToast(toast);
    playSoundChime(toast.type);

    toastTimeoutRef.current = setTimeout(() => {
      setRecentToast(null);
    }, 4500);
  };

  // Process Scanned Admission Number
  const handleProcessScan = (rawScanText: string) => {
    const cleanCode = rawScanText.trim();
    if (!cleanCode) return;

    const now = Date.now();
    // Debounce 3.5 seconds for same code
    if (lastScannedTimeRef.current[cleanCode] && now - lastScannedTimeRef.current[cleanCode] < 3500) {
      return;
    }
    lastScannedTimeRef.current[cleanCode] = now;

    // Search for student
    const matchedStudent = students.find(s => 
      s.admissionNo.toLowerCase() === cleanCode.toLowerCase() ||
      s.id.toLowerCase() === cleanCode.toLowerCase() ||
      (s.bFormNo && s.bFormNo === cleanCode)
    );

    const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    if (!matchedStudent) {
      triggerToast({
        id: `err-${now}`,
        type: 'error',
        title: t.scannedErrorToast,
        subtitle: `Scanned code: "${cleanCode}" is not registered in GPS Chambai database`,
        timestamp: currentTimeStr
      });
      return;
    }

    const schoolClass = classes.find(c => c.id === matchedStudent.classId);
    const roomInfo = schoolClass?.roomNumber ? `(${schoolClass.roomNumber})` : '';

    // Check if class filter matches (if not universal)
    if (selectedClassId !== 'all' && matchedStudent.classId !== selectedClassId) {
      triggerToast({
        id: `mismatch-${now}`,
        type: 'warning',
        title: `Wrong Class/Room Scanned`,
        subtitle: `${matchedStudent.name} belongs to ${schoolClass?.name || 'another class'} ${roomInfo}, but current filter is set to ${classes.find(c => c.id === selectedClassId)?.name}`,
        student: matchedStudent,
        schoolClass,
        timestamp: currentTimeStr
      });
      return;
    }

    // Check existing attendance today
    const attendanceRecords = StorageService.getAttendance();
    const alreadyMarked = attendanceRecords.some(
      a => a.studentId === matchedStudent.id && a.date === todayStr && a.status === 'Present'
    );

    if (alreadyMarked) {
      triggerToast({
        id: `already-${now}`,
        type: 'warning',
        title: t.scannedAlreadyToast,
        subtitle: `${matchedStudent.name} (${matchedStudent.admissionNo}) is already marked Present in ${schoolClass?.name || 'class'} ${roomInfo}`,
        student: matchedStudent,
        schoolClass,
        timestamp: currentTimeStr
      });
      return;
    }

    // Save as Present in Database!
    const newRecord: AttendanceRecord = {
      id: `att-${matchedStudent.id}-${todayStr}`,
      studentId: matchedStudent.id,
      classId: matchedStudent.classId,
      date: todayStr,
      status: 'Present',
      notes: `QR Code scanned via Camera (${currentTimeStr})`
    };

    StorageService.saveAttendanceRecord(newRecord);

    // Update Scanned List
    setTodayScannedList(prev => [
      {
        student: matchedStudent,
        schoolClass,
        timestamp: currentTimeStr,
        alreadyMarked: false
      },
      ...prev.filter(item => item.student.id !== matchedStudent.id)
    ]);

    // Show Success Toast
    triggerToast({
      id: `success-${now}`,
      type: 'success',
      title: `${t.scannedSuccessToast}!`,
      subtitle: `${matchedStudent.name} (${matchedStudent.admissionNo}) marked Present in ${schoolClass?.name || 'Class'} ${roomInfo}`,
      student: matchedStudent,
      schoolClass,
      timestamp: currentTimeStr
    });
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (html5QrCodeRef.current) {
        await stopCamera();
      }

      const qrScanner = new Html5Qrcode('qr-reader-viewport');
      html5QrCodeRef.current = qrScanner;

      await qrScanner.start(
        { facingMode: cameraFacingMode },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 }
        },
        (decodedText) => {
          handleProcessScan(decodedText);
        },
        () => {
          // Frame parse error - ignore standard noise
        }
      );

      isScanningRef.current = true;
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setIsCameraActive(false);
      setCameraError(
        currentLang === 'ur'
          ? 'کیمرہ شروع کرنے میں رکاوٹ آئی۔ براؤزر اجازت چیک کریں یا نیچے سے ٹیسٹ سکین استعمال کریں۔'
          : 'Unable to access device camera. Please allow camera permissions or use the quick test simulator below.'
      );
    }
  };

  // Stop Camera
  const stopCamera = async () => {
    try {
      if (html5QrCodeRef.current && isScanningRef.current) {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      }
    } catch (e) {
      console.warn('Camera stop error:', e);
    } finally {
      isScanningRef.current = false;
      setIsCameraActive(false);
    }
  };

  // Toggle Camera
  const toggleCamera = () => {
    if (isCameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  // Switch Camera Direction (Rear / Front)
  const handleSwitchCamera = async () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    if (isCameraActive) {
      await stopCamera();
      setTimeout(() => {
        startCamera();
      }, 300);
    }
  };

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current && isScanningRef.current) {
        html5QrCodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrCodeRef.current?.clear();
        });
      }
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Handle Manual Input Submit
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualAdmissionNo.trim()) return;
    handleProcessScan(manualAdmissionNo);
    setManualAdmissionNo('');
  };

  // Total students based on filter
  const activeStudentsList = selectedClassId === 'all' 
    ? students 
    : students.filter(s => s.classId === selectedClassId);

  const todayPresentCount = todayScannedList.filter(item => 
    selectedClassId === 'all' || item.student.classId === selectedClassId
  ).length;

  return (
    <div className="space-y-5 pb-20">
      {/* Floating Instant Toast Notification */}
      {recentToast && (
        <div className="fixed top-18 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border flex items-start gap-3.5 ${
            recentToast.type === 'success'
              ? 'bg-emerald-950 text-white border-emerald-500/80 shadow-emerald-900/30'
              : recentToast.type === 'warning'
              ? 'bg-amber-950 text-white border-amber-500/80 shadow-amber-900/30'
              : 'bg-rose-950 text-white border-rose-500/80 shadow-rose-900/30'
          }`}>
            {/* Student Photo or Status Icon */}
            {recentToast.student ? (
              <div className="w-12 h-14 rounded-xl border border-white/20 bg-white/10 shrink-0 overflow-hidden flex items-center justify-center">
                {recentToast.student.avatarUrl ? (
                  <img
                    src={recentToast.student.avatarUrl}
                    alt={recentToast.student.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-6 h-6 text-white/80" />
                )}
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-white/10 text-white shrink-0">
                {recentToast.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : recentToast.type === 'warning' ? (
                  <AlertTriangle className="w-6 h-6 text-amber-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
              </div>
            )}

            {/* Toast Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                  recentToast.type === 'success' ? 'bg-emerald-500/30 text-emerald-300' :
                  recentToast.type === 'warning' ? 'bg-amber-500/30 text-amber-300' :
                  'bg-rose-500/30 text-rose-300'
                }`}>
                  {recentToast.type === 'success' ? '✓ Present' : recentToast.type === 'warning' ? 'Warning' : 'Error'}
                </span>
                <span className="text-[10px] text-white/60 font-mono">
                  {recentToast.timestamp}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white mt-1 truncate">
                {recentToast.title}
              </h4>
              <p className="text-xs text-white/80 mt-0.5 line-clamp-2 leading-relaxed">
                {recentToast.subtitle}
              </p>

              {recentToast.student && (
                <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-white/70">
                  <span>Adm: <strong className="text-white font-mono">{recentToast.student.admissionNo}</strong></span>
                  <span>Room: <strong className="text-emerald-300">{recentToast.schoolClass?.roomNumber || 'Assigned'}</strong></span>
                </div>
              )}
            </div>

            <button
              onClick={() => setRecentToast(null)}
              className="text-white/60 hover:text-white p-1 rounded-lg"
            >
              ×
            </button>
          </div>
        </div>
      )}

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
            <h2 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-700" />
              <span>{t.subQrScanner}</span>
            </h2>
            <p className="text-xs text-slate-500">
              {t.subQrScannerDesc}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(prev => !prev)}
            className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              soundEnabled 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
            title={soundEnabled ? 'Audio chime enabled' : 'Muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-700" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{soundEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          {/* Camera On / Off Button */}
          <button
            onClick={toggleCamera}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all ${
              isCameraActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            {isCameraActive ? <CameraOff className="w-4 h-4" /> : <Camera className="w-4 h-4" />}
            <span>{isCameraActive ? 'Stop Camera' : 'Start Camera Scan'}</span>
          </button>
        </div>
      </div>

      {/* Class / Room Selector Filter */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700">Attendance Station / Room:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="flex-1 sm:w-64 py-2 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
          >
            <option value="all">Universal (All Classes & Rooms - Main Gate)</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} {c.roomNumber ? `(${c.roomNumber})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Camera Scanner Viewport */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-950 rounded-3xl p-4 border-2 border-slate-800 shadow-xl overflow-hidden relative min-h-[380px] flex flex-col justify-between">
            {/* Viewport Top Bar */}
            <div className="flex items-center justify-between z-20 text-white text-xs">
              <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="font-semibold">{isCameraActive ? 'Camera Live' : 'Camera Ready'}</span>
              </div>

              {isCameraActive && (
                <button
                  onClick={handleSwitchCamera}
                  className="bg-black/60 hover:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-white flex items-center gap-1.5 transition-colors text-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.switchCameraBtn}</span>
                </button>
              )}
            </div>

            {/* Html5Qrcode video container */}
            <div className="relative my-auto flex items-center justify-center overflow-hidden rounded-2xl bg-black min-h-[280px]">
              <div id="qr-reader-viewport" className="w-full max-w-[340px]" />

              {!isCameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-slate-950/90 space-y-3 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
                    <ScanLine className="w-8 h-8 animate-pulse" />
                  </div>
                  <h3 className="text-white font-bold text-sm">
                    {t.scanCameraReady}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    Tap &quot;Start Camera Scan&quot; to activate the real device camera or test scan any admission number below.
                  </p>
                  <button
                    onClick={startCamera}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-700/30 flex items-center gap-2 transition-all mt-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Activate Device Camera</span>
                  </button>
                </div>
              )}

              {/* Aiming Reticle when Active */}
              {isCameraActive && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10">
                  <div className="w-56 h-56 border-2 border-emerald-400/80 rounded-2xl relative shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                    <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-bounce" />
                    <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-emerald-400" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-emerald-400" />
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-emerald-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Viewport Bottom Hint */}
            <div className="text-center text-[11px] text-slate-400 z-20 pt-2 border-t border-white/5">
              Instant match by Admission Number with live audio feedback
            </div>
          </div>

          {/* Camera Error Alert */}
          {cameraError && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold">Camera Notice: </span>
                <span>{cameraError}</span>
              </div>
            </div>
          )}

          {/* Manual Input / Barcode Gun Form */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-emerald-700" />
                <span>Manual Entry / Barcode Scanner Input:</span>
              </label>
              <span className="text-[11px] text-slate-500">e.g. GPS-2026-001</span>
            </div>

            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={manualAdmissionNo}
                onChange={(e) => setManualAdmissionNo(e.target.value)}
                placeholder="Enter or scan Admission Number..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors shrink-0"
              >
                Mark Present
              </button>
            </form>
          </div>

          {/* Quick Test Simulator for Testing without physical cards */}
          <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-700" />
                <span>Quick Test Scanner (1-Click QR Simulate):</span>
              </span>
              <span className="text-[11px] text-emerald-700">Click any student to scan</span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {students.slice(0, 8).map(st => (
                <button
                  key={st.id}
                  onClick={() => handleProcessScan(st.admissionNo)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-emerald-600 hover:text-white border border-emerald-300 text-emerald-900 text-[11px] font-mono transition-colors shadow-2xs"
                  title={`Simulate scan for ${st.name}`}
                >
                  {st.admissionNo} ({st.name.split(' ')[0]})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Today's Live Attendance Roster */}
        <div className="lg:col-span-5 space-y-4">
          {/* Stats Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  Today&apos;s QR Attendance Summary
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {todayStr} · {selectedClassId === 'all' ? 'All Classes' : classes.find(c => c.id === selectedClassId)?.name}
                </p>
              </div>

              <div className="text-right">
                <div className="text-2xl font-extrabold text-emerald-700 font-mono">
                  {todayPresentCount} / {activeStudentsList.length}
                </div>
                <div className="text-[11px] text-slate-500">
                  {activeStudentsList.length > 0 ? Math.round((todayPresentCount / activeStudentsList.length) * 100) : 0}% Present
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
              <div 
                className="bg-emerald-600 h-2.5 rounded-full transition-all duration-500"
                style={{ 
                  width: `${activeStudentsList.length > 0 ? Math.min(100, (todayPresentCount / activeStudentsList.length) * 100) : 0}%` 
                }}
              />
            </div>
          </div>

          {/* Scanned Stream List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-700" />
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wide">
                  Live Scanned Stream
                </h4>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800">
                {todayScannedList.length} Marked Present
              </span>
            </div>

            {todayScannedList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 space-y-2">
                <ScanLine className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs">No students scanned yet today.</p>
                <p className="text-[11px] text-slate-400">Scan QR codes to view live entries.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {todayScannedList.map((item, idx) => (
                  <div
                    key={`${item.student.id}-${idx}`}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs hover:border-emerald-300 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-9 rounded-lg border border-emerald-300 bg-white flex items-center justify-center overflow-hidden shrink-0">
                        {item.student.avatarUrl ? (
                          <img
                            src={item.student.avatarUrl}
                            alt={item.student.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-4 h-4 text-slate-400" />
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-slate-900 truncate max-w-[140px]">
                          {item.student.name}
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          {item.student.admissionNo} · {item.schoolClass?.name || 'Class'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <Check className="w-3 h-3" />
                        <span>Present</span>
                      </span>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                        {item.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
