---
name: requirement-author
description: Use when drafting a new requirement (REQ-XXXX) for {{PROJECT_NAME}}. Walks through purpose, acceptance criteria, and links.
---

# Requirement Author

## Steps
1. Run `node scripts/next-id.js requirement` to get the next REQ ID.
2. Copy `docs/sdlc/_templates/requirement.md` to `docs/sdlc/requirements/<ID>-<slug>.md`.
3. Ask the user: title, one-paragraph context, 3–5 acceptance criteria (Given/When/Then), priority (must/should/could/wont), and risk level.
4. Fill the frontmatter and body. Set `created` and `updated` to today's date.
5. Set `status: proposed`. Tell the user to mark `approved` when they're done reviewing.
6. Print the file path.
