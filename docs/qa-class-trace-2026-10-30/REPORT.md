# Class-to-NIST tracing — October 30, 2026

## Problem and behavior

Class selection previously started at one connection level, ending at rules and KSIs. The NIST visibility toggle, explicit class/20x filters and the ordinary 24-card flow limit could also keep NIST endpoints out of view at greater depth. Increasing general graph depth introduced many unrelated definitions and process links rather than a focused trace.

A new **Trace KSIs to NIST controls** action appears whenever a class is selected in the map, flow chart or table. It preserves that view and shows a complete first KSI path. A picker supports any individual indicator or all class-linked KSIs. The trace includes every published control/enhancement target for its selected scope, bypasses the ordinary flow-card limit, and provides accurate distinct-target and mapping counts. Flow charts initially frame the class, KSI and upper NIST rows together; larger paths require panning or Whole chart. The map shows the same exact paths; the table supports pagination and search.

**Path evidence and coverage** provides clickable control identifiers/titles and separate evidence actions for both steps. Selecting a control retains the class path. Inspecting evidence opens the existing source panel at the precise edge. Source wording defaults to the traced class, preserving optional B and missing D wording. **Return to class requirements** returns to direct class connections. Back, Forward and reload preserve the trace class, KSI, selected entity and presentation. General filters are disabled while this dedicated path scope is active; the action explicitly includes NIST endpoints even when launched from 20x or a class filter. Back can restore the prior filter state.

## Source semantics and coverage

The graph snapshot remains `8bebe1f392e5feb0`: no source record, relationship, citation, source revision or applicability was modified. The trace reads the existing verified KSI→class `APPLIES_TO` edges in reverse for navigation, followed by existing KSI→NIST `PUBLISHED_CONTROL_MAPPING` edges. Original arrows, edge IDs and provenance remain intact. It never creates a direct class→NIST edge. Explicit class-specific control-mapping scope is respected; candidate edges are excluded.

| Class | KSIs | Published KSI mappings | Distinct controls/enhancements |
|---|---:|---:|---:|
| A | 7 | 99 | 94 |
| B | 46 | 558 | 302 |
| C | 46 | 558 | 302 |
| D | 46 | 558 | 302 |

These counts describe published associations, not mandatory NIST baselines. Class A scope comes from the named-list MUST process rule; B/C/D scope comes from the ALL-KSI SHOULD process rule. Five B variants are optional; five D variants are absent. A KSI without a published mapping remains visible with an explicit missing-mapping message. Process rules without imported control mappings remain accessible through the ordinary class requirements view. No unsupported rule→KSI or rule→control relationship was invented to imply complete regulatory coverage.

## Validation

- All **90 unit/integration tests pass**, including four new trace tests for exact complete paths, preservation of original edges, enhancements, optional/missing wording, class-specific mappings, candidate exclusion and unmapped indicators.
- Lint, TypeScript and Pages build pass. The pre-existing bundle-size advisory remains.
- Existing return-navigation and full-flow browser suites pass **22 checks**. Their current-run results are [navigation](journey-results.json) and [full flow](full-flow/full-flow-results.json).
- All **19 dedicated [browser checks](results.json) pass** and verify class-filtered/20x entry, all four complete class scopes, exact displayed edge IDs, mapping evidence, control inspection, Back/Forward/reload, map/table switching, mobile return paths, dark mode, pagination reset and unsupported-link recovery.
- The new test initially referenced AC-4, which is not a published target of KSI-CNA-EIS; it was corrected to the actual CM-11 target. A fixed 700ms wait also observed unmeasured edges during a large chart's initial render; the final assertion waits up to 10 seconds for the expected edge count and then compares the entire ID set. No counts or source assertions were relaxed.

Screenshot review also caught an offscreen selected class after resizing a large trace to mobile. Desktop trace framing now uses the deterministic layout bounds rather than potentially stale measured node positions. Phones center the selected card at readable scale; the final browser test asserts that its complete bounds remain inside the chart. The ordinary return-navigation suite was rerun after this correction.

## Screenshots

- [Class B → KSI-CNA-EIS → all twelve published targets](01-class-B-path.png)
- [Exact CM-11 mapping evidence while retaining the class path](02-mapping-evidence.png)
- [The same path in the galaxy map, with the NIST statement open](03-map-trace.png)
- [All Class A KSI paths](04-all-class-A.png)
- [Mobile trace controls and evidence](05-mobile-trace.png)
- [Dark map and trace palette](06-dark-map-trace.png)

Validation uses a local production build under `/FedRAMP-Policy-Atlas/` in Chromium with software WebGL. Physical-device, Safari/Firefox, exhaustive accessibility and live Pages visual checks remain outside this run. Large all-KSI charts remain dense; the default single-KSI path and evidence list provide a more readable route through the same complete published data.
