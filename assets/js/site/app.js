/* Site de pedidos do Dog do Salsicha — ponto de entrada. */
import { S, DOG, h, icon, clear, money, openDialog, closeDialog, hoursTable, mapsLink, waLink, toast, $ } from "./dom.js";
import { renderCover, renderClosedBanner, renderCombos, renderCatbar, renderMenu, initScrollSpy } from "./menu.js";
import { initBag, renderAll as renderBag } from "./bag.js";
import { initTracking } from "./track.js";

export function setOpenDemo() {
  S.update("config", (c) => ({ ...c, open: true, pausedUntil: null }));
  toast("Loja aberta para demonstração", { tone: "ok" });
}

export function openHours() {
  const d = $("#hoursDialog"); const st = DOG().store; clear(d);
  d.setAttribute("aria-labelledby", "hr-title");
  d.append(h("div", { class: "mini" },
    h("header", { class: "mini-head" }, h("h2", { id: "hr-title", text: "Horários e endereço" }),
      h("button", { class: "icon-btn", type: "button", "aria-label": "Fechar", onclick: () => closeDialog(d) }, icon("close", { size: 22 }))),
    hoursTable(),
    h("div", { class: "mini-addr" }, icon("pin", { size: 18 }),
      h("div", {}, h("p", { text: st.address }), h("p", { class: "muted", text: `${st.district} · ${st.city}` }),
        h("a", { class: "link", href: mapsLink(), target: "_blank", rel: "noopener" }, icon("route", { size: 16 }), "Como chegar"))),
    h("p", { class: "mini-modes" }, "Entrega, retirada no balcão e consumo no local.")));
  openDialog(d);
  d.querySelector(".icon-btn").focus();
}

function renderFooter(el) {
  const st = DOG().store; clear(el);
  const PAY = { Pix: "pix", Dinheiro: "cash", "Cartão de crédito": "card", "Cartão de débito": "card" };
  el.append(h("div", { class: "wrap foot-grid" },
    h("div", { class: "foot-brand" },
      h("img", { src: "assets/img/logo.webp", alt: "", width: 64, height: 64, loading: "lazy" }),
      h("div", {}, h("p", { class: "foot-name", text: st.name }), h("p", { class: "foot-slogan", text: (st.slogan || "").trim() }),
        h("a", { class: "btn-ghost", href: waLink("Olá! Vim pelo site."), target: "_blank", rel: "noopener" }, icon("whatsapp", { size: 18 }), st.phoneLabel))),
    h("div", {}, h("h2", { class: "foot-h", text: "Onde estamos" }),
      h("p", { text: st.address }), h("p", { text: `${st.district} · ${st.city}` }),
      h("a", { class: "foot-link", href: mapsLink(), target: "_blank", rel: "noopener" }, icon("route", { size: 16 }), "Como chegar")),
    h("div", {}, h("h2", { class: "foot-h", text: "Horários" }), hoursTable()),
    h("div", {}, h("h2", { class: "foot-h", text: "Formas de pagamento" }),
      h("ul", { class: "foot-pay" }, st.payments.map((p) => h("li", {}, icon(PAY[p] || "card", { size: 18 }), p))),
      h("p", { class: "foot-small", text: `Pedido mínimo ${money(st.minOrder)} · Entrega em Samambaia e região` }))),
    h("div", { class: "wrap foot-bottom" },
      h("p", { text: `© ${new Date().getFullYear()} ${st.name} · Esboço de demonstração` }),
      h("a", { class: "foot-admin", href: "painel.html" }, icon("lock", { size: 14 }), "Área da loja")));
}

function renderStoreState() {
  renderCover($("#capa"));
  renderClosedBanner($("#closedBanner"));
}

function boot() {
  renderStoreState();
  renderCombos($("#combosStrip"));
  renderCatbar($("#catbar"));
  renderMenu($("#cardapio"));
  renderFooter($("#rodape"));
  initBag();
  initScrollSpy();
  initTracking();
  // painel muda abrir/fechar, esgotados e preços → reflete ao vivo
  let prev = JSON.stringify(S.get("config"));
  S.watch("config", (c) => {
    const now = JSON.stringify(c); if (now === prev) return;
    const was = JSON.parse(prev); prev = now;
    renderStoreState();
    if (JSON.stringify(was.off) !== JSON.stringify(c.off) || JSON.stringify(was.prices) !== JSON.stringify(c.prices)) { renderCombos($("#combosStrip")); renderMenu($("#cardapio")); }
    renderBag();
  });
  S.watch("orders", () => renderCover($("#capa"))); // pontos da fidelidade
  setInterval(() => { renderClosedBanner($("#closedBanner")); const pill = $("#capa .pill-status"); if (pill) renderCover($("#capa")); renderBag(); }, 60000);
  document.documentElement.classList.add("is-ready");
}
boot();
