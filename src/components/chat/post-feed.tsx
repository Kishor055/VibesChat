'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Sparkles, Loader2, Send, Image as ImageIcon, Film, X } from 'lucide-react';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, increment, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { motion, AnimatePresence } from 'framer-motion';
import { generateCosmicMedia } from '@/ai/flows/generate-cosmic-media';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';

interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: any;
}

interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  imageUrl: string;
  caption: string;
  likes: number;
  likedBy: string[];
  createdAt: any;
  type: 'image' | 'video';
}

export function PostFeed() {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newCaption, setNewCaption] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mounted, setMounted] = useState(false);
  const [activeComments, setActiveComments] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');
  const [postComments, setPostComments] = useState<{ [postId: string]: Comment[] }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setUploadedMedia(event.target?.result as string);
      setMediaType(file.type.startsWith('video') ? 'video' : 'image');
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = async () => {
    if (!profile || (!newCaption.trim() && !uploadedMedia)) return;
    
    setIsProcessing(true);
    try {
      let finalUrl = uploadedMedia;

      // If no upload, generate AI art if caption exists
      if (!finalUrl && newCaption.trim()) {
        const result = await generateCosmicMedia({ prompt: newCaption.trim() });
        finalUrl = result.mediaUrl;
        setMediaType('image');
      }

      if (finalUrl) {
        await addDoc(collection(db, 'posts'), {
          authorId: profile.uid,
          authorName: profile.name,
          authorAvatar: profile.avatar,
          imageUrl: finalUrl,
          caption: newCaption.trim(),
          likes: 0,
          likedBy: [],
          type: mediaType,
          createdAt: serverTimestamp(),
        });
        
        setNewCaption('');
        setUploadedMedia(null);
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
      setIsProcessing(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!profile) return;
    const postRef = doc(db, 'posts', post.id);
    const isLiked = post.likedBy?.includes(profile.uid);

    await updateDoc(postRef, {
      likes: increment(isLiked ? -1 : 1),
      likedBy: isLiked ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
    });
  };

  const handleAddComment = async (postId: string) => {
    if (!commentText.trim() || !profile) return;

    await addDoc(collection(db, 'posts', postId, 'comments'), {
      authorId: profile.uid,
      authorName: profile.name,
      text: commentText.trim(),
      createdAt: serverTimestamp(),
    });

    setCommentText('');
    toast({ title: "Comment Sent", description: "Your transmission reached the sector." });
  };

  const toggleComments = (postId: string) => {
    if (activeComments === postId) {
      setActiveComments(null);
      return;
    }

    setActiveComments(postId);
    const q = query(collection(db, 'posts', postId, 'comments'), orderBy('createdAt', 'asc'));
    onSnapshot(q, (snapshot) => {
      const comments: Comment[] = [];
      snapshot.forEach(doc => comments.push({ id: doc.id, ...doc.data() } as Comment));
      setPostComments(prev => ({ ...prev, [postId]: comments }));
    });
  };

  const handleShare = (post: Post) => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: "Signal Shared", description: "Link copied to communication terminal." });
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
                className="w-full bg-white/5 border-none rounded-2xl p-4 text-sm focus:ring-2 focus:ring-primary outline-none min-h-[100px] resize-none placeholder:text-muted-foreground/30 transition-all font-medium"
              />
              
              {uploadedMedia && (
                <div className="relative rounded-2xl overflow-hidden border border-white/10 group">
                  {mediaType === 'image' ? (
                    <img src={uploadedMedia} alt="Preview" className="w-full aspect-video object-cover" />
                  ) : (
                    <video src={uploadedMedia} className="w-full aspect-video object-cover" controls />
                  )}
                  <button 
                    onClick={() => setUploadedMedia(null)}
                    className="absolute top-2 right-2 p-1 bg-black/60 rounded-full hover:bg-black/90 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <input 
                    type="file" 
                    className="hidden" 
                    ref={fileInputRef} 
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                  />
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-primary rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-5 h-5" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-muted-foreground hover:text-primary rounded-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Film className="w-5 h-5" />
                  </Button>
                  <div className="hidden sm:flex items-center gap-2 ml-2">
                    <Sparkles className="w-3 h-3 text-primary animate-pulse" />
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Forge with AI if no upload</p>
                  </div>
                </div>
                <Button 
                  onClick={handleCreatePost} 
                  disabled={isProcessing || (!newCaption.trim() && !uploadedMedia)}
                  className="bg-primary hover:bg-primary/90 rounded-full px-8 shadow-xl shadow-primary/20 h-10 transition-all active:scale-95 text-[11px] uppercase font-bold tracking-widest"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Manifesting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Broadcast
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
                      <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Sector Explorer</p>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0 border-y border-white/5 bg-black/40 relative">
                    <div className="aspect-[4/5] overflow-hidden">
                      {post.type === 'video' ? (
                        <video 
                          src={post.imageUrl} 
                          className="w-full h-full object-cover" 
                          controls
                          muted
                          loop
                        />
                      ) : (
                        <img 
                          src={post.imageUrl} 
                          alt="Moment" 
                          className="w-full h-full object-cover transition-transform duration-[3s] group-hover:scale-105"
                        />
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col items-start gap-4 p-6">
                    <div className="flex items-center gap-6 w-full mb-2">
                      <button 
                        onClick={() => handleLike(post)}
                        className={cn(
                          "flex items-center gap-2 transition-all hover:scale-110 active:scale-90",
                          post.likedBy?.includes(profile?.uid || '') ? "text-red-500" : "text-muted-foreground hover:text-red-500"
                        )}
                      >
                        <Heart className={cn("w-6 h-6", post.likedBy?.includes(profile?.uid || '') && "fill-current")} />
                        <span className="text-xs font-bold font-mono">{post.likes}</span>
                      </button>
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className={cn(
                          "flex items-center gap-2 transition-all hover:scale-110",
                          activeComments === post.id ? "text-primary" : "text-muted-foreground hover:text-primary"
                        )}
                      >
                        <MessageCircle className="w-6 h-6" />
                        <span className="text-xs font-bold font-mono">{postComments[post.id]?.length || 0}</span>
                      </button>
                      <button 
                        onClick={() => handleShare(post)}
                        className="flex items-center gap-2 text-muted-foreground hover:text-accent transition-all hover:scale-110 ml-auto"
                      >
                        <Share2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="text-sm px-1 leading-relaxed">
                      <span className="font-bold mr-2 text-primary">{post.authorName}</span>
                      <span className="text-muted-foreground/80">{post.caption}</span>
                    </div>

                    {/* Comments Section */}
                    {activeComments === post.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="w-full mt-4 space-y-4 pt-4 border-t border-white/5"
                      >
                        <div className="max-h-48 overflow-y-auto space-y-3 no-scrollbar">
                          {postComments[post.id]?.map(comment => (
                            <div key={comment.id} className="flex gap-2 text-xs">
                              <span className="font-bold text-primary">{comment.authorName}</span>
                              <span className="text-muted-foreground">{comment.text}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <Input 
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Add a comment..."
                            className="text-xs bg-white/5 border-white/10 h-8 focus:ring-primary"
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)}
                          />
                          <Button size="sm" onClick={() => handleAddComment(post.id)} className="h-8 bg-primary/20 text-primary hover:bg-primary/40">
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {posts.length === 0 && !isProcessing && (
            <div className="text-center py-32 space-y-6">
              <Sparkles className="w-16 h-16 text-primary/10 mx-auto animate-pulse" />
              <p className="text-muted-foreground text-sm font-medium tracking-widest uppercase">The cosmic network is silent. Be the first to broadcast.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
