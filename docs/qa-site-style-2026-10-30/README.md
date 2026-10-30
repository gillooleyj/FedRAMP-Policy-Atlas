# FedRAMP Site Style implementation — October 30, 2026

Applied the user-requested [FedRAMP Site Style v1.0.0 skill](https://github.com/gillooleyj/fedramp-site-style/blob/v1.0.0/skills/fedramp-site-style/SKILL.md). Read its [design guidance](https://github.com/gillooleyj/fedramp-site-style/blob/v1.0.0/skills/fedramp-site-style/references/DESIGN.md), [patterns](https://github.com/gillooleyj/fedramp-site-style/blob/v1.0.0/skills/fedramp-site-style/references/patterns.md), and [theme tokens](https://github.com/gillooleyj/fedramp-site-style/blob/v1.0.0/skills/fedramp-site-style/assets/fedramp-theme.css), downloaded from the version tag. The supplied source-design snapshot informed this implementation; this was not a fresh crawl of every FedRAMP page.

## Chosen variant

**Research** best fits an evidence explorer: restrained blue/green accents, warm white surfaces, editorial serif headings and readable source material. The compact reference variant would emphasize document navigation, while project/promotion patterns would compete with the working explorer. A single research theme covers the shell, flow chart, table, filters and source panels. The 3D visualization keeps its dark canvas for legibility.

The implementation is an original adaptation in `src/site-theme.css`, using Georgia and Segoe UI/Arial system fallbacks. It adds no remote fonts, decorative images, official logos, government banners, seals, services or dependencies. Independent research and non-endorsement language remain visible.

## Navigation and crowding

- Three destinations: Explore, FedRAMP 20x, and Sources & coverage. Export remains available.
- Replaced the permanent sidebar with a Filters drawer, retaining every layer, class and relationship option. The drawer traps keyboard focus, makes background content inert, closes with Escape or its controls, and restores focus.
- Replaced metric cards with a compact coverage row. The explorer fills the available width until selection opens the source inspector.
- Kept the 3D Map / Flow chart / Table switcher and search prominent. Back, Up, Overview, breadcrumbs, connection levels, branch selection and mapped controls remain available during inspection.
- Moved connection-type shortcuts and explanatory copy into native disclosures. Repeated introductory copy and coverage counts disappear during inspection.
- Preserved rule/KSI badges, icons, shapes and distinct colors; source hierarchy, node positions, relationship direction and evidence are unchanged.

## Verification

Lint, TypeScript and the Pages production build passed. All **71 unit/integration tests** passed. **73 Chromium browser checks** passed on the local production build at the Pages project path:

| Suite | Checks | Evidence |
| --- | ---: | --- |
| Research style and keyboard/responsive behavior | 13 | [results](results.json) |
| Flow functionality and provenance | 17 | [results](../flow-browser-results.json) |
| Return navigation and drill-downs | 11 | [results](../journey-browser-results.json) |
| Heading clearance and entity identity | 7 | [results](../qa-flow-labels-2026-10-30/results.json) |
| Shared map/table/source features | 18 | [results](../browser-results.json) |
| Source freshness and pending/failure states | 7 | [results](../update-browser-results.json) |

The source-watch pending, failure and missing-status cases use intercepted fixtures; screenshots show actual stored check data. Existing tests were updated to open the new drawer/disclosures; their functional assertions were retained. No uncaught browser exceptions were recorded.

Measured foreground/background contrast includes body text 13.78:1, muted text 6.27:1, links 7.06:1, KSI identity 5.87:1, NIST identity 5.80:1, control borders 4.03:1 and containment connectors 3.25:1. These sampled colors and keyboard checks are not an exhaustive accessibility certification.

Responsive checks cover 1440, 768, 390 and 320px. The document does not overflow horizontally; the table retains its own horizontal scroll container. The filtered empty state recovers with Reset filters. Search, selection, class wording, published mappings and exact pinned evidence were exercised.

## Screenshots

- [Previous published flow design](before-flow.png), recovered from the preceding commit's screenshot.
- [Final desktop overview](final-flow-desktop.png).
- [Final selected KSI and evidence](final-selected-evidence.png); keyboard focus leaves the skip link visible in this capture.
- [Final tablet](final-flow-768.png), [390px mobile](final-flow-390.png), [320px mobile](final-flow-320.png).
- [Desktop filters](final-filters-desktop.png), [mobile filters](final-filters-390.png).
- [Sources](final-sources-desktop.png), [table](final-table-desktop.png), [dark 3D map](../screenshots/everything-desktop.png).

Files without the `final-` prefix, except `before-flow.png`, are first-pass captures retained to distinguish design iterations.

## Reproduction and limits

```sh
npm ci
npm run lint
npm test
npm run build:pages
npm run preview -- --base=/FedRAMP-Policy-Atlas/ --port 4189 --strictPort
# In another terminal:
ATLAS_URL=http://127.0.0.1:4189/FedRAMP-Policy-Atlas npm run test:site-style:e2e
```

Browser validation used local Chromium 154.0.8037.57 with software WebGL. Live GitHub Pages access is blocked by this environment's proxy; local results are not live-site visual verification. Physical touch devices, other engines and screen readers remain unverified. Dense shared edge gutters, offscreen context while centering selected cards, and mobile chart-control overlap remain navigation refinements. Labeling research remains in the backlog. The existing large Three.js bundle warning remains.

No source graph or importer changes: **1,676 entities, 3,696 verified relationships, 558 published KSI mappings**, graph `5cda3bb3c29d199d`. FedRAMP remains `2026.10.13.01` at `a89d78477ddea98dc57eca24f5007794c2b4eeb6`; NIST remains `5.2.0` at `f0de6d8d8c059d374f15e0ae07508d82e370fc1d`. Applicability, normative wording, provenance and mapping caveats remain intact.
