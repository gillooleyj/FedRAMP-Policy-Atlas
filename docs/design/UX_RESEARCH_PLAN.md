# Atlas UX direction evaluation

**Status:** Plan only; do not redesign production from this document without review.

## Three competing prototypes

- **A. Research Library:** search-first home, official-source result types, faceted filters, citation-first inspector, optional graph navigation.
- **B. Analyst Workbench:** global search with left scope filters, central document comparison/graph, persistent right evidence inspector and history controls.
- **C. Graph Explorer:** immersive 3D Everything entry, progressive cluster reveal, search-to-focus, 2D/flow/table switcher and source inspector.

## Evaluation criteria

Run the same representative CSP, agency, advisor, assessor, researcher tasks from `docs/product/ATLAS_PRODUCT_BRIEF.md` in each prototype. Observe findability, time to evidence, confusion about edge authority, navigation return, task success, keyboard usability, and mobile fallbacks. Mockup data must be visibly labeled fictional/placeholder if official records have not been ingested.

Preserve shared graph semantics, provenance, category filters and deep-linking across all modes. Existing `SPEC.md` defines the 3D Everything default; changing that default requires a recorded decision based on research rather than an incidental UI patch.

## Workflow

1. Inventory existing UX, screenshots, issues, known functional coverage.
2. Use MagicPath for rapid exploratory concepts; Figma for editable review frames and tokens.
3. Choose and document preferred approach, with rejected alternatives.
4. Write screen states and interaction acceptance criteria.
5. Codex implements one reviewable vertical slice with visual, keyboard and browser checks.

**Do not change ingestion meaning or create unverifiable edges for visual completeness.**
