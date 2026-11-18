/* WhatsApp (simulado) — conexão, caixa de entrada com robô, mensagens automáticas, campanhas com proteção anti-bloqueio, resumo diário do dono */
import * as store from "../store.js";
import { h, s, icon, clear, BRL, BRL0, pct, fmtTime, fmtDate, DAY, startOfDay, phoneFmt, WDL, ago } from "./dom.js";
import { summarize, dre, bills, insumos, stockStatus, CHANNELS, inUse } from "./calc.js";
import { card, btn, toast, seg, tabs, toggle, chip, pill, avatar, modal, empty } from "./ui.js";
import { segmentOf, campaignState } from "./clientes.js";

const ui = { tab: "conversas", sel: null, segment: "todos", text: "Oi, {nome}! Saudade de você aqui no Dog do Salsicha 🌭 Nesta quinta, o Dog Chapa duplo sai por R$ 18 no site: dogdosalsicha.com.br. Bora?", sending: null };
const LIMIT_H = 40, MIN_S = 25, MAX_S = 60;
const AUTO = [
  ["aceito", "Pedido aceito", "Quando você aceita o pedido", "Oi, {nome}! Recebemos seu pedido {pedido} e ele já foi para a chapa. Previsão: {tempo} min."],
  ["preparo", "Pedido pronto (retirada)", "Quando marca Pronto num pedido de retirada", "{nome}, seu pedido {pedido} está pronto para retirar no balcão!"],
  ["entrega", "Saiu para entrega", "Quando despacha com o motoboy", "{nome}, seu pedido {pedido} saiu para entrega com o {motoboy}! 🛵"],
  ["avaliacao", "Pedido entregue + avaliação", "Ao concluir a entrega", "Pedido {pedido} entregue! De 0 a 5, quanto você dá pro nosso dog? Sua opinião ajuda muito 🧡"],
  ["robo", "Robô de atendimento", "Responde cardápio, taxa por quadra, horário, formas de pagamento e “cadê meu pedido”", "Responde sozinho as perguntas mais comuns e chama você quando não souber."],
  ["resumo", "Resumo diário para a dona", "Todo dia às 23h50, no seu WhatsApp pessoal", "Vendas, lucro estimado, alertas de estoque e contas do dia seguinte."]
];
const convs = (wa) => {
  const list = Array.isArray(wa) ? wa : [];
  if (list.every((c) => Array.isArray(c.msgs))) return list;
  const by = {}; for (const m of list) { if (Array.isArray(m.msgs)) { by[m.phone] = m; continue; } const k = String(m.phone || m.to || "site").replace(/\D/g, "") || "site"; (by[k] ||= { id: "x" + k, phone: k, name: m.name || phoneFmt(k), unread: 0, msgs: [] }).msgs.push({ from: m.from || "cliente", text: m.text || m.body || "", at: m.at || Date.now() }); }
  return Object.values(by);
};
function botReply(text, ctx) {
  const t = text.toLowerCase(); const cfg = ctx.state.config; const st = store.storeOpen();
  if (/card[aá]pio|menu/.test(t)) return "Aqui está o cardápio completo com fotos: dogdosalsicha.com.br/#cardapio 🌭 O mais pedido é o Dog Chapa duplo (" + BRL(store.priceOf("dog-chapa-duplo")) + ").";
  if (/taxa|entrega|frete/.test(t)) { const q = (text.match(/q[nrsi]\s*\d{3,4}/i) || [])[0]; const f = q && store.feeFor(q.toUpperCase()); return f != null ? `Para ${q.toUpperCase()} a taxa é ${BRL(f)}. Tempo médio: ${cfg.deliveryMin || 60} min.` : "Me diz sua quadra (ex.: QN 310) que eu te passo a taxa certinha! Entregamos em 399 quadras."; }
  if (/cad[eê]|demora|meu pedido|chega/.test(t)) return "Vou ver aqui… seu pedido está na chapa e sai em poucos minutos. Assim que o motoboy sair eu te aviso!";
  if (/pix|cart[aã]o|pagamento|dinheiro/.test(t)) return "Aceitamos Pix, dinheiro (com troco), crédito e débito na maquininha do motoboy.";
  if (/aberto|hor[aá]rio|abre|fecha/.test(t)) return st.open ? "Estamos abertos agora até 23h30! Pede pelo site que é mais rápido: dogdosalsicha.com.br" : "Abrimos de terça a domingo, a partir das 18h30 (sáb e dom 18h15) até 23h30.";
  if (/sair|parar|cancelar inscri/.test(t)) return "Pronto, você não vai mais receber promoções. Se mudar de ideia, é só mandar VOLTAR.";
  return "Recebi sua mensagem! A gente já vai te responder. Se quiser adiantar, o cardápio está em dogdosalsicha.com.br";
}
function pushMsg(phone, msg) { store.update("wa", (list) => convs(list).map((c) => c.phone === phone ? { ...c, msgs: [...c.msgs, msg], unread: msg.from === "cliente" ? (c.unread || 0) + 1 : 0 } : c)); }

/* ---------- QR ilustrativo ---------- */
function fakeQR(size = 200) {
  const n = 29, c = size / n; let seed = 6477; const r = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const svg = s("svg", { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: "qr", role: "img", "aria-label": "QR code ilustrativo de conexão" });
  svg.append(s("rect", { width: size, height: size, fill: "#fff" }));
  const finder = (x, y) => { svg.append(s("rect", { x: x * c, y: y * c, width: 7 * c, height: 7 * c, fill: "#1C1412" }), s("rect", { x: (x + 1) * c, y: (y + 1) * c, width: 5 * c, height: 5 * c, fill: "#fff" }), s("rect", { x: (x + 2) * c, y: (y + 2) * c, width: 3 * c, height: 3 * c, fill: "#1C1412" })); };
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { const inF = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9); if (!inF && r() > 0.52) svg.append(s("rect", { x: x * c, y: y * c, width: c, height: c, fill: "#1C1412" })); }
  finder(0, 0); finder(n - 7, 0); finder(0, n - 7);
  svg.append(s("rect", { x: size / 2 - 22, y: size / 2 - 22, width: 44, height: 44, rx: 10, fill: "#fff" }), s("rect", { x: size / 2 - 17, y: size / 2 - 17, width: 34, height: 34, rx: 8, fill: "#25D366" }));
  return svg;
}

function conversas(ctx) {
  const list = convs(ctx.state.wa).slice().sort((a, b) => (b.msgs.at(-1)?.at || 0) - (a.msgs.at(-1)?.at || 0));
  if (!ui.sel && list[0]) ui.sel = list[0].phone;
  const cur = list.find((c) => c.phone === ui.sel) || list[0];
  const side = h("ul", { class: "wa-list" }, list.map((c) => { const last = c.msgs.at(-1);
    return h("li", {}, h("button", { type: "button", class: "wa-c" + (c === cur ? " on" : ""), onclick: () => { ui.sel = c.phone; if (c.unread) store.update("wa", (l) => convs(l).map((x) => x.phone === c.phone ? { ...x, unread: 0 } : x)); ctx.rerender(); } },
      avatar(c.name), h("div", { class: "wa-cb" }, h("div", { class: "wa-ct" }, h("strong", {}, c.name), h("small", {}, last ? fmtTime(last.at) : "")), h("p", {}, (last?.from === "robo" ? "🤖 " : last?.from === "loja" ? "Você: " : "") + (last?.text || ""))),
      c.unread ? h("span", { class: "wa-un" }, String(c.unread)) : null)); }));
  let thread;
  if (cur) {
    const msgs = h("div", { class: "wa-msgs" }, cur.msgs.map((m, i) => { const day = i === 0 || startOfDay(cur.msgs[i - 1].at) !== startOfDay(m.at);
      return [day ? h("div", { class: "wa-day" }, startOfDay(m.at) === startOfDay(Date.now()) ? "Hoje" : fmtDate(m.at)) : null,
        h("div", { class: "bub " + (m.from === "cliente" ? "in" : "out") + (m.from === "robo" ? " bot" : "") }, m.from === "robo" ? h("span", { class: "bub-tag" }, icon("bolt", 12), m.auto ? " Mensagem automática" : " Robô respondeu") : null, h("p", {}, m.text), h("small", {}, fmtTime(m.at) + (m.from !== "cliente" ? " ✓✓" : "")))]; }));
    const ta = h("input", { class: "inp", placeholder: "Escreva uma resposta…", "aria-label": "Mensagem", value: ui.draft || "", dataset: { fk: "wamsg" }, oninput: (e) => { ui.draft = e.target.value; }, onkeydown: (e) => { if (e.key === "Enter") send(); } });
    const send = () => { const t = ta.value.trim(); if (!t) return; ui.draft = ""; ta.value = ""; pushMsg(cur.phone, { from: "loja", text: t, at: Date.now() }); };
    const sim = () => { const qs = ["Qual a taxa pra QN 412?", "Vcs tem cardápio?", "Cadê meu pedido??", "Aceita cartão?", "Que horas abre?"]; const q = qs[Math.floor(Math.random() * qs.length)];
      pushMsg(cur.phone, { from: "cliente", text: q, at: Date.now() }); if (ctx.state.config.waAuto?.robo !== false) setTimeout(() => pushMsg(cur.phone, { from: "robo", text: botReply(q, ctx), at: Date.now() }), 900); };
    thread = h("div", { class: "wa-th" },
      h("header", { class: "wa-th-h" }, avatar(cur.name), h("div", {}, h("strong", {}, cur.name), h("small", {}, phoneFmt(cur.phone))), h("span", { class: "grow" }), btn("Simular mensagem do cliente", { size: "sm", icon: "sparkle", onclick: sim })),
      msgs, h("div", { class: "wa-quick" }, ["Cardápio: dogdosalsicha.com.br", "Seu pedido já saiu! 🛵", "Pix: (61) 99882-6477", "Obrigada pela preferência! 🧡"].map((q) => h("button", { type: "button", class: "opt-chip", onclick: () => { ta.value = q; ui.draft = q; ta.focus(); } }, q))),
      h("div", { class: "wa-comp" }, ta, btn("", { kind: "wa", icon: "send", attrs: { "aria-label": "Enviar" }, onclick: send })));
    requestAnimationFrame(() => { msgs.scrollTop = msgs.scrollHeight; });
  } else thread = empty("Nenhuma conversa ainda.", "chat");
  return h("div", { class: "wa-inbox" }, side, thread);
}
function automaticas(ctx) {
  const cfg = ctx.state.config; const a = cfg.waAuto || {};
  return h("div", { class: "auto-grid" }, AUTO.map(([k, t, when, text]) => card(t, { sub: when, cls: "auto" + (a[k] ? " on" : ""), actions: toggle(!!a[k], (v) => { store.update("config", (c) => ({ ...c, waAuto: { ...(c.waAuto || {}), [k]: v } })); toast(t + (v ? " ligado." : " desligado.")); }, a[k] ? "Ligado" : "Desligado") },
    h("div", { class: "bub out bot mini" }, h("p", {}, text.replace("{nome}", "Ana").replace("{pedido}", "DS-2381").replace("{tempo}", String(cfg.deliveryMin || 60)).replace("{motoboy}", "Wesley"))))));
}
function campanha(ctx) {
  if (campaignState.segment) { ui.segment = campaignState.segment; campaignState.segment = null; }
  const now = Date.now(); const cust = Object.values(ctx.state.customers || {}).filter((c) => c.orders > 0);
  const inSeg = cust.filter((c) => ui.segment === "todos" ? true : segmentOf(c, now) === ui.segment);
  const aud = inSeg.filter((c) => c.optIn); const blocked = inSeg.length - aud.length;
  const hours = aud.length / LIMIT_H; const ta = h("textarea", { class: "inp", rows: 5, "aria-label": "Mensagem da campanha", dataset: { fk: "camp" }, oninput: (e) => { ui.text = e.target.value; prev.textContent = preview(); } }, ui.text);
  const preview = () => ui.text.replaceAll("{nome}", aud[0]?.name.split(" ")[0] || "Ana") + "\n\nResponda SAIR para não receber mais.";
  const prev = h("p", {}, preview());
  const hist = ctx.state.config.campaigns || [];
  const sending = ui.sending;
  return h("div", { class: "camp" },
    card("Nova campanha", { icon: "send", sub: "Mensagem para clientes que aceitaram receber promoções" },
      h("div", { class: "stack" },
        h("div", { class: "field" }, h("span", { class: "field-l" }, "Para quem"), seg([["todos", "Todos"], ["frequente", "Frequentes"], ["sumido", "Sumidos +30 dias"], ["novo", "Novos"]], ui.segment, (v) => { ui.segment = v; ctx.rerender(); }, "seg-sm")),
        h("div", { class: "aud" }, h("strong", {}, String(aud.length)), h("span", {}, " clientes vão receber"), blocked ? h("span", { class: "muted" }, ` · ${blocked} sem opt-in ficam de fora`) : null),
        h("label", { class: "field" }, h("span", { class: "field-l" }, "Mensagem"), ta, h("span", { class: "field-h" }, "Use {nome} para personalizar — mensagens iguais em massa aumentam o risco de bloqueio.")),
        h("div", { class: "row-end" }, sending ? h("div", { class: "sendbar" }, h("span", {}, `Enviando ${sending.done} de ${sending.total}…`), h("div", { class: "meter ok" }, h("i", { style: { width: (sending.done / sending.total * 100) + "%" } })))
          : btn(`Iniciar envio (simulado) · ~${hours < 1 ? Math.ceil(hours * 60) + " min" : hours.toFixed(1).replace(".", ",") + " h"}`, { kind: "wa", icon: "send", attrs: { disabled: !aud.length }, onclick: () => start(ctx, aud) })))),
    h("div", { class: "stack" },
      card("Prévia", { icon: "eye" }, h("div", { class: "phone-prev" }, h("div", { class: "bub out" }, prev, h("small", {}, "agora ✓✓")))),
      card("Proteções anti-bloqueio", { icon: "shield", cls: "shield" },
        h("ul", { class: "checks" }, [
          ["Só envia para quem aceitou (opt-in)", `${aud.length} de ${inSeg.length} neste grupo`],
          [`No máximo ${LIMIT_H} mensagens por hora`, "ritmo de conversa normal, não de robô"],
          [`Intervalo aleatório de ${MIN_S} a ${MAX_S} segundos`, "entre uma mensagem e outra"],
          ["Opção SAIR em toda mensagem", "quem responder SAIR sai da lista na hora"],
          ["Não envia entre 22h e 9h", "nem para quem pediu nos últimos 2 dias"],
          ["Mensagem personalizada com o nome", "evita textos idênticos em massa"]].map(([a, b]) => h("li", {}, icon("check", 16), h("div", {}, h("strong", {}, a), h("small", {}, b)))))),
      hist.length ? card("Campanhas enviadas", { icon: "list" }, h("ul", { class: "bills" }, hist.slice(0, 5).map((c) => h("li", { class: "bill" }, h("div", { class: "bill-d" }, h("strong", {}, c.segment), h("small", {}, fmtDate(c.at) + " · " + c.text.slice(0, 60) + "…")), pill(c.sent + " enviadas", "ok"))))) : null));
}
function start(ctx, aud) {
  ui.sending = { done: 0, total: aud.length }; ctx.rerender();
  const it = setInterval(() => {
    ui.sending.done = Math.min(ui.sending.total, ui.sending.done + Math.max(1, Math.round(ui.sending.total / 12)));
    if (ui.sending.done >= ui.sending.total) { clearInterval(it); const n = ui.sending.total; ui.sending = null;
      store.update("config", (c) => ({ ...c, campaigns: [{ at: Date.now(), segment: { todos: "Todos", frequente: "Frequentes", sumido: "Sumidos", novo: "Novos" }[ui.segment], text: ui.text, sent: n }, ...(c.campaigns || [])] }));
      toast(`Campanha simulada: ${n} mensagens enfileiradas com intervalo seguro.`); }
    ctx.rerender();
  }, 350);
}
export function dailySummary(ctx) {
  const { state } = ctx; const t0 = startOfDay(Date.now()); let day = null;
  for (let k = 0; k < 8; k++) { const a = t0 - k * DAY; const s = summarize(state.orders, state.config, a, a + DAY); if (s.count >= 10) { day = { a, s }; break; } }
  if (!day) return "Sem vendas recentes.";
  const s = day.s; const top = Object.entries(s.byProduct).sort((a, b) => b[1].qty - a[1].qty)[0]; const d = dre(state, 0);
  const zer = insumos().filter((i) => stockStatus(i.id, state.stock[i.id] ?? 0) === "zerado" && inUse(state, i.id)).map((i) => i.name.toLowerCase());
  const low = insumos().filter((i) => ["baixo", "critico"].includes(stockStatus(i.id, state.stock[i.id] ?? 0))).length;
  const due = bills(state.finance).filter((b) => !b.paidAt && b.due < t0 + 2 * DAY);
  const profitDay = s.sales - s.fees - s.cost - d.fixedMonth / 26;
  return [`*Resumo de ${WDL[new Date(day.a).getDay()]} ${fmtDate(day.a)}* 🌭`, "",
    `💰 Vendas: *${BRL(s.sales)}* em ${s.count} pedidos (ticket ${BRL(s.ticket)})`,
    `📈 Lucro estimado do dia: *${BRL(profitDay)}*`,
    `🏆 Mais vendido: ${window.DOG.products[top[0]]?.name} (${top[1].qty})`,
    `🛵 iFood: ${s.byChannel.ifood?.count || 0} pedidos · taxas ${BRL(s.ifood)}`,
    `🌐 Site próprio: ${s.byChannel.site?.count || 0} pedidos · taxa zero`, "",
    zer.length ? `⚠️ Acabou: ${zer.join(", ")}` : "✅ Estoque sem itens zerados", low ? `📦 ${low} itens abaixo do mínimo — lista de compras pronta no painel` : null,
    due.length ? `📅 Contas até amanhã: ${due.map((b) => b.desc.split(" — ")[0] + " " + BRL(b.amount)).join(", ")}` : null, "",
    `CMV do mês: ${pct(d.cmv, 1)} (ideal até 35%)`].filter((x) => x !== null).join("\n");
}
function resumo(ctx) {
  const text = dailySummary(ctx);
  return h("div", { class: "resumo" },
    h("div", { class: "phone" }, h("div", { class: "phone-top" }, h("img", { src: "assets/img/logo.webp", alt: "", width: 32, height: 32 }), h("div", {}, h("strong", {}, "Painel Dog do Salsicha"), h("small", {}, "robô do painel"))),
      h("div", { class: "phone-body" }, h("div", { class: "bub in sum" }, text.split("\n").map((l) => l ? h("p", {}, l.split("*").map((p, i) => i % 2 ? h("strong", {}, p) : p)) : h("br")), h("small", {}, "23:50")))),
    h("div", { class: "stack" }, card("Resumo diário enviado à dona", { icon: "sparkle", sub: "Chega no seu WhatsApp pessoal quando a loja fecha" },
      h("p", {}, "Sem abrir o painel, você fica sabendo quanto vendeu, quanto sobrou, o que acabou no estoque e quais contas vencem. Se algo fugir do normal (venda muito abaixo, CMV alto, caixa com diferença), o resumo avisa."),
      h("div", { class: "row-end" }, toggle(!!ctx.state.config.waAuto?.resumo, (v) => store.update("config", (c) => ({ ...c, waAuto: { ...(c.waAuto || {}), resumo: v } })), "Enviar todo dia às 23h50"),
        h("a", { class: "btn btn-wa", href: "https://wa.me/5561998826477?text=" + encodeURIComponent(text), target: "_blank", rel: "noopener" }, icon("send", 18), h("span", {}, "Mandar exemplo agora"))))));
}
function conexao(ctx) {
  return h("div", { class: "conn" },
    card(null, { cls: "conn-card" }, h("div", { class: "conn-l" }, h("span", { class: "pill pill-ok" }, h("i", { class: "dot" }), "Conectado"), h("h2", { class: "conn-n" }, "(61) 99882-6477"), h("p", { class: "muted" }, "Dog do Salsicha · WhatsApp Business"),
      h("dl", { class: "conn-dl" }, h("dt", {}, "Conectado desde"), h("dd", {}, fmtDate(Date.now() - 12 * DAY)), h("dt", {}, "Mensagens hoje"), h("dd", {}, String(convs(ctx.state.wa).reduce((a, c) => a + c.msgs.filter((m) => m.at >= startOfDay(Date.now())).length, 0))), h("dt", {}, "Respondidas pelo robô"), h("dd", {}, "78% (últimos 7 dias)"), h("dt", {}, "Tempo médio de resposta"), h("dd", {}, "6 segundos")),
      h("p", { class: "note" }, icon("info", 16), " No esboço a conexão é ilustrativa. Na versão final usamos a API oficial do WhatsApp, que não derruba o número da loja.")),
      h("div", { class: "conn-r" }, fakeQR(196), h("p", { class: "muted small" }, "Para reconectar: no celular da loja abra WhatsApp › Aparelhos conectados › Conectar aparelho e aponte para o código."))));
}

export default {
  id: "whatsapp", deps: ["wa", "config", "customers"],
  render(ctx) {
    const sub = ctx.route()[1]; if (sub && ui._sub !== sub) { ui.tab = sub; ui._sub = sub; }
    const unread = convs(ctx.state.wa).reduce((a, c) => a + (c.unread || 0), 0);
    const body = ui.tab === "automaticas" ? automaticas(ctx) : ui.tab === "campanha" ? campanha(ctx) : ui.tab === "resumo" ? resumo(ctx) : ui.tab === "conexao" ? conexao(ctx) : conversas(ctx);
    return h("div", { class: "stack-lg" },
      h("div", { class: "wa-bar" }, h("span", { class: "wa-st" }, h("i", { class: "pulse" }), "Conectado ", h("strong", {}, "(61) 99882-6477")), h("span", { class: "muted small" }, "Robô " + (ctx.state.config.waAuto?.robo !== false ? "ligado" : "desligado") + " · simulação")),
      tabs([["conversas", "Conversas", unread ? String(unread) : null], ["automaticas", "Mensagens automáticas"], ["campanha", "Campanhas"], ["resumo", "Resumo do dia"], ["conexao", "Conexão"]], ui.tab, (v) => { ui.tab = v; ctx.rerender(); }), body);
  }
};
