# Architecture

## Request flow

The browser talks only to Next.js route handlers. Authentication is maintained with Supabase SSR cookies. Every protected request resolves the active user and workspace before touching tenant data.

Generation requests are validated, rate-limited, priced, and charged atomically in Postgres. OpenRouter is called from the server. Completed remote media is copied into a private R2 bucket; clients receive time-limited download URLs instead of storage credentials.

## Main modules

- `app/(workspace)`: authenticated product UI
- `app/api`: server-side application boundary
- `lib/openrouter`: live model discovery and provider clients
- `lib/generations`: generation lifecycle orchestration
- `lib/credits`: credit holds, settlement, refunds, and ledger operations
- `lib/storage`: R2 uploads and signed downloads
- `lib/supabase`: browser, server, and privileged clients
- `supabase/migrations`: schema, functions, triggers, indexes, and RLS policies

## Data model

Workspaces own memberships, brands, products, avatars, voices, projects, generations, assets, favorites, API keys, credit accounts, and ledger entries. `workspace_id` is the primary tenancy boundary. Privileged server access is reserved for narrowly scoped operations such as credit settlement and webhook processing.

## Generation lifecycle

`queued → planning → generating → processing → completed|failed|cancelled`

Credits are reserved before provider submission. Success settles the actual cost and refunds unused reserved credits. Failure releases the hold. Idempotency keys prevent duplicate charges and submissions.
