// Utilidades de DOM y red de seguridad: si algo falla, la página vuelve a funcionar sin JS.

export const h = (tag, props = {}, ...kids) => {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
};

export const focusTitle = el => { window.scrollTo(0, 0); el?.focus(); };

// Vuelve a la página sin JS (todo visible, sin guía).
export function fallback() {
  document.documentElement.classList.remove('js');
  document.querySelector('.guide')?.remove();
  document.querySelector('.sr-only')?.remove();
  document.querySelectorAll('main [hidden]').forEach(e => { e.hidden = false; });
  document.querySelectorAll('.min, .actions, .stepper').forEach(e => e.remove());
}

export const safe = fn => (...a) => { try { return fn(...a); } catch (e) { console.error(e); fallback(); } };
