import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Plus,
  X,
  ArrowRight,
  Trash2,
  BookOpen,
  Users,
  Share2,
  Calendar,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { ActiveScreen, AppNotificationItem } from '../../types';
import { StorageService } from '../../services/storage';

interface NotificationsModuleProps {
  onNavigate: (screen: ActiveScreen) => void;
  lang: 'en' | 'ur';
}

type FilterCategory = 'ALL' | 'Order Book' | 'PTC Meeting' | 'Academic' | 'Finance' | 'Exam';

export const NotificationsModule: React.FC<NotificationsModuleProps> = ({
  onNavigate,
  lang,
}) => {
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalMode, setModalMode] = useState<'standard' | 'order_book' | 'ptc_meeting'>('standard');

  // Form states
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [category, setCategory] = useState<AppNotificationItem['category']>('Academic');
  const [targetScreen, setTargetScreen] = useState<ActiveScreen>('home');

  // Order Book specific
  const [orderNo, setOrderNo] = useState(`OB-${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`);
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [directiveTopic, setDirectiveTopic] = useState('Staff Duty & School Cleanliness');

  // PTC Meeting specific
  const [ptcDate, setPtcDate] = useState(new Date().toISOString().split('T')[0]);
  const [ptcTime, setPtcTime] = useState('10:00 AM');
  const [ptcVenue, setPtcVenue] = useState('GPS Chambai Office / Ground');
  const [ptcAgenda, setPtcAgenda] = useState('Discussion on PTC Capitation & Repair Grants');

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const refresh = () => {
    setNotifications(StorageService.getNotifications());
  };

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('gps-notifications-updated', handleUpdate);
    return () => window.removeEventListener('gps-notifications-updated', handleUpdate);
  }, []);

  const handleMarkAllRead = () => {
    StorageService.markAllNotificationsRead();
    refresh();
    showToast(lang === 'ur' ? 'تمام نوٹسز پڑھے ہوئے نشان زد ہو گئے' : 'All notices marked as read');
  };

  const handleDeleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    StorageService.deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    showToast(lang === 'ur' ? 'نوٹس حذف کر دیا گیا' : 'Notification deleted successfully');
  };

  const handleDeleteAll = () => {
    if (notifications.length === 0) return;
    setShowDeleteAllModal(true);
  };

  const confirmDeleteAll = () => {
    StorageService.deleteAllNotifications();
    setNotifications([]);
    setShowDeleteAllModal(false);
    showToast(lang === 'ur' ? 'تمام نوٹسز ختم کر دیے گئے' : 'All notifications deleted');
  };

  const openOrderBookModal = () => {
    setModalMode('order_book');
    const autoNo = `OB-${new Date().getFullYear()}/${Math.floor(Math.random() * 900 + 100)}`;
    setOrderNo(autoNo);
    setTitle(`Office Order Book #${autoNo}`);
    setMessage(
      `Under the instructions of Head Teacher GPS Chambai Kohat, all teaching and non-teaching staff are hereby directed regarding: ${directiveTopic}. Compliance is strictly required.`
    );
    setCategory('Order Book');
    setTargetScreen('other_office_data');
    setShowAddModal(true);
  };

  const openPtcMeetingModal = () => {
    setModalMode('ptc_meeting');
    setTitle(`PTC Council Emergency Meeting - ${ptcDate}`);
    setMessage(
      `An important meeting of the Parent Teacher Council (PTC) GPS Chambai Kohat is scheduled for ${ptcDate} at ${ptcTime} at ${ptcVenue}. Agenda: ${ptcAgenda}. All members are requested to attend.`
    );
    setCategory('PTC Meeting');
    setTargetScreen('ptc_fund');
    setShowAddModal(true);
  };

  const openStandardModal = () => {
    setModalMode('standard');
    setTitle('');
    setMessage('');
    setCategory('Academic');
    setTargetScreen('home');
    setShowAddModal(true);
  };

  const handleSaveNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;

    StorageService.addNotification({
      id: `notif-${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      date: new Date().toISOString().split('T')[0],
      category,
      read: false,
      targetScreen,
    });

    setShowAddModal(false);
    refresh();
  };

  const handleShareWhatsApp = (e: React.MouseEvent, notif: AppNotificationItem) => {
    e.stopPropagation();
    const text = encodeURIComponent(
      `📢 *GOVT PRIMARY SCHOOL CHAMBAI KOHAT*\n*Notice: ${notif.title}*\n📅 Date: ${notif.date}\n📂 Category: ${notif.category}\n\n${notif.message}\n\n- Head Teacher / PTC Chairman GPS Chambai`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeFilter === 'ALL') return true;
    return n.category === activeFilter;
  });

  return (
    <div className="p-3.5 space-y-4 pb-12 animate-fade-in max-w-4xl mx-auto">
      {/* Toast Feedback Alert */}
      {toastMsg && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center justify-between animate-fade-in">
          <span>{toastMsg}</span>
          <button
            type="button"
            onClick={() => setToastMsg(null)}
            className="p-1 hover:bg-emerald-700 rounded-lg transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Banner with Action Buttons */}
      <div className="bg-gradient-to-r from-pink-600 via-rose-600 to-amber-600 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-black/20 px-2.5 py-0.5 rounded-full inline-block">
              Official School Alerts & Circulars
            </span>
            <h2 className="text-xl font-black tracking-tight mt-1 flex items-center gap-2">
              <Bell size={22} className="text-amber-300" />
              <span>{lang === 'ur' ? 'اطلاعات، آرڈر بک اور پی ٹی سی نوٹس' : 'Notifications & Order Book'}</span>
            </h2>
            <p className="text-xs text-rose-100 font-medium">
              GPS Chambai Kohat • EMIS: 16454
            </p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={handleMarkAllRead}
              className="px-2.5 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-black flex items-center gap-1 transition-all active:scale-95"
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>{lang === 'ur' ? 'سب پڑھ لیں' : 'Mark Read'}</span>
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
              className="px-2.5 py-1.5 rounded-xl bg-rose-900/40 hover:bg-rose-950/70 text-rose-200 text-xs font-black flex items-center gap-1 transition-all disabled:opacity-40"
              title="Delete all notifications"
            >
              <Trash2 size={14} />
              <span>{lang === 'ur' ? 'تمام ختم کریں' : 'Delete All'}</span>
            </button>
          </div>
        </div>

        {/* Quick Notice Creation Bar */}
        <div className="pt-2 border-t border-white/20 flex flex-wrap gap-2">
          <button
            onClick={openOrderBookModal}
            className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <BookOpen size={15} />
            <span>+ {lang === 'ur' ? 'آرڈر بک نوٹس' : 'Order Book'}</span>
          </button>
          <button
            onClick={openPtcMeetingModal}
            className="flex-1 min-w-[130px] px-3 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Users size={15} />
            <span>+ {lang === 'ur' ? 'پی ٹی سی اجلاس' : 'PTC Meeting'}</span>
          </button>
          <button
            onClick={openStandardModal}
            className="px-3 py-2 rounded-xl bg-white text-pink-700 hover:bg-pink-50 text-xs font-black flex items-center justify-center gap-1 shadow-md active:scale-95 transition-all"
          >
            <Plus size={15} />
            <span>{lang === 'ur' ? 'نیا نوٹس' : 'General Alert'}</span>
          </button>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {(['ALL', 'Order Book', 'PTC Meeting', 'Academic', 'Finance'] as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveFilter(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeFilter === cat
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat === 'ALL'
              ? lang === 'ur' ? 'تمام نوٹسز' : 'All'
              : cat === 'Order Book'
              ? lang === 'ur' ? 'آرڈر بک' : 'Order Book'
              : cat === 'PTC Meeting'
              ? lang === 'ur' ? 'پی ٹی سی اجلاس' : 'PTC Meeting'
              : cat}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center text-slate-400 space-y-2">
            <AlertCircle size={32} className="mx-auto text-slate-300" />
            <p className="text-xs font-bold">
              {lang === 'ur' ? 'کوئی نوٹس موجود نہیں ہے' : 'No notifications found in this category'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((n) => {
            const isOrderBook = n.category === 'Order Book';
            const isPtc = n.category === 'PTC Meeting';

            return (
              <div
                key={n.id}
                onClick={() => n.targetScreen && onNavigate(n.targetScreen)}
                className={`rounded-2xl p-3.5 border shadow-2xs flex flex-col sm:flex-row sm:items-start justify-between gap-3 cursor-pointer transition-all hover:border-slate-300 ${
                  isOrderBook
                    ? 'bg-amber-50/70 border-amber-300/80 ring-1 ring-amber-300/40'
                    : isPtc
                    ? 'bg-emerald-50/70 border-emerald-300/80 ring-1 ring-emerald-300/40'
                    : n.read
                    ? 'bg-white border-slate-200'
                    : 'bg-pink-50/60 border-pink-200 ring-1 ring-pink-300'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                      isOrderBook
                        ? 'bg-amber-500 text-white'
                        : isPtc
                        ? 'bg-emerald-600 text-white'
                        : n.read
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-pink-600 text-white'
                    }`}
                  >
                    {isOrderBook ? <BookOpen size={18} /> : isPtc ? <Users size={18} /> : <Bell size={18} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isOrderBook
                            ? 'bg-amber-200 text-amber-900 font-extrabold'
                            : isPtc
                            ? 'bg-emerald-200 text-emerald-900 font-extrabold'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {n.category}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                        <Calendar size={11} /> {n.date}
                      </span>
                      {!n.read && (
                        <span className="w-2 h-2 rounded-full bg-pink-600 animate-pulse" />
                      )}
                    </div>

                    <h4 className="text-sm font-black text-slate-900 mt-1 leading-snug">
                      {n.title}
                    </h4>
                    <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed whitespace-pre-line">
                      {n.message}
                    </p>

                    {n.targetScreen && n.targetScreen !== 'home' && (
                      <div className="mt-2 text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1">
                        <span>{lang === 'ur' ? 'تفصیلات اور ماڈیول پر جائیں' : 'Go to connected section'}</span>
                        <ArrowRight size={12} />
                      </div>
                    )}
                  </div>
                </div>

                {/* Right action buttons: Delete + Share */}
                <div className="flex items-center gap-1 self-end sm:self-start shrink-0 pt-1">
                  <button
                    type="button"
                    onClick={(e) => handleShareWhatsApp(e, n)}
                    className="p-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-700 transition-colors"
                    title="Share to WhatsApp"
                  >
                    <Share2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteNotification(e, n.id)}
                    className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Create Notice Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveNotification}
            className="bg-white w-full max-w-lg rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                    modalMode === 'order_book'
                      ? 'bg-amber-100 text-amber-700'
                      : modalMode === 'ptc_meeting'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-pink-100 text-pink-700'
                  }`}
                >
                  {modalMode === 'order_book' ? (
                    <BookOpen size={16} />
                  ) : modalMode === 'ptc_meeting' ? (
                    <Users size={16} />
                  ) : (
                    <Bell size={16} />
                  )}
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {modalMode === 'order_book'
                    ? lang === 'ur' ? 'آرڈر بک کا نیا حکمنامہ' : 'Create Order Book Notice'
                    : modalMode === 'ptc_meeting'
                    ? lang === 'ur' ? 'پی ٹی سی اجلاس کا نوٹس' : 'Create PTC Meeting Notice'
                    : lang === 'ur' ? 'نیا اسکول نوٹس / الرٹ' : 'Post School Notification'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                <X size={16} />
              </button>
            </div>

            {/* If Order Book mode, show Order Book helpers */}
            {modalMode === 'order_book' && (
              <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-amber-900 mb-0.5">
                    Order Number
                  </label>
                  <input
                    type="text"
                    value={orderNo}
                    onChange={(e) => {
                      setOrderNo(e.target.value);
                      setTitle(`Office Order Book #${e.target.value}`);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-amber-900 mb-0.5">
                    Order Date
                  </label>
                  <input
                    type="date"
                    value={orderDate}
                    onChange={(e) => setOrderDate(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-300 font-bold bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-amber-900 mb-0.5">
                    Directive Topic / Subject
                  </label>
                  <input
                    type="text"
                    value={directiveTopic}
                    onChange={(e) => {
                      setDirectiveTopic(e.target.value);
                      setMessage(
                        `Under the instructions of Head Teacher GPS Chambai Kohat (Order #${orderNo}), all staff members are hereby directed regarding: ${e.target.value}. Strict compliance is expected.`
                      );
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-300 font-bold bg-white"
                  />
                </div>
              </div>
            )}

            {/* If PTC Meeting mode, show PTC helpers */}
            {modalMode === 'ptc_meeting' && (
              <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-black text-emerald-900 mb-0.5">
                    Meeting Date
                  </label>
                  <input
                    type="date"
                    value={ptcDate}
                    onChange={(e) => {
                      setPtcDate(e.target.value);
                      setTitle(`PTC Council Meeting - ${e.target.value}`);
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 font-bold bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-emerald-900 mb-0.5">
                    Meeting Time
                  </label>
                  <input
                    type="text"
                    value={ptcTime}
                    onChange={(e) => setPtcTime(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 font-bold bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-emerald-900 mb-0.5">
                    Venue
                  </label>
                  <input
                    type="text"
                    value={ptcVenue}
                    onChange={(e) => setPtcVenue(e.target.value)}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 font-bold bg-white"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-black text-emerald-900 mb-0.5">
                    Key Agenda
                  </label>
                  <input
                    type="text"
                    value={ptcAgenda}
                    onChange={(e) => {
                      setPtcAgenda(e.target.value);
                      setMessage(
                        `An important meeting of the Parent Teacher Council (PTC) GPS Chambai Kohat is scheduled for ${ptcDate} at ${ptcTime} at ${ptcVenue}. Agenda: ${e.target.value}. All members are requested to attend.`
                      );
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-emerald-300 font-bold bg-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Notice Title
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                placeholder="Notice title..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) =>
                    setCategory(e.target.value as AppNotificationItem['category'])
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="Order Book">Order Book (آرڈر بک)</option>
                  <option value="PTC Meeting">PTC Meeting (پی ٹی سی)</option>
                  <option value="Academic">Academic (تعلیمی)</option>
                  <option value="Finance">Finance (فنانس)</option>
                  <option value="Admission">Admission (داخلہ)</option>
                  <option value="Exam">Exam (امتحان)</option>
                  <option value="System">System (سسٹم)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Connected Screen
                </label>
                <select
                  value={targetScreen}
                  onChange={(e) => setTargetScreen(e.target.value as ActiveScreen)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                >
                  <option value="home">Home</option>
                  <option value="other_office_data">Office Data / Orders</option>
                  <option value="ptc_fund">PTC Fund & Council</option>
                  <option value="other_daily_diary">Daily Diary</option>
                  <option value="other_attendance">Attendance</option>
                  <option value="classes">Classes</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Notice Message / Order Content
              </label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium"
                placeholder="Detailed circular text..."
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black transition-colors"
              >
                {lang === 'ur' ? 'منسوخ کریں' : 'Cancel'}
              </button>
              <button
                type="submit"
                className={`flex-1 py-2.5 rounded-xl text-white text-xs font-black shadow-md transition-all ${
                  modalMode === 'order_book'
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : modalMode === 'ptc_meeting'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-pink-600 hover:bg-pink-700'
                }`}
              >
                {lang === 'ur' ? 'شائع کریں (Publish)' : 'Publish Notice'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete All In-App Confirmation Modal */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 size={20} />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-900">
                  {lang === 'ur' ? 'تمام نوٹسز حذف کریں؟' : 'Delete All Notifications?'}
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  {lang === 'ur'
                    ? 'کیا آپ واقعی تمام نوٹسز اور آرڈر بکس حذف کرنا چاہتے ہیں؟'
                    : 'Are you sure you want to delete all notices and order books?'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
              >
                {lang === 'ur' ? 'منسوخ' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={confirmDeleteAll}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black shadow-sm transition-all active:scale-95"
              >
                {lang === 'ur' ? 'ہاں، تمام حذف کریں' : 'Yes, Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
