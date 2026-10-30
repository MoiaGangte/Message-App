import React, { useEffect } from 'react';
import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface MediaViewerModalProps {
  imageUrl: string;
  senderName?: string;
  timestamp?: number | string;
  onClose: () => void;
}

export const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  imageUrl,
  senderName,
  timestamp,
  onClose,
}) => {
  const [scale, setScale] = React.useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `nichetrade-media-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex flex-col justify-between animate-in fade-in duration-200">
      {/* Top action bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-b from-black/60 to-transparent text-white">
        <div>
          {senderName && <p className="font-medium text-sm sm:text-base">{senderName}</p>}
          {timestamp && (
            <p className="text-xs text-gray-400">
              {new Date(timestamp).toLocaleString([], {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.min(s + 0.25, 3))}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
          <button
            onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
            title="Download image"
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors text-gray-300 hover:text-white"
            title="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        className="flex-1 flex items-center justify-center p-4 overflow-auto cursor-zoom-out"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <img
          src={imageUrl}
          alt="Chat attachment"
          style={{ transform: `scale(${scale})` }}
          className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl transition-transform duration-150 cursor-default"
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* Footer hint */}
      <div className="py-2 text-center text-xs text-gray-500">
        Press ESC or click outside to dismiss
      </div>
    </div>
  );
};
