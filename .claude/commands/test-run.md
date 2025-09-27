# Run tests (non-watch mode)

Execute test suite and summarize results without attempting fixes.

## Command

```bash
npm test --silent -- --ci --reporters=default --colors
```

## Failure Handling

If tests fail:

1. List failed test files
2. Show first failure message for each file
3. Summarize total failures vs passes
4. Do NOT attempt to fix issues without asking

## No Tests Yet?

If no test configuration exists, suggest adding basic Jest setup for future use.
