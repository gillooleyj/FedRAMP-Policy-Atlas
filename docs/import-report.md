# Import report

Graph snapshot: 8bebe1f392e5feb0

- fedramp: 2026.10.13.01, commit a89d78477ddea98dc57eca24f5007794c2b4eeb6, retrieved 2026-10-29T23:42:12.099Z; JSON Schema validation passed. [Source](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/fedramp-consolidated-rules.json)
- nist: 5.2.0, commit f0de6d8d8c059d374f15e0ae07508d82e370fc1d, retrieved 2026-10-29T23:42:13.564Z; JSON Schema validation passed. [Source](https://raw.githubusercontent.com/usnistgov/oscal-content/f0de6d8d8c059d374f15e0ae07508d82e370fc1d/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json)

1676 nodes; 3841 verified relationships.

```json
{
  "nodesByKind": {
    "class": 4,
    "control": 324,
    "definition": 80,
    "enhancement": 872,
    "family": 20,
    "ksi": 46,
    "rule": 245,
    "ruleset": 17,
    "source": 2,
    "subset": 56,
    "theme": 10
  },
  "edgesByType": {
    "APPLIES_TO": 827,
    "CONTAINS": 1670,
    "DEFINED_BY": 786,
    "PUBLISHED_CONTROL_MAPPING": 558
  }
}
```

0 unresolved references retained in import-report.json.

- CTL: Not imported: FedRAMP control guidance is distinct from the NIST catalog
- baselines: Not imported
- history: Source snapshots retained; legal chronology not imported
- classes: Names, explicit rule applicability, and governing process-rule KSI scope; process force is not indicator force. Five KSIs have no Class D-specific wording. No certification availability inferred

Published mappings indicate associations, never equivalence or compliance satisfaction. No legal, OMB, historical, or publication-reference edges are inferred. Source update logs are retained, but do not substitute for importing historical revisions.
