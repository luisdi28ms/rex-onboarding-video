// Visual vocabulary for the Rex onboarding video.
// Every component returns an HTML string; a frame is pure function of time.

const C = {
  bg: '#0b0f14', panel: '#131a22', panel2: '#1b2430', cream: '#f7efdc',
  red: '#ff6b6b', green: '#3ddc84', yellow: '#ffd166', blue: '#7cc4ff',
  muted: '#6b7a8c', line: '#2a3542',
};

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const easeOut = x => 1 - Math.pow(1 - x, 3);
const easeBack = x => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const lerp = (a, b, p) => a + (b - a) * p;

// Absolutely positioned wrapper with a fade/slide/pop entrance driven by p (0..1).
function at(x, y, html, { p = 1, dy = 30, dx = 0, pop = false, w = null, align = 'left', z = 0, rot = 0, extra = '' } = {}) {
  const tx = align === 'center' ? 'translateX(-50%) ' : align === 'right' ? 'translateX(-100%) ' : '';
  const s = pop ? ` scale(${Math.max(0, easeBack(clamp(p)))})` : '';
  const off = pop ? '' : ` translate(${(1 - p) * dx}px,${(1 - p) * dy}px)`;
  return `<div style="position:absolute;left:${x}px;top:${y}px;${w ? `width:${w}px;` : ''}opacity:${clamp(p * 1.4)};transform:${tx}${off}${s} rotate(${rot}deg);transform-origin:center;z-index:${z};${extra}">${html}</div>`;
}

function title(text, { x = 960, y = 56, size = 116, color = C.cream, p = 1, align = 'center' } = {}) {
  return at(x, y, `<div class="hl" style="font-size:${size}px;color:${color}">${text}</div>`, { p, align, dy: -20 });
}

function textAt(x, y, text, { size = 40, color = C.cream, p = 1, align = 'left', font = 'body', w = null, weight = 600 } = {}) {
  return at(x, y, `<div class="${font}" style="font-size:${size}px;color:${color};font-weight:${weight};${w ? '' : 'white-space:nowrap;'}">${text}</div>`, { p, align, w });
}

const sh = cmd => `<span style="color:${C.green}">$</span> ${cmd}`;
const cur = t => `<span class="cur" style="opacity:${(t % 1) < 0.55 ? 1 : 0}"></span>`;

// A terminal window: three dots, a title and monospace lines (HTML allowed).
function term({ x, y, w, h = null, color = C.cream, name = '', lines = [], p = 1, fs = 28, pop = false, dim = 1, z = 0, maxLines = null, bg = C.panel, extra = '' }) {
  let ls = lines;
  if (maxLines && ls.length > maxLines) ls = ls.slice(ls.length - maxLines);
  const body = ls.map(l => typeof l === 'string'
    ? `<div>${l || '&nbsp;'}</div>`
    : `<div style="color:${l.c || C.cream};${l.bg ? `background:${l.bg};` : ''}">${l.t || '&nbsp;'}</div>`).join('');
  return at(x, y, `<div class="term" style="width:${w}px;${h ? `height:${h}px;` : ''}border-color:${color};background:${bg};opacity:${dim};${extra}">
    <div class="tbar" style="border-color:${color}55"><i style="background:${color}"></i><i style="background:${color}"></i><i style="background:${color}"></i><span>${name}</span></div>
    <div class="tbody" style="font-size:${fs}px">${body}</div></div>`, { p, pop, z });
}

// Minimal Lua highlighter for code boxes.
function lua(src) {
  return src.split('\n').map(line => {
    const re = /(--.*$)|("[^"]*")|\b(local|function|end|return|if|then|else|not|nil|true|false|for|in|do|or|and)\b|(rex(?:\.[a-z_]+)+)|(\b\d+(?:\.\d+)?\b)/g;
    let out = '', last = 0, m;
    while ((m = re.exec(line))) {
      out += esc(line.slice(last, m.index));
      if (m[1]) out += `<span style="color:${C.muted}">${esc(m[1])}</span>`;
      else if (m[2]) out += `<span style="color:${C.green}">${esc(m[2])}</span>`;
      else if (m[3]) out += `<span style="color:${C.red}">${m[3]}</span>`;
      else if (m[4]) out += `<span style="color:${C.yellow}">${m[4]}</span>`;
      else if (m[5]) out += `<span style="color:${C.blue}">${m[5]}</span>`;
      last = re.lastIndex;
    }
    return out + esc(line.slice(last));
  });
}

function code({ x, y, w, src, p = 1, fs = 28, name = 'init.lua', color = C.cream, reveal = 1, hl = [], h = null, z = 0 }) {
  const ls = lua(src);
  const n = Math.ceil(ls.length * clamp(reveal));
  const lines = ls.slice(0, n).map((t, i) => ({ t, bg: hl.includes(i) ? 'rgba(255,209,102,.12)' : null }));
  return term({ x, y, w, h, color, name, lines, p, fs, z });
}

function key(label, { lit = false, color = C.cream } = {}) {
  return `<span class="key" style="${lit ? `background:${color};color:${C.bg};border-color:${color};` : `border-color:${color};color:${color};`}">${label}</span>`;
}
function keys(list, opts) { return list.map(k => key(k, opts)).join('<span class="plus">+</span>'); }

function pill(text, color = C.cream, { fill = false, size = 30 } = {}) {
  return `<span class="pill" style="font-size:${size}px;border-color:${color};${fill ? `background:${color};color:${C.bg};` : `color:${color};`}">${text}</span>`;
}

function spinner(t, size = 28, color = C.blue) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" style="vertical-align:middle;transform:rotate(${(t * 360) % 360}deg)"><circle cx="20" cy="20" r="15" fill="none" stroke="${color}33" stroke-width="6"/><path d="M20 5 A15 15 0 0 1 35 20" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round"/></svg>`;
}

function icon(kind, color, size = 30) {
  const paths = {
    check: `<path d="M10 21 L17 28 L31 12" fill="none" stroke="${color}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>`,
    cross: `<path d="M12 12 L28 28 M28 12 L12 28" stroke="${color}" stroke-width="6" stroke-linecap="round"/>`,
    bang: `<path d="M20 8 L20 23" stroke="${color}" stroke-width="6" stroke-linecap="round"/><circle cx="20" cy="31" r="3.5" fill="${color}"/>`,
    dot: `<circle cx="20" cy="20" r="9" fill="${color}"/>`,
    ring: `<circle cx="20" cy="20" r="9" fill="none" stroke="${color}" stroke-width="5"/>`,
  };
  return `<svg width="${size}" height="${size}" viewBox="0 0 40 40" style="vertical-align:middle">${paths[kind]}</svg>`;
}

// Big circular verdict badge, as in the reference thumbnail.
function badge(x, y, ok, { p = 1, size = 150, z = 5 } = {}) {
  const col = ok ? C.green : C.red;
  const glyph = ok
    ? `<path d="M30 52 L45 67 L72 36" fill="none" stroke="${C.bg}" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/>`
    : `<path d="M34 34 L66 66 M66 34 L34 66" stroke="${C.bg}" stroke-width="11" stroke-linecap="round"/>`;
  return at(x, y, `<svg width="${size}" height="${size}" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="${col}" stroke="${C.bg}" stroke-width="6"/>${glyph}</svg>`, { p, pop: true, z });
}

// Full-stage SVG layer for arrows and lines.
function svg(inner, z = 1) { return `<svg width="1920" height="1080" style="position:absolute;left:0;top:0;z-index:${z};overflow:visible">${inner}</svg>`; }
function arrow(x1, y1, x2, y2, { color = C.cream, p = 1, w = 6, dash = false } = {}) {
  if (p <= 0) return '';
  const xe = lerp(x1, x2, p), ye = lerp(y1, y2, p);
  const a = Math.atan2(y2 - y1, x2 - x1), L = 20;
  const head = p > 0.85 ? `<path d="M${xe} ${ye} L${xe - L * Math.cos(a - 0.5)} ${ye - L * Math.sin(a - 0.5)} M${xe} ${ye} L${xe - L * Math.cos(a + 0.5)} ${ye - L * Math.sin(a + 0.5)}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none"/>` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${xe}" y2="${ye}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" ${dash ? 'stroke-dasharray="4 14"' : ''}/>${head}`;
}

// Rounded rectangle "area" with a tag label, used for diagrams.
function box(x, y, w, h, { color = C.cream, p = 1, label = '', fill = 'transparent', dash = false, r = 22, z = 0, labelColor = null, lw = 5, pop = false, inner = '' } = {}) {
  const tag = label ? `<div class="tag" style="background:${color};color:${labelColor || C.bg}">${label}</div>` : '';
  return at(x, y, `<div style="position:relative;width:${w}px;height:${h}px;border:${lw}px ${dash ? 'dashed' : 'solid'} ${color};border-radius:${r}px;background:${fill};box-sizing:border-box">${tag}${inner}</div>`, { p, z, pop });
}

// The mascot: a cream line-art blob with a green sparkle sprout.
function blob({ x, y, s = 1, mood = 'happy', t = 0, p = 1, z = 3, look = 0 }) {
  const bob = Math.sin(t * 3) * 5;
  const blink = (t % 3.4) < 0.12;
  const ex = look * 6;
  let eyes, mouth, extra = '';
  const st = `stroke="${C.cream}" stroke-width="6" stroke-linecap="round" fill="none"`;
  if (mood === 'sad') {
    eyes = `<path d="M${68 + ex} 108 q10 -8 20 0 M${112 + ex} 108 q10 -8 20 0" ${st}/>`;
    mouth = `<path d="M86 140 q14 -12 28 0" ${st}/>`;
    extra = `<path d="M150 70 q8 14 0 20 q-8 -6 0 -20z" fill="none" stroke="${C.cream}" stroke-width="4"/><path d="M70 92 l18 6 M130 92 l-18 6" ${st}/>`;
  } else if (mood === 'wow') {
    eyes = blink ? `<path d="M70 110 h16 M114 110 h16" ${st}/>` : `<circle cx="${78 + ex}" cy="108" r="8" fill="${C.cream}"/><circle cx="${122 + ex}" cy="108" r="8" fill="${C.cream}"/>`;
    mouth = `<ellipse cx="100" cy="138" rx="9" ry="11" ${st}/>`;
  } else if (mood === 'wink') {
    eyes = `<circle cx="${78 + ex}" cy="108" r="7" fill="${C.cream}"/><path d="M112 110 q10 -10 20 0" ${st}/>`;
    mouth = `<path d="M84 128 q16 16 32 0" ${st}/>`;
  } else {
    eyes = blink ? `<path d="M70 110 h16 M114 110 h16" ${st}/>` : `<circle cx="${78 + ex}" cy="108" r="7" fill="${C.cream}"/><circle cx="${122 + ex}" cy="108" r="7" fill="${C.cream}"/>`;
    mouth = `<path d="M84 128 q16 16 32 0" ${st}/>`;
  }
  const star = `<path d="M100 4 Q103 17 116 20 Q103 23 100 36 Q97 23 84 20 Q97 17 100 4Z" fill="${C.green}"/>`;
  const body = `<path d="M32 152 C30 86 60 48 100 48 C140 48 170 86 168 152 C168 168 158 176 142 176 L58 176 C42 176 32 168 32 152Z" fill="${C.bg}" stroke="${C.cream}" stroke-width="6"/>`;
  const arms = `<path d="M34 140 q-18 -4 -22 -22 M166 140 q18 -4 22 -22" ${st}/>`;
  return at(x, y, `<svg width="${200 * s}" height="${200 * s}" viewBox="0 0 200 200" style="overflow:visible;transform:translateY(${bob}px)"><line x1="100" y1="48" x2="100" y2="32" stroke="${C.green}" stroke-width="5"/>${star}${arms}${body}${eyes}${mouth}${extra}</svg>`, { p, pop: true, z });
}

// A tiny app window used to illustrate layouts. panes: [{x,y,w,h,label,color,content}] in 0..1 units.
function miniWin({ x, y, w, h, panes = [], p = 1, tabs = null, color = C.cream, z = 0, gap = 12, modeBadge = '' }) {
  const top = tabs ? 64 : 0;
  const ih = h - top - 24, iw = w - 24;
  const tabHtml = tabs ? `<div style="position:absolute;left:12px;top:12px;display:flex;gap:10px">${tabs.map(tb => `<div class="mtab" style="${tb.active ? `background:${C.panel2};border-color:${tb.color || C.cream};color:${C.cream}` : ''}">${tb.label}</div>`).join('')}</div>` : '';
  const paneHtml = panes.map(pn => {
    const px = 12 + pn.x * iw + gap / 2, py = top + 12 + pn.y * ih + gap / 2;
    const pw = pn.w * iw - gap, ph = pn.h * ih - gap;
    return `<div style="position:absolute;left:${px}px;top:${py}px;width:${pw}px;height:${ph}px;border:4px solid ${pn.color || C.line};border-radius:12px;box-sizing:border-box;background:${C.panel};opacity:${pn.o ?? 1};overflow:hidden">
      ${pn.label ? `<div class="mono" style="position:absolute;left:14px;top:8px;font-size:22px;color:${pn.color || C.muted}">${pn.label}</div>` : ''}
      <div style="position:absolute;left:14px;top:42px;right:10px" class="mono">${pn.content || ''}</div></div>`;
  }).join('');
  const mb = modeBadge ? `<div style="position:absolute;right:16px;top:-22px">${pill(modeBadge, C.yellow, { fill: true, size: 24 })}</div>` : '';
  return at(x, y, `<div style="position:relative;width:${w}px;height:${h}px;border:5px solid ${color};border-radius:20px;background:${C.bg};box-sizing:border-box">${tabHtml}${paneHtml}${mb}</div>`, { p, z });
}

// Placeholder "text" bars inside panes.
function bars(n, color = C.line, widths = [80, 60, 90, 45, 70, 55]) {
  return Array.from({ length: n }, (_, i) => `<div style="height:12px;margin:10px 0;border-radius:6px;background:${color};width:${widths[i % widths.length]}%"></div>`).join('');
}

if (typeof module !== 'undefined') module.exports = {};
