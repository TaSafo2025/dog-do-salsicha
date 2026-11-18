/* "Acompanhe seu pedido": observa store.watch("orders") e atualiza ao vivo quando o painel muda o status. */
import { S, DOG, h, icon, clear, money, clock, openDialog, closeDialog, toast, waLink, openLink, lsGet, lsSet, loyaltyCard, maskPhone, deliveryMin, prepMin, $ } from "./dom.js";
import { waMessage } from "./checkout.js";

const dlg = () => document.getElementById("trackDialog");
let curId = null; let lastSig = ""; let lastStatus = {}; let draft = { stars: 0, comment: "" };

function stepsFor(o) {
  const last = o.mode === "delivery" ? ["Saiu para entrega", "Entregue"] : o.mode === "pickup" ? ["Pronto para retirar", "Retirado"] : ["Pronto", "Servido na mesa"];
  return [
    { key: ["novo"], label: "Recebido", desc: "A loja recebeu seu pedido.", ic: "receipt" },
    { key: ["aceito"], label: "Aceito", desc: "Confirmado pela loja.", ic: "check" },
    { key: ["preparo"], label: "Em preparo", desc: "Seu dog está na chapa.", ic: "flame" },
    { key: o.mode === "delivery" ? ["pronto", "entrega"] : ["pronto", "entrega"], label: last[0], desc: o.mode === "delivery" ? "O motoboy está a caminho." : o.mode === "pickup" ? "Pode vir buscar no balcão." : "Já já chega na sua mesa.", ic: o.mode === "delivery" ? "moto" : "bag" },
    { key: ["concluido"], label: last[1], desc: "Bom apetite!", ic: "star" }
  ];
}
const stepIndex = (o) => stepsFor(o).findIndex((s) => s.key.includes(o.status));
const HEAD = {
  novo: ["Pedido enviado!", "Aguardando a loja confirmar — costuma levar 1–2 minutos."],
  aceito: ["Pedido aceito", "A cozinha já está com o seu pedido."],
  preparo: ["Em preparo", "Pão na chapa, salsicha dourando…"],
  pronto: ["Pedido pronto", "Saindo já já."],
  entrega: ["Saiu para entrega", "O motoboy está a caminho do seu endereço."],
  concluido: ["Pedido entregue", "Bom apetite! Conta pra gente como foi."],
  cancelado: ["Pedido cancelado", "Fale com a loja pelo WhatsApp se tiver alguma dúvida."]
};
const headFor = (o) => {
  if (o.status === "pronto" && o.mode === "pickup") return ["Pronto para retirar", "Pode vir buscar no balcão."];
  if (o.status === "concluido" && o.mode !== "delivery") return ["Pedido finalizado", "Bom apetite! Conta pra gente como foi."];
  return HEAD[o.status] || HEAD.novo;
};
const statusShort = (o) => o.status === "cancelado" ? "Cancelado" : stepsFor(o)[Math.max(0, stepIndex(o))].label;
const active = (o) => o && (!["concluido", "cancelado"].includes(o.status) || (o.status === "concluido" && !o.rating));

export function initTracking() {
  S.watch("orders", (list) => {
    const id = lsGet("dog.site.active", null);
    const o = id && list.find((x) => x.id === id);
    if (o) {
      const prev = lastStatus[o.id];
      if (prev && prev !== o.status && !(dlg().open && curId === o.id)) toast(`Pedido ${o.id}: ${statusShort(o).toLowerCase()}`, { tone: o.status === "cancelado" ? "" : "ok", timeout: 5000 });
      lastStatus[o.id] = o.status;
    }
    renderBadge(o);
    if (dlg().open && curId) { const cur = list.find((x) => x.id === curId); if (cur) renderTrack(cur); }
  });
  const m = location.hash.match(/pedido=([\w-]+)/);
  if (m) { const o = S.get("orders").find((x) => x.id === m[1]); if (o) { lsSet("dog.site.active", o.id); openTracking(o.id); } }
}

export function openTracking(id, { fresh = false, paid = false } = {}) {
  curId = id; lastSig = ""; draft = { stars: 0, comment: "" };
  const o = S.get("orders").find((x) => x.id === id); if (!o) return;
  lastStatus[o.id] = o.status;
  renderTrack(o, { fresh, paid });
  openDialog(dlg());
  dlg().addEventListener("closed", () => renderBadge(S.get("orders").find((x) => x.id === lsGet("dog.site.active", null))), { once: true });
  renderBadge(null);
  requestAnimationFrame(() => $("#tr-title", dlg())?.focus({ preventScroll: true }));
}

function renderBadge(o) {
  const b = $("#trackBadge");
  if (!o || !active(o) || dlg().open) { b.hidden = true; return; }
  clear(b); b.hidden = false;
  b.append(h("span", { class: "tb-dot" + (o.status === "concluido" ? " is-done" : ""), "aria-hidden": "true" }),
    h("span", { class: "tb-text" }, h("span", { class: "tb-k", text: o.status === "concluido" ? "Avalie seu pedido" : "Pedido em andamento" }), h("strong", { text: `${o.id} · ${statusShort(o)}` })),
    icon("chevR", { size: 18 }));
  b.onclick = () => openTracking(o.id);
}

function eta(o) {
  const base = o.mode === "delivery" ? deliveryMin() : prepMin();
  const a = o.createdAt + (base - 10) * 60000; const b = o.createdAt + base * 60000;
  return `${clock(a)} – ${clock(b)}`;
}

function renderTrack(o, { fresh = false, paid = false } = {}) {
  const sig = `${o.id}|${o.status}|${o.history?.length}|${!!o.rating}`;
  if (sig === lastSig) return; lastSig = sig;
  const d = dlg(); clear(d);
  const idx = stepIndex(o); const steps = stepsFor(o); const [title, sub] = headFor(o);
  const cancelled = o.status === "cancelado"; const done = o.status === "concluido";
  const when = (st) => { const hh = (o.history || []).filter((x) => st.key.includes(x.status)); return hh.length ? clock(hh[0].at) : ""; };

  const hero = h("div", { class: "tr-hero" + (cancelled ? " is-cancel" : done ? " is-done" : "") },
    h("div", { class: "tr-anim", "aria-hidden": "true" }, h("span", { class: "tr-ring" }), h("span", { class: "tr-ic" }, icon(cancelled ? "close" : steps[Math.max(0, idx)].ic, { size: 30 }))),
    h("p", { class: "tr-id", text: `Pedido ${o.id}` }),
    h("h2", { class: "tr-title", id: "tr-title", tabindex: "-1", text: title }),
    h("p", { class: "tr-sub", text: sub }),
    !cancelled && !done ? h("p", { class: "tr-eta" }, icon("clock", { size: 16 }), o.mode === "delivery" ? "Previsão de entrega " : "Previsão ", h("strong", { text: eta(o) })) : null);

  const timeline = cancelled ? null : h("ol", { class: "tl", "aria-label": "Andamento do pedido" }, steps.map((s, i) =>
    h("li", { class: i < idx ? "is-done" : i === idx ? "is-cur" : "", "aria-current": i === idx ? "step" : null },
      h("span", { class: "tl-dot", "aria-hidden": "true" }, i <= idx ? icon("check", { size: 14 }) : null),
      h("div", { class: "tl-text" }, h("p", { class: "tl-label" }, s.label, i <= idx && when(s) ? h("span", { class: "tl-time", text: when(s) }) : null),
        i === idx ? h("p", { class: "tl-desc", text: s.desc }) : null))));

  const pm = o.payment || {};
  const summary = h("details", { class: "tr-sum" },
    h("summary", {}, h("span", {}, icon("receipt", { size: 18 }), `${o.lines.reduce((a, l) => a + l.qty, 0)} itens · ${money(o.total)}`), icon("chevD", { size: 18, cls: "chev" })),
    h("ul", {}, o.lines.map((l) => h("li", {}, h("span", { text: `${l.qty}× ${l.name}` }), h("span", { text: money(l.total) })))),
    h("dl", {},
      h("div", {}, h("dt", { text: "Subtotal" }), h("dd", { text: money(o.subtotal) })),
      o.mode === "delivery" ? h("div", {}, h("dt", { text: "Entrega" }), h("dd", { text: money(o.fee) })) : null,
      h("div", { class: "is-total" }, h("dt", { text: "Total" }), h("dd", { text: money(o.total) }))),
    h("p", { class: "muted", text: `${pm.method === "pix" ? (pm.paid ? "Pix pago (demonstração)" : "Pix") : pm.method === "dinheiro" ? (pm.changeFor ? `Dinheiro · troco p/ ${money(pm.changeFor)}` : "Dinheiro") : pm.method === "credito" ? "Crédito" : "Débito"}${o.address ? ` · ${o.address.quadra}, Conj. ${o.address.conjunto}, Casa ${o.address.casa}` : ""}` }));

  const actions = h("div", { class: "tr-actions" },
    h("a", { class: "btn-outline", href: waLink(`Olá! Sobre o meu pedido ${o.id} (${o.customer?.name || ""}).`), target: "_blank", rel: "noopener" }, icon("whatsapp", { size: 18 }), "Falar com a loja"),
    !done && !cancelled ? h("button", { class: "link", type: "button", onclick: () => openLink(waLink(waMessage(o))) }, "WhatsApp não abriu? Reenviar pedido") : null);

  const demo = !done && !cancelled ? h("p", { class: "tr-demo" }, icon("info", { size: 16 }),
    h("span", {}, "Demonstração: mude o status no ", h("a", { href: "painel.html", target: "_blank", rel: "noopener", text: "Painel da loja" }), " (outra aba) e veja esta tela atualizar sozinha.")) : null;

  d.setAttribute("aria-labelledby", "tr-title");
  d.append(h("div", { class: "tr" },
    h("header", { class: "tr-top" },
      h("p", { class: "tr-top-t" }, h("img", { src: "assets/img/logo.webp", alt: "", width: 32, height: 32 }), "Acompanhe seu pedido"),
      h("button", { class: "icon-btn", type: "button", "aria-label": "Voltar ao cardápio", onclick: () => closeDialog(d) }, icon("close", { size: 22 }))),
    h("div", { class: "tr-scroll" },
      fresh && paid ? h("p", { class: "tr-paid" }, icon("check", { size: 18 }), "Pagamento Pix confirmado (simulação)") : null,
      hero, timeline, done ? ratingBlock(o) : null, actions, demo,
      o.customer?.phone ? h("div", { class: "tr-loyal" }, loyaltyCard(o.customer.phone, { name: o.customer.name })) : null,
      summary,
      h("button", { class: "btn-primary btn-xl tr-back", type: "button", onclick: () => closeDialog(d) }, "Voltar ao cardápio"))));
}

function ratingBlock(o) {
  if (o.rating) return h("div", { class: "rate is-sent" },
    h("p", { class: "rate-title", text: "Obrigado pela avaliação!" }),
    h("p", { class: "rate-stars", "aria-label": `${o.rating.stars} de 5 estrelas` }, Array.from({ length: 5 }, (_, i) => icon("star", { size: 26, fill: i < o.rating.stars, cls: i < o.rating.stars ? "on" : "" }))),
    o.rating.comment ? h("p", { class: "muted", text: `“${o.rating.comment}”` }) : null);
  const LABELS = ["", "Não curti", "Poderia melhorar", "Foi bom", "Muito bom!", "Perfeito, Scooby aprova!"];
  const label = h("p", { class: "rate-label", "aria-live": "polite", text: draft.stars ? LABELS[draft.stars] : "Toque nas estrelas" });
  const send = h("button", { class: "btn-primary", type: "button", disabled: !draft.stars, onclick: () => {
    S.update("orders", (list) => list.map((x) => (x.id === o.id ? { ...x, rating: { stars: draft.stars, comment: draft.comment.trim(), at: Date.now() } } : x)));
    toast("Avaliação enviada. Valeu!", { tone: "ok" });
  } }, "Enviar avaliação");
  const stars = h("div", { class: "rate-stars", role: "radiogroup", "aria-label": "Sua nota de 1 a 5" }, Array.from({ length: 5 }, (_, i) => {
    const n = i + 1;
    return h("button", { type: "button", role: "radio", "aria-checked": String(draft.stars === n), "aria-label": `${n} ${n === 1 ? "estrela" : "estrelas"}`, class: "star-btn" + (n <= draft.stars ? " on" : ""),
      onclick: () => { draft.stars = n; [...stars.children].forEach((b, j) => { b.classList.toggle("on", j < n); b.setAttribute("aria-checked", String(j + 1 === n)); b.querySelector("svg").setAttribute("fill", j < n ? "currentColor" : "none"); }); label.textContent = LABELS[n]; send.disabled = false; } },
      icon("star", { size: 34, fill: n <= draft.stars }));
  }));
  return h("div", { class: "rate" },
    h("p", { class: "rate-title", text: "Como estava o seu dog?" }), stars, label,
    h("label", { class: "sr-only", for: "rate-c", text: "Comentário (opcional)" }),
    h("textarea", { id: "rate-c", rows: 2, maxlength: 200, placeholder: "Quer contar algo? (opcional)", ".value": draft.comment, oninput: (e) => { draft.comment = e.target.value; } }),
    send);
}
