
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash, Plus, Settings, Search, LogOut, User as UserIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { collection, query, onSnapshot, where } from 'firebase/firestore';
import { db } from '@/firebase/config';

interface ChatSidebarProps {
  activeRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

interface FirestoreUser {
  uid: string;
  name: string;
  avatar: string;
  status: 'online' | 'offline' | 'away';
  email: string;
}

interface Room {
  id: string;
  name: string;
  type: 'group' | 'private';
}

export function ChatSidebar({ activeRoomId, onRoomSelect }: ChatSidebarProps) {
  const { profile, signOut } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [rooms, setRooms] = useState<Room[]>([
    { id: 'general', name: 'General', type: 'group' },
    { id: 'random', name: 'Random', type: 'group' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Listen for users
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: FirestoreUser[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreUser;
        if (data.uid !== profile?.uid) {
          usersData.push(data);
        }
      });
      setUsers(usersData);
    });

    return () => unsubscribe();
  }, [profile?.uid]);

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col glass-darker border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <h1 className="font-headline font-bold text-xl tracking-tight">PulseTalk</h1>
          </div>
          <Button variant="ghost" size="icon" className="hover:bg-white/5 text-muted-foreground">
            <Settings className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:ring-primary/50"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          <div>
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rooms</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {rooms.map(room => (
                <button
                  key={room.id}
                  onClick={() => onRoomSelect(room.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    activeRoomId === room.id ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Hash className={cn("w-4 h-4", activeRoomId === room.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                  <span className="text-sm font-medium">{room.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between px-2 mb-3">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Direct Messages</span>
              <Button variant="ghost" size="icon" className="h-6 w-6 hover:bg-white/5">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-1">
              {filteredUsers.map(user => (
                <button
                  key={user.uid}
                  onClick={() => onRoomSelect(user.uid)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                    activeRoomId === user.uid ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      "absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background",
                      user.status === 'online' ? "bg-green-500" : user.status === 'away' ? "bg-yellow-500" : "bg-gray-500"
                    )} />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-3 glass-card rounded-xl">
          <Avatar className="w-10 h-10 border border-white/10">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>{profile?.name?.[0] || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{profile?.name || 'Loading...'}</p>
            <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => signOut()}
            className="hover:bg-red-500/10 hover:text-red-500"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
