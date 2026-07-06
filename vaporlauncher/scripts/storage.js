const PlaytimeStorage = {
  _KEY: 'vapor_playtime',

  _load() {
    try { return JSON.parse(localStorage.getItem(this._KEY)) || {}; } catch { return {}; }
  },

  _save(data) {
    try { localStorage.setItem(this._KEY, JSON.stringify(data)); } catch {}
  },

  getPlaytime(gameName) {
    return this._load()[gameName] || 0;
  },

  addPlaytime(gameName, seconds) {
    if (seconds <= 0) return;
    const data = this._load();
    data[gameName] = (data[gameName] || 0) + seconds;
    this._save(data);
  },

  format(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m`;
    return `< 1m`;
  }
};
