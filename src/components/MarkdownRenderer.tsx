"use client"

import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cn } from '@/lib/utils';
import { Check, Copy, Info, Clock, Layers, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseNoteFormat } from '@/lib/note-parser';
import { Badge } from '@/components/ui/badge';

const modernDarkTheme: any = {
  'code[class*="language-"]': { color: '#e1e4e8', fontFamily: 'monospace', lineHeight: '1.6' },
  'pre[class*="language-"]': { color: '#e1e4e8', background: 'transparent' },
  'comment': { color: '#8b949e', fontStyle: 'italic' },
  'keyword': { color: '#ff7b72', fontWeight: 'bold' },
  'string': { color: '#a5d6ff' },
  'function': { color: '#d2a8ff' },
  'operator': { color: '#ff7b72' },
};

const CodeBlock = memo(({ language, codeString }: { language: string; codeString: string }) => {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0d0d0d] shadow-sm">
        <div className="p-5 font-mono text-[13px] whitespace-pre text-white/40">{codeString}</div>
      </div>
    );
  }

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-white/5 bg-[#0d0d0d] shadow-2xl group relative google-shadow">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/5">
        <span className="text-[9px] uppercase font-black tracking-[0.2em] text-white/30">
          {language ? language.toUpperCase() : 'SOURCE CODE'}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md hover:bg-white/10" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3 text-white/20" />}
        </Button>
      </div>
      <div className="p-5 font-mono text-[13px] overflow-x-auto text-white/90">
        <SyntaxHighlighter
          language={language || 'text'}
          style={modernDarkTheme}
          PreTag="div"
          className="!m-0 !p-0 !bg-transparent"
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  hideMetadata?: boolean;
}

export function MarkdownRenderer({ content, className, hideMetadata = false }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className={cn("opacity-0", className)}>{content}</div>;
  }

  const parsed = parseNoteFormat(content);
  const displayContent = parsed.isStructured ? parsed.displayContent : content;

  return (
    <div className={cn(
      "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      className
    )}>
      {parsed.isStructured && !hideMetadata && (
        <div className="not-prose mb-8 p-6 rounded-2xl bg-secondary/30 border border-border/50 grid grid-cols-2 sm:grid-cols-4 gap-6 text-[11px] google-shadow-sm">
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <Info className="h-3 w-3" /> Status
            </span>
            <Badge variant="outline" className="text-[9px] font-bold bg-background/50 capitalize border-primary/20 text-primary">{parsed.status}</Badge>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <Layers className="h-3 w-3" /> Category
            </span>
            <p className="font-bold text-foreground/80">{parsed.category}</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <Clock className="h-3 w-3" /> Recorded
            </span>
            <p className="font-bold text-foreground/80">{parsed.created}</p>
          </div>
          <div className="space-y-1.5">
            <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 opacity-60">
              <FileText className="h-3 w-3" /> Type
            </span>
            <p className="font-bold text-foreground/80">{parsed.type}</p>
          </div>
        </div>
      )}

      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          div: ({ children, className }) => <div className={cn("mb-4 leading-relaxed text-foreground/85", className)}>{children}</div>,
          p: ({ children }) => <div className="mb-4 leading-relaxed text-foreground/85">{children}</div>,
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 bg-primary/5 py-2 px-6 rounded-r-lg italic my-6 text-foreground/70">{children}</blockquote>,
          input: ({ type, checked }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="h-4 w-4 rounded border-primary text-primary accent-primary mr-2 align-middle cursor-default pointer-events-none"
                />
              );
            }
            return null;
          },
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            
            if (inline) {
              return (
                <code className="bg-[#202124] text-[#e8eaed] px-1.5 py-0.5 rounded-md font-mono text-[0.9em] font-medium dark:bg-[#1a1b1e] dark:text-[#9aa0a6]" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock 
                language={language} 
                codeString={codeString} 
              />
            );
          }
        }}
      >
        {displayContent}
      </ReactMarkdown>
    </div>
  );
}
