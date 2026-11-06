import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import "../capstone/motion.css";

export default function Capstone() {
  return (
    <main className="mt-app mt-hub">
      <nav className="mt-topbar">
        <a href="/#projects">
          <ArrowLeft size={16} /> Back to projects
        </a>
        <span>Idrees + Abram / ATLAS</span>
      </nav>

      <div className="mt-wrap">
        <h1>CAPSTONE</h1>
        <p className="mt-lead">
          Tools and tests for our capstone project. Idrees Nait + Abram.
        </p>

        <Link className="mt-project-link" to="/capstone/motion-tracking">
          <div className="mt-project-info">
            <h2>
              Motion Tracking Software <ArrowUpRight size={23} />
            </h2>
            <p>
              Track printed markers using a video or webcam. Calibrate the
              scale, measure movement, and save your results.
            </p>
            <span className="mt-text-link">
              Open the motion test <ArrowUpRight size={17} />
            </span>
          </div>
        </Link>

        <p className="mt-hub-note">More tests will go here as we build them.</p>
      </div>
    </main>
  );
}
