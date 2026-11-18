/* Regras de gestão do painel: custo, CMV, taxas, DRE, fluxo de caixa, lista de compras.
 * Tudo é calculado a partir da camada store.js (pedidos, estoque, movimentos, financeiro, config). */
import * as store from "../store.js";
import { DAY, startOfDay, dayKey } from "./dom.js";

export const D = () => window.DOG;
export const FEES = { ifoodCommission: 0.12, ifoodOnline: 0.032, credito: 0.032, debito: 0.015, pix: 0, dinheiro: 0 };
export const CMV_IDEAL = 0.35;
export const CHANNELS = {
  site: { label: "Site próprio", short: "Site" }, whatsapp: { label: "WhatsApp", short: "WhatsApp" },
  balcao: { label: "Balcão", short: "Balcão" }, ifood: { label: "iFood", short: "iFood" }, mesa: { label: "Mesa", short: "Mesa" }
};
export const PAY = { pix: "Pix", dinheiro: "Dinheiro", credito: "Crédito", debito: "Débito", ifood: "Pago no iFood" };
export const STATUS = {
  novo: "Novo", aceito: "Aceito", preparo: "Em preparo", pronto: "Pronto", entrega: "Saiu p/ entrega", concluido: "Concluído", cancelado: "Recusado"
};
export const MODES = { delivery: "Entrega", pickup: "Retirada", dinein: "No local" };

/* ---------- insumos e fichas técnicas ---------- */
let ORIGINAL = null; // receitas originais do cardápio (para "restaurar")
export function snapshotRecipes() {
  if (ORIGINAL) return;
  ORIGINAL = Object.fromEntries(Object.entries(D().products).map(([id, p]) => [id, { ...(p.recipe || {}) }]));
  for (const z of D().zones) z.feeOriginal ??= z.fee;
}
export const originalRecipe = (pid) => ({ ...(ORIGINAL?.[pid] || D().products[pid]?.recipe || {}) });
/** Aplica, em memória, as fichas editadas e as taxas por quadra salvas na config (para o painel calcular e dar baixa certo). */
export function applyOverrides(cfg) {
  snapshotRecipes();
  for (const [pid, p] of Object.entries(D().products)) p.recipe = { ...(cfg.recipes?.[pid] || ORIGINAL[pid]) };
  for (const z of D().zones) z.fee = cfg.zoneFees?.[z.name] ?? z.feeOriginal;
}
let INS = null;
export const insumo = (id) => (INS ||= Object.fromEntries(D().insumos.map((i) => [i.id, i])))[id];
export const insumos = () => D().insumos;
export const insCost = (id, cfg = store.get("config")) => cfg.costs?.[id] ?? insumo(id)?.cost ?? 0;
export const recipeOf = (pid, cfg = store.get("config")) => cfg.recipes?.[pid] || originalRecipe(pid);
export function productCost(pid, cfg = store.get("config"), recipe) {
  const r = recipe || recipeOf(pid, cfg); let c = 0;
  for (const [k, q] of Object.entries(r)) c += q * insCost(k, cfg);
  return Math.round(c * 100) / 100;
}
/** Pacote de compra a partir do texto buyUnit ("pacote 10 un", "kg", "lata 1,7 kg", "pacote 3 kg (~60 un)") */
export function packOf(ins) {
  const t = String(ins.buyUnit || "").toLowerCase();
  if (t.includes("produção")) return { size: ins.unit === "g" ? 2000 : 10, label: ins.unit === "g" ? "lote de 2 kg" : "lote de 10 un", own: true };
  if (ins.unit === "un") { const m = t.match(/~?\s*(\d+)\s*un/); return { size: m ? +m[1] : t.includes("pacote") ? 100 : 1, label: ins.buyUnit }; }
  const kg = t.match(/(\d+(?:,\d+)?)\s*kg/); if (kg) return { size: Math.round(parseFloat(kg[1].replace(",", ".")) * 1000), label: ins.buyUnit };
  if (t === "kg") return { size: 1000, label: "kg" };
  if (t.includes("pé")) return { size: 250, label: "pé (~250 g)" };
  const g = t.match(/(\d+)\s*g/); return { size: g ? +g[1] : 1000, label: ins.buyUnit };
}
export function fmtQty(id, q) {
  const i = insumo(id); const n = Number(q) || 0;
  if (!i || i.unit === "un") return (Math.round(n * 10) / 10).toLocaleString("pt-BR") + " un";
  return Math.abs(n) >= 1000 ? (n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " kg" : Math.round(n).toLocaleString("pt-BR") + " g";
}
export const unitLabel = (id) => (insumo(id)?.unit === "g" ? "kg" : "un");
/** custo por kg ou por un, para exibição */
export const costPerShown = (id, cfg) => insCost(id, cfg) * (insumo(id)?.unit === "g" ? 1000 : 1);

/* ---------- pedidos ---------- */
export function payMethod(o) {
  if (o.channel === "ifood") return "ifood";
  const m = String(o.payment?.method || "").toLowerCase();
  if (m.includes("pix")) return "pix"; if (m.includes("din")) return "dinheiro";
  if (m.includes("cr")) return "credito"; if (m.includes("d")) return "debito"; if (m.includes("ifood") || m.includes("online")) return "ifood";
  return "pix";
}
const memo = new Map(); let memoVer = "";
export function orderMetrics(o, cfg) {
  const ver = JSON.stringify(cfg.costs || {}).length + ":" + JSON.stringify(cfg.recipes || {});
  if (ver !== memoVer) { memo.clear(); memoVer = ver; }
  const key = o.id + o.createdAt + o.total;
  let m = memo.get(key);
  if (!m) {
    let cost = 0;
    for (const l of o.lines || []) for (const [k, q] of Object.entries(store.consumptionOf(l))) cost += q * insCost(k, cfg);
    const pm = payMethod(o); const t = o.total || 0;
    const ifood = o.channel === "ifood" ? t * (FEES.ifoodCommission + FEES.ifoodOnline) : 0;
    const card = pm === "credito" ? t * FEES.credito : pm === "debito" ? t * FEES.debito : 0;
    m = { cost: Math.round(cost * 100) / 100, ifood, card, fees: ifood + card, pm };
    memo.set(key, m);
  }
  return m;
}
export const valid = (o) => o.status !== "cancelado";
export const inRange = (t, a, b) => t >= a && t < b;

/** agrega pedidos válidos num intervalo */
export function summarize(orders, cfg, from, to) {
  const r = { sales: 0, count: 0, cost: 0, ifood: 0, card: 0, fees: 0, fee: 0, byChannel: {}, byPay: {}, byProduct: {}, orders: [] };
  for (const o of orders) {
    if (!valid(o) || !inRange(o.createdAt, from, to)) continue;
    const m = orderMetrics(o, cfg);
    r.sales += o.total; r.count++; r.cost += m.cost; r.ifood += m.ifood; r.card += m.card; r.fees += m.fees; r.fee += o.fee || 0; r.orders.push(o);
    const c = (r.byChannel[o.channel] ||= { sales: 0, count: 0, cost: 0, fees: 0 }); c.sales += o.total; c.count++; c.cost += m.cost; c.fees += m.fees;
    const p = (r.byPay[m.pm] ||= { sales: 0, count: 0, fees: 0 }); p.sales += o.total; p.count++; p.fees += m.fees;
    for (const l of o.lines || []) {
      const x = (r.byProduct[l.productId] ||= { qty: 0, sales: 0, cost: 0 });
      x.qty += l.qty; x.sales += l.total ?? store.lineTotal(l);
      for (const [k, q] of Object.entries(store.consumptionOf(l))) x.cost += q * insCost(k, cfg);
    }
  }
  r.cmv = r.sales ? r.cost / (r.sales - r.fee) : 0; // CMV sobre a venda de produtos (sem taxa de entrega)
  r.ticket = r.count ? r.sales / r.count : 0;
  return r;
}

/* ---------- períodos ---------- */
export function monthRange(t = Date.now(), offset = 0) {
  const d = new Date(t); const a = new Date(d.getFullYear(), d.getMonth() + offset, 1).getTime();
  const b = new Date(d.getFullYear(), d.getMonth() + offset + 1, 1).getTime(); return [a, b];
}
export const daysIn = (a, b) => Math.round((b - a) / DAY);
export function openOn(t) { return !!D().store.hours[String(new Date(t).getDay())]; }

/* ---------- financeiro ---------- */
export const bills = (fin) => fin.filter((f) => f.kind === "bill");
export const receivables = (fin) => fin.filter((f) => f.kind === "receivable");
export const cashSessions = (fin) => fin.filter((f) => f.kind === "cash").sort((a, b) => b.openedAt - a.openedAt);
export const isFixed = (b) => b.cat !== "Insumos";

export function lossesValue(moves, cfg, from, to) {
  let v = 0; const list = [];
  for (const m of moves) if (m.type === "perda" && inRange(m.at, from, to)) {
    let x = 0; for (const [k, q] of Object.entries(m.items || {})) x += q * insCost(k, cfg);
    v += x; list.push({ ...m, value: x });
  }
  return { value: v, list };
}

/** DRE simples. mode: "parcial" (mês corrente até agora, despesas fixas proporcionais) | "fechado" */
export function dre(state, offset = 0, now = Date.now()) {
  const cfg = state.config; const [a, b] = monthRange(now, offset);
  const end = Math.min(b, now); const partial = end < b;
  const s = summarize(state.orders, cfg, a, end);
  const fixedList = bills(state.finance).filter((x) => isFixed(x) && inRange(x.due, a, b));
  const fixedMonth = fixedList.reduce((t, x) => t + x.amount, 0);
  const frac = partial ? Math.min(1, (now - a) / (b - a)) : 1;
  const fixed = fixedMonth * frac;
  const loss = lossesValue(state.stockMoves, cfg, a, end).value;
  const byCat = {}; for (const x of fixedList) byCat[x.cat] = (byCat[x.cat] || 0) + x.amount * frac;
  const profit = s.sales - s.ifood - s.card - s.cost - loss - fixed;
  const contribution = s.sales - s.ifood - s.card - s.cost - loss;
  const cRate = s.sales ? contribution / s.sales : 0.5;
  const breakEven = cRate > 0 ? fixedMonth / cRate : Infinity;
  const purchases = bills(state.finance).filter((x) => x.cat === "Insumos" && inRange(x.due, a, end)).reduce((t, x) => t + x.amount, 0);
  return { a, b, end, partial, frac, s, sales: s.sales, ifood: s.ifood, card: s.card, cost: s.cost, loss, fixed, fixedMonth, byCat, profit, contribution, cRate, breakEven, purchases,
    cmv: s.cmv, days: daysIn(a, b) };
}

/** Previsão de vendas do resto do mês (média por dia da semana das últimas 4 semanas) */
export function forecastDaily(state, now = Date.now()) {
  const cfg = state.config; const t0 = startOfDay(now); const byWd = Array.from({ length: 7 }, () => []);
  for (let i = 1; i <= 28; i++) {
    const d = t0 - i * DAY; const s = summarize(state.orders, cfg, d, d + DAY);
    if (openOn(d)) byWd[new Date(d).getDay()].push(s.sales);
  }
  return byWd.map((l) => (l.length ? l.reduce((a, b) => a + b, 0) / l.length : 0));
}
export function monthProjection(state, now = Date.now()) {
  const d = dre(state, 0, now); const wd = forecastDaily(state, now);
  let rest = 0; for (let t = startOfDay(now) + DAY; t < d.b; t += DAY) rest += wd[new Date(t).getDay()];
  // hoje: se ainda não terminou o dia, completa até a média do dia
  const todaySales = summarize(state.orders, state.config, startOfDay(now), now).sales;
  rest += Math.max(0, wd[new Date(now).getDay()] - todaySales);
  const sales = d.sales + rest;
  const profit = sales * d.cRate - d.fixedMonth;
  return { sales, profit, rest };
}

/** Consumo de insumos por pedido válido num intervalo */
export function consumption(orders, from, to) {
  const out = {};
  for (const o of orders) if (valid(o) && inRange(o.createdAt, from, to))
    for (const l of o.lines || []) for (const [k, q] of Object.entries(store.consumptionOf(l))) out[k] = (out[k] || 0) + q;
  return out;
}
/** status do estoque */
export function stockStatus(id, qty) {
  const i = insumo(id); if (!i) return "ok";
  if (qty <= 0) return "zerado"; if (qty < i.min * 0.5) return "critico"; if (qty < i.min) return "baixo"; return "ok";
}
export const STOCK_LABEL = { ok: "OK", baixo: "Abaixo do mínimo", critico: "Crítico", zerado: "Zerado" };

/** Lista de compras: consumo médio (14 dias) × dias até a próxima compra (+ mínimo, opcional) − estoque, arredondado no pacote */
export function shoppingList(state, days = 4, safety = true, now = Date.now()) {
  const cons = consumption(state.orders, now - 14 * DAY, now);
  const out = [];
  for (const i of insumos()) {
    const daily = (cons[i.id] || 0) / 14; const stock = Math.max(0, state.stock[i.id] ?? 0);
    const need = daily * days + (safety ? i.min : 0) - stock;
    if (need <= 0 || (daily === 0 && stock >= i.min)) continue;
    if (daily === 0 && !Object.keys(D().products).some((p) => !store.isOff(p) && (D().products[p].recipe?.[i.id] || 0) > 0)) continue; // fora do cardápio
    const pk = packOf(i); const packs = Math.max(1, Math.ceil(need / pk.size));
    out.push({ id: i.id, ins: i, daily, stock, need, packs, pack: pk, qty: packs * pk.size, cost: packs * pk.size * insCost(i.id, state.config), supplier: supplierOf(i.id, state.config) });
  }
  return out;
}
export const SUPPLIERS = {
  "frios": { name: "Frios Planalto", phone: "5561991234501", note: "Distribuidora · entrega ter e sex" },
  "atacadao": { name: "Atacadão Samambaia", phone: "5561991234502", note: "Atacarejo · compra no balcão" },
  "padaria": { name: "Panificadora Pão da Hora", phone: "5561991234503", note: "Entrega diária até 17h" },
  "bebidas": { name: "Distribuidora de Bebidas JK", phone: "5561991234504", note: "Pedido mínimo 3 fardos" },
  "embalagens": { name: "Embalagens DF", phone: "5561991234505", note: "Entrega em 2 dias úteis" },
  "proprio": { name: "Produção própria", phone: "", note: "Feito na cozinha" }
};
const SUP_OF = {
  salsicha: "frios", mussarela: "frios", cheddar: "frios", bacon: "frios", "cheddar-cremoso": "frios", "burger-artesanal": "frios", "smash-80": "frios", "smash-100": "frios",
  "pao-ninho": "padaria", "pao-brioche": "padaria", "pao-burger": "padaria",
  "coca-310": "bebidas", "coca-zero-310": "bebidas", "mineiro-350": "bebidas", "refri-600": "bebidas", "refri-1500": "bebidas", "refri-2000": "bebidas", agua: "bebidas", "agua-gas": "bebidas",
  "emb-dog": "embalagens", "emb-burger": "embalagens", "emb-batata": "embalagens", sacola: "embalagens",
  "maionese-trad": "proprio", "maionese-alho": "proprio", "maionese-ervas": "proprio", frango: "proprio", "suco-500": "proprio", "suco-300": "proprio", pudim: "proprio"
};
export const supplierOf = (id, cfg) => cfg?.supplierOf?.[id] || SUP_OF[id] || "atacadao";

/** Fluxo de caixa diário: entradas (vendas fora do iFood líquidas da maquininha + repasses iFood) e saídas (contas pagas) */
export function cashflow(state, from, to) {
  const cfg = state.config; const days = new Map();
  const day = (t) => { const k = dayKey(t); if (!days.has(k)) days.set(k, { t: startOfDay(t), in: 0, out: 0 }); return days.get(k); };
  for (let t = startOfDay(from); t < to; t += DAY) day(t);
  for (const o of state.orders) if (valid(o) && o.channel !== "ifood" && inRange(o.createdAt, from, to) && o.status === "concluido") { const m = orderMetrics(o, cfg); day(o.createdAt).in += o.total - m.card; }
  for (const r of receivables(state.finance)) if (r.receivedAt && inRange(r.receivedAt, from, to)) day(r.receivedAt).in += r.amount;
  for (const b of bills(state.finance)) if (b.paidAt && inRange(b.paidAt, from, to)) day(b.paidAt).out += b.amount;
  for (const w of state.finance) if (w.kind === "withdraw" && inRange(w.paidAt, from, to)) day(w.paidAt).out += w.amount;
  return [...days.values()].sort((a, b) => a.t - b.t);
}
export function balanceAt(state, t) {
  const start = state.config.demo?.cashStart ?? 0; const from = state.config.demo?.start ?? 0;
  const flow = cashflow(state, from, t); return start + flow.reduce((a, d) => a + d.in - d.out, 0);
}
/** projeção de 30 dias: média de entradas por dia da semana + recebíveis pendentes − contas a pagar − compras de insumo médias */
export function projection(state, now = Date.now(), horizon = 30) {
  const t0 = startOfDay(now); const hist = cashflow(state, t0 - 28 * DAY, t0);
  const byWd = Array.from({ length: 7 }, () => ({ s: 0, n: 0 }));
  for (const d of hist) { const w = byWd[new Date(d.t).getDay()]; w.s += d.in; w.n++; }
  const purchases28 = bills(state.finance).filter((b) => b.cat === "Insumos" && b.paidAt && inRange(b.paidAt, t0 - 28 * DAY, t0)).reduce((a, b) => a + b.amount, 0);
  const withdraw28 = state.finance.filter((w) => w.kind === "withdraw" && inRange(w.paidAt, t0 - 28 * DAY, t0)).reduce((a, w) => a + w.amount, 0);
  const pending = bills(state.finance).filter((b) => !b.paidAt); const recv = receivables(state.finance).filter((r) => !r.receivedAt);
  let bal = balanceAt(state, now); const out = []; let minBal = { v: Infinity, t: 0 };
  for (let i = 0; i < horizon; i++) {
    const t = t0 + i * DAY; const w = byWd[new Date(t).getDay()];
    let inn = (w.n ? w.s / w.n : 0); if (i === 0) inn *= 0.5;
    for (const r of recv) if (inRange(Math.max(r.due, t0), t, t + DAY)) inn += r.amount;
    let outt = purchases28 / 28 + (new Date(t).getDay() === 1 ? withdraw28 / 4 : 0);
    for (const b of pending) if (inRange(Math.max(b.due, t0), t, t + DAY)) outt += b.amount;
    // contas fixas recorrentes do próximo mês ainda não lançadas
    bal += inn - outt; out.push({ t, in: inn, out: outt, bal });
    if (bal < minBal.v) minBal = { v: bal, t };
  }
  return { days: out, minBal, start: balanceAt(state, now) };
}

/** insumo ainda em uso: algum produto ativo usa, ou teve consumo nos últimos 14 dias */
export function inUse(state, id, now = Date.now()) {
  if (Object.keys(D().products).some((p) => !store.isOff(p) && (D().products[p].recipe?.[id] || 0) > 0)) return true;
  return (consumption(state.orders, now - 14 * DAY, now)[id] || 0) > 0;
}
