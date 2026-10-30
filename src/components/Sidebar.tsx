import React, { useState } from 'react';
import {
  MessageSquarePlus,
  Users,
  Search,
  Filter,
  Plus,
} from 'lucide-react';
import { Chat, UserProfile } from '../types/chat';
import { ChatList } from './ChatList';

interface SidebarProps {
  currentUser: UserProfile;
  chats: Chat[];
  activeChatId: string | null;
  allUsers: UserProfile[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onSelectChat: (chat: Chat) => void;
  onOpenNewChat: () => void;
  onOpenNewGroup: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  chats,
  activeChatId,
  allUsers,
  onSelectChat,
  onOpenNewChat,
  onOpenNewGroup,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="w-full md:w-84 lg:w-96 h-full flex flex-col bg-white dark:bg-[#0F1D2F] border-r border-slate-200 dark:border-slate-800 relative z-20 flex-shrink-0">
      {/* Top Header Bar */}
      <div className="h-16 px-4 bg-white dark:bg-[#0F1D2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Messages
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            {chats.length} Active {chats.length === 1 ? 'Trade Conversation' : 'Trade Conversations'}
          </p>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenNewGroup}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Create Group Deal Room"
          >
            <Users className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewChat}
            className="px-3 py-1.5 rounded-xl bg-[#1976F2] hover:bg-[#1565C0] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
            title="Start New Trade Inquiry"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Trade</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-3 bg-white dark:bg-[#0F1D2F] border-b border-slate-100 dark:border-slate-800/80">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search buyers, sellers or items..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-[#F4F7FB] dark:bg-[#09131F] border border-slate-200 dark:border-slate-700/80 rounded-xl outline-none focus:border-[#1976F2] text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* Chat List */}
      <ChatList
        chats={chats}
        activeChatId={activeChatId}
        currentUser={currentUser}
        allUsers={allUsers}
        searchQuery={searchQuery}
        onSelectChat={onSelectChat}
      />
    </div>
  );
};
