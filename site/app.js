import { loadState, saveState, detectOS, countDone, nextPending, stepsFor } from './logic.js';

// Vuelve a la página sin JS (todo visible, sin guía).
function fallback() {
  document.documentElement.classList.remove('js');
  document.querySelector('.guide')?.remove();
  document.querySelector('.sr-only')?.remove();
  document.querySelectorAll('main [hidden]').forEach(e => { e.hidden = false; });
  document.querySelectorAll('.min, .actions, .stepper').forEach(e => e.remove());
}
const safe = fn => (...a) => { try { return fn(...a); } catch (e) { console.error(e); fallback(); } };

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
    short: el.dataset.short,
    win: el.querySelector('.win').textContent,
    steps: [...el.querySelectorAll('.steps > li')].map(li => {
      const c = li.cloneNode(true);
      c.querySelector('.os-label')?.remove();
      const fig = c.querySelector('figure')?.outerHTML ?? '';
      c.querySelector('figure')?.remove();
      return { os: li.dataset.os ?? null, fig, html: c.innerHTML.trim() };
    }),
  }));
  const byId = Object.fromEntries(tasks.map(t => [t.id, t]));
  const coreIds = tasks.filter(t => t.core).map(t => t.id);
  const optIds = tasks.filter(t => !t.core).map(t => t.id);

  // Región viva persistente: si se recrea, los lectores de pantalla no anuncian el cambio.
  const live = Object.assign(document.createElement('div'), { className: 'sr-only' });
  live.setAttribute('aria-live', 'polite');
  document.body.append(live);
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
    t.go.addEventListener('click', safe(() => { fromList = true; location.hash = 'hacer-' + t.id; }));
    t.el.querySelector('h3').after(h('p', { className: 'min', textContent: `~${t.min} min` }));
    t.el.append(h('div', { className: 'actions' }, t.status, t.go));
  }
  let fromList = false;

  // Stepper arriba de todo: las 3 tareas principales y si están hechas.
  const stepper = h('ol', { className: 'stepper', ariaLabel: 'Tus 3 tareas principales' });
  const coreTasks = tasks.filter(t => t.core);
  for (const t of coreTasks) {
    t.dot = h('span', { className: 'dot' });
    t.stepBtn = h('button', { type: 'button' }, t.dot, h('span', { className: 'lbl', textContent: t.short }));
    t.stepBtn.addEventListener('click', safe(() => { fromList = true; location.hash = 'hacer-' + t.id; }));
    stepper.append(h('li', {}, t.stepBtn));
  }
  document.querySelector('header').append(stepper);

  function drawList() {
    for (const t of tasks) {
      const done = state.done.includes(t.id);
      t.el.classList.toggle('done', done);
      t.status.hidden = !done;
      t.go.className = done ? 'btn-ghost' : 'btn';
      t.go.textContent = done ? 'Ver de nuevo' : 'Hacerlo ahora →';
    }
    const firstPending = coreTasks.find(t => !state.done.includes(t.id));
    coreTasks.forEach((t, i) => {
      const done = state.done.includes(t.id);
      t.stepBtn.parentElement.className = done ? 'done' : t === firstPending ? 'current' : '';
      t.dot.textContent = done ? '✓' : String(i + 1);
      t.stepBtn.setAttribute('aria-label', `${i + 1}. ${t.title}: ${done ? 'hecha' : 'pendiente'}`);
    });
    counter.textContent = `${nCore()} de ${coreIds.length} hechas · ~15 min`;
  }

  function goList() {
    if (fromList) history.back();
    else { history.replaceState(null, '', location.pathname + location.search); render(); }
  }

  // Las opcionales no cuentan para las 3 principales: se informa aparte para no confundir.
  const progressText = t => {
    if (t.core) return `Ya hiciste ${nCore()} de ${coreIds.length}`;
    const opt = countDone(state.done, optIds);
    const extra = `Opcionales: ${opt} de ${optIds.length}`;
    return nCore() === coreIds.length ? `Tus 3 principales están listas ✓ · ${extra}` : `Principales: ${nCore()} de ${coreIds.length} · ${extra}`;
  };

  function drawGuide(t, step, screen, congrats, focusStep) {
    guideRoot.replaceChildren();
    const back = h('button', { type: 'button', className: 'back', textContent: '← Lista' });
    back.addEventListener('click', safe(goList));
    const title = h('h3', { tabIndex: -1, textContent: t.title });
    guideRoot.append(h('div', { className: 'guide-top' }, back, title));

    if (screen === 'done') {
      const next = nextPending(state.done, coreIds, optIds, t.id);
      const box = h('div', { className: 'done-screen' },
        h('div', { className: 'emoji', textContent: '🎉' }),
        h('p', { className: 'win', textContent: t.win }),
        h('p', { textContent: progressText(t) }));
      if (congrats) box.append(h('p', { className: 'win', textContent: '¡Ya estás más protegido! Si querés, seguí con las opcionales.' }));
      if (next) {
        const b = h('button', { type: 'button', className: 'btn', textContent: `Seguir: ${byId[next].title} →` });
        b.addEventListener('click', safe(() => location.replace('#hacer-' + next)));
        box.append(b);
      }
      const l = h('button', { type: 'button', className: 'btn-ghost', textContent: 'Volver a la lista' });
      l.addEventListener('click', safe(goList));
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
        b.addEventListener('click', safe(() => { state.os = v; save(); drawGuide(t, 0, 'steps', false, true); }));
        tabs.append(b);
      }
      guideRoot.append(tabs);
    }
    const last = step === steps.length - 1;
    const isDone = state.done.includes(t.id);
    const stepText = `Paso ${step + 1} de ${steps.length}`;
    live.textContent = stepText;
    guideRoot.append(h('div', { className: 'progress' }, h('span', { style: `width:${((step + 1) / steps.length) * 100}%` })));
    const ol = h('ol', { className: 'steps', start: step + 1 });
    const li = h('li', { tabIndex: -1, innerHTML: steps[step].fig });
    li.append(h('div', { className: 'step-count', textContent: stepText.toUpperCase(), ariaHidden: 'true' }));
    li.insertAdjacentHTML('beforeend', steps[step].html);
    ol.append(li);
    const prev = h('button', { type: 'button', className: 'pill ghost', textContent: 'Atrás', hidden: step === 0 });
    prev.addEventListener('click', safe(() => drawGuide(t, step - 1, 'steps', false, true)));
    const nxt = h('button', { type: 'button', className: 'pill ' + (last ? 'go' : 'pri'), textContent: last ? (isDone ? 'Volver a la lista' : '¡Terminé!') : 'Listo, siguiente' });
    nxt.addEventListener('click', safe(() => last ? (isDone ? goList() : finish(t)) : drawGuide(t, step + 1, 'steps', false, true)));
    guideRoot.append(ol, h('div', { className: 'bar' }, h('div', { className: 'bar-in' }, prev, nxt)));
    if (focusStep) { window.scrollTo(0, 0); li.focus(); } else focusTitle(title);
  }

  function finish(t) {
    const before = nCore();
    if (!state.done.includes(t.id)) state.done.push(t.id);
    save();
    drawList();
    drawGuide(t, 0, 'done', before === coreIds.length - 1 && nCore() === coreIds.length);
  }
  const render = safe(function render() {
    const m = location.hash.match(/^#hacer-(.+)$/);
    const t = (m && tasks.find(x => x.id === m[1])) ?? null;
    for (const c of main.children) if (c !== guideRoot) c.hidden = !!t;
    guideRoot.hidden = !t;
    document.body.classList.toggle('in-guide', !!t);
    drawList();
    if (t) drawGuide(t, 0, 'steps');
    else if (rendered) focusTitle(document.querySelector('h1'));
    rendered = true;
  });
  let rendered = false;
  document.querySelector('h1').tabIndex = -1;
  window.addEventListener('hashchange', render);
  render();
  document.documentElement.classList.add('js');
} catch (e) {
  console.error(e);
  fallback();
}
