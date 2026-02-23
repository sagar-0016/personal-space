"use client"

import React, { useEffect, useState, useCallback } from 'react';
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
  Minus, 
  Quote, 
  Code2, 
  Terminal, 
  Table as TableIcon, 
  Image as ImageIcon,
  Link as LinkIcon,
  Undo,
  Redo,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const lowlight = createLowlight(common);

interface RichEditorProps {
  content: string;
  onChange: (markdown: string) => void;
  placeholder?: string;
  className?: string;
  showToolbar?: boolean;
}

export function RichEditor({ content, onChange, placeholder = "Start typing...", className, showToolbar = true }: RichEditorProps) {
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
        bulletListMarker: '-',
        linkify: true,
        breaks: true,
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
          "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground/90",
          "prose-p:leading-relaxed prose-p:text-foreground/80",
          "prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic",
          // HIGH-FIDELITY INLINE CODE (Matches User Reference Image)
          "prose-code:bg-[#202124] prose-code:text-[#e8eaed] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[0.9em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-[#1a1b1e] dark:prose-code:text-[#9aa0a6]",
          // FENCED CODE BLOCK (Matches User Reference Image)
          "prose-pre:bg-[#0d0d0d] prose-pre:border prose-pre:border-white/5 prose-pre:rounded-xl prose-pre:p-0 prose-pre:overflow-hidden prose-pre:shadow-2xl",
          "prose-pre:before:content-['SOURCE_CODE'] prose-pre:before:block prose-pre:before:px-4 prose-pre:before:py-2 prose-pre:before:border-b prose-pre:before:border-white/5 prose-pre:before:bg-white/5 prose-pre:before:text-[9px] prose-pre:before:font-black prose-pre:before:tracking-[0.2em] prose-pre:before:text-white/20",
          "prose-pre:code:block prose-pre:code:p-4 prose-pre:code:bg-transparent prose-pre:code:text-white/80 prose-pre:code:text-[13px] prose-pre:code:leading-relaxed",
          "prose-img:rounded-xl prose-img:google-shadow",
          "prose-hr:border-muted-foreground/20",
          "[&_ul_li_input]:mr-2 [&_ul_li_input]:accent-primary",
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

  const handleSmartToggle = useCallback((type: string, options?: any) => {
    if (!editor) return;
    const isActive = editor.isActive(type, options);
    if (isActive) {
      const { from, to } = editor.state.selection;
      if (from === to) {
        // Intelligent "Jump Out" behavior
        editor.chain().focus().unsetMark(type).insertContent(' ').run();
      } else {
        editor.chain().focus().toggleMark(type, options).run();
      }
    } else {
      editor.chain().focus().toggleMark(type, options).run();
    }
  }, [editor]);

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
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 rounded-md transition-all duration-200",
            active ? "bg-primary/15 text-primary shadow-inner" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
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
              onClick={() => handleSmartToggle('bold')} 
              active={editor.isActive('bold')}
              icon={Bold}
              tooltip="Bold"
            />
            <ToolbarButton 
              onClick={() => handleSmartToggle('italic')} 
              active={editor.isActive('italic')}
              icon={Italic}
              tooltip="Italic"
            />
            <ToolbarButton 
              onClick={() => handleSmartToggle('strike')} 
              active={editor.isActive('strike')}
              icon={Strikethrough}
              tooltip="Strikethrough"
            />
            <ToolbarButton 
              onClick={() => handleSmartToggle('code')} 
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                  Advanced <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 google-shadow border-none rounded-xl">
                <DropdownMenuItem onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
                  <TableIcon className="h-4 w-4 mr-2" /> Comparison Table
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
                  <Terminal className="h-4 w-4 mr-2" /> Fenced Code Block
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  const url = window.prompt('Enter image URL:');
                  if (url) editor.chain().focus().setImage({ src: url }).run();
                }}>
                  <ImageIcon className="h-4 w-4 mr-2" /> Insert Image
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().setHorizontalRule().run()}>
                  <Minus className="h-4 w-4 mr-2" /> Horizontal Rule
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor.chain().focus().insertContent('<details><summary>Title</summary>Content</details>').run()}>
                  <ChevronDown className="h-4 w-4 mr-2" /> Collapsible Section
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex-1" />
            <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} tooltip="Undo" />
            <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} tooltip="Redo" />
          </div>
        </TooltipProvider>
      )}
      <EditorContent editor={editor} className="flex-1" />
    </div>
  );
}