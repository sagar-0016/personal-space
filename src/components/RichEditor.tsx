"use client"

import React, { useEffect, useState } from 'react';
import { EditorContent, ReactNodeViewRenderer, NodeViewWrapper, Editor } from '@tiptap/react';
import { cn } from '@/lib/utils';
import { 
  Terminal, 
  Copy, 
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const CodeBlockComponent = ({ node }: any) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(node.textContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <NodeViewWrapper className="relative my-6 group/code">
      <div className="absolute -top-3 left-4 px-3 py-1 bg-[#1a1b1e] border border-white/10 rounded-md z-10 flex items-center space-x-2 shadow-xl">
        <Terminal className="h-3 w-3 text-primary" />
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">SOURCE CODE</span>
      </div>
      
      <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0d0d0d] shadow-2xl">
        <div className="absolute top-3 right-3 opacity-0 group-hover/code:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-md border border-white/5"
          >
            {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
          </Button>
        </div>
        
        <pre className="p-6 pt-8 font-mono text-sm leading-relaxed overflow-x-auto text-[#e1e4e8]">
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
    <div className={cn("flex-1 overflow-y-auto", className)}>
      <EditorContent editor={editor} />
    </div>
  );
}