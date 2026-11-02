import { makeDetector, drawDemo } from './markers.js';
import { MAX_SECONDS, MAX_FRAMES, markerGeometry, seriesFor } from './model.js';

const yieldFrame = () => new Promise(r => setTimeout(r, 0));
export function download(content, name, type = 'text/plain') {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function eventOnce(element, event, timeout = 15000) {
  return new Promise((resolve, reject) => {
    const done = err => { clearTimeout(timer); element.removeEventListener(event, ok); element.removeEventListener('error', fail); err ? reject(err) : resolve(); };
    const ok = () => done();
    const fail = () => done(new Error('This browser cannot decode this video. Export it as H.264 MP4 and try again.'));
    const timer = setTimeout(() => done(new Error('Video loading timed out. Try a shorter H.264 MP4.')), timeout);
    element.addEventListener(event, ok, { once: true }); element.addEventListener('error', fail, { once: true });
  });
}

export class Tracker {
  constructor(video, canvas, onChange, onError) {
    this.video = video; this.canvas = canvas; this.ctx = canvas.getContext('2d');
    this.input = document.createElement('canvas'); this.ictx = this.input.getContext('2d', { willReadFrequently: true });
    this.detector = makeDetector(); this.onChange = onChange; this.onError = onError;
    this.frames = []; this.target = 0; this.scale = null; this.fps = 10;
    this.mode = 'empty'; this.source = 'none'; this.busy = false; this.recording = false; this.complete = false;
    this.generation = 0; this.disposed = false; this.resize(960, 540); this.paintEmpty();
  }
  notify() { if (!this.disposed) this.onChange({ mode: this.mode, source: this.source, busy: this.busy, recording: this.recording,
    count: this.frames.length, scale: this.scale, complete: this.complete, width: this.canvas.width, height: this.canvas.height,
    duration: this.duration || 0, progress: this.progress || 0, time: this.frames.at(-1)?.t || 0,
    previewTime: this.source === 'video' ? this.video.currentTime : 0,
    currentMarkers: this.currentMarkers || [], filename: this.filename || '' }); }
  resize(w, h) {
    const f = Math.min(1, 960 / w, 720 / h);
    this.canvas.width = this.input.width = Math.round(w * f); this.canvas.height = this.input.height = Math.round(h * f);
  }
  paintEmpty() { this.ctx.fillStyle = '#0c131d'; this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height); }
  clearResults() { this.frames = []; this.complete = false; this.progress = 0; this.recording = false; this.liveBlob = null; this.captureFps = this.fps; }
  stopStream() { this.stream?.getTracks().forEach(t => t.stop()); this.stream = null; this.video.srcObject = null; }
  release() {
    this.generation++; cancelAnimationFrame(this.raf); this.video.pause(); this.stopStream();
    if (this.objectURL) URL.revokeObjectURL(this.objectURL);
    this.objectURL = null; this.video.removeAttribute('src'); this.video.load(); this.busy = false;
    this.recorder?.state === 'recording' && this.recorder.stop();
    this.liveRecorder?.state === 'recording' && this.liveRecorder.stop();
    this.calibration = null; this.paused = false;
    this.currentMarkers = []; this.filename = ''; this.duration = 0;
  }
  destroy() { this.disposed = true; this.release(); }
  async seek(t) {
    if (Math.abs(this.video.currentTime - t) < .00001 && this.video.readyState >= 2) return;
    const waited = eventOnce(this.video, 'seeked'); this.video.currentTime = t; await waited;
  }
  capture(t, append = false) {
    this.ictx.drawImage(this.video, 0, 0, this.input.width, this.input.height);
    return this.detect(t, append);
  }
  detect(t, append = false) {
    const markers = this.detector.detect(this.ictx.getImageData(0, 0, this.input.width, this.input.height)).map(m => ({
      id: m.id, corners: m.corners.map(p => ({ x: p.x, y: p.y })), hammingDistance: m.hammingDistance,
    }));
    this.currentMarkers = markers;
    if (append && this.frames.length < MAX_FRAMES) this.frames.push({ t, markers });
    this.paint(markers, t); return markers;
  }
  paint(markers = [], time = 0, history = this.frames) {
    const ctx = this.ctx; ctx.drawImage(this.input, 0, 0);
    let connected = false;
    ctx.strokeStyle = '#fa9a51'; ctx.lineWidth = 2; ctx.beginPath();
    for (const f of history.slice(-400)) {
      const found = f.markers.filter(m => m.id === this.target);
      if (found.length !== 1) { connected = false; continue; }
      const g = markerGeometry(found[0]); connected ? ctx.lineTo(g.x, g.y) : ctx.moveTo(g.x, g.y); connected = true;
    }
    ctx.stroke();
    for (const m of markers) {
      const c = m.corners, g = markerGeometry(m);
      ctx.strokeStyle = m.id === this.target ? '#ff9b54' : '#71ded1'; ctx.lineWidth = 3; ctx.beginPath();
      c.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)); ctx.closePath(); ctx.stroke();
      ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(g.x, g.y, 4, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(g.x, g.y); ctx.lineTo((c[0].x + c[1].x) / 2, (c[0].y + c[1].y) / 2); ctx.stroke();
      const text = `ID ${m.id}  (${g.x.toFixed(0)}, ${g.y.toFixed(0)}) px`;
      ctx.font = '14px monospace'; const tx = Math.max(4, Math.min(c[0].x, this.canvas.width - ctx.measureText(text).width - 12));
      const ty = Math.max(30, c[0].y - 8);
      ctx.fillStyle = '#101923'; ctx.fillRect(tx - 3, ty - 18, ctx.measureText(text).width + 12, 24);
      ctx.fillStyle = '#fff'; ctx.fillText(text, tx + 2, ty);
    }
    ctx.fillStyle = '#101923e8'; ctx.fillRect(0, this.canvas.height - 28, this.canvas.width, 28);
    ctx.fillStyle = '#fff'; ctx.font = '12px monospace';
    ctx.fillText(`${this.source === 'demo' ? 'SYNTHETIC DEMO' : '2D MOTION'}  ·  ${time.toFixed(2)} s  ·  ${this.scale ? `${(1 / this.scale).toFixed(2)} px/cm` : 'UNCALIBRATED · px'}`, 10, this.canvas.height - 10);
  }
  async load(file) {
    if (!file) return;
    if (file.size > 500 * 1024 * 1024) throw new Error('Choose a clip smaller than 500 MB. Trim it on your phone first.');
    this.release(); this.clearResults(); this.scale = null; this.source = 'video'; this.mode = 'loading'; this.busy = true; this.notify();
    const token = this.generation;
    this.objectURL = URL.createObjectURL(file); this.filename = file.name;
    const loaded = eventOnce(this.video, 'loadeddata'); this.video.src = this.objectURL; this.video.load();
    try {
      await loaded; if (token !== this.generation) return;
      this.duration = this.video.duration;
      if (!Number.isFinite(this.duration) || this.duration <= 0) throw new Error('This clip has no readable duration. Export it as H.264 MP4.');
      if (this.duration > MAX_SECONDS) throw new Error(`Trim the clip to ${MAX_SECONDS} seconds or less before loading.`);
      this.resize(this.video.videoWidth, this.video.videoHeight); this.capture(0); this.mode = 'ready';
    } catch (error) { this.mode = 'empty'; this.source = 'none'; throw error; }
    finally { if (token === this.generation) { this.busy = false; this.notify(); } }
  }
  async camera() {
    if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera access needs HTTPS and a supported browser. Open this page directly in Chrome or Safari.');
    this.release(); this.clearResults(); this.scale = null; this.source = 'camera'; this.mode = 'loading'; this.busy = true; this.notify();
    const token = this.generation;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false });
      if (token !== this.generation) { stream.getTracks().forEach(t => t.stop()); return; }
      this.stream = stream; this.video.srcObject = stream;
      await this.video.play(); if (token !== this.generation) return;
      this.resize(this.video.videoWidth, this.video.videoHeight);
      this.mode = 'live'; this.busy = false; this.lastSample = -1;
      const loop = () => {
        if (token !== this.generation) return;
        const now = performance.now();
        if (!this.paused && this.video.readyState >= 2 && now - this.lastSample >= 1000 / this.fps) {
          this.lastSample = now; const t = this.recording ? (now - this.started) / 1000 : 0;
          this.capture(t, this.recording); this.notify();
          if (this.recording && t >= MAX_SECONDS) this.stop();
        }
        this.raf = requestAnimationFrame(loop);
      }; loop();
    } catch (e) { this.mode = 'empty'; this.source = 'none'; this.busy = false; this.stopStream(); this.notify();
      throw new Error(e.name === 'NotAllowedError' ? 'Camera permission was blocked. Allow the camera in your browser’s address bar, then try again.' : `Camera unavailable: ${e.message}`); }
  }
  freezeCamera() {
    if (this.source !== 'camera') return;
    this.generation++; cancelAnimationFrame(this.raf); this.stopStream(); this.mode = 'frozen'; this.notify();
  }
  recordCamera() {
    this.clearResults(); this.started = performance.now(); this.lastSample = -1; this.recording = true; this.complete = false; this.notify();
    if (this.canvas.captureStream && window.MediaRecorder) {
      const mime = ['video/webm;codecs=vp8', 'video/mp4', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
      if (mime) {
        const capture = this.canvas.captureStream(30), chunks = [], token = this.generation;
        try {
          const recorder = this.liveRecorder = new MediaRecorder(capture, { mimeType: mime });
          recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
          recorder.onstop = () => { capture.getTracks().forEach(t => t.stop());
            // Finishing a live trial advances generation once; changing sources invalidates it.
            if (this.source === 'camera' && this.generation === token + 1) this.liveBlob = new Blob(chunks, { type: mime });
            this.notify(); };
          recorder.onerror = () => { capture.getTracks().forEach(t => t.stop()); this.onError(new Error('The browser could not record annotated footage. Your tracking data is still available.')); };
          recorder.start(500);
        } catch { capture.getTracks().forEach(t => t.stop()); this.onError(new Error('Annotated camera recording is unavailable. CSV and snapshots still work.')); }
      }
    }
  }
  async analyze() {
    this.clearResults(); this.busy = true; this.mode = 'analyzing'; this.notify();
    const token = ++this.generation;
    try {
      const n = Math.max(1, Math.ceil(this.duration * this.fps));
      for (let i = 0; i <= n; i++) {
        if (token !== this.generation) break;
        const t = Math.min(i / this.fps, Math.max(0, this.duration - .001));
        await this.seek(t); if (token !== this.generation) break;
        this.capture(t, true); this.progress = (i + 1) / (n + 1) * 100;
        this.notify(); await yieldFrame();
      }
      if (token === this.generation) { this.complete = true; this.mode = 'done'; }
    } catch (error) { if (token === this.generation) this.mode = 'stopped'; throw error; }
    finally { if (token === this.generation || this.mode === 'stopped') { this.busy = false; this.notify(); } }
  }
  async demo() {
    this.release(); this.clearResults(); this.source = 'demo'; this.mode = 'analyzing'; this.busy = true;
    this.scale = 1 / 12; this.demoTarget = this.target; this.captureFps = 10;
    this.calibration = { method: 'synthetic', referenceCm: 20 }; this.duration = 6; this.resize(640, 360); this.notify();
    const token = this.generation;
    try {
      for (let i = 0; i <= 60; i++) {
        if (token !== this.generation) break;
        drawDemo(this.ictx, i / 10, this.demoTarget); this.detect(i / 10, true); this.progress = i / 60 * 100;
        this.notify(); await yieldFrame();
      }
      if (token === this.generation) { this.complete = true; this.mode = 'done'; }
    } catch (error) { if (token === this.generation) this.mode = 'stopped'; throw error; }
    finally { if (token === this.generation || this.mode === 'stopped') { this.busy = false; this.notify(); } }
  }
  stop() {
    if (this.recording) {
      this.recording = false; this.complete = true;
      this.freezeCamera();
      if (this.liveRecorder?.state === 'recording') this.liveRecorder.stop();
    } else if (this.mode === 'exporting') {
      this.generation++; this.video.pause(); if (this.recorder?.state === 'recording') this.recorder.stop();
      this.mode = 'done'; this.busy = false;
    } else {
      this.generation++; this.video.pause(); this.busy = false; this.complete = false; this.mode = this.frames.length ? 'stopped' : 'ready';
    }
    this.notify();
  }
  // Export is a separate real-time replay. It never adds or alters analytical samples.
  async exportVideo() {
    if (this.source === 'camera') {
      if (!this.liveBlob?.size) throw new Error('No annotated live recording is available. Finish the trial and try again, or use Chrome to record a new trial. CSV and PNG exports are still available.');
      download(this.liveBlob, `motion-live-annotated.${this.liveBlob.type.includes('mp4') ? 'mp4' : 'webm'}`); return;
    }
    if (!this.frames.length || !['video', 'demo'].includes(this.source)) throw new Error('For annotated video, analyze an uploaded clip or run the demo. Live trials can export CSV and snapshots.');
    if (!this.canvas.captureStream || !window.MediaRecorder) throw new Error('Video export is unavailable here. Use Chrome on your laptop, or download an annotated PNG.');
    const mime = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/mp4', 'video/webm'].find(t => MediaRecorder.isTypeSupported(t));
    if (!mime) throw new Error('No supported video encoder. Try Chrome or export a PNG.');
    const before = this.mode; this.busy = true; this.mode = 'exporting'; this.notify();
    const stream = this.canvas.captureStream(30), chunks = [], token = ++this.generation;
    let failed = false;
    try {
      const rec = this.recorder = new MediaRecorder(stream, { mimeType: mime });
      rec.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise((resolve, reject) => { rec.onstop = resolve; rec.onerror = e => { failed = true; reject(e.error || new Error('Video encoding failed.')); }; });
      if (this.source === 'video') { await this.seek(0); this.video.playbackRate = 1; }
      rec.start(250);
      if (this.source === 'video') await this.video.play();
      const start = performance.now(), lastT = this.frames.at(-1).t;
      await new Promise(resolve => {
        const tick = () => {
          if (token !== this.generation || failed) return resolve();
          const t = this.source === 'demo' ? (performance.now() - start) / 1000 : this.video.currentTime;
          const index = this.frames.findIndex(f => f.t > t);
          const end = index < 0 ? this.frames.length : Math.max(1, index);
          const frame = this.frames[end - 1];
          if (this.source === 'demo') drawDemo(this.ictx, t, this.demoTarget);
          else this.ictx.drawImage(this.video, 0, 0, this.input.width, this.input.height);
          this.paint(frame.markers, t, this.frames.slice(0, end));
          this.progress = Math.min(100, t / Math.max(.1, lastT) * 100); this.notify();
          if (t >= lastT || this.video.ended || performance.now() - start > (lastT + 15) * 1000) resolve();
          else this.raf = requestAnimationFrame(tick);
        }; tick();
      });
      if (rec.state !== 'inactive') rec.stop(); await stopped;
      if (token === this.generation && !failed && chunks.length) download(new Blob(chunks, { type: mime }), `motion-${this.source === 'demo' ? 'DEMO-' : ''}annotated.${mime.includes('mp4') ? 'mp4' : 'webm'}`);
    } finally { stream.getTracks().forEach(t => t.stop()); this.video.pause(); this.recorder = null;
      this.busy = false; this.mode = before; this.notify(); }
  }
  snapshot() {
    return { frames: this.frames, target: this.target, scale: this.scale, width: this.canvas.width, height: this.canvas.height,
      source: this.source, filename: this.filename, calibration: this.calibration, fps: this.captureFps || this.fps, complete: this.complete };
  }
  series() { return seriesFor(this.frames, this.target, this.scale, this.canvas.height); }
}
