/* Gerador de dados de demonstração (~45 dias) — determinístico (semente fixa), datas relativas a Date.now().
 * Escreve via store.set (histórico, em lote, por desempenho) e store.placeOrder (pedidos ativos de agora).
 * O estoque final é recomposto por compras plausíveis (terça e sexta), com alguns itens abaixo do mínimo. */
import * as store from "../store.js";
import { DAY, startOfDay } from "./dom.js";
import { insumo, insumos, packOf, supplierOf, SUPPLIERS, applyOverrides } from "./calc.js";

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
let R = rng(1);
const pick = (arr) => arr[Math.floor(R() * arr.length)];
function wpick(pairs) { const tot = pairs.reduce((a, p) => a + p[1], 0); let x = R() * tot; for (const p of pairs) { x -= p[1]; if (x <= 0) return p[0]; } return pairs[pairs.length - 1][0]; }
const gauss = () => (R() + R() + R() - 1.5) / 1.5;

const FIRST = ["Ana Paula", "Bruno", "Carla", "Diego", "Eduarda", "Felipe", "Gabriela", "Henrique", "Isabela", "João Victor", "Kelly", "Leandro", "Mariana", "Natália", "Otávio", "Patrícia", "Rafael", "Sabrina", "Thiago", "Vanessa", "Wellington", "Yasmin", "Marcos", "Juliana", "Rodrigo", "Camila", "Lucas", "Fernanda", "Matheus", "Larissa", "Gustavo", "Aline", "Pedro Henrique", "Jéssica", "Renato", "Bianca", "Cláudio", "Daniela", "Erick", "Luana", "Samuel", "Tatiane", "Wesley", "Priscila"];
const LAST = ["Souza", "Oliveira", "Santos", "Lima", "Pereira", "Ferreira", "Alves", "Rodrigues", "Gomes", "Martins", "Araújo", "Ribeiro", "Carvalho", "Barbosa", "Rocha", "Costa", "Moura", "Nascimento"];
const REFS = ["Ao lado da padaria", "Portão preto", "Casa de esquina", "Em frente à praça", "Perto da igreja", "Sobrado amarelo", "", "", ""];

/* mix de produtos: dog chapa duplo é campeão (e o que mais pesa no CMV) */
const MAIN = [["dog-chapa-duplo", 22], ["dog-molho-simples", 15], ["dog-chapa-simples", 13], ["dog-frango-desfiado", 8], ["dog-molho-duplo", 9], ["dogao-frango-desfiado", 6],
  ["super-dogao-frango-desfiado", 3], ["x-tudo", 6], ["x-bacon", 4], ["x-salada", 3], ["x-burger", 2], ["supremo", 4], ["classico", 3], ["supremo-duplo", 2], ["super-x-tudo", 2],
  ["combo-scooby-snack", 6], ["combo-fred-daphne", 6], ["combo-turma-do-misterio", 3], ["combo-maquina-do-misterio", 1.5], ["batata-refrigerante-310-ml", 2]];
const SIDE = [["batata-frita-p", 5], ["batata-frita-m", 3], ["batata-frita-com-cheddar-bacon-pequena", 4], ["batata-frita-com-cheddar-bacon-media", 2]];
const DRINK = [["coca-cola-310ml", 30], ["refrigerante-600-ml", 10], ["agua-sem-gas", 8], ["agua-com-gas", 2], ["refrigerante-2-litros", 5], ["refrigerante-1-5l", 4], ["suco-natural-de-laranja-500ml", 4], ["coca-zero-310ml", 6], ["mineiro-lata-350ml", 5]];

function makeLine(pid, allowOut) {
  const p = window.DOG.products[pid]; const options = [];
  for (const g of p.groups || []) {
    if (g.id === "bebida") {
      let opt = wpick([[g.options[0], 70], [g.options[1], allowOut ? 18 : 0], [g.options[2], allowOut ? 12 : 0]]);
      options.push({ group: g.id, id: opt.id, name: opt.name, qty: 1, price: opt.price });
    }
    if (g.id === "adicionais" && R() < 0.3) {
      const opt = wpick(g.options.map((o) => [o, { bacon: 5, cheddar: 4, salsicha: 3, mussarela: 3, ovo: 2, frango: 1, "milho-batata": 1, hamburguer: 1, salada: 1 }[o.id] || 1]));
      options.push({ group: g.id, id: opt.id, name: opt.name, qty: R() < 0.15 ? 2 : 1, price: opt.price });
    }
    if (g.id === "retirar" && R() < 0.12) { const opt = pick(g.options); options.push({ group: g.id, id: opt.id, name: opt.name, qty: 1, price: 0 }); }
    if (g.id === "molhos" && R() < 0.1) { const opt = pick(g.options); options.push({ group: g.id, id: opt.id, name: opt.name, qty: 1, price: opt.price }); }
  }
  const qty = R() < 0.1 && !p.combo ? 2 : 1;
  const notes = ["", "", "", "", "", "", "Bem passado", "Pouca maionese", "Capricha no queijo!", "Cortar ao meio"];
  return { productId: pid, name: p.name, qty, unitPrice: store.priceOf(pid), options, note: pick(notes) };
}
function makeLines(allowOut) {
  const lines = [makeLine(wpick(MAIN), allowOut)];
  if (R() < 0.24) lines.push(makeLine(wpick(MAIN), allowOut));
  if (R() < 0.05) lines.push(makeLine(wpick(MAIN), allowOut));
  if (R() < 0.22) lines.push(makeLine(wpick(SIDE), allowOut));
  const hasDrink = lines.some((l) => window.DOG.products[l.productId].combo || l.productId.startsWith("batata-ref"));
  if (!hasDrink && R() < 0.62) {
    let d = wpick(DRINK); if (!allowOut && (d === "coca-zero-310ml" || d === "mineiro-lata-350ml")) d = "coca-cola-310ml";
    const l = makeLine(d, allowOut); l.qty = R() < 0.3 ? 2 : 1; lines.push(l);
  }
  for (const l of lines) l.total = store.lineTotal(l);
  return lines;
}

export function generateDemo() {
  R = rng(20261117);
  const D = window.DOG; const now = Date.now(); const t0 = startOfDay(now);
  const nd = new Date(now); const prevMonth = new Date(nd.getFullYear(), nd.getMonth() - 1, 1).getTime();
  const start = (t0 - prevMonth) / DAY <= 50 ? prevMonth : t0 - 45 * DAY;

  /* config limpa */
  const config = { open: null, pausedUntil: null, prepMin: 30, deliveryMin: 60, off: {}, prices: {}, costs: {}, recipes: {}, zoneFees: {},
    demo: { generatedAt: now, start, cashStart: 4800 },
    team: [
      { name: "Proprietária", role: "dono", phone: "5561998826477" }, { name: "Jaqueline", role: "caixa", phone: "5561992220101" },
      { name: "Seu Raimundo", role: "cozinha", phone: "5561992220102" }, { name: "Wesley", role: "motoboy", phone: "5561992220103" }, { name: "Juninho", role: "motoboy", phone: "5561992220104" }],
    waAuto: { aceito: true, preparo: false, entrega: true, avaliacao: true, resumo: true, robo: true },
    purchaseDays: 4 };
  applyOverrides(config);

  /* clientes recorrentes */
  const near = D.zones.filter((z) => z.fee <= 8 && /^(QN|QR|QS)/.test(z.name));
  const pool = [];
  for (let i = 0; i < 42; i++) {
    const z = pick(near);
    const kind = i < 7 ? "sumido" : i < 13 ? "novo" : i < 26 ? "frequente" : "eventual";
    pool.push({ name: FIRST[i % FIRST.length] + " " + pick(LAST), phone: "5561" + "9" + String(81000000 + Math.floor(R() * 18999999)),
      quadra: z.name, conjunto: String(1 + Math.floor(R() * 18)), casa: String(1 + Math.floor(R() * 40)), ref: pick(REFS),
      kind, w: kind === "frequente" ? 5 : kind === "novo" ? 2.2 : kind === "sumido" ? 3 : 1.2, optIn: R() < 0.74,
      fav: R() < 0.5 ? "whatsapp" : "site", pay: wpick([["pix", 5], ["credito", 2], ["debito", 2], ["dinheiro", 1.5]]),
      from: kind === "novo" ? t0 - Math.floor(5 + R() * 10) * DAY : start, until: kind === "sumido" ? t0 - Math.floor(32 + R() * 8) * DAY : now });
  }

  const casual = Array.from({ length: 95 }, () => { const z = pick(near); return { name: pick(FIRST) + " " + pick(LAST), phone: "5561" + "9" + String(81000000 + Math.floor(R() * 18999999)), quadra: z.name, conjunto: String(1 + Math.floor(R() * 18)), casa: String(1 + Math.floor(R() * 40)) }; });
  /* pedidos do histórico */
  const BASE = { 0: 29, 2: 19, 3: 21, 4: 24, 5: 40, 6: 44 };
  const orders = []; let seq = 2140;
  const slot = (open) => { // minutos desde o início do turno, pico 19h30–21h
    const x = wpick([[0, 6], [1, 16], [2, 22], [3, 18], [4, 12], [5, 8], [6, 5], [7, 3], [8, 2], [9, 1.2]]);
    return open + x * 30 + Math.floor(R() * 30);
  };
  for (let d = start; d < t0 + DAY; d += DAY) {
    const wd = new Date(d).getDay(); const hrs = D.store.hours[String(wd)]; if (!hrs) continue;
    const [oh, om] = hrs[0].split(":").map(Number); const openMin = oh * 60 + om;
    const growth = 1 + ((d - start) / DAY) * 0.004; // site crescendo devagar
    let n = Math.round(BASE[wd] * growth * (1 + gauss() * 0.14));
    const times = Array.from({ length: n }, () => d + Math.min(slot(openMin), 23 * 60 + 25) * 60000 + Math.floor(R() * 60000)).sort((a, b) => a - b);
    for (const at of times) {
      if (at > now - 20 * 60000) continue; // o turno de hoje só até agora
      const siteShare = 0.24 + ((d - start) / DAY) * 0.002;
      const channel = wpick([["site", siteShare], ["whatsapp", 0.27], ["balcao", 0.2], ["ifood", 0.25]]);
      const allowOut = at < t0 - 9 * DAY; // coca zero e mineiro acabaram há ~9 dias
      const lines = makeLines(allowOut);
      let customer = null, address = null, mode = "delivery", payment;
      if (channel === "site" || channel === "whatsapp") {
        const cands = pool.filter((c) => at >= c.from && at <= c.until);
        const c = R() < 0.5 && cands.length ? wpick(cands.map((c) => [c, c.w * (c.fav === channel ? 1.6 : 1)])) : null;
        if (c) { customer = { name: c.name, phone: c.phone }; address = { quadra: c.quadra, conjunto: c.conjunto, casa: c.casa, complemento: "", referencia: c.ref }; payment = { method: c.pay, paid: true }; }
        else { const c2 = pick(casual); customer = { name: c2.name, phone: c2.phone };
          address = { quadra: c2.quadra, conjunto: c2.conjunto, casa: c2.casa, complemento: "", referencia: "" }; }
        if (R() < 0.22) { mode = "pickup"; address = null; }
      } else if (channel === "ifood") {
        const z = pick(D.zones.filter((z) => z.fee <= 10));
        customer = { name: pick(FIRST).split(" ")[0] + " (iFood)", phone: "" }; address = { quadra: z.name, conjunto: String(1 + Math.floor(R() * 18)), casa: String(1 + Math.floor(R() * 40)), complemento: "", referencia: "" };
        payment = { method: "ifood", paid: true };
      } else { mode = R() < 0.55 ? "dinein" : "pickup"; customer = { name: R() < 0.5 ? pick(FIRST) : "Balcão", phone: "" }; }
      payment ||= { method: wpick([["pix", 4.5], ["credito", 2], ["debito", 1.8], ["dinheiro", 1.7]]), paid: true };
      const subtotal = Math.round(lines.reduce((a, l) => a + l.total, 0) * 100) / 100;
      const fee = mode === "delivery" ? (store.feeFor(address?.quadra) ?? 0) : 0;
      const total = Math.round((subtotal + fee) * 100) / 100;
      if (payment.method === "dinheiro") payment.changeFor = Math.ceil(total / 10) * 10 + (R() < 0.5 ? 0 : 10);
      const cancelled = R() < 0.018;
      const hist = cancelled ? [{ status: "novo", at }, { status: "cancelado", at: at + 3 * 60000 }]
        : [{ status: "novo", at }, { status: "preparo", at: at + (1 + R() * 3) * 60000 }, { status: "pronto", at: at + (14 + R() * 12) * 60000 },
          ...(mode === "delivery" ? [{ status: "entrega", at: at + (19 + R() * 12) * 60000 }] : []), { status: "concluido", at: at + (mode === "delivery" ? 38 + R() * 22 : 20 + R() * 8) * 60000 }];
      const o = { id: "DS-" + seq++, createdAt: at, channel, status: cancelled ? "cancelado" : "concluido", history: hist, mode, customer, address,
        table: mode === "dinein" ? String(1 + Math.floor(R() * 6)) : null, lines, subtotal, fee, discount: 0, total, payment, note: "",
        courier: mode === "delivery" && channel !== "ifood" ? (R() < 0.6 ? "Wesley" : "Juninho") : mode === "delivery" ? (R() < 0.6 ? "Wesley" : "Juninho") : null,
        rating: !cancelled && R() < 0.12 ? { stars: wpick([[5, 7], [4, 2.4], [3, 0.6]]), comment: pick(["Melhor dog de Samambaia!", "Chegou quentinho", "Demorou um pouco mas tava top", "Capricharam no queijo", ""]) } : null };
      if (cancelled) o.cancelReason = pick(["Cliente desistiu", "Endereço fora da área", "Item esgotado"]);
      orders.push(o);
    }
  }

  /* pedidos ativos agora (vão por store.placeOrder) */
  const near2 = (q) => D.zones.find((z) => z.name.startsWith(q));
  const L = (pid, opts = [], qty = 1, note = "") => { const p = D.products[pid]; const options = opts.map(([g, id, q = 1]) => { const o = p.groups.find((x) => x.id === g).options.find((x) => x.id === id); return { group: g, id, name: o.name, qty: q, price: o.price }; }); const l = { productId: pid, name: p.name, qty, unitPrice: store.priceOf(pid), options, note }; l.total = store.lineTotal(l); return l; };
  const c1 = pool[14], c2 = pool[20];
  const active = [
    { id: "DS-" + (seq + 3), channel: "site", status: "novo", createdAt: now - 70 * 1000, mode: "delivery", customer: { name: c1.name, phone: c1.phone },
      address: { quadra: c1.quadra, conjunto: c1.conjunto, casa: c1.casa, complemento: "", referencia: c1.ref }, lines: [L("dog-chapa-duplo", [["adicionais", "bacon"]], 2), L("coca-cola-310ml", [], 2)],
      payment: { method: "pix", paid: true }, note: "Interfone com defeito, chamar no WhatsApp" },
    { id: "DS-" + (seq + 2), channel: "ifood", status: "preparo", createdAt: now - 9 * 60000, mode: "delivery", customer: { name: "Lucas (iFood)", phone: "" },
      address: { quadra: near2("QN 314").name, conjunto: "6", casa: "12", complemento: "", referencia: "" }, lines: [L("combo-fred-daphne"), L("batata-frita-com-cheddar-bacon-pequena")], payment: { method: "ifood", paid: true } },
    { id: "DS-" + (seq + 1), channel: "balcao", status: "preparo", createdAt: now - 14 * 60000, mode: "dinein", table: "3", customer: { name: "Mesa 3", phone: "" },
      lines: [L("x-tudo", [["retirar", "cebola-roxa"]]), L("dog-molho-simples", [], 1, "Sem maionese de alho"), L("refrigerante-600-ml")], payment: { method: "debito", paid: false } },
    { id: "DS-" + seq, channel: "whatsapp", status: "entrega", createdAt: now - 33 * 60000, mode: "delivery", customer: { name: c2.name, phone: c2.phone },
      address: { quadra: c2.quadra, conjunto: c2.conjunto, casa: c2.casa, complemento: "", referencia: c2.ref }, lines: [L("dogao-frango-desfiado"), L("dog-chapa-simples"), L("agua-sem-gas")],
      payment: { method: "dinheiro", changeFor: 70, paid: false }, courier: "Wesley" }
  ];
  for (const a of active) {
    const h = [{ status: "novo", at: a.createdAt }];
    if (a.status !== "novo") h.push({ status: "preparo", at: a.createdAt + 90000 });
    if (a.status === "entrega") h.push({ status: "pronto", at: a.createdAt + 19 * 60000 }, { status: "entrega", at: a.createdAt + 23 * 60000 });
    a.history = h;
  }

  /* consumo por dia → compras (ter e sex) para recompor o estoque */
  const all = [...orders.filter((o) => o.status !== "cancelado"), ...active];
  const consAt = []; // [at, {ins:q}]
  for (const o of all) { const c = {}; for (const l of o.lines) for (const [k, q] of Object.entries(store.consumptionOf(l))) c[k] = (c[k] || 0) + q; consAt.push([o.createdAt, c]); }
  const LOSSES = [
    [9, "pao-ninho", 8, "Pão amassou na entrega da padaria"], [16, "alface", 180, "Alface murchou"], [21, "batata-frita", 700, "Pacote descongelou (freezer aberto)"],
    [26, "salsicha", 4, "Pedido refeito (erro na comanda)"], [30, "maionese-trad", 450, "Passou da validade (3 dias)"], [34, "ovo", 4, "Quebrou na bandeja"],
    [38, "tomate", 400, "Tomate passou do ponto"], [41, "pao-brioche", 6, "Pão com mofo"], [44, "bacon", 120, "Queimou na chapa (pico de sexta)"]];
  const losses = LOSSES.map(([dd, id, q, reason]) => ({ at: start + dd * DAY + 15 * 3600000, type: "perda", items: { [id]: q }, reason })).filter((l) => l.at < now);
  const events = [...consAt.map(([at, c]) => ({ at, c })), ...losses.map((l) => ({ at: l.at, c: l.items }))].sort((a, b) => a.at - b.at);

  const pdays = []; for (let d = start; d < now; d += DAY) { const w = new Date(d).getDay(); const t = d + 14.5 * 3600000; if ((w === 2 || w === 5) && t < now) pdays.push(t); }
  const TARGET = { "pao-brioche": 9, bacon: 640, "cheddar-cremoso": 520, "refri-600": 7, "emb-burger": 52, alface: 140, "smash-100": 11, "batata-palha": 0, "coca-zero-310": 0, "mineiro-350": 0 };
  const TREND = { bacon: 0.14, mussarela: 0.07, salsicha: 0.05, "batata-frita": 0.04 };
  const stock = Object.fromEntries(insumos().map((i) => [i.id, i.stock]));
  const avg = Object.fromEntries(insumos().map((i) => [i.id, i.cost]));
  const moves = []; const purchaseBills = [];
  let ei = 0;
  const consumeUntil = (t) => { while (ei < events.length && events[ei].at < t) { for (const [k, q] of Object.entries(events[ei].c)) stock[k] = (stock[k] ?? 0) - q; ei++; } };
  for (let pi = 0; pi < pdays.length; pi++) {
    const pt = pdays[pi]; consumeUntil(pt);
    const next = pdays[pi + 1] ?? now; const last = pi === pdays.length - 1;
    const need = {}; for (const e of events) if (e.at >= pt && e.at < next) for (const [k, q] of Object.entries(e.c)) need[k] = (need[k] || 0) + q;
    const bySup = {};
    for (const i of insumos()) {
      const cur = stock[i.id]; const pk = packOf(i);
      if ((i.id === "coca-zero-310" || i.id === "mineiro-350") && pt > t0 - 12 * DAY) continue; // fornecedor sem estoque
      if (i.id === "batata-palha" && last) continue; // não veio na última compra
      if (["suco-300", "pudim"].includes(i.id)) continue;
      const prevLast = pi === pdays.length - 2;
      const needNext = prevLast ? events.filter((e) => e.at >= next && e.at < now).reduce((a, e) => a + (e.c[i.id] || 0), 0) : 0;
      let desired = TARGET[i.id] != null && (last || prevLast) ? TARGET[i.id] + needNext : i.min * (1.25 + R() * 0.5);
      if (prevLast && TARGET[i.id] === 0) desired = needNext * 0.6;
      const want = (need[i.id] || 0) + desired - cur; if (want <= 0) continue;
      let packs = Math.ceil(want / pk.size);
      if ((last || prevLast) && TARGET[i.id] != null) { // termina perto do alvo (abaixo do mínimo), sem zerar
        packs = Math.max(0, Math.round(want / pk.size));
        if (cur + packs * pk.size - (need[i.id] || 0) - needNext < TARGET[i.id] * 0.3 && TARGET[i.id] > 0) packs++;
      }
      if (!packs) continue;
      const qty = packs * pk.size;
      const prog = (pt - start) / (now - start);
      const unit = Math.round(i.cost * (1 + (TREND[i.id] || 0) * (prog - 0.5) * 2) * (1 + gauss() * 0.03) * 100000) / 100000;
      avg[i.id] = cur > 0 ? (cur * avg[i.id] + qty * unit) / (cur + qty) : unit;
      stock[i.id] = cur + qty;
      const sup = supplierOf(i.id);
      moves.push({ at: pt + Math.floor(R() * 40) * 60000, type: pk.own ? "producao" : "entrada", items: { [i.id]: qty }, insumo: i.id, qty, unitCost: unit, total: Math.round(qty * unit * 100) / 100, supplier: SUPPLIERS[sup].name });
      (bySup[sup] ||= []).push(qty * unit);
    }
    for (const [sup, vals] of Object.entries(bySup)) {
      const amount = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100; const boleto = sup === "frios" && R() < 0.5;
      purchaseBills.push({ kind: "bill", id: "cp-" + pt + sup, desc: (sup === "proprio" ? "Produção (insumos crus)" : "Compra · " + SUPPLIERS[sup].name), cat: "Insumos", amount,
        due: boleto ? pt + 14 * DAY : pt, paidAt: boleto ? (pt + 14 * DAY < now ? pt + 14 * DAY : null) : pt, supplier: SUPPLIERS[sup].name, method: boleto ? "Boleto 14 dias" : "Pix", recurring: null });
    }
  }
  consumeUntil(now + DAY);
  const finalStock = {};
  for (const i of insumos()) {
    let q = Math.round(stock[i.id] * 100) / 100;
    if (q < 0 || TARGET[i.id] === 0) { if (q !== 0) moves.push({ at: now - 2 * 3600000, type: "ajuste", items: { [i.id]: -q }, reason: "Contagem: acabou durante o serviço" }); q = 0; }
    finalStock[i.id] = q;
  }
  for (const l of losses) moves.push(l);
  // baixas por venda dos últimos dias (o histórico de movimentos guarda as 500 mais recentes)
  for (const o of orders) if (o.status !== "cancelado" && o.createdAt > now - 6 * DAY) {
    const c = {}; for (const l of o.lines) for (const [k, q] of Object.entries(store.consumptionOf(l))) c[k] = (c[k] || 0) + q;
    moves.push({ at: o.createdAt, type: "venda", ref: o.id, items: c });
  }
  moves.sort((a, b) => b.at - a.at);
  config.costs = Object.fromEntries(Object.entries(avg).map(([k, v]) => [k, Math.round(v * 100000) / 100000]));

  /* contas fixas (mês passado, atual e próximo) */
  const fin = [...purchaseBills];
  const FIXED = [
    ["Aluguel do ponto", "Aluguel", 1800, 5], ["Funcionária (Jaqueline) — salário", "Equipe", 1650, 5], ["Energia — Neoenergia", "Energia", 640, 12], ["Água — Caesb", "Água", 96, 15],
    ["Internet fibra 300 MB", "Internet", 109.9, 10], ["DAS MEI", "Impostos", 81.9, 20], ["Gás — 2 botijões P13", "Gás", 250, 8], ["Mensalidade iFood (Plano Básico)", "iFood", 110, 18],
    ["Embalagens (sacolas, guardanapos, sachês)", "Embalagens", 360, 3], ["Contabilidade / app maquininha", "Serviços", 89.9, 25]];
  const nm = (k) => new Date(nd.getFullYear(), nd.getMonth() + k, 1);
  for (let k = -1; k <= 1; k++) {
    const m = nm(k);
    for (const [desc, cat, amount, day] of FIXED) {
      const due = new Date(m.getFullYear(), m.getMonth(), day, 12).getTime(); if (due < start) continue;
      let paidAt = due < now ? due - Math.floor(R() * 2) * DAY : null;
      if (cat === "Energia" && k === 0) paidAt = null; // energia deste mês vencida: alerta
      const amt = cat === "Energia" ? Math.round(amount * (0.92 + R() * 0.16) * 100) / 100 : cat === "Gás" ? amount : amount;
      fin.push({ kind: "bill", id: "fx-" + k + cat, desc, cat, amount: amt, due, paidAt, recurring: "mensal", method: cat === "Aluguel" ? "Pix" : "Boleto" });
    }
  }
  // motoboys: diárias pagas toda segunda (R$ 65/noite cada dia aberto + R$ 2 por entrega)
  for (let d = start; d < t0 + 35 * DAY; d += DAY) {
    if (new Date(d).getDay() !== 1) continue;
    const from = d - 7 * DAY; const deliveries = orders.filter((o) => o.mode === "delivery" && o.channel !== "ifood" && o.createdAt >= from && o.createdAt < d).length + orders.filter((o) => o.channel === "ifood" && o.createdAt >= from && o.createdAt < d).length;
    const amount = d > now ? 6 * 65 + 120 : 6 * 65 + deliveries * 2;
    fin.push({ kind: "bill", id: "mb-" + d, desc: "Motoboys — diárias da semana (Wesley e Juninho)", cat: "Motoboy", amount, due: d + 10 * 3600000, paidAt: d < now - DAY ? d + 11 * 3600000 : null, recurring: "semanal", method: "Pix" });
  }
  // retirada semanal da dona (pró-labore): sai do caixa, mas não é despesa da loja
  for (let d = start; d < now - DAY; d += DAY) if (new Date(d).getDay() === 1) fin.push({ kind: "withdraw", id: "rt-" + d, desc: "Retirada da dona (pró-labore)", amount: 1500, paidAt: d + 15 * 3600000 });
  // repasses do iFood (quarta, referente à semana anterior)
  for (let d = start; d < t0 + 10 * DAY; d += DAY) {
    if (new Date(d).getDay() !== 3) continue;
    const from = d - 10 * DAY, to = d - 3 * DAY;
    const sum = orders.filter((o) => o.channel === "ifood" && o.status !== "cancelado" && o.createdAt >= from && o.createdAt < to).reduce((a, o) => a + o.total * (1 - 0.152), 0);
    if (sum <= 0) continue;
    fin.push({ kind: "receivable", id: "if-" + d, desc: "Repasse iFood (" + new Date(from).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + " a " + new Date(to - DAY).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }) + ")", amount: Math.round(sum * 100) / 100, due: d + 12 * 3600000, receivedAt: d + 12 * 3600000 < now ? d + 12 * 3600000 : null, source: "iFood" });
  }
  const fiado = { kind: "receivable", id: "fiado-1", desc: "Fiado — Sr. Antônio (QN 310, vizinho)", amount: 46, due: t0 + 3 * DAY, receivedAt: null, source: "Cliente" };
  fin.push(fiado);

  /* sessões de caixa (últimos 12 dias abertos + hoje) */
  const sessions = [];
  for (let d = t0 - 13 * DAY; d <= t0; d += DAY) {
    if (!D.store.hours[String(new Date(d).getDay())]) continue;
    const openAt = d === t0 ? Math.min(d + 18 * 3600000, now - 40 * 60000) : d + 18 * 3600000;
    const closeAt = d + 23 * 3600000 + 52 * 60000;
    const os = orders.filter((o) => o.status === "concluido" && o.channel !== "ifood" && o.createdAt >= openAt && o.createdAt < closeAt);
    const exp = { pix: 0, dinheiro: 0, credito: 0, debito: 0 };
    for (const o of os) exp[o.payment.method] = (exp[o.payment.method] || 0) + o.total;
    const mv = [];
    if (d !== t0 && exp.dinheiro > 250) mv.push({ type: "sangria", amount: Math.floor(exp.dinheiro * 0.6 / 50) * 50, at: d + 21.5 * 3600000, note: "Sangria para o cofre" });
    if (d !== t0 && R() < 0.2) mv.push({ type: "suprimento", amount: 50, at: d + 19 * 3600000, note: "Troco extra (notas de R$ 5)" });
    const diff = d === t0 - 4 * DAY ? -18 : Math.round(gauss() * 3);
    const s = { kind: "cash", id: "cx-" + d, openedAt: openAt, openAmount: 150, openedBy: "Jaqueline", moves: mv };
    if (d !== t0) Object.assign(s, { closedAt: closeAt, closedBy: "Jaqueline", counted: { ...exp, dinheiro: Math.max(0, 150 + exp.dinheiro - mv.filter((m) => m.type === "sangria").reduce((a, m) => a + m.amount, 0) + mv.filter((m) => m.type === "suprimento").reduce((a, m) => a + m.amount, 0) + diff) }, note: diff <= -10 ? "Faltou dinheiro — conferir troco do motoboy" : "" });
    if (d === t0 && now < openAt) continue;
    sessions.push(s);
  }
  fin.push(...sessions);

  /* clientes */
  const customers = {};
  for (const o of [...orders].sort((a, b) => a.createdAt - b.createdAt)) {
    if (!o.customer?.phone) continue; const k = o.customer.phone.replace(/\D/g, ""); const c = pool.find((p) => p.phone === k);
    const prev = customers[k] || { name: o.customer.name, phone: k, orders: 0, spent: 0, first: o.createdAt, optIn: c ? c.optIn : R() < 0.5, quadra: o.address?.quadra || c?.quadra || "" };
    customers[k] = { ...prev, orders: prev.orders + (o.status === "cancelado" ? 0 : 1), spent: Math.round((prev.spent + (o.status === "cancelado" ? 0 : o.total)) * 100) / 100, last: o.createdAt, channel: o.channel };
  }

  /* conversas de WhatsApp */
  const m = (min) => now - min * 60000;
  const ca = pool[3], cb = pool[16], cc = c2, cd = pool[22];
  const wa = [
    { id: "w1", phone: cc.phone, name: cc.name, unread: 1, msgs: [
      { from: "cliente", text: "Boa noite! Cadê meu pedido? Já tem meia hora 😅", at: m(4) },
      { from: "robo", text: `Oi, ${cc.name.split(" ")[0]}! Seu pedido ${active[3].id} saiu para entrega às ${new Date(active[3].history[3].at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} com o Wesley. Deve chegar em uns 10 minutinhos.`, at: m(4) + 4000 }] },
    { id: "w2", phone: ca.phone, name: ca.name, unread: 0, msgs: [
      { from: "cliente", text: "Oi, vcs estão abertos hoje?", at: m(42) },
      { from: "robo", text: "Oi! Hoje abrimos às 18h30 e vamos até 23h30. Já dá pra fazer o pedido pelo nosso site: dogdosalsicha.com.br — é mais rápido e sem taxa de app.", at: m(42) + 3000 },
      { from: "cliente", text: "Me manda o cardápio", at: m(40) },
      { from: "robo", text: "Aqui está o cardápio completo com fotos e preços: dogdosalsicha.com.br/#cardapio · Os mais pedidos são o Dog Chapa duplo (R$ 20) e o Combo Fred & Daphne (R$ 47, 2 dogs + refri 600 ml).", at: m(40) + 3000 }] },
    { id: "w3", phone: cb.phone, name: cb.name, unread: 1, msgs: [
      { from: "cliente", text: "Qual a taxa de entrega pra " + cb.quadra + "?", at: m(17) },
      { from: "robo", text: `Para ${cb.quadra} a taxa é ${store.money(store.feeFor(cb.quadra) ?? 6)} e o tempo médio é de 60 min. Pedido mínimo R$ 17.`, at: m(17) + 3000 },
      { from: "cliente", text: "Aceita cartão na entrega?", at: m(15) },
      { from: "robo", text: "Aceita sim! Pix, dinheiro (com troco), crédito e débito na maquininha do motoboy.", at: m(15) + 3000 }] },
    { id: "w4", phone: cd.phone, name: cd.name, unread: 0, msgs: [
      { from: "loja", text: `Oi, ${cd.name.split(" ")[0]}! Seu pedido foi entregue. Que nota de 1 a 5 você dá pro nosso dog? ⭐`, at: m(60 * 24 + 30) },
      { from: "cliente", text: "5! Chegou quentinho, parabéns", at: m(60 * 24 + 12) },
      { from: "robo", text: "Muito obrigado! 🧡 Você ganhou 210 pontos no fidelidade. Com 500 pontos a entrega é grátis.", at: m(60 * 24 + 12) + 3000 }] },
    { id: "w5", phone: "5561993330909", name: "Fornecedor — Frios Planalto", unread: 0, msgs: [
      { from: "loja", text: "Bom dia! Pode mandar 2 pacotes de salsicha e 3 kg de muçarela pra sexta?", at: m(60 * 26) },
      { from: "cliente", text: "Bom dia, confirmado. Muçarela subiu um pouco essa semana, R$ 43,90 o kg.", at: m(60 * 25) }] }
  ];

  /* grava */
  orders.sort((a, b) => b.createdAt - a.createdAt);
  store.set("config", config);
  store.set("orders", orders);
  store.set("customers", customers);
  store.set("finance", fin);
  store.set("wa", wa);
  store.set("stockMoves", moves.slice(0, 470));
  store.set("stock", finalStock);
  for (const a of active.reverse()) store.placeOrder(a);
  store.set("stock", finalStock); // placeOrder deu baixa dos ativos; o estoque final já considera esse consumo
  return { orders: orders.length + active.length };
}

export function resetAll() {
  for (const k of ["orders", "stockMoves", "finance", "wa", "customers"]) store.set(k, []);
  store.set("customers", {});
  store.set("stock", Object.fromEntries(insumos().map((i) => [i.id, i.stock])));
  store.set("config", { open: null, pausedUntil: null, prepMin: 30, deliveryMin: 60, off: {}, prices: {}, demo: { empty: true, start: Date.now(), cashStart: 0 } });
}
export { insumo };
