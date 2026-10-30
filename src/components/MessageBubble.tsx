import React, { useState, useRef } from 'react';
import {
  Check,
  CheckCheck,
  MoreVertical,
  Trash2,
  Copy,
  Smile,
  AlertTriangle,
  Handshake,
  ShieldCheck,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Message, UserProfile } from '../types/chat';
import { formatMessageTime } from '../utils/dateFormatter';

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  isGroup: boolean;
  currentUser: UserProfile;
  onDelete: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  onImageClick: (imageUrl: string, senderName: string, timestamp: number) => void;
  onRespondOffer?: (messageId: string, action: 'accepted' | 'declined') => void;
  onCounterOffer?: (currentAmount: number) => void;
}

const QUICK_REACTIONS = ['👍', '❤️', '🤝', '🔥', '✅', '👏'];

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  isGroup,
  currentUser,
  onDelete,
  onReact,
  onImageClick,
  onRespondOffer,
  onCounterOffer,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      setShowMenu(false);
    }
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCurrentUser) {
      setShowMenu(true);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isCurrentUser) return;
    const touch = e.touches[0];
    touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

    longPressTimerRef.current = setTimeout(() => {
      try {
        navigator.vibrate?.(40);
      } catch {
        // Ignore
      }
      setShowMenu(true);
    }, 500);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStartPosRef.current) return;
    const touch = e.touches[0];
    const dx = Math.abs(touch.clientX - touchStartPosRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartPosRef.current.y);

    if (dx > 10 || dy > 10) {
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    }
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
  };

  // Reactions count
  const reactionCounts: Record<string, number> = {};
  if (message.reactions) {
    Object.values(message.reactions).forEach((emoji) => {
      reactionCounts[emoji] = (reactionCounts[emoji] || 0) + 1;
    });
  }

  // Delivery ticks
  const renderStatusTicks = () => {
    if (!isCurrentUser) return null;

    if (message.status === 'read' || (message.readBy && message.readBy.length > 1)) {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-200" />;
    } else if (message.status === 'delivered') {
      return <CheckCheck className="w-3.5 h-3.5 text-blue-200/70" />;
    } else {
      return <Check className="w-3 h-3 text-blue-200/70" />;
    }
  };

  // Format clickable links
  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:opacity-80 break-all font-medium"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  // Render System Notification message
  if (message.type === 'system') {
    return (
      <div className="flex justify-center my-3 select-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-700 shadow-xs max-w-md text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-[#1976F2] flex-shrink-0" />
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  // Render Offer Card message
  if (message.type === 'offer' && message.offer) {
    const isOfferRecipient = !isCurrentUser;
    const isPending = message.offer.status === 'pending';
    const isAccepted = message.offer.status === 'accepted';
    const isDeclined = message.offer.status === 'declined';

    return (
      <div className={`flex flex-col mb-2.5 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        <div className="w-80 sm:w-96 rounded-xl bg-white dark:bg-[#0F1D2F] border-2 border-[#1976F2]/30 shadow-md overflow-hidden">
          {/* Card Header */}
          <div className="px-4 py-2.5 bg-gradient-to-r from-[#0B1F3A] to-[#122B4E] text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#1976F2]" />
              <span className="text-xs font-bold uppercase tracking-wider">Official Offer</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                isAccepted
                  ? 'bg-emerald-500 text-white'
                  : isDeclined
                  ? 'bg-red-500 text-white'
                  : 'bg-amber-500 text-white animate-pulse'
              }`}
            >
              {message.offer.status}
            </span>
          </div>

          {/* Card Body */}
          <div className="p-4 space-y-3">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Offered Price
                </span>
                <span className="text-2xl font-extrabold text-[#1976F2]">
                  ${message.offer.amount.toLocaleString()}
                </span>
              </div>
              <span className="text-xs text-slate-400">{formatMessageTime(message.timestamp)}</span>
            </div>

            {message.text && (
              <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                "{message.text}"
              </p>
            )}

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Escrow protected deal • NicheTrade Guarantee</span>
            </div>

            {/* Recipient Action Buttons when pending */}
            {isOfferRecipient && isPending && (
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => onRespondOffer?.(message.id, 'accepted')}
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept Offer
                </button>
                <button
                  onClick={() => onCounterOffer?.(message.offer?.amount || 0)}
                  className="py-2 px-3 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-[#1976F2] hover:bg-blue-100 text-xs font-bold transition-colors cursor-pointer"
                >
                  Counter
                </button>
                <button
                  onClick={() => onRespondOffer?.(message.id, 'declined')}
                  className="py-2 px-3 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-red-50 hover:text-red-600 text-slate-600 dark:text-slate-400 text-xs font-bold transition-colors cursor-pointer"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Standard Text / Image Message
  return (
    <div
      className={`relative group flex flex-col mb-1.5 select-text ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}
    >
      <div
        onContextMenu={handleContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative max-w-[85%] sm:max-w-[70%] md:max-w-[60%] rounded-xl px-3.5 py-2.5 shadow-xs transition-all duration-150 select-text ${
          isCurrentUser
            ? 'bg-[#1976F2] text-white rounded-tr-none'
            : 'bg-white dark:bg-[#0F1D2F] text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/80 dark:border-slate-800'
        }`}
      >
        {/* Sender name for group deal rooms */}
        {isGroup && !isCurrentUser && (
          <p className="text-xs font-bold text-[#1976F2] mb-1">
            {message.senderName}
          </p>
        )}

        {/* Image attachment */}
        {message.imageUrl && (
          <div className="mb-2 rounded-lg overflow-hidden bg-black/5 dark:bg-black/20">
            <img
              src={message.imageUrl}
              alt="Listing item photo"
              onClick={() => onImageClick(message.imageUrl!, message.senderName, message.timestamp)}
              className="max-h-72 w-full object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
            />
          </div>
        )}

        {/* Text */}
        {message.text && (
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap break-words pr-1 font-normal">
            {renderTextWithLinks(message.text)}
          </p>
        )}

        {/* Time and read status */}
        <div
          className={`flex items-center justify-end gap-1 mt-1 text-[11px] select-none ml-auto ${
            isCurrentUser ? 'text-blue-100' : 'text-slate-400'
          }`}
        >
          <span>{formatMessageTime(message.timestamp)}</span>
          {renderStatusTicks()}
        </div>

        {/* Hover action menu trigger */}
        <div
          className={`absolute top-1 ${
            isCurrentUser ? '-left-8' : '-right-8'
          } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1`}
        >
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="p-1 rounded-full bg-white dark:bg-[#0F1D2F] shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform text-slate-500 cursor-pointer"
            title="React"
          >
            <Smile className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded-full bg-white dark:bg-[#0F1D2F] shadow-md border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform text-slate-500 cursor-pointer"
            title="Options (Right-click or Long-press)"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quick Reaction Bar */}
        {showReactionPicker && (
          <div
            className={`absolute -top-10 ${
              isCurrentUser ? 'right-0' : 'left-0'
            } z-30 flex items-center gap-1 p-1 bg-white dark:bg-[#0F1D2F] rounded-full shadow-lg border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-100`}
          >
            {QUICK_REACTIONS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => {
                  onReact(message.id, emoji);
                  setShowReactionPicker(false);
                }}
                className="w-7 h-7 flex items-center justify-center text-base hover:scale-125 transition-transform cursor-pointer"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Right Click / Options Dropdown */}
        {showMenu && (
          <div
            className={`absolute top-8 ${
              isCurrentUser ? 'right-0' : 'left-0'
            } z-30 w-44 bg-white dark:bg-[#0F1D2F] rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 text-xs text-slate-700 dark:text-slate-200 animate-in fade-in duration-100`}
          >
            {message.text && (
              <button
                onClick={handleCopy}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                {copied ? 'Copied!' : 'Copy text'}
              </button>
            )}

            {isCurrentUser && (
              <button
                onClick={() => {
                  setShowMenu(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full px-3.5 py-2 text-left flex items-center gap-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-medium cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete message
              </button>
            )}

            <button
              onClick={() => setShowMenu(false)}
              className="w-full px-3.5 py-1.5 text-left text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-[11px]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-[#0F1D2F] rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-2.5 rounded-full bg-red-100 dark:bg-red-900/40">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Delete message from trade log?
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This message will be permanently removed from the conversation log for both participants.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDelete(message.id);
                  setShowDeleteConfirm(false);
                }}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-md cursor-pointer transition-all"
              >
                Delete for everyone
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reactions Pills */}
      {Object.keys(reactionCounts).length > 0 && (
        <div
          className={`flex flex-wrap gap-1 mt-0.5 px-1 ${
            isCurrentUser ? 'justify-end' : 'justify-start'
          }`}
        >
          {Object.entries(reactionCounts).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(message.id, emoji)}
              className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-white dark:bg-[#0F1D2F] shadow-xs border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform cursor-pointer"
            >
              <span>{emoji}</span>
              {count > 1 && (
                <span className="font-bold text-slate-600 dark:text-slate-400">{count}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
