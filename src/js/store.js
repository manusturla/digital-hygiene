// Progreso y sistema elegido: único dueño del estado y de su persistencia.
import { loadState, saveState, countDone, nextPending } from './logic.js';

export function createStore(storage, defaultOS) {
  const state = loadState(storage);
  const save = () => saveState(storage, state);
  return {
    defaultOS,
    isDone: id => state.done.includes(id),
    markDone(id) { if (!state.done.includes(id)) state.done.push(id); save(); },
    count: ids => countDone(state.done, ids),
    nextPending: (coreIds, optIds, current) => nextPending(state.done, coreIds, optIds, current),
    hasChosenOS: () => state.os != null,
    os: () => state.os ?? defaultOS,
    setOS(v) { state.os = v; save(); },
  };
}
