
"use client"

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
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
  Minus, 
  Quote, 
  Code2, 
  Terminal, 
  Table as TableIcon, 
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export function RichEditor({ content, onChange, placeholder = "Start typing...", className, showToolbar = true }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use a better one or just stick to basics
        dropcursor: { color: 'hsl(var(--primary))', width: 2 },
      }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Image,
      Link.configure({ openOnClick: false }),
      Markdown.configure({
        html: true,
        tightLists: true,
        tightListClass: 'tight',
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base dark:prose-invert max-w-none focus:outline-none min-h-[200px] py-4",
          "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground/90",
          "prose-p:leading-relaxed prose-p:text-foreground/80",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic",
          "prose-code:bg-primary/15 prose-code:text-primary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none",
          "prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50 prose-pre:rounded-xl prose-pre:p-4",
          "prose-img:rounded-xl prose-img:google-shadow",
          "prose-hr:border-muted-foreground/20",
          "prose-table:border prose-table:rounded-lg prose-table:overflow-hidden prose-th:bg-muted/50 prose-td:border-border/50",
          "[&_ul_li_input]:mr-2 [&_ul_li_input]:accent-primary",
          className
        ),
      },
    },
  });

  // Keep content in sync if it changes externally (e.g. initial load or modal open)
  useEffect(() => {
    if (editor && content !== editor.storage.markdown.getMarkdown()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  if (!editor) return null;

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md transition-all duration-200",
            active ? "bg-primary/10 text-primary shadow-inner" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick();
          }}
        >
          <Icon className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs">{tooltip}</TooltipContent>
    </Tooltip>
  );

  return (
    <div className="flex flex-col w-full h-full">
      {showToolbar && (
        <TooltipProvider delayDuration={400}>
          <div className="flex flex-wrap items-center gap-0.5 p-1 border-b bg-background/50 backdrop-blur-sm sticky top-0 z-20 mb-2">
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
            
            <div className="w-px h-4 bg-border/40 mx-1" />
            
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
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleCode().run()} 
              active={editor.isActive('code')}
              icon={Code2}
              tooltip="Inline Code"
            />

            <div className="w-px h-4 bg-border/40 mx-1" />

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
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleBlockquote().run()} 
              active={editor.isActive('blockquote')}
              icon={Quote}
              tooltip="Blockquote"
            />
            
            <div className="w-px h-4 bg-border/40 mx-1" />

            <ToolbarButton 
              onClick={() => editor.chain().focus().setHorizontalRule().run()} 
              icon={Minus}
              tooltip="Horizontal Rule"
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
              icon={TableIcon}
              tooltip="Insert Table"
            />
            <ToolbarButton 
              onClick={() => {
                const url = window.prompt('Enter image URL:');
                if (url) editor.chain().focus().setImage({ src: url }).run();
              }} 
              icon={ImageIcon}
              tooltip="Insert Image"
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().toggleCodeBlock().run()} 
              active={editor.isActive('codeBlock')}
              icon={Terminal}
              tooltip="Code Block"
            />

            <div className="flex-1" />

            <ToolbarButton 
              onClick={() => editor.chain().focus().undo().run()} 
              icon={Undo}
              tooltip="Undo"
            />
            <ToolbarButton 
              onClick={() => editor.chain().focus().redo().run()} 
              icon={Redo}
              tooltip="Redo"
            />
          </div>
        </TooltipProvider>
      )}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}
