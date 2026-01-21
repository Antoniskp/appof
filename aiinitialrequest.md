i want to develop a complex super app with the help of ai but it keeps making mistakes and looping me. i need a pipeline and project structure with server commands, which the ai should be able to follow consistently and be able to follow mistakes. please help me do it

Understood. Below is a no-Docker, VPS-friendly monorepo blueprint for a “dummy news site” with authentication, a homepage, and Material UI (MUI). It includes a strict pipeline, deterministic commands, project structure, and an error-handling protocol that an AI can follow consistently.

This assumes Linux VPS (systemd available). The stack is TypeScript end-to-end: Next.js + MUI (web) and Fastify (API), with Postgres installed directly on the VPS (or any Postgres host). No Docker required.

1) Target architecture

Web: Next.js (App Router) + Material UI (MUI) + client-side auth state

API: Fastify + JWT auth + refresh token rotation (via secure httpOnly cookie)

DB: Postgres (direct install on VPS)

Migrations: Prisma (simple and stable for teams and AI)

Process manager: systemd services (VPS-native, deterministic)

Monorepo: pnpm workspaces

Why this is AI-friendly:

Minimal moving parts

Deterministic commands

Strong typing shared between web/api

Prisma gives repeatable DB schema + migrations

2) Repository structure (predictable and enforceable)
news-superapp/
  apps/
    web/                       # Next.js + MUI
    api/                       # Fastify API
  packages/
    shared/                    # shared types + constants
    config/                    # eslint/tsconfig presets
  docs/
    PROJECT.md
    STATE.md
    TASKS.md
    DECISIONS.md
    RUNBOOK.md
  scripts/
    doctor.sh
    vps-setup.sh
  infra/
    systemd/
      news-api.service
      news-web.service
  .env.example
  Makefile
  package.json
  pnpm-workspace.yaml
  README.md

3) Deterministic commands (single interface: make)

Your AI should be restricted to these commands only.

Local dev

make setup – install dependencies, create env, init db

make dev – run API + Web in dev mode

make lint – lint all

make typecheck – typecheck all

make test – run tests

make db-migrate – apply migrations

make db-reset – reset schema (dev only)

make doctor – diagnose environment

VPS

make build – build web and api

make start – start production (systemd)

make stop – stop production (systemd)

make status – systemd status

make logs – tail logs

4) Authentication model (simple, secure enough, no loops)

Register: creates user with hashed password (argon2)

Login:

returns access token (short TTL) in JSON

sets refresh token as httpOnly cookie

Refresh: rotates refresh token cookie and returns new access token

Logout: clears refresh cookie

This pattern avoids storing tokens in localStorage and is stable for AI to implement.

5) “Dummy news site” functional slices (vertical increments)

Start with these slices in order (AI must not skip ahead):

Slice A: Health + Homepage

API /health

Web homepage calls /health and renders “API: OK”

Slice B: Authentication

Register/login/logout/refresh endpoints

Web auth pages + navbar state

Slice C: News list + article page (public)

API endpoints for listing articles and getting one

Web homepage shows top articles (dummy seeded)

Slice D: Admin create article (protected)

Only authenticated user can create

Each slice ends with exact test commands and acceptance criteria.

6) Concrete files you should create (templates)
docs/DECISIONS.md (hard constraints AI must obey)

Include:

No Docker

pnpm workspaces only

Next.js + MUI only for UI

Fastify for API

Postgres + Prisma

Commands must be exposed via Makefile

No new dependencies unless documented here

docs/TASKS.md (AI-safe backlog)

Example tasks (IDs matter):

A1: API health endpoint

A2: Web homepage consumes health

B1: Prisma User model + migration

B2: Auth endpoints

B3: Web login/register pages using MUI

C1: Article model + seed

C2: Public article endpoints

C3: Web article list/details

docs/STATE.md

Verified working commands (with date)

Current failures (paste logs)

Next task ID

7) Makefile (copy/paste blueprint)

This is the contract. Even if some targets start as placeholders, the AI must never invent commands outside it.

SHELL := /bin/bash

.PHONY: setup dev build start stop status logs lint typecheck test doctor db-migrate db-reset

setup:
	pnpm install
	cp -n .env.example .env || true
	$(MAKE) doctor
	$(MAKE) db-migrate

dev:
	pnpm -C apps/api dev & pnpm -C apps/web dev

build:
	pnpm -C apps/api build
	pnpm -C apps/web build

start:
	sudo systemctl daemon-reload
	sudo systemctl enable --now news-api
	sudo systemctl enable --now news-web

stop:
	sudo systemctl disable --now news-web || true
	sudo systemctl disable --now news-api || true

status:
	systemctl status news-api --no-pager || true
	systemctl status news-web --no-pager || true

logs:
	journalctl -u news-api -u news-web -n 200 --no-pager

lint:
	pnpm lint -r

typecheck:
	pnpm typecheck -r

test:
	pnpm test -r

doctor:
	bash scripts/doctor.sh

db-migrate:
	pnpm -C apps/api prisma migrate deploy

db-reset:
	pnpm -C apps/api prisma migrate reset --force

8) VPS-ready systemd services (no PM2 required)
infra/systemd/news-api.service

Runs Fastify API on port 4000

Key design: API uses NODE_ENV=production, runs compiled output.

infra/systemd/news-web.service

Runs Next.js next start on port 3000, pointing to API base URL

You install these by copying into /etc/systemd/system/ and reloading.

9) Scripts: doctor and VPS setup
scripts/doctor.sh should check:

node version, pnpm version

postgres reachable

env variables present

ports 3000 and 4000 free

prisma can connect

scripts/vps-setup.sh should:

install Node LTS + pnpm

install Postgres

create db and user

set up firewall ports

install systemd units

This eliminates “it works locally but not on VPS” loops.

10) Web app requirements (MUI + homepage)

Homepage (/) requirements:

MUI layout (AppBar + Container)

“Top Stories” list (from API)

If logged in: show “Create Article” link

If not: show Login/Register buttons

Auth pages:

/login (email + password)

/register (email + password + name optional)

use MUI TextField / Button

on success, store access token in memory (or a React context) and call /me to confirm

11) API endpoints (minimal set)

Public:

GET /health

GET /articles?limit=10

GET /articles/:slug

Auth:

POST /auth/register

POST /auth/login

POST /auth/refresh

POST /auth/logout

GET /me (requires bearer token)

Admin:

POST /articles (requires bearer token)

12) Error-handling protocol (the anti-loop rules)

Put this verbatim in docs/RUNBOOK.md and require AI to follow it.

Fix Mode steps (mandatory):

Paste full failing command output.

Identify which command failed (exact).

Choose 1 smallest plausible fix.

Implement fix.

Re-run only the failing command.

After 3 attempts, stop coding and produce a Debug Report.

Debug Report must include:

failing command + output

environment info (make doctor)

suspected root cause

2–3 alternative fixes

recommended fix

13) What I can produce next (without further clarification)

If you want, I can generate a complete starter repo as text (or as a file bundle if you’re using a local environment) including:

pnpm-workspace.yaml, root package.json

Next.js + MUI configured (including SSR-safe MUI setup)

Fastify API with auth endpoints

Prisma schema + migration + seed (dummy articles)

Makefile, doctor script, systemd units

docs templates filled out with Slice A + Slice B tasks
