/* Camada de dados do ESBOÇO (sem servidor).
 * Tudo fica no localStorage do navegador e é sincronizado entre abas por BroadcastChannel,
 * para que um pedido feito no site apareça na hora no painel aberto em outra aba.
 * Em produção esta camada é trocada por Supabase mantendo a mesma interface.
 *
 * Chaves:
 *   dog.orders      -> Pedido[]   (mais novo primeiro)
 *   dog.stock       -> { [insumoId]: quantidade }   (estoque atual; começa com DOG.insumos[].stock)
 *   dog.stockMoves  -> Movimento[] (entradas, perdas, ajustes, baixas por venda)
 *   dog.finance     -> Lancamento[] (contas a pagar/receber, despesas)
 *   dog.config      -> { open: true|false|null, pausedUntil: ms|null, prepMin, deliveryMin, off: {productId:true}, prices: {productId:number} }
 *   dog.wa          -> Mensagem[] (conversas do WhatsApp simuladas)
 *   dog.customers   -> { [telefone]: Cliente }
 *
 * Pedido = {
 *   id: "DS-1234", createdAt: ms, channel: "site"|"whatsapp"|"balcao"|"ifood"|"mesa",
 *   status: "novo"|"aceito"|"preparo"|"pronto"|"entrega"|"concluido"|"cancelado",
 *   history: [{status, at}], mode: "delivery"|"pickup"|"dinein",
 *   customer: {name, phone}, address: {quadra, conjunto, casa, complemento, referencia} | null, table: string|null,
 *   lines: [{productId, name, qty, unitPrice, options: [{group, id, name, qty, price}], note}],
 *   subtotal, fee, discount, total, payment: {method, changeFor, paid: bool}, note, courier: string|null,
 *   rating: {stars, comment} | null
 * }
 */
const KEYS = ["orders", "stock", "stockMoves", "finance", "config", "wa", "customers"];
const bc = "BroadcastChannel" in self ? new BroadcastChannel("dog-do-salsicha") : null;
const subs = new Map(); // key -> Set<fn>

function read(key, fallback) {
  try { const v = localStorage.getItem("dog." + key); return v == null ? fallback : JSON.parse(v); } catch { return fallback; }
}
function write(key, value) {
  try { localStorage.setItem("dog." + key, JSON.stringify(value)); } catch { /* cheio ou bloqueado */ }
  emit(key, value);
  bc?.postMessage({ key });
}
function emit(key, value) { (subs.get(key) || []).forEach((fn) => { try { fn(value); } catch (e) { console.error(e); } }); }

bc?.addEventListener("message", (e) => { const k = e.data?.key; if (KEYS.includes(k)) emit(k, get(k)); });
addEventListener("storage", (e) => { const k = e.key?.startsWith("dog.") && e.key.slice(4); if (k && KEYS.includes(k)) emit(k, get(k)); });

const DEFAULTS = {
  orders: () => [],
  stock: () => Object.fromEntries((window.DOG?.insumos || []).map((i) => [i.id, i.stock])),
  stockMoves: () => [],
  finance: () => [],
  config: () => ({ open: null, pausedUntil: null, prepMin: 30, deliveryMin: 60, off: {}, prices: {} }),
  wa: () => [],
  customers: () => ({})
};

export function get(key) { return read(key, DEFAULTS[key]()); }
export function set(key, value) { write(key, value); }
export function update(key, fn) { const v = fn(get(key)); write(key, v); return v; }
/** Assina mudanças (desta aba e de outras). Chama já com o valor atual. Devolve função para cancelar. */
export function watch(key, fn) {
  if (!subs.has(key)) subs.set(key, new Set());
  subs.get(key).add(fn); fn(get(key));
  return () => subs.get(key).delete(fn);
}

/* ---------- regras compartilhadas ---------- */
export const money = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const productOf = (id) => window.DOG.products[id];
export function priceOf(id) { const p = get("config").prices?.[id]; return typeof p === "number" ? p : productOf(id)?.price ?? 0; }
export function isOff(id) { const p = productOf(id); const c = get("config"); if (!p || c.off?.[id]) return true; return p.available === false && !c.on?.[id]; }

/** Preço sempre recalculado a partir do cardápio (nunca confiar no total vindo da tela). */
export function lineTotal(line) {
  const p = productOf(line.productId); if (!p) return 0;
  let unit = priceOf(line.productId);
  for (const o of line.options || []) {
    const g = p.groups?.find((x) => x.id === o.group); const opt = g?.options.find((x) => x.id === o.id);
    unit += (opt?.price || 0) * (o.qty || 1);
  }
  return Math.round(unit * line.qty * 100) / 100;
}
export function feeFor(quadra) {
  const q = String(quadra || "").trim().toUpperCase().replace(/\s+/g, " ");
  const zf = get("config").zoneFees || {};
  const hit = Object.keys(zf).find((k) => k.toUpperCase() === q); if (hit) return zf[hit];
  const z = window.DOG.zones.find((z) => z.name.toUpperCase() === q) || window.DOG.zones.find((z) => z.name.toUpperCase().startsWith(q + " "));
  return z ? z.fee : null;
}

/** Consumo de insumos de uma linha de pedido (produto + adicionais), pela ficha técnica. */
const ADDON_RECIPE = {
  ovo: { ovo: 1 }, salsicha: { salsicha: 1 }, bacon: { bacon: 20 }, mussarela: { mussarela: 30 }, cheddar: { cheddar: 20 },
  frango: { frango: 80 }, hamburguer: { "burger-artesanal": 1 }, "milho-batata": { milho: 20, "batata-palha": 20 },
  salada: { alface: 15, tomate: 30 }, "maionese-alho": { "maionese-alho": 30 }, "maionese-ervas": { "maionese-ervas": 30 }
};
export function consumptionOf(line) {
  const out = {}; const p = productOf(line.productId); if (!p) return out;
  const add = (rec, mult) => { for (const [k, q] of Object.entries(rec || {})) out[k] = (out[k] || 0) + q * mult; };
  add(get("config").recipes?.[line.productId] || p.recipe, line.qty);
  for (const o of line.options || []) {
    if (o.group === "retirar") continue;
    const opt = p.groups?.find((g) => g.id === o.group)?.options.find((x) => x.id === o.id);
    if (opt?.product) add(get("config").recipes?.[opt.product] || productOf(opt.product)?.recipe, line.qty); else add(ADDON_RECIPE[o.id], (o.qty || 1) * line.qty);
  }
  return out;
}

function nextId() {
  const max = get("orders").reduce((m, o) => Math.max(m, Number(String(o.id).replace(/\D/g, "")) || 0), 1000);
  return "DS-" + (max + 1);
}
/** Grava um pedido novo (site, balcão, WhatsApp). Recalcula totais e dá baixa no estoque. */
export function placeOrder(order) {
  const lines = order.lines.map((l) => ({ ...l, total: lineTotal(l) }));
  const subtotal = Math.round(lines.reduce((a, l) => a + l.total, 0) * 100) / 100;
  const fee = order.mode === "delivery" ? (feeFor(order.address?.quadra) ?? 0) : 0;
  const o = { channel: "site", status: "novo", payment: {}, ...order, lines, subtotal, fee, discount: order.discount || 0,
    total: Math.round((subtotal + fee - (order.discount || 0)) * 100) / 100,
    id: order.id || nextId(), createdAt: order.createdAt || Date.now(),
    history: order.history || [{ status: order.status || "novo", at: Date.now() }] };
  update("orders", (list) => [o, ...list.filter((x) => x.id !== o.id)]);
  // baixa automática de estoque pela ficha técnica
  const cons = {}; for (const l of lines) for (const [k, q] of Object.entries(consumptionOf(l))) cons[k] = (cons[k] || 0) + q;
  update("stock", (s) => { const n = { ...s }; for (const [k, q] of Object.entries(cons)) n[k] = Math.round(((n[k] ?? 0) - q) * 100) / 100; return n; });
  update("stockMoves", (m) => [{ at: Date.now(), type: "venda", ref: o.id, items: cons }, ...m].slice(0, 500));
  // cliente
  if (o.customer?.phone) update("customers", (c) => {
    const k = o.customer.phone.replace(/\D/g, ""); const prev = c[k] || { name: o.customer.name, phone: k, orders: 0, spent: 0, first: o.createdAt, optIn: false };
    return { ...c, [k]: { ...prev, name: o.customer.name || prev.name, orders: prev.orders + 1, spent: Math.round((prev.spent + o.total) * 100) / 100, last: o.createdAt } };
  });
  return o;
}
export function setStatus(id, status, extra = {}) {
  const before = get("orders").find((o) => o.id === id);
  if (before && status === "cancelado" && before.status !== "cancelado" && !before.restocked) {
    const cons = {}; for (const l of before.lines || []) for (const [k, q] of Object.entries(consumptionOf(l))) cons[k] = (cons[k] || 0) + q;
    update("stock", (s) => { const n = { ...s }; for (const [k, q] of Object.entries(cons)) n[k] = Math.round(((n[k] ?? 0) + q) * 100) / 100; return n; });
    update("stockMoves", (m) => [{ at: Date.now(), type: "estorno", ref: id, items: cons }, ...m].slice(0, 500));
    extra = { ...extra, restocked: true };
  }
  return update("orders", (list) => list.map((o) => o.id === id ? { ...o, ...extra, status, history: [...(o.history || []), { status, at: Date.now() }] } : o));
}

/** Loja aberta agora? (horário de Brasília + controle manual + pausa) */
export function storeOpen(now = new Date()) {
  const c = get("config");
  if (c.pausedUntil && c.pausedUntil > Date.now()) return { open: false, reason: "pausa" };
  if (c.open === false) return { open: false, reason: "manual" };
  if (c.open === true) return { open: true };
  const br = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const mins = br.getHours() * 60 + br.getMinutes();
  const h = c.hours || window.DOG.store.hours;
  const today = h[String(br.getDay())]; const yest = h[String((br.getDay() + 6) % 7)];
  const toM = (s) => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
  if (today && mins >= toM(today[0]) && mins < toM(today[1])) return { open: true, closesAt: today[1] };
  return { open: false, reason: "horario", opensAt: today && mins < toM(today[0]) ? today[0] : null };
}
