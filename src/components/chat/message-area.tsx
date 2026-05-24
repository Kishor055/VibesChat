
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Message, User, CURRENT_USER, MOCK_USERS } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Send, Smile, Paperclip, MoreVertical, Phone, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SmartReplies } from './smart-replies';

interface MessageAreaProps {
  roomId: string;
  roomName: string;
  initialMessages: Message[];
}

export function MessageArea({ roomId, roomName, initialMessages }: MessageAreaProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = (text: string) => {
    if (!text.trim()) return;
    
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: CURRENT_USER.id,
      text,
      timestamp: new Date().toISOString(),
      roomId
    };
    
    setMessages([...messages, newMessage]);
    setInputValue('');
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const lastReceivedMessage = [...messages].reverse().find(m => m.senderId !== CURRENT_USER.id);

  return (
    <div className="flex-1 flex flex-col h-full bg-background/40">
      {/* Chat Header */}
      <div className="h-16 flex items-center justify-between px-6 glass border-b border-white/5 z-10">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 ring-2 ring-primary/20">
            <AvatarImage src={`https://picsum.photos/seed/${roomName}/200/200`} />
            <AvatarFallback>{roomName[0]}</AvatarFallback>
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

      {/* Messages Scroll Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === CURRENT_USER.id;
          const sender = MOCK_USERS.find(u => u.id === msg.senderId) || CURRENT_USER;
          
          return (
            <div key={msg.id} className={cn("flex gap-3 max-w-[80%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
              {!isMe && (
                <Avatar className="w-8 h-8 mt-auto">
                  <AvatarImage src={sender.avatar} />
                  <AvatarFallback>{sender.name[0]}</AvatarFallback>
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
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Area */}
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
