import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const csvPath = process.argv[2];
if (!csvPath) {
  console.error('Usage: npm run convert-csv -- path/to/quotes.csv');
  process.exit(1);
}

const csv = readFileSync(csvPath, 'utf-8');
const lines = csv.split('\n').filter(l => l.trim().length > 0);

if (lines.length < 2) {
  console.error('CSV must have a header row and at least one data row.');
  process.exit(1);
}

function parseCsvLine(line: string): string[] {
  const values: string[] = [];
  let inQuotes = false;
  let current = '';

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  values.push(current.trim());
  return values;
}

// Column name aliases — maps CSV header → schema field
const ALIASES: Record<string, string> = {
  quote: 'text',
  speaker: 'character',
};

function parseEpisode(raw: string): { season?: number; episode?: number } {
  const match = raw.match(/S(\d+)\s*E(\d+)/i);
  if (!match) return {};
  return { season: parseInt(match[1], 10), episode: parseInt(match[2], 10) };
}

const rawHeaders = parseCsvLine(lines[0]);
const headers = rawHeaders.map(h => ALIASES[h.toLowerCase()] ?? h.toLowerCase());

let id = 1;
const quotes = lines.slice(1).flatMap(line => {
  const values = parseCsvLine(line);

  const quote: Record<string, string | number | string[]> = {};
  headers.forEach((header, idx) => {
    const val = values[idx]?.trim().replace(/^"|"$/g, '');
    if (!val) return;

    if (header === 'episode') {
      const parsed = parseEpisode(val);
      if (parsed.season) quote['season'] = parsed.season;
      if (parsed.episode) quote['episode'] = parsed.episode;
    } else if (header === 'season') {
      const n = parseInt(val, 10);
      if (!isNaN(n)) quote['season'] = n;
    } else if (header === 'tags') {
      // "food, humor, respect" → ["food", "humor", "respect"]
      quote['tags'] = val.split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    } else {
      quote[header] = val;
    }
  });

  if (!quote['text'] || !quote['character']) return [];

  return [{ id: id++, ...quote }];
});

const output = JSON.stringify({ quotes }, null, 2);
const outputPath = join(process.cwd(), 'data', 'quotes.json');
writeFileSync(outputPath, output);
console.log(`✓ Wrote ${quotes.length} quotes to ${outputPath}`);
