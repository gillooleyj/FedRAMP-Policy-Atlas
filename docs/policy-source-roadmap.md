# Next milestone: legal and policy source coverage

Start this immediately after the complete imported FedRAMP chart, before expanding ISO crosswalks. The visualization is ready to display more evidence; the missing part is authoritative document ingestion and relationship validation. “Full FedRAMP” in the chart means the complete pinned Consolidated Rules dataset, not every law, policy or regulatory relationship.

## Evidence already available

`npm run inventory:policy` scans the active pinned FedRAMP source snapshot and writes `policy-reference-inventory.json`. The current scan finds 18 literal mentions across five targets: the FedRAMP Authorization Act, OMB M-24-15, OMB Circular A-130, a Title 44 USC § 35 reference requiring resolution, and FIPS 200. Each entry preserves the exact wording and JSON pointer, together with the source URL, revision, retrieval time and hash. It emits no graph edges. This is a bounded keyword inventory, not an exhaustive legal citation parser; it does not establish that a document currently governs a particular entity.

Concrete starting paths:

- `/FRR/AGU/info/purpose` explicitly names the FedRAMP Authorization Act and OMB M-24-15.
- `/FRR/AGU/data/all/AGC/AGU-AGC-AIP/statement` requires agencies to maintain policy aligned with OMB M-24-15.
- `/FRR/AGU/data/all/AGC/AGU-AGC-NAI/note` cites M-24-15 section IV(a).
- `/FRR/AGU/data/all/USE/AGU-USE-ROR/note` cites Title 44, A-130, FIPS 200 and M-24-15. Preserve the original imprecise “44 USC § 35” wording; resolve it against official text before assigning a specific statute section.

## Ingestion order

| Priority | Documents | Authoritative acquisition and relationship work |
| --- | --- | --- |
| 1 | FedRAMP Authorization Act and OMB M-24-15 | Retrieve enacted law/current codification from Congress.gov, GovInfo or the House Office of Law Revision Counsel; retrieve the issued OMB memorandum from its official publisher/archive. Link the explicit AGU citations first. |
| 2 | FISMA, OMB Circular A-130 and FIPS 200 | Import official enacted/current law, OMB text and NIST publication. Resolve exact sections, scope and agency responsibilities; do not infer that every security control is individually mandated by every document. FISMA is a planned source, not a match in this inventory. |
| 3 | Historical OMB FedRAMP memorandum, FedRAMP baseline publications, NIST SP 800-37/53A/53B and other cited NIST publications | Distinguish historical, amended and superseded editions. Verify supersession against the official document, not its publication date alone. Reuse OSCAL back-matter references where available. |
| 4 | Other regulations and framework crosswalks, including ISO | Add regulations when a precise citation is supported by an imported document, using authoritative CFR/eCFR text and effective dates. Use official or clearly attributed crosswalks; record contributor, direction and editions. Respect ISO text licensing. |

These are planned acquisition sources, not newly fetched or verified document editions. No legal status was determined by this UI change.

## Acceptance criteria for the first legal/policy slice

1. Immutable raw files and manifests: official URL, issuer, document identifier, edition/amendments, publication date, effective dates where stated, retrieval time, SHA-256, and historical/current/unknown status with supporting evidence. Dates and applicability must be independently represented; missing fields stay unknown.
2. Stable document and section IDs. Preserve original wording, exact section/page/paragraph locator, quotation, extraction method and the source revision supporting each edge. A simple citation becomes `REFERENCES`; `ESTABLISHES`, `AMENDS`, `SUPERSEDES` and `INCORPORATES` require their own explicit evidence. A chain of references never becomes inferred legal authority or compliance equivalence.
3. A complete, reviewable path from an AGU rule to M-24-15 section IV(a), and from a program authority claim to the exact enacted-law section. Show both endpoints, editions, applicability, source quotations and evidence in all three views.
4. Tests for pinpoint resolution, ambiguous citations, amendments, historical editions, applicability, stable IDs, duplicate references and invalid-source failure. Ambiguous matches remain candidates outside the verified graph. Report resolved/unresolved counts for each extraction path rather than claiming “all relationships.”
5. Extend the existing daily update adapters to the official sources. Hash and compare revisions; stage source and relationship diffs; retain the last validated snapshot on failure. Legal scope, force, effective-date or relationship changes require review before promotion. The recurring agent can detect, ingest, validate and prepare a review; autonomous publication remains a separate, bounded policy decision.

Completion means a tested end-to-end legal/policy slice and explicit remaining coverage, not an unsupported assertion that the entire regulatory ecosystem is mapped.
