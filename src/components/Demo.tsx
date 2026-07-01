import { useEffect, useRef, useState, useCallback } from 'react';
import type { GravityDir } from '../data/gameData';

// ─── TYPES ───
type Vec = { x: number; y: number };
type LaserDir = 'right' | 'left' | 'up' | 'down';
interface Entity { x: number; y: number; w: number; h: number; vx: number; vy: number; onGround?: boolean }
interface Rect { x: number; y: number; w: number; h: number }
interface Orb { x: number; y: number; collected: boolean }
interface Portal { x: number; y: number; id: string }
interface MovPlat { x: number; y: number; sx: number; sy: number; ex: number; ey: number; speed: number; t: number }
interface Spike { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; maxLife: number; color: string; size: number }
interface Trail { x: number; y: number; alpha: number; rot: number }

// New Dangers/Enemies:
interface Drone { x: number; y: number; w: number; h: number; startY: number; patrolRange: number; dir: number }
interface GroundRobot { x: number; y: number; w: number; h: number; vx: number; vy: number; dir: number; onGround: boolean }

const GRID = 32;
const COLS = 24;
const ROWS = 14;
const W = COLS * GRID;
const H = ROWS * GRID;

// ─── AUDIO ENGINE ───
class SFX {
  private ctx: AudioContext | null = null;
  private init() { if (!this.ctx) this.ctx = new AudioContext(); return this.ctx; }
  play(type: 'shift' | 'jump' | 'die' | 'collect' | 'win' | 'plate' | 'land') {
    try {
      const c = this.init();
      const o = c.createOscillator();
      const g = c.createGain();
      o.connect(g); g.connect(c.destination);
      const t = c.currentTime;
      switch (type) {
        case 'shift':
          o.type = 'sine'; o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(200, t + 0.15);
          g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.start(t); o.stop(t + 0.2); break;
        case 'jump':
          o.type = 'square'; o.frequency.setValueAtTime(300, t); o.frequency.exponentialRampToValueAtTime(600, t + 0.1);
          g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
          o.start(t); o.stop(t + 0.12); break;
        case 'die':
          o.type = 'sawtooth'; o.frequency.setValueAtTime(400, t); o.frequency.exponentialRampToValueAtTime(80, t + 0.35);
          g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
          o.start(t); o.stop(t + 0.4); break;
        case 'collect':
          o.type = 'sine'; o.frequency.setValueAtTime(600, t); o.frequency.exponentialRampToValueAtTime(1200, t + 0.12);
          g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          o.start(t); o.stop(t + 0.18); break;
        case 'win':
          o.type = 'sine';
          o.frequency.setValueAtTime(523, t); o.frequency.setValueAtTime(659, t+0.12); o.frequency.setValueAtTime(784, t+0.24); o.frequency.setValueAtTime(1047, t+0.36);
          g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
          o.start(t); o.stop(t + 0.6); break;
        case 'plate':
          o.type = 'triangle'; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(440, t + 0.15);
          g.gain.setValueAtTime(0.1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
          o.start(t); o.stop(t + 0.2); break;
        case 'land':
          o.type = 'triangle'; o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(60, t + 0.08);
          g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
          o.start(t); o.stop(t + 0.1); break;
      }
    } catch { /* silent fail */ }
  }
}
const sfx = new SFX();

// ─── LEVEL DATA ───
// # wall  P player  B box  T plate  E exit  X hazard  > < ^ v laser
// O collectible orb  1/2 portal pairs  M moving platform anchor  S spike
// D flying security drone (hovering/patrolling vertically)
// R ground patrol robot (walks and falls to match gravity)
interface DemoLevel {
  id: number; name: string; zone: string; objective: string; hint: string;
  par: number; map: string[];
}

const LEVELS: DemoLevel[] = [
  {
    id: 1, name: 'First Shift', zone: 'Awakening', par: 15,
    objective: 'Push the box onto the plate and reach the exit portal.',
    hint: 'Walk into the box to push it right onto the yellow plate, then continue to the green exit.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#...P.......B....T..E.#',
      '########################',
    ],
  },
  {
    id: 2, name: 'Vertigo', zone: 'Awakening', par: 12,
    objective: 'Flip gravity UP to reach the exit on the ceiling. Time the laser!',
    hint: 'Wait for the pulsing laser to turn off, then press Q to flip gravity upward.',
    map: [
      '########################',
      '#...E..................#',
      '#....######............#',
      '#......................#',
      '#......................#',
      '#...v..................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#...P..................#',
      '########################',
    ],
  },
  {
    id: 3, name: 'Neon Passage', zone: 'Awakening', par: 18,
    objective: 'Cross the deadly lava pit. Collect all 3 orbs for a bonus!',
    hint: 'Press Q to flip UP, walk across the ceiling above the lava, then press E to come back down.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.........O....O......#',
      '#......................#',
      '#....O.................#',
      '#......................#',
      '#.P.....XXXXXXXX....E.#',
      '########################',
    ],
  },
  {
    id: 4, name: 'Double Plate', zone: 'Containment', par: 25,
    objective: 'Both plates must be weighted simultaneously to unlock the exit.',
    hint: 'Push one box right. For the second, try flipping gravity to move it into position.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#...B..............B...#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.P...T.........T...E.#',
      '########################',
    ],
  },
  {
    id: 5, name: 'Portal Lab', zone: 'Containment', par: 20,
    objective: 'Use the teleport portals to bypass the wall and reach the exit.',
    hint: 'Walk into the blue portal (1) to teleport to its pair on the other side of the wall.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#.....1....#...2.......#',
      '#.P........#.......E...#',
      '########################',
    ],
  },
  {
    id: 6, name: 'Moving Ground', zone: 'Containment', par: 22,
    objective: 'Ride the moving platform across the void and reach the exit.',
    hint: 'Jump onto the moving platform (cyan bar). It will carry you across. Jump to the far ledge.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.P.##......M.....##E.#',
      '########################',
    ],
  },
  {
    id: 7, name: 'Laser Grid', zone: 'Reactor Core', par: 30,
    objective: 'Navigate the criss-crossing lasers. Push a box to block the way through.',
    hint: 'Push the box into the horizontal laser to block it, then walk through safely while timing the vertical one.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......>...............#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#..........v...........#',
      '#......................#',
      '#......................#',
      '#.........B............#',
      '#..P.................E.#',
      '########################',
    ],
  },
  {
    id: 8, name: 'Spike Trap', zone: 'Reactor Core', par: 20,
    objective: 'The floor has spikes. Flip gravity to walk on the ceiling, but watch out above too!',
    hint: 'Flip UP to pass over the floor spikes, then flip DOWN again to land past the ceiling spikes.',
    map: [
      '########################',
      '#......................#',
      '#........SSSSSS........#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.P..SSSSSS........E..#',
      '########################',
    ],
  },
  {
    id: 9, name: 'Gravity Maze', zone: 'Security Wing', par: 35,
    objective: 'Navigate the maze using all 4 gravity directions. Collect the orbs!',
    hint: 'Use Z and C for left/right gravity to walk on walls. Collect all orbs then reach exit.',
    map: [
      '########################',
      '#.........O............#',
      '#..######..............#',
      '#......................#',
      '#..........####........#',
      '#......................#',
      '#...O.........#..O....#',
      '#.............#........#',
      '#.............#........#',
      '#.####........#........#',
      '#......................#',
      '#......................#',
      '#.P................E...#',
      '########################',
    ],
  },
  {
    id: 10, name: 'CORE Access', zone: 'The Void', par: 45,
    objective: 'The final challenge — combine every skill to reach the CORE.',
    hint: 'Push the box onto the plate, use the portal, ride platforms, dodge lasers, and flip gravity to the exit.',
    map: [
      '########################',
      '#..............O....E..#',
      '#...........#####..###.#',
      '#......................#',
      '#.....>................#',
      '#......................#',
      '#......................#',
      '#..........1...........#',
      '#......................#',
      '#.......####...........#',
      '#...O..............2...#',
      '#.........B............#',
      '#.P___________T........#',
      '########################',
    ],
  },
  {
    id: 11, name: 'Drone Patrol', zone: 'Security Wing', par: 20,
    objective: 'Evade the hovering security drone to reach the exit portal.',
    hint: 'Drones (triangular red craft) patrol a set path. Shift gravity to wait on the ceiling until it passes.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#..........D...........#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.P..................E.#',
      '########################',
    ],
  },
  {
    id: 12, name: 'Robot Alley', zone: 'Security Wing', par: 24,
    objective: 'Dodge the ground patrol robot. Gravity affects him too!',
    hint: 'The bipedal patrol robot walks on whatever floor matches gravity. Change gravity to fling him out of your path!',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#..........R...........#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.P..................E.#',
      '########################',
    ],
  },
  {
    id: 13, name: 'The Crossfire', zone: 'Security Wing', par: 30,
    objective: 'Navigate past both a drone and a patrol robot. Timing is critical.',
    hint: 'Watch both enemy loops. Shift gravity UP to bypass the ground robot, then wait on the ceiling to dodge the drone.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.........D............#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#......................#',
      '#.........R............#',
      '#......................#',
      '#.P..................E.#',
      '########################',
    ],
  },
  {
    id: 14, name: 'Magnetic Core', zone: 'The Void', par: 40,
    objective: 'Both plates must be pressed. Teleport portals, boxes, and a patrolling robot stand in your way.',
    hint: 'Get the box through portal 1 onto plate 1, then guide/evade the patrol robot on plate 2.',
    map: [
      '########################',
      '#......................#',
      '#......................#',
      '#..........#...........#',
      '#....B.....#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#....1.....#.....2.....#',
      '#..........#...........#',
      '#..........#...........#',
      '#..........#...........#',
      '#....T.....#...R.T.....#',
      '#.P........#.........E.#',
      '########################',
    ],
  },
  {
    id: 15, name: 'CORE Overlord', zone: 'The Void', par: 50,
    objective: 'The Boss Level! Outsmart drones, patrol robots, spikes, lasers, and gravity itself to secure shutdown.',
    hint: 'Clear the path using boxes, trigger the pressure plate, teleport through portals, and time your gravity shifts perfectly.',
    map: [
      '########################',
      '#...E..................#',
      '#..###.................#',
      '#.........D............#',
      '#......................#',
      '#............1.........#',
      '#.........SSSS.........#',
      '#..>...................#',
      '#.........B............#',
      '#......#######.........#',
      '#.........R........2...#',
      '#......................#',
      '#.P...........T........#',
      '########################',
    ],
  },
];

export default function Demo() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [levelIndex, setLevelIndex] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);
  const [gravity, setGravity] = useState<GravityDir>('down');
  const [gravityLabel, setGravityLabel] = useState('↓ DOWN');
  const [won, setWon] = useState(false);
  const [time, setTime] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [shiftCount, setShiftCount] = useState(0);
  const [orbsCollected, setOrbsCollected] = useState(0);
  const [orbsTotal, setOrbsTotal] = useState(0);
  const [plateStatus, setPlateStatus] = useState({ active: 0, total: 0 });
  const [completed, setCompleted] = useState<Record<number, { time: number; stars: number }>>({});
  const keysRef = useRef<Record<string, boolean>>({});
  const gravityRef = useRef<GravityDir>('down');
  const wonRef = useRef(false);
  const shiftFlashRef = useRef(0);
  const screenShakeRef = useRef(0);
  const deathFlashRef = useRef(0);

  const currentLevel = LEVELS[levelIndex];

  useEffect(() => { gravityRef.current = gravity; }, [gravity]);

  const shiftGravity = useCallback((dir: GravityDir) => {
    if (wonRef.current) return;
    if (gravityRef.current === dir) return;
    gravityRef.current = dir;
    setGravity(dir);
    setShiftCount(c => c + 1);
    shiftFlashRef.current = 1.0;
    sfx.play('shift');
    const labels: Record<GravityDir, string> = { down: '↓ DOWN', up: '↑ UP', left: '← LEFT', right: '→ RIGHT' };
    setGravityLabel(labels[dir]);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const map = currentLevel.map;

    // Parse level
    const walls: Rect[] = [];
    const hazards: Rect[] = [];
    const spikes: Spike[] = [];
    const lasers: { col: number; row: number; dir: LaserDir; phase: number }[] = [];
    const orbs: Orb[] = [];
    const portals: Portal[] = [];
    const movPlats: MovPlat[] = [];
    let player: Entity = { x: 0, y: 0, w: 20, h: 28, vx: 0, vy: 0 };
    let boxes: Entity[] = [];
    let plates: { x: number; y: number }[] = [];
    let exit = { x: 0, y: 0 };

    // New Enemies parsed from map:
    const drones: Drone[] = [];
    const robots: GroundRobot[] = [];

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const ch = map[r]?.[c] ?? '.';
        const px = c * GRID; const py = r * GRID;
        if (ch === '#') walls.push({ x: px, y: py, w: GRID, h: GRID });
        if (ch === 'P') player = { x: px + 6, y: py + 2, w: 20, h: 28, vx: 0, vy: 0 };
        if (ch === 'B') boxes.push({ x: px + 3, y: py + 3, w: 26, h: 26, vx: 0, vy: 0 });
        if (ch === 'T') plates.push({ x: px, y: py });
        if (ch === 'X') hazards.push({ x: px, y: py, w: GRID, h: GRID });
        if (ch === 'S') spikes.push({ x: px, y: py, dir: r <= ROWS / 2 ? 'down' : 'up' });
        if (ch === 'O') orbs.push({ x: px + GRID / 2, y: py + GRID / 2, collected: false });
        if (ch === '>' || ch === '<' || ch === '^' || ch === 'v') {
          const dMap: Record<string, LaserDir> = { '>': 'right', '<': 'left', '^': 'up', 'v': 'down' };
          lasers.push({ col: c, row: r, dir: dMap[ch], phase: lasers.length * 800 });
        }
        if (ch === '1' || ch === '2') portals.push({ x: px + GRID / 2, y: py + GRID / 2, id: ch });
        if (ch === 'M') movPlats.push({ x: px, y: py, sx: px - GRID * 4, sy: py, ex: px + GRID * 4, ey: py, speed: 0.001, t: 0 });
        if (ch === 'D') drones.push({ x: px + 4, y: py + 4, w: 24, h: 24, startY: py + 4, patrolRange: GRID * 3, dir: 1 });
        if (ch === 'R') robots.push({ x: px + 6, y: py + 6, w: 20, h: 20, vx: 0, vy: 0, dir: 1, onGround: false });
        if (ch === 'E') exit = { x: px + GRID / 2, y: py + GRID / 2 };
      }
    }

    const initialPlayer = { ...player };
    const initialBoxes = boxes.map(b => ({ ...b }));
    const initialOrbs = orbs.map(o => ({ ...o }));
    const initialDrones = drones.map(d => ({ ...d }));
    const initialRobots = robots.map(r => ({ ...r }));

    setOrbsTotal(orbs.length);
    setOrbsCollected(0);
    setPlateStatus({ active: 0, total: plates.length });
    setDeaths(0);
    setShiftCount(0);

    let startTime = performance.now();
    let lastTime = performance.now();
    let rafId = 0;
    let clock = 0;

    // Particles
    const particles: Particle[] = [];
    const trails: Trail[] = [];
    let coyoteTimer = 0;
    let prevGravity: GravityDir = 'down';
    let prevPlateActive = 0;

    const addParticles = (x: number, y: number, count: number, color: string, spread: number = 3) => {
      for (let i = 0; i < count; i++) {
        particles.push({
          x, y,
          vx: (Math.random() - 0.5) * spread,
          vy: (Math.random() - 0.5) * spread,
          life: 0.6 + Math.random() * 0.6,
          maxLife: 0.6 + Math.random() * 0.6,
          color,
          size: 1 + Math.random() * 2.5,
        });
      }
    };

    const addDeathParticles = (x: number, y: number) => {
      for (let i = 0; i < 35; i++) {
        const angle = (Math.PI * 2 * i) / 35;
        const speed = 2 + Math.random() * 4;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 0.5 + Math.random() * 0.5,
          maxLife: 0.5 + Math.random() * 0.5,
          color: Math.random() > 0.5 ? '#ff2255' : '#ff8866',
          size: 2 + Math.random() * 3,
        });
      }
    };

    const addWinParticles = (x: number, y: number) => {
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50;
        const speed = 1 + Math.random() * 5;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1 + Math.random(),
          maxLife: 1 + Math.random(),
          color: ['#00ff99', '#00f0ff', '#ffd700', '#b026ff'][Math.floor(Math.random() * 4)],
          size: 2 + Math.random() * 3,
        });
      }
    };

    const getGravityVec = (): Vec => {
      switch (gravityRef.current) {
        case 'down': return { x: 0, y: 0.55 };
        case 'up': return { x: 0, y: -0.55 };
        case 'left': return { x: -0.55, y: 0 };
        case 'right': return { x: 0.55, y: 0 };
      }
    };
    const isVertical = () => gravityRef.current === 'down' || gravityRef.current === 'up';
    const rectsOverlap = (a: Rect, b: Rect) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

    const moveAndCollide = (ent: Entity, dx: number, dy: number, solids: Rect[]) => {
      // Horizontal
      ent.x += dx;
      for (const w of [...walls, ...solids]) {
        if (rectsOverlap(ent, w)) {
          if (dx > 0) ent.x = w.x - ent.w;
          else if (dx < 0) ent.x = w.x + w.w;
          ent.vx *= -0.2; // bounce
        }
      }
      // Vertical
      ent.y += dy;
      const prevOnGround = ent.onGround;
      ent.onGround = false;
      for (const w of [...walls, ...solids]) {
        if (rectsOverlap(ent, w)) {
          if (dy > 0) { ent.y = w.y - ent.h; ent.onGround = true; }
          else if (dy < 0) { ent.y = w.y + w.h; ent.onGround = true; }
          ent.vy *= -0.15; // bounce
        }
      }
      // Landing particles
      if (ent.onGround && !prevOnGround && Math.abs(dy) > 2) {
        addParticles(ent.x + ent.w / 2, ent.y + ent.h, 6, '#00f0ff', 2);
        sfx.play('land');
      }
    };

    const moveAndCollideRobot = (ent: GroundRobot, dx: number, dy: number) => {
      // Horizontal
      ent.x += dx;
      for (const w of walls) {
        if (rectsOverlap(ent, w)) {
          if (dx > 0) { ent.x = w.x - ent.w; ent.dir = -1; }
          else if (dx < 0) { ent.x = w.x + w.w; ent.dir = 1; }
          ent.vx = 0;
        }
      }
      // Vertical
      ent.y += dy;
      ent.onGround = false;
      for (const w of walls) {
        if (rectsOverlap(ent, w)) {
          if (dy > 0) { ent.y = w.y - ent.h; ent.onGround = true; }
          else if (dy < 0) { ent.y = w.y + w.h; ent.onGround = true; }
          ent.vy = 0;
        }
      }
    };

    const resetEntities = () => {
      addDeathParticles(player.x + player.w / 2, player.y + player.h / 2);
      screenShakeRef.current = 8;
      deathFlashRef.current = 1;
      sfx.play('die');
      setDeaths(d => d + 1);
      player.x = initialPlayer.x; player.y = initialPlayer.y;
      player.vx = 0; player.vy = 0;
      boxes = initialBoxes.map(b => ({ ...b }));
      orbs.forEach((o, i) => { o.collected = initialOrbs[i].collected; });
      drones.forEach((d, i) => {
        d.x = initialDrones[i].x; d.y = initialDrones[i].y;
        d.dir = initialDrones[i].dir;
      });
      robots.forEach((r, i) => {
        r.x = initialRobots[i].x; r.y = initialRobots[i].y;
        r.vx = initialRobots[i].vx; r.vy = initialRobots[i].vy;
        r.dir = initialRobots[i].dir; r.onGround = initialRobots[i].onGround;
      });
      gravityRef.current = 'down';
      setGravity('down');
      setGravityLabel('↓ DOWN');
    };

    // Raycast
    const raycast = (ox: number, oy: number, dx: number, dy: number, maxDist: number) => {
      const step = 4; let dist = 0;
      while (dist < maxDist) {
        const px = ox + dx * dist; const py = oy + dy * dist;
        const cx = Math.floor(px / GRID); const cy = Math.floor(py / GRID);
        if (cx < 0 || cx >= COLS || cy < 0 || cy >= ROWS) return dist;
        if (map[cy]?.[cx] === '#') return dist;
        for (const b of boxes) { if (px >= b.x && px <= b.x + b.w && py >= b.y && py <= b.y + b.h) return dist; }
        dist += step;
      }
      return maxDist;
    };

    const laserBeam = (l: typeof lasers[0], t: number) => {
      const period = 2400; const on = ((t + l.phase) % period) < period * 0.6;
      const ox = l.col * GRID + GRID / 2; const oy = l.row * GRID + GRID / 2;
      let dx = 0, dy = 0;
      if (l.dir === 'right') dx = 1; if (l.dir === 'left') dx = -1;
      if (l.dir === 'up') dy = -1; if (l.dir === 'down') dy = 1;
      const dist = raycast(ox, oy, dx, dy, Math.max(W, H));
      const ex = ox + dx * dist; const ey = oy + dy * dist;
      let rect: Rect;
      if (dx !== 0) rect = { x: Math.min(ox, ex), y: oy - 2, w: Math.abs(ex - ox), h: 4 };
      else rect = { x: ox - 2, y: Math.min(oy, ey), w: 4, h: Math.abs(ey - oy) };
      return { rect, on, ox, oy };
    };

    // ─── KEYS ───
    const handleKeyDown = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      keysRef.current[k] = true;
      if (k === 'q') shiftGravity('up');
      if (k === 'e') shiftGravity('down');
      if (k === 'z') shiftGravity('left');
      if (k === 'c') shiftGravity('right');
      if (k === 'r') {
        resetEntities();
        setWon(false); wonRef.current = false; startTime = performance.now();
        setOrbsCollected(0);
        orbs.forEach(o => o.collected = false);
      }
      if (k === 'n' && wonRef.current && levelIndex < LEVELS.length - 1) {
        setLevelIndex(i => i + 1);
      }
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key.toLowerCase()] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // ═══ UPDATE ═══
    const update = () => {
      const now = performance.now();
      const rawDt = Math.min(40, now - lastTime);
      lastTime = now;
      const dt = rawDt / 1000;
      clock += rawDt;
      if (!wonRef.current) setTime(Math.floor((now - startTime) / 1000));

      // Decay effects
      if (shiftFlashRef.current > 0) shiftFlashRef.current = Math.max(0, shiftFlashRef.current - dt * 4);
      if (screenShakeRef.current > 0) screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 24);
      if (deathFlashRef.current > 0) deathFlashRef.current = Math.max(0, deathFlashRef.current - dt * 5);

      // Update particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= 0.96; p.vy *= 0.96;
        p.vy += 0.02; // mini gravity
        p.life -= dt;
        if (p.life <= 0) particles.splice(i, 1);
      }

      // Update trails
      for (let i = trails.length - 1; i >= 0; i--) {
        trails[i].alpha -= dt * 3;
        if (trails[i].alpha <= 0) trails.splice(i, 1);
      }

      if (wonRef.current) { drawFrame(ctx, clock, rawDt); rafId = requestAnimationFrame(update); return; }

      // Player trail
      if (Math.abs(player.vx) > 1 || Math.abs(player.vy) > 1) {
        let rot = 0;
        if (gravityRef.current === 'up') rot = Math.PI;
        if (gravityRef.current === 'left') rot = Math.PI / 2;
        if (gravityRef.current === 'right') rot = -Math.PI / 2;
        trails.push({ x: player.x + player.w / 2, y: player.y + player.h / 2, alpha: 0.35, rot });
      }

      // Gravity shift particles
      if (prevGravity !== gravityRef.current) {
        addParticles(player.x + player.w / 2, player.y + player.h / 2, 15, '#b026ff', 4);
        prevGravity = gravityRef.current;
      }

      const keys = keysRef.current;
      const g = getGravityVec();
      const vertical = isVertical();

      // Update Drones
      for (const d of drones) {
        // Vertical hover patrol
        d.y += d.dir * 1.5;
        if (Math.abs(d.y - d.startY) > d.patrolRange) {
          d.dir *= -1;
        }
        // Collision with player
        const dRect: Rect = { x: d.x, y: d.y, w: d.w, h: d.h };
        if (rectsOverlap(player, dRect)) {
          resetEntities();
          break;
        }
      }

      // Update Robots (ground units that respond to gravity)
      for (const r of robots) {
        // Apply gravity to robot
        r.vx += g.x * 0.8;
        r.vy += g.y * 0.8;

        // Bounded velocities
        r.vx = Math.max(-10, Math.min(10, r.vx));
        r.vy = Math.max(-10, Math.min(10, r.vy));

        // Add patrol horizontal velocity
        const robotWalkSpeed = 1.2;
        if (vertical) {
          r.vx = r.dir * robotWalkSpeed;
        } else {
          r.vy = r.dir * robotWalkSpeed;
        }

        moveAndCollideRobot(r, r.vx, r.vy);

        // Turn around if walk path meets no solid ground (cliff edges)
        if (r.onGround && vertical) {
          const checkX = r.dir > 0 ? r.x + r.w + 4 : r.x - 4;
          const checkY = gravityRef.current === 'down' ? r.y + r.h + 4 : r.y - 4;
          // check wall below
          const onWall = walls.some(w => checkX >= w.x && checkX <= w.x + w.w && checkY >= w.y && checkY <= w.y + w.h);
          if (!onWall) {
            r.dir *= -1;
          }
        }

        // Collision with player
        const rRect: Rect = { x: r.x, y: r.y, w: r.w, h: r.h };
        if (rectsOverlap(player, rRect)) {
          resetEntities();
          break;
        }
      }

      // Movement
      let moveInput = 0;
      if (vertical) {
        if (keys['arrowleft'] || keys['a']) moveInput -= 1;
        if (keys['arrowright'] || keys['d']) moveInput += 1;
      } else {
        if (keys['arrowup'] || keys['w']) moveInput -= 1;
        if (keys['arrowdown'] || keys['s']) moveInput += 1;
      }

      const speed = 3.4;
      const accel = 0.6;
      if (vertical) {
        const target = moveInput * speed;
        player.vx += (target - player.vx) * accel;
      } else {
        const target = moveInput * speed;
        player.vy += (target - player.vy) * accel;
      }

      // Coyote time
      if (player.onGround) { coyoteTimer = 0.1; }
      else { coyoteTimer = Math.max(0, coyoteTimer - dt); }

      // Jump
      if (keys[' '] && (player.onGround || coyoteTimer > 0)) {
        const jumpV = 10.5;
        if (gravityRef.current === 'down') player.vy = -jumpV;
        if (gravityRef.current === 'up') player.vy = jumpV;
        if (gravityRef.current === 'left') player.vx = jumpV;
        if (gravityRef.current === 'right') player.vx = -jumpV;
        player.onGround = false;
        coyoteTimer = 0;
        sfx.play('jump');
        addParticles(player.x + player.w / 2, player.y + player.h, 8, '#00f0ff', 2);
      }

      // Variable jump height
      if (!keys[' ']) {
        if (gravityRef.current === 'down' && player.vy < -2) player.vy *= 0.85;
        if (gravityRef.current === 'up' && player.vy > 2) player.vy *= 0.85;
        if (gravityRef.current === 'left' && player.vx > 2) player.vx *= 0.85;
        if (gravityRef.current === 'right' && player.vx < -2) player.vx *= 0.85;
      }

      // Gravity
      player.vx += g.x * 0.9; player.vy += g.y * 0.9;
      player.vx = Math.max(-14, Math.min(14, player.vx));
      player.vy = Math.max(-14, Math.min(14, player.vy));

      for (const box of boxes) {
        box.vx += g.x * 0.7; box.vy += g.y * 0.7;
        box.vx = Math.max(-10, Math.min(10, box.vx));
        box.vy = Math.max(-10, Math.min(10, box.vy));
      }

      // Air friction
      if (vertical) { if (moveInput === 0) player.vx *= 0.82; for (const b of boxes) b.vx *= 0.88; }
      else { if (moveInput === 0) player.vy *= 0.82; for (const b of boxes) b.vy *= 0.88; }

      // Moving platforms
      for (const mp of movPlats) {
        mp.t += mp.speed * rawDt;
        const t = (Math.sin(mp.t) + 1) / 2;
        const oldX = mp.x;
        mp.x = mp.sx + (mp.ex - mp.sx) * t;
        mp.y = mp.sy + (mp.ey - mp.sy) * t;
        // Carry player if standing on it
        const platRect: Rect = { x: mp.x, y: mp.y, w: GRID * 2, h: 8 };
        const playerFeet: Rect = { x: player.x, y: player.y + player.h - 2, w: player.w, h: 4 };
        if (rectsOverlap(playerFeet, platRect) && player.vy >= 0) {
          player.x += mp.x - oldX;
          player.onGround = true;
        }
      }

      // Move boxes
      for (let i = 0; i < boxes.length; i++) {
        const others = boxes.filter((_, j) => j !== i);
        moveAndCollide(boxes[i], boxes[i].vx, 0, others);
        moveAndCollide(boxes[i], 0, boxes[i].vy, others);
      }

      // Move player
      moveAndCollide(player, player.vx, 0, boxes);
      moveAndCollide(player, 0, player.vy, boxes);

      // Push
      for (const box of boxes) {
        const pushForce = 2;
        if (vertical) {
          if (Math.abs((player.x + player.w) - box.x) < 3 && player.y + player.h > box.y + 4 && player.y < box.y + box.h - 4 && moveInput > 0) box.vx = Math.max(box.vx, pushForce);
          if (Math.abs(player.x - (box.x + box.w)) < 3 && player.y + player.h > box.y + 4 && player.y < box.y + box.h - 4 && moveInput < 0) box.vx = Math.min(box.vx, -pushForce);
        } else {
          if (Math.abs((player.y + player.h) - box.y) < 3 && player.x + player.w > box.x + 4 && player.x < box.x + box.w - 4 && moveInput > 0) box.vy = Math.max(box.vy, pushForce);
          if (Math.abs(player.y - (box.y + box.h)) < 3 && player.x + player.w > box.x + 4 && player.x < box.x + box.w - 4 && moveInput < 0) box.vy = Math.min(box.vy, -pushForce);
        }
      }

      // Plates
      let activeCount = 0;
      plates.forEach(p => {
        const pr: Rect = { x: p.x, y: p.y, w: GRID, h: GRID };
        const w = rectsOverlap(player, pr) || boxes.some(b => rectsOverlap(b, pr));
        if (w) activeCount++;
      });
      if (activeCount > prevPlateActive && activeCount > 0) sfx.play('plate');
      prevPlateActive = activeCount;
      setPlateStatus({ active: activeCount, total: plates.length });
      const allPlates = plates.length === 0 || activeCount === plates.length;

      // Orbs
      let orbCount = 0;
      for (const o of orbs) {
        if (!o.collected) {
          const dx = (player.x + player.w / 2) - o.x;
          const dy = (player.y + player.h / 2) - o.y;
          if (Math.sqrt(dx * dx + dy * dy) < 18) {
            o.collected = true;
            sfx.play('collect');
            addParticles(o.x, o.y, 20, '#ffd700', 3);
          }
        }
        if (o.collected) orbCount++;
      }
      setOrbsCollected(orbCount);

      // Portals
      for (const p of portals) {
        const dx = (player.x + player.w / 2) - p.x;
        const dy = (player.y + player.h / 2) - p.y;
        if (Math.sqrt(dx * dx + dy * dy) < 16) {
          const pair = portals.find(pp => pp.id !== p.id);
          if (pair) {
            player.x = pair.x - player.w / 2;
            player.y = pair.y - player.h / 2;
            addParticles(pair.x, pair.y, 20, '#b026ff', 4);
            sfx.play('shift');
            break;
          }
        }
      }

      // Hazards
      for (const hz of hazards) { if (rectsOverlap(player, hz)) { resetEntities(); break; } }

      // Spikes
      for (const sp of spikes) {
        const sRect: Rect = sp.dir === 'up'
          ? { x: sp.x + 4, y: sp.y + GRID - 12, w: GRID - 8, h: 12 }
          : { x: sp.x + 4, y: sp.y, w: GRID - 8, h: 12 };
        if (rectsOverlap(player, sRect)) { resetEntities(); break; }
      }

      // Lasers
      const beams = lasers.map(l => laserBeam(l, clock));
      for (const { rect, on } of beams) { if (on && rectsOverlap(player, rect)) { resetEntities(); break; } }

      // Exit
      const exitR: Rect = { x: exit.x - 14, y: exit.y - 14, w: 28, h: 28 };
      if (allPlates && rectsOverlap(player, exitR) && !wonRef.current) {
        wonRef.current = true; setWon(true);
        sfx.play('win');
        addWinParticles(exit.x, exit.y);
        const t = Math.floor((now - startTime) / 1000);
        const stars = t <= currentLevel.par ? 3 : t <= currentLevel.par * 2 ? 2 : 1;
        setCompleted(prev => {
          const old = prev[currentLevel.id];
          if (!old || stars > old.stars || (stars === old.stars && t < old.time)) return { ...prev, [currentLevel.id]: { time: t, stars } };
          return prev;
        });
      }

      // Ambient gravity particles
      if (clock % 120 < rawDt) {
        const gv2 = getGravityVec();
        for (let i = 0; i < 3; i++) {
          particles.push({
            x: Math.random() * W, y: Math.random() * H,
            vx: gv2.x * 6 + (Math.random() - 0.5) * 0.5,
            vy: gv2.y * 6 + (Math.random() - 0.5) * 0.5,
            life: 2, maxLife: 2,
            color: 'rgba(176,38,255,0.4)',
            size: 1.5,
          });
        }
      }

      drawFrame(ctx, clock, rawDt);
      rafId = requestAnimationFrame(update);
    };

    // ═══ DRAW ═══
    const drawFrame = (ctx: CanvasRenderingContext2D, clock: number, _dt: number) => {
      const shake = screenShakeRef.current;
      ctx.save();
      if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

      // Background with subtle gradient
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#020409');
      grad.addColorStop(0.5, '#060a18');
      grad.addColorStop(1, '#040612');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Animated grid
      const gridPhase = clock * 0.0003;
      ctx.strokeStyle = `rgba(0,240,255,${0.04 + Math.sin(gridPhase) * 0.02})`;
      ctx.lineWidth = 0.5;
      for (let c = 0; c <= COLS; c++) { ctx.beginPath(); ctx.moveTo(c * GRID, 0); ctx.lineTo(c * GRID, H); ctx.stroke(); }
      for (let r = 0; r <= ROWS; r++) { ctx.beginPath(); ctx.moveTo(0, r * GRID); ctx.lineTo(W, r * GRID); ctx.stroke(); }

      // Gravity direction ambient drift
      const gv = getGravityVec();
      ctx.fillStyle = 'rgba(176,38,255,0.08)';
      for (let i = 0; i < 50; i++) {
        const px = (((i * 47 + clock * gv.x * 0.06) % W) + W) % W;
        const py = (((i * 73 + clock * gv.y * 0.06) % H) + H) % H;
        ctx.fillRect(px, py, 1.5, 1.5);
      }

      // Walls with depth effect
      for (const w of walls) {
        // Main fill
        ctx.fillStyle = '#0c1328';
        ctx.fillRect(w.x, w.y, w.w, w.h);
        // Inner bevel
        ctx.fillStyle = '#101d3a';
        ctx.fillRect(w.x + 2, w.y + 2, w.w - 4, w.h - 4);
        // Neon edge highlights
        ctx.strokeStyle = 'rgba(0,240,255,0.3)';
        ctx.lineWidth = 1;
        ctx.strokeRect(w.x + 0.5, w.y + 0.5, w.w - 1, w.h - 1);
        // Top highlight
        ctx.fillStyle = 'rgba(0,240,255,0.07)';
        ctx.fillRect(w.x + 2, w.y + 1, w.w - 4, 2);
        // Corner dots
        ctx.fillStyle = 'rgba(0,240,255,0.2)';
        ctx.fillRect(w.x + 1, w.y + 1, 2, 2);
        ctx.fillRect(w.x + w.w - 3, w.y + 1, 2, 2);
      }

      // Hazards (lava) with animated flames
      for (const hz of hazards) {
        const pulse = Math.sin(clock * 0.008 + hz.x * 0.1);
        const grad2 = ctx.createLinearGradient(hz.x, hz.y + hz.h, hz.x, hz.y);
        grad2.addColorStop(0, `rgba(255,60,10,${0.7 + pulse * 0.15})`);
        grad2.addColorStop(0.5, `rgba(255,120,30,${0.5 + pulse * 0.1})`);
        grad2.addColorStop(1, `rgba(255,200,80,${0.3 + pulse * 0.1})`);
        ctx.fillStyle = grad2;
        ctx.fillRect(hz.x, hz.y, hz.w, hz.h);
        ctx.strokeStyle = 'rgba(255,160,60,0.9)';
        ctx.lineWidth = 1;
        ctx.strokeRect(hz.x + 0.5, hz.y + 0.5, hz.w - 1, hz.h - 1);
        // Flame particles
        for (let i = 0; i < 4; i++) {
          const fx = hz.x + 4 + i * 7 + Math.sin(clock * 0.007 + i * 1.5) * 3;
          const fy = hz.y - 2 - Math.abs(Math.sin(clock * 0.01 + i * 2.3)) * 10;
          ctx.fillStyle = `rgba(255,${180 + i * 20},50,${0.6 - i * 0.1})`;
          ctx.beginPath();
          ctx.arc(fx, fy, 2 + Math.sin(clock * 0.012 + i) * 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Spikes
      for (const sp of spikes) {
        ctx.fillStyle = '#ff3344';
        ctx.shadowColor = '#ff3344';
        ctx.shadowBlur = 6;
        const count = 4;
        for (let i = 0; i < count; i++) {
          const bx = sp.x + (i * (GRID / count));
          const tw = GRID / count;
          ctx.beginPath();
          if (sp.dir === 'up') {
            ctx.moveTo(bx, sp.y + GRID);
            ctx.lineTo(bx + tw / 2, sp.y + GRID - 14);
            ctx.lineTo(bx + tw, sp.y + GRID);
          } else {
            ctx.moveTo(bx, sp.y);
            ctx.lineTo(bx + tw / 2, sp.y + 14);
            ctx.lineTo(bx + tw, sp.y);
          }
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // Moving platforms
      for (const mp of movPlats) {
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10;
        const grd = ctx.createLinearGradient(mp.x, mp.y, mp.x + GRID * 2, mp.y);
        grd.addColorStop(0, '#00a0cc');
        grd.addColorStop(0.5, '#00f0ff');
        grd.addColorStop(1, '#00a0cc');
        ctx.fillStyle = grd;
        ctx.fillRect(mp.x, mp.y, GRID * 2, 8);
        ctx.strokeStyle = '#aaffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(mp.x + 0.5, mp.y + 0.5, GRID * 2 - 1, 7);
        // Rail dots
        ctx.fillStyle = 'rgba(0,240,255,0.2)';
        for (let i = 0; i < 6; i++) ctx.fillRect(mp.x + 4 + i * 10, mp.y + 3, 3, 2);
        ctx.restore();
      }

      // Drones (flying security drones)
      for (const d of drones) {
        ctx.save();
        ctx.translate(d.x + d.w / 2, d.y + d.h / 2);
        const hoverBob = Math.sin(clock * 0.006) * 2;
        ctx.translate(0, hoverBob);
        ctx.shadowColor = '#ff2bd6';
        ctx.shadowBlur = 12;

        // Triangular body
        ctx.fillStyle = '#100c1f';
        ctx.strokeStyle = '#ff2bd6';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(10, 10);
        ctx.lineTo(-10, 10);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Glowing red eye in center
        ctx.fillStyle = '#ff2255';
        ctx.shadowColor = '#ff2255'; ctx.shadowBlur = 10;
        ctx.beginPath(); ctx.arc(0, 2, 3.5, 0, Math.PI * 2); ctx.fill();

        // Mini scanner lights/thrusters
        ctx.fillStyle = '#00f0ff';
        ctx.fillRect(-6, 10, 3, 4);
        ctx.fillRect(3, 10, 3, 4);
        ctx.restore();
      }

      // Patrol Robots (ground units)
      for (const r of robots) {
        ctx.save();
        ctx.translate(r.x + r.w / 2, r.y + r.h / 2);
        let rRot = 0;
        if (gravityRef.current === 'up') rRot = Math.PI;
        if (gravityRef.current === 'left') rRot = Math.PI / 2;
        if (gravityRef.current === 'right') rRot = -Math.PI / 2;
        ctx.rotate(rRot);

        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 10;

        // Metallic torso
        ctx.fillStyle = '#222';
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 1.5;
        ctx.fillRect(-8, -8, 16, 12);
        ctx.strokeRect(-8, -8, 16, 12);

        // Bipedal wheel / legs
        ctx.fillStyle = '#050505';
        ctx.fillRect(-6, 4, 4, 6);
        ctx.fillRect(2, 4, 4, 6);

        // Warning light bar
        ctx.fillStyle = (clock % 400 < 200) ? '#ffaa00' : '#ff4400';
        ctx.fillRect(-5, -6, 10, 3);
        ctx.restore();
      }

      // Plates with animated glow
      const pFlags = plates.map(p => {
        const pr: Rect = { x: p.x, y: p.y, w: GRID, h: GRID };
        return rectsOverlap(player, pr) || boxes.some(b => rectsOverlap(b, pr));
      });
      plates.forEach((p, i) => {
        const active = pFlags[i];
        ctx.save();
        ctx.shadowColor = active ? '#ffd700' : 'transparent';
        ctx.shadowBlur = active ? 18 + Math.sin(clock * 0.006) * 5 : 0;
        const grd = ctx.createLinearGradient(p.x, p.y + GRID - 8, p.x, p.y + GRID);
        grd.addColorStop(0, active ? '#ffd700' : '#554400');
        grd.addColorStop(1, active ? '#ffaa00' : '#332200');
        ctx.fillStyle = grd;
        ctx.fillRect(p.x + 4, p.y + GRID - 8, GRID - 8, 6);
        ctx.strokeStyle = active ? '#ffffaa' : '#886600';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x + 4.5, p.y + GRID - 7.5, GRID - 9, 5);
        // Active indicator pips
        if (active) {
          for (let j = 0; j < 3; j++) {
            ctx.fillStyle = '#ffffaa';
            ctx.fillRect(p.x + 8 + j * 7, p.y + GRID - 6, 2, 2);
          }
        }
        ctx.restore();
      });

      // Orbs with rotation and glow
      for (const o of orbs) {
        if (o.collected) continue;
        ctx.save();
        ctx.translate(o.x, o.y);
        const angle = clock * 0.003;
        const bob = Math.sin(clock * 0.004) * 3;
        ctx.translate(0, bob);
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15 + Math.sin(clock * 0.005) * 5;
        // Outer glow ring
        ctx.strokeStyle = 'rgba(255,215,0,0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(0, 0, 10, 0, Math.PI * 2);
        ctx.stroke();
        // Spinning diamond
        ctx.rotate(angle);
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(0, -7); ctx.lineTo(5, 0); ctx.lineTo(0, 7); ctx.lineTo(-5, 0);
        ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff8dd';
        ctx.beginPath();
        ctx.moveTo(0, -4); ctx.lineTo(3, 0); ctx.lineTo(0, 4); ctx.lineTo(-3, 0);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }

      // Portals with animated rings
      for (const p of portals) {
        ctx.save();
        ctx.translate(p.x, p.y);
        const color = p.id === '1' ? '#00aaff' : '#ff44aa';
        ctx.shadowColor = color;
        ctx.shadowBlur = 20 + Math.sin(clock * 0.004) * 8;
        for (let ring = 0; ring < 3; ring++) {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 - ring * 0.5;
          ctx.globalAlpha = 1 - ring * 0.25;
          ctx.beginPath();
          const r = 8 + ring * 5 + Math.sin(clock * 0.005 + ring * 2) * 2;
          ctx.arc(0, 0, r, clock * 0.002 * (ring % 2 === 0 ? 1 : -1), clock * 0.002 * (ring % 2 === 0 ? 1 : -1) + Math.PI * 1.5);
          ctx.stroke();
        }
        ctx.globalAlpha = 0.4;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      // Exit portal
      const allPlates2 = plates.length === 0 || pFlags.every(f => f);
      ctx.save();
      ctx.translate(exit.x, exit.y);
      const eColor = allPlates2 ? '#00ff99' : '#333';
      ctx.shadowColor = eColor;
      ctx.shadowBlur = allPlates2 ? 25 + Math.sin(clock * 0.005) * 10 : 4;
      for (let ring = 0; ring < 4; ring++) {
        ctx.strokeStyle = eColor;
        ctx.lineWidth = 2.5 - ring * 0.5;
        ctx.globalAlpha = 1 - ring * 0.2;
        ctx.beginPath();
        const r = 5 + ring * 4 + Math.sin(clock * 0.004 + ring) * 1.5;
        ctx.arc(0, 0, r, clock * 0.003 * (ring % 2 === 0 ? 1 : -1), clock * 0.003 * (ring % 2 === 0 ? 1 : -1) + Math.PI * 1.6);
        ctx.stroke();
      }
      if (allPlates2) {
        // Inner pulsing core
        ctx.globalAlpha = 0.5 + Math.sin(clock * 0.006) * 0.3;
        ctx.fillStyle = '#00ff99';
        ctx.beginPath(); ctx.arc(0, 0, 5, 0, Math.PI * 2); ctx.fill();
        // Radiating lines
        ctx.globalAlpha = 0.15;
        for (let i = 0; i < 8; i++) {
          const a = (Math.PI * 2 * i) / 8 + clock * 0.002;
          ctx.strokeStyle = '#00ff99';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
          ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.restore();
      ctx.shadowBlur = 0;

      // Lasers
      const beams = lasers.map(l => laserBeam(l, clock));
      lasers.forEach((_l, i) => {
        const { rect, on, ox, oy } = beams[i];
        // Emitter body
        ctx.save();
        ctx.shadowColor = on ? '#ff2255' : '#661122';
        ctx.shadowBlur = on ? 12 : 4;
        const grd = ctx.createRadialGradient(ox, oy, 0, ox, oy, 10);
        grd.addColorStop(0, on ? '#ff6688' : '#331122');
        grd.addColorStop(1, on ? '#ff2255' : '#220011');
        ctx.fillStyle = grd;
        ctx.beginPath(); ctx.arc(ox, oy, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = on ? '#ffaacc' : '#442233';
        ctx.beginPath(); ctx.arc(ox, oy, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        // Beam
        if (on) {
          ctx.save();
          ctx.shadowColor = '#ff2255';
          ctx.shadowBlur = 15;
          // Core beam
          ctx.fillStyle = 'rgba(255,50,90,0.85)';
          ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
          // White center line
          ctx.fillStyle = 'rgba(255,200,220,0.9)';
          if (rect.w > rect.h) ctx.fillRect(rect.x, rect.y + 1, rect.w, 2);
          else ctx.fillRect(rect.x + 1, rect.y, 2, rect.h);
          // Edge glow
          ctx.fillStyle = 'rgba(255,50,90,0.3)';
          if (rect.w > rect.h) { ctx.fillRect(rect.x, rect.y - 3, rect.w, 2); ctx.fillRect(rect.x, rect.y + rect.h + 1, rect.w, 2); }
          else { ctx.fillRect(rect.x - 3, rect.y, 2, rect.h); ctx.fillRect(rect.x + rect.w + 1, rect.y, 2, rect.h); }
          ctx.restore();
        } else {
          ctx.save();
          ctx.strokeStyle = 'rgba(255,50,90,0.12)';
          ctx.setLineDash([3, 5]);
          ctx.lineWidth = 1;
          if (rect.w > rect.h) { ctx.beginPath(); ctx.moveTo(rect.x, oy); ctx.lineTo(rect.x + rect.w, oy); ctx.stroke(); }
          else { ctx.beginPath(); ctx.moveTo(ox, rect.y); ctx.lineTo(ox, rect.y + rect.h); ctx.stroke(); }
          ctx.restore();
        }
      });

      // Boxes with energy lines
      for (const box of boxes) {
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 10 + Math.sin(clock * 0.004) * 3;
        // Main body
        const bGrad = ctx.createLinearGradient(box.x, box.y, box.x + box.w, box.y + box.h);
        bGrad.addColorStop(0, '#0a1a33');
        bGrad.addColorStop(1, '#081528');
        ctx.fillStyle = bGrad;
        ctx.fillRect(box.x, box.y, box.w, box.h);
        // Outer border
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 2;
        ctx.strokeRect(box.x + 0.5, box.y + 0.5, box.w - 1, box.h - 1);
        // Inner circuit pattern
        ctx.strokeStyle = 'rgba(0,240,255,0.4)';
        ctx.lineWidth = 1;
        ctx.strokeRect(box.x + 5, box.y + 5, box.w - 10, box.h - 10);
        // Cross lines
        ctx.beginPath();
        ctx.moveTo(box.x + box.w / 2, box.y + 5);
        ctx.lineTo(box.x + box.w / 2, box.y + box.h - 5);
        ctx.moveTo(box.x + 5, box.y + box.h / 2);
        ctx.lineTo(box.x + box.w - 5, box.y + box.h / 2);
        ctx.stroke();
        // Center dot
        ctx.fillStyle = '#00f0ff';
        ctx.beginPath();
        ctx.arc(box.x + box.w / 2, box.y + box.h / 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Trails (afterimages)
      for (const t of trails) {
        ctx.save();
        ctx.globalAlpha = t.alpha;
        ctx.translate(t.x, t.y);
        ctx.rotate(t.rot);
        ctx.fillStyle = '#b026ff';
        ctx.fillRect(-player.w / 2, -player.h / 2 + 6, player.w, player.h - 8);
        ctx.restore();
      }

      // Player with enhanced visuals
      ctx.save();
      ctx.shadowColor = '#b026ff';
      ctx.shadowBlur = 14 + Math.sin(clock * 0.005) * 4;
      ctx.translate(player.x + player.w / 2, player.y + player.h / 2);
      let rot = 0;
      if (gravityRef.current === 'up') rot = Math.PI;
      if (gravityRef.current === 'left') rot = Math.PI / 2;
      if (gravityRef.current === 'right') rot = -Math.PI / 2;
      ctx.rotate(rot);
      // Body glow
      ctx.fillStyle = 'rgba(176,38,255,0.15)';
      ctx.fillRect(-player.w / 2 - 3, -player.h / 2, player.w + 6, player.h + 2);
      // Body
      ctx.fillStyle = '#e8ecff';
      ctx.fillRect(-player.w / 2, -player.h / 2 + 6, player.w, player.h - 8);
      // Suit lines
      ctx.fillStyle = 'rgba(0,240,255,0.3)';
      ctx.fillRect(-player.w / 2 + 1, -player.h / 2 + 10, 2, player.h - 16);
      ctx.fillRect(player.w / 2 - 3, -player.h / 2 + 10, 2, player.h - 16);
      // Visor
      const visorGrad = ctx.createLinearGradient(-player.w / 2, -player.h / 2 + 3, player.w / 2, -player.h / 2 + 3);
      visorGrad.addColorStop(0, '#007799');
      visorGrad.addColorStop(0.5, '#00f0ff');
      visorGrad.addColorStop(1, '#007799');
      ctx.fillStyle = visorGrad;
      ctx.fillRect(-player.w / 2 + 3, -player.h / 2 + 2, player.w - 6, 7);
      // Visor highlight
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fillRect(-player.w / 2 + 5, -player.h / 2 + 3, 4, 2);
      // Boots
      ctx.fillStyle = '#b026ff';
      ctx.fillRect(-player.w / 2 + 1, player.h / 2 - 5, 7, 5);
      ctx.fillRect(player.w / 2 - 8, player.h / 2 - 5, 7, 5);
      // Chest reactor
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#b026ff';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e0a0ff';
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.shadowBlur = 0;

      // Particles
      for (const p of particles) {
        ctx.save();
        ctx.globalAlpha = Math.min(1, p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.life / p.maxLife), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Gravity shift flash overlay
      if (shiftFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = shiftFlashRef.current * 0.2;
        ctx.fillStyle = '#b026ff';
        ctx.fillRect(0, 0, W, H);
        // Chromatic aberration effect: horizontal lines
        ctx.globalAlpha = shiftFlashRef.current * 0.15;
        for (let y = 0; y < H; y += 4) {
          ctx.fillStyle = y % 8 === 0 ? 'rgba(0,240,255,0.3)' : 'rgba(176,38,255,0.3)';
          ctx.fillRect(0, y, W, 1);
        }
        ctx.restore();
      }

      // Death flash
      if (deathFlashRef.current > 0) {
        ctx.save();
        ctx.globalAlpha = deathFlashRef.current * 0.4;
        ctx.fillStyle = '#ff2255';
        ctx.fillRect(0, 0, W, H);
        ctx.restore();
      }

      // HUD overlay inside canvas
      ctx.save();
      ctx.shadowBlur = 0;
      // Gravity compass (bottom-right)
      const cx2 = W - 40;
      const cy2 = H - 40;
      ctx.fillStyle = 'rgba(10,14,31,0.7)';
      ctx.beginPath(); ctx.arc(cx2, cy2, 20, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(0,240,255,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(cx2, cy2, 20, 0, Math.PI * 2); ctx.stroke();
      // Direction arrows
      const dirs: [GravityDir, number, number][] = [['up', 0, -12], ['down', 0, 12], ['left', -12, 0], ['right', 12, 0]];
      for (const [d, dx, dy] of dirs) {
        const active = gravityRef.current === d;
        ctx.fillStyle = active ? '#00f0ff' : 'rgba(0,240,255,0.2)';
        if (active) { ctx.shadowColor = '#00f0ff'; ctx.shadowBlur = 8; }
        ctx.beginPath();
        ctx.arc(cx2 + dx, cy2 + dy, active ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
      // Center dot
      ctx.fillStyle = '#b026ff';
      ctx.beginPath(); ctx.arc(cx2, cy2, 2, 0, Math.PI * 2); ctx.fill();
      ctx.restore();

      // Win overlay
      if (wonRef.current) {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.75)';
        ctx.fillRect(0, 0, W, H);
        // Animated victory lines
        for (let i = 0; i < 20; i++) {
          ctx.strokeStyle = `rgba(0,255,153,${0.03 + Math.sin(clock * 0.003 + i) * 0.02})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          const ly = (i * (H / 20) + clock * 0.03) % H;
          ctx.moveTo(0, ly); ctx.lineTo(W, ly); ctx.stroke();
        }
        ctx.shadowColor = '#00ff99'; ctx.shadowBlur = 30;
        ctx.fillStyle = '#00ff99';
        ctx.font = 'bold 38px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('LEVEL COMPLETE', W / 2, H / 2 - 30);
        ctx.shadowBlur = 0;
        // Stars
        const t = parseFloat(String(time));
        const starsEarned = t <= currentLevel.par ? 3 : t <= currentLevel.par * 2 ? 2 : 1;
        ctx.font = '28px sans-serif';
        for (let i = 0; i < 3; i++) {
          ctx.fillStyle = i < starsEarned ? '#ffd700' : 'rgba(255,255,255,0.15)';
          if (i < starsEarned) { ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10; }
          ctx.fillText('★', W / 2 - 30 + i * 30, H / 2 + 5);
          ctx.shadowBlur = 0;
        }
        ctx.fillStyle = '#aaa';
        ctx.font = '14px Rajdhani, sans-serif';
        ctx.fillText(`Time: ${time}s · Par: ${currentLevel.par}s · Deaths: ${deaths} · Shifts: ${shiftCount}`, W / 2, H / 2 + 32);
        ctx.fillStyle = 'rgba(0,240,255,0.85)';
        ctx.font = '12px JetBrains Mono, monospace';
        ctx.fillText(levelIndex < LEVELS.length - 1 ? 'Press N for next level · R to replay' : '🎉 All demo levels complete! Press R to replay', W / 2, H / 2 + 56);
        ctx.restore();
      }

      ctx.restore(); // end shake transform
    };

    const loop = () => { update(); };
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelIndex, resetSignal]);

  useEffect(() => {
    setWon(false); wonRef.current = false; setTime(0); setDeaths(0); setShiftCount(0);
    gravityRef.current = 'down'; setGravity('down'); setGravityLabel('↓ DOWN');
  }, [levelIndex, resetSignal]);

  const zoneColors: Record<string, string> = {
    'Awakening': '#00f0ff', 'Containment': '#3a6bff',
    'Reactor Core': '#b026ff', 'Security Wing': '#ff2bd6', 'The Void': '#ffd700',
  };
  const zoneColor = zoneColors[currentLevel.zone] || '#00f0ff';

  return (
    <div className="space-y-4">
      {/* Level select */}
      <div className="flex flex-wrap gap-1">
        {LEVELS.map((lvl, i) => {
          const comp = completed[lvl.id];
          return (
            <button key={lvl.id} onClick={() => setLevelIndex(i)}
              className={`px-2 py-1.5 text-[11px] font-display border transition flex flex-col items-center min-w-[40px] ${
                i === levelIndex
                  ? 'border-cyan-400 bg-cyan-500/20 text-white shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                  : comp ? 'border-green-500/30 bg-green-500/5 text-green-300 hover:border-green-400/60'
                  : 'border-cyan-500/15 text-slate-500 hover:border-cyan-500/40 hover:text-cyan-200'
              }`}
            >
              <span className="font-bold">{lvl.id}</span>
              <span className="text-[8px] text-yellow-400 mt-0.5">
                {comp ? '★'.repeat(comp.stars) : '☆☆☆'}
              </span>
            </button>
          );
        })}
      </div>

      {/* Status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="px-3 py-1 font-display font-bold text-sm tracking-widest neon-border" style={{ color: '#b026ff', textShadow: '0 0 10px #b026ff' }}>
            {gravityLabel}
          </div>
          <span className="data-line">⏱ <span className="text-white">{String(time).padStart(2, '0')}s</span></span>
          <span className="data-line">💀 <span className="text-white">{deaths}</span></span>
          <span className="data-line">⇅ <span className="text-white">{shiftCount}</span></span>
          {orbsTotal > 0 && (
            <span className="data-line" style={{ color: orbsCollected === orbsTotal ? '#ffd700' : '#888' }}>
              💠 {orbsCollected}/{orbsTotal}
            </span>
          )}
          {plateStatus.total > 0 && (
            <span className="data-line" style={{ color: plateStatus.active === plateStatus.total ? '#ffd700' : '#888' }}>
              ◆ {plateStatus.active}/{plateStatus.total}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {(['up', 'down', 'left', 'right'] as GravityDir[]).map(d => (
            <button key={d} onClick={() => shiftGravity(d)}
              className={`w-9 h-9 text-sm font-display border transition flex items-center justify-center ${
                gravity === d ? 'border-purple-400 bg-purple-500/30 text-white shadow-[0_0_12px_rgba(176,38,255,0.5)]'
                  : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/15'
              }`}>
              {{ up: '↑', down: '↓', left: '←', right: '→' }[d]}
            </button>
          ))}
          <button onClick={() => setResetSignal(s => s + 1)} className="px-3 h-9 text-xs font-display border border-red-500/40 text-red-300 hover:bg-red-500/20 transition">⟲</button>
          {won && levelIndex < LEVELS.length - 1 && (
            <button onClick={() => setLevelIndex(i => i + 1)} className="px-3 h-9 text-xs font-display border border-green-400/60 text-green-300 bg-green-500/10 hover:bg-green-500/25 transition pulse-glow">
              NEXT →
            </button>
          )}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative corner-frame">
        <canvas ref={canvasRef} width={W} height={H} className="demo-canvas" />
      </div>

      {/* Level info bar */}
      <div className="panel p-3 corner-frame flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="font-mono text-[10px] px-1.5 py-0.5 border text-cyan-300" style={{ borderColor: zoneColor + '66', color: zoneColor }}>{currentLevel.zone.toUpperCase()}</span>
            <span className="data-line">LVL {String(currentLevel.id).padStart(2, '0')}</span>
            <span className="font-display font-bold text-white text-sm">{currentLevel.name}</span>
          </div>
          <p className="text-sm text-slate-300">{currentLevel.objective}</p>
        </div>
        <div className="text-right shrink-0">
          <div className="data-line">PAR</div>
          <div className="font-display text-lg font-bold text-white">{currentLevel.par}s</div>
        </div>
      </div>

      {/* Controls */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
        <div><span className="key-cap">←</span><span className="key-cap">→</span> <span className="text-slate-400 ml-1">Move</span></div>
        <div><span className="key-cap">SPACE</span> <span className="text-slate-400 ml-1">Jump</span></div>
        <div><span className="key-cap">Q</span><span className="key-cap">E</span> <span className="text-slate-400 ml-1">↑ / ↓</span></div>
        <div><span className="key-cap">Z</span><span className="key-cap">C</span> <span className="text-slate-400 ml-1">← / →</span></div>
        <div><span className="key-cap">R</span> <span className="text-slate-400 ml-1">Reset</span> <span className="key-cap">N</span> <span className="text-slate-400 ml-1">Next</span></div>
      </div>
      <p className="text-xs text-slate-500 font-mono leading-relaxed">
        <span className="neon-cyan text-[11px]">💡 HINT:</span> {currentLevel.hint}
      </p>
    </div>
  );
}
