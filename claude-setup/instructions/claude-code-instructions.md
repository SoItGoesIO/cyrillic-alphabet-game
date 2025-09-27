You are CLAUDE CODE (terminal).
Do not start/stop Docker. Do not run long processes. Do not print secrets.

I have prepared all the Claude Code setup files individually in the claude-setup/instructions/ folder.
Please read each file and create the corresponding project files in their proper locations:

## Core Configuration Files:

1. Read `claude-setup/instructions/CLAUDE.md` → Create `CLAUDE.md` (project root)
2. Read `claude-setup/instructions/CLAUDE.local.md` → Create `CLAUDE.local.md` (project root, add to .gitignore)
3. Read `claude-setup/instructions/README_Claude.md` → Create `README_Claude.md` (project root)

## Claude Commands Directory:

4. Create `.claude/commands/` directory if it doesn't exist
5. Read each slash command file from claude-setup/instructions/ and create:
   - `.claude/commands/local-smoke.md` (from `claude-setup/instructions/local-smoke.md`)
   - `.claude/commands/live-push.md` (from `claude-setup/instructions/live-push.md`)
   - `.claude/commands/db-reset.md` (from `claude-setup/instructions/db-reset.md`)
   - `.claude/commands/test-auth.md` (from `claude-setup/instructions/test-auth.md`)
   - `.claude/commands/test-run.md` (from `claude-setup/instructions/test-run.md`)
   - `.claude/commands/lint-fix.md` (from `claude-setup/instructions/lint-fix.md`)
   - `.claude/commands/format.md` (from `claude-setup/instructions/format.md`)
   - `.claude/commands/db-plan.md` (from `claude-setup/instructions/db-plan.md`)
   - `.claude/commands/zip-artifacts.md` (from `claude-setup/instructions/zip-artifacts.md`)

## Configuration Files:

6. Read `claude-setup/instructions/hooks.json` → Create `.claude/hooks.json`
7. Read `claude-setup/instructions/mcp.json` → Create `.mcp.json`
8. Read `claude-setup/instructions/eslintrc.cjs` → Create `.eslintrc.cjs`
9. Read `claude-setup/instructions/prettier.config.cjs` → Create `prettier.config.cjs`
10. Read `claude-setup/instructions/editorconfig` → Create `.editorconfig`

## GitHub Actions:

11. Create `.github/workflows/` directory if needed
12. Read `claude-setup/instructions/ci.yml` → Create `.github/workflows/ci.yml`

## Package.json Enhancement:

13. If `package.json` exists, merge in these additions:

```json
{
  "scripts": {
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "typecheck": "tsc -p . || echo \"(skip typecheck: no tsconfig)\"",
    "test": "jest --passWithNoTests || echo \"(skip tests: no jest config)\"",
    "prepare": "husky install"
  },
  "devDependencies": {
    "eslint": "^9.10.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.3.3",
    "husky": "^9.0.11",
    "lint-staged": "^15.2.9",
    "jest": "^29.7.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx,cts,mts,cjs,mjs}": ["eslint --fix"],
    "*.{json,md,yml,yaml,css,scss,html}": ["prettier --write"]
  }
}
```

## Gitignore Updates:

14. Read `claude-setup/instructions/gitignore-additions.txt` and ensure `.gitignore` contains these entries:

```
.env.local
.env.private
.env.production
.claude/memory/
supabase/.temp/
CLAUDE.local.md
```

## Development Dependencies (Optional):

15. Install dev dependencies if package.json was updated:

```bash
npm i -D eslint eslint-config-prettier prettier husky lint-staged jest || echo "Skipping npm install"
```

16. Initialize git hooks if husky was installed:

```bash
npm run prepare || echo "Skipping husky setup"
npx husky add .husky/pre-commit "npx lint-staged" || echo "Skipping pre-commit hook"
npx husky add .husky/pre-push "npm test --silent -- --ci --reporters=default --colors" || echo "Skipping pre-push hook"
```

## Final Steps:

17. Run `git status --porcelain` to show what files were created/modified
18. Create a summary report showing which files were successfully created
19. Note any files that couldn't be created and why

## File Permissions:

- Ensure shell scripts in `scripts/` remain executable (chmod +x)
- Set appropriate permissions for config files

Please process all these files and report back with a summary of what was created successfully.
