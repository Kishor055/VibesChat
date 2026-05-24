
"use client";

import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';

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
    // Persist guest identity in localStorage
    const savedProfile = localStorage.getItem('pulsetalk_guest_profile');
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else {
      const newGuest: UserProfile = {
        uid: `guest-${Math.random().toString(36).substr(2, 9)}`,
        name: 'Cosmic Traveler',
        email: 'guest@pulsetalk.io',
        avatar: `https://picsum.photos/seed/${Math.random()}/200/200`,
        status: 'online',
        lastSeen: new Date().toISOString(),
      };
      setProfile(newGuest);
      localStorage.setItem('pulsetalk_guest_profile', JSON.stringify(newGuest));
    }
    setLoading(false);
  }, []);

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...data };
    setProfile(updated);
    localStorage.setItem('pulsetalk_guest_profile', JSON.stringify(updated));
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
