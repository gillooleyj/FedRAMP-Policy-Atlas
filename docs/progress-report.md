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

## Fluid return navigation and independent browser QA — October 30, 2026

Two user-requested testing agents independently exercised the production build: one functional tester and one UI/UX tester following Product Design's screenshot-first audit workflow. Both used installed Chromium 154.0.8037.57 through Playwright. Google Chrome was not installed and the environment proxy blocked the live Pages domain; local production-browser evidence is not a live-site or branded-Chrome certification.

Verified root causes and fixes:

- **Apparent NIST-only map:** the UX tester reproduced NIST selection → Focus neighborhood → Everything leaving the NIST selection and 21-node scope active. Everything now clears stale selection/focus and explicit filters, and restores both FedRAMP and NIST source hubs. Clean-load probes at six viewport widths already contained both datasets; no FedRAMP source records were missing.
- **Return navigation:** graph-level Back, Up, Overview and containment breadcrumbs work across map, flow and table. Back and browser Back/Forward restore actual selection, scope, expansion limit and saved map/chart view. Up follows verified containment only; no class/program hierarchy is fabricated. The older camera-only control is visibly named Camera back.
- **Clickable context:** map selection and focus keep all eligible points, dim unrelated context, and retain source/group landmarks where visible. Explicit filters still apply, with available-source counts and Clear filters. Testers clicked a dimmed FedRAMP source successfully while inspecting a NIST/KSI neighborhood.
- **Stable flow cards:** the initial branch layout seeds persistent card anchors. Selecting a class no longer reranks it from the left to the far right. New neighbors occupy free positions; published edge direction and evidence stay intact. Selection centers at readable zoom. An additional tester-discovered desktop-to-mobile resize issue was fixed with selected-card recentering on surface resize.
- **Mobile recovery:** Back/Up/Overview sits above the visualization. Escape dismisses Filters and returns focus to its trigger. The full drawer focus-management and assistive-technology audit remain follow-ups.

Validation: 66 unit/integration tests passed; lint, TypeScript and production build passed. The existing flow (17), map-polish (18), exploration (16), complete-flow (11) and new journey (11) browser checks passed during this iteration. The final targeted journey run explicitly covered resizing an already selected desktop card to mobile. Independent final-build functional QA passed 38 checks/observations; independent UI/UX retesting passed 13 checks with screenshot inspection. No uncaught browser errors were recorded. The existing Three.js bundle-size advisory remains.

Evidence and reproducible scripts are in `qa-functional-2026-10-30/REPORT.md` and `qa-ux-2026-10-30/report.md`, with baseline and fixed-build screenshots kept separately. Boundaries remain physical-device testing, screen readers, other browser engines, live Pages visual access, dense edge routing and comprehensive contrast/target-size validation. The pinned source graph, applicability and provenance were not changed: 1,676 entities, 3,696 verified relationships and 558 published KSI mappings.

## Flow structure correction and whole-journey QA — October 30, 2026

The prior coordinate-anchoring approach accumulated empty space across browsing sessions. Previous QA checked coordinate stability and individual controls without testing the complete path that the user reported. Reproduced the failure, rejected an initial redesign whose Fit still made cards too small, and replaced historical anchors with compact current-scope source groups. See the [review and screenshots](qa-flow-structure-2026-10-30/REPORT.md).

FedRAMP CR26 and NIST SP 800-53 are peer source cards. Classes are grouped beneath CR26 as source-defined context, supported by the Certification Class definition; no new verified containment links were invented. Actual ruleset/subset/rule and theme/KSI ancestry remains available while drilling down. Definitions sit in a separately labeled section. Solid containment and dashed associations retain their exact endpoints, direction and evidence. Source inspection prioritizes groups before definitions. Exact class-title search now selects the class.

The mapping toggle works during selection and enables the NIST layer when requested. Turning it off excludes NIST descendants before neighborhood traversal. Explicit NIST reference context works within 20x/Class B without reassigning FedRAMP applicability to NIST controls. Empty mapping scopes are explained. Primary batches are 24 with separately counted source/ancestor context; readable Fit and explicit Whole chart have distinct purposes. Back, Up, Overview, URL state and selected-card recovery remain available.

Validation: 71 unit/integration tests passed; the 21 affected flow/journey tests passed again after the source-context correction. Lint, TypeScript and production Pages build passed. Flow 17, full-coverage 11, return-navigation 11 and shared-app 18 browser checks passed. Independent functional review passed 26 checks; UX review passed 16 groups plus targeted definitions and resize retests. Two independent testers exercised all four classes across three depths, repeated mapping changes, source/definition/KSI/NIST drill-downs, Back/Forward, keyboard and pointer evidence, 20x/class/layer combinations, and desktop/tablet/mobile layouts. Their exact build coverage and evidence are linked in the review. A fixed 750ms resize assertion observed an unfinished animation after software-rendered 3D journeys; it now waits for the actual selected-card bounds with a 5s deadline, retaining the same final geometry assertion. Independent resize reproductions also passed.

The pinned source graph is unchanged: 1,676 entities, 3,696 verified relationships, 558 published KSI mappings. Dense shared edge gutters and mobile toolbar placement remain recorded improvements. Tests used local Chromium 154, not branded Chrome; live Pages browser access remains blocked by the environment proxy. Physical-device, other-engine and exhaustive assistive-technology validation remain open. The existing main-bundle-size advisory remains.

## Clear flow headings and entity identities — October 30, 2026

Corrected section headings that overlapped incoming connectors. Headings now occupy reserved rows, with routing tracks below and a foreground label layer. Split misleading combined rule/KSI headings into separate, accurately named sections. Added explicit card type badges and icons, squared blue rule cards, rounded pink KSI cards and entity-colored selection outlines. Context and connection distance remain secondary footer text. Source records and verified relationships are unchanged.

Validation: 71 automated tests, lint, TypeScript and production build pass. A new seven-state browser regression measures all rendered connector segments against heading bounds and checks type labels/icons/colors/shapes; no intersections or browser exceptions occurred. Desktop and mobile screenshots are in [the visual correction report](qa-flow-labels-2026-10-30/README.md).
