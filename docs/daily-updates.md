# Daily authoritative-source monitoring

This slice adds a working monitor, review reports, explicit local promotion, and a website freshness panel. It does not deploy a website or activate a remote scheduler by itself.

## Commands

```sh
npm run updates:init    # initialize active pointer/status without fabricating a check
npm run updates:check   # read upstream HEADs, validate changed sources, stage a candidate
```

The monitor checks the default-branch HEAD of `FedRAMP/rules` and `usnistgov/oscal-content` with read-only HTTPS Git operations. It follows their commits automatically while retaining every downloaded snapshot. It downloads the FedRAMP schema from the same commit and the NIST schema from the official release matching the catalog's OSCAL version. New FedRAMP upstream AGENTS.md guidance is retained with its hash for review; remote code or instructions are never executed by the importer.

Unchanged snapshots still undergo byte-integrity and schema checks. Changed data must pass the published schemas, graph uniqueness, endpoint, provenance, and unresolved-reference checks. Missing credentials, network failures, invalid schemas, changed snapshot hashes, unrecognized structures, or unresolved references leave the active graph intact and return a nonzero process exit status.

A successful check can mean either matching upstream commits or a validated candidate awaiting review. It never means a candidate has automatically been published. “Up to date” refers only to the two monitored source revisions at the recorded check time; it does not establish full regulatory coverage or legal applicability today.

## Files and change reports

- `public/data/active.json`: authoritative active graph pointer; changed atomically.
- `public/data/graphs/<version>.json`: immutable, content-addressed graph versions.
- `public/data/snapshots/<source>/<commit>/`: source bytes, published schema, manifest and hashes; new FedRAMP snapshots also retain AGENTS.md.
- `public/data/updates/status.json`: last attempt, last successful validated check, observed commits, active version, pending candidate, and failure details.
- `public/data/updates/reports/<candidate>.json`: source revisions, base graph version, counts, added/removed records, and complete before/after records for changes.

The diff distinguishes entity content and inherited applicability/timing changes from provenance-only commit churn. Relationship identity includes endpoints, relationship type and class scope. Locator changes are reported as evidence changes. Added/removed published KSI mappings have separate counts. Nothing is silently promoted merely because a schema passes.

The Sources & coverage page displays status and check times, a warning after 36 hours without a successful check, pending summaries, and inspectable before/after reports. A public visitor cannot trigger imports or approve updates. Large report lists show the first 100 records per category; the download contains every record.

## Review and promote

1. Run a check and inspect its pending candidate report. Read retained upstream guidance changes, statements, mapping additions/removals, class variants, actors, force, effective dates, and source/schema revisions.
2. Resolve importer defects or unsupported structures before promotion. Re-run checks/tests when making corrections. A new source commit alone is not proof that applicability interpretation remains correct.
3. Explicitly activate the reviewed candidate against its recorded base:

```sh
npm run updates:promote -- <candidate> --expect-active <base-version>
```

The command rejects stale bases, rechecks snapshot hashes and schemas, rebuilds the candidate from source, verifies graph/report consistency, and switches `active.json` atomically. A shared exclusive lock prevents overlapping imports, checks, and promotions. A leftover `public/data/.update-lock` after a killed process needs inspection: confirm no data process is running before removing it.

Previous graphs and source snapshots remain on disk. The pointer records the previous version. There is no rollback UI/command or historical comparison UI yet. Test runs exercise promotion in temporary workspaces only; no new live candidate was promoted during this implementation.

The graph loader follows `active.json` to a versioned graph. A missing pointer (404) permits legacy `graph.json`; malformed or failed pointer requests do not silently load another version. `graph.json` is maintained as a compatibility export. Offline `npm run ingest` follows the active graph's source manifests after activation, so refreshing setup does not revert to the original bootstrap pins. Original pins in `scripts/sources.mjs` are used when no active pointer exists.

After promotion, run the application checks, regenerate `docs/import-report.*` with `npm run ingest`, inspect screenshots, and rebuild. For a deployed static website, the rebuilt files must be deployed before visitors receive the promoted data/status. Serve `/data/active.json` and `/data/updates/status.json` with revalidation/no-cache, and versioned graphs with long-lived immutable caching. Publish versioned graph/snapshot files before switching the deployed pointer; keep older versions available.

## Daily GitHub Actions workflow

`.github/workflows/daily-source-check.yml` is a repository configuration for daily checks and manual runs. It uses read-only repository permissions, serializes runs, sets a timeout, performs the monitor plus lint/typecheck/tests/build, and retains source/status/report artifacts for 30 days even when a check fails. Its run summary provides the state, active graph and pending candidate. It does not create commits/PRs, promote data, deploy, or send application alerts.

**Schedule activation:** the application and workflow are now committed to the GitHub default branch. Verify Actions/scheduled workflows are enabled. A future scheduled run must be observed before claiming the daily schedule has executed. The website has been deployed separately; publishing the cloud development environment does not itself run this schedule. GitHub's schedule is best effort at 10:23 UTC daily (5:23 a.m. New York standard time / 6:23 a.m. daylight time); runs may be delayed. Workflow failures can use GitHub's normal notifications according to the account's settings.

Each hosted job starts from the committed active snapshot, compares upstream HEADs, and uploads its outputs. Until a candidate is reviewed and committed/deployed, subsequent jobs can report the same candidate again. Artifact retention is not permanent archival storage. Download and retain reviewed outputs with the project. An unchanged-source check also writes a fresh status artifact; a production deployment path must publish that status to keep the public freshness panel current.

This design deliberately separates daily observation from human-reviewed data publication. The next operational slice is choosing production hosting/storage and wiring successful status-only builds and reviewed promotions into that deployment process. The cloud development environment is not a production scheduler or public website host.

## Target: recurring agent with site publication

The operational build goal is an independent daily agent that completes the full check → validate → assess diff → promote → build/test → deploy → verify-live cycle. It must also publish check freshness on no-change runs. Merely producing artifacts is not the final operating model.

The future release policy should permit routine validated source refreshes to publish automatically, while routing unsupported schema/connector changes, ambiguous interpretation, unresolved references, or failed checks for review. Current manual promotion is unchanged until that policy, agent execution, and deployment integration are implemented and tested. Production hosting, persistent storage, scheduler activation, scoped deployment authorization, rollback, and operator notification channels still need configuration.

Completion requires evidence from scheduled execution and live-site revision verification, including no-change, failed-update, and rollback exercises. See [SPEC.md](../SPEC.md#operational-build-goal-recurring-update-agent) for the acceptance criteria. This is recorded as a build goal, not a claim that an autonomous publishing agent is already running.

## Validation

- Live read-only check: both official upstream HEADs matched the active source commits; active graph unchanged (`5cda3bb3c29d199d`).
- 15 update-lifecycle tests cover no-change, mapping diffs, repeated checks, network/schema failures, unresolved mappings, stale-base rejection, validated promotion, candidate/source tampering, retained-source integrity, concurrency, and semantic change detection.
- Existing 12 ingestion/model tests remain in the suite.
- Seven update browser checks cover live check status, pending report inspection, absence of public write controls, failure/stale status, missing status, mobile layout, and uncaught errors. Pending/failure scenarios use intercepted test responses, not production fixture data.
- [Source watch desktop](screenshots/source-watch-desktop.png), [mobile](screenshots/source-watch-mobile.png), and [browser results](update-browser-results.json).
