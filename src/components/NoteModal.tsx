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
  const [labels, setLabels] = useState<string[]>([]);
  const [newLabel, setNewLabel] = useState('');
  const [editMode, setEditMode] = useState<'visual' | 'markdown'>('visual');

  useEffect(() => {
    if (note) {
      const parsed = parseNoteFormat(note.content);
      setTitle(note.title);
      setContent(parsed.displayContent);
      setLabels(note.labels || []);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      const finalContent = editMode === 'visual' 
        ? stringifyNote({ 
            displayContent: content, 
            title, 
            tags: labels, 
            category: 'tech', 
            type: 'note', 
            status: 'draft', 
            created: '', 
            updated: '', 
            isStructured: false 
          })
        : content;

      onSave({
        ...note,
        title: title || 'Untitled Note',
        content: finalContent,
        labels,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[900px] w-[95vw] max-h-[95vh] flex flex-col p-0 google-shadow border-none rounded-2xl overflow-hidden z-[100] bg-background">
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <h2 className="text-[11px] font-black text-primary uppercase tracking-[0.2em]">
              {editMode === 'visual' ? 'Visual Context' : 'Markdown Source'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditMode(editMode === 'visual' ? 'markdown' : 'visual')}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-tighter bg-secondary hover:bg-primary/10 hover:text-primary transition-all rounded-md"
            >
              {editMode === 'visual' ? <FileText className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
              {editMode === 'visual' ? 'View Source' : 'View Visual'}
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pt-8 pb-32 space-y-6">
          <div className="px-10">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-4xl font-black px-0 h-auto placeholder:text-muted-foreground/15 bg-transparent tracking-tight"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-10">
            <Tag className="h-3.5 w-3.5 text-primary opacity-60" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="bg-primary/5 text-primary border border-primary/10 text-[10px] font-bold py-0.5 px-2.5 flex items-center gap-1.5 rounded-md">
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
              className="h-6 w-28 text-[10px] bg-secondary/30 border-none focus-visible:ring-1 px-2 rounded-md font-medium"
            />
          </div>
          
          <div className="px-6 min-h-[500px]">
            {editMode === 'visual' ? (
              <RichEditor 
                content={content} 
                onChange={setContent} 
                className="min-h-[500px]"
                placeholder="Start writing..."
                showToolbar={true}
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit Markdown Source..."
                className="min-h-[500px] border-none shadow-none focus-visible:ring-0 px-4 bg-transparent font-mono text-[13px] leading-relaxed resize-none"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-card border-t flex justify-end items-center px-10">
          <Button onClick={handleSave} className="rounded-xl px-12 google-shadow font-bold text-xs bg-primary text-primary-foreground">Update Note</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
