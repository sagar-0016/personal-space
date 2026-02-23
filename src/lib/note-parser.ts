/**
 * Simplified note parser that returns raw content to remove filtering logic.
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
  // Return raw content without any extraction or filtering
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
  // Return content exactly as it is
  return parsed.displayContent;
}
