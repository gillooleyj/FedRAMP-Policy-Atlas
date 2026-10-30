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
