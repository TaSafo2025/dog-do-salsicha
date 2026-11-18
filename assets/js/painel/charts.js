/* Gráficos em SVG próprio (sem bibliotecas). Redesenham ao mudar o tamanho do container. */
import { h, s, clear, BRL0, BRL } from "./dom.js";

let tip;
function tooltip() { return (tip ||= document.body.appendChild(h("div", { class: "chart-tip", role: "tooltip" }))); }
export function showTip(evt, lines) {
  const t = tooltip(); clear(t);
  lines.forEach((l, i) => t.append(h(i === 0 ? "strong" : "span", {}, l)));
  t.classList.add("on");
  const r = t.getBoundingClientRect(); let x = evt.clientX + 14, y = evt.clientY - r.height - 10;
  if (x + r.width > innerWidth - 8) x = evt.clientX - r.width - 14; if (y < 8) y = evt.clientY + 16;
  t.style.transform = `translate(${x}px, ${y}px)`;
}
export const hideTip = () => tip?.classList.remove("on");

function responsive(host, draw) {
  let w = 0;
  const ro = new ResizeObserver(() => { const nw = Math.round(host.clientWidth); if (nw && nw !== w) { w = nw; clear(host); host.append(draw(w)); } });
  ro.observe(host);
  return host;
}
const niceMax = (v) => { if (v <= 0) return 1; const p = Math.pow(10, Math.floor(Math.log10(v))); const n = v / p; return (n <= 1 ? 1 : n <= 1.5 ? 1.5 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 3 ? 3 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 6 ? 6 : n <= 8 ? 8 : 10) * p; };
const kfmt = (v) => (v >= 1000 ? (v / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mil" : Math.round(v).toLocaleString("pt-BR"));

/** Barras verticais. data: [{label, sub, value, tone, tip:[...]}] ; opts: {height, avg, fmt, highlightLast} */
export function bars(data, opts = {}) {
  const host = h("div", { class: "chart" });
  return responsive(host, (W) => {
    const H = opts.height || 220, padL = 44, padR = 8, padT = 14, padB = 34;
    const max = niceMax(Math.max(...data.map((d) => d.value), opts.avg || 0) * 1.08);
    const iw = W - padL - padR, ih = H - padT - padB; const bw = iw / data.length;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "svgc", role: "img", "aria-label": opts.label || "Gráfico de barras" });
    const lead = +(max / Math.pow(10, Math.floor(Math.log10(max)))).toFixed(1); const dv = [3, 6, 1.5].includes(lead) ? 3 : 4;
    for (let i = 0; i <= dv; i++) {
      const v = (max / dv) * i, y = padT + ih - (v / max) * ih;
      svg.append(s("line", { x1: padL, x2: W - padR, y1: y, y2: y, class: i ? "grid" : "axis" }), s("text", { x: padL - 8, y: y + 4, class: "tick", "text-anchor": "end" }, opts.fmt ? opts.fmt(v) : kfmt(v)));
    }
    const step = Math.ceil(data.length / Math.max(4, Math.floor(iw / 46)));
    data.forEach((d, i) => {
      const x = padL + i * bw; const bh = Math.max(d.value > 0 ? 2 : 0, (d.value / max) * ih); const gap = Math.min(6, bw * 0.28);
      const g = s("g", { class: "bar-g" });
      g.append(s("rect", { x: x, y: padT, width: bw, height: ih, class: "hit" }));
      if (d.value > 0) g.append(s("rect", { x: x + gap / 2, y: padT + ih - bh, width: Math.max(1, bw - gap), height: bh, rx: Math.min(4, (bw - gap) / 2), class: "bar " + (d.tone || "") }));
      else if (d.closed) g.append(s("text", { x: x + bw / 2, y: padT + ih - 6, class: "tick closed", "text-anchor": "middle" }, "—"));
      if (i % step === 0 || i === data.length - 1) g.append(s("text", { x: x + bw / 2, y: H - 16, class: "tick", "text-anchor": "middle" }, d.label), d.sub ? s("text", { x: x + bw / 2, y: H - 3, class: "tick sub", "text-anchor": "middle" }, d.sub) : "");
      g.addEventListener("pointermove", (e) => showTip(e, d.tip || [d.label, BRL(d.value)])); g.addEventListener("pointerleave", hideTip);
      svg.append(g);
    });
    if (opts.avg) {
      const y = padT + ih - (opts.avg / max) * ih;
      svg.append(s("line", { x1: padL, x2: W - padR, y1: y, y2: y, class: "avg" }), s("text", { x: W - padR - 4, y: y - 6, class: "avg-t", "text-anchor": "end" }, opts.avgLabel || "média " + BRL0(opts.avg)));
    }
    return svg;
  });
}

/** Entradas (para cima) e saídas (para baixo) + linha de saldo, com projeção tracejada */
export function flow(days, opts = {}) {
  const host = h("div", { class: "chart" });
  return responsive(host, (W) => {
    const H = opts.height || 260, padL = 50, padR = 50, padT = 16, padB = 30;
    const maxIO = niceMax(Math.max(...days.map((d) => Math.max(d.in, d.out))) * 1.05);
    const bals = days.map((d) => d.bal); const bmin = Math.min(0, ...bals), bmax = niceMax(Math.max(...bals) * 1.1);
    const iw = W - padL - padR, ih = H - padT - padB, mid = padT + ih / 2; const bw = iw / days.length;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "svgc", role: "img", "aria-label": "Fluxo de caixa" });
    svg.append(s("line", { x1: padL, x2: W - padR, y1: mid, y2: mid, class: "axis" }));
    [1, -1].forEach((sg) => svg.append(s("text", { x: padL - 8, y: mid - sg * (ih / 2) + 4 + (sg < 0 ? -6 : 6), class: "tick", "text-anchor": "end" }, (sg > 0 ? "+" : "−") + kfmt(maxIO))));
    svg.append(s("text", { x: padL - 8, y: mid + 4, class: "tick", "text-anchor": "end" }, "0"));
    const by = (v) => padT + ih - ((v - bmin) / (bmax - bmin)) * ih;
    const step = Math.ceil(days.length / Math.max(4, Math.floor(iw / 52)));
    days.forEach((d, i) => {
      const x = padL + i * bw, gap = Math.min(4, bw * 0.25), w = Math.max(1, bw - gap);
      const g = s("g", { class: "bar-g" + (d.proj ? " proj" : "") });
      g.append(s("rect", { x, y: padT, width: bw, height: ih, class: "hit" }));
      const hi = (d.in / maxIO) * (ih / 2), ho = (d.out / maxIO) * (ih / 2);
      if (hi > 0) g.append(s("rect", { x: x + gap / 2, y: mid - hi, width: w, height: hi, rx: 2, class: "bar in" }));
      if (ho > 0) g.append(s("rect", { x: x + gap / 2, y: mid, width: w, height: ho, rx: 2, class: "bar out" }));
      if (i % step === 0) g.append(s("text", { x: x + bw / 2, y: H - 10, class: "tick", "text-anchor": "middle" }, d.label));
      g.addEventListener("pointermove", (e) => showTip(e, [d.title || d.label, "Entradas " + BRL(d.in), "Saídas " + BRL(d.out), "Saldo " + BRL(d.bal)])); g.addEventListener("pointerleave", hideTip);
      svg.append(g);
    });
    const pts = days.map((d, i) => [padL + i * bw + bw / 2, by(d.bal)]);
    const split = days.findIndex((d) => d.proj);
    const seg = (a, b, cls) => { if (b - a < 1) return; svg.append(s("path", { d: pts.slice(a, b + 1).map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" "), class: "bal " + cls })); };
    if (split < 0) seg(0, pts.length - 1, ""); else { seg(0, Math.max(0, split - 1), ""); seg(Math.max(0, split - 1), pts.length - 1, "dash"); }
    if (split > 0) { const x = padL + split * bw; svg.append(s("line", { x1: x, x2: x, y1: padT, y2: padT + ih, class: "today" }), s("text", { x: x + 4, y: padT + 10, class: "tick today-t" }, "hoje → projeção")); }
    for (let i = 0; i <= 2; i++) { const v = bmin + ((bmax - bmin) / 2) * i; svg.append(s("text", { x: W - padR + 6, y: by(v) + 4, class: "tick bal-t" }, kfmt(v))); }
    if (bmin < 0) svg.append(s("line", { x1: padL, x2: W - padR, y1: by(0), y2: by(0), class: "zero" }));
    return svg;
  });
}

/** Mapa de calor dia × hora */
export function heatmap(rows, cols, cell, opts = {}) {
  const max = Math.max(1, ...rows.flatMap((r, i) => cols.map((c, j) => cell(i, j).v)));
  const grid = h("div", { class: "heat", style: { "--cols": cols.length } });
  grid.append(h("span", { class: "heat-c heat-h" }, ""), ...cols.map((c) => h("span", { class: "heat-c heat-h" }, c)));
  rows.forEach((r, i) => {
    grid.append(h("span", { class: "heat-c heat-r" }, r));
    cols.forEach((c, j) => {
      const x = cell(i, j); const p = x.v / max;
      const el = h("span", { class: "heat-c heat-v" + (x.v ? "" : " zero") + (p > 0.55 ? " hot" : ""), style: { "--p": p.toFixed(3) }, tabindex: 0, "aria-label": `${r} ${c}: ${x.label}` }, x.v ? x.short ?? "" : "");
      el.addEventListener("pointermove", (e) => showTip(e, [`${r} · ${c}`, x.label, ...(x.more || [])])); el.addEventListener("pointerleave", hideTip);
      grid.append(el);
    });
  });
  return grid;
}

/** Dispersão da engenharia de cardápio */
export function matrix(items, opts) {
  const host = h("div", { class: "chart" });
  return responsive(host, (W) => {
    const H = Math.min(460, Math.max(320, W * 0.62)), pad = { l: 56, r: 16, t: 16, b: 44 };
    const xmax = niceMax(Math.max(...items.map((d) => d.x)) * 1.08), ymax = opts.ymax || niceMax(Math.max(...items.map((d) => d.y)) * 1.08);
    const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
    const ymin = opts.ymin || 0; const X = (v) => pad.l + (v / xmax) * iw, Y = (v) => pad.t + ih - ((v - ymin) / (ymax - ymin)) * ih;
    const svg = s("svg", { width: W, height: H, viewBox: `0 0 ${W} ${H}`, class: "svgc matrix", role: "img", "aria-label": "Engenharia de cardápio" });
    const cx = X(opts.xCut), cy = Y(opts.yCut);
    const quad = [["q-puzzle", pad.l, pad.t, cx - pad.l, cy - pad.t, opts.labels[2]], ["q-star", cx, pad.t, W - pad.r - cx, cy - pad.t, opts.labels[0]],
      ["q-dog", pad.l, cy, cx - pad.l, pad.t + ih - cy, opts.labels[3]], ["q-horse", cx, cy, W - pad.r - cx, pad.t + ih - cy, opts.labels[1]]];
    for (const [cls, x, y, w, hh, lab] of quad) {
      svg.append(s("rect", { x, y, width: Math.max(0, w), height: Math.max(0, hh), class: "quad " + cls }));
      svg.append(s("text", { x: cls === "q-star" || cls === "q-horse" ? x + w - 10 : x + 10, y: cls === "q-dog" || cls === "q-horse" ? y + hh - 10 : y + 20, class: "quad-t", "text-anchor": cls === "q-star" || cls === "q-horse" ? "end" : "start" }, lab));
    }
    svg.append(s("line", { x1: cx, x2: cx, y1: pad.t, y2: pad.t + ih, class: "cut" }), s("line", { x1: pad.l, x2: W - pad.r, y1: cy, y2: cy, class: "cut" }));
    svg.append(s("text", { x: pad.l + iw / 2, y: H - 8, class: "tick", "text-anchor": "middle" }, opts.xLabel), s("text", { x: 14, y: pad.t + ih / 2, class: "tick", "text-anchor": "middle", transform: `rotate(-90 14 ${pad.t + ih / 2})` }, opts.yLabel));
    for (let i = 0; i <= 4; i++) { svg.append(s("text", { x: X((xmax / 4) * i), y: pad.t + ih + 16, class: "tick", "text-anchor": "middle" }, Math.round((xmax / 4) * i))); svg.append(s("text", { x: pad.l - 8, y: Y(ymin + ((ymax - ymin) / 4) * i) + 4, class: "tick", "text-anchor": "end" }, opts.yFmt ? opts.yFmt(ymin + ((ymax - ymin) / 4) * i) : "R$ " + (ymin + ((ymax - ymin) / 4) * i).toFixed(0))); }
    const placed = [];
    for (const d of [...items].sort((a, b) => b.x - a.x)) {
      const px = X(d.x), py = Y(d.y);
      const g = s("g", { class: "pt " + d.cls, tabindex: 0 });
      g.append(s("circle", { cx: px, cy: py, r: 6.5 }));
      const lx = px + 10, ly = py + 4;
      if (W > 560 && !placed.some(([a, b]) => Math.abs(a - lx) < 90 && Math.abs(b - ly) < 13)) { g.append(s("text", { x: lx, y: ly, class: "pt-t" }, d.short)); placed.push([lx, ly]); }
      g.addEventListener("pointermove", (e) => showTip(e, d.tip)); g.addEventListener("pointerleave", hideTip);
      svg.append(g);
    }
    return svg;
  });
}

/** sparkline pequena para KPIs */
export function spark(values, cls = "") {
  const W = 120, H = 32; const max = Math.max(...values, 1), min = Math.min(...values, 0);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * W, H - 3 - ((v - min) / (max - min || 1)) * (H - 6)]);
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  return s("svg", { class: "spark " + cls, viewBox: `0 0 ${W} ${H}`, preserveAspectRatio: "none", "aria-hidden": "true" },
    s("path", { d: d + ` L${W} ${H} L0 ${H} Z`, class: "spark-a" }), s("path", { d, class: "spark-l" }));
}

/** barras horizontais simples (lista) */
export function hbars(items, { fmt = BRL, max } = {}) {
  const m = max ?? Math.max(1, ...items.map((i) => i.value));
  return h("div", { class: "hbars" }, items.map((i) => h("div", { class: "hb" },
    h("div", { class: "hb-top" }, h("span", { class: "hb-l" }, i.label), h("span", { class: "hb-v" }, fmt(i.value))),
    h("div", { class: "hb-track" }, h("i", { class: i.tone || "", style: { width: ((i.value / m) * 100).toFixed(1) + "%" } })),
    i.sub ? h("div", { class: "hb-s" }, i.sub) : null)));
}
