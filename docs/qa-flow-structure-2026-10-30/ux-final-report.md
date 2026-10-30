# Independent flow-chart UX retest — 2026-10-30

The reported historical gaps and selected-state NIST toggle failures are resolved in the tested local build. Sixteen journey/interaction check groups passed, and all 22 main/extra screenshots were opened and inspected. A final definitions-branch correction also passed and its screenshot was inspected. This is bounded acceptance of these workflows, not an assertion that every UI state or pointer target is flawless.

## Environment and evidence boundary

Used the Product Design audit workflow: capture each journey state, inspect saved screenshots, then assess usability. Browser: installed Chromium 154.0.8037.57, headless Playwright. Branded Google Chrome is unavailable. Local production preview: `http://127.0.0.1:4187/FedRAMP-Policy-Atlas/`. The live Pages site was not retested because the environment proxy denied access; no bypass was attempted.

Main and extra journeys used `index-B5TnDIIH.js` / `FlowChart-DryPkDww.js`. The subsequent narrow correction used `index-ig61FBXY.js` / `FlowChart-DYkcUjZb.js`; it removes accidental class context from the unselected Definitions branch. That branch now has zero classes, 25 rendered nodes, and 23 verified relationships in its first batch. The main selected-state journeys were not rerun after this narrowly scoped correction. Desktop: 1680×1246; tablet: 820×1180; mobile: 390×844.

## Complete task journeys

| Journey | Observed result | Evidence |
| --- | --- | --- |
| Full FedRAMP → actual Class D → Fit → AGU-AGC-AIP → actual Class B → Fit | Selected entities stay readable. Current layout contains no historical empty columns. | `ux-final-01-class-d-fit.png` through `ux-final-03-class-b-fit.png` |
| Class B → Certification Class definition → source → Back | Correct selected IDs, source context, deterministic definition layout restored; no accumulated gaps. | `ux-final-04-definition-fit.png` through `ux-final-06-back-definition.png` |
| KSI-CNA-EIS with NIST off → on → off | Checkbox remains enabled; off removes NIST descendants, on preserves all 12 published mappings; selected KSI remains intact. | `ux-final-07-ksi-nist-off.png` through `ux-final-09-ksi-nist-off-again.png` |
| KSI depth two → NIST on → Up → Back | Choice and depth restore; rendered graph respects exclusion/inclusion. | `ux-final-10-depth-two-off.png`, `ux-final-11-depth-two-on.png` |
| NIST SI-7 → family → source → disable NIST | Honest source/family/control/enhancement hierarchy; disabling excluded selection returns to FedRAMP overview. | `ux-final-12-nist-control.png` through `ux-final-14-nist-selected-turned-off.png` |
| Mobile KSI on/off | Selected card remains fully visible, checkbox works, no horizontal document overflow. | `ux-final-15-mobile-ksi-on.png`, `ux-final-16-mobile-ksi-off.png` |
| Whole chart → readable Fit | Whole-chart zoom 0.249 provides overview; Fit returns to 0.7 and keeps selected Class D fully visible. | `ux-extra-whole-class-d.png`, `ux-extra-fit-class-d.png` |
| Exact Class B search | Class B is first result and Enter selects the actual class entity. | `ux-extra-class-b-search.png` |
| Keyboard Space on NIST toggle → Enter on published edge | Opens verified edge evidence with pinned commit, JSON pointer and mapping applicability. | `ux-extra-keyboard-edge-evidence.png` |
| Depth three with NIST off; tablet resize | No NIST descendants leak into graph; selected KSI remains readable at tablet width. | `ux-extra-depth-three-off.png`, `ux-extra-tablet.png` |
| Unselected Definitions branch on final correction | No accidental class cards; source peers and definition hierarchy are clear. | `ux-final-definitions-branch.png` |

Across the sixteen main captured states, maximum empty coordinate gap was 120 horizontal pixels and 72 vertical pixels. These are graph-space measurements, not browser-screen gaps. No card overlaps were detected. Both authoritative source cards remain peers at equal y; all rendered containment edges run downward and retain their original verified edge IDs and endpoints. No uncaught JavaScript errors occurred.

The first candidate already passed functional assertions but failed visual acceptance: Class D Fit shrank to 0.112 zoom and definition Fit to 0.277. The final behavior explicitly separates a readable selected view from a whole-chart overview. Large branches show counts and expansion controls instead of pretending their initial 24 entities are the complete dataset. Source/ancestor context appears separately in those counts.

## Remaining UX limitations

- **P2, non-blocking follow-up: dense shared edge routes can make exact pointer selection ambiguous.** Gutter routing greatly reduces lines crossing through cards, and keyboard edge inspection works. This audit does not certify every individual pointer hit target where several edges overlap; the parent is separately checking actual points on rendered SVG paths. Keep inspector evidence links as a precise alternative.
- **P3: mobile controls overlap the bottom portion of some cards.** The selected KSI and its navigation remain visible, but Fit/Whole chart and pan help sit over lower reference cards. A compact toolbar outside the drawing surface would preserve more diagram space.
- **P3: small metadata and offscreen context still require navigation.** Fit prioritizes selected-card readability; some root/peer cards and mapped targets are outside the viewport. Breadcrumbs, Up, panning and Whole chart provide recovery. This is preferable to illegible automatic zoom-out, but a miniature overview or offscreen-target cues would improve orientation. Inspector remains below the chart on narrow screens.

## Correction to the earlier audit

The earlier audit over-weighted persistent coordinates, selected-card visibility and successful controls. It did not test the complete drill-down sequence after Fit, and treated the disabled NIST option as intentional instead of testing the user's task of changing context while selected. Its acceptance was too narrow. This retest evaluates the full journey, compactness, semantic hierarchy, filtering behavior and screenshots after each Fit; assertion counts alone are not visual acceptance.

## Reproduction artifacts

- `ux-retest.mjs`, `ux-final.json`: ten main groups, sixteen captured states.
- `ux-extra.mjs`, `ux-extra.json`: six keyboard/viewport/search/overview groups, six screenshots.
- `ux-final-definitions.json`: final narrow correction result.
- `ux-baseline-report.md`: original reproduced failures.
- `ux-candidate1-report.md`: first redesign critique, with preserved candidate screenshots and state data.

No application code, existing tests, deployment configuration, or published site was changed by this testing agent. No deployment occurred.

## Additional resize race investigation

The parent regression observed an unfinished camera transition at 750 ms after earlier software-WebGL map journeys. Independently repeated the exact flow subsequence on the final `ig61FBXY` build: Full FedRAMP → Show all 459 → search KSI-CNA-EIS → Back (460 rendered cards restored) → search KSI again → resize to 390×844. Both a 1680-pixel desktop with clicked search result and a 1512-pixel desktop using Enter completed by 750 ms and remained correct at 2 seconds: selected card x99.8, width190.4, entirely inside surface x15, width360; camera scale0.85. Mobile screenshots were inspected. This does not disprove transient frame contention after preceding 3D use; the root regression is checking the bounded settled state. See `ux-mobile-race.json`, `ux-mobile-race-fast.json` and their scripts/screenshots.
