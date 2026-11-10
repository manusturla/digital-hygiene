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
