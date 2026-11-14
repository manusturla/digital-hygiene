// Lee las tareas del HTML (el contenido vive en src/tareas/*.html; acá solo se parsea).

export function readTasks(main) {
  const all = [...main.querySelectorAll('.task')].map(el => ({
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
  const core = all.filter(t => t.core);
  return {
    all,
    core,
    byId: Object.fromEntries(all.map(t => [t.id, t])),
    coreIds: core.map(t => t.id),
    optIds: all.filter(t => !t.core).map(t => t.id),
  };
}
