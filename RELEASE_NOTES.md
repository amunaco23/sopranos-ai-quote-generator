# sopranos-ai-quote-generator — Releases

## May 2, 2026 — Quote DB: Rename Carmine + 17 new quotes
**Shipped:** 12:10 AM CT

### What shipped
- Renamed "Carmine Lupertazzi" → "Little Carmine Lupertazzi" across all 11 existing quotes
- Grid displays him as "Carmine" via display name override
- Added 17 new quotes (IDs 259–275) — Tony, Christopher, Paulie, Livia, Phil, Johnny Sack, Uncle Junior, Little Carmine
- Total quote count: 258 → 275

### Stack
- Modified: `data/quotes.json`
- Modified: `lib/characterData.ts` — updated CHARACTER_IMAGES key
- Modified: `components/SpotlightCharacterMode.tsx` — added Little Carmine display name override

---

## May 2, 2026 — AFM-166: Character Avatars in Quote Results
**Shipped:** 11:59 PM CT

### What shipped
- Character headshot (44px circle) now appears on the left of every quote card in main search results
- Avatars hidden in Spotlight/View All mode (already shown in hero row — no redundancy)
- Slightly tightened spacing between quote text and attribution line

### Stack
- Modified: `components/QuoteCard.tsx` — added avatar with `showAvatar` prop (default true), imports from `lib/characterData`
- Modified: `components/SpotlightCharacterMode.tsx` — passes `showAvatar={false}`

---

## May 2, 2026 — AFM-168: Spotlight Character Mode Polish
**Shipped:** 11:55 PM CT

### What shipped
- Fixed flash when tapping a character — overlay now stays mounted during grid→spotlight transition, no white flash
- Quote cards now animate in after the hero avatar, not before
- Hint text ("Tap a character to see their quotes") centered on same line as Back button
- Grid display name overrides: Uncle Junior → Junior, Ralph → Ralphie, Big Pussy → Pussy, Dr. Jennifer Melfi → Dr. Melfi
- Left-edge scroll fade in character filter row now starts 4px earlier to cover partially-visible avatars

### Stack
- Modified: `components/SpotlightCharacterMode.tsx` — grid/spotlight state moved fully internal; single fixed overlay; display name map
- Modified: `app/page.tsx` — simplified browseMode to `'default' | 'browse'`
- Modified: `components/CharacterAvatars.tsx` — left fade `left: -4px` fix

---

## May 2, 2026 — AFM-168: Spotlight Character Mode
**Shipped:** 11:30 PM CT

### What shipped
- New "View All" button next to "Surprise Me" opens a full-screen character browse mode
- Character grid: all 25 characters displayed as large 80px circular headshots with first name labels; red ring on hover
- Tap any character to enter Spotlight view: hero avatar (72px, red ring), full name, quote count, and all their quotes as stacked cards
- Staggered animations: grid fade-in, grid fade-out + scale on character tap, hero slide-in from left, quote cards stagger up 50ms apart
- Back from spotlight → grid (instant); Back from grid → default view (fade)
- All quote data filtered client-side from local quotes.json — no extra API calls

### Stack
- New: `components/SpotlightCharacterMode.tsx` — full character browse component (grid + spotlight sub-views)
- New: `lib/characterData.ts` — shared CHARACTER_IMAGES map and getInitials helper (extracted from CharacterAvatars)
- Modified: `components/QuoteInput.tsx` — added onViewAll prop + "View All" pill button
- Modified: `app/page.tsx` — browseMode/spotlightCharacter state + wiring
- Modified: `app/globals.css` — 4 new keyframes: gridFadeIn, gridFadeOut, heroSlideIn, quoteCardIn
- Modified: `components/CharacterAvatars.tsx` — imports from shared lib/characterData.ts
