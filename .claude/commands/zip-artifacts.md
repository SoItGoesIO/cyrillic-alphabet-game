# Package Claude Code setup files

Create a timestamped archive of all Claude-related configuration files.

## Create Archive

```bash
tar -czf claude-artifacts-$(date +%Y%m%d%H%M).tar.gz \
  CLAUDE.md \
  CLAUDE.local.md \
  .claude/commands \
  .claude/hooks.json \
  .mcp.json \
  README_Claude.md \
  Makefile \
  scripts \
  database/migrations \
  .eslintrc.cjs \
  prettier.config.cjs \
  .editorconfig \
  .github/workflows/ci.yml \
  2>/dev/null || true
```

## Output

Print the absolute path of the created archive file.
