async function loadGames() {
  try {
    const response = await fetch('games.json');
    const data = await response.json();
    const list = document.getElementById('game-list');
    if (!list) return;

    data.games.forEach((game) => {
      const tile = document.createElement('div');
      tile.className = 'game-item';
      tile.tabIndex = 0;

      const icon = document.createElement('img');
      const folderPath = game.filepath.endsWith('/') ? game.filepath : `${game.filepath}/`;
      icon.src = `${folderPath}icon.png`;
      icon.alt = `${game.name} icon`;
      icon.className = 'game-icon';

      const meta = document.createElement('div');
      meta.className = 'game-meta';

      const title = document.createElement('div');
      title.className = 'game-name';
      title.textContent = game.name || 'Untitled Game';

      meta.appendChild(title);
      tile.appendChild(icon);
      tile.appendChild(meta);
      list.appendChild(tile);

      tile.addEventListener('click', () => {
        document.querySelectorAll('.game-item').forEach(el => el.classList.remove('selected'));
        tile.classList.add('selected');
        showGameDetails(game);
      });

      tile.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') tile.click();
      });
    });
  } catch (error) {
    console.error('Error loading games:', error);
  }
}

function showGameDetails(game) {
  const details = document.getElementById('game-details');
  if (!details) return;
  details.innerHTML = '';

  const folderPath = game.filepath.endsWith('/') ? game.filepath : `${game.filepath}/`;

  const banner = document.createElement('img');
  banner.className = 'banner';
  banner.src = `${folderPath}${game.banner || 'banner.png'}`;
  banner.alt = `${game.name} banner`;
  const header = document.createElement('div');
  header.className = 'game-header';

  const title = document.createElement('h1');
  title.textContent = game.name || 'Untitled Game';

  const launch = document.createElement('button');
  launch.className = 'launch-button';
  launch.textContent = 'Play';

  // Launch via the parent desktop's windowManager if running inside an iframe,
  // otherwise use the local windowManager or fallback to a new tab.
  launch.addEventListener('click', () => {
    const gameUrl = new URL(`${folderPath}test.html`, window.location.href).href;
    const iconPath = new URL(`${folderPath}icon.png`, window.location.href).href;

    const isEmbedded = window.top && window.top !== window;
    const targetWindow = isEmbedded ? window.top : window.parent && window.parent !== window ? window.parent : null;

    const openLocal = () => {
      const localManager = (typeof windowManager !== 'undefined') ? windowManager : window.windowManager;
      if (localManager && typeof localManager.openWindow === 'function') {
        localManager.openWindow(gameUrl, game.name || 'Game', 900, 600, iconPath);
        return true;
      }
      return false;
    };

    const openViaMessage = () => {
      if (!targetWindow) return false;
      try {
        targetWindow.postMessage(
          {
            type: 'vapor-launcher-open-game-window',
            payload: {
              url: gameUrl,
              title: game.name || 'Game',
              width: 900,
              height: 600,
              icon: iconPath
            }
          },
          '*'
        );
        return true;
      } catch (e) {
        return false;
      }
    };

    if (isEmbedded) {
      if (!openViaMessage()) {
        openLocal();
      }
    } else {
      openLocal() || window.open(gameUrl, '_blank');
    }
  });

  header.appendChild(title);
  header.appendChild(launch);

  const desc = document.createElement('p');
  desc.className = 'game-desc';
  desc.textContent = game.desc || '';

  details.appendChild(banner);
  details.appendChild(header);
  details.appendChild(desc);
}

// Detect whether this launcher is embedded inside another desktop.
const isEmbedded = (() => {
  try {
    return window.top && window.top !== window;
  } catch (e) {
    return false;
  }
})();

if (isEmbedded) {
  const desktop = document.getElementById('desktop');
  if (desktop) {
    desktop.style.display = 'none';
  }
} else {
  const localManager = (typeof windowManager !== 'undefined') ? windowManager : window.windowManager;
  if (localManager && typeof localManager.init === 'function') {
    try { localManager.init('#desktop'); } catch (e) { console.warn('windowManager init failed', e); }
  }
}

loadGames();