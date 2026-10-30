import React, { useState } from 'react';
import { ShoppingBag, Search, Tag, ExternalLink, ShieldCheck, MapPin, Plus } from 'lucide-react';
import { SAMPLE_LISTINGS, MarketplaceListing } from '../theme/constants';
import { UserProfile } from '../types/chat';

interface ListingsViewProps {
  onStartInquiry: (listingTitle: string) => void;
  currentUser: UserProfile;
}

export const ListingsView: React.FC<ListingsViewProps> = ({ onStartInquiry, currentUser }) => {
  const [filter, setFilter] = useState<'all' | 'available' | 'sold'>('all');
  const [search, setSearch] = useState('');

  const listingsList = Object.values(SAMPLE_LISTINGS);

  const filteredListings = listingsList.filter((l) => {
    if (filter === 'available' && l.status === 'sold') return false;
    if (filter === 'sold' && l.status !== 'sold') return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#F4F7FB] dark:bg-[#09131F] overflow-hidden">
      {/* Header */}
      <header className="h-16 px-6 bg-white dark:bg-[#0F1D2F] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-[#1976F2]">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">Marketplace Listings</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified high-value items under escrow and buyer protection
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartInquiry('Custom Listed Item')}
          className="px-4 py-2 bg-[#1976F2] hover:bg-[#1565C0] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          New Listing
        </button>
      </header>

      {/* Filter and Search Bar */}
      <div className="px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/50 dark:bg-[#0F1D2F]/50 border-b border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search listings by title or brand..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-[#0B1728] border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#1976F2] text-slate-800 dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {(['all', 'available', 'sold'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-[#1976F2] text-white shadow-xs'
                  : 'bg-white dark:bg-[#0F1D2F] text-slate-600 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Listings Grid */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredListings.map((item) => (
          <div
            key={item.id}
            className="bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-shadow flex flex-col overflow-hidden"
          >
            <div className="relative h-48 bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <span
                className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                  item.status === 'available'
                    ? 'bg-emerald-500 text-white'
                    : item.status === 'negotiating'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-600 text-white'
                }`}
              >
                {item.status}
              </span>
              <span className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-white text-[11px] font-medium backdrop-blur-xs">
                {item.condition}
              </span>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span>{item.category}</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                </div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-slate-100 line-clamp-2">
                  {item.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    Asking Price
                  </span>
                  <span className="text-lg font-bold text-[#1976F2]">
                    ${item.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => onStartInquiry(item.title)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#0B1F3A] dark:bg-[#1976F2] text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5" />
                  Inquire / Chat
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
