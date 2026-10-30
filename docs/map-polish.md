# Map label, color, focus and reset corrections

This slice addresses the five reported interaction issues without changing movement controls, imported data, or relationship semantics.

## Changes

- The canvas border was focus feedback. Pointer input no longer displays a canvas outline. Keyboard Tab/navigation still displays a blue focus indicator, and its modality listeners are removed when the map unmounts.
- Hover no longer changes placement priority or triggers label repacking. Stationary camera layouts are cached, valid label anchors are retained, and zoom eligibility is independent of whether a collision happened to suppress a label. Hover changes styling only.
- The initial unselected view shows source, family, ruleset, theme, and class labels. Individual rule/KSI/control/definition/subset labels require a closer zoom tier. Entering and leaving that tier uses different thresholds. Explicit selection remains an exception so its immediate relationships can be read.
- FedRAMP rules/source hubs are blue (`#59a9ff`); NIST families/controls/enhancements/source hubs are amber (`#f3bb62`). The legend, search results, inspector, table, labels and points share the same color resolver. KSI, definition and certification-class colors retain their existing categories.
- Added a distinct **Reset view** button that restores the starting front-facing camera, center, zoom and Pan mode. It retains selection and data filters. **Fit all entities** is separately named and retains the current orbital angle while fitting visible entities; it is not a fullscreen action. Reset settles any remaining control damping and clears intermediate label anchors when its animation completes. It also works with reduced motion.

## Validation

Forty automated tests pass: 13 navigation/model checks plus the 12 source-fidelity tests and 15 update lifecycle tests. Lint, typecheck and production build pass.

Fifty-four browser checks pass against the production build at the GitHub Pages project prefix: 18 existing graph checks, seven update-status checks, 15 navigation checks, and 14 new polish checks. The polish checks reproduce repeated pointer motion over both group and individual labels and verify that all visible label IDs/positions remain unchanged. They also check pointer/keyboard focus distinction, initial group-only labels, zoom thresholds, publisher colors, Fit all versus Reset, reduced-motion reset and mobile layout. [Results](map-polish-browser-results.json).

The browser checks use local Chromium software WebGL and a simulated mobile viewport. They are not a claim of full accessibility conformance, physical-device touch validation, or a live public-site browser test.

## Screenshots

![Group-level overview with distinct publisher colors](screenshots/map-polish-overview.png)

![Mobile group-level overview and separate reset controls](screenshots/map-polish-mobile.png)
