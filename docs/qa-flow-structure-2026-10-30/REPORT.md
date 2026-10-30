# Flow structure correction and journey review — October 30, 2026

The reported gaps and selected-state mapping-toggle failures were reproduced before changes. The chart now recomputes a compact current-scope layout, keeps FedRAMP CR26 and NIST as peer sources, groups source-defined classes beneath CR26, and permits mapped-control changes during inspection. Source data and verified relationships were not altered.

## Why previous testing missed this

The previous layout deliberately preserved visited card coordinates. Its tests rewarded that stability, but never bounded the whitespace accumulated across a mixed browsing session. Review also treated the disabled selected-state NIST checkbox as intended instead of testing the user's actual task. Those were inadequate acceptance criteria. This review combines source inspection, multi-step functional tests, captured screenshots and independent visual inspection; passing button assertions alone is insufficient.

## Reproduced defects and fixes

| Defect | Evidence and correction |
| --- | --- |
| Large gaps after multiple selections | Baseline default → KSI → NIST → FedRAMP → Class D produced 60 cards across 12,572×696 graph units; Fit dropped to .08. Removed persistent empty slots. A fresh and previously explored Class D now produce identical coordinates. Current initial view is 24 primary records plus seven context records, 1,096×1,944, with readable Fit at .7. Smaller batches and compact reflow both contribute. |
| Checkbox disabled after selection; hidden NIST leaked into neighborhoods | Checkbox is always operable. NIST visibility is applied before neighborhood traversal. Enabling mappings enables the NIST layer; disabling them removes descendants and their transit paths. Source peers remain context. Status explains scopes without imported mappings. |
| Confusing hierarchy and card direction | Peer source roots, separate source-origin sections, classes below CR26, actual containment ancestors preserved. Solid containment and dashed associations retain original arrows and evidence. No class→rule or source→class containment was fabricated. |
| Fit made dense views unreadable | Fit centers the selection at a readable scale. Whole chart is a distinct explicit overview. Return to selected card recovers a panned-away selection. |
| Exact Class B search opened a prose definition | Exact identifiers and titles now outrank substring matches in prose. |
| Source context leaked into Definitions branch during redesign | Regression caught this before release. Classes are added as source context only during explicit FedRAMP-source inspection. Definitions branch contains no class cards. |

## Authoritative hierarchy review

The [source audit](source-review.md) reviewed pinned FedRAMP JSON, its published schema and upstream AGENTS.md, and the independent NIST OSCAL catalog. FedRAMP classes are enumerated in `/FRD/data/all/FRD-CCL/definition`; their current verified links are DEFINED_BY that definition and incoming rule APPLIES_TO links. The visual grouping under CR26 follows their source origin, not a new verified containment claim. NIST `/catalog` remains an independent source.

FRR process → subset → rule and KSI theme → indicator containment remain distinct. All 558 imported control mappings come from published KSI control arrays. Optional B/C KSI statements remain Optional; no A/D statement is manufactured. No imported mapping in a class neighborhood means exactly that, not absence of every possible official association. Current ingestion does not yet extract rule-level control lists or CTL guidance.

Pinned coverage remains **1,676 entities, 3,696 verified relationships, 558 published KSI mappings**. FedRAMP version 2026.10.13.01 / commit `a89d78477ddea98dc57eca24f5007794c2b4eeb6`; NIST catalog 5.2.0 / commit `f0de6d8d8c059d374f15e0ae07508d82e370fc1d`.

## Review process and evidence

1. Reproduce the user paths and capture baseline screenshots before implementation.
2. Check hierarchy and relationship meaning against authoritative records and exact source pointers.
3. Exercise mixed sessions, all four classes, all three connection depths, repeated mapping changes, source/ancestor navigation and Back/Forward.
4. Inspect screenshots at desktop, tablet and mobile sizes; check selected-card visibility, spacing, peer roots, overlap and readable Fit.
5. Run existing regression suites and preserve failures discovered during the redesign rather than accepting the first candidate.

Validation passed: 71 unit/integration tests, a subsequent 21-test affected-module rerun, lint, TypeScript and the production build. The flow/full-coverage/journey/shared-app browser suites passed 17/11/11/18 checks respectively. Two user-requested independent agents performed source/functional review (26 final checks) and Product Design screenshot-based UX review (16 groups plus targeted definitions and resize retests). See [functional results](functional-final-report.md), [UX results](ux-final-report.md), [baseline critique](ux-baseline-report.md), and [rejected first-candidate critique](ux-candidate1-report.md). Main regression results are [flow](../flow-browser-results.json), [full coverage](../full-flow-browser-results.json) and [return navigation](../journey-browser-results.json). Reproducible scripts and screenshots are retained in this directory.

Selected screenshots:

- [Class D after a mixed session and Fit](final-mixed-class-d-fit.png)
- [KSI mappings and evidence](final-mapped-ksi-evidence.png)
- [Source inspection with an operable mapping toggle](final-source-toggle.png)
- [20x and Class B with published NIST context](final-20x-class-b-mappings.png)
- [Mobile journey](final-mobile-mixed-session.png)
- [Definitions without unrelated classes](ux-final-definitions-branch.png)

## Remaining limits

Dense edges can overlap in shared gutters. Keyboard connector inspection and the inspector's individual evidence links remain precise alternatives; pointer tests verify actual visible SVG segments, not every overlapped edge. Mobile controls can cover lower context cards, and its inspector remains below the chart. Offscreen peer cards require panning, breadcrumbs or Whole chart. These are recorded follow-ups, not completed polish.

Tests use installed Chromium 154 through Playwright against the local production build at the GitHub Pages project path. Google Chrome is not installed; live Pages access is blocked by this environment's proxy. This is not a physical-device, cross-browser, screen-reader, exhaustive accessibility or live-site visual certification. The existing Three.js main-bundle-size advisory remains. External laws, policy texts and additional standards still require separate provenance-backed ingestion.
