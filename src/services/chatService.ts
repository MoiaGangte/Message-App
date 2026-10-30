import {
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  deleteDoc,
  arrayUnion,
  Unsubscribe,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, handleFirestoreError, OperationType } from '../firebase/config';
import { Chat, Message, UserProfile, ParticipantDetail } from '../types/chat';
import { compressImage } from '../utils/imageCompressor';

export const chatService = {
  /**
   * Listen to all chats where current user is a participant
   */
  subscribeToUserChats(userId: string, onUpdate: (chats: Chat[]) => void): Unsubscribe {
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('participants', 'array-contains', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const chats: Chat[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Chat;
          chats.push({ ...data, id: docSnap.id });
        });
        // Sort by lastMessageTimestamp descending
        chats.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
        onUpdate(chats);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'chats');
      }
    );
  },

  /**
   * Listen to messages in a specific chat
   */
  subscribeToMessages(
    chatId: string,
    onUpdate: (messages: Message[]) => void
  ): Unsubscribe {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(200));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: Message[] = [];
        snapshot.forEach((docSnap) => {
          msgs.push({ ...docSnap.data(), id: docSnap.id } as Message);
        });
        onUpdate(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `chats/${chatId}/messages`);
      }
    );
  },

  /**
   * Get or create a 1-to-1 direct chat
   */
  async getOrCreateDirectChat(
    currentUser: UserProfile,
    targetUser: UserProfile
  ): Promise<string> {
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', currentUser.uid));

    try {
      const snap = await getDocs(q);
      for (const docSnap of snap.docs) {
        const data = docSnap.data() as Chat;
        if (!data.isGroup && data.participants.includes(targetUser.uid)) {
          return docSnap.id;
        }
      }

      // If not found, create new direct chat
      const newChatRef = doc(chatsRef);
      const now = Date.now();
      const iso = new Date().toISOString();

      const newChat: Chat = {
        id: newChatRef.id,
        isGroup: false,
        createdBy: currentUser.uid,
        participants: [currentUser.uid, targetUser.uid],
        participantDetails: {
          [currentUser.uid]: {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            email: currentUser.email,
          },
          [targetUser.uid]: {
            uid: targetUser.uid,
            displayName: targetUser.displayName,
            photoURL: targetUser.photoURL,
            email: targetUser.email,
          },
        },
        lastMessageTimestamp: now,
        unreadCounts: {
          [currentUser.uid]: 0,
          [targetUser.uid]: 0,
        },
        typingUsers: {},
        createdAt: iso,
        updatedAt: iso,
      };

      await setDoc(newChatRef, newChat);
      return newChatRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'chats');
    }
  },

  /**
   * Create a new group chat
   */
  async createGroupChat(
    currentUser: UserProfile,
    groupName: string,
    members: UserProfile[],
    groupAvatar?: string
  ): Promise<string> {
    const chatsRef = collection(db, 'chats');
    const newChatRef = doc(chatsRef);
    const now = Date.now();
    const iso = new Date().toISOString();

    const participantUids = [currentUser.uid, ...members.map((m) => m.uid)];
    const participantDetails: Record<string, ParticipantDetail> = {
      [currentUser.uid]: {
        uid: currentUser.uid,
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        email: currentUser.email,
      },
    };
    const unreadCounts: Record<string, number> = {
      [currentUser.uid]: 0,
    };

    members.forEach((m) => {
      participantDetails[m.uid] = {
        uid: m.uid,
        displayName: m.displayName,
        photoURL: m.photoURL,
        email: m.email,
      };
      unreadCounts[m.uid] = 0;
    });

    const newChat: Chat = {
      id: newChatRef.id,
      isGroup: true,
      name: groupName,
      groupAvatar:
        groupAvatar ||
        `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(groupName)}`,
      createdBy: currentUser.uid,
      participants: participantUids,
      participantDetails,
      lastMessage: {
        text: `${currentUser.displayName} created group "${groupName}"`,
        senderId: currentUser.uid,
        senderName: currentUser.displayName,
        timestamp: now,
        type: 'text',
      },
      lastMessageTimestamp: now,
      unreadCounts,
      typingUsers: {},
      createdAt: iso,
      updatedAt: iso,
    };

    try {
      await setDoc(newChatRef, newChat);
      return newChatRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'chats');
    }
  },

  /**
   * Send a text, image, offer, or system message
   */
  async sendMessage(
    chatId: string,
    sender: UserProfile,
    text: string,
    imageUrl?: string,
    type: 'text' | 'image' | 'offer' | 'system' = 'text',
    offer?: import('../types/chat').TradeOffer
  ): Promise<void> {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const chatRef = doc(db, 'chats', chatId);
    const now = Date.now();
    const iso = new Date().toISOString();

    try {
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) {
        throw new Error('Chat does not exist');
      }
      const chatData = chatSnap.data() as Chat;

      // Create message document
      const newMsgRef = doc(messagesRef);
      const newMsg: Message = {
        id: newMsgRef.id,
        chatId,
        senderId: sender.uid,
        senderName: sender.displayName,
        senderPhoto: sender.photoURL,
        text,
        imageUrl: imageUrl || '',
        type,
        offer: offer || undefined,
        timestamp: now,
        status: 'sent',
        readBy: [sender.uid],
        isDeleted: false,
        createdAt: iso,
      };

      await setDoc(newMsgRef, newMsg);

      // Calculate unread count increment for other participants
      const updatedUnread = { ...(chatData.unreadCounts || {}) };
      chatData.participants.forEach((uid) => {
        if (uid !== sender.uid) {
          updatedUnread[uid] = (updatedUnread[uid] || 0) + 1;
        } else {
          updatedUnread[uid] = 0;
        }
      });

      let previewText = text;
      if (type === 'image') {
        previewText = text ? `📷 ${text}` : '📷 Photo';
      } else if (type === 'offer' && offer) {
        previewText = `🏷️ Offer: $${offer.amount.toLocaleString()}`;
      } else if (type === 'system') {
        previewText = `ℹ️ ${text}`;
      }

      // Update parent chat document
      await updateDoc(chatRef, {
        lastMessage: {
          text: previewText,
          senderId: sender.uid,
          senderName: sender.displayName,
          timestamp: now,
          type,
          readBy: [sender.uid],
        },
        lastMessageTimestamp: now,
        unreadCounts: updatedUnread,
        updatedAt: iso,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `chats/${chatId}/messages`);
    }
  },

  /**
   * Accept, decline, or counter an offer
   */
  async respondToOffer(
    chatId: string,
    messageId: string,
    action: 'accepted' | 'declined',
    responder: UserProfile
  ): Promise<void> {
    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (!msgSnap.exists()) return;

      const msg = msgSnap.data() as Message;
      if (!msg.offer) return;

      // Update offer status
      await updateDoc(msgRef, {
        'offer.status': action,
      });

      // Post system announcement message
      if (action === 'accepted') {
        await this.sendMessage(
          chatId,
          responder,
          `🤝 Deal accepted! Both parties agreed to $${msg.offer.amount.toLocaleString()}. Keep all payments inside NicheTrade for buyer protection.`,
          undefined,
          'system'
        );
      } else {
        await this.sendMessage(
          chatId,
          responder,
          `Offer of $${msg.offer.amount.toLocaleString()} was declined.`,
          undefined,
          'system'
        );
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}/messages/${messageId}`);
    }
  },

  /**
   * Mark chat messages as read by current user
   */
  async markChatAsRead(chatId: string, currentUserId: string): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (!chatSnap.exists()) return;

      const chatData = chatSnap.data() as Chat;
      if (chatData.unreadCounts && chatData.unreadCounts[currentUserId] > 0) {
        await updateDoc(chatRef, {
          [`unreadCounts.${currentUserId}`]: 0,
        });
      }

      // Mark recent messages as read if not already in readBy
      const messagesRef = collection(db, 'chats', chatId, 'messages');
      const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(30));
      const snap = await getDocs(q);

      const updates: Promise<void>[] = [];
      snap.forEach((docSnap) => {
        const msg = docSnap.data() as Message;
        if (msg.senderId !== currentUserId && !msg.readBy?.includes(currentUserId)) {
          const docRef = doc(db, 'chats', chatId, 'messages', docSnap.id);
          updates.push(
            updateDoc(docRef, {
              status: 'read',
              readBy: arrayUnion(currentUserId),
            })
          );
        }
      });

      if (updates.length > 0) {
        await Promise.allSettled(updates);
      }
    } catch (err) {
      console.warn('Could not mark chat as read:', err);
    }
  },

  /**
   * Set typing indicator for a user in a chat
   */
  async setTypingStatus(chatId: string, userId: string, isTyping: boolean): Promise<void> {
    try {
      const chatRef = doc(db, 'chats', chatId);
      await updateDoc(chatRef, {
        [`typingUsers.${userId}`]: isTyping,
      });
    } catch {
      // Typing indicator error is non-critical
    }
  },

  /**
   * Delete message permanently from Firestore database
   * Removes it from Firestore and updates UI for all participants in real time.
   */
  async deleteMessage(chatId: string, messageId: string, senderId: string): Promise<void> {
    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (!msgSnap.exists()) return;

      const msgData = msgSnap.data() as Message;
      if (msgData.senderId !== senderId) {
        throw new Error('You can only delete your own sent messages');
      }

      // Remove from Firestore database
      await deleteDoc(msgRef);

      // If deleted message was the lastMessage on parent chat, recalculate lastMessage
      const chatRef = doc(db, 'chats', chatId);
      const chatSnap = await getDoc(chatRef);
      if (chatSnap.exists()) {
        const chatData = chatSnap.data() as Chat;
        if (chatData.lastMessage && chatData.lastMessage.timestamp === msgData.timestamp) {
          const messagesRef = collection(db, 'chats', chatId, 'messages');
          const latestQ = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));
          const latestSnap = await getDocs(latestQ);
          if (!latestSnap.empty) {
            const nextLast = latestSnap.docs[0].data() as Message;
            await updateDoc(chatRef, {
              lastMessage: {
                text: nextLast.type === 'image' ? (nextLast.text ? `📷 ${nextLast.text}` : '📷 Photo') : nextLast.text,
                senderId: nextLast.senderId,
                senderName: nextLast.senderName,
                timestamp: nextLast.timestamp,
                type: nextLast.type,
                readBy: nextLast.readBy || [],
              },
              lastMessageTimestamp: nextLast.timestamp,
              updatedAt: new Date().toISOString(),
            });
          } else {
            await updateDoc(chatRef, {
              lastMessage: null,
              lastMessageTimestamp: Date.now(),
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `chats/${chatId}/messages/${messageId}`);
    }
  },

  /**
   * Upload user profile picture to Firebase Storage and return download URL
   */
  async uploadProfilePicture(userId: string, file: File): Promise<string> {
    try {
      const { dataUrl } = await compressImage(file, 512, 512, 0.85);

      try {
        const fileExt = file.name.split('.').pop() || 'jpg';
        const storageRef = ref(storage, `avatars/${userId}/avatar_${Date.now()}.${fileExt}`);
        const res = await fetch(dataUrl);
        const blob = await res.blob();

        const snapshot = await uploadBytes(storageRef, blob, {
          contentType: file.type || 'image/jpeg',
        });
        const downloadUrl = await getDownloadURL(snapshot.ref);
        return downloadUrl;
      } catch (storageErr) {
        console.warn('Firebase Storage upload failed, fallback to compressed image data URL:', storageErr);
        return dataUrl;
      }
    } catch (err) {
      console.error('Failed to compress/upload profile picture:', err);
      throw err;
    }
  },

  /**
   * Sync updated profile information across user's active chats
   */
  async syncUserProfileToChats(user: UserProfile): Promise<void> {
    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', user.uid));
      const snap = await getDocs(q);

      const updates: Promise<void>[] = [];
      snap.forEach((docSnap) => {
        const updatePayload: Record<string, string> = {};
        if (user.displayName) {
          updatePayload[`participantDetails.${user.uid}.displayName`] = user.displayName;
        }
        if (user.photoURL) {
          updatePayload[`participantDetails.${user.uid}.photoURL`] = user.photoURL;
        }
        if (Object.keys(updatePayload).length > 0) {
          updates.push(updateDoc(doc(db, 'chats', docSnap.id), updatePayload));
        }
      });

      if (updates.length > 0) {
        await Promise.allSettled(updates);
      }
    } catch (err) {
      console.warn('Sync profile to chats notice:', err);
    }
  },

  /**
   * Toggle reaction on a message
   */
  async toggleReaction(
    chatId: string,
    messageId: string,
    userId: string,
    emoji: string
  ): Promise<void> {
    try {
      const msgRef = doc(db, 'chats', chatId, 'messages', messageId);
      const msgSnap = await getDoc(msgRef);
      if (!msgSnap.exists()) return;

      const data = msgSnap.data() as Message;
      const currentReactions = data.reactions || {};
      const updated = { ...currentReactions };

      if (updated[userId] === emoji) {
        delete updated[userId];
      } else {
        updated[userId] = emoji;
      }

      await updateDoc(msgRef, {
        reactions: updated,
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `chats/${chatId}/messages/${messageId}`);
    }
  },

  /**
   * Fetch all registered users in ChatLink (excluding current user)
   */
  async getAllUsers(currentUserId: string): Promise<UserProfile[]> {
    try {
      const usersRef = collection(db, 'users');
      const snap = await getDocs(usersRef);
      const users: UserProfile[] = [];

      snap.forEach((docSnap) => {
        if (docSnap.id !== currentUserId) {
          users.push(docSnap.data() as UserProfile);
        }
      });

      return users;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
    }
  },

  /**
   * Listen to all users in real-time to reflect online/offline status
   */
  subscribeToAllUsers(
    currentUserId: string,
    onUpdate: (users: UserProfile[]) => void
  ): Unsubscribe {
    const usersRef = collection(db, 'users');
    return onSnapshot(
      usersRef,
      (snap) => {
        const users: UserProfile[] = [];
        snap.forEach((docSnap) => {
          if (docSnap.id !== currentUserId) {
            users.push(docSnap.data() as UserProfile);
          }
        });
        onUpdate(users);
      },
      (err) => {
        console.warn('Users subscription error:', err);
      }
    );
  },
};
