import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, testConnection, handleFirestoreError, OperationType } from '../firebase/config';
import { UserProfile } from '../types/chat';
import { chatService } from '../services/chatService';

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isLoggingIn: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: { displayName?: string; photoURL?: string; about?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Validate Firestore connection on boot
  useEffect(() => {
    testConnection();
  }, []);

  // Update presence status helper
  const updatePresence = async (uid: string, online: boolean) => {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        online,
        lastSeen: new Date().toISOString(),
      });
    } catch {
      // Ignore background presence failures
    }
  };

  useEffect(() => {
    let unsubscribeUserDoc: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        const userRef = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userRef);
          const now = new Date().toISOString();

          if (!snap.exists()) {
            const initialProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName || user.email?.split('@')[0] || 'User',
              email: user.email || '',
              photoURL:
                user.photoURL ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
              about: 'Verified collector & trader on NicheTrade.',
              online: true,
              lastSeen: now,
              createdAt: now,
            };
            await setDoc(userRef, initialProfile);
            setUserProfile(initialProfile);
          } else {
            const data = snap.data() as UserProfile;
            const updatedProfile: UserProfile = {
              ...data,
              online: true,
              lastSeen: now,
              // Update photo or name if empty
              displayName: data.displayName || user.displayName || 'User',
              photoURL: data.photoURL || user.photoURL || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.uid}`,
            };
            await updateDoc(userRef, {
              online: true,
              lastSeen: now,
            });
            setUserProfile(updatedProfile);
          }
        } catch (err) {
          console.error('Error fetching/setting user profile:', err);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    // Window beforeunload / visibility listeners to update presence
    const handleVisibilityChange = () => {
      if (auth.currentUser) {
        const isVisible = document.visibilityState === 'visible';
        updatePresence(auth.currentUser.uid, isVisible);
      }
    };

    const handleBeforeUnload = () => {
      if (auth.currentUser) {
        updatePresence(auth.currentUser.uid, false);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      unsubscribeAuth();
      if (unsubscribeUserDoc) unsubscribeUserDoc();
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const signInWithGoogle = async () => {
    setIsLoggingIn(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In failed:', error);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const logout = async () => {
    if (currentUser) {
      await updatePresence(currentUser.uid, false);
    }
    await signOut(auth);
    setUserProfile(null);
    setCurrentUser(null);
  };

  const updateProfileData = async (data: { displayName?: string; photoURL?: string; about?: string }) => {
    if (!currentUser || !userProfile) return;
    const userRef = doc(db, 'users', currentUser.uid);
    try {
      await updateDoc(userRef, {
        ...data,
        lastSeen: new Date().toISOString(),
      });
      const updated = { ...userProfile, ...data };
      setUserProfile(updated);
      await chatService.syncUserProfileToChats(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${currentUser.uid}`);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isLoggingIn,
        signInWithGoogle,
        logout,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
