
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Hash, Plus, Settings, Search, LayoutGrid, MessageSquare, Sparkles, Check, Users, Radio, Share2, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where,
  doc,
  setDoc,
  orderBy
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
import { generateAiAvatar } from '@/ai/flows/generate-ai-avatar';
import { useToast } from '@/hooks/use-toast';

interface ChatSidebarProps {
  activeView: 'chat' | 'feed' | 'friends';
  onViewChange: (view: 'chat' | 'feed' | 'friends') => void;
  activeRoomId: string;
  onRoomSelect: (roomId: string) => void;
}

interface Room {
  id: string;
  name: string;
  type: 'group' | 'private';
  participants?: string[];
}

interface Friend {
  uid: string;
  name: string;
  avatar: string;
  status: string;
}

export function ChatSidebar({ activeView, onViewChange, activeRoomId, onRoomSelect }: ChatSidebarProps) {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [newRoomName, setNewRoomName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isForging, setIsForging] = useState(false);
  const [tempName, setTempName] = useState(profile?.name || '');
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const q = query(collection(db, 'rooms'), orderBy('createdAt', 'desc'));
    const unsubscribeRooms = onSnapshot(q, (snapshot) => {
      const roomsData: Room[] = [
        { id: 'general', name: 'General Hub', type: 'group' },
        { id: 'dev-sector', name: 'Dev Sector', type: 'group' }
      ];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.type === 'group' || (data.type === 'private' && data.participants?.includes(profile.uid))) {
          roomsData.push({ id: doc.id, ...data } as Room);
        }
      });
      setRooms(roomsData);
    });

    const usersQ = query(collection(db, 'users'), where('uid', '!=', profile.uid));
    const unsubscribeUsers = onSnapshot(usersQ, (snapshot) => {
      const usersData: Friend[] = [];
      snapshot.forEach(doc => {
        usersData.push(doc.data() as Friend);
      });
      setFriends(usersData);
    });

    return () => {
      unsubscribeRooms();
      unsubscribeUsers();
    };
  }, [profile?.uid]);

  const handleForgeAvatar = async () => {
    if (!profile) return;
    setIsForging(true);
    try {
      const result = await generateAiAvatar({ theme: "A futuristic cosmic explorer with glowing armor" });
      if (result?.avatarUrl) {
        updateProfile({ avatar: result.avatarUrl });
        toast({ title: "Identity Re-Forged", description: "Your cosmic avatar has been manifested by AI." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Forge Failed", description: "AI signal lost." });
    } finally {
      setIsForging(false);
    }
  };

  const handleBroadcastInvite = () => {
    setIsBroadcasting(true);
    const inviteLink = `${window.location.origin}/join/${profile?.uid}`;
    setTimeout(() => {
      navigator.clipboard.writeText(inviteLink);
      toast({
        title: "Broadcast Active",
        description: "Sector-wide invitation pulse sent. Link copied to clipboard.",
      });
      setIsBroadcasting(false);
    }, 1200);
  };

  const startPrivateChat = async (friend: Friend) => {
    if (!profile) return;
    
    const roomId = [profile.uid, friend.uid].sort().join('-');
    const roomRef = doc(db, 'rooms', roomId);
    
    await setDoc(roomRef, {
      name: `${friend.name}`,
      type: 'private',
      participants: [profile.uid, friend.uid],
      createdAt: serverTimestamp()
    }, { merge: true });
    
    onRoomSelect(roomId);
    onViewChange('chat');
    toast({ title: "Signal Established", description: `Private sector opened with ${friend.name}.` });
  };

  const saveProfile = () => {
    updateProfile({ name: tempName });
    setIsEditingProfile(false);
  };

  return (
    <div className="w-80 h-full flex flex-col glass-darker border-r border-white/5">
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <h1 className="font-headline font-bold text-xl tracking-tighter text-foreground">VibeChat</h1>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="hover:bg-white/5 text-muted-foreground">
                <Plus className="w-5 h-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-darker border-white/10 text-white">
              <DialogHeader>
                <DialogTitle>Forge New Sector</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Establish a new communications hub in the cosmic network.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Input
                  placeholder="Sector Name (e.g. creative-outpost)"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="bg-white/5 border-white/10 focus:ring-primary"
                />
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)}>Abort</Button>
                <Button onClick={() => {
                   if(newRoomName.trim()){
                     addDoc(collection(db, 'rooms'), { 
                       name: newRoomName.trim(), 
                       type: 'group', 
                       createdAt: serverTimestamp(), 
                       createdBy: profile?.uid 
                     });
                     setNewRoomName(''); setIsDialogOpen(false);
                   }
                }} className="bg-primary hover:bg-primary/90">Initialize</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-3 gap-1 mb-6">
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('chat')}
            className={cn("h-10 rounded-xl flex-col p-1 h-auto", activeView === 'chat' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
          >
            <MessageSquare className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('feed')}
            className={cn("h-10 rounded-xl flex-col p-1 h-auto", activeView === 'feed' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
          >
            <LayoutGrid className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">Feed</span>
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => onViewChange('friends')}
            className={cn("h-10 rounded-xl flex-col p-1 h-auto", activeView === 'friends' ? "bg-primary text-white" : "text-muted-foreground hover:bg-white/5")}
          >
            <Users className="w-4 h-4 mb-0.5" />
            <span className="text-[10px] uppercase font-bold tracking-tighter">Social</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search network..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 focus:ring-primary/50 text-xs"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-8">
          {activeView === 'chat' && (
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-2 mb-3 block">Sector Channels</span>
              <div className="space-y-1">
                {rooms.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())).map(room => (
                  <button
                    key={room.id}
                    onClick={() => onRoomSelect(room.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group",
                      activeRoomId === room.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "text-muted-foreground hover:bg-white/5"
                    )}
                  >
                    {room.type === 'group' ? (
                      <Hash className={cn("w-4 h-4", activeRoomId === room.id ? "text-white" : "text-primary/60 group-hover:text-primary")} />
                    ) : (
                      <Radio className={cn("w-4 h-4", activeRoomId === room.id ? "text-white" : "text-accent/60 group-hover:text-accent")} />
                    )}
                    <span className="text-sm font-semibold truncate">{room.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {activeView === 'friends' && (
            <div className="space-y-6">
               <div className="flex items-center justify-between ml-2">
                 <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">Network Explorers</span>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="h-6 px-2 text-[9px] uppercase font-bold text-primary hover:bg-primary/10"
                   onClick={handleBroadcastInvite}
                   disabled={isBroadcasting}
                 >
                   {isBroadcasting ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Share2 className="w-3 h-3 mr-1" />}
                   Invite Link
                 </Button>
               </div>
               <div className="space-y-2">
                 {friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase())).map(friend => (
                   <div key={friend.uid} className="flex items-center justify-between p-2 glass-card rounded-xl border-white/5 group hover:border-primary/30 transition-all">
                     <div className="flex items-center gap-3">
                       <Avatar className="w-8 h-8">
                         <AvatarImage src={friend.avatar} />
                         <AvatarFallback>{friend.name[0]}</AvatarFallback>
                       </Avatar>
                       <div className="flex flex-col">
                         <span className="text-xs font-bold">{friend.name}</span>
                         <span className={cn(
                           "text-[9px] uppercase tracking-tighter font-bold",
                           friend.status === 'online' ? "text-green-500" : "text-muted-foreground"
                         )}>{friend.status || 'Offline'}</span>
                       </div>
                     </div>
                     <Button 
                       variant="ghost" 
                       size="icon" 
                       className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                       onClick={() => startPrivateChat(friend)}
                     >
                       <MessageSquare className="w-4 h-4" />
                     </Button>
                   </div>
                 ))}
                 
                 {friends.length === 0 && (
                   <div className="p-6 glass-card rounded-2xl border-white/5 text-center space-y-4">
                     <Loader2 className="w-8 h-8 mx-auto text-primary animate-spin opacity-40" />
                     <p className="text-[10px] text-muted-foreground">Scanning for nearby explorers...</p>
                   </div>
                 )}
               </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 mt-auto border-t border-white/5">
        <div className="flex flex-col gap-3 p-4 glass-card rounded-2xl border-white/5 shadow-2xl">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <Avatar className="w-10 h-10 border border-white/10 ring-1 ring-white/5">
                <AvatarImage src={profile?.avatar} />
                <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
              </Avatar>
              <button 
                onClick={handleForgeAvatar}
                disabled={isForging}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity border-2 border-background shadow-lg"
              >
                {isForging ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Sparkles className="w-3 h-3 text-white" />}
              </button>
            </div>
            <div className="flex-1 min-w-0">
              {isEditingProfile ? (
                <div className="flex items-center gap-1">
                  <Input 
                    value={tempName} 
                    onChange={(e) => setTempName(e.target.value)} 
                    className="h-7 text-xs bg-white/10 border-none px-2 focus:ring-0"
                    autoFocus
                  />
                  <Button size="icon" variant="ghost" className="h-6 w-6" onClick={saveProfile}>
                    <Check className="w-3 h-3 text-green-500" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col">
                  <p className="text-sm font-bold truncate flex items-center gap-2 text-foreground">
                    {profile?.name}
                    <button onClick={() => setIsEditingProfile(true)}>
                      <Settings className="w-3 h-3 text-muted-foreground hover:text-white" />
                    </button>
                  </p>
                  <p className="text-[10px] text-primary uppercase font-bold tracking-tighter">Level 1 Voyager</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
