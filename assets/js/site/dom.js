/* Utilitários de DOM do site do cliente — nada de innerHTML com dados. */
import * as S from "../store.js";
export { S };
export const DOG = () => window.DOG;
export const money = S.money;

/** h("div", {class, text, onclick, ".value": x, "aria-label": ...}, ...filhos) */
export function h(tag, props, ...kids) {
  const el = document.createElement(tag);
  if (props) for (const [k, v] of Object.entries(props)) {
    if (v == null || v === false) continue;
    if (k === "class") el.className = v;
    else if (k === "text") el.textContent = v;
    else if (k === "style" && typeof v === "object") Object.assign(el.style, v);
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2), v);
    else if (k.startsWith(".")) el[k.slice(1)] = v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
  add(el, kids);
  return el;
}
export function add(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false || k === true) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
  return el;
}
export const clear = (el) => { while (el.firstChild) el.firstChild.remove(); return el; };
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

/* ---------- ícones SVG próprios (traço 1.8, currentColor) ---------- */
const NS = "http://www.w3.org/2000/svg";
const I = {
  search: ["M10.5 18a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Z", "m21 21-5.2-5.2"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  trash: ["M4 7h16", "M10 11v6", "M14 11v6", "M6 7l1 12.5A1.6 1.6 0 0 0 8.6 21h6.8a1.6 1.6 0 0 0 1.6-1.5L18 7", "M9 7V4.6c0-.3.3-.6.6-.6h4.8c.3 0 .6.3.6.6V7"],
  bag: ["M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8Z", "M9 10V6.5a3 3 0 0 1 6 0V10"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 7v5l3.2 2"],
  moto: ["M5.5 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M18.5 18.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M8.5 15.5h5l3-6h-3", "M5.5 15.5 9 9.5h4", "M14 5.5h2.2l2.3 10"],
  store: ["M4 10v10h16V10", "M3 10l1.6-6h14.8L21 10", "M3 10c0 1.4 1.1 2.5 2.5 2.5S8 11.4 8 10c0 1.4 1.1 2.5 2.5 2.5h3c1.4 0 2.5-1.1 2.5-2.5 0 1.4 1.1 2.5 2.5 2.5S21 11.4 21 10", "M10 20v-5h4v5"],
  pin: ["M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z", "M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"],
  route: ["M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z", "M8 18h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16"],
  whatsapp: ["M3.6 20.4l1.2-4.3A8.6 8.6 0 1 1 8 19.3l-4.4 1.1Z", "M9 8.2c.2-.4.5-.5.8-.5h.5c.2 0 .4.1.5.4l.7 1.6c.1.2 0 .5-.1.7l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.2-.2.5-.2.7-.1l1.6.7c.3.1.4.3.4.5v.5c0 .3-.1.6-.5.8-.7.4-1.6.5-2.6.1a9.2 9.2 0 0 1-4.9-4.9c-.4-1-.3-1.9 0-2.7Z"],
  chevR: ["m9 5 7 7-7 7"], chevL: ["m15 5-7 7 7 7"], chevD: ["m5 9 7 7 7-7"], arrowL: ["M19 12H5", "m11 6-6 6 6 6"], arrowR: ["M5 12h14", "m13 6 6 6-6 6"],
  check: ["m5 12.5 4.5 4.5L19 7.5"],
  star: ["m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.6l5.8-.8L12 3.5Z"],
  pix: ["M12 3.2 15.3 6.5 12 9.8 8.7 6.5 12 3.2Z", "M12 14.2l3.3 3.3L12 20.8l-3.3-3.3 3.3-3.3Z", "M3.2 12l3.3-3.3L9.8 12l-3.3 3.3L3.2 12Z", "M14.2 12l3.3-3.3 3.3 3.3-3.3 3.3-3.3-3.3Z"],
  cash: ["M3 7h18v10H3z", "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z", "M6.5 10v4", "M17.5 10v4"],
  card: ["M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z", "M3 10h18", "M7 15h4"],
  edit: ["M4 20h4L19 9l-4-4L4 16v4Z", "m13.5 6.5 4 4"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z", "M12 11v5.5", "M12 7.6v.2"],
  alert: ["M12 3.5 2.8 19.5h18.4L12 3.5Z", "M12 10v4.5", "M12 17.2v.2"],
  copy: ["M9 9h10.5v10.5H9z", "M15 9V4.5H4.5V15H9"],
  gift: ["M4 11h16v9H4z", "M3 7.5h18V11H3z", "M12 7.5V20", "M12 7.5C10.5 4 7 3.8 7 5.8c0 1.4 2 1.7 5 1.7Z", "M12 7.5c1.5-3.5 5-3.7 5-1.7 0 1.4-2 1.7-5 1.7Z"],
  flame: ["M12 21c3.9 0 6.5-2.6 6.5-6.2 0-3.4-2.3-5.4-3.7-7.3-.5 1.7-1.3 2.6-2.3 3.1C12.8 7.6 11.3 4.5 8.6 3c.4 3.3-3.1 5.4-3.1 10.3C5.5 17.6 8.2 21 12 21Z"],
  cutlery: ["M7 3v8", "M4.5 3v5a2.5 2.5 0 0 0 5 0V3", "M7 11v10", "M17 21V3c-2 1-3.5 3.3-3.5 7v3H17"],
  receipt: ["M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21V3Z", "M9 8h6", "M9 12h6", "M9 16h3"],
  phone: ["M5 4h3.5l1.5 4.5-2 1.3a10.5 10.5 0 0 0 6.2 6.2l1.3-2L20 15.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"],
  paw: ["M12 12.4c-2.8 0-5.1 2.7-5.1 4.9 0 1.6 1.3 2.5 2.7 2.5 1 0 1.5-.5 2.4-.5s1.4.5 2.4.5c1.4 0 2.7-.9 2.7-2.5 0-2.2-2.3-4.9-5.1-4.9Z", "M4.3 10.8a1.8 2 0 1 0 3.6 0a1.8 2 0 1 0-3.6 0Z", "M7.6 6.9a1.8 2.1 0 1 0 3.6 0a1.8 2.1 0 1 0-3.6 0Z", "M12.8 6.9a1.8 2.1 0 1 0 3.6 0a1.8 2.1 0 1 0-3.6 0Z", "M16.1 10.8a1.8 2 0 1 0 3.6 0a1.8 2 0 1 0-3.6 0Z"],
  chef: ["M7 13.5V19h10v-5.5", "M7 13.5A4 4 0 0 1 6.4 5.6 4 4 0 0 1 12 3.5a4 4 0 0 1 5.6 2.1 4 4 0 0 1-.6 7.9", "M7 16h10"],
  box: ["M3.5 8 12 3.5 20.5 8v8L12 20.5 3.5 16V8Z", "M3.5 8 12 12.5 20.5 8", "M12 12.5v8"],
  sparkle: ["M12 3.5c.6 4.3 1.2 4.9 5.5 5.5-4.3.6-4.9 1.2-5.5 5.5-.6-4.3-1.2-4.9-5.5-5.5 4.3-.6 4.9-1.2 5.5-5.5Z", "M18.5 15c.3 1.8.7 2.2 2.5 2.5-1.8.3-2.2.7-2.5 2.5-.3-1.8-.7-2.2-2.5-2.5 1.8-.3 2.2-.7 2.5-2.5Z"],
  undo: ["M9 14 4 9l5-5", "M4 9h10.5a5.5 5.5 0 0 1 0 11H11"],
  lock: ["M6 11h12v9H6z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"],
  user: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 20.5c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z"]
};
export function icon(name, { size = 20, cls = "", fill = false } = {}) {
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24"); svg.setAttribute("width", size); svg.setAttribute("height", size);
  svg.setAttribute("aria-hidden", "true"); svg.setAttribute("focusable", "false");
  svg.setAttribute("class", "ic " + cls);
  svg.setAttribute("fill", fill ? "currentColor" : "none");
  svg.setAttribute("stroke", "currentColor"); svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round"); svg.setAttribute("stroke-linejoin", "round");
  for (const d of I[name] || []) { const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); svg.append(p); }
  return svg;
}
export function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

/* ---------- texto / formatação ---------- */
export const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
export const hm = (s) => { const [a, b] = String(s).split(":"); return `${Number(a)}h${b === "00" ? "" : b}`; };
export const clock = (ms) => new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }).replace(":", "h");
export const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;
export const digits = (s) => String(s || "").replace(/\D/g, "");
export function maskPhone(v) {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}
export const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
export const brNow = () => new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));

/* ---------- armazenamento local do site (preferências do aparelho) ---------- */
export function lsGet(k, fb) { try { const v = localStorage.getItem(k); return v == null ? fb : JSON.parse(v); } catch { return fb; } }
export function lsSet(k, v) { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch { /* bloqueado */ } }

export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isWide = () => matchMedia("(min-width: 1100px)").matches;

/* ---------- imagens com skeleton ---------- */
export function pic(src, alt = "", { cls = "", eager = false, sizes } = {}) {
  const img = h("img", { src, alt, loading: eager ? "eager" : "lazy", decoding: "async", sizes });
  const wrap = h("span", { class: "pic " + cls }, img);
  const done = () => wrap.classList.add("is-loaded");
  if (img.complete && img.naturalWidth) done(); else { img.addEventListener("load", done, { once: true }); img.addEventListener("error", () => wrap.classList.add("is-error"), { once: true }); }
  return wrap;
}

/* ---------- diálogos com animação de entrada/saída ---------- */
export function openDialog(dlg) {
  dlg.classList.remove("is-closing");
  if (!dlg.open) dlg.showModal();
  if (!dlg._wired) {
    dlg._wired = true;
    dlg.addEventListener("cancel", (e) => { e.preventDefault(); closeDialog(dlg); });
    dlg.addEventListener("click", (e) => { if (e.target === dlg) closeDialog(dlg); });
  }
}
export function closeDialog(dlg) {
  return new Promise((res) => {
    if (!dlg.open) return res();
    const done = () => { if (!dlg.open) return res(); dlg.classList.remove("is-closing"); dlg.close(); dlg.dispatchEvent(new Event("closed")); res(); };
    if (reduced()) return done();
    dlg.classList.add("is-closing");
    const onEnd = (e) => { if (/-out$/.test(e.animationName)) { dlg.removeEventListener("animationend", onEnd); done(); } };
    dlg.addEventListener("animationend", onEnd);
    setTimeout(done, 400);
  });
}

/* ---------- toasts ---------- */
export function toast(msg, { action, timeout = 3200, tone = "" } = {}) {
  // diálogos modais ficam na "top layer": o toast precisa morar dentro do diálogo aberto para aparecer
  const open = [...document.querySelectorAll("dialog[open]")].pop();
  let host = document.getElementById("toasts");
  if (open) host = open.querySelector(":scope > .toasts") || open.appendChild(h("div", { class: "toasts", "aria-live": "polite" }));
  const t = h("div", { class: "toast " + tone, role: "status" },
    tone === "ok" ? icon("check", { size: 18 }) : null,
    h("span", { class: "toast-msg", text: msg }));
  let timer;
  const kill = () => { clearTimeout(timer); t.classList.add("out"); setTimeout(() => t.remove(), 260); };
  if (action) t.append(h("button", { class: "toast-act", type: "button", onclick: () => { action.fn(); kill(); } }, action.icon ? icon(action.icon, { size: 16 }) : null, action.label));
  host.append(t);
  timer = setTimeout(kill, timeout);
  return kill;
}

/** Abre um link em nova aba via <a target=_blank> clicado (window.open é bloqueado na prévia). */
export function openLink(href) {
  const a = h("a", { href, target: "_blank", rel: "noopener", style: { display: "none" } });
  document.body.append(a); a.click(); setTimeout(() => a.remove(), 0);
}
export const waLink = (text) => `https://wa.me/${DOG().store.whatsapp}${text ? "?text=" + encodeURIComponent(text) : ""}`;
export const mapsLink = () => { const s = DOG().store; return `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`; };

/* ---------- loja ---------- */
export function nextOpening() {
  const hours = DOG().store.hours; const now = brNow();
  const mins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < 8; i++) {
    const d = (now.getDay() + i) % 7; const hr = hours[String(d)];
    if (!hr) continue;
    const [a, b] = hr[0].split(":").map(Number);
    if (i === 0 && mins >= a * 60 + b) continue;
    const when = i === 0 ? "hoje" : i === 1 ? "amanhã" : DAYS[d].toLowerCase();
    return `${when} às ${hm(hr[0])}`;
  }
  return "em breve";
}
export function status() {
  const s = S.storeOpen();
  if (s.open) return { open: true, label: s.closesAt ? `Aberto até ${hm(s.closesAt)}` : "Aberto agora", short: "Aberto" };
  if (s.reason === "pausa") return { open: false, short: "Pausado", label: "Pausado por alguns minutos", title: "Pausamos os pedidos por alguns minutos", cta: "Pedidos pausados" };
  if (s.reason === "manual") return { open: false, short: "Fechado", label: "Fechado no momento", title: "A loja não está recebendo pedidos agora", cta: "Loja fechada no momento" };
  const when = nextOpening();
  return { open: false, short: "Fechado", label: `Fechado · abrimos ${when}`, title: `Estamos fechados agora — abrimos ${when}`, cta: `Fechado · abrimos ${when}` };
}
export const deliveryMin = () => S.get("config").deliveryMin || DOG().store.deliveryMin || 60;
export const prepMin = () => S.get("config").prepMin || DOG().store.prepMin || 30;
export const minFee = () => Math.min(...DOG().zones.map((z) => z.fee));
export const productImg = (p, small = true) => (small && p.imgSm) || p.img;

/** Grupo de horários: ter–sex / sáb–dom / seg */
export function hoursRows() {
  const H = DOG().store.hours; const today = brNow().getDay();
  return [2, 3, 4, 5, 6, 0, 1].map((d) => ({ day: DAYS[d], today: d === today, text: H[String(d)] ? `${hm(H[String(d)][0])} – ${hm(H[String(d)][1])}` : "Fechado" }));
}
export function hoursTable() {
  return h("ul", { class: "hours" }, hoursRows().map((r) =>
    h("li", { class: r.today ? "is-today" : "" }, h("span", { text: r.day + (r.today ? " (hoje)" : "") }), h("span", { text: r.text }))));
}

/* ---------- fidelidade ---------- */
export const LOYALTY_GOAL = 500;
export function pointsFor(phone) {
  const k = digits(phone); if (!k) return 0;
  const per = DOG().store.loyalty?.pointsPerReal || 5;
  return S.get("orders").filter((o) => digits(o.customer?.phone) === k && o.status !== "cancelado")
    .reduce((a, o) => a + Math.floor((o.total || 0) * per), 0);
}
export function loyaltyCard(phone, { compact = false, name = "" } = {}) {
  const pts = pointsFor(phone); const goal = LOYALTY_GOAL;
  const inCycle = pts >= goal ? goal : pts % goal; const pct = Math.min(1, inCycle / goal);
  const stamps = 10; const filled = Math.floor(pct * stamps);
  const left = Math.max(0, goal - inCycle);
  return h("div", { class: "loyal" + (compact ? " loyal--compact" : "") },
    h("div", { class: "loyal-top" },
      h("div", {},
        h("p", { class: "loyal-eyebrow", text: name ? `Fidelidade · ${name.split(" ")[0]}` : "Cartão fidelidade" }),
        h("p", { class: "loyal-pts" }, h("strong", { text: pts.toLocaleString("pt-BR") }), " pontos")),
      h("span", { class: "loyal-badge" }, icon("gift", { size: 18 }), DOG().store.loyalty?.reward || "Entrega grátis")),
    h("div", { class: "loyal-stamps", role: "img", "aria-label": `${Math.round(pct * 100)}% do caminho até a ${(DOG().store.loyalty?.reward || "recompensa").toLowerCase()}` },
      Array.from({ length: stamps }, (_, i) => h("span", { class: "stamp" + (i < filled ? " on" : "") }, icon("paw", { size: 16, fill: i < filled })))),
    h("p", { class: "loyal-note", text: left === 0 ? "Você completou o cartão! Sua próxima entrega é grátis (ilustrativo)." : `Faltam ${left} pontos para ${(DOG().store.loyalty?.reward || "a recompensa").toLowerCase()} · 5 pontos por real` }));
}
