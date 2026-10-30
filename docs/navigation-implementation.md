# Navigation implementation

The approved dark 3D universe remains. This slice implements the navigation priorities from [the research](navigation-research.md) without changing imported regulatory data or relationship semantics.

## Interactions

- Pan is the default: drag empty space to move left/right/up/down in screen space. Switch to Orbit for rotation. Right-drag performs the alternate gesture. Touch maps one finger to the selected mode and two fingers to dolly/pan.
- Mouse-wheel zoom approaches the pointer. +/- zoom around the current target. Search frames the selected neighborhood; clicking a point or label selects without an automatic camera jump.
- **Fit connections** frames the selected node and its currently shown neighbors. **Focus neighborhood** also hides unrelated nodes. **Fit all** frames the visible graph. **Back** restores a prior camera view within the mounted map; it does not undo entity selection or filtering.
- With keyboard focus on the canvas: arrow keys pan, +/- zoom, F fits connections, Home fits all, Escape restores the prior camera view. Search inputs retain their normal keyboard behavior.
- Reduced motion uses immediate focus transitions. User gestures cancel an in-progress camera transition.

## Labels and relationships

Labels are available for every imported entity, with individual IDs/titles becoming eligible as their projected scale increases. The selected entity takes priority, followed by direct neighbors, hubs and context. Hover changes styling only; it does not affect placement priority. Text bounds account for different label widths, multiple anchors are attempted, and show/hide thresholds differ to reduce zoom-edge flicker. Label placement reserves space for navigation controls. Low-priority labels may be suppressed when space is unavailable; a selected entity that cannot be labeled in the viewport has a return-to-selection action.

The selected entity has a ring and a persistent named label, including when context labels are disabled. Its direct relationships are the default rendered edges during selection. Direction arrows, relationship chips/counts, typed canvas edge labels, and grouped inspector connections explain the visible associations. Clicking a canvas edge label expands its source evidence, including records beyond the inspector's initial collapsed list. Every connection remains grounded in the existing immutable source/JSON pointer.

Camera/controls persist across data visibility, labels, relationship filters and selection changes. Layout is calculated once from the complete loaded graph, not recalculated from a filtered subset. Changing a lens or class filter does not implicitly fit the camera. Explicit focus/fit actions may change the view. Switching away from 3D to the table unmounts the map; camera history is local to the mounted map and is not stored in deep links.

## Validation

- Thirteen navigation tests cover actual neighborhood fitting at desktop/mobile aspect ratios and two viewing angles, empty/single-entity fitting, label priority, collision exclusion, reserved regions, and deterministic placement. All 17 sample-neighborhood endpoints fit inside the tested view bounds.
- Twelve existing ingestion/model tests and 15 updater lifecycle tests remain: 40 automated tests total.
- Fifteen navigation browser checks cover default pan, pan/orbit controls, zoom-revealed individual labels, selection/neighbor labeling, persistent canvas/camera, filter stability, fitted neighborhoods, canvas edge evidence, back/fit recovery, focused keyboard panning, reduced motion, mobile layout and uncaught errors.
- Existing graph and update-status suites add 25 browser checks. See [navigation results](navigation-browser-results.json), [graph results](browser-results.json), and [status results](update-browser-results.json).
- [Zoomed desktop](screenshots/navigation-zoom-desktop.png), [focused desktop](screenshots/navigation-connections-desktop.png), [focused mobile](screenshots/navigation-connections-mobile.png).

Browser screenshots use software WebGL with a simulated mobile viewport; they do not prove physical-device touch/pinch behavior or full accessibility conformance. Label budget and visual density still need user feedback. There is no claim of a 10k-node benchmark. The data counts and source revisions remain unchanged: 1,676 entities, 3,696 verified relationships, 558 published KSI mappings. Publication-reference and ISO-crosswalk imports are still separate future work, with the preliminary inventory preserved in the research report.

## GitHub Actions runtime correction

The Node.js 20 annotation described the actions' embedded JavaScript runtimes, not the app's Node version. Both workflows now pin verified Node 24 action commits: checkout v5, setup-node v5, configure-pages v6, deploy-pages v5, direct artifact uploader v6, and Pages artifact uploader v5 (which uses a Node 24 uploader internally). The app continues to build with Node 24.

The [Node 24 upgrade deployment](https://github.com/gillooleyj/FedRAMP-Policy-Atlas/actions/runs/40986494319) completed successfully. Its public annotations no longer contained the Node.js 20 deprecation warning. Existing Pages/environment protection rules were left intact.

## Label and view polish

The overview now has an explicit group-label tier; zooming enters and leaves individual detail at separate distance ratios to prevent threshold chatter. A selected neighborhood is an explicit exception so its endpoints stay readable. Label eligibility is tracked independently from collision visibility, valid anchor choices are retained, and stationary camera layouts are cached. Hover never triggers global placement changes.

Mouse interactions clear the canvas focus outline; keyboard Tab/navigation retains an accessible blue focus indicator. FedRAMP rule/source nodes are blue and NIST control/source nodes amber throughout map labels, point colors, the legend, search, table, and inspector. Fit all keeps the current angle; Reset view restores the canonical front-facing camera and Pan mode while retaining current selection and data filters.

See [the focused polish checks](map-polish-browser-results.json), [overview screenshot](screenshots/map-polish-overview.png), and [mobile screenshot](screenshots/map-polish-mobile.png). Physical-device interaction and broad accessibility conformance remain outside these browser checks.
