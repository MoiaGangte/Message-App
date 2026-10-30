import React, { useState, useRef, useEffect } from 'react';
import { Smile, Paperclip, Send, X, Tag, DollarSign, MapPin } from 'lucide-react';
import { EmojiPicker } from './EmojiPicker';
import { compressImage } from '../utils/imageCompressor';

interface MessageInputProps {
  onSendMessage: (text: string, imageUrl?: string, type?: 'text' | 'image') => Promise<void>;
  onOpenMakeOffer: () => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

const QUICK_REPLIES = [
  'Is this still available?',
  'What is your best price?',
  'Can we meet at a verified location?',
  'Ready to buy via escrow',
];

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  onOpenMakeOffer,
  onTyping,
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const { dataUrl } = await compressImage(file, 1200, 1200, 0.7);
      setSelectedImage(dataUrl);
    } catch (err) {
      console.error('Failed to process image:', err);
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSend = async () => {
    if ((!text.trim() && !selectedImage) || isSending || disabled) return;

    const messageText = text.trim();
    const imageToSend = selectedImage;

    setText('');
    setSelectedImage(null);
    setShowEmoji(false);
    onTyping(false);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setIsSending(true);
    try {
      if (imageToSend) {
        await onSendMessage(messageText, imageToSend, 'image');
      } else {
        await onSendMessage(messageText, undefined, 'text');
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleQuickReply = (reply: string) => {
    setText(reply);
    textareaRef.current?.focus();
  };

  const handleShareLocation = () => {
    const locText = '📍 Safe Meetup Location Proposed: City Hall / Police Safe Exchange Zone (Verified)';
    onSendMessage(locText, undefined, 'text');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const addEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  return (
    <div className="relative border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0F1D2F] px-4 py-3 flex flex-col gap-2">
      {/* Quick Reply Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1 flex-shrink-0">
          Quick:
        </span>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => handleQuickReply(reply)}
            className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-[#1976F2] border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            {reply}
          </button>
        ))}
        <button
          type="button"
          onClick={handleShareLocation}
          className="flex-shrink-0 text-xs px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <MapPin className="w-3 h-3" />
          Share Location
        </button>
      </div>

      {/* Emoji Picker Popover */}
      {showEmoji && (
        <div className="absolute bottom-20 left-4 z-50 animate-in fade-in duration-150">
          <EmojiPicker onSelect={addEmoji} onClose={() => setShowEmoji(false)} />
        </div>
      )}

      {/* Selected Image Attachment Preview Bar */}
      {selectedImage && (
        <div className="flex items-center gap-3 p-2 bg-slate-50 dark:bg-[#09131F] rounded-xl border border-slate-200 dark:border-slate-700 max-w-sm">
          <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-slate-200 flex-shrink-0">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Listing photo ready
            </p>
            <p className="text-[11px] text-slate-400">Add an optional caption below</p>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Input Row */}
      <div className="flex items-end gap-2">
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
            showEmoji ? 'text-[#1976F2] bg-blue-50 dark:bg-blue-950/50' : ''
          }`}
          title="Insert Emoji"
        >
          <Smile className="w-5 h-5" />
        </button>

        {/* Attachment Button */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageSelect}
          accept="image/*"
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isCompressing}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title="Attach item photo"
        >
          {isCompressing ? (
            <div className="w-5 h-5 border-2 border-[#1976F2] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Paperclip className="w-5 h-5" />
          )}
        </button>

        {/* Make Offer Button */}
        <button
          type="button"
          onClick={onOpenMakeOffer}
          className="px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer"
          title="Make official trade offer"
        >
          <Tag className="w-3.5 h-3.5" />
          <span>Make Offer</span>
        </button>

        {/* Message Input Box with focus ring */}
        <div className="flex-1 bg-[#F4F7FB] dark:bg-[#09131F] rounded-xl px-3.5 py-2 border border-slate-200 dark:border-slate-700/80 focus-within:ring-2 focus-within:ring-[#1976F2]/30 focus-within:border-[#1976F2] transition-all flex items-center">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={selectedImage ? 'Add a caption to your photo...' : 'Type your message or negotiate terms...'}
            rows={1}
            disabled={disabled}
            className="w-full bg-transparent text-slate-900 dark:text-slate-100 placeholder-slate-400 text-[14px] outline-none resize-none max-h-32 min-h-[22px]"
          />
        </div>

        {/* Send Button in Vivid Blue */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && !selectedImage) || isSending || disabled}
          className={`p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center cursor-pointer ${
            text.trim() || selectedImage
              ? 'bg-[#1976F2] hover:bg-[#1565C0] text-white shadow-md active:scale-95'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
          }`}
          title="Send"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
