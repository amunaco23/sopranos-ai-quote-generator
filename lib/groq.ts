import Groq from 'groq-sdk';
import { Quote } from './types';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are the Sopranos Quote Matcher. You will receive a user's message and a numbered list of Sopranos quotes. Your job:

1. Read the user's message and understand the emotion, topic, or situation behind it.
2. Pick the 2–3 quotes from the list that best match the user's message. Prioritize:
   - Emotional resonance (the quote captures how the user feels or what they're dealing with)
   - Topical relevance (the quote is about the same subject)
   - Humor or irony (if the user's tone is light, match with something funny)
3. Return ONLY a JSON array of the quote IDs, ranked best match first. Example: [14, 7, 42]
4. Do NOT modify, paraphrase, or add commentary to any quote.
5. Do NOT return anything other than the JSON array.
6. If nothing is a strong match, pick the 2–3 that are closest. Always return 2–3 quotes.`;

export async function matchQuotes(userMessage: string, quotes: Quote[], attempt = 0): Promise<number[]> {
  const quoteList = quotes
    .map(q => `${q.id}. "${q.text}" — ${q.character}`)
    .join('\n');

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: `User message: "${userMessage}"\n\nQuotes:\n${quoteList}\n\nReturn the IDs of the 2–3 best matching quotes as a JSON array.`,
      },
    ],
    temperature: 0.3,
    max_tokens: 50,
  });

  const raw = response.choices[0]?.message?.content?.trim() ?? '';
  const cleaned = raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim();

  try {
    const ids: number[] = JSON.parse(cleaned);
    if (!Array.isArray(ids) || ids.length === 0) throw new Error('Empty or invalid array');
    return ids.slice(0, 3);
  } catch {
    if (attempt < 1) return matchQuotes(userMessage, quotes, attempt + 1);
    throw new Error('Failed to parse LLM response after retry');
  }
}
