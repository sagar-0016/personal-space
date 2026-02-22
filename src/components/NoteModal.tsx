"use client"

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    }
  }, [note]);

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
      <DialogContent className="sm:max-w-[600px] p-6 google-shadow border-none rounded-xl">
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 text-xl font-semibold px-0 h-auto placeholder:text-muted-foreground/50"
          />
          <Textarea
            placeholder="Note"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="border-none shadow-none focus-visible:ring-0 resize-none min-h-[200px] px-0 py-0 text-base placeholder:text-muted-foreground/50"
          />
        </div>
        <DialogFooter className="mt-4">
          <Button variant="ghost" onClick={handleSave} className="font-medium">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}