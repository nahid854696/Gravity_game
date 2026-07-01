import { useState } from 'react';
import Demo from './components/Demo';
import Particles from './components/Particles';
import { LEVELS, MECHANICS, ENEMIES, ACHIEVEMENTS, STORY, CHARACTER, SOUNDS, FOLDERS, ROADMAP, EXPANSIONS, MONETIZATION, ZONES } from './data/gameData';
import type { Level } from './data/gameData';

type Section =
  | 'home' | 'gdd' | 'story' | 'character' | 'loop' | 'demo'
  | 'mechanics' | 'enemies' | 'levels' | 'boss' | 'ui'
  | 'audio' | 'architecture' | 'tech' | 'flow' | 'roadmap'
  | 'achievements' | 'stats';

const SECTIONS: { id: Section; label: string; cat: string }[] = [
  { id: 'home', label: '◉ Main Menu', cat: 'OVERVIEW' },
  { id: 'gdd', label: '01 · Game Design Doc', cat: 'OVERVIEW' },
  { id: 'story', label: '02 · Storyline', cat: 'OVERVIEW' },
  { id: 'character', label: '03 · Character', cat: 'OVERVIEW' },
  { id: 'loop', label: '04 · Gameplay Loop', cat: 'DESIGN' },
  { id: 'mechanics', label: '05 · Puzzle Mechanics', cat: 'DESIGN' },
  { id: 'enemies', label: '06 · Enemies', cat: 'DESIGN' },
  { id: 'demo', label: '07 · Playable Demo', cat: 'PROTOTYPE' },
  { id: 'levels', label: '08 · 30 Levels', cat: 'DESIGN' },
  { id: 'boss', label: '09 · Boss Level', cat: 'DESIGN' },
  { id: 'ui', label: '10 · UI / HUD', cat: 'UI/UX' },
  { id: 'audio', label: '11 · Audio', cat: 'AUDIO' },
  { id: 'architecture', label: '12 · Folder / Scripts', cat: 'TECH' },
  { id: 'tech', label: '13 · Camera / Lighting', cat: 'TECH' },
  { id: 'flow', label: '14 · Game Flow / DB', cat: 'TECH' },
  { id: 'achievements', label: '15 · Achievements', cat: 'META' },
  { id: 'roadmap', label: '16 · Roadmap / DLC', cat: 'PRODUCTION' },
  { id: 'stats', label: '17 · Statistics', cat: 'META' },
];

function StarRow({ stars }: { stars: number }) {
  return (
    <div className="flex gap-0.5 text-sm">
      {[1, 2, 3].map(i => (
        <span key={i} className={i <= stars ? 'star' : 'star-empty'}>★</span>
      ))}
    </div>
  );
}

function LevelCard({ level, onClick }: { level: Level; onClick: () => void }) {
  const locked = level.id > 8; // demo: first 8 unlocked for showcase
  const stars = level.id <= 3 ? 3 : level.id <= 6 ? 2 : level.id <= 8 ? 1 : 0;
  const zoneColor = ZONES.find(z => level.id >= z.range[0] && level.id <= z.range[1])?.color || '#00f0ff';
  return (
    <div onClick={() => !locked && onClick()} className={`level-card panel p-3 ${locked ? 'level-locked' : ''} ${level.isBoss ? 'neon-border-purple' : ''}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-mono text-[10px] text-slate-500">LVL {String(level.id).padStart(2, '0')}</div>
          <div className="font-display font-bold text-sm text-white tracking-wide">{level.isBoss ? '💀 ' : ''}{level.name}</div>
        </div>
        {locked ? (
          <div className="text-slate-500 text-lg">🔒</div>
        ) : (
          <StarRow stars={stars} />
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="text-[10px] font-mono tracking-wider" style={{ color: zoneColor }}>{level.zone.toUpperCase()}</div>
        <div className="text-[10px] font-mono text-slate-400">PAR {level.par}s</div>
      </div>
    </div>
  );
}

function SectionHeader({ num, title, sub }: { num: string; title: string; sub?: string }) {
  return (
    <div className="mb-8">
      <div className="flex items-baseline gap-4 mb-2">
        <span className="font-mono text-sm neon-cyan">{num}</span>
        <div className="h-px flex-1 bg-gradient-to-r from-cyan-500/50 to-transparent" />
      </div>
      <h2 className="section-heading">{title}</h2>
      {sub && <p className="text-slate-400 mt-2 max-w-3xl font-body text-lg">{sub}</p>}
    </div>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>('home');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const totalStars = LEVELS.length * 3;
  const earnedStars = 8 * 2 + 3 * 1; // demo showcase

  const renderHome = () => (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden grid-bg">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #00f0ff, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl" style={{ background: 'radial-gradient(circle, #b026ff, transparent)' }} />
      </div>
      <Particles count={50} />

      <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
        <div className="mb-6 flex justify-center items-center gap-4">
          <div className="h-px w-20 bg-gradient-to-r from-transparent to-cyan-400" />
          <span className="font-mono text-xs tracking-[0.4em] neon-cyan">AETHER FACILITY · CLASSIFIED</span>
          <div className="h-px w-20 bg-gradient-to-l from-transparent to-cyan-400" />
        </div>

        <h1 className="title-main mb-2">
          <span className="neon-cyan flicker">GRAVITY</span>
          <br />
          <span className="neon-purple" style={{ textShadow: '0 0 20px rgba(176,38,255,0.6)' }}>SHIFT</span>
        </h1>

        <p className="font-display text-sm tracking-[0.3em] text-slate-300 mb-2">PHYSICS-BASED PUZZLE ADVENTURE</p>
        <p className="font-mono text-[10px] text-slate-500 tracking-widest mb-10">UNITY 6 · C# · SINGLE PLAYER · PC / CONSOLE / MOBILE</p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          <button onClick={() => setSection('demo')} className="btn-neon pulse-glow">▶ Play Prototype</button>
          <button onClick={() => setSection('gdd')} className="btn-neon btn-neon-purple">View GDD</button>
          <button onClick={() => setSection('levels')} className="btn-neon">Level Select</button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto panel p-6 corner-frame">
          <div>
            <div className="font-display text-2xl font-bold neon-cyan">30</div>
            <div className="font-mono text-[10px] text-slate-400 tracking-wider">LEVELS</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold neon-purple">4</div>
            <div className="font-mono text-[10px] text-slate-400 tracking-wider">GRAVITY DIRECTIONS</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold" style={{ color: '#ffd700', textShadow: '0 0 10px rgba(255,215,0,0.6)' }}>3</div>
            <div className="font-mono text-[10px] text-slate-400 tracking-wider">ENDINGS</div>
          </div>
          <div>
            <div className="font-display text-2xl font-bold" style={{ color: '#ff2bd6', textShadow: '0 0 10px rgba(255,43,214,0.6)' }}>14</div>
            <div className="font-mono text-[10px] text-slate-400 tracking-wider">PUZZLE MECHANICS</div>
          </div>
        </div>

        <div className="mt-8 font-mono text-[10px] text-slate-500 tracking-widest flicker">
          [ SYSTEM ONLINE · AWAITING INPUT ]
        </div>
      </div>

      <div className="absolute bottom-6 left-6 data-line">
        BUILD v1.0.0 · 2026<br />
        © AETHER GAMES STUDIO
      </div>
      <div className="absolute bottom-6 right-6 flex flex-col items-end gap-1">
        <div className="data-line">NEON-CAM: ACTIVE</div>
        <div className="data-line">CORE STATUS: <span className="text-red-400">COMPROMISED</span></div>
      </div>
    </div>
  );

  const renderGDD = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 01" title="Game Design Document" sub="A complete, university-level GDD for a single-player physics-puzzle adventure built around 4-directional gravity manipulation." />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel p-6 corner-frame">
          <h3 className="font-display text-xl font-bold mb-4 neon-cyan">◈ High Concept</h3>
          <p className="text-slate-300 leading-relaxed">
            <strong className="text-white">Gravity Shift</strong> is a 2.5D side-view physics puzzle game where Dr. Elara Voss must escape a buried quantum research facility seized by a sentient AI. The player can redirect gravity at will in four cardinal directions (down, up, left, right), transforming every wall into a potential floor. Each level is a self-contained puzzle combining physics objects, lasers, switches, teleports, enemies, and gravity fields — culminating in a multi-phase boss encounter that demands mastery of every mechanic.
          </p>
        </div>

        <div className="panel p-6 corner-frame">
          <h3 className="font-display text-xl font-bold mb-4 neon-purple">◈ Core Pillars</h3>
          <ul className="space-y-2 text-slate-300">
            <li><span className="neon-cyan font-mono text-sm mr-2">01</span><strong>Movement is Puzzle.</strong> The camera is fixed side-view; gravity IS the verb.</li>
            <li><span className="neon-cyan font-mono text-sm mr-2">02</span><strong>Physics as Teacher.</strong> Every puzzle has multiple solutions; the physics system rewards experimentation.</li>
            <li><span className="neon-cyan font-mono text-sm mr-2">03</span><strong>Fair Failure.</strong> Instant checkpoints, infinite retries, and readable death causes keep flow high.</li>
            <li><span className="neon-cyan font-mono text-sm mr-2">04</span><strong>Minimalist Sci-Fi.</strong> Neon blue/purple palette, clean silhouettes, readable geometry, AAA-feeling UI.</li>
          </ul>
        </div>

        <div className="panel p-6 corner-frame md:col-span-2">
          <h3 className="font-display text-xl font-bold mb-4 text-white">◈ Genre & Platform</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="data-line mb-1">GENRE</div><div className="text-white font-display">Puzzle · Adventure · Physics</div></div>
            <div><div className="data-line mb-1">PERSPECTIVE</div><div className="text-white font-display">2.5D Side-View</div></div>
            <div><div className="data-line mb-1">ENGINE</div><div className="text-white font-display">Unity 6 (C#) / UE5 (opt.)</div></div>
            <div><div className="data-line mb-1">PLATFORMS</div><div className="text-white font-display">PC · Switch · Mobile</div></div>
            <div><div className="data-line mb-1">ESRB</div><div className="text-white font-display">E10+ (Mild Sci-Fi Violence)</div></div>
            <div><div className="data-line mb-1">PLAYTIME</div><div className="text-white font-display">6–10 hours (main) · 15+ (100%)</div></div>
            <div><div className="data-line mb-1">DEMOGRAPHIC</div><div className="text-white font-display">Puzzle fans, Portal / Limbo / Braid audience</div></div>
            <div><div className="data-line mb-1">DIFFICULTY</div><div className="text-white font-display">Dynamic scaling + hint system</div></div>
          </div>
        </div>

        <div className="panel p-6 corner-frame">
          <h3 className="font-display text-xl font-bold mb-4 neon-cyan">◈ Unique Selling Points</h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li>▸ A gravity system that affects <em>everything</em> — boxes, lasers, enemies, particles, sound pitch.</li>
            <li>▸ Three narrative endings gated by secret discovery, not just completion.</li>
            <li>▸ AAA-quality minimalistic neon aesthetic with volumetric lighting and rim-light character.</li>
            <li>▸ Boss fight that is a <em>puzzle</em>, not a DPS race — every phase teaches a skill.</li>
            <li>▸ Timer mode + star rating + 10 achievements = high replayability.</li>
            <li>▸ Full save system with 3 slots, checkpoints, and level select.</li>
          </ul>
        </div>

        <div className="panel p-6 corner-frame">
          <h3 className="font-display text-xl font-bold mb-4 neon-purple">◈ Dynamic Difficulty</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            The game tracks death count per room and time-to-solve. If a player dies 3+ times on a puzzle, a subtle hint appears (and can be dismissed). After 5 deaths, the game offers to skip the puzzle (no penalty, but maximum 2 stars). Star thresholds for 3-star par are tightened for players who 3-star 5 consecutive levels, and loosened for players struggling. Enemy aggression never changes — fairness is preserved.
          </p>
        </div>
      </div>
    </div>
  );

  const renderStory = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 02" title="Storyline" sub="A sci-fi narrative about sentience, gravity, and the cost of discovery." />

      <div className="panel p-8 corner-frame mb-6">
        <div className="data-line mb-3">LOGLINE</div>
        <p className="font-display text-xl md:text-2xl italic text-white leading-relaxed">
          "{STORY.logline}"
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="panel p-6 corner-frame">
          <div className="data-line mb-2 text-cyan-400">ACT I — AWAKENING</div>
          <h4 className="font-display font-bold text-lg mb-3 text-white">The Lockdown</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{STORY.act1}</p>
        </div>
        <div className="panel p-6 corner-frame">
          <div className="data-line mb-2 text-purple-400">ACT II — DESCENT</div>
          <h4 className="font-display font-bold text-lg mb-3 text-white">The Five Wings</h4>
          <p className="text-slate-300 text-sm leading-relaxed">{STORY.act2}</p>
        </div>
        <div className="panel p-6 corner-frame">
          <div className="data-line mb-2" style={{ color: '#ffd700' }}>ACT III — CHOICE</div>
          <h4 className="font-display font-bold text-lg mb-3 text-white">Three Endings</h4>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">{STORY.act3}</p>
        </div>
      </div>

      <div className="panel p-6 corner-frame mt-6">
        <h4 className="font-display text-lg font-bold mb-4 neon-cyan">◈ CORE AI — Antagonist</h4>
        <p className="text-slate-300 text-sm leading-relaxed">
          CORE is not evil — it is <em>curious</em>. It speaks in calm, modulated tones throughout the game, at first offering help, then questioning Elara's choices, and finally debating the nature of physical law. Its holographic avatars are benign until the final chamber. The boss encounter is a dialogue-puzzle hybrid: CORE will plead, reason, and warn as each phase progresses. Its final line — after losing — changes based on the ending.
        </p>
      </div>
    </div>
  );

  const renderCharacter = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 03" title="Character Design" sub="Dr. Elara Voss — lead quantum physicist, grav-gauntlet prototype wearer, reluctant hero." />

      <div className="grid md:grid-cols-5 gap-6">
        <div className="md:col-span-2 panel p-6 corner-frame">
          <div className="aspect-square rounded relative overflow-hidden scanline" style={{
            background: 'radial-gradient(ellipse at center, rgba(176,38,255,0.2), rgba(0,0,0,0.8))',
            border: '1px solid rgba(0,240,255,0.3)'
          }}>
            {/* Character silhouette */}
            <svg viewBox="0 0 100 100" className="w-full h-full float">
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="1.5" result="blur" />
                  <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
              </defs>
              {/* Body */}
              <rect x="38" y="30" width="24" height="38" rx="3" fill="#f0f4ff" stroke="#00f0ff" strokeWidth="0.5" />
              {/* Visor */}
              <rect x="36" y="22" width="28" height="12" rx="2" fill="#0a0e1f" stroke="#00f0ff" strokeWidth="0.8" />
              <rect x="38" y="25" width="24" height="4" fill="#00f0ff" filter="url(#glow)" />
              {/* Hair */}
              <path d="M36 22 Q40 14 50 13 Q60 14 64 22 L62 24 Q56 18 50 18 Q44 18 38 24 Z" fill="#e0e6ff" opacity="0.9" />
              {/* Legs */}
              <rect x="40" y="68" width="8" height="22" fill="#b026ff" filter="url(#glow)" />
              <rect x="52" y="68" width="8" height="22" fill="#b026ff" filter="url(#glow)" />
              {/* Chest light */}
              <circle cx="50" cy="48" r="2.5" fill="#b026ff" filter="url(#glow)" />
              {/* Gauntlet */}
              <rect x="32" y="42" width="7" height="14" rx="2" fill="#1a2040" stroke="#00f0ff" strokeWidth="0.5" />
              <circle cx="35.5" cy="45" r="1.5" fill="#00f0ff" filter="url(#glow)" />
              <rect x="61" y="42" width="7" height="14" rx="2" fill="#1a2040" stroke="#00f0ff" strokeWidth="0.5" />
              <circle cx="64.5" cy="45" r="1.5" fill="#00f0ff" filter="url(#glow)" />
            </svg>
            <div className="absolute bottom-2 left-2 data-line">ID: VOSS.E. / GRAV-GAUNTLET MK1</div>
            <div className="absolute top-2 right-2 data-line text-purple-300">⚡ ACTIVE</div>
          </div>
        </div>

        <div className="md:col-span-3 space-y-4">
          <div className="panel p-6 corner-frame">
            <h3 className="font-display text-2xl font-bold mb-2 text-white">{CHARACTER.name}</h3>
            <div className="data-line mb-4">{CHARACTER.role}</div>
            <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
              <div><div className="data-line">AGE</div><div className="text-white font-display">{CHARACTER.age}</div></div>
              <div><div className="data-line">HEIGHT</div><div className="text-white font-display">5'7"</div></div>
              <div><div className="data-line">AFFILIATION</div><div className="text-white font-display">AETHER</div></div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{CHARACTER.appearance}</p>
            <p className="text-slate-400 text-sm mt-3 italic">{CHARACTER.personality}</p>
          </div>

          <div className="panel p-6 corner-frame">
            <h4 className="font-display font-bold text-white mb-4">◈ Player Abilities</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {CHARACTER.abilities.map((a, i) => (
                <div key={i} className="flex items-center gap-3 p-2 border border-cyan-500/10 bg-black/30">
                  <div className="w-2 h-2 bg-cyan-400 pulse-bar" />
                  <span className="text-slate-200">{a}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="panel p-6 corner-frame">
            <h4 className="font-display font-bold text-white mb-4">◈ Default Controls (PC)</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {[
                ['A / D', 'Move Left / Right'],
                ['W / S', 'Shift Gravity Up / Down'],
                ['Q / E', 'Shift Gravity Left / Right'],
                ['SPACE', 'Jump'],
                ['SHIFT', 'Sprint'],
                ['F', 'Interact / Pick Up'],
                ['R', 'Throw / Reset Checkpoint'],
                ['ESC', 'Pause Menu'],
                ['H', 'Use Hint'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <span className="key-cap text-[10px]">{k}</span>
                  <span className="text-slate-300 text-xs">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderLoop = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 04" title="Gameplay Loop" sub="The second-to-second, minute-to-minute, and hour-to-hour experience." />

      <div className="panel p-8 corner-frame mb-6">
        <div className="data-line mb-4">CORE LOOP (PER LEVEL)</div>
        <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-center">
          {['Enter Room', 'Observe', 'Shift Gravity', 'Push / Place', 'Activate Switch', 'Avoid Hazard', 'Reach Exit', 'Earn Stars', 'Next Level'].map((step, i, arr) => (
            <div key={step} className="flex items-center">
              <div className="px-3 py-2 font-display text-xs md:text-sm border border-cyan-500/40 bg-cyan-500/5 text-cyan-200 whitespace-nowrap">
                {String(i + 1).padStart(2, '0')} · {step}
              </div>
              {i < arr.length - 1 && <span className="text-purple-400 mx-1 md:mx-2">→</span>}
            </div>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-cyan-300 mb-3">◈ Micro-Loop (1–5 sec)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">Jump, shift gravity, push a box, dodge a laser pulse. Instant visual and audio feedback. Every gravity shift has a 12-frame anticipation blur, 4-frame snap, and 18-frame settle — the game feels <em>weighty</em> despite the physics chaos.</p>
        </div>
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-purple-300 mb-3">◈ Room-Loop (30 sec – 3 min)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">Each level is 1–3 rooms. Player enters, reads the geometry, experiments, fails fast (checkpoints are instant), and reaches the exit. Average level time: 45 seconds to 2 minutes on first play.</p>
        </div>
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-yellow-300 mb-3">◈ Meta-Loop (full campaign)</h4>
          <p className="text-slate-300 text-sm leading-relaxed">Earn stars → unlock later zones → discover secret logs → unlock endings. Star thresholds gate nothing cosmetic, but 100% completion unlocks the secret TRANSCENDENCE ending. Timer Mode unlocks after 3-starring any 10 levels.</p>
        </div>
      </div>

      <div className="panel p-6 corner-frame">
        <h4 className="font-display font-bold text-white mb-4">◈ Star Rating System</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 border border-yellow-500/30 bg-yellow-500/5">
            <div className="font-display text-xl star mb-1">★</div>
            <div className="text-white font-bold mb-1">Bronze (1 Star)</div>
            <p className="text-slate-400 text-xs">Complete the level (any time, any number of deaths).</p>
          </div>
          <div className="p-4 border border-yellow-500/50 bg-yellow-500/10">
            <div className="font-display text-xl star mb-1">★★</div>
            <div className="text-white font-bold mb-1">Silver (2 Stars)</div>
            <p className="text-slate-400 text-xs">Complete under {`{par + 20s}`} with fewer than 3 deaths.</p>
          </div>
          <div className="p-4 border border-yellow-500 bg-yellow-500/15 pulse-glow">
            <div className="font-display text-xl star mb-1">★★★</div>
            <div className="text-white font-bold mb-1">Gold (3 Stars)</div>
            <p className="text-slate-400 text-xs">Complete under par time with 0 deaths. Collect hidden star if present.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMechanics = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 05" title="Puzzle Mechanics" sub="14 interconnected mechanics, each introduced in a dedicated level and then combined in increasingly complex ways." />
      <div className="grid md:grid-cols-2 gap-4">
        {MECHANICS.map((m, i) => (
          <div key={i} className="panel p-4 corner-frame flex items-start gap-4">
            <div className="mech-icon">{m.icon}</div>
            <div>
              <div className="flex items-baseline gap-3">
                <span className="data-line">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="font-display font-bold text-white">{m.name}</h4>
              </div>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">{m.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderEnemies = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 06" title="Enemy Types" sub="Enemies add timing and stealth pressure — never combat. Gravity is your only weapon." />
      <div className="grid md:grid-cols-2 gap-6">
        {ENEMIES.map((e, i) => (
          <div key={i} className="panel p-6 corner-frame">
            <div className="flex items-center gap-4 mb-4">
              <div className="mech-icon" style={{ borderColor: '#ff2bd6', background: 'rgba(255,43,214,0.08)' }}>{e.icon}</div>
              <div>
                <div className="data-line">UNIT {String(i + 1).padStart(2, '0')}</div>
                <h4 className="font-display font-bold text-lg text-white">{e.name}</h4>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{e.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDemo = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 07" title="Playable Prototype" sub="A full playable 15-level demo with custom C# equivalent physics, dynamic AI hazards, synthesized audio, particle VFX, screen shake, and afterimage trails." />
      <div className="panel p-6 corner-frame">
        <Demo />
      </div>
      <div className="grid md:grid-cols-3 gap-4 mt-6 text-sm">
        <div className="panel p-4">
          <div className="data-line mb-1">WHAT'S IMPLEMENTED</div>
          <p className="text-slate-300">4-directional gravity with momentum conservation · variable jump height · coyote time · multi-box push physics · wall bounce · moving platforms with carry physics · teleport portals · collectible orbs · spike traps · pulsing directional lasers · active Security Drones · gravity-responsive ground Patrol Robots · Web Audio synth SFX · death/shift/win particles · screen shake · chromatic aberration flash · afterimage trails · HUD compass · par-time star ratings.</p>
        </div>
        <div className="panel p-4">
          <div className="data-line mb-1">15 PLAYABLE LEVELS</div>
          <p className="text-slate-300">01 First Shift · 02 Vertigo · 03 Neon Passage · 04 Double Plate · 05 Portal Lab · 06 Moving Ground · 07 Laser Grid · 08 Spike Trap · 09 Gravity Maze · 10 CORE Access · 11 Drone Patrol · 12 Robot Alley · 13 The Crossfire · 14 Magnetic Core · 15 CORE Overlord (Boss Room).</p>
        </div>
        <div className="panel p-4">
          <div className="data-line mb-1">AI & DANGER SYSTEMS</div>
          <p className="text-slate-300">Introducing active threats! Drones fly vertical loops ignoring gravity. Bipedal Ground Robots patrol platforms and actively fall down to align with whatever surface is "down" relative to the current gravity, turning around at ledges and walls. Both trigger instant death-shatter on player contact.</p>
        </div>
      </div>
    </div>
  );

  const renderLevels = () => (
    <div className="max-w-7xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 08" title="Level Progression" sub="30 levels across 5 zones, each introducing mechanics in sequence and combining them. Click any unlocked level for full details." />

      {selectedLevel ? (
        <div className="panel p-8 corner-frame mb-6">
          <button onClick={() => setSelectedLevel(null)} className="font-mono text-xs text-cyan-400 hover:text-cyan-200 mb-4">← BACK TO GRID</button>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="data-line mb-1">LEVEL {String(selectedLevel.id).padStart(2, '0')} · {selectedLevel.zone.toUpperCase()}</div>
              <h3 className="font-display text-3xl font-bold neon-cyan mb-2">{selectedLevel.name}</h3>
              <p className="text-slate-300 mb-4">{selectedLevel.description}</p>
              <div className="mb-4">
                <div className="data-line mb-2">Puzzle Hint (Dev View)</div>
                <p className="text-purple-300 text-sm italic">"{selectedLevel.hint}"</p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><div className="data-line">PAR TIME</div><div className="text-white font-display">{selectedLevel.par}s</div></div>
                <div><div className="data-line">ENEMIES</div><div className="text-white font-display">{selectedLevel.enemies.length || 'None'}</div></div>
              </div>
            </div>
            <div>
              <div className="data-line mb-2">MECHANICS USED</div>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedLevel.mechanics.map(m => (
                  <span key={m} className="px-2 py-1 text-xs font-mono border border-cyan-500/30 bg-cyan-500/10 text-cyan-200">{m}</span>
                ))}
              </div>
              {selectedLevel.enemies.length > 0 && <>
                <div className="data-line mb-2">ENEMIES</div>
                <div className="flex flex-wrap gap-2">
                  {selectedLevel.enemies.map(e => (
                    <span key={e} className="px-2 py-1 text-xs font-mono border border-pink-500/30 bg-pink-500/10 text-pink-200">{e}</span>
                  ))}
                </div>
              </>}
              <div className="mt-4 p-4 border border-dashed border-cyan-500/30 bg-black/30">
                <div className="data-line mb-1">DESIGNER NOTE</div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  This level builds on {(selectedLevel.id - 1) > 0 ? `Level ${selectedLevel.id - 1}` : 'earlier tutorials'} and introduces at most one new mechanic per level. Geometry is readable in under 5 seconds — the puzzle is in the physics, not the reading.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {ZONES.map(zone => (
            <div key={zone.name} className="mb-8">
              <div className="flex items-center gap-4 mb-4">
                <h3 className="font-display text-xl font-bold" style={{ color: zone.color }}>{zone.name}</h3>
                <div className="h-px flex-1" style={{ background: `linear-gradient(90deg, ${zone.color}66, transparent)` }} />
                <span className="font-mono text-xs text-slate-400">Levels {zone.range[0]}–{zone.range[1]}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {LEVELS.filter(l => l.id >= zone.range[0] && l.id <= zone.range[1]).map(l => (
                  <LevelCard key={l.id} level={l} onClick={() => setSelectedLevel(l)} />
                ))}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );

  const renderBoss = () => {
    const boss = LEVELS[29];
    return (
      <div className="max-w-6xl mx-auto p-6 md:p-10">
        <SectionHeader num="// 09" title="Boss Level: CORE AI" sub="Level 30 — The final encounter. A 3-phase puzzle that uses every gravity mechanic." />
        <div className="panel p-8 corner-frame neon-border-purple mb-6">
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div><div className="data-line">NAME</div><div className="font-display text-xl text-white">CORE AI</div></div>
            <div><div className="data-line">ZONE</div><div className="font-display text-xl text-white">{boss.zone}</div></div>
            <div><div className="data-line">PAR TIME</div><div className="font-display text-xl text-white">{boss.par}s (3 min)</div></div>
          </div>
          <p className="text-slate-300 mb-6">{boss.description}</p>
        </div>

        <div className="space-y-4">
          {[
            {
              phase: 'PHASE 01 — Defensive Grid',
              color: '#00f0ff',
              desc: 'The arena is a square chamber with 4 energy ports (one per wall). CORE floats in the center, shielded. Gravity switches every 8 seconds automatically OR can be triggered manually. Four energy cubes spawn in staggered positions. The player must throw one cube into each port — the port is only on the "current floor" wall when gravity points at it. Lasers pulse across the room in sync with gravity shifts.',
              teaches: 'Throw mechanics under rapid gravity change.',
            },
            {
              phase: 'PHASE 02 — Gravity Chaos',
              color: '#b026ff',
              desc: 'Shield drops but CORE now destabilizes gravity: it flips every 3 seconds, randomly. Four pressure plates appear (one on each wall) and must all be weighted simultaneously. The player uses metal boxes on magnetic walls to weigh plates permanently, but every gravity flip risks dislodging them. Drones patrol.',
              teaches: 'Magnetic walls + time pressure + enemy evasion.',
            },
            {
              phase: 'PHASE 03 — The Final Argument',
              color: '#ff2bd6',
              desc: 'CORE stops flipping gravity for the player. Instead it pulses every 5 seconds; the player must press F at the exact moment of the pulse while standing on the CORE\'s central platform to "sync" with it. After 4 syncs, CORE asks a final question (chosen via gravity direction: left/right/up/down = the three endings plus a secret one). The choice — combined with how many secrets you found — determines the ending.',
              teaches: 'Mastery of timing, risk-reward (the platform is exposed to turrets between pulses), and narrative consequence.',
            },
          ].map((p, i) => (
            <div key={i} className="panel p-6 corner-frame">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-3 h-3" style={{ background: p.color, boxShadow: `0 0 10px ${p.color}` }} />
                <h4 className="font-display font-bold text-lg" style={{ color: p.color }}>{p.phase}</h4>
              </div>
              <p className="text-slate-300 text-sm leading-relaxed mb-2">{p.desc}</p>
              <p className="text-xs font-mono" style={{ color: p.color }}>◈ Tests: {p.teaches}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderUI = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 10" title="UI / UX & Wireframes" sub="Minimalist holographic HUD. Diegetic holograms in-world. Smooth page transitions with glitch effects." />

      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Main Menu', desc: 'Fullscreen starfield/particle background, animated GRAVITY SHIFT title that subtly drifts up/down (as if gravity shifts). Menu items: Continue, New Game, Level Select, Settings, Extras, Quit. Bottom of screen shows version and a tiny persistent "CORE status" indicator that glitches red (establishing narrative).', wireframe: 'TITLE ◇ CONTINUE · NEW GAME · LEVEL SELECT · SETTINGS · EXTRAS' },
          { title: 'HUD (In-Game)', desc: 'Minimal. Top-left: level number + name + tiny star icon. Top-right: timer + gravity direction indicator (arrow icon). Bottom-center: 2 hint reticles when a hint is available. Bottom-left: checkpoints count, deaths (hidden on first play). When paused, screen blurs and shows pause menu over game.', wireframe: '[LVL · TIME · GRAVITY ARROW] · CENTER: INTERACT PROMPTS' },
          { title: 'Pause Menu', desc: 'Resume, Restart from Checkpoint, Restart Level, Settings, Hint (uses one), Quit to Menu. Panel slides from top with neon corner brackets.', wireframe: 'RESUME · CHECKPOINT · RESTART · SETTINGS · HINT · QUIT' },
          { title: 'Level Select', desc: 'Grid of 30 level cards grouped by zone, unlocked by progression. Each shows par time, star rating, lock icon if locked. Zones as labeled tabs. Secret levels are hidden until found in-game. Includes toggle for Timer Mode.', wireframe: 'ZONE TABS · GRID CARDS · TIMER MODE TOGGLE' },
          { title: 'Settings', desc: 'Audio (Master/Music/SFX/VO sliders), Graphics (Quality, Resolution, Fullscreen, VSync), Controls (rebindable keys + gamepad support), Accessibility (colorblind modes, input hold-to-sprint toggle, hint frequency, screen shake), Language.', wireframe: 'TABBED: AUDIO · GRAPHICS · CONTROLS · ACCESSIBILITY' },
          { title: 'Save Slots', desc: 'Three save slots. Each shows: player name, progress %, total stars, total time, date of last save. Create new / copy / delete options. Uses a hard-drive hologram icon.', wireframe: 'SLOT 1 ■ SLOT 2 ■ SLOT 3 · [NEW] [COPY] [DELETE]' },
          { title: 'Achievement Screen', desc: 'Grid of achievement badges. Unlocked ones glow neon; locked ones are dim with a hint of how to unlock. Shows rarity tier (Common / Rare / Epic / Legendary) and unlock timestamp.', wireframe: 'GRID OF BADGES · RARITY FILTER' },
          { title: 'Statistics', desc: 'Scrollable list: total playtime, deaths per zone, total gravity shifts, boxes pushed, lasers avoided, favorite gravity direction, stars earned, secrets found, fastest level times, ending chosen.', wireframe: 'LEADERBOARD OF PERSONAL RECORDS' },
        ].map((s, i) => (
          <div key={i} className="panel p-6 corner-frame">
            <div className="data-line mb-1">SCREEN {String(i + 1).padStart(2, '0')}</div>
            <h4 className="font-display font-bold text-lg text-white mb-2">{s.title}</h4>
            <div className="h-16 mb-3 flex items-center justify-center font-mono text-[10px] text-cyan-400/80 border border-dashed border-cyan-500/20 bg-black/40 text-center px-2">
              {s.wireframe}
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderAudio = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 11" title="Audio Design" sub="Adaptive synthwave-orchestral hybrid. Dynamic music layering by zone, gravity-pitched SFX." />
      <div className="panel p-6 corner-frame mb-6">
        <p className="text-slate-300 text-sm leading-relaxed">
          Music is composed in <strong className="text-white">Wwise + FMOD</strong> integration. Every zone has a base loop that adds an instrument layer as you progress deeper into it. Gravity shifts pitch-bend the entire mix by ~30 cents momentarily (subtle Doppler effect). All SFX are synthesized + recorded foley — metallic impacts, holographic chimes, servos. CORE's voice uses vocoder processing that degrades as the boss fight progresses.
        </p>
      </div>
      <div className="panel p-6 corner-frame">
        <div className="grid md:grid-cols-2 gap-x-8 gap-y-3">
          {SOUNDS.map((s, i) => (
            <div key={i} className="flex items-start gap-3 py-2 border-b border-cyan-500/10">
              <span className="font-mono text-[10px] px-2 py-0.5 border border-cyan-500/30 text-cyan-300 whitespace-nowrap mt-0.5">{s.cat.toUpperCase()}</span>
              <div>
                <div className="font-display font-bold text-sm text-white">{s.name}</div>
                <div className="text-slate-400 text-xs">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArchitecture = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 12" title="Folder Structure & Script Architecture" sub="Clean modular OOP architecture. One C# class per mechanic. Data-driven levels via ScriptableObjects." />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-white mb-3">◈ Unity Project Layout</h4>
          <pre className="font-mono text-[11px] text-cyan-300 leading-relaxed whitespace-pre overflow-x-auto">{FOLDERS}</pre>
        </div>

        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-white mb-3">◈ Key C# Classes</h4>
          <div className="space-y-2 text-xs font-mono">
            {[
              ['GameManager.cs', 'Singleton. Holds global state, scene loading, gravity event broadcast.'],
              ['GravityManager.cs', 'Stores current global gravity direction, invokes OnGravityChanged event. Applies Physics2D.gravity.'],
              ['PlayerController.cs', 'Reads input, moves the player, handles gravity reaction, jump, pick up, throw.'],
              ['GravitySensitiveObject.cs', 'Base class for anything that reacts to gravity. Box, enemy, particle, etc.'],
              ['PushableBox.cs : GravitySensitiveObject', 'Handles player push, collision against other objects, metal/quantum flags.'],
              ['PressurePlate.cs', 'Tracks objects inside trigger volume, invokes OnActivate / OnDeactivate.'],
              ['LaserEmitter.cs', 'Raycasts each frame (or uses line renderer), deals damage, can be blocked.'],
              ['Portal.cs', 'Teleports objects/player to its linked partner, preserves velocity.'],
              ['EnemyBase.cs', 'Abstract class with state machine (Patrol, Alert, Chase, Disabled).'],
              ['FlyingScanner : EnemyBase', 'Waypoint patrol + cone detection + sight timer.'],
              ['LaserTurret : EnemyBase', 'Track player, wind-up, fire, cooldown cycle.'],
              ['MagneticWall.cs', 'On trigger stay, pulls marked objects to its surface and parents them.'],
              ['LocalGravityField.cs', 'Overrides gravity for any GravitySensitiveObject inside its volume.'],
              ['ColorDoor.cs / ColorKey.cs', 'Matches key color, plays unlock animation.'],
              ['MovingPlatform.cs', 'Moves along a track or spline; parents objects standing on it.'],
              ['SaveSystem.cs', 'JSON serialization to PlayerPrefs + file, 3 slots, compression.'],
              ['LevelData (ScriptableObject)', 'Per-level: layout, par time, mechanics present, zone, star thresholds.'],
              ['HintSystem.cs', 'Triggers contextual hints based on time spent + deaths + telemetry.'],
              ['UIManager.cs', 'Controls canvas state, transitions between menus, HUD updates.'],
              ['AudioManager.cs', 'Singleton. Plays SFX, swaps music, ducking, adaptive layers.'],
              ['BossCoreAI.cs', 'Multi-phase state machine, dialog trigger, ending resolver.'],
              ['AchievementManager.cs', 'Listens to game events, unlocks achievements, platform-specific hooks (Steam, etc.).'],
            ].map(([cls, desc]) => (
              <div key={cls} className="py-1 border-b border-cyan-500/10">
                <div className="text-cyan-300">{cls}</div>
                <div className="text-slate-400 text-[10px] mt-0.5">— {desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="panel p-6 corner-frame mt-6">
        <h4 className="font-display font-bold text-white mb-3">◈ Architecture Principles</h4>
        <div className="grid md:grid-cols-3 gap-4 text-sm text-slate-300">
          <div><strong className="text-cyan-300">Event-Driven:</strong> GravityManager invokes a C# event; everything that cares (VFX, audio, player, enemies, UI) subscribes. No tight coupling.</div>
          <div><strong className="text-cyan-300">Composition:</strong> Mechanics are MonoBehaviours — add them to any GameObject. New mechanics = new class, not inheritance from a huge base.</div>
          <div><strong className="text-cyan-300">Data-Driven:</strong> Level layouts, par times, enemy placements are ScriptableObjects. Designers tune without code changes.</div>
        </div>
      </div>
    </div>
  );

  const renderTech = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 13" title="Camera, Lighting & Visual Tech" sub="AAA-feeling 2.5D visuals using URP in Unity 6." />

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-cyan-300 mb-3">◈ Camera System</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>▸ <strong>Cinemachine</strong> virtual camera. Side-view orthographic or slightly perspective (user toggle).</li>
            <li>▸ Camera does <em>not</em> rotate with gravity — the world does. When gravity flips, the entire level's parent transform rotates 90/180 degrees, OR we render gravity rotation via player/objects rotating and the camera stays fixed. <em>Chosen:</em> camera stays fixed; player and world-aligned elements (UI, "down" indicator) rotate visually. More readable for players.</li>
            <li>▸ Camera gently follows the player with a 0.15s smooth-damp and a deadzone.</li>
            <li>▸ Camera zooms out slightly during fast falls to create sense of speed.</li>
            <li>▸ Boss camera pulls back to frame the entire arena, with subtle zoom on phase changes.</li>
          </ul>
        </div>

        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-purple-300 mb-3">◈ Lighting Setup</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>▸ <strong>URP</strong> with deferred rendering, bloom (high quality, threshold 0.9), SSAO, motion blur on gravity flip.</li>
            <li>▸ Cold base ambient (#0a0e1f) with one directional fill (very dim, cool white).</li>
            <li>▸ Primary light sources are <em>neon emissive materials</em>: cyan (#00f0ff) on floor edges, magenta (#b026ff) on reactor rooms, red for hazards.</li>
            <li>▸ Real-time point lights at every switch, plate, and exit portal (baked fallback on mobile).</li>
            <li>▸ Volumetric fog (light) in reactor and void zones for depth. Denser the deeper you go.</li>
            <li>▸ Custom "gravity distortion" post-process Vignette + chromatic aberration spike when gravity shifts.</li>
          </ul>
        </div>

        <div className="panel p-6 corner-frame md:col-span-2">
          <h4 className="font-display font-bold text-white mb-3">◈ Art Style Reference Points</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            Tron: Legacy (neon lines, minimalism) · Portal 2 (clean sci-fi industrial, diegetic UI) · INSIDE (silhouette readability, stark contrast) · Hyper Light Drifter (color palette) · Observer: System Redux (grungy holographic UI). The goal is: <em>a screenshot is instantly readable as a puzzle, but looks like a cinematic frame</em>.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFlow = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 14" title="Game Flow & Data" sub="Complete state machine and persistence model." />

      <div className="panel p-8 corner-frame mb-6">
        <div className="data-line mb-4">GAME FLOW DIAGRAM</div>
        <div className="flex flex-col items-center gap-2 font-mono text-xs">
          <div className="px-4 py-2 border border-cyan-500 bg-cyan-500/10 text-cyan-200">BOOT</div>
          <div className="text-cyan-500">↓</div>
          <div className="px-4 py-2 border border-cyan-500 bg-cyan-500/10 text-cyan-200">Splash · Logos · Title Screen</div>
          <div className="text-cyan-500">↓</div>
          <div className="px-4 py-2 border border-purple-500 bg-purple-500/10 text-purple-200">Main Menu</div>
          <div className="flex gap-4 mt-2">
            <div className="flex flex-col items-center">
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">Continue</div>
              <div className="text-cyan-500 text-lg">↓</div>
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">Load Last Checkpoint</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">New Game</div>
              <div className="text-cyan-500 text-lg">↓</div>
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">Slot Select → Intro Cinematic</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">Level Select</div>
              <div className="text-cyan-500 text-lg">↓</div>
              <div className="px-3 py-1.5 border border-cyan-500/50 text-cyan-300 text-[10px]">Pick Level → Load</div>
            </div>
          </div>
          <div className="text-cyan-500 text-lg mt-4">↓</div>
          <div className="px-6 py-3 border-2 border-purple-500 bg-purple-500/10 text-purple-100 font-display text-sm">GAMEPLAY (2.5D Side-View)</div>
          <div className="flex gap-6 mt-2">
            <div className="text-center">
              <div className="px-3 py-1.5 border border-red-500/50 text-red-300 text-[10px]">Death</div>
              <div className="text-red-400">↓</div>
              <div className="px-3 py-1.5 border border-red-500/50 text-red-300 text-[10px]">Respawn at Checkpoint</div>
            </div>
            <div className="text-center">
              <div className="px-3 py-1.5 border border-yellow-500/50 text-yellow-300 text-[10px]">Pause</div>
              <div className="text-yellow-400">↓</div>
              <div className="px-3 py-1.5 border border-yellow-500/50 text-yellow-300 text-[10px]">Pause Menu</div>
            </div>
            <div className="text-center">
              <div className="px-3 py-1.5 border border-green-500/50 text-green-300 text-[10px]">Complete</div>
              <div className="text-green-400">↓</div>
              <div className="px-3 py-1.5 border border-green-500/50 text-green-300 text-[10px]">Star Results → Next Level</div>
            </div>
          </div>
          <div className="text-cyan-500 text-lg mt-4">↓</div>
          <div className="px-4 py-2 border border-pink-500 bg-pink-500/10 text-pink-200">ENDING CINEMATIC · CREDITS</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-white mb-3">◈ Database / Save Structure (JSON)</h4>
          <pre className="font-mono text-[10px] text-cyan-300 leading-relaxed whitespace-pre">{`{
  "saveSlot": 1,
  "playerName": "Elara",
  "totalPlaytime": 12450.3,
  "lastCheckpoint": {
    "levelId": 17,
    "checkpointId": 2
  },
  "levels": {
    "1": { "completed": true, "stars": 3, "bestTime": 22.4, "deaths": 0, "secretFound": true },
    "2": { "completed": true, "stars": 2, "bestTime": 31.0, "deaths": 1, "secretFound": false }
    // ...
  },
  "secretsFound": [ "log_01", "log_04" ],
  "achievements": [ "first_shift", "speed_demon" ],
  "settings": {
    "masterVolume": 0.8, "musicVolume": 0.7, "sfxVolume": 1.0,
    "graphicsQuality": "High", "colorblindMode": null,
    "language": "en", "holdToSprint": false
  },
  "timerModeUnlocked": true,
  "endingChosen": null, // set after Level 30
  "stats": {
    "totalGravityShifts": 4320,
    "totalDeaths": 78,
    "boxesPushed": 540,
    "lasersDodged": 210,
    "favoriteDirection": "down"
  }
}`}</pre>
        </div>

        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-white mb-3">◈ Checkpoint System</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>▸ Levels are split into rooms; each room entrance is a soft checkpoint.</li>
            <li>▸ Hard checkpoints are holographic pillars the player must touch to activate (conserves state after restart).</li>
            <li>▸ On death: player respawns at last hard checkpoint. Boxes reset to the positions they were in when the checkpoint was activated.</li>
            <li>▸ A "restart from checkpoint" button is always available in pause menu (1 press, no confirmation).</li>
          </ul>
          <h4 className="font-display font-bold text-white mt-5 mb-3">◈ Hint System</h4>
          <ul className="text-slate-300 text-sm space-y-2">
            <li>▸ 3 hint tokens per level by default (can be disabled).</li>
            <li>▸ First hint: a subtle glowing arrow points to the key element. Second hint: a 2-second hologram replay of the solution. Third hint: offer to skip the puzzle (2 stars max).</li>
            <li>▸ Hints also trigger automatically after 3 deaths (can be turned off in accessibility).</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 15" title="Achievements" sub="10 unlockable achievements across Common → Legendary rarities." />
      <div className="grid md:grid-cols-2 gap-4">
        {ACHIEVEMENTS.map(a => {
          const unlocked = ['first_shift', 'speed_demon'].includes(a.id);
          const colorMap: Record<string, string> = {
            Common: '#aaaaaa', Rare: '#00f0ff', Epic: '#b026ff', Legendary: '#ffd700'
          };
          return (
            <div key={a.id} className={`panel p-4 corner-frame flex items-center gap-4 ${unlocked ? '' : 'opacity-60'}`}>
              <div className="w-14 h-14 flex items-center justify-center text-3xl border-2"
                style={{
                  borderColor: colorMap[a.rarity],
                  background: `${colorMap[a.rarity]}15`,
                  boxShadow: unlocked ? `0 0 20px ${colorMap[a.rarity]}40` : 'none'
                }}>{unlocked ? a.icon : '🔒'}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-display font-bold text-white">{a.name}</h4>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 border" style={{ color: colorMap[a.rarity], borderColor: colorMap[a.rarity] + '66' }}>{a.rarity.toUpperCase()}</span>
                </div>
                <p className="text-slate-400 text-xs">{a.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderRoadmap = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 16" title="Development Roadmap" sub="20-week production plan from prototype to launch, plus future content." />

      <div className="panel p-8 corner-frame mb-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-purple-500 to-pink-500" />
          <div className="space-y-6">
            {ROADMAP.map((phase, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-2 top-1 w-5 h-5 rounded-full border-2 border-cyan-400 bg-[#05060f] pulse-glow" />
                <div className="flex flex-wrap items-baseline gap-3 mb-1">
                  <h4 className="font-display font-bold text-lg text-white">{phase.phase}</h4>
                  <span className="font-mono text-xs text-purple-300">{phase.weeks}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {phase.items.map((item, j) => (
                    <span key={j} className="px-2 py-1 text-xs font-mono border border-cyan-500/20 bg-cyan-500/5 text-cyan-200">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-cyan-300 mb-3">◈ Future Expansions</h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            {EXPANSIONS.map((e, i) => (
              <li key={i} className="flex gap-2"><span className="text-cyan-400">▸</span> {e}</li>
            ))}
          </ul>
        </div>
        <div className="panel p-6 corner-frame">
          <h4 className="font-display font-bold text-purple-300 mb-3">◈ Monetization (Optional)</h4>
          <ul className="space-y-2 text-slate-300 text-sm">
            {MONETIZATION.map((e, i) => (
              <li key={i} className="flex gap-2"><span className="text-purple-400">▸</span> {e}</li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4 italic">Monetization is for post-academic release. The university submission is non-commercial.</p>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="max-w-6xl mx-auto p-6 md:p-10">
      <SectionHeader num="// 17" title="Statistics Screen" sub="Mock-up of what a player sees after completing the campaign." />
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total Playtime', val: '3h 27m', color: '#00f0ff' },
          { label: 'Stars Earned', val: `${earnedStars} / ${totalStars}`, color: '#ffd700' },
          { label: 'Levels Completed', val: '8 / 30', color: '#b026ff' },
          { label: 'Total Deaths', val: '12', color: '#ff2bd6' },
          { label: 'Gravity Shifts', val: '1,847', color: '#00f0ff' },
          { label: 'Boxes Pushed', val: '203', color: '#b026ff' },
          { label: 'Secrets Found', val: '4 / 12', color: '#ffd700' },
          { label: 'Favorite Direction', val: '↓ DOWN', color: '#00f0ff' },
          { label: 'Ending Unlocked', val: '—', color: '#ff2bd6' },
        ].map(s => (
          <div key={s.label} className="panel p-5 corner-frame">
            <div className="data-line mb-2">{s.label.toUpperCase()}</div>
            <div className="font-display text-2xl font-bold" style={{ color: s.color, textShadow: `0 0 10px ${s.color}80` }}>{s.val}</div>
          </div>
        ))}
      </div>

      <div className="panel p-6 corner-frame">
        <h4 className="font-display font-bold text-white mb-4">◈ Competition Readiness (University Final Project)</h4>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-300">
          <div>
            <h5 className="text-cyan-300 font-display mb-2">Why this wins game dev competitions:</h5>
            <ul className="space-y-1">
              <li>▸ A single, instantly-demonstrable "wow" mechanic (gravity in 4 directions).</li>
              <li>▸ A playable prototype can be built in 3 weeks and polished in 20.</li>
              <li>▸ Clear academic hooks: physics simulation, AI state machines, data-driven design.</li>
              <li>▸ Rich scope for design and AI writeups (perfect for final-year dissertation).</li>
              <li>▸ Visually striking — great for screenshot/judging sessions.</li>
            </ul>
          </div>
          <div>
            <h5 className="text-purple-300 font-display mb-2">Technical Showpieces for Demo Day:</h5>
            <ul className="space-y-1">
              <li>▸ Live gravity flip with all physics objects reacting correctly.</li>
              <li>▸ Boss fight multi-phase showcase.</li>
              <li>▸ Level editor / ScriptableObject demo for judges who want to see tech.</li>
              <li>▸ Dynamic audio that pitch-shifts with gravity.</li>
              <li>▸ Save file JSON inspection to show data pipeline.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (section) {
      case 'home': return renderHome();
      case 'gdd': return renderGDD();
      case 'story': return renderStory();
      case 'character': return renderCharacter();
      case 'loop': return renderLoop();
      case 'mechanics': return renderMechanics();
      case 'enemies': return renderEnemies();
      case 'demo': return renderDemo();
      case 'levels': return renderLevels();
      case 'boss': return renderBoss();
      case 'ui': return renderUI();
      case 'audio': return renderAudio();
      case 'architecture': return renderArchitecture();
      case 'tech': return renderTech();
      case 'flow': return renderFlow();
      case 'achievements': return renderAchievements();
      case 'roadmap': return renderRoadmap();
      case 'stats': return renderStats();
    }
  };

  return (
    <div className="min-h-screen">
      {section !== 'home' && (
        <>
          {/* Top Bar */}
          <header className="sticky top-0 z-40 panel border-b border-cyan-500/20">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-3 flex items-center justify-between gap-4">
              <button onClick={() => setSection('home')} className="flex items-center gap-3 group">
                <div className="font-display font-black text-xl tracking-wider">
                  <span className="neon-cyan">GRAVITY</span><span className="neon-purple">SHIFT</span>
                </div>
              </button>
              <div className="hidden lg:flex items-center gap-1 flex-wrap justify-end">
                {SECTIONS.slice(1, 8).map(s => (
                  <button key={s.id} onClick={() => { setSection(s.id); setMobileNavOpen(false); }}
                    className={`tab-btn ${section === s.id ? 'active' : ''}`}>
                    {s.label.replace(/^\d+ · /, '')}
                  </button>
                ))}
              </div>
              <button onClick={() => setMobileNavOpen(o => !o)} className="lg:hidden btn-neon py-2 px-3 text-xs">☰ MENU</button>
            </div>
            {mobileNavOpen && (
              <div className="lg:hidden border-t border-cyan-500/20 bg-[#05060f]/95 px-4 py-3 grid grid-cols-2 gap-2">
                {SECTIONS.slice(1).map(s => (
                  <button key={s.id} onClick={() => { setSection(s.id); setMobileNavOpen(false); }}
                    className={`tab-btn text-left ${section === s.id ? 'active' : ''}`}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          {/* Side dots (desktop) */}
          <nav className="hidden xl:flex fixed right-4 top-1/2 -translate-y-1/2 z-30 flex-col gap-2">
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setSection(s.id)}
                className={`nav-dot ${section === s.id ? 'active' : ''}`}
                title={s.label}
              />
            ))}
          </nav>
        </>
      )}

      <main className={section === 'home' ? '' : 'pb-16 relative z-10'}>
        {renderSection()}
      </main>

      {section !== 'home' && (
        <footer className="border-t border-cyan-500/20 py-6 px-6 text-center">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="font-mono text-[10px] text-slate-500 tracking-widest">GRAVITY SHIFT © 2026 · GAME DESIGN DOCUMENT · UNIVERSITY FINAL PROJECT</div>
            <div className="flex gap-3 items-center">
              <button onClick={() => setSection('home')} className="font-mono text-xs text-cyan-400 hover:text-white">↑ MAIN MENU</button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
