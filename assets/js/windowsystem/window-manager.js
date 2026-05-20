class WindowManager {
  constructor() {
    this.windows = [];           // Array of all open Window objects
    this.nextZIndex = 100;       // Current highest z-index
    this.cascadeX = 50;          // Current cascade X position
    this.cascadeY = 50;          // Current cascade Y position
    this.cascadeOffset = 50;     // How much to offset each new window
    this.desktopElement = null;  // Where windows go in DOM
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  // Initialize the window manager with a desktop container
  init(desktopSelector) {
    this.desktopElement = document.querySelector(desktopSelector);
    if (!this.desktopElement) {
      console.error(`Desktop element not found: ${desktopSelector}`);
      return false;
    }
    console.log('WindowManager initialized');
    return true;
  }

  // Open a new game window
  openWindow(gameId, title, width, height) {
    // Check if game is already open
    const existingWindow = this.getGameWindow(gameId);
    if (existingWindow) {
      // Game already open, just focus it
      this.focusWindow(existingWindow.id);
      return existingWindow;
    }

    // Create new window with cascade position
    const windowObj = new Window({
      gameId: gameId,
      title: title,
      width: width || 800,
      height: height || 600,
      x: this.cascadeX,
      y: this.cascadeY,
      zIndex: this.nextZIndex
    });

    // Add to windows array
    this.windows.push(windowObj);

    // Add to DOM
    this.desktopElement.appendChild(windowObj.getElement());

    // Update z-index for next window
    this.nextZIndex++;

    // Update cascade position for next window
    this.updateCascadePosition(width || 800, height || 600);

    // Make window draggable
    this.makeDraggable(windowObj);

    // Add click listener to bring to focus
    windowObj.getElement().addEventListener('mousedown', () => {
      this.focusWindow(windowObj.id);
    });

    console.log(`Window opened: ${title} (${windowObj.id})`);
    return windowObj;
  }

  // Close a window
  closeWindow(windowId) {
    const index = this.windows.findIndex(w => w.id === windowId);
    if (index !== -1) {
      const window = this.windows[index];
      window.destroy(); // Remove from DOM
      this.windows.splice(index, 1); // Remove from array
      console.log(`Window closed: ${window.title}`);
    }
  }

  // Bring a window to front (focus)
  focusWindow(windowId) {
    const window = this.windows.find(w => w.id === windowId);
    if (!window) return;

    // Restore if minimized
    if (window.isMinimized) {
      window.restore();
    }

    // Set to highest z-index
    window.setZIndex(this.nextZIndex);
    this.nextZIndex++;

    console.log(`Window focused: ${window.title}`);
  }

  // Minimize a window
  minimizeWindow(windowId) {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.minimize();
      console.log(`Window minimized: ${window.title}`);
    }
  }

  // Restore a minimized window
  restoreWindow(windowId) {
    const window = this.windows.find(w => w.id === windowId);
    if (window) {
      window.restore();
      this.focusWindow(windowId); // Bring to front when restoring
      console.log(`Window restored: ${window.title}`);
    }
  }

  // Check if a game is already open
  getGameWindow(gameId) {
    return this.windows.find(w => w.gameId === gameId);
  }

  // Get all open (non-minimized) windows
  getOpenWindows() {
    return this.windows.filter(w => !w.isMinimized);
  }

  // Get all windows (including minimized)
  getAllWindows() {
    return this.windows;
  }

  // Update cascade position for next window
  updateCascadePosition(width, height) {
    this.cascadeX += this.cascadeOffset;
    this.cascadeY += this.cascadeOffset;

    // Wrap around if reaching edge of screen
    if (this.cascadeX + width > this.screenWidth) {
      this.cascadeX = 50; // Reset to starting position
    }
    if (this.cascadeY + height > this.screenHeight) {
      this.cascadeY = 50; // Reset to starting position
    }
  }

  // Make a window draggable
  makeDraggable(windowObj) {
    const element = windowObj.getElement();
    const titlebar = element.querySelector('.titlebar');

    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let offsetX = 0;
    let offsetY = 0;

    // Start dragging
    titlebar.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      offsetX = windowObj.x;
      offsetY = windowObj.y;

      // Bring to front while dragging
      this.focusWindow(windowObj.id);
    });

    // Drag
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      const newX = offsetX + deltaX;
      const newY = offsetY + deltaY;

      windowObj.move(newX, newY);
    });

    // Stop dragging
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Close all windows
  closeAllWindows() {
    const windowIds = [...this.windows].map(w => w.id);
    windowIds.forEach(id => this.closeWindow(id));
    console.log('All windows closed');
  }
}

// Create global instance
const windowManager = new WindowManager();