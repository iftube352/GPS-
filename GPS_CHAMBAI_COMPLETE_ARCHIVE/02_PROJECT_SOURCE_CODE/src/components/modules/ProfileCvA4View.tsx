import React, { useState, useRef, useEffect } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Edit3,
  Save,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Share2,
  Printer,
  FolderOpen,
  User,
  Phone,
  Mail,
  Globe,
  Check,
} from 'lucide-react';
import {
  HirsCvData,
  HirsCvEducationRow,
  HirsCvPostingRow,
  HirsCvBpsRow,
} from '../../types';
import { StorageService, DEFAULT_HIRS_CV } from '../../services/storage';
import { pickImageFromAndroidOrWeb } from '../../utils/androidPhotoPicker';
import {
  exportAndSaveRealPdf,
  exportAndSaveWordDoc,
  printHtmlDocument,
  shareDocumentOrFile,
} from '../../services/printAndFileService';
import { StorageFolderService } from '../../services/storageFolderService';

interface ProfileCvA4ViewProps {
  onPhotoUpdated?: (newPhotoDataUrl: string) => void;
  onOpenStoragePicker?: (cb: (dataUrl: string) => void) => void;
}

export const ProfileCvA4View: React.FC<ProfileCvA4ViewProps> = ({
  onPhotoUpdated,
  onOpenStoragePicker,
}) => {
  const [cvData, setCvData] = useState<HirsCvData>(() => {
    const stored = StorageService.getHirsCv();
    const custom = StorageService.getCustomization();
    return {
      ...DEFAULT_HIRS_CV,
      ...stored,
      portraitUrl:
        custom.teacherProfilePhotoUrl ||
        stored.portraitUrl ||
        DEFAULT_HIRS_CV.portraitUrl,
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [draftCv, setDraftCv] = useState<HirsCvData>(cvData);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Responsive A4 scaling so full 210mm x 297mm (794px x 1123px) fits any mobile screen width without cropping
  const wrapperRef = useRef<HTMLDivElement>(null);
  const a4DocumentRef = useRef<HTMLDivElement>(null);
  const portraitInputRef = useRef<HTMLInputElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(360);
  const [zoomMultiplier, setZoomMultiplier] = useState<number>(1);

  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;

  useEffect(() => {
    const updateWidth = () => {
      if (wrapperRef.current) {
        const w = wrapperRef.current.clientWidth;
        if (w > 40) {
          setContainerWidth(w - 16);
        }
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateWidth);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const baseScale = Math.min(1, Math.max(0.32, containerWidth / A4_WIDTH_PX));
  const effectiveScale = Number((baseScale * zoomMultiplier).toFixed(3));

  const persistCvData = (nextData: HirsCvData, msg = 'Profile CV saved permanently!') => {
    setCvData(nextData);
    StorageService.saveHirsCv(nextData);
    // Sync portrait photo with global customization so Profile & Staff stay consistent
    const currentCustom = StorageService.getCustomization();
    if (nextData.portraitUrl && nextData.portraitUrl !== currentCustom.teacherProfilePhotoUrl) {
      StorageService.saveCustomization({
        ...currentCustom,
        teacherProfilePhotoUrl: nextData.portraitUrl,
      });
      onPhotoUpdated?.(nextData.portraitUrl);
    }
    showToast(msg);
  };

  const handleOpenEdit = () => {
    setDraftCv(JSON.parse(JSON.stringify(cvData)));
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraftCv(cvData);
    setIsEditing(false);
    showToast('Edits cancelled. Original CV restored.');
  };

  const handleSaveEditModal = () => {
    persistCvData(draftCv, 'CV changes applied & saved permanently!');
    setIsEditing(false);
  };

  const handleDirectSaveButton = () => {
    const target = isEditing ? draftCv : cvData;
    persistCvData(target, 'CV saved permanently in local database & GPS Chambai/Staff_HR!');
    if (isEditing) setIsEditing(false);
  };

  const handlePortraitPick = async () => {
    const result = await pickImageFromAndroidOrWeb({
      maxWidth: 900,
      maxHeight: 900,
      quality: 0.9,
      fallbackInputRef: portraitInputRef,
    });
    if (result?.dataUrl) {
      if (isEditing) {
        setDraftCv((prev) => ({ ...prev, portraitUrl: result.dataUrl }));
      } else {
        const next = { ...cvData, portraitUrl: result.dataUrl };
        persistCvData(next, 'Profile CV photo updated & saved!');
      }
      await StorageFolderService.saveDataUrlFile(
        'GPS Chambai/Staff',
        `Profile_CV_Photo_${Date.now()}.jpg`,
        result.dataUrl,
        'image/jpeg',
        'Profile CV'
      );
    }
  };

  const handleFallbackFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        if (isEditing) {
          setDraftCv((prev) => ({ ...prev, portraitUrl: reader.result as string }));
        } else {
          const next = { ...cvData, portraitUrl: reader.result as string };
          persistCvData(next, 'Profile CV photo updated & saved!');
        }
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Build self-contained A4 HTML for PDF, Print, and DOC/DOCX exports
  const buildFullA4CvHtml = (data: HirsCvData): string => {
    const academicRows = data.educationQualifications.slice(0, 3);
    const profRows = data.educationQualifications.slice(3);
    const post1 = data.postingTransfers[0] || DEFAULT_HIRS_CV.postingTransfers[0];
    const post2 = data.postingTransfers[1] || DEFAULT_HIRS_CV.postingTransfers[1];
    const bps1 = data.bpsJobTypes[0] || DEFAULT_HIRS_CV.bpsJobTypes[0];
    const bps2 = data.bpsJobTypes[1] || DEFAULT_HIRS_CV.bpsJobTypes[1];

    return `
      <div style="width:210mm;min-height:297mm;margin:0 auto;display:flex;flex-direction:row;font-family:Arial,Helvetica,sans-serif;background:#ffffff;color:#0f172a;box-sizing:border-box;border:1px solid #cbd5e1;">
        <!-- Left Navy Column -->
        <div style="width:37.5%;background:#051d2d;color:#ffffff;padding:18px 16px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;">
          <div>
            <div style="text-align:center;margin-bottom:10px;">
              <div style="width:146px;height:146px;margin:0 auto 10px auto;border-radius:50%;border:5px solid #66c61c;padding:4px;background:#051d2d;position:relative;box-sizing:border-box;">
                <img src="${data.portraitUrl}" alt="${data.fullName}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />
              </div>
              <div style="font-family:Georgia,serif;font-style:italic;font-size:15px;color:#e2e8f0;margin-bottom:2px;">${data.calligraphyTitle || 'Hello , I am..'}</div>
              <div style="font-size:21px;font-weight:900;letter-spacing:0.6px;color:#ffffff;text-transform:uppercase;">${data.fullName}</div>
              <div style="font-size:16px;font-weight:900;color:#66c61c;margin-top:2px;">${data.designation}</div>
            </div>

            <!-- PROFILE -->
            <div style="margin-top:14px;">
              <div style="border-bottom:2px solid #ffffff;padding-bottom:4px;margin-bottom:8px;font-size:14px;font-weight:900;letter-spacing:1px;">
                PROFILE
              </div>
              <table style="width:100%;border-collapse:collapse;font-size:11.5px;color:#ffffff;">
                <tr><td style="padding:3.5px 0;color:#cbd5e1;width:44%;">Father Name.</td><td style="padding:3.5px 0;font-weight:800;">${data.fatherName}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">CNIC No.</td><td style="padding:3.5px 0;font-weight:800;">${data.cnic}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Personal No.</td><td style="padding:3.5px 0;font-weight:800;">${data.personalNo}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Gender.</td><td style="padding:3.5px 0;font-weight:800;">${data.gender}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Domicile.</td><td style="padding:3.5px 0;font-weight:800;">${data.domicile}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Station.</td><td style="padding:3.5px 0;font-weight:800;">${data.station}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Designation.</td><td style="padding:3.5px 0;font-weight:800;">${data.designationLong}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Last Post.</td><td style="padding:3.5px 0;font-weight:800;">${data.lastPostDate}</td></tr>
                <tr><td style="padding:3.5px 0;color:#cbd5e1;">Covid 19 Vaccination.</td><td style="padding:3.5px 0;font-weight:800;">${data.covidVaccination}</td></tr>
              </table>
            </div>

            <!-- CONTACT -->
            <div style="margin-top:16px;">
              <div style="border-bottom:2px solid #ffffff;padding-bottom:4px;margin-bottom:8px;font-size:14px;font-weight:900;letter-spacing:1px;">
                CONTACT
              </div>
              <div style="font-size:12px;font-weight:800;line-height:1.9;">
                <div>Tel: ${data.mobile1}</div>
                <div>WhatsApp: ${data.mobile2}</div>
                <div>Email: ${data.email}</div>
              </div>
            </div>
          </div>

          <!-- SOCIAL MEDIA -->
          <div style="margin-top:18px;">
            <div style="border-bottom:2px solid #ffffff;padding-bottom:4px;margin-bottom:8px;font-size:14px;font-weight:900;letter-spacing:1px;">
              SOCIAL MEDIA
            </div>
            <div style="font-size:11px;color:#cbd5e1;margin-bottom:6px;">
              YouTube • Facebook • Instagram • LinkedIn • TikTok • Snapchat • WhatsApp • Pinterest
            </div>
            <div style="text-align:center;font-size:14px;font-weight:800;color:#ffffff;letter-spacing:0.5px;">
              ${data.socialHandle}
            </div>
          </div>
        </div>

        <!-- Right White Column -->
        <div style="width:62.5%;padding:12px 14px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:space-between;font-size:11px;">
          <!-- 1. Basic Information -->
          <div style="border-top:2px solid #ef7f1a;border-left:18px solid #ef7f1a;padding:6px 8px;margin-bottom:8px;">
            <div style="font-weight:900;color:#ef7f1a;font-size:12px;margin-bottom:4px;text-transform:uppercase;">Basic Information</div>
            <table style="width:100%;border-collapse:collapse;font-size:10.5px;">
              <tr>
                <td style="padding:2px 4px;"><b>Date of Birth :</b> ${data.dob}</td>
                <td style="padding:2px 4px;" colspan="2"><b>Date of Entry into Govt. Service:</b> ${data.dateOfEntry}</td>
              </tr>
              <tr>
                <td style="padding:2px 4px;"><b>Mobile #:</b> ${data.mobileBasic}</td>
                <td style="padding:2px 4px;"><b>Marital Status:</b> ${data.maritalStatus}</td>
                <td style="padding:2px 4px;"><b>Blood Group:</b> ${data.bloodGroup}</td>
              </tr>
              <tr>
                <td style="padding:2px 4px;"><b>Mother Tongue:</b> ${data.motherTongue}</td>
                <td style="padding:2px 4px;"><b>Passport #:</b> ${data.passportNo}</td>
                <td style="padding:2px 4px;"><b>Union Council:</b> ${data.unionCouncil}</td>
              </tr>
              <tr>
                <td style="padding:2px 4px;"><b>Religion:</b> ${data.religion}</td>
                <td style="padding:2px 4px;"><b>Domicile:</b> ${data.domicileBasic}</td>
                <td style="padding:2px 4px;"><b>Initial recruitment in ESED:</b> ${data.initialRecruitment}</td>
              </tr>
              <tr>
                <td style="padding:2px 4px;" colspan="3"><b>Permanent Address:</b> ${data.permanentAddress}</td>
              </tr>
            </table>
          </div>

          <!-- 2. Education Qualification -->
          <div style="border-top:2px solid #6eb400;border-left:18px solid #6eb400;padding:6px 8px;margin-bottom:8px;">
            <div style="font-weight:900;color:#4d7c0f;font-size:12px;margin-bottom:4px;text-transform:uppercase;">Education Qualification</div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;margin-bottom:6px;" border="1">
              <thead style="background:#f1f5f9;font-weight:800;">
                <tr>
                  <th style="padding:3px;">College / University</th>
                  <th style="padding:3px;">Academic</th>
                  <th style="padding:3px;">Total Marks</th>
                  <th style="padding:3px;">Obtained Marks</th>
                  <th style="padding:3px;">%Age</th>
                  <th style="padding:3px;">Regular / Private</th>
                  <th style="padding:3px;">Session Year</th>
                </tr>
              </thead>
              <tbody>
                ${academicRows
                  .map(
                    (r) => `<tr>
                    <td style="padding:3px;font-weight:700;">${r.collegeUniversity}</td>
                    <td style="padding:3px;">${r.academic}</td>
                    <td style="padding:3px;">${r.totalMarks}</td>
                    <td style="padding:3px;">${r.obtainedMarks}</td>
                    <td style="padding:3px;">${r.percentage}</td>
                    <td style="padding:3px;">${r.regularPrivate}</td>
                    <td style="padding:3px;">${r.sessionYear}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
            <table style="width:100%;border-collapse:collapse;font-size:10px;text-align:center;" border="1">
              <thead style="background:#f1f5f9;font-weight:800;">
                <tr>
                  <th style="padding:3px;">University</th>
                  <th style="padding:3px;">Academic / Professional</th>
                  <th style="padding:3px;">Total Marks</th>
                  <th style="padding:3px;">Obtained Marks</th>
                  <th style="padding:3px;">%Age</th>
                  <th style="padding:3px;">Regular / Private</th>
                  <th style="padding:3px;">Session Year</th>
                </tr>
              </thead>
              <tbody>
                ${profRows
                  .map(
                    (r) => `<tr>
                    <td style="padding:3px;font-weight:700;">${r.collegeUniversity}</td>
                    <td style="padding:3px;">${r.academic}</td>
                    <td style="padding:3px;">${r.totalMarks}</td>
                    <td style="padding:3px;">${r.obtainedMarks}</td>
                    <td style="padding:3px;">${r.percentage}</td>
                    <td style="padding:3px;">${r.regularPrivate}</td>
                    <td style="padding:3px;">${r.sessionYear}</td>
                  </tr>`
                  )
                  .join('')}
              </tbody>
            </table>
          </div>

          <!-- 3. Posting / Transfer -->
          <div style="border-top:2px solid #e31e24;border-left:18px solid #e31e24;padding:6px 8px;margin-bottom:8px;">
            <div style="font-weight:900;color:#e31e24;font-size:12px;margin-bottom:4px;text-transform:uppercase;">Posting / Transfer</div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;" border="1">
              <tr><td style="padding:2.5px 5px;font-weight:800;width:28%;">Office / School</td><td style="padding:2.5px 5px;font-weight:700;">${post1.officeSchool}</td><td style="padding:2.5px 5px;font-weight:700;">${post2.officeSchool}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Designation</td><td style="padding:2.5px 5px;">${post1.designation}</td><td style="padding:2.5px 5px;">${post2.designation}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">From Date</td><td style="padding:2.5px 5px;">${post1.fromDate}</td><td style="padding:2.5px 5px;">${post2.fromDate}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">To Date</td><td style="padding:2.5px 5px;">${post1.toDate}</td><td style="padding:2.5px 5px;">${post2.toDate}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Status</td><td style="padding:2.5px 5px;">${post1.status}</td><td style="padding:2.5px 5px;">${post2.status}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Placement Type</td><td style="padding:2.5px 5px;">${post1.placementType}</td><td style="padding:2.5px 5px;">${post2.placementType}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Posting Type</td><td style="padding:2.5px 5px;">${post1.postingType}</td><td style="padding:2.5px 5px;">${post2.postingType}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Notification</td><td style="padding:2.5px 5px;">${post1.notification}</td><td style="padding:2.5px 5px;">${post2.notification}</td></tr>
            </table>
          </div>

          <!-- 4. BPS - Job Type -->
          <div style="border-top:2px solid #6c1d82;border-left:18px solid #6c1d82;padding:6px 8px;margin-bottom:8px;">
            <div style="font-weight:900;color:#6c1d82;font-size:12px;margin-bottom:4px;text-transform:uppercase;">BPS - Job Type</div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;" border="1">
              <tr><td style="padding:2.5px 5px;font-weight:800;">BPS :</td><td style="padding:2.5px 5px;">${bps1.bps}</td><td style="padding:2.5px 5px;font-weight:800;">Job Type :</td><td style="padding:2.5px 5px;">${bps2.jobType || 'Regular'}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">From Date :</td><td style="padding:2.5px 5px;">${bps1.fromDate}</td><td style="padding:2.5px 5px;font-weight:800;">From Date :</td><td style="padding:2.5px 5px;">${bps2.fromDate}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">To Date :</td><td style="padding:2.5px 5px;">${bps1.toDate}</td><td style="padding:2.5px 5px;font-weight:800;">To Date :</td><td style="padding:2.5px 5px;">${bps2.toDate}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Status :</td><td style="padding:2.5px 5px;">${bps1.status}</td><td style="padding:2.5px 5px;font-weight:800;">Status :</td><td style="padding:2.5px 5px;">${bps2.status}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Remarks :</td><td style="padding:2.5px 5px;">${bps1.remarks}</td><td style="padding:2.5px 5px;font-weight:800;">Remarks :</td><td style="padding:2.5px 5px;">${bps2.remarks}</td></tr>
              <tr><td style="padding:2.5px 5px;font-weight:800;">Notification :</td><td style="padding:2.5px 5px;">${bps1.notification}</td><td style="padding:2.5px 5px;font-weight:800;">Notification :</td><td style="padding:2.5px 5px;">${bps2.notification}</td></tr>
            </table>
          </div>

          <!-- 5. Cadre Group -->
          <div style="border-top:2px solid #1fa2e1;border-left:18px solid #1fa2e1;padding:6px 8px;margin-bottom:8px;">
            <div style="font-weight:900;color:#1fa2e1;font-size:12px;margin-bottom:4px;text-transform:uppercase;">Cadre Group</div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;">
              <tr><td style="padding:2px 4px;font-weight:800;width:30%;">Cadre Group :</td><td style="padding:2px 4px;">${data.cadreTeaching}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Designation :</td><td style="padding:2px 4px;">${data.cadreDesignation}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">BPS :</td><td style="padding:2px 4px;">${data.cadreBps}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">From Date :</td><td style="padding:2px 4px;">${data.cadreFromDate}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">To Date :</td><td style="padding:2px 4px;">${data.cadreToDate}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">States :</td><td style="padding:2px 4px;">${data.cadreStates}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Seniority Number :</td><td style="padding:2px 4px;">${data.cadreSeniorityNo}</td></tr>
            </table>
          </div>

          <!-- 6. Bank Detail -->
          <div style="border-top:2px solid #0d2f96;border-left:18px solid #0d2f96;padding:6px 8px;">
            <div style="font-weight:900;color:#0d2f96;font-size:12px;margin-bottom:4px;text-transform:uppercase;">Bank Detail</div>
            <table style="width:100%;border-collapse:collapse;font-size:10px;">
              <tr><td style="padding:2px 4px;font-weight:800;width:30%;">Account Title:</td><td style="padding:2px 4px;">${data.accountTitle}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Bank Name:</td><td style="padding:2px 4px;font-weight:800;">${data.bankName}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Bank Code:</td><td style="padding:2px 4px;">${data.bankCode}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Account No:</td><td style="padding:2px 4px;">${data.accountNo}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">IBAN #:</td><td style="padding:2px 4px;font-weight:700;">${data.iban}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Address:</td><td style="padding:2px 4px;">${data.bankAddress}</td></tr>
              <tr><td style="padding:2px 4px;font-weight:800;">Status:</td><td style="padding:2px 4px;font-weight:800;color:#15803d;">${data.bankStatus}</td></tr>
            </table>
          </div>
        </div>
      </div>
    `;
  };

  // High-res A4 Canvas renderer for JPG & PDF exports
  const renderHighResA4JpgDataUrl = async (): Promise<string | null> => {
    if (!a4DocumentRef.current) return null;
    try {
      // Clone the A4 DOM node into an off-screen unscaled container so it always renders at full 794x1123 A4 resolution
      const offscreenWrapper = document.createElement('div');
      offscreenWrapper.style.position = 'fixed';
      offscreenWrapper.style.left = '-9999px';
      offscreenWrapper.style.top = '0';
      offscreenWrapper.style.width = `${A4_WIDTH_PX}px`;
      offscreenWrapper.style.height = `${A4_HEIGHT_PX}px`;
      offscreenWrapper.style.zIndex = '-1';
      offscreenWrapper.style.background = '#ffffff';

      const clonedNode = a4DocumentRef.current.cloneNode(true) as HTMLElement;
      clonedNode.style.transform = 'none';
      clonedNode.style.width = `${A4_WIDTH_PX}px`;
      clonedNode.style.height = `${A4_HEIGHT_PX}px`;
      offscreenWrapper.appendChild(clonedNode);
      document.body.appendChild(offscreenWrapper);

      await new Promise((r) => setTimeout(r, 150));
      const canvas = await html2canvas(clonedNode, {
        scale: 2.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        height: A4_HEIGHT_PX,
      });

      document.body.removeChild(offscreenWrapper);
      return canvas.toDataURL('image/jpeg', 0.95);
    } catch (err) {
      console.error('Failed to render high-res A4 CV:', err);
      return null;
    }
  };

  const handleExportPdf = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const jpgDataUrl = await renderHighResA4JpgDataUrl();
      if (jpgDataUrl) {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
        });
        pdf.addImage(jpgDataUrl, 'JPEG', 0, 0, 210, 297, undefined, 'FAST');
        const pdfDataUrl = pdf.output('datauristring');
        const fileName = `CV_${cvData.fullName.replace(/\s+/g, '_')}_A4.pdf`;

        await StorageFolderService.saveDataUrlFile(
          'GPS Chambai/Staff',
          fileName,
          pdfDataUrl,
          'application/pdf',
          'Profile CV'
        );
        pdf.save(fileName);
        showToast('Full A4 Portrait PDF exported & saved in GPS Chambai/Staff!');
      } else {
        const html = buildFullA4CvHtml(cvData);
        exportAndSaveRealPdf(`CV_${cvData.fullName}_A4`, html, {
          orientation: 'portrait',
          folderSubPath: 'Staff_HR',
          moduleSource: 'Profile CV',
        });
        showToast('A4 Portrait PDF generated & saved!');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const html = buildFullA4CvHtml(cvData);
      exportAndSaveWordDoc(`CV_${cvData.fullName}_A4`, html, {
        orientation: 'portrait',
        includeHeader: false,
        folderSubPath: 'Staff Data/Staff Documents',
        moduleSource: 'Profile CV',
      });
      showToast('Editable A4 Word (.doc) CV exported & saved in GPS Chambai/Staff Data!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJpg = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const jpgDataUrl = await renderHighResA4JpgDataUrl();
      if (!jpgDataUrl) {
        showToast('Unable to generate JPG image. Please try again.');
        return;
      }
      const fileName = `CV_${cvData.fullName.replace(/\s+/g, '_')}_A4.jpg`;
      await StorageFolderService.saveDataUrlFile(
        'GPS Chambai/Staff Data/Staff Photos',
        fileName,
        jpgDataUrl,
        'image/jpeg',
        'Profile CV'
      );
      const a = document.createElement('a');
      a.href = jpgDataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      showToast('High-Resolution A4 Portrait JPG exported & saved!');
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintA4 = () => {
    setShowExportMenu(false);
    const html = buildFullA4CvHtml(cvData);
    printHtmlDocument(
      `Official CV - ${cvData.fullName}`,
      html,
      'portrait',
      false,
      'GPS Chambai/Staff Data/PDF Records'
    );
  };

  const handleShareLatestExport = async () => {
    setShowExportMenu(false);
    const jpgDataUrl = await renderHighResA4JpgDataUrl();
    const fileName = `CV_${cvData.fullName.replace(/\s+/g, '_')}_A4.jpg`;
    await shareDocumentOrFile({
      title: `Official CV - ${cvData.fullName}`,
      text: `Official Service Record & CV — ${cvData.fullName} (${cvData.designation}), GPS Chambai Kohat`,
      dataUrl: jpgDataUrl || undefined,
      fileName,
      mimeType: 'image/jpeg',
    });
  };

  const activeCv = isEditing ? draftCv : cvData;
  const academicRows = activeCv.educationQualifications.slice(0, 3);
  const profRows = activeCv.educationQualifications.slice(3);
  const post1 = activeCv.postingTransfers[0] || DEFAULT_HIRS_CV.postingTransfers[0];
  const post2 = activeCv.postingTransfers[1] || DEFAULT_HIRS_CV.postingTransfers[1];
  const bps1 = activeCv.bpsJobTypes[0] || DEFAULT_HIRS_CV.bpsJobTypes[0];
  const bps2 = activeCv.bpsJobTypes[1] || DEFAULT_HIRS_CV.bpsJobTypes[1];

  // Vertical Ribbon Helper matching Reference Image 029
  const VerticalRibbon: React.FC<{
    color: string;
    label: string;
    heightPx?: number;
  }> = ({ color, label, heightPx }) => (
    <div
      style={{
        backgroundColor: color,
        width: '24px',
        minHeight: heightPx ? `${heightPx}px` : '100%',
        borderTopLeftRadius: '10px',
        borderBottomLeftRadius: '10px',
      }}
      className="shrink-0 flex items-center justify-center relative select-none shadow-2xs"
    >
      <span
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
        className="text-white font-black text-[10.5px] tracking-wider whitespace-nowrap py-2 leading-none"
      >
        {label}
      </span>
    </div>
  );

  return (
    <div className="space-y-3" ref={wrapperRef}>
      {/* Hidden Fallback File Input for Portrait */}
      <input
        ref={portraitInputRef}
        type="file"
        accept="image/*"
        onChange={handleFallbackFileInput}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="bg-emerald-900 text-white px-4 py-2.5 rounded-2xl shadow-lg flex items-center justify-between text-xs font-bold border border-emerald-500 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} className="text-amber-400 shrink-0" />
            <span>{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="text-white/70 hover:text-white">
            <X size={14} />
          </button>
        </div>
      )}

      {/* A4 Page Preview Header Bar with Zoom Controls */}
      <div className="bg-slate-900 text-white rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 border border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <div>
            <div className="text-xs font-black tracking-wide uppercase">
              Official CV — A4 Portrait Document Preview (210mm × 297mm)
            </div>
            <div className="text-[10px] text-slate-400 font-semibold">
              Aspect Ratio 1 : 1.414 • Auto-Scaled for Mobile Screen ({Math.round(effectiveScale * 100)}%)
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
          <button
            type="button"
            onClick={() => setZoomMultiplier((z) => Math.max(0.75, Number((z - 0.15).toFixed(2))))}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <button
            type="button"
            onClick={() => setZoomMultiplier(1)}
            className="px-2 py-1 rounded-lg hover:bg-slate-700 text-[10px] font-black text-emerald-400"
            title="Fit A4 to Screen"
          >
            FIT A4
          </button>
          <button
            type="button"
            onClick={() => setZoomMultiplier((z) => Math.min(1.8, Number((z + 0.15).toFixed(2))))}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-200 transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={handlePrintA4}
            className="p-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white ml-1"
            title="Print / Full A4 View"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* RESPONSIVE A4 PAGE CONTAINER (210mm x 297mm = 794px x 1123px) */}
      <div className="bg-slate-200/90 rounded-3xl p-2 sm:p-4 border border-slate-300 shadow-inner overflow-x-auto flex justify-center">
        <div
          style={{
            width: `${Math.round(A4_WIDTH_PX * effectiveScale)}px`,
            height: `${Math.round(A4_HEIGHT_PX * effectiveScale)}px`,
            position: 'relative',
          }}
          className="transition-all duration-150 shrink-0"
        >
          {/* THE EXACT REFERENCE 029 A4 DOCUMENT */}
          <div
            ref={a4DocumentRef}
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              transform: `scale(${effectiveScale})`,
              transformOrigin: 'top left',
              fontFamily: 'Arial, Helvetica, sans-serif',
            }}
            className="bg-white shadow-2xl border border-slate-300 flex flex-row overflow-hidden select-text"
          >
            {/* ================= LEFT COLUMN (#051d2d Dark Navy, 37.5% width) ================= */}
            <div
              style={{ width: '37.5%', backgroundColor: '#051d2d' }}
              className="h-full text-white px-5 py-5 flex flex-col justify-between shrink-0"
            >
              {/* Top Portrait & Greeting */}
              <div>
                <div className="flex flex-col items-center text-center">
                  {/* Circular Portrait with Green Ring & Checkmark Badge */}
                  <div className="relative w-[162px] h-[162px] mb-2.5">
                    <div
                      style={{
                        borderColor: '#66c61c',
                        backgroundColor: '#051d2d',
                      }}
                      className="w-full h-full rounded-full border-[5px] p-[5px] shadow-lg overflow-hidden"
                    >
                      <img
                        src={activeCv.portraitUrl || '/assets/aistudio/Microsoft_Profile_78e13ce1.png'}
                        alt={activeCv.fullName}
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover rounded-full bg-white"
                      />
                    </div>
                    {/* Green Verified Checkmark Badge on Bottom Right of Ring */}
                    <button
                      type="button"
                      onClick={() => void handlePortraitPick()}
                      style={{ backgroundColor: '#66c61c', borderColor: '#051d2d' }}
                      className="absolute bottom-2 right-1 w-7 h-7 rounded-full border-[3px] flex items-center justify-center text-[#051d2d] shadow-md hover:scale-105 transition-transform"
                      title="Tap to change profile photo"
                    >
                      <Check size={15} strokeWidth={3.5} />
                    </button>
                  </div>

                  {/* "Hello , I am.." in cursive/italic script */}
                  <div
                    style={{ fontFamily: "'Brush Script MT', 'Georgia', cursive, serif" }}
                    className="text-[19px] italic text-slate-200 tracking-wide leading-tight mt-0.5"
                  >
                    {activeCv.calligraphyTitle || 'Hello , I am..'}
                  </div>

                  {/* Full Name */}
                  <h1 className="text-[22px] font-black tracking-wide uppercase text-white leading-tight mt-1">
                    {activeCv.fullName}
                  </h1>

                  {/* Designation in Lime Green */}
                  <div
                    style={{ color: '#66c61c' }}
                    className="text-[17px] font-black tracking-wide uppercase leading-tight mt-1"
                  >
                    {activeCv.designation}
                  </div>
                </div>

                {/* PROFILE SECTION */}
                <div className="mt-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white text-[#051d2d] flex items-center justify-center shrink-0 shadow-xs">
                      <User size={18} strokeWidth={2.5} />
                    </div>
                    <span className="text-[16px] font-black tracking-wider uppercase text-white">
                      PROFILE
                    </span>
                  </div>
                  <div className="h-[2.5px] bg-white w-full mt-1.5 mb-3 rounded-full" />

                  <div className="space-y-[7px] text-[12.5px] leading-snug">
                    {[
                      { label: 'Father Name.', val: activeCv.fatherName },
                      { label: 'CNIC No.', val: activeCv.cnic },
                      { label: 'Personal No.', val: activeCv.personalNo },
                      { label: 'Gender.', val: activeCv.gender },
                      { label: 'Domicile.', val: activeCv.domicile },
                      { label: 'Station.', val: activeCv.station },
                      { label: 'Designation.', val: activeCv.designationLong },
                      { label: 'Last Post.', val: activeCv.lastPostDate },
                      { label: 'Covid 19 Vaccination.', val: activeCv.covidVaccination },
                    ].map((item) => (
                      <div key={item.label} className="flex items-baseline justify-between gap-2">
                        <span className="text-slate-300 font-medium shrink-0">{item.label}</span>
                        <span className="font-black text-white text-left flex-1 pl-2">
                          {item.val}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CONTACT SECTION */}
                <div className="mt-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-white text-[#051d2d] flex items-center justify-center shrink-0 shadow-xs">
                      <Phone size={17} strokeWidth={2.5} />
                    </div>
                    <span className="text-[16px] font-black tracking-wider uppercase text-white">
                      CONTACT
                    </span>
                  </div>
                  <div className="h-[2.5px] bg-white w-full mt-1.5 mb-3 rounded-full" />

                  <div className="space-y-2.5 text-[13px] font-black">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                        <Phone size={13} className="text-white" />
                      </div>
                      <span className="tracking-wide text-[14px]">{activeCv.mobile1}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <img
                          src="/assets/aistudio/whatsapp_236996ca.png"
                          alt="WA"
                          className="w-4 h-4 object-contain"
                        />
                      </div>
                      <span className="tracking-wide text-[14px]">{activeCv.mobile2}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                        <Mail size={13} className="text-white" />
                      </div>
                      <span className="tracking-tight text-[13px] break-all">{activeCv.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOCIAL MEDIA SECTION */}
              <div className="pt-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-white text-[#051d2d] flex items-center justify-center shrink-0 shadow-xs">
                    <Globe size={18} strokeWidth={2.5} />
                  </div>
                  <span className="text-[16px] font-black tracking-wider uppercase text-white">
                    SOCIAL MEDIA
                  </span>
                </div>
                <div className="h-[2.5px] bg-white w-full mt-1.5 mb-3 rounded-full" />

                {/* 2 rows of 4 social icons matching Reference 029 */}
                <div className="grid grid-cols-4 gap-2.5 px-2 mb-2.5">
                  {/* Row 1: YouTube, Facebook, Instagram, LinkedIn */}
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto shadow-xs">
                    <img
                      src="/assets/aistudio/yputube_d9e9a0fb.png"
                      alt="YouTube"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto shadow-xs">
                    <img
                      src="/assets/aistudio/facebook_b4556ed7.png"
                      alt="Facebook"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto shadow-xs">
                    <img
                      src="/assets/aistudio/instagram_be056fee.png"
                      alt="Instagram"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto shadow-xs">
                    <img
                      src="/assets/aistudio/linkdin_91d33015.png"
                      alt="LinkedIn"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Row 2: TikTok, Snapchat, WhatsApp, Pinterest */}
                  <div
                    style={{ backgroundColor: '#000000' }}
                    className="w-8 h-8 rounded-lg border border-white/30 flex items-center justify-center mx-auto text-[11px] font-black text-white shadow-xs"
                  >
                    ♪
                  </div>
                  <div
                    style={{ backgroundColor: '#FFFC00' }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-[11px] font-black text-slate-950 shadow-xs"
                  >
                    SC
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-white p-1 flex items-center justify-center mx-auto shadow-xs">
                    <img
                      src="/assets/aistudio/whatsapp_236996ca.png"
                      alt="WhatsApp"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div
                    style={{ backgroundColor: '#E60023' }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center mx-auto text-[13px] font-black text-white italic shadow-xs"
                  >
                    P
                  </div>
                </div>

                <div className="text-center text-[15px] font-bold tracking-wider text-white">
                  {activeCv.socialHandle}
                </div>
              </div>
            </div>

            {/* ================= RIGHT COLUMN (White, 62.5% width, 6 Ribbon Sections) ================= */}
            <div
              style={{ width: '62.5%' }}
              className="h-full bg-white pl-2.5 pr-3.5 py-3 flex flex-col justify-between text-slate-900"
            >
              {/* 1. BASIC INFORMATION (Orange #ef7f1a) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#ef7f1a" label="Basic Information" heightPx={148} />
                <div
                  style={{ borderColor: '#ef7f1a' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2.5 py-1.5 flex flex-col justify-between text-[10.8px]"
                >
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <div>
                      <span className="font-bold text-slate-600">Date of Birth : </span>
                      <span className="font-black text-slate-900">{activeCv.dob}</span>
                    </div>
                    <div>
                      <span className="font-bold text-slate-600">
                        Date of Entry into Govt. Service:{' '}
                      </span>
                      <span className="font-black text-slate-900">{activeCv.dateOfEntry}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 border-b border-slate-200 py-1">
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Mobile #:</div>
                      <div className="font-black text-slate-900">{activeCv.mobileBasic}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Marital Status:</div>
                      <div className="font-black text-slate-900">{activeCv.maritalStatus}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Blood Group:</div>
                      <div className="font-black text-slate-900">{activeCv.bloodGroup}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 border-b border-slate-200 py-1">
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Mother Tongue:</div>
                      <div className="font-black text-slate-900">{activeCv.motherTongue}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Passport #:</div>
                      <div className="font-black text-slate-900">{activeCv.passportNo}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Union Council:</div>
                      <div className="font-black text-slate-900">{activeCv.unionCouncil}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 border-b border-slate-200 py-1">
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Religion:</div>
                      <div className="font-black text-slate-900">{activeCv.religion}</div>
                    </div>
                    <div>
                      <div className="text-[9.5px] font-bold text-slate-500">Domicile:</div>
                      <div className="font-black text-slate-900">{activeCv.domicileBasic}</div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-500">
                        Initial recruitment in ESED:
                      </div>
                      <div className="font-black text-slate-900">{activeCv.initialRecruitment}</div>
                    </div>
                  </div>

                  <div className="pt-0.5 flex items-center gap-2">
                    <span className="font-bold text-slate-600">Permanent Address:</span>
                    <span className="font-black text-slate-900">{activeCv.permanentAddress}</span>
                  </div>
                </div>
              </div>

              {/* 2. EDUCATION QUALIFICATION (Lime Green #6eb400) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#6eb400" label="Education Qualification" heightPx={195} />
                <div
                  style={{ borderColor: '#6eb400' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2 py-1.5 flex flex-col justify-between"
                >
                  {/* Academic Table */}
                  <table className="w-full text-[9.8px] text-center border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600 font-bold">
                        <th className="py-0.5 text-left pl-1">College / University</th>
                        <th className="py-0.5">Academic</th>
                        <th className="py-0.5">Total Marks</th>
                        <th className="py-0.5">Obtained Marks</th>
                        <th className="py-0.5">%Age</th>
                        <th className="py-0.5">Regular / Private</th>
                        <th className="py-0.5">Session Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-extrabold text-slate-900">
                      {academicRows.map((row) => (
                        <tr key={row.id}>
                          <td className="py-1 text-left pl-1 font-black">{row.collegeUniversity}</td>
                          <td className="py-1">{row.academic}</td>
                          <td className="py-1">{row.totalMarks}</td>
                          <td className="py-1">{row.obtainedMarks}</td>
                          <td className="py-1">{row.percentage}</td>
                          <td className="py-1">{row.regularPrivate}</td>
                          <td className="py-1">{row.sessionYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="h-[1.5px] bg-[#6eb400]/60 my-1" />

                  {/* Professional / AIOU Table */}
                  <table className="w-full text-[9.8px] text-center border-collapse">
                    <thead>
                      <tr className="border-b border-slate-300 text-slate-600 font-bold">
                        <th className="py-0.5 text-left pl-1">University</th>
                        <th className="py-0.5">Academic / Professional</th>
                        <th className="py-0.5">Total Marks</th>
                        <th className="py-0.5">Obtained Marks</th>
                        <th className="py-0.5">%Age</th>
                        <th className="py-0.5">Regular / Private</th>
                        <th className="py-0.5">Session Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-extrabold text-slate-900">
                      {profRows.map((row, idx) => (
                        <tr key={row.id}>
                          <td className="py-1 text-left pl-1 font-black">
                            {idx === 0 ? row.collegeUniversity : ''}
                          </td>
                          <td className="py-1">{row.academic}</td>
                          <td className="py-1">{row.totalMarks}</td>
                          <td className="py-1">{row.obtainedMarks}</td>
                          <td className="py-1">{row.percentage}</td>
                          <td className="py-1">{row.regularPrivate}</td>
                          <td className="py-1">{row.sessionYear}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3. POSTING / TRANSFER (Red #e31e24) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#e31e24" label="Posting / Transfer" heightPx={164} />
                <div
                  style={{ borderColor: '#e31e24' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2.5 py-1.5"
                >
                  <table className="w-full text-[10px] border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { label: 'Office / School', v1: post1.officeSchool, v2: post2.officeSchool },
                        { label: 'Designation', v1: post1.designation, v2: post2.designation },
                        { label: 'From Date', v1: post1.fromDate, v2: post2.fromDate },
                        { label: 'To Date', v1: post1.toDate, v2: post2.toDate },
                        { label: 'Status', v1: post1.status, v2: post2.status },
                        { label: 'Placement Type', v1: post1.placementType, v2: post2.placementType },
                        { label: 'Posting Type', v1: post1.postingType, v2: post2.postingType },
                        { label: 'Notification', v1: post1.notification, v2: post2.notification },
                      ].map((r) => (
                        <tr key={r.label}>
                          <td className="py-[2.2px] font-bold text-slate-600 w-[28%]">{r.label}</td>
                          <td className="py-[2.2px] font-black text-slate-900 w-[36%] border-l border-slate-200 pl-2">
                            {r.v1}
                          </td>
                          <td className="py-[2.2px] font-black text-slate-900 w-[36%] border-l border-slate-200 pl-2">
                            {r.v2}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 4. BPS - JOB TYPE (Purple #6c1d82) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#6c1d82" label="BPS - Job Type" heightPx={132} />
                <div
                  style={{ borderColor: '#6c1d82' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2.5 py-1.5"
                >
                  <table className="w-full text-[10px] border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600 w-[18%]">BPS :</td>
                        <td className="py-[2.5px] font-black text-slate-900 w-[30%]">{bps1.bps}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 w-[20%] border-l border-slate-200 pl-2">
                          Job Type :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900 w-[32%]">
                          {bps2.jobType || 'Regular'}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600">From Date :</td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps1.fromDate}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 border-l border-slate-200 pl-2">
                          From Date :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps2.fromDate}</td>
                      </tr>
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600">To Date :</td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps1.toDate}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 border-l border-slate-200 pl-2">
                          To Date :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps2.toDate}</td>
                      </tr>
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600">Status :</td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps1.status}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 border-l border-slate-200 pl-2">
                          Status :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps2.status}</td>
                      </tr>
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600">Remarks :</td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps1.remarks}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 border-l border-slate-200 pl-2">
                          Remarks :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps2.remarks}</td>
                      </tr>
                      <tr>
                        <td className="py-[2.5px] font-bold text-slate-600">Notification :</td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps1.notification}</td>
                        <td className="py-[2.5px] font-bold text-slate-600 border-l border-slate-200 pl-2">
                          Notification :
                        </td>
                        <td className="py-[2.5px] font-black text-slate-900">{bps2.notification}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. CADRE GROUP (Sky Blue #1fa2e1) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#1fa2e1" label="Cadre Group" heightPx={142} />
                <div
                  style={{ borderColor: '#1fa2e1' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2.5 py-1.5 flex items-center justify-between"
                >
                  <table className="w-[66%] text-[10px] border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { k: 'Cadre Group :', v: activeCv.cadreTeaching },
                        { k: 'Designation :', v: activeCv.cadreDesignation },
                        { k: 'BPS :', v: activeCv.cadreBps },
                        { k: 'From Date :', v: activeCv.cadreFromDate },
                        { k: 'To Date :', v: activeCv.cadreToDate },
                        { k: 'States :', v: activeCv.cadreStates },
                        { k: 'Seniority Number :', v: activeCv.cadreSeniorityNo },
                      ].map((row) => (
                        <tr key={row.k}>
                          <td className="py-[2px] font-bold text-slate-600 w-[45%]">{row.k}</td>
                          <td className="py-[2px] font-black text-slate-900">{row.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Teacher at Board Graphic (matching Reference 029) */}
                  <div className="w-[32%] flex items-center justify-center">
                    <svg viewBox="0 0 120 90" className="w-28 h-20">
                      <rect
                        x="38"
                        y="10"
                        width="72"
                        height="48"
                        rx="4"
                        fill="none"
                        stroke="#1fa2e1"
                        strokeWidth="4"
                      />
                      <line x1="48" y1="24" x2="96" y2="24" stroke="#1fa2e1" strokeWidth="3" />
                      <line x1="48" y1="35" x2="86" y2="35" stroke="#1fa2e1" strokeWidth="3" />
                      <circle cx="26" cy="30" r="11" fill="#1fa2e1" />
                      <path
                        d="M10 78 C10 56, 42 56, 42 78 Z"
                        fill="#1fa2e1"
                      />
                      <line
                        x1="36"
                        y1="52"
                        x2="62"
                        y2="34"
                        stroke="#1fa2e1"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 6. BANK DETAIL (Royal Blue #0d2f96) */}
              <div className="flex items-stretch">
                <VerticalRibbon color="#0d2f96" label="Bank Detail" heightPx={142} />
                <div
                  style={{ borderColor: '#0d2f96' }}
                  className="flex-1 border-t-[2.5px] border-b border-r rounded-r-lg px-2.5 py-1.5 flex items-center justify-between"
                >
                  <table className="w-[72%] text-[10px] border-collapse">
                    <tbody className="divide-y divide-slate-200">
                      {[
                        { k: 'Account Title:', v: activeCv.accountTitle },
                        { k: 'Bank Name:', v: activeCv.bankName },
                        { k: 'Bank Code:', v: activeCv.bankCode },
                        { k: 'Account No:', v: activeCv.accountNo },
                        { k: 'IBAN #:', v: activeCv.iban },
                        { k: 'Address:', v: activeCv.bankAddress },
                        { k: 'Status:', v: activeCv.bankStatus },
                      ].map((row) => (
                        <tr key={row.k}>
                          <td className="py-[2px] font-bold text-slate-600 w-[34%]">{row.k}</td>
                          <td className="py-[2px] font-black text-slate-900">{row.v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Meezan Bank Emblem */}
                  <div className="w-[26%] flex flex-col items-center justify-center text-center">
                    <div
                      style={{ borderColor: '#6c1d82' }}
                      className="w-16 h-16 rounded-full border-2 flex flex-col items-center justify-center bg-purple-50/50 shadow-2xs"
                    >
                      <span
                        style={{ color: '#6c1d82' }}
                        className="text-[11px] font-black leading-none"
                      >
                        MEEZAN
                      </span>
                      <span
                        style={{ color: '#b45309' }}
                        className="text-[9px] font-extrabold mt-0.5"
                      >
                        مِیزان بینک
                      </span>
                    </div>
                    <span className="text-[8.5px] font-black text-slate-600 mt-1">
                      The Premier Islamic Bank
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= PART 1.3 — CV BOTTOM ACTION BUTTONS (EDIT, SAVE, EXPORT) ================= */}
      <div className="bg-white rounded-3xl p-3.5 border-2 border-slate-200 shadow-md">
        <div className="grid grid-cols-3 gap-2.5">
          {/* 1. EDIT BUTTON */}
          <button
            type="button"
            onClick={handleOpenEdit}
            className="py-3 px-3 rounded-2xl bg-slate-900 hover:bg-slate-800 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Edit3 size={16} className="text-amber-400 shrink-0" />
            <span>EDIT</span>
          </button>

          {/* 2. SAVE BUTTON */}
          <button
            type="button"
            onClick={handleDirectSaveButton}
            className="py-3 px-3 rounded-2xl bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Save size={16} className="text-emerald-200 shrink-0" />
            <span>SAVE</span>
          </button>

          {/* 3. EXPORT BUTTON */}
          <div className="relative">
            <button
              type="button"
              disabled={isExporting}
              onClick={() => setShowExportMenu((prev) => !prev)}
              className="w-full py-3 px-3 rounded-2xl bg-blue-700 hover:bg-blue-600 active:scale-98 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-60"
            >
              <Download size={16} className="text-amber-300 shrink-0" />
              <span>{isExporting ? 'EXPORTING...' : 'EXPORT'}</span>
            </button>

            {showExportMenu && (
              <div className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-slate-200 p-2 z-40 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                  Export Full A4 Portrait CV
                </div>
                <button
                  type="button"
                  onClick={() => void handleExportPdf()}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-rose-50 text-left flex items-center gap-2.5 text-xs font-black text-slate-800"
                >
                  <FileText size={16} className="text-rose-600 shrink-0" />
                  <div>
                    <div>PDF Document (.pdf)</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      Full A4 Portrait (210mm × 297mm)
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportDocx()}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-blue-50 text-left flex items-center gap-2.5 text-xs font-black text-slate-800"
                >
                  <FileSpreadsheet size={16} className="text-blue-600 shrink-0" />
                  <div>
                    <div>DOC / DOCX Word (.doc)</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      Editable A4 Portrait Document
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => void handleExportJpg()}
                  className="w-full px-3 py-2.5 rounded-xl hover:bg-amber-50 text-left flex items-center gap-2.5 text-xs font-black text-slate-800"
                >
                  <ImageIcon size={16} className="text-amber-600 shrink-0" />
                  <div>
                    <div>JPG High-Res Image (.jpg)</div>
                    <div className="text-[10px] font-semibold text-slate-500">
                      Full A4 Portrait Print Resolution
                    </div>
                  </div>
                </button>
                <div className="border-t border-slate-100 pt-1 flex gap-1">
                  <button
                    type="button"
                    onClick={handlePrintA4}
                    className="flex-1 py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-[11px] font-black text-slate-800 flex items-center justify-center gap-1"
                  >
                    <Printer size={13} />
                    <span>Print A4</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleShareLatestExport()}
                    className="flex-1 py-2 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[11px] font-black text-emerald-800 flex items-center justify-center gap-1"
                  >
                    <Share2 size={13} />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= FULL CV EDITING INTERFACE MODAL ================= */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border-2 border-emerald-700 overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                  Official A4 Profile CV Editor
                </span>
                <h3 className="text-base font-black">
                  Edit All CV Information, Tables &amp; Profile Photograph
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveEditModal}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-black flex items-center gap-1"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-6 text-xs">
              {/* 1. Profile Photo & Top Identity */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black uppercase tracking-wider text-emerald-800">
                  1. Profile Photograph &amp; Header Identity
                </h4>
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={draftCv.portraitUrl}
                    alt="Portrait"
                    className="w-20 h-20 rounded-full object-cover border-4 border-emerald-600 bg-white shadow-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void handlePortraitPick()}
                      className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-black flex items-center gap-1.5"
                    >
                      <Upload size={14} />
                      <span>Upload Photo from Gallery</span>
                    </button>
                    {onOpenStoragePicker && (
                      <button
                        type="button"
                        onClick={() =>
                          onOpenStoragePicker((dataUrl) =>
                            setDraftCv((prev) => ({ ...prev, portraitUrl: dataUrl }))
                          )
                        }
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-black flex items-center gap-1.5"
                      >
                        <FolderOpen size={14} />
                        <span>Pick from GPS Chambai Storage</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Greeting Line
                    </label>
                    <input
                      type="text"
                      value={draftCv.calligraphyTitle}
                      onChange={(e) =>
                        setDraftCv({ ...draftCv, calligraphyTitle: e.target.value })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={draftCv.fullName}
                      onChange={(e) => setDraftCv({ ...draftCv, fullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1">
                      Top Designation Subtitle
                    </label>
                    <input
                      type="text"
                      value={draftCv.designation}
                      onChange={(e) => setDraftCv({ ...draftCv, designation: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-black bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Left Column: PROFILE, CONTACT & SOCIAL MEDIA */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black uppercase tracking-wider text-emerald-800">
                  2. Left Column — Profile, Contact &amp; Social Media
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'fatherName', label: 'Father Name' },
                    { key: 'cnic', label: 'CNIC No.' },
                    { key: 'personalNo', label: 'Personal No.' },
                    { key: 'gender', label: 'Gender' },
                    { key: 'domicile', label: 'Domicile' },
                    { key: 'station', label: 'Station' },
                    { key: 'designationLong', label: 'Designation' },
                    { key: 'lastPostDate', label: 'Last Post Date' },
                    { key: 'covidVaccination', label: 'Covid 19 Vaccination' },
                    { key: 'mobile1', label: 'Contact Phone' },
                    { key: 'mobile2', label: 'WhatsApp Number' },
                    { key: 'email', label: 'Email Address' },
                    { key: 'socialHandle', label: 'Social Media Handle' },
                  ].map((f) => (
                    <div key={f.key}>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        {f.label}
                      </label>
                      <input
                        type="text"
                        value={(draftCv as any)[f.key] || ''}
                        onChange={(e) =>
                          setDraftCv({ ...draftCv, [f.key]: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. Right Column: Basic Information */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <h4 className="font-black uppercase tracking-wider text-amber-700">
                  3. Basic Information Section
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: 'dob', label: 'Date of Birth' },
                    { key: 'dateOfEntry', label: 'Date of Entry into Govt. Service' },
                    { key: 'mobileBasic', label: 'Mobile #' },
                    { key: 'maritalStatus', label: 'Marital Status' },
                    { key: 'bloodGroup', label: 'Blood Group' },
                    { key: 'motherTongue', label: 'Mother Tongue' },
                    { key: 'passportNo', label: 'Passport #' },
                    { key: 'unionCouncil', label: 'Union Council' },
                    { key: 'religion', label: 'Religion' },
                    { key: 'domicileBasic', label: 'Domicile' },
                    { key: 'initialRecruitment', label: 'Initial Recruitment in ESED' },
                    { key: 'permanentAddress', label: 'Permanent Address' },
                  ].map((f) => (
                    <div key={f.key} className={f.key === 'permanentAddress' ? 'sm:col-span-3' : ''}>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">
                        {f.label}
                      </label>
                      <input
                        type="text"
                        value={(draftCv as any)[f.key] || ''}
                        onChange={(e) =>
                          setDraftCv({ ...draftCv, [f.key]: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Education Qualification Rows */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-black uppercase tracking-wider text-lime-700">
                    4. Education &amp; Professional Qualifications
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const nextRow: HirsCvEducationRow = {
                        id: `edu-${Date.now()}`,
                        collegeUniversity: 'BISE KOHAT',
                        academic: 'Degree',
                        totalMarks: 1000,
                        obtainedMarks: 700,
                        percentage: '70.00%',
                        regularPrivate: 'REGULAR',
                        sessionYear: '2024',
                      };
                      setDraftCv({
                        ...draftCv,
                        educationQualifications: [...draftCv.educationQualifications, nextRow],
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-lime-600 text-white text-[11px] font-black flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add Row</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {draftCv.educationQualifications.map((row, idx) => (
                    <div
                      key={row.id}
                      className="grid grid-cols-2 sm:grid-cols-8 gap-2 bg-white p-2.5 rounded-xl border border-slate-200 items-center"
                    >
                      <input
                        type="text"
                        placeholder="Board / Univ"
                        value={row.collegeUniversity}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = { ...row, collegeUniversity: e.target.value };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold sm:col-span-2"
                      />
                      <input
                        type="text"
                        placeholder="Qualification"
                        value={row.academic}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = { ...row, academic: e.target.value };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                      />
                      <input
                        type="number"
                        placeholder="Total"
                        value={row.totalMarks}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = { ...row, totalMarks: Number(e.target.value) };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                      />
                      <input
                        type="number"
                        placeholder="Obtained"
                        value={row.obtainedMarks}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = { ...row, obtainedMarks: Number(e.target.value) };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                      />
                      <input
                        type="text"
                        placeholder="%Age"
                        value={row.percentage}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = { ...row, percentage: e.target.value };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                      />
                      <select
                        value={row.regularPrivate}
                        onChange={(e) => {
                          const list = [...draftCv.educationQualifications];
                          list[idx] = {
                            ...row,
                            regularPrivate: e.target.value as 'REGULAR' | 'PRIVATE',
                          };
                          setDraftCv({ ...draftCv, educationQualifications: list });
                        }}
                        className="px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                      >
                        <option value="REGULAR">REGULAR</option>
                        <option value="PRIVATE">PRIVATE</option>
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          placeholder="Year"
                          value={row.sessionYear}
                          onChange={(e) => {
                            const list = [...draftCv.educationQualifications];
                            list[idx] = { ...row, sessionYear: e.target.value };
                            setDraftCv({ ...draftCv, educationQualifications: list });
                          }}
                          className="w-full px-2 py-1.5 rounded-lg border border-slate-300 font-bold"
                        />
                        {draftCv.educationQualifications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const list = draftCv.educationQualifications.filter(
                                (_, i) => i !== idx
                              );
                              setDraftCv({ ...draftCv, educationQualifications: list });
                            }}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. Posting / Transfer & BPS Job Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="font-black uppercase tracking-wider text-rose-700">
                    5. Posting / Transfer (2 Columns)
                  </h4>
                  {draftCv.postingTransfers.slice(0, 2).map((p, idx) => (
                    <div
                      key={p.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                    >
                      <div className="text-[10px] font-black text-rose-600">
                        Posting Record #{idx + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ['officeSchool', 'Office / School'],
                            ['designation', 'Designation'],
                            ['fromDate', 'From Date'],
                            ['toDate', 'To Date'],
                            ['status', 'Status'],
                            ['placementType', 'Placement Type'],
                            ['postingType', 'Posting Type'],
                            ['notification', 'Notification'],
                          ] as const
                        ).map(([k, lbl]) => (
                          <div key={k}>
                            <label className="block text-[9px] font-bold text-slate-400">
                              {lbl}
                            </label>
                            <input
                              type="text"
                              value={p[k]}
                              onChange={(e) => {
                                const list = [...draftCv.postingTransfers];
                                list[idx] = { ...p, [k]: e.target.value };
                                setDraftCv({ ...draftCv, postingTransfers: list });
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5">
                  <h4 className="font-black uppercase tracking-wider text-purple-800">
                    6. BPS - Job Type (2 Columns)
                  </h4>
                  {draftCv.bpsJobTypes.slice(0, 2).map((b, idx) => (
                    <div
                      key={b.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 space-y-2"
                    >
                      <div className="text-[10px] font-black text-purple-700">
                        BPS / Job Record #{idx + 1}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {(
                          [
                            ['bps', 'BPS'],
                            ['jobType', 'Job Type'],
                            ['fromDate', 'From Date'],
                            ['toDate', 'To Date'],
                            ['status', 'Status'],
                            ['remarks', 'Remarks'],
                            ['notification', 'Notification'],
                          ] as const
                        ).map(([k, lbl]) => (
                          <div key={k}>
                            <label className="block text-[9px] font-bold text-slate-400">
                              {lbl}
                            </label>
                            <input
                              type="text"
                              value={b[k]}
                              onChange={(e) => {
                                const list = [...draftCv.bpsJobTypes];
                                list[idx] = { ...b, [k]: e.target.value };
                                setDraftCv({ ...draftCv, bpsJobTypes: list });
                              }}
                              className="w-full px-2 py-1 rounded-lg border border-slate-300 font-bold"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 6. Cadre Group & Bank Detail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-sky-700">
                    7. Cadre Group
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'cadreTeaching', label: 'Cadre Group' },
                      { key: 'cadreDesignation', label: 'Designation' },
                      { key: 'cadreBps', label: 'BPS' },
                      { key: 'cadreFromDate', label: 'From Date' },
                      { key: 'cadreToDate', label: 'To Date' },
                      { key: 'cadreStates', label: 'States' },
                      { key: 'cadreSeniorityNo', label: 'Seniority Number' },
                    ].map((f) => (
                      <div key={f.key}>
                        <label className="block text-[9px] font-bold text-slate-500">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          value={(draftCv as any)[f.key] || ''}
                          onChange={(e) =>
                            setDraftCv({ ...draftCv, [f.key]: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="font-black uppercase tracking-wider text-blue-900">
                    8. Bank Detail
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { key: 'accountTitle', label: 'Account Title' },
                      { key: 'bankName', label: 'Bank Name' },
                      { key: 'bankCode', label: 'Bank Code' },
                      { key: 'accountNo', label: 'Account No' },
                      { key: 'iban', label: 'IBAN #' },
                      { key: 'bankAddress', label: 'Address' },
                      { key: 'bankStatus', label: 'Status' },
                    ].map((f) => (
                      <div key={f.key} className={f.key === 'iban' ? 'col-span-2' : ''}>
                        <label className="block text-[9px] font-bold text-slate-500">
                          {f.label}
                        </label>
                        <input
                          type="text"
                          value={(draftCv as any)[f.key] || ''}
                          onChange={(e) =>
                            setDraftCv({ ...draftCv, [f.key]: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold bg-white"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-100 px-5 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEditModal}
                className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm"
              >
                <Save size={14} />
                <span>Save Changes to CV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
