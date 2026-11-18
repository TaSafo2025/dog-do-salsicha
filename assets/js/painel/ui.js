/* Componentes de interface do painel */
import { h, s, icon, clear, BRL } from "./dom.js";

/* ---------- modal / gaveta (dialog nativo) ---------- */
export function modal({ title, sub, body, actions = [], size = "md", side = false, onClose, cls = "" }) {
  const dlg = h("dialog", { class: `dlg dlg-${size} ${side ? "dlg-side" : ""} ${cls}`, "aria-label": title });
  const close = () => { dlg.close(); };
  dlg.addEventListener("close", () => { onClose?.(); setTimeout(() => dlg.remove(), 220); });
  dlg.addEventListener("click", (e) => { if (e.target === dlg) close(); });
  const foot = actions.length ? h("footer", { class: "dlg-foot" }, actions.map((a) => a instanceof Node ? a : btn(a.label, { kind: a.kind || "ghost", icon: a.icon, onclick: () => a.onclick?.(close) }))) : null;
  dlg.append(h("div", { class: "dlg-card" },
    h("header", { class: "dlg-head" }, h("div", {}, h("h2", { class: "dlg-title" }, title), sub ? h("p", { class: "dlg-sub" }, sub) : null),
      h("button", { class: "icon-btn", type: "button", "aria-label": "Fechar", onclick: close }, icon("x"))),
    h("div", { class: "dlg-body" }, body), foot));
  document.body.append(dlg); dlg.showModal();
  return { dlg, close, setBody: (n) => clear(dlg.querySelector(".dlg-body")).append(n) };
}
export function confirmBox(title, text, okLabel = "Confirmar", kind = "primary") {
  return new Promise((res) => {
    let ok = false;
    modal({ title, size: "sm", body: h("p", { class: "muted" }, text), onClose: () => res(ok),
      actions: [{ label: "Cancelar", onclick: (c) => c() }, { label: okLabel, kind, onclick: (c) => { ok = true; c(); } }] });
  });
}

/* ---------- toast ---------- */
let toastHost;
export function toast(text, { kind = "ok", icon: ic = kind === "ok" ? "check" : kind === "new" ? "bell" : kind === "warn" ? "alert" : "info", action, ms = 4200 } = {}) {
  toastHost ||= document.body.appendChild(h("div", { class: "toasts", role: "status", "aria-live": "polite" }));
  const t = h("div", { class: "toast toast-" + kind }, h("span", { class: "toast-ico" }, icon(ic, 18)), h("span", { class: "toast-txt" }, text),
    action ? h("button", { class: "toast-act", type: "button", onclick: () => { action.onclick(); t.remove(); } }, action.label) : null);
  toastHost.append(t); setTimeout(() => t.classList.add("out"), ms); setTimeout(() => t.remove(), ms + 400);
}

/* ---------- botões e campos ---------- */
export function btn(label, { kind = "ghost", icon: ic, onclick, size, attrs = {}, title } = {}) {
  return h("button", { type: "button", class: `btn btn-${kind} ${size ? "btn-" + size : ""}`, onclick, title, ...attrs }, ic ? icon(ic, size === "sm" ? 16 : 18) : null, label ? h("span", {}, label) : null);
}
export const iconBtn = (ic, label, onclick, cls = "") => h("button", { type: "button", class: "icon-btn " + cls, "aria-label": label, title: label, onclick }, icon(ic, 18));
export function field(label, input, hint) {
  return h("label", { class: "field" }, h("span", { class: "field-l" }, label), input, hint ? h("span", { class: "field-h" }, hint) : null);
}
export function input(attrs = {}) { return h("input", { class: "inp", ...attrs }); }
export function select(options, attrs = {}) {
  return h("select", { class: "inp", ...attrs }, options.map((o) => { const [v, l] = Array.isArray(o) ? o : [o, o]; return h("option", { value: v, selected: String(attrs.value) === String(v) }, l); }));
}
export function seg(options, value, onchange, cls = "") {
  const wrap = h("div", { class: "seg " + cls, role: "tablist" });
  for (const [v, l] of options) wrap.append(h("button", { type: "button", role: "tab", class: "seg-b" + (v === value ? " on" : ""), "aria-selected": String(v === value), onclick: () => onchange(v) }, l));
  return wrap;
}
export function toggle(checked, onchange, label) {
  const i = h("input", { type: "checkbox", class: "tg-i", checked, onchange: (e) => onchange(e.target.checked), "aria-label": label || "Alternar" });
  return h("label", { class: "tg" }, i, h("span", { class: "tg-t", "aria-hidden": "true" }), label ? h("span", { class: "tg-l" }, label) : null);
}
export const pill = (text, tone = "neutral", ic) => h("span", { class: "pill pill-" + tone }, ic ? icon(ic, 14) : h("i", { class: "dot" }), text);
export const chip = (text, tone = "neutral") => h("span", { class: "chip chip-" + tone }, text);

/* ---------- blocos ---------- */
export function card(title, opts = {}, ...kids) {
  const { sub, actions, cls = "", icon: ic, id } = opts;
  return h("section", { class: "card " + cls, id },
    title ? h("header", { class: "card-h" }, h("div", { class: "card-ht" }, ic ? h("span", { class: "card-ico" }, icon(ic, 18)) : null, h("div", {}, h("h3", {}, title), sub ? h("p", { class: "card-sub" }, sub) : null)), actions ? h("div", { class: "card-act" }, actions) : null) : null,
    kids);
}
export function kpi({ label, value, sub, tone = "", icon: ic, spark, trend, onclick }) {
  const el = h(onclick ? "button" : "div", { class: "kpi " + (tone ? "kpi-" + tone : ""), type: onclick ? "button" : null, onclick },
    h("div", { class: "kpi-top" }, h("span", { class: "kpi-l" }, label), ic ? h("span", { class: "kpi-ico" }, icon(ic, 18)) : null),
    h("div", { class: "kpi-v" }, value),
    h("div", { class: "kpi-b" }, trend ? h("span", { class: "trend trend-" + (trend.dir || "flat") }, icon(trend.dir === "up" ? "up" : trend.dir === "down" ? "down" : "minus", 14), trend.text) : null, sub ? h("span", { class: "kpi-s" }, sub) : null),
    spark || null);
  return el;
}
export function empty(text, ic = "info", action) { return h("div", { class: "empty" }, icon(ic, 28), h("p", {}, text), action || null); }
export function table(cols, rows, { cls = "", onRow, empty: emptyText = "Nada por aqui." } = {}) {
  if (!rows.length) return empty(emptyText);
  return h("div", { class: "tbl-wrap " + cls }, h("table", { class: "tbl" },
    h("thead", {}, h("tr", {}, cols.map((c) => h("th", { class: c.cls || "", scope: "col" }, c.label)))),
    h("tbody", {}, rows.map((r, i) => h("tr", { class: onRow ? "click" : "", onclick: onRow ? () => onRow(r) : null, tabindex: onRow ? 0 : null, onkeydown: onRow ? (e) => { if (e.key === "Enter") onRow(r); } : null },
      cols.map((c) => h("td", { class: c.cls || "", "data-l": c.label }, c.render ? c.render(r, i) : r[c.key])))))));
}
export function tabs(list, value, onchange) {
  return h("nav", { class: "tabs", role: "tablist" }, list.map(([v, l, badge]) => h("button", { type: "button", role: "tab", class: "tab" + (v === value ? " on" : ""), "aria-selected": String(v === value), onclick: () => onchange(v) }, l, badge ? h("span", { class: "tab-badge" }, badge) : null)));
}
export function bar(value, max, tone = "") {
  const p = Math.max(0, Math.min(1, max ? value / max : 0));
  return h("div", { class: "meter " + tone }, h("i", { style: { width: (p * 100).toFixed(1) + "%" } }));
}
export function money(n, cls = "") { return h("span", { class: "money " + cls }, BRL(n)); }
export function avatar(name, tone) { const n = String(name || "?").trim(); const ini = n.split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join(""); let hsh = 0; for (const c of n) hsh = (hsh * 31 + c.charCodeAt(0)) % 360; return h("span", { class: "avatar", style: { "--h": tone ?? hsh } }, ini); }
export { h, s, icon, clear };
