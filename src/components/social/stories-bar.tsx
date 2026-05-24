'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { generateCosmicMedia } from '@/ai/flows/generate-cosmic-media';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface Story {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  createdAt: any;
}

export function StoriesBar() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [stories, setStories] = useState<Story[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only show stories from the last 24 hours
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);
    
    const q = query(
      collection(db, 'stories'), 
      where('createdAt', '>', Timestamp.fromDate(yesterday)),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Story[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Story);
      });
      setStories(data);
    });
    return () => unsubscribe();
  }, []);

  const handleAddStory = async () => {
    if (!profile) return;
    setIsUploading(true);
    try {
      const result = await generateCosmicMedia({ prompt: "A quick cosmic snapshot for a story" });
      if (result?.mediaUrl) {
        addDoc(collection(db, 'stories'), {
          authorId: profile.uid,
          authorName: profile.name,
          authorAvatar: profile.avatar,
          imageUrl: result.mediaUrl,
          createdAt: serverTimestamp(),
        });
        toast({ title: "Story Published", description: "Your cosmic fragment is now live for 24 hours." });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "Story Failure", description: "Signal lost during transmission." });
    } finally {
      setIsUploading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="flex gap-4 p-4 overflow-x-auto no-scrollbar glass-darker border-b border-white/5 bg-black/20">
      <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group" onClick={handleAddStory}>
        <div className="relative">
          <Avatar className="w-16 h-16 ring-2 ring-primary ring-offset-2 ring-offset-background group-hover:scale-105 transition-transform">
            <AvatarImage src={profile?.avatar} />
            <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-5 h-5 bg-primary rounded-full border-2 border-background flex items-center justify-center">
            {isUploading ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Plus className="w-3 h-3 text-white" />}
          </div>
        </div>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">Your Story</span>
      </div>

      {stories.map((story) => (
        <motion.div 
          key={story.id} 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer"
        >
          <div className="p-[2px] rounded-full bg-gradient-to-tr from-primary to-accent">
            <Avatar className="w-16 h-16 border-2 border-background">
              <AvatarImage src={story.authorAvatar} />
              <AvatarFallback>{story.authorName?.[0]}</AvatarFallback>
            </Avatar>
          </div>
          <span className="text-[10px] text-foreground font-medium truncate w-16 text-center">{story.authorName}</span>
        </motion.div>
      ))}
    </div>
  );
}
