# Protección digital 101 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Sitio estático mobile-first para familiares en Argentina: checklist de 3 tareas de protección con guía paso a paso, opcionales, y página de emergencia autosuficiente.

**Architecture:** Todo lo publicable vive en `site/` (directorio de salida del deploy); docs, tests y `VERIFICAR.md` quedan fuera y nunca se publican. HTML que funciona completo sin JS. `site/app.js` (ES module, vanilla) mejora progresivamente: guía de un paso por pantalla, progreso en `localStorage`, filtro Android/iPhone. `site/emergencia/index.html` es HTML puro sin JS. Lógica pura en `site/logic.js`, testeada con `node --test`.

**Tech Stack:** HTML, CSS, JS vanilla (ES modules), `node:test` (Node ≥20) solo para tests. Sin dependencias, sin build. Hosting Cloudflare Pages o GitHub Pages con dominio propio.

**Spec:** `docs/superpowers/specs/2026-11-10-proteccion-digital-design.md`

## Global Constraints

- Español rioplatense con voseo ("tocá", "abrí"). Frases cortas. Sin jerga sin explicar ("2FA", "IMEI" se explican en una línea).
- Tono tranquilo, sin alarmismo ni culpa. Único elemento rojo: botón/página de emergencia.
- Cero recursos de terceros: sin CDNs, sin fuentes externas, sin trackers. Solo links salientes `<a href="https://...">`.
- Letra base ≥16px, contraste WCAG AA, objetivos táctiles ≥44px, `<meta name="viewport">` en cada página.
- Contenido esencial legible sin JS. `site/emergencia/index.html` no tiene `<script>`.
- **Rutas relativas** entre páginas y recursos (`style.css`, `emergencia/`, `../style.css`, `../`). Única excepción: `404.html`.
- Solo Gmail en todo lo de mail.
- Una sola fecha "Revisado: <mes> <año>" en el pie de cada página, igual en todas (hoy: "noviembre 2026").
- Nada no verificado se publica en tareas principales ni emergencia; va a `VERIFICAR.md`.
- Atajo Android en cada paso de Ajustes: "tocá la lupa 🔍 y escribí *<palabra>*".
- Respetar el marcado prescripto (clases, orden de atributos) exactamente: los tests lo leen con regex.

## Review Focus

- `localStorage` lanza excepción o no existe (navegación privada) → la página funciona igual, solo no recuerda progreso. Test en Task 3.
- Estado guardado con ids de tareas que ya no existen → se ignoran; el contador no pasa de 3 ni cuenta fantasmas. Test en Task 3.
- iPad moderno (UA "Macintosh" con pantalla táctil) y desktop → iPad `ios`; desktop `android` por defecto con selector visible. Test en Task 3.
- Las 3 principales hechas y la persona reabre una → al terminar, "Seguir" ofrece el primer opcional pendiente o, si no hay, vuelve a la lista; nunca un botón a una tarea inexistente. Test en Task 3.
- JS deshabilitado o `app.js` falla a mitad de camino → todos los pasos visibles como lista, emergencia funciona. Test en Task 4 (estructura) y verificación manual en Task 5.

---

### Task 1: Investigar y verificar contenido

Sin código. Produce el contenido fuente para Tasks 2 y 4.

**Files:**
- Create: `docs/contenido.md`
- Create: `VERIFICAR.md`

**Interfaces:**
- Produces: `docs/contenido.md` con, por tarea, `id`, título, minutos, "por qué" (1 frase), pasos Android / iPhone / comunes (≤6 por tarea), frase de "¡Listo!", texto del botón "No aplica" (solo principales), y fuente (URL oficial + fecha de consulta) por cada dato. Ids fijos: `antirrobo`, `whatsapp-pin`, `mercadopago` (principales); `navegador`, `frases`, `gestor`, `gmail-2fa` (opcionales). Más la sección emergencia con sus 6 pasos, links y teléfonos.

- [ ] **Step 1: Investigar contra fuentes oficiales** (support.google.com, support.apple.com, faq.whatsapp.com, mercadopago.com.ar/ayuda, sitios de Personal/Claro/Movistar, ENACOM, argentina.gob.ar):
  - Android: nombres actuales de "Bloqueo por detección de robo", "Bloqueo del dispositivo sin conexión", "Bloqueo remoto"; ruta en Ajustes; versión mínima; palabra para la lupa.
  - iPhone: "Protección de dispositivo robado"; ruta; versión mínima de iOS.
  - WhatsApp: ruta de verificación en dos pasos (Android e iPhone), mail de recuperación; procedimiento oficial de desactivación por robo (dirección/formulario y texto).
  - Mercado Pago: si existe ajustar límite de transferencias y desactivar/bajar línea de crédito/préstamos, y ruta en la app. Si no existe, elegir la protección de MP que sí exista (spec: tarea 3 se reemplaza, siguen siendo 3). Cómo bloquear cuenta/tarjeta en emergencia.
  - Compañías: número para bloquear línea/chip por robo (Personal, Claro, Movistar). Bloqueo de IMEI y denuncia (cómo ver el IMEI: `*#06#`).
  - Gmail: links exactos a verificación en dos pasos, códigos de respaldo, recuperación (`accounts.google.com/signin/recovery`).
  - Gestor: elegir uno gratis y simple (Bitwarden o Gestor de contraseñas de Google), justificar en una línea.
  - Navegador: cómo dejar de guardar y borrar contraseñas en Chrome Android y Safari iPhone.
  - Botones "Abrir app" (`https://wa.me/`, `intent://#Intent;package=...;end`): si no se puede confirmar que funcionan, van a `VERIFICAR.md` y el botón se omite.
- [ ] **Step 2: Escribir `docs/contenido.md`** con el formato de Interfaces. Cada dato con su fuente.
- [ ] **Step 3: Escribir `VERIFICAR.md`**: checkboxes de lo que solo se confirma en un celular real o no tuvo fuente oficial (qué probar, en qué dispositivo, resultado esperado). Siempre incluye: botones "Abrir app", detección Android/iPhone, nombres de menús en Samsung/Motorola/Xiaomi.
- [ ] **Step 4: Commit**

```bash
git add .gitignore docs/ VERIFICAR.md
git commit -m "docs: spec, plan y contenido verificado"
```

### Task 2: Estilos, página de emergencia y test de estructura

**Files:**
- Create: `site/style.css`
- Create: `site/emergencia/index.html`
- Create: `tests/site.test.mjs`
- Create: `package.json`: `{"type":"module","private":true,"scripts":{"test":"node --test"}}` (sin argumentos: `node --test tests/` falla en Node ≥21)

**Interfaces:**
- Consumes: sección emergencia de `docs/contenido.md`.
- Produces: `site/style.css` con tokens en `:root` (colores, espaciado), modo oscuro vía `prefers-color-scheme`, y clases: `.sos`, `.task`, `.task.done`, `.btn`, `.btn-ghost`, `.btn-ok`, `.steps`, `.os-label`, `.guide`, `.progress`, `.os-tabs`, `.win`, `.warning`. Regla `.js .os-label{display:none}`. Helper `read(p)` (lee `site/<p>`) y array `PAGES` en `tests/site.test.mjs`, extendidos en Tasks 4 y 6.

- [ ] **Step 1: Escribir test fallido** `tests/site.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../site/' + p, import.meta.url), 'utf8');

const PAGES = ['emergencia/index.html'];
for (const p of PAGES) {
  test(`${p}: viewport, lang es, sin recursos externos`, () => {
    const h = read(p);
    assert.match(h, /<meta name="viewport"/);
    assert.match(h, /<html lang="es/);
    assert.doesNotMatch(h, /<(script|link|img|iframe)[^>]+(src|href)="https?:/);
  });
}
test('misma fecha "Revisado" en todas las páginas', () => {
  const dates = PAGES.map(p => read(p).match(/Revisado: (\p{L}+ \d{4})/u)?.[1]);
  assert.ok(dates.every(Boolean));
  assert.equal(new Set(dates).size, 1);
});
test('emergencia sin JS, 6 pasos, rutas relativas', () => {
  const h = read('emergencia/index.html');
  assert.doesNotMatch(h, /<script/);
  assert.equal((h.match(/<li class="em-step"/g) || []).length, 6);
  assert.match(h, /google\.com\/android\/find/);
  assert.match(h, /icloud\.com\/find/);
  assert.match(h, /dorso de tu tarjeta/);
  assert.match(h, /href="\.\.\/style\.css"/);
});
```

- [ ] **Step 2: Correr** `npm test` → FAIL (archivo no existe).
- [ ] **Step 3: Escribir `site/style.css`** mobile-first (gutter 16px, max-width ~640px centrado en desktop) y **`site/emergencia/index.html`**: título "Qué hacer ya", aviso "Nadie de un banco, Mercado Pago o WhatsApp te va a pedir un código por teléfono. Si te lo piden, cortá.", `<ol>` con 6 `<li class="em-step">` en el orden del spec, botones grandes con links/`tel:`, "← Volver al inicio" a `../`, pie con fecha.
- [ ] **Step 4: Correr** `npm test` → PASS.
- [ ] **Step 5: Revisar en navegador** a 360px (`python3 -m http.server 8000 -d site`, abrir `http://localhost:8000/emergencia/`): sin scroll horizontal, botones ≥44px.
- [ ] **Step 6: Commit**

```bash
git add site/ tests/ package.json
git commit -m "feat: página de emergencia y estilos base"
```

### Task 3: Lógica pura (`site/logic.js`)

**Files:**
- Create: `site/logic.js`
- Create: `tests/logic.test.mjs`

**Interfaces:**
- Produces (exports):
  - `STORAGE_KEY = 'pd101'`
  - `loadState(storage) -> {done: string[], os: 'android'|'ios'|null}` — nunca lanza; storage `null`, roto o JSON inválido → `{done: [], os: null}`.
  - `saveState(storage, state) -> void` — nunca lanza (incluido `storage` `null`).
  - `detectOS(userAgent: string, maxTouchPoints: number) -> 'android'|'ios'` — iPhone/iPad/iPod → `ios`; `Macintosh` con `maxTouchPoints > 1` → `ios`; resto → `android`.
  - `countDone(done: string[], ids: string[]) -> number` — solo ids presentes en `ids`, sin duplicados.
  - `nextPending(done: string[], coreIds: string[], optionalIds: string[], current: string) -> string|null` — primer principal pendiente distinto de `current`; si no, primer opcional pendiente distinto de `current`; si no, `null`.
  - `stepsFor(steps: {os: 'android'|'ios'|null}[], os) -> same[]` — conserva comunes (`os: null`) y los del sistema elegido, en orden.

- [ ] **Step 1: Escribir tests fallidos** `tests/logic.test.mjs`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../site/logic.js';

const mem = (init = {}) => ({ s: { ...init }, getItem(k) { return this.s[k] ?? null; }, setItem(k, v) { this.s[k] = v; } });
const broken = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
const EMPTY = { done: [], os: null };
const CORE = ['antirrobo', 'whatsapp-pin', 'mercadopago'];
const OPT = ['navegador', 'frases', 'gestor', 'gmail-2fa'];

test('load/save roundtrip', () => {
  const m = mem(); L.saveState(m, { done: ['antirrobo'], os: 'ios' });
  assert.deepEqual(L.loadState(m), { done: ['antirrobo'], os: 'ios' });
});
test('storage roto o null no lanza', () => {
  assert.deepEqual(L.loadState(broken), EMPTY);
  assert.deepEqual(L.loadState(null), EMPTY);
  assert.doesNotThrow(() => L.saveState(broken, EMPTY));
  assert.doesNotThrow(() => L.saveState(null, EMPTY));
});
test('JSON inválido o con forma rara → estado vacío', () => {
  assert.deepEqual(L.loadState(mem({ pd101: '{nope' })), EMPTY);
  assert.deepEqual(L.loadState(mem({ pd101: '{"done":"x","os":"win"}' })), EMPTY);
});
test('detectOS', () => {
  assert.equal(L.detectOS('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0)', 5), 'ios');
  assert.equal(L.detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 5), 'ios');
  assert.equal(L.detectOS('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 0), 'android');
  assert.equal(L.detectOS('Mozilla/5.0 (Linux; Android 14; SM-A546E)', 5), 'android');
});
test('countDone ignora ids viejos y duplicados', () => {
  assert.equal(L.countDone(['antirrobo', 'antirrobo', 'tarea-vieja'], CORE), 1);
});
test('nextPending', () => {
  assert.equal(L.nextPending([], CORE, OPT, 'antirrobo'), 'whatsapp-pin');
  assert.equal(L.nextPending(['antirrobo', 'whatsapp-pin'], CORE, OPT, 'mercadopago'), 'navegador');
  assert.equal(L.nextPending([...CORE, 'navegador', 'frases', 'gestor'], CORE, OPT, 'gmail-2fa'), null);
  assert.equal(L.nextPending([...CORE, ...OPT], CORE, OPT, 'antirrobo'), null);
});
test('stepsFor', () => {
  const s = [{ os: null, t: 'a' }, { os: 'android', t: 'b' }, { os: 'ios', t: 'c' }];
  assert.deepEqual(L.stepsFor(s, 'ios').map(x => x.t), ['a', 'c']);
});
```

- [ ] **Step 2: Correr** `npm test` → FAIL (`site/logic.js` no existe).
- [ ] **Step 3: Implementar `site/logic.js`** con las firmas de Interfaces. `loadState` valida que `done` sea array de strings y `os` ∈ `'android'|'ios'|null`; cualquier otra cosa → vacío.
- [ ] **Step 4: Correr** `npm test` → PASS.
- [ ] **Step 5: Commit**

```bash
git add site/logic.js tests/logic.test.mjs
git commit -m "feat: lógica de progreso, sistema y próxima tarea"
```

### Task 4: Portada con contenido (sin JS)

**Files:**
- Create: `site/index.html`
- Modify: `tests/site.test.mjs` (agregar `'index.html'` a `PAGES` y tests nuevos)

**Interfaces:**
- Consumes: `docs/contenido.md`, `site/style.css`.
- Produces: marcado que `app.js` (Task 5) lee:
  - `<a class="sos" href="emergencia/">` y `<link rel="stylesheet" href="style.css">`.
  - `<p class="counter">` (texto inicial "3 tareas · ~15 min").
  - Por tarea, atributos en este orden: `<section class="task" id="<id>" data-kind="core|optional" data-min="<n>">` con `<h3 tabindex="-1">`, `<p class="why">`, `<ol class="steps">` cuyos `<li>` llevan `data-os="android"`, `data-os="ios"` o nada (común); los específicos empiezan con `<span class="os-label">Android:</span>` / `iPhone:`. Luego `<p class="win">` (frase de "¡Listo!"). Solo en `core`: `<button type="button" class="btn-ghost" data-na hidden>` con el texto de "No aplica" (`hidden` porque sin JS no sirve; `app.js` lo quita).
  - Links directos `<a class="btn" href="https://...">` dentro de pasos cuando la pantalla es web (p. ej. Gmail 2FA); botón "Abrir WhatsApp/Mercado Pago" solo si Task 1 lo confirmó.
  - `<section id="core">` con `antirrobo`, `whatsapp-pin`, `mercadopago` en ese orden; `<section id="optional">` "¿Querés un poco más?" con `navegador`, `frases`, `gestor`, `gmail-2fa`.
  - `<p class="warning">` con el aviso de códigos; `<footer>` con fecha; `<script type="module" src="app.js">`.

- [ ] **Step 1: Agregar `'index.html'` a `PAGES` y tests fallidos** a `tests/site.test.mjs`:

```js
const sections = h => h.split('<section class="task"').slice(1);
test('index: 3 principales en orden y 4 opcionales', () => {
  const ids = [...read('index.html').matchAll(/<section class="task" id="([^"]+)" data-kind="(core|optional)"/g)].map(m => m[1] + ':' + m[2]);
  assert.deepEqual(ids, ['antirrobo:core', 'whatsapp-pin:core', 'mercadopago:core',
    'navegador:optional', 'frases:optional', 'gestor:optional', 'gmail-2fa:optional']);
});
test('index: emergencia relativa, aviso de códigos, recursos relativos', () => {
  const h = read('index.html');
  assert.match(h, /<a class="sos" href="emergencia\/"/);
  assert.match(h, /te va a pedir un código por teléfono/);
  assert.match(h, /href="style\.css"/);
  assert.match(h, /<script type="module" src="app\.js">/);
});
test('index: cada tarea tiene pasos y win; no-aplica solo en principales', () => {
  for (const sec of sections(read('index.html'))) {
    assert.match(sec, /<ol class="steps">/);
    assert.match(sec, /<p class="win">/);
    if (sec.includes('data-kind="core"')) assert.match(sec, /data-na hidden/);
    else assert.doesNotMatch(sec, /data-na/);
  }
});
```

- [ ] **Step 2: Correr** `npm test` → FAIL.
- [ ] **Step 3: Escribir `site/index.html`** con el contenido de `docs/contenido.md`. Pasos Android de Ajustes incluyen el atajo de la lupa.
- [ ] **Step 4: Correr** `npm test` → PASS.
- [ ] **Step 5: Revisar** con JS deshabilitado a 360px (`python3 -m http.server 8000 -d site`): todo legible, etiquetas "Android:"/"iPhone:" visibles, botón de emergencia lleva a `emergencia/`.
- [ ] **Step 6: Commit**

```bash
git add site/index.html tests/site.test.mjs
git commit -m "feat: portada con tareas y contenido"
```

### Task 5: Interacción (`site/app.js`): checklist, guía y "¡Listo!"

**Files:**
- Create: `site/app.js`
- Modify: `site/style.css` (estilos de modo guía si faltan)

**Interfaces:**
- Consumes: todo `site/logic.js` (Task 3); marcado de Task 4.
- Produces: comportamiento, sin exports.

Comportamiento (fuente: spec "Estructura y flujo" y boceto `.superpowers/brainstorm/108860-1794338072/content/layout-v2.html`):
- **Init dentro de try/catch.** `storage` = `localStorage` dentro de try (si lanza → `null`). `state = loadState(storage)`; si `state.os` es null → `detectOS(navigator.userAgent, navigator.maxTouchPoints)`. Montar todo; **recién al final** agregar `class="js"` a `<html>`. Si algo lanza, no se agrega la clase y la página queda como sin JS.
- **Ruteo por hash, una sola función `render()`** llamada al cargar y en `hashchange`: `#hacer-<id>` con id válido → guía de esa tarea; vacío o desconocido → lista. (El prefijo `hacer-` evita que el navegador salte a la `<section id>`.)
  - "Hacerlo ahora" → `location.hash = 'hacer-<id>'` (entrada nueva en historial).
  - "← Volver a la lista" → `history.back()` si la guía se abrió desde la lista en esta sesión; si no (recarga, link directo), `history.replaceState(null, '', location.pathname)` + `render()`.
  - "Seguir: …" → `location.replace('#hacer-<next>')` (no acumula historial).
  - La pantalla "¡Listo!" vive en el mismo hash que su guía.
- **Lista:** cada `.task` muestra título, minutos y "Hacerlo ahora →"; las hechas, clase `done`, "✓ ¡Hecho!" y botón "Ver de nuevo" (abre la guía; así se puede deshacer un "No aplica" por error: en la guía de una tarea hecha, el botón final dice "Marcar como pendiente"). Pasos ocultos. Contador: "`countDone(done, coreIds)` de 3 hechas".
- **Guía:** título (`h3 tabindex="-1"`), `.os-tabs` **solo si la tarea tiene algún `li[data-os]`** (botones con `aria-pressed`; al cambiar → guarda `os`, recalcula pasos, vuelve al paso 1), "Paso N de M" en contenedor `aria-live="polite"`, `.progress`, un `<li>` de `stepsFor` por pantalla, Atrás/Siguiente. Último paso: "Siguiente" → "¡Listo!". En principales, el botón `data-na` visible en todos los pasos.
- **"¡Listo!" o "No aplica":** agrega id a `done` (sin duplicar), guarda, muestra 🎉 + la `.win` de la tarea + "Ya hiciste X de 3" + "Seguir: <título de nextPending> →" si no es null. Si `countDone` sobre `coreIds` pasó de 2 a 3 en esta acción → mensaje de felicitación "¡Ya estás más protegido!" con oferta de los opcionales. Siempre "Volver a la lista".
- Cada pantalla nueva: `scrollTo(0,0)` y `focus()` al título.

- [ ] **Step 1: Implementar `site/app.js`** según lo anterior.
- [ ] **Step 2: Correr** `npm test` → PASS.
- [ ] **Step 3: Verificación manual** en `http://localhost:8000/` con emulación móvil 360px:
  - Completar `antirrobo` → "¡Listo!" → "Seguir: PIN de WhatsApp" → completar → "Seguir" → "No uso Mercado Pago" → felicitación, contador "3 de 3".
  - Atrás del navegador desde una guía → lista; desde la lista tras "Seguir" no reaparecen guías viejas.
  - Recargar en `#hacer-whatsapp-pin` → abre la guía; "Volver a la lista" funciona.
  - Reabrir `mercadopago` hecha → "Marcar como pendiente" → contador baja.
  - Cambiar a iPhone: pasos cambian, se recuerda al recargar. Tarea sin pasos por sistema: sin pestañas.
  - `localStorage` bloqueado (DevTools → Application → bloquear storage): todo funciona, sin errores en consola.
  - Forzar error (p. ej. renombrar temporalmente `logic.js`): la página se ve completa como sin JS.
- [ ] **Step 4: Commit**

```bash
git add site/app.js site/style.css
git commit -m "feat: guía paso a paso y progreso"
```

### Task 6: Publicación

**Files:**
- Create: `README.md`
- Create: `site/404.html`
- Modify: `tests/site.test.mjs` (agregar `'404.html'` a `PAGES`)

- [ ] **Step 1:** Agregar `'404.html'` a `PAGES`, `npm test` → FAIL; crear `site/404.html` sin JS con links a `/` y `/emergencia/` (rutas **absolutas** a propósito: se sirve en cualquier ruta; asume dominio propio; comentario en el HTML explicándolo); `npm test` → PASS.
- [ ] **Step 2: Escribir `README.md`**: qué es; previsualizar (`python3 -m http.server 8000 -d site`); editar contenido (en `site/index.html` / `site/emergencia/index.html`, actualizar "Revisado:" en todas las páginas); `npm test`; deploy en Cloudflare Pages (conectar repo, build command vacío, output directory `site`) y dominio propio; alternativa GitHub Pages publicando `site/` con GitHub Actions (`actions/upload-pages-artifact` con `path: site`); revisar `VERIFICAR.md` antes de cada publicación.
- [ ] **Step 3: Commit**

```bash
git add README.md site/404.html tests/site.test.mjs
git commit -m "docs: README y 404"
```

- [ ] **Step 4: Handoff al autor** (no lo hace el agente): crear repo remoto, conectar Cloudflare Pages, comprar/conectar dominio, completar `VERIFICAR.md` en su celular.
