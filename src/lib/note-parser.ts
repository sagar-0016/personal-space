
/**
 * Simplified metadata parser that strictly extracts indexing fields 
 * from a standalone YAML metadata block.
 */

export interface NoteMetadataInfo {
  title: string | null;
  tags: string[];
}

/**
 * Extracts key fields from a raw YAML metadata string.
 * This does NOT modify the string, ensuring data integrity.
 */
export function extractMetadataInfo(metadata: string | undefined): NoteMetadataInfo {
  if (!metadata) return { title: null, tags: [] };

  // Improved extraction logic for YAML-like formats
  const titleMatch = metadata.match(/title:\s*(?:"(.*?)"|(.*))/);
  const tagsMatch = metadata.match(/tags:\s*\[(.*?)\]/);
  
  const title = titleMatch ? (titleMatch[1] || titleMatch[2]?.trim()) : null;
  const tagsRaw = tagsMatch ? tagsMatch[1] : "";
  const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim().replace(/"/g, '')) : [];

  return { title, tags };
}

/**
 * Utility to generate a basic metadata block if none exists.
 */
export function generateDefaultMetadata(title: string): string {
  return `title: "${title}"\ntags: []\ncategory: "general"\nstatus: "draft"`;
}
