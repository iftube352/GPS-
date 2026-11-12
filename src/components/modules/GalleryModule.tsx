import React, { useState, useEffect, useRef } from 'react';
import {
  Image as ImageIcon,
  Video,
  Trash2,
  X,
  Play,
  CheckSquare,
  Square,
  Upload,
} from 'lucide-react';
import { GalleryItem, VideoItem } from '../../types';
import { StorageService } from '../../services/storage';
import { readFileAsDataUrl, shareDocumentOrFile } from '../../services/printAndFileService';
import { ViewModeToggle, useViewMode } from '../common/ViewModeToggle';

interface GalleryModuleProps {
  lang: 'en' | 'ur';
}

export const GalleryModule: React.FC<GalleryModuleProps> = ({ lang }) => {
  const [photos, setPhotos] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [viewMode, setViewMode] = useViewMode('gallery_module');
  const [activeMediaFilter, setActiveMediaFilter] = useState<'ALL' | 'PHOTOS' | 'VIDEOS'>('ALL');

  // Batch Delete Selection Mode
  const [deleteSelectionMode, setDeleteSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);

  // Add Photo Modal
  const [showAddPhotoModal, setShowAddPhotoModal] = useState(false);
  const [photoTitle, setPhotoTitle] = useState('');
  const [photoCategory, setPhotoCategory] = useState<GalleryItem['category']>('Events');
  const [photoDescription, setPhotoDescription] = useState('');
  const [uploadedPhotoUrls, setUploadedPhotoUrls] = useState<string[]>([]);
  const photoFileInputRef = useRef<HTMLInputElement>(null);

  // Add Video Modal
  const [showAddVideoModal, setShowAddVideoModal] = useState(false);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubject, setVideoSubject] = useState('School Event');
  const [videoClassName, setVideoClassName] = useState('All Classes');
  const [videoDuration, setVideoDuration] = useState('05:30');
  const [videoYoutubeId, setVideoYoutubeId] = useState('');
  const [uploadedVideoDataUrl, setUploadedVideoDataUrl] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Lightbox / Video Player Modal
  const [viewingPhoto, setViewingPhoto] = useState<GalleryItem | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoItem | null>(null);

  const refresh = () => {
    setPhotos(StorageService.getGallery());
    setVideos(StorageService.getVideos());
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleMultiplePhotosSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const urls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      try {
        const res = await readFileAsDataUrl(files[i], 'Gallery/Photos/KG', 'Gallery');
        urls.push(res.dataUrl);
      } catch {
        // ignore
      }
    }
    setUploadedPhotoUrls((prev) => [...prev, ...urls]);
  };

  const handleSavePhotos = (e: React.FormEvent) => {
    e.preventDefault();
    if (uploadedPhotoUrls.length === 0) return;

    uploadedPhotoUrls.forEach((url, index) => {
      const item: GalleryItem = {
        id: `g-${Date.now()}-${index}`,
        title:
          uploadedPhotoUrls.length > 1
            ? `${photoTitle || 'School Photo'} (${index + 1})`
            : photoTitle || 'School Activity Photo',
        category: photoCategory,
        date: new Date().toISOString().split('T')[0],
        imageUrl: url,
        mediaType: 'photo',
        description:
          photoDescription || 'GPS Chambai Kohat school activity record.',
      };
      StorageService.addGalleryItem(item);
    });

    setUploadedPhotoUrls([]);
    setPhotoTitle('');
    setPhotoDescription('');
    setShowAddPhotoModal(false);
    refresh();
  };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await readFileAsDataUrl(file, 'Videos/KG', 'Gallery');
      setUploadedVideoDataUrl(res.dataUrl);
      if (!videoTitle) {
        setVideoTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    } catch {
      // ignore
    }
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim()) return;

    const newVid: VideoItem = {
      id: `v-${Date.now()}`,
      title: videoTitle.trim(),
      className: videoClassName,
      subject: videoSubject,
      duration: videoDuration || '05:00',
      youtubeId: videoYoutubeId.trim() || 'M7lc1UVf-VE',
      videoUrl: uploadedVideoDataUrl || undefined,
      thumbnailUrl:
        'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80',
      description: 'Uploaded via GPS Chambai School Gallery',
    };
    StorageService.addVideo(newVid);
    setVideoTitle('');
    setVideoYoutubeId('');
    setUploadedVideoDataUrl('');
    setShowAddVideoModal(false);
    refresh();
  };

  const toggleSelectItem = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteTopButtonClick = () => {
    if (!deleteSelectionMode) {
      setDeleteSelectionMode(true);
      setSelectedIds([]);
      return;
    }
    if (selectedIds.length === 0) {
      setDeleteSelectionMode(false);
      return;
    }
    setShowConfirmDeleteModal(true);
  };

  const executeConfirmedDelete = () => {
    selectedIds.forEach((id) => {
      if (id.startsWith('v-')) {
        StorageService.deleteVideo(id);
      } else {
        StorageService.deleteGalleryItem(id);
      }
    });
    setSelectedIds([]);
    setDeleteSelectionMode(false);
    setShowConfirmDeleteModal(false);
    refresh();
  };

  return (
    <div className="p-3.5 space-y-4 pb-8 animate-fade-in">
      {/* Header & PART 9 Top Buttons: Add Photo | Add Videos | Delete */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-4 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black tracking-tight">
              {lang === 'ur' ? 'سکول گیلری اور ویڈیوز' : 'School Gallery & Videos'}
            </h2>
          </div>
          <span className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">
            {photos.length} Photos • {videos.length} Videos
          </span>
        </div>

        {/* Exact 3 Top Buttons required in Part 9 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => {
              setUploadedPhotoUrls([]);
              setPhotoTitle('');
              setShowAddPhotoModal(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-white text-orange-700 text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <ImageIcon size={15} />
            <span>Add Photo</span>
          </button>

          <button
            onClick={() => {
              setVideoTitle('');
              setUploadedVideoDataUrl('');
              setShowAddVideoModal(true);
            }}
            className="py-2.5 px-3 rounded-2xl bg-slate-900 text-white text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Video size={15} />
            <span>Add Videos</span>
          </button>

          <button
            onClick={handleDeleteTopButtonClick}
            className={`py-2.5 px-3 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
              deleteSelectionMode
                ? 'bg-rose-600 text-white ring-2 ring-white'
                : 'bg-white/20 hover:bg-white/30 text-white'
            }`}
          >
            <Trash2 size={15} />
            <span>
              {deleteSelectionMode
                ? selectedIds.length > 0
                  ? `Delete (${selectedIds.length})`
                  : 'Cancel Select'
                : 'Delete'}
            </span>
          </button>
        </div>
      </div>

      {/* Media Filter Tabs + ViewModeToggle */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1.5">
          {(['ALL', 'PHOTOS', 'VIDEOS'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveMediaFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black ${
                activeMediaFilter === tab
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-700 border border-slate-200'
              }`}
            >
              {tab === 'ALL'
                ? `All Media (${photos.length + videos.length})`
                : tab === 'PHOTOS'
                ? `Photos (${photos.length})`
                : `Videos (${videos.length})`}
            </button>
          ))}
        </div>
        <ViewModeToggle mode={viewMode} onChange={setViewMode} />
      </div>

      {/* Photos Grid / List */}
      {(activeMediaFilter === 'ALL' || activeMediaFilter === 'PHOTOS') && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-3' : 'space-y-2.5'}>
          {photos.map((item) => {
            const isSelected = selectedIds.includes(item.id);
            return (
              <div
                key={item.id}
                onClick={() =>
                  deleteSelectionMode ? toggleSelectItem(item.id) : setViewingPhoto(item)
                }
                className={`group relative bg-white rounded-2xl overflow-hidden border shadow-xs cursor-pointer transition-all ${
                  isSelected
                    ? 'border-rose-600 ring-2 ring-rose-500'
                    : 'border-slate-200 hover:-translate-y-0.5'
                }`}
              >
                <div className="relative h-36 w-full bg-slate-100">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 text-white text-[9px] font-black">
                    {item.category}
                  </span>

                  {deleteSelectionMode ? (
                    <div className="absolute top-2 right-2 bg-white rounded-lg p-1 shadow-md">
                      {isSelected ? (
                        <CheckSquare size={16} className="text-rose-600" />
                      ) : (
                        <Square size={16} className="text-slate-400" />
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIds([item.id]);
                        setShowConfirmDeleteModal(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white"
                      title="Delete Photo"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="p-2.5">
                  <h4 className="text-xs font-black text-slate-900 truncate">{item.title}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">{item.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Videos Grid */}
      {(activeMediaFilter === 'ALL' || activeMediaFilter === 'VIDEOS') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {videos.map((vid) => {
            const isSelected = selectedIds.includes(vid.id);
            return (
              <div
                key={vid.id}
                onClick={() =>
                  deleteSelectionMode ? toggleSelectItem(vid.id) : setPlayingVideo(vid)
                }
                className={`relative bg-white rounded-2xl overflow-hidden border shadow-xs cursor-pointer ${
                  isSelected ? 'border-rose-600 ring-2 ring-rose-500' : 'border-slate-200'
                }`}
              >
                <div className="relative h-36 bg-slate-900">
                  <img
                    src={vid.thumbnailUrl}
                    alt={vid.title}
                    className="w-full h-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-lg">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/75 text-white text-[10px] font-mono">
                    {vid.duration}
                  </span>

                  {!deleteSelectionMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIds([vid.id]);
                        setShowConfirmDeleteModal(true);
                      }}
                      className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 hover:bg-rose-600 text-white"
                      title="Delete Video"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
                <div className="p-3">
                  <h4 className="text-xs font-black text-slate-900 truncate">{vid.title}</h4>
                  <p className="text-[10px] text-slate-500 font-semibold">
                    {vid.className} • {vid.subject}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Photo Modal (Supports Multiple Photos) */}
      {showAddPhotoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSavePhotos}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">
                Add Photos to School Gallery
              </h3>
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <input
              ref={photoFileInputRef}
              type="file"
              accept=".jpg,.jpeg,.png"
              multiple
              onChange={handleMultiplePhotosSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => photoFileInputRef.current?.click()}
              className="w-full py-4 px-3 rounded-2xl border-2 border-dashed border-orange-300 bg-orange-50/50 text-orange-800 text-xs font-black flex flex-col items-center justify-center gap-1"
            >
              <Upload size={20} />
              <span>Select Single or Multiple Photos (JPG, JPEG, PNG)</span>
              {uploadedPhotoUrls.length > 0 && (
                <span className="text-[11px] text-emerald-700 font-bold">
                  {uploadedPhotoUrls.length} photo(s) ready to save
                </span>
              )}
            </button>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Photo Event Title
              </label>
              <input
                type="text"
                required
                value={photoTitle}
                onChange={(e) => setPhotoTitle(e.target.value)}
                placeholder="e.g., Morning Assembly / Annual Sports"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Category
              </label>
              <select
                value={photoCategory}
                onChange={(e) =>
                  setPhotoCategory(e.target.value as GalleryItem['category'])
                }
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              >
                <option value="Events">Events</option>
                <option value="Classroom">Classroom</option>
                <option value="Sports">Sports</option>
                <option value="Plantation">Plantation</option>
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPhotoModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploadedPhotoUrls.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-orange-600 disabled:opacity-40 text-white text-xs font-black"
              >
                Save Photo(s)
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Video Modal */}
      {showAddVideoModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveVideo}
            className="bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-3.5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">Add Video to Gallery</h3>
              <button
                type="button"
                onClick={() => setShowAddVideoModal(false)}
                className="p-1.5 rounded-xl bg-slate-100 text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <input
              ref={videoFileInputRef}
              type="file"
              accept="video/*"
              onChange={handleVideoFileUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => videoFileInputRef.current?.click()}
              className="w-full py-3.5 px-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-700 text-xs font-black flex flex-col items-center justify-center gap-1"
            >
              <Upload size={18} />
              <span>
                {uploadedVideoDataUrl
                  ? 'Local Video File Selected'
                  : 'Upload Video File from Device'}
              </span>
            </button>

            <div>
              <label className="block text-[11px] font-black text-slate-700 mb-1">
                Video Title
              </label>
              <input
                type="text"
                required
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                placeholder="e.g., Kachi Phonics Lesson / Speech Competition"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Class / Event
                </label>
                <input
                  type="text"
                  value={videoClassName}
                  onChange={(e) => setVideoClassName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-700 mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  value={videoDuration}
                  onChange={(e) => setVideoDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddVideoModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-black"
              >
                Save Video
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Photo Lightbox */}
      {viewingPhoto && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl overflow-hidden shadow-2xl">
            <img
              src={viewingPhoto.imageUrl}
              alt={viewingPhoto.title}
              className="w-full max-h-[65vh] object-contain bg-black"
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black text-slate-900">{viewingPhoto.title}</h4>
                <p className="text-xs text-slate-500 font-semibold">
                  {viewingPhoto.category} • {viewingPhoto.date}
                </p>
              </div>
              <button
                onClick={() => setViewingPhoto(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal with Playback Controls */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 flex flex-col items-center justify-center p-4">
          <div className="max-w-lg w-full bg-slate-900 text-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            <div className="aspect-video w-full bg-black">
              {playingVideo.videoUrl ? (
                <video
                  src={playingVideo.videoUrl}
                  controls
                  autoPlay
                  className="w-full h-full"
                />
              ) : (
                <iframe
                  title={playingVideo.title}
                  src={`https://www.youtube.com/embed/${playingVideo.youtubeId}?autoplay=1`}
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{playingVideo.title}</h4>
                <p className="text-xs text-slate-400 font-semibold">
                  {playingVideo.className} • {playingVideo.subject}
                </p>
              </div>
              <button
                onClick={() => setPlayingVideo(null)}
                className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-black"
              >
                Close Player
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-2xl border border-slate-200 space-y-4">
            <h4 className="text-base font-black text-slate-900">Confirm Media Deletion</h4>
            <p className="text-xs text-slate-600 font-semibold">
              Are you sure you want to delete {selectedIds.length} selected item(s) from the
              School Gallery?
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirmDeleteModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-black"
              >
                Cancel
              </button>
              <button
                onClick={executeConfirmedDelete}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white text-xs font-black"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
