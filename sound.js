// ═══════════════════════════════════════════════════
//  LEARN NUMBERS — Motor de Som v2
//  Volume aumentado + Musiquinha eletrônica de abertura
// ═══════════════════════════════════════════════════
var SoundEngine = (function() {
  var ctx = null, muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, start, dur, vol, c, freqEnd) {
    var o = c.createOscillator();
    var g = c.createGain();
    var comp = c.createDynamicsCompressor();
    comp.threshold.value = -10; comp.ratio.value = 4;
    o.connect(g); g.connect(comp); comp.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.start(start); o.stop(start + dur + 0.05);
  }

  function kick(c, t) {
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = 'sine';
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(40, t + 0.15);
    g.gain.setValueAtTime(0.55, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    o.start(t); o.stop(t + 0.19);
  }

  function hihat(c, t) {
    var buf = c.createBuffer(1, c.sampleRate*0.05, c.sampleRate);
    var d   = buf.getChannelData(0);
    for (var i=0;i<d.length;i++) d[i]=(Math.random()*2-1)*0.3;
    var src = c.createBufferSource();
    var g   = c.createGain();
    src.buffer=buf; src.connect(g); g.connect(c.destination);
    g.gain.setValueAtTime(0.3,t);
    g.gain.exponentialRampToValueAtTime(0.001,t+0.05);
    src.start(t);
  }

  // ── MUSIQUINHA DE ABERTURA (eletrônica/arcade) ─────
  // Diferente do Learn Letters — mais energética
  function playIntroMusic() {
    if (muted) return;
    var c = getCtx();
    var now = c.currentTime + 0.15;

    // Melodia estilo videogame 8-bit
    var melody = [
      [659, 0.00, 0.12], // E5
      [659, 0.12, 0.12], // E5
      [0,   0.24, 0.06], // pausa
      [659, 0.30, 0.12], // E5
      [0,   0.42, 0.06], // pausa
      [523, 0.48, 0.12], // C5
      [659, 0.60, 0.18], // E5
      [784, 0.78, 0.30], // G5 — subida!
      [392, 1.08, 0.30], // G4 — baixo
      // Frase 2
      [523, 1.38, 0.24], // C5
      [392, 1.62, 0.18], // G4
      [330, 1.80, 0.18], // E4
      [440, 1.98, 0.18], // A4
      [494, 2.16, 0.18], // B4
      [466, 2.34, 0.09], // Bb4
      [440, 2.43, 0.24], // A4
      // Frase 3 — subindo para o fim
      [392, 2.67, 0.14], // G4
      [659, 2.81, 0.14], // E5
      [880, 2.95, 0.14], // A5
      [784, 3.09, 0.18], // G5
      [659, 3.27, 0.18], // E5
      [523, 3.45, 0.18], // C5
      [494, 3.63, 0.18], // B4
      [523, 3.81, 0.55], // C5 — fim!
    ];

    melody.forEach(function(n) {
      if (n[0] > 0) tone(n[0], 'square', now+n[1], n[2], 0.50, c);
    });

    // Baixo pulsante
    var bass = [
      [130,0.00,0.28],[130,0.30,0.28],[196,0.60,0.48],
      [130,1.08,0.28],[130,1.38,0.24],[165,1.62,0.36],
      [196,1.98,0.28],[175,2.34,0.28],[196,2.67,1.68],
    ];
    bass.forEach(function(n) { tone(n[0],'sine', now+n[1], n[2], 0.40, c); });

    // Kicks
    [0.00,0.48,0.96,1.44,1.92,2.40,2.88,3.36,3.81].forEach(function(t) {
      kick(c, now+t);
    });

    // Hi-hats rápidos
    [0.24,0.48,0.72,0.96,1.20,1.44,1.68,1.92,2.16,2.40,2.64,2.88,3.12,3.36,3.60,3.81].forEach(function(t) {
      hihat(c, now+t);
    });

    // Brilhos de arpejo
    [0.60,1.38,2.16,2.95,3.81].forEach(function(t) {
      tone(1568,'sine', now+t, 0.10, 0.20, c);
    });
  }

  // ── ACERTO ─────────────────────────────────────────
  function playMatch() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(440,'square', now,       0.06, 0.65, c);
    tone(880,'square', now+0.07,  0.08, 0.65, c);
    tone(1320,'sine',  now+0.13,  0.10, 0.50, c);
  }

  // ── ERRO ───────────────────────────────────────────
  function playError() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(300,'sawtooth', now, 0.18, 0.65, c, 120);
  }

  // ── VITÓRIA ────────────────────────────────────────
  function playVictory() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var m=[[523,0],[659,0.12],[784,0.24],[1047,0.36],[1319,0.50],[1047,0.64],[1319,0.78]];
    m.forEach(function(n) { tone(n[0],'square', now+n[1], 0.14, 0.65, c); });
    [523,659,784,1047].forEach(function(f) { tone(f,'sine', now+0.95, 0.7, 0.45, c); });
    tone(2093,'sine', now+1.0, 0.4, 0.30, c);
  }

  // ── DERROTA ────────────────────────────────────────
  function playDefeat() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [[400,0],[320,0.2],[260,0.4],[200,0.65]].forEach(function(n) {
      tone(n[0],'triangle', now+n[1], 0.22, 0.65, c);
    });
  }

  // ── CLIQUE ─────────────────────────────────────────
  function playClick() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(1000,'square', now, 0.04, 0.55, c);
  }

  // ── COMBO ──────────────────────────────────────────
  function playCombo() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [660,880,1100,1320].forEach(function(f,i) { tone(f,'square', now+i*0.06, 0.08, 0.65, c); });
  }

  // ── MOEDAS ─────────────────────────────────────────
  function playCoins() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [1047,1319,1568].forEach(function(f,i) { tone(f,'sine', now+i*0.08, 0.12, 0.60, c); });
  }

  // ── STREAK ─────────────────────────────────────────
  function playStreak() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [440,554,659,880,1108].forEach(function(f,i) { tone(f,'square', now+i*0.1, 0.12, 0.65, c); });
  }

  // ── MUTE ───────────────────────────────────────────
  function toggleMute() {
    muted = !muted;
    var btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    return muted;
  }

  return {
    playMatch:playMatch, playError:playError, playVictory:playVictory,
    playDefeat:playDefeat, playClick:playClick, playCombo:playCombo,
    playCoins:playCoins, playStreak:playStreak, playIntroMusic:playIntroMusic,
    toggleMute:toggleMute
  };
})();
