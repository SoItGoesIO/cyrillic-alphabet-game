# README_Claude.md — Project Cheat Sheet (Claude Code)

This repo is "Claude-ready" for the Cyrillic Alphabet Game. Use **two terminals**:

- **Terminal A (raw WSL)**: Long Docker tasks — `make dev`, logs, container management
- **Terminal B (Claude Code)**: Edits, migrations, quick tests, database operations

## Quick URLs (Local Development)

- **REST API**: http://127.0.0.1:54321
- **Database**: 127.0.0.1:54322 (PostgreSQL)
- **Studio**: http://127.0.0.1:54323
- **Inbucket (Email)**: http://127.0.0.1:54324

## Environment Management

- **Local**: `npx supabase status -o env | tee .env.local`
- **LIVE**: `set -a; source .env.private; set +a` (git-ignored, mode 600)

## Daily Development Commands

- `make dev` — Start local Supabase stack
- `make status` — Check service health and connection details
- `make db-shell` — Connect to local PostgreSQL
- `make stop` — Stop all services cleanly
- `make reset` — Reset database (destructive, asks confirmation)
- `make test-queries` — Load sample data and run tests

## Supabase Commands

- `npx supabase link status` — Check LIVE project connection
- `npx supabase db push` — Push local schema to LIVE
- `npx supabase db pull` — Pull LIVE schema to local

## Slash Commands (Claude Code)

- `/local-smoke` — Validate local DB ↔ REST connection
- `/live-push` — List migrations, push to LIVE, test REST (no secrets printed)
- `/db-reset` — Reset local development database
- `/test-auth` — Verify authentication flow and RLS policies
- `/test-run` — Run npm test (CI mode) and summarize failures
- `/lint-fix` — Run ESLint + Prettier on changed files
- `/format` — Format entire repository with Prettier
- `/db-plan` — Analyze pending schema changes (read-only)
- `/zip-artifacts` — Package Claude setup files for sharing

> Claude follows rules in `CLAUDE.md`: no Docker start/stop, no printing secrets, stop on SQL errors.

## Testing & Quality

- **Unit Tests**: `npm test` (Jest with --passWithNoTests)
- **Linting**: `npm run lint` / `npm run lint:fix`
- **Formatting**: `npm run format` (Prettier)
- **Pre-commit**: Runs lint + format on staged files
- **Pre-push**: Runs tests (fast fail)

## Project Architecture

- **Frontend**: React 18 (CDN) + Vanilla JS ES modules + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + PostgREST + Auth)
- **Game Logic**: Cyrillic alphabet learning with XP/leveling system
- **Audio**: 33 letter pronunciations (01.mp3 - 33.mp3)
- **Database**: Full schema in `database/` with migrations

## XP & Leveling System

- **Level 1**: 0-99 XP (Beginner)
- **Level 2**: 100-249 XP (Novice)
- **Level 3**: 250-499 XP (Intermediate)
- **Level 4**: 500-899 XP (Advanced)
- **Level 5**: 900-1399 XP (Expert)
- **Level 6+**: 1400+ XP (Master, 500 XP per level)

## CI/CD Suggestions

- **GitHub Actions**: Lint → Test → Deploy workflow
- **Staging Push**: Optional Supabase migration deployment
- **Secrets**: `SUPABASE_ACCESS_TOKEN` + `SUPABASE_PROJECT_REF`

## Security Guidelines

- Never commit `.env.local`, `.env.private`, `.env.production`
- Service Role key is server-only, never expose to frontend
- Rotate keys immediately if accidentally shared
- All user data protected by Row Level Security (RLS)

## Troubleshooting

- **401 REST Error** → Wrong token; fetch ANON key with `npx supabase status -o env`
- **403 REST Error** → Missing RLS policy; use `/test-auth` to diagnose
- **Port Conflicts** → Manage Docker from Terminal A, not Claude Code
- **Migration Errors** → Check `database/migrations/` syntax before pushing
- **Docker Issues** → Run `make status` for detailed service diagnostics

## File Structure

```
cyril/
├── database/           # SQL schema and migrations
├── src/               # Modular JS source code
├── scripts/           # Development automation
├── audio/             # Cyrillic pronunciation files
├── .claude/           # Claude Code configuration
├── Makefile           # Unified development commands
└── README_Claude.md   # This file
```

## Getting Started (New Team Members)

1. Ensure WSL2 + Docker Engine working: `docker run --rm hello-world`
2. Install Node.js 20+ and verify: `node --version`
3. Clone repo and navigate to project root
4. Start development stack: `make dev` (in Terminal A)
5. Verify setup: `/local-smoke` (in Claude Code Terminal B)
6. Load sample data: `make test-queries`
7. Open Studio: http://localhost:54323
8. Start coding! 🚀

## Post-setup accomplishments

- npm install completed successfully
- Added ESLint flat config (eslint.config.js)
- Prettier formatting passes
- ESLint linting passes
- (Optional) Husky hooks initialized
