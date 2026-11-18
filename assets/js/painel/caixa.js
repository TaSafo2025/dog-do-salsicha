/* Caixa — abertura/fechamento do dia, sangria/suprimento, conferência por forma de pagamento */
import * as store from "../store.js";
import { h, icon, clear, BRL, BRL0, fmtTime, fmtDateLong, fmtDT } from "./dom.js";
import { cashSessions, payMethod, PAY, valid } from "./calc.js";
import { card, btn, toast, modal, input, field, kpi, table, pill, empty } from "./ui.js";

const METHODS = ["dinheiro", "pix", "credito", "debito"];
const MICON = { dinheiro: "cash", pix: "pix", credito: "card", debito: "card" };
const parse = (v) => parseFloat(String(v || "").replace(/\./g, "").replace(",", ".")) || 0;

function expected(state, s) {
  const end = s.closedAt || Date.now(); const exp = { dinheiro: 0, pix: 0, credito: 0, debito: 0 }; let n = 0;
  for (const o of state.orders) if (valid(o) && o.channel !== "ifood" && o.createdAt >= s.openedAt && o.createdAt < end) { const m = payMethod(o); if (m in exp) { exp[m] += o.total; n++; } }
  const sang = (s.moves || []).filter((m) => m.type === "sangria").reduce((a, m) => a + m.amount, 0);
  const sup = (s.moves || []).filter((m) => m.type === "suprimento").reduce((a, m) => a + m.amount, 0);
  return { exp, n, sang, sup, drawer: s.openAmount + exp.dinheiro + sup - sang, total: Object.values(exp).reduce((a, b) => a + b, 0) };
}
const upd = (id, fn) => store.update("finance", (f) => f.map((x) => x.id === id ? fn(x) : x));

function moveModal(s, type) {
  const v = input({ inputmode: "decimal", placeholder: "0,00", "aria-label": "Valor" }); const n = input({ placeholder: type === "sangria" ? "Ex.: levar para o cofre" : "Ex.: troco extra", "aria-label": "Motivo" });
  modal({ title: type === "sangria" ? "Sangria (retirar dinheiro)" : "Suprimento (colocar dinheiro)", size: "sm", body: h("div", { class: "stack" }, field("Valor (R$)", v), field("Motivo", n)),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Registrar", kind: "primary", onclick: (c) => { const a = parse(v.value); if (!(a > 0)) return;
      upd(s.id, (x) => ({ ...x, moves: [...(x.moves || []), { type, amount: a, at: Date.now(), note: n.value.trim() }] })); c(); toast((type === "sangria" ? "Sangria" : "Suprimento") + " de " + BRL(a) + " registrada."); } }] });
}
function closeModal(ctx, s) {
  const e = expected(ctx.state, s); const inputs = {}; const diffEls = {}; const totEl = h("strong", {});
  const exp = { ...e.exp, dinheiro: e.drawer };
  const refresh = () => { let tot = 0; for (const m of METHODS) { const d = parse(inputs[m].value) - exp[m]; tot += d; diffEls[m].textContent = (d > 0 ? "+" : "") + BRL(d); diffEls[m].className = "mono " + (Math.abs(d) < 0.01 ? "t-ok" : d < 0 ? "t-bad" : "t-warn"); }
    totEl.textContent = (tot > 0 ? "+" : "") + BRL(tot); totEl.className = Math.abs(tot) < 0.01 ? "t-ok" : tot < 0 ? "t-bad" : "t-warn"; };
  const rows = METHODS.map((m) => { inputs[m] = input({ inputmode: "decimal", value: m === "dinheiro" ? "" : exp[m].toFixed(2).replace(".", ","), placeholder: m === "dinheiro" ? "Conte as notas" : "", "aria-label": "Contado em " + PAY[m], oninput: refresh }); diffEls[m] = h("span", { class: "mono" });
    return h("div", { class: "conf-r" }, h("span", { class: "conf-m" }, icon(MICON[m], 18), PAY[m], m === "dinheiro" ? h("small", {}, "na gaveta (com fundo de troco)") : h("small", {}, m === "pix" ? "confira no extrato" : "confira na maquininha")),
      h("span", { class: "mono" }, BRL(exp[m])), inputs[m], diffEls[m]); });
  const note = input({ placeholder: "Observação (opcional)", "aria-label": "Observação" });
  refresh();
  modal({ title: "Fechar o caixa", sub: "Confira o que entrou em cada forma de pagamento", size: "md",
    body: h("div", { class: "stack" }, h("div", { class: "conf" }, h("div", { class: "conf-r conf-h" }, h("span", {}, "Forma"), h("span", {}, "Esperado"), h("span", {}, "Contado"), h("span", {}, "Diferença")), rows,
      h("div", { class: "conf-r conf-t" }, h("span", {}, "Diferença total"), h("span", {}), h("span", {}), totEl)), note),
    actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: "Fechar caixa", kind: "primary", icon: "lock", onclick: (c) => {
      const counted = Object.fromEntries(METHODS.map((m) => [m, parse(inputs[m].value)]));
      upd(s.id, (x) => ({ ...x, closedAt: Date.now(), closedBy: "Dona", counted, note: note.value.trim() })); c(); toast("Caixa fechado."); } }] });
}

export default {
  id: "caixa", deps: ["finance", "orders"],
  render(ctx) {
    const { state } = ctx; const sessions = cashSessions(state.finance); const open = sessions.find((s) => !s.closedAt);
    let top;
    if (!open) {
      const v = input({ inputmode: "decimal", value: "150,00", "aria-label": "Fundo de troco" });
      top = card("Caixa fechado", { icon: "lock", sub: sessions[0] ? "Último fechamento: " + fmtDT(sessions[0].closedAt) : "Nenhum caixa aberto ainda", cls: "cx-open" },
        h("div", { class: "cx-form" }, field("Fundo de troco (R$)", v, "Dinheiro que fica na gaveta para dar troco"),
          btn("Abrir caixa", { kind: "primary", icon: "power", onclick: () => { store.update("finance", (f) => [...f, { kind: "cash", id: "cx-" + Date.now(), openedAt: Date.now(), openAmount: parse(v.value), openedBy: "Dona", moves: [] }]); toast("Caixa aberto com " + BRL(parse(v.value)) + " de troco."); } })));
    } else {
      const e = expected(state, open);
      top = h("div", { class: "stack-lg" },
        h("div", { class: "cx-head" }, h("div", {}, h("span", { class: "pill pill-ok" }, h("i", { class: "dot" }), "Caixa aberto"), h("h2", { class: "cx-t" }, "Aberto às " + fmtTime(open.openedAt) + " por " + (open.openedBy || "—")), h("p", { class: "muted" }, fmtDateLong(open.openedAt) + " · fundo de troco " + BRL(open.openAmount))),
          h("div", { class: "tb-f" }, btn("Sangria", { icon: "down", onclick: () => moveModal(open, "sangria") }), btn("Suprimento", { icon: "up", onclick: () => moveModal(open, "suprimento") }), btn("Fechar caixa", { kind: "primary", icon: "lock", onclick: () => closeModal(ctx, open) }))),
        h("div", { class: "kpis k4" },
          kpi({ label: "Vendido no caixa", value: BRL(e.total), icon: "register", sub: e.n + " pedidos (sem iFood)" }),
          kpi({ label: "Dinheiro na gaveta", value: BRL(e.drawer), icon: "cash", sub: `troco ${BRL0(open.openAmount)} + vendas ${BRL0(e.exp.dinheiro)} − sangria ${BRL0(e.sang)}` + (e.sup ? ` + supr. ${BRL0(e.sup)}` : "") }),
          kpi({ label: "Pix", value: BRL(e.exp.pix), icon: "pix", sub: "sem taxa" }),
          kpi({ label: "Cartões", value: BRL(e.exp.credito + e.exp.debito), icon: "card", sub: `crédito ${BRL0(e.exp.credito)} · débito ${BRL0(e.exp.debito)}` })),
        card("Movimentos do caixa", { icon: "list" }, (open.moves || []).length ? h("ul", { class: "bills" }, open.moves.map((m) => h("li", { class: "bill" }, h("div", { class: "bill-d" }, h("strong", {}, m.type === "sangria" ? "Sangria" : "Suprimento"), h("small", {}, fmtTime(m.at) + (m.note ? " · " + m.note : ""))), h("span", { class: "money " + (m.type === "sangria" ? "t-bad" : "t-ok") }, (m.type === "sangria" ? "− " : "+ ") + BRL(m.amount))))) : empty("Sem sangrias ou suprimentos neste turno.", "cash")));
    }
    const closed = sessions.filter((s) => s.closedAt).slice(0, 12);
    const hist = card("Fechamentos anteriores", { icon: "calendar", sub: "Diferença = contado − esperado (dinheiro, Pix e cartões)" },
      table([
        { label: "Dia", render: (s) => h("strong", {}, fmtDateLong(s.openedAt)) },
        { label: "Horário", cls: "mono", render: (s) => fmtTime(s.openedAt) + "–" + fmtTime(s.closedAt) },
        { label: "Vendas", cls: "num mono", render: (s) => BRL(expected(state, s).total) },
        { label: "Dinheiro esperado", cls: "num mono", render: (s) => BRL(expected(state, s).drawer) },
        { label: "Contado", cls: "num mono", render: (s) => BRL(s.counted?.dinheiro ?? 0) },
        { label: "Diferença", cls: "num", render: (s) => { const e = expected(state, s); const d = METHODS.reduce((a, m) => a + ((s.counted?.[m] ?? 0) - (m === "dinheiro" ? e.drawer : e.exp[m])), 0);
          return h("span", { class: "mono " + (Math.abs(d) < 1 ? "t-ok" : d < 0 ? "t-bad" : "t-warn") }, (d > 0 ? "+" : "") + BRL(d)); } },
        { label: "Obs.", render: (s) => h("span", { class: "muted" }, s.note || "—") }
      ], closed, { empty: "Nenhum fechamento ainda." }));
    return h("div", { class: "stack-lg" }, top, hist);
  }
};
