
/**
 * Utility to parse and stringify structured markdown with custom metadata blocks.
 * Simplified to focus on Title and Tags as primary structured data points.
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
  // Enhanced regex to match the metadata block between --- and ---
  const blockRegex = /^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/;
  const match = content.match(blockRegex);

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

  const metadataStr = match[1];
  const body = match[2];

  // Extract metadata fields respecting trailing backslashes and title syntax
  const titleMatch = metadataStr.match(/##\s*title:\s*["'](.+?)["']/);
  const tagsMatch = metadataStr.match(/tags:\s*\[([\s\S]*?)\]/);
  
  let tags: string[] = [];
  if (tagsMatch) {
    tags = tagsMatch[1]
      .split(',')
      .map(tag => tag.trim().replace(/["']/g, '').replace(/\\$/, ''))
      .filter(tag => tag.length > 0);
  }

  // Preserve other fields forping pinpointing but default to current logic
  const categoryMatch = metadataStr.match(/category:\s*["'](.+?)["']/);
  const typeMatch = metadataStr.match(/type:\s*["'](.+?)["']/);
  const statusMatch = metadataStr.match(/status:\s*["'](.+?)["']/);
  const createdMatch = metadataStr.match(/created:\s*([\d-]+)/);
  const updatedMatch = metadataStr.match(/updated:\s*([\d-]+)/);

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
  const updatedDate = new Date().toISOString().split('T')[0];
  
  // Reconstruct the exact format with backslashes for the metadata block
  const metadataLines = [
    '---',
    '',
    `## title: "${parsed.title || 'Untitled Note'}"\\`,
    `category: "${parsed.category}"\\`,
    `tags: [${parsed.tags.map(t => `"${t}"`).join(', ')}]\\`,
    `created: ${parsed.created}\\`,
    `updated: ${updatedDate}\\`,
    `type: "${parsed.type}"\\`,
    `status: "${parsed.status}"`,
    '---',
    '',
    parsed.displayContent.startsWith('## Context') ? parsed.displayContent : `## Context\n\n${parsed.displayContent}`
  ];
  
  return metadataLines.join('\n');
}
