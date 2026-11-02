import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Camera, Upload, Play, Square, ScanLine, Download, Printer, Ruler, Check, Crosshair, FlaskConical, BookOpen, Grid2X2, ChevronRight, RotateCcw, X, CircleHelp, Video, FileSpreadsheet, Image, Activity } from 'lucide-react';
import { Tracker, download } from '../capstone/engine.js';
import { markerSVG } from '../capstone/markers.js';
import { DICTIONARY, distance, markerGeometry, scaleFromLine, summarize, makeTrial, trialStats, sessionCSV, trialsCSV, graphSVG } from '../capstone/model.js';
import '../capstone/motion.css';

const STORAGE = 'idrees-capstone-motion-trials-v1';
const emptyView = { source: 'none', mode: 'empty', count: 0, currentMarkers: [], width: 960, height: 540 };
const tabs = [{ id: 'track', label: 'Track', icon: ScanLine }, { id: 'markers', label: 'Markers', icon: Grid2X2 }, { id: 'trials', label: 'Trials', icon: FlaskConical }, { id: 'guide', label: 'Guide', icon: BookOpen }];
const fmt = (v, n = 2) => Number.isFinite(v) ? v.toFixed(n) : '—';
function readTrials() {
  try { const data = JSON.parse(localStorage.getItem(STORAGE) || '[]'); return Array.isArray(data) ? data.filter(t => t && typeof t.uid === 'string' && Number.isFinite(t.measuredCm)).slice(-200) : []; }
  catch { return []; }
}

export default function MotionTracking() {
  const [tab, setTab] = useState('track'), [view, setView] = useState(emptyView);
  const [message, setMessage] = useState(''), [error, setError] = useState('');
  const [target, setTarget] = useState(0), [fps, setFps] = useState(10), [graph, setGraph] = useState('displacement');
  const [reference, setReference] = useState(20), [markerSize, setMarkerSize] = useState(50);
  const [pickPoints, setPickPoints] = useState(null), [previewTime, setPreviewTime] = useState(0);
  const [generatorId, setGeneratorId] = useState(0), [generatorCount, setGeneratorCount] = useState(3), [generatorSize, setGeneratorSize] = useState(50);
  const [trials, setTrials] = useState(readTrials), [actual, setActual] = useState(20), [tolerance, setTolerance] = useState(1), [coverage, setCoverage] = useState(90);
  const [trialLabel, setTrialLabel] = useState(''), [notes, setNotes] = useState('');
  const engine = useRef(null), video = useRef(null), canvas = useRef(null), file = useRef(null);
  useEffect(() => {
    const tracker = new Tracker(video.current, canvas.current, setView, e => setError(e.message)); engine.current = tracker; tracker.notify();
    const title = document.title; document.title = 'Motion Tracking Software · CAPSTONE · Idrees Nait';
    return () => { tracker.destroy(); document.title = title; };
  }, []);
  useEffect(() => {
    if (view.source === 'video' && !view.busy) setPreviewTime(view.previewTime || 0);
  }, [view.source, view.busy, view.previewTime]);
  const run = async action => { setError(''); setMessage(''); try { await action(); } catch (e) { setError(e.message || String(e)); } };
  const tracker = engine.current;
  const series = useMemo(() => engine.current?.series() || [], [view, target]);
  const summary = summarize(series), unit = view.scale ? 'cm' : 'px';
  const current = summary.current?.detected ? summary.current : null;
  const busy = view.busy || view.recording;
  const chart = graphSVG(series, graph, unit, `${view.source === 'demo' ? 'SYNTHETIC DEMO · ' : ''}ID ${target} · ${graph === 'position' ? 'Position relative to start' : graph}`);
  const stats = trialStats(trials);
  const generated = useMemo(() => {
    try {
      const start = Number(generatorId), count = Number(generatorCount), size = Number(generatorSize);
      if (!Number.isInteger(count) || count < 1 || count > 12 || start + count > 250) return { error: 'Use 1–12 markers with IDs between 0 and 249.' };
      return { markers: Array.from({ length: count }, (_, i) => ({ id: start + i, svg: markerSVG(start + i, size) })) };
    } catch (e) { return { error: e.message }; }
  }, [generatorId, generatorCount, generatorSize]);

  function setCalibration(scale, info) {
    tracker.scale = scale; tracker.calibration = info; tracker.paused = false;
    setPickPoints(null); tracker.paint(tracker.currentMarkers, tracker.frames.at(-1)?.t || 0); tracker.notify();
    setMessage(`Calibrated: ${fmt(1 / scale)} pixels = 1 cm. Keep the camera fixed and motion in the reference plane.`);
  }
  function selectPoint(event) {
    if (!pickPoints) return;
    const rect = canvas.current.getBoundingClientRect();
    const p = { x: (event.clientX - rect.left) * canvas.current.width / rect.width, y: (event.clientY - rect.top) * canvas.current.height / rect.height };
    const points = [...pickPoints, p]; setPickPoints(points);
    tracker.paint(tracker.currentMarkers, tracker.frames.at(-1)?.t || 0);
    const ctx = tracker.ctx; ctx.strokeStyle = '#71ded1'; ctx.fillStyle = '#71ded1'; ctx.lineWidth = 3;
    points.forEach(q => { ctx.beginPath(); ctx.arc(q.x, q.y, 6, 0, Math.PI * 2); ctx.fill(); });
    if (points.length === 2) run(() => {
      try { setCalibration(scaleFromLine(points[0], points[1], Number(reference)), { method: 'two-point', referenceCm: Number(reference), points }); }
      catch (e) { setPickPoints([]); tracker.paint(tracker.currentMarkers); throw e; }
    });
  }
  function saveTrial() {
    const t = makeTrial({ ...tracker.snapshot(), id: Number(target), actual: Number(actual), tolerance: Number(tolerance), minCoverage: Number(coverage), notes, label: trialLabel });
    const updated = [...trials, t].slice(-200); setTrials(updated);
    try { localStorage.setItem(STORAGE, JSON.stringify(updated)); setMessage('Trial saved on this browser. Export the table for your capstone documentation.'); }
    catch { setError('This browser could not save the trial permanently. Export the trial CSV before closing.'); }
    setTrialLabel('');
  }
  function changeTarget(value) {
    setTarget(value);
    if (value !== '' && Number.isInteger(Number(value)) && Number(value) >= 0 && Number(value) < 250) { tracker.target = Number(value); tracker.notify(); }
  }
  const validTarget = target !== '' && Number.isInteger(Number(target)) && Number(target) >= 0 && Number(target) < 250;
  const snapshot = () => canvas.current.toBlob(blob => blob && download(blob, `motion-${view.source === 'demo' ? 'DEMO-' : ''}annotated.png`));

  return <main className="mt-app">
    <nav className="mt-topbar"><Link to="/capstone"><ArrowLeft size={16} /> CAPSTONE</Link><span>IDREES NAIT <span className="mt-divider">/</span> MOTION LAB <span className="mt-version">V1.0</span></span></nav>
    <div className="mt-wrap">
      <header className="mt-header"><div><div className="mt-eyebrow">CAPSTONE / FEASIBILITY TEST 01</div><h1>Make motion<br className="mt-mobile-break" /> measurable<span className="mt-dot">.</span></h1><p>Motion Tracking Software · Print a marker. Record a movement. Test the result.</p></div><div className="mt-local"><span /> Video stays on your device</div></header>
      <div className="mt-tabbar" role="tablist" aria-label="Motion workspace">{tabs.map(({ id, label, icon: Icon }, i) => <button key={id} id={`tab-${id}`} role="tab" aria-selected={tab === id} aria-controls={`panel-${id}`} onClick={() => setTab(id)}><Icon size={17} />{label}<span>0{i + 1}</span></button>)}<div className="mt-dictionary">{DICTIONARY} <span>250 IDs</span></div></div>
      {error && <div className="mt-alert error" role="alert">{error}<button aria-label="Dismiss error" onClick={() => setError('')}><X size={16} /></button></div>}
      {message && <div className="mt-alert" role="status"><Check size={17} />{message}<button aria-label="Dismiss message" onClick={() => setMessage('')}><X size={16} /></button></div>}

      <section hidden={tab !== 'track'} id="panel-track" role="tabpanel" aria-labelledby="tab-track">
        <div className="mt-sourcebar"><div className="mt-source-actions"><button className="mt-button primary" disabled={busy || pickPoints !== null} onClick={() => file.current.click()}><Upload size={16} /> Upload video</button><button className="mt-button" disabled={busy || pickPoints !== null} onClick={() => run(() => tracker.camera())}><Camera size={16} /> Live camera</button><button className="mt-button quiet" disabled={busy || !validTarget || pickPoints !== null} onClick={() => run(() => tracker.demo())}><Play size={15} /> Try demo</button></div><span>iPhone clips welcome · MP4 / MOV · up to 2 minutes</span><input ref={file} type="file" accept="video/*,.mov,.mp4,.m4v" className="mt-sr-only" aria-label="Choose a recorded video" onChange={e => { const selected = e.target.files?.[0]; e.target.value = ''; setPreviewTime(0); run(() => tracker.load(selected)); }} /></div>
        <div className="mt-workspace">
          <div className="mt-main-column">
            <div className="mt-viewer">
              <div className="mt-panelhead"><span><span className={`mt-status-dot ${view.mode === 'live' || busy ? 'active' : ''}`} />{view.source === 'demo' ? 'SYNTHETIC DEMO' : view.source === 'video' ? view.filename : view.source === 'camera' ? 'LIVE CAMERA' : 'CAMERA VIEW'}</span><span>{view.source === 'none' ? 'READY WHEN YOU ARE' : `${view.width} × ${view.height}`}</span></div>
              <div className={`mt-canvas-wrap ${pickPoints ? 'picking' : ''}`}><canvas ref={canvas} onClick={selectPoint} aria-label="Video with detected ArUco marker outlines, IDs, pixel coordinates, and motion paths" /><video ref={video} muted playsInline preload="auto" className="mt-source-video" />
                {view.source === 'none' && <div className="mt-empty"><div className="mt-scan-icon"><ScanLine size={48} strokeWidth={1} /></div><h2>Your experiment starts here</h2><p>Upload a clip or open your camera.<br />No footage yet? Try the demo.</p><button disabled={busy || !validTarget} className="mt-text-link" onClick={() => run(() => tracker.demo())}>See a marker in motion <ArrowUpRight size={16} /></button><div className="mt-grid-caption">2D POSITION · DISPLACEMENT · ROTATION</div></div>}
                {pickPoints && <div className="mt-pick-hint">Click {pickPoints.length === 0 ? 'the first' : 'the second'} end of your reference length</div>}
              </div>
              <div className="mt-transport"><div>
                {view.source === 'video' && !busy && <button className="mt-button primary small" disabled={!validTarget || pickPoints !== null} onClick={() => run(() => tracker.analyze())}><Play size={14} />{view.count ? 'Analyze again' : 'Analyze clip'}</button>}
                {view.mode === 'live' && !view.recording && <button className="mt-button primary small" disabled={!validTarget || pickPoints !== null} onClick={() => tracker.recordCamera()}><span className="mt-record-dot" /> Record trial</button>}
                {busy && <button className="mt-button small" onClick={() => tracker.stop()}><Square size={13} />{view.recording ? 'Finish trial' : 'Stop'}</button>}
                {view.mode === 'live' && !view.recording && <button className="mt-button quiet small" onClick={() => tracker.freezeCamera()}>Close camera</button>}
                <span className="mt-mono">{fmt(view.time || 0)} s</span><span className="mt-mode-label">{view.mode === 'exporting' ? 'Exporting in real time…' : view.mode === 'analyzing' ? `Analyzing ${fmt(view.progress, 0)}%` : view.recording ? 'Recording…' : view.mode === 'done' || view.mode === 'frozen' ? 'Capture finished' : view.mode === 'stopped' ? 'Stopped · partial data' : view.mode === 'loading' ? 'Loading…' : 'Ready'}</span></div><span>{view.count} samples</span></div>
              {view.busy && <progress className="mt-progress" max="100" value={view.progress || 0} aria-label="Processing progress" />}
              {view.source === 'video' && !busy && <label className="mt-preview-slider">Preview frame <input type="range" min="0" max={Math.max(0, view.duration - .001)} step="0.05" value={previewTime} disabled={pickPoints !== null} onChange={e => { const t = Number(e.target.value); setPreviewTime(t); }} onPointerUp={() => run(async () => { await tracker.seek(Number(previewTime)); tracker.capture(Number(previewTime)); tracker.notify(); })} onKeyUp={() => run(async () => { await tracker.seek(Number(previewTime)); tracker.capture(Number(previewTime)); tracker.notify(); })} /><span>{fmt(Number(previewTime), 1)} s</span></label>}
            </div>
            <div className="mt-metrics"><Metric label="DISPLACEMENT" value={fmt(current?.displacement)} unit={unit} /><Metric label="ROTATION FROM START" value={fmt(current?.rotation, 1)} unit="°" /><Metric label="DETECTION RATE" value={view.count ? fmt(summary.coverage, 0) : '—'} unit="%" /><Metric label="SAMPLED FRAMES" value={view.count || '—'} unit="" /></div>
            <div className="mt-chart-panel"><div className="mt-panelhead"><span><Activity size={15} /> MOTION OVER TIME</span><div className="mt-chart-options"><select aria-label="Graph metric" value={graph} onChange={e => setGraph(e.target.value)}><option value="displacement">Displacement</option><option value="position">Position (ΔX / ΔY)</option><option value="rotation">Rotation</option></select><button disabled={!view.count} aria-label="Download graph as SVG" title="Download graph as SVG" onClick={() => download(chart, `motion-${view.source === 'demo' ? 'DEMO-' : ''}${graph}.svg`, 'image/svg+xml')}><Download size={16} /></button></div></div><div className="mt-chart" dangerouslySetInnerHTML={{ __html: chart }} /><p className="mt-chart-caption">Relative to the first detection. Gaps mean the marker was not detected. Y is positive upward.</p></div>
          </div>
          <aside className="mt-sidebar">
            <div className="mt-card"><div className="mt-card-title"><span className="mt-step">1</span><h2>Tracking setup</h2></div><div className="mt-field-row"><label>Target marker ID<input type="number" min="0" max="249" step="1" value={target} disabled={busy} onChange={e => changeTarget(e.target.value)} /></label><label>Sample rate<select value={fps} disabled={busy} onChange={e => { setFps(Number(e.target.value)); tracker.fps = Number(e.target.value); }}><option value="5">5 Hz</option><option value="10">10 Hz</option><option value="15">15 Hz</option><option value="30">30 Hz</option></select></label></div>
              <p className="mt-small">All visible IDs are tracked. This ID controls the graph and trial result. Give each object a different marker.</p><button className="mt-text-link" onClick={() => setTab('markers')}>Make printable markers <ChevronRight size={15} /></button></div>
            <div className="mt-card"><div className="mt-card-title"><span className="mt-step">2</span><h2>Set the scale</h2><Ruler size={17} /></div><div className={`mt-scale-status ${view.scale ? 'set' : ''}`}>{view.scale ? <><Check size={14} /> {fmt(1 / view.scale)} px / cm {view.source === 'demo' && '· demo'}</> : 'Uncalibrated · measurements in pixels'}</div>
              <label>Reference length (cm)<input type="number" min="0.1" step="0.1" value={reference} disabled={busy || pickPoints !== null} onChange={e => setReference(e.target.value)} /></label>
              <button className="mt-button full" disabled={busy || view.source === 'none' || pickPoints !== null} onClick={() => { tracker.paused = true; setPickPoints([]); setError(''); }}><Crosshair size={15} /> Pick two points in the video</button>
              {pickPoints !== null && <button className="mt-text-link" onClick={() => { setPickPoints(null); tracker.paused = false; tracker.paint(tracker.currentMarkers); }}>Cancel calibration</button>}
              <div className="mt-or"><span />or use the target marker<span /></div><div className="mt-field-row"><label>Black square (mm)<input type="number" min="10" max="150" step="1" value={markerSize} disabled={busy} onChange={e => setMarkerSize(e.target.value)} /></label><button className="mt-button" disabled={busy || view.source === 'none' || pickPoints !== null || !validTarget} onClick={() => run(() => {
                const matches = tracker.currentMarkers.filter(m => m.id === Number(target));
                if (matches.length !== 1) throw new Error('Show exactly one copy of your target marker clearly, then try again.');
                const mm = Number(markerSize); if (!(mm >= 10 && mm <= 150)) throw new Error('Enter a marker size from 10 to 150 mm.');
                const g = markerGeometry(matches[0]); setCalibration(mm / 10 / g.side, { method: 'marker-edge', referenceCm: mm / 10, markerId: Number(target), pixels: g.side });
              })}>Use marker</button></div><p className="mt-small">Measure the printed black square, excluding its white margin. Keep it flat, facing the camera, and at the same depth as the movement.</p></div>
            <div className="mt-card"><div className="mt-card-title"><span className="mt-step">3</span><h2>Collect the evidence</h2></div><button className="mt-button full primary" disabled={busy || !view.count || !view.scale} onClick={() => setTab('trials')}><FlaskConical size={15} /> Compare a trial</button><div className="mt-export-grid"><button disabled={busy || !view.count} onClick={() => download(sessionCSV(tracker.snapshot()), `motion-${view.source === 'demo' ? 'DEMO-' : ''}data.csv`, 'text/csv')}><FileSpreadsheet size={18} />Data CSV</button><button disabled={busy || view.source === 'none'} onClick={snapshot}><Image size={18} />Frame PNG</button><button disabled={busy || !view.count} onClick={() => download(chart, `motion-${graph}.svg`, 'image/svg+xml')}><Activity size={18} />Graph SVG</button><button disabled={busy || !view.count} onClick={() => run(() => tracker.exportVideo())}><Video size={18} />Annotated video</button></div><p className="mt-small">Video export replays your clip in real time, without audio. Keep this tab visible. Data and graphs use the recorded analysis samples.</p></div>
          </aside>
        </div>
        <div className="mt-detection-row"><span><Crosshair size={16} /> VISIBLE MARKERS</span>{view.currentMarkers.length ? view.currentMarkers.map((m, i) => <span className={`mt-marker-chip ${m.id === Number(target) ? 'selected' : ''}`} key={`${m.id}-${i}`}>ID {m.id} · {fmt(markerGeometry(m).x, 0)}, {fmt(markerGeometry(m).y, 0)} px</span>) : <span>No marker detected in the current frame</span>}</div>
        <p className="mt-footnote"><CircleHelp size={14} /> 2D feasibility measurements. Camera movement, perspective, blur, and depth changes affect the result. This tool does not measure 3D joint angles or validate a prosthetic.</p>
      </section>

      <section hidden={tab !== 'markers'} id="panel-markers" role="tabpanel" aria-labelledby="tab-markers">
        <div className="mt-section-heading"><div><div className="mt-eyebrow">01 / PREPARE YOUR MARKERS</div><h2>A small square. A unique identity.</h2><p>Generate real {DICTIONARY} markers that this tracker recognizes.</p></div><button className="mt-button primary" disabled={!!generated.error} onClick={() => window.print()}><Printer size={16} /> Print marker sheet</button></div>
        <div className="mt-generator-controls"><label>First marker ID<input type="number" min="0" max="249" value={generatorId} onChange={e => setGeneratorId(e.target.value)} /></label><label>Number of markers<input type="number" min="1" max="12" value={generatorCount} onChange={e => setGeneratorCount(e.target.value)} /></label><label>Black-square size (mm)<input type="number" min="10" max="150" value={generatorSize} onChange={e => setGeneratorSize(e.target.value)} /></label><div><strong>Print at 100% / actual size</strong><p>Turn off “fit to page.” Check the black square with a ruler after printing.</p></div></div>
        {generated.error ? <div className="mt-alert error">{generated.error}</div> : <div className="mt-marker-grid">{generated.markers.map(m => <article className="mt-marker-card" key={m.id}><div className="mt-marker-preview" dangerouslySetInnerHTML={{ __html: m.svg }} /><div className="mt-marker-details"><div><strong>ID {String(m.id).padStart(3, '0')}</strong><span>{generatorSize} × {generatorSize} mm black square</span></div><button aria-label={`Download marker ${m.id} SVG`} onClick={() => download(m.svg, `aruco-mip-36h12-id-${m.id}-${generatorSize}mm.svg`, 'image/svg+xml')}><Download size={19} /></button></div></article>)}</div>}
        <div className="mt-two-notes"><div><h3>Keep the white border</h3><p>Print on matte white paper, mount flat on card, and leave the white margin intact. Avoid glossy tape over the pattern.</p></div><div><h3>Match the dictionary</h3><p>Use unique IDs for different objects. An ID from a different dictionary is a different marker. <a href="https://damianofalcioni.github.io/js-aruco2/samples/marker-creator/marker-creator.html" target="_blank" rel="noreferrer">Alternative marker generator ↗</a></p></div></div>
      </section>

      <section hidden={tab !== 'trials'} id="panel-trials" role="tabpanel" aria-labelledby="tab-trials">
        <div className="mt-section-heading"><div><div className="mt-eyebrow">03 / TEST THE CLAIM</div><h2>Does the measurement hold up?</h2><p>Compare endpoint displacement with a distance you measured using a ruler.</p></div><button className="mt-button" disabled={!trials.length} onClick={() => download(trialsCSV(trials), 'motion-feasibility-trials.csv', 'text/csv')}><Download size={16} /> Export trials CSV</button></div>
        <div className="mt-trial-layout"><div className="mt-card"><h3>Save the current capture</h3><div className="mt-current-trial"><span>{view.source === 'demo' ? 'SYNTHETIC DEMO' : `TARGET ID ${target}`}</span><strong>{fmt(summary.last?.displacement)} <small>{unit}</small></strong><span>{fmt(summary.coverage, 1)}% detected · {view.count} samples</span></div><label>Trial name<input placeholder="20 cm · bright light · run 1" value={trialLabel} maxLength="100" onChange={e => setTrialLabel(e.target.value)} /></label><div className="mt-field-row"><label>Actual travel (cm)<input type="number" min="0.1" step="0.1" value={actual} onChange={e => setActual(e.target.value)} /></label><label>Allowed error (cm)<input type="number" min="0" step="0.1" value={tolerance} onChange={e => setTolerance(e.target.value)} /></label></div><label>Minimum detection rate (%)<input type="number" min="1" max="100" value={coverage} onChange={e => setCoverage(e.target.value)} /></label><label>Conditions / observations<textarea placeholder="Camera distance, lighting, marker size, motion speed…" rows="3" value={notes} maxLength="1000" onChange={e => setNotes(e.target.value)} /></label><button className="mt-button primary full" disabled={busy || !view.scale || summary.detected < 2 || !validTarget} onClick={() => run(saveTrial)}><Check size={16} /> Save {view.source === 'demo' ? 'demo ' : ''}trial</button><p className="mt-small">A complete trial needs at least 10 samples and detections at both endpoints. Default limits (1 cm, 90%) are editable project targets, not clinical standards.</p></div>
          <div><div className="mt-metrics three"><Metric label="REAL, COMPLETE TRIALS" value={stats?.count ?? 0} unit="" /><Metric label="MEAN ABSOLUTE ERROR" value={fmt(stats?.mae)} unit="cm" /><Metric label="RMSE" value={fmt(stats?.rmse)} unit="cm" /></div><div className="mt-trial-table-wrap"><table className="mt-trial-table"><thead><tr><th>Trial / condition</th><th>Actual</th><th>Measured</th><th>|Error|</th><th>Detection</th><th>Result</th><th><span className="mt-sr-only">Remove</span></th></tr></thead><tbody>{trials.length ? trials.map(t => <tr key={t.uid}><td><strong>{t.label}</strong><span>{t.demo ? 'DEMO · ' : ''}ID {t.markerId} · {t.samples} samples</span>{t.notes && <small>{t.notes}</small>}</td><td>{fmt(t.actualCm)} cm</td><td>{fmt(t.measuredCm)} cm</td><td>{fmt(t.absoluteErrorCm)} cm<small>{fmt(t.errorPercent, 1)}%</small></td><td>{fmt(t.coverage, 1)}%</td><td><span className={`mt-result ${t.result.toLowerCase()}`}>{t.demo ? 'DEMO ' : ''}{t.result}</span></td><td><button aria-label={`Remove ${t.label}`} onClick={() => run(() => { const updated = trials.filter(a => a.uid !== t.uid); setTrials(updated); localStorage.setItem(STORAGE, JSON.stringify(updated)); })}><X size={15} /></button></td></tr>) : <tr><td colSpan="7"><div className="mt-trials-empty"><FlaskConical size={32} strokeWidth={1} /><h3>Evidence goes here</h3><p>Record a calibrated movement, enter the actual travel,<br />then save the trial. Repeat to see how consistent it is.</p><button className="mt-text-link" onClick={() => setTab('track')}>Start a capture <ArrowUpRight size={16} /></button></div></td></tr>}</tbody></table></div><p className="mt-small">Saved in this browser (up to 200 trials). Export CSV to keep a copy or share with Abram. Demo and incomplete trials are excluded from the summary. CSV includes the limits used for each result.</p><div className="mt-note"><strong>Displacement ≠ path length</strong><p>Move once from A to B and stop. The comparison uses the straight-line distance between the first and last detected positions, not the distance traveled along a curved path.</p></div></div></div>
      </section>

      <section hidden={tab !== 'guide'} id="panel-guide" role="tabpanel" aria-labelledby="tab-guide">
        <div className="mt-section-heading"><div><div className="mt-eyebrow">THE EXPERIMENT / FROM SETUP TO EVIDENCE</div><h2>Prove the workflow, one trial at a time.</h2><p>Start with a marker on a flat object. Establish accuracy before testing more complicated motion.</p></div></div>
        <div className="mt-guide-grid"><div className="mt-card"><h3>What you need</h3><ul><li>Phone or webcam, and a stable stand / tripod</li><li>Printed markers, matte paper, card, scissors, tape</li><li>Ruler or tape measure and two endpoint marks</li><li>Laptop with a current browser; Chrome recommended</li><li>Bright, even light and a flat surface</li></ul><p className="mt-small">Everything digital runs in this page. No account, Python installation, or video upload to a server is required.</p></div><div className="mt-card mt-guide-steps">{[
          ['Print + verify', 'Generate IDs 0–2 at 50 mm. Print at actual size, measure the black square, and attach one marker to a rigid object. Keep its white margin.'],
          ['Set the scene', 'Fix the camera facing the motion plane straight on. Put the ruler in that same plane. Mark A and B exactly 20 cm apart. Use one-way motion with the whole marker visible.'],
          ['Record + calibrate', 'Record a 5–10 second clip. Hold at A, move steadily to B, then hold. Load the clip, preview a clear frame, and pick two ruler points. Use an independent ruler measurement to check accuracy.'],
          ['Analyze + compare', 'Use 10 Hz to start. Run Analyze clip, open Trials, enter 20 cm, and save. Repeat at least three times with the same setup. Agree your error and detection limits before testing.'],
          ['Change one variable', 'Repeat at 10, 20, and 30 cm, then test lighting, distance from camera, marker size, or speed individually. Keep all other conditions fixed. Log what changed.'],
          ['Export the evidence', 'Save the raw CSV, graph, annotated footage, and trials table. Report distance error, detection rate, test conditions, and limitations. Physical measurements decide feasibility; the demo only checks the software.'],
        ].map(([title, body], i) => <div className="mt-guide-step" key={title}><span>{String(i + 1).padStart(2, '0')}</span><div><h3>{title}</h3><p>{body}</p></div></div>)}</div></div>
        <div className="mt-two-notes"><div><h3>What the numbers mean</h3><p><strong>Pixel coordinates:</strong> origin at the top left; Y increases downward. <strong>Calibrated position:</strong> origin at the bottom left; Y increases upward. <strong>Displacement:</strong> straight-line distance from the first detection. <strong>Rotation:</strong> in-plane angle change, positive counterclockwise. <strong>Detection rate:</strong> percentage of sampled frames with exactly one target ID.</p><p>Data uses the displayed analysis resolution, up to 960 × 720. Live sampling depends on device speed; timestamps record actual elapsed time. Video analysis seeks fixed timestamps. Neither reconstructs motion between samples.</p></div><div><h3>Know the limits</h3><p>Keep the camera still and movement at a constant depth. A single scale does not correct perspective or lens distortion. Use a larger reference near your motion area. Fast movement, blur, folds, reflections, tiny markers, and occlusion reduce reliability.</p><p>This is an engineering feasibility tool. It is not a clinical gait assessment, a 3D joint-angle tracker, or evidence that a prosthetic is safe to wear. Test first with objects or a bench fixture.</p></div></div>
        <div className="mt-faq"><h3>When something doesn’t work</h3><details><summary>My iPhone video will not load</summary><p>MOV is a container; codec support varies. Export the clip as H.264 MP4, or record future clips using iPhone Camera → Formats → Most Compatible. Trim to two minutes or less and under 500 MB. Portrait clips are supported.</p></details><details><summary>The camera is blocked</summary><p>Open the site directly in your browser over HTTPS. Allow camera access in the address bar. Close other apps using the camera, then retry Live camera. Uploading a recorded clip works without camera permission.</p></details><details><summary>The marker is missing or reports the wrong ID</summary><p>Generate the marker here using ARUCO_MIP_36h12. Use the full pattern with its white border. Face it toward the camera, add light, avoid motion blur, and move closer. Never use two copies of the same ID in one scene.</p></details><details><summary>The measurement is wrong</summary><p>Check print size with a ruler. Recalibrate after changing camera position, zoom, resolution, or depth. Keep reference and motion in the same plane. Finish at B: returning to A gives near-zero endpoint displacement. A stationary-marker recording can reveal jitter before motion tests.</p></details><details><summary>Annotated video export takes time</summary><p>The browser replays the clip while recording the overlay. Keep the tab visible and wait for the download. Output is a silent WebM or MP4 depending on the browser. Exported overlays update at the sampled analysis rate. If your browser cannot encode video, export an annotated PNG and CSV instead.</p></details></div>
        <div className="mt-resources"><span>BUILT ON OPEN TOOLS</span><a href="https://damianofalcioni.github.io/js-aruco2/" target="_blank" rel="noreferrer">js-aruco2 documentation <ArrowUpRight size={14} /></a><a href="https://docs.opencv.org/4.x/d5/dae/tutorial_aruco_detection.html" target="_blank" rel="noreferrer">OpenCV marker guide <ArrowUpRight size={14} /></a><a href="https://opensource.org/license/mit" target="_blank" rel="noreferrer">Open-source licensing <ArrowUpRight size={14} /></a></div>
      </section>
      <footer className="mt-footer"><span>CAPSTONE <span className="mt-divider">/</span> Motion Tracking Software</span><span>Idrees Nait + Abram · ATLAS</span></footer>
    </div>
    <div className="mt-print"><h1>CAPSTONE · Motion markers</h1><p>{DICTIONARY} · Print at 100% / actual size. Verify the black square with a ruler.</p>{generated.markers?.map(m => <div className="mt-print-marker" key={m.id}><div dangerouslySetInnerHTML={{ __html: m.svg }} /><p>ID {m.id} · {generatorSize} × {generatorSize} mm black square (white margin excluded)</p></div>)}</div>
  </main>;
}

function Metric({ label, value, unit }) { return <div className="mt-metric"><span>{label}</span><strong>{value}<small>{unit}</small></strong></div>; }
