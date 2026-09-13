# Self-hosting

## Requirements

- Node.js 22+
- A Supabase project
- A private Cloudflare R2 bucket
- An OpenRouter API key

## Setup

1. Clone the repository, run `npm ci`, copy `.env.example` to `.env.local`, and fill every required value.
2. Run `npx supabase login`, `npx supabase link --project-ref YOUR_PROJECT_REF`, and `npx supabase db push`. Alternatively, apply every file in `supabase/migrations` in filename order in Supabase SQL Editor. Do not skip the MCP OAuth or account-access migrations.
3. In Supabase Authentication URL Configuration, add `http://localhost:3000/auth/callback` and the production callback URL. Configure Google credentials if Google sign-in is enabled.
4. Run `npm run storage:setup` to create/configure the R2 bucket and its allowed browser origins.
5. Run `npm run lint && npm run typecheck && npm test && npm run build`.
6. Run `npm start`, deploy to Vercel, or build the included Dockerfile.

For hosted mode, set `OPENCREATIVE_MODE=hosted`. For bring-your-own-key deployments, use `self-hosted`. Keep all non-`NEXT_PUBLIC_` variables on the server.

## Provider-dependent features

OpenRouter supplies the normalized image, video, speech, transcription, and text translation routes used by the core. Music availability depends on enabled OpenRouter/Google capacity. Custom voice cloning is intentionally not enabled and voice samples are not sent to ElevenLabs. Any future cloning implementation requires an approved provider plus explicit consent, deletion, identity verification, and abuse-prevention controls.

## Revenue attribution

When a visitor accepts analytics, DataFast sets visitor and session cookies. The Dodo checkout route passes those values as `datafast_visitor_id` and `datafast_session_id` metadata. Complete the connection in Dodo Payments under Developer → Webhooks by choosing the DataFast integration and storing the DataFast API key there. The API key must not be added to a `NEXT_PUBLIC_` variable or browser code.

The proxy uses `@datafast/ai-crawl` for known search and AI crawler traffic while excluding APIs and obvious static assets. Add the optional server-only `DATAFAST_BOT_TOKEN` before enabling authenticated bot ingestion in DataFast. Browser goals are consent-aware; payment and subscription goals are left to the Dodo integration to prevent duplicates.

## Supabase auth URLs

Add the application origin and `/auth/callback` URL to Supabase Authentication URL Configuration. Production email flows must use the production site URL.

## MCP authentication

Set `NEXT_PUBLIC_APP_URL` to the exact public origin. The MCP endpoint is `/api/mcp`; OAuth clients discover `/.well-known/oauth-protected-resource`, then the authorization-server metadata under `/api/mcp/oauth/.well-known/oauth-authorization-server`. The server supports OAuth 2.1 authorization-code + PKCE S256 for public clients and one-time browser login. Clients that cannot do OAuth can use a scoped `oc_live_…` key created in `Account → MCP & API keys`.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only: OAuth clients, authorization codes, and access tokens are stored as hashes and are never exposed to the browser.

## Operations

Back up Postgres and R2 independently. Rotate provider credentials periodically. Monitor failed generations, stale credit holds, webhook failures, and unexpected usage spikes. The OpenRouter webhook endpoint requires `GENERATION_WEBHOOK_SECRET`.
