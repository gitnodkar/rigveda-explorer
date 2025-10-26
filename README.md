# Veda Vision Quest

An interactive web app for exploring the Rigveda—ancient Hindu scriptures with 10,552 verses across 10 Mandalas. Features:
- **AI Scholar**: Chat with Groq-powered LLM for verse explanations & citations.
- **Search**: Filter by deity, rishi, meter, keyword, or reference (e.g., 1.1.1).
- **Visualize**: Charts for distributions (mandalas, deities, etc.) with Mandala breakdowns.
- **Home**: Overview & quick access.

## Quick Start
1. Clone: `git clone https://github.com/gitnodkar/rigveda-explorer.git`
2. Install: `npm install`
3. Env: Copy `.env.example` to `.env` & add `VITE_GROQ_API_KEY=your_key`.
4. Run: `npm run dev` → http://localhost:5173

## Tech Stack
- React + TypeScript + Vite
- Shadcn/UI + Tailwind CSS
- Recharts for viz
- Groq API for AI

## Data
- Rigveda verses from CSV (10k+ rows: Sanskrit, English, metadata).

## Deploy
- Vercel/Netlify: Auto-deploys on push.


