"use client"

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import { Terminal, Copy, Check, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("opacity-0", className)}>{content}</div>;
  }

  return (
    <div className={cn(
      "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          div: ({ children, className }) => <div className={cn("mb-4", className)}>{children}</div>,
          p: ({ children }) => <div className="mb-4 leading-relaxed text-foreground/85">{children}</div>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 bg-primary/5 py-2 px-6 rounded-r-lg italic my-6">{children}</blockquote>,
          code({ node, inline, className, children, ...props }: any) {
            const codeString = String(children).replace(/\n$/, '');
            
            if (inline) {
              return (
                <span className="relative group/inline-code inline-block mx-1">
                  <span className="absolute -top-7 left-0 px-2 py-0.5 bg-[#1a1b1e] border border-white/10 rounded-md z-10 flex items-center space-x-1 shadow-xl opacity-0 group-hover/inline-code:opacity-100 transition-opacity">
                    <Code2 className="h-2.5 w-2.5 text-primary" />
                    <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/90 whitespace-nowrap">Inline Code</span>
                    <CopyButton text={codeString} className="ml-2 h-4 w-4" />
                  </span>
                  <code className="px-1.5 py-0.5 rounded bg-[#0d0d0d] border border-white/5 font-mono text-xs text-primary" {...props}>
                    {children}
                  </code>
                </span>
              );
            }

            return (
              <div className="relative my-8 group/code-render">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-[#1a1b1e] border border-white/10 rounded-md z-10 flex items-center space-x-2 shadow-xl">
                  <Terminal className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/90">Source Code</span>
                </div>
                
                <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0d0d0d] shadow-2xl">
                  <div className="absolute top-3 right-3 opacity-0 group-hover/code-render:opacity-100 transition-opacity">
                    <CopyButton text={codeString} />
                  </div>
                  
                  <pre className="p-6 pt-8 font-mono text-sm leading-relaxed overflow-x-auto text-[#e1e4e8]">
                    <code>{codeString}</code>
                  </pre>
                </div>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

function CopyButton({ text, className }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleCopy}
      className={cn(
        "h-7 w-7 bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-md border border-white/5",
        className
      )}
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}
