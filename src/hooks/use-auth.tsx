
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const initializeGuest = async () => {
      const savedProfileStr = localStorage.getItem('pulsetalk_guest_profile');
      let currentProfile: UserProfile;

      if (savedProfileStr) {
        currentProfile = JSON.parse(savedProfileStr);
      } else {
        const uid = `guest-${Math.random().toString(36).substr(2, 9)}`;
        currentProfile = {
          uid,
          name: 'Cosmic Traveler',
          email: `${uid}@pulsetalk.io`,
          avatar: `https://picsum.photos/seed/${uid}/200/200`,
          status: 'online',
          lastSeen: new Date().toISOString(),
        };
        localStorage.setItem('pulsetalk_guest_profile', JSON.stringify(currentProfile));
      }

      // Sync with Firestore for presence and profile existence
      try {
        const userDocRef = doc(db, 'users', currentProfile.uid);
        const userSnap = await getDoc(userDocRef);
        
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            ...currentProfile,
            lastSeen: serverTimestamp()
          });
        } else {
          await updateDoc(userDocRef, {
            status: 'online',
            lastSeen: serverTimestamp()
          });
        }
      } catch (e) {
        console.error("Presence sync failed", e);
      }

      setProfile(currentProfile);
      setLoading(false);
    };

    initializeGuest();
  }, []);

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem('pulsetalk_guest_profile', JSON.stringify(updated));
    
    // Sync to Firestore
    const userDocRef = doc(db, 'users', profile.uid);
    updateDoc(userDocRef, {
      ...data,
      lastSeen: serverTimestamp()
    }).catch(e => console.error("Profile sync failed", e));
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
