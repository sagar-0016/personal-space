"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Database, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MetadataEditorProps {
  metadata: string;
  onMetadataChange: (metadata: string) => void;
}

/**
 * MetadataEditor - A standalone, isolated component for editing note metadata.
 * Uses an inline absolute panel instead of a portal to avoid focus trap conflicts 
 * when nested inside Dialogs (modals).
 */
export function MetadataEditor({ metadata, onMetadataChange }: MetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Natural closing behavior: Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative inline-block" ref={containerRef}>
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all",
          isOpen ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground bg-secondary/30"
        )}
      >
        <Database className="h-3.5 w-3.5 mr-1.5" /> Metadata
      </Button>
      
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-[450px] p-4 bg-card shadow-2xl border border-primary/20 z-[100] rounded-xl animate-in fade-in-0 zoom-in-95"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-primary" /> Metadata
              </h4>
              <div className="flex items-center gap-2">
                <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" title="YAML Metadata Format" />
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Textarea
              value={metadata || ''}
              onChange={(e) => onMetadataChange?.(e.target.value)}
              autoFocus
              placeholder={`title: "My Note"\ntags: ["tag1"]\n...`}
              className="min-h-[200px] font-mono text-[11px] bg-secondary/30 resize-none border-none focus-visible:ring-1 leading-relaxed cursor-text"
            />
            <p className="text-[9px] text-muted-foreground/60 italic">
              Changes here will automatically update note indexing fields.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
