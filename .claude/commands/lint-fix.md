# Lint and format changed files

Run linting and formatting on staged/changed files.

## Commands

```bash
npm run lint
npm run format
```

## Auto-fix Issues

If ESLint reports fixable issues:

```bash
npm run lint:fix
```

## Summary

After running, summarize:

- Files that were auto-fixed
- Remaining errors by file:line:rule
- Formatting changes applied

## No Config Yet?

If linting isn't set up, offer to create minimal ESLint + Prettier configuration.
