# Self-hosting

## Requirements

- Node.js 22+
- A Supabase project
- A private Cloudflare R2 bucket
- An OpenRouter API key

## Setup

1. Copy `.env.example` to `.env.local` and fill every required value.
2. Run every file in `supabase/migrations` in filename order in Supabase SQL Editor or with the Supabase CLI. Do not skip the MCP OAuth migration if remote assistants should sign in.
3. Run `npm run storage:setup` to create/configure the R2 bucket.
4. Run `npm run build && npm start`, or build the included Dockerfile.

For hosted mode, set `OPENCREATIVE_MODE=hosted`. For bring-your-own-key deployments, use `self-hosted`. Keep all non-`NEXT_PUBLIC_` variables on the server.

## Supabase auth URLs

Add the application origin and `/auth/callback` URL to Supabase Authentication URL Configuration. Production email flows must use the production site URL.

## MCP authentication

Set `NEXT_PUBLIC_APP_URL` to the exact public origin. The MCP endpoint is `/api/mcp`; OAuth clients discover `/.well-known/oauth-protected-resource`, then the authorization-server metadata under `/api/mcp/oauth/.well-known/oauth-authorization-server`. The server supports OAuth 2.1 authorization-code + PKCE S256 for public clients and one-time browser login. Clients that cannot do OAuth can use a scoped `oc_live_…` key created in `Account → MCP & API keys`.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-only: OAuth clients, authorization codes, and access tokens are stored as hashes and are never exposed to the browser.

## Operations

Back up Postgres and R2 independently. Rotate provider credentials periodically. Monitor failed generations, stale credit holds, webhook failures, and unexpected usage spikes. The OpenRouter webhook endpoint requires `GENERATION_WEBHOOK_SECRET`.
