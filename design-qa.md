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
