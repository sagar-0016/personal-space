"use client"

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface MetadataEditorProps {
  metadata: string;
  onMetadataChange: (metadata: string) => void;
}

/**
 * MetadataEditor - Unified Nested Dialog Architecture.
 * Explicitly tagged with data-metadata-popover to prevent parent focus hijacking.
 */
export function MetadataEditor({ metadata, onMetadataChange }: MetadataEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localMetadata, setLocalMetadata] = useState(metadata);

  const handleApply = () => {
    onMetadataChange?.(localMetadata);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (open) setLocalMetadata(metadata);
    }}>
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
        data-metadata-popover="true"
      >
        <div className="bg-card">
          <DialogHeader className="p-6 pb-4 border-b bg-secondary/10">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Database className="h-4 w-4 text-primary" />
              </div>
              <DialogTitle className="text-sm font-bold uppercase tracking-widest">
                Technical Metadata
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-4">
            <Textarea
              value={localMetadata || ''}
              onChange={(e) => setLocalMetadata(e.target.value)}
              placeholder={`title: "My Note"\ntags: ["tag1"]\n...`}
              className="min-h-[300px] font-mono text-xs bg-secondary/20 resize-none border-none focus-visible:ring-0 leading-relaxed cursor-text p-4 rounded-xl"
              autoFocus
            />
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-muted-foreground/60 italic font-medium">
                Updates 'title' or 'tags' immediately affects indexing.
              </p>
              <Button 
                onClick={handleApply}
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