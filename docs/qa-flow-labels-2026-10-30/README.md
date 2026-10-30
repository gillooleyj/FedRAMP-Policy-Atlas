# Heading clearance and entity types

The previous headings occupied the incoming connector track and rendered behind the SVG edges. Combined labels also named KSIs in views containing only rules. The correction reserves a separate heading row, places connector tracks below it, and splits rulesets, subsets, rules, KSI themes and KSIs into accurately named sections.

Card identity now uses text, icons, color and shape together. “FedRAMP rule” has a document icon and squared blue card; “Key Security Indicator” has a shield icon and rounded pink card. Grouping cards, NIST records, classes and definitions have distinct type labels/icons. The selected outline follows its entity color. Context/distance remains visible as secondary footer text. Original data, source revisions, edge endpoints and provenance remain unchanged.

`npm run test:flow-labels:e2e` checks actual rendered SVG geometry against DOM heading rectangles, including offscreen headings, in seven states. It verifies that rule/KSI cards have different labels, shapes and colors, all cards have type icons, and headings name types present in the current view. All seven cases passed with zero connector/heading intersections or uncaught errors. Mobile has no document overflow. Screenshots were inspected for heading separation and card identity.

- [Mixed rule/KSI source overview](mixed-rule-ksi-overview.png)
- [Class B drill-down](class-b-drilldown.png)
- [Rule drill-down](rule-drilldown.png)
- [KSI with NIST mappings](ksi-with-mappings.png)
- [FedRAMP source](fedramp-source.png)
- [NIST control](nist-control.png)
- [Mobile KSI](mobile-ksi.png)
- [Machine-readable results](results.json)

The local production build passed 71 unit/integration tests, lint, TypeScript and build checks. Existing flow and return-navigation browser suites also exercise the changed layout. Tests use Chromium 154 at the Pages project path. Live Pages browser access is restricted in this environment. Dense edge overlap, offscreen context and mobile toolbar placement remain previously documented limitations.
