# Sopranos AI Quote Generator — PRD

**Version:** 1.0  
**Last Updated:** April 25, 2026  
**Author:** Anthony Munaco  
**Status:** Draft  

---

## Changelog

| Version | Date       | Changes                        |
|---------|------------|--------------------------------|
| 1.0     | 2026-04-25 | Initial PRD draft              |

---

## 1. Overview

A web app where users type a message and receive 2–3 relevant Sopranos quotes in response. An LLM reads the user's input, matches it against a bundled quote database, and returns the best fits. Dark, Sopranos-themed UI. Hosted on Vercel.

**Live URL (target):** `sopranos-ai-quote-generator.vercel.app`

---

## 2. Goals

- Deliver a fast, fun, publicly accessible Sopranos quote experience
- Zero ongoing cost (free LLM tier, no database)
- Ship a clean v1 that can be iterated on later (design, features, quote library)

---

## 3. Tech Stack

| Layer        | Technology                         |
|--------------|------------------------------------|
| Framework    | Next.js (App Router)               |
| Language     | TypeScript                         |
| Styling      | Tailwind CSS                       |
| LLM          | Groq API (free tier) — Llama 3 70B |
| Quote Storage| JSON file bundled in repo          |
| Hosting      | Vercel                             |
| Rate Limiting| In-memory or Vercel KV             |

---

## 4. Quote Data

### 4.1 Source

Anthony will assemble quotes manually and provide a CSV. The CSV will be converted to a JSON file stored at `/data/quotes.json` in the repo.

### 4.2 Schema

```json
{
  "quotes": [
    {
      "id": 1,
      "text": "Those who want respect, give respect.",
      "character": "Tony Soprano",
      "season": 1,
      "episode": 13,
      "episode_title": "I Dream of Jeannie Cusamano",
      "context": "Tony to Junior at dinner"
    }
  ]
}
```

**Required fields:** `id`, `text`, `character`  
**Optional fields:** `season`, `episode`, `episode_title`, `context`

### 4.3 CSV Format (input)

The CSV Anthony provides should have these columns. Missing optional columns are fine — the build script will handle nulls.

```
text,character,season,episode,episode_title,context
```

A build script (`scripts/convert-csv.ts`) will convert the CSV to the JSON format above.

---

## 5. Architecture

```
User Input
    ↓
Next.js API Route (/api/quote)
    ↓
Load quotes.json (all quotes)
    ↓
Send user message + all quotes to Groq (Llama 3 70B)
    ↓
LLM returns top 2–3 quote IDs
    ↓
API returns matched quotes to frontend
    ↓
Display as stacked cards
```

### 5.1 API Route: `/api/quote`

**Method:** POST  
**Body:** `{ "message": "string" }`  
**Response:**
```json
{
  "quotes": [
    {
      "text": "...",
      "character": "...",
      "season": 1,
      "episode": 13,
      "episode_title": "...",
      "context": "..."
    }
  ]
}
```

**Error responses:**
- `429` — rate limited (include `retryAfter` in seconds)
- `400` — empty or invalid message
- `500` — LLM error

### 5.2 Rate Limiting

- **Limit:** 10 requests per minute per IP
- **Storage:** In-memory map (sufficient for Vercel serverless cold starts; upgrade to Vercel KV if needed)
- **On limit hit:** Return 429 with a Sopranos-themed message and retry countdown

---

## 6. LLM Integration

### 6.1 Provider: Groq

- **Why:** Free tier, fast inference, supports Llama 3 70B
- **API Key:** Stored as `GROQ_API_KEY` environment variable in Vercel
- **Model:** `llama-3.3-70b-versatile` (or latest available on free tier at build time)
- **Fallback:** If Groq changes their free tier or goes down, swap to another free provider (e.g., Together AI free tier). The API route should abstract the LLM call so the provider is swappable.

### 6.2 System Prompt

```
You are the Sopranos Quote Matcher. You will receive a user's message and a numbered list of Sopranos quotes. Your job:

1. Read the user's message and understand the emotion, topic, or situation behind it.
2. Pick the 2–3 quotes from the list that best match the user's message. Prioritize:
   - Emotional resonance (the quote captures how the user feels or what they're dealing with)
   - Topical relevance (the quote is about the same subject)
   - Humor or irony (if the user's tone is light, match with something funny)
3. Return ONLY a JSON array of the quote IDs, ranked best match first. Example: [14, 7, 42]
4. Do NOT modify, paraphrase, or add commentary to any quote.
5. Do NOT return anything other than the JSON array.
6. If nothing is a strong match, pick the 2–3 that are closest. Always return 2–3 quotes.
```

### 6.3 User Prompt Construction

```
User message: "{user_input}"

Quotes:
1. "Those who want respect, give respect." — Tony Soprano
2. "All due respect, you got no idea what it's like to be number one." — Tony Soprano
3. ...
[all quotes numbered by ID]

Return the IDs of the 2–3 best matching quotes as a JSON array.
```

### 6.4 Token Budget Consideration

- Each quote averages ~15–20 words (~25 tokens)
- At 500 quotes: ~12,500 tokens for the quote list
- System prompt + user input: ~200 tokens
- Total: ~12,700 tokens per request
- Llama 3 70B context window: 128K tokens — well within limits
- **If the quote list exceeds 1,000 quotes**, revisit this approach and consider a pre-filter step (semantic search or keyword match to narrow to ~100 candidates before sending to the LLM)

---

## 7. UI / UX

### 7.1 Layout

Single-page app. Vertically centered content. No navigation.

```
┌─────────────────────────────────────┐
│                                     │
│          [Sopranos Logo]            │
│     "Sopranos Quote Generator"      │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  What's eatin' you?         │    │
│  └─────────────────────────────┘    │
│                                     │
│  ┌─────────────────────────────┐    │
│  │  Quote 1                  📋│    │
│  │  — Character, S1E13         │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  Quote 2                  📋│    │
│  │  — Character, S2E4          │    │
│  └─────────────────────────────┘    │
│  ┌─────────────────────────────┐    │
│  │  Quote 3                  📋│    │
│  │  — Character, S3E7          │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

### 7.2 Design Tokens (v1)

| Element            | Value                          |
|--------------------|--------------------------------|
| Background         | `#000000` (pure black)         |
| Text (primary)     | `#FFFFFF`                      |
| Text (secondary)   | `#A0A0A0` (attribution)        |
| Card background    | `#1A1A1A`                      |
| Card border        | `#333333`                      |
| Accent             | `#C41E1E` (Sopranos red)       |
| Font (headings)    | TBD — iterate later            |
| Font (body)        | System font stack               |
| Input border       | `#333333`, focus: `#C41E1E`    |
| Logo               | Sopranos logo image (source TBD — use a text-based fallback if licensing is an issue) |

### 7.3 Input Field

- Placeholder text: `"What's eatin' you?"` (or similar Sopranos-flavored prompt — can rotate randomly from a few options)
- Other placeholder options: `"Talk to me."`, `"Whatcha thinkin' about?"`, `"Spit it out."`
- Submit on Enter/Return key press
- No submit button — Enter to send only
- Disable input while loading

### 7.4 Quote Cards (stacked)

Each card shows:
- Quote text (large, white)
- Attribution line: `— {character}, S{season}E{episode} "{episode_title}"`
  - If season/episode data is missing, show only: `— {character}`
  - If context is available, show below attribution in smaller gray text
- Copy button (clipboard icon) — right-aligned
  - On click: copy quote text only (not attribution)
  - Show brief "Copied!" confirmation (tooltip or icon swap)

### 7.5 Loading State

While waiting for the LLM response, show an animated Sopranos-themed loading indicator:
- **Concept:** Animated text that cycles through short Sopranos-style lines, e.g.:
  - `"Tony's thinking..."`
  - `"Consulting the family..."`
  - `"Checking with the crew..."`
- The text should fade/cycle with a smooth animation
- Include a subtle pulsing or breathing animation on the element
- Replace the quote card area while loading

### 7.6 Rate Limit Toast

When a user hits the rate limit:
- Show a toast notification (top-right, auto-dismiss after 5 seconds)
- **Message:** A Sopranos-themed limit message, e.g.:
  - `"Take it easy. You're not the only one in line. Try again in {X} seconds."`
  - `"You're crowdin' me. Come back in {X} seconds."`
- Include a countdown timer in the toast showing seconds remaining

### 7.7 Responsiveness

- Fully responsive: mobile-first
- Max content width: `640px`, centered
- Input and cards should be full-width within the content container
- Stack naturally on mobile with appropriate padding
- Touch-friendly copy button (minimum 44px tap target)

---

## 8. Error Handling

| Scenario              | User-facing behavior                                     |
|-----------------------|----------------------------------------------------------|
| Empty input           | Shake input field, no API call                           |
| LLM timeout/error     | Show error card: "Even Tony has bad days. Try again."    |
| Rate limited          | Toast notification with countdown (see 7.6)              |
| Invalid LLM response  | Retry once, then show error card                         |
| Network error         | Show error card: "The line went dead. Check your connection." |

---

## 9. Environment Variables

| Variable       | Where          | Description             |
|----------------|----------------|-------------------------|
| `GROQ_API_KEY` | Vercel env vars| Groq API key (server-side only, never exposed to client) |

---

## 10. File Structure

```
sopranos-ai-quote-generator/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── globals.css
│   └── api/
│       └── quote/
│           └── route.ts
├── components/
│   ├── QuoteInput.tsx
│   ├── QuoteCard.tsx
│   ├── LoadingState.tsx
│   ├── RateLimitToast.tsx
│   └── Logo.tsx
├── data/
│   └── quotes.json
├── lib/
│   ├── groq.ts          # LLM call abstraction
│   ├── rate-limit.ts    # Rate limiting logic
│   └── types.ts         # TypeScript types
├── scripts/
│   └── convert-csv.ts   # CSV → JSON converter
├── public/
│   └── sopranos-logo.png (or .svg)
├── .env.local
├── .gitignore
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## 11. Build & Deploy Steps

1. **Setup:** `npx create-next-app@latest sopranos-ai-quote-generator --typescript --tailwind --app`
2. **Install deps:** `npm install groq-sdk`
3. **Add quote data:** Convert Anthony's CSV → `data/quotes.json` using `scripts/convert-csv.ts`
4. **Add Groq key:** Set `GROQ_API_KEY` in `.env.local` (local) and Vercel dashboard (production)
5. **Build components:** Input → API route → Quote cards
6. **Test locally:** `npm run dev`
7. **Deploy:** `vercel` CLI or connect GitHub repo to Vercel dashboard
8. **Verify:** Hit `sopranos-ai-quote-generator.vercel.app` and test

---

## 12. Future Iterations (Out of Scope for v1)

- Custom domain
- Sopranos-themed design polish (custom fonts, imagery, animations)
- Share to Twitter/X or iMessage
- Favorite/save quotes
- "Random quote" button
- Supabase migration for dynamic quote management (add/edit/delete quotes via admin UI)
- Semantic search pre-filter for large quote libraries (500+)
- Analytics (which quotes get matched most, popular user inputs)
- Quote categories/tags for better matching
- Dark/light theme toggle (probably stays dark forever, but just in case)

---

## 13. Open Items

| # | Item | Status |
|---|------|--------|
| 1 | Anthony to assemble and provide quotes CSV | Pending |
| 2 | Sopranos logo asset — source or create text fallback | Pending |
| 3 | Groq free tier account creation | Pending |
| 4 | Verify Groq model availability (`llama-3.3-70b-versatile`) at build time | Pending |
| 5 | Placeholder text final selection | Pending |
