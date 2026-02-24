
"use client"

import React, { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '@/lib/utils';
import { Terminal, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';

// High-Fidelity Neon Syntax Theme
const neonTheme: any = {
  'code[class*="language-"]': {
    color: '#e0e0e0',
    background: 'none',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  },
  'pre[class*="language-"]': {
    color: '#e0e0e0',
    background: 'none',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    margin: 0,
    padding: 0,
    overflow: 'initial',
  },
  'keyword': { color: '#ff00ff', fontWeight: 'bold' },
  'string': { color: '#39ff14' },
  'function': { color: '#00ffff' },
  'comment': { color: '#666666', fontStyle: 'italic' },
  'variable': { color: '#ff9900' },
  'number': { color: '#ffff00' },
  'operator': { color: '#ffffff' },
  'punctuation': { color: '#cccccc' },
  'boolean': { color: '#ff00ff' },
  'attr-name': { color: '#00ffff' },
  'attr-value': { color: '#39ff14' },
  'property': { color: '#ff9900' },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false);

  const processedContent = useMemo(() => {
    const trimmed = (content || '').trim();
    if (trimmed.startsWith('{') && trimmed.endsWith('}') && !trimmed.includes('```')) {
      try {
        JSON.parse(trimmed);
        return `\`\`\`json\n${trimmed}\n\`\`\``;
      } catch (e) {
        return content;
      }
    }
    return content;
  }, [content]);

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
            const match = /language-(\w+)/.exec(className || '');
            const lang = match ? match[1] : 'text';
            const codeString = String(children).replace(/\n$/, '');
            
            if (inline) {
              return (
                <span className="inline-block align-middle mx-1 my-0.5 max-w-full">
                  <span className="flex flex-col bg-[#0d0d0d] dark:bg-[#0a0a0b] border border-border/50 rounded-md overflow-hidden shadow-lg group/inline-code">
                    <span className="flex items-center justify-between px-2 py-0.5 bg-[#1a1a1b] border-b border-border/30">
                      <span className="flex items-center gap-1.5">
                        <Terminal className="h-2 w-2 text-primary" />
                        <span className="text-[7px] font-bold uppercase tracking-tighter text-muted-foreground/80">SRC</span>
                      </span>
                      <CopyButton 
                        text={codeString} 
                        className="h-3 w-3 opacity-0 group-hover/inline-code:opacity-100 transition-opacity p-0 bg-transparent border-none" 
                      />
                    </span>
                    <span className="px-2 py-1 overflow-x-auto max-w-[400px] block scrollbar-hide">
                      <SyntaxHighlighter
                        language={lang}
                        style={neonTheme}
                        PreTag="div"
                        CodeTag="code"
                        customStyle={{ fontSize: '0.75rem', lineHeight: '1.2', padding: 0 }}
                      >
                        {codeString}
                      </SyntaxHighlighter>
                    </span>
                  </span>
                </span>
              );
            }

            return (
              <div className="relative my-8 group/code-render block">
                <div className="absolute -top-3 left-4 px-3 py-1 bg-background border border-border/50 rounded-md z-10 flex items-center space-x-2 shadow-lg">
                  <Terminal className="h-3 w-3 text-primary" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground">SOURCE CODE</span>
                </div>
                
                <div className="relative rounded-xl overflow-hidden border border-border/50 bg-[#0d0d0d] dark:bg-[#0a0a0b] shadow-2xl transition-all duration-300 block">
                  <div className="absolute top-3 right-3 z-20 opacity-0 group-hover/code-render:opacity-100 transition-opacity">
                    <CopyButton text={codeString} />
                  </div>
                  
                  <div className="p-6 pt-10 overflow-x-auto block">
                    <SyntaxHighlighter
                      language={lang}
                      style={neonTheme}
                      PreTag="div"
                      CodeTag="code"
                      customStyle={{ fontSize: '0.875rem', lineHeight: '1.6', padding: 0 }}
                    >
                      {codeString}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            );
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}

function CopyButton({ text, className }: { text: string, className?: string }) {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
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
        "h-7 w-7 bg-muted/20 hover:bg-muted/40 opacity-60 hover:opacity-100 rounded-md border border-border/30",
        className
      )}
    >
      {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3 text-white" />}
    </Button>
  );
}
