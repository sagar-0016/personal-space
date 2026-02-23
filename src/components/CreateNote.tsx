
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pin, 
  UserPlus, 
  Palette, 
  Image as ImageIcon, 
  Archive, 
  MoreVertical, 
  Bold,
  Heading2,
  List,
  Code2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; isPinned: boolean; isArchived?: boolean }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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

  const handleSave = (extraFields = {}) => {
    if (title.trim() || content.trim()) {
      onSave({ title, content, isPinned, ...extraFields });
      setTitle('');
      setContent('');
      setIsPinned(false);
    }
  };

  const insertMarkdown = (prefix: string) => {
    setContent(prev => prev + prefix);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "p-0" : "p-1"
      )}>
        {!isExpanded ? (
          <div className="flex items-center px-6 py-4 cursor-text" onClick={() => setIsExpanded(true)}>
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a note...</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40"><Plus className="h-5 w-5" /></Button>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xl sm:text-2xl font-bold px-0 bg-transparent placeholder:text-muted-foreground/30"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPinned(!isPinned)}
                className={cn("h-10 w-10 rounded-full", isPinned ? "text-primary" : "text-muted-foreground/40")}
              >
                <Pin className={cn("h-5 w-5", isPinned && "fill-current")} />
              </Button>
            </div>

            <div className="px-6 py-2">
              <Textarea
                placeholder="Take a note in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[80px] px-0 py-2 text-base sm:text-lg leading-relaxed placeholder:text-muted-foreground/30 bg-transparent"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>

            <div className="flex items-center justify-between px-4 py-3 border-t border-border/10">
              <div className="flex items-center space-x-0.5">
                <TooltipProvider>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => insertMarkdown('**')}><Bold className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => insertMarkdown('## ')}><Heading2 className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => insertMarkdown('```\n\n```')}><Code2 className="h-4 w-4" /></Button>
                  <div className="w-px h-4 bg-border mx-2" />
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => handleSave({ isArchived: true })}><Archive className="h-4 w-4" /></Button>
                </TooltipProvider>
              </div>
              <Button variant="ghost" onClick={() => (handleSave(), setIsExpanded(false))} className="font-bold text-sm px-6 hover:bg-accent/20">Close</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
