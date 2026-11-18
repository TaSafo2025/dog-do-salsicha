/* Sacola: gaveta lateral fixa (≥1100px), sheet/gaveta nas telas menores, barra flutuante no celular. */
import { S, DOG, h, icon, pic, clear, money, plural, openDialog, closeDialog, toast, productImg, isWide, status, $ } from "./dom.js";
import { cart } from "./cart.js";
import { openProduct, stepper, flyToBag } from "./product.js";
import { openCheckout } from "./checkout.js";

const SUGGEST = ["batata-frita-p", "batata-frita-com-cheddar-bacon-pequena", "coca-cola-310ml", "refrigerante-600-ml", "suco-natural-de-laranja-500ml", "agua-sem-gas"];
const bagDlg = () => document.getElementById("bagDialog");

export function initBag() {
  cart.subscribe(renderAll);
  $("#bagBar").addEventListener("click", openBag);
  matchMedia("(min-width: 1100px)").addEventListener("change", () => { if (isWide()) closeDialog(bagDlg()); renderAll(); });
}
export function openBag() {
  if (isWide()) { $("#bagAside .bag-head h2")?.focus(); return; }
  renderInto(bagDlg(), { modal: true });
  openDialog(bagDlg());
  bagDlg().querySelector(".bag-close")?.focus();
}
export function renderAll() {
  renderInto($("#bagAside"), { modal: false });
  if (bagDlg().open) renderInto(bagDlg(), { modal: true });
  renderBar();
}

function renderBar() {
  const bar = $("#bagBar"); const n = cart.count();
  bar.hidden = n === 0;
  clear(bar);
  bar.setAttribute("aria-label", `Ver sacola: ${plural(n, "item", "itens")}, ${money(cart.subtotal())}`);
  bar.append(
    h("span", { class: "bagbar-count" }, icon("bag", { size: 20 }), h("span", { class: "bagbar-n", text: String(n) })),
    h("span", { class: "bagbar-label", text: "Ver sacola" }),
    h("span", { class: "bagbar-total", text: money(cart.subtotal()) }));
}

function renderInto(root, opts) {
  // preserva o foco do teclado entre re-renderizações
  const a = document.activeElement; const had = root.contains(a);
  const key = had && (a.getAttribute("aria-label") || a.textContent);
  const scroll = root.querySelector(".bag-scroll")?.scrollTop || 0;
  build(root, opts);
  const sc = root.querySelector(".bag-scroll"); if (sc) sc.scrollTop = scroll;
  if (had) {
    const same = [...root.querySelectorAll("button")].find((b) => !b.disabled && (b.getAttribute("aria-label") || b.textContent) === key);
    (same || root.querySelector("h2"))?.focus({ preventScroll: true });
  }
}

function build(root, { modal }) {
  const lines = cart.lines; const n = cart.count(); const sub = cart.subtotal();
  const min = DOG().store.minOrder; const missing = Math.max(0, Math.round((min - sub) * 100) / 100);
  const offs = cart.offLines(); const st = status();
  clear(root);
  const head = h("header", { class: "bag-head" },
    h("span", { class: "bag-icon" }, icon("bag", { size: 22 })),
    h("div", {}, h("h2", { tabindex: "-1", id: modal ? "bag-title-m" : "bag-title", text: "Sua sacola" }),
      h("p", { class: "bag-sub", text: n ? `${plural(n, "item", "itens")} · Dog do Salsicha` : "Dog do Salsicha · Samambaia" })),
    n ? h("button", { class: "link bag-clear", type: "button", onclick: () => { const undo = cart.clear(); toast("Sacola esvaziada", { action: { label: "Desfazer", icon: "undo", fn: undo }, timeout: 6000 }); } }, "Limpar") : null,
    modal ? h("button", { class: "icon-btn bag-close", type: "button", "aria-label": "Fechar sacola", onclick: () => closeDialog(bagDlg()) }, icon("close", { size: 22 })) : null);
  if (modal) root.setAttribute("aria-labelledby", "bag-title-m");

  if (!lines.length) {
    root.append(h("div", { class: "bag" }, head, h("div", { class: "bag-empty" },
      h("div", { class: "bag-empty-art", "aria-hidden": "true" }, icon("bag", { size: 40 }), h("span", { class: "bag-empty-paw" }, icon("paw", { size: 20, fill: true }))),
      h("p", { class: "bag-empty-title", text: "Sua sacola está vazia" }),
      h("p", { class: "bag-empty-sub", text: "Escolha um dog prensado na chapa e ele aparece aqui. Pedido mínimo " + money(min) + "." }))));
    return;
  }

  const list = h("ul", { class: "bag-lines" }, lines.map((l) => lineItem(l)));
  const progress = h("div", { class: "minbar" + (missing ? "" : " is-ok") },
    h("p", { class: "minbar-text" }, missing ? [icon("info", { size: 16 }), `Faltam `, h("strong", { text: money(missing) }), ` para o pedido mínimo de ${money(min)}`] : [icon("check", { size: 16 }), "Pedido mínimo atingido"]),
    h("div", { class: "minbar-track", role: "progressbar", "aria-label": "Pedido mínimo", "aria-valuemin": 0, "aria-valuemax": min, "aria-valuenow": Math.min(sub, min) },
      h("span", { style: { width: `${Math.min(100, (sub / min) * 100)}%` } })));

  const sugg = SUGGEST.filter((id) => DOG().products[id] && !S.isOff(id) && !cart.has(id)).slice(0, 3);
  const suggest = sugg.length ? h("div", { class: "suggest" },
    h("p", { class: "suggest-title", text: "Combina com o seu pedido" }),
    h("div", { class: "suggest-track" }, sugg.map((id) => {
      const p = DOG().products[id];
      return h("button", { class: "sg", type: "button", "aria-label": `Adicionar ${p.name} por ${money(S.priceOf(id))}`,
        onclick: (e) => {
          const r = e.currentTarget.querySelector(".pic").getBoundingClientRect();
          cart.add({ productId: id, name: p.name, qty: 1, options: [], note: "" });
          toast(`${p.name} na sacola`, { tone: "ok" }); flyToBag(r, productImg(p));
        } },
        pic(productImg(p), "", { cls: "sg-pic" }),
        h("span", { class: "sg-name", text: p.name }),
        h("span", { class: "sg-price" }, h("span", { text: money(S.priceOf(id)) }), h("span", { class: "sg-plus" }, icon("plus", { size: 14 }))));
    }))) : null;

  const blocked = missing > 0 || offs.length > 0 || !st.open;
  const ctaLabel = !st.open ? st.cta : offs.length ? "Remova os itens esgotados" : missing ? `Adicione mais ${money(missing)}` : "Continuar";
  const foot = h("footer", { class: "bag-foot" },
    h("dl", { class: "bag-sum" },
      h("div", {}, h("dt", { text: "Subtotal" }), h("dd", { text: money(sub) })),
      h("div", {}, h("dt", { text: "Taxa de entrega" }), h("dd", { class: "muted", text: "calculada no próximo passo" }))),
    h("button", { class: "btn-primary bag-go", type: "button", disabled: blocked, onclick: async () => { if (modal) await closeDialog(bagDlg()); openCheckout(); } },
      h("span", { text: ctaLabel }), blocked ? null : h("span", { class: "bag-go-total" }, money(sub), icon("arrowR", { size: 18 }))));

  root.append(h("div", { class: "bag" }, head, h("div", { class: "bag-scroll" }, list, progress, suggest), foot));
}

function optionSummary(l) {
  const p = DOG().products[l.productId];
  const parts = [];
  for (const o of l.options || []) {
    if (o.group === "retirar") parts.push(o.name);
    else if (o.group === "bebida") parts.push(`Bebida: ${o.name}`);
    else parts.push(`${o.qty > 1 ? o.qty + "× " : "+ "}${o.name}`);
  }
  if (p?.combo) parts.unshift(p.combo.includes.map((i) => `${i.qty}× ${DOG().products[i.product]?.name || ""}`).join(", "));
  return parts;
}

function lineItem(l) {
  const p = DOG().products[l.productId]; const off = S.isOff(l.productId);
  const summary = optionSummary(l);
  const edit = (p.groups?.length || 0) > 0;
  return h("li", { class: "bl" + (off ? " is-off" : "") },
    pic(productImg(p), "", { cls: "bl-pic" }),
    h("div", { class: "bl-main" },
      h("p", { class: "bl-name" }, h("span", { text: p.name }), h("span", { class: "bl-price", text: money(S.lineTotal(l)) })),
      summary.length ? h("ul", { class: "bl-opts" }, summary.map((s) => h("li", { text: s }))) : null,
      l.note ? h("p", { class: "bl-note", text: `“${l.note}”` }) : null,
      off ? h("p", { class: "soldout", text: "Esgotou agora há pouco — remova para continuar" }) : null,
      h("div", { class: "bl-actions" },
        l.qty === 1
          ? h("div", { class: "stepper stepper--sm", role: "group", "aria-label": `Quantidade de ${p.name}` },
              h("button", { class: "st-btn", type: "button", "aria-label": `Remover ${p.name} da sacola`, onclick: () => removeLine(l) }, icon("trash", { size: 16 })),
              h("output", { class: "st-val", text: "1" }),
              h("button", { class: "st-btn", type: "button", "aria-label": `Mais um ${p.name}`, disabled: off, onclick: () => cart.setQty(l.key, 2) }, icon("plus", { size: 16 })))
          : stepper(l.qty, (n) => cart.setQty(l.key, n), { min: 1, max: 50, label: p.name, small: true }),
        edit && !off ? h("button", { class: "link bl-edit", type: "button", onclick: async () => { if (bagDlg().open) await closeDialog(bagDlg()); openProduct(l.productId, { editKey: l.key }); } }, icon("edit", { size: 15 }), "Editar") : null,
        h("button", { class: "link bl-remove", type: "button", onclick: () => removeLine(l) }, "Remover"))));
}
function removeLine(l) {
  const undo = cart.remove(l.key);
  toast(`${l.name} removido`, { action: { label: "Desfazer", icon: "undo", fn: undo }, timeout: 6000 });
}
