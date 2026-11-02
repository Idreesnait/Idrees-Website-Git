import { ArrowLeft, ArrowUpRight, ScanLine, Layers3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../capstone/motion.css';

export default function Capstone() {
  return <main className="mt-app mt-hub">
    <nav className="mt-topbar"><a href="/#projects"><ArrowLeft size={16} /> Back to projects</a><span>IDREES NAIT <span className="mt-divider">/</span> CAPSTONE</span></nav>
    <div className="mt-wrap">
      <div className="mt-eyebrow"><Layers3 size={15} /> ATLAS · CREATIVE TECHNOLOGY & DESIGN</div>
      <h1>CAPSTONE<span className="mt-dot">.</span></h1>
      <p className="mt-lead">A workspace for the questions, prototypes, and tests behind our modular prosthetic project.</p>
      <Link className="mt-project-link" to="/capstone/motion-tracking">
        <div className="mt-project-visual"><ScanLine size={74} strokeWidth={1} /><span className="mt-orbit one" /><span className="mt-orbit two" /><span className="mt-visual-label">01 / MEASURE MOTION</span></div>
        <div className="mt-project-info"><span className="mt-eyebrow">FEASIBILITY TOOL · AVAILABLE</span><h2>Motion Tracking Software <ArrowUpRight /></h2>
          <p>Turn a camera and printed markers into a repeatable 2D motion experiment. Generate markers, measure movement, and export your evidence.</p>
          <div className="mt-tags"><span>ArUco markers</span><span>Video + live camera</span><span>Trial comparison</span></div>
          <span className="mt-text-link">Open the workspace <ArrowUpRight size={17} /></span></div>
      </Link>
      <p className="mt-hub-note">More capstone tools and documentation will live here as the project develops.</p>
    </div>
  </main>;
}
