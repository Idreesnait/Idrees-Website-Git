export const DICTIONARY = 'ARUCO_MIP_36h12';
export const MAX_SECONDS = 120;
export const MAX_FRAMES = 3601;
export const distance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);
export const normalizeAngle = angle => ((angle + 180) % 360 + 360) % 360 - 180;

export function markerGeometry(marker) {
  const c = marker.corners;
  return {
    x: c.reduce((s, p) => s + p.x, 0) / 4,
    y: c.reduce((s, p) => s + p.y, 0) / 4,
    angle: -Math.atan2(c[1].y - c[0].y, c[1].x - c[0].x) * 180 / Math.PI,
    side: c.reduce((s, p, i) => s + distance(p, c[(i + 1) % 4]), 0) / 4,
  };
}

export function scaleFromLine(a, b, centimeters) {
  if (!Number.isFinite(centimeters) || centimeters <= 0) throw new Error('Enter a positive reference length.');
  const pixels = distance(a, b);
  if (pixels < 10) throw new Error('Choose reference points at least 10 pixels apart.');
  return centimeters / pixels;
}

// Pixel coordinates retain the image convention (top left; y down).
// Calibrated coordinates use the bottom left; displacement uses the first detection.
// Missing frames stay missing: never interpolate or join paths over occlusion.
export function seriesFor(frames, id, cmPerPixel = null, height = 0) {
  let origin, previous, previousAngle, unwrapped = 0, path = 0;
  const factor = cmPerPixel || 1;
  return frames.map((frame, frameIndex) => {
    const found = frame.markers.filter(m => m.id === id);
    const row = { frame: frameIndex, time: frame.t, id, detected: found.length === 1, ambiguous: found.length > 1 };
    if (!row.detected) { previous = null; return row; }
    const g = markerGeometry(found[0]);
    if (!origin) { origin = g; previousAngle = g.angle; }
    unwrapped += normalizeAngle(g.angle - previousAngle);
    previousAngle = g.angle;
    if (previous) path += distance(previous, g) * factor;
    previous = g;
    return { ...row, xPx: g.x, yPx: g.y, x: g.x * factor, y: (height - g.y) * factor,
      dx: (g.x - origin.x) * factor, dy: (origin.y - g.y) * factor,
      displacement: distance(origin, g) * factor, path, angle: g.angle, rotation: unwrapped,
      hamming: found[0].hammingDistance ?? 0 };
  });
}

export function summarize(series) {
  const detected = series.filter(r => r.detected);
  const last = detected.at(-1);
  return { total: series.length, detected: detected.length,
    coverage: series.length ? detected.length / series.length * 100 : 0,
    last, current: series.at(-1), endpoints: !!series[0]?.detected && !!series.at(-1)?.detected,
    duration: series.length > 1 ? series.at(-1).time - series[0].time : 0,
    maxDrift: detected.length ? Math.max(...detected.map(r => r.displacement)) : 0 };
}

export function makeTrial({ frames, id, scale, height, actual, tolerance, minCoverage, source, complete, notes = '', label = '' }) {
  if (!(scale > 0)) throw new Error('Calibrate in centimeters before saving a trial.');
  if (!(actual > 0) || !Number.isFinite(actual)) throw new Error('Actual distance must be greater than zero.');
  if (!(tolerance >= 0) || !Number.isFinite(tolerance)) throw new Error('Enter a valid error limit.');
  if (!(minCoverage > 0 && minCoverage <= 100)) throw new Error('Coverage must be between 1 and 100%.');
  const summary = summarize(seriesFor(frames, id, scale, height));
  if (summary.detected < 2) throw new Error('Record at least two detections of this marker.');
  const measured = summary.last.displacement;
  const error = measured - actual;
  const valid = complete && summary.endpoints && summary.total >= 10;
  const uid = globalThis.crypto?.randomUUID?.() || `trial-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return { uid, date: new Date().toISOString(), label: label.trim() || `Trial ${new Date().toLocaleTimeString()}`,
    source, demo: source === 'demo', markerId: id, actualCm: actual, measuredCm: measured,
    signedErrorCm: error, absoluteErrorCm: Math.abs(error), errorPercent: Math.abs(error) / actual * 100,
    coverage: summary.coverage, samples: summary.total, duration: summary.duration, cmPerPixel: scale,
    toleranceCm: tolerance, minimumCoverage: minCoverage, valid,
    result: !valid ? 'INCOMPLETE' : Math.abs(error) <= tolerance && summary.coverage >= minCoverage ? 'PASS' : 'RETRY',
    notes };
}

export function trialStats(trials) {
  const real = trials.filter(t => !t.demo && t.valid);
  if (!real.length) return null;
  const errors = real.map(t => t.signedErrorCm);
  return { count: real.length, mae: errors.reduce((s, e) => s + Math.abs(e), 0) / errors.length,
    rmse: Math.sqrt(errors.reduce((s, e) => s + e * e, 0) / errors.length),
    passed: real.filter(t => t.result === 'PASS').length };
}

export function toCSV(headers, rows) {
  const cell = value => {
    if (value === null || value === undefined) return '';
    let s = typeof value === 'number' ? (Number.isFinite(value) ? String(Math.round(value * 1e6) / 1e6) : '') : String(value);
    // Protect text fields when the exported file is opened in a spreadsheet.
    if (typeof value === 'string' && /^[=+\-@\t\r]/.test(s)) s = "'" + s;
    return /[",\r\n]/.test(s) ? '"' + s.replaceAll('"', '""') + '"' : s;
  };
  return [headers, ...rows].map(row => row.map(cell).join(',')).join('\r\n');
}

export function sessionCSV(session) {
  const ids = [...new Set([session.target, ...session.frames.flatMap(f => f.markers.map(m => m.id))])].sort((a, b) => a - b);
  const rows = ids.flatMap(id => seriesFor(session.frames, id, session.scale, session.height).map(r => [
    session.source, session.source === 'demo', DICTIONARY, r.frame, r.time, r.id, r.detected, r.ambiguous,
    r.xPx, r.yPx, session.scale ? r.x : null, session.scale ? r.y : null,
    r.dx, r.dy, r.displacement, r.path, session.scale ? 'cm' : 'px', r.angle, r.rotation,
    session.scale, session.width, session.height, session.fps, session.complete, r.hamming,
    session.calibration?.method, session.calibration?.referenceCm, session.filename,
  ])).sort((a, b) => a[3] - b[3] || a[5] - b[5]);
  return toCSV(['source', 'synthetic_demo', 'dictionary', 'sample', 'time_s', 'marker_id', 'detected', 'ambiguous_id',
    'x_px', 'y_px_down', 'x_cm', 'y_cm_up', 'dx', 'dy_up', 'displacement', 'observed_path_length', 'distance_unit',
    'angle_ccw_deg', 'rotation_from_start_deg', 'cm_per_px', 'analysis_width', 'analysis_height', 'requested_sample_hz', 'complete', 'bit_errors', 'calibration_method', 'reference_cm', 'source_filename'], rows);
}

export function trialsCSV(trials) {
  const keys = ['label', 'date', 'source', 'demo', 'markerId', 'actualCm', 'measuredCm', 'signedErrorCm',
    'absoluteErrorCm', 'errorPercent', 'coverage', 'samples', 'duration', 'cmPerPixel', 'toleranceCm', 'minimumCoverage', 'valid', 'result', 'notes'];
  return toCSV(keys, trials.map(t => keys.map(k => t[k])));
}

export function graphSVG(series, mode = 'displacement', unit = 'cm', title = 'Motion tracking') {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
  const keys = mode === 'position' ? ['dx', 'dy'] : mode === 'rotation' ? ['rotation'] : ['displacement'];
  const values = series.filter(r => r.detected).flatMap(r => keys.map(k => r[k]));
  let lo = Math.min(0, ...values), hi = Math.max(1, ...values);
  const pad = (hi - lo) * .12; lo -= pad; hi += pad;
  const first = series[0]?.time || 0, duration = Math.max(.1, (series.at(-1)?.time || 0) - first);
  const x = t => 64 + (t - first) / duration * 656;
  const y = v => 228 - (v - lo) / (hi - lo) * 174;
  const colors = ['#ff9b54', '#71ded1'];
  let body = `<rect width="760" height="288" rx="16" fill="#101923"/><text x="22" y="26" fill="#d8e3ee" font-size="13">${esc(title)} · ${mode === 'rotation' ? 'degrees CCW' : esc(unit)}</text>`;
  for (let i = 0; i < 5; i++) {
    const v = lo + (hi - lo) * i / 4, py = y(v);
    body += `<path d="M64 ${py}H720" stroke="#283541"/><text x="54" y="${py + 4}" fill="#93a5b5" text-anchor="end" font-size="11">${v.toFixed(1)}</text>`;
    const time = duration * i / 4;
    body += `<text x="${x(first + time)}" y="253" fill="#93a5b5" text-anchor="middle" font-size="11">${time.toFixed(1)}</text>`;
  }
  keys.forEach((k, i) => {
    let d = '', connected = false;
    for (const r of series) {
      if (!r.detected) { connected = false; continue; }
      d += `${connected ? 'L' : 'M'}${x(r.time).toFixed(2)},${y(r[k]).toFixed(2)} `; connected = true;
    }
    body += `<path d="${d}" fill="none" stroke="${colors[i]}" stroke-width="2.5"/>`;
    body += `<text x="${540 + i * 95}" y="26" fill="${colors[i]}" font-size="12">${esc(k === 'dx' ? 'ΔX →' : k === 'dy' ? 'ΔY ↑' : k)}</text>`;
  });
  if (!values.length) body += '<text x="390" y="144" text-anchor="middle" fill="#93a5b5" font-size="14">Your recorded motion will appear here</text>';
  body += '<text x="390" y="277" text-anchor="middle" fill="#93a5b5" font-size="11">Time from first sample (seconds)</text>';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 288" width="760" height="288" role="img" aria-label="${esc(title)}" font-family="system-ui, sans-serif">${body}</svg>`;
}
