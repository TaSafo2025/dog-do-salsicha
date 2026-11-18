/* Configurações — loja (abrir/fechar/pausar), tempos, horários, taxas por quadra, equipe e permissões, demonstração */
import * as store from "../store.js";
import { h, icon, BRL, fmtTime, norm, WDL, fmtDT } from "./dom.js";
import { FEES } from "./calc.js";
import { card, btn, toast, confirmBox, input, field, seg, toggle, chip, pill, avatar } from "./ui.js";
import { generateDemo, resetAll } from "./demo.js";

const ui = { zq: "" };
const ROLES = { dono: ["Dona", "brand"], caixa: ["Caixa", "info"], cozinha: ["Cozinha", "warn"], motoboy: ["Motoboy", "neutral"] };
const PERMS = [["Pedidos e PDV", [1, 1, 0, 0]], ["Cozinha (KDS)", [1, 1, 1, 0]], ["Entregas do dia", [1, 1, 0, 1]], ["Caixa (abrir/fechar)", [1, 1, 0, 0]], ["Cardápio e preços", [1, 0, 0, 0]], ["Estoque: entradas e perdas", [1, 1, 1, 0]], ["Financeiro e lucro", [1, 0, 0, 0]], ["Clientes e campanhas", [1, 1, 0, 0]], ["Configurações", [1, 0, 0, 0]]];

export default {
  id: "config", deps: ["config"],
  render(ctx) {
    const cfg = ctx.state.config; const st = store.storeOpen();
    const set = (patch, msg) => { store.update("config", (c) => ({ ...c, ...patch })); if (msg) toast(msg); };
    const mode = cfg.pausedUntil && cfg.pausedUntil > Date.now() ? "pausa" : cfg.open === true ? "aberta" : cfg.open === false ? "fechada" : "auto";
    const hours = window.DOG.store.hours; const H = cfg.hours || hours;

    const loja = card("Loja", { icon: "store", sub: "O que você mudar aqui vale na hora para o site" },
      h("div", { class: "st-big st-" + (st.open ? "ok" : st.reason === "pausa" ? "warn" : "bad") }, icon(st.open ? "store" : st.reason === "pausa" ? "pause" : "moon", 26),
        h("div", {}, h("strong", {}, st.open ? "Aberta — recebendo pedidos" : st.reason === "pausa" ? "Pausada até " + fmtTime(cfg.pausedUntil) : st.reason === "manual" ? "Fechada manualmente" : "Fechada pelo horário"), h("small", {}, mode === "auto" ? "Seguindo o horário de funcionamento" : "Controle manual ativo"))),
      h("div", { class: "st-btns" },
        btn("Abrir agora", { kind: mode === "aberta" ? "primary" : "ghost", icon: "power", onclick: () => set({ open: true, pausedUntil: null }, "Loja aberta.") }),
        btn("Pausar 20 min", { kind: mode === "pausa" ? "primary" : "ghost", icon: "pause", onclick: () => set({ pausedUntil: Date.now() + 20 * 60000 }, "Pausado por 20 min — o site mostra “volta já”.") }),
        btn("Fechar", { kind: mode === "fechada" ? "danger" : "ghost", icon: "x", onclick: () => set({ open: false, pausedUntil: null }, "Loja fechada.") }),
        btn("Automático", { kind: mode === "auto" ? "primary" : "ghost", icon: "clock", onclick: () => set({ open: null, pausedUntil: null }, "Seguindo o horário.") })),
      h("div", { class: "row2" },
        field("Tempo de preparo (min)", input({ type: "number", min: 5, max: 120, value: cfg.prepMin ?? 30, onchange: (e) => set({ prepMin: +e.target.value }, "Tempo de preparo atualizado.") }), "Aparece para quem retira no balcão"),
        field("Tempo de entrega (min)", input({ type: "number", min: 10, max: 180, value: cfg.deliveryMin ?? 60, onchange: (e) => set({ deliveryMin: +e.target.value }, "Tempo de entrega atualizado.") }), "Aumente em noites cheias")));

    const horario = card("Horário de funcionamento", { icon: "clock", sub: "Pedido mínimo " + BRL(window.DOG.store.minOrder) },
      h("ul", { class: "hours" }, [2, 3, 4, 5, 6, 0, 1].map((d) => { const v = H[String(d)];
        return h("li", {}, h("span", { class: "hd" }, WDL[d]), v ? [input({ type: "time", value: v[0], "aria-label": "Abre " + WDL[d], onchange: (e) => set({ hours: { ...H, [d]: [e.target.value, v[1]] } }, "Horário salvo.") }), h("span", { class: "muted" }, "às"), input({ type: "time", value: v[1], "aria-label": "Fecha " + WDL[d], onchange: (e) => set({ hours: { ...H, [d]: [v[0], e.target.value] } }, "Horário salvo.") })] : h("span", { class: "chip" }, "Fechado")); })),
      h("p", { class: "note" }, icon("info", 16), " No esboço o site segue o horário cadastrado no cardápio; esta tela mostra como a dona vai ajustar."));

    const zones = window.DOG.zones; const q = norm(ui.zq);
    const found = q ? zones.filter((z) => norm(z.name).includes(q)).slice(0, 40) : zones.filter((z) => /^QN 3(0|1)\d Samambaia Sul/.test(z.name)).slice(0, 12);
    const byFee = {}; for (const z of zones) byFee[z.fee] = (byFee[z.fee] || 0) + 1;
    const taxas = card("Taxas de entrega por quadra", { icon: "map", sub: zones.length + " quadras atendidas" },
      h("div", { class: "fee-sum" }, Object.entries(byFee).sort((a, b) => a[0] - b[0]).map(([f, n]) => h("span", { class: "fee-b" }, h("strong", {}, BRL(+f).replace(",00", "")), h("small", {}, n + " quadras")))),
      h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar quadra (ex.: QR 607, QN 412)", value: ui.zq, dataset: { fk: "zq" }, "aria-label": "Buscar quadra", oninput: (e) => { ui.zq = e.target.value; ctx.rerender(); } })),
      h("ul", { class: "zones" }, found.map((z) => h("li", {}, h("span", {}, z.name), h("span", { class: "zfee" }, h("span", { class: "rs" }, "R$"), input({ type: "number", min: 0, step: 0.5, value: z.fee, "aria-label": "Taxa para " + z.name,
        onchange: (e) => { const v = +e.target.value; store.update("config", (c) => { const zf = { ...(c.zoneFees || {}) }; if (v === z.feeOriginal) delete zf[z.name]; else zf[z.name] = v; return { ...c, zoneFees: zf }; }); toast(`${z.name}: taxa ${BRL(v)}.`); } })),
        cfg.zoneFees?.[z.name] != null ? chip("alterada", "warn") : null))), found.length ? null : h("p", { class: "muted" }, "Nenhuma quadra encontrada — fora da área de entrega."));

    const team = cfg.team || [];
    const equipe = card("Equipe e permissões", { icon: "users", sub: "Cada pessoa entra com o próprio PIN e só vê o que precisa (ilustrativo)" },
      h("ul", { class: "team" }, team.map((t) => h("li", {}, avatar(t.name), h("div", {}, h("strong", {}, t.name), h("small", {}, t.phone ? "+" + t.phone.replace(/^(\d{2})(\d{2})(\d{5})(\d{4})$/, "$1 ($2) $3-$4") : "")), chip(ROLES[t.role]?.[0] || t.role, ROLES[t.role]?.[1])))),
      h("div", { class: "tbl-wrap" }, h("table", { class: "tbl perms" }, h("thead", {}, h("tr", {}, h("th", {}, "Pode acessar"), Object.values(ROLES).map(([n]) => h("th", { class: "num" }, n)))),
        h("tbody", {}, PERMS.map(([a, p]) => h("tr", {}, h("td", {}, a), p.map((v) => h("td", { class: "num" }, v ? h("span", { class: "perm y" }, icon("check", 16)) : h("span", { class: "perm n" }, icon("minus", 16))))))))),
      h("div", { class: "row-end" }, btn("Convidar pessoa", { icon: "plus", onclick: () => toast("No esboço o convite é ilustrativo.", { kind: "info" }) })));

    const taxasPg = card("Taxas cobradas de você", { icon: "card", sub: "Usadas para calcular o lucro de verdade" },
      h("ul", { class: "fees" }, h("li", {}, h("span", {}, "Maquininha — crédito"), h("strong", {}, "3,2%")), h("li", {}, h("span", {}, "Maquininha — débito"), h("strong", {}, "1,5%")), h("li", {}, h("span", {}, "Pix"), h("strong", {}, "grátis")),
        h("li", {}, h("span", {}, "iFood Plano Básico — comissão"), h("strong", {}, "12%")), h("li", {}, h("span", {}, "iFood — pagamento online"), h("strong", {}, "3,2%")), h("li", {}, h("span", {}, "iFood — mensalidade"), h("strong", {}, "R$ 110,00"))));

    const demo = card("Demonstração", { icon: "sparkle", sub: cfg.demo?.generatedAt ? "Dados de exemplo gerados em " + fmtDT(cfg.demo.generatedAt) : "Sem dados de exemplo", cls: "demo-card" },
      h("p", {}, "Gera ~45 dias de movimento realista (pedidos de terça a domingo, compras, perdas, contas e clientes de quadras reais) para mostrar o painel funcionando."),
      h("div", { class: "row-end" },
        btn("Zerar demonstração", { kind: "danger-ghost", icon: "trash", onclick: async () => { if (await confirmBox("Zerar tudo?", "Apaga pedidos, estoque movimentado, contas e clientes deste navegador.", "Zerar", "danger")) { resetAll(); toast("Demonstração zerada.", { kind: "warn" }); ctx.go("inicio"); } } }),
        btn("Gerar dados de exemplo", { kind: "primary", icon: "refresh", onclick: async () => { if (await confirmBox("Gerar dados de exemplo?", "Substitui os dados atuais por ~45 dias de movimento simulado.", "Gerar")) { const r = generateDemo(); toast(`Pronto: ${r.orders} pedidos de exemplo.`); ctx.go("inicio"); } } })));

    return h("div", { class: "cfg-grid" }, h("div", { class: "stack-lg" }, loja, horario, taxasPg, demo), h("div", { class: "stack-lg" }, taxas, equipe));
  }
};
