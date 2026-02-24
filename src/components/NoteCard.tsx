
"use client"

import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Note, Project } from '@/lib/types';
import { Card } from '@/components/ui/card';
import { Trash2, Edit3, Pin, Archive, RotateCcw, Tag, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onUpdate: (note: Note) => void;
  onDelete: (id: string) => void;
  onArchive: () => void;
  onTogglePin: () => void;
  isTrash?: boolean;
  onPermanentDelete?: () => void;
  projects?: Project[];
}

export function NoteCard({ 
  note, 
  onEdit, 
  onUpdate,
  onDelete, 
  onArchive, 
  onTogglePin, 
  isTrash, 
  onPermanentDelete,
  projects = []
}: NoteCardProps) {
  
  const currentProject = projects.find(p => p.id === note.projectId);
  const ProjectIcon = (LucideIcons as any)[currentProject?.iconName || 'Briefcase'] || Briefcase;

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
        <div className="flex flex-col gap-1 pr-8">
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-1.5 text-[9px] font-black text-primary/60 uppercase tracking-widest cursor-pointer hover:text-primary transition-colors">
                <ProjectIcon className="h-2.5 w-2.5" />
                {currentProject?.name || "Uncategorized"}
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[150px]">
              <DropdownMenuItem onClick={() => onUpdate({ ...note, projectId: null, labelId: null })}>None</DropdownMenuItem>
              {projects.map(p => (
                <DropdownMenuItem key={p.id} onClick={() => onUpdate({ ...note, projectId: p.id })}>
                  <div className="flex items-center gap-2">
                    {(LucideIcons as any)[p.iconName || 'Briefcase'] && React.createElement((LucideIcons as any)[p.iconName || 'Briefcase'], { className: "h-3.5 w-3.5" })}
                    {p.name}
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {note.title && (
            <h3 className="text-lg font-bold line-clamp-2 text-foreground/90 tracking-tight">
              {note.title}
            </h3>
          )}
        </div>
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
        <div className="text-sm text-foreground/70">
          <MarkdownRenderer 
            content={note.content} 
            className="prose-sm line-clamp-[12]" 
          />
        </div>
      </div>

      {note.tags && note.tags.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-1.5">
          {note.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[9px] font-bold px-2 py-0.5 bg-primary/10 text-primary border-none flex items-center gap-1 hover:bg-primary/20 transition-colors uppercase tracking-wider">
              <Tag className="h-2 w-2" />
              {tag}
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
              onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
              <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader><AlertDialogTitle>Delete note permanently?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={(e) => { e.stopPropagation(); onPermanentDelete?.(); }} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction></AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full" onClick={(e) => { e.stopPropagation(); onEdit(note); }}><Edit3 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-full", note.isArchived && "text-primary bg-primary/10 opacity-100")} onClick={(e) => { e.stopPropagation(); onArchive(); }}><Archive className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full" onClick={(e) => { e.stopPropagation(); onDelete(note.id); }}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
      </div>
    </Card>
  );
}
