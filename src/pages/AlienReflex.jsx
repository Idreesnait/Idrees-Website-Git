import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const round = (n) => Math.round(n * 10) / 10;

function sigmoid(x) {
  return 1 / (1 + Math.exp(-x));
}

function weightedPick(items, weights, rng) {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < items.length; i++) {
    r -= weights[i];
    if (r <= 0) return items[i];
  }
  return items[items.length - 1];
}

function mulberry32(seed) {
  let t = seed >>> 0;
  return function () {
    t += 0x6d2b79f5;
    let x = t;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function sparkPath(values, w = 160, h = 44, pad = 6) {
  if (!values.length) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const dx = (w - pad * 2) / Math.max(1, values.length - 1);

  let d = "";
  for (let i = 0; i < values.length; i++) {
    const x = pad + i * dx;
    const y = pad + (h - pad * 2) * (1 - (values[i] - min) / span);
    d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
  }
  return d;
}

function fmtWeek(n) {
  return `Week ${n}`;
}

const INIT = {
  velocity: 58,
  quality: 62,
  insight: 50,
  trust: 56,
  burnout: 24,
  users: 48,
};

const TOTAL_POINTS = 10;

const DEFAULT_ALLOC = {
  ship: 4,
  bugs: 2,
  research: 2,
  refactor: 2,
  growth: 0,
};

const KEYS = ["ship", "bugs", "research", "refactor", "growth"];
const LABELS = {
  ship: { name: "Ship features", hint: "Speed + momentum, but quality risk if unchecked." },
  bugs: { name: "Fix bugs", hint: "Trust + quality. Slows flashy progress (a little)." },
  research: { name: "User research", hint: "Insight + product direction. Helps long-term outcomes." },
  refactor: { name: "Refactor", hint: "Quality + velocity over time. Costs short-term throughput." },
  growth: { name: "Growth push", hint: "Users up, but can burn trust if product isn’t ready." },
};

function ScorePill({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function Meter({ label, value, sub, tone = "indigo" }) {
  const pct = clamp(value, 0, 100);
  const toneClasses =
    tone === "emerald"
      ? "from-emerald-400/80 to-emerald-200/40"
      : tone === "amber"
      ? "from-amber-400/80 to-amber-200/40"
      : tone === "rose"
      ? "from-rose-400/80 to-rose-200/40"
      : "from-indigo-400/80 to-indigo-200/40";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{label}</div>
          <div className="mt-0.5 text-xs text-white/60">{sub}</div>
        </div>
        <div className="text-sm font-semibold text-white">{Math.round(pct)}</div>
      </div>
      <div className="mt-3 h-2.5 w-full rounded-full bg-white/10">
        <div
          className={`h-2.5 rounded-full bg-gradient-to-r ${toneClasses}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Card({ title, right, children }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.03] p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.6)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="text-sm font-semibold text-white">{title}</div>
        {right}
      </div>
      {children}
    </div>
  );
}

function TinyButton({ onClick, children, disabled, variant = "primary" }) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const cls =
    variant === "ghost"
      ? "bg-white/0 text-white/80 hover:bg-white/10 border border-white/10"
      : "bg-white text-slate-950 hover:bg-white/90";

  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${cls}`}>
      {children}
    </button>
  );
}

function SliderRow({ k, value, onChange, disabled }) {
  const max = TOTAL_POINTS;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-white">{LABELS[k].name}</div>
          <div className="mt-0.5 text-xs text-white/60">{LABELS[k].hint}</div>
        </div>
        <div className="min-w-[44px] text-right text-sm font-semibold text-white">{value}</div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={max}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(k, Number(e.target.value))}
          className="w-full accent-white"
        />
        <div className="flex gap-2">
          <button
            disabled={disabled || value === 0}
            onClick={() => onChange(k, value - 1)}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/0 text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            −
          </button>
          <button
            disabled={disabled || value === max}
            onClick={() => onChange(k, value + 1)}
            className="h-9 w-9 rounded-xl border border-white/10 bg-white/0 text-white/80 hover:bg-white/10 disabled:opacity-50"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}

// --- CORE SIM ---
function simulateWeek(state, alloc, rng) {
  const s = { ...state };

  const ship = alloc.ship;
  const bugs = alloc.bugs;
  const research = alloc.research;
  const refactor = alloc.refactor;
  const growth = alloc.growth;

  const lowQuality = (100 - s.quality) / 100;
  const burnoutPressure = sigmoid((s.burnout - 50) / 12);
  const trustFragility = sigmoid((55 - s.trust) / 10);

  const velocityDelta =
    ship * 1.6 -
    bugs * 0.6 -
    refactor * 1.0 +
    (refactor > 0 ? 0.8 : 0) +
    (s.quality > 70 ? 0.6 : 0) -
    burnoutPressure * 1.2;

  const qualityDelta =
    bugs * 1.4 +
    refactor * 1.6 -
    ship * (0.7 + lowQuality * 1.4) -
    growth * 0.2;

  const insightDelta = research * 1.9 - (research === 0 ? 1.1 : 0);

  const trustDelta =
    bugs * 0.9 +
    (s.quality - 60) * 0.04 +
    research * 0.25 -
    growth * (0.7 + trustFragility * 1.2 + lowQuality * 1.1);

  const burnoutDelta =
    ship * 1.1 +
    growth * 1.3 -
    research * 0.5 -
    refactor * 0.4 +
    (s.velocity > 75 ? 0.8 : 0);

  const readyGate = sigmoid((s.quality - 55) / 8) * sigmoid((s.trust - 50) / 8);
  const usersDelta =
    growth * (2.2 * readyGate + 0.5) +
    ship * (0.6 * readyGate) -
    (1 - readyGate) * (0.8 + lowQuality * 1.4);

  const badOdds = 0.12 + lowQuality * 0.14 + burnoutPressure * 0.1;
  const goodOdds = 0.12 + sigmoid((s.insight - 55) / 10) * 0.12 + sigmoid((s.trust - 55) / 10) * 0.08;

  const roll = rng();
  let event = null;

  if (roll < badOdds) {
    const pool = [
      {
        title: "Production incident",
        body: "A release breaks something important. Everyone drops what they’re doing.",
        effects: { quality: -3.5, trust: -4.5, velocity: -2.0, burnout: +3.5 },
      },
      {
        title: "Scope creep week",
        body: "Requests pile up. You ship more, but it’s messy and exhausting.",
        effects: { velocity: +1.0, quality: -3.0, burnout: +4.0 },
      },
      {
        title: "Churn spike",
        body: "Users bounce after a rough experience. It’s not fatal, but it’s loud.",
        effects: { users: -3.5, trust: -2.5 },
      },
    ];
    event = weightedPick(pool, [1, 1, 1], rng);
  } else if (roll > 1 - goodOdds) {
    const pool = [
      {
        title: "Clear insight",
        body: "Research reveals a strong direction. The team aligns fast.",
        effects: { insight: +4.5, velocity: +1.5, burnout: -2.0 },
      },
      {
        title: "Quality compounding",
        body: "Refactors pay off—everything feels smoother and faster.",
        effects: { quality: +3.5, velocity: +2.5 },
      },
      {
        title: "Word of mouth",
        body: "Users recommend you. Growth feels easy for once.",
        effects: { users: +4.0, trust: +2.0 },
      },
    ];
    event = weightedPick(pool, [1, 1, 1], rng);
  }

  s.velocity = clamp(s.velocity + velocityDelta, 0, 100);
  s.quality = clamp(s.quality + qualityDelta, 0, 100);
  s.insight = clamp(s.insight + insightDelta, 0, 100);
  s.trust = clamp(s.trust + trustDelta, 0, 100);
  s.burnout = clamp(s.burnout + burnoutDelta, 0, 100);
  s.users = clamp(s.users + usersDelta, 0, 100);

  if (event) {
    const e = event.effects;
    if (e.velocity) s.velocity = clamp(s.velocity + e.velocity, 0, 100);
    if (e.quality) s.quality = clamp(s.quality + e.quality, 0, 100);
    if (e.insight) s.insight = clamp(s.insight + e.insight, 0, 100);
    if (e.trust) s.trust = clamp(s.trust + e.trust, 0, 100);
    if (e.burnout) s.burnout = clamp(s.burnout + e.burnout, 0, 100);
    if (e.users) s.users = clamp(s.users + e.users, 0, 100);
  }

  const health =
    0.22 * s.velocity +
    0.26 * s.quality +
    0.18 * s.trust +
    0.18 * s.insight +
    0.16 * s.users -
    0.28 * s.burnout;

  return { next: s, event, health: clamp(health, 0, 100) };
}

// --- PAGE ---
export default function AlienReflex() {
  const navigate = useNavigate();

  const [seed, setSeed] = useState(() => Math.floor(Date.now() % 1e9));
  const rngRef = useRef(null);

  const [week, setWeek] = useState(1);
  const [state, setState] = useState({ ...INIT });
  const [alloc, setAlloc] = useState({ ...DEFAULT_ALLOC });
  const [log, setLog] = useState([]);
  const [history, setHistory] = useState({
    health: [],
    velocity: [],
    quality: [],
    insight: [],
    trust: [],
    burnout: [],
    users: [],
  });
  const [best, setBest] = useState(() => Number(localStorage.getItem("decision_engine_best") || 0));
  const [locked, setLocked] = useState(false);

  const usedPoints = useMemo(() => KEYS.reduce((a, k) => a + (alloc[k] || 0), 0), [alloc]);
  const remaining = TOTAL_POINTS - usedPoints;

  const healthNow = useMemo(() => {
    const h =
      0.22 * state.velocity +
      0.26 * state.quality +
      0.18 * state.trust +
      0.18 * state.insight +
      0.16 * state.users -
      0.28 * state.burnout;
    return clamp(h, 0, 100);
  }, [state]);

  useEffect(() => {
    rngRef.current = mulberry32(seed);
  }, [seed]);

  useEffect(() => {
    setHistory((h) => ({
      ...h,
      health: [round(healthNow)],
      velocity: [round(state.velocity)],
      quality: [round(state.quality)],
      insight: [round(state.insight)],
      trust: [round(state.trust)],
      burnout: [round(state.burnout)],
      users: [round(state.users)],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setOne(key, val) {
    if (locked) return;

    const nextVal = clamp(val, 0, TOTAL_POINTS);
    const current = alloc[key] || 0;
    const delta = nextVal - current;

    if (delta > 0 && remaining < delta) return;

    setAlloc((a) => ({ ...a, [key]: nextVal }));
  }

  function rebalanceToFit() {
    if (remaining >= 0) return;
    setAlloc((a) => {
      let total = KEYS.reduce((sum, k) => sum + (a[k] || 0), 0);
      if (total <= TOTAL_POINTS) return a;
      const b = { ...a };
      while (total > TOTAL_POINTS) {
        let maxK = KEYS[0];
        for (const k of KEYS) if ((b[k] || 0) > (b[maxK] || 0)) maxK = k;
        if ((b[maxK] || 0) === 0) break;
        b[maxK] -= 1;
        total -= 1;
      }
      return b;
    });
  }

  useEffect(() => {
    if (remaining < 0) rebalanceToFit();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usedPoints]);

  function nextWeek() {
    if (locked) return;
    if (usedPoints !== TOTAL_POINTS) return;

    setLocked(true);

    const rng = rngRef.current || Math.random;
    const { next, event, health } = simulateWeek(state, alloc, rng);

    const entry = {
      week,
      alloc: { ...alloc },
      event,
      snapshot: { ...next },
      health: round(health),
    };

    setState(next);
    setWeek((w) => w + 1);
    setLog((l) => [entry, ...l].slice(0, 6));

    setHistory((h) => {
      const push = (arr, v) => [...arr, round(v)].slice(-14);
      return {
        health: push(h.health, health),
        velocity: push(h.velocity, next.velocity),
        quality: push(h.quality, next.quality),
        insight: push(h.insight, next.insight),
        trust: push(h.trust, next.trust),
        burnout: push(h.burnout, next.burnout),
        users: push(h.users, next.users),
      };
    });

    if (health > best) {
      setBest(round(health));
      localStorage.setItem("decision_engine_best", String(round(health)));
    }

    setTimeout(() => setLocked(false), 120);
  }

  function resetRun() {
    const newSeed = Math.floor((Date.now() + Math.random() * 1e9) % 1e9);
    setSeed(newSeed);
    rngRef.current = mulberry32(newSeed);

    setWeek(1);
    setState({ ...INIT });
    setAlloc({ ...DEFAULT_ALLOC });
    setLog([]);
    setHistory({
      health: [round(healthNow)],
      velocity: [round(INIT.velocity)],
      quality: [round(INIT.quality)],
      insight: [round(INIT.insight)],
      trust: [round(INIT.trust)],
      burnout: [round(INIT.burnout)],
      users: [round(INIT.users)],
    });
    setLocked(false);
  }

  const canAdvance = usedPoints === TOTAL_POINTS && !locked;

  const headline = useMemo(() => {
    const h = healthNow;
    if (h >= 75) return { t: "You’re shipping *and* staying sane.", s: "Sustained product health. Keep balancing tradeoffs." };
    if (h >= 60) return { t: "Solid, but one metric is quietly yelling.", s: "Great products die from one ignored constraint." };
    if (h >= 45) return { t: "This is where most teams live.", s: "Progress is real, fragility is also real." };
    return { t: "The system is breaking.", s: "You can’t outrun quality, trust, or burnout forever." };
  }, [healthNow]);

  return (
    <div className="min-h-screen bg-[radial-gradient(1200px_circle_at_20%_10%,rgba(99,102,241,0.35),transparent_55%),radial-gradient(900px_circle_at_80%_20%,rgba(16,185,129,0.28),transparent_55%),radial-gradient(900px_circle_at_40%_85%,rgba(244,63,94,0.20),transparent_55%),linear-gradient(to_bottom,rgba(15,23,42,1),rgba(2,6,23,1))] px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/80">
              Product Simulation • One-file React
              <span className="h-1 w-1 rounded-full bg-white/40" />
              {fmtWeek(week)}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Decision Engine
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/70">
              Allocate 10 points each week. Watch velocity, quality, insight, trust, burnout, and users react.
              Optimize one thing too hard and the system pushes back.
            </p>

            <div className="mt-4">
              <button
                onClick={() => navigate(-1)}
                className="text-sm font-semibold text-white/80 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/50"
              >
                ← Back
              </button>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 md:w-[360px]">
            <ScorePill label="Health" value={`${Math.round(healthNow)}`} />
            <ScorePill label="Best" value={`${best}`} />
            <ScorePill label="Points used" value={`${usedPoints}/${TOTAL_POINTS}`} />
            <ScorePill label="Remaining" value={`${remaining}`} />
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card
              title="Allocate your week"
              right={
                <div className="flex items-center gap-2">
                  <TinyButton variant="ghost" onClick={resetRun} disabled={locked}>
                    New run
                  </TinyButton>
                  <TinyButton onClick={nextWeek} disabled={!canAdvance}>
                    Advance week →
                  </TinyButton>
                </div>
              }
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{headline.t}</div>
                  <div className="mt-1 text-xs text-white/60">{headline.s}</div>
                </div>
                <div className="hidden items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70 md:flex">
                  Tip: balanced doesn’t mean equal.
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {KEYS.map((k) => (
                  <SliderRow key={k} k={k} value={alloc[k]} disabled={locked} onChange={setOne} />
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 md:flex-row md:items-center md:justify-between">
                <div className="text-xs text-white/60">
                  {usedPoints !== TOTAL_POINTS ? (
                    <span>
                      Use exactly <span className="font-semibold text-white">{TOTAL_POINTS}</span> points to advance.
                    </span>
                  ) : (
                    <span>Locked in. Advance when ready.</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <TinyButton
                    variant="ghost"
                    disabled={locked}
                    onClick={() => setAlloc({ ship: 6, bugs: 1, research: 1, refactor: 1, growth: 1 })}
                  >
                    Ship-heavy
                  </TinyButton>
                  <TinyButton
                    variant="ghost"
                    disabled={locked}
                    onClick={() => setAlloc({ ship: 2, bugs: 3, research: 2, refactor: 3, growth: 0 })}
                  >
                    Stability
                  </TinyButton>
                  <TinyButton
                    variant="ghost"
                    disabled={locked}
                    onClick={() => setAlloc({ ship: 3, bugs: 2, research: 3, refactor: 2, growth: 0 })}
                  >
                    Insight
                  </TinyButton>
                </div>
              </div>
            </Card>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Meter label="Velocity" value={state.velocity} sub="How fast you can ship (this week)." tone="indigo" />
              <Meter label="Quality" value={state.quality} sub="Stability, polish, and resilience." tone="emerald" />
              <Meter label="Insight" value={state.insight} sub="Are you building the right thing?" tone="amber" />
              <Meter label="Trust" value={state.trust} sub="Do users believe you?" tone="indigo" />
              <Meter label="Burnout" value={state.burnout} sub="High burnout breaks everything." tone="rose" />
              <Meter label="Users" value={state.users} sub="Adoption and retention (soft score)." tone="emerald" />
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card
              title="Trend"
              right={<div className="text-xs text-white/60">last {history.health.length} weeks</div>}
            >
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-white">Product Health</div>
                  <div className="text-sm font-semibold text-white">{Math.round(healthNow)}</div>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  Not “maximize everything” — it rewards balance and punishes fragility.
                </div>

                <svg viewBox="0 0 160 44" className="mt-3 h-12 w-full">
                  <path d={sparkPath(history.health)} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="2" strokeLinecap="round" />
                  <path d={sparkPath(history.health)} fill="none" stroke="rgba(99,102,241,0.7)" strokeWidth="6" strokeLinecap="round" opacity="0.35" />
                </svg>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <MiniStat label="Velocity" v={history.velocity.at(-1)} />
                  <MiniStat label="Quality" v={history.quality.at(-1)} />
                  <MiniStat label="Insight" v={history.insight.at(-1)} />
                  <MiniStat label="Trust" v={history.trust.at(-1)} />
                  <MiniStat label="Burnout" v={history.burnout.at(-1)} tone="bad" />
                  <MiniStat label="Users" v={history.users.at(-1)} />
                </div>
              </div>
            </Card>

            <div className="mt-6">
              <Card title="Recent weeks" right={<div className="text-xs text-white/60">auto log</div>}>
                {log.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
                    Advance a week to generate outcomes and events.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {log.map((entry) => (
                      <div key={entry.week} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">{fmtWeek(entry.week)}</div>
                          <div className="text-xs font-semibold text-white/80">Health {entry.health}</div>
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          {KEYS.map((k) => (
                            <span
                              key={k}
                              className="rounded-full border border-white/10 bg-white/0 px-2 py-1 text-[11px] text-white/75"
                            >
                              {LABELS[k].name.split(" ")[0]} {entry.alloc[k]}
                            </span>
                          ))}
                        </div>

                        {entry.event ? (
                          <div className="mt-3 rounded-xl border border-white/10 bg-white/0 p-3">
                            <div className="text-xs font-semibold text-white">{entry.event.title}</div>
                            <div className="mt-1 text-xs text-white/60">{entry.event.body}</div>
                          </div>
                        ) : (
                          <div className="mt-3 text-xs text-white/50">
                            No major event. The system quietly drifted.
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-white/45">
          Built as a product-design sandbox: tradeoffs, feedback loops, and UX clarity.
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, v, tone }) {
  const value = typeof v === "number" ? Math.round(v) : 0;
  const cls = tone === "bad" ? "text-rose-200/90" : "text-white/80";
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/0 px-3 py-2">
      <div className="text-[11px] text-white/60">{label}</div>
      <div className={`text-xs font-semibold ${cls}`}>{value}</div>
    </div>
  );
}
