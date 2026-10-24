# Ask My Resume

Mridula Rao's personal site, with an AI that knows her career.

- **Ask about Mridula**: recruiters chat with an assistant grounded only in her public profile. It won't invent roles or metrics.
- **Check fit for a role**: paste a job description and get a candid fit read: matches, gaps, and interview questions to ask.

## Stack

- Next.js 15 (App Router) + Tailwind CSS
- Google Gemini (free tier, `gemini-flash-latest`) via the `@google/genai` SDK, streamed to the browser
- The whole profile (`src/content/profile.md`) goes in the system instruction. It's small, so no vector database or RAG pipeline is needed.

## Run locally

```bash
npm install
echo "GEMINI_API_KEY=AIza..." > .env.local
npm run dev
```

## Guardrails

Set these in Vercel's environment variables before going live:

| Variable | Purpose |
|---|---|
| `GEMINI_API_KEY` | Free Gemini API key from aistudio.google.com/apikey. Don't enable billing on it, so it stays on the free tier. |
| `AI_ENABLED` | Kill switch. Set to `false` and redeploy to pause the AI; visitors see a polite message. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate-limit counters (add Upstash Redis from the Vercel Marketplace). Without them, limits are per server instance and easy to get around. |

Limits live in `src/lib/guard.ts`: 20 AI requests per visitor per hour and 300 per day across the site.

## Update the profile

Edit `src/content/profile.md`. It is public: only put things there you're happy for anyone to read.
