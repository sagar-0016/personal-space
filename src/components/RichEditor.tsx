"use client"

import React, { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
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
import { cn } from '@/lib/utils';
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3, 
  List, 
  ListOrdered, 
  CheckSquare, 
  Quote, 
  Code2, 
  Terminal, 
  Undo,
  Redo,
  Table as TableIcon,
  Database,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  metadata?: string;
  onMetadataChange?: (metadata: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export function RichEditor({ 
  content, 
  onChange, 
  metadata, 
  onMetadataChange, 
  placeholder = "Start typing...", 
  className, 
  showToolbar = true 
}: RichEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      CodeBlockLowlight.configure({ lowlight }),
      Link.configure({ openOnClick: false }),
      Markdown.configure({
        html: true,
        tightLists: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const markdown = (editor.storage.markdown as any).getMarkdown();
      onChange(markdown);
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] py-4",
          className
        ),
      },
    },
  });

  useEffect(() => {
    if (editor && content !== (editor.storage.markdown as any).getMarkdown()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!mounted || !editor) return null;

  const ToolbarButton = ({ 
    onClick, 
    active = false, 
    icon: Icon, 
    tooltip 
  }: { 
    onClick: () => void; 
    active?: boolean; 
    icon: any; 
    tooltip: string 
  }) => (
    <TooltipProvider delayDuration={400}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              active ? "bg-primary/10 text-primary" : "text-muted-foreground"
            )}
            onClick={(e) => {
              e.preventDefault();
              onClick();
            }}
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top" className="text-xs">{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className="flex flex-col w-full h-full relative">
      {showToolbar && (
        <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-background sticky top-0 z-[30]">
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
            active={editor.isActive('heading', { level: 1 })}
            icon={Heading1}
            tooltip="Heading 1"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
            active={editor.isActive('heading', { level: 2 })}
            icon={Heading2}
            tooltip="Heading 2"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} 
            active={editor.isActive('heading', { level: 3 })}
            icon={Heading3}
            tooltip="Heading 3"
          />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBold().run()} 
            active={editor.isActive('bold')}
            icon={Bold}
            tooltip="Bold"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleItalic().run()} 
            active={editor.isActive('italic')}
            icon={Italic}
            tooltip="Italic"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleStrike().run()} 
            active={editor.isActive('strike')}
            icon={Strikethrough}
            tooltip="Strikethrough"
          />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBulletList().run()} 
            active={editor.isActive('bulletList')}
            icon={List}
            tooltip="Bullet List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleOrderedList().run()} 
            active={editor.isActive('orderedList')}
            icon={ListOrdered}
            tooltip="Numbered List"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleTaskList().run()} 
            active={editor.isActive('taskList')}
            icon={CheckSquare}
            tooltip="Task List"
          />
          <div className="w-px h-4 bg-border mx-1" />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
            active={editor.isActive('codeBlock')}
            icon={Terminal}
            tooltip="Code Block"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleCode().run()} 
            active={editor.isActive('code')}
            icon={Code2}
            tooltip="Inline Code"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().toggleBlockquote().run()} 
            active={editor.isActive('blockquote')}
            icon={Quote}
            tooltip="Blockquote"
          />
          <ToolbarButton 
            onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
            icon={TableIcon}
            tooltip="Insert Table"
            active={editor.isActive('table')}
          />
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Popover modal={false}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-[10px] font-bold uppercase tracking-tighter text-primary bg-primary/5 hover:bg-primary/10 transition-all border border-primary/20"
              >
                <Database className="h-3.5 w-3.5 mr-1.5" />
                Metadata
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="w-[450px] p-4 bg-card shadow-2xl border-primary/20 z-[200] pointer-events-auto" 
              align="end"
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-primary" />
                    Metadata
                  </h4>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="max-w-[250px] text-[10px] leading-relaxed">
                        Enter YAML metadata. The app extracts "title" and "tags" for your note's identity.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="relative group">
                  <Textarea
                    value={metadata || ''}
                    onChange={(e) => onMetadataChange?.(e.target.value)}
                    autoFocus
                    placeholder={`title: "My Note"\ntags: ["tag1"]\n...`}
                    className="min-h-[200px] font-mono text-[11px] bg-secondary/30 resize-none border-none focus-visible:ring-1 leading-relaxed"
                  />
                  <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity pointer-events-none">
                    <code className="text-[9px] bg-background px-1 rounded">YAML</code>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-tight">
                  Formatting: The parser identifies the title and tags fields from this block.
                </p>
              </div>
            </PopoverContent>
          </Popover>

          <div className="flex-1" />
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} tooltip="Undo" />
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} tooltip="Redo" />
        </div>
      )}
      <div className="flex-1 overflow-y-auto px-4">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}