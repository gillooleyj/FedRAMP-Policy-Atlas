# FedRAMP Atlas workspace guide

This is the organizational layer for the **existing** FedRAMP Policy Atlas application. It does not replace any application code or the current implementation.

## Where work lives

| Tool | Purpose | Durable record |
| --- | --- | --- |
| ChatGPT Project: FedRAMP Atlas | Stakeholder research, strategy, UX discussion and requirements | Discuss here; commit approved decisions to the repository |
| Codex project: existing FedRAMP-Policy-Atlas checkout | Plan and implement scoped development tasks | Commit work on feature branches and submit pull requests |
| Figma | Shared design system, approved screens, interaction states | Link approved frames in design decisions and task briefs |
| MagicPath | Explore rapid interactive design alternatives | Experimental until reviewed |
| GitHub: gillooleyj/FedRAMP-Policy-Atlas | Code, documentation, plans, provenance, validation, design decisions | Source of truth |

ChatGPT Projects and Codex projects have separate history and are **not** automatically synchronized. Do not store a consequential technical decision only in a chat.

## Existing files to preserve

- `AGENTS.md`: authoritative operating rules, official-source provenance, and public-data-only guardrails.
- `SPEC.md`: existing product and engineering specification.
- `README.md`: current app setup and current implemented behavior.
- `docs/backlog.md`, `docs/progress-report.md`, `design-qa.md`: existing planned work, milestones, and QA records.

## This guide

1. [ChatGPT Project setup](CHATGPT_PROJECT_SETUP.md)
2. [Codex workstreams](CODEX_WORKSTREAMS.md)
3. [Stakeholder research brief](../product/ATLAS_PRODUCT_BRIEF.md)
4. [UX evaluation plan](../design/UX_RESEARCH_PLAN.md)
5. [Safe initial Codex task](../codex/START_HERE.md)
6. [Project organization decision](../decisions/ADR-0001-project-organization.md)

## Workflow

Define the user problem -> agree on research outcome -> prototype alternate workflows -> record an approved design -> plan in Codex -> implement on isolated branch/worktree -> lint, typecheck, test, build, browser QA -> review PR -> merge only after approval.

**Public data only.** No unpublished government information, CUI, private assessments, user credentials or agency endorsement claims.
