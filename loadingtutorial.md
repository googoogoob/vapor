# Adding MB progress loading to any Unity WebGL game

A step-by-step guide for overlaying a custom loading screen that shows real downloaded MB on any Unity WebGL build.

---

## Steps 1–4 are required. Steps 5–7 are optional improvements.

---

## Step 1 — Add the overlay HTML

Paste this `<div>` inside `<body>`, before the `#unity-container`. Customise the text and colors freely — only the `id`s matter.

```html
<div id="loading-overlay">
  <div id="loading-title">My Game</div>
  <div id="loading-bar-track">
    <div id="loading-bar-fill"></div>
  </div>
  <div id="loading-mb">Initializing…</div>
</div>
```

---

## Step 2 — Style it to cover the canvas

Add this to your `<style>` block or CSS file. `position: fixed; inset: 0` makes it cover everything. The fade-out is triggered by adding the `.hidden` class.

```css
#loading-overlay {
      position: fixed;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #0d0d0d;
      z-index: 9999;
      font-family: 'Verdana', monospace;
      color: #e0e0e0;
      gap: 18px;
      transition: opacity 0.6s ease;
}

#loading-overlay.hidden {
  opacity: 0;
  pointer-events: none;
}

#loading-bar-track {
  width: 280px;
  height: 3px;
  background: #222;
}

#loading-bar-fill {
  height: 100%;
  width: 0%;
  background: #fff;
  transition: width 0.3s;
}
```

---

## Step 3 — Intercept `fetch` to count bytes

> **Important:** This block must appear **before** any other `<script>` tags — especially before Unity's loader script is appended. If it runs after, the first few fetches escape untracked.

The regex filters to only Unity build files. Adjust it if your filenames differ (see Step 6).

```javascript
let totalDownloaded = 0;
const _nativeFetch = window.fetch.bind(window);

window.fetch = async function(input, init) {
  const response = await _nativeFetch(input, init);
  const url = typeof input === 'string' ? input : input.url;

  // Match .data, .wasm, .js (and .gz / .br compressed variants)
  if (/\.(data|wasm|js)(\.gz|\.br)?(\?|$)/i.test(url)) {
    const cloned = response.clone();
    const reader  = cloned.body.getReader();
    (async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          totalDownloaded += value.byteLength;
          updateMbLabel();
        }
      } catch (_) {}
    })();
  }
  return response;
};

function updateMbLabel() {
  const mb = (totalDownloaded / (1024 * 1024)).toFixed(1);
  document.getElementById('loading-mb').textContent = mb + ' MB downloaded';
}
```

---

## Step 4 — Wire the progress bar and hide the overlay

Inside your `createUnityInstance` call, drive the fill bar from the `progress` callback (0 → 1), then fade out and remove the overlay once the game is ready.

```javascript
const overlay    = document.getElementById('loading-overlay');
const overlayBar = document.getElementById('loading-bar-fill');

createUnityInstance(canvas, config, (progress) => {
  overlayBar.style.width = (progress * 100) + '%';
}).then(() => {
  overlay.classList.add('hidden');         // triggers CSS fade
  setTimeout(() => overlay.remove(), 700); // clean up after fade
}).catch(alert);
```

---

## Step 5 — Hide the built-in Unity loading bar *(optional)*

Set `display: none` on the default bar so it doesn't flash underneath your overlay.

```html
<div id="unity-loading-bar" style="display:none">…</div>
```

---

## Step 6 — Adapt the file regex for your build *(if needed)*

The regex in Step 3 assumes standard Unity filenames. Open your browser's Network tab while loading to see the actual URLs, then adjust:

| Build type | Regex |
|---|---|
| Standard Unity | `/\.(data\|wasm\|js)(\.gz\|\.br)?/i` |
| Custom product name prefix | `/MyGame\.(data\|wasm\|framework\.js)/i` |
| All large asset types | `/\.(data\|wasm\|bin\|bundle)/i` |

---

## Step 7 — Show a "X / Y MB" total estimate *(optional)*

If you know the total bundle size, you can display `X / Y MB` instead of just a running counter. Check the file sizes in your `Build/` output folder and hardcode the total:

```javascript
const TOTAL_MB = 42.5; // add up .data + .wasm + .framework.js from your Build/ folder

function updateMbLabel() {
  const mb = (totalDownloaded / (1024 * 1024)).toFixed(1);
  document.getElementById('loading-mb').textContent =
    mb + ' / ' + TOTAL_MB + ' MB';
}
```

---

## Troubleshooting

**MB counter stays at 0** — the fetch interceptor ran after the loader script. Move the Step 3 block higher in `<body>`, before any `<script src="...loader.js">` line.

**Counter stops before 100%** — some assets may load via `XMLHttpRequest` instead of `fetch` (older Unity versions). Add an equivalent `XMLHttpRequest` open/progress interceptor, or update to a Unity version that uses `fetch` by default.

**Overlay never disappears** — the `.then()` on `createUnityInstance` isn't firing. Check the browser console for Unity errors; the game may be crashing before it signals completion.