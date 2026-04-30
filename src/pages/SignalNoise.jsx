import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";



const W = 1120; 
const H = 720;

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const dist2 = (ax, ay, bx, by) => {
  const dx = ax - bx,
    dy = ay - by;
  return dx * dx + dy * dy;
};
const nowMs = () => (typeof performance !== "undefined" ? performance.now() : Date.now());
const rand = (a, b) => a + Math.random() * (b - a);

function useRafLoop(enabled, cb) {
  const cbRef = useRef(cb);
  cbRef.current = cb;

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    let last = nowMs();

    const loop = () => {
      const t = nowMs();
      const dt = Math.min(0.033, (t - last) / 1000);
      last = t;
      cbRef.current(dt, t);
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [enabled]);
}

/* -------------------------- UI PRIMITIVES -------------------------- */

function Glass({ children, className = "" }) {
  return (
    <div
      className={
        "rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md shadow-[0_18px_60px_-40px_rgba(0,0,0,0.45)] " +
        className
      }
    >
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", disabled }) {
  const base =
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed";
  const cls =
    variant === "ghost"
      ? "bg-white/65 text-slate-700 border border-black/10 hover:bg-white"
      : variant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-slate-900 text-white hover:bg-slate-800";
  return (
    <button type="button" className={`${base} ${cls}`} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-black/10 bg-white/90 p-5 shadow-[0_30px_110px_-70px_rgba(0,0,0,0.65)] backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
            <div className="mt-1 text-xs text-slate-500">Click outside to close</div>
          </div>
          <Btn variant="ghost" onClick={onClose}>
            Close
          </Btn>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function Bubbles({ filled, total = 3 }) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={
            "h-2.5 w-2.5 rounded-full border " +
            (i < filled ? "bg-slate-900 border-slate-900" : "bg-white/70 border-black/15")
          }
        />
      ))}
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "rounded-2xl px-3 py-2 text-sm font-semibold border transition " +
        (active ? "bg-slate-900 text-white border-slate-900" : "bg-white/65 text-slate-700 border-black/10 hover:bg-white")
      }
    >
      {children}
    </button>
  );
}

/* -------------------------- GAME CONTENT -------------------------- */

function spawnEdge() {
  const side = Math.floor(Math.random() * 4);
  if (side === 0) return { x: -30, y: rand(0, H) };
  if (side === 1) return { x: W + 30, y: rand(0, H) };
  if (side === 2) return { x: rand(0, W), y: -30 };
  return { x: rand(0, W), y: H + 30 };
}

function levelNeedXp(level) {
  return Math.floor(30 + level * 18 + level * level * 2.3);
}

function makeWall(x, y) {
  const w = 96;
  const h = 28;
  return {
    id: Math.floor(Math.random() * 1e9),
    x: clamp(x - w / 2, 12, W - w - 12),
    y: clamp(y - h / 2, 12, H - h - 12),
    w,
    h,
  };
}

function makeEnemy(kind, tSec, level, playerX, playerY) {
  const { x, y } = spawnEdge();

  const baseHp = 14 + level * 8 + tSec * 0.65;
  const baseSpeed = 54 + level * 5 + tSec * 0.32;

  const safe = dist2(x, y, playerX, playerY) > 240 * 240;

  if (kind === "brute") {
    const hp = baseHp * 2.15;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 16,
      hp,
      maxHp: hp,
      speed: baseSpeed * 0.62,
      wobble: rand(-1, 1),
      targetBias: rand(0.9, 1.1),
      safe,
      touchDmg: 14,
    };
  }

  if (kind === "runner") {
    const hp = baseHp * 0.9;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 10,
      hp,
      maxHp: hp,
      speed: baseSpeed * 1.38,
      wobble: rand(-1, 1),
      targetBias: rand(0.95, 1.22),
      safe,
      touchDmg: 9,
    };
  }

  if (kind === "medic") {
    const hp = baseHp * 1.05;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 11,
      hp,
      maxHp: hp,
      speed: baseSpeed * 0.95,
      wobble: rand(-1, 1),
      targetBias: rand(0.9, 1.1),
      safe,
      touchDmg: 10,
    };
  }

  if (kind === "frenzy") {
    
    const hp = baseHp * 1.0;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 11,
      hp,
      maxHp: hp,
      speed: baseSpeed * 1.03,
      wobble: rand(-1, 1),
      targetBias: rand(0.9, 1.15),
      safe,
      touchDmg: 11,
    };
  }

  if (kind === "architect") {
    const hp = baseHp * 1.25;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 13,
      hp,
      maxHp: hp,
      speed: baseSpeed * 0.75,
      wobble: rand(-1, 1),
      targetBias: rand(0.9, 1.1),
      safe,
      touchDmg: 11,
    };
  }

  if (kind === "spitter") {
    const hp = baseHp * 1.1;
    return {
      id: Math.floor(Math.random() * 1e9),
      kind,
      x,
      y,
      r: 12,
      hp,
      maxHp: hp,
      speed: baseSpeed * 0.78,
      wobble: rand(-1, 1),
      targetBias: rand(0.9, 1.1),
      safe,
      spitCd: rand(0.5, 1.1),
      touchDmg: 10,
    };
  }

  const hp = baseHp;
  return {
    id: Math.floor(Math.random() * 1e9),
    kind: "basic",
    x,
    y,
    r: 11,
    hp,
    maxHp: hp,
    speed: baseSpeed,
    wobble: rand(-1, 1),
    targetBias: rand(0.85, 1.15),
    safe,
    touchDmg: 10,
  };
}

function makeBullet(x, y, dx, dy, speed, dmg) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    id: Math.floor(Math.random() * 1e9),
    x,
    y,
    vx: ux * speed,
    vy: uy * speed,
    r: 4,
    dmg,
    life: 1.7,
    pierceLeft: 0,
  };
}

function makeEnemyProjectile(x, y, dx, dy) {
  const len = Math.hypot(dx, dy) || 1;
  const ux = dx / len;
  const uy = dy / len;
  return {
    id: Math.floor(Math.random() * 1e9),
    x,
    y,
    vx: ux * 220,
    vy: uy * 220,
    r: 5,
    life: 3.2,
  };
}

function makePickup(x, y, type, value = 0) {
 
  return {
    id: Math.floor(Math.random() * 1e9),
    x,
    y,
    r: type === "xp" ? 6 : 7,
    type,
    v: value,
    bob: rand(0, Math.PI * 2),
  };
}

/* -------------------------- UPGRADES (TIERS + LOCKED BATCHES) -------------------------- */




const UPGRADE_DEFS = [
  
  {
    key: "dmg",
    name: "Damage",
    desc: "More bullet damage (total +70%).",
    max: 3,
    baseCost: 26,
    minLevel: 1,
    statText: (t) => `${Math.round((0.70 * (t / 3)) * 100)}%`,
    applyTier: (p, tierDelta) => {
      const mult = 1 + (0.70 / 3) * tierDelta;
      return { ...p, dmg: p.dmg * mult };
    },
  },
  {
    key: "rate",
    name: "Fire rate",
    desc: "Shoot faster (total +65%).",
    max: 3,
    baseCost: 30,
    minLevel: 1,
    statText: (t) => `${Math.round((0.65 * (t / 3)) * 100)}%`,
    applyTier: (p, tierDelta) => {
      const per = 0.65 / 3;
      const factor = 1 - per * tierDelta;
      return { ...p, fireDelay: Math.max(0.05, p.fireDelay * factor) };
    },
  },
  {
    key: "speed",
    name: "Move speed",
    desc: "Move faster (total +35%).",
    max: 3,
    baseCost: 20,
    minLevel: 1,
    statText: (t) => `${Math.round((0.35 * (t / 3)) * 100)}%`,
    applyTier: (p, tierDelta) => {
      const mult = 1 + (0.35 / 3) * tierDelta;
      return { ...p, moveSpeed: p.moveSpeed * mult };
    },
  },
  {
    key: "hp",
    name: "Max HP",
    desc: "More HP (total +45).",
    max: 3,
    baseCost: 26,
    minLevel: 1,
    statText: (t) => `+${Math.round((45 * (t / 3)))} HP`,
    applyTier: (p, tierDelta) => {
      const add = (45 / 3) * tierDelta;
      return { ...p, maxHp: p.maxHp + add, hp: p.hp + add };
    },
  },
  {
    key: "regen",
    name: "Regen",
    desc: "Heal over time (total +0.75/s).",
    max: 3,
    baseCost: 22,
    minLevel: 1,
    statText: (t) => `+${(0.75 * (t / 3)).toFixed(2)}/s`,
    applyTier: (p, tierDelta) => {
      const add = (0.75 / 3) * tierDelta;
      return { ...p, regen: p.regen + add };
    },
  },
  {
    key: "magnet",
    name: "XP magnet",
    desc: "Pull pickups from farther (total +60%).",
    max: 3,
    baseCost: 18,
    minLevel: 1,
    statText: (t) => `${Math.round((0.60 * (t / 3)) * 100)}%`,
    applyTier: (p, tierDelta) => {
      const mult = 1 + (0.60 / 3) * tierDelta;
      return { ...p, magnet: p.magnet * mult };
    },
  },

  {
    key: "pierce",
    name: "Pierce",
    desc: "Bullets pass through enemies (total +3).",
    max: 3,
    baseCost: 42,
    minLevel: 3,
    statText: (t) => `+${t} pierce`,
    applyTier: (p, tierDelta) => {
      const next = Math.min(3, p.pierce + tierDelta);
      return { ...p, pierce: next };
    },
  },
  {
    key: "bullet",
    name: "Bullet speed",
    desc: "Bullets travel faster (total +50%).",
    max: 3,
    baseCost: 18,
    minLevel: 3,
    statText: (t) => `${Math.round((0.50 * (t / 3)) * 100)}%`,
    applyTier: (p, tierDelta) => {
      const mult = 1 + (0.50 / 3) * tierDelta;
      return { ...p, bulletSpeed: p.bulletSpeed * mult };
    },
  },
  {
    key: "shield",
    name: "Start Shield",
    desc: "Start each level with a shield = 20% HP (stronger tiers).",
    max: 3,
    baseCost: 30,
    minLevel: 3,
    statText: (t) => `${Math.round((0.20 + 0.08 * (t - 1)) * 100)}% HP shield`,
    applyTier: (p, tierDelta) => {
      const cur = p.shieldPctPerLevel || 0.20;
      const next = Math.min(0.36, cur + 0.08 * tierDelta);
      return { ...p, shieldPctPerLevel: next };
    },
  },

  {
    key: "lifesteal",
    name: "Lifesteal",
    desc: "Heal on kill (total +18 HP per kill).",
    max: 3,
    baseCost: 36,
    minLevel: 5,
    statText: (t) => `+${Math.round(18 * (t / 3))} HP/kill`,
    applyTier: (p, tierDelta) => {
      const add = (18 / 3) * tierDelta;
      return { ...p, lifesteal: (p.lifesteal || 0) + add };
    },
  },
  {
    key: "armor",
    name: "Armor",
    desc: "Reduce incoming damage (total -25%).",
    max: 3,
    baseCost: 38,
    minLevel: 5,
    statText: (t) => `-${Math.round((0.25 * (t / 3)) * 100)}% dmg`,
    applyTier: (p, tierDelta) => {
      const add = (0.25 / 3) * tierDelta;
      return { ...p, armor: clamp((p.armor || 0) + add, 0, 0.25) };
    },
  },
];

function tierCost(def, tierIndexNext, level) {
  const levelTax = 1 + Math.min(0.55, level * 0.025);
  const tierMult = tierIndexNext === 1 ? 1 : tierIndexNext === 2 ? 1.55 : 2.15;
  return Math.floor(def.baseCost * tierMult * levelTax);
}

/* -------------------------- ABILITIES (WEAPONS TAB) -------------------------- */

const ABILITY_DEFS = [
  {
    key: "burst",
    name: "Starburst",
    desc: "Big burst of bullets in all directions.",
    cd: 6.0,
    minLevel: 2,
    cost: (lvl) => Math.floor(45 * (1 + Math.min(0.5, lvl * 0.02))),
    cast: ({ p, bullets }) => {
      const count = 18;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        const dx = Math.cos(a);
        const dy = Math.sin(a);
        const b = makeBullet(p.x, p.y, dx, dy, p.bulletSpeed * 0.95, p.dmg * 0.75);
        b.pierceLeft = Math.min(1, p.pierce);
        bullets.push(b);
      }
    },
  },
  {
    key: "laser",
    name: "Laser Line",
    desc: "Instant beam in a direction (hits many enemies).",
    cd: 4.0,
    minLevel: 4,
    cost: (lvl) => Math.floor(70 * (1 + Math.min(0.5, lvl * 0.03))),
    cast: ({ p, enemies }) => {
      if (!enemies.length) return;
      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const d = dist2(p.x, p.y, e.x, e.y);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }
      const t = enemies[bestI];
      const dx = t.x - p.x;
      const dy = t.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;

      const width = 26;
      const dmg = p.dmg * 2.25;

      for (const e of enemies) {
        const px = e.x - p.x;
        const py = e.y - p.y;
        const proj = px * ux + py * uy;
        if (proj < 0) continue;
        const perp = Math.abs(px * uy - py * ux);
        if (perp < width + e.r) {
          e.hp -= dmg;
        }
      }
    },
  },
  {
    key: "turret",
    name: "Turret",
    desc: "Place a turret that auto-shoots for 10s.",
    cd: 10.0,
    minLevel: 3,
    cost: (lvl) => Math.floor(60 * (1 + Math.min(0.5, lvl * 0.02))),
    cast: ({ p, turrets }) => {
      turrets.push({
        id: Math.floor(Math.random() * 1e9),
        x: p.x,
        y: p.y,
        r: 10,
        life: 10.0,
        shootCd: 0,
      });
    },
  },
  {
    key: "clone",
    name: "Clone Decoy",
    desc: "Spawn a decoy clone. Enemies may target it.",
    cd: 8.0,
    minLevel: 5,
    cost: (lvl) => Math.floor(85 * (1 + Math.min(0.6, lvl * 0.02))),
    cast: ({ p, decoys }) => {
      decoys.push({
        id: Math.floor(Math.random() * 1e9),
        x: clamp(p.x + rand(-80, 80), 30, W - 30),
        y: clamp(p.y + rand(-80, 80), 30, H - 30),
        r: 14,
        hp: Math.max(40, p.maxHp * 0.55),
        life: 12.0,
      });
    },
  },
];

const BIND_UPGRADES = [
  { key: "bindX", name: "Bind X", desc: "Unlock X ability slot.", minLevel: 1, cost: (lvl) => Math.floor(25 * (1 + lvl * 0.02)) },
  { key: "bindC", name: "Bind C", desc: "Unlock C ability slot.", minLevel: 3, cost: (lvl) => Math.floor(45 * (1 + lvl * 0.02)) },
  { key: "bindZ", name: "Bind Z", desc: "Unlock Z ability slot.", minLevel: 5, cost: (lvl) => Math.floor(65 * (1 + lvl * 0.02)) },
];

/* -------------------------- MAIN COMPONENT -------------------------- */

export default function SignalNoise() {
  const navigate = useNavigate();

  const [showHowTo, setShowHowTo] = useState(false);
  useEffect(() => {
    const seen = localStorage.getItem("survivor_arena_seen_howto");
    if (!seen) {
      setShowHowTo(true);
      localStorage.setItem("survivor_arena_seen_howto", "1");
    }
  }, []);

  const bestKey = "survivor_arena_best_device";
  const [bestDevice, setBestDevice] = useState(() => Number(localStorage.getItem(bestKey) || 0));
  const sessionBestRef = useRef(0);

  const unlockedKey = "survivor_arena_unlocked_level";
  const [unlockedLevel, setUnlockedLevel] = useState(() =>
    Math.max(1, Number(localStorage.getItem(unlockedKey) || 1))
  );

  const [phase, setPhase] = useState("menu"); 
  const [paused, setPaused] = useState(false);

  const phaseRef = useRef(phase);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  const [tStartMs, setTStartMs] = useState(0);
  const [timeAlive, setTimeAlive] = useState(0);

  const keys = useRef({ up: false, down: false, left: false, right: false });

  const playerRef = useRef({
    x: W / 2,
    y: H / 2,
    r: 12,

    hp: 120,
    maxHp: 120,
    regen: 0.08,

    moveSpeed: 240,
    dmg: 18,
    fireDelay: 0.20,
    bulletSpeed: 560,
    pierce: 0,

    magnet: 135,

    iFrames: 0,

    // temp buffs until timestamps
    frenzyUntil: 0,
    hasteUntil: 0,
    orangeSpeedUntil: 0,
    orangeFireUntil: 0,

    // level shield
    shield: 0,
    shieldPctPerLevel: 0.20,

    // late upgrades
    lifesteal: 0,
    armor: 0,
  });

  const enemiesRef = useRef([]);
  const bulletsRef = useRef([]);
  const pickupsRef = useRef([]);
  const wallsRef = useRef([]);
  const enemyShotsRef = useRef([]);

  const turretsRef = useRef([]);
  const decoysRef = useRef([]);

  const spawnAccRef = useRef(0);
  const shootAccRef = useRef(0);

  const [ui, setUi] = useState({
    level: 1,
    levelXp: 0,
    levelNeed: levelNeedXp(1),

    xpBank: 0,
    kills: 0,
    score: 0,
    message: "",
  });

  const [tiers, setTiers] = useState(() => {
    const raw = localStorage.getItem("survivor_arena_upgrade_tiers");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {}
    }
    return {};
  });
  useEffect(() => {
    localStorage.setItem("survivor_arena_upgrade_tiers", JSON.stringify(tiers || {}));
  }, [tiers]);

  const [abilityOwned, setAbilityOwned] = useState(() => {
    const raw = localStorage.getItem("survivor_arena_ability_owned");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : {};
      } catch {}
    }
    return {};
  });
  useEffect(() => {
    localStorage.setItem("survivor_arena_ability_owned", JSON.stringify(abilityOwned || {}));
  }, [abilityOwned]);

  const [binds, setBinds] = useState(() => {
    const raw = localStorage.getItem("survivor_arena_binds");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : { X: null, C: null, Z: null };
      } catch {}
    }
    return { X: null, C: null, Z: null };
  });
  useEffect(() => {
    localStorage.setItem("survivor_arena_binds", JSON.stringify(binds || {}));
  }, [binds]);

  const [bindUnlocked, setBindUnlocked] = useState(() => {
    const raw = localStorage.getItem("survivor_arena_bind_unlocked");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === "object" ? parsed : { X: true, C: false, Z: false };
      } catch {}
    }
    return { X: true, C: false, Z: false };
  });
  useEffect(() => {
    localStorage.setItem("survivor_arena_bind_unlocked", JSON.stringify(bindUnlocked || {}));
  }, [bindUnlocked]);

  const cdsRef = useRef({}); 

  const [levelBanner, setLevelBanner] = useState({ show: false, text: "" });

  const [shopTab, setShopTab] = useState("upgrades");  

  const bg = useMemo(() => {
    return `radial-gradient(1200px_circle_at_12%_10%,rgba(79,70,229,0.12),transparent_60%),
            radial-gradient(900px_circle_at_82%_22%,rgba(5,150,105,0.10),transparent_62%),
            radial-gradient(900px_circle_at_45%_88%,rgba(225,29,72,0.08),transparent_60%),
            linear-gradient(to_bottom,rgba(248,250,252,1),rgba(241,245,249,1))`;
  }, []);

  function getEffectiveFireDelay(p, tMs) {
    const frenzy = tMs < p.frenzyUntil;
    const orangeFire = tMs < p.orangeFireUntil;
    if (frenzy && orangeFire) return Math.max(0.045, p.fireDelay * 0.30);
    if (frenzy) return Math.max(0.045, p.fireDelay * 0.35);
    if (orangeFire) return Math.max(0.055, p.fireDelay * 0.55);
    return p.fireDelay;
  }

  function getEffectiveMoveSpeed(p, tMs) {
    const haste = tMs < p.hasteUntil;
    const orangeSpeed = tMs < p.orangeSpeedUntil;
    let mult = 1;
    if (haste) mult *= 1.55;
    if (orangeSpeed) mult *= 1.5;
    return p.moveSpeed * mult;
  }

  function refreshForLevel(level) {
    enemiesRef.current = [];
    bulletsRef.current = [];
    pickupsRef.current = [];
    wallsRef.current = [];
    enemyShotsRef.current = [];
    turretsRef.current = [];
    decoysRef.current = [];
    spawnAccRef.current = 0;
    shootAccRef.current = 0;

    const p = playerRef.current;
    p.x = W / 2;
    p.y = H / 2;

    const shieldPct = p.shieldPctPerLevel || 0.20;
    p.shield = Math.max(p.shield, p.maxHp * shieldPct);
    p.iFrames = 0.75;

    setUi((s) => ({
      ...s,
      level,
      levelXp: 0,
      levelNeed: levelNeedXp(level),
      message: `Level ${level} started.`,
    }));
  }

  function applyAllTiersToFreshPlayer(p0) {
    let p = { ...p0 };
    for (const def of UPGRADE_DEFS) {
      const t = clamp(Number(tiers?.[def.key] || 0), 0, def.max);
      for (let i = 0; i < t; i++) p = def.applyTier(p, 1);
    }
    return p;
  }

  function resetRun(startLevel = 1) {
    const base = {
      x: W / 2,
      y: H / 2,
      r: 12,

      hp: 130,
      maxHp: 130,
      regen: 0.10,

      moveSpeed: 250,
      dmg: 20,
      fireDelay: 0.20,
      bulletSpeed: 590,
      pierce: 0,

      magnet: 140,

      iFrames: 0,

      frenzyUntil: 0,
      hasteUntil: 0,
      orangeSpeedUntil: 0,
      orangeFireUntil: 0,

      shield: 0,
      shieldPctPerLevel: 0.20,

      lifesteal: 0,
      armor: 0,
    };

    playerRef.current = applyAllTiersToFreshPlayer(base);

    setUi({
      level: startLevel,
      levelXp: 0,
      levelNeed: levelNeedXp(startLevel),
      xpBank: 0,
      kills: 0,
      score: 0,
      message: "",
    });

    setPaused(false);
    setLevelBanner({ show: false, text: "" });

    refreshForLevel(startLevel);
  }

  function start(startLevel = 1) {
    resetRun(startLevel);
    setPhase("play");
    const t = nowMs();
    setTStartMs(t);
    setTimeAlive(0);
  }

  function gameOver() {
    setPhase("over");
    setPaused(false);
  }

  function completeLevelAndShop(nextLevel) {
    setLevelBanner({ show: true, text: `LEVEL ${ui.level} COMPLETE` });
    setTimeout(() => setLevelBanner({ show: false, text: "" }), 900);

    setTimeout(() => {
      setUi((s) => ({
        ...s,
        level: nextLevel,
        levelXp: 0,
        levelNeed: levelNeedXp(nextLevel),
        message: `Shop: spend XP, then start Level ${nextLevel}.`,
      }));

      setUnlockedLevel((u) => {
        const nu = Math.max(u, nextLevel);
        localStorage.setItem(unlockedKey, String(nu));
        return nu;
      });

      setShopTab("upgrades");
      setPhase("shop");
      setPaused(false);
    }, 520);
  }

  function startNextLevel() {
    refreshForLevel(ui.level);
    setPhase("play");
    setPaused(false);
  }

  function tryBuyUpgrade(def) {
    if (ui.level < def.minLevel) return;
    const cur = clamp(Number(tiers?.[def.key] || 0), 0, def.max);
    if (cur >= def.max) return;

    const nextTier = cur + 1;
    const cost = tierCost(def, nextTier, ui.level);

    if (ui.xpBank < cost) {
      setUi((s) => ({ ...s, message: "Not enough XP." }));
      return;
    }

    setUi((s) => ({ ...s, xpBank: s.xpBank - cost, message: `Bought ${def.name} (Tier ${nextTier}/3)` }));
    setTiers((t) => ({ ...(t || {}), [def.key]: nextTier }));

    playerRef.current = def.applyTier(playerRef.current, 1);
  }

  function tryBuyAbility(ab) {
    if (ui.level < ab.minLevel) return;
    if (abilityOwned?.[ab.key]) return;
    const cost = ab.cost(ui.level);
    if (ui.xpBank < cost) {
      setUi((s) => ({ ...s, message: "Not enough XP." }));
      return;
    }
    setUi((s) => ({ ...s, xpBank: s.xpBank - cost, message: `Unlocked ability: ${ab.name}` }));
    setAbilityOwned((o) => ({ ...(o || {}), [ab.key]: true }));
  }

  function tryBuyBind(bindKey) {
    const item = BIND_UPGRADES.find((b) => b.key === bindKey);
    if (!item) return;
    if (ui.level < item.minLevel) return;

    const slot = bindKey === "bindX" ? "X" : bindKey === "bindC" ? "C" : "Z";
    if (bindUnlocked?.[slot]) return;

    const cost = item.cost(ui.level);
    if (ui.xpBank < cost) {
      setUi((s) => ({ ...s, message: "Not enough XP." }));
      return;
    }
    setUi((s) => ({ ...s, xpBank: s.xpBank - cost, message: `Unlocked ${slot} slot.` }));
    setBindUnlocked((b) => ({ ...(b || {}), [slot]: true }));
  }

  function setBind(slot, abilityKey) {
    if (!bindUnlocked?.[slot]) return;
    if (!abilityKey) return;
    if (!abilityOwned?.[abilityKey]) return;
    setBinds((b) => ({ ...(b || {}), [slot]: abilityKey }));
    setUi((s) => ({ ...s, message: `Bound ${abilityKey} to ${slot}.` }));
  }

  function castBound(slot) {
    const abilityKey = binds?.[slot];
    if (!abilityKey) return;

    const ab = ABILITY_DEFS.find((a) => a.key === abilityKey);
    if (!ab) return;

    const t = nowMs();
    const readyAt = cdsRef.current[abilityKey] || 0;
    if (t < readyAt) return;

    cdsRef.current[abilityKey] = t + ab.cd * 1000;

    ab.cast({
      p: playerRef.current,
      enemies: enemiesRef.current,
      bullets: bulletsRef.current,
      turrets: turretsRef.current,
      decoys: decoysRef.current,
    });

    setUi((s) => ({ ...s, message: `Cast: ${ab.name}` }));
  }

  /* -------------------------- INPUT -------------------------- */

  useEffect(() => {
    const down = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.up = true;
      if (k === "s" || k === "arrowdown") keys.current.down = true;
      if (k === "a" || k === "arrowleft") keys.current.left = true;
      if (k === "d" || k === "arrowright") keys.current.right = true;

      if (k === "p") {
        if (phaseRef.current === "play") setPaused((p) => !p);
      }

      if (k === "r") {
        if (phaseRef.current === "play" || phaseRef.current === "shop" || phaseRef.current === "over") start(ui.level);
      }

      if (k === "h") setShowHowTo(true);

    
      if (phaseRef.current === "play" && !paused) {
        if (k === "x") castBound("X");
        if (k === "c") castBound("C");
        if (k === "z") castBound("Z");
      }
    };

    const up = (e) => {
      const k = e.key.toLowerCase();
      if (k === "w" || k === "arrowup") keys.current.up = false;
      if (k === "s" || k === "arrowdown") keys.current.down = false;
      if (k === "a" || k === "arrowleft") keys.current.left = false;
      if (k === "d" || k === "arrowright") keys.current.right = false;
    };

    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [ui.level, paused, binds]);

  /* -------------------------- LOOP -------------------------- */

  useRafLoop(phase === "play" && !paused, (dt) => {
    const p = playerRef.current;
    const enemies = enemiesRef.current;
    const bullets = bulletsRef.current;
    const pickups = pickupsRef.current;
    const walls = wallsRef.current;
    const enemyShots = enemyShotsRef.current;
    const turrets = turretsRef.current;
    const decoys = decoysRef.current;

    const tMs = nowMs();
    const alive = (tMs - tStartMs) / 1000;
    setTimeAlive(alive);

    if (p.regen > 0) p.hp = Math.min(p.maxHp, p.hp + p.regen * dt);

    p.iFrames = Math.max(0, p.iFrames - dt);

    for (let i = decoys.length - 1; i >= 0; i--) {
      const d = decoys[i];
      d.life -= dt;
      if (d.life <= 0 || d.hp <= 0) decoys.splice(i, 1);
    }

    for (let i = turrets.length - 1; i >= 0; i--) {
      const t = turrets[i];
      t.life -= dt;
      if (t.life <= 0) {
        turrets.splice(i, 1);
        continue;
      }
      t.shootCd -= dt;
      if (t.shootCd <= 0 && enemies.length) {
        t.shootCd = 0.20;
        let bestI = 0;
        let bestD = Infinity;
        for (let j = 0; j < enemies.length; j++) {
          const e = enemies[j];
          const d2 = dist2(t.x, t.y, e.x, e.y);
          if (d2 < bestD) {
            bestD = d2;
            bestI = j;
          }
        }
        const e = enemies[bestI];
        const b = makeBullet(t.x, t.y, e.x - t.x, e.y - t.y, p.bulletSpeed * 0.9, p.dmg * 0.55);
        b.pierceLeft = 0;
        bullets.push(b);
      }
    }

    
    let mx = 0,
      my = 0;
    if (keys.current.left) mx -= 1;
    if (keys.current.right) mx += 1;
    if (keys.current.up) my -= 1;
    if (keys.current.down) my += 1;

    const speedNow = getEffectiveMoveSpeed(p, tMs);

    if (mx !== 0 || my !== 0) {
      const mlen = Math.hypot(mx, my) || 1;
      mx /= mlen;
      my /= mlen;
      p.x += mx * speedNow * dt;
      p.y += my * speedNow * dt;
    }

    for (const w of walls) {
      const cx = clamp(p.x, w.x, w.x + w.w);
      const cy = clamp(p.y, w.y, w.y + w.h);
      const dx = p.x - cx;
      const dy = p.y - cy;
      if (dx * dx + dy * dy < p.r * p.r) {
        if (Math.abs(dx) > Math.abs(dy)) p.x += dx > 0 ? 6 : -6;
        else p.y += dy > 0 ? 6 : -6;
      }
    }
    p.x = clamp(p.x, p.r, W - p.r);
    p.y = clamp(p.y, p.r, H - p.r);

    const level = ui.level;
    const within = alive; 
    const spawnRate = 0.78 + within / 32 + level * 0.16;
    spawnAccRef.current += dt * spawnRate;

    const pickKind = () => {
      const r = Math.random();
      const l = level;

      let basicW = 0.58;
      let bruteW = Math.min(0.18, 0.08 + l * 0.015);
      let medicW = l >= 2 ? 0.10 : 0.0;
      let frenzyW = l >= 2 ? 0.10 : 0.0;
      let runnerW = l >= 3 ? 0.12 : 0.0;
      let archW = l >= 4 ? 0.08 : 0.0;
      let spitW = l >= 4 ? 0.10 : 0.0;

      const sum = basicW + bruteW + medicW + frenzyW + runnerW + archW + spitW;
      basicW /= sum;
      bruteW /= sum;
      medicW /= sum;
      frenzyW /= sum;
      runnerW /= sum;
      archW /= sum;
      spitW /= sum;

      let a = basicW;
      if (r < a) return "basic";
      a += bruteW;
      if (r < a) return "brute";
      a += medicW;
      if (r < a) return "medic";
      a += frenzyW;
      if (r < a) return "frenzy";
      a += runnerW;
      if (r < a) return "runner";
      a += archW;
      if (r < a) return "architect";
      return "spitter";
    };

    while (spawnAccRef.current >= 1) {
      spawnAccRef.current -= 1;
      const kind = pickKind();
      const e = makeEnemy(kind, within, level, p.x, p.y);
      enemies.push(e.safe ? e : { ...e, x: e.x + rand(-200, 200), y: e.y + rand(-200, 200) });
    }

    const getTarget = (e) => {
      if (!decoys.length) return { x: p.x, y: p.y, isPlayer: true, ref: null };
      let best = { x: p.x, y: p.y, isPlayer: true, ref: null };
      let bestD = dist2(e.x, e.y, p.x, p.y);
      for (const d of decoys) {
        const dd = dist2(e.x, e.y, d.x, d.y);
        if (dd < bestD) {
          bestD = dd;
          best = { x: d.x, y: d.y, isPlayer: false, ref: d };
        }
      }
      return best;
    };

    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      const tgt = getTarget(e);

      const dx0 = (tgt.x - e.x) * e.targetBias;
      const dy0 = (tgt.y - e.y) * e.targetBias;
      const d0 = Math.hypot(dx0, dy0) || 1;

      const wx = (-dy0 / d0) * e.wobble;
      const wy = (dx0 / d0) * e.wobble;

      let ux = dx0 / d0 + wx * 0.35;
      let uy = dy0 / d0 + wy * 0.35;

      
      for (const w of walls) {
        const nx = e.x + ux * e.speed * dt;
        const ny = e.y + uy * e.speed * dt;
        const cx = clamp(nx, w.x, w.x + w.w);
        const cy = clamp(ny, w.y, w.y + w.h);
        const ddx = nx - cx;
        const ddy = ny - cy;
        if (ddx * ddx + ddy * ddy < (e.r + 2) * (e.r + 2)) {
          const tmp = ux;
          ux = -uy;
          uy = tmp;
          break;
        }
      }

      e.x += ux * e.speed * dt;
      e.y += uy * e.speed * dt;

      if (e.kind === "spitter") {
        e.spitCd -= dt;
        if (e.spitCd <= 0) {
          e.spitCd = rand(1.0, 1.6);
          enemyShots.push(makeEnemyProjectile(e.x, e.y, p.x - e.x, p.y - e.y));
        }
      }

      const rr = (tgt.isPlayer ? p.r : tgt.ref.r) + e.r;
      if (dist2(tgt.x, tgt.y, e.x, e.y) < rr * rr) {
        const dmgBase = e.touchDmg || 10;
        const armor = p.armor || 0;
        const dmg = dmgBase * (1 - armor);

        if (tgt.isPlayer) {
          if (p.iFrames <= 0) {
           
            if (p.shield > 0) {
              const take = Math.min(p.shield, dmg);
              p.shield -= take;
              const leftover = dmg - take;
              if (leftover > 0) p.hp -= leftover;
            } else {
              p.hp -= dmg;
            }
            p.iFrames = 0.45;

            const push = 200;
            p.x = clamp(p.x - (dx0 / d0) * push * dt, p.r, W - p.r);
            p.y = clamp(p.y - (dy0 / d0) * push * dt, p.r, H - p.r);
          }
        } else if (tgt.ref) {
          tgt.ref.hp -= dmgBase * 0.9;
        }
      }
    }

    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;

      let blocked = false;
      for (const w of walls) {
        if (s.x >= w.x && s.x <= w.x + w.w && s.y >= w.y && s.y <= w.y + w.h) {
          blocked = true;
          break;
        }
      }
      if (blocked || s.life <= 0 || s.x < -40 || s.x > W + 40 || s.y < -40 || s.y > H + 40) {
        enemyShots.splice(i, 1);
        continue;
      }

      const rr = p.r + s.r;
      if (dist2(p.x, p.y, s.x, s.y) < rr * rr) {
        if (p.iFrames <= 0) {
          const armor = p.armor || 0;
          const dmg = 9 * (1 - armor);
          if (p.shield > 0) {
            const take = Math.min(p.shield, dmg);
            p.shield -= take;
            const leftover = dmg - take;
            if (leftover > 0) p.hp -= leftover;
          } else p.hp -= dmg;

          p.iFrames = 0.28;
        }
        enemyShots.splice(i, 1);
      }
    }

    shootAccRef.current += dt;
    const fireDelayNow = getEffectiveFireDelay(p, tMs);
    if (shootAccRef.current >= fireDelayNow && enemies.length) {
      shootAccRef.current = 0;

      let bestI = 0;
      let bestD = Infinity;
      for (let i = 0; i < enemies.length; i++) {
        const e = enemies[i];
        const d = dist2(p.x, p.y, e.x, e.y);
        if (d < bestD) {
          bestD = d;
          bestI = i;
        }
      }

      const target = enemies[bestI];
      const b = makeBullet(p.x, p.y, target.x - p.x, target.y - p.y, p.bulletSpeed, p.dmg);
      b.pierceLeft = p.pierce;
      bullets.push(b);
    }

    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;

      let hitWall = false;
      for (const w of walls) {
        if (b.x >= w.x && b.x <= w.x + w.w && b.y >= w.y && b.y <= w.y + w.h) {
          hitWall = true;
          break;
        }
      }
      if (hitWall || b.life <= 0 || b.x < -40 || b.x > W + 40 || b.y < -40 || b.y > H + 40) {
        bullets.splice(i, 1);
        continue;
      }

      for (let j = enemies.length - 1; j >= 0; j--) {
        const e = enemies[j];
        const rr = b.r + e.r;
        if (dist2(b.x, b.y, e.x, e.y) < rr * rr) {
          e.hp -= b.dmg;

          if (e.hp <= 0) {
            enemies.splice(j, 1);

            if ((p.lifesteal || 0) > 0) {
              p.hp = Math.min(p.maxHp, p.hp + p.lifesteal);
            }

            const xpVal =
              e.kind === "brute"
                ? 16
                : e.kind === "spitter"
                ? 14
                : e.kind === "architect"
                ? 16
                : e.kind === "runner"
                ? 12
                : e.kind === "frenzy"
                ? 12
                : e.kind === "medic"
                ? 11
                : 9;

            pickups.push(makePickup(e.x, e.y, "xp", xpVal));

            if (e.kind === "medic") pickups.push(makePickup(e.x + rand(-10, 10), e.y + rand(-10, 10), "heal", 26));

            if (e.kind === "frenzy") {
              for (let k = 0; k < 4; k++) pickups.push(makePickup(e.x + rand(-18, 18), e.y + rand(-18, 18), "xp", 6));
              pickups.push(makePickup(e.x + rand(-10, 10), e.y + rand(-10, 10), "regen", 0));
            }

            if (e.kind === "runner") pickups.push(makePickup(e.x + rand(-10, 10), e.y + rand(-10, 10), "orangeCombo", 0));

            if (e.kind === "architect") walls.push(makeWall(e.x, e.y));

            setUi((s) => ({ ...s, kills: s.kills + 1 }));
          }

          if (b.pierceLeft > 0) b.pierceLeft -= 1;
          else bullets.splice(i, 1);
          break;
        }
      }
    }

    for (let i = pickups.length - 1; i >= 0; i--) {
      const o = pickups[i];
      o.bob += dt * 4.2;

      const pullR = p.magnet;
      const d = Math.hypot(p.x - o.x, p.y - o.y);

      if (d < pullR) {
        const strength = clamp(1 - d / pullR, 0, 1);
        o.x += (p.x - o.x) * (dt * (3.0 + 8.5 * strength));
        o.y += (p.y - o.y) * (dt * (3.0 + 8.5 * strength));
      }

      if (d < p.r + o.r + 4) {
        pickups.splice(i, 1);

        if (o.type === "xp") {
          setUi((s) => {
            const xpBank = s.xpBank + o.v;
            const levelXp = s.levelXp + o.v;

            if (levelXp >= s.levelNeed) {
              const nextLevel = s.level + 1;
              setTimeout(() => completeLevelAndShop(nextLevel), 0);
              return { ...s, xpBank, levelXp: s.levelNeed };
            }
            return { ...s, xpBank, levelXp };
          });
        }

        if (o.type === "heal") {
          p.hp = Math.min(p.maxHp, p.hp + 26);
          setUi((s) => ({ ...s, message: "Picked: Heal" }));
        }

        if (o.type === "regen") {
          p.regen += 0.55;
          const end = tMs + 8000;
          setTimeout(() => {
            playerRef.current.regen = Math.max(0, playerRef.current.regen - 0.55);
          }, 8000);
          setUi((s) => ({ ...s, message: "Picked: Regen boost (8s)" }));
        }

        if (o.type === "orangeCombo") {
          p.orangeSpeedUntil = Math.max(p.orangeSpeedUntil, tMs + 5000);
          p.orangeFireUntil = Math.max(p.orangeFireUntil, tMs + 3000);
          setUi((s) => ({ ...s, message: "Picked: Orange combo (speed + fire)" }));
        }
      }
    }

    setUi((s) => {
      const score = Math.floor(alive * 10 + s.kills * 8 + s.level * 28);
      if (score > sessionBestRef.current) sessionBestRef.current = score;
      return { ...s, score };
    });

    if (p.hp <= 0) {
      const finalScore = ui.score;
      if (finalScore > bestDevice) {
        setBestDevice(finalScore);
        localStorage.setItem(bestKey, String(finalScore));
      }
      gameOver();
    }
  });

  /* -------------------------- DRAW -------------------------- */

  const canvasRef = useRef(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");

    let raf = 0;
    const draw = () => {
      const p = playerRef.current;
      const enemies = enemiesRef.current;
      const bullets = bulletsRef.current;
      const pickups = pickupsRef.current;
      const walls = wallsRef.current;
      const enemyShots = enemyShotsRef.current;
      const turrets = turretsRef.current;
      const decoys = decoysRef.current;

      const t = nowMs();

      ctx.clearRect(0, 0, W, H);

      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = "#0f172a";
      for (let x = 0; x < W; x += 44) ctx.fillRect(x, 0, 1, H);
      for (let y = 0; y < H; y += 44) ctx.fillRect(0, y, W, 1);
      ctx.restore();

      const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, 80, W * 0.5, H * 0.5, 620);
      vg.addColorStop(0, "rgba(255,255,255,0)");
      vg.addColorStop(1, "rgba(15,23,42,0.10)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);

      for (const w of walls) {
        ctx.fillStyle = "rgba(15,23,42,0.12)";
        ctx.fillRect(w.x, w.y, w.w, w.h);
        ctx.strokeStyle = "rgba(15,23,42,0.18)";
        ctx.strokeRect(w.x, w.y, w.w, w.h);
      }

      for (const o of pickups) {
        const s = 0.85 + Math.sin(o.bob) * 0.12;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r * s, 0, Math.PI * 2);

        if (o.type === "xp") ctx.fillStyle = "rgba(79,70,229,0.75)";
        if (o.type === "heal") ctx.fillStyle = "rgba(16,185,129,0.75)";
        if (o.type === "regen") ctx.fillStyle = "rgba(34,197,94,0.50)";
        if (o.type === "orangeCombo") ctx.fillStyle = "rgba(249,115,22,0.78)";

        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.stroke();
      }

      for (const b of bullets) {
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.fill();
      }

      for (const s of enemyShots) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(225,29,72,0.55)";
        ctx.fill();
      }

      for (const t0 of turrets) {
        ctx.beginPath();
        ctx.arc(t0.x, t0.y, t0.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(15,23,42,0.40)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.stroke();
      }

      for (const d of decoys) {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(79,70,229,0.30)";
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.stroke();
      }

      for (const e of enemies) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);

        const fill =
          e.kind === "brute"
            ? "rgba(225,29,72,0.55)"
            : e.kind === "runner"
            ? "rgba(249,115,22,0.50)"
            : e.kind === "medic"
            ? "rgba(16,185,129,0.42)"
            : e.kind === "frenzy"
            ? "rgba(225,29,72,0.42)"
            : e.kind === "architect"
            ? "rgba(15,23,42,0.22)"
            : e.kind === "spitter"
            ? "rgba(79,70,229,0.28)"
            : "rgba(15,23,42,0.20)";

        ctx.fillStyle = fill;
        ctx.fill();
        ctx.strokeStyle = "rgba(15,23,42,0.12)";
        ctx.stroke();

        const w = e.r * 2.1;
        const h = 4;
        const pct = clamp(e.hp / e.maxHp, 0, 1);
        ctx.fillStyle = "rgba(15,23,42,0.10)";
        ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w, h);
        ctx.fillStyle = "rgba(15,23,42,0.55)";
        ctx.fillRect(e.x - w / 2, e.y - e.r - 12, w * pct, h);
      }

      const orangeSpeed = t < p.orangeSpeedUntil;
      const orangeFire = t < p.orangeFireUntil;

      const glow = ctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, 62);
      glow.addColorStop(0, "rgba(255,255,255,0.80)");
      glow.addColorStop(1, orangeSpeed || orangeFire ? "rgba(249,115,22,0)" : "rgba(79,70,229,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 62, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.iFrames > 0 ? "rgba(79,70,229,0.65)" : "rgba(15,23,42,0.82)";
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.stroke();

      if (p.shield > 0) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + 10, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(79,70,229,0.40)";
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.lineWidth = 1;
      }

      if (paused && phaseRef.current === "play") {
        ctx.fillStyle = "rgba(255,255,255,0.65)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.font = "700 34px system-ui";
        ctx.fillText("Paused", W / 2 - 62, H / 2 - 10);
        ctx.font = "500 14px system-ui";
        ctx.fillText("Press P to resume", W / 2 - 68, H / 2 + 18);
      }

      if (phaseRef.current === "shop") {
        ctx.fillStyle = "rgba(255,255,255,0.72)";
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = "rgba(15,23,42,0.85)";
        ctx.font = "700 28px system-ui";
        ctx.fillText("Shop time", W / 2 - 70, H / 2 - 12);
        ctx.font = "500 14px system-ui";
        ctx.fillText("Buy upgrades / abilities → Start next level", W / 2 - 150, H / 2 + 14);
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  /* -------------------------- HUD + SUMMARY -------------------------- */

  const p = playerRef.current;
  const tMs = nowMs();
  const fireDelayNow = getEffectiveFireDelay(p, tMs);
  const firePerSec = Math.max(1, Math.round(1 / fireDelayNow));

  const hpPct = clamp(p.hp / Math.max(1, p.maxHp), 0, 1);
  const shieldPct = clamp((p.shield || 0) / Math.max(1, p.maxHp), 0, 1);
  const lvlPct = clamp(ui.levelXp / Math.max(1, ui.levelNeed), 0, 1);

  const sessionBest = sessionBestRef.current;

  const upgradesForHud = useMemo(() => {
    return UPGRADE_DEFS.map((def) => {
      const owned = clamp(Number(tiers?.[def.key] || 0), 0, def.max);
      const pctText = def.statText ? def.statText(owned) : `${owned}/3`;
      return { key: def.key, name: def.name, owned, pctText, minLevel: def.minLevel };
    });
  }, [tiers]);

  const boundList = useMemo(() => {
    const slotInfo = ["X", "C", "Z"].map((slot) => {
      const k = binds?.[slot];
      const ab = ABILITY_DEFS.find((a) => a.key === k);
      const readyAt = cdsRef.current[k] || 0;
      const cdLeft = k ? Math.max(0, (readyAt - nowMs()) / 1000) : 0;
      return { slot, key: k, name: ab?.name || null, cdLeft, unlocked: !!bindUnlocked?.[slot] };
    });
    return slotInfo;
  }, [binds, bindUnlocked, phase, ui.level]);

  /* -------------------------- RENDER -------------------------- */

  return (
    <div className="min-h-screen px-4 py-10 text-slate-900" style={{ backgroundImage: bg }}>
      <div className="mx-auto max-w-7xl">
        {/* Top bar */}
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur">
              Mini Game • Arcade • 1 file
              <span className="h-1 w-1 rounded-full bg-black/20" />
              {phase === "play" ? "Live" : phase === "shop" ? "Shop" : phase === "over" ? "Game Over" : "Menu"}
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl">Survivor Arena</h1>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Btn variant="ghost" onClick={() => navigate(-1)}>
                ← Back
              </Btn>

              <Btn variant="ghost" onClick={() => setShowHowTo(true)}>
                How to play (H)
              </Btn>

              {phase === "menu" ? (
                <Btn onClick={() => start(1)}>Start</Btn>
              ) : phase === "shop" ? (
                <Btn onClick={startNextLevel}>Start next level</Btn>
              ) : phase === "over" ? (
                <Btn onClick={() => start(1)}>Restart</Btn>
              ) : (
                <Btn variant="ghost" onClick={() => setPaused((pp) => !pp)}>
                  {paused ? "Resume (P)" : "Pause (P)"}
                </Btn>
              )}
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-3 md:w-[560px]">
            <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
              <div className="text-xs font-semibold text-slate-600">Score</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">{ui.score}</div>
              <div className="mt-1 text-xs text-slate-500">Best on this device: {bestDevice}</div>
              <div className="mt-1 text-xs text-slate-500">Session best: {sessionBest}</div>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
              <div className="text-xs font-semibold text-slate-600">Run</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {phase === "play" || phase === "shop" ? `${timeAlive.toFixed(1)}s` : "—"}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Kills: {ui.kills} • Level: {ui.level}
              </div>
            </div>
          </div>
        </div>

        {/* Main */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* left */}
          <div className="lg:col-span-2">
            <Glass className="p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill>HP: {Math.max(0, Math.round(p.hp))}/{Math.round(p.maxHp)}</Pill>
                  <Pill>Shield: {Math.round(p.shield || 0)}</Pill>
                  <Pill>XP: {ui.xpBank}</Pill>
                  <Pill>Lvl XP: {Math.min(ui.levelNeed, ui.levelXp)}/{ui.levelNeed}</Pill>
                  <Pill>DMG: {Math.round(p.dmg)}</Pill>
                  <Pill>Fire: {firePerSec}/s</Pill>
                </div>

                <div className="text-xs font-semibold text-slate-600">
                  Abilities: {boundList.map((b) => `${b.slot}${b.unlocked ? "" : "🔒"}`).join(" • ")}
                </div>
              </div>

              {/* Bars */}
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-black/10 bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">Health</div>
                    <div className="text-xs font-semibold text-slate-900">{Math.round(hpPct * 100)}%</div>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-black/10">
                    <div className="h-2.5 rounded-full bg-rose-600/80" style={{ width: `${hpPct * 100}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">Shield</div>
                    <div className="text-xs font-semibold text-slate-900">{Math.round(shieldPct * 100)}%</div>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-black/10">
                    <div className="h-2.5 rounded-full bg-indigo-600/70" style={{ width: `${shieldPct * 100}%` }} />
                  </div>
                </div>

                <div className="rounded-2xl border border-black/10 bg-white/60 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-600">Level progress</div>
                    <div className="text-xs font-semibold text-slate-900">{Math.round(lvlPct * 100)}%</div>
                  </div>
                  <div className="mt-2 h-2.5 w-full rounded-full bg-black/10">
                    <div className="h-2.5 rounded-full bg-slate-900/80" style={{ width: `${lvlPct * 100}%` }} />
                  </div>
                </div>
              </div>

              {/* Ability binds + cooldowns */}
              <div className="mt-3 flex flex-wrap gap-2">
                {boundList.map((b) => (
                  <Pill key={b.slot}>
                    {b.slot}: {b.unlocked ? (b.name ? b.name : "—") : "Locked"}{" "}
                    {b.unlocked && b.name ? (b.cdLeft > 0 ? `(${b.cdLeft.toFixed(1)}s)` : "(Ready)") : ""}
                  </Pill>
                ))}
              </div>

              {/* Canvas */}
              <div className="mt-4 overflow-hidden rounded-3xl border border-black/10 bg-white/50 relative">
                <canvas ref={canvasRef} width={W} height={H} className="block w-full" />

                {levelBanner.show ? (
                  <div className="pointer-events-none absolute inset-0 grid place-items-center">
                    <div className="rounded-3xl border border-black/10 bg-white/90 px-8 py-6 shadow-[0_30px_110px_-70px_rgba(0,0,0,0.65)] backdrop-blur">
                      <div className="text-xs font-semibold text-slate-600">WIN</div>
                      <div className="mt-1 text-2xl font-semibold text-slate-900">{levelBanner.text}</div>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Under gameplay: upgrade summary list with % */}
              <div className="mt-4 rounded-3xl border border-black/10 bg-white/60 p-4">
                <div className="text-xs font-semibold text-slate-600">Your upgrades</div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {upgradesForHud.map((u) => (
                    <div key={u.key} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-3 py-2">
                      <div className="text-sm font-semibold text-slate-900">{u.name}</div>
                      <div className="text-xs font-semibold text-slate-700">
                        {u.owned}/3 • {u.pctText}
                        {ui.level < u.minLevel ? " 🔒" : ""}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* message */}
              {ui.message ? (
                <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-slate-700">
                  {ui.message}
                </div>
              ) : null}
            </Glass>
          </div>

          {/* right */}
          <div className="lg:col-span-1">
            <Glass className="p-5">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">{phase === "shop" ? "Shop" : "Info"}</div>
                <Pill>Level {ui.level}</Pill>
              </div>

              {phase === "menu" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-3xl border border-black/10 bg-white/60 p-4 text-sm text-slate-700">
                    Levels unlock as you beat them. Replaying a level restarts the run from that level.
                  </div>

                  <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
                    <div className="text-xs font-semibold text-slate-600">Replay old levels</div>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm"
                        value={ui.level}
                        onChange={(e) => setUi((s) => ({ ...s, level: Number(e.target.value) }))}
                      >
                        {Array.from({ length: unlockedLevel }).map((_, i) => (
                          <option key={i + 1} value={i + 1}>
                            Level {i + 1}
                          </option>
                        ))}
                      </select>
                      <Btn onClick={() => start(ui.level)}>Play</Btn>
                    </div>
                  </div>
                </div>
              ) : null}

              {phase === "shop" ? (
                <>
                  <div className="mt-4 flex gap-2">
                    <TabBtn active={shopTab === "upgrades"} onClick={() => setShopTab("upgrades")}>
                      Upgrades
                    </TabBtn>
                    <TabBtn active={shopTab === "abilities"} onClick={() => setShopTab("abilities")}>
                      Abilities
                    </TabBtn>
                    <TabBtn active={shopTab === "binds"} onClick={() => setShopTab("binds")}>
                      Binds
                    </TabBtn>
                  </div>

                  {shopTab === "upgrades" ? (
                    <div className="mt-4 space-y-2">
                      {UPGRADE_DEFS.map((def) => {
                        const owned = clamp(Number(tiers?.[def.key] || 0), 0, def.max);
                        const nextTier = owned + 1;
                        const maxed = owned >= def.max;
                        const locked = ui.level < def.minLevel;
                        const cost = maxed ? 0 : tierCost(def, nextTier, ui.level);

                        return (
                          <div key={def.key} className="rounded-3xl border border-black/10 bg-white/60 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {def.name} {locked ? <span className="text-xs text-slate-500">• unlocks lvl {def.minLevel}</span> : null}
                                </div>
                                <div className="mt-1 text-xs text-slate-600">{def.desc}</div>
                              </div>
                              <Bubbles filled={owned} total={3} />
                            </div>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <div className="text-xs font-semibold text-slate-700">
                                {maxed ? "MAXED" : locked ? "LOCKED" : `Cost: ${cost} XP`}
                              </div>
                              <Btn
                                variant="ghost"
                                disabled={locked || maxed || ui.xpBank < cost}
                                onClick={() => tryBuyUpgrade(def)}
                              >
                                {maxed ? "Done" : "Buy"}
                              </Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {shopTab === "abilities" ? (
                    <div className="mt-4 space-y-2">
                      {ABILITY_DEFS.map((ab) => {
                        const owned = !!abilityOwned?.[ab.key];
                        const locked = ui.level < ab.minLevel;
                        const cost = ab.cost(ui.level);
                        return (
                          <div key={ab.key} className="rounded-3xl border border-black/10 bg-white/60 p-4">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="text-sm font-semibold text-slate-900">
                                  {ab.name} {locked ? <span className="text-xs text-slate-500">• unlocks lvl {ab.minLevel}</span> : null}
                                </div>
                                <div className="mt-1 text-xs text-slate-600">{ab.desc}</div>
                                <div className="mt-2 text-xs font-semibold text-slate-700">Cooldown: {ab.cd}s</div>
                              </div>
                              <div className="text-xs font-semibold text-slate-700">{owned ? "OWNED" : `Cost: ${cost} XP`}</div>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                              <div className="text-xs text-slate-500">
                                Bind it in the Binds tab (X/C/Z).
                              </div>
                              <Btn variant="ghost" disabled={locked || owned || ui.xpBank < cost} onClick={() => tryBuyAbility(ab)}>
                                {owned ? "Done" : "Unlock"}
                              </Btn>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : null}

                  {shopTab === "binds" ? (
                    <div className="mt-4 space-y-2">
                      {/* Buy bind slots */}
                      <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
                        <div className="text-sm font-semibold text-slate-900">Unlock slots</div>
                        <div className="mt-2 grid gap-2">
                          {BIND_UPGRADES.map((b) => {
                            const slot = b.key === "bindX" ? "X" : b.key === "bindC" ? "C" : "Z";
                            const owned = !!bindUnlocked?.[slot];
                            const locked = ui.level < b.minLevel;
                            const cost = b.cost(ui.level);
                            return (
                              <div key={b.key} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/60 px-3 py-2">
                                <div>
                                  <div className="text-sm font-semibold text-slate-900">
                                    {b.name} {locked ? <span className="text-xs text-slate-500">• lvl {b.minLevel}</span> : null}
                                  </div>
                                  <div className="text-xs text-slate-600">{b.desc}</div>
                                </div>
                                <Btn variant="ghost" disabled={owned || locked || ui.xpBank < cost} onClick={() => tryBuyBind(b.key)}>
                                  {owned ? "Owned" : `Buy (${cost})`}
                                </Btn>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Binding UI */}
                      <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
                        <div className="text-sm font-semibold text-slate-900">Bind abilities</div>
                        <div className="mt-2 text-xs text-slate-600">Pick an owned ability for each slot.</div>

                        {["X", "C", "Z"].map((slot) => {
                          const unlocked = !!bindUnlocked?.[slot];
                          return (
                            <div key={slot} className="mt-3 flex items-center gap-2">
                              <div className="w-8 text-sm font-semibold text-slate-900">{slot}</div>
                              <select
                                className="w-full rounded-2xl border border-black/10 bg-white/70 px-3 py-2 text-sm"
                                disabled={!unlocked}
                                value={binds?.[slot] || ""}
                                onChange={(e) => setBind(slot, e.target.value)}
                              >
                                <option value="">{unlocked ? "— none —" : "Locked"}</option>
                                {ABILITY_DEFS.filter((a) => abilityOwned?.[a.key]).map((a) => (
                                  <option key={a.key} value={a.key}>
                                    {a.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4">
                    <Btn onClick={startNextLevel}>Start next level</Btn>
                  </div>
                </>
              ) : null}

              {phase === "play" ? (
                <div className="mt-4 rounded-3xl border border-black/10 bg-white/60 p-4">
                  <div className="text-xs font-semibold text-slate-600">Drops</div>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                    <li>Blue XP: spend + level progress.</li>
                    <li>Green: heal.</li>
                    <li>Red enemy: XP pile + regen pickup.</li>
                    <li>Orange enemy: 50% speed (5s) + fire rate (3s).</li>
                    <li>Architect: leaves a wall on death.</li>
                  </ul>
                  <div className="mt-3 text-xs text-slate-600">
                    Use abilities: X {bindUnlocked?.X ? "" : "🔒"} • C {bindUnlocked?.C ? "" : "🔒"} • Z {bindUnlocked?.Z ? "" : "🔒"}
                  </div>
                </div>
              ) : null}

              {phase === "over" ? (
                <div className="mt-4 space-y-3">
                  <div className="rounded-3xl border border-black/10 bg-white/60 p-4">
                    <div className="text-xs font-semibold text-slate-600">Run ended</div>
                    <div className="mt-2 text-sm text-slate-700">
                      Time: <b>{timeAlive.toFixed(1)}s</b> • Kills: <b>{ui.kills}</b> • Level: <b>{ui.level}</b>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      Score: <b>{ui.score}</b> • Device best: <b>{bestDevice}</b> • Session best: <b>{sessionBest}</b>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Btn onClick={() => start(1)}>Restart</Btn>
                    <Btn variant="ghost" onClick={() => setPhase("menu")}>
                      Menu
                    </Btn>
                  </div>
                </div>
              ) : null}

              {ui.message && phase !== "shop" ? (
                <div className="mt-4 rounded-2xl border border-black/10 bg-white/60 px-4 py-3 text-sm text-slate-700">
                  {ui.message}
                </div>
              ) : null}
            </Glass>
          </div>
        </div>

        <div className="mt-10 text-center text-xs text-slate-500">
          Survivor Arena • By Idrees J. Nait 
        </div>
      </div>

      {showHowTo ? (
        <Modal title="How to play" onClose={() => setShowHowTo(false)}>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Controls</div>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Move: <b>WASD</b> / <b>Arrows</b></li>
                <li>Pause: <b>P</b></li>
                <li>Restart: <b>R</b></li>
                <li>Abilities: <b>X</b>, <b>C</b>, <b>Z</b> (unlock slots in shop)</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Loop</div>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Auto-shoot nearest enemy.</li>
                <li>Collect XP: it’s currency + level progress.</li>
                <li>When the bar fills: shop appears → buy → Start next level.</li>
                <li>Each level refreshes the map, with harder spawns.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white/70 p-4">
              <div className="text-xs font-semibold text-slate-600">Drops</div>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><b>XP</b> (blue): spend + level.</li>
                <li><b>Heal</b> (green): instant HP.</li>
                <li><b>Regen</b> (light green): stronger regen (8s).</li>
                <li><b>Orange combo</b>: +50% speed (5s) + fire rate (3s).</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Btn onClick={() => setShowHowTo(false)}>Play</Btn>
            </div>
          </div>
        </Modal>
      ) : null}
    </div>
  );
}
