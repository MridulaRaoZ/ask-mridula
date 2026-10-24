# Ask My Resume

Mridula Rao's personal site, with an AI that knows her career.

- **Ask about Mridula**: recruiters chat with an assistant grounded only in her public profile. It won't invent roles or metrics.
- **Check fit for a role**: paste a job description and get a candid fit read: matches, gaps, and interview questions to ask.

## Stack

- Next.js 15 (App Router) + Tailwind CSS
- Claude Opus 5.5 via the Anthropic TypeScript SDK, streamed to the browser
- The whole profile (`src/content/profile.md`) goes in a cached system prompt. It's small, so no vector database or RAG pipeline is needed.

## Run locally

```bash
npm install
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local
npm run dev
```

## Guardrails

Set these in Vercel's environment variables before going live:

| Variable | Purpose |
|---|---|
| `ANTHROPIC_API_KEY` | Claude API key. Also set a monthly spend limit for it in the Anthropic Console. |
| `AI_ENABLED` | Kill switch. Set to `false` and redeploy to pause the AI; visitors see a polite message. |
| `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | Shared rate-limit counters (add Upstash Redis from the Vercel Marketplace). Without them, limits are per server instance and easy to get around. |

Limits live in `src/lib/guard.ts`: 20 AI requests per visitor per hour and 300 per day across the site.

## Update the profile

Edit `src/content/profile.md`. It is public: only put things there you're happy for anyone to read.
