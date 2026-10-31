# ADR-0001: One existing Atlas repository, separate planning and implementation surfaces

- **Date:** 2026-10-30
- **Status:** Proposed, for owner review

## Context

Atlas already has implementation code, a mature `AGENTS.md`, `SPEC.md`, data ingestion, tests and extensive UX QA. It now needs stakeholder research, iterative design and parallel implementation without losing authority/version decisions.

## Decision proposed

Keep **gillooleyj/FedRAMP-Policy-Atlas** as the canonical repository. Use one ChatGPT Project named **FedRAMP Atlas** for planning and research, one Codex project rooted in the existing repository for code tasks, and Figma for approved visual design. MagicPath is a fast exploration tool. Record accepted choices and shipped behavior in reviewed GitHub changes, not conversational memory alone.

## Consequences

- No framework migration or monorepo reorganization now.
- Existing `AGENTS.md`, `SPEC.md`, `README.md`, source data and QA remain untouched.
- Parallel Codex work goes through narrow worktrees/branches, with scoped ownership and test gates.
- Changing the original 3D-first navigation requires explicit UX approval.
- Public-source-only and relationship-provenance constraints remain mandatory.

## Alternative rejected

Creating a fresh repository or five stakeholder-specific applications now would fragment existing functionality and evidence requirements with no demonstrated user benefit.
