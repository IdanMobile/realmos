# RealmOS — STOP CHECK Gates

Stop checks are mandatory review areas.

They prevent the project from drifting, becoming unsafe, or accumulating broken architecture.

## How Stop Checks Work

At every `[STOP]` checkpoint:

1. Stop implementing.
2. Run commands.
3. Review outputs.
4. Compare against done criteria.
5. Fix issues.
6. Only then continue.

## Standard Commands

```bash
pnpm typecheck
pnpm test
pnpm lint
```

If the phase has UI:

```bash
pnpm dev
```

If the phase has API:

```bash
curl http://localhost:4100/api/health
```

## STOP 0 — Setup Review

Confirm repo/tooling work.

## STOP 1 — Contract Review

Prevent data chaos.

## STOP 2 — Dashboard Review

Make sure UI is useful before backend work.

## STOP 3 — API Review

Ensure persistence and API work safely.

## STOP 4 — Governance Review

Critical safety checkpoint. Pass only if safety tests prove risky actions cannot bypass approval.

## STOP 5 — First Magic Moment Review

Validate idea-to-business experience.

## STOP 6 — Agent Lifecycle Review

Ensure Necromancer is not chaotic.

## STOP 7 — SpecKit Review

Ensure artifacts are buildable.

## STOP 8 — Memory Review

Prevent creepy/useless memory.

## STOP 9 — Cost Review

Prevent silent spending.

## STOP 10 — World Review

Keep visual dream aligned with data.

## STOP 11 — Tool Safety Review

Prevent dangerous local automation.

## STOP 12 — MVP Readiness Review

Confirm personal MVP is usable.
