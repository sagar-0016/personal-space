"use client"

import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RichEditor } from './RichEditor';
import { Textarea } from '@/components/ui/textarea';
import { generateDefaultMetadata } from '@/lib/note-parser';
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
import { MarkdownRenderer } from './MarkdownRenderer';

const lowlight = createLowlight(common);

interface CreateNoteProps {
  onSave: (note: { title: string; content: string; metadata: string; isPinned: boolean; isArchived?: boolean }) => void;
}

export function CreateNote({ onSave }: CreateNoteProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [metadata, setMetadata] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [editMode, setEditMode] = useState<'preview' | 'visual' | 'markdown'>('preview');
  
  const containerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Placeholder.configure({ placeholder: "Take a visual note..." }),
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
        class: "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[120px] py-4",
      },
    },
  });

  useEffect(() => {
    if (editor && editMode === 'visual' && editor.storage.markdown) {
      const currentMarkdown = (editor.storage.markdown as any).getMarkdown();
      if (content !== currentMarkdown) {
        editor.commands.setContent(content, false);
      }
    }
  }, [editMode, content, editor]);

  // Auto-resize textarea for a seamless Markdown experience
  useEffect(() => {
    if (editMode === 'markdown' && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content, editMode]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (target.closest('[data-metadata-popover="true"]')) return;

      if (containerRef.current && !containerRef.current.contains(target)) {
        if (title.trim() || content.trim()) {
          handleSave();
        } else {
          setIsExpanded(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [title, content, isPinned, metadata]);

  const handleSave = () => {
    if (title.trim() || content.trim()) {
      const finalMetadata = metadata || generateDefaultMetadata(title || 'Untitled');
      onSave({ title, content, metadata: finalMetadata, isPinned });
    }
    setTitle('');
    setContent('');
    setMetadata('');
    setIsPinned(false);
    setIsExpanded(false);
    setEditMode('preview');
  };

  const handleClose = () => {
    if (title.trim() || content.trim()) {
      handleSave();
    } else {
      setIsExpanded(false);
      setTitle('');
      setContent('');
      setMetadata('');
      setIsPinned(false);
      setEditMode('preview');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 px-4" ref={containerRef}>
      <Card className={cn(
        "transition-all duration-300 google-shadow border border-border/40 bg-card/80 backdrop-blur-md overflow-hidden rounded-xl",
        isExpanded ? "p-0" : "p-1"
      )}>
        {!isExpanded ? (
          <div className="flex items-center px-6 py-4 cursor-text" onClick={() => setIsExpanded(true)}>
            <span className="text-muted-foreground/60 font-medium flex-1 text-sm sm:text-base">Take a visual note...</span>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" className="h-9 w-9 opacity-40 hover:bg-primary/10 hover:text-primary transition-all rounded-full">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col note-fade-in">
            <div className="flex items-center justify-between px-6 pt-5 pb-2">
              <Input
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 outline-none text-xl sm:text-2xl font-bold px-0 bg-transparent placeholder:text-muted-foreground/30 transition-all"
                autoFocus
              />
              <div className="flex items-center space-x-1">
                <div className="flex items-center bg-secondary/30 rounded-lg p-1 mr-2">
                  <Button 
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMode('preview')}
                    className={cn(
                      "h-7 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all",
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
                      "h-7 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all",
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
                      "h-7 px-3 text-[10px] font-bold uppercase tracking-tighter transition-all",
                      editMode === 'markdown' ? "bg-primary text-primary-foreground shadow-sm" : "hover:bg-primary/10 hover:text-primary"
                    )}
                  >
                    Markdown Editor
                  </Button>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setIsPinned(!isPinned)}
                  className={cn("h-10 w-10 rounded-full transition-all", isPinned ? "text-primary bg-primary/5" : "text-muted-foreground/40")}
                >
                  <Pin className={cn("h-5 w-5", isPinned && "fill-current")} />
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

            <div className="px-6 py-2">
              {editMode === 'preview' ? (
                <div className="min-h-[120px] py-4">
                  <MarkdownRenderer content={content || "_No content to preview_"} />
                </div>
              ) : editMode === 'visual' ? (
                <RichEditor 
                  editor={editor}
                  className="min-h-[120px]"
                />
              ) : (
                <Textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Edit Markdown..."
                  className="w-full border-none shadow-none focus-visible:ring-0 px-0 bg-transparent font-mono text-sm leading-relaxed resize-none overflow-hidden"
                />
              )}
            </div>

            <div className="flex justify-end px-6 pb-3 pt-2 border-t border-border/10 bg-secondary/5">
              <Button variant="ghost" onClick={handleClose} className="font-bold text-sm px-8 hover:bg-primary/10 hover:text-primary transition-all">Close</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}