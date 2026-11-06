import { AR } from "./vendor/aruco.js";
import { DICTIONARY, markerGeometry, distance } from "./model.js";
export const dictionary = new AR.Dictionary(DICTIONARY);
// Thresholding can produce nested contours for one physical marker. Merge only
// nearly coincident detections of the same ID and size. Separate copies remain
// separate so the model can flag the ID as ambiguous instead of guessing.
export function dedupeDetections(markers) {
  const unique = [];
  for (const marker of [...markers].sort(
    (a, b) => (a.hammingDistance || 0) - (b.hammingDistance || 0),
  )) {
    const g = markerGeometry(marker);
    if (
      !unique.some((other) => {
        if (other.id !== marker.id) return false;
        const h = markerGeometry(other),
          small = Math.min(g.side, h.side),
          large = Math.max(g.side, h.side);
        return small / large > 0.8 && distance(g, h) < small * 0.12;
      })
    )
      unique.push(marker);
  }
  return unique;
}
export function makeDetector() {
  const detector = new AR.Detector({ dictionaryName: DICTIONARY, maxHammingDistance: 3 });
  const detect = detector.detect.bind(detector);
  detector.detect = (frame) => dedupeDetections(detect(frame));
  return detector;
}

export function markerSVG(id, millimeters = 50) {
  if (!Number.isInteger(id) || id < 0 || id >= dictionary.codeList.length)
    throw new Error("Choose a marker ID from 0 to 249.");
  if (!Number.isFinite(millimeters) || millimeters < 10 || millimeters > 150)
    throw new Error("Choose a black-square size from 10 to 150 mm.");
  // Upstream SVG has an 8-cell black square within a 10-cell page (one-cell quiet zone).
  // Physical page size must include that quiet zone; black square is exactly the requested size.
  return dictionary
    .generateSVG(id)
    .replace(
      "<svg ",
      `<svg width="${millimeters * 1.25}mm" height="${millimeters * 1.25}mm" shape-rendering="crispEdges" `,
    );
}

export function drawMarker(ctx, id, cx, cy, size, angle = 0) {
  const code = dictionary.codeList[id];
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate((angle * Math.PI) / 180);
  const cell = size / 8;
  ctx.fillStyle = "#fff";
  ctx.fillRect(-size / 2 - cell, -size / 2 - cell, size + 2 * cell, size + 2 * cell);
  ctx.fillStyle = "#000";
  ctx.fillRect(-size / 2, -size / 2, size, size);
  ctx.fillStyle = "#fff";
  for (let y = 0; y < 6; y++)
    for (let x = 0; x < 6; x++)
      if (code[y * 6 + x] === "1")
        ctx.fillRect(-size / 2 + (x + 1) * cell, -size / 2 + (y + 1) * cell, cell, cell);
  ctx.restore();
}

export function drawDemo(ctx, t, id = 0) {
  ctx.fillStyle = "#e7e5df";
  ctx.fillRect(0, 0, 640, 360);
  ctx.strokeStyle = "#d3d0c8";
  ctx.lineWidth = 1;
  for (let x = 0; x < 640; x += 24) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 0; y < 360; y += 24) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(640, y);
    ctx.stroke();
  }
  ctx.fillStyle = "#514f49";
  ctx.font = "13px sans-serif";
  ctx.fillText("SYNTHETIC TEST • 20 cm travel • 12 px/cm", 24, 32);
  ctx.strokeStyle = "#6a685e";
  ctx.beginPath();
  ctx.moveTo(160, 290);
  ctx.lineTo(400, 290);
  ctx.stroke();
  for (let i = 0; i <= 20; i++) {
    const x = 160 + i * 12;
    ctx.beginPath();
    ctx.moveTo(x, 282);
    ctx.lineTo(x, 298);
    ctx.stroke();
  }
  drawMarker(ctx, id, 160 + Math.min(t / 6, 1) * 240, 172, 60, -Math.min(t / 6, 1) * 60);
}
