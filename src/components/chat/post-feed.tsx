
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Sparkles, Loader2 } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCosmicMedia } from '@/ai/flows/generate-cosmic-media';
import { useToast } from '@/hooks/use-toast';

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
        const postsRef = collection(db, 'posts');
        addDoc(postsRef, {
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
          title: "Moment Manifested",
          description: "Your cosmic transmission has been broadcast to the network.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Transmission Interrupted",
        description: "The AI signal was too weak. Please try manifest again.",
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

  if (!mounted) return (
    <div className="flex-1 flex items-center justify-center bg-background/20">
      <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/20 scroll-smooth" suppressHydrationWarning>
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="glass-card border-primary/20 p-4 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="flex gap-4">
            <Avatar className="w-10 h-10 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="What's happening in your sector? (AI will generate an image based on this)"
                className="w-full bg-white/5 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[100px] resize-none placeholder:text-muted-foreground/50 transition-all"
              />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Powered by Gemini AI</p>
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isGenerating || !newCaption.trim()}
                  className="bg-primary hover:bg-primary/90 rounded-full px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Visualizing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Manifest Moment
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-8 pb-12">
          <AnimatePresence mode="popLayout">
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="glass-card overflow-hidden border-white/5 shadow-2xl group">
                  <CardHeader className="flex-row items-center gap-3 p-4">
                    <Avatar className="w-10 h-10 border border-white/10 ring-1 ring-white/5">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight">{post.authorName}</h4>
                      <div className="flex items-center gap-1.5">
                        <span className="block w-1 h-1 rounded-full bg-primary animate-pulse" />
                        <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">Cosmic Explorer</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-y border-white/5 bg-black/20">
                    <div className="relative aspect-[4/5] md:aspect-video overflow-hidden">
                      <img 
                        src={post.imageUrl} 
                        alt="Cosmic Moment" 
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-8">
                        <p className="text-white text-sm leading-relaxed italic drop-shadow-md">
                          "{post.caption}"
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4 p-4">
                    <div className="flex items-center gap-6 w-full">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-all hover:scale-110 active:scale-90"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-all hover:scale-110">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-bold">Transmit</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all hover:scale-110 ml-auto">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm px-1">
                      <span className="font-bold mr-2 text-primary">{post.authorName}</span>
                      <span className="text-muted-foreground leading-relaxed">{post.caption}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {posts.length === 0 && !isGenerating && (
            <div className="text-center py-20">
              <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">The cosmic feed is silent. Be the first to manifest a moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
