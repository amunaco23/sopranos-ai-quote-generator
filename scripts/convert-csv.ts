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

const headers = parseCsvLine(lines[0]);

const quotes = lines.slice(1).map((line, i) => {
  const values = parseCsvLine(line);
  const quote: Record<string, string | number> = { id: i + 1 };

  headers.forEach((header, idx) => {
    const val = values[idx]?.trim().replace(/^"|"$/g, '');
    if (!val) return;
    if (header === 'season' || header === 'episode') {
      const n = parseInt(val, 10);
      if (!isNaN(n)) quote[header] = n;
    } else {
      quote[header] = val;
    }
  });

  return quote;
});

const output = JSON.stringify({ quotes }, null, 2);
const outputPath = join(process.cwd(), 'data', 'quotes.json');
writeFileSync(outputPath, output);
console.log(`✓ Wrote ${quotes.length} quotes to ${outputPath}`);
