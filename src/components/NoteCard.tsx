
"use client"

import React from 'react';
import { Note } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Trash2, Edit3, Pin, Archive, RotateCcw, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './MarkdownRenderer';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
  onArchive: () => void;
  onTogglePin: () => void;
  isTrash?: boolean;
  onPermanentDelete?: () => void;
}

export function NoteCard({ 
  note, 
  onEdit, 
  onDelete, 
  onArchive, 
  onTogglePin, 
  isTrash, 
  onPermanentDelete 
}: NoteCardProps) {
  return (
    <Card 
      onClick={() => !isTrash && onEdit(note)}
      className={cn(
        "group relative flex flex-col p-5 cursor-default transition-all duration-300 border border-border/40 bg-card hover:bg-card google-shadow-hover note-fade-in rounded-xl overflow-hidden h-fit",
        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1.5 before:bg-primary/40 before:opacity-0 group-hover:before:opacity-100 transition-all",
        note.isPinned && "border-primary/30 ring-1 ring-primary/10"
      )}
    >
      <div className="flex justify-between items-start mb-3">
        {note.title && (
          <h3 className="text-lg font-bold line-clamp-2 text-foreground/90 pr-8 tracking-tight">
            {note.title}
          </h3>
        )}
        {!isTrash && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8 rounded-full absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300",
              note.isPinned ? "opacity-100 text-primary bg-primary/10" : "text-muted-foreground hover:bg-muted"
            )}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
          >
            <Pin className={cn("h-4 w-4", note.isPinned ? "fill-current" : "rotate-45")} />
          </Button>
        )}
      </div>
      
      <div className="flex-1 overflow-hidden">
        <div className="text-sm text-foreground/70 pointer-events-none">
          <MarkdownRenderer content={note.content} className="prose-sm line-clamp-[15]" />
        </div>
      </div>

      {note.labels && note.labels.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {note.labels.map(label => (
            <Badge key={label} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary border-none flex items-center gap-1 hover:bg-primary/20 transition-colors uppercase tracking-wider">
              <Tag className="h-2 w-2" />
              {label}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="mt-6 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-all duration-300 space-x-1.5 translate-y-2 group-hover:translate-y-0">
        {isTrash ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-primary/10 rounded-full"
              title="Restore"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id); // Toggle deleted state
              }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              title="Delete permanently"
              onClick={(e) => {
                e.stopPropagation();
                onPermanentDelete?.();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full"
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
              className={cn(
                "h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full",
                note.isArchived && "text-primary bg-primary/10 opacity-100"
              )}
              title={note.isArchived ? "Unarchive" : "Archive"}
              onClick={(e) => {
                e.stopPropagation();
                onArchive();
              }}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(note.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
