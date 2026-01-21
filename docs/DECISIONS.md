# DECISIONS

- No Docker.
- Web: Next.js + Material UI (MUI).
- API: Fastify.
- DB: Postgres (installed directly on VPS), Prisma for migrations.
- Monorepo with pnpm workspaces.
- All commands must be exposed via Makefile targets.
- AI may not add dependencies unless explicitly recorded here first.
