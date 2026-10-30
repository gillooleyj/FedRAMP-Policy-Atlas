# Product follow-ups

## Research clearer map labeling

Requested after the regional-navigation iteration. Keep the current default and region navigation stable while researching alternatives; this is a future investigation, not completed research.

- Study progressive labels and travel cues in galaxy maps, including No Man's Sky, plus established graph and geographic-map interfaces.
- Compare screen-center priority with spatial quotas, local zoom around the pointer, and explicit group drill-down. Test whether every group can be discovered without depending on the directory.
- Evaluate text length, label anchoring, overlap handling, hover stability and whether users understand sources → regions → groups → entities.
- Test desktop mouse/trackpad, touch and keyboard journeys: find a named family, inspect a KSI mapping, return to the overview, and explore two connection levels.
- Measure findability, time to locate a target, mistaken selections, label churn, and perceived visual overload before changing the default behavior.

## Flow-chart coverage expansion

The supplied flow-chart reference includes legislation, OMB policy, Rev. 5 baselines and additional NIST publications. Add these only through authoritative ingestion with pinned revisions, applicability and evidence for each relationship. Do not treat the visual reference as a source of verified edges. The first chart uses the atlas's existing FedRAMP rules, KSIs and NIST 800-53 data.

The chart now reaches every imported FedRAMP branch. Next: implement the legal/policy ingestion vertical slice in [policy-source-roadmap.md](policy-source-roadmap.md), starting with the explicit references inventoried in the active FedRAMP snapshot.

## Follow-ups from independent browser QA (October 30, 2026)

The stale Everything scope, semantic return navigation, disappearing context, moving class cards and offscreen selected mobile cards are addressed in this iteration. Mobile Filters now dismisses on Escape and restores trigger focus. Remaining validation: a complete mobile drawer focus-management/close-control pass, measured contrast and touch-target sizing, screen-reader testing, physical touch devices, Firefox/Safari, and live-site browser verification when environment access permits. Dense full-chart edge routing and long-title readability remain research items; source-directed arrows must not be reversed to improve layout.

## Source and flow follow-ups from the structure review

- Expose both the subset data locator and metadata locator in the inspector: containment uses `/FRR/.../data/...`, while subset title/applicability is held under `/FRR/.../info/...`. Existing applicability edges already cite metadata precisely.
- Research edge separation in dense source gutters and better mobile placement of chart controls and the below-chart inspector. Preserve original endpoints and direction.
- Evaluate class-variant navigation and rule-level control references as separate ingestion work. Optional KSI variants must not become mandatory class-applicability links.
- Keep mixed-session gap/readability and mapping-toggle regressions alongside individual button checks. A stable coordinate alone is not UX acceptance.


## Galaxy-map growth and orientation

The October 30 locator/theme iteration adds a fixed full-map overview, live view footprint, click/keyboard recentering, a stable hover readout, and independently selectable site/map palettes. It preserves the existing semantic zoom bands and source data. The live Galactic Atlas reference could not be inspected because the cloud proxy denies that hostname; the user-supplied screenshot informed the locator, not new policy relationships.

Before adding more source collections:

- Replace assumptions about two publisher hubs with source-driven region metadata; retain explicit unknown-source labels and evidence boundaries.
- Compare source/region aggregation and edge bundling at overview scale, expanding only the active area while retaining nearby context. Bundles must disclose their underlying typed edges; never imply a new verified relationship.
- Benchmark label churn, frame time and target-finding at 5k/10k entities using clearly marked synthetic performance fixtures separate from public source data. The current implementation is validated against 1,676 real entities, not an unlimited-scale claim.
- Evaluate overview-locator size, depth cues during orbit, touch panning, and travel breadcrumbs with users. The locator is a fixed front projection of the focal-plane viewing rectangle; it is not a 3D visibility test for every point.
- Research searchable nearby-object lists and density budgets, so adding laws, policy documents, ISO mappings and more NIST publications does not add every label or edge to the initial view.

## Follow-ups from the map and KSI-scope audit

- Consider a class-specific KSI chart subview, so the 46 indicators are immediately reachable without expanding every process rule connected to a class. Retain the authoritative hierarchy and distinct process-rule force.
- Evaluate density controls for large selected neighborhoods (KSI-CNA-EIS now reaches 845 entities at three levels). Do not represent indirect paths as new official mappings.
- Keep tracking the five missing Class D KSI wording variants and separate source-backed program availability from class-scope membership. Future changes to governing wording/classes require extraction review.
- Retain physical-device, other-browser and assistive-technology review, and continue measured contrast checks beyond the repaired light-map lines. Current evidence: qa-map-mappings-2026-10-30/REPORT.md.
