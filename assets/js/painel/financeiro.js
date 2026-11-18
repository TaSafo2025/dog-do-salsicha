/* Financeiro — DRE simples, fluxo de caixa com projeção, contas a pagar/receber, ponto de equilíbrio, lucro por canal */
import * as store from "../store.js";
import { h, icon, clear, BRL, BRL0, pct, num, fmtDate, DAY, startOfDay, MONTHS, WD } from "./dom.js";
import { dre, summarize, bills, receivables, cashflow, projection, balanceAt, monthRange, CHANNELS, FEES, monthProjection } from "./calc.js";
import { card, btn, toast, modal, input, select, seg, tabs, pill, chip, field, kpi, bar, empty } from "./ui.js";
import { flow, hbars } from "./charts.js";

const ui = { tab: "resultado", period: 0, bills: "pagar", openCats: false };
const CATS = ["Aluguel", "Equipe", "Energia", "Água", "Gás", "Internet", "Impostos", "iFood", "Motoboy", "Embalagens", "Serviços", "Insumos", "Manutenção", "Outros"];

function shiftMonth(t, k) { const d = new Date(t); const day = d.getDate(); const n = new Date(d.getFullYear(), d.getMonth() + k, 1, d.getHours(), d.getMinutes()); n.setDate(Math.min(day, new Date(n.getFullYear(), n.getMonth() + 1, 0).getDate())); return n.getTime(); }

function resultado(ctx) {
  const { state } = ctx; const now = Date.now();
  const cur = ui.period === 0 ? dre(state, 0, now) : dre(state, -1, now);
  const cmp = ui.period === 0 ? dre(state, 0, shiftMonth(now, -1)) : dre(state, -2, now);
  const mName = MONTHS[new Date(cur.a).getMonth()]; const cName = MONTHS[new Date(cmp.a).getMonth()];
  const delta = (a, b, inv) => { if (!b) return null; const d = (a - b) / Math.abs(b); const good = inv ? d < 0 : d > 0; return h("span", { class: "dlt " + (Math.abs(d) < 0.005 ? "" : good ? "t-ok" : "t-bad") }, icon(d >= 0 ? "up" : "down", 12), pct(Math.abs(d), 0)); };
  const L = (sign, label, hint, v, c, opts = {}) => h("div", { class: "dre-r " + (opts.cls || "") },
    h("span", { class: "dre-s" }, sign), h("div", { class: "dre-l" }, h("strong", {}, label), hint ? h("small", {}, hint) : null, opts.extra || null),
    h("div", { class: "dre-bar" }, h("i", { style: { width: Math.min(100, Math.abs(v) / Math.max(1, cur.sales) * 100).toFixed(1) + "%" } })),
    h("span", { class: "dre-v money" }, (sign === "−" ? "− " : "") + BRL(Math.abs(v))), h("span", { class: "dre-c" }, c != null ? [h("span", { class: "muted mono" }, BRL0(Math.abs(c))), delta(v, c, sign === "−")] : null));
  const fixedHint = cur.partial ? `proporcional a ${num(cur.frac * cur.days, 0)} de ${cur.days} dias (mês: ${BRL0(cur.fixedMonth)})` : "aluguel, equipe, energia, gás, motoboys…";
  const cats = Object.entries(cur.byCat).sort((a, b) => b[1] - a[1]);
  const catList = ui.openCats ? h("ul", { class: "dre-cats" }, cats.map(([k, v]) => h("li", {}, h("span", {}, k), h("span", { class: "money" }, BRL(v))))) : null;
  const check = cur.sales - cur.ifood - cur.card - cur.cost - cur.loss - cur.fixed;
  const ok = Math.abs(check - cur.profit) < 0.01;

  // ponto de equilíbrio do mês corrente
  const be = dre(state, 0, now); const proj = monthProjection(state, now);
  let crossed = null, acc = 0; const [ma] = monthRange(now);
  for (let t = ma; t < now; t += DAY) { acc += summarize(state.orders, state.config, t, t + DAY).sales; if (!crossed && acc >= be.breakEven) crossed = t; }
  const missing = Math.max(0, be.breakEven - be.sales);

  return h("div", { class: "stack-lg" },
    h("div", { class: "fin-grid" },
      card("Resultado do mês", { icon: "wallet", sub: cur.partial ? `${mName} · de 1º até hoje, comparado com o mesmo período de ${cName}` : `${mName} fechado, comparado com ${cName}`,
        actions: seg([[0, "Este mês"], [-1, "Mês passado"]], ui.period, (v) => { ui.period = v; ctx.rerender(); }, "seg-sm"), cls: "dre-card" },
        h("div", { class: "dre" },
          h("div", { class: "dre-r dre-head" }, h("span", {}, ""), h("span", {}, ""), h("span", {}, ""), h("span", { class: "dre-v" }, mName), h("span", { class: "dre-c" }, cName)),
          L("", "Vendas", `${cur.s.count} pedidos · ticket médio ${BRL(cur.s.ticket)}`, cur.sales, cmp.sales, { cls: "dre-sales" }),
          L("−", "Taxas do iFood", "comissão 12% + pagamento online 3,2%", cur.ifood, cmp.ifood),
          L("−", "Taxas da maquininha", "crédito 3,2% · débito 1,5% · Pix grátis", cur.card, cmp.card),
          L("−", "Custo dos produtos (CMV)", `ingredientes e embalagens pela ficha técnica · ${pct(cur.cmv, 1)} das vendas de produtos`, cur.cost, cmp.cost, { cls: cur.cmv > 0.35 ? "dre-warn" : "" }),
          L("−", "Perdas e desperdício", "registradas no estoque", cur.loss, cmp.loss),
          L("−", "Despesas fixas", fixedHint, cur.fixed, cmp.fixed, { extra: h("button", { type: "button", class: "link-btn", onclick: () => { ui.openCats = !ui.openCats; ctx.rerender(); } }, ui.openCats ? "esconder detalhes" : "ver detalhes") }),
          catList,
          h("div", { class: "dre-r dre-total " + (cur.profit >= 0 ? "pos" : "neg") }, h("span", { class: "dre-s" }, "="), h("div", { class: "dre-l" }, h("strong", {}, cur.profit >= 0 ? "Lucro" : "Prejuízo"), h("small", {}, "o que sobrou para você · margem " + pct(cur.profit / Math.max(1, cur.sales), 1))),
            h("span", {}), h("span", { class: "dre-v money" }, BRL(cur.profit)), h("span", { class: "dre-c" }, h("span", { class: "muted mono" }, BRL0(cmp.profit)), delta(cur.profit, cmp.profit))),
          h("p", { class: "dre-check " + (ok ? "ok" : "bad") }, icon(ok ? "check" : "alert", 14), h("span", {}, `Conferência: ${BRL(cur.sales)} − ${BRL(cur.ifood)} − ${BRL(cur.card)} − ${BRL(cur.cost)} − ${BRL(cur.loss)} − ${BRL(cur.fixed)} = ${BRL(check)}`)),
          cur.purchases ? h("p", { class: "note" }, icon("info", 16), ` Você comprou ${BRL(cur.purchases)} de insumos no período. A compra vai para o estoque; o custo só entra aqui quando o lanche é vendido.`) : null)),
      h("div", { class: "stack" },
        card("Ponto de equilíbrio", { icon: "trend", sub: "Quanto precisa vender para pagar todas as contas do mês", cls: "be" },
          h("div", { class: "be-big" }, missing > 0 ? [h("span", {}, "Faltam"), h("strong", {}, BRL0(missing)), h("span", {}, "em vendas para pagar o mês")] : [h("span", {}, "Ponto de equilíbrio atingido em"), h("strong", { class: "t-ok" }, crossed ? fmtDate(crossed) : "—"), h("span", {}, "As contas do mês já estão pagas pelas vendas. Daqui pra frente, o que sobra de cada venda é lucro.")]),
          h("div", { class: "be-bar" }, h("i", { style: { width: Math.min(100, (be.sales / be.breakEven) * 100).toFixed(1) + "%" } }), h("b", { style: { left: "100%" } })),
          h("div", { class: "be-legend" }, h("span", {}, "Vendido: ", h("strong", {}, BRL0(be.sales))), h("span", {}, "Meta: ", h("strong", {}, BRL0(be.breakEven)))),
          h("p", { class: "muted small" }, `De cada R$ 100 vendidos, sobram ${BRL(be.cRate * 100)} para pagar as contas fixas de ${BRL0(be.fixedMonth)}.`)),
        card("Projeção de " + MONTHS[new Date(now).getMonth()], { icon: "sparkle", sub: "No ritmo das últimas 4 semanas" },
          h("div", { class: "proj" }, h("div", {}, h("span", {}, "Vendas"), h("strong", {}, BRL0(proj.sales))), h("div", {}, h("span", {}, "Lucro"), h("strong", { class: proj.profit >= 0 ? "t-ok" : "t-bad" }, BRL0(proj.profit)))),
          h("p", { class: "muted small" }, "Se o CMV cair para 35%, o lucro do mês sobe ~", h("strong", {}, BRL0(Math.max(0, (be.cmv - 0.35) * (proj.sales - be.s.fee)))), ".")))));
}

function fluxo(ctx) {
  const { state } = ctx; const now = Date.now(); const t0 = startOfDay(now);
  const past = cashflow(state, t0 - 30 * DAY, t0 + DAY); const pr = projection(state, now, 30);
  let bal = balanceAt(state, t0 - 30 * DAY);
  const days = past.map((d) => { bal += d.in - d.out; return { ...d, bal, label: String(new Date(d.t).getDate()), title: WD[new Date(d.t).getDay()] + " " + fmtDate(d.t) }; });
  days.push(...pr.days.slice(1).map((d) => ({ ...d, proj: true, label: String(new Date(d.t).getDate()), title: "Previsto · " + WD[new Date(d.t).getDay()] + " " + fmtDate(d.t) })));
  const ins = past.reduce((a, d) => a + d.in, 0), outs = past.reduce((a, d) => a + d.out, 0);
  const upcoming = bills(state.finance).filter((b) => !b.paidAt).sort((a, b) => a.due - b.due).slice(0, 6);
  const recv = receivables(state.finance).filter((r) => !r.receivedAt).sort((a, b) => a.due - b.due);
  return h("div", { class: "stack-lg" },
    h("div", { class: "kpis k4" },
      kpi({ label: "Saldo em caixa (estimado)", value: BRL0(pr.start), icon: "wallet", sub: "caixa + conta da loja" }),
      kpi({ label: "Entrou (30 dias)", value: BRL0(ins), icon: "up", tone: "good", sub: "vendas líquidas + repasses" }),
      kpi({ label: "Saiu (30 dias)", value: BRL0(outs), icon: "down", sub: "contas, compras e retiradas da dona" }),
      kpi({ label: "Menor saldo previsto", value: BRL0(pr.minBal.v), icon: "calendar", tone: pr.minBal.v < 500 ? "bad" : "", sub: "em " + fmtDate(pr.minBal.t) })),
    card("Fluxo de caixa · 30 dias atrás e 30 dias à frente", { icon: "chart", sub: "Barras verdes: entradas · vermelhas: saídas · linha: saldo (tracejado = projeção)" }, flow(days, { height: 280 })),
    h("div", { class: "row r-2" },
      card("Próximas saídas", { icon: "calendar" }, h("ul", { class: "bills" }, upcoming.map((b) => billRow(ctx, b, true)))),
      card("A receber", { icon: "up" }, recv.length ? h("ul", { class: "bills" }, recv.map((r) => h("li", { class: "bill" }, h("div", { class: "bill-d" }, h("strong", {}, r.desc), h("small", {}, "previsto " + fmtDate(r.due) + " · " + r.source)), h("span", { class: "money t-ok" }, "+ " + BRL(r.amount)),
        btn("Recebido", { size: "sm", onclick: () => { store.update("finance", (f) => f.map((x) => x.id === r.id ? { ...x, receivedAt: Date.now() } : x)); toast("Recebimento registrado."); } })))) : empty("Nada a receber."))));
}

function dueTone(b) { const t0 = startOfDay(Date.now()); if (b.paidAt) return ["Pago " + fmtDate(b.paidAt), "ok"]; if (b.due < t0) return ["Vencida " + fmtDate(b.due), "bad"]; if (b.due < t0 + DAY) return ["Vence hoje", "warn"]; if (b.due < t0 + 7 * DAY) return ["Vence " + WD[new Date(b.due).getDay()] + " " + fmtDate(b.due), "warn"]; return ["Vence " + fmtDate(b.due), "neutral"]; }
function pay(b) {
  store.update("finance", (f) => {
    let out = f.map((x) => x.id === b.id ? { ...x, paidAt: Date.now() } : x);
    if (b.recurring) { const next = b.recurring === "semanal" ? b.due + 7 * DAY : shiftMonth(b.due, 1); if (!out.some((x) => x.kind === "bill" && x.desc === b.desc && Math.abs(x.due - next) < 3 * DAY)) out.push({ ...b, id: b.id + "-n" + next, due: next, paidAt: null }); }
    return out;
  });
  toast(`Pago: ${b.desc} (${BRL(b.amount)})` + (b.recurring ? " · próxima já agendada" : ""));
}
function billRow(ctx, b, compact) {
  const [lab, tone] = dueTone(b);
  return h("li", { class: "bill bill-" + tone }, h("div", { class: "bill-d" }, h("strong", {}, b.desc), h("small", {}, h("span", { class: "chip" }, b.cat), b.recurring ? h("span", { class: "chip chip-info" }, icon("refresh", 12), " " + b.recurring) : null, b.method ? " " + b.method : "")),
    pill(lab, tone), h("span", { class: "money" }, BRL(b.amount)), !b.paidAt ? btn("Pagar", { size: "sm", kind: tone === "bad" ? "primary" : "ghost", onclick: () => pay(b) }) : h("span", {}));
}
function newBill(ctx) {
  const d = input({ placeholder: "Ex.: Conserto da chapa", "aria-label": "Descrição" }); const v = input({ inputmode: "decimal", placeholder: "0,00", "aria-label": "Valor" });
  const due = input({ type: "date", value: new Date(Date.now() + 3 * DAY).toISOString().slice(0, 10), "aria-label": "Vencimento" });
  const cat = select(CATS, { value: "Outros", "aria-label": "Categoria" }); const rec = select([["", "Não repete"], ["mensal", "Todo mês"], ["semanal", "Toda semana"]], { "aria-label": "Recorrência" });
  modal({ title: "Nova conta a pagar", size: "sm", body: h("div", { class: "stack" }, field("Descrição", d), h("div", { class: "row2" }, field("Valor (R$)", v), field("Vencimento", due)), h("div", { class: "row2" }, field("Categoria", cat), field("Repetir", rec))),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Salvar conta", kind: "primary", icon: "check", onclick: (c) => {
      const amount = parseFloat(v.value.replace(/\./g, "").replace(",", ".")); if (!d.value.trim() || !(amount > 0)) { toast("Preencha descrição e valor.", { kind: "warn" }); return; }
      const [y, m, dd] = due.value.split("-").map(Number);
      store.update("finance", (f) => [...f, { kind: "bill", id: "b" + Date.now(), desc: d.value.trim(), cat: cat.value, amount, due: new Date(y, m - 1, dd, 12).getTime(), paidAt: null, recurring: rec.value || null, method: "Boleto" }]);
      c(); toast("Conta cadastrada."); } }] });
}
function contas(ctx) {
  const { state } = ctx; const t0 = startOfDay(Date.now());
  const all = bills(state.finance);
  let body;
  if (ui.bills === "receber") {
    const r = receivables(state.finance).sort((a, b) => (a.receivedAt ? 1 : 0) - (b.receivedAt ? 1 : 0) || b.due - a.due).slice(0, 30);
    body = h("ul", { class: "bills" }, r.map((x) => h("li", { class: "bill" }, h("div", { class: "bill-d" }, h("strong", {}, x.desc), h("small", {}, x.source)), pill(x.receivedAt ? "Recebido " + fmtDate(x.receivedAt) : "Previsto " + fmtDate(x.due), x.receivedAt ? "ok" : "info"), h("span", { class: "money t-ok" }, "+ " + BRL(x.amount)),
      !x.receivedAt ? btn("Recebido", { size: "sm", onclick: () => store.update("finance", (f) => f.map((y) => y.id === x.id ? { ...y, receivedAt: Date.now() } : y)) }) : h("span", {}))));
  } else if (ui.bills === "pagas") {
    body = h("ul", { class: "bills" }, all.filter((b) => b.paidAt && b.cat !== "Insumos").sort((a, b) => b.paidAt - a.paidAt).slice(0, 40).map((b) => billRow(ctx, b)));
  } else {
    const open = all.filter((b) => !b.paidAt).sort((a, b) => a.due - b.due);
    const groups = [["Vencidas", open.filter((b) => b.due < t0)], ["Próximos 7 dias", open.filter((b) => b.due >= t0 && b.due < t0 + 7 * DAY)], ["Mais adiante", open.filter((b) => b.due >= t0 + 7 * DAY)]];
    body = h("div", { class: "stack" }, groups.filter(([, l]) => l.length).map(([g, l]) => h("div", {}, h("h4", { class: "grp-h" }, g, h("span", { class: "muted" }, " · " + BRL(l.reduce((a, b) => a + b.amount, 0)))), h("ul", { class: "bills" }, l.map((b) => billRow(ctx, b))))));
  }
  const open = all.filter((b) => !b.paidAt);
  return h("div", { class: "stack-lg" },
    h("div", { class: "kpis k4" },
      kpi({ label: "Vencidas", value: BRL0(open.filter((b) => b.due < t0).reduce((a, b) => a + b.amount, 0)), tone: open.some((b) => b.due < t0) ? "bad" : "good", icon: "alert", sub: open.filter((b) => b.due < t0).length + " contas" }),
      kpi({ label: "Próximos 7 dias", value: BRL0(open.filter((b) => b.due >= t0 && b.due < t0 + 7 * DAY).reduce((a, b) => a + b.amount, 0)), icon: "calendar", sub: open.filter((b) => b.due >= t0 && b.due < t0 + 7 * DAY).length + " contas" }),
      kpi({ label: "Total em aberto", value: BRL0(open.reduce((a, b) => a + b.amount, 0)), icon: "wallet", sub: open.length + " contas" }),
      kpi({ label: "A receber", value: BRL0(receivables(state.finance).filter((r) => !r.receivedAt).reduce((a, r) => a + r.amount, 0)), icon: "up", tone: "good", sub: "repasses do iFood e fiado" })),
    card("Contas", { icon: "calendar", actions: h("div", { class: "tb-f" }, seg([["pagar", "A pagar"], ["pagas", "Pagas"], ["receber", "A receber"]], ui.bills, (v) => { ui.bills = v; ctx.rerender(); }, "seg-sm"), btn("Nova conta", { kind: "primary", icon: "plus", size: "sm", onclick: () => newBill(ctx) })) }, body));
}

function canais(ctx) {
  const { state } = ctx; const now = Date.now(); const [a] = monthRange(now);
  const s = summarize(state.orders, state.config, a, now);
  const rows = Object.entries(s.byChannel).map(([k, x]) => ({ k, ...x, left: x.sales - x.fees - x.cost, per: (x.sales - x.fees - x.cost) / x.count, rate: (x.sales - x.fees - x.cost) / x.sales })).sort((a, b) => b.sales - a.sales);
  const ifood = s.byChannel.ifood || { sales: 0, count: 0, fees: 0 };
  const mens = bills(state.finance).filter((b) => b.cat === "iFood" && b.due >= a && b.due < monthRange(now)[1]).reduce((t, b) => t + b.amount, 0);
  const site = rows.find((r) => r.k === "site");
  const saved = ifood.fees + mens; const ifoodCustomers = state.orders.filter((o) => o.channel === "ifood" && o.createdAt >= a).length;
  return h("div", { class: "stack-lg" },
    card(null, { cls: "ifood-hero" },
      h("div", { class: "ih-l" }, h("span", { class: "sum-eyebrow" }, icon("alert", 16), "Quanto o iFood custou em " + MONTHS[new Date(now).getMonth()]),
        h("p", { class: "ih-big" }, h("strong", {}, BRL(saved))), h("p", {}, `${BRL(ifood.fees)} em comissões e taxas sobre ${BRL0(ifood.sales)} vendidos (${ifood.count} pedidos) + ${BRL(mens)} de mensalidade.`),
        h("p", { class: "ih-save" }, "Se esses pedidos tivessem vindo pelo seu site, você teria economizado ", h("strong", {}, BRL(saved)), " — e ficaria com o WhatsApp desses clientes para chamar de novo.")),
      h("div", { class: "ih-r" }, h("div", { class: "ih-cmp" },
        h("div", {}, h("span", {}, "Sobra num pedido de R$ 40 no site"), h("strong", {}, BRL(40 * (site?.rate ?? 0.55)))),
        h("div", {}, h("span", {}, "Sobra no mesmo pedido pelo iFood"), h("strong", { class: "t-bad" }, BRL(40 * (rows.find((r) => r.k === "ifood")?.rate ?? 0.4))))),
        h("p", { class: "muted small" }, "Dica: coloque um cartão “Peça direto e ganhe 10% de desconto” dentro do pacote do iFood."))),
    card("Lucro por canal", { icon: "store", sub: "Este mês: quanto sobra depois das taxas e dos ingredientes (antes das despesas fixas)" },
      h("div", { class: "tbl-wrap" }, h("table", { class: "tbl" }, h("thead", {}, h("tr", {}, ["Canal", "Pedidos", "Vendas", "Taxas", "Ingredientes", "Sobra", "Sobra por pedido", "De cada R$ 100"].map((c, i) => h("th", { class: i ? "num" : "" }, c)))),
        h("tbody", {}, rows.map((r) => h("tr", {}, h("td", { "data-l": "Canal" }, h("span", { class: "ch-dot ch-" + r.k }), " ", CHANNELS[r.k]?.label || r.k), h("td", { class: "num mono", "data-l": "Pedidos" }, String(r.count)), h("td", { class: "num mono", "data-l": "Vendas" }, BRL(r.sales)),
          h("td", { class: "num mono " + (r.fees > 0 ? "t-bad" : ""), "data-l": "Taxas" }, BRL(r.fees)), h("td", { class: "num mono", "data-l": "Ingredientes" }, BRL(r.cost)), h("td", { class: "num mono strong", "data-l": "Sobra" }, BRL(r.left)),
          h("td", { class: "num mono", "data-l": "Sobra por pedido" }, BRL(r.per)), h("td", { class: "num", "data-l": "De cada R$ 100" }, h("div", { class: "rate" }, bar(r.rate, 0.7, r.rate < 0.5 ? "bad" : "ok"), h("span", { class: "mono" }, BRL(r.rate * 100)))))))))));
}

export default {
  id: "financeiro", deps: ["orders", "finance", "config", "stockMoves"],
  render(ctx) {
    const sub = ctx.route()[1]; if (sub && ui._sub !== sub && ["resultado", "fluxo", "contas", "canais"].includes(sub)) { ui.tab = sub; ui._sub = sub; }
    const overdue = bills(ctx.state.finance).filter((b) => !b.paidAt && b.due < startOfDay(Date.now())).length;
    const body = ui.tab === "fluxo" ? fluxo(ctx) : ui.tab === "contas" ? contas(ctx) : ui.tab === "canais" ? canais(ctx) : resultado(ctx);
    return h("div", { class: "stack-lg" }, tabs([["resultado", "Resultado (DRE)"], ["fluxo", "Fluxo de caixa"], ["contas", "Contas a pagar e receber", overdue ? String(overdue) : null], ["canais", "Lucro por canal"]], ui.tab, (v) => { ui.tab = v; ctx.rerender(); }), body);
  }
};
