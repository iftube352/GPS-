import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  ArrowLeft, 
  Play, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Video, 
  AlertCircle,
  X
} from 'lucide-react';
import { VideoItem, Language, SchoolClass } from '../../types';
import { translations } from '../../i18n/translations';
import { StorageService } from '../../services/storage';
import { Modal } from '../common/Modal';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface VideosModuleProps {
  onBack?: () => void;
  currentLang?: Language;
  lang?: Language;
}

// YouTube video ID extraction helper
export function extractYouTubeId(url: string): string | null {
  if (!url) return null;
  // Match youtube.com/watch?v=ID, youtu.be/ID, youtube.com/embed/ID, youtube.com/shorts/ID
  const regExp = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export const VideosModule: React.FC<VideosModuleProps> = ({ onBack, currentLang, lang }) => {
  const resolvedLang: Language = lang || currentLang || 'en';
  const t = translations[resolvedLang];
  const [classes] = useState<SchoolClass[]>(StorageService.getClasses());
  const [videos, setVideos] = useState<VideoItem[]>(StorageService.getVideos());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');

  // Modals & Playback states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [activePlaybackVideo, setActivePlaybackVideo] = useState<VideoItem | null>(null);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    youtubeUrl: '',
    classId: classes[0]?.id || 'c-5',
    subject: 'General Science',
    description: ''
  });
  const [urlError, setUrlError] = useState('');

  const refreshList = () => {
    setVideos(StorageService.getVideos());
  };

  const handleOpenAdd = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      youtubeUrl: '',
      classId: classes[0]?.id || 'c-5',
      subject: 'General Science',
      description: ''
    });
    setUrlError('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (vid: VideoItem) => {
    setEditingVideo(vid);
    setFormData({
      title: vid.title,
      youtubeUrl: vid.youtubeUrl || vid.videoUrl || '',
      classId: vid.classId || 'c-5',
      subject: vid.subject,
      description: vid.description || ''
    });
    setUrlError('');
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const videoId = extractYouTubeId(formData.youtubeUrl);
    if (!videoId) {
      setUrlError(t.invalidYoutubeUrl);
      return;
    }

    const videoItem: VideoItem = {
      id: editingVideo ? editingVideo.id : `video-${Date.now()}`,
      title: formData.title.trim() || `Lesson: ${formData.subject}`,
      youtubeUrl: formData.youtubeUrl.trim(),
      youtubeId: videoId,
      thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      classId: formData.classId,
      subject: formData.subject.trim(),
      description: formData.description.trim(),
      dateAdded: editingVideo ? editingVideo.dateAdded : new Date().toISOString().split('T')[0]
    };

    StorageService.saveVideo(videoItem);
    setIsAddModalOpen(false);
    refreshList();
  };

  const handleDelete = () => {
    if (!videoToDelete) return;
    StorageService.deleteVideo(videoToDelete.id);
    setVideoToDelete(null);
    refreshList();
  };

  const filteredVideos = videos.filter(v => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (v.description && v.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesClass = selectedClassFilter === 'all' || v.classId === selectedClassFilter;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-5 pb-20">
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
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {t.moduleVideos}
            </h2>
            <p className="text-xs text-slate-500">
              {t.moduleVideosDesc} ({videos.length} {t.moduleVideos})
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addVideo}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 absolute left-3.5 rtl:right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchVideos}
            className="w-full pl-10 pr-4 rtl:pr-10 rtl:pl-4 py-2 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="w-full py-2 px-3 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white"
          >
            <option value="all">{t.allClasses}</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Video Grid */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
            <Video className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">{t.emptyStateTitle}</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">{t.emptyStateSubtitle}</p>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold"
          >
            {t.addVideo}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((vid) => {
            const classObj = classes.find(c => c.id === vid.classId);

            return (
              <div
                key={vid.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Thumbnail & Play Overlay */}
                  <div 
                    onClick={() => setActivePlaybackVideo(vid)}
                    className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden"
                  >
                    <img
                      src={vid.thumbnailUrl}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback image if youtube thumbnail fails
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                    <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/20 flex items-center justify-center transition-colors">
                      <div className="w-12 h-12 rounded-full bg-rose-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-115 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    <span className="absolute bottom-2 right-2 rtl:left-2 rtl:right-auto px-2 py-0.5 rounded bg-black/75 text-[10px] text-white font-medium">
                      {classObj ? classObj.name : 'GPS'}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <span className="text-[11px] font-semibold text-rose-600 block">
                      {vid.subject}
                    </span>
                    <h3 
                      onClick={() => setActivePlaybackVideo(vid)}
                      className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug cursor-pointer hover:text-rose-600 transition-colors"
                    >
                      {vid.title}
                    </h3>
                    {vid.description && (
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {vid.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => setActivePlaybackVideo(vid)}
                    className="text-rose-600 hover:text-rose-700 font-semibold inline-flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 fill-rose-600" />
                    <span>{t.playVideo}</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEdit(vid)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors"
                      title={t.edit}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setVideoToDelete(vid)}
                      className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                      title={t.delete}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Playback Modal with Official YouTube Embedded Player */}
      {activePlaybackVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-700 flex flex-col">
            {/* Playback Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 text-white">
              <div className="truncate pr-4">
                <h4 className="text-sm font-bold text-white truncate">
                  {activePlaybackVideo.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {activePlaybackVideo.subject} · ID: {activePlaybackVideo.youtubeId}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={activePlaybackVideo.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{t.openInYoutube}</span>
                </a>
                <button
                  onClick={() => setActivePlaybackVideo(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded YouTube Iframe Player */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activePlaybackVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                title={activePlaybackVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            {/* Details Footer */}
            <div className="p-4 bg-slate-800 text-xs text-slate-300 space-y-1">
              <p className="font-semibold text-white">
                {activePlaybackVideo.title}
              </p>
              <p className="text-slate-400">
                {activePlaybackVideo.description || 'Educational video resource for students of Govt Primary School Chambai Kohat.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Video Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingVideo ? t.editVideo : t.addVideo}
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.youtubeUrl} *
            </label>
            <input
              type="text"
              required
              value={formData.youtubeUrl}
              onChange={(e) => {
                setFormData({ ...formData, youtubeUrl: e.target.value });
                setUrlError('');
              }}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">{t.youtubeUrlHint}</p>
            {urlError && (
              <p className="text-[11px] text-rose-600 font-semibold mt-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{urlError}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.videoTitle}
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Class 5 Fractions Explained"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.selectClass} *
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-white"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                {t.subject} *
              </label>
              <input
                type="text"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Math, Science, Urdu..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {t.description}
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief summary of topic..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white rounded-lg shadow-sm"
            >
              {t.save}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!videoToDelete}
        onClose={() => setVideoToDelete(null)}
        onConfirm={handleDelete}
        title={t.delete}
        message={t.deleteVideoConfirm}
        currentLang={resolvedLang}
      />
    </div>
  );
};
