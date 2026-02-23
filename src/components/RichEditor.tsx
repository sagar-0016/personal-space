
"use client"

import React, { useEffect, useState, useCallback, memo } from 'react';
import { useEditor, EditorContent, ReactNodeViewRenderer, NodeViewWrapper, NodeViewContent } from '@tiptap/react';
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
  ChevronDown,
  Copy,
  Check
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

/**
 * Custom NodeView for Code Blocks to match the Home Screen Preview exactly.
 */
const CodeBlockComponent = ({ node, updateAttributes, extension }: any) => {
  const [copied, setCopied] = useState(false);
  const language = node.attrs.language || 'source code';

  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="not-prose my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0d0d0d] shadow-2xl group relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30">
          {language}
        </span>
        <div className="flex items-center space-x-1">
          <select 
            className="text-[9px] uppercase font-bold bg-transparent text-white/20 outline-none cursor-pointer hover:text-white/40 transition-colors mr-2"
            value={language}
            onChange={e => updateAttributes({ language: e.target.value })}
          >
            <option value="javascript">JS</option>
            <option value="typescript">TS</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
            <option value="python">PY</option>
            <option value="markdown">MD</option>
          </select>
          <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/10" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-white/20" />}
          </Button>
        </div>
      </div>
      <pre className="p-4 font-mono text-[13px] overflow-x-auto text-white/80 leading-relaxed">
        <NodeViewContent as="code" />
      </pre>
    </NodeViewWrapper>
  );
};

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
      CodeBlockLowlight.extend({
        addNodeView() {
          return ReactNodeViewRenderer(CodeBlockComponent);
        },
      }).configure({ lowlight }),
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
          // Inline Code: Precise matching of Home screen badge style
          "prose-code:bg-[#202124] prose-code:text-[#e8eaed] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:font-mono prose-code:text-[0.9em] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none dark:prose-code:bg-[#1a1b1e] dark:prose-code:text-[#9aa0a6]",
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary">
                  Advanced <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48 google-shadow border-none rounded-xl p-1 z-[110]">
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
