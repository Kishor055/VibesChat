'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { ChatSidebar } from '@/components/chat/sidebar';
import { MessageArea } from '@/components/chat/message-area';
import { PostFeed } from '@/components/chat/post-feed';
import { StoriesBar } from '@/components/social/stories-bar';
import { Loader2, Globe, MessageCircle, Info, Radio, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function VibeChatApp() {
  const { profile, loading } = useAuth();
  const [activeRoomId, setActiveRoomId] = useState('general');
  const [activeView, setActiveView] = useState<'chat' | 'feed' | 'friends'>('chat');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading || !profile) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#0D0B14]">
         <div className="w-20 h-20 rounded-3xl bg-primary flex items-center justify-center mb-6 shadow-2xl shadow-primary/40 animate-pulse ring-4 ring-white/5">
            <span className="text-white font-bold text-4xl">V</span>
         </div>
         <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Synchronizing Pulse...</p>
         </div>
      </div>
    );
  }

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0D0B14] font-body" suppressHydrationWarning>
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      <div className="relative flex w-full h-full glass-darker overflow-hidden z-10">
        <ChatSidebar 
          activeView={activeView}
          onViewChange={setActiveView}
          activeRoomId={activeRoomId} 
          onRoomSelect={(id) => {
            setActiveRoomId(id);
            setActiveView('chat');
          }} 
        />
        
        <div className="flex-1 relative flex flex-col overflow-hidden bg-background/30">
          {activeView === 'feed' && <StoriesBar />}
          
          <div className="flex-1 relative flex overflow-hidden">
            {activeView === 'chat' ? (
              <MessageArea roomId={activeRoomId} />
            ) : activeView === 'feed' ? (
              <PostFeed />
            ) : (
              <div className="flex-1 flex items-center justify-center">
                 <div className="text-center space-y-4 max-w-sm">
                    <Zap className="w-12 h-12 text-primary mx-auto opacity-50" />
                    <h2 className="text-xl font-bold">Social Network Engine</h2>
                    <p className="text-sm text-muted-foreground">The social graph is being mapped. Friendships and invitations are managed here.</p>
                 </div>
              </div>
            )}
            
            {/* Context Sidebar */}
            <div className="hidden 2xl:flex w-80 h-full flex-col glass border-l border-white/5 p-8 overflow-y-auto bg-black/40">
               <div className="text-center mb-10">
                 <div className="w-28 h-28 mx-auto rounded-[2.5rem] overflow-hidden glass border-4 border-white/10 p-1 mb-6 shadow-2xl relative group">
                   <img 
                     src={`https://picsum.photos/seed/${activeView === 'chat' ? activeRoomId : 'global-pulse'}/400/400`} 
                     alt="Context Avatar"
                     className="w-full h-full object-cover rounded-[2rem] transition-transform group-hover:scale-110"
                     data-ai-hint="context avatar"
                   />
                   <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Radio className="w-8 h-8 text-white animate-pulse" />
                   </div>
                 </div>
                 <h3 className="font-bold text-xl tracking-tight">{activeView === 'chat' ? 'Sector Terminal' : 'Global Pulse'}</h3>
                 <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-1">Live Feed Active</p>
               </div>

               <div className="space-y-10">
                  <div className="p-5 rounded-[2rem] glass-card border-primary/20 bg-primary/5">
                    <div className="flex items-center gap-3 mb-4 text-primary">
                      <Zap className="w-4 h-4 fill-primary" />
                      <h4 className="text-[10px] font-bold uppercase tracking-widest">Sector Intel</h4>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {activeView === 'chat' 
                        ? "Transmissions in this sector are encrypted via cosmic-layer protocols. Data persists across decentralized nodes."
                        : "The Global Pulse aggregates visual transmissions from every sector. Reactions boost visibility across the network."
                      }
                    </p>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-6 px-1">Network Vitals</h4>
                    <div className="space-y-4 bg-white/5 rounded-2xl p-4">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground/60">Signal Integrity</span>
                        <span className="text-primary font-mono font-bold tracking-tighter">99.9%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground/60">Protocol</span>
                        <span className="text-accent font-mono font-bold tracking-tighter">VIBE-v5.0</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-muted-foreground/60">Node Loc</span>
                        <span className="text-foreground font-mono font-bold tracking-tighter">ORION-HUB</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-6 px-1">Visual Archive</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {[5, 12, 18, 24, 31, 38].map(i => (
                        <div key={i} className="aspect-square rounded-2xl glass border-white/5 overflow-hidden hover:scale-110 transition-all cursor-pointer group shadow-lg">
                          <img src={`https://picsum.photos/seed/archive${i}/300/300`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" alt="archive" data-ai-hint="visual media" />
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
