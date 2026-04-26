# Release Notes

---

## v0.4.0 — 2026-04-26

### Character filter polish

- Hover any avatar to see the character name in a tooltip that appears above the circle — never overlaps the avatar. Uses a React portal so the label escapes the scroll container and is never clipped.
- Fly-out animation on expand: avatars cascade in left-to-right with staggered 10ms delays. Reverse cascade on collapse.
- Expanded row always opens from the left — scroll position resets on every expand.

---

## v0.3.0 — 2026-04-26

### Full UI redesign + avatar character filters

- New input card design: dark `#1C1C1C` rounded card with inline textarea, avatar filter row bottom-left, and custom submit icon button bottom-right
- Character filter avatars: Tony, Chrissy, and Junior show real photos; all other characters show initials. Stacked overlap design with `+N` overflow button.
- Selecting a character filters results to that character; re-tapping deselects. Selected avatar floats to the front with a red ring and drop-shadow glow.
- Expanded filter view: tap `+N` to reveal a horizontally scrollable row of all characters. Tap ✕ to collapse.
- "Surprise Me" pill button below the card — returns a random quote (from selected character if one is active)
- Empty input + character selected → random quote from that character instead of shaking
- Sopranos logo PNG + AI icon badge replace the plain text heading
- Page slides up on first submission (`26vh → 3rem` margin with 500ms ease)
- High-res avatar photos committed to `/public` for crisp Retina rendering
- Drop-shadow depth on avatars using `filter: drop-shadow()` (works through `overflow: hidden` unlike `box-shadow`)

---

## v0.2.0 — 2026-04-25

### Quote database + tag-based matching

- Loaded 172 real Sopranos quotes from CSV (replaces the 25 seed quotes)
- Added `Tags` column to CSV; all 172 quotes tagged with themes (e.g. `family`, `food`, `violence`, `loyalty`)
- GitHub Action auto-converts `data/quotes.csv` → `data/quotes.json` on every push — edit the CSV, push, done
- LLM prompt updated to treat tags as the strongest matching signal
- Tag pre-filter: quotes whose tags match the user's input are guaranteed to appear in results — the LLM can't ignore them
- Fixes a bug where topic-specific queries (e.g. "golf") returned zero matches despite tagged quotes existing

---

## v0.1.0 — 2026-04-25

### Initial release

- Single-page app where users type a message and receive 2–3 matching Sopranos quotes
- LLM-powered quote matching via Groq API (Llama 3.3 70B)
- 25 seed quotes bundled in `data/quotes.json`
- Quote cards with character, season/episode attribution, and one-click copy
- Sopranos-themed dark UI (black background, `#C41E1E` red accent)
- Animated loading state with rotating Sopranos-style messages
- Rate limiting: 10 requests per minute per IP with Sopranos-themed 429 toast
- CSV → JSON conversion script for adding new quotes (`npm run convert-csv`)
- Deployed to Vercel at `sopranos-ai-quote-generator.vercel.app`
