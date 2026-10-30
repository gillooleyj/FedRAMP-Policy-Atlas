# Galaxy-map orientation and appearance — October 30, 2026

## Reference and scope

The user requested orientation and navigation inspired by [No Man's Sky Galactic Atlas](https://galacticatlas.nomanssky.com) and the attached galaxy-map screenshot. This environment's proxy returned `CONNECT 403 Forbidden` for the site; its hostname is outside the allowed outbound destinations. The live site's interactions were **not** inspected. The supplied screenshot informed the overview locator; no game assets, decorative star fields or unverified policy relationships were imported.

This iteration implements a working locator, stable object identification and independent site/map appearance. It retains the existing pan/orbit mechanics, progressive label levels, region directory and source-backed graph. It does not claim to reproduce the game's full navigation or solve arbitrary graph scale.

## Behavior

- **Overview map:** fixed front projection of all 1,676 imported entities. A dashed polygon shows the current focal-plane view rectangle; a crosshair marks the view center and a ring marks selection. It updates while zooming, panning and orbiting. Points excluded by explicit filters remain faint for orientation.
- **Travel and return:** click the locator to move its center without changing zoom, viewing angle, filters or selection. Keyboard arrows move in the locator; Enter/Space fits the current filtered map. Camera back restores the previous camera frame. Fit all and Reset retain their existing distinct behavior.
- **Small screens:** the locator starts collapsed at widths below 701px. Its title toggles it without changing the camera. Important landmarks whose points sit beneath the locator can move to an adjacent free location, with a short dotted display-only leader. Other label budgets and hover stability remain unchanged.
- **Identification:** hovering over a point or label shows its type, identifier and full title in one stable readout. It does not reprioritize or shuffle the surrounding labels. Clicking still opens the source inspector; search and the accessible table remain keyboard alternatives.
- **Appearance:** site Light / Dark / device setting; map Light / Dark / Follow site. The initial map preference stays Dark, preserving the established galaxy appearance. The header palette icon exposes Appearance on phones. Preferences persist on the device; denied local storage falls back to working in-memory state. Device-theme changes update live when selected.
- **Rendering:** theme changes update colors in place without recreating the camera. The light map uses normal alpha blending, darker category colors and a dark selection ring; the dark map retains additive glow. Flow cards, sources, table, controls and evidence panels use shared light/dark tokens.

The locator is a front projection of the view at the camera's orbit target depth, **not a per-entity 3D visibility calculation**. During edge-on orbit its projected rectangle can narrow; the center crosshair remains usable. Out-of-bounds centers are clamped to the locator edge and explicitly identified. Label guides and locator geometry are presentation aids, never new graph relationships.

## Verification

The unit/integration suite now contains **80 tests**. The full 79-test suite passed before the final label-guide refinement; the affected navigation/overview suites passed all 24 tests afterward, including the additional dense-label regression. Lint, TypeScript and the production Pages build passed.

Browser coverage for this iteration:

| Suite | Checks | Evidence |
| --- | ---: | --- |
| Locator, themes, storage, system preference, filters and responsive layouts | 19 | [results](results.json) |
| Map label tiers, hover stability, pan/orbit and reset | 18 | [results](../map-polish-browser-results.json) |
| Flow navigation, mapping and provenance | 17 | [results](../flow-browser-results.json) |
| Shared map/table/source functionality | 18 | [results](../browser-results.json) |
| Research-style keyboard and responsive behavior | 13 | [results](../qa-site-style-2026-10-30/results.json) |
| Return navigation and drill-downs | 11 | [results](../journey-browser-results.json) |

The map and locator suites were repeated after the final guide restriction; the other four suites passed on the preceding candidate, with the same site/flow implementation. The map-polish test previously cached viewport click coordinates before keyboard focus scrolled the page; those clicks landed in the new locator. It now measures the current canvas before each pointer action and compares reset positions relative to the canvas. Its original geometry, label-count, hover and reset assertions remain.

Sample contrast ratios against reading surfaces:

| Element | Light | Dark |
| --- | ---: | ---: |
| Main text | 14.42:1 | 13.10:1 |
| Muted text | 6.27:1 | 8.27:1 |
| Links | 7.06:1 | 8.94:1 |
| Control borders | 4.03:1 | 5.19:1 |

These samples are not an exhaustive accessibility certification. Tests use Chromium 154.0.8037.57, software WebGL and local production assets under the GitHub Pages project prefix. Live Pages browsing is also restricted by the environment. Physical touch devices, other engines and screen readers remain unverified. Existing dense edge overlap and the Three.js bundle advisory remain. Growth benchmarks and source-driven region aggregation are recorded in [the backlog](../backlog.md#galaxy-map-growth-and-orientation).

## Screenshots

- [Overview with locator](overview-dark-map.png).
- [Travel into KSI themes](ksi-region-locator.png).
- [Selected KSI](selected-dark-map.png).
- [Light site and light map](light-site-light-map.png).
- [Dark site and light map](dark-site-light-map.png).
- [Dark site and dark map](dark-site-dark-map.png).
- [Dark flow chart and pinned evidence](dark-flow-evidence.png), [table](dark-table.png), [sources](dark-sources.png).
- [Light phone layout](light-mobile-390.png), [dark phone layout](dark-mobile-390.png), [320px layout](dark-mobile-320.png), [tablet](dark-mobile-768.png).

Keyboard focus remains visible on Appearance in captures taken after Escape closes its disclosure.

## Reproduce

```sh
npm ci
npm run lint
npm test
npm run build:pages
npm run preview -- --base=/FedRAMP-Policy-Atlas/ --port 4189 --strictPort
# In another terminal:
ATLAS_URL=http://127.0.0.1:4189/FedRAMP-Policy-Atlas npm run test:galaxy:e2e
ATLAS_URL=http://127.0.0.1:4189/FedRAMP-Policy-Atlas npm run test:map-polish:e2e
```

No changes to ingestion, the active snapshot, source applicability or verified relationships: 1,676 entities, 3,696 verified relationships, 558 published KSI mappings; graph `5cda3bb3c29d199d`. Source revisions remain the FedRAMP `2026.10.13.01` and NIST `5.2.0` pins documented in the project README.
