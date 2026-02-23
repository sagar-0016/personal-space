/**
 * Note parser that strictly separates the analytical metadata block from the content.
 */

export interface NoteMetadata {
  title: string | null;
  category: string;
  tags: string[];
  created: string;
  updated: string;
  type: string;
  status: string;
  rawMetadata?: string;
}

export interface ParsedNote extends NoteMetadata {
  displayContent: string;
  isStructured: boolean;
}

export function parseNoteFormat(content: string): ParsedNote {
  const metadataRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(metadataRegex);

  if (match) {
    const rawMetadata = match[1];
    const displayContent = content.replace(metadataRegex, '').trim();
    
    // Simple extraction for title and tags from the raw metadata string
    const titleMatch = rawMetadata.match(/title:\s*"(.*?)"/);
    const tagsMatch = rawMetadata.match(/tags:\s*\[(.*?)\]/);
    
    const title = titleMatch ? titleMatch[1] : null;
    const tags = tagsMatch ? tagsMatch[1].split(',').map(t => t.trim().replace(/"/g, '')) : [];

    return {
      title,
      category: 'tech',
      tags,
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      type: 'note',
      status: 'draft',
      rawMetadata: `--- \n${rawMetadata}\n ---`,
      displayContent,
      isStructured: true
    };
  }

  return {
    title: null,
    category: 'tech',
    tags: [],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    type: 'note',
    status: 'draft',
    rawMetadata: '',
    displayContent: content,
    isStructured: false
  };
}

export function stringifyNote(parsed: ParsedNote): string {
  if (parsed.rawMetadata) {
    return `${parsed.rawMetadata}\n\n${parsed.displayContent}`;
  }
  return parsed.displayContent;
}
