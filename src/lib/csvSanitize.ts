import { z } from 'zod';

/** Strip HTML tags, javascript: protocols, and on* event handlers */
function stripHtml(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')                    // remove HTML tags
    .replace(/javascript\s*:/gi, '')            // remove javascript: protocol
    .replace(/\bon\w+\s*=/gi, '')               // remove on* event handlers
    .replace(/\s{2,}/g, ' ')                    // collapse whitespace
    .trim();
}

export const csvRowSchema = z.object({
  korean: z.string().trim().min(1, 'korean is required').max(500).transform(stripHtml),
  english: z.string().trim().min(1, 'english is required').max(500).transform(stripHtml),
  category: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(100).transform(stripHtml).optional()
  ),
  note: z.preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
    z.string().trim().max(1000).transform(stripHtml).optional()
  ),
});

export type SanitizedCsvRow = z.output<typeof csvRowSchema>;

/** Parse a CSV string into an array of row objects keyed by header names */
export function parseCsv(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());
  const rows: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] ?? '';
    });
    rows.push(row);
  }
  return rows;
}

/** Parse a single CSV line respecting quoted fields */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        result.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}
