
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
  Undo2, 
  Redo2,
  Tag
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
        if (title || content) {
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
      onSave({ 
        title, 
        content, 
        isPinned,
        ...extraFields
      });
      setTitle('');
      setContent('');
      setIsPinned(false);
    }
  };

  const handleClose = () => {
    handleSave();
    setIsExpanded(false);
  };

  const handleFeatureComingSoon = (feature: string) => {
    toast({
      title: "Coming Soon",
      description: `${feature} functionality will be implemented in a future update.`,
    });
  };

  const toolbarIcons = [
    { icon: UserPlus, label: "Collaborator", onClick: () => handleFeatureComingSoon("Collaborator") },
    { icon: Palette, label: "Background options", onClick: () => handleFeatureComingSoon("Theme Colors") },
    { 
      icon: ImageIcon, 
      label: "Add image", 
      onClick: () => toast({ 
        title: "Image Upload", 
        description: "Image support will be implemented in the future." 
      }) 
    },
    { icon: Archive, label: "Archive", onClick: () => {
      handleSave({ isArchived: true });
      setIsExpanded(false);
      toast({ title: "Note Archived", description: "The note has been moved to your archive." });
    }},
    { icon: Tag, label: "Add Label", onClick: () => handleFeatureComingSoon("Labels") },
    { icon: MoreVertical, label: "More", onClick: () => handleFeatureComingSoon("More Options") },
    { icon: Undo2, label: "Undo", onClick: () => handleFeatureComingSoon("Undo") },
    { icon: Redo2, label: "Redo", onClick: () => handleFeatureComingSoon("Redo") },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "" : "p-1"
      )}>
        {!isExpanded ? (
          <div 
            className="flex items-center px-6 py-4 cursor-text group"
            onClick={() => setIsExpanded(true)}
          >
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a note...</span>
            <div className="flex space-x-1">
              <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 group-hover:opacity-100 transition-opacity">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            {/* Header / Title Area */}
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 outline-none text-xl sm:text-2xl font-bold px-0 h-auto placeholder:text-muted-foreground/30 bg-transparent"
                autoFocus
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsPinned(!isPinned);
                      }}
                      className={cn(
                        "h-10 w-10 rounded-full transition-colors shrink-0 ml-2",
                        isPinned ? "text-primary" : "text-muted-foreground/40 hover:text-foreground"
                      )}
                    >
                      <Pin className={cn("h-5 w-5", isPinned && "fill-current")} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isPinned ? "Unpin note" : "Pin note"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Content Area */}
            <div className="px-6 py-2">
              <Textarea
                placeholder="Take a note..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:ring-0 outline-none resize-none min-h-[60px] px-0 py-2 text-base sm:text-lg leading-relaxed placeholder:text-muted-foreground/30 overflow-hidden bg-transparent"
                style={{ height: 'auto' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            </div>

            {/* Toolbar Area */}
            <div className="flex items-center justify-between px-4 pt-3 pb-3">
              <div className="flex items-center space-x-0.5 overflow-x-auto">
                <TooltipProvider>
                  {toolbarIcons.map((item, idx) => (
                    <Tooltip key={idx}>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={item.onClick}
                          className="h-9 w-9 text-muted-foreground/60 hover:text-foreground hover:bg-muted/50 rounded-full shrink-0"
                        >
                          <item.icon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="text-[10px] px-2 py-1">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  ))}
                </TooltipProvider>
              </div>
              
              <Button 
                variant="ghost" 
                onClick={handleClose}
                className="hover:bg-accent/20 font-bold text-sm px-6 h-10 transition-all"
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
