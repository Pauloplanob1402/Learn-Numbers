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
    tone(440,'square',now,      0.06,0.2,c);
    tone(880,'square',now+0.07, 0.08,0.2,c);
    tone(1320,'sine', now+0.13, 0.10,0.15,c);
  }

  function playError() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(300,'sawtooth',now,0.18,0.22,c,120);
  }

  function playVictory() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var melody = [[523,0.00],[659,0.12],[784,0.24],[1047,0.36],[1319,0.50],[1047,0.64],[1319,0.78]];
    for (var i=0;i<melody.length;i++) tone(melody[i][0],'square',now+melody[i][1],0.14,0.25,c);
    var chord = [523,659,784,1047];
    for (var j=0;j<chord.length;j++) tone(chord[j],'sine',now+0.95,0.7,0.15,c);
    tone(2093,'sine',now+1.0,0.4,0.08,c);
  }

  function playDefeat() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var notes = [[400,0],[320,0.2],[260,0.4],[200,0.65]];
    for (var i=0;i<notes.length;i++) tone(notes[i][0],'triangle',now+notes[i][1],0.22,0.25,c);
  }

  function playClick() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    tone(1000,'square',now,0.04,0.12,c);
  }

  function playCombo() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var freqs = [660,880,1100,1320];
    for (var i=0;i<freqs.length;i++) tone(freqs[i],'square',now+i*0.06,0.08,0.2,c);
  }

  function playCoins() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var freqs = [1047,1319,1568];
    for (var i=0;i<freqs.length;i++) tone(freqs[i],'sine',now+i*0.08,0.12,0.2,c);
  }

  function playStreak() {
    if (muted) return;
    var c = getCtx(), now = c.currentTime;
    var freqs = [440,554,659,880,1108];
    for (var i=0;i<freqs.length;i++) tone(freqs[i],'square',now+i*0.1,0.12,0.22,c);
  }

  function toggleMute() {
    muted = !muted;
    var btn = document.getElementById('btn-mute');
    if (btn) btn.textContent = muted ? '🔇' : '🔊';
    return muted;
  }

  return {
    playMatch:playMatch, playError:playError, playVictory:playVictory,
    playDefeat:playDefeat, playClick:playClick, playCombo:playCombo,
    playCoins:playCoins, playStreak:playStreak, toggleMute:toggleMute
  };
})();
