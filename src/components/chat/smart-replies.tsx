
"use client";

import React, { useState, useEffect } from 'react';
import { suggestSmartReplies } from '@/ai/flows/smart-reply-suggestion';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmartRepliesProps {
  lastMessage: string;
  onReplySelect: (reply: string) => void;
}

export function SmartReplies({ lastMessage, onReplySelect }: SmartRepliesProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function getSuggestions() {
      if (!lastMessage) return;
      setLoading(true);
      try {
        const result = await suggestSmartReplies({
          conversationHistory: [],
          currentMessage: lastMessage
        });
        setSuggestions(result.suggestions);
      } catch (error) {
        console.error('Failed to get suggestions', error);
      } finally {
        setLoading(false);
      }
    }

    getSuggestions();
  }, [lastMessage]);

  if (!loading && suggestions.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-2">
      <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-wider">
        <Sparkles className="w-3 h-3" />
        AI Pulse
      </div>
      <div className="flex flex-wrap gap-2">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass border-primary/20 text-[11px] text-primary/70"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              Analyzing context...
            </motion.div>
          ) : (
            suggestions.map((reply, i) => (
              <motion.button
                key={reply}
                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => onReplySelect(reply)}
                className="px-3 py-1.5 rounded-full glass border-white/10 hover:border-primary/50 hover:bg-primary/10 transition-all text-xs text-muted-foreground hover:text-primary whitespace-nowrap"
              >
                {reply}
              </motion.button>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
