import React, { useState } from 'react';
import { X, Search, User, CheckCircle2, Tag } from 'lucide-react';
import { UserProfile } from '../types/chat';

interface NewChatModalProps {
  users: UserProfile[];
  onSelectUser: (user: UserProfile) => void;
  onClose: () => void;
}

export const NewChatModal: React.FC<NewChatModalProps> = ({
  users,
  onSelectUser,
  onClose,
}) => {
  const [search, setSearch] = useState('');

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.displayName?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.about?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0F1D2F] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white p-4 flex items-center justify-between border-b border-[#132C4F]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1976F2] flex items-center justify-center text-white">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">New Trade Inquiry</h3>
              <p className="text-[11px] text-blue-200/80">Connect with a verified trader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-[#F4F7FB] dark:bg-[#09131F]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search trader by handle or email..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#0F1D2F] rounded-xl outline-none border border-slate-200 dark:border-slate-700 focus:border-[#1976F2] text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>
        </div>

        {/* User list */}
        <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-slate-800/40 scrollbar-thin">
          {filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <User className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No traders found</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Try searching with a different name or email</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.uid}
                onClick={() => onSelectUser(user)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-[#132238] cursor-pointer transition-colors group"
              >
                <div className="relative flex-shrink-0">
                  <img
                    src={user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`}
                    alt={user.displayName}
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                  {user.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0F1D2F] rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#1976F2]">
                      {user.displayName}
                    </h4>
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#1976F2]" />
                  </div>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {user.about || user.email}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectUser(user);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-[#1976F2] hover:bg-[#1976F2] hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Inquire
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
