export const STORAGE_KEY = 'pd101';
const EMPTY = () => ({ done: [], os: null });

export function loadState(storage) {
  try {
    const s = JSON.parse(storage.getItem(STORAGE_KEY));
    if (Array.isArray(s.done) && s.done.every(x => typeof x === 'string') && [null, 'android', 'ios'].includes(s.os)) {
      return { done: s.done, os: s.os };
    }
  } catch {}
  return EMPTY();
}

export function saveState(storage, state) {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

export function detectOS(userAgent, maxTouchPoints) {
  if (/iPhone|iPad|iPod/.test(userAgent)) return 'ios';
  if (/Macintosh/.test(userAgent) && maxTouchPoints > 1) return 'ios';
  return 'android';
}

export const countDone = (done, ids) => ids.filter(id => done.includes(id)).length;

export function nextPending(done, coreIds, optionalIds, current) {
  const pending = id => id !== current && !done.includes(id);
  return coreIds.find(pending) ?? optionalIds.find(pending) ?? null;
}

export const stepsFor = (steps, os) => steps.filter(s => s.os === null || s.os === os);
