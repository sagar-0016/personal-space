
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichEditor } from './RichEditor';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; isPinned: boolean; isArchived?: boolean }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (title.trim() || content.trim()) {
          handleSave();
        }
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content, isPinned]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave({ title, content, isPinned });
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsExpanded(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "p-0" : "p-1"
      )}>
        {!isExpanded ? (
          <div className="flex items-center px-6 py-4 cursor-text" onClick={() => setIsExpanded(true)}>
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a visual note...</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:bg-primary/10 hover:text-primary transition-all rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xl sm:text-2xl font-bold px-0 bg-transparent placeholder:text-muted-foreground/30 transition-all"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPinned(!isPinned)}
                className={cn("h-10 w-10 rounded-full transition-all", isPinned ? "text-primary bg-primary/5" : "text-muted-foreground/40")}
              >
                <Pin className={cn("h-5 w-5", isPinned && "fill-current")} />
              </Button>
            </div>

            <div className="px-6 py-2">
              <RichEditor 
                content={content} 
                onChange={setContent}
                placeholder="Start writing structured Markdown..."
                className="min-h-[120px]"
                showToolbar={true}
              />
            </div>

            <div className="flex justify-end px-6 pb-3 pt-2 border-t border-border/10 bg-secondary/5">
              <Button variant="ghost" onClick={handleSave} className="font-bold text-sm px-8 hover:bg-primary/10 hover:text-primary transition-all">Close</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
