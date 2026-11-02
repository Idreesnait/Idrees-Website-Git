# CAPSTONE motion tracking

Projects → **CAPSTONE** → **Motion Tracking Software**

- Hub: `/capstone`
- Tool: `/capstone/motion-tracking`
- React pages load separately from the portfolio and existing games.
- Tracking runs locally in the browser with the vendored MIT-licensed js-aruco2 detector and its ARUCO_MIP_36h12 dictionary (250 IDs). There is no external video-processing service.

## Workflow

1. Print unique markers from **Markers** at actual size. Measure the black square; the white margin is excluded.
2. Keep the camera fixed, facing a flat movement plane with a ruler in the same plane.
3. Load a short video or start the camera. Calibrate against two ruler points or a measured marker edge.
4. Analyze the clip or record a live trial. Compare endpoint displacement against a separately measured distance in **Trials**.
5. Repeat the physical experiment and export raw data, the graph, annotated footage, and the trial table.

Uploads accept clips the browser can decode, up to two minutes and 500 MB. H.264 MP4 is the recommended fallback for incompatible iPhone MOV/HEVC clips. Camera access requires HTTPS and permission. Annotated video export depends on MediaRecorder support and runs in real time; it is silent WebM or MP4. Some browsers ask permission for multiple downloads.

## Measurement conventions

Pixel coordinates use a top-left origin, Y downward. Calibrated coordinates use a bottom-left origin, Y upward. Displacement is straight-line travel from the first detected point; rotation is in-plane and counterclockwise-positive. Missing or ambiguous marker IDs remain missing samples. Observed path length does not bridge gaps. Sampling resolution is capped at 960 × 720.

Video analysis seeks fixed timestamps. Live camera samples use actual elapsed timestamps. A single scale does not correct depth changes, lens distortion, or perspective. This is a 2D engineering feasibility tool, not clinical gait analysis or prosthetic safety validation.

Trials stay in browser local storage (latest 200). Export CSV for a durable copy. Demo and incomplete trials are excluded from aggregate results. Uploaded synthetic fixtures must be labelled as synthetic by the tester; the app cannot infer whether an uploaded video depicts a physical experiment.

## Verification

```sh
npm run test:capstone
npm run test:jeopardy
npm run build
```

Automated coverage includes all 250 marker IDs through the real detector, rotation, bit damage, duplicate-ID ambiguity, calibration, missing samples, trial scoring, CSV metadata and escaping, and graph gaps.

Browser checks covered Projects → CAPSTONE navigation, the built-in demo, uploaded H.264 video, ruler calibration, trial saving, raw CSV download, and annotated WebM export. A synthetic MP4 with a 400-pixel movement yielded 42/42 detected samples and a 20.20 cm result after a manually selected 20 cm reference (0.20 cm error).

Physical camera accuracy, real iPhone codec compatibility, and printer scaling still require tests on the intended hardware. Synthetic tests verify the software workflow; they do not establish physical feasibility.
