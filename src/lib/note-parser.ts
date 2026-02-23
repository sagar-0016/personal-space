/**
 * Simplified note parser to remove "filtering" logic while we stabilize visuals.
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
  // For now, return raw content as requested to "remove the filter"
  return {
    title: null,
    category: 'tech',
    tags: [],
    created: new Date().toISOString().split('T')[0],
    updated: new Date().toISOString().split('T')[0],
    type: 'note',
    status: 'draft',
    displayContent: content,
    isStructured: false
  };
}

export function stringifyNote(parsed: ParsedNote): string {
  // Just return the content for now
  return parsed.displayContent;
}
