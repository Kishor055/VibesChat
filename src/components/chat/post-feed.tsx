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
      const { mediaUrl } = await generateCosmicMedia({ prompt: newCaption });
      
      await addDoc(collection(db, 'posts'), {
        authorId: profile.uid,
        authorName: profile.name,
        authorAvatar: profile.avatar,
        imageUrl: mediaUrl,
        caption: newCaption,
        likes: 0,
        createdAt: serverTimestamp(),
      });
      
      setNewCaption('');
    } catch (error) {
      console.error("Post creation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLike = async (postId: string) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
  };

  if (!mounted) return null;

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-background/20">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Create Post Section */}
        <Card className="glass-card border-primary/20 p-4">
          <div className="flex gap-4">
            <Avatar>
              <AvatarImage src={profile?.avatar} />
              <AvatarFallback>{profile?.name?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="What's happening in your sector? (AI will generate an image based on this)"
                className="w-full bg-white/5 border-none rounded-xl p-3 text-sm focus:ring-1 focus:ring-primary outline-none min-h-[80px] resize-none"
              />
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Powered by Gemini AI</p>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isGenerating || !newCaption.trim()}
                  className="bg-primary hover:bg-primary/90 rounded-full px-6"
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

        {/* Feed Posts */}
        <div className="space-y-6">
          <AnimatePresence>
            {posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="glass-card overflow-hidden border-white/5 shadow-2xl">
                  <CardHeader className="flex-row items-center gap-3 p-4">
                    <Avatar className="w-10 h-10 border border-white/10">
                      <AvatarImage src={post.authorAvatar} />
                      <AvatarFallback>{post.authorName?.[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold text-sm">{post.authorName}</h4>
                      <p className="text-[10px] text-muted-foreground uppercase">Cosmic Explorer</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-y border-white/5">
                    <div className="relative aspect-square md:aspect-video overflow-hidden group">
                      <img 
                        src={post.imageUrl} 
                        alt="Cosmic Moment" 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                        <p className="text-white text-sm line-clamp-2 italic">"{post.caption}"</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4 p-4">
                    <div className="flex items-center gap-6 w-full">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Heart className="w-5 h-5" />
                        <span className="text-xs font-bold">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-bold">Transmit</span>
                      </button>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-colors ml-auto">
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm">
                      <span className="font-bold mr-2">{post.authorName}</span>
                      <span className="text-muted-foreground">{post.caption}</span>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
