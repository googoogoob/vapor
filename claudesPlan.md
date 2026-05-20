# Game Launcher OS - Project Plan

## 1. Project Overview

**Goal**: Build a Steam-like desktop launcher that displays games, launches them in new windows, and tracks playtime.

**Key Features**:
- Desktop/OS-like interface with launcher window
- Game library display (grid or list view)
- Launch games in new windows
- Real-time playtime tracking
- Persistent storage (localStorage for Phase 1)

**Tech Stack**:
- HTML5 (semantic structure)
- CSS3 (animations, grid/flexbox layouts)
- Vanilla JavaScript (DOM manipulation, event handling, localStorage)
- No frameworks needed for Phase 1

---

## 2. Project Architecture

### Folder Structure
```
game-launcher/
├── index.html           # Main launcher window
├── css/
│   ├── styles.css       # Global styles
│   ├── launcher.css     # Launcher-specific styles
│   └── game-window.css  # Game window styles
├── js/
│   ├── main.js          # Launcher logic
│   ├── game-manager.js  # Game data & playtime tracking
│   ├── game-window.js   # Game window functionality
│   └── storage.js       # LocalStorage wrapper
├── games/               # Individual game HTML files
│   ├── game1.html
│   ├── game2.html
│   └── ...
└── assets/
    ├── images/          # Game icons, backgrounds
    └── sounds/          # Optional UI sounds
```

### Core Components

**1. Launcher Window** (main.html)
- Header with OS chrome (title bar, minimize, close buttons)
- Left sidebar (navigation, filters)
- Main content area (game grid/list)
- Bottom taskbar (running games, system info)

**2. Game Manager** (game-manager.js)
- Game database (stored in localStorage)
- Add/remove games
- Track playtime per game
- Calculate total playtime

**3. Game Windows** (game-window.js)
- Pop-out windows for each game
- Window management (minimize, close, always-on-top)
- Playtime tracking (when window is active)
- Return to launcher on close

---

## 3. Phase 1: MVP (Minimal Viable Product)

**Goal**: Get a working launcher with basic game launching and playtime tracking.

### Phase 1 Deliverables

✓ **Launcher UI**
- Static HTML structure with OS-like chrome
- Responsive CSS layout
- Basic styling (choose your aesthetic)

✓ **Game Library**
- Display 5-10 hardcoded games
- Each game has: name, icon, last played, total playtime
- Game list/grid toggle

✓ **Game Launching**
- Click game → opens in new window
- Game window contains a simple game or placeholder
- Close game → returns to launcher

✓ **Playtime Tracking**
- Track time game window is open
- Display in launcher UI
- Save to localStorage (basic persistence)

### Phase 1 JavaScript Skills You'll Use

- **DOM Manipulation**: `document.getElementById()`, `createElement()`, `appendChild()`
- **Event Listeners**: `click`, `focus`, `blur`, `unload`
- **localStorage**: Save/load game data as JSON
- **Date/Time**: Calculate playtime duration
- **Window Management**: `window.open()`, window message passing

### Phase 1 Estimating Complexity

| Feature | Time | Difficulty |
|---------|------|-----------|
| Launcher UI | 2-3 hrs | Easy |
| Game data structure | 1 hr | Easy |
| Basic launching | 2 hrs | Medium |
| Playtime tracking | 2-3 hrs | Medium |
| localStorage persistence | 1 hr | Easy |
| **Total Phase 1** | **8-10 hrs** | **Moderate** |

---

## 4. Phase 2: Polish & Features (Optional)

Once Phase 1 works, add:

✓ **Enhanced UI**
- Animations (game card hover, window open/close)
- Theme toggle (light/dark mode)
- Customizable launcher background
- Smooth transitions

✓ **Game Window Features**
- Minimize/restore buttons
- Floating taskbar for running games
- Window position saving
- Fullscreen toggle

✓ **Library Management**
- Search/filter games
- Sort by playtime, name, last played
- Add custom games (form validation)
- Delete games

✓ **Statistics**
- Total playtime pie chart
- Most played games
- Session history

### Phase 2 JavaScript Skills

- **Advanced DOM**: Event delegation, dynamic element creation
- **CSS Animations**: Keyframes, transitions, transform
- **Data Visualization**: Canvas or SVG charts (simple bar/pie)
- **Form Validation**: Input checking, error messages

---

## 5. Phase 3: Advanced (Future)

- Backend integration (save to server)
- Game uploads/community games
- Cloud sync across devices
- Game achievements/badges
- Multiplayer game examples
- Advanced window manager (snap-to-grid, tiling)

---

## 6. Development Workflow

### Step-by-Step Build Order

**Week 1: Foundation**
1. Create launcher.html with OS-like structure
2. Build launcher.css with your chosen aesthetic
3. Create game-manager.js (game data structure)
4. Hardcode 5 games as test data

**Week 2: Interactivity**
5. Add click listeners to launch games
6. Create game window template
7. Implement playtime tracking logic
8. Wire up localStorage persistence

**Week 3: Polish**
9. Add animations and transitions
10. Refine UI/UX
11. Test all edge cases (closing windows, rapid clicks, etc.)
12. Add stats/filters

### Testing Checklist

- [ ] Launcher loads without errors
- [ ] Games display correctly
- [ ] Clicking a game opens a new window
- [ ] Playtime increases while window is open
- [ ] Playtime stops when window closes
- [ ] Data persists after page refresh
- [ ] Multiple games can run simultaneously
- [ ] Window chrome buttons work (minimize, close)
- [ ] No console errors

---

## 7. JavaScript Patterns for Your Project

### Pattern 1: Game Data Structure
```javascript
const games = [
  {
    id: 1,
    name: "Space Blast",
    icon: "assets/space-blast.png",
    totalPlaytime: 3600, // seconds
    lastPlayed: 1684526400000, // timestamp
    url: "games/space-blast.html"
  }
];
```

### Pattern 2: Playtime Tracking
```javascript
// When game window opens
const gameWindow = window.open(url);
const startTime = Date.now();

// Listen for window close
gameWindow.addEventListener('beforeunload', () => {
  const playedSeconds = (Date.now() - startTime) / 1000;
  game.totalPlaytime += playedSeconds;
  localStorage.setItem('games', JSON.stringify(games));
});
```

### Pattern 3: localStorage Wrapper
```javascript
const Storage = {
  get: (key) => JSON.parse(localStorage.getItem(key)) || [],
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
  clear: (key) => localStorage.removeItem(key)
};
```

---

## 8. Design & Aesthetic Choices

### Consider These Directions:

**Option A: Retro Windows XP**
- Skeuomorphic beveled buttons
- System-like fonts (Courier New, monospace)
- Teal/silver colors
- Classic window chrome

**Option B: Modern Minimal**
- Clean sans-serif (Google Fonts)
- Dark theme with neon accents
- Glassmorphism effects
- Subtle animations

**Option C: Cyberpunk/Sci-Fi**
- Bold typography
- Neon colors (#00FF00 on black)
- Glitch effects, scanlines
- Tech-forward aesthetic

**Option D: Cozy/Indie**
- Soft colors and rounded corners
- Hand-drawn icons
- Warm typography
- Playful animations

Pick one and commit to it throughout the project!

---

## 9. Common Challenges & Solutions

### Challenge 1: Playtime Tracking Across Windows
**Problem**: JavaScript in parent window can't directly track child window activity
**Solution**: Use `setInterval()` to ping child window, or message passing with `postMessage()`

### Challenge 2: Multiple Windows Interfering
**Problem**: Window names colliding, opening duplicate windows
**Solution**: Use unique IDs (timestamps or UUIDs), check if window already exists

### Challenge 3: localStorage Limits
**Problem**: localStorage is limited to ~5-10MB
**Solution**: For Phase 1, this is fine. For Phase 2+, move to IndexedDB

### Challenge 4: Window Positioning
**Problem**: Pop-ups blocked by browser or opening off-screen
**Solution**: Define explicit width/height and position in `window.open()`

---

## 10. Resources for Learning

**Playtime Tracking**:
- MDN: `window.open()` and window messaging
- Timestamp tracking patterns

**DOM & Events**:
- MDN: DOM API, Event listeners
- Event delegation for dynamic content

**localStorage**:
- Web Storage API docs
- JSON stringify/parse

**CSS Animations**:
- CSS-Tricks: Animation/transitions
- Keyframe animations

---

## 11. Quick Wins (Start Here!)

1. **Build launcher UI first** - Get the visual foundation solid
2. **Hardcode 5 games** - Don't worry about dynamic data yet
3. **Make one game launchable** - Test window.open() works
4. **Track one game's playtime** - Verify tracking logic
5. **Add localStorage** - Make data persist
6. **Expand to all games** - Copy/paste the pattern

---

## Next Steps

1. Choose your aesthetic direction (retro, modern, cyberpunk, cozy, etc.)
2. Start with `index.html` - build the launcher layout
3. Create `css/launcher.css` - style it beautifully
4. Move to `js/game-manager.js` - structure your game data
5. Then `js/main.js` - wire up event listeners

Once you have Phase 1 working, come back and we can tackle Phase 2 features or debug any issues!

Good luck! 🚀