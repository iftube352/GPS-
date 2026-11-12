import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import {
  Edit3,
  Save,
  Download,
  ExternalLink,
  Upload,
  Printer,
  Share2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Phone,
  Mail,
  MapPin,
  Building2,
  BookOpen,
  Award,
  Sparkles,
  Target,
  History,
  Check,
  Link2,
} from 'lucide-react';
import { SchoolAboutData } from '../../types';
import { StorageService } from '../../services/storage';
import {
  printHtmlDocument,
  saveFileToGpsChambaiFolder,
  shareDocumentOrFile,
} from '../../services/printAndFileService';

interface SchoolAboutSectionProps {
  aboutPdfUrl?: string;
  onUploadAboutPdf?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onShowToast?: (msg: string) => void;
}

export interface FourSocialLinkItem {
  id: 'facebook' | 'youtube' | 'whatsapp' | 'iemis';
  name: string;
  labelKey: 'facebookLabel' | 'youtubeLabel' | 'whatsappLabel' | 'iemisLabel';
  urlKey: 'facebookUrl' | 'youtubeUrl' | 'whatsappUrl' | 'iemisUrl';
  defaultLabel: string;
  defaultUrl: string;
  icon: string;
  color: string;
}

export const FOUR_REMAINING_LINKS: FourSocialLinkItem[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    labelKey: 'facebookLabel',
    urlKey: 'facebookUrl',
    defaultLabel: 'GPS Chambai Kohat Official Facebook',
    defaultUrl: 'https://www.facebook.com/gpschambaikohat/',
    icon: '/assets/aistudio/facebook_b4556ed7.png',
    color: '#1877F2',
  },
  {
    id: 'youtube',
    name: 'YouTube',
    labelKey: 'youtubeLabel',
    urlKey: 'youtubeUrl',
    defaultLabel: 'GPS Chambai Kohat YouTube Channel',
    defaultUrl: 'https://www.youtube.com/@GPSChambaiKohat',
    icon: '/assets/aistudio/yputube_d9e9a0fb.png',
    color: '#FF0000',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    labelKey: 'whatsappLabel',
    urlKey: 'whatsappUrl',
    defaultLabel: 'WhatsApp Contact (+92 336 9053352)',
    defaultUrl: 'https://wa.me/923369053352',
    icon: '/assets/aistudio/whatsapp_236996ca.png',
    color: '#16A34A',
  },
  {
    id: 'iemis',
    name: 'iEMIS',
    labelKey: 'iemisLabel',
    urlKey: 'iemisUrl',
    defaultLabel: 'iEMIS KP E&SE Department HRMIS Portal',
    defaultUrl:
      'https://iemis.kpese.gov.pk/ords/r/emis/human-resource-management-information-system-hrmis/login',
    icon: '/assets/aistudio/20260903_200547_79893d25.png',
    color: '#065F46',
  },
];

/**
 * Normalizes and validates a social media or website URL so it opens reliably on Android & Desktop.
 */
export function normalizeAndValidateSchoolUrl(
  rawUrl: string,
  linkId?: 'facebook' | 'youtube' | 'whatsapp' | 'iemis'
): { isValid: boolean; normalizedUrl: string; error?: string } {
  const trimmed = (rawUrl || '').trim();
  if (!trimmed) {
    return {
      isValid: false,
      normalizedUrl: '',
      error: 'URL is empty. Please enter a valid https:// address.',
    };
  }

  let candidate = trimmed;

  // Handle WhatsApp phone number or wa.me shorthand
  if (linkId === 'whatsapp' && /^\+?\d[\d\s-]{7,15}$/.test(candidate)) {
    let digits = candidate.replace(/\D/g, '');
    if (digits.startsWith('03')) {
      digits = '92' + digits.slice(1);
    }
    candidate = `https://wa.me/${digits}`;
  } else if (
    !/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate) &&
    !candidate.startsWith('mailto:') &&
    !candidate.startsWith('tel:')
  ) {
    candidate = `https://${candidate.replace(/^\/+/, '')}`;
  }

  // Convert desktop-only web.facebook.com to canonical www.facebook.com so Android opens native Facebook app
  candidate = candidate.replace(
    /^https?:\/\/web\.facebook\.com\b/i,
    'https://www.facebook.com'
  );

  try {
    const parsed = new URL(candidate);
    const allowedProtocols = ['https:', 'http:', 'whatsapp:', 'fb:', 'vnd.youtube:', 'intent:'];
    if (!allowedProtocols.includes(parsed.protocol)) {
      return {
        isValid: false,
        normalizedUrl: candidate,
        error: 'Unsupported URL protocol. Use https://',
      };
    }
    if (
      (parsed.protocol === 'https:' || parsed.protocol === 'http:') &&
      (!parsed.hostname || !parsed.hostname.includes('.'))
    ) {
      return {
        isValid: false,
        normalizedUrl: candidate,
        error: 'Please enter a complete domain name (e.g. https://www.facebook.com/...)',
      };
    }
    return { isValid: true, normalizedUrl: parsed.toString() };
  } catch {
    return {
      isValid: false,
      normalizedUrl: candidate,
      error: 'Invalid URL format. Please enter a valid https:// link.',
    };
  }
}

export function validateEmailAddress(email: string): boolean {
  const trimmed = (email || '').trim();
  if (!trimmed) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function validatePhoneNumber(phone: string): boolean {
  const trimmed = (phone || '').trim();
  if (!trimmed) return false;
  const digits = trimmed.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
}

export const SchoolAboutSection: React.FC<SchoolAboutSectionProps> = ({
  aboutPdfUrl,
  onUploadAboutPdf,
  onShowToast,
}) => {
  const [aboutData, setAboutData] = useState<SchoolAboutData>(() =>
    StorageService.getSchoolAbout()
  );
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<SchoolAboutData>(aboutData);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [editingLinkId, setEditingLinkId] = useState<
    'facebook' | 'youtube' | 'whatsapp' | 'iemis' | null
  >(null);
  const [quickLinkDraftUrl, setQuickLinkDraftUrl] = useState<string>('');
  const [quickLinkError, setQuickLinkError] = useState<string | null>(null);

  const [showExportMenu, setShowExportMenu] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [localToast, setLocalToast] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const aboutPdfInputRef = useRef<HTMLInputElement>(null);

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setLocalToast({ type, message });
    onShowToast?.(message);
    setTimeout(() => setLocalToast(null), 4000);
  };

  const handleStartEdit = () => {
    setDraft({ ...aboutData });
    setValidationErrors({});
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setDraft({ ...aboutData });
    setValidationErrors({});
    setIsEditing(false);
    notify('Changes cancelled. Previous School About Me information preserved.');
  };

  const validateAllFields = (data: SchoolAboutData): Record<string, string> => {
    const errors: Record<string, string> = {};
    if (!data.schoolName?.trim()) {
      errors.schoolName = 'School Name is required.';
    }
    if (data.email && !validateEmailAddress(data.email)) {
      errors.email = 'Please enter a valid email address (e.g. gpschambaikohat@gmail.com).';
    }
    if (data.phoneNo && !validatePhoneNumber(data.phoneNo)) {
      errors.phoneNo = 'Please enter a valid phone number (7–15 digits).';
    }
    if (data.sosNo && !validatePhoneNumber(data.sosNo)) {
      errors.sosNo = 'Please enter a valid SOS / secondary phone number.';
    }

    for (const item of FOUR_REMAINING_LINKS) {
      const raw = data[item.urlKey] || '';
      const check = normalizeAndValidateSchoolUrl(raw, item.id);
      if (!check.isValid) {
        errors[item.urlKey] = check.error || `Invalid ${item.name} URL`;
      }
    }
    return errors;
  };

  const handleSaveChanges = () => {
    const errors = validateAllFields(draft);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      notify('Please fix the highlighted validation errors before saving.', 'error');
      return;
    }

    // Normalize the 4 URLs before saving
    const fb = normalizeAndValidateSchoolUrl(draft.facebookUrl, 'facebook');
    const yt = normalizeAndValidateSchoolUrl(draft.youtubeUrl, 'youtube');
    const wa = normalizeAndValidateSchoolUrl(draft.whatsappUrl, 'whatsapp');
    const ie = normalizeAndValidateSchoolUrl(draft.iemisUrl, 'iemis');

    const cleaned: SchoolAboutData = {
      ...aboutData,
      ...draft,
      facebookUrl: fb.normalizedUrl,
      youtubeUrl: yt.normalizedUrl,
      whatsappUrl: wa.normalizedUrl,
      iemisUrl: ie.normalizedUrl,
    };

    setAboutData(cleaned);
    StorageService.saveSchoolAbout(cleaned);
    setValidationErrors({});
    setIsEditing(false);
    notify('School About Me information saved permanently!');
  };

  const handleQuickSaveLinkUrl = (item: FourSocialLinkItem) => {
    const check = normalizeAndValidateSchoolUrl(quickLinkDraftUrl, item.id);
    if (!check.isValid) {
      setQuickLinkError(check.error || 'Please enter a valid https:// URL.');
      return;
    }
    const updated: SchoolAboutData = {
      ...aboutData,
      [item.urlKey]: check.normalizedUrl,
    };
    setAboutData(updated);
    setDraft(updated);
    StorageService.saveSchoolAbout(updated);
    setEditingLinkId(null);
    setQuickLinkError(null);
    notify(`${item.name} link updated and saved permanently!`);
  };

  /**
   * Opens one specific link on Android APK (preferring installed native app via Intent.ACTION_VIEW,
   * falling back to mobile browser) or in a new tab on Desktop/Web.
   */
  const handleOpenSingleLink = (
    e: React.MouseEvent,
    item: FourSocialLinkItem
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const rawUrl = aboutData[item.urlKey] || '';
    const check = normalizeAndValidateSchoolUrl(rawUrl, item.id);

    if (!check.isValid || !check.normalizedUrl) {
      setEditingLinkId(item.id);
      setQuickLinkDraftUrl(rawUrl || item.defaultUrl);
      setQuickLinkError(
        check.error || `The ${item.name} link is missing or invalid. Please enter a valid URL.`
      );
      notify(`Please enter a valid URL for ${item.name}.`, 'error');
      return;
    }

    const targetUrl = check.normalizedUrl;
    const isAndroidApkWebView =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'appassets.androidplatform.net' ||
        Boolean((window as any).AndroidBridge));

    if (isAndroidApkWebView) {
      // In the GPS Chambai Android APK, top-level navigation to an external host is intercepted
      // by MainActivity$1.shouldOverrideUrlLoading, which launches Intent(Intent.ACTION_VIEW, uri)
      // to open the native Android app (Facebook, YouTube, WhatsApp) or default mobile browser (iEMIS)
      // without navigating the WebView away from the current screen.
      window.location.assign(targetUrl);
      return;
    }

    // Desktop / Mobile Web Browser: open in a separate tab using a clean anchor element
    const anchor = document.createElement('a');
    anchor.href = targetUrl;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  /**
   * Builds the complete A4 Portrait HTML representation of the School About Me document
   * for PDF, DOC/DOCX, JPG, and Print Preview.
   */
  const buildSchoolAboutA4Html = (data: SchoolAboutData): string => {
    const cust = StorageService.getCustomization();
    const logoUrl =
      cust.customLogoDataUrl ||
      cust.schoolLogoUrl ||
      '/assets/aistudio/20260903_200547_79893d25.png';

    const formatParagraphs = (text?: string) =>
      (text || '')
        .split('\n')
        .filter((line) => line.trim().length > 0)
        .map(
          (line) =>
            `<div style="margin-bottom:4px;line-height:1.55;color:#1e293b;font-size:11.5px;">${line}</div>`
        )
        .join('');

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${data.schoolFullTitle || data.schoolName} — School About Me</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Arial, Helvetica, sans-serif;
      color: #0f172a;
      background: #ffffff;
    }
    .a4-container {
      width: 100%;
      max-width: 760px;
      margin: 0 auto;
      background: #ffffff;
      border: 2px solid #065f46;
      border-radius: 12px;
      padding: 18px 20px;
    }
    .header-banner {
      background: linear-gradient(135deg, #064e3b 0%, #047857 100%);
      color: #ffffff;
      padding: 14px 16px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 14px;
    }
    .header-logo {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      border: 2px solid #fde047;
      background: #ffffff;
      object-fit: cover;
      padding: 2px;
      flex-shrink: 0;
    }
    .section-card {
      border: 1px solid #cbd5e1;
      border-left: 5px solid #065f46;
      border-radius: 8px;
      padding: 10px 12px;
      margin-bottom: 10px;
      background: #f8fafc;
      page-break-inside: avoid;
    }
    .section-heading {
      font-size: 12.5px;
      font-weight: 800;
      color: #065f46;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin: 0 0 6px 0;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    table.emis-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 12px;
      font-size: 11px;
    }
    table.emis-table th,
    table.emis-table td {
      border: 1px solid #94a3b8;
      padding: 5px 8px;
      text-align: left;
    }
    table.emis-table th {
      background: #ecfdf5;
      color: #064e3b;
      font-weight: 800;
      width: 22%;
    }
    table.emis-table td {
      background: #ffffff;
      color: #0f172a;
      font-weight: 700;
      width: 28%;
    }
  </style>
</head>
<body data-standalone-doc="true">
  <div class="a4-container">
    <div class="header-banner">
      <img src="${logoUrl}" alt="School Logo" class="header-logo" onerror="this.style.display='none'" />
      <div>
        <div style="font-size:10px;font-weight:800;color:#fde047;text-transform:uppercase;letter-spacing:0.8px;">
          EMIS Code: ${data.emisCode} (${data.approvalStatus}) • DDO Code: ${data.ddoCode}
        </div>
        <h1 style="margin:3px 0;font-size:18px;font-weight:900;color:#ffffff;">
          ${data.schoolFullTitle || 'GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT'}
        </h1>
        <div style="font-size:11.5px;color:#d1fae5;font-weight:600;">
          ${data.department}
        </div>
      </div>
    </div>

    <div class="section-heading" style="margin-bottom:6px;">
      Official EMIS 16454 Institutional Profile &amp; Census Record
    </div>
    <table class="emis-table">
      <tbody>
        <tr>
          <th>School Name</th>
          <td>${data.schoolName}</td>
          <th>EMIS Code</th>
          <td>${data.emisCode} (${data.approvalStatus})</td>
        </tr>
        <tr>
          <th>DDO Code</th>
          <td>${data.ddoCode}</td>
          <th>School Level</th>
          <td>${data.schoolLevel} (${data.officeSchoolGender})</td>
        </tr>
        <tr>
          <th>Circle Name</th>
          <td>${data.circleName}</td>
          <th>Union Council</th>
          <td>${data.unionCouncil}</td>
        </tr>
        <tr>
          <th>Tehsil &amp; District</th>
          <td>${data.tehsil} / ${data.district}</td>
          <th>Division &amp; Province</th>
          <td>${data.division} • ${data.province}</td>
        </tr>
        <tr>
          <th>NA / PK Constituency</th>
          <td>NA-${data.na} / PK-${data.pk}</td>
          <th>GPS Coordinates</th>
          <td>X: ${data.xPoint}, Y: ${data.yPoint}</td>
        </tr>
        <tr>
          <th>Instruction Medium</th>
          <td>${data.instructionMedium}</td>
          <th>Area / Weather Zone</th>
          <td>${data.urbanRural} (${data.weatherZone} ZONE)</td>
        </tr>
        <tr>
          <th>Ownership &amp; Type</th>
          <td>${data.ownership} (${data.type})</td>
          <th>Sub-Office</th>
          <td>${data.subOffice}</td>
        </tr>
        <tr>
          <th>Phone / SOS #</th>
          <td>${data.phoneNo} / ${data.sosNo}</td>
          <th>Email Address</th>
          <td>${data.email}</td>
        </tr>
        <tr>
          <th>School Address</th>
          <td colspan="3">${data.schoolAddress || data.mohallaName} (Post Office: ${data.postOffice})</td>
        </tr>
      </tbody>
    </table>

    <div class="section-card">
      <div class="section-heading">School Introduction</div>
      ${formatParagraphs(data.schoolIntroduction)}
    </div>

    <div class="section-card" style="border-left-color:#0284c7;">
      <div class="section-heading" style="color:#0369a1;">School History</div>
      ${formatParagraphs(data.schoolHistory)}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
      <div class="section-card" style="margin-bottom:0;border-left-color:#d97706;">
        <div class="section-heading" style="color:#b45309;">School Vision</div>
        ${formatParagraphs(data.schoolVision)}
      </div>
      <div class="section-card" style="margin-bottom:0;border-left-color:#7c3aed;">
        <div class="section-heading" style="color:#6d28d9;">School Mission</div>
        ${formatParagraphs(data.schoolMission)}
      </div>
    </div>

    <div class="section-card" style="border-left-color:#059669;">
      <div class="section-heading" style="color:#047857;">School Facilities</div>
      ${formatParagraphs(data.schoolFacilities)}
    </div>

    <div class="section-card" style="border-left-color:#2563eb;">
      <div class="section-heading" style="color:#1d4ed8;">Educational Activities</div>
      ${formatParagraphs(data.educationalActivities)}
    </div>

    <div class="section-card" style="border-left-color:#e11d48;">
      <div class="section-heading" style="color:#be123c;">School Achievements</div>
      ${formatParagraphs(data.schoolAchievements)}
    </div>

    <div class="section-card" style="border-left-color:#0f172a;">
      <div class="section-heading" style="color:#0f172a;">Contact Information</div>
      ${formatParagraphs(data.contactInformation)}
      <div style="margin-top:4px;font-size:11px;font-weight:700;color:#0f172a;">
        Address: ${data.schoolAddress || data.mohallaName} &nbsp;|&nbsp; Phone: ${data.phoneNo} &nbsp;|&nbsp; SOS: ${data.sosNo} &nbsp;|&nbsp; Email: ${data.email}
      </div>
    </div>

    <div class="section-card" style="border-left-color:#16a34a;margin-bottom:0;">
      <div class="section-heading" style="color:#15803d;">Official Social Media &amp; Department Portal Links</div>
      <table style="width:100%;border-collapse:collapse;font-size:10.5px;">
        <tbody>
          ${FOUR_REMAINING_LINKS.map((item) => {
            const label = data[item.labelKey] || item.defaultLabel;
            const url = data[item.urlKey] || item.defaultUrl;
            return `<tr>
              <td style="padding:4px 6px;font-weight:800;width:28%;color:#0f172a;border-bottom:1px solid #e2e8f0;">${item.name} — ${label}</td>
              <td style="padding:4px 6px;color:#0369a1;font-weight:700;border-bottom:1px solid #e2e8f0;word-break:break-all;">${url}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;
  };

  /**
   * Renders the full School About Me HTML document to an offscreen high-resolution canvas
   */
  const renderSchoolAboutCanvas = async (data: SchoolAboutData): Promise<HTMLCanvasElement> => {
    const html = buildSchoolAboutA4Html(data);
    const widthPx = 794; // A4 Portrait width at 96 DPI
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${widthPx}px`;
    container.style.background = '#ffffff';
    container.style.color = '#0f172a';
    container.style.padding = '16px';
    container.style.zIndex = '-100';

    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const innerContent = bodyMatch ? bodyMatch[1] : html;
    container.innerHTML = `${styleMatches.join('\n')}<div>${innerContent}</div>`;
    document.body.appendChild(container);

    const imgs = Array.from(container.querySelectorAll('img'));
    await Promise.all(
      imgs.map(
        (img) =>
          new Promise<void>((res) => {
            if (img.complete) {
              res();
              return;
            }
            img.onload = () => res();
            img.onerror = () => res();
            setTimeout(res, 500);
          })
      )
    );

    try {
      return await html2canvas(container, {
        scale: 2.2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: widthPx,
        windowWidth: widthPx,
        logging: false,
      });
    } finally {
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }
  };

  /**
   * PART 4.1 — Export A4 Portrait PDF (Multi-page supported automatically)
   */
  const handleExportPdf = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const activeData = isEditing ? draft : aboutData;
      const canvas = await renderSchoolAboutCanvas(activeData);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidthMm = 210;
      const pageHeightMm = 297;
      const marginMm = 8;
      const usableWidthMm = pageWidthMm - marginMm * 2;
      const usableHeightMm = pageHeightMm - marginMm * 2;

      // Slice canvas into clean A4 page chunks if height exceeds 1 page
      const pageSliceHeightPx = Math.floor((canvas.width * usableHeightMm) / usableWidthMm);
      const totalHeightPx = canvas.height;
      let offsetY = 0;
      let pageIndex = 0;

      while (offsetY < totalHeightPx) {
        if (pageIndex > 0) {
          pdf.addPage();
        }
        const currentSliceHeightPx = Math.min(pageSliceHeightPx, totalHeightPx - offsetY);
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = currentSliceHeightPx;
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          ctx.drawImage(
            canvas,
            0,
            offsetY,
            canvas.width,
            currentSliceHeightPx,
            0,
            0,
            canvas.width,
            currentSliceHeightPx
          );
        }
        const sliceDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
        const sliceHeightMm = (currentSliceHeightPx * usableWidthMm) / canvas.width;
        pdf.addImage(sliceDataUrl, 'JPEG', marginMm, marginMm, usableWidthMm, sliceHeightMm);

        offsetY += pageSliceHeightPx;
        pageIndex += 1;
      }

      const pdfBlob = pdf.output('blob');
      saveFileToGpsChambaiFolder(
        'GPS_Chambai_School_About.pdf',
        pdfBlob,
        'application/pdf',
        'GPS Chambai/Office Data',
        'School About Me'
      );
      notify(
        `Exported GPS_Chambai_School_About.pdf (${pageIndex} A4 Portrait page${pageIndex > 1 ? 's' : ''})!`
      );
    } catch (err) {
      console.error('PDF export error:', err);
      notify('Failed to export PDF. Please try again.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * PART 4.2 — Export Editable Microsoft Word Document (.docx / .doc) in A4 Portrait dimensions
   */
  const handleExportDocx = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const activeData = isEditing ? draft : aboutData;
      const htmlContent = buildSchoolAboutA4Html(activeData);
      const wordHtml = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>GPS Chambai School About</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page Section1 {
      size: 210mm 297mm;
      margin: 12mm 12mm 12mm 12mm;
    }
    div.Section1 { page: Section1; }
  </style>
</head>
<body>
  <div class="Section1">
    ${htmlContent}
  </div>
</body>
</html>`;

      const docBlob = new Blob(['\ufeff', wordHtml], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8',
      });

      saveFileToGpsChambaiFolder(
        'GPS_Chambai_School_About.docx',
        docBlob,
        'application/msword',
        'GPS Chambai/Office Data',
        'School About Me'
      );
      notify('Exported editable Word document: GPS_Chambai_School_About.docx!');
    } catch (err) {
      console.error('DOCX export error:', err);
      notify('Failed to export Word document.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * PART 4.3 — Export High-Resolution A4 Portrait JPG (Sequential A4 pages if content exceeds 1 page)
   */
  const handleExportJpg = async () => {
    setIsExporting(true);
    setShowExportMenu(false);
    try {
      const activeData = isEditing ? draft : aboutData;
      const canvas = await renderSchoolAboutCanvas(activeData);

      // Standard A4 Portrait aspect ratio 1 : 1.4142
      const a4PageHeightPx = Math.round(canvas.width * 1.4142);
      const totalHeightPx = canvas.height;

      // If it fits comfortably within 1.12x of a single A4 page, pad/frame onto 1 A4 page;
      // otherwise generate sequential A4 portrait JPG pages so text is never shrunk or cropped.
      if (totalHeightPx <= a4PageHeightPx * 1.12) {
        const outCanvas = document.createElement('canvas');
        outCanvas.width = canvas.width;
        outCanvas.height = Math.max(a4PageHeightPx, totalHeightPx);
        const ctx = outCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, outCanvas.width, outCanvas.height);
          ctx.drawImage(canvas, 0, 0);
        }
        const jpgDataUrl = outCanvas.toDataURL('image/jpeg', 0.95);
        saveFileToGpsChambaiFolder(
          'GPS_Chambai_School_About.jpg',
          jpgDataUrl,
          'image/jpeg',
          'GPS Chambai/Office Data',
          'School About Me'
        );
        notify('Exported high-resolution A4 image: GPS_Chambai_School_About.jpg!');
      } else {
        let offsetY = 0;
        let pageNum = 1;
        while (offsetY < totalHeightPx) {
          const sliceH = Math.min(a4PageHeightPx, totalHeightPx - offsetY);
          const pageCanvas = document.createElement('canvas');
          pageCanvas.width = canvas.width;
          pageCanvas.height = a4PageHeightPx;
          const ctx = pageCanvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
            ctx.drawImage(
              canvas,
              0,
              offsetY,
              canvas.width,
              sliceH,
              0,
              0,
              canvas.width,
              sliceH
            );
          }
          const jpgDataUrl = pageCanvas.toDataURL('image/jpeg', 0.95);
          const fileName =
            pageNum === 1
              ? 'GPS_Chambai_School_About.jpg'
              : `GPS_Chambai_School_About_Page${pageNum}.jpg`;

          saveFileToGpsChambaiFolder(
            fileName,
            jpgDataUrl,
            'image/jpeg',
            'GPS Chambai/Office Data',
            'School About Me'
          );
          offsetY += a4PageHeightPx;
          pageNum += 1;
        }
        notify(
          `Exported complete School About Me in ${pageNum - 1} high-resolution A4 JPG pages!`
        );
      }
    } catch (err) {
      console.error('JPG export error:', err);
      notify('Failed to export JPG image.', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * PART 5 — Share School About Me on Android / Web
   */
  const handleShareSchoolAbout = async () => {
    setShowExportMenu(false);
    setIsExporting(true);
    try {
      const activeData = isEditing ? draft : aboutData;
      const canvas = await renderSchoolAboutCanvas(activeData);
      const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.92);
      await shareDocumentOrFile({
        title: `${activeData.schoolFullTitle || activeData.schoolName} — School About`,
        text: `${activeData.schoolFullTitle || activeData.schoolName} (EMIS: ${activeData.emisCode} • DDO: ${activeData.ddoCode})\nPhone: ${activeData.phoneNo} | Email: ${activeData.email}\nAddress: ${activeData.schoolAddress || activeData.mohallaName}`,
        dataUrl: jpgDataUrl,
        fileName: 'GPS_Chambai_School_About.jpg',
        mimeType: 'image/jpeg',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPreview = () => {
    setShowExportMenu(false);
    const activeData = isEditing ? draft : aboutData;
    const html = buildSchoolAboutA4Html(activeData);
    printHtmlDocument(
      'GPS_Chambai_School_About',
      html,
      'portrait',
      false,
      'GPS Chambai/Office Data'
    );
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl p-4 sm:p-5 border-2 border-emerald-700 shadow-lg space-y-4">
        {/* Top Header Bar with EDIT,SAVE/CANCEL, and EXPORT Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3.5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              EMIS Code: {aboutData.emisCode} ({aboutData.approvalStatus}) • DDO: {aboutData.ddoCode}
            </span>
            <h3 className="text-lg font-black text-slate-900 mt-1">
              {aboutData.schoolFullTitle || 'GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT'}
            </h3>
            <p className="text-xs text-slate-500 font-semibold">{aboutData.department}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 relative">
            <input
              ref={aboutPdfInputRef}
              type="file"
              accept=".pdf"
              onChange={onUploadAboutPdf}
              className="hidden"
            />

            {!isEditing ? (
              <button
                type="button"
                onClick={handleStartEdit}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
              >
                <Edit3 size={14} />
                <span>EDIT</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-black flex items-center gap-1 transition-all"
                >
                  <X size={14} />
                  <span>Cancel</span>
                </button>
              </>
            )}

            {/* EXPORT Dropdown Button (PDF, DOC/DOCX, JPG) */}
            <div className="relative">
              <button
                type="button"
                disabled={isExporting}
                onClick={() => setShowExportMenu((prev) => !prev)}
                className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                <Download size={14} />
                <span>{isExporting ? 'EXPORTING...' : 'EXPORT'}</span>
              </button>

              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border-2 border-emerald-700 p-2 z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Export School About (A4 Portrait)
                  </div>
                  <button
                    type="button"
                    onClick={handleExportPdf}
                    className="w-full px-3 py-2 rounded-xl hover:bg-rose-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">1. PDF Document</div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        GPS_Chambai_School_About.pdf (A4)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDocx}
                    className="w-full px-3 py-2 rounded-xl hover:bg-blue-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileSpreadsheet size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">2. DOC / DOCX Word</div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        GPS_Chambai_School_About.docx (Editable)
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJpg}
                    className="w-full px-3 py-2 rounded-xl hover:bg-emerald-50 text-left flex items-center gap-2.5 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                      <ImageIcon size={16} />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">3. JPG High-Res Image</div>
                      <div className="text-[10px] font-semibold text-slate-500">
                        GPS_Chambai_School_About.jpg (A4)
                      </div>
                    </div>
                  </button>

                  <div className="border-t border-slate-100 pt-1 mt-1 flex gap-1">
                    <button
                      type="button"
                      onClick={handlePrintPreview}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black flex items-center justify-center gap-1"
                    >
                      <Printer size={12} />
                      <span>Print</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleShareSchoolAbout}
                      className="flex-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center justify-center gap-1"
                    >
                      <Share2 size={12} />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => aboutPdfInputRef.current?.click()}
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black flex items-center gap-1"
              title="Attach Official EMIS PDF Document"
            >
              <Upload size={14} />
              <span className="hidden sm:inline">Upload PDF</span>
            </button>
          </div>
        </div>

        {/* Toast Notification Banner */}
        {localToast && (
          <div
            className={`px-4 py-2.5 rounded-2xl flex items-center gap-2 text-xs font-black border ${
              localToast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {localToast.type === 'error' ? (
              <AlertCircle size={16} className="text-rose-600 shrink-0" />
            ) : (
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
            )}
            <span>{localToast.message}</span>
          </div>
        )}

        {/* ===================================================================== */}
        {/* EDIT MODE: FULL EDITABLE FORM FOR ALL SCHOOL ABOUT ME CONTENT         */}
        {/* ===================================================================== */}
        {isEditing ? (
          <div className="space-y-5 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2.5">
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  Edit Complete School About Me Information
                </h4>
                <p className="text-[11px] font-semibold text-slate-500">
                  Modify any field below. Untouched fields remain preserved. Click &ldquo;Save Changes&rdquo; when finished.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleSaveChanges}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1"
                >
                  <Save size={13} />
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-black"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* 1. Core School Identity & EMIS Fields */}
            <div className="space-y-3">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                1. School Name &amp; Official EMIS 16454 Identity
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Full School Heading Title
                  </label>
                  <input
                    type="text"
                    value={draft.schoolFullTitle || ''}
                    onChange={(e) => setDraft({ ...draft, schoolFullTitle: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Short Name *
                  </label>
                  <input
                    type="text"
                    value={draft.schoolName}
                    onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-white ${
                      validationErrors.schoolName ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.schoolName && (
                    <span className="text-[10px] font-bold text-rose-600">
                      {validationErrors.schoolName}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    EMIS Code
                  </label>
                  <input
                    type="text"
                    value={draft.emisCode}
                    onChange={(e) => setDraft({ ...draft, emisCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Approval Status
                  </label>
                  <input
                    type="text"
                    value={draft.approvalStatus}
                    onChange={(e) => setDraft({ ...draft, approvalStatus: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    DDO Code
                  </label>
                  <input
                    type="text"
                    value={draft.ddoCode}
                    onChange={(e) => setDraft({ ...draft, ddoCode: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Level
                  </label>
                  <input
                    type="text"
                    value={draft.schoolLevel}
                    onChange={(e) => setDraft({ ...draft, schoolLevel: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Gender
                  </label>
                  <input
                    type="text"
                    value={draft.officeSchoolGender}
                    onChange={(e) => setDraft({ ...draft, officeSchoolGender: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Instruction Medium
                  </label>
                  <input
                    type="text"
                    value={draft.instructionMedium}
                    onChange={(e) => setDraft({ ...draft, instructionMedium: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Circle Name
                  </label>
                  <input
                    type="text"
                    value={draft.circleName}
                    onChange={(e) => setDraft({ ...draft, circleName: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Union Council
                  </label>
                  <input
                    type="text"
                    value={draft.unionCouncil}
                    onChange={(e) => setDraft({ ...draft, unionCouncil: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Tehsil &amp; District
                  </label>
                  <input
                    type="text"
                    value={draft.district}
                    onChange={(e) =>
                      setDraft({ ...draft, district: e.target.value, tehsil: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Division
                  </label>
                  <input
                    type="text"
                    value={draft.division}
                    onChange={(e) => setDraft({ ...draft, division: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    NA Constituency
                  </label>
                  <input
                    type="text"
                    value={draft.na}
                    onChange={(e) => setDraft({ ...draft, na: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    PK Constituency
                  </label>
                  <input
                    type="text"
                    value={draft.pk}
                    onChange={(e) => setDraft({ ...draft, pk: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Coordinate X (Latitude)
                  </label>
                  <input
                    type="text"
                    value={draft.xPoint}
                    onChange={(e) => setDraft({ ...draft, xPoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Coordinate Y (Longitude)
                  </label>
                  <input
                    type="text"
                    value={draft.yPoint}
                    onChange={(e) => setDraft({ ...draft, yPoint: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Urban / Rural &amp; Zone
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <input
                      type="text"
                      value={draft.urbanRural}
                      onChange={(e) => setDraft({ ...draft, urbanRural: e.target.value })}
                      placeholder="RURAL"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    />
                    <input
                      type="text"
                      value={draft.weatherZone}
                      onChange={(e) => setDraft({ ...draft, weatherZone: e.target.value })}
                      placeholder="SUMMER"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Department Name
                  </label>
                  <input
                    type="text"
                    value={draft.department}
                    onChange={(e) => setDraft({ ...draft, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Ownership / Sub-Office
                  </label>
                  <input
                    type="text"
                    value={draft.ownership}
                    onChange={(e) => setDraft({ ...draft, ownership: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 2. Multiline School Descriptions (Introduction, History, Vision, Mission, Facilities, Activities, Achievements) */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                2. School Profile Descriptions (Multiline Editable)
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Introduction
                  </label>
                  <textarea
                    rows={3}
                    value={draft.schoolIntroduction || ''}
                    onChange={(e) => setDraft({ ...draft, schoolIntroduction: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School History
                  </label>
                  <textarea
                    rows={3}
                    value={draft.schoolHistory || ''}
                    onChange={(e) => setDraft({ ...draft, schoolHistory: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      School Vision
                    </label>
                    <textarea
                      rows={3}
                      value={draft.schoolVision || ''}
                      onChange={(e) => setDraft({ ...draft, schoolVision: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 mb-1">
                      School Mission
                    </label>
                    <textarea
                      rows={3}
                      value={draft.schoolMission || ''}
                      onChange={(e) => setDraft({ ...draft, schoolMission: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Facilities
                  </label>
                  <textarea
                    rows={4}
                    value={draft.schoolFacilities || ''}
                    onChange={(e) => setDraft({ ...draft, schoolFacilities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Educational Activities
                  </label>
                  <textarea
                    rows={4}
                    value={draft.educationalActivities || ''}
                    onChange={(e) => setDraft({ ...draft, educationalActivities: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Achievements
                  </label>
                  <textarea
                    rows={4}
                    value={draft.schoolAchievements || ''}
                    onChange={(e) => setDraft({ ...draft, schoolAchievements: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white leading-relaxed"
                  />
                </div>
              </div>
            </div>

            {/* 3. Contact Information, Address, Phone & Email */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                3. Contact Information, Address, Phone &amp; Email
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Primary Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={draft.phoneNo}
                    onChange={(e) => setDraft({ ...draft, phoneNo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-white ${
                      validationErrors.phoneNo ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.phoneNo && (
                    <span className="text-[10px] font-bold text-rose-600">
                      {validationErrors.phoneNo}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    SOS / Secondary Phone Number
                  </label>
                  <input
                    type="tel"
                    value={draft.sosNo}
                    onChange={(e) => setDraft({ ...draft, sosNo: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-white ${
                      validationErrors.sosNo ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.sosNo && (
                    <span className="text-[10px] font-bold text-rose-600">
                      {validationErrors.sosNo}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Official Email Address *
                  </label>
                  <input
                    type="email"
                    value={draft.email}
                    onChange={(e) => setDraft({ ...draft, email: e.target.value })}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-bold bg-white ${
                      validationErrors.email ? 'border-rose-500' : 'border-slate-300'
                    }`}
                  />
                  {validationErrors.email && (
                    <span className="text-[10px] font-bold text-rose-600">
                      {validationErrors.email}
                    </span>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    School Address / Village &amp; Mohalla
                  </label>
                  <input
                    type="text"
                    value={draft.schoolAddress || draft.mohallaName}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        schoolAddress: e.target.value,
                        mohallaName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Post Office
                  </label>
                  <input
                    type="text"
                    value={draft.postOffice}
                    onChange={(e) => setDraft({ ...draft, postOffice: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-black text-slate-700 mb-1">
                    Contact Information Summary
                  </label>
                  <textarea
                    rows={2}
                    value={draft.contactInformation || ''}
                    onChange={(e) => setDraft({ ...draft, contactInformation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold bg-white"
                  />
                </div>
              </div>
            </div>

            {/* 4. Remaining Four Social Media / Website Links */}
            <div className="space-y-3 pt-2 border-t border-slate-200">
              <div className="text-xs font-black uppercase tracking-wider text-emerald-800">
                4. Official Social Media &amp; Portal Links (4 Active Links)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FOUR_REMAINING_LINKS.map((item) => {
                  const err = validationErrors[item.urlKey];
                  return (
                    <div
                      key={item.id}
                      className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={item.icon}
                          alt={item.name}
                          className="w-5 h-5 object-contain shrink-0"
                        />
                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Display Label
                        </label>
                        <input
                          type="text"
                          value={draft[item.labelKey] ?? item.defaultLabel}
                          onChange={(e) =>
                            setDraft({ ...draft, [item.labelKey]: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                          Destination URL (https://...)
                        </label>
                        <input
                          type="url"
                          value={draft[item.urlKey] || ''}
                          onChange={(e) =>
                            setDraft({ ...draft, [item.urlKey]: e.target.value })
                          }
                          placeholder={item.defaultUrl}
                          className={`w-full px-2.5 py-1.5 rounded-xl border text-xs font-bold ${
                            err ? 'border-rose-500 bg-rose-50/40' : 'border-slate-300'
                          }`}
                        />
                        {err && (
                          <span className="text-[10px] font-bold text-rose-600 block mt-0.5">
                            {err}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Save Changes & Cancel Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChanges}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-md"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        ) : (
          /* ===================================================================== */
          /* VIEW MODE: DISPLAY ALL SCHOOL ABOUT ME CONTENT & 4 WORKING LINKS      */
          /* ===================================================================== */
          <div className="space-y-4">
            {/* Official EMIS 16454 Approved Data Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                { label: 'School Name', value: aboutData.schoolName },
                {
                  label: 'EMIS Code',
                  value: `${aboutData.emisCode} (${aboutData.approvalStatus})`,
                },
                { label: 'DDO Code', value: aboutData.ddoCode },
                {
                  label: 'School Level',
                  value: `${aboutData.schoolLevel} (${aboutData.officeSchoolGender})`,
                },
                { label: 'Circle Name', value: aboutData.circleName },
                { label: 'Union Council', value: aboutData.unionCouncil },
                { label: 'Tehsil & District', value: aboutData.district },
                { label: 'NA / PK', value: `NA-${aboutData.na} / PK-${aboutData.pk}` },
                {
                  label: 'Coordinates',
                  value: `X: ${aboutData.xPoint}, Y: ${aboutData.yPoint}`,
                },
                { label: 'Instruction Medium', value: aboutData.instructionMedium },
                {
                  label: 'Urban / Rural',
                  value: `${aboutData.urbanRural} (${aboutData.weatherZone})`,
                },
                {
                  label: 'Phone / SOS #',
                  value: `${aboutData.phoneNo} / ${aboutData.sosNo}`,
                },
                { label: 'Email', value: aboutData.email },
                {
                  label: 'School Address',
                  value: aboutData.schoolAddress || aboutData.mohallaName,
                },
                { label: 'Post Office', value: aboutData.postOffice },
              ].map((row) => (
                <div
                  key={row.label}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                >
                  <div className="text-[10px] font-bold text-slate-500">{row.label}</div>
                  <div className="font-black text-slate-900 truncate" title={row.value}>
                    {row.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Rich School About Me Descriptive Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-emerald-50/50 border border-emerald-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-emerald-900">
                  <Building2 size={14} className="text-emerald-700" />
                  <span>School Introduction</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolIntroduction}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-sky-50/50 border border-sky-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-sky-900">
                  <History size={14} className="text-sky-700" />
                  <span>School History</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolHistory}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-900">
                  <Sparkles size={14} className="text-amber-700" />
                  <span>School Vision</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolVision}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-purple-50/50 border border-purple-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-purple-900">
                  <Target size={14} className="text-purple-700" />
                  <span>School Mission</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolMission}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>School Facilities</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolFacilities}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-900">
                  <BookOpen size={14} className="text-blue-600" />
                  <span>Educational Activities</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.educationalActivities}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/40 border border-rose-200 space-y-1.5 md:col-span-2">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-rose-900">
                  <Award size={14} className="text-rose-600" />
                  <span>School Achievements</span>
                </div>
                <p className="text-xs text-slate-700 font-semibold leading-relaxed whitespace-pre-line">
                  {aboutData.schoolAchievements}
                </p>
              </div>
            </div>

            {/* Contact Information Card */}
            <div className="p-3.5 rounded-2xl bg-slate-900 text-white space-y-2">
              <div className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                Official Contact Information
              </div>
              <p className="text-xs text-slate-200 font-semibold">
                {aboutData.contactInformation}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <span className="font-bold truncate">
                    {aboutData.phoneNo} / {aboutData.sosNo}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                  <Mail size={14} className="text-amber-400 shrink-0" />
                  <span className="font-bold truncate">{aboutData.email}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-xl">
                  <MapPin size={14} className="text-rose-400 shrink-0" />
                  <span className="font-bold truncate">
                    {aboutData.schoolAddress || aboutData.mohallaName}
                  </span>
                </div>
              </div>
            </div>

            {aboutPdfUrl && (
              <div className="h-[380px] w-full rounded-2xl overflow-hidden border border-slate-300">
                <iframe
                  src={aboutPdfUrl}
                  title="About GPS Chambai PDF"
                  className="w-full h-full border-0"
                />
              </div>
            )}

            {/* PART 1 & PART 2: THE FOUR REMAINING SOCIAL MEDIA & PORTAL LINKS */}
            {/* (Instagram, LinkedIn, and Twitter / X are completely removed) */}
            <div className="space-y-2.5 pt-2">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Official Clickable Social Media &amp; Department Links
                </h4>
                <span className="text-[10px] font-bold text-emerald-700">
                  Tap any link to open in app / browser
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {FOUR_REMAINING_LINKS.map((item) => {
                  const currentUrl = aboutData[item.urlKey] || '';
                  const currentLabel = aboutData[item.labelKey] || item.defaultLabel;
                  const urlCheck = normalizeAndValidateSchoolUrl(currentUrl, item.id);
                  const isEditingThisLink = editingLinkId === item.id;

                  return (
                    <div key={item.id} className="space-y-1.5">
                      <div className="flex items-stretch gap-1.5">
                        <a
                          href={urlCheck.isValid ? urlCheck.normalizedUrl : '#'}
                          onClick={(e) => handleOpenSingleLink(e, item)}
                          style={{ backgroundColor: item.color }}
                          className="flex-1 p-3 rounded-2xl text-white text-xs font-black flex items-center justify-between shadow-sm hover:opacity-95 active:scale-98 transition-all cursor-pointer select-none"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                              <img
                                src={item.icon}
                                alt={item.name}
                                className="w-full h-full object-contain"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] uppercase tracking-wider text-white/85 font-bold leading-none">
                                  {item.name}
                                </span>
                                {!urlCheck.isValid && (
                                  <span className="text-[9px] bg-rose-900/90 text-white px-1.5 py-0.2 rounded-full">
                                    Fix URL
                                  </span>
                                )}
                              </div>
                              <div className="truncate font-black text-xs mt-0.5">
                                {currentLabel}
                              </div>
                            </div>
                          </div>
                          <ExternalLink size={15} className="shrink-0 ml-2 text-white/90" />
                        </a>

                        <button
                          type="button"
                          onClick={() => {
                            if (isEditingThisLink) {
                              setEditingLinkId(null);
                              setQuickLinkError(null);
                            } else {
                              setEditingLinkId(item.id);
                              setQuickLinkDraftUrl(currentUrl || item.defaultUrl);
                              setQuickLinkError(null);
                            }
                          }}
                          className="px-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0"
                          title={`Edit ${item.name} URL`}
                        >
                          <Link2 size={14} />
                        </button>
                      </div>

                      {isEditingThisLink && (
                        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-300 space-y-1.5">
                          <div className="text-[10px] font-black text-slate-700">
                            Update {item.name} URL:
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="url"
                              value={quickLinkDraftUrl}
                              onChange={(e) => {
                                setQuickLinkDraftUrl(e.target.value);
                                setQuickLinkError(null);
                              }}
                              placeholder={item.defaultUrl}
                              className="flex-1 px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                            />
                            <button
                              type="button"
                              onClick={() => handleQuickSaveLinkUrl(item)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-black flex items-center gap-1"
                            >
                              <Check size={12} />
                              <span>Save</span>
                            </button>
                          </div>
                          {quickLinkError && (
                            <div className="text-[10px] font-bold text-rose-600">
                              {quickLinkError}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
