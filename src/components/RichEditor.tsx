"use client"

import React, { useEffect, useState } from 'react';
import { EditorContent, NodeViewWrapper, Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Copy, 
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CodeBlockComponent = ({ node }: any) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative my-8 group/code">
      <div className="absolute -top-3 left-4 px-3 py-1 bg-background border border-border/50 rounded-md z-10 flex items-center space-x-2 shadow-lg">
        <Terminal className="h-3 w-3 text-primary" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-80 text-foreground">SOURCE CODE</span>
      </div>
      
      <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[hsl(var(--code-bg))] shadow-xl">
        <div className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7 bg-muted/40 hover:bg-muted opacity-60 hover:opacity-100 rounded-md border border-border/50"
          >
            {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        
        <pre className="p-6 pt-10 font-mono text-sm leading-relaxed overflow-x-auto neon-code-text">
          <code className="outline-none block min-h-[1em]">{node.textContent}</code>
        </pre>
      </div>
    </NodeViewWrapper>
  );
};

interface RichEditorProps {
  editor: Editor | null;
  className?: string;
}

/**
 * RichEditor - Optimized for consolidated scrolling.
 */
export function RichEditor({ 
  editor, 
  className 
}: RichEditorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !editor) return null;

  return (
    <div className={cn("relative w-full", className)}>
      <style jsx global>{`
        .ProseMirror code:not(pre code) {
          background-color: #0d0d0d !important;
          color: rgba(255, 255, 255, 0.9) !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.375rem !important;
          border: 1px solid hsl(var(--primary) / 0.3) !important;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace !important;
          font-size: 0.85em !important;
          box-shadow: 0 0 0 1px hsl(var(--primary) / 0.1), 0 1px 2px rgba(0, 0, 0, 0.2) !important;
        }
      `}</style>
      <EditorContent editor={editor} />
    </div>
  );
}
