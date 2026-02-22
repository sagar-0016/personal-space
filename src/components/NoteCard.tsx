"use client"

import React from 'react';
import { Note } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Trash2, Edit3, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

export function NoteCard({ note, onEdit, onDelete }: NoteCardProps) {
  return (
    <Card 
      onClick={() => onEdit(note)}
      className={cn(
        "group relative flex flex-col p-4 cursor-default transition-all duration-200 border bg-card hover:bg-card google-shadow-hover note-fade-in",
        note.color ? `bg-[${note.color}]` : ""
      )}
    >
      {note.title && (
        <h3 className="text-base font-medium mb-2 line-clamp-2 text-foreground/90">
          {note.title}
        </h3>
      )}
      <div className="text-sm text-foreground/75 whitespace-pre-wrap break-words line-clamp-[12]">
        {note.content}
      </div>
      
      <div className="mt-4 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity space-x-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(note);
          }}
        >
          <Edit3 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(note.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}