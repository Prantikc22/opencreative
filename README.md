# OpenCreative

OpenCreative is an open-source creative operating system for brands, agencies, and creators. It combines AI image, video, avatar, speech, transcription, translation, Brand DNA, asset management, campaign workflows, and transparent credit accounting in one Next.js application.

## Stack

- Next.js 16, React 19, TypeScript, Tailwind CSS
- Supabase Auth + Postgres with row-level security
- OpenRouter for model discovery and generation APIs
- Cloudflare R2 for private media storage with signed URLs
- Vercel or Docker for deployment

## Local setup

```bash
npm install
cp .env.example .env.local
npm run storage:setup
npm run dev
```

Apply [`supabase/migrations/20260901000000_initial.sql`](supabase/migrations/20260901000000_initial.sql) to your Supabase project before signing in. Then open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

## Deployment

Import the repository into Vercel, copy every variable from `.env.example` into the project environment, set `NEXT_PUBLIC_APP_URL` and `OPENROUTER_APP_URL` to the production URL, and rerun `npm run storage:setup` with production environment values so R2 allows the production origin.

See [ARCHITECTURE.md](ARCHITECTURE.md), [SELF_HOSTING.md](SELF_HOSTING.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

## Security

Never commit `.env.local`. The service-role, OpenRouter, and R2 keys are server-only. Brand website analysis rejects private-network targets and redirects, uploads use short-lived signed URLs, and tenant data is protected by Postgres RLS.

## License

MIT — see [LICENSE](LICENSE).
