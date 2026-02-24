"use client"

import React from 'react';
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Database, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface MetadataEditorProps {
  metadata: string;
  onMetadataChange: (metadata: string) => void;
}

/**
 * MetadataEditor - A standalone, isolated component for editing note metadata.
 * Portaled to the top of the DOM stack to avoid clipping and focus trap issues.
 */
export function MetadataEditor({ metadata, onMetadataChange }: MetadataEditorProps) {
  return (
    <PopoverPrimitive.Root modal={false}>
      <PopoverPrimitive.Trigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter text-primary bg-primary/5 border border-primary/20">
          <Database className="h-3.5 w-3.5 mr-1.5" /> Metadata
        </Button>
      </PopoverPrimitive.Trigger>
      
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content 
          align="end" sideOffset={5}
          className="w-[450px] p-4 bg-card shadow-2xl border border-primary/20 z-[9999] rounded-xl outline-none animate-in fade-in-0 zoom-in-95"
          data-metadata-popover="true"
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <Database className="h-3.5 w-3.5 text-primary" /> Metadata
              </h4>
              <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </div>
            <Textarea
              value={metadata || ''}
              onChange={(e) => onMetadataChange?.(e.target.value)}
              autoFocus
              placeholder={`title: "My Note"\ntags: ["tag1"]\n...`}
              className="min-h-[200px] font-mono text-[11px] bg-secondary/30 resize-none border-none focus-visible:ring-1 leading-relaxed cursor-text"
            />
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
