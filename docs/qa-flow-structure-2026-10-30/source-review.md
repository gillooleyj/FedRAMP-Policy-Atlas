# FedRAMP source hierarchy review — October 30, 2026

Independent read-only review of the pinned source structure, its published schema, upstream analysis instructions and the current graph transform. No production data, nodes, relationships or ingestion code was changed by this agent.

## Source identity and validation

- FedRAMP Consolidated Rules version **2026.10.13.01**, commit `a89d78477ddea98dc57eca24f5007794c2b4eeb6`. [Pinned JSON](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/fedramp-consolidated-rules.json), [pinned schema](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/schemas/fedramp-consolidated-rules.schema.json), [pinned upstream AGENTS.md](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/AGENTS.md). The instructions were fetched and retained as `upstream-AGENTS.md` in this directory. The immutable local raw JSON was validated successfully against its pinned Draft 2020-12 schema using Ajv with formats.
- NIST OSCAL catalog version **5.2.0**, OSCAL **1.2.3**, commit `f0de6d8d8c059d374f15e0ae07508d82e370fc1d`. Its root is `/catalog`; its metadata is `/catalog/metadata`. The metadata explicitly identifies the NIST publisher/creator and version. It is a separately imported source, not a JSON child of the FedRAMP dataset.
- Reviewed local `scripts/graph.mjs`. The graph currently has 459 FedRAMP entities and 1,217 NIST entities. All 558 published control mappings originate in FedRAMP KSI control arrays.

## What the raw source actually contains

The FedRAMP schema requires `info`, `FRD`, `FRR` and `KSI`; optional `CTL` is present in this source. There is **no top-level `classes` collection**. The upstream guide explicitly differentiates FRR's process/subset hierarchy from KSI's theme/indicator hierarchy. `CTL` is FedRAMP control guidance, not the independently imported NIST catalog; the current atlas does not import CTL.

| Atlas entity/relationship | Exact supporting source structure | Safe interpretation |
| --- | --- | --- |
| FedRAMP source node | `/info` | The pinned Consolidated Rules dataset. “FedRAMP 2026” is a short display label, not a separate program-authority document. |
| FedRAMP → ruleset | `/FRR/FRC` and `/FRR/FRC/info` (example) | Structural containment of the FRC process document. Metadata title is `FedRAMP Certification`. |
| Ruleset → subset | `/FRR/FRC/data/all/CLA` | Structural containment of a subset's rule entries. Metadata is separately at `/FRR/FRC/info/subsets/CLA`. |
| Subset → rule | `/FRR/FRC/data/all/CLA/FRC-CLA-ASF` | Structural containment of the named rule. |
| Rule → class A | `/FRR/FRC/info/subsets/CLA/applicability/classes` = `["A"]` | Explicit inherited subset applicability, retaining framework, path, actor, date and rule/class wording. It is not class→rule containment. |
| Framework-specific rule → class | `/FRR/FRC/info/20x/subsets/CSX/applicability/classes` = `["B","C","D"]` | Explicit 20x subset applicability; framework bucket `20x` is preserved. Rev5 uses the `rev5` metadata bucket and `Rev5` certification-type vocabulary. |
| FedRAMP → definition | `/FRD/data/all/FRD-CCL` | Structural containment of the Certification Class definition. |
| Class A/B/C/D → class definition | `/FRD/data/all/FRD-CCL/definition` | Each named class is explicitly enumerated in the definition; `DEFINED_BY` is the existing verified edge. |
| FedRAMP → KSI theme | `/KSI/CNA` | Structural containment of a theme; theme metadata lives directly here, not under an FRR-style `info` node. |
| Theme → KSI | `/KSI/CNA/indicators/KSI-CNA-EIS` | Structural containment of the indicator. |
| KSI → NIST control | `/KSI/CNA/indicators/KSI-CNA-EIS/controls/8` = `"si-7"` | Exact published mapping to the separately imported NIST `si-7` control, not equivalence or legal authority. |
| KSI class B statement | `/KSI/CNA/indicators/KSI-CNA-EIS/varies_by_class/b/statement` | A class-specific statement; this example begins `**Optional:**`. It is not a mandatory requirement and not structural containment of a class under the KSI. |
| NIST source → family → control | `/catalog/groups/0` (AC), `/catalog/groups/0/controls/0` (`ac-1`) | Structural containment entirely within the independent NIST catalog. |

Relevant schema pointers:

- `/$defs/class_name/enum`: `["A","B","C","D"]`.
- `/$defs/class_key/enum`: lowercase class keys `["a","b","c","d"]`.
- `/$defs/frr_subset_applicability/properties/classes`: arrays of class names; alongside `types`, `paths` and `affects`.
- `/$defs/ksi_indicator/properties/varies_by_class`: class-keyed indicator variants; b/c required when that alternate shape is used.
- `/$defs/ksi_indicator_level`: requires `statement`, permits `artifacts`, and has no `force` field in this pinned schema.

## Classes: exact provenance, and what not to invent

The exact definition is:

> The category of assurance that a cloud service offering supplies to federal government customers following FedRAMP Practices, increasing from minimal assurance at Class A to significant assurance at Class D; currently available categories are Class A, B, C, or D.

The transform derives four class entities from that text, all with sourceId `fedramp` and locator `/FRD/data/all/FRD-CCL`. Current verified paths are:

- `fedramp —CONTAINS→ fr:FRD-CCL`
- `class:A/B/C/D —DEFINED_BY→ fr:FRD-CCL`
- `rule —APPLIES_TO→ class:A/B/C/D`, where a subset's explicit class list supports it.

There is **no existing direct `fedramp —CONTAINS→ class:X` edge**, and the raw JSON does not expose a class collection whose children would straightforwardly support that structural edge. The definition establishes their source origin; it does not make every rule, KSI or NIST control a child of every class. Program availability also needs process status and applicable dates; the definition's wording must not be expanded into an unqualified certification eligibility statement.

Current direct incoming applicability counts are A:40, B:214, C:214, D:214. These 682 edges are rule applicability. The four class-definition edges are additional `DEFINED_BY` relationships.

## KSI/class association boundary

The source contains 46 KSIs: 41 have common statements, and five have class-specific B/C statements. There are no A or D variants in the current KSI records. The graph retains variant keys in entity metadata but emits **no KSI→class applicability edges**. All 558 KSI-to-NIST mappings in the current graph come from common `controls` arrays; there are no class-variant control arrays in this snapshot.

Consequences:

- Class D having no direct KSI edges does not prove KSIs are irrelevant to Class D, nor permit copying C's statements into D. The graph's implemented extraction has a boundary.
- A future relation such as `HAS_CLASS_VARIANT` can cite the exact variant object and describe “published statement variant for class B.” It must not silently become mandatory `APPLIES_TO`; the Optional wording still matters.
- Enabling mapped controls on a source or theme may intentionally traverse its contained KSIs to expose published mappings. This is a **view expansion**, not a new direct source→control mapping edge. Keep the real KSI endpoints present.
- The current extractor does not import rule-level `controls` lists. A rule/class with no currently imported control links may therefore have source information beyond this graph's present mapping extraction. Report absence as “no imported mapping in this scope,” not “no official association exists.”

## Recommended display semantics

1. Use **FedRAMP Consolidated Rules** and **NIST SP 800-53** as peer source roots. A mapped NIST control remains in the NIST source group, with its actual KSI mapping connector across groups. Never nest the whole NIST catalog under FedRAMP because one KSI references a control.
2. Place class cards in the FedRAMP source group, with a small “Classes defined by this source” heading or source-origin breadcrumb. This follows each class's provenance and the exact definition. Such grouping is navigation/presentation, **not a new verified CONTAINS edge**; do not add it to verified-edge counts or style it as legal authority. Offer direct access to FRD-CCL evidence.
3. Keep the three relationship concepts separate: source grouping/containment, rule applicability to classes, and published KSI/control mappings. Arrow direction must remain as published even when compact placement puts a class card on the left.
4. A class overview can show applicable rules grouped by their true ruleset/subset ancestors. It should show actual applicability connectors and explain the grouping. Do not use a visually neat class→ruleset arrow as a substitute for the rule-level evidence.
5. On selection, preserve a predictable compact hierarchy instead of appending every visited card into permanently reserved coordinates. Preserve the selected focus and camera intent, but recompute empty slots for the **current** scope. Test multi-step sequences and Fit bounds, not only one selection's unchanged x-coordinate.
6. Keep Include mapped NIST controls usable after selecting a card. If the NIST layer is off, explain the conflict and offer an action that enables the layer or clearly states zero visible NIST context. A silently disabled option or an apparently successful toggle with hidden mappings is not an adequate state.

## Provenance observation outside the immediate UI fix

Subset node `sourceLocator` currently points to the `/FRR/.../data/.../{subset}` entries map, while its title/applicability raw object is read from `/FRR/.../info/.../subsets/{subset}`. Containment edges correctly cite the data path and applicability edges correctly cite the metadata path; the subset inspector should eventually expose both locators to make its displayed metadata immediately traceable. This review did not modify those records.

## QA change prompted by the prior miss

The earlier agent verified isolated class selection and preservation of visited card coordinates, but did not bound accumulated whitespace after a mixed browsing session. That test passed while the broader interaction remained poor. The new acceptance checks must follow whole sessions: default chart → multiple source/rule cards → class D → Fit; NIST layer off → FedRAMP source → mapped-controls toggle; all classes → hops/depth changes → mapping toggle → Back/Overview. Assertions must cover graph bounds/readability and available toggles, in addition to identity, provenance and exact coordinates.

## Reproduced mixed-session baseline

On the previous published build (`index-dK7PwtXj.js`), the exact sequence default flow → KSI-CNA-EIS → ac-2 → FedRAMP source → **class:D** produced 60 displayed cards across a 12,572×696 layout. Fit reached the minimum zoom of 0.08. The initial default's width had been 3,752. This demonstrates that the accumulated layout/cache state, not simply a class's initial location, made the chart unusable. With the NIST layer disabled and FedRAMP source selected, Include mapped NIST controls was disabled. Evidence is in `baseline-session-results.json`, `baseline-session-class-d.png` and `baseline-source-mapping-disabled.png`.

The literal search `Class D` initially matches the Certification Class definition before the class entity because the source definition contains that text. The reproduction uses the exact identifier `class:D` to avoid accidentally measuring a different node. This is also a useful search-ranking follow-up: exact entity-title matches should be prioritized over prose substring matches.
