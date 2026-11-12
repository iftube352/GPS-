import { StudentRecord } from '../types';
import { StorageFolderService } from './storageFolderService';

export interface WhatsAppCloudApiSettings {
  enabled: boolean;
  autoStudentInAlert: boolean;
  autoStudentOutAlert: boolean;
  mode: 'cloud_api' | 'manual_wa';
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  senderPhoneDisplay: string;
  studentInTemplate: string;
  studentOutTemplate: string;
  customTemplates: {
    id: string;
    title: string;
    category: 'Arrival' | 'Departure' | 'Absence' | 'Fee/PTC' | 'Exam/Result' | 'Emergency' | 'General';
    message: string;
  }[];
}

export interface WhatsAppNotificationLogItem {
  id: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  className: string;
  parentPhone: string;
  direction: 'IN' | 'OUT' | 'ABSENT' | 'CUSTOM';
  messageText: string;
  date: string; // YYYY-MM-DD
  time: string; // e.g. 08:05 AM
  timestamp: string;
  deliveryMethod: 'WhatsApp Business Cloud API' | 'Manual WhatsApp (wa.me)';
  status: 'Sent (API)' | 'Opened in WhatsApp' | 'Queued / Logged' | 'Failed (Fallback Used)' | 'Duplicate Skipped';
}

const SETTINGS_KEY = 'gps_chambai_whatsapp_settings_v1';
const LOGS_KEY = 'gps_chambai_whatsapp_logs_v1';

const DEFAULT_SETTINGS: WhatsAppCloudApiSettings = {
  enabled: true,
  autoStudentInAlert: true,
  autoStudentOutAlert: true,
  mode: 'manual_wa',
  phoneNumberId: '',
  businessAccountId: '',
  accessToken: '',
  senderPhoneDisplay: '0336-9053352',
  studentInTemplate:
    'Dear Parent, your child [Student Name] has arrived at GPS Chambai at [Time] on [Date].',
  studentOutTemplate:
    'Dear Parent, your child [Student Name] has left GPS Chambai at [Time] on [Date].',
  customTemplates: [
    {
      id: 'tpl_in',
      title: 'Student Arrival (IN)',
      category: 'Arrival',
      message:
        'Dear Parent, your child [Student Name] has arrived at GPS Chambai at [Time] on [Date].',
    },
    {
      id: 'tpl_out',
      title: 'Student Departure (OUT)',
      category: 'Departure',
      message:
        'Dear Parent, your child [Student Name] has left GPS Chambai at [Time] on [Date].',
    },
    {
      id: 'tpl_absent',
      title: 'Student Absence Notice',
      category: 'Absence',
      message:
        'Dear Parent, your child [Student Name] ([Class]) is marked ABSENT today ([Date]) at Govt. Primary School Chambai Kohat (EMIS: 16454). Please inform the school regarding the reason.',
    },
    {
      id: 'tpl_ptm',
      title: 'PTC / Parent Teacher Meeting',
      category: 'Fee/PTC',
      message:
        'Respected Parent of [Student Name], you are cordially invited to attend the Parent-Teacher Council (PTC) meeting at GPS Chambai Kohat on [Date] at [Time].',
    },
    {
      id: 'tpl_result',
      title: 'Exam Result / Report Card Ready',
      category: 'Exam/Result',
      message:
        'Dear Parent, the Examination Result / DMC for [Student Name] ([Class]) at GPS Chambai Kohat has been prepared. Kindly visit the school or check the student report card.',
    },
    {
      id: 'tpl_emergency',
      title: 'Holiday / Emergency Closure',
      category: 'Emergency',
      message:
        'Important Notice from GPS Chambai Kohat (EMIS 16454): School will remain closed on [Date] due to official notification. Regular classes will resume as scheduled.',
    },
  ],
};

export function normalizePakistanPhoneForWhatsApp(rawPhone: string): string {
  const digits = (rawPhone || '').replace(/\D/g, '');
  if (!digits) return '923369053352';
  if (digits.startsWith('92') && digits.length >= 12) return digits;
  if (digits.startsWith('03') && digits.length === 11) return `92${digits.slice(1)}`;
  if (digits.startsWith('3') && digits.length === 10) return `92${digits}`;
  return digits;
}

export function formatTime12Hour(dateObj: Date = new Date()): string {
  return dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatReadableDate(dateStr?: string): string {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (Number.isNaN(d.getTime())) {
    return new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export const WhatsAppNotificationService = {
  getSettings(): WhatsAppCloudApiSettings {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: WhatsAppCloudApiSettings): void {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    this.syncBackupToFolder();
  },

  getLogs(): WhatsAppNotificationLogItem[] {
    try {
      const raw = localStorage.getItem(LOGS_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as WhatsAppNotificationLogItem[];
    } catch {
      return [];
    }
  },

  saveLogs(logs: WhatsAppNotificationLogItem[]): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
    this.syncBackupToFolder();
  },

  clearLogs(): void {
    localStorage.setItem(LOGS_KEY, JSON.stringify([]));
  },

  deleteLog(id: string): WhatsAppNotificationLogItem[] {
    const next = this.getLogs().filter((item) => item.id !== id);
    this.saveLogs(next);
    return next;
  },

  syncBackupToFolder(): void {
    try {
      const payload = {
        school: 'Govt. Primary School Chambai Kohat (EMIS: 16454)',
        updatedAt: new Date().toISOString(),
        settings: {
          ...this.getSettings(),
          accessToken: this.getSettings().accessToken ? '***CONFIGURED***' : '',
        },
        logs: this.getLogs().slice(0, 300),
      };
      const jsonStr = JSON.stringify(payload, null, 2);
      const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(jsonStr)}`;
      void StorageFolderService.saveFileToFolder({
        folderPath: 'GPS Chambai/WhatsApp',
        fileName: 'WhatsApp_Notifications_Log.json',
        mimeType: 'application/json',
        sizeBytes: jsonStr.length,
        dataUrl,
        moduleSource: 'WhatsApp Notification System',
        description: 'Automatic Student IN/OUT & Parent WhatsApp Notification History',
      });
    } catch {
      // ignore background sync errors
    }
  },

  fillTemplate(
    template: string,
    params: {
      studentName: string;
      fatherName?: string;
      className?: string;
      time?: string;
      date?: string;
    }
  ): string {
    const timeStr = params.time || formatTime12Hour();
    const dateStr = params.date || formatReadableDate();
    return template
      .replace(/\[Student Name\]/gi, params.studentName)
      .replace(/\[Father Name\]/gi, params.fatherName || '')
      .replace(/\[Class\]/gi, params.className || '')
      .replace(/\[Time\]/gi, timeStr)
      .replace(/\[Date\]/gi, dateStr);
  },

  hasAlreadySentToday(studentId: string, direction: 'IN' | 'OUT', dateIso: string): boolean {
    const logs = this.getLogs();
    return logs.some(
      (item) =>
        item.studentId === studentId &&
        item.direction === direction &&
        item.date === dateIso &&
        item.status !== 'Duplicate Skipped'
    );
  },

  async sendStudentInOutNotification(options: {
    student: StudentRecord;
    direction?: 'IN' | 'OUT' | 'ABSENT' | 'CUSTOM';
    eventType?: 'IN' | 'OUT' | 'ABSENT' | 'CUSTOM';
    customMessage?: string;
    dateIso?: string;
    timeFormatted?: string;
    openWhatsAppWindowIfManual?: boolean;
    openManualWhatsAppWindow?: boolean;
    bypassDuplicateCheck?: boolean;
  }): Promise<{
    sent: boolean;
    duplicateSkipped: boolean;
    reason?: string;
    logItem: WhatsAppNotificationLogItem;
    waUrl: string;
  }> {
    const resolvedDirection = options.direction || options.eventType || 'IN';
    const settings = this.getSettings();
    const todayIso = options.dateIso || new Date().toISOString().split('T')[0];
    const timeStr = options.timeFormatted || formatTime12Hour();
    const readableDate = formatReadableDate(todayIso);

    const templateBase =
      options.customMessage ||
      (resolvedDirection === 'IN'
        ? settings.studentInTemplate
        : resolvedDirection === 'OUT'
        ? settings.studentOutTemplate
        : `Dear Parent, your child ${options.student.name} (${options.student.classId}) is marked ABSENT on ${readableDate} at GPS Chambai.`);

    const messageText = this.fillTemplate(templateBase, {
      studentName: options.student.name,
      fatherName: options.student.fatherName,
      className: options.student.classId,
      time: timeStr,
      date: readableDate,
    });

    const normalizedPhone = normalizePakistanPhoneForWhatsApp(options.student.contactNo);
    const waUrl = `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(messageText)}`;

    // Deduplication check for automatic IN / OUT within the same day
    if (
      !options.bypassDuplicateCheck &&
      (resolvedDirection === 'IN' || resolvedDirection === 'OUT') &&
      this.hasAlreadySentToday(options.student.id, resolvedDirection, todayIso)
    ) {
      const skippedLog: WhatsAppNotificationLogItem = {
        id: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        studentId: options.student.id,
        studentName: options.student.name,
        fatherName: options.student.fatherName,
        className: options.student.classId,
        parentPhone: options.student.contactNo || '0336-9053352',
        direction: resolvedDirection,
        messageText,
        date: todayIso,
        time: timeStr,
        timestamp: new Date().toISOString(),
        deliveryMethod:
          settings.mode === 'cloud_api' && settings.accessToken
            ? 'WhatsApp Business Cloud API'
            : 'Manual WhatsApp (wa.me)',
        status: 'Duplicate Skipped',
      };
      return {
        sent: false,
        duplicateSkipped: true,
        reason: 'Already notified today',
        logItem: skippedLog,
        waUrl,
      };
    }

    let status: WhatsAppNotificationLogItem['status'] = 'Queued / Logged';
    let deliveryMethod: WhatsAppNotificationLogItem['deliveryMethod'] = 'Manual WhatsApp (wa.me)';

    // If official WhatsApp Business Platform Cloud API credentials are provided, send directly via Graph API
    if (
      settings.enabled &&
      settings.mode === 'cloud_api' &&
      settings.phoneNumberId.trim() &&
      settings.accessToken.trim()
    ) {
      deliveryMethod = 'WhatsApp Business Cloud API';
      try {
        const res = await fetch(
          `https://graph.facebook.com/v20.0/${settings.phoneNumberId.trim()}/messages`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${settings.accessToken.trim()}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messaging_product: 'whatsapp',
              to: normalizedPhone,
              type: 'text',
              text: { body: messageText },
            }),
          }
        );
        if (res.ok) {
          status = 'Sent (API)';
        } else {
          status = 'Failed (Fallback Used)';
          if (options.openWhatsAppWindowIfManual) {
            const a = document.createElement('a');
            a.href = waUrl;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
          }
        }
      } catch {
        status = 'Failed (Fallback Used)';
        if (options.openWhatsAppWindowIfManual) {
          const a = document.createElement('a');
          a.href = waUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      }
    } else {
      // Manual WhatsApp mode or instant log
      if (options.openWhatsAppWindowIfManual) {
        const a = document.createElement('a');
        a.href = waUrl;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        status = 'Opened in WhatsApp';
      } else {
        status = 'Queued / Logged';
      }
    }

    const logItem: WhatsAppNotificationLogItem = {
      id: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      studentId: options.student.id,
      studentName: options.student.name,
      fatherName: options.student.fatherName,
      className: options.student.classId,
      parentPhone: options.student.contactNo || '0336-9053352',
      direction: resolvedDirection,
      messageText,
      date: todayIso,
      time: timeStr,
      timestamp: new Date().toISOString(),
      deliveryMethod,
      status,
    };

    const existing = this.getLogs();
    this.saveLogs([logItem, ...existing]);

    return {
      sent: true,
      duplicateSkipped: false,
      logItem,
      waUrl,
    };
  },
};
