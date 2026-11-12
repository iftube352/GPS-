import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  Camera, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  QrCode, 
  Volume2, 
  Users, 
  Clock, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Student, SchoolClass, Language, AttendanceRecord } from '../../../types';
import { translations } from '../../../i18n/translations';
import { StorageService } from '../../../services/storage';

interface QrAttendanceScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: Language;
  onAttendanceUpdated: () => void;
}

export const QrAttendanceScannerModal: React.FC<QrAttendanceScannerModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  onAttendanceUpdated
}) => {
  const t = translations[currentLang];
  const classes = StorageService.getClasses();
  const students = StorageService.getStudents();

  const [selectedClassId, setSelectedClassId] = useState<string>('all');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [recentScannedStudent, setRecentScannedStudent] = useState<{
    student: Student;
    schoolClass?: SchoolClass;
    timestamp: string;
    alreadyMarked: boolean;
  } | null>(null);
  const [sessionScannedList, setSessionScannedList] = useState<Array<{
    student: Student;
    timestamp: string;
  }>>([]);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isScanningRef = useRef(false);
  const lastScannedTimeRef = useRef<{ [admissionNo: string]: number }>({});

  // Audio feedback chime using Web Audio API
  const playChime = (success: boolean) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = success ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(success ? 880 : 330, audioCtx.currentTime); // A5 or E4
      if (success) {
        osc.frequency.exponentialRampToValueAtTime(1320, audioCtx.currentTime + 0.15); // E6
      }

      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.25);
    } catch (e) {
      // Audio autoplay may be muted by browser policy
    }
  };

  // Process a scanned Admission Number
  const handleAdmissionNoScanned = (rawCode: string) => {
    const cleanNo = rawCode.trim();
    const now = Date.now();

    // Debounce duplicate camera scans within 3 seconds for the same student
    if (lastScannedTimeRef.current[cleanNo] && now - lastScannedTimeRef.current[cleanNo] < 3000) {
      return;
    }
    lastScannedTimeRef.current[cleanNo] = now;

    // Find student
    const matchedStudent = students.find(
      s => s.admissionNo.toLowerCase() === cleanNo.toLowerCase() ||
           s.id.toLowerCase() === cleanNo.toLowerCase()
    );

    if (!matchedStudent) {
      playChime(false);
      setCameraError(`${t.studentNotFound}: "${cleanNo}"`);
      setTimeout(() => setCameraError(null), 3500);
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Check if attendance already recorded today
    const existingAttendance = StorageService.getAttendance();
    const alreadyRec = existingAttendance.find(
      a => a.studentId === matchedStudent.id && a.date === todayStr && a.status === 'Present'
    );

    const targetClass = classes.find(c => c.id === matchedStudent.classId);

    // Save attendance as Present
    const newRecord: AttendanceRecord = {
      id: `att-${matchedStudent.id}-${todayStr}`,
      studentId: matchedStudent.id,
      classId: matchedStudent.classId,
      date: todayStr,
      status: 'Present',
      notes: `QR Scanned at ${timeFormatted}`
    };

    StorageService.saveAttendanceRecord(newRecord);
    onAttendanceUpdated();

    playChime(true);
    setRecentScannedStudent({
      student: matchedStudent,
      schoolClass: targetClass,
      timestamp: timeFormatted,
      alreadyMarked: !!alreadyRec
    });

    if (!alreadyRec) {
      setSessionScannedList(prev => [
        { student: matchedStudent, timestamp: timeFormatted },
        ...prev.filter(item => item.student.id !== matchedStudent.id)
      ]);
    }
  };

  // Start Camera
  const startCamera = async () => {
    try {
      setCameraError(null);
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode('qr-reader-container');
      }

      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        setCameraError('No video camera detected on this device.');
        return;
      }

      // Use back camera if available, else first
      const backCamera = cameras.find(c => c.label.toLowerCase().includes('back') || c.label.toLowerCase().includes('rear'));
      const cameraId = backCamera ? backCamera.id : cameras[0].id;

      await scannerRef.current.start(
        cameraId,
        {
          fps: 10,
          qrbox: { width: 220, height: 220 }
        },
        (decodedText) => {
          handleAdmissionNoScanned(decodedText);
        },
        () => {
          // Frame parse error (ignore frame misses)
        }
      );

      isScanningRef.current = true;
      setCameraActive(true);
    } catch (err: any) {
      console.warn('Camera start error:', err);
      setCameraActive(false);
      setCameraError('Camera access unavailable or blocked in iframe sandbox. You can use the Quick Test Scanner buttons below.');
    }
  };

  const stopCamera = async () => {
    if (scannerRef.current && isScanningRef.current) {
      try {
        await scannerRef.current.stop();
        isScanningRef.current = false;
        setCameraActive(false);
      } catch (err) {
        console.warn('Camera stop error:', err);
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter students for the quick simulator
  const simulatorStudents = selectedClassId === 'all'
    ? students
    : students.filter(s => s.classId === selectedClassId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-slate-950 shadow-md">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                {t.qrScanAttendance}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {t.scanStudentCardPrompt}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-emerald-700/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Class Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
              Target Class (جماعت):
            </span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="py-1.5 px-3 border border-slate-300 rounded-lg text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">{t.universalScan}</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name} {c.urduName ? `(${c.urduName})` : ''}</option>
              ))}
            </select>
          </div>

          {/* Camera Viewfinder Box */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 aspect-video max-h-64 sm:max-h-72 w-full flex items-center justify-center border-2 border-emerald-600 shadow-inner">
            <div id="qr-reader-container" className="w-full h-full" />

            {/* Viewfinder Target Graphic Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
              <div className="relative w-48 h-48 border-2 border-emerald-400/60 rounded-2xl flex items-center justify-center shadow-lg">
                {/* 4 Corner Markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400 rounded-br-lg" />

                {/* Animated Laser Scanning Beam */}
                <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-pulse" />
              </div>

              <span className="mt-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-[11px] text-emerald-300 font-semibold flex items-center gap-1.5 shadow-md">
                <Camera className="w-3.5 h-3.5 text-amber-400" />
                <span>Align student ID card QR code inside frame</span>
              </span>
            </div>
          </div>

          {/* Error Message */}
          {cameraError && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start gap-2.5 text-amber-900 text-xs">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{cameraError}</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  You can immediately test attendance scanning using the quick ID card simulator below.
                </p>
              </div>
            </div>
          )}

          {/* Most Recent Scanned Student Banner */}
          {recentScannedStudent && (
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-2xl flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {recentScannedStudent.student.admissionNo}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recentScannedStudent.timestamp}
                    </span>
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 mt-0.5">
                    {recentScannedStudent.student.name}
                  </h4>
                  <p className="text-xs text-slate-600">
                    S/O {recentScannedStudent.student.fatherName} · {recentScannedStudent.schoolClass?.name || 'Class 5'}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-sm inline-block">
                  ✓ PRESENT
                </span>
                {recentScannedStudent.alreadyMarked && (
                  <span className="block text-[10px] text-slate-500 mt-1 italic">
                    {t.alreadyMarked}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Quick Test Scanner Buttons (Instant Simulator) */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t.scanSimulate} (Test without physical camera):</span>
              </span>
              <span className="text-[11px] text-slate-500">
                Click any student card to scan their Admission #
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-1">
              {simulatorStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleAdmissionNoScanned(st.admissionNo)}
                  className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/50 text-left rtl:text-right flex items-center justify-between gap-2 transition-all shadow-2xs group"
                >
                  <div className="truncate">
                    <span className="font-mono text-[10px] font-bold text-emerald-800 block">
                      {st.admissionNo}
                    </span>
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 block truncate">
                      {st.name}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
                    Scan ID →
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Scanned in this session summary */}
          {sessionScannedList.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>{t.todayScannedCount}: {sessionScannedList.length}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sessionScannedList.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-xs font-medium"
                  >
                    <span className="font-mono font-bold">{item.student.admissionNo}</span>
                    <span>·</span>
                    <span>{item.student.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-500">
            Govt. Primary School Chambai Automated Gate Attendance
          </span>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
