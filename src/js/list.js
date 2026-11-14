// Pantalla de lista: decora las tareas del HTML y dibuja stepper, contador y estado de cada una.
import { h, safe } from './dom.js';
import { rowIcon } from './icons.js';

export function initList({ catalog, store, main, onOpen }) {
  const { all, core, coreIds } = catalog;
  const counter = main.querySelector('.counter');
  const open = t => safe(() => onOpen(t.id));
  const row = new Map();   // id → { status, go }
  const step = new Map();  // id → { item, dot }

  for (const t of all) {
    const status = h('span', { className: 'status', textContent: '✓ ¡Hecho!' });
    const go = h('button', { type: 'button', className: 'btn' });
    go.addEventListener('click', open(t));
    t.el.querySelector('h3').after(h('p', { className: 'min', textContent: `~${t.min} min` }));
    t.el.append(h('div', { className: 'actions' }, status, go));
    // Opcionales: toda la fila se toca.
    if (!t.core) t.el.addEventListener('click', e => { if (!go.contains(e.target)) go.click(); });
    row.set(t.id, { status, go });
  }

  // Stepper arriba de todo: las 3 principales y si están hechas.
  const stepper = h('ol', { className: 'stepper', ariaLabel: 'Tus 3 tareas principales' });
  for (const t of core) {
    const dot = h('span', { className: 'dot' });
    const btn = h('button', { type: 'button' }, dot, h('span', { className: 'lbl', textContent: t.short }));
    btn.addEventListener('click', open(t));
    const item = h('li', {}, btn);
    stepper.append(item);
    step.set(t.id, { item, btn, dot });
  }
  document.querySelector('header').append(stepper);

  return function drawList() {
    for (const t of all) {
      const done = store.isDone(t.id);
      const { status, go } = row.get(t.id);
      t.el.classList.toggle('done', done);
      status.hidden = !done;
      go.className = done ? 'btn-ghost' : 'btn';
      if (t.core) go.textContent = done ? 'Ver de nuevo' : 'Hacerlo ahora →';
      else {
        go.innerHTML = rowIcon(done);
        go.setAttribute('aria-label', `${done ? 'Ver de nuevo' : 'Hacer'}: ${t.title}`);
      }
    }
    const firstPending = core.find(t => !store.isDone(t.id));
    core.forEach((t, i) => {
      const done = store.isDone(t.id);
      const { item, btn, dot } = step.get(t.id);
      item.className = done ? 'done' : t === firstPending ? 'current' : '';
      dot.textContent = done ? '✓' : String(i + 1);
      btn.setAttribute('aria-label', `${i + 1}. ${t.title}: ${done ? 'hecha' : 'pendiente'}`);
    });
    counter.textContent = `${store.count(coreIds)} de ${coreIds.length} hechas · ~15 min`;
  };
}
