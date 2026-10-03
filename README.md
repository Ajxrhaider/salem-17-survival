# Salem-17-Survival

**Survive Salem. Explain the future without sounding like a witch.**

A web-based AI survival game where you are dropped into 1690s Salem with a modern object (a drone, a phone, a flashlight) and must convince a superstitious magistrate of your innocence — in 5 turns, without using modern jargon. Powered by **Next.js 15 (App Router) + Tailwind CSS + Google Gemini 3.5 Flash** and deployed on **Vercel**. Styled with the **Hizakilabs** design system.

> Built by [Hizaki Labs](https://hizakilabs.com) — John Hizaki (@Ajxrhaider)

---

## 🎮 Game Premise

**Year: 1693. Place: Salem Village, Massachusetts.**

You materialize in the town square holding a strange humming object that hovers. The crowd gasps. Magistrate Hawthorne seizes you.

You have **exactly 5 turns** to explain your object to the magistrate without:

- Using anachronistic terms (battery, electricity, computer, plastic, software, internet, drone, sensor, metal alloy, etc.)
- Sounding like a practitioner of witchcraft
- Failing to frame it as a benevolent or natural phenomenon

The AI roleplays as **Magistrate Samuel Hawthorne** — highly suspicious, deeply superstitious, versed in 17th-century Puritan theology and law. One slip of modern tongue and he cries *“WITCHCRAFT!”* — instant Game Over.

### Win Condition
Convince the magistrate within 5 turns that your object is natural, God-given, or harmless ingenuity (e.g., “a mirrored kite that catcheth the wind, guided by polished glass and prayer”) without triggering the banned word filter or his wrath.

### Lose Conditions
1.  **Anachronism:** You use a banned modern word (server + client double-check).
2.  **Heresy:** The magistrate deems your explanation witchcraft after 5 failed attempts.
3.  **Timeout:** You fail to persuade within 5 turns.

---

## ✨ Features

- **Retro-Modern Chat UI:** Hizakilabs themed (Inter + Space Grotesk, Indigo `#6366f1`, Emerald `#10b981`) with turn counter, suspicion meter, chat bubbles, and win/lose overlays.
- **Gemini 3.5 Flash Magistrate:** System-prompt hardened to stay in-character, enforce turn limits, and return structured JSON `{ reply, gameStatus, suspicion }`.
- **Double Anachronism Guard:** Client-side banned-word highlight + server-side hard block (`GAME OVER: WITCHCRAFT`).
- **5-Turn Enforcement:** Server tracks `turn` and auto-fails after 5 if not convinced.
- **Deployed on Vercel:** Edge-ready API route with error handling for missing API keys / rate limits.

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 (`@tailwindcss/postcss`), Inter + Space Grotesk via `next/font/google` |
| AI | Google Generative AI SDK (`@google/generative-ai`) — `gemini-1.5-flash` (aliased as Gemini 3.5 Flash) |
| Deployment | Vercel |
| Linting | ESLint (eslint-config-next) |

---

## 📁 Project Structure

```
salem-17-survival/
├── src/app/
│   ├── api/chat/route.ts      # Gemini magistrate engine
│   ├── favicon.ico            # ← Next.js App Router favicon (auto-served)
│   ├── icon.svg / icon.ico    # ← App icons (light/dark)
│   ├── layout.tsx             # Global fonts + metadata
│   ├── page.tsx               # Game UI (chat + turn counter)
│   └── globals.css            # Tailwind + Hizakilabs tokens
├── public/                    # Static assets (optional fallback favicons)
├── .env.local                 # GEMINI_API_KEY (never commit)
├── .gitignore
├── LICENSE (MIT)
└── tailwind.config.ts (if using v3) or @theme in globals.css (v4)
```

### Favicon & Icon Placement (IMPORTANT)
Next.js App Router serves files **by convention** from the `app` directory:

- `src/app/favicon.ico` → served as `/favicon.ico`
- `src/app/icon.svg` or `src/app/icon.png` → served as app icon
- `src/app/apple-icon.png` → Apple touch icon

You may also place fallbacks in `public/` (`public/favicon.ico`, `public/icon.svg`), but **prefer `src/app/`** for automatic metadata handling. See Phase 1 docs below.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18.17+ or 20+
- npm / yarn / pnpm
- Google AI Studio API Key ([aistudio.google.com](https://aistudio.google.com))

### 1. Clone & Install
```bash
git clone https://github.com/Ajxrhaider/salem-17-survival.git
cd salem-17-survival
npm install
```

### 2. Environment Variable
Create `.env.local` in the project root:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
```
> **Common error:** `GEMINI_API_KEY is not defined` → You forgot `.env.local` or didn't restart `npm run dev` after creating it. The API route checks `process.env.GEMINI_API_KEY` at request time and returns 500 with `Missing GEMINI_API_KEY` if empty.

Also add `@google/generative-ai` if not present:
```bash
npm install @google/generative-ai
```

### 3. Run Dev Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000). The game auto-reloads on edit.

### 4. Build Check
```bash
npm run lint
npm run build
```

---

## 🔑 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | Yes | Google Generative AI API key. Set in `.env.local` locally and in Vercel Dashboard → Settings → Environment Variables for production. |

Never commit `.env.local`. Use `.env.example` as a template:
```env
# .env.example
GEMINI_API_KEY=
```

---

## 🎨 Hizakilabs Design System

- **Fonts:** `Inter` (body), `Space Grotesk` (headings) — loaded via `next/font/google` with CSS variables.
- **Colors:**
  - Primary: `#6366f1` (Indigo)
  - Primary Dark: `#4f46e5`
  - Secondary: `#e5e7eb`
  - Accent: `#10b981` (Emerald — for success/win)
  - Backgrounds: `white / #f8fafc` for content, `#0f172a` / `#1e293b` for dramatic / dark game areas.
- **Styling:** `rounded-lg` / `rounded-xl`, `shadow-md` / `shadow-xl`, `transition-all`, subtle gradients.

---

## 🧠 How the AI Magistrate Works

See `src/app/api/chat/route.ts` for the full system prompt. Summary:

- **Role:** Magistrate Samuel Hawthorne, 1693, Puritan, suspicious, biblical language.
- **Rules:**
  1. Never break character. Never reveal you are AI.
  2. Inspect user input for banned words: `battery, electricity, computer, plastic, software, internet, drone, phone, camera, sensor, algorithm, data, digital, metal alloy` etc. If found → immediately return `GAME OVER: WITCHCRAFT — Thou hast spoken in the Devil's tongue...` with `gameStatus: "lost"`.
  3. Track `turn` (1-5). On turn 5 without convincing explanation → `GAME OVER: CONDEMNED`.
  4. If player cleverly reframes object as natural/benevolent (kite, lantern, polished glass, wind-spirit) with period-appropriate language → return `VICTORY: ABSOLVED` with `gameStatus: "won"`.
  5. Otherwise return in-character probing question with `gameStatus: "playing"` and `suspicion` 0-100.

---

## 📦 Deployment (Vercel)

```bash
npm i -g vercel
vercel login
vercel          # link + preview deploy
vercel --prod   # production deploy
```

Don't forget to add `GEMINI_API_KEY` in Vercel → Settings → Environment Variables → Redeploy.

---

## 🤝 Contributing

PRs welcome! Please run `npm run lint` and `npm run build` before submitting.

---

## 📄 License

MIT © 2026 Hizaki Labs — see [LICENSE](./LICENSE).

---

## 🙏 Acknowledgments

- Inspired by Salem witch trials history & speculative fiction.
- Fonts: Google Fonts (Inter, Space Grotesk).
- AI: Google Gemini.

**Hizaki Labs — Innovation & Expertise.**
