"use client"

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Note } from '@/lib/types';
import { RichEditor } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  Tag, 
  Layers,
  Trash2,
  Briefcase,
  Plus
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { extractMetadataInfo, updateMetadataWithInfo } from '@/lib/note-parser';
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
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const lowlight = createLowlight(common);

interface NoteModalProps {
  note: Note | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (note: Note) => void;
  onDelete: (note: Note) => void;
  projects?: string[];
}

export function NoteModal({ note, isOpen, onClose, onSave, onDelete, projects = [] }: NoteModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [project, setProject] = useState<string | null>(null);
  const [labels, setLabels] = useState<string[]>([]);
  const [labelInput, setLabelInput] = useState('');
  const [editMode, setEditMode] = useState<'preview' | 'visual' | 'markdown'>('preview');
  
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
    content: '',
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

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      const currentScroll = textareaRef.current.scrollTop;
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
      textareaRef.current.scrollTop = currentScroll;
    }
  }, []);

  useEffect(() => {
    if (note && isOpen) {
      setTitle(note.title);
      setContent(note.content);
      setMetadata(note.metadata || '');
      setProject(note.project || null);
      setLabels(note.labels || []);
      lastSavedRef.current = JSON.stringify({ t: note.title, c: note.content, m: note.metadata });
      if (editor) editor.commands.setContent(note.content, false);
      setEditMode('preview');
    }
  }, [note?.id, isOpen, editor]);

  useEffect(() => {
    if (editor && editMode === 'visual' && editor.storage.markdown) {
      const currentMarkdown = (editor.storage.markdown as any).getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, false);
      }
    }
    if (editMode === 'markdown') {
      setTimeout(adjustTextareaHeight, 0);
    }
  }, [editMode, content, editor, adjustTextareaHeight]);

  const performSave = (isClosing: boolean = false) => {
    if (!note) return;
    
    const updatedMetadata = updateMetadataWithInfo(metadata, {
      title,
      project: project || '',
      labels,
    });

    const currentData = {
      ...note,
      title: title || 'Untitled Note',
      content: content,
      metadata: updatedMetadata,
      project: project,
      labels: labels,
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
  }, [title, content, metadata, project, labels, isOpen, note?.id]);

  const handleMarkdownChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    const target = e.target;
    target.style.height = 'auto';
    target.style.height = `${target.scrollHeight}px`;
  };

  const addLabel = () => {
    if (labelInput.trim() && !labels.includes(labelInput.trim())) {
      setLabels([...labels, labelInput.trim()]);
      setLabelInput('');
    }
  };

  const removeLabel = (labelToRemove: string) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && performSave(true)}>
      <DialogContent 
        className="sm:max-w-[950px] w-[95vw] max-h-[95vh] flex flex-col p-0 border-none rounded-2xl overflow-hidden z-[100] bg-background shadow-2xl"
        onPointerDownOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-metadata-popover="true"]')) e.preventDefault();
          if (target.closest('.project-select-dropdown')) e.preventDefault();
        }}
        onInteractOutside={(e) => {
          const target = e.target as HTMLElement;
          if (target.closest('[data-metadata-popover="true"]')) e.preventDefault();
          if (target.closest('.project-select-dropdown')) e.preventDefault();
        }}
      >
        <DialogTitle className="sr-only">Edit Note: {title}</DialogTitle>
        
        <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-[50]">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="flex items-center bg-secondary/30 rounded-lg p-1 mr-2">
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setEditMode('preview')}
                className={cn(
                  "h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all",
                  editMode === 'preview' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                Preview
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setEditMode('visual')}
                className={cn(
                  "h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all",
                  editMode === 'visual' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                Visual Editor
              </Button>
              <Button 
                variant="ghost"
                size="sm"
                onClick={() => setEditMode('markdown')}
                className={cn(
                  "h-7 px-4 text-xs font-bold uppercase tracking-tight transition-all",
                  editMode === 'markdown' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                )}
              >
                Markdown Editor
              </Button>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" onClick={() => performSave(true)} className="rounded-full h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {editMode !== 'preview' && (
          <EditorToolbar 
            editor={editMode === 'visual' ? editor : null}
            textareaRef={textareaRef}
            metadata={metadata}
            onMetadataChange={setMetadata}
            onContentChange={setContent}
          />
        )}

        <div className="flex-1 overflow-y-auto pt-6 pb-20 scroll-smooth">
          <div className="px-10 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={project || "none"} onValueChange={(val) => setProject(val === "none" ? null : val)}>
                  <SelectTrigger className="w-[200px] h-9 text-[11px] font-black uppercase tracking-widest bg-primary/5 border-none shadow-none focus:ring-0 project-select-dropdown">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      <SelectValue placeholder="Assign Project" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="project-select-dropdown">
                    <SelectItem value="none">No Project</SelectItem>
                    {projects.map(p => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                    <div className="p-2 border-t mt-1">
                       <input 
                         placeholder="+ Create New" 
                         className="w-full text-[10px] font-bold uppercase tracking-widest outline-none bg-transparent px-2"
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             const val = (e.target as HTMLInputElement).value;
                             if (val) setProject(val);
                           }
                         }}
                       />
                    </div>
                  </SelectContent>
                </Select>
              </div>

              <Input
                placeholder="Note Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-3xl font-bold px-0 bg-transparent h-auto placeholder:opacity-30"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-primary/5 rounded-full px-3 py-1 border border-primary/10 group focus-within:border-primary/30 transition-all">
                <Tag className="h-3.5 w-3.5 text-primary/40 mr-2" />
                <input 
                  placeholder="Add label..." 
                  className="bg-transparent border-none text-[11px] font-bold uppercase tracking-widest outline-none w-24 placeholder:text-muted-foreground/30"
                  value={labelInput}
                  onChange={(e) => setLabelInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLabel()}
                />
              </div>
              {labels.map(label => (
                <Badge key={label} variant="secondary" className="flex items-center gap-2 rounded-lg px-3 py-1 bg-primary/10 text-primary border-none">
                  {label}
                  <X className="h-3 w-3 cursor-pointer hover:text-destructive" onClick={() => removeLabel(label)} />
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="mt-6 px-10">
            {editMode === 'preview' ? (
              <div className="min-h-[500px] py-4">
                <MarkdownRenderer content={content || "_No content to preview_"} />
              </div>
            ) : editMode === 'visual' ? (
              <RichEditor 
                editor={editor}
                className="min-h-[500px]"
              />
            ) : (
              <Textarea
                ref={textareaRef}
                value={content}
                onChange={handleMarkdownChange}
                placeholder="Edit Markdown..."
                className="w-full border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-sm leading-relaxed min-h-[500px] resize-none overflow-hidden"
              />
            )}
          </div>
        </div>

        <div className="p-4 bg-card border-t flex justify-between items-center px-10">
          <div className="flex items-center gap-6">
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
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (note) {
                  onDelete(note);
                  onClose();
                }
              }} 
              className="rounded-full h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Move to trash"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          
          <Button onClick={() => performSave(true)} className="rounded-lg px-8 font-bold text-sm bg-primary hover:bg-primary/90">
            Complete Review
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
