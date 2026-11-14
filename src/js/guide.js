// Modo guía: una tarea paso a paso (pregunta de sistema, pasos, pantalla final).
import { h, safe, focusTitle } from './dom.js';
import { OS_ICON } from './icons.js';
import { stepsFor } from './logic.js';

export function createGuide({ root, live, catalog, store, goList, onDone }) {
  const { byId, coreIds, optIds } = catalog;

  // Las opcionales no cuentan para las 3 principales: se informa aparte para no confundir.
  const progressText = t => {
    const nCore = store.count(coreIds);
    if (t.core) return `Ya hiciste ${nCore} de ${coreIds.length}`;
    const extra = `Opcionales: ${store.count(optIds)} de ${optIds.length}`;
    return nCore === coreIds.length ? `Tus 3 principales están listas ✓ · ${extra}` : `Principales: ${nCore} de ${coreIds.length} · ${extra}`;
  };

  function drawDone(t, title, congrats) {
    const next = store.nextPending(coreIds, optIds, t.id);
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
    root.append(box);
    focusTitle(title);
  }

  // Primera vez en una guía con pasos por sistema: se pregunta una vez y se recuerda.
  function drawOSPick(t, title) {
    const pick = v => safe(() => { store.setOS(v); draw(t, 0, 'steps'); });
    const order = store.defaultOS === 'ios' ? [['ios', 'iPhone'], ['android', 'Android']] : [['android', 'Android'], ['ios', 'iPhone']];
    root.append(h('div', { className: 'os-pick' }, h('h4', { textContent: '¿Qué celu tenés?' }),
      h('p', { textContent: 'Los pasos cambian según el celu.' }),
      ...order.map(([v, label]) => {
        const b = h('button', { type: 'button', className: 'btn', innerHTML: `${OS_ICON[v]}<span>${label}</span>` });
        b.addEventListener('click', pick(v));
        return b;
      })));
    focusTitle(title);
  }

  function drawSteps(t, step, title, needsOS, focusStep) {
    const steps = stepsFor(t.steps, store.os());
    if (needsOS) {
      const other = store.os() === 'android' ? ['ios', 'iPhone'] : ['android', 'Android'];
      const sw = h('button', { type: 'button', textContent: `Cambiar a ${other[1]}` });
      sw.addEventListener('click', safe(() => { store.setOS(other[0]); draw(t, 0, 'steps', false, true); }));
      root.append(h('p', { className: 'os-line' }, `Pasos para ${store.os() === 'android' ? 'Android' : 'iPhone'} · `, sw));
    }
    const last = step === steps.length - 1;
    const isDone = store.isDone(t.id);
    const stepText = `Paso ${step + 1} de ${steps.length}`;
    live.textContent = stepText;
    root.append(h('div', { className: 'progress' }, h('span', { style: `width:${((step + 1) / steps.length) * 100}%` })));
    const ol = h('ol', { className: 'steps', start: step + 1 });
    const li = h('li', { tabIndex: -1, innerHTML: steps[step].fig });
    li.append(h('div', { className: 'step-count', textContent: stepText.toUpperCase(), ariaHidden: 'true' }));
    li.insertAdjacentHTML('beforeend', steps[step].html);
    ol.append(li);
    const prev = h('button', { type: 'button', className: 'pill ghost', textContent: 'Atrás', hidden: step === 0 });
    prev.addEventListener('click', safe(() => draw(t, step - 1, 'steps', false, true)));
    const nxt = h('button', { type: 'button', className: 'pill ' + (last ? 'go' : 'pri'), textContent: last ? (isDone ? 'Volver a la lista' : '¡Terminé!') : 'Listo, siguiente' });
    nxt.addEventListener('click', safe(() => last ? (isDone ? goList() : finish(t)) : draw(t, step + 1, 'steps', false, true)));
    root.append(ol, h('div', { className: 'bar' }, h('div', { className: 'bar-in' }, prev, nxt)));
    if (focusStep) { window.scrollTo(0, 0); li.focus(); } else focusTitle(title);
  }

  function draw(t, step, screen, congrats, focusStep) {
    root.replaceChildren();
    const back = h('button', { type: 'button', className: 'back', textContent: '← Lista' });
    back.addEventListener('click', safe(goList));
    const title = h('h3', { tabIndex: -1, textContent: t.title });
    root.append(h('div', { className: 'guide-top' }, back, title));

    if (screen === 'done') return drawDone(t, title, congrats);
    const needsOS = t.steps.some(s => s.os);
    if (needsOS && !store.hasChosenOS()) return drawOSPick(t, title);
    drawSteps(t, step, title, needsOS, focusStep);
  }

  function finish(t) {
    const before = store.count(coreIds);
    store.markDone(t.id);
    onDone();
    draw(t, 0, 'done', before === coreIds.length - 1 && store.count(coreIds) === coreIds.length);
  }

  return draw;
}
