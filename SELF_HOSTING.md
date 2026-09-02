# Self-hosting

## Requirements

- Node.js 22+
- A Supabase project
- A private Cloudflare R2 bucket
- An OpenRouter API key

## Setup

1. Copy `.env.example` to `.env.local` and fill every required value.
2. Run the SQL migration in Supabase SQL Editor or with the Supabase CLI.
3. Run `npm run storage:setup` to create/configure the R2 bucket.
4. Run `npm run build && npm start`, or build the included Dockerfile.

For hosted mode, set `OPENCREATIVE_MODE=hosted`. For bring-your-own-key deployments, use `self-hosted`. Keep all non-`NEXT_PUBLIC_` variables on the server.

## Supabase auth URLs

Add the application origin and `/auth/callback` URL to Supabase Authentication URL Configuration. Production email flows must use the production site URL.

## Operations

Back up Postgres and R2 independently. Rotate provider credentials periodically. Monitor failed generations, stale credit holds, webhook failures, and unexpected usage spikes. The OpenRouter webhook endpoint requires `GENERATION_WEBHOOK_SECRET`.
