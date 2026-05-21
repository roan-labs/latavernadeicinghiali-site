// La Taverna dei Cinghiali — main.js
// Solo effetti visivi + live status. Niente audio, niente emoji-decoration.

function setupCandleParallax() {
  const flicker = document.querySelector('.bg-candle-flicker');
  if (!flicker) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    flicker.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(245, 185, 82, 0.10) 0%, transparent 55%)`;
  });
}

async function checkLiveStatus() {
  const statusEl = document.getElementById('live-status');
  if (!statusEl) return;
  const isLive = false;
  if (isLive) {
    statusEl.querySelector('.dot').className = 'dot live';
    statusEl.querySelector('span:last-child').textContent = 'In live ora';
  } else {
    statusEl.querySelector('.dot').className = 'dot offline';
    statusEl.querySelector('span:last-child').textContent = 'Offline';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  checkLiveStatus();
  setupCandleParallax();
});
