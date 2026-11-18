/* Capa, destaque dos combos, barra de categorias (scroll-spy), busca e cardápio. */
import { S, DOG, h, icon, pic, clear, money, norm, status, deliveryMin, minFee, waLink, mapsLink, lsGet, loyaltyCard, productImg, $, reduced } from "./dom.js";
import { openProduct } from "./product.js";
import { openHours, setOpenDemo } from "./app.js";

const P = (id) => DOG().products[id];

/* ---------------- capa ---------------- */
export function renderCover(root) {
  const st = DOG().store; const s = status();
  const me = lsGet("dog.site.me", null);
  clear(root);
  const media = h("div", { class: "cover-media" },
    pic("assets/img/hero.webp", "Dog prensado do Dog do Salsicha", { cls: "cover-photo", eager: true }),
    h("span", { class: "cover-sticker", "aria-hidden": "true" }, h("span", { text: "Prensado" }), h("strong", { text: "na chapa" })));
  const statusPill = h("span", { class: "pill-status " + (s.open ? "is-open" : "is-closed") },
    h("span", { class: "dot", "aria-hidden": "true" }), s.label);
  const info = h("div", { class: "cover-info" },
    h("div", { class: "cover-brand" },
      h("img", { class: "cover-logo", src: "assets/img/logo.webp", alt: "Logo Dog do Salsicha", width: 96, height: 96 }),
      h("div", {},
        h("p", { class: "cover-eyebrow" }, icon("pin", { size: 14 }), `${st.district} · Brasília`),
        h("h1", { class: "cover-title", text: st.name }))),
    h("p", { class: "cover-slogan", text: (st.slogan || "").trim() }),
    h("div", { class: "cover-status" }, statusPill),
    h("ul", { class: "cover-meta", "aria-label": "Informações de entrega" },
      h("li", {}, icon("clock", { size: 18 }), h("span", {}, h("strong", { text: `${deliveryMin() - 10}–${deliveryMin()} min` }), " entrega")),
      h("li", {}, icon("moto", { size: 18 }), h("span", {}, "taxa a partir de ", h("strong", { text: money(minFee()) }))),
      h("li", {}, icon("bag", { size: 18 }), h("span", {}, "pedido mín. ", h("strong", { text: money(st.minOrder) })))),
    h("div", { class: "cover-actions" },
      h("a", { class: "btn-cta", href: "#cardapio", onclick: (e) => { e.preventDefault(); document.getElementById("cardapio").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }); } }, "Ver cardápio", icon("arrowR", { size: 18 })),
      h("a", { class: "btn-ghost", href: waLink("Olá! Vim pelo site do Dog do Salsicha."), target: "_blank", rel: "noopener" }, icon("whatsapp", { size: 18 }), "WhatsApp"),
      h("a", { class: "btn-ghost", href: mapsLink(), target: "_blank", rel: "noopener" }, icon("route", { size: 18 }), "Como chegar"),
      h("button", { class: "btn-ghost", type: "button", onclick: openHours }, icon("clock", { size: 18 }), "Horários")),
    me?.phone ? h("div", { class: "cover-loyal" }, loyaltyCard(me.phone, { compact: true, name: me.name })) : null);
  root.append(h("div", { class: "wrap cover-grid" }, media, info));
}

export function renderClosedBanner(el) {
  const s = status();
  clear(el); el.hidden = s.open;
  if (s.open) return;
  el.append(h("div", { class: "wrap closed-inner" },
    h("span", { class: "closed-ic" }, icon("moon", { size: 22 })),
    h("div", { class: "closed-text" },
      h("p", { class: "closed-title", text: s.title }),
      h("p", { class: "closed-sub", text: "Dá para olhar o cardápio e montar a sacola à vontade. Os pedidos voltam assim que a chapa esquentar." })),
    h("button", { class: "closed-demo", type: "button", onclick: setOpenDemo }, "Ver como se estivesse aberto (demonstração)")));
}

/* ---------------- combos (destaque da capa) ---------------- */
const includesText = (p) => p.combo?.includes.map((i) => `${i.qty}× ${P(i.product)?.name || i.product}`).join(" + ") || "";
export function renderCombos(root) {
  const cat = DOG().cats.find((c) => c.id === "combos"); if (!cat) return;
  clear(root);
  root.append(h("div", { class: "wrap" },
    h("div", { class: "combos-head" },
      h("div", {},
        h("p", { class: "eyebrow eyebrow--gold" }, icon("sparkle", { size: 14 }), "Combos da Turma do Mistério"),
        h("h2", { class: "combos-title", text: "Mistério resolvido: a fome." })),
      h("p", { class: "combos-sub", text: "Do lanche solo ao rolê da família — sempre mais em conta que separado." })),
    h("div", { class: "combos-track", role: "list" }, cat.items.map((id) => comboCard(P(id))))));
}
function comboCard(p) {
  const off = S.isOff(p.id); const price = S.priceOf(p.id); const full = p.combo?.fullPrice;
  const save = full && full > price ? full - price : 0;
  return h("article", { class: "combo" + (off ? " is-off" : ""), role: "listitem" },
    h("div", { class: "combo-media" }, pic(productImg(p), "", { cls: "combo-pic" }),
      h("span", { class: "combo-tag", text: p.combo?.tag || "Combo" }),
      save ? h("span", { class: "combo-save", text: `Economize ${money(save)}` }) : null),
    h("div", { class: "combo-body" },
      h("h3", { class: "combo-name" }, h("button", { class: "hit", type: "button", disabled: off, onclick: () => openProduct(p.id) }, p.name.replace(/^Combo /, ""))),
      h("p", { class: "combo-inc", text: includesText(p) || p.desc }),
      h("p", { class: "combo-price" },
        full && full > price ? h("span", { class: "was" }, "de ", h("s", { text: money(full) })) : null,
        h("span", { class: "now" }, full && full > price ? "por " : "", h("strong", { text: money(price) }))),
      off ? h("span", { class: "soldout", text: "Esgotado hoje" }) : h("span", { class: "combo-cta", "aria-hidden": "true" }, icon("plus", { size: 18 }))));
}

/* ---------------- cardápio ---------------- */
export function productRow(p) {
  const off = S.isOff(p.id); const price = S.priceOf(p.id); const full = p.combo?.fullPrice;
  return h("article", { class: "prod" + (off ? " is-off" : ""), "data-id": p.id },
    h("div", { class: "prod-text" },
      h("h3", { class: "prod-name" }, off
        ? h("span", { text: p.name })
        : h("button", { class: "hit", type: "button", onclick: () => openProduct(p.id), "aria-label": `${p.name}, ${money(price)}. Ver detalhes` }, p.name)),
      h("p", { class: "prod-desc", text: p.combo ? includesText(p) : p.desc }),
      h("p", { class: "prod-price" },
        full && full > price ? h("s", { class: "was", text: money(full) }) : null,
        h("strong", { text: money(price) }),
        off ? h("span", { class: "soldout", text: "Esgotado hoje" }) : null)),
    h("div", { class: "prod-media" }, pic(productImg(p), "", { cls: "prod-pic" }),
      off ? null : h("span", { class: "prod-add", "aria-hidden": "true" }, icon("plus", { size: 18 }))));
}

function topCard(p, rank) {
  const off = S.isOff(p.id);
  return h("article", { class: "top" + (off ? " is-off" : ""), role: "listitem" },
    h("div", { class: "top-media" }, pic(productImg(p), "", { cls: "top-pic" }), h("span", { class: "top-rank", "aria-hidden": "true", text: String(rank) })),
    h("h3", { class: "top-name" }, off ? h("span", { text: p.name }) : h("button", { class: "hit", type: "button", onclick: () => openProduct(p.id) }, p.name)),
    h("p", { class: "top-price" }, h("strong", { text: money(S.priceOf(p.id)) }), off ? h("span", { class: "soldout", text: "Esgotado hoje" }) : null));
}

/** trilho horizontal com setas (mouse) */
function rail(track) {
  const prev = h("button", { class: "rail-btn rail-prev", type: "button", "aria-label": "Ver anteriores", tabindex: "-1", onclick: () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: reduced() ? "auto" : "smooth" }) }, icon("chevL", { size: 20 }));
  const next = h("button", { class: "rail-btn rail-next", type: "button", "aria-label": "Ver próximos", tabindex: "-1", onclick: () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: reduced() ? "auto" : "smooth" }) }, icon("chevR", { size: 20 }));
  const sync = () => { prev.disabled = track.scrollLeft < 8; next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 8; };
  track.addEventListener("scroll", sync, { passive: true }); requestAnimationFrame(sync); addEventListener("resize", sync);
  return h("div", { class: "rail" }, prev, track, next);
}

export function renderMenu(main) {
  const sections = $("#sections", main); clear(sections);
  for (const c of DOG().cats) {
    const items = c.items.map(P).filter(Boolean);
    if (!items.length) continue;
    const sorted = c.id === "mais-pedidos" ? items : [...items.filter((p) => !S.isOff(p.id)), ...items.filter((p) => S.isOff(p.id))];
    const head = h("header", { class: "sec-head" },
      h("h2", { class: "sec-title", id: `t-${c.id}` }, c.name),
      h("span", { class: "sec-count", text: c.id === "mais-pedidos" ? "Os queridinhos de Samambaia" : `${items.length} ${items.length === 1 ? "item" : "itens"}` }));
    const body = c.id === "mais-pedidos"
      ? rail(h("div", { class: "top-track", role: "list" }, sorted.map((p, i) => topCard(p, i + 1))))
      : h("div", { class: "prod-grid" }, sorted.map(productRow));
    sections.append(h("section", { class: "sec sec--" + c.id, id: `cat-${c.id}`, "aria-labelledby": `t-${c.id}` }, head, body));
  }
  runSearch();
}

/* ---------------- barra de categorias + busca ---------------- */
let searchInput, results;
export function renderCatbar(nav) {
  clear(nav);
  searchInput = h("input", { id: "busca", type: "search", placeholder: "Buscar no cardápio", autocomplete: "off", enterkeyhint: "search", "aria-label": "Buscar no cardápio", oninput: runSearch,
    onkeydown: (e) => { if (e.key === "Escape") { searchInput.value = ""; runSearch(); closeSearch(); } } });
  const chips = h("div", { class: "chips", id: "chips" },
    DOG().cats.map((c) => h("a", { class: "chip", href: `#cat-${c.id}`, "data-cat": c.id, onclick: (e) => { e.preventDefault(); goCat(c.id); } }, c.name)));
  const toggle = h("button", { class: "search-toggle", type: "button", "aria-label": "Buscar no cardápio", "aria-controls": "busca", onclick: openSearch }, icon("search", { size: 20 }));
  const field = h("div", { class: "search-field" },
    icon("search", { size: 18, cls: "search-ic" }), searchInput,
    h("button", { class: "search-close", type: "button", "aria-label": "Fechar busca", onclick: () => { searchInput.value = ""; runSearch(); closeSearch(); } }, icon("close", { size: 18 })));
  nav.append(h("div", { class: "catbar-inner" }, toggle, chips, field));
}
function openSearch() { $("#catbar").classList.add("is-searching"); searchInput.focus(); }
function closeSearch() { $("#catbar").classList.remove("is-searching"); }

export function runSearch() {
  const main = $("#cardapio"); if (!searchInput || !main) return;
  const q = norm(searchInput.value);
  results = results || $("#results", main);
  main.classList.toggle("is-searching", !!q);
  clear(results); results.hidden = !q;
  if (!q) return;
  const terms = q.split(/\s+/).filter(Boolean);
  const seen = new Set(); const found = [];
  for (const c of DOG().cats) for (const id of c.items) {
    const p = P(id); if (!p || seen.has(id)) continue; seen.add(id);
    const hay = norm(`${p.name} ${p.desc} ${c.name} ${includesText(p)}`);
    if (terms.every((t) => hay.includes(t))) found.push(p);
  }
  found.sort((a, b) => Number(norm(b.name).includes(terms[0])) - Number(norm(a.name).includes(terms[0])) || Number(S.isOff(a.id)) - Number(S.isOff(b.id)));
  results.append(h("header", { class: "sec-head" },
    h("h2", { class: "sec-title", text: found.length ? `Resultados para “${searchInput.value.trim()}”` : "Nada por aqui" }),
    h("span", { class: "sec-count", role: "status", text: found.length ? `${found.length} ${found.length === 1 ? "item" : "itens"}` : "" })));
  if (found.length) results.append(h("div", { class: "prod-grid" }, found.map(productRow)));
  else results.append(h("div", { class: "empty-search" },
    h("p", { text: `Não achamos “${searchInput.value.trim()}” no cardápio.` }),
    h("a", { class: "link", href: waLink(`Olá! Vocês têm ${searchInput.value.trim()}?`), target: "_blank", rel: "noopener" }, icon("whatsapp", { size: 16 }), "Perguntar no WhatsApp")));
}

function goCat(id) {
  if (searchInput?.value) { searchInput.value = ""; runSearch(); closeSearch(); }
  const sec = document.getElementById(`cat-${id}`); if (!sec) return;
  spyLock = Date.now() + 900; setActive(id);
  sec.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
  const t = sec.querySelector(".sec-title"); t?.setAttribute("tabindex", "-1"); t?.focus({ preventScroll: true });
}

let active = null, spyLock = 0;
function setActive(id) {
  if (id === active) return; active = id;
  const chips = $("#chips"); if (!chips) return;
  for (const c of chips.children) { const on = c.dataset.cat === id; c.classList.toggle("is-active", on); on ? c.setAttribute("aria-current", "true") : c.removeAttribute("aria-current"); }
  const chip = chips.querySelector(`[data-cat="${id}"]`);
  if (chip) chips.scrollTo({ left: chip.offsetLeft - chips.clientWidth / 2 + chip.clientWidth / 2, behavior: reduced() ? "auto" : "smooth" });
}
export function initScrollSpy() {
  let ticking = false;
  const run = () => {
    ticking = false;
    const bar = $("#catbar"); const off = bar.getBoundingClientRect().bottom + 24;
    bar.classList.toggle("is-stuck", bar.getBoundingClientRect().top <= 0.5);
    if (Date.now() < spyLock) return;
    let cur = null;
    for (const s of document.querySelectorAll("#sections .sec")) if (s.getBoundingClientRect().top <= off) cur = s.id.slice(4);
    setActive(cur || DOG().cats[0].id);
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(run); } }, { passive: true });
  addEventListener("resize", run);
  run();
}
