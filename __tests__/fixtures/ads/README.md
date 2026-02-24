# Ad fixtures (no network in tests)

These files are **frozen fixtures** of the Google sample VAST/VMAP URLs used by `__tests__/ads.sampleUrls.test.ts`.

Why:
- Unit tests must not fetch external URLs.
- We still want to test against **real** payloads and prevent regressions.

How to (re)generate:

```bash
npm run test:fetch-ad-fixtures
```

This downloads each URL and writes its response into this directory.

Commit the generated files so CI stays offline.
