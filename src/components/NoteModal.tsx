
"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit2, X, Terminal, Code2, Tag, Plus, X as CloseIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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
    if (note && (title !== note.title || content !== note.content || JSON.stringify(labels) !== JSON.stringify(note.labels))) {
      onSave({
        ...note,
        title,
        content,
        labels,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()]);
      setNewLabel('');
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[800px] w-[95vw] max-h-[90vh] flex flex-col p-0 google-shadow border-none rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center space-x-4">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-auto">
              <TabsList className="bg-secondary/50 h-9 p-1">
                <TabsTrigger value="preview" className="px-3 py-1 text-xs data-[state=active]:bg-background">
                  <Eye className="h-3 w-3 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="edit" className="px-3 py-1 text-xs data-[state=active]:bg-background">
                  <Edit2 className="h-3 w-3 mr-2" />
                  Edit
                </TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="h-6 w-px bg-border hidden sm:block" />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "rounded-full h-8 w-8 transition-colors",
                      highContrastCode ? "bg-primary/20 text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => setHighContrastCode(!highContrastCode)}
                  >
                    {highContrastCode ? <Terminal className="h-4 w-4" /> : <Code2 className="h-4 w-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{highContrastCode ? "Switch to Standard Code" : "Switch to High-Contrast Code"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-3xl font-bold px-0 h-auto placeholder:text-muted-foreground/20"
          />

          <div className="flex flex-wrap items-center gap-2 pb-2">
            <Tag className="h-4 w-4 text-muted-foreground" />
            {labels.map(label => (
              <Badge key={label} variant="secondary" className="bg-primary/10 text-primary border-none hover:bg-primary/20 transition-colors">
                {label}
                <button onClick={() => handleRemoveLabel(label)} className="ml-1 hover:text-destructive">
                  <CloseIcon className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            <div className="flex items-center gap-1 ml-2">
              <Input 
                placeholder="Add label..." 
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLabel()}
                className="h-7 w-24 text-xs bg-secondary border-none focus-visible:ring-1"
              />
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleAddLabel}>
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          {activeTab === 'edit' ? (
            <Textarea
              placeholder="Start writing your thoughts in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[400px] px-0 py-0 text-base font-mono leading-relaxed placeholder:text-muted-foreground/30 focus-visible:ring-offset-0"
              autoFocus
            />
          ) : (
            <div className="min-h-[400px] py-2">
              {content ? (
                <MarkdownRenderer content={content} highContrastCode={highContrastCode} />
              ) : (
                <p className="text-muted-foreground/50 italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-secondary/10 border-t flex justify-end">
          <Button variant="ghost" onClick={handleSave} className="font-medium hover:bg-background px-6">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
