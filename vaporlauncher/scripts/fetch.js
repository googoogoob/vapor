async function loadGames() {
  try {
    const response = await fetch('games.json');
    const data = await response.json();
    const list = document.getElementById('game-list');
    if (!list) return;

    data.games.forEach((game) => {
      const tile = document.createElement('div');
      tile.className = 'game-item';

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
    });
  } catch (error) {
    console.error('Error loading games:', error);
  }
}

loadGames();