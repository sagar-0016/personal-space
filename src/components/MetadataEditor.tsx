"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger 
} from '@/components/ui/dialog';
import { Database, Info, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MetadataEditorProps {
  metadata: string;
  onMetadataChange: (metadata: string) => void;
}

/**
 * MetadataEditor - Migrated to Dialog to resolve Focus Trap conflicts with NoteModal.
 * Radix UI natively handles nested Dialogs, ensuring focus is managed correctly.
 */
export function MetadataEditor({ metadata, onMetadataChange }: MetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-8 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all",
            isOpen ? "text-primary bg-primary/10 border-primary/20" : "text-muted-foreground bg-secondary/30"
          )}
        >
          <Database className="h-3.5 w-3.5 mr-1.5" /> Metadata
        </Button>
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl z-[10000]"
      >
        <div className="bg-card">
          <DialogHeader className="p-6 pb-2 border-b bg-secondary/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <DialogTitle className="text-sm font-bold uppercase tracking-widest">
                  Technical Metadata
                </DialogTitle>
              </div>
              <Info className="h-4 w-4 text-muted-foreground cursor-help" title="YAML Metadata Format" />
            </div>
            <DialogDescription className="text-[10px] opacity-60 uppercase tracking-tight pt-1">
              Note parameters, indexing tags, and structural metadata.
            </DialogDescription>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <Textarea
              value={metadata || ''}
              onChange={(e) => onMetadataChange?.(e.target.value)}
              placeholder={`title: "My Note"\ntags: ["tag1"]\n...`}
              className="min-h-[300px] font-mono text-xs bg-secondary/20 resize-none border-none focus-visible:ring-1 focus-visible:ring-primary/30 leading-relaxed cursor-text p-4 rounded-xl"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground/60 italic font-medium">
                Note: Updating 'title' or 'tags' here affects indexing.
              </p>
              <Button 
                onClick={() => setIsOpen(false)}
                className="h-8 px-6 text-xs font-bold"
              >
                Apply Changes
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
