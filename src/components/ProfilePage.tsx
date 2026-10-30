import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Check,
  Edit2,
  Camera,
  Upload,
  User,
  Mail,
  Calendar,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Star,
  Award,
  Handshake,
} from 'lucide-react';
import { UserProfile } from '../types/chat';
import { chatService } from '../services/chatService';

interface ProfilePageProps {
  userProfile: UserProfile;
  darkMode: boolean;
  soundEnabled: boolean;
  onToggleDarkMode: () => void;
  onToggleSound: () => void;
  onClose: () => void;
  onUpdateProfile: (data: { displayName?: string; photoURL?: string; about?: string }) => Promise<void>;
}

const AVATAR_PRESETS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Felix',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Luna',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Oliver',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Sophia',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Leo',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Maya',
];

const MARKETPLACE_ABOUT_PRESETS = [
  'Certified collector. Insured domestic & international shipping 📦',
  'Always open to reasonable offers and gear trades 🤝',
  'Prompt responses. Local pickups at verified exchange zones only 📍',
  'Top-rated electronics & camera specialist 📸',
  'Looking for rare mechanical timepieces and vintage optics ⏱️',
  'Fast payment via escrow. Serious inquiries welcome ⚡',
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
  userProfile,
  darkMode,
  soundEnabled,
  onToggleDarkMode,
  onToggleSound,
  onClose,
  onUpdateProfile,
}) => {
  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [about, setAbout] = useState(userProfile.about || '');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showNotification = (msg: string) => {
    setUploadSuccessMessage(msg);
    setTimeout(() => setUploadSuccessMessage(null), 3000);
  };

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName === userProfile.displayName) {
      setIsEditingName(false);
      return;
    }
    setSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
      showNotification('Display name updated across NicheTrade.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async (newAbout?: string) => {
    const val = newAbout !== undefined ? newAbout : about;
    setSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile({ about: val });
      setAbout(val);
      setIsEditingAbout(false);
      showNotification('Seller bio updated successfully.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to update about');
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Image size must be less than 10MB');
      return;
    }

    setIsUploadingPhoto(true);
    setErrorMessage(null);
    try {
      const downloadUrl = await chatService.uploadProfilePicture(userProfile.uid, file);
      await onUpdateProfile({ photoURL: downloadUrl });
      showNotification('Profile picture updated and saved to Firebase Storage!');
      setShowPresets(false);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setErrorMessage('Failed to upload picture. Please try another image.');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectPreset = async (url: string) => {
    setSaving(true);
    setErrorMessage(null);
    try {
      await onUpdateProfile({ photoURL: url });
      setShowPresets(false);
      showNotification('Avatar preset applied.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to apply preset');
    } finally {
      setSaving(false);
    }
  };

  const formattedDate = userProfile.createdAt
    ? new Date(userProfile.createdAt).toLocaleDateString([], {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '2024';

  return (
    <div className="absolute inset-0 z-40 bg-[#F4F7FB] dark:bg-[#09131F] flex flex-col animate-in slide-in-from-left duration-200">
      {/* Top Banner Header in Deep Navy */}
      <div className="h-24 bg-[#0B1F3A] text-white flex items-end px-5 pb-4 gap-4 shadow-sm border-b border-[#132C4F] flex-shrink-0">
        <button
          onClick={onClose}
          className="p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          title="Back to messages"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1976F2] flex items-center justify-center font-bold text-xs text-white">
            N
          </div>
          <h2 className="text-base font-bold">Trader Profile & Settings</h2>
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccessMessage && (
        <div className="mx-4 mt-3 p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{uploadSuccessMessage}</span>
        </div>
      )}
      {errorMessage && (
        <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 scrollbar-thin">
        {/* Profile Picture & Trader Score */}
        <div className="flex flex-col items-center">
          <div className="relative group">
            <img
              src={userProfile.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`}
              alt={userProfile.displayName}
              className="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white dark:border-[#0F1D2F]"
            />

            {isUploadingPhoto ? (
              <div className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white text-xs">
                <div className="w-7 h-7 border-2 border-[#1976F2] border-t-transparent rounded-full animate-spin mb-1" />
                <span>Uploading...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/45 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                title="Change Photo"
              >
                <Camera className="w-6 h-6 mb-1" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Update Photo</span>
              </button>
            )}

            <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-[#0F1D2F] rounded-full" />
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingPhoto}
              className="px-3.5 py-1.5 bg-[#1976F2] hover:bg-[#1565C0] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Image
            </button>
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-3.5 py-1.5 bg-white dark:bg-[#0F1D2F] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#132238] rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
            >
              Preset Icons
            </button>
          </div>

          {/* Presets Grid */}
          {showPresets && (
            <div className="mt-3 p-3 bg-white dark:bg-[#0F1D2F] rounded-xl shadow-md border border-slate-200 dark:border-slate-700 w-full max-w-sm">
              <div className="grid grid-cols-3 gap-2">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt=""
                    onClick={() => handleSelectPreset(preset)}
                    className="w-14 h-14 rounded-xl cursor-pointer hover:scale-105 transition-transform border-2 border-transparent hover:border-[#1976F2]"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Trader Trust Score Metrics */}
          <div className="grid grid-cols-3 gap-3 w-full mt-4">
            <div className="p-3 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="flex items-center justify-center gap-1 text-amber-500 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-500" />
                4.9 / 5
              </div>
              <span className="text-[10px] text-slate-400 font-medium">Buyer Rating</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="font-bold text-sm text-emerald-600">48 Deals</div>
              <span className="text-[10px] text-slate-400 font-medium">Completed</span>
            </div>
            <div className="p-3 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
              <div className="font-bold text-sm text-[#1976F2]">100%</div>
              <span className="text-[10px] text-slate-400 font-medium">Escrow Rate</span>
            </div>
          </div>
        </div>

        {/* Display Name Section */}
        <div className="bg-white dark:bg-[#0F1D2F] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-[11px] font-bold text-[#1976F2] uppercase tracking-wider block mb-1">
            Trader Handle / Full Name
          </span>
          {isEditingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                className="flex-1 px-3 py-1.5 bg-[#F4F7FB] dark:bg-[#09131F] rounded-xl border border-[#1976F2] text-sm font-semibold text-slate-900 dark:text-slate-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="p-2 rounded-xl bg-[#1976F2] hover:bg-[#1565C0] text-white cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {userProfile.displayName || 'Unnamed Trader'}
              </p>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* About Me Section */}
        <div className="bg-white dark:bg-[#0F1D2F] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#1976F2] uppercase tracking-wider">
              Trader Bio & Policies
            </span>
            <span className="text-[11px] text-slate-400">{about.length}/140</span>
          </div>

          {isEditingAbout ? (
            <div className="flex items-start gap-2 mt-1">
              <textarea
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={140}
                rows={2}
                className="flex-1 px-3 py-1.5 bg-[#F4F7FB] dark:bg-[#09131F] rounded-xl border border-[#1976F2] text-xs text-slate-900 dark:text-slate-100 outline-none resize-none"
                autoFocus
              />
              <button
                onClick={() => handleSaveAbout()}
                disabled={saving}
                className="p-2 rounded-xl bg-[#1976F2] hover:bg-[#1565C0] text-white cursor-pointer"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {userProfile.about || 'Verified NicheTrade member.'}
              </p>
              <button
                onClick={() => setIsEditingAbout(true)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer ml-2"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Quick presets */}
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {MARKETPLACE_ABOUT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSaveAbout(preset)}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-[#1976F2] transition-colors cursor-pointer text-left"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white dark:bg-[#0F1D2F] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <span className="text-[11px] font-bold text-[#1976F2] uppercase tracking-wider block">
            System Preferences
          </span>

          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Dark Theme</p>
                <p className="text-[11px] text-slate-400">Deep navy marketplace styling</p>
              </div>
            </div>
            <button
              onClick={onToggleDarkMode}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                darkMode ? 'bg-[#1976F2]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  darkMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800 pt-2">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {soundEnabled ? <Volume2 className="w-4 h-4 text-[#1976F2]" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">Trade Audio Alerts</p>
                <p className="text-[11px] text-slate-400">Audible notification on offer received</p>
              </div>
            </div>
            <button
              onClick={onToggleSound}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
                soundEnabled ? 'bg-[#1976F2]' : 'bg-slate-300'
              }`}
            >
              <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${
                  soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Verified Account details */}
        <div className="bg-white dark:bg-[#0F1D2F] rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Google Account:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {userProfile.email}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Member Since:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
