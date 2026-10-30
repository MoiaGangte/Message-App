export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  about: string;
  online: boolean;
  lastSeen: string;
  createdAt: string;
  rating?: number;
  dealsCompleted?: number;
  isVerified?: boolean;
}

export interface ParticipantDetail {
  uid: string;
  displayName: string;
  photoURL: string;
  email: string;
  isVerified?: boolean;
}

export interface TradeOffer {
  amount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'declined' | 'countered';
  itemTitle?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  senderPhoto?: string;
  text: string;
  imageUrl?: string;
  type: 'text' | 'image' | 'offer' | 'system';
  offer?: TradeOffer;
  timestamp: number;
  status: 'sent' | 'delivered' | 'read';
  readBy: string[];
  isDeleted?: boolean;
  reactions?: Record<string, string>; // uid -> emoji
  createdAt: string;
}

export interface ChatLastMessage {
  text: string;
  senderId: string;
  senderName: string;
  timestamp: number;
  type: 'text' | 'image' | 'offer' | 'system';
  readBy?: string[];
}

export interface Chat {
  id: string;
  isGroup: boolean;
  name?: string;
  groupAvatar?: string;
  createdBy: string;
  participants: string[];
  participantDetails: Record<string, ParticipantDetail>;
  lastMessage?: ChatLastMessage;
  lastMessageTimestamp: number;
  unreadCounts?: Record<string, number>; // uid -> count
  typingUsers?: Record<string, boolean>; // uid -> isTyping
  itemTitle?: string;
  itemPrice?: number;
  itemStatus?: 'available' | 'negotiating' | 'sold';
  createdAt: string;
  updatedAt: string;
}
