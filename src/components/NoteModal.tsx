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
  Layers,
  Settings,
  Database
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseNoteFormat, stringifyNote } from '@/lib/note-parser';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rawMetadata, setRawMetadata] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [editMode, setEditMode] = useState<'visual' | 'markdown'>('visual');

  useEffect(() => {
    if (note) {
      const parsed = parseNoteFormat(note.content);
      setTitle(note.title);
      setContent(parsed.displayContent);
      setRawMetadata(parsed.rawMetadata || '');
      setLabels(note.labels || []);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      // Re-parse the metadata block just in case user edited it directly
      const tempNote = stringifyNote({
        displayContent: content,
        rawMetadata: rawMetadata,
        title: title,
        tags: labels,
        category: 'tech',
        created: '',
        updated: '',
        type: 'note',
        status: 'draft',
        isStructured: true
      });
      
      const reParsed = parseNoteFormat(tempNote);

      onSave({
        ...note,
        title: reParsed.title || title || 'Untitled Note',
        content: tempNote,
        labels: reParsed.tags.length > 0 ? reParsed.tags : labels,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[950px] w-[95vw] max-h-[95vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden z-[100] bg-background shadow-2xl">
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold">
              {editMode === 'visual' ? 'Visual Context' : 'Markdown Source'}
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(editMode === 'visual' ? 'markdown' : 'visual')}
              className="h-7 px-3 text-xs"
            >
              {editMode === 'visual' ? <FileText className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
              {editMode === 'visual' ? 'View Source' : 'View Visual'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pb-20 space-y-6">
          <div className="px-10">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 text-3xl font-bold px-0 bg-transparent h-auto placeholder:opacity-30"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-10">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="flex items-center gap-1.5 rounded-md px-2 py-0.5 bg-primary/5 text-primary border-none">
                {label}
                <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <Input 
              placeholder="+ Add label" 
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newLabel.trim()) {
                  if (!labels.includes(newLabel.trim())) {
                    setLabels([...labels, newLabel.trim()]);
                  }
                  setNewLabel('');
                }
              }}
              className="h-6 w-28 text-xs bg-secondary/50 border-none focus-visible:ring-1 px-2 rounded-md"
            />
          </div>
          
          <div className="px-6 min-h-[500px]">
            {editMode === 'visual' ? (
              <RichEditor 
                content={content} 
                onChange={setContent}
                metadata={rawMetadata}
                onMetadataChange={setRawMetadata}
                className="min-h-[500px]"
                placeholder="Start writing your context..."
                showToolbar={true}
              />
            ) : (
              <Textarea
                value={stringifyNote({
                  displayContent: content,
                  rawMetadata: rawMetadata,
                  title,
                  tags: labels,
                  category: 'tech',
                  created: '',
                  updated: '',
                  type: 'note',
                  status: 'draft',
                  isStructured: true
                })}
                onChange={(e) => {
                  const p = parseNoteFormat(e.target.value);
                  setContent(p.displayContent);
                  setRawMetadata(p.rawMetadata || '');
                  setTitle(p.title || title);
                  setLabels(p.tags.length > 0 ? p.tags : labels);
                }}
                placeholder="Edit Markdown Source..."
                className="min-h-[500px] border-none shadow-none focus-visible:ring-0 px-4 bg-transparent font-mono text-sm leading-relaxed resize-none"
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
