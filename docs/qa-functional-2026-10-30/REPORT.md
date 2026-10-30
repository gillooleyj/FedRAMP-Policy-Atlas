# Independent functional browser QA — October 30, 2026

Agent: functional browser testing. This agent did not change application code. Baseline was the production build corresponding to commit `e1692e7`; served locally at `http://127.0.0.1:4187/FedRAMP-Policy-Atlas/`. Browser: **Chromium 154.0.8037.57**, headless with software WebGL. Google Chrome was not installed. The live Pages URL returned a configured-proxy CONNECT 403, so these results are local production-build tests, not a live-site certification. No network bypass was attempted.

## Coverage

The independent `journey.mjs` executed 22 functional checks/observations, with no uncaught browser exceptions. Additional `probe.mjs` exercised initial map rendering at widths 1680, 1440, 1280, 1024, 768 and 390 and captured the class layout transition. `history-probe.mjs` checks browser Back after two selections. Screenshots and machine-readable results are in this directory. Desktop baseline captures used heights 1000/1040/1246; mobile used 390×844. User-facing dates use America/New_York.

Passed journeys include complete graph and mapping counts, connection depths 1/2/3, exact KSI edge evidence, Optional and unspecified class variants, shared selection across 3D/flow/table, table search and pagination, class filtering, both source schema validations, source-watch status, preserved presentation under 20x scope, 20x NIST exclusion, all 459 FedRAMP cards and 1,922 internal verified links, mapped-NIST branch scope and URL reload, keyboard connector evidence, flow reset to the selected branch, and mobile navigation to the accessible table.

## Findings

### F1 — Selection navigation loses prior context (high usability impact)

Reproduction: search `ac-2`, then search `KSI-CNA-EIS`, then use the map's Back button. The selected entity remains `KSI-CNA-EIS`; only the camera restores its prior view. There is no selection-history Back, parent Up or breadcrumb in the baseline. The inspector X clears selection rather than restoring the previous selected node. This reproduces the reported friction while moving down and back up the graph.

Evidence: `camera-back-keeps-selection.png`; `journey-results.json` observation “Camera Back does not restore the prior selection.” Expected improvement: explicit selection history and parent/overview navigation that do not depend on closing the information panel; retain eligible context for continued clicking.

### F2 — Class selection recomputes layout and reverses its spatial position (high usability impact)

Reproduction: open `?mode=flow&branch=classes`; select Class B. Its model coordinates change from `(28,174)` to `(3556,320)`. Auto-fit zoom changes from 0.938 to 0.239. The chart now shows 60 of 216 neighborhood entities, placing Class B at the right edge and making most card text too small to read. The selected class is an incoming `APPLIES_TO` target; reranking the new neighborhood shifts the target to the right.

Evidence: `classes-before.png`, `classes-after.png`, `probe-results.json`. Expected improvement: preserve existing card coordinates and readable camera scale when inspecting; append newly revealed relationships without relocating already visible cards. Edge direction must retain the published relationship direction even if the layout anchors the class on the left.

### F3 — “Only NIST” is not a missing-dataset condition in a clean baseline (context visibility issue)

All six clean-URL viewport probes show both **FedRAMP** and **NIST 800-53** source labels and all 1,676 entities. Therefore the exact single-source starting condition was not reproduced from a clean URL. However, selecting `ac-2` removes unrelated source labels and heavily dims unrelated nodes while retaining all 1,676 points. Explicit Focus neighborhood then reduces the map to 19 entities. A selection-focused camera or persisted filters/deep link can thus make the broader source context hard to discover.

Evidence: `initial-*.png`, `nist-selection-context.png`, `probe-results.json` and `journey-results.json`. Expected improvement: retain clear source/group context where eligible, make focused/filter state visible, and provide a direct return to overview. Do not tell the user FedRAMP data was absent: the browser evidence confirms it is loaded.

## Limits

This was a bounded functional exploration, not exhaustive validation of every entity/edge or assistive technology. No physical phone, branded Google Chrome, external issuer page, live Pages rendering or unattended daily-update run was verified. The app's source-watch panel correctly describes bundled status and review-before-promotion; the QA did not promote a dataset or publish anything. A fixed-build retest will be recorded separately rather than replacing this baseline evidence.

## Final fixed-build retest

Final tested production asset: `index-dK7PwtXj.js`, served from the same local preview. **38 independent fixed-build checks/observations passed**: 16 targeted navigation/anchor checks in `retest-results.json` and 22 full-journey checks/observations in `fixed-regression/journey-results.json`. No uncaught browser exceptions occurred in either run. Final screenshots are prefixed `fixed-`; additional full-journey screenshots are in `fixed-regression/`.

- **F1 resolved in tested journeys.** UI Back and native browser Back/Forward restore the prior selected entity. Up follows published containment (`ac-2` → AC family → NIST). Overview returns to both source labels. Back across branch changes restores the selected class, all 216 loaded cards and the exact saved viewport; KSI Back restores depth 2 and all 119 loaded cards. Class filters and selection restore after Clear filters. Back remains functional after reload. Camera back is separately labelled.
- **F2 resolved in tested journeys.** Class B remains at `(28,174)` after selection, at readable zoom 0.938 rather than 0.239. Its anchor persists across 3D/Flow remounts, changing branches and returning, and a direct selected-class URL. Original edge identities and directions remain intact.
- **F3 improved and clean-load behavior confirmed.** The selection journey now shows both FedRAMP and NIST source context plus explicit per-source counts. Focus retains all 1,676 eligible points; a dimmed FedRAMP label was clicked successfully. Everything restores enabled layers and clears stale relationship/selection scope.
- **Additional responsive defect found and resolved.** Visual review of the first fixed build found that resizing a selected desktop Class B chart to mobile left the class mostly offscreen. This was reported before completion. The final build uses selected-card recentering on surface resize; the retest now asserts the selected card's bounds fit within the mobile canvas, and the final screenshot confirms it. Mobile navigation remains visible, no document horizontal overflow was found, and Escape closes the filters panel.

No remaining blocking functional issue was observed within this tested scope. Limits above still apply: Chromium rather than branded Chrome, local production build rather than reachable live Pages, and bounded journeys rather than exhaustive validation of every regulatory relationship.
