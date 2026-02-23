"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
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
  Tag, 
  X as CloseIcon, 
  Bold, 
  Italic, 
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Quote,
  Code2,
  Terminal,
  Table,
  Image as ImageIcon,
  ChevronDownSquare
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { parseNoteFormat } from '@/lib/note-parser';
import { cn } from '@/lib/utils';

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
  const [activeStyles, setActiveStyles] = useState<{ [key: string]: boolean }>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const checkActiveStyles = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const text = textarea.value;
    const lines = text.split('\n');
    
    let currentPos = 0;
    let currentLine = '';
    for (const line of lines) {
      if (start >= currentPos && start <= currentPos + line.length) {
        currentLine = line;
        break;
      }
      currentPos += line.length + 1;
    }

    const isInsidePair = (marker: string) => {
      const before = text.substring(0, start);
      const after = text.substring(start);
      const countBefore = (before.match(new RegExp(marker.replace(/[*_~`]/g, '\\$&'), 'g')) || []).length;
      const hasAfter = after.includes(marker);
      return countBefore % 2 !== 0 && hasAfter;
    };

    setActiveStyles({
      bold: isInsidePair('**'),
      italic: isInsidePair('_'),
      strikethrough: isInsidePair('~~'),
      code: isInsidePair('`'),
      h1: currentLine.startsWith('# '),
      h2: currentLine.startsWith('## '),
      h3: currentLine.startsWith('### '),
      list: currentLine.startsWith('- '),
      ordered: /^\d+\.\s/.test(currentLine),
      tasks: currentLine.startsWith('- [ ] ') || currentLine.startsWith('- [x] '),
      quote: currentLine.startsWith('> ')
    });
  }, []);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setLabels(note.labels || []);
      setActiveTab('preview');
      setTimeout(checkActiveStyles, 0);
    }
  }, [note, isOpen, checkActiveStyles]);

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

  const smartMarkdown = (prefix: string, suffix: string = '', isLine = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (activeTab !== 'edit') setActiveTab('edit');

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (!isLine) {
      const isInside = text.substring(start - prefix.length, start) === prefix && 
                       text.substring(end, end + suffix.length) === suffix;

      if (isInside) {
        const newPos = end + suffix.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
        setTimeout(checkActiveStyles, 0);
        return;
      }

      const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
      setContent(newText);
      const newPos = start + prefix.length;
      setTimeout(() => { textarea.setSelectionRange(newPos, newPos + (end - start)); textarea.focus(); checkActiveStyles(); }, 0);
    } else {
      const lines = text.split('\n');
      let currentPos = 0;
      let targetIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (start >= currentPos && start <= currentPos + lines[i].length + 1) { targetIdx = i; break; }
        currentPos += lines[i].length + 1;
      }

      if (targetIdx !== -1) {
        const line = lines[targetIdx];
        if (line.startsWith(prefix)) {
          lines[targetIdx] = line.substring(prefix.length);
          const newText = lines.join('\n');
          setContent(newText);
          const newPos = Math.max(0, start - prefix.length);
          setTimeout(() => { textarea.setSelectionRange(newPos, newPos); textarea.focus(); checkActiveStyles(); }, 0);
        } else {
          lines[targetIdx] = prefix + line;
          const newText = lines.join('\n');
          setContent(newText);
          const newPos = start + prefix.length;
          setTimeout(() => { textarea.setSelectionRange(newPos, newPos); textarea.focus(); checkActiveStyles(); }, 0);
        }
      }
    }
  };

  const insertTemplate = (template: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    if (activeTab !== 'edit') setActiveTab('edit');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + "\n" + template + "\n" + text.substring(end);
    setContent(newText);
    textarea.focus();
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
            
            <div className="flex items-center space-x-0.5 flex-wrap max-w-md">
              <TooltipProvider>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h1 && "text-primary bg-primary/10")} onClick={() => smartMarkdown('# ', '', true)}><Heading1 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H1</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h2 && "text-primary bg-primary/10")} onClick={() => smartMarkdown('## ', '', true)}><Heading2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H2</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h3 && "text-primary bg-primary/10")} onClick={() => smartMarkdown('### ', '', true)}><Heading3 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H3</TooltipContent></Tooltip>
                <div className="w-px h-4 bg-border/40 mx-1" />
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.bold && "text-primary bg-primary/10")} onClick={() => smartMarkdown('**', '**')}><Bold className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Bold</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.italic && "text-primary bg-primary/10")} onClick={() => smartMarkdown('_', '_')}><Italic className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Italic</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.strikethrough && "text-primary bg-primary/10")} onClick={() => smartMarkdown('~~', '~~')}><Strikethrough className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Strikethrough</TooltipContent></Tooltip>
                <div className="w-px h-4 bg-border/40 mx-1" />
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.list && "text-primary bg-primary/10")} onClick={() => smartMarkdown('- ', '', true)}><List className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Bullets</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.ordered && "text-primary bg-primary/10")} onClick={() => smartMarkdown('1. ', '', true)}><ListOrdered className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Numbered</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.tasks && "text-primary bg-primary/10")} onClick={() => smartMarkdown('- [ ] ', '', true)}><CheckSquare className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Tasks</TooltipContent></Tooltip>
                <div className="w-px h-4 bg-border/40 mx-1" />
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.code && "text-primary bg-primary/10")} onClick={() => smartMarkdown('`', '`')}><Code2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Inline Code</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => smartMarkdown('```\n', '\n```')}><Terminal className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Code Block</TooltipContent></Tooltip>
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
                ref={textareaRef}
                placeholder="Write your note in Markdown..."
                value={content}
                onChange={(e) => { setContent(e.target.value); setTimeout(checkActiveStyles, 0); }}
                onClick={checkActiveStyles}
                onKeyUp={checkActiveStyles}
                onSelect={checkActiveStyles}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none resize-none min-h-[400px] px-0 py-0 text-base font-mono leading-relaxed placeholder:text-muted-foreground/20 bg-transparent"
              />
            ) : (
              <div className="py-2">
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>
        </div>

        <div className="p-4 bg-secondary/10 border-t flex justify-between items-center">
          <div className="flex items-center space-x-1">
             <TooltipProvider>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.quote && "text-primary bg-primary/10")} onClick={() => smartMarkdown('> ', '', true)}><Quote className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Quote</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('---')}><Minus className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Separator</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('| Header | Header |\n| :--- | :--- |\n| Cell | Cell |')}><Table className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Table</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('![Alt Text](url)')}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Image</TooltipContent></Tooltip>
                <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('<details>\n<summary>Title</summary>\nContent\n</details>')}><ChevronDownSquare className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Collapsible</TooltipContent></Tooltip>
             </TooltipProvider>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="rounded-lg">Discard</Button>
            <Button onClick={handleSave} className="rounded-lg px-8">Done</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
