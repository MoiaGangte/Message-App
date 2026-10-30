import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Search,
  MoreVertical,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  Phone,
  Video,
  Info,
  X,
  Tag,
  Star,
  ExternalLink,
  MapPin,
  Calendar,
  Image as ImageIcon,
} from 'lucide-react';
import { Chat, Message, UserProfile } from '../types/chat';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { MediaViewerModal } from './MediaViewerModal';
import { MakeOfferModal } from './MakeOfferModal';
import { formatDateSeparator, formatLastSeen } from '../utils/dateFormatter';
import { soundManager } from '../utils/sound';
import { getChatListing } from '../theme/constants';

interface ChatWindowProps {
  chat: Chat;
  messages: Message[];
  currentUser: UserProfile;
  allUsers: UserProfile[];
  onBack: () => void;
  onSendMessage: (text: string, imageUrl?: string, type?: 'text' | 'image' | 'offer' | 'system', offer?: import('../types/chat').TradeOffer) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReactMessage: (messageId: string, emoji: string) => Promise<void>;
  onRespondOffer: (messageId: string, action: 'accepted' | 'declined') => Promise<void>;
  onTyping: (isTyping: boolean) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  chat,
  messages,
  currentUser,
  allUsers,
  onBack,
  onSendMessage,
  onDeleteMessage,
  onReactMessage,
  onRespondOffer,
  onTyping,
}) => {
  const [lightboxImage, setLightboxImage] = useState<{
    url: string;
    sender: string;
    timestamp: number;
  } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRightDetails, setShowRightDetails] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [showMakeOfferModal, setShowMakeOfferModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const previousMessagesCountRef = useRef(messages.length);

  // Associated marketplace listing item
  const listing = getChatListing(chat.id, chat.itemTitle);

  // Participant details
  const otherParticipantId = chat.participants.find((p) => p !== currentUser.uid);
  const otherParticipantDetail = otherParticipantId
    ? chat.participantDetails?.[otherParticipantId]
    : null;
  const otherUserLive = allUsers.find((u) => u.uid === otherParticipantId);

  // Typing check
  const typingUserIds = Object.entries(chat.typingUsers || {})
    .filter(([uid, isTyping]) => uid !== currentUser.uid && isTyping)
    .map(([uid]) => uid);
  const isSomeoneTyping = typingUserIds.length > 0;

  // Sound and auto scroll
  useEffect(() => {
    if (messages.length > previousMessagesCountRef.current) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg && lastMsg.senderId !== currentUser.uid) {
        soundManager.playReceived();
      } else {
        soundManager.playSent();
      }
      scrollToBottom();
    }
    previousMessagesCountRef.current = messages.length;
  }, [messages.length, currentUser.uid]);

  useEffect(() => {
    scrollToBottom(false);
  }, [chat.id]);

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    setShowScrollBottom(scrollHeight - scrollTop - clientHeight > 180);
  };

  // Filter messages
  const filteredMessages = searchQuery.trim()
    ? messages.filter((m) =>
        m.text?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const handleSendOffer = async (amount: number, note?: string) => {
    await onSendMessage(note || `Official trade offer submitted: $${amount.toLocaleString()}`, undefined, 'offer', {
      amount,
      currency: '$',
      status: 'pending',
      itemTitle: listing.title,
    });
  };

  const chatTitle = chat.isGroup
    ? chat.name || 'Group Deal Room'
    : otherParticipantDetail?.displayName || 'Trader';

  const chatAvatar = chat.isGroup
    ? chat.groupAvatar ||
      `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(chat.name || 'group')}`
    : otherParticipantDetail?.photoURL ||
      `https://api.dicebear.com/7.x/bottts/svg?seed=${otherParticipantId}`;

  // Shared media in conversation
  const sharedMedia = messages.filter((m) => m.imageUrl && !m.isDeleted);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F7FB] dark:bg-[#09131F] relative overflow-hidden">
      {/* Conversation Pane Header */}
      <header className="h-16 px-4 bg-white dark:bg-[#0F1D2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between z-20 shadow-xs">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => setShowRightDetails(!showRightDetails)}
            className="relative cursor-pointer flex-shrink-0"
          >
            <img
              src={chatAvatar}
              alt={chatTitle}
              className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
            />
            {!chat.isGroup && otherUserLive?.online && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-[#0F1D2F] rounded-full" />
            )}
          </div>

          <div
            onClick={() => setShowRightDetails(!showRightDetails)}
            className="flex flex-col min-w-0 cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 truncate">
                {chatTitle}
              </h2>
              <span title="Verified Trader">
                <CheckCircle2 className="w-4 h-4 text-[#1976F2] flex-shrink-0" />
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 truncate">
              {isSomeoneTyping ? (
                <span className="text-[#1976F2] font-semibold animate-pulse">typing...</span>
              ) : (
                <span>{formatLastSeen(otherUserLive?.lastSeen, otherUserLive?.online)}</span>
              )}
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-emerald-600 font-medium">99% Positive Rating</span>
            </div>
          </div>
        </div>

        {/* Action icons: Call, Search, More / Details */}
        <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
          <button
            onClick={() => alert('Starting secure VoIP encrypted call with verified trader...')}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            title="Encrypted Voice Call"
          >
            <Phone className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              showSearch ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1976F2]' : ''
            }`}
            title="Search Messages"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowRightDetails(!showRightDetails)}
            className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
              showRightDetails ? 'bg-blue-50 dark:bg-blue-950/60 text-[#1976F2]' : ''
            }`}
            title="Item & Trader Details"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Pinned Listing Card */}
      <div className="px-4 py-2.5 bg-white dark:bg-[#0F1D2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-2xs z-10">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-12 h-12 rounded-lg object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                  listing.status === 'available'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                    : listing.status === 'negotiating'
                    ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {listing.status}
              </span>
              <span className="text-xs font-extrabold text-[#1976F2]">
                ${listing.price.toLocaleString()}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">
              {listing.title}
            </h3>
          </div>
        </div>

        <button
          onClick={() => setShowMakeOfferModal(true)}
          className="px-3.5 py-1.5 rounded-lg bg-[#1976F2] hover:bg-[#1565C0] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer flex-shrink-0"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Make Offer</span>
        </button>
      </div>

      {/* Safety Notice Banner */}
      <div className="px-4 py-2 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-100 dark:border-blue-900/40 flex items-center gap-2 text-[11px] text-[#0B1F3A] dark:text-blue-200">
        <ShieldCheck className="w-4 h-4 text-[#1976F2] flex-shrink-0" />
        <span className="truncate">
          Keep deals inside NicheTrade. Never share OTPs, passwords, or off-platform payment links.
        </span>
      </div>

      {/* In-Chat Message Search */}
      {showSearch && (
        <div className="p-2.5 bg-white dark:bg-[#0B1728] border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in this trade log..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100 dark:bg-[#0F1D2F] rounded-lg outline-none focus:border-[#1976F2] text-slate-900 dark:text-slate-100"
              autoFocus
            />
          </div>
          <button
            onClick={() => {
              setShowSearch(false);
              setSearchQuery('');
            }}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Body: Message Stream + Right Details Panel */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Messages Stream */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 space-y-2 relative scrollbar-thin"
        >
          {filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-[#1976F2] flex items-center justify-center mb-3">
                <Tag className="w-7 h-7" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                Trade Discussion Started
              </h3>
              <p className="text-xs max-w-sm mt-1">
                Inquire about condition, request additional photos, or submit a formal offer.
              </p>
            </div>
          ) : (
            (() => {
              let lastDate = '';
              return filteredMessages.map((msg) => {
                const dateStr = formatDateSeparator(msg.timestamp);
                const isNewDate = dateStr !== lastDate;
                lastDate = dateStr;

                return (
                  <React.Fragment key={msg.id}>
                    {isNewDate && (
                      <div className="flex justify-center my-3 select-none">
                        <span className="text-[11px] font-bold px-3 py-1 bg-white dark:bg-[#0F1D2F] text-slate-500 rounded-full border border-slate-200 dark:border-slate-800 shadow-2xs">
                          {dateStr}
                        </span>
                      </div>
                    )}
                    <MessageBubble
                      message={msg}
                      isCurrentUser={msg.senderId === currentUser.uid}
                      isGroup={chat.isGroup}
                      currentUser={currentUser}
                      onDelete={onDeleteMessage}
                      onReact={onReactMessage}
                      onImageClick={(url, sender, timestamp) =>
                        setLightboxImage({ url, sender, timestamp })
                      }
                      onRespondOffer={onRespondOffer}
                      onCounterOffer={(amount) => {
                        setShowMakeOfferModal(true);
                      }}
                    />
                  </React.Fragment>
                );
              });
            })()
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Right Collapsible Details Panel */}
        {showRightDetails && (
          <aside className="w-80 bg-white dark:bg-[#0F1D2F] border-l border-slate-200 dark:border-slate-800 flex flex-col h-full z-20 shadow-lg animate-in slide-in-from-right duration-150 overflow-y-auto">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">Trade Summary</h3>
              <button
                onClick={() => setShowRightDetails(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Trader Profile */}
              <div className="flex flex-col items-center text-center">
                <img
                  src={chatAvatar}
                  alt=""
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#1976F2] shadow-sm mb-2"
                />
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-base text-slate-900 dark:text-slate-100">{chatTitle}</h4>
                  <CheckCircle2 className="w-4 h-4 text-[#1976F2]" />
                </div>
                <div className="flex items-center gap-1 text-amber-500 text-xs font-bold mt-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>4.9 / 5.0 (48 verified deals)</span>
                </div>
                <span className="text-[11px] text-slate-400 mt-0.5">
                  Member since {otherUserLive?.createdAt ? new Date(otherUserLive.createdAt).getFullYear() : '2024'}
                </span>
              </div>

              {/* Item Card in Sidebar */}
              <div className="p-3 bg-[#F4F7FB] dark:bg-[#0B1728] rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                  Item Details
                </span>
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-full h-32 object-cover rounded-lg mb-2"
                />
                <h5 className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2">
                  {listing.title}
                </h5>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
                  <span className="text-slate-400">Price:</span>
                  <span className="font-bold text-[#1976F2]">${listing.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between mt-1 text-xs">
                  <span className="text-slate-400">Condition:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{listing.condition}</span>
                </div>
              </div>

              {/* Shared Photos in this Chat */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Shared Media ({sharedMedia.length})
                </span>
                {sharedMedia.length === 0 ? (
                  <p className="text-xs text-slate-400">No photos shared in this chat yet</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {sharedMedia.map((m) => (
                      <img
                        key={m.id}
                        src={m.imageUrl}
                        alt=""
                        onClick={() => setLightboxImage({ url: m.imageUrl!, sender: m.senderName, timestamp: m.timestamp })}
                        className="w-full h-20 object-cover rounded-lg cursor-pointer hover:opacity-90 border border-slate-200 dark:border-slate-700"
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}

        {/* Scroll down button */}
        {showScrollBottom && (
          <button
            onClick={() => scrollToBottom(true)}
            className="absolute bottom-4 right-6 z-20 p-2.5 bg-white dark:bg-[#0F1D2F] text-slate-600 dark:text-slate-300 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <ChevronDown className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Input */}
      <MessageInput
        onSendMessage={onSendMessage}
        onOpenMakeOffer={() => setShowMakeOfferModal(true)}
        onTyping={onTyping}
      />

      {/* Make Offer Modal */}
      {showMakeOfferModal && (
        <MakeOfferModal
          itemTitle={listing.title}
          askingPrice={listing.price}
          onSendOffer={handleSendOffer}
          onClose={() => setShowMakeOfferModal(false)}
        />
      )}

      {/* Lightbox / Media Viewer */}
      {lightboxImage && (
        <MediaViewerModal
          imageUrl={lightboxImage.url}
          senderName={lightboxImage.sender}
          timestamp={lightboxImage.timestamp}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};
