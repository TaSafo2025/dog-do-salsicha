/* Checkout em etapas, sem cadastro: receber → dados → pagamento → revisão (+ Pix simulado). */
import { S, DOG, h, icon, svgEl, pic, clear, money, norm, digits, maskPhone, openDialog, closeDialog, toast, openLink, waLink, mapsLink,
  lsGet, lsSet, productImg, deliveryMin, prepMin, status, clock, reduced, $ } from "./dom.js";
import { cart } from "./cart.js";
import { openTracking } from "./track.js";

const dlg = () => document.getElementById("checkoutDialog");
const ME_KEY = "dog.site.me";
let ck = null;
let pixTimer = null;

const MODES = [
  { id: "delivery", name: "Entrega", sub: () => `${deliveryMin() - 10}–${deliveryMin()} min`, ic: "moto" },
  { id: "pickup", name: "Retirada", sub: () => `pronto em ~${prepMin()} min`, ic: "store" },
  { id: "dinein", name: "Comer aqui", sub: () => "na mesa", ic: "cutlery" }
];
const PAYS = [
  { id: "pix", name: "Pix", ic: "pix", sub: () => "Pague agora pelo site · aprovação na hora" },
  { id: "dinheiro", name: "Dinheiro", ic: "cash", sub: () => `Pague ${where()} · informe o troco` },
  { id: "credito", name: "Cartão de crédito", ic: "card", sub: () => `Maquininha ${where()}` },
  { id: "debito", name: "Cartão de débito", ic: "card", sub: () => `Maquininha ${where()}` }
];
const where = () => (ck?.mode === "delivery" ? "na entrega" : ck?.mode === "pickup" ? "na retirada" : "no caixa");
const STEPS = () => [
  { id: "receber", label: ck.mode === "delivery" ? "Entrega" : ck.mode === "pickup" ? "Retirada" : "Mesa", title: "Como você quer receber?" },
  { id: "dados", label: "Seus dados", title: "Quem vai receber?" },
  { id: "pagamento", label: "Pagamento", title: "Como prefere pagar?" },
  { id: "revisao", label: "Revisão", title: "Confere a comanda" }
];

export function openCheckout() {
  if (!cart.lines.length) return;
  const me = lsGet(ME_KEY, null);
  ck = {
    step: 0, view: "steps", errors: {},
    mode: me?.mode || "delivery",
    quadra: me?.address?.quadra || "", conjunto: me?.address?.conjunto || "", casa: me?.address?.casa || "",
    complemento: me?.address?.complemento || "", referencia: me?.address?.referencia || "", table: "",
    name: me?.name || "", phone: me?.phone ? maskPhone(me.phone) : "",
    pay: me?.pay || "pix", needChange: false, changeFor: "", remember: !!me, optIn: false, note: ""
  };
  render();
  openDialog(dlg());
  focusStep();
}

/* ---------------- totais ---------------- */
const fee = () => (ck.mode === "delivery" ? S.feeFor(ck.quadra) : 0);
function totals() {
  const sub = cart.subtotal(); const f = fee() ?? 0;
  return { sub, fee: f, total: Math.round((sub + f) * 100) / 100, points: Math.floor((sub + f) * (DOG().store.loyalty?.pointsPerReal || 5)) };
}

/* ---------------- render ---------------- */
function render() {
  const d = dlg(); clear(d);
  if (ck.view === "pix") return renderPix(d);
  const steps = STEPS(); const cur = steps[ck.step];
  const top = h("header", { class: "ck-top" },
    h("div", { class: "ck-top-row" },
      h("button", { class: "icon-btn", type: "button", "aria-label": ck.step ? "Voltar para a etapa anterior" : "Voltar para a sacola", onclick: back }, icon("arrowL", { size: 22 })),
      h("div", { class: "ck-top-title" }, h("p", { class: "ck-kicker", text: `Etapa ${ck.step + 1} de ${steps.length}` }), h("h2", { id: "ck-title", tabindex: "-1", text: cur.title })),
      h("button", { class: "icon-btn", type: "button", "aria-label": "Fechar checkout", onclick: () => closeDialog(d) }, icon("close", { size: 22 }))),
    h("ol", { class: "ck-steps", "aria-label": "Etapas do pedido" }, steps.map((s, i) =>
      h("li", { class: i < ck.step ? "is-done" : i === ck.step ? "is-cur" : "", "aria-current": i === ck.step ? "step" : null },
        h("span", { class: "ck-step-bar", "aria-hidden": "true" }), h("span", { class: "ck-step-label", text: s.label })))));
  const form = h("form", { class: "ck-form", novalidate: true, onsubmit: (e) => { e.preventDefault(); next(); } });
  form.append(h("div", { class: "ck-pane" }, [stepReceber, stepDados, stepPagamento, stepRevisao][ck.step]()));
  const t = totals();
  const ctaText = ck.step < 3 ? "Continuar" : ck.pay === "pix" ? "Pagar com Pix" : "Enviar pedido";
  form.append(h("footer", { class: "ck-foot" },
    h("div", { class: "ck-foot-total" }, h("span", { text: ck.mode === "delivery" && fee() == null ? "Subtotal" : "Total" }), h("strong", { id: "ck-total", text: money(ck.mode === "delivery" && fee() == null ? t.sub : t.total) })),
    h("button", { class: "btn-primary ck-next", type: "submit" },
      ck.step === 3 && ck.pay !== "pix" ? icon("whatsapp", { size: 20 }) : null, h("span", { text: ctaText }),
      ck.step === 3 ? h("span", { class: "ck-next-amt", text: money(t.total) }) : icon("arrowR", { size: 18 }))));
  d.setAttribute("aria-labelledby", "ck-title");
  d.append(h("div", { class: "ck" }, top, h("div", { class: "ck-grid" }, form, summaryAside())));
}
function focusStep() { requestAnimationFrame(() => { const t = $("#ck-title", dlg()); t?.focus({ preventScroll: true }); dlg().querySelector(".ck-form")?.scrollTo?.(0, 0); }); }

function back() {
  if (ck.step === 0) { closeDialog(dlg()).then(() => import("./bag.js").then((m) => m.openBag())); return; }
  ck.step--; ck.errors = {}; render(); focusStep();
}
function next() {
  const errs = validate(ck.step); ck.errors = errs;
  if (Object.keys(errs).length) {
    render();
    const first = dlg().querySelector("[aria-invalid=true]");
    first?.focus(); first?.scrollIntoView({ block: "center", behavior: reduced() ? "auto" : "smooth" });
    return;
  }
  if (ck.step < 3) { ck.step++; render(); focusStep(); return; }
  if (!status().open) { toast("A loja fechou agora há pouco. Tente de novo quando abrirmos."); return; }
  if (ck.pay === "pix") { ck.view = "pix"; render(); requestAnimationFrame(() => $("#pix-title", dlg())?.focus()); return; }
  send(false);
}

/* ---------------- campos ---------------- */
function field(id, label, control, { hint, optional, cls = "" } = {}) {
  const err = ck.errors[id];
  control.id = control.id || `f-${id}`;
  if (err) { control.setAttribute("aria-invalid", "true"); control.setAttribute("aria-describedby", `e-${id}`); }
  else if (hint) control.setAttribute("aria-describedby", `h-${id}`);
  return h("div", { class: "fld " + cls + (err ? " has-err" : "") },
    h("label", { for: control.id }, label, optional ? h("span", { class: "opt-tag", text: "opcional" }) : null),
    control,
    err ? h("p", { class: "fld-err", id: `e-${id}` }, icon("alert", { size: 14 }), err) : hint ? h("p", { class: "fld-hint", id: `h-${id}`, text: hint }) : null);
}
const input = (key, attrs = {}) => h("input", { type: "text", ".value": ck[key], oninput: (e) => { ck[key] = e.target.value; if (ck.errors[key]) { delete ck.errors[key]; e.target.removeAttribute("aria-invalid"); e.target.closest(".fld")?.classList.remove("has-err"); e.target.closest(".fld")?.querySelector(".fld-err")?.remove(); } }, ...attrs });

/* ---------------- etapa 1: receber ---------------- */
function stepReceber() {
  const seg = h("fieldset", { class: "seg" }, h("legend", { class: "sr-only", text: "Forma de receber" }),
    MODES.map((m) => h("label", { class: "seg-opt" + (ck.mode === m.id ? " is-on" : "") },
      h("input", { type: "radio", name: "mode", value: m.id, ".checked": ck.mode === m.id, onchange: () => { ck.mode = m.id; ck.errors = {}; render(); requestAnimationFrame(() => dlg().querySelector(`input[name=mode][value=${m.id}]`)?.focus()); } }),
      h("span", { class: "seg-ic" }, icon(m.ic, { size: 22 })),
      h("span", { class: "seg-name", text: m.name }), h("span", { class: "seg-sub", text: m.sub() }))));
  if (ck.mode === "delivery") return [seg, quadraField(),
    h("div", { class: "fld-row" },
      field("conjunto", "Conjunto", input("conjunto", { inputmode: "text", autocomplete: "address-line2", placeholder: "Ex.: 3" })),
      field("casa", "Casa / lote", input("casa", { autocomplete: "address-line3", placeholder: "Ex.: 10" }))),
    field("complemento", "Complemento", input("complemento", { placeholder: "Apto, bloco, fundos…" }), { optional: true }),
    field("referencia", "Ponto de referência", input("referencia", { placeholder: "Perto de…, portão azul…" }), { optional: true })];
  if (ck.mode === "pickup") { const st = DOG().store; return [seg, h("div", { class: "info-card" },
    h("span", { class: "info-ic" }, icon("store", { size: 22 })),
    h("div", {}, h("p", { class: "info-title", text: "Retire no balcão" }),
      h("p", { text: `${st.address}, ${st.district} — ${st.city}` }),
      h("p", { class: "muted", text: `Fica pronto em ~${prepMin()} min. A gente avisa no WhatsApp.` }),
      h("a", { class: "link", href: mapsLink(), target: "_blank", rel: "noopener" }, icon("route", { size: 16 }), "Abrir no mapa")))]; }
  return [seg, h("div", { class: "info-card" }, h("span", { class: "info-ic" }, icon("cutlery", { size: 22 })),
      h("div", {}, h("p", { class: "info-title", text: "Pediu da mesa? A gente leva até você." }), h("p", { class: "muted", text: "Olhe o número na plaquinha da mesa." }))),
    field("table", "Número da mesa", input("table", { inputmode: "numeric", maxlength: 3, placeholder: "Ex.: 7", class: "short" }))];
}

function quadraField() {
  const zones = DOG().zones;
  const box = h("div", { class: "combo-box" });
  const list = h("ul", { class: "cb-list", id: "cb-list", role: "listbox", "aria-label": "Quadras atendidas", hidden: true });
  const feeOut = h("div", { class: "fee-out", id: "fee-out", "aria-live": "polite" });
  let opts = []; let act = -1;
  const inp = h("input", { id: "f-quadra", type: "text", role: "combobox", "aria-autocomplete": "list", "aria-expanded": "false", "aria-controls": "cb-list",
    autocomplete: "off", spellcheck: "false", placeholder: "Digite a quadra — ex.: QN 310", ".value": ck.quadra });
  const showFee = () => {
    clear(feeOut);
    const f = S.feeFor(ck.quadra); const q = ck.quadra.trim();
    if (f != null && q) feeOut.append(h("p", { class: "fee-ok" }, icon("check", { size: 16 }), "Entregamos aí! Taxa de entrega ", h("strong", { text: money(f) }), ` · ${deliveryMin() - 10}–${deliveryMin()} min`));
    else if (q.length >= 4 && list.hidden) feeOut.append(h("div", { class: "fee-no" }, icon("alert", { size: 18 }),
      h("div", {}, h("p", { class: "fee-no-title", text: "Ainda não entregamos aí." }),
        h("p", {}, "Chame a gente no WhatsApp que a gente vê um jeito. ", h("a", { class: "link", href: waLink(`Olá! Vocês entregam em ${q}?`), target: "_blank", rel: "noopener" }, icon("whatsapp", { size: 15 }), "Falar no WhatsApp")))));
    const t = totals(); const tot = $("#ck-total", dlg()); if (tot) { tot.textContent = money(f == null ? t.sub : t.total); tot.previousSibling.textContent = f == null ? "Subtotal" : "Total"; }
    updateSummary();
  };
  const close = () => { list.hidden = true; inp.setAttribute("aria-expanded", "false"); inp.removeAttribute("aria-activedescendant"); act = -1; };
  const choose = (z) => { ck.quadra = z.name; inp.value = z.name; close(); clearErr(); showFee(); };
  const clearErr = () => { delete ck.errors.quadra; inp.removeAttribute("aria-invalid"); box.closest(".fld")?.classList.remove("has-err"); box.closest(".fld")?.querySelector(".fld-err")?.remove(); };
  const highlight = () => { [...list.children].forEach((li, i) => li.setAttribute("aria-selected", i === act ? "true" : "false")); if (act >= 0) { inp.setAttribute("aria-activedescendant", `cb-${act}`); list.children[act]?.scrollIntoView({ block: "nearest" }); } };
  const filter = () => {
    const q = norm(ck.quadra).replace(/\s+/g, " ");
    clear(list);
    if (!q) { close(); return; }
    const terms = q.split(" ");
    opts = zones.filter((z) => { const n = norm(z.name); return terms.every((t) => n.includes(t)); })
      .sort((a, b) => Number(norm(b.name).startsWith(q)) - Number(norm(a.name).startsWith(q)) || a.name.localeCompare(b.name, "pt-BR", { numeric: true }))
      .slice(0, 8);
    if (!opts.length || (opts.length === 1 && norm(opts[0].name) === q)) { close(); return; }
    opts.forEach((z, i) => list.append(h("li", { id: `cb-${i}`, role: "option", "aria-selected": "false", class: "cb-opt",
      onpointerdown: (e) => { e.preventDefault(); choose(z); } },
      h("span", { class: "cb-name" }, icon("pin", { size: 15 }), z.name), h("span", { class: "cb-fee", text: money(z.fee) }))));
    list.hidden = false; inp.setAttribute("aria-expanded", "true"); act = -1;
  };
  inp.addEventListener("input", (e) => { ck.quadra = e.target.value; clearErr(); filter(); showFee(); });
  inp.addEventListener("focus", () => { if (ck.quadra && S.feeFor(ck.quadra) == null) filter(); });
  inp.addEventListener("blur", () => setTimeout(() => { close(); showFee(); }, 120));
  inp.addEventListener("keydown", (e) => {
    if (list.hidden) { if (e.key === "ArrowDown" && ck.quadra) { filter(); } return; }
    if (e.key === "ArrowDown") { e.preventDefault(); act = Math.min(opts.length - 1, act + 1); highlight(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); act = Math.max(0, act - 1); highlight(); }
    else if (e.key === "Enter") { if (act >= 0 || opts.length === 1) { e.preventDefault(); choose(opts[Math.max(0, act)]); } }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); close(); }
  });
  box.append(icon("pin", { size: 18, cls: "cb-ic" }), inp, list);
  const fld = field("quadra", "Quadra", inp, { cls: "fld-quadra" });
  fld.replaceChild(box, inp); // input já está dentro do box
  box.insertBefore(inp, list);
  fld.append(feeOut);
  requestAnimationFrame(showFee);
  return fld;
}

/* ---------------- etapa 2: dados ---------------- */
function stepDados() {
  const phone = input("phone", { type: "tel", inputmode: "tel", autocomplete: "tel-national", placeholder: "(61) 9 0000-0000", maxlength: 15 });
  phone.addEventListener("input", (e) => { const m = maskPhone(e.target.value); e.target.value = m; ck.phone = m; });
  return [
    field("name", "Seu nome", input("name", { autocomplete: "name", placeholder: "Como podemos te chamar?", maxlength: 60 })),
    field("phone", "WhatsApp", phone, { hint: "Usamos só para falar sobre este pedido." }),
    h("p", { class: "privacy" }, icon("lock", { size: 15 }), "Sem cadastro e sem senha. Seus dados vão só para a loja.")];
}

/* ---------------- etapa 3: pagamento ---------------- */
function stepPagamento() {
  const t = totals();
  const opts = h("fieldset", { class: "pays" }, h("legend", { class: "sr-only", text: "Forma de pagamento" }),
    PAYS.map((p) => h("label", { class: "pay" + (ck.pay === p.id ? " is-on" : "") },
      h("input", { type: "radio", name: "pay", value: p.id, ".checked": ck.pay === p.id, onchange: () => { ck.pay = p.id; ck.errors = {}; render(); requestAnimationFrame(() => dlg().querySelector(`input[name=pay][value=${p.id}]`)?.focus()); } }),
      h("span", { class: "pay-ic pay-ic--" + p.id }, icon(p.ic, { size: 22 })),
      h("span", { class: "pay-text" }, h("span", { class: "pay-name", text: p.name }), h("span", { class: "pay-sub", text: p.sub() })),
      p.id === "pix" ? h("span", { class: "pay-tag", text: "Mais rápido" }) : null,
      h("span", { class: "radio", "aria-hidden": "true" }))));
  const out = [opts];
  if (ck.pay === "dinheiro") {
    const chg = input("changeFor", { inputmode: "decimal", placeholder: "Ex.: 100,00", class: "money-in", disabled: !ck.needChange });
    const quick = [20, 50, 100, 200].filter((v) => v > t.total).slice(0, 3);
    out.push(h("div", { class: "change" },
      h("label", { class: "switch" },
        h("input", { type: "checkbox", role: "switch", ".checked": ck.needChange, onchange: (e) => { ck.needChange = e.target.checked; if (!ck.needChange) ck.changeFor = ""; delete ck.errors.changeFor; render(); if (ck.needChange) requestAnimationFrame(() => $("#f-changeFor", dlg())?.focus()); } }),
        h("span", { class: "switch-ui", "aria-hidden": "true" }), h("span", { text: "Vou precisar de troco" })),
      ck.needChange ? [field("changeFor", `Troco para quanto? (total ${money(t.total)})`, chg),
        h("div", { class: "quick" }, quick.map((v) => h("button", { type: "button", class: "chip-btn", onclick: () => { ck.changeFor = String(v); delete ck.errors.changeFor; render(); } }, money(v))))] : null));
  }
  if (ck.pay === "pix") out.push(h("p", { class: "demo-note" }, icon("info", { size: 16 }), "Demonstração: o Pix desta tela é ilustrativo — nenhum valor é cobrado."));
  return out;
}
const parseMoney = (s) => { const v = parseFloat(String(s).replace(/[^\d,.]/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".")); return isNaN(v) ? null : v; };

/* ---------------- etapa 4: revisão (comanda) ---------------- */
function stepRevisao() {
  const t = totals(); const now = new Date();
  const addr = ck.mode === "delivery" ? [`${ck.quadra}${ck.conjunto ? `, Conj. ${ck.conjunto}` : ""}${ck.casa ? `, Casa ${ck.casa}` : ""}`, ck.complemento, ck.referencia ? `Ref.: ${ck.referencia}` : ""].filter(Boolean) : null;
  const payTxt = payLabel();
  const comanda = h("div", { class: "comanda" },
    h("div", { class: "cm-head" },
      h("img", { src: "assets/img/logo.webp", alt: "", width: 44, height: 44 }),
      h("div", {}, h("p", { class: "cm-brand", text: "DOG DO SALSICHA" }), h("p", { class: "cm-meta", text: `${now.toLocaleDateString("pt-BR")} · ${clock(now)} · pedido pelo site` }))),
    h("p", { class: "cm-mode" }, icon(MODES.find((m) => m.id === ck.mode).ic, { size: 16 }), ck.mode === "delivery" ? "ENTREGA" : ck.mode === "pickup" ? "RETIRADA NO BALCÃO" : `MESA ${ck.table}`),
    h("ul", { class: "cm-lines" }, cart.lines.map((l) => h("li", {},
      h("p", { class: "cm-line" }, h("span", { text: `${l.qty}× ${l.name}` }), h("span", { class: "cm-dots", "aria-hidden": "true" }), h("span", { text: money(S.lineTotal(l)) })),
      (l.options || []).map((o) => h("p", { class: "cm-opt", text: o.group === "retirar" ? `− ${o.name}` : o.group === "bebida" ? `• ${o.name}` : `+ ${o.qty}× ${o.name}` })),
      l.note ? h("p", { class: "cm-opt", text: `obs: ${l.note}` }) : null))),
    h("dl", { class: "cm-tot" },
      h("div", {}, h("dt", { text: "Subtotal" }), h("dd", { text: money(t.sub) })),
      ck.mode === "delivery" ? h("div", {}, h("dt", { text: `Entrega · ${ck.quadra}` }), h("dd", { text: money(t.fee) })) : null,
      h("div", { class: "cm-total" }, h("dt", { text: "TOTAL" }), h("dd", { text: money(t.total) }))),
    h("div", { class: "cm-info" },
      addr ? h("div", {}, h("p", { class: "cm-k", text: "Entregar em" }), addr.map((a) => h("p", { text: a }))) : null,
      h("div", {}, h("p", { class: "cm-k", text: "Cliente" }), h("p", { text: `${ck.name} · ${ck.phone}` })),
      h("div", {}, h("p", { class: "cm-k", text: "Pagamento" }), h("p", { text: payTxt }))),
    h("p", { class: "cm-points" }, icon("paw", { size: 16, fill: true }), `Este pedido rende +${t.points} pontos no cartão fidelidade`));
  const edit = h("div", { class: "rv-edit" },
    STEPS().slice(0, 3).map((s, i) => h("button", { type: "button", class: "chip-btn", onclick: () => { ck.step = i; render(); focusStep(); } }, icon("edit", { size: 14 }), `Alterar ${s.label.toLowerCase()}`)));
  const note = field("note", "Recado para a loja", h("textarea", { rows: 2, maxlength: 140, placeholder: "Ex.: tocar a campainha, chegar pelo portão lateral…", ".value": ck.note, oninput: (e) => { ck.note = e.target.value; } }), { optional: true });
  const prefs = h("div", { class: "prefs" },
    h("label", { class: "pref" }, h("input", { type: "checkbox", ".checked": ck.remember, onchange: (e) => { ck.remember = e.target.checked; } }),
      h("span", { class: "check", "aria-hidden": "true" }, icon("check", { size: 14 })),
      h("span", {}, h("strong", { text: "Lembrar meus dados neste aparelho" }), h("span", { class: "muted", text: "Nome, telefone e endereço ficam salvos só aqui, para o próximo pedido." }))),
    h("label", { class: "pref" }, h("input", { type: "checkbox", ".checked": ck.optIn, onchange: (e) => { ck.optIn = e.target.checked; } }),
      h("span", { class: "check", "aria-hidden": "true" }, icon("check", { size: 14 })),
      h("span", {}, h("strong", { text: "Quero receber promoções no WhatsApp" }), h("span", { class: "muted", text: "No máximo 1 mensagem por semana. Você pode sair quando quiser." }))));
  return [comanda, edit, note, prefs,
    h("p", { class: "send-note" }, icon("whatsapp", { size: 16 }), ck.pay === "pix" ? "Depois do Pix, abrimos o WhatsApp da loja com o pedido prontinho — é só tocar em enviar." : "Vamos abrir o WhatsApp da loja com o pedido prontinho — é só tocar em enviar.")];
}
function payLabel(paid) {
  const t = totals();
  if (ck.pay === "pix") return paid ? "Pix · pago (demonstração)" : "Pix pelo site";
  if (ck.pay === "dinheiro") return ck.needChange && ck.changeFor ? `Dinheiro · troco para ${money(parseMoney(ck.changeFor))} (levar ${money(parseMoney(ck.changeFor) - t.total)})` : "Dinheiro · sem troco";
  return `${ck.pay === "credito" ? "Crédito" : "Débito"} ${where()}`;
}

/* ---------------- validação ---------------- */
function validate(step) {
  const e = {};
  if (step === 0) {
    if (ck.mode === "delivery") {
      if (!ck.quadra.trim()) e.quadra = "Informe a quadra.";
      else if (S.feeFor(ck.quadra) == null) e.quadra = "Ainda não entregamos nessa quadra — confira o nome ou chame no WhatsApp.";
      if (!ck.conjunto.trim()) e.conjunto = "Informe o conjunto.";
      if (!ck.casa.trim()) e.casa = "Informe a casa.";
    }
    if (ck.mode === "dinein" && !/^\d{1,3}$/.test(ck.table.trim())) e.table = "Informe o número da mesa.";
  }
  if (step === 1) {
    if (ck.name.trim().length < 2) e.name = "Como podemos te chamar?";
    const d = digits(ck.phone); if (d.length < 10 || d.length > 11) e.phone = "Confira o número com DDD, ex.: (61) 99882-6477.";
  }
  if (step === 2 && ck.pay === "dinheiro" && ck.needChange) {
    const v = parseMoney(ck.changeFor); const tot = totals().total;
    if (v == null) e.changeFor = "Informe para quanto é o troco.";
    else if (v <= tot) e.changeFor = `O valor precisa ser maior que o total (${money(tot)}).`;
    else if (v > tot + 500) e.changeFor = "Esse troco está alto demais para o entregador. Confira o valor.";
  }
  return e;
}

/* ---------------- resumo lateral (desktop) ---------------- */
function summaryAside() {
  const a = h("aside", { class: "ck-summary", "aria-label": "Resumo do pedido", id: "ck-summary" });
  fillSummary(a); return a;
}
function updateSummary() { const a = $("#ck-summary", dlg()); if (a) fillSummary(a); }
function fillSummary(a) {
  clear(a); const t = totals(); const f = fee();
  a.append(h("p", { class: "ck-sum-title", text: "Seu pedido" }),
    h("ul", { class: "ck-sum-lines" }, cart.lines.map((l) => { const p = DOG().products[l.productId];
      return h("li", {}, pic(productImg(p), "", { cls: "ck-sum-pic" }), h("span", { class: "ck-sum-name" }, h("strong", { text: `${l.qty}×` }), " ", l.name), h("span", { text: money(S.lineTotal(l)) })); })),
    h("dl", { class: "ck-sum-tot" },
      h("div", {}, h("dt", { text: "Subtotal" }), h("dd", { text: money(t.sub) })),
      ck.mode === "delivery" ? h("div", {}, h("dt", { text: "Entrega" }), h("dd", { text: f == null ? "informe a quadra" : money(f) })) : h("div", {}, h("dt", { text: ck.mode === "pickup" ? "Retirada" : "Na mesa" }), h("dd", { text: "grátis" })),
      h("div", { class: "is-total" }, h("dt", { text: "Total" }), h("dd", { text: money(f == null && ck.mode === "delivery" ? t.sub : t.total) }))));
}

/* ---------------- Pix (simulado) ---------------- */
function pixCode(total) {
  const amt = total.toFixed(2);
  return `00020126580014BR.GOV.BCB.PIX0136demo-dog-do-salsicha-0000-esboco52040000530398654${String(amt.length).padStart(2, "0")}${amt}5802BR5915DOG DO SALSICHA6008BRASILIA62070503DEMO6304A1B2`;
}
function qrSvg(seedStr) {
  const N = 29; const cell = 8; const size = N * cell;
  let seed = 0; for (const c of seedStr) seed = (seed * 31 + c.charCodeAt(0)) >>> 0;
  const rnd = () => { seed ^= seed << 13; seed >>>= 0; seed ^= seed >> 17; seed ^= seed << 5; seed >>>= 0; return seed / 4294967296; };
  const svg = svgEl("svg", { viewBox: `0 0 ${size} ${size}`, width: 216, height: 216, role: "img", "aria-label": "QR Code Pix ilustrativo (demonstração)", class: "qr" });
  svg.append(svgEl("rect", { width: size, height: size, fill: "#fff" }));
  const finder = (x, y) => (px, py) => px >= x && px < x + 7 && py >= y && py < y + 7;
  const fs = [finder(0, 0), finder(N - 7, 0), finder(0, N - 7)];
  const inFinder = (x, y) => fs.some((f) => f(x, y)) || (x < 8 && y < 8) || (x > N - 9 && y < 8) || (x < 8 && y > N - 9);
  const center = (x, y) => x >= 11 && x <= 17 && y >= 11 && y <= 17;
  let d = "";
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (!inFinder(x, y) && !center(x, y) && rnd() > 0.52) d += `M${x * cell} ${y * cell}h${cell}v${cell}h-${cell}z`;
  svg.append(svgEl("path", { d, fill: "#1C1412" }));
  for (const [x, y] of [[0, 0], [N - 7, 0], [0, N - 7]]) {
    svg.append(svgEl("rect", { x: x * cell + 4, y: y * cell + 4, width: 6 * cell, height: 6 * cell, rx: 10, fill: "none", stroke: "#1C1412", "stroke-width": cell }));
    svg.append(svgEl("rect", { x: (x + 2) * cell, y: (y + 2) * cell, width: 3 * cell, height: 3 * cell, rx: 5, fill: "#C8102E" }));
  }
  svg.append(svgEl("rect", { x: 11.5 * cell, y: 11.5 * cell, width: 6 * cell, height: 6 * cell, rx: 12, fill: "#C8102E" }));
  const g = svgEl("g", { transform: `translate(${14.5 * cell - 13} ${14.5 * cell - 13}) scale(1.08)`, fill: "none", stroke: "#fff", "stroke-width": "2.2", "stroke-linejoin": "round" });
  for (const p of ["M12 3.2 15.3 6.5 12 9.8 8.7 6.5 12 3.2Z", "M12 14.2l3.3 3.3L12 20.8l-3.3-3.3 3.3-3.3Z", "M3.2 12l3.3-3.3L9.8 12l-3.3 3.3L3.2 12Z", "M14.2 12l3.3-3.3 3.3 3.3-3.3 3.3-3.3-3.3Z"]) g.append(svgEl("path", { d: p }));
  svg.append(g);
  return svg;
}
function renderPix(d) {
  const t = totals(); const code = pixCode(t.total);
  let left = 600;
  const timer = h("span", { class: "pix-timer", text: "10:00" });
  clearInterval(pixTimer);
  pixTimer = setInterval(() => { left--; if (left < 0 || !d.open) return clearInterval(pixTimer); timer.textContent = `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(left % 60).padStart(2, "0")}`; }, 1000);
  const copyBtn = h("button", { class: "btn-outline", type: "button", onclick: async () => {
    try { await navigator.clipboard.writeText(code); } catch { /* prévia sem permissão */ }
    copyBtn.classList.add("is-done"); clear(copyBtn).append(icon("check", { size: 18 }), "Código copiado"); toast("Código Pix copiado", { tone: "ok" });
    setTimeout(() => { copyBtn.classList.remove("is-done"); clear(copyBtn).append(icon("copy", { size: 18 }), "Copiar código Pix"); }, 2400);
  } }, icon("copy", { size: 18 }), "Copiar código Pix");
  d.setAttribute("aria-labelledby", "pix-title");
  d.append(h("div", { class: "ck ck--pix" },
    h("header", { class: "ck-top" }, h("div", { class: "ck-top-row" },
      h("button", { class: "icon-btn", type: "button", "aria-label": "Voltar para a revisão", onclick: () => { clearInterval(pixTimer); ck.view = "steps"; render(); focusStep(); } }, icon("arrowL", { size: 22 })),
      h("div", { class: "ck-top-title" }, h("p", { class: "ck-kicker", text: "Pagamento" }), h("h2", { id: "pix-title", tabindex: "-1", text: "Pague com Pix" })),
      h("button", { class: "icon-btn", type: "button", "aria-label": "Fechar", onclick: () => closeDialog(d) }, icon("close", { size: 22 })))),
    h("div", { class: "pix" },
      h("p", { class: "demo-banner" }, icon("info", { size: 18 }), h("span", {}, h("strong", { text: "Demonstração." }), " Este QR e o código são fictícios — nenhum valor será cobrado. Na versão final, o pagamento é confirmado automaticamente.")),
      h("div", { class: "pix-card" },
        h("p", { class: "pix-amt-label", text: "Valor a pagar" }),
        h("p", { class: "pix-amt", text: money(t.total) }),
        h("div", { class: "qr-wrap" }, qrSvg(code)),
        h("p", { class: "pix-exp" }, icon("clock", { size: 16 }), "Expira em ", timer),
        h("ol", { class: "pix-how" },
          h("li", { text: "Abra o app do seu banco e escolha Pix." }),
          h("li", { text: "Escaneie o QR ou use o copia e cola." }),
          h("li", { text: "Confirme — o pedido vai direto para a cozinha." })),
        h("div", { class: "pix-code" }, h("p", { class: "pix-code-label", text: "Pix copia e cola" }), h("code", { text: code })),
        copyBtn),
      h("button", { class: "btn-primary btn-xl pix-sim", type: "button", onclick: () => send(true) }, icon("check", { size: 20 }), "Simular pagamento confirmado"),
      h("button", { class: "link pix-change", type: "button", onclick: () => { clearInterval(pixTimer); ck.view = "steps"; ck.step = 2; render(); focusStep(); } }, "Trocar forma de pagamento"))));
}

/* ---------------- envio ---------------- */
export function waMessage(o) {
  const L = []; const P = (id) => DOG().products[id];
  const modeTxt = o.mode === "delivery" ? "Entrega" : o.mode === "pickup" ? "Retirada no balcão" : `Comer aqui · Mesa ${o.table}`;
  L.push(`*Pedido ${o.id}* · Dog do Salsicha`, `${modeTxt} · feito pelo site às ${clock(o.createdAt)}`, "");
  L.push("*Itens*");
  for (const l of o.lines) {
    L.push(`${l.qty}x ${l.name} — ${money(l.total ?? S.lineTotal(l))}`);
    const p = P(l.productId);
    if (p?.combo) L.push(`   (${p.combo.includes.map((i) => `${i.qty}x ${P(i.product)?.name}`).join(" + ")})`);
    for (const op of l.options || []) L.push(op.group === "retirar" ? `   - ${op.name}` : op.group === "bebida" ? `   Bebida: ${op.name}` : `   + ${op.qty}x ${op.name}`);
    if (l.note) L.push(`   Obs.: ${l.note}`);
  }
  L.push("", `Subtotal: ${money(o.subtotal)}`);
  if (o.mode === "delivery") L.push(`Entrega: ${money(o.fee)}`);
  L.push(`*Total: ${money(o.total)}*`, "");
  if (o.mode === "delivery" && o.address) {
    const a = o.address;
    L.push("*Endereço*", `${a.quadra}${a.conjunto ? `, Conj. ${a.conjunto}` : ""}${a.casa ? `, Casa ${a.casa}` : ""}`);
    if (a.complemento) L.push(a.complemento);
    if (a.referencia) L.push(`Ref.: ${a.referencia}`);
    L.push("");
  }
  const pm = o.payment || {};
  const payTxt = pm.method === "pix" ? (pm.paid ? "Pix — pago pelo site (demonstração)" : "Pix") : pm.method === "dinheiro" ? (pm.changeFor ? `Dinheiro — troco para ${money(pm.changeFor)}` : "Dinheiro — sem troco") : pm.method === "credito" ? "Cartão de crédito na entrega" : "Cartão de débito na entrega";
  L.push(`*Pagamento:* ${payTxt}`);
  L.push(`*Cliente:* ${o.customer.name} · ${maskPhone(o.customer.phone)}`);
  if (o.note) L.push(`*Recado:* ${o.note}`);
  L.push("", `Acompanhar: ${location.href.split("#")[0]}#pedido=${o.id}`);
  return L.join("\n");
}

function send(paid) {
  clearInterval(pixTimer);
  const t = totals();
  const order = {
    channel: "site", status: "novo", mode: ck.mode,
    customer: { name: ck.name.trim(), phone: digits(ck.phone) },
    address: ck.mode === "delivery" ? { quadra: ck.quadra.trim(), conjunto: ck.conjunto.trim(), casa: ck.casa.trim(), complemento: ck.complemento.trim(), referencia: ck.referencia.trim() } : null,
    table: ck.mode === "dinein" ? ck.table.trim() : null,
    lines: cart.lines.map((l) => ({ productId: l.productId, name: l.name, qty: l.qty, unitPrice: Math.round((S.lineTotal(l) / l.qty) * 100) / 100, options: l.options || [], note: l.note || "" })),
    payment: { method: ck.pay, changeFor: ck.pay === "dinheiro" && ck.needChange ? parseMoney(ck.changeFor) : null, paid: !!paid },
    note: ck.note.trim(), courier: null, rating: null
  };
  const o = S.placeOrder(order);
  if (ck.optIn) S.update("customers", (c) => { const k = o.customer.phone; return { ...c, [k]: { ...(c[k] || {}), optIn: true, optInAt: Date.now() } }; });
  if (ck.remember) lsSet(ME_KEY, { name: o.customer.name, phone: o.customer.phone, mode: ck.mode, pay: ck.pay, address: o.address || lsGet(ME_KEY, {})?.address || null });
  else lsSet(ME_KEY, null);
  lsSet("dog.site.active", o.id);
  openLink(waLink(waMessage(o)));
  cart.clear();
  void t;
  closeDialog(dlg()).then(() => openTracking(o.id, { fresh: true, paid }));
}
