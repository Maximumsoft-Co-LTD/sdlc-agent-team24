# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-tests/books.api.spec.ts >> Books API contract — FR-2,3,4,12 >> TC-FR4-02: buy-only book has null priceRent
- Location: api-tests/books.api.spec.ts:44:3

# Error details

```
Error: apiRequestContext.get: connect ECONNREFUSED ::1:3000
Call log:
  - → GET http://localhost:3000/api/v1/books?limit=50
    - user-agent: Playwright/1.60.0 (arm64; macOS 26.0) node/24.15
    - accept: application/json
    - accept-encoding: gzip,deflate,br

```