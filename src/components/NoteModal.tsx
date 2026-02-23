
"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Edit2, 
  X, 
  Terminal, 
  Layout, 
  Tag, 
  Plus, 
  X as CloseIcon, 
  Bold, 
  Italic, 
  Heading1, 
  List, 
  Code2, 
  Quote
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { parseNoteFormat } from '@/lib/note-parser';

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
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');
  const [highContrastCode, setHighContrastCode] = useState(false);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLabels(note.labels || []);
      setActiveTab('preview');
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note) {
      const parsed = parseNoteFormat(content);
      const finalTitle = parsed.isStructured && parsed.title ? parsed.title : title;
      
      onSave({
        ...note,
        title: finalTitle,
        content,
        labels,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  const insertMarkdown = (prefix: string, suffix: string = '') => {
    const textarea = document.querySelector('textarea');
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const before = text.substring(0, start);
    const selection = text.substring(start, end);
    const after = text.substring(end);

    const newContent = before + prefix + (selection || 'text') + suffix + after;
    setContent(newContent);
    setActiveTab('edit');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-0 google-shadow border-none rounded-xl overflow-hidden z-[100]">
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
              <TabsList className="bg-secondary/50 h-9 p-1">
                <TabsTrigger value="preview" className="px-3 py-1 text-xs data-[state=active]:bg-background">
                  <Eye className="h-3 w-3 mr-2" /> Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="px-3 py-1 text-xs data-[state=active]:bg-background">
                  <Edit2 className="h-3 w-3 mr-2" /> Edit
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <div className="flex items-center space-x-1">
              <TooltipProvider>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('**', '**')}><Bold className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('_', '_')}><Italic className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('## ')}><Heading1 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('```\n', '\n```')}><Code2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => insertMarkdown('> ')}><Quote className="h-4 w-4" /></Button>
              </TooltipProvider>
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto pt-6 pb-20 space-y-4">
          <div className="px-6">
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-3xl font-bold px-0 h-auto placeholder:text-muted-foreground/20 bg-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 px-6">
            <Tag className="h-3.5 w-3.5 text-muted-foreground" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] py-0 px-2 flex items-center gap-1">
                {label}
                <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                  <CloseIcon className="h-2.5 w-2.5" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1">
              <Input 
                placeholder="New label..." 
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (newLabel.trim() && !labels.includes(newLabel.trim())) && (setLabels([...labels, newLabel.trim()]), setNewLabel(''))}
                className="h-6 w-20 text-[10px] bg-secondary/50 border-none focus-visible:ring-1 px-1.5"
              />
            </div>
          </div>
          
          <div className="px-6 min-h-[400px]">
            {activeTab === 'edit' ? (
              <Textarea
                placeholder="Write your note in Markdown..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none resize-none min-h-[400px] px-0 py-0 text-base font-mono leading-relaxed placeholder:text-muted-foreground/20 bg-transparent"
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${target.scrollHeight}px`;
                }}
              />
            ) : (
              <div className="py-2">
                <MarkdownRenderer content={content} highContrastCode={highContrastCode} />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-secondary/10 border-t flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="rounded-lg">Discard</Button>
          <Button onClick={handleSave} className="rounded-lg px-8">Done</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
