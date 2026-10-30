# Flow redesign: first candidate visual critique

Local production candidate `index-BROIT0i9.js`, 2026-10-30. Chromium 154.0.8037.57 via Playwright; branded Chrome unavailable, live GitHub Pages blocked by the network proxy. Screenshot capture preceded visual inspection. This is an intermediate critique, not final acceptance.

All nine workflow assertion groups passed, but visual acceptance did not: Fit still shrinks Class D/B into an unreadable vertical strip (zoom 0.112), Certification Class definition into tiny cards (0.277), and KSI with mapped NIST controls into small text (0.343). Compact current-node layout alone does not make a chart usable. Recommend readable Fit anchored on current selection and a separate, clearly labeled Whole chart overview.

The redesigned peer source lanes and hierarchy are clearer. Both roots share the top rank. Classes are explicitly defined in CR26 rather than joined by fabricated containment edges. KSI → theme → source and control → family → NIST paths are visually clear. Unchecked KSI shows seven readable cards; enabling NIST adds all twelve published mapping edges and necessary ancestry. Toggling remains usable at depth two, restores with Back, and returns to FedRAMP overview when disabling a selected NIST branch. No uncaught JS errors occurred in these journeys.

Large tiers wrap into successive rows: Class D sits below Classes A/B/C beside a ruleset. Source containment curves cross behind this band en route to actual rule/definition children; it can visually suggest a Class B parent even though edge data is correct. Future routing should separate class/reference bands and route long containment edges outside card columns.

Mobile preserves selected-card readability, working NIST toggle, and no horizontal document overflow. Mapped targets require panning right; inspector remains below chart. This is usable but lacks a persistent miniature overview.

## Evidence

- `ux-candidate1-01-class-d-fit.png`: unreadable fit for 76 rendered cards.
- `ux-candidate1-02-rule-after-class-d.png`: readable small rule hierarchy, four classes wrapped over two rows.
- `ux-candidate1-04-definition-fit.png`: 27-card definition and ancestral context shrink after Fit.
- `ux-candidate1-07-ksi-nist-off.png`: clear seven-card source/theme/KSI/definition hierarchy.
- `ux-candidate1-08-ksi-nist-on.png`: all twelve mapping edges plus NIST ancestry, text too small after Fit.
- `ux-candidate1-15-mobile-ksi-on.png`: mobile selected-card visibility and available mapping toggle.
- `ux-candidate1.json`: complete workflow state data.

## Why the earlier audit missed this

Previous acceptance over-weighted persistent coordinates, selected-card visibility, and successful button clicks. It did not evaluate the complete Class → rule → definition → source sequence after Fit or measure historical blank gaps. It treated the disabled NIST toggle as intentional instead of testing the task of adding/removing mappings during inspection. This pass includes long sequences, current bounds, source hierarchy, selected-state filtering, and visual readability at every Fit step; passing assertions is not sufficient for visual acceptance.
