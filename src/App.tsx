import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { NavigationRail, RailTab } from './components/NavigationRail';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ListingsView } from './components/ListingsView';
import { DealsView } from './components/DealsView';
import { NewChatModal } from './components/NewChatModal';
import { NewGroupModal } from './components/NewGroupModal';
import { ProfilePage } from './components/ProfilePage';
import { Chat, Message, UserProfile, TradeOffer } from './types/chat';
import { chatService } from './services/chatService';
import { soundManager } from './utils/sound';
import { ShieldCheck, Tag, Handshake, MessageSquare, Lock } from 'lucide-react';

function NicheTradeMain() {
  const {
    currentUser,
    userProfile,
    loading,
    isLoggingIn,
    signInWithGoogle,
    logout,
    updateProfileData,
  } = useAuth();

  const [activeRailTab, setActiveRailTab] = useState<RailTab>('chats');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Modals & Drawers
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);

  // Dark mode (persisted to localStorage)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return (
      localStorage.getItem('nichetrade_dark_mode') === 'true' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nichetrade_dark_mode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nichetrade_dark_mode', 'false');
    }
  }, [darkMode]);

  // Total unread count for rail badge
  const unreadTotal = chats.reduce(
    (acc, c) => acc + (c.unreadCounts?.[currentUser?.uid || ''] || 0),
    0
  );

  // Subscribe to user's chats
  useEffect(() => {
    if (!currentUser) {
      setChats([]);
      return;
    }
    const unsubChats = chatService.subscribeToUserChats(currentUser.uid, (userChats) => {
      setChats(userChats);
    });
    return () => unsubChats();
  }, [currentUser]);

  // Subscribe to all users in the system to sync presence
  useEffect(() => {
    if (!currentUser) {
      setAllUsers([]);
      return;
    }
    const unsubUsers = chatService.subscribeToAllUsers(currentUser.uid, (users) => {
      setAllUsers(users);
    });
    return () => unsubUsers();
  }, [currentUser]);

  // Subscribe to messages of active chat
  useEffect(() => {
    if (!activeChatId || !currentUser) {
      setMessages([]);
      return;
    }

    const unsubMessages = chatService.subscribeToMessages(activeChatId, (msgs) => {
      setMessages(msgs);
    });

    chatService.markChatAsRead(activeChatId, currentUser.uid);

    return () => unsubMessages();
  }, [activeChatId, currentUser]);

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Handlers
  const handleSelectChat = (chat: Chat) => {
    setActiveChatId(chat.id);
    setActiveRailTab('chats');
    if (currentUser) {
      chatService.markChatAsRead(chat.id, currentUser.uid);
    }
  };

  const handleSendMessage = async (
    text: string,
    imageUrl?: string,
    type: 'text' | 'image' | 'offer' | 'system' = 'text',
    offer?: TradeOffer
  ) => {
    if (!activeChatId || !userProfile) return;
    await chatService.sendMessage(activeChatId, userProfile, text, imageUrl, type, offer);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!activeChatId || !currentUser) return;
    await chatService.deleteMessage(activeChatId, messageId, currentUser.uid);
  };

  const handleReactMessage = async (messageId: string, emoji: string) => {
    if (!activeChatId || !currentUser) return;
    await chatService.toggleReaction(activeChatId, messageId, currentUser.uid, emoji);
  };

  const handleRespondOffer = async (messageId: string, action: 'accepted' | 'declined') => {
    if (!activeChatId || !userProfile) return;
    await chatService.respondToOffer(activeChatId, messageId, action, userProfile);
  };

  const handleTyping = (isTyping: boolean) => {
    if (!activeChatId || !currentUser) return;
    chatService.setTypingStatus(activeChatId, currentUser.uid, isTyping);
  };

  const handleStartDirectChat = async (targetUser: UserProfile) => {
    if (!userProfile) return;
    setShowNewChatModal(false);
    const chatId = await chatService.getOrCreateDirectChat(userProfile, targetUser);
    setActiveChatId(chatId);
    setActiveRailTab('chats');
  };

  const handleCreateGroup = async (
    name: string,
    members: UserProfile[],
    avatar?: string
  ) => {
    if (!userProfile) return;
    const chatId = await chatService.createGroupChat(userProfile, name, members, avatar);
    setActiveChatId(chatId);
    setActiveRailTab('chats');
  };

  const handleStartInquiryFromListing = (listingTitle: string) => {
    setShowNewChatModal(true);
  };

  // Loading state
  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#F4F7FB] dark:bg-[#09131F] flex flex-col items-center justify-center font-sans">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1976F2] to-[#0B1F3A] flex items-center justify-center text-white font-extrabold text-2xl shadow-xl mb-4 animate-pulse">
          N
        </div>
        <div className="w-48 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div className="w-2/3 h-full bg-[#1976F2] rounded-full animate-indeterminate" />
        </div>
        <p className="text-xs font-semibold text-slate-500 mt-4 tracking-wider uppercase">
          Loading NicheTrade...
        </p>
      </div>
    );
  }

  // Unauthenticated: Show NicheTrade Login Screen
  if (!currentUser || !userProfile) {
    return (
      <LoginScreen
        onSignInWithGoogle={signInWithGoogle}
        loading={isLoggingIn}
      />
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F4F7FB] dark:bg-[#09131F] flex font-sans antialiased text-slate-900 dark:text-slate-100">
      {/* 1. Slim Left Icon Rail */}
      <NavigationRail
        activeTab={activeRailTab}
        onTabChange={(tab) => {
          if (tab === 'profile' || tab === 'settings') {
            setShowProfileDrawer(true);
          } else {
            setActiveRailTab(tab);
          }
        }}
        currentUser={userProfile}
        unreadTotal={unreadTotal}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
        soundEnabled={soundManager.enabled}
        onToggleSound={() => soundManager.setEnabled(!soundManager.enabled)}
      />

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex h-full overflow-hidden relative">
        {/* TAB A: Listings View */}
        {activeRailTab === 'listings' && (
          <ListingsView
            onStartInquiry={handleStartInquiryFromListing}
            currentUser={userProfile}
          />
        )}

        {/* TAB B: Deals & Escrow View */}
        {activeRailTab === 'deals' && (
          <DealsView
            chats={chats}
            onOpenChat={handleSelectChat}
            currentUser={userProfile}
          />
        )}

        {/* TAB C: Activity / Notifications (Clean marketplace summary) */}
        {activeRailTab === 'notifications' && (
          <div className="flex-1 flex flex-col h-full bg-[#F4F7FB] dark:bg-[#09131F] p-6 overflow-y-auto">
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Marketplace Activity & Alerts
            </h1>
            <div className="space-y-3 max-w-2xl">
              <div className="p-4 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#1976F2]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Trader Account Verified
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Your account is registered with Google OAuth and granted verified trader credentials.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-white dark:bg-[#0F1D2F] rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
                  <Handshake className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Buyer & Seller Escrow Ready
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    You can negotiate and receive binding offers on all item listings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB D: Messages / Two-Pane Marketplace Layout */}
        {activeRailTab === 'chats' && (
          <div className="flex-1 flex h-full overflow-hidden w-full">
            {/* Left Chat List Panel */}
            <div
              className={`${
                activeChatId ? 'hidden md:flex' : 'flex'
              } w-full md:w-84 lg:w-96 h-full flex-col relative z-10 flex-shrink-0`}
            >
              <Sidebar
                currentUser={userProfile}
                chats={chats}
                activeChatId={activeChatId}
                allUsers={allUsers}
                darkMode={darkMode}
                onToggleDarkMode={() => setDarkMode(!darkMode)}
                onSelectChat={handleSelectChat}
                onOpenNewChat={() => setShowNewChatModal(true)}
                onOpenNewGroup={() => setShowNewGroupModal(true)}
                onOpenProfile={() => setShowProfileDrawer(true)}
                onLogout={logout}
              />
            </div>

            {/* Right Conversation Pane */}
            <div
              className={`${
                activeChatId ? 'flex' : 'hidden md:flex'
              } flex-1 h-full flex-col relative z-10`}
            >
              {activeChat ? (
                <ChatWindow
                  chat={activeChat}
                  messages={messages}
                  currentUser={userProfile}
                  allUsers={allUsers}
                  onBack={() => setActiveChatId(null)}
                  onSendMessage={handleSendMessage}
                  onDeleteMessage={handleDeleteMessage}
                  onReactMessage={handleReactMessage}
                  onRespondOffer={handleRespondOffer}
                  onTyping={handleTyping}
                />
              ) : (
                /* Empty state */
                <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#F4F7FB] dark:bg-[#09131F] text-center border-l border-slate-200 dark:border-slate-800 select-none">
                  <div className="max-w-md flex flex-col items-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1976F2] to-[#0B1F3A] text-white flex items-center justify-center font-extrabold text-3xl shadow-lg mb-6">
                      N
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                      NicheTrade Communications
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                      Select a conversation on the left to review offers, inspect listing photos, or start negotiating terms.
                    </p>
                    <div className="mt-6 flex items-center gap-2">
                      <button
                        onClick={() => setShowNewChatModal(true)}
                        className="px-4 py-2 bg-[#1976F2] hover:bg-[#1565C0] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        New Trade Inquiry
                      </button>
                      <button
                        onClick={() => setActiveRailTab('listings')}
                        className="px-4 py-2 bg-white dark:bg-[#0F1D2F] hover:bg-slate-100 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer"
                      >
                        Browse Listings
                      </button>
                    </div>
                  </div>
                  <div className="mt-auto pt-8 flex items-center gap-1.5 text-xs text-slate-400">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Protected by NicheTrade Escrow Systems & Firestore Security</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Profile & Settings Drawer */}
        {showProfileDrawer && (
          <ProfilePage
            userProfile={userProfile}
            darkMode={darkMode}
            soundEnabled={soundManager.enabled}
            onToggleDarkMode={() => setDarkMode(!darkMode)}
            onToggleSound={() => soundManager.setEnabled(!soundManager.enabled)}
            onClose={() => setShowProfileDrawer(false)}
            onUpdateProfile={updateProfileData}
          />
        )}
      </div>

      {/* New Trade Inquiry Modal */}
      {showNewChatModal && (
        <NewChatModal
          users={allUsers}
          onSelectUser={handleStartDirectChat}
          onClose={() => setShowNewChatModal(false)}
        />
      )}

      {/* New Group Deal Room Modal */}
      {showNewGroupModal && (
        <NewGroupModal
          users={allUsers}
          onCreateGroup={handleCreateGroup}
          onClose={() => setShowNewGroupModal(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NicheTradeMain />
    </AuthProvider>
  );
}
