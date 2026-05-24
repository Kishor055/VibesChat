
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: any;
}

interface AuthContextType {
  user: { uid: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  updateProfile: () => {},
});

const STORAGE_KEY = 'vibechat_guest_profile';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const initializeGuest = async () => {
      const savedProfileStr = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      let currentProfile: UserProfile;

      if (savedProfileStr) {
        currentProfile = JSON.parse(savedProfileStr);
      } else {
        const uid = `guest-${Math.random().toString(36).substr(2, 9)}`;
        currentProfile = {
          uid,
          name: 'Cosmic Traveler',
          email: `${uid}@vibechat.io`,
          avatar: `https://picsum.photos/seed/${uid}/200/200`,
          status: 'online',
          lastSeen: new Date().toISOString(),
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
        }
      }

      // Initial local state setup
      setProfile(currentProfile);
      setLoading(false);

      // Persistent Firestore sync and listener
      const userDocRef = doc(db, 'users', currentProfile.uid);
      
      const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
        if (snapshot.exists()) {
          const serverData = snapshot.data() as UserProfile;
          setProfile(prev => ({ ...prev, ...serverData } as UserProfile));
        } else {
          setDoc(userDocRef, {
            ...currentProfile,
            lastSeen: serverTimestamp(),
            status: 'online'
          });
        }
      });

      // Heartbeat: Ensure status is online on mount
      updateDoc(userDocRef, {
        status: 'online',
        lastSeen: serverTimestamp()
      }).catch(() => {});

      return unsubscribe;
    };

    let unsubPromise = initializeGuest();

    return () => {
      unsubPromise.then(unsub => unsub?.());
    };
  }, []);

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
    
    const userDocRef = doc(db, 'users', profile.uid);
    updateDoc(userDocRef, {
      ...data,
      lastSeen: serverTimestamp()
    }).catch(() => {});
  };

  const value = {
    user: profile ? { uid: profile.uid } : null,
    profile,
    loading: !mounted || loading,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
