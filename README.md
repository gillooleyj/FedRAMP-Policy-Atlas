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
npm test             # 42 source fidelity, updater, navigation, and model tests
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

- Drag to pan by default. Choose **Orbit** for rotation, or right-drag to rotate in Pan mode. Scroll toward the pointer or use +/- to zoom. Click points/labels to inspect without moving the camera; search fits the selected neighborhood. Use **Fit connections**, **Back**, and **Fit all** to frame the visible field. **Reset view** restores the starting orientation, center, zoom, and Pan mode.
- Search identifiers (for example `KSI-CNA-EIS` or `ac-2.1`), titles, rule text, or definitions. Enter opens the first result.
- Toggle layers, choose a class, or filter relationship types without resetting the camera or changing node coordinates. Overview edges are sparse. Selection shows its direct connections; enable **All links** for all filtered edges. The starting overview labels only FedRAMP and NIST 800-53. Slight zoom replaces these with family, class, ruleset and KSI-theme labels; closer zoom replaces groups with individual identifiers. Compact, box-free labels are limited to 10 groups or 18 details on desktop (5 or 8 on mobile). Separate zoom-in/out thresholds prevent chatter. Selection reveals its direct neighbors; full titles remain in tooltips and the inspector. Hover underlines labels without repacking them.
- Select an entity to read its source wording, class variants, published mappings, source update log, inherited applicability/effective metadata, full raw record, and exact source revision.
- Use **Focus neighborhood** to isolate and frame adjacent entities. Relationship chips isolate published mappings, definitions, containment, or applicability. Selected edges show direction arrows; clicking a canvas relationship label opens its exact evidence in the inspector. Every listed relationship also has **View edge evidence**.
- **FedRAMP 20x** filters the data to KSI themes/indicators, classes, shared and 20x process rules, definitions, and source documents. KSI control mappings remain inspectable in the drawer; choose Everything to render the NIST endpoints.
- **Accessible table** supports search, pagination, keyboard inspection, and the same provenance drawer. It also works when WebGL is unavailable. Reduced motion respects the system preference and has an explicit checkbox.
- URL parameters preserve entity selection, view, class, and relationship filters. Entity layer toggles, camera coordinates, and neighborhood focus are local session state.
- Export downloads the complete graph, including evidence and source manifests.

## Actual coverage

**1,676 entities / 3,696 verified relationships**, including 245 rules, 17 rulesets, 80 definitions, 46 individual KSIs, 10 KSI themes, 4 named certification classes, 20 NIST families, 324 controls and 872 enhancements. **558 published KSI-to-control mappings**. Zero unresolved references for the implemented extraction paths.

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
