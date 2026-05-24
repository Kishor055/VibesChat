'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Sparkles, Loader2, Send } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCosmicMedia } from '@/ai/flows/generate-cosmic-media';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  createdAt: any;
}

export function PostFeed() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData: Post[] = [];
      snapshot.forEach((doc) => {
        postsData.push({ id: doc.id, ...doc.data() } as Post);
      });
      setPosts(postsData);
    });
    return () => unsubscribe();
  }, []);

  const handleCreatePost = async () => {
    if (!newCaption.trim() || !profile) return;
    
    setIsGenerating(true);
    try {
      const result = await generateCosmicMedia({ prompt: newCaption.trim() });
      
      if (result && result.mediaUrl) {
        addDoc(collection(db, 'posts'), {
          authorId: profile.uid,
          authorName: profile.name,
          authorAvatar: profile.avatar,
          imageUrl: result.mediaUrl,
          caption: newCaption.trim(),
          likes: 0,
          createdAt: serverTimestamp(),
        });
        
        setNewCaption('');
        toast({
          title: "Pulse Manifested",
          description: "Your cosmic transmission is echoing across the network.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transmission Error",
        description: "AI signal corrupted. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    updateDoc(postRef, {
      likes: increment(1)
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-10 space-y-12 bg-transparent scroll-smooth no-scrollbar" suppressHydrationWarning>
      <div className="max-w-xl mx-auto space-y-12">
        <Card className="glass-card border-primary/20 p-6 rounded-[2rem] shadow-2xl">
          <div className="flex gap-4">
            <Avatar className="w-12 h-12 ring-2 ring-primary/20 ring-offset-2 ring-offset-background">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-4">
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="What's happening in your sector? Forge a cosmic moment..."
                className="w-full bg-white/5 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[120px] resize-none placeholder:text-muted-foreground/30 transition-all font-medium"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Imagen v3.0 Powered</p>
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isGenerating || !newCaption.trim()}
                  className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-xl shadow-primary/20 h-10 transition-all active:scale-95 text-[11px] uppercase font-bold tracking-widest"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Forge Moment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-16 pb-20">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                layout
              >
                <Card className="glass-card overflow-hidden border-white/5 shadow-2xl group rounded-[2.5rem] bg-black/40">
                  <CardHeader className="flex-row items-center gap-4 p-6">
                    <Avatar className="w-10 h-10 border-2 border-primary/20 p-0.5">
                      <AvatarImage src={post.authorAvatar} className="rounded-full" />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm tracking-tight text-foreground">{post.authorName}</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Orion Sector Explorer</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-y border-white/5 bg-black/40 relative">
                    <div className="aspect-[4/5] overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt="Moment" 
                        className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-110"
                      />
                    </div>
                    <div className="absolute top-4 right-4 glass p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                       <Sparkles className="w-4 h-4 text-primary" />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4 p-6">
                    <div className="flex items-center gap-6 w-full mb-2">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-all hover:scale-110 active:scale-90"
                      >
                        <Heart className="w-6 h-6" />
                        <span className="text-xs font-bold font-mono">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all hover:scale-110">
                        <MessageCircle className="w-6 h-6" />
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all hover:scale-110 ml-auto">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm px-1 leading-relaxed">
                      <span className="font-bold mr-2 text-primary">{post.authorName}</span>
                      <span className="text-muted-foreground/80">{post.caption}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {posts.length === 0 && !isGenerating && (
            <div className="text-center py-32 space-y-6">
              <Sparkles className="w-16 h-16 text-primary/10 mx-auto animate-pulse" />
              <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">The cosmic network is silent. Be the first to forge a moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
