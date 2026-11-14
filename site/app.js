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

// Íconos simples (currentColor) para la pregunta de sistema.
const OS_ICON = {
  android: '<svg viewBox="0 0 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M5.5 10h13v8a1.5 1.5 0 0 1-1.5 1.5h-1V22a1.250 1.250 0 0 1-2.500 0v-2.500h-3V22a1.250 1.250 0 0 1-2.500 0v-2.500H7A1.500 1.500 0 0 1 5.500 18zM3.500 10.500a1.250 1.250 0 0 1 2.500 0v5.500a1.250 1.250 0 0 1-2.500 0zm14.500 0a1.250 1.250 0 0 1 2.500 0V16a1.250 1.250 0 0 1-2.500 0zM6 9a6 6 0 0 1 12 0zm3.800-5.600L8.600 1.600m5.600 1.800 1.200-1.800" /><path stroke="currentColor" stroke-width="1.200" stroke-linecap="round" d="M9 3.500 7.800 1.700M15 3.500l1.200-1.800"/><circle cx="9.500" cy="6.500" r=".9" fill="#fff"/><circle cx="14.500" cy="6.500" r=".9" fill="#fff"/></svg>',
  ios: '<svg viewBox="0 1.500 24 24" width="32" height="32" aria-hidden="true"><path fill="currentColor" d="M16.400 12.600c0-2.300 1.900-3.400 2-3.500-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.15-2.800.85-3.500.85s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.350 1.200-.05 1.600-.75 3-.75s1.800.75 3.050.7c1.250-.02 2.050-1.150 2.800-2.300.9-1.300 1.250-2.550 1.270-2.600-.03-.01-2.450-.95-2.450-3.750zM14.200 5.700c.65-.8 1.100-1.900.95-3-.95.04-2.100.64-2.780 1.430-.6.700-1.150 1.850-1 2.900 1.050.08 2.150-.55 2.830-1.330z"/></svg>',
};

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
    if (!t.core) t.el.addEventListener('click', e => { if (!t.go.contains(e.target)) t.go.click(); });
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
      if (t.core) t.go.textContent = done ? 'Ver de nuevo' : 'Hacerlo ahora →';
      else t.go.innerHTML = `<svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="3.500" stroke-linecap="round" stroke-linejoin="round"><path d="${done ? 'M4 12.500l5 5L20 6.500' : 'M4 12h16M13 5l7 7-7 7'}"/></svg>`;
      if (!t.core) t.go.setAttribute('aria-label', `${done ? 'Ver de nuevo' : 'Hacer'}: ${t.title}`);
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

    const needsOS = t.steps.some(s => s.os);
    // Primera vez en una guía con pasos por sistema: se pregunta una vez y se recuerda.
    if (needsOS && state.os == null) {
      const pick = v => safe(() => { state.os = v; save(); drawGuide(t, 0, 'steps'); });
      const order = defaultOS === 'ios' ? [['ios', 'iPhone'], ['android', 'Android']] : [['android', 'Android'], ['ios', 'iPhone']];
      guideRoot.append(h('div', { className: 'os-pick' }, h('h4', { textContent: '¿Qué celu tenés?' }),
        h('p', { textContent: 'Los pasos cambian según el celu.' }),
        ...order.map(([v, label]) => { const b = h('button', { type: 'button', className: 'btn', innerHTML: `${OS_ICON[v]}<span>${label}</span>` }); b.addEventListener('click', pick(v)); return b; })));
      return focusTitle(title);
    }
    const steps = stepsFor(t.steps, os());
    if (needsOS) {
      const other = os() === 'android' ? ['ios', 'iPhone'] : ['android', 'Android'];
      const sw = h('button', { type: 'button', textContent: `Cambiar a ${other[1]}` });
      sw.addEventListener('click', safe(() => { state.os = other[0]; save(); drawGuide(t, 0, 'steps', false, true); }));
      guideRoot.append(h('p', { className: 'os-line' }, `Pasos para ${os() === 'android' ? 'Android' : 'iPhone'} · `, sw));
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
