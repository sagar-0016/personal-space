
"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pin, 
  Archive, 
  Bold,
  Italic,
  Heading2,
  List,
  Code2,
  Quote
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; isPinned: boolean; isArchived?: boolean }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const smartMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (suffix) {
      // Pair-based formatting (Bold, Italic, Inline Code)
      const isInside = text.substring(start - prefix.length, start) === prefix && 
                       text.substring(end, end + suffix.length) === suffix;

      if (isInside) {
        // Toggle OFF: Exit the formatting block
        const newPos = end + suffix.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
        return;
      }

      if (start !== end) {
        // Wrap selection
        const selection = text.substring(start, end);
        const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
        setContent(newText);
        setTimeout(() => {
          textarea.setSelectionRange(start + prefix.length, end + prefix.length);
          textarea.focus();
        }, 0);
      } else {
        // Toggle ON: Insert markers and place cursor inside
        const newText = text.substring(0, start) + prefix + suffix + text.substring(end);
        setContent(newText);
        const newPos = start + prefix.length;
        setTimeout(() => {
          textarea.setSelectionRange(newPos, newPos);
          textarea.focus();
        }, 0);
      }
    } else {
      // Line-based formatting (Headings, Lists, Quotes)
      const lines = text.split('\n');
      let currentPos = 0;
      let targetLineIndex = -1;

      for (let i = 0; i < lines.length; i++) {
        const lineStart = currentPos;
        const lineEnd = currentPos + lines[i].length;
        if (start >= lineStart && start <= lineEnd + 1) { // +1 for the newline
          targetLineIndex = i;
          break;
        }
        currentPos += lines[i].length + 1;
      }

      if (targetLineIndex !== -1) {
        const line = lines[targetLineIndex];
        if (line.startsWith(prefix)) {
          // Toggle OFF: Remove prefix
          lines[targetLineIndex] = line.substring(prefix.length);
          const newText = lines.join('\n');
          setContent(newText);
          const newPos = Math.max(0, start - prefix.length);
          setTimeout(() => {
            textarea.setSelectionRange(newPos, newPos);
            textarea.focus();
          }, 0);
        } else {
          // Toggle ON: Add prefix
          lines[targetLineIndex] = prefix + line;
          const newText = lines.join('\n');
          setContent(newText);
          const newPos = start + prefix.length;
          setTimeout(() => {
            textarea.setSelectionRange(newPos, newPos);
            textarea.focus();
          }, 0);
        }
      }
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
                ref={textareaRef}
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('**', '**')}><Bold className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Bold (Toggle)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('_', '_')}><Italic className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Italic (Toggle)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('## ')}><Heading2 className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Heading (Toggle Line)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('- ')}><List className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>List (Toggle Line)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('`', '`')}><Code2 className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Inline Code (Toggle)</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => smartMarkdown('> ')}><Quote className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Quote (Toggle Line)</TooltipContent>
                  </Tooltip>
                  <div className="w-px h-4 bg-border mx-2" />
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground/60" onClick={() => handleSave({ isArchived: true })}><Archive className="h-4 w-4" /></Button>
                    </TooltipTrigger>
                    <TooltipContent>Archive</TooltipContent>
                  </Tooltip>
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
