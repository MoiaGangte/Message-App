import React, { useState } from 'react';
import { X, Tag, ShieldCheck, DollarSign } from 'lucide-react';

interface MakeOfferModalProps {
  itemTitle: string;
  askingPrice: number;
  onSendOffer: (amount: number, note?: string) => Promise<void>;
  onClose: () => void;
}

export const MakeOfferModal: React.FC<MakeOfferModalProps> = ({
  itemTitle,
  askingPrice,
  onSendOffer,
  onClose,
}) => {
  const [offerAmount, setOfferAmount] = useState<string>(
    String(Math.round(askingPrice * 0.95))
  );
  const [note, setNote] = useState('I am ready to complete the transaction today.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(offerAmount);
    if (isNaN(num) || num <= 0 || loading) return;

    setLoading(true);
    try {
      await onSendOffer(num, note.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#0F1D2F] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-[#0B1F3A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#1976F2] text-white">
              <Tag className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-sm">Make an Official Trade Offer</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-[#F4F7FB] dark:bg-[#09131F] rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-bold uppercase text-slate-400 block mb-0.5">
              Item Under Discussion
            </span>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              {itemTitle}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Asking Price: <span className="font-bold text-slate-700 dark:text-slate-300">${askingPrice.toLocaleString()}</span>
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Your Offer Amount ($ USD)
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">$</span>
              <input
                type="number"
                min="1"
                step="1"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-white dark:bg-[#0B1728] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1976F2] text-sm font-bold text-slate-900 dark:text-slate-100"
                required
                autoFocus
              />
            </div>
          </div>

          {/* Quick preset percentage buttons */}
          <div className="flex gap-2">
            {[0.9, 0.95, 1.0].map((multiplier) => {
              const val = Math.round(askingPrice * multiplier);
              return (
                <button
                  type="button"
                  key={multiplier}
                  onClick={() => setOfferAmount(String(val))}
                  className="flex-1 py-1 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-300 hover:text-[#1976F2] rounded-lg border border-slate-200 dark:border-slate-700 transition-colors font-medium"
                >
                  ${val.toLocaleString()} ({Math.round(multiplier * 100)}%)
                </button>
              );
            })}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
              Message to Seller (Optional)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add terms or delivery preferences..."
              className="w-full px-3.5 py-2 bg-white dark:bg-[#0B1728] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1976F2] text-xs text-slate-900 dark:text-slate-100"
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded-xl text-[11px] text-[#1976F2] dark:text-blue-300">
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Escrow guarantee applies automatically once the seller accepts.</span>
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold bg-[#1976F2] hover:bg-[#1565C0] text-white rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Send Offer Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
