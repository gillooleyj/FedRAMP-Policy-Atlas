# FedRAMP Policy Atlas

A locally runnable, public-source research explorer for FedRAMP Consolidated Rules for 2026 and NIST SP 800-53 Rev. 5. Its first functional milestone connects a navigable 3D Everything View to real, schema-validated data and inspectable relationship evidence.

Independent research software. No FedRAMP, GSA, or NIST affiliation or endorsement. Published control mappings are associations, **not equivalence, compliance satisfaction, or certification determinations**.

## Run locally

Requires Node.js 22.12+ (validated with Node 24.19 and npm 11), Git, and curl for optional source refreshes. No database, credentials, or paid service is required.

```sh
npm ci
npm run dev
```

Open the address Vite prints. The bundled public-source snapshots and generated graph work without live upstream requests. The app does not load external fonts or CDNs.

```sh
npm run ingest       # offline: verify hashes, validate both schemas, regenerate graph/report
npm run lint
npm run typecheck
npm test             # 80 source fidelity, updater, navigation, and model tests
npm run build
npm run preview      # serve the production build
```

Browser checks require Chromium (installed here at `/usr/bin/chromium`):

```sh
# With npm run dev running in another terminal:
npm run test:e2e
npm run test:navigation:e2e
# Optional: CHROMIUM_PATH=/path/to/chromium ATLAS_URL=http://127.0.0.1:5173 npm run test:e2e
```

The browser suite captures desktop and mobile screenshots in `docs/screenshots/` and writes `docs/browser-results.json`. Chromium is launched headlessly with software WebGL for this cloud machine. An ordinary desktop browser can use hardware acceleration.

## Explore

- **Appearance** in the header offers Light, Dark, or device-controlled site colors. The map can use its own Light/Dark palette or follow the site. Preferences are saved locally; theme changes preserve the camera, selection and filters. On phones, Appearance is the palette icon.
- **Overview map** shows the full imported layout with a live view footprint, center crosshair and selection ring. Click a location to recenter without changing zoom or selection; **Camera back** returns. Focus the locator and use arrow keys to travel or Enter/Space to fit the filtered map. It starts collapsed on phones. The locator is a fixed front projection, and faded points are outside the current filters.
- Hover over a point or label for a stable full-title readout. Label tiers remain sources → regions → groups → entities. Important landmarks avoid the locator, with short dotted label guides only when their point is covered. Those guides are display aids, not graph relationships. See [map orientation and theme verification](docs/qa-galaxy-2026-10-30/README.md).

The interface uses the **research** variant of [FedRAMP Site Style v1.0.0](https://github.com/gillooleyj/fedramp-site-style/tree/v1.0.0/skills/fedramp-site-style): a warm light shell, readable source panels and a full-width explorer. The 3D canvas defaults to dark and has its own appearance preference. **Explore**, **FedRAMP 20x**, and **Sources & coverage** are the three primary destinations. **Filters** opens layer, class and relationship controls on demand; Escape closes the drawer and returns keyboard focus. After selection, **Connection types** opens the relationship shortcuts; **Connection levels** stays directly available. See [design and verification](docs/qa-site-style-2026-10-30/README.md).

- Choose **3D Map**, **Flow chart**, or **Table**. Presentation changes preserve the selection, filters, connection depth and FedRAMP 20x scope. Flow mode is shareable with `?mode=flow`; old `?view=table` links remain supported.
- Use **Back** above the diagram (or browser Back/Forward) to restore previous selections, filters, branch scope and saved view. **Up** follows a verified containment parent; the containment breadcrumbs are clickable. **Overview** exits inspection. The bottom **Camera back** control only reverses camera movement. **Explore** clears retained selection/focus and filters, restoring both publisher hubs.
- The 3D map retains eligible context points while inspecting or focusing a neighborhood. Unrelated points and source/group labels are dimmed and remain clickable; explicit layer/class filters still restrict availability. The available-source counts and **Clear filters** show how to recover a restricted scope.
- Flow charts use compact source groups recomputed from the current scope. **FedRAMP 2026 · CR26** and **NIST SP 800-53** are peer source cards. Certification classes appear beneath CR26 as source-defined context; their verified definition/applicability links remain distinct from containment. Back, Up and Overview preserve a fluid return path.
- Flow sections separate rulesets, rule subsets, individual rules, KSI themes and KSIs. Headings have reserved space clear of connectors. Cards combine explicit type badges and icons with shape/color: squared blue rules, rounded pink KSIs, and amber NIST controls.
- The flow chart covers **all 459 imported FedRAMP entities**, including all 17 rulesets, 10 KSI themes, classes and definitions. A NIST branch also exposes the imported catalog. Charts start with 24 primary entities, plus clearly counted source/ancestor context; **Show 24 more** and **Show all** expand the scope. **Fit** keeps cards readable; **Whole chart** shows the complete loaded diagram. Pan to explore larger branches. The full FedRAMP scope has 2,067 internal verified links.
- **Include mapped NIST controls** works before and after card selection, enables the NIST layer when requested, and constrains neighborhood traversal when unchecked. Status text explains whether the current scope contains imported mappings. Select a card for one/two/three connection levels or a connector for pinned evidence. Branch/mapping preferences are shareable as `?mode=flow&branch=theme:CNA&mapped=1`. Reset returns to the chosen branch. Full coverage means the pinned Consolidated Rules dataset, not the entire legal/policy ecosystem. See the [flow structure review](docs/qa-flow-structure-2026-10-30/REPORT.md).
- Drag to pan by default. Choose **Orbit** for rotation, or right-drag to rotate in Pan mode. Scroll toward the pointer or use +/- to zoom. Click points/labels to inspect without moving the camera; search fits the selected neighborhood. Use **Fit connections**, **Back**, and **Fit all** to frame the visible field. **Reset view** restores the starting orientation, center, zoom, and Pan mode.
- Search identifiers (for example `KSI-CNA-EIS` or `ac-2.1`), titles, rule text, or definitions. Enter opens the first result.
- Toggle layers, choose a class, or filter relationship types without resetting the camera or changing node coordinates. Overview edges are sparse. Selection shows its direct connections; enable **All links** for all filtered edges. The starting overview labels only FedRAMP and NIST 800-53. Slight zoom shows five navigational regions: Classes, Families, Rulesets, KSI themes and Definitions. Click a region to travel into it; closer zoom shows its groups and individual identifiers. **Explore groups** lists every filtered family, ruleset, theme, class and definition alphabetically, even when its map label is hidden to avoid overlap. Labels favor the screen center, then stable identifiers, rather than camera depth. Compact, box-free labels are limited to 10 groups or 18 details on desktop (5 or 8 on mobile). Separate zoom-in/out thresholds prevent chatter. Selection defaults to direct neighbors. **Connection levels** expands to two or three hops, fits the camera, and reports counts by shortest-path distance. Farther levels are dimmer. Traversal follows incoming and outgoing verified relationships within all active filters; no transitive mappings or compliance claims are created. **Focus neighborhood** uses the selected depth, and depth is retained in the URL. Full titles remain in tooltips and the inspector. Hover underlines labels without repacking them.
- Select an entity to read its source wording, class variants, published mappings, source update log, inherited applicability/effective metadata, full raw record, and exact source revision.
- Use **Focus neighborhood** to isolate and frame adjacent entities. Relationship chips isolate published mappings, definitions, containment, or applicability. Selected edges show direction arrows; clicking a canvas relationship label opens its exact evidence in the inspector. Every listed relationship also has **View edge evidence**.
- **FedRAMP 20x** filters the data to KSI themes/indicators, classes, shared and 20x process rules, definitions, and source documents. KSI control mappings remain inspectable in the drawer; choose Explore to render the NIST endpoints.
- **Accessible table** supports search, pagination, keyboard inspection, and the same provenance drawer. It also works when WebGL is unavailable. Reduced motion respects the system preference and has an explicit checkbox.
- URL parameters preserve entity selection, view, class, and relationship filters. Entity layer toggles, camera coordinates, and neighborhood focus are local session state.
- Export downloads the complete graph, including evidence and source manifests.

## Actual coverage

**1,676 entities / 3,841 verified relationships**, including 245 rules, 17 rulesets, 80 definitions, 46 individual KSIs, 10 KSI themes, 4 named certification classes, 20 NIST families, 324 controls and 872 enhancements. **558 published KSI-to-control mappings**. Zero unresolved references for the implemented extraction paths.

See [import report](docs/import-report.md) and its [machine-readable counterpart](docs/import-report.json). “Verified” means supported by the pinned source structure, not independently adjudicated legal force or proof of compliance. Class names do not establish program availability. An absent class variant is never copied from another class. Shared rules retain subset actors, paths, classes, framework buckets, effective dates, and original entry/class overrides.

## Source snapshots and ingestion

Pinned upstreams:

- [FedRAMP/rules](https://github.com/FedRAMP/rules/tree/a89d78477ddea98dc57eca24f5007794c2b4eeb6), dataset version `2026.10.13.01`; its Draft 2020-12 schema is pinned at the same commit. Upstream AGENTS.md was read before implementation.
- [usnistgov/oscal-content](https://github.com/usnistgov/oscal-content/tree/f0de6d8d8c059d374f15e0ae07508d82e370fc1d), catalog version `5.2.0`, OSCAL `1.2.3`; validated against NIST's official OSCAL 1.2.3 release catalog schema. This is a Rev. 5 catalog, including withdrawn records as present upstream.

`scripts/sources.mjs` owns explicit source pins. `npm run ingest -- --fetch` retrieves the pinned content over verified HTTPS using curl and the inherited network configuration. The daily monitor discovers upstream revisions explicitly; normal startup and offline ingestion do not perform network sync. Existing snapshot byte hashes must match their manifests. Schema failure saves validation errors and aborts graph promotion.

To monitor newer source revisions, run `npm run updates:check`. Validated changes are staged with a before/after report, and explicit review precedes `npm run updates:promote -- <candidate> --expect-active <base-version>`. The website shows check status and pending reports under Sources & coverage. Offline ingestion follows the active version and preserves older snapshots.

See [daily update operations](docs/daily-updates.md) for failure handling, source/version contracts, review/promotion, scheduler activation, and deployment requirements. The daily GitHub Actions workflow is committed to the default branch; scheduled execution requires Actions to remain enabled. It saves artifacts; it does not automatically deploy the site.

```sh
npm run updates:check
npm run test:updates:e2e  # with the local app running and Chromium installed
```

## Structure

- `scripts/update-core.mjs` and `scripts/update.mjs`: daily source discovery, validation, semantic change reports, staged snapshots, and explicit promotion.
- `src/components/UpdateStatus.tsx`: freshness and change-report interface.
- `scripts/ingest.mjs`: fetching, byte integrity, schema validation, versioned outputs and reports.
- `scripts/graph.mjs`: pure graph transforms with typed relationship semantics and provenance.
- `src/data/types.ts`: client contracts.
- `src/graph/model.ts`: deterministic 3D clustered layout, filtering, search, neighborhood queries.
- `src/components/Universe.tsx`: accessible pan/orbit/fit/back controls and persistent renderer lifecycle.
- `src/graph/flow.ts` / `flow-layout.ts`: bounded source-backed chart slices and compact source-group layouts without historical empty slots.
- `src/components/FlowChart.tsx`: lazy-loaded React Flow cards, connections, evidence interactions and responsive navigation.
- `src/graph/exploration.ts`: bounded, filter-respecting connection traversal and display-only navigation regions.
- `src/graph/universe-engine.ts`: batched points/lines, stable camera, selection ring, directional relationships, picking, semantic labels and cleanup.
- `src/graph/navigation.ts`: camera-fitting math and deterministic label placement.
- `src/App.tsx`: accessible navigation, filters, table, inspector, evidence, source coverage.
- `tests/`: automated source fidelity/model tests and functional Chromium checks.

Layout is navigational and seeded, not an assertion of hierarchy or legal authority. Rendering uses two GPU geometries rather than a mesh per entity. Point sizing changes with distance; hub and individual labels are collision-managed with zoom-dependent detail. This is not yet a force simulation, community detection, or a demonstrated tens-of-thousands-node implementation.

## Website deployment

The app is prepared for GitHub Pages at the repository project path. See [launch instructions](docs/launch.md) for production builds, Pages configuration, publication, and live verification. Preparation or a Git push does not by itself establish that the public URL is live.

## Next operational build goal

Build a **recurring update agent that checks sources daily and updates the deployed website accordingly**, without requiring this chat to remain open. The intended agent will publish routine validated refreshes under an explicit release policy, route exceptions for review, verify the live revision, refresh public check status on no-change days, and retain a working version for rollback. See the [acceptance criteria in SPEC.md](SPEC.md#operational-build-goal-recurring-update-agent).

The existing scheduled-check workflow is a foundation for this goal; unattended publication, production hosting, deployment authorization, rollback, and operator notifications remain to be built and activated. Current promotion still requires explicit review.

## Milestone boundaries

[Progress report](docs/progress-report.md) records delivered features, validation, and remaining work. Not yet included: FedRAMP CTL guidance, SP 800-53B baseline ingestion, legal/OMB chronology, transitive publication-reference ingestion, historical comparison UI, pathfinding, or 10k+ node benchmarks. No inferred relationships are marked verified. Historical update logs are preserved as source records, not interpreted as independently imported historical snapshots.

The available checkout contained README.md, SPEC.md, AGENTS.md, and LICENSE. CODEX_START_PROMPT.md and visual reference attachments were not available; the UI follows the written dark, clustered 3D design brief in SPEC.md.

Future labeling research and flow-chart source coverage are tracked in [docs/backlog.md](docs/backlog.md).

Legal and policy sources are the next ingestion milestone: see [the source roadmap](docs/policy-source-roadmap.md) and [literal citation inventory](docs/policy-reference-inventory.json). Run `npm run inventory:policy` to regenerate it from the active immutable snapshot. Run `npm run test:full-flow:e2e` against the local preview for complete-chart browser checks.

Independent functional and UI/UX browser audits, baseline reproductions and fixed-build evidence are in [functional QA](docs/qa-functional-2026-10-30/REPORT.md) and [UI/UX QA](docs/qa-ux-2026-10-30/report.md). Testing used installed Chromium 154 with a local production build; branded Chrome and live Pages visual verification were unavailable. Run `npm run test:journey:e2e` for return-navigation regression checks.


### Map clarity and KSI class scope

Map points use solid centers and thin, separated rings at closer zoom, with a restrained dark-mode halo. Light-mode connections have stronger contrast. Markers keep their CSS size on high-density screens; large hubs stop growing at 24px.

KSI class scope follows governing process rules, not the presence of class-specific wording. The graph includes seven explicitly named Class A KSIs from **FRC-CLA-MFR (MUST)** and all 46 for Classes B/C/D under **FRC-CSX-MAS (SHOULD, within Minimum Assessment Scope)**. These are process-rule scopes, not assigned KSI normative forces. Five indicators have optional B wording and no D-specific wording. The inspector exposes those distinctions, exact supporting citations and effective metadata. Class inspectors list every linked KSI. The 558 published NIST associations are unchanged.

See the [mapping and visual audit](docs/qa-map-mappings-2026-10-30/REPORT.md) for before/after screenshots, authoritative evidence, validation and remaining limitations. Run `npm run test:map-mappings:e2e` against the local Pages preview on port 4189 (or set `ATLAS_URL`).

For importer corrections with unchanged upstream commits, `npm run updates:rebuild` stages a candidate from the active, schema-validated immutable snapshots and writes a semantic diff. Review that report before using the existing `updates:promote <candidate> --expect-active <version>` command. Rebuilding does not activate the candidate or advance upstream-check timestamps. This repair retains graph `5cda3bb3c29d199d` and activates `8bebe1f392e5feb0`.
