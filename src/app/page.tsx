'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ChatSidebar } from '@/components/chat/sidebar';
import { MessageArea } from '@/components/chat/message-area';
import { PostFeed } from '@/components/chat/post-feed';
import { Loader2, Globe, MessageCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function NovaPulseApp() {
  const { profile, loading } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [activeView, setActiveView] = useState<'chat' | 'feed'>('chat');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || !profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0D0B14]">
         <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40 animate-pulse">
            <span className="text-white font-bold text-3xl">N</span>
         </div>
         <Loader2 className="w-6 h-6 animate-spin text-primary/60" />
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0D0B14]" suppressHydrationWarning>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="relative flex w-full h-full glass-darker overflow-hidden">
        <ChatSidebar 
          activeView={activeView}
          onViewChange={setActiveView}
          activeRoomId={activeRoomId} 
          onRoomSelect={(id) => {
            setActiveRoomId(id);
            setActiveView('chat');
          }} 
        />
        
        <div className="flex-1 relative flex overflow-hidden">
          {activeView === 'chat' ? (
            <MessageArea roomId={activeRoomId} />
          ) : (
            <PostFeed />
          )}
          
          {/* Right Sidebar - Dynamic Context */}
          <div className="hidden xl:flex w-80 h-full flex-col glass-darker border-l border-white/5 p-6 overflow-y-auto">
             <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden glass border-2 border-white/10 p-1 mb-4 shadow-xl">
                 <img 
                   src={`https://picsum.photos/seed/${activeView === 'chat' ? activeRoomId : 'global-feed'}/400/400`} 
                   alt="Avatar"
                   className="w-full h-full object-cover rounded-[1.25rem]"
                   data-ai-hint="context avatar"
                 />
               </div>
               <h3 className="font-bold text-lg">{activeView === 'chat' ? 'Channel Hub' : 'Cosmic Feed'}</h3>
               <p className="text-xs text-muted-foreground uppercase tracking-widest">Global Status: Active</p>
             </div>

             <div className="space-y-8">
                <div className="p-4 rounded-2xl glass-card border-white/5">
                  <div className="flex items-center gap-2 mb-3 text-primary">
                    <Info className="w-4 h-4" />
                    <h4 className="text-[10px] font-bold uppercase tracking-widest">Network Intel</h4>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeView === 'chat' 
                      ? "You are connected to a high-latency encrypted cosmic channel. Messages are stored across decentralized nodes."
                      : "The global feed aggregates visual moments from all sectors. Interact to boost visibility."
                    }
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-4">Transmission Stats</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="text-green-500 font-mono">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Signal</span>
                      <span className="text-primary font-mono">Strong</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Protocol</span>
                      <span className="text-accent font-mono">v5.0-Nova</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-4">Sector Artifacts</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[11, 22, 33, 44, 55, 66].map(i => (
                      <div key={i} className="aspect-square rounded-lg glass border-white/5 overflow-hidden hover:scale-105 transition-all cursor-pointer group">
                        <img src={`https://picsum.photos/seed/art${i}/200/200`} className="w-full h-full object-cover opacity-40 group-hover:opacity-100" alt="artifact" data-ai-hint="visual media" />
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
