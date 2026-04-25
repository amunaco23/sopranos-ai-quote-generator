# Sopranos Quote Generator

Type a message. Get a Sopranos quote.

**Live:** [sopranos-ai-quote-generator.vercel.app](https://sopranos-ai-quote-generator.vercel.app)

## Stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **LLM:** Groq API — Llama 3.3 70B
- **Hosting:** Vercel

## Local setup

```bash
# 1. Clone
git clone https://github.com/amunaco/sopranos-ai-quote-generator.git
cd sopranos-ai-quote-generator

# 2. Install deps
npm install

# 3. Add your Groq API key
cp .env.local.example .env.local
# Edit .env.local and paste your key from console.groq.com

# 4. Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding quotes

Provide a CSV with these columns (optional columns can be blank):

```
text,character,season,episode,episode_title,context
```

Convert it:

```bash
npm run convert-csv -- path/to/your-quotes.csv
```

This overwrites `data/quotes.json`.

## Deploy to Vercel

1. Push the repo to GitHub
2. Import the repo in the [Vercel dashboard](https://vercel.com/new)
3. Add `GROQ_API_KEY` to **Settings → Environment Variables**
4. Deploy

## Environment variables

| Variable | Description |
|---|---|
| `GROQ_API_KEY` | Groq API key — server-side only, never exposed to the client |
