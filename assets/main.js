// La Taverna dei Cinghiali — main.js

// ============================================================
// 1. AMBIENT SOUND — fire crackle + tavern murmur (Web Audio API procedural)
// ============================================================
let audioCtx = null;
let ambientPlaying = false;
let ambientNodes = [];

function startAmbient() {
  if (ambientPlaying) return;
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  // Fire crackle: filtered noise + random pops
  const fireGain = audioCtx.createGain();
  fireGain.gain.value = 0.04;
  fireGain.connect(audioCtx.destination);

  const noiseBuffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 2, audioCtx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  const noiseSource = audioCtx.createBufferSource();
  noiseSource.buffer = noiseBuffer;
  noiseSource.loop = true;
  const noiseFilter = audioCtx.createBiquadFilter();
  noiseFilter.type = 'lowpass';
  noiseFilter.frequency.value = 400;
  noiseSource.connect(noiseFilter).connect(fireGain);
  noiseSource.start();
  ambientNodes.push(noiseSource);

  // Random pop (fire crackle accents)
  function popLoop() {
    if (!ambientPlaying) return;
    const pop = audioCtx.createOscillator();
    const popGain = audioCtx.createGain();
    pop.frequency.value = 80 + Math.random() * 120;
    popGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
    popGain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);
    pop.connect(popGain).connect(audioCtx.destination);
    pop.start();
    pop.stop(audioCtx.currentTime + 0.06);
    setTimeout(popLoop, 1500 + Math.random() * 3000);
  }
  popLoop();

  // Tavern murmur: low rumble at 50Hz with slow LFO
  const murmurOsc = audioCtx.createOscillator();
  const murmurGain = audioCtx.createGain();
  murmurOsc.frequency.value = 55;
  murmurOsc.type = 'sawtooth';
  murmurGain.gain.value = 0.012;
  const murmurLfo = audioCtx.createOscillator();
  const murmurLfoGain = audioCtx.createGain();
  murmurLfo.frequency.value = 0.3;
  murmurLfoGain.gain.value = 0.008;
  murmurLfo.connect(murmurLfoGain).connect(murmurGain.gain);
  murmurOsc.connect(murmurGain).connect(audioCtx.destination);
  murmurOsc.start();
  murmurLfo.start();
  ambientNodes.push(murmurOsc, murmurLfo);

  ambientPlaying = true;
}

function stopAmbient() {
  ambientPlaying = false;
  ambientNodes.forEach(n => { try { n.stop(); } catch(e){} });
  ambientNodes = [];
}

function toggleAmbient() {
  if (ambientPlaying) {
    stopAmbient();
    const btn = document.getElementById('ambient-toggle');
    if (btn) btn.classList.remove('active');
    if (btn) btn.title = 'Accendi il fuoco';
  } else {
    startAmbient();
    const btn = document.getElementById('ambient-toggle');
    if (btn) btn.classList.add('active');
    if (btn) btn.title = 'Spegni il fuoco';
  }
}

// ============================================================
// 2. EASTER EGGS — meow, candle blow, mug clink
// ============================================================
function playSimpleSound(type) {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const t = audioCtx.currentTime;

  if (type === 'meow') {
    // Cat meow: 2 sweeping sines
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(800, t + 0.15);
    osc.frequency.linearRampToValueAtTime(450, t + 0.35);
    osc.type = 'sawtooth';
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.15, t + 0.05);
    g.gain.linearRampToValueAtTime(0, t + 0.4);
    osc.connect(g).connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.42);
  } else if (type === 'candleblow') {
    // Quick whoosh
    const buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.4, audioCtx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const env = 1 - (i / data.length);
      data[i] = (Math.random() * 2 - 1) * env * env;
    }
    const src = audioCtx.createBufferSource();
    src.buffer = buf;
    const filt = audioCtx.createBiquadFilter();
    filt.type = 'bandpass';
    filt.frequency.value = 800;
    const g = audioCtx.createGain();
    g.gain.value = 0.3;
    src.connect(filt).connect(g).connect(audioCtx.destination);
    src.start(t);
  } else if (type === 'clink') {
    // Tin-tin metal clink
    [1200, 1800, 2400].forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.type = 'triangle';
      g.gain.setValueAtTime(0.08 - i*0.02, t + i*0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.6);
      osc.connect(g).connect(audioCtx.destination);
      osc.start(t + i*0.02);
      osc.stop(t + 0.62);
    });
  }
}

function setupEasterEggs() {
  // Candles: click to blow out
  document.querySelectorAll('.candle').forEach(candle => {
    candle.style.cursor = 'pointer';
    candle.addEventListener('click', () => {
      const flame = candle.querySelector('.flame');
      if (!flame) return;
      playSimpleSound('candleblow');
      if (flame.classList.contains('out')) {
        flame.classList.remove('out');
      } else {
        flame.classList.add('out');
        setTimeout(() => flame.classList.remove('out'), 4000);
      }
    });
  });

  // Sleeping cat injected at random page corner
  injectSleepingCat();
}

function injectSleepingCat() {
  if (document.querySelector('.sleeping-cat')) return;
  const cat = document.createElement('div');
  cat.className = 'sleeping-cat';
  cat.innerHTML = '🐈';
  cat.title = 'Un gatto. Non disturbarlo.';
  document.body.appendChild(cat);
  cat.addEventListener('click', () => {
    playSimpleSound('meow');
    cat.classList.add('meowing');
    setTimeout(() => cat.classList.remove('meowing'), 700);
  });
}

// ============================================================
// 3. AMBIENT TOGGLE BUTTON inject
// ============================================================
function injectAmbientToggle() {
  if (document.getElementById('ambient-toggle')) return;
  const btn = document.createElement('button');
  btn.id = 'ambient-toggle';
  btn.title = 'Accendi il fuoco';
  btn.innerHTML = '🔥';
  btn.addEventListener('click', toggleAmbient);
  document.body.appendChild(btn);
}

// ============================================================
// 4. SMOKE from chimney + candle flicker mouse parallax
// ============================================================
function setupCandleParallax() {
  const flicker = document.querySelector('.bg-candle-flicker');
  if (!flicker) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    flicker.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(245, 185, 82, 0.15) 0%, transparent 50%)`;
  });
}

// ============================================================
// 5. Live status check (placeholder - integration future)
// ============================================================
async function checkLiveStatus() {
  const statusEl = document.getElementById('live-status');
  if (!statusEl) return;
  // Future: hit Twitch helix API with public client_id to check stream
  const isLive = false;
  if (isLive) {
    statusEl.querySelector('.dot').className = 'dot live';
    statusEl.querySelector('span:last-child').textContent = 'Taverna aperta — in live';
  } else {
    statusEl.querySelector('.dot').className = 'dot offline';
    statusEl.querySelector('span:last-child').textContent = 'Taverna chiusa';
  }
}

// ============================================================
// INIT
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  checkLiveStatus();
  setupCandleParallax();
  injectAmbientToggle();
  setupEasterEggs();
});
