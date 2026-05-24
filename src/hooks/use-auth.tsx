
"use client";

import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth, db } from '@/firebase/config';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  lastSeen: any;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = doc(db, 'users', user.uid);
        try {
          const snap = await getDoc(userDoc);
          
          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            // Update status to online
            await updateDoc(userDoc, {
              status: 'online',
              lastSeen: serverTimestamp(),
            });
          } else {
            // Create new user profile
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Anonymous',
              email: user.email || '',
              avatar: user.photoURL || `https://picsum.photos/seed/${user.uid}/200/200`,
              status: 'online',
              lastSeen: serverTimestamp(),
            };
            await setDoc(userDoc, newProfile);
            setProfile(newProfile);
          }
        } catch (error) {
          console.error("Error fetching/setting user profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signOut = async () => {
    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          status: 'offline',
          lastSeen: serverTimestamp(),
        });
      } catch (e) {
        console.error("Error updating status during sign out:", e);
      }
    }
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
