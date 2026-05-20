class Window {
  constructor(config) {
    // Generate unique ID
    this.id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Store config values as properties
    this.gameId = config.gameId;           // Path to game HTML (e.g., "games/snake.html")
    this.title = config.title;             // Window title (e.g., "Space Blast")
    this.width = config.width || 800;      // Window width (default 800)
    this.height = config.height || 600;    // Window height (default 600)
    this.x = config.x || 0;                // Position from left
    this.y = config.y || 0;                // Position from top
    this.zIndex = config.zIndex || 100;    // Stacking order

    // Window state
    this.isMinimized = false;              // Starts visible
    this.startTime = Date.now();           // Track when game started

    // Create the DOM element
    this.element = this.createDomElement();
  }

  // Create the HTML structure for the window
  createDomElement() {
    // Outer window container
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.style.all = 'initial';
    windowDiv.style.fontFamily = 'sans-serif';
    windowDiv.id = this.id;

    // Set position and size
    windowDiv.style.left = `${this.x}px`;
    windowDiv.style.top = `${this.y}px`;
    windowDiv.style.width = `${this.width}px`;
    windowDiv.style.height = `${this.height}px`;
    windowDiv.style.zIndex = this.zIndex;

    // Create titlebar
    const titlebar = document.createElement('div');
    titlebar.className = 'titlebar';
    titlebar.style.cursor = 'move'; // Show draggable cursor

    // Title text
    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = this.title;
    titlebar.appendChild(titleSpan);

    // Buttons container
    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    // Minimize button
    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'btn-minimize';
    minimizeBtn.textContent = '_';
    minimizeBtn.addEventListener('click', () => this.minimize());
    buttons.appendChild(minimizeBtn);

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', () => this.destroy());
    buttons.appendChild(closeBtn);

    // Add buttons to titlebar
    titlebar.appendChild(buttons);

    // Create content area
    const content = document.createElement('div');
    content.className = 'window-content';

    // Create iframe to load the game
    const iframe = document.createElement('iframe');
    iframe.src = this.gameId;  // Path to game HTML
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#000';
    content.appendChild(iframe);

    // Assemble the window
    windowDiv.appendChild(titlebar);
    windowDiv.appendChild(content);

    return windowDiv;
  }

  // Get the DOM element
  getElement() {
    return this.element;
  }

  // Move window to new position
  move(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  // Update z-index (stacking order)
  setZIndex(z) {
    this.zIndex = z;
    this.element.style.zIndex = z;
  }

  // Hide the window
  minimize() {
    this.isMinimized = true;
    this.element.style.display = 'none';
  }

  // Show the window
  restore() {
    this.isMinimized = false;
    this.element.style.display = 'block';
  }

  // Bring window to front
  focusWindow() {
    this.setZIndex(9999);
  }

  // Remove window completely
  destroy() {
    this.element.remove();
  }

  // Get playtime in seconds
  getPlaytime() {
    const elapsed = Date.now() - this.startTime;
    return Math.floor(elapsed / 1000);
  }
}