// ═══════════════════════════════════════════════════
//  LEARN NUMBERS — 50 Níveis
//  Símbolos: dígitos 1-9 e operadores +, -, ×
// ═══════════════════════════════════════════════════

// Paleta de cores por símbolo
const SYMBOL_COLORS = {
  '1':'#FF6B6B','2':'#FF8E53','3':'#FFD93D','4':'#6BCB77',
  '5':'#4ECDC4','6':'#45B7D1','7':'#A78BFA','8':'#F472B6',
  '9':'#FB923C','+':'#34D399','-':'#60A5FA','×':'#C084FC',
  '0':'#FCD34D'
};

function getSymbolColor(sym) {
  return SYMBOL_COLORS[sym] || '#ffffff';
}

// Conjuntos de símbolos por dificuldade
const S_EASY   = '123456';           // 6 símbolos
const S_MED    = '123456789';        // 9 símbolos
const S_HARD   = '123456789+-';      // 11 símbolos
const S_EXPERT = '123456789+-×';     // 12 símbolos

const LEVELS = [
  // ── FÁCIL (1–10) ────────────────────────────────
  {n:'First Steps',    cols:4,rows:4,layers:1,pairs:6,  syms:S_EASY,   layout:'flat',    time:0,   hints:5},
  {n:'Warm Up',        cols:4,rows:4,layers:1,pairs:7,  syms:S_EASY,   layout:'flat',    time:0,   hints:5},
  {n:'Getting Started',cols:5,rows:4,layers:1,pairs:8,  syms:S_EASY,   layout:'flat',    time:0,   hints:4},
  {n:'Low Tower',      cols:5,rows:4,layers:2,pairs:10, syms:S_EASY,   layout:'pyramid', time:0,   hints:4},
  {n:'First Blocks',   cols:6,rows:4,layers:2,pairs:10, syms:S_EASY,   layout:'pyramid', time:200, hints:4},
  {n:'Simple Cross',   cols:6,rows:5,layers:2,pairs:12, syms:S_MED,    layout:'cross',   time:200, hints:4},
  {n:'Growing',        cols:6,rows:5,layers:2,pairs:13, syms:S_MED,    layout:'cross',   time:180, hints:3},
  {n:'Diamond',        cols:7,rows:5,layers:2,pairs:14, syms:S_MED,    layout:'diamond', time:180, hints:3},
  {n:'Plus Time',      cols:7,rows:5,layers:2,pairs:14, syms:S_MED+'+',layout:'flat',    time:170, hints:3},
  {n:'Minus Moves',    cols:7,rows:5,layers:2,pairs:15, syms:S_MED+'-',layout:'pyramid', time:170, hints:3},

  // ── MÉDIO (11–25) ────────────────────────────────
  {n:'Pyramid',        cols:7,rows:5,layers:2,pairs:16, syms:S_MED,    layout:'pyramid', time:160, hints:3},
  {n:'Big Tower',      cols:7,rows:6,layers:3,pairs:18, syms:S_MED,    layout:'pyramid', time:160, hints:3},
  {n:'Big Cross',      cols:8,rows:6,layers:3,pairs:18, syms:S_MED,    layout:'cross',   time:150, hints:3},
  {n:'Twenty Pairs',   cols:8,rows:6,layers:3,pairs:20, syms:S_HARD,   layout:'cross',   time:150, hints:3},
  {n:'Castle',         cols:8,rows:6,layers:3,pairs:20, syms:S_HARD,   layout:'castle',  time:140, hints:3},
  {n:'Fortress',       cols:8,rows:7,layers:3,pairs:22, syms:S_HARD,   layout:'castle',  time:140, hints:2},
  {n:'Big Diamond',    cols:9,rows:7,layers:3,pairs:22, syms:S_HARD,   layout:'diamond', time:130, hints:2},
  {n:'Four Floors',    cols:9,rows:7,layers:4,pairs:24, syms:S_HARD,   layout:'pyramid', time:130, hints:2},
  {n:'Spiral',         cols:9,rows:7,layers:4,pairs:24, syms:S_HARD,   layout:'spiral',  time:120, hints:2},
  {n:'Big Spiral',     cols:10,rows:7,layers:4,pairs:26,syms:S_HARD,   layout:'spiral',  time:120, hints:2},
  {n:'Operators',      cols:8,rows:6,layers:3,pairs:20, syms:S_EXPERT, layout:'pyramid', time:130, hints:2},
  {n:'Math Castle',    cols:9,rows:6,layers:3,pairs:22, syms:S_EXPERT, layout:'castle',  time:125, hints:2},
  {n:'Times Table',    cols:9,rows:7,layers:3,pairs:24, syms:S_EXPERT, layout:'cross',   time:120, hints:2},
  {n:'Citadel',        cols:10,rows:7,layers:4,pairs:26,syms:S_EXPERT, layout:'castle',  time:115, hints:2},
  {n:'Great Pyramid',  cols:10,rows:8,layers:4,pairs:28,syms:S_EXPERT, layout:'pyramid', time:110, hints:2},

  // ── DIFÍCIL (26–40) ─────────────────────────────
  {n:'Epic Cross',     cols:10,rows:8,layers:4,pairs:28,syms:S_EXPERT, layout:'cross',   time:105, hints:2},
  {n:'Epic Diamond',   cols:10,rows:8,layers:5,pairs:30,syms:S_EXPERT, layout:'diamond', time:100, hints:2},
  {n:'Labyrinth',      cols:11,rows:8,layers:5,pairs:30,syms:S_EXPERT, layout:'spiral',  time:100, hints:1},
  {n:'Bastille',       cols:11,rows:8,layers:5,pairs:32,syms:S_EXPERT, layout:'castle',  time:95,  hints:1},
  {n:'Colossus',       cols:11,rows:9,layers:5,pairs:32,syms:S_EXPERT, layout:'pyramid', time:95,  hints:1},
  {n:'Master',         cols:12,rows:9,layers:5,pairs:34,syms:S_EXPERT, layout:'spiral',  time:90,  hints:1},
  {n:'Grand Master',   cols:12,rows:9,layers:6,pairs:34,syms:S_EXPERT, layout:'diamond', time:88,  hints:1},
  {n:'Legend',         cols:12,rows:9,layers:6,pairs:36,syms:S_EXPERT, layout:'castle',  time:85,  hints:1},
  {n:'Epic',           cols:12,rows:9,layers:6,pairs:36,syms:S_EXPERT, layout:'pyramid', time:82,  hints:1},
  {n:'Transcendent',   cols:13,rows:9,layers:6,pairs:36,syms:S_EXPERT, layout:'spiral',  time:80,  hints:1},
  {n:'Ultra',          cols:13,rows:10,layers:6,pairs:38,syms:S_EXPERT,layout:'castle',  time:78,  hints:1},
  {n:'Titan',          cols:13,rows:10,layers:6,pairs:38,syms:S_EXPERT,layout:'pyramid', time:75,  hints:1},

  // ── EXPERT (41–50) ──────────────────────────────
  {n:'Omega',          cols:13,rows:10,layers:7,pairs:40,syms:S_EXPERT,layout:'spiral',  time:72,  hints:1},
  {n:'Infinity',       cols:14,rows:10,layers:7,pairs:40,syms:S_EXPERT,layout:'diamond', time:70,  hints:1},
  {n:'Singularity',    cols:14,rows:10,layers:7,pairs:42,syms:S_EXPERT,layout:'castle',  time:68,  hints:1},
  {n:'Quantum',        cols:14,rows:10,layers:7,pairs:42,syms:S_EXPERT,layout:'pyramid', time:65,  hints:1},
  {n:'Nebula',         cols:14,rows:11,layers:7,pairs:44,syms:S_EXPERT,layout:'spiral',  time:63,  hints:1},
  {n:'Cosmos',         cols:14,rows:11,layers:7,pairs:44,syms:S_EXPERT,layout:'diamond', time:60,  hints:1},
  {n:'Supernova',      cols:15,rows:11,layers:7,pairs:46,syms:S_EXPERT,layout:'castle',  time:58,  hints:1},
  {n:'Black Hole',     cols:15,rows:11,layers:8,pairs:46,syms:S_EXPERT,layout:'spiral',  time:55,  hints:1},
  {n:'Big Bang',       cols:15,rows:11,layers:8,pairs:48,syms:S_EXPERT,layout:'pyramid', time:52,  hints:1},
  {n:'Wormhole',      cols:15,rows:11,layers:8,pairs:46,syms:S_EXPERT,layout:'diamond', time:57,  hints:1},
  {n:'Dark Matter',    cols:15,rows:12,layers:8,pairs:48,syms:S_EXPERT,layout:'castle',  time:54,  hints:1},
  {n:'Multiverse',     cols:15,rows:12,layers:8,pairs:48,syms:S_EXPERT,layout:'cross',   time:51,  hints:1},
  {n:'GODMODE',        cols:15,rows:12,layers:8,pairs:50,syms:S_EXPERT,layout:'spiral',  time:50,  hints:1},
];
