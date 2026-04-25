# Release Notes

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
