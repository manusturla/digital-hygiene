import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const read = p => readFileSync(new URL('../site/' + p, import.meta.url), 'utf8');

const PAGES = ['emergencia/index.html', 'index.html', '404.html'];
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
