"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Check, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (title || content) {
          handleSave();
        }
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave({ title, content });
      setTitle('');
      setContent('');
    }
  };

  const handleClose = () => {
    handleSave();
    setIsExpanded(false);
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-200 google-shadow bg-card overflow-hidden",
        isExpanded ? "p-4" : "p-1"
      )}>
        {!isExpanded ? (
          <div 
            className="flex items-center px-4 py-2 cursor-text"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-muted-foreground font-medium flex-1">Take a note...</span>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3 note-fade-in">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 text-lg font-semibold px-0 h-auto placeholder:text-muted-foreground/50"
              autoFocus
            />
            <Textarea
              placeholder="Take a note..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[100px] px-0 py-0 placeholder:text-muted-foreground/50"
            />
            <div className="flex justify-end pt-2">
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="hover:bg-accent/20 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}