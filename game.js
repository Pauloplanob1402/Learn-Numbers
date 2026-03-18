// ═══════════════════════════════════════════════════
//  LEARN NUMBERS — Engine (Hooked + Hábitos Atômicos)
// ═══════════════════════════════════════════════════

const SAVE_KEY  = 'learnnumbers_v1';
const FREE_LEVELS = 10; // Níveis gratuitos

let state = {
  level: 0, selected: null, tiles: [],
  moves: 0, score: 0, coins: 0,
  hints: 3, timerInt: null, timeLeft: 0,
  active: false, hintTiles: [],
  combo: 0, comboTimer: null,
  premium: false,
  streak: 0, lastPlayDate: null,
  totalScore: 0,
};

// ─── SAVE/LOAD ─────────────────────────────────────
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}');
    state.coins      = d.coins      || 0;
    state.premium    = d.premium    || false;
    state.streak     = d.streak     || 0;
    state.lastPlayDate = d.lastPlayDate || null;
    state.totalScore = d.totalScore || 0;
    return d;
  } catch(e) { return {}; }
}
function save() {
  const d = load();
  d.coins      = state.coins;
  d.premium    = state.premium;
  d.streak     = state.streak;
  d.lastPlayDate = state.lastPlayDate;
  d.totalScore = state.totalScore;
  localStorage.setItem(SAVE_KEY, JSON.stringify(d));
}
function getLevelStars(i) {
  const d = load();
  return d['lvl_'+i] || 0;
}
function saveLevelStars(i, stars) {
  const d = load();
  if (!d['lvl_'+i] || d['lvl_'+i] < stars) d['lvl_'+i] = stars;
  localStorage.setItem(SAVE_KEY, JSON.stringify(d));
}
function isUnlocked(i) {
  if (i === 0) return true;
  if (state.premium) return true;
  if (i < FREE_LEVELS) return getLevelStars(i-1) > 0;
  return state.premium && getLevelStars(i-1) > 0;
}

// ─── STREAK (Hábitos Atômicos — identidade diária) ──
function checkStreak() {
  const today = new Date().toDateString();
  const last  = state.lastPlayDate;
  if (!last) {
    state.streak = 1;
  } else if (last === today) {
    // já jogou hoje
  } else {
    const diff = (new Date(today) - new Date(last)) / 86400000;
    if (diff === 1) {
      state.streak++;
      // Hooked: recompensa variável — streak milestone
      if ([3,7,14,30].includes(state.streak)) {
        setTimeout(() => showStreakModal(state.streak), 800);
        SoundEngine.playStreak();
        addCoins(state.streak * 10);
      }
    } else if (diff > 1) {
      state.streak = 1; // quebrou o streak
    }
  }
  state.lastPlayDate = today;
  save();
  updateStreakUI();
}

function updateStreakUI() {
  document.getElementById('streak-count').textContent  = state.streak;
  document.getElementById('streak-levels').textContent = state.streak;
  document.getElementById('streak-game-count').textContent = state.streak;
}

function showStreakModal(days) {
  const msgs = {
    3:'You\'re building a habit! 🔥',
    7:'One full week! You\'re unstoppable! 💪',
    14:'Two weeks of math mastery! 🧠',
    30:'30 DAYS! You\'re a legend! 👑'
  };
  document.getElementById('streak-modal-title').textContent = days + ' Day Streak!';
  document.getElementById('streak-modal-msg').textContent   = msgs[days] || 'Keep it up!';
  openModal('modal-streak');
}

// ─── COINS (Nudge — recompensa visível) ─────────────
function addCoins(n) {
  state.coins += n;
  save();
  updateCoinsUI();
  SoundEngine.playCoins();
}
function updateCoinsUI() {
  document.getElementById('coin-count').textContent   = state.coins;
  document.getElementById('coins-levels').textContent = state.coins;
}

// ─── RANKING (Contagious — social proof) ────────────
function getLeaderboard() {
  const d = load();
  const board = d.leaderboard || [];
  // Adiciona o jogador atual
  const me = { name: d.playerName || 'You', score: state.totalScore };
  const existing = board.findIndex(x => x.name === me.name);
  if (existing >= 0) { if (me.score > board[existing].score) board[existing].score = me.score; }
  else board.push(me);
  // Bots para dar senso de competição (Nudge)
  const bots = [
    {name:'MathWiz99',score:48200},{name:'NumMaster',score:35600},
    {name:'CalcKing',score:28900},{name:'PlusHero',score:21400},
    {name:'TimesAce',score:15800},{name:'QuickCalc',score:9200},
  ];
  bots.forEach(b => { if (!board.find(x => x.name === b.name)) board.push(b); });
  return board.sort((a,b) => b.score - a.score).slice(0,10);
}
function showRanking() {
  const board = getLeaderboard();
  const list  = document.getElementById('ranking-list');
  const medals = ['🥇','🥈','🥉'];
  list.innerHTML = board.map((p,i) => `
    <div class="rank-item">
      <span class="rank-pos">${medals[i]||'#'+(i+1)}</span>
      <span class="rank-name">${p.name}</span>
      <span class="rank-score">🪙 ${p.score.toLocaleString()}</span>
    </div>`).join('');
  showScreen('screen-ranking');
}

// ─── PREMIUM (Lean Startup — monetização simples) ────
function activatePremium() {
  // Integração real: substitua por Stripe/PIX
  // Por agora simula ativação para demo
  alert('🔧 Configure payment in js/payment.js\n\nFor demo: premium activated!');
  state.premium = true;
  save();
  document.getElementById('ad-banner').classList.add('hidden');
  document.body.classList.add('premium-active');
  showMenu();
}
function showPremium() { showScreen('screen-premium'); }

// ─── SCREENS ────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}
function showMenu()        { stopTimer(); checkStreak(); updateCoinsUI(); showScreen('screen-menu'); }
function showHowTo()       { showScreen('screen-howto'); }
function showLevelSelect() { stopTimer(); buildLevelGrid(); showScreen('screen-levels'); }
function goToLevels()      { closeModal('modal-confirm'); showLevelSelect(); }
function confirmBack()     { if (state.active) openModal('modal-confirm'); else showLevelSelect(); }
function closeModal(id)    { document.getElementById(id).classList.add('hidden'); }
function openModal(id)     { document.getElementById(id).classList.remove('hidden'); }

// ─── LEVEL GRID (Hooked — progress + próximo unlock) ─
function buildLevelGrid() {
  const grid = document.getElementById('levels-grid');
  grid.innerHTML = '';
  LEVELS.forEach((lvl, i) => {
    const stars    = getLevelStars(i);
    const unlocked = isUnlocked(i);
    const isPrem   = i >= FREE_LEVELS && !state.premium;
    const btn      = document.createElement('button');
    let cls = stars > 0 ? 'completed' : (isPrem ? 'premium-locked' : (unlocked ? 'unlocked' : 'locked'));
    btn.className = 'level-btn ' + cls;
    const starStr = stars > 0 ? '⭐'.repeat(stars)+'☆'.repeat(3-stars) : (isPrem ? '⭐' : (unlocked ? '' : '🔒'));
    btn.innerHTML = '<span>'+(i+1)+'</span><span class="level-stars">'+starStr+'</span>';
    btn.title = lvl.n + (isPrem ? ' — Premium' : '');
    if (unlocked && !isPrem) { (function(idx){ btn.onclick = function(){ startLevel(idx); }; })(i); }
    else if (isPrem) btn.onclick = showPremium;
    grid.appendChild(btn);
  });
}

// ─── LAYOUT GENERATOR ────────────────────────────────
function generateLayout(lvl) {
  const {cols,rows,layers,layout} = lvl;
  const set = {}, pos = [];
  function add(c,r,l) {
    if(c<0||r<0||c>=cols||r>=rows||l<0) return;
    const k=c+','+r+','+l;
    if(set[k]) return; set[k]=1;
    pos.push({col:c,row:r,layer:l});
  }
  if (layout==='flat') {
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) add(c,r,0);
  } else if (layout==='pyramid') {
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) add(c,r,0);
    for(let l=1;l<layers;l++) for(let c=l;c<cols-l;c++) for(let r=l;r<rows-l;r++) add(c,r,l);
  } else if (layout==='cross') {
    const mc=Math.floor(cols/2),mr=Math.floor(rows/2);
    for(let c=0;c<cols;c++) for(let dr=-1;dr<=1;dr++) add(c,mr+dr,0);
    for(let r=0;r<rows;r++) for(let dc=-1;dc<=1;dc++) add(mc+dc,r,0);
    for(let l=1;l<layers;l++) for(let c=mc-1;c<=mc+1;c++) for(let r=mr-1;r<=mr+1;r++) add(c,r,l);
  } else if (layout==='diamond') {
    const cx=(cols-1)/2,cy=(rows-1)/2;
    for(let l=0;l<layers;l++){
      const sc=cx-l,sr=cy-l; if(sc<=0||sr<=0) break;
      for(let c=0;c<cols;c++) for(let r=0;r<rows;r++)
        if(Math.abs(c-cx)/sc+Math.abs(r-cy)/sr<=1.05) add(c,r,l);
    }
  } else if (layout==='castle') {
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++)
      if(c===0||c===cols-1||r===0||r===rows-1||(c%2===0&&r%2===0)) add(c,r,0);
    for(let l=1;l<layers;l++) for(let c=l;c<cols-l;c+=2) for(let r=l;r<rows-l;r+=2) add(c,r,l);
  } else if (layout==='spiral') {
    for(let c=0;c<cols;c++) for(let r=0;r<rows;r++) add(c,r,0);
    for(let l=1;l<layers;l++) for(let c=l;c<cols-l;c++) for(let r=l;r<rows-l;r++) if((c+r)%2===0) add(c,r,l);
  }
  return pos;
}

function buildTiles(lvl) {
  const pos   = generateLayout(lvl);
  const syms  = lvl.syms.split('');
  const max   = Math.floor(pos.length/2);
  const pairs = Math.min(lvl.pairs, max);
  const needed= pairs*2;
  shuffle(pos);
  const used = pos.slice(0, needed);
  const pool = [];
  for(let i=0;i<pairs;i++) pool.push(syms[i%syms.length],syms[i%syms.length]);
  shuffle(pool);
  return used.map((p,i)=>({id:i,col:p.col,row:p.row,layer:p.layer,sym:pool[i],removed:false}));
}

function shuffle(a) {
  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}
  return a;
}

// ─── TILE FREE CHECK ─────────────────────────────────
function isFree(tile, tiles) {
  if (tile.removed) return false;
  for (const o of tiles) {
    if (o.removed||o.id===tile.id) continue;
    if (o.layer===tile.layer+1&&o.col===tile.col&&o.row===tile.row) return false;
  }
  return true;
}

// ─── ADAPTIVE SIZING ─────────────────────────────────
const TW_MAX=86,TW_MIN=28,TW_RATIO=1.18;
function calcSize(cols,rows,maxL,aw,ah) {
  for(let tw=TW_MAX;tw>=TW_MIN;tw--){
    const th=Math.round(tw*TW_RATIO),lo=Math.max(3,Math.round(tw*0.09));
    if(cols*tw+maxL*lo+8<=aw && rows*th+maxL*lo+8<=ah) return{tw,th,lo};
  }
  const tw=TW_MIN; return{tw,th:Math.round(tw*TW_RATIO),lo:3};
}

// ─── RENDER ──────────────────────────────────────────
function renderBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';
  const all    = state.tiles;
  const active = all.filter(t=>!t.removed);
  if (!active.length) { updateFooter(); return; }

  const maxCol   = Math.max(...all.map(t=>t.col));
  const maxRow   = Math.max(...all.map(t=>t.row));
  const maxLayer = Math.max(...all.map(t=>t.layer));

  const cont = document.querySelector('.board-container');
  const aw = Math.floor(cont.clientWidth)-8;
  const ah = Math.floor(cont.clientHeight)-8;
  const {tw,th,lo} = calcSize(maxCol+1,maxRow+1,maxLayer,aw,ah);

  const bw = (maxCol+1)*tw+maxLayer*lo+8;
  const bh = (maxRow+1)*th+maxLayer*lo+8;
  board.style.width=bw+'px'; board.style.height=bh+'px'; board.style.transform='none';
  const sc=Math.min(aw/bw,ah/bh,1);
  if(sc<0.999) board.style.transform='scale('+sc.toFixed(3)+')';

  const fs = Math.max(9, Math.round(tw*0.52));

  active.slice().sort((a,b)=>a.layer-b.layer).forEach(tile=>{
    const free=isFree(tile,all);
    const el=document.createElement('div');
    el.className='tile appearing'+(free?'':' blocked');
    el.dataset.id=tile.id; el.dataset.layer=tile.layer;
    const x=tile.col*tw+tile.layer*lo;
    const y=tile.row*th-tile.layer*lo;
    el.style.left=x+'px'; el.style.top=y+'px';
    el.style.width=(tw-2)+'px'; el.style.height=(th-2)+'px';
    el.style.fontSize=fs+'px';
    el.style.zIndex=tile.layer*1000+tile.row*100+tile.col;
    el.style.color=getSymbolColor(tile.sym);
    if(state.selected&&state.selected.id===tile.id) el.classList.add('selected');
    if(state.hintTiles.indexOf(tile.id)!==-1)       el.classList.add('hint-glow');
    el.textContent=tile.sym;
    if(free)(function(id){el.addEventListener('click',function(){handleClick(id);});})(tile.id);
    board.appendChild(el);
  });
  updateFooter();
}

// ─── GAME LOGIC ──────────────────────────────────────
function handleClick(id) {
  const tile=state.tiles.find(t=>t.id===id);
  if(!tile||tile.removed||!isFree(tile,state.tiles)) return;
  clearHints();

  if (!state.selected) {
    state.selected=tile; SoundEngine.playClick(); renderBoard(); return;
  }
  if (state.selected.id===tile.id) { state.selected=null; renderBoard(); return; }

  if (state.selected.sym===tile.sym) {
    SoundEngine.playMatch();
    // Combo system (Hooked — recompensa variável)
    state.combo++;
    clearTimeout(state.comboTimer);
    state.comboTimer = setTimeout(()=>{ state.combo=0; }, 4000);
    if (state.combo >= 2) {
      showCombo(state.combo);
      SoundEngine.playCombo();
    }
    const id1=state.selected.id,id2=tile.id;
    state.selected=null; state.moves++; state.score+=100*(state.combo||1);
    removePair(id1,id2);
  } else {
    SoundEngine.playError();
    state.combo=0;
    state.selected=tile; renderBoard();
  }
}

function showCombo(n) {
  const el=document.getElementById('combo-display');
  document.getElementById('combo-num').textContent=n;
  el.classList.remove('hidden');
  clearTimeout(window._comboHideTimer);
  window._comboHideTimer=setTimeout(()=>el.classList.add('hidden'),1200);
}

function removePair(id1,id2) {
  const t1=state.tiles.find(t=>t.id===id1);
  const t2=state.tiles.find(t=>t.id===id2);
  if(!t1||!t2) return;
  const el1=document.querySelector('[data-id="'+id1+'"]');
  const el2=document.querySelector('[data-id="'+id2+'"]');
  if(el1){el1.classList.remove('appearing');el1.classList.add('removing');}
  if(el2){el2.classList.remove('appearing');el2.classList.add('removing');}
  if(el1) spawnParticles(el1,t1.sym,getSymbolColor(t1.sym));
  setTimeout(()=>{
    t1.removed=true; t2.removed=true;
    renderBoard();
    if(!checkWin()) checkDeadlock();
  },350);
}

function checkWin() {
  if (state.tiles.filter(t=>!t.removed).length>0) return false;
  stopTimer();
  state.active=false;
  const stars=calcStars();
  saveLevelStars(state.level,stars);
  // Coins earned (Nudge — recompensa proporcional)
  const earned=50+(stars*30)+(state.combo>3?state.combo*10:0);
  addCoins(earned);
  state.totalScore+=state.score;
  save();
  SoundEngine.playVictory();
  setTimeout(()=>showWin(stars,earned),400);
  return true;
}

function checkDeadlock() {
  const rem=state.tiles.filter(t=>!t.removed);
  if(!rem.length) return;
  const free=rem.filter(t=>isFree(t,state.tiles));
  const fm={};
  free.forEach(t=>{fm[t.sym]=(fm[t.sym]||0)+1;});
  if(Object.values(fm).some(c=>c>=2)) return;
  const am={};
  rem.forEach(t=>{am[t.sym]=(am[t.sym]||0)+1;});
  if(Object.values(am).some(c=>c>=2)) return;
  SoundEngine.playDefeat();
  setTimeout(()=>openModal('modal-lose'),600);
}

function calcStars() {
  const lvl=LEVELS[state.level];
  if(!lvl.time) return 3;
  const pct=(lvl.time-state.timeLeft)/lvl.time;
  if(pct<0.40) return 3;
  if(pct<0.75) return 2;
  return 1;
}

function showWin(stars,earned) {
  document.getElementById('stars-display').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('win-coins').textContent='🪙 +'+earned+' coins earned!';
  document.getElementById('win-message').textContent=
    stars===3?'Perfect! Flawless!':stars===2?'Well done! Keep going!':'Level cleared!';
  // Nudge: diz que o próximo nível foi desbloqueado
  const next=state.level+1;
  const nudge=document.getElementById('nudge-msg');
  if(next<LEVELS.length&&!isUnlocked(next)&&next<FREE_LEVELS) {
    nudge.textContent='🔓 Level '+(next+1)+' just unlocked!';
  } else { nudge.textContent=''; }
  openModal('modal-win');
}

// ─── HINT ────────────────────────────────────────────
function clearHints() { state.hintTiles=[]; }
function useHint() {
  if(state.hints<=0) { alert('No hints left! Earn coins to buy more.'); return; }
  clearHints();
  const free=state.tiles.filter(t=>!t.removed&&isFree(t,state.tiles));
  const map={};
  free.forEach(t=>{if(!map[t.sym])map[t.sym]=[];map[t.sym].push(t.id);});
  const pairs=Object.values(map).filter(ids=>ids.length>=2);
  if(pairs.length){
    const pair=pairs[Math.floor(Math.random()*pairs.length)];
    state.hintTiles=[pair[0],pair[1]];
    state.hints--;
    document.getElementById('hint-count').textContent=state.hints;
    renderBoard();
    setTimeout(()=>{clearHints();renderBoard();},2000);
  }
}

function shuffleFree() {
  const free=state.tiles.filter(t=>!t.removed&&isFree(t,state.tiles));
  const syms=shuffle(free.map(t=>t.sym));
  free.forEach((t,i)=>t.sym=syms[i]);
  state.selected=null; clearHints(); renderBoard();
}

// ─── TIMER ───────────────────────────────────────────
function startTimer(sec) {
  stopTimer();
  const bar=document.getElementById('timer-bar');
  if(!sec){bar.style.width='100%';return;}
  state.timeLeft=sec;
  updateTimerBar(sec,sec);
  state.timerInt=setInterval(()=>{
    state.timeLeft=Math.max(0,state.timeLeft-1);
    updateTimerBar(state.timeLeft,sec);
    if(state.timeLeft<=0){stopTimer();state.active=false;SoundEngine.playDefeat();openModal('modal-lose');}
  },1000);
}
function stopTimer(){if(state.timerInt){clearInterval(state.timerInt);state.timerInt=null;}}
function updateTimerBar(c,t){document.getElementById('timer-bar').style.width=((c/t)*100)+'%';}

// ─── START ───────────────────────────────────────────
function startLevel(i) {
  closeModal('modal-win'); closeModal('modal-lose');
  state.level=i;
  const lvl=LEVELS[i];
  state.tiles=buildTiles(lvl);
  state.selected=null; state.moves=0; state.score=0;
  state.hints=lvl.hints; state.active=true;
  state.hintTiles=[]; state.combo=0;
  document.getElementById('level-badge').textContent='Level '+(i+1)+' — '+lvl.n;
  document.getElementById('score-display').textContent='🪙 0';
  document.getElementById('hint-count').textContent=lvl.hints;
  document.getElementById('combo-display').classList.add('hidden');
  // Anúncios
  if(!state.premium) document.getElementById('ad-banner').classList.remove('hidden');
  else document.getElementById('ad-banner').classList.add('hidden');
  showScreen('screen-game');
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
    renderBoard(); startTimer(lvl.time);
  }));
}

function restartLevel(){closeModal('modal-win');closeModal('modal-lose');startLevel(state.level);}
function nextLevel(){
  closeModal('modal-win');
  const next=state.level+1;
  if(next<LEVELS.length){
    if(next>=FREE_LEVELS&&!state.premium) showPremium();
    else startLevel(next);
  } else showLevelSelect();
}

function updateFooter() {
  const rem=state.tiles.filter(t=>!t.removed);
  document.getElementById('pairs-left').textContent='Pairs: '+Math.floor(rem.length/2);
  document.getElementById('moves-count').textContent='Moves: '+state.moves;
  document.getElementById('score-display').textContent='🪙 '+state.score;
}

// ─── PARTICLES ───────────────────────────────────────
function spawnParticles(el,sym,color) {
  const rect=el.getBoundingClientRect();
  const cx=rect.left+rect.width/2,cy=rect.top+rect.height/2;
  for(let i=0;i<7;i++){
    const p=document.createElement('div');
    p.className='particle'; p.textContent=sym; p.style.color=color;
    p.style.left=cx+'px'; p.style.top=cy+'px';
    const angle=(i/7)*Math.PI*2,dist=55+Math.random()*45;
    p.style.setProperty('--px',(Math.cos(angle)*dist)+'px');
    p.style.setProperty('--py',(Math.sin(angle)*dist)+'px');
    document.body.appendChild(p);
    setTimeout(()=>p.remove(),950);
  }
}

// ─── RESIZE ──────────────────────────────────────────
let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);
  resizeTimer=setTimeout(()=>{ if(state.active) renderBoard(); },150);
});

// ─── INIT ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded',()=>{
  load();
  checkStreak();
  updateCoinsUI();
  if(state.premium){
    document.body.classList.add('premium-active');
    document.getElementById('ad-banner').classList.add('hidden');
  }
  showScreen('screen-menu');
  setTimeout(function(){ SoundEngine.playIntroMusic(); }, 700);
});
