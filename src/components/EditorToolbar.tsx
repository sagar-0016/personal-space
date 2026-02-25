"use client"

import React from 'react';
import { Editor } from '@tiptap/react';
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
  Table as TableIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { MetadataEditor } from './MetadataEditor';
import { cn } from '@/lib/utils';

interface EditorToolbarProps {
  editor: Editor | null;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  metadata: string;
  onMetadataChange: (metadata: string) => void;
  onContentChange?: (content: string) => void;
}

export function EditorToolbar({ 
  editor, 
  textareaRef, 
  metadata, 
  onMetadataChange,
  onContentChange 
}: EditorToolbarProps) {

  const handleMarkdownAction = (prefix: string, suffix: string = '') => {
    if (!textareaRef?.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);
    const beforeText = text.substring(0, start);
    const afterText = text.substring(end);

    const newText = beforeText + prefix + selectedText + suffix + afterText;
    onContentChange?.(newText);
    
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 0);
  };

  const ToolbarButton = ({ onClick, active = false, icon: Icon, tooltip }: any) => (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost" 
            size="icon"
            className={cn("h-8 w-8", active ? "bg-primary/10 text-primary" : "text-muted-foreground")}
            onMouseDown={(e) => {
              // Using onMouseDown + preventDefault is critical to avoid focus loss in the editor
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
    <div className="flex flex-wrap items-center gap-1 p-1 border-b bg-background sticky top-0 z-[30] min-h-[44px]">
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 1 }).run() : handleMarkdownAction('# ', '')} 
        active={editor?.isActive('heading', { level: 1 })} 
        icon={Heading1} 
        tooltip="Heading 1" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 2 }).run() : handleMarkdownAction('## ', '')} 
        active={editor?.isActive('heading', { level: 2 })} 
        icon={Heading2} 
        tooltip="Heading 2" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleHeading({ level: 3 }).run() : handleMarkdownAction('### ', '')} 
        active={editor?.isActive('heading', { level: 3 })} 
        icon={Heading3} 
        tooltip="Heading 3" 
      />
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleBold().run() : handleMarkdownAction('**', '**')} 
        active={editor?.isActive('bold')} 
        icon={Bold} 
        tooltip="Bold" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleItalic().run() : handleMarkdownAction('_', '_')} 
        active={editor?.isActive('italic')} 
        icon={Italic} 
        tooltip="Italic" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleStrike().run() : handleMarkdownAction('~~', '~~')} 
        active={editor?.isActive('strike')} 
        icon={Strikethrough} 
        tooltip="Strikethrough" 
      />
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleBulletList().run() : handleMarkdownAction('- ', '')} 
        active={editor?.isActive('bulletList')} 
        icon={List} 
        tooltip="Bullet List" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleOrderedList().run() : handleMarkdownAction('1. ', '')} 
        active={editor?.isActive('orderedList')} 
        icon={ListOrdered} 
        tooltip="Numbered List" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleTaskList().run() : handleMarkdownAction('- [ ] ', '')} 
        active={editor?.isActive('taskList')} 
        icon={CheckSquare} 
        tooltip="Task List" 
      />
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleCodeBlock().run() : handleMarkdownAction('```\n', '\n```')} 
        active={editor?.isActive('codeBlock')} 
        icon={Terminal} 
        tooltip="Code Block" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleCode().run() : handleMarkdownAction('`', '`')} 
        active={editor?.isActive('code')} 
        icon={Code2} 
        tooltip="Inline Code" 
      />
      <ToolbarButton 
        onClick={() => editor ? editor.chain().focus().toggleBlockquote().run() : handleMarkdownAction('> ', '')} 
        active={editor?.isActive('blockquote')} 
        icon={Quote} 
        tooltip="Blockquote" 
      />
      
      {editor && (
        <ToolbarButton 
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
          icon={TableIcon} 
          tooltip="Insert Table" 
          active={editor.isActive('table')} 
        />
      )}
      
      <div className="w-px h-4 bg-border mx-1" />
      
      <MetadataEditor 
        metadata={metadata} 
        onMetadataChange={onMetadataChange} 
      />

      <div className="flex-1" />
      
      {editor && (
        <>
          <ToolbarButton onClick={() => editor.chain().focus().undo().run()} icon={Undo} tooltip="Undo" />
          <ToolbarButton onClick={() => editor.chain().focus().redo().run()} icon={Redo} tooltip="Redo" />
        </>
      )}
    </div>
  );
}
