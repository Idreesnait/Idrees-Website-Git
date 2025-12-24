import { useEffect, useState } from "react";

export const StarBackground = () => {
  const [blobs, setBlobs] = useState([]);

  useEffect(() => {
    setBlobs([
      { id: 0, x: -16, y: -16, size: 520, cls: "bg-blob bg-orange-500/20" },
      { id: 1, x: 60, y: 6, size: 520, cls: "bg-blob2 bg-sky-500/15" },
      { id: 2, x: 28, y: 70, size: 560, cls: "bg-blob3 bg-emerald-500/10" },
    ]);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-[radial-gradient(1200px_circle_at_20%_15%,rgba(249,115,22,0.22),transparent_55%),radial-gradient(1000px_circle_at_80%_25%,rgba(14,165,233,0.16),transparent_55%),radial-gradient(900px_circle_at_50%_85%,rgba(34,197,94,0.12),transparent_60%)]" />

      {blobs.map((b) => (
        <div
          key={b.id}
          className={`absolute rounded-full blur-3xl ${b.cls}`}
          style={{
            left: `${b.x}%`,
            top: `${b.y}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
          }}
        />
      ))}

      <svg className="absolute inset-0 h-full w-full opacity-[0.06]" aria-hidden="true">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/10 to-background" />
    </div>
  );
};
