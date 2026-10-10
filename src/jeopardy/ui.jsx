import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Grid2X2, Maximize2, X, Check, Copy } from 'lucide-react';
import QRCode from 'qrcode';

export const formatScore = value => new Intl.NumberFormat('en-US').format(value);
export function Button({ children, variant = '', className = '', ...props }) {
  return <button className={`j-button ${variant ? `j-${variant}` : ''} ${className}`} {...props}>{children}</button>;
}
export function IconButton({ label, children, ...props }) {
  return <button className="j-icon-button" aria-label={label} title={label} {...props}>{children}</button>;
}
export function Header({ compact = false }) {
  return <header className="j-header">
    <Link className="j-brand" to="/jeopardy"><span className="j-brand-icon"><Grid2X2 size={22} /></span><span>GAME NIGHT<span className="j-brand-small">JEOPARDY STUDIO</span></span></Link>
    {!compact && <nav aria-label="Game navigation"><Link to="/jeopardy">My boards</Link><Link to="/jeopardy/buzzer">Join a game <ArrowUpRight size={15} /></Link></nav>}
    <Link className="j-portfolio-link" to="/"><ArrowLeft size={15} /> Portfolio</Link>
  </header>;
}
export function Modal({ title, children, onClose, wide = false }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return <dialog ref={ref} className={`j-modal ${wide ? 'j-modal-wide' : ''}`} aria-label={title}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === ref.current) onClose(); }}>
    <div className="j-modal-heading"><h2>{title}</h2><IconButton label="Close dialog" onClick={onClose}><X size={20} /></IconButton></div>
    {children}
  </dialog>;
}
export function QR({ value, label = 'Scan to join' }) {
  const [src, setSrc] = useState('');
  useEffect(() => {
    let live = true;
    QRCode.toDataURL(value, { width: 220, margin: 2, color: { dark: '#111126', light: '#ffffff' }, errorCorrectionLevel: 'M' })
      .then(url => { if (live) setSrc(url); }).catch(() => {});
    return () => { live = false; };
  }, [value]);
  return src ? <img className="j-qr" src={src} alt={label} width="180" height="180" /> : <div className="j-qr-placeholder">Use the link below</div>;
}
export function CopyLink({ value, label = 'Copy link' }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef(null);
  const copy = async () => {
    try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    catch { ref.current?.select(); }
  };
  return <div className="j-copy"><input ref={ref} aria-label={label} value={value} readOnly onFocus={event => event.target.select()} /><Button onClick={copy} variant="secondary">{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? 'Copied' : label}</Button></div>;
}
export async function fullscreen(element = document.documentElement) {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await element.requestFullscreen();
  } catch { /* Full viewport layout remains usable where browser fullscreen is unavailable. */ }
}
export function FullscreenButton() {
  return <IconButton label="Toggle fullscreen" onClick={() => fullscreen()}><Maximize2 size={19} /></IconButton>;
}
export function useAwake() {
  useEffect(() => {
    let lock, disposed = false;
    const acquire = async () => {
      if (document.visibilityState !== 'visible' || !navigator.wakeLock) return;
      try { const next = await navigator.wakeLock.request('screen'); if (disposed) next.release(); else lock = next; } catch { /* Optional on older devices. */ }
    };
    acquire();
    document.addEventListener('visibilitychange', acquire);
    return () => { disposed = true; lock?.release(); document.removeEventListener('visibilitychange', acquire); };
  }, []);
}
let audioContext;
export function unlockAudio() {
  try { const Audio = window.AudioContext || window.webkitAudioContext; audioContext ||= new Audio(); audioContext.resume(); } catch { /* Sound is optional. */ }
}
export function chime() {
  try {
    if (!audioContext || audioContext.state !== 'running') return;
    const oscillator = audioContext.createOscillator();
    const volume = audioContext.createGain();
    oscillator.type = 'sine'; oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime + 0.1);
    volume.gain.setValueAtTime(0.13, audioContext.currentTime);
    volume.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.35);
    oscillator.connect(volume); volume.connect(audioContext.destination); oscillator.start(); oscillator.stop(audioContext.currentTime + 0.36);
  } catch { /* Sound is optional. */ }
}
export function Timer({ end, remaining, offset = 0 }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 150); return () => clearInterval(timer); }, []);
  if (!end && remaining == null) return null;
  const seconds = Math.max(0, Math.ceil((end ? end - (now + offset) : remaining) / 1000));
  return <span className={`j-timer ${seconds <= 5 ? 'j-timer-low' : ''}`} aria-label={`${seconds} seconds`}>{seconds.toString().padStart(2, '0')}<small>SEC</small></span>;
}
