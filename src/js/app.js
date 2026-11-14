// Arranque y rutas: conecta lista, guía y estado. Cada pieza vive en su módulo.
import { detectOS } from './logic.js';
import { h, safe, fallback, focusTitle } from './dom.js';
import { readTasks } from './tasks.js';
import { createStore } from './store.js';
import { initList } from './list.js';
import { createGuide } from './guide.js';

try {
  let storage = null;
  try { storage = window.localStorage; } catch {}
  const store = createStore(storage, detectOS(navigator.userAgent, navigator.maxTouchPoints || 0));

  const main = document.querySelector('main');
  const catalog = readTasks(main);

  // Región viva persistente: si se recrea, los lectores de pantalla no anuncian el cambio.
  const live = h('div', { className: 'sr-only' });
  live.setAttribute('aria-live', 'polite');
  document.body.append(live);
  const guideRoot = h('div', { className: 'guide', hidden: true });
  main.append(guideRoot);

  let fromList = false;
  let rendered = false;

  const drawList = initList({ catalog, store, main, onOpen: id => { fromList = true; location.hash = 'hacer-' + id; } });
  const goList = () => {
    if (fromList) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); render(); }
  };
  const drawGuide = createGuide({ root: guideRoot, live, catalog, store, goList, onDone: drawList });

  const render = safe(function render() {
    const m = location.hash.match(/^#hacer-(.+)$/);
    const t = (m && catalog.byId[m[1]]) ?? null;
    for (const c of main.children) if (c !== guideRoot) c.hidden = !!t;
    guideRoot.hidden = !t;
    document.body.classList.toggle('in-guide', !!t);
    drawList();
    if (t) drawGuide(t, 0, 'steps');
    else if (rendered) focusTitle(document.querySelector('h1'));
    rendered = true;
  });

  document.querySelector('h1').tabIndex = -1;
  window.addEventListener('hashchange', render);
  render();
  document.documentElement.classList.add('js');
} catch (e) {
  console.error(e);
  fallback();
}
