class Window {
  constructor(config) {
    this.id = `window-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    this.gameId = config.gameId;
    this.title = config.title;
    this.icon = config.icon || null;
    this.width = config.width || 800;
    this.height = config.height || 600;
    this.x = config.x || 0;
    this.y = config.y || 0;
    this.zIndex = config.zIndex || 100;

    this.isMinimized = false;
    this.isMaximized = false;
    this._preMaximizeState = null;
    this.startTime = Date.now();
    this._destroyed = false;
    this.onClose = null;

    this.element = this.createDomElement();
  }

  createDomElement() {
    const windowDiv = document.createElement('div');
    windowDiv.className = 'window';
    windowDiv.style.fontFamily = 'sans-serif';
    windowDiv.id = this.id;

    windowDiv.style.left = `${this.x}px`;
    windowDiv.style.top = `${this.y}px`;
    windowDiv.style.width = `${this.width}px`;
    windowDiv.style.height = `${this.height}px`;
    windowDiv.style.zIndex = this.zIndex;

    const titlebar = document.createElement('div');
    titlebar.className = 'titlebar';
    titlebar.style.cursor = 'move';

    if (this.icon) {
      const iconImg = document.createElement('img');
      iconImg.className = 'title-icon';
      iconImg.src = this.icon;
      iconImg.alt = this.title;
      iconImg.style.width = '20px';
      iconImg.style.height = '20px';
      iconImg.style.objectFit = 'cover';
      iconImg.style.marginRight = '8px';
      titlebar.appendChild(iconImg);
    }

    const titleSpan = document.createElement('span');
    titleSpan.className = 'title';
    titleSpan.textContent = this.title;
    titlebar.appendChild(titleSpan);

    const buttons = document.createElement('div');
    buttons.className = 'buttons';

    const minimizeBtn = document.createElement('button');
    minimizeBtn.className = 'btn-minimize';
    minimizeBtn.textContent = '_';
    minimizeBtn.title = 'Minimize';
    minimizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.minimize(); });
    buttons.appendChild(minimizeBtn);

    const maximizeBtn = document.createElement('button');
    maximizeBtn.className = 'btn-maximize';
    maximizeBtn.textContent = '□';
    maximizeBtn.title = 'Maximize';
    maximizeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.toggleMaximize(); });
    buttons.appendChild(maximizeBtn);
    this._maximizeBtn = maximizeBtn;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close';
    closeBtn.textContent = '✕';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', (e) => { e.stopPropagation(); this.destroy(); });
    buttons.appendChild(closeBtn);

    titlebar.appendChild(buttons);

    // Double-click titlebar to toggle maximize
    titlebar.addEventListener('dblclick', (e) => {
      if (e.target.closest('.buttons')) return;
      this.toggleMaximize();
    });

    const content = document.createElement('div');
    content.className = 'window-content';

    const iframe = document.createElement('iframe');
    iframe.src = this.gameId;
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = 'transparent';
    content.appendChild(iframe);

    iframe.addEventListener('load', () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        if (doc && doc.body) {
          const computed = doc.defaultView.getComputedStyle(doc.body);
          const bodyColor = computed.color;
          if (bodyColor === 'rgb(0, 0, 0)' || bodyColor === '#000' || bodyColor === 'black') {
            doc.body.style.color = '#e1e1e1';
          }
        }
      } catch (e) {}
    });

    // Resize handles
    const directions = ['n','ne','e','se','s','sw','w','nw'];
    directions.forEach(dir => {
      const handle = document.createElement('div');
      handle.className = `resize-handle resize-${dir}`;
      handle.dataset.dir = dir;
      windowDiv.appendChild(handle);
    });

    windowDiv.appendChild(titlebar);
    windowDiv.appendChild(content);

    return windowDiv;
  }

  getElement() {
    return this.element;
  }

  move(x, y) {
    this.x = x;
    this.y = y;
    this.element.style.left = `${x}px`;
    this.element.style.top = `${y}px`;
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.element.style.width = `${width}px`;
    this.element.style.height = `${height}px`;
  }

  setZIndex(z) {
    this.zIndex = z;
    this.element.style.zIndex = z;
  }

  minimize() {
    this.isMinimized = true;
    this.element.style.display = 'none';
  }

  restore() {
    this.isMinimized = false;
    this.element.style.display = 'block';
  }

  toggleMaximize() {
    if (this.isMaximized) {
      this._restoreFromMaximize();
    } else {
      this._doMaximize();
    }
  }

  _doMaximize() {
    const taskbarHeight = 56;
    this._preMaximizeState = {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
    this.isMaximized = true;
    this.x = 0;
    this.y = 0;
    this.width = window.innerWidth;
    this.height = window.innerHeight - taskbarHeight;
    const el = this.element;
    el.style.left = '0px';
    el.style.top = '0px';
    el.style.width = `${this.width}px`;
    el.style.height = `${this.height}px`;
    el.classList.add('maximized');
    if (this._maximizeBtn) {
      this._maximizeBtn.textContent = '❐';
      this._maximizeBtn.title = 'Restore';
    }
  }

  _restoreFromMaximize() {
    if (!this._preMaximizeState) return;
    this.isMaximized = false;
    const s = this._preMaximizeState;
    this.x = s.x;
    this.y = s.y;
    this.width = s.width;
    this.height = s.height;
    const el = this.element;
    el.style.left = `${s.x}px`;
    el.style.top = `${s.y}px`;
    el.style.width = `${s.width}px`;
    el.style.height = `${s.height}px`;
    el.classList.remove('maximized');
    if (this._maximizeBtn) {
      this._maximizeBtn.textContent = '□';
      this._maximizeBtn.title = 'Maximize';
    }
    this._preMaximizeState = null;
  }

  focusWindow() {
    this.setZIndex(9999);
  }

  destroy() {
    if (this._destroyed) return;
    if (this.element && this.element.remove) this.element.remove();
    this._destroyed = true;
    if (typeof this.onClose === 'function') {
      try { this.onClose(); } catch (e) {}
    }
  }

  getPlaytime() {
    const elapsed = Date.now() - this.startTime;
    return Math.floor(elapsed / 1000);
  }
}
