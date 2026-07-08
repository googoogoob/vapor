const activeSessions = new Map();

function startTracking(game, windowObj) {
  const gameName = game.name;
  if (activeSessions.has(gameName)) return;

  const session = {
    startTime: Date.now(),
    gameName: gameName,
    windowObj: windowObj,
    intervalId: null
  };

  activeSessions.set(gameName, session);

  if (windowObj) {
    const originalOnClose = windowObj.onClose;
    windowObj.onClose = () => {
      stopTracking(gameName);
      if (typeof originalOnClose === 'function') originalOnClose();
    };
  }

  session.intervalId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
    if (elapsed > 0) {
      PlaytimeStorage.addPlaytime(gameName, elapsed);
      session.startTime = Date.now();
      updatePlaytimeDisplay(gameName);
    }
  }, 30000);
}

function stopTracking(gameName) {
  const session = activeSessions.get(gameName);
  if (!session) return;

  const elapsed = Math.floor((Date.now() - session.startTime) / 1000);
  if (elapsed > 0) {
    PlaytimeStorage.addPlaytime(gameName, elapsed);
    updatePlaytimeDisplay(gameName);
  }

  if (session.intervalId) clearInterval(session.intervalId);
  activeSessions.delete(gameName);
}

function updatePlaytimeDisplay(gameName) {
  const el = document.getElementById('playtime-display');
  if (el && el.dataset.game === gameName) {
    const total = PlaytimeStorage.getPlaytime(gameName);
    el.textContent = playtimeLabel(total);
  }
}

function playtimeLabel(seconds) {
  return `Playtime: ${PlaytimeStorage.format(seconds)}`;
}

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'vapor-launcher-game-closed') {
    const gameName = event.data.payload && event.data.payload.gameName;
    if (gameName) stopTracking(gameName);
  }
});

window.addEventListener('beforeunload', () => {
  for (const gameName of activeSessions.keys()) {
    stopTracking(gameName);
  }
});

// MODIFIED: Added cache-busting logic to fetch fresh data every time
async function loadGames() {
  try {
    // Appending a unique timestamp parameter ensures the browser treats it as a brand new request
    const response = await fetch(`games.json?t=${Date.now()}`, { cache: 'no-store' });
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

  launch.addEventListener('click', () => {
    const gameUrl = new URL(`${folderPath}index.html`, window.location.href).href;
    const iconPath = new URL(`${folderPath}icon.png`, window.location.href).href;

    const isEmbedded = window.top && window.top !== window;
    const targetWindow = isEmbedded ? window.top : window.parent && window.parent !== window ? window.parent : null;

    let gameWindow = null;

    const openLocal = () => {
      const localManager = (typeof windowManager !== 'undefined') ? windowManager : window.windowManager;
      if (localManager && typeof localManager.openWindow === 'function') {
        gameWindow = localManager.openWindow(gameUrl, game.name || 'Game', 900, 600, iconPath);
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
              icon: iconPath,
              gameName: game.name
            }
          },
          '*'
        );
        return true;
      } catch (e) {
        return false;
      }
    };

    let launched = false;
    if (isEmbedded) {
      launched = openViaMessage();
      if (!launched) launched = openLocal();
    } else {
      launched = openLocal();
      if (!launched) {
        window.open(gameUrl, '_blank');
        launched = true;
      }
    }

    if (launched) {
      if (gameWindow) {
        startTracking(game, gameWindow);
      } else if (isEmbedded) {
        startTracking(game, null);
      }
    }
  });

  header.appendChild(title);
  header.appendChild(launch);

  const desc = document.createElement('p');
  desc.className = 'game-desc';
  desc.textContent = game.desc || '';

  const playtimeEl = document.createElement('p');
  playtimeEl.className = 'playtime-display';
  playtimeEl.id = 'playtime-display';
  playtimeEl.dataset.game = game.name;
  playtimeEl.textContent = playtimeLabel(PlaytimeStorage.getPlaytime(game.name));

  details.appendChild(banner);
  details.appendChild(header);
  details.appendChild(playtimeEl);
  details.appendChild(desc);
}

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

const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase().trim();
    document.querySelectorAll('.game-item').forEach(item => {
      const name = item.querySelector('.game-name')?.textContent?.toLowerCase() || '';
      item.classList.toggle('hidden', query.length > 0 && !name.includes(query));
    });
  });
}