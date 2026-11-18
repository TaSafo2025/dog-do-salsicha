/* Estoque — saldo, mínimos, valor, compras (custo médio), perdas, lista de compras automática, movimentos e inventário guiado */
import * as store from "../store.js";
import { h, icon, clear, BRL, BRL0, pct, num, fmtDT, fmtDate, DAY, startOfDay, norm } from "./dom.js";
import { insumos, insumo, insCost, fmtQty, packOf, stockStatus, STOCK_LABEL, consumption, shoppingList, SUPPLIERS, supplierOf, costPerShown, unitLabel, lossesValue, monthRange, bills } from "./calc.js";
import { card, btn, toast, modal, input, select, seg, tabs, pill, field, kpi, toggle, table, empty, bar, iconBtn } from "./ui.js";

const ui = { tab: "saldo", filter: "todos", q: "", days: 4, safety: true, mtype: "todos", inv: null, skip: {} };
const TONE = { ok: "ok", baixo: "warn", critico: "bad", zerado: "bad", fora: "neutral" };
const PLACE = (id) => /pao/.test(id) ? "Prateleira de pães" : /coca|refri|mineiro|agua|suco/.test(id) ? "Geladeira de bebidas" : /batata-frita|burger|smash/.test(id) ? "Freezer" : /emb|sacola|bala/.test(id) ? "Estoque seco" : /milho|palha/.test(id) ? "Prateleira" : "Geladeira da cozinha";

/* ---------- registros ---------- */
export function registerPurchase({ id, qty, total, supplier, method = "Pix" }) {
  const cur = Math.max(0, store.get("stock")[id] ?? 0); const cfg = store.get("config"); const old = insCost(id, cfg); const unit = total / qty;
  const avg = cur > 0 ? (cur * old + qty * unit) / (cur + qty) : unit;
  store.update("stock", (s) => ({ ...s, [id]: Math.round(((s[id] ?? 0) + qty) * 100) / 100 }));
  store.update("config", (c) => ({ ...c, costs: { ...(c.costs || {}), [id]: Math.round(avg * 100000) / 100000 } }));
  store.update("stockMoves", (m) => [{ at: Date.now(), type: "entrada", items: { [id]: qty }, insumo: id, qty, unitCost: unit, total, supplier }, ...m].slice(0, 500));
  store.update("finance", (f) => [...f, { kind: "bill", id: "cp-" + Date.now() + id, desc: "Compra · " + supplier + " (" + insumo(id).name + ")", cat: "Insumos", amount: Math.round(total * 100) / 100, due: Date.now(), paidAt: Date.now(), supplier, method, recurring: null }]);
  return { old, avg };
}
function purchaseModal(ctx, preset) {
  const st = { id: preset?.id || insumos()[0].id, qty: "", total: "", sup: "" };
  const preview = h("div", { class: "pv" });
  const qIn = input({ inputmode: "decimal", placeholder: "0", "aria-label": "Quantidade" }); const tIn = input({ inputmode: "decimal", placeholder: "0,00", "aria-label": "Valor pago" });
  const uEl = h("span", { class: "field-h" }); const supSel = select(Object.values(SUPPLIERS).map((s) => [s.name, s.name]), { "aria-label": "Fornecedor" });
  const parse = (v) => parseFloat(String(v).replace(/\./g, "").replace(",", ".")) || 0;
  const qtyBase = () => parse(qIn.value) * (insumo(st.id).unit === "g" ? 1000 : 1);
  const upd = () => {
    const i = insumo(st.id); uEl.textContent = (i.unit === "g" ? "em kg" : "em unidades") + " · compra em " + i.buyUnit;
    const q = qtyBase(), t = parse(tIn.value); clear(preview);
    const cur = Math.max(0, store.get("stock")[st.id] ?? 0); const old = insCost(st.id, store.get("config"));
    if (q > 0 && t > 0) { const unit = t / q; const avg = cur > 0 ? (cur * old + q * unit) / (cur + q) : unit; const f = i.unit === "g" ? 1000 : 1; const diff = avg / old - 1;
      preview.append(h("div", { class: "pv-r" }, h("span", {}, "Estoque"), h("strong", {}, fmtQty(st.id, cur) + " → " + fmtQty(st.id, cur + q))),
        h("div", { class: "pv-r" }, h("span", {}, "Preço desta compra"), h("strong", {}, BRL(unit * f) + "/" + unitLabel(st.id))),
        h("div", { class: "pv-r" }, h("span", {}, "Custo médio"), h("strong", { class: Math.abs(diff) > 0.005 ? (diff > 0 ? "t-bad" : "t-ok") : "" }, BRL(old * f) + " → " + BRL(avg * f) + "/" + unitLabel(st.id) + (Math.abs(diff) > 0.005 ? ` (${diff > 0 ? "+" : ""}${pct(diff, 1)})` : ""))),
        Math.abs(diff) > 0.03 ? h("p", { class: "note " + (diff > 0 ? "warn" : "") }, icon("info", 16), diff > 0 ? " O custo dos lanches com este insumo sobe na hora. Confira a margem no Cardápio." : " Boa compra: o custo dos lanches com este insumo cai.") : null);
    } else preview.append(h("p", { class: "muted" }, "Informe quantidade e valor pago para ver o novo custo médio."));
  };
  const insSel = select(insumos().map((i) => [i.id, i.name]), { value: st.id, "aria-label": "Insumo", onchange: (e) => { st.id = e.target.value; supSel.value = SUPPLIERS[supplierOf(st.id)].name; upd(); } });
  supSel.value = SUPPLIERS[supplierOf(st.id)].name;
  if (preset?.qty) qIn.value = String(insumo(st.id).unit === "g" ? preset.qty / 1000 : preset.qty).replace(".", ",");
  if (preset?.total) tIn.value = preset.total.toFixed(2).replace(".", ",");
  qIn.addEventListener("input", upd); tIn.addEventListener("input", upd);
  const qf = field("Quantidade", qIn); qf.append(uEl);
  upd();
  modal({ title: "Registrar compra", sub: "Entrada de insumo no estoque", size: "md", body: h("div", { class: "stack" }, field("Insumo", insSel), h("div", { class: "row2" }, qf, field("Valor total pago (R$)", tIn)), field("Fornecedor", supSel), preview),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Dar entrada", kind: "primary", icon: "check", onclick: (c) => {
      const q = qtyBase(), t = parse(tIn.value); if (!(q > 0 && t > 0)) { toast("Preencha quantidade e valor.", { kind: "warn" }); return; }
      const r = registerPurchase({ id: st.id, qty: q, total: t, supplier: supSel.value }); c();
      toast(`Entrada de ${fmtQty(st.id, q)} de ${insumo(st.id).name}. Custo médio: ${BRL(r.avg * (insumo(st.id).unit === "g" ? 1000 : 1))}/${unitLabel(st.id)}.`); } }] });
}
function lossModal(ctx) {
  let id = insumos()[0].id, reason = "Venceu / estragou";
  const qIn = input({ inputmode: "decimal", placeholder: "0", "aria-label": "Quantidade perdida" }); const hint = h("span", { class: "field-h" }, "em g");
  const insSel = select(insumos().map((i) => [i.id, i.name]), { "aria-label": "Insumo", onchange: (e) => { id = e.target.value; hint.textContent = insumo(id).unit === "g" ? "em g" : "em unidades"; } });
  hint.textContent = insumo(id).unit === "g" ? "em g" : "em unidades";
  const reasons = ["Venceu / estragou", "Caiu / queimou", "Pedido refeito", "Consumo da equipe", "Outro"];
  const chips = h("div", { class: "opt-chips" }, reasons.map((r, i) => h("button", { type: "button", class: "opt-chip", "aria-pressed": String(i === 0), onclick: (e) => { reason = r; chips.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", "false")); e.currentTarget.setAttribute("aria-pressed", "true"); } }, r)));
  const qf = field("Quantidade", qIn); qf.append(hint);
  modal({ title: "Registrar perda", sub: "Desperdício entra no resultado do mês", size: "sm", body: h("div", { class: "stack" }, field("Insumo", insSel), qf, h("div", { class: "field" }, h("span", { class: "field-l" }, "Motivo"), chips)),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Registrar perda", kind: "danger", onclick: (c) => {
      const q = parseFloat(qIn.value.replace(",", ".")) || 0; if (q <= 0) return;
      store.update("stock", (s) => ({ ...s, [id]: Math.round(((s[id] ?? 0) - q) * 100) / 100 }));
      store.update("stockMoves", (m) => [{ at: Date.now(), type: "perda", items: { [id]: q }, reason }, ...m].slice(0, 500));
      c(); toast(`Perda registrada: ${fmtQty(id, q)} de ${insumo(id).name} (${BRL(q * insCost(id))}).`, { kind: "warn" }); } }] });
}

/* ---------- abas ---------- */
function saldo(ctx) {
  const { state } = ctx; const cfg = state.config; const now = Date.now();
  const cons14 = consumption(state.orders, now - 14 * DAY, now);
  let rows = insumos().map((i) => { const q = state.stock[i.id] ?? 0; let st = stockStatus(i.id, q);
    if (st === "zerado" && !cons14[i.id] && !Object.keys(window.DOG.products).some((p) => !store.isOff(p) && (window.DOG.products[p].recipe?.[i.id] || 0) > 0)) st = "fora"; const daily = (cons14[i.id] || 0) / 14 * (7 / 6);
    return { i, q, st, daily, cover: daily ? Math.max(0, q) / daily : Infinity, cost: insCost(i.id, cfg), value: Math.max(0, q) * insCost(i.id, cfg) }; });
  const total = rows.reduce((a, r) => a + r.value, 0); const attn = rows.filter((r) => r.st !== "ok" && r.st !== "fora");
  const [ma] = monthRange(now); const loss = lossesValue(state.stockMoves, cfg, ma, now);
  const buys7 = bills(state.finance).filter((b) => b.cat === "Insumos" && b.due >= now - 7 * DAY && b.due <= now).reduce((a, b) => a + b.amount, 0);
  if (ui.filter === "atencao") rows = rows.filter((r) => r.st !== "ok" && r.st !== "fora");
  if (ui.q) rows = rows.filter((r) => norm(r.i.name).includes(norm(ui.q)));
  const order = { zerado: 0, critico: 1, baixo: 2, ok: 3, fora: 4 }; rows.sort((a, b) => order[a.st] - order[b.st] || a.cover - b.cover);
  return h("div", { class: "stack-lg" },
    h("div", { class: "kpis k4" },
      kpi({ label: "Valor parado no estoque", value: BRL0(total), icon: "box", sub: "pelo custo médio" }),
      kpi({ label: "Precisam de atenção", value: String(attn.length), icon: "alert", tone: attn.some((r) => r.st === "zerado") ? "bad" : "warn", sub: attn.filter((r) => r.st === "zerado").length + " zerados" }),
      kpi({ label: "Compras (7 dias)", value: BRL0(buys7), icon: "cart", sub: "entradas registradas" }),
      kpi({ label: "Perdas do mês", value: BRL(loss.value), icon: "trash", tone: loss.value > 80 ? "warn" : "", sub: loss.list.length + " registros" })),
    h("div", { class: "toolbar slim" },
      h("div", { class: "tb-f" }, h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar insumo", value: ui.q, dataset: { fk: "eq" }, "aria-label": "Buscar insumo", oninput: (e) => { ui.q = e.target.value; ctx.rerender(); } })),
        seg([["todos", "Todos"], ["atencao", "Atenção (" + attn.length + ")"]], ui.filter, (v) => { ui.filter = v; ctx.rerender(); }, "seg-sm")),
      h("div", { class: "tb-f" }, btn("Registrar perda", { icon: "trash", onclick: () => lossModal(ctx) }), btn("Registrar compra", { kind: "primary", icon: "plus", onclick: () => purchaseModal(ctx) }))),
    table([
      { label: "Insumo", render: (r) => h("div", { class: "cell-n" }, h("strong", {}, r.i.name), h("small", {}, PLACE(r.i.id) + " · compra: " + r.i.buyUnit)) },
      { label: "Situação", render: (r) => pill(r.st === "fora" ? "Fora do cardápio" : STOCK_LABEL[r.st], TONE[r.st]) },
      { label: "Quantidade", cls: "num", render: (r) => h("div", { class: "qcell" }, h("strong", { class: "mono" }, fmtQty(r.i.id, Math.max(0, r.q))), bar(Math.max(0, r.q), r.i.min * 2, TONE[r.st])) },
      { label: "Mínimo", cls: "num mono", render: (r) => fmtQty(r.i.id, r.i.min) },
      { label: "Dura até", cls: "num", render: (r) => r.cover === Infinity ? h("span", { class: "muted" }, "sem saída") : h("span", { class: r.cover < 2 ? "t-bad" : r.cover < 4 ? "t-warn" : "" }, r.cover < 1 ? "hoje" : "~" + num(r.cover, 0) + (Math.round(r.cover) === 1 ? " dia" : " dias")) },
      { label: "Custo médio", cls: "num mono", render: (r) => BRL(costPerShown(r.i.id, cfg)) + "/" + unitLabel(r.i.id) },
      { label: "Valor", cls: "num mono", render: (r) => BRL(r.value) },
      { label: "", cls: "act", render: (r) => btn("Comprar", { size: "sm", icon: "plus", onclick: (e) => { e.stopPropagation(); purchaseModal(ctx, { id: r.i.id }); } }) }
    ], rows, { cls: "tbl-stock" }));
}
function compras(ctx) {
  const { state } = ctx; const list = shoppingList(state, ui.days, ui.safety).filter((x) => !x.pack.own || true);
  const bySup = {}; for (const x of list) (bySup[x.supplier] ||= []).push(x);
  const total = list.filter((x) => !x.pack.own).reduce((a, x) => a + x.cost, 0);
  const msg = (sup, items) => `Olá! Aqui é do *Dog do Salsicha* (QN 310, Samambaia Sul). Gostaria de fazer o pedido:\n\n${items.map((x) => `• ${x.packs}× ${x.pack.label} — ${x.ins.name}`).join("\n")}\n\nEntrega até ${new Date(Date.now() + DAY).toLocaleDateString("pt-BR", { weekday: "long" })} à tarde, por favor. Obrigada!`;
  return h("div", { class: "stack-lg" },
    card("Lista de compras automática", { icon: "cart", sub: "Calculada pelo que você vendeu nos últimos 14 dias",
      actions: h("div", { class: "tb-f" }, h("label", { class: "inline" }, "Comprar para ", select([[2, "2 dias"], [3, "3 dias"], [4, "4 dias"], [7, "7 dias"], [14, "14 dias"]], { value: ui.days, "aria-label": "Dias até a próxima compra", onchange: (e) => { ui.days = +e.target.value; ctx.rerender(); } })),
        toggle(ui.safety, (v) => { ui.safety = v; ctx.rerender(); }, "Manter estoque mínimo")) },
      h("p", { class: "formula" }, h("span", {}, "consumo médio por dia"), " × ", h("span", {}, ui.days + " dias até a próxima compra"), ui.safety ? [" + ", h("span", {}, "estoque mínimo")] : null, " − ", h("span", {}, "o que já tem"), " = ", h("strong", {}, "quanto comprar"), h("em", {}, " (arredondado para o pacote do fornecedor)")),
      h("div", { class: "buy-total" }, h("span", {}, list.length + " itens · estimativa"), h("strong", {}, BRL(total)))),
    Object.keys(bySup).length ? h("div", { class: "sup-grid" }, Object.entries(bySup).map(([sk, items]) => {
      const sup = SUPPLIERS[sk]; const sum = items.reduce((a, x) => a + x.cost, 0);
      return card(sup.name, { icon: sk === "proprio" ? "flame" : "package", sub: sup.note, cls: "sup",
        actions: sup.phone ? h("a", { class: "btn btn-wa btn-sm", href: "https://wa.me/" + sup.phone + "?text=" + encodeURIComponent(msg(sk, items)), target: "_blank", rel: "noopener" }, icon("chat", 16), h("span", {}, "Enviar lista ao fornecedor no WhatsApp")) : h("span", { class: "chip" }, "Produzir na cozinha") },
        h("ul", { class: "buy" }, items.map((x) => h("li", { class: "buy-i" },
          h("div", { class: "buy-n" }, h("strong", {}, x.ins.name), h("small", {}, "tem " + fmtQty(x.id, x.stock) + " · gasta ~" + fmtQty(x.id, x.daily) + "/dia")),
          h("div", { class: "buy-q" }, h("strong", {}, x.packs + "× "), x.pack.label, h("small", {}, "= " + fmtQty(x.id, x.qty))),
          h("span", { class: "buy-c money" }, BRL(x.cost)),
          sk !== "proprio" ? iconBtn("check", "Dar entrada desta compra", () => purchaseModal(ctx, { id: x.id, qty: x.qty, total: x.cost }), "sm") : null))),
        h("div", { class: "sup-f" }, h("span", { class: "muted" }, items.length + " itens"), h("strong", {}, BRL(sum))));
    })) : empty("Nada para comprar agora: estoque cobre os próximos dias.", "check"));
}
const MT = { venda: ["Baixa por venda", "neutral"], entrada: ["Compra", "ok"], producao: ["Produção", "ok"], perda: ["Perda", "bad"], ajuste: ["Ajuste/inventário", "warn"], estorno: ["Estorno", "info"] };
function movimentos(ctx) {
  const { state } = ctx; const cfg = state.config;
  let list = state.stockMoves || []; if (ui.mtype !== "todos") list = list.filter((m) => (ui.mtype === "entrada" ? ["entrada", "producao"] : [ui.mtype]).includes(m.type));
  list = list.slice(0, 160);
  const desc = (m) => Object.entries(m.items || {}).map(([k, q]) => `${insumo(k)?.name.split(" ").slice(0, 2).join(" ") || k} ${fmtQty(k, q)}`);
  return h("div", { class: "stack-lg" },
    h("div", { class: "toolbar slim" }, seg([["todos", "Todos"], ["venda", "Vendas"], ["entrada", "Compras"], ["perda", "Perdas"], ["ajuste", "Ajustes"]], ui.mtype, (v) => { ui.mtype = v; ctx.rerender(); }, "seg-sm"),
      h("p", { class: "muted" }, icon("info", 16), " Cada venda dá baixa sozinha pela ficha técnica.")),
    table([
      { label: "Quando", cls: "mono nowrap", render: (m) => fmtDT(m.at) },
      { label: "Tipo", render: (m) => pill(MT[m.type]?.[0] || m.type, MT[m.type]?.[1] || "neutral") },
      { label: "Itens", render: (m) => { const d = desc(m); return h("span", { class: "mv-items" }, d.slice(0, 4).join(" · ") + (d.length > 4 ? ` · +${d.length - 4}` : "")); } },
      { label: "Origem", render: (m) => h("span", { class: "muted" }, m.ref ? "Pedido " + m.ref : m.supplier || m.reason || "—") },
      { label: "Valor", cls: "num mono", render: (m) => { const v = m.total ?? Object.entries(m.items || {}).reduce((a, [k, q]) => a + q * insCost(k, cfg), 0); return (m.type === "entrada" || m.type === "producao" ? "+" : m.type === "estorno" ? "+" : "−") + BRL(Math.abs(v)); } }
    ], list, { cls: "tbl-moves" }));
}
function inventario(ctx) {
  const { state } = ctx; const items = [...insumos()].sort((a, b) => PLACE(a.id).localeCompare(PLACE(b.id)));
  if (!ui.inv) return card("Inventário guiado", { icon: "list", sub: "Conte o que tem na loja, item por item. Leva uns 15 minutos." },
    h("div", { class: "inv-intro" }, h("ol", {}, h("li", {}, "Vá até cada lugar indicado (geladeira, freezer, prateleiras)."), h("li", {}, "Digite quanto tem de verdade. Pode pular o que não der para contar."), h("li", {}, "No fim, o painel mostra as diferenças em reais e ajusta o estoque.")),
      btn("Começar contagem", { kind: "primary", icon: "play", onclick: () => { ui.inv = { i: 0, counts: {} }; ctx.rerender(); } })));
  const inv = ui.inv;
  if (inv.i >= items.length) {
    const diffs = items.filter((i) => inv.counts[i.id] != null).map((i) => { const sys = Math.max(0, state.stock[i.id] ?? 0); const d = inv.counts[i.id] - sys; return { i, sys, c: inv.counts[i.id], d, v: d * insCost(i.id, state.config) }; }).filter((x) => Math.abs(x.d) > 0.001);
    const tot = diffs.reduce((a, x) => a + x.v, 0);
    return card("Resultado da contagem", { icon: "check", sub: `${Object.keys(inv.counts).length} itens contados · ${diffs.length} com diferença` },
      h("div", { class: "inv-res " + (tot < 0 ? "bad" : "ok") }, h("span", {}, tot < 0 ? "Faltou no estoque" : "Sobrou no estoque"), h("strong", {}, BRL(Math.abs(tot)))),
      table([{ label: "Insumo", render: (x) => x.i.name }, { label: "Sistema", cls: "num mono", render: (x) => fmtQty(x.i.id, x.sys) }, { label: "Contado", cls: "num mono", render: (x) => fmtQty(x.i.id, x.c) },
        { label: "Diferença", cls: "num mono", render: (x) => h("span", { class: x.d < 0 ? "t-bad" : "t-ok" }, (x.d > 0 ? "+" : "") + fmtQty(x.i.id, x.d)) }, { label: "Em R$", cls: "num mono", render: (x) => BRL(x.v) }], diffs, { empty: "Tudo bateu certinho com o sistema." }),
      h("div", { class: "row-end" }, btn("Recomeçar", { onclick: () => { ui.inv = { i: 0, counts: {} }; ctx.rerender(); } }), btn("Aplicar ajustes no estoque", { kind: "primary", icon: "check", onclick: () => {
        store.update("stock", (s) => { const n = { ...s }; for (const x of diffs) n[x.i.id] = x.c; return n; });
        if (diffs.length) store.update("stockMoves", (m) => [{ at: Date.now(), type: "ajuste", items: Object.fromEntries(diffs.map((x) => [x.i.id, x.d])), reason: "Inventário guiado" }, ...m].slice(0, 500));
        ui.inv = null; toast("Estoque ajustado pela contagem."); ctx.rerender(); } })));
  }
  const it = items[inv.i]; const sys = Math.max(0, state.stock[it.id] ?? 0); const g = it.unit === "g";
  const val = inv.counts[it.id] ?? sys;
  const inp = h("input", { class: "inp inv-inp", inputmode: "decimal", value: String(g ? val / 1000 : val).replace(".", ","), "aria-label": "Quantidade contada", dataset: { fk: "inv" } });
  const save = () => { const v = parseFloat(inp.value.replace(",", ".")); if (Number.isFinite(v)) inv.counts[it.id] = g ? Math.round(v * 1000) : v; };
  const step = (d) => { const v = (parseFloat(inp.value.replace(",", ".")) || 0) + d; inp.value = String(Math.max(0, Math.round(v * 100) / 100)).replace(".", ","); };
  return card("Inventário guiado", { icon: "list", sub: PLACE(it.id) },
    h("div", { class: "inv-prog" }, h("span", {}, `Item ${inv.i + 1} de ${items.length}`), bar(inv.i, items.length)),
    h("div", { class: "inv-step" }, h("p", { class: "inv-place" }, icon("map", 16), " " + PLACE(it.id)), h("h3", { class: "inv-name" }, it.name), h("p", { class: "muted" }, "O sistema diz que tem ", h("strong", {}, fmtQty(it.id, sys)), " · mínimo " + fmtQty(it.id, it.min)),
      h("div", { class: "inv-in" }, iconBtn("minus", "Menos", () => step(g ? -0.1 : -1), "lg"), inp, h("span", { class: "u" }, g ? "kg" : "un"), iconBtn("plus", "Mais", () => step(g ? 0.1 : 1), "lg"))),
    h("div", { class: "row-end" }, btn("Voltar", { icon: "chevl", attrs: { disabled: inv.i === 0 }, onclick: () => { inv.i = Math.max(0, inv.i - 1); ctx.rerender(); } }), btn("Pular", { onclick: () => { inv.i++; ctx.rerender(); } }),
      btn("Confirmar e próximo", { kind: "primary", icon: "arrowr", onclick: () => { save(); inv.i++; ctx.rerender(); } })));
}

export default {
  id: "estoque", deps: ["stock", "stockMoves", "config", "orders", "finance"],
  render(ctx) {
    const sub = ctx.route()[1]; if (sub && ["saldo", "compras", "movimentos", "inventario"].includes(sub) && ui._sub !== sub) { ui.tab = sub; ui._sub = sub; }
    const n = shoppingList(ctx.state, ui.days, ui.safety).length;
    const body = ui.tab === "compras" ? compras(ctx) : ui.tab === "movimentos" ? movimentos(ctx) : ui.tab === "inventario" ? inventario(ctx) : saldo(ctx);
    return h("div", { class: "stack-lg" }, tabs([["saldo", "Estoque"], ["compras", "Lista de compras", n ? String(n) : null], ["movimentos", "Movimentos"], ["inventario", "Inventário guiado"]], ui.tab, (v) => { ui.tab = v; ctx.rerender(); }), body);
  }
};
