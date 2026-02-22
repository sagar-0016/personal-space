
"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { MarkdownRenderer } from './MarkdownRenderer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Eye, Edit2, X } from 'lucide-react';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('preview');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      // Default to preview when opening an existing note
      setActiveTab('preview');
    }
  }, [note, isOpen]);

  const handleSave = () => {
    if (note && (title !== note.title || content !== note.content)) {
      onSave({
        ...note,
        title,
        content,
        updatedAt: Date.now()
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSave()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 google-shadow border-none rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-10">
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
          <Button variant="ghost" size="icon" onClick={handleSave} className="rounded-full h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-2xl font-semibold px-0 h-auto placeholder:text-muted-foreground/30"
          />
          
          {activeTab === 'edit' ? (
            <Textarea
              placeholder="Start writing your thoughts in Markdown..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[300px] px-0 py-0 text-base font-mono leading-relaxed placeholder:text-muted-foreground/30"
              autoFocus
            />
          ) : (
            <div className="min-h-[300px] py-2">
              {content ? (
                <MarkdownRenderer content={content} />
              ) : (
                <p className="text-muted-foreground/50 italic">Nothing to preview yet.</p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-4 bg-secondary/20 border-t flex justify-end">
          <Button variant="ghost" onClick={handleSave} className="font-medium hover:bg-background">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
