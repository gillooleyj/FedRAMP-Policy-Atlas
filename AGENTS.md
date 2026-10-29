# Repository agent instructions — FedRAMP Policy Atlas

## Mission
Build a citation-grounded, public-source 3D graph of laws, policy, FedRAMP rules, KSIs, NIST standards, controls and baselines. Prioritize correctness over attractive but unsupported graph edges.

## Sources of truth
- Treat upstream FedRAMP canonical JSON and JSON Schema from `https://github.com/FedRAMP/rules` as authoritative for the 2026 FedRAMP Consolidated Rules. Read upstream AGENTS.md and schema before parsing.
- Treat NIST-authored OSCAL from `https://github.com/usnistgov/oscal-content` as authoritative for the imported NIST catalog content, but pin specific commits/revisions.
- Source legal/policy texts from primary official issuers; avoid relying solely on search snippets.
- Treat user-supplied images as design references only.

## Truth, provenance and caution
- Every `verified` edge MUST carry evidence: source ID, revision/commit, URL, locator (rule ID, control ID, section, or precise JSON pointer), relationship type, and extraction method.
- For an ambiguous or inferred relationship, set status `candidate`, never display it as an official requirement/mapping, and exclude it from verified views by default.
- Distinguish `REFERENCES`, `PUBLISHED_CONTROL_MAPPING`, `INCORPORATES`, `SUPERSEDES`, `AMENDS`, `ESTABLISHES`, `CONTAINS`, `APPLIES_TO`, and `DEFINED_BY`.
- An association between a KSI and SP 800-53 controls DOES NOT mean the KSI is equivalent to, or satisfied by, that control.
- Preserve normative MUST / SHOULD / MAY and any MUST NOT / SHOULD NOT without reinterpretation. Respect applicability, class, audience and effective date. Do not blanket-apply one class's requirements to all classes.
- Track status (current/historical/proposed/unknown), version and timestamp. Do not infer official applicability from a future/pilot name.
- When source data has absent fields, expose "not specified in source"; do not manufacture values.

## Public-data-only guardrails
- Do not import or prompt for unpublished GSA/FedRAMP workplace data, CUI, PII, credentials, internal documents or cloud environment access.
- Prefer public read-only ingestion. Do not automatically push external changes, deploy publicly, or connect to third-party paid services.
- Use environment variables for any optional secrets, never commit `.env` files.

## Engineering rules
- Keep ingestion, source snapshots, graph transforms, layout, and rendering in separate packages/modules.
- Validate each incoming format against its published schema when possible. Capture and report validation failures; fail closed for verified-relationship ingestion.
- Preserve stable IDs and raw source identifiers. Detect duplicates and conflicting mappings.
- Store fetched source SHA/commit, retrieval time, and content hash; make imports idempotent and versioned.
- 3D layout must remain usable at scale. Use level-of-detail, clustering, batching/instancing and edge filtering; offer 2D/table fallback for accessibility and low-power devices.
- Automated tests must cover provenance requirements, class applicability, KSI mapping fidelity, relationship typing, and historical changes.
- Update README as code evolves. Report factual imported counts rather than sample/demo counts.
- Do not imply FedRAMP/GSA/NIST affiliation or endorsement.

## Working method
1. Inspect repository and source schemas; propose a concise task plan.
2. Implement vertical slices end to end.
3. Run lint, typecheck, tests and build; fix failures.
4. Report sources/versions, completed features, actual data coverage and limitations; list remaining tasks without presenting them as done.
