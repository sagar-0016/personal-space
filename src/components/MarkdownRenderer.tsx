"use client"

import React, { useState, useEffect, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { cn } from '@/lib/utils';
import { Check, Copy, Info, Clock, Tag as TagIcon, Layers, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { parseNoteFormat } from '@/lib/note-parser';
import { Badge } from '@/components/ui/badge';

const modernLightTheme: any = {
  'code[class*="language-"]': { color: '#24292e', fontFamily: 'var(--font-code)', lineHeight: '1.6' },
  'pre[class*="language-"]': { color: '#24292e', background: 'transparent' },
  'comment': { color: '#6a737d', fontStyle: 'italic' },
  'keyword': { color: '#d73a49', fontWeight: 'bold' },
  'string': { color: '#032f62' },
  'function': { color: '#6f42c1' },
  'operator': { color: '#d73a49' },
};

const modernDarkTheme: any = {
  'code[class*="language-"]': { color: '#e1e4e8', fontFamily: 'var(--font-code)', lineHeight: '1.6' },
  'pre[class*="language-"]': { color: '#e1e4e8', background: 'transparent' },
  'comment': { color: '#8b949e', fontStyle: 'italic' },
  'keyword': { color: '#ff7b72', fontWeight: 'bold' },
  'string': { color: '#a5d6ff' },
  'function': { color: '#d2a8ff' },
  'operator': { color: '#ff7b72' },
};

const CodeBlock = memo(({ language, codeString, isDarkMode }: { language: string; codeString: string; isDarkMode: boolean }) => {
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
      <div className="my-6 overflow-hidden rounded-xl border border-border/50 bg-muted/30 shadow-sm">
        <div className="p-5 font-mono text-[13px] whitespace-pre">{codeString}</div>
      </div>
    );
  }

  const activeSyntaxTheme = isDarkMode ? modernDarkTheme : modernLightTheme;

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/50 bg-muted/30 shadow-sm group relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
          {language || 'source code'}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <div className="p-5 font-mono text-[13px] overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={activeSyntaxTheme}
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
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDarkMode = resolvedTheme === 'dark';

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
          // Use div for paragraphs to avoid hydration nesting issues
          p: ({ children }) => <div className="mb-4 leading-relaxed text-foreground/85">{children}</div>,
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/40 bg-primary/5 py-2 px-6 rounded-r-lg italic my-6">{children}</blockquote>,
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
                <code className="bg-primary/15 text-primary px-1.5 py-0.5 rounded font-mono text-[0.85em] font-medium" {...props}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock 
                language={language} 
                codeString={codeString} 
                isDarkMode={isDarkMode} 
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
