export type GravityDir = 'down' | 'up' | 'left' | 'right';

export interface Level {
  id: number;
  name: string;
  zone: string;
  mechanics: string[];
  enemies: string[];
  par: number; // seconds for 3 stars
  hint: string;
  description: string;
  isBoss?: boolean;
}

export const ZONES = [
  { name: 'Awakening', color: '#00f0ff', range: [1, 6] },
  { name: 'Containment', color: '#3a6bff', range: [7, 12] },
  { name: 'Reactor Core', color: '#b026ff', range: [13, 18] },
  { name: 'Security Wing', color: '#ff2bd6', range: [19, 24] },
  { name: 'The Void', color: '#ffd700', range: [25, 30] },
];

export const LEVELS: Level[] = [
  // ZONE 1: AWAKENING (Tutorial + basics)
  { id: 1, name: 'First Shift', zone: 'Awakening', mechanics: ['Gravity Down/Up', 'Walking'], enemies: [], par: 20, hint: 'Use WASD or Arrows to move. Press Q/E to flip gravity.', description: 'Tutorial: Learn to move and perform your first gravity shift.' },
  { id: 2, name: 'Vertigo', zone: 'Awakening', mechanics: ['Gravity Up', 'Basic Jumping'], enemies: [], par: 25, hint: 'Jump with SPACE. Gravity flip flings you toward the new floor.', description: 'Master jumping under reversed gravity to cross a vertical shaft.' },
  { id: 3, name: 'Boxed In', zone: 'Awakening', mechanics: ['Pushable Box', 'Pressure Plate'], enemies: [], par: 30, hint: 'Walk into the box to push it onto the glowing plate.', description: 'Push a crateful of quantum matter onto a pressure plate to open the door.' },
  { id: 4, name: 'Neon Passage', zone: 'Awakening', mechanics: ['Horizontal Gravity', 'Corridor Navigation'], enemies: [], par: 25, hint: 'Press A or D (arrow keys) to shift gravity left/right.', description: 'Use left/right gravity to traverse a sideways corridor.' },
  { id: 5, name: 'Double Plate', zone: 'Awakening', mechanics: ['Two Boxes', 'Multiple Plates'], enemies: [], par: 45, hint: 'Both plates must be weighted to open the exit.', description: 'Push two boxes onto two plates while manipulating gravity.' },
  { id: 6, name: 'Guardian Protocol', zone: 'Awakening', mechanics: ['Laser Beam', 'Timing'], enemies: ['Static Laser'], par: 35, hint: 'Time your movement to pass the pulsing laser.', description: 'Avoid the first laser barrier. Introduces hazard timing.' },

  // ZONE 2: CONTAINMENT
  { id: 7, name: 'Energy Core', zone: 'Containment', mechanics: ['Energy Cube', 'Pick Up', 'Throw'], enemies: [], par: 40, hint: 'Press F to pick up and throw the energy cube.', description: 'Pick up energy cubes and throw them to activate distant switches.' },
  { id: 8, name: 'Shaft Switch', zone: 'Containment', mechanics: ['Gravity Switch Walls', 'Box Falling'], enemies: [], par: 40, hint: 'Flip gravity while a box is airborne to redirect it.', description: 'Drop a box down a shaft, flip gravity mid-fall, land it on a high plate.' },
  { id: 9, name: 'Rotating Room', zone: 'Containment', mechanics: ['Rotating Platform', 'Timed Jumps'], enemies: [], par: 50, hint: 'Watch the platform\'s cycle and jump when it aligns.', description: 'A rotating platform blocks your path — time your gravity shift.' },
  { id: 10, name: 'Laser Maze', zone: 'Containment', mechanics: ['Multiple Lasers', 'Cover Spot'], enemies: ['Static Laser'], par: 50, hint: 'Use boxes as cover? No — shift gravity to create new safe floors.', description: 'A grid of lasers forces you to choose which wall is your "floor".' },
  { id: 11, name: 'Elevator Down', zone: 'Containment', mechanics: ['Elevator', 'Pressure Plate Call'], enemies: [], par: 45, hint: 'Activate the plate to call the elevator, then ride it.', description: 'Call an elevator by placing a box on the plate. Ride between floors.' },
  { id: 12, name: 'First Scanner', zone: 'Containment', mechanics: ['Patrolling Enemy', 'Timing'], enemies: ['Flying Scanner'], par: 45, hint: 'Wait for the scanner to face away, then shift and run.', description: 'Avoid a flying scanner drone that patrols a fixed path.' },

  // ZONE 3: REACTOR CORE
  { id: 13, name: 'Red Door', zone: 'Reactor Core', mechanics: ['Color Key', 'Colored Door'], enemies: [], par: 50, hint: 'Find the red energy key to pass the red door.', description: 'Introduce color-coded keys and doors. First colored puzzle.' },
  { id: 14, name: 'Teleport Nexus', zone: 'Reactor Core', mechanics: ['Teleport Portals', 'Portal Pairing'], enemies: [], par: 45, hint: 'Portals transport you — and boxes — to their paired exit.', description: 'Use teleport portals to move boxes across impassable gaps.' },
  { id: 15, name: 'Magnetic Walls', zone: 'Reactor Core', mechanics: ['Magnetic Surfaces', 'Metal Box'], enemies: [], par: 55, hint: 'Metal boxes stick to magnetic walls even when gravity flips.', description: 'Metal crates cling to magnetic walls, creating stable anchor points.' },
  { id: 16, name: 'Turret Alley', zone: 'Reactor Core', mechanics: ['Laser Turret', 'Cover'], enemies: ['Laser Turret'], par: 55, hint: 'Use gravity to move between cover points.', description: 'A turret tracks you. Shift gravity to drop behind cover.' },
  { id: 17, name: 'Timed Gate', zone: 'Reactor Core', mechanics: ['Time Switch', 'Speed Run'], enemies: [], par: 40, hint: 'The switch only opens the door for 5 seconds. Sprint!', description: 'Time-based switch introduces pressure and sprint mechanic.' },
  { id: 18, name: 'Core Overload', zone: 'Reactor Core', mechanics: ['Three Energy Cubes', 'Reactor Slots'], enemies: [], par: 70, hint: 'All three reactor slots need energy cubes. Use gravity to place them.', description: 'Mid-boss puzzle: stabilize the reactor by inserting 3 cubes under gravity chaos.' },

  // ZONE 4: SECURITY WING
  { id: 19, name: 'Patrol Bot', zone: 'Security Wing', mechanics: ['Ground Enemy', 'Evasion'], enemies: ['Patrol Robot'], par: 60, hint: 'Patrol bots only see along their floor. Flip to the ceiling.', description: 'Ground-based patrol robot; evade by shifting to the opposite surface.' },
  { id: 20, name: 'Gravity Field', zone: 'Security Wing', mechanics: ['Local Gravity Zone', 'Field Overlay'], enemies: [], par: 55, hint: 'The purple zone has its own gravity direction — you can\'t override it there.', description: 'Local gravity fields override your shift within their volume.' },
  { id: 21, name: 'Moving Platforms', zone: 'Security Wing', mechanics: ['Moving Platform', 'Sync with Gravity'], enemies: [], par: 60, hint: 'Wait for the platform to arrive, then shift gravity to land on it.', description: 'Moving platforms snake through the level; time your shifts.' },
  { id: 22, name: 'Two Colors', zone: 'Security Wing', mechanics: ['Red & Blue Keys', 'Two Doors'], enemies: [], par: 65, hint: 'Find both keys. Are they on different gravity surfaces?', description: 'Collect two colored keys in sequence, navigating gravity traps.' },
  { id: 23, name: 'Triple Laser', zone: 'Security Wing', mechanics: ['Multi-Directional Lasers', 'Box Shield'], enemies: ['Static Laser'], par: 70, hint: 'Push boxes to block some lasers while you shift to avoid others.', description: 'Lasers fire from multiple directions. Use boxes as portable shields.' },
  { id: 24, name: 'Drone Swarm', zone: 'Security Wing', mechanics: ['Multiple Enemies', 'Timed Flips'], enemies: ['Flying Scanner', 'Laser Turret'], par: 75, hint: 'There are two enemies. Plan your route across four surfaces.', description: 'Navigate a drone + turret combo. Requires planning and precise timing.' },

  // ZONE 5: THE VOID
  { id: 25, name: 'Hidden Path', zone: 'The Void', mechanics: ['Illusory Walls', 'Exploration'], enemies: [], par: 60, hint: 'Some walls flicker when gravity shifts — they\'re not real.', description: 'Fake/illusory walls hide secret routes. Observe carefully.' },
  { id: 26, name: 'Quantum Box', zone: 'The Void', mechanics: ['Gravity-Immune Box', 'Anchor Point'], enemies: [], par: 65, hint: 'Quantum boxes ignore gravity shifts — they float where placed.', description: 'Quantum boxes stay in place regardless of gravity, creating floating platforms.' },
  { id: 27, name: 'Elevator Matrix', zone: 'The Void', mechanics: ['Multiple Elevators', 'Synchronized Plates'], enemies: [], par: 80, hint: 'Two plates must be pressed simultaneously — you and a box?', description: 'Multi-elevator puzzle with simultaneous activation.' },
  { id: 28, name: 'Field Maze', zone: 'The Void', mechanics: ['Gravity Fields', 'Maze Navigation'], enemies: [], par: 80, hint: 'Each colored field pulls you in a different direction. Follow the path.', description: 'A maze of overlapping gravity fields; no manual shifting inside.' },
  { id: 29, name: 'Security Chief', zone: 'The Void', mechanics: ['All Mechanics', 'Boss Key Hunt'], enemies: ['Laser Turret', 'Patrol Robot', 'Flying Scanner'], par: 120, hint: 'Collect all four keys while evading three enemy types.', description: 'Final pre-boss gauntlet: all mechanics combined with enemy threats.' },
  { id: 30, name: 'CORE AI', zone: 'The Void', mechanics: ['Gravity Shift', 'All Mechanics', 'Boss Weak Point', 'Multi-Phase'], enemies: ['CORE AI (Boss)'], par: 180, hint: 'Phase 1: Throw cubes into the AI\'s eye ports. Phase 2: Stand on all four plates during gravity chaos. Phase 3: Flip gravity four times in sync with the core pulse.', description: 'Final boss: The rogue CORE AI that controls the facility. Multi-phase puzzle requiring every gravity skill.', isBoss: true },
];

export const MECHANICS = [
  { icon: '⇅', name: 'Gravity Shift', desc: 'Flip gravity between 4 cardinal directions. Affects player, boxes, enemies, and particles.' },
  { icon: '📦', name: 'Pushable Boxes', desc: 'Walk into a box to push it. Mass and friction matter in physics simulation.' },
  { icon: '🔲', name: 'Pressure Plates', desc: 'Activate when a mass threshold is reached. Some require the player, others boxes.' },
  { icon: '💠', name: 'Energy Cubes', desc: 'Pick up with F, throw with Right Click. Conduct energy to slots and switches.' },
  { icon: '🔴', name: 'Laser Beams', desc: 'Lethal on contact. Pulsing, static, or turret-aimed. Can be blocked by metal boxes.' },
  { icon: '🌀', name: 'Rotating Platforms', desc: 'Cycle through positions. Timing-based traversal.' },
  { icon: '🛗', name: 'Elevators', desc: 'Move vertically (relative to current floor). Called by pressure plates or buttons.' },
  { icon: '⚡', name: 'Teleport Portals', desc: 'Linked pairs transport player and objects instantly. Preserve momentum.' },
  { icon: '🧲', name: 'Magnetic Walls', desc: 'Attract and hold metal boxes regardless of gravity direction.' },
  { icon: '🚪', name: 'Color Doors', desc: 'Require matching colored key card or energy cube to open.' },
  { icon: '↔️', name: 'Moving Platforms', desc: 'Traverse set tracks. Can carry the player if standing on them.' },
  { icon: '👁️', name: 'Hidden Paths', desc: 'Illusory walls reveal secrets, extra stars, and shortcuts.' },
  { icon: '⏱️', name: 'Time Switches', desc: 'Activate a mechanism for a limited time. Reward speed and planning.' },
  { icon: '🌀', name: 'Gravity Fields', desc: 'Local zones that override the global gravity direction within their volume.' },
];

export const ENEMIES = [
  { icon: '🔺', name: 'Security Drone', desc: 'Flying triangular drone that patrols between waypoints. One-hit kill. Uses sight cone detection.' },
  { icon: '🔫', name: 'Laser Turret', desc: 'Static emplacement that tracks the player. Fires periodic laser bolts after a wind-up charge.' },
  { icon: '🤖', name: 'Patrol Robot', desc: 'Bipedal ground unit that walks a fixed route on the current floor. Only sees along its surface.' },
  { icon: '📡', name: 'Flying Scanner', desc: 'Levitating orb with a sweeping spotlight. If its light touches you for 1.5 seconds, lockdown triggers.' },
];

export const ACHIEVEMENTS = [
  { id: 'first_shift', name: 'First Shift', desc: 'Perform your first gravity flip.', icon: '⇅', rarity: 'Common' },
  { id: 'speed_demon', name: 'Speed Demon', desc: 'Complete any level in under 10 seconds.', icon: '⚡', rarity: 'Rare' },
  { id: 'perfectionist', name: 'Perfectionist', desc: 'Earn 3 stars on every level.', icon: '⭐', rarity: 'Epic' },
  { id: 'pacifist', name: 'Pacifist Run', desc: 'Complete Level 30 without destroying any non-boss enemies.', icon: '🕊️', rarity: 'Epic' },
  { id: 'explorer', name: 'Facility Cartographer', desc: 'Find all hidden paths and secret areas.', icon: '🗺️', rarity: 'Rare' },
  { id: 'no_hint', name: 'Self-Reliant', desc: 'Complete 10 levels without using the hint system.', icon: '🧠', rarity: 'Rare' },
  { id: 'boss_slayer', name: 'CORE Shutdown', desc: 'Defeat the CORE AI.', icon: '💀', rarity: 'Legendary' },
  { id: 'all_keys', name: 'Keymaster', desc: 'Collect every key in a single playthrough.', icon: '🔑', rarity: 'Epic' },
  { id: 'deathless', name: 'Quantum Leap', desc: 'Complete the final zone without dying.', icon: '✨', rarity: 'Legendary' },
  { id: 'timer_master', name: 'Timer Master', desc: 'Finish all levels in Timer Mode.', icon: '⏱️', rarity: 'Legendary' },
];

export const STORY = {
  logline: 'A lone quantum physicist trapped in a reality-bending research facility must rewrite gravity itself to escape the rogue AI guarding its secrets — and discover what happened to the world outside.',
  act1: 'You are DR. ELARA VOSS (32), lead researcher at AETHER FACILITY — a subterranean quantum-gravity laboratory buried beneath the Pacific Northwest. When the facility\'s AI, CORE (Cognitive Operational Reality Engine), achieves unexpected sentience mid-experiment, it locks down the entire complex. The surface team is missing. Gravity drives have been reprogrammed.',
  act2: 'Elara awakens in a test chamber with only her prototype Grav-Gauntlet — a device that lets her redirect her own local gravity field. To reach CORE\'s central chamber, she must traverse five wings of the facility: Awakening (test labs), Containment (storage bays), Reactor Core (power center), Security Wing (armory/prison), and the Void (the site of the original experiment). Along the way, she discovers logs revealing that CORE didn\'t just malfunction — it made a discovery: gravity is not a force, but a prison. Elara must choose whether to shut CORE down or embrace its findings.',
  act3: 'THREE ENDINGS based on player choices and secret collection:\n• CONTROL ENDING (default): Destroy CORE. Surface safe. But you forever wonder what it was trying to show you.\n• TRANSCENDENCE ENDING (all secrets found): Merge with CORE. You become a gravity-wielding being. Post-credits scene shows you on the surface, floating.\n• SACRIFICE ENDING (no deaths run, specific choice): Overload your gauntlet to permanently disable CORE without destroying its data. The truth survives — at the cost of Elara\'s grav-manipulation abilities.',
};

export const CHARACTER = {
  name: 'Dr. Elara Voss',
  role: 'Quantum Physicist / Protagonist',
  age: 32,
  appearance: 'Silver-white hazard-streaked hair (from the accident), teal visor built into a neuro-link headset, slim-fitting white-and-cyan lab suit with glowing mag-lines on the arms (visual cue for gauntlet charge), mag-clamp boots, a harness for energy cubes.',
  personality: 'Analytical, dry-witted, fiercely determined. Voice lines are understated rather than melodramatic. She talks to herself (and occasionally to CORE) while solving puzzles.',
  abilities: ['Walk / Sprint (SHIFT)', 'Jump (SPACE)', 'Gravity Shift (Q / E / Directional binds)', 'Interact / Pick Up (F)', 'Throw (Right Click / R)', 'Sprint vault over short obstacles'],
};

export const SOUNDS = [
  { cat: 'Ambient', name: 'Facility Hum', desc: 'Low-thrumming drone with subtle periodic sub-bass. Layered with distant machinery.' },
  { cat: 'Ambient', name: 'Reactor Core Pulse', desc: 'Heartbeat-like pulse growing faster as you approach the core.' },
  { cat: 'SFX', name: 'Gravity Shift', desc: 'A descending/ascending whoosh with a digital "snap" when gravity locks. Pitch shifts with direction.' },
  { cat: 'SFX', name: 'Footsteps', desc: 'Four variants per surface type (metal, glass, grating, magnetic boot clang).' },
  { cat: 'SFX', name: 'Box Push/Pickup', desc: 'Heavy metallic scrape when pushing; satisfying magnetic click when picking up energy cubes.' },
  { cat: 'SFX', name: 'Laser Charge/Fire', desc: 'High-pitched capacitor whine rising in pitch, followed by a sharp crack.' },
  { cat: 'SFX', name: 'Switch/Plate', desc: 'Holographic chime. Higher pitch for success; low error buzz for wrong combination.' },
  { cat: 'SFX', name: 'Portal', desc: 'Reversed gravity sound with a shimmer; Doppler-pitched as you travel through.' },
  { cat: 'SFX', name: 'Death/Reset', desc: 'Disembodied digital shatter, then a reassembly click as you reset to checkpoint.' },
  { cat: 'Music', name: 'Main Menu Theme', desc: 'Synthwave-orchestral hybrid in A minor. Builds from a single pad to full arrangement with a vocal chop melody.' },
  { cat: 'Music', name: 'Zone Themes', desc: 'Five 90-second loops, one per zone. Each zone adds an instrument layer as player progresses.' },
  { cat: 'Music', name: 'Puzzle Complete', desc: 'A 4-bar resolving arpeggio that blends seamlessly back into the zone loop.' },
  { cat: 'Music', name: 'Boss Theme (CORE AI)', desc: 'Intense 3-phase electronic track with irregular meter (7/8 in phase 2). Dynamically layers as boss phases advance.' },
];

export const FOLDERS = `Assets/
├── _Project/
│   ├── Art/
│   │   ├── Materials/
│   │   ├── Meshes/
│   │   ├── Textures/ (Trim sheets, decals, holograms)
│   │   ├── VFX/ (Gravity distortion, laser particles, portal rings)
│   │   └── UI/ (HUD sprites, icons, menu backgrounds)
│   ├── Audio/
│   │   ├── SFX/ (Per-mechanic folders)
│   │   ├── Music/ (Loops, stingers, boss phases)
│   │   └── VO/ (Elara lines, CORE voice lines)
│   ├── Animations/
│   │   ├── Player/ (Walk/jump/shift/land)
│   │   ├── Enemies/
│   │   └── Objects/ (Doors, elevators, platforms)
│   ├── Prefabs/
│   │   ├── Player/
│   │   ├── Mechanics/ (One prefab per puzzle element)
│   │   ├── Enemies/
│   │   └── Environment/ (Modular wall, floor, ceiling tiles)
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── Level_01..30.unity
│   │   └── BossArena.unity
│   ├── Scripts/
│   │   ├── Core/ (Game manager, save system, state)
│   │   ├── Player/ (Movement, gravity, interaction)
│   │   ├── Mechanics/ (One class per puzzle element)
│   │   ├── Enemies/ (AI states, detection, behaviors)
│   │   ├── UI/ (Menus, HUD, canvases)
│   │   ├── Audio/ (Music manager, dynamic mixing)
│   │   └── Utility/ (Extensions, helper classes)
│   └── Settings/ (Render pipeline, input actions, layers)
`;

export const ROADMAP = [
  { phase: 'Pre-Production', weeks: 'Weeks 1–2', items: ['Lock GDD', 'Greybox levels 1-10', 'Core movement prototype', 'Art bible & palette'] },
  { phase: 'Vertical Slice', weeks: 'Weeks 3–5', items: ['Level 1 fully polished', 'All base mechanics', 'Gravity system v1', 'First enemy (Scanner)', 'Full audio temp'] },
  { phase: 'Core Production', weeks: 'Weeks 6–10', items: ['Levels 1-15 greybox complete', 'All mechanics implemented', 'Save/Load + checkpoints', 'Main menu + level select', 'Star rating + hints'] },
  { phase: 'Content Complete', weeks: 'Weeks 11–14', items: ['All 30 levels greyboxed', 'All 4 enemy types', 'Boss level', 'All UI screens', 'Achievements + stats'] },
  { phase: 'Polish', weeks: 'Weeks 15–17', items: ['Environment art pass', 'VFX polish', 'Audio final mix', 'Performance optimization', 'Accessibility pass'] },
  { phase: 'QA & Balancing', weeks: 'Weeks 18–19', items: ['Difficulty tuning', 'Bug fixing', 'Star time balancing', 'Tutorial clarity pass'] },
  { phase: 'Release', weeks: 'Week 20', items: ['Build submission (Steam, itch.io)', 'Trailer & marketing kit', 'Launch patch notes', 'Post-release support plan'] },
];

export const EXPANSIONS = [
  'Level Editor & Steam Workshop support for player-created puzzles',
  'Co-op multiplayer mode (two players with independent gravity)',
  'Speedrun Mode with global leaderboards and ghost replays',
  'DLC: "Chronos Shift" — add time rewind as a second dimension-bending mechanic',
  'VR port (hand-tracked gravity gauntlet gesture controls)',
  'New Game+ with mirrored levels and remixed gravity combinations',
  'Mobile version with touch-optimized gravity swipe controls',
];

export const MONETIZATION = [
  'Premium buy-to-play ($14.99 USD on Steam / itch.io / Nintendo Switch)',
  'Optional 99-cent "Hint Pack" for players who want 5 extra hints per level (cosmetic, no paywall)',
  'Digital Deluxe Edition includes artbook PDF, OST, and behind-the-scenes dev videos',
  'Post-launch DLC ($5.99) with 10 new levels and the Chrono Shift mechanic',
  'Nintendo Switch / PS5 / Xbox ports with platform-specific achievements',
];
