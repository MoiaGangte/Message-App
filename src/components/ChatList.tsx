import React, { useState } from 'react';
import { Check, CheckCheck, CheckCircle2, Tag, ShieldCheck } from 'lucide-react';
import { Chat, UserProfile } from '../types/chat';
import { formatChatTimestamp } from '../utils/dateFormatter';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  searchQuery: string;
  onSelectChat: (chat: Chat) => void;
}

export type MarketplaceFilterTab = 'all' | 'buying' | 'selling' | 'unread';

export const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeChatId,
  currentUser,
  allUsers,
  searchQuery,
  onSelectChat,
}) => {
  const [filterTab, setFilterTab] = useState<MarketplaceFilterTab>('all');

  // Filter chats by tab and search
  const filteredChats = chats.filter((chat) => {
    // Determine title
    let title = '';
    if (chat.isGroup) {
      title = chat.name || 'Group Deal';
    } else {
      const otherId = chat.participants.find((p) => p !== currentUser.uid);
      title = otherId ? chat.participantDetails?.[otherId]?.displayName || '' : '';
    }

    // Role assignment for demonstration: if user created the chat, they are Seller; else Buyer (or vice versa)
    const isSeller = chat.createdBy === currentUser.uid;

    const matchesSearch =
      !searchQuery.trim() ||
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage?.text?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'unread') {
      const unread = chat.unreadCounts?.[currentUser.uid] || 0;
      return unread > 0;
    }
    if (filterTab === 'buying') {
      return !isSeller;
    }
    if (filterTab === 'selling') {
      return isSeller;
    }
    return true;
  });

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white dark:bg-[#0F1D2F]">
      {/* Marketplace Filter Tabs: All, Buying, Selling, Unread */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-200 dark:border-slate-800 bg-[#F4F7FB] dark:bg-[#0B1728]">
        {(['all', 'buying', 'selling', 'unread'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
              filterTab === tab
                ? 'bg-[#1976F2] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Chat list items */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 scrollbar-thin">
        {filteredChats.length === 0 ? (
          <div className="py-16 px-4 text-center text-slate-400">
            <Tag className="w-8 h-8 mx-auto mb-2 opacity-30 text-slate-400" />
            <p className="text-xs font-medium">No conversations found</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Start an inquiry or search another keyword</p>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const isActive = chat.id === activeChatId;
            const otherParticipantId = chat.participants.find((p) => p !== currentUser.uid);
            const otherParticipantDetail = otherParticipantId
              ? chat.participantDetails?.[otherParticipantId]
              : null;
            const otherUserLive = allUsers.find((u) => u.uid === otherParticipantId);

            const title = chat.isGroup
              ? chat.name || 'Group Negotiation'
              : otherParticipantDetail?.displayName || 'Trader';

            const avatar = chat.isGroup
              ? chat.groupAvatar ||
                `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(chat.name || 'group')}`
              : otherParticipantDetail?.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${otherParticipantId}`;

            const unreadCount = chat.unreadCounts?.[currentUser.uid] || 0;

            // Role Badge: Seller / Buyer
            const isSeller = chat.createdBy === currentUser.uid;
            const roleBadge = isSeller ? 'Selling' : 'Buying';

            // Typing check
            const typingUserIds = Object.entries(chat.typingUsers || {})
              .filter(([uid, isTyping]) => uid !== currentUser.uid && isTyping)
              .map(([uid]) => uid);
            const isTyping = typingUserIds.length > 0;

            const isLastMsgMine = chat.lastMessage?.senderId === currentUser.uid;

            return (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className={`flex items-start gap-3 px-3.5 py-3 cursor-pointer transition-all border-l-3 ${
                  isActive
                    ? 'bg-blue-50/70 dark:bg-[#13253C] border-[#1976F2]'
                    : 'border-transparent hover:bg-slate-50 dark:hover:bg-[#132238]/60'
                }`}
              >
                {/* Avatar with presence */}
                <div className="relative flex-shrink-0 mt-0.5">
                  <img
                    src={avatar}
                    alt={title}
                    className="w-11 h-11 rounded-xl object-cover bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  {!chat.isGroup && otherUserLive?.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0F1D2F] rounded-full" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {title}
                      </h3>
                      {/* Verified Badge */}
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#1976F2] flex-shrink-0" />
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium flex-shrink-0 ml-1">
                      {chat.lastMessageTimestamp ? formatChatTimestamp(chat.lastMessageTimestamp) : ''}
                    </span>
                  </div>

                  {/* Role Badge and listing snippet */}
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        isSeller
                          ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                          : 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}
                    >
                      {roleBadge}
                    </span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {chat.itemTitle || 'Verified Listing'}
                    </span>
                  </div>

                  {/* Last message preview */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 truncate pr-2">
                      {isTyping ? (
                        <span className="text-[#1976F2] font-semibold animate-pulse">typing...</span>
                      ) : (
                        <>
                          {isLastMsgMine && (
                            <span className="inline-flex items-center mr-0.5">
                              {chat.lastMessage?.readBy && chat.lastMessage.readBy.length > 1 ? (
                                <CheckCheck className="w-3.5 h-3.5 text-[#1976F2]" />
                              ) : (
                                <Check className="w-3.5 h-3.5 text-slate-400" />
                              )}
                            </span>
                          )}
                          <span className="truncate">{chat.lastMessage?.text || 'No messages yet'}</span>
                        </>
                      )}
                    </div>

                    {/* Unread badge */}
                    {unreadCount > 0 && (
                      <span className="flex-shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-[#1976F2] text-white text-[11px] font-bold flex items-center justify-center shadow-xs">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
