# sopranos-ai-quote-generator — Releases

Newest entries at the top. Updated after every deploy to main.

---

## April 26, 2026 — v0.5.0: Quote Data Cleanup

### What shipped
- Consolidated all character name variants down to 35 unique, clean names across 257 quotes
- All Junior Soprano variants → **Uncle Junior** (21 quotes)
- All Carmine Lupertazzi Jr. / Little Carmine variants → **Carmine Lupertazzi** (11 quotes)
- Slash-format two-person exchange entries → first character only (e.g. `Jennifer Melfi / Tony Soprano` → `Dr. Jennifer Melfi`)
- Expanded partial names to full names: Carmela → Carmela Soprano, Paulie → Paulie Gualtieri, A.J. → AJ Soprano, Adriana → Adriana La Cerva, Jennifer Melfi → Dr. Jennifer Melfi
- Stripped stray leading whitespace from speaker names throughout the CSV

### Stack
- `data/quotes.csv` updated

---

## April 26, 2026 — v0.4.0: Character Filter Polish

### What shipped
- Hover any avatar to see the character name in a tooltip above the circle — never overlaps the avatar, uses a React portal so the label escapes the scroll container
- Fly-out animation on expand: avatars cascade in left-to-right with staggered 10ms delays; reverse cascade on collapse
- Expanded row always opens from the left — scroll position resets on every expand

### Stack
- No new dependencies

---

## April 26, 2026 — v0.3.0: Full UI Redesign + Avatar Character Filters

### What shipped
- New input card design: dark `#1C1C1C` rounded card with inline textarea, avatar filter row bottom-left, custom submit icon button bottom-right
- Character filter avatars: Tony, Chrissy, Junior show real photos; all others show initials. Stacked overlap with `+N` overflow button
- Selecting a character filters results to that character; re-tapping deselects. Selected avatar floats to front with red ring and glow
- Expanded filter view: tap `+N` to reveal horizontally scrollable row of all characters
- "Surprise Me" pill button — returns a random quote (from selected character if one is active)
- Empty input + character selected → random quote from that character instead of shaking
- Sopranos logo PNG + AI icon badge replace the plain text heading
- Page slides up on first submission (`26vh → 3rem` margin with 500ms ease)
- High-res avatar photos committed to `/public` for crisp Retina rendering

### Stack
- High-res avatar photos added to `/public`
- Drop-shadow depth via `filter: drop-shadow()` (works through `overflow: hidden`)

---

## April 25, 2026 — v0.2.0: Quote Database + Tag-Based Matching

### What shipped
- Loaded 172 real Sopranos quotes from CSV (replaces the 25 seed quotes)
- Added `Tags` column to CSV; all 172 quotes tagged with themes (e.g. `family`, `food`, `violence`, `loyalty`)
- GitHub Action auto-converts `data/quotes.csv` → `data/quotes.json` on every push
- LLM prompt updated to treat tags as the strongest matching signal
- Tag pre-filter: quotes whose tags match the user's input are guaranteed to appear in results
- Fixed bug where topic-specific queries (e.g. "golf") returned zero matches despite tagged quotes existing

### Stack
- `data/quotes.csv` with Tags column (172 rows)
- GitHub Action: `.github/workflows/convert-csv.yml`

---

## April 25, 2026 — v0.1.0: Initial Release

### What shipped
- Single-page app: type a message, receive 2–3 matching Sopranos quotes
- LLM-powered quote matching via Groq API (Llama 3.3 70B)
- 25 seed quotes bundled in `data/quotes.json`
- Quote cards with character, season/episode attribution, and one-click copy
- Sopranos-themed dark UI (black background, `#C41E1E` red accent)
- Animated loading state with rotating Sopranos-style messages
- Rate limiting: 10 requests/min per IP with Sopranos-themed 429 toast
- CSV → JSON conversion script (`npm run convert-csv`)

### Stack
- Deployed to Vercel at `sopranos-ai-quote-generator.vercel.app`
- `data/quotes.json` (25 seed quotes)
