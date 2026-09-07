# OpenCreative MCP

OpenCreative provides a Streamable HTTP MCP server at:

```text
https://www.opencreativehq.com/api/mcp
```

## Sign in once (recommended)

OAuth-capable hosts should be given only the URL. They discover the protected-resource metadata, follow the authorization-server metadata, open OpenCreative’s browser login, and return to the calling host with a short-lived access token. The flow is OAuth 2.1 authorization code + PKCE S256; no Supabase token or application secret is copied into the assistant.

Metadata and endpoints:

```text
GET /api/mcp/.well-known/oauth-protected-resource
GET /.well-known/oauth-protected-resource   (root-origin alias)
GET /api/mcp/oauth/.well-known/oauth-authorization-server
POST /api/mcp/oauth/register
GET /api/mcp/oauth/authorize
POST /api/mcp/oauth/token
```

In Codex, ChatGPT, Claude, Cursor, or another MCP host, add a remote HTTP server with the URL above and choose its OAuth/sign-in option. Sign in once in the browser; after approval, the host returns automatically to the assistant.

## API-key fallback

For scripts or clients without OAuth, create a key in `Account → MCP & API keys` and send:

```http
Authorization: Bearer oc_live_…
```

Keys are scoped to the creating user’s workspace and can be revoked. Never use a Supabase access token as an MCP credential.

## Tool surface

The MCP server exposes image, video, speech, music, avatar-video, and campaign-plan operations. Every call inherits workspace membership, product entitlements, credit reservation/settlement, private asset delivery, and the same provider routing used by the web studio. Provider availability still matters: music returns a setup/capacity error until Google Lyria or an OpenRouter shared-capacity route is enabled.

Reference images, first frames, and source media passed to MCP tools must be HTTPS URLs reachable by the selected provider. Upload private files in OpenCreative first and pass the resulting signed URL.

## Self-hosting

1. Copy `.env.example` to `.env.local` and set the exact public `NEXT_PUBLIC_APP_URL`.
2. Apply every SQL file in `supabase/migrations` in filename order.
3. Configure Supabase Auth redirect URLs for `${NEXT_PUBLIC_APP_URL}/auth/callback`.
4. Deploy the Next.js app and expose `/api/mcp` over HTTPS.
5. Test metadata before connecting a host:

```bash
curl -s https://your-domain.example/api/mcp/.well-known/oauth-protected-resource
curl -s https://your-domain.example/api/mcp/oauth/.well-known/oauth-authorization-server
```

OAuth is disabled in practice until `20260907010000_mcp_oauth.sql` has been applied; the route returns a migration-required error instead of issuing tokens when those tables are absent.
