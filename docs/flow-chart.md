# Flow chart alternative

The explorer offers 3D Map, Flow chart and Table. Selection, source filters and connection depth are shared; flow branch and mapping preferences are encoded in the URL. The dark card design retains FedRAMP blue, KSI pink, class purple and NIST amber.

## Source hierarchy and association

FedRAMP 2026 · CR26 and NIST SP 800-53 are peer source documents. Each source has a separate bounded group. Within FedRAMP, classes occupy a source-defined section, followed by separate ruleset, rule-subset, individual-rule, KSI-theme, KSI and definition sections. Headings describe only the types actually present. Each heading has reserved space above connector entry tracks. NIST has families, controls and enhancements. Rows express source organization, not shortest-path distance. Card badges explicitly say “links away” for connection depth.

Classes are named in CR26's Certification Class definition. Their placement beneath CR26 is source-origin navigation; no synthetic source-to-class containment link is added. Rules retain their original APPLIES_TO arrows into classes. Solid connectors are verified containment; dashed connectors are associations, including published KSI mappings and definitions. Every rendered connector retains its original endpoints, direction, revision and locator. See the [source audit](qa-flow-structure-2026-10-30/source-review.md).

Selected views retain available source peers and actual containment ancestors as context cards. Context counts are separate from the requested neighborhood. Explicit layer filters still apply. Selecting the FedRAMP source also exposes its four source-defined classes. Class Up navigates to its source group; other Up actions follow actual containment. Back restores the prior selection, scope and viewport; Overview returns to the branch.

## Browsing and layout

The default branch reaches all 459 imported FedRAMP entities and 1,922 internal verified relationships. Branch choices include every ruleset, theme, classes, definitions, the independent NIST catalog, and the earlier representative example. Full coverage here refers to the imported CR26 dataset; legal/OMB documents, CTL guidance and other NIST publications are still outside current ingestion.

Primary entities start in batches of 24. Show 24 more and Show all expose the complete scope; context may add more cards. Selecting a source prioritizes rulesets/themes before definitions. Selecting an entity or inspected relationship prioritizes the selected record and endpoints. Search ranks exact identifiers and titles ahead of prose matches.

Layout is deterministic for the current visible scope. It no longer reserves columns for previously visited cards. Source roots share a level; classes have a separate section; each other section uses up to three columns. Connectors use row gaps and source gutters to avoid running through unrelated cards. Dense associations can still overlap in gutters; the inspector's relationship list provides individual evidence access.

Selection centers at readable zoom. Fit keeps readable text and centers the selection; Whole chart explicitly fits all displayed cards and can shrink text for a large overview. Return to selected card recovers a panned-away selection. Pan, zoom, pinch, responsive resizing, keyboard connector activation and reduced motion remain available. Mobile emulation is covered; physical touch-device validation remains open.

## Mapped controls

Include mapped NIST controls remains enabled during selection. Turning it on also enables the NIST entity layer and allows NIST reference context in a FedRAMP 20x/class-filtered view; it does not assign FedRAMP applicability to those NIST controls. Turning it off removes NIST descendants before neighborhood traversal, including indirect paths through them. Source roots remain available unless explicitly hidden. Turning it off while inspecting NIST returns to the FedRAMP branch.

The status reports actual published mappings currently displayed, or explains that none are imported in this scope. A class/rule having no imported mapping is not a claim that no official association exists. The current importer extracts 558 mappings from KSI control arrays, not rule-level control lists. No shortcut mapping or equivalence is fabricated.

## Validation and limits

[The October 30 structure review](qa-flow-structure-2026-10-30/REPORT.md) records reproduced failures, source verification, independent mixed-session testing, desktop/tablet/mobile screenshots and remaining limits. Regression commands are `npm run test:flow:e2e`, `npm run test:full-flow:e2e` and `npm run test:journey:e2e`, with `ATLAS_URL` pointed at the local production preview. The independent review scripts are retained alongside their evidence.

React Flow loads only when this presentation opens. No new source data, external service or paid integration was added. Coverage remains 1,676 entities, 3,696 verified relationships and 558 published KSI mappings. The existing main Three.js bundle-size advisory remains.

## Heading clearance and card identity — October 30, 2026

Removed the combined “Rulesets · KSI themes” and “Rule subsets · KSIs” headings. Rule and KSI branches now have separate, color-coded headings with type icons. Card badges spell out the entity type; rules use a document icon and squared corners, while KSIs use a shield icon and rounded pink cards. Groups, definitions, classes and NIST records each have their own type icon. Selection outlines retain the entity color, so selecting a rule does not give it the pink KSI outline. Context/distance is secondary footer text.

Headings occupy dedicated 24px rows with space before the incoming connector track; they also render above the edge layer. This corrects actual connector geometry rather than only hiding lines with a text background. The browser regression checks every rendered orthogonal segment against every heading rectangle in seven overview/drill-down/mobile states. See [results and screenshots](qa-flow-labels-2026-10-30/README.md).
