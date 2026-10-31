# Atlas stakeholder product brief

**Status:** Planning baseline, not evidence of implementation. **Date:** 2026-10-30.

Atlas is an independent, public-source FedRAMP regulatory research platform. It must answer what documents, laws, policies, controls, rules, KSIs and historical issuances connect, why, according to what evidence, and at which version/time.

## Audiences and jobs

| Stakeholder | Starting question | Desired experience |
| --- | --- | --- |
| Cloud service provider | Which requirements/KSIs are related to my research question? | Search to source-specific requirements, class/applicability, official link and trace |
| Agency | What governs a FedRAMP authorization or reuse-related policy question? | Legal/policy authority trail, version and historical context |
| Advisor | How do published requirements and mappings compare? | Evidence-backed crosswalk/compare; no false equivalence |
| Assessor | Where is the authoritative requirement or assessment reference? | Pinpoint locator, statement, publication/version and scope limits |
| Researcher | How does the entire FedRAMP ecosystem interconnect or change? | Everything 3D graph, accessible alternatives, timeline and citations |

These are user entry points into **one** evidence-backed graph, not five duplicate products.

## Non-negotiable design principles

- Start with a question; do not require graph literacy.
- Retain a meaningful full 3D Everything experience and accessible 2D/table fallback.
- Treat verified published relationships, editorial mappings and speculative candidates differently. Candidate links are never official.
- Preserve exact provenance, revision, source locator, relationship direction and applicability.
- Historical and planned sources are visibly identified; avoid unsupported coverage claims.
- Prefer task-based progressive disclosure, readable typography and robust keyboard paths.
- Public official data only; never import private assessments or internal agency records.

## Already implemented

Existing `README.md`, `SPEC.md`, `docs/progress-report.md` describe a real React/Vite application with Three.js graph, React Flow chart, table, KSI and NIST records, inspectors, provenance and tests. Verify actual behavior before calling anything complete.

## Evaluate for future work, not yet guaranteed

Research-first navigation, tailored launch flows, persistent document comparison, timeline/history ingestion, saved investigations, broader authority chain, scalable graph rendering, extensive usability testing and a comprehensive accessibility audit.

## Initial five user tests

1. CSP finds a KSI and reads the original published mapping and class.
2. Agency follows a legal or OMB authority and recognizes any missing source coverage.
3. Advisor compares KSI and NIST control without claiming equivalence.
4. Assessor finds exact original text/version and assessment caveats.
5. Researcher flies through 3D Everything, finds a source, explores two hops, and returns to context.

See `docs/design/UX_RESEARCH_PLAN.md`.
