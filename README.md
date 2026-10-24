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

## Update the profile

Edit `src/content/profile.md`. It is public: only put things there you're happy for anyone to read.
