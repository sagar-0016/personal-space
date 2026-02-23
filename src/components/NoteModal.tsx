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
  Settings as SettingsIcon,
  Layers
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseNoteFormat, stringifyNote } from '@/lib/note-parser';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const [metadata, setMetadata] = useState({
    category: 'tech',
    type: 'note',
    status: 'draft',
    created: ''
  });

  useEffect(() => {
    if (note) {
      const parsed = parseNoteFormat(note.content);
      setTitle(note.title);
      setContent(parsed.isStructured ? parsed.displayContent : note.content);
      setLabels(note.labels || []);
      setMetadata({
        category: parsed.category,
        type: parsed.type,
        status: parsed.status,
        created: parsed.created
      });
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      let finalContent = content;
      
      if (editMode === 'visual') {
        finalContent = stringifyNote({
          title: title || 'Untitled Note',
          category: metadata.category,
          tags: labels,
          created: metadata.created || new Date().toISOString().split('T')[0],
          updated: new Date().toISOString().split('T')[0],
          type: metadata.type,
          status: metadata.status,
          displayContent: content,
          isStructured: true
        });
      } else {
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
      const fullMarkdown = stringifyNote({
        title,
        category: metadata.category,
        tags: labels,
        created: metadata.created,
        updated: new Date().toISOString().split('T')[0],
        type: metadata.type,
        status: metadata.status,
        displayContent: content,
        isStructured: true
      });
      setContent(fullMarkdown);
      setEditMode('markdown');
    } else {
      const parsed = parseNoteFormat(content);
      setContent(parsed.isStructured ? parsed.displayContent : content);
      setMetadata({
        category: parsed.category,
        type: parsed.type,
        status: parsed.status,
        created: parsed.created
      });
      setEditMode('visual');
    }
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
              {editMode === 'visual' ? 'Visual Context' : 'Raw Structure'}
            </h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleEditMode}
              className="h-7 px-3 text-[10px] font-bold uppercase tracking-tighter bg-secondary hover:bg-primary/10 hover:text-primary transition-all rounded-md"
            >
              {editMode === 'visual' ? <FileText className="h-3 w-3 mr-1.5" /> : <Eye className="h-3 w-3 mr-1.5" />}
              {editMode === 'visual' ? 'View Source' : 'View Visual'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                  <SettingsIcon className="h-4 w-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 google-shadow rounded-xl border-none p-2 z-[110]">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest opacity-50">Metadata</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase opacity-60">Status</label>
                    <select 
                      value={metadata.status} 
                      onChange={(e) => setMetadata({...metadata, status: e.target.value})}
                      className="w-full text-xs bg-secondary border-none rounded p-1.5 outline-none focus:ring-1 ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold uppercase opacity-60">Category</label>
                    <Input 
                      value={metadata.category} 
                      onChange={(e) => setMetadata({...metadata, category: e.target.value})}
                      className="h-7 text-xs bg-secondary"
                    />
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-9 w-9 hover:bg-destructive/10 hover:text-destructive transition-colors">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-8 pb-32 space-y-6">
          <div className="px-10">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-4xl font-black px-0 h-auto placeholder:text-muted-foreground/15 bg-transparent transition-all tracking-tight"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-10">
            <Tag className="h-3.5 w-3.5 text-primary opacity-60" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="bg-primary/5 text-primary border border-primary/10 text-[10px] font-bold py-0.5 px-2.5 flex items-center gap-1.5 hover:bg-primary/10 transition-colors rounded-md">
                {label}
                <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
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
          </div>
          
          <div className="px-10 min-h-[500px]">
            {editMode === 'visual' ? (
              <RichEditor 
                content={content} 
                onChange={setContent} 
                className="min-h-[500px]"
                placeholder="## Context\nStart writing your analytical thoughts here..."
                showToolbar={true}
              />
            ) : (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit raw Markdown Source with Analytical Metadata..."
                className="min-h-[500px] border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-[13px] leading-relaxed resize-none text-muted-foreground"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-card border-t flex justify-between items-center backdrop-blur-md">
          <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-[0.2em] px-6 opacity-40">
            Structured Note Pipeline v2.0
          </div>
          <div className="flex gap-3 px-6">
            <Button variant="ghost" onClick={onClose} className="rounded-xl px-8 font-bold text-xs hover:bg-destructive/5 hover:text-destructive transition-all">Discard</Button>
            <Button onClick={handleSave} className="rounded-xl px-12 google-shadow font-bold text-xs bg-primary text-primary-foreground transition-all hover:scale-[1.02] active:scale-[0.98]">Update Repository</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
