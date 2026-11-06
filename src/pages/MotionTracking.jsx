import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Camera,
  Upload,
  Play,
  Square,
  Download,
  Printer,
  Ruler,
  Check,
  Crosshair,
  FlaskConical,
  ChevronRight,
  X,
  CircleHelp,
  Video,
  FileSpreadsheet,
  Image,
  Activity,
} from "lucide-react";
import { Tracker, download } from "../capstone/engine.js";
import { markerSVG } from "../capstone/markers.js";
import {
  DICTIONARY,
  markerGeometry,
  scaleFromLine,
  summarize,
  makeTrial,
  trialStats,
  sessionCSV,
  trialsCSV,
  graphSVG,
} from "../capstone/model.js";
import "../capstone/motion.css";

const TRIAL_STORAGE_KEY = "idrees-capstone-motion-trials-v1";
const emptyCapture = {
  source: "none",
  mode: "empty",
  count: 0,
  currentMarkers: [],
  width: 960,
  height: 540,
};
const workspaceTabs = [
  { id: "track", label: "Track" },
  { id: "markers", label: "Markers" },
  { id: "trials", label: "Trials" },
  { id: "guide", label: "Guide" },
];

const formatNumber = (value, decimals = 2) =>
  Number.isFinite(value) ? value.toFixed(decimals) : "—";

function loadSavedTrials() {
  try {
    const savedTrials = JSON.parse(
      localStorage.getItem(TRIAL_STORAGE_KEY) || "[]",
    );
    if (!Array.isArray(savedTrials)) return [];
    return savedTrials
      .filter(
        (trial) =>
          trial &&
          typeof trial.uid === "string" &&
          Number.isFinite(trial.measuredCm),
      )
      .slice(-200);
  } catch {
    return [];
  }
}

export default function MotionTracking() {
  const [tab, setTab] = useState("track");
  const [capture, setCapture] = useState(emptyCapture);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [markerId, setMarkerId] = useState(0);
  const [sampleHz, setSampleHz] = useState(10);
  const [graphMode, setGraphMode] = useState("displacement");
  const [referenceCm, setReferenceCm] = useState(20);
  const [markerSizeMm, setMarkerSizeMm] = useState(50);
  const [pickPoints, setPickPoints] = useState(null);
  const [previewTime, setPreviewTime] = useState(0);

  const [generatorId, setGeneratorId] = useState(0);
  const [generatorCount, setGeneratorCount] = useState(3);
  const [generatorSize, setGeneratorSize] = useState(50);

  const [trials, setTrials] = useState(loadSavedTrials);
  const [actualCm, setActualCm] = useState(20);
  const [allowedErrorCm, setAllowedErrorCm] = useState(1);
  const [minimumDetection, setMinimumDetection] = useState(90);
  const [trialLabel, setTrialLabel] = useState("");
  const [notes, setNotes] = useState("");

  // The detector keeps its own frames. React just shows the latest snapshot.
  const trackerRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const uploadRef = useRef(null);

  useEffect(() => {
    const tracker = new Tracker(
      videoRef.current,
      canvasRef.current,
      setCapture,
      (e) => setError(e.message),
    );
    trackerRef.current = tracker;
    tracker.notify();
    const title = document.title;
    document.title = "Motion Tracking Software · CAPSTONE · Idrees Nait";
    return () => {
      tracker.destroy();
      document.title = title;
    };
  }, []);

  useEffect(() => {
    if (capture.source === "video" && !capture.busy)
      setPreviewTime(capture.previewTime || 0);
  }, [capture.source, capture.busy, capture.previewTime]);

  const runAction = async (action) => {
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(e.message || String(e));
    }
  };
  const tracker = trackerRef.current;
  const motionSamples = useMemo(
    () => trackerRef.current?.series() || [],
    [capture, markerId],
  );
  const captureSummary = summarize(motionSamples);
  const unit = capture.scale ? "cm" : "px";
  const latestSample = captureSummary.current?.detected
    ? captureSummary.current
    : null;
  const busy = capture.busy || capture.recording;
  const chart = graphSVG(
    motionSamples,
    graphMode,
    unit,
    `${capture.source === "demo" ? "SYNTHETIC DEMO · " : ""}ID ${markerId} · ${graphMode === "position" ? "Position relative to start" : graphMode}`,
  );
  const trialSummary = trialStats(trials);
  const markerSheet = useMemo(() => {
    try {
      const firstId = Number(generatorId);
      const markerCount = Number(generatorCount);
      const sizeMm = Number(generatorSize);
      if (
        !Number.isInteger(markerCount) ||
        markerCount < 1 ||
        markerCount > 12 ||
        firstId + markerCount > 250
      ) {
        return { error: "Use 1–12 markers with IDs between 0 and 249." };
      }
      return {
        markers: Array.from({ length: markerCount }, (_, offset) => ({
          id: firstId + offset,
          svg: markerSVG(firstId + offset, sizeMm),
        })),
      };
    } catch (e) {
      return {
        error: e.message,
      };
    }
  }, [generatorId, generatorCount, generatorSize]);

  function loadClip(event) {
    const clip = event.target.files?.[0];
    event.target.value = "";
    setPreviewTime(0);
    runAction(() => tracker.load(clip));
  }

  function previewFrame() {
    runAction(async () => {
      const seconds = Number(previewTime);
      await tracker.seek(seconds);
      tracker.capture(seconds);
      tracker.notify();
    });
  }

  function calibrateFromMarker() {
    const matches = tracker.currentMarkers.filter(
      (marker) => marker.id === Number(markerId),
    );
    if (matches.length !== 1) {
      throw new Error(
        "Show exactly one copy of your target marker clearly, then try again.",
      );
    }
    const sizeMm = Number(markerSizeMm);
    if (!(sizeMm >= 10 && sizeMm <= 150)) {
      throw new Error("Enter a marker size from 10 to 150 mm.");
    }
    const marker = markerGeometry(matches[0]);
    setCalibration(sizeMm / 10 / marker.side, {
      method: "marker-edge",
      referenceCm: sizeMm / 10,
      markerId: Number(markerId),
      pixels: marker.side,
    });
  }

  function setCalibration(scale, info) {
    tracker.scale = scale;
    tracker.calibration = info;
    tracker.paused = false;
    setPickPoints(null);
    tracker.paint(tracker.currentMarkers, tracker.frames.at(-1)?.t || 0);
    tracker.notify();
    setMessage(
      `Calibrated: ${formatNumber(1 / scale)} pixels = 1 cm. Keep the camera fixed and motion in the reference plane.`,
    );
  }

  function selectPoint(event) {
    if (!pickPoints) return;
    // Clicks use the displayed size; calibration needs the actual video pixels.
    const canvasBounds = canvasRef.current.getBoundingClientRect();
    const point = {
      x:
        ((event.clientX - canvasBounds.left) * canvasRef.current.width) /
        canvasBounds.width,
      y:
        ((event.clientY - canvasBounds.top) * canvasRef.current.height) /
        canvasBounds.height,
    };
    const points = [...pickPoints, point];
    setPickPoints(points);
    tracker.paint(tracker.currentMarkers, tracker.frames.at(-1)?.t || 0);
    const ctx = tracker.ctx;
    ctx.strokeStyle = "#71ded1";
    ctx.fillStyle = "#71ded1";
    ctx.lineWidth = 3;
    points.forEach((q) => {
      ctx.beginPath();
      ctx.arc(q.x, q.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
    if (points.length === 2)
      runAction(() => {
        try {
          setCalibration(
            scaleFromLine(points[0], points[1], Number(referenceCm)),
            {
              method: "two-point",
              referenceCm: Number(referenceCm),
              points,
            },
          );
        } catch (e) {
          setPickPoints([]);
          tracker.paint(tracker.currentMarkers);
          throw e;
        }
      });
  }

  function saveTrial() {
    const trial = makeTrial({
      ...tracker.snapshot(),
      id: Number(markerId),
      actual: Number(actualCm),
      tolerance: Number(allowedErrorCm),
      minCoverage: Number(minimumDetection),
      notes,
      label: trialLabel,
    });
    const nextTrials = [...trials, trial].slice(-200);
    setTrials(nextTrials);
    try {
      localStorage.setItem(TRIAL_STORAGE_KEY, JSON.stringify(nextTrials));
      setMessage(
        "Trial saved here. Download the CSV when you want to keep or share it.",
      );
    } catch {
      setError(
        "This browser could not save the trial permanently. Export the trial CSV before closing.",
      );
    }
    setTrialLabel("");
  }

  function changeMarkerId(value) {
    setMarkerId(value);
    if (
      value !== "" &&
      Number.isInteger(Number(value)) &&
      Number(value) >= 0 &&
      Number(value) < 250
    ) {
      tracker.target = Number(value);
      tracker.notify();
    }
  }
  const validMarkerId =
    markerId !== "" &&
    Number.isInteger(Number(markerId)) &&
    Number(markerId) >= 0 &&
    Number(markerId) < 250;
  const downloadFrame = () =>
    canvasRef.current.toBlob(
      (blob) =>
        blob &&
        download(
          blob,
          `motion-${capture.source === "demo" ? "DEMO-" : ""}annotated.png`,
        ),
    );
  return (
    <main className="mt-app">
      <nav className="mt-topbar">
        <Link to="/capstone">
          <ArrowLeft size={16} /> CAPSTONE
        </Link>
        <span>
          Idrees + Abram <span className="mt-divider">/</span> motion test
        </span>
      </nav>
      <div className="mt-wrap">
        <header className="mt-header">
          <div>
            <h1>Motion tracking</h1>
            <p>
              Track ArUco markers from a video or webcam, measure movement, and
              compare trials.
            </p>
            <div className="mt-local">Video stays on your device.</div>
          </div>
        </header>
        <div className="mt-tabbar" role="tablist" aria-label="Motion workspace">
          {workspaceTabs.map(({ id, label }) => (
            <button
              key={id}
              id={`tab-${id}`}
              role="tab"
              aria-selected={tab === id}
              aria-controls={`panel-${id}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
          <div className="mt-dictionary">
            {DICTIONARY} <span>250 IDs</span>
          </div>
        </div>
        {error && (
          <div className="mt-alert error" role="alert">
            {error}
            <button aria-label="Dismiss error" onClick={() => setError("")}>
              <X size={16} />
            </button>
          </div>
        )}
        {message && (
          <div className="mt-alert" role="status">
            <Check size={17} />
            {message}
            <button aria-label="Dismiss message" onClick={() => setMessage("")}>
              <X size={16} />
            </button>
          </div>
        )}

        <section
          hidden={tab !== "track"}
          id="panel-track"
          role="tabpanel"
          aria-labelledby="tab-track"
        >
          <div className="mt-sourcebar">
            <div className="mt-source-actions">
              <button
                className="mt-button primary"
                disabled={busy || pickPoints !== null}
                onClick={() => uploadRef.current.click()}
              >
                <Upload size={16} /> Upload video
              </button>
              <button
                className="mt-button"
                disabled={busy || pickPoints !== null}
                onClick={() => runAction(() => tracker.camera())}
              >
                <Camera size={16} /> Live camera
              </button>
              <button
                className="mt-button quiet"
                disabled={busy || !validMarkerId || pickPoints !== null}
                onClick={() => runAction(() => tracker.demo())}
              >
                <Play size={15} /> Try demo
              </button>
            </div>
            <span>MP4 / MOV · 2 minutes max</span>
            <input
              ref={uploadRef}
              type="file"
              accept="video/*,.mov,.mp4,.m4v"
              className="mt-sr-only"
              aria-label="Choose a recorded video"
              onChange={loadClip}
            />
          </div>
          <div className="mt-workspace">
            <div className="mt-main-column">
              <div className="mt-viewer">
                <div className="mt-panelhead">
                  <span>
                    <span
                      className={`mt-status-dot ${capture.mode === "live" || busy ? "active" : ""}`}
                    />
                    {capture.source === "demo"
                      ? "SYNTHETIC DEMO"
                      : capture.source === "video"
                        ? capture.filename
                        : capture.source === "camera"
                          ? "LIVE CAMERA"
                          : "CAMERA VIEW"}
                  </span>
                  <span>
                    {capture.source === "none"
                      ? "No video loaded"
                      : `${capture.width} × ${capture.height}`}
                  </span>
                </div>
                <div
                  className={`mt-canvas-wrap ${pickPoints ? "picking" : ""}`}
                >
                  <canvas
                    ref={canvasRef}
                    onClick={selectPoint}
                    aria-label="Video with detected ArUco marker outlines, IDs, pixel coordinates, and motion paths"
                  />
                  <video
                    ref={videoRef}
                    muted
                    playsInline
                    preload="auto"
                    className="mt-source-video"
                  />
                  {capture.source === "none" && (
                    <div className="mt-empty">
                      <h2>Add a video to start</h2>
                      <p>
                        Upload a clip or open your camera.
                        <br />
                        No footage yet? Try the demo.
                      </p>
                      <button
                        disabled={busy || !validMarkerId}
                        className="mt-text-link"
                        onClick={() => runAction(() => tracker.demo())}
                      >
                        See a marker in motion <ArrowUpRight size={16} />
                      </button>
                    </div>
                  )}
                  {pickPoints && (
                    <div className="mt-pick-hint">
                      Click{" "}
                      {pickPoints.length === 0 ? "the first" : "the second"} end
                      of your reference length
                    </div>
                  )}
                </div>
                <div className="mt-transport">
                  <div>
                    {capture.source === "video" && !busy && (
                      <button
                        className="mt-button primary small"
                        disabled={!validMarkerId || pickPoints !== null}
                        onClick={() => runAction(() => tracker.analyze())}
                      >
                        <Play size={14} />
                        {capture.count ? "Analyze again" : "Analyze clip"}
                      </button>
                    )}
                    {capture.mode === "live" && !capture.recording && (
                      <button
                        className="mt-button primary small"
                        disabled={!validMarkerId || pickPoints !== null}
                        onClick={() => tracker.recordCamera()}
                      >
                        <span className="mt-record-dot" /> Record trial
                      </button>
                    )}
                    {busy && (
                      <button
                        className="mt-button small"
                        onClick={() => tracker.stop()}
                      >
                        <Square size={13} />
                        {capture.recording ? "Finish trial" : "Stop"}
                      </button>
                    )}
                    {capture.mode === "live" && !capture.recording && (
                      <button
                        className="mt-button quiet small"
                        onClick={() => tracker.freezeCamera()}
                      >
                        Close camera
                      </button>
                    )}
                    <span className="mt-mono">
                      {formatNumber(capture.time || 0)} s
                    </span>
                    <span className="mt-mode-label">
                      {capture.mode === "exporting"
                        ? "Exporting in real time…"
                        : capture.mode === "analyzing"
                          ? `Analyzing ${formatNumber(capture.progress, 0)}%`
                          : capture.recording
                            ? "Recording…"
                            : capture.mode === "done" ||
                                capture.mode === "frozen"
                              ? "Capture finished"
                              : capture.mode === "stopped"
                                ? "Stopped · partial data"
                                : capture.mode === "loading"
                                  ? "Loading…"
                                  : "Ready"}
                    </span>
                  </div>
                  <span>{capture.count} samples</span>
                </div>
                {capture.busy && (
                  <progress
                    className="mt-progress"
                    max="100"
                    value={capture.progress || 0}
                    aria-label="Processing progress"
                  />
                )}
                {capture.source === "video" && !busy && (
                  <label className="mt-preview-slider">
                    Preview frame{" "}
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, capture.duration - 0.001)}
                      step="0.05"
                      value={previewTime}
                      disabled={pickPoints !== null}
                      onChange={(e) => {
                        const t = Number(e.target.value);
                        setPreviewTime(t);
                      }}
                      onPointerUp={previewFrame}
                      onKeyUp={previewFrame}
                    />
                    <span>{formatNumber(Number(previewTime), 1)} s</span>
                  </label>
                )}
              </div>
              <div className="mt-metrics">
                <Metric
                  label="Displacement"
                  value={formatNumber(latestSample?.displacement)}
                  unit={unit}
                />
                <Metric
                  label="Rotation from start"
                  value={formatNumber(latestSample?.rotation, 1)}
                  unit="°"
                />
                <Metric
                  label="Detection rate"
                  value={
                    capture.count
                      ? formatNumber(captureSummary.coverage, 0)
                      : "—"
                  }
                  unit="%"
                />
                <Metric label="Samples" value={capture.count || "—"} unit="" />
              </div>
              <div className="mt-chart-panel">
                <div className="mt-panelhead">
                  <span>
                    <Activity size={15} /> Movement over time
                  </span>
                  <div className="mt-chart-options">
                    <select
                      aria-label="Graph metric"
                      value={graphMode}
                      onChange={(e) => setGraphMode(e.target.value)}
                    >
                      <option value="displacement">Displacement</option>
                      <option value="position">Position (ΔX / ΔY)</option>
                      <option value="rotation">Rotation</option>
                    </select>
                    <button
                      disabled={!capture.count}
                      aria-label="Download graph as SVG"
                      title="Download graph as SVG"
                      onClick={() =>
                        download(
                          chart,
                          `motion-${capture.source === "demo" ? "DEMO-" : ""}${graphMode}.svg`,
                          "image/svg+xml",
                        )
                      }
                    >
                      <Download size={16} />
                    </button>
                  </div>
                </div>
                <div
                  className="mt-chart"
                  dangerouslySetInnerHTML={{
                    __html: chart,
                  }}
                />
                <p className="mt-chart-caption">
                  Relative to the first detection. Gaps mean the marker was not
                  detected. Y is positive upward.
                </p>
              </div>
            </div>
            <aside className="mt-sidebar">
              <div className="mt-card">
                <div className="mt-card-title">
                  <span className="mt-step">1</span>
                  <h2>Tracking setup</h2>
                </div>
                <div className="mt-field-row">
                  <label>
                    Target marker ID
                    <input
                      type="number"
                      min="0"
                      max="249"
                      step="1"
                      value={markerId}
                      disabled={busy}
                      onChange={(e) => changeMarkerId(e.target.value)}
                    />
                  </label>
                  <label>
                    Sample rate
                    <select
                      value={sampleHz}
                      disabled={busy}
                      onChange={(e) => {
                        setSampleHz(Number(e.target.value));
                        tracker.fps = Number(e.target.value);
                      }}
                    >
                      <option value="5">5 Hz</option>
                      <option value="10">10 Hz</option>
                      <option value="15">15 Hz</option>
                      <option value="30">30 Hz</option>
                    </select>
                  </label>
                </div>
                <p className="mt-small">
                  All visible IDs are tracked. This ID controls the graph and
                  trial result. Give each object a different marker.
                </p>
                <button
                  className="mt-text-link"
                  onClick={() => setTab("markers")}
                >
                  Make printable markers <ChevronRight size={15} />
                </button>
              </div>
              <div className="mt-card">
                <div className="mt-card-title">
                  <span className="mt-step">2</span>
                  <h2>Set the scale</h2>
                  <Ruler size={17} />
                </div>
                <div
                  className={`mt-scale-status ${capture.scale ? "set" : ""}`}
                >
                  {capture.scale ? (
                    <>
                      <Check size={14} /> {formatNumber(1 / capture.scale)} px /
                      cm {capture.source === "demo" && "· demo"}
                    </>
                  ) : (
                    "Uncalibrated · measurements in pixels"
                  )}
                </div>
                <label>
                  Reference length (cm)
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={referenceCm}
                    disabled={busy || pickPoints !== null}
                    onChange={(e) => setReferenceCm(e.target.value)}
                  />
                </label>
                <button
                  className="mt-button full"
                  disabled={
                    busy || capture.source === "none" || pickPoints !== null
                  }
                  onClick={() => {
                    tracker.paused = true;
                    setPickPoints([]);
                    setError("");
                  }}
                >
                  <Crosshair size={15} /> Pick two points in the video
                </button>
                {pickPoints !== null && (
                  <button
                    className="mt-text-link"
                    onClick={() => {
                      setPickPoints(null);
                      tracker.paused = false;
                      tracker.paint(tracker.currentMarkers);
                    }}
                  >
                    Cancel calibration
                  </button>
                )}
                <div className="mt-or">
                  <span />
                  or use the target marker
                  <span />
                </div>
                <div className="mt-field-row">
                  <label>
                    Black square (mm)
                    <input
                      type="number"
                      min="10"
                      max="150"
                      step="1"
                      value={markerSizeMm}
                      disabled={busy}
                      onChange={(e) => setMarkerSizeMm(e.target.value)}
                    />
                  </label>
                  <button
                    className="mt-button"
                    disabled={
                      busy ||
                      capture.source === "none" ||
                      pickPoints !== null ||
                      !validMarkerId
                    }
                    onClick={() => runAction(calibrateFromMarker)}
                  >
                    Use marker
                  </button>
                </div>
                <p className="mt-small">
                  Measure the printed black square, excluding its white margin.
                  Keep it flat, facing the camera, and at the same depth as the
                  movement.
                </p>
              </div>
              <div className="mt-card">
                <div className="mt-card-title">
                  <span className="mt-step">3</span>
                  <h2>Save your results</h2>
                </div>
                <button
                  className="mt-button full primary"
                  disabled={busy || !capture.count || !capture.scale}
                  onClick={() => setTab("trials")}
                >
                  <FlaskConical size={15} /> Compare a trial
                </button>
                <div className="mt-export-grid">
                  <button
                    disabled={busy || !capture.count}
                    onClick={() =>
                      download(
                        sessionCSV(tracker.snapshot()),
                        `motion-${capture.source === "demo" ? "DEMO-" : ""}data.csv`,
                        "text/csv",
                      )
                    }
                  >
                    <FileSpreadsheet size={18} />
                    Data CSV
                  </button>
                  <button
                    disabled={busy || capture.source === "none"}
                    onClick={downloadFrame}
                  >
                    <Image size={18} />
                    Frame PNG
                  </button>
                  <button
                    disabled={busy || !capture.count}
                    onClick={() =>
                      download(
                        chart,
                        `motion-${graphMode}.svg`,
                        "image/svg+xml",
                      )
                    }
                  >
                    <Activity size={18} />
                    Graph SVG
                  </button>
                  <button
                    disabled={busy || !capture.count}
                    onClick={() => runAction(() => tracker.exportVideo())}
                  >
                    <Video size={18} />
                    Annotated video
                  </button>
                </div>
                <p className="mt-small">
                  Video export replays your clip in real time, without audio.
                  Keep this tab visible. Data and graphs use the recorded
                  analysis samples.
                </p>
              </div>
            </aside>
          </div>
          <div className="mt-detection-row">
            <span>
              <Crosshair size={16} /> Markers in this frame
            </span>
            {capture.currentMarkers.length ? (
              capture.currentMarkers.map((m, i) => (
                <span
                  className={`mt-marker-chip ${m.id === Number(markerId) ? "selected" : ""}`}
                  key={`${m.id}-${i}`}
                >
                  ID {m.id} · {formatNumber(markerGeometry(m).x, 0)},{" "}
                  {formatNumber(markerGeometry(m).y, 0)} px
                </span>
              ))
            ) : (
              <span>No marker detected in the current frame</span>
            )}
          </div>
          <p className="mt-footnote">
            <CircleHelp size={14} /> 2D feasibility measurements. Camera
            movement, perspective, blur, and depth changes affect the result.
            This tool does not measure 3D joint angles or validate a prosthetic.
          </p>
        </section>

        <section
          hidden={tab !== "markers"}
          id="panel-markers"
          role="tabpanel"
          aria-labelledby="tab-markers"
        >
          <div className="mt-section-heading">
            <div>
              <h2>Print your markers</h2>
              <p>
                Use a different ID for each object. These {DICTIONARY} markers
                work with this tracker.
              </p>
            </div>
            <button
              className="mt-button primary"
              disabled={!!markerSheet.error}
              onClick={() => window.print()}
            >
              <Printer size={16} /> Print marker sheet
            </button>
          </div>
          <div className="mt-generator-controls">
            <label>
              First marker ID
              <input
                type="number"
                min="0"
                max="249"
                value={generatorId}
                onChange={(e) => setGeneratorId(e.target.value)}
              />
            </label>
            <label>
              Number of markers
              <input
                type="number"
                min="1"
                max="12"
                value={generatorCount}
                onChange={(e) => setGeneratorCount(e.target.value)}
              />
            </label>
            <label>
              Black-square size (mm)
              <input
                type="number"
                min="10"
                max="150"
                value={generatorSize}
                onChange={(e) => setGeneratorSize(e.target.value)}
              />
            </label>
            <div>
              <strong>Print at 100% / actual size</strong>
              <p>
                Turn off “fit to page.” Check the black square with a ruler
                after printing.
              </p>
            </div>
          </div>
          {markerSheet.error ? (
            <div className="mt-alert error">{markerSheet.error}</div>
          ) : (
            <div className="mt-marker-grid">
              {markerSheet.markers.map((m) => (
                <article className="mt-marker-card" key={m.id}>
                  <div
                    className="mt-marker-preview"
                    dangerouslySetInnerHTML={{
                      __html: m.svg,
                    }}
                  />
                  <div className="mt-marker-details">
                    <div>
                      <strong>ID {String(m.id).padStart(3, "0")}</strong>
                      <span>
                        {generatorSize} × {generatorSize} mm black square
                      </span>
                    </div>
                    <button
                      aria-label={`Download marker ${m.id} SVG`}
                      onClick={() =>
                        download(
                          m.svg,
                          `aruco-mip-36h12-id-${m.id}-${generatorSize}mm.svg`,
                          "image/svg+xml",
                        )
                      }
                    >
                      <Download size={19} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="mt-two-notes">
            <div>
              <h3>Keep the white border</h3>
              <p>
                Print on matte white paper, mount flat on card, and leave the
                white margin intact. Avoid glossy tape over the pattern.
              </p>
            </div>
            <div>
              <h3>Match the dictionary</h3>
              <p>
                Use unique IDs for different objects. An ID from a different
                dictionary is a different marker.{" "}
                <a
                  href="https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html"
                  target="_blank"
                  rel="noreferrer"
                >
                  Alternative marker generator ↗
                </a>
              </p>
            </div>
          </div>
        </section>

        <section
          hidden={tab !== "trials"}
          id="panel-trials"
          role="tabpanel"
          aria-labelledby="tab-trials"
        >
          <div className="mt-section-heading">
            <div>
              <h2>Check it against the ruler</h2>
              <p>
                Compare endpoint displacement with a distance you measured using
                a ruler.
              </p>
            </div>
            <button
              className="mt-button"
              disabled={!trials.length}
              onClick={() =>
                download(
                  trialsCSV(trials),
                  "motion-feasibility-trials.csv",
                  "text/csv",
                )
              }
            >
              <Download size={16} /> Export trials CSV
            </button>
          </div>
          <div className="mt-trial-layout">
            <div className="mt-card">
              <h3>Save the current capture</h3>
              <div className="mt-current-trial">
                <span>
                  {capture.source === "demo"
                    ? "SYNTHETIC DEMO"
                    : `TARGET ID ${markerId}`}
                </span>
                <strong>
                  {formatNumber(captureSummary.last?.displacement)}{" "}
                  <small>{unit}</small>
                </strong>
                <span>
                  {formatNumber(captureSummary.coverage, 1)}% detected ·{" "}
                  {capture.count} samples
                </span>
              </div>
              <label>
                Trial name
                <input
                  placeholder="20 cm · bright light · run 1"
                  value={trialLabel}
                  maxLength="100"
                  onChange={(e) => setTrialLabel(e.target.value)}
                />
              </label>
              <div className="mt-field-row">
                <label>
                  Actual travel (cm)
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={actualCm}
                    onChange={(e) => setActualCm(e.target.value)}
                  />
                </label>
                <label>
                  Allowed error (cm)
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={allowedErrorCm}
                    onChange={(e) => setAllowedErrorCm(e.target.value)}
                  />
                </label>
              </div>
              <label>
                Minimum detection rate (%)
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={minimumDetection}
                  onChange={(e) => setMinimumDetection(e.target.value)}
                />
              </label>
              <label>
                Conditions / observations
                <textarea
                  placeholder="Camera distance, lighting, marker size, motion speed…"
                  rows="3"
                  value={notes}
                  maxLength="1000"
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <button
                className="mt-button primary full"
                disabled={
                  busy ||
                  !capture.scale ||
                  captureSummary.detected < 2 ||
                  !validMarkerId
                }
                onClick={() => runAction(saveTrial)}
              >
                <Check size={16} /> Save{" "}
                {capture.source === "demo" ? "demo " : ""}trial
              </button>
              <p className="mt-small">
                A complete trial needs at least 10 samples and detections at
                both endpoints. Default limits (1 cm, 90%) are editable project
                targets, not clinical standards.
              </p>
            </div>
            <div>
              <div className="mt-metrics three">
                <Metric
                  label="Complete real trials"
                  value={trialSummary?.count ?? 0}
                  unit=""
                />
                <Metric
                  label="Mean absolute error"
                  value={formatNumber(trialSummary?.mae)}
                  unit="cm"
                />
                <Metric
                  label="RMSE"
                  value={formatNumber(trialSummary?.rmse)}
                  unit="cm"
                />
              </div>
              <div className="mt-trial-table-wrap">
                <table className="mt-trial-table">
                  <thead>
                    <tr>
                      <th>Trial / condition</th>
                      <th>Actual</th>
                      <th>Measured</th>
                      <th>|Error|</th>
                      <th>Detection</th>
                      <th>Result</th>
                      <th>
                        <span className="mt-sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {trials.length ? (
                      trials.map((t) => (
                        <tr key={t.uid}>
                          <td>
                            <strong>{t.label}</strong>
                            <span>
                              {t.demo ? "DEMO · " : ""}ID {t.markerId} ·{" "}
                              {t.samples} samples
                            </span>
                            {t.notes && <small>{t.notes}</small>}
                          </td>
                          <td>{formatNumber(t.actualCm)} cm</td>
                          <td>{formatNumber(t.measuredCm)} cm</td>
                          <td>
                            {formatNumber(t.absoluteErrorCm)} cm
                            <small>{formatNumber(t.errorPercent, 1)}%</small>
                          </td>
                          <td>{formatNumber(t.coverage, 1)}%</td>
                          <td>
                            <span
                              className={`mt-result ${t.result.toLowerCase()}`}
                            >
                              {t.demo ? "DEMO " : ""}
                              {t.result}
                            </span>
                          </td>
                          <td>
                            <button
                              aria-label={`Remove ${t.label}`}
                              onClick={() =>
                                runAction(() => {
                                  const updated = trials.filter(
                                    (a) => a.uid !== t.uid,
                                  );
                                  setTrials(updated);
                                  localStorage.setItem(
                                    TRIAL_STORAGE_KEY,
                                    JSON.stringify(updated),
                                  );
                                })
                              }
                            >
                              <X size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7">
                          <div className="mt-trials-empty">
                            <FlaskConical size={32} strokeWidth={1} />
                            <h3>No trials saved yet</h3>
                            <p>
                              Record a calibrated movement, enter the actual
                              travel,
                              <br />
                              then save the trial. Repeat to see how consistent
                              it is.
                            </p>
                            <button
                              className="mt-text-link"
                              onClick={() => setTab("track")}
                            >
                              Start a capture <ArrowUpRight size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="mt-small">
                Saved in this browser (up to 200 trials). Export CSV to keep a
                copy or share with Abram. Demo and incomplete trials are
                excluded from the summary. CSV includes the limits used for each
                result.
              </p>
              <div className="mt-note">
                <strong>Displacement ≠ path length</strong>
                <p>
                  Move once from A to B and stop. The comparison uses the
                  straight-line distance between the first and last detected
                  positions, not the distance traveled along a curved path.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          hidden={tab !== "guide"}
          id="panel-guide"
          role="tabpanel"
          aria-labelledby="tab-guide"
        >
          <div className="mt-section-heading">
            <div>
              <h2>How to run the test</h2>
              <p>
                Start with a marker on a flat object. Establish accuracy before
                testing more complicated motion.
              </p>
            </div>
          </div>
          <div className="mt-guide-grid">
            <div className="mt-card">
              <h3>What you need</h3>
              <ul>
                <li>Phone or webcam, and a stable stand / tripod</li>
                <li>Printed markers, matte paper, card, scissors, tape</li>
                <li>Ruler or tape measure and two endpoint marks</li>
                <li>Laptop with a current browser; Chrome recommended</li>
                <li>Bright, even light and a flat surface</li>
              </ul>
              <p className="mt-small">
                Everything digital runs in this page. No account, Python
                installation, or video upload to a server is required.
              </p>
            </div>
            <div className="mt-card mt-guide-steps">
              {[
                [
                  "Print + verify",
                  "Generate IDs 0–2 at 50 mm. Print at actual size, measure the black square, and attach one marker to a rigid object. Keep its white margin.",
                ],
                [
                  "Set the scene",
                  "Fix the camera facing the motion plane straight on. Put the ruler in that same plane. Mark A and B exactly 20 cm apart. Use one-way motion with the whole marker visible.",
                ],
                [
                  "Record + calibrate",
                  "Record a 5–10 second clip. Hold at A, move steadily to B, then hold. Load the clip, preview a clear frame, and pick two ruler points. Use an independent ruler measurement to check accuracy.",
                ],
                [
                  "Analyze + compare",
                  "Use 10 Hz to start. Run Analyze clip, open Trials, enter 20 cm, and save. Repeat at least three times with the same setup. Agree your error and detection limits before testing.",
                ],
                [
                  "Change one variable",
                  "Repeat at 10, 20, and 30 cm, then test lighting, distance from camera, marker size, or speed individually. Keep all other conditions fixed. Log what changed.",
                ],
                [
                  "Export the evidence",
                  "Save the raw CSV, graph, annotated footage, and trials table. Report distance error, detection rate, test conditions, and limitations. Physical measurements decide feasibility; the demo only checks the software.",
                ],
              ].map(([title, body], i) => (
                <div className="mt-guide-step" key={title}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-two-notes">
            <div>
              <h3>What the numbers mean</h3>
              <p>
                <strong>Pixel coordinates:</strong> origin at the top left; Y
                increases downward. <strong>Calibrated position:</strong> origin
                at the bottom left; Y increases upward.{" "}
                <strong>Displacement:</strong> straight-line distance from the
                first detection. <strong>Rotation:</strong> in-plane angle
                change, positive counterclockwise.{" "}
                <strong>Detection rate:</strong> percentage of sampled frames
                with exactly one target ID.
              </p>
              <p>
                Data uses the displayed analysis resolution, up to 960 × 720.
                Live sampling depends on device speed; timestamps record actual
                elapsed time. Video analysis seeks fixed timestamps. Neither
                reconstructs motion between samples.
              </p>
            </div>
            <div>
              <h3>Know the limits</h3>
              <p>
                Keep the camera still and movement at a constant depth. A single
                scale does not correct perspective or lens distortion. Use a
                larger reference near your motion area. Fast movement, blur,
                folds, reflections, tiny markers, and occlusion reduce
                reliability.
              </p>
              <p>
                This is an engineering feasibility tool. It is not a clinical
                gait assessment, a 3D joint-angle tracker, or evidence that a
                prosthetic is safe to wear. Test first with objects or a bench
                fixture.
              </p>
            </div>
          </div>
          <div className="mt-faq">
            <h3>When something doesn’t work</h3>
            <details>
              <summary>My iPhone video will not load</summary>
              <p>
                MOV is a container; codec support varies. Export the clip as
                H.264 MP4, or record future clips using iPhone Camera → Formats
                → Most Compatible. Trim to two minutes or less and under 500 MB.
                Portrait clips are supported.
              </p>
            </details>
            <details>
              <summary>The camera is blocked</summary>
              <p>
                Open the site directly in your browser over HTTPS. Allow camera
                access in the address bar. Close other apps using the camera,
                then retry Live camera. Uploading a recorded clip works without
                camera permission.
              </p>
            </details>
            <details>
              <summary>The marker is missing or reports the wrong ID</summary>
              <p>
                Generate the marker here using ARUCO_MIP_36h12. Use the full
                pattern with its white border. Face it toward the camera, add
                light, avoid motion blur, and move closer. Never use two copies
                of the same ID in one scene.
              </p>
            </details>
            <details>
              <summary>The measurement is wrong</summary>
              <p>
                Check print size with a ruler. Recalibrate after changing camera
                position, zoom, resolution, or depth. Keep reference and motion
                in the same plane. Finish at B: returning to A gives near-zero
                endpoint displacement. A stationary-marker recording can reveal
                jitter before motion tests.
              </p>
            </details>
            <details>
              <summary>Annotated video export takes time</summary>
              <p>
                The browser replays the clip while recording the overlay. Keep
                the tab visible and wait for the download. Output is a silent
                WebM or MP4 depending on the browser. Exported overlays update
                at the sampled analysis rate. If your browser cannot encode
                video, export an annotated PNG and CSV instead.
              </p>
            </details>
          </div>
          <div className="mt-resources">
            <span>Useful links</span>
            <a
              href="https://damianofalcioni.github.io/js-aruco2/"
              target="_blank"
              rel="noreferrer"
            >
              js-aruco2 documentation <ArrowUpRight size={14} />
            </a>
            <a
              href="https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html"
              target="_blank"
              rel="noreferrer"
            >
              OpenCV marker guide <ArrowUpRight size={14} />
            </a>
            <a
              href="https://opensource.org/license/mit"
              target="_blank"
              rel="noreferrer"
            >
              Open-source licensing <ArrowUpRight size={14} />
            </a>
          </div>
        </section>
        <footer className="mt-footer">
          <span>
            CAPSTONE <span className="mt-divider">/</span> Motion Tracking
            Software
          </span>
          <span>Idrees Nait + Abram · ATLAS</span>
        </footer>
      </div>
      <div className="mt-print">
        <h1>CAPSTONE · Motion markers</h1>
        <p>
          {DICTIONARY} · Print at 100% / actual size. Verify the black square
          with a ruler.
        </p>
        {markerSheet.markers?.map((m) => (
          <div className="mt-print-marker" key={m.id}>
            <div
              dangerouslySetInnerHTML={{
                __html: m.svg,
              }}
            />
            <p>
              ID {m.id} · {generatorSize} × {generatorSize} mm black square
              (white margin excluded)
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}
function Metric({ label, value, unit }) {
  return (
    <div className="mt-metric">
      <span>{label}</span>
      <strong>
        {value}
        <small>{unit}</small>
      </strong>
    </div>
  );
}
