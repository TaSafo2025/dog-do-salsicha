/* Painel da loja — casca: navegação, estado ao vivo (store.watch), campainha, impressão. */
import * as store from "../store.js";
import { h, icon, clear, $, fmtTime, BRL, mmss, ago } from "./dom.js";
import { applyOverrides, CHANNELS } from "./calc.js";
import { toast, modal, btn } from "./ui.js";
import { generateDemo } from "./demo.js";
import inicio from "./inicio.js";
import pedidos, { openOrder, newOrderPDV, printOrder } from "./pedidos.js";
import cozinha from "./cozinha.js";
import cardapio from "./cardapio.js";
import estoque from "./estoque.js";
import financeiro from "./financeiro.js";
import caixa from "./caixa.js";
import clientes from "./clientes.js";
import whatsapp from "./whatsapp.js";
import relatorios from "./relatorios.js";
import config from "./config.js";

const VIEWS = [
  { id: "inicio", label: "Início", icon: "home", mod: inicio },
  { id: "pedidos", label: "Pedidos", icon: "orders", mod: pedidos },
  { id: "cozinha", label: "Cozinha", icon: "flame", mod: cozinha },
  { id: "cardapio", label: "Cardápio", icon: "menu", mod: cardapio },
  { id: "estoque", label: "Estoque", icon: "box", mod: estoque },
  { id: "financeiro", label: "Financeiro", icon: "wallet", mod: financeiro },
  { id: "caixa", label: "Caixa", icon: "register", mod: caixa },
  { id: "clientes", label: "Clientes", icon: "users", mod: clientes },
  { id: "whatsapp", label: "WhatsApp", icon: "chat", mod: whatsapp },
  { id: "relatorios", label: "Relatórios", icon: "chart", mod: relatorios },
  { id: "config", label: "Configurações", icon: "gear", mod: config }
];
const GROUPS = [["Operação", ["inicio", "pedidos", "cozinha", "caixa"]], ["Gestão", ["cardapio", "estoque", "financeiro", "relatorios"]], ["Relacionamento", ["clientes", "whatsapp"]], ["", ["config"]]];
const BOTTOM = ["inicio", "pedidos", "cozinha", "estoque"];
const KEYS = ["orders", "stock", "stockMoves", "finance", "config", "wa", "customers"];
const LS = { get: (k, d) => { try { const v = localStorage.getItem("dogpainel." + k); return v == null ? d : JSON.parse(v); } catch { return d; } }, set: (k, v) => { try { localStorage.setItem("dogpainel." + k, JSON.stringify(v)); } catch { } } };

/* ---------- estado ---------- */
const state = Object.fromEntries(KEYS.map((k) => [k, store.get(k)]));
let current = null, currentNode = null, cleanup = null, pending = new Set(), raf = 0;

export const ctx = {
  state, store, LS, VIEWS,
  go: (id, sub) => { location.hash = "#/" + id + (sub ? "/" + sub : ""); },
  route: () => (location.hash.replace(/^#\/?/, "").split("/")),
  rerender: () => render(true),
  openOrder: (id) => openOrder(ctx, id),
  newOrder: () => newOrderPDV(ctx),
  print: (o) => printOrder(o),
  sound: { on: LS.get("sound", true), ring }
};

/* ---------- campainha (Web Audio) ---------- */
let ac;
function audio() { try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); if (ac.state === "suspended") ac.resume(); } catch { } return ac; }
addEventListener("pointerdown", () => audio(), { once: true });
function ring() {
  if (!ctx.sound.on) return; const a = audio(); if (!a) return;
  const t = a.currentTime;
  [[880, 0], [660, 0.22], [880, 0.62], [660, 0.84]].forEach(([f, d]) => {
    const o = a.createOscillator(), g = a.createGain(); o.type = "triangle"; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t + d); g.gain.exponentialRampToValueAtTime(0.35, t + d + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.38);
    o.connect(g).connect(a.destination); o.start(t + d); o.stop(t + d + 0.4);
  });
}
let seen = new Set(state.orders.map((o) => o.id));
let ringing = new Set();
function onOrders(list) {
  const fresh = list.filter((o) => !seen.has(o.id));
  for (const o of fresh) {
    seen.add(o.id);
    if (o.status === "novo") {
      ringing.add(o.id); ring();
      toast(`Novo pedido ${o.id} · ${CHANNELS[o.channel]?.short || o.channel} · ${BRL(o.total)}`, { kind: "new", action: { label: "Ver", onclick: () => { ctx.go("pedidos"); setTimeout(() => ctx.openOrder(o.id), 50); } }, ms: 7000 });
      document.title = "(" + list.filter((x) => x.status === "novo").length + ") Novo pedido · Painel";
    }
  }
  for (const id of ringing) if (!list.some((o) => o.id === id && o.status === "novo")) ringing.delete(id);
  if (!list.some((o) => o.status === "novo")) document.title = "Painel da loja · Dog do Salsicha";
  updateBadges();
}
setInterval(() => { if (ringing.size) ring(); }, 30000);

/* ---------- casca ---------- */
const app = $("#app"), side = $("#side"), view = $("#view"), top = $("#top"), bottom = $("#bottom");
function navItem(v, small) {
  return h("a", { href: "#/" + v.id, class: "nav-i", dataset: { id: v.id }, title: v.label, "aria-label": v.label },
    h("span", { class: "nav-ico" }, icon(v.icon, small ? 22 : 20)), h("span", { class: "nav-t" }, v.label), h("span", { class: "nav-b", dataset: { badge: v.id } }));
}
function buildSide() {
  clear(side);
  side.append(
    h("div", { class: "brand" }, h("img", { src: "assets/img/logo.webp", alt: "", width: 40, height: 40 }),
      h("div", { class: "brand-t" }, h("strong", {}, "Dog do Salsicha"), h("span", {}, "Painel da loja"))),
    h("nav", { class: "nav", "aria-label": "Áreas do painel" }, GROUPS.map(([g, ids]) => h("div", { class: "nav-g" }, g ? h("span", { class: "nav-gl" }, g) : null, ids.map((id) => navItem(VIEWS.find((v) => v.id === id)))))),
    h("div", { class: "side-foot" },
      h("a", { class: "side-site", href: "index.html", target: "_blank", rel: "noopener" }, icon("store", 18), h("span", { class: "nav-t" }, "Abrir site do cliente")),
      h("button", { class: "side-col", type: "button", "aria-label": "Recolher menu", title: "Recolher menu", onclick: () => { const c = !app.classList.contains("collapsed"); app.classList.toggle("collapsed", c); LS.set("collapsed", c); } }, icon("collapse", 18), h("span", { class: "nav-t" }, "Recolher"))));
  clear(bottom);
  bottom.append(BOTTOM.map((id) => navItem(VIEWS.find((v) => v.id === id), true)),
    h("button", { class: "nav-i", type: "button", "aria-label": "Mais áreas", onclick: moreSheet }, h("span", { class: "nav-ico" }, icon("grid", 22)), h("span", { class: "nav-t" }, "Mais"), h("span", { class: "nav-b", dataset: { badge: "more" } })));
}
function moreSheet() {
  const m = modal({ title: "Todas as áreas", size: "sm", cls: "sheet", body: h("div", { class: "more-grid" }, VIEWS.map((v) => h("a", { href: "#/" + v.id, class: "more-i", onclick: () => m.close() }, icon(v.icon, 22), h("span", {}, v.label)))) });
}
function storeBadge() {
  const st = store.storeOpen(); const c = state.config;
  let label, tone;
  if (st.open) { label = "Loja aberta" + (st.closesAt ? " · até " + st.closesAt.replace(":", "h") : ""); tone = "ok"; }
  else if (st.reason === "pausa") { label = "Pausada até " + fmtTime(c.pausedUntil); tone = "warn"; }
  else if (st.reason === "manual") { label = "Fechada (manual)"; tone = "bad"; }
  else { label = "Fechada" + (st.opensAt ? " · abre " + st.opensAt.replace(":", "h") : ""); tone = "muted"; }
  return h("button", { type: "button", class: "store-st st-" + tone, onclick: storeMenu, "aria-label": label + ". Alterar" }, h("i", { class: "pulse" }), h("span", { class: "st-long" }, label), h("span", { class: "st-short" }, label.split(" · ")[0].replace("Loja ", "").replace(/^./, (c) => c.toUpperCase())), icon("chevd", 16));
}
function storeMenu() {
  const set = (patch, msg) => { store.update("config", (c) => ({ ...c, ...patch })); toast(msg); m.close(); };
  const st = store.storeOpen();
  const m = modal({ title: "Status da loja", sub: "Vale para o site e o cardápio na hora.", size: "sm", body: h("div", { class: "stack" },
    h("div", { class: "store-now st-" + (st.open ? "ok" : "bad") }, icon(st.open ? "store" : "moon", 22), h("strong", {}, st.open ? "Recebendo pedidos agora" : "Não está recebendo pedidos")),
    btn("Abrir agora", { kind: "primary", icon: "power", onclick: () => set({ open: true, pausedUntil: null }, "Loja aberta — o site já aceita pedidos.") }),
    h("div", { class: "row2" }, btn("Pausar 15 min", { icon: "pause", onclick: () => set({ pausedUntil: Date.now() + 15 * 60000 }, "Pausado por 15 minutos.") }), btn("Pausar 30 min", { icon: "pause", onclick: () => set({ pausedUntil: Date.now() + 30 * 60000 }, "Pausado por 30 minutos.") })),
    btn("Fechar a loja", { kind: "danger-ghost", icon: "x", onclick: () => set({ open: false, pausedUntil: null }, "Loja fechada.") }),
    btn("Automático (pelo horário)", { icon: "clock", onclick: () => set({ open: null, pausedUntil: null }, "Seguindo o horário de funcionamento.") })) });
}
function buildTop(v) {
  clear(top);
  top.append(
    h("div", { class: "top-l" }, h("img", { class: "top-logo", src: "assets/img/logo.webp", alt: "", width: 32, height: 32 }),
      h("div", {}, h("h1", { class: "top-title" }, v.label), h("p", { class: "top-date" }, new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })))),
    h("div", { class: "top-r" }, storeBadge(),
      h("button", { type: "button", class: "icon-btn snd" + (ctx.sound.on ? " on" : ""), "aria-pressed": String(ctx.sound.on), title: ctx.sound.on ? "Som de pedido novo ligado" : "Som desligado", "aria-label": "Som de pedido novo",
        onclick: (e) => { ctx.sound.on = !ctx.sound.on; LS.set("sound", ctx.sound.on); if (ctx.sound.on) { audio(); ring(); } buildTop(v); } }, icon(ctx.sound.on ? "bell" : "belloff", 18)),
      btn("Novo pedido", { kind: "primary", icon: "plus", onclick: () => ctx.newOrder(), attrs: { class: "btn btn-primary top-new" } })));
}
function updateBadges() {
  const n = state.orders.filter((o) => o.status === "novo").length;
  const kitchen = state.orders.filter((o) => o.status === "preparo" || o.status === "aceito").length;
  document.querySelectorAll("[data-badge]").forEach((b) => {
    const v = b.dataset.badge === "pedidos" ? n : b.dataset.badge === "cozinha" ? kitchen : 0;
    b.textContent = v ? String(v) : ""; b.classList.toggle("on", !!v); b.classList.toggle("hot", b.dataset.badge === "pedidos" && !!v);
  });
}

/* ---------- render ---------- */
function render(force) {
  const [id] = ctx.route(); const v = VIEWS.find((x) => x.id === id) || VIEWS[0];
  const same = current === v;
  const keep = same ? { y: scrollY, fk: document.activeElement?.dataset?.fk, sel: document.activeElement?.selectionStart } : null;
  if (!same) { cleanup?.(); cleanup = null; }
  current = v;
  document.querySelectorAll(".nav-i[data-id]").forEach((a) => { const on = a.dataset.id === v.id; a.classList.toggle("on", on); on ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"); });
  document.body.dataset.view = v.id;
  buildTop(v);
  const node = h("div", { class: "view-in view-" + v.id });
  try { node.append(v.mod.render(ctx)); } catch (e) { console.error(e); node.append(h("p", { class: "muted" }, "Erro ao montar esta área.")); }
  clear(view).append(node); currentNode = node;
  if (!same) { scrollTo(0, 0); cleanup = v.mod.mount?.(node, ctx) || null; }
  else if (keep) {
    scrollTo(0, keep.y);
    if (keep.fk) { const el = node.querySelector(`[data-fk="${keep.fk}"]`); if (el) { el.focus(); try { if (keep.sel != null) el.setSelectionRange(keep.sel, keep.sel); } catch { } } }
    v.mod.mount?.(node, ctx, true);
  }
  updateBadges(); tick();
}
function schedule(key) {
  pending.add(key);
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(() => {
    const deps = current?.mod.deps || KEYS; const hit = [...pending].some((k) => deps.includes(k)); pending.clear();
    if (hit) render(true); else buildTop(current || VIEWS[0]);
  });
}

/* cronômetros */
function tick() {
  const now = Date.now();
  document.querySelectorAll("[data-since]").forEach((el) => {
    const ms = now - Number(el.dataset.since); el.textContent = mmss(ms);
    const warn = Number(el.dataset.warn || 20) * 60000, bad = Number(el.dataset.bad || 35) * 60000;
    el.classList.toggle("t-warn", ms >= warn && ms < bad); el.classList.toggle("t-bad", ms >= bad);
  });
  document.querySelectorAll("[data-ago]").forEach((el) => { el.textContent = ago(Number(el.dataset.ago), now); });
}
setInterval(tick, 1000);
setInterval(() => buildTop(current || VIEWS[0]), 30000);

/* ---------- boot ---------- */
function boot() {
  app.classList.toggle("collapsed", LS.get("collapsed", innerWidth < 1200 && innerWidth > 760));
  buildSide();
  const cfg = store.get("config");
  if (!cfg.demo && state.orders.length < 20) { generateDemo(); for (const k of KEYS) state[k] = store.get(k); seen = new Set(state.orders.map((o) => o.id)); }
  applyOverrides(state.config);
  for (const k of KEYS) store.watch(k, (v) => { state[k] = v; if (k === "config") applyOverrides(v); if (k === "orders") onOrders(v); schedule(k); });
  addEventListener("hashchange", () => render());
  render();
}
boot();
window.__painel = ctx; // útil para testes
