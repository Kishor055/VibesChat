'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash, Plus, Settings, Search, LayoutGrid, MessageSquare, Sparkles, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ChatSidebarProps {
  activeView: 'chat' | 'feed';
  onViewChange: (view: 'chat' | 'feed') => void;
  activeRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

interface Room {
  id: string;
  name: string;
  type: 'group' | 'private';
}

export function ChatSidebar({ activeView, onViewChange, activeRoomId, onRoomSelect }: ChatSidebarProps) {
  const { profile, updateProfile } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState(profile?.name || '');

  useEffect(() => {
    const q = query(collection(db, 'rooms'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData: Room[] = [
        { id: 'general', name: 'General', type: 'group' },
        { id: 'dev-hub', name: 'Dev Hub', type: 'group' }
      ];
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() } as Room);
      });
      const uniqueRooms = roomsData.filter((room, index, self) =>
        index === self.findIndex((t) => t.id === room.id)
      );
      setRooms(uniqueRooms);
    });

    return () => unsubscribe();
  }, []);

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return;
    try {
      addDoc(collection(db, 'rooms'), {
        name: newRoomName.trim(),
        type: 'group',
        createdAt: serverTimestamp(),
        createdBy: profile?.uid
      });
      setNewRoomName('');
      setIsDialogOpen(false);
    } catch (e) {
      // Background handling
    }
  };

  const saveProfile = () => {
    updateProfile({ name: tempName });
    setIsEditingProfile(false);
  };

  const filteredRooms = rooms.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 h-full flex flex-col glass-darker border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="font-headline font-bold text-xl tracking-tight">VibeChat</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-muted-foreground">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-darker border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Create New Channel</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Channels are where your team communicates. Best for project hubs.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="e.g. creative-hub"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="bg-white/5 border-white/10"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateRoom} className="bg-primary hover:bg-primary/90">Create Channel</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Navigation Mode Toggles */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('chat')}
            className={cn("h-9 rounded-xl gap-2", activeView === 'chat' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('feed')}
            className={cn("h-9 rounded-xl gap-2", activeView === 'feed' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs">Feed</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search network..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:ring-primary/50"
            suppressHydrationWarning
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {activeView === 'chat' ? (
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Channels</span>
              </div>
              <div className="space-y-1">
                {filteredRooms.map(room => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group",
                      activeRoomId === room.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    )}
                  >
                    <Hash className={cn("w-4 h-4", activeRoomId === room.id ? "text-white" : "text-muted-foreground group-hover:text-primary")} />
                    <span className="text-sm font-medium">{room.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between px-2 mb-3">
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Global Stream</span>
              </div>
              <div className="px-2 space-y-4">
                <div className="p-3 glass-card rounded-xl border-primary/20">
                  <div className="flex items-center gap-2 text-primary mb-2">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-[10px] font-bold uppercase">Trending Visuals</span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Browse visual moments shared across the cosmic network. React and interact live.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex flex-col gap-3 p-3 glass-card rounded-xl">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 border border-white/10">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback>{profile?.name?.[0] || '?'}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              {isEditingProfile ? (
                <div className="flex items-center gap-1">
                  <Input 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    className="h-7 text-xs bg-white/10 border-none"
                    autoFocus
                    suppressHydrationWarning
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveProfile}>
                    <Check className="w-3 h-3 text-green-500" />
                  </Button>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold truncate flex items-center gap-2">
                    {profile?.name}
                    <button onClick={() => setIsEditingProfile(true)}>
                      <Settings className="w-3 h-3 text-muted-foreground hover:text-white" />
                    </button>
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate uppercase tracking-tighter">Verified Traveler</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
