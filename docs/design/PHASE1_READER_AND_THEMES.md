# Phase 1: Published wording and appearance

Date: November 13, 2026

## Decision and scope

The user accepted the visual direction of the three research concepts and requested dark mode before proceeding. The shared content decision is to display exact published wording by default. An Atlas explanation, if introduced later, is optional and visibly separate from the published requirement.

This slice improves the existing inspector. Search, Everything 3D, flow, and table select the same source reader. The established Everything 3D entry remains in place while the search-first, workbench-first, and graph-first compositions remain available for later evaluation. Approval of the samples does not select a new production entry default.

The implementation uses the existing React, TypeScript, Vite, Three.js, React Flow, and appearance system. No framework or package change is required. Public pinned source records are the only content input. This work adds no inferred regulatory relationship or compliance determination.

## P1-01: Complete published reading surface

**Users:** CSPs, federal agencies, advisors, assessors, and researchers.

**Research task:** Find a rule or KSI, read the actual criterion and consequential supporting information, distinguish required/recommended/optional wording, and retrieve exact source support.

**Interactions:** Select a record through an existing presentation; choose a class where the record varies; read the published statement, subitems, artifacts, and notes; open a source disclosure for provenance and the original source field; return to the same reading position.

**Content and provenance:** Render the pinned raw strings. Preserve parent statements, ordered subitems, qualifiers, negative language, source formatting, and selected class variants. Keep shared record fields and class-specific fields separately identified. Display artifact framework buckets explicitly and distinguish dataset-default artifacts from entry-specific artifacts. A missing class statement is a missing-source state, not an exemption. A process rule's force is not assigned to a KSI. Published control associations retain their existing meaning and edge model.

Each source disclosure identifies the source record, revision, commit, URL, and exact JSON pointer. Original values remain available for checking formatting. Unknown or unsupported values must remain inspectable rather than silently disappear. Source notes and warnings are part of ordinary reading. Do not invent an action checklist, evidence verdict, or official endorsement.

**Accessibility:** Semantic headings, paragraphs, and lists; source actions reachable by keyboard; readable wrapping and selectable text; consistent reading typography in both themes. Labels identify source context independently of color. Native disclosures expose their state and keep their invoking control available.

**Acceptance:**

- SCG-CSO-RSC shows the exact parent statement, two required subitems, recommended subitem, both entry artifact strings, and both notes without requiring raw JSON.
- The qualification about top-level accounts controlling enterprise access to the entire cloud service offering remains intact.
- KSI-CNA-EIS preserves Optional in Class B, shows the exact Class C wording, and identifies missing Class D wording without copying another class.
- Shared and class-specific supporting fields retain their own locators; source display does not invent precedence.
- Additional consequential fields, including warnings, corrective actions, notifications, effective-date fields, and timeframes, remain readable when present.
- Source text is unchanged by selection path or appearance. Theme switching is not a navigation action.
- NIST/source/definition readers and the existing graph connections remain available.

## P1-02: Dark-mode coverage of the reader

**Users:** All stakeholders reading or verifying source material in their preferred appearance, including users relying on larger text, high contrast, keyboard navigation, or reduced motion.

**Research task:** Read and verify the same requirement comfortably across the source, graph, flow, and table surfaces without losing research context.

**Interactions:** Use the existing Appearance control. Site options remain Use device setting, Light, and Dark. Map options remain Follow site theme, Light, and Dark. The initial map preference remains Dark. Explicit site choices override the device preference; Use device setting follows changes to that preference. Preferences persist on the device, with an in-memory fallback if storage is unavailable.

**Content and provenance:** Appearance affects presentation only. Record identity, source revision, class, conditions, exact text, and typed relationships stay the same. Preserve selection, filters, query, open source disclosures, reading position, and map camera during theme changes.

**Accessibility:** Reuse the existing semantic color tokens. Primary text, supporting text, links, controls, and source labels need sufficient contrast in each theme. Preserve meaningful category distinctions through text as well as color. Use visible focus and selection outlines; do not rely on glow or shadows alone. Allow browser forced-color adjustments and retain the text/table route for the WebGL visualization. The new reader introduces no motion.

| Role | Light | Dark |
| --- | --- | --- |
| Page | `#fafaf6` | `#101820` |
| Reading surface | `#ffffff` | `#17232e` |
| Primary text | `#172b40` | `#e1eaf1` |
| Supporting text | `#526272` | `#acbdca` |
| Link | `#245d84` | `#8cc9f3` |
| Control border | `#71818b` | `#8196a4` |

These are existing Atlas tokens. Token values alone do not establish accessibility conformance.

**Acceptance:**

- Verify site Light/Dark/device preference, independent map preference, reload persistence, live device changes, and blocked-storage behavior.
- Change appearance while a source disclosure is open and a class variant is selected. Preserve source content, disclosure, reading position, selection, query, filters, and camera.
- Inspect the reader in light and dark at desktop and narrow widths, including long source locators and artifact values.
- Complete a source-disclosure task with the keyboard. Inspect forced colors and reduced motion while retaining the accessible table route.
- Measure actual text/background combinations in the rendered reader and report the scope of measurement. Do not treat a screenshot or a few color pairs as a complete accessibility audit.

## Source pins and verification boundaries

Implementation baseline: `daa2f5cde3567365bab88e82c18a245b1357e765`.

FedRAMP example source: version `2026.10.13.01`, commit `a89d78477ddea98dc57eca24f5007794c2b4eeb6`, [published JSON](https://raw.githubusercontent.com/FedRAMP/rules/a89d78477ddea98dc57eca24f5007794c2b4eeb6/fedramp-consolidated-rules.json).

- SCG-CSO-RSC: `/FRR/SCG/data/all/CSO/SCG-CSO-RSC`.
- KSI-CNA-EIS: `/KSI/CNA/indicators/KSI-CNA-EIS`.
- Dataset-default artifacts: `/info/default_artifacts/FRR` and `/info/default_artifacts/KSI`.

This slice reads the existing validated snapshot and does not refresh or promote source data. It does not claim that the pinned revision is the latest published revision.

Relevant guidance: [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), and [CSS forced colors](https://www.w3.org/TR/css-color-adjust-1/#forced).

## Follow-on work

1. Evaluate mobile reading and return navigation with representative users. Preserve source context and graph state when improving the existing tall mobile layout.
2. Present inherited applicability and timing in readable source-backed fields, retaining their exact metadata locators and unresolved overrides.
3. Compare the three entry compositions using the same record, initial state, source-verification task, and balanced stakeholder tasks. Record any entry-default decision separately.
4. Evaluate whether an optional Atlas explanation resolves a specific user question before adding an interpretation layer.

Completion and validation evidence are recorded with the implementation review. Merge and deployment require an express user request.
