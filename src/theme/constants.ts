/**
 * NicheTrade Shared Theme & Marketplace Constants
 */

export const THEME = {
  colors: {
    navy: '#0B1F3A',
    navyDark: '#071526',
    navyLight: '#132C4F',
    vividBlue: '#1976F2',
    vividBlueHover: '#1565C0',
    softBg: '#F4F7FB',
    darkBg: '#09131F',
    darkCard: '#0F1D2F',
    darkBorder: '#1A2E47',
    successGreen: '#16A34A',
    amberPending: '#F59E0B',
  },
  radius: {
    card: 'rounded-xl', // 12px
    badge: 'rounded-md',
  },
};

export interface MarketplaceListing {
  id: string;
  title: string;
  price: number;
  currency: string;
  category: string;
  status: 'available' | 'negotiating' | 'sold';
  imageUrl: string;
  condition: string;
  location: string;
}

export const SAMPLE_LISTINGS: Record<string, MarketplaceListing> = {
  default: {
    id: 'lst-1',
    title: 'Vintage Leica M6 0.72x Rangefinder Camera (Mint Condition)',
    price: 3250,
    currency: '$',
    category: 'Photography',
    status: 'negotiating',
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80',
    condition: 'Like New (9/10)',
    location: 'San Francisco, CA',
  },
  l2: {
    id: 'lst-2',
    title: 'Apple MacBook Pro 16" M3 Max (48GB RAM, 1TB SSD, Space Black)',
    price: 2850,
    currency: '$',
    category: 'Electronics',
    status: 'available',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=400&q=80',
    condition: 'Open Box',
    location: 'Austin, TX',
  },
  l3: {
    id: 'lst-3',
    title: 'Herman Miller Aeron Chair Remastered (Size B, Fully Loaded)',
    price: 950,
    currency: '$',
    category: 'Furniture',
    status: 'negotiating',
    imageUrl: 'https://images.unsplash.com/photo-1580481077194-c102c93d56b3?auto=format&fit=crop&w=400&q=80',
    condition: 'Excellent',
    location: 'New York, NY',
  },
  l4: {
    id: 'lst-4',
    title: 'Sony FE 24-70mm f/2.8 GM II Lens',
    price: 1680,
    currency: '$',
    category: 'Photography',
    status: 'sold',
    imageUrl: 'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?auto=format&fit=crop&w=400&q=80',
    condition: 'Brand New',
    location: 'Seattle, WA',
  },
};

/**
 * Deterministically associates a chat with an appropriate marketplace listing
 */
export function getChatListing(chatId: string, customTitle?: string): MarketplaceListing {
  const keys = Object.keys(SAMPLE_LISTINGS);
  let hash = 0;
  for (let i = 0; i < chatId.length; i++) {
    hash = chatId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const key = keys[Math.abs(hash) % keys.length];
  const base = SAMPLE_LISTINGS[key] || SAMPLE_LISTINGS.default;

  if (customTitle && customTitle.trim().length > 3) {
    return {
      ...base,
      title: customTitle,
    };
  }
  return base;
}
