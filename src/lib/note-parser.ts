/**
 * Utility to parse structured markdown with YAML frontmatter.
 * Specifically handles the format:
 * ---
 * title: "..."
 * tags: ["...", "..."]
 * ---
 * ## Context
 * ...
 */

export interface ParsedNote {
  title: string | null;
  labels: string[];
  displayContent: string;
  isStructured: boolean;
}

export function parseNoteFormat(content: string): ParsedNote {
  // Regex to match YAML frontmatter block
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (!match) {
    return { title: null, labels: [], displayContent: content, isStructured: false };
  }

  const yaml = match[1];
  const body = match[2];

  // Verify the required '## Context' header exists in the body
  if (!body.includes('## Context')) {
    return { title: null, labels: [], displayContent: content, isStructured: false };
  }

  // Extract title: title: "..." or title: '...'
  const titleMatch = yaml.match(/title:\s*["'](.+?)["']/);
  const title = titleMatch ? titleMatch[1] : null;

  // Extract tags: tags: ["tag1", "tag2"]
  const tagsMatch = yaml.match(/tags:\s*\[([\s\S]*?)\]/);
  let labels: string[] = [];
  if (tagsMatch) {
    labels = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/["']/g, ''))
      .filter(tag => tag.length > 0);
  }

  // The main content starts from the '## Context' header
  const contextIndex = body.indexOf('## Context');
  const displayContent = contextIndex !== -1 ? body.substring(contextIndex) : body;

  return {
    title,
    labels,
    displayContent,
    isStructured: true
  };
}
