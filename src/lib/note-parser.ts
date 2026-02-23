/**
 * Utility to parse and stringify structured markdown with YAML frontmatter.
 * Specifically handles the format:
 * ---
 * title: "..."
 * category: "..."
 * tags: ["...", "..."]
 * created: YYYY-MM-DD
 * updated: YYYY-MM-DD
 * type: "..."
 * status: "..."
 * ---
 * ## Context
 * ...
 */

export interface NoteMetadata {
  title: string | null;
  category: string;
  tags: string[];
  created: string;
  updated: string;
  type: string;
  status: string;
}

export interface ParsedNote extends NoteMetadata {
  displayContent: string;
  isStructured: boolean;
}

export function parseNoteFormat(content: string): ParsedNote {
  // Regex to match YAML frontmatter block
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  const defaultMetadata: NoteMetadata = {
    title: null,
    category: 'tech',
    tags: [],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    type: 'note',
    status: 'draft'
  };

  if (!match) {
    return { ...defaultMetadata, displayContent: content, isStructured: false };
  }

  const yaml = match[1];
  const body = match[2];

  // Verify the required '## Context' header exists in the body
  if (!body.includes('## Context')) {
    return { ...defaultMetadata, displayContent: content, isStructured: false };
  }

  // Extract metadata fields from YAML
  const titleMatch = yaml.match(/title:\s*["'](.+?)["']/);
  const categoryMatch = yaml.match(/category:\s*["'](.+?)["']/);
  const typeMatch = yaml.match(/type:\s*["'](.+?)["']/);
  const statusMatch = yaml.match(/status:\s*["'](.+?)["']/);
  const createdMatch = yaml.match(/created:\s*([\d-]+)/);
  const updatedMatch = yaml.match(/updated:\s*([\d-]+)/);
  
  const tagsMatch = yaml.match(/tags:\s*\[([\s\S]*?)\]/);
  let tags: string[] = [];
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/["']/g, ''))
      .filter(tag => tag.length > 0);
  }

  return {
    title: titleMatch ? titleMatch[1] : null,
    category: categoryMatch ? categoryMatch[1] : 'tech',
    tags: tags,
    created: createdMatch ? createdMatch[1] : defaultMetadata.created,
    updated: updatedMatch ? updatedMatch[1] : defaultMetadata.updated,
    type: typeMatch ? typeMatch[1] : 'note',
    status: statusMatch ? statusMatch[1] : 'draft',
    displayContent: body.trim(),
    isStructured: true
  };
}

export function stringifyNote(parsed: ParsedNote): string {
  const yaml = [
    '---',
    `title: "${parsed.title || 'Untitled Note'}"`,
    `category: "${parsed.category}"`,
    `tags: [${parsed.tags.map(t => `"${t}"`).join(', ')}]`,
    `created: ${parsed.created}`,
    `updated: ${new Date().toISOString().split('T')[0]}`,
    `type: "${parsed.type}"`,
    `status: "${parsed.status}"`,
    '---',
    '',
    parsed.displayContent.startsWith('## Context') ? parsed.displayContent : `## Context\n\n${parsed.displayContent}`
  ].join('\n');
  
  return yaml;
}
