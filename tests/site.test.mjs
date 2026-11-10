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
