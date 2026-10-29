# FedRAMP Policy Atlas | Codex Handoff

**Project:** FedRAMP Policy Atlas  
**Status:** Initial build brief, 29 October 2026  
**Scope:** A public-source, navigable, citation-grounded 3D knowledge graph of the FedRAMP regulatory and technical ecosystem, including FedRAMP Rev. 5 and 20x.

## How to start

1. Create a new GitHub repository named `fedramp-policy-atlas` and prepare a **Codex Cloud environment** connected to it. As of October 2026, an environment must first be created/published on web or desktop before it can be selected for mobile cloud tasks. A running PC or Mac is not needed once Codex Cloud is configured.
2. Upload the contents of this package into the repository, or attach `SPEC.md`, `AGENTS.md`, and `CODEX_START_PROMPT.md` to a Codex task. The images in `reference-images/` are **visual references only**, not application data.
3. Paste `CODEX_START_PROMPT.md` into Codex. Ask Codex to implement the first end-to-end vertical slice, not to stop after generating a plan.
4. Review the screenshot, running app, data import report, tests, and documented limitations before merging.

## What you should get in the first implementation

- Navigable 3D *Everything* graph: orbit/pan/zoom, fly-to-search, pick-to-focus, color-coded clusters, toggles, legend, detail drawer, and a 2D accessible fallback.
- Import pipelines for machine-readable **FedRAMP 2026 Consolidated Rules** and **NIST SP 800-53 Rev. 5 OSCAL**, with provenance and source commits captured.
- FedRAMP 20x view with **Class A/B/C/D** applicability, rulesets, rules, definitions, KSI groups and individual KSIs, and their explicitly published NIST control mappings.
- A history and authority starter set, plus a schema ready for versions, amendments, supersession, and effective dates.
- Locally runnable software, seed data, unit tests, a README, and a screenshot or short demo capture.

## Important constraints

- Public authoritative content only. Never use user credentials or work-system data. Do not use any restricted/CUI/classified content.
- Do not invent nodes, relationships, citation anchors, legal force, applicability or KSI-to-control equivalency.
- The project is a research and navigation tool, not an official FedRAMP service, certification engine, or legal determination.
- Treat *related control mapping* as a referenced association, not automatically as equivalence or compliance satisfaction.
- The graph must have **provenance**: every verified relationship has a traceable source document/version/locator.
- Store a snapshot/version or commit for upstream data, and expose when it was last synced. Never quietly overwrite prior versions.

## Authoritative starter sources

1. FedRAMP Consolidated Rules canonical data: https://github.com/FedRAMP/rules (JSON and schema; read the repository's `AGENTS.md`).
2. FedRAMP Consolidated Rules site: https://www.fedramp.gov/2026/
3. FedRAMP 20x: https://www.fedramp.gov/20x/
4. NIST OSCAL content: https://github.com/usnistgov/oscal-content (SP 800-53 Rev. 5 catalog; SP 800-53B baselines).
5. FedRAMP 2026 website generation project: https://github.com/FedRAMP/2026
6. OMB and legal authority sources: official omb.gov/whitehouse.gov, congress.gov, govinfo.gov, and uscode.house.gov sources; verify specific text and history before ingestion.

See `SPEC.md` for full requirements and acceptance criteria.
