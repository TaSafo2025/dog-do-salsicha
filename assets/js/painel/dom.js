/* Utilitários de DOM do painel — nada de innerHTML com dados: tudo via createElement/textContent. */
const SVGNS = "http://www.w3.org/2000/svg";

function isKid(a) { return a == null || typeof a !== "object" || a instanceof Node || Array.isArray(a); }
function addKids(el, kids) {
  for (const k of kids.flat(Infinity)) {
    if (k == null || k === false || k === true) continue;
    el.append(k instanceof Node ? k : document.createTextNode(String(k)));
  }
}
const PROPS = new Set(["value", "checked", "disabled", "selected", "textContent", "indeterminate", "open", "multiple", "readOnly", "hidden"]);

/** h("div", {class, onclick, ...}, ...filhos) */
export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  if (isKid(attrs)) kids.unshift(attrs); else setAttrs(el, attrs, false);
  addKids(el, kids);
  return el;
}
/** s("path", {d}) — elementos SVG */
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(SVGNS, tag);
  if (isKid(attrs)) kids.unshift(attrs); else setAttrs(el, attrs, true);
  addKids(el, kids);
  return el;
}
function setAttrs(el, a, svg) {
  for (const [k, v] of Object.entries(a)) {
    if (v == null || v === false) continue;
    if (k === "class") { svg ? el.setAttribute("class", v) : (el.className = v); }
    else if (k === "style" && typeof v === "object") { for (const [sk, sv] of Object.entries(v)) sk.startsWith("--") ? el.style.setProperty(sk, sv) : (el.style[sk] = sv); }
    else if (k === "dataset") Object.assign(el.dataset, v);
    else if (k.startsWith("on") && typeof v === "function") el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (!svg && PROPS.has(k)) el[k] = v;
    else el.setAttribute(k, v === true ? "" : String(v));
  }
}
export const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); return el; };
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ---------- ícones (traço 1.8, desenhados para o painel) ---------- */
const I = {
  home: ["M3 10.5 12 3l9 7.5", "M5 9.5V20h14V9.5", "M10 20v-5h4v5"],
  orders: ["M6 3h12v18l-3-2-3 2-3-2-3 2z", "M9 8h6", "M9 12h6", "M9 16h3"],
  flame: ["M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2.5 1.5-3.8 2.5-5 .4 1.6 1.2 2.4 2 2.8C11 8 11 5.5 12 3z"],
  menu: ["M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z", "M13 4h5.5A1.5 1.5 0 0 1 20 5.5v13a1.5 1.5 0 0 1-1.5 1.5H13z", "M7 8h1.5", "M16 8h1.5", "M7 12h1.5", "M16 12h1.5"],
  box: ["M3.5 7.5 12 3l8.5 4.5v9L12 21l-8.5-4.5z", "M3.5 7.5 12 12l8.5-4.5", "M12 12v9", "M7.8 5.3l8.4 4.5"],
  wallet: ["M4 7.5A2.5 2.5 0 0 1 6.5 5H19v3", "M4 7.5V17a2 2 0 0 0 2 2h14V9H6.5A2.5 2.5 0 0 1 4 7.5z", "M16.5 14h.01"],
  register: ["M4 11h16v9H4z", "M6 11V6h7v5", "M15 8h3v3", "M8 15h2", "M12 15h4", "M8 8h3"],
  users: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M2.5 20a6.5 6.5 0 0 1 13 0", "M16 4.5a3.5 3.5 0 0 1 0 6.5", "M18 14.2a6.5 6.5 0 0 1 3.5 5.8"],
  chat: ["M4 18.5 5.3 15A8 8 0 1 1 9 18.8z", "M9 9.5c0 2.5 2.5 5 5 5l1.2-1.3-1.8-1-1 .8a3.6 3.6 0 0 1-1.9-1.9l.8-1-1-1.8z"],
  chart: ["M4 20V4", "M4 20h16", "M8 16v-4", "M12 16V8", "M16 16v-6", "M20 16V6"],
  gear: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.5-2-3.4-2.3.9a7.5 7.5 0 0 0-2.6-1.5L14 2.6h-4l-.5 2.4A7.5 7.5 0 0 0 6.9 6.5l-2.3-.9-2 3.4 2 1.5a7.6 7.6 0 0 0 0 3l-2 1.5 2 3.4 2.3-.9a7.5 7.5 0 0 0 2.6 1.5l.5 2.4h4l.5-2.4a7.5 7.5 0 0 0 2.6-1.5l2.3.9 2-3.4z"],
  plus: ["M12 5v14", "M5 12h14"], minus: ["M5 12h14"],
  bell: ["M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15z", "M10 20.5a2 2 0 0 0 4 0"],
  belloff: ["M6 16V11a6 6 0 0 1 9.5-4.9", "M18 11v5l1.5 2H8", "M10 20.5a2 2 0 0 0 4 0", "M3 3l18 18"],
  printer: ["M7 9V3h10v6", "M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3", "M7 14h10v7H7z"],
  check: ["M4.5 12.5 9.5 17.5 19.5 7"], x: ["M6 6l12 12", "M18 6 6 18"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7v5l3 2"],
  bike: ["M5.5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18.5 18a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M5.5 15 9 9h5l4.5 6", "M8 6h3l3 9", "M15 6h2.5"],
  search: ["M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z", "M20 20l-4-4"],
  chevl: ["M15 5l-7 7 7 7"], chevr: ["M9 5l7 7-7 7"], chevd: ["M5 9l7 7 7-7"],
  alert: ["M12 3 2.5 20h19z", "M12 9.5v5", "M12 17.5h.01"],
  up: ["M12 19V5", "M6 11l6-6 6 6"], down: ["M12 5v14", "M6 13l6 6 6-6"],
  store: ["M3 9l1.5-5h15L21 9", "M3 9a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0", "M5 11.5V20h14v-8.5", "M10 20v-5h4v5"],
  pause: ["M9 5v14", "M15 5v14"], play: ["M7 4.5v15L19 12z"],
  power: ["M12 3v8", "M6.3 6.8a8 8 0 1 0 11.4 0"],
  edit: ["M4 20h4L19 9l-4-4L4 16z", "M13.5 6.5l4 4"],
  trash: ["M4 7h16", "M9 7V4h6v3", "M6 7l1 13h10l1-13"],
  cart: ["M3 4h2.5l2 11h10.5l2-8H7", "M9.5 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "M17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"],
  send: ["M21 3 10 14", "M21 3l-7 18-4-7-7-4z"],
  refresh: ["M20 11a8 8 0 0 0-14.6-4.5L4 8", "M4 4v4h4", "M4 13a8 8 0 0 0 14.6 4.5L20 16", "M20 20v-4h-4"],
  phone: ["M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z"],
  star: ["M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 11v5", "M12 7.5h.01"],
  package: ["M4 8h16v12H4z", "M3 4h18v4H3z", "M10 12h4"],
  more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
  grid: ["M4 4h7v7H4z", "M13 4h7v7h-7z", "M4 13h7v7H4z", "M13 13h7v7h-7z"],
  expand: ["M4 9V4h5", "M20 9V4h-5", "M4 15v5h5", "M20 15v5h-5"],
  collapse: ["M15 5l-7 7 7 7", "M20 4v16"],
  trend: ["M3 17l6-6 4 4 8-8", "M15 7h6v6"],
  tag: ["M3 12V4h8l10 10-8 8z", "M7.5 8.5h.01"],
  bolt: ["M13 2 4 14h7l-1 8 9-12h-7z"],
  shield: ["M12 3l8 3v6c0 4.5-3.4 8.2-8 9-4.6-.8-8-4.5-8-9V6z", "M8.5 12l2.5 2.5 4.5-5"],
  calendar: ["M4 6h16v14H4z", "M4 10h16", "M8 3v5", "M16 3v5"],
  arrowr: ["M5 12h14", "M13 6l6 6-6 6"],
  list: ["M8 6h12", "M8 12h12", "M8 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
  cash: ["M3 7h18v10H3z", "M12 14.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z", "M6 10v4", "M18 10v4"],
  card: ["M3 6h18v12H3z", "M3 10h18", "M7 15h4"],
  pix: ["M12 3l4 4-4 4-4-4z", "M12 13l4 4-4 4-4-4z", "M3 12l4-4 4 4-4 4z", "M13 12l4-4 4 4-4 4z"],
  moon: ["M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"],
  lock: ["M6 11h12v9H6z", "M8.5 11V8a3.5 3.5 0 0 1 7 0v3"],
  eye: ["M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z", "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"],
  map: ["M9 4 3 6.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5z", "M9 4v13.5", "M15 6.5V20"],
  sparkle: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z", "M19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"],
  drop: ["M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"],
  logo: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"]
};
export function icon(name, size = 20, cls = "") {
  const paths = I[name] || I.info;
  return s("svg", { viewBox: "0 0 24 24", width: size, height: size, fill: "none", stroke: "currentColor", "stroke-width": 1.8,
    "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true", class: "ico " + cls },
    paths.map((d) => s("path", { d })));
}

/* ---------- formatação ---------- */
export const BRL = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
export const BRL0 = (n) => (Number(n) || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0, minimumFractionDigits: 0 });
export const num = (n, d = 0) => (Number(n) || 0).toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d });
export const pct = (n, d = 1) => (Number.isFinite(n) ? (n * 100).toLocaleString("pt-BR", { maximumFractionDigits: d, minimumFractionDigits: d }) : "—") + "%";
export const DAY = 86400000;
export const startOfDay = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
export const dayKey = (t) => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
export const WD = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const WDL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
export const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
export const fmtDate = (t) => new Date(t).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
export const fmtDateLong = (t) => new Date(t).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short" }).replace(/\./g, "");
export const fmtTime = (t) => new Date(t).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
export const fmtDT = (t) => fmtDate(t) + " " + fmtTime(t);
export function ago(t, now = Date.now()) {
  const m = Math.floor((now - t) / 60000);
  if (m < 1) return "agora"; if (m < 60) return m + " min"; const hh = Math.floor(m / 60);
  if (hh < 24) return hh + " h " + (m % 60 ? (m % 60) + " min" : ""); const d = Math.floor(hh / 24); return d === 1 ? "ontem" : d + " dias";
}
export const mmss = (ms) => { const t = Math.max(0, Math.floor(ms / 1000)); const m = Math.floor(t / 60); return (m >= 60 ? Math.floor(m / 60) + ":" + String(m % 60).padStart(2, "0") : m) + ":" + String(t % 60).padStart(2, "0"); };
export const phoneFmt = (p) => { const d = String(p || "").replace(/\D/g, "").replace(/^55/, ""); return d.length === 11 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length === 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : p || ""; };
export const initials = (n) => String(n || "?").trim().split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
export function plural(n, one, many) { return n === 1 ? one : many; }
export const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export function debounce(fn, ms = 60) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }
