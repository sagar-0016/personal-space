"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Pin, 
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
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; isPinned: boolean; isArchived?: boolean }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [activeStyles, setActiveStyles] = useState<{ [key: string]: boolean }>({});
  
  const containerRef = useRef<HTMLDivElement>(null);
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
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        if (title.trim() || content.trim()) {
          handleSave();
        }
        setIsExpanded(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content, isPinned]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      onSave({ title, content, isPinned });
      setTitle('');
      setContent('');
      setIsPinned(false);
      setIsExpanded(false);
      setActiveStyles({});
    }
  };

  const smartMarkdown = (prefix: string, suffix: string = '', isLine = false) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    if (!isLine) {
      // Handle pair markers (Bold, Italic, Code, Strikethrough)
      const isInside = text.substring(start - prefix.length, start) === prefix && 
                       text.substring(end, end + suffix.length) === suffix;

      if (isInside) {
        // Toggle Off: Jump out
        const newPos = end + suffix.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
        setTimeout(checkActiveStyles, 0);
        return;
      }

      const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
      setContent(newText);
      const newPos = start + prefix.length;
      setTimeout(() => {
        textarea.setSelectionRange(newPos, newPos + (end - start));
        textarea.focus();
        checkActiveStyles();
      }, 0);
    } else {
      // Handle line-based toggles
      const lines = text.split('\n');
      let currentPos = 0;
      let targetIdx = -1;
      for (let i = 0; i < lines.length; i++) {
        if (start >= currentPos && start <= currentPos + lines[i].length + 1) {
          targetIdx = i;
          break;
        }
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
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const newText = text.substring(0, start) + "\n" + template + "\n" + text.substring(end);
    setContent(newText);
    textarea.focus();
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "p-0" : "p-1"
      )}>
        {!isExpanded ? (
          <div className="flex items-center px-6 py-4 cursor-text" onClick={() => setIsExpanded(true)}>
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a structured note...</span>
            <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40"><Plus className="h-5 w-5" /></Button>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 text-xl sm:text-2xl font-bold px-0 bg-transparent placeholder:text-muted-foreground/30"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsPinned(!isPinned)}
                className={cn("h-10 w-10 rounded-full", isPinned ? "text-primary" : "text-muted-foreground/40")}
              >
                <Pin className={cn("h-5 w-5", isPinned && "fill-current")} />
              </Button>
            </div>

            <div className="px-6 py-2">
              <Textarea
                ref={textareaRef}
                placeholder="Write in Markdown..."
                value={content}
                onChange={(e) => { setContent(e.target.value); setTimeout(checkActiveStyles, 0); }}
                onClick={checkActiveStyles}
                onKeyUp={checkActiveStyles}
                onSelect={checkActiveStyles}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[120px] px-0 py-2 text-base sm:text-lg leading-relaxed placeholder:text-muted-foreground/30 bg-transparent font-mono"
              />
            </div>

            <div className="flex flex-col px-4 pb-3 space-y-2 border-t border-border/10 pt-3">
              <div className="flex items-center flex-wrap gap-0.5">
                <TooltipProvider>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h1 && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('# ', '', true)}><Heading1 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H1</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h2 && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('## ', '', true)}><Heading2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H2</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.h3 && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('### ', '', true)}><Heading3 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>H3</TooltipContent></Tooltip>
                  <div className="w-px h-4 bg-border/40 mx-1" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.bold && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('**', '**')}><Bold className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Bold</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.italic && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('_', '_')}><Italic className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Italic</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.strikethrough && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('~~', '~~')}><Strikethrough className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Strikethrough</TooltipContent></Tooltip>
                  <div className="w-px h-4 bg-border/40 mx-1" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.list && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('- ', '', true)}><List className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Bullets</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.ordered && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('1. ', '', true)}><ListOrdered className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Numbered</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.tasks && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('- [ ] ', '', true)}><CheckSquare className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Tasks</TooltipContent></Tooltip>
                  <div className="w-px h-4 bg-border/40 mx-1" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.code && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('`', '`')}><Code2 className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Inline Code</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => smartMarkdown('```\n', '\n```')}><Terminal className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Code Block</TooltipContent></Tooltip>
                  <div className="w-px h-4 bg-border/40 mx-1" />
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" className={cn("h-8 w-8", activeStyles.quote && "bg-primary/10 text-primary")} onClick={() => smartMarkdown('> ', '', true)}><Quote className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Quote</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('---')}><Minus className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Separator</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('| Header | Header |\n| :--- | :--- |\n| Cell | Cell |')}><Table className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Table</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('![Alt Text](url)')}><ImageIcon className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Image</TooltipContent></Tooltip>
                  <Tooltip><TooltipTrigger asChild><Button variant="ghost" size="icon" onClick={() => insertTemplate('<details>\n<summary>Title</summary>\nContent\n</details>')}><ChevronDownSquare className="h-4 w-4"/></Button></TooltipTrigger><TooltipContent>Collapsible</TooltipContent></Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex justify-end">
                <Button variant="ghost" onClick={handleSave} className="font-bold text-sm px-6">Close</Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
