"use client"

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  highContrastCode?: boolean;
}

export function MarkdownRenderer({ content, className, highContrastCode = false }: MarkdownRendererProps) {
  return (
    <div className={cn(
      "prose prose-sm sm:prose-base dark:prose-invert max-w-none",
      highContrastCode ? "code-high-contrast" : "code-theme-aware",
      "prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-foreground/90",
      "prose-p:leading-relaxed prose-p:text-foreground/80",
      "prose-a:text-primary prose-a:font-medium prose-a:no-underline hover:prose-a:underline",
      // Code blocks (pre)
      "prose-pre:p-4 prose-pre:font-mono prose-pre:leading-normal",
      // Lists and other elements
      "prose-ul:text-foreground/80 prose-ol:text-foreground/80",
      "prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:italic",
      "prose-img:rounded-xl prose-img:shadow-lg",
      "prose-hr:border-muted",
      className
    )}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
