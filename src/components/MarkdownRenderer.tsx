
"use client"

import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import { cn } from '@/lib/utils';
import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseNoteFormat } from '@/lib/note-parser';
import { useTheme } from 'next-themes';

// Base styles for the Modern theme
const baseModernStyles: any = {
  'code[class*="language-"]': {
    fontFamily: 'var(--font-code)',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.6',
    tabSize: '4',
    hyphens: 'none',
  },
  'pre[class*="language-"]': {
    fontFamily: 'var(--font-code)',
    direction: 'ltr',
    textAlign: 'left',
    whiteSpace: 'pre',
    wordSpacing: 'normal',
    wordBreak: 'normal',
    lineHeight: '1.6',
    tabSize: '4',
    hyphens: 'none',
    margin: '0',
    overflow: 'auto',
    background: 'transparent',
  },
  'namespace': { opacity: '.7' },
  'bold': { fontWeight: 'bold' },
  'italic': { fontStyle: 'italic' },
};

// Modern Light Theme
const modernLightTheme: any = {
  ...baseModernStyles,
  'code[class*="language-"]': { ...baseModernStyles['code[class*="language-"]'], color: '#24292e' },
  'pre[class*="language-"]': { ...baseModernStyles['pre[class*="language-"]'], color: '#24292e' },
  'comment': { color: '#d23669', fontStyle: 'italic' },
  'punctuation': { color: '#24292e' },
  'property': { color: '#005cc5' },
  'tag': { color: '#005cc5' },
  'boolean': { color: '#d23669' },
  'number': { color: '#005cc5' },
  'selector': { color: '#22863a' },
  'attr-name': { color: '#22863a' },
  'string': { color: '#22863a' },
  'keyword': { color: '#005cc5', fontWeight: 'bold' },
  'function': { color: '#6f42c1' },
  'operator': { color: '#d73a49' },
  'variable': { color: '#e36209' },
};

// Modern Dark Theme
const modernDarkTheme: any = {
  ...baseModernStyles,
  'code[class*="language-"]': { ...baseModernStyles['code[class*="language-"]'], color: '#e1e4e8' },
  'pre[class*="language-"]': { ...baseModernStyles['pre[class*="language-"]'], color: '#e1e4e8' },
  'comment': { color: '#f97583', fontStyle: 'italic' },
  'punctuation': { color: '#e1e4e8' },
  'property': { color: '#79b8ff' },
  'tag': { color: '#79b8ff' },
  'boolean': { color: '#f97583' },
  'number': { color: '#79b8ff' },
  'selector': { color: '#85e89d' },
  'attr-name': { color: '#85e89d' },
  'string': { color: '#85e89d' },
  'keyword': { color: '#79b8ff', fontWeight: 'bold' },
  'function': { color: '#b392f0' },
  'operator': { color: '#f97583' },
  'variable': { color: '#ffab70' },
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highContrastCode?: boolean;
  onContentChange?: (newContent: string) => void;
}

export function MarkdownRenderer({ content, className, highContrastCode = false, onContentChange }: MarkdownRendererProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const parsed = parseNoteFormat(content);
  const contentToRender = parsed.isStructured ? parsed.displayContent : content;
  const isDarkMode = resolvedTheme === 'dark';

  // We use a ref to track the checkbox index during rendering
  const checkboxCounterRef = useRef(0);

  const handleToggleCheckbox = (index: number) => {
    if (!onContentChange) return;

    // Matches GFM checkbox pattern: start of line, optional indentation, list marker, then [ ]
    const checkboxRegex = /^(\s*[-*+]\s+|(?:\d+\.)\s+)\[([ xX])\]/gm;
    
    let count = 0;
    const newContent = content.replace(checkboxRegex, (match, prefix, char) => {
      if (count === index) {
        count++;
        // Toggle: if it's currently checked (x or X), make it unchecked (space)
        const isChecked = char.toLowerCase() === 'x';
        const newChar = isChecked ? ' ' : 'x';
        return `${prefix}[${newChar}]`;
      }
      count++;
      return match;
    });

    onContentChange(newContent);
  };

  // Reset the counter at the start of every render pass
  checkboxCounterRef.current = 0;

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
          // Use div instead of p to avoid hydration nesting errors with block elements
          p: ({ children }) => <div className="mb-4 last:mb-0 leading-relaxed text-foreground/80">{children}</div>,
          input: ({ type, checked, ...props }) => {
            if (type === 'checkbox') {
              const currentIndex = checkboxCounterRef.current++;
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  // Using onClick + preventDefault for controlled state management
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onContentChange) {
                      e.preventDefault();
                      handleToggleCheckbox(currentIndex);
                    }
                  }}
                  readOnly={!onContentChange}
                  className={cn(
                    "cursor-pointer h-4 w-4 rounded border-primary text-primary focus:ring-primary mr-2 align-middle accent-primary transition-all active:scale-90",
                    !onContentChange && "cursor-default opacity-70"
                  )}
                />
              );
            }
            return null;
          },
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
                <code className="bg-primary/20 text-primary-foreground dark:text-primary-foreground px-1.5 py-0.5 rounded font-mono text-[0.9em] font-medium" {...props}>
                  {children}
                </code>
              );
            }

            if (!mounted) {
              return (
                <pre className="bg-muted p-4 rounded-lg overflow-hidden">
                  <code className={className}>{children}</code>
                </pre>
              );
            }

            const activeSyntaxTheme = highContrastCode 
              ? vscDarkPlus 
              : (isDarkMode ? modernDarkTheme : modernLightTheme);

            return (
              <div className={cn(
                "my-6 overflow-hidden rounded-xl border shadow-md group relative transition-all duration-300",
                highContrastCode 
                  ? "border-zinc-800 bg-zinc-950" 
                  : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 backdrop-blur-sm"
              )}>
                <div className={cn(
                  "flex items-center justify-between px-4 py-2 border-b transition-colors",
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
                  ) : null}
                  
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

                <SyntaxHighlighter
                  language={language}
                  style={activeSyntaxTheme}
                  PreTag="div"
                  className="!m-0 !p-5 !bg-transparent font-mono text-[13px] leading-relaxed"
                  customStyle={{
                    margin: 0,
                    padding: '1.25rem',
                    backgroundColor: 'transparent',
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
