# Published reader and dark-mode coverage: review record

Date: November 13, 2026

**Status: implementation prepared for draft review. Automated source/model checks and the production build pass. Rendered browser validation is blocked by this execution environment and remains a required review gate.**

## Change

The existing inspector now presents complete published FedRAMP rule and KSI content, including subitems, notes, warnings, artifact buckets, and other consequential source fields. Individual source disclosures show the original value, exact JSON pointer, pinned URL, version, and commit. Entry, class, and dataset-default artifact content remain separately identified. Required, Recommended, and Optional wording is preserved.

The reader uses the existing light/dark token system and appearance controls. The initial saved or device-controlled site preference is resolved before the application module loads. Both themes use the same reading typography and source hierarchy. Class-selection buttons expose their selected state, and forced-color focus remains visually distinct from selection.

The existing Everything 3D entry, flow/table alternatives, source pins, imported graph, NIST reader, and relationship semantics remain intact. This is a shared component slice rather than a complete implementation of all three design compositions.

## Completed verification

| Check | Result and scope |
| --- | --- |
| Full automated suite | 103 tests passed across 10 files. Includes 13 new source-reader tests. |
| Source fidelity | Actual pinned SCG parent/subitems/artifacts/notes; KSI B Optional, C wording, missing D; common/class supporting fields; exact locators; dataset defaults; unknown and empty fields; safe handling of source markup. |
| Existing data and navigation models | Existing ingestion, update lifecycle, KSI scope, class traces, graph navigation, flow, exploration, and journey tests passed. These are model checks, not browser interaction results. |
| ESLint | Passed. |
| TypeScript | Passed, including the production build's typecheck. |
| Production Pages build | Passed with the existing large-chunk advisory. No deployment performed. |
| Initial appearance script | Six isolated script cases passed: saved Light/Dark, device preference, invalid/missing preference, and blocked storage. This is a script-level check, not measurement of rendered first-paint behavior. |
| Independent source/accessibility review | Completed. Corrected heading structure around Addresses and the forced-colors selected-class focus override. |
| Whitespace/diff check | Passed. |

## Browser validation blocker

The browser harness is [tests/source-reader-browser.mjs](../../tests/source-reader-browser.mjs), available as `npm run test:source-reader:e2e`. It was attempted against the local application.

Chromium failed before creating an application page because the execution sandbox denied its process-singleton IPC socket: `socket() failed: Operation not permitted`. Automatic approval review rejected the request to run the same browser test outside the sandbox because the current session permission profile disallows that escalation. No security settings or bypass flags were added to work around this restriction.

The shared cloud browser also could not reach the local preview address. Neither route produced a new application screenshot.

The [machine-readable execution record](results.json) reports:

- `status: environment-blocked`
- `browserLaunched: false`
- `applicationPageCreated: false`
- Zero completed browser checks and zero screenshots.

Do not reuse historical screenshots or QA results as evidence that this new reader has passed visual or interaction review.

## Token calculations

Calculated declared foreground/background pairs against the reading surface:

| Role | Light | Dark |
| --- | ---: | ---: |
| Primary text | 14.42:1 | 13.10:1 |
| Supporting text | 6.27:1 | 8.27:1 |
| Links | 7.06:1 | 8.94:1 |
| Control borders | 4.03:1 | 5.19:1 |

These are calculations from the existing CSS tokens. They do not verify rendered opacity, overlays, state combinations, graph legibility, or complete accessibility conformance. Applicable reference guidance is linked in the [design contract](../design/PHASE1_READER_AND_THEMES.md).

## Reproduce the pending gate

Use a development environment that permits a local Chromium process. Do not change security restrictions merely to force this run.

```sh
npm ci
npm run lint
npm run typecheck
npm test
npm run build:pages
npm run preview -- --host 127.0.0.1 --base=/FedRAMP-Policy-Atlas/ --port 4189 --strictPort
```

In a second terminal:

```sh
ATLAS_URL=http://127.0.0.1:4189/FedRAMP-Policy-Atlas \
ATLAS_QA_DIR=/tmp/atlas-source-reader-qa \
npm run test:source-reader:e2e
```

Set `CHROMIUM_PATH` when the local Chromium executable is elsewhere. Inspect the generated screenshots, not only the assertions. Review the published reader in light/dark, KSI class changes, per-item source disclosures, 320px/390px wrapping, keyboard operation, forced colors, and appearance persistence/context preservation. Measure actual rendered contrast and check first-load appearance.

## Known limits and subsequent work

- Only balanced Markdown strong emphasis is interpreted. Other source syntax remains visible; raw HTML is inert and the exact original value is available in each source disclosure.
- Generic structured fields preserve original keys and values. Readable inherited applicability/timing presentation remains a subsequent slice.
- The existing mobile page structure remains tall. A focused mobile reading-and-return improvement needs rendered testing and representative-user evaluation.
- The new desktop reader is wider and uses 16px body text. These layout choices still need visual verification at the intended viewports.
- Representative stakeholder sessions, screen-reader testing, physical touch devices, and additional browser engines have not been validated in this pass.
- No new regulatory data, compliance decision, KSI/control equivalence, source promotion, or production entry-default decision is introduced.

Merge and deployment require an express user request after review.
