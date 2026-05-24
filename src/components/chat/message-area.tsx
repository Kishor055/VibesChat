
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video, Loader2 } from 'lucide-react';
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
  getDoc
} from 'firebase/firestore';
import { db } from '@/firebase/config';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: any;
  roomId: string;
}

interface MessageAreaProps {
  roomId: string;
}

export function MessageArea({ roomId }: MessageAreaProps) {
  const { profile } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [roomName, setRoomName] = useState('Loading...');
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!roomId) return;

    setLoading(true);
    const fetchRoomInfo = async () => {
      if (roomId === 'general' || roomId === 'random') {
        setRoomName(roomId.charAt(0).toUpperCase() + roomId.slice(1));
      } else {
        try {
          const userDoc = await getDoc(doc(db, 'users', roomId));
          if (userDoc.exists()) {
            setRoomName(userDoc.data().name);
          } else {
            setRoomName('Cosmic Channel');
          }
        } catch (e) {
          setRoomName('Cosmic Channel');
        }
      }
    };
    fetchRoomInfo();

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', roomId),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: Message[] = [];
      snapshot.forEach((doc) => {
        msgs.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(msgs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [roomId]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || !profile) return;
    
    const messageText = text.trim();
    setInputValue('');
    
    try {
      addDoc(collection(db, 'messages'), {
        senderId: profile.uid,
        text: messageText,
        timestamp: serverTimestamp(),
        roomId
      });
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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
              <span className="block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              Active Now
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <Phone className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <Video className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <MoreVertical className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Syncing cosmic data...</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === profile?.uid;
            
            return (
              <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                {!isMe && (
                  <Avatar className="w-8 h-8 mt-auto">
                    <AvatarImage src={`https://picsum.photos/seed/${msg.senderId}/200/200`} />
                    <AvatarFallback>?</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-1">
                  <div className={cn(
                    "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all",
                    isMe 
                      ? "bg-primary text-white rounded-br-none" 
                      : "glass-card text-foreground rounded-bl-none"
                  )}>
                    {msg.text}
                  </div>
                  <span className={cn("text-[10px] text-muted-foreground mt-1", isMe ? "text-right" : "text-left")}>
                    {mounted && msg.timestamp?.toDate 
                      ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                      : '...'}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="p-6 pt-2 space-y-4">
        {lastReceivedMessage && (
          <SmartReplies 
            lastMessage={lastReceivedMessage.text} 
            onReplySelect={handleSendMessage} 
          />
        )}
        
        <div className="flex items-center gap-3 glass-card p-2 rounded-2xl border-white/10 ring-1 ring-white/5">
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputValue)}
            placeholder="Write a message..." 
            className="flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 text-sm h-10"
          />
          <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-white/5">
            <Smile className="w-5 h-5" />
          </Button>
          <Button 
            onClick={() => handleSendMessage(inputValue)}
            disabled={!inputValue.trim()}
            className="bg-primary hover:bg-primary/90 text-white rounded-xl px-4 h-10"
          >
            <Send className="w-4 h-4 mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
