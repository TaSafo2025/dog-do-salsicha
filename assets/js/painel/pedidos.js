/* Pedidos — kanban ao vivo, detalhe, aceitar/recusar, despachar, comanda 80 mm e PDV de balcão */
import * as store from "../store.js";
import { h, icon, clear, BRL, fmtTime, fmtDT, phoneFmt, norm, startOfDay, DAY, mmss } from "./dom.js";
import { CHANNELS, STATUS, MODES, PAY, orderMetrics, payMethod, summarize } from "./calc.js";
import { modal, btn, toast, pill, chip, field, input, select, seg, iconBtn, empty } from "./ui.js";

const ACTIVE = ["novo", "aceito", "preparo", "pronto", "entrega"];
const COLS = [
  { id: "novo", label: "Novos", st: ["novo"], tone: "novo", hint: "Aceite ou recuse" },
  { id: "preparo", label: "Em preparo", st: ["aceito", "preparo"], tone: "preparo", hint: "Na chapa" },
  { id: "entrega", label: "Prontos / Em entrega", st: ["pronto", "entrega"], tone: "entrega", hint: "Despachar ou entregar" },
  { id: "concluido", label: "Concluídos hoje", st: ["concluido", "cancelado"], tone: "concluido", hint: "Últimos do dia" }
];
const ui = { channel: "todos", q: "" };

export function itemsText(l) {
  const add = (l.options || []).filter((o) => o.group !== "retirar").map((o) => (o.qty > 1 ? o.qty + "× " : "") + o.name.replace(/ \(copinho\)/, ""));
  const rem = (l.options || []).filter((o) => o.group === "retirar").map((o) => o.name);
  return { add, rem };
}
export const chanBadge = (c) => h("span", { class: "chan chan-" + c }, CHANNELS[c]?.short || c);
export const modeText = (o) => o.mode === "delivery" ? (o.address?.quadra || "Entrega").replace(/ Samambaia (Sul|Norte)/, "") : o.mode === "dinein" ? "Mesa " + (o.table || "—") : "Retirada";

/* mensagens automáticas simuladas no WhatsApp */
export function notifyWA(o, kind) {
  const cfg = store.get("config"); if (!o.customer?.phone || !cfg.waAuto?.[kind]) return;
  const first = (o.customer.name || "").split(" ")[0];
  const text = { aceito: `Oi, ${first}! Recebemos seu pedido ${o.id} e ele já foi para a chapa. Previsão: ${cfg.deliveryMin || 60} min.`,
    entrega: `${first}, seu pedido ${o.id} saiu para entrega com o ${o.courier || "motoboy"}! 🛵`,
    avaliacao: `Pedido ${o.id} entregue! De 0 a 5, quanto você dá pro nosso dog? Sua opinião ajuda muito 🧡` }[kind];
  if (!text) return;
  store.update("wa", (list) => {
    const arr = Array.isArray(list) ? [...list] : []; const k = o.customer.phone.replace(/\D/g, "");
    const i = arr.findIndex((c) => c.phone === k && Array.isArray(c.msgs)); const msg = { from: "robo", text, at: Date.now(), auto: kind };
    if (i >= 0) arr[i] = { ...arr[i], msgs: [...arr[i].msgs, msg] }; else arr.unshift({ id: "w" + Date.now(), phone: k, name: o.customer.name, unread: 0, msgs: [msg] });
    return arr;
  });
}
function returnStock(o) {
  const cons = {}; for (const l of o.lines || []) for (const [k, q] of Object.entries(store.consumptionOf(l))) cons[k] = (cons[k] || 0) + q;
  store.update("stock", (s) => { const n = { ...s }; for (const [k, q] of Object.entries(cons)) n[k] = Math.round(((n[k] ?? 0) + q) * 100) / 100; return n; });
  store.update("stockMoves", (m) => [{ at: Date.now(), type: "estorno", ref: o.id, items: cons, reason: "Pedido recusado — insumos voltaram ao estoque" }, ...m].slice(0, 500));
}

/* ---------- ações ---------- */
export function accept(o) { store.setStatus(o.id, "preparo"); notifyWA(o, "aceito"); toast(`Pedido ${o.id} aceito — foi para a cozinha.`); }
export function ready(o) { store.setStatus(o.id, "pronto"); toast(`${o.id} pronto!`); }
export function finish(o) { store.setStatus(o.id, "concluido"); if (o.mode === "delivery") notifyWA(o, "avaliacao"); toast(`${o.id} concluído.`); }
export function refuse(o) {
  let reason = "Item esgotado"; const other = input({ placeholder: "Escreva o motivo", "aria-label": "Outro motivo" });
  const reasons = ["Item esgotado", "Fora da área de entrega", "Loja muito cheia agora", "Endereço incompleto", "Pedido em duplicidade", "Outro"];
  const list = h("div", { class: "radios" }, reasons.map((r, i) => h("label", { class: "radio" }, h("input", { type: "radio", name: "rr", value: r, checked: i === 0, onchange: () => { reason = r; other.hidden = r !== "Outro"; } }), h("span", {}, r))));
  other.hidden = true;
  modal({ title: `Recusar ${o.id}?`, sub: "O cliente recebe o motivo e os insumos voltam para o estoque.", size: "sm", body: h("div", { class: "stack" }, list, other),
    actions: [{ label: "Voltar", onclick: (c) => c() }, { label: "Recusar pedido", kind: "danger", icon: "x", onclick: (c) => {
      const r = reason === "Outro" ? other.value.trim() || "Outro" : reason; store.setStatus(o.id, "cancelado", { cancelReason: r }); c(); toast(`${o.id} recusado: ${r}`, { kind: "warn" }); } }] });
}
export function dispatch(o) {
  const cfg = store.get("config"); const boys = (cfg.team || []).filter((t) => t.role === "motoboy").map((t) => t.name); if (!boys.length) boys.push("Motoboy");
  let who = boys[0];
  const g = h("div", { class: "pick-list" }, boys.map((b, i) => h("label", { class: "pick" }, h("input", { type: "radio", name: "mb", checked: i === 0, onchange: () => { who = b; } }), icon("bike", 22), h("span", {}, h("strong", {}, b), h("small", {}, ["Na rua: ", String(store.get("orders").filter((x) => x.status === "entrega" && x.courier === b).length), " entregas"])))));
  modal({ title: `Despachar ${o.id}`, sub: `${o.address?.quadra || ""} · conj. ${o.address?.conjunto || "—"} casa ${o.address?.casa || "—"}`, size: "sm",
    body: h("div", { class: "stack" }, g, o.payment?.method === "dinheiro" ? h("p", { class: "note warn" }, icon("cash", 16), ` Levar troco para ${BRL(o.payment.changeFor || o.total)} (troco de ${BRL((o.payment.changeFor || o.total) - o.total)})`) : null),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Saiu para entrega", kind: "primary", icon: "bike", onclick: (c) => {
      store.setStatus(o.id, "entrega", { courier: who }); notifyWA({ ...o, courier: who }, "entrega"); c(); toast(`${o.id} saiu com ${who}.`); } }] });
}
function nextActions(o, small) {
  const sz = small ? "sm" : null; const out = [];
  if (o.status === "novo") out.push(btn("Aceitar", { kind: "primary", icon: "check", size: sz, onclick: (e) => { e.stopPropagation(); accept(o); } }), btn("Recusar", { kind: "danger-ghost", size: sz, onclick: (e) => { e.stopPropagation(); refuse(o); } }));
  else if (o.status === "aceito" || o.status === "preparo") out.push(btn("Pronto", { kind: "ok", icon: "check", size: sz, onclick: (e) => { e.stopPropagation(); ready(o); } }));
  else if (o.status === "pronto") out.push(o.mode === "delivery" ? btn("Despachar", { kind: "primary", icon: "bike", size: sz, onclick: (e) => { e.stopPropagation(); dispatch(o); } }) : btn("Entregue ao cliente", { kind: "ok", icon: "check", size: sz, onclick: (e) => { e.stopPropagation(); finish(o); } }));
  else if (o.status === "entrega") out.push(btn("Entregue", { kind: "ok", icon: "check", size: sz, onclick: (e) => { e.stopPropagation(); finish(o); } }));
  return out;
}

/* ---------- cartão do kanban ---------- */
function orderCard(ctx, o) {
  const late = o.status !== "concluido" && o.status !== "cancelado";
  const nItems = o.lines.reduce((a, l) => a + l.qty, 0);
  return h("article", { class: "oc oc-" + o.status, tabindex: 0, role: "button", "aria-label": `Pedido ${o.id}, ${STATUS[o.status]}`, onclick: () => openOrder(ctx, o.id), onkeydown: (e) => { if (e.key === "Enter") openOrder(ctx, o.id); } },
    h("header", { class: "oc-h" }, h("strong", { class: "oc-id" }, o.id), chanBadge(o.channel),
      late ? h("span", { class: "oc-t mono", dataset: { since: o.createdAt, warn: o.status === "novo" ? 3 : 25, bad: o.status === "novo" ? 6 : 45 } }, "") : h("span", { class: "oc-t muted" }, fmtTime(o.createdAt))),
    h("div", { class: "oc-c" }, h("span", { class: "oc-name" }, o.customer?.name || "Cliente"), h("span", { class: "oc-mode" }, icon(o.mode === "delivery" ? "bike" : o.mode === "dinein" ? "store" : "package", 14), modeText(o))),
    h("ul", { class: "oc-items" }, o.lines.slice(0, 4).map((l) => { const t = itemsText(l); return h("li", {}, h("b", {}, l.qty + "×"), " ", l.name, t.add.length ? h("span", { class: "oc-add" }, " + " + t.add.join(", ")) : null, t.rem.length ? h("span", { class: "oc-rem" }, " · " + t.rem.join(", ")) : null); }),
      o.lines.length > 4 ? h("li", { class: "muted" }, `+ ${o.lines.length - 4} itens`) : null),
    o.status === "cancelado" ? h("p", { class: "oc-cancel" }, "Recusado: " + (o.cancelReason || "—")) : null,
    h("footer", { class: "oc-f" }, h("span", { class: "oc-total" }, BRL(o.total)), h("span", { class: "oc-pay" }, PAY[payMethod(o)] + (o.payment?.paid === false ? " · cobrar" : "")),
      o.courier && o.status === "entrega" ? h("span", { class: "oc-cour" }, icon("bike", 14), o.courier) : null),
    late ? h("div", { class: "oc-act" }, nextActions(o, true), iconBtn("printer", "Imprimir comanda", (e) => { e.stopPropagation(); printOrder(o); }, "sm")) : null);
}

export default {
  id: "pedidos", deps: ["orders", "config"],
  render(ctx) {
    const { state } = ctx; const t0 = startOfDay(Date.now());
    let list = state.orders.filter((o) => ACTIVE.includes(o.status) || o.createdAt >= t0 || (o.history?.at?.(-1)?.at || 0) >= t0);
    if (ui.channel !== "todos") list = list.filter((o) => o.channel === ui.channel);
    if (ui.q) { const q = norm(ui.q); list = list.filter((o) => norm(o.id + " " + (o.customer?.name || "") + " " + (o.address?.quadra || "")).includes(q)); }
    const todayS = summarize(state.orders, state.config, t0, t0 + DAY);
    const done = state.orders.filter((o) => o.status === "concluido" && o.createdAt >= t0 - 7 * DAY);
    const prepT = done.map((o) => { const a = o.history?.find((x) => x.status === "preparo")?.at, b = o.history?.find((x) => x.status === "pronto")?.at; return a && b ? b - a : null; }).filter(Boolean);
    const avgPrep = prepT.length ? prepT.reduce((a, b) => a + b, 0) / prepT.length : 0;

    const head = h("div", { class: "toolbar" },
      h("div", { class: "tb-stats" },
        h("div", { class: "tbs" }, h("span", {}, "Hoje"), h("strong", {}, BRL(todayS.sales))), h("div", { class: "tbs" }, h("span", {}, "Pedidos"), h("strong", {}, String(todayS.count))),
        h("div", { class: "tbs" }, h("span", {}, "Ticket médio"), h("strong", {}, BRL(todayS.ticket))), h("div", { class: "tbs" }, h("span", {}, "Preparo médio (7 dias)"), h("strong", {}, Math.round(avgPrep / 60000) + " min"))),
      h("div", { class: "tb-f" },
        h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar pedido, cliente, quadra", value: ui.q, dataset: { fk: "pq" }, "aria-label": "Buscar pedido", oninput: (e) => { ui.q = e.target.value; ctx.rerender(); } })),
        seg([["todos", "Todos"], ...Object.entries(CHANNELS).filter(([k]) => k !== "mesa").map(([k, v]) => [k, v.short])], ui.channel, (v) => { ui.channel = v; ctx.rerender(); }, "seg-sm"),
        btn("Pedido de balcão", { kind: "primary", icon: "plus", onclick: () => newOrderPDV(ctx) })));

    const board = h("div", { class: "kanban" }, COLS.map((c) => {
      let items = list.filter((o) => c.st.includes(o.status));
      if (c.id === "concluido") items = items.filter((o) => o.createdAt >= t0).slice(0, 14); else items.sort((a, b) => a.createdAt - b.createdAt);
      return h("section", { class: "col col-" + c.tone, "aria-label": c.label },
        h("header", { class: "col-h" }, h("span", { class: "col-dot" }), h("h3", {}, c.label), h("span", { class: "col-n" }, String(items.length)), h("span", { class: "col-hint" }, c.hint)),
        h("div", { class: "col-b" }, items.length ? items.map((o) => orderCard(ctx, o)) : h("p", { class: "col-empty" }, c.id === "novo" ? "Nenhum pedido esperando. Quando chegar, toca a campainha." : "—")));
    }));
    return h("div", {}, head, board);
  }
};

/* ---------- detalhe (gaveta lateral, atualiza ao vivo) ---------- */
export function openOrder(ctx, id) {
  let m; let unwatch;
  const build = () => {
    const o = store.get("orders").find((x) => x.id === id); if (!o) return h("p", {}, "Pedido não encontrado.");
    const cfg = store.get("config"); const mt = orderMetrics(o, cfg);
    const hist = (o.history || []).map((x) => h("li", { class: "tl-i st-" + x.status }, h("span", { class: "tl-dot" }), h("span", {}, STATUS[x.status] || x.status), h("span", { class: "muted mono" }, fmtTime(x.at))));
    const lines = o.lines.map((l) => { const t = itemsText(l); return h("li", { class: "dl" }, h("span", { class: "dl-q" }, l.qty + "×"), h("div", { class: "dl-b" }, h("strong", {}, l.name),
      t.add.length ? h("span", { class: "dl-add" }, "+ " + t.add.join(", ")) : null, t.rem.length ? h("span", { class: "dl-rem" }, t.rem.join(", ")) : null, l.note ? h("span", { class: "dl-note" }, "“" + l.note + "”") : null),
      h("span", { class: "money" }, BRL(l.total ?? store.lineTotal(l)))); });
    const addr = o.address ? [o.address.quadra, o.address.conjunto && "Conj. " + o.address.conjunto, o.address.casa && "Casa " + o.address.casa, o.address.complemento].filter(Boolean).join(" · ") : null;
    const left = o.total - mt.cost - mt.fees;
    return h("div", { class: "od" },
      h("div", { class: "od-top" }, chanBadge(o.channel), pill(STATUS[o.status], "st-" + o.status), h("span", { class: "muted" }, fmtDT(o.createdAt)),
        ACTIVE.includes(o.status) ? h("span", { class: "mono od-since", dataset: { since: o.createdAt } }, mmss(Date.now() - o.createdAt)) : null),
      h("section", { class: "od-s" }, h("h4", {}, "Cliente"), h("p", { class: "od-name" }, o.customer?.name || "—"),
        o.customer?.phone ? h("p", {}, h("a", { href: "https://wa.me/" + o.customer.phone.replace(/\D/g, "").replace(/^(?!55)/, "55"), target: "_blank", rel: "noopener", class: "link" }, icon("chat", 16), " ", phoneFmt(o.customer.phone))) : null,
        h("p", {}, icon(o.mode === "delivery" ? "bike" : "store", 16), " ", MODES[o.mode] || o.mode, addr ? " — " + addr : o.table ? " — mesa " + o.table : ""),
        o.address?.referencia ? h("p", { class: "muted" }, "Referência: " + o.address.referencia) : null,
        o.note ? h("p", { class: "od-obs" }, icon("info", 16), " " + o.note) : null),
      h("section", { class: "od-s" }, h("h4", {}, "Itens"), h("ul", { class: "dls" }, lines),
        h("dl", { class: "tot" }, h("dt", {}, "Subtotal"), h("dd", {}, BRL(o.subtotal)), h("dt", {}, "Taxa de entrega"), h("dd", {}, BRL(o.fee)),
          o.discount ? [h("dt", {}, "Desconto"), h("dd", {}, "− " + BRL(o.discount))] : null, h("dt", { class: "big" }, "Total"), h("dd", { class: "big" }, BRL(o.total))),
        h("p", { class: "od-pay" }, icon(payMethod(o) === "dinheiro" ? "cash" : payMethod(o) === "pix" ? "pix" : "card", 16), " ", PAY[payMethod(o)],
          o.payment?.changeFor ? ` · troco para ${BRL(o.payment.changeFor)} (levar ${BRL(o.payment.changeFor - o.total)})` : "", o.payment?.paid === false ? " · a cobrar" : " · pago")),
      h("section", { class: "od-s od-owner" }, h("h4", {}, icon("lock", 14), " Só para o dono: quanto sobra deste pedido"),
        h("div", { class: "od-split" },
          h("div", {}, h("span", {}, "Ingredientes"), h("strong", {}, BRL(mt.cost))), h("div", {}, h("span", {}, o.channel === "ifood" ? "Taxa iFood" : "Maquininha"), h("strong", {}, BRL(mt.fees))),
          h("div", { class: left > 0 ? "ok" : "bad" }, h("span", {}, "Sobra"), h("strong", {}, BRL(left))))),
      h("section", { class: "od-s" }, h("h4", {}, "Linha do tempo"), h("ol", { class: "tl" }, hist), o.cancelReason ? h("p", { class: "oc-cancel" }, "Motivo: " + o.cancelReason) : null, o.courier ? h("p", { class: "muted" }, "Motoboy: " + o.courier) : null,
        o.rating ? h("p", { class: "od-rate" }, "★".repeat(o.rating.stars) + "☆".repeat(5 - o.rating.stars), " ", o.rating.comment || "") : null));
  };
  const o0 = store.get("orders").find((x) => x.id === id); if (!o0) return;
  const foot = h("div", { class: "od-foot" });
  const refreshFoot = () => { const o = store.get("orders").find((x) => x.id === id); clear(foot); if (!o) return; foot.append(btn("Imprimir comanda", { icon: "printer", onclick: () => printOrder(o) }), ...nextActions(o)); };
  m = modal({ title: "Pedido " + id, side: true, size: "lg", body: build(), actions: [foot], onClose: () => unwatch?.() });
  refreshFoot();
  unwatch = store.watch("orders", () => { m.setBody(build()); refreshFoot(); });
}

/* ---------- comanda 80 mm ---------- */
export function printOrder(o) {
  const area = document.getElementById("print-area"); clear(area);
  const D = window.DOG.store; const line = () => h("div", { class: "pr-hr" });
  area.append(h("div", { class: "pr" },
    h("div", { class: "pr-c" }, h("strong", { class: "pr-brand" }, "DOG DO SALSICHA"), h("div", {}, "O melhor dog da Cidade!"), h("div", {}, D.phoneLabel)), line(),
    h("div", { class: "pr-big" }, o.id), h("div", { class: "pr-row" }, h("span", {}, (CHANNELS[o.channel]?.label || o.channel).toUpperCase()), h("span", {}, fmtDT(o.createdAt))),
    h("div", { class: "pr-mode" }, (MODES[o.mode] || "").toUpperCase() + (o.mode === "dinein" ? " · MESA " + (o.table || "") : "")), line(),
    o.lines.map((l) => { const t = itemsText(l); return h("div", { class: "pr-item" }, h("div", { class: "pr-row" }, h("strong", {}, `${l.qty}x ${l.name}`), h("span", {}, BRL(l.total ?? store.lineTotal(l)))),
      t.add.map((a) => h("div", { class: "pr-sub" }, "+ " + a)), t.rem.map((a) => h("div", { class: "pr-sub pr-rem" }, "** " + a.toUpperCase() + " **")), l.note ? h("div", { class: "pr-sub" }, "Obs: " + l.note) : null); }),
    line(), h("div", { class: "pr-row" }, h("span", {}, "Subtotal"), h("span", {}, BRL(o.subtotal))), h("div", { class: "pr-row" }, h("span", {}, "Entrega"), h("span", {}, BRL(o.fee))),
    o.discount ? h("div", { class: "pr-row" }, h("span", {}, "Desconto"), h("span", {}, "-" + BRL(o.discount))) : null,
    h("div", { class: "pr-row pr-tot" }, h("span", {}, "TOTAL"), h("span", {}, BRL(o.total))),
    h("div", {}, "Pagamento: " + PAY[payMethod(o)] + (o.payment?.changeFor ? " · troco p/ " + BRL(o.payment.changeFor) : "") + (o.payment?.paid === false ? " (COBRAR)" : " (PAGO)")), line(),
    h("div", {}, h("strong", {}, o.customer?.name || "")), o.customer?.phone ? h("div", {}, phoneFmt(o.customer.phone)) : null,
    o.address ? h("div", {}, `${o.address.quadra} · Conj. ${o.address.conjunto || "-"} · Casa ${o.address.casa || "-"}`) : null,
    o.address?.referencia ? h("div", {}, "Ref: " + o.address.referencia) : null, o.note ? h("div", { class: "pr-obs" }, "OBS: " + o.note) : null,
    line(), h("div", { class: "pr-c" }, "Peça direto e pague menos: dogdosalsicha.com.br"), h("div", { class: "pr-c" }, "Obrigado pela preferência!")));
  document.body.classList.add("printing");
  setTimeout(() => { window.print(); document.body.classList.remove("printing"); }, 30);
}

/* ---------- PDV rápido (balcão) ---------- */
export function newOrderPDV(ctx) {
  const P = window.DOG.products; const cats = window.DOG.cats.filter((c) => c.id !== "mais-pedidos");
  const st = { cat: "hot-dogs", cart: [], name: "", mode: "pickup", table: "", quadra: "", conj: "", casa: "", pay: "pix", change: "", channel: "balcao", q: "" };
  const grid = h("div", { class: "pdv-grid" }); const cartEl = h("div", { class: "pdv-cart" }); const catsEl = h("div", { class: "pdv-cats" });
  const addLine = (pid, options = []) => {
    const k = pid + JSON.stringify(options); const ex = st.cart.find((l) => l.k === k);
    if (ex) ex.qty++; else st.cart.push({ k, productId: pid, name: P[pid].name, qty: 1, unitPrice: store.priceOf(pid), options, note: "" });
    drawCart();
  };
  const optPicker = (pid) => {
    const p = P[pid]; const sel = {};
    const body = h("div", { class: "stack" }, (p.groups || []).map((g) => h("fieldset", { class: "opt-g" }, h("legend", {}, g.name, g.min ? h("span", { class: "req" }, " obrigatório") : null),
      h("div", { class: "opt-chips" }, g.options.map((o, i) => {
        const disabled = o.product && store.isOff(o.product);
        const b = h("button", { type: "button", class: "opt-chip", disabled, "aria-pressed": "false", onclick: () => {
          if (g.type === "single") { body.querySelectorAll(`[data-g="${g.id}"]`).forEach((x) => x.setAttribute("aria-pressed", "false")); sel[g.id] = [o]; b.setAttribute("aria-pressed", "true"); }
          else { const arr = (sel[g.id] ||= []); const idx = arr.indexOf(o); if (idx >= 0) { arr.splice(idx, 1); b.setAttribute("aria-pressed", "false"); } else { arr.push(o); b.setAttribute("aria-pressed", "true"); } }
        }, dataset: { g: g.id } }, o.name, o.price ? h("small", {}, " +" + BRL(o.price)) : null, disabled ? h("small", {}, " (esgotado)") : null);
        if (g.type === "single" && g.min && i === 0 && !disabled) { sel[g.id] = [o]; b.setAttribute("aria-pressed", "true"); }
        return b;
      })))));
    modal({ title: p.name, sub: BRL(store.priceOf(pid)), size: "sm", body, actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Adicionar", kind: "primary", icon: "plus", onclick: (c) => {
      const options = Object.entries(sel).flatMap(([g, arr]) => arr.map((o) => ({ group: g, id: o.id, name: o.name, qty: 1, price: o.price }))); addLine(pid, options); c(); } }] });
  };
  const drawCats = () => { clear(catsEl).append(...cats.map((c) => h("button", { type: "button", class: "pdv-cat" + (st.cat === c.id ? " on" : ""), onclick: () => { st.cat = c.id; drawCats(); drawGrid(); } }, c.name))); };
  const drawGrid = () => {
    const ids = st.q ? Object.keys(P).filter((id) => norm(P[id].name).includes(norm(st.q))) : cats.find((c) => c.id === st.cat).items;
    clear(grid).append(...ids.map((id) => { const p = P[id]; const off = store.isOff(id);
      return h("button", { type: "button", class: "pdv-p" + (off ? " off" : ""), disabled: off, onclick: () => (p.groups?.length ? optPicker(id) : addLine(id)) },
        h("img", { src: p.imgSm || p.img || "", alt: "", loading: "lazy", width: 80, height: 80 }), h("span", { class: "pdv-pn" }, p.name), h("span", { class: "pdv-pp" }, off ? "Esgotado" : BRL(store.priceOf(id)))); }));
  };
  const total = () => { const sub = st.cart.reduce((a, l) => a + store.lineTotal(l), 0); const fee = st.mode === "delivery" ? store.feeFor(st.quadra) ?? 0 : 0; return { sub, fee, tot: sub + fee }; };
  const zonesList = h("datalist", { id: "zones-dl" }, window.DOG.zones.map((z) => h("option", { value: z.name })));
  const drawCart = () => {
    const t = total(); clear(cartEl);
    cartEl.append(
      h("div", { class: "pdv-ch" }, seg([["balcao", "Balcão"], ["whatsapp", "WhatsApp / telefone"]], st.channel, (v) => { st.channel = v; drawCart(); }, "seg-sm")),
      st.cart.length ? h("ul", { class: "pdv-lines" }, st.cart.map((l) => h("li", {}, h("div", { class: "pl-b" }, h("strong", {}, l.name), l.options.length ? h("small", {}, l.options.map((o) => o.name).join(", ")) : null),
        h("div", { class: "qty" }, iconBtn("minus", "Menos", () => { l.qty--; if (!l.qty) st.cart.splice(st.cart.indexOf(l), 1); drawCart(); }, "sm"), h("span", {}, String(l.qty)), iconBtn("plus", "Mais", () => { l.qty++; drawCart(); }, "sm")),
        h("span", { class: "money" }, BRL(store.lineTotal(l)))))) : empty("Toque nos produtos para montar o pedido.", "cart"),
      h("div", { class: "pdv-form" },
        field("Nome do cliente", input({ value: st.name, placeholder: "Opcional", oninput: (e) => { st.name = e.target.value; } })),
        h("div", { class: "field" }, h("span", { class: "field-l" }, "Como vai receber"), seg([["pickup", "Retirada"], ["dinein", "Mesa"], ["delivery", "Entrega"]], st.mode, (v) => { st.mode = v; drawCart(); }, "seg-sm")),
        st.mode === "dinein" ? field("Mesa", input({ value: st.table, inputmode: "numeric", oninput: (e) => { st.table = e.target.value; } })) : null,
        st.mode === "delivery" ? h("div", { class: "row3" }, field("Quadra", input({ value: st.quadra, list: "zones-dl", placeholder: "QN 310…", onchange: (e) => { st.quadra = e.target.value; drawCart(); } }), st.quadra ? (store.feeFor(st.quadra) != null ? "Taxa " + BRL(store.feeFor(st.quadra)) : "Quadra fora da área") : null),
          field("Conj.", input({ value: st.conj, oninput: (e) => { st.conj = e.target.value; } })), field("Casa", input({ value: st.casa, oninput: (e) => { st.casa = e.target.value; } }))) : null,
        h("div", { class: "field" }, h("span", { class: "field-l" }, "Pagamento"), seg([["pix", "Pix"], ["dinheiro", "Dinheiro"], ["credito", "Crédito"], ["debito", "Débito"]], st.pay, (v) => { st.pay = v; drawCart(); }, "seg-sm")),
        st.pay === "dinheiro" ? field("Troco para", input({ value: st.change, inputmode: "decimal", placeholder: "R$ 50", oninput: (e) => { st.change = e.target.value; } })) : null),
      h("dl", { class: "tot" }, h("dt", {}, "Subtotal"), h("dd", {}, BRL(t.sub)), st.mode === "delivery" ? [h("dt", {}, "Entrega"), h("dd", {}, BRL(t.fee))] : null, h("dt", { class: "big" }, "Total"), h("dd", { class: "big" }, BRL(t.tot))),
      btn("Lançar pedido · " + BRL(t.tot), { kind: "primary", icon: "check", attrs: { class: "btn btn-primary btn-block", disabled: !st.cart.length }, onclick: place }));
  };
  const place = () => {
    if (!st.cart.length) return;
    const o = store.placeOrder({ channel: st.channel, status: st.channel === "balcao" ? "preparo" : "novo", mode: st.mode,
      id: "DS-" + (Math.max(0, ...store.get("orders").map((x) => +String(x.id).replace(/\D/g, "") || 0)) + 1),
      customer: { name: st.name || (st.mode === "dinein" ? "Mesa " + (st.table || "") : "Balcão"), phone: "" }, table: st.mode === "dinein" ? st.table : null,
      address: st.mode === "delivery" ? { quadra: st.quadra, conjunto: st.conj, casa: st.casa, complemento: "", referencia: "" } : null,
      lines: st.cart.map(({ k, ...l }) => l), payment: { method: st.pay, changeFor: st.pay === "dinheiro" ? parseFloat(String(st.change).replace(/[^\d,]/g, "").replace(",", ".")) || null : null, paid: st.mode !== "delivery" } });
    m.close(); toast(`Pedido ${o.id} lançado · ${BRL(o.total)}`, { action: { label: "Imprimir", onclick: () => printOrder(o) } });
  };
  const search = h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar produto", "aria-label": "Buscar produto", oninput: (e) => { st.q = e.target.value; drawGrid(); } }));
  const m = modal({ title: "Novo pedido", sub: "Balcão, mesa ou pedido por telefone", size: "xl", cls: "pdv", body: h("div", { class: "pdv-wrap" }, h("div", { class: "pdv-left" }, search, catsEl, grid), cartEl, zonesList) });
  drawCats(); drawGrid(); drawCart();
}
