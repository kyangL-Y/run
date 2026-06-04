# Claude Project Instructions

Before inspecting this project, treat dependency, cache, generated, binary,
and secret directories as out of scope.

Do not read, list recursively, grep recursively, summarize, or otherwise scan:

- private-secrets/
- .git/
- apps/backend/.venv/
- apps/backend/.playwright/
- .pytest_cache/
- node_modules/
- dist/
- build/
- __pycache__/

When asked to check the project:

- Start with source structure only.
- Prefer focused file reads over broad recursive scans.
- Inspect application source under `apps/backend/app`, `apps/backend/tests`,
  `apps/backend/scripts`, and `apps/extension` only when relevant.
- Do not inspect virtual environments, package caches, Playwright artifacts,
  compiled files, binary files, logs, or secret material.
- If a requested task appears to require a denied path, ask for explicit
  confirmation before proceeding.
