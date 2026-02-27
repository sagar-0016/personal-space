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
 * Improved to handle standard YAML list syntax and robust tag extraction.
 */
export function extractMetadataInfo(metadata: string | undefined): NoteMetadataInfo {
  if (!metadata) return { title: null, project: null, labels: [], tags: [] };

  const getMatch = (key: string) => {
    // Matches key: "value" or key: value
    const regex = new RegExp(`^${key}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\n\\r]*))`, 'm');
    const match = metadata.match(regex);
    if (match) return (match[1] || match[2] || match[3] || "").trim();
    return null;
  };

  const getListMatch = (key: string) => {
    // Matches key: ["a", "b"] or key: a, b
    const bracketRegex = new RegExp(`^${key}:\\s*\\[(.*)\\]`, 'm');
    const simpleRegex = new RegExp(`^${key}:\\s*([^\\n\\r\\[]*)`, 'm');
    
    const bracketMatch = metadata.match(bracketRegex);
    if (bracketMatch) {
      const raw = bracketMatch[1];
      if (!raw) return [];
      return raw.split(',')
        .map(t => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    const simpleMatch = metadata.match(simpleRegex);
    if (simpleMatch) {
      const raw = simpleMatch[1];
      if (!raw) return [];
      // Handle comma-separated list or just one value
      return raw.split(',')
        .map(t => t.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    return [];
  };

  return {
    title: getMatch('title'),
    project: getMatch('project'),
    labels: getListMatch('labels'),
    tags: getListMatch('tags')
  };
}

/**
 * Updates a YAML metadata string with new values for specific fields.
 */
export function updateMetadataWithInfo(currentMetadata: string, updates: Partial<NoteMetadataInfo>): string {
  let lines = (currentMetadata || "").split('\n');
  
  const updateLine = (key: string, value: string | string[]) => {
    const index = lines.findIndex(l => l.trim().startsWith(`${key}:`));
    let formattedValue = '';
    
    if (Array.isArray(value)) {
      // Always store as a clean YAML bracketed list for predictability
      formattedValue = `[${value.map(v => `"${v}"`).join(', ')}]`;
    } else {
      formattedValue = `"${value || ''}"`;
    }

    if (index !== -1) {
      lines[index] = `${key}: ${formattedValue}`;
    } else {
      lines.push(`${key}: ${formattedValue}`);
    }
  };

  if (updates.title !== undefined) updateLine('title', updates.title || '');
  if (updates.project !== undefined) updateLine('project', updates.project || '');
  if (updates.labels !== undefined) updateLine('labels', updates.labels || []);
  if (updates.tags !== undefined) updateLine('tags', updates.tags || []);

  return lines.filter(l => l.trim() !== "").join('\n');
}

/**
 * Utility to generate a basic metadata block if none exists.
 */
export function generateDefaultMetadata(title: string): string {
  return `title: "${title}"\nproject: ""\nlabels: []\ntags: []\nstatus: "draft"`;
}
