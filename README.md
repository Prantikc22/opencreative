# OpenCreative

OpenCreative is an open-source creative operating system for brands, agencies, and creators. It combines AI image, video, avatar, speech, transcription, translation, Brand DNA, asset management, campaign workflows, and transparent credit accounting in one Next.js application.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Supabase Auth + Postgres with row-level security
- OpenRouter for model discovery and generation APIs
- Cloudflare R2 for private media storage with signed URLs
- Vercel or Docker for deployment

## Quick start

Requirements: Node.js 22+, a Supabase project, an OpenRouter API key, and a Cloudflare R2 account.

```bash
git clone https://github.com/Prantikc22/opencreative.git
cd opencreative
npm ci
cp .env.example .env.local
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
npm run storage:setup
npm run dev
```

Fill every required value in `.env.local` before running the setup commands. In Supabase Authentication, add your local and production `/auth/callback` URLs; enable Google only after adding its client credentials. Then open [http://localhost:3000](http://localhost:3000).

If you do not use the Supabase CLI, apply every file in [`supabase/migrations`](supabase/migrations) in filename order in the SQL editor. Never expose `SUPABASE_SERVICE_ROLE_KEY`, `OPENROUTER_API_KEY`, or R2 secrets to the browser.

OpenCreative exposes 31 ready creative operations plus provider-backed music when its capacity is enabled. See [`MCP.md`](MCP.md) for the hosted OAuth flow, API-key fallback, and setup examples for Codex, ChatGPT, Claude, Cursor, and other MCP clients.

### Feature readiness

- Image, video, avatars, speech, transcription, translation, dubbing workflow, agents, projects, assets, credits, and MCP are wired into the application.
- Music generation remains provider-capacity dependent and is labeled as setup required in the product.
- Custom voice cloning is not enabled. OpenCreative uses its existing provider voice library and does not send voice samples to ElevenLabs. A future cloning integration must use an approved provider and include explicit consent, deletion, and abuse-prevention controls.

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Import the repository into Vercel, copy the required variables from `.env.example` into the project environment, set `NEXT_PUBLIC_APP_URL` and `OPENROUTER_APP_URL` to the production URL, run `npx supabase db push`, and rerun `npm run storage:setup` with production environment values so R2 allows the production origin.

### DataFast revenue attribution

The consent-gated DataFast script creates `datafast_visitor_id` and `datafast_session_id` cookies. The server-side Dodo checkout route automatically copies the available identifiers into checkout metadata. In Dodo Payments, add the built-in DataFast webhook integration, paste the website API key there, and keep the key out of this repository and all client-side environment variables. Dodo then forwards successful payment data to DataFast with the checkout attribution metadata.

The Next.js proxy also reports recognized search and AI crawler requests with `@datafast/ai-crawl`. An optional server-only `DATAFAST_BOT_TOKEN` can authenticate those events. Consent-aware browser goals cover signup, onboarding completion, checkout initiation, and successful creative generation; Dodo remains the single source for payment and subscription lifecycle goals.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SELF_HOSTING.md](SELF_HOSTING.md), [MCP.md](MCP.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Never commit `.env.local`. The service-role, OpenRouter, and R2 keys are server-only. Brand website analysis rejects private-network targets and redirects, uploads use short-lived signed URLs, and tenant data is protected by Postgres RLS.

## License

MIT — see [LICENSE](LICENSE).
