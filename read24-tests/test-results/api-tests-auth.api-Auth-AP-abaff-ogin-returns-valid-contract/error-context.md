# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-tests/auth.api.spec.ts >> Auth API contract — FR-1 >> TC-FR1-02: POST /auth/login returns valid contract
- Location: api-tests/auth.api.spec.ts:16:3

# Error details

```
Error: apiRequestContext.post: connect ECONNREFUSED ::1:3000
Call log:
  - → POST http://localhost:3000/api/v1/auth/login
    - user-agent: Playwright/1.60.0 (arm64; macOS 26.0) node/24.15
    - accept: application/json
    - accept-encoding: gzip,deflate,br
    - content-type: application/json
    - content-length: 56

```