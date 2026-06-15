# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: api-tests/cart.api.spec.ts >> Cart API contract — FR-19 >> TC-FR19-01: add item to cart
- Location: api-tests/cart.api.spec.ts:11:3

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