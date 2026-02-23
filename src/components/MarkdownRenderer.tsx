"use client"

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import prism from 'react-syntax-highlighter/dist/esm/styles/prism/prism';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseNoteFormat } from '@/lib/note-parser';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highContrastCode?: boolean;
}

export function MarkdownRenderer({ content, className, highContrastCode = false }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if we should strip frontmatter for display
  const parsed = parseNoteFormat(content);
  const contentToRender = parsed.isStructured ? parsed.displayContent : content;

  return (
    <div className={cn(
      "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground/90",
      "prose-p:leading-relaxed prose-p:text-foreground/80",
      "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
      "prose-ul:text-foreground/80 prose-ol:text-foreground/80",
      "prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic",
      "prose-img:rounded-xl prose-img:shadow-lg",
      "prose-hr:border-muted",
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          // Use div for paragraphs to avoid hydration issues with block-level children (like code blocks)
          p: ({ children }) => <div className="mb-4 last:mb-0 leading-relaxed text-foreground/80">{children}</div>,
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || '');
            const language = match ? match[1] : '';
            const codeString = String(children).replace(/\n$/, '');
            const [copied, setCopied] = useState(false);

            const handleCopy = () => {
              navigator.clipboard.writeText(codeString);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            };
            
            if (inline) {
              return (
                <code className="bg-primary/20 text-primary-foreground px-1.5 py-0.5 rounded font-mono text-[0.9em] font-medium" {...props}>
                  {children}
                </code>
              );
            }

            // Only render SyntaxHighlighter on the client to avoid hydration mismatches
            if (!mounted) {
              return (
                <pre className="bg-muted p-4 rounded-lg overflow-hidden">
                  <code className={className}>{children}</code>
                </pre>
              );
            }

            return (
              <div className={cn(
                "my-6 overflow-hidden rounded-lg border shadow-md group relative transition-colors",
                highContrastCode 
                  ? "border-zinc-800 bg-zinc-950" 
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30"
              )}>
                {/* Header */}
                <div className={cn(
                  "flex items-center justify-between px-4 py-2 border-b",
                  highContrastCode 
                    ? "bg-zinc-900 border-zinc-800" 
                    : "bg-zinc-100/50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800"
                )}>
                  {language ? (
                    <span className={cn(
                      "text-[10px] uppercase font-bold tracking-widest",
                      highContrastCode ? "text-zinc-500" : "text-muted-foreground/60"
                    )}>
                      {language}
                    </span>
                  ) : <span />}
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "h-6 w-6 rounded-md transition-all",
                      highContrastCode ? "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800" : "text-muted-foreground hover:text-foreground hover:bg-zinc-200 dark:hover:bg-zinc-700"
                    )}
                    onClick={handleCopy}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>

                {/* Code Highlighter */}
                <SyntaxHighlighter
                  language={language}
                  style={highContrastCode ? vscDarkPlus : prism}
                  PreTag="div"
                  className="!m-0 !p-4 !bg-transparent font-mono text-sm leading-relaxed"
                  customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    backgroundColor: 'transparent',
                    fontSize: '0.875rem',
                  }}
                  codeTagProps={{
                    style: {
                      fontFamily: 'inherit',
                      backgroundColor: 'transparent',
                    }
                  }}
                  {...props}
                >
                  {codeString}
                </SyntaxHighlighter>
              </div>
            );
          }
        }}
      >
        {contentToRender}
      </ReactMarkdown>
    </div>
  );
}
