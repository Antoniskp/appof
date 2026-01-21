# TASK_CURRENT

## Task ID
A1

## Task Title
API health endpoint

## Problem Statement
We need a basic API health endpoint so the web frontend and VPS scripts can verify the backend is running.

## Scope (IN SCOPE)
- Add GET /health endpoint to API
- Return 200 JSON: { "status": "ok" }

## Out of Scope (DO NOT TOUCH)
- Authentication
- Database
- Frontend

## Acceptance Criteria
- GET /health returns 200
- Body equals { "status": "ok" }
- make test-api passes (or add a minimal test if none exist)

## Files Expected to Change
- apps/api/** (as needed)

## Verification Commands
- make dev
- curl http://localhost:4000/health
- make test-api
