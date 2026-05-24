
"use client";

import React, { createContext, useContext, ReactNode } from 'react';

// Simplified user profile for the guest experience
interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: any;
}

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
}

// Create a static Guest Profile
const GUEST_PROFILE: UserProfile = {
  uid: 'guest-user-123',
  name: 'Cosmic Traveler',
  email: 'guest@pulsetalk.io',
  avatar: 'https://picsum.photos/seed/guest/200/200',
  status: 'online',
  lastSeen: new Date(),
};

const AuthContext = createContext<AuthContextType>({
  user: { uid: 'guest-user-123' },
  profile: GUEST_PROFILE,
  loading: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // We provide the Guest context directly to remove login barriers
  return (
    <AuthContext.Provider value={{ 
      user: { uid: 'guest-user-123' }, 
      profile: GUEST_PROFILE, 
      loading: false, 
      signOut: async () => { console.log('Guest logout requested'); }, 
      signInWithGoogle: async () => {}, 
      signInWithEmail: async () => {}, 
      signUpWithEmail: async () => {} 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
