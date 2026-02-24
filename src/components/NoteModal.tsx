"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { RichEditor } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Tag, 
  X as CloseIcon, 
  FileText,
  Eye,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { extractMetadataInfo } from '@/lib/note-parser';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'visual' | 'markdown'>('visual');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setMetadata(note.metadata || '');
      setLabels(note.labels || []);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      const info = extractMetadataInfo(metadata);
      onSave({
        ...note,
        title: info.title || title || 'Untitled Note',
        content: content,
        metadata: metadata,
        labels: info.tags.length > 0 ? info.tags : labels,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent 
        className="sm:max-w-[950px] w-[95vw] max-h-[95vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden z-[100] bg-background shadow-2xl"
        onPointerDownOutside={(e) => {
          // Protect the metadata popover from closing the dialog
          const target = e.target as HTMLElement;
          if (target?.closest('[data-metadata-popover]')) {
            e.preventDefault();
          }
        }}
        onInteractOutside={(e) => {
          // Protect interactions with the metadata popover
          const target = e.target as HTMLElement;
          if (target?.closest('[data-metadata-popover]')) {
            e.preventDefault();
          }
        }}
      >
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-[50]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold">
              {editMode === 'visual' ? 'Preview' : 'Code'}
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(editMode === 'visual' ? 'markdown' : 'visual')}
              className="h-7 px-3 text-xs"
            >
              {editMode === 'visual' ? <FileText className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
              {editMode === 'visual' ? 'Code' : 'Preview'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pb-20 scroll-smooth">
          <div className="px-10 space-y-6">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 text-3xl font-bold px-0 bg-transparent h-auto placeholder:opacity-30"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {labels.map(label => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1.5 rounded-md px-2 py-0.5 bg-primary/5 text-primary border-none">
                  {label}
                  <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-6 px-4">
            {editMode === 'visual' ? (
              <RichEditor 
                content={content} 
                onChange={setContent}
                metadata={metadata}
                onMetadataChange={setMetadata}
                className="min-h-[500px]"
                placeholder="Start writing your context..."
                showToolbar={true}
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit Markdown..."
                className="min-h-[600px] border-none shadow-none focus-visible:ring-0 px-6 bg-transparent font-mono text-sm leading-relaxed resize-none"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-card border-t flex justify-end items-center px-10">
          <Button onClick={handleSave} className="rounded-lg px-8 font-bold text-sm bg-primary hover:bg-primary/90">
            Complete Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
