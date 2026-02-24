"use client"

import React, { useState, useEffect, useRef } from 'react';
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
  Layers,
  Trash2,
  Calendar
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { extractMetadataInfo } from '@/lib/note-parser';
import { EditorToolbar } from './EditorToolbar';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Markdown } from 'tiptap-markdown';
import { format } from 'date-fns';

const lowlight = createLowlight(common);

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (note: Note) => void;
}

export function NoteModal({ note, isOpen, onClose, onSave, onDelete }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [labels, setLabels] = useState<string[]>([]);
  const [editMode, setEditMode] = useState<'visual' | 'markdown'>('visual');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastSavedRef = useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Start writing..." }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
      Image,
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Markdown.configure({ html: true, tightLists: true }),
    ],
    content: content,
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage.markdown as any).getMarkdown();
      setContent(markdown);
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[400px] py-4",
      },
    },
  });

  // Initial state setup
  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title);
      setContent(note.content);
      setMetadata(note.metadata || '');
      setLabels(note.labels || []);
      lastSavedRef.current = JSON.stringify({ t: note.title, c: note.content, m: note.metadata });
      if (editor) editor.commands.setContent(note.content, false);
    }
  }, [note?.id, isOpen, editor]);

  // Sync content from Textarea back to editor if switch modes
  useEffect(() => {
    if (editor && editMode === 'visual' && editor.storage.markdown) {
      const currentMarkdown = (editor.storage.markdown as any).getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editMode, content, editor]);

  const performSave = (isClosing: boolean = false) => {
    if (!note) return;
    const info = extractMetadataInfo(metadata);
    const currentData = {
      ...note,
      title: info.title || title || 'Untitled Note',
      content: content,
      metadata: metadata,
      labels: info.tags.length > 0 ? info.tags : labels,
      updatedAt: Date.now()
    };
    const currentStr = JSON.stringify({ t: currentData.title, c: currentData.content, m: currentData.metadata });
    if (currentStr !== lastSavedRef.current) {
      onSave(currentData);
      lastSavedRef.current = currentStr;
    }
    if (isClosing) onClose();
  };

  useEffect(() => {
    if (!isOpen || !note) return;
    const timer = setTimeout(() => performSave(false), 3000);
    return () => clearTimeout(timer);
  }, [title, content, metadata, isOpen, note?.id]);

  useEffect(() => {
    const info = extractMetadataInfo(metadata);
    if (info.tags.length > 0) setLabels(info.tags);
  }, [metadata]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && performSave(true)}>
      <DialogContent 
        className="sm:max-w-[950px] w-[95vw] max-h-[95vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden z-[100] bg-background shadow-2xl"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-metadata-popover="true"]')) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-metadata-popover="true"]')) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-[50]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <span className="text-sm font-bold">
              {editMode === 'visual' ? 'Preview' : 'Code'}
            </span>
            <Button 
              variant="secondary" 
              size="sm"
              onClick={() => setEditMode(editMode === 'visual' ? 'markdown' : 'visual')}
              className="h-7 px-3 text-xs"
            >
              {editMode === 'visual' ? <FileText className="h-3.5 w-3.5 mr-1.5" /> : <Eye className="h-3.5 w-3.5 mr-1.5" />}
              {editMode === 'visual' ? 'Code' : 'Preview'}
            </Button>
            
            {/* Relocated Delete Button to the Left Side for Safety */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (note) {
                  onDelete(note);
                  onClose();
                }
              }} 
              className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-2"
              title="Move to trash"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => performSave(true)} className="rounded-full h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <EditorToolbar 
          editor={editMode === 'visual' ? editor : null}
          textareaRef={textareaRef}
          metadata={metadata}
          onMetadataChange={setMetadata}
          onContentChange={setContent}
        />

        <div className="flex-1 overflow-y-auto pt-6 pb-20 scroll-smooth">
          <div className="px-10 space-y-6">
            <Input
              placeholder="Note Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-3xl font-bold px-0 bg-transparent h-auto placeholder:opacity-30"
            />

            <div className="flex flex-wrap items-center gap-2">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              {labels.map(label => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1.5 rounded-md px-2 py-0.5 bg-primary/5 text-primary border-none">
                  {label}
                  <button onClick={() => setLabels(labels.filter(l => l !== label))} className="hover:text-destructive transition-colors">
                    <CloseIcon className="h-2.5 w-2.5" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-6 px-10">
            {editMode === 'visual' ? (
              <RichEditor 
                editor={editor}
                className="min-h-[500px]"
              />
            ) : (
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Edit Markdown..."
                className="min-h-[600px] border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-sm leading-relaxed resize-none"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-card border-t flex justify-between items-center px-10">
          <div className="flex flex-col space-y-0.5 text-[10px] text-muted-foreground/60 font-medium uppercase tracking-tight">
            {note && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary/40">Created:</span>
                  <span>{format(note.createdAt, 'MMM d, yyyy · HH:mm')}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary/40">Edited:</span>
                  <span>{format(note.updatedAt, 'MMM d, yyyy · HH:mm')}</span>
                </div>
              </>
            )}
          </div>
          <Button onClick={() => performSave(true)} className="rounded-lg px-8 font-bold text-sm bg-primary hover:bg-primary/90">
            Complete Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
