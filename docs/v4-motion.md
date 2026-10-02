# MAP v4 motion contracts

Inspected 2 October 2026. This records source behavior; final browser acceptance is a separate check.

## Earth → Muscat

- `GeographyJourney.tsx`: `JOURNEY_DURATION = 16` seconds. Entering chapter 2 starts a fresh approach; pause preserves elapsed time; reduced motion settles at the final view.
- Geography resources prepare before the camera moves beyond 2.2 seconds. Loading has a 15-second bound and a useful image fallback.
- `ExperienceScene.tsx`: `smootherstep(journey, 0, .45) * .31` drives the globe approach, replacing the previous immediate `.23` camera pose. The full approach spans about 7.2 seconds of the 16-second journey, with the globe-to-terrain overlap controlled by `RealisticEarth.tsx` and geography opacity.
- Globe alpha blends over progress `.215–.305`; zoom over `.075–.235`; descent over `.205–.305`. Globe and terrain share the chapter time rather than running unrelated camera transitions.
- The active chapter remains index 1 after the requested masterplan / rides reorder.

## Wheel construction

`WheelConstruction.tsx` returns its own `figure.scene.scene-rides`. Mount it directly for the rides chapter; do not wrap it in the old media figure.

Props: `{ active: boolean, paused: boolean, reduced: boolean }`.

Required runtime assets:

- `models/muscat-wheel-v4.glb`
- `media/v4/wheel-mountains.webp` — park and dry Muscat mountain plate; no sea and no baked-in wheel.
- `media/v4/wheel-poster.webp` — transparent or suitably framed completed wheel.

Required GLB animation names:

- `Wheel_Construction`: plays once, clamps at completion.
- `Wheel_Rotation`: begins after construction and repeats smoothly.

The timeline captions are an illustrative presentation sequence, not an engineered erection method: foundations 0 s, support 2 s, rim 5 s, spokes 8 s, cabins 10.5 s, operation after the construction clip ends (nominal 15 s).

The component samples the final construction pose to fit the complete 90 m wheel before resetting to its start. It retains playback position across chapter visibility changes. Animation advances only when the chapter is active, in view, visible, unpaused and not in static mode. Rendering uses a demand frame loop and only requests new frames while moving. Context loss or missing animation clips falls back to the poster. Reduced motion and `?graphics=off` use static mode.

Before release verify the exported animation names, duration and frame endpoint; construction and rotation must not write conflicting channels on the same node. The supplied 50 m source name does not override the explicitly retained 90 m concept requirement.

## Integration and acceptance

At this inspection, the new wheel component exists but must still be integrated in `Experience.tsx`; order must become Vision → Place → Masterplan → Landmark. Final build/export checks must include v4 assets. Root is completing this integration.

Browser acceptance should cover forward/back navigation, pause/resume during construction and geography approach, background-tab pause, reduced motion, `graphics=off`, WebGL failure, narrow viewport, and the final construction-to-rotation handoff. A source review is not a claim of completed browser or physical 80-inch display validation.


Final integration: chapters3/4 swapped; wheel component integrated; all3masterplan images preload and decode before automatic sequencing. Parkviewer uses a bounded±5° orbit after construction and a focusextent excluding distant externalroadstubs. Browser checks and limits: [v4 validation](v4-validation.md).
