/* Início — painel do dono */
import { h, icon, BRL, BRL0, pct, num, DAY, startOfDay, WD, WDL, MONTHS, fmtDate } from "./dom.js";
import { summarize, dre, monthProjection, bills, stockStatus, insumos, insumo, CMV_IDEAL, productCost, CHANNELS, insCost, recipeOf } from "./calc.js";
import { card, kpi, btn, pill } from "./ui.js";
import * as store from "../store.js";
import { bars, spark, hbars } from "./charts.js";

export function alertsFor(ctx) {
  const { state } = ctx; const now = Date.now(); const out = [];
  const zer = [], low = [];
  for (const i of insumos()) { const st = stockStatus(i.id, state.stock[i.id] ?? 0); if (st === "zerado") zer.push(i); else if (st !== "ok") low.push(i); }
  const usedBy = (id) => Object.keys(window.DOG.products).filter((p) => (recipeOf(p, state.config)[id] || 0) > 0 && !window.DOG.products[p].combo).length;
  const activeUse = (id) => Object.keys(window.DOG.products).filter((p) => !store.isOff(p) && (recipeOf(p, state.config)[id] || 0) > 0);
  const zerActive = zer.filter((i) => activeUse(i.id).length || ["coca-zero-310", "mineiro-350"].includes(i.id));
  const big = zerActive.filter((i) => activeUse(i.id).length >= 3), small = zerActive.filter((i) => activeUse(i.id).length < 3);
  for (const i of big) out.push({ tone: "bad", icon: "alert", title: `${i.name} acabou`, text: `Vai em ${activeUse(i.id).length} produtos do cardápio. Compre hoje.`, action: ["Lista de compras", () => ctx.go("estoque", "compras")] });
  if (small.length) out.push({ tone: "bad", icon: "box", title: small.map((i) => i.name.replace(" 310 ml", "").replace(" lata", "")).join(" e ") + (small.length > 1 ? " acabaram" : " acabou"), text: "Já aparecem como esgotados no site. Peça ao fornecedor.", action: ["Comprar", () => ctx.go("estoque", "compras")] });
  if (low.length) out.push({ tone: "warn", icon: "box", title: `${low.length} insumos abaixo do mínimo`, text: low.slice(0, 4).map((i) => i.name).join(", ") + (low.length > 4 ? "…" : ""), action: ["Ver estoque", () => ctx.go("estoque")] });
  const open = bills(state.finance).filter((b) => !b.paidAt);
  for (const b of open.filter((b) => b.due < startOfDay(now))) out.push({ tone: "bad", icon: "calendar", title: `Conta vencida: ${b.desc}`, text: `Venceu em ${fmtDate(b.due)} · ${BRL(b.amount)}. Pague hoje para evitar juros.`, action: ["Pagar", () => ctx.go("financeiro", "contas")] });
  const week = open.filter((b) => b.due >= startOfDay(now) && b.due < now + 7 * DAY);
  if (week.length) out.push({ tone: "info", icon: "wallet", title: `${week.length} contas vencem nos próximos 7 dias`, text: BRL(week.reduce((a, b) => a + b.amount, 0)) + " no total · " + [...new Set(week.map((b) => b.desc.split(" — ")[0].replace("Compra · ", "")))].slice(0, 3).join(", "), action: ["Ver contas", () => ctx.go("financeiro", "contas")] });
  // custo de insumo subindo
  const rises = insumos().map((i) => ({ i, r: insCost(i.id, state.config) / i.cost - 1 })).filter((x) => x.r > 0.04).sort((a, b) => b.r - a.r);
  if (rises[0]) out.push({ tone: "warn", icon: "trend", title: `${rises[0].i.name} subiu ${pct(rises[0].r, 0)}`, text: "O custo médio das últimas compras aumentou. Confira a margem dos lanches que usam esse item.", action: ["Ver cardápio", () => ctx.go("cardapio")] });
  const custs = Object.values(state.customers || {}); const gone = custs.filter((c) => c.orders >= 3 && c.last < now - 30 * DAY);
  if (gone.length) out.push({ tone: "info", icon: "users", title: `${gone.length} clientes fiéis sumiram`, text: "Pediam sempre e não pedem há mais de 30 dias. Mande um cupom de volta pelo WhatsApp.", action: ["Ver clientes", () => ctx.go("clientes", "sumidos")] });
  return out;
}

export default {
  id: "inicio", deps: ["orders", "stock", "finance", "config", "customers", "stockMoves"],
  render(ctx) {
    const { state } = ctx; const cfg = state.config; const now = Date.now(); const t0 = startOfDay(now);
    const today = summarize(state.orders, cfg, t0, now + DAY);
    const lastWeek = summarize(state.orders, cfg, t0 - 7 * DAY, t0 - 7 * DAY + (now - t0));
    const d = dre(state, 0, now); const prev = dre(state, -1, now); const proj = monthProjection(state, now);
    const openBills = bills(state.finance).filter((b) => !b.paidAt && b.due < now + 7 * DAY);
    const overdue = openBills.filter((b) => b.due < t0);
    const crit = insumos().filter((i) => stockStatus(i.id, state.stock[i.id] ?? 0) !== "ok");
    const usedNow = (id) => Object.keys(window.DOG.products).some((p) => !store.isOff(p) && (window.DOG.products[p].recipe?.[id] || 0) > 0) || ["coca-zero-310", "mineiro-350"].includes(id);
    crit.splice(0, crit.length, ...crit.filter((i) => usedNow(i.id)));
    const zer = crit.filter((i) => stockStatus(i.id, state.stock[i.id] ?? 0) === "zerado");

    // último dia com movimento (para quando hoje ainda não abriu)
    let lastOpen = null; for (let k = 1; k < 8; k++) { const s = summarize(state.orders, cfg, t0 - k * DAY, t0 - (k - 1) * DAY); if (s.count) { lastOpen = { s, t: t0 - k * DAY }; break; } }
    const days30 = []; for (let k = 29; k >= 0; k--) { const a = t0 - k * DAY; const s = summarize(state.orders, cfg, a, a + DAY); days30.push({ a, s }); }

    const trendToday = lastWeek.sales ? (today.sales - lastWeek.sales) / lastWeek.sales : 0;
    const cmvTone = d.cmv > 0.38 ? "bad" : d.cmv > CMV_IDEAL ? "warn" : "ok";

    // produto que mais pesa no CMV: o que mais passa do custo ideal de 35% em reais
    const heavy = Object.entries(d.s.byProduct).filter(([id]) => !window.DOG.products[id]?.combo).map(([id, x]) => ({ id, over: x.cost - x.sales * CMV_IDEAL, ...x })).sort((a, b) => b.over - a.over)[0];
    const heavyP = heavy && window.DOG.products[heavy.id];
    const mName = MONTHS[new Date(now).getMonth()];

    const kpis = h("div", { class: "kpis" },
      kpi({ label: "Vendas hoje", icon: "orders", value: BRL(today.sales), onclick: () => ctx.go("pedidos"),
        trend: lastWeek.sales && today.sales ? { dir: trendToday >= 0 ? "up" : "down", text: pct(Math.abs(trendToday), 0) + " vs " + WD[new Date(now).getDay()] + " passada" } : null,
        sub: today.count ? `${today.count} ${today.count === 1 ? "pedido" : "pedidos"} · ticket ${BRL(today.ticket)}` : lastOpen ? `${WDL[new Date(lastOpen.t).getDay()]}: ${BRL(lastOpen.s.sales)}` : "Sem vendas ainda",
        spark: spark(days30.slice(-14).map((x) => x.s.sales)) }),
      kpi({ label: "Lucro estimado do mês", icon: "wallet", value: BRL0(proj.profit), tone: proj.profit > 0 ? "good" : "bad", onclick: () => ctx.go("financeiro"),
        sub: `até agora ${BRL0(d.profit)} · ${mName}` , trend: prev.profit ? { dir: proj.profit >= prev.profit ? "up" : "down", text: "mês passado " + BRL0(prev.profit) } : null }),
      kpi({ label: "CMV do mês", icon: "tag", value: pct(d.cmv, 1), tone: cmvTone, onclick: () => ctx.go("cardapio"),
        sub: "ideal: até 35%", trend: { dir: d.cmv > prev.cmv ? "up" : "down", text: "era " + pct(prev.cmv, 1) } }),
      kpi({ label: "A pagar em 7 dias", icon: "calendar", value: BRL0(openBills.reduce((a, b) => a + b.amount, 0)), tone: overdue.length ? "bad" : "", onclick: () => ctx.go("financeiro", "contas"),
        sub: `${openBills.length} contas` + (overdue.length ? ` · ${overdue.length} vencida` : "") }),
      kpi({ label: "Estoque crítico", icon: "box", value: String(crit.length), tone: zer.length ? "bad" : crit.length ? "warn" : "good", onclick: () => ctx.go("estoque"),
        sub: zer.length ? `${zer.length} zerados: ${zer.map((i) => i.name.replace(" 310 ml", "").replace(" lata", "").replace("Guaraná ", "")).join(", ")} · ${crit.length - zer.length} abaixo do mínimo` : "itens abaixo do mínimo" }));

    // resumo em linguagem simples
    const over = d.cmv > CMV_IDEAL;
    const ifoodMonth = d.ifood; const ifoodSales = d.s.byChannel.ifood?.sales || 0;
    const summary = card(null, { cls: "summary" },
      h("div", { class: "sum-eyebrow" }, icon("sparkle", 16), "Resumo de " + mName + " até hoje"),
      h("p", { class: "sum-big" }, "Este mês você vendeu ", h("mark", {}, BRL0(d.sales)), " e sobraram ", h("mark", { class: d.profit >= 0 ? "ok" : "bad" }, BRL0(d.profit)), " depois de pagar tudo."),
      h("p", { class: "sum-txt" }, "Seu CMV (quanto do preço vai para os ingredientes) está em ", h("strong", {}, pct(d.cmv, 1)),
        over ? [" — acima do ideal de 35%", heavyP ? [": o ", h("strong", {}, heavyP.name), " é o que mais pesa (custa ", BRL(productCost(heavy.id, cfg)), " e sai por ", BRL(ctx.store.priceOf(heavy.id)), ")."] : "."] : " — dentro do ideal de até 35%. Muito bem!"),
      h("p", { class: "sum-txt" }, "No ritmo atual, ", mName, " deve fechar com ", h("strong", {}, BRL0(proj.sales)), " em vendas e ", h("strong", {}, BRL0(proj.profit)), " de lucro. ",
        ifoodMonth > 0 ? ["O iFood ficou com ", h("strong", {}, BRL0(ifoodMonth)), " em taxas de ", BRL0(ifoodSales), " vendidos por lá."] : ""),
      h("div", { class: "sum-act" }, btn("Ver resultado do mês", { kind: "on-dark", icon: "arrowr", onclick: () => ctx.go("financeiro") }), heavyP ? btn("Abrir ficha do " + heavyP.name, { kind: "on-dark-ghost", onclick: () => ctx.go("cardapio", heavy.id) }) : null));

    // agora na loja
    const act = state.orders.filter((o) => ["novo", "aceito", "preparo", "pronto", "entrega"].includes(o.status));
    const cnt = (st) => act.filter((o) => st.includes(o.status)).length;
    const now$ = card("Agora na loja", { icon: "flame", actions: btn("Pedidos", { size: "sm", icon: "arrowr", onclick: () => ctx.go("pedidos") }) },
      h("div", { class: "live-grid" },
        [["Novos", ["novo"], "novo"], ["Em preparo", ["aceito", "preparo"], "preparo"], ["Em entrega", ["pronto", "entrega"], "entrega"]].map(([l, st, tone]) =>
          h("button", { type: "button", class: "live-c tone-" + tone, onclick: () => ctx.go(tone === "preparo" ? "cozinha" : "pedidos") }, h("span", { class: "live-n" }, String(cnt(st))), h("span", { class: "live-l" }, l)))),
      h("ul", { class: "live-list" }, act.slice(0, 4).map((o) => h("li", {}, h("button", { type: "button", class: "live-o", onclick: () => ctx.openOrder(o.id) },
        h("span", { class: "st-dot st-" + o.status }), h("strong", {}, o.id), h("span", { class: "muted ellip" }, o.customer?.name || ""), h("span", { class: "mono", dataset: { since: o.createdAt } }, ""))))));

    // gráfico 30 dias
    const openDays = days30.filter((x) => x.s.count && x.a < t0); const avg = openDays.reduce((a, x) => a + x.s.sales, 0) / Math.max(1, openDays.length);
    const best = [...openDays].sort((a, b) => b.s.sales - a.s.sales)[0];
    const chart = card("Vendas dos últimos 30 dias", { icon: "chart", sub: `Média de ${BRL0(avg)} por dia aberto · melhor dia: ${best ? WDL[new Date(best.a).getDay()] + " " + fmtDate(best.a) + " (" + BRL0(best.s.sales) + ")" : "—"}`, cls: "span2" },
      bars(days30.map((x) => { const wd = new Date(x.a).getDay(); return { label: String(new Date(x.a).getDate()), sub: WD[wd][0].toUpperCase(), value: x.s.sales, closed: !window.DOG.store.hours[String(wd)],
        tone: x.a === t0 ? "today" : wd === 5 || wd === 6 ? "wk" : "", tip: [WDL[wd] + ", " + fmtDate(x.a), BRL(x.s.sales), x.s.count + " pedidos · ticket " + BRL(x.s.ticket)] }; }), { avg, height: 240, label: "Vendas por dia" }),
      h("div", { class: "legend" }, h("span", {}, h("i", { class: "lg lg-wd" }), "ter a qui e dom"), h("span", {}, h("i", { class: "lg lg-wk" }), "sexta e sábado"), h("span", {}, h("i", { class: "lg lg-today" }), "hoje"), h("span", {}, h("i", { class: "lg lg-avg" }), "média")));

    const alerts = alertsFor(ctx);
    const al = card("Alertas", { icon: "alert", sub: alerts.length ? `${alerts.length} pontos de atenção` : "Tudo em ordem" },
      h("ul", { class: "alerts" }, alerts.map((a) => h("li", { class: "al al-" + a.tone }, h("span", { class: "al-ico" }, icon(a.icon, 18)),
        h("div", { class: "al-b" }, h("strong", {}, a.title), h("p", {}, a.text)), a.action ? btn(a.action[0], { size: "sm", onclick: a.action[1] }) : null))));

    // top produtos e canais
    const top = Object.entries(d.s.byProduct).sort((a, b) => b[1].sales - a[1].sales).slice(0, 6);
    const tp = card("Mais vendidos do mês", { icon: "star", actions: btn("Relatórios", { size: "sm", icon: "arrowr", onclick: () => ctx.go("relatorios") }) },
      hbars(top.map(([id, x]) => ({ label: window.DOG.products[id]?.name || id, value: x.sales, sub: `${num(x.qty)} vendidos · CMV ${pct(x.cost / x.sales, 0)}`, tone: x.cost / x.sales > 0.4 ? "bad" : x.cost / x.sales > CMV_IDEAL ? "warn" : "ok" }))));
    const ch = Object.entries(d.s.byChannel).sort((a, b) => b[1].sales - a[1].sales);
    const cp = card("De onde vêm as vendas", { icon: "store", sub: "Este mês, por canal", actions: btn("Lucro por canal", { size: "sm", icon: "arrowr", onclick: () => ctx.go("financeiro", "canais") }) },
      h("div", { class: "stackbar" }, ch.map(([k, x]) => h("i", { class: "ch-" + k, style: { flex: String(x.sales) }, title: CHANNELS[k]?.label }))),
      h("ul", { class: "ch-list" }, ch.map(([k, x]) => h("li", {}, h("span", { class: "ch-dot ch-" + k }), h("span", { class: "ch-n" }, CHANNELS[k]?.label || k), h("span", { class: "muted" }, x.count + " ped."), h("strong", {}, BRL0(x.sales)), h("span", { class: "muted ch-p" }, pct(x.sales / d.sales, 0))))),
      h("p", { class: "note" }, icon("info", 16), " Cada pedido do iFood custa ~15% em taxas. No site próprio, a taxa é zero."));

    return h("div", { class: "grid-home" }, kpis,
      h("div", { class: "row r-sum" }, summary, now$),
      h("div", { class: "row r-chart" }, h("div", { class: "stack-lg" }, chart, h("div", { class: "row r-2" }, tp, cp)), al));
  }
};
