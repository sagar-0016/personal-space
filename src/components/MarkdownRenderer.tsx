
"use client"

import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseNoteFormat } from '@/lib/note-parser';
import { useTheme } from 'next-themes';

// High Fidelity Professional Themes for Code
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

interface CodeBlockProps {
  language: string;
  codeString: string;
  highContrast: boolean;
  isDarkMode: boolean;
}

/**
 * Separate component for code blocks to handle state correctly 
 * and avoid hydration mismatches.
 */
function CodeBlock({ language, codeString, highContrast, isDarkMode }: CodeBlockProps) {
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

  const activeSyntaxTheme = highContrast ? vscDarkPlus : (isDarkMode ? modernDarkTheme : modernLightTheme);

  return (
    <div className="my-6 overflow-hidden rounded-xl border border-border/50 bg-muted/30 shadow-sm group relative">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/50">
        <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
          {language || 'code'}
        </span>
        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md" onClick={handleCopy}>
          {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
        </Button>
      </div>
      <div className="p-5 font-mono text-[13px] overflow-x-auto">
        {mounted ? (
          <SyntaxHighlighter
            language={language}
            style={activeSyntaxTheme}
            PreTag="div"
            className="!m-0 !p-0 !bg-transparent"
            customStyle={{ margin: 0, padding: 0, backgroundColor: 'transparent' }}
          >
            {codeString}
          </SyntaxHighlighter>
        ) : (
          <code className="whitespace-pre">{codeString}</code>
        )}
      </div>
    </div>
  );
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highContrastCode?: boolean;
}

export function MarkdownRenderer({ content, className, highContrastCode = false }: MarkdownRendererProps) {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const parsed = parseNoteFormat(content);

  return (
    <div className={cn(
      "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground/90",
      "prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mb-4 prose-h3:text-xl",
      "prose-a:text-primary prose-a:font-medium hover:prose-a:underline",
      "prose-blockquote:border-l-4 prose-blockquote:border-primary/40 prose-blockquote:bg-primary/5 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg prose-blockquote:italic prose-blockquote:text-foreground/70",
      "prose-table:border prose-table:rounded-lg prose-table:overflow-hidden prose-th:bg-muted/50 prose-th:p-3 prose-td:p-3",
      "prose-img:rounded-xl prose-img:shadow-xl",
      "prose-hr:border-muted-foreground/20 my-8",
      "prose-ul:list-disc prose-ol:list-decimal",
      "prose-li:my-1",
      className
    )}>
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Fix: render paragraph as div to avoid hydration errors when block-level components are nested inside
          p: ({ children }) => <div className="mb-4 leading-relaxed text-foreground/80">{children}</div>,
          
          // Custom pre to avoid nested pre tags or invalid hierarchy
          pre: ({ children }) => <div className="not-prose">{children}</div>,
          
          input: ({ type, checked }) => {
            if (type === 'checkbox') {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  onChange={() => {}} 
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
                highContrast={highContrastCode} 
                isDarkMode={isDarkMode} 
              />
            );
          }
        }}
      >
        {parsed.isStructured ? parsed.displayContent : content}
      </ReactMarkdown>
    </div>
  );
}
