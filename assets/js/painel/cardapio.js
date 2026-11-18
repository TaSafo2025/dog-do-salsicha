/* Cardápio — preço, custo (ficha técnica), margem, CMV com semáforo, esgotar, mudar preço, ficha editável */
import * as store from "../store.js";
import { h, icon, clear, BRL, pct, num, norm, DAY } from "./dom.js";
import { productCost, recipeOf, originalRecipe, insumo, insumos, insCost, fmtQty, CMV_IDEAL, summarize, FEES, stockStatus } from "./calc.js";
import { card, btn, toggle, toast, modal, input, select, seg, iconBtn, pill } from "./ui.js";

const ui = { filter: "todos", q: "" };
export const cmvTone = (c) => (c > 0.4 ? "bad" : c > CMV_IDEAL ? "warn" : "ok");
const cmvWord = { ok: "Saudável", warn: "Atenção", bad: "Alto" };

function setPrice(pid, v) {
  const base = window.DOG.products[pid].price; const n = Math.round(parseFloat(String(v).replace(",", ".")) * 100) / 100;
  if (!Number.isFinite(n) || n <= 0) { toast("Preço inválido.", { kind: "warn" }); return false; }
  store.update("config", (c) => { const prices = { ...(c.prices || {}) }; if (n === base) delete prices[pid]; else prices[pid] = n; return { ...c, prices }; });
  toast(`${window.DOG.products[pid].name}: novo preço ${BRL(n)} — já vale no site.`); return true;
}
function setOff(pid, off) {
  store.update("config", (c) => { const o = { ...(c.off || {}) }; if (off) o[pid] = true; else delete o[pid]; return { ...c, off: o }; });
  toast(off ? `${window.DOG.products[pid].name} marcado como esgotado no site.` : `${window.DOG.products[pid].name} voltou ao cardápio.`, { kind: off ? "warn" : "ok" });
}
const missing = (pid, stock) => Object.keys(recipeOf(pid)).filter((k) => (stock[k] ?? 0) <= 0).map((k) => insumo(k)?.name).filter(Boolean);

export default {
  id: "cardapio", deps: ["config", "orders", "stock"],
  render(ctx) {
    const { state } = ctx; const cfg = state.config; const P = window.DOG.products; const now = Date.now();
    const sold = summarize(state.orders, cfg, now - 30 * DAY, now).byProduct;
    const rows = Object.keys(P).map((id) => { const p = P[id]; const price = store.priceOf(id); const cost = productCost(id, cfg); const cmv = price ? cost / price : 0;
      return { id, p, price, cost, cmv, margin: price - cost, off: store.isOff(id), baseOff: p.available === false, sold: sold[id]?.qty || 0, miss: missing(id, state.stock), changed: cfg.prices?.[id] != null, edited: !!cfg.recipes?.[id] }; });
    const cats = window.DOG.cats.filter((c) => c.id !== "mais-pedidos");
    const pass = (r) => (ui.filter === "alto" ? r.cmv > CMV_IDEAL : ui.filter === "off" ? r.off : true) && (!ui.q || norm(r.p.name).includes(norm(ui.q)));
    const reds = rows.filter((r) => r.cmv > 0.4 && !r.baseOff); const offs = rows.filter((r) => r.off);
    const w = rows.filter((r) => r.sold); const wCmv = w.reduce((a, r) => a + r.cost * r.sold, 0) / Math.max(1, w.reduce((a, r) => a + r.price * r.sold, 0));

    const head = h("div", { class: "toolbar" },
      h("div", { class: "tb-stats" },
        h("div", { class: "tbs" }, h("span", {}, "Produtos"), h("strong", {}, String(rows.length))),
        h("div", { class: "tbs" }, h("span", {}, "CMV médio (pelo que vende)"), h("strong", { class: "t-" + cmvTone(wCmv) }, pct(wCmv, 1))),
        h("div", { class: "tbs" }, h("span", {}, "CMV acima de 40%"), h("strong", { class: reds.length ? "t-bad" : "" }, String(reds.length))),
        h("div", { class: "tbs" }, h("span", {}, "Esgotados no site"), h("strong", {}, String(offs.length)))),
      h("div", { class: "tb-f" },
        h("label", { class: "search" }, icon("search", 18), h("input", { type: "search", placeholder: "Buscar produto", value: ui.q, dataset: { fk: "cq" }, "aria-label": "Buscar produto", oninput: (e) => { ui.q = e.target.value; ctx.rerender(); } })),
        seg([["todos", "Todos"], ["alto", "CMV alto"], ["off", "Esgotados"]], ui.filter, (v) => { ui.filter = v; ctx.rerender(); }, "seg-sm")));

    const legend = h("div", { class: "cmv-legend" }, h("span", {}, h("i", { class: "sem ok" }), "até 35% — saudável"), h("span", {}, h("i", { class: "sem warn" }), "35% a 40% — atenção"), h("span", {}, h("i", { class: "sem bad" }), "acima de 40% — preço baixo ou porção grande"),
      h("span", { class: "muted" }, "CMV = quanto do preço vai para os ingredientes"));

    const sections = cats.map((c) => {
      const rs = c.items.map((id) => rows.find((r) => r.id === id)).filter(Boolean).filter(pass); if (!rs.length) return null;
      return h("section", { class: "menu-sec" }, h("h3", { class: "menu-cat" }, c.name, h("span", { class: "muted" }, " · " + rs.length)),
        h("div", { class: "mt" }, h("div", { class: "mt-h" }, h("span", {}, "Produto"), h("span", {}, "Preço"), h("span", {}, "Custo"), h("span", {}, "Sobra"), h("span", {}, "CMV"), h("span", {}, "30 dias"), h("span", {}, "No site"), h("span", {}, "")),
          rs.map((r) => {
            const tone = cmvTone(r.cmv);
            const price = h("input", { class: "inp inp-price", value: r.price.toFixed(2).replace(".", ","), inputmode: "decimal", "aria-label": "Preço de " + r.p.name, dataset: { fk: "pr-" + r.id },
              onkeydown: (e) => { if (e.key === "Enter") e.target.blur(); }, onchange: (e) => { if (!setPrice(r.id, e.target.value)) e.target.value = r.price.toFixed(2).replace(".", ","); } });
            return h("div", { class: "mt-r" + (r.off ? " is-off" : "") },
              h("button", { type: "button", class: "mt-p", onclick: () => openFicha(ctx, r.id) }, h("img", { src: r.p.imgSm || r.p.img, alt: "", loading: "lazy", width: 48, height: 48 }),
                h("span", { class: "mt-pn" }, h("strong", {}, r.p.name), h("small", {}, r.edited ? "ficha editada · " : "", r.changed ? "preço alterado · " : "", r.miss.length ? h("span", { class: "t-bad" }, "sem " + r.miss.join(", ").toLowerCase()) : r.p.combo ? r.p.combo.tag : "ver ficha técnica"))),
              h("span", { class: "mt-c", "data-l": "Preço" }, h("span", { class: "rs" }, "R$"), price),
              h("span", { class: "mt-c money", "data-l": "Custo" }, BRL(r.cost)),
              h("span", { class: "mt-c money", "data-l": "Sobra" }, BRL(r.margin)),
              h("span", { class: "mt-c", "data-l": "CMV" }, h("span", { class: "cmv cmv-" + tone, title: cmvWord[tone] }, h("i", { class: "sem " + tone }), pct(r.cmv, 0))),
              h("span", { class: "mt-c mono", "data-l": "30 dias" }, num(r.sold)),
              h("span", { class: "mt-c", "data-l": "No site" }, r.baseOff ? h("span", { class: "chip chip-bad", title: "Indisponível no cadastro do cardápio" }, "Esgotado") : toggle(!r.off, (v) => setOff(r.id, !v), r.off ? "Esgotado" : "Ativo")),
              h("span", { class: "mt-c mt-a" }, btn("Ficha", { size: "sm", icon: "edit", onclick: () => openFicha(ctx, r.id) })));
          })));
    });
    return h("div", {}, head, legend, ...sections.filter(Boolean));
  },
  mount(node, ctx, again) { const sub = ctx.route()[1]; if (!again && sub && window.DOG.products[sub]) setTimeout(() => openFicha(ctx, sub), 60); }
};

/* ---------- ficha técnica ---------- */
export function openFicha(ctx, pid) {
  const p = window.DOG.products[pid]; const cfg0 = store.get("config");
  let rec = { ...recipeOf(pid, cfg0) }; let price = store.priceOf(pid);
  const body = h("div", { class: "ficha" });
  const draw = () => {
    const cfg = store.get("config"); const cost = productCost(pid, cfg, rec); const cmv = price ? cost / price : 0; const tone = cmvTone(cmv);
    const sug = Math.ceil((cost / CMV_IDEAL) * 2) / 2; const ifoodP = Math.ceil(((price - cost) / (1 - FEES.ifoodCommission - FEES.ifoodOnline) + cost) * 2) / 2;
    const rows = Object.entries(rec).map(([k, q]) => { const i = insumo(k); const lc = q * insCost(k, cfg);
      return h("div", { class: "fr" }, h("span", { class: "fr-n" }, i?.name || k, h("small", {}, BRL(insCost(k, cfg) * (i?.unit === "g" ? 1000 : 1)) + (i?.unit === "g" ? "/kg" : "/un"), (ctx.state.stock[k] ?? 0) <= 0 ? h("b", { class: "t-bad" }, " · sem estoque") : null)),
        h("span", { class: "fr-q" }, h("input", { class: "inp", type: "number", min: 0, step: i?.unit === "g" ? 5 : 1, value: q, "aria-label": "Quantidade de " + (i?.name || k), oninput: (e) => { rec[k] = Math.max(0, Number(e.target.value) || 0); draw2(); } }), h("span", { class: "u" }, i?.unit || "")),
        h("span", { class: "fr-c money" }, BRL(lc)), iconBtn("trash", "Remover " + (i?.name || k), () => { delete rec[k]; draw(); }, "sm")); });
    const add = h("select", { class: "inp", "aria-label": "Adicionar insumo", onchange: (e) => { if (e.target.value) { rec[e.target.value] = insumo(e.target.value).unit === "g" ? 20 : 1; draw(); } } },
      h("option", { value: "" }, "+ Adicionar insumo…"), insumos().filter((i) => !(i.id in rec)).map((i) => h("option", { value: i.id }, i.name)));
    clear(body).append(
      h("div", { class: "ficha-top" }, h("img", { src: p.img || p.imgSm, alt: "", width: 120, height: 120 }),
        h("div", {}, h("p", { class: "muted" }, p.desc ? String(p.desc).slice(0, 140) : ""), p.combo ? h("p", {}, h("strong", {}, "Combo: "), p.combo.includes.map((i) => i.qty + "× " + window.DOG.products[i.product]?.name).join(" + ")) : null)),
      h("div", { class: "ficha-sum", id: "ficha-sum" }, sumBlock(cost, price, cmv, tone, sug, ifoodP)),
      h("div", { class: "fr fr-h" }, h("span", {}, "Insumo"), h("span", {}, "Quantidade"), h("span", {}, "Custo"), h("span", {}, "")), ...rows, h("div", { class: "fr-add" }, add),
      h("p", { class: "note" }, icon("info", 16), " Custos são estimativas de demonstração, atualizados pelo custo médio das compras registradas no Estoque."));
  };
  const sumBlock = (cost, pr, cmv, tone, sug, ifoodP) => [
    h("div", { class: "fs" }, h("span", {}, "Custo do lanche"), h("strong", {}, BRL(cost))),
    h("div", { class: "fs" }, h("span", {}, "Preço de venda"), h("div", { class: "fs-price" }, h("span", { class: "rs" }, "R$"), h("input", { class: "inp", value: pr.toFixed(2).replace(".", ","), inputmode: "decimal", "aria-label": "Preço de venda", onchange: (e) => { const n = parseFloat(e.target.value.replace(",", ".")); if (n > 0) { price = n; draw2(); } } }))),
    h("div", { class: "fs fs-" + tone }, h("span", {}, "CMV"), h("strong", {}, pct(cmv, 1))),
    h("div", { class: "fs" }, h("span", {}, "Sobra por unidade"), h("strong", {}, BRL(pr - cost))),
    h("p", { class: "fs-tip" }, cmv > CMV_IDEAL ? ["Para o CMV ficar em 35%, o preço seria ", h("strong", {}, BRL(sug)), ". "] : "Margem saudável. ",
      "No iFood, para sobrar o mesmo, o preço teria que ser ", h("strong", {}, BRL(ifoodP)), " (comissão 12% + 3,2%).")];
  const draw2 = () => { const cfg = store.get("config"); const cost = productCost(pid, cfg, rec); const cmv = price ? cost / price : 0;
    const el = body.querySelector("#ficha-sum"); const fc = body.querySelectorAll(".fr:not(.fr-h) .fr-c"); Object.entries(rec).forEach(([k, q], i) => { if (fc[i]) fc[i].textContent = BRL(q * insCost(k, cfg)); });
    clear(el).append(...sumBlock(cost, price, cmv, cmvTone(cmv), Math.ceil((cost / CMV_IDEAL) * 2) / 2, Math.ceil(((price - cost) / (1 - FEES.ifoodCommission - FEES.ifoodOnline) + cost) * 2) / 2)); };
  draw();
  modal({ title: "Ficha técnica · " + p.name, sub: "Mude as quantidades e veja o custo na hora", size: "lg", body,
    actions: [
      btn("Restaurar padrão", { kind: "ghost", icon: "refresh", onclick: () => { rec = originalRecipe(pid); price = p.price; draw(); } }),
      h("span", { class: "grow" }),
      { label: "Cancelar", onclick: (c) => c() },
      { label: "Salvar ficha e preço", kind: "primary", icon: "check", onclick: (c) => {
        const same = JSON.stringify(rec) === JSON.stringify(originalRecipe(pid));
        store.update("config", (cfg) => { const recipes = { ...(cfg.recipes || {}) }; if (same) delete recipes[pid]; else recipes[pid] = rec; const prices = { ...(cfg.prices || {}) }; if (price === p.price) delete prices[pid]; else prices[pid] = price; return { ...cfg, recipes, prices }; });
        c(); toast(`Ficha do ${p.name} salva. Custo: ${BRL(productCost(pid, store.get("config"), rec))}.`); } }] });
}
