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
    assert.doesNotMatch(h, /<(script|link|img|iframe)[^>]+(src|href)="(https?:)?\/\//);
    assert.doesNotMatch(h, /="\/\//);
  });
}
test('style.css: sin recursos externos', () => {
  const c = read('style.css');
  assert.doesNotMatch(c, /url\(\s*["']?(https?:)?\/\//);
  assert.doesNotMatch(c, /@import/);
});
test('emergencia: dígitos de cada tel: igual a los del texto visible', () => {
  const links = [...read('emergencia/index.html').matchAll(/href="tel:([^"]+)"[^>]*>([^<]+)</g)];
  assert.ok(links.length >= 2);
  for (const [, tel, txt] of links) assert.equal(tel.replace(/\D/g, ''), txt.replace(/^[^:]*:/, '').replace(/\D/g, ''));
});
test('navegador: todo paso que menciona borrar trae la advertencia "acuerdes"', () => {
  const sec = sections(read('index.html')).find(s => s.includes('id="navegador"'));
  const lis = [...sec.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)].map(m => m[1]);
  const del = lis.filter(l => /borr/i.test(l));
  assert.ok(del.length >= 2);
  for (const l of del) assert.match(l, /acuerdes/);
  assert.equal(lis.filter(l => /acuerdes/.test(l)).length, del.length);
});
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
test('index: cada tarea tiene pasos y win; cada paso tiene h4', () => {
  for (const sec of sections(read('index.html'))) {
    assert.match(sec, /<ol class="steps">/);
    assert.match(sec, /<p class="win">/);
    const lis = sec.match(/<li[^>]*>[\s\S]*?<\/li>/g);
    for (const l of lis) assert.match(l, /<h4>(<span[^>]*>[^<]*<\/span>)? ?[^<]+<\/h4>/);
  }
});
test('no existe "No aplica" (data-na) en ningún lado', () => {
  for (const f of ['index.html', 'app.js', 'style.css']) assert.doesNotMatch(read(f), /data-na/);
});
test('mercadopago: avisa que sin cuenta se toca ¡Terminé!', () => {
  assert.match(sections(read('index.html')).find(s => s.includes('id="mercadopago"')), /¿No usás Mercado Pago\? Tocá ¡Terminé! y seguí\./);
});
