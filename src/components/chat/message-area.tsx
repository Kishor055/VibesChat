'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Send, 
  Smile, 
  Paperclip, 
  MoreVertical, 
  Search, 
  Loader2, 
  X, 
  MessageSquare, 
  FileText, 
  Download,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartReplies } from './smart-replies';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';

interface Attachment {
  url: string;
  type: 'image' | 'video' | 'document';
  name: string;
}

interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  text: string;
  timestamp: any;
  roomId: string;
  reactions?: { [emoji: string]: string[] };
  attachment?: Attachment;
}

interface MessageAreaProps {
  roomId: string;
}

const EMOJI_OPTIONS = ['🔥', '✨', '🛸', '🛰️', '💙'];

export function MessageArea({ roomId }: MessageAreaProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [roomName, setRoomName] = useState('Cosmic Channel');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<Attachment | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);

    const roomRef = doc(db, 'rooms', roomId);
    const unsubscribeRoom = onSnapshot(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        setRoomName(snapshot.data().name);
      } else if (roomId === 'general' || roomId === 'dev-sector') {
        setRoomName(roomId.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '));
      } else if (roomId.includes('-')) {
        setRoomName('Direct Transmission');
      }
    });

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    }, () => {
      setLoading(false);
    });

    return () => {
      unsubscribeRoom();
      unsubscribeMessages();
    };
  }, [roomId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const url = event.target?.result as string;
      let type: 'image' | 'video' | 'document' = 'document';
      
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';

      setPendingAttachment({
        url,
        type,
        name: file.name
      });
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (text: string) => {
    if ((!text.trim() && !pendingAttachment) || !profile) return;
    
    const messageText = text.trim();
    const attachment = pendingAttachment;
    
    setInputValue('');
    setPendingAttachment(null);
    
    addDoc(collection(db, 'messages'), {
      senderId: profile.uid,
      senderName: profile.name,
      text: messageText,
      timestamp: serverTimestamp(),
      roomId,
      reactions: {},
      ...(attachment && { attachment })
    });
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    if (!profile) return;
    const msgRef = doc(db, 'messages', messageId);
    updateDoc(msgRef, {
      [`reactions.${emoji}`]: arrayUnion(profile.uid)
    });
  };

  useEffect(() => {
    if (scrollRef.current && !isSearching) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isSearching, pendingAttachment]);

  if (!mounted) return null;

  const filteredMessages = messages.filter(m => 
    m.text.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lastReceivedMessage = [...messages].reverse().find(m => m.senderId !== profile?.uid);

  return (
    <div className="flex-1 flex flex-col h-full bg-background/40">
      <div className="h-16 flex items-center justify-between px-6 glass border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${roomId}/200/200`} />
            <AvatarFallback>{roomName[0] || '?'}</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">{roomName}</h2>
            <p className="text-xs text-green-500 font-medium flex items-center gap-1.5">
              <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live Pulse
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isSearching ? (
            <div className="flex items-center gap-2 bg-white/5 rounded-full px-3 py-1 animate-in slide-in-from-right-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                autoFocus
                className="bg-transparent border-none outline-none text-xs text-white w-32"
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button onClick={() => { setIsSearching(false); setSearchTerm(''); }}>
                <X className="w-4 h-4 text-muted-foreground hover:text-white" />
              </button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5" onClick={() => setIsSearching(true)}>
              <Search className="w-5 h-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth custom-scrollbar">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary opacity-50" />
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Synchronizing Sector...</p>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
            <MessageSquare className="w-12 h-12 mb-4" />
            <p className="text-sm">Sector silence. Initialize transmission.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isMe = msg.senderId === profile?.uid;
            
            return (
              <div key={msg.id} className={cn("group flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                {!isMe && (
                  <Avatar className="w-8 h-8 mt-auto ring-1 ring-white/10">
                    <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/200/200`} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-1">
                  {!isMe && <span className="text-[10px] text-muted-foreground ml-1 font-bold">{msg.senderName || 'Anonymous'}</span>}
                  
                  <div className="relative group/bubble">
                    <div className={cn(
                      "flex flex-col gap-2 p-1 transition-all",
                      isMe ? "items-end" : "items-start"
                    )}>
                      {msg.attachment && (
                        <div className={cn(
                          "overflow-hidden rounded-2xl shadow-xl max-w-sm border border-white/10",
                          isMe ? "bg-primary/20" : "glass-card"
                        )}>
                          {msg.attachment.type === 'image' && (
                            <img src={msg.attachment.url} alt="Attachment" className="w-full h-auto object-contain max-h-[300px]" />
                          )}
                          {msg.attachment.type === 'video' && (
                            <video src={msg.attachment.url} controls className="w-full max-h-[300px]" />
                          )}
                          {msg.attachment.type === 'document' && (
                            <div className="flex items-center gap-3 p-4">
                              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold truncate">{msg.attachment.name}</p>
                                <p className="text-[10px] text-muted-foreground">Document</p>
                              </div>
                              <a 
                                href={msg.attachment.url} 
                                download={msg.attachment.name}
                                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
                              >
                                <Download className="w-4 h-4 text-primary" />
                              </a>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {msg.text && (
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm shadow-sm",
                          isMe 
                            ? "bg-primary text-white rounded-br-none" 
                            : "glass-card text-foreground rounded-bl-none"
                        )}>
                          {msg.text}
                        </div>
                      )}
                    </div>

                    <div className={cn(
                      "absolute -bottom-2 flex items-center gap-1 transition-opacity",
                      isMe ? "left-0" : "right-0"
                    )}>
                      {msg.reactions && Object.entries(msg.reactions).map(([emoji, users]) => (
                        users.length > 0 && (
                          <div key={emoji} className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-full px-1.5 py-0.5 text-[10px] flex items-center gap-1">
                            <span>{emoji}</span>
                            <span className="font-bold opacity-70">{users.length}</span>
                          </div>
                        )
                      ))}
                    </div>

                    <div className={cn(
                      "absolute top-0 opacity-0 group-hover/bubble:opacity-100 transition-opacity z-20",
                      isMe ? "-left-12" : "-right-12"
                    )}>
                      <div className="glass-darker border-white/10 p-1 rounded-full flex gap-1 shadow-2xl">
                        {EMOJI_OPTIONS.map(emoji => (
                          <button 
                            key={emoji} 
                            onClick={() => handleAddReaction(msg.id, emoji)}
                            className="hover:scale-150 transition-transform p-0.5"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <span className={cn("text-[10px] text-muted-foreground mt-1 opacity-60", isMe ? "text-right" : "text-left")}>
                    {msg.timestamp?.toDate 
                      ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : 'Syncing...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 pt-2 space-y-4">
        {lastReceivedMessage && !isSearching && !pendingAttachment && (
          <SmartReplies 
            lastMessage={lastReceivedMessage.text} 
            onReplySelect={handleSendMessage} 
          />
        )}
        
        {pendingAttachment && (
          <div className="px-4 py-3 glass-card rounded-2xl border-primary/30 flex items-center justify-between animate-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/5 flex items-center justify-center border border-white/10">
                {pendingAttachment.type === 'image' ? (
                  <img src={pendingAttachment.url} className="w-full h-full object-cover" alt="preview" />
                ) : pendingAttachment.type === 'video' ? (
                  <Film className="w-5 h-5 text-primary" />
                ) : (
                  <FileText className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold truncate">{pendingAttachment.name}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Ready to transmit</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setPendingAttachment(null)} className="rounded-full hover:bg-red-500/20 text-red-500">
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 glass-card p-2 rounded-2xl border-white/10 ring-1 ring-white/5">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:bg-white/5 rounded-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Paperclip className="w-5 h-5" />}
          </Button>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder={`Signal #${roomName.toLowerCase().replace(/\s/g, '-')}`} 
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-10"
          />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5 rounded-full">
            <Smile className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={(!inputValue.trim() && !pendingAttachment) || isUploading}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 h-10 shadow-lg shadow-primary/20"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
