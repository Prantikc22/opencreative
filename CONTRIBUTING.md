# Contributing

1. Create a focused branch and keep credentials out of commits.
2. Add migrations for schema changes; never edit production tables manually.
3. Run `npm run lint`, `npm run typecheck`, `npm test`, and `npm run build`.
4. Include tests for model routing, pricing, credit, and authorization changes.
5. Open a pull request describing behavior, risk, and verification.

Keep provider-specific details behind the OpenRouter and storage modules, preserve workspace isolation, and prefer additive migrations.
