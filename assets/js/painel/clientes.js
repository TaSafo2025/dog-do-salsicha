/* Clientes — lista, segmentos (novos, frequentes, sumidos), opt-in de WhatsApp, campanha */
import * as store from "../store.js";
import { h, icon, BRL, BRL0, pct, fmtDate, DAY, phoneFmt, norm, ago } from "./dom.js";
import { card, btn, toast, seg, kpi, table, toggle, chip, avatar } from "./ui.js";

const ui = { seg: "todos", q: "", sort: "spent" };
export function segmentOf(c, now = Date.now()) {
  if (c.last < now - 30 * DAY) return c.orders >= 2 ? "sumido" : "ocasional";
  if (c.first > now - 14 * DAY) return "novo";
  if (c.orders >= 4) return "frequente";
  return "ocasional";
}
export const SEG = { novo: ["Novo", "info"], frequente: ["Frequente", "ok"], sumido: ["Sumido +30 dias", "bad"], ocasional: ["Ocasional", "neutral"] };
export const campaignState = { segment: null };

export default {
  id: "clientes", deps: ["customers", "orders"],
  render(ctx) {
    const sub = ctx.route()[1]; if (sub && ui._sub !== sub) { ui.seg = sub; ui._sub = sub; }
    const now = Date.now(); const all = Object.values(ctx.state.customers || {}).filter((c) => c.orders > 0).map((c) => ({ ...c, seg: segmentOf(c, now) }));
    const count = (s) => all.filter((c) => c.seg === s).length;
    let list = all.filter((c) => ui.seg === "todos" ? true : ui.seg === "optin" ? c.optIn : c.seg === ui.seg);
    if (ui.q) { const q = norm(ui.q); list = list.filter((c) => norm(c.name + " " + c.phone + " " + (c.quadra || "")).includes(q)); }
    list.sort((a, b) => ui.sort === "last" ? b.last - a.last : ui.sort === "orders" ? b.orders - a.orders : b.spent - a.spent);
    const rec = all.filter((c) => c.orders >= 2).length; const opt = all.filter((c) => c.optIn).length;
    const spent = all.reduce((a, c) => a + c.spent, 0); const ords = all.reduce((a, c) => a + c.orders, 0);
    const sumidosValue = all.filter((c) => c.seg === "sumido").reduce((a, c) => a + c.spent / Math.max(1, (c.last - c.first) / (30 * DAY) || 1), 0);
    return h("div", { class: "stack-lg" },
      h("div", { class: "kpis k4" },
        kpi({ label: "Clientes com telefone", value: String(all.length), icon: "users", sub: "site, WhatsApp e balcão" }),
        kpi({ label: "Voltam a pedir", value: pct(rec / Math.max(1, all.length), 0), icon: "refresh", tone: "good", sub: rec + " fizeram 2 ou mais pedidos" }),
        kpi({ label: "Aceitam WhatsApp", value: String(opt), icon: "chat", sub: pct(opt / Math.max(1, all.length), 0) + " podem receber promoções" }),
        kpi({ label: "Sumidos +30 dias", value: String(count("sumido")), icon: "alert", tone: count("sumido") ? "warn" : "", sub: "~" + BRL0(sumidosValue) + "/mês que deixou de entrar", onclick: () => { ui.seg = "sumido"; ctx.rerender(); } })),
      h("p", { class: "note" }, icon("info", 16), " Clientes do iFood não aparecem aqui: o iFood não passa o telefone. Cada pedido pelo site ou WhatsApp vira um cliente seu."),
      card(null, {},
        h("div", { class: "toolbar slim" },
          h("div", { class: "tb-f" }, h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar nome, telefone ou quadra", value: ui.q, dataset: { fk: "clq" }, "aria-label": "Buscar cliente", oninput: (e) => { ui.q = e.target.value; ctx.rerender(); } })),
            seg([["todos", "Todos " + all.length], ["novo", "Novos " + count("novo")], ["frequente", "Frequentes " + count("frequente")], ["sumido", "Sumidos " + count("sumido")], ["optin", "Opt-in " + opt]], ui.seg, (v) => { ui.seg = v; ctx.rerender(); }, "seg-sm")),
          h("div", { class: "tb-f" }, h("label", { class: "inline" }, "Ordenar ", h("select", { class: "inp", "aria-label": "Ordenar", onchange: (e) => { ui.sort = e.target.value; ctx.rerender(); } }, [["spent", "Mais gastou"], ["orders", "Mais pedidos"], ["last", "Compra mais recente"]].map(([v, l]) => h("option", { value: v, selected: ui.sort === v }, l)))),
            btn("Criar campanha", { kind: "primary", icon: "send", onclick: () => { campaignState.segment = ui.seg === "todos" || ui.seg === "optin" ? "todos" : ui.seg; ctx.go("whatsapp", "campanha"); } }))),
        table([
          { label: "Cliente", render: (c) => h("div", { class: "cust" }, avatar(c.name), h("div", {}, h("strong", {}, c.name), h("small", {}, phoneFmt(c.phone) + (c.quadra ? " · " + c.quadra.replace(" Samambaia Sul", "").replace(" Samambaia Norte", "") : "")))) },
          { label: "Segmento", render: (c) => chip(SEG[c.seg][0], SEG[c.seg][1]) },
          { label: "Pedidos", cls: "num mono", render: (c) => String(c.orders) },
          { label: "Gastou", cls: "num mono", render: (c) => BRL(c.spent) },
          { label: "Ticket", cls: "num mono", render: (c) => BRL(c.spent / c.orders) },
          { label: "Última compra", cls: "nowrap", render: (c) => h("span", { class: c.seg === "sumido" ? "t-bad" : "" }, fmtDate(c.last) + " · " + (/ontem|agora/.test(ago(c.last, now)) ? "" : "há ") + ago(c.last, now)) },
          { label: "WhatsApp", render: (c) => toggle(!!c.optIn, (v) => { store.update("customers", (m) => ({ ...m, [c.phone]: { ...m[c.phone], optIn: v } })); toast(v ? c.name + " aceita promoções no WhatsApp." : c.name + " não recebe mais promoções."); }, c.optIn ? "Aceita" : "Não") },
          { label: "", cls: "act", render: (c) => h("a", { class: "btn btn-ghost btn-sm", href: "https://wa.me/" + c.phone.replace(/^(?!55)/, "55") + "?text=" + encodeURIComponent(`Oi, ${c.name.split(" ")[0]}! Aqui é do Dog do Salsicha 🌭 `), target: "_blank", rel: "noopener", "aria-label": "Conversar com " + c.name }, icon("chat", 16), h("span", {}, "Conversar")) }
        ], list.slice(0, 80), { empty: "Nenhum cliente neste filtro." })),
      h("p", { class: "muted small" }, `Total gasto por esses clientes: ${BRL(spent)} em ${ords} pedidos.`));
  }
};
