# Independent source and functional review — October 30, 2026

## Result and tested build

**26 final functional checks passed**, plus one build-identification record. This count is 15 mixed-session checks, 7 combined-scope checks and 4 source-context/pointer checks. All final runs used **`index-ig61FBXY.js` / `FlowChart-DYkcUjZb.js`**, the local production build at `http://127.0.0.1:4187/FedRAMP-Policy-Atlas/`. No uncaught browser exceptions occurred.

Browser: Chromium 154.0.8037.57, automated through Playwright; branded Google Chrome was not installed. Desktop viewports were 1680×1246 and 1512×1040; the primary session continued into a 390×844 mobile viewport. User-facing dates use America/New_York. This is local production-build testing, not a live Pages certification. The configured proxy blocked the live Pages destination in the earlier test session; no bypass was attempted.

Evidence:

- `final-session-results.json` — 16 records: one build identification and 15 functional checks.
- `final-scoped-session-results.json` — 7 checks, recording the final asset directly.
- `final-definitions-pointer-results.json` — 4 checks, recording the final asset in its first record.
- Screenshots prefixed `final-` in this directory; these were visually reviewed, not just generated.
- Reproducible scripts: `session-final.mjs`, `scoped-session-final.mjs`, `definitions-pointer-final.mjs`.
- Separate read-only source validation: `source-audit.mjs` and `source-audit-results.json`; detailed citations in `source-review.md`.

## What the prior tests missed

The preceding QA tested an isolated class selection and rewarded preservation of the card's original coordinate. It did not check accumulated empty layout space after visiting unrelated cards, or whether the mapped-NIST option remained usable after selecting a card. That allowed an actual usability problem to pass.

The new baseline reproduction followed default flow → KSI-CNA-EIS → ac-2 → FedRAMP source → class:D → Fit. It produced 60 cards spread across **12,572×696** model units, and Fit reached **0.08** zoom. The mapped-NIST checkbox was disabled after selection. These are reproduced product defects, not merely different visual preferences. Baseline evidence remains in `baseline-session-results.json` and `baseline-*.png`.

The final comparison deliberately uses whole browsing sessions, current-scope layout bounds, control availability, actual SVG pointer hits and source fidelity rather than an unchanged x-coordinate alone.

## Final findings

### Accumulated whitespace and unreadable Fit: resolved in the tested sessions

The same mixed session now produces **24 neighborhood cards plus 7 source/ancestor context cards**, across **1,096×1,944** model units. Readable Fit uses **0.7** zoom. A fresh Class D deep link and the Class D scope reached after the mixed session produce exactly the same entity positions, confirming that visited cards no longer reserve distant empty slots.

The initial display batch is intentionally smaller. More and Show all expose additional entities. Fit keeps the selected area readable; the separately labelled Whole chart provides an overview of every displayed card. In this session Whole chart used approximately 0.249 zoom, and Fit returned to readable scale without closing the inspector. Whole chart is still an overview, not a promise that all labels can be read at once.

Relevant screenshots: `final-mixed-class-d-fit.png`, `final-class-d-three-levels.png`, `final-mobile-mixed-session.png`.

### Mapping controls during selection and scope changes: resolved in the tested sessions

Tested NIST entity layer off → selected FedRAMP source → Include mapped NIST controls on. The checkbox remains enabled, enables the NIST layer, retains the selected source and shows source groups rather than only definitions. Continuing into KSI-CNA-EIS shows all **12** exact published mappings. Toggling off removes NIST descendants while keeping source context; toggling back on restores mappings. Keyboard evidence inspection resolves the precise original mapping pointer.

The all-class session exercised **A, B, C and D**, each at **1, 2 and 3 connection levels**, with repeated mapping off/on changes. All drawn connectors resolve to original verified edge IDs and both displayed endpoints. No direct FedRAMP→class or FedRAMP→NIST containment edge was invented. Empty class mapping scopes are not filled with inferred relationships.

A separate combined-scope session exercised **FedRAMP 20x + Class B + NIST layer disabled**. Enabling mappings retained the class and 20x scope and revealed all 12 KSI-CNA-EIS mappings. Depth changes and repeated toggles worked; Back/Forward restored mapping state and scope. Class B Optional wording and missing Class D wording remained intact. Relationship filtering retained only actual mapping connectors.

Relevant screenshots: `final-source-toggle.png`, `final-mapped-ksi-evidence.png`, `final-20x-class-b-mappings.png`.

### Source organization and provenance: supported by the reviewed sources

FedRAMP and NIST source cards occupy peer root positions. Classes appear within the FedRAMP source-origin collection and carry the “defined in CR26” explanation. This is source grouping, not a newly asserted authority relationship. Every displayed entity and connector checked against the unchanged graph resolves to an existing source-backed record.

The corrected Definitions branch contains only definitions and source context; it does not add unrelated classes merely because a source card appears. Explicitly selecting the FedRAMP source adds the four source-defined classes as labelled context.

An actual visible routed SVG segment was located with `getPointAtLength` and browser `elementFromPoint`, then clicked with the mouse. It opened the matching original `/FRR/CCM` edge evidence. Clicking the middle of a long SVG path's bounding box is not equivalent to clicking the visible path, so this test uses a real rendered segment.

Relevant screenshots: `final-definitions-no-classes.png`, `final-pointer-edge-evidence.png`.

### Return navigation and responsive continuation: passed

After the class/hop/toggle session, Overview → Back restored selected Class D at depth 3. NIST branch navigation retained a peer source collection; hiding NIST while a NIST node was selected returned to the FedRAMP overview. The same long session then continued at mobile width: the selected card remained within the canvas, the mapping toggle remained enabled, and no document horizontal overflow appeared.

## Source review conclusions

Pinned FedRAMP JSON validated against its exact published Draft 2020-12 schema. Upstream AGENTS.md was read at the pinned commit.

- Class A/B/C/D names come from `/FRD/data/all/FRD-CCL/definition`; the existing verified class relationship is `DEFINED_BY` to FRD-CCL. Display source grouping does not create a structural `CONTAINS` claim.
- Rule class applicability comes from explicit subset `applicability.classes`, retaining framework/path/actor/timing context.
- NIST is a separately imported catalog whose root metadata is `/catalog/metadata`, not a child source inside the FedRAMP JSON.
- The 46 KSIs comprise 41 common statements and five B/C variant records; there are no A/D variants in the current snapshot. No KSI→class edges are currently imported. The 558 KSI/control mappings are common published control-array entries.
- Mapping absence in a displayed class scope must not be described as proof that no official association exists. Some source information, including rule-level control lists and CTL guidance, remains outside the current graph extractor.

The detailed exact pointers, schema definitions, publication revisions and safe display semantics are in `source-review.md`. These are source conclusions, not a new legal/compliance determination.

## Remaining limits

No blocking issue was found in these specific final sessions. This is bounded evidence, not an exhaustive certification of all paths or future datasets. Dense all-entity views still require panning, branch selection or the table. Whole-chart overview text can be small by design. Physical mobile devices, branded Chrome, live Pages behavior and a formal assistive-technology audit were not tested here. The source review records an existing subset metadata/data locator distinction for a future provenance improvement; no ingestion changes were made by this agent.
