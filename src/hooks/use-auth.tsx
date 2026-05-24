
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
  user: any;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
}

const GUEST_PROFILE: UserProfile = {
  uid: 'guest-user-123',
  name: 'Cosmic Traveler',
  email: 'guest@pulsetalk.io',
  avatar: 'https://picsum.photos/seed/guest/200/200',
  status: 'online',
  lastSeen: new Date(),
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = {
    user: mounted ? { uid: 'guest-user-123' } : null,
    profile: mounted ? GUEST_PROFILE : null,
    loading: !mounted,
    signOut: async () => { console.log("Guest cannot sign out"); },
    signInWithGoogle: async () => {},
    signInWithEmail: async () => {},
    signUpWithEmail: async () => {},
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
