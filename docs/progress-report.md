# First functional milestone

Implemented 29 October 2026. This is an end-to-end public-data application, not a demo graph or an architecture-only deliverable.

## Delivered

- Local React/TypeScript application with a batched Three.js 3D Everything View; orbit, pan, zoom, reset, node/label picking, search-to-focus, layers, relationship/class filters, and neighborhood exploration.
- Dedicated 20x view, individual KSI records, original class variants, explicit inherited rule applicability, and all published KSI-to-NIST control associations from the pinned dataset.
- Inspector with original source records, exact statements/forces, class-specific missing-value handling, update logs, inherited timing, and per-edge evidence with immutable commits and JSON pointers.
- Searchable, paginated accessible table, keyboard-operable controls, responsive mobile layout, reduced-motion support, and WebGL fallback.
- Offline source snapshots, byte hashes, schema validation for both sources, deterministic/versioned graph output, stable IDs, and generated import reports.
- Source coverage screen, complete JSON export, deep links for entity/view/class/relationship filters, and explicit coverage caveats.

## Validation

- Both full datasets pass their published JSON Schemas.
- Lint, TypeScript check, production build, and 12 automated ingestion/model tests pass.
- Eighteen browser checks against the production build cover real WebGL startup, camera zoom/orbit, all-edge rendering, relationship filters, search selection, class variants, published mapping provenance, neighborhood focus, deep-link reload, table search/inspection, nested NIST statement rendering, class filtering, source coverage, 20x navigation, and mobile navigation/layout. No uncaught browser errors. See [current browser results](browser-results.json).
- [Import report](import-report.md): 1,676 entities; 3,696 verified relationships; 558 published mappings; zero unresolved references in implemented extraction paths. Exact source versions, commits, hashes, and retrieval timestamps are recorded in the report and manifests.
- Offline re-ingestion regenerates the same graph version. Revision tests simulate a source change and confirm stable entity IDs with changed record hashes without mutating the previous graph.

## Screenshots

- [Everything, desktop](screenshots/everything-desktop.png)
- [KSI inspector and edge provenance](screenshots/ksi-provenance-desktop.png)
- [Sources and coverage](screenshots/sources-desktop.png)
- [Everything, mobile](screenshots/everything-mobile.png)

## Remaining scope and limits

This slice imports real rules and controls, but does not complete every Milestone 1 acceptance item in SPEC.md. Baseline and FedRAMP CTL guidance ingestion remain. NIST source records include parameters and assessment parts in raw metadata, but those are not separate navigable entities. Legal/OMB authority, historical chronology, document references, multi-hop paths, and comparison UI remain for later slices. Common KSI mappings and class-specific statements remain distinct; the app makes no certification availability or compliance claims.

The graph is a deterministic spatial arrangement of real records with sparse default edge rendering. It has not been benchmarked at 10k+ nodes or audited for full accessibility conformance. The current graph payload is approximately 11 MB before HTTP compression; incremental loading and a query API would benefit larger imports. Browser tests use headless Chromium software WebGL; mobile screenshots emulate the viewport and do not establish physical-device GPU performance. Production build reports the expected large Three.js bundle; future work can defer the renderer for table-only use.

Only the written design specification was available. CODEX_START_PROMPT.md and image references were absent, so screenshot fidelity to those attachments could not be assessed. No external deployment or push was performed.

## Reusable environment configuration

Saved `install_script` (`npm ci` followed by offline ingestion) and `start_skill` (existing isolated checkout, development server, readiness and verification instructions) to the cloud environment draft. Saving does not publish or execute the configuration. Review and save the draft in environment settings, then publish to make the prepared environment reusable.

## Daily update slice

Added live upstream monitoring, immutable candidate snapshots, semantic before/after reports, explicit validated promotion, atomic graph selection, and source freshness/pending/failure UI without changing the 3D visual direction. A daily GitHub Actions workflow is supplied but not activated remotely. See [daily update operations](daily-updates.md), [update browser results](update-browser-results.json), and the source-watch screenshots for evidence and activation/deployment limits. The test suite now includes 12 original ingestion/model tests plus 15 update lifecycle tests. No remote push or public deployment occurred.

## Recurring agent build goal

Recorded the next operational goal in SPEC.md: an independent daily agent that updates the deployed site after validated source refreshes, publishes freshness on no-change runs, and verifies live revisions. Added release-policy, exception-review, persistence, failure recovery, rollback, and notification acceptance criteria. This is planned work; no agent, remote schedule, deployment, or publication was activated by this documentation change.

## Initial public launch

Published the application source to main and the production build to gh-pages. GitHub's branch-based Pages deployment succeeded; see [launch evidence and handoff](launch.md#initial-launch-result). Production testing under the project URL prefix passed 27 automated tests and 25 browser checks. The separate main deployment action is blocked by the existing github-pages environment's allowed-branch policy; an owner settings change is required for that automatic route. Direct public-site HTTP verification was blocked by this environment's network policy. No environment protection was bypassed.

## Navigation and Node 24 Actions

Updated the full Actions runtime chain to verified Node 24 releases and confirmed a successful GitHub deployment without the Node.js 20 annotation. Implemented default pan/explicit orbit, pointer-centered zoom, stable camera/layout across selections and filters, fitted neighborhoods, camera Back, individual labels revealed at close scale, selected-node identity, typed relationship chips/arrows, and direct canvas-edge evidence. The current data coverage is unchanged. See [implementation and validation](navigation-implementation.md) and refreshed desktop/mobile screenshots. NIST publication-reference and ISO-crosswalk expansion remain future ingestion work.
