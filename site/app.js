import { loadState, saveState, detectOS, countDone, nextPending, stepsFor } from './logic.js';

try {
  let storage = null;
  try { storage = window.localStorage; } catch {}
  const state = loadState(storage);
  const defaultOS = detectOS(navigator.userAgent, navigator.maxTouchPoints || 0);
  const os = () => state.os ?? defaultOS;

  const main = document.querySelector('main');
  const counter = main.querySelector('.counter');
  const tasks = [...main.querySelectorAll('.task')].map(el => ({
    el,
    id: el.id,
    core: el.dataset.kind === 'core',
    min: el.dataset.min,
    title: el.querySelector('h3').textContent,
    win: el.querySelector('.win').textContent,
    na: el.querySelector('[data-na]')?.textContent ?? null,
    steps: [...el.querySelectorAll('.steps > li')].map(li => {
      const c = li.cloneNode(true);
      c.querySelector('.os-label')?.remove();
      return { os: li.dataset.os ?? null, html: c.innerHTML.trim() };
    }),
  }));
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]));
  const coreIds = tasks.filter(t => t.core).map(t => t.id);
  const optIds = tasks.filter(t => !t.core).map(t => t.id);

  const guideRoot = document.createElement('div');
  guideRoot.className = 'guide';
  guideRoot.hidden = true;
  main.append(guideRoot);

  const h = (tag, props = {}, ...kids) => {
    const e = Object.assign(document.createElement(tag), props);
    e.append(...kids);
    return e;
  };
  const save = () => saveState(storage, state);
  const nCore = () => countDone(state.done, coreIds);
  const focusTitle = el => { window.scrollTo(0, 0); el?.focus(); };

  // Decorado de la lista (una sola vez)
  for (const t of tasks) {
    t.status = h('span', { className: 'status', textContent: '✓ ¡Hecho!' });
    t.go = h('button', { type: 'button', className: 'btn' });
    t.go.addEventListener('click', () => { fromList = true; location.hash = 'hacer-' + t.id; });
    t.el.querySelector('h3').after(h('p', { className: 'min', textContent: `~${t.min} min` }));
    t.el.append(h('div', { className: 'actions' }, t.status, t.go));
  }
  let fromList = false;

  function drawList() {
    for (const t of tasks) {
      const done = state.done.includes(t.id);
      t.el.classList.toggle('done', done);
      t.status.hidden = !done;
      t.go.className = done ? 'btn-ghost' : 'btn';
      t.go.textContent = done ? 'Ver de nuevo' : 'Hacerlo ahora →';
    }
    counter.textContent = `${nCore()} de ${coreIds.length} hechas`;
  }

  function goList() {
    if (fromList) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); render(); }
  }

  function drawGuide(t, step, screen, congrats) {
    guideRoot.replaceChildren();
    const back = h('button', { type: 'button', className: 'btn-ghost', textContent: '← Volver a la lista' });
    back.addEventListener('click', goList);
    const title = h('h3', { tabIndex: -1, textContent: t.title });
    guideRoot.append(back, title);

    if (screen === 'done') {
      const next = nextPending(state.done, coreIds, optIds, t.id);
      const box = h('div', { className: 'done-screen' },
        h('div', { className: 'emoji', textContent: '🎉' }),
        h('p', { className: 'win', textContent: t.win }),
        h('p', { textContent: `Ya hiciste ${nCore()} de ${coreIds.length}` }));
      if (congrats) box.append(h('p', { className: 'win', textContent: '¡Ya estás más protegido! Si querés, seguí con las opcionales.' }));
      if (next) {
        const b = h('button', { type: 'button', className: 'btn', textContent: `Seguir: ${byId[next].title} →` });
        b.addEventListener('click', () => location.replace('#hacer-' + next));
        box.append(b);
      }
      const l = h('button', { type: 'button', className: 'btn-ghost', textContent: 'Volver a la lista' });
      l.addEventListener('click', goList);
      box.append(l);
      guideRoot.append(box);
      return focusTitle(title);
    }

    const steps = stepsFor(t.steps, os());
    if (t.steps.some(s => s.os)) {
      const tabs = h('div', { className: 'os-tabs' });
      for (const [v, label] of [['android', 'Android'], ['ios', 'iPhone']]) {
        const b = h('button', { type: 'button', textContent: label });
        b.setAttribute('aria-pressed', String(os() === v));
        b.addEventListener('click', () => { state.os = v; save(); drawGuide(t, 0, 'steps'); });
        tabs.append(b);
      }
      guideRoot.append(tabs);
    }
    const last = step === steps.length - 1;
    const isDone = state.done.includes(t.id);
    guideRoot.append(
      h('div', { className: 'step-count', textContent: `Paso ${step + 1} de ${steps.length}` }),
      h('div', { className: 'progress' }, h('span', { style: `width:${((step + 1) / steps.length) * 100}%` })));
    guideRoot.lastChild.previousSibling.setAttribute('aria-live', 'polite');
    const ol = h('ol', { className: 'steps', start: step + 1 });
    ol.append(h('li', { innerHTML: steps[step].html }));
    const prev = h('button', { type: 'button', className: 'btn-ghost', textContent: 'Atrás', disabled: step === 0 });
    prev.addEventListener('click', () => drawGuide(t, step - 1, 'steps'));
    const nxt = h('button', { type: 'button', className: 'btn', textContent: last ? (isDone ? 'Marcar como pendiente' : '¡Listo!') : 'Siguiente' });
    nxt.addEventListener('click', () => last ? (isDone ? undo(t) : finish(t)) : drawGuide(t, step + 1, 'steps'));
    guideRoot.append(ol, h('div', { className: 'nav' }, prev, nxt));
    if (t.na) {
      const na = h('button', { type: 'button', className: 'btn-ghost', textContent: t.na });
      na.addEventListener('click', () => finish(t));
      guideRoot.append(na);
    }
    focusTitle(title);
  }

  function finish(t) {
    const before = nCore();
    if (!state.done.includes(t.id)) state.done.push(t.id);
    save();
    drawList();
    drawGuide(t, 0, 'done', before === coreIds.length - 1 && nCore() === coreIds.length);
  }
  function undo(t) {
    state.done = state.done.filter(id => id !== t.id);
    save();
    drawList();
    goList();
  }

  function render() {
    const m = location.hash.match(/^#hacer-(.+)$/);
    const t = m && Object.hasOwn(byId, m[1]) ? byId[m[1]] : null;
    for (const c of main.children) if (c !== guideRoot) c.hidden = !!t;
    guideRoot.hidden = !t;
    drawList();
    if (t) drawGuide(t, 0, 'steps');
    else if (rendered) focusTitle(document.querySelector('h1'));
    rendered = true;
  }
  let rendered = false;
  document.querySelector('h1').tabIndex = -1;
  window.addEventListener('hashchange', render);
  render();
  document.documentElement.classList.add('js');
} catch (e) {
  console.error(e);
}
