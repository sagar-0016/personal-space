/**
 * Note parser that strictly separates the metadata block from the content.
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
    const rawMetadataContent = match[1];
    const displayContent = content.replace(metadataRegex, '').trim();
    
    // Simple extraction for title and tags from the raw metadata string
    const titleMatch = rawMetadataContent.match(/title:\s*"(.*?)"/);
    const tagsMatch = rawMetadataContent.match(/tags:\s*\[(.*?)\]/);
    
    const title = titleMatch ? titleMatch[1] : null;
    const tagsRaw = tagsMatch ? tagsMatch[1] : "";
    const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().replace(/"/g, '')) : [];

    return {
      title,
      category: 'tech',
      tags,
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      type: 'note',
      status: 'draft',
      rawMetadata: `---\n${rawMetadataContent}\n---`,
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