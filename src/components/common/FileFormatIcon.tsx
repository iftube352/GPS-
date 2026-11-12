import React, { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Image as ImageIcon,
  Film,
  Music,
  Archive,
  FileCode,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { SupportedFileFormatKey } from '../../types';

export const ALL_SUPPORTED_FILE_FORMATS: {
  key: SupportedFileFormatKey;
  label: string;
  defaultBg: string;
  defaultText: string;
}[] = [
  { key: 'PDF', label: 'PDF Document (.pdf)', defaultBg: '#E11D48', defaultText: '#FFFFFF' },
  { key: 'DOC', label: 'Word Document (.doc)', defaultBg: '#2563EB', defaultText: '#FFFFFF' },
  { key: 'DOCX', label: 'Word Document (.docx)', defaultBg: '#1D4ED8', defaultText: '#FFFFFF' },
  { key: 'XLS', label: 'Excel Sheet (.xls)', defaultBg: '#059669', defaultText: '#FFFFFF' },
  { key: 'XLSX', label: 'Excel Workbook (.xlsx)', defaultBg: '#047857', defaultText: '#FFFFFF' },
  { key: 'PPT', label: 'PowerPoint (.ppt)', defaultBg: '#EA580C', defaultText: '#FFFFFF' },
  { key: 'PPTX', label: 'PowerPoint (.pptx)', defaultBg: '#C2410C', defaultText: '#FFFFFF' },
  { key: 'JPG', label: 'JPEG Image (.jpg)', defaultBg: '#D97706', defaultText: '#FFFFFF' },
  { key: 'JPEG', label: 'JPEG Image (.jpeg)', defaultBg: '#B45309', defaultText: '#FFFFFF' },
  { key: 'PNG', label: 'PNG Image (.png)', defaultBg: '#7C3AED', defaultText: '#FFFFFF' },
  { key: 'WEBP', label: 'WebP Image (.webp)', defaultBg: '#6D28D9', defaultText: '#FFFFFF' },
  { key: 'TXT', label: 'Text File (.txt)', defaultBg: '#475569', defaultText: '#FFFFFF' },
  { key: 'MP4', label: 'Video File (.mp4)', defaultBg: '#0284C7', defaultText: '#FFFFFF' },
  { key: 'MP3', label: 'Audio File (.mp3)', defaultBg: '#DB2777', defaultText: '#FFFFFF' },
  { key: 'ZIP', label: 'ZIP Archive (.zip)', defaultBg: '#4F46E5', defaultText: '#FFFFFF' },
  { key: 'RAR', label: 'RAR Archive (.rar)', defaultBg: '#4338CA', defaultText: '#FFFFFF' },
];

export function detectFileFormatKey(fileNameOrFormat: string): SupportedFileFormatKey {
  const upper = (fileNameOrFormat || '').trim().toUpperCase();
  if (!upper) return 'PDF';

  // Direct match
  const direct = ALL_SUPPORTED_FILE_FORMATS.find((f) => f.key === upper);
  if (direct) return direct.key;

  // Extension match from filename
  const parts = upper.split('.');
  if (parts.length > 1) {
    const ext = parts[parts.length - 1];
    const extMatch = ALL_SUPPORTED_FILE_FORMATS.find((f) => f.key === ext);
    if (extMatch) return extMatch.key;
  }

  if (upper.includes('DOCX')) return 'DOCX';
  if (upper.includes('DOC')) return 'DOC';
  if (upper.includes('XLSX')) return 'XLSX';
  if (upper.includes('XLS')) return 'XLS';
  if (upper.includes('PPTX')) return 'PPTX';
  if (upper.includes('PPT')) return 'PPT';
  if (upper.includes('JPEG')) return 'JPEG';
  if (upper.includes('JPG')) return 'JPG';
  if (upper.includes('PNG')) return 'PNG';
  if (upper.includes('WEBP')) return 'WEBP';
  if (upper.includes('MP4')) return 'MP4';
  if (upper.includes('MP3')) return 'MP3';
  if (upper.includes('ZIP')) return 'ZIP';
  if (upper.includes('RAR')) return 'RAR';
  if (upper.includes('TXT') || upper.includes('JSON')) return 'TXT';
  return 'PDF';
}

interface FileFormatIconProps {
  formatOrFileName: string;
  size?: number;
  className?: string;
}

export const FileFormatIcon: React.FC<FileFormatIconProps> = ({
  formatOrFileName,
  size = 40,
  className = '',
}) => {
  const [customIconsMap, setCustomIconsMap] = useState<Partial<Record<SupportedFileFormatKey, string>>>(
    () => StorageService.getCustomization().fileFormatIcons || {}
  );

  useEffect(() => {
    const handleUpdate = () => {
      setCustomIconsMap(StorageService.getCustomization().fileFormatIcons || {});
    };
    window.addEventListener('gps-customization-updated', handleUpdate);
    return () => window.removeEventListener('gps-customization-updated', handleUpdate);
  }, []);

  const formatKey = detectFileFormatKey(formatOrFileName);
  const customDataUrl = customIconsMap[formatKey];
  const meta =
    ALL_SUPPORTED_FILE_FORMATS.find((f) => f.key === formatKey) || ALL_SUPPORTED_FILE_FORMATS[0];

  if (customDataUrl) {
    return (
      <div
        style={{ width: `${size}px`, height: `${size}px` }}
        className={`rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-white border border-slate-200 shadow-2xs ${className}`}
        title={`${formatKey} File`}
      >
        <img
          src={customDataUrl}
          alt={formatKey}
          className="w-full h-full object-contain p-0.5"
        />
      </div>
    );
  }

  const iconSize = Math.max(14, Math.round(size * 0.44));

  const renderGlyph = () => {
    switch (formatKey) {
      case 'XLS':
      case 'XLSX':
        return <FileSpreadsheet size={iconSize} />;
      case 'PPT':
      case 'PPTX':
        return <Presentation size={iconSize} />;
      case 'JPG':
      case 'JPEG':
      case 'PNG':
      case 'WEBP':
        return <ImageIcon size={iconSize} />;
      case 'MP4':
        return <Film size={iconSize} />;
      case 'MP3':
        return <Music size={iconSize} />;
      case 'ZIP':
      case 'RAR':
        return <Archive size={iconSize} />;
      case 'TXT':
        return <FileCode size={iconSize} />;
      default:
        return <FileText size={iconSize} />;
    }
  };

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: meta.defaultBg,
        color: meta.defaultText,
      }}
      className={`rounded-xl flex flex-col items-center justify-center shrink-0 shadow-xs select-none ${className}`}
      title={`${formatKey} File`}
    >
      {renderGlyph()}
      <span className="text-[8px] font-black tracking-tighter leading-none mt-0.5">
        {formatKey}
      </span>
    </div>
  );
};
