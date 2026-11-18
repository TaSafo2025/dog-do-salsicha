/* Sacola do cliente: guardada no aparelho (localStorage "dog.site.cart"). Preços sempre via store.lineTotal. */
import { S, lsGet, lsSet } from "./dom.js";

const KEY = "dog.site.cart";
let lines = (lsGet(KEY, []) || []).filter((l) => window.DOG.products[l.productId]);
const subs = new Set();
const uid = () => Math.random().toString(36).slice(2, 9);
const sig = (l) => JSON.stringify([l.productId, (l.options || []).map((o) => [o.group, o.id, o.qty]).sort(), (l.note || "").trim()]);

function commit() { lsSet(KEY, lines); subs.forEach((fn) => fn(lines)); }

export const cart = {
  get lines() { return lines; },
  subscribe(fn) { subs.add(fn); fn(lines); return () => subs.delete(fn); },
  find: (key) => lines.find((l) => l.key === key),
  add(line) {
    const same = lines.find((l) => sig(l) === sig(line));
    if (same) same.qty += line.qty; else lines = [...lines, { ...line, key: uid() }];
    commit();
  },
  replace(key, line) {
    lines = lines.map((l) => (l.key === key ? { ...line, key } : l));
    commit();
  },
  setQty(key, qty) {
    if (qty < 1) return;
    lines = lines.map((l) => (l.key === key ? { ...l, qty: Math.min(qty, 50) } : l));
    commit();
  },
  /** remove e devolve uma função "desfazer" */
  remove(key) {
    const idx = lines.findIndex((l) => l.key === key); if (idx < 0) return () => {};
    const removed = lines[idx];
    lines = lines.filter((l) => l.key !== key); commit();
    return () => { const n = [...lines]; n.splice(Math.min(idx, n.length), 0, removed); lines = n; commit(); };
  },
  clear() { const prev = lines; lines = []; commit(); return () => { lines = prev; commit(); }; },
  count: () => lines.reduce((a, l) => a + l.qty, 0),
  subtotal: () => Math.round(lines.reduce((a, l) => a + S.lineTotal(l), 0) * 100) / 100,
  has: (productId) => lines.some((l) => l.productId === productId),
  offLines: () => lines.filter((l) => S.isOff(l.productId))
};
