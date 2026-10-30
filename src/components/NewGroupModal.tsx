import React, { useState } from 'react';
import { X, Users, Check, Search, ShieldCheck } from 'lucide-react';
import { UserProfile } from '../types/chat';

interface NewGroupModalProps {
  users: UserProfile[];
  onCreateGroup: (name: string, members: UserProfile[], avatar?: string) => Promise<void>;
  onClose: () => void;
}

const TRADE_ROOM_ICONS = ['🏷️', '💎', '📦', '🤝', '⚡', '📸', '⏱️', '💻', '🚗', '🎨'];

export const NewGroupModal: React.FC<NewGroupModalProps> = ({
  users,
  onCreateGroup,
  onClose,
}) => {
  const [groupName, setGroupName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🏷️');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const toggleUser = (uid: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(uid) ? prev.filter((id) => id !== uid) : [...prev, uid]
    );
  };

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q)
    );
  });

  const selectedUsers = users.filter((u) => selectedUserIds.includes(u.uid));

  const handleCreate = async () => {
    if (!groupName.trim() || selectedUserIds.length === 0 || loading) return;

    setLoading(true);
    try {
      const avatarUrl = `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(
        groupName + selectedIcon
      )}`;
      await onCreateGroup(groupName.trim(), selectedUsers, avatarUrl);
      onClose();
    } catch (err) {
      console.error('Error creating group deal room:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0F1D2F] w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white p-4 flex items-center justify-between border-b border-[#132C4F]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1976F2] flex items-center justify-center text-white">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Create Group Trade Room</h3>
              <p className="text-[11px] text-blue-200/80">Multi-party syndication or auction room</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-[#F4F7FB] dark:bg-[#09131F] space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-xl shadow-xs border border-blue-200 dark:border-blue-900/50 flex-shrink-0">
              {selectedIcon}
            </div>

            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Deal Room Name (e.g., Leica M-Series Collector Circle)"
              maxLength={40}
              className="flex-1 px-3.5 py-2 text-xs bg-white dark:bg-[#0F1D2F] rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-[#1976F2] text-slate-900 dark:text-slate-100 font-semibold"
              autoFocus
            />
          </div>

          {/* Badge choices */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[10px] font-bold text-slate-400 mr-1 flex-shrink-0 uppercase">
              Badge:
            </span>
            {TRADE_ROOM_ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setSelectedIcon(icon)}
                className={`w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-lg text-xs transition-transform cursor-pointer ${
                  selectedIcon === icon
                    ? 'bg-[#1976F2] text-white scale-110 shadow-xs'
                    : 'bg-white dark:bg-[#0F1D2F] hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Selected chips */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {selectedUsers.map((u) => (
                <div
                  key={u.uid}
                  className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-[#1976F2] text-xs font-semibold border border-blue-200 dark:border-blue-900/40"
                >
                  <span>{u.displayName}</span>
                  <button
                    onClick={() => toggleUser(u.uid)}
                    className="p-0.5 hover:bg-black/10 rounded-full cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search traders to invite..."
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-100 dark:bg-[#09131F] rounded-xl outline-none focus:border-[#1976F2] text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40 scrollbar-thin">
          {filteredUsers.map((user) => {
            const isSelected = selectedUserIds.includes(user.uid);
            return (
              <div
                key={user.uid}
                onClick={() => toggleUser(user.uid)}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-[#132238]'
                }`}
              >
                <img
                  src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                  alt=""
                  className="w-9 h-9 rounded-xl object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user.displayName}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                </div>

                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                    isSelected
                      ? 'bg-[#1976F2] border-[#1976F2] text-white'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#F4F7FB] dark:bg-[#09131F] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {selectedUserIds.length} traders selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!groupName.trim() || selectedUserIds.length === 0 || loading}
              className="px-5 py-2 text-xs font-bold bg-[#1976F2] hover:bg-[#1565C0] text-white rounded-xl shadow-md disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Room...' : 'Create Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
