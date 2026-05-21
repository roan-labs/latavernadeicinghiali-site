// La Taverna dei Cinghiali — main.js

// Check Twitch live status (via simple API call)
async function checkLiveStatus() {
  const statusEl = document.getElementById('live-status');
  if (!statusEl) return;

  // Placeholder — quando avremo client_id Twitch + endpoint pubblico
  // Per ora simula offline (taverna chiusa)
  const isLive = false;

  if (isLive) {
    statusEl.querySelector('.dot').className = 'dot live';
    statusEl.querySelector('span:last-child').textContent = 'Taverna aperta — in live ora';
  } else {
    statusEl.querySelector('.dot').className = 'dot offline';
    statusEl.querySelector('span:last-child').textContent = 'Taverna chiusa';
  }
}

// Subtle parallax for candle flicker reaction to mouse
function setupCandleParallax() {
  const flicker = document.querySelector('.bg-candle-flicker');
  if (!flicker) return;
  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth) * 100;
    const y = (e.clientY / window.innerHeight) * 100;
    flicker.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(245, 185, 82, 0.15) 0%, transparent 50%)`;
  });
}

document.addEventListener('DOMContentLoaded', () => {
  checkLiveStatus();
  setupCandleParallax();
});
