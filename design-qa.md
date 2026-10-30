# Flow-chart design QA

Source visual: the user's inline policy-and-standards flow-chart screenshot in the current request (1680 × 1246 pixels). It is an experience reference for an existing production app, not a request to reproduce its unsupported policy data or replace the site's established colors. No local source-image file was supplied.

Implementation evidence: `docs/screenshots/flow-overview-desktop.png`, `flow-overview-panel.png`, `flow-ksi-desktop.png`, and `flow-mobile.png`. Desktop CSS viewport 1680 × 1246; mobile 390 × 844; device scale factor 1. Full-page captures can be taller than the viewport. The desktop chart-only capture is 1345 × 720 CSS/pixel units. Source and implementation have intentionally different outer chrome and diagram contents, so this is a composition/interaction comparison rather than a pixel-identical overlay.

## Comparison and corrections

- P1, card interaction: the first browser pass found the diagram pane intercepting card clicks when native dragging/selection were disabled. Added the library's node-click handler, retained keyboard buttons, and verified card selection opens the real inspector. Corrected.
- P2, selected-neighborhood density: fitting a 15-target fan-out as one tall column made its cards illegible. Wrapped dense ranks into short columns, increased title text to 15px before zoom, and recaptured the KSI neighborhood. Corrected.
- P2, narrow-screen overview: fitting the entire chart made mobile text too small. Mobile now starts at minimum 0.55 zoom, retains all controls without page overflow, and permits pan/pinch/fit. Corrected.
- P2, visual clutter: repeated connection labels overlapped in fan-outs. Labels now appear on hover, keyboard focus or inspection; nonparticipating ports are hidden. Corrected in the final captures and interaction run.

## Required surfaces

- Typography: the existing system/DM Sans stack remains consistent with the atlas. Card headings use 15px semibold text with two-line truncation, full title/version tooltips and the full inspector title. Source IDs and type/distance labels provide secondary hierarchy.
- Spacing/layout: rounded 224 × 112 cards, separated graph ranks, a dotted canvas, a compact header/legend, and reset/fit controls carry the reference's structure. The overview uses the full main-column width; selection exposes the inspector. Wrapped ranks do not overlap cards in automated geometry checks.
- Color: the reference's category distinctions are retained while following the user's previously chosen FedRAMP blue/NIST amber palette. KSI, definition and class colors remain consistent with the 3D map.
- Images/assets: the reference consists of functional diagram UI rather than photographic or illustrative assets. React Flow renders the diagram primitives and connectors, and the existing Lucide library supplies control icons. No raster stand-in, invented logo or generated source content is used.
- Copy/content: the overview explicitly says selected source-backed branches and reports counts. All cards and connections resolve to actual graph records. Unsupported legislation/policy documents in the reference are documented as future coverage rather than rendered as verified facts.

Focused evidence: the chart-only overview capture exposes card typography, legend spacing and connectors; the KSI capture checks selection and multi-connection layout; the mobile capture checks the three-tab switcher and persistent controls. Local Chromium/Playwright exercised primary interactions and checked uncaught browser errors. No cloud-browser/Sites connector is exposed in this environment; live-site visual verification and physical-device behavior are not claimed.

Residual P3: very large expanded charts can remain dense; use relationship filters, zoom and the table. Investigate edge routing and broader labeling usability in the backlog.

final result: passed

## Full imported FedRAMP chart follow-up — 2026-10-30

Implemented within the established card-and-connector design. Inspected local desktop screenshots at 1680×1246 and mobile screenshots at 390×844. The first full-scope fit reduced text excessively; changed automatic opening to the starting columns for large branches while retaining explicit full Fit. The default now begins at readable card scale and the branch selector reaches every ruleset/theme/class/definition. The AGU branch shows its complete 25-card source/subset/rule hierarchy. Mapped NIST context remains optional and sourced. Verified all 459 FedRAMP cards and 1,922 original internal edge IDs through browser assertions.

Known limit: drawing every verified cross-link can be dense, and wrapped ranks can route curves behind intermediate cards. Branch selection and evidence inspection remain preferable for reading individual relationships; no shortcut edges are created. Physical touch devices and assistive-technology audits remain outstanding. Screenshots: `docs/screenshots/full-fedramp-desktop.png`, `full-fedramp-agency-branch.png`, `full-fedramp-ksi-branch.png`, `full-fedramp-mobile.png`.

## Independent full-use testing and return navigation — October 30, 2026

Two independent testing agents performed the user-requested browser journeys, including actual clicks, search, keyboard activation, filters, all three presentations, provenance inspection, browser history, mobile/tablet layouts and responsive resizing. The UI/UX agent captured and inspected baseline screenshots before reporting defects. The root also inspected final stable-class and dimmed-context screenshots. Test environment was local production Vite preview in Chromium154, not branded Chrome or a reachable live Pages session.

The reproducible NIST-only condition was stale selected/focused state after Everything. Cleared that state, retained clickable dimmed map context, added shared semantic Back/Up/Overview and containment breadcrumbs, and distinguished Camera back. Flow classes retain exact coordinates across inspection, branch return, presentation remount and direct class URLs. An independent visual check caught a selected card leaving the mobile viewport after desktop resize; fixed and verified with bounds assertions plus final screenshots. Mobile Filters Escape dismissal/focus return also works.

Final independent evidence: `docs/qa-functional-2026-10-30/REPORT.md` (38 final checks/observations) and `docs/qa-ux-2026-10-30/report.md` (13 retest checks and inspected screenshots). No blocking issue remained in the tested journeys. This is bounded product QA, not exhaustive regulatory mapping verification, accessibility certification or a physical touch-device test. Small supporting text, full drawer focus handling and dense-chart edge routing remain documented follow-ups.
