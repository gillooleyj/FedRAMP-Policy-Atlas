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

## Map label and reset corrections

Addressed the reported pointer-focus border, hover-driven label repacking loop, initial label hierarchy, similar FedRAMP/NIST colors, and lack of a canonical view reset. Added stationary-layout caching, independent detail eligibility, stable label anchors, explicit zoom tiers, keyboard-only canvas focus feedback, blue/amber publisher colors, and a dedicated Reset view alongside Fit all. Source data, revisions, and verified mappings are unchanged. Added focused hover/overview/color/reset browser checks; see map-polish-browser-results.json and updated navigation implementation notes.

The label/reset corrections passed 40 automated tests and 54 production-browser checks, including repeated-hover label stability, initial group-only labels, keyboard focus preservation, and canonical reset after orbiting. See [map polish report](map-polish.md) for screenshots and evidence limits.

## Source-first overview and quieter label levels — 2026-10-30

The starting map now shows only FedRAMP and NIST 800-53. A slight zoom switches to groups, and a closer zoom switches to individual identifiers. Each level replaces the previous labels, with separate exit thresholds to prevent chatter. Single-line labels have no surrounding boxes; desktop density is capped at 10 groups / 18 details, and mobile at 5 / 8. The map explains its current level with a short zoom hint. Hover remains stable, selected relationships retain evidence access, and reset restores the source-only overview when no entity is selected.

Validation: lint, TypeScript and the Pages production build pass; all 42 automated tests and 51 browser checks pass. Screenshots capture the source, group, detail and mobile views. Browser checks exercise the local production build under `/FedRAMP-Policy-Atlas/`; live Pages browser access is restricted in this environment. The existing Three.js bundle-size warning remains. Source coverage remains 1,676 entities, 3,696 verified relationships and 558 published mappings.

## Regional navigation and selectable connection depth — 2026-10-30

The first zoom now shows five navigational regions, including one Classes label. Clicking a region travels to its members; Classes reveals the four real class nodes. Explore groups lists all 51 imported families, rulesets, themes and classes, plus definitions, alphabetically within the current filters. Label ranking now favors the screen center with stable tie-breaking; the menu keeps groups discoverable when collision avoidance hides their map labels. The source-only default view is retained.

Selecting an entity exposes a one-, two- or three-level connection selector. Expansion follows existing verified relationships in either direction through the currently allowed nodes and edges. Counts report shortest-path distance; farther levels are dimmer. Camera fitting, neighborhood focus and URL state use the chosen depth. Original edge provenance and direction remain intact, and indirect paths are not presented as new mappings. For KSI-CNA-EIS without filters, level one has 16 neighbors and level two adds 102 (119 nodes including the selection).

Validation: all 50 automated tests, 67 browser checks, lint, TypeScript and the Pages build pass. Screenshots and detailed behavior are recorded in `exploration-navigation.md` and `exploration-browser-results.json`. Browser checks use the local production build at the Pages project path. Coverage is unchanged at 1,676 entities, 3,696 verified relationships and 558 published KSI mappings. The existing Three.js bundle-size warning remains.

## Flow chart as the second explorer view — 2026-10-30

The explorer now offers 3D Map, Flow chart and Table. The chart follows the supplied reference's rounded cards, colored accents, dotted canvas and curved directional connections while retaining the existing publisher colors and authoritative graph. A full-width, explicitly representative overview contains 13 real entities and 12 verified relationships. Cards share the entity inspector; mouse and keyboard connector activation expose exact pinned evidence. The same selection, class/relationship filters, connection depth and FedRAMP 20x scope work across presentations. Existing table deep links remain valid.

Large neighborhoods display an honest total, start with 60 cards and support Show 60 more. The selected entity and inspected edge endpoints remain visible. Dense ranks wrap into short columns; relation labels appear on hover/focus/inspection to reduce clutter. Pan, pinch, zoom, fit, reset, responsive controls and readable mobile starting zoom are implemented. React Flow and Dagre load only with the flow view.

Future 3D-labeling research is recorded in `docs/backlog.md`, including No Man's Sky-inspired navigation, label priority alternatives, discoverability and user testing. Legislation, OMB policy and extra NIST/baseline documents in the reference remain a sourced-ingestion follow-up. No new source entities or inferred edges were added.

Validation: 58 automated tests, 84 browser checks, lint, TypeScript and the production Pages build pass. Screenshots, visual QA and behavior notes are in `design-qa.md`, `docs/flow-chart.md` and `docs/flow-browser-results.json`. Browser validation uses the local production build under the Pages project path. The pre-existing main-bundle size warning remains; the new chart renderer is split into its own module.

## Complete imported FedRAMP flow chart — 2026-10-30

- Replaced the representative default with a full imported FedRAMP scope: 459 entities and 1,922 internal verified relationships (454 containment, 786 definition and 682 applicability links). These are all entities from the pinned Consolidated Rules version 2026.10.13.01, not a claim of complete legal/policy coverage. Existing source graph, revisions, applicability and evidence remain unchanged.
- Added a complete branch directory for 17 rulesets, 10 KSI themes, all four classes and all 80 definitions. Rulesets include every contained subset and rule; themes include every KSI. Optional NIST context follows only published mappings and exact containment ancestors. The earlier compact cross-framework example remains available.
- Added Show all alongside incremental 60-card expansion; counts expose both the displayed and complete scope. Branch/mapping preferences persist in URLs. Search, class/relationship/layer filters, depth selection, evidence inspection and all three presentations remain shared. Reset returns to the chosen branch.
- Large branch charts open at their starting columns for readable text, with panning and explicit Fit for the entire loaded chart. Layout uses containment when present while preserving all displayed cross-link endpoints. Full diagrams remain dense; branch views and the table are the practical reading tools.
- Validation: 62 automated tests passed, including full coverage, branch reachability, mapping ancestry, filtering and candidate rejection. Lint, TypeScript and production Pages build passed; the pre-existing Three.js bundle-size advisory remains. A sandbox-only updater subprocess failure passed when rerun with the required process permissions. Browser checks cover the full chart (11), flow regression (17), and shared app regression (18). Screenshots and JSON results are retained in docs. These are local Chromium checks, not physical-device or live-site visual certification.
- Added a reproducible inventory of 18 literal mentions across five legal/policy/standard targets in the active FedRAMP snapshot. Verified every quotation against its exact JSON pointer. This inventory emits no legal edges. `policy-source-roadmap.md` specifies the next ingestion slice: official law and OMB texts, pinpoint citations, revisions/effective dates/applicability, historical relationships and daily update review. FISMA and other regulations remain planned sources, not newly verified data.
