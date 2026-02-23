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
  Eye
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
  const [parsedData, setParsedData] = useState<any>(null);

  useEffect(() => {
    if (note) {
      const parsed = parseNoteFormat(note.content);
      setParsedData(parsed);
      setTitle(note.title);
      // In visual mode, we only edit the context/body
      setContent(parsed.isStructured ? parsed.displayContent : note.content);
      setLabels(note.labels || []);
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      let finalContent = content;
      
      // If we are in visual mode, we need to wrap the context in the YAML format
      if (editMode === 'visual') {
        finalContent = stringifyNote({
          ...(parsedData || {}),
          title: title || 'Untitled Note',
          tags: labels,
          displayContent: content,
          isStructured: true,
          updated: new Date().toISOString().split('T')[0]
        });
      } else {
        // In markdown mode, content is the whole string
        const reParsed = parseNoteFormat(content);
        if (reParsed.isStructured) {
          finalContent = stringifyNote({
            ...reParsed,
            title: title || reParsed.title || 'Untitled Note',
            tags: labels,
            updated: new Date().toISOString().split('T')[0]
          });
        }
      }

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

  const toggleEditMode = () => {
    if (editMode === 'visual') {
      // Switch to Markdown: Construct the full string
      const fullMarkdown = stringifyNote({
        ...(parsedData || {}),
        title: title || 'Untitled Note',
        tags: labels,
        displayContent: content,
        isStructured: true
      });
      setContent(fullMarkdown);
      setEditMode('markdown');
    } else {
      // Switch to Visual: Extract the context
      const parsed = parseNoteFormat(content);
      setContent(parsed.isStructured ? parsed.displayContent : content);
      setParsedData(parsed);
      setEditMode('visual');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0 google-shadow border-none rounded-xl overflow-hidden z-[100]">
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-2">
              {editMode === 'visual' ? 'Visual Editor' : 'Markdown Source'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleEditMode}
              className="h-7 px-3 text-[9px] font-black uppercase tracking-tighter bg-primary/5 text-primary hover:bg-primary/10 transition-all rounded-full"
            >
              {editMode === 'visual' ? <FileText className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
              {editMode === 'visual' ? 'Switch to Source' : 'Switch to Visual'}
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-8 w-8 hover:bg-destructive/10 hover:text-destructive transition-colors">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pb-20 space-y-4">
          <div className="px-8">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-3xl font-bold px-0 h-auto placeholder:text-muted-foreground/20 bg-transparent transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-8">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-0 px-2 flex items-center gap-1 hover:bg-primary/20 transition-colors">
                {label}
                <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input 
                placeholder="Add label..." 
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
                className="h-6 w-24 text-[10px] bg-secondary/50 border-none focus-visible:ring-1 px-1.5 rounded-md"
              />
            </div>
          </div>
          
          <div className="px-8 min-h-[400px]">
            {editMode === 'visual' ? (
              <RichEditor 
                content={content} 
                onChange={setContent} 
                className="min-h-[400px]"
                placeholder="What's on your mind? The technical metadata is managed for you."
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit raw Markdown Source with YAML frontmatter..."
                className="min-h-[400px] border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-base resize-none"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-secondary/10 border-t flex justify-between items-center backdrop-blur-md">
          <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest px-4">
            Structured Note Format Active
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-lg px-6 hover:bg-destructive/5 hover:text-destructive transition-all">Discard</Button>
            <Button onClick={handleSave} className="rounded-lg px-10 google-shadow font-bold transition-all hover:scale-[1.02] active:scale-[0.98]">Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
