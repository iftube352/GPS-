import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ExamResult, SemesterExamPaper, Student } from '../types';
import { StorageService } from './storage';
import { StorageFolderService } from './storageFolderService';

declare global {
  interface Window {
    AndroidBridge?: {
      printHtml?: (html: string, jobName: string) => void;
      saveBase64File?: (base64Data: string, fileName: string, mimeType: string) => void;
      initFolders?: (foldersJson: string) => void;
    };
    showSaveFilePicker?: (options?: any) => Promise<any>;
  }
}

export interface PrintPreviewPayload {
  title: string;
  bodyHtml: string;
  htmlContent: string;
  fullHtml: string;
  fullDocumentHtml: string;
  orientation?: 'portrait' | 'landscape';
  landscape?: boolean;
  includeHeader?: boolean;
  targetFolder?: string;
  folderSubPath?: string;
}

/**
 * Helper to detect if a string contains Urdu/Arabic characters
 */
export function containsUrduText(text: string): boolean {
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text || '');
}

/**
 * Converts a number (0-999) into English words for Detailed Marks Certificates (Image 017)
 */
export function numberToWordsEn(num: number): string {
  const n = Math.max(0, Math.round(Number(num) || 0));
  if (n === 0) return 'Zero';
  const ones = [
    '',
    'One',
    'Two',
    'Three',
    'Four',
    'Five',
    'Six',
    'Seven',
    'Eight',
    'Nine',
    'Ten',
    'Eleven',
    'Twelve',
    'Thirteen',
    'Fourteen',
    'Fifteen',
    'Sixteen',
    'Seventeen',
    'Eighteen',
    'Nineteen',
  ];
  const tens = [
    '',
    '',
    'Twenty',
    'Thirty',
    'Forty',
    'Fifty',
    'Sixty',
    'Seventy',
    'Eighty',
    'Ninety',
  ];

  if (n < 20) return ones[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const o = n % 10;
    return `${tens[t]}${o ? ' ' + ones[o] : ''}`;
  }
  if (n < 1000) {
    const h = Math.floor(n / 100);
    const rem = n % 100;
    return `${ones[h]} Hundred${rem ? ' and ' + numberToWordsEn(rem) : ''}`;
  }
  return String(n);
}

/**
 * Global Jameel Noori Nastaleeq CSS font declaration for all print, preview, PDF & Word documents
 */
export const JAMEEL_NOORI_PRINT_CSS = `
  @font-face {
    font-family: 'Jameel Noori Nastaleeq';
    src: local('Jameel Noori Nastaleeq'),
         local('Jameel Noori Nastaleeq Regular'),
         url('https://cdn.jsdelivr.net/gh/ivoirek/fonts@main/JameelNooriNastaleeq.ttf') format('truetype'),
         url('https://fonts.gstatic.com/s/notonastaliqurdu/v20/LhWNMUPbN-oZdNFcBy1-DJYsEoTq5pudQ9L940pGPkB3Qt3DKg.woff2') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  .urdu-text, .font-urdu, [dir="rtl"], [lang="ur"] {
    font-family: 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Urdu Typesetting', serif !important;
    direction: rtl;
    unicode-bidi: isolate;
    line-height: 2.05;
    letter-spacing: 0px !important;
    font-feature-settings: "liga" 1, "clig" 1, "calt" 1, "kern" 1;
    text-rendering: optimizeLegibility;
  }
`;

/**
 * Detects whether an HTML snippet already has its own complete document shell or custom header
 */
function isStandaloneCustomDocument(html: string): boolean {
  const trimmed = (html || '').trim();
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    return true;
  }
  if (
    trimmed.includes('SCHOOL LEAVING CERTIFICATE') ||
    trimmed.includes('DETAILED MARKS CERTIFICATE') ||
    trimmed.includes('Award List') ||
    trimmed.includes('LESSON PLAN') ||
    trimmed.includes('data-standalone-doc="true"')
  ) {
    return true;
  }
  return false;
}

/**
 * Builds a complete, standalone printable HTML document with official GPS Chambai header
 * and embedded Jameel Noori Nastaleeq Urdu font support.
 */
export function buildOfficialPrintHtml(
  title: string,
  bodyHtml: string,
  orientation: 'portrait' | 'landscape' | boolean = 'portrait',
  includeHeader: boolean = true
): string {
  const resolvedOrientation: 'portrait' | 'landscape' =
    typeof orientation === 'boolean' ? (orientation ? 'landscape' : 'portrait') : orientation;

  const trimmed = (bodyHtml || '').trim();
  // If bodyHtml is already a full <!DOCTYPE html> or <html> document (e.g. Lesson Plan Image 007),
  // inject Jameel Noori Nastaleeq CSS into its <head> and return without wrapping a duplicate header.
  if (/^<!DOCTYPE\s+html/i.test(trimmed) || /^<html[\s>]/i.test(trimmed)) {
    if (!trimmed.includes('Jameel Noori Nastaleeq')) {
      return trimmed.replace(
        /<\/head>/i,
        `<link href="https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq" rel="stylesheet"><link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&display=swap" rel="stylesheet"><style>${JAMEEL_NOORI_PRINT_CSS}</style></head>`
      );
    }
    return trimmed;
  }

  const effectiveIncludeHeader = includeHeader && !isStandaloneCustomDocument(trimmed);
  const cust = StorageService.getCustomization();
  const today = new Date().toISOString().split('T')[0];

  const logoUrl =
    cust.customLogoDataUrl ||
    cust.schoolLogoUrl ||
    '/assets/aistudio/20260903_200547_79893d25.png';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} — Govt. Primary School Chambai Kohat</title>
  <link href="https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Noto+Nastaliq+Urdu:wght@400;700&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4 ${resolvedOrientation};
      margin: 8mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    ${JAMEEL_NOORI_PRINT_CSS}
    body {
      font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Segoe UI', Tahoma, sans-serif;
      color: #0f172a;
      background: #ffffff;
      margin: 0;
      padding: ${effectiveIncludeHeader ? '14px' : '6px'};
      font-size: 12.5px;
      line-height: 1.5;
    }
    .official-header {
      display: grid;
      grid-template-columns: 80px 1fr 80px;
      align-items: center;
      border-bottom: 3px double #065f46;
      padding-bottom: 10px;
      margin-bottom: 14px;
    }
    .official-header-logo {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      border: 2px solid #065f46;
      padding: 2px;
      object-fit: cover;
      background: #ffffff;
    }
    .official-header-center {
      text-align: center;
      padding: 0 8px;
    }
    .official-header-center h1 {
      margin: 0;
      font-size: 19px;
      font-weight: 800;
      color: #064e3b;
      letter-spacing: 0.01em;
    }
    .official-header-center .emis-line {
      margin: 2px 0 0 0;
      font-size: 12px;
      font-weight: 800;
      color: #0f172a;
    }
    .official-header-center .dept-line {
      margin: 2px 0 0 0;
      font-size: 11px;
      color: #334155;
      font-weight: 700;
    }
    .doc-title-banner {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 7px 14px;
      margin-bottom: 14px;
      text-align: center;
      font-weight: 800;
      font-size: 13.5px;
      color: #0f172a;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 14px;
      font-size: 11.5px;
      font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif;
    }
    th, td {
      border: 1px solid #64748b;
      padding: 6px 8px;
      text-align: left;
    }
    th {
      background-color: #e2e8f0;
      color: #0f172a;
      font-weight: 700;
    }
    tr:nth-child(even) {
      background-color: #f8fafc;
    }
    .signature-row {
      margin-top: 32px;
      display: flex;
      justify-content: space-between;
      padding-top: 14px;
      page-break-inside: avoid;
    }
    .sig-box {
      text-align: center;
      width: 200px;
      border-top: 1.5px solid #334155;
      padding-top: 6px;
      font-weight: 700;
      font-size: 11.5px;
      color: #334155;
    }
  </style>
</head>
<body>
  ${
    effectiveIncludeHeader
      ? `<div class="official-header">
          <div style="display:flex;align-items:center;justify-content:flex-start;">
            <img src="${logoUrl}" alt="School Logo" class="official-header-logo" onerror="this.style.display='none'" />
          </div>
          <div class="official-header-center">
            <h1>Govt. Primary School Chambai Kohat</h1>
            <div class="emis-line">EMIS School Code: 16454 • Circle: Jarma Kohat</div>
            <div class="dept-line">Elementary &amp; Secondary Education Department, Khyber Pakhtunkhwa</div>
          </div>
          <div></div>
        </div>
        <div class="doc-title-banner">
          ${title} (${today})
        </div>`
      : ''
  }
  ${bodyHtml}
  ${
    effectiveIncludeHeader
      ? `<div class="signature-row">
          <div class="sig-box">Prepared By / Class Incharge</div>
          <div class="sig-box">Head Teacher Stamp &amp; Signature<br/><span style="font-weight:400;font-size:10.5px;">GPS Chambai Kohat (EMIS 16454)</span></div>
        </div>`
      : ''
  }
</body>
</html>`;
}

/**
 * Triggers universal Print Preview & PDF Engine modal
 */
export function printHtmlDocument(
  title: string,
  bodyHtml: string,
  orientation: 'portrait' | 'landscape' | boolean = 'portrait',
  includeHeader: boolean | 'portrait' | 'landscape' = true,
  targetFolder: string = 'GPS Chambai/PDF & Print Records/Export PDF'
): void {
  const resolvedOrientation: 'portrait' | 'landscape' =
    typeof orientation === 'boolean'
      ? orientation
        ? 'landscape'
        : 'portrait'
      : includeHeader === 'landscape'
      ? 'landscape'
      : orientation;
  const resolvedIncludeHeader = typeof includeHeader === 'boolean' ? includeHeader : true;
  const fullHtml = buildOfficialPrintHtml(title, bodyHtml, resolvedOrientation, resolvedIncludeHeader);

  const detail: PrintPreviewPayload = {
    title,
    bodyHtml,
    htmlContent: bodyHtml,
    fullHtml,
    fullDocumentHtml: fullHtml,
    orientation: resolvedOrientation,
    landscape: resolvedOrientation === 'landscape',
    includeHeader: resolvedIncludeHeader,
    targetFolder,
    folderSubPath: targetFolder.replace(/^GPS Chambai\/+/i, ''),
  };
  window.dispatchEvent(new CustomEvent('gps-open-print-preview', { detail }));
}

/**
 * Executes native or iframe print
 */
export function executeIframePrint(fullHtml: string, title: string = 'GPS Chambai Document'): void {
  if (window.AndroidBridge?.printHtml) {
    try {
      window.AndroidBridge.printHtml(fullHtml, title);
    } catch (e) {
      console.warn('AndroidBridge print fallback:', e);
    }
  }

  try {
    const existing = document.getElementById('gps-print-iframe');
    if (existing) existing.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'gps-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(fullHtml);
      doc.close();
      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 300);
    }
  } catch (e) {
    console.warn('Iframe print error, falling back to window.print():', e);
    window.print();
  }
}

/**
 * Generates a real binary PDF Blob from structured title & HTML content using jsPDF
 */
export function generateRealPdfBlobFromHtml(
  title: string,
  htmlContent: string,
  orientation: 'portrait' | 'landscape' | boolean = 'portrait'
): Blob {
  const isLandscape = orientation === 'landscape' || orientation === true;
  const doc = new jsPDF({
    orientation: isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;

  // Draw official header banner
  doc.setFillColor(6, 95, 70);
  doc.rect(margin, margin, pageWidth - margin * 2, 22, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT', pageWidth / 2, margin + 8, {
    align: 'center',
  });

  doc.setFontSize(9.5);
  doc.setTextColor(209, 250, 229);
  doc.text(
    'Elementary & Secondary Education Department KP  |  EMIS Code: 16454  |  Circle: Jarma',
    pageWidth / 2,
    margin + 14,
    { align: 'center' }
  );

  doc.setFontSize(10.5);
  doc.setTextColor(253, 224, 71);
  doc.text(title.slice(0, 85), pageWidth / 2, margin + 20, { align: 'center' });

  // Extract structured lines & tables from HTML
  const parser = new DOMParser();
  const parsedDoc = parser.parseFromString(htmlContent, 'text/html');
  // Remove style and script tags so CSS rules aren't printed as text
  parsedDoc.querySelectorAll('style, script').forEach((el) => el.remove());

  let y = margin + 30;
  doc.setTextColor(15, 23, 42);

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 20) {
      doc.addPage();
      y = margin + 10;
    }
  };

  // Render tables cleanly if present
  const tables = parsedDoc.querySelectorAll('table');
  if (tables.length > 0) {
    tables.forEach((tbl) => {
      const rows = Array.from(tbl.querySelectorAll('tr'));
      rows.forEach((tr, rIdx) => {
        const cells = Array.from(tr.querySelectorAll('th, td')).map((c) =>
          (c.textContent || '').replace(/\s+/g, ' ').trim()
        );
        if (cells.length === 0) return;

        checkPageBreak(9);
        const colW = (pageWidth - margin * 2) / Math.max(1, cells.length);
        const isHeader = rIdx === 0 || tr.querySelector('th') !== null;

        if (isHeader) {
          doc.setFillColor(226, 232, 240);
          doc.rect(margin, y - 4.5, pageWidth - margin * 2, 7.5, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(8.5);
        } else {
          if (rIdx % 2 === 0) {
            doc.setFillColor(248, 250, 252);
            doc.rect(margin, y - 4.5, pageWidth - margin * 2, 7, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8.5);
        }

        cells.forEach((cellText, cIdx) => {
          const x = margin + cIdx * colW + 1.5;
          const clipped = doc.splitTextToSize(cellText || '-', colW - 3)[0] || '';
          doc.text(clipped, x, y);
        });

        doc.setDrawColor(148, 163, 184);
        doc.rect(margin, y - 4.5, pageWidth - margin * 2, 7);
        y += 7;
      });
      y += 5;
    });
  }

  // Also render non-table text blocks
  parsedDoc.querySelectorAll('table').forEach((t) => t.remove());
  const rawText = (parsedDoc.body.textContent || '')
    .split('\n')
    .map((l) => l.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  rawText.forEach((line) => {
    const wrapped = doc.splitTextToSize(line, pageWidth - margin * 2);
    wrapped.forEach((wLine: string) => {
      checkPageBreak(6.5);
      doc.text(wLine, margin, y);
      y += 5.5;
    });
  });

  // Footer signature line
  checkPageBreak(24);
  const sigY = Math.max(y + 14, pageHeight - 18);
  doc.setDrawColor(51, 65, 85);
  doc.line(margin, sigY, margin + 55, sigY);
  doc.line(pageWidth - margin - 65, sigY, pageWidth - margin, sigY);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Prepared By / Class Incharge', margin + 27.5, sigY + 4.5, { align: 'center' });
  doc.text('Head Teacher GPS Chambai Kohat', pageWidth - margin - 32.5, sigY + 4.5, {
    align: 'center',
  });

  return doc.output('blob');
}

/**
 * Generates a real binary PDF from an image/canvas dataUrl (e.g. Certificate Image 015 or DMC Report Card Image 017)
 */
export function generatePdfBlobFromImageDataUrl(
  imageDataUrl: string,
  orientation: 'portrait' | 'landscape' | boolean = 'portrait'
): Blob {
  const isLandscape = orientation === 'landscape' || orientation === true;
  const doc = new jsPDF({
    orientation: isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
  });
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  doc.addImage(imageDataUrl, 'JPEG', 6, 6, w - 12, h - 12);
  return doc.output('blob');
}

/**
 * Generates a Microsoft Word (.doc) Blob from any HTML document
 */
export function generateWordDocBlobFromHtml(title: string, htmlContent: string): Blob {
  const wordDoc = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
</head>
<body>
  ${htmlContent}
</body>
</html>`;
  return new Blob(['\ufeff', wordDoc], {
    type: 'application/msword;charset=utf-8',
  });
}

export interface SaveFileResult {
  ok: boolean;
  folderPath: string;
  fileName: string;
  filename: string;
  blob?: Blob;
  fileBlob?: Blob;
}

/**
 * Triggers a direct file download in the browser or Android WebView
 */
export function triggerDirectDownload(
  fileName: string,
  content: Blob | string,
  mimeType: string = 'application/octet-stream'
): SaveFileResult {
  return saveFileToGpsChambaiFolder(fileName, content, mimeType);
}

/**
 * Saves any Blob/DataURL/String to the phone's "GPS Chambai" folder AND persists in StorageFolderService
 */
export function saveFileToGpsChambaiFolder(
  fileNameOrBlob: any,
  contentOrFileName: any = '',
  mimeTypeOrFolder: any = 'application/octet-stream',
  subFolder: any = 'GPS Chambai/PDF & Print Records/Export PDF',
  moduleName: string = 'General'
): SaveFileResult {
  // Handle (subFolder, fileName, blobOrContent, mimeType) signature when 3rd arg is Blob/dataUrl
  if (
    typeof fileNameOrBlob === 'string' &&
    typeof contentOrFileName === 'string' &&
    (mimeTypeOrFolder instanceof Blob ||
      (typeof mimeTypeOrFolder === 'string' && mimeTypeOrFolder.startsWith('data:')))
  ) {
    const actualFolder = fileNameOrBlob;
    const actualFile = contentOrFileName;
    const actualContent = mimeTypeOrFolder;
    const actualMime =
      typeof subFolder === 'string' && !subFolder.startsWith('GPS Chambai')
        ? subFolder
        : actualContent instanceof Blob
        ? actualContent.type || 'application/octet-stream'
        : 'application/octet-stream';
    return saveFileToGpsChambaiFolder(
      actualFile,
      actualContent,
      actualMime,
      actualFolder,
      moduleName
    );
  }

  const isFirstBlob = fileNameOrBlob instanceof Blob;
  const fileName = isFirstBlob
    ? typeof contentOrFileName === 'string'
      ? contentOrFileName
      : 'Export.pdf'
    : fileNameOrBlob;
  const content: Blob | string = isFirstBlob ? fileNameOrBlob : contentOrFileName;
  const mimeType = isFirstBlob
    ? fileNameOrBlob.type || 'application/pdf'
    : typeof mimeTypeOrFolder === 'string'
    ? mimeTypeOrFolder
    : 'application/octet-stream';
  const effectiveSubFolder = isFirstBlob ? mimeTypeOrFolder : subFolder;

  const cleanName = typeof fileName === 'string' && fileName.length > 0 ? fileName : 'Export.pdf';
  const sanitizedName = cleanName.replace(/[/\\?%*:|"<>]/g, '_');
  const resolvedSubFolder =
    typeof effectiveSubFolder === 'string'
      ? effectiveSubFolder
      : effectiveSubFolder?.folderSubPath || 'GPS Chambai/PDF & Print Records/Export PDF';
  const resolvedModule =
    typeof effectiveSubFolder === 'object' && effectiveSubFolder?.moduleSource
      ? effectiveSubFolder.moduleSource
      : moduleName;
  const targetFolder = resolvedSubFolder.startsWith('GPS Chambai')
    ? resolvedSubFolder
    : `GPS Chambai/${resolvedSubFolder.replace(/^\/+/, '')}`;
  const folderPath = `${targetFolder}/${sanitizedName}`;

  try {
    StorageFolderService.saveFileToFolder({
      folderPath: targetFolder,
      fileName: sanitizedName,
      dataUrlOrContent: content,
      mimeType,
      moduleName: resolvedModule,
    }).catch(() => {});

    if (typeof content === 'string' && content.startsWith('data:')) {
      if (window.AndroidBridge?.saveBase64File) {
        const base64 = content.split(',')[1] || '';
        window.AndroidBridge.saveBase64File(base64, folderPath, mimeType);
      }
      const link = document.createElement('a');
      link.href = content;
      link.download = sanitizedName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return { ok: true, folderPath, fileName: sanitizedName, filename: sanitizedName };
    }

    const blob: Blob =
      typeof content === 'string' ? new Blob([content], { type: mimeType }) : content;

    if (window.AndroidBridge?.saveBase64File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = ((reader.result as string) || '').split(',')[1] || '';
        window.AndroidBridge?.saveBase64File?.(base64, folderPath, mimeType);
      };
      reader.readAsDataURL(blob);
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = sanitizedName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
    return {
      ok: true,
      folderPath,
      fileName: sanitizedName,
      filename: sanitizedName,
      blob,
      fileBlob: blob,
    };
  } catch (error) {
    console.error('Error saving file to GPS Chambai:', error);
    return { ok: false, folderPath, fileName: sanitizedName, filename: sanitizedName };
  }
}

export const saveFileToModuleFolder = saveFileToGpsChambaiFolder;

function buildHtmlTableFromHeadersAndRows(headers: string[], rows: string[][]): string {
  const ths = headers.map((h) => `<th>${h}</th>`).join('');
  const trs = rows
    .map((r) => `<tr>${r.map((c) => `<td>${c ?? ''}</td>`).join('')}</tr>`)
    .join('');
  return `<table><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
}

/**
 * Renders any HTML string or DOM Element into a high-resolution PDF Blob or JPEG DataURL
 * using html2canvas + jsPDF so that Jameel Noori Nastaleeq Urdu ligatures, custom borders,
 * logos, signatures, and tables match Print Preview 100%.
 */
export async function renderHtmlOrElementToVisualCanvas(
  htmlOrElement: string | HTMLElement,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Promise<HTMLCanvasElement> {
  if (typeof htmlOrElement !== 'string') {
    return await html2canvas(htmlOrElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
    });
  }

  const container = document.createElement('div');
  const widthPx = orientation === 'landscape' ? 1122 : 794;
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = `${widthPx}px`;
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.padding = '16px';
  container.style.zIndex = '-100';
  container.style.fontFamily =
    "'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', sans-serif";

  // Extract body & style if full HTML document
  const styleMatches = htmlOrElement.match(/<style[^>]*>([\s\S]*?)<\/style>/gi) || [];
  const bodyMatch = htmlOrElement.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const innerContent = bodyMatch ? bodyMatch[1] : htmlOrElement;

  container.innerHTML = `<style>${JAMEEL_NOORI_PRINT_CSS}</style>${styleMatches.join('\n')}<div class="visual-print-root">${innerContent}</div>`;
  document.body.appendChild(container);

  // Wait briefly for images and fonts
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
          setTimeout(res, 600);
        })
    )
  );

  try {
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: widthPx,
      windowWidth: widthPx,
      logging: false,
    });
    return canvas;
  } finally {
    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }
  }
}

/**
 * Converts a rendered HTMLCanvasElement into a multi-page or single-page A4 jsPDF Blob
 */
export function canvasToPdfBlob(
  canvas: HTMLCanvasElement,
  orientation: 'portrait' | 'landscape' = 'portrait'
): Blob {
  const isLandscape = orientation === 'landscape';
  const pdf = new jsPDF({
    orientation: isLandscape ? 'l' : 'p',
    unit: 'mm',
    format: 'a4',
  });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 5;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const imgPropsWidth = canvas.width;
  const imgPropsHeight = canvas.height;
  const renderedHeight = (imgPropsHeight * usableWidth) / imgPropsWidth;

  if (renderedHeight <= usableHeight * 1.08) {
    const fitScale = Math.min(1, usableHeight / renderedHeight);
    const finalW = usableWidth * fitScale;
    const finalH = renderedHeight * fitScale;
    const offsetX = (pageWidth - finalW) / 2;
    pdf.addImage(imgData, 'JPEG', offsetX, margin, finalW, finalH);
  } else {
    let heightLeft = renderedHeight;
    let position = margin;
    pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, renderedHeight);
    heightLeft -= usableHeight;

    while (heightLeft > 5) {
      position = heightLeft - renderedHeight + margin;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', margin, position, usableWidth, renderedHeight);
      heightLeft -= usableHeight;
    }
  }

  return pdf.output('blob');
}

/**
 * Exports any HTML string or DOM element to a high-fidelity visual PDF file matching Print Preview
 */
export async function exportVisualHtmlToPdf(
  title: string,
  htmlOrElement: string | HTMLElement,
  options: {
    orientation?: 'portrait' | 'landscape';
    includeHeader?: boolean;
    customFileName?: string;
    subFolder?: string;
    moduleName?: string;
  } = {}
): Promise<SaveFileResult> {
  const orientation = options.orientation || 'portrait';
  const includeHeader = options.includeHeader ?? true;
  const subFolder = options.subFolder || 'GPS Chambai/PDF & Print Records/Export PDF';
  const moduleName = options.moduleName || 'Universal Print Engine';

  const source =
    typeof htmlOrElement === 'string'
      ? buildOfficialPrintHtml(title, htmlOrElement, orientation, includeHeader)
      : htmlOrElement;

  const canvas = await renderHtmlOrElementToVisualCanvas(source, orientation);
  const pdfBlob = canvasToPdfBlob(canvas, orientation);
  const safeFile =
    options.customFileName ||
    `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  return saveFileToGpsChambaiFolder(safeFile, pdfBlob, 'application/pdf', subFolder, moduleName);
}

/**
 * Exports any HTML string or DOM element to a high-resolution JPG image file matching Print Preview
 */
export async function exportVisualHtmlToJpg(
  title: string,
  htmlOrElement: string | HTMLElement,
  options: {
    orientation?: 'portrait' | 'landscape';
    includeHeader?: boolean;
    customFileName?: string;
    subFolder?: string;
    moduleName?: string;
  } = {}
): Promise<SaveFileResult> {
  const orientation = options.orientation || 'portrait';
  const includeHeader = options.includeHeader ?? true;
  const subFolder = options.subFolder || 'GPS Chambai/PDF & Print Records/Export PDF';
  const moduleName = options.moduleName || 'Universal Print Engine';

  const source =
    typeof htmlOrElement === 'string'
      ? buildOfficialPrintHtml(title, htmlOrElement, orientation, includeHeader)
      : htmlOrElement;

  const canvas = await renderHtmlOrElementToVisualCanvas(source, orientation);
  const jpgDataUrl = canvas.toDataURL('image/jpeg', 0.95);
  const safeFile =
    options.customFileName ||
    `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.jpg`;

  return saveFileToGpsChambaiFolder(safeFile, jpgDataUrl, 'image/jpeg', subFolder, moduleName);
}

/**
 * Exports any HTML table / document as an Excel (.xls) spreadsheet with Jameel Noori Nastaleeq support
 */
export function exportAndSaveExcelXls(
  title: string,
  bodyHtml: string,
  subFolder: string = 'GPS Chambai/Documents',
  moduleName: string = 'Excel Export'
): SaveFileResult {
  const excelHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8" />
  <title>${title}</title>
  <style>
    ${JAMEEL_NOORI_PRINT_CSS}
    body, table, td, th {
      font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Calibri', sans-serif;
      font-size: 11pt;
    }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #334155; padding: 6px 8px; }
  </style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
  const blob = new Blob(['\ufeff', excelHtml], {
    type: 'application/vnd.ms-excel;charset=utf-8',
  });
  const safeFile = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.xls`;
  return saveFileToGpsChambaiFolder(safeFile, blob, 'application/vnd.ms-excel', subFolder, moduleName);
}

/**
 * Directly generates & saves a real binary .pdf file to the specified GPS Chambai subfolder.
 * Supports:
 * 1) (title, bodyHtml, orientation/options, subFolder, moduleName)
 * 2) (title, headers[], rows[][], fileName, subFolder)
 */
export function exportAndSaveRealPdf(
  title: string,
  bodyHtmlOrHeaders: string | string[],
  arg3: any = 'portrait',
  arg4: any = 'GPS Chambai/PDF & Print Records/Export PDF',
  arg5: string = 'General'
): SaveFileResult {
  if (Array.isArray(bodyHtmlOrHeaders)) {
    const tableHtml = buildHtmlTableFromHeadersAndRows(
      bodyHtmlOrHeaders,
      Array.isArray(arg3) ? arg3 : []
    );
    const customFileName = typeof arg4 === 'string' && arg4.endsWith('.pdf') ? arg4 : '';
    const subFolder =
      typeof arg5 === 'string' && arg5 !== 'General'
        ? arg5
        : 'GPS Chambai/PDF & Print Records/Export PDF';
    const fullHtml = buildOfficialPrintHtml(title, tableHtml, 'portrait', true);
    const safeFile =
      customFileName ||
      `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (containsUrduText(tableHtml) || containsUrduText(title)) {
      exportVisualHtmlToPdf(title, fullHtml, {
        orientation: 'portrait',
        includeHeader: false,
        customFileName: safeFile,
        subFolder,
        moduleName: 'General',
      }).catch(() => {});
      return {
        ok: true,
        folderPath: `${subFolder}/${safeFile}`,
        fileName: safeFile,
        filename: safeFile,
      };
    }

    const pdfBlob = generateRealPdfBlobFromHtml(title, fullHtml, 'portrait');
    return saveFileToGpsChambaiFolder(safeFile, pdfBlob, 'application/pdf', subFolder, 'General');
  }

  const bodyHtml = bodyHtmlOrHeaders;
  if (arg3 && typeof arg3 === 'object') {
    const orientation: 'portrait' | 'landscape' = arg3.landscape ? 'landscape' : 'portrait';
    const includeHeader = arg3.includeHeader !== undefined ? arg3.includeHeader : !isStandaloneCustomDocument(bodyHtml);
    const subFolder = arg3.folderSubPath || 'GPS Chambai/PDF & Print Records/Export PDF';
    const moduleName = arg3.moduleSource || 'General';
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, orientation, includeHeader);
    const safeFile = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

    if (
      containsUrduText(bodyHtml) ||
      isStandaloneCustomDocument(bodyHtml) ||
      bodyHtml.includes('<img') ||
      bodyHtml.includes('border:')
    ) {
      exportVisualHtmlToPdf(title, fullHtml, {
        orientation,
        includeHeader: false,
        customFileName: safeFile,
        subFolder,
        moduleName,
      }).catch(() => {});
      return {
        ok: true,
        folderPath: `${subFolder}/${safeFile}`,
        fileName: safeFile,
        filename: safeFile,
      };
    }

    const pdfBlob = generateRealPdfBlobFromHtml(title, fullHtml, orientation);
    return saveFileToGpsChambaiFolder(safeFile, pdfBlob, 'application/pdf', subFolder, moduleName);
  }

  const isArg3Orientation = arg3 === 'portrait' || arg3 === 'landscape';
  const orientation: 'portrait' | 'landscape' = isArg3Orientation
    ? (arg3 as 'portrait' | 'landscape')
    : arg4 === 'landscape'
    ? 'landscape'
    : 'portrait';
  const customFileName =
    typeof arg3 === 'string' && !isArg3Orientation && arg3.endsWith('.pdf') ? arg3 : '';
  const subFolder =
    arg4 && typeof arg4 === 'object'
      ? arg4.folderSubPath || 'GPS Chambai/PDF & Print Records/Export PDF'
      : isArg3Orientation
      ? arg4
      : arg5 || 'GPS Chambai/PDF & Print Records/Export PDF';
  const moduleName =
    arg4 && typeof arg4 === 'object'
      ? arg4.moduleSource || 'General'
      : isArg3Orientation
      ? arg5
      : 'General';

  const includeHeader =
    arg4 && typeof arg4 === 'object' && arg4.includeHeader !== undefined
      ? arg4.includeHeader
      : !isStandaloneCustomDocument(bodyHtml);

  const fullHtml = buildOfficialPrintHtml(title, bodyHtml, orientation, includeHeader);
  const safeFile =
    customFileName ||
    `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

  if (
    containsUrduText(bodyHtml) ||
    isStandaloneCustomDocument(bodyHtml) ||
    bodyHtml.includes('<img') ||
    bodyHtml.includes('border:')
  ) {
    exportVisualHtmlToPdf(title, fullHtml, {
      orientation,
      includeHeader: false,
      customFileName: safeFile,
      subFolder,
      moduleName,
    }).catch(() => {});
    return {
      ok: true,
      folderPath: `${subFolder}/${safeFile}`,
      fileName: safeFile,
      filename: safeFile,
    };
  }

  const pdfBlob = generateRealPdfBlobFromHtml(title, fullHtml, orientation);
  return saveFileToGpsChambaiFolder(safeFile, pdfBlob, 'application/pdf', subFolder, moduleName);
}

/**
 * Directly generates & saves a Word (.doc) file to the specified GPS Chambai subfolder.
 */
export function exportAndSaveWordDoc(
  title: string,
  bodyHtml: string,
  arg3: any = 'portrait',
  arg4: any = 'GPS Chambai/Documents',
  arg5: string = 'General'
): SaveFileResult {
  if (arg3 && typeof arg3 === 'object') {
    const orientation: 'portrait' | 'landscape' = arg3.landscape ? 'landscape' : 'portrait';
    const includeHeader =
      arg3.includeHeader !== undefined ? arg3.includeHeader : !isStandaloneCustomDocument(bodyHtml);
    const subFolder = arg3.folderSubPath || 'GPS Chambai/Documents';
    const moduleName = arg3.moduleSource || 'General';
    const fullHtml = buildOfficialPrintHtml(title, bodyHtml, orientation, includeHeader);
    const docBlob = generateWordDocBlobFromHtml(title, fullHtml);
    const safeFile = `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
    return saveFileToGpsChambaiFolder(safeFile, docBlob, 'application/msword', subFolder, moduleName);
  }

  const isArg3Orientation = arg3 === 'portrait' || arg3 === 'landscape';
  const orientation: 'portrait' | 'landscape' = isArg3Orientation
    ? (arg3 as 'portrait' | 'landscape')
    : 'portrait';
  const customFileName =
    typeof arg3 === 'string' &&
    !isArg3Orientation &&
    (arg3.endsWith('.doc') || arg3.endsWith('.docx'))
      ? arg3
      : '';
  const subFolder =
    arg4 && typeof arg4 === 'object'
      ? arg4.folderSubPath || 'GPS Chambai/Documents'
      : isArg3Orientation
      ? arg4
      : arg4 || 'GPS Chambai/Documents';
  const moduleName =
    arg4 && typeof arg4 === 'object'
      ? arg4.moduleSource || 'General'
      : isArg3Orientation
      ? arg5
      : 'General';

  const includeHeader =
    arg4 && typeof arg4 === 'object' && arg4.includeHeader !== undefined
      ? arg4.includeHeader
      : !isStandaloneCustomDocument(bodyHtml);

  const fullHtml = buildOfficialPrintHtml(title, bodyHtml, orientation, includeHeader);
  const docBlob = generateWordDocBlobFromHtml(title, fullHtml);
  const safeFile =
    customFileName ||
    `${title.replace(/[^a-zA-Z0-9_-]/g, '_')}_${new Date().toISOString().split('T')[0]}.doc`;
  return saveFileToGpsChambaiFolder(safeFile, docBlob, 'application/msword', subFolder, moduleName);
}

/**
 * Universal Share helper for PDF/Images/Text (uses Web Share API on Android/iOS or WhatsApp fallback)
 */
export async function shareDocumentOrFile(params: {
  title: string;
  text: string;
  blob?: Blob;
  fileBlob?: Blob;
  fileName?: string;
  filename?: string;
  dataUrl?: string;
  mimeType?: string;
}): Promise<boolean> {
  try {
    let fileToShare: File | null = null;
    const resolvedBlob = params.blob || params.fileBlob;
    const resolvedName = params.fileName || params.filename;
    if (resolvedBlob && resolvedName) {
      fileToShare = new File([resolvedBlob], resolvedName, {
        type: params.mimeType || resolvedBlob.type || 'application/pdf',
      });
    } else if (params.dataUrl && resolvedName) {
      const res = await fetch(params.dataUrl);
      const b = await res.blob();
      fileToShare = new File([b], resolvedName, { type: params.mimeType || b.type });
    }

    if (navigator.share) {
      if (fileToShare && navigator.canShare && navigator.canShare({ files: [fileToShare] })) {
        await navigator.share({
          title: params.title,
          text: params.text,
          files: [fileToShare],
        });
        return true;
      }
      await navigator.share({
        title: params.title,
        text: `${params.title}\n${params.text}`,
      });
      return true;
    }
  } catch {
    // User cancelled or Web Share unsupported -> fallback to WhatsApp
  }

  const encoded = encodeURIComponent(`*${params.title}*\n${params.text}`);
  window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noopener,noreferrer');
  return true;
}

/**
 * Universal File Upload Helper supporting JPG, JPEG, PNG, WEBP, PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MP4, MOV
 * Automatically compresses high-resolution camera photos so localStorage never exceeds quota.
 */
export const SUPPORTED_UPLOAD_ACCEPT =
  '.jpg,.jpeg,.png,.webp,.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain';

export function readFileAsDataUrl(
  file: File,
  targetFolder?: string | { folderSubPath?: string; moduleSource?: string },
  moduleName: string = 'Upload'
): Promise<{
  name: string;
  fileName: string;
  filename: string;
  sizeFormatted: string;
  sizeLabel: string;
  mimeType: string;
  dataUrl: string;
  fileTypeBadge: string;
  fileId?: string;
}> {
  return new Promise((resolve, reject) => {
    const ext = (file.name.split('.').pop() || '').toUpperCase();
    const fileTypeBadge = ext || 'FILE';
    const kb = file.size / 1024;
    const sizeFormatted =
      kb >= 1024 ? `${(kb / 1024).toFixed(2)} MB` : `${Math.max(1, Math.round(kb))} KB`;

    const isImage =
      file.type.startsWith('image/') ||
      ['JPG', 'JPEG', 'PNG', 'WEBP'].includes(ext);

    const resolvedFolder =
      typeof targetFolder === 'string'
        ? targetFolder
        : targetFolder?.folderSubPath;
    const resolvedModule =
      typeof targetFolder === 'object' && targetFolder?.moduleSource
        ? targetFolder.moduleSource
        : moduleName;

    const finalize = async (dataUrl: string, mimeType: string) => {
      let savedId: string | undefined;
      if (resolvedFolder) {
        try {
          const entry = await StorageFolderService.saveFileToFolder({
            folderPath: resolvedFolder,
            fileName: file.name,
            dataUrlOrContent: dataUrl,
            mimeType,
            moduleName: resolvedModule,
          });
          savedId = entry.id;
        } catch {
          // ignore
        }
      }
      resolve({
        name: file.name,
        fileName: file.name,
        filename: file.name,
        sizeFormatted,
        sizeLabel: sizeFormatted,
        mimeType,
        dataUrl,
        fileTypeBadge,
        fileId: savedId,
      });
    };

    const reader = new FileReader();
    reader.onload = () => {
      const rawDataUrl = reader.result as string;
      // If it's a large camera photo (> 450KB), resize to max 900px so it saves smoothly in localStorage & IndexedDB
      if (isImage && file.size > 450 * 1024) {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          let w = img.width;
          let h = img.height;
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
            ctx.drawImage(img, 0, 0, w, h);
            const compressed = canvas.toDataURL('image/jpeg', 0.84);
            finalize(compressed, 'image/jpeg');
            return;
          }
          finalize(rawDataUrl, file.type || 'image/jpeg');
        };
        img.onerror = () => finalize(rawDataUrl, file.type || 'image/jpeg');
        img.src = rawDataUrl;
      } else {
        finalize(rawDataUrl, file.type || 'application/octet-stream');
      }
    };
    reader.onerror = () => reject(new Error('Failed to read selected file'));
    reader.readAsDataURL(file);
  });
}

export interface ReportCardRenderInput {
  studentName?: string;
  fatherName?: string;
  rollNo?: string;
  className?: string;
  classHex?: string;
  examTerm?: string;
  termLabel?: string;
  examName?: string;
  examDate?: string;
  academicYear?: string;
  session?: string;
  subjects?: {
    subjectName?: string;
    subject?: string;
    totalMarks?: number;
    total?: number;
    maxMarks?: number;
    obtainedMarks?: number;
    obtained?: number;
    inWords?: string;
  }[];
  subjectMarks?: { subject: string; maxMarks: number; obtainedMarks: number }[];
  totalMarks?: number;
  totalMaxMarks?: number;
  obtainedMarks?: number;
  totalObtainedMarks?: number;
  percentage?: number;
  grade?: string;
  positionInClass?: string | number;
  isPassed?: boolean;
  remarks?: string;
  remarksText?: string;
  checkedBy?: string;
  dated?: string;
}

/**
 * First Report Card JPG Generator (HTML5 Canvas -> image/jpeg)
 */
export function generateReportCardJpgDataUrl(
  result: ReportCardRenderInput | ExamResult,
  student?: Student,
  classNameArg?: string,
  classHexArg?: string
): string {
  const settings = StorageService.getSettings();
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 1600;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const r = result as ReportCardRenderInput;
  const studentName = r.studentName || student?.name || 'Registered Student';
  const fatherName = r.fatherName || student?.fatherName || '—';
  const rollNo = r.rollNo || student?.rollNo || '01';
  const className = r.className || classNameArg || 'Primary Class';
  const classHex = r.classHex || classHexArg || '#00B050';
  const examTerm = r.examTerm || r.examName || 'Annual Examination';
  const academicYear = r.academicYear || settings.academicYear || '2026-27';
  const totalMax = r.totalMarks ?? r.totalMaxMarks ?? 500;
  const totalObt = r.obtainedMarks ?? r.totalObtainedMarks ?? 0;
  const pctVal = r.percentage ?? (totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0);
  const isPassed = r.isPassed !== undefined ? r.isPassed : pctVal >= 33;

  const subjectList = (r.subjects || r.subjectMarks || []).map((s: any) => ({
    name: s.subjectName || s.subject || 'Subject',
    max: Number(s.totalMarks ?? s.total ?? s.maxMarks ?? 100),
    obtained: Number(s.obtainedMarks ?? s.obtained ?? 0),
  }));

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#065f46';
  ctx.lineWidth = 8;
  ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

  ctx.strokeStyle = classHex;
  ctx.lineWidth = 3;
  ctx.strokeRect(44, 44, canvas.width - 88, canvas.height - 88);

  const grad = ctx.createLinearGradient(50, 50, canvas.width - 50, 230);
  grad.addColorStop(0, '#064e3b');
  grad.addColorStop(1, '#047857');
  ctx.fillStyle = grad;
  ctx.fillRect(50, 50, canvas.width - 100, 185);

  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.font = '800 34px sans-serif';
  ctx.fillText('GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT', canvas.width / 2, 115);

  ctx.fillStyle = '#A7F3D0';
  ctx.font = '600 20px sans-serif';
  ctx.fillText(
    'Elementary & Secondary Education Department, Khyber Pakhtunkhwa · EMIS: 16454',
    canvas.width / 2,
    152
  );

  ctx.fillStyle = '#FBBF24';
  ctx.fillRect(canvas.width / 2 - 230, 172, 460, 44);
  ctx.fillStyle = '#0F172A';
  ctx.font = '800 22px sans-serif';
  ctx.fillText(`OFFICIAL RESULT REPORT CARD (${academicYear})`, canvas.width / 2, 202);

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(70, 265, canvas.width - 140, 195);
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 2;
  ctx.strokeRect(70, 265, canvas.width - 140, 195);

  ctx.fillStyle = classHex;
  ctx.fillRect(70, 265, 14, 195);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = '700 22px sans-serif';
  ctx.fillText(`Student Name: ${studentName}`, 105, 310);
  ctx.fillText(`Father's Name: ${fatherName}`, 105, 355);
  ctx.fillText(`Class / Grade: ${className}`, 105, 400);
  ctx.fillText(`Examination: ${examTerm}`, 105, 442);

  ctx.fillText(`Roll Number: ${rollNo}`, 680, 310);
  ctx.fillText(`Session: ${academicYear}`, 680, 355);
  ctx.fillText(`Class Position: ${r.positionInClass || 'Merit'}`, 680, 400);
  ctx.fillText(`School EMIS: 16454 (Chambai Kohat)`, 680, 442);

  let y = 500;
  ctx.fillStyle = '#1E293B';
  ctx.fillRect(70, y, canvas.width - 140, 56);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 20px sans-serif';
  ctx.fillText('S.No', 95, y + 35);
  ctx.fillText('Subject / Paper', 190, y + 35);
  ctx.fillText('Max Marks', 620, y + 35);
  ctx.fillText('Obtained Marks', 800, y + 35);
  ctx.fillText('Percentage', 1000, y + 35);

  y += 56;
  subjectList.forEach((sub, idx) => {
    ctx.fillStyle = idx % 2 === 0 ? '#FFFFFF' : '#F1F5F9';
    ctx.fillRect(70, y, canvas.width - 140, 54);
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1;
    ctx.strokeRect(70, y, canvas.width - 140, 54);

    ctx.fillStyle = '#0F172A';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(String(idx + 1).padStart(2, '0'), 95, y + 34);
    ctx.fillText(sub.name, 190, y + 34);
    ctx.fillText(String(sub.max), 650, y + 34);
    ctx.font = '700 20px sans-serif';
    ctx.fillText(String(sub.obtained), 840, y + 34);
    const subPct = sub.max > 0 ? Math.round((sub.obtained / sub.max) * 100) : 0;
    ctx.fillText(`${subPct}%`, 1020, y + 34);
    y += 54;
  });

  ctx.fillStyle = '#ECFDF5';
  ctx.fillRect(70, y, canvas.width - 140, 64);
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 2;
  ctx.strokeRect(70, y, canvas.width - 140, 64);

  ctx.fillStyle = '#064E3B';
  ctx.font = '800 23px sans-serif';
  ctx.fillText('GRAND TOTAL', 190, y + 40);
  ctx.fillText(String(totalMax), 650, y + 40);
  ctx.fillText(String(totalObt), 840, y + 40);
  ctx.fillText(`${r.percentage}%`, 1010, y + 40);

  y += 100;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(70, y, canvas.width - 140, 120);
  ctx.strokeStyle = '#CBD5E1';
  ctx.strokeRect(70, y, canvas.width - 140, 120);

  ctx.fillStyle = '#0F172A';
  ctx.font = '800 26px sans-serif';
  ctx.fillText(`Overall Grade: ${r.grade}`, 110, y + 52);

  ctx.fillStyle = isPassed ? '#059669' : '#DC2626';
  ctx.fillText(
    `Result Status: ${isPassed ? 'PASSED / PROMOTED' : 'NEEDS IMPROVEMENT'}`,
    470,
    y + 52
  );

  ctx.fillStyle = '#334155';
  ctx.font = '600 20px sans-serif';
  ctx.fillText(
    `Teacher Remarks: ${r.remarks || 'Good academic effort and discipline.'}`,
    110,
    y + 95
  );

  const sigY = 1470;
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, sigY);
  ctx.lineTo(360, sigY);
  ctx.moveTo(470, sigY);
  ctx.lineTo(730, sigY);
  ctx.moveTo(840, sigY);
  ctx.lineTo(1100, sigY);
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.fillStyle = '#1E293B';
  ctx.font = '700 18px sans-serif';
  ctx.fillText('Class Teacher Signature', 230, sigY + 32);
  ctx.fillText('Parent / Guardian Signature', 600, sigY + 32);
  ctx.fillText('Headmaster Stamp & Sign', 970, sigY + 32);

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * Second Report Card (DMC - Detailed Marks Certificate) JPG Generator
 * Reproduces the exact layout and colors of Reference Image 017
 */
export function generateSecondDmcReportCardJpgDataUrl(input: ReportCardRenderInput): string {
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  canvas.height = 1754;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Outer black border matching Image 017
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

  // Faint repeating text background pattern ("GPS CHAMBAI KOHAT")
  ctx.save();
  ctx.fillStyle = 'rgba(14, 165, 233, 0.07)';
  ctx.font = '700 11px sans-serif';
  for (let py = 42; py < canvas.height - 30; py += 16) {
    let lineStr = '';
    for (let px = 0; px < 14; px++) {
      lineStr += 'GPS CHAMBAI KOHAT   ';
    }
    ctx.fillText(lineStr, 28, py);
  }
  ctx.restore();

  // Central Watermark Crest (Image 031 Emblem)
  ctx.save();
  ctx.globalAlpha = 0.09;
  ctx.strokeStyle = '#1E88E5';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(canvas.width / 2, 930, 310, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = '#009639';
  ctx.fillRect(canvas.width / 2 - 110, 880, 220, 120);
  ctx.fillStyle = '#E91E63';
  ctx.font = '900 52px serif';
  ctx.textAlign = 'center';
  ctx.fillText('GPS CHAMBAI KOHAT', canvas.width / 2, 1170);
  ctx.restore();

  // Top-left School Crest Emblem (Exact Uploaded Image 031 Design)
  ctx.save();
  const crestX = 235;
  const crestY = 275;

  // Blue Crescent and Star at top of Crest (Image 031)
  ctx.fillStyle = '#1E88E5';
  ctx.beginPath();
  ctx.arc(crestX, crestY - 95, 28, 0.2 * Math.PI, 1.8 * Math.PI);
  ctx.fill();
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.arc(crestX + 7, crestY - 100, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1E88E5';
  ctx.font = '900 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('★', crestX + 8, crestY - 94);

  // Blue Laurel Wreath Ring (Image 031)
  ctx.beginPath();
  ctx.arc(crestX, crestY, 108, 0.15 * Math.PI, 0.85 * Math.PI, true);
  ctx.lineWidth = 10;
  ctx.strokeStyle = '#1E88E5';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(crestX, crestY, 96, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = '#1E88E5';
  ctx.stroke();

  // Green Open Book & Candle with Yellow-Orange Flame & Black Rays (Image 031)
  ctx.strokeStyle = '#111827';
  ctx.lineWidth = 2.5;
  for (let angle = -150; angle <= -30; angle += 20) {
    const rad = (angle * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(crestX + Math.cos(rad) * 24, crestY - 25 + Math.sin(rad) * 24);
    ctx.lineTo(crestX + Math.cos(rad) * 52, crestY - 25 + Math.sin(rad) * 52);
    ctx.stroke();
  }
  ctx.fillStyle = '#009639';
  ctx.fillRect(crestX - 6, crestY - 22, 12, 36);
  ctx.fillStyle = '#FF8F00';
  ctx.beginPath();
  ctx.arc(crestX, crestY - 34, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#FFEB3B';
  ctx.beginPath();
  ctx.arc(crestX, crestY - 33, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#009639';
  ctx.beginPath();
  ctx.moveTo(crestX, crestY + 12);
  ctx.lineTo(crestX - 62, crestY - 4);
  ctx.lineTo(crestX - 62, crestY + 46);
  ctx.lineTo(crestX, crestY + 60);
  ctx.lineTo(crestX + 62, crestY + 46);
  ctx.lineTo(crestX + 62, crestY - 4);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Magenta-Pink Ribbon Banner under crest ("GPS CHAMBAI KOHAT" — Image 031)
  ctx.fillStyle = '#E91E63';
  ctx.fillRect(crestX - 138, crestY + 86, 276, 38);
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 19px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GPS CHAMBAI KOHAT', crestX, crestY + 111);
  ctx.restore();

  // Top-Right School Headings (matching Image 017 exact colors & typography)
  ctx.textAlign = 'center';
  const titleX = 755;

  // "Govt Primary School" with Red->Green->Blue gradient
  const titleGrad = ctx.createLinearGradient(420, 120, 1090, 120);
  titleGrad.addColorStop(0, '#e11d48');
  titleGrad.addColorStop(0.5, '#16a34a');
  titleGrad.addColorStop(1, '#0284c7');
  ctx.fillStyle = titleGrad;
  ctx.font = '900 64px Georgia, serif';
  ctx.fillText('Govt Primary School', titleX, 185);

  ctx.fillStyle = '#000000';
  ctx.font = '900 58px Georgia, serif';
  ctx.fillText('Chambai Kohat', titleX, 265);

  ctx.fillStyle = '#e11d48';
  ctx.font = '800 30px sans-serif';
  ctx.fillText('DETAILED MARKS CERTIFICATE', titleX, 328);

  ctx.fillStyle = '#16a34a';
  ctx.font = '800 32px sans-serif';
  ctx.fillText(`CLASS  ${input.className || '________'}`, titleX - 20, 385);

  ctx.fillStyle = '#0284c7';
  ctx.font = '800 30px sans-serif';
  const sessionStr = input.academicYear || '2026 / 27';
  const termStr = input.examTerm || 'Final';
  ctx.fillText(`Session ${sessionStr}   ${termStr} Term`, titleX, 442);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 28px sans-serif';
  ctx.fillText(`Roll No.  ${input.rollNo || '____'}`, 1140, 495);

  // Student Name, Father Name, Institution lines
  ctx.textAlign = 'left';
  ctx.fillStyle = '#0f172a';
  ctx.font = '700 22px sans-serif';
  ctx.fillText(`Name:  ${input.studentName || ''}`, 90, 565);
  ctx.beginPath();
  ctx.moveTo(165, 570);
  ctx.lineTo(565, 570);
  ctx.stroke();

  ctx.fillText(`Father Name:  ${input.fatherName || ''}`, 580, 565);
  ctx.beginPath();
  ctx.moveTo(735, 570);
  ctx.lineTo(1140, 570);
  ctx.stroke();

  ctx.fillText('District/Institution:', 90, 615);
  ctx.beginPath();
  ctx.moveTo(295, 620);
  ctx.lineTo(1140, 620);
  ctx.stroke();

  ctx.fillStyle = '#e11d48';
  ctx.font = '800 30px Georgia, serif';
  ctx.fillText('Govt Primary School Chambai Kohat', 475, 612);

  // 9 Subjects Marks Table matching Image 017
  const tableX = 85;
  const tableY = 648;
  const tableW = 1060;
  const colWidths = [240, 190, 190, 440]; // Subjects | Total Marks | Obtained Marks | In Words
  const headerH = 95;
  const rowH = 54;

  const defaultNineSubjects = [
    '1. English',
    '2. Urdu',
    '3. Mathematics',
    '4. G - Science',
    '5. Pashto',
    '6. Pak Study',
    '7. Islamyat',
    '8. Nazra',
    '9. Drawing',
  ];

  const rowsData = defaultNineSubjects.map((defaultLabel, idx) => {
    const matched = (input.subjects || [])[idx];
    const max = matched ? Number(matched.totalMarks ?? matched.total ?? 100) : 100;
    const obt = matched ? Number(matched.obtainedMarks ?? matched.obtained ?? 0) : 0;
    const words = matched?.inWords || (obt > 0 ? numberToWordsEn(obt) : '—');
    return {
      label: matched?.subject || matched?.subjectName || defaultLabel,
      max,
      obt,
      words,
    };
  });

  // Draw Table Header
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(tableX, tableY, tableW, headerH + rowH * 9);

  // Vertical column lines
  let cx = tableX;
  colWidths.forEach((w, i) => {
    if (i < colWidths.length - 1) {
      cx += w;
      ctx.beginPath();
      ctx.moveTo(cx, tableY);
      ctx.lineTo(cx, tableY + headerH + rowH * 9);
      ctx.stroke();
    }
  });

  // Header split line in Total Marks & Obtained Marks
  ctx.beginPath();
  ctx.moveTo(tableX + colWidths[0], tableY + 46);
  ctx.lineTo(tableX + colWidths[0] + colWidths[1] + colWidths[2], tableY + 46);
  ctx.stroke();

  // Horizontal line below header
  ctx.beginPath();
  ctx.moveTo(tableX, tableY + headerH);
  ctx.lineTo(tableX + tableW, tableY + headerH);
  ctx.stroke();

  // Header Labels (Green bold matching Image 017)
  ctx.fillStyle = '#16a34a';
  ctx.font = '800 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Subjects', tableX + 20, tableY + 60);

  ctx.font = '800 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Total Marks', tableX + colWidths[0] + colWidths[1] / 2, tableY + 30);
  ctx.fillText(
    'Obtained Marks',
    tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
    tableY + 30
  );

  ctx.font = '800 24px sans-serif';
  ctx.fillText(
    'In Words',
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2,
    tableY + 55
  );

  // 9 Subject Rows
  rowsData.forEach((r, idx) => {
    const ry = tableY + headerH + idx * rowH;
    if (idx > 0) {
      ctx.beginPath();
      ctx.moveTo(tableX, ry);
      ctx.lineTo(tableX + tableW, ry);
      ctx.stroke();
    }

    // Subject label in blue
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0284c7';
    ctx.font = '700 23px sans-serif';
    const displaySub = r.label.match(/^\d+\./) ? r.label : `${idx + 1}. ${r.label}`;
    ctx.fillText(displaySub, tableX + 14, ry + 36);

    // Total Marks
    ctx.textAlign = 'center';
    ctx.fillStyle = '#0f172a';
    ctx.font = '700 22px sans-serif';
    ctx.fillText(String(r.max), tableX + colWidths[0] + colWidths[1] / 2, ry + 36);

    // Obtained Marks
    ctx.fillText(
      String(r.obt),
      tableX + colWidths[0] + colWidths[1] + colWidths[2] / 2,
      ry + 36
    );

    // In Words
    ctx.textAlign = 'left';
    ctx.font = '600 20px sans-serif';
    ctx.fillText(
      r.words,
      tableX + colWidths[0] + colWidths[1] + colWidths[2] + 18,
      ry + 36
    );
  });

  // Total & Remarks Box below table matching Image 017
  const totY = tableY + headerH + rowH * 9 + 24;
  const totH = 42;
  ctx.strokeRect(tableX, totY, colWidths[0] + colWidths[1] + colWidths[2], totH);
  // Remarks box on right
  ctx.strokeRect(
    tableX + colWidths[0] + colWidths[1] + colWidths[2],
    totY + 20,
    300,
    totH
  );

  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = '800 22px sans-serif';
  ctx.fillText('Total', tableX + 12, totY + 29);

  const calcTotalMax =
    input.totalMarks ?? rowsData.reduce((acc, x) => acc + x.max, 0);
  const calcTotalObt =
    input.obtainedMarks ?? rowsData.reduce((acc, x) => acc + x.obt, 0);

  ctx.textAlign = 'center';
  ctx.fillText(
    `${calcTotalObt} / ${calcTotalMax} (${input.percentage}%)`,
    tableX + colWidths[0] + (colWidths[1] + colWidths[2]) / 2 - 30,
    totY + 29
  );

  ctx.textAlign = 'right';
  ctx.fillText(
    'Remarks',
    tableX + colWidths[0] + colWidths[1] + colWidths[2] - 12,
    totY + 29
  );

  ctx.textAlign = 'center';
  ctx.fillStyle = '#047857';
  ctx.fillText(
    input.remarks || `Grade ${input.grade} - Promoted`,
    tableX + colWidths[0] + colWidths[1] + colWidths[2] + 150,
    totY + 49
  );

  // Footer: Checked by, Dated, Controller of Examinations
  const footY = 1525;
  ctx.textAlign = 'left';
  ctx.fillStyle = '#000000';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(`Checked by: _________________`, 90, footY);
  ctx.fillStyle = '#6d28d9';
  ctx.font = 'italic 800 26px serif';
  ctx.fillText(input.checkedBy || 'M. Irfan', 250, footY - 6);

  ctx.fillStyle = '#000000';
  ctx.font = '600 24px sans-serif';
  ctx.fillText(`Dated: ${input.dated || new Date().toISOString().split('T')[0]}`, 90, footY + 46);

  ctx.textAlign = 'center';
  ctx.beginPath();
  ctx.moveTo(860, footY + 5);
  ctx.lineTo(1140, footY + 5);
  ctx.stroke();
  ctx.font = '600 23px sans-serif';
  ctx.fillText('Controller of Examinations', 1000, footY + 34);
  ctx.font = '800 23px sans-serif';
  ctx.fillText('GPS Chambai Kohat', 1000, footY + 64);

  ctx.textAlign = 'left';
  ctx.font = '700 13px sans-serif';
  ctx.fillText('Design by. M Irfan SPST', 28, canvas.height - 28);

  return canvas.toDataURL('image/jpeg', 0.95);
}

export interface ExamPaperRenderInput {
  semester: string;
  className: string;
  subject: string;
  examDate: string;
  studentNameField?: string;
  studentNamePlaceholder?: string;
  timeAllowed?: string;
  instructions?: string;
  totalMarks: number;
  isUrduRtl?: boolean;
  languageMode?: 'en' | 'ur' | 'bilingual';
  questions: {
    id?: string;
    category: string;
    questionText?: string;
    text?: string;
    marks: number;
  }[];
}

/**
 * Builds standalone printable HTML for Second Report Card (DMC - Image 017) with Image 031 Crest Logo
 * so Print Preview, Direct Print, Save PDF, and Save DOC all look identical.
 */
export function buildSecondDmcReportCardHtml(input: ReportCardRenderInput): string {
  const defaultNineSubjects = [
    '1. English',
    '2. Urdu',
    '3. Mathematics',
    '4. G - Science',
    '5. Pashto',
    '6. Pak Study',
    '7. Islamyat',
    '8. Nazra',
    '9. Drawing',
  ];

  const rowsData = defaultNineSubjects.map((defaultLabel, idx) => {
    const matched = (input.subjects || [])[idx];
    const max = matched ? Number(matched.totalMarks ?? matched.total ?? 100) : 100;
    const obt = matched ? Number(matched.obtainedMarks ?? matched.obtained ?? 0) : 0;
    const words = matched?.inWords || (obt > 0 ? numberToWordsEn(obt) : '—');
    const rawSub = matched?.subject || matched?.subjectName || defaultLabel;
    const label = rawSub.match(/^\d+\./) ? rawSub : `${idx + 1}. ${rawSub}`;
    return { label, max, obt, words };
  });

  const calcTotalMax = input.totalMarks ?? rowsData.reduce((acc, x) => acc + x.max, 0);
  const calcTotalObt = input.obtainedMarks ?? rowsData.reduce((acc, x) => acc + x.obt, 0);
  const pct =
    input.percentage ?? (calcTotalMax > 0 ? Math.round((calcTotalObt / calcTotalMax) * 100) : 0);

  const rowsHtml = rowsData
    .map(
      (r) => `
      <tr>
        <td style="border:2px solid #000;padding:7px 12px;font-weight:800;color:#0284c7;font-size:15px;">${r.label}</td>
        <td style="border:2px solid #000;padding:7px 8px;text-align:center;font-weight:800;font-size:15px;color:#0f172a;">${r.max}</td>
        <td style="border:2px solid #000;padding:7px 8px;text-align:center;font-weight:800;font-size:15px;color:#0f172a;">${r.obt}</td>
        <td style="border:2px solid #000;padding:7px 12px;font-weight:700;font-size:14px;color:#0f172a;">${r.words}</td>
      </tr>`
    )
    .join('');

  return `<div data-standalone-doc="true" style="max-width:790px;margin:0 auto;border:3.5px solid #111827;padding:20px 24px;background:#ffffff;position:relative;font-family:'Plus Jakarta Sans','Jameel Noori Nastaleeq',Georgia,sans-serif;color:#0f172a;">
    <!-- Top Section: Image 031 Crest Logo on Left + School Titles on Right -->
    <table style="width:100%;border:none;border-collapse:collapse;margin-bottom:10px;">
      <tr style="background:transparent;">
        <td style="width:210px;border:none;vertical-align:middle;text-align:center;padding:4px;">
          <img src="/assets/aistudio/image_031.svg" alt="GPS Chambai Crest" style="width:185px;height:185px;object-fit:contain;display:block;margin:0 auto;" />
        </td>
        <td style="border:none;vertical-align:middle;text-align:center;padding:4px;">
          <div style="font-family:Georgia,serif;font-size:36px;font-weight:900;background:linear-gradient(90deg,#e11d48,#16a34a,#0284c7);-webkit-background-clip:text;color:#065f46;line-height:1.15;">Govt Primary School</div>
          <div style="font-family:Georgia,serif;font-size:32px;font-weight:900;color:#000000;margin-top:2px;">Chambai Kohat</div>
          <div style="font-size:19px;font-weight:900;color:#e11d48;letter-spacing:0.04em;margin-top:6px;">DETAILED MARKS CERTIFICATE</div>
          <div style="font-size:20px;font-weight:900;color:#16a34a;margin-top:4px;">CLASS &nbsp; <span style="text-decoration:underline;">${input.className || '________'}</span></div>
          <div style="font-size:18px;font-weight:800;color:#0284c7;margin-top:4px;">Session ${input.academicYear || '2026 / 27'} &nbsp;&nbsp; ${input.examTerm || 'Final'} Term</div>
          <div style="text-align:right;font-size:17px;font-weight:800;color:#0f172a;margin-top:6px;padding-right:12px;">Roll No. <span style="border-bottom:2px solid #0f172a;padding:0 16px;">${input.rollNo || '01'}</span></div>
        </td>
      </tr>
    </table>

    <!-- Student Details Lines -->
    <div style="margin:10px 0 14px 0;font-size:15.5px;font-weight:700;">
      <div style="display:flex;justify-content:space-between;gap:16px;margin-bottom:8px;">
        <div style="flex:1;">Name: <span style="display:inline-block;min-width:210px;border-bottom:2px solid #0f172a;padding:0 8px;font-weight:800;">${input.studentName || ''}</span></div>
        <div style="flex:1;">Father Name: <span style="display:inline-block;min-width:210px;border-bottom:2px solid #0f172a;padding:0 8px;font-weight:800;">${input.fatherName || ''}</span></div>
      </div>
      <div>
        District/Institution: <span style="display:inline-block;min-width:480px;border-bottom:2px solid #0f172a;padding:0 12px;font-family:Georgia,serif;font-size:19px;font-weight:900;color:#e11d48;">Govt Primary School Chambai Kohat</span>
      </div>
    </div>

    <!-- 9 Subjects Marks Table -->
    <table style="width:100%;border-collapse:collapse;border:2.5px solid #000000;margin-bottom:14px;">
      <thead>
        <tr style="background:#ffffff;">
          <th style="border:2px solid #000;padding:10px 12px;font-size:17px;font-weight:900;color:#16a34a;width:28%;">Subjects</th>
          <th style="border:2px solid #000;padding:10px 6px;font-size:14px;font-weight:900;color:#16a34a;text-align:center;width:16%;">Total Marks</th>
          <th style="border:2px solid #000;padding:10px 6px;font-size:14px;font-weight:900;color:#16a34a;text-align:center;width:16%;">Obtained Marks</th>
          <th style="border:2px solid #000;padding:10px 12px;font-size:16px;font-weight:900;color:#16a34a;text-align:center;width:40%;">In Words</th>
        </tr>
      </thead>
      <tbody>
        ${rowsHtml}
      </tbody>
    </table>

    <!-- Total & Remarks Row -->
    <table style="width:100%;border-collapse:collapse;border:none;margin-bottom:28px;">
      <tr style="background:transparent;">
        <td style="border:2px solid #000;padding:8px 12px;width:60%;font-weight:900;font-size:15px;">
          <span>Total: &nbsp; ${calcTotalObt} / ${calcTotalMax} (${pct}%)</span>
          <span style="float:right;">Remarks</span>
        </td>
        <td style="border:2px solid #000;padding:8px 12px;width:40%;text-align:center;font-weight:900;font-size:15px;color:#047857;">
          ${input.remarks || `Grade ${input.grade || 'A'} - Promoted`}
        </td>
      </tr>
    </table>

    <!-- Footer Signatures -->
    <table style="width:100%;border:none;border-collapse:collapse;margin-top:24px;">
      <tr style="background:transparent;">
        <td style="border:none;width:55%;vertical-align:bottom;font-size:15px;font-weight:700;">
          <div style="margin-bottom:10px;">Checked by: <span style="border-bottom:2px solid #000;padding:0 24px;color:#6d28d9;font-style:italic;font-weight:900;">${input.checkedBy || 'M. Irfan'}</span></div>
          <div>Dated: <span>${input.dated || new Date().toISOString().split('T')[0]}</span></div>
        </td>
        <td style="border:none;width:45%;vertical-align:bottom;text-align:center;">
          <div style="border-top:2px solid #000;padding-top:6px;display:inline-block;min-width:220px;">
            <div style="font-size:15px;font-weight:700;">Controller of Examinations</div>
            <div style="font-size:15px;font-weight:900;">GPS Chambai Kohat</div>
          </div>
        </td>
      </tr>
    </table>
    <div style="margin-top:12px;font-size:10px;font-weight:700;color:#475569;">Design by. M Irfan SPST</div>
  </div>`;
}

/**
 * Builds standalone printable HTML for First Report Card & Result
 * so Print Preview, Direct Print, Save PDF, and Save DOC all look identical.
 */
export function buildFirstReportCardHtml(
  result: ReportCardRenderInput | ExamResult,
  student?: Student,
  classNameArg?: string,
  classHexArg?: string
): string {
  const settings = StorageService.getSettings();
  const r = result as ReportCardRenderInput;
  const studentName = r.studentName || student?.name || 'Registered Student';
  const fatherName = r.fatherName || student?.fatherName || '—';
  const rollNo = r.rollNo || student?.rollNo || '01';
  const className = r.className || classNameArg || 'Primary Class';
  const classHex = r.classHex || classHexArg || '#00B050';
  const examTerm = r.examTerm || r.examName || 'Annual Examination';
  const academicYear = r.academicYear || settings.academicYear || '2025-26';
  const totalMax = r.totalMarks ?? r.totalMaxMarks ?? 500;
  const totalObt = r.obtainedMarks ?? r.totalObtainedMarks ?? 0;
  const pctVal = r.percentage ?? (totalMax > 0 ? Math.round((totalObt / totalMax) * 100) : 0);
  const isPassed = r.isPassed !== undefined ? r.isPassed : pctVal >= 33;

  const subjectList = (r.subjects || r.subjectMarks || []).map((s: any) => ({
    name: s.subjectName || s.subject || 'Subject',
    max: Number(s.totalMarks ?? s.total ?? s.maxMarks ?? 100),
    obtained: Number(s.obtainedMarks ?? s.obtained ?? 0),
  }));

  const rowsHtml = subjectList
    .map((sub, idx) => {
      const subPct = sub.max > 0 ? Math.round((sub.obtained / sub.max) * 100) : 0;
      return `<tr>
        <td style="border:1px solid #94a3b8;padding:8px 10px;text-align:center;font-weight:700;">${String(idx + 1).padStart(2, '0')}</td>
        <td style="border:1px solid #94a3b8;padding:8px 12px;font-weight:700;">${sub.name}</td>
        <td style="border:1px solid #94a3b8;padding:8px 10px;text-align:center;font-weight:700;">${sub.max}</td>
        <td style="border:1px solid #94a3b8;padding:8px 10px;text-align:center;font-weight:800;color:#065f46;">${sub.obtained}</td>
        <td style="border:1px solid #94a3b8;padding:8px 10px;text-align:center;font-weight:700;">${subPct}%</td>
      </tr>`;
    })
    .join('');

  return `<div data-standalone-doc="true" style="max-width:780px;margin:0 auto;border:4px solid #065f46;padding:18px;background:#ffffff;font-family:'Plus Jakarta Sans','Jameel Noori Nastaleeq',sans-serif;color:#0f172a;">
    <div style="border:2px solid ${classHex};padding:18px;">
      <!-- Banner Header with Top Official School Logo & Perfectly Centered Yellow Section -->
      <div style="background:linear-gradient(135deg,#064e3b,#047857);color:#ffffff;padding:18px 16px;text-align:center;border-radius:10px;margin-bottom:16px;">
        <div style="text-align:center;margin-bottom:8px;">
          <img src="/assets/aistudio/image_031.svg" alt="GPS Chambai Official Logo" style="width:78px;height:78px;object-fit:contain;background:#ffffff;border-radius:50%;padding:5px;border:2.5px solid #fbbf24;display:block;margin:0 auto;" />
        </div>
        <div style="font-size:22px;font-weight:900;letter-spacing:0.02em;text-align:center;">GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT</div>
        <div style="font-size:12.5px;color:#a7f3d0;font-weight:700;margin-top:4px;text-align:center;">Elementary &amp; Secondary Education Department, Khyber Pakhtunkhwa • EMIS: 16454</div>
        <table style="width:100%;border:none;border-collapse:collapse;margin-top:12px;">
          <tr style="background:transparent;">
            <td style="border:none;padding:0;text-align:center;">
              <div style="width:100%;background:#fbbf24;color:#0f172a;font-weight:900;font-size:14px;letter-spacing:0.04em;padding:8px 16px;border-radius:8px;text-align:center;display:flex;align-items:center;justify-content:center;box-sizing:border-box;">
                <span style="width:100%;text-align:center;display:block;">OFFICIAL RESULT REPORT CARD (${academicYear})</span>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Student Meta Box -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;background:#f8fafc;border:1.5px solid #cbd5e1;border-left:8px solid ${classHex};">
        <tr style="background:transparent;">
          <td style="border:none;padding:8px 14px;font-size:13.5px;font-weight:700;width:55%;">Student Name: <strong style="color:#064e3b;">${studentName}</strong></td>
          <td style="border:none;padding:8px 14px;font-size:13.5px;font-weight:700;width:45%;">Roll Number: <strong>${rollNo}</strong></td>
        </tr>
        <tr style="background:transparent;">
          <td style="border:none;padding:6px 14px;font-size:13.5px;font-weight:700;">Father's Name: <strong>${fatherName}</strong></td>
          <td style="border:none;padding:6px 14px;font-size:13.5px;font-weight:700;">Session: <strong>${academicYear}</strong></td>
        </tr>
        <tr style="background:transparent;">
          <td style="border:none;padding:6px 14px;font-size:13.5px;font-weight:700;">Class / Grade: <strong>${className}</strong></td>
          <td style="border:none;padding:6px 14px;font-size:13.5px;font-weight:700;">Class Position: <strong>${r.positionInClass || 'Merit'}</strong></td>
        </tr>
        <tr style="background:transparent;">
          <td style="border:none;padding:8px 14px;font-size:13.5px;font-weight:700;">Examination: <strong>${examTerm}</strong></td>
          <td style="border:none;padding:8px 14px;font-size:13.5px;font-weight:700;">School EMIS: <strong>16454 (Chambai Kohat)</strong></td>
        </tr>
      </table>

      <!-- Marks Table -->
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#1e293b;color:#ffffff;">
            <th style="border:1px solid #1e293b;padding:9px 8px;color:#ffffff;text-align:center;width:10%;">S.No</th>
            <th style="border:1px solid #1e293b;padding:9px 12px;color:#ffffff;text-align:left;width:42%;">Subject / Paper</th>
            <th style="border:1px solid #1e293b;padding:9px 8px;color:#ffffff;text-align:center;width:16%;">Max Marks</th>
            <th style="border:1px solid #1e293b;padding:9px 8px;color:#ffffff;text-align:center;width:16%;">Obtained</th>
            <th style="border:1px solid #1e293b;padding:9px 8px;color:#ffffff;text-align:center;width:16%;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
          <tr style="background:#ecfdf5;font-weight:900;color:#064e3b;">
            <td colspan="2" style="border:1.5px solid #059669;padding:10px 12px;font-weight:900;font-size:14px;">GRAND TOTAL</td>
            <td style="border:1.5px solid #059669;padding:10px 8px;text-align:center;font-weight:900;font-size:14px;">${totalMax}</td>
            <td style="border:1.5px solid #059669;padding:10px 8px;text-align:center;font-weight:900;font-size:14px;">${totalObt}</td>
            <td style="border:1.5px solid #059669;padding:10px 8px;text-align:center;font-weight:900;font-size:14px;">${pctVal}%</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Status Box -->
      <div style="background:#f8fafc;border:1.5px solid #cbd5e1;padding:12px 16px;border-radius:8px;margin-bottom:34px;">
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:900;margin-bottom:6px;">
          <span>Overall Grade: ${r.grade || 'A'}</span>
          <span style="color:${isPassed ? '#059669' : '#dc2626'};">Result Status: ${isPassed ? 'PASSED / PROMOTED' : 'NEEDS IMPROVEMENT'}</span>
        </div>
        <div style="font-size:13px;font-weight:700;color:#334155;">
          Teacher Remarks: ${r.remarks || 'Good academic effort and discipline.'}
        </div>
      </div>

      <!-- Signatures -->
      <table style="width:100%;border:none;border-collapse:collapse;margin-top:30px;">
        <tr style="background:transparent;">
          <td style="border:none;text-align:center;width:33%;">
            <div style="border-top:2px solid #334155;padding-top:6px;margin:0 12px;font-weight:800;font-size:12px;">Class Teacher Signature</div>
          </td>
          <td style="border:none;text-align:center;width:33%;">
            <div style="border-top:2px solid #334155;padding-top:6px;margin:0 12px;font-weight:800;font-size:12px;">Parent / Guardian Signature</div>
          </td>
          <td style="border:none;text-align:center;width:33%;">
            <div style="border-top:2px solid #334155;padding-top:6px;margin:0 12px;font-weight:800;font-size:12px;">Headmaster Stamp &amp; Sign</div>
          </td>
        </tr>
      </table>
    </div>
  </div>`;
}

/**
 * PART 17: Export Semester Examination Paper as High-Resolution JPG with Jameel Noori Nastaleeq Urdu Support
 */
export function generateExamPaperJpgDataUrl(paper: ExamPaperRenderInput | SemesterExamPaper): string {
  const p = paper as ExamPaperRenderInput;
  const canvas = document.createElement('canvas');
  canvas.width = 1240;
  const estimatedHeight = Math.max(1754, 540 + p.questions.length * 165);
  canvas.height = estimatedHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const isUrdu =
    p.isUrduRtl ||
    p.languageMode === 'ur' ||
    containsUrduText(p.subject) ||
    p.subject.toLowerCase().includes('urdu') ||
    p.subject.toLowerCase().includes('islamiat') ||
    p.subject.toLowerCase().includes('pashto') ||
    p.questions.some((q) => containsUrduText(q.questionText || q.text || ''));

  const urduFontStack =
    "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Nafees Nastaleeq', 'Urdu Typesetting', Tahoma, serif";

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 4;
  ctx.strokeRect(36, 36, canvas.width - 72, canvas.height - 72);

  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.font = '800 32px sans-serif';
  ctx.fillText('GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT', canvas.width / 2, 100);

  ctx.font = isUrdu ? `700 28px ${urduFontStack}` : '700 24px sans-serif';
  ctx.fillStyle = '#047857';
  ctx.fillText(`${p.semester.toUpperCase()} — ${p.subject.toUpperCase()}`, canvas.width / 2, 144);

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 168, canvas.width - 128, 130);

  ctx.textAlign = 'left';
  ctx.fillStyle = '#0F172A';
  ctx.font = `700 20px ${urduFontStack}`;
  const studentDisplay =
    (p.studentNameField || p.studentNamePlaceholder || '').trim() || '__________________________';
  ctx.fillText(`Student Name: ${studentDisplay}`, 88, 210);
  ctx.fillText(`Class: ${p.className}`, 740, 210);

  ctx.fillText(`Paper / Subject: ${p.subject}`, 88, 250);
  ctx.fillText(`Date: ${p.examDate}`, 480, 250);
  ctx.fillText(`Semester: ${p.semester}`, 800, 250);

  ctx.fillText(`Time Allowed: ${p.timeAllowed || '2 Hours'}`, 88, 285);
  ctx.fillText(`Total Marks: ${p.totalMarks}`, 800, 285);

  let y = 335;
  ctx.fillStyle = '#F1F5F9';
  ctx.fillRect(64, y - 26, canvas.width - 128, 44);
  ctx.fillStyle = '#0F172A';
  ctx.font = `700 19px ${urduFontStack}`;
  ctx.fillText(
    `Instructions: ${
      p.instructions || 'Attempt all questions neatly. Marks are indicated against each question.'
    }`,
    80,
    y + 2
  );

  y += 58;

  p.questions.forEach((q, idx) => {
    const qText = q.questionText || q.text || '';
    const qHasUrdu = isUrdu || containsUrduText(qText) || containsUrduText(q.category);

    ctx.fillStyle = '#0F172A';
    if (qHasUrdu) {
      ctx.direction = 'rtl';
      ctx.textAlign = 'right';
      ctx.font = `800 24px ${urduFontStack}`;
      ctx.fillText(`سوال نمبر ${idx + 1}: [${q.category}]`, canvas.width - 70, y);
      ctx.textAlign = 'left';
      ctx.font = '800 20px sans-serif';
      ctx.fillText(`(${q.marks} نمبر / Marks)`, 70, y);
    } else {
      ctx.direction = 'ltr';
      ctx.textAlign = 'left';
      ctx.font = '800 20px sans-serif';
      ctx.fillText(`Q.${idx + 1}: [${q.category}]`, 70, y);
      ctx.textAlign = 'right';
      ctx.fillText(`(${q.marks} Marks)`, canvas.width - 70, y);
    }

    y += 42;
    ctx.direction = qHasUrdu ? 'rtl' : 'ltr';
    ctx.textAlign = qHasUrdu ? 'right' : 'left';
    ctx.font = qHasUrdu ? `600 26px ${urduFontStack}` : '600 20px sans-serif';
    const lines = qText.split('\n');
    lines.forEach((line) => {
      const maxChars = qHasUrdu ? 72 : 85;
      for (let i = 0; i < line.length; i += maxChars) {
        const chunk = line.slice(i, i + maxChars);
        ctx.fillText(chunk, qHasUrdu ? canvas.width - 80 : 95, y);
        y += qHasUrdu ? 42 : 30;
      }
    });

    y += 12;
    ctx.strokeStyle = '#CBD5E1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(70, y);
    ctx.lineTo(canvas.width - 70, y);
    ctx.stroke();
    y += 38;
  });

  return canvas.toDataURL('image/jpeg', 0.95);
}

/**
 * PART 17: Export Semester Examination Paper as Valid Word (.doc / WordprocessingML) Document
 * with Jameel Noori Nastaleeq Urdu Font & RTL Support
 */
export function generateExamPaperDocxBlob(paper: ExamPaperRenderInput | SemesterExamPaper): Blob {
  const p = paper as ExamPaperRenderInput;
  const isUrdu =
    p.isUrduRtl ||
    p.languageMode === 'ur' ||
    containsUrduText(p.subject) ||
    p.subject.toLowerCase().includes('urdu') ||
    p.subject.toLowerCase().includes('islamiat') ||
    p.subject.toLowerCase().includes('pashto') ||
    p.questions.some((q) => containsUrduText(q.questionText || q.text || ''));

  const studentDisplay =
    (p.studentNameField || p.studentNamePlaceholder || '').trim() || '__________________________';

  const questionsHtml = p.questions
    .map((q, idx) => {
      const qText = q.questionText || q.text || '';
      const qHasUrdu = isUrdu || containsUrduText(qText) || containsUrduText(q.category);
      return `
      <div style="margin-bottom:14pt;border-bottom:1.5px solid #cbd5e1;padding-bottom:10pt;direction:${qHasUrdu ? 'rtl' : 'ltr'};">
        <table style="width:100%;border:none;margin-bottom:6pt;direction:${qHasUrdu ? 'rtl' : 'ltr'};">
          <tr style="background:transparent;">
            <td style="border:none;font-weight:bold;font-size:13pt;text-align:${qHasUrdu ? 'right' : 'left'};font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu','Calibri',serif;">
              ${qHasUrdu ? `سوال نمبر ${idx + 1}: [${q.category}]` : `Q.${idx + 1}: [${q.category}]`}
            </td>
            <td style="border:none;text-align:${qHasUrdu ? 'left' : 'right'};font-weight:bold;font-size:11.5pt;">
              (${qHasUrdu ? `${q.marks} نمبر` : `Marks: ${q.marks}`})
            </td>
          </tr>
        </table>
        <p class="${qHasUrdu ? 'urdu-text' : ''}" style="margin:6pt 0;font-size:${qHasUrdu ? '16pt' : '12pt'};line-height:${qHasUrdu ? '2.1' : '1.6'};direction:${qHasUrdu ? 'rtl' : 'ltr'};text-align:${
        qHasUrdu ? 'right' : 'left'
      };font-family:'Jameel Noori Nastaleeq','Noto Nastaliq Urdu','Calibri',serif;white-space:pre-line;">${qText}</p>
      </div>`;
    })
    .join('');

  const wordDocContent = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT - ${p.semester}</title>
  <link href="https://fonts.cdnfonts.com/css/jameel-noori-nastaleeq" rel="stylesheet">
  <style>
    ${JAMEEL_NOORI_PRINT_CSS}
    body { font-family: 'Plus Jakarta Sans', 'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Calibri', sans-serif; font-size: 12pt; }
    h1 { text-align: center; font-size: 18pt; margin-bottom: 4pt; }
    h2 { text-align: center; font-size: 14pt; margin-top: 0; color: #065f46; font-family: 'Jameel Noori Nastaleeq', 'Calibri', serif; }
    table.meta { width: 100%; border-collapse: collapse; margin-bottom: 14pt; }
    table.meta td { border: 1px solid #334155; padding: 6pt 8pt; font-weight: bold; font-family: 'Jameel Noori Nastaleeq', 'Calibri', sans-serif; }
  </style>
</head>
<body>
  <h1>GOVERNMENT PRIMARY SCHOOL CHAMBAI KOHAT</h1>
  <h2>${p.semester} — ${p.subject}</h2>
  <table class="meta">
    <tr>
      <td>Student Name: ${studentDisplay}</td>
      <td>Class: ${p.className}</td>
    </tr>
    <tr>
      <td>Paper / Subject: ${p.subject}</td>
      <td>Date: ${p.examDate}</td>
    </tr>
    <tr>
      <td>Semester: ${p.semester}</td>
      <td>Total Marks: ${p.totalMarks} (Time: ${p.timeAllowed || '2 Hours'})</td>
    </tr>
  </table>
  <p style="background:#f1f5f9;padding:8pt;border:1px solid #cbd5e1;font-weight:bold;direction:${isUrdu ? 'rtl' : 'ltr'};text-align:${isUrdu ? 'right' : 'left'};font-family:'Jameel Noori Nastaleeq','Calibri',sans-serif;">
    ${isUrdu ? 'ہدایات: ' : 'Instructions: '}${
    p.instructions || 'Attempt all questions neatly. Marks are indicated against each question.'
  }
  </p>
  <hr/>
  ${questionsHtml}
</body>
</html>`;

  return new Blob(['\ufeff', wordDocContent], {
    type: 'application/msword;charset=utf-8',
  });
}
