# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-tests/orders.api.spec.ts >> Orders API contract — FR-5,6,8 >> TC-FR8-03: duplicate order does not double-charge
- Location: api-tests/orders.api.spec.ts:34:3

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