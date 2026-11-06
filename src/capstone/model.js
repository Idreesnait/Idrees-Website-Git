export const DICTIONARY = "ARUCO_MIP_36h12";
export const MAX_SECONDS = 120;
export const MAX_FRAMES = 3601;
export const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
export const normalizeAngle = (angle) =>
  ((((angle + 180) % 360) + 360) % 360) - 180;
export function markerGeometry(marker) {
  const corners = marker.corners;
  return {
    x: corners.reduce((s, p) => s + p.x, 0) / 4,
    y: corners.reduce((s, p) => s + p.y, 0) / 4,
    angle:
      (-Math.atan2(corners[1].y - corners[0].y, corners[1].x - corners[0].x) *
        180) /
      Math.PI,
    side:
      corners.reduce((s, p, i) => s + distance(p, corners[(i + 1) % 4]), 0) / 4,
  };
}
export function scaleFromLine(a, b, centimeters) {
  if (!Number.isFinite(centimeters) || centimeters <= 0)
    throw new Error("Enter a positive reference length.");
  const pixels = distance(a, b);
  if (pixels < 10)
    throw new Error("Choose reference points at least 10 pixels apart.");
  return centimeters / pixels;
}

// Pixel coordinates retain the image convention (top left; y down).
// Calibrated coordinates use the bottom left; displacement uses the first detection.
// Missing frames stay missing: never interpolate or join paths over occlusion.
export function seriesFor(frames, id, cmPerPixel = null, height = 0) {
  let origin,
    previous,
    previousAngle,
    rotationFromStart = 0,
    path = 0;
  const distanceScale = cmPerPixel || 1;
  return frames.map((frame, frameIndex) => {
    const found = frame.markers.filter((m) => m.id === id);
    const row = {
      frame: frameIndex,
      time: frame.t,
      id,
      detected: found.length === 1,
      ambiguous: found.length > 1,
    };
    if (!row.detected) {
      previous = null;
      return row;
    }
    const geometry = markerGeometry(found[0]);
    if (!origin) {
      origin = geometry;
      previousAngle = geometry.angle;
    }
    rotationFromStart += normalizeAngle(geometry.angle - previousAngle);
    previousAngle = geometry.angle;
    if (previous) path += distance(previous, geometry) * distanceScale;
    previous = geometry;
    return {
      ...row,
      xPx: geometry.x,
      yPx: geometry.y,
      x: geometry.x * distanceScale,
      y: (height - geometry.y) * distanceScale,
      dx: (geometry.x - origin.x) * distanceScale,
      dy: (origin.y - geometry.y) * distanceScale,
      displacement: distance(origin, geometry) * distanceScale,
      path,
      angle: geometry.angle,
      rotation: rotationFromStart,
      hamming: found[0].hammingDistance ?? 0,
    };
  });
}
export function summarize(series) {
  const detected = series.filter((r) => r.detected);
  const last = detected.at(-1);
  return {
    total: series.length,
    detected: detected.length,
    coverage: series.length ? (detected.length / series.length) * 100 : 0,
    last,
    current: series.at(-1),
    endpoints: !!series[0]?.detected && !!series.at(-1)?.detected,
    duration: series.length > 1 ? series.at(-1).time - series[0].time : 0,
    maxDrift: detected.length
      ? Math.max(...detected.map((r) => r.displacement))
      : 0,
  };
}
export function makeTrial({
  frames,
  id,
  scale,
  height,
  actual,
  tolerance,
  minCoverage,
  source,
  complete,
  notes = "",
  label = "",
}) {
  if (!(scale > 0))
    throw new Error("Calibrate in centimeters before saving a trial.");
  if (!(actual > 0) || !Number.isFinite(actual))
    throw new Error("Actual distance must be greater than zero.");
  if (!(tolerance >= 0) || !Number.isFinite(tolerance))
    throw new Error("Enter a valid error limit.");
  if (!(minCoverage > 0 && minCoverage <= 100))
    throw new Error("Coverage must be between 1 and 100%.");
  const summary = summarize(seriesFor(frames, id, scale, height));
  if (summary.detected < 2)
    throw new Error("Record at least two detections of this marker.");
  const measured = summary.last.displacement;
  const error = measured - actual;
  const valid = complete && summary.endpoints && summary.total >= 10;
  const uid =
    globalThis.crypto?.randomUUID?.() ||
    `trial-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    uid,
    date: new Date().toISOString(),
    label: label.trim() || `Trial ${new Date().toLocaleTimeString()}`,
    source,
    demo: source === "demo",
    markerId: id,
    actualCm: actual,
    measuredCm: measured,
    signedErrorCm: error,
    absoluteErrorCm: Math.abs(error),
    errorPercent: (Math.abs(error) / actual) * 100,
    coverage: summary.coverage,
    samples: summary.total,
    duration: summary.duration,
    cmPerPixel: scale,
    toleranceCm: tolerance,
    minimumCoverage: minCoverage,
    valid,
    result: !valid
      ? "INCOMPLETE"
      : Math.abs(error) <= tolerance && summary.coverage >= minCoverage
        ? "PASS"
        : "RETRY",
    notes,
  };
}
export function trialStats(trials) {
  const real = trials.filter((t) => !t.demo && t.valid);
  if (!real.length) return null;
  const errors = real.map((t) => t.signedErrorCm);
  return {
    count: real.length,
    mae: errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length,
    rmse: Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length),
    passed: real.filter((t) => t.result === "PASS").length,
  };
}
export function toCSV(headers, rows) {
  const cell = (value) => {
    if (value === null || value === undefined) return "";
    let s =
      typeof value === "number"
        ? Number.isFinite(value)
          ? String(Math.round(value * 1e6) / 1e6)
          : ""
        : String(value);
    // Protect text fields when the exported file is opened in a spreadsheet.
    if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  };
  return [headers, ...rows].map((row) => row.map(cell).join(",")).join("\r\n");
}
export function sessionCSV(session) {
  const ids = [
    ...new Set([
      session.target,
      ...session.frames.flatMap((f) => f.markers.map((m) => m.id)),
    ]),
  ].sort((a, b) => a - b);
  const rows = ids
    .flatMap((id) =>
      seriesFor(session.frames, id, session.scale, session.height).map((r) => [
        session.source,
        session.source === "demo",
        DICTIONARY,
        r.frame,
        r.time,
        r.id,
        r.detected,
        r.ambiguous,
        r.xPx,
        r.yPx,
        session.scale ? r.x : null,
        session.scale ? r.y : null,
        r.dx,
        r.dy,
        r.displacement,
        r.path,
        session.scale ? "cm" : "px",
        r.angle,
        r.rotation,
        session.scale,
        session.width,
        session.height,
        session.fps,
        session.complete,
        r.hamming,
        session.calibration?.method,
        session.calibration?.referenceCm,
        session.filename,
      ]),
    )
    .sort((a, b) => a[3] - b[3] || a[5] - b[5]);
  return toCSV(
    [
      "source",
      "synthetic_demo",
      "dictionary",
      "sample",
      "time_s",
      "marker_id",
      "detected",
      "ambiguous_id",
      "x_px",
      "y_px_down",
      "x_cm",
      "y_cm_up",
      "dx",
      "dy_up",
      "displacement",
      "observed_path_length",
      "distance_unit",
      "angle_ccw_deg",
      "rotation_from_start_deg",
      "cm_per_px",
      "analysis_width",
      "analysis_height",
      "requested_sample_hz",
      "complete",
      "bit_errors",
      "calibration_method",
      "reference_cm",
      "source_filename",
    ],
    rows,
  );
}
export function trialsCSV(trials) {
  const keys = [
    "label",
    "date",
    "source",
    "demo",
    "markerId",
    "actualCm",
    "measuredCm",
    "signedErrorCm",
    "absoluteErrorCm",
    "errorPercent",
    "coverage",
    "samples",
    "duration",
    "cmPerPixel",
    "toleranceCm",
    "minimumCoverage",
    "valid",
    "result",
    "notes",
  ];
  return toCSV(
    keys,
    trials.map((t) => keys.map((k) => t[k])),
  );
}
export function graphSVG(
  series,
  mode = "displacement",
  unit = "cm",
  title = "Motion tracking",
) {
  const escapeText = (s) =>
    String(s).replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&apos;",
        })[c],
    );
  const metrics =
    mode === "position"
      ? ["dx", "dy"]
      : mode === "rotation"
        ? ["rotation"]
        : ["displacement"];
  const values = series
    .filter((r) => r.detected)
    .flatMap((r) => metrics.map((k) => r[k]));
  let low = Math.min(0, ...values),
    high = Math.max(1, ...values);
  const padding = (high - low) * 0.12;
  low -= padding;
  high += padding;
  const startTime = series[0]?.time || 0,
    durationSeconds = Math.max(0.1, (series.at(-1)?.time || 0) - startTime);
  const x = (t) => 64 + ((t - startTime) / durationSeconds) * 656;
  const y = (v) => 228 - ((v - low) / (high - low)) * 174;
  const colors = ["#245b91", "#a64c20"];
  let svgContent = `<rect width="760" height="288" rx="0" fill="#ffffff"/><text x="22" y="26" fill="#333333" font-size="13">${escapeText(title)} · ${mode === "rotation" ? "degrees CCW" : escapeText(unit)}</text>`;
  for (let i = 0; i < 5; i++) {
    const v = low + ((high - low) * i) / 4,
      py = y(v);
    svgContent += `<path d="M64 ${py}H720" stroke="#dddddd"/><text x="54" y="${py + 4}" fill="#666666" text-anchor="end" font-size="11">${v.toFixed(1)}</text>`;
    const time = (durationSeconds * i) / 4;
    svgContent += `<text x="${x(startTime + time)}" y="253" fill="#666666" text-anchor="middle" font-size="11">${time.toFixed(1)}</text>`;
  }
  metrics.forEach((k, i) => {
    let d = "",
      connected = false;
    for (const r of series) {
      if (!r.detected) {
        connected = false;
        continue;
      }
      d += `${connected ? "L" : "M"}${x(r.time).toFixed(2)},${y(r[k]).toFixed(2)} `;
      connected = true;
    }
    svgContent += `<path d="${d}" fill="none" stroke="${colors[i]}" stroke-width="2.5"/>`;
    svgContent += `<text x="${540 + i * 95}" y="26" fill="${colors[i]}" font-size="12">${escapeText(k === "dx" ? "ΔX →" : k === "dy" ? "ΔY ↑" : k)}</text>`;
  });
  svgContent +=
    '<text x="390" y="277" text-anchor="middle" fill="#666666" font-size="11">Time from first sample (seconds)</text>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 288" width="760" height="288" role="img" aria-label="${escapeText(title)}" font-family="system-ui, sans-serif">${svgContent}</svg>`;
}
