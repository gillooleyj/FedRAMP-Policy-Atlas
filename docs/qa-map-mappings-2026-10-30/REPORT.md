# Map clarity and KSI class mapping review — October 30, 2026

The visual complaints and the missing KSI/class relationships were reproducible. Both were corrected. This review used current-run screenshots of the production build at the GitHub Pages project path, source-schema validation, exact relationship comparisons and local Chromium 154. It does not certify legal interpretation or accessibility compliance.

## Review steps and health

1. **Light map overview and regional zoom — repaired.** In [the before overview](01-before-light-overview.png), lines nearly disappear against the pale canvas; [closer zoom](02-before-light-close.png) turns colored points into soft blobs. The point shader used a Gaussian opacity across the entire disc, and the light line palette blended almost completely into the background. The replacement uses a solid antialiased center, an annulus separated by clear space, bounded CSS-sized markers and a faint dark-only halo. Rings emerge at useful zoom; small distant points stay dots. Rendering applies the correct output color conversion. Light lines have stronger contrast, while selected relationships retain emphasis. Compare [after overview](05-after-light-overview.png), [after close light](06-after-light-close.png), [after close dark](07-after-dark-close.png), and [2× pixel-density markers](14-retina-markers.png). Camera positions, fixed locator, selection, hover labels and layout semantics are preserved.

2. **KSI/class ingestion and class filters — repaired, source limitations exposed.** The importer previously emitted class edges only for process rules. It populated KSI classes from `varies_by_class`, confusing the existence of a wording override with applicability. Consequently none of the 46 KSIs had class edges, and 41 shared-wording indicators disappeared from every class filter. [The before Class B table](04-before-class-filter.png) contains only five KSIs plus a process rule matching the broad search. The [corrected table](12-class-B-filter.png), searched by the exact `KSI-` identifier prefix, contains all 46. New relationships follow the explicit governing rules described below. Tests independently check every new evidence pointer/value and the exact seven Class A identifiers.

3. **Inspection, flow drilldown and evidence — repaired and verified.** [KSI scope](08-ksi-class-scope.png) is now a dedicated inspector section instead of being buried among control mappings. Shared wording, optional class wording and missing class wording are distinguished. Expand [scope evidence](09-scope-source-evidence.png) for the governing statement, force, source applicability, effective dates, exact indicator wording, and immutable source link. Class inspectors list every linked KSI. Expanded class flow charts contain all 7/46/46/46 KSI cards and their exact verified class edges. The [selected KSI chart](10-ksi-flow-class-links.png) has its 3 class links and 12 NIST associations; toggling NIST off/on retains the class links. Classes remain in their source hierarchy, so some connected cards are outside the initial viewport at readable scale. Use pan, Whole chart, or the inspector links to reach them.

4. **Return navigation, responsive themes and completeness — verified in the tested browser.** Back/Forward, Up, Overview, regional travel, locator clicking/keyboard movement, orbit/reset, stable hover labels, theme persistence, device theme changes and blocked-storage fallback pass. Desktop, tablet and 390/320px phone widths have no document overflow in the exercised paths. [Mobile evidence](13-mobile-scope.png) remains readable and class links support Back without closing the inspector. Full FedRAMP renders all 459 entities and 2,067 internal verified links. The existing table and source-reference views continue working in both themes.

## Authoritative mapping findings

The pinned source revisions below were checked against public repository HEADs during this review and matched. The repair changes extraction, not upstream content or source revision. Both snapshots pass their published JSON Schemas, and all retained source/schema hashes match their manifests.

- FedRAMP Consolidated Rules **2026.10.13.01**, commit [`a89d78477ddea98dc57eca24f5007794c2b4eeb6`](https://github.com/FedRAMP/rules/tree/a89d78477ddea98dc57eca24f5007794c2b4eeb6). [Pinned canonical JSON](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/fedramp-consolidated-rules.json).
- NIST SP 800-53 catalog **5.2.0**, OSCAL **1.2.3**, commit [`f0de6d8d8c059d374f15e0ae07508d82e370fc1d`](https://github.com/usnistgov/oscal-content/tree/f0de6d8d8c059d374f15e0ae07508d82e370fc1d). Exact source URL and hash are in [the import report](../import-report.json).

| Class | KSI links | Governing evidence | Wording distinction |
|---|---:|---|---|
| A | 7 | `FRC-CLA-MFR`: MUST address the explicitly listed items | Seven named KSIs; all have shared statements |
| B | 46 | `FRC-CSX-MAS`: SHOULD apply ALL KSIs within Minimum Assessment Scope; CSX subset explicitly includes B | 41 shared statements; five explicitly optional B variants |
| C | 46 | Same ALL-KSI process rule and explicit C scope | 41 shared statements; five C variants |
| D | 46 | Same ALL-KSI process rule and explicit D scope | 41 shared statements; five lack D-specific wording |

**Class A evidence:** `/FRR/FRC/data/all/CLA/FRC-CLA-MFR/statement` and `/following_information/16` through `/22`, with `/FRR/FRC/info/subsets/CLA/applicability`. The named indicators are KSI-CMT-LMC, KSI-CNA-RNT, KSI-CED-RAT, KSI-IAM-AAM, KSI-IAM-APM, KSI-INR-RIR and KSI-SVC-SIN. The source note about addressing those indicators even when a provider intends to pursue a Rev 5 path later is retained as supporting evidence. Generic `related` references are not treated as mandatory scope.

**B/C/D evidence:** `/FRR/FRC/data/20x/CSX/FRC-CSX-MAS/statement` says: “Providers SHOULD apply ALL Key Security Indicators to ALL aspects of their cloud service offering that are within the FedRAMP Minimum Assessment Scope.” `/FRR/FRC/info/20x/subsets/CSX/applicability` explicitly lists B, C and D, 20x, Program and Providers. Inherited effective metadata is `/FRR/FRC/info/20x/effective`. This rule's SHOULD is retained as **process force**, never copied into an indicator's absent force field.

**Five wording exceptions:** KSI-CNA-EIS, KSI-MLA-ALA, KSI-SVC-PRR, KSI-SVC-RUD and KSI-SVC-VCM have B and C variants. B starts with the literal `**Optional:**`; D has no variant. A class-scope edge does not fill that absence, claim that all indicators are mandatory, or establish program availability. Common KSI-to-NIST associations are not relabeled as class-specific control mappings.

The official FedRAMP website generator corroborates this distinction: [pinned configuration](https://github.com/FedRAMP/2026/blob/8404168e6c150b40e4d0e45152d18965ab27e001/tools/config.json) restricts its Class A KSI reference to indicators referenced by included rules and renders all themes for B/C; its [generator documentation](https://github.com/FedRAMP/2026/blob/8404168e6c150b40e4d0e45152d18965ab27e001/tools/README.md) treats class filters as variant selection, retaining common statements. This website repository was inspected read-only; it is corroboration, not a third graph source. No remote code was executed.

## Exact change and preservation

- **1,676 entities**, unchanged; every raw source record remains identical.
- **3,841 verified relationships**, up from 3,696: exactly **145 KSI→class APPLIES_TO** links added. No existing relationship removed or rewritten.
- All **558 published KSI→NIST control associations** match the canonical JSON exactly, including any explicit variant scope; every control identifier resolves in the pinned NIST catalog.
- Existing **682 rule→class links**, **786 definition links**, and **1,670 containment links** retain their extraction and provenance. All primary relationship pointers resolve.
- New edges preserve class/type/path/audience scope, governing process force, effective metadata, wording qualifier, source revision and supporting pointer/value evidence. Any changed governing sentence or class set stops extraction for review rather than silently applying an old interpretation to a new rule.
- Prior graph `5cda3bb3c29d199d` is retained byte-for-byte. Active graph is `8bebe1f392e5feb0`; [the review diff](../../public/data/updates/reports/8bebe1f392e5feb0.json) records 46 node class-list corrections and 145 additions. Promotion rebuilt the candidate from validated snapshots and verified that diff. No upstream freshness timestamp was advanced by this transform correction.

See [machine-readable findings](mapping-audit.json) and [import counts](../import-report.json).

## Validation and reproduction

- **86 unit/integration tests pass**: source schemas/hashes, all relationship locators, exact published mappings, class applicability, optional/missing wording, unchanged raw records, deterministic rebuilding, immutable history, fail-closed ingestion and promotion, camera/layout, and semantic evidence diffs.
- Lint, TypeScript and the Pages production build pass. The existing large Three.js bundle warning remains.
- **60 browser checks pass:** [mapping/visual](browser-results.json) 19, [galaxy/theme](galaxy/results.json) 19, [return navigation](journey-results.json) 11, [full flow](full-flow/full-flow-results.json) 11. No uncaught JavaScript or WebGL shader errors were recorded.
- [Additional depth checks](depth-results.json) verify exact one/two/three-level map traversal and all 3,841 links. These checks respect the traversal boundary rather than counting extra edges between boundary nodes.
- The first full unit run encountered the environment's child-process EPERM on the updater subprocess test; the complete suite passed with the required process permission. A browser-test caption selector and the separate depth audit's expected boundary calculation were corrected before their successful reruns; neither failure was hidden as a product pass.

Run `npm test`, `npm run lint`, `npm run build:pages`; serve with `npm run preview -- --base=/FedRAMP-Policy-Atlas/ --port 4189 --strictPort`. Then run `npm run test:map-mappings:e2e`. Existing galaxy, journey and full-flow scripts accept `ATLAS_URL` and `ATLAS_QA_DIR` to keep new review evidence separate from prior captures.

## Remaining work

Dense all-entity flow charts and three-level maps still have substantial crossing/overlapping connections. Readable Fit deliberately preserves card scale and requires pan; “Show all” is not a curated presentation. Class cards can be outside a selected KSI's viewport because the chart retains source hierarchy. A future class-specific KSI subview could make that path more immediate without inventing new edges. Continue the already recorded labeling and density research.

Class D wording and program availability need to stay distinct. The separate official website's pathway documentation describes Class D 20x as coming in 2027; that narrative is not ingested into the graph, and the graph's class names/scope do not establish operational availability. Some process rules contain wording overrides for classes outside their subset applicability; this review preserves those raw overrides rather than silently broadening rule scope.

Rule-level control references, CTL guidance, baselines, legal/OMB authority, additional NIST publications and external frameworks remain outside the implemented mapping extraction. Zero unresolved references applies to implemented extraction paths, not to every possible relationship in the regulatory ecosystem.

Testing used local Chromium with software WebGL, including DPR 2; it was not a live Pages browser inspection, physical touch-device test, Safari/Firefox review, screen-reader audit, or comprehensive contrast certification. The environment proxy blocks direct Pages browsing. Network policy and the cloud environment were not changed.
