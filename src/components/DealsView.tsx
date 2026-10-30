import React from 'react';
import { Handshake, ShieldCheck, CheckCircle2, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { Chat, UserProfile } from '../types/chat';

interface DealsViewProps {
  chats: Chat[];
  onOpenChat: (chat: Chat) => void;
  currentUser: UserProfile;
}

export const DealsView: React.FC<DealsViewProps> = ({ chats, onOpenChat, currentUser }) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F7FB] dark:bg-[#09131F] overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 bg-white dark:bg-[#0F1D2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
            <Handshake className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Trade Deals & Escrow</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active negotiations, accepted offers, and deal settlement status
            </p>
          </div>
        </div>
      </header>

      {/* Safety Summary Banner */}
      <div className="p-6">
        <div className="p-4 bg-gradient-to-r from-blue-900/10 to-indigo-900/10 border border-[#1976F2]/30 rounded-xl flex items-center gap-4">
          <ShieldCheck className="w-8 h-8 text-[#1976F2] flex-shrink-0" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              NicheTrade Buyer & Seller Protection
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
              All agreed offers are safeguarded. Only complete payments through verified escrow or verified in-person handovers.
            </p>
          </div>
        </div>

        {/* Deals list from active conversations */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
            Active Deal Conversations ({chats.length})
          </h2>

          {chats.length === 0 ? (
            <div className="bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400">
              <Handshake className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
              <p className="font-semibold text-slate-700 dark:text-slate-300">No active trade deals yet</p>
              <p className="text-xs mt-1">Start a conversation from Marketplace Listings to make an offer!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {chats.map((chat) => {
                const otherUid = chat.participants.find((p) => p !== currentUser.uid);
                const participant = otherUid ? chat.participantDetails?.[otherUid] : null;

                return (
                  <div
                    key={chat.id}
                    onClick={() => onOpenChat(chat)}
                    className="p-4 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#1976F2] transition-all cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={participant?.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${otherUid}`}
                        alt=""
                        className="w-11 h-11 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#1976F2]">
                            {chat.name || participant?.displayName || 'Trade Deal'}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-[#1976F2] font-semibold">
                            Verified Trade
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {chat.lastMessage?.text || 'No recent activity'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="hidden sm:block text-right">
                        <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 justify-end">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          In Negotiation
                        </span>
                        <span className="text-[11px] text-slate-400">Escrow Protected</span>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 group-hover:bg-[#1976F2] group-hover:text-white transition-colors text-slate-500">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
