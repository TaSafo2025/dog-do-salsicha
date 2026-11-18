/* Ficha do produto: bottom sheet no celular, modal no desktop. */
import { S, DOG, h, icon, pic, clear, money, openDialog, closeDialog, toast, productImg, reduced, isWide, $ } from "./dom.js";
import { cart } from "./cart.js";

const dlg = () => document.getElementById("productDialog");
let st = null; // { p, sel: {group:{opt:qty}}, qty, note, editKey }

export function openProduct(id, { editKey } = {}) {
  const p = DOG().products[id]; if (!p || S.isOff(id)) return;
  const line = editKey ? cart.find(editKey) : null;
  const sel = {};
  for (const g of p.groups || []) sel[g.id] = {};
  for (const o of line?.options || []) if (sel[o.group]) sel[o.group][o.id] = o.qty || 1;
  st = { p, sel, qty: line?.qty || 1, note: line?.note || "", editKey: line ? editKey : null };
  render();
  const d = dlg();
  openDialog(d);
  d.querySelector(".pd-scroll").scrollTop = 0;
  d.querySelector(".pd-close").focus();
}

const groupTotal = (g) => Object.values(st.sel[g.id] || {}).reduce((a, n) => a + n, 0);
const optionOff = (o) => !!o.product && S.isOff(o.product);
const unmet = () => (st.p.groups || []).filter((g) => (g.min || 0) > groupTotal(g));
function currentOptions() {
  const out = [];
  for (const g of st.p.groups || []) for (const o of g.options) {
    const q = st.sel[g.id]?.[o.id] || 0;
    if (q > 0) out.push({ group: g.id, id: o.id, name: o.name, qty: q, price: o.price || 0 });
  }
  return out;
}
const currentLine = () => ({ productId: st.p.id, name: st.p.name, qty: st.qty, options: currentOptions(), note: st.note.trim() });

function render() {
  const d = dlg(); clear(d);
  const p = st.p; const price = S.priceOf(p.id); const full = p.combo?.fullPrice;
  const scroll = h("div", { class: "pd-scroll", onscroll: (e) => {
      const lim = window.matchMedia("(min-width: 900px)").matches ? 90 : (e.target.querySelector(".pd-media")?.offsetHeight || 200) - 60;
      d.querySelector(".pd")?.classList.toggle("is-scrolled", e.target.scrollTop > lim); } },
    h("div", { class: "pd-bar", "aria-hidden": "true" }, h("p", { text: p.name })),
    h("div", { class: "pd-media" }, pic(p.img, p.name, { cls: "pd-pic", eager: true }),
      p.combo ? h("span", { class: "pd-tag", text: p.combo.tag }) : null),
    h("div", { class: "pd-body" },
      h("h2", { class: "pd-name", id: "pd-title", text: p.name }),
      h("p", { class: "pd-desc", text: p.desc }),
      h("p", { class: "pd-price" },
        full && full > price ? h("span", { class: "was" }, "de ", h("s", { text: money(full) }), " por ") : null,
        h("strong", { text: money(price) }),
        full && full > price ? h("span", { class: "save-chip", text: `você economiza ${money(full - price)}` }) : null),
      p.combo ? comboIncludes(p) : null,
      (p.groups || []).map(groupBlock),
      h("div", { class: "pd-group pd-note" },
        h("label", { class: "pd-note-label", for: "pd-note" }, icon("edit", { size: 16 }), "Alguma observação?"),
        h("textarea", { id: "pd-note", rows: 2, maxlength: 140, placeholder: "Ex.: caprichar na batata palha, sem cebola…", ".value": st.note,
          oninput: (e) => { st.note = e.target.value; $("#pd-note-count").textContent = `${st.note.length}/140`; } }),
        h("span", { class: "pd-note-count", id: "pd-note-count", text: `${st.note.length}/140` }))));
  const foot = h("div", { class: "pd-foot" },
    h("p", { class: "pd-hint", id: "pd-hint", role: "status", "aria-live": "polite" }),
    h("div", { class: "pd-foot-row" },
      stepper(st.qty, (n) => { st.qty = n; refresh(); }, { min: 1, max: 50, label: "Quantidade", id: "pd-qty" }),
      h("button", { class: "btn-primary pd-add", type: "button", id: "pd-add", onclick: submit },
        h("span", { class: "pd-add-label", text: st.editKey ? "Atualizar" : "Adicionar" }),
        h("span", { class: "pd-add-price", id: "pd-add-price" }))));
  d.append(h("div", { class: "pd" },
    h("button", { class: "pd-close", type: "button", "aria-label": "Fechar", onclick: () => closeDialog(d) }, icon("close", { size: 22 })),
    scroll, foot));
  d.setAttribute("aria-labelledby", "pd-title");
  refresh();
}

function comboIncludes(p) {
  return h("div", { class: "pd-includes" },
    h("p", { class: "pd-sub", text: "Vem no combo" }),
    h("ul", {}, p.combo.includes.map((i) => {
      const ip = DOG().products[i.product];
      return h("li", {}, ip ? pic(productImg(ip), "", { cls: "inc-pic" }) : null,
        h("span", { class: "inc-qty", text: `${i.qty}×` }), h("span", { class: "inc-name", text: ip?.name || i.product }));
    }),
    p.groups?.some((g) => g.id === "bebida") ? h("li", { class: "inc-choice" }, h("span", { class: "inc-ic" }, icon("plus", { size: 16 })), h("span", { class: "inc-name", text: "1 bebida em lata à sua escolha" })) : null));
}

function groupMeta(g) {
  if (g.type === "single") return g.min ? "Escolha 1 opção" : "Escolha até 1";
  if (g.id === "retirar") return `Marque até ${g.max}`;
  return `Escolha até ${g.max}${g.maxEach && g.maxEach < g.max ? ` · máx. ${g.maxEach} de cada` : ""}`;
}
function groupBlock(g) {
  const req = (g.min || 0) > 0;
  const head = h("div", { class: "pd-ghead" },
    h("div", {}, h("h3", { class: "pd-gname", id: `g-${g.id}`, text: g.name }), h("p", { class: "pd-gmeta", text: groupMeta(g) })),
    h("span", { class: "pd-gbadge" + (req ? " is-req" : ""), "data-badge": g.id }));
  let list;
  if (g.type === "single") {
    list = h("div", { class: "opts", role: "radiogroup", "aria-labelledby": `g-${g.id}` }, g.options.map((o) => {
      const off = optionOff(o);
      const input = h("input", { type: "radio", name: `opt-${g.id}`, value: o.id, disabled: off, ".checked": !!st.sel[g.id][o.id],
        onchange: () => { st.sel[g.id] = { [o.id]: 1 }; refresh(); } });
      const ip = o.product && DOG().products[o.product];
      return h("label", { class: "opt opt--radio" + (off ? " is-off" : "") }, input,
        ip ? pic(productImg(ip), "", { cls: "opt-pic" }) : null,
        h("span", { class: "opt-text" }, h("span", { class: "opt-name", text: o.name }),
          off ? h("span", { class: "soldout", text: "Esgotado hoje" }) : o.price ? h("span", { class: "opt-price", text: `+ ${money(o.price)}` }) : h("span", { class: "opt-price", text: "Incluso" })),
        h("span", { class: "radio", "aria-hidden": "true" }));
    }));
  } else if ((g.maxEach || 1) === 1) {
    list = h("div", { class: "opts" }, g.options.map((o) => {
      const input = h("input", { type: "checkbox", value: o.id, "data-g": g.id, ".checked": !!st.sel[g.id][o.id],
        onchange: (e) => { if (e.target.checked) st.sel[g.id][o.id] = 1; else delete st.sel[g.id][o.id]; refresh(); } });
      return h("label", { class: "opt opt--check" }, input,
        h("span", { class: "opt-text" }, h("span", { class: "opt-name", text: o.name }), o.price ? h("span", { class: "opt-price", text: `+ ${money(o.price)}` }) : null),
        h("span", { class: "check", "aria-hidden": "true" }, icon("check", { size: 16 })));
    }));
  } else {
    list = h("div", { class: "opts" }, g.options.map((o) => h("div", { class: "opt opt--step", "data-g": g.id, "data-o": o.id },
      h("span", { class: "opt-text" }, h("span", { class: "opt-name", text: o.name }), h("span", { class: "opt-price", text: o.price ? `+ ${money(o.price)}` : "Grátis" })),
      stepper(st.sel[g.id][o.id] || 0, (n) => { if (n) st.sel[g.id][o.id] = n; else delete st.sel[g.id][o.id]; refresh(); },
        { min: 0, max: g.maxEach || g.max, label: o.name, compact: true, group: g }))));
  }
  return h("section", { class: "pd-group", id: `grp-${g.id}`, "aria-labelledby": `g-${g.id}` }, head, list);
}

/** Stepper − n + ; compact = só "+" quando zerado (estilo iFood) */
export function stepper(value, onChange, { min = 0, max = 99, label = "", compact = false, id, group, small = false } = {}) {
  const wrap = h("div", { class: "stepper" + (compact ? " stepper--compact" : "") + (small ? " stepper--sm" : ""), id, role: "group", "aria-label": label });
  wrap._value = value; wrap._max = max; wrap._group = group;
  const dec = h("button", { type: "button", class: "st-btn st-dec", "aria-label": `Remover ${label}`.trim() }, icon("minus", { size: 18 }));
  const out = h("output", { class: "st-val", "aria-live": "polite", text: String(value) });
  const inc = h("button", { type: "button", class: "st-btn st-inc", "aria-label": `Adicionar ${label}`.trim() }, icon("plus", { size: 18 }));
  const set = (n) => { wrap._value = n; out.textContent = String(n); onChange(n); sync(); };
  const sync = () => {
    const v = wrap._value;
    const groupFull = group ? groupTotal(group) >= group.max : false;
    dec.disabled = v <= min; inc.disabled = v >= max || (group && groupFull);
    wrap.classList.toggle("is-zero", v === 0);
  };
  wrap._sync = sync;
  dec.addEventListener("click", () => { if (wrap._value > min) set(wrap._value - 1); });
  inc.addEventListener("click", () => { if (!inc.disabled) { set(wrap._value + 1); if (compact && wrap._value === 1) requestAnimationFrame(() => inc.focus()); } });
  wrap.append(dec, out, inc); sync();
  return wrap;
}

function refresh() {
  const d = dlg(); if (!st) return;
  const line = currentLine(); const total = S.lineTotal(line);
  $("#pd-add-price", d).textContent = money(total);
  const miss = unmet();
  const add = $("#pd-add", d);
  add.setAttribute("aria-disabled", miss.length ? "true" : "false");
  add.classList.toggle("is-blocked", !!miss.length);
  add.setAttribute("aria-label", `${st.editKey ? "Atualizar" : "Adicionar"} ${st.qty} à sacola por ${money(total)}`);
  $("#pd-hint", d).textContent = miss.length ? `Falta escolher: ${miss.map((g) => g.name.toLowerCase()).join(", ")}` : "";
  for (const g of st.p.groups || []) {
    const n = groupTotal(g); const badge = d.querySelector(`[data-badge="${g.id}"]`); if (!badge) continue;
    const req = (g.min || 0) > 0; const ok = n >= (g.min || 0);
    clear(badge);
    if (req && ok) { badge.className = "pd-gbadge is-ok"; badge.append(icon("check", { size: 14 }), "Pronto"); }
    else if (req) { badge.className = "pd-gbadge is-req"; badge.textContent = "Obrigatório"; }
    else if (n > 0 && g.type !== "single") { badge.className = "pd-gbadge is-count"; badge.textContent = `${n}/${g.max}`; }
    else { badge.className = "pd-gbadge"; badge.textContent = "Opcional"; }
    // limites: desabilita steppers/checkboxes quando o grupo encheu
    d.querySelectorAll(`#grp-${g.id} .stepper`).forEach((s) => s._sync?.());
    if (g.type === "multi" && (g.maxEach || 1) === 1) d.querySelectorAll(`#grp-${g.id} input[type=checkbox]`).forEach((i) => { i.disabled = !i.checked && n >= g.max; i.closest(".opt").classList.toggle("is-dim", i.disabled); });
  }
}

function submit(e) {
  const d = dlg(); const miss = unmet();
  if (miss.length) {
    const sec = d.querySelector(`#grp-${miss[0].id}`);
    sec.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    sec.classList.remove("shake"); void sec.offsetWidth; sec.classList.add("shake");
    sec.querySelector("input:not(:disabled), button:not(:disabled)")?.focus({ preventScroll: true });
    return;
  }
  const line = currentLine();
  const from = d.querySelector(".pd-pic")?.getBoundingClientRect() || e.currentTarget.getBoundingClientRect();
  const imgSrc = productImg(st.p);
  if (st.editKey) { cart.replace(st.editKey, line); toast("Item atualizado na sacola", { tone: "ok" }); }
  else { cart.add(line); toast(`${line.qty}× ${st.p.name} na sacola`, { tone: "ok" }); }
  closeDialog(d);
  flyToBag(from, imgSrc);
}

/** Microinteração: miniatura voa até a sacola */
export function flyToBag(fromRect, src) {
  const target = isWide() ? $("#bagAside .bag-icon") : (!$("#bagBar").hidden ? $("#bagBar .bagbar-count") : null);
  const bump = () => { const t = isWide() ? $("#bagAside .bag-head") : $("#bagBar"); t?.classList.remove("bump"); void t?.offsetWidth; t?.classList.add("bump"); };
  if (reduced() || !target || !fromRect) return bump();
  const to = target.getBoundingClientRect();
  const size = 72;
  const ghost = h("img", { src, alt: "", class: "fly", style: { left: `${fromRect.left + fromRect.width / 2 - size / 2}px`, top: `${fromRect.top + fromRect.height / 2 - size / 2}px`, width: `${size}px`, height: `${size}px` } });
  document.body.append(ghost);
  const dx = to.left + to.width / 2 - (fromRect.left + fromRect.width / 2); const dy = to.top + to.height / 2 - (fromRect.top + fromRect.height / 2);
  const anim = ghost.animate([
    { transform: "translate(0,0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 90}px) scale(.75)`, opacity: 1, offset: 0.45 },
    { transform: `translate(${dx}px, ${dy}px) scale(.18)`, opacity: 0.6 }
  ], { duration: 720, easing: "cubic-bezier(.55,0,.35,1)" });
  anim.onfinish = () => { ghost.remove(); bump(); };
}
