
/**
 * Simplified metadata parser that extracts project hierarchy and indexing fields 
 * from a YAML metadata block.
 */

export interface NoteMetadataInfo {
  title: string | null;
  project: string | null;
  labels: string[];
  tags: string[];
}

/**
 * Extracts key fields from a raw YAML metadata string.
 */
export function extractMetadataInfo(metadata: string | undefined): NoteMetadataInfo {
  if (!metadata) return { title: null, project: null, labels: [], tags: [] };

  // Helper to extract matches for YAML keys
  const getMatch = (key: string) => {
    const regex = new RegExp(`${key}:\\s*(?:"(.*?)"|(.*))`);
    const match = metadata.match(regex);
    return match ? (match[1] || match[2]?.trim()) : null;
  };

  const getListMatch = (key: string) => {
    const regex = new RegExp(`${key}:\\s*\\[(.*?)\\]`);
    const match = metadata.match(regex);
    const raw = match ? match[1] : "";
    return raw ? raw.split(',').map(t => t.trim().replace(/"/g, '').replace(/'/g, '')) : [];
  };

  const title = getMatch('title');
  const project = getMatch('project');
  const labels = getListMatch('labels');
  const tags = getListMatch('tags');

  return { title, project, labels, tags };
}

/**
 * Utility to generate a basic metadata block if none exists.
 */
export function generateDefaultMetadata(title: string): string {
  return `title: "${title}"\nproject: "Personal Space"\nlabels: []\ntags: []\nstatus: "draft"`;
}
