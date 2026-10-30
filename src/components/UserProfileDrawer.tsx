import React, { useState } from 'react';
import { ArrowLeft, Check, Edit2, Camera, User, Info, Mail } from 'lucide-react';
import { UserProfile } from '../types/chat';

interface UserProfileDrawerProps {
  userProfile: UserProfile;
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

const ABOUT_PRESETS = [
  'Hey there! I am using ChatLink.',
  'Available for quick chats ⚡',
  'In a meeting 📅',
  'At work 💼',
  'Busy right now ⏳',
  'Urgent calls only 📞',
  'Coding away 💻',
  'Offline enjoying nature 🌲',
];

export const UserProfileDrawer: React.FC<UserProfileDrawerProps> = ({
  userProfile,
  onClose,
  onUpdateProfile,
}) => {
  const [displayName, setDisplayName] = useState(userProfile.displayName || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [about, setAbout] = useState(userProfile.about || '');
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSaveName = async () => {
    if (!displayName.trim() || displayName === userProfile.displayName) {
      setIsEditingName(false);
      return;
    }
    setSaving(true);
    try {
      await onUpdateProfile({ displayName: displayName.trim() });
      setIsEditingName(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAbout = async (newAbout?: string) => {
    const val = newAbout !== undefined ? newAbout : about;
    setSaving(true);
    try {
      await onUpdateProfile({ about: val });
      setAbout(val);
      setIsEditingAbout(false);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectAvatar = async (url: string) => {
    setSaving(true);
    try {
      await onUpdateProfile({ photoURL: url });
      setShowAvatarPresets(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="absolute inset-0 z-40 bg-[#f0f2f5] dark:bg-[#111b21] flex flex-col animate-in slide-in-from-left duration-200">
      {/* Header */}
      <div className="h-28 bg-[#128C7E] text-white flex items-end px-5 pb-5 gap-6 shadow-md">
        <button
          onClick={onClose}
          className="p-1 rounded-full hover:bg-black/10 transition-colors"
          title="Back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h2 className="text-lg font-bold">Profile</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 scrollbar-thin">
        {/* Avatar Section */}
        <div className="flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <img
              src={
                userProfile.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${userProfile.uid}`
              }
              alt={userProfile.displayName}
              className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-white dark:border-[#202c33]"
            />
            <button
              onClick={() => setShowAvatarPresets(!showAvatarPresets)}
              className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera className="w-8 h-8 mb-1" />
              <span className="text-xs font-medium uppercase tracking-wider">Change photo</span>
            </button>
          </div>

          {/* Avatar Presets Picker */}
          {showAvatarPresets && (
            <div className="mt-4 p-4 bg-white dark:bg-[#202c33] rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 w-full max-w-sm">
              <p className="text-xs font-semibold text-gray-500 mb-3">Choose an avatar preset</p>
              <div className="grid grid-cols-3 gap-3 mb-3">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <img
                    key={idx}
                    src={preset}
                    alt=""
                    onClick={() => handleSelectAvatar(preset)}
                    className="w-16 h-16 rounded-full cursor-pointer hover:scale-105 transition-transform border-2 border-transparent hover:border-teal-500"
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Or paste avatar URL"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-100 dark:bg-[#111b21] rounded-lg outline-none focus:ring-1 focus:ring-teal-500 text-gray-800 dark:text-gray-200"
                />
                <button
                  onClick={() => customAvatarUrl && handleSelectAvatar(customAvatarUrl)}
                  disabled={!customAvatarUrl || saving}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium rounded-lg disabled:opacity-50"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Display Name Card */}
        <div className="bg-white dark:bg-[#202c33] rounded-2xl p-4 shadow-xs border border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
            Your name
          </span>
          {isEditingName ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={40}
                className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-[#111b21] rounded-lg border border-teal-500 text-sm font-medium text-gray-900 dark:text-gray-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                {userProfile.displayName || 'No name'}
              </p>
              <button
                onClick={() => setIsEditingName(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            This is not your username. This name will be visible to your ChatLink contacts.
          </p>
        </div>

        {/* About Card */}
        <div className="bg-white dark:bg-[#202c33] rounded-2xl p-4 shadow-xs border border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider block mb-1">
            About
          </span>
          {isEditingAbout ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                maxLength={100}
                className="flex-1 px-3 py-1.5 bg-gray-50 dark:bg-[#111b21] rounded-lg border border-teal-500 text-sm text-gray-900 dark:text-gray-100 outline-none"
                autoFocus
              />
              <button
                onClick={() => handleSaveAbout()}
                disabled={saving}
                className="p-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white"
                title="Save"
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {userProfile.about || 'Hey there! I am using ChatLink.'}
              </p>
              <button
                onClick={() => setIsEditingAbout(true)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick About Presets */}
          <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
            <span className="text-[11px] font-semibold text-gray-400 block mb-2">
              Quick presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ABOUT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handleSaveAbout(preset)}
                  className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-[#111b21] text-gray-700 dark:text-gray-300 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Account Info */}
        <div className="bg-white dark:bg-[#202c33] rounded-2xl p-4 shadow-xs border border-gray-100 dark:border-gray-800">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">
            Linked Google Account
          </span>
          <div className="flex items-center gap-2 mt-2 text-sm text-gray-800 dark:text-gray-200">
            <Mail className="w-4 h-4 text-gray-400" />
            <span className="truncate">{userProfile.email}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
