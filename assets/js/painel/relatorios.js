/* Relatórios — produto, horário (mapa de calor), canal, ticket, engenharia de cardápio */
import * as store from "../store.js";
import { h, icon, BRL, BRL0, pct, num, DAY, startOfDay, WD, WDL } from "./dom.js";
import { summarize, CHANNELS, valid, productCost, CMV_IDEAL } from "./calc.js";
import { card, seg, kpi, table, chip } from "./ui.js";
import { heatmap, hbars, matrix, bars } from "./charts.js";

const ui = { days: 30, sort: "sales" };
const Q = {
  star: ["Estrelas", "Vende muito e lucra bem", "Mantenha o padrão e destaque no topo do cardápio.", "ok"],
  horse: ["Burros de carga", "Vende muito, mas lucra pouco", "Suba um pouco o preço ou ajuste a porção (ficha técnica).", "warn"],
  puzzle: ["Quebra-cabeças", "Lucra bem, mas vende pouco", "Divulgue: foto melhor, posição no cardápio, combo.", "info"],
  dog: ["Cães", "Vende pouco e lucra pouco", "Pense em tirar do cardápio ou repaginar.", "bad"]
};

export default {
  id: "relatorios", deps: ["orders", "config"],
  render(ctx) {
    const { state } = ctx; const now = Date.now(); const from = startOfDay(now) - (ui.days - 1) * DAY;
    const s = summarize(state.orders, state.config, from, now + DAY);
    const items = s.orders.reduce((a, o) => a + o.lines.reduce((b, l) => b + l.qty, 0), 0);
    const prevS = summarize(state.orders, state.config, from - ui.days * DAY, from);
    const histOk = from - ui.days * DAY >= (state.config.demo?.start || 0) - DAY;
    const tr = (a, b) => b && histOk ? { dir: a >= b ? "up" : "down", text: pct(Math.abs(a / b - 1), 0) + " vs período anterior" } : null;

    // produtos
    const P = window.DOG.products;
    const prod = Object.entries(s.byProduct).map(([id, x]) => ({ id, name: P[id]?.name || id, ...x, left: x.sales - x.cost, cmv: x.cost / x.sales })).sort((a, b) => b[ui.sort] - a[ui.sort]);

    // mapa de calor: dias de funcionamento × hora
    const rows = [2, 3, 4, 5, 6, 0]; const hours = [18, 19, 20, 21, 22, 23];
    const grid = rows.map(() => hours.map(() => ({ n: 0, v: 0 }))); const daysCount = rows.map(() => new Set());
    for (const o of s.orders) { const d = new Date(o.createdAt); const ri = rows.indexOf(d.getDay()); const hi = hours.indexOf(d.getHours()); if (ri < 0 || hi < 0) continue; grid[ri][hi].n++; grid[ri][hi].v += o.total; daysCount[ri].add(startOfDay(o.createdAt)); }
    const hm = heatmap(rows.map((r) => WDL[r].replace("-feira", "")), hours.map((x) => x + "h"), (i, j) => { const c = grid[i][j]; const dn = Math.max(1, daysCount[i].size); return { v: c.n / dn, short: num(c.n / dn, 1), label: num(c.n / dn, 1) + " pedidos por noite", more: [BRL(c.v / dn) + " por noite", c.n + " pedidos no período"] }; });
    let peak = { v: 0 }; rows.forEach((r, i) => hours.forEach((x, j) => { const v = grid[i][j].n / Math.max(1, daysCount[i].size); if (v > peak.v) peak = { v, r, x }; }));

    // canais
    const ch = Object.entries(s.byChannel).sort((a, b) => b[1].sales - a[1].sales);
    // ticket por dia da semana
    const wdT = rows.map((r) => { const os = s.orders.filter((o) => new Date(o.createdAt).getDay() === r); const v = os.reduce((a, o) => a + o.total, 0); return { r, t: os.length ? v / os.length : 0, n: os.length, v }; });

    // engenharia de cardápio (lanches, combos e batatas)
    const cats = new Set(["hot-dogs", "hamburgueres", "combos", "batatas"]);
    const eligible = new Set(window.DOG.cats.filter((c) => cats.has(c.id)).flatMap((c) => c.items));
    const eng = prod.filter((p) => eligible.has(p.id) && p.qty > 0).map((p) => ({ ...p, unit: p.left / p.qty, m: p.left / p.sales }));
    const totQ = eng.reduce((a, p) => a + p.qty, 0); const xCut = (totQ / Math.max(1, eng.length)) * 0.7; const yCut = eng.reduce((a, p) => a + p.left, 0) / Math.max(1, eng.reduce((a, p) => a + p.sales, 0));
    for (const p of eng) p.q = p.qty >= xCut ? (p.m >= yCut ? "star" : "horse") : (p.m >= yCut ? "puzzle" : "dog");
    const short = (n) => n.replace("Combo ", "").replace("Batata cheddar & bacon", "Batata c&b").replace("Frango desfiado", "Frango").replace("Batata frita", "Batata");

    return h("div", { class: "stack-lg" },
      h("div", { class: "toolbar slim" }, h("p", { class: "muted" }, "Período analisado"), seg([[7, "7 dias"], [14, "14 dias"], [30, "30 dias"], [45, "45 dias"]], ui.days, (v) => { ui.days = v; ctx.rerender(); }, "seg-sm")),
      h("div", { class: "kpis k4" },
        kpi({ label: "Vendas", value: BRL0(s.sales), icon: "chart", trend: tr(s.sales, prevS.sales) }),
        kpi({ label: "Pedidos", value: num(s.count), icon: "orders", trend: tr(s.count, prevS.count), sub: num(s.count / Math.max(1, new Set(s.orders.map((o) => startOfDay(o.createdAt))).size), 0) + " por noite" }),
        kpi({ label: "Ticket médio", value: BRL(s.ticket), icon: "tag", trend: tr(s.ticket, prevS.ticket) }),
        kpi({ label: "Itens por pedido", value: num(items / Math.max(1, s.count), 1), icon: "package", sub: "oferecer batata e bebida aumenta o ticket" })),
      h("div", { class: "row r-2" },
        card("Quando o movimento acontece", { icon: "clock", sub: peak.r != null ? `Pico: ${WDL[peak.r]} às ${peak.x}h, com ~${num(peak.v, 1)} pedidos por noite nessa hora` : "", cls: "span2" }, hm,
          h("p", { class: "muted small" }, "Média de pedidos por noite em cada horário. Use para escalar equipe e motoboy e para programar promoções nos horários fracos.")),
        card("Vendas por canal", { icon: "store" }, hbars(ch.map(([k, x]) => ({ label: CHANNELS[k]?.label || k, value: x.sales, sub: `${x.count} pedidos · ticket ${BRL(x.sales / x.count)} · ${pct(x.sales / s.sales, 0)}`, tone: "ch-" + k })))),
        card("Ticket médio por dia", { icon: "tag" }, bars(wdT.map((x) => ({ label: WD[x.r], value: x.t, tip: [WDL[x.r], "Ticket " + BRL(x.t), x.n + " pedidos"], tone: x.r === 5 || x.r === 6 ? "wk" : "" })), { height: 200, fmt: (v) => "R$" + Math.round(v), label: "Ticket médio por dia da semana" }))),
      card("Engenharia de cardápio", { icon: "grid", sub: "Cada ponto é um lanche: quanto vende (→) e quanto sobra do preço depois dos ingredientes (↑)" },
        h("div", { class: "eng" },
          matrix(eng.map((p) => ({ x: p.qty, y: p.m * 100, cls: "q-" + p.q, short: short(p.name), tip: [p.name, `${p.qty} vendidos`, `de cada R$ 100, sobram ${BRL(p.m * 100)}`, `sobra ${BRL(p.unit)} por unidade`, Q[p.q][0]] })),
            { xCut, yCut: yCut * 100, ymin: 30, ymax: 75, yFmt: (v) => Math.round(v) + "%", labels: ["Estrelas", "Burros de carga", "Quebra-cabeças", "Cães"], xLabel: "Unidades vendidas no período", yLabel: "Sobra (% do preço)" }),
          h("div", { class: "eng-q" }, Object.entries(Q).map(([k, [n, d, a, tone]]) => { const ps = eng.filter((p) => p.q === k).sort((a, b) => b.qty - a.qty);
            return h("div", { class: "eq eq-" + k }, h("div", { class: "eq-h" }, h("i", { class: "eq-dot q-" + k }), h("strong", {}, n), h("span", { class: "muted" }, " · " + d)), h("p", { class: "eq-a" }, a),
              h("p", { class: "eq-p" }, ps.length ? ps.map((p) => short(p.name)).join(", ") : "—")); })))),
      card("Vendas por produto", { icon: "list", actions: seg([["sales", "Faturamento"], ["qty", "Quantidade"], ["left", "Sobra"]], ui.sort, (v) => { ui.sort = v; ctx.rerender(); }, "seg-sm") },
        table([
          { label: "#", cls: "num muted", render: (p, i) => String(i + 1) },
          { label: "Produto", render: (p) => h("strong", {}, p.name) },
          { label: "Vendidos", cls: "num mono", render: (p) => num(p.qty) },
          { label: "Faturamento", cls: "num mono", render: (p) => BRL(p.sales) },
          { label: "Ingredientes", cls: "num mono", render: (p) => BRL(p.cost) },
          { label: "Sobra", cls: "num mono strong", render: (p) => BRL(p.left) },
          { label: "CMV", cls: "num", render: (p) => h("span", { class: "cmv cmv-" + (p.cmv > 0.4 ? "bad" : p.cmv > CMV_IDEAL ? "warn" : "ok") }, h("i", { class: "sem " + (p.cmv > 0.4 ? "bad" : p.cmv > CMV_IDEAL ? "warn" : "ok") }), pct(p.cmv, 0)) },
          { label: "% das vendas", cls: "num mono", render: (p) => pct(p.sales / s.sales, 1) }
        ], prod.slice(0, 25))));
  }
};
