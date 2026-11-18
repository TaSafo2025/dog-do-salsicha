/* Cozinha (KDS) — tela grande e escura, itens e adicionais em destaque, botão Pronto */
import { h, icon, fmtTime } from "./dom.js";
import { CHANNELS, MODES } from "./calc.js";
import { btn } from "./ui.js";
import { itemsText, ready, accept, modeText } from "./pedidos.js";

export default {
  id: "cozinha", deps: ["orders"],
  render(ctx) {
    const list = ctx.state.orders.filter((o) => o.status === "preparo" || o.status === "aceito").sort((a, b) => a.createdAt - b.createdAt);
    const waiting = ctx.state.orders.filter((o) => o.status === "novo");
    const readyN = ctx.state.orders.filter((o) => o.status === "pronto").length;
    // contagem consolidada: o que a chapa precisa fazer agora
    const tally = {};
    for (const o of list) for (const l of o.lines) { const p = window.DOG.products[l.productId]; if (p?.combo) for (const inc of p.combo.includes) { const n = window.DOG.products[inc.product]?.name; if (n && !/Refri|Coca|Água/.test(n)) tally[n] = (tally[n] || 0) + inc.qty * l.qty; } else if (!/coca|refri|agua|suco|mineiro|balinha|pudim/.test(l.productId)) tally[l.name] = (tally[l.name] || 0) + l.qty; }
    const root = h("div", { class: "kds" },
      h("div", { class: "kds-top" },
        h("div", { class: "kds-stat" }, h("strong", {}, String(list.length)), h("span", {}, "na chapa")),
        h("div", { class: "kds-stat" }, h("strong", {}, String(readyN)), h("span", {}, "prontos aguardando")),
        waiting.length ? h("button", { type: "button", class: "kds-wait", onclick: () => ctx.go("pedidos") }, icon("bell", 18), `${waiting.length} novo${waiting.length > 1 ? "s" : ""} esperando aceite`) : null,
        h("div", { class: "kds-tally", "aria-label": "Total a produzir" }, Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([n, q]) => h("span", { class: "kt" }, h("b", {}, q + "×"), " " + n))),
        btn("Tela cheia", { kind: "on-dark-ghost", icon: "expand", onclick: () => { const el = document.querySelector(".kds"); (document.fullscreenElement ? document.exitFullscreen() : el?.requestFullscreen?.())?.catch?.(() => {}); } })),
      list.length ? h("div", { class: "kds-grid" }, list.map((o, idx) => h("article", { class: "kc" },
        h("header", { class: "kc-h" }, h("span", { class: "kc-n" }, "#" + o.id.replace(/\D/g, "").slice(-3)), h("div", { class: "kc-meta" }, h("strong", {}, o.customer?.name || ""), h("span", {}, (CHANNELS[o.channel]?.short || "") + " · " + (o.mode === "delivery" ? "Entrega" : modeText(o)))),
          h("span", { class: "kc-t mono", dataset: { since: o.history?.find((x) => x.status === "preparo")?.at || o.createdAt, warn: 15, bad: 25 } }, "")),
        h("ul", { class: "kc-items" }, o.lines.map((l) => { const t = itemsText(l); const p = window.DOG.products[l.productId];
          return h("li", {}, h("div", { class: "kc-l" }, h("span", { class: "kc-q" }, l.qty + "×"), h("span", { class: "kc-name" }, l.name)),
            p?.combo ? h("div", { class: "kc-sub" }, p.combo.includes.map((i) => i.qty + "× " + (window.DOG.products[i.product]?.name || "")).join(" · ")) : null,
            t.add.map((a) => h("div", { class: "kc-add" }, "+ " + a)), t.rem.map((a) => h("div", { class: "kc-rem" }, a.toUpperCase())), l.note ? h("div", { class: "kc-note" }, "“" + l.note + "”") : null); })),
        o.note ? h("p", { class: "kc-obs" }, icon("info", 16), " " + o.note) : null,
        h("footer", { class: "kc-f" }, h("span", { class: "muted" }, "Entrou " + fmtTime(o.createdAt)), btn("Pronto", { kind: "ok", icon: "check", size: "lg", onclick: () => ready(o) }))))) :
        h("div", { class: "kds-empty" }, icon("flame", 40), h("p", {}, "Chapa livre. Os pedidos aceitos aparecem aqui na hora."),
          waiting[0] ? btn("Aceitar " + waiting[0].id, { kind: "primary", icon: "check", onclick: () => accept(waiting[0]) }) : null));
    return root;
  }
};
