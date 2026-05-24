
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ChatSidebar } from '@/components/chat/sidebar';
import { MessageArea } from '@/components/chat/message-area';
import { Loader2 } from 'lucide-react';

export default function PulseTalkApp() {
  const { profile, loading } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0D0B14]">
         <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40 animate-pulse">
            <span className="text-white font-bold text-3xl">P</span>
         </div>
         <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0D0B14]" suppressHydrationWarning>
      {/* Dynamic Cosmic Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative flex w-full h-full glass-darker overflow-hidden">
        <ChatSidebar 
          activeRoomId={activeRoomId} 
          onRoomSelect={setActiveRoomId} 
        />
        
        <div className="flex-1 relative flex">
          <MessageArea 
            roomId={activeRoomId} 
          />
          
          {/* Presence / Room Info Right Sidebar (Hidden on mobile) */}
          <div className="hidden xl:flex w-72 h-full flex-col glass-darker border-l border-white/5 p-6">
             <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden glass border-2 border-white/10 p-1 mb-4">
                 <img 
                   src={`https://picsum.photos/seed/${activeRoomId}/400/400`} 
                   alt="Room"
                   className="w-full h-full object-cover rounded-[1.25rem]"
                   data-ai-hint="room avatar"
                 />
               </div>
               <h3 className="font-bold text-lg">Room Details</h3>
               <p className="text-xs text-muted-foreground">PulseTalk Cosmic Network</p>
             </div>

             <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">Workspace Information</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    You are connected to the encrypted cosmic channel. All communications are secured with end-to-end Firebase security rules.
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">Network Status</h4>
                  <div className="flex items-center gap-2 text-xs text-green-500 font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                    Secure Real-time Link Active
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">Recent Media</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square rounded-lg glass border-white/5 overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                        <img src={`https://picsum.photos/seed/media${i}/200/200`} className="w-full h-full object-cover opacity-60 hover:opacity-100" alt="media" data-ai-hint="chat media" />
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
