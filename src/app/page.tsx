
"use client";

import React, { useState } from 'react';
import { ChatSidebar } from '@/components/chat/sidebar';
import { MessageArea } from '@/components/chat/message-area';
import { INITIAL_MESSAGES, MOCK_ROOMS } from '@/lib/mock-data';

export default function PulseTalkApp() {
  const [activeRoomId, setActiveRoomId] = useState(MOCK_ROOMS[1].id); // Default to first DM

  const activeRoom = MOCK_ROOMS.find(r => r.id === activeRoomId) || { name: 'New Message', id: activeRoomId };

  return (
    <main className="flex h-screen w-full overflow-hidden bg-[#0D0B14]">
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
        
        <div className="flex-1 relative">
          <MessageArea 
            roomId={activeRoomId} 
            roomName={activeRoom.name}
            initialMessages={INITIAL_MESSAGES.filter(m => m.roomId === activeRoomId)}
          />
          
          {/* Presence / Room Info Right Sidebar (Hidden on mobile) */}
          <div className="hidden xl:flex w-72 h-full flex-col glass-darker border-l border-white/5 p-6">
             <div className="text-center mb-8">
               <div className="w-24 h-24 mx-auto rounded-3xl overflow-hidden glass border-2 border-white/10 p-1 mb-4">
                 <img 
                   src={`https://picsum.photos/seed/${activeRoom.name}/400/400`} 
                   alt={activeRoom.name}
                   className="w-full h-full object-cover rounded-[1.25rem]"
                 />
               </div>
               <h3 className="font-bold text-lg">{activeRoom.name}</h3>
               <p className="text-xs text-muted-foreground">Created Aug 2023</p>
             </div>

             <div className="space-y-6">
                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">Room Information</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Welcome to the {activeRoom.name} workspace. This channel is for synchronizing real-time communications and sharing updates.
                  </p>
                </div>

                <div>
                  <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mb-3">Files & Media</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="aspect-square rounded-lg glass border-white/5 overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                        <img src={`https://picsum.photos/seed/media${i}/200/200`} className="w-full h-full object-cover opacity-60 hover:opacity-100" alt="media" />
                      </div>
                    ))}
                  </div>
                  <button className="w-full mt-3 text-xs text-primary font-medium hover:underline text-left">View all files</button>
                </div>
             </div>
          </div>
        </div>
      </div>
    </main>
  );
}
