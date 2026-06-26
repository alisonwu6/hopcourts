# HopCourts — Docs Index

> What to open depending on what you're doing.

| Task | Read |
|---|---|
| Working on an API route or checking request/response shape | `SPEC.md` |
| Changing DB schema or running migrations | `DATABASE_WORKFLOW.md` |
| Checking what's built vs mocked vs pending | `STATUS.md` |
| Wondering why an architectural decision was made | `DECISIONS.md` |
| Starting a design, implementation, or testing session | `.claude/skills/<role>.md` |
| Reading the machine-readable API contract | `../backend/docs/openapi.yaml` |

---

## File Descriptions

### `SPEC.md`
Human-readable API contracts. Documents endpoints, query params, response shapes, auth behaviour, and business rules that OpenAPI alone can't express. **Authoritative for intent.** Update it when any route changes.

### `STATUS.md`
Feature implementation state across the whole app. Tracks what's fully done, what's using mock data, and what's not started. Read at the start of any feature work session. Update when status changes.

### `DECISIONS.md`
One-line log of non-obvious architectural decisions. Records the *why* behind choices that would otherwise confuse a future reader. Append only — never delete entries.

### `DATABASE_WORKFLOW.md`
Step-by-step process for local and remote database changes. Read before touching any migration file.

### `.claude/skills/`
HopCourts-specific checklists for each AI role. Lives in `.claude/` because it is Claude Code configuration, not project documentation. Contains what to read, what to output, and which patterns to follow for this project specifically.

- `.claude/skills/principal-architect.md` — design sessions: what to read, output format, handoff checklist
- `.claude/skills/senior-engineer.md` — implementation sessions: vertical slice order, HopCourts rules
- `.claude/skills/qa-engineer.md` — testing sessions: file locations, test priority order, run commands

### `../backend/docs/openapi.yaml`
Hand-written OpenAPI spec. Edit directly when adding or changing routes. Run `npm run openapi:lint` to validate and `npm run types:api` to regenerate frontend TypeScript types after changes.
