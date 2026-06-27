# Architectural Decisions

> Append one line per decision. Format: `YYYY-MM-DD — [area] decision and reason.`
> Only record non-obvious choices — things a future reader would otherwise question.

---

2026-06-27 — [venues] `today_sessions_count` SQL currently uses `AT TIME ZONE 'Australia/Brisbane'` to convert UTC→Brisbane before date comparison (fixes a bug where sessions starting after midnight UTC but before 10am Brisbane were miscounted as "today"). Preferred future form: `(s.starts_at + INTERVAL '10 hours')::date = (NOW() + INTERVAL '10 hours')::date` — avoids timezone name string dependency and is explicit about the fixed UTC+10 offset. Brisbane has no DST so the hardcoded offset is safe. If multi-city support is added, replace with a per-venue `timezone` column.
