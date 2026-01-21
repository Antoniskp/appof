SHELL := /bin/bash

.PHONY: setup dev build lint typecheck test test-api test-web doctor

setup:
	pnpm install

dev:
	pnpm -C apps/api dev & pnpm -C apps/web dev

build:
	pnpm -C apps/api build
	pnpm -C apps/web build

lint:
	pnpm -C apps/api lint

typecheck:
	pnpm typecheck -r

test:
	pnpm test -r

test-api:
	pnpm -C apps/api test

test-web:
	pnpm -C apps/web test

doctor:
	node -v
	pnpm -v
