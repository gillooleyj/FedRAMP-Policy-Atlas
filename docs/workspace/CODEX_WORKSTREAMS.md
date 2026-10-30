# Codex organization for Atlas

Open the **existing** `gillooleyj/FedRAMP-Policy-Atlas` repository in Codex. Create one task thread per clear outcome; use branches/worktrees for parallel code changes. These are suggested thread names, not folders Codex creates automatically.

| Lane | Thread prefix | Scope |
| --- | --- | --- |
| 00 | `Product & UX` | User jobs, interaction design, Figma handoffs, accessibility |
| 01 | `Explorer & Graph` | 3D map, flow chart, table, inspector, navigation |
| 02 | `Regulatory Sources` | Public official source ingestion, schema/pinning/versioning |
| 03 | `Semantic Relationships` | KSI/FRR/FRD, classes, lawful authority and edge provenance |
| 04 | `Research Features` | Search, comparison, history/timeline and saved investigations |
| 05 | `QA & Delivery` | Automated checks, visual regression, performance, CI |

## Before any modification

1. Read `AGENTS.md`, `SPEC.md`, and `README.md`.
2. Inspect the current relevant code, tests, recent QA, and `docs/backlog.md`.
3. Identify a narrow task and write acceptance criteria.
4. Use plan-first mode for significant changes.
5. Work in a scoped Git branch or worktree.
6. Avoid unrelated changes and uncontrolled dependency additions.

## Before a PR

Run `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`. For UI work, run the applicable Playwright/browser checks and document what was actually tested.

Explain changes, screenshots, citations/source versions if relevant, tests, limitations and remaining work. **Do not auto-merge or deploy.**

## First Codex prompt

```text
This is my existing FedRAMP Policy Atlas repository.
Do not make changes yet. Read AGENTS.md, SPEC.md, README.md,
docs/backlog.md, and docs/workspace/README.md. Inspect the actual
code and test setup. Summarize what is implemented, what is still
planned, major UX pain points, and the safest next three work items.
Propose a Codex task structure and acceptance criteria. Respect
public-data-only and provenance rules. Do not rewrite the application.
```
