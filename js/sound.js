// ═══════════════════════════════════════════════════
//  LEARN LETTERS — Motor de Som
// ═══════════════════════════════════════════════════
var SoundEngine = (function() {
  var ctx = null, muted = false;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, type, start, dur, vol, c, freqEnd) {
    var o = c.createOscillator(), g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, start);
    if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, start + dur);
    g.gain.setValueAtTime(vol, start);
    g.gain.exponentialRampToValueAtTime(0.001, start + dur);
    o.start(start); o.stop(start + dur + 0.01);
  }

  function playMatch() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(523.25,'sine',now,       0.12,0.3,c);
    tone(659.25,'sine',now+0.10,  0.15,0.3,c);
    tone(1046.5,'sine',now+0.18,  0.10,0.15,c);
  }

  function playError() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(220,'sawtooth',now,0.22,0.25,c,110);
  }

  function playVictory() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var notes=[[523.25,0],[659.25,0.15],[783.99,0.30],[659.25,0.45],[1046.5,0.60]];
    notes.forEach(function(n){ tone(n[0],'sine',now+n[1],0.18,0.35,c); });
    [523.25,659.25,783.99].forEach(function(f){ tone(f,'triangle',now+0.80,0.6,0.2,c); });
    tone(2093,'sine',now+0.85,0.4,0.1,c);
  }

  function playDefeat() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [[392,0],[349.23,0.22],[293.66,0.44],[261.63,0.66]].forEach(function(n){
      tone(n[0],'triangle',now+n[1],0.25,0.3,c);
    });
  }

  function playClick() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(800,'sine',now,0.07,0.15,c);
  }

  function playCombo() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [660,880,1100,1320].forEach(function(f,i){ tone(f,'sine',now+i*0.07,0.1,0.2,c); });
  }

  function playCoins() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [1047,1319,1568].forEach(function(f,i){ tone(f,'sine',now+i*0.08,0.12,0.2,c); });
  }

  function playStreak() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    [440,554,659,880,1108].forEach(function(f,i){ tone(f,'sine',now+i*0.1,0.12,0.22,c); });
  }

  function toggleMute() {
    muted = !muted;
    var btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    return muted;
  }

  return { playMatch:playMatch, playError:playError, playVictory:playVictory,
           playDefeat:playDefeat, playClick:playClick, playCombo:playCombo,
           playCoins:playCoins, playStreak:playStreak, toggleMute:toggleMute };
})();
