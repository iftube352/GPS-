import React, { useState } from 'react';
import {
  MessageSquare,
  Save,
  CheckCircle2,
  Send,
  Plus,
  Trash2,
  Clock,
  Phone,
  User,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { WhatsAppSettings, WhatsAppParentEntry, WhatsAppNotificationLog } from '../../../types';
import { StorageService } from '../../../services/storage';

export const WhatsAppSettingsSection: React.FC = () => {
  const [settings, setSettings] = useState<WhatsAppSettings>(() => StorageService.getWhatsAppSettings());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'parents' | 'templates' | 'history'>('parents');

  // New parent form state
  const [newStudentName, setNewStudentName] = useState('');
  const [newParentName, setNewParentName] = useState('');
  const [newClass, setNewClass] = useState('Class 1');
  const [newPhone, setNewPhone] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = () => {
    StorageService.saveWhatsAppSettings(settings);
    showToast('WhatsApp integration settings saved permanently!');
  };

  const handleAddParent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim() || !newPhone.trim()) return;

    const entry: WhatsAppParentEntry = {
      id: `wp-${Date.now()}`,
      studentId: `s-${Date.now()}`,
      studentName: newStudentName.trim(),
      parentName: newParentName.trim() || 'Parent',
      className: newClass,
      phone: newPhone.trim(),
    };

    const updated = {
      ...settings,
      parents: [...settings.parents, entry],
    };
    setSettings(updated);
    StorageService.saveWhatsAppSettings(updated);
    setNewStudentName('');
    setNewParentName('');
    setNewPhone('');
    showToast(`Added WhatsApp contact for ${entry.studentName}!`);
  };

  const handleDeleteParent = (id: string) => {
    const updated = {
      ...settings,
      parents: settings.parents.filter((p) => p.id !== id),
    };
    setSettings(updated);
    StorageService.saveWhatsAppSettings(updated);
    showToast('Contact removed.');
  };

  const handleSendTest = (parent: WhatsAppParentEntry) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toISOString().split('T')[0];

    const msg = settings.templates.studentIn
      .replace('{studentName}', parent.studentName)
      .replace('{className}', parent.className)
      .replace('{schoolName}', 'Govt Primary School Chambai Kohat')
      .replace('{date}', dateStr)
      .replace('{time}', timeStr);

    // Record notification
    StorageService.logWhatsAppNotification({
      studentId: parent.studentId,
      studentName: parent.studentName,
      className: parent.className,
      type: 'IN',
      date: dateStr,
      time: timeStr,
      status: 'Sent',
      phone: parent.phone,
      message: msg,
      channel: 'WhatsApp',
    });

    setSettings(StorageService.getWhatsAppSettings());

    // Open WhatsApp Web/App
    const cleanPhone = parent.phone.replace(/[^0-9]/g, '');
    const formatted = cleanPhone.startsWith('92') ? cleanPhone : `92${cleanPhone.replace(/^0/, '')}`;
    window.open(`https://wa.me/${formatted}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="space-y-4 animate-fade-in text-slate-900">
      {/* Title Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/15 text-emerald-700 flex items-center justify-center font-black">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                WhatsApp Message Settings &amp; Student IN/OUT System
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Automatic parent attendance notification integration
              </p>
            </div>
          </div>

          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm"
          >
            <Save size={14} />
            <span>Save Settings</span>
          </button>
        </div>

        {/* Global Toggles */}
        <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="checkbox"
              checked={settings.autoNotifyOnIn}
              onChange={(e) => setSettings({ ...settings, autoNotifyOnIn: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
            />
            <span>Auto Notify on Student IN</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="checkbox"
              checked={settings.autoNotifyOnOut}
              onChange={(e) => setSettings({ ...settings, autoNotifyOnOut: e.target.checked })}
              className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
            />
            <span>Auto Notify on Student OUT</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
            <input
              type="checkbox"
              checked={settings.enableSmsFallback}
              onChange={(e) => setSettings({ ...settings, enableSmsFallback: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 accent-blue-600"
            />
            <span>SMS Fallback Enabled</span>
          </label>
        </div>

        {toastMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Sub Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-2xl text-xs font-black">
          <button
            onClick={() => setActiveTab('parents')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'parents' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            1. Registered Parents ({settings.parents.length})
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'templates' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            2. Message Templates
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeTab === 'history' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            3. Notification History ({settings.logs.length})
          </button>
        </div>

        {/* TAB 1: Parents Directory */}
        {activeTab === 'parents' && (
          <div className="space-y-3">
            {/* Add Parent Form */}
            <form onSubmit={handleAddParent} className="bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-200 grid grid-cols-1 sm:grid-cols-5 gap-2 text-xs">
              <input
                type="text"
                placeholder="Student Name *"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                required
              />
              <input
                type="text"
                placeholder="Parent Name"
                value={newParentName}
                onChange={(e) => setNewParentName(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
              />
              <select
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
              >
                <option value="KG (ECE)">KG (ECE)</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
              </select>
              <input
                type="tel"
                placeholder="WhatsApp # (0336...) *"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-900"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black flex items-center justify-center gap-1 shadow-sm"
              >
                <Plus size={14} />
                <span>Add Parent</span>
              </button>
            </form>

            {/* Parents List */}
            <div className="space-y-2">
              {settings.parents.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 p-3 rounded-2xl border border-slate-200 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs shrink-0">
                      {p.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {p.studentName} <span className="text-[10px] text-slate-500 font-bold">({p.className})</span>
                      </div>
                      <div className="text-[11px] text-slate-600 font-semibold">
                        Parent: {p.parentName} • <span className="font-mono text-emerald-700">{p.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSendTest(p)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black flex items-center gap-1"
                      title="Send Test IN Attendance Message"
                    >
                      <Send size={12} />
                      <span>Send IN</span>
                    </button>
                    <button
                      onClick={() => handleDeleteParent(p.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Remove"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <label className="font-black text-slate-800">1. Student IN School Message Template</label>
              <textarea
                rows={3}
                value={settings.templates.studentIn}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: { ...settings.templates, studentIn: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
              <span className="text-[10px] text-slate-400">
                Variables: {'{studentName}'}, {'{className}'}, {'{schoolName}'}, {'{date}'}, {'{time}'}
              </span>
            </div>

            <div className="space-y-1">
              <label className="font-black text-slate-800">2. Student OUT School Message Template</label>
              <textarea
                rows={3}
                value={settings.templates.studentOut}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: { ...settings.templates, studentOut: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>

            <div className="space-y-1">
              <label className="font-black text-slate-800">3. General Announcement Template</label>
              <textarea
                rows={2}
                value={settings.templates.general}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    templates: { ...settings.templates, general: e.target.value },
                  })
                }
                className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-medium"
              />
            </div>
          </div>
        )}

        {/* TAB 3: History */}
        {activeTab === 'history' && (
          <div className="space-y-2">
            {settings.logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-6">No notification logs recorded yet.</p>
            ) : (
              settings.logs.map((log) => (
                <div
                  key={log.id}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                          log.type === 'IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {log.type} Attendance
                      </span>
                      <span className="font-black text-slate-900">{log.studentName} ({log.className})</span>
                      <span className="text-[10px] text-slate-400">· {log.time} ({log.date})</span>
                    </div>
                    <p className="text-[11px] text-slate-600 truncate">{log.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ {log.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
